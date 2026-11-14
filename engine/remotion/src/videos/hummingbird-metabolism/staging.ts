// TEMPLATE staging: who stands where in which pose, and every 2D effect, for each shot.
// put(c, LOOK, pose, position) places a character and returns its anchors (hands, mouth, head) in the world;
// effects come from the kit (sparkle, arrow ...) or from fx() with your own drawing.
import { Ctx, put, sm, lidAt, armMix, talk, add, HANG, HIP, GUS, Arm, sparkle, arrow, earthMini, earthPoint, EARTH_ROLL } from "../../toon/kit";
import { GUS_AT, POINT, ARROW, DING, fallS } from "./story";

const garden = (c: Ctx) => {
  const { id, f } = c;
  if (id === 1) {
    // talks to the lens (mouth shapes cycle while he speaks), then points down at the hole
    const speaking = f >= 6 && f < 48, pt = sm(f, POINT - 5, POINT + 1);
    const down: Arm = { h: [0.75, 0.5], bend: 0.05, front: true, hand: "point" };
    put(c, GUS, { expr: speaking ? talk(f) : "smile", blink: lidAt(f, 1), headTilt: 3 * Math.sin(f * 0.12), look: pt > 0.5 ? 1 : 0,
      R: armMix(HANG, down, pt), L: HIP }, GUS_AT);            // R = the arm on screen right (the hole's side)
  } else {
    // thumbs-up on the ding, with a sparkle at his thumb
    const up = sm(f, DING - 6, DING);
    const g = put(c, GUS, { expr: f >= DING - 2 ? "smile_closed" : "smile", blink: lidAt(f, 1, [DING - 2]),
      L: { ...armMix(HANG, { h: [0.36, 0.12], bend: -0.3 }, up), front: true, hand: "thumb" }, R: HANG }, GUS_AT);
    sparkle(c, add(g.at(g.A.L, 0.06), [-0.02, 0.16, 0]), DING, 14, 0.22);
  }
};

const earth = (c: Ctx) => {
  const s = fallS(c.f);
  earthMini(c, s, 1.15, 1, "o", 1, true);                                           // tiny Gus with a speed trail
  arrow(c, earthPoint(s + 0.16, 0.9, 1.62), 2.6, EARTH_ROLL, ARROW);                // the pull: pops in beside him, points at the centre
};

/** called once per frame and canvas; c.shot is the current shot */
export const stage = (c: Ctx) => {
  if (c.shot.place === "earth") earth(c);
  else garden(c);
};
