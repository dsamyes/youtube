# "What If You Had a Hummingbird's Metabolism?" — script v1 (2026-11-14)
Format: cartoon-3d-short skill (66.2 s, 232 words, 3.5 words/s, Kokoro am_michael @1.2). Our own characters and story.
Recurring character: **Gus** (pyjamas, slippers, glass fishbowl helmet), his wife, his neighbor; the fisherman from the hole short.

Model (stated assumption): give a 70 kg man the energy turnover per gram of a free-living hummingbird and follow the
energy: food in, heat out. Scaling is linear in mass on purpose ("what if every gram of you ran like a gram of
hummingbird"). Every number below is computed in `calc_video.py` -> `calc.json`; the script exits non-zero if a check fails.

| # | Fact in the script | Value | Where it comes from |
|---|---|---|---|
| 1 | "a burger every three minutes" | 478 hamburgers a day = one every 3.01 min | `energy.one_burger_every_min`; hamburger 250 kcal (McDonald's USA nutrition page) |
| 2 | "burns fuel fifty times as fast as he does", gram for gram | 49.8 x | `energy.times_gus_normal`: 119,503 kcal vs 2,400 kcal/day (sedentary man 31-40, Dietary Guidelines for Americans 2020-2025, Appendix 2) |
| 3 | "a hundred and twenty thousand calories a day" (headline) | 119,503 kcal/day (cautious end; 132,658 and 155,858 with two other species) | `energy.kcal_day`, `energy.kcal_day_by_species`. Source 1: Powers & Nagy 1988 (32 kJ/day at 4.48 g). Source 2: Powers & Conley 1994 (29.1 kJ/day at 3.67 g; 81.7 kJ/day at 8.77 g). Popular figure it must bracket: about 155,000 (Audubon Magazine) |
| 4 | "His heart beats twenty times a second ... that's a hum" | 1,200 beats/min = 20 /s; 20 Hz is the lowest pitch people hear | `heart.beats_per_second`; Lasiewski 1964; Smithsonian NMNH 2022 ("up to 1,200 beats per minute") |
| 5 | "all that food turns into heat ... as much as four space heaters" | 5,787 W = 3.86 heaters of 1,500 W | `heat.watts`, `heat.space_heaters` |
| 6 | "a french fry goes cold in minutes, but a baked potato stays hot for half an hour" | 8 mm fry: 45 C after 8.6 min; 7.5 cm potato: still 60 C after 30 min (6.25 x slower) | `fry_vs_potato.*` (lumped cooling, tau = rho c (V/A) / h) |
| 7 | "Small things have more skin for their size ... the bird has twenty times more than Gus", pound for pound | 25 x by geometry; 23 x and 18.6 x from measured surface formulas | `skin.*` (DuBois 1916 for the man; Meeh constant 10 for birds; Walsberg & King 1978 skin under plumage) |
| 8 | "He heats up more than a degree every minute" | 1.07 C/min with maximal sweating (1.24 with the newer specific heat; 1.43 with no cooling), i.e. 1.9 F/min | `heat.deg_C_per_min_*`; sweat limit 2 L/h (Institute of Medicine 1993); specific heat 3.47 and 2.98 kJ/kg/C (Xu et al. 2022) |
| 9 | "water pulls heat out far faster than air" | conductivity 23 x; a man in 18 C water sheds about 6.4 kW at rest, 16 kW swimming (needed: 5.8 kW) | `heat.water_vs_air_conductivity`, `heat.sea_cooling_W_*`; Nadel et al. 1974 |
| 10 | "it's now been four minutes since he last ate" | story beat; one burger is due every 3.01 min (fact 1), so after four minutes he is one behind | `energy.one_burger_every_min` |
| 11 | "Even a hummingbird can't afford to live like one. On cold nights it almost shuts off" | nightly torpor: body temperature and metabolic rate drop steeply, saving most of the night's energy | Hainsworth & Wolf 1970; Shankar et al. 2020 (qualitative, no number spoken) |
| 12 | "It's seven in the morning" / "At seven this morning" | story setting | - |

Caveats kept honest in the wording: the headline is the lowest of three measured species ("a hundred and twenty
thousand"); "more than a degree" is true in Celsius and in Fahrenheit; "twenty times" is the middle of 18.6-25;
torpor is said for "cold nights", not every night. Not verified at the primary source in this session (the pages
could not be opened from this machine, only search snippets): Audubon's 155,000 figure, Nadel's coefficients,
Lasiewski's 1,260 beats/min (the script uses the rounder 1,200 that the Smithsonian page gives).

Sources
- D. R. Powers & K. A. Nagy 1988, "Field metabolic rate and food consumption by free-living Anna's hummingbirds (Calypte anna)", Physiological Zoology 61(6):500-506.
- D. R. Powers & T. M. Conley 1994, "Field metabolic rate and food consumption of two sympatric hummingbird species in southeastern Arizona", The Condor 96(1):141-150.
- Audubon Magazine, "Where Do Hummingbirds Get All That Energy?" https://www.audubon.org/magazine/where-do-hummingbirds-get-all-energy
- R. C. Lasiewski 1964, "Body temperatures, heart and breathing rate, and evaporative water loss in hummingbirds", Physiological Zoology 37(2):212-223.
- Smithsonian National Museum of Natural History 2022, "Four reasons why there is more to hummingbirds than meets the eye" https://www.smithsonianmag.com/blogs/national-museum-of-natural-history/2022/09/02/four-reasons-why-there-is-more-to-hummingbirds-than-meets-the-eye/
- X. Xu et al. 2022, "The specific heat of the human body is lower than previously believed", Temperature 10(2):235-239. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10274559/
- Institute of Medicine 1993, "Nutritional Needs in Hot Environments", ch. 5 (sweat rates, 580 kcal per litre). https://www.ncbi.nlm.nih.gov/books/NBK236237/
- E. R. Nadel et al. 1974, "Energy exchanges of swimming man", Journal of Applied Physiology 36(4):465-471. doi:10.1152/jappl.1974.36.4.465
- F. R. Hainsworth & L. L. Wolf 1970, "Regulation of oxygen consumption and body temperature during torpor in a hummingbird, Eulampis jugularis", Science 168:368-369.
- A. Shankar et al. 2020, "Hummingbird torpor in context: duration, more than temperature, is the key to nighttime energy savings", Journal of Avian Biology 51(5).
- U.S. Dietary Guidelines for Americans 2020-2025, Appendix 2 (estimated calorie needs).
- McDonald's USA, Hamburger nutrition (250 Cal). https://www.mcdonalds.com/us/en-us/product/hamburger.html
- D. DuBois & E. F. DuBois 1916, Archives of Internal Medicine 17:863 (body surface area); G. E. Walsberg & J. R. King 1978, J. Exp. Biol. 76:185 (bird surface area).

Script (16 lines)
1. Gus has to eat a burger every three minutes, and that's not even his biggest problem.
2. At seven this morning he woke up with the metabolism of a hummingbird.
3. Gram for gram, that tiny bird burns fuel fifty times as fast as he does.
4. At his size, that's a hundred and twenty thousand calories a day.
5. His wife flips pancakes as fast as she can. Gone.
6. His neighbor laughs that no one eats that much and loses every sausage on the grill.
7. His heart beats twenty times a second. That's not a pulse, that's a hum.
8. But wait. Why is his helmet steaming up?
9. You see, all that food turns into heat, and Gus now puts out as much as four space heaters.
10. Ever notice a french fry goes cold in minutes, but a baked potato stays hot for half an hour?
11. Small things have more skin for their size. Pound for pound, the bird has twenty times more than Gus, so its heat just leaks away.
12. Gus is the baked potato. He heats up more than a degree every minute.
13. Luckily, he lives by the sea, and water pulls heat out far faster than air.
14. Unluckily, it's now been four minutes since he last ate.
15. And the funny part? Even a hummingbird can't afford to live like one.
16. On cold nights it almost shuts off, just to make it to breakfast.
