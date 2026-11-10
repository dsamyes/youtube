# Research: What If You Traveled at 99.9999% the Speed of Light?

Series: Human Limits · Researched 2026-11-10

## Scenario definition (what we are and are not claiming)

You ride a ship with the mass of the International Space Station (419,725 kg). In the main part of
the video the ship cruises at a fixed speed: 10%, 50%, 90%, 99%, 99.9%, 99.99% and 99.9999% of the
speed of light. We do not model how it got there, except for the energy: the kinetic energy
(γ − 1)Mc² is the *minimum* any engine must supply (perfect conversion, no fuel carried). The
"Beyond" chapter switches to a ship that accelerates at a constant 1 g (proper acceleration) to the
halfway point and decelerates at 1 g for the second half (the standard relativistic-rocket result).

- Clocks: "Earth time per ship year" = γ (special relativity, flat space, ignoring the ship's
  acceleration phases and Earth's tiny gravitational time dilation).
- Trip times at a fixed cruise speed: Earth time = d / v, ship time = d / (γ v).
- Sky: each star's direction is transformed with the relativistic aberration formula and its colour
  with the relativistic Doppler factor D = 1 / (γ(1 − β cos θ')) (observer moving through a static
  star field). A blackbody of temperature T is seen as a blackbody of temperature D·T. Point-source
  brightness in the visible band is scaled by D⁻² · V(D·T)/V(T), where V is the visible-band
  blackbody radiance (Planck's law integrated over 400–700 nm); this reproduces the D² bolometric
  boost for point sources. Star positions, magnitudes and B−V colours: HYG v4.0 (stars to magnitude
  8). Temperatures from B−V with the Ballesteros (2012) formula. The faint diffuse Milky Way glow is
  modelled as unresolved 4,500 K points spread along the galactic plane (an artistic stand-in for
  unresolved starlight, treated with the same physics).
- What hits you: interstellar gas at a typical average density of about 1 hydrogen atom per cm³
  (the real local density is lower, so these are "typical, about" values). Each proton arrives with
  kinetic energy (γ − 1)·m_p c². Particle flux = n·v. Heat load = flux × energy per proton. Dose rate
  for an unshielded body is a LOWER bound: flux × the minimum stopping power of water (real protons
  lose at least this much; nuclear showers add more).
- The "speck of dust" is a hypothetical 1-microgram grain (a stated scenario choice, not a measured
  interstellar grain; real interstellar grains are far smaller).
- Out of scope (not claimed): shield thickness designs, the ship's structure, the rocket equation /
  fuel mass, gravitational effects, the exact local interstellar density along the route, and
  photon pressure from the blueshifted CMB.

## Facts

Parsed by `pipeline/research.py`. Columns: ID | fact | value | unit | source IDs.

| ID | Fact | Value | Unit | Sources |
|----|------|-------|------|---------|
| F01 | Speed of light in vacuum (exact) | 299792458 | m/s | S1 |
| F02 | Julian year used for the light-year | 365.25 | days | S2 |
| F03 | Proton rest energy | 938.27208816 | MeV | S3 |
| F04 | Electron volt | 1.602176634e-19 | J | S4 |
| F05 | Distance to Alpha Centauri A and B | 4.37 | ly | S5 |
| F06 | Distance to the Milky Way's center (Sagittarius A*) | 26000 | ly | S6 |
| F07 | Distance to the Andromeda Galaxy (M31) | 2500000 | ly | S7 |
| F08 | Typical interstellar gas density (about one atom per cubic centimetre) | 1 | atoms/cm^3 | S8 |
| F09 | World primary energy supply, 2024 (record) | 592 | EJ/yr | S9 |
| F10 | Mass of the International Space Station | 419725 | kg | S10 |
| F11 | LHC proton beam energy (Run 3) | 6.8 | TeV | S11 |
| F12 | 1 TeV is about the kinetic energy of a flying mosquito | 1 | TeV | S12 |
| F13 | Proton therapy beam energies, lower end | 70 | MeV | S13 |
| F14 | Proton therapy beam energies, upper end | 250 | MeV | S13 |
| F15 | CSDA range of a 5 MeV proton in liquid water | 0.03623 | g/cm^2 | S14 |
| F16 | CSDA range of a 150 MeV proton in liquid water | 15.76 | g/cm^2 | S14 |
| F17 | Minimum ionization stopping power of liquid water | 1.992 | MeV cm^2/g | S15 |
| F18 | Nuclear interaction length of liquid water | 83.3 | g/cm^2 | S15 |
| F19 | Radiation dose lethal to 50% within 30 days (LD50/30), lower end of 4-5 Sv | 4 | Sv | S16 |
| F20 | Cosmic microwave background temperature | 2.725 | K | S17 |
| F21 | Sun effective temperature | 5772 | K | S18 |
| F22 | Solar constant (sunlight at Earth's distance) | 1361 | W/m^2 | S18 |
| F23 | Moon apparent diameter seen from Earth (mean) | 1896 | arcsec | S19 |
| F24 | Standard gravity g (exact) | 9.80665 | m/s^2 | S20 |
| F25 | Oldest known fossil of the genus Homo (Ledi-Geraru jaw) | 2.8 | million years | S21 |
| F26 | B-V colour index to temperature formula (Ballesteros 2012) | qualitative | - | S22 |
| F27 | Star catalogue: HYG v4.0 (Hipparcos, Yale BSC, Gliese) positions, magnitudes, B-V | qualitative | - | S23 |
| F28 | Parker Solar Probe top speed (fastest human-made object) | 430000 | mph | S24 |
| F29 | Energy of one tonne of TNT (by definition) | 4.184e9 | J | S25 |
| F30 | Hypothetical speck of dust, one microgram (scenario choice) | 1e-9 | kg | S25 |
| F31 | Relativistic aberration and Doppler formulas | qualitative | - | S26 |
| F32 | Constant-acceleration (relativistic rocket) trip formulas | qualitative | - | S27 |
| F33 | Mile (international) in metres (exact) | 1609.344 | m | S25 |
| F34 | The 'starbow' (a rainbow ring of stars ahead of a fast ship) does not appear when the starfield is computed properly (McKinley and Doherty, 1979) | qualitative | - | S28, S29 |

## Sources

- S1: NIST CODATA, Speed of light in vacuum. https://physics.nist.gov/cgi-bin/cuu/Value?c
- S2: IAU, Measuring the Universe: the light-year (Julian year of 365.25 days). https://www.iau.org/public/themes/measuring/
- S3: NIST CODATA, Proton mass energy equivalent in MeV. https://physics.nist.gov/cgi-bin/cuu/Value?mpc2mev
- S4: NIST CODATA, Electron volt-joule relationship. https://physics.nist.gov/cgi-bin/cuu/Value?evj
- S5: NASA Science, Sun: Facts (nearest stars: Alpha Centauri A and B at 4.37 light-years). https://science.nasa.gov/sun/facts/
- S6: NASA Science, Galactic Center (Chandra, Hubble, Spitzer): 26,000 light-years. https://science.nasa.gov/asset/webb/galactic-center-chandra-hubble-spitzer/
- S7: NASA Science, Hubble Messier Catalog: Messier 31 (2.5 million light-years). https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-31/
- S8: NASA Genesis mission, Interstellar Clouds fact sheet (typical density about one particle per cm3). https://solarsystem.nasa.gov/genesismission/educate/kitchen/resource/factsheets/Interstellarclouds.pdf
- S9: Energy Institute, Statistical Review of World Energy 2025 (2024 primary energy 592 EJ). https://www.energyinst.org/statistical-review
- S10: NASA, Space Station Facts and Figures (mass 419,725 kg). https://www.nasa.gov/international-space-station/space-station-facts-and-figures/
- S11: CERN, Facts and figures about the LHC (6.8 TeV per proton). https://home.cern/resources/faqs/facts-and-figures-about-lhc
- S12: CERN LHC Machine Outreach, LHC Glossary (1 TeV, energy of a flying mosquito). https://lhc-machine-outreach.web.cern.ch/lhc_glossary.htm
- S13: MD Anderson Cancer Center, What is proton therapy (70 to 250 million electron volts). https://www.mdanderson.org/patients-family/diagnosis-treatment/care-centers-clinics/proton-therapy-center/what-is-proton-therapy.html
- S14: NIST PSTAR, Stopping power and range tables for protons (liquid water). https://physics.nist.gov/PhysRefData/Star/Text/PSTAR.html
- S15: Particle Data Group, Atomic and nuclear properties: water (liquid). https://pdg.lbl.gov/2010/AtomicNuclearProperties/HTML_PAGES/276.html
- S16: U.S. NRC, Glossary: Lethal dose (LD), LD50/30 of 4 to 5 sieverts. https://www.nrc.gov/reading-rm/basic-ref/glossary/lethal-dose-ld.html
- S17: NASA WMAP, Tests of Big Bang: the CMB (2.725 K). https://map.gsfc.nasa.gov/universe/bb_cosmo_fluct.html
- S18: NASA NSSDC, Sun Fact Sheet (effective temperature 5772 K, solar constant 1361 W/m2). https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html
- S19: NASA NSSDC, Moon Fact Sheet (apparent diameter 1896 arcsec). https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
- S20: NIST CODATA, Standard acceleration of gravity. https://physics.nist.gov/cgi-bin/cuu/Value?gn
- S21: NPR, Jaw fossil in Ethiopia likely oldest ever found in human line (2.8 million years). https://www.npr.org/2015/03/05/390717001/jaw-fossil-in-ethiopia-likely-oldest-ever-found-in-human-line
- S22: Ballesteros, New insights into black bodies, EPL 97 (2012), arXiv:1201.1809. https://arxiv.org/abs/1201.1809
- S23: Astronexus, HYG star database v4.0 (CC BY-SA 4.0). https://github.com/astronexus/HYG-Database
- S24: NASA Science, Parker Solar Probe (about 430,000 mph). https://science.nasa.gov/mission/parker-solar-probe/
- S25: NIST, Special Publication 811, Guide for the Use of the SI (TNT equivalent, unit conversions). https://www.nist.gov/pml/special-publication-811
- S26: Einstein, On the Electrodynamics of Moving Bodies (1905), section 7: aberration and Doppler. https://www.fourmilab.ch/etexts/einstein/specrel/www/
- S28: McKinley and Doherty, In search of the starbow: the appearance of the starfield from a relativistic spaceship, Am. J. Phys. 47, 309 (1979). https://doi.org/10.1119/1.11834
- S29: Optics and Photonics News, A Brief History of the Starbow (Optica). https://www.optica-opn.org/home/articles/volume_20/issue_4/departments/light_touch/a_brief_history_of_the_starbow
- S27: Gibbs and Baez, The Relativistic Rocket (UC Riverside Physics FAQ). https://math.ucr.edu/home/baez/physics/Relativity/SR/Rocket/rocket.html
