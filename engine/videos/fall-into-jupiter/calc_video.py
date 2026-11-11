"""Calc module for "What If You Fell Into Jupiter?" (fall-into-jupiter).

Every number in the narration, on-screen text, gauge, thumbnail and Shorts is computed here from the
facts in research.json. Models (stated in research.md): radial Newtonian free fall; H2/He ideal-gas
dry adiabat T = T0 (P/1 bar)^(2/7) for the upper atmosphere; an index-1 polytrope for the interior.
Run via `python pipeline/calc.py fall-into-jupiter`.
"""
from __future__ import annotations

import math

from calclib import Calc, fmt

START_KM = 1_000_000          # scenario: start at rest 1,000,000 km from Jupiter's centre
POD_MASS, POD_AREA, POD_CD = 80.0, 0.7, 1.0   # scenario: human-sized pod, belly first


def compute(c: Calc) -> None:
    F = c.F
    GM = F["F02"] * 1e9                     # m^3/s^2
    R = F["F03"] * 1e3                      # 1-bar equatorial radius, m
    Rm = F["F04"] * 1e3                     # mean radius, m
    M = F["F01"]
    G = F["F37"]
    g = F["F06"]
    Rgas = F["F36"]
    mu = F["F11"] / 1000
    T0 = F["F09"]
    atm = F["F44"]
    mile = F["F41"] * 1000
    rho_you = F["F33"]

    c.check("GM consistent with G*M within 0.1%", abs(G * M / GM - 1) < 1e-3)
    c.check("mean density from M and mean radius within 1%", abs(M / (4 / 3 * math.pi * Rm ** 3) / F["F05"] - 1) < 0.01)

    # ---------------------------------------------------------------- the fall
    r0 = START_KM * 1e3
    v = math.sqrt(2 * GM * (1 / R - 1 / r0))
    x = R / r0
    t_fall = math.sqrt(r0 ** 3 / (2 * GM)) * (math.sqrt(x * (1 - x)) + math.acos(math.sqrt(x)))
    c.put("start_km", START_KM, "km", "1,000,000", "scenario: start at rest this far from Jupiter's centre")
    c.put("fall_h", t_fall / 3600, "h", fmt(t_fall / 3600, 2), "radial infall time from rest at r0 to R", ["F02", "F03"])
    c.put("v_kms", v / 1000, "km/s", fmt(v / 1000, 2), "v = sqrt(2GM(1/R - 1/r0))", ["F02", "F03"])
    c.put("v_kmh", v * 3.6, "km/h", fmt(v * 3.6, 2), "arrival speed in km/h", ["F02", "F03"])
    c.put("v_esc", F["F07"], "km/s", fmt(F["F07"], 3), "escape velocity (NASA)", ["F07"])
    spin = 2 * math.pi * R / (F["F08"] * 3600)
    c.put("spin_kms", spin / 1000, "km/s", fmt(spin / 1000, 3), "equatorial speed of the 1-bar level", ["F03", "F08"])
    rifle = v / (F["F42"] * 1000)
    c.put("x_rifle", rifle, "x", fmt(rifle, 2), "arrival speed / rifle bullet speed", ["F02", "F03", "F42"])
    turns = t_fall / (F["F08"] * 3600)
    c.put("fall_turns", turns, "turns", fmt(turns, 2), "Jupiter rotations during the fall", ["F02", "F03", "F08"])
    c.check("arrival speed below escape velocity", v / 1000 < F["F07"])
    c.check("fall takes about a day", 20 < t_fall / 3600 < 40)
    gal = F["F17"] * mile / 3600
    c.put("galileo_kms", gal / 1000, "km/s", fmt(gal / 1000, 3), "Galileo probe entry speed in km/s", ["F17", "F41"])
    c.put("galileo_mph", F["F17"], "mph", fmt(F["F17"], 3), "Galileo probe entry speed (NASA)", ["F17"])
    c.check("Galileo entered slower than our free fall", gal < v)
    c.put("size_earths", F["F03"] / F["F16"], "x", fmt(F["F03"] / F["F16"], 2), "Jupiter equatorial radius / Earth mean radius", ["F03", "F16"])
    wt = g / F["F43"]
    c.put("weight_x", wt, "x", fmt(wt, 2), "gravity ratio at 1 bar", ["F06", "F43"])
    c.card("fall", "Falling from 1 million km", "v = √(2GM (1/R − 1/r₀))",
           f"GM = {fmt(F['F02'], 6)} km³/s², R = {fmt(F['F03'], 5)} km", f"{fmt(v / 1000, 3)} km/s",
           f"after {fmt(t_fall / 3600, 3)} hours of falling", "NASA Jupiter Fact Sheet")

    # ---------------------------------------------------------------- entry
    ke = 0.5 * v ** 2
    tnt = ke / F["F35"]
    c.put("tnt_per_kg", tnt, "kg TNT per kg", fmt(tnt, 2), "1/2 v^2 / TNT energy per kg", ["F02", "F03", "F35"])
    c.put("tnt_you", tnt * 70 / 1000, "t TNT", fmt(tnt * 70 / 1000, 2), "for a 70 kg person, tonnes of TNT", ["F02", "F03", "F35"])
    c.put("galileo_g", F["F18"], "g", fmt(F["F18"], 3), "Galileo probe deceleration, more than", ["F18"])
    c.put("stapp_g", F["F32"], "g", fmt(F["F32"], 3), "John Stapp's 1954 record", ["F32"])
    gx = F["F18"] / F["F32"]
    c.put("g_ratio", gx, "x", fmt(gx, 2), "Galileo deceleration / Stapp record", ["F18", "F32"])
    c.put("shield_f", F["F19"], "°F", fmt(F["F19"], 3), "Galileo heat shield temperature", ["F19"])
    shield_c = (F["F19"] - 32) / 1.8
    c.put("shield_c", shield_c, "°C", fmt(shield_c, 2), "16,000 °F in °C", ["F19"])
    c.card("entry", "Energy you bring", "E/m = ½ v²", f"½ × ({fmt(v, 3)} m/s)²", f"≈ {fmt(tnt, 2)} kg of TNT per kg",
           "TNT: 4.184 MJ per kg", "NASA, NIST")
    c.check("entry energy far above TNT", tnt > 100)

    # ---------------------------------------------------------------- upper atmosphere (dry adiabat)
    cp = 3.5 * Rgas / mu
    lapse = g / cp                                         # K per m
    c.put("lapse", lapse * 1000, "K/km", fmt(lapse * 1000, 2), "dry adiabatic lapse rate g/cp", ["F06", "F11", "F36"])
    T = lambda p: T0 * p ** (2 / 7)                        # noqa: E731
    z = lambda Tk: (Tk - T0) / lapse / 1000                # km below the 1-bar level   # noqa: E731
    rho_at = lambda p: p * 1e5 * mu / (Rgas * T(p))        # noqa: E731
    c.check("adiabat density at 1 bar matches NASA (0.16 kg/m3) within 10%", abs(rho_at(1) / F["F10"] - 1) < 0.1)
    c.put("t1_c", T0 - 273.15, "°C", fmt(T0 - 273.15, 3), "temperature at 1 bar", ["F09"])
    for key, p, fid in (("nh3", F["F28"], "F28"), ("nh4sh", F["F29"], "F29"), ("h2o", F["F30"], "F30")):
        c.put(f"p_{key}", p, "bar", fmt(p, 2), f"cloud level pressure ({fid})", [fid])
        c.put(f"t_{key}", T(p) - 273.15, "°C", fmt(T(p) - 273.15, 2), "adiabat T = T0 (P/1 bar)^(2/7)", ["F09", fid])
        c.put(f"c_{key}", 273.15 - T(p), "°C below zero", fmt(273.15 - T(p), 2), "degrees below 0 C (positive)", ["F09", fid])
        c.put(f"z_{key}", z(T(p)), "km", fmt(abs(z(T(p))), 2), "depth below (+) / height above (-) the 1-bar level", ["F06", "F09", "F11", "F36", fid])
    room = 293.15
    c.put("room_c", 20, "°C", "20", "room temperature (definition used here)", [])
    p_room = (room / T0) ** 3.5
    c.put("p_room", p_room, "bar", fmt(p_room, 2), "pressure where the adiabat reaches 20 C", ["F09"])
    c.put("z_room", z(room), "km", fmt(z(room), 2), "depth of room temperature", ["F06", "F09", "F11", "F36"])
    c.put("room_min", F["F22"], "min", fmt(F["F22"], 2), "Galileo: entry to room temperature", ["F22"])
    c.put("gal_min", F["F20"], "min", fmt(F["F20"], 2), "Galileo data return", ["F20"])
    c.put("gal_miles", F["F21"], "miles", fmt(F["F21"], 2), "Galileo descent distance", ["F21"])
    c.put("gal_km", F["F21"] * F["F41"], "km", fmt(F["F21"] * F["F41"], 2), "Galileo descent distance in km", ["F21", "F41"])
    c.put("vapor_h", F["F23"], "h", fmt(F["F23"], 2), "Galileo probe vaporized within", ["F23"])
    c.put("clouds_km", F["F24"], "km", fmt(F["F24"], 2), "three cloud layers span", ["F24"])
    c.put("wind_kmh", F["F15"], "km/h", fmt(F["F15"], 3), "fastest prevailing winds", ["F15"])
    c.put("lightning_c", F["F31"], "°C", fmt(F["F31"], 2), "shallow lightning altitude temperature", ["F31"])
    c.put("c_lightning", -F["F31"], "°C below zero", fmt(-F["F31"], 2), "same, as degrees below zero", ["F31"])
    c.put("c_1bar", 273.15 - T0, "°C below zero", fmt(273.15 - T0, 3), "1-bar temperature as degrees below zero", ["F09"])
    c.put("grs_km", F["F25"], "km", fmt(F["F25"], 2), "Great Red Spot depth", ["F25"])
    c.put("jets_km", F["F26"], "km", fmt(F["F26"], 2), "jet stream depth", ["F26"])
    c.check("room temperature is below the water clouds", p_room > F["F30"])
    c.check("model room-temperature depth within Galileo's descent", z(room) < F["F21"] * F["F41"])
    c.card("adiabat", "Why it heats up as you fall", "T = T₀ (P / 1 bar)^(2/7)", f"T₀ = {fmt(T0, 3)} K at 1 bar",
           f"≈ {fmt(room - 273.15, 2)} °C near {fmt(p_room, 2)} bar", "ideal H₂/He gas, no heat exchange (a model)", "NASA; textbook adiabat")

    # terminal speed in the upper atmosphere
    def vt(rho, gg):
        w = max(0.0, 1 - rho / rho_you)
        return math.sqrt(2 * POD_MASS * gg * w / (rho * POD_CD * POD_AREA))
    c.put("vt_1bar", vt(rho_at(1), g), "m/s", fmt(vt(rho_at(1), g), 2), "terminal speed of the pod at 1 bar", ["F06", "F09", "F11", "F33", "F36"])
    c.put("vt_1bar_kmh", vt(rho_at(1), g) * 3.6, "km/h", fmt(vt(rho_at(1), g) * 3.6, 2), "same, km/h", ["F06", "F09", "F11", "F33", "F36"])
    c.card("terminal", "Terminal speed", "v = √(2mg / ρ C A)", f"m = {fmt(POD_MASS, 2)} kg, A = {POD_AREA} m², ρ = {fmt(rho_at(1), 2)} kg/m³",
           f"≈ {fmt(vt(rho_at(1), g) * 3.6, 2)} km/h at 1 bar", "the thicker the air, the slower you fall", "NASA; drag law")

    # ---------------------------------------------------------------- deep: polytrope n = 1
    rho_c = math.pi ** 2 / 3 * F["F05"]
    K = 2 * G * Rm ** 2 / math.pi
    k = math.pi / Rm
    rho_p = lambda r: rho_c * math.sin(k * r) / (k * r) if r > 0 else rho_c   # noqa: E731
    g_p = lambda r: 4 * math.pi * G * rho_c * (math.sin(k * r) - k * r * math.cos(k * r)) / (k ** 3 * r ** 2)  # noqa: E731
    c.check("polytrope mass equals Jupiter's mass within 1%", abs(4 * math.pi * rho_c / k ** 3 * math.pi / M - 1) < 0.01)
    lo, hi = 1.0, Rm
    for _ in range(80):
        mid = (lo + hi) / 2
        if rho_p(mid) > rho_you:
            lo = mid
        else:
            hi = mid
    r_float = lo
    d_float = (Rm - r_float) / 1000
    p_float = K * rho_you ** 2
    c.put("rho_c", rho_c, "kg/m^3", fmt(rho_c, 2), "polytrope central density pi^2/3 * mean density", ["F05", "F34"])
    c.put("float_km", d_float, "km", fmt(d_float, 2), "depth where the polytrope density equals a human body's", ["F01", "F04", "F05", "F33", "F34", "F37"])
    c.put("float_frac", d_float * 1000 / Rm, "-", fmt(d_float * 1000 / Rm, 1), "fraction of the radius", ["F04", "F05", "F33", "F34"])
    c.put("float_pct", 100 * d_float * 1000 / Rm, "%", fmt(100 * d_float * 1000 / Rm, 2), "percent of the way to the centre", ["F04", "F05", "F33", "F34"])
    c.put("float_matm", p_float / atm / 1e6, "million atm", fmt(p_float / atm / 1e6, 2), "P = K rho^2 at rho = 1000", ["F01", "F04", "F33", "F34", "F37", "F44"])
    c.put("metal_frac", F["F27"], "-", "halfway", "metallic hydrogen perhaps halfway (NASA)", ["F27"])
    p_center = K * rho_c ** 2
    c.put("center_matm", p_center / atm / 1e6, "million atm", fmt(p_center / atm / 1e6, 2), "polytrope central pressure", ["F04", "F05", "F34", "F37", "F44"])
    c.check("float depth is shallower than the metallic layer (NASA: perhaps halfway)", d_float * 1000 / Rm < F["F27"])
    c.check("float depth below the deepest jet streams", d_float > F["F26"])
    c.card("float", "Where you stop sinking", "ρ(r) = ρc · sin(kr) / kr = ρyou",
           f"ρc = {fmt(rho_c, 2)} kg/m³, ρyou ≈ {fmt(rho_you, 2)} kg/m³", f"≈ {fmt(d_float, 2)} km down",
           "index-1 polytrope (a simple model of Jupiter)", "NASA; Dewberry & Lai 2023")

    # ---------------------------------------------------------------- sinking time (crude bridge)
    def rho_any(depth_m):
        if depth_m >= 1e6:        # below ~1,000 km the ideal gas law fails: polytrope only
            return rho_p(Rm - depth_m)
        Tk = T0 + lapse * depth_m
        p = (Tk / T0) ** 3.5
        return max(rho_at(p), rho_p(Rm - depth_m))

    def g_any(depth_m):
        return g if depth_m < 1e6 else g_p(Rm - depth_m)

    t, d, marks = 0.0, 0.0, {}
    stop = r_float
    step = 50.0
    targets = {"t_100": 100e3, "t_1000": 1000e3, "t_5000": 5000e3}
    while Rm - d > stop + 100e3:
        rho = rho_any(d)
        vv = vt(rho, g_any(d))
        t += step / vv
        d += step
        if d > 2000e3:
            step = 500.0
        for kk, tgt in targets.items():
            if kk not in marks and d >= tgt:
                marks[kk] = t
    c.put("sink_days", t / 86400, "days", fmt(t / 86400, 2), "time to sink to within 100 km of the float depth", ["F04", "F05", "F06", "F09", "F11", "F33", "F34", "F36", "F37"])
    c.put("t100_min", marks["t_100"] / 60, "min", fmt(marks["t_100"] / 60, 2), "time to sink 100 km below 1 bar", ["F06", "F09", "F11", "F33", "F36"])
    c.put("t1000_h", marks["t_1000"] / 3600, "h", fmt(marks["t_1000"] / 3600, 2), "time to sink 1,000 km", ["F06", "F09", "F11", "F33", "F36"])
    c.put("d100", 100, "km", "100", "depth chosen for the timing beat", [])
    c.put("d1000", 1000, "km", "1,000", "depth chosen for the 'black heat' rung", [])
    rho1000 = rho_any(999e3)
    c.put("v1000_kmh", vt(rho1000, g) * 3.6, "km/h", fmt(vt(rho1000, g) * 3.6, 2), "terminal speed 1,000 km down", ["F06", "F09", "F11", "F33", "F36"])
    T1000 = T0 + lapse * 1e6
    c.put("t1000_c", T1000 - 273.15, "°C", fmt(T1000 - 273.15, 2), "adiabat temperature 1,000 km down", ["F06", "F09", "F11", "F36"])
    p1000 = (T1000 / T0) ** 3.5
    c.put("p1000_atm", p1000 * 1e5 / atm, "atm", fmt(p1000 * 1e5 / atm, 1), "adiabat pressure 1,000 km down (ideal gas: rough)", ["F06", "F09", "F11", "F36", "F44"])
    c.put("p1000_round", 8000, "atm", "8,000", "rounded to about 8,000 atmospheres", ["F06", "F09", "F11", "F36", "F44"])
    c.check("rounded pressure within 5% of model", abs(p1000 * 1e5 / atm / 8000 - 1) < 0.05)
    c.check("sinking takes days, not years", 1 < t / 86400 < 365)
    c.extra["layers"] = [
        {"r": 1.0, "label": "Clouds + hydrogen gas"},
        {"r": round(r_float / Rm, 4), "label": "Liquid hydrogen ocean"},
        {"r": round(1 - F["F27"], 3), "label": "Metallic hydrogen"},
    ]


WHITELIST = {"1995": "year of the Galileo probe entry (7 December 1995, S5)", "2025": "year of the Oxford cloud study (S6)",
             "7": "day of the Galileo probe entry, December 7 (S5)", "0": "depth 0 km = the 1-bar reference level (definition)"}


def comparisons(val, facts):
    return [
        ("b04", "faster than", val["v_kms"] > val["galileo_kms"]),
        ("b09", "four times", 3.9 < val["g_ratio"] < 4.6),
    ]
