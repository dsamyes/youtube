# Fact-check report: What If You Fell Into Jupiter? You'd Sink for 78 Days

Generated 2026-11-11T15:48:17+00:00 by `pipeline/factcheck.py`. Status: **PASS**

Layers: (A) every number traced to calc.json, (B) worded comparisons re-derived from calc.json, (C) editorial verdict for every beat, pinned to a hash of the beat text.

## Fixes made by the review pass

- **b08**: 'released in seconds' overstated the timescale → *'released in moments'*
- **b09**: Galileo's peak was MORE than 200 g, so 'about four times' understated → *'more than four times'*
- **b12/b16**: temperatures are adiabat-model values → *added 'about'*
- **b24/s2b06**: 'no oxygen' is wrong (trace water vapour) → *'no oxygen to breathe'*
- **b26**: claim that nothing humans built went deeper was unverifiable → *'No working instrument has ever reported back from below this depth.'*
- **b29**: 'only light for a thousand kilometers' ignores glowing hot gas → *'heat is the only light there is'*
- **b35/s3b05**: 'total darkness' is wrong at thousands of kelvin → *'a sea of hot, crushing hydrogen'*
- **s1b01**: speed depends on the starting distance → *added 'about'*
- **s2b01**: room-temperature level is below the water clouds, not inside them → *'Below Jupiter's cloud tops'*

## (B) Worded comparisons

| Beat | Phrase | Result |
|---|---|---|
| b04 | faster than | PASS |
| b09 | four times | PASS |

## (A + C) Beat-by-beat

### b01 · verdict: rhetoric
> You fall into Jupiter at 210,000 kilometers an hour, and there is no ground to stop you. So where do you actually stop?

- `210,000` (narration) = `v_kmh` = 206513 km/h · arrival speed in km/h · facts F02, F03 · sources S1
- `210,000` (on-screen) = `v_kmh` = 206513 km/h · arrival speed in km/h · facts F02, F03 · sources S1
- Review: Arrival speed 57 km/s = about 210,000 km/h from radial free fall (calc v_kmh, scenario start 1,000,000 km). 'No ground': NASA S2, Jupiter has no true surface. Open loop answered in b34-b36.

### b02 · verdict: ok
> Here are the rules. You start at rest, 1,000,000 kilometers from Jupiter's center, and you let go. No rocket, no parachute. Only gravity.

- `1,000,000` (narration) = `start_km` = 1e+06 km · scenario: start at rest this far from Jupiter's centre · facts - · sources -
- Review: Scenario definition (start at rest 1,000,000 km from the centre), stated as a rule, not a measurement.

### b03 · verdict: rhetoric
> At first, nothing seems to happen. Jupiter is a striped coin hanging in the dark. But it is pulling, and the pull never lets go.

- Review: Scene-setting; no numbers. Gravity always pulls (Newtonian free fall).

### b04 · verdict: ok
> For 27 hours you fall, while Jupiter spins about 2.7 times beneath you and swells to fill the sky. By the end you are moving at 57 kilometers per second. That is 57 times faster than a rifle bullet, and faster than NASA's Galileo probe, which hit this atmosphere at 47.4.

- `27` (narration) = `fall_h` = 27.1844 h · radial infall time from rest at r0 to R · facts F02, F03 · sources S1
- `2.7` (narration) = `fall_turns` = 2.73898 turns · Jupiter rotations during the fall · facts F02, F03, F08 · sources S1
- `57` (narration) = `x_rifle` = 57.3648 x · arrival speed / rifle bullet speed · facts F02, F03, F42 · sources S1, S15
- `57` (narration) = `x_rifle` = 57.3648 x · arrival speed / rifle bullet speed · facts F02, F03, F42 · sources S1, S15
- `47.4` (narration) = `galileo_kms` = 47.3862 km/s · Galileo probe entry speed in km/s · facts F17, F41 · sources S13, S3
- `57` (visual) = `x_rifle` = 57.3648 x · arrival speed / rifle bullet speed · facts F02, F03, F42 · sources S1, S15
- `27` (visual) = `fall_h` = 27.1844 h · radial infall time from rest at r0 to R · facts F02, F03 · sources S1
- Review: Fall time 27 h and arrival 57 km/s from the radial-infall formula with NASA GM and 1-bar radius (S1). 2.7 rotations = 27 h / 9.925 h. 57x a 1 km/s rifle bullet (S15). Galileo 106,000 mph = 47.4 km/s (S3); comparison 'faster than' re-derived.

### b05 · verdict: ok
> For scale: Jupiter is 11 Earths wide. The Great Red Spot alone, a storm, is about twice as wide as our whole planet.

- `11` (narration) = `size_earths` = 11.2215 x · Jupiter equatorial radius / Earth mean radius · facts F03, F16 · sources S1
- Review: 71,492 km / 6,371 km = 11.2 Earth radii, so about 11 Earths wide (S1). GRS about twice as wide as Earth (NASA S2).

### b06 · verdict: ok
> And there is no ground. Jupiter has no surface at all. So on the way down we will track three things: how deep you are, how hot it is, and what you see out the window.

- `0` (visual): structural number - depth 0 km = the 1-bar reference level (definition)
- `-108` (visual) = `t1_c` = -108.15 °C · temperature at 1 bar · facts F09 · sources S1
- Review: NASA S2: Jupiter doesn't have a true surface. Gauge: 0 km = 1-bar reference; -108 C at 1 bar (S1). The three recurring questions are the video's structure.

### b07 · verdict: rhetoric
> Then the air arrives, and not gently. At 57 kilometers per second even thin hydrogen hits like a wall. The gas ahead of you is crushed into glowing plasma, as hot as the surface of the Sun.

- `57` (narration) = `v_kms` = 57.3648 km/s · v = sqrt(2GM(1/R - 1/r0)) · facts F02, F03 · sources S1
- Review: Plasma/shock-layer heating at entry: NASA S3 reports Galileo's heat-shield temperatures as hot as the Sun's surface at a lower speed (47.4 km/s); 'hits like a wall' is a figure of speech.

### b08 · verdict: fixed
> Every kilogram of you carries the energy of about 390 kilograms of TNT. For a whole person, that is about 28 tonnes, released in moments.

- `390` (narration) = `tnt_per_kg` = 393.25 kg TNT per kg · 1/2 v^2 / TNT energy per kg · facts F02, F03, F35 · sources S1, S13
- `28` (narration) = `tnt_you` = 27.5275 t TNT · for a 70 kg person, tonnes of TNT · facts F02, F03, F35 · sources S1, S13
- Review: 1/2 v^2 = 1.6 GJ/kg = 390 kg TNT (4.184 MJ/kg, S13) per kg; 70 kg person = 28 t. Draft said 'released in seconds'; the entry deceleration lasts tens of seconds to minutes, so changed to 'in moments'.

### b09 · verdict: fixed
> Galileo survived this behind a heat shield and still felt more than 200 g. The most any human has survived on purpose is 46.2 g. Galileo took more than four times that.

- `200` (narration) = `galileo_g` = 200 g · Galileo probe deceleration, more than · facts F18 · sources S3
- `46.2` (narration) = `stapp_g` = 46.2 g · John Stapp's 1954 record · facts F32 · sources S10
- `7,` (visual): structural number - day of the Galileo probe entry, December 7 (S5)
- `1995` (visual): structural number - year of the Galileo probe entry (7 December 1995, S5)
- `200` (visual) = `galileo_g` = 200 g · Galileo probe deceleration, more than · facts F18 · sources S3
- `46.2` (visual) = `stapp_g` = 46.2 g · John Stapp's 1954 record · facts F32 · sources S10
- Review: Galileo: more than 200 g (NASA S3). Stapp 46.2 g (S10). 200/46.2 = 4.3 and Galileo's peak was above 200, so 'more than four times' (draft said 'about four times').

### b10 · verdict: rhetoric
> So honestly? You do not survive the entry. You become a meteor, a streak of light above the clouds. But this is The If Engine, so we cheat exactly once. Put yourself in an indestructible pod, your size and your weight. Everything outside it stays real.

- Review: States the single non-physical device (indestructible pod, human size and density). An unprotected human cannot survive entry (b07-b09).

### b11 · verdict: ok
> The pod slows to a fall you could almost call calm: about 690 kilometers an hour. The thicker the air, the slower you fall, and from here it only gets thicker.

- `690` (narration) = `vt_1bar_kmh` = 688.777 km/h · same, km/h · facts F06, F09, F11, F33, F36 · sources S1, S11, S14
- `690` (visual) = `vt_1bar_kmh` = 688.777 km/h · same, km/h · facts F06, F09, F11, F33, F36 · sources S1, S11, S14
- Review: Terminal speed sqrt(2mg/(rho Cd A)) with m 80 kg, A 0.7 m2, Cd 1 (scenario), rho at 1 bar 0.16 kg/m3 (adiabat check vs NASA S1 within 10%), g 25.92 (S1): 190 m/s = 690 km/h; buoyancy term included. Thicker air -> slower terminal speed (drag law).

### b12 · verdict: fixed
> First rung. Depth: just above the 1 bar level, Jupiter's version of sea level. Temperature: about 120 degrees below zero. Out the window: white.

- `1` (narration): structural number - 'one second' / '1st law' / '+1' - scenario definitions and ordinals
- `120` (narration) = `c_nh3` = 124.136 °C below zero · degrees below 0 C (positive) · facts F09, F28 · sources S1, S6
- `0.70` (visual) = `p_nh3` = 0.7 bar · cloud level pressure (F28) · facts F28 · sources S6
- `8.1` (visual) = `z_nh3` = -8.08466 km · depth below (+) / height above (-) the 1-bar level · facts F06, F09, F11, F36, F28 · sources S1, S14, S6
- `-120` (visual) = `t_nh3` = -124.136 °C · adiabat T = T0 (P/1 bar)^(2/7) · facts F09, F28 · sources S1, S6
- Review: Ammonia ice condensation level 0.7 bar (S6) lies about 8 km above the 1-bar level in the adiabat model; -120 C from T = 165 K (0.7)^(2/7). Added 'about' (model value).

### b13 · verdict: ok
> These high white clouds are ammonia ice, a snow made of the chemical in household cleaner, at about 0.70 bar. The winds up here reach 539 kilometers an hour.

- `0.70` (narration) = `p_nh3` = 0.7 bar · cloud level pressure (F28) · facts F28 · sources S6
- `539` (narration) = `wind_kmh` = 539 km/h · fastest prevailing winds · facts F15 · sources S2
- `539` (visual) = `wind_kmh` = 539 km/h · fastest prevailing winds · facts F15 · sources S2
- Review: Ammonia ice clouds (S2, S6: high, bright clouds); household cleaners contain ammonia (rhetorical comparison). Winds up to 539 km/h (NASA S2).

### b14 · verdict: ok
> Here is the first surprise. A study in 2025 suggests most of the color you see from space comes from deeper, from a rust-colored layer below this one. So let's go and look.

- `2025` (narration): structural number - year of the Oxford cloud study (S6)
- Review: Oxford-led 2025 study (S6): main reflecting deck at 2-3 bar is ammonium hydrosulfide mixed with smog. 'suggests' keeps it tentative.

### b15 · verdict: ok
> Second rung. Depth: about 18 kilometers. Pressure: 2 bar, double the air on a beach on Earth.

- `18` (narration) = `z_nh4sh` = 18.2755 km · depth below (+) / height above (-) the 1-bar level · facts F06, F09, F11, F36, F29 · sources S1, S14, S6
- `2` (narration) = `p_nh4sh` = 2 bar · cloud level pressure (F29) · facts F29 · sources S6
- `2` (visual) = `p_nh4sh` = 2 bar · cloud level pressure (F29) · facts F29 · sources S6
- `18` (visual) = `z_nh4sh` = 18.2755 km · depth below (+) / height above (-) the 1-bar level · facts F06, F09, F11, F36, F29 · sources S1, S14, S6
- `-72` (visual) = `t_nh4sh` = -72.0127 °C · adiabat T = T0 (P/1 bar)^(2/7) · facts F09, F29 · sources S1, S6
- Review: 2 bar (S6); depth 18 km from the adiabat model; 2 bar is about twice Earth's sea-level pressure (1.013 bar, S13).

### b16 · verdict: fixed
> Temperature: about 72 degrees below zero. These are crystals of ammonium hydrosulfide, stained by a haze the color of rust. The sunlight is fading fast.

- `72` (narration) = `c_nh4sh` = 72.0127 °C below zero · degrees below 0 C (positive) · facts F09, F29 · sources S1, S6
- Review: -72 C from the adiabat at 2 bar (model, added 'about'). Ammonium hydrosulfide crystals tinted by haze (S6). Light fading with depth: qualitative.

### b17 · verdict: rhetoric
> And somewhere below you, something flashes.

- Review: Tease for lightning in the water clouds (S9).

### b18 · verdict: ok
> Third rung. About 49 kilometers down, 5 bar, 12 degrees below zero and rising. These are water clouds. Real water ice and droplets, like the storms at home.

- `49` (narration) = `z_h2o` = 48.7166 km · depth below (+) / height above (-) the 1-bar level · facts F06, F09, F11, F36, F30 · sources S1, S14, S7, S8
- `5` (narration) = `p_h2o` = 5 bar · cloud level pressure (F30) · facts F30 · sources S7, S8
- `12` (narration) = `c_h2o` = 11.8198 °C below zero · degrees below 0 C (positive) · facts F09, F30 · sources S1, S7, S8
- `5` (visual) = `p_h2o` = 5 bar · cloud level pressure (F30) · facts F30 · sources S7, S8
- `49` (visual) = `z_h2o` = 48.7166 km · depth below (+) / height above (-) the 1-bar level · facts F06, F09, F11, F36, F30 · sources S1, S14, S7, S8
- `-12` (visual) = `t_h2o` = -11.8198 °C · adiabat T = T0 (P/1 bar)^(2/7) · facts F09, F30 · sources S1, S7, S8
- Review: Water cloud base near 5 bar (S8, S7); depth 49 km and -12 C from the adiabat model (stated 'about' via 'about 49 kilometers'); water ice and droplets as on Earth (S8).

### b19 · verdict: ok
> And they are electric. NASA's Juno spacecraft found lightning even higher up, where it is 88 degrees below zero, fed by slushy hailstones of ammonia and water that scientists call mushballs.

- `88` (narration) = `c_lightning` = 88 °C below zero · same, as degrees below zero · facts F31 · sources S9
- Review: JPL S9 (2020): Juno found shallow lightning at altitudes where temperatures are about -88 C; mushballs = slushy ammonia-water hail.

### b20 · verdict: ok
> All three cloud layers together are only about 71 kilometers thick. About 36 minutes after you passed the 1 bar level, you are already 100 kilometers down. You have fallen through Jupiter's entire weather.

- `71` (narration) = `clouds_km` = 71 km · three cloud layers span · facts F24 · sources S2
- `36` (narration) = `t100_min` = 36.2113 min · time to sink 100 km below 1 bar · facts F06, F09, F11, F33, F36 · sources S1, S11, S14
- `1` (narration): structural number - 'one second' / '1st law' / '+1' - scenario definitions and ordinals
- `100` (narration) = `d100` = 100 km · depth chosen for the timing beat · facts - · sources -
- `71` (visual) = `clouds_km` = 71 km · three cloud layers span · facts F24 · sources S2
- Review: Three cloud layers span about 71 km (NASA S2). 36 min to reach 100 km below 1 bar at terminal speed (model integration in calc).

### b21 · verdict: rhetoric
> Then the temperature does something strange.

- Review: Tease for the room-temperature level.

### b22 · verdict: ok
> About 65 kilometers down, at 7.5 bar, the air outside is a comfortable 20 degrees Celsius.

- `65` (narration) = `z_room` = 64.8086 km · depth of room temperature · facts F06, F09, F11, F36 · sources S1, S14
- `7.5` (narration) = `p_room` = 7.47517 bar · pressure where the adiabat reaches 20 C · facts F09 · sources S1
- `20` (narration) = `room_c` = 20 °C · room temperature (definition used here) · facts - · sources -
- `20` (on-screen) = `room_c` = 20 °C · room temperature (definition used here) · facts - · sources -
- `65` (visual) = `z_room` = 64.8086 km · depth of room temperature · facts F06, F09, F11, F36 · sources S1, S14
- `20` (visual) = `room_c` = 20 °C · room temperature (definition used here) · facts - · sources -
- Review: Adiabat reaches 20 C at 7.5 bar, about 65 km below 1 bar (model); consistent with NASA timeline S5 (room temperature reached after the water clouds).

### b23 · verdict: ok
> When the Galileo probe reached this level in 1995, NASA logged it in its timeline: room temperature, about 30 minutes after entry.

- `1995,` (narration): structural number - year of the Galileo probe entry (7 December 1995, S5)
- `30` (narration) = `room_min` = 30 min · Galileo: entry to room temperature · facts F22 · sources S5
- `7,` (visual): structural number - day of the Galileo probe entry, December 7 (S5)
- `1995` (visual): structural number - year of the Galileo probe entry (7 December 1995, S5)
- Review: NSSDC timeline S5: entry 5:04 p.m., 'atmospheric temperature equal to room temperature on Earth' at 5:34 p.m. = 30 minutes; 1995 entry date (S5).

### b24 · verdict: fixed
> It is the most Earth-like moment of the whole trip, and you could not breathe for a second of it. There is no oxygen to breathe here, only hydrogen and helium.

- Review: Atmosphere 89.8% H2, 10.2% He (S1); trace water vapour contains oxygen atoms, so changed 'no oxygen' to 'no oxygen to breathe'.

### b25 · verdict: ok
> Galileo kept talking for 58 minutes. It sank about 160 kilometers. Then its signal stopped.

- `58` (narration) = `gal_min` = 58 min · Galileo data return · facts F20 · sources S3
- `160` (narration) = `gal_km` = 156.106 km · Galileo descent distance in km · facts F21, F41 · sources S13, S3
- `160` (visual) = `gal_km` = 156.106 km · Galileo descent distance in km · facts F21, F41 · sources S13, S3
- Review: NASA S3: data for 58 minutes during a descent of 97 miles (156 km, shown as about 160).

### b26 · verdict: fixed
> Within about 10 hours, NASA estimates, the probe was completely vaporized. No working instrument has ever reported back from below this depth.

- `10` (narration) = `vapor_h` = 10 h · Galileo probe vaporized within · facts F23 · sources S5
- Review: NSSDC S5: probe estimated completely vaporized by 3:00 a.m., 10 hours after the 5:04 p.m. entry. Draft claimed nothing built by humans had been below; spacecraft that later dove in (Galileo orbiter 2003) burned up higher, but to avoid an unverifiable claim it now says no working instrument has reported back from below this depth (Galileo probe was the only in-situ probe).

### b27 · verdict: rhetoric
> You keep sinking. Your pod is indestructible, remember. But from here, the question is not whether you survive. It is what is left of the sky.

- Review: Transition; pod device restated.

### b28 · verdict: ok
> Fourth rung. 1,000 kilometers down. The sunlight is long gone. Temperature: about 1,900 degrees Celsius. Pressure: around 8,000 atmospheres.

- `1,000` (narration) = `d1000` = 1000 km · depth chosen for the 'black heat' rung · facts - · sources -
- `1,900` (narration) = `t1000_c` = 1869.21 °C · adiabat temperature 1,000 km down · facts F06, F09, F11, F36 · sources S1, S14
- `8,000` (narration) = `p1000_round` = 8000 atm · rounded to about 8,000 atmospheres · facts F06, F09, F11, F36, F44 · sources S1, S13, S14
- `1,000` (visual) = `d1000` = 1000 km · depth chosen for the 'black heat' rung · facts - · sources -
- `1,900` (visual) = `t1000_c` = 1869.21 °C · adiabat temperature 1,000 km down · facts F06, F09, F11, F36 · sources S1, S14
- Review: Adiabat at 1,000 km: T = 165 K + 1.98 K/km x 1,000 km = 2,140 K = about 1,900 C; P = (T/T0)^3.5 = about 8,000 atm (ideal gas, rough; 'about'/'around' used; model stated in description).

### b29 · verdict: fixed
> At that temperature the hull of your pod glows orange, like steel in a forge. Down here, heat is the only light there is.

- Review: A hull at about 2,100 K glows orange (incandescence, like hot steel). Draft said 'the only light for a thousand kilometers'; the hot gas itself also emits, so reworded to 'heat is the only light there is' (no sunlight reaches this depth).

### b30 · verdict: ok
> It took you about 21 hours to sink this far, and the gas is now so thick that you are falling at 27 kilometers an hour, the speed of a bicycle.

- `21` (narration) = `t1000_h` = 20.5711 h · time to sink 1,000 km · facts F06, F09, F11, F33, F36 · sources S1, S11, S14
- `27` (narration) = `v1000_kmh` = 26.5729 km/h · terminal speed 1,000 km down · facts F06, F09, F11, F33, F36 · sources S1, S11, S14
- `27` (visual) = `v1000_kmh` = 26.5729 km/h · terminal speed 1,000 km down · facts F06, F09, F11, F33, F36 · sources S1, S11, S14
- Review: Model: 21 h to sink 1,000 km; terminal speed there 27 km/h (rho about 98 kg/m3 from the adiabat, buoyancy included) ~ bicycle speed.

### b31 · verdict: rhetoric
> And somewhere around here, the line between gas and liquid simply disappears.

- Review: Tease: supercritical hydrogen (NASA S2: gas compressed into a liquid).

### b32 · verdict: ok
> There is no splash and no surface. The hydrogen just gets denser and denser until, without any line you could point to, it behaves like a liquid. NASA calls it the largest ocean in the solar system.

- `1,000` (visual) = `d1000` = 1000 km · depth chosen for the 'black heat' rung · facts - · sources -
- Review: NASA S2: pressure compresses hydrogen gas into a liquid, the largest ocean in the solar system; no sharp surface (supercritical fluid).

### b33 · verdict: ok
> Fifth rung. Thousands of kilometers deep, sinking slower every hour. Jupiter's jet streams reach down about 3,200 kilometers. You are already below them.

- `3,200` (narration) = `jets_km` = 3200 km · jet stream depth · facts F26 · sources S2
- Review: NASA S2: jet streams reach about 3,200 km; pod is deeper (sinking to 14,000 km).

### b34 · verdict: ok
> And then, about 14,000 kilometers down, you stop.

- `14,000` (narration) = `float_km` = 13733.1 km · depth where the polytrope density equals a human body's · facts F01, F04, F05, F33, F34, F37 · sources S1, S11, S12, S14
- `14,000` (visual) = `float_km` = 13733.1 km · depth where the polytrope density equals a human body's · facts F01, F04, F05, F33, F34, F37 · sources S1, S11, S12, S14
- Review: Index-1 polytrope (S12, mass and mean radius S1): density equals about 1,000 kg/m3 (S11) at about 14,000 km depth ('about', model). Pays off the hook.

### b35 · verdict: fixed
> Not because you hit anything. The liquid around you is now as dense as you are, so you float, like a swimmer who stopped kicking, in a sea of hot, crushing hydrogen, under about 2 million atmospheres.

- `2` (narration) = `float_matm` = 2.04956 million atm · P = K rho^2 at rho = 1000 · facts F01, F04, F33, F34, F37, F44 · sources S1, S11, S12, S13, S14
- `2` (visual) = `float_matm` = 2.04956 million atm · P = K rho^2 at rho = 1000 · facts F01, F04, F33, F34, F37, F44 · sources S1, S11, S12, S13, S14
- Review: Neutral buoyancy: fluid density = pod density. P = K rho^2 = about 2 million atm in the polytrope (model). Draft said 'in total darkness'; matter at thousands of kelvin glows, so changed to 'a sea of hot, crushing hydrogen'.

### b36 · verdict: ok
> That is the answer to the question from the start. Jupiter has no ground, so what stops you is buoyancy. In a simple model of Jupiter's interior, you come to rest about 20 percent of the way to the center.

- `20` (narration) = `float_pct` = 19.6437 % · percent of the way to the centre · facts F04, F05, F33, F34 · sources S1, S11, S12
- Review: 14,000 km / 69,911 km = 20% of the way to the centre in the index-1 polytrope (S12); 'simple model' stated.

### b37 · verdict: ok
> Getting here took about 78 days. You crossed 1,000,000 kilometers of space in 27 hours, then spent 78 days sinking the last 14,000.

- `78` (narration) = `sink_days` = 77.7819 days · time to sink to within 100 km of the float depth · facts F04, F05, F06, F09, F11, F33, F34, F36, F37 · sources S1, S11, S12, S14
- `1,000,000` (narration) = `start_km` = 1e+06 km · scenario: start at rest this far from Jupiter's centre · facts - · sources -
- `27` (narration) = `fall_h` = 27.1844 h · radial infall time from rest at r0 to R · facts F02, F03 · sources S1
- `78` (narration) = `sink_days` = 77.7819 days · time to sink to within 100 km of the float depth · facts F04, F05, F06, F09, F11, F33, F34, F36, F37 · sources S1, S11, S12, S14
- `14,000` (narration) = `float_km` = 13733.1 km · depth where the polytrope density equals a human body's · facts F01, F04, F05, F33, F34, F37 · sources S1, S11, S12, S14
- `78` (on-screen) = `sink_days` = 77.7819 days · time to sink to within 100 km of the float depth · facts F04, F05, F06, F09, F11, F33, F34, F36, F37 · sources S1, S11, S12, S14
- `27` (visual) = `fall_h` = 27.1844 h · radial infall time from rest at r0 to R · facts F02, F03 · sources S1
- `78` (visual) = `sink_days` = 77.7819 days · time to sink to within 100 km of the float depth · facts F04, F05, F06, F09, F11, F33, F34, F36, F37 · sources S1, S11, S12, S14
- Review: Sinking time about 78 days (to within 100 km of the float depth; terminal-speed integration through the stated hybrid model); fall 27 h from 1,000,000 km.

### b38 · verdict: ok
> And below you, out of reach, is the strangest layer. NASA thinks that perhaps halfway to the center, hydrogen is squeezed so hard that it turns into a liquid metal, and its churning powers Jupiter's enormous magnetic field.

- Review: NASA S2: 'at depths perhaps halfway to the planet's center' hydrogen becomes electrically conducting like a metal; its motion drives the magnetic field (dynamo).

### b39 · verdict: ok
> Deeper still, NASA's Juno found that the core is not a solid ball. It is dilute, partly dissolved, with no clear edge. Even at the very bottom, Jupiter refuses to have a floor.

- Review: NASA S2: Juno data suggest a dilute, 'fuzzy' core, partially dissolved with no clear separation from the metallic hydrogen.

### b40 · verdict: rhetoric
> So here is the twist. You set out to fall into Jupiter, and you never touched it. No surface at the top, no floor at the bottom. Just a world that gets thicker and thicker, until it holds you, suspended, in the dark.

- Review: Twist summary: no solid surface at the top (S2) and no sharp core boundary (S2); 'suspended' = neutral buoyancy (b35).

### b41 · verdict: rhetoric
> And Jupiter is the gentle one. Next, we visit every planet and ask a simpler question: how long could you survive on each one? This was The If Engine. Run the impossible. Do the math.

- Review: Next video set-up and channel tagline.

### s1b01 · verdict: fixed
> Fall into Jupiter from far away and you hit the clouds at about 57 kilometers per second.

- `57` (narration) = `v_kms` = 57.3648 km/s · v = sqrt(2GM(1/R - 1/r0)) · facts F02, F03 · sources S1
- Review: From 1,000,000 km: 57 km/s; from very far: up to 59.5 km/s (escape velocity S1). Added 'about'.

### s1b02 · verdict: ok
> That is 57 times faster than a rifle bullet.

- `57` (narration) = `x_rifle` = 57.3648 x · arrival speed / rifle bullet speed · facts F02, F03, F42 · sources S1, S15
- Review: 57 km/s / 1 km/s rifle bullet (S15) = 57x.

### s1b03 · verdict: rhetoric
> The air ahead of you turns into plasma as hot as the surface of the Sun.

- Review: NASA S3: Galileo's heat-shield temperatures as hot as the Sun's surface at entry.

### s1b04 · verdict: ok
> Every kilogram of you carries the energy of 390 kilograms of TNT.

- `390` (narration) = `tnt_per_kg` = 393.25 kg TNT per kg · 1/2 v^2 / TNT energy per kg · facts F02, F03, F35 · sources S1, S13
- `390` (visual) = `tnt_per_kg` = 393.25 kg TNT per kg · 1/2 v^2 / TNT energy per kg · facts F02, F03, F35 · sources S1, S13
- Review: 1/2 v^2 / 4.184 MJ/kg = 390 kg TNT per kg (S13).

### s1b05 · verdict: ok
> NASA's Galileo probe felt more than 200 g, behind a heat shield. The human record is 46.2 g.

- `200` (narration) = `galileo_g` = 200 g · Galileo probe deceleration, more than · facts F18 · sources S3
- `46.2` (narration) = `stapp_g` = 46.2 g · John Stapp's 1954 record · facts F32 · sources S10
- Review: Galileo more than 200 g (S3); Stapp 46.2 g (S10).

### s1b06 · verdict: rhetoric
> So you would not land on Jupiter. You would become a shooting star.

- Review: An unprotected body entering at 57 km/s burns up like a meteor (b07-b10).

### s2b01 · verdict: fixed
> Below Jupiter's cloud tops, there is a layer at room temperature.

- Review: Room-temperature level about 65 km below 1 bar, below the water clouds; draft said 'deep inside the clouds', changed to 'below the cloud tops'.

### s2b02 · verdict: ok
> Up top it is 108 degrees below zero, at the 1 bar level.

- `108` (narration) = `c_1bar` = 108.15 °C below zero · 1-bar temperature as degrees below zero · facts F09 · sources S1
- `1` (narration): structural number - 'one second' / '1st law' / '+1' - scenario definitions and ordinals
- Review: 165 K = -108 C at 1 bar (NASA S1).

### s2b03 · verdict: ok
> Fall through the white ammonia clouds, the rust-colored layer and the water clouds with their lightning.

- Review: Order of the cloud layers: ammonia ice, ammonium hydrosulfide, water (S2, S6, S8); lightning (S9).

### s2b04 · verdict: ok
> About 65 kilometers down, the air hits 20 degrees Celsius.

- `65` (narration) = `z_room` = 64.8086 km · depth of room temperature · facts F06, F09, F11, F36 · sources S1, S14
- `20` (narration) = `room_c` = 20 °C · room temperature (definition used here) · facts - · sources -
- `20` (visual) = `room_c` = 20 °C · room temperature (definition used here) · facts - · sources -
- Review: Adiabat model: 20 C at about 65 km below 1 bar.

### s2b05 · verdict: ok
> NASA's Galileo probe logged it in 1995, about 30 minutes after entry.

- `1995,` (narration): structural number - year of the Galileo probe entry (7 December 1995, S5)
- `30` (narration) = `room_min` = 30 min · Galileo: entry to room temperature · facts F22 · sources S5
- Review: NSSDC timeline S5: room temperature 30 minutes after entry, December 1995.

### s2b06 · verdict: fixed
> Comfortable, except there is no oxygen to breathe. Only hydrogen and helium.

- Review: 89.8% H2 / 10.2% He (S1); 'no oxygen to breathe' (trace H2O exists).

### s3b01 · verdict: ok
> Jupiter has no surface. So if you fell in, where would you finally stop?

- Review: NASA S2: no true surface.

### s3b02 · verdict: ok
> Not in the clouds. Those are only about 71 kilometers thick.

- `71` (narration) = `clouds_km` = 71 km · three cloud layers span · facts F24 · sources S2
- Review: Cloud layers span about 71 km (S2).

### s3b03 · verdict: ok
> Not at 1,000 kilometers, where it is about 1,900 degrees Celsius.

- `1,000` (narration) = `d1000` = 1000 km · depth chosen for the 'black heat' rung · facts - · sources -
- `1,900` (narration) = `t1000_c` = 1869.21 °C · adiabat temperature 1,000 km down · facts F06, F09, F11, F36 · sources S1, S14
- Review: Adiabat at 1,000 km: about 1,900 C (model).

### s3b04 · verdict: ok
> The hydrogen keeps getting denser, until about 14,000 kilometers down it is as dense as you.

- `14,000` (narration) = `float_km` = 13733.1 km · depth where the polytrope density equals a human body's · facts F01, F04, F05, F33, F34, F37 · sources S1, S11, S12, S14
- Review: Polytrope density equals a human's (about 1,000 kg/m3, S11) at about 14,000 km (model).

### s3b05 · verdict: fixed
> And there, you float, in hot, crushing hydrogen, under about 2 million atmospheres.

- `2` (narration) = `float_matm` = 2.04956 million atm · P = K rho^2 at rho = 1000 · facts F01, F04, F33, F34, F37, F44 · sources S1, S11, S12, S13, S14
- Review: About 2 million atm (polytrope). 'Total darkness' replaced: hot matter glows.

### s3b06 · verdict: ok
> Getting there takes about 78 days. Jupiter never lets you touch it.

- `78` (narration) = `sink_days` = 77.7819 days · time to sink to within 100 km of the float depth · facts F04, F05, F06, F09, F11, F33, F34, F36, F37 · sources S1, S11, S12, S14
- `78` (visual) = `sink_days` = 77.7819 days · time to sink to within 100 km of the float depth · facts F04, F05, F06, F09, F11, F33, F34, F36, F37 · sources S1, S11, S12, S14
- Review: Sinking time about 78 days (model). No solid surface or sharp core (S2).

## Sources

- S1: NASA Goddard (NSSDCA), Jupiter Fact Sheet (updated 2 Oct 2024) - https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html
- S2: NASA Science, Jupiter: Facts - https://science.nasa.gov/jupiter/jupiter-facts/
- S3: NASA History, 30 Years Ago: Galileo Off to Orbit Jupiter - https://www.nasa.gov/history/30-years-ago-galileo-off-to-orbit-jupiter/
- S4: NASA JPL, Galileo Probe Suggests Planetary Science Reappraisal - https://www.jpl.nasa.gov/news/galileo-probe-suggests-planetary-science-reappraisal/
- S5: NASA Goddard (NSSDCA), Galileo Probe Entry Timeline - https://nssdc.gsfc.nasa.gov/planetary/galileo_probe_time.html
- S6: Sci.News, Jovian Clouds Consist of Ammonium Hydrosulfide, Study Suggests (Oxford-led, 2025) - https://www.sci.news/space/jovian-clouds-ammonium-hydrosulfide-13575.html
- S7: Bolton et al., Microwave observations reveal the deep extent and structure of Jupiter's atmospheric vortices, Science (2021) - https://weizmann.ac.il/EPS/kaspi/sites/EPS.kaspi/files/publications/Bolton-etal-2021_1.pdf
- S8: Bjoraker et al., The Gas Composition and Deep Cloud Structure of Jupiter's Great Red Spot (2018) - https://arxiv.org/abs/1808.01402
- S9: NASA JPL, Shallow Lightning and Mushballs Reveal Ammonia to NASA's Juno Scientists (2020) - https://www.jpl.nasa.gov/news/shallow-lightning-and-mushballs-reveal-ammonia-to-nasas-juno-scientists/
- S10: Smithsonian National Air and Space Museum, The Man Behind High-Speed Safety Standards - https://airandspace.si.edu/stories/editorial/man-behind-high-speed-safety-standards
- S11: Body Physics (Open Oregon), Body Density from Hydrostatic Weighing - https://openoregon.pressbooks.pub/bodyphysics2ed/chapter/body-density-from-hydrostatic-weighing/
- S12: Dewberry and Lai, Dynamical tides in Jupiter and the role of interior structure (2023), index-1 polytrope as leading-order model - https://arxiv.org/abs/2301.02418
- S13: NIST, Guide to the SI, Appendix B.9 (conversion factors: ton of TNT, mile) - https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9
- S14: NIST, CODATA fundamental physical constants - https://physics.nist.gov/cuu/Constants/
- S15: Britannica, Ballistics (muzzle velocities of rifles, about 1 km/s) - https://www.britannica.com/technology/ballistics
