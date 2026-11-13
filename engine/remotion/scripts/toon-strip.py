#!/usr/bin/env python3
"""Tile a rendered frame sequence (element-*.jpeg) into a labelled strip. usage: toon-strip.py dir out.jpg first_frame step [cols]"""
import sys, glob
from PIL import Image, ImageDraw
d, out, f0, step = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
cols = int(sys.argv[5]) if len(sys.argv) > 5 else 9
ims = [Image.open(f).convert("RGB") for f in sorted(glob.glob(d + "/element-*.jpeg"))]
w, h = ims[0].size
cols = min(len(ims), cols); rows = (len(ims) + cols - 1) // cols
sh = Image.new("RGB", (cols * w, rows * (h + 18)), (20, 20, 24)); dr = ImageDraw.Draw(sh)
for i, im in enumerate(ims):
    x, y = (i % cols) * w, (i // cols) * (h + 18)
    sh.paste(im, (x, y + 18)); dr.text((x + 4, y + 3), "f%d" % (f0 + i * step), fill=(240, 240, 240))
sh.save(out, quality=85); print(out, sh.size)
