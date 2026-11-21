# "What If Lightning Hit Your Plane?" — script v1 (2026-11-21)
Format: cartoon-3d-short skill (65.0 s, 226 words, 3.48 words/s, Kokoro am_michael @1.2). Our own characters and story.
Recurring characters: **Gus** (pyjamas, slippers, glass fishbowl helmet), his wife, his neighbor.

Model (stated assumptions): a typical lightning flash as the U.S. National Weather Service describes it (about
30,000 A, 50,000 °F) attaches to the nose of a single-aisle airliner and leaves at the tail. The fuselage is taken
as one seamless aluminium tube (38 m long, 3.76 m across, 1 mm of 2024-T3 skin; frames, stringers and floor left
out, joints too). Voltage along the skin = peak current x resistance (Ohm's law). Every computed number is in
`calc_video.py` -> `calc.json`; the script exits non-zero if one of its 13 checks fails.

| # | Fact in the script | Value | Where it comes from |
|---|---|---|---|
| 1 | "five times hotter than the sun's surface" | 50,000 °F against 9,930 °F = 5.04 | `bolt.times_sun_surface`; NWS "How Hot Is Lightning?" (50,000 °F, "5 times hotter than the surface of the sun"); Sun 5,772 K (IAU nominal) |
| 2 | "all he lost is his nap" / "Nobody is hurt" | passengers see a flash and hear a bang, nothing more | Rupke, Scientific American: "passengers and crew may see a flash and hear a loud noise ... nothing serious should happen"; NWS "Lightning and Planes" |
| 3 | "nine at night, two miles up in a storm cloud" | 2 miles = 10,560 ft, inside the 5,000 to 15,000 ft band where most strikes happen | `rate.two_miles_ft`; SKYbrary "Lightning"; U.S. Naval Safety Command. The hour is story |
| 4 | "two thousand times the current that blows the fuse in his kitchen" | 30,000 A / 15 A = 2,000 | `bolt.times_household`; NWS "How Powerful Is Lightning?": "about 300 million Volts and about 30,000 Amps. In comparison, household current is 120 Volts and 15 Amps" |
| 5 | "electricity is lazy. It takes the easy road, and nothing is easier than metal" | current divides in proportion to how easily each path conducts; aluminium conducts about 10^20 times better than air or dry cloth | textbook (parallel conductors); Rupke: the current stays in the conductive outer shell |
| 6 | "The plane's skin is aluminum, no thicker than a dime" | skin about 1 mm (0.036 to 0.040 in panels), dime 1.35 mm | `skin.thickness_mm`, `skin.dime_mm`; U.S. Mint coin specifications |
| 7 | "lands on the nose, runs along the outside, and jumps off the tail" | the typical path: in at an extremity (nose, wingtip), out at another (tail) | Rupke, Scientific American; NWS "Lightning and Planes" |
| 8 | "Ever stand under an umbrella in the rain? The water runs around you, and you stay dry." | analogy for a conducting shell carrying the current around what is inside (Faraday cage) | - |
| 9 | "Pushing all of it from nose to tail takes only a few volts." (headline) | 30,000 A x 0.187 milliohm = 5.6 V | `skin.volts_nose_to_tail`, `skin.resistance_milliohm` |
| 10 | "Less than a wall socket." | 5.6 V for the ideal tube, 75 V with the 2.5 milliohm bonding bound, both under 120 V | `skin.volts_at_bound`; In Compliance Magazine: full-scale lightning current (200 kA) "induces no more than 500 V across the aircraft" |
| 11 | "Every airliner gets hit about once a year." | 1 to 2 a year (NWS); 1 per 1,000 flight hours (FAA estimate) to 1 per 3,000 (Airbus) | `rate.strikes_per_year_low/high`; NWS "Lightning and Planes"; Rupke: "more than once each year"; Airbus Safety First |
| 12 | "Nine times out of ten, the plane sets the bolt off itself." | almost 90 % of strikes are triggered by the aircraft | `rate.nine_in_ten`; Flight Safety Foundation, AeroSafety World June 2010; Rupke: "aircraft often trigger lightning" |
| 13 | "the lightning can't get to Gus" | see 5, 7, 9 | - |
| 14 | "cabin air is bone dry, the floor is carpet, and Gus wears slippers" | cabin humidity is typically under 20 %; dry air lets a body keep its charge; rubbing soles on carpet charges it | general knowledge of cabin air and static electricity (not looked up at a primary source in this run, see below) |
| 15 | "That tiny spark is three thousand volts." | a static spark is not felt below about 2,000 to 3,000 V; ordinary doorknob zaps are 3,000 V and more | `doorknob.volts`; Live Science, "The Shocking Truth Behind Static Electricity"; energy 0.68 mJ, charge 0.45 microcoulomb (`doorknob.energy_mJ`) |
| 16 | "The lightning never touched him. The doorknob did." | 3,000 V against about 6 V along the skin | `doorknob.times_the_skin_volts` |

Caveats kept honest in the wording
- "A few volts" is Ohm's law on an ideal seamless tube at the peak current of a typical flash. Real fuselages
  have riveted joints; the published bonding bound (500 V at 200,000 A, i.e. 2.5 milliohms) gives at most 75 V at
  30,000 A. The narration therefore only claims "a few volts" and "less than a wall socket"; the description gives
  both figures. This is the voltage along the metal, not what a stroke can induce in wiring, which is why aircraft
  electronics are shielded and why struck aircraft are inspected.
- A rare giant flash carries up to ten times the typical current; the conclusion (tens of volts) stays.
- "Lazy" and the umbrella are pictures of a conducting shell; the film does not say "Faraday cage".
- The doorknob spark is high voltage with almost no charge behind it (under a millionth of a coulomb against the
  bolt's fifteen or so), which is why it stings and does nothing else. The film says "tiny spark".
- Strikes happen mostly during climb and descent, so the story is set two miles up, not at cruise.

Not seen at the primary source in this session (search results only, pages not opened): every source below. Two
independent search results agree on each headline input: 30,000 A (NWS lightning-power page and NWS Melbourne
page), about once a year (NWS, Scientific American, Airbus), almost 90 % self-triggered (Flight Safety Foundation;
Scientific American in words), 500 V at 200 kA (In Compliance Magazine; the FAA handbook's chapter on structural
IR voltage was found by title only). The skin thickness (0.036 to 0.040 in), the 2024-T3 resistivity, the dime's
thickness and the cabin humidity figure are from memory of standard references and were not looked up.

Sources
- NWS Lightning Safety, "How Powerful Is Lightning?" https://www.weather.gov/safety/lightning-power
- NWS Lightning Safety, "How Hot Is Lightning?" https://www.weather.gov/safety/lightning-temperature
- NWS Lightning Safety, "Lightning and Planes" https://www.weather.gov/safety/lightning-planes
- NWS Melbourne, "What is lightning?" https://www.weather.gov/mlb/what_is_lightning
- E. J. Rupke, "What happens when lightning strikes an airplane?", Scientific American. https://www.scientificamerican.com/article/what-happens-when-lightni/
- Flight Safety Foundation, AeroSafety World, June 2010, pp. 18-23. https://flightsafety.org/wp-content/uploads/2016/11/asw_jun10_p18-23.pdf
- Airbus Safety First, "Lightning strikes". https://safetyfirst.airbus.com/lightning-strikes/
- SKYbrary, "Lightning". https://skybrary.aero/articles/lightning
- In Compliance Magazine, "Lightning and RF Electrical Bonding". https://incompliancemag.com/lightning-and-rf-electrical-bonding/
- Fisher, Plumer, Perala, Aircraft Lightning Protection Handbook, DOT/FAA/CT-89/22 (1989).
- Live Science, "The Shocking Truth Behind Static Electricity". https://livescience.com/4077-shocking-truth-static-electricity.html
- U.S. Mint, coin specifications (dime: 1.35 mm thick). https://www.usmint.gov/learn/coins-and-medals/circulating-coins/coin-specifications

Script (17 lines)
1. A lightning bolt five times hotter than the sun's surface just hit the plane Gus is on, and all he lost is his nap.
2. It's nine at night, two miles up in a storm cloud, and Gus is asleep.
3. Bang. A white flash. His wife screams. His neighbor throws both hands up.
4. That bolt carries two thousand times the current that blows the fuse in his kitchen.
5. But wait. Nobody is hurt. So where did it all go?
6. You see, electricity is lazy. It takes the easy road, and nothing is easier than metal.
7. The plane's skin is aluminum, no thicker than a dime.
8. So the bolt lands on the nose, runs along the outside, and jumps off the tail.
9. Ever stand under an umbrella in the rain? The water runs around you, and you stay dry.
10. Pushing all of it from nose to tail takes only a few volts. Less than a wall socket.
11. And it's no accident. Every airliner gets hit about once a year.
12. Nine times out of ten, the plane sets the bolt off itself.
13. Luckily, the lightning can't get to Gus.
14. Unluckily, cabin air is bone dry, the floor is carpet, and Gus wears slippers.
15. He shuffles to the bathroom and reaches for the knob.
16. Zap. That tiny spark is three thousand volts.
17. The lightning never touched him. The doorknob did.
