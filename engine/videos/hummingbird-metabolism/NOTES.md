# NOTES: hummingbird-metabolism (dress rehearsal of the daily run, 2026-11-14)

Every spot where the manual (`engine/PRODUCER.md`), the skill, the kit README, the audio README or a shared tool
was wrong, missing, ambiguous or cost time. Format: file / what I expected / what was true / what I did.
"Cost" is wall-clock time lost. Shared code was not edited.

## Run log (wall clock, 4 cores, this machine)

| Step | Budget in PRODUCER.md | Used |
|---|---|---|
| read manual, skill, style bible, kit and audio READMEs, the example | (none given) | 5 min |
| topic, facts, script | 30 min | 12 min |
| voice (3 runs) and shot plan | 15 min | 8 min |
| picture: code, 1 full sheet + 4 partial sheets | 110 min | 45 min |
| proxy render and frame check: 1 full pass (27 min) + 3 partial passes (11, 10, 2 min) | "about 20 min" | 50 min, overlapping the sound and the notes |
| sound (3 builds of 38 s), metadata, ledger | 25 min | 6 min |
| final contact sheets | (not in the budget) | 9 min |

The picture budget is generous; what is not in the budget is the waiting: every look at the film costs 8 minutes
(sheets) or 10 to 27 minutes (proxy), and the frame checker needed three rounds.

## Top five by time lost

1. **Frame-checker pops caused by things the kit README recommends** (items 26, 27, 28): kicks in quiet shots, a
   head tilt on a blinked expression change. One partial proxy round, 11 min.
2. **Fading a soft effect card with `gain` gives a dark blob** (item 31), visible only in the QA numbers. One more
   partial proxy round, 10 min.
3. **Geometry the kit README leaves out** (items 14, 17, 18, 19): the park is mirrored, a portrait frame is 0.41 x the
   lens distance wide, `top` is not the top of the head, where the boat's oar is. Most of the first sheet round
   (8 min) and two partial sheets (10 min) went into framing that a table of numbers would have given.
4. **Waiting that the manual does not plan for** (items 20, 22): the sheets run 8 min 20 s in the foreground, the
   proxy 27 min instead of 19-20.
5. **Script length cannot be planned from word counts** (item 1): three voice runs and two rewrites, 6 min; and
   **a hand prop that reaches the face is hidden by the head** (item 13), which broke the hook image until the
   second sheet.

## A. Topic, facts, script, voice

1. **PRODUCER.md §3-4: word count and pace cannot be planned from the manual. Cost: 3 voice runs + 2 rewrites, ~6 min.**
   Expected: a script inside "205 to 245 words" lands inside "55 to 68 s, 3.5 to 3.9 words/s".
   True: Kokoro at speed 1.2 speaks about 5.4 syllables a second plus about 0.3-0.6 s per comma or full stop. A topic with
   long words (hummingbird, metabolism, hamburger, temperature) gave 241 words = 72.6 s = 3.32 words/s on the first run.
   The example short averages 1.3 syllables a word; mine had 1.55.
   Did: fitted a syllable model on the first run's `lines.json`, swapped long words for short ones (hamburger -> burger,
   "temperature climbs" -> "heats up"), cut 9 words and two commas; third run 66.2 s, 3.50 words/s.
   Fix: say in §3 "at most about 320 syllables; a comma or full stop costs about half a second", or give
   `toon/voice.py --estimate` that prints the predicted length from the text without running the TTS (a run is 46 s).

2. **PRODUCER.md §4 vs `toon/check.py`: different pace limits.** Manual: 3.5 to 3.9, "no line slower than 3.0".
   `check.py` accepts 3.45 to 3.95 and never looks at single lines. My 3.50 passes both, but a run at 3.47 would pass
   the gate and break the manual. Did: aimed at the manual's number.

3. **PRODUCER.md §2 "verify ... with web search": half of the sources could not be opened. Cost: ~3 min.**
   Expected: read the abstract of each paper. True: `audubon.org` and `sora.unm.edu` do not resolve from this machine
   (network allow-list); only search-result snippets were available, and the tool says to stop trying further hosts.
   Did: took the numbers from the snippets (Powers & Nagy 1988: 32 kJ/day at 4.48 g; Powers & Conley 1994: 29.1 and
   81.7 kJ/day), cross-checked them against each other in `calc_video.py`, and listed in `SCRIPT.md` which figures were
   not seen at the primary source. Fix: the manual should say what to do then (accept snippets? prefer facts with two
   snippet sources? which hosts are reachable on the runner?).

4. **PRODUCER.md §1: "A subject that shows up in two sources at once" could not be applied.** The trend file had no
   Google Trends, no Wikipedia and only NASA headlines (`failed` lists 7 sources). Did: used "two rows of the same
   theme inside youtube_shorts". The manual has a rule for "no trend file, or an empty one" but none for a partial one.

5. **PRODUCER.md §1 gives no rule for a giant channel's row.** The top row (3.95M views/day) is from a channel whose
   every upload gets that; the next real "what if you" row is from a small channel (plane door, 2.16M/day), which says
   more about the topic's own pull. Did: took the top row because it is drawable with the kit; recorded the plane door
   as rejected with the reason (two new places). Fix: add subscriber count or "views vs the channel's median" to the
   trend rows, or say how to weigh it.

6. **PRODUCER.md §1.4 "Take the theme, never the video" vs §8 "phrased the way this week's winning titles are
   phrased".** For a theme that IS one video ("What If Humans Had Hummingbird Hearts") the two pull against each other.
   Did: own angle (energy and heat, not the heart), own title ("...a Hummingbird's Metabolism?"), the searched phrase
   only in the tags.

7. **No tool turns `words.json` into frames.** §5 wants every cut 0-3 frames before a word; `words.json` is in seconds.
   Did: a five-line script that prints `word@frame` per line. Fix: let `toon/voice.py` print that table (or write
   `voice/frames.txt`).

## B. Shot plan and sound

8. **`toon/audio/build.py --check` refuses to look at `shots.json` until `audio/score.json` exists.** §5 says to write
   the events "while you plan the shots" and §7 writes the score later, so the events cannot be validated when they
   are written. Did: wrote the score earlier than planned. Fix: `--check` should validate the events alone.

9. **audio README, waltz: the rule is only in the error message, and the first message is misleading. Cost: 3 check runs.**
   The README says waltz takes "none, or exactly three [pick-up, low point, rest]". True, and not written anywhere:
   the low point must be at least two bars (about 3 s) after the pick-up, and the rest must be within 1.2 s of the
   section's end. The first error read "needs at least 3.0 s at tempo 128; this section is 8.2 s", which says the
   opposite of what is wrong. Did: moved the low point to "baked potato" and ended the section 9 frames after the rest.

10. **audio README rule 7 forbids `heartbeat` over music, and it stops at 200 bpm.** A story about a heart beating
    1,200 times a minute has no fitting sound. Did: `typing` (fast ticks, 1.4 s) with a note saying what it stands for,
    then `power_up` for "that's a hum". There is also no laugh, no stomach rumble (used `bubbling`) and no hum/buzz.

11. **shots.json has two different "one event type, many meanings" traps.** `T.at("whoosh", 1)` is the second
    whoosh in the file, so deleting or adding one event of a type silently shifts every later index. I removed two
    whooshes while writing the plan and two constants pointed at the wrong frames until I listed all events by type.
    Fix: allow `{"f": 495, "type": "whoosh", "id": "flip1"}` and `T.at("flip1")`.

## C. Picture: kit and its README

12. **kit README §3 "entry.tsx: keep it as the template has it" contradicts §9 "`dress: ...` in the story object".**
    The story object is built in `entry.tsx`, so adding a 3D prop or a place means editing it. Did: added `dress` there.

13. **kit README §6: a hand prop that reaches the character's own face disappears. Cost: one render round on 2 shots.**
    Expected: `prop` + `front: true` draws the held thing over the body, so a burger lifted to the mouth is seen.
    True: the head is drawn after the arms; the burger vanished behind his own head on the bite frames of the hook.
    Did: the burgers of the hook and of the last shot are effect cards placed on the hand anchor
    (`g.at(g.A.L, 0.07)`), which sit in front of everything. Side effect: effect cards are unlit, so at night they need
    `gain: 0.6` by hand. Fix: say so in §6, or give `Arm.over: true` (drawn after the head).

14. **kit README §4, park: "cameras stand south of it and look toward +z" does not say that screen right is then -x.**
    Every offset I wrote for the park (feeder beside the bird, flame at the tail, camera look) was mirrored; the
    feeder hung on the wrong side and out of frame. Cost: one render round on 2 shots. Fix: one sentence in §4, and a
    helper `screenRight(c)`.

15. **kit README §6 expression list does not say what the faces look like.** `neutral` is a deadpan, half-lidded face
    (right for the wife, wrong for a puzzled Gus); `dazed` is spiral eyes; `chew` has happy closed eyes, so "eats
    while exhausted" cannot be shown. Found each on a contact sheet. Fix: a sheet of all 20 faces in the kit folder
    (one PNG), named in §6.

16. **kit README §6: the `fork` prop cannot be empty** (arg 0 raw, 1 burning, 2 burnt: always a sausage). The gag
    "loses every sausage" needed an empty fork. Did: copied the fork drawing without the sausage into my folder as
    `PROPS.forkEmpty`. Same for `thermo`/`plate`: fine as they are.

17. **kit README §6 anchors: `top` is not the top of the head.** It is 0.3 head heights above the crown (0.14 m), and
    for the fisherman the sou'wester ends 0.09 m below it. A bird "on his hat" floated 0.15 m above it. Also not
    written: `head` is the head centre, the fishbowl's centre is 1.2 cm above it and its radius is 0.33 m (needed to
    fog the glass). Did: measured on stills. Fix: one line per anchor in §6.

18. **kit README §4, ocean: nothing about where the boat's oar, bow and lantern are, and by day the lantern's halo
    stays on.** A swimmer placed "beside the boat" at x 0.42 had the oar blade across his forehead, and in the wide
    by day a white glow sits behind the fisherman's head. Did: moved Gus in front of the bow (z 2.3) and staged the
    sea shots in depth (Gus near, boat behind). The halo cannot be switched off from a video folder; it stays.
    Fix: list the boat's extents in §4 and add `lantern: false` (or let the light preset dim it).

19. **kit README never says the frame is narrow.** At fov 40 a 1080x1920 frame is only 0.41 x the lens distance wide
    (1.7 m at 4.2 m). Three of my first two-shots clipped a character at the edge. §4's "framings that work" are all
    single subjects. Fix: add the number, and one two-shot recipe ("subjects at most 1.0 m apart at 4.3 m").

20. **`scripts/toon-sheet.py` runs in the foreground for 8 min 20 s (README says 7).** PRODUCER.md §6 only tells you
    to background the proxy render. Did: started later sheets with nohup and wrote the facts table, the score and the
    metadata meanwhile. Fix: say "start it in the background" in §6.3, and let the sheet take `--shots 3,13`.

21. **`toon-sheet.py` picks its two frames per shot from the events ("2 frames after the shot's first one-off
    event").** That frame is often mid-blink (the kit blinks across every expression change) or inside a burst, so the
    face on the sheet is a half-closed eye and the prop is behind a star. Did: a second sheet with `--frames` chosen
    6-10 frames after each action. Fix: pick the action frame + 8.

22. **kit README §10 / PRODUCER.md §6.4: the proxy takes longer than written.** README: "19 minutes" for a 65 s film,
    PRODUCER: "about 20 minutes". True for this film (2001 frames, 15 of 21 shots in the garden or park, 6 at sea):
    0.75-0.9 s per frame in the garden even at 270x480 (the README's own table says 0.7-1.3 there), so the whole pass
    runs about 27 minutes. A film that lives in the town place should budget 30. Nothing to do but wait; I cut motion
    strips out of the finished chunks with ffmpeg meanwhile (`out/<id>/proxy/shot_NN.mp4` are plain mp4 files: the
    README could say so, `toon-sheet.py --from-video` only reads the joined film).

23. **`toon-sheet.py --frames` leaves the previous run's `sheet_xNN.jpg` behind** when the new run has fewer frames,
    so old tiles sit next to new ones. Did: deleted `sheet_x*.jpg` by hand before each run.

24. **kit README §8/§9: effect cards are unlit, and soft cards always draw on top.** Two consequences found on stills:
    a glow card "on" a prop washes the prop out (put it 10 cm behind the prop, then it is a halo), and anything white
    and soft in front of a character (fog in the fishbowl) also covers his ink outline, so it has to be clipped to
    the inside of the shape by hand. One paragraph in §9 would save a round.

25. **kit README §11.8 (things crossing faces) is right and still easy to hit**: a pancake tossed to a mouth in a
    normal arc passes over the eyes for 3 frames, because the mouth is the lowest part of the face. Did: a flat toss
    that comes up from below. A recipe for "something flies into a mouth" belongs next to the trap.

26. **kit README §7 recommends impact kicks ("0.5 light, 1.4 hard"); `toon-qa.py` reads them as pops in a quiet shot.
    Cost: one proxy round on 7 shots, ~12 min.** The example film has kicks of 1.0-1.4 and passes, because its kicks
    sit in shaft shots where every frame already changes a lot. In a garden medium shot with a slow push-in the same
    kick is 3x the local median: POPS [941, 942, 1550, 1551] were a 0.5 and a 1.0 kick (burger into flame, thermometer
    pop), near pops 472-473 a 0.8 kick. Did: no kick or 0.3 in quiet shots, and every effect that appears on a beat
    now grows over 3-4 frames (flame over the burger, shards from 55 % size). Fix: say in §7 "kicks above 0.4 only
    where the picture is already moving (falls, glides, splashes)" and add kicks to the list in §11.6.

27. **kit README §11.6 says a blink covers an expression change; it does not cover a head tilt or a `facing` change.**
    Near pops 698, 969 and 1703 were `headTilt` jumping 7-8 degrees and `facing` 1 -> 0 on the same frame as a blinked
    expression change. Did: eased every `headTilt` with `sm()` over 7-9 frames and stopped changing `facing` inside a
    held shot (eyes only, `look` eased). The example film changes `facing` in one frame in several shots, so copying
    its code is not safe outside the shaft.

28. **`toon-qa.py --proxy` fails on "near pops" from 0.80, but prints them after the report without saying which
    ones matter.** There is no way to mark an intended visual pop (a thermometer bursting IS a pop) as planned, the
    way `flash_at` is. Fix: `"planned_pops": [1550]` in shots.json, read like the flashes.

29. **A crossfade draws both shots for 8 frames; an action that ends on the cut is doubled.** The bird landed on the
    hat on the last frame of shot 19 and the 19 -> 20 crossfade showed two birds in two places. Did: the landing ends
    10 frames before the cut. Worth one line in README §2 next to `xfade`: "nothing should move across a crossfade".

30. **Water cuts a card in a straight line.** A swimmer at "neck-deep" bobbing 3 cm loses his chin to a ruler-straight
    edge on some frames. Did: water at the collar (soles 1.15 m under), never at the chin. For the ocean recipe in §4.

31. **kit `fx(..., { soft: true, gain })`: fading a soft card with `gain` makes a black blob. Cost: one proxy round.**
    Expected: gain 0 = invisible (the README lists gain next to soft without saying what it does). True: gain only
    multiplies the colour; the card keeps the alpha of its drawing, so a glow "fading in" from gain 0.03 starts as a
    dark disc and brightens. It showed up only as near pop 1032 (0.94) in the QA, never on a still, because the stills
    I had picked were at full glow. Did: every fade is an alpha inside the drawing, keyed by the quantised strength.
    Fix: one sentence in §9, or let `gain` < 1 on soft cards scale the alpha.
