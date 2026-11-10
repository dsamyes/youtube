# Fact-check report: What If Earth Stopped Spinning for 1 Second?

Generated 2026-11-10T00:29:32+00:00 by `pipeline/factcheck.py`. Status: **PASS**

Layers: (A) every number traced to calc.json, (B) worded comparisons re-derived from calc.json, (C) editorial verdict for every beat, pinned to a hash of the beat text.

## Fixes made by the review pass

- **b01**: 'you're moving at up to 1,670 km/h' ignores orbital/galactic motion → *'Earth's spin carries you at up to 1,670 km/h'*
- **hook**: hook estimated at 15.8 s (> 15 s limit, caught by build_script.py) → *trimmed b01/b02 wording to 14.7 s*
- **b17**: tumble distance had no time bound → *'almost half a kilometer in that one second'*
- **b23-b25**: physics model error: used compression-wave speed (5,000 m/s) and tensile yield; a sideways jolt propagates as a shear wave → *shear wave 3,200 m/s, tau = 12 GPa, vs shear yield 140 MPa = 80x (calc.py + research F31 added)*
- **b28**: 'supersonic everywhere at once' is false above ~43 deg latitude → *'supersonic within about 43 degrees of the equator, two-thirds of Earth's surface' (new calc values)*
- **b30**: Cat-5 threshold shown as 253 km/h (our conversion) vs NOAA's published 252 km/h → *uses NOAA's published 252 km/h (research F33); self-check confirms mph/km/h agree*
- **b31**: shock waves 'from every obstacle on the planet' contradicts the supersonic band → *scoped to 'across that zone'*
- **b50**: 'Earth's spin wobbles' conflates polar motion with rotation-rate variation → *'Earth's spin isn't perfectly steady'*
- **b54**: 'every number was calculated on screen' overstated (some are cited facts) → *'comes from a calculation or a cited source'*
- **b55**: 'no surface' imprecise → *'no solid surface'*

## (B) Worded comparisons

| Beat | Phrase | Result |
|---|---|---|
| b04 | about four minutes shorter | PASS |
| b05 | faster than the speed of sound | PASS |
| b07 | turning in place | PASS |
| b16 | takes off just | PASS |
| b17 | almost half a kilometer | PASS |
| b20 | higher than Mount Everest | PASS |
| b21 | smaller, but not small enough | PASS |
| b25 | times that | PASS |
| b28 | supersonic everywhere within | PASS |
| b28 | two-thirds | PASS |
| b29 | at least | PASS |
| b33 | less than half a kilometer | PASS |
| b37 | more than 6 times | PASS |
| b39 | nearly as fast as a jet airliner | PASS |
| b43 | wouldn't notice | PASS |
| b51 | one more leap second | PASS |

## (A + C) Beat-by-beat

### b01 · verdict: fixed
> Right now, Earth's spin carries you at up to 1,670 kilometers per hour, and you can't feel it.

- `1,670` (narration) = `v_eq_kmh` = 1674.36 km/h · v_eq * 3.6 · facts F01, F02 · sources S1, S2
- `1,670` (on-screen) = `v_eq_kmh` = 1674.36 km/h · v_eq * 3.6 · facts F01, F02 · sources S1, S2
- Review: Speed is rotation-only; 'up to' = equator. Draft said 'you're moving at' which ignores orbital motion.

### b02 · verdict: rhetoric
> So what if, for one second, the ground under you stopped, and everything else didn't?

- `1` (on-screen): structural number - 'one second' / '1st law' / '+1' - scenario definitions and ordinals
- Review: Scenario question.

### b03 · verdict: rhetoric
> Welcome to The If Engine, where we run impossible scenarios through real physics, and show you the math.

- Review: Channel intro.

### b04 · verdict: ok
> First, the speed. Earth turns once every 23.93 hours relative to the stars. That's the sidereal day, about four minutes shorter than the 24-hour day on your clock, because Earth is also circling the Sun.

- `23.93` (narration) = `sidereal_h` = 23.9345 h · sidereal rotation period · facts F02 · sources S1
- `24` (narration): structural number - '24-hour day' - the civil day
- `23 h 56 min 4 s` (on-screen) = `sidereal_hms` = 86164.2 s · 23.9345 h in h:min:s · facts F02 · sources S1
- Review: Sidereal 23.9345 h (NASA). Solar minus sidereal = 3 min 56 s -> 'about four minutes'; cause = orbital motion is correct.

### b05 · verdict: ok
> Divide the distance around the equator by that time, and you get about 465 meters per second. That's roughly 1,670 kilometers per hour, faster than the speed of sound.

- `465` (narration) = `v_eq_ms` = 465.101 m/s · v = omega*a = 2*pi*a/T_sid · facts F01, F02 · sources S1, S2
- `1,670` (narration) = `v_eq_kmh` = 1674.36 km/h · v_eq * 3.6 · facts F01, F02 · sources S1, S2
- Review: 2*pi*a/T_sid = 465.1 m/s = 1,674 km/h -> 'roughly 1,670'. 465 > 340 m/s so 'faster than sound' holds.

### b06 · verdict: ok
> But not everyone moves that fast. The farther you are from the equator, the smaller the circle you trace every day.

- Review: Radius of the circle = N cos(lat), shrinks with latitude.

### b07 · verdict: ok
> In Singapore, you're doing about 465 meters per second. In Cairo, 403. New York, 353. London, 290. And at the North Pole, you're just turning in place.

- `465` (narration) = `v_singapore_ms` = 464.972 m/s · omega*N(phi)*cos(phi), phi=1.35 · facts F01, F02, F03, F35 · sources S1, S2, S25
- `403` (narration) = `v_cairo_ms` = 402.965 m/s · omega*N(phi)*cos(phi), phi=30.04 · facts F01, F02, F03, F35 · sources S1, S2, S25
- `353` (narration) = `v_newyork_ms` = 353.059 m/s · omega*N(phi)*cos(phi), phi=40.71 · facts F01, F02, F03, F35 · sources S1, S2, S25
- `290` (narration) = `v_london_ms` = 290.064 m/s · omega*N(phi)*cos(phi), phi=51.51 · facts F01, F02, F03, F35 · sources S1, S2, S25
- Review: WGS84 ellipsoid speeds at city latitudes; pole speed 0.

### b08 · verdict: ok
> We never feel any of this, because the ground, the air, the oceans and you are all moving together, at a steady speed. Motion you share with everything around you is motion you can't feel.

- Review: Uniform circular motion at constant speed; centripetal accel 0.034 m/s^2 is imperceptible. Simplification acceptable.

### b09 · verdict: rhetoric
> Which is exactly why breaking that agreement, even for one second, is such a terrible idea.

- Review: Transition.

### b10 · verdict: rhetoric
> Here are the rules of today's experiment.

- `1` (visual): structural number - 'one second' / '1st law' / '+1' - scenario definitions and ordinals
- `2` (visual): structural number - ordinal / 'two' as a count in labels
- `1` (visual): structural number - 'one second' / '1st law' / '+1' - scenario definitions and ordinals
- `3` (visual): structural number - ordinal in labels
- Review: Scenario rules.

### b11 · verdict: ok
> Rule one: the solid Earth, every rock and everything bolted to it, stops rotating instantly.

- `1` (visual): structural number - 'one second' / '1st law' / '+1' - scenario definitions and ordinals
- `2` (visual): structural number - ordinal / 'two' as a count in labels
- `1` (visual): structural number - 'one second' / '1st law' / '+1' - scenario definitions and ordinals
- `3` (visual): structural number - ordinal in labels
- Review: Scenario rule (stated as hypothetical).

### b12 · verdict: ok
> Rule two: it stays perfectly still for exactly one second.

- `1` (visual): structural number - 'one second' / '1st law' / '+1' - scenario definitions and ordinals
- `2` (visual): structural number - ordinal / 'two' as a count in labels
- `1` (visual): structural number - 'one second' / '1st law' / '+1' - scenario definitions and ordinals
- `3` (visual): structural number - ordinal in labels
- Review: Scenario rule.

### b13 · verdict: ok
> Rule three: it snaps back to its normal spin, as if nothing happened.

- `1` (visual): structural number - 'one second' / '1st law' / '+1' - scenario definitions and ordinals
- `2` (visual): structural number - ordinal / 'two' as a count in labels
- `1` (visual): structural number - 'one second' / '1st law' / '+1' - scenario definitions and ordinals
- `3` (visual): structural number - ordinal in labels
- Review: Scenario rule.

### b14 · verdict: ok
> Everything that isn't rock, the air, the water, and you, simply follows Newton's first law. It keeps moving at the speed it already had.

- `1` (on-screen): structural number - 'one second' / '1st law' / '+1' - scenario definitions and ordinals
- `1` (visual): structural number - 'one second' / '1st law' / '+1' - scenario definitions and ordinals
- `2` (visual): structural number - ordinal / 'two' as a count in labels
- `1` (visual): structural number - 'one second' / '1st law' / '+1' - scenario definitions and ordinals
- `3` (visual): structural number - ordinal in labels
- `0` (visual) = `v_northpole_ms` = 2.8575e-14 m/s · omega*N(phi)*cos(phi), phi=90.0 · facts F01, F02, F03, F35 · sources S1, S2, S25
- Review: Newton's first law: unforced bodies keep their velocity.

### b15 · verdict: ok
> Let's start the clock. At time zero, the ground stops. Say you're standing on the equator. From the ground's point of view, you're suddenly hurtling east at 465 meters per second.

- `465` (narration) = `v_eq_ms` = 465.101 m/s · v = omega*a = 2*pi*a/T_sid · facts F01, F02 · sources S1, S2
- `465` (on-screen) = `v_eq_ms` = 465.101 m/s · v = omega*a = 2*pi*a/T_sid · facts F01, F02 · sources S1, S2
- Review: Relative speed to stopped ground = inertial speed, 465 m/s at equator, eastward.

### b16 · verdict: ok
> Can friction save you? Rubber on dry concrete can slow you down at about 6.9 meters per second squared. Over the whole second, that takes off just 7 meters per second. You'd still be going 458.

- `6.9` (narration) = `friction_decel` = 6.86465 m/s^2 · mu*g · facts F26, F04 · sources S21, S3
- `7` (narration) = `friction_dv` = 6.86465 m/s · mu*g*1 s · facts F26, F04 · sources S21, S3
- `458` (narration) = `v_after_friction` = 458.236 m/s · v_eq - mu*g*1s · facts F26 · sources S21
- Review: mu=0.7 rubber/dry concrete (Eng. ToolBox 0.6-0.85); a = mu g = 6.9 m/s^2; 1 s -> 7 m/s; 465-7=458.

### b17 · verdict: fixed
> If nothing were in your way, you'd tumble almost half a kilometer in that one second.

- `465` (on-screen) = `one_sec_distance` = 465.101 m · v_eq * 1 s · facts F01, F02 · sources S1, S2
- `1` (on-screen): structural number - 'one second' / '1st law' / '+1' - scenario definitions and ordinals
- Review: Draft implied open-ended tumble; scoped to 'in that one second' (<= 465 m).

### b18 · verdict: rhetoric
> But on a planet covered in walls, trees and cars, something is always in your way. So how hard is that hit?

- Review: Open loop.

### b19 · verdict: ok
> At 465 meters per second, a 70 kilogram person carries about 7.6 megajoules of kinetic energy. That's the energy released by roughly 1.8 kilograms of TNT.

- `465` (narration) = `v_eq_ms` = 465.101 m/s · v = omega*a = 2*pi*a/T_sid · facts F01, F02 · sources S1, S2
- `70` (narration) = `person_mass` = 70 kg · assumed · facts F28 · sources S23
- `7.6` (narration) = `ke_person_mj` = 7.57115 MJ · 1/2 m v^2 · facts F28, F01, F02 · sources S1, S2, S23
- `1.8` (narration) = `ke_person_tnt` = 1.80955 kg TNT · KE / 4.184 MJ/kg · facts F19 · sources S15
- Review: 1/2*70*465.1^2 = 7.57 MJ; /4.184 MJ/kg = 1.81 kg TNT.

### b20 · verdict: ok
> Here's another way to feel that number. Hitting a wall at that speed is like falling from a height of 11 kilometers, with no air to slow you down. That's higher than Mount Everest.

- `11` (narration) = `fall_height_km` = 11.0292 km · v^2/(2g) · facts F04 · sources S3
- Review: Energy-equivalent drop h = v^2/2g = 11.0 km > Everest 8.85 km; 'no air' caveat stated.

### b21 · verdict: ok
> In London, the numbers are smaller, but not small enough. Even at 290 meters per second, it's the same as falling from 4.3 kilometers.

- `290` (narration) = `v_london_ms` = 290.064 m/s · omega*N(phi)*cos(phi), phi=51.51 · facts F01, F02, F03, F35 · sources S1, S2, S25
- `4.3` (narration) = `fall_height_london_km` = 4.28979 km · v_London^2/(2g) · facts F04 · sources S3
- `4.3` (on-screen) = `fall_height_london_km` = 4.28979 km · v_London^2/(2g) · facts F04 · sources S3
- Review: London 51.5 N: 290 m/s -> 4.3 km.

### b22 · verdict: ok
> Now, buildings. Unlike you, they're anchored to the rock. So when the rock stops, their foundations stop with it, instantly.

- Review: Follows from rule one (rock and everything bolted to it stops).

### b23 · verdict: fixed
> The upper floors don't know that yet. The news travels up the structure as a shear wave, a kind of sound wave in steel, moving at about 3,200 meters per second.

- `3,200` (narration) = `c_steel` = 3178.35 m/s · shear wave speed sqrt(G/rho) · facts F31, F24 · sources S19, S27
- `3,200` (on-screen) = `c_steel` = 3178.35 m/s · shear wave speed sqrt(G/rho) · facts F31, F24 · sources S19, S27
- Review: Draft used compression (bar) wave 5,000 m/s; a sideways base jolt travels up as a SHEAR wave, sqrt(G/rho) = 3,180 m/s.

### b24 · verdict: fixed
> The stress that wave carries is density, times wave speed, times the sudden change in velocity. For steel, that's about 12 gigapascals.

- `12` (narration) = `steel_stress_gpa` = 11.6043 GPa · tau = rho*c_s*dv · facts F31, F24 · sources S19, S27
- Review: tau = rho c_s dv = 11.6 GPa (draft: 18 GPa from bar model).

### b25 · verdict: fixed
> Common structural steel starts to give way in shear at around 140 megapascals. Our stress wave is about 80 times that. Structures bolted to the ground just aren't built for a jolt like this.

- `140` (narration) = `steel_yield_mpa` = 144.338 MPa · von Mises shear yield = 250/sqrt(3) · facts F25 · sources S20
- `80` (narration) = `steel_ratio` = 80.3968 x · tau / tau_y · facts F25, F31 · sources S20, S27
- `80` (on-screen) = `steel_ratio` = 80.3968 x · tau / tau_y · facts F25, F31 · sources S20, S27
- Review: Compared against shear yield 250/sqrt(3) = 144 MPa -> ~80x (draft: 74x vs tensile yield). Conclusion phrased qualitatively.

### b26 · verdict: rhetoric
> And yet, as bad as all that is, it isn't the biggest problem. The biggest problem is the thing you can't see.

- Review: Tease.

### b27 · verdict: ok
> The atmosphere isn't bolted to anything. When the ground stops, the air keeps going. At the equator, that's a wind of 465 meters per second, blowing from west to east.

- `465` (narration) = `v_eq_ms` = 465.101 m/s · v = omega*a = 2*pi*a/T_sid · facts F01, F02 · sources S1, S2
- `465` (on-screen) = `v_eq_ms` = 465.101 m/s · v = omega*a = 2*pi*a/T_sid · facts F01, F02 · sources S1, S2
- Review: Air keeps eastward velocity; relative wind blows west->east at 465 m/s at equator.

### b28 · verdict: fixed
> At sea level, sound travels at about 340 meters per second. So at the equator, this wind is Mach 1.37. It stays supersonic everywhere within about 43 degrees of the equator. That's two-thirds of Earth's surface, all at once.

- `340` (narration) = `c_air` = 340.292 m/s · sqrt(gamma R T) · facts F08, F09, F06 · sources S4, S5
- `1.37` (narration) = `mach` = 1.36677 - · v/c · facts F08, F09, F06 · sources S4, S5
- `43` (narration) = `supersonic_lat` = 42.9748 deg · acos(c/v_eq) · facts F08, F09, F06 · sources S4, S5
- Review: Draft said supersonic 'everywhere'. Only where v(lat) > 340 m/s: |lat| < 43 deg = sin(43 deg) = 68% of surface. Spherical approx, 'about'.

### b29 · verdict: ok
> Anything standing in its way gets pushed with at least half the air density times the wind speed squared. That's 132 kilopascals, about 14 tonnes of force on every square meter of wall.

- `132` (narration) = `q_kpa` = 132.495 kPa · 1/2 rho v^2 · facts F05 · sources S4
- `14` (narration) = `q_tonnes` = 13.5107 tonnes-force per m^2 · q*1m^2/g/1000 · facts F04 · sources S3
- Review: q = 1/2 rho v^2 = 132 kPa is a LOWER bound; shock-corrected pitot overpressure is 196 kPa, hence 'at least'. 13.5 t-force/m^2 shown as 14.

### b30 · verdict: fixed
> For comparison, a Category 5 hurricane starts at 252 kilometers per hour. That push grows with the square of the speed, so our wind pushes about 44 times harder than the minimum Category 5 wind.

- `5` (narration): structural number - 'Category 5' is a scale name (NOAA NHC)
- `252` (narration) = `cat5_kmh` = 252 km/h · NOAA NHC published km/h threshold · facts F33 · sources S6
- `44` (narration) = `hurricane_ratio` = 43.9139 x · (v_eq/v_cat5)^2 · facts F10 · sources S6
- `5` (narration): structural number - 'Category 5' is a scale name (NOAA NHC)
- `5` (visual): structural number - 'Category 5' is a scale name (NOAA NHC)
- `252` (visual) = `cat5_kmh` = 252 km/h · NOAA NHC published km/h threshold · facts F33 · sources S6
- `3` (visual): structural number - ordinal in labels
- `1,670` (visual) = `v_eq_kmh` = 1674.36 km/h · v_eq * 3.6 · facts F01, F02 · sources S1, S2
- `132` (visual) = `q_kpa` = 132.495 kPa · 1/2 rho v^2 · facts F05 · sources S4
- `44` (visual) = `hurricane_ratio` = 43.9139 x · (v_eq/v_cat5)^2 · facts F10 · sources S6
- Review: Draft showed 253 km/h (our own mph conversion); NOAA publishes 252 km/h - now uses published value. Ratio (465.1/70.2)^2 = 43.9.

### b31 · verdict: fixed
> Across that zone, every building, tree and hill would grow its own shock wave. Picture a sonic boom, but instead of one passing jet, it comes from every obstacle at the same moment.

- Review: Draft said 'every obstacle on the planet'; restricted to the supersonic zone.

### b32 · verdict: ok
> Altogether, the moving air carries about 3.7 × 10²³ joules of kinetic energy relative to the ground. That's roughly 600 years of humanity's entire energy use.

- `3.7 × 10²³` (narration) = `atm_ke` = 3.71203e+23 J · 1/2 M <v^2>, <cos^2>=2/3 · facts F21 · sources S17
- `600` (narration) = `atm_ke_years` = 598.714 years · KE / world energy per year (rounded to 100) · facts F22 · sources S18
- Review: 1/2 * 5.148e18 kg * 2/3 * v_eq^2 = 3.7e23 J (area-weighted cos^2 mean 2/3, uniform column mass assumed). / 620 EJ/yr = ~600 yr.

### b33 · verdict: ok
> But here's the twist. It only has one second to deliver it. In one second, even the fastest air moves less than half a kilometer, and most of the air above the rooftops never touches anything solid before the ground starts again.

- `1` (on-screen): structural number - 'one second' / '1st law' / '+1' - scenario definitions and ordinals
- Review: 465 m < 500 m. ~95% of atmospheric mass lies above ~500 m altitude, so 'most of the air above the rooftops' is defensible; mountains excepted.

### b34 · verdict: ok
> Now, the oceans. Like the air, the water keeps moving while the sea floor stops. The open ocean is, on average, 3.7 kilometers deep, and near the equator that entire column of water slides east by up to 465 meters.

- `3.7` (narration) = `ocean_depth_km` = 3.682 km · NOAA average depth · facts F11 · sources S7
- `465` (narration) = `one_sec_distance` = 465.101 m · v_eq * 1 s · facts F01, F02 · sources S1, S2
- Review: Seafloor stops, water keeps velocity; NOAA mean depth 3,682 m.

### b35 · verdict: ok
> That's about 1.7 million cubic meters of water shoved toward the shore for every single meter of coastline in its path. Roughly 690 Olympic swimming pools, per meter.

- `1.7` (narration) = `ocean_volume_per_m` = 1.7125 million m^3 per m · v*1s*depth · facts F11 · sources S7
- `690` (narration) = `olympic_pools` = 685 pools per m · vol / 2500 m^3 · facts F27 · sources S22
- Review: 465 m * 3,682 m = 1.71e6 m^3 per metre; /2,500 m^3 = 685 pools. Deep-water column assumption stated via 'in its path'.

### b36 · verdict: ok
> But the coasts are where it gets violent. When fast-moving water slams into a steep rock face, it can't get out of the way. Engineers call this water hammer, and the pressure spike is density, times the speed of sound in water, times the impact speed.

- Review: Joukowsky water-hammer relation dp = rho c dv for an instantaneous stop against a rigid boundary.

### b37 · verdict: ok
> With water hitting rock at 465 meters per second, that's around 720 megapascals, more than 6 times the crushing pressure at the bottom of the Mariana Trench.

- `465` (narration) = `v_eq_ms` = 465.101 m/s · v = omega*a = 2*pi*a/T_sid · facts F01, F02 · sources S1, S2
- `720` (narration) = `hammer_mpa` = 715.092 MPa · Joukowsky rho*c*dv · facts F12, F13, F34 · sources S26, S8, S9
- `6` (narration) = `hammer_ratio_floor` = 6 x · floor(ratio) · facts F14 · sources S10
- Review: 1025*1500*465.1 = 715 MPa ('around 720'); Challenger Deep 10,935 m -> ~110 MPa; ratio 6.5 -> 'more than 6'.

### b38 · verdict: ok
> On the coasts facing the other way, the water does the reverse. It pulls away from the land, for a moment uncovering the sea floor near the shore.

- Review: Water moving east leaves west-side (east-facing) coasts; qualitative, scoped to 'near the shore'.

### b39 · verdict: ok
> Once the ground starts again, gravity tries to level everything out, and that sends tsunamis across every ocean. In water 3.7 kilometers deep, a tsunami travels at about 684 kilometers per hour, nearly as fast as a jet airliner, crossing 5,000 kilometers of ocean in about 7.3 hours.

- `3.7` (narration) = `ocean_depth_km` = 3.682 km · NOAA average depth · facts F11 · sources S7
- `684` (narration) = `tsunami_kmh` = 684.077 km/h · sqrt(g d)*3.6 · facts F04, F11, F15 · sources S11, S3, S7
- `5,000` (narration) = `ocean_cross_km` = 5000 km · illustrative ocean width · facts - · sources -
- `7.3` (narration) = `ocean_cross_h` = 7.30912 h · 5000 km / c · facts F11 · sources S7
- Review: sqrt(g*3682) = 190 m/s = 684 km/h, 76% of ~900 km/h jet cruise ('nearly'); NOAA itself says 'as fast as a jet plane'. 5,000 km / 190 m/s = 7.3 h.

### b40 · verdict: ok
> How tall would those waves be? Honestly, that depends on the shape of every coastline and sea floor. That takes a supercomputer, not a video. But the push is enormous, and it reaches every ocean basin at once.

- Review: Honest uncertainty statement; no height claimed.

### b41 · verdict: ok
> So, is anyone safe? Surprisingly, yes. Anyone who isn't touching the ground.

- Review: Things not in contact with the ground keep moving with the air/orbit.

### b42 · verdict: ok
> A cruising airliner is carried by the air around it, and that air doesn't stop. For that one second, passengers would feel nothing at all, while the ground far below them lurches to a halt.

- Review: At cruise altitude the air mass is undisturbed during the 1 s (no obstacles).

### b43 · verdict: ok
> And the astronauts on the International Space Station, orbiting at about 28,000 kilometers per hour, wouldn't notice anything. Their orbit doesn't care how fast the planet underneath is spinning.

- `28,000` (narration) = `iss_kmh` = 28163.5 km/h · 17,500 mph in km/h · facts F18 · sources S14
- `28,000` (on-screen) = `iss_kmh` = 28163.5 km/h · 17,500 mph in km/h · facts F18 · sources S14
- Review: NASA: ~17,500 mph = 28,000 km/h. Orbit is set by gravity and the ISS's own velocity, not Earth's spin.

### b44 · verdict: ok
> Then the second is up. The rock snaps back to full speed.

- Review: Scenario rule three.

### b45 · verdict: ok
> That should fix everything, right? Not quite. Anything that got slowed down during that second, by hitting a wall, scraping along the ground or piling up against a coast, is now moving slower than the ground again.

- Review: Anything that lost eastward speed is now slower than the restarted ground.

### b46 · verdict: ok
> So the jolt happens again, in reverse. Everything that was stopped gets hit by the restarting planet at up to 465 meters per second, from the other direction.

- `465` (narration) = `v_eq_ms` = 465.101 m/s · v = omega*a = 2*pi*a/T_sid · facts F01, F02 · sources S1, S2
- `465` (on-screen) = `v_eq_ms` = 465.101 m/s · v = omega*a = 2*pi*a/T_sid · facts F01, F02 · sources S1, S2
- Review: Object at rest (inertial) vs ground at 465 m/s -> relative 465 m/s, opposite direction; 'up to'.

### b47 · verdict: rhetoric
> Two hits, one second apart. That's the real price of a single stopped second.

- Review: Summary line.

### b48 · verdict: ok
> Once the dust settles, there's one strange, permanent change. Earth has lost exactly one second of rotation.

- Review: Rotation phase permanently lags by 1 s under the scenario rules.

### b49 · verdict: ok
> In that second, the planet should have turned by about 15 arcseconds. It didn't. So every place on Earth is now one second behind where the stars say it should be.

- `15` (narration) = `rot_arcsec` = 15.041 arcsec · 360°/T_sid * 1 s · facts F02 · sources S1
- Review: 360 deg * 3600 / 86,164 s = 15.04 arcsec per second of time.

### b50 · verdict: fixed
> Astronomers track exactly this kind of drift. Atomic clocks keep steady time, but Earth's spin isn't perfectly steady, so since 1972, timekeepers have inserted 27 leap seconds to keep our clocks in step with the planet.

- `1972,` (narration): structural number - start of leap seconds (IERS, research F16)
- `27` (narration) = `leap_count` = 27 count · IERS list · facts F16 · sources S12, S13
- `27` (on-screen) = `leap_count` = 27 count · IERS list · facts F16 · sources S12, S13
- `1972` (on-screen): structural number - start of leap seconds (IERS, research F16)
- Review: Draft said Earth's spin 'wobbles' (wobble = polar motion, a different thing); now 'isn't perfectly steady'. 27 leap seconds 1972-2016 (IERS).

### b51 · verdict: ok
> So after all that destruction, the official cleanup would include one tiny line item: one more leap second.

- `1` (on-screen): structural number - 'one second' / '1st law' / '+1' - scenario definitions and ordinals
- Review: IERS keeps |UT1-UTC| < 0.9 s, so a 1 s jump forces a leap second.

### b52 · verdict: ok
> So, what if Earth stopped spinning for one second? A supersonic wind, a stress wave through every building, water hammer on the coasts, tsunamis in every ocean, and then the whole thing again in reverse.

- `1.37` (visual) = `mach` = 1.36677 - · v/c · facts F08, F09, F06 · sources S4, S5
- `12` (visual) = `steel_stress_gpa` = 11.6043 GPa · tau = rho*c_s*dv · facts F31, F24 · sources S19, S27
- `720` (visual) = `hammer_mpa` = 715.092 MPa · Joukowsky rho*c*dv · facts F12, F13, F34 · sources S26, S8, S9
- `684` (visual) = `tsunami_kmh` = 684.077 km/h · sqrt(g d)*3.6 · facts F04, F11, F15 · sources S11, S3, S7
- Review: Recap of claims made above.

### b53 · verdict: rhetoric
> One second is short. Momentum doesn't care.

- Review: Moral.

### b54 · verdict: fixed
> Every number in this video comes from a calculation or a cited source, and the sources are in the description, so go ahead and check our math.

- Review: Draft said 'every number was calculated on screen' - false for cited facts (e.g. ISS speed) and city speeds. Reworded.

### b55 · verdict: fixed
> Next time, we leave solid ground behind entirely. What happens if you fall into Jupiter, a planet with no solid surface to land on? Subscribe so you don't miss it. This was The If Engine. Run the impossible. Do the math.

- Review: 'no surface' -> 'no solid surface' (NASA: Jupiter has no true solid surface).

## Sources

- S1: NASA NSSDC, Earth Fact Sheet - https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html
- S2: NGA, World Geodetic System 1984 (WGS 84), NGA.STND.0036 - https://earth-info.nga.mil/index.php?dir=wgs84&action=wgs84
- S3: NIST CODATA, standard acceleration of gravity - https://physics.nist.gov/cgi-bin/cuu/Value?gn
- S4: NOAA/NASA/USAF, U.S. Standard Atmosphere 1976 (NASA-TM-X-74335) - https://ntrs.nasa.gov/citations/19770009539
- S5: NASA Glenn Research Center, Speed of Sound / Normal Shock (Beginner's Guide to Aeronautics) - https://www.grc.nasa.gov/www/k-12/airplane/sound.html
- S6: NOAA National Hurricane Center, The Saffir-Simpson Hurricane Wind Scale - https://www.nhc.noaa.gov/aboutsshws.php
- S7: NOAA Ocean Exploration, How deep is the ocean? - https://oceanexplorer.noaa.gov/facts/ocean-depth.html
- S8: NOAA National Ocean Service / TEOS-10 (seawater density ~1,020-1,030 kg/m^3) - https://www.teos-10.org/
- S9: DOSITS (Univ. of Rhode Island), How fast does sound travel? - https://dosits.org/science/sounds-in-the-sea/how-fast-does-sound-travel/
- S10: NOAA Ocean Exploration, How deep is the Mariana Trench? - https://oceanexplorer.noaa.gov/facts/mariana-trench.html
- S11: NOAA JetStream, Tsunami propagation - https://www.noaa.gov/jetstream/tsunamis/tsunami-propagation
- S12: IERS Earth Orientation Center, leap-seconds list (Bulletin C) - https://hpiers.obspm.fr/iers/bul/bulc/ntp/leap-seconds.list
- S13: NIST Time and Frequency Division, Leap seconds - https://www.nist.gov/pml/time-and-frequency-division/leap-seconds-faqs
- S14: NASA, International Space Station facts and figures - https://www.nasa.gov/international-space-station/space-station-facts-and-figures/
- S15: NIST SP 811, Guide for the Use of the International System of Units (TNT equivalent) - https://www.nist.gov/pml/special-publication-811
- S16: Encyclopaedia Britannica, Mount Everest (8,848.86 m, 2020 China-Nepal survey) - https://www.britannica.com/place/Mount-Everest
- S17: Trenberth & Smith (2005), The Mass of the Atmosphere, Journal of Climate 18:864 - https://doi.org/10.1175/JCLI-3299.1
- S18: Energy Institute, Statistical Review of World Energy 2024 - https://www.energyinst.org/statistical-review
- S19: Engineering ToolBox, Young's modulus / densities of metals (steel E = 200 GPa, 7,850 kg/m^3) - https://www.engineeringtoolbox.com/young-modulus-d_417.html
- S20: ASTM A36/A36M, Standard Specification for Carbon Structural Steel - https://www.astm.org/a0036_a0036m-19.html
- S21: Engineering ToolBox, Friction and friction coefficients - https://www.engineeringtoolbox.com/friction-coefficients-d_778.html
- S22: World Aquatics (FINA) Facilities Rules, FR 2 (50 m competition pool) - https://www.worldaquatics.com/rules/competition-regulations
- S23: ICRP Publication 89, Basic anatomical and physiological data (reference adult) - https://www.icrp.org/publication.asp?id=ICRP%20Publication%2089
- S24: NASA Science, Jupiter facts - https://science.nasa.gov/jupiter/jupiter-facts/
- S25: GeoNames geographical database - https://www.geonames.org/
- S27: Engineering ToolBox, Modulus of rigidity (shear modulus) of materials - https://www.engineeringtoolbox.com/modulus-rigidity-d_946.html
- S28: Boeing, 787 Dreamliner technical characteristics (cruise Mach 0.85) - https://www.boeing.com/commercial/787
- S26: Ghidaoui et al. (2005), A Review of Water Hammer Theory and Practice, Applied Mechanics Reviews 58(1):49 - https://doi.org/10.1115/1.1828050
