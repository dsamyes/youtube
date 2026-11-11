#!/usr/bin/env python3
"""Stage 11 - vertical 1080x1920 Shorts.

NATIVE Shorts (preferred): a script.json short whose "beats" are full beat objects (own narration,
visual, claims; fact-checked like the long-form) is voiced here with the same TTS provider, timed
word by word, and rendered natively in Remotion (composition IfEngineShort, 1080x1920) with the
video's own scenes laid out vertically, word-by-word captions in the Shorts safe area, a
first-frame hook line and an end pill. Output: shorts/<id>_<shortN>.mp4.

LEGACY cut (fallback): a short whose "beats" is [first_id, last_id] is cut from the long-form
render: blurred background, the 16:9 frame in the middle, title and burned-in captions.
Self-checks: 1080x1920, <= 60 s, audio present (native: voice QA too).
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import textwrap

from lib import ROOT, fail, gl_flag, log, read_json, require, set_stage, video_dir, write_json

STAGE = "shorts"
MAX_LEN = 59.0


def ass_time(t: float) -> str:
    cs = int(round(t * 100))
    h, cs = divmod(cs, 360000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def build_ass(title: str, cues: list[dict], t0: float, dur: float, path) -> None:
    head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Title,Inter Display,84,&H00FFFFFF,&H00FFFFFF,&H003A1511,&H00000000,1,0,0,0,100,100,0,0,1,0,6,8,70,70,230,1
Style: Brand,Inter,38,&H00FFE03D,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,6,0,1,0,0,8,70,70,140,1
Style: Cap,Inter,64,&H00FFFFFF,&H00FFFFFF,&H00200907,&H64000000,1,0,0,0,100,100,0,0,1,6,0,2,80,80,430,1
Style: Foot,Inter,36,&H0047B5FF,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,2,70,70,170,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = [f"Dialogue: 0,{ass_time(0)},{ass_time(dur)},Brand,,0,0,0,,THE IF ENGINE",
          f"Dialogue: 0,{ass_time(0)},{ass_time(dur)},Title,,0,0,0,," + "\\N".join(textwrap.wrap(title.upper(), 20)),
          f"Dialogue: 0,{ass_time(0)},{ass_time(dur)},Foot,,0,0,0,,Full video on the channel · Run the impossible. Do the math."]
    for c in cues:
        a, b = max(0.0, c["start"] - t0), min(dur, c["end"] - t0)
        if b <= 0 or a >= dur:
            continue
        txt = "\\N".join(textwrap.wrap(c["text"].replace("\n", " "), 24))
        ev.append(f"Dialogue: 1,{ass_time(a)},{ass_time(b)},Cap,,0,0,0,,{txt}")
    path.write_text(head + "\n".join(ev) + "\n", encoding="utf-8")


# ---------------------------------------------------------------- native Shorts
SHORT_GAP = 0.25   # pause between beats (build_script.py estimates with the same)
LEAD, TAIL = 0.3, 1.3


def is_native(sh: dict) -> bool:
    return bool(sh.get("beats")) and isinstance(sh["beats"][0], dict)


def word_times(text: str, audio, sr: int, t0: float, phon) -> list[dict]:
    """Time each written word inside one beat's audio. Kokoro leaves clear silences at punctuation,
    so phrases (split after , . ? ! ; :) are matched to the detected speech segments; inside a phrase
    words get durations proportional to the phoneme length of their spoken form."""
    import numpy as np
    from textnorm import spoken
    toks = text.split()
    if not toks:
        return []

    def weight(tok):
        sp = spoken(tok) or tok
        try:
            return max(2, len(phon(sp)) if phon else len(sp))
        except Exception:  # noqa: BLE001
            return max(2, len(sp))

    dur = len(audio) / sr
    hop = max(1, int(0.01 * sr))
    env = np.sqrt(np.convolve(audio.astype(float) ** 2, np.ones(hop) / hop, mode="same"))[::hop] if len(audio) > hop else np.ones(1)
    thr = max(1e-4, 0.06 * float(np.percentile(env, 95)))
    voiced = env > thr
    segs, i = [], 0
    while i < len(voiced):
        if voiced[i]:
            j = i
            while j < len(voiced) and voiced[j]:
                j += 1
            segs.append([i / 100, j / 100])
            i = j
        else:
            i += 1
    merged = []
    for a, b in segs:  # bridge gaps shorter than 90 ms (stops inside words)
        if merged and a - merged[-1][1] < 0.09:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    phrases, cur = [], []
    for tok in toks:
        cur.append(tok)
        if tok.endswith((".", ",", "?", "!", ";", ":")):
            phrases.append(cur)
            cur = []
    if cur:
        phrases.append(cur)
    while len(merged) > len(phrases):  # close the smallest gap
        k = min(range(len(merged) - 1), key=lambda q: merged[q + 1][0] - merged[q][1])
        merged[k][1] = merged[k + 1][1]
        del merged[k + 1]
    if len(merged) != len(phrases) or not merged:
        merged = [[0.0, dur]]
        phrases = [toks]
    out = []
    for (a, b), ph in zip(merged, phrases):
        w = [weight(tok) for tok in ph]
        edges = a + np.concatenate([[0.0], np.cumsum(w) / sum(w)]) * (b - a)
        for q, tok in enumerate(ph):
            out.append({"w": tok, "start": round(float(t0 + edges[q]), 3), "end": round(float(t0 + edges[q + 1]), 3)})
    return out


def render_native(vdir, vid, sh, prov, base_props, stills: bool = False) -> dict:
    import numpy as np
    import soundfile as sf
    from lib import REMOTION
    from tts import SR, ElevenLabsQuotaError, loud, pick, synth_beats
    out_dir = vdir / "shorts"
    adir = out_dir / sh["id"]
    adir.mkdir(parents=True, exist_ok=True)
    phon = (lambda x: prov.k.tokenizer.phonemize(x, "en-us")) if prov is not None and hasattr(prov, "k") else None
    t = LEAD
    pieces = [np.zeros(int(LEAD * SR), dtype=np.float32)]
    beats_t, words, qa = [], [], []
    voiced = None
    if prov:
        cache_f = adir / "cache.json"
        cache = read_json(cache_f) if cache_f.exists() else {}
        items = [{"id": b["id"], "text": b["text"], "spoken": b["spoken"]} for b in sh["beats"]]
        try:
            voiced, qa = synth_beats(prov, items, adir, cache)
        except ElevenLabsQuotaError as e:
            loud(f"ElevenLabs credits ran out on {sh['id']} ({e}): this Short uses KOKORO")
            prov = pick("kokoro", os.environ.get("KOKORO_VOICE", "am_michael"), float(os.environ.get("KOKORO_SPEED", "1.12")))
            phon = lambda x: prov.k.tokenizer.phonemize(x, "en-us")  # noqa: E731
            voiced, qa = synth_beats(prov, items, adir, cache)
        write_json(cache_f, cache)
    for k, b in enumerate(sh["beats"]):
        text = b["spoken"]
        if voiced:
            x, dur = voiced[k]["x"], voiced[k]["dur"]
        else:
            dur = len(text.split()) / 160 * 60
            x = np.zeros(int(dur * SR), dtype=np.float32)
        beats_t.append({"id": b["id"], "section": sh["id"], "start": round(t, 3), "end": round(t + dur, 3)})
        if voiced and voiced[k]["words"]:
            words += [{"w": w["w"], "start": round(t + w["start"], 3), "end": round(t + w["end"], 3)} for w in voiced[k]["words"]]
        else:
            words += word_times(b["text"], x, SR, t, phon)
        pieces += [x, np.zeros(int(SHORT_GAP * SR), dtype=np.float32)]
        t += dur + SHORT_GAP
    pieces.append(np.zeros(int(TAIL * SR), dtype=np.float32))
    total = round(t + TAIL, 3)
    raw = adir / "narration_raw.wav"
    sf.write(raw, np.concatenate(pieces), SR)
    pub = REMOTION / "public" / vid
    pub.mkdir(parents=True, exist_ok=True)
    narr = pub / f"{sh['id']}.wav"
    mixinfo = None
    if prov:
        voice_wav = adir / "narration.wav"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af",
                        "highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "-ac", "1", str(voice_wav)], check=True)
        if os.environ.get("IF_ENGINE_NO_SOUND") == "1":
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(voice_wav), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
                            "-ar", "48000", str(narr)], check=True)
        else:
            from sound import mix_short
            mixinfo = mix_short(vdir, sh, beats_t, voice_wav, total, narr)
    raw.unlink()
    props = dict(base_props, shortId=sh["id"], hook=sh.get("hook", ""), end=sh.get("end", ""), hasAudio=bool(prov),
                 audioFile=f"{vid}/{sh['id']}.wav",
                 sections=[{"id": sh["id"], "chapter": sh["title"], "clock": None,
                            "beats": [{k: b.get(k) for k in ("id", "text", "kinetic", "card", "retention", "visual")} for b in sh["beats"]]}],
                 timing={"total": total, "beats": beats_t, "sections": [{"id": sh["id"], "chapter": sh["title"], "start": 0, "end": total, "clock": None}]},
                 words=words)
    build = vdir / "build"
    build.mkdir(exist_ok=True)
    pp = build / f"{sh['id']}_props.json"
    write_json(pp, props)
    out = out_dir / f"{vid}_{sh['id']}.mp4"
    cmd = ["npx", "remotion", "render", "IfEngineShort", str(out), f"--props={pp}", "--codec=h264", "--audio-codec=aac",
           "--audio-bitrate=192k", "--crf=18", f"--concurrency={os.environ.get('REMOTION_CONCURRENCY', '4')}", "--log=error", gl_flag()]
    if stills:
        # QA frames: the first frame plus every beat midpoint, half size
        out = vdir / "renders" / "stills" / "shorts" / sh["id"]
        out.mkdir(parents=True, exist_ok=True)
        frames = sorted({1} | {int((b["start"] + b["end"]) / 2 * 30) for b in beats_t})
        cmd = ["npx", "remotion", "render", "IfEngineShort", str(out), f"--props={pp}", f"--frames={','.join(map(str, frames))}",
               "--image-format=png", "--sequence", "--scale=0.5", "--log=error", gl_flag()]
    log(STAGE, " ".join(cmd[:4]) + " ...")
    r = subprocess.run(cmd, cwd=REMOTION, capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError((r.stdout + r.stderr)[-800:])
    return {"file": out, "total": total, "qa": qa, "words": len(words), "loudness": mixinfo,
            "voice": prov.voice_label if prov else None, "credits": sum(v["cost"] for v in voiced) if voiced else 0}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video_id", nargs="?", default="earth-stops-1s")
    ap.add_argument("--source", help="long-form file (default: 1080p render, else 540p)")
    ap.add_argument("--only", help="native shorts: render just this id (e.g. short2)")
    ap.add_argument("--provider", choices=["elevenlabs", "kokoro", "piper", "silent"])
    ap.add_argument("--stills", action="store_true", help="native shorts: QA frames only (silent timing), no mp4")
    ap.add_argument("--voice-only", action="store_true",
                    help="native shorts: synthesise + cache the Shorts' narration only (CI runs this in the Voice step, "
                         "the only step that sees the TTS key; the render step then reuses the cache)")
    a = ap.parse_args()
    vdir = video_dir(a.video_id)
    if a.voice_only:
        return voice_only(a, vdir, read_json(vdir / "script.json"))
    require(vdir, "captions")
    script = read_json(vdir / "script.json")
    if any(is_native(sh) for sh in script.get("shorts", [])):
        return main_native(a, vdir, script)
    timing = read_json(vdir / "timing.json")
    cues = read_json(vdir / "captions.json")["cues"]
    src = vdir / a.source if a.source else next(
        (p for p in [vdir / "renders" / f"{a.video_id}_1080p.mp4", vdir / "renders" / f"{a.video_id}_540p.mp4"] if p.exists()), None)
    if not src or not src.exists():
        fail(vdir, STAGE, "no long-form render found; run render.py first")
    tb = {b["id"]: b for b in timing["beats"]}
    out_dir = vdir / "shorts"
    out_dir.mkdir(exist_ok=True)
    results, problems = [], []
    for sh in script.get("shorts", []):
        b0, b1 = sh["beats"]
        t0 = max(0.0, tb[b0]["start"] - 0.25)
        t1 = tb[b1]["end"] + 0.6
        dur = t1 - t0
        if dur > MAX_LEN:
            problems.append(f"{sh['id']} is {dur:.1f}s > {MAX_LEN}s; choose a shorter beat range")
            continue
        ass = out_dir / f"{sh['id']}.ass"
        build_ass(sh["title"], cues, t0, dur, ass)
        out = out_dir / f"{a.video_id}_{sh['id']}.mp4"
        fc = ("[0:v]split[a][b];"
              "[a]scale=-2:1920,crop=1080:1920,boxblur=30:3,eq=brightness=-0.28[bg];"
              "[b]scale=1080:-2[fg];"
              "[bg][fg]overlay=0:(H-h)/2-60,"
              f"ass=filename={ass}:fontsdir={ROOT / 'remotion' / 'public' / 'fonts'}[v]")
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t0:.3f}", "-t", f"{dur:.3f}", "-i", str(src),
               "-filter_complex", fc, "-map", "[v]", "-map", "0:a?", "-c:v", "libx264", "-preset", "medium",
               "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "160k",
               "-movflags", "+faststart", str(out)]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode:
            problems.append(f"{sh['id']}: ffmpeg failed: {r.stderr[-300:]}")
            continue
        info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height",
                                          "-of", "json", str(out)], capture_output=True, text=True).stdout)
        v = [s for s in info["streams"] if s["codec_type"] == "video"][0]
        has_a = any(s["codec_type"] == "audio" for s in info["streams"])
        d = float(info["format"]["duration"])
        if (v["width"], v["height"]) != (1080, 1920) or d > 60.5:
            problems.append(f"{sh['id']}: got {v['width']}x{v['height']} {d:.1f}s")
        results.append({"id": sh["id"], "title": sh["title"], "file": str(out.relative_to(vdir)),
                        "duration_s": round(d, 1), "audio": has_a, "source_range": [round(t0, 2), round(t1, 2)]})
        log(STAGE, f"{out.name}: {d:.1f}s {v['width']}x{v['height']} audio={has_a}")
    write_json(out_dir / "shorts.json", {"source": str(src.relative_to(vdir)), "shorts": results})
    if problems:
        fail(vdir, STAGE, "; ".join(problems), shorts=results)
    set_stage(vdir, STAGE, "done", shorts=results, source=str(src.relative_to(vdir)))
    log(STAGE, f"OK: {len(results)} shorts")


def probe_short(out):
    info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height",
                                      "-of", "json", str(out)], capture_output=True, text=True).stdout)
    v = [s for s in info["streams"] if s["codec_type"] == "video"][0]
    return v["width"], v["height"], float(info["format"]["duration"]), any(s["codec_type"] == "audio" for s in info["streams"])


class CachedVoice:
    """Stands in for a TTS provider whose clips are all cached (no API key needed). Used by the render
    step in CI: the Shorts were voiced in the Voice step by `shorts.py --voice-only`."""
    def __init__(self, name: str, label: str):
        self.name, self.voice_label = name, label

    def synth(self, *a, **k):
        raise RuntimeError("cached voice: clip missing from the cache")


def short_provider(a, vdir):
    """same voice as the long-form (provider, voice and speed recorded by tts.py)"""
    from tts import pick
    voice = read_json(vdir / "manifest.json")["stages"].get("voice", {})
    label = voice.get("voice") or ""
    speed = float(label.rsplit("@", 1)[1]) if "@" in label else float(os.environ.get("KOKORO_SPEED", "1.12"))
    vname = label.split(":")[1].split("@")[0] if label.startswith("kokoro") else os.environ.get("KOKORO_VOICE", "am_michael")
    name = a.provider or voice.get("provider")
    if name == "elevenlabs" and not os.environ.get("ELEVENLABS_API_KEY"):
        return CachedVoice("elevenlabs", label)
    return pick(name, vname, speed)


def all_cached(vdir, script, prov) -> bool:
    import hashlib
    for sh in script["shorts"]:
        adir = vdir / "shorts" / sh["id"]
        cache = read_json(adir / "cache.json") if (adir / "cache.json").exists() else {}
        for b in sh["beats"]:
            h = hashlib.sha1(f"v3|{prov.voice_label}|{b['spoken']}".encode()).hexdigest()[:16]
            if cache.get(b["id"]) != h or not (adir / f"{b['id']}.wav").exists():
                return False
    return True


def voice_only(a, vdir, script):
    from tts import synth_beats
    prov = short_provider(a, vdir)
    if prov is None or isinstance(prov, CachedVoice):
        log(STAGE, "voice-only: nothing to do (silent provider or no key)")
        return
    credits = 0
    for sh in script.get("shorts", []):
        if not is_native(sh):
            continue
        adir = vdir / "shorts" / sh["id"]
        adir.mkdir(parents=True, exist_ok=True)
        cache_f = adir / "cache.json"
        cache = read_json(cache_f) if cache_f.exists() else {}
        voiced, qa = synth_beats(prov, [{"id": b["id"], "text": b["text"], "spoken": b["spoken"]} for b in sh["beats"]], adir, cache)
        write_json(cache_f, cache)
        credits += sum(v["cost"] for v in voiced)
        log(STAGE, f"voice-only {sh['id']}: {len(voiced)} clips" + (f", QA {qa}" if qa else ""))
    log(STAGE, f"voice-only done ({prov.voice_label}, {credits} credits)")


def main_native(a, vdir, script):
    from render import build_props
    from tts import loud, pick
    prov = None if a.stills else short_provider(a, vdir)
    if isinstance(prov, CachedVoice) and not all_cached(vdir, script, prov):
        loud("Shorts narration is not cached and there is no ELEVENLABS_API_KEY here: Shorts use KOKORO")
        prov = pick("kokoro", os.environ.get("KOKORO_VOICE", "am_michael"), float(os.environ.get("KOKORO_SPEED", "1.12")))
    base = build_props(vdir, a.video_id)
    if a.stills:
        for sh in script["shorts"]:
            if not a.only or sh["id"] == a.only:
                render_native(vdir, a.video_id, sh, None, base, stills=True)
        log(STAGE, f"stills -> {vdir / 'renders' / 'stills' / 'shorts'}")
        return
    out_dir = vdir / "shorts"
    out_dir.mkdir(exist_ok=True)
    prev = {s["id"]: s for s in (read_json(out_dir / "shorts.json")["shorts"] if (out_dir / "shorts.json").exists() else [])}
    results, problems = [], []
    for sh in script["shorts"]:
        if a.only and sh["id"] != a.only:
            if sh["id"] in prev:
                results.append(prev[sh["id"]])
            continue
        try:
            r = render_native(vdir, a.video_id, sh, prov, base)
        except Exception as e:  # noqa: BLE001
            problems.append(f"{sh['id']}: render failed: {e}")
            continue
        w, h, d, has_a = probe_short(r["file"])
        if (w, h) != (1080, 1920) or d > 60.5 or (prov and not has_a):
            problems.append(f"{sh['id']}: got {w}x{h} {d:.1f}s audio={has_a}")
        if r["qa"]:
            problems.append(f"{sh['id']}: voice QA {r['qa']}")
        results.append({"id": sh["id"], "title": sh["title"], "file": str(r["file"].relative_to(vdir)), "duration_s": round(d, 1),
                        "audio": has_a, "native": True, "words": r["words"], "voice": r["voice"], "loudness": r["loudness"],
                        "credits": r["credits"]})
        log(STAGE, f"{r['file'].name}: native {d:.1f}s {w}x{h} audio={has_a}")
    write_json(out_dir / "shorts.json", {"source": "native (IfEngineShort)", "shorts": results})
    if problems:
        fail(vdir, STAGE, "; ".join(problems), shorts=results)
    set_stage(vdir, STAGE, "done", shorts=results, source="native")
    log(STAGE, f"OK: {len(results)} native shorts")


if __name__ == "__main__":
    main()
