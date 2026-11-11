#!/usr/bin/env python3
"""Stage 5 - voice (pluggable TTS) + narration timing.

Provider order (first available wins; force one with --provider NAME):
  1. elevenlabs  - if ELEVENLABS_API_KEY is set (official REST API; voice via ELEVENLABS_VOICE_ID)
  2. kokoro      - local neural TTS (Apache-2.0 weights) via pip `kokoro-onnx`; model files in
                   models/kokoro/ (downloaded from the project's GitHub release by setup.sh)
  3. piper       - local TTS via pip `piper-tts`; set PIPER_VOICE=/path/voice.onnx (or put one in
                   models/piper/)
  4. silent      - no audio; timing estimated from word counts (DEGRADED: render has no voice)

Outputs: audio/beats/<beat>.wav, audio/narration.wav (loudness-normalised), timing.json.
Every beat is QA'd: speaking rate within 110-240 wpm (catches truncated/garbled synthesis),
no clipping, not silent.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf

from lib import ROOT, fail, log, read_json, set_stage, video_dir, write_json, now

STAGE = "voice"
SR = 24000
BEAT_GAP = 0.4
SECTION_GAP = 0.9
LEAD_IN = 0.6
TAIL = 4.0
SILENT_WPM = 160


# ---------------------------------------------------------------- providers
# Default narrator (chosen 2026-11 by an A/B of 6 documentary voices on one paragraph, see README):
# "Max - Elearning and Documentary" from the ElevenLabs voice library, model eleven_multilingual_v2.
EL_DEFAULT_VOICE = "Gfpl8Yo74Is0W6cPUWWT"
EL_DEFAULT_MODEL = "eleven_multilingual_v2"
EL_API = "https://api.elevenlabs.io"


class ElevenLabsError(RuntimeError):
    pass


class ElevenLabsAuthError(ElevenLabsError):
    pass


class ElevenLabsQuotaError(ElevenLabsError):
    pass


class ElevenLabs:
    """ElevenLabs REST API (with-timestamps endpoint: exact character timing for captions; request
    stitching via previous_request_ids / next_text for consistent prosody across beats).
    Configure with ELEVENLABS_VOICE_ID, ELEVENLABS_MODEL, ELEVENLABS_SPEED, ELEVENLABS_STABILITY,
    ELEVENLABS_STYLE. The key (ELEVENLABS_API_KEY) is only ever sent in the request header."""
    name = "elevenlabs"

    def __init__(self):
        self.key = os.environ["ELEVENLABS_API_KEY"]  # never written to disk or logs
        self.voice = os.environ.get("ELEVENLABS_VOICE_ID") or EL_DEFAULT_VOICE
        self.model = os.environ.get("ELEVENLABS_MODEL") or EL_DEFAULT_MODEL
        self.speed = float(os.environ.get("ELEVENLABS_SPEED") or 1.05)
        self.stability = float(os.environ.get("ELEVENLABS_STABILITY") or 0.5)
        self.style = float(os.environ.get("ELEVENLABS_STYLE") or 0.0)
        self.voice_label = f"elevenlabs:{self.voice}:{self.model}@{self.speed}"
        self.credits = 0          # credits charged in this process (character-cost header)
        self.last_alignment = None

    def _call(self, method: str, path: str, body: dict | None = None, timeout: int = 180):
        import time
        import urllib.error
        data = json.dumps(body).encode() if body is not None else None
        for attempt in range(5):
            req = urllib.request.Request(EL_API + path, data=data, method=method, headers={
                "xi-api-key": self.key, "Content-Type": "application/json", "Accept": "application/json"})
            try:
                with urllib.request.urlopen(req, timeout=timeout) as r:
                    return {k.lower(): v for k, v in r.headers.items()}, json.loads(r.read())
            except urllib.error.HTTPError as e:
                txt = e.read()[:600].decode("utf-8", "replace")
                if e.code == 401 and ("quota" in txt or "credits" in txt):
                    raise ElevenLabsQuotaError(f"HTTP {e.code}: {txt}") from None
                if e.code in (401, 403):
                    raise ElevenLabsAuthError(f"HTTP {e.code}: {txt}") from None
                if e.code == 402 or "quota_exceeded" in txt:
                    raise ElevenLabsQuotaError(f"HTTP {e.code}: {txt}") from None
                if e.code in (429, 500, 502, 503, 504) and attempt < 4:
                    time.sleep(3 * (attempt + 1) ** 2)
                    continue
                raise ElevenLabsError(f"HTTP {e.code}: {txt}") from None
            except (urllib.error.URLError, TimeoutError) as e:
                if attempt < 4:
                    time.sleep(3 * (attempt + 1) ** 2)
                    continue
                raise ElevenLabsError(f"network: {e}") from None
        raise ElevenLabsError("retries exhausted")

    def subscription(self) -> dict | None:
        """tier + credits; None when the key may not read the subscription (permissions)"""
        try:
            _, d = self._call("GET", "/v1/user/subscription", timeout=30)
        except ElevenLabsAuthError:
            return None
        return {k: d.get(k) for k in ("tier", "character_count", "character_limit", "next_character_count_reset_unix")}

    def synth(self, text: str, out: Path, previous_ids: list[str] | None = None, previous_text: str | None = None,
              next_text: str | None = None) -> dict:
        import base64
        body = {"text": text, "model_id": self.model,
                "voice_settings": {"stability": self.stability, "similarity_boost": 0.75, "style": self.style,
                                   "use_speaker_boost": True, "speed": self.speed}}
        if previous_ids:
            body["previous_request_ids"] = previous_ids[-3:]
        elif previous_text:
            body["previous_text"] = previous_text[-600:]
        if next_text:
            body["next_text"] = next_text[:600]
        hdr, d = self._call("POST", f"/v1/text-to-speech/{self.voice}/with-timestamps?output_format=pcm_24000", body)
        pcm = np.frombuffer(base64.b64decode(d["audio_base64"]), dtype="<i2").astype(np.float32) / 32768.0
        sf.write(out, pcm, SR)
        cost = int(hdr.get("character-cost") or 0)
        self.credits += cost
        a = d.get("alignment") or {}
        self.last_alignment = {"chars": a.get("characters", []), "start": a.get("character_start_times_seconds", []),
                               "end": a.get("character_end_times_seconds", [])}
        return {"request_id": hdr.get("request-id"), "cost": cost, "alignment": self.last_alignment}


def spoken_words(al: dict) -> list[dict]:
    """character alignment -> spoken words with start/end (seconds, relative to the clip)"""
    words, cur, t0, t1 = [], "", None, None
    for c, a, b in zip(al["chars"], al["start"], al["end"]):
        if c.isspace():
            if cur:
                words.append({"w": cur, "start": t0, "end": t1})
            cur, t0 = "", None
            continue
        if t0 is None:
            t0 = a
        cur += c
        t1 = b
    if cur:
        words.append({"w": cur, "start": t0, "end": t1})
    return words


def written_word_times(text: str, al: dict, offset: float) -> list[dict]:
    """map the WRITTEN words of a beat (as shown in captions) onto the spoken alignment.
    Each written token covers as many spoken words as textnorm.spoken() makes of it; when the counts
    disagree the spoken words are spread proportionally. Times are shifted by -offset (trim)."""
    from textnorm import spoken
    sw = spoken_words(al)
    toks = text.split()
    if not sw or not toks:
        return []
    counts = [max(0, len(spoken(t).split())) for t in toks]
    if sum(counts) != len(sw):
        # proportional fallback by character length
        tot = sum(len(t) for t in toks)
        a, b = sw[0]["start"], sw[-1]["end"]
        out, acc = [], 0
        for t in toks:
            s0 = a + (b - a) * acc / tot
            acc += len(t)
            out.append({"w": t, "start": round(s0 - offset, 3), "end": round(a + (b - a) * acc / tot - offset, 3)})
        return out
    out, k = [], 0
    last_end = sw[0]["start"]
    for t, c in zip(toks, counts):
        if c == 0:
            out.append({"w": t, "start": round(last_end - offset, 3), "end": round(last_end - offset, 3)})
            continue
        seg = sw[k:k + c]
        k += c
        last_end = seg[-1]["end"]
        out.append({"w": t, "start": round(max(0.0, seg[0]["start"] - offset), 3), "end": round(max(0.0, seg[-1]["end"] - offset), 3)})
    return out


class Kokoro:
    name = "kokoro"

    def __init__(self, voice: str, speed: float):
        from kokoro_onnx import Kokoro as K  # noqa: N814
        mdir = ROOT / "models" / "kokoro"
        self.k = K(str(mdir / "kokoro-v1.0.onnx"), str(mdir / "voices-v1.0.bin"))
        self.voice, self.speed = voice, speed
        self.voice_label = f"kokoro-v1.0:{voice}@{speed}"

    @staticmethod
    def available() -> bool:
        try:
            import kokoro_onnx  # noqa: F401
        except ImportError:
            return False
        m = ROOT / "models" / "kokoro"
        return (m / "kokoro-v1.0.onnx").exists() and (m / "voices-v1.0.bin").exists()

    def synth(self, text: str, out: Path) -> None:
        samples, sr = self.k.create(text, voice=self.voice, speed=self.speed, lang="en-us")
        assert sr == SR
        sf.write(out, samples, SR, subtype="FLOAT")  # float WAV: no clipping at write time


class Piper:
    name = "piper"

    def __init__(self):
        self.model = self.find()
        from piper import PiperVoice
        self.v = PiperVoice.load(str(self.model))
        self.voice_label = f"piper:{self.model.name}"

    @staticmethod
    def find() -> Path | None:
        if os.environ.get("PIPER_VOICE"):
            return Path(os.environ["PIPER_VOICE"])
        c = sorted((ROOT / "models" / "piper").glob("*.onnx"))
        return c[0] if c else None

    @classmethod
    def available(cls) -> bool:
        try:
            import piper  # noqa: F401
        except ImportError:
            return False
        m = cls.find()
        return bool(m and m.exists())

    def synth(self, text: str, out: Path) -> None:
        import wave
        tmp = out.with_suffix(".raw.wav")
        with wave.open(str(tmp), "wb") as w:
            self.v.synthesize_wav(text, w)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-ar", str(SR), "-ac", "1", str(out)],
                       check=True)
        tmp.unlink()


def loud(msg: str) -> None:
    """a warning that must not be missed (GitHub Actions annotation + log)"""
    print(f"::warning::[voice] {msg}", flush=True)
    print(f"[voice] !!!!!!!! {msg} !!!!!!!!", flush=True)


def pick(name: str | None, voice: str, speed: float):
    """Default provider: ElevenLabs when ELEVENLABS_API_KEY is set, else Kokoro (loudly), then Piper.
    TTS_PROVIDER / --provider forces one; a forced 'elevenlabs' without a key falls back to Kokoro."""
    name = name or os.environ.get("TTS_PROVIDER")
    if name == "elevenlabs" and not os.environ.get("ELEVENLABS_API_KEY"):
        loud("TTS_PROVIDER=elevenlabs but ELEVENLABS_API_KEY is missing: FALLING BACK TO KOKORO")
        name = "kokoro"
    order = [name] if name else ["elevenlabs", "kokoro", "piper", "silent"]
    for p in order:
        if p == "elevenlabs" and os.environ.get("ELEVENLABS_API_KEY"):
            return ElevenLabs()
        if p == "kokoro" and Kokoro.available():
            if not name:
                loud("no ELEVENLABS_API_KEY: using the free Kokoro voice")
            return Kokoro(voice, speed)
        if p == "piper" and Piper.available():
            return Piper()
        if p == "silent":
            return None
        if name:
            sys.exit(f"[voice] provider {name} not available")
    return None


# ---------------------------------------------------------------- audio utils
def trim_bounds(x: np.ndarray, thr_db: float = -45.0, pad: float = 0.06) -> tuple[int, int]:
    if len(x) == 0:
        return 0, 0
    thr = 10 ** (thr_db / 20)
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return 0, 0
    return max(0, idx[0] - int(pad * SR)), min(len(x), idx[-1] + int(pad * SR))


def trim(x: np.ndarray, thr_db: float = -45.0, pad: float = 0.06) -> np.ndarray:
    a, b = trim_bounds(x, thr_db, pad)
    return x[a:b]


def synth_beats(prov, items: list[dict], adir: Path, cache: dict, tag: str = "v3") -> tuple[list[dict], list[str]]:
    """Voice a list of {id, text (written), spoken} in order. Returns per-item {x (trimmed float32 audio),
    words (written word times relative to the trimmed clip, or []), cost} and QA issues.
    ElevenLabs beats are stitched: previous_request_ids of the beats generated in this run (else
    previous_text) and next_text, so prosody flows across beat boundaries."""
    out, qa = [], []
    chain: list[str] = []
    for i, it in enumerate(items):
        text = it["spoken"]
        h = hashlib.sha1(f"{tag}|{prov.voice_label}|{text}".encode()).hexdigest()[:16]
        wav = adir / f"{it['id']}.wav"
        meta_p = adir / f"{it['id']}.json"
        cost = 0
        if cache.get(it["id"]) != h or not wav.exists() or (prov.name == "elevenlabs" and not meta_p.exists()):
            if prov.name == "elevenlabs":
                r = prov.synth(text, wav, previous_ids=chain or None,
                               previous_text=items[i - 1]["spoken"] if i else None,
                               next_text=items[i + 1]["spoken"] if i + 1 < len(items) else None)
                cost = r["cost"]
                if r["request_id"]:
                    chain.append(r["request_id"])
                write_json(meta_p, {"request_id": r["request_id"], "cost": cost, "generated": now(), "alignment": r["alignment"]})
            else:
                prov.synth(text, wav)
                chain = []
            cache[it["id"]] = h
        else:
            chain = []  # cached clip: request ids may be stale, stitch by text instead
        x, sr = sf.read(wav, dtype="float32")
        if x.ndim > 1:
            x = x.mean(axis=1)
        a, b = trim_bounds(x)
        x = x[a:b]
        words = []
        if meta_p.exists() and prov.name == "elevenlabs":
            al = read_json(meta_p).get("alignment")
            if al and al.get("chars"):
                words = written_word_times(it["text"], al, a / SR)
        pk = float(np.max(np.abs(x))) if len(x) else 0.0
        if pk > 0.95:  # per-beat peak safety (loudnorm sets final level anyway)
            x = x * (0.95 / pk)
        dur = len(x) / SR
        nw = len(it["text"].split())
        wpm = len(text.split()) / dur * 60 if dur else 0
        peak = float(np.max(np.abs(x))) if len(x) else 0.0
        if not (90 <= wpm <= 240):
            qa.append(f"{it['id']}: {wpm:.0f} wpm (possible truncation/garble)")
        if peak < 0.02:
            qa.append(f"{it['id']}: near-silent audio")
        out.append({"x": x, "words": words, "cost": cost, "wpm": wpm, "dur": dur, "nw": nw})
    return out, qa


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("video_id", nargs="?", default="earth-stops-1s")
    ap.add_argument("--provider", choices=["elevenlabs", "kokoro", "piper", "silent"])
    ap.add_argument("--voice", default=os.environ.get("KOKORO_VOICE", "am_michael"))
    ap.add_argument("--speed", type=float, default=float(os.environ.get("KOKORO_SPEED", "1.12")))
    args = ap.parse_args()
    vdir = video_dir(args.video_id)
    script = read_json(vdir / "script.json")
    fc = read_json(vdir / "manifest.json")["stages"]["factcheck"]
    if fc.get("status") != "done":
        fail(vdir, STAGE, "factcheck stage has not passed - refusing to voice an unchecked script")

    prov = pick(args.provider, args.voice, args.speed)
    pname = prov.name if prov else "silent"
    log(STAGE, f"provider: {pname}" + (f" ({prov.voice_label})" if prov else " (NO AUDIO - timing from word counts)"))
    adir = vdir / "audio" / "beats"
    adir.mkdir(parents=True, exist_ok=True)
    cache_f = vdir / "audio" / "cache.json"
    cache = read_json(cache_f) if cache_f.exists() else {}
    items = [{"id": b["id"], "text": b["text"], "spoken": b["spoken"], "section": sec["id"]}
             for sec in script["sections"] for b in sec["beats"]]
    sub_before = None
    if prov and prov.name == "elevenlabs":
        sub_before = prov.subscription()
        need = sum(len(it["spoken"]) for it in items)
        if sub_before:
            left = (sub_before["character_limit"] or 0) - (sub_before["character_count"] or 0)
            log(STAGE, f"ElevenLabs tier {sub_before['tier']}: {left} credits left, this narration has {need} characters")
            if left < need * 0.4:
                loud(f"ElevenLabs credits too low ({left} left, ~{need} characters needed): FALLING BACK TO KOKORO")
                prov = pick("kokoro", args.voice, args.speed)
    try:
        voiced, qa_issues = synth_beats(prov, items, adir, cache) if prov else ([], [])
    except ElevenLabsQuotaError as e:
        write_json(cache_f, cache)
        loud(f"ElevenLabs credits ran out mid-narration ({e}): RE-VOICING EVERYTHING WITH KOKORO")
        prov = pick("kokoro", args.voice, args.speed)
        voiced, qa_issues = synth_beats(prov, items, adir, cache)
    except ElevenLabsAuthError as e:
        write_json(cache_f, cache)
        if os.environ.get("TTS_FALLBACK_ON_ERROR") == "1":
            loud(f"ElevenLabs auth failed ({e}): TTS_FALLBACK_ON_ERROR=1, using Kokoro")
            prov = pick("kokoro", args.voice, args.speed)
            voiced, qa_issues = synth_beats(prov, items, adir, cache)
        else:
            fail(vdir, STAGE, f"ElevenLabs authentication failed ({e}); fix ELEVENLABS_API_KEY or force --provider kokoro")
    pname = prov.name if prov else "silent"
    write_json(cache_f, cache)

    timing = {"provider": pname, "voice": prov.voice_label if prov else None, "sample_rate": SR,
              "generated": now(), "beats": [], "sections": []}
    pieces = [np.zeros(int(LEAD_IN * SR), dtype=np.float32)]
    t = LEAD_IN
    k = 0
    for si, sec in enumerate(script["sections"]):
        sec_start = t
        for bi, b in enumerate(sec["beats"]):
            words = len(b["spoken"].split())
            wt = []
            if prov:
                v = voiced[k]
                pieces.append(v["x"])
                dur, wpm = v["dur"], v["wpm"]
                wt = [{"w": w["w"], "start": round(t + w["start"], 3), "end": round(t + w["end"], 3)} for w in v["words"]]
            else:
                dur = words / SILENT_WPM * 60
                wpm = SILENT_WPM
                pieces.append(np.zeros(int(dur * SR), dtype=np.float32))
            k += 1
            entry = {"id": b["id"], "section": sec["id"], "start": round(t, 3), "end": round(t + dur, 3), "words": words, "wpm": round(wpm)}
            if wt:
                entry["word_times"] = wt
            timing["beats"].append(entry)
            t += dur
            gap = BEAT_GAP + (SECTION_GAP if bi == len(sec["beats"]) - 1 else 0)
            pieces.append(np.zeros(int(gap * SR), dtype=np.float32))
            t += gap
        timing["sections"].append({"id": sec["id"], "chapter": sec["chapter"], "start": round(sec_start, 3),
                                   "end": round(t, 3), "clock": sec.get("clock")})
    pieces.append(np.zeros(int(TAIL * SR), dtype=np.float32))
    t += TAIL
    timing["total"] = round(t, 3)
    credits = sum(v["cost"] for v in voiced) if prov else 0
    if prov and prov.name == "elevenlabs":
        timing["credits_used"] = credits

    raw = np.concatenate(pieces)
    raw_path = vdir / "audio" / "narration_raw.wav"
    sf.write(raw_path, raw, SR)
    out = vdir / "audio" / "narration.wav"
    if prov:
        # EBU R128 loudness normalisation to -16 LUFS / -1.5 dBTP (YouTube normalises to ~-14)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw_path), "-af",
                        "highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "-ac", "1", str(out)],
                       check=True)
        dur_out = sf.info(out).duration
        if abs(dur_out - t) > 0.2:
            qa_issues.append(f"normalised audio length {dur_out:.2f}s != timeline {t:.2f}s")
    else:
        shutil.copy(raw_path, out)
    raw_path.unlink()

    # retention spacing check on real timing
    starts = {b["id"]: b["start"] for b in timing["beats"]}
    rt = [starts[b["id"]] for s in script["sections"] for b in s["beats"] if b.get("retention")]
    gaps = [round(b - a, 1) for a, b in zip([0.0] + rt, rt + [t])]
    timing["retention_gaps"] = gaps
    hook_end = timing["beats"][len(script["sections"][0]["beats"]) - 1]["end"]
    timing["hook_end"] = hook_end
    timing["qa_issues"] = qa_issues
    write_json(vdir / "timing.json", timing)

    warn = []
    if hook_end > 15.5:
        warn.append(f"hook ends at {hook_end:.1f}s (>15s)")
    if any(g > 95 for g in gaps):
        warn.append(f"retention gap > 95s: {gaps}")
    if not (480 <= t <= 720):
        warn.append(f"duration {t / 60:.2f} min outside 8-12 min")
    status = "done" if prov and not qa_issues else ("degraded" if not prov else "failed")
    if status == "failed":
        fail(vdir, STAGE, "audio QA: " + "; ".join(qa_issues))
    extra = {}
    if pname == "elevenlabs":
        extra = {"credits_used": credits, "subscription_before": sub_before}
    set_stage(vdir, STAGE, status, provider=pname, voice=timing["voice"], duration_s=round(t, 1),
              outputs=["audio/narration.wav", "timing.json"], warnings=warn, **extra,
              note=None if prov else "No TTS available: silent track, timing estimated at 160 wpm")
    for w in warn:
        log(STAGE, "WARN " + w)
    wpms = [b["wpm"] for b in timing["beats"]]
    log(STAGE, f"{status.upper()}: {t:.1f}s ({t / 60:.2f} min), hook ends {hook_end:.1f}s, "
               f"wpm min/median/max {min(wpms)}/{int(np.median(wpms))}/{max(wpms)}, retention gaps {gaps}")


if __name__ == "__main__":
    main()
