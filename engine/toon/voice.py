#!/usr/bin/env python3
"""Cartoon-short voice: Kokoro narration, one clip per script line, plus exact word timings.

  python toon/voice.py <video_id> [--speed 1.3] [--voice am_michael]

Reads  videos/<id>/script.json  {"lines": [...], "voice": {"voice", "speed", "gap_s"}}
Writes videos/<id>/voice/voice.wav (48 kHz mono), words.json ([{w, s, e, line}], seconds), lines.json.

Word times come from forced alignment (PocketSphinx, model bundled in the pip wheel: no downloads),
run per line, so an error can never drift past a sentence boundary. Everything in the picture is timed
to words.json (skill rule: every visual reaction lands 0-3 frames before its word).
"""
from __future__ import annotations
import argparse, json, re, sys
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

ROOT = Path(__file__).resolve().parent.parent
SR_TTS, SR_OUT, SR_ASR = 24000, 48000, 16000
EXTRA_DICT = {"unluckily": "AH N L AH K AH L IY"}

def trim(x: np.ndarray, sr: int, thr_db: float = -45.0, pad: float = 0.012) -> np.ndarray:
    w = int(0.01 * sr); n = len(x) // w
    rms = np.sqrt(np.mean(x[: n * w].reshape(n, w) ** 2, axis=1) + 1e-12)
    on = np.where(20 * np.log10(rms / (np.max(np.abs(x)) + 1e-9) + 1e-9) > thr_db)[0]
    if len(on) == 0: return x
    a = max(0, on[0] * w - int(pad * sr)); b = min(len(x), (on[-1] + 1) * w + int(pad * sr))
    return x[a:b]

def tokens(line: str) -> list[str]:
    return [t for t in re.split(r"\s+", line.replace("-", " ")) if re.search(r"[A-Za-z0-9]", t)]

def norm(tok: str) -> str:
    return re.sub(r"[^a-z']", "", tok.lower()).strip("'")

def align(x24: np.ndarray, toks: list[str]) -> list[tuple[float, float]]:
    from pocketsphinx import Decoder
    dec = Decoder(samprate=SR_ASR, loglevel="FATAL")
    for w, ph in EXTRA_DICT.items():
        if dec.lookup_word(w) is None: dec.add_word(w, ph, True)
    words = [norm(t) for t in tokens(" ".join(toks))]
    missing = [w for w in words if dec.lookup_word(w) is None]
    if missing: sys.exit(f"[voice] words missing from the aligner dictionary (add to EXTRA_DICT): {missing}")
    pcm = (np.clip(resample_poly(x24, 2, 3), -1, 1) * 32767).astype(np.int16).tobytes()
    for beams in ({}, {"beam": 1e-120, "wbeam": 1e-100, "pbeam": 1e-120}, {"beam": 1e-300, "wbeam": 1e-250, "pbeam": 1e-300}):
        d = Decoder(samprate=SR_ASR, loglevel="FATAL", **beams)
        for w, ph in EXTRA_DICT.items():
            if d.lookup_word(w) is None: d.add_word(w, ph, True)
        d.set_align_text(" ".join(words))
        d.start_utt(); d.process_raw(pcm, full_utt=True); d.end_utt()
        seg = d.seg()
        if seg is None: continue
        segs = [(s.word, s.start_frame / 100.0, (s.end_frame + 1) / 100.0) for s in seg if not s.word.startswith("<") and s.word != "(NULL)"]
        got = [re.sub(r"\(\d+\)$", "", w) for w, _, _ in segs]
        if got == words: return [(a, b) for _, a, b in segs]
    sys.exit(f"[voice] could not align: {' '.join(words)}")

def main() -> None:
    ap = argparse.ArgumentParser(); ap.add_argument("video_id"); ap.add_argument("--speed", type=float); ap.add_argument("--voice")
    a = ap.parse_args()
    vdir = ROOT / "videos" / a.video_id
    sc = json.loads((vdir / "script.json").read_text())
    cfg = sc.get("voice", {})
    voice, speed, gap = a.voice or cfg.get("voice", "am_michael"), a.speed or cfg.get("speed", 1.3), cfg.get("gap_s", 0.11)
    from kokoro_onnx import Kokoro
    k = Kokoro(str(ROOT / "models/kokoro/kokoro-v1.0.onnx"), str(ROOT / "models/kokoro/voices-v1.0.bin"))
    out, words, lines, t = [], [], [], 0.0
    for i, line in enumerate(sc["lines"], 1):
        x, sr = k.create(line, voice=voice, speed=speed, lang="en-us"); assert sr == SR_TTS
        x = trim(np.asarray(x, dtype=np.float32), sr)
        toks = tokens(line); al = align(x, toks)
        for tok, (s, e) in zip(toks, al): words.append({"w": tok, "s": round(t + s, 3), "e": round(t + e, 3), "line": i})
        dur = len(x) / sr
        lines.append({"line": i, "text": line, "s": round(t, 3), "e": round(t + dur, 3), "words": len(toks), "wps": round(len(toks) / dur, 2)})
        out += [x, np.zeros(int(gap * sr), dtype=np.float32)]; t += dur + gap
    y = np.concatenate(out[:-1]); y = y / (np.max(np.abs(y)) + 1e-9) * 0.89
    y48 = resample_poly(y, 2, 1).astype(np.float32)
    (vdir / "voice").mkdir(exist_ok=True)
    sf.write(vdir / "voice/voice.wav", y48, SR_OUT, subtype="PCM_16")
    (vdir / "voice/words.json").write_text(json.dumps(words, indent=0) + "\n")
    (vdir / "voice/lines.json").write_text(json.dumps({"voice": f"kokoro-v1.0:{voice}@{speed}", "duration_s": round(len(y) / SR_TTS, 3), "words": len(words),
                                                        "wps": round(len(words) / (len(y) / SR_TTS), 2), "lines": lines}, indent=1) + "\n")
    print(f"[voice] {len(words)} words, {len(y) / SR_TTS:.2f} s, {len(words) / (len(y) / SR_TTS):.2f} words/s, voice {voice}@{speed}")
    for l in lines: print(f"  {l['line']:2d} {l['s']:6.2f}-{l['e']:6.2f}  {l['wps']:.2f} w/s  {l['text'][:60]}")

if __name__ == "__main__":
    main()
