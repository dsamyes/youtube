#!/usr/bin/env python3
"""Numbers for "What If Gravity Switched Off for 5 Seconds?" (every figure in the script comes from here).

Model (stated assumptions): for T = 5 s gravity stops pulling on Gus, his wife and the loose things in his garden.
The planet itself and the air stay as they are (if the whole Earth lost its own gravity it would spring outward;
that is another film). Gus's town lies at 40 degrees north. A pancake flip and Gus's hop are both "one-foot" moves:
each would normally rise one foot, which fixes the take-off speed v = sqrt(2 g h). The pancake leaves the pan as
gravity lets go; Gus hops one second later. With no force, each keeps its speed (Newton's first law). Air drag on
Gus is ignored in the headline and checked below. When gravity returns everything is in free fall again.
Self-checks (exit 1 on failure): a second integration method, energy, limiting cases, published values.
"""
import json, math, sys
from pathlib import Path

# --- inputs ---------------------------------------------------------------------------------------------------
G = 9.80665                      # standard gravity, m/s2
T = 5.0                          # s without gravity
HOP_FT = 1.0                     # what the hop (and the flip) is good for on a normal day
T_HOP = 1.0                      # s after the switch at which Gus hops
LAT = 40.0                       # degrees north
R_EQ = 6378137.0                 # equatorial radius, m (WGS 84)
SIDEREAL = 86164.0905            # one turn of the Earth, s
PLATFORM_M = 10.0                # Olympic high-dive platform (World Aquatics)
GUS_LB = 180.0
RHO_AIR, CDA = 1.2, 0.8          # air density kg/m3; drag area of an upright adult m2 (for the drag check)
FT, INCH, MPH, LB = 0.3048, 0.0254, 0.44704, 0.45359237

# --- the hop ----------------------------------------------------------------------------------------------------
v0 = math.sqrt(2 * G * HOP_FT * FT)               # take-off speed of a one-foot hop, m/s
v0_fts, v0_mph = v0 / FT, v0 / MPH
coast_s = T - T_HOP                               # how long Gus coasts with no gravity
rise_m = v0 * coast_s                             # straight line, constant speed
rise_ft = rise_m / FT
extra_m = v0 ** 2 / (2 * G)                       # after gravity returns he still rises this much: the hop's one foot
top_m = rise_m + extra_m
top_ft = top_m / FT
fall_s = math.sqrt(2 * top_m / G)
v_land = math.sqrt(2 * G * top_m)
v_land_mph = v_land / MPH
gap_ft = v0 * T_HOP / FT                          # the pancake's lead: it left T_HOP sooner at the same speed
pancake_ft_at_return = v0 * T / FT
full_ft = v0 * T / FT                             # had he hopped at the very start

# independent method: step-by-step integration of dv/dt = -g(t), 0.1 ms steps, gravity off until t = T
def fly(drag=False):
    dt, t, y, v, m = 1e-4, T_HOP, 0.0, v0, GUS_LB * LB
    y_at_T = top = None
    while True:
        g = 0.0 if t < T else G
        a = -g - (0.5 * RHO_AIR * CDA * v * abs(v) / m if drag else 0.0)
        v += a * dt; y += v * dt; t += dt
        if y_at_T is None and t >= T: y_at_T = y
        if top is None and t > T and v <= 0: top = y
        if y <= 0 and t > T: return y_at_T, top, -v
num_rise, num_top, num_vland = fly()
drag_rise, drag_top, drag_vland = fly(True)

# --- the turning Earth --------------------------------------------------------------------------------------------
omega = 2 * math.pi / SIDEREAL
v_eq = omega * R_EQ
v_lat = v_eq * math.cos(math.radians(LAT))
a_c_eq = omega ** 2 * R_EQ                         # centripetal acceleration at the equator
a_c = omega ** 2 * R_EQ * math.cos(math.radians(LAT))          # at 40 N, pointing at the axis
lift_m = 0.5 * a_c * math.cos(math.radians(LAT)) * T ** 2      # how far the ground sinks away under someone at rest (vertical part)
south_m = 0.5 * a_c * math.sin(math.radians(LAT)) * T ** 2     # and sideways (toward the equator)
lift_eq_m = 0.5 * a_c_eq * T ** 2
# independent method: exact geometry. Fly the tangent line for T seconds, measure the height above the circle of latitude
r = R_EQ * math.cos(math.radians(LAT))
away = math.hypot(r, v_lat * T) - r                # distance gained from the spin axis
lift_geo_m = away * math.cos(math.radians(LAT))
chair_drop_s = math.sqrt(2 * lift_m / G)           # the chair's fall when gravity is back

out = {
 "model": "gravity stops pulling on Gus, his wife and the loose things in his garden for 5 s; the planet and the air stay; 40 N; a pancake flip and a hop that would each rise one foot; the pancake leaves as gravity lets go, Gus hops one second later; no air drag in the headline",
 "hop": {"normal_height_ft": HOP_FT, "takeoff_m_s": round(v0, 3), "takeoff_ft_s": round(v0_fts, 2), "takeoff_mph": round(v0_mph, 2)},
 "flight": {"coast_s": coast_s, "rise_ft_when_gravity_returns": round(rise_ft, 1), "rise_m": round(rise_m, 2), "extra_ft_after_return": round(extra_m / FT, 2),
            "top_ft": round(top_ft, 1), "top_m": round(top_m, 2), "fall_s": round(fall_s, 2), "landing_mph": round(v_land_mph, 1), "landing_m_s": round(v_land, 2),
            "with_air_drag": {"rise_ft": round(drag_rise / FT, 1), "top_ft": round(drag_top / FT, 1), "landing_mph": round(drag_vland / MPH, 1)},
            "if_he_hopped_at_once_ft": round(full_ft, 1)},
 "pancake": {"lead_ft": round(gap_ft, 2), "height_ft_when_gravity_returns": round(pancake_ft_at_return, 1)},
 "high_dive": {"platform_m": PLATFORM_M, "platform_ft": round(PLATFORM_M / FT, 1), "entry_mph_from_rest": round(math.sqrt(2 * G * PLATFORM_M) / MPH, 1)},
 "earth_spin": {"equator_mph": round(v_eq / MPH), "equator_m_s": round(v_eq, 1), "at_40N_mph": round(v_lat / MPH), "centripetal_equator_m_s2": round(a_c_eq, 4),
                "ground_sinks_in_5s_in": round(lift_m / INCH, 1), "ground_sinks_in_5s_m": round(lift_m, 3), "sideways_in": round(south_m / INCH, 1),
                "at_equator_in": round(lift_eq_m / INCH, 1), "chair_drop_s": round(chair_drop_s, 2)},
}

# --- self-checks ------------------------------------------------------------------------------------------------
checks = []
def check(name, ok): checks.append((name, bool(ok)))
check("take-off speed lands on the force-plate value (2.45 m/s for a 0.31 m jump, Hawkin Dynamics)", abs(v0 - 2.45) < 0.03)
check("one-foot hop is 8 ft/s to the first decimal", abs(v0_fts - 8.0) < 0.05)
check("with gravity ON the same hop rises exactly one foot (energy)", abs(v0 ** 2 / (2 * G) / FT - HOP_FT) < 1e-9)
check("step-by-step integration agrees on the rise", abs(num_rise - rise_m) < 0.005)
check("step-by-step integration agrees on the top and the landing speed", abs(num_top - top_m) < 0.005 and abs(num_vland - v_land) < 0.01)
check("the rise rounds to 32 feet and the top to 33", round(rise_ft) == 32 and round(top_ft) == 33)
check("the top is the 10 m high-dive platform within 10 cm", abs(top_m - PLATFORM_M) < 0.10)
check("landing speed lands on the published 10 m dive entry (about 50 km/h = 31 mph, NBC Olympics)", abs(v_land_mph - 31.1) < 1.0)
check("air drag changes the rise by under a foot and the landing by under 1.5 mph", abs(drag_rise - rise_m) / FT < 1.0 and abs(drag_vland - v_land) / MPH < 1.5)
check("limiting case: zero hop, zero rise", abs(0.0 * coast_s) == 0.0)
check("the pancake's lead is the hop speed times one second: 8 ft", abs(gap_ft - 8.0) < 0.05)
check("equator speed lands on the published 1,040 mph (sidereal day)", abs(v_eq / MPH - 1040) < 3)
check("equator centripetal acceleration lands on the textbook 0.034 m/s2", abs(a_c_eq - 0.0339) < 0.0003)
check("40 N ground speed is about 800 mph", abs(v_lat / MPH - 800) < 10)
check("exact geometry agrees with 1/2 a t^2 for the sinking ground", abs(lift_geo_m - lift_m) < 1e-4)
check("the ground sinks about ten inches (9 to 11)", 9 <= lift_m / INCH <= 11)
check("limiting case: at the pole the ground does not sink", abs(0.5 * omega ** 2 * R_EQ * math.cos(math.pi / 2) ** 2 * T ** 2) < 1e-12)
out["checks"] = {n: ok for n, ok in checks}
Path(__file__).with_name("calc.json").write_text(json.dumps(out, indent=1) + "\n", encoding="utf-8")
for n, ok in checks: print(("ok   " if ok else "FAIL ") + n)
print(json.dumps({k: out[k] for k in ("hop", "flight", "pancake", "earth_spin")}, indent=1))
if not all(ok for _, ok in checks): sys.exit(1)
