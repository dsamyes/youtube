# "What If Both Engines Quit on Your Plane?" — script v1 (2026-11-25)
Format: cartoon-3d-short skill (67.0 s, 236 words, 3.52 words/s, Kokoro am_michael @1.2). Our own characters and story.
Recurring characters: **Gus** (pyjamas, glass fishbowl helmet), his wife, his neighbor.

Model (stated assumptions): an airliner cruising at 38,000 ft loses all thrust in still air and is flown at its
best glide speed. In a steady glide the distance covered per height lost equals the lift-to-drag ratio, so
distance = height x L/D. The script uses L/D = 15, a round and cautious value: published cruise L/D of airliners
is 15 to 19, a real glide with windmilling engines is a little worse (range 12 to 17 carried in `calc.json`).
Time = the sink rate (true airspeed / L/D) integrated through the standard atmosphere at 230 knots. Every computed
number is in `calc_video.py` -> `calc.json`; the script exits non-zero if one of its 11 checks fails.

| # | Fact in the script | Value | Where it comes from |
|---|---|---|---|
| 1 | "seven miles up" | 38,000 ft = 7.20 miles | `height.miles` |
| 2 | "the only thing that stops is his movie" / "it's too small to run the movie screens" | with both engines out the main generators are gone; the ram air turbine feeds only flight controls, their hydraulics and flight-critical instruments | Wikipedia "Ram air turbine"; Air Transat 236 account (the turbine "powered essential sensors and flight instruments" and the primary flight controls) |
| 3 | "The plane isn't dropping." / "engines never held the plane up. The wings do that, and engines only push." | lift comes from the wing moving through the air; thrust only balances drag; in a glide the forward part of the weight does that job | textbook flight mechanics; Wikipedia "Lift-to-drag ratio" |
| 4 | "Ever coast down a hill on a bike? ... It rolls down a hill made of air." | analogy for a steady glide: gravity along the path replaces the engine | - |
| 5 | "For each mile it sinks the plane slides fifteen miles ahead." (headline) | glide ratio 15:1 (assumed; published cruise L/D: A320-200 16.3, 747-400 15.5, 767-200ER 16.1, 777-200 19.3) | `inputs.glide_ratio`; Wikipedia "Lift-to-drag ratio" (table of computed cruise L/D; "L/D will equal distance traveled divided by altitude lost") |
| 6 | "That's flatter than a wheelchair ramp." | glide slope 3.81 degrees against 4.76 degrees for the steepest ramp the ADA allows (1:12) | `glide.slope_deg`, `ramp.slope_deg`; U.S. Access Board, ADA Standards 405.2 |
| 7 | "from seven miles up it glides over a hundred miles" (headline) | 7.20 x 15 = 108 miles (86 to 122 for L/D 12 to 17) | `glide.distance_mi`, `glide.distance_mi_low/high` |
| 8 | "for almost twenty minutes" | 18.4 minutes, mean sink rate about 2,070 ft a minute | `glide.minutes` |
| 9 | "A jet once ran out of fuel and glided seventy-five miles to an island, and they all lived." | 24 August 2001, Airbus A330 over the Atlantic: both engines out about 65 nautical miles (75 miles, 120 km) from Lajes in the Azores, landed 19 minutes later; 306 on board, no deaths (18 injured in the evacuation) | `glide_2001`; Wikipedia "Air Transat Flight 236"; AOPA Pilot, "Dead-stick night landing" (2005); final report of the Portuguese GPIAA |
| 10 | "a little propeller drops from the belly and spins in the wind to power the controls" | ram air turbine: stowed in the fuselage or wing, deploys after a total loss of power, about 80 cm across on most airliners, 5 to 70 kW | Wikipedia "Ram air turbine" |
| 11 | "On a normal flight the pilots pull the engines back to idle a hundred miles out." | rule of three: 3 nautical miles per 1,000 ft, so 114 nmi = 131 miles from 38,000 ft, flown at or near idle thrust; that path is 18:1, about as flat as the glide | `normal_descent`; Wikipedia "Rule of three (aeronautics)"; AOPA Pilot "Turbine Pilot" (1995); NASA TM on idle-thrust FMS descents |
| 12 | "Gus has been gliding home his whole life." | see 11: a normal descent is close to a glide (idle thrust is small but not zero, and the final approach is flown with power) | - |

Caveats kept honest in the wording
- 15:1 is an assumption inside a real range. The 1983 Boeing 767 glide worked out near 12:1, clean narrow-bodies are
  quoted near 17:1. With 12:1 the answer is 86 miles, still more than the 75 miles of the 2001 glide; the
  narration says "over a hundred" for the stated 15:1 and the description gives the range.
- Still air, best glide speed, and a runway inside that circle: over most land there is one, over an ocean there
  may not be. The real 2001 glide had an island; the script says so.
- A double engine failure is a real emergency and extremely rare; the film shows what the aeroplane does, not that
  it is nothing. Nobody is shown hurt; the real flight's evacuation injuries are in the description's numbers.
- Not every airliner has a ram air turbine (the Boeing 737 does without); the line says "a little propeller"
  without "always". It is drawn under the belly; on some types it sits in a wing root or the nose.
- "Pull the engines back to idle": an idle descent still has a little thrust, and the last miles are flown with
  power. "Gliding home" is the joke, with that licence; the description says "close to a glide".
- The ramp and the glide wedge in shot 16 are both drawn four times steeper than they are (same factor), or the
  one degree between them would not show on a phone; the triangle in shot 15 is true to scale.

Seen at the source in this session (pages opened): Wikipedia "Lift-to-drag ratio", "Air Transat Flight 236",
"Ram air turbine", "Rule of three (aeronautics)"; U.S. Access Board guide to ADA chapter 4. Search results only
(pages not opened or refused): AOPA Pilot articles, the GPIAA final report on the FAA site (HTTP 403), the NASA
paper, pilot-forum figures for 12:1 to 18:1. The 230-knot glide speed and the 12:1 figure for the 1983 glide were
not seen at a primary source; they only enter the time estimate and the stated range.

Sources
- Wikipedia, "Lift-to-drag ratio". https://en.wikipedia.org/wiki/Lift-to-drag_ratio
- Wikipedia, "Air Transat Flight 236". https://en.wikipedia.org/wiki/Air_Transat_Flight_236
- GPIAA (Portugal), Accident Investigation Final Report 22/ACCID/GPIAA/2001. https://www.faa.gov/sites/faa.gov/files/2022-11/AirTransat236_AccidentReport.pdf
- AOPA Pilot, "Dead-stick night landing" (November 2005). https://www.aopa.org/news-and-media/all-news/2005/november/pilot/dead-stick-night-landing
- Wikipedia, "Ram air turbine". https://en.wikipedia.org/wiki/Ram_air_turbine
- Wikipedia, "Rule of three (aeronautics)". https://en.wikipedia.org/wiki/Rule_of_three_(aeronautics)
- AOPA Pilot, "Turbine Pilot" (May 1995). https://www.aopa.org/news-and-media/all-news/1995/may/pilot/turbine-pilot-(3)
- U.S. Access Board, Guide to the ADA Standards, chapter 4: ramps (405.2, slope 1:12). https://www.access-board.gov/ada/guides/chapter-4-ramps-and-curb-ramps/
- International Standard Atmosphere (ISO 2533:1975) for the density used in the time estimate.

## Final lines
1. Both engines just quit on the plane Gus is on, seven miles up, and the only thing that stops is his movie.
2. It's three in the afternoon, and Gus is halfway through a movie.
3. Then it all goes quiet and the screen goes black. His neighbor grabs his seat.
4. We'll drop like a rock, yells Gus, but his wife just eats her sandwich.
5. But wait. The plane isn't dropping. Why not?
6. You see, the engines never held the plane up. The wings do that, and engines only push.
7. Ever coast down a hill on a bike? You stop pedaling, and you keep rolling.
8. A plane does the same. It rolls down a hill made of air.
9. And that hill is not steep. For each mile it sinks the plane slides fifteen miles ahead.
10. That's flatter than a wheelchair ramp.
11. So from seven miles up it glides over a hundred miles, for almost twenty minutes.
12. A jet once ran out of fuel and glided seventy-five miles to an island, and they all lived.
13. Luckily, a little propeller drops from the belly and spins in the wind to power the controls.
14. Unluckily, it's too small to run the movie screens.
15. And here's the thing. On a normal flight the pilots pull the engines back to idle a hundred miles out.
16. Gus has been gliding home his whole life. He just never knew it till the movie stopped.
