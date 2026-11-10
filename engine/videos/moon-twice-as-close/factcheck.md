# Fact-check report: What If the Moon Was Twice as Close?

Generated 2026-11-10T00:29:32+00:00 by `pipeline/factcheck.py`. Status: **PASS**

Layers: (A) every number traced to calc.json, (B) worded comparisons re-derived from calc.json, (C) editorial verdict for every beat, pinned to a hash of the beat text.

## Fixes made by the review pass

- **b07**: 'you first have to slow it down' implied the only possible method → *'you'd slow it down' (one standard way)*
- **b29**: 'twice a day, every day' contradicts the new 13.3-hour tidal period computed in b26 → *'about every 13 hours, without a break'*
- **b12/b40 calc**: display rounding showed '1' km/s and '99' s → *fixed-decimal display (1.0 km/s) and 1-sig-fig '100' s*
- **script**: first draft estimated at 6.4 min (< 8 min target, caught by build_script.py) → *added substantive beats (orbit mechanics, phases, Earth seen from the Moon, pull vs tide, recession)*

## (B) Worded comparisons

| Beat | Phrase | Result |
|---|---|---|
| b01 | twice as wide | PASS |
| b10 | about twice as wide | PASS |
| b17 | slightly smaller than the Sun | PASS |
| b19 | twice as wide as the Sun | PASS |
| b19 | Every central solar eclipse would be total | PASS |
| b23 | double that | PASS |
| b32 | almost vanishes | PASS |
| b35 | times farther out | PASS |
| b42 | less than a tenth of a gram | PASS |
| b13 | about a week and a half | PASS |

## (A + C) Beat-by-beat

### b01 · verdict: ok
> Imagine stepping outside tonight and seeing a Moon twice as wide as the one you know.

- Review: theta ratio 1.07/0.527 = 2.03 for an observer under the Moon: 'twice as wide' holds.

### b02 · verdict: ok
> Beautiful. Except every tide on Earth would be pulled 8 times harder. So what if the Moon was twice as close?

- `8` (narration) = `tide_ratio` = 8 x · (d1/d2)^3 · facts F01 · sources S1
- `8` (on-screen) = `tide_ratio` = 8 x · (d1/d2)^3 · facts F01 · sources S1
- Review: Tidal acceleration ∝ M/d³ → (2)³ = 8; 'pulled 8 times harder' refers to the tidal pull, defined in b21-b23.

### b03 · verdict: rhetoric
> This is The If Engine, where impossible scenarios get real physics, and every number is shown on screen.

- Review: Channel intro; no factual claim beyond the show format.

### b04 · verdict: ok
> Today the Moon orbits about 384,400 kilometers away, on average. We'll halve that, to 192,200 kilometers, on a neat circular orbit.

- `384,400` (narration) = `d_old_km` = 384400 km · NASA mean distance · facts F01 · sources S1
- `192,200` (narration) = `d_new_km` = 192200 km · d/2 · facts F01 · sources S1
- Review: NASA semimajor axis 384,400 km; scenario halves it to 192,200 km (stated as an assumption).

### b05 · verdict: ok
> Moving it would not be easy. Bringing the Moon closer means draining energy from its orbit: about 3.8 × 10²⁸ joules.

- `3.8 × 10²⁸` (narration) = `move_energy` = 3.80871e+28 J · G Me Mm (1/2d2 - 1/2d1) · facts F09, F06, F02, F01 · sources S1, S2, S3
- `3.8 × 10²⁸` (visual) = `move_energy` = 3.80871e+28 J · G Me Mm (1/2d2 - 1/2d1) · facts F09, F06, F02, F01 · sources S1, S2, S3
- Review: Inward move lowers orbital energy: ΔE = G Me Mm (1/2d2 − 1/2d1) = 3.8e28 J.

### b06 · verdict: ok
> That's roughly what the entire Sun radiates into space in 100 seconds. Not a job for rockets.

- `100` (narration) = `sun_seconds` = 99.496 s · E / L_sun · facts F13 · sources S5
- `100` (visual) = `sun_seconds` = 99.496 s · E / L_sun · facts F13 · sources S5
- Review: 3.8e28 J ÷ 3.828e26 W (IAU nominal L☉) = 99.5 s → 'roughly 100 seconds'.

### b07 · verdict: fixed
> Here's the strange part. To bring a moon closer, you'd slow it down. It would then fall inward, and end up moving faster than before. Orbits are counterintuitive like that.

- Review: Draft said you 'first have to' slow it; other manoeuvres exist, so softened to 'you'd slow it down' (Hohmann-style descent).

### b08 · verdict: ok
> So we'll skip the how. Our Moon simply arrives in its new orbit, moving at 1.4 kilometers per second instead of 1.0, exactly the speed that orbit needs.

- `1.4` (narration) = `v_new_kms` = 1.44893 km/s · sqrt(G(M+m)/d2) · facts F09, F06, F02, F01 · sources S1, S2, S3
- `1.0` (narration) = `v_old_kms` = 1.02455 km/s · sqrt(G(M+m)/d1) · facts F09, F06, F02, F01 · sources S1, S2, S3
- Review: v = √(G(M+m)/d): 1.02 → 1.44 km/s (√2).

### b09 · verdict: rhetoric
> And the first thing anyone would notice is the night sky.

- Review: Transition line; no factual claim.

### b10 · verdict: ok
> Today the full Moon spans about 0.53 degrees of sky. At half the distance, it spans 1.07 degrees, about twice as wide.

- `0.53` (narration) = `theta_old` = 0.526653 deg · 2 atan(Rm/(d1-Re)) · facts F03, F01, F07 · sources S1, S2
- `1.07` (narration) = `theta_new` = 1.07134 deg · 2 atan(Rm/(d2-Re)) · facts F03, F01, F07 · sources S1, S2
- Review: 2·atan(Rm/(d−Re)) for an observer below the Moon: 0.53° → 1.07°.

### b11 · verdict: ok
> Twice as wide means about 4 times the area. Same sunlight, same dusty gray surface, so the full Moon would shine about 4 times brighter, roughly 1.5 magnitudes on the astronomer's scale.

- `4` (narration) = `area_ratio` = 4.13813 x · (theta2/theta1)^2 · facts F03, F01 · sources S1
- `4` (narration) = `area_ratio` = 4.13813 x · (theta2/theta1)^2 · facts F03, F01 · sources S1
- `1.5` (narration) = `mag_gain` = 1.54201 mag · 2.5 log10(area ratio) · facts F03, F01 · sources S1
- Review: Same albedo/illumination: flux ∝ solid angle ∝ θ² ≈ 4.1; 2.5 log10 4.1 = 1.54 mag.

### b12 · verdict: ok
> It would also race around us. Kepler's third law shrinks the orbit to 9.7 days instead of 27.3. Full Moons would come every 9.9 days instead of every 29.5.

- `9.7` (narration) = `period_new_d` = 9.65968 days · T1 / 2^1.5 (Kepler III) · facts F04 · sources S1
- `27.3` (narration) = `period_old_d` = 27.3217 days · NASA sidereal period · facts F04 · sources S1
- `9.9` (narration) = `synodic_new_d` = 9.92209 days · 1/(1/T2 - 1/yr) · facts F04, F18 · sources S1, S11
- `29.5` (narration) = `synodic_old_d` = 29.5307 days · 1/(1/T1 - 1/yr) · facts F04, F18 · sources S1, S11
- Review: Kepler III: 27.32/2^1.5 = 9.66 d; synodic 1/(1/T − 1/yr): 29.53 → 9.92 d.

### b13 · verdict: ok
> That means the whole show, from a thin crescent to full and back to dark, would play out in about a week and a half. You'd barely finish one phase before the next began.

- Review: A 9.9-day phase cycle is about a week and a half; checked by comparisons().

### b14 · verdict: ok
> Against the stars, it would drift about 37 degrees a day instead of 13. In a single hour, it would slide about 1.4 of its own widths.

- `37` (narration) = `deg_day_new` = 37.2683 deg/day · 360/T2 · facts F04 · sources S1
- `13` (narration) = `deg_day_old` = 13.1763 deg/day · 360/T1 · facts F04 · sources S1
- `1.4` (narration) = `widths_per_hour` = 1.44945 moon widths · deg per hour / theta_new · facts F04, F03, F01 · sources S1
- `37` (on-screen) = `deg_day_new` = 37.2683 deg/day · 360/T2 · facts F04 · sources S1
- `13` (visual) = `deg_day_old` = 13.1763 deg/day · 360/T1 · facts F04 · sources S1
- `37` (visual) = `deg_day_new` = 37.2683 deg/day · 360/T2 · facts F04 · sources S1
- Review: 360°/T: 13.2 → 37.3 °/day; per hour 1.55° ÷ 1.07° = 1.45 widths ('about 1.4').

### b15 · verdict: ok
> And moonrise would slip later each day by about 2.7 hours, instead of the roughly 50 minutes we're used to.

- `2.7` (narration) = `moonrise_new_h` = 2.68999 h · lunar day - 24 h · facts F21, F04 · sources S1, S2
- `50` (narration) = `moonrise_old_min` = 50.4739 min · lunar day - 24 h · facts F21, F04 · sources S1, S2
- `2.7` (visual) = `moonrise_new_h` = 2.68999 h · lunar day - 24 h · facts F21, F04 · sources S1, S2
- `50` (visual) = `moonrise_old_min` = 50.4739 min · lunar day - 24 h · facts F21, F04 · sources S1, S2
- Review: Lunar day = 1/(1/sidereal day − 1/T): 24.84 h → 26.69 h; moonrise delay 50 min → 2.7 h.

### b16 · verdict: ok
> And from the Moon, the view would change too. Astronauts there would see Earth spanning about 3.8 degrees instead of 1.9, a blue world twice as wide hanging over the horizon.

- `3.8` (narration) = `earth_from_moon_new` = 3.83167 deg · 2 atan(Re/(d2-Rm)) · facts F07, F01, F03 · sources S1, S2
- `1.9` (narration) = `earth_from_moon_old` = 1.90767 deg · 2 atan(Re/(d1-Rm)) · facts F07, F01, F03 · sources S1, S2
- `3.8` (visual) = `earth_from_moon_new` = 3.83167 deg · 2 atan(Re/(d2-Rm)) · facts F07, F01, F03 · sources S1, S2
- `1.9` (visual) = `earth_from_moon_old` = 1.90767 deg · 2 atan(Re/(d1-Rm)) · facts F07, F01, F03 · sources S1, S2
- Review: Earth seen from the Moon: 2·atan(Re/(d−Rm)) = 1.9° → 3.8°.

### b17 · verdict: ok
> But the real show would happen in daytime. Right now, at its average distance, the Moon looks slightly smaller than the Sun: 0.527 degrees versus 0.533.

- `0.527` (narration) = `theta_old_precise` = 0.526653 deg · 2 atan(Rm/(d1-Re)) · facts F03, F01, F07 · sources S1, S2
- `0.533` (narration) = `theta_sun` = 0.5329 deg · 2 atan(Rs/AU) · facts F12, F11 · sources S4, S5
- Review: Mean distance, observer below the Moon: 0.527° vs Sun 0.533° (IAU radius, 1 AU) → annular geometry.

### b18 · verdict: ok
> That's why some solar eclipses today are annular: the Moon doesn't quite cover the Sun, leaving a thin ring of fire around a dark disk.

- Review: Annular eclipses occur when the Moon's disk is smaller than the Sun's (true today).

### b19 · verdict: ok
> Twice as close, the Moon would look about twice as wide as the Sun. No more rings. Every central solar eclipse would be total.

- Review: 1.07° vs 0.533° → Moon always larger, so central eclipses are total (no annular).

### b20 · verdict: ok
> And the shadow would be enormous: a dark spot about 1,700 kilometers across, sweeping over the ground, wide enough to cover a whole country at once.

- `1,700` (narration) = `umbra_km` = 1746.33 km · (theta_m - theta_s) * (d2 - Re) · facts F03, F12, F11, F01 · sources S1, S4, S5
- Review: Umbra width ≈ (θm − θs)·(d − Re) = 1,745 km; simplified cone model, stated with 'about'.

### b21 · verdict: ok
> Now for the part that really matters. Tides don't come from the Moon's pull itself, but from the difference in pull between Earth's near side and its far side.

- Review: Tides arise from the gradient of the Moon's gravity across Earth (NOAA).

### b22 · verdict: ok
> That difference shrinks with the cube of distance. Halve the distance, and it grows by two cubed: 8 times stronger.

- `8` (narration) = `tide_ratio` = 8 x · (d1/d2)^3 · facts F01 · sources S1
- Review: Tidal acceleration 2GMR/d³ → ×8.

### b23 · verdict: ok
> Notice the twist. The Moon's direct pull on Earth only gets 4 times stronger, because gravity falls with the square of distance. Tides double that, because they depend on how quickly the pull changes from one side of the planet to the other.

- `4` (narration) = `pull_ratio` = 4 x · (d1/d2)^2 (gravity ~ 1/d^2) · facts F01 · sources S1
- `4` (visual) = `pull_ratio` = 4 x · (d1/d2)^2 (gravity ~ 1/d^2) · facts F01 · sources S1
- `8` (visual) = `tide_ratio` = 8 x · (d1/d2)^3 · facts F01 · sources S1
- Review: Direct pull ∝ 1/d² → ×4; tidal ∝ 1/d³ → ×8 = double; checked by comparisons().

### b24 · verdict: ok
> In the open ocean, the Moon's tide today is a gentle bulge about 36 centimeters high, in the idealized case where water responds freely.

- `36` (narration) = `bulge_old_cm` = 35.6777 cm · (Mm/Me)(Re/d)^3 Re · facts F02, F06, F07, F01 · sources S1, S2
- Review: Equilibrium bulge (Mm/Me)(Re/d)³Re = 0.357 m; idealized case stated.

### b25 · verdict: ok
> Twice as close, that bulge becomes about 2.9 meters, and the swing from high to low tide grows from about 54 centimeters to about 4.3 meters.

- `2.9` (narration) = `bulge_new_m` = 2.85422 m · 8 x bulge · facts F02, F06, F07, F01 · sources S1, S2
- `54` (narration) = `range_old_cm` = 53.5166 cm · 1.5 h1 · facts F02, F06, F07, F01 · sources S1, S2
- `4.3` (narration) = `range_new_m` = 4.28132 m · 1.5 h2 · facts F02, F06, F07, F01 · sources S1, S2
- `54` (on-screen) = `range_old_cm` = 53.5166 cm · 1.5 h1 · facts F02, F06, F07, F01 · sources S1, S2
- `4.3` (on-screen) = `range_new_m` = 4.28132 m · 1.5 h2 · facts F02, F06, F07, F01 · sources S1, S2
- Review: ×8: 2.86 m bulge; equilibrium range 1.5h: 0.54 m → 4.3 m.

### b26 · verdict: ok
> The timing shifts too. Because the Moon moves faster across our sky, high tide would arrive about every 13.3 hours instead of every 12.4.

- `13.3` (narration) = `tide_period_new_h` = 13.345 h · half a lunar day · facts F21, F04 · sources S1, S2
- `12.4` (narration) = `tide_period_old_h` = 12.4206 h · half a lunar day · facts F21, F04 · sources S1, S2
- `13.3` (visual) = `tide_period_new_h` = 13.345 h · half a lunar day · facts F21, F04 · sources S1, S2
- `12.4` (visual) = `tide_period_old_h` = 12.4206 h · half a lunar day · facts F21, F04 · sources S1, S2
- Review: Half a lunar day: 12.42 h → 13.34 h.

### b27 · verdict: rhetoric
> But nobody lives in the open ocean. People live at the edges, where the water meets the land.

- Review: Pattern break; true statement (people live on coasts, not open ocean).

### b28 · verdict: ok
> Real coastlines turn that gentle bulge into something wilder. Bays and gulfs can resonate with the tide, like water sloshing in a bathtub. That's how the Bay of Fundy gets some of the highest tides on Earth.

- Review: Basin resonance amplifies tides; Bay of Fundy has some of the highest tides (NOAA); qualitative F19.

### b29 · verdict: fixed
> Harbors, river mouths, wetlands and coastal cities are all shaped around today's tides. Every one of them would be forced by a tide 8 times stronger, about every 13.3 hours, without a break.

- `8` (narration) = `tide_ratio` = 8 x · (d1/d2)^3 · facts F01 · sources S1
- `13.3` (narration) = `tide_period_new_h` = 13.345 h · half a lunar day · facts F21, F04 · sources S1, S2
- Review: Draft said 'twice a day, every day', but the new semidiurnal period is 13.3 h; changed to 'about every 13 hours'. Typed '13' replaced by {{tide_period_new_h}} after factcheck flagged it as unsourced.

### b30 · verdict: ok
> So how high would Fundy's tides go with 8 times the push? Honestly, that needs an ocean model, not a calculator. Resonance can amplify or dampen, and the answer changes bay by bay.

- `8` (narration) = `tide_ratio` = 8 x · (d1/d2)^3 · facts F01 · sources S1
- Review: Honest uncertainty; no coastal height claimed.

### b31 · verdict: ok
> What we can calculate is the rhythm. Today the Sun adds a tide about 46 percent as strong as the Moon's. When they line up, we get extra-high spring tides.

- `46` (narration) = `sun_share_old_pct` = 46 % · NOAA/OceanMotion ~46% · facts F15 · sources S7, S8
- `46` (visual) = `sun_share_old_pct` = 46 % · NOAA/OceanMotion ~46% · facts F15 · sources S7, S8
- `6` (visual) = `sun_share_new_pct` = 5.74062 % · 0.46/8 · facts F14, F02, F11, F01 · sources S1, S4, S6
- Review: NOAA: the Sun's tide-generating force is about half the Moon's; 46% (OceanMotion); our computed ratio 0.459.

### b32 · verdict: ok
> With the Moon twice as close, the Sun's share drops to about 6 percent. In the simple theory, spring tides today are about 2.7 times the size of neap tides. In the new world they'd be only about 12 percent bigger. The monthly rhythm almost vanishes.

- `6` (narration) = `sun_share_new_pct` = 5.74062 % · 0.46/8 · facts F14, F02, F11, F01 · sources S1, S4, S6
- `2.7` (narration) = `spring_neap_old` = 2.69856 x · (1+r)/(1-r) · facts F14, F02, F11, F01 · sources S1, S4, S6
- `12` (narration) = `spring_neap_new_pct` = 12.1805 % · ((1+r')/(1-r') - 1)*100 · facts F14, F02, F11, F01 · sources S1, S4, S6
- Review: 0.459/8 = 5.7% → 'about 6'; spring/neap (1±r): 2.7 → 1.12; 'almost vanishes' judged fair for a 12% difference (comparisons() checks < 15%).

### b33 · verdict: rhetoric
> Wait. If Earth pulls harder on the Moon too, could the Moon get torn apart?

- Review: Open-loop question.

### b34 · verdict: ok
> There is a limit for that, called the Roche limit. Inside it, a moon held together only by its own gravity gets pulled apart by tides. For Earth and our Moon, it's about 18,000 kilometers.

- `18,000` (narration) = `roche_km` = 18365.3 km · 2.44 Re (rho_E/rho_M)^(1/3) · facts F17, F07, F08, F05 · sources S1, S10, S2
- Review: Fluid Roche limit 2.44 Re (ρE/ρM)^(1/3) = 18,370 km; 'held together only by its own gravity' matches the fluid-limit assumption.

### b35 · verdict: ok
> Our new orbit is still about 10 times farther out than that. The Moon would be safe.

- `10` (narration) = `roche_margin` = 10.4654 x · d2 / d_Roche · facts F17, F01 · sources S1, S10
- Review: 192,200/18,370 = 10.5 → 'about 10 times farther out'.

### b36 · verdict: ok
> Earth would pay a price, though. The tidal bulges drag on our spinning planet like a brake, and that slowly lengthens the day.

- Review: Tidal friction lengthens the day (Stephenson et al. 2016).

### b37 · verdict: ok
> This isn't hypothetical physics. The same tidal brake has been slowing Earth for billions of years. It's the reason the day keeps getting very slightly longer.

- Review: Long-term tidal braking is established (S9); day length increasing.

### b38 · verdict: ok
> That braking depends roughly on the Moon's distance to the sixth power. Halve the distance, and it gets about 64 times stronger.

- `64` (narration) = `brake_ratio` = 64 x · (d1/d2)^6 (torque ~ M^2/d^6) · facts F01 · sources S1
- Review: Torque ∝ M²R⁵k2/(Q d⁶) → 2⁶ = 64 for the same Earth response; 'roughly' covers frequency-dependent Q.

### b39 · verdict: ok
> Tidal friction should be adding about 2.3 milliseconds to the day every century. Twice as close, that becomes about 150 milliseconds per century.

- `2.3` (narration) = `lod_old_ms` = 2.3 ms/century · tidal friction prediction · facts F16 · sources S9
- `150` (narration) = `lod_new_ms` = 147.2 ms/century · 2.3 x 64 · facts F16, F01 · sources S1, S9
- `2.3` (visual) = `lod_old_ms` = 2.3 ms/century · tidal friction prediction · facts F16 · sources S9
- `150` (visual) = `lod_new_ms` = 147.2 ms/century · 2.3 x 64 · facts F16, F01 · sources S1, S9
- Review: S9 tidal-friction prediction 2.3 ms/cy × 64 = 147 → 'about 150'.

### b40 · verdict: ok
> Over a million years, that's about 25 extra minutes per day instead of about 23 seconds, if the rate stayed constant, which it wouldn't exactly.

- `25` (narration) = `myr_new_min` = 24.5333 min per Myr · 147 ms/cy x 10,000 cy / 60 · facts F16, F01 · sources S1, S9
- `23` (narration) = `myr_old_s` = 23 s per Myr · 2.3 ms/cy x 10,000 cy · facts F16 · sources S9
- `25` (on-screen) = `myr_new_min` = 24.5333 min per Myr · 147 ms/cy x 10,000 cy / 60 · facts F16, F01 · sources S1, S9
- Review: × 10,000 centuries: 23 s vs 1,472 s ≈ 25 min; linearity caveat stated.

### b41 · verdict: ok
> There's a flip side. The same tidal tug that slows Earth also pushes the Moon gently outward. Our real Moon is drifting away by about 3.8 centimeters a year. A closer Moon would be pushed outward harder, slowly undoing part of our experiment.

- `3.8` (narration) = `recession_cm` = 3.8 cm/yr · lunar laser ranging · facts F22 · sources S13
- Review: LLR recession 3.8 cm/yr (NASA); a larger torque pushes outward faster since the orbit period (9.7 d) still exceeds Earth's spin period.

### b42 · verdict: ok
> And you? Would you feel lighter with that giant Moon overhead? For a 70 kilogram person, the extra tidal pull changes your weight by about 0.06 grams. That's less than a tenth of a gram.

- `70` (narration) = `person_mass` = 70 kg · assumed · facts F20 · sources S12
- `0.06` (narration) = `weight_new_g` = 0.0628075 g · x8 · facts F20, F09, F02, F07, F01, F10 · sources S1, S12, S2, S3
- `0.06` (visual) = `weight_new_g` = 0.0628075 g · x8 · facts F20, F09, F02, F07, F01, F10 · sources S1, S12, S2, S3
- `0.008` (visual) = `weight_old_g` = 0.00785094 g · m * 2GMm Re/d^3 / g · facts F20, F09, F02, F07, F01, F10 · sources S1, S12, S2, S3
- Review: m·2GMm Re/d³/g = 0.063 g-force with the Moon overhead; < 0.1 g checked.

### b43 · verdict: ok
> Today it's about 0.008 grams. Tides need size to work. Across Earth's 12,742 kilometers, the Moon's pull changes enough to lift whole oceans. Across a human body, the difference is far too small to feel.

- `0.008` (narration) = `weight_old_g` = 0.00785094 g · m * 2GMm Re/d^3 / g · facts F20, F09, F02, F07, F01, F10 · sources S1, S12, S2, S3
- `12,742` (narration) = `earth_diam_km` = 12742 km · 2 x mean radius · facts F07 · sources S2
- Review: Today 0.008 g; Earth diameter 2×6371 km; tidal differences scale with size.

### b44 · verdict: ok
> So, a Moon twice as close: about 4 times brighter, a full Moon every 9.9 days, only total eclipses, tides 8 times stronger, and days stretching about 64 times faster.

- `4` (narration) = `area_ratio` = 4.13813 x · (theta2/theta1)^2 · facts F03, F01 · sources S1
- `9.9` (narration) = `synodic_new_d` = 9.92209 days · 1/(1/T2 - 1/yr) · facts F04, F18 · sources S1, S11
- `8` (narration) = `tide_ratio` = 8 x · (d1/d2)^3 · facts F01 · sources S1
- `64` (narration) = `brake_ratio` = 64 x · (d1/d2)^6 (torque ~ M^2/d^6) · facts F01 · sources S1
- `4` (visual) = `area_ratio` = 4.13813 x · (theta2/theta1)^2 · facts F03, F01 · sources S1
- `9.9` (visual) = `synodic_new_d` = 9.92209 days · 1/(1/T2 - 1/yr) · facts F04, F18 · sources S1, S11
- `8` (visual) = `tide_ratio` = 8 x · (d1/d2)^3 · facts F01 · sources S1
- `64` (visual) = `brake_ratio` = 64 x · (d1/d2)^6 (torque ~ M^2/d^6) · facts F01 · sources S1
- Review: Recap of values verified above.

### b45 · verdict: rhetoric
> Distance is the quiet number behind our sky, our oceans, and even the length of our days. Change it by half, and almost everything we take for granted about the Moon changes with it.

- Review: Moral/summary line; rhetorical, no new number.

### b46 · verdict: ok
> Every number here came from a calculation or a cited source, all listed in the description. Check our math.

- Review: True: all numbers are calc.json values from cited facts.

### b47 · verdict: ok
> Next time, we leave Earth entirely: how long could you survive on every planet in the solar system? Subscribe so you don't miss it. This was The If Engine. Run the impossible. Do the math.

- Review: Next topic is the next 'todo' in topics.json; F20 claim placeholder harmless.

## Sources

- S1: NASA NSSDC, Moon Fact Sheet - https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
- S2: NASA NSSDC, Earth Fact Sheet - https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html
- S3: NIST CODATA 2018, fundamental constants - https://physics.nist.gov/cuu/Constants/
- S4: IAU 2012 Resolution B2, re-definition of the astronomical unit - https://www.iau.org/static/resolutions/IAU2012_English.pdf
- S5: IAU 2015 Resolution B3, nominal solar and planetary conversion constants - https://arxiv.org/abs/1510.07674
- S6: NASA NSSDC, Sun Fact Sheet - https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html
- S7: NOAA National Ocean Service, Tides and Water Levels: what causes tides - https://oceanservice.noaa.gov/education/tutorial_tides/tides02_cause.html
- S8: Ocean Motion (NASA-funded education site), Tide-generating forces background - https://www.oceanmotion.org/html/background/tides-forces.htm
- S9: Stephenson, Morrison & Hohenkerk (2016), Measurement of the Earth's rotation: 720 BC to AD 2015, Proc. R. Soc. A 472 - https://pmc.ncbi.nlm.nih.gov/articles/PMC5247521/
- S10: Encyclopaedia Britannica, Roche limit - https://www.britannica.com/science/Roche-limit
- S11: NASA/IERS, tropical year (365.2422 days) - https://www.iers.org/IERS/EN/Science/EarthRotation/EarthRotation.html
- S13: NASA Science, Moon: Lunar laser ranging shows the Moon moving away ~3.8 cm/yr - https://science.nasa.gov/moon/facts/
- S12: ICRP Publication 89, reference adult - https://www.icrp.org/publication.asp?id=ICRP%20Publication%2089
