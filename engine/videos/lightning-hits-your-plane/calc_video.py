#!/usr/bin/env python3
"""Numbers for "What If Lightning Hit Your Plane?" (every figure in the script comes from here or from a cited source).

Model (stated assumptions): a typical lightning flash as the U.S. National Weather Service describes it (about
30,000 amperes, 50,000 F) attaches to the nose of a single-aisle airliner (Boeing 737-800 size) and leaves at the
tail. The fuselage is taken as one seamless aluminium tube with the skin thickness of the thin crown panels (about
1 mm, 2024-T3 alloy); frames, stringers and the floor, which carry current too, are left out, and so are the
joints, which add resistance. The voltage along the skin is then Ohm's law at the peak current. Real airframes
are bonded so that the whole aircraft stays under about 2.5 milliohms (500 V at the 200,000 A design stroke); that
bound is computed too, and the narration only claims "a few volts, less than a wall socket", true for both.
The doorknob spark is the human-body model of electrostatics: about 150 pF charged to 3,000 V, the level
below which most people feel nothing.
Self-checks (exit 1 on failure): a textbook wire, the published bound, the skin depth, the Sun, unit round trips.
"""
import json, math, sys
from pathlib import Path

# --- inputs -----------------------------------------------------------------------------------------------------
I_BOLT = 30_000.0          # A, typical flash (NWS: "about 300 million Volts and about 30,000 Amps")
V_BOLT = 300e6             # V, same source
T_BOLT_F = 50_000.0        # F, air in the channel (NWS)
T_SUN_K = 5772.0           # K, effective temperature of the Sun's surface (IAU nominal value)
I_HOUSE = 15.0             # A, an ordinary US household circuit (NWS compares the flash with "120 Volts and 15 Amps")
V_SOCKET = 120.0           # V, US wall socket
FUSELAGE_LEN = 38.0        # m, nose to tail cone of a 737-800 (39.5 m overall)
FUSELAGE_DIA = 3.76        # m, 737 fuselage width
SKIN_MM = 1.0              # mm, thin fuselage skin panels (0.036 to 0.040 in = 0.91 to 1.02 mm)
RHO_2024 = 5.82e-8         # ohm m, aluminium 2024-T3 (30 % IACS)
DIME_MM = 1.35             # mm, thickness of a US dime (US Mint)
R_BOUND = 500.0 / 200_000  # ohm: "no more than 500 V across the aircraft" at the 200 kA design stroke
STRIKE_PER_H = 1 / 1000.0  # FAA estimate quoted by AVweb and others: one strike per 1,000 flight hours
HOURS_PER_YEAR = (1000.0, 3000.0)   # flight hours a year: Airbus equates "once a year" with 3,000 h, the FAA figure with 1,000 h
SELF_TRIGGERED = 0.9       # Flight Safety Foundation: almost 90 % of strikes are triggered by the aircraft
V_SPARK = 3000.0           # V: below about 2,000 to 3,000 V a static spark is not felt
C_BODY = 150e-12           # F, human-body model (100 to 150 pF)
Q_FLASH = 15.0             # C, charge moved by a typical flash (order of magnitude; not narrated)
ALT_FT = (5000.0, 15000.0) # where most strikes happen (climb and descent)
FT, MILE = 0.3048, 1609.344
MU0 = 4e-7 * math.pi

# --- the skin as a wire -------------------------------------------------------------------------------------------
circ = math.pi * FUSELAGE_DIA
area = circ * SKIN_MM / 1000.0                    # m2 of metal the current can use
r_skin = RHO_2024 * FUSELAGE_LEN / area           # ohm, nose to tail
v_skin = I_BOLT * r_skin                          # V at the peak of a typical flash
v_bound = I_BOLT * R_BOUND                        # V with the bonding bound instead
power_peak_mw = I_BOLT * v_skin / 1e6
skin_depth_mm = math.sqrt(RHO_2024 / (math.pi * 1e4 * MU0)) * 1000   # at 10 kHz, the bulk of a stroke's spectrum
amps_ratio = I_BOLT / I_HOUSE
t_sun_f = T_SUN_K * 9 / 5 - 459.67
sun_ratio = T_BOLT_F / t_sun_f
strikes_per_year = tuple(STRIKE_PER_H * h for h in HOURS_PER_YEAR)
two_miles_ft = 2 * MILE / FT
# --- the doorknob ---------------------------------------------------------------------------------------------------
e_spark_mj = 0.5 * C_BODY * V_SPARK ** 2 * 1000
q_spark_uc = C_BODY * V_SPARK * 1e6
charge_ratio = Q_FLASH / (C_BODY * V_SPARK)
volts_ratio = V_SPARK / v_skin

# --- self-checks ----------------------------------------------------------------------------------------------------
checks = []
def check(name, ok, detail=""):
    checks.append({"check": name, "ok": bool(ok), "detail": detail})
# 1 textbook wire with the same formula: 1 m of 1 mm2 copper is 17 milliohms
r_cu = 1.68e-8 * 1.0 / 1e-6
check("formula on a textbook copper wire (1 m, 1 mm2 = 16.8 milliohm)", abs(r_cu - 0.0168) < 1e-4, f"{r_cu*1000:.1f} mOhm")
# 2 published bound: the ideal tube must come out below what real, jointed airframes are held to
check("ideal tube below the published 2.5 milliohm bound, within a factor 30", r_skin < R_BOUND and r_skin > R_BOUND / 30, f"{r_skin*1e3:.3f} vs {R_BOUND*1e3:.1f} mOhm")
# 3 narration: 'a few volts' and 'less than a wall socket' for both the ideal tube and the bound
check("ideal tube gives a few volts (2 to 9)", 2 <= v_skin <= 9, f"{v_skin:.1f} V")
check("even the bound stays under a wall socket", v_bound < V_SOCKET, f"{v_bound:.0f} V < {V_SOCKET:.0f} V")
# 4 limiting cases: twice the skin halves the volts; no current, no volts
check("limiting cases (double skin halves it, zero current gives zero)", abs(I_BOLT * RHO_2024 * FUSELAGE_LEN / (2 * area) - v_skin / 2) < 1e-9 and 0.0 * r_skin == 0.0)
# 5 the direct-current picture holds: at 10 kHz the current soaks through the whole skin
check("skin depth at 10 kHz is at least the skin thickness", skin_depth_mm >= SKIN_MM, f"{skin_depth_mm:.2f} mm")
# 6 the Sun: 50,000 F is about five times its surface
check("five times the Sun's surface (4.5 to 5.5)", 4.5 <= sun_ratio <= 5.5, f"{sun_ratio:.2f}")
# 7 'thirty thousand against fifteen'
check("bolt / household circuit = 2,000", amps_ratio == 2000.0)
# 8 'about once a year': FAA rate times yearly hours brackets the NWS 'one or two times a year'
check("strike rate lands on about once a year (1 to 3)", 1 <= strikes_per_year[0] <= strikes_per_year[1] <= 3, str(strikes_per_year))
# 9 'two miles up' lies in the band where most strikes happen
check("two miles is inside 5,000 to 15,000 ft", ALT_FT[0] <= two_miles_ft <= ALT_FT[1], f"{two_miles_ft:.0f} ft")
# 10 'no thicker than a dime'
check("skin thinner than a dime", SKIN_MM <= DIME_MM)
# 11 the spark is harmless: under a millijoule, a few tenths of a microcoulomb
check("spark energy under 1 mJ", e_spark_mj < 1.0, f"{e_spark_mj:.2f} mJ")
# 12 unit round trip
check("F <-> K round trip", abs(((t_sun_f + 459.67) * 5 / 9) - T_SUN_K) < 1e-9)

out = {
 "bolt": {"amps": I_BOLT, "volts": V_BOLT, "temp_F": T_BOLT_F, "sun_surface_F": round(t_sun_f), "times_sun_surface": round(sun_ratio, 2),
          "household_amps": I_HOUSE, "times_household": amps_ratio},
 "skin": {"length_m": FUSELAGE_LEN, "diameter_m": FUSELAGE_DIA, "thickness_mm": SKIN_MM, "dime_mm": DIME_MM, "metal_area_cm2": round(area * 1e4, 1),
          "resistance_milliohm": round(r_skin * 1e3, 3), "volts_nose_to_tail": round(v_skin, 1), "aa_cells_1p5V": round(v_skin / 1.5, 1),
          "bound_milliohm": R_BOUND * 1e3, "volts_at_bound": round(v_bound), "wall_socket_V": V_SOCKET,
          "peak_power_in_skin_MW": round(power_peak_mw, 2), "skin_depth_10kHz_mm": round(skin_depth_mm, 2)},
 "rate": {"strikes_per_year_low": strikes_per_year[0], "strikes_per_year_high": strikes_per_year[1], "self_triggered_fraction": SELF_TRIGGERED,
          "nine_in_ten": round(SELF_TRIGGERED * 10), "two_miles_ft": round(two_miles_ft), "strike_band_ft": ALT_FT},
 "doorknob": {"volts": V_SPARK, "body_pF": C_BODY * 1e12, "energy_mJ": round(e_spark_mj, 3), "charge_microC": round(q_spark_uc, 2),
              "times_the_skin_volts": round(volts_ratio), "flash_charge_over_spark_charge": round(charge_ratio)},
 "checks": checks,
}
Path(__file__).with_name("calc.json").write_text(json.dumps(out, indent=1) + "\n")
bad = [c for c in checks if not c["ok"]]
for c in checks: print(("ok   " if c["ok"] else "FAIL ") + c["check"] + (" [" + c["detail"] + "]" if c["detail"] else ""))
print(f"skin: {r_skin*1e3:.3f} mOhm, {v_skin:.1f} V at 30 kA (bound {v_bound:.0f} V); spark {e_spark_mj:.2f} mJ, {q_spark_uc:.2f} uC")
sys.exit(1 if bad else 0)
