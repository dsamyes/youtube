#!/usr/bin/env python3
"""Numbers of "What If Both Engines Quit on Your Plane?" (engines-quit-midflight).

Model (stated assumptions): an airliner at 38,000 ft loses all thrust in still air and is flown at its best
glide speed. In a steady glide the lift-to-drag ratio L/D is the distance covered per height lost, so
distance = height x L/D. L/D = 15 is taken as a round, cautious value: published cruise L/D of airliners is 15 to
19 (A320-200 16.3, 747-400 15.5, 777-200 19.3), a real glide with windmilling engines is a little worse.
Time comes from integrating the sink rate (true airspeed / L/D) through the International Standard Atmosphere at a
constant calibrated glide speed of 230 knots (taken as equivalent airspeed).
Writes calc.json next to this file; exits 1 if a check fails. Standard library only.
"""
import json, math, sys
from pathlib import Path

FT, NM, MI, KT, G = 0.3048, 1852.0, 1609.344, 0.514444, 9.80665
H0_FT = 38000.0            # cruise altitude (story)
LD = 15.0                  # glide ratio used in the script
LD_RANGE = (12.0, 17.0)    # about 12 flown by the 1983 767 glide; about 17 quoted for clean narrow-bodies
GLIDE_KEAS = 230.0         # best-glide speed, order of an A320/A330 "green dot" speed
RAMP = 12.0                # ADA 405.2: a ramp run is no steeper than 1:12
TOD_NM_PER_1000FT = 3.0    # the pilots' 3-to-1 rule for a normal (idle thrust) descent
# the 2001 Atlantic glide (Air Transat 236, A330): second engine out 65 nmi from Lajes at about 34,500 ft, landed 19 min later
AT_NM, AT_FT, AT_MIN, AT_PEOPLE = 65.0, 34500.0, 19.0, 306


def isa_density(h_m: float) -> float:
    """ISA density, kg/m3, up to 20 km"""
    T0, P0, L, R = 288.15, 101325.0, 0.0065, 287.053
    if h_m <= 11000.0:
        T = T0 - L * h_m; p = P0 * (T / T0) ** (G / (L * R))
    else:
        T = 216.65; p = P0 * (T / T0) ** (G / (L * R)) * math.exp(-G * (h_m - 11000.0) / (R * T))
    return p / (R * T)


def glide(h0_ft: float, ld: float, keas: float):
    """integrate a still-air glide to the ground: returns (minutes, ground distance m, mean sink ft/min)"""
    rho0, h, t, x, dt = isa_density(0.0), h0_ft * FT, 0.0, 0.0, 0.5
    gamma = math.atan(1.0 / ld)
    while h > 0.0:
        tas = keas * KT * math.sqrt(rho0 / isa_density(h))
        h -= tas * math.sin(gamma) * dt; x += tas * math.cos(gamma) * dt; t += dt
    return t / 60.0, x, h0_ft / (t / 60.0)


checks = []
def check(name: str, ok: bool, detail: str = ""): checks.append({"check": name, "ok": bool(ok), "detail": detail})

h_mi = H0_FT * FT / MI
dist_mi = h_mi * LD
dist_lo, dist_hi = h_mi * LD_RANGE[0], h_mi * LD_RANGE[1]
minutes, x_m, sink_fpm = glide(H0_FT, LD, GLIDE_KEAS)
slope_deg, ramp_deg = math.degrees(math.atan(1 / LD)), math.degrees(math.atan(1 / RAMP))
fall_vacuum_s = math.sqrt(2 * H0_FT * FT / G)
tod_nm = H0_FT / 1000 * TOD_NM_PER_1000FT
tod_mi = tod_nm * NM / MI
tod_ratio = TOD_NM_PER_1000FT * NM / (1000 * FT)
at_mi = AT_NM * NM / MI
at_ratio_flown = AT_NM * NM / (AT_FT * FT)
at_minutes_model, _, _ = glide(AT_FT, LD, GLIDE_KEAS)

# 1 the integration must reproduce distance = height x L/D (independent of the speed schedule)
check("integrated glide distance = height x L/D within 0.5 %", abs(x_m / MI - dist_mi) / dist_mi < 0.005, f"{x_m / MI:.1f} mi vs {dist_mi:.1f} mi")
# 2 ISA density at the tropopause must land on the published 0.3639 kg/m3
check("ISA density at 11 km = 0.3639 kg/m3", abs(isa_density(11000.0) - 0.3639) < 0.0005, f"{isa_density(11000.0):.4f}")
# 3 the real 2001 glide must fit inside the model: it covered 75 miles from 34,500 ft and arrived with height to spare
check("2001 glide (65 nmi from 34,500 ft) needs less than L/D 15", at_ratio_flown < LD, f"flown ratio {at_ratio_flown:.1f}")
check("2001 glide lasted 19 min; model from 34,500 ft within 25 %", abs(at_minutes_model - AT_MIN) / AT_MIN < 0.25, f"model {at_minutes_model:.1f} min")
# 4 'about twenty minutes'
check("glide time from 38,000 ft is 17 to 23 minutes", 17 <= minutes <= 23, f"{minutes:.1f} min, mean sink {sink_fpm:.0f} ft/min")
# 5 'over a hundred miles' with L/D 15; the cautious end of the range is still more than the 2001 glide
check("L/D 15 gives more than 100 miles", dist_mi > 100, f"{dist_mi:.0f} mi (range {dist_lo:.0f} to {dist_hi:.0f})")
check("even L/D 12 beats the 75 miles flown in 2001", dist_lo > at_mi, f"{dist_lo:.0f} mi vs {at_mi:.0f} mi")
# 6 'flatter than a wheelchair ramp'
check("glide slope is flatter than a 1:12 ramp", slope_deg < ramp_deg, f"{slope_deg:.2f} deg vs {ramp_deg:.2f} deg")
# 7 'seven miles up'
check("38,000 ft is about seven miles", 6.8 < h_mi < 7.5, f"{h_mi:.2f} mi")
# 8 a normal descent starts 'more than a hundred miles out' and is about as flat as the glide
check("3-to-1 rule from 38,000 ft is more than 100 miles", tod_mi > 100, f"{tod_nm:.0f} nmi = {tod_mi:.0f} mi, ratio {tod_ratio:.1f}:1")
# 9 limiting case: with no wings at all (no air) the fall would take under a minute; the glide is 20 times longer
check("glide lasts more than 20 times a vacuum free fall", minutes * 60 / fall_vacuum_s > 20, f"free fall {fall_vacuum_s:.0f} s")

out = {
 "inputs": {"altitude_ft": H0_FT, "glide_ratio": LD, "glide_ratio_range": LD_RANGE, "glide_speed_keas": GLIDE_KEAS},
 "height": {"miles": round(h_mi, 2), "seven_miles": round(h_mi)},
 "glide": {"distance_mi": round(dist_mi), "distance_km": round(dist_mi * MI / 1000), "distance_mi_low": round(dist_lo), "distance_mi_high": round(dist_hi),
           "minutes": round(minutes, 1), "mean_sink_ft_per_min": round(sink_fpm), "slope_deg": round(slope_deg, 2),
           "tas_start_mph": round(GLIDE_KEAS * KT * math.sqrt(isa_density(0) / isa_density(H0_FT * FT)) / MI * 3600)},
 "ramp": {"ratio": RAMP, "slope_deg": round(ramp_deg, 2)},
 "free_fall": {"vacuum_seconds": round(fall_vacuum_s, 1)},
 "normal_descent": {"nm_per_1000ft": TOD_NM_PER_1000FT, "start_nm": round(tod_nm), "start_mi": round(tod_mi), "ratio": round(tod_ratio, 1)},
 "glide_2001": {"miles": round(at_mi), "nmi": AT_NM, "from_ft": AT_FT, "minutes": AT_MIN, "people": AT_PEOPLE, "ratio_flown": round(at_ratio_flown, 1), "model_minutes": round(at_minutes_model, 1)},
 "checks": checks,
}
Path(__file__).with_name("calc.json").write_text(json.dumps(out, indent=1) + "\n")
for c in checks: print(("ok   " if c["ok"] else "FAIL ") + c["check"] + (" [" + c["detail"] + "]" if c["detail"] else ""))
print(f"glide: {dist_mi:.0f} mi in {minutes:.1f} min from {h_mi:.2f} mi up; slope {slope_deg:.2f} deg (ramp {ramp_deg:.2f})")
sys.exit(1 if any(not c["ok"] for c in checks) else 0)
