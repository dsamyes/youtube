"""Calc module for "What If the Moon Was Twice as Close?" (every number in the script comes from here)."""
from __future__ import annotations

import math

from calclib import Calc, fmt


def compute(c: Calc) -> None:
    F = c.F
    G, g = F["F09"], F["F10"]
    Me, Mm, Ms = F["F06"], F["F02"], F["F14"]
    Re, Rm, Rs = F["F07"] * 1e3, F["F03"] * 1e3, F["F12"] * 1e3
    d1 = F["F01"] * 1e3
    d2 = d1 / 2
    au = F["F11"] * 1e3
    year = F["F18"]

    c.put("d_old_km", d1 / 1e3, "km", fmt(d1 / 1e3, 4), "NASA mean distance", ["F01"])
    c.put("d_new_km", d2 / 1e3, "km", fmt(d2 / 1e3, 4), "d/2", ["F01"])

    # ---- moving it: orbital energy ----
    E = G * Me * Mm * (1 / (2 * d2) - 1 / (2 * d1))
    c.put("move_energy", E, "J", f"{E / 1e28:.1f} × 10²⁸", "G Me Mm (1/2d2 - 1/2d1)", ["F09", "F06", "F02", "F01"])
    sun_s = E / F["F13"]
    c.put("sun_seconds", sun_s, "s", fmt(sun_s, 1), "E / L_sun", ["F13"])
    v1 = math.sqrt(G * (Me + Mm) / d1)
    v2 = math.sqrt(G * (Me + Mm) / d2)
    c.put("v_old_kms", v1 / 1e3, "km/s", fmt(v1 / 1e3, dec=1), "sqrt(G(M+m)/d1)", ["F09", "F06", "F02", "F01"])
    c.put("v_new_kms", v2 / 1e3, "km/s", fmt(v2 / 1e3, dec=1), "sqrt(G(M+m)/d2)", ["F09", "F06", "F02", "F01"])

    # ---- the sky ----
    th1 = math.degrees(2 * math.atan(Rm / (d1 - Re)))
    th2 = math.degrees(2 * math.atan(Rm / (d2 - Re)))
    ths = math.degrees(2 * math.atan(Rs / au))
    c.put("theta_old", th1, "deg", fmt(th1, 2), "2 atan(Rm/(d1-Re))", ["F03", "F01", "F07"])
    c.put("theta_new", th2, "deg", fmt(th2, 3), "2 atan(Rm/(d2-Re))", ["F03", "F01", "F07"])
    c.put("theta_sun", ths, "deg", fmt(ths, 3), "2 atan(Rs/AU)", ["F12", "F11"])
    c.put("theta_old_precise", th1, "deg", fmt(th1, 3), "2 atan(Rm/(d1-Re))", ["F03", "F01", "F07"])
    width_ratio = th2 / th1
    c.put("width_ratio", width_ratio, "x", fmt(width_ratio, 2), "theta2/theta1", ["F03", "F01"])
    area_ratio = width_ratio ** 2
    c.put("area_ratio", area_ratio, "x", fmt(area_ratio, 1), "(theta2/theta1)^2", ["F03", "F01"])
    dmag = 2.5 * math.log10(area_ratio)
    c.put("mag_gain", dmag, "mag", fmt(dmag, 2), "2.5 log10(area ratio)", ["F03", "F01"])
    c.put("moon_sun_ratio", th2 / ths, "x", fmt(th2 / ths, 2), "theta_moon_new / theta_sun", ["F12", "F11"])

    # ---- the month ----
    T1 = F["F04"]
    T2 = T1 / 2 ** 1.5
    c.put("period_old_d", T1, "days", fmt(T1, 3), "NASA sidereal period", ["F04"])
    c.put("period_new_d", T2, "days", fmt(T2, 2), "T1 / 2^1.5 (Kepler III)", ["F04"])
    syn1 = 1 / (1 / T1 - 1 / year)
    syn2 = 1 / (1 / T2 - 1 / year)
    c.put("synodic_old_d", syn1, "days", fmt(syn1, 3), "1/(1/T1 - 1/yr)", ["F04", "F18"])
    c.put("synodic_new_d", syn2, "days", fmt(syn2, 2), "1/(1/T2 - 1/yr)", ["F04", "F18"])
    c.put("deg_day_old", 360 / T1, "deg/day", fmt(360 / T1, 2), "360/T1", ["F04"])
    c.put("deg_day_new", 360 / T2, "deg/day", fmt(360 / T2, 2), "360/T2", ["F04"])
    rot = F["F21"] / 24
    lday1 = 1 / (1 / rot - 1 / T1) * 24
    lday2 = 1 / (1 / rot - 1 / T2) * 24
    c.put("tide_period_old_h", lday1 / 2, "h", fmt(lday1 / 2, 3), "half a lunar day", ["F21", "F04"])
    c.put("tide_period_new_h", lday2 / 2, "h", fmt(lday2 / 2, 3), "half a lunar day", ["F21", "F04"])
    c.put("moonrise_old_min", (lday1 - 24) * 60, "min", fmt((lday1 - 24) * 60, 2), "lunar day - 24 h", ["F21", "F04"])
    c.put("moonrise_new_h", lday2 - 24, "h", fmt(lday2 - 24, 2), "lunar day - 24 h", ["F21", "F04"])
    c.put("widths_per_hour", 360 / T2 / 24 / th2, "moon widths", fmt(360 / T2 / 24 / th2, 2), "deg per hour / theta_new", ["F04", "F03", "F01"])
    c.put("pull_ratio", (d1 / d2) ** 2, "x", fmt((d1 / d2) ** 2, 1), "(d1/d2)^2 (gravity ~ 1/d^2)", ["F01"])
    te1 = math.degrees(2 * math.atan(Re / (d1 - Rm)))
    te2 = math.degrees(2 * math.atan(Re / (d2 - Rm)))
    c.put("earth_from_moon_old", te1, "deg", fmt(te1, 2), "2 atan(Re/(d1-Rm))", ["F07", "F01", "F03"])
    c.put("earth_from_moon_new", te2, "deg", fmt(te2, 2), "2 atan(Re/(d2-Rm))", ["F07", "F01", "F03"])
    c.put("recession_cm", F["F22"], "cm/yr", fmt(F["F22"], 2), "lunar laser ranging", ["F22"])
    c.put("earth_diam_km", 2 * Re / 1e3, "km", fmt(2 * Re / 1e3, 5), "2 x mean radius", ["F07"])
    T1_kepler = 2 * math.pi * math.sqrt(d1 ** 3 / (G * (Me + Mm))) / 86400

    # ---- eclipses ----
    umbra = math.radians(th2 - ths) * (d2 - Re)
    c.put("umbra_km", umbra / 1e3, "km", fmt(umbra / 1e3, 2), "(theta_m - theta_s) * (d2 - Re)", ["F03", "F12", "F11", "F01"])

    # ---- tides ----
    tide_ratio = (d1 / d2) ** 3
    c.put("tide_ratio", tide_ratio, "x", fmt(tide_ratio, 1), "(d1/d2)^3", ["F01"])
    h1 = (Mm / Me) * (Re / d1) ** 3 * Re
    h2 = h1 * tide_ratio
    c.put("bulge_old_cm", h1 * 100, "cm", fmt(h1 * 100, 2), "(Mm/Me)(Re/d)^3 Re", ["F02", "F06", "F07", "F01"])
    c.put("bulge_new_m", h2, "m", fmt(h2, 2), "8 x bulge", ["F02", "F06", "F07", "F01"])
    c.put("range_old_cm", 1.5 * h1 * 100, "cm", fmt(1.5 * h1 * 100, 2), "1.5 h1", ["F02", "F06", "F07", "F01"])
    c.put("range_new_m", 1.5 * h2, "m", fmt(1.5 * h2, 2), "1.5 h2", ["F02", "F06", "F07", "F01"])
    sun_ratio_calc = (Ms / Mm) * (d1 / au) ** 3
    c.put("sun_share_old_pct", F["F15"] * 100, "%", fmt(F["F15"] * 100, 2), "NOAA/OceanMotion ~46%", ["F15"])
    sun_new = sun_ratio_calc / tide_ratio
    c.put("sun_share_new_pct", sun_new * 100, "%", fmt(sun_new * 100, 1), "0.46/8", ["F14", "F02", "F11", "F01"])
    sn_old = (1 + sun_ratio_calc) / (1 - sun_ratio_calc)
    sn_new = (1 + sun_new) / (1 - sun_new)
    c.put("spring_neap_old", sn_old, "x", fmt(sn_old, 2), "(1+r)/(1-r)", ["F14", "F02", "F11", "F01"])
    c.put("spring_neap_new_pct", (sn_new - 1) * 100, "%", fmt((sn_new - 1) * 100, 2), "((1+r')/(1-r') - 1)*100", ["F14", "F02", "F11", "F01"])

    # ---- Roche limit ----
    dR = F["F17"] * Re * (F["F08"] / F["F05"]) ** (1 / 3)
    c.put("roche_km", dR / 1e3, "km", fmt(dR / 1e3, 2), "2.44 Re (rho_E/rho_M)^(1/3)", ["F17", "F07", "F08", "F05"])
    c.put("roche_margin", d2 / dR, "x", fmt(d2 / dR, 2), "d2 / d_Roche", ["F17", "F01"])

    # ---- tidal braking ----
    brake_ratio = (d1 / d2) ** 6
    c.put("brake_ratio", brake_ratio, "x", fmt(brake_ratio, 2), "(d1/d2)^6 (torque ~ M^2/d^6)", ["F01"])
    lod_old = F["F16"]
    lod_new = lod_old * brake_ratio
    c.put("lod_old_ms", lod_old, "ms/century", fmt(lod_old, 2), "tidal friction prediction", ["F16"])
    c.put("lod_new_ms", lod_new, "ms/century", fmt(lod_new, 2), "2.3 x 64", ["F16", "F01"])
    myr_old_s = lod_old * 1e-3 * 1e4
    myr_new_min = lod_new * 1e-3 * 1e4 / 60
    c.put("myr_old_s", myr_old_s, "s per Myr", fmt(myr_old_s, 2), "2.3 ms/cy x 10,000 cy", ["F16"])
    c.put("myr_new_min", myr_new_min, "min per Myr", fmt(myr_new_min, 2), "147 ms/cy x 10,000 cy / 60", ["F16", "F01"])

    # ---- your weight ----
    a_old = 2 * G * Mm * Re / d1 ** 3
    a_new = a_old * tide_ratio
    m = F["F20"]
    c.put("weight_old_g", m * a_old / g * 1e3, "g", fmt(m * a_old / g * 1e3, 1), "m * 2GMm Re/d^3 / g", ["F20", "F09", "F02", "F07", "F01", "F10"])
    c.put("weight_new_g", m * a_new / g * 1e3, "g", fmt(m * a_new / g * 1e3, 1), "x8", ["F20", "F09", "F02", "F07", "F01", "F10"])
    c.put("person_mass", m, "kg", fmt(m), "assumed", ["F20"])

    # ---- self-checks ----
    c.check("Kepler period from G within 0.5% of NASA sidereal period", abs(T1_kepler / T1 - 1) < 0.005)
    c.check("current synodic month ~29.5 d", 29.4 < syn1 < 29.7)
    c.check("today the Moon at mean distance looks slightly smaller than the Sun (annular)", th1 < ths)
    c.check("new Moon is larger than the Sun", th2 > ths)
    c.check("computed Sun/Moon tide ratio matches cited ~0.46", abs(sun_ratio_calc - F["F15"]) < 0.02)
    c.check("Moon well outside Roche limit", d2 > 5 * dR)
    c.check("equilibrium lunar tide today ~0.36 m", 0.3 < h1 < 0.4)
    c.check("speed scales as sqrt(2)", abs(v2 / v1 - math.sqrt(2)) < 1e-9)
    c.check("energy ~ 3.8e28 J", 3.5e28 < E < 4.1e28)
    c.check("width ratio ~2", 1.95 < width_ratio < 2.1)
    c.check("today's tides every ~12.4 h", 12.3 < lday1 / 2 < 12.5)

    V = c.V
    c.card("move_energy", "Energy to pull the Moon in", "ΔE = G·M·m (1/2d₂ − 1/2d₁)",
           f"6.67×10⁻¹¹ × 5.97×10²⁴ × 7.35×10²² × (…)", f"≈ {V['move_energy']} J",
           f"= {V['sun_seconds']} s of the Sun's total output", "NASA · IAU 2015 B3")
    c.card("orbit_speed", "A faster orbit", "v = √(G·M ÷ d)", f"d halves → v × √2",
           f"{V['v_old_kms']} → {V['v_new_kms']} km/s", "circular orbit", "Kepler / Newton")
    c.card("angular_size", "How big it looks", "θ = 2·atan(R ÷ distance)",
           f"2·atan(1,737 km ÷ {V['d_new_km']} km − Earth radius)", f"{V['theta_old']}° → {V['theta_new']}°",
           f"≈ {V['width_ratio']}× wider, {V['area_ratio']}× the area", "NASA Moon Fact Sheet")
    c.card("brightness", "How bright the full Moon gets", "Δm = 2.5 · log₁₀(area ratio)",
           f"2.5 × log₁₀({V['area_ratio']})", f"≈ {V['mag_gain']} magnitudes brighter",
           "same sunlight, same surface", "photometry")
    c.card("kepler", "A shorter month", "T ∝ d^1.5", f"{V['period_old_d']} d ÷ 2^1.5",
           f"{V['period_new_d']} days per orbit", f"full Moon every {V['synodic_new_d']} days", "Kepler's 3rd law")
    c.card("eclipse", "The new eclipse shadow", "w ≈ (θ_Moon − θ_Sun) × distance",
           f"({V['theta_new']}° − {V['theta_sun']}°) × 185,800 km", f"≈ {V['umbra_km']} km wide",
           "every central eclipse is total", "IAU · NASA")
    c.card("tide_force", "Tidal force", "F_tide ∝ M ÷ d³", "(1 ÷ ½)³", f"= {V['tide_ratio']}× stronger",
           "tides come from the DIFFERENCE in pull across Earth", "Newton")
    c.card("bulge", "The open-ocean bulge", "h = (M/Mₑ)(Rₑ/d)³ Rₑ",
           f"0.0123 × (6,371 ÷ 384,400)³ × 6,371 km", f"{V['bulge_old_cm']} cm → {V['bulge_new_m']} m",
           f"tide range {V['range_old_cm']} cm → {V['range_new_m']} m (equilibrium)", "equilibrium tide theory")
    c.card("sun_share", "The Sun's share of the tide", "r = (M☉/M)(d/AU)³",
           f"{V['sun_share_old_pct']}% ÷ {V['tide_ratio']}", f"≈ {V['sun_share_new_pct']}%",
           f"spring vs neap: {V['spring_neap_old']}× → +{V['spring_neap_new_pct']}%", "NOAA")
    c.card("roche", "Would the Moon break apart?", "d_R = 2.44 · Rₑ · (ρₑ ÷ ρ_M)^⅓",
           "2.44 × 6,371 km × (5,514 ÷ 3,344)^⅓", f"≈ {V['roche_km']} km",
           f"new orbit is {V['roche_margin']}× farther out", "Roche (1849) · NASA")
    c.card("braking", "Faster tidal braking", "torque ∝ M² ÷ d⁶", f"2⁶ = {V['brake_ratio']}",
           f"{V['lod_old_ms']} → {V['lod_new_ms']} ms per century", "rough, linear extrapolation", "Stephenson et al. 2016")
    c.card("weight", "Does it change your weight?", "Δa = 2·G·M·Rₑ ÷ d³",
           f"× {V['person_mass']} kg ÷ g", f"{V['weight_old_g']} g → {V['weight_new_g']} g",
           "grams-force, Moon directly overhead", "Newton")
    c.extra["sky"] = {"theta_old": th1, "theta_new": th2, "theta_sun": ths}
    c.extra["tide"] = {"old_cm": h1 * 100, "new_cm": h2 * 100}
    c.extra["roche"] = {"roche_km": dR / 1e3, "d_new_km": d2 / 1e3, "d_old_km": d1 / 1e3, "earth_km": Re / 1e3}


def comparisons(val, facts):
    return [
        ("b01", "twice as wide", 1.9 < val["width_ratio"] < 2.1),
        ("b10", "about twice as wide", 1.9 < val["width_ratio"] < 2.1),
        ("b17", "slightly smaller than the Sun", val["theta_old_precise"] < val["theta_sun"]),
        ("b19", "twice as wide as the Sun", 1.9 < val["moon_sun_ratio"] < 2.1),
        ("b19", "Every central solar eclipse would be total", val["theta_new"] > val["theta_sun"]),
        ("b23", "double that", abs(val["tide_ratio"] / val["pull_ratio"] - 2) < 1e-9),
        ("b32", "almost vanishes", val["spring_neap_new_pct"] < 15),
        ("b35", "times farther out", 9 < val["roche_margin"] < 12),
        ("b42", "less than a tenth of a gram", val["weight_new_g"] < 0.1),
        ("b13", "about a week and a half", 9 <= val["synodic_new_d"] <= 11),
    ]


WHITELIST = {
    "2": "'2' in 'twice' notations and ordinals",
}
