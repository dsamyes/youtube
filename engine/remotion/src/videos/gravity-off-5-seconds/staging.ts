// Staging of "What If Gravity Switched Off for 5 Seconds?": who stands where in which pose, and every 2D card, for
// all 23 shots. stage(c) is a pure function of the shot and the frame; the timing comes from story.ts, the drawings
// from props.ts (plus the stopwatch of immortal-snail, the teacup of friction-off-5-seconds and the kit's pancake).
import {
  Ctx, V3, Pose, Arm, put, where, fx, armMix, sm, lidAt, q, talk, flail, HANG, HIP, clamp01, lerp, add, hash, draw,
  GUS, WIFE, NEIGHBOR, sparkle, question, arrow, puff, splash, cloud, speedLines, popIn, dizzyStars,
} from "../../toon/kit";
import {
  T, FLIP1, WATCH, FIVE, OFF, SHIMMER, FLIP2, EIGHT1, GLOBE, T800, FLUNG, SIP, RULER, TEN, THATSALL, DONT,
  CROUCH, HOP, HOP1, LAND1, ONE, WHY, GARROW, FLAT, POSTS, HOP2, EIGHT2, KEEPS, TAPE, T32,
  CAKE, WATCH1, TICK1, SAME, SAME2, GAP8, REACH, SHIMMER2, BELL, CHAIRLAND, COAST, APEX, UHOH, DOWN, TOWER, LEVEL, POOL, SPLASH, T30, SURFACE, CAKEFALL, CAKELAND,
  VF, GUS0, CHAIR, LIFT, chairLift, NB, POOL_AT, POOL_W, POOL_H, WATER_Y, flipU, cakeUp, hopUp, hop1,
  HOUSE_W, HOUSE_H, houseY1, houseY12, gusY2, gusY16, TOP_Y, coastY, HW, HK, HILL_Y0, hpos, hillT, ballAt, ballX14,
} from "./story";
import { fxNum, fxHouse, fxHill, fxBall, fxPost, fxStreakV, fxRuler, fxTape, fxBracket, fxDashed, fxGlobe, fxTower, fxPoolBack, fxPoolFront, fxWake, HILL_W, HILL_H, FLOOR, BALL_R } from "./props";
import { fxWatch, fxHand } from "../immortal-snail/props";
import { fxCup } from "../friction-off-5-seconds/props";

const A = (id: number) => T.shots[id - 1].a;
/** popIn that is 0 before its frame */
const pop = (f: number, f0: number, n = 6) => (f < f0 ? 0 : popIn(f, f0, n));
/** 0..1 bump around f0 */
const pulseK = (f: number, f0: number, up = 4, down = 8) => (f < f0 - up || f >= f0 + down ? 0 : f < f0 ? sm(f, f0 - up, f0) : 1 - sm(f, f0, f0 + down));

// ---------------- props ----------------
const cake = (c: Ctx, at: V3, sq: number, w = 0.34, rot = 0) => { const s = q(sq, 10); fx(c, `cake${s}`, 300, 300, (p) => draw.fxPancake(p, s), at, w, w, { rot }); };
const tag = (c: Ctx, text: string, at: V3, w: number) => { if (w > 0.01) fx(c, "num" + text, 360, 260, (p) => fxNum(p, text), at, w, w * 0.722); };
const cup = (c: Ctx, at: V3, w = 0.25) => fx(c, "cup", 220, 200, fxCup, at, w, w * 0.91);
const watch = (c: Ctx, at: V3, w: number, turns: number) => {
  if (w <= 0.01) return;
  fx(c, "watch", 300, 340, fxWatch, at, w, w * 1.133);
  fx(c, "hand", 300, 300, fxHand, [at[0], at[1] - (20 / 300) * w, at[2] + 0.02], w, w, { rot: -2 * Math.PI * turns });
};
/** streaks rushing down (dir -1) or up (dir 1) around a subject at `at`; they keep clear of the middle */
const streaks = (c: Ctx, at: V3, n: number, k = 1, seed = 0, spread = 1.15, dir = -1) => {
  if (k <= 0.03) return;
  for (let i = 0; i < n; i++) {
    const per = 8 + Math.floor(hash(i, seed + 2) * 6), u = ((c.f + Math.floor(hash(i, seed + 3) * per)) % per) / per;
    const side = i % 2 ? 1 : -1, x = at[0] + side * (0.42 + (spread - 0.42) * hash(i, seed + 4)), len = (0.6 + 0.6 * hash(i, seed + 5)) * k;
    fx(c, "vstreak", 40, 300, fxStreakV, [x, at[1] + dir * (u - 0.5) * 4.4, at[2] - 0.2], 0.07, len, { soft: true });
  }
};
const house = (c: Ctx, at: V3, w = HOUSE_W) => fx(c, "house", 800, 1000, fxHouse, at, w, (w * HOUSE_H) / HOUSE_W);
/** the level lawn of the far shots: floor line at world y = 0 */
const lawn = (c: Ctx, w = 34) => fx(c, "hill0", HILL_W, HILL_H, (p) => fxHill(p, 0), [0, ((FLOOR - HILL_H / 2) * w) / HILL_W, -0.5], w, (w * HILL_H) / HILL_W);

// ---------------- poses ----------------
const AIR: Pose = { mode: "air", legs: [[-0.17, 1.47], [0.17, 1.47]] };
const OUT_L: Arm = { h: [0.8, 0.1], bend: -0.1 }, OUT_R: Arm = { h: [0.8, 0.1], bend: -0.1 };
const UP_R: Arm = { h: [0.24, -1.02], bend: -0.04 };
const PAN = (up = 0, flick = 0): Arm => ({ h: [0.5, 0.4 - up], bend: 0.12, front: true, prop: "pan", arg: flick });
const CUP_ARM: Arm = { h: [0.3, 0.42], bend: 0.3, front: true };
/** his wife in her deck chair with the cup in the hand on screen left */
const wife = (c: Ctx, pose: Pose, sipK = 0) => {
  const g = put(c, WIFE, { mode: "chair", L: armMix(CUP_ARM, { h: [0.16, -0.05], bend: 0.45, front: true }, sipK), R: { h: [0.22, 0.56], bend: 0.25 }, ...pose }, [CHAIR[0], chairLift(c.f), CHAIR[2]], { noBlob: true });
  const h = g.at(g.A.L, 0.07);
  cup(c, [h[0] - 0.02, h[1] + 0.05, h[2]]);
  return g;
};
/** Gus with the pan; returns the puppet and where the pancake lies in the pan */
const gusPan = (c: Ctx, pose: Pose, flickAt: number, at: V3 = GUS0) => {
  const k = pulseK(c.f, flickAt, 3, 7);
  const g = put(c, GUS, { R: PAN(0.1 * k, 26 * k), L: HIP, ...pose }, at, { wide: true });
  const rest = where(c, GUS, { R: PAN(0, 0), L: HIP }, at, { wide: true });
  return { g, pan: g.at(g.A.propR, 0.05), pan0: rest.at(rest.A.propR, 0.05) };
};

// ---------------- the garden ----------------
const garden = (c: Ctx) => {
  const { id, f } = c;
  if (id === 3) {
    // Sunday morning: one ordinary flip
    const u = flipU(f), fly = f >= FLIP1 && u < 1;
    const { pan } = gusPan(c, { expr: f >= FLIP1 + 20 ? "smile_closed" : "smile", blink: lidAt(f, 1, [FLIP1 + 20]), look: 0.5, headTilt: fly ? -5 * Math.sin(Math.PI * u) : 0 }, FLIP1);
    if (fly) cake(c, [pan[0], pan[1] + 0.04 + 0.3048 * 4 * u * (1 - u), pan[2]], 0.2 + 0.8 * Math.abs(Math.sin(Math.PI * 2 * u)), 0.36, 0.25 * Math.sin(u * 6));
    else cake(c, [pan[0], pan[1] + 0.02, pan[2]], 0.2);
    wife(c, { expr: "neutral", blink: lidAt(f, 7), look: -0.6 });
  } else if (id === 4) {
    // gravity switches off: the stopwatch
    const on = f >= SHIMMER - 2;
    const { pan } = gusPan(c, { expr: on ? "wow" : "smile", blink: lidAt(f, 1, [SHIMMER - 2]), look: lerp(0.5, -0.8, sm(f, WATCH, WATCH + 8)), headTilt: -4 * sm(f, WATCH, WATCH + 8) }, -99);
    cake(c, [pan[0], pan[1] + 0.02, pan[2]], 0.2);
    const wp: V3 = [GUS0[0] + 0.66, 1.86, 0.35];
    watch(c, wp, 0.44 * pop(f, WATCH), f >= OFF ? (f - OFF) / 150 : 0);
    tag(c, "5", [wp[0], wp[1] + 0.5, wp[2]], 0.42 * pop(f, FIVE));
    for (let i = 0; i < 6; i++) sparkle(c, [-1.2 + 0.36 * i, 0.12 + 0.1 * hash(i, 7), 0.9 - 0.25 * hash(i, 8)], SHIMMER + 2 * i, 14, 0.22);
  } else if (id === 5) {
    // the pancake leaves the pan and keeps going
    const gone = f >= FLIP2 + 2, seen = f >= FLIP2 + 9;
    const { pan, pan0 } = gusPan(c, { expr: seen ? "jawdrop" : "smile", blink: lidAt(f, 1, [FLIP2 + 9]), look: seen ? 0.2 : 0.5, headTilt: -13 * sm(f, FLIP2 + 4, FLIP2 + 14) }, FLIP2);
    const at: V3 = gone ? [pan0[0], pan0[1] + 0.1 + cakeUp(f), pan0[2]] : [pan[0], pan[1] + 0.02, pan[2]];
    cake(c, at, gone ? 0.2 + 0.6 * Math.abs(Math.sin((f - FLIP2) * 0.16)) : 0.2, 0.36, gone ? 0.2 * Math.sin((f - FLIP2) * 0.2) : 0);
    tag(c, "8", [at[0] - 0.62, at[1] + 0.12, at[2]], 0.5 * pop(f, EIGHT1));
    if (f > FLIP2 + 16) for (const k of [-1, 1]) fx(c, "vstreak", 40, 300, fxStreakV, [at[0] + 0.1 * k, at[1] - 0.55, at[2] - 0.05], 0.05, 0.6, { soft: true });
  } else if (id === 6) {
    // the neighbor yells: the Earth spins at eight hundred miles an hour
    const grab = sm(f, FLUNG + 3, FLUNG + 10), speaking = f >= 448 && f < 586, shrink = 1 - sm(f, 530, 538);
    const wave = 0.12 * Math.sin(f * 0.45);
    const g = put(c, NEIGHBOR, { expr: grab > 0.5 ? "flap" : speaking ? talk(f) : "shock", flap: ((f * 0.12) % 1), blink: lidAt(f, 6, [FLUNG + 6]), headTilt: 3 * Math.sin(f * 0.2) - 6 * grab,
      L: armMix({ h: [0.6, -0.5 + wave], bend: -0.25 }, { h: [0.34, 0.5], bend: 0.3, front: true }, grab), R: armMix({ h: [0.6, -0.5 - wave], bend: -0.25 }, { h: [0.34, 0.5], bend: 0.3, front: true }, grab) }, NB, { noBlob: true, wide: true, tall: true });
    const gp: V3 = [NB[0] - 0.52, NB[1] + 2.25, NB[2] + 0.1], s = pop(f, GLOBE) * shrink, ph = q(((f * 0.035) % 1), 30);
    if (s > 0.01) fx(c, `globe${ph}`, 300, 300, (p) => fxGlobe(p, ph), gp, 0.52 * s, 0.52 * s);
    tag(c, "800", [gp[0] + 0.05, gp[1] + 0.52, gp[2]], 0.5 * pop(f, T800) * shrink);
    arrow(c, [NB[0] + 0.42, NB[1] + 2.2, NB[2] + 0.1], 0.62, Math.PI, FLUNG, "#ff8a5c");
    void g;
  } else if (id === 7) {
    // his wife sits still
    const sip = sm(f, SIP - 6, SIP) * (1 - sm(f, SIP + 12, SIP + 18));
    wife(c, { expr: sip > 0.5 ? "smile_closed" : "neutral", blink: lidAt(f, 7, [SIP - 3, SIP + 15]), headTilt: 2 }, sip);
  } else if (id === 8 || id === 18) {
    // the ground sinks ten inches under her chair; and when gravity is back, the chair drops them again
    const w = wife(c, { expr: "neutral", blink: lidAt(f, 7), look: id === 8 ? -0.3 : 0, headTilt: 2 });
    const rp: V3 = [CHAIR[0] - 0.42, LIFT * 0.5 + 0.005, CHAIR[2] + 0.75];
    if (id === 8) {
      const s = pop(f, RULER);
      if (s > 0.01) fx(c, "ruler", 120, 420, fxRuler, [rp[0], rp[1] * s, rp[2]], 0.075 * s, LIFT * 1.05 * s);
      tag(c, "10", [rp[0] - 0.14, rp[1] + 0.33, rp[2]], 0.36 * pop(f, TEN));
      sparkle(c, add(w.at(w.A.L, 0.08), [0, 0.08, 0]), THATSALL, 14, 0.26);
    } else {
      const wp: V3 = [CHAIR[0] - 0.72, 0.42, CHAIR[2] + 0.7];
      watch(c, wp, 0.36, (5 / 12) * clamp01(1 - (BELL - f) / 150));
      sparkle(c, [wp[0], wp[1], wp[2] + 0.1], BELL, 14, 0.5);
      for (let i = 0; i < 6; i++) sparkle(c, [0.5 + 0.34 * i, 0.1 + 0.08 * hash(i, 3), 0.4 - 0.3 * hash(i, 4)], SHIMMER2 + 2 * i, 14, 0.2);
      for (const k of [0, 1, 2]) puff(c, [CHAIR[0] - 0.5 + 0.5 * k, 0.1, CHAIR[2] + 0.4], CHAIRLAND + k, 10, 0.34);
    }
  } else if (id === 9) {
    // "Don't move"
    const speaking = f >= 758 && f < 778, up = sm(f, DONT - 4, DONT + 2);
    wife(c, { expr: speaking ? talk(f) : "neutral", blink: lidAt(f, 7), look: -1, headTilt: 2, R: { ...armMix({ h: [0.22, 0.56], bend: 0.25 }, { h: [0.34, -0.28], bend: -0.3 }, up), hand: "point", front: true } });
  } else if (id === 10) {
    // Gus wants his pancake: he hops
    const sq = sm(f, CROUCH - 4, CROUCH + 6) * (1 - sm(f, HOP - 2, HOP + 1)), air = f >= HOP, y = hopUp(f, HOP), upK = sm(f, 804, 812);
    put(c, GUS, { ...(air ? AIR : {}), expr: air ? "grin" : "stern", blink: lidAt(f, 1, [HOP]), squash: sq, headTilt: -12 * upK, look: 0.2,
      R: armMix(PAN(0, 0), { ...UP_R, prop: "pan", arg: 0, front: true }, sm(f, HOP - 2, HOP + 5)), L: armMix(HIP, { h: [0.3, -0.9], bend: -0.05 }, sm(f, HOP - 2, HOP + 5)) }, [GUS0[0], y, GUS0[2]], { wide: true, tall: true, noBlob: air });
    for (const k of [0, 1]) puff(c, [GUS0[0] - 0.15 + 0.3 * k, 0.1, GUS0[2] + 0.1], HOP + k, 10, 0.4);
  } else if (id === 11) {
    // an ordinary hop: one foot
    const y = hop1(f), air = f >= HOP1 && f < LAND1, at: V3 = [GUS0[0] - 0.2, y, GUS0[2]];
    put(c, GUS, { ...(air ? AIR : {}), expr: "smile", blink: lidAt(f, 1), squash: 0.6 * pulseK(f, HOP1 - 1, 3, 3) + 0.5 * pulseK(f, LAND1 + 1, 2, 5), L: air ? OUT_L : HANG, R: air ? OUT_R : HANG }, at, { wide: true, blob: 1 - y });
    const rx = GUS0[0] + 0.45;
    fx(c, "ruler", 120, 420, fxRuler, [rx, 0.16, GUS0[2] + 0.1], 0.1, 0.32);
    tag(c, "1", [rx + 0.02, 0.62, GUS0[2] + 0.1], 0.4 * pop(f, ONE));
    for (const k of [0, 1]) puff(c, [at[0] - 0.15 + 0.3 * k, 0.08, GUS0[2] + 0.12], LAND1 + k, 9, 0.3);
  } else if (id === 15) {
    // he leaves the lawn at eight feet a second and keeps it all
    const air = f >= HOP2, y = hopUp(f, HOP2), sq = sm(f, A(15), A(15) + 3) * (1 - sm(f, HOP2 - 2, HOP2 + 1));
    const g = put(c, GUS, { ...(air ? AIR : {}), expr: air ? "wow" : "stern", blink: lidAt(f, 1, [HOP2]), squash: sq, headTilt: -8, look: 0.2, L: armMix(HIP, OUT_L, sm(f, HOP2, HOP2 + 6)), R: armMix(HIP, { h: [0.3, -0.9], bend: -0.05 }, sm(f, HOP2, HOP2 + 6)) },
      [GUS0[0], y, GUS0[2]], { wide: true, tall: true, noBlob: air });
    for (const k of [0, 1]) puff(c, [GUS0[0] - 0.15 + 0.3 * k, 0.1, GUS0[2] + 0.1], HOP2 + k, 10, 0.4);
    if (f > HOP2 + 8) for (const k of [-1, 1]) fx(c, "vstreak", 40, 300, fxStreakV, [GUS0[0] + 0.17 * k, y - 0.45, GUS0[2] - 0.05], 0.06, 0.7, { soft: true });
    tag(c, "8", [GUS0[0] + 0.6, y + 1.2, GUS0[2]], 0.5 * pop(f, EIGHT2));
    sparkle(c, add(g.at(g.A.head, 0.1), [-0.5, 0.35, 0]), KEEPS, 14, 0.34);
  } else if (id === 21 || id === 23) {
    // the neighbor's pool
    const pc: V3 = [POOL_AT[0], POOL_AT[1] + POOL_H / 2, POOL_AT[2]], nb: V3 = [NB[0] + 0.28, NB[1], NB[2] - 0.5];
    fx(c, "poolB", 800, 520, fxPoolBack, pc, POOL_W, POOL_H);
    if (id === 21) {
      const g = put(c, NEIGHBOR, { expr: "grin", blink: lidAt(f, 6), headTilt: 3, L: { ...armMix(HANG, { h: [0.8, 0.24], bend: -0.05 }, sm(f, POOL - 8, POOL - 1)), hand: "thumb", front: true }, R: HIP }, nb, { noBlob: true, wide: true });
      sparkle(c, [POOL_AT[0] + 0.1, WATER_Y + 0.12, POOL_AT[2] + 0.2], POOL, 16, 0.5);
      void g;
      return;
    }
    const hit = f >= SPLASH, up = f >= SURFACE - 3, landed = f >= CAKELAND;
    put(c, NEIGHBOR, { expr: hit && f < SPLASH + 40 ? "flap" : hit ? "dazed" : "wow", flap: ((f * 0.1) % 1), blink: lidAt(f, 6, [SPLASH, SPLASH + 40]), headTilt: hit ? 4 : -10, tilt: 8 * pulseK(f, SPLASH + 3, 3, 14),
      L: armMix(HANG, { h: [0.5, -0.3], bend: -0.3 }, pulseK(f, SPLASH + 4, 4, 30)), R: armMix(HANG, { h: [0.5, -0.3], bend: -0.3 }, pulseK(f, SPLASH + 4, 4, 30)) }, nb, { noBlob: true, wide: true });
    if (!hit) {
      const y = WATER_Y - 0.6 + 0.45 * (SPLASH - f);
      put(c, GUS, { ...flail(f), expr: "jawdrop" }, [POOL_AT[0], y, POOL_AT[2]], { face: true, roll: 0.25 * Math.sin(f * 0.5), wide: true, tall: true, noBlob: true });
      if (y < 5) for (const k of [-1, 1]) fx(c, "vstreak", 40, 300, fxStreakV, [POOL_AT[0] + 0.3 * k, y + 2.4, POOL_AT[2]], 0.08, 1.4, { soft: true });
    } else if (up) {
      const r = clamp01((f - (SURFACE - 3)) / 9), rise = r >= 1 ? 1 + 0.06 * Math.exp(-(f - SURFACE - 6) / 6) * Math.cos((f - SURFACE - 6) * 0.5) : Math.sin((Math.PI / 2) * r) * 1.06;
      const y = WATER_Y - 2.3 + 1.18 * rise + 0.02 * Math.sin(f * 0.12), lookUp = sm(f, CAKELAND + 5, CAKELAND + 13);
      const g = put(c, GUS, { expr: lookUp > 0.5 ? "smile" : "dazed", blink: lidAt(f, 1, [CAKELAND + 9]), headTilt: lerp(5, -6, lookUp), L: HANG, R: HANG }, [POOL_AT[0], y, POOL_AT[2]], { noBlob: true });
      const head = g.at(g.A.head, 0.06);
      if (!landed && f < CAKELAND - 30) dizzyStars(c, [head[0], head[1] + 0.36, head[2]], 0.7);
      const cy = landed ? head[1] + 0.385 : head[1] + 0.385 + 0.16 * (CAKELAND - f);
      if (f >= CAKEFALL - 6) cake(c, [head[0], cy, head[2] + 0.02], landed ? lerp(0.16, 0.3, clamp01((f - CAKELAND) / 3)) : 0.3 + 0.5 * Math.abs(Math.sin((CAKELAND - f) * 0.25)), 0.5, landed ? 0 : 0.2 * Math.sin(f * 0.3));
      fx(c, "wake", 300, 90, fxWake, [POOL_AT[0], WATER_Y + 0.01, POOL_AT[2] + 0.12], 0.95, 0.28);
    }
    fx(c, "poolF", 800, 520, fxPoolFront, [pc[0], pc[1], pc[2] + 0.22], POOL_W, POOL_H);
    splash(c, [POOL_AT[0], WATER_Y + 1.25, POOL_AT[2] + 0.3], SPLASH, 20, 3.6);
    for (const k of [0, 1, 2]) puff(c, [POOL_AT[0] - 0.8 + 0.8 * k, WATER_Y + 0.3, POOL_AT[2] + 0.35], SPLASH + 2 + k, 14, 0.9);
    splash(c, [POOL_AT[0], WATER_Y + 0.45, POOL_AT[2] + 0.3], SURFACE - 2, 12, 1.3);
    tag(c, "30", [POOL_AT[0] + 0.1, WATER_Y + 1.9, POOL_AT[2] + 0.3], 0.75 * pop(f, T30) * (1 - sm(f, 1922, 1930)));
  }
};

// ---------------- the sky ----------------
const skyStage = (c: Ctx) => {
  const { id, f } = c;
  if (id === 1) {
    // HOOK: Gus sails up past his roof, the pancake just out of reach
    house(c, [-0.9, houseY1(f), -1.4]);
    for (const [i, x] of [-1.6, 1.9].entries()) cloud(c, [x, 2.6 - ((0.03 * f + 3 * i) % 6), -7], 3.2, 3 + i);
    const g = put(c, GUS, { ...AIR, legs: [[-0.17 + 0.04 * Math.sin(f * 0.4), 1.47], [0.17 + 0.04 * Math.cos(f * 0.4), 1.47]], expr: "shock", blink: lidAt(f, 1), headTilt: -10, tilt: 3 * Math.sin(f * 0.2),
      R: { h: [0.24, -1.0 + 0.05 * Math.sin(f * 0.5)], bend: -0.04 }, L: { h: [0.74, 0.0 + 0.1 * Math.sin(f * 0.4)], bend: -0.1 } }, [0, -1.0, 0], { wide: true, tall: true, noBlob: true });
    const h = g.at(g.A.R, 0.05);
    cake(c, [h[0] + 0.04, h[1] + 0.62 + 0.03 * Math.sin(f * 0.3), h[2]], 0.5 + 0.3 * Math.sin(f * 0.25), 0.46, 0.15 * Math.sin(f * 0.2));
    streaks(c, [0.1, 0.3, 0], 10, 1, 1);
  } else if (id === 2 || id === 16) {
    // far off: the house below, Gus above its roof
    lawn(c);
    house(c, [-0.6, HOUSE_H * 0.49, -0.2]);
    const y = id === 2 ? gusY2(f) : gusY16(f), gx = 1.7, dn = id === 2 ? sm(f, 122, 132) : 0;
    cloud(c, [-3.2 + 0.01 * (f - A(id)), 12.5, -6], 6, 4);
    if (id === 16) {
      const u = q(clamp01((f - TAPE) / (T32 - TAPE - 2)), 32);
      if (u > 0) fx(c, `tape${u}`, 120, 1200, (p) => fxTape(p, u), [gx, y / 2, 0.05], 0.75, y * (1200 / 1170));
      tag(c, "32", [gx + 1.5, y * 0.55, 0.2], 2.2 * pop(f, T32));
    }
    put(c, GUS, { ...AIR, expr: dn > 0.5 ? "nervous" : "wow", blink: lidAt(f, 1, [127]), headTilt: lerp(-8, 9, dn), look: -0.4 * dn, L: OUT_L, R: id === 2 ? UP_R : OUT_R }, [gx, y, 0.2], { scale: 1.75, wide: true, tall: true, noBlob: true });
    if (id === 2) cake(c, [gx + 0.45, y + 4.7, 0.2], 0.5 + 0.3 * Math.sin(f * 0.25), 0.9);
    streaks(c, [gx, y + 1.5, 0.2], 6, 1.6, id, 2.4);
  } else if (id === 12) {
    // past his own chimney: why?
    house(c, [-0.77, houseY12(f), -1.2]);
    cloud(c, [-1.5, 2.4 - 0.012 * (f - A(12)), -7], 3.2, 5);
    const lk = Math.sin((f - A(12)) * 0.13);
    const g = put(c, GUS, { ...AIR, expr: "nervous", blink: lidAt(f, 1), look: q(lk, 8), headTilt: 6, tilt: 2 * Math.sin(f * 0.15), L: OUT_L, R: OUT_R }, [-0.1, -1.0, 0], { wide: true, tall: true, noBlob: true });
    question(c, add(g.at(g.A.top), [0.02, 0.3, 0]), WHY, 0.5);
    streaks(c, [-0.1, 0.2, 0], 5, 0.7, 12, 1.2);
  } else if (id === 13 || id === 14) {
    // the hill and the ball
    const t = q(hillT(f), 24), b = ballAt(f);
    for (let k = 0; k < (id === 14 ? 4 : 1); k++) { const tt = k === 0 ? t : 0; fx(c, `hill${tt}`, HILL_W, HILL_H, (p) => fxHill(p, tt), [HW * k, HILL_Y0, 0], HW, HW * (HILL_H / HILL_W)); }
    const turn = ((b.x - 250) * HK) / (BALL_R * HK), r = BALL_R * HK * (200 / 168);
    fx(c, "ball", 200, 200, fxBall, b.pos, 2 * r, 2 * r, { rot: -turn });
    const ah = 0.62 * (id === 14 ? 1 - sm(f, FLAT - 2, FLAT + 8) : 1);
    if (ah > 0.03) arrow(c, [b.pos[0], b.pos[1] + 0.62 + 0.035 * Math.sin(f * 0.22), 0.08], ah, 0, GARROW);
    if (id === 14) {
      for (let i = -1; i < 7; i++) { const px = (ballX14(POSTS[0] + 20 * i) - HILL_W / 2) * HK; fx(c, "post", 80, 300, fxPost, [px, hpos(0, FLOOR, 0)[1] + 0.2, -0.05], 0.12, 0.45); }
      if (f > T.at("roll2") + 6) for (const k of [0, 1, 2]) fx(c, "vstreak", 40, 300, fxStreakV, [b.pos[0] - 0.45 - 0.1 * k, b.pos[1] - 0.12 + 0.12 * k, 0.05], 0.05, 0.5, { soft: true, rot: Math.PI / 2 });
    }
  } else if (id === 17) {
    // the pancake left a second sooner at the same speed: eight feet out of reach
    const gp: V3 = [-0.12, -2.12, 0], cp: V3 = [0.05, 1.62 + 0.02 * Math.sin(f * 0.2), 0];
    const rk = sm(f, REACH - 4, REACH + 4), strain = f >= REACH + 8;
    put(c, GUS, { ...AIR, expr: strain ? "pained" : "wow", blink: lidAt(f, 1, [REACH + 8]), headTilt: -13, look: 0.2, L: OUT_L, R: armMix({ h: [0.3, -0.7], bend: -0.1 }, { h: [0.2, -1.16 + 0.02 * Math.sin(f * 0.9)], bend: 0 }, rk) }, gp, { wide: true, tall: true, noBlob: true });
    cake(c, cp, 0.55 + 0.2 * Math.sin(f * 0.15), 0.52, 0.1 * Math.sin(f * 0.1));
    sparkle(c, [cp[0] + 0.2, cp[1] + 0.15, 0.1], CAKE, 14, 0.4);
    const wp: V3 = [0.78, 1.46, 0.02];
    watch(c, wp, 0.46 * pop(f, WATCH1), f >= TICK1 ? clamp01((f - TICK1) / 6) / 12 : 0);
    tag(c, "1", [wp[0], wp[1] + 0.46, 0.02], 0.36 * pop(f, TICK1));
    arrow(c, [-0.72, 1.62, 0.02], 0.62, Math.PI, SAME);
    arrow(c, [-0.98, -1.0, 0.02], 0.62, Math.PI, SAME2);
    const s = pop(f, GAP8);
    if (s > 0.01) fx(c, "bracket", 160, 600, fxBracket, [0.52, 0.86, 0.02], 0.3 * s, 1.2 * s);
    tag(c, "8", [1.0, 0.92, 0.04], 0.5 * pop(f, GAP8 + 2));
    streaks(c, [0, 0, 0], 8, 0.8, 17, 1.25);
  } else if (id === 19) {
    // he coasts up one more foot, stops, and starts down
    const y = -1.0 + coastY(f), top = f >= APEX - 2, fall = f >= DOWN;
    const dn = sm(f, UHOH - 8, UHOH + 7);
    const g = put(c, GUS, { ...(fall ? flail(f, 0.5) : AIR), expr: fall ? "shock" : top ? "nervous" : "wow", blink: lidAt(f, 1, [APEX - 2, DOWN]), headTilt: lerp(-4, 6, dn), look: 0, L: OUT_L, R: OUT_R }, [0, y, 0], { wide: true, tall: true, noBlob: true });
    sparkle(c, add(g.at(g.A.top), [0.3, 0.1, 0]), APEX, 14, 0.36);
    cloud(c, [1.5, 1.9 - 0.01 * (f - A(19)) * (1 - sm(f, COAST, APEX)), -7], 3.2, 6);
    streaks(c, [0, 0.2, 0], 6, 0.8 * (1 - sm(f, COAST - 4, APEX - 6)), 19, 1.2);
    if (fall) streaks(c, [0, 0.2, 0], 6, clamp01((f - DOWN) / 8), 20, 1.2, 1);
  } else if (id === 20) {
    // exactly the height of an Olympic diving tower
    lawn(c);
    const TH = 11.9, TW = 5.5, s = pop(f, TOWER, 8), tx = -1.45;
    if (s > 0.01) fx(c, "tower", 600, 1300, fxTower, [tx, TH * s * (600 / 1300), 0], TW * s, TH * s);
    const gx = 2.7;
    put(c, GUS, { ...AIR, expr: "nervous", blink: lidAt(f, 1), headTilt: 9, look: -0.6, L: OUT_L, R: OUT_R }, [gx, TOP_Y + 0.04 * Math.sin(f * 0.1), 0.2], { scale: 1.75, wide: true, tall: true, noBlob: true });
    const x0 = tx + (560 - 300) * (TW / 600), x1 = gx + 0.5, u = q(sm(f, TOWER + 7, LEVEL), 16);
    if (u > 0.02) fx(c, `dash${u}`, 1000, 40, (p) => fxDashed(p, u), [(x0 + x1) / 2, TOP_Y, 0.1], x1 - x0, 0.22);
    sparkle(c, [gx - 0.3, TOP_Y, 0.4], LEVEL, 16, 1.6);
    cloud(c, [-0.3, 13.6, -6], 5, 4);
  } else if (id === 22) {
    // no diver
    put(c, GUS, { ...flail(f), expr: "jawdrop" }, [0, -0.75, 0], { face: true, roll: 0.5 + 0.045 * (f - A(22)), wide: true, tall: true, noBlob: true });
    speedLines(c, 12, 1.5, 1, 0);
    cloud(c, [-1.6, -2.4 + 0.07 * (f - A(22)), -7], 3.2, 7);
  }
};

/** called once per frame and canvas; c.shot is the current shot */
export const stage = (c: Ctx) => {
  if (c.shot.place === "sky") skyStage(c);
  else garden(c);
};
void VF; void POOL_H;
