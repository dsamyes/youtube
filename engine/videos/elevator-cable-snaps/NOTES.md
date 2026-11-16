# NOTES: elevator-cable-snaps (daily run, 2026-11-16)

Shared code was not edited.

1. **Topic.** The trend file had no fresh everyday "what if you" row that is not already an episode (its top is gift
   adverts, the plane door, Cinderella's slipper and the hole through the Earth), so the topic is the bank's first
   entry, `elevator-cable-snaps`.
2. **Places.** `lift` and `hoistway` are one build (`places.ts`: the car in its shaft) under two names: the lens
   inside the car, or outside it. `sky` is imported from `plane-door-midflight/places.ts` as the board for the
   three diagrams (building and speedometer, governor wheel, wedge on its rail).
3. **Numbers.** "About five feet" is the middle of a range, 3.4 to 7.3 ft, for a 500 ft/min car that stands still
   when the ropes part (free fall to the governor's trip speed, then the stopping distance the code allows). The
   description states the range. ASME A17.1 itself is a paid standard: its formulas and tables were read in
   California's Title 8 (sections 1604.19 and 3042), which prints them; EN 81-20, CTBUH, the jump norms and the
   seat-belt mechanism were seen as search results only. SCRIPT.md lists which.
4. **Film time.** The real fall lasts about a second; the film stretches it over lines 7 and 8 (five seconds, with
   speed lines) like slow motion, and shot 20 shows the true result, five feet below floor 20.
5. **Frame checker.** The moments when the ropes part and when the car stops (bodies switch from floating to
   standing on a camera kick) are declared in `planned_pops`.
6. **Voice.** The aligner could not place the line "Nothing is holding it up. So what stopped it?"; it was reworded
   to "Nothing holds the car up. So why did it stop?".
