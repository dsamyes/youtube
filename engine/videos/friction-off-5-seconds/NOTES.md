# NOTES: friction-off-5-seconds (daily run, 2026-11-20)

Shared code was not edited. For the owner and whoever maintains the manual:

1. **Topic.** Today's trend file had no fresh everyday "what if you" row that passes the four tests (adverts, GTA 6
   and film rows, body advice; the infinity-pool row is a fall a child could copy, as the run of 2026-11-18 already
   judged), so the topic is the best unused tier A entry of the topic bank outside the last two clusters.
2. **The model.** Only friction between solid surfaces is off; gravity and air stay. The lawn has the slope the
   International Residential Code asks for beside a house (6 inches in 10 feet) and keeps it for the whole 20 feet.
   Real lawns are often flatter away from the house; the description states the assumption. "Half an inch a foot"
   is the round figure for 0.6 inch.
3. **Cartoon licence.** The five seconds are stretched over about 25 seconds of narration. Gus's flight after his
   feet stop is drawn long and flat; a real stumble at 5.5 mph is over in half a second. The pot gets a light push in
   shot 8, so strictly it would end a little further than the rest. Shot 12 (the drift) uses the real acceleration
   in real time (0.49 m/s2).
4. **The brushes.** Two brushes with meshing bristles are the usual classroom picture of friction. Real friction is
   also sticking at the tiny contact points, not only interlocking; SCRIPT.md says so, the film does not.
5. **Safety.** The story stays in one garden: no roads, no cars, nobody on the ladder. Gus belly-flops onto grass
   inside his fishbowl, sits up, and ends the film beaming.
6. **Places.** Two only: the kit garden and "sky" (imported from plane-door-midflight) as the board for the two
   diagrams. `toon/check.py` warns that 3 to 5 is the sweet spot; the story did not need a third.
7. **Borrowed drawings.** Stopwatch, number tag, sweat and water drop from immortal-snail (`props.ts`), the iron
   weight from plane-door-midflight, the feather from the kit. Pot, saucer, cup, ladder, house diagram, ruler
   triangle, rain cloud, brushes and magnifying glass are in this video's `props.ts`.
8. **Voice.** `toon/voice.py` did not know "hairbrushes" (now "brushes") and could not align "And the pot is twenty
   feet from where he wanted it" nor "The pot ends up twenty feet from where he wants it"; the line became "And his
   pot? It stops twenty feet too far."
9. **Sources.** Opened: the LibreTexts chapter on inclined planes (a = g(sin(theta) - mu cos(theta)), mass
   eliminated) and InterNACHI's page quoting IRC R401.3 ("not fewer than 6 inches within the first 10 feet"). The
   ICC's own page and a municipal copy answered 403. The ladder, asperity and knot sources were seen as search
   results only (SCRIPT.md lists which). The headline number is plain kinematics on the code's slope, checked
   twelve ways in `calc_video.py`.
