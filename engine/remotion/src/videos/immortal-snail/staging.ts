// Staging of "What If an Immortal Snail Was Chasing You?": who stands where in which pose, and every 2D card, for
// all 24 shots. stage(c) is a pure function of the shot and the frame; the timing comes from story.ts, the drawings
// from props.ts (plus the airliner and the iron weight of plane-door-midflight).
import {
  Ctx, V3, Pose, Arm, PutOpt, put, fx, armMix, sm, lidAt, q, HANG, HIP, clamp01, lerp, lin, add, hash,
  GUS, WIFE, NEIGHBOR, NEIGH, sparkle, question, burst, puff, cloud, note, popIn, sleepBubble, Pen,
} from "../../toon/kit";
import {
  BILL, HOOKGLINT, MONEY, WFALL, WLAND, WFLIP, FOREVER, STALK, JUMP, JLAND, OVER, LAUGH, WPOINT, NSTEP, NDOWN, THUMB, POINT,
  RACE, FINISH, STEP, WATCH, FOUR, CAUGHT, LAPS, CRAWLS, WHY, GULP, STOP, EAT, NEVER, DRIPS, WEEK, FULL, DUCK,
  TAPE, CLOSER, MILE1, MILE2, YEAR, WHISTLE, THREE_, WALKED, YEARS, XRAY, WINK, RIDE, BEACH, BILL2, CASE, RISE, LAST,
  GUS_AT, WIFE_AT, SN2, SN4, G5, SN5, SN7, G10, SN10, CHAIR, CHAIR19, SN19, jump5, neighX, step10, stride13, walk21, RULER_Y, RULER_W, raceX,
} from "./story";
import {
  fxSnail, fxTrail, fxSack, fxCross, fxRuler, fxFlag, fxWatch, fxHand, fxTally, fxLanes, fxDash, fxSweat, fxTap, fxDrop, fxTub, fxSun,
  fxTape, fxTag, fxRoad, fxMile, fxIslet, fxCase, fxXray, fxPalm,
} from "./props";
import { fxPlane, fxWeight } from "../plane-door-midflight/props";

/** popIn that is 0 before its frame */
const pop = (f: number, f0: number, n = 6) => (f < f0 ? 0 : popIn(f, f0, n));
const pulse = (f: number, f0: number, up = 4, down = 8) => (f < f0 - up || f >= f0 + down ? 0 : f < f0 ? sm(f, f0 - up, f0) : 1 - sm(f, f0, f0 + down));
const NG = 0.72;                                    // unlit cards at night
const gainOf = (c: Ctx) => (c.light === "night" ? NG : 1);
const flipped = (draw: (p: Pen) => void, w: number) => (p: Pen) => { p.g.save(); p.g.translate(w, 0); p.g.scale(-1, 1); draw(p); p.g.restore(); };

// ---------------- the snail ----------------
type Sn = { st?: number; eye?: number; reach?: number; size?: number; flat?: number; left?: boolean; gain?: number; rot?: number };
/** the snail with its foot on the ground point `at` (it faces screen right unless left) */
const snail = (c: Ctx, at: V3, o: Sn = {}) => {
  const st = q(o.st ?? 0, 8), eye = o.eye ?? 0, reach = q(o.reach ?? 0, 10), w = o.size ?? 0.44, h = w * 0.75 * (o.flat ?? 1);
  const draw = (p: Pen) => fxSnail(p, st, eye, reach);
  fx(c, `snail|${st}|${eye}|${reach}|${o.left ? 1 : 0}`, 400, 300, o.left ? flipped(draw, 400) : draw, [at[0], at[1] + (130 / 300) * h, at[2]], w, h, { gain: o.gain ?? gainOf(c), rot: o.rot ?? 0 });
};
/** how far it is stretched: it bunches and stretches as it crawls */
const crawl = (f: number, speed = 0.22) => 0.5 + 0.5 * Math.sin(f * speed);
const trail = (c: Ctx, at: V3, len: number) => fx(c, "trail", 600, 60, fxTrail, [at[0] - 0.16 - len / 2, at[1] + 0.012, at[2] - 0.02], len, len * 0.1, { flat: true, gain: gainOf(c) });

// ---------------- Gus and his money ----------------
const HUG: Arm = { h: [0.0, 0.5], bend: 0.3, front: true };
const sackAt = (c: Ctx, at: V3, size = 0.5, rot = 0) => fx(c, "sack", 300, 340, fxSack, at, size, size * 1.133, { gain: gainOf(c), rot });
/** Gus hugging the sack in front of his chest */
const gusHug = (c: Ctx, pose: Pose, pos: V3, o: PutOpt = {}, size = 0.5) => {
  const g = put(c, GUS, { L: HUG, R: HUG, ...pose }, pos, { wide: true, ...o });
  const a = g.at(g.A.L, 0.09), b = g.at(g.A.R, 0.09);
  sackAt(c, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.07, (a[2] + b[2]) / 2], size);
  return g;
};
/** Gus with the sack under the arm on screen right */
const UNDER: Arm = { h: [0.3, 0.52], bend: 0.3, front: true };
const gusCarry = (c: Ctx, pose: Pose, pos: V3, o: PutOpt = {}) => {
  const g = put(c, GUS, { R: UNDER, ...pose }, pos, { wide: true, ...o });
  const a = g.at(g.A.R, 0.09);
  sackAt(c, [a[0] + 0.02 * c.cam.right.x, a[1] + 0.05, a[2] + 0.02 * c.cam.right.z], 0.44, -0.12);
  return g;
};
/** Gus in the deck chair with the sack on his lap */
const gusChair = (c: Ctx, pose: Pose, pos: V3) => {
  const lap: Arm = { h: [0.08, 0.52], bend: 0.25, front: true };
  const g = put(c, GUS, { mode: "chair", L: lap, R: lap, ...pose }, pos, { noBlob: true, wide: true });
  const a = g.at(g.A.L, 0.09), b = g.at(g.A.R, 0.09);
  sackAt(c, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.08, (a[2] + b[2]) / 2], 0.42);
  return g;
};
/** a walk or a run: legs scissor, the free arm swings; ph = phase, amp = stride */
const legs = (ph: number, amp = 0.34, lift = 0.45): Pose => ({ mode: "air", legs: [[-0.2 + amp * Math.sin(ph), 1.48 - lift * Math.max(0, Math.cos(ph))], [0.2 - amp * Math.sin(ph), 1.48 - lift * Math.max(0, -Math.cos(ph))]] });
const frontLegs = (ph: number): Pose => ({ mode: "air", legs: [[-0.34 + 0.08 * Math.sin(ph), 1.48 - 0.55 * Math.max(0, Math.cos(ph))], [0.34 - 0.08 * Math.sin(ph), 1.48 - 0.55 * Math.max(0, -Math.cos(ph))]] });

/** a stopwatch whose hand has gone round `turns` times; w = its width in metres */
const watch = (c: Ctx, at: V3, w: number, turns: number, n = 0, m = 0) => {
  if (w <= 0.01) return;
  fx(c, "watch", 300, 340, fxWatch, at, w, w * 1.133, { gain: gainOf(c) });
  fx(c, "hand", 300, 300, fxHand, [at[0], at[1] - (20 / 300) * w, at[2] + 0.02], w, w, { rot: -2 * Math.PI * turns, gain: gainOf(c) });
  if (m) fx(c, `tally${n}|${m}`, 60 * m, 60, (p) => fxTally(p, n, m), [at[0], at[1] - 0.72 * w, at[2] + 0.02], 0.2 * w * m, 0.2 * w);
};
const sweat = (c: Ctx, at: V3, f0: number, size = 0.5) => { if (c.f >= f0 && c.f < f0 + 10) { const u = q((c.f - f0) / 10, 20); fx(c, `sweat${u}`, 200, 200, (p) => fxSweat(p, u), at, size, size, { gain: gainOf(c) }); } };

// ---------------- the garden ----------------
const garden = (c: Ctx) => {
  const { id, f } = c;
  if (id === 1) {
    // HOOK: Gus runs at the lens with the money, looking back
    const z = lerp(-0.9, 1.5, f / 52), ph = f * 0.85;
    const g = gusHug(c, { ...frontLegs(ph), expr: "shock", look: q(Math.sin(f * 0.2), 6), blink: lidAt(f, 1), tilt: 3 * Math.sin(ph) }, [-0.3, 0.05 * Math.abs(Math.sin(ph)), z], { tall: true }, 0.56);
    sparkle(c, add(g.at(g.A.L, 0.14), [-0.26, 0.02, 0]), BILL, 16, 0.32); sparkle(c, add(g.at(g.A.R, 0.14), [0.24, -0.1, 0]), BILL + 5, 14, 0.22);
    for (const f0 of [8, 26, 42]) sweat(c, add(g.at(g.A.head, 0.08), [0.25, 0.3, 0]), f0, 0.6);
  } else if (id === 2 || id === 16) {
    // the snail, close: it means it (hook); it never stops (night)
    const f0 = id === 2 ? 52 : 992, x = SN2[0] - 0.1 + 0.0022 * (f - f0), mean = id === 2 ? f >= HOOKGLINT - 3 : false;
    trail(c, [x, 0, SN2[2]], 0.9);
    snail(c, [x, 0, SN2[2]], { st: crawl(f, 0.3), eye: mean ? 1 : id === 16 ? 3 : 0 });
    const gl = id === 2 ? HOOKGLINT : NEVER;
    sparkle(c, [x - 0.12, 0.32, SN2[2] + 0.05], gl, 16, 0.13, gainOf(c)); sparkle(c, [x - 0.02, 0.24, SN2[2] + 0.05], gl + 4, 12, 0.07, gainOf(c));
  } else if (id === 3) {
    // the deal: Gus and his sack, his wife, the neighbor at his fence, the snail on the lawn
    const sx = -0.62 + 0.0012 * (f - 103);
    put(c, NEIGHBOR, { expr: "smile", look: -1, blink: lidAt(f, 6), L: HANG, R: HANG }, NEIGH, { noBlob: true });
    put(c, WIFE, { expr: "neutral", facing: -1, look: -1, blink: lidAt(f, 7), L: HIP, R: HANG }, WIFE_AT);
    const g = gusHug(c, { expr: f >= MONEY - 16 ? "grin" : "smile", blink: lidAt(f, 1, [MONEY - 16]), headTilt: 4 * sm(f, MONEY - 12, MONEY - 3) }, GUS_AT);
    snail(c, [sx, 0, 1.7], { st: crawl(f) });
    sparkle(c, add(g.at(g.A.L, 0.14), [-0.1, 0.28, 0]), MONEY, 16, 0.34); sparkle(c, add(g.at(g.A.R, 0.14), [0.14, 0.1, 0]), MONEY + 5, 14, 0.22);
  } else if (id === 4) {
    // a snail that can't die: an iron weight lands on it, and it flips the weight off
    const under = f >= WLAND && f < WFLIP, wsz = 0.62;
    const flat = under ? lerp(0.3, 0.36, 0.5 + 0.5 * Math.sin((f - WLAND) * 1.3)) : f >= WFLIP ? 1 + 0.25 * Math.sin((f - WFLIP) * 0.9) * Math.exp(-(f - WFLIP) / 5) : 1;
    const x = SN4[0] + (f >= WFLIP + 8 ? 0.0022 * (f - WFLIP - 8) : 0);
    snail(c, [x, 0, SN4[2]], { st: under ? 1 : f < WLAND ? crawl(f) : f < WFLIP + 8 ? 0.2 : crawl(f), eye: under ? 3 : f >= WFLIP && f < WFLIP + 14 ? 1 : 0, flat: q(flat, 50) });
    // the weight: falls, sits, flies off to screen right
    const top = 0.33 * 0.34;
    let wp: V3 | null = null, rot = 0;
    if (f >= WFALL && f < WLAND) wp = [SN4[0], top + 3.2 * (1 - clamp01((f - WFALL) / (WLAND - WFALL)) ** 2), SN4[2] + 0.03];
    else if (under) wp = [SN4[0] + 0.006 * Math.sin((f - WLAND) * 1.3), top, SN4[2] + 0.03];
    else if (f >= WFLIP) { const u = (f - WFLIP) / 16; wp = [SN4[0] + 1.7 * u, 0.3 + 2.6 * u - 2.4 * u * u, SN4[2] + 0.03]; rot = -5 * u; }
    if (wp && wp[1] > -0.6) fx(c, "weight", 300, 300, (p) => fxWeight(p, ""), [wp[0] - 0.035, wp[1] + 0.393 * wsz, wp[2]], wsz, wsz, { rot });
    puff(c, [SN4[0] - 0.36, 0.08, SN4[2] + 0.1], WLAND, 10, 0.26); puff(c, [SN4[0] + 0.36, 0.08, SN4[2] + 0.1], WLAND + 1, 10, 0.26);
    sparkle(c, [x - 0.12, 0.32, SN4[2] + 0.05], FOREVER, 16, 0.16); sparkle(c, [x - 0.02, 0.24, SN4[2] + 0.05], FOREVER + 4, 12, 0.09);
  } else if (id === 5) {
    // one touch: the eye stalk reaches for his slipper, he jumps back; the red cross
    const j = jump5(f), up = sm(f, JUMP - 2, JUMP + 4) * (1 - sm(f, JLAND - 2, JLAND + 5));
    const g = gusHug(c, { expr: f < STALK + 2 ? "smile" : f < JLAND + 4 ? "shock" : "nervous", look: q(sm(f, STALK - 4, STALK + 2), 10), blink: lidAt(f, 1, [STALK + 2, JLAND + 4]),
      squash: q(0.4 * pulse(f, JUMP - 1, 4, 3) + 0.3 * pulse(f, JLAND + 1, 2, 5), 40), tilt: -5 * up, headTilt: 5 * sm(f, OVER - 4, OVER + 4) }, [j.x, j.y, G5[2]], { tall: true });
    snail(c, SN5, { st: crawl(f, 0.18) * 0.5, left: true, reach: sm(f, STALK, JUMP) * (1 - 0.5 * sm(f, JLAND, JLAND + 8)), eye: f >= JUMP ? 1 : 0 });
    puff(c, [j.x, 0.1, G5[2] + 0.1], JLAND, 9, 0.6);
    const s = pop(f, OVER, 6), a = g.at(g.A.L, 0.16), b = g.at(g.A.R, 0.16);
    if (s > 0) fx(c, "cross", 200, 200, fxCross, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.08, (a[2] + b[2]) / 2 + 0.03], 0.42 * s, 0.42 * s);
  } else if (id === 6) {
    // his wife laughs: it's a snail
    const on = true, k = sm(f, WPOINT - 4, WPOINT + 4), sh = Math.sin((f - LAUGH) * 1.1) * sm(f, 373, LAUGH);
    put(c, WIFE, { expr: on ? "laugh" : "smile", blink: lidAt(f, 7), headTilt: 4 + 1.5 * sh, tilt: 1.2 * sh,
      L: { ...armMix(HIP, { h: [0.8, 0.4], bend: 0.05 }, k), hand: k > 0.5 ? "point" : undefined }, R: HIP }, [WIFE_AT[0], 0.012 * Math.abs(sh), WIFE_AT[2]], { wide: true });
  } else if (id === 7) {
    // the neighbor steps right over it: just walk away
    const x = neighX(f), stepK = clamp01((f - NSTEP) / (NDOWN - NSTEP)), y = f >= NSTEP && f < NDOWN ? 0.16 * Math.sin(Math.PI * stepK) : 0;
    const walking = 1 - sm(f, NDOWN + 4, NDOWN + 12), ph = (f - 431) * 0.42, big = Math.sin(Math.PI * stepK) * (f >= NSTEP && f < NDOWN ? 1 : 0);
    const lg = legs(ph, 0.3 * walking + 0.25 * big, 0.3 * walking + 0.5 * big).legs!;
    const stand: [number, number][] = [[-0.14, 1.48], [0.14, 1.48]];
    const th = sm(f, THUMB - 4, THUMB + 4);
    const n = put(c, NEIGHBOR, { mode: "air", legs: lg.map((l, i) => [lerp(stand[i][0], l[0], walking), lerp(stand[i][1], l[1], walking)]) as [[number, number], [number, number]],
      expr: f >= THUMB - 6 ? "grin" : "smile", facing: -1, look: q(lerp(-1, 0, sm(f, THUMB - 8, THUMB)), 10), blink: lidAt(f, 6, [THUMB - 6]), tilt: -3 * walking,
      L: { h: [0.2, 0.9 + 0.1 * Math.sin(ph) * walking], bend: 0.07 }, R: { ...armMix({ h: [0.2, 0.9 - 0.1 * Math.sin(ph) * walking], bend: 0.07 }, { h: [0.56, -0.05], bend: -0.35 }, th), hand: th > 0.5 ? "thumb" : undefined } },
      [x, y + 0.03 * Math.abs(Math.sin(ph)) * walking, SN7[2] - 0.12], { wide: true });
    void n;
    snail(c, [SN7[0], 0, SN7[2] + 0.1], { st: crawl(f, 0.18), left: true, eye: f >= NSTEP && f < NDOWN + 12 ? 3 : 0 });
    puff(c, [-0.2, 0.1, SN7[2]], NDOWN, 9, 0.5);
  } else if (id === 8) {
    // they've got a point
    const k = sm(f, POINT - 6, POINT);
    const g = put(c, GUS, { expr: "relief", look: q(1 - k, 10), blink: lidAt(f, 1), headTilt: 5 * (1 - k),
      L: { ...armMix(HANG, { h: [0.36, 0.12], bend: -0.3 }, k), front: true, hand: "thumb" }, R: UNDER }, GUS_AT, { wide: true });
    const a = g.at(g.A.R, 0.09); sackAt(c, [a[0] + 0.02, a[1] + 0.05, a[2]], 0.44, -0.12);
    sparkle(c, add(g.at(g.A.L, 0.06), [-0.02, 0.16, 0]), POINT, 14, 0.22);
  } else if (id === 10) {
    // one step, and the snail needs four minutes
    const k = step10(f), gx = G10[0] - 0.45 * k, lift = Math.sin(Math.PI * k);
    const g = gusCarry(c, { mode: "air", legs: [[-0.16 - 0.3 * lift, 1.48 - 0.22 * lift], [0.16, 1.48]], expr: f >= STEP + 12 ? "smile" : "nervous", facing: f >= STEP + 12 ? 0 : -1,
      look: q(sm(f, STEP + 10, STEP + 18), 10), blink: lidAt(f, 1, [STEP + 12]), L: HANG }, [gx, 0.03 * lift, G10[2]]);
    void g;
    const turns = 4 * clamp01((f - FOUR) / (CAUGHT - 2 - FOUR)), sx = SN10[0] - 0.45 * clamp01((f - FOUR) / (CAUGHT - FOUR)) ** 1.2;
    trail(c, [sx + 0.5, 0, SN10[2]], 0.5);
    snail(c, [sx, 0, SN10[2]], { st: crawl(f, f >= FOUR ? 0.5 : 0.18), left: true, eye: f >= FOUR && f < CAUGHT ? 1 : 0 });
    watch(c, [0.4, 1.0, SN10[2]], 0.46 * pop(f, WATCH, 6), turns, Math.floor(turns + 0.02), 4);
    sparkle(c, [0.62, 1.3, SN10[2] + 0.1], CAUGHT, 14, 0.24); sweat(c, [sx + 0.05, 0.38, SN10[2] + 0.05], FOUR + 12, 0.4); sweat(c, [sx + 0.05, 0.38, SN10[2] + 0.05], FOUR + 26, 0.4);
  } else if (id === 12) {
    // why can't Gus sleep
    const d = Math.sin((f - 852) * 0.28);
    const g = gusChair(c, { expr: "nervous", look: q(d, 8), blink: lidAt(f, 1), headTilt: 2 * d + 3 * pulse(f, GULP, 3, 6) }, CHAIR);
    question(c, add(g.at(g.A.top, 0.05), [0.42, 0.12, 0]), WHY, 0.44);
  } else if (id === 13) {
    // Gus has to stop. He eats.
    const x = stride13(f), going = 1 - sm(f, STOP - 4, STOP + 2), ph = (f - 895) * 0.7, eat = sm(f, EAT - 12, EAT - 3);
    const stand: [number, number][] = [[-0.14, 1.48], [0.14, 1.48]], lg = legs(ph, 0.34, 0.4).legs!;
    const g = gusCarry(c, { mode: "air", legs: lg.map((l, i) => [lerp(stand[i][0], l[0], going), lerp(stand[i][1], l[1], going)]) as [[number, number], [number, number]],
      expr: f < STOP - 2 ? "nervous" : f < EAT - 10 ? "pained" : f < EAT ? "bite" : "chew", chew: ((f - EAT + 30) % 10) / 10, facing: going > 0.5 ? -1 : 0, blink: lidAt(f, 1, [STOP - 2, EAT - 10, EAT]),
      tilt: -6 * going + 4 * pulse(f, STOP + 8, 6, 10), L: { ...armMix(HANG, { h: [0.42, 0.2], bend: -0.2 }, eat), front: true, prop: eat > 0.4 ? "plate" : undefined, arg: f >= EAT ? 1 : 0 } },
      [x, 0.04 * Math.abs(Math.sin(ph)) * going, 0.3]);
    puff(c, [x - 0.1, 0.1, 0.4], STOP, 10, 0.7);
    for (const f0 of [STOP + 3, STOP + 14]) sweat(c, add(g.at(g.A.head, 0.08), [0.22, 0.25, 0]), f0, 0.5);
  } else if (id === 14 || id === 15) {
    // he naps; he sleeps
    const g = gusChair(c, { expr: "asleep", headTilt: 12 + 1.5 * Math.sin(f * 0.07), tilt: 3 }, CHAIR);
    sleepBubble(c, add(g.at(g.A.mouth, 0.06), [0.2, 0.04, 0]), 0.2);
  } else if (id === 19) {
    // every night Gus sleeps, the snail gets closer
    const g = gusChair(c, { expr: "asleep", headTilt: -12 + 1.5 * Math.sin(f * 0.07), tilt: -3 }, CHAIR19);
    sleepBubble(c, add(g.at(g.A.mouth, 0.06), [-0.2, 0.04, 0]), 0.22);
    const x = SN19[0] + 0.0011 * (f - 1198), k = sm(f, TAPE - 3, TAPE + 9);
    trail(c, [x, 0, SN19[2]], 0.8);
    if (k > 0) fx(c, "tape", 900, 100, fxTape, [x - 0.2 - 0.36 * k, 0.05, SN19[2] - 0.03], 0.72 * k + 0.02, 0.08, { gain: NG + 0.15 });
    const s = pop(f, TAPE, 6);
    if (s > 0) fx(c, "tag87", 300, 260, (p) => fxTag(p, "87"), [x - 0.3, 0.1 + 0.13 * s, SN19[2]], 0.3 * s, 0.26 * s, { gain: 0.92 });
    snail(c, [x, 0, SN19[2]], { st: crawl(f, 0.2), eye: 1, size: 0.4 });
    sparkle(c, [x - 0.1, 0.3, SN19[2] + 0.05], CLOSER, 16, 0.12, NG);
  } else if (id === 21) {
    // a whole day won back with a three-minute walk
    const x = walk21(f), ph = (f - 1432) * 0.42, done = f >= WALKED;
    const g = gusCarry(c, { ...legs(ph, 0.3, 0.3), expr: done ? "grin" : "whistle", facing: -1, blink: lidAt(f, 1, [WALKED]), tilt: -2, headTilt: 2 * Math.sin(ph),
      L: { h: [0.2, 0.9 + 0.12 * Math.sin(ph)], bend: 0.07 } }, [x, 0.03 * Math.abs(Math.sin(ph)), 0.3]);
    note(c, add(g.at(g.A.mouth, 0.05), [-0.25, 0.05, 0]), WHISTLE, 0); note(c, add(g.at(g.A.mouth, 0.05), [-0.3, 0.0, 0]), WHISTLE + 24, 1);
    const turns = 3 * clamp01((f - THREE_) / (WALKED - 2 - THREE_)), wx = x + 0.62;
    watch(c, [wx, 1.5, 0.3], 0.46 * pop(f, 1436, 6), turns, Math.floor(turns + 0.02), 3);
    sparkle(c, [wx + 0.2, 1.8, 0.4], WALKED, 14, 0.24);
  }
};

// ---------------- the sky: flat diagrams over a sea of clouds ----------------
const cloudSea = (c: Ctx, speed = 0.03, y0 = -5.2) => {
  for (let i = 0; i < 12; i++) {
    const x0 = -54 + i * 9 + 4 * hash(i, 31), x = ((((x0 - speed * c.f) % 108) + 108) % 108) - 54;
    cloud(c, [x, y0 - 2.6 - 4.5 * hash(i, 32), -6 - 34 * hash(i, 33)], 9 + 6 * hash(i, 34), i % 4);
  }
};
const skyStage = (c: Ctx) => {
  const { id, f } = c;
  cloudSea(c, id === 22 || id === 23 ? 0.12 : 0.03, id === 22 || id === 23 ? -6.2 : -5.4);
  if (id === 9) {
    // the record: thirteen inches in two minutes
    const top = RULER_Y + 0.3;
    fx(c, "ruler", 1300, 220, fxRuler, [0, RULER_Y, 0], RULER_W, RULER_W * 0.169);
    fx(c, "flagL", 200, 320, flipped(fxFlag, 200), [1.05, top + 0.42, -0.02], 0.62, 1.0, { rot: 0.04 * Math.sin(f * 0.3) });
    const x = raceX(f), done = f >= FINISH;
    snail(c, [x, top - 0.03, 0.05], { st: done ? 0.2 : crawl(f, 0.5), eye: done ? 2 : 1, size: 1.05 });
    const turns = 2 * clamp01((f - RACE) / (FINISH - 2 - RACE));
    watch(c, [0, 0.85, 0], 1.5, turns, Math.floor(turns + 0.02), 2);
    sparkle(c, [x + 0.1, top + 0.9, 0.3], FINISH + 2, 16, 0.8); sparkle(c, [0.9, 1.7, 0.3], FINISH, 14, 0.6);
  } else if (id === 11) {
    // almost five hundred times faster
    fx(c, "lanes", 1300, 700, fxLanes, [0, -0.9, 0], 3.1, 1.67);
    LAPS.forEach((f0, i) => {
      const n = [20, 16, 10, 16][i], u = (f - f0) / n; if (u < 0 || u > 1) return;
      fx(c, "dash", 520, 400, fxDash, [lerp(-2.4, 2.7, u), -0.5, 0.08], 0.9, 0.69);
    });
    const sx = -0.98 + 0.001 * (f - 764);
    snail(c, [sx, -1.6, 0.08], { st: crawl(f, 0.5), eye: f >= CRAWLS - 2 ? 3 : 1, size: 0.72 });
    sweat(c, [sx + 0.1, -1.0, 0.12], CRAWLS, 0.8); sweat(c, [sx + 0.1, -1.0, 0.12], CRAWLS + 9, 0.8);
  } else if (id === 17 || id === 18) {
    // a dripping tap: one drop is nothing; a week fills the bathtub
    const mouth: V3 = [0, 1.02, 0.02], floorY = -2.62, brimY = -1.72;
    const level = id === 17 ? (f >= DRIPS[2] ? 0.012 : 0) : lin([[WEEK - 4, 0.04], [FULL - 2, 1], [FULL + 8, 1.25]], f);
    const surf = lerp(floorY, brimY, Math.min(1, level));
    fx(c, "tap", 400, 300, fxTap, [0.32, 1.47, 0], 1.6, 1.2);
    fx(c, `tub|${q(level, 60)}|${f >= WEEK + 8 ? 1 : 0}`, 1000, 600, (p) => fxTub(p, q(level, 60), id === 18 && f >= WEEK + 8), [0, -2.2, 0], 3.3, 1.98);
    const drop = (land: number, n: number) => {
      const u = (f - (land - n)) / n; if (u < -0.5 || u >= 1) return;
      const y = u < 0 ? mouth[1] - 0.12 : lerp(mouth[1] - 0.12, surf, u * u), s = u < 0 ? 0.6 + 0.8 * (u + 0.5) : 1;
      fx(c, "drop", 100, 140, fxDrop, [mouth[0], y, 0.04], 0.24 * s, 0.336 * s);
    };
    if (id === 17) {
      DRIPS.forEach((d) => { drop(d, 13); burst(c, [mouth[0], floorY + 0.1, 0.1], d, 5, 0.5, "#d8f1ff"); });
      sparkle(c, [mouth[0] + 0.3, floorY + 0.3, 0.3], DRIPS[2] + 4, 14, 0.4);
    } else {
      for (let d = 1118; d < FULL; d += 6) drop(d, 6);
      for (let i = 0; i < 7; i++) { const s = pop(f, WEEK + 5 * i, 5); if (s > 0) fx(c, "sun", 200, 200, fxSun, [-1.26 + 0.42 * i, 0.15, 0.05], 0.4 * s, 0.4 * s); }
      burst(c, [-1.6, brimY, 0.2], FULL, 6, 0.9, "#d8f1ff"); burst(c, [1.6, brimY, 0.2], FULL + 1, 6, 0.9, "#d8f1ff");
      sparkle(c, [0.75, brimY + 0.55, 0.3], DUCK, 14, 0.5);
    }
  } else if (id === 20) {
    // two hundred and sixty yards a day, fifty-four miles a year
    const roadY = -2.55, top = roadY + 0.2;
    fx(c, `road${q(((f - 1314) * 0.035) % 1, 24)}`, 1500, 200, (p) => fxRoad(p, q(((f - 1314) * 0.035) % 1, 24)), [0, roadY, 0], 4.2, 0.56);
    const s1 = pop(f, MILE1, 6), s2 = pop(f, MILE2, 6);
    if (s1 > 0) fx(c, "mile260", 300, 420, (p) => fxMile(p, "260", "sun"), [-1.12, top + 0.6 * s1, -0.02], 0.94 * s1, 1.32 * s1);
    if (s2 > 0) fx(c, "mile54", 300, 420, (p) => fxMile(p, "54", "cal"), [1.08, top + 0.78 * s2, -0.02], 1.2 * s2, 1.68 * s2);
    // a day goes over: the sun arcs across and sets
    const u = clamp01((f - MILE1) / (1366 - MILE1)), ss = pop(f, MILE1, 5) * (1 - sm(f, 1360, 1368));
    if (ss > 0.02) fx(c, "sun", 200, 200, fxSun, [lerp(-1.5, 1.5, u), 0.6 + 1.5 * Math.sin(Math.PI * u), -0.05], 0.7 * ss, 0.7 * ss, { rot: f * 0.03 });
    snail(c, [0, top - 0.03, 0.05], { st: crawl(f, 0.4), eye: 1, size: 1.05 });
    sparkle(c, [1.3, top + 1.5, 0.3], YEAR, 16, 0.6);
  } else if (id === 22) {
    // one flight across the ocean: sixty-four years
    const u = clamp01((f - 1523) / 112), px = lerp(-5.2, 3.8, u);
    fx(c, "plane", 1400, 560, (p) => fxPlane(p), [px, 0.9 + 0.5 * u + 0.05 * Math.sin(f * 0.2), 0], 4.6, 1.84, { rot: 0.06 });
    fx(c, "islet", 600, 240, fxIslet, [-0.75, -2.75, 0], 2.1, 0.84);
    const s = pop(f, YEARS, 6);
    if (s > 0) fx(c, "mile64", 300, 420, (p) => fxMile(p, "64", "glass"), [0.9, -2.5 + 0.72 * s, -0.02], 1.1 * s, 1.54 * s);
    snail(c, [-0.85, -2.53, 0.05], { st: 0.2 + 0.1 * Math.sin(f * 0.15), eye: 3, reach: 0.3 * sm(f, 1540, 1560), size: 0.9 });
    sparkle(c, [1.1, -1.2, 0.3], YEARS + 6, 16, 0.5);
  } else if (id === 23) {
    // snails are very good at hitching a ride
    fx(c, "plane", 1400, 560, (p) => fxPlane(p), [0.5, 0.8 + 0.06 * Math.sin(f * 0.16), 0], 7.4, 2.96, { rot: 0.02 * Math.sin(f * 0.1) });
    const s = pop(f, XRAY, 7), eye = f >= WINK && f < WINK + 9 ? 2 : f >= WINK - 14 ? 0 : 1;
    if (s > 0) fx(c, `xray${eye}`, 600, 600, (p) => fxXray(p, eye), [-0.1, -1.95, 0.1], 2.7 * s, 2.7 * s);
    sparkle(c, [0.2, -1.5, 0.3], RIDE, 16, 0.6); sparkle(c, [-0.5, -1.2, 0.3], RIDE + 5, 12, 0.35);
  }
};

// ---------------- the beach ----------------
const CASE_AT: V3 = [0.62, 0, 0.05], CASE_W = 0.55, CASE_H = 0.66, CASE_TOP = 0.52;
const beachStage = (c: Ctx) => {
  const { f } = c;
  fx(c, "palm", 600, 900, fxPalm, [-1.45, 2.1, -2.2], 2.9, 4.35);
  const u = clamp01((f - 1712) / (BEACH - 1712)), y = 2.4 * (1 - u * u), landed = f >= BEACH;
  const g = put(c, GUS, { mode: landed ? "stand" : "air", legs: [[-0.3, 1.2], [0.3, 1.2]], expr: landed ? (f >= BEACH + 8 ? "grin" : "wow") : "wow", blink: lidAt(f, 1, [BEACH, BEACH + 8]),
    squash: q(0.5 * pulse(f, BEACH + 2, 2, 7), 40), headTilt: -3 * sm(f, RISE - 10, RISE), look: q(-0.6 * sm(f, RISE - 10, RISE), 10),
    L: { h: [0.3, 0.52], bend: 0.3, front: true }, R: HANG }, [0, y, 0], { wide: true, tall: true });
  const a = g.at(g.A.L, 0.09); fx(c, "sack", 300, 340, fxSack, [a[0] - 0.02, a[1] + 0.05, a[2]], 0.46, 0.52, { rot: 0.12 });
  puff(c, [-0.3, 0.1, 0.1], BEACH, 10, 0.8); puff(c, [0.3, 0.1, 0.1], BEACH + 1, 10, 0.8);
  sparkle(c, add(a, [-0.12, 0.3, 0.05]), BILL2, 16, 0.34); sparkle(c, add(a, [0.1, 0.12, 0.05]), BILL2 + 5, 14, 0.22);
  // the snail rises behind the suitcase, climbs on top and reaches for his hand
  const up = sm(f, RISE, RISE + 14), sy = CASE_TOP + 0.01 - 0.42 * (1 - up);
  snail(c, [CASE_AT[0] + 0.02, sy, CASE_AT[2] - 0.02], { left: true, size: 0.5, st: f >= RISE + 14 ? 0.3 * crawl(f, 0.25) : 0, eye: f >= LAST - 6 ? 1 : 3, reach: sm(f, LAST - 4, LAST + 6) });
  const cy = f >= BEACH ? 0 : 0;
  fx(c, "caseN", 300, 360, (p) => fxCase(p, false), [CASE_AT[0], cy + (170 / 360) * CASE_H, CASE_AT[2]], CASE_W, CASE_H);
  sparkle(c, [CASE_AT[0] + 0.12, 0.5, CASE_AT[2] + 0.05], CASE, 14, 0.26);
};

/** called once per frame and canvas; c.shot is the current shot */
export const stage = (c: Ctx) => {
  const place = c.shot.place;
  if (place === "sky") skyStage(c);
  else if (place === "beach") beachStage(c);
  else garden(c);
};
