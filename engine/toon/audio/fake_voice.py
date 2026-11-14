#!/usr/bin/env python
# A stand-in narrator for test builds, so the soundtrack library can be tried without the real voice model:
#     engine/.venv/bin/python engine/toon/audio/fake_voice.py <video_id> [--force]
# reads  engine/videos/<id>/voice/words.json ([{w, s, e, line}], seconds)
# writes engine/videos/<id>/voice/voice.wav: one formant-synthesized "word" per entry (speech-like spectrum and
#        rhythm, no real words), 48 kHz mono 16-bit, about -19 LUFS like the real narrator.
# It refuses to replace an existing voice.wav unless --force is given. Never use it for a real video.
# The self-test of the library: fake_voice.py _template, then build.py _template (see README.md).
import json
import os
import sys
import wave
import zlib
import numpy as np

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dsp import SR, ns, rng, hp, lp, dbg, integrated     # noqa: E402
import sfx_gen as G                                      # noqa: E402
from project import VIDEOS                               # noqa: E402


def word(w, dur, r, base):
    """one pseudo-word: a consonant puff, then one vowel per syllable through a male voice's formants"""
    n = max(ns(dur), ns(0.05))
    t = np.arange(n) / SR
    syl = max(1, min(4, round(len(w) / 3.5)))
    vs = [list(G.VOW)[int(r.integers(len(G.VOW)))] for _ in range(syl + 1)]
    forms = G.vowel_track(n, [(k * dur / syl, v) for k, v in enumerate(vs)])
    f0 = base * (1.06 - 0.1 * t / max(dur, 1e-3)) * (1 + 0.03 * np.sin(2 * np.pi * syl * t / max(dur, 1e-3)))
    amp = np.clip(t / 0.02, 0, 1) * np.clip((dur - t) / 0.03, 0, 1) * (0.75 + 0.25 * np.abs(np.sin(np.pi * syl * t / max(dur, 1e-3))))
    y = G.vox(f0, forms, amp, r, 1.0, tilt=1.1, breath=0.15)
    return y + hp(r.standard_normal(n), 2500) * np.exp(-t / 0.012) * 0.25 * (w[:1].lower() in "sfthkpczx")


def main(argv):
    args = [a for a in argv if not a.startswith("--")]
    if len(args) != 1:
        print("usage: fake_voice.py <video_id> [--force]")
        return 2
    vdir = os.path.join(args[0] if os.path.isdir(args[0]) else os.path.join(VIDEOS, args[0]), "voice")
    out = os.path.join(vdir, "voice.wav")
    if os.path.exists(out) and "--force" not in argv:
        print(f"fake_voice: {out} exists; not replacing a narration (use --force for test data)")
        return 2
    words = json.load(open(os.path.join(vdir, "words.json"), encoding="utf-8"))
    y = np.zeros(ns(words[-1]["e"]) + 1)
    for i, w in enumerate(words):
        r = rng(zlib.crc32(f"{i}:{w['w']}".encode()))
        k = sum(1 for v in words[:i] if v.get("line") == w.get("line"))          # the pitch sinks through a line
        x = word(str(w["w"]), float(w["e"]) - float(w["s"]), r, 118.0 * 0.985 ** k)
        a = ns(float(w["s"]))
        y[a:a + len(x)] += x[: len(y) - a]
    y = lp(y, 10000, 6)                                  # a 24 kHz speech model has nothing above 12 kHz
    y = y * min(dbg(-19.3 - integrated(y)), 0.89 / (np.abs(y).max() + 1e-9))      # as loud as the real narrator, never over peak 0.89
    with wave.open(out, "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(np.round(y * 32767.0).astype("<i2").tobytes())
    print(f"fake_voice: wrote {out} ({len(y) / SR:.2f} s, {len(words)} pseudo-words; a stand-in, not a narration)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
