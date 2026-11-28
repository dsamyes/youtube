// Staging of "What If Your Pool Was 100 Feet Deep?": who stands where in which pose, and every 2D card, for all 23
// shots. stage(c) is a pure function of the shot and the frame; the timing comes from story.ts, the drawings from
// props.ts (plus the kit's pancake).
import {
  Ctx, V3, Arm, put, fx, armMix, sm, lidAt, q, talk, reach, HANG, HIP, clamp01, lerp, lin, hash, draw,
  GUS, WIFE, NEIGHBOR, sparkle, question, arrow, puff, splash, ripples, popIn,
} from "../../toon/kit";
import {
  A, BBALL1, FLOOR1, POINT, AT100, T200, HONK, CAL, DOZE, WEEKS, LAUGH, WAVE, PUSH, POPUP, UPARROW, T60, TIE, PAT, LOWER,
  HALF, QUARTER, FLOOR2, BBALL2, HANDS, WHAT, BUCKET, HEAVY, STK, MORE, SQUASH, SLAB, BOTTOM, WBLOCK, T34, AIRCOL, LEVEL, SPACE,
  COUNT, TILE, FOOT, TONS, PULL, OUT, BACK, GULP, DUCK, TWO,
  GUS_B, BALL_W, BALL_D, BAR_RIM, WIFE_AT, PLATE, NB, STEP, WATER_Y, RIM_H, depthAt, sizeAt, markY, floorY, BALL_C, BAR_C, WALL_Z, FLOOR_Y,
  PIVOT, ARM, beamAt,
} from "./story";
import { fxBeach, fxRing, fxBasket, fxBarbell, fxRope, fxBubble, fxMark, fxNum, fxTruck, fxCalendar, fxHose, fxBucket, fxPlate, fxDuck, fxRuler, fxSlab, fxStand, fxBeam, fxPan, fxWBlock, fxAir, fxWeight, fxTile, RED } from "./props";

/** popIn that is 0 before its frame */
const pop = (f: number, f0: number, n = 6) => (f < f0 ? 0 : popIn(f, f0, n));
/** 0..1 bump around f0 */
const pulseK = (f: number, f0: number, up = 4, down = 8) => (f < f0 - up || f >= f0 + down ? 0 : f < f0 ? sm(f, f0 - up, f0) : 1 - sm(f, f0, f0 + down));

// ---------------- props ----------------
const tag = (c: Ctx, text: string, at: V3, w: number) => { if (w > 0.01) fx(c, "num" + text, 360, 260, (p) => fxNum(p, text), at, w, w * 0.722); };
const mark = (c: Ctx, text: string, at: V3, w: number) => fx(c, "mark" + text, 360, 200, (p) => fxMark(p, text), at, w, w * 0.556);
/** the beach ball: at = centre, k = width fraction (1 at the surface), sq = squash */
const ball = (c: Ctx, at: V3, k = 1, sq = 0, rot = 0, w = BALL_D) => { const kk = q(k, 50), ss = q(sq, 12); fx(c, `beach${kk}_${ss}`, 400, 400, (p) => fxBeach(p, kk, ss), at, w * (400 / 340), w * (400 / 340), { rot }); };
const ring = (c: Ctx, at: V3, w = BALL_D) => fx(c, "ring", 400, 400, fxRing, at, w * (400 / 340), w * (400 / 340));
const barbell = (c: Ctx, at: V3, w = 0.95, rot = 0) => fx(c, "barbell", 640, 300, fxBarbell, at, w, w * (300 / 640), { rot });
/** a rope from a to b (seen square on) */
const rope = (c: Ctx, a: V3, b: V3, w = 0.045) => {
  const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d);
  if (L < 0.02) return;
  const sx = d[0] * c.cam.right.x + d[2] * c.cam.right.z;
  fx(c, "rope", 40, 400, fxRope, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], w, L, { rot: Math.atan2(sx, -d[1]) });
};
/** bubbles rising round a centre: n of them in a column `wide` across, `rate` = extra speed (the lens going down) */
const bubbles = (c: Ctx, at: V3, n: number, seed = 0, wide = 1.3, rate = 1, tall = 3.6) => {
  for (let i = 0; i < n; i++) {
    const per = Math.round((34 + 30 * hash(i, seed + 1)) / rate), u = ((c.f + Math.floor(hash(i, seed + 2) * per)) % per) / per;
    const side = i % 2 ? 1 : -1, x = at[0] + side * (0.12 + (wide / 2 - 0.12) * hash(i, seed + 3)) + 0.04 * Math.sin(c.f * 0.3 + i), s = 0.05 + 0.07 * hash(i, seed + 4);
    fx(c, "bubble", 100, 100, fxBubble, [x, at[1] + (u - 0.5) * tall, at[2] + 0.3 * (hash(i, seed + 5) - 0.5)], s, s, { soft: true });
  }
};
/** the point on the plane z = zp that lies on the lens's line of sight to p (so a hand at Gus's depth meets it on screen) */
const onPlane = (c: Ctx, p: V3, zp: number): V3 => { const cp = c.cam.pos, t = (zp - cp.z) / (p[2] - cp.z); return [cp.x + (p[0] - cp.x) * t, cp.y + (p[1] - cp.y) * t, zp]; };
const cake = (c: Ctx, at: V3, sq: number, w = 0.5, wide = 1) => { const s = q(sq, 20); fx(c, `cake${s}`, 300, 300, (p) => draw.fxPancake(p, s), at, w * wide, w); };

// ---------------- under water ----------------
const MARKS = [10, 20, 34, 40, 50, 60, 70, 80, 90, 100];
const marks = (c: Ctx, d: number, x = -0.62, big = 0) => {
  for (const D of MARKS) { const y = markY(D, d); if (Math.abs(y) < 3.2) mark(c, String(D), D === big ? [x * 0.2, y, WALL_Z + 0.05] : [x, y, WALL_Z + 0.05], D === big ? 0.9 : 0.5); }
};
/** ball on its rope over the barbell, the dashed ring of its first size, the rope to the surface */
const rig = (c: Ctx, d: number, o: { sq?: number; ringOn?: boolean; wob?: number } = {}) => {
  const k = sizeAt(d), sway = 0.02 * Math.sin(c.f * 0.11);
  const b: V3 = [BALL_C[0] + sway, BALL_C[1], BALL_C[2]];
  rope(c, [BAR_C[0] + 0.45, BAR_C[1] + 6, -0.03], [BAR_C[0] + 0.45, BAR_C[1], -0.03]);
  rope(c, [b[0], b[1] - 0.2 * k, 0.01], [BAR_C[0], BAR_C[1] + 0.03, 0.01], 0.035);
  if (o.ringOn ?? true) ring(c, [b[0], b[1], 0.02]);
  ball(c, [b[0], b[1], 0.04], k, o.sq ?? 0, 0.04 * Math.sin(c.f * 0.09) + (o.wob ?? 0));
  barbell(c, [BAR_C[0], BAR_C[1], 0.06]);
};
const deep = (c: Ctx) => {
  const { id, f } = c, d = depthAt(id, f);
  if (id === 1 || id === 2) {
    marks(c, d);
    rig(c, d, { wob: 0.05 * Math.sin(f * 0.5) * (f < FLOOR1 ? 1 : 0) });
    bubbles(c, [0, 0.2, 0.1], 16, 1, 1.5, f < FLOOR1 ? 3 : 1);
    if (id === 2) {
      puff(c, [BAR_C[0], floorY(100) + 0.15, 0.2], FLOOR1, 12, 1.1);
      const s = pop(f, BBALL1) * BALL_D * sizeAt(100);
      if (s > 0.01) fx(c, "basket", 300, 300, fxBasket, [0.5, BALL_C[1] + 0.02 * Math.sin(f * 0.1), 0.05], s * (300 / 256), s * (300 / 256));
    }
  } else if (id === 4) {
    marks(c, d, -0.62, 100);
    bubbles(c, [0, 0, 0.1], 18, 4, 1.7, f < AT100 ? 3.5 : 1);
    sparkle(c, [0.3, markY(100, d) + 0.2, WALL_Z + 0.1], AT100, 14, 0.5);
  } else if (id === 10) {
    marks(c, d);
    rig(c, d, { sq: 0.1 * pulseK(f, HALF, 3, 6) + 0.12 * pulseK(f, QUARTER, 3, 7) });
    bubbles(c, [0, 0.1, 0.1], 12, 7, 1.5, f > 884 && f < FLOOR2 ? 3 : 1);
    puff(c, [BAR_C[0], floorY(100) + 0.15, 0.2], FLOOR2, 12, 1.0);
  } else if (id === 11) {
    marks(c, d);
    rig(c, d);
    bubbles(c, [0.1, 0, 0.1], 7, 9, 1.2, 0.7);
    const s = pop(f, BBALL2) * BALL_D * sizeAt(100);
    if (s > 0.01) fx(c, "basket", 300, 300, fxBasket, [0.5, BALL_C[1] + 0.015 * Math.sin(f * 0.1), 0.05], s * (300 / 256), s * (300 / 256));
    sparkle(c, [0.5, BALL_C[1] + 0.3, 0.1], BBALL2 + 3, 12, 0.3);
  } else if (id === 16 || id === 18) {
    // the stack of slabs on the ball
    const n = id === 16 ? 3 : 4, H = 0.34, W = 1.1, y0 = BALL_C[1] + 0.2 + H / 2;
    let land = 0;
    for (let i = 0; i < n; i++) {
      const f0 = id === 16 ? SLAB[i] : -1e9, drop = id === 16 ? 1.5 * (1 - clamp01((f - (f0 - 14)) / 14)) ** 1.5 : 0;
      if (f >= f0 - 14) fx(c, `slab${i === 3 ? 1 : 0}`, 700, 200, (p) => fxSlab(p, i === 3 ? 1 : 0), [0, y0 + i * H + drop, 0.05 + 0.01 * i], W, W * (200 / 700));
      if (f >= f0) land++;
    }
    const press = id === 16 ? 0.07 * land + 0.06 * SLAB.reduce((s, f0) => s + pulseK(f, f0, 1, 6), 0) : 0.26 + 0.14 * pulseK(f, COUNT[3], 3, 9);
    ball(c, [BALL_C[0], BALL_C[1] - 0.04 * press, 0.04], sizeAt(100), press);
    barbell(c, [BAR_C[0], BAR_C[1], 0.06]);
    rope(c, [BALL_C[0], BALL_C[1] - 0.12, 0.01], [BAR_C[0], BAR_C[1] + 0.03, 0.01], 0.035);
    bubbles(c, [0.75, 0.4, 0.1], 5, 11 + id, 0.5, 0.7);
    if (id === 16) arrow(c, [0.62, BALL_C[1], 0.1], 0.5, -Math.PI / 2, BOTTOM, RED);
    else for (let i = 0; i < 4; i++) tag(c, String(i + 1), [-0.74, y0 + (3 - i) * H + 0.02, 0.12], 0.3 * pop(f, COUNT[i]));
  } else if (id === 19) {
    // one floor tile and three tons
    const fy = FLOOR_Y;
    if (f >= TILE - 1) fx(c, "tile", 300, 300, fxTile, [0, fy + 0.012, 0.25], 0.72 * sm(f, TILE - 2, TILE + 7), 0.72 * sm(f, TILE - 2, TILE + 7), { flat: true });
    const r = pop(f, FOOT);
    if (r > 0.01 && f < TONS - 4) { fx(c, "ruler", 120, 420, fxRuler, [0, fy + 0.1, 0.72], 0.2 * r, 0.85 * r, { rot: Math.PI / 2 }); tag(c, "1", [0.36, fy + 0.44, 0.72], 0.34 * r); }
    const fall = f < TONS ? 0.028 * (TONS - f) ** 2 : 0;
    if (f >= TONS - 13) fx(c, "weight", 520, 500, fxWeight, [0, fy + 0.6 + fall, 0.25], 1.25, 1.2);
    puff(c, [-0.6, fy + 0.2, 0.5], TONS, 12, 0.9); puff(c, [0.6, fy + 0.2, 0.5], TONS, 12, 0.9);
    bubbles(c, [0, 0.3, 0.3], f >= TONS ? 14 : 4, 13, 1.9, f >= TONS && f < TONS + 30 ? 2 : 0.7);
  } else if (id === 20) {
    marks(c, d);
    rig(c, d);
    bubbles(c, [0, 0.1, 0.1], 12, 15, 1.5, 0.5);
  }
};

// ---------------- the street and the board ----------------
const street = (c: Ctx) => {
  const { f } = c, run = (f - A(5)) * 0.085;
  for (let i = -1; i < 5; i++) fx(c, "truck", 800, 460, fxTruck, [i * 3.6 + 2.2 - run * 0.8, 1.5, -7], 3.3, 1.9);
  for (let i = -1; i < 5; i++) { const hop = i === 0 ? 0.05 * pulseK(f, HONK, 2, 6) : 0; fx(c, "truck", 800, 460, fxTruck, [i * 3.6 - run, 0.87 + hop + 0.008 * Math.sin(f * 0.9 + i), 0], 3.3, 1.9); }
  tag(c, "200", [0.05, 2.75, 0.2], 1.15 * pop(f, T200));
};
const board = (c: Ctx) => {
  const { f } = c, a = beamAt(f), L: V3 = [PIVOT[0] - ARM * Math.cos(a), PIVOT[1] - ARM * Math.sin(a), 0], R: V3 = [PIVOT[0] + ARM * Math.cos(a), PIVOT[1] + ARM * Math.sin(a), 0];
  fx(c, "stand", 400, 1000, fxStand, [PIVOT[0], PIVOT[1] - 0.99, 0], 0.9, 2.25);
  const airDrop = 6.5 * (1 - clamp01((f - (AIRCOL - 18)) / 18)) ** 2, top = R[1] - 0.68;
  if (f >= AIRCOL - 18) fx(c, "air", 300, 2400, fxAir, [R[0], top + 3.0 + airDrop, 0.03], 0.7, 5.6 + 0.4);
  fx(c, "beam", 1000, 80, fxBeam, [PIVOT[0], PIVOT[1], 0.02], 1.74, 0.15, { rot: a });
  const wDrop = 3 * (1 - clamp01((f - (WBLOCK - 8)) / 8)) ** 2;
  fx(c, "wblock", 400, 400, fxWBlock, [L[0] - 0.04, L[1] - 0.68 + 0.36 + wDrop, 0.03], 0.74, 0.74);
  for (const e of [L, R]) fx(c, "pan", 500, 420, fxPan, [e[0], e[1] - 0.4, 0.05], 0.95, 0.84);
  tag(c, "34", [L[0] - 0.05, L[1] + 0.5, 0.1], 0.6 * pop(f, T34));
  sparkle(c, [PIVOT[0], PIVOT[1] + 0.05, 0.12], LEVEL, 14, 0.5);
  sparkle(c, [R[0] + 0.1, top + 5.6, 0.1], SPACE, 14, 0.5);
};

// ---------------- the garden ----------------
const ROPE_W: V3 = [1.0, WATER_Y, -0.88];
const HOLD = (y: number): Arm => ({ h: [-0.1, y - 0.12], bend: 0.3, front: true });
const garden = (c: Ctx) => {
  const { id, f } = c;
  const G = GUS_B;
  if (id === 3) {
    const pt = sm(f, POINT - 5, POINT + 1);
    put(c, GUS, { expr: f >= POINT - 2 ? "grin" : "smile", blink: lidAt(f, 1, [POINT - 2]), look: -0.2 * pt, headTilt: 4 * pt,
      L: HIP, R: { ...armMix(HIP, { h: [0.42, 0.86], bend: 0.02 }, pt), front: true, hand: pt > 0.5 ? "point" : undefined } }, G);
    ripples(c, [1.0, WATER_Y + 0.01, 0.1], 1.6, 1.2);
  } else if (id === 6) {
    const doze = sm(f, DOZE - 2, DOZE + 8);
    const g = put(c, GUS, { expr: f >= DOZE + 3 ? "asleep" : "neutral", blink: lidAt(f, 1, [DOZE + 3]), headTilt: 9 * doze, tilt: 2 * doze,
      L: HANG, R: { h: [0.6, 0.34 + 0.08 * doze], bend: 0.1, front: true } }, G, { wide: true });
    const h = g.at(g.A.R, 0.06), ph = q(((f / 5) % 4), 4);
    fx(c, `hose${ph}`, 500, 420, (p) => fxHose(p, ph), [h[0] + 0.3, h[1] - 0.24, h[2]], 0.95, 0.8);
    const n = Math.round(21 * clamp01((f - CAL - 4) / (WEEKS + 12 - CAL - 4))), s = pop(f, CAL);
    if (s > 0.01) fx(c, `cal${n}`, 400, 460, (p) => fxCalendar(p, n), [1.72, 1.85, G[2] + 0.05], 0.5 * s, 0.575 * s);
    tag(c, "3", [1.56, 2.26, G[2] + 0.1], 0.36 * pop(f, WEEKS));
    if (f >= DOZE + 10) { const u = ((f - DOZE) % 40) / 40; fx(c, "bubble", 100, 100, fxBubble, [G[0] - 0.3 - 0.1 * u, 1.75 + 0.3 * u, G[2] + 0.1], 0.1 + 0.14 * u, 0.1 + 0.14 * u, { soft: true }); }
  } else if (id === 7) {
    const laugh = f >= LAUGH - 2 && f < 480, lamp = sm(f, LAUGH - 2, LAUGH + 7) * (1 - sm(f, 470, 480)), wave = pulseK(f, WAVE + 4, 8, 14);
    put(c, NEIGHBOR, { expr: laugh ? "laugh" : f >= 482 && f < 540 ? talk(f) : "smile", blink: lidAt(f, 3, [LAUGH - 2, 480]), headTilt: 4 * lamp * Math.sin(f * 0.8),
      tilt: 2 * lamp * Math.sin(f * 0.8), L: HANG, R: armMix(HANG, { h: [0.7, -0.35], bend: -0.25 }, wave) }, NB, { noBlob: true, wide: true });
  } else if (id === 8) {
    const WY = BALL_W[1];
    const by = lin([[544, 0.86], [565, 0.86], [573, 1.02], [590, 0.98], [604, WY], [PUSH, WY], [PUSH + 9, WY - 0.3], [POPUP, WY - 0.2], [POPUP + 5, WY + 0.62], [POPUP + 11, WY - 0.06], [POPUP + 17, WY + 0.07], [POPUP + 23, WY]], f);
    const out = sm(f, 590, 604), bz = lerp(G[2] + 0.12, BALL_W[2], out), bp: V3 = [1.0, by, bz];
    const after = f >= POPUP, top = onPlane(c, [1.0, by + 0.2, bz], G[2]);
    const up = sm(f, POPUP, POPUP + 5), calm = sm(f, POPUP + 30, POPUP + 44);
    const hl = reach(c, G, -1, [top[0] - 0.16, top[1], top[2]]), hr = reach(c, G, 1, [top[0] + 0.16, top[1], top[2]]);
    const UPL: Arm = { h: [0.62, -0.5], bend: -0.2 }, k = up * (1 - calm);
    put(c, GUS, { expr: after ? (f < POPUP + 40 ? "shock" : "wow") : f >= PUSH - 2 ? "stern" : "smile", blink: lidAt(f, 1, [PUSH - 2, POPUP, POPUP + 40]), look: after ? 0 : -0.1,
      tilt: 8 * sm(f, 598, 606) * (1 - up) - 6 * k, headTilt: 5 * sm(f, 598, 606) * (1 - up),
      L: armMix(armMix({ h: hl, bend: 0.15, front: true }, UPL, k), HANG, calm), R: armMix(armMix({ h: hr, bend: 0.15, front: true }, UPL, k), HANG, calm) }, G, { wide: true });
    ball(c, bp, 1, 0, 0.5 * sm(f, POPUP, POPUP + 12));
    splash(c, [1.0, WATER_Y + 0.4, bz + 0.05], POPUP, 15, 1.5);
    if (f >= 604) ripples(c, [1.0, WATER_Y + 0.01, bz], 1.3, 0.9);
    arrow(c, [0.58, WY + 0.28, bz + 0.02], 0.5, Math.PI, UPARROW, RED);
    tag(c, "60", [0.63, WY + 0.8, bz + 0.02], 0.4 * pop(f, T60));
  } else if (id === 9) {
    const go = clamp01((f - LOWER) / 10), sink = go * go, gone = f >= LOWER + 12;
    const bar: V3 = [lerp(BAR_RIM[0], 1.0, go), BAR_RIM[1] - 1.1 * sink, lerp(BAR_RIM[2], -0.9, go)];
    const bl: V3 = [lerp(0.6, 1.0, sm(f, LOWER + 1, LOWER + 9)), RIM_H + 0.3 - 1.3 * clamp01((f - LOWER - 3) / 10) ** 2, lerp(-1.22, -0.9, go)];
    const pay = f >= LOWER + 6, alt = Math.sin(f * 0.5);
    const pat = pulseK(f, PAT, 5, 8), tie = pulseK(f, TIE + 3, 5, 10);
    const g = put(c, GUS, { expr: pay ? "wow" : pat > 0.3 ? "grin" : "smile", blink: lidAt(f, 1, [LOWER + 6]), look: -0.3, headTilt: 7, tilt: 8,
      L: pay ? HOLD(0.62 + 0.14 * alt) : armMix(HOLD(0.75), { h: [0.5, 1.2], bend: 0.05, front: true }, tie),
      R: pay ? HOLD(0.62 - 0.14 * alt) : armMix(HOLD(0.75), { h: [0.3, 1.25], bend: 0.05, front: true, hand: "point" }, pat) }, G, { wide: true });
    if (!gone) { rope(c, [bl[0] + 0.2, bl[1] - 0.1, bl[2] + 0.01], [bar[0] - 0.2, bar[1], bar[2] + 0.01], 0.035); barbell(c, bar, 0.95, 0.5 * sink); ball(c, bl, 1, 0, 0.6 * go); }
    if (!pay) rope(c, g.at(g.A.L, 0.03), [bar[0] + 0.1, bar[1] + 0.05, bar[2] + 0.02]);
    else rope(c, g.at(g.A.R, 0.03), onPlane(c, ROPE_W, G[2] + 0.1));
    sparkle(c, [bar[0] + 0.3, bar[1] + 0.15, bar[2] + 0.1], PAT, 12, 0.3);
    splash(c, [1.0, WATER_Y + 0.5, -0.86], LOWER + 3, 16, 1.9);
    if (f >= LOWER + 3) ripples(c, [1.0, WATER_Y + 0.01, -0.85], 1.4, 1.0);
  } else if (id === 12) {
    const lk = sm(f, HANDS - 10, HANDS + 4);
    const g = put(c, GUS, { expr: f >= WHAT - 2 ? "wow" : "nervous", blink: lidAt(f, 1, [WHAT - 2]), look: -0.5 * (1 - lk) + 0.6 * lk, headTilt: 6 * (1 - lk),
      R: HOLD(0.6), L: armMix(HOLD(0.72), { h: [0.5, 0.3], bend: -0.2, front: true }, lk) }, G, { wide: true });
    rope(c, g.at(g.A.R, 0.03), [g.at(g.A.R)[0] + 0.02, -0.4, G[2] + 0.1]);
    question(c, [G[0] + 0.36, 2.0, G[2] + 0.05], WHAT, 0.3);
  } else if (id === 13) {
    const lift = sm(f, BUCKET - 2, BUCKET + 12), drag = sm(f, HEAVY - 8, HEAVY + 3);
    const g = put(c, GUS, { expr: f >= HEAVY - 4 ? "pained" : "smile", blink: lidAt(f, 1, [HEAVY - 4]), tilt: -13 * drag, headTilt: -5 * drag, look: 0.4,
      L: HIP, R: armMix({ h: [0.55, 1.15 - 0.6 * lift], bend: 0.1, front: true }, { h: [0.32, 1.42], bend: 0.02, front: true }, drag) }, G, { wide: true });
    const h = g.at(g.A.R, 0.05);
    fx(c, "bucket", 260, 300, fxBucket, [h[0], h[1] - 0.21, h[2]], 0.42, 0.485, { rot: 0.12 * drag });
    splash(c, [h[0] + 0.1, h[1] - 0.1, h[2] + 0.05], HEAVY + 4, 12, 0.7);
  } else if (id === 14 || id === 15) {
    const hold = reach(c, WIFE_AT, 1, [PLATE[0] - 0.12, PLATE[1] - 0.03, PLATE[2]]);
    put(c, WIFE, { expr: "neutral", blink: lidAt(f, 7), look: 0.7, headTilt: -2, L: HANG, R: { h: hold, bend: 0.2, front: true } }, WIFE_AT, { wide: true });
    fx(c, "plate", 420, 110, fxPlate, [PLATE[0], PLATE[1], PLATE[2] + 0.02], 0.62, 0.16);
    // the stack: 3 to start with, two more on each beat of shot 14, one more on each beat of shot 15
    const drops: number[] = [-999, -999, -999];
    for (const f0 of STK) drops.push(f0, f0 + 4);
    for (const f0 of MORE) drops.push(f0);
    const n = drops.filter((f0) => f >= f0).length, STEP_Y = 0.062;
    const flat = id === 15 ? clamp01((n - 11) / 3) * 0.6 + 0.4 * sm(f, SQUASH - 6, SQUASH + 5) : 0;
    const lean = (i: number) => 0.012 * Math.sin(i * 1.7) + 0.004 * i * Math.sin(f * 0.07);
    drops.forEach((f0, i) => {
      if (f < f0 - 10) return;
      const fall = 0.36 * (1 - clamp01((f - (f0 - 10)) / 10)) ** 1.5, low = i === 0 ? 0 : 0.03 * flat;
      const at: V3 = [PLATE[0] + (i ? lean(i) : 0), PLATE[1] + 0.05 + i * STEP_Y - low + fall, PLATE[2] + 0.03 + 0.002 * i];
      if (i === 0) cake(c, at, 0.3 - 0.14 * flat, 0.5, 1 + 0.3 * flat); else cake(c, at, 0.3);
    });
    if (id === 15) arrow(c, [PLATE[0] + 0.3, PLATE[1] + 0.06, PLATE[2] + 0.1], 0.22, -Math.PI / 2, A(15) + 3, RED);
  } else if (id === 21) {
    const WY = BALL_W[1], alt = Math.sin(f * 0.55), done = f >= OUT;
    const by = lin([[OUT - 4, WY - 0.75], [OUT, WY - 0.3], [OUT + 5, WY + 0.6], [OUT + 11, WY - 0.06], [OUT + 17, WY + 0.07], [OUT + 23, WY]], f);
    const th = sm(f, BACK - 5, BACK);
    const g = put(c, GUS, { expr: f >= BACK - 2 ? "grin" : done ? "wow" : "stern", blink: lidAt(f, 1, [OUT, BACK - 2]), look: -0.2, tilt: done ? 0 : 5, headTilt: done ? 0 : 5,
      R: done ? HOLD(0.7) : HOLD(0.6 - 0.16 * alt), L: done ? { ...armMix(HOLD(0.7), { h: [0.36, 0.12], bend: -0.3 }, th), front: true, hand: th > 0.5 ? "thumb" : undefined } : HOLD(0.6 + 0.16 * alt) }, G, { wide: true });
    rope(c, g.at(g.A.R, 0.03), onPlane(c, [1.0, WATER_Y, BALL_W[2] - 0.2], G[2] + 0.1));
    if (f >= PULL) ripples(c, [1.0, WATER_Y + 0.01, BALL_W[2]], 1.3, 0.9);
    if (f >= OUT - 4) ball(c, [1.0, by, BALL_W[2]], 1, 0, 0.4 * sm(f, OUT, OUT + 14));
    splash(c, [1.0, WATER_Y + 0.4, BALL_W[2] + 0.05], OUT, 15, 1.6);
    sparkle(c, [G[0] - 0.42, 1.25, G[2] + 0.1], BACK, 14, 0.3);
  } else if (id === 22) {
    const gl = pulseK(f, GULP, 7, 11);
    put(c, GUS, { expr: "nervous", blink: lidAt(f, 1), look: -0.4, headTilt: 5 - 4 * gl, squash: 0.12 * gl, tilt: -3 * sm(f, GULP, GULP + 10), L: HANG, R: HANG }, G);
  } else if (id === 23) {
    const pad = Math.sin(f * 0.42), s = STEP;
    const g = put(c, GUS, { expr: f >= TWO - 2 ? "smile_closed" : "grin", blink: lidAt(f, 1, [TWO - 2]), headTilt: 3 * Math.sin(f * 0.1),
      L: { h: [0.5, 0.5], bend: 0.2, front: true }, R: { h: [0.8, 0.42 + 0.12 * pad], bend: -0.1 } }, s, { noBlob: true, wide: true });
    const sq = 1 + 0.06 * pulseK(f, DUCK, 2, 5);
    fx(c, "duck", 600, 360, fxDuck, [s[0] - 0.03, s[1] + 0.96, s[2] + 0.06], 0.8 * sq, 0.48 / sq);
    ripples(c, [s[0], WATER_Y + 0.01, s[2] + 0.1], 1.5, 1.0);
    const h = g.at(g.A.R);
    if (pad > 0.6) fx(c, "bubble", 100, 100, fxBubble, [h[0] + 0.05, WATER_Y + 0.25, s[2] + 0.1], 0.1, 0.1, { soft: true });
    ball(c, [0.5, BALL_W[1] + 0.015 * Math.sin(f * 0.13), -0.8], 1, 0, 0.1 * Math.sin(f * 0.05));
    const r = pop(f, TWO);
    if (r > 0.01) { fx(c, "ruler", 120, 420, fxRuler, [s[0] + 0.5, WATER_Y + 0.3, s[2] + 0.05], 0.17 * r, 0.6 * r); tag(c, "2", [s[0] + 0.62, WATER_Y + 0.95, s[2] + 0.08], 0.46 * r); }
  }
};

/** called once per frame and canvas; c.shot is the current shot */
export const stage = (c: Ctx) => {
  const p = c.shot.place;
  if (p === "deep") deep(c); else if (p === "street") street(c); else if (p === "board") board(c); else garden(c);
};
