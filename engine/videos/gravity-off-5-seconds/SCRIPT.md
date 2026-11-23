# "What If Gravity Switched Off for 5 Seconds?" — script v1 (2026-11-23)
Format: cartoon-3d-short skill (67.7 s, 242 words, 3.57 words/s, Kokoro am_michael @1.2). Our own characters and story.
Recurring characters: **Gus** (pyjamas, glass fishbowl helmet), his wife, his neighbor.

Model (stated assumptions): for five seconds gravity stops pulling on Gus, his wife and the loose things in his
garden. The planet itself and the air stay as they are. Gus's town lies at 40 degrees north. A pancake flip and
Gus's hop are both "one-foot" moves (each would normally rise one foot); the pancake leaves the pan as gravity
lets go and Gus hops one second later. Every number below is computed in `calc_video.py` -> `calc.json`; the
script exits non-zero if a check fails (17 checks: a second integration method, energy, limiting cases, with air
drag, published values).

| # | Fact in the script | Value | Where it comes from |
|---|---|---|---|
| 1 | "one small hop puts Gus higher than his roof" / "he's thirty-two feet up" (headline) | 8.02 ft/s x 4 s = 32.1 ft (9.78 m); 31.2 ft with air drag; a two-storey house is about 25 to 30 ft to the ridge | `flight.rise_ft_when_gravity_returns`, `flight.with_air_drag`. Source 1 for the law: Newton's first law (NASA Glenn: an object in motion keeps its speed in a straight line unless a force acts). Source 2 for the input: Hawkin Dynamics (force-plate article: take-off 2.45 m/s <-> jump height 0.31 m, h = v^2/2g) |
| 2 | "The pancake leaves the pan at eight feet a second and just keeps going" | a flip that would rise one foot: v = sqrt(2 g x 1 ft) = 8.02 ft/s (2.445 m/s, 5.5 mph); with g = 0 the speed stays | `hop.takeoff_ft_s`; the one-foot flip is an assumption |
| 3 | "the Earth spins at eight hundred miles an hour" | 1,040 mph at the equator (2 pi x 6,378 km / 86,164 s) x cos 40 deg = 797 mph | `earth_spin.at_40N_mph`; Sky at Night Magazine / Universe Today (1,037 to 1,040 mph at the equator, times the cosine of the latitude) |
| 4 | "In five seconds the spinning ground sinks ten inches under her chair. That's all." | someone at rest flies on along the tangent; the ground curves away with a = omega^2 R cos(lat) = 0.026 m/s2 toward the axis; the vertical part over 5 s is 1/2 x 0.0199 x 25 = 0.249 m = 9.8 in (16.7 in at the equator); she also drifts 8 in sideways | `earth_spin.ground_sinks_in_5s_in`, checked by exact geometry; University of Illinois Physics Van (3.39 cm/s2 at the equator) |
| 5 | "That hop is good for one foot" | the assumption: a small hop, 0.3048 m | `hop.normal_height_ft` |
| 6 | "gravity is a brake. Roll a ball up a hill and the hill eats its speed ... Take the hill away and the ball rolls on ... as fast as it started" | going up, gravity takes 32 ft/s off the speed every second; with no force the speed stays (first law). The hill is the analogy | Newton's first and second laws (NASA Glenn; any textbook) |
| 7 | "Gus leaves the lawn at eight feet a second and keeps it all. Four seconds later ..." | 8.02 ft/s; he hops 1 s after gravity goes, so 4 s remain | `hop.takeoff_ft_s`, `flight.coast_s` |
| 8 | "The pancake left a second sooner at the same speed, so it stays eight feet out of reach" | lead = 8.02 ft/s x 1 s = 8.0 ft, constant while both coast (and while both fall, without air drag) | `pancake.lead_ft` |
| 9 | "Gus coasts up one more foot and starts down" | with gravity back he rises v^2/2g = 1.00 ft more, to 33.1 ft (10.08 m) | `flight.extra_ft_after_return`, `flight.top_ft` |
| 10 | "that's the height of an Olympic diving tower" | the high platform is 10 m (32.8 ft); his top is 10.08 m | `high_dive.platform_m`; NBC Olympics, Diving 101; World Aquatics facility rules |
| 11 | "He hits the water at thirty miles an hour" | sqrt(2 g x 10.08 m) = 14.06 m/s = 31.5 mph; 30.1 mph with air drag | `flight.landing_mph`; NBC Olympics reports about 50 km/h (31 mph) for 10 m divers |
| 12 | "A moment later the pancake comes down too" | without air drag it stays 8 ft above him: 0.2 s later; a real pancake is slowed by the air and takes longer | `pancake.lead_ft` |

Caveats said nowhere in the film (the description says the main ones):
- "Gravity off" means here: off for the people and loose things in the garden. If the Earth lost its own gravity,
  the rock under the garden, squeezed by the weight of everything above it, would spring outward, and so would
  the air; that is a different and much rougher story.
- Things squashed by weight (shoe soles, grass, a seat cushion, the spine) spring back when the weight goes and
  give whatever rests on them a small push up. It is left out; it would add to the ten inches.
- The ten inches hold for 40 degrees north (17 in at the equator, nothing at the poles).
- The five seconds are stretched over about half a minute of narration. Gus and the pancake are drawn drifting over
  the fence to the neighbor's pool; a straight hop comes straight back down onto the lawn.
- A real back-garden pool is far too shallow for a fall from ten metres; this one is a cartoon pool, and Gus wears
  his fishbowl.

Figures not seen at the primary source: all four sources below were seen as search results (titles and quoted
figures), none was opened; the World Aquatics rule (10 m platform) is quoted through NBC Olympics.

Sources
1. NASA Glenn Research Center, Newton's Laws of Motion: https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/newtons-laws-of-motion/
2. Hawkin Dynamics, Calculate jump height from take-off velocity: https://hawkindynamics.com/blog/calculate-jump-height-from-take-off-velocity (search result: 2.45 m/s -> 0.31 m)
3. NBC Olympics, Diving 101: equipment (the 10 m platform; entries around 50 km/h): https://www.nbcolympics.com/news/diving-101-equipment (search result)
4. University of Illinois Physics Van, Earth's Rotation and Centripetal Acceleration (3.39 cm/s2 at the equator): https://van.physics.illinois.edu/ask/listing/186 (search result)
5. BBC Sky at Night Magazine, How fast does the Earth spin (1,037 to 1,040 mph at the equator; times cos latitude): https://www.skyatnightmagazine.com/space-science/how-fast-does-earth-spin (search result)

## Final lines
1. For five seconds gravity lets go of the garden, and one small hop puts Gus higher than his roof.
2. It's ten on a Sunday morning and Gus is flipping a pancake in his garden.
3. Then gravity switches off. The pancake leaves the pan at eight feet a second and just keeps going.
4. His neighbor yells that the Earth spins at eight hundred miles an hour, so they'll be flung into space.
5. His wife sits still. In five seconds the spinning ground sinks ten inches under her chair. That's all.
6. Don't move, she says. But Gus wants his pancake, so he hops.
7. That hop is good for one foot. So why is he sailing past his chimney?
8. You see, gravity is a brake. Roll a ball up a hill and the hill eats its speed.
9. Take the hill away and the ball rolls on across the floor, as fast as it started.
10. Gus leaves the lawn at eight feet a second and keeps it all. Four seconds later he's thirty-two feet up.
11. The pancake left a second sooner at the same speed, so it stays eight feet out of reach.
12. Then gravity comes back. Gus coasts up one more foot and starts down.
13. Luckily, that's the height of an Olympic diving tower, and the neighbor has a pool.
14. Unluckily, Gus is no diver. He hits the water at thirty miles an hour.
15. A moment later the pancake comes down too, right on Gus.
