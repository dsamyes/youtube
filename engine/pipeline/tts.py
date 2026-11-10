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
class ElevenLabs:
    name = "elevenlabs"

    def __init__(self):
        self.key = os.environ["ELEVENLABS_API_KEY"]  # never written to disk
        # "Adam"-style stock voice id can be overridden; pick a voice you have rights to use.
        self.voice = os.environ.get("ELEVENLABS_VOICE_ID", "pNInz6obpgDQGcFmaJgB")
        self.model = os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2")
        self.voice_label = f"elevenlabs:{self.voice}:{self.model}"

    def synth(self, text: str, out: Path) -> None:
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.voice}?output_format=pcm_24000"
        body = json.dumps({"text": text, "model_id": self.model,
                           "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}).encode()
        req = urllib.request.Request(url, data=body, method="POST", headers={
            "xi-api-key": self.key, "Content-Type": "application/json", "Accept": "audio/pcm"})
        with urllib.request.urlopen(req, timeout=120) as r:
            pcm = np.frombuffer(r.read(), dtype="<i2").astype(np.float32) / 32768.0
        sf.write(out, pcm, SR)


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


def pick(name: str | None, voice: str, speed: float):
    name = name or os.environ.get("TTS_PROVIDER")
    # Default: free Kokoro (channel's chosen voice). ElevenLabs only when TTS_PROVIDER=elevenlabs.
    order = [name] if name else ["kokoro", "piper", "elevenlabs", "silent"]
    for p in order:
        if p == "elevenlabs" and os.environ.get("ELEVENLABS_API_KEY"):
            return ElevenLabs()
        if p == "kokoro" and Kokoro.available():
            return Kokoro(voice, speed)
        if p == "piper" and Piper.available():
            return Piper()
        if p == "silent":
            return None
        if name:
            sys.exit(f"[voice] provider {name} not available")
    return None


# ---------------------------------------------------------------- audio utils
def trim(x: np.ndarray, thr_db: float = -45.0, pad: float = 0.06) -> np.ndarray:
    if len(x) == 0:
        return x
    thr = 10 ** (thr_db / 20)
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x[:0]
    a = max(0, idx[0] - int(pad * SR))
    b = min(len(x), idx[-1] + int(pad * SR))
    return x[a:b]


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

    timing = {"provider": pname, "voice": prov.voice_label if prov else None, "sample_rate": SR,
              "generated": now(), "beats": [], "sections": []}
    pieces = [np.zeros(int(LEAD_IN * SR), dtype=np.float32)]
    t = LEAD_IN
    qa_issues = []
    for si, sec in enumerate(script["sections"]):
        sec_start = t
        for bi, b in enumerate(sec["beats"]):
            text = b["spoken"]
            words = len(text.split())
            if prov:
                h = hashlib.sha1(f"v2|{prov.voice_label}|{text}".encode()).hexdigest()[:16]
                wav = adir / f"{b['id']}.wav"
                if cache.get(b["id"]) != h or not wav.exists():
                    prov.synth(text, wav)
                    cache[b["id"]] = h
                x, sr = sf.read(wav, dtype="float32")
                if x.ndim > 1:
                    x = x.mean(axis=1)
                x = trim(x)
                pk = float(np.max(np.abs(x))) if len(x) else 0.0
                if pk > 0.95:  # per-beat peak safety (loudnorm sets final level anyway)
                    x = x * (0.95 / pk)
                dur = len(x) / SR
                wpm = words / dur * 60 if dur else 0
                peak = float(np.max(np.abs(x))) if len(x) else 0.0
                if not (110 <= wpm <= 240):
                    qa_issues.append(f"{b['id']}: {wpm:.0f} wpm (possible truncation/garble)")
                if peak < 0.02:
                    qa_issues.append(f"{b['id']}: near-silent audio")
                if peak > 0.999:
                    qa_issues.append(f"{b['id']}: clipping")
                pieces.append(x)
            else:
                dur = words / SILENT_WPM * 60
                wpm, peak = SILENT_WPM, 0.0
                pieces.append(np.zeros(int(dur * SR), dtype=np.float32))
            timing["beats"].append({"id": b["id"], "section": sec["id"], "start": round(t, 3),
                                    "end": round(t + dur, 3), "words": words, "wpm": round(wpm)})
            t += dur
            gap = BEAT_GAP + (SECTION_GAP if bi == len(sec["beats"]) - 1 else 0)
            pieces.append(np.zeros(int(gap * SR), dtype=np.float32))
            t += gap
        timing["sections"].append({"id": sec["id"], "chapter": sec["chapter"], "start": round(sec_start, 3),
                                   "end": round(t, 3), "clock": sec.get("clock")})
    pieces.append(np.zeros(int(TAIL * SR), dtype=np.float32))
    t += TAIL
    timing["total"] = round(t, 3)
    write_json(cache_f, cache)

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
    set_stage(vdir, STAGE, status, provider=pname, voice=timing["voice"], duration_s=round(t, 1),
              outputs=["audio/narration.wav", "timing.json"], warnings=warn,
              note=None if prov else "No TTS available: silent track, timing estimated at 160 wpm")
    for w in warn:
        log(STAGE, "WARN " + w)
    wpms = [b["wpm"] for b in timing["beats"]]
    log(STAGE, f"{status.upper()}: {t:.1f}s ({t / 60:.2f} min), hook ends {hook_end:.1f}s, "
               f"wpm min/median/max {min(wpms)}/{int(np.median(wpms))}/{max(wpms)}, retention gaps {gaps}")


if __name__ == "__main__":
    main()
