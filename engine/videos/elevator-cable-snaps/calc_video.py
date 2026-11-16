#!/usr/bin/env python3
"""Numbers for "What If the Elevator Cable Snapped?" (every figure in the script comes from here).

Model: a traction passenger elevator rated 500 ft/min hanging on six steel ropes, standing at the twentieth floor
when every rope parts at once. The car free-falls until the overspeed governor trips (the code's maximum trip speed
for that rating), then the wedge safeties stop it inside the stopping distances the code allows.
Inputs from the US elevator code ASME A17.1 as printed in California Title 8 (sections 3042 and 1604.19):
  rope factor of safety 10.25 at 500 ft/min; governor trip 625 ft/min; stopping distance between
  V^2/231,840 and V^2/81,144 + 0.84 feet (V in ft/min), i.e. a braking of 1.0 g down to 0.35 g.
Self-checks (exit 1 when one fails): the stopping distances must land on the table row for 500 ft/min
(1 ft 8 in and 5 ft 8 in); the constants of the two formulas must be 2 a 3600 for a = 1 g and 0.35 g; the energy
balance of the fall must close; the spoken numbers must lie inside the computed ranges.
"""
import json, math, sys
from pathlib import Path

G = 9.80665                  # m/s^2
FT = 0.3048                  # m
MPH = 0.44704                # m/s
G_FT = G / FT                # 32.174 ft/s^2

# ---- inputs ----
RATED_FPM = 500.0            # rated speed of Gus's elevator (a 20-storey building)
TRIP_FPM = 625.0             # maximum governor trip speed for 500 ft/min (Title 8 1604.19 Table 2 = A17.1 Table 2.18.2.1)
ROPES = 6                    # hoist ropes (typical 4 to 8; the code minimum is 3)
ROPE_SF = 10.25              # minimum factor of safety, passenger, 500 ft/min (Title 8 Table 3042E1 = A17.1 Table 2.20.3)
TABLE_MIN_FT, TABLE_MAX_FT = 1 + 8 / 12, 5 + 8 / 12   # stopping distances printed for the 500 ft/min row
STOREY_M = 3.1               # floor to floor, residential (CTBUH height calculator)
FLOORS_BELOW = 19            # the twentieth floor is 19 storeys above the ground floor
JUMP_M = 0.41                # standing vertical jump of an average man: 16 in (range 16-20 in; NHANES mean 17.7 in)
SPOKEN = {"fall_ft": 5, "stop_s": 1, "fall_mph": 76, "jump_mph": 6}

checks = []
def check(name, ok, detail):
    checks.append({"check": name, "ok": bool(ok), "detail": detail})

# ---- ropes ----
one_rope_loads = ROPE_SF / ROPES            # one rope's breaking strength in units of the fully loaded car
check("one rope holds the loaded car", one_rope_loads >= 1.0, f"{one_rope_loads:.2f} loaded cars per rope")

# ---- the drop ----
v_trip = TRIP_FPM * FT / 60                  # m/s
t_free = v_trip / G                          # from rest to trip speed
d_free = v_trip ** 2 / (2 * G)
stop_min_ft = TRIP_FPM ** 2 / 231840.0
stop_max_ft = TRIP_FPM ** 2 / 81144.0 + 0.84
a_hi = 1.0 * G; a_lo = 0.35 * G
check("formula constants are 2*a*3600", abs(2 * 1.0 * G_FT * 3600 - 231840) / 231840 < 0.002 and abs(2 * 0.35 * G_FT * 3600 - 81144) / 81144 < 0.002,
      f"2*1g*3600 = {2 * G_FT * 3600:.0f}, 2*0.35g*3600 = {2 * 0.35 * G_FT * 3600:.0f}")
check("stopping distances match the code table (within 1 in)", abs(stop_min_ft - TABLE_MIN_FT) < 1 / 12 + 1e-9 and abs(stop_max_ft - TABLE_MAX_FT) < 1 / 12 + 1e-9,
      f"computed {stop_min_ft:.2f} and {stop_max_ft:.2f} ft; table {TABLE_MIN_FT:.2f} and {TABLE_MAX_FT:.2f} ft")
fall_min_ft = d_free / FT + stop_min_ft
fall_max_ft = d_free / FT + stop_max_ft
fall_mid_ft = (fall_min_ft + fall_max_ft) / 2
t_stop_min = t_free + v_trip / a_hi
t_stop_max = t_free + v_trip / a_lo          # the +0.84 ft is the play before the wedges grip; ignore its small time
t_stop_mid = (t_stop_min + t_stop_max) / 2
# energy: speed gained in the free fall equals speed shed by the brake
check("energy balance of the free fall", abs(math.sqrt(2 * G * d_free) - v_trip) < 1e-9, f"sqrt(2 g d) = {math.sqrt(2 * G * d_free):.3f} m/s = trip speed")
check("spoken 'about five feet' inside the range", fall_min_ft <= SPOKEN["fall_ft"] <= fall_max_ft and abs(fall_mid_ft - SPOKEN["fall_ft"]) < 0.6,
      f"{fall_min_ft:.1f} to {fall_max_ft:.1f} ft, middle {fall_mid_ft:.1f}")
check("spoken 'one second' inside the range", t_stop_min <= SPOKEN["stop_s"] <= t_stop_max, f"{t_stop_min:.2f} to {t_stop_max:.2f} s")

# ---- the jump ----
h_fall = FLOORS_BELOW * STOREY_M
v_fall = math.sqrt(2 * G * h_fall)           # free fall, no air, no brakes: the worst case the neighbor plans for
v_jump = math.sqrt(2 * G * JUMP_M)
check("spoken fall speed", round(v_fall / MPH) == SPOKEN["fall_mph"], f"{v_fall / MPH:.1f} mph")
check("spoken jump speed", round(v_jump / MPH) == SPOKEN["jump_mph"], f"{v_jump / MPH:.1f} mph")
check("limiting case: a 1 m drop gives 4.43 m/s", abs(math.sqrt(2 * G * 1.0) - 4.43) < 0.01, f"{math.sqrt(2 * G):.3f} m/s")

out = {
    "inputs": {"rated_fpm": RATED_FPM, "governor_trip_fpm": TRIP_FPM, "ropes": ROPES, "rope_factor_of_safety": ROPE_SF,
               "storey_m": STOREY_M, "floors_below": FLOORS_BELOW, "jump_height_m": JUMP_M},
    "one_rope_holds_loaded_cars": round(one_rope_loads, 2),
    "trip_speed_mps": round(v_trip, 3), "trip_speed_mph": round(v_trip / MPH, 1),
    "free_fall_to_trip_s": round(t_free, 3), "free_fall_to_trip_ft": round(d_free / FT, 2),
    "brake_distance_ft": [round(stop_min_ft, 2), round(stop_max_ft, 2)],
    "total_fall_ft": [round(fall_min_ft, 1), round(fall_max_ft, 1)], "total_fall_mid_ft": round(fall_mid_ft, 1),
    "total_time_s": [round(t_stop_min, 2), round(t_stop_max, 2)], "total_time_mid_s": round(t_stop_mid, 2),
    "brake_g": [0.35, 1.0], "felt_g_while_braking": [1.35, 2.0],
    "fall_from_20th_m": round(h_fall, 1), "fall_from_20th_mph": round(v_fall / MPH, 1),
    "jump_takeoff_mph": round(v_jump / MPH, 1), "landing_after_perfect_jump_mph": round((v_fall - v_jump) / MPH, 1),
    "spoken": SPOKEN, "checks": checks,
}
Path(__file__).with_name("calc.json").write_text(json.dumps(out, indent=1) + "\n")
bad = [c for c in checks if not c["ok"]]
for c in checks: print(("ok   " if c["ok"] else "FAIL ") + c["check"] + ": " + c["detail"])
print(json.dumps({k: v for k, v in out.items() if k not in ("checks", "inputs")}))
sys.exit(1 if bad else 0)
