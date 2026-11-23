# NOTES: gravity-off-5-seconds (daily run, 2026-11-23)

Shared code was not edited. For the owner and whoever maintains the manual:

1. **Topic.** Today's trend file had no fresh everyday "what if you" row that passes the four tests (adverts, GTA 6,
   films, body topics, and the hole through the Earth, which is already made), so the topic is the best unused
   tier A entry of the topic bank outside the clusters of the last two episodes.
2. **The model.** Gravity is off for the people and loose things in the garden; the planet and the air stay. Taken
   literally for the whole Earth, the squeezed rock would spring outward under everyone's feet; the description
   says so in one sentence. The spring-back of soles and cushions is ignored. 40 degrees north.
3. **Cartoon licence.** The five seconds are stretched over half a minute. Gus drifts from his lawn to the
   neighbor's pool (a straight hop comes straight down). A garden pool is too shallow for a ten-metre fall; nobody
   is hurt on screen and the scenario cannot be copied without switching gravity off.
4. **Places.** Two only: the kit garden and "sky" (imported from plane-door-midflight) for the air shots and the
   diagrams. `toon/check.py` warns that 3 to 5 is the sweet spot; the story did not need a third.
5. **Borrowed drawings.** Stopwatch from immortal-snail, teacup from friction-off-5-seconds, pancake and pan from
   the kit. House, hill, ball, tape, ruler, globe, diving tower and pool are in this video's `props.ts`.
6. **Voice.** `toon/voice.py` did not know "Gus's"; line 1 says "the garden" instead. The voice runs 67.7 s, the
   film 68.2 s.
7. **Sources.** No source page was opened in this run; all figures were seen in search results that agree with
   the computed values (SCRIPT.md lists them). The headline number is plain kinematics, checked 17 ways in
   `calc_video.py`.
8. **Sandbox.** `git status` inside the run shows `engine/secrets/*` as deleted and empty dot-files at the
   repository root: that is the sandbox hiding those paths, nothing in this run touched them.
9. **Picture.** Proxy pass and frame check are clean (no black, frozen or pop frames). Declared as planned pops in
   `shots.json`: the chair dropping its ten inches (f1584 to f1590) and the splash (f1879, f1880). Weakest shots:
   the far views (2, 16, 20), where Gus is small on purpose to show the height against the house and the diving
   tower, and shot 5, where the 8 tag rides near the top edge while the lens cranes up after the pancake.
10. **Tools.** The Bash tool stops a background job after ten minutes unless a longer timeout is passed; the first
    contact-sheet run was lost to that. Sheets render one still at a time (about ten minutes for 46 stills).
