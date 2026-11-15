// Staging of "What If You Ran in Glass Slippers?": who stands where in which pose, and every 2D card, for all 24
// shots. stage(c) is a pure function of the shot and the frame; the timing comes from story.ts, the drawings from
// props.ts (plus the iron weight and the sweat drops of plane-door-midflight).
import {
  Ctx, V3, Pose, Arm, PutOpt, P2, Look, put, fx, armMix, sm, lidAt, q, HANG, HIP, clamp01, lerp, lin, add, hash,
  GUS, WIFE, NEIGHBOR, sparkle, question, burst, puff, arrow, cloud, note, popIn, Pen,
} from "../../toon/kit";
import {
  ELE1, ELE2, HOLDS, HOOKCRACK, POSE, CIND, COVER, THINK, IMAGINE, GULP, STAND, N1, HOP, LAND, N2, NOTE1, NOTE2, N3, DROP, SMASH, WHY, WIGGLE,
  PRESS1, OK1, PRESS2, CRUMBLE, GCUBE, SUGAR, TENFALL, TEN, TENOK, HEEL, HAND, STRIKE, GASP, BOLT, STEP, G1, G2, G3, TILT, SPARK,
  BEND, SQUEEZE, STRETCH, BARS, COUNT, WEAK, RIP1, RIP2, STRAIN, NOTCH, TEAR, EAT, LENS, SCRATCHES, PULL, CRACKRUN, SPLIT, NEWBAR, PUSH, SHUT,
  SNAP, TRIP, HEELFLY, GONE, HOPS, HOP_N, PICK, STORY,
  FLOOR, FLOOR_W, GUS_AT, WIFE_AT, NEIGH_AT, GUS7, NEIGH7, CLOCK, CLOCK_H, CLOCK_W, CUP_AT, GATE, SNAP_AT, runX, hopAt, GUS_P, SHELF_Y, SLIP, SLIP_W, SLIP_H, FLOOR_Y,
} from "./story";
import {
  fxSlipper, fxSlip, fxHeelBit, fxShards, fxFoot, fxElephant, fxCube, fxRubble, fxShelf, fxWeights, fxThoughtShoe, fxCup, fxClock, fxLanterns, fxFloor, fxGate,
  fxHalfGus, fxMiniGus, fxHeel, fxBar, fxBarHalf, fxBarV, fxHook, fxLens, fxChips, fxChip, RED, BLUE,
} from "./props";
import { fxWeight, fxSweat } from "../plane-door-midflight/props";

/** popIn that is 0 before its frame */
const pop = (f: number, f0: number, n = 6) => (f < f0 ? 0 : popIn(f, f0, n));
const pulse = (f: number, f0: number, up = 4, down = 8) => (f < f0 - up || f >= f0 + down ? 0 : f < f0 ? sm(f, f0 - up, f0) : 1 - sm(f, f0, f0 + down));
const NG = 0.72;                                    // unlit cards at night
/** Gus in white socks: the glass slippers are cards over his feet */
const GUSS: Look = { ...GUS, id: "gussock", foot: "#f4f8fc" };
const HHu = 221.8, U = 2.36, HIPY = 975 - 1.52 * HHu;
type Slip = { L?: number; R?: number };            // heel state of the slipper on each foot (undefined = none)
const feet = (pose: Pose): [P2, P2] => {
  if (pose.mode === "air") { const legs = pose.legs ?? [[-0.42, 1.1], [0.5, 0.96]]; return legs.map(([lx, ly], i) => [300 + lx * HHu + (i ? 1 : -1) * 5 * U, HIPY + ly * HHu]) as [P2, P2]; }
  const sq = pose.squash ?? 0; return [[300 - (27 + sq * 9) * U, 965.6], [300 + (27 + sq * 9) * U, 965.6]];
};
/** Gus with glass slippers on (he stands 3 cm higher: the heels) */
const gusG = (c: Ctx, pose: Pose, pos: V3, slip: Slip = { L: 0, R: 0 }, o: PutOpt = {}) => {
  const g = put(c, GUSS, pose, [pos[0], pos[1] + 0.03, pos[2]], o), ft = feet(pose), gain = c.light === "night" ? 0.85 : 1;
  const foot = (side: number): V3 => { const pt = ft[side < 0 ? 0 : 1]; return g.at([pt[0] + side * 4, pt[1] - 18], 0.03); };
  for (const side of [-1, 1]) { const h = side < 0 ? slip.L : slip.R; if (h !== undefined) fx(c, `slip${side}|${h}`, 300, 210, (p) => fxSlip(p, side, h), foot(side), 0.27, 0.189, { gain }); }
  return { ...g, foot };
};
const glint = (c: Ctx, g: { foot: (s: number) => V3 }, f0: number, size = 0.24) => { for (const s of [-1, 1]) sparkle(c, add(g.foot(s), [0, 0.04, 0.03]), f0 + (s > 0 ? 2 : 0), 14, size); };
const sweat = (c: Ctx, at: V3, f0: number, size = 0.5) => { if (c.f >= f0 && c.f < f0 + 10) { const u = q((c.f - f0) / 10, 20); fx(c, `sweat${u}`, 200, 200, (p) => fxSweat(p, u), at, size, size, { gain: NG }); } };
/** shards flying out of a point for 14 frames */
const shardsFly = (c: Ctx, at: V3, f0: number, size: number, seed = 3, col?: string, gain = 1) => {
  if (c.f < f0 || c.f >= f0 + 14) return;
  const u = (c.f - f0) / 14, s = size * (0.45 + 1.1 * u) * (1 - sm(c.f, f0 + 9, f0 + 14));
  fx(c, `shards${seed}${col ?? ""}`, 300, 200, (p) => fxShards(p, seed, col), [at[0], at[1] + 0.5 * size * u * (1.4 - u), at[2]], s, s * 0.667, { gain, rot: 0.4 * u });
};
/** a run: legs scissor, arms pump; ph = phase */
const runPose = (ph: number, extra: Pose = {}, front = false): Pose => ({
  mode: "air", legs: front ? [[-0.34 + 0.08 * Math.sin(ph), 1.48 - 0.55 * Math.max(0, Math.cos(ph))], [0.34 - 0.08 * Math.sin(ph), 1.48 - 0.55 * Math.max(0, -Math.cos(ph))]]
    : [[-0.2 + 0.34 * Math.sin(ph), 1.48 - 0.45 * Math.max(0, Math.cos(ph))], [0.2 - 0.34 * Math.sin(ph), 1.48 - 0.45 * Math.max(0, -Math.cos(ph))]],
  L: { h: [0.42, 0.36 + 0.32 * Math.sin(ph)], bend: -0.32 }, R: { h: [0.42, 0.36 - 0.32 * Math.sin(ph)], bend: -0.32 }, ...extra,
});

// ---------------- the sky: flat diagrams over a sea of clouds ----------------
const cloudSea = (c: Ctx, speed = 0.03, y0 = -5.2) => {
  for (let i = 0; i < 12; i++) {
    const x0 = -54 + i * 9 + 4 * hash(i, 31), x = ((((x0 - speed * c.f) % 108) + 108) % 108) - 54;
    cloud(c, [x, y0 - 2.6 - 4.5 * hash(i, 32), -6 - 34 * hash(i, 33)], 9 + 6 * hash(i, 34), i % 4);
  }
};
const shelf = (c: Ctx, y: number, w = 3.7) => fx(c, "shelf", 1200, 110, fxShelf, [0, y - 0.123 * (w / 3.6), -0.02], w, w * 0.0917);
const weight = (c: Ctx, label: string, x: number, bottom: number, size: number, z = 0.05, rot = 0) =>
  fx(c, `weight${label}`, 300, 300, (p) => fxWeight(p, label), [x, bottom + 0.393 * size, z], size, size, { rot });
/** how far above its rest a thing is that falls in and lands on f0 */
const fallIn = (f: number, f0: number, h = 6, n = 9) => (f >= f0 ? 0 : h * (1 - clamp01((f - (f0 - n)) / n) ** 2));
const bounce = (f: number, f0: number, a = 0.06) => (f < f0 ? 0 : a * Math.sin((f - f0) * 0.9) * Math.exp(-(f - f0) / 5));
const flipped = (draw: (p: Pen) => void, w: number) => (p: Pen) => { p.g.save(); p.g.translate(w, 0); p.g.scale(-1, 1); draw(p); p.g.restore(); };

/** the big slipper with two elephants on it (shots 1 and 12); t1, t2 = landing frames */
const tower = (c: Ctx, t1: number, t2: number) => {
  const { f } = c, sway = f >= t2 ? 0.035 * Math.sin((f - t2) * 0.17) : 0, dip = -bounce(f, t1, 0.09) - bounce(f, t2, 0.07);
  if (f >= t1 - 10) fx(c, "elephant", 520, 420, (p) => fxElephant(p), [-0.05 + 0.4 * sway, -0.82 + dip + fallIn(f, t1, 7, 10), -0.06], 2.6, 2.1, { rot: -sway * 0.6 });
  if (f >= t2 - 10) fx(c, "elephantB", 520, 420, flipped((p) => fxElephant(p, "#aab6c6"), 520), [0.0 + 1.6 * sway, 0.52 + dip + fallIn(f, t2, 6, 10), -0.12], 2.2, 1.777, { rot: -sway * 1.3 });
  fx(c, "slipper0", 900, 630, (p) => fxSlipper(p, 0), [SLIP[0], SLIP[1] + dip, 0], SLIP_W, SLIP_H);
  for (const t of [t1, t2]) puff(c, [-0.3, t === t1 ? -1.75 : -0.25, 0.2], t, 10, 1.6);
};

const skyStage = (c: Ctx) => {
  const { id, f } = c;
  cloudSea(c, 0.03, id === 1 || id === 12 ? -6.4 : -5.2);
  if (id === 1) {
    tower(c, ELE1, ELE2);
    sparkle(c, [-0.78, -2.5, 0.3], HOLDS, 18, 1.3); sparkle(c, [0.95, -2.35, 0.3], HOLDS + 5, 16, 0.9);
  } else if (id === 12) {
    tower(c, -100, -100);
    sparkle(c, [-0.72, -2.75, 0.3], HEEL, 18, 1.2);
  } else if (id === 10) {
    // the press: glass holds, concrete crumbles
    shelf(c, SHELF_Y);
    const gx = -0.85, cx = 0.85, top = SHELF_Y + 0.79;
    fx(c, "cubeglass", 300, 300, (p) => fxCube(p, "glass"), [gx, SHELF_Y + 0.477 - bounce(f, PRESS1, 0.03), 0], 1.1, 1.1);
    weight(c, "", gx - 0.07, top + fallIn(f, PRESS1) - bounce(f, PRESS1, 0.03), 1.2);
    burst(c, [gx, top, 0.2], PRESS1, 6, 1.3);
    sparkle(c, [gx - 0.2, SHELF_Y + 0.45, 0.3], OK1, 16, 0.8); sparkle(c, [gx + 0.3, SHELF_Y + 0.15, 0.3], OK1 + 4, 14, 0.5);
    const gone = f >= CRUMBLE, sink = gone ? (top - SHELF_Y - 0.42) * sm(f, CRUMBLE, CRUMBLE + 5) : 0;
    if (!gone) fx(c, "cubeconcrete", 300, 300, (p) => fxCube(p, "concrete"), [cx + (f >= PRESS2 ? 0.012 * Math.sin(f * 2.2) : 0), SHELF_Y + 0.477, 0], 1.1, 1.1);
    else fx(c, "rubble", 360, 200, fxRubble, [cx, SHELF_Y + 0.33, 0], 1.45 * pop(f, CRUMBLE - 2, 5), 0.8);
    if (f >= PRESS2 - 9) weight(c, "", cx - 0.07, top + fallIn(f, PRESS2) - sink, 1.2);
    burst(c, [cx, top, 0.2], PRESS2, 6, 1.3);
    puff(c, [cx - 0.5, SHELF_Y + 0.3, 0.2], CRUMBLE, 12, 1.5); puff(c, [cx + 0.5, SHELF_Y + 0.3, 0.2], CRUMBLE + 1, 12, 1.5);
  } else if (id === 11) {
    // a small glass cube, a bigger sugar cube, ten tons on the glass
    shelf(c, SHELF_Y);
    const gx = -0.58, sG = pop(f, GCUBE), sS = pop(f, SUGAR), gw = 0.9, top = SHELF_Y + 0.717 * gw;
    if (sG > 0) fx(c, "cubeglass", 300, 300, (p) => fxCube(p, "glass"), [gx, SHELF_Y + 0.433 * gw * sG - bounce(f, TEN, 0.03), 0], gw * sG, gw * sG);
    if (sS > 0) fx(c, "cubesugar", 300, 300, (p) => fxCube(p, "sugar"), [1.02, SHELF_Y + 0.433 * 1.2 * sS, 0], 1.2 * sS, 1.2 * sS);
    if (f >= TENFALL) weight(c, "10", gx - 0.05, top + 6.5 * (1 - clamp01((f - TENFALL) / (TEN - TENFALL)) ** 2) - bounce(f, TEN, 0.04), 2.1, 0.05);
    burst(c, [gx, top, 0.2], TEN, 7, 2.2);
    sparkle(c, [gx - 0.1, SHELF_Y + 0.36, 0.3], TENOK, 16, 0.75);
  } else if (id === 15) {
    // the step: the foot lands with two and a half Guses on it, then tips onto the heel edge
    shelf(c, FLOOR_Y, 3.9);
    const down = f >= STEP ? 0 : 1.7 * (1 - clamp01((f - 1005) / (STEP - 1005))) ** 1.6;
    const th = 0.19 * sm(f, TILT, SPARK), tip: V3 = [-1.25, FLOOR_Y + down, 0];       // the heel tip; the card turns about it
    const dx = 1.0, dy = 1.4, cs = Math.cos(th), sn = Math.sin(th);
    fx(c, "foot", 900, 900, fxFoot, [tip[0] + dx * cs - dy * sn, tip[1] + dx * sn + dy * cs - bounce(f, STEP, 0.04), 0], 3.0, 3.0, { rot: th });
    burst(c, [0.2, FLOOR_Y + 0.1, 0.2], STEP, 6, 1.5); puff(c, [-1.2, FLOOR_Y + 0.15, 0.2], STEP, 10, 1.1); puff(c, [1.3, FLOOR_Y + 0.15, 0.2], STEP + 1, 10, 1.1);
    const off = 1 - sm(f, TILT - 16, TILT - 3);
    [G1, G2, G3].forEach((f0, i) => {
      const s = pop(f, f0, 5) * off; if (s <= 0.02) return;
      fx(c, i === 2 ? "halfgus" : "minigus", 300, 400, i === 2 ? fxHalfGus : fxMiniGus, [1.05, FLOOR_Y + 1.02 + i * 0.86, 0.1], 0.69 * s, 0.92 * s);
    });
    burst(c, [tip[0] + 0.1, FLOOR_Y + 0.12, 0.25], SPARK, 7, 1.3, "#ffe9a0");
    sparkle(c, [tip[0] + 0.1, FLOOR_Y + 0.5, 0.3], SPARK + 3, 14, 0.7);
  } else if (id === 16) {
    const bend = q(sm(f, BEND, BEND + 20), 20), sq = q(sm(f, SQUEEZE - 1, SQUEEZE + 9), 12), st = q(sm(f, STRETCH - 1, STRETCH + 9), 12);
    fx(c, `heel|${bend}|${sq}|${st}`, 700, 1000, (p) => fxHeel(p, bend, Math.min(1.12, sq), Math.min(1.12, st)), [-0.1, -0.2, 0], 3.08, 4.4);
  } else if (id === 17) {
    // squeezed: twenty-five weights. Stretched: one, and it snaps
    shelf(c, SHELF_Y);
    const s = pop(f, BARS, 6); if (s <= 0) return;
    const lx = -0.72, rx = 0.86;
    fx(c, "barV0", 240, 700, (p) => fxBarV(p, 0), [lx, SHELF_Y + 0.96 * s, 0], 0.72 * s, 2.1 * s);
    const n = Math.max(1, Math.min(25, Math.round(lin([[COUNT, 1], [COUNT + 22, 25]], f))));
    fx(c, `weights${n}`, 520, 520, (p) => fxWeights(p, n), [lx, SHELF_Y + 1.92 * s + 0.72, 0.05], 1.5 * s, 1.5 * s);
    fx(c, "hook", 400, 160, fxHook, [rx, 1.5, -0.02], 1.2 * s, 0.48 * s);
    const broke = f >= WEAK, drop = broke ? 0.3 * sm(f, WEAK, WEAK + 6) : 0, by = 1.5 - 0.15 - 1.05 * 0.9;
    if (!broke) fx(c, "barV0", 240, 700, (p) => fxBarV(p, 0), [rx, 1.5 - 0.15 - 0.945 * s, 0], 0.648 * s, 1.89 * s);
    else {
      fx(c, "barV1", 240, 700, (p) => fxBarV(p, 1), [rx, by, 0], 0.648, 1.89);
      fx(c, "barV2", 240, 700, (p) => fxBarV(p, 2), [rx + 0.03, by - drop, 0], 0.648, 1.89, { rot: -0.08 * sm(f, WEAK, WEAK + 6) });
    }
    weight(c, "", rx - 0.04, by - 0.86 - 0.62 * s - drop, 0.78 * s);
    burst(c, [rx, by - 0.05, 0.2], WEAK, 6, 1.4); shardsFly(c, [rx, by - 0.05, 0.25], WEAK, 0.9, 4);
  } else if (id === 19) {
    fx(c, "bar|-1|0", 1000, 300, (p) => fxBar(p, -1, 0), [0, -0.2, 0], 3.3, 0.99);
    const k = sm(f, LENS - 8, LENS + 14), lx = lerp(3.3, 0.15, k);
    fx(c, "lens", 520, 640, fxLens, [lx + 0.037, 0.0 - 0.29, 0.2], 1.9, 2.34);
    sparkle(c, [lx - 0.3, 0.12, 0.3], SCRATCHES, 16, 0.5); sparkle(c, [lx + 0.3, 0.05, 0.3], SCRATCHES + 5, 16, 0.4);
  } else if (id === 20) {
    if (f < NEWBAR - 6) {
      // pull: the scratch opens, the crack runs, the halves fly apart
      const notch = q(lerp(0.4, 1, sm(f, PULL + 2, CRACKRUN)), 10), crack = q(clamp01((f - CRACKRUN) / (SPLIT - CRACKRUN)), 6);
      if (f < SPLIT) fx(c, `bar|${notch}|${crack}`, 1000, 300, (p) => fxBar(p, notch, crack), [0, -0.2, 0], 3.3, 0.99);
      else {
        const d = Math.min(4, 0.02 * (f - SPLIT + 1) ** 2);
        for (const s of [-1, 1]) fx(c, `barHalf${s}`, 520, 300, (p) => fxBarHalf(p, s), [s * (0.792 + d), -0.2 - 0.05 * d, 0], 1.716, 0.99, { rot: -s * 0.1 * d });
        burst(c, [0, -0.2, 0.2], SPLIT, 6, 1.5); shardsFly(c, [0, -0.2, 0.25], SPLIT, 1.0, 6);
      }
      const ak = pop(f, PULL, 6) * (1 - sm(f, SPLIT + 2, SPLIT + 8)), tug = 0.06 * Math.sin(f * 0.5);
      if (ak > 0.03) for (const s of [-1, 1]) arrow(c, [s * (1.0 + tug), 0.95, 0.2], 1.1 * ak, (s * Math.PI) / 2, -1e9, RED);
    } else {
      // squeeze: the scratch is held shut
      const s = 1, bx = 4.2 * (1 - sm(f, NEWBAR - 6, NEWBAR + 14)), notch = q(lerp(0.85, 0, sm(f, PUSH + 6, SHUT)), 10);
      if (s > 0) fx(c, `bar|${notch}|0`, 1000, 300, (p) => fxBar(p, notch, 0), [bx, -0.2, 0], 3.3 * s, 0.99 * s);
      const ak = pop(f, PUSH, 6), tug = 0.05 * Math.sin(f * 0.5);
      if (ak > 0.03) for (const sd of [-1, 1]) arrow(c, [sd * (1.05 + tug), 0.95, 0.2], 1.1 * ak, (-sd * Math.PI) / 2, -1e9, BLUE);
      sparkle(c, [0, 0.12, 0.3], SHUT, 18, 0.9);
    }
  }
};

// ---------------- the garden at night ----------------
const party = (c: Ctx, hour = 330, clock = true) => {
  fx(c, "floor", 800, 800, fxFloor, FLOOR, FLOOR_W, FLOOR_W, { flat: true, gain: 0.5 });
  fx(c, "lanterns", 1800, 240, fxLanterns, [0, 2.95, -2.7], 6.8, 0.907, { gain: 0.95 });
  if (clock) fx(c, `clock${hour}`, 300, 900, (p) => fxClock(p, hour), [CLOCK[0], CLOCK_H / 2, CLOCK[2]], CLOCK_W, CLOCK_H, { gain: 0.8 });
  fx(c, "gate", 420, 420, fxGate, [GATE[0], 0.6, GATE[2]], 1.2, 1.2, { gain: NG });
};
const UP: Arm = { h: [0.62, -0.5], bend: -0.2 };

const garden = (c: Ctx) => {
  const { id, f } = c;
  party(c, id >= 13 ? (f >= HAND ? 360 : q(lerp(330, 360, sm(f, HAND - 3, HAND)), 1)) : 330, id < 21);
  if (id === 2) {
    // HOOK 2: Gus runs at the lens; a crack at his slipper
    const z = lerp(-0.8, 1.7, (f - 115) / 43), ph = (f - 115) * 0.85;
    const g = gusG(c, runPose(ph, { expr: "shock", blink: lidAt(f, 1) }, true), [-0.3, 0.05 * Math.abs(Math.sin(ph)), z], { L: 0, R: f >= HOOKCRACK ? 1 : 0 }, { wide: true });
    burst(c, add(g.foot(1), [0, 0.02, 0.05]), HOOKCRACK, 6, 0.8); shardsFly(c, add(g.foot(1), [0.1, 0.05, 0.06]), HOOKCRACK, 0.5, 3, undefined, NG);
  } else if (id === 3) {
    gusG(c, { expr: "smile", blink: lidAt(f, 1), L: HIP, R: HIP }, GUS_AT);
    put(c, WIFE, { expr: "neutral", facing: -1, look: -1, blink: lidAt(f, 7), L: HIP, R: HANG }, WIFE_AT);
    put(c, NEIGHBOR, { expr: "grin", look: -1, blink: lidAt(f, 6), L: HANG, R: { h: [0.62, -0.6 + 0.08 * Math.sin(f * 0.4)], bend: -0.25 } }, NEIGH_AT, { wide: true });
  } else if (id === 4) {
    const k = sm(f, POSE, POSE + 9);
    const g = gusG(c, { expr: "grin", blink: lidAt(f, 1), look: q(0.6 * k, 10), headTilt: 5 * k, L: HIP, R: { ...armMix(HANG, { h: [0.56, 0.7], bend: 0.05 }, k), front: true, hand: "point" } }, GUS_AT, { L: 0, R: 0 }, { wide: true });
    glint(c, g, CIND, 0.3);
  } else if (id === 5) {
    // the wife cannot look
    const k = sm(f, COVER - 4, COVER + 5), gl = f >= GULP;
    const w = put(c, WIFE, { expr: f < COVER ? "nervous" : gl ? "nervous" : "pained", blink: lidAt(f, 7, [COVER, GULP]), headTilt: -9 * sm(f, COVER - 4, COVER + 5) + 3 * pulse(f, GULP, 3, 6), tilt: -3 * k,
      L: armMix(HANG, { h: [0.5, -0.42], bend: -0.3 }, k), R: armMix(HANG, { h: [0.5, -0.36], bend: -0.3 }, k) }, WIFE_AT, { wide: true });
    const h = w.at(w.A.head, 0.05), s = pop(f, THINK);
    if (s > 0) fx(c, `thought${f >= IMAGINE ? 1 : 0}`, 460, 420, (p) => fxThoughtShoe(p, f >= IMAGINE), [h[0] - 0.42, h[1] + 0.4, h[2]], 0.55 * s, 0.5 * s, { gain: 0.9 });
    burst(c, [h[0] - 0.4, h[1] + 0.42, h[2] + 0.05], IMAGINE, 5, 0.5, "#d8f2ff");
  } else if (id === 6) {
    // stands up: nothing. Hops: nothing.
    const sq = (1 - sm(f, STAND - 3, STAND + 7)) * 0.9 + 0.5 * pulse(f, HOP - 1, 6, 3), u = clamp01((f - HOP) / (LAND - HOP)), y = f >= HOP && f < LAND ? 0.26 * Math.sin(Math.PI * u) ** 1.5 : 0;
    const look = sm(f, N1 - 8, N1 - 2);
    const g = gusG(c, { expr: f < STAND + 4 ? "nervous" : f < N1 - 2 ? "wow" : "smile", squash: q(sq, 40), blink: lidAt(f, 1, [STAND + 4, N1 - 2]), headTilt: 7 * look * (1 - 0.6 * sm(f, HOP - 6, HOP)),
      L: armMix(HANG, UP, sm(f, HOP - 2, HOP + 5) * (1 - sm(f, LAND - 3, LAND + 6))), R: armMix(HANG, UP, sm(f, HOP - 2, HOP + 5) * (1 - sm(f, LAND - 3, LAND + 6))) }, [GUS_AT[0], y, GUS_AT[2]], { L: 0, R: 0 }, { wide: true });
    glint(c, g, N1); glint(c, g, N2);
  } else if (id === 7) {
    // dances with the neighbor: still nothing
    const sw = Math.sin((f - 451) * 0.36), hopY = 0.05 * Math.abs(Math.cos((f - 451) * 0.36)), down = sm(f, N3 - 8, N3 - 2);
    const g = gusG(c, { expr: down > 0.5 ? "wow" : "laugh", tilt: 7 * sw, headTilt: 4 * sw + 6 * down, blink: lidAt(f, 1, [N3 - 5]), L: { h: [0.62, -0.5 + 0.1 * sw], bend: -0.2 }, R: { h: [0.62, -0.5 - 0.1 * sw], bend: -0.2 } },
      [GUS7[0] + 0.07 * sw, hopY, GUS7[2]], { L: 0, R: 0 }, { wide: true });
    const n = put(c, NEIGHBOR, { expr: "laugh", tilt: 7 * sw, headTilt: 4 * sw, blink: lidAt(f, 6), L: { h: [0.62, -0.45 + 0.1 * sw], bend: -0.2 }, R: { h: [0.62, -0.45 - 0.1 * sw], bend: -0.2 } }, [NEIGH7[0] + 0.07 * sw, hopY, NEIGH7[2]], { wide: true });
    note(c, add(g.at(g.A.top, 0.05), [-0.35, 0.1, 0]), NOTE1, 0); note(c, add(n.at(n.A.top, 0.05), [0.3, 0.05, 0]), NOTE2, 1);
    glint(c, g, N3, 0.3);
  } else if (id === 8) {
    // a dropped cup breaks on the floor
    if (f < SMASH) {
      const u = clamp01((f - DROP) / (SMASH - DROP));
      fx(c, "cup", 200, 200, fxCup, [CUP_AT[0], 0.14 + 0.78 * (1 - u * u) + (f < DROP ? 0.012 * Math.sin(f * 0.9) : 0), CUP_AT[2]], 0.3, 0.3, { rot: -2.2 * u + (f < DROP ? 0.12 * Math.sin(f * 0.6) : 0), gain: 0.85 });
    } else {
      const k = 0.55 + 0.45 * sm(f, SMASH, SMASH + 6);
      fx(c, "shards8#ffffff", 300, 200, (p) => fxShards(p, 8, "#ffffff", 9), [CUP_AT[0], 0.1, CUP_AT[2]], 0.46 * k, 0.3 * k, { gain: 0.85 });
      burst(c, [CUP_AT[0], 0.2, CUP_AT[2] + 0.1], SMASH, 6, 0.8); shardsFly(c, [CUP_AT[0], 0.2, CUP_AT[2] + 0.12], SMASH, 0.5, 5, "#ffffff", 0.85);
    }
  } else if (id === 9) {
    const g = gusG(c, { expr: "wow", squash: q(0.14 * pulse(f, WIGGLE, 3, 6), 40), L: HANG, R: HANG }, GUS_AT);
    question(c, [GUS_AT[0], 0.72, GUS_AT[2] + 0.2], WHY, 0.36);
    sparkle(c, add(g.foot(1), [0.02, 0.06, 0.03]), WIGGLE, 12, 0.2);
  } else if (id === 13) {
    // the clock strikes twelve
    if (f >= STRIKE) for (const s of [-1, 1]) arrowless(c, s, f);
  } else if (id === 14) {
    const k = sm(f, GASP - 3, GASP + 3);
    if (f < BOLT) gusG(c, { expr: "shock", blink: lidAt(f, 1), look: -1, L: armMix(HANG, UP, k), R: armMix(HANG, UP, k) }, GUS_AT, { L: 0, R: 0 }, { wide: true, tall: true });
    else {
      const ph = (f - BOLT) * 0.9, x = GUS_AT[0] - 0.003 * (f - BOLT) ** 2 - 0.015 * (f - BOLT);
      gusG(c, runPose(ph, { expr: "shock", facing: -1, tilt: -9 * sm(f, BOLT, BOLT + 5) }), [x, 0.05 * Math.abs(Math.sin(ph)), GUS_AT[2]], { L: 0, R: 0 }, { wide: true, tall: true });
      puff(c, [GUS_AT[0] + 0.2, 0.12, GUS_AT[2] + 0.1], BOLT + 1, 10, 0.8);
    }
  } else if (id === 21 || id === 22 || id === 23) {
    if (f < SNAP) {
      const ph = (f - 1680) * 0.9, x = runX(f);
      const g = gusG(c, runPose(ph, { expr: "nervous", facing: -1, tilt: -9, blink: lidAt(f, 1) }), [x, 0.05 * Math.abs(Math.sin(ph)), SNAP_AT[2]], { L: 0, R: 0 }, { wide: true });
      for (const f0 of [1700, 1718, 1734]) sweat(c, add(g.at(g.A.head, 0.08), [0.2, 0.25, 0]), f0, 0.55);
    } else if (id === 22 || f < HOPS[0] - 6) {
      // snap: the back heel is gone; he tips and catches himself on one leg; the heelless slipper drops off
      const k = sm(f, SNAP, SNAP + 8), wob = 5 * Math.sin((f - SNAP) * 0.5) * Math.exp(-(f - SNAP) / 22), OFF = TRIP + 34, on = f < OFF;
      const g = gusG(c, { mode: "air", expr: f < TRIP + 22 ? "shock" : "nervous", facing: -1, look: q(lerp(-1, 1, sm(f, HEELFLY - 2, HEELFLY + 6)) , 10), blink: lidAt(f, 1, [TRIP + 22]), tilt: 10 * k * (1 - 0.6 * sm(f, TRIP + 6, TRIP + 20)) + wob,
        legs: [[-0.12, 1.48], [lerp(0.2, 0.46, k), lerp(1.48, 1.02, k)]], L: { h: [0.7, -0.2 + 0.1 * Math.sin(f * 0.8) * (1 - sm(f, TRIP + 14, TRIP + 24))], bend: -0.2 }, R: { h: [0.7, -0.3 - 0.1 * Math.sin(f * 0.8) * (1 - sm(f, TRIP + 14, TRIP + 24))], bend: -0.2 } },
        SNAP_AT, { L: 0, R: on ? 2 : undefined }, { wide: true });
      const ft = g.foot(1);
      burst(c, [SNAP_AT[0] + 0.3, 0.12, SNAP_AT[2] + 0.1], SNAP, 6, 0.9); shardsFly(c, [SNAP_AT[0] + 0.32, 0.1, SNAP_AT[2] + 0.12], SNAP, 0.6, 3, undefined, NG);
      // the heel spins away to screen right and lands in the grass
      const u = clamp01((f - SNAP) / (GONE - SNAP)), hp: V3 = [SNAP_AT[0] + 0.3 + 0.75 * u, 0.1 + 0.9 * 4 * u * (1 - u) * (1 - 0.3 * u), SNAP_AT[2] + 0.15];
      fx(c, "heelbit", 160, 320, fxHeelBit, hp, 0.11, 0.22, { rot: u < 1 ? -7 * u : -1.45, gain: NG });
      sparkle(c, add(hp, [0, 0.1, 0.03]), GONE, 12, 0.22);
      // the slipper slides off his raised foot
      if (!on) { const d = sm(f, OFF, OFF + 7); fx(c, "slip1|2", 300, 210, (p) => fxSlip(p, 1, 2), [lerp(ft[0], SNAP_AT[0] + 0.42, d), lerp(ft[1], 0.1, d * d), lerp(ft[2], SNAP_AT[2], d)], 0.27, 0.189, { gain: 0.85, rot: -0.5 * d }); }
    } else {
      // hops home on the one slipper he has left
      const h = hopAt(f), up = HOPS.reduce((m, f0) => Math.max(m, sm(f, f0 - 2, f0 + 4) * (1 - sm(f, f0 + HOP_N - 4, f0 + HOP_N + 3))), 0);
      gusG(c, { mode: "air", expr: "nervous", facing: -1, look: q(lerp(1, -1, sm(f, HOPS[0] - 4, HOPS[0] + 6)), 10), blink: lidAt(f, 1), tilt: 4, legs: [[-0.12, 1.48], [0.46, 1.02]],
        L: { h: [0.7, -0.2 - 0.2 * up], bend: -0.2 }, R: { h: [0.7, -0.3 - 0.2 * up], bend: -0.2 } }, [h.x, h.y, SNAP_AT[2]], { L: 0 }, { wide: true });
      for (const f0 of HOPS) puff(c, [hopAt(f0 + HOP_N).x, 0.1, SNAP_AT[2] + 0.1], f0 + HOP_N, 9, 0.6);
      fx(c, "slip1|2", 300, 210, (p) => fxSlip(p, 1, 2), [SNAP_AT[0] + 0.42, 0.1, SNAP_AT[2]], 0.27, 0.189, { gain: 0.85, rot: -0.5 });
      fx(c, "heelbit", 160, 320, fxHeelBit, [SNAP_AT[0] + 1.05, 0.1, SNAP_AT[2] + 0.15], 0.11, 0.22, { rot: -1.45, gain: NG });
    }
  } else if (id === 24) {
    // the neighbor has the slipper, and looks after him
    const k = sm(f, PICK - 2, PICK + 9), dreamy = f >= STORY - 8;
    const n = put(c, NEIGHBOR, { expr: dreamy ? "smile_closed" : "wow", look: -1, facing: -1, blink: lidAt(f, 6, [STORY - 8]), headTilt: -5 * sm(f, STORY - 12, STORY - 3),
      L: HANG, R: { ...armMix({ h: [0.4, 0.8], bend: 0.1 }, { h: [0.56, -0.02], bend: -0.25 }, k), front: true } }, [-0.2, 0, 0.2], { wide: true, tall: true });
    const hd = n.at(n.A.R, 0.08);
    fx(c, "slip1|2", 300, 210, (p) => fxSlip(p, 1, 2), [hd[0] + 0.03, hd[1] + 0.14, hd[2]], 0.48 * pop(f, PICK - 6, 6), 0.336 * pop(f, PICK - 6, 6), { gain: 0.95, rot: 0.12 });
    sparkle(c, [hd[0] - 0.1, hd[1] + 0.3, hd[2] + 0.03], STORY, 18, 0.3); sparkle(c, [hd[0] + 0.2, hd[1] + 0.16, hd[2] + 0.03], STORY + 5, 14, 0.2);
  }
};
/** the clock rings: little dashes shake out of both sides of its face */
const arrowless = (c: Ctx, s: number, f: number) => {
  const u = ((f - STRIKE) % 9) / 9;
  burst(c, [CLOCK[0] + s * (0.52 + 0.1 * u), 2.2, CLOCK[2] + 0.05], STRIKE + 9 * Math.floor((f - STRIKE) / 9), 8, 0.36, "#ffe9a0");
};

// ---------------- the park: a bag of chips ----------------
const park = (c: Ctx) => {
  const { f } = c, open = f >= TEAR;
  const str = Math.max(pulse(f, RIP1, 8, 12), pulse(f, RIP2, 8, 14), 0.7 * pulse(f, STRAIN, 9, 10)), eat = f >= EAT - 2;
  const hold: Arm = { h: [-0.02 + 0.07 * str, 0.3], bend: 0.3, front: true }, wide: Arm = { h: [0.5, 0.2], bend: -0.2, front: true };
  const ko = sm(f, TEAR, TEAR + 5);
  const g = put(c, GUS, { expr: eat ? "laugh" : open ? "wow" : str > 0.3 ? "pained" : f >= NOTCH - 4 ? "wow" : "stern", chew: ((f - EAT) % 10) / 10, look: q(-0.3 * sm(f, NOTCH - 6, NOTCH), 10),
    blink: lidAt(f, 1, [RIP1 - 4, RIP1 + 10, RIP2 - 4, RIP2 + 12, NOTCH - 4, TEAR, EAT - 2]), headTilt: 7 * (1 - ko) * (1 - 0.6 * str), tilt: 1.5 * Math.sin(f * 1.3) * str,
    L: armMix(hold, wide, ko), R: armMix(hold, wide, ko) }, GUS_P, { wide: true, tall: true });
  const a = g.at(g.A.L, 0.09), b = g.at(g.A.R, 0.09), mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 0.15, (a[2] + b[2]) / 2];
  if (!open) fx(c, "chips0", 300, 400, (p) => fxChips(p, 0), mid, 0.3 * (1 + 0.16 * str), 0.4 * (1 - 0.05 * str), { rot: 0.05 * Math.sin(f * 1.3) * str });
  else {
    fx(c, "chips1", 300, 400, (p) => fxChips(p, 1), [a[0], a[1] - 0.1, a[2]], 0.3, 0.4, { rot: 0.25 * ko });
    // the chips fly up and away to screen left, clear of his face
    const top: V3 = [a[0], a[1] + 0.12, a[2] + 0.02];
    for (let i = 0; i < 7; i++) {
      const u = (f - TEAR) / 30; if (u > 1) break;
      const vs = -0.12 + 0.5 * hash(i, 51), vy = 1.0 + 0.8 * hash(i, 52), sz = 0.13 * (1 - sm(f, TEAR + 24, TEAR + 30));
      fx(c, "chip", 120, 100, fxChip, [top[0] - c.cam.right.x * vs * u, top[1] + vy * u - 1.5 * u * u, top[2] - c.cam.right.z * vs * u], sz, sz * 0.83, { rot: 6 * u * (hash(i, 53) - 0.5) });
    }
    burst(c, [top[0], top[1], top[2] + 0.03], TEAR, 6, 0.6);
  }
  // the notch is at the bag's top left corner as seen on screen
  sparkle(c, [mid[0] - 0.13 * c.cam.right.x, mid[1] + 0.15, mid[2] + 0.03 - 0.13 * c.cam.right.z], NOTCH, 16, 0.2);
};

/** called once per frame and canvas; c.shot is the current shot */
export const stage = (c: Ctx) => {
  const place = c.shot.place;
  if (place === "sky") skyStage(c);
  else if (place === "park") park(c);
  else garden(c);
};
