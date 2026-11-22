# "What If a Fart Was Your Only Rocket in Space?" — script v1 (2026-11-22)
Format: cartoon-3d-short skill (64.4 s of voice, 3.6 words/s, Kokoro am_michael @1.2). Our own characters and story.
Recurring character: **Gus**, here in a white spacesuit with his fishbowl helmet and his red slippers.

Model (`calc_video.py` → `calc.json`): Gus floats at rest 10 ft from the hatch. Conservation of momentum: a mass m
leaving at speed u gives him m·u / (M − m) the other way. Stated assumptions: the fart leaves at 10 ft/s, all of
it straight backwards (generous: line 6 says so, and line 17 takes it back, because a real suit is airtight).

| # | Fact in the script | Value | Where it comes from |
|---|---|---|---|
| 1 | "ten feet from his ship" | 10 ft = 3.048 m | story input (`inputs.gap_ft`) |
| 2 | "One hair's width a minute" | 90 µm per minute (1.5 µm/s); a human hair is 17 to 181 µm, nominally about 75 | `fart.gus_speed_um_per_min`; Ley, Physics Factbook; Wikipedia "Hair's breadth" |
| 3 | "ten feet takes over three weeks" | 23.6 days = 3.4 weeks | `fart.ten_feet_takes_days` |
| 4 | "He has air for eight hours" | primary life support of the NASA spacewalk suit: 8 h (sources give 6.5 to 8 h) | NASA EMU fact sheet; Wikipedia "Extravehicular Mobility Unit" |
| 5 | "a tenth of a gram of gas" | 90 ml (median volume of one passage; range 33 to 125 ml) × 1.14 g/L (air at 37 °C) = 0.102 g. The hydrogen-rich mix measured in that study would weigh 0.06 g, so a tenth of a gram is generous | Tomlin, Lowis & Read 1991; `fart.mass_g` |
| 6 | "leaving at ten feet a second" | ASSUMED. No measurement has been published; 10 ft/s is the popular figure (J. Dawson, *Who Cut the Cheese?*, 1999). Check: 90 ml in 0.5 to 2 s through 0.2 to 1 cm² is 0.45 to 9 m/s, and 10 ft/s = 3.05 m/s lies inside | `checks.continuity_speed_range_m_s` |
| 7 | "Gus and his suit weigh four hundred sixty pounds" | Gus 180 lb (as in earlier episodes) + suit about 280 lb | suit: widely quoted figure; NASA's fact sheet gives 113 kg (250 lb) without the SAFER jet pack, the enhanced ISS suit is 319 lb |
| 8 | "Half a pound at twenty miles an hour" | a slipper of 0.5 lb, an easy throw of 20 mph: story inputs | `inputs` |
| 9 | "six thousand times the push of a fart" | momentum ratio 6,495 | `slipper.worth_farts` |
| 10 | "five minutes later" | 10 ft at 9.7 mm/s = 313 s = 5.2 min | `slipper.ten_feet_takes_min` |
| 11 | "a spacesuit is airtight" | the suit is a sealed, pressurised garment; its gas loop is closed | NASA EMU fact sheet |
| 12 | "a rocket moves by throwing stuff away. What counts is how much, and how fast" | momentum = mass × speed; Tsiolkovsky's rocket equation, which the calc reproduces to 2 parts in 10 million for this tiny mass | `checks.rocket_equation_vs_momentum_rel_diff` |

Self-checks in `calc_video.py` (it exits non-zero when one fails): rocket equation against the momentum formula;
the assumed exit speed against the continuity range; the same formula against NASA's SAFER jet pack (3 lb of
nitrogen → about 10 ft/s published, 12.8 ft/s computed with a cold-gas specific impulse of 70 s); the density of
air at 37 °C; and the four spoken numbers (hair's width, three weeks, five minutes, six thousand).

Sources:
- J. Tomlin, C. Lowis, N. W. Read, "Investigation of normal flatus production in healthy volunteers", Gut 32, 665 (1991), https://pubmed.ncbi.nlm.nih.gov/1648028/ (abstract seen: 476 to 1491 ml a day, median 705; the per-passage figures, 33 to 125 ml with a median of 90 and a median of 8 passages, are from the full text as quoted in two search results, not seen at the primary source)
- NASA, "The Extravehicular Mobility Unit" fact sheet, https://www.nasa.gov/wp-content/uploads/2009/07/188963main_extravehicular_mobility_unit.pdf (113 kg without SAFER; quoted through search results, the PDF itself was not opened); the 280 lb figure is the widely repeated rounded one and was not seen on a NASA page
- NASA / Wikipedia, "Simplified Aid For EVA Rescue": 3 lb (1.4 kg) of nitrogen, about 10 ft/s, https://en.wikipedia.org/wiki/Simplified_Aid_For_EVA_Rescue
- B. Ley, "Diameter of a Human Hair", The Physics Factbook (1999), https://hypertextbook.com/facts/1999/BrianLey.shtml
- Exit speed: no primary source exists; see row 6

Script (18 lines):
1. Gus is stuck floating in space, ten feet from his ship, and the only rocket he has is a fart.
2. It's two in the afternoon, high above the ocean, and his safety rope just came loose.
3. He kicks. He swims. Nothing. In space, there's nothing to push on.
4. His wife radios, throw something! His neighbor says he's a goner.
5. Gus says he had beans for lunch, turns around, and fires.
6. Let's be kind and say it all shoots straight out the back.
7. Now Gus is moving. One hair's width a minute.
8. At that pace, ten feet takes over three weeks. He has air for eight hours.
9. But wait. Rockets run on gas too. So why is his so weak?
10. You see, a rocket moves by throwing stuff away. What counts is how much, and how fast.
11. Ever stood on a skateboard and thrown a heavy backpack? You roll the other way.
12. A fart is a tenth of a gram of gas, leaving at ten feet a second.
13. Gus and his suit weigh four hundred sixty pounds.
14. So he pulls off a slipper, and throws it, hard.
15. Half a pound at twenty miles an hour. That's six thousand times the push of a fart.
16. Luckily, five minutes later, Gus floats in through the hatch.
17. Unluckily, a spacesuit is airtight.
18. So the fart never left. It rode home with him, inside the helmet.
