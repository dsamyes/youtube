#!/usr/bin/env python3
"""Measure an edit's shot grammar from a video file: cut times (ffmpeg scene score), shot count,
average/median shot length, black frames, letterboxing, and a contact sheet with one frame per shot.

  python measure_shots.py VIDEO [--start 0] [--end 90] [--thr 0.30] [--sheet out.jpg] [--json out.json]

Works on our own renders and on any reference file the owner downloads locally (the `watch` skill's
media file, for example). Pure ffmpeg + Pillow, no network.
"""
from __future__ import annotations

import argparse
import json
import re
import statistics
import subprocess
import sys
from pathlib import Path


def ff(args: list[str]) -> str:
    p = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", *args], capture_output=True, text=True)
    return p.stderr


def cuts(path: Path, t0: float, t1: float, thr: float) -> list[float]:
    err = ff(["-ss", str(t0), "-to", str(t1), "-i", str(path), "-an", "-vf",
              f"scale=320:-2,select='gt(scene,{thr})',showinfo", "-f", "null", "-"])
    ts = [float(m) + t0 for m in re.findall(r"pts_time:([\d.]+)", err)]
    # merge detections closer than 0.4 s (flashes, fast whips) into one cut
    out: list[float] = []
    for t in ts:
        if not out or t - out[-1] > 0.4:
            out.append(round(t, 2))
    return out


def blacks(path: Path, t0: float, t1: float) -> list[tuple[float, float]]:
    err = ff(["-ss", str(t0), "-to", str(t1), "-i", str(path), "-an", "-vf",
              "scale=320:-2,blackdetect=d=0.08:pix_th=0.06:pic_th=0.97", "-f", "null", "-"])
    return [(float(a) + t0, float(b) + t0) for a, b in re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", err)]


def letterbox(path: Path, t: float) -> str:
    err = ff(["-ss", str(t), "-i", str(path), "-frames:v", "8", "-vf", "cropdetect=limit=0.06:round=2", "-f", "null", "-"])
    m = re.findall(r"crop=(\d+:\d+:\d+:\d+)", err)
    return m[-1] if m else ""


def sheet(path: Path, times: list[float], out: Path, labels: list[str]) -> None:
    from PIL import Image, ImageDraw
    tmp = out.parent / (out.stem + "_f")
    tmp.mkdir(parents=True, exist_ok=True)
    ims = []
    for i, t in enumerate(times):
        f = tmp / f"{i:03d}.jpg"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t:.3f}", "-i", str(path), "-frames:v", "1",
                        "-vf", "scale=384:216", str(f)], check=True)
        ims.append(Image.open(f).convert("RGB"))
    cols = 6
    rows = -(-len(ims) // cols)
    S = Image.new("RGB", (cols * 384, rows * 216), "black")
    for i, im in enumerate(ims):
        d = ImageDraw.Draw(im)
        d.rectangle([0, 194, 384, 216], fill=(0, 0, 0))
        d.text((6, 198), labels[i], fill=(255, 220, 0))
        S.paste(im, ((i % cols) * 384, (i // cols) * 216))
    S.save(out, quality=88)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("video", type=Path)
    ap.add_argument("--start", type=float, default=0.0)
    ap.add_argument("--end", type=float, default=90.0)
    ap.add_argument("--thr", type=float, default=0.30)
    ap.add_argument("--cuts", type=Path, help="JSON list of known cut times (skip detection, e.g. our own edit list)")
    ap.add_argument("--sheet", type=Path)
    ap.add_argument("--json", type=Path)
    a = ap.parse_args()
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(a.video)],
                               capture_output=True, text=True, check=True).stdout.strip())
    t1 = min(a.end, dur)
    c = json.loads(a.cuts.read_text()) if a.cuts else cuts(a.video, a.start, t1, a.thr)
    c = [x for x in c if a.start < x < t1]
    bounds = [a.start, *c, t1]
    shots = [round(b - a_, 2) for a_, b in zip(bounds, bounds[1:])]
    mids = [(a_ + b) / 2 for a_, b in zip(bounds, bounds[1:])]
    bl = blacks(a.video, a.start, t1)
    lb = {round(m, 1): letterbox(a.video, m) for m in mids[:: max(1, len(mids) // 8)]}
    res = {"video": str(a.video), "window": [a.start, t1], "cuts": c, "shots": len(shots),
           "avg_shot_s": round(statistics.mean(shots), 2), "median_shot_s": round(statistics.median(shots), 2),
           "max_shot_s": max(shots), "min_shot_s": min(shots), "shot_lengths": shots,
           "black_segments": bl, "cropdetect_samples": lb}
    print(json.dumps({k: v for k, v in res.items() if k != "shot_lengths"}, indent=1))
    if a.json:
        a.json.write_text(json.dumps(res, indent=1))
    if a.sheet:
        sheet(a.video, mids, a.sheet, [f"#{i + 1} {m:.1f}s ({s:.1f}s)" for i, (m, s) in enumerate(zip(mids, shots))])


if __name__ == "__main__":
    sys.exit(main())
