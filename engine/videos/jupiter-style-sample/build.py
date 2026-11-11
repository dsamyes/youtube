#!/usr/bin/env python3
"""Build the ~75 s style sample of "What If You Fell Into Jupiter?" end to end (prototype of the next
engine: footage + 3D, fast cutting, kinetic keywords, SFX on cuts, free Kokoro voice).

  engine/.venv/bin/python -B engine/videos/jupiter-style-sample/build.py [--stage all|voice|footage|edit|audio|render|qa]
        [--pixabay] [--scale 1.0] [--concurrency 4]

Stages (each caches its outputs under build/, so a re-run only redoes what changed):
  voice    Kokoro am_michael (free, local), one take per line, word times from Kokoro's phonemes
           + pause detection (Kokoro v1.0 onnx has no duration output).        -> build/voice.wav, timing.json
  footage  NASA Image and Video Library + NASA SVS exact items; Pixabay slots when PIXABAY_API_KEY is
           set (--pixabay). Every file validated + credited.                  -> build/footage/raw, credits.json
  edit     shot list -> frame-exact cut list (cuts land 2-3 frames before their word), per-shot
           proxies (trim, speed ramp, crop, scale 1920x1080, grade, no audio), still flipbooks,
           kinetic keywords + 3-word captions.        -> remotion/public/jupiter-style-sample/, build/props.json
  audio    score (pipeline/sound.py build_score) + SFX cues (whoosh into cuts, impacts on punch words)
           ducked under the voice, loudness -14 LUFS.                          -> build/mix.wav
  render   Remotion (separate entry point: src/videos/jupiter-style-sample/index.ts), muted, then mux.
                                                                              -> renders/jupiter-style-sample_1080p.mp4
  qa       contact sheet (1 frame per shot), shot stats, black frames, letterbox check -> build/qa/

Nothing here edits shared engine code; it imports pipeline/sound.py, textnorm.py and the 3D library.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ENGINE = HERE.parent.parent
sys.path.insert(0, str(ENGINE / "pipeline"))
sys.path.insert(0, str(HERE))

import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402

import providers as P  # noqa: E402

REMOTION = ENGINE / "remotion"
SID = "jupiter-style-sample"
PUB = REMOTION / "public" / SID          # git-ignored (public/*/)
B = HERE / "build"                        # git-ignored (videos/*/build/)
RAW = B / "footage" / "raw"
FPS = 30
W, H = 1920, 1080
SR = 24000


def log(msg: str) -> None:
    print(f"[sample] {msg}", flush=True)


def rj(p: Path):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def wj(p: Path, d) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(d, indent=1, ensure_ascii=False), encoding="utf-8")


def sh(cmd: list[str], cwd: Path | None = None) -> str:
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if p.returncode:
        raise SystemExit(f"command failed: {' '.join(cmd[:4])} ...\n{(p.stdout + p.stderr)[-2500:]}")
    return p.stdout


# ======================================================================== voice
def words_of(text: str) -> list[str]:
    return text.split()


def phoneme_weights(tokens: list[str]) -> list[float]:
    from kokoro_onnx.tokenizer import Tokenizer
    from textnorm import spoken
    tk = Tokenizer()
    out = []
    for t in tokens:
        s = spoken(t).strip(".,?!;:")
        ph = tk.phonemize(s, "en-us") if s else ""
        out.append(max(1.0, len(re.sub(r"\s", "", ph))))
    return out


def speech_segments(x: np.ndarray, min_gap: float = 0.085, thr_db: float = -38) -> list[tuple[float, float]]:
    hop = int(0.01 * SR)
    m = len(x) // hop
    rms = np.sqrt(np.mean(x[: m * hop].reshape(m, hop) ** 2, axis=1) + 1e-12)
    on = 20 * np.log10(rms / (rms.max() + 1e-9)) > thr_db
    segs, start, silent = [], None, 0
    for i, v in enumerate(on):
        if v:
            if start is None:
                start = i
            silent = 0
        elif start is not None:
            silent += 1
            if silent * 0.01 >= min_gap:
                segs.append((start * 0.01, (i - silent + 1) * 0.01))
                start, silent = None, 0
    if start is not None:
        segs.append((start * 0.01, (m - silent) * 0.01))
    return segs


def align_words(tokens: list[str], x: np.ndarray) -> list[dict]:
    """word start/end inside one line take: phrases (split at , . ? !) are matched to the speech
    segments between pauses; inside a segment the time is shared by phoneme count."""
    wts = phoneme_weights(tokens)
    phrases, cur = [], []
    for i, t in enumerate(tokens):
        cur.append(i)
        if re.search(r"[,.?!;:]$", t):
            phrases.append(cur)
            cur = []
    if cur:
        phrases.append(cur)
    segs = speech_segments(x)
    if len(segs) != len(phrases):
        # merge the closest segments until the counts match, else one segment for everything
        while len(segs) > len(phrases) and len(segs) > 1:
            gaps = [segs[i + 1][0] - segs[i][1] for i in range(len(segs) - 1)]
            k = int(np.argmin(gaps))
            segs[k:k + 2] = [(segs[k][0], segs[k + 1][1])]
        if len(segs) != len(phrases):
            segs = [(segs[0][0], segs[-1][1])] if segs else [(0.0, len(x) / SR)]
            phrases = [list(range(len(tokens)))]
    out = [None] * len(tokens)
    for (a, b), ph in zip(segs, phrases):
        tot = sum(wts[i] for i in ph)
        acc = a
        for i in ph:
            d = (b - a) * wts[i] / tot
            out[i] = {"w": tokens[i], "start": round(acc, 3), "end": round(acc + d, 3)}
            acc += d
    return out


def stage_voice(S: dict) -> dict:
    from kokoro_onnx import Kokoro
    from textnorm import spoken
    v = S["voice"]
    mdir = ENGINE / "models" / "kokoro"
    vd = B / "voice"
    vd.mkdir(parents=True, exist_ok=True)
    k = None
    takes = []
    for ln in S["lines"]:
        text = ln.get("spoken") or spoken(ln["text"])
        h = hashlib.sha1(f"{v['voice']}|{v['speed']}|{text}".encode()).hexdigest()[:12]
        wav = vd / f"{ln['id']}_{h}.wav"
        if not wav.exists():
            if k is None:
                k = Kokoro(str(mdir / "kokoro-v1.0.onnx"), str(mdir / "voices-v1.0.bin"))
            x, sr = k.create(text, voice=v["voice"], speed=float(v["speed"]), lang="en-us")
            assert sr == SR
            sf.write(wav, x, SR, subtype="FLOAT")
        x, _ = sf.read(wav, dtype="float32")
        idx = np.where(np.abs(x) > 10 ** (-45 / 20))[0]
        x = x[max(0, idx[0] - int(0.03 * SR)): min(len(x), idx[-1] + int(0.06 * SR))]
        pk = float(np.abs(x).max())
        x = x * (0.95 / pk) if pk > 0.95 else x
        takes.append((ln, x))
    pieces = [np.zeros(int(S["lead_in"] * SR), np.float32)]
    t = S["lead_in"]
    lines = []
    for i, (ln, x) in enumerate(takes):
        toks = words_of(ln["text"])
        al = align_words(toks, x)
        dur = len(x) / SR
        lines.append({"id": ln["id"], "start": round(t, 3), "end": round(t + dur, 3),
                      "words": [{"w": a["w"], "start": round(t + a["start"], 3), "end": round(t + a["end"], 3)} for a in al]})
        pieces.append(x)
        t += dur
        gap = float(ln.get("gap", S["gap"])) if i < len(takes) - 1 else S["tail"]
        pieces.append(np.zeros(int(gap * SR), np.float32))
        t += gap
    raw = np.concatenate(pieces)
    sf.write(B / "voice_raw.wav", raw, SR)
    sh(["ffmpeg", "-y", "-loglevel", "error", "-i", str(B / "voice_raw.wav"), "-af",
        "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,loudnorm=I=-16:TP=-1.5:LRA=9",
        "-ar", "48000", "-ac", "1", str(B / "voice.wav")])
    timing = {"provider": "kokoro", "voice": f"kokoro-v1.0:{v['voice']}@{v['speed']}", "total": round(t, 3), "lines": lines}
    wj(B / "timing.json", timing)
    wpm = sum(len(ln["words"]) for ln in lines) / sum(ln["end"] - ln["start"] for ln in lines) * 60
    log(f"voice: {len(lines)} lines, {t:.1f}s total, {wpm:.0f} wpm while speaking")
    return timing


# ======================================================================== footage
def stage_footage(S: dict, use_pixabay: bool) -> dict:
    RAW.mkdir(parents=True, exist_ok=True)
    nasa, svs = P.NasaImages(), P.NasaSvs()
    assets, cache = {}, {}
    for name, c in S["clips"].items():
        key = json.dumps({k: c[k] for k in ("provider", "nasa_id", "svs_id", "file") if k in c}, sort_keys=True)
        if key not in cache:
            if c["provider"] == "nasa_images":
                a = nasa.fetch(c["nasa_id"], RAW)
            else:
                a = svs.fetch(c["svs_id"], c["file"], RAW, kind=c.get("kind", "video"))
            cache[key] = P.asset_dict(a)
            log(f"footage: {a.provider} {a.id} {a.width}x{a.height} ({a.license.split(';')[0]})")
        assets[name] = cache[key]
    stock = {}
    if use_pixabay:
        if not P.Pixabay().available():
            log("pixabay: PIXABAY_API_KEY not set -> fallback shots")
        else:
            used: set[str] = set()
            for slot in S["stock_slots"]:
                a = P.pick_stock(slot, RAW, used, log=log)
                if a:
                    stock[slot["id"]] = P.asset_dict(a)
    out = {"clips": assets, "stock": stock}
    wj(B / "footage.json", out)
    return out


# ======================================================================== edit
def ramp_filter(s0: float, s1: float, D: float) -> str:
    """speed s(t) linear in OUTPUT time t over D seconds; setpts maps source time T -> output time"""
    a = (s1 - s0) / D
    if abs(a) < 1e-6:
        return f"setpts=(T/{s0:.4f})/TB"
    return f"setpts=((-{s0:.4f}+sqrt({s0:.4f}*{s0:.4f}+2*{a:.6f}*T))/{a:.6f})/TB"


def make_proxy(src: Path, out: Path, t_in: float, t_out: float, D: float, speed: list[float], crop: str | None,
               anchor: str, src_w: int) -> dict:
    s0, s1 = float(speed[0]), float(speed[1])
    avail = t_out - t_in
    U = D * (s0 + s1) / 2
    if U > avail:  # not enough source: slow the whole ramp down uniformly
        f = avail / U
        s0, s1, U = s0 * f, s1 * f, avail
    start = t_out - U if anchor == "end" else t_in
    vf = []
    if crop:
        vf.append(f"crop={crop}")
    vf += [ramp_filter(s0, s1, D), f"fps={FPS}",
           f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos", f"crop={W}:{H}",
           "eq=contrast=1.05:saturation=1.10"]
    eff_w = int(crop.split(":")[0]) if crop else src_w
    if eff_w < W:
        vf.append("unsharp=5:5:0.55:5:5:0.0")
    key = hashlib.sha1(json.dumps([str(src), start, U, D, s0, s1, vf]).encode()).hexdigest()[:10]
    stamp = out.with_suffix(".key")
    if not (out.exists() and stamp.exists() and stamp.read_text() == key):
        sh(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{start:.3f}", "-i", str(src), "-an", "-vf", ",".join(vf),
            "-t", f"{D + 0.1:.3f}", "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p",
            "-g", "15", "-movflags", "+faststart", str(out)])
        stamp.write_text(key)
    return {"src_start": round(start, 2), "src_used": round(U, 2), "speed": [round(s0, 2), round(s1, 2)], "upscale": round(W / eff_w, 2)}


def split_strip(img, axis: int = 0, thr: int = 14, min_px: int = 200) -> list[tuple[int, int]]:
    a = np.asarray(img.convert("L").resize((img.width // 8, img.height // 8)))
    prof = a.max(axis=axis)
    on = prof > thr
    runs, s = [], None
    for i, v in enumerate(on):
        if v and s is None:
            s = i
        if not v and s is not None:
            runs.append((s * 8, i * 8))
            s = None
    if s is not None:
        runs.append((s * 8, len(on) * 8))
    return [r for r in runs if r[1] - r[0] >= min_px]


def make_stills(name: str, asset: dict, spec: dict) -> list[str]:
    """TIF -> 1920x1080 JPEG frames under public/ (flipbooks split on the black gaps between frames)"""
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    d = PUB / "stills"
    d.mkdir(parents=True, exist_ok=True)
    outs = sorted(d.glob(f"{name}_*.jpg"))
    if outs:
        return [f"{SID}/stills/{p.name}" for p in outs]
    im = Image.open(asset["path"]).convert("RGB")
    frames = []
    if spec.get("frames"):
        runs = split_strip(im, axis=0)
        if len(runs) != spec["frames"]:
            n = spec["frames"]
            runs = [(int(im.width * i / n), int(im.width * (i + 1) / n)) for i in range(n)]
        if name == "juno_strip":
            # common scale: the whole strip at 1.12x frame height, each frame centred on black
            k = H * 1.12 / im.height
            for i, (a, b) in enumerate(runs):
                fr = im.crop((a, 0, b, im.height)).resize((max(2, int((b - a) * k)), int(im.height * k)), Image.LANCZOS)
                can = Image.new("RGB", (W, H), "black")
                can.paste(fr, ((W - fr.width) // 2 + int(W * 0.08), (H - fr.height) // 2))
                frames.append(can)
        else:
            # tall limb frames: a 16:9 window around the middle of each frame
            for a, b in runs:
                fr = im.crop((a, 0, b, im.height))
                cw = fr.width
                ch = int(cw * 9 / 16)
                y0 = int(fr.height * 0.42 - ch / 2)
                frames.append(fr.crop((0, y0, cw, y0 + ch)).resize((W, H), Image.LANCZOS))
    else:
        ch = int(im.width * 9 / 16)
        y0 = int((im.height - ch) * float(spec.get("y", 0.1)))
        frames.append(im.crop((0, y0, im.width, y0 + ch)).resize((W, H), Image.LANCZOS))
    outs = []
    for i, f in enumerate(frames):
        p = d / f"{name}_{i:02d}.jpg"
        f.save(p, quality=92)
        outs.append(f"{SID}/stills/{p.name}")
    return outs


PHOTO_LIB = {"galileo_probe_art": ("lib/photos/galileo_probe_art_AC89-0146-2.jpg", "NASA Ames Research Center (Galileo probe, art 1989)")}


def caption_chunks(lines: list[dict]) -> list[dict]:
    """bottom captions: <= 3 words, break after punctuation; each word keeps its time for highlight"""
    caps = []
    for ln in lines:
        cur = []
        for w in ln["words"]:
            cur.append(w)
            if len(cur) == 3 or re.search(r"[,.?!;:]$", w["w"]):
                caps.append(cur)
                cur = []
        if cur:
            caps.append(cur)
    out = []
    for i, c in enumerate(caps):
        nxt = caps[i + 1][0]["start"] if i + 1 < len(caps) else c[-1]["end"] + 0.6
        out.append({"from": round(c[0]["start"] - 0.05, 3), "to": round(min(nxt - 0.05, c[-1]["end"] + 0.7), 3),
                    "words": [{"w": w["w"], "t": w["start"]} for w in c]})
    return out


def stage_edit(S: dict, timing: dict, foot: dict) -> dict:
    PUB.mkdir(parents=True, exist_ok=True)
    (PUB / "shots").mkdir(exist_ok=True)
    total = timing["total"]
    lines = {ln["id"]: ln for ln in timing["lines"]}
    # 1) cut times
    cuts = []
    for sl in S["lines"]:
        tl = lines[sl["id"]]
        for j, sh_ in enumerate(sl["shots"]):
            w = tl["words"][min(sh_["at"], len(tl["words"]) - 1)]
            t = (tl["start"] - 0.12) if j == 0 else (w["start"] - 0.08)
            cuts.append((max(0.0, t), sl, sh_))
    cuts[0] = (0.0, cuts[0][1], cuts[0][2])
    shots, credits_used, used_by = [], {}, {}
    for i, (t, sl, s) in enumerate(cuts):
        t1 = cuts[i + 1][0] if i + 1 < len(cuts) else total
        f0, f1 = round(t * FPS), round(t1 * FPS)
        D = (f1 - f0) / FPS
        sid = f"s{i + 1:02d}"
        item = {"id": sid, "from": f0, "dur": f1 - f0, "line": sl["id"], "kind": s["kind"], "why": s.get("why", "")}
        stock = foot["stock"].get(s.get("stock", "")) if s.get("stock") else None
        if stock:
            src = Path(stock["path"])
            out = PUB / "shots" / f"{sid}_stock.mp4"
            info = make_proxy(src, out, 0.3, stock["duration"] - 0.2, D, [1.0, 1.0], None, "start", stock["width"])
            item.update(kind="clip", src=f"{SID}/shots/{out.name}", push=[1.02, 1.12], fx=0.5, fy=0.5, stock=s["stock"], label=s.get("label"), info=info,
                        overlay=s.get("card"))
            credits_used[f"pixabay:{stock['id']}"] = stock
            used_by.setdefault(f"pixabay:{stock['id']}", []).append(sid)
        elif s["kind"] == "clip":
            c = S["clips"][s["clip"]]
            a = foot["clips"][s["clip"]]
            out = PUB / "shots" / f"{sid}_{s['clip']}.mp4"
            info = make_proxy(Path(a["path"]), out, c["in"], c["out"], D, s.get("speed", [1, 1]), c.get("crop"),
                              "end" if s["clip"] == "callisto_in" else "start", a["width"])
            item.update(src=f"{SID}/shots/{out.name}", push=s.get("push", [1.0, 1.08]), fx=s.get("fx", 0.5), fy=s.get("fy", 0.5),
                        earth=bool(s.get("earth")), info=info, credit=a["credit"])
            credits_used[f"{a['provider']}:{a['id']}"] = a
            used_by.setdefault(f"{a['provider']}:{a['id']}", []).append(sid)
        elif s["kind"] == "photo":
            if s["photo"] in PHOTO_LIB:
                item.update(srcs=[PHOTO_LIB[s["photo"]][0]], credit=PHOTO_LIB[s["photo"]][1])
                credits_used["lib:" + s["photo"]] = {"provider": "repo public/lib", "id": s["photo"], "credit": PHOTO_LIB[s["photo"]][1],
                                                     "license": "NASA, public domain (see public/lib/CREDITS.md)", "page": ""}
                used_by.setdefault("lib:" + s["photo"], []).append(sid)
            else:
                a = foot["clips"][s["photo"]]
                item.update(srcs=make_stills(s["photo"], a, S["clips"][s["photo"]]))
                credits_used[f"{a['provider']}:{a['id']}"] = a
                used_by.setdefault(f"{a['provider']}:{a['id']}", []).append(sid)
            item.update(move=s.get("move", "push"), fx=s.get("fx", 0.5), fy=s.get("fy", 0.5), stars=bool(s.get("stars")))
        elif s["kind"] == "3d":
            item.update(scene=s["scene"], seed=s.get("seed", i), heat=s.get("heat", 0), flash=bool(s.get("flash")),
                        fast=bool(s.get("fast")), wide=bool(s.get("wide")), calm=bool(s.get("calm")))
        elif s["kind"] == "card":
            item.update(card=s["card"], label=s.get("label"))
        shots.append(item)
    # 2) keywords (kinetic) and captions
    kws = []
    for sl in S["lines"]:
        tl = lines[sl["id"]]
        for k in sl.get("kw", []):
            w = tl["words"][min(k["at"], len(tl["words"]) - 1)]
            f0 = round((w["start"] - 0.03) * FPS)
            nxt_cut = min([s["from"] for s in shots if s["from"] > f0 + 6] + [round(total * FPS)])
            dur = max(24, min(round(1.9 * FPS), nxt_cut - f0 - 1))
            kws.append({"from": f0, "dur": dur, "text": k["text"], "style": k.get("style", "big")})
    caps = caption_chunks(timing["lines"])
    sfx = []
    for sl in S["lines"]:
        tl = lines[sl["id"]]
        for c in sl.get("sfx", []):
            at = c["at"] if "at" in c and "word" not in c else tl["words"][min(c.get("word", 0), len(tl["words"]) - 1)]["start"] + c.get("dt", 0)
            sfx.append({k: v for k, v in {**c, "at": round(max(0.0, at), 3)}.items() if k not in ("word", "dt")})
    # soft whoosh into every hard cut that has no designed SFX near it (cut grammar), alternating pan
    designed = [c["at"] for c in sfx]
    for s in shots[1:]:
        t = s["from"] / FPS
        if all(abs(t - d) > 0.45 for d in designed):
            sfx.append({"name": "whoosh", "at": round(t - 0.32, 3), "dur": 0.75, "gain": -7})
    props = {"fps": FPS, "total": total, "durationInFrames": round(total * FPS), "shots": shots, "kws": kws, "caps": caps,
             "audio": None}
    wj(B / "props.json", props)
    wj(B / "sfx.json", sfx)
    credits = []
    for k, a in credits_used.items():
        credits.append({"provider": a.get("provider"), "id": a.get("id"), "title": a.get("title", ""), "page": a.get("page", ""),
                        "credit": a.get("credit", ""), "license": a.get("license", ""),
                        "used_in": used_by.get(k, [])})
    credits.append({"provider": "kokoro", "id": "am_michael", "credit": "Kokoro-82M v1.0 (hexgrad), voice am_michael", "license": "Apache-2.0 weights"})
    credits.append({"provider": "pipeline/sound.py", "id": "score+sfx", "credit": "procedural score and SFX (The If Engine)", "license": "own work"})
    credits.append({"provider": "engine 3D library", "id": "3d", "credit": "own three.js scenes; textures per public/lib/CREDITS.md", "license": "own work / NASA PD textures"})
    wj(B / "credits.json", credits)
    lens = [s["dur"] / FPS for s in shots]
    log(f"edit: {len(shots)} shots, avg {np.mean(lens):.2f}s, median {np.median(lens):.2f}s, max {max(lens):.2f}s; "
        f"{len(kws)} keywords, {len(caps)} caption chunks, {len(sfx)} sfx cues")
    return props


# ======================================================================== audio
def stage_audio(timing: dict, props: dict) -> Path:
    import sound as SND
    from scipy import signal
    total = timing["total"]
    v, sr = sf.read(B / "voice.wav", dtype="float32")
    if v.ndim > 1:
        v = v.mean(axis=1)
    if sr != SND.SR:
        v = signal.resample_poly(v, SND.SR, sr).astype(np.float32)
    n = int(total * SND.SR)
    v = np.pad(v, (0, max(0, n - len(v))))[:n]
    # score: hook hot, a breath at "the rules", build to the entry, release at the end card
    L = {ln["id"]: ln for ln in timing["lines"]}
    secs = [{"start": 0.0, "end": L["l05"]["start"], "tension": 0.8},
            {"start": L["l05"]["start"], "end": L["l14"]["start"], "tension": 0.45},
            {"start": L["l14"]["start"], "end": L["l20"]["start"], "tension": 0.95},
            {"start": L["l20"]["start"], "end": total, "tension": 0.6}]
    score = SND.build_score(total, secs, SID)[:n]
    sfx = rj(B / "sfx.json")
    fx = SND.render_cues(sfx, total, SID)[:n]
    e = SND.voice_env(v)[:, None]
    music = score * SND.db(1.5) * (1 - (1 - SND.db(-10)) * e)
    fxd = fx * SND.db(3) * (1 - (1 - SND.db(-6)) * e)
    out = np.stack([v, v], 1) + music + fxd
    pk = np.abs(out).max()
    if pk > 0.89:
        out = np.tanh(out / pk * 1.4) / np.tanh(1.4) * 0.89
    tmp = B / "mix_premaster.wav"
    sf.write(tmp, out.astype(np.float32), SND.SR, subtype="FLOAT")
    meas = SND.loudnorm(tmp, B / "mix.wav")
    tmp.unlink()
    log(f"audio: mix.wav {total:.1f}s, {len(sfx)} sfx cues, loudness {meas}")
    return B / "mix.wav"


# ======================================================================== render
def stage_render(props: dict, scale: float, concurrency: str) -> Path:
    out_dir = HERE / "renders"
    out_dir.mkdir(exist_ok=True)
    video = B / "video_muted.mp4"
    entry = f"src/videos/{SID}/index.ts"
    gl = os.environ.get("REMOTION_GL") or "swangle"
    t0 = time.time()
    sh(["npx", "remotion", "render", entry, "JupiterStyleSample", str(video), f"--props={B / 'props.json'}", "--codec=h264",
        "--crf=18", "--muted", f"--concurrency={concurrency}", f"--gl={gl}", f"--scale={scale}", "--log=error"], cwd=REMOTION)
    mins = (time.time() - t0) / 60
    out = out_dir / f"{SID}_1080p.mp4"
    sh(["ffmpeg", "-y", "-loglevel", "error", "-i", str(video), "-i", str(B / "mix.wav"), "-map", "0:v", "-map", "1:a",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(out)])
    wj(B / "render.json", {"render_min": round(mins, 2), "frames": props["durationInFrames"],
                           "fps_render": round(props["durationInFrames"] / (mins * 60), 2), "concurrency": concurrency, "gl": gl})
    log(f"render: {out} in {mins:.1f} min ({props['durationInFrames'] / (mins * 60):.1f} frames/s)")
    return out


# ======================================================================== qa
def stage_qa(props: dict) -> dict:
    out = HERE / "renders" / f"{SID}_1080p.mp4"
    qa = B / "qa"
    qa.mkdir(parents=True, exist_ok=True)
    cuts = [s["from"] / FPS for s in props["shots"][1:]]
    wj(qa / "cuts.json", cuts)
    sh([sys.executable, str(HERE / "measure_shots.py"), str(out), "--end", str(props["total"]), "--cuts", str(qa / "cuts.json"),
        "--sheet", str(qa / "contact_sheet.jpg"), "--json", str(qa / "shots_planned.json")])
    sh([sys.executable, str(HERE / "measure_shots.py"), str(out), "--end", str(props["total"]), "--thr", "0.3",
        "--json", str(qa / "shots_detected.json")])
    a, d = rj(qa / "shots_planned.json"), rj(qa / "shots_detected.json")
    res = {"shots": a["shots"], "avg_shot_s": a["avg_shot_s"], "median_shot_s": a["median_shot_s"], "max_shot_s": a["max_shot_s"],
           "detected_cuts_thr0.3": len(d["cuts"]), "black_segments": a["black_segments"], "cropdetect": a["cropdetect_samples"]}
    wj(qa / "summary.json", res)
    log(f"qa: {json.dumps(res)}")
    return res


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--stage", default="all", choices=["all", "voice", "footage", "edit", "audio", "render", "qa"])
    ap.add_argument("--pixabay", action="store_true", help="fill stock slots from Pixabay (needs PIXABAY_API_KEY)")
    ap.add_argument("--scale", default="1")
    ap.add_argument("--concurrency", default=os.environ.get("REMOTION_CONCURRENCY", "4"))
    a = ap.parse_args()
    S = rj(HERE / "sample.json")
    B.mkdir(exist_ok=True)
    st = a.stage
    if st in ("all", "voice"):
        stage_voice(S)
    if st in ("all", "footage"):
        stage_footage(S, a.pixabay)
    if st in ("all", "edit"):
        stage_edit(S, rj(B / "timing.json"), rj(B / "footage.json"))
    if st in ("all", "audio"):
        stage_audio(rj(B / "timing.json"), rj(B / "props.json"))
    if st in ("all", "render"):
        stage_render(rj(B / "props.json"), float(a.scale), a.concurrency)
    if st in ("all", "qa"):
        stage_qa(rj(B / "props.json"))

if __name__ == "__main__":
    main()
