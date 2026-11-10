#!/usr/bin/env python3
"""Build the star field used by the relativistic sky scenes (run once; output is committed).

Input : HYG database v4.0 CSV (astronexus, CC BY-SA 4.0), gzip, path given as argv[1].
Output: engine/remotion/src/videos/light-speed-nines/stars.json

Every star is stored in the SHIP frame at rest relative to the galaxy: the ship heads for the
galactic center, so its direction of travel is galactic (l, b) = (0, 0). For a star at galactic
(l, b): z = cos b cos l (toward the center), x = cos b sin l, y = sin b. We store
  th  = angle from the direction of travel (rad), ph = azimuth around it (rad),
  m   = apparent visual magnitude, T = temperature from B-V (Ballesteros 2012).
The diffuse Milky Way is a stand-in: faint 'unresolved' points spread along the galactic plane,
denser toward the center (an artistic model of unresolved starlight, flagged with m >= 9).
Scenes apply aberration, Doppler colour and beaming to all of them every frame.
"""
from __future__ import annotations

import csv
import gzip
import json
import math
import random
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "remotion" / "src" / "videos" / "light-speed-nines" / "stars.json"
MAG_LIMIT = 7.6

# J2000 equatorial -> galactic rotation matrix (IAU 1958 / Hipparcos definition)
R = [[-0.0548755604, -0.8734370902, -0.4838350155],
     [0.4941094279, -0.4448296300, 0.7469822445],
     [-0.8676661490, -0.1980763734, 0.4559837762]]


def bv_to_t(bv: float) -> float:
    """Ballesteros (2012) blackbody fit."""
    return 4600.0 * (1.0 / (0.92 * bv + 1.7) + 1.0 / (0.92 * bv + 0.62))


def to_ship(l_rad: float, b_rad: float) -> tuple[float, float]:
    z = math.cos(b_rad) * math.cos(l_rad)
    x = math.cos(b_rad) * math.sin(l_rad)
    y = math.sin(b_rad)
    return math.acos(max(-1.0, min(1.0, z))), math.atan2(y, x)


def main() -> None:
    src = Path(sys.argv[1])
    stars = []
    with gzip.open(src, "rt", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row["proper"] == "Sol":
                continue
            try:
                mag = float(row["mag"])
                ra, dec = float(row["rarad"]), float(row["decrad"])
            except ValueError:
                continue
            if mag > MAG_LIMIT:
                continue
            try:
                bv = float(row["ci"])
            except ValueError:
                bv = 0.6
            bv = max(-0.4, min(2.0, bv))
            ex = (math.cos(dec) * math.cos(ra), math.cos(dec) * math.sin(ra), math.sin(dec))
            g = [sum(R[i][j] * ex[j] for j in range(3)) for i in range(3)]
            l_rad, b_rad = math.atan2(g[1], g[0]), math.asin(max(-1.0, min(1.0, g[2])))
            th, ph = to_ship(l_rad, b_rad)
            stars.append([round(th, 5), round(ph, 4), round(mag, 2), int(round(bv_to_t(bv), -1))])
    # diffuse Milky Way stand-in (deterministic)
    rnd = random.Random(42)
    glow = 0
    while glow < 26000:
        l_deg = rnd.uniform(-180, 180)
        b_deg = rnd.gauss(0, 4.0 + 3.0 * (abs(l_deg) / 180))
        w = 0.35 + 0.65 * math.exp(-(l_deg / 55.0) ** 2) + 0.5 * math.exp(-(l_deg / 12.0) ** 2 - (b_deg / 6.0) ** 2)
        if rnd.random() > w / 1.5:
            continue
        th, ph = to_ship(math.radians(l_deg), math.radians(b_deg))
        mag = 9.0 + rnd.random() * 1.6
        T = rnd.choice([3800, 4300, 4700, 5200, 5800, 6500])
        stars.append([round(th, 5), round(ph, 4), round(mag, 2), T])
        glow += 1
    stars.sort(key=lambda s: s[2])
    data = {"note": "HYG v4.0 (CC BY-SA 4.0) stars to V=%.1f in the ship frame (heading = galactic center) "
                    "+ %d diffuse Milky Way stand-in points (m>=9). Columns: th, ph, m, T." % (MAG_LIMIT, glow),
            "stars": stars}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
    print(f"{len(stars) - glow} catalog stars + {glow} glow points -> {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
