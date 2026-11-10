# Research: What If Earth Stopped Spinning for 1 Second?

Series: Planet Breakers · Video #1 · Researched 2026-11-09

## Scenario definition (what we are and are not claiming)

The solid Earth (crust, mantle, core, and everything rigidly anchored to rock) stops rotating
instantly, stays still for exactly 1 s, then instantly resumes its normal rotation. Everything not
rigidly anchored (air, oceans, people, loose objects) keeps its velocity (Newton's first law). The
"instant" stop is a stated rule of the thought experiment, not a physical process. All motion is
analysed in the non-rotating (inertial) frame, so "speed" means speed relative to the stars.

Out of scope (deliberately not claimed in the script): exact tsunami heights (need coastline
modelling), liquid-outer-core / magnetic-field effects, long-term climate.

## Facts

Parsed by `pipeline/research.py`. Columns: ID | fact | value | unit | source IDs. `calc.py` reads
the numeric values from here, so every constant in the video traces to a row below.

| ID | Fact | Value | Unit | Sources |
|----|------|-------|------|---------|
| F01 | Earth equatorial radius (WGS84 semi-major axis) | 6378.137 | km | S1, S2 |
| F02 | Earth sidereal rotation period | 23.9345 | h | S1 |
| F03 | WGS84 inverse flattening | 298.257223563 | - | S2 |
| F04 | Standard gravity g (exact, CODATA) | 9.80665 | m/s^2 | S3 |
| F05 | Sea-level air density, US Standard Atmosphere 1976 | 1.225 | kg/m^3 | S4 |
| F06 | Sea-level temperature, US Standard Atmosphere 1976 | 288.15 | K | S4 |
| F07 | Sea-level pressure (standard atmosphere) | 101325 | Pa | S4 |
| F08 | Ratio of specific heats for air (gamma) | 1.4 | - | S5 |
| F09 | Specific gas constant for dry air | 287.05 | J/(kg K) | S5 |
| F10 | Category 5 hurricane threshold (1-min sustained wind) | 157 | mph | S6 |
| F33 | Category 5 threshold as published in km/h | 252 | km/h | S6 |
| F34 | Joukowsky water-hammer relation dp = rho c dv | qualitative | - | S26 |
| F35 | City coordinates (latitudes listed below) | qualitative | - | S25 |
| F11 | Average depth of the world ocean | 3682 | m | S7 |
| F12 | Typical seawater density | 1025 | kg/m^3 | S8 |
| F13 | Speed of sound in seawater (typical) | 1500 | m/s | S9 |
| F14 | Challenger Deep depth (Mariana Trench) | 10935 | m | S10 |
| F15 | Tsunamis in the deep ocean can move as fast as a jet plane (500+ mph) | 500 | mph | S11 |
| F16 | Leap seconds inserted into UTC since 1972 (last: 2016-12-31) | 27 | count | S12, S13 |
| F17 | UTC is kept within 0.9 s of UT1 (Earth-rotation time) | 0.9 | s | S13 |
| F18 | ISS orbital speed | 17500 | mph | S14 |
| F19 | Energy of 1 kg TNT (conventional definition) | 4.184 | MJ | S15 |
| F20 | Height of Mount Everest (2020 survey) | 8848.86 | m | S16 |
| F21 | Mass of Earth's atmosphere | 5.148e18 | kg | S17 |
| F22 | World primary energy consumption per year (approx., 2023) | 620 | EJ | S18 |
| F23 | Young's modulus of structural steel | 200 | GPa | S19 |
| F24 | Density of steel | 7850 | kg/m^3 | S19 |
| F25 | Minimum yield strength, ASTM A36 structural steel | 250 | MPa | S20 |
| F26 | Static friction coefficient, rubber on dry concrete (typical) | 0.7 | - | S21 |
| F27 | Olympic pool nominal volume (50 m x 25 m x 2 m) | 2500 | m^3 | S22 |
| F28 | Assumed adult body mass (round number, ICRP reference adult male is 73 kg) | 70 | kg | S23 |
| F29 | Assumed height of a standing person's centre of mass | 1.0 | m | S23 |
| F30 | Jupiter has no solid surface (gas giant) | qualitative | - | S24 |
| F31 | Shear modulus (modulus of rigidity) of structural steel | 79.3 | GPa | S27 |
| F32 | Typical cruise speed of a jet airliner (approx.) | 900 | km/h | S28 |

City latitudes (geodetic, decimal degrees; standard coordinates, S25): Quito -0.18, Singapore 1.35,
Mumbai 19.08, Cairo 30.04, Tehran 35.69, New York 40.71, London 51.51, Reykjavik 64.15, North Pole 90.

## Physics models used (with references)

- Rotation speed at geodetic latitude phi on the WGS84 ellipsoid: v = omega * N(phi) * cos(phi),
  N = a / sqrt(1 - e^2 sin^2 phi), omega = 2*pi / T_sidereal. (S2)
- Kinetic energy E = 1/2 m v^2; equivalent drop height h = v^2 / (2g). (standard mechanics)
- Ram (dynamic) pressure q = 1/2 rho v^2. For supersonic flow the true stagnation pressure behind
  the bow shock (Rayleigh pitot formula) is higher, so q is a lower bound. (S5)
- Speed of sound in an ideal gas c = sqrt(gamma R T). (S5)
- Elastic wave stress: tau = rho c_s dv for a sudden sideways velocity change, carried by a shear
  wave c_s = sqrt(G/rho) (a horizontal jolt at a building's base travels up as a shear wave, not a
  compression wave). Shear yield from von Mises: tau_y = sigma_y / sqrt(3). (S19, S27)
- Water hammer (Joukowsky): dp = rho c dv for an instantaneous velocity change. (S26)
- Shallow-water (long) wave speed c = sqrt(g d), valid for tsunamis because their wavelength is far
  larger than ocean depth. (S11)
- Hydrostatic pressure p = p0 + rho g h. (standard)

## Sources

- S1: NASA NSSDC, Earth Fact Sheet. https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html
- S2: NGA, World Geodetic System 1984 (WGS 84), NGA.STND.0036. https://earth-info.nga.mil/index.php?dir=wgs84&action=wgs84
- S3: NIST CODATA, standard acceleration of gravity. https://physics.nist.gov/cgi-bin/cuu/Value?gn
- S4: NOAA/NASA/USAF, U.S. Standard Atmosphere 1976 (NASA-TM-X-74335). https://ntrs.nasa.gov/citations/19770009539
- S5: NASA Glenn Research Center, Speed of Sound / Normal Shock (Beginner's Guide to Aeronautics). https://www.grc.nasa.gov/www/k-12/airplane/sound.html
- S6: NOAA National Hurricane Center, The Saffir-Simpson Hurricane Wind Scale. https://www.nhc.noaa.gov/aboutsshws.php
- S7: NOAA Ocean Exploration, How deep is the ocean? https://oceanexplorer.noaa.gov/facts/ocean-depth.html
- S8: NOAA National Ocean Service / TEOS-10 (seawater density ~1,020-1,030 kg/m^3). https://www.teos-10.org/
- S9: DOSITS (Univ. of Rhode Island), How fast does sound travel? https://dosits.org/science/sounds-in-the-sea/how-fast-does-sound-travel/
- S10: NOAA Ocean Exploration, How deep is the Mariana Trench? https://oceanexplorer.noaa.gov/facts/mariana-trench.html
- S11: NOAA JetStream, Tsunami propagation. https://www.noaa.gov/jetstream/tsunamis/tsunami-propagation
- S12: IERS Earth Orientation Center, leap-seconds list (Bulletin C). https://hpiers.obspm.fr/iers/bul/bulc/ntp/leap-seconds.list
- S13: NIST Time and Frequency Division, Leap seconds. https://www.nist.gov/pml/time-and-frequency-division/leap-seconds-faqs
- S14: NASA, International Space Station facts and figures. https://www.nasa.gov/international-space-station/space-station-facts-and-figures/
- S15: NIST SP 811, Guide for the Use of the International System of Units (TNT equivalent). https://www.nist.gov/pml/special-publication-811
- S16: Encyclopaedia Britannica, Mount Everest (8,848.86 m, 2020 China-Nepal survey). https://www.britannica.com/place/Mount-Everest
- S17: Trenberth & Smith (2005), The Mass of the Atmosphere, Journal of Climate 18:864. https://doi.org/10.1175/JCLI-3299.1
- S18: Energy Institute, Statistical Review of World Energy 2024. https://www.energyinst.org/statistical-review
- S19: Engineering ToolBox, Young's modulus / densities of metals (steel E = 200 GPa, 7,850 kg/m^3). https://www.engineeringtoolbox.com/young-modulus-d_417.html
- S20: ASTM A36/A36M, Standard Specification for Carbon Structural Steel. https://www.astm.org/a0036_a0036m-19.html
- S21: Engineering ToolBox, Friction and friction coefficients. https://www.engineeringtoolbox.com/friction-coefficients-d_778.html
- S22: World Aquatics (FINA) Facilities Rules, FR 2 (50 m competition pool). https://www.worldaquatics.com/rules/competition-regulations
- S23: ICRP Publication 89, Basic anatomical and physiological data (reference adult). https://www.icrp.org/publication.asp?id=ICRP%20Publication%2089
- S24: NASA Science, Jupiter facts. https://science.nasa.gov/jupiter/jupiter-facts/
- S25: GeoNames geographical database. https://www.geonames.org/
- S27: Engineering ToolBox, Modulus of rigidity (shear modulus) of materials. https://www.engineeringtoolbox.com/modulus-rigidity-d_946.html
- S28: Boeing, 787 Dreamliner technical characteristics (cruise Mach 0.85). https://www.boeing.com/commercial/787
- S26: Ghidaoui et al. (2005), A Review of Water Hammer Theory and Practice, Applied Mechanics Reviews 58(1):49. https://doi.org/10.1115/1.1828050

## Research notes

- The popular "1,670 km/h" uses a 24 h solar day (463.8 m/s). Using the sidereal day, which is the
  physically correct rotation period, gives 465.1 m/s = 1,674 km/h. Both round to "about 1,670 km/h";
  the script uses the sidereal value everywhere and rounds the km/h figure to 3 significant figures.
- The Category 5 threshold of 157 mph is the minimum; real Cat 5 storms can exceed it, so the
  pressure ratio is phrased "versus the minimum Category 5 wind".
- Tsunami speed: NOAA quotes "over 500 mph" for the deepest water. Our sqrt(g d) value at the
  *average* depth (3,682 m) is ~425 mph, so the script says "nearly as fast as a jet airliner".
- Leap seconds: 27 inserted between 1972 and 2016; none since. (Several web pages still show older
  counts of 24-26; IERS list is authoritative.)
- Web access note: the run that produced this file could reach a web search API but not the
  primary hosts directly (egress policy). URLs above are the canonical primary pages; research.py
  records which ones were reachable at build time in manifest.json.
