#!/usr/bin/env python3
"""Numbers for "What If an Immortal Snail Was Chasing You?" (every figure in the script comes from here).

Model (stated assumptions, all generous to the snail): the snail crawls at the pace of the fastest snail ever timed
(Guinness World Records: "Archie", 33 cm / 13 in in 2 min 00 s, World Snail Racing Championships, Congham, 1995)
and never stops, 24 hours a day, in a straight line. Gus walks at 3 mph (usual adult walking pace is about
1.3 m/s; Murtagh et al., Sports Medicine 2021: 1.31 m/s) with a 0.70 m step, and sleeps 8 hours a night.
The ocean is the North Atlantic between New York (JFK) and London (LHR), great circle.
The tap: 1 drip a second, 0.25 mL a drip (USGS water science school), into a standard 40-gallon bathtub.
Self-checks (exit 1 on failure): published values, limiting cases, unit round trips.
"""
import json, math, sys
from pathlib import Path

# --- inputs ---------------------------------------------------------------------------------------------------
COURSE_M, COURSE_IN, RECORD_S = 0.33, 13.0, 120.0   # Guinness: 33 cm (13 in) in 2 min 00 s
WALK_MPH = 3.0                                       # Gus's walking speed
STEP_M = 0.70                                        # one walking step of an adult
SLEEP_H = 8.0
JFK, LHR = (40.6413, -73.7781), (51.4700, -0.4543)   # airport coordinates, degrees
EARTH_R_KM = 6371.0088                               # mean Earth radius (IUGG)
DRIP_ML, DRIPS_PER_S = 0.25, 1.0                     # USGS: "1/4 millilitre as the volume of a faucet drip"
TUB_GAL = 40.0                                       # a standard bathtub (makers quote 40 to 60 US gallons)
MILE, YARD, INCH, GAL_L = 1609.344, 0.9144, 0.0254, 3.785411784
YEAR_D = 365.25
TYPICAL_SNAIL = 0.001                                # m/s, the usual textbook figure for a garden snail (about 1 mm/s)
WIKI_MPH = 0.006                                     # the speed the "Snail racing" article gives for the record

def great_circle_km(a, b):
    (la1, lo1), (la2, lo2) = [(math.radians(x), math.radians(y)) for x, y in (a, b)]
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * EARTH_R_KM * math.asin(math.sqrt(h))

# --- the snail ------------------------------------------------------------------------------------------------
v_snail = COURSE_M / RECORD_S                        # m/s
per_hour_m = v_snail * 3600
per_day_m = v_snail * 86400
per_year_km = per_day_m * YEAR_D / 1000
night_m = v_snail * SLEEP_H * 3600
# --- Gus ------------------------------------------------------------------------------------------------------
v_gus = WALK_MPH * MILE / 3600
ratio = v_gus / v_snail
step_lead_s = STEP_M / v_snail                       # how long the snail needs for one of Gus's steps
walk_back_s = per_day_m / v_gus                      # Gus's walk that undoes a whole snail day
# --- the ocean ------------------------------------------------------------------------------------------------
ocean_km = great_circle_km(JFK, LHR)
ocean_days = ocean_km * 1000 / per_day_m
ocean_years = ocean_days / YEAR_D
# --- the tap --------------------------------------------------------------------------------------------------
tap_l_day = DRIP_ML * DRIPS_PER_S * 86400 / 1000
tub_l = TUB_GAL * GAL_L
tub_days = tub_l / tap_l_day

out = {
    "model": "snail at the pace of the fastest snail ever timed (33 cm in 2 min, Guinness), never stopping; Gus walks 3 mph, 0.70 m steps, sleeps 8 h; ocean = New York to London great circle; tap = 1 drip/s of 0.25 mL into a 40-gallon tub",
    "inputs": {"course_cm": COURSE_M * 100, "course_in": COURSE_IN, "record_s": RECORD_S, "walk_mph": WALK_MPH, "step_m": STEP_M, "sleep_h": SLEEP_H, "drip_mL": DRIP_ML, "tub_gal": TUB_GAL},
    "snail": {"speed_mm_s": v_snail * 1000, "speed_mph": v_snail * 3600 / MILE, "per_hour_m": per_hour_m, "per_hour_yd": per_hour_m / YARD,
              "per_day_m": per_day_m, "per_day_yd": per_day_m / YARD, "per_year_km": per_year_km, "per_year_miles": per_year_km * 1000 / MILE,
              "per_night_of_sleep_m": night_m, "per_night_of_sleep_yd": night_m / YARD},
    "gus": {"walk_m_s": v_gus, "times_faster_than_snail": ratio, "one_step_lead_s": step_lead_s, "one_step_lead_min": step_lead_s / 60,
            "walk_that_wins_a_day_back_s": walk_back_s, "walk_that_wins_a_day_back_min": walk_back_s / 60},
    "ocean": {"new_york_london_km": ocean_km, "new_york_london_miles": ocean_km * 1000 / MILE, "snail_days": ocean_days, "snail_years": ocean_years},
    "tap": {"litres_per_day": tap_l_day, "gallons_per_day": tap_l_day / GAL_L, "tub_litres": tub_l, "days_to_fill_tub": tub_days, "days_to_fill_60_gal_tub": 60 * GAL_L / tap_l_day},
    "facts_with_sources": {
        "record": "Guinness World Records, 'Fastest snail racing': a snail named Archie (trainer Carl Bramham) covered the 33 cm (13 in) course in 2 min 00 s at the World Snail Racing Championships, Congham, Norfolk, 1995. Same figures in the 'Snail racing' encyclopedia article (0.006 mph).",
        "walking": "Usual walking pace of healthy adults: 1.31 m/s (Murtagh et al., Sports Medicine 2021, meta-analysis); 3 mph = 1.34 m/s.",
        "ocean": "Great-circle distance JFK to LHR: 5,540 to 5,567 km (3,442 to 3,459 miles) depending on the calculator; computed here with the haversine formula.",
        "tap": "USGS Water Science School, drip calculator: 0.25 mL per drip, 15,140 drips per gallon, 4,000 drips per litre.",
        "hitching": "USDA APHIS: hitchhiking snails 'can attach themselves to almost anything including shipping containers and can survive for months'; US Customs and Border Protection regularly finds live snails in air passengers' luggage (Houston 2021, Detroit 2023).",
    },
}
Path(__file__).with_name("calc.json").write_text(json.dumps(out, indent=2) + "\n")

# --- self-checks --------------------------------------------------------------------------------------------------
fails = []
def check(name, ok, detail=""):
    print(("ok   " if ok else "FAIL ") + name + (": " + detail if detail else ""))
    if not ok: fails.append(name)

check("published value: the record pace is 0.006 mph (Snail racing article) within 5 %", abs(v_snail * 3600 / MILE / WIKI_MPH - 1) < 0.05, f"{v_snail * 3600 / MILE:.5f} mph")
check("the course in inches and in centimetres agree within 1 %", abs(COURSE_IN * INCH / COURSE_M - 1) < 0.01, f"{COURSE_IN * INCH * 100:.2f} cm")
check("generous to the snail: the record pace is faster than the usual 1 mm/s of a garden snail, and within a factor of 5 of it", TYPICAL_SNAIL < v_snail < 5 * TYPICAL_SNAIL, f"{v_snail * 1000:.2f} mm/s")
check("published value: usual walking pace 1.31 m/s (Murtagh 2021) within 5 % of 3 mph", abs(v_gus / 1.31 - 1) < 0.05, f"{v_gus:.3f} m/s")
check("published value: JFK to LHR great circle 5,540 to 5,567 km", 5535 < ocean_km < 5572, f"{ocean_km:.0f} km")
check("published value: USGS 15,140 drips per gallon within 1 %", abs(GAL_L * 1000 / DRIP_ML / 15140 - 1) < 0.01, f"{GAL_L * 1000 / DRIP_ML:.0f}")
check("limiting case: a snail as fast as Gus gains nothing and needs no walk", abs((v_gus * 86400) / v_gus - 86400) < 1e-6)
check("round trip: Gus's catch-up walk covers exactly the snail's day", abs(walk_back_s * v_gus - per_day_m) < 1e-9)
check("consistency: a day is three sleeping nights (24 h / 8 h)", abs(per_day_m / night_m - 3) < 1e-9)
check("consistency: the ocean in years equals distance / yearly distance", abs(ocean_years - ocean_km / per_year_km) < 1e-9)
check("script: thirteen inches in two minutes", COURSE_IN == 13 and RECORD_S == 120)
check("script: one step, four minutes to catch up", 4.0 <= step_lead_s / 60 < 4.6, f"{step_lead_s / 60:.2f} min")
check("script: almost five hundred times faster", 470 < ratio < 500, f"{ratio:.0f}")
check("script: a week to fill the bathtub", 6.5 < tub_days < 7.5, f"{tub_days:.1f} days ({tap_l_day:.1f} L a day into {tub_l:.0f} L)")
check("script: eighty-seven yards a night", round(night_m / YARD) == 87, f"{night_m / YARD:.1f} yd")
check("script: two hundred and sixty yards a day", round(per_day_m / YARD) == 260, f"{per_day_m / YARD:.1f} yd")
check("script: fifty-four miles a year", round(per_year_km * 1000 / MILE) == 54, f"{per_year_km * 1000 / MILE:.1f} miles")
check("script: a three-minute walk", 2.8 < walk_back_s / 60 < 3.2, f"{walk_back_s / 60:.2f} min")
check("script: sixty-four years across the ocean", round(ocean_years) == 64, f"{ocean_years:.1f} years")
print(json.dumps({k: out[k] for k in ("snail", "gus", "ocean", "tap")}, indent=1))
if fails:
    print("FAILED:", fails); sys.exit(1)
print("calc OK")
