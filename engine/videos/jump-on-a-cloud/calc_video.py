#!/usr/bin/env python3
"""Numbers for "What If You Jumped on a Cloud?" (every figure in the script comes from here).

Model (stated assumptions): a small fair-weather cumulus, a cube 1 km on a side holding 0.5 g of liquid water per
cubic metre (USGS Water Science School: "about 0.5 gram per cubic meter", "A 1 km3 cloud contains 1 billion cubic
meters", "about 500,000 kilograms or 1.1 million pounds (about 551 tons)"). Its droplets are 20 micrometres across
(10 um radius), a raindrop 2 mm across (1 mm radius): textbook sizes ("it takes 1 million cloud droplets (10 um
radius) ... to make one single raindrop (1 mm radius)", Atmospheric Processes and Phenomena, ch. 7).
Gus weighs 80 kg and falls belly-down; a stable belly-to-earth skydiver reaches about 120 mph (200 km/h; FAI
skydiving commission, USPA Skydiver's Information Manual). He steps off a balloon right at the cloud top, at rest.
Self-checks (exit 1 on failure): published values, limiting cases, unit round trips.
"""
import json, math, sys
from pathlib import Path

# --- inputs ---------------------------------------------------------------------------------------------------
LWC = 0.5e-3            # kg of liquid water per m3 of cloud (USGS: 0.5 g/m3 for cumulus)
SIDE = 1000.0           # m, the cloud is a cube of this side (USGS example: 1 km3)
ELEPHANT_KG = 5000.0    # an adult African bush elephant, about 5 tonnes (bulls 6, cows 3)
FRIDGE_M3 = 1.0         # outside volume of a big kitchen fridge: 0.9 m x 0.7 m x 1.6 m = 1.0 m3
DROP_ML = 0.05          # one drop from a dropper (the pharmacists' metric drop: 20 drops per mL)
D_DROPLET = 20e-6       # m, cloud droplet diameter (10 um radius)
D_RAIN = 2e-3           # m, raindrop diameter (1 mm radius)
RHO_W = 1000.0          # kg/m3 water
MU_AIR = 1.75e-5        # Pa s, air at about 5 C (cloud level)
G = 9.80665
VT_MPH = 120.0          # belly-to-earth terminal speed (FAI: about 200 km/h)
GUS_KG = 80.0
BODY_AREA = 0.5         # m2, a belly-down adult seen from below (1.75 m x 0.29 m mean width)
RHO_AIR = 1.06          # kg/m3 at 1.5 km, mid cloud (ISA: 1.058)
CUP_ML = 236.588        # one US cup
LB, MPH, INCH, SHORT_TON = 0.45359237, 0.44704, 0.0254, 907.18474
USGS_LB, USGS_TONS = 1.1e6, 551.0

# --- the cloud ------------------------------------------------------------------------------------------------
volume = SIDE ** 3
water_kg = LWC * volume
water_lb = water_kg / LB
water_short_tons = water_kg / SHORT_TON
water_tonnes = water_kg / 1000
elephants = water_kg / ELEPHANT_KG
air_kg_per_m3 = RHO_AIR
water_share_of_air = LWC / RHO_AIR                 # mass of droplets per mass of air in the same space

# --- a fridge of cloud ----------------------------------------------------------------------------------------
fridge_g = LWC * FRIDGE_M3 * 1000
fridge_drops = fridge_g / DROP_ML                  # 1 mL of water = 1 g

# --- a droplet ------------------------------------------------------------------------------------------------
v_stokes = RHO_W * G * D_DROPLET ** 2 / (18 * MU_AIR)   # Stokes terminal speed of a small sphere
reynolds = RHO_AIR * v_stokes * D_DROPLET / MU_AIR
droplets_per_raindrop = (D_RAIN / D_DROPLET) ** 3
droplet_mass = RHO_W * math.pi / 6 * D_DROPLET ** 3
droplets_per_m3 = LWC / droplet_mass
hours_to_fall_1km = SIDE / v_stokes / 3600

# --- the fall -------------------------------------------------------------------------------------------------
vt = VT_MPH * MPH
# from rest with quadratic drag: x(t) = vt^2/g * ln cosh(g t / vt)
u = math.acosh(math.exp(SIDE * G / vt ** 2))
t_through = u * vt / G
v_exit = vt * math.tanh(u)
t_no_drag = math.sqrt(2 * SIDE / G)
t_at_terminal = SIDE / vt
cda = 2 * GUS_KG * G / (RHO_AIR * vt ** 2)         # drag area that gives 120 mph
swept_m3 = BODY_AREA * SIDE
swept_water_g = swept_m3 * LWC * 1000
swept_cups = swept_water_g / CUP_ML
swept_air_kg = swept_m3 * RHO_AIR

out = {
 "inputs": {"liquid_water_g_per_m3": LWC * 1000, "cloud_side_m": SIDE, "elephant_kg": ELEPHANT_KG, "fridge_m3": FRIDGE_M3,
            "drop_ml": DROP_ML, "droplet_diameter_um": D_DROPLET * 1e6, "raindrop_diameter_mm": D_RAIN * 1e3,
            "terminal_speed_mph": VT_MPH, "gus_kg": GUS_KG, "body_area_m2": BODY_AREA, "air_density_kg_m3": RHO_AIR, "cup_ml": CUP_ML},
 "cloud": {"volume_m3": volume, "water_kg": water_kg, "water_tonnes": water_tonnes, "water_lb": round(water_lb), "water_short_tons": round(water_short_tons, 1),
           "elephants": elephants, "water_mass_per_air_mass": round(water_share_of_air, 6), "air_is_times_heavier_than_its_droplets": round(1 / water_share_of_air)},
 "fridge": {"water_g": fridge_g, "drops": fridge_drops},
 "droplet": {"fall_speed_cm_s": round(v_stokes * 100, 3), "fall_speed_inch_s": round(v_stokes / INCH, 3), "reynolds": round(reynolds, 4),
             "droplets_per_raindrop": round(droplets_per_raindrop), "droplets_per_m3": round(droplets_per_m3), "hours_to_sink_1_km_in_still_air": round(hours_to_fall_1km, 1)},
 "fall": {"terminal_speed_m_s": round(vt, 2), "seconds_through_cloud_from_rest": round(t_through, 1), "speed_at_cloud_base_mph": round(v_exit / MPH, 1),
          "seconds_without_air": round(t_no_drag, 1), "seconds_if_already_at_terminal": round(t_at_terminal, 1), "drag_area_m2_for_120_mph": round(cda, 3),
          "swept_volume_m3": swept_m3, "water_in_his_path_g": swept_water_g, "water_in_his_path_cups": round(swept_cups, 2), "air_in_his_path_kg": swept_air_kg},
 "script": {"cloud_weighs_more_than_pounds": "a million", "tons_of_water": "five hundred", "elephants": "a hundred", "seconds": "twenty-two",
            "fridge_drops": "ten", "droplet_sinks": "half an inch a second", "cups": "one", "droplets_per_raindrop": "a million"},
}

# --- self-checks ----------------------------------------------------------------------------------------------
checks = []
def check(name, ok): checks.append({"check": name, "ok": bool(ok)})
check("cloud weight lands on the USGS figure (1.1 million lb, 551 short tons) within 1 %", abs(water_lb / USGS_LB - 1) < 0.01 and abs(water_short_tons / USGS_TONS - 1) < 0.01)
check("'more than a million pounds' and 'five hundred tons' (metric) hold", water_lb > 1e6 and abs(water_tonnes - 500) < 1)
check("a hundred elephants at 5 t each", abs(elephants - 100) < 0.5)
check("fridge of cloud: 0.5 g = ten drops", abs(fridge_drops - 10) < 0.01)
check("Stokes law is valid (Reynolds number far below 1)", reynolds < 0.1)
check("droplet sinks about 1 cm/s (lecture tables: 0.01 m/s for a 20 um droplet) = about half an inch a second", 0.008 < v_stokes < 0.015 and 0.4 < v_stokes / INCH < 0.6)
check("a million droplets per raindrop (textbook value)", abs(droplets_per_raindrop - 1e6) < 1)
check("fall time lies between the no-air time and far above the at-terminal time, rounds to 22 s", t_no_drag < t_through and t_at_terminal < t_through and round(t_through) == 22)
check("limiting case: for a very thin cloud the drag formula tends to free fall", abs((math.acosh(math.exp(1.0 * G / vt ** 2)) * vt / G) / math.sqrt(2 * 1.0 / G) - 1) < 0.01)
check("120 mph is consistent with an 80 kg body: drag area 0.4 to 0.7 m2 (Cd about 1 on about 0.5 m2)", 0.4 < cda < 0.7)
check("water in his path is one cup (0.9 to 1.2)", 0.9 < swept_cups < 1.2)
check("unit round trip: 120 mph = 193 km/h, within 4 % of the FAI's 200 km/h", abs(vt * 3.6 / 200 - 1) < 0.04)
out["checks"] = checks
Path(__file__).with_name("calc.json").write_text(json.dumps(out, indent=1) + "\n", encoding="utf-8")
bad = [c["check"] for c in checks if not c["ok"]]
for c in checks: print(("ok   " if c["ok"] else "FAIL ") + c["check"])
print(json.dumps(out["cloud"]), json.dumps(out["droplet"]), json.dumps(out["fall"]), sep="\n")
sys.exit(1 if bad else 0)
