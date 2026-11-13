#!/usr/bin/env python3
"""Numbers for "What If You Jumped Into a Hole Through the Earth?" (every figure in the script comes from here).

Model: an airless, frictionless tunnel through the centre of a non-rotating Earth.
  - uniform-density Earth (the textbook answer)
  - PREM density profile (Dziewonski & Anderson 1981), the realistic answer (Klotz 2015, Am. J. Phys. 83, 231)
Self-checks: the PREM profile must reproduce Earth's mass and surface gravity, and Klotz's 38 min 11 s.
"""
import json, math
from pathlib import Path

G = 6.674e-11
R = 6.371e6
M_EARTH = 5.972e24
G0 = 9.81

# PREM density (g/cm^3) as polynomials in x = r / 6371 km: (r_outer_km, [a0, a1, a2, a3])
PREM = [
    (1221.5, [13.0885, 0.0, -8.8381, 0.0]),
    (3480.0, [12.5815, -1.2638, -3.6426, -5.5281]),
    (5701.0, [7.9565, -6.4761, 5.5283, -3.0807]),
    (5771.0, [5.3197, -1.4836, 0.0, 0.0]),
    (5971.0, [11.2494, -8.0298, 0.0, 0.0]),
    (6151.0, [7.1089, -3.8045, 0.0, 0.0]),
    (6346.6, [2.6910, 0.6924, 0.0, 0.0]),
    (6356.0, [2.900, 0.0, 0.0, 0.0]),
    (6368.0, [2.600, 0.0, 0.0, 0.0]),
    (6371.0, [1.020, 0.0, 0.0, 0.0]),
]

def rho(r):
    x = r / R
    for r_out, c in PREM:
        if r <= r_out * 1e3 + 1e-6:
            return 1e3 * (c[0] + c[1] * x + c[2] * x * x + c[3] * x ** 3)
    return 0.0

N = 200_000
dr = R / N
mass = [0.0] * (N + 1)          # mass inside radius i*dr (midpoint shells)
for i in range(1, N + 1):
    rm = (i - 0.5) * dr
    mass[i] = mass[i - 1] + 4 * math.pi * rm * rm * rho(rm) * dr
def g_prem(r):
    if r <= 0: return 0.0
    f = min(N, r / dr); i = int(f); m = mass[i] + (mass[min(N, i + 1)] - mass[i]) * (f - i)
    return G * m / (r * r)

def fall(gfun, dt=0.05):
    """Drop from rest at the surface; returns one-way time, speed at the centre, and (t, depth, v) samples."""
    r, v, t = R, 0.0, 0.0
    samples = []; t_bullet = None; v_centre = None; t_centre = None
    while True:
        a = gfun(abs(r)) * (1 if r > 0 else -1)      # toward the centre
        v_new = v + a * dt                            # semi-implicit Euler (symplectic)
        r_new = r - v_new * dt
        t += dt
        if t_bullet is None and v_new >= 1000.0: t_bullet = t
        if r > 0 >= r_new: v_centre, t_centre = v_new, t
        if int(t / 30) != int((t - dt) / 30): samples.append((round(t), round((R - abs(r_new)) / 1e3), round(v_new)))
        if v_new <= 0 and r_new < 0:                  # turned around on the far side
            return {"one_way_s": t, "v_centre": v_centre, "t_centre_s": t_centre, "t_1kms_s": t_bullet, "far_side_overshoot_km": (abs(r_new) - R) / 1e3, "samples": samples}
        r, v = r_new, v_new

uni = fall(lambda r: G0 * r / R)
prem = fall(g_prem)
fmt = lambda s: f"{int(s // 60)} min {int(round(s % 60))} s"
g_max = max((g_prem(i * dr), i * dr) for i in range(1, N + 1))

out = {
    "model": "airless frictionless tunnel through the centre, non-rotating Earth",
    "checks": {
        "prem_mass_kg": mass[N], "prem_mass_error_pct": 100 * (mass[N] / M_EARTH - 1),
        "prem_surface_g": g_prem(R), "klotz_2015_one_way": "38 min 11 s", "prem_one_way": fmt(prem["one_way_s"]),
        "uniform_analytic_one_way_s": math.pi * math.sqrt(R / G0), "uniform_numeric_one_way_s": uni["one_way_s"],
    },
    "uniform": {"one_way": fmt(uni["one_way_s"]), "one_way_min": uni["one_way_s"] / 60, "v_centre_kms": uni["v_centre"] / 1e3, "v_centre_kmh": uni["v_centre"] * 3.6},
    "prem": {
        "one_way": fmt(prem["one_way_s"]), "one_way_min": prem["one_way_s"] / 60, "round_trip_min": 2 * prem["one_way_s"] / 60,
        "t_centre_min": prem["t_centre_s"] / 60, "v_centre_kms": prem["v_centre"] / 1e3, "v_centre_kmh": prem["v_centre"] * 3.6, "v_centre_mph": prem["v_centre"] * 2.23694,
        "t_to_1_km_per_s_s": prem["t_1kms_s"], "g_max_ms2": g_max[0], "g_max_depth_km": (R - g_max[1]) / 1e3,
        "samples_t_s_depth_km_v_ms": prem["samples"][::4],
    },
    "comparisons": {
        "rifle_bullet_ms": "about 900-1000 m/s (5.56 NATO ~940 m/s)",
        "atlantic_NY_London_km": 5570, "atlantic_at_centre_speed_min": 5570 / (prem["v_centre"] / 1e3) / 60,
        "iss_speed_kms": 7.66, "centre_speed_vs_iss": prem["v_centre"] / 7660,
        "gravity_train_any_chord_uniform_min": math.pi * math.sqrt(R / G0) / 60,
    },
    "facts_with_sources": {
        "inner_core_temp": "about 5,200-5,700 C at the inner-core boundary; NASA/ESRF 2013 estimate ~6,000 C (Anzellini et al., Science 340, 464). Sun's photosphere ~5,500 C (NASA Sun fact sheet).",
        "antipodes": "about 15% of land is antipodal to other land (~4.4% of Earth's surface); for most places the antipode is ocean (Wikipedia: Antipodes).",
        "prem": "Dziewonski & Anderson 1981, Phys. Earth Planet. Inter. 25, 297.",
        "klotz": "A. R. Klotz 2015, 'The gravity tunnel in a non-uniform Earth', Am. J. Phys. 83, 231: 38 min 11 s with PREM vs 42 min 12 s uniform.",
    },
}
Path(__file__).with_name("calc.json").write_text(json.dumps(out, indent=2) + "\n")
c = out["checks"]
assert abs(c["prem_mass_error_pct"]) < 0.5, c
assert abs(c["prem_surface_g"] - 9.82) < 0.05, c
assert abs(prem["one_way_s"] - (38 * 60 + 11)) < 15, prem["one_way_s"]
assert abs(uni["one_way_s"] - c["uniform_analytic_one_way_s"]) < 2
print(json.dumps({k: out[k] for k in ("checks", "uniform")}, indent=1)); p = out["prem"]; print({k: (round(v, 2) if isinstance(v, float) else v) for k, v in p.items() if k != "samples_t_s_depth_km_v_ms"}); print(out["comparisons"]); print(p["samples_t_s_depth_km_v_ms"][:8])
