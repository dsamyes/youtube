# NOTES: lightning-hits-your-plane (daily run, 2026-11-21)

Shared code was not edited. For the owner and whoever maintains the manual:

1. **Topic.** Today's trend file had no fresh everyday "what if you" row that passes the four tests (adverts, GTA 6
   and film rows, body advice; the one physical row is our own first episode), so the topic is a tier A entry of the
   topic bank outside the clusters of the last two episodes. It is the first plane story since 2026-11-14.
2. **The headline number.** "A few volts" is Ohm's law for a typical 30,000 A flash through a seamless aluminium
   tube the size of a 737 fuselage (5.6 V). Real airframes have joints; the published bonding bound (500 V at
   200,000 A) gives at most 75 V. The narration therefore says "only a few volts. Less than a wall socket", true
   for both; the description gives both figures and the assumption. This is the drop along the metal, not what a
   stroke can induce in wiring.
3. **Sources were seen as search results only**; no page was opened in this run. SCRIPT.md lists which figures
   rest on two agreeing results and which (skin thickness, alloy resistivity, dime thickness, cabin humidity) are
   standard reference values that were not looked up.
4. **Voice.** `toon/voice.py` does not know "Gus's" and "amps". The line about the current became "two thousand
   times the current that blows the fuse in his kitchen" (30,000 A against a 15 A household circuit). Pace is
   3.48 words/s, a hair under the 3.5 the manual asks for (the gate accepts 3.45).
5. **Places.** `cabin` is the cabin of plane-door-midflight wrapped in this video's `places.ts`: dark panes in
   front of the windows that flare (`flare`), nothing else changed. `sky` is imported as it is and used under the
   `night` light. Under that light the kit's moon sits top centre of every sky shot; the diagram shots look down
   by about 9 degrees (lens 3.6 m above the look point) to push it out of the frame. With the lens looking down,
   a card lower on the board is further from the lens than one above it: an overlay such as the meter's needle
   needs a z offset of almost a metre or it disappears behind its dial.
6. **Arms in "chair" mode.** Hands raised beside the head are hidden behind the bean head and cross the
   neighbours' faces in a seat row; straight up (`h: [0.38, -1.4]`) reads.
7. **Lightning and the frame checker.** Every strike is a wanted jump: the onsets are listed in `planned_pops`.
   A flicker that toggles a card variant every few frames gives a pop per toggle; the flares here have one onset
   and a smooth decay.
8. **Cartoon licence.** The bolt is drawn landing on the nose and leaving at the tail, the textbook path; real
   strikes also sweep along the fuselage as the aircraft flies on. Gus's fingertip smokes for a second; a real
   static spark leaves nothing.
