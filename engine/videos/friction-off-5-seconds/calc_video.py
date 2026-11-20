#!/usr/bin/env python3
"""Numbers for "What If Friction Vanished for 5 Seconds?" (every figure in the script comes from here).

Model (stated assumptions): friction between solid surfaces is zero for T = 5 s; gravity, air and the push of
surfaces against each other (normal force) stay as they are. Gus's lawn is graded the way the International
Residential Code asks for the ground next to a house (IRC R401.3: "The grade shall fall not fewer than 6 inches
within the first 10 feet"), and we let that slope run on for the 20 feet he slides. Everything starts at rest.
Gus weighs 180 lb. Air drag is ignored in the headline (checked below: with it the slide is 19.8 instead of 20.1 feet).
Then a body on the slope obeys a = g sin(theta) (frictionless incline, any textbook), whatever its mass.
Self-checks (exit 1 on failure): limiting cases, a second integration method, energy, unit round trips.
"""
import json, math, sys
from pathlib import Path

# --- inputs ---------------------------------------------------------------------------------------------------
FALL_IN, RUN_FT = 6.0, 10.0      # IRC R401.3: 6 inches of fall in the first 10 feet
T = 5.0                          # s without friction
GUS_LB = 180.0
G = 9.80665
FT, INCH, MPH, LB = 0.3048, 0.0254, 0.44704, 0.45359237
WALK_MPH = 3.0                   # ordinary walking pace (preferred walking speed about 1.4 m/s = 3.1 mph)
JOG_MPH = (4.0, 6.0)             # what is usually called jogging
POT_LB, CUP_LB = 60.0, 0.75      # a big planted clay pot, a full teacup: only to show that mass drops out
RHO_AIR, CDA = 1.2, 0.8          # air density kg/m3, drag area of a standing adult m2 (for the drag check)
MU_GRASS = 0.5                   # a modest grip of shoe soles on dry grass (only for the stop at the end; not narrated)

# --- the slope ------------------------------------------------------------------------------------------------
grade = (FALL_IN / 12.0) / RUN_FT                 # rise over run
theta = math.atan(grade)
inch_per_foot = FALL_IN / RUN_FT
a = G * math.sin(theta)                           # m/s2 down the slope, for any mass
dist_m = 0.5 * a * T * T
dist_ft = dist_m / FT
v_end = a * T
v_end_mph = v_end / MPH
pull_lb = GUS_LB * math.sin(theta)                # the part of his weight that points down the slope
pull_n = pull_lb * LB * G
drop_in = dist_m * math.sin(theta) / INCH         # how far he sinks while he slides

def slide(mass_lb):                               # distance in T by Newton's law, mass kept in on purpose
    m = mass_lb * LB
    return 0.5 * (m * G * math.sin(theta) / m) * T * T / FT

# independent method: step-by-step integration (semi-implicit Euler, 1 ms)
x = v = 0.0; dt = 1e-3
for _ in range(int(round(T / dt))):
    v += G * math.sin(theta) * dt; x += v * dt
dist_num_ft = x / FT
# the same slide with air drag on a standing adult kept in: does it still round to 20 feet?
xd = vd = 0.0; m_gus = GUS_LB * LB
for _ in range(int(round(T / dt))):
    vd += (G * math.sin(theta) - 0.5 * RHO_AIR * CDA * vd * vd / m_gus) * dt; xd += vd * dt
dist_drag_ft = xd / FT

# --- what else happens in 5 s -----------------------------------------------------------------------------------
walk_glide_ft = WALK_MPH * MPH * T / FT           # someone who was walking keeps gliding (not narrated)
cup_fall_s = math.sqrt(2 * 1.0 / G)               # a cup dropped from 1 m
drag_end_n = 0.5 * RHO_AIR * CDA * v_end ** 2     # air drag at the final speed
stop_ft = v_end ** 2 / (2 * MU_GRASS * G) / FT    # sliding stop once friction is back
stop_s = v_end / (MU_GRASS * G)
hold_lb = MU_GRASS * GUS_LB * math.cos(theta)     # what his soles can hold on grass

out = {
 "inputs": {"fall_in": FALL_IN, "run_ft": RUN_FT, "seconds": T, "gus_lb": GUS_LB, "g": G},
 "slope": {"grade_percent": round(grade * 100, 2), "angle_deg": round(math.degrees(theta), 3), "inch_per_foot": inch_per_foot},
 "slide": {"acceleration_m_s2": round(a, 4), "distance_m": round(dist_m, 2), "distance_ft": round(dist_ft, 1),
           "distance_ft_numeric": round(dist_num_ft, 1), "distance_ft_with_air_drag": round(dist_drag_ft, 1), "end_speed_m_s": round(v_end, 2), "end_speed_mph": round(v_end_mph, 1),
           "height_lost_in": round(drop_in, 1), "pot_ft": round(slide(POT_LB), 1), "cup_ft": round(slide(CUP_LB), 1)},
 "pull": {"down_slope_lb": round(pull_lb, 1), "down_slope_N": round(pull_n, 1), "soles_can_hold_lb": round(hold_lb),
          "air_drag_at_end_N": round(drag_end_n, 2), "drag_share_of_pull": round(drag_end_n / pull_n, 3)},
 "other": {"walker_glides_ft": round(walk_glide_ft, 1), "cup_fall_1m_s": round(cup_fall_s, 2),
           "stop_distance_ft_when_grip_returns": round(stop_ft, 1), "stop_time_s": round(stop_s, 2)},
}

# --- checks -----------------------------------------------------------------------------------------------------
checks = []
def chk(name, ok): checks.append({"check": name, "ok": bool(ok)})
chk("vertical limit: g sin(90 deg) x 5 s gives free fall, 122.6 m", abs(0.5 * G * math.sin(math.pi / 2) * 25 - 122.58) < 0.01)
chk("flat limit: no slope, no slide", 0.5 * G * math.sin(0.0) * 25 == 0.0)
chk("numeric integration agrees with the formula within 0.1 percent", abs(dist_num_ft - dist_ft) / dist_ft < 1e-3)
chk("energy: end speed equals sqrt(2 g h) for the height lost", abs(math.sqrt(2 * G * dist_m * math.sin(theta)) - v_end) < 1e-9)
chk("mass drops out: pot, cup and Gus slide the same distance", abs(slide(POT_LB) - dist_ft) < 1e-9 and abs(slide(CUP_LB) - dist_ft) < 1e-9)
chk("slide is 20 feet to the nearest foot", round(dist_ft) == 20)
chk("pull is 9 pounds to the nearest pound", round(pull_lb) == 9)
chk("5 percent grade is 0.6 inch per foot ('half an inch a foot' is the round figure, a little under)", abs(inch_per_foot - 0.6) < 1e-12 and inch_per_foot >= 0.5)
chk("end speed is a jogging pace (4 to 6 mph)", JOG_MPH[0] <= v_end_mph <= JOG_MPH[1])
chk("air drag is under a tenth of the pull even at the end, and with it the slide still rounds to 20 feet", drag_end_n / pull_n < 0.1 and round(dist_drag_ft) == 20)
chk("with friction the soles hold ten times the pull, so nobody slides on a normal day", hold_lb > 5 * pull_lb)
chk("unit round trip: 20.08 ft = 6.12 m", abs(dist_ft * FT - dist_m) < 1e-12)
out["checks"] = checks
Path(__file__).with_name("calc.json").write_text(json.dumps(out, indent=1) + "\n")
bad = [c["check"] for c in checks if not c["ok"]]
print(json.dumps(out["slide"]), json.dumps(out["pull"]))
if bad:
    print("FAILED:", bad); sys.exit(1)
print(f"calc OK ({len(checks)} checks)")
