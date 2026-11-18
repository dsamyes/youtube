# "What If You Jumped on a Cloud?" — script v1 (2026-11-18)
Format: cartoon-3d-short skill (65.7 s, 228 words, 3.47 words/s, Kokoro am_michael @1.2). Our own characters and story.
Recurring characters: **Gus** (pyjamas, glass fishbowl helmet), his wife, his neighbor.

Model (stated assumptions): a small fair-weather cumulus, a cube 1 km on a side with 0.5 g of liquid water per cubic
metre (the USGS example cloud); droplets 20 micrometres across, a raindrop 2 mm across; Gus weighs 80 kg, steps off
a balloon at rest right at the cloud top and falls belly-down toward the usual 120 mph. Bigger clouds are wetter and
thicker (a thundercloud holds several times as much per cubic metre), so the film says "a fat little cloud".
Every number below is computed in `calc_video.py` -> `calc.json`; the script exits non-zero if a check fails.

| # | Fact in the script | Value | Where it comes from |
|---|---|---|---|
| 1 | "A cloud weighs more than a million pounds" (headline) | 0.5 g/m3 x 1 km3 = 500,000 kg = 1,102,311 lb | `cloud.water_lb`. Source 1: USGS Water Science School (page opened: "about 0.5 gram per cubic meter", "1 km3 cloud contains 1 billion cubic meters", "about 500,000 kilograms or 1.1 million pounds (about 551 tons)"). Source 2: Library of Congress, Everyday Mysteries, "How much does a cloud weigh?" (search result only: the same 1.1 million pounds, after NCAR's Margaret LeMone) |
| 2 | "It holds five hundred tons of water" | 500 metric tons (551 US short tons) | `cloud.water_tonnes`, `cloud.water_short_tons` |
| 3 | "as much as a hundred elephants" | 500,000 kg / 5,000 kg = 100 | `cloud.elephants`; 5 t is a middling adult African elephant (bulls about 6 t, cows about 3 t); LeMone's own comparison is "100 elephants" |
| 4 | "He doesn't bounce. He doesn't even slow down." | the droplets in a cubic metre weigh 0.5 g, the air in it 1.06 kg: 2,120 times more | `cloud.air_is_times_heavier_than_its_droplets` |
| 5 | "He falls through the whole thing in twenty-two seconds" | 1,000 m from rest with air drag toward 120 mph: 22.4 s (18.6 s if already at full speed, 14.3 s with no air) | `fall.seconds_through_cloud_from_rest`; 120 mph belly-to-earth: FAI skydiving commission ("about 200 km/h"), USPA Skydiver's Information Manual (both seen as search results) |
| 6 | "A piece the size of your fridge holds just ten drops of water" | 1.0 m3 (a big fridge, 0.9 x 0.7 x 1.6 m outside) x 0.5 g = 0.5 mL = 10 drops of 0.05 mL | `fridge.drops`; the metric drop is 1/20 mL |
| 7 | "each droplet ... sinks half an inch a second" | Stokes' law, 20 um droplet: 1.25 cm/s = 0.49 in/s | `droplet.fall_speed_inch_s`; university lecture tables give 0.01 m/s for a 20 um droplet (search result) |
| 8 | "the faintest breeze holds it up" | fair-weather updrafts are of the order of 1 m/s, eighty times the droplet's sinking speed; in still air it would need 22 hours for 1 km | `droplet.hours_to_sink_1_km_in_still_air` |
| 9 | "Ever walked through fog? That's a cloud that sat down." | fog is a cloud whose base is at the ground | definition (NOAA / WMO cloud atlas: fog is a stratus cloud at the surface) |
| 10 | "In his whole fall Gus runs into one cup of water" | the column he sweeps: 0.5 m2 x 1,000 m = 500 m3 x 0.5 g = 250 g = 1.06 US cups | `fall.water_in_his_path_cups`; 0.5 m2 is also the drag area that gives 120 mph for 80 kg (`fall.drag_area_m2_for_120_mph` 0.51) |
| 11 | "a million of those droplets make one raindrop" | (2 mm / 20 um)^3 = 1,000,000 | `droplet.droplets_per_raindrop`; Atmospheric Processes and Phenomena, ch. 7.2 (page opened: "it takes 1 million cloud droplets (10 um radius) ... to make one single raindrop (1 mm radius)") |
| 12 | "by evening the cloud has made plenty" | story: fair-weather cumulus that keeps growing in the afternoon can become a shower cloud | not a number |

Caveats said nowhere in the film: one cup is what lies in his path; much of it flows around him with the air. Real
skydivers must stay clear of clouds (United States: 14 CFR 105.17), because nobody can see through one. The balloon
and the garden are story, not advice.

Sources
1. USGS Water Science School, "The atmosphere and the water cycle" / "How much does a cloud weigh?": https://www.usgs.gov/water-science-school/science/atmosphere-and-water-cycle (opened)
2. Library of Congress, Everyday Mysteries, "How much does a cloud weigh?": https://www.loc.gov/everyday-mysteries/meteorology-climatology/item/how-much-does-a-cloud-weigh/ (search result)
3. Atmospheric Processes and Phenomena (University of Hawaii, LibreTexts), 7.2 Cloud Droplets: https://geo.libretexts.org/Bookshelves/Meteorology_and_Climate_Science/Atmospheric_Processes_and_Phenomena/07%3A_Precipitation_Processes/7.02%3A_Cloud_Droplets (opened)
4. University of Washington ATM S 101 lecture 21, table of drop sizes and fall speeds (20 um: 0.01 m/s): https://atmos.uw.edu/academics/classes/2003Q2/101/lect21_overheads.pdf (search result)
5. FAI Skydiving Commission, speed skydiving ("in a stable, belly-to-earth position, terminal velocity of the human body is about 200 km/h"); USPA Skydiver's Information Manual (search results)
6. 14 CFR 105.17, flight visibility and clearance from cloud requirements for parachute operations (search result)
7. Stokes' law for the terminal speed of a small sphere, air viscosity 1.75e-5 Pa s; ISA air density at 1.5 km (textbook values, used in `calc_video.py`)

## Final lines
1. A cloud weighs more than a million pounds and it can't hold up one man in pajamas.
2. It's two on a Sunday afternoon and Gus lies in his garden staring at a fat little cloud.
3. It looks like the softest bed in the world.
4. His wife says it's just fog and his neighbor bets he'll bounce.
5. So Gus puts on a parachute, borrows a balloon and rides up above the cloud.
6. Up close the cloud looks solid. It holds five hundred tons of water, as much as a hundred elephants.
7. Gus jumps.
8. He doesn't bounce. He doesn't even slow down.
9. He falls through the whole thing in twenty-two seconds and all he sees is white.
10. So where are the hundred elephants?
11. You see, a cloud is huge. A piece the size of your fridge holds just ten drops of water.
12. The rest is air. Each droplet is so tiny that it sinks half an inch a second, so the faintest breeze holds it up.
13. Ever walked through fog? That's a cloud that sat down.
14. In his whole fall Gus runs into one cup of water.
15. Luckily, his parachute opens and he lands in his own garden, barely damp.
16. Unluckily a million of those droplets make one raindrop and by evening the cloud has made plenty.
17. Gus couldn't land on the cloud. So the cloud lands on Gus.
