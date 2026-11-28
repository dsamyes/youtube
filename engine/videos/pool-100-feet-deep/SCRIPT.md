# "What If Your Pool Was 100 Feet Deep?" — script v1 (2026-11-28)
Format: cartoon-3d-short skill (66.8 s, 235 words, 3.52 words/s, Kokoro am_michael @1.2). Our own characters and story.
Recurring characters: **Gus** (pyjamas, glass fishbowl helmet), his wife, his neighbor.

Model (stated assumptions): a back-garden pool 16 ft x 32 ft dug straight down to 100 ft, fresh water at 20 C,
standard air pressure on top. The air in a beach ball (15 in across) follows Boyle's law. Dirt is counted as it lies
in the ground, a dump-truck load is 10 cubic yards, the hose gives 11 gallons a minute. Every number below is
computed in `calc_video.py` -> `calc.json`; the script exits non-zero if a check fails (16 checks: a second method,
limiting cases, published values).

| # | Fact in the script | Value | Where it comes from |
|---|---|---|---|
| 1 | "a beach ball shrinks to a basketball at the bottom" / "At a hundred, a quarter ... no bigger than a basketball" (headline) | 3.945 atm absolute at 100 ft -> 25.4 % of the volume -> 63.3 % of the width: 15 in -> 9.49 in; a size 7 basketball is 29.5 in round = 9.39 in across | `pressure.abs_atm_at_100_ft`, `ball.volume_fraction_at_100_ft`, `ball.width_at_100_ft_in`, `ball.basketball_width_in`. Source 1: NOAA Diving Program slides / NOAA Diving Manual (34 ft of fresh water = 14.7 psi; 0.432 psi per foot; P1V1 = P2V2 in absolute atmospheres). Source 2: NOAA National Ocean Service (one more atmosphere per 33 ft of sea water) with NASA Glenn (Boyle's law) |
| 2 | "a hundred feet, straight down" | the assumption | `assumptions.depth_ft` |
| 3 | "The dirt fills almost two hundred dump trucks" | 16 x 32 x 100 ft = 51,200 cubic feet = 1,896 cubic yards = 190 loads of 10 cubic yards | `pool.dump_truck_loads`; a standard dump truck carries 10 to 14 cubic yards (truck dealers' and rental guides agree); loose dirt swells by about a quarter, so 12-yard trucks give the same count |
| 4 | "the garden hose runs for over three weeks" | 383,000 gallons at 11 gal/min = 24.2 days | `pool.hose_days`; Iowa State University Extension: 100 ft of 5/8-inch hose at 40 psi delivers 11 gallons a minute |
| 5 | "It won't go under: full of air, it pushes up with sixty pounds" | a 15-inch ball pushes aside 29.0 litres of water: 63.7 lb of lift (Archimedes) | `ball.lift_at_surface_lb` |
| 6 | "a hundred-pound barbell" takes it down | cast iron weighs 86 lb under water, 22 lb more than the ball lifts | `ball.barbell_under_water_lb`, `ball.barbell_minus_lift_lb` |
| 7 | "At thirty-four feet, the ball is half its size" | 2.001 atm -> 50.0 % of the volume | `pressure.abs_atm_at_34_ft`, `ball.volume_fraction_at_34_ft` |
| 8 | "water is heavy" | 62.3 lb per cubic foot at 20 C | calc check; USGS conversion tables (62.4 lb) |
| 9 | "Thirty-four feet of water weigh as much as all the air above your head, right up to space" | one standard atmosphere = 2,116 lb on a square foot = 33.96 ft of fresh water | `pressure.feet_of_fresh_water_per_atmosphere`, `pressure.air_lb_per_sq_ft`; NOAA Diving Program (34 ft fresh water) |
| 10 | "at a hundred feet, the ball carries four skies" | 3.945 atmospheres: the air plus 2.945 atmospheres of water | `pressure.abs_atm_at_100_ft` |
| 11 | "every floor tile, one foot wide, holds up three tons of water" | 100 cubic feet of water = 6,232 lb = 3.12 short tons (with the air on top: 8,348 lb) | `floor.short_tons` |
| 12 | "squeezed air isn't lost ... the ball grows right back" | Boyle's law runs both ways: back at one atmosphere the same air has its first volume | Boyle's law (NASA Glenn) |
| 13 | The pancake stack | the analogy: the bottom of a stack carries the weight of everything above it; pressure at a depth = weight of the column above, per area | hydrostatics (NOAA slides) |

Caveats said nowhere in the film (the description says the main ones):
- "Half its size" and "a quarter" are volumes. In width a quarter of the volume is 63 %; that is the basketball.
- A real vinyl beach ball does not shrink evenly, it crumples and folds; the film draws it wrinkled inside a dashed
  ring of its first size.
- The pool in the picture is drawn much smaller than 16 x 32 ft, and the depth marks are compressed.
- Nobody goes under water in the film. The squeeze works on the air in a swimmer's chest and ears too, which is why
  deep breath-hold diving is dangerous; the description says never to dive deep on a held breath.
- A hundred feet of dirt does not come out with a shovel, and the walls of such a shaft would need engineering.

Opened and read in this run: NOAA National Ocean Service ("For every 33 feet (10.06 meters) you go down, the pressure
increases by one atmosphere"; 14.7 psi at sea level), Iowa State Extension ("A 100 foot long, 5/8-inch diameter hose
will deliver 11 gallons of water a minute", at about 40 psi) and NASA Glenn (Boyle's law: pV = constant at a fixed
temperature). Figures not seen at the primary source: the NOAA Diving Program slides (34 ft of fresh water per
atmosphere, 0.432 psi per foot) were seen as search-result quotes only (the PDF opened without readable text); the
value is also computed here from the density of water (33.96 ft). The USGS table was seen as a search result. The
dump-truck capacity comes from commercial guides.

Sources
1. NOAA Diving Program, Atmospheric and Hydrostatic Pressure (slides): https://www.omao.noaa.gov/sites/default/files/documents/Atmospheric%20and%20Hydrostatic%20Pressure_slides121316.pdf
2. NOAA Diving Program, Boyle's, Charles', Henry's, Dalton's laws (slides): https://www.omao.noaa.gov/sites/default/files/documents/Boyles%2C%20Charles%2C%20Henry%27s%2C%20Daltons%2C%20Gay-Lussacs_Slides121316.pdf
3. NOAA National Ocean Service, How does pressure change with ocean depth?: https://oceanservice.noaa.gov/facts/pressure.html
4. NOAA Diving Manual, 4th edition (2001), chapter 2, Physics of Diving (34 ft of fresh water = one atmosphere)
5. NASA Glenn Research Center, Boyle's Law: https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/boyles-law
6. USGS, conversion factors (a cubic foot of water weighs 62.4 lb): https://pubs.usgs.gov/circ/2004/circ1268/htdocs/text-conversion.html
7. Iowa State University Extension, hose care (11 gallons a minute): https://yardandgarden.extension.iastate.edu/article/1996/6-28-1996/hosecare.html
8. Dump-truck capacity, 10 to 14 cubic yards: https://www.jdpower.com/cars/shopping-guides/how-many-cubic-yards-are-in-a-dump-truck

## Final lines
1. Gus dug a pool so deep that a beach ball shrinks to a basketball at the bottom.
2. It's Saturday morning, and Gus wants the deepest pool on his street: a hundred feet, straight down.
3. The dirt fills almost two hundred dump trucks, and the garden hose runs for over three weeks.
4. His neighbor laughs. Deep water, he says, is just more water.
5. So Gus tests it with a beach ball. It won't go under: full of air, it pushes up with sixty pounds.
6. He ties it to a hundred-pound barbell and lowers it on a rope.
7. At thirty-four feet, the ball is half its size. At a hundred, a quarter: a wrinkled thing no bigger than a basketball.
8. But wait. Nobody is touching it. So what makes it shrink?
9. You see, water is heavy. Think of the bottom pancake in a tall stack: it carries all the others, so it gets squashed.
10. Down there, the ball is the bottom pancake.
11. Thirty-four feet of water weigh as much as all the air above your head, right up to space.
12. So at a hundred feet, the ball carries four skies.
13. And every floor tile, one foot wide, holds up three tons of water.
14. Luckily, squeezed air isn't lost. Gus pulls the rope, and the ball grows right back.
15. Unluckily, Gus can't swim.
16. So of his hundred feet of pool, he uses the top two.
