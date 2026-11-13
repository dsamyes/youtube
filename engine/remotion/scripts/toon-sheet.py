#!/usr/bin/env python3
"""Tile stills into a labelled contact sheet.
usage: toon-sheet.py out.jpg [--cols N] [--h PX] label=path [label=path ...]"""
import sys
from PIL import Image, ImageDraw, ImageFont

def main():
    a = sys.argv[1:]
    out, cols, h = a[0], 6, 640
    items = []
    i = 1
    while i < len(a):
        if a[i] == "--cols": cols = int(a[i + 1]); i += 2; continue
        if a[i] == "--h": h = int(a[i + 1]); i += 2; continue
        lab, path = a[i].split("=", 1); items.append((lab, path)); i += 1
    try: font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", max(14, h // 28))
    except Exception: font = ImageFont.load_default()
    ims = []
    for lab, path in items:
        im = Image.open(path).convert("RGB"); w = round(im.width * h / im.height); ims.append((lab, im.resize((w, h), Image.LANCZOS)))
    w = max(im.width for _, im in ims); bar = max(22, h // 20); rows = (len(ims) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * w + (cols + 1) * 6, rows * (h + bar + 6) + 6), (24, 24, 28))
    d = ImageDraw.Draw(sheet)
    for k, (lab, im) in enumerate(ims):
        x = 6 + (k % cols) * (w + 6); y = 6 + (k // cols) * (h + bar + 6)
        d.rectangle([x, y, x + w, y + bar], fill=(245, 245, 240)); d.text((x + 6, y + 2), lab, fill=(20, 20, 24), font=font)
        sheet.paste(im, (x, y + bar))
    sheet.save(out, quality=88)
    print(out, sheet.size)

main()
