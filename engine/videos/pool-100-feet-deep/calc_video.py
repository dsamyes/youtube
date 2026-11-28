#!/usr/bin/env python3
"""Numbers for "What If Your Pool Was 100 Feet Deep?" (every figure in the script comes from here).

Model (stated assumptions): a back-garden pool 16 ft x 32 ft in plan (a common full-size pool) dug straight down to
100 ft and filled with fresh water at 20 C. Standard atmosphere on top. The air in a beach ball follows Boyle's law
(the water keeps it at one temperature). The ball is 15 in across when blown up; a regulation basketball is 29.5 in
round. One dump-truck load is 10 cubic yards (the low end of the usual 10 to 14) and the dirt is counted as it lies
in the ground. The garden hose gives 11 gallons a minute (100 ft of 5/8 in hose at 40 psi, Iowa State Extension).
Self-checks (exit 1 on failure): a second method for each headline figure, limiting cases, published values.
"""
import json, math, sys
from pathlib import Path

# --- inputs ---------------------------------------------------------------------------------------------------
G = 9.80665                      # m/s2
RHO = 998.2                      # fresh water at 20 C, kg/m3
P_ATM = 101325.0                 # standard atmosphere, Pa
FT, INCH, LB, GAL, YD3 = 0.3048, 0.0254, 0.45359237, 3.785411784e-3, 0.764554858
DEPTH_FT, POOL_W_FT, POOL_L_FT = 100.0, 16.0, 32.0
BALL_IN = 15.0                   # beach ball across, blown up
BASKETBALL_CIRC_IN = 29.5        # size 7 ball
HOSE_GPM = 11.0
TRUCK_YD3 = 10.0
BARBELL_LB, RHO_IRON = 100.0, 7200.0   # cast iron plates
SHORT_TON_LB = 2000.0
N2_COLUMN_KM = 100.0             # "right up to space": the Karman line; 99.99997 % of the air lies below it

# --- pressure -------------------------------------------------------------------------------------------------
ft_per_atm = P_ATM / (RHO * G) / FT                       # feet of fresh water that weigh one atmosphere
def p_abs_atm(d_ft): return 1 + RHO * G * d_ft * FT / P_ATM
p34, p100 = p_abs_atm(34), p_abs_atm(DEPTH_FT)
vol34, vol100 = 1 / p34, 1 / p100                         # Boyle: V2 / V1 = P1 / P2
width100 = vol100 ** (1 / 3)
ball_at_100_in = BALL_IN * width100
basketball_in = BASKETBALL_CIRC_IN / math.pi
gauge_psi_100 = RHO * G * DEPTH_FT * FT / 6894.757
# independent method: stack the water foot by foot (imperial: 62.32 lb per cubic foot at 20 C) and add the air
lb_ft3 = RHO * FT ** 3 / LB
air_lb_ft2 = P_ATM / 6894.757 * 144
tile_water_lb = lb_ft3 * DEPTH_FT                         # one square foot of floor carries this much water
tile_tons = tile_water_lb / SHORT_TON_LB
p100_stack = (air_lb_ft2 + sum(lb_ft3 for _ in range(int(DEPTH_FT)))) / air_lb_ft2
ft_per_atm_stack = air_lb_ft2 / lb_ft3

# --- the ball's lift ------------------------------------------------------------------------------------------
r = BALL_IN * INCH / 2
ball_L = 4 / 3 * math.pi * r ** 3 * 1000
lift_lb = RHO * ball_L / 1000 / LB                        # weight of the water it pushes aside (Archimedes)
lift100_lb = lift_lb * vol100
barbell_wet_lb = BARBELL_LB * (1 - RHO / RHO_IRON)        # what the barbell weighs under water
net_down_surface_lb = barbell_wet_lb - lift_lb

# --- digging and filling --------------------------------------------------------------------------------------
vol_ft3 = DEPTH_FT * POOL_W_FT * POOL_L_FT
vol_m3 = vol_ft3 * FT ** 3
gallons = vol_m3 / GAL
trucks = vol_m3 / YD3 / TRUCK_YD3
fill_days = gallons / HOSE_GPM / 60 / 24
water_tons = vol_ft3 * lb_ft3 / SHORT_TON_LB

out = {
 "assumptions": {"pool_plan_ft": [POOL_W_FT, POOL_L_FT], "depth_ft": DEPTH_FT, "water": "fresh, 20 C", "ball_in": BALL_IN,
                 "hose_gpm": HOSE_GPM, "truck_cubic_yards": TRUCK_YD3, "barbell_lb": BARBELL_LB},
 "pressure": {"feet_of_fresh_water_per_atmosphere": round(ft_per_atm, 2), "abs_atm_at_34_ft": round(p34, 3), "abs_atm_at_100_ft": round(p100, 3),
              "gauge_psi_at_100_ft": round(gauge_psi_100, 1), "air_lb_per_sq_ft": round(air_lb_ft2, 0)},
 "ball": {"volume_fraction_at_34_ft": round(vol34, 3), "volume_fraction_at_100_ft": round(vol100, 3), "width_fraction_at_100_ft": round(width100, 3),
          "width_at_100_ft_in": round(ball_at_100_in, 2), "basketball_width_in": round(basketball_in, 2), "volume_L": round(ball_L, 1),
          "lift_at_surface_lb": round(lift_lb, 1), "lift_at_100_ft_lb": round(lift100_lb, 1), "barbell_under_water_lb": round(barbell_wet_lb, 1),
          "barbell_minus_lift_lb": round(net_down_surface_lb, 1)},
 "floor": {"water_on_one_square_foot_lb": round(tile_water_lb, 0), "short_tons": round(tile_tons, 2)},
 "pool": {"volume_cubic_feet": round(vol_ft3), "gallons": round(gallons, -2), "dump_truck_loads": round(trucks), "hose_days": round(fill_days, 1),
          "hose_weeks": round(fill_days / 7, 2), "water_short_tons": round(water_tons)},
}

# --- checks ---------------------------------------------------------------------------------------------------
checks = []
def check(name, ok): checks.append((name, bool(ok)))
check("fresh water: about 34 ft per atmosphere (NOAA Diving Manual: 34 ft)", 33.5 < ft_per_atm < 34.2)
check("two methods agree on feet per atmosphere", abs(ft_per_atm - ft_per_atm_stack) < 0.01)
check("at 34 ft the air is half its volume (within 1 %)", abs(vol34 - 0.5) < 0.005)
check("at 100 ft about four atmospheres: 3.9 to 4.0", 3.9 < p100 < 4.0)
check("foot-by-foot stack gives the same pressure at 100 ft", abs(p100 - p100_stack) < 1e-6)
check("at 100 ft the air is a quarter of its volume (within 0.01)", abs(vol100 - 0.25) < 0.01)
check("limiting case: at the surface nothing is squeezed", abs(p_abs_atm(0) - 1) < 1e-12)
check("published: 0.432 psi per foot of fresh water (NOAA) -> 43.2 psi at 100 ft", abs(gauge_psi_100 - 43.2) < 0.3)
check("published: water weighs 62.4 lb per cubic foot (USGS), 62.3 at 20 C", abs(lb_ft3 - 62.4) < 0.15)
check("the squeezed ball is a basketball: within 6 %", abs(ball_at_100_in / basketball_in - 1) < 0.06)
check("the ball pushes up with a little over sixty pounds", 60 < lift_lb < 68)
check("the barbell still sinks it at the surface", net_down_surface_lb > 15)
check("three tons of water on one square foot (3.0 to 3.2)", 3.0 < tile_tons < 3.2)
check("almost two hundred truck loads (180 to 200)", 180 <= trucks < 200)
check("over three weeks of hose (21 to 28 days)", 21 < fill_days < 28)
check("volume two ways: gallons x 8.33 lb is the weight of the water", abs(gallons * 8.33 / SHORT_TON_LB / water_tons - 1) < 0.005)
out["checks"] = [{"check": n, "ok": ok} for n, ok in checks]
Path(__file__).with_name("calc.json").write_text(json.dumps(out, indent=1) + "\n", encoding="utf-8")
for n, ok in checks: print(("ok   " if ok else "FAIL ") + n)
print(json.dumps({k: v for k, v in out.items() if k != "checks"}, indent=1))
if not all(ok for _, ok in checks): sys.exit(1)
