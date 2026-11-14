#!/usr/bin/env python3
"""Contact sheets of a cartoon short (src/toon/kit): look at these before any long render.

usage: scripts/toon-sheet.py <id> [--from-video [file]] [--frames f,f,...] [--scale s] [--per-sheet N]

  <id>             the video: src/videos/<id>/entry.tsx and engine/videos/<id>/shots.json
  (default)        renders the stills it needs with scripts/toon-stills.mjs (scale 0.5) into out/<id>/stills/
  --from-video     cuts the frames out of a rendered film instead: out/<id>/video.mp4 if it exists, else the proxy
                   out/<id>/proxy/video.mp4, or the file given
  --frames f,f     these frames instead of the automatic choice
  --scale s        still size when rendering (default 0.5 = 540x960)
  --per-sheet N    tiles per sheet (default 6)

Automatic choice: two frames per shot, read from shots.json: one early in the shot (the framing has settled) and one
on its main action (2 frames after the shot's first one-off event; without events, 70 % through the shot).
Every tile is labelled with its shot, frame and place. Output: out/<id>/sheets/sheet_NN.jpg (the paths are printed).
"""
import json, os, subprocess, sys

import signal
if hasattr(signal, "SIGPIPE"): signal.signal(signal.SIGPIPE, signal.SIG_DFL)  # quiet exit when piped into head
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # this python has no Pillow: run again with the engine's virtualenv
    venv = os.path.normpath(os.path.join(ROOT, "..", ".venv", "bin", "python"))
    if os.path.exists(venv) and os.path.realpath(venv) != os.path.realpath(sys.executable): os.execv(venv, [venv] + sys.argv)
    raise

def arg(flag, default=None):
    if flag not in sys.argv: return default
    i = sys.argv.index(flag) + 1
    return sys.argv[i] if i < len(sys.argv) and not sys.argv[i].startswith("--") else ""

def pick(plan):
    """[(shot, frame)]: two frames per shot"""
    out = []
    for s in plan["shots"]:
        a, b = s["a"], s["b"]
        n = b - a
        first = a + min(10, n // 4)
        ev = [e["f"] for e in plan.get("events", []) if "to" not in e and a + 6 <= e["f"] < b - 3]
        act = min(b - 2, ev[0] + 2) if ev else a + round(0.7 * n)
        if act - first < 6: act = a + round(0.7 * n)
        out += [(s, first), (s, act)] if act > first else [(s, first)]
    return out

def sheet(path, tiles, h=800, cols=6):
    try: font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", max(14, h // 30))
    except Exception: font = ImageFont.load_default()
    ims = []
    for lab, p in tiles:
        im = Image.open(p).convert("RGB"); ims.append((lab, im.resize((round(im.width * h / im.height), h), Image.LANCZOS)))
    w = max(im.width for _, im in ims); bar = max(22, h // 20); rows = (len(ims) + cols - 1) // cols
    S = Image.new("RGB", (cols * w + (cols + 1) * 6, rows * (h + bar + 6) + 6), (24, 24, 28))
    d = ImageDraw.Draw(S)
    for k, (lab, im) in enumerate(ims):
        x = 6 + (k % cols) * (w + 6); y = 6 + (k // cols) * (h + bar + 6)
        d.rectangle([x, y, x + w, y + bar], fill=(245, 245, 240)); d.text((x + 6, y + 3), lab, fill=(20, 20, 24), font=font)
        S.paste(im, (x, y + bar))
    S.save(path, quality=88)
    print(os.path.relpath(path, ROOT), S.size, flush=True)

def main():
    if len(sys.argv) < 2 or sys.argv[1].startswith("-"): print(__doc__); sys.exit(2)
    vid = sys.argv[1]
    plan = json.load(open(os.path.normpath(os.path.join(ROOT, "..", "videos", vid, "shots.json"))))
    shot_of = lambda f: next((s for s in plan["shots"] if s["a"] <= f < s["b"]), plan["shots"][-1])
    frames = arg("--frames")
    picks = [(shot_of(int(f)), int(f)) for f in frames.split(",") if f.strip()] if frames else pick(plan)
    out = os.path.join(ROOT, "out", vid, "sheets"); os.makedirs(os.path.join(out, "frames"), exist_ok=True)
    per = int(arg("--per-sheet", "6"))
    fv = arg("--from-video")
    paths = {}
    if fv is not None:
        video = fv or next((p for p in (os.path.join(ROOT, "out", vid, "video.mp4"), os.path.join(ROOT, "out", vid, "proxy", "video.mp4")) if os.path.exists(p)), None)
        if not video or not os.path.exists(video): sys.exit("no rendered film for %s (render it, or drop --from-video)" % vid)
        print("frames from", os.path.relpath(video, ROOT), flush=True)
        fps = plan.get("fps", 30)
        for _, f in picks:
            p = os.path.join(out, "frames", "v%d.jpg" % f)
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "%.4f" % (max(0, f - 0.5) / fps), "-i", video, "-frames:v", "1", "-q:v", "3", p], check=True)
            paths[f] = p
    else:
        scale = arg("--scale", "0.5")
        need = sorted({f for _, f in picks})
        r = subprocess.run(["node", "scripts/toon-stills.mjs", vid, ",".join(map(str, need)), scale], cwd=ROOT)
        if r.returncode: sys.exit("stills failed")
        paths = {f: os.path.join(ROOT, "out", vid, "stills", "f%d.jpg" % f) for f in need}
    tiles = [("shot %d  f%d  %s" % (s["id"], f, s["place"]), paths[f]) for s, f in picks]
    tag = "v" if fv is not None else ("x" if frames else "")
    for k in range(0, len(tiles), per):
        sheet(os.path.join(out, "sheet_%s%02d.jpg" % (tag, k // per + 1)), tiles[k:k + per], cols=min(per, 6))

main()
