#!/usr/bin/env python3
"""Numbers for "What If You Tried to Open a Plane Door Mid-Flight?" (every figure in the script comes from here).

Model: an airliner cruising at 38,000 ft with its cabin held at the highest cabin altitude the rules allow in normal
operation (8,000 ft, 14 CFR 25.841). That is the SMALLEST pressure difference a cruising airliner can have, so every
force below is the cautious end. Pressures come from the International Standard Atmosphere (ICAO Doc 7488 / US
Standard Atmosphere 1976), computed here from its defining constants. The door is the forward entry door of a
Boeing 737 (34 in x 72 in clear opening, Boeing "737 Airplane Characteristics for Airport Planning", D6-58325-6).
Force on the door = pressure difference x door area.
Self-checks (exit 1 on failure): limiting cases of the atmosphere, published pressures, the 737's own pressure
schedule, the published "over 1,100 pounds on each square foot of door", bookkeeping in SI and US units.
"""
import json, math, sys
from pathlib import Path

# --- inputs -------------------------------------------------------------------------------------------------
P0, T0, LAPSE, G0, R_AIR, H_TROPO = 101325.0, 288.15, 0.0065, 9.80665, 287.05287, 11000.0   # ISA constants (SI)
FT, IN, LBF, MILE = 0.3048, 0.0254, 4.4482216152605, 1609.344
PSI = LBF / IN ** 2                                    # Pa per psi (6894.76)
CRUISE_FT = 38000.0                                    # a typical cruise level of a single-aisle jet
CABIN_FT = 8000.0                                      # 14 CFR 25.841(a): cabin pressure altitude not more than 8,000 ft
DOOR_W_IN, DOOR_H_IN = 34.0, 72.0                      # Boeing 737 forward entry door (airport planning document)
B737_DP_PSI = (7.45, 7.80, 8.35)                       # 737 differential pressure schedule: <=FL280, FL280-370, >FL370 (737 FCOM)
PUBLISHED_LB_PER_SQFT = 1100.0                         # "over 1,100 pounds against each square foot of door" (P. Smith, Ask the Pilot)
CAR_LB = 4303.0                                        # average new US vehicle, model year 2022 (EPA Automotive Trends Report 2023)
CUP_D_IN = 2.0                                         # a suction cup two inches across
PULL_N = 700.0                                         # a strong two-handed pull of one adult, order of magnitude (about 160 lbf)

def isa_pressure(h_m: float) -> float:
    """International Standard Atmosphere, 0 to 20 km: troposphere with a linear lapse, isothermal layer above 11 km."""
    if h_m <= H_TROPO:
        return P0 * (1.0 - LAPSE * h_m / T0) ** (G0 / (R_AIR * LAPSE))
    p11 = P0 * (1.0 - LAPSE * H_TROPO / T0) ** (G0 / (R_AIR * LAPSE))
    return p11 * math.exp(-G0 * (h_m - H_TROPO) / (R_AIR * (T0 - LAPSE * H_TROPO)))

# --- pressures ------------------------------------------------------------------------------------------------
p_out = isa_pressure(CRUISE_FT * FT)
p_cabin = isa_pressure(CABIN_FT * FT)
dp = p_cabin - p_out
dp_psi = dp / PSI
# --- the door ---------------------------------------------------------------------------------------------------
area_in2 = DOOR_W_IN * DOOR_H_IN
area_m2 = area_in2 * IN ** 2
force_n = dp * area_m2
force_lbf = force_n / LBF
force_lbf_737 = B737_DP_PSI[2] * area_in2               # with the 737's real schedule above FL370
cars = force_lbf / CAR_LB
# --- the suction cup ------------------------------------------------------------------------------------------
cup_in2 = math.pi * (CUP_D_IN / 2) ** 2
cup_lbf = P0 / PSI * cup_in2                             # the most a perfect cup can hold: one atmosphere x its area

out = {
    "model": "airliner at 38,000 ft, cabin at the 8,000 ft limit of 14 CFR 25.841 (smallest difference in cruise); ISA pressures; Boeing 737 forward entry door 34 x 72 in",
    "inputs": {"cruise_ft": CRUISE_FT, "cabin_altitude_ft": CABIN_FT, "door_in": [DOOR_W_IN, DOOR_H_IN], "car_lb": CAR_LB, "cup_diameter_in": CUP_D_IN},
    "altitude": {"cruise_miles": CRUISE_FT * FT / MILE, "cruise_km": CRUISE_FT * FT / 1000},
    "pressure": {
        "outside_kPa": p_out / 1000, "outside_psi": p_out / PSI, "cabin_kPa": p_cabin / 1000, "cabin_psi": p_cabin / PSI,
        "outside_fraction_of_sea_level": p_out / P0, "cabin_fraction_of_sea_level": p_cabin / P0,
        "difference_kPa": dp / 1000, "difference_psi": dp_psi, "difference_lb_per_sqft": dp_psi * 144,
        "b737_schedule_psi": list(B737_DP_PSI),
    },
    "door": {
        "area_sq_in": area_in2, "area_sq_ft": area_in2 / 144, "area_m2": area_m2,
        "force_N": force_n, "force_lbf": force_lbf, "force_tonnes": force_n / G0 / 1000, "force_short_tons": force_lbf / 2000,
        "force_lbf_at_737_max_8.35psi": force_lbf_737, "cars": cars, "cars_at_737_max": force_lbf_737 / CAR_LB,
        "adults_pulling_700N_each": force_n / PULL_N,
    },
    "suction_cup": {"area_sq_in": cup_in2, "max_hold_lbf": cup_lbf, "max_hold_kg": cup_lbf * LBF / G0},
    "facts_with_sources": {
        "cabin_altitude": "14 CFR 25.841(a): a cabin pressure altitude of not more than 8,000 feet at the maximum operating altitude under normal operating conditions.",
        "atmosphere": "ICAO Standard Atmosphere (Doc 7488) / U.S. Standard Atmosphere 1976 (NOAA, NASA, USAF): 101,325 Pa at sea level, 22,632 Pa at 11 km.",
        "differential": "Boeing 737 FCOM pressurization schedule: 7.45 psid at or below FL280, 7.80 psid FL280-FL370, 8.35 psid above FL370.",
        "popular_statement": "Patrick Smith (airline pilot), askthepilot.com, 'Open Door Policy': up to eight pounds of pressure push against every square inch of interior fuselage, over 1,100 pounds against each square foot of door.",
        "plug_door": "Most airliner doors are plug-type: wider than the opening, they must be pulled inward before they can move out (askthepilot.com; AirlineRatings; Business Insider 2020).",
        "door_size": "Boeing, 737 Airplane Characteristics for Airport Planning (D6-58325-6): forward entry door 34 x 72 in.",
        "car": "EPA Automotive Trends Report 2023: average new vehicle weight 4,303 lb (record high).",
    },
}
Path(__file__).with_name("calc.json").write_text(json.dumps(out, indent=2) + "\n")

# --- self-checks ------------------------------------------------------------------------------------------------
fails = []
def check(name, ok, detail=""):
    print(("ok   " if ok else "FAIL ") + name + (": " + detail if detail else ""))
    if not ok: fails.append(name)

check("limiting case: sea level gives 101,325 Pa", abs(isa_pressure(0.0) - P0) < 1e-6)
check("published value: 22,632 Pa at 11 km (ISA tropopause) within 0.1 %", abs(isa_pressure(11000.0) / 22632.0 - 1) < 1e-3, f"{isa_pressure(11000.0):.0f} Pa")
check("published value: 10.92 psi at 8,000 ft (standard atmosphere tables) within 0.5 %", abs(p_cabin / PSI / 10.92 - 1) < 5e-3, f"{p_cabin / PSI:.3f} psi")
check("published value: about 3.0 psi at 38,000 ft within 2 %", abs(p_out / PSI / 3.0 - 1) < 0.02, f"{p_out / PSI:.3f} psi")
check("limiting case: no height difference, no force", abs((isa_pressure(1000.0) - isa_pressure(1000.0)) * area_m2) < 1e-9)
check("the difference lies inside the 737's own schedule (7.45 to 8.35 psi) and is not above it", B737_DP_PSI[0] <= dp_psi <= B737_DP_PSI[2], f"{dp_psi:.2f} psi")
check("pounds per square foot of door agree with the published 'over 1,100' within 8 %", abs(dp_psi * 144 / PUBLISHED_LB_PER_SQFT - 1) < 0.08, f"{dp_psi * 144:.0f} lb/sq ft")
check("bookkeeping: SI force equals psi x square inches", abs(force_lbf - dp_psi * area_in2) < 1e-6, f"{force_lbf:,.0f} lbf")
check("script numbers: seven miles, a fifth, eight pounds, almost twenty thousand pounds, four cars",
      7.0 <= CRUISE_FT * FT / MILE < 7.5 and abs(p_out / P0 - 0.2) < 0.015 and abs(dp_psi - 8) < 0.25 and 18500 <= force_lbf < 20000 and 4.0 <= cars < 5.0,
      f"{CRUISE_FT * FT / MILE:.2f} mi, {p_out / P0:.3f}, {dp_psi:.2f} psi, {force_lbf:,.0f} lbf, {cars:.2f} cars")
check("nobody can pull that: more than 100 strong adults", force_n / PULL_N > 100, f"{force_n / PULL_N:.0f}")
check("a two-inch suction cup can hold more than 40 lb", cup_lbf > 40, f"{cup_lbf:.1f} lbf")
print(json.dumps({k: out[k] for k in ("altitude", "pressure", "door", "suction_cup")}, indent=1))
if fails:
    print("FAILED:", fails); sys.exit(1)
print("calc OK")
