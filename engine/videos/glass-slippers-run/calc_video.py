#!/usr/bin/env python3
"""Numbers for "What If You Ran in Glass Slippers?" (every figure in the script comes from here).

Model (stated assumptions): ordinary annealed soda-lime glass. Squeezed, it fails at a nominal 1000 MPa
(Viridian TechDirect "Glass strength"; Saint-Gobain "The strength of glass"; some makers quote 700-900 MPa).
Stretched or bent, it fails at about 40 MPa, because the stress piles up at the tips of microscopic surface
scratches (Griffith flaws); EN 572-1 gives 45 MPa as the characteristic bending strength of float glass.
The slipper's heel is a square glass post, 1 cm x 1 cm in section and 4 cm tall. Gus weighs 80 kg. Standing, the
load goes straight down the post (pure squeeze). Running, a step peaks at about 2.5 times body weight (the range
in the running literature is 2 to 3) and the force line is tilted against the post, here by 10 degrees; the
sideways part bends the post like a lever: bending stress = 6 * F_side * height / side^3 on the outer face,
minus the squeeze F_axial / side^2.
Self-checks (exit 1 on failure): limiting cases, the published "1 cm cube takes 10 tonnes", the published
conclusion of the Leicester student paper (a glass heel must be about a centimetre high to survive a run).
"""
import json, math, sys
from pathlib import Path

G0 = 9.80665
# --- inputs ---------------------------------------------------------------------------------------------------
SIGMA_C = 1000e6          # Pa, nominal compressive strength of glass (Viridian; Saint-Gobain)
SIGMA_C_LOW = 700e6       # Pa, the low end quoted by Guardian Glass (700-900 MPa)
SIGMA_T = 40e6            # Pa, practical bending / tensile strength of annealed glass (Viridian: "approximately 40 MPa")
SIGMA_T_EN = 45e6         # Pa, EN 572-1 characteristic bending strength of float glass
CONCRETE_C = 40e6         # Pa, a strong ordinary structural concrete (typical range 20-40 MPa)
CUBE = 0.01               # m, the glass cube / the heel's section: 1 cm
SUGAR_CUBE = 0.0127       # m, a small table sugar cube (half an inch; many are 1.6 cm)
ELEPHANT_BULL, ELEPHANT_COW = 6000.0, 3000.0   # kg, average adult African bush elephants (male, female)
GUS = 80.0                # kg
STEP_BW, STEP_BW_RANGE = 2.5, (2.0, 3.0)       # peak vertical force of a running step, in body weights
TILT_DEG = 10.0           # tilt of the force line against the heel post in a running step (assumption)
HEEL_H = 0.04             # m, heel height
LEICESTER_HEEL = 0.0115   # m, "Cinderella's Shattered Dreams", J. Phys. Special Topics (Univ. of Leicester) 2015
CINDERELLA = 55.0         # kg, a light adult, for the comparison with that paper

def heel_tension(force_n: float, tilt_deg: float, h: float, a: float = CUBE) -> float:
    """largest stretching stress in a square post of side a and height h under a force tilted against its axis"""
    t = math.radians(tilt_deg)
    return 6.0 * force_n * math.sin(t) * h / a ** 3 - force_n * math.cos(t) / a ** 2

def max_heel(force_n: float, tilt_deg: float, a: float = CUBE, sigma: float = SIGMA_T) -> float:
    t = math.radians(tilt_deg)
    return (sigma + force_n * math.cos(t) / a ** 2) * a ** 3 / (6.0 * force_n * math.sin(t))

# --- squeeze ----------------------------------------------------------------------------------------------------
area = CUBE ** 2
crush_n = SIGMA_C * area
crush_t = crush_n / G0 / 1000.0
crush_t_low = SIGMA_C_LOW * area / G0 / 1000.0
pair_t = (ELEPHANT_BULL + ELEPHANT_COW) / 1000.0
# --- Gus standing and running -----------------------------------------------------------------------------------
bw = GUS * G0
stand_stress = bw / area                         # all his weight on ONE heel, the worst case
step_n = STEP_BW * bw
run_tension = heel_tension(step_n, TILT_DEG, HEEL_H)
tilt_break = next(d / 100 for d in range(0, 9000) if heel_tension(step_n, d / 100, HEEL_H) >= SIGMA_T)
h_max_gus = max_heel(step_n, TILT_DEG)
h_max_cinderella = max_heel(STEP_BW * CINDERELLA * G0, TILT_DEG)

out = {
    "model": "annealed soda-lime glass: 1000 MPa squeezed, 40 MPa stretched; heel = square glass post 1 cm x 1 cm, 4 cm tall; Gus 80 kg; a running step = 2.5 body weights tilted 10 degrees against the post",
    "inputs": {"compressive_MPa": SIGMA_C / 1e6, "tensile_MPa": SIGMA_T / 1e6, "cube_cm": CUBE * 100, "heel_height_cm": HEEL_H * 100, "gus_kg": GUS, "step_body_weights": STEP_BW, "tilt_deg": TILT_DEG},
    "squeeze": {"cube_crush_load_kN": crush_n / 1000, "cube_crush_load_tonnes": crush_t, "cube_crush_load_short_tons": crush_t * 1.10231, "cube_crush_load_tonnes_at_700MPa": crush_t_low,
                "sugar_cube_cm": SUGAR_CUBE * 100, "glass_cube_cm": CUBE * 100, "two_elephants_tonnes": pair_t, "elephant_pairs_carried": crush_t / pair_t,
                "times_stronger_than_concrete": SIGMA_C / CONCRETE_C},
    "stretch": {"squeezed_over_stretched": SIGMA_C / SIGMA_T, "with_EN572_45MPa": SIGMA_C / SIGMA_T_EN},
    "standing": {"stress_on_one_heel_MPa": stand_stress / 1e6, "safety_factor": SIGMA_C / stand_stress},
    "running": {"step_force_N": step_n, "step_force_kg": step_n / G0, "stretch_on_heel_MPa": run_tension / 1e6, "times_over_the_limit": run_tension / SIGMA_T,
                "tilt_that_breaks_it_deg": tilt_break, "max_heel_height_cm_gus": h_max_gus * 100, "max_heel_height_cm_light_adult": h_max_cinderella * 100,
                "leicester_paper_heel_cm": LEICESTER_HEEL * 100},
    "facts_with_sources": {
        "compressive": "Viridian TechDirect 'Thermal stress / glass strength': compressive strength nominally around 1000 MPa; to shatter a 1 cm cube of glass a load of about 10 t is required. Same statement in Saint-Gobain Glass UK, 'The strength of glass'. Guardian Glass lists 700-900 MPa.",
        "tensile": "Viridian: resistance to breakage on deflection approximately 40 MPa for annealed glass. EN 572-1: characteristic bending strength of float glass 45 N/mm2. MIT OCW 3.071 lecture 8: practical strength is limited by stress concentration at surface flaws (Griffith cracks).",
        "running": "Peak vertical ground reaction force in running is two to three times body weight (running biomechanics literature, e.g. the review in Frontiers in Bioengineering and Biotechnology 2024).",
        "elephants": "African bush elephant: adult males average about 6 t, females about 3 t.",
        "concrete": "Ordinary structural concrete: compressive strength 20-40 MPa.",
        "leicester": "'Cinderella's Shattered Dreams', Journal of Physics Special Topics, University of Leicester, 2015: a glass heel has to be lower than 1.15 cm to survive a run.",
    },
}
Path(__file__).with_name("calc.json").write_text(json.dumps(out, indent=2) + "\n")

# --- self-checks --------------------------------------------------------------------------------------------------
fails = []
def check(name, ok, detail=""):
    print(("ok   " if ok else "FAIL ") + name + (": " + detail if detail else ""))
    if not ok: fails.append(name)

check("published value: a 1 cm glass cube takes about 10 tonnes (Viridian / Saint-Gobain) within 5 %", abs(crush_t / 10.0 - 1) < 0.05, f"{crush_t:.2f} t")
check("limiting case: no tilt, no stretch (a straight load only squeezes)", heel_tension(step_n, 0.0, HEEL_H) < 0)
check("limiting case: no heel, no bending", heel_tension(step_n, TILT_DEG, 0.0) < 0)
check("limiting case: stress doubles when the force doubles", abs(heel_tension(2 * step_n, TILT_DEG, HEEL_H) / run_tension - 2) < 1e-9)
check("standing is far inside the squeeze limit (factor above 100)", SIGMA_C / stand_stress > 100, f"{stand_stress / 1e6:.1f} MPa, factor {SIGMA_C / stand_stress:.0f}")
check("a running step stretches the heel past its limit", run_tension > SIGMA_T, f"{run_tension / 1e6:.0f} MPa against {SIGMA_T / 1e6:.0f}")
check("it still breaks with the gentlest step of the range (2 body weights) and with the EN 572-1 strength", heel_tension(STEP_BW_RANGE[0] * bw, TILT_DEG, HEEL_H) > SIGMA_T_EN)
check("published conclusion: the heel that survives a run is of the order of a centimetre (Leicester: 1.15 cm; ours within a factor of 4)",
      LEICESTER_HEEL / 4 < h_max_cinderella < LEICESTER_HEEL * 4 and LEICESTER_HEEL / 4 < h_max_gus < LEICESTER_HEEL * 4, f"{h_max_gus * 100:.1f} cm for Gus, {h_max_cinderella * 100:.1f} cm for a light adult")
check("the glass cube is smaller than a sugar cube", CUBE < SUGAR_CUBE)
check("two elephants (a bull and a cow) weigh less than the cube carries", pair_t < crush_t, f"{pair_t:.0f} t against {crush_t:.1f} t")
check("glass squeezed is stronger than concrete", SIGMA_C_LOW > CONCRETE_C, f"{SIGMA_C / CONCRETE_C:.0f} times at 1000 MPa")
check("script numbers: ten tons, twenty-five times weaker, two and a half times his weight", 9.5 < crush_t < 10.5 and SIGMA_C / SIGMA_T == 25 and STEP_BW == 2.5)
print(json.dumps({k: out[k] for k in ("squeeze", "stretch", "standing", "running")}, indent=1))
if fails:
    print("FAILED:", fails); sys.exit(1)
print("calc OK")
