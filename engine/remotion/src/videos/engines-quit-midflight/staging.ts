// Staging of "What If Both Engines Quit on Your Plane?": who sits where in which pose, and every 2D card, for all
// 23 shots. stage(c) is a pure function of the shot and the frame; the timing comes from story.ts, the drawings
// from props.ts (the airliner card from plane-door-midflight, the little house from lightning-hits-your-plane).
import {
  Ctx, V3, Arm, put, fx, armMix, sm, lidAt, q, talk, clamp01, lerp, add, hash,
  GUS, WIFE, NEIGHBOR, sparkle, question, burst, arrow, puff, sleepBubble, popIn,
} from "../../toon/kit";
import { fxPlane } from "../plane-door-midflight/props";
import { fxHouse } from "../lightning-hits-your-plane/props";
import {
  A, COUGH, QUIT, SEVEN, STOP, SUNF, LAUGH, QUIET, BLACK, REFLECT, GRAB, YELL, ROCK, ROCKFALL, BITE, NODROP, WHY, FAKE, CROSS, LIFT1, LIFT2, PUSH, NUDGE,
  COAST, LEGS, AIR, ONE, TICKS, TICKS_END, FIFTEEN, CHAIR, FLATTER, SEVEN2, GLIDE, GLIDE_END, HUNDRED, CLOCK, SWEEP, TWENTY,
  GAUGE, EMPTY, OUT, MILES75, ISLAND, LAND, LIVED, HATCH, DROP, SPIN, POWER, CONTROLS, POKE1, POKE2, NOPE, THING, PULL, PULL_END, IDLE, HUNDRED2, HOME, HOUSE, SIGH, TAP,
  seatAt, onPlane, ENGINE_BACK, ENGINE_MID, SLOPE_W, SLOPE_AT, HILL_DEG, slopeDeg, onSlope, bikeU, planeU, TRI_W, TRI_AT, onTri, G0, G1, D0, D1, mix3,
  ISLAND_AT, JET_AT, povDist,
} from "./story";
import {
  Screen, fxTag, fxCloud, fxSun, fxExhaust, fxSmoke, fxLand, fxRuler, fxCross, fxDashArrow, fxRockThought, fxBulb, fxHeart, fxSlope, fxBike, fxStreaks, fxTri, fxWedge,
  fxChairSign, fxClock, fxGround, fxDash, fxSpan, fxFuel, fxIsland, fxRat, fxYoke, fxThrottle, fxSeatBack, fxFinger, fxRunway,
} from "./props";

const RAD = Math.PI / 180;
/** popIn that is 0 before its frame */
const pop = (f: number, f0: number, n = 6) => (f < f0 ? 0 : popIn(f, f0, n));

// ---------------- cards shared by the sky shots ----------------
const planeCard = (c: Ctx, at: V3, w: number, rot = 0, gain = 1, gear = false) => fx(c, gear ? "plane|gear" : "plane|side", 1400, 560, (p) => fxPlane(p, false, gear, false), at, w, w * 0.4, { rot, gain });
/** the engine's exhaust streaks behind the engine of a plane card (len 0..1) */
const exhaust = (c: Ctx, at: V3, w: number, rot: number, len: number, gain = 1) => {
  const l = q(clamp01(len), 10), ph = Math.floor(c.f / 3) % 4;
  if (l > 0.02) fx(c, `exh${l}|${ph}`, 400, 120, (p) => fxExhaust(p, l, ph), onPlane(at, w, 450, 362, rot, 0.12), (w * 300) / 1400, (w * 90) / 1400, { rot, gain });
};
/** one puff of smoke that swells, drifts back and is gone after n frames */
const smoke = (c: Ctx, pos: V3, f0: number, n: number, size: number, dark = true) => {
  if (c.f < f0 || c.f >= f0 + n) return;
  const u = q((c.f - f0) / n, 24);
  fx(c, `smoke${u}${dark ? 1 : 0}`, 300, 300, (p) => fxSmoke(p, u, dark), [pos[0] - 1.3 * u * size, pos[1] + 0.35 * u * size, pos[2]], size * (0.55 + 0.9 * u), size * (0.55 + 0.9 * u));
};
/** white clouds drifting to screen left behind everything; rows = their heights */
const clouds = (c: Ctx, speed: number, rows: number[], span = 26, gain = 1) => {
  rows.forEach((y, i) => {
    const x0 = -span / 2 + (i * span) / rows.length + 3 * hash(i, 61), x = ((((x0 - speed * c.f) % span) + span) % span) - span / 2, w = 4.6 + 2.6 * hash(i, 63);
    fx(c, `cl${i % 4}`, 600, 300, (p) => fxCloud(p, i % 4), [x, y + 0.8 * hash(i, 62), -3 - i * 0.4], w, w / 2, { gain });
  });
};
const tag = (c: Ctx, text: string, pos: V3, w: number, f0: number, rot = 0, gain = 1) => {
  const s = pop(c.f, f0);
  if (s > 0) fx(c, `tag|${text}`, 520, 220, (p) => fxTag(p, text), pos, w * s, w * s * (220 / 520), { rot, gain });
};
/** a dashed line between two points */
const dash = (c: Ctx, a: V3, b: V3, col = "#ffffff") => {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  fx(c, `dash${col}`, 1400, 40, (p) => fxDash(p, col), [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, -0.1], L, (L * 40) / 1400, { rot: Math.atan2(b[1] - a[1], b[0] - a[0]) });
};
const streaks = (c: Ctx, pos: V3, w: number, rot = 0) => { const ph = Math.floor(c.f / 2) % 6; fx(c, `streaks${ph}`, 400, 200, (p) => fxStreaks(p, 1 - ph / 6), pos, w, w / 2, { rot }); };

// ---------------- the sky ----------------
const skyStage = (c: Ctx) => {
  const { id, f } = c, bob = 0.06 * Math.sin(f * 0.07);
  if (id === 1) {
    // HOOK: the engine coughs smoke and quits
    clouds(c, 0.16, [6.2, -5.6, 3.6, -3.4, 7.4, -7]);
    const at: V3 = [-0.35, 0.55 + bob, 0], w = 9, back = onPlane(at, w, ...ENGINE_BACK, 0, 0.3);
    planeCard(c, at, w);
    const len = f < COUGH - 4 ? 1 : f < QUIT ? 0.35 + 0.45 * Math.abs(Math.sin(f * 0.9)) : 0.5 * (1 - sm(f, QUIT, QUIT + 6));
    exhaust(c, at, w, 0, len);
    smoke(c, back, COUGH - 17, 30, 3.0); smoke(c, add(back, [0.3, 0.1, 0.07]), COUGH - 8, 24, 2.4); smoke(c, add(back, [0.2, -0.3, 0.05]), COUGH + 5, 22, 2.3); smoke(c, add(back, [0.1, 0.2, 0.06]), COUGH + 13, 20, 1.9); smoke(c, back, QUIT - 1, 30, 3.5); smoke(c, add(back, [0, 0.2, 0.05]), QUIT + 14, 30, 2.4, false); smoke(c, add(back, [0.1, -0.1, 0.05]), QUIT + 34, 30, 1.8, false);
    for (const f0 of [COUGH - 7, COUGH + 4, COUGH + 12, QUIT]) burst(c, add(back, [0.5, 0, 0.1]), f0, 8, f0 === QUIT ? 3.6 : 2.8, "#ffb347");
  } else if (id === 2) {
    // seven miles up
    clouds(c, 0.02, [3.2, -2.4, 0.4], 22);
    fx(c, "land", 1400, 220, fxLand, [0, -7.5, 0], 10.6, 1.67);
    const n = Math.max(0, Math.min(7, Math.floor((f - (SEVEN - 6)) / 2.6) + 1));
    fx(c, `ruler${n}`, 200, 1400, (p) => fxRuler(p, n), [-0.2, -0.45, -0.1], 1.7, 11.9);
    planeCard(c, [0.3, 6.5 + bob, 0], 3.6);
    tag(c, "7", [2.4, 0.2, 0.2], 3.6, SEVEN, -0.05);
  } else if (id === 4) {
    // three in the afternoon
    clouds(c, 0.02, [5.2, -3.2, 2.6, -6.4, 7.6], 24);
    fx(c, "sun", 400, 400, fxSun, [-2.7, 6.4, -1], 3.3, 3.3, { rot: 0.04 * Math.sin(f * 0.1) });
    sparkle(c, [-1.5, 7.4, 0.2], SUNF, 16, 1.6);
    const at: V3 = [lerp(-3.4, 0.4, clamp01((f - 190) / 55) ** 0.9), 0.6 + bob, 0];
    planeCard(c, at, 6.2); exhaust(c, at, 6.2, 0, 1);
  } else if (id === 6) {
    // the engine goes quiet
    clouds(c, 0.12, [3.2, -3.0, 2.4, -2.2], 20);
    const w = 20, at: V3 = [0.4, 1.17 + 0.5 * bob, 0];
    planeCard(c, at, w);
    exhaust(c, at, w, 0, (1 - sm(f, A(6) + 2, QUIET)) * (0.75 + 0.25 * Math.sin(f * 1.3)));
    smoke(c, onPlane(at, w, ...ENGINE_BACK, 0, 0.3), QUIET, 20, 1.5, false);
  } else if (id === 10) {
    // but wait: it is not dropping
    clouds(c, 0.03, [6.4, -6.6, 4.2, -4.4], 22);
    planeCard(c, [0, 2.6 + bob, 0], 9);
    fx(c, "dasharrow", 240, 700, fxDashArrow, [0, -2.5, -0.1], 1.45, 4.2);
    const s = pop(f, NODROP, 8);
    if (s > 0) fx(c, "cross", 300, 300, fxCross, [0, -2.5, 0.2], 3.3 * s, 3.3 * s, { rot: 0.06 });
    question(c, [3.0, 5.6, 0.2], WHY, 2.7);
  } else if (id === 11) {
    // engines never held it up; the wings do; engines only push
    clouds(c, 0.03, [7.0, -6.8, 5.6, -5.4], 22);
    const nudge = 0.5 * sm(f, NUDGE - 2, NUDGE + 6), lift = f >= LIFT1 ? 0.12 * Math.sin((f - LIFT1) * 0.22) : 0;
    const at: V3 = [-0.3 + nudge, 1.9 + bob + lift, 0], w = 9.2, eng = onPlane(at, w, ...ENGINE_MID, 0, 0.2);
    planeCard(c, at, w);
    const gone = 1 - sm(f, LIFT1 - 10, LIFT1 - 4);
    if (f >= FAKE && gone > 0.02) fx(c, "arrow|fake", 300, 520, (p) => toonArrow(p, "#d6ecff"), [eng[0], eng[1] - 1.75, 0.2], 1.1 * pop(f, FAKE) * gone, 1.9 * pop(f, FAKE) * gone, { rot: Math.PI });
    const s = pop(f, CROSS, 5) * gone;
    if (s > 0.02) fx(c, "cross", 300, 300, fxCross, [eng[0], eng[1] - 1.75, 0.35], 1.9 * s, 1.9 * s, { rot: 0.06 });
    const wingY = at[1] - (196 / 1400) * w;
    arrow(c, [at[0] - 2.0, wingY - 1.5 + 0.1 * Math.sin(f * 0.25), 0.2], 2.7, Math.PI, LIFT1, "#49a6ff");
    arrow(c, [at[0] - 0.25, wingY - 1.5 + 0.1 * Math.sin(f * 0.25 + 1.4), 0.2], 2.7, Math.PI, LIFT2, "#49a6ff");
    arrow(c, [eng[0] - 2.7 + 0.25 * sm(f, NUDGE - 2, NUDGE + 3) * (1 - sm(f, NUDGE + 3, NUDGE + 9)), eng[1] - 0.15, 0.25], 3.0, Math.PI / 2, PUSH, "#ff8a3c");
  } else if (id === 12 || id === 13) {
    // coasting down a hill on a bike
    clouds(c, 0.01, [9.5, 2.5, 6.4, -1.5], 26);
    fx(c, "slope|hill", 1400, 1500, (p) => fxSlope(p, HILL_DEG, 0), SLOPE_AT, SLOPE_W, (SLOPE_W * 1500) / 1400);
    const u = bikeU(f), rot = -HILL_DEG * RAD, W = 2.6, bike = onSlope(HILL_DEG, u, 0.312 * W);
    const ph = q((((u / (2 * Math.PI * 0.49)) * 8) % 1), 8);
    const ca = Math.cos(rot), sa = Math.sin(rot), rel = (x: number, y: number, z = 0): V3 => [bike[0] + x * ca - y * sa, bike[1] + x * sa + y * ca, z];
    const out = sm(f, LEGS, LEGS + 8), ped = f * 0.42, k = 1 - out;
    const legs: [[number, number], [number, number]] = [[lerp(-0.22 + 0.1 * Math.cos(ped), -1.1, out), lerp(1.0 + 0.14 * Math.sin(ped), 0.42 + 0.05 * Math.sin(f * 0.6), out)], [lerp(0.22 - 0.1 * Math.cos(ped), 1.1, out), lerp(1.0 - 0.14 * Math.sin(ped), 0.42 - 0.05 * Math.sin(f * 0.6), out)]];
    put(c, GUS, { mode: "air", legs, facing: 1, look: 0.6, expr: f >= LEGS - 2 ? "laugh" : f >= COAST ? "grin" : "smile", blink: lidAt(f, 1, [COAST, LEGS - 2]), headTilt: -4 * k,
      R: { h: [0.62, 0.42], bend: 0.1, front: true }, L: { h: [-0.3, 0.5], bend: -0.2, front: true } }, rel(-0.18, 0.62, 0.4), { face: true, roll: rot * 0.5, scale: 1.5, wide: true, tall: true, noBlob: true });
    fx(c, `bike${ph}`, 500, 340, (p) => fxBike(p, ph / 8), [bike[0], bike[1], -0.6], W, (W * 340) / 500, { rot });
    if (f >= COAST + 12) streaks(c, rel(-2.4, 1.5, 0.05), 1.7, rot);
  } else if (id === 14) {
    // a plane does the same: it rolls down a hill made of air; and that hill is not steep
    clouds(c, 0.01, [9.2, -7.5, 7.2], 26);
    const deg = q(slopeDeg(f), 4), air = q(clamp01((f - (AIR - 24)) / 32), 32), rot = -deg * RAD, w = 5.6;
    fx(c, `slope|${deg}|${air}`, 1400, 1500, (p) => fxSlope(p, deg, air), SLOPE_AT, SLOPE_W, (SLOPE_W * 1500) / 1400);
    const at = onSlope(deg, planeU(f), 0.84);
    planeCard(c, [at[0], at[1], 0.1], w, rot);
    sparkle(c, [at[0] + 1.5, at[1] - 1.9, 0.3], AIR, 16, 2.0); sparkle(c, [at[0] - 1.9, at[1] - 1.2, 0.3], AIR + 5, 14, 1.4);
  } else if (id === 15) {
    // one mile down, fifteen miles ahead (true to scale)
    clouds(c, 0.02, [6.6, -6.4, 4.4, -7.6], 22);
    const n = Math.max(0, Math.min(15, Math.ceil(((f - TICKS + 1) * 15) / (TICKS_END - TICKS))));
    fx(c, `tri${n}|${f >= ONE ? 1 : 0}`, 1400, 400, (p) => fxTri(p, n, f >= ONE), TRI_AT, TRI_W, (TRI_W * 400) / 1400);
    const u = lerp(0.1, 0.86, clamp01((f - A(15)) / 101)), at = onTri(60 + 1290 * u, 120 + 86 * u);
    planeCard(c, [at[0], at[1] + 0.95 + 0.5 * bob, 0.2], 4.4, -3.81 * RAD);
    tag(c, "1", add(onTri(60, 120), [1.15, -1.9, 0.2]), 2.4, ONE, 0.05);
    tag(c, "15", [1.2, -3.6, 0.2], 4.2, FIFTEEN, -0.04);
  } else if (id === 16) {
    // flatter than a wheelchair ramp (both drawn four times steeper)
    clouds(c, 0.02, [7.4, -7.6], 22);
    const W = 8.8, H = (W * 520) / 1200, top: V3 = [0, 3.0, 0], bot: V3 = [0, -3.2, 0];
    fx(c, "wedge|air", 1200, 520, (p) => fxWedge(p, 288, 0), top, W, H);
    fx(c, "wedge|ramp", 1200, 520, (p) => fxWedge(p, 360, 1), bot, W, H);
    const u = lerp(0.3, 0.55, clamp01((f - A(16)) / 49)), px = 60 + 1080 * u, py = 470 - 288 + 288 * u, at: V3 = [((px - 600) / 1200) * W, top[1] + ((260 - py) / 1200) * W + 0.72, 0.2];
    planeCard(c, at, 3.8, -Math.atan(288 / 1080));
    const s = pop(f, CHAIR);
    if (s > 0) fx(c, "chairsign", 300, 300, fxChairSign, [2.3, bot[1] + 1.1, 0.2], 2.0 * s, 2.0 * s);
    sparkle(c, [at[0] + 0.6, at[1] + 0.9, 0.4], FLATTER, 14, 1.6);
  } else if (id === 17) {
    // over a hundred miles, almost twenty minutes
    clouds(c, 0.02, [7.6, -6.6, -8.0], 22);
    fx(c, "ground", 1400, 200, fxGround, [0, -1.25, -0.2], 9.8, 1.4);
    dash(c, G0, G1);
    fx(c, "span", 160, 900, fxSpan, [-4.15, 0.5, 0], 0.5, 2.8);
    tag(c, "7", [-2.7, 3.7, 0.2], 2.6, SEVEN2, 0.04);
    const u = clamp01((f - GLIDE) / (GLIDE_END - GLIDE)), k = u * u * (3 - 2 * u) * 0.5 + u * 0.5, at = mix3(G0, G1, 0.04 + 0.74 * k);
    planeCard(c, [at[0], at[1] + 0.8 + 0.4 * bob, 0.1], 3.6, -12 * RAD * sm(f, GLIDE - 4, GLIDE + 8));
    const s = pop(f, HUNDRED);
    if (s > 0) fx(c, "span", 160, 900, fxSpan, [-0.3, -2.45, 0], 0.5 * s, 6.6 * s, { rot: Math.PI / 2 });
    tag(c, "100+", [0.2, -3.9, 0.2], 4.4, HUNDRED, -0.03);
    const cs = pop(f, CLOCK), ck = q(clamp01((f - SWEEP) / (TWENTY - SWEEP)), 22);
    if (cs > 0) fx(c, `clock${ck}`, 400, 400, (p) => fxClock(p, ck), [2.3, 6.1, 0], 3.5 * cs, 3.5 * cs);
    tag(c, "20", [-1.0, 5.9, 0.2], 2.6, TWENTY, -0.05);
  } else if (id === 19) {
    // the little propeller under the belly
    clouds(c, 0.1, [7.2, -5.4, -7.4, 5.8], 24);
    const P: V3 = [-1.4, 2.6 + bob, 0], w = 13, hatch = onPlane(P, w, 880, 336, 0, 0.15);
    planeCard(c, P, w);
    puff(c, [hatch[0], hatch[1] - 0.2, 0.3], HATCH, 10, 1.3);
    const k = f < DROP ? 0 : Math.min(1.12, popIn(f, DROP, 6)), spin = sm(f, SPIN, SPIN + 22);
    if (k > 0.02) {
      const ph = q(((f * (0.05 + 0.2 * spin)) % 1), 8), fast = spin > 0.6 ? 1 : 0;
      fx(c, `rat${ph}|${fast}`, 300, 420, (p) => fxRat(p, ph, fast), [hatch[0], hatch[1] - 1.75 * k, 0.2], 2.5, 3.5 * k);
      if (f >= DROP + 8) { streaks(c, [hatch[0] + 2.9, hatch[1] - 2.6, 0.1], 2.4); streaks(c, [hatch[0] - 3.0, hatch[1] - 2.4, 0.1], 2.0); }
    }
    const hub: V3 = [hatch[0], hatch[1] - 2.5, 0.4], cock = onPlane(P, w, 1236, 232, 0, 0.4);
    for (let i = 0; i < 6; i++) { const t = i / 5; sparkle(c, [lerp(hub[0], cock[0], t), lerp(hub[1], cock[1], t) - 0.9 * Math.sin(Math.PI * t) * 0 + 0.0, 0.4], POWER + i * 3, 10, 1.3); }
    const ys = pop(f, POWER + 8), lit = f >= CONTROLS;
    if (ys > 0) fx(c, `yoke${lit ? 1 : 0}`, 300, 300, (p) => fxYoke(p, lit), [cock[0] - 0.7, cock[1] + 2.6, 0.3], 2.4 * ys, 2.4 * ys);
    sparkle(c, [cock[0] + 0.3, cock[1] + 3.6, 0.5], CONTROLS, 16, 1.5);
  } else if (id === 21) {
    // a normal flight: the engines go back to idle a hundred miles out
    clouds(c, 0.03, [7.6, -0.8, -7.9], 22);
    const go = 0.16 * sm(f, HUNDRED2 + 4, A(22)), at = mix3(D0, D1, go), w = 5.2, rot = -6 * RAD * sm(f, HUNDRED2, HUNDRED2 + 12);
    dash(c, add(D0, [2.5, -0.15, 0]), D1);
    fx(c, "runway", 400, 80, fxRunway, [D1[0] + 0.35, D1[1] - 0.2, 0], 1.9, 0.38);
    planeCard(c, at, w, rot);
    exhaust(c, at, w, rot, 1 - sm(f, PULL + 4, IDLE));
    const bs = pop(f, THING) * (1 - sm(f, PULL - 14, PULL - 8));
    if (bs > 0.02) fx(c, "bulb", 300, 400, fxBulb, [at[0] + 0.4, at[1] + 2.5, 0.2], 1.8 * bs, 2.4 * bs);
    const tk = q(sm(f, PULL - 2, PULL_END + 4), 60);
    fx(c, `throttle${tk}`, 700, 620, (p) => fxThrottle(p, tk), [-0.5, -4.2 + 0.05 * Math.sin(f * 0.12), 0], 6.4, 5.67);
    if (f >= IDLE) sleepBubble(c, add(onPlane(at, w, ...ENGINE_BACK, rot, 0.3), [-0.2, -0.2, 0]), 1.0 * Math.min(1, pop(f, IDLE)));
    tag(c, "100", [2.2, 1.5, 0.2], 3.2, HUNDRED2, 0.05);
  } else if (id === 22) {
    // gliding home
    fx(c, "land", 1400, 220, fxLand, [0, -7.45, -0.2], 10.6, 1.67, { gain: 0.92 });
    fx(c, "house|1", 400, 400, (p) => fxHouse(p, true), [2.5, -5.1, 0], 3.6, 3.6);
    const u = sm(f, HOME - 16, A(22) + 110), at: V3 = [lerp(-1.6, 0.2, u), lerp(3.6, 1.4, u) + bob, 0.1];
    planeCard(c, at, 6.4, -9 * RAD);
    sparkle(c, [2.5, -2.9, 0.3], HOUSE, 16, 1.8);
  }
};
/** the kit's chunky arrow shape in another colour (300 x 520, pointing down) */
const toonArrow = (p: import("../../toon/kit").Pen, col: string) => p.poly([[100, 30], [200, 30], [200, 300], [270, 300], [150, 490], [30, 300], [100, 300]], col, 13);

// ---------------- the ocean at night: the real glide ----------------
const oceanStage = (c: Ctx) => {
  const { f } = c, N = 0.85;
  const jet = JET_AT(f), w = 2.3, gear = f >= ISLAND;
  const isl = ISLAND_AT(f);
  if (f >= ISLAND - 2) fx(c, "island", 900, 320, fxIsland, isl, 3.0, 1.07, { gain: 0.9 });
  planeCard(c, [jet[0], jet[1], 0], w, f < LAND ? -3 * RAD : 0, N, gear);
  exhaust(c, [jet[0], jet[1], 0], w, -3 * RAD, f < EMPTY ? 1 : f < OUT ? 0.3 + 0.4 * Math.abs(Math.sin(f * 0.9)) : 0.4 * (1 - sm(f, OUT, OUT + 6)), N);
  const gs = pop(f, GAUGE) * (1 - sm(f, MILES75 - 18, MILES75 - 3));
  if (gs > 0.02) {
    const k = q(0.34 * (1 - sm(f, GAUGE + 6, EMPTY - 2)), 30), red = f >= EMPTY && Math.floor((f - EMPTY) / 4) % 2 === 0;
    fx(c, `fuel${k}|${red ? 1 : 0}`, 400, 400, (p) => fxFuel(p, k, red), [1.0, 0.75, 0.1], 1.5 * gs, 1.5 * gs, { gain: 0.95 });
  }
  tag(c, "75", [0.5 + 0.8 * sm(f, ISLAND, ISLAND + 26), 0.8 + 1.75 * sm(f, ISLAND, ISLAND + 26), 0.1], 1.6, MILES75, -0.04, 0.95);
  if (f >= LAND - 1) { puff(c, [jet[0] + 0.3, jet[1] - 0.3, 0.2], LAND, 10, 0.7); puff(c, [jet[0] - 0.25, jet[1] - 0.3, 0.2], LAND + 2, 10, 0.6); }
  for (let i = 0; i < 5; i++) {
    const f0 = LIVED - 2 + i * 3, u = (f - f0) / 26;
    if (u > 0 && u < 1) fx(c, "heart", 200, 200, fxHeart, [jet[0] - 0.8 + 0.4 * i, jet[1] + 0.45 + 0.9 * u, 0.3], 0.3 * Math.sin(Math.PI * u) ** 0.5, 0.3 * Math.sin(Math.PI * u) ** 0.5, { gain: 0.95 });
  }
  sparkle(c, [jet[0] + 0.5, jet[1] + 0.6, 0.4], LIVED, 16, 0.6); sparkle(c, [jet[0] - 0.6, jet[1] + 0.8, 0.4], LIVED + 6, 14, 0.5);
  sparkle(c, [isl[0] - 0.3, isl[1] + 0.25, 0.2], ISLAND + 3, 14, 0.5);
};

// ---------------- the cabin ----------------
const LAP: Arm = { h: [0.2, 0.62], bend: 0.2 };
const UP: Arm = { h: [0.38, -1.4], bend: -0.05 };
/** the seat back with its screen, filling the frame in front of the lens */
const pov = (c: Ctx, s: Screen, poke = 0, px = 0.02) => {
  const d = povDist(c.id, c.f), cam = c.cam;
  const at = (x: number, y: number, dd: number): V3 => [cam.pos.x + cam.fwd.x * dd + cam.right.x * x + cam.up.x * y, cam.pos.y + cam.fwd.y * dd + cam.right.y * x + cam.up.y * y, cam.pos.z + cam.fwd.z * dd + cam.right.z * x + cam.up.z * y];
  fx(c, "seat" + JSON.stringify(s), 900, 1600, (p) => fxSeatBack(p, s), at(0, 0, d), 0.66, 1.1733);
  if (poke > 0.01) fx(c, "finger", 300, 700, fxFinger, at(px + 0.05 - 0.03 * poke, lerp(-0.74, -0.13, poke), d - 0.04), 0.15, 0.35, { rot: 0.3 });
};
const pokeAt = (f: number, f0: number, rise = 11) => (f < f0 - rise ? 0 : f < f0 ? sm(f, f0 - rise, f0) : f < f0 + 2 ? 1 : 1 - sm(f, f0 + 2, f0 + 16));
const poke20 = (f: number) => (f < POKE1 ? sm(f, POKE1 - 11, POKE1) : f < POKE2 - 4 ? 1 - 0.4 * sm(f, POKE1 + 2, POKE1 + 7) : f < POKE2 + 2 ? 0.6 + 0.4 * sm(f, POKE2 - 4, POKE2) : 1 - sm(f, POKE2 + 2, POKE2 + 18));
const movie = (f: number): Screen => ({ mode: "movie", ph: (f % 24) / 24, prog: 0.5 });
const offAt = (f: number, f0: number, face: Screen["face"], faceFrom: number): Screen =>
  f < f0 ? movie(f) : f < f0 + 4 ? { mode: "line", line: q(1 - (f - f0) / 4, 4) } : { mode: "off", face: f >= faceFrom ? face : "", fade: Math.min(8, Math.max(0, f - faceFrom + 1)) / 8, blink: f >= faceFrom + 12 && (f - faceFrom) % 46 > 42 };

const cabin = (c: Ctx) => {
  const { id, f } = c;
  if (id === 3) return pov(c, offAt(f, STOP, "wow", STOP + 9));
  if (id === 7) return pov(c, offAt(f, BLACK, "wow", REFLECT));
  if (id === 20) return pov(c, { mode: "off", face: "sad", blink: (f - A(20)) % 46 > 42, icon: f >= NOPE }, poke20(f), 0.1);
  if (id === 23) return pov(c, { mode: "off", face: "stern", blink: (f >= SIGH && f < SIGH + 5) || (f >= TAP + 12 && f < TAP + 15) }, 0.86 * pokeAt(f, TAP, 20), 0.12);
  // the seat row from the aisle: the neighbor at the window, the wife in the middle, Gus on the aisle
  const grab = sm(f, GRAB - 3, GRAB + 3), yell = sm(f, YELL - 5, YELL + 2), yelling = f >= YELL - 2 && f < YELL + 46;
  const eat = id === 9 ? sm(f, BITE - 8, BITE - 1) * (1 - sm(f, BITE + 6, BITE + 16)) : 0, bitten = id === 9 && f >= BITE;
  const lean = id === 5 ? 1 : 0;
  put(c, NEIGHBOR, { mode: "chair", expr: id === 5 ? "smile" : f >= GRAB - 1 ? "shock" : "wow", blink: lidAt(f, 6, [GRAB - 1]), look: id === 5 ? 0 : q(0.5 * (1 - grab), 20), tilt: 0.8 * Math.sin(f * 1.9) * grab, headTilt: -3 * grab,
    L: armMix(LAP, { h: [0.5, 0.72], bend: -0.25 }, grab), R: armMix(LAP, { h: [0.5, 0.72], bend: -0.25 }, grab) }, seatAt(0), { noBlob: true, wide: true, tall: true });
  put(c, WIFE, { mode: "chair", expr: bitten ? (f < BITE + 5 ? "bite" : "chew") : "neutral", chew: ((f - BITE) % 12) / 12, blink: lidAt(f, 7, bitten ? [BITE, BITE + 5] : []), headTilt: 2 + 3 * eat,
    R: LAP, L: { h: [lerp(0.32, 0.26, eat), lerp(0.34, 0.28, eat)], bend: -0.2, front: true, prop: "plate", arg: bitten ? 1 : 0 } }, add(seatAt(1), [-0.04, 0, 0]), { noBlob: true, wide: true, tall: true });
  const flap = id === 5 ? 0 : yell * (0.75 + 0.25 * Math.sin(f * 0.8));
  const gusExpr = id === 5 ? (f >= LAUGH ? "laugh" : "grin") : yelling ? talk(f) : f >= YELL - 2 ? "shock" : "nervous";
  const g = put(c, GUS, { mode: "chair", expr: gusExpr, blink: id === 5 ? lidAt(f, 2, [LAUGH]) : yelling ? 0 : lidAt(f, 2, [YELL - 2, YELL + 46]), tilt: lean * (5 + 1.2 * Math.sin(f * 0.5) * (f >= LAUGH ? 1 : 0)) + 1.5 * Math.sin(f * 0.9) * yell,
    headTilt: lean * -3, look: id === 5 ? 0 : q(-0.6 * (1 - yell), 20),
    L: armMix(LAP, { h: [0.4, -1.3 + 0.1 * Math.sin(f * 0.8)], bend: -0.05 }, flap), R: armMix(LAP, { ...UP, h: [0.38, -1.4 + 0.1 * Math.cos(f * 0.8)] }, flap) }, add(seatAt(2), [-0.08, 0, 0]), { noBlob: true, wide: true, tall: true });
  if (id === 8 || id === 9) {
    const head = g.at(g.A.head, 0.06), s = pop(f, ROCK) * (1 - sm(f, A(9) - 6, A(9) + 2));
    if (s > 0.02) fx(c, "rockthought", 460, 460, fxRockThought, [head[0], head[1] + 0.56 + 0.03 * (f >= ROCKFALL ? Math.sin((f - ROCKFALL) * 0.5) : 0), head[2] - 0.28], 0.52 * s, 0.52 * s);
  }
};

/** called once per frame and canvas; c.shot is the current shot */
export const stage = (c: Ctx) => {
  if (c.shot.place === "sky") skyStage(c);
  else if (c.shot.place === "ocean") oceanStage(c);
  else cabin(c);
};
