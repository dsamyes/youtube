#!/usr/bin/env python3
"""One-off (human-run) builder of the shared visual asset library in remotion/public/lib/.

The CI producer cannot download anything, so the library is committed. This script documents and
reproduces the processing: download the originals listed in remotion/public/lib/CREDITS.md into a
folder, then run
    python -I pipeline/build_asset_lib.py /path/to/downloads
Inputs (file names in that folder):
  PIA07782.jpg  PIA00585.jpg  PIA03781.jpg  lroc_color_2k.jpg  bluemarble-2048.png
  milkyway_2020_4k_gal.exr  (needs ffmpeg with zscale)  stars.json (light-speed-nines HYG catalogue)
  photos: <nasa_id>.jpg for every photo listed in PHOTOS
"""
from __future__ import annotations

import json
import math
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
OUT = Path(__file__).resolve().parent.parent / "remotion" / "public" / "lib"

TEX = {  # out name: (source, size, jpeg quality)
    "jupiter.jpg": ("PIA07782.jpg", (3600, 1800), 88),
    "io.jpg": ("PIA00585.jpg", (2048, 1024), 85),
    "ganymede.jpg": ("PIA03781.jpg", (2048, 1024), 85),
    "moon.jpg": ("lroc_color_2k.jpg", (2048, 1024), 85),
    "earth.jpg": ("bluemarble-2048.png", (2048, 1024), 88),
}
# out name: (source, crop box as fractions (l, t, r, b) or None)
PHOTOS = {
    "jupiter_globe_PIA02873.jpg": ("PIA02873.jpg", None),
    "jupiter_grs_PIA21773.jpg": ("PIA21773.jpg", None),
    "jupiter_south_PIA21381.jpg": ("PIA21381.jpg", None),
    "jupiter_clouds_PIA21984.jpg": ("PIA21984.jpg", None),
    "jupiter_storms_PIA22949.jpg": ("PIA22949.jpg", None),
    "jupiter_chaos_PIA25729.jpg": ("PIA25729.jpg", None),
    "jupiter_pearl_PIA21377.jpg": ("PIA21377.jpg", None),
    "jupiter_cyclones_ir_PIA23558.jpg": ("PIA23558.jpg", (0.222, 0.0, 0.778, 1.0)),
    "galileo_probe_art_AC89-0146-2.jpg": ("ARC-1989-AC89-0146-2.jpg", (0.06, 0.07, 0.92, 0.95)),
}


def make_noise(path: Path, n: int = 512) -> None:
    """tileable 4-channel spectral noise: R fbm (clouds), G fbm, B relief light baked from R, A fine detail"""
    rng = np.random.default_rng(7)

    def spectral(beta, lo=1.0, ridged=False):
        f = np.sqrt(np.fft.fftfreq(n)[:, None] ** 2 + np.fft.fftfreq(n)[None, :] ** 2) * n
        amp = np.where(f >= lo, (f + 1e-9) ** (-beta / 2), 0.0)
        x = np.real(np.fft.ifft2(amp * (rng.normal(size=(n, n)) + 1j * rng.normal(size=(n, n)))))
        x = (x - x.mean()) / x.std()
        if ridged:
            x = 1 - np.abs(x)
        x = (x - np.percentile(x, 0.5)) / (np.percentile(x, 99.5) - np.percentile(x, 0.5))
        return np.clip(x, 0, 1)
    r, g, a = spectral(2.8, 2), spectral(2.4, 3), spectral(1.8, 6)
    gx = (np.roll(r, -1, 1) - np.roll(r, 1, 1)) * 0.5 * n / 24
    gy = (np.roll(r, -1, 0) - np.roll(r, 1, 0)) * 0.5 * n / 24
    nrm = np.stack([-gx, np.ones_like(r), -gy], -1)
    nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)
    light = np.array([0.45, 0.8, 0.35]) / np.linalg.norm([0.45, 0.8, 0.35])
    b = np.clip(nrm @ light, 0, 1)
    b = (b - b.min()) / (b.max() - b.min())
    Image.fromarray((np.stack([r, g, b, a], -1) * 255).astype(np.uint8), "RGBA").save(path, optimize=True)


def main(src: Path) -> None:
    for d in ("tex", "photos", "data"):
        (OUT / d).mkdir(parents=True, exist_ok=True)
    make_noise(OUT / "tex" / "noise.png")
    for name, (f, size, q) in TEX.items():
        Image.open(src / f).convert("RGB").resize(size, Image.LANCZOS).save(OUT / "tex" / name, quality=q, optimize=True)
    # Milky Way (galactic frame, l=0 at the centre): linear EXR -> sRGB, black point lifted out
    png = src / "mw_gal16.png"
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(src / "milkyway_2020_4k_gal.exr"), "-vf",
                    "format=gbrpf32le,zscale=transfer=bt709:transferin=linear:npl=100,format=rgb48le", str(png)], check=True)
    a = np.asarray(Image.open(png)).astype(np.float32) / 65535.0 if Image.open(png).mode.startswith("I") else \
        np.asarray(Image.open(png).convert("RGB")).astype(np.float32) / 255.0
    lum = a.mean(axis=2, keepdims=True)
    floor = np.percentile(lum, 35)
    k = np.clip((lum - floor) / (1 - floor), 0, 1) ** 1.35 / np.maximum(lum, 1e-4)
    out = np.clip(a * k * 1.15, 0, 1)
    Image.fromarray((out * 255).astype(np.uint8)).save(OUT / "tex" / "milkyway_gal.jpg", quality=86, optimize=True)
    # real stars (HYG v4.0, CC BY-SA 4.0) as unit vectors in the galactic frame: z -> galactic centre,
    # y -> north galactic pole, x -> l = 90 deg. Columns: x, y, z, V magnitude, temperature (K).
    cat = json.loads((src / "stars.json").read_text())["stars"]
    stars = []
    for th, ph, m, T in cat:
        if m >= 9:  # the diffuse stand-in points of light-speed-nines are not real stars
            continue
        s = math.sin(th)
        stars.append([round(s * math.cos(ph), 4), round(s * math.sin(ph), 4), round(math.cos(th), 4), m, T])
    (OUT / "data" / "stars.json").write_text(json.dumps({"note": "HYG v4.0 (CC BY-SA 4.0), V<=7.6, galactic unit vectors: x,y,z,mag,T",
                                                         "stars": stars}, separators=(",", ":")))
    for name, (f, crop) in PHOTOS.items():
        im = Image.open(src / f).convert("RGB")
        if crop:
            w, h = im.size
            im = im.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h)))
        im.thumbnail((2400, 2400), Image.LANCZOS)
        im.save(OUT / "photos" / name, quality=86, optimize=True)
    tot = sum(p.stat().st_size for p in OUT.rglob("*") if p.is_file())
    print(f"library -> {OUT} ({tot / 1e6:.1f} MB)")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
