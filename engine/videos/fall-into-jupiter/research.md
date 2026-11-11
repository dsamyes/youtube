# Research: What If You Fell Into Jupiter?

Series: Fall Into… · Researched 2026-11-11

## Scenario definition (what we are and are not claiming)

You start at rest, one million kilometres from Jupiter's centre (a scenario choice), and fall straight
in. Gravity is Newtonian with Jupiter's GM (S1); Jupiter's rotation and its moons are ignored for the
fall, except that we state the spin speed of the cloud tops as a range the entry speed can change by.
"Depth" is measured below the 1-bar level (S1 defines the radius at 1 bar).

- Arrival speed and fall time: radial free fall from rest at r0 to the 1-bar radius R (energy
  conservation and the standard radial-infall time formula). Falling from very far away you arrive at
  the escape velocity, 59.5 km/s (S1).
- Entry: an unprotected human cannot survive it (heat and deceleration). We compare with the Galileo
  probe, which entered with a heat shield (S3, S5), and with the highest deceleration a person has
  survived on purpose (S10). We do NOT model a human entry; after the entry beat the video uses a
  stated device: an indestructible, human-sized pod with the density of a human body (about the density
  of water, S11), mass 80 kg, frontal area 0.7 m², drag coefficient 1.0 (scenario choices).
- Upper atmosphere (to about 23 bar): ideal-gas dry adiabat of an H2/He mixture starting at 165 K and
  1 bar (S1): T = 165 K × (P / 1 bar)^(2/7), lapse rate g/cp with cp = 7/2 R / μ (μ = 2.22 g/mol, S1).
  This is a textbook approximation; it reproduces the Galileo probe's "room temperature" level and
  its final readings to within roughly 10% (S3, S5), so values are quoted with "about".
- Cloud layers: pressures from S6 (ammonia ice condensation level 0.7 bar; main deck 2-3 bar,
  ammonium hydrosulfide) and S8/S7 (water clouds near 5 bar). The 2025 study (S6) argues the visible
  deck is mostly ammonium hydrosulfide with smog; we say "white ammonia ice clouds" only for the
  high, bright clouds (S6, S9) and say "rust-coloured ammonium hydrosulfide" for the main deck.
- Deep interior: Jupiter is modelled as an index-1 polytrope (P = Kρ², ρ = ρc sin(kr)/(kr)), a
  good leading-order approximation for Jupiter (S12), with mean radius and mass from S1. It is used
  for ONE claim: the depth where the surrounding fluid is as dense as you are (where the pod stops
  sinking). Model values are "about". Below about 1,000 km the ideal gas law fails; the sinking-time
  estimate uses the larger of the adiabat density and the polytrope density, a crude bridge (stated).
- Terminal speed: v = sqrt(2 m g / (ρ Cd A)) with local density; gravity taken as g at 1 bar (S1)
  in the upper atmosphere and the polytrope's g(r) deeper down.
- Metallic hydrogen: NASA says perhaps halfway to the centre (S2); we use that wording. The dilute,
  fuzzy core (S2) is qualitative.
- Out of scope (not claimed): radiation belts, chemistry of the pod, exact temperatures in the deep
  interior, the real (non-polytrope) density profile, rotation-driven flows, and where exactly the
  metallic transition lies.

## Facts

Parsed by `pipeline/research.py`. Columns: ID | fact | value | unit | source IDs.

| ID | Fact | Value | Unit | Sources |
|----|------|-------|------|---------|
| F01 | Jupiter mass | 1.89813e27 | kg | S1 |
| F02 | Jupiter GM | 126.687e6 | km^3/s^2 | S1 |
| F03 | Jupiter equatorial radius at the 1 bar level | 71492 | km | S1 |
| F04 | Jupiter volumetric mean radius | 69911 | km | S1 |
| F05 | Jupiter mean density | 1326 | kg/m^3 | S1 |
| F06 | Jupiter gravity (mean, 1 bar) | 25.92 | m/s^2 | S1 |
| F07 | Jupiter escape velocity | 59.5 | km/s | S1 |
| F08 | Jupiter sidereal rotation period | 9.925 | h | S1 |
| F09 | Temperature at 1 bar | 165 | K | S1 |
| F10 | Atmospheric density at 1 bar | 0.16 | kg/m^3 | S1 |
| F11 | Mean molecular weight of the atmosphere | 2.22 | g/mol | S1 |
| F12 | Molecular hydrogen fraction by volume | 89.8 | % | S1 |
| F13 | Helium fraction by volume | 10.2 | % | S1 |
| F14 | Wind speeds up to (latitudes below 30 degrees) | 150 | m/s | S1 |
| F15 | Fastest prevailing winds at the equator | 539 | km/h | S2 |
| F16 | Earth volumetric mean radius | 6371 | km | S1 |
| F17 | Galileo probe entry speed | 106000 | mph | S3 |
| F18 | Galileo probe peak deceleration (more than) | 200 | g | S3 |
| F19 | Galileo probe heat shield temperature (as hot as the Sun's surface) | 16000 | °F | S3 |
| F20 | Galileo probe data return during descent | 58 | min | S3 |
| F21 | Galileo probe descent distance while returning data | 97 | miles | S3 |
| F22 | Galileo probe: entry 5:04 p.m., room temperature reached 5:34 p.m. EST | 30 | min | S5 |
| F23 | Galileo probe completely vaporized by 3:00 a.m., entry 5:04 p.m. (hours later) | 10 | h | S5 |
| F24 | Three cloud layers span about | 71 | km | S2 |
| F25 | Great Red Spot extends below the cloud tops about | 500 | km | S2 |
| F26 | Jet streams reach depths of about | 3200 | km | S2 |
| F27 | Metallic hydrogen at depths perhaps this fraction of the way to the centre | 0.5 | - | S2 |
| F28 | Expected ammonia ice condensation level | 0.7 | bar | S6 |
| F29 | Main reflecting cloud deck (ammonium hydrosulfide + smog), upper end of 2-3 bar | 2 | bar | S6 |
| F30 | Base of the water cloud | 5 | bar | S8, S7 |
| F31 | Shallow-lightning altitude temperature | -88 | °C | S9 |
| F32 | Highest deceleration survived voluntarily (John Stapp, 1954) | 46.2 | g | S10 |
| F33 | Average density of a human body (close to water) | 1000 | kg/m^3 | S11 |
| F34 | Index-1 polytrope is a good leading-order model of Jupiter's interior | qualitative | - | S12 |
| F35 | Energy of 1 kg of TNT | 4.184e6 | J/kg | S13 |
| F36 | Molar gas constant | 8.314462618 | J/(mol K) | S14 |
| F37 | Newtonian constant of gravitation | 6.67430e-11 | m^3/(kg s^2) | S14 |
| F38 | Jupiter's core is dilute ("fuzzy"), no clear edge to the metallic hydrogen | qualitative | - | S2 |
| F39 | Deep in the atmosphere hydrogen is compressed into a liquid: the largest ocean in the solar system | qualitative | - | S2 |
| F40 | Great Red Spot is about twice as wide as Earth | 2 | - | S2 |
| F41 | Mile | 1.609344 | km | S13 |
| F42 | Speed of a rifle bullet, typical (for scale) | 1 | km/s | S15 |
| F43 | Earth gravity (mean) | 9.82 | m/s^2 | S1 |
| F44 | Standard atmosphere | 101325 | Pa | S13 |

- S1: NASA Goddard (NSSDCA), Jupiter Fact Sheet (updated 2 Oct 2024). https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html
- S2: NASA Science, Jupiter: Facts. https://science.nasa.gov/jupiter/jupiter-facts/
- S3: NASA History, 30 Years Ago: Galileo Off to Orbit Jupiter. https://www.nasa.gov/history/30-years-ago-galileo-off-to-orbit-jupiter/
- S4: NASA JPL, Galileo Probe Suggests Planetary Science Reappraisal. https://www.jpl.nasa.gov/news/galileo-probe-suggests-planetary-science-reappraisal/
- S5: NASA Goddard (NSSDCA), Galileo Probe Entry Timeline. https://nssdc.gsfc.nasa.gov/planetary/galileo_probe_time.html
- S6: Sci.News, Jovian Clouds Consist of Ammonium Hydrosulfide, Study Suggests (Oxford-led, 2025). https://www.sci.news/space/jovian-clouds-ammonium-hydrosulfide-13575.html
- S7: Bolton et al., Microwave observations reveal the deep extent and structure of Jupiter's atmospheric vortices, Science (2021). https://weizmann.ac.il/EPS/kaspi/sites/EPS.kaspi/files/publications/Bolton-etal-2021_1.pdf
- S8: Bjoraker et al., The Gas Composition and Deep Cloud Structure of Jupiter's Great Red Spot (2018). https://arxiv.org/abs/1808.01402
- S9: NASA JPL, Shallow Lightning and Mushballs Reveal Ammonia to NASA's Juno Scientists (2020). https://www.jpl.nasa.gov/news/shallow-lightning-and-mushballs-reveal-ammonia-to-nasas-juno-scientists/
- S10: Smithsonian National Air and Space Museum, The Man Behind High-Speed Safety Standards. https://airandspace.si.edu/stories/editorial/man-behind-high-speed-safety-standards
- S11: Body Physics (Open Oregon), Body Density from Hydrostatic Weighing. https://openoregon.pressbooks.pub/bodyphysics2ed/chapter/body-density-from-hydrostatic-weighing/
- S12: Dewberry and Lai, Dynamical tides in Jupiter and the role of interior structure (2023), index-1 polytrope as leading-order model. https://arxiv.org/abs/2301.02418
- S13: NIST, Guide to the SI, Appendix B.9 (conversion factors: ton of TNT, mile). https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9
- S14: NIST, CODATA fundamental physical constants. https://physics.nist.gov/cuu/Constants/
- S15: Britannica, Ballistics (muzzle velocities of rifles, about 1 km/s). https://www.britannica.com/technology/ballistics
