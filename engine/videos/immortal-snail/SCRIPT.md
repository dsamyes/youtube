# "What If an Immortal Snail Was Chasing You?" — script v1 (2026-11-17)
Format: cartoon-3d-short skill (62.7 s, 221 words, 3.53 words/s, Kokoro am_michael @1.2). Our own characters and story.
Recurring characters: **Gus** (pyjamas, glass fishbowl helmet), his wife, his neighbor. New: the snail.

Model (stated assumptions, all generous to the snail): the snail crawls at the pace of the fastest snail ever timed
(Guinness World Records: 33 cm / 13 in in 2 min 00 s) and never stops, 24 hours a day, in a straight line; a real
garden snail does about 1 mm/s and rests most of the day. Gus walks at 3 mph with a 0.70 m step and sleeps 8 hours.
The ocean is the North Atlantic, New York (JFK) to London (LHR), great circle. The tap drips once a second, 0.25 mL
a drip, into a standard 40-gallon bathtub.
Every number below is computed in `calc_video.py` -> `calc.json`; the script exits non-zero if a check fails.

| # | Fact in the script | Value | Where it comes from |
|---|---|---|---|
| 1 | "The fastest snail ever timed took two minutes to go thirteen inches" | 33 cm (13 in) in 2 min 00 s: 2.75 mm/s, 0.0062 mph | `inputs`, `snail.speed_mm_s`. Source 1: Guinness World Records, "Fastest snail racing" (page opened: Archie, trainer Carl Bramham, Congham, Norfolk, 1995). Source 2: "Snail racing" encyclopedia article (page opened: 2 minutes over the 13-inch course, 0.006 mph) |
| 2 | "Gus takes one step and the snail needs four minutes to catch up" | 0.70 m / 2.75 mm/s = 255 s = 4.2 min | `gus.one_step_lead_min` |
| 3 | "He walks almost five hundred times faster than it crawls" | 3 mph = 1.341 m/s; 1.341 / 0.00275 = 488 | `gus.times_faster_than_snail`; usual adult walking pace 1.31 m/s (Murtagh et al. 2021) |
| 4 | "Gus has to stop ... The snail never does" | the model's assumption: the snail keeps its pace around the clock | stated assumption (a real snail does not) |
| 5 | "a dripping tap ... leave it for a week and it fills a whole bathtub" | 1 drip/s x 0.25 mL = 21.6 L a day; a 40-gallon (151 L) tub in 7.0 days (a 60-gallon tub: 10.5 days) | `tap.days_to_fill_tub`; USGS Water Science School drip calculator (page opened: 1/4 mL a drip, 15,140 drips a gallon) |
| 6 | "Every night Gus sleeps, the snail gets eighty-seven yards closer" | 8 h x 9.9 m/h = 79.2 m = 86.6 yd | `snail.per_night_of_sleep_yd` |
| 7 | "two hundred and sixty yards a day" | 237.6 m = 259.8 yd | `snail.per_day_yd` |
| 8 | "fifty-four miles a year" | 86.8 km = 53.9 miles | `snail.per_year_miles` |
| 9 | "Gus can win a whole day back with a three-minute walk" | 237.6 m at 3 mph = 177 s = 2.95 min | `gus.walk_that_wins_a_day_back_min` |
| 10 | "one flight across the ocean puts sixty-four years between them" (headline) | New York to London 5,540 km (3,442 miles) / 86.8 km a year = 63.8 years | `ocean.snail_years`. Inputs from two independent sources each: the record (Guinness; the Snail racing article) and the distance (haversine on the airports' coordinates; published calculators give 5,540 to 5,567 km, i.e. 63.8 to 64.1 years) |
| 11 | "snails are very good at hitching a ride" | hitchhiking snails "can attach themselves to almost anything including shipping containers and can survive for months"; live snails are found in air passengers' luggage | USDA APHIS; US Customs and Border Protection (Houston 2021, page opened; Detroit 2023) |
| 12 | a billion dollars, the deal, "one touch means game over", nine in the morning, the beach, the suitcase | story (the well-known thought experiment; our own telling) | - |

Caveats kept honest: everything rests on the record pace held around the clock, which no snail does; with the usual
1 mm/s the ocean would take about 175 years, so "sixty-four years" is the least the flight buys. "Four minutes" is a
0.70 m step (4.2 min). "A week" is a 40-gallon tub; bigger tubs take up to 12 days. The snail "catching the flight"
is the joke; that snails travel as stowaways is the fact.
Not seen at the primary source in this session (search results only): Murtagh et al. 2021 (1.31 m/s), the APHIS
article on hitchhiking snails, the CBP Detroit release, and the published JFK-LHR distances (several calculators
agree within 0.5 %; the film's figure is computed from the coordinates).

Sources
- Guinness World Records, "Fastest snail racing". https://www.guinnessworldrecords.com/world-records/70393-fastest-snail-racing
- "Snail racing" (World Snail Racing Championships, Congham). https://en.wikipedia.org/wiki/Snail_racing
- Murtagh E. M. et al., "Outdoor walking speeds of apparently healthy adults: a systematic review and meta-analysis", Sports Medicine 51 (2021).
- USGS Water Science School, drip calculator. https://water.usgs.gov/edu/activity-drip.html
- Great-circle distance JFK to LHR. https://www.airmilescalculator.com/distance/jfk-to-lhr/
- USDA APHIS, Plant Protection Today: "USDA's Snail Study Benefits From Collective Efforts". https://www.aphis.usda.gov/news/agency-announcements/plant-protection-today-usdas-snail-study-benefits-collective-efforts
- US Customs and Border Protection, "CBP seizes 15 live African snails" (Houston, 2021). https://www.cbp.gov/newsroom/local-media-release/cbp-seizes-15-live-african-snails

Script (16 lines)
1. Gus has a billion dollars, and he's running away from a snail.
2. It's nine in the morning in the garden, and the deal is simple.
3. He keeps the money. But a snail that can't die will follow him forever, and one touch means game over.
4. His wife laughs. It's a snail. His neighbor steps right over it. Just walk away.
5. And they've got a point. The fastest snail ever timed took two minutes to go thirteen inches.
6. Gus takes one step and the snail needs four minutes to catch up.
7. He walks almost five hundred times faster than it crawls.
8. So why can't Gus sleep at night?
9. You see, Gus has to stop. He eats. He naps. He sleeps. The snail never does.
10. It's like a dripping tap. One drop is nothing, but leave it for a week and it fills a whole bathtub.
11. Every night Gus sleeps, the snail gets eighty-seven yards closer.
12. That's two hundred and sixty yards a day, and fifty-four miles a year.
13. Luckily, Gus can win a whole day back with a three-minute walk.
14. And one flight across the ocean puts sixty-four years between them.
15. Unluckily, snails are very good at hitching a ride.
16. So Gus lands on a sunny beach with a billion dollars, one suitcase, and one very patient snail.
