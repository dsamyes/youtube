#!/usr/bin/env python3
"""Numbers for "What If You Had a Hummingbird's Metabolism?" (every figure in the script comes from here).

Model: give a 70 kg man (Gus) the mass-specific daily energy turnover of a free-living hummingbird and follow
the energy: food in, heat out.
  - Field metabolic rate (doubly labelled water), Anna's hummingbird: 32 kJ/day at 4.48 g
    (Powers & Nagy 1988, Physiol. Zool. 61:500). Cross-check with two more species:
    black-chinned 29.1 kJ/day at 3.67 g, blue-throated 81.7 kJ/day at 8.77 g (Powers & Conley 1994, Condor 96:141).
  - Scaling is linear in mass on purpose: the question is "what if every gram of you ran like a gram of hummingbird".
Self-checks (exit 1 on failure): limiting case, published popular figure, sugar intake vs "half its body weight",
surface per mass by geometry vs measured surface areas, sea-water cooling must be able to carry the heat.
"""
import json, math, sys
from pathlib import Path

KCAL = 4.184                      # kJ per kcal
# --- inputs ---------------------------------------------------------------------------------------------
BIRDS = {                         # species: (field metabolic rate kJ/day, body mass g, source)
    "anna": (32.0, 4.48, "Powers & Nagy 1988"),
    "black_chinned": (29.1, 3.67, "Powers & Conley 1994"),
    "blue_throated": (81.7, 8.77, "Powers & Conley 1994"),
}
GUS_KG = 70.0                     # reference adult man
GUS_KCAL_DAY = 2400.0             # sedentary man 31-40, Dietary Guidelines for Americans 2020-2025, Table A2-2
BURGER_KCAL = 250.0               # one plain hamburger (McDonald's USA nutrition page: 250 Cal)
SUGAR_KJ_G = 16.5                 # sucrose, heat of combustion ~16.5 kJ/g (3.94 kcal/g)
HEART_BPM = 1200.0                # hummingbird heart rate in flight, up to 1,200-1,260 /min (Lasiewski 1964; Smithsonian NMNH)
HEATER_W = 1500.0                 # a standard portable space heater on a US 120 V / 15 A circuit
C_BODY = 3470.0                   # J/kg/K classic value; 2,980 in Xu et al. 2022 (Temperature 10:235)
C_BODY_LOW = 2980.0
SWEAT_MAX_L_H = 2.0               # 1.5 L/h unacclimatised to 2-3 L/h acclimatised (Institute of Medicine 1993, NBK236237)
SWEAT_J_KG = 2.426e6              # latent heat of sweat at skin temperature (580 kcal per litre)
H_WATER_REST, H_WATER_SWIM = 230.0, 580.0   # W/m2/K, man in water at rest / swimming (Nadel et al. 1974, J. Appl. Physiol. 36:465)
H_AIR = 10.0                      # W/m2/K, still air incl. radiation (order of magnitude, ASHRAE comfort range 8-12)
K_WATER, K_AIR = 0.60, 0.026      # thermal conductivity W/m/K at ~20 C
T_SKIN_WATER, T_SEA = 33.0, 18.0  # C
AREA_GUS = 0.007184 * GUS_KG ** 0.425 * 175.0 ** 0.725   # DuBois & DuBois 1916, 175 cm tall -> m2
MEEH_BIRD = 10.0                  # cm2 = 10 * M(g)^0.667 (Meeh constant used for birds); 8.11 for skin under plumage (Walsberg & King 1978)
FAT_KCAL_KG = 7700.0              # energy of body fat tissue
# french fry vs baked potato: lumped cooling, tau = rho c (V/A) / h
RHO_POT, C_POT, H_FOOD = 1080.0, 3500.0, 15.0             # potato flesh; natural convection + radiation in a room
FRY_SIDE, POTATO_D = 0.008, 0.075                         # 8 mm square fry, 7.5 cm round potato
T_HOT, T_ROOM, T_LUKE = 90.0, 20.0, 45.0

# --- energy -----------------------------------------------------------------------------------------------
def scaled(fmr_kj, mass_g, kg=GUS_KG):
    kj = fmr_kj / mass_g * kg * 1000.0
    return {"kJ_per_g_day": fmr_kj / mass_g, "kJ_day": kj, "kcal_day": kj / KCAL, "watts": kj * 1000.0 / 86400.0}

per = {k: scaled(f, m) for k, (f, m, _) in BIRDS.items()}
head = per["anna"]                                        # the headline uses the lowest (most cautious) species
kcal = head["kcal_day"]; watts = head["watts"]
burgers_day = kcal / BURGER_KCAL
burger_every_min = 1440.0 / burgers_day
ratio_vs_gus = kcal / GUS_KCAL_DAY
gus_watts = GUS_KCAL_DAY * KCAL * 1000 / 86400.0
sugar_fraction_bird = BIRDS["anna"][0] / SUGAR_KJ_G / BIRDS["anna"][1]      # grams of sugar per gram of bird per day
sugar_kg_gus = kcal * KCAL / SUGAR_KJ_G / 1000.0
beats_per_s = HEART_BPM / 60.0
heaters = watts / HEATER_W

# --- heat ---------------------------------------------------------------------------------------------------
sweat_w = SWEAT_MAX_L_H * SWEAT_J_KG / 3600.0             # best-case evaporative cooling
net_w = watts - sweat_w - gus_watts                       # what is left after max sweating and a normal man's dry loss
deg_per_min_nocool = watts / (GUS_KG * C_BODY) * 60.0
deg_per_min = net_w / (GUS_KG * C_BODY) * 60.0
deg_per_min_lowc = net_w / (GUS_KG * C_BODY_LOW) * 60.0
sweat_needed_l_h = watts / SWEAT_J_KG * 3600.0
minutes_to_plus4 = 4.0 / deg_per_min
sea_w_rest = H_WATER_REST * AREA_GUS * (T_SKIN_WATER - T_SEA)
sea_w_swim = H_WATER_SWIM * AREA_GUS * (T_SKIN_WATER - T_SEA)
night_kcal = watts * 8 * 3600 / 1000 / KCAL
night_fat_kg = night_kcal / FAT_KCAL_KG

# --- surface per mass ---------------------------------------------------------------------------------------
m_bird = BIRDS["anna"][1]
skin_ratio_geometry = (GUS_KG * 1000.0 / m_bird) ** (1.0 / 3.0)            # same shape, same density: area/mass ~ 1/length
bird_cm2 = MEEH_BIRD * m_bird ** 0.667
skin_ratio_measured = (bird_cm2 / m_bird) / (AREA_GUS * 1e4 / (GUS_KG * 1000.0))
skin_ratio_skin_only = (8.11 * m_bird ** 0.667 / m_bird) / (AREA_GUS * 1e4 / (GUS_KG * 1000.0))

# --- fry vs potato ------------------------------------------------------------------------------------------
va_fry = FRY_SIDE / 4.0                                   # long square prism: V/A = a/4
va_pot = POTATO_D / 6.0                                   # sphere: V/A = d/6
tau = lambda va: RHO_POT * C_POT * va / H_FOOD            # seconds
t_luke = lambda va: tau(va) * math.log((T_HOT - T_ROOM) / (T_LUKE - T_ROOM)) / 60.0
temp_at = lambda va, minutes: T_ROOM + (T_HOT - T_ROOM) * math.exp(-minutes * 60.0 / tau(va))

out = {
    "model": "a 70 kg man with the mass-specific field metabolic rate of a free-living hummingbird (linear in mass)",
    "inputs": {"birds_fmr_kJ_day_mass_g": {k: v[:2] for k, v in BIRDS.items()}, "gus_kg": GUS_KG, "gus_kcal_day": GUS_KCAL_DAY,
               "burger_kcal": BURGER_KCAL, "heart_bpm": HEART_BPM, "space_heater_W": HEATER_W, "c_body_J_kgK": [C_BODY_LOW, C_BODY],
               "sweat_max_L_h": SWEAT_MAX_L_H, "gus_skin_m2_dubois": AREA_GUS},
    "energy": {
        "kcal_day": kcal, "kcal_day_by_species": {k: v["kcal_day"] for k, v in per.items()},
        "kJ_per_g_day_by_species": {k: v["kJ_per_g_day"] for k, v in per.items()},
        "times_gus_normal": ratio_vs_gus, "gus_normal_watts": gus_watts,
        "burgers_per_day": burgers_day, "one_burger_every_min": burger_every_min,
        "sugar_kg_per_day": sugar_kg_gus, "bird_sugar_fraction_of_body_mass": sugar_fraction_bird,
    },
    "heart": {"beats_per_second": beats_per_s, "lowest_audible_Hz": 20.0},
    "heat": {
        "watts": watts, "watts_by_species": {k: v["watts"] for k, v in per.items()}, "space_heaters": heaters,
        "max_sweat_cooling_W": sweat_w, "net_heating_W": net_w,
        "deg_C_per_min_no_cooling": deg_per_min_nocool, "deg_C_per_min_max_sweat": deg_per_min, "deg_C_per_min_max_sweat_low_c": deg_per_min_lowc,
        "deg_F_per_min_max_sweat": deg_per_min * 1.8, "minutes_to_plus_4C": minutes_to_plus4, "sweat_needed_L_h": sweat_needed_l_h,
        "sea_cooling_W_rest_18C": sea_w_rest, "sea_cooling_W_swim_18C": sea_w_swim, "water_vs_air_conductivity": K_WATER / K_AIR, "water_vs_air_h": H_WATER_REST / H_AIR,
        "night_8h_kcal": night_kcal, "night_8h_fat_kg": night_fat_kg, "night_8h_fat_lb": night_fat_kg * 2.20462,
    },
    "skin": {"per_mass_ratio_geometry": skin_ratio_geometry, "per_mass_ratio_meeh_vs_dubois": skin_ratio_measured,
             "per_mass_ratio_skin_under_plumage": skin_ratio_skin_only, "bird_cm2": bird_cm2},
    "fry_vs_potato": {"fry_tau_min": tau(va_fry) / 60, "potato_tau_min": tau(va_pot) / 60, "fry_min_to_45C": t_luke(va_fry), "potato_min_to_45C": t_luke(va_pot),
                      "fry_C_after_10_min": temp_at(va_fry, 10), "potato_C_after_30_min": temp_at(va_pot, 30), "ratio": va_pot / va_fry},
    "facts_with_sources": {
        "fmr_anna": "Powers & Nagy 1988, Physiological Zoology 61:500-506: FMR about 32 kJ/day at a mean mass of 4.48 g (5.2 x BMR), doubly labelled water.",
        "fmr_two_more": "Powers & Conley 1994, The Condor 96:141-150: 29.1 kJ/day (black-chinned, 3.67 g) and 81.7 kJ/day (blue-throated, 8.77 g).",
        "popular_figure": "Audubon Magazine, 'Where Do Hummingbirds Get All That Energy?': scaled to a human, about 155,000 calories a day.",
        "heart": "Lasiewski 1964, Physiological Zoology 37:212-223; Smithsonian NMNH 2022: up to 1,200 beats per minute.",
        "specific_heat": "3.47 kJ/kg/C classic; Xu et al. 2022, Temperature 10:235, about 2.98.",
        "sweat": "Institute of Medicine 1993, Nutritional Needs in Hot Environments (NBK236237): 1.5 L/h unacclimatised, 2-3 L/h acclimatised; 580 kcal per litre evaporated.",
        "water": "Nadel et al. 1974, J. Appl. Physiol. 36:465-471 (heat flow from skin in water at rest and swimming).",
        "torpor": "Hainsworth & Wolf 1970, Science 168:368-369; Shankar et al. 2020, J. Avian Biol. e02305: nightly torpor cuts a hummingbird's energy use by most of its resting rate.",
        "burger": "McDonald's USA, Hamburger: 250 Cal.",
        "calorie_needs": "Dietary Guidelines for Americans 2020-2025, Appendix 2: sedentary man 31-40, 2,400 kcal/day.",
    },
}
Path(__file__).with_name("calc.json").write_text(json.dumps(out, indent=2) + "\n")

# --- self-checks ----------------------------------------------------------------------------------------------
fails = []
def check(name, ok, detail=""):
    print(("ok   " if ok else "FAIL ") + name + (": " + detail if detail else ""))
    if not ok: fails.append(name)

back = scaled(*BIRDS["anna"][:2], kg=BIRDS["anna"][1] / 1000.0)["kJ_day"]
check("limiting case: scaled to the bird's own mass gives its own 32 kJ/day", abs(back - 32.0) < 1e-9, f"{back:.3f}")
hi = max(v["kcal_day"] for v in per.values()); lo = min(v["kcal_day"] for v in per.values())
check("the three species bracket the published 155,000 kcal/day (Audubon) within 5 %", lo <= 155000 * 1.05 and hi >= 155000 * 0.95, f"{lo:,.0f} to {hi:,.0f}")
check("headline is the cautious end and all species agree within 35 %", hi / lo < 1.35 and abs(kcal - lo) < 1, f"{hi / lo:.2f}")
check("bird eats about half its body mass in sugar a day (published rule of thumb), 0.35-0.65", 0.35 <= sugar_fraction_bird <= 0.65, f"{sugar_fraction_bird:.2f}")
check("a normal man is about a 100 W bulb (90-130 W)", 90 <= gus_watts <= 130, f"{gus_watts:.0f} W")
check("energy bookkeeping: burgers x kcal = watts x day", abs(burgers_day * BURGER_KCAL * KCAL * 1000 / 86400 - watts) < 1e-6)
check("skin per mass: geometry (25) and measured areas agree within 30 %", abs(skin_ratio_geometry / skin_ratio_measured - 1) < 0.30, f"{skin_ratio_geometry:.1f} vs {skin_ratio_measured:.1f} (skin only {skin_ratio_skin_only:.1f})")
check("more than one degree C per minute even with maximal sweating, either specific heat", deg_per_min > 1.0 and deg_per_min_lowc > 1.0, f"{deg_per_min:.2f} / {deg_per_min_lowc:.2f} / no cooling {deg_per_min_nocool:.2f}")
check("the sea can carry the heat (swimming, 18 C) and is the same order at rest", sea_w_swim > watts and sea_w_rest > 0.8 * watts, f"{sea_w_rest:.0f} / {sea_w_swim:.0f} W vs {watts:.0f} W")
check("fry lukewarm in minutes (< 12), potato still hot (> 55 C) after 30 min", t_luke(va_fry) < 12 and temp_at(va_pot, 30) > 55, f"{t_luke(va_fry):.1f} min; {temp_at(va_pot, 30):.0f} C")
check("script numbers: 3 min, 50x, 120,000, 20/s, 4 heaters", abs(burger_every_min - 3) < 0.25 and abs(ratio_vs_gus - 50) < 3 and abs(kcal - 120000) < 3000 and abs(beats_per_s - 20) < 1.1 and abs(heaters - 4) < 0.3,
      f"{burger_every_min:.2f} min, {ratio_vs_gus:.1f}x, {kcal:,.0f} kcal, {beats_per_s:.0f}/s, {heaters:.2f} heaters")
print(json.dumps({k: out[k] for k in ("energy", "heart", "heat", "skin", "fry_vs_potato")}, indent=1))
if fails:
    print("FAILED:", fails); sys.exit(1)
print("calc OK")
