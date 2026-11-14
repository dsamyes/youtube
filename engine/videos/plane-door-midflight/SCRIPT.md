# "What If You Tried to Open a Plane Door Mid-Flight?" — script v1 (2026-11-14)
Format: cartoon-3d-short skill (65.2 s, 244 words, 3.74 words/s, Kokoro am_michael @1.2). Our own characters and story.
Recurring characters: **Gus** (pyjamas, slippers, glass fishbowl helmet), his wife, his neighbor.

Model (stated assumptions): an airliner cruising at 38,000 ft with its cabin at the highest cabin altitude the rules
allow in normal operation, 8,000 ft. That is the smallest pressure difference a cruising airliner can have, so the
force is the cautious end. Pressures are the International Standard Atmosphere. The door is the forward entry door of
a Boeing 737 (34 x 72 in), a plug-type door. Force = pressure difference x door area. Every number below is computed
in `calc_video.py` -> `calc.json`; the script exits non-zero if a check fails.

| # | Fact in the script | Value | Where it comes from |
|---|---|---|---|
| 1 | "seven miles up" | 38,000 ft = 7.20 miles | `altitude.cruise_miles` (a typical cruise level; 737 certified to 41,000 ft) |
| 2 | "he's in no danger at all" / "nobody can do that" | the door would need 86 kN (19,392 lbf), more than 120 strong adults pulling together | `door.force_N`, `door.adults_pulling_700N_each`; Ask the Pilot: "You cannot, repeat, cannot, open the doors or emergency hatches of an airplane in flight" |
| 3 | "the air outside is thin. It presses a fifth as hard as the air on the ground" | 20.6 kPa of 101.3 kPa = 0.204 | `pressure.outside_fraction_of_sea_level` (ISA; check: 22,632 Pa at 11 km, about 3.0 psi at 38,000 ft) |
| 4 | "the cabin is pumped up like a tire, and all that air wants out" | cabin 75.3 kPa (10.92 psi) against 20.6 kPa (2.99 psi) outside | `pressure.cabin_psi`, `pressure.outside_psi`; 14 CFR 25.841(a): cabin altitude not more than 8,000 ft |
| 5 | "every square inch of the door, eight pounds harder than the thin air outside pushes back" | 7.92 psi | `pressure.difference_psi`; the 737's own schedule is 7.45 / 7.80 / 8.35 psi (FCOM), and Ask the Pilot says "up to eight pounds ... against every square inch" |
| 6 | "a door has a lot of square inches" | 34 x 72 in = 2,448 sq in (17 sq ft) | `door.area_sq_in`; Boeing 737 airport planning document |
| 7 | "almost twenty thousand pounds" (headline) | 19,392 lbf = 8.8 tonnes (20,441 lbf with the 737's 8.35 psi) | `door.force_lbf`. Source 1: 14 CFR 25.841 + ISA + door size. Source 2: Ask the Pilot, "over 1,100 pounds against each square foot of door" (ours: 1,141 lb/sq ft x 17 sq ft) |
| 8 | "the weight of four cars" | 19,392 / 4,303 lb = 4.5 average new US cars | `door.cars`; EPA Automotive Trends Report 2023 (4,303 lb) |
| 9 | "Ever pull a suction cup off a window? There's no glue. It's just air pushing on one side." | a 2 in cup can hold up to 46 lb: one atmosphere x its area | `suction_cup.max_hold_lbf` |
| 10 | "A plane door is a plug, a bit bigger than its hole, so it has to come in before it swings out." | plug-type door: wider than the opening, opens inward first | Ask the Pilot; AirlineRatings; Business Insider 2020 |
| 11 | "the door only lets go on the ground" | no pressure difference, no force; the cabin is depressurised before the doors are opened | limiting case in `calc_video.py`; see the caveat below |
| 12 | "three in the afternoon", the nap, the bathroom, "It's taken." | story | - |

Caveats kept honest in the wording: "almost twenty thousand" is the cautious end (real 737s hold up to 8.35 psi
at that height, which gives 20,400 lbf). "Only lets go on the ground" is the design case; shortly before landing the
difference is already small, and doors have been opened then, which is why the description says "at cruise". Not every
exit on every aircraft is a pure plug door; the film shows the classic type and the description says so.
Not seen at the primary source in this session (search results only, the pages were not opened): the 34 x 72 in door
size in Boeing's airport planning PDF, the 737 FCOM pressure schedule, the EPA figure of 4,303 lb, and the Ask the
Pilot wording (two search results quote the same "eight pounds ... over 1,100 pounds" sentence).

Sources
- 14 CFR 25.841 Pressurized cabins (cabin pressure altitude of not more than 8,000 feet). https://www.law.cornell.edu/cfr/text/14/25.841
- U.S. Standard Atmosphere 1976 (NOAA / NASA / USAF), identical to the ICAO Standard Atmosphere (Doc 7488) below 32 km.
- Boeing, 737 Airplane Characteristics for Airport Planning (D6-58325-6): door sizes. https://www.boeing.com/commercial/airports/plan-manuals
- Boeing 737 Flight Crew Operations Manual, pressurization: differential pressure 7.45 / 7.80 / 8.35 psi by altitude.
- Patrick Smith, Ask the Pilot, "Open Door Policy". https://askthepilot.com/tag/exit/
- AirlineRatings, "Can you open an aircraft door mid flight?" https://www.airlineratings.com/articles/can-you-open-an-aircraft-door-mid-flight
- Business Insider 2020, "Why plane doors can't open mid-flight".
- EPA Automotive Trends Report 2023 (average new vehicle weight). https://www.epa.gov/automotive-trends

Script (17 lines)
1. Gus is trying to open a plane door seven miles up, and he's in no danger at all.
2. It's three in the afternoon, he just woke up from a nap, and he thinks it's the bathroom.
3. His wife screams. His neighbor grabs his seat belt.
4. Gus pulls harder. Nothing. He puts a foot on the wall. Still nothing.
5. But wait. Gus isn't that weak. So what's holding the door shut?
6. You see, up here the air outside is thin. It presses a fifth as hard as the air on the ground.
7. So the cabin is pumped up like a tire, and all that air wants out.
8. It leans on every square inch of the door, eight pounds harder than the thin air outside pushes back.
9. And a door has a lot of square inches. Add them up, and you get almost twenty thousand pounds.
10. That is the weight of four cars, parked on the door.
11. Ever pull a suction cup off a window? There's no glue. It's just air pushing on one side.
12. A plane door is a plug, a bit bigger than its hole, so it has to come in before it swings out.
13. To open it, Gus would have to drag in all four cars.
14. Luckily, nobody can do that.
15. Unluckily, he still needs the bathroom, and the door only lets go on the ground.
16. So he tries the next door, the one door on this plane he can open.
17. It's taken.
