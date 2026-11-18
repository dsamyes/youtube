# NOTES: jump-on-a-cloud (daily run, 2026-11-18)

Shared code was not edited. For the owner and whoever maintains the manual:

1. **Topic.** Today's trend file had no fresh everyday "what if you" row that passes the four tests (the top of
   `youtube_shorts` is "Comment X if you want one" adverts; the snail and the slipper are made), so the topic is the
   best unused tier A entry of the topic bank outside the last two clusters.
2. **The model.** A cube-shaped fair-weather cloud 1 km on a side with 0.5 g of water per cubic metre (the USGS
   example). Gus steps off at rest right at the top, so the fall takes 22 s (18.6 s for someone already at 120 mph).
   "One cup of water" is the water lying in the column he sweeps (0.5 m2 x 1 km); much of it flows around him with
   the air, so it is an upper bound. The description says both.
3. **"By evening the cloud has made plenty"** is story, not a computed fact: a fair-weather cumulus may or may not
   grow into a shower cloud. The million droplets per raindrop is the textbook figure.
4. **Safety.** Gus wears a parachute harness from the moment he decides to go, the canopy opens on screen and he
   lands on his feet. Real skydivers are not allowed to fall through cloud (14 CFR 105.17); the description says so.
5. **Places.** "sky" is imported from plane-door-midflight (`places.ts`); "cloud" is the same empty place registered
   under a second name and wrapped in white by a card (it has its own acoustics in the sound plan). The stopwatch
   and the number tag are imported from immortal-snail (`props.ts`). The cloud, the balloon, the elephants, the
   fridge, the droplet and the rain are cards in this video's `props.ts`.
6. **Voice.** The first take had one sample peak on "Luckily" that clipped the voice stem after the master gain; a
   comma after "Luckily" removed it. One music dip (-6 dB over frames 762 to 778) keeps the stem clean under
   "Gus jumps". `toon/voice.py` could not align "So Gus straps on a parachute ... floats up above it"; the line was
   reworded.
7. **Kit observations.** The kit's `cloud()` cards (soft) placed nearer than about 2 m to the lens in the garden
   render as hard white slabs with stray lines; the fog in shot 18 uses this video's own wisp cards instead.
   `scripts/toon-sheet.py --frames` overwrites `sheet_x01.jpg` on every call.
8. **Sources.** The USGS page and the LibreTexts chapter were opened; the Library of Congress page, the UW lecture
   table, the FAI/USPA fall speed and 14 CFR 105.17 were seen as search results only (SCRIPT.md lists them).
