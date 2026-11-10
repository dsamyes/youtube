"""Calc module for "What If You Traveled at 99.9999% the Speed of Light?" (light-speed-nines).

Every number in the narration, on-screen text, HUD, thumbnail and Shorts is computed here from the
facts in research.json (F-ids). The scenes read the per-level physics from c.extra["levels"].
Run via `python pipeline/calc.py light-speed-nines`.
"""
from __future__ import annotations

import math

from calclib import Calc, fmt

# the levels of the escalation (scenario definitions, not measurements)
LEVELS = [("10", 0.1), ("50", 0.5), ("90", 0.9), ("99", 0.99), ("999", 0.999), ("9999", 0.9999),
          ("999999", 0.999999)]
PCT = {"10": "10", "50": "50", "90": "90", "99": "99", "999": "99.9", "9999": "99.99", "999999": "99.9999"}

H = 6.62607015e-34
KB = 1.380649e-23


def planck(lam, T):
    x = H * 299792458.0 / (lam * KB * T)
    if x > 700:
        return 0.0
    return 2 * H * 299792458.0 ** 2 / lam ** 5 / math.expm1(x)


def visible(T):
    """visible-band (400-700 nm) blackbody radiance, arbitrary units"""
    n = 60
    return sum(planck((400 + (i + 0.5) * 300 / n) * 1e-9, T) for i in range(n)) * 300 / n


def years_fmt(y):
    return fmt(y, 3)


def compute(c: Calc) -> None:
    F = c.F
    cl = F["F01"]
    yr = F["F02"] * 86400.0
    ly = cl * yr
    mp_mev = F["F03"]
    ev = F["F04"]
    mp_j = mp_mev * 1e6 * ev
    n = F["F08"] * 1e6                     # atoms per m^3
    world = F["F09"] * 1e18                # J per year
    M = F["F10"]
    Mc2 = M * cl ** 2
    s_min = F["F17"]                       # MeV cm^2/g
    tnt = F["F29"]
    moon_deg = F["F23"] / 3600.0
    g = F["F24"]
    T_sun, T_cmb = F["F21"], F["F20"]
    d_ac, d_gc, d_m31 = F["F05"], F["F06"], F["F07"]

    c.put("c_kms", cl / 1000, "km/s", fmt(cl / 1000, 6), "c in km/s", ["F01"])
    c.put("ship_mass_t", M / 1000, "t", fmt(M / 1000, 2), "ISS mass", ["F10"])
    c.put("density", F["F08"], "atoms/cm^3", "1", "typical interstellar density", ["F08"])
    c.put("world_ej", F["F09"], "EJ/yr", fmt(F["F09"]), "world primary energy 2024", ["F09"])
    c.put("d_ac", d_ac, "ly", fmt(d_ac, 3), "distance Alpha Centauri", ["F05"])
    c.put("d_gc", d_gc, "ly", fmt(d_gc), "distance galactic center", ["F06"])
    c.put("d_m31_mly", d_m31 / 1e6, "Mly", fmt(d_m31 / 1e6, 2), "distance Andromeda", ["F07"])
    c.put("cmb_t", T_cmb, "K", fmt(T_cmb, 4), "CMB temperature", ["F20"])
    c.put("sun_t", T_sun, "K", fmt(T_sun, 4), "Sun effective temperature", ["F21"])
    c.put("moon_deg", moon_deg, "deg", fmt(moon_deg, 2), "Moon apparent diameter", ["F23"])

    # fastest human-made object
    v_psp = F["F28"] * F["F33"] / 3600.0
    c.put("psp_pct", v_psp / cl * 100, "%", fmt(v_psp / cl * 100, 2), "Parker probe speed / c", ["F28", "F33", "F01"])
    c.put("psp_kms", v_psp / 1000, "km/s", fmt(v_psp / 1000, 3), "430,000 mph in km/s", ["F28", "F33"])

    levels = [{"key": "0", "beta": 0.0, "gamma": 1.0, "pct": "0", "rapidity": 0.0, "g_disp": "1"}]
    for key, b in LEVELS:
        gam = 1 / math.sqrt(1 - b * b)
        p = PCT[key]
        c.put(f"pct_{key}", b * 100, "%", p, "scenario speed", [])
        c.put(f"g_{key}", gam, "-", fmt(gam, 4) if gam < 1.1 else fmt(gam, 3), "gamma = 1/sqrt(1-b^2)", ["F01"])
        c.put(f"kms_{key}", b * cl / 1000, "km/s", fmt(b * cl / 1000, 3), "beta * c", ["F01"])
        # clocks
        extra_days = (gam - 1) * F["F02"]
        c.put(f"xdays_{key}", extra_days, "days", fmt(extra_days, 2), "(gamma-1) * 365.25 d per ship year", ["F02"])
        c.put(f"ey_{key}", gam, "yr", c.values[f"g_{key}"]["display"], "Earth years per ship year = gamma", [])
        # sky: where a star that is exactly sideways (90 deg) appears; half sky circle diameter
        th90 = math.degrees(math.acos(b))
        c.put(f"side_{key}", th90, "deg", fmt(th90, 2), "cos(theta') = beta for theta = 90 deg", ["F31"])
        circ = 2 * th90
        c.put(f"circle_{key}", circ, "deg", fmt(circ, 2), "half the sky fits in a cone of 2*acos(beta)", ["F31"])
        c.put(f"moons_{key}", circ / moon_deg, "moons", fmt(circ / moon_deg, 2), "circle / Moon diameter", ["F31", "F23"])
        dmax = math.sqrt((1 + b) / (1 - b))
        dmin = 1 / dmax
        c.put(f"dmax_{key}", dmax, "-", fmt(dmax, 3), "D ahead = sqrt((1+b)/(1-b))", ["F31"])
        c.put(f"tfront_{key}", T_sun * dmax, "K", fmt(T_sun * dmax, 2), "Sun-like star ahead: T*D", ["F21", "F31"])
        c.put(f"tback_{key}", T_sun * dmin, "K", fmt(T_sun * dmin, 2), "Sun-like star behind: T/D", ["F21", "F31"])
        c.put(f"cmbf_{key}", T_cmb * dmax, "K", fmt(T_cmb * dmax, 3), "CMB dead ahead: T*D", ["F20", "F31"])
        # what hits you
        e_mev = (gam - 1) * mp_mev
        c.put(f"ep_{key}", e_mev, "MeV", fmt(e_mev, 3) if e_mev >= 10 else fmt(e_mev, 2), "(gamma-1) m_p c^2", ["F03"])
        c.put(f"epg_{key}", e_mev / 1000, "GeV", fmt(e_mev / 1000, 3), "proton KE in GeV", ["F03"])
        flux = n * b * cl                                     # protons / m^2 / s
        heat = flux * e_mev * 1e6 * ev                        # W/m^2
        c.put(f"heat_{key}", heat, "W/m^2", fmt(heat, 2), "n v (gamma-1) m_p c^2", ["F08", "F01", "F03", "F04"])
        c.put(f"heatkw_{key}", heat / 1e3, "kW/m^2", fmt(heat / 1e3, 3), "heat flux in kW/m^2", ["F08", "F01", "F03", "F04"])
        c.put(f"heatmw_{key}", heat / 1e6, "MW/m^2", fmt(heat / 1e6, 2), "heat flux in MW/m^2", ["F08", "F01", "F03", "F04"])
        c.put(f"suns_{key}", heat / F["F22"], "x", fmt(heat / F["F22"], 2), "heat / solar constant", ["F22"])
        dose = (flux / 1e4) * s_min * 1e6 * ev * 1000         # Gy/s  (per cm^2 flux * MeV cm^2/g -> J/kg)
        c.put(f"dose_{key}", dose, "Gy/s", fmt(dose, 2), "lower bound n v S_min", ["F08", "F01", "F17", "F04"])
        c.put(f"tlethal_{key}", F["F19"] / dose, "s", fmt(F["F19"] / dose, 2), "LD50/30 / dose rate", ["F19", "F17"])
        # energy for the ISS-mass ship
        ke = (gam - 1) * Mc2
        c.put(f"ke_{key}", ke, "J", f"{ke:.2e}", "(gamma-1) M c^2", ["F10", "F01"])
        c.put(f"kew_{key}", ke / world, "yr", fmt(ke / world, 2), "KE / world energy per year", ["F10", "F01", "F09"])
        c.put(f"kemo_{key}", ke / world * 12, "months", fmt(ke / world * 12, 2), "KE / world energy, in months", ["F10", "F01", "F09"])
        # trips at constant cruise speed
        for dk, d in (("ac", d_ac), ("gc", d_gc), ("m31", d_m31)):
            t_e = d / b
            t_s = t_e / gam
            c.put(f"te_{dk}_{key}", t_e, "yr", years_fmt(t_e), f"Earth time = d/v to {dk}", ["F05" if dk == "ac" else "F06" if dk == "gc" else "F07"])
            c.put(f"ts_{dk}_{key}", t_s, "yr", years_fmt(t_s), f"ship time = d/(gamma v) to {dk}", ["F05" if dk == "ac" else "F06" if dk == "gc" else "F07"])
            c.put(f"tsd_{dk}_{key}", t_s * F["F02"], "days", fmt(t_s * F["F02"], 3), "ship time in days", ["F05", "F02"])
            c.put(f"tsm_{dk}_{key}", t_s * 12, "months", fmt(t_s * 12, 2), "ship time in months", ["F05"])
        # star-field physics for the scenes (screen code recomputes per star with the same formulas)
        levels.append({"key": key, "beta": b, "gamma": gam, "pct": p, "rapidity": math.atanh(b),
                       "g_disp": c.values[f"g_{key}"]["display"]})

    # ---- level-specific worded quantities
    c.put("xdays_10_round", 2, "days", "2", "1.84 days rounds to about 2", ["F02"])
    r5 = F["F15"] * 10  # g/cm^2 -> mm of water (density 1 g/cm^3)
    c.put("range5_mm", r5, "mm", fmt(r5, 2), "CSDA range 5 MeV in water", ["F15"])
    c.put("range5_half_mm", 0.5, "mm", "half", "upper bound used in words", ["F15"])
    c.put("range150_cm", F["F16"], "cm", fmt(F["F16"], 2), "CSDA range 150 MeV in water", ["F16"])
    c.put("therapy_lo", F["F13"], "MeV", fmt(F["F13"]), "therapy beams low", ["F13"])
    c.put("therapy_hi", F["F14"], "MeV", fmt(F["F14"]), "therapy beams high", ["F14"])
    c.put("lambda_int_cm", F["F18"], "cm", fmt(F["F18"], 3), "nuclear interaction length water", ["F18"])
    c.put("ld50", F["F19"], "Sv", "4", "LD50/30 lower end", ["F19"])
    c.put("psp_ratio_10", 0.1 * cl / v_psp, "x", fmt(0.1 * cl / v_psp, 3), "10% c / Parker speed", ["F28", "F33", "F01"])
    c.put("rest_mev", mp_mev, "MeV", fmt(mp_mev, 3), "proton rest energy", ["F03"])
    mosq = F["F12"] * 1e6  # MeV
    e6 = c.values["ep_999999"]["value"]
    c.put("mosq_frac_999999", e6 / mosq, "-", fmt(e6 / mosq, 2), "proton KE / 1 TeV", ["F12", "F03"])
    c.put("lhc_tev", F["F11"], "TeV", fmt(F["F11"], 2), "LHC proton energy", ["F11"])
    g_lhc = F["F11"] * 1e6 / mp_mev + 1
    b_lhc = math.sqrt(1 - 1 / g_lhc ** 2)
    c.put("lhc_pct", b_lhc * 100, "%", "99.999999", "LHC beta from gamma (8 nines, truncated)", ["F11", "F03"])
    dust = F["F30"] * (c.values["g_999999"]["value"] - 1) * cl ** 2
    c.put("dust_j_999999", dust, "J", f"{dust:.2e}", "(gamma-1) m c^2, m = 1 microgram", ["F30", "F01"])
    c.put("dust_t_999999", dust / tnt, "t TNT", fmt(dust / tnt, 2), "/ 4.184e9 J per tonne", ["F30", "F29"])
    g4 = c.values["g_9999"]["value"]
    dust4 = F["F30"] * (g4 - 1) * cl ** 2
    c.put("dust_t_9999", dust4 / tnt, "t TNT", fmt(dust4 / tnt, 2), "1 ug at 99.99%", ["F30", "F29"])

    # ---- Beyond: constant 1 g, accelerate to midpoint, decelerate (relativistic rocket)
    def rocket(d_ly):
        d = d_ly * ly
        tau_half = cl / g * math.acosh(1 + g * (d / 2) / cl ** 2)
        t_half = cl / g * math.sinh(g * tau_half / cl)
        gmax = 1 + g * (d / 2) / cl ** 2
        return 2 * tau_half / yr, 2 * t_half / yr, gmax

    for dk, d in (("ac", d_ac), ("gc", d_gc), ("m31", d_m31)):
        tau, t, gmax = rocket(d)
        fid = {"ac": "F05", "gc": "F06", "m31": "F07"}[dk]
        c.put(f"g1_ts_{dk}", tau, "yr", fmt(tau, 3), "2 (c/a) acosh(1 + a d / 2c^2)", [fid, "F24", "F32"])
        c.put(f"g1_te_{dk}", t, "yr", fmt(t, 3), "2 (c/a) sinh(a tau_half / c)", [fid, "F24", "F32"])
        c.put(f"g1_gmax_{dk}", gmax, "-", fmt(gmax, 3), "1 + a d / 2c^2", [fid, "F24", "F32"])
    tau_m, t_m, gmax_m = rocket(d_m31)
    c.put("g1_te_m31_my", t_m / 1e6, "Myr", fmt(t_m / 1e6, 2), "Earth time to M31 in million years", ["F07", "F24", "F32"])
    c.put("rt_ship_m31", 2 * tau_m, "yr", fmt(2 * tau_m, 2), "round trip ship time", ["F07", "F24", "F32"])
    c.put("rt_earth_m31_my", 2 * t_m / 1e6, "Myr", fmt(2 * t_m / 1e6, 2), "round trip Earth time (million years)", ["F07", "F24", "F32"])
    c.put("age_leave", 25, "yr", "25", "scenario: you leave at 25", [])
    c.put("age_return", 25 + 2 * tau_m, "yr", fmt(25 + 2 * tau_m, 2), "25 + round-trip ship time", ["F07", "F24", "F32"])
    one_minus = 1 / (2 * gmax_m ** 2)  # 1 - beta for large gamma
    nines = -math.log10(one_minus)
    c.put("m31_nines", nines, "nines", fmt(math.floor(nines)), "number of nines in peak speed", ["F07", "F24", "F32"])
    c.put("m31_pct", (1 - one_minus) * 100, "%", "99.99999999997", "peak beta at midpoint (1 - 1/(2 gamma^2))", ["F07", "F24", "F32"])
    ke_m31 = (gmax_m - 1) * Mc2
    c.put("kew_m31_my", ke_m31 / world / 1e6, "Myr", fmt(ke_m31 / world / 1e6, 2), "peak KE / world energy, million years", ["F10", "F09"])
    c.put("homo_my", F["F25"], "Myr", fmt(F["F25"], 2), "oldest Homo fossil", ["F25"])
    t_to_999999 = cl / g * math.atanh(0.999999) / yr
    c.put("t1g_999999", t_to_999999, "yr", fmt(t_to_999999, 2), "ship time to reach 99.9999% at 1 g: (c/a) atanh(b)", ["F24", "F32"])
    g1y = cl / g / yr
    c.put("c_over_g_yr", g1y, "yr", fmt(g1y, 3), "c/g in years", ["F24", "F01"])

    # ---- checks
    V = {k: v["value"] for k, v in c.values.items()}
    c.check("gamma(99.9999%) ~ 707", 706 < V["g_999999"] < 708)
    c.check("gamma(90%) = 2.294", abs(V["g_90"] - 2.294) < 0.001)
    c.check("10% is ~156x the Parker Solar Probe", 150 < V["psp_ratio_10"] < 160)
    c.check("proton KE at 99.9999% is ~662 GeV", 660 < V["epg_999999"] < 665)
    c.check("90% proton KE exceeds its rest energy", V["ep_90"] > mp_mev)
    c.check("10% proton (4.73 MeV) is below 5 MeV, so range < 0.36 mm", V["ep_10"] < 5)
    c.check("50% proton (145 MeV) is inside therapy band 70-250 MeV and below 150 MeV", 70 < V["ep_50"] < 150)
    c.check("CMB ahead at 99.9999% is ~3,850 K (visible glow)", 3800 < V["cmbf_999999"] < 3900)
    c.check("CMB ahead at 99.99% is ~385 K (above boiling water 373 K)", 373 < V["cmbf_9999"] < 400)
    c.check("1 g to Andromeda takes ~28-29 yr ship time", 28 < V["g1_ts_m31"] < 29.5)
    c.check("Galactic center at 99.9999% in under 40 ship years", V["ts_gc_999999"] < 40)
    c.check("Alpha Centauri at 99.9999% ~2.26 days", 2.2 < V["tsd_ac_999999"] < 2.3)
    c.check("Dose rate lower bound at 90% is ~8.6 Gy/s", 8 < V["dose_90"] < 9)
    c.check("energy at 99.9999% ~45,000 yr of world energy", 40000 < V["kew_999999"] < 50000)
    c.check("LHC protons faster than 99.9999%", b_lhc > 0.999999)
    c.check("peak speed to M31 has 12 nines", math.floor(nines) == 12)
    c.check("Andromeda round trip ~5 Myr, more than oldest Homo", V["rt_earth_m31_my"] > V["homo_my"])
    # the narration says a Sun-like star dead ahead FADES at 99.9% (visible-band point-source flux)
    d999 = V["dmax_999"]
    r_vis = d999 ** -2 * visible(T_sun * d999) / visible(T_sun)
    c.put("fade_999", r_vis, "x", fmt(r_vis, 2), "D^-2 V(DT)/V(T), visible 400-700 nm", ["F21", "F31"])
    c.check("Sun-like star dead ahead is dimmer in visible light at 99.9% (ratio < 1)", r_vis < 1)
    d50 = V["dmax_50"]
    c.check("at 50% a Sun-like star behind is dimmer (visible ratio < 1)",
            (1 / d50) ** -2 * visible(T_sun / d50) / visible(T_sun) < 1)
    c.check("aberration sanity: 90-degree star at 90% appears at ~25.8 deg", abs(V["side_90"] - 25.84) < 0.05)

    # ---- Math Cards (one per section at most)
    G = c.V
    c.card("lorentz", "Your clock vs Earth's", "γ = 1 ÷ √(1 − v²/c²)", f"v = 0.999999 c → γ = {G['g_999999']}",
           f"1 ship year = {G['ey_999999']} Earth years", "Special relativity, constant cruise speed", "Einstein 1905")
    c.card("psp", "How fast is 10%?", "v = 0.1 × c", f"0.1 × {G['c_kms']} km/s = {G['kms_10']} km/s",
           f"≈ {G['psp_ratio_10']}× Parker Solar Probe", f"Parker: {G['psp_kms']} km/s, fastest human-made object", "NASA, NIST")
    c.card("hits50", "What one atom carries", "E = (γ − 1) × mₚc²", f"({G['g_50']} − 1) × {G['rest_mev']} MeV",
           f"{G['ep_50']} MeV per proton", f"Proton therapy uses {G['therapy_lo']}–{G['therapy_hi']} MeV", "NIST, MD Anderson")
    c.card("aberration", "Where the stars go", "cos θ′ = (cos θ + β) ÷ (1 + β cos θ)", "β = 0.9, θ = 90° → cos θ′ = 0.9",
           f"θ′ = {G['side_90']}°", "A star beside you appears ahead", "Einstein 1905")
    c.card("heat99", "Heat on your bow", "P = n · v · (γ − 1) mₚc²", f"1 atom/cm³ × 0.99c × {G['epg_99']} GeV",
           f"{G['heatkw_99']} kW per m²", f"≈ {G['suns_99']}× the sunlight on Earth", "NASA, NIST")
    c.card("energy", "The bill for one more nine", "E = (γ − 1) M c²", f"({G['g_999']} − 1) × {G['ship_mass_t']} t × c²",
           f"{G['ke_999']} J ≈ {G['kew_999']} yr of world energy", f"World: {G['world_ej']} EJ per year (2024)", "NASA, Energy Institute")
    c.card("cmb", "The dark ahead heats up", "T′ = T × √((1 + β) ÷ (1 − β))", f"{G['cmb_t']} K × {G['dmax_9999']}",
           f"{G['cmbf_9999']} K", "Hotter than boiling water", "NASA WMAP")
    c.card("proton6", "One hydrogen atom", "E = (γ − 1) × mₚc²", f"({G['g_999999']} − 1) × {G['rest_mev']} MeV",
           f"{G['epg_999999']} GeV", f"≈ {G['mosq_frac_999999']} of a flying mosquito, in one proton", "NIST, CERN")
    c.card("rocket", "Andromeda at a steady 1 g", "τ = 2 (c/g) · arcosh(1 + g·d ÷ 2c²)", f"d = {G['d_m31_mly']} million ly, g = 9.81 m/s²",
           f"τ = {G['g1_ts_m31']} years on your clock", f"Earth: {G['g1_te_m31_my']} million years", "Gibbs & Baez, NASA")

    c.extra["levels"] = levels
    c.extra["vis_note"] = "visible band 400-700 nm; stars: HYG v4.0 to mag 8; T from B-V (Ballesteros 2012)"


def comparisons(val, facts):
    prev_sum = sum(val[f"kew_{k}"] for k in ("10", "50", "90", "99"))
    return [
        ("b09", "times faster than the fastest", val["psp_ratio_10"] > 1),
        ("b13", "less than half a millimeter", val["range5_mm"] < 0.5 and val["ep_10"] < 5),
        ("b20", "same energy hospitals", facts["F13"]["value"] <= val["ep_50"] <= facts["F14"]["value"]),
        ("b21", "less than 16 centimeters", val["ep_50"] < 150 and val["range150_cm"] <= 16),
        ("b24", "more energy than its own mass", val["ep_90"] > val["rest_mev"]),
        ("b26", "under half a second", val["tlethal_90"] < 0.5),
        ("b33", "about seven years older", 6.5 <= val["ey_99"] < 7.5),
        ("b35", "200 times", 195 < val["suns_99"] < 205),
        ("b40", "more than all the nines before it", val["kew_999"] > prev_sum),
        ("b38", "so it fades", val["fade_999"] < 1),
        ("b43", "hotter than boiling water", val["cmbf_9999"] > 373.15),
        ("b47", "smaller than the moon", val["circle_999999"] < val["moon_deg"]),
        ("b49", "two-thirds of a mosquito", 0.6 < val["mosq_frac_999999"] < 0.72),
        ("b49", "trillions of times a second", val["density"] * 1e6 * 0.999999 * 299792458 > 1e12),
        ("b57", "faster than any proton", val["m31_pct"] > val["lhc_pct"]),
        ("b61", "further into the future", val["rt_earth_m31_my"] > val["homo_my"]),
        ("s3b02", "two-thirds of the energy of a flying mosquito", 0.6 < val["mosq_frac_999999"] < 0.72),
        ("s3b04", "proton therapy beam", facts["F13"]["value"] <= val["ep_50"] <= facts["F14"]["value"]),
        ("s3b05", "under half a second", val["tlethal_90"] < 0.5),
    ]


WHITELIST = {
    "1": "'one year', '1 g', '1 atom' - scenario units and counts",
    "2": "count / ordinal",
    "3": "count / ordinal",
    "4": "count of questions",
    "0.1": "β = 0.1 (scenario speed, 10%) on the Math Card",
    "0.9": "β = 0.9 (scenario speed, 90%) on the Math Card",
    "0.99": "β = 0.99 (scenario speed) on the Math Card",
    "0.999999": "β = 0.999999 (scenario speed) on the Math Card",
    "90": "θ = 90° (a star exactly beside you), scenario geometry",
    "9.81": "g rounded on the Math Card substitution line",
    "1979": "publication year of the cited starbow paper (McKinley & Doherty, S28)",
}
