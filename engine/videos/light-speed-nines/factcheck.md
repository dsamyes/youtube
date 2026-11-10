# Fact-check report: What If You Traveled at 99.9999% the Speed of Light?

Generated 2026-11-10T23:21:11+00:00 by `pipeline/factcheck.py`. Status: **PASS**

Layers: (A) every number traced to calc.json, (B) worded comparisons re-derived from calc.json, (C) editorial verdict for every beat, pinned to a hash of the beat text.

## Fixes made by the review pass

- **b01, b42, s1b01, s1b05**: Draft promised a 'starbow' ring of stars. Our own simulation shows no ring, and McKinley & Doherty (Am. J. Phys. 1979) showed the starbow does not appear when the starfield is computed properly. → *Reworded the hook to 'one patch of light ahead' and turned the starbow into a myth-busting beat with the 1979 source (F34, S28, S29).*
- **b21**: 'Those go straight through a human body' overstates: a 145 MeV proton stops after ~15 cm of water. → *'Those reach deep inside a human body.'*
- **b18, b29**: 'slid forward to 60 degrees ahead of you' is ambiguous (could mean moved by 60 degrees). → *'now appears just 60 degrees from straight ahead' (and 26 degrees at 90%).*
- **b43, b47**: CMB temperature ahead was rounded to 2 significant figures (390 K for 385 K). → *3 significant figures: 385 K and 3,850 K.*
- **b37, b38**: 'the stars ahead fade' was asserted without a computed check. → *Added calc value fade_999 (visible-band flux ratio 0.58) and a self-check.*
- **b26**: Dose figure depends on shielding and secondary showers. → *Stated as 'unshielded'; computed as a lower bound with the minimum stopping power of water.*

## (B) Worded comparisons

| Beat | Phrase | Result |
|---|---|---|
| b09 | times faster than the fastest | PASS |
| b13 | less than half a millimeter | PASS |
| b20 | same energy hospitals | PASS |
| b21 | less than 16 centimeters | PASS |
| b24 | more energy than its own mass | PASS |
| b26 | under half a second | PASS |
| b33 | about seven years older | PASS |
| b35 | 200 times | PASS |
| b40 | more than all the nines before it | PASS |
| b38 | so it fades | PASS |
| b43 | hotter than boiling water | PASS |
| b47 | smaller than the moon | PASS |
| b49 | two-thirds of a mosquito | PASS |
| b49 | trillions of times a second | PASS |
| b57 | faster than any proton | PASS |
| b61 | further into the future | PASS |
| s3b02 | two-thirds of the energy of a flying mosquito | PASS |
| s3b04 | proton therapy beam | PASS |
| s3b05 | under half a second | PASS |

## (A + C) Beat-by-beat

### b01 · verdict: fixed
> At 99.9999% of light speed, the whole sky collapses into one patch of light ahead. You age one year. Earth ages 707.

- `99.9999` (narration) = `pct_999999` = 99.9999 % · scenario speed · facts - · sources -
- `707` (narration) = `ey_999999` = 707.107 yr · Earth years per ship year = gamma · facts - · sources -
- `99.9999` (on-screen) = `pct_999999` = 99.9999 % · scenario speed · facts - · sources -
- Review: gamma(0.999999)=707 (calc). Draft said 'every star crowds into one ring'; our own simulation and McKinley & Doherty 1979 show no ring, so reworded to 'one patch of light ahead' (aberration puts all but the rearmost stars within ~1 deg).

### b02 · verdict: rhetoric
> One speed on the way here kills you. Which one?

- Review: Open loop; payoff in b23-b27 (unshielded lethal dose at 90%, a lower bound). Trimmed 'But' for hook length.

### b03 · verdict: ok
> Here's the trip. You get a ship with the mass of the International Space Station, about 420 tonnes, and one control: a dial that adds nines to your speed.

- `420` (narration) = `ship_mass_t` = 419.725 t · ISS mass · facts F10 · sources S10
- Review: ISS mass 419,725 kg (NASA) -> 'about 420 tonnes'. The dial is the scenario device.

### b04 · verdict: rhetoric
> 10%. 50%. 90%. Then 99, 99.9. One nine at a time.

- `10` (narration) = `pct_10` = 10 % · scenario speed · facts - · sources -
- `50` (narration) = `pct_50` = 50 % · scenario speed · facts - · sources -
- `90` (narration) = `pct_90` = 90 % · scenario speed · facts - · sources -
- `99,` (narration) = `pct_99` = 99 % · scenario speed · facts - · sources -
- `99.9` (narration) = `pct_999` = 99.9 % · scenario speed · facts - · sources -
- Review: Lists the scenario speeds (definitions, not measurements). Shortened for captions.

### b05 · verdict: rhetoric
> At every stop, we check four things. Your clock against Earth's. What you see out the window. What's hitting the front of the ship. And the bill.

- Review: Structure of each level.

### b06 · verdict: ok
> And this sky is not a painting. It's tens of thousands of real stars from a star catalog, moved and recolored by the actual equations of relativity, frame by frame.

- Review: Star field = HYG v4.0 catalogue (~28,500 stars to V=7.6) transformed per frame with aberration, Doppler and beaming (physics.ts). 'tens of thousands' true; diffuse glow stand-in disclosed in research.md.

### b07 · verdict: ok
> One number runs the whole journey. Physicists call it gamma. It says how many seconds pass on Earth for every second on your clock, and it lives in the corner of your screen.

- Review: gamma = dt_Earth / dt_ship for constant cruise speed (special relativity). HUD shows it.

### b08 · verdict: ok
> First stop. 10%. You're covering 30,000 kilometers every second.

- `10` (narration) = `pct_10` = 10 % · scenario speed · facts - · sources -
- `30,000` (narration) = `kms_10` = 29979.2 km/s · beta * c · facts F01 · sources S1
- Review: 0.1 c = 29,979 km/s -> '30,000 kilometers every second'.

### b09 · verdict: ok
> That's 156 times faster than the fastest thing humans have ever built, NASA's Parker Solar Probe.

- `156` (narration) = `psp_ratio_10` = 155.957 x · 10% c / Parker speed · facts F28, F33, F01 · sources S1, S24, S25
- Review: Parker Solar Probe ~430,000 mph = 192 km/s (NASA), the fastest human-made object; 29,979/192 = 156.

### b10 · verdict: ok
> And yet your clock barely notices. For every year you spend on board, Earth gets about 2 extra days.

- `2` (narration) = `xdays_10_round` = 2 days · 1.84 days rounds to about 2 · facts F02 · sources S2
- `2` (on-screen) = `xdays_10_round` = 2 days · 1.84 days rounds to about 2 · facts F02 · sources S2
- Review: (gamma-1)*365.25 d = 1.84 d per ship year -> 'about 2 extra days'.

### b11 · verdict: ok
> Out the window, the stars have crept a few degrees forward. Ahead, they look a touch bluer. Behind, a touch redder. Nothing dramatic yet.

- Review: At 0.1c a sideways star appears at acos(0.1)=84 deg (6 deg forward); D ahead 1.11 (bluer), behind 0.90 (redder). Reworded into shorter sentences for captions; meaning unchanged.

### b12 · verdict: ok
> So what's hitting you? Space isn't empty. There's about 1 hydrogen atom in every cubic centimeter, and you're plowing into all of them.

- `1` (narration) = `density` = 1 atoms/cm^3 · typical interstellar density · facts F08 · sources S8
- Review: Typical interstellar density ~1 atom/cm3 (NASA Genesis). 'about' because the local medium is less dense (stated in assumptions).

### b13 · verdict: ok
> Each one arrives with 4.7 million electron volts, and stops in less than half a millimeter of water. Your hull shrugs it off.

- `4.7` (narration) = `ep_10` = 4.72684 MeV · (gamma-1) m_p c^2 · facts F03 · sources S3
- `4.7` (on-screen) = `ep_10` = 4.72684 MeV · (gamma-1) m_p c^2 · facts F03 · sources S3
- Review: (gamma-1) m_p c^2 = 4.73 MeV; NIST PSTAR CSDA range of a 5 MeV proton in water is 0.36 mm, so a 4.7 MeV proton stops in under half a millimetre.

### b14 · verdict: ok
> The bill. Getting this ship to 10% takes as much energy as the entire world uses in about 3.9 months.

- `10` (narration) = `pct_10` = 10 % · scenario speed · facts - · sources -
- `3.9` (narration) = `kemo_10` = 3.85219 months · KE / world energy, in months · facts F10, F01, F09 · sources S1, S10, S9
- Review: KE = (gamma-1) M c^2 = 1.9e20 J; 592 EJ/yr world (Energy Institute 2025) -> 0.32 yr = 3.9 months. Minimum: perfect engine, no fuel (stated).

### b15 · verdict: ok
> And Alpha Centauri, the nearest star system, is 43.7 years away. You'd step off the ship as an old person. Keep that in mind. The destinations are about to get much closer.

- `43.7` (narration) = `te_ac_10` = 43.7 yr · Earth time = d/v to ac · facts F05 · sources S5
- Review: 4.37 ly / 0.1c = 43.7 yr Earth time (ship 43.5 yr). 'old person' is rhetoric for a 43-year trip.

### b16 · verdict: rhetoric
> Turn the dial. 50%. Half the speed of light.

- `50` (narration) = `pct_50` = 50 % · scenario speed · facts - · sources -
- Review: Scenario speed.

### b17 · verdict: ok
> Now the clocks really split. For every year you live, Earth lives 1.15. That's 57 extra days, every year.

- `1.15` (narration) = `ey_50` = 1.1547 yr · Earth years per ship year = gamma · facts - · sources -
- `57` (narration) = `xdays_50` = 56.5044 days · (gamma-1) * 365.25 d per ship year · facts F02 · sources S2
- Review: gamma(0.5)=1.155 -> 1.15; extra days 0.155*365.25 = 56.5 -> 57.

### b18 · verdict: fixed
> Look at a star that was right beside you. It isn't there anymore. It has slid forward, and now appears just 60 degrees from straight ahead. The whole sky is sliding toward your nose.

- `60` (narration) = `side_50` = 60 deg · cos(theta') = beta for theta = 90 deg · facts F31 · sources S26
- `90` (on-screen): structural number - θ = 90° (a star exactly beside you), scenario geometry
- `60` (on-screen) = `side_50` = 60 deg · cos(theta') = beta for theta = 90 deg · facts F31 · sources S26
- Review: Aberration: theta=90 deg -> cos theta' = beta = 0.5 -> 60 deg. Draft said '60 degrees ahead of you', which could read as 'moved by 60 deg'; reworded to '60 degrees from straight ahead'.

### b19 · verdict: ok
> Ahead, a star like our Sun now glows at 10,000 kelvin, blue-white. Behind you, the same kind of star looks like a dim red ember, at 3,300.

- `10,000` (narration) = `tfront_50` = 9997.4 K · Sun-like star ahead: T*D · facts F21, F31 · sources S18, S26
- `3,300` (narration) = `tback_50` = 3332.47 K · Sun-like star behind: T/D · facts F21, F31 · sources S18, S26
- Review: Sun T_eff 5772 K (NASA) x D_ahead 1.732 = 9,997 K -> 10,000; behind /1.732 = 3,333 -> 3,300. Visible flux behind drops (calc check).

### b20 · verdict: ok
> And the hydrogen? Each atom now carries 145 million electron volts. That's the same energy hospitals use to fire protons into tumors.

- `145` (narration) = `ep_50` = 145.151 MeV · (gamma-1) m_p c^2 · facts F03 · sources S3
- Review: (1.155-1) x 938.3 MeV = 145 MeV, inside the 70-250 MeV proton-therapy band (MD Anderson).

### b21 · verdict: fixed
> Those reach deep inside a human body. But a tank of water, less than 16 centimeters thick, stops them cold. Line the bow with it. Problem solved. For now.

- `16` (narration) = `range150_cm` = 15.76 cm · CSDA range 150 MeV in water · facts F16 · sources S14
- Review: Draft said 'straight through a human body': wrong, a 145 MeV proton stops after ~15 cm of water (PSTAR, 150 MeV -> 15.76 cm). Now 'reach deep inside'. 'less than 16 centimeters' holds since 145 < 150 MeV.

### b22 · verdict: ok
> The bill jumps to about 9.9 years of everything humanity uses. And Alpha Centauri is now 7.57 years away on your clock, 8.74 on Earth's.

- `9.9` (narration) = `kew_50` = 9.85772 yr · KE / world energy per year · facts F10, F01, F09 · sources S1, S10, S9
- `7.57` (narration) = `ts_ac_50` = 7.56906 yr · ship time = d/(gamma v) to ac · facts F05 · sources S5
- `8.74` (narration) = `te_ac_50` = 8.74 yr · Earth time = d/v to ac · facts F05 · sources S5
- Review: KE/world = 9.9 yr; Alpha Cen 8.74 yr Earth, 7.57 yr ship (d/v, d/(gamma v)).

### b23 · verdict: rhetoric
> 90%. This is the one I warned you about.

- `90` (narration) = `pct_90` = 90 % · scenario speed · facts - · sources -
- Review: Payoff of the b02 open loop begins.

### b24 · verdict: ok
> Each hydrogen atom now hits with 1.21 billion electron volts. That's more energy than its own mass. And these don't stop in a water tank.

- `1.21` (narration) = `epg_90` = 1.21427 GeV · proton KE in GeV · facts F03 · sources S3
- `1.21` (on-screen) = `epg_90` = 1.21427 GeV · proton KE in GeV · facts F03 · sources S3
- Review: (2.294-1) x 938.3 = 1.21 GeV > rest energy 938 MeV ('more energy than its own mass', mass meaning rest-mass energy). 'don't stop in a water tank' consistent with the 83 cm interaction length (b25).

### b25 · verdict: ok
> They cross about 83.3 centimeters of water, on average, before they even hit a nucleus. Then they shatter it into a spray of new particles. A thin shield doesn't stop the beam. It multiplies it.

- `83.3` (narration) = `lambda_int_cm` = 83.3 cm · nuclear interaction length water · facts F18 · sources S15
- Review: PDG: nuclear interaction length of water 83.3 g/cm2 = mean free path before an inelastic nuclear collision; hadronic collisions produce secondaries (showers). 'multiplies' is rhetoric for secondary production.

### b26 · verdict: ok
> Unshielded, that beam would give you a lethal dose of radiation in under half a second.

- `0.46` (on-screen) = `tlethal_90` = 0.464512 s · LD50/30 / dose rate · facts F19, F17 · sources S15, S16
- Review: Dose rate >= n v S_min = 1e6/m3 x 0.9c x 1.992 MeV cm2/g = 8.6 Gy/s (lower bound; showers add more). LD50/30 lower end 4 Sv (NRC) -> 0.46 s < 0.5 s. Unshielded is stated.

### b27 · verdict: rhetoric
> So what kills you isn't a planet, or a wall. It's the emptiest place in the universe. One atom in a space the size of a sugar cube, hit hard enough.

- Review: Interpretation of b26; sugar cube ~1 cm3 matches the 1 atom/cm3 density.

### b28 · verdict: rhetoric
> From here on, you need meters of shielding in front of you, and we'll assume you have it. Because the view is about to get very strange.

- Review: Scenario assumption (shielding assumed from here), consistent with b25.

### b29 · verdict: fixed
> A star that sits right beside you now appears just 26 degrees from straight ahead. Half of the entire sky is squeezed into a circle 52 degrees wide.

- `26` (narration) = `side_90` = 25.8419 deg · cos(theta') = beta for theta = 90 deg · facts F31 · sources S26
- `52` (narration) = `circle_90` = 51.6839 deg · half the sky fits in a cone of 2*acos(beta) · facts F31 · sources S26
- Review: cos theta' = 0.9 -> 25.8 deg -> 26; half sky = cone of 2 x 25.8 = 52 deg. Same wording fix as b18.

### b30 · verdict: ok
> And behind you, the sky goes black. Sunlike stars there are shifted to 1,300 kelvin, deep into the infrared, where your eyes can't follow.

- `1,300` (narration) = `tback_90` = 1324.19 K · Sun-like star behind: T/D · facts F21, F31 · sources S18, S26
- Review: 5772 K / D, D_behind = sqrt(0.1/1.9) = 0.229 -> 1,324 K -> 1,300 K; peak ~2.2 um (infrared).

### b31 · verdict: ok
> The bill: 82 years of world energy. But Alpha Centauri is now just 2.12 years away for you.

- `82` (narration) = `kew_90` = 82.4654 yr · KE / world energy per year · facts F10, F01, F09 · sources S1, S10, S9
- `2.12` (narration) = `ts_ac_90` = 2.11649 yr · ship time = d/(gamma v) to ac · facts F05 · sources S5
- Review: KE/world = 82 yr; ship time to Alpha Cen = 4.86/2.294 = 2.12 yr.

### b32 · verdict: rhetoric
> Add a nine. 99%.

- `99` (narration) = `pct_99` = 99 % · scenario speed · facts - · sources -
- Review: Scenario speed.

### b33 · verdict: ok
> Spend one year out here, then come home, and your friends are about seven years older. Every year aboard is 7.09 on Earth.

- `7.09` (narration) = `ey_99` = 7.08881 yr · Earth years per ship year = gamma · facts - · sources -
- Review: gamma(0.99)=7.09 -> 'about seven years older' (comparison re-derived).

### b34 · verdict: ok
> Out the window, half of the universe now fits in a circle 16 degrees across. About 31 full Moons, side by side.

- `16` (narration) = `circle_99` = 16.2192 deg · half the sky fits in a cone of 2*acos(beta) · facts F31 · sources S26
- `31` (narration) = `moons_99` = 30.796 moons · circle / Moon diameter · facts F31, F23 · sources S19, S26
- `31` (on-screen) = `moons_99` = 30.796 moons · circle / Moon diameter · facts F31, F23 · sources S19, S26
- Review: 2 acos(0.99) = 16.2 deg; Moon 1896 arcsec = 0.527 deg (NASA) -> 30.8 -> 31 Moons.

### b35 · verdict: ok
> And every square meter of your bow absorbs 272 kilowatts from the gas you're hitting. About 200 times the sunlight that warms the Earth.

- `272` (narration) = `heatkw_99` = 271.661 kW/m^2 · heat flux in kW/m^2 · facts F08, F01, F03, F04 · sources S1, S3, S4, S8
- `200` (narration) = `suns_99` = 199.604 x · heat / solar constant · facts F22 · sources S18
- Review: P = n v (gamma-1) m_p c^2 = 1e6 x 0.99c x 5.71 GeV = 272 kW/m2; / 1361 W/m2 (NASA solar constant) = 200.

### b36 · verdict: ok
> Alpha Centauri? 7.5 months away. The center of the galaxy is still 3,700 years. Not yet.

- `7.5` (narration) = `tsm_ac_99` = 7.4723 months · ship time in months · facts F05 · sources S5
- `3,700` (narration) = `ts_gc_99` = 3704.8 yr · ship time = d/(gamma v) to gc · facts F06 · sources S6
- Review: Ship time to Alpha Cen 0.623 yr = 7.5 months; galactic centre 26,000 ly / 0.99c / 7.09 = 3,700 yr.

### b37 · verdict: ok
> 99.9%. You'd think the stars ahead would only get brighter. They don't.

- `99.9` (narration) = `pct_999` = 99.9 % · scenario speed · facts - · sources -
- Review: Reversal claim checked in calc: visible-band flux of a Sun-like star dead ahead at 99.9% is 0.58x its rest value (fade_999 < 1).

### b38 · verdict: ok
> A Sun-like star dead ahead now looks 260,000 kelvin. Most of its light has been pushed into the ultraviolet, past what your eyes can see, so it fades.

- `260,000` (narration) = `tfront_999` = 258067 K · Sun-like star ahead: T*D · facts F21, F31 · sources S18, S26
- Review: 5772 K x D 44.7 = 258,000 K -> 260,000; Wien peak ~11 nm (UV); visible ratio 0.58 (fades).

### b39 · verdict: ok
> Each year aboard is now 22.4 years on Earth. And Alpha Centauri is 71.4 days away.

- `22.4` (narration) = `ey_999` = 22.3663 yr · Earth years per ship year = gamma · facts - · sources -
- `71.4` (narration) = `tsd_ac_999` = 71.4353 days · ship time in days · facts F05, F02 · sources S2, S5
- Review: gamma 22.4; ship time to Alpha Cen 0.196 yr = 71.4 days.

### b40 · verdict: ok
> And here's the bill for that one extra nine. About 1,400 years of all the energy humanity uses. Every nine costs more than all the nines before it.

- `1,400` (narration) = `kew_999` = 1361.49 yr · KE / world energy per year · facts F10, F01, F09 · sources S1, S10, S9
- Review: KE = 21.4 x 420 t x c^2 = 8.06e23 J = 1,360 yr -> 'about 1,400'; exceeds the sum of all previous levels (480 yr): comparison re-derived.

### b41 · verdict: rhetoric
> 99.99%. Now look straight ahead.

- `99.99` (narration) = `pct_9999` = 99.99 % · scenario speed · facts - · sources -
- Review: Scenario speed.

### b42 · verdict: ok
> Science fiction promised a starbow here: a rainbow ring of stars around your nose. But in 1979, two physicists ran the numbers properly, and the ring vanished. This simulation agrees. Every star piles up dead ahead, bluest and densest at the center.

- `1979,` (narration): structural number - publication year of the cited starbow paper (McKinley & Doherty, S28)
- Review: McKinley & Doherty, Am. J. Phys. 47, 309 (1979): a properly computed starfield shows no 'starbow'; our render agrees. Brightness/blueness rises toward the centre because D is largest there.

### b43 · verdict: ok
> And something else lights up. The faint afterglow of the Big Bang, normally 2.725 kelvin, is heated dead ahead to 385 kelvin. Hotter than boiling water. The darkness in front of you is warm.

- `2.725` (narration) = `cmb_t` = 2.725 K · CMB temperature · facts F20 · sources S17
- `385` (narration) = `cmbf_9999` = 385.364 K · CMB dead ahead: T*D · facts F20, F31 · sources S17, S26
- Review: CMB 2.725 K (NASA WMAP) x D_ahead 141.4 = 385 K > 373 K (boiling water). Blackbody stays blackbody at T x D.

### b44 · verdict: ok
> A single speck of dust, one millionth of a gram, would now hit you like 1.5 tonnes of TNT.

- `1.5` (narration) = `dust_t_9999` = 1.49748 t TNT · 1 ug at 99.99% · facts F30, F29 · sources S25
- `1.5` (on-screen) = `dust_t_9999` = 1.49748 t TNT · 1 ug at 99.99% · facts F30, F29 · sources S25
- Review: Hypothetical 1 ug grain (stated): 69.7 x 1e-9 kg x c^2 = 6.3e9 J / 4.184e9 J/t = 1.5 t TNT.

### b45 · verdict: ok
> Each year aboard is 70.7 on Earth. Alpha Centauri is 22.6 days away. The center of the galaxy, 368 years. Closer. Not close enough.

- `70.7` (narration) = `ey_9999` = 70.7124 yr · Earth years per ship year = gamma · facts - · sources -
- `22.6` (narration) = `tsd_ac_9999` = 22.5746 days · ship time in days · facts F05, F02 · sources S2, S5
- `368` (narration) = `ts_gc_9999` = 367.723 yr · ship time = d/(gamma v) to gc · facts F06 · sources S6
- Review: gamma 70.7; Alpha Cen 22.6 days ship time; galactic centre 368 yr ship time.

### b46 · verdict: rhetoric
> Let's skip a nine. 99.9999%. This is the sky from the beginning of the video.

- `99.9999` (narration) = `pct_999999` = 99.9999 % · scenario speed · facts - · sources -
- Review: Callback to the hook sky (same level).

### b47 · verdict: ok
> Half of the universe fits inside a circle smaller than the Moon, just 0.16 degrees wide. And at its center, the Big Bang's afterglow is blueshifted to 3,850 kelvin. Hot enough to glow orange, right where you're heading.

- `0.16` (narration) = `circle_999999` = 0.162057 deg · half the sky fits in a cone of 2*acos(beta) · facts F31 · sources S26
- `3,850` (narration) = `cmbf_999999` = 3853.73 K · CMB dead ahead: T*D · facts F20, F31 · sources S17, S26
- Review: 2 acos(0.999999) = 0.162 deg < Moon 0.527 deg; CMB x 1414 = 3,854 K -> 3,850 K, a visibly orange blackbody.

### b48 · verdict: ok
> Your clock: one year. Earth's: 707.

- `707` (narration) = `ey_999999` = 707.107 yr · Earth years per ship year = gamma · facts - · sources -
- `1` (on-screen): structural number - 'one year', '1 g', '1 atom' - scenario units and counts
- `707` (on-screen) = `ey_999999` = 707.107 yr · Earth years per ship year = gamma · facts - · sources -
- Review: gamma(0.999999) = 707.

### b49 · verdict: ok
> And one hydrogen atom now hits with 663 billion electron volts. CERN compares that kind of energy to a flying mosquito. You're taking two-thirds of a mosquito, packed into one proton, trillions of times a second, on every square meter.

- `663` (narration) = `epg_999999` = 662.52 GeV · proton KE in GeV · facts F03 · sources S3
- Review: 706 x 938.3 MeV = 663 GeV = 0.66 TeV; CERN: 1 TeV ~ kinetic energy of a flying mosquito. Flux n v = 3e14 per m2 per s ('trillions').

### b50 · verdict: ok
> Your bow is soaking up 32 megawatts on every square meter. And a speck of dust now hits like 15 tonnes of TNT.

- `32` (narration) = `heatmw_999999` = 31.8222 MW/m^2 · heat flux in MW/m^2 · facts F08, F01, F03, F04 · sources S1, S3, S4, S8
- `15` (narration) = `dust_t_999999` = 15.1677 t TNT · / 4.184e9 J per tonne · facts F30, F29 · sources S25
- Review: n v (gamma-1) m_p c^2 = 3.18e7 W/m2 -> 32 MW/m2; 1 ug dust: 706 x 1e-9 x c^2 = 6.3e10 J = 15 t TNT.

### b51 · verdict: ok
> The bill: about 45,000 years of humanity's total energy, for one ship, at one speed.

- `45,000` (narration) = `kew_999999` = 44994 yr · KE / world energy per year · facts F10, F01, F09 · sources S1, S10, S9
- Review: KE = 706 x 420 t x c^2 = 2.66e25 J / 592 EJ = 44,900 -> 'about 45,000 years'.

### b52 · verdict: ok
> But here's what you get for it. The center of the Milky Way, 26,000 light-years away, is now 36.8 years away on your clock. You could get there in one lifetime.

- `26,000` (narration) = `d_gc` = 26000 ly · distance galactic center · facts F06 · sources S6
- `36.8` (narration) = `ts_gc_999999` = 36.7696 yr · ship time = d/(gamma v) to gc · facts F06 · sources S6
- Review: 26,000 ly (NASA) / 0.999999c / 707 = 36.8 yr ship time: within a human lifetime.

### b53 · verdict: ok
> When you arrive, Earth's calendar has moved on by about 26,000 years. Remember that number. It's about to look small.

- `26,000` (narration) = `te_gc_999999` = 26000 yr · Earth time = d/v to gc · facts F06 · sources S6
- Review: Earth time = d/v = 26,000 yr. 'about to look small' sets up b60.

### b54 · verdict: ok
> Real ships can't just jump to a speed. So for the last trip, picture an engine that pushes at exactly 1 g, Earth's gravity, the whole way. On board, you'd feel at home.

- `1` (narration): structural number - 'one year', '1 g', '1 atom' - scenario units and counts
- Review: Constant proper acceleration of 1 g (9.80665 m/s2) is felt as Earth gravity.

### b55 · verdict: ok
> Speed up for half the trip, flip around, brake for the other half. On that ship, the center of the galaxy is 19.8 years away.

- `19.8` (narration) = `g1_ts_gc` = 19.7574 yr · 2 (c/a) acosh(1 + a d / 2c^2) · facts F06, F24, F32 · sources S20, S27, S6
- Review: Relativistic rocket (Gibbs & Baez), accelerate to midpoint then decelerate: tau = 2(c/g) acosh(1 + g d / 2c^2) = 19.8 yr for 26,000 ly.

### b56 · verdict: ok
> And the Andromeda Galaxy, 2.5 million light-years away, takes just 28.6 years on your clock.

- `2.5` (narration) = `g1_te_m31_my` = 2.5 Myr · Earth time to M31 in million years · facts F07, F24, F32 · sources S20, S27, S7
- `28.6` (narration) = `g1_ts_m31` = 28.6034 yr · 2 (c/a) acosh(1 + a d / 2c^2) · facts F07, F24, F32 · sources S20, S27, S7
- Review: Same formula for 2.5 million ly: tau = 28.6 yr.

### b57 · verdict: ok
> At the halfway point, you'd be moving at 99.99999999997% of the speed of light. 12 nines. Faster than any proton in the Large Hadron Collider.

- `99.99999999997` (narration) = `m31_pct` = 100 % · peak beta at midpoint (1 - 1/(2 gamma^2)) · facts F07, F24, F32 · sources S20, S27, S7
- `12` (narration) = `m31_nines` = 12.5225 nines · number of nines in peak speed · facts F07, F24, F32 · sources S20, S27, S7
- `12` (on-screen) = `m31_nines` = 12.5225 nines · number of nines in peak speed · facts F07, F24, F32 · sources S20, S27, S7
- Review: gamma_max = 1 + g d / 2c^2 = 1.29e6 -> 1 - beta = 3.0e-13 -> 99.99999999997%, 12 nines; LHC 6.8 TeV protons gamma 7,250 -> 99.999999%; so faster.

### b58 · verdict: ok
> Could anyone build that engine? Not with anything we know how to make. The energy alone is about 82 million years of humanity's total supply. But relativity itself doesn't say no.

- `82` (narration) = `kew_m31_my` = 82.224 Myr · peak KE / world energy, million years · facts F10, F09 · sources S10, S9
- Review: (gamma_max - 1) M c^2 / world = 82 million years (minimum, perfect engine). 'Not with anything we know how to make' is an honest limit; relativity allows it.

### b59 · verdict: ok
> So here's your life. You leave at 25. You fly to Andromeda, turn around, and fly home. On your clock, 57 years. You step out at 82.

- `25` (narration) = `age_leave` = 25 yr · scenario: you leave at 25 · facts - · sources -
- `57` (narration) = `rt_ship_m31` = 57.2068 yr · round trip ship time · facts F07, F24, F32 · sources S20, S27, S7
- `82` (narration) = `age_return` = 82.2068 yr · 25 + round-trip ship time · facts F07, F24, F32 · sources S20, S27, S7
- Review: Round trip = 2 x 28.6 = 57 yr ship time; 25 + 57 = 82 (leaving age is a scenario choice).

### b60 · verdict: ok
> On Earth, 5 million years have passed.

- `5` (narration) = `rt_earth_m31_my` = 5 Myr · round trip Earth time (million years) · facts F07, F24, F32 · sources S20, S27, S7
- `5` (on-screen) = `rt_earth_m31_my` = 5 Myr · round trip Earth time (million years) · facts F07, F24, F32 · sources S20, S27, S7
- Review: Earth time round trip = 2 x 2(c/g) sinh(g tau_half/c) = 5.0 million yr.

### b61 · verdict: ok
> For scale: the oldest fossil of our own genus, Homo, is about 2.8 million years old. You'd come home further into the future than the first humans are in the past.

- `2.8` (narration) = `homo_my` = 2.8 Myr · oldest Homo fossil · facts F25 · sources S21
- Review: Ledi-Geraru jaw ~2.8 million years (NPR/Science 2015) < 5 million: comparison re-derived.

### b62 · verdict: rhetoric
> You could cross to another galaxy in one lifetime. You just can't come back to the world you left.

- Review: Summary of b56-b61.

### b63 · verdict: rhetoric
> If you'd rather fall than fly, the next trip goes straight down. What If You Fell Into Jupiter? This was The If Engine. Run the impossible. Do the math.

- Review: Next-video setup and tagline.

### s1b01 · verdict: rhetoric
> Movies show streaks. Science fiction promised a rainbow ring. This is what real physics shows at 99.9999% of light speed.

- `99.9999` (narration) = `pct_999999` = 99.9999 % · scenario speed · facts - · sources -
- Review: Short 1 hook. 'Movies show streaks' is a description of common depictions; the claim about real physics is checked in s1b05.

### s1b02 · verdict: ok
> Start at rest. Every star is where you'd expect it.

- Review: At rest the sky is the catalogue as seen from Earth (no aberration).

### s1b03 · verdict: ok
> At 90%, the sky slides toward your nose. Behind you, it goes dark.

- `90` (narration) = `pct_90` = 90 % · scenario speed · facts - · sources -
- Review: At 90% half the sky is within 26 deg of ahead; behind, D=0.23 shifts stars into infrared (see b29, b30). Shortened for length.

### s1b04 · verdict: ok
> At 99.99%, half of the universe fits in a circle just 1.6 degrees wide.

- `99.99` (narration) = `pct_9999` = 99.99 % · scenario speed · facts - · sources -
- `1.6` (narration) = `circle_9999` = 1.62058 deg · half the sky fits in a cone of 2*acos(beta) · facts F31 · sources S26
- Review: 2 acos(0.9999) = 1.62 deg -> 1.6.

### s1b05 · verdict: ok
> No rainbow ring. That old starbow idea fails the math. Every star piles into one patch ahead, blue-white at the center.

- Review: Same source and render as b42 (McKinley & Doherty 1979). Centre is blue-white because D is largest there. Shortened for length.

### s1b06 · verdict: ok
> And dead center, the Big Bang's afterglow glows orange. That's the sky you were looking at from the very first second.

- Review: At 99.9999% the CMB ahead is 3,850 K (b47): an orange glow. Loops to the first frame.

### s2b01 · verdict: rhetoric
> You age one year. Earth ages 707. And your watch never skips a second. How?

- `707` (narration) = `ey_999999` = 707.107 yr · Earth years per ship year = gamma · facts - · sources -
- Review: Short 2 hook; 707 = gamma(0.999999). 'Watch never skips' = proper time runs normally for you.

### s2b02 · verdict: ok
> At 99.9999% of the speed of light, time itself runs slower for you. Not your watch. Time.

- `99.9999` (narration) = `pct_999999` = 99.9999 % · scenario speed · facts - · sources -
- Review: Time dilation relative to Earth's frame; your own clock runs normally.

### s2b03 · verdict: ok
> At 90%, one of your years is 2.29 on Earth. At 99%, it's 7.09.

- `90` (narration) = `pct_90` = 90 % · scenario speed · facts - · sources -
- `2.29` (narration) = `ey_90` = 2.29416 yr · Earth years per ship year = gamma · facts - · sources -
- `99` (narration) = `pct_99` = 99 % · scenario speed · facts - · sources -
- `7.09` (narration) = `ey_99` = 7.08881 yr · Earth years per ship year = gamma · facts - · sources -
- Review: gamma(0.9)=2.29, gamma(0.99)=7.09.

### s2b04 · verdict: ok
> Push to 99.9999%, and the center of our galaxy is 36.8 years away on your clock. You could make it.

- `99.9999` (narration) = `pct_999999` = 99.9999 % · scenario speed · facts - · sources -
- `36.8` (narration) = `ts_gc_999999` = 36.7696 yr · ship time = d/(gamma v) to gc · facts F06 · sources S6
- Review: Ship time 36.8 yr to the galactic centre at 99.9999% (b52).

### s2b05 · verdict: ok
> But when you land, Earth's calendar has jumped about 26,000 years.

- `26,000` (narration) = `te_gc_999999` = 26000 yr · Earth time = d/v to gc · facts F06 · sources S6
- Review: Earth time 26,000 yr (b53).

### s2b06 · verdict: rhetoric
> So, would you take the deal? You age one year, and Earth ages 707.

- `707` (narration) = `ey_999999` = 707.107 yr · Earth years per ship year = gamma · facts - · sources -
- Review: Loop back to the hook line.

### s3b01 · verdict: rhetoric
> At 99.9999% of light speed, empty space turns deadly. How does one hydrogen atom hit this hard?

- `99.9999` (narration) = `pct_999999` = 99.9999 % · scenario speed · facts - · sources -
- Review: Short 3 hook; the answer is in s3b02 and s3b05-06.

### s3b02 · verdict: ok
> Each one carries two-thirds of the energy of a flying mosquito. Packed into a single proton.

- Review: 663 GeV = 0.66 TeV vs CERN's 1 TeV ~ flying mosquito: two-thirds, in one proton.

### s3b04 · verdict: ok
> At 50%, each atom hits like a hospital's proton therapy beam.

- `50` (narration) = `pct_50` = 50 % · scenario speed · facts - · sources -
- Review: 145 MeV at 50%, inside the 70-250 MeV band hospitals use for proton therapy (MD Anderson).

### s3b05 · verdict: ok
> At 90%, unshielded, you'd take a lethal dose of radiation in under half a second.

- `90` (narration) = `pct_90` = 90 % · scenario speed · facts - · sources -
- Review: Lower-bound dose 8.6 Gy/s; LD50/30 4 Sv -> 0.46 s (b26).

### s3b06 · verdict: ok
> At 99.9999%, every square meter of your ship absorbs 32 megawatts, and a speck of dust hits like 15 tonnes of TNT.

- `99.9999` (narration) = `pct_999999` = 99.9999 % · scenario speed · facts - · sources -
- `32` (narration) = `heatmw_999999` = 31.8222 MW/m^2 · heat flux in MW/m^2 · facts F08, F01, F03, F04 · sources S1, S3, S4, S8
- `15` (narration) = `dust_t_999999` = 15.1677 t TNT · / 4.184e9 J per tonne · facts F30, F29 · sources S25
- Review: 32 MW/m2 and 15 t TNT for a 1 ug grain (b50).

### s3b07 · verdict: rhetoric
> The emptiest place in the universe, turned deadly.

- Review: Closing line, loops to the hook ('empty space turns deadly').

## Sources

- S1: NIST CODATA, Speed of light in vacuum - https://physics.nist.gov/cgi-bin/cuu/Value?c
- S2: IAU, Measuring the Universe: the light-year (Julian year of 365.25 days) - https://www.iau.org/public/themes/measuring/
- S3: NIST CODATA, Proton mass energy equivalent in MeV - https://physics.nist.gov/cgi-bin/cuu/Value?mpc2mev
- S4: NIST CODATA, Electron volt-joule relationship - https://physics.nist.gov/cgi-bin/cuu/Value?evj
- S5: NASA Science, Sun: Facts (nearest stars: Alpha Centauri A and B at 4.37 light-years) - https://science.nasa.gov/sun/facts/
- S6: NASA Science, Galactic Center (Chandra, Hubble, Spitzer): 26,000 light-years - https://science.nasa.gov/asset/webb/galactic-center-chandra-hubble-spitzer/
- S7: NASA Science, Hubble Messier Catalog: Messier 31 (2.5 million light-years) - https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-31/
- S8: NASA Genesis mission, Interstellar Clouds fact sheet (typical density about one particle per cm3) - https://solarsystem.nasa.gov/genesismission/educate/kitchen/resource/factsheets/Interstellarclouds.pdf
- S9: Energy Institute, Statistical Review of World Energy 2025 (2024 primary energy 592 EJ) - https://www.energyinst.org/statistical-review
- S10: NASA, Space Station Facts and Figures (mass 419,725 kg) - https://www.nasa.gov/international-space-station/space-station-facts-and-figures/
- S11: CERN, Facts and figures about the LHC (6.8 TeV per proton) - https://home.cern/resources/faqs/facts-and-figures-about-lhc
- S12: CERN LHC Machine Outreach, LHC Glossary (1 TeV, energy of a flying mosquito) - https://lhc-machine-outreach.web.cern.ch/lhc_glossary.htm
- S13: MD Anderson Cancer Center, What is proton therapy (70 to 250 million electron volts) - https://www.mdanderson.org/patients-family/diagnosis-treatment/care-centers-clinics/proton-therapy-center/what-is-proton-therapy.html
- S14: NIST PSTAR, Stopping power and range tables for protons (liquid water) - https://physics.nist.gov/PhysRefData/Star/Text/PSTAR.html
- S15: Particle Data Group, Atomic and nuclear properties: water (liquid) - https://pdg.lbl.gov/2010/AtomicNuclearProperties/HTML_PAGES/276.html
- S16: U.S. NRC, Glossary: Lethal dose (LD), LD50/30 of 4 to 5 sieverts - https://www.nrc.gov/reading-rm/basic-ref/glossary/lethal-dose-ld.html
- S17: NASA WMAP, Tests of Big Bang: the CMB (2.725 K) - https://map.gsfc.nasa.gov/universe/bb_cosmo_fluct.html
- S18: NASA NSSDC, Sun Fact Sheet (effective temperature 5772 K, solar constant 1361 W/m2) - https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html
- S19: NASA NSSDC, Moon Fact Sheet (apparent diameter 1896 arcsec) - https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
- S20: NIST CODATA, Standard acceleration of gravity - https://physics.nist.gov/cgi-bin/cuu/Value?gn
- S21: NPR, Jaw fossil in Ethiopia likely oldest ever found in human line (2.8 million years) - https://www.npr.org/2015/03/05/390717001/jaw-fossil-in-ethiopia-likely-oldest-ever-found-in-human-line
- S22: Ballesteros, New insights into black bodies, EPL 97 (2012), arXiv:1201.1809 - https://arxiv.org/abs/1201.1809
- S23: Astronexus, HYG star database v4.0 (CC BY-SA 4.0) - https://github.com/astronexus/HYG-Database
- S24: NASA Science, Parker Solar Probe (about 430,000 mph) - https://science.nasa.gov/mission/parker-solar-probe/
- S25: NIST, Special Publication 811, Guide for the Use of the SI (TNT equivalent, unit conversions) - https://www.nist.gov/pml/special-publication-811
- S26: Einstein, On the Electrodynamics of Moving Bodies (1905), section 7: aberration and Doppler - https://www.fourmilab.ch/etexts/einstein/specrel/www/
- S28: McKinley and Doherty, In search of the starbow: the appearance of the starfield from a relativistic spaceship, Am. J. Phys. 47, 309 (1979) - https://doi.org/10.1119/1.11834
- S29: Optics and Photonics News, A Brief History of the Starbow (Optica) - https://www.optica-opn.org/home/articles/volume_20/issue_4/departments/light_touch/a_brief_history_of_the_starbow
- S27: Gibbs and Baez, The Relativistic Rocket (UC Riverside Physics FAQ) - https://math.ucr.edu/home/baez/physics/Relativity/SR/Rocket/rocket.html
