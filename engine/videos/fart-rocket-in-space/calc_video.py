#!/usr/bin/env python3
"""Numbers for "What If a Fart Was Your Only Rocket in Space?" (every figure in the script comes from here).

Model: Gus floats at rest relative to his ship, 10 ft from the hatch, in a spacesuit. Conservation of momentum:
whatever leaves him at speed u with mass m gives him the speed m*u/(M - m) the other way.
  - the fart: the median volume of one passage (Tomlin, Lowis & Read 1991, Gut 32, 665: 90 ml, range 33-125 ml)
    at body temperature and with the density of air (generous: the hydrogen-rich mix measured in that study is
    lighter), leaving at 10 ft/s. Nobody has published a measured exit speed; 10 ft/s is the popular figure
    (J. Dawson 1999) and is ASSUMED. Check 2 below shows it is what volume / time / opening gives.
    It is also assumed, generously, that all of it leaves the suit straight backwards. (It does not: a spacesuit
    is airtight, so the real push is zero. That is the ending of the script.)
  - the slipper: half a pound thrown at 20 mph (an easy throw; assumed).
Self-checks (exit non-zero when one fails):
  1. limiting case: the exact rocket equation (Tsiolkovsky) must give the same speed as m*u/M for a tiny mass
  2. the assumed exit speed must lie inside the range that continuity (volume / time / opening area) allows
  3. published value: the same formula must land near NASA's figure for the SAFER rescue jetpack
     (3 lb of nitrogen -> about 10 ft/s)
  4. the gas mass must reproduce the density of air at 37 C from the ideal gas law (1.14 g/L)
"""
import json, math, sys
from pathlib import Path

LB, FT, MPH, G0 = 0.45359237, 0.3048, 0.44704, 9.80665
R_GAS, P_ATM = 8.314462, 101325.0

# ---- inputs ----
gus_lb, suit_lb = 180.0, 280.0                 # Gus (as in earlier episodes); NASA spacewalk suit, about 280 lb on the ground
fart_ml = 90.0                                 # median volume of one passage (Tomlin et al. 1991)
fart_ml_range = (33.0, 125.0)
body_T = 310.15                                # 37 C
molar_air = 0.028964                           # kg/mol
fart_speed_fts = 10.0                          # ASSUMED exit speed
gap_ft = 10.0                                  # distance to the hatch
oxygen_h = 8.0                                 # primary life support of the suit
hair_um = (17.0, 181.0)                        # range of human hair diameters; typical about 70-100
slipper_lb, throw_mph = 0.5, 20.0
farts_per_day = 8                              # median number of passages a day in the study (daytime)

# ---- the fart ----
M = (gus_lb + suit_lb) * LB
rho = P_ATM * molar_air / (R_GAS * body_T)     # kg/m3
m_f = rho * fart_ml * 1e-6
u_f = fart_speed_fts * FT
v_f = m_f * u_f / (M - m_f)
t_gap_s = gap_ft * FT / v_f
per_min_um = v_f * 60 * 1e6
in_oxygen_m = v_f * oxygen_h * 3600
mph_farts = MPH / v_f

# the hydrogen-rich mix of the study (medians per day: H2 361 ml, CO2 68 ml, rest of 705 ml taken as N2)
mm_mix = (361 * 2.016 + 68 * 44.01 + (705 - 361 - 68) * 28.013) / 705 / 1000
m_f_mix = P_ATM * mm_mix / (R_GAS * body_T) * fart_ml * 1e-6

# ---- the slipper ----
m_s, u_s = slipper_lb * LB, throw_mph * MPH
v_s = m_s * u_s / (M - m_s)
t_slipper_s = gap_ft * FT / v_s
farts_per_slipper = (m_s * u_s) / (m_f * u_f)

# ---- checks ----
checks = {}
v_exact = u_f * math.log(M / (M - m_f))        # 1. Tsiolkovsky
checks["rocket_equation_vs_momentum_rel_diff"] = abs(v_exact / v_f - 1)
# 2. continuity: 90 ml in 0.5-2 s through an opening of 0.2-1 cm2
cont = [fart_ml * 1e-6 / (t * a * 1e-4) for t in (0.5, 2.0) for a in (0.2, 1.0)]
checks["continuity_speed_range_m_s"] = [min(cont), max(cont)]
# 3. SAFER: 1.4 kg (3 lb) of nitrogen, cold-gas specific impulse about 70 s, astronaut + suit + 38 kg unit
safer_m, safer_isp, safer_total = 1.4, 70.0, M + 38.0
safer_dv = safer_isp * G0 * math.log(safer_total / (safer_total - safer_m))
checks["safer_delta_v_m_s"] = safer_dv
checks["safer_published_m_s"] = 10 * FT
checks["air_density_37C_g_per_L"] = rho

out = {
    "model": "momentum conservation, Gus at rest 10 ft from the hatch, all the gas leaves straight backwards (generous)",
    "inputs": {"gus_lb": gus_lb, "suit_lb": suit_lb, "fart_ml": fart_ml, "fart_speed_ft_s_ASSUMED": fart_speed_fts,
               "gap_ft": gap_ft, "oxygen_h": oxygen_h, "slipper_lb": slipper_lb, "throw_mph": throw_mph},
    "gus_and_suit_lb": gus_lb + suit_lb, "gus_and_suit_kg": M,
    "fart": {
        "mass_g": m_f * 1e3, "mass_g_hydrogen_rich_mix": m_f_mix * 1e3, "exit_speed_m_s": u_f,
        "gus_speed_m_s": v_f, "gus_speed_um_per_s": v_f * 1e6, "gus_speed_um_per_min": per_min_um,
        "hair_width_um_range": hair_um, "ten_feet_takes_days": t_gap_s / 86400, "ten_feet_takes_weeks": t_gap_s / 86400 / 7,
        "distance_in_8_h_oxygen_mm": in_oxygen_m * 1e3, "distance_in_8_h_oxygen_in": in_oxygen_m / 0.0254,
        "farts_for_1_mph": mph_farts, "years_for_1_mph_at_8_a_day": mph_farts / farts_per_day / 365.25,
        "mass_g_range_33_to_125_ml": [rho * v * 1e-3 for v in fart_ml_range],
    },
    "slipper": {"mass_kg": m_s, "throw_m_s": u_s, "gus_speed_mm_s": v_s * 1e3, "ten_feet_takes_s": t_slipper_s,
                "ten_feet_takes_min": t_slipper_s / 60, "worth_farts": farts_per_slipper},
    "checks": checks,
    "sources": {
        "fart_volume": "Tomlin, Lowis & Read, 'Investigation of normal flatus production in healthy volunteers', Gut 32, 665 (1991): 476-1491 ml/day (median 705), 33-125 ml per passage (median 90), median 8 passages",
        "fart_speed": "no published measurement; '10 ft/s' is the popular figure (J. Dawson, Who Cut the Cheese?, 1999). Assumed; consistent with check 2",
        "suit": "about 280 lb on the ground is the widely quoted figure for the NASA spacewalk suit (NASA EMU fact sheet: 113 kg = 250 lb without the SAFER jetpack; the enhanced ISS suit 319 lb); primary life support 8 h (sources give 6.5 to 8 h)",
        "safer": "NASA SAFER: 3 lb (1.4 kg) of nitrogen gives about 10 ft/s (3 m/s)",
        "hair": "human hair diameter 17-181 micrometres, typically 70-100 (Ley, The Physics Factbook)",
    },
}
Path(__file__).with_name("calc.json").write_text(json.dumps(out, indent=2) + "\n")
print(json.dumps(out, indent=1))
ok = True
def need(cond, msg):
    global ok
    if not cond: ok = False; print("CHECK FAILED:", msg, file=sys.stderr)
need(checks["rocket_equation_vs_momentum_rel_diff"] < 1e-5, "rocket equation and momentum formula disagree")
need(min(cont) <= u_f <= max(cont), "assumed exit speed outside the continuity range")
need(0.5 <= safer_dv / (10 * FT) <= 2.0, "SAFER delta-v is not near the published 10 ft/s")
need(abs(rho - 1.14) < 0.02, "air density at 37 C")
need(hair_um[0] <= per_min_um <= hair_um[1] and 60 <= per_min_um <= 110, "one minute of travel is not a typical hair's width")
need(21 < t_gap_s / 86400 < 28, "'over three weeks' no longer holds")
need(4.5 < t_slipper_s / 60 < 5.5, "'five minutes' no longer holds")
need(6000 <= farts_per_slipper < 7000, "'six thousand farts' no longer holds")
sys.exit(0 if ok else 1)
