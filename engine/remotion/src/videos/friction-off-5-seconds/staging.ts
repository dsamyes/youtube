// Staging of "What If Friction Vanished for 5 Seconds?": who stands where in which pose, and every 2D card, for all
// 24 shots. stage(c) is a pure function of the shot and the frame; the timing comes from story.ts, the drawings from
// props.ts (plus the stopwatch, the number tag, the sweat and the drop of immortal-snail and the iron weight of
// plane-door-midflight).
import {
  Ctx, V3, Pose, Arm, put, fx, armMix, sm, lidAt, q, talk, HANG, HIP, clamp01, lerp, add, hash, draw,
  GUS, WIFE, NEIGHBOR, sparkle, question, arrow, puff, note, popIn, dizzyStars,
} from "../../toon/kit";
import {
  TAG20, SHOVE1, SHOVE2, SCRAPE3, STICK, JAB, SIP, THUMB, WATCH, FIVE, START, WISH, PUSH, YES, RUN, SLIP1, SLIP2, CUP, LADDER, CLATTER,
  WHY, TIP, RULE, RAINCLOUD, TUG, NINE, WHISTLE, BRUSH, MESH, STUCK, LENS, LOCK, GONE, SLIPS, HEAVY, LIGHT, WATCH2, TICKS, TWENTY, FIVE2,
  BACK, GRIP, GRAB, TIP2, FLOP, TWENTY2, DRAGS, THANKS,
  GUS0, POT0, SAUCER, WIFE_AT, NB, LADDER_AT, SHOVED, shoved, x1, x2, potGlide, d12, x13, x20, x21, feet22, body22, POT_END, GUS_END, dragged,
} from "./story";
import { fxPot, fxSaucer, fxCup, fxLadder, fxStreakH, fxSlope, fxRule, fxRainCloud, fxBrush, fxLens, SLOPE_W, SLOPE_H, GY, LX, lawnY } from "./props";
import { fxWatch, fxHand, fxTag, fxSweat, fxDrop } from "../immortal-snail/props";
import { fxWeight } from "../plane-door-midflight/props";

/** popIn that is 0 before its frame */
const pop = (f: number, f0: number, n = 6) => (f < f0 ? 0 : popIn(f, f0, n));

// ---------------- props ----------------
const POT_W = 0.78, POT_H = POT_W * 1.6;
/** the pot standing on the ground point `at` */
const pot = (c: Ctx, at: V3, rot = 0) => fx(c, "pot", 400, 640, fxPot, [at[0], at[1] + POT_H * (624 / 640 - 0.5), at[2]], POT_W, POT_H, { rot });
const saucer = (c: Ctx, at: V3) => fx(c, "saucer", 320, 110, fxSaucer, [at[0], at[1] + 0.07, at[2]], 0.62, 0.21);
const cup = (c: Ctx, at: V3, w = 0.27, rot = 0) => fx(c, "cup", 220, 200, fxCup, at, w, w * 0.91, { rot });
const sweat = (c: Ctx, at: V3, f0: number, size = 0.5) => { if (c.f >= f0 && c.f < f0 + 10) { const u = q((c.f - f0) / 10, 20); fx(c, `sweat${u}`, 200, 200, (p) => fxSweat(p, u), at, size, size); } };
const watch = (c: Ctx, at: V3, w: number, turns: number) => {
  if (w <= 0.01) return;
  fx(c, "watch", 300, 340, fxWatch, at, w, w * 1.133);
  fx(c, "hand", 300, 300, fxHand, [at[0], at[1] - (20 / 300) * w, at[2] + 0.02], w, w, { rot: -2 * Math.PI * turns });
};
const tag = (c: Ctx, text: string, at: V3, w: number) => { if (w > 0.01) fx(c, "tag" + text, 300, 260, (p) => fxTag(p, text), at, w, w * 0.867); };
/** speed streaks trailing to screen right of something that slides to screen left */
const streaks = (c: Ctx, at: V3, n: number, k = 1, seed = 0) => {
  for (let i = 0; i < n; i++) {
    const per = 7 + Math.floor(hash(i, seed + 2) * 5), u = ((c.f + Math.floor(hash(i, seed + 3) * per)) % per) / per, len = (0.5 + 0.5 * hash(i, seed + 4)) * k;
    fx(c, "hstreak", 300, 40, fxStreakH, [at[0] + len / 2 + 0.5 * u, at[1] + 0.15 + 0.8 * hash(i, seed + 5), at[2] + 0.12], len, 0.09, { soft: true });
  }
};
/** a run on the spot: legs scissor */
const legs = (ph: number, amp = 0.34, lift = 0.45): Pose => ({ mode: "air", legs: [[-0.2 + amp * Math.sin(ph), 1.48 - lift * Math.max(0, Math.cos(ph))], [0.2 - amp * Math.sin(ph), 1.48 - lift * Math.max(0, -Math.cos(ph))]] });

// ---------------- poses ----------------
const PUSH_L: Arm = { h: [0.78, 0.3], bend: 0.05 }, PUSH_R: Arm = { h: [-0.42, 0.34], bend: 0.1, front: true };
const UP_L: Arm = { h: [0.62, -0.5], bend: -0.2 }, UP_R: Arm = { h: [0.62, -0.5], bend: -0.2 };
const OUT_L: Arm = { h: [0.8, 0.1], bend: -0.1 }, OUT_R: Arm = { h: [0.8, 0.1], bend: -0.1 };
const CUP_ARM: Arm = { h: [0.42, 0.3], bend: 0.3, front: true };
/** Gus sliding: stiff, arms out and wobbling */
const slideGus = (c: Ctx, at: V3, expr: Pose["expr"] = "shock", extra: Pose = {}) => {
  const f = c.f, w = Math.sin(f * 0.5);
  return put(c, GUS, { expr, blink: lidAt(f, 1), tilt: 4 + 3 * Math.sin(f * 0.23), L: { h: [0.78, 0.0 + 0.25 * w], bend: -0.15 }, R: { h: [0.78, 0.0 - 0.25 * w], bend: -0.15 }, ...extra }, at, { wide: true });
};
/** his wife sliding: upright, hands on hips, unimpressed */
const slideWife = (c: Ctx, at: V3, extra: Pose = {}) => put(c, WIFE, { expr: "neutral", blink: lidAt(c.f, 7), look: -0.6, L: HIP, R: HIP, ...extra }, at);
/** his wife with the cup in the hand on screen left; returns the cup's place */
const wifeCup = (c: Ctx, pose: Pose, at: V3, lift = 0, held = true) => {
  const arm = armMix(CUP_ARM, { h: [0.2, -0.3], bend: 0.45, front: true }, lift);
  const g = put(c, WIFE, { L: arm, R: HIP, ...pose }, at);
  const h = g.at(g.A.L, 0.07), p: V3 = [h[0] - 0.02, h[1] + 0.05, h[2]];
  if (held) cup(c, p);
  return p;
};

// ---------------- the garden ----------------
const garden = (c: Ctx) => {
  const { id, f } = c;
  if (id === 1) {
    // HOOK: Gus, the pot and his wife glide to screen left together
    const x = x1(f);
    pot(c, [x - 0.82, 0, 0.35]);
    slideGus(c, [x - 0.08, 0, 0.3]);
    slideWife(c, [x + 0.68, 0, 0.0]);
    streaks(c, [x - 0.5, 0, 0.3], 6, 1, 1);
  } else if (id === 2) {
    const x = x2(f), dn = sm(f, 144, 152);
    const g = slideGus(c, [x, 0, 0.3], dn > 0.5 ? "wow" : "shock", { blink: lidAt(f, 1, [148]), headTilt: 7 * dn });
    tag(c, "20", add(g.at(g.A.head), [-0.6, 0.3, 0.05]), 0.46 * pop(f, TAG20));
    streaks(c, [x + 0.35, 0, 0.2], 4, 0.8, 2);
  } else if (id === 3 || id === 4) {
    // Gus shoves the pot toward its saucer; it scrapes and sticks
    const d = shoved(f), push = id === 3 ? Math.max(pulseK(f, SHOVE1), pulseK(f, SHOVE2)) : pulseK(f, SCRAPE3), up = id === 4 ? sm(f, 349, 358) : 0;
    const strain = id === 4 && f >= STICK - 2 && f < 349, jab = sm(f, JAB - 5, JAB + 1), speaking = id === 4 && f >= 355 && f < 400;
    saucer(c, SAUCER);
    pot(c, [POT0[0] - d, 0, POT0[2]], 0.02 * push);
    if (id === 3) put(c, WIFE, { expr: "neutral", blink: lidAt(f, 7), look: -1, L: HIP, R: HIP }, [WIFE_AT[0] - 0.3, 0, WIFE_AT[2]]);
    const g = put(c, GUS, {
      expr: up > 0.5 ? (speaking ? talk(f) : "stern") : strain ? "pained" : push > 0.3 ? "pained" : "stern", blink: lidAt(f, 1, [353, STICK - 2]),
      tilt: lerp(-16 - 5 * push, 0, up), look: lerp(-1, -0.3, up),
      L: armMix(PUSH_L, HIP, up), R: armMix(PUSH_R, { h: [0.5, 0.62], bend: -0.05, front: true, hand: "point" }, up * (0.6 + 0.4 * jab)),
    }, [GUS0[0] - d, 0, GUS0[2]], { wide: true });
    for (const f0 of id === 3 ? [SHOVE1 + 2, SHOVE2 + 2] : [SCRAPE3 + 2, STICK + 3, STICK + 12]) sweat(c, add(g.at(g.A.head, 0.08), [0.2, 0.3, 0]), f0, 0.55);
    if (id === 4) for (const k of [0, 1]) puff(c, [POT0[0] - d - 0.3 + 0.6 * k, 0.08, POT0[2] + 0.1], STICK + k, 9, 0.3);
  } else if (id === 5) {
    // his wife: he'd miss it; a sip
    const speaking = f >= 424 && f < 450, sip = sm(f, SIP - 5, SIP + 2) * (1 - sm(f, SIP + 12, SIP + 18));
    wifeCup(c, { expr: sip > 0.6 ? "smile_closed" : speaking ? talk(f) : "neutral", blink: lidAt(f, 7, [SIP - 2, SIP + 14]), headTilt: 3 }, WIFE_AT, sip * 0.0);
  } else if (id === 6 || id === 11) {
    // the neighbor behind his fence, his ladder on the wall behind him
    const e = id === 11 ? clamp01((f - LADDER) / (CLATTER - LADDER)) ** 2 : 0, h = 3.5 * (1 - 0.94 * e);
    fx(c, "ladder", 260, 900, fxLadder, [LADDER_AT[0], h / 2, LADDER_AT[2]], 0.8, h);
    if (id === 6) {
      const speaking = f >= 475 && f < 518, up = sm(f, THUMB - 6, THUMB);
      const g = put(c, NEIGHBOR, { expr: speaking ? talk(f) : "grin", blink: lidAt(f, 6), headTilt: 3 * Math.sin(f * 0.1),
        R: { ...armMix(HANG, { h: [0.36, 0.12], bend: -0.3 }, up), front: true, hand: "thumb" }, L: HANG }, NB, { noBlob: true });
      sparkle(c, add(g.at(g.A.R, 0.06), [0.02, 0.16, 0]), THUMB, 14, 0.24);
    } else {
      const seen = f >= CLATTER - 2;
      put(c, NEIGHBOR, { expr: seen ? "jawdrop" : "smile_closed", blink: lidAt(f, 6, [CLATTER - 2]), look: -sm(f, CLATTER - 4, CLATTER + 4), L: HANG, R: HANG }, NB, { noBlob: true });
      for (const k of [0, 1, 2]) puff(c, [LADDER_AT[0] - 0.5 + 0.5 * k, 1.2 + 0.1 * k, -4.9], CLATTER + k, 12, 0.7);
    }
  } else if (id === 7) {
    // the wish: a stopwatch, five seconds
    const d = SHOVED, on = f >= WISH - 2;
    pot(c, [POT0[0] - d, 0, POT0[2]]);
    put(c, GUS, { expr: on ? "wow" : "stern", blink: lidAt(f, 1, [WISH - 2]), look: lerp(-0.3, -0.8, sm(f, WATCH, WATCH + 8)), headTilt: -3 * sm(f, WATCH, WATCH + 8), L: HIP, R: HIP }, [GUS0[0] - d, 0, GUS0[2]]);
    const wp: V3 = [POT0[0] - d - 0.02, 1.86, POT0[2] + 0.05];
    watch(c, wp, 0.46 * pop(f, WATCH), f >= START ? (f - START) / 150 : 0);
    tag(c, "5", [wp[0] + 0.02, wp[1] + 0.52, wp[2]], 0.4 * pop(f, FIVE));
    for (let i = 0; i < 6; i++) sparkle(c, [-0.7 + 0.32 * i, 0.12 + 0.1 * hash(i, 7), 0.9 - 0.25 * hash(i, 8)], WISH + 2 * i, 14, 0.2);
  } else if (id === 8) {
    // one light push and the pot glides away
    const d = SHOVED + potGlide(f), ps = sm(f, PUSH - 5, PUSH) * (1 - sm(f, PUSH + 4, PUSH + 12)), yes = sm(f, YES - 5, YES + 1);
    pot(c, [POT0[0] - d, 0, POT0[2]]);
    if (f > PUSH + 4) streaks(c, [POT0[0] - d + 0.45, -0.1, POT0[2]], 3, 0.5, 3);
    put(c, GUS, { expr: yes > 0.5 ? "grin" : "wow", blink: lidAt(f, 1, [YES - 2]), tilt: -10 * ps, look: -1,
      L: armMix(armMix(HIP, PUSH_L, ps), UP_L, yes), R: armMix(armMix(HIP, PUSH_R, ps), UP_R, yes) }, [GUS0[0] - SHOVED, 0, GUS0[2]], { wide: true });
  } else if (id === 9) {
    // he runs and stays where he is
    const k = sm(f, RUN - 4, RUN + 10), ph = 0.5 * (f - RUN) + 0.012 * Math.max(0, f - RUN) ** 2 * 0.5;
    const g = put(c, GUS, { ...(k > 0.05 ? legs(ph, 0.36 * k, 0.5 * k) : {}), expr: f < RUN + 22 ? "wow" : "shock", blink: lidAt(f, 1, [RUN + 22]), tilt: -9 * k, look: -1,
      L: { h: [0.5 + 0.2 * Math.sin(ph), 0.45], bend: 0.3 }, R: { h: [0.5 - 0.2 * Math.sin(ph), 0.45], bend: 0.3 } }, [GUS0[0] - SHOVED, 0.02 * k * Math.abs(Math.sin(ph)), GUS0[2]], { wide: true });
    for (const f0 of [SLIP1, SLIP2]) sweat(c, add(g.at(g.A.head, 0.08), [0.22, 0.3, 0]), f0, 0.6);
  } else if (id === 10) {
    // the cup slips through her fingers
    const gone = f >= CUP, n = Math.max(0, f - CUP);
    const p = wifeCup(c, { expr: f >= CUP + 5 ? "wow" : "neutral", blink: lidAt(f, 7, [CUP + 5]), look: -0.7 * sm(f, CUP + 2, CUP + 9), headTilt: 3 - 6 * sm(f, CUP + 3, CUP + 11) }, WIFE_AT, 0, !gone);
    if (gone) cup(c, [p[0], p[1] - 0.0054 * n * n, p[2]]);
  } else if (id === 12) {
    // the whole garden starts to drift
    const d = d12(f);
    pot(c, [-0.35 - d, 0, 0.3]);
    put(c, GUS, { ...legs(1.0, 0.3, 0.3), expr: "wow", blink: lidAt(f, 1), look: -0.5, L: OUT_L, R: OUT_R, tilt: 3 * Math.sin(f * 0.2) }, [0.75 - d, 0.02, 0.3], { wide: true });
    slideWife(c, [1.5 - d, 0, -0.5], { expr: "wow", look: 0 });
    cup(c, [1.1 - d, 0.13, 0.6], 0.27);
    saucer(c, [-1.6, 0, 0.5]);
  } else if (id === 13) {
    const x = x13(f), lk = f < 1004 ? 0 : Math.sin((f - 1004) * 0.12);
    const g = slideGus(c, [x, 0, 0.3], "nervous", { look: q(lk, 8), headTilt: 6, tilt: 3 });
    question(c, add(g.at(g.A.top), [0.02, 0.3, 0]), WHY, 0.46);
    streaks(c, [x + 0.4, 0, 0.2], 3, 0.5, 4);
  } else if (id === 16) {
    // an ordinary day: the slope tugs at him with nine pounds
    const at: V3 = [0.05, 0, 0.3], wh = f >= WHISTLE - 6;
    const g = put(c, GUS, { expr: wh ? "whistle" : "smile", blink: lidAt(f, 1, [WHISTLE - 6]), look: 0.3, headTilt: 2 * Math.sin(f * 0.08), L: HIP, R: HIP }, at);
    arrow(c, [-0.5, 0.98, 0.36], 0.55, -Math.PI / 2, TUG);
    const s = pop(f, NINE);
    if (s > 0.01) fx(c, "w9", 300, 300, (p) => fxWeight(p, "9"), [-1.08, 0.98 + 0.02 * Math.sin(f * 0.2), 0.36], 0.5 * s, 0.5 * s);
    note(c, add(g.at(g.A.mouth), [0.1, 0.1, 0]), WHISTLE, 0, 30);
  } else if (id === 18 || id === 19) {
    // close on his slippers; the magnifying glass
    const n = Math.max(0, f - SLIPS), sl = id === 19 ? 0.00012 * n * n : 0;
    put(c, GUS, { expr: "smile", L: HANG, R: HANG }, [-sl, 0, 0.3]);
    const s = pop(f, LENS), teeth = id === 19 ? 1 - sm(f, GONE - 2, GONE + 5) : 1, shut = id === 18 ? sm(f, LOCK - 3, LOCK + 1) : 1 - sm(f, GONE - 2, GONE + 3);
    const shift = id === 19 ? Math.round(Math.min(300, 0.11 * n * n) / 4) * 4 : 0;
    if (s > 0.01) fx(c, `lens|${q(teeth, 12)}|${shift}|${q(shut, 6)}`, 600, 720, (p) => fxLens(p, q(teeth, 12), shift, q(shut, 6)), [0.02, 0.72, 0.6], 0.72 * s, 0.864 * s);
    sparkle(c, [0.0, 0.79, 0.7], LOCK, 14, 0.3);
  } else if (id === 20) {
    // heavy or light: all abreast
    const x = x20(f), mv = f >= TICKS - 3;
    pot(c, [x - 0.82, 0, 0.3]);
    slideGus(c, [x - 0.1, 0, 0.3], mv ? "shock" : "nervous", mv ? {} : { L: HANG, R: HANG, tilt: 0 });
    slideWife(c, [x + 0.56, 0, 0.1]);
    cup(c, [x + 1.0, 0.13, 0.5], 0.28);
    const sw = pop(f, HEAVY), sf = pop(f, LIGHT);
    if (sw > 0.01) fx(c, "w0", 300, 300, (p) => fxWeight(p, ""), [x - 0.86, 1.72, 0.3], 0.44 * sw, 0.44 * sw);
    if (sf > 0.01) fx(c, "feather", 220, 400, draw.fxFeather, [x + 1.0, 0.62 + 0.03 * Math.sin(f * 0.2), 0.5], 0.26 * sf, 0.47 * sf, { rot: 0.5 });
    watch(c, [x + 0.25, 2.5, 0.3], 0.56 * pop(f, WATCH2), clamp01((f - TICKS) / (FIVE2 - TICKS)) * (5 / 12));
    tag(c, "20", [x - 0.45, 2.52, 0.3], 0.5 * pop(f, TWENTY));
    if (mv) streaks(c, [x - 0.4, 0, 0.3], 6, clamp01((f - TICKS) / 40), 5);
    sparkle(c, [x + 0.25, 2.5, 0.4], FIVE2, 14, 0.5);
  } else if (id === 21) {
    // the slippers bite
    const x = x21(f);
    put(c, GUS, { expr: "shock", L: OUT_L, R: OUT_R }, [x, 0, 0.3], { wide: true });
    for (let i = 0; i < 5; i++) sparkle(c, [x - 0.9 + 0.3 * i - 0.3, 0.1 + 0.08 * hash(i, 3), 0.75 - 0.2 * hash(i, 4)], BACK + 2 * i, 14, 0.16);
    for (const k of [0, 1, 2]) puff(c, [x - 0.3 + 0.12 * k, 0.1, 0.5], GRIP + k, 10, 0.34);
  } else if (id === 22) {
    // his feet stop, the rest of Gus keeps going
    const [bx, by, roll] = body22(f), air = f >= TIP2, down = f >= FLOP;
    const pose: Pose = down
      ? { mode: "air", legs: [[-0.2, 1.4], [0.2, 1.4]], expr: "dazed", L: { h: [0.3, -0.75], bend: 0.1 }, R: { h: [0.3, -0.75], bend: 0.1 }, blink: lidAt(f, 1, [FLOP]) }
      : air ? { mode: "air", legs: [[-0.16, 1.45], [0.16, 1.45]], expr: "jawdrop", L: { h: [0.4, -0.8], bend: 0.0 }, R: { h: [0.4, -0.8], bend: 0.0 }, blink: lidAt(f, 1, [TIP2]) }
      : { mode: "air", legs: [[-0.18, 1.48], [0.18, 1.48]], expr: f >= GRAB - 1 ? "shock" : "nervous", blink: lidAt(f, 1, [GRAB - 1]), L: OUT_L, R: OUT_R };
    put(c, GUS, pose, [bx, by, 0.3], { face: true, roll, wide: true, tall: true, noBlob: true });
    if (f < GRAB) streaks(c, [bx + 0.4, 0, 0.2], 4, 0.7, 6);
    for (const k of [0, 1]) puff(c, [feet22(GRAB) - 0.1 + 0.2 * k, 0.1, 0.45], GRAB + k, 9, 0.3);
    for (const k of [0, 1, 2]) puff(c, [bx - 0.6 + 0.6 * k, 0.12, 0.5], FLOP + k, 12, 0.6);
    if (f >= FLOP + 10) dizzyStars(c, [bx - 0.62, 0.42, 0.35], 0.7);
  } else if (id === 23) {
    // the empty saucer; far away at the fence, the pot
    saucer(c, SAUCER);
    pot(c, POT_END);
    put(c, GUS, { mode: "sit", expr: "sad", blink: lidAt(f, 1), look: 1, headTilt: 5, L: HANG, R: HANG }, [GUS_END[0] + 0.1, 0, GUS_END[2]]);
    tag(c, "20", [-5.45, 1.82, 0.4], 0.6 * pop(f, TWENTY2));
  } else if (id === 24) {
    // the way back, scrape by scrape, and he beams
    const d = dragged(f), heave = Math.max(...DRAGS.map((f0) => pulseK(f, f0 + 4, 5, 9))), th = sm(f, THANKS - 6, THANKS);
    pot(c, [POT_END[0] + d, 0, POT_END[2]], -0.03 * heave);
    for (const [i, f0] of DRAGS.entries()) puff(c, [POT_END[0] + 0.15 * i - 0.35, 0.08, POT_END[2] + 0.1], f0 + 3, 9, 0.3);
    const g = put(c, GUS, { expr: th > 0.5 ? "smile_closed" : heave > 0.4 ? "grin" : "smile", blink: lidAt(f, 1, [THANKS - 3]), tilt: lerp(8 + 6 * heave, 0, th), look: lerp(-0.6, 0, th),
      L: armMix(PUSH_L, { h: [0.72, 0.32], bend: 0.05 }, th), R: { ...armMix({ h: [-0.3, 0.36], bend: 0.1, front: true }, { h: [0.36, 0.12], bend: -0.3, front: true }, th), hand: th > 0.5 ? "thumb" : "dot" } },
      [GUS_END[0] + d, 0, GUS_END[2]], { wide: true });
    for (const f0 of DRAGS) sweat(c, add(g.at(g.A.head, 0.08), [0.22, 0.3, 0]), f0 + 5, 0.55);
    sparkle(c, add(g.at(g.A.R, 0.06), [0.02, 0.16, 0]), THANKS, 16, 0.26);
  }
};
/** 0..1 bump around f0 */
function pulseK(f: number, f0: number, up = 4, down = 8) { return f < f0 - up || f >= f0 + down ? 0 : f < f0 ? sm(f, f0 - up, f0) : 1 - sm(f, f0, f0 + down); }

// ---------------- the sky: diagrams, flat cards around the origin ----------------
const DW = 3.3, DK = DW / SLOPE_W;                       // the house diagram: metres wide, metres per canvas unit
const dpos = (x: number, y: number, z = 0): V3 => [(x - SLOPE_W / 2) * DK, (SLOPE_H / 2 - y) * DK, z];
const skyStage = (c: Ctx) => {
  const { id, f } = c;
  if (id === 14 || id === 15) {
    const t = q(sm(f, TIP - 2, TIP + 9), 24);
    fx(c, `slope${t}`, SLOPE_W, SLOPE_H, (p) => fxSlope(p, t), [0, 0, 0], DW, DW * (SLOPE_H / SLOPE_W));
    if (id === 15) {
      const s = pop(f, RULE);
      if (s > 0.01) fx(c, "rule", 1000, 330, fxRule, dpos(540, GY - 110 + 165, 0.05), 1000 * DK * s, 330 * DK * s);
      const sc = pop(f, RAINCLOUD);
      if (sc > 0.01) fx(c, "raincloud", 440, 260, fxRainCloud, dpos(820, 120, 0.06), 1.25 * sc, 0.74 * sc);
      for (let i = 0; i < 9; i++) {
        const n = f - (RAINCLOUD + 5 + i * 6), x0 = 930 - 62 * (i % 5) - 20 * hash(i, 2), yl = lawnY(x0, 1) - 14;
        if (n < 0) continue;
        const fall = 11, y0 = 230;
        let x = x0, y = y0 + (yl - y0) * (n / fall) ** 2, rot = 0;
        if (n >= fall) { x = x0 - 3 * (n - fall) - 0.45 * (n - fall) ** 2; y = lawnY(x, 1) - 14; rot = -1.2; }
        if (x < LX + 10) continue;
        fx(c, "drop", 100, 140, fxDrop, dpos(x, y, 0.08), 0.1, 0.14, { rot });
      }
    }
  } else if (id === 17) {
    // two brushes, bristles facing
    const BW = 2.5, BH = BW * (260 / 600), yl = -0.45, meshed = yl + 150 * (BW / 600);
    const y = lerp(1.3, meshed, sm(f, BRUSH, MESH)), jig = f >= STUCK - 2 ? 0.035 * Math.sin((f - STUCK) * 1.6) * Math.exp(-Math.max(0, f - STUCK - 8) / 8) : 0;
    fx(c, "brushLo", 600, 260, (p) => fxBrush(p, "#7fb6e8"), [BW * (20 / 600), yl, 0], BW, BH, { rot: Math.PI });
    fx(c, "brushUp", 600, 260, (p) => fxBrush(p), [jig, y, 0.04], BW, BH);
    sparkle(c, [0.7, (meshed + yl) / 2, 0.1], MESH, 12, 0.34);
  }
};

/** called once per frame and canvas; c.shot is the current shot */
export const stage = (c: Ctx) => {
  if (c.shot.place === "sky") skyStage(c);
  else garden(c);
};
