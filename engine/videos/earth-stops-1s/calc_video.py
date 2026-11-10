"""Calc module for "What If Earth Stopped Spinning for 1 Second?".

Every number used in the script is computed here from research.json facts (F-ids).
Run via `python pipeline/calc.py earth-stops-1s`.
"""
from __future__ import annotations

import math

from calclib import Calc, fmt, sig


def compute(c: Calc) -> None:
    F, cities = c.F, c.cities
    # ---------- rotation ----------
    a = F["F01"] * 1000.0
    T = F["F02"] * 3600.0
    f = 1.0 / F["F03"]
    e2 = f * (2 - f)
    g = F["F04"]
    omega = 2 * math.pi / T

    def v_at(lat_deg: float) -> float:
        p = math.radians(lat_deg)
        N = a / math.sqrt(1 - e2 * math.sin(p) ** 2)
        return omega * N * math.cos(p)

    c.put("sidereal_h", F["F02"], "h", f"{F['F02']:.2f}", "sidereal rotation period", ["F02"])
    c.put("sidereal_hms", T, "s", "23 h 56 min 4 s", "23.9345 h in h:min:s", ["F02"])
    v_eq = c.put("v_eq_ms", v_at(0), "m/s", fmt(v_at(0)), "v = omega*a = 2*pi*a/T_sid", ["F01", "F02"])
    c.put("v_eq_kmh", v_eq * 3.6, "km/h", fmt(v_eq * 3.6), "v_eq * 3.6", ["F01", "F02"])
    c.put("v_eq_mph", v_eq / 0.44704, "mph", fmt(v_eq / 0.44704), "v_eq / 0.44704", ["F01", "F02"])
    v_solar = 2 * math.pi * a / 86400
    c.put("v_eq_solar_ms", v_solar, "m/s", fmt(v_solar, 4), "2*pi*a / 86400 s (solar-day convention)", ["F01"])
    c.put("circumference_km", 2 * math.pi * a / 1000, "km", fmt(2 * math.pi * a / 1000, 5),
        "2*pi*a", ["F01"])

    city_speeds = {}
    for name, lat in cities.items():
        v = v_at(lat)
        key = "v_" + name.lower().replace(" ", "") + "_ms"
        c.put(key, v, "m/s", fmt(v) if v > 1 else "0", f"omega*N(phi)*cos(phi), phi={lat}", ["F01", "F02", "F03", "F35"])
        city_speeds[name] = {"lat": lat, "v_ms": round(v, 1), "v_kmh": round(v * 3.6)}

    # ---------- the person ----------
    m_p = F["F28"]
    mu = F["F26"]
    dec = c.put("friction_decel", mu * g, "m/s^2", fmt(mu * g, 2), "mu*g", ["F26", "F04"])
    c.put("friction_dv", dec * 1.0, "m/s", fmt(dec, 1), "mu*g*1 s", ["F26", "F04"])
    c.put("v_after_friction", v_eq - dec, "m/s", fmt(v_eq - dec), "v_eq - mu*g*1s", ["F26"])
    c.put("one_sec_distance", v_eq * 1.0, "m", fmt(v_eq), "v_eq * 1 s", ["F01", "F02"])
    c.put("freefall_1s", 0.5 * g, "m", fmt(0.5 * g, 2), "1/2 g t^2, t=1 s", ["F04"])
    t_land = math.sqrt(2 * F["F29"] / g)
    c.put("t_land", t_land, "s", fmt(t_land, 2), "sqrt(2h/g), h=1 m", ["F29", "F04"])
    c.put("land_distance", v_eq * t_land, "m", fmt(v_eq * t_land, 2), "v_eq * t_land", ["F29"])
    c.put("person_mass", m_p, "kg", fmt(m_p), "assumed", ["F28"])
    ke = c.put("ke_person_mj", 0.5 * m_p * v_eq ** 2 / 1e6, "MJ", fmt(0.5 * m_p * v_eq ** 2 / 1e6, 2),
             "1/2 m v^2", ["F28", "F01", "F02"])
    c.put("ke_person_tnt", ke / F["F19"], "kg TNT", fmt(ke / F["F19"], 2), "KE / 4.184 MJ/kg", ["F19"])
    h_eq = v_eq ** 2 / (2 * g)
    c.put("fall_height_km", h_eq / 1000, "km", fmt(h_eq / 1000, 3), "v^2/(2g)", ["F04"])
    c.put("everest_km", F["F20"] / 1000, "km", fmt(F["F20"] / 1000, 3), "Everest height", ["F20"])
    c.put("fall_vs_everest", h_eq / F["F20"], "x", fmt(h_eq / F["F20"], 2), "h / Everest", ["F20"])
    v_lon = v_at(cities["London"])
    c.put("fall_height_london_km", v_lon ** 2 / (2 * g) / 1000, "km", fmt(v_lon ** 2 / (2 * g) / 1000, 2),
        "v_London^2/(2g)", ["F04"])

    # ---------- buildings ----------
    # A sideways velocity jump at the foundation propagates up the structure as a SHEAR wave.
    E_s, rho_s, yld, G_s = F["F23"] * 1e9, F["F24"], F["F25"] * 1e6, F["F31"] * 1e9
    c_s = math.sqrt(G_s / rho_s)
    c_long = math.sqrt(E_s / rho_s)
    c.put("c_steel", c_s, "m/s", fmt(c_s, 2), "shear wave speed sqrt(G/rho)", ["F31", "F24"])
    c.put("c_steel_long", c_long, "m/s", fmt(c_long, 2), "bar (compression) wave speed sqrt(E/rho)", ["F23", "F24"])
    tau = rho_s * c_s * v_eq
    tau_y = yld / math.sqrt(3)
    c.put("steel_stress_gpa", tau / 1e9, "GPa", fmt(tau / 1e9, 2), "tau = rho*c_s*dv", ["F31", "F24"])
    c.put("steel_yield_mpa", tau_y / 1e6, "MPa", fmt(tau_y / 1e6, 2), "von Mises shear yield = 250/sqrt(3)", ["F25"])
    c.put("steel_ratio", tau / tau_y, "x", fmt(tau / tau_y, 1) if tau / tau_y >= 10 else fmt(tau / tau_y, 2),
        "tau / tau_y", ["F25", "F31"])
    c.put("steel_strain_pct", v_eq / c_s * 100, "%", fmt(v_eq / c_s * 100, 2), "shear strain = dv/c_s", ["F31", "F24"])

    # ---------- air ----------
    gamma, Rg, Tsl, rho_a, p0 = F["F08"], F["F09"], F["F06"], F["F05"], F["F07"]
    c_air = math.sqrt(gamma * Rg * Tsl)
    c.put("c_air", c_air, "m/s", fmt(c_air), "sqrt(gamma R T)", ["F08", "F09", "F06"])
    M = v_eq / c_air
    c.put("mach", M, "-", fmt(M, 3), "v/c", ["F08", "F09", "F06"])
    lat_ss = math.degrees(math.acos(c_air / v_eq))  # spherical approx: v(lat) = v_eq cos(lat)
    c.put("supersonic_lat", lat_ss, "deg", fmt(lat_ss, 2), "acos(c/v_eq)", ["F08", "F09", "F06"])
    c.put("supersonic_area_pct", math.sin(math.radians(lat_ss)) * 100, "%",
        fmt(math.sin(math.radians(lat_ss)) * 100, 2), "area fraction between +/-lat = sin(lat)", [])
    c.put("supersonic_area_frac", math.sin(math.radians(lat_ss)), "-", "two-thirds",
        "sin(lat_ss) ~ 0.68", [])
    q = 0.5 * rho_a * v_eq ** 2
    c.put("q_kpa", q / 1000, "kPa", fmt(q / 1000), "1/2 rho v^2", ["F05"])
    c.put("q_atm", q / p0, "atm", fmt(q / p0, 2), "q / 101325 Pa", ["F07"])
    c.put("q_tonnes", q / g / 1000, "tonnes-force per m^2", fmt(q / g / 1000, 2), "q*1m^2/g/1000", ["F04"])
    # Rayleigh pitot formula: stagnation pressure behind a normal shock (shows q is a lower bound)
    gm = gamma
    p02_p1 = (((gm + 1) ** 2 * M ** 2) / (4 * gm * M ** 2 - 2 * (gm - 1))) ** (gm / (gm - 1)) \
        * (1 - gm + 2 * gm * M ** 2) / (gm + 1)
    pitot_over = (p02_p1 - 1) * p0
    c.put("pitot_overpressure_kpa", pitot_over / 1000, "kPa", fmt(pitot_over / 1000),
        "Rayleigh pitot: p02 - p1", ["F07", "F08"])
    v_cat5 = F["F10"] * 0.44704
    # display the km/h threshold exactly as NOAA publishes it (252), not our own conversion (252.7)
    c.put("cat5_kmh", F["F33"], "km/h", fmt(F["F33"]), "NOAA NHC published km/h threshold", ["F33"])
    check_cat5 = abs(v_cat5 * 3.6 - F["F33"]) < 1.0
    c.put("cat5_ms", v_cat5, "m/s", fmt(v_cat5, 2), "157 mph * 0.44704", ["F10"])
    q5 = 0.5 * rho_a * v_cat5 ** 2
    c.put("cat5_q_kpa", q5 / 1000, "kPa", fmt(q5 / 1000, 2), "1/2 rho v^2", ["F05", "F10"])
    c.put("hurricane_ratio", q / q5, "x", fmt(q / q5, 2), "(v_eq/v_cat5)^2", ["F10"])
    # kinetic energy of the atmosphere relative to stopped ground; area-weighted mean of cos^2 = 2/3
    ke_atm = 0.5 * F["F21"] * (2 / 3) * v_eq ** 2
    c.put("atm_ke", ke_atm, "J", f"{sig(ke_atm, 2) / 1e23:.1f} × 10²³", "1/2 M <v^2>, <cos^2>=2/3", ["F21"])
    years = ke_atm / (F["F22"] * 1e18)
    c.put("atm_ke_years", years, "years", fmt(round(years, -2), 1), "KE / world energy per year (rounded to 100)", ["F22"])

    # ---------- oceans ----------
    d = F["F11"]
    c.put("ocean_depth_km", d / 1000, "km", fmt(d / 1000, 2), "NOAA average depth", ["F11"])
    vol = v_eq * 1.0 * d
    c.put("ocean_volume_per_m", vol / 1e6, "million m^3 per m", fmt(vol / 1e6, 2), "v*1s*depth", ["F11"])
    c.put("olympic_pools", vol / F["F27"], "pools per m", fmt(vol / F["F27"], 2), "vol / 2500 m^3", ["F27"])
    rho_w, c_w = F["F12"], F["F13"]
    dp = rho_w * c_w * v_eq
    c.put("hammer_mpa", dp / 1e6, "MPa", fmt(dp / 1e6, 2), "Joukowsky rho*c*dv", ["F12", "F13", "F34"])
    c.put("hammer_atm", dp / p0, "atm", fmt(dp / p0, 2), "dp / 101325", ["F07"])
    p_deep = p0 + rho_w * g * F["F14"]
    c.put("trench_mpa", p_deep / 1e6, "MPa", fmt(p_deep / 1e6, 3), "p0 + rho g h", ["F12", "F14"])
    ratio_h = dp / p_deep
    c.put("hammer_ratio", ratio_h, "x", fmt(ratio_h, 2), "dp / p_trench", ["F14"])
    c.put("hammer_ratio_floor", math.floor(ratio_h), "x", str(math.floor(ratio_h)), "floor(ratio)", ["F14"])
    c_t = math.sqrt(g * d)
    c.put("tsunami_ms", c_t, "m/s", fmt(c_t), "sqrt(g d)", ["F04", "F11"])
    c.put("tsunami_kmh", c_t * 3.6, "km/h", fmt(c_t * 3.6), "sqrt(g d)*3.6", ["F04", "F11", "F15"])
    c.put("tsunami_mph", c_t / 0.44704, "mph", fmt(c_t / 0.44704), "sqrt(g d)/0.44704", ["F04", "F11"])
    c.put("jet_ratio", c_t * 3.6 / F["F32"], "x", fmt(c_t * 3.6 / F["F32"], 2), "tsunami / jet cruise", ["F32"])
    c.put("ocean_cross_km", 5000, "km", "5,000", "illustrative ocean width", [])
    c.put("ocean_cross_h", 5_000_000 / c_t / 3600, "h", fmt(5_000_000 / c_t / 3600, 2), "5000 km / c", ["F11"])

    # ---------- safe places / aftermath ----------
    v_iss = F["F18"] * 0.44704
    c.put("iss_kmh", v_iss * 3.6, "km/h", fmt(v_iss * 3.6, 2), "17,500 mph in km/h", ["F18"])
    c.put("iss_vs_ground", v_iss / v_eq, "x", fmt(v_iss / v_eq, 2), "v_iss / v_eq", ["F18"])
    rot_arcsec = 360 * 3600 / T
    c.put("rot_arcsec", rot_arcsec, "arcsec", fmt(rot_arcsec, 2), "360°/T_sid * 1 s", ["F02"])
    c.put("leap_count", F["F16"], "count", fmt(F["F16"]), "IERS list", ["F16"])
    c.put("ut1_tolerance", F["F17"], "s", "0.9", "IERS rule", ["F17"])

    # ---------- self-checks ----------
    c.check("v_eq ~ 465 m/s", 464 < v_eq < 466)
    c.check("v_eq_kmh rounds to 1,670", c.values["v_eq_kmh"]["display"] == "1,670")
    c.check("equator speed is supersonic", v_eq > c_air)
    c.check("pole speed ~ 0", v_at(90) < 1e-6)
    by_lat = sorted(city_speeds.values(), key=lambda c: abs(c["lat"]))
    c.check("speeds decrease with |latitude|",
          all(x["v_ms"] >= y["v_ms"] for x, y in zip(by_lat[:-1], by_lat[1:])))
    c.check("spherical cross-check within 0.5%", abs(omega * a * math.cos(math.radians(40.71)) / v_at(40.71) - 1) < 0.005)
    c.check("pitot overpressure >= q (q is a lower bound)", pitot_over >= q)
    c.check("energy/height consistent: m g h == KE", abs(m_p * g * h_eq - 0.5 * m_p * v_eq ** 2) < 1e-6)
    c.check("fall height above Everest", h_eq > F["F20"])
    c.check("tsunami slower than 'jet' 500 mph but same order", 300 < c_t / 0.44704 < 600)
    c.check("hammer > trench pressure", ratio_h > 1)
    c.check("ISS faster than ground", v_iss > v_eq)
    c.check("c_air ~ 340 m/s", 339 < c_air < 342)
    c.check("NOAA km/h and mph Cat-5 thresholds agree", check_cat5)
    c.check("shear wave slower than bar wave", c_s < c_long)
    c.check("supersonic band ~ 40-45 deg", 40 < lat_ss < 45)
    c.check("supersonic area ~ two-thirds", 0.62 < math.sin(math.radians(lat_ss)) < 0.72)

    # ---------- Math Cards ----------
    V = c.V
    c.cards.update({
        "v_equator": {"title": "How fast is the equator moving?",
                      "formula": "v = 2πR ÷ T",
                      "sub": f"2π × 6,378.137 km ÷ {V['sidereal_hms']}",
                      "result": f"{V['v_eq_ms']} m/s ≈ {V['v_eq_kmh']} km/h",
                      "note": "T = sidereal day (one turn relative to the stars)", "src": "NASA Earth Fact Sheet · WGS84"},
        "v_latitude": {"title": "Your speed depends on latitude",
                       "formula": "v = ω · R · cos(latitude)",
                       "sub": f"London 51.5°N: {V['v_eq_ms']} × cos 51.5° (WGS84)",
                       "result": f"≈ {V['v_london_ms']} m/s",
                       "note": "Exact ellipsoid formula used in calc.py", "src": "WGS84"},
        "friction": {"title": "Can friction stop you?",
                     "formula": "a = μ · g",
                     "sub": f"0.7 × 9.81 m/s² = {V['friction_decel']} m/s²",
                     "result": f"after 1 s: still {V['v_after_friction']} m/s",
                     "note": "μ ≈ 0.7: rubber on dry concrete", "src": "Engineering ToolBox"},
        "ke_person": {"title": "Your kinetic energy",
                      "formula": "E = ½ m v²",
                      "sub": f"½ × {V['person_mass']} kg × ({V['v_eq_ms']} m/s)²",
                      "result": f"{V['ke_person_mj']} MJ ≈ {V['ke_person_tnt']} kg of TNT",
                      "note": "1 kg TNT = 4.184 MJ", "src": "NIST SP 811"},
        "fall_height": {"title": "Same as falling from…",
                        "formula": "h = v² ÷ 2g",
                        "sub": f"({V['v_eq_ms']} m/s)² ÷ (2 × 9.81 m/s²)",
                        "result": f"{V['fall_height_km']} km  (Everest: {V['everest_km']} km)",
                        "note": "No air resistance", "src": "Everest: Britannica"},
        "steel_stress": {"title": "The shear wave in steel",
                         "formula": "τ = ρ · c · Δv",
                         "sub": f"7,850 kg/m³ × {V['c_steel']} m/s × {V['v_eq_ms']} m/s",
                         "result": f"{V['steel_stress_gpa']} GPa ≈ {V['steel_ratio']}× yield",
                         "note": f"c = √(G/ρ); A36 shear yield = 250 MPa ÷ √3 ≈ {V['steel_yield_mpa']} MPa", "src": "ASTM A36 · Eng. ToolBox"},
        "mach": {"title": "How fast is that wind?",
                 "formula": "c = √(γ R T) ,  M = v ÷ c",
                 "sub": f"√(1.4 × 287 × 288 K) = {V['c_air']} m/s",
                 "result": f"Mach {V['mach']}",
                 "note": f"Supersonic within ±{V['supersonic_lat']}° latitude ({V['supersonic_area_pct']}% of Earth)", "src": "US Standard Atmosphere 1976"},
        "ram_pressure": {"title": "The push on every wall",
                         "formula": "q = ½ ρ v²",
                         "sub": f"½ × 1.225 kg/m³ × ({V['v_eq_ms']} m/s)²",
                         "result": f"≥ {V['q_kpa']} kPa ≈ {V['q_tonnes']} t per m²",
                         "note": f"Shock-corrected: ~{V['pitot_overpressure_kpa']} kPa", "src": "NASA Glenn"},
        "hurricane_ratio": {"title": "vs. a Category 5 hurricane",
                            "formula": "q₁ ÷ q₂ = (v₁ ÷ v₂)²",
                            "sub": f"({V['v_eq_ms']} ÷ {V['cat5_ms']} m/s)²",
                            "result": f"≈ {V['hurricane_ratio']}× the push",
                            "note": f"Cat 5 starts at {V['cat5_kmh']} km/h", "src": "NOAA NHC"},
        "atm_ke": {"title": "Energy in the moving air",
                   "formula": "E = ½ M ⟨v²⟩",
                   "sub": f"½ × 5.15×10¹⁸ kg × ⅔ × ({V['v_eq_ms']} m/s)²",
                   "result": f"≈ {V['atm_ke']} J ≈ {V['atm_ke_years']} yrs of human energy use",
                   "note": "⟨v²⟩ = ⅔ v² (area average of cos²); world use ≈ 620 EJ/yr", "src": "Trenberth & Smith 2005 · Energy Institute"},
        "ocean_volume": {"title": "Water on the move",
                         "formula": "V = v · t · depth",
                         "sub": f"{V['v_eq_ms']} m/s × 1 s × {V['ocean_depth_km']} km",
                         "result": f"{V['ocean_volume_per_m']} million m³ per metre",
                         "note": f"≈ {V['olympic_pools']} Olympic pools per metre of coast", "src": "NOAA (avg depth)"},
        "water_hammer": {"title": "Water hammer",
                         "formula": "Δp = ρ · c · Δv",
                         "sub": f"1,025 kg/m³ × 1,500 m/s × {V['v_eq_ms']} m/s",
                         "result": f"≈ {V['hammer_mpa']} MPa  ({V['hammer_ratio']}× Challenger Deep)",
                         "note": f"Trench floor ≈ {V['trench_mpa']} MPa", "src": "Joukowsky · NOAA"},
        "tsunami_speed": {"title": "Tsunami speed",
                          "formula": "c = √(g · d)",
                          "sub": f"√(9.81 m/s² × {F['F11']:,.0f} m)",
                          "result": f"{V['tsunami_ms']} m/s ≈ {V['tsunami_kmh']} km/h",
                          "note": f"5,000 km in ≈ {V['ocean_cross_h']} h", "src": "NOAA"},
        "rotation_lag": {"title": "Earth is now one second late",
                         "formula": "θ = 360° × (1 s ÷ T)",
                         "sub": f"1,296,000″ ÷ {T:,.0f} s",
                         "result": f"{V['rot_arcsec']} arcseconds behind",
                         "note": f"Fix: 1 leap second (there have been {V['leap_count']})", "src": "IERS"},
    })
    c.extra["city_speeds"] = city_speeds


# Worded comparisons in the narration, re-derived by factcheck.py: (beat, phrase, holds?)
def comparisons(val, facts):
    return [
        ("b04", "about four minutes shorter", 3.5 <= (86400 - val["sidereal_hms"]) / 60 <= 4.5),
        ("b05", "faster than the speed of sound", val["v_eq_ms"] > val["c_air"]),
        ("b07", "turning in place", val["v_northpole_ms"] < 1),
        ("b16", "takes off just", val["friction_dv"] < 0.05 * val["v_eq_ms"]),
        ("b17", "almost half a kilometer", 400 <= val["one_sec_distance"] < 500),
        ("b20", "higher than Mount Everest", val["fall_height_km"] * 1000 > facts["F20"]["value"]),
        ("b21", "smaller, but not small enough", val["fall_height_london_km"] > 1),
        ("b25", "times that", val["steel_ratio"] > 10),
        ("b28", "supersonic everywhere within", val["mach"] > 1),
        ("b28", "two-thirds", 0.62 <= val["supersonic_area_frac"] <= 0.72),
        ("b29", "at least", val["pitot_overpressure_kpa"] >= val["q_kpa"]),
        ("b33", "less than half a kilometer", val["one_sec_distance"] < 500),
        ("b37", "more than 6 times", val["hammer_ratio"] > 6),
        ("b39", "nearly as fast as a jet airliner", 0.7 <= val["jet_ratio"] < 1.0),
        ("b43", "wouldn't notice", val["iss_kmh"] > val["v_eq_kmh"]),
        ("b51", "one more leap second", 1.0 > val["ut1_tolerance"]),
    ]


# Bare numbers that are labels, not measurements
WHITELIST = {
    "5": "'Category 5' is a scale name (NOAA NHC)",
    "24": "'24-hour day' - the civil day",
    "1972": "start of leap seconds (IERS, research F16)",
}
