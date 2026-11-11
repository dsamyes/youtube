#!/usr/bin/env python3
"""Stage 6 - sound design: procedural score + SFX, mixed under the narration (all free, all code).

Nothing is downloaded: every sound is synthesised here with numpy/scipy, deterministically (seeded by
the video id), so a re-run gives the same mix.

  score   drones + detuned pads + shimmer that follow the story's TENSION (per section `tension`
          0..1 in the script, else a default arc), swells at section changes, risers into
          high-tension sections, a heartbeat-like sub pulse when tension is high.
  sfx     whoosh, rumble, wind, roar, impact, boom, thunder, crack, hum, alarm, beep, creak, breath,
          riser, heartbeat. Triggered by a beat's `visual.sfx` (["boom", {"name": "riser", "at": -2}])
          and automatically by the visuals: scene cuts (soft whoosh), `descent` (wind bed by speed,
          rumble by shake, thunder synced with the same deterministic lightning as Clouds.tsx),
          `heat` (plasma roar), `pov` window/visor (cockpit hum / breathing).
  mix     sidechain ducking of music and SFX under the voice, then two-pass EBU R128 loudness
          normalisation to -14 LUFS integrated, true peak <= -1 dBTP (ffmpeg loudnorm, linear).

Outputs: audio/mix.wav (48 kHz stereo) + audio/score.wav; manifest stage "sound".
Usage:  python -B sound.py <id>                     # long-form (needs timing.json, audio/narration.wav)
        python -B sound.py <id> --qa                # print loudness of an existing mix
Shorts call mix_short() from shorts.py.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal

from lib import fail, log, read_json, require, set_stage, video_dir

STAGE = "sound"
SR = 48000
TARGET_I, TARGET_TP, TARGET_LRA = -14.0, -1.0, 11.0

# ------------------------------------------------------------------ helpers
def _rng(seed: str) -> np.random.Generator:
    return np.random.default_rng(int(hashlib.sha1(seed.encode()).hexdigest()[:8], 16))


def t_axis(n: int) -> np.ndarray:
    return np.arange(n, dtype=np.float64) / SR


def env_adsr(n: int, a: float, r: float, curve: float = 2.0) -> np.ndarray:
    t = t_axis(n)
    dur = n / SR
    up = np.clip(t / max(a, 1e-3), 0, 1) ** curve
    down = np.clip((dur - t) / max(r, 1e-3), 0, 1) ** curve
    return (up * down).astype(np.float32)


def bp(x: np.ndarray, lo: float, hi: float, order: int = 2) -> np.ndarray:
    sos = signal.butter(order, [max(10, lo), min(SR / 2 - 100, hi)], "bandpass", fs=SR, output="sos")
    return signal.sosfilt(sos, x).astype(np.float32)


def lp(x: np.ndarray, f: float, order: int = 2) -> np.ndarray:
    sos = signal.butter(order, min(f, SR / 2 - 100), "lowpass", fs=SR, output="sos")
    return signal.sosfilt(sos, x).astype(np.float32)


def hp(x: np.ndarray, f: float, order: int = 2) -> np.ndarray:
    sos = signal.butter(order, f, "highpass", fs=SR, output="sos")
    return signal.sosfilt(sos, x).astype(np.float32)


def sweep_filter(x: np.ndarray, f0: float, f1: float, q: float = 1.2, blocks: int = 48) -> np.ndarray:
    """band-pass whose centre moves from f0 to f1 (block-wise, crossfaded) - for whooshes and risers"""
    n = len(x)
    out = np.zeros(n, np.float32)
    edges = np.linspace(0, n, blocks + 1).astype(int)
    for i in range(blocks):
        fc = f0 * (f1 / f0) ** (i / max(1, blocks - 1))
        a, b = edges[i], edges[i + 1]
        pad = min(a, 2048)
        seg = bp(x[a - pad:b], fc / (1 + 0.5 / q), fc * (1 + 0.5 / q))
        out[a:b] = seg[pad:]
    return out


def pan(x: np.ndarray, p) -> np.ndarray:
    """mono -> stereo; p in [-1, 1] (scalar or per-sample array)"""
    p = np.asarray(p, dtype=np.float32)
    ang = (p + 1) * math.pi / 4
    return np.stack([x * np.cos(ang), x * np.sin(ang)], 1).astype(np.float32)


def db(x: float) -> float:
    return 10 ** (x / 20)


def brown(n: int, rng) -> np.ndarray:
    w = rng.normal(size=n).astype(np.float32)
    b = signal.lfilter([1.0], [1.0, -0.995], w).astype(np.float32)
    return b / (np.abs(b).max() + 1e-9)


def reverb_ir(seconds: float, rng, damp: float = 3500) -> np.ndarray:
    n = int(seconds * SR)
    t = t_axis(n)
    irs = []
    for _ in range(2):
        ir = rng.normal(size=n).astype(np.float32) * np.exp(-t * 6.9 / seconds).astype(np.float32)
        irs.append(lp(ir, damp))
    ir = np.stack(irs, 1)
    return ir / np.sqrt((ir ** 2).sum(axis=0, keepdims=True))


def convolve_st(x: np.ndarray, ir: np.ndarray) -> np.ndarray:
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    out = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], 1)
    return out.astype(np.float32)


# ------------------------------------------------------------------ SFX (mono or stereo arrays)
def sfx_whoosh(rng, dur=1.4, f0=250, f1=2600) -> np.ndarray:
    n = int(dur * SR)
    x = rng.normal(size=n).astype(np.float32)
    up = sweep_filter(x, f0, f1, q=1.4)
    e = np.sin(np.pi * np.clip(t_axis(n) / dur, 0, 1)) ** 2.2
    return pan(up * e.astype(np.float32) * 1.6, np.linspace(-0.6, 0.6, n))


def sfx_riser(rng, dur=3.0) -> np.ndarray:
    n = int(dur * SR)
    t = t_axis(n)
    noise = sweep_filter(rng.normal(size=n).astype(np.float32), 200, 5000, q=2.5)
    f = 110 * (4 ** (t / dur))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * 0.12
    e = (t / dur) ** 2.4
    x = (noise * 0.9 + tone.astype(np.float32)) * e.astype(np.float32)
    return pan(x, 0.0)


def sfx_boom(rng, dur=4.0) -> np.ndarray:
    n = int(dur * SR)
    t = t_axis(n)
    f = 28 + 42 * np.exp(-t * 7)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.4)
    body = lp(rng.normal(size=n).astype(np.float32), 400) * np.exp(-t * 5).astype(np.float32) * 0.8
    x = (sub.astype(np.float32) * 1.1 + body)
    return pan(x, 0.0)


def sfx_impact(rng, dur=3.0) -> np.ndarray:
    n = int(dur * SR)
    t = t_axis(n)
    crack = hp(rng.normal(size=n).astype(np.float32), 900) * np.exp(-t * 30).astype(np.float32) * 0.9
    return sfx_boom(rng, dur) * 0.9 + pan(crack, 0.0)


def sfx_rumble(rng, dur=6.0) -> np.ndarray:
    n = int(dur * SR)
    t = t_axis(n)
    b = lp(brown(n, rng), 110, 4) * 6
    am = (0.65 + 0.35 * np.sin(2 * np.pi * 0.31 * t + rng.uniform(0, 6))).astype(np.float32)
    x = b * am * env_adsr(n, min(1.5, dur / 3), min(1.5, dur / 3), 1.0)
    return np.stack([x, np.roll(x, 900)], 1)


def sfx_wind(rng, dur=8.0, bright=1.0) -> np.ndarray:
    n = int(dur * SR)
    t = t_axis(n)
    w = rng.normal(size=n).astype(np.float32)
    lo = bp(w, 250, 900 + 1400 * bright)
    hi = bp(w, 1800, 4200) * 0.35 * bright
    gust = (0.6 + 0.4 * np.sin(2 * np.pi * 0.17 * t + 1.3) * np.sin(2 * np.pi * 0.053 * t)).astype(np.float32)
    x = (lo + hi) * gust * env_adsr(n, min(2.0, dur / 3), min(2.0, dur / 3), 1.0)
    return np.stack([x, bp(np.roll(w, 4000), 250, 900 + 1400 * bright) * gust * env_adsr(n, min(2.0, dur / 3), min(2.0, dur / 3), 1.0)], 1) * 1.4


def sfx_roar(rng, dur=6.0, crackle=1.0) -> np.ndarray:
    n = int(dur * SR)
    b = lp(rng.normal(size=n).astype(np.float32), 700, 3) * 2.2 + lp(brown(n, rng), 160) * 2.5
    imp = (rng.random(n) < 0.0009 * crackle).astype(np.float32) * rng.normal(size=n).astype(np.float32)
    cr = hp(signal.lfilter([1], [1, -0.6], imp).astype(np.float32), 1500) * 1.4
    x = (b + cr) * env_adsr(n, min(1.0, dur / 4), min(1.5, dur / 3), 1.0)
    return np.stack([x, np.roll(x, 1200)], 1)


def sfx_thunder(rng, dur=5.0, dist=0.5) -> np.ndarray:
    n = int(dur * SR)
    t = t_axis(n)
    crack = hp(rng.normal(size=n).astype(np.float32), 600 + 2000 * (1 - dist)) * np.exp(-t * (40 - 25 * dist)).astype(np.float32)
    roll = lp(brown(n, rng), 300 - 150 * dist, 3) * 5
    gusts = np.zeros(n, np.float32)
    for _ in range(int(4 + rng.integers(0, 4))):
        c = rng.uniform(0.05, dur * 0.7)
        gusts += np.exp(-((t - c) / rng.uniform(0.15, 0.6)) ** 2).astype(np.float32) * rng.uniform(0.4, 1)
    x = crack * (1 - dist) * 0.8 + roll * gusts * np.exp(-t * 0.6).astype(np.float32)
    return pan(x, float(rng.uniform(-0.5, 0.5)))


def sfx_hum(rng, dur=8.0) -> np.ndarray:
    n = int(dur * SR)
    t = t_axis(n)
    tone = sum(np.sin(2 * np.pi * f * t) * a for f, a in ((60, 0.5), (120, 0.3), (180, 0.12), (240, 0.06))).astype(np.float32)
    air = bp(rng.normal(size=n).astype(np.float32), 300, 2500) * 0.25
    x = (tone * 0.5 + air) * env_adsr(n, 1.0, 1.0, 1.0)
    return np.stack([x, np.roll(x, 300)], 1) * 0.6


def sfx_alarm(rng, dur=2.4) -> np.ndarray:
    n = int(dur * SR)
    t = t_axis(n)
    f = np.where((t * 2.5) % 1 < 0.5, 880.0, 660.0)
    x = np.tanh(3 * np.sin(2 * np.pi * np.cumsum(f) / SR)).astype(np.float32) * 0.35
    gate = ((t * 2.5) % 0.5 < 0.38).astype(np.float32)
    return pan(lp(x * gate, 3000) * env_adsr(n, 0.02, 0.2, 1.0), 0.2)


def sfx_beep(rng, dur=0.25) -> np.ndarray:
    n = int(dur * SR)
    t = t_axis(n)
    x = np.sin(2 * np.pi * 1760 * t).astype(np.float32) * np.exp(-t * 18).astype(np.float32) * 0.5
    return pan(x, 0.3)


def sfx_creak(rng, dur=3.0) -> np.ndarray:
    n = int(dur * SR)
    t = t_axis(n)
    f = 70 + 25 * np.sin(2 * np.pi * 0.4 * t) + 15 * t
    saw = (2 * ((np.cumsum(f) / SR) % 1) - 1).astype(np.float32)
    x = bp(saw, 150, 900) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7 * t))).astype(np.float32)
    x = x * env_adsr(n, 0.4, 0.8, 1.0)
    return pan(x * 1.2, -0.3)


def sfx_breath(rng, dur=8.0) -> np.ndarray:
    n = int(dur * SR)
    t = t_axis(n)
    x = bp(rng.normal(size=n).astype(np.float32), 400, 1600)
    cyc = np.clip(np.sin(2 * np.pi * 0.23 * t), 0, 1) ** 2 * 0.8 + np.clip(-np.sin(2 * np.pi * 0.23 * t), 0, 1) ** 3 * 0.5
    return pan(x * cyc.astype(np.float32) * 0.5, 0.0)


def sfx_heartbeat(rng, dur=4.0, bpm=62) -> np.ndarray:
    n = int(dur * SR)
    x = np.zeros(n, np.float32)
    k = int(0.18 * SR)
    tt = t_axis(k)
    thump = (np.sin(2 * np.pi * (48 + 30 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 22)).astype(np.float32)
    beat = 60 / bpm
    s = 0.0
    while s < dur - 0.4:
        for off, g in ((0.0, 1.0), (0.28, 0.65)):
            i = int((s + off) * SR)
            if i + k < n:
                x[i:i + k] += thump * g
        s += beat
    return pan(x * 1.3, 0.0)


SFX = {"whoosh": sfx_whoosh, "riser": sfx_riser, "boom": sfx_boom, "impact": sfx_impact, "rumble": sfx_rumble,
       "wind": sfx_wind, "roar": sfx_roar, "thunder": sfx_thunder, "hum": sfx_hum, "alarm": sfx_alarm, "beep": sfx_beep,
       "creak": sfx_creak, "breath": sfx_breath, "heartbeat": sfx_heartbeat}
SFX_GAIN = {"whoosh": -14, "riser": -12, "boom": -8, "impact": -7, "rumble": -12, "wind": -18, "roar": -14, "thunder": -10,
            "hum": -24, "alarm": -20, "beep": -22, "creak": -16, "breath": -24, "heartbeat": -12}


# ------------------------------------------------------------------ score
NOTE = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
# D minor colour: i - VI - III - VII - iv - i (roots, semitones above D)
PROG = [0, -4, 3, -2, 5, 0, -4, -2]


def hz(midi: float) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def osc_saw(f: float, n: int, rng, detune_c: float = 0) -> np.ndarray:
    ph = rng.uniform(0, 1)
    ff = f * 2 ** (detune_c / 1200)
    return (2 * ((ph + ff * t_axis(n)) % 1) - 1).astype(np.float32)


def section_music(dur: float, root_midi: int, tension: float, rng, minor: bool = True) -> np.ndarray:
    """one section of score (stereo), tension 0..1 controls brightness, density and pulse"""
    n = int(dur * SR)
    t = t_axis(n)
    out = np.zeros((n, 2), np.float32)
    # drone: root + fifth + octave (sines), slow beating for width
    for semis, a in ((-12, 0.3), (-5, 0.16), (0, 0.2)):
        f = hz(root_midi + semis)
        l = np.sin(2 * np.pi * f * t + rng.uniform(0, 6)).astype(np.float32)
        r = np.sin(2 * np.pi * (f + 0.18) * t + rng.uniform(0, 6)).astype(np.float32)
        out += np.stack([l, r], 1) * a
    out *= (0.7 + 0.3 * np.sin(2 * np.pi * t / 23 + 1)[:, None]).astype(np.float32)
    # pad: minor (or sus) chord, 3 detuned saws per voice, low-passed (cutoff opens with tension)
    chord = [0, 3 if minor else 5, 7, 14] if tension < 0.75 else [0, 3, 7, 10, 14]
    pad = np.zeros(n, np.float32)
    for c in chord:
        f = hz(root_midi + 12 + c)
        for d in (-7, 0, 6):
            pad += osc_saw(f, n, rng, d) * 0.12
    cutoff = 450 + 2600 * tension ** 1.4
    pad = lp(pad, cutoff, 4)
    lfo = (0.75 + 0.25 * np.sin(2 * np.pi * t / (9 + 4 * rng.random()) + rng.uniform(0, 6))).astype(np.float32)
    out += pan(pad * lfo * (0.6 + 0.45 * tension), 0.0) * 1.0
    # shimmer: high partials, sparse (wonder) - fades as tension rises
    sh = np.zeros(n, np.float32)
    for c in (24, 31, 36):
        f = hz(root_midi + c)
        amp = np.clip(np.sin(2 * np.pi * t / rng.uniform(7, 13) + rng.uniform(0, 6)), 0, 1) ** 3
        sh += (np.sin(2 * np.pi * f * t) * amp).astype(np.float32) * 0.05
    out += pan(sh * (1 - tension) * 1.2, float(rng.uniform(-0.4, 0.4)))
    # pulse: sub heartbeat when tension is high
    if tension >= 0.6:
        hb = sfx_heartbeat(rng, dur, bpm=58 + 40 * (tension - 0.6))
        out += hb * (0.22 + 0.6 * (tension - 0.6))
    # section envelope (swell in, breathe out)
    e = env_adsr(n, min(3.0, dur / 3), min(2.5, dur / 3), 1.0)
    return out * e[:, None]


def build_score(total: float, sections: list[dict], seed: str) -> np.ndarray:
    """sections: [{start, end, tension}] -> stereo score with reverb, normalised to ~-20 dBFS RMS"""
    rng = _rng(seed + "|score")
    n = int(total * SR) + SR
    out = np.zeros((n, 2), np.float32)
    base = 50  # D3 = 50 (MIDI)
    for i, s in enumerate(sections):
        a = max(0.0, s["start"] - 1.5)
        b = min(total + 1.0, s["end"] + 2.0)
        seg = section_music(b - a, base + PROG[i % len(PROG)], float(s["tension"]), rng)
        i0 = int(a * SR)
        out[i0:i0 + len(seg)] += seg[: n - i0]
    ir = reverb_ir(3.2, rng)
    wet = convolve_st(out, ir)
    mix = out * 0.65 + wet * 0.55
    mix = np.stack([hp(mix[:, 0], 32), hp(mix[:, 1], 32)], 1)
    rms = float(np.sqrt(np.mean(mix ** 2)) + 1e-9)
    return (mix * (db(-20) / rms)).astype(np.float32)


# ------------------------------------------------------------------ cues from the script
def lightning_times(t0: float, t1: float, rate: float, seed: int = 3) -> list[tuple[float, float]]:
    """mirror of lightningAt() in remotion/src/components/three/Clouds.tsx (same hash) - scene time"""
    out = []
    if rate <= 0:
        return out
    slot = 10 / rate
    i = math.floor(t0 / slot)
    while i * slot < t1:
        def r(k):
            x = math.sin((i + seed) * 127.1 + k * 311.7) * 43758.5453
            return x - math.floor(x)
        tt = i * slot + r(1) * slot * 0.7
        if t0 <= tt < t1:
            out.append((tt, 0.6 + r(2) * 0.6))
        i += 1
    return out


PALETTE_LIGHTNING = {"water": 2.2, "dark": 0.4}


def cues_from_beats(beats: list[dict], timing: dict[str, dict], total: float) -> list[dict]:
    """beats: [{id, visual}] in order; timing: id -> {start, end}. Returns [{name, at, dur?, gain?, ...}]"""
    cues = []
    prev_scene = None
    runs = []  # (scene, start, end, merged params of the run, run_start)
    for i, b in enumerate(beats):
        v = b.get("visual", {})
        st = timing[b["id"]]["start"] if i else 0.0
        nxt = timing[beats[i + 1]["id"]]["start"] if i + 1 < len(beats) else total
        if v.get("scene") != prev_scene:
            runs.append({"scene": v.get("scene"), "start": st, "end": nxt, "beats": [(b, st, nxt)]})
            if i > 0:
                cues.append({"name": "whoosh", "at": st - 0.6, "gain": -4})
        else:
            runs[-1]["end"] = nxt
            runs[-1]["beats"].append((b, st, nxt))
        prev_scene = v.get("scene")
        for s in v.get("sfx", []) or []:
            s = {"name": s} if isinstance(s, str) else dict(s)
            if s.get("name") in SFX:
                at = st + float(s.get("at", 0))
                if s["name"] == "riser":
                    at = st - 3.0 + float(s.get("at", 0))
                cues.append({"name": s["name"], "at": at, "gain": float(s.get("gain", 0)), "dur": s.get("dur")})
    for r in runs:
        merged: dict = {}
        beds: dict[str, list] = {}  # name -> [(t_abs, gain_db)] one continuous bed per run (no pumping)

        def bed(name, st, nxt, gain):
            beds.setdefault(name, []).extend([(st, gain), (nxt, gain)])

        for b, st, nxt in r["beats"]:
            merged.update(b.get("visual", {}))
            dur = nxt - st
            if dur <= 0.3:
                continue
            if r["scene"] == "descent":
                speed = float(merged.get("speed", 16))
                bed("wind", st, nxt, -6 + 8 * min(1, speed / 40) if speed > 1 else -16)
                shake = float(merged.get("shake", 0.25))
                bed("rumble", st, nxt, -6 + 6 * min(1, shake) if shake > 0.35 else -30)
                pal = merged.get("palette")
                rate = PALETTE_LIGHTNING.get(pal, 0) if isinstance(pal, str) else float((pal or {}).get("lightning", 0))
                for tt, k in lightning_times(st - r["start"], nxt - r["start"], rate):
                    cues.append({"name": "thunder", "at": r["start"] + tt + 0.25, "gain": -6 + 6 * (k - 0.6), "dist": 0.3 + 0.5 * (1.2 - k)})
            heat = float(merged.get("heat", 0) or 0)
            bed("roar", st, nxt, -10 + 10 * min(1, heat) if heat > 0 else -40)
            pov = merged.get("pov")
            bed("hum", st, nxt, 0 if pov == "window" else -40)
            bed("breath", st, nxt, 0 if pov == "visor" else -40)
            if r["scene"] == "space":
                bed("rumble", st, nxt, -8 if merged.get("shot") == "fall" else -40)
        for name, pts in beds.items():
            if max(g for _, g in pts) <= -30:
                continue
            a, b = pts[0][0], pts[-1][0]
            cues.append({"name": name, "at": a - 0.5, "dur": b - a + 1.0, "gain": 0.0,
                         "curve": [(t - (a - 0.5), g) for t, g in pts],
                         **({"bright": 1.0} if name == "wind" else {}), **({"crackle": 1.0} if name == "roar" else {})})
    return cues


def render_cues(cues: list[dict], total: float, seed: str) -> np.ndarray:
    n = int(total * SR) + SR
    out = np.zeros((n, 2), np.float32)
    for k, c in enumerate(cues):
        fn = SFX[c["name"]]
        rng = _rng(f"{seed}|{k}|{c['name']}")
        kw = {}
        if c.get("dur"):
            kw["dur"] = max(0.3, float(c["dur"]))
        for key in ("bright", "crackle", "dist"):
            if key in c:
                kw[key] = float(c[key])
        x = fn(rng, **kw)
        if x.ndim == 1:
            x = pan(x, 0.0)
        g = db(SFX_GAIN[c["name"]] + float(c.get("gain", 0)))
        if c.get("curve"):
            # smooth gain curve (dB) over the bed, 0.8 s ramps between beats
            pts = c["curve"]
            tt = np.arange(len(x)) / SR
            ts = np.array([p[0] for p in pts]); gs = np.array([p[1] for p in pts])
            curve = np.interp(tt, ts, gs).astype(np.float32)
            k = int(0.8 * SR)
            curve = np.convolve(np.pad(curve, (k, k), mode="edge"), np.ones(k) / k, mode="same")[k:-k][: len(x)]
            x = x * (10 ** (curve / 20))[:, None]
        i0 = int(max(0.0, c["at"]) * SR)
        skip = int(max(0.0, -c["at"]) * SR)
        x = x[skip:]
        m = min(len(x), n - i0)
        if m > 0:
            out[i0:i0 + m] += x[:m] * g
    return out


# ------------------------------------------------------------------ mixing
def voice_env(voice: np.ndarray) -> np.ndarray:
    """0..1 'voice present' envelope at audio rate (attack ~40 ms, release ~450 ms)"""
    hop = SR // 100
    m = len(voice) // hop
    rms = np.sqrt(np.mean(voice[: m * hop].reshape(m, hop) ** 2, axis=1) + 1e-12)
    ref = np.percentile(rms[rms > 1e-4], 90) if np.any(rms > 1e-4) else 1.0
    v = np.clip(rms / (ref * 0.35), 0, 1)
    out = np.zeros_like(v)
    a_up, a_dn = 1 - math.exp(-1 / 4), 1 - math.exp(-1 / 45)
    s = 0.0
    for i, x in enumerate(v):
        s += (x - s) * (a_up if x > s else a_dn)
        out[i] = s
    return np.interp(np.arange(len(voice)) / hop, np.arange(m), out).astype(np.float32)


def loudnorm(src: Path, dst: Path) -> dict:
    """two-pass EBU R128 to TARGET_I / TARGET_TP (linear when possible); returns the final measurement"""
    f1 = f"loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}:print_format=json"
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(src), "-af", f1, "-f", "null", "-"], capture_output=True, text=True)
    m = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1])
    f2 = (f"loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af", f2, "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", str(dst)], check=True)
    return measure(dst)


def measure(path: Path) -> dict:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    summ = r[r.rindex("Summary:"):]
    get = lambda pat: float(re.search(pat, summ).group(1))  # noqa: E731
    return {"I": get(r"I:\s+(-?[\d.]+) LUFS"), "LRA": get(r"LRA:\s+(-?[\d.]+) LU"), "TP": get(r"Peak:\s+(-?[\d.]+) dBFS")}


def mix(voice_path: Path, beats: list[dict], timing: dict[str, dict], sections: list[dict], total: float, seed: str,
        out_path: Path, music_db: float = 0.0, keep_score: Path | None = None) -> dict:
    v, sr = sf.read(voice_path, dtype="float32")
    if v.ndim > 1:
        v = v.mean(axis=1)
    if sr != SR:
        v = signal.resample_poly(v, SR, sr).astype(np.float32)
    total = max(total, len(v) / SR)
    n = int(total * SR)
    v = np.pad(v, (0, max(0, n - len(v))))[:n]
    score = build_score(total, sections, seed)[:n]
    fx = render_cues(cues_from_beats(beats, timing, total), total, seed)[:n]
    e = voice_env(v)[:, None]
    # duck: music -11 dB under the voice, SFX -5 dB
    music = score * db(-1 + music_db) * (1 - (1 - db(-11)) * e)
    sfx = fx * (1 - (1 - db(-5)) * e)
    out = np.stack([v, v], 1) * db(0) + music + sfx
    # gentle bus limiter before loudnorm (soft clip above -1 dBFS)
    pk = np.abs(out).max()
    if pk > 0.89:
        out = np.tanh(out / pk * 1.4) / np.tanh(1.4) * 0.89
    tmp = out_path.with_suffix(".premaster.wav")
    sf.write(tmp, out, SR, subtype="FLOAT")
    if keep_score is not None:
        sf.write(keep_score, music, SR, subtype="PCM_16")
    meas = loudnorm(tmp, out_path)
    tmp.unlink()
    return meas


def default_tension(k: int, n: int) -> float:
    """rising arc with a release at the end"""
    if n <= 1:
        return 0.5
    x = k / (n - 1)
    return round(0.3 + 0.6 * x if k < n - 1 else 0.35, 2)


def mix_short(vdir: Path, sh: dict, beats_t: list[dict], voice_path: Path, total: float, out_path: Path) -> dict:
    """mix a native Short: voice + score (tension high) + SFX from its beats"""
    timing = {b["id"]: b for b in beats_t}
    sections = [{"start": 0.0, "end": total, "tension": float(sh.get("tension", 0.7))}]
    return mix(voice_path, sh["beats"], timing, sections, total, f"{vdir.name}|{sh['id']}", out_path, music_db=1.0)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("video_id")
    ap.add_argument("--qa", action="store_true")
    a = ap.parse_args()
    vdir = video_dir(a.video_id)
    out = vdir / "audio" / "mix.wav"
    if a.qa:
        print(measure(out))
        return
    require(vdir, "voice")
    script = read_json(vdir / "script.json")
    timing = read_json(vdir / "timing.json")
    tb = {b["id"]: b for b in timing["beats"]}
    secs = script["sections"]
    sections = []
    for k, (s, ts) in enumerate(zip(secs, timing["sections"])):
        ten = s.get("tension")
        sections.append({"start": ts["start"], "end": ts["end"], "tension": float(ten) if ten is not None else default_tension(k, len(secs))})
    beats = [b for s in secs for b in s["beats"]]
    voice = vdir / "audio" / "narration.wav"
    if timing.get("provider") == "silent" or not voice.exists():
        set_stage(vdir, STAGE, "skipped", note="no narration (silent provider): no mix")
        log(STAGE, "skipped (silent narration)")
        return
    try:
        meas = mix(voice, beats, tb, sections, timing["total"], a.video_id, out, keep_score=vdir / "audio" / "score.wav")
    except Exception as e:  # noqa: BLE001
        fail(vdir, STAGE, f"mix failed: {e}")
    problems = []
    if abs(meas["I"] - TARGET_I) > 1.0:
        problems.append(f"integrated {meas['I']} LUFS (target {TARGET_I})")
    if meas["TP"] > TARGET_TP + 0.3:
        problems.append(f"true peak {meas['TP']} dBTP > {TARGET_TP}")
    n_cues = len(cues_from_beats(beats, tb, timing["total"]))
    if problems:
        fail(vdir, STAGE, "; ".join(problems), loudness=meas)
    set_stage(vdir, STAGE, "done", outputs=["audio/mix.wav"], loudness=meas, cues=n_cues,
              tension=[s["tension"] for s in sections])
    log(STAGE, f"OK: mix.wav {meas['I']} LUFS, TP {meas['TP']} dBTP, LRA {meas['LRA']}, {n_cues} sfx cues")


if __name__ == "__main__":
    main()
