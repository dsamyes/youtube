// Ready-made 2D effects of the cartoon-short kit: one call per effect from a story's stage(c). Each is an unlit card
// (cast.ts fx()) with a drawing from toon.ts / people.ts; every one is a pure function of the frame.
// Sizes are metres in the world, so pick them for the shot: an effect next to a face in a close-up is 0.2-0.4 m, on
// the Earth cutaway (5 m globe seen from 35 m) 1.5-3 m.
// For an effect that is not here, call fx() yourself with your own Pen drawing (see the worked example,
// src/videos/hole-through-earth/staging.ts: feather, bullet, pancake, shards, crumbs).
import { Ctx, fx, q, behind } from "./cast";
import { V3 } from "./story";
import { fxBurst, fxSplash, fxPuff, fxRing, fxCloud, fxStars, fxNote } from "./toon";
import { fxSparkle, fxQuestion, fxArrow, fxPop, fxFlame, fxSoot, fxBird, fxBubble } from "./people";

/** pop-in scale: 0 -> 1.25 overshoot -> settles on 1; use it for anything that appears on a beat */
export const popIn = (f: number, f0: number, n = 6) => {
  const u = (f - f0) / n;
  return u <= 0 ? 0 : u < 1 ? 1.25 * Math.sin((Math.PI / 2) * u) : 1 + 0.25 * Math.exp(-(u - 1) * 1.2) * Math.cos((u - 1) * 2.2);
};

/** four-point sparkle that grows, turns and is gone after n frames (a glint on a thumbs-up, a bright idea) */
export const sparkle = (c: Ctx, pos: V3, f0: number, n = 12, size = 0.2, gain = 1) => {
  if (c.f < f0 || c.f >= f0 + n) return;
  const u = (c.f - f0) / n, s = size * Math.sin(Math.PI * u) ** 0.6;
  fx(c, "sparkle", 200, 200, fxSparkle, pos, s, s, { rot: u * 1.2, gain });
};
/** big yellow question mark: pops in on f0 and stays, wobbling (h = its height in metres) */
export const question = (c: Ctx, pos: V3, f0: number, h = 0.42) => {
  if (c.f < f0) return;
  const sc = popIn(c.f, f0);
  fx(c, "what", 300, 420, fxQuestion, [pos[0], pos[1], pos[2] + 0.01 * Math.sin(c.f * 0.25)], (h * sc * 300) / 420, h * sc, { rot: 0.1 * Math.sin(c.f * 0.2) });
};
/** chunky arrow (h = length in metres); rot 0 points DOWN the screen, PI up, +PI/2 to screen right; pops in on f0 */
export const arrow = (c: Ctx, pos: V3, h: number, rot = 0, f0 = -1e9, col = "#7fe3ff") => {
  if (c.f < f0) return;
  const sc = popIn(c.f, f0);
  fx(c, `arrow${col}`, 300, 520, (p) => fxArrow(p, col), pos, (h * sc * 300) / 520, h * sc, { rot });
};
/** impact star: rays shoot out over n frames (a hit, a spark, a bang). col = ray colour */
export const burst = (c: Ctx, pos: V3, f0: number, n = 6, size = 0.85, col = "#fff3b0", gain = 1.4) => {
  if (c.f < f0 || c.f >= f0 + n) return;
  const u = q((c.f - f0) / n, 30);
  fx(c, `burst${col}${u}`, 500, 500, (p) => fxBurst(p, u, col, 10, 34, 220), pos, size, size, { gain });
};
/** dust puff (soft) growing over n frames: a landing, a shovel hit */
export const puff = (c: Ctx, pos: V3, f0: number, n = 10, size = 0.9) => {
  if (c.f < f0 || c.f >= f0 + n) return;
  const u = q((c.f - f0) / n, 20);
  fx(c, `puff${u}`, 300, 300, (p) => fxPuff(p, u), pos, size * (1 + 0.55 * u), size * (1 + 0.55 * u), { soft: true });
};
/** "pop!" dashes over a hole or pipe mouth (someone shoots out of it): 7 frames, drawn just behind the subject.
 *  pos = the mouth's rim centre */
export const popDashes = (c: Ctx, pos: V3, f0: number, w = 2.0) => {
  if (c.f < f0 || c.f >= f0 + 7) return;
  const u = q((c.f - f0) / 7, 28);
  fx(c, `pop${u}`, 500, 300, (p) => fxPop(p, u), behind(c, [pos[0], pos[1] + 0.2, pos[2]]), w, w * 0.6);
};
/** water splash crown rising and falling over n frames; pos = centre of the card (its water line is near the bottom) */
export const splash = (c: Ctx, pos: V3, f0: number, n = 15, size = 2.6, rot = 0) => {
  if (c.f < f0 || c.f >= f0 + n) return;
  const u = q((c.f - f0) / n, 30);
  fx(c, `splash${u}`, 800, 800, (p) => fxSplash(p, u), pos, size, size, { rot });
};
/** rings spreading on water around something standing in it (flat on the surface, repeating every `period` frames) */
export const ripples = (c: Ctx, pos: V3, w = 2.6, d = w, period = 66, phase = 0, gain = 0.55) => {
  const u = q((((c.f + phase) % period) / period), 33);
  fx(c, `ring${u}`, 600, 600, (p) => fxRing(p, u), [pos[0], pos[1] + 0.03, pos[2]], w, d, { flat: true, gain });
};
/** pulsing target ring facing the lens (marks a point on the Earth cutaway) */
export const targetRing = (c: Ctx, pos: V3, size = 1.9) => {
  const r = q(((c.f * 0.035) % 1), 30);
  fx(c, `ring${r}`, 600, 600, (p) => fxRing(p, r), pos, size, size);
};
/** a flame burning at pos (its base) from f0: poofs up, flickers, dies by f1 (0 = burns on); HDR, it glows */
export const flame = (c: Ctx, pos: V3, f0: number, f1 = 0, size = 0.48) => {
  const f = c.f;
  if (f < f0 || (f1 > 0 && f >= f1 + 3)) return;
  const grow = Math.min(1, Math.max(0, (f - f0 + 1) / 4)), die = f1 > 0 ? 1 - Math.min(1, Math.max(0, (f - (f1 - 3)) / 6)) : 1;
  const k = Math.max(0.05, grow * die), t = q(((f * 0.19) % 1), 24), s = size / 0.48;
  fx(c, `flame${t}|${q(k, 20)}`, 300, 420, (p) => fxFlame(p, t, q(k, 20)), [pos[0], pos[1] + (0.2 * k + 0.02) * s, pos[2]], 0.34 * s, size, { gain: 1.5 });
  if (f < f0 + 6) burst(c, [pos[0], pos[1] + 0.05, pos[2]], f0, 6, 0.85 * s, "#ffb52e");
};
/** dark smoke puffs rising from pos, looping (something burnt) */
export const soot = (c: Ctx, pos: V3, f0: number, size = 0.3) => {
  if (c.f < f0) return;
  const u = q((((c.f - f0) % 14) / 14), 14);
  fx(c, `soot${u}`, 300, 300, (p) => fxSoot(p, u), [pos[0], pos[1] + 0.25 * u, pos[2]], size, size);
};
/** three small birds gliding across a day sky; n = frames since they entered, from = where the first one starts */
export const birds = (c: Ctx, n: number, from: V3 = [-26, 15, -46]) => {
  for (let i = 0; i < 3; i++) {
    const x = from[0] + 0.09 * n * (0.8 + 0.3 * i) + i * 9, y = from[1] + 2.5 * i + 0.3 * Math.sin(c.f * 0.1 + i), fl = q(Math.sin(c.f * 0.5 + i * 2), 8);
    fx(c, `bird${fl}`, 240, 140, (p) => fxBird(p, fl), [x, y, from[2] - 6 * i], 1.5, 0.87);
  }
};
/** a soft white cloud card (w metres wide), e.g. one cloud drifting over a hole seen from below */
export const cloud = (c: Ctx, pos: V3, w: number, seed = 3) => fx(c, `cloud${seed}`, 600, 300, (p) => fxCloud(p, seed), pos, w, w / 2, { soft: true, gain: 1.05 });
/** sleep bubble swelling and shrinking at a sleeper's nose */
export const sleepBubble = (c: Ctx, pos: V3, size = 0.3) => {
  const k = q(0.5 - 0.5 * Math.cos(c.f * 0.105), 24);
  fx(c, `bubble${k}`, 200, 200, (p) => fxBubble(p, k), [pos[0] - 0.07 * k, pos[1] - 0.03 * k, pos[2]], size, size, { gain: 0.8 });
};
/** stars circling over a dazed head (pos = the top of the head) */
export const dizzyStars = (c: Ctx, pos: V3, w = 0.75) => {
  const u = q(((c.f * 0.04) % 1), 30);
  fx(c, `stars${u}`, 420, 210, (p) => fxStars(p, u), [pos[0], pos[1] + 0.2, pos[2]], w, w / 2);
};
/** a music note drifting up from pos since f0 (kind 0 = single, 1 = double) */
export const note = (c: Ctx, pos: V3, f0: number, kind = 0, n = 40) => {
  if (c.f < f0 || c.f >= f0 + n) return;
  const age = (c.f - f0) / n, s = 0.3 * Math.min(1, age * 5) * (1 - Math.max(0, age - 0.75) * 4);
  fx(c, `note${kind}`, 220, 260, (p) => fxNote(p, kind), [pos[0] + 0.12 * Math.sin(age * 7), pos[1] + 0.85 * age, pos[2]], s * (220 / 260), s);
};
