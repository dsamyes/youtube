#!/usr/bin/env python3
"""The kit's reference sheet: every face, every hand prop and the cast, one labelled tile each.

usage: scripts/toon-faces.py [--scale 0.5]

Renders one still per entry of src/videos/_faces/staging.ts (frame n = entry n) with scripts/toon-stills.mjs and
writes src/toon/kit/faces.jpg. Run it again after changing a face, a prop or a look in the kit (about 10 minutes).
The names below must stay in step with the lists in that staging file.
"""
import os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    venv = os.path.normpath(os.path.join(ROOT, "..", ".venv", "bin", "python"))
    if os.path.exists(venv) and os.path.realpath(venv) != os.path.realpath(sys.executable): os.execv(venv, [venv] + sys.argv)
    raise

FACES = ["neutral", "stern", "smile", "smile_closed", "grin", "laugh", "relief", "relief_open", "wow", "shock", "jawdrop",
         "nervous", "sad", "pained", "dazed", "asleep", "whistle", "lick", "bite", "chew", "flap"]
PROPS = ["prop clipboard", "prop thermo 0.5", "prop thermo 2", "prop pan", "prop fork 0", "prop fork 1", "prop fork 2",
         "prop plate 0", "prop plate 1", "prop timer 90"]
REST = ["GUS acc: 1 (tall)", "WIFE", "NEIGHBOR", "FISHER"]
NAMES = ["expr " + n for n in FACES] + PROPS + REST

def main():
    scale = sys.argv[sys.argv.index("--scale") + 1] if "--scale" in sys.argv else "0.5"
    frames = ",".join(str(i) for i in range(len(NAMES)))
    if "--no-render" not in sys.argv:
        r = subprocess.run(["node", "scripts/toon-stills.mjs", "_faces", frames, scale], cwd=ROOT)
        if r.returncode: sys.exit("stills failed")
    cols, tw, bar = 7, 300, 30
    tiles = []
    for i, name in enumerate(NAMES):
        im = Image.open(os.path.join(ROOT, "out", "_faces", "stills", "f%d.jpg" % i)).convert("RGB")
        w, h = im.size
        im = im.crop((0, int(h * 0.12), w, int(h * 0.12) + w))          # a square around head and chest
        tiles.append((name, im.resize((tw, tw), Image.LANCZOS)))
    try: font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 19)
    except Exception: font = ImageFont.load_default()
    rows = (len(tiles) + cols - 1) // cols
    S = Image.new("RGB", (cols * (tw + 6) + 6, rows * (tw + bar + 6) + 6), (24, 24, 28))
    d = ImageDraw.Draw(S)
    for k, (name, im) in enumerate(tiles):
        x, y = 6 + (k % cols) * (tw + 6), 6 + (k // cols) * (tw + bar + 6)
        d.rectangle([x, y, x + tw, y + bar], fill=(245, 245, 240)); d.text((x + 6, y + 4), name, fill=(20, 20, 24), font=font)
        S.paste(im, (x, y + bar))
    out = os.path.join(ROOT, "src", "toon", "kit", "faces.jpg")
    S.save(out, quality=86)
    print(os.path.relpath(out, ROOT), S.size)

main()
