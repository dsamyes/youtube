# "What If the Elevator Cable Snapped?" (2026-11-16)

Format: cartoon-3d-short skill, 66.0 s of narration, 233 words, 16 lines, Kokoro am_michael at 1.2. Our own story and
characters: Gus and his neighbor. Topic from the bank (`elevator-cable-snaps`).

## Facts

Every number the narrator says is computed in `calc_video.py` (written to `calc.json`) from inputs taken from the
elevator code. Assumptions, said once here: a traction passenger elevator rated 500 ft/min (2.5 m/s, usual for a
building of about twenty floors) on six hoist ropes, standing at the twentieth floor when all ropes part at once.

| Line | What is said | Value | Where it comes from |
|---|---|---|---|
| 1, 15 | you'd fall about five feet | 3.4 to 7.3 ft, middle 5.4 ft | `calc.json: total_fall_ft, total_fall_mid_ft`: free fall from rest to the governor's trip speed (625 ft/min = 3.18 m/s: 1.69 ft in 0.32 s) plus the stopping distance the code allows for the safeties at that speed (1 ft 8 in to 5 ft 8 in). Sources 1, 2 |
| 3 | six steel ropes | 6 | assumption (traction elevators have at least 3, commonly 4 to 8). Source 3 |
| 3 | any one of them could carry it fully packed | one rope = 1.71 loaded cars | `calc.json: one_rope_holds_loaded_cars` = factor of safety 10.25 (passenger, 500 ft/min) / 6 ropes; the factor is defined on the car with its rated load. Source 3 |
| 5 | a fall from the twentieth floor ends at seventy-six miles an hour | 76.0 mph | `calc.json: fall_from_20th_mph`: free fall, no air, 19 storeys of 3.1 m = 58.9 m. Storey height: source 6 |
| 5 | his best jump is six | 6.3 mph | `calc.json: jump_takeoff_mph`: take-off speed of a 16 in (0.41 m) standing jump, the low end of the usual 16 to 20 in for adult men. Source 7 |
| 7 | Gus floats | weightless for 0.32 s | `calc.json: free_fall_to_trip_s`: until the governor trips the car is in free fall |
| 8 | one second later the car just stops | 0.65 to 1.25 s, middle 0.95 s | `calc.json: total_time_s`: free fall 0.32 s plus braking at 1.0 g to 0.35 g. Sources 1, 2 |
| 10 | a little wheel spins as fast as the car moves; too fast, its weights fly out and trip a brake | overspeed governor: a sheave driven by its own rope fixed to the car; flyweights trip it at the set overspeed (625 ft/min for a 500 ft/min car) | Sources 1, 4 |
| 11 | pull a seat belt slowly and it runs, yank it and it locks | the retractor's webbing-sensitive lock is a centrifugal clutch: a weighted lever on the spool swings out when the spool spins fast and drives a pawl into the ratchet | Source 8 |
| 12 | two steel wedges under the car jam against its rails; the harder the car pulls, the harder they bite | car safeties: wedge (or roller) jaws on each guide rail, self-tightening by the car's own weight | Sources 1, 2, 5 |
| 13 | no power, no computer | the classic governor and safeties are purely mechanical | Sources 1, 5 |
| 14 | they only let go when somebody lifts the car | a set safety is released by moving the car up | Source 1 (section 1604.19(h)(3)) |

Self-checks in `calc_video.py` (it exits 1 when one fails): the two stopping-distance formulas reproduce the code's
table row for 500 ft/min (1 ft 8 in and 5 ft 8 in) within an inch; their constants are 2 x a x 3600 for a = 1.0 g and
0.35 g; the energy of the free fall closes; one rope holds more than one loaded car; the spoken numbers lie inside
the computed ranges; a 1 m drop gives the textbook 4.43 m/s.

Caveats. "About five feet" is the middle of a range (3.4 to 7.3 ft) that depends on how hard the safeties are set
and on the rated speed; a slower elevator falls less. The car is assumed to be standing (a car already moving down
trips sooner). The 76 mph is the neighbor's imagined free fall with no brakes and no air. Not said in the film: a
counterweight, a spring or oil buffer in the pit, and the air cushion in the shaft add further protection.

## Sources

1. California Code of Regulations, Title 8, section 1604.19 (car safeties and governors; it prints the ASME A17.1
   stopping-distance formulas S = V^2/81,144 + 0.84 and S' = V^2/231,840, the table of governor trip speeds and
   stopping distances, and the release of safeties by moving the car up). Read at https://www.dir.ca.gov/Title8/1604_19.html
2. ASME A17.1 / CSA B44, Safety Code for Elevators and Escalators, sections 2.17 (car safeties) and 2.18 (speed
   governors), Table 2.18.2.1. Not seen at the primary source (paid standard); the figures are those printed in
   source 1. Europe's EN 81-20 gives the same picture (average braking between 0.2 g and 1.0 g), seen in Elevator
   World, "Progressive Safety Gears and Engineering", https://elevatorworld.com/?p=77832 (search result).
3. California Code of Regulations, Title 8, section 3042, Table 3042E1 (minimum factors of safety of suspension
   ropes: 10.25 for passenger elevators at 500 ft/min; at least three ropes on a traction elevator). Read at
   https://www.dir.ca.gov/Title8/3042.html (the same table as ASME A17.1 Table 2.20.3, not seen at ASME).
4. Elevator World, "A17/B44 Type B Safety Stopping", parts one and two, https://elevatorworld.com/?p=23589 (search result).
5. US patent 6,176,350, "Progressive safety gear" (how wedge safeties grip and how a downward grip is released by
   lifting), https://patents.google.com/patent/US6176350 (search result).
6. CTBUH tall building height calculator: 3.1 m floor to floor for residential buildings (search result of a copy;
   the calculator itself was not opened).
7. Standing vertical jump of adult men: 16 to 20 in (Topend Sports norms, https://www.topendsports.com/testing/norms/vertical-jump.htm);
   about 17.7 in mean for men aged 20 to 49 (NHANES, as quoted in the search results). Search results only.
8. HowStuffWorks, "How Seatbelts Work" (the retractor's centrifugal clutch), https://auto.howstuffworks.com/car-driving-safety/safety-regulatory-devices/seatbelt3.htm (search result).

## Script (16 lines)

1. If every cable on your elevator snapped at once, you'd fall about five feet.
2. It's Monday morning, and Gus steps into the elevator on the twentieth floor, with his neighbor.
3. Above them, six steel ropes hold the car, and any one of them could carry it fully packed.
4. The neighbor has a plan anyway. If they ever snap, just jump at the last second.
5. Gus does the math. A fall from the twentieth floor ends at seventy-six miles an hour. His best jump is six.
6. And right then, all six ropes snap.
7. The car drops. Gus floats. The neighbor gets ready to jump.
8. And one second later, the car just stops.
9. But wait. Nothing holds the car up. So why did it stop?
10. You see, a little wheel spins as fast as the car moves. Spin it too fast, and its weights fly out and trip a brake.
11. Ever yanked a seat belt? Pull it slowly, and it runs. Yank it, and it locks.
12. The brake is two steel wedges under the car. They jam against its rails, and the harder the car pulls, the harder they bite.
13. Luckily, they need no power, no computer, and no luck.
14. Unluckily, they only let go when somebody lifts the car.
15. So the cables snapped, and Gus fell five feet. He's fine.
16. He's just stuck between floors, with a neighbor who still wants to jump.
