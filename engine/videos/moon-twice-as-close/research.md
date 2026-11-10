# Research: What If the Moon Was Twice as Close?

Series: Planet Breakers · Researched 2026-11-09 (validation run of engine/PRODUCER.md)

## Scenario definition

The Moon is placed on a circular orbit at half its mean distance (384,400 km → 192,200 km), in the
same plane, moving at the orbital speed that distance requires. Nothing else changes (masses, Earth's
rotation, the Sun). We look at the sky, eclipses, ocean tides (equilibrium theory), whether the Moon
survives (Roche limit), and how fast tidal braking would lengthen the day.

Out of scope (not claimed): real coastal tide heights (resonance needs ocean models), earthquake or
volcano triggering, climate effects, how the move would physically be done.

## Facts

| ID | Fact | Value | Unit | Sources |
|----|------|-------|------|---------|
| F01 | Moon mean distance (semimajor axis) | 384400 | km | S1 |
| F02 | Moon mass | 7.346e22 | kg | S1 |
| F03 | Moon volumetric mean radius | 1737.4 | km | S1 |
| F04 | Moon sidereal orbit period | 27.3217 | days | S1 |
| F05 | Moon mean density | 3344 | kg/m^3 | S1 |
| F06 | Earth mass | 5.9722e24 | kg | S2 |
| F07 | Earth volumetric mean radius | 6371.0 | km | S2 |
| F08 | Earth mean density | 5514 | kg/m^3 | S2 |
| F09 | Newtonian constant of gravitation G | 6.67430e-11 | m^3/(kg s^2) | S3 |
| F10 | Standard gravity g | 9.80665 | m/s^2 | S3 |
| F11 | Astronomical unit | 149597870.7 | km | S4 |
| F12 | Nominal solar radius | 695700 | km | S5 |
| F13 | Nominal solar luminosity | 3.828e26 | W | S5 |
| F14 | Sun mass | 1.9885e30 | kg | S6 |
| F15 | Sun's tide-generating force is about half (46%) of the Moon's | 0.46 | ratio | S7, S8 |
| F16 | Day-length increase predicted from tidal friction | 2.3 | ms/century | S9 |
| F17 | Fluid Roche limit coefficient (Roche 1849) | 2.44 | - | S10 |
| F18 | Tropical year | 365.2422 | days | S11 |
| F19 | Coastal tides can be strongly amplified by basin resonance (e.g. Bay of Fundy) | qualitative | - | S7 |
| F20 | Assumed adult body mass (round number) | 70 | kg | S12 |
| F21 | Earth sidereal rotation period | 23.9345 | h | S2 |
| F22 | The Moon recedes from Earth by about 3.8 cm per year (lunar laser ranging) | 3.8 | cm/yr | S13 |

## Physics models used

- Kepler's third law: T ∝ d^1.5; circular orbital speed v = √(G(M+m)/d).
- Angular diameter θ = 2·atan(R/(d − R_E)) for an observer under the Moon; area ∝ θ²; with the same
  albedo and sunlight, full-Moon brightness ∝ apparent area.
- Tidal acceleration ∝ M/d³. Equilibrium tide (sub-lunar bulge height) h = (3/2)(M/M_E)(R_E/d)³ R_E · (2/3)
  at the sub-lunar point; full range between bulge and trough is 1.5 × that.
- Tidal braking torque ∝ M² / d⁶ (same Earth response), so the day-lengthening rate scales the same way.
- Orbital energy E = −G M_E M / (2d); moving inward changes E by G M_E M (1/(2d₂) − 1/(2d₁)).
- Fluid Roche limit d_R = 2.44 R_E (ρ_E/ρ_M)^(1/3).
- Synodic month: 1/P_syn = 1/P_sid − 1/year.

## Sources

- S1: NASA NSSDC, Moon Fact Sheet. https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
- S2: NASA NSSDC, Earth Fact Sheet. https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html
- S3: NIST CODATA 2018, fundamental constants. https://physics.nist.gov/cuu/Constants/
- S4: IAU 2012 Resolution B2, re-definition of the astronomical unit. https://www.iau.org/static/resolutions/IAU2012_English.pdf
- S5: IAU 2015 Resolution B3, nominal solar and planetary conversion constants. https://arxiv.org/abs/1510.07674
- S6: NASA NSSDC, Sun Fact Sheet. https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html
- S7: NOAA National Ocean Service, Tides and Water Levels: what causes tides. https://oceanservice.noaa.gov/education/tutorial_tides/tides02_cause.html
- S8: Ocean Motion (NASA-funded education site), Tide-generating forces background. https://www.oceanmotion.org/html/background/tides-forces.htm
- S9: Stephenson, Morrison & Hohenkerk (2016), Measurement of the Earth's rotation: 720 BC to AD 2015, Proc. R. Soc. A 472. https://pmc.ncbi.nlm.nih.gov/articles/PMC5247521/
- S10: Encyclopaedia Britannica, Roche limit. https://www.britannica.com/science/Roche-limit
- S11: NASA/IERS, tropical year (365.2422 days). https://www.iers.org/IERS/EN/Science/EarthRotation/EarthRotation.html
- S13: NASA Science, Moon: Lunar laser ranging shows the Moon moving away ~3.8 cm/yr. https://science.nasa.gov/moon/facts/
- S12: ICRP Publication 89, reference adult. https://www.icrp.org/publication.asp?id=ICRP%20Publication%2089

## Research notes

- Many pages quote the full Moon's magnitude as −12.7 to −12.9; we avoid absolute magnitudes and only
  use the brightness RATIO (4×) and its magnitude difference (2.5·log10 4 ≈ 1.5), which are model results.
- The day-length figure uses the tidal-friction prediction (2.3 ms/century), not the observed 1.8,
  because the scenario only changes the tidal part.
- Web access note: primary hosts were not directly fetchable from the build sandbox; values were
  confirmed through search results quoting the pages above.
