// Staging of "What If You Had a Hummingbird's Metabolism?": who stands where in which pose, and every 2D effect
// card, for all 21 shots. stage(c) is a pure function of the shot and the frame; the timing comes from story.ts,
// this video's own drawings from props.ts.
import {
  Ctx, V3, Pose, Arm, put, where, reach, fx, armMix, sm, lidAt, q, HANG, HIP, clamp01, lerp, lin, add,
  GUS, WIFE, NEIGHBOR, FISHER, NEIGH, draw, sparkle, question, burst, splash, ripples, sleepBubble, popIn, Expr,
} from "../../toon/kit";
import {
  TABLE, TABLE_H, GUS_T, GUS_C, GUS_CHAIR, GUS5, WIFE5, GUS6, FRY_AT, POTATO_AT, TOWER_N, TOWER_X, TOWER_Z, towerF, BIRD_P, SEA_G, NECK, seaY, bobY, FISHER_AT,
  BITES, STEAM0, BIRD_IN, WAKE, TAP, BIRD_OUT, BURN, DRAIN0, DRAIN1, TOWER1, LOOKUP, FLIPS, CATCH, GONE, POPUP, SAUSAGE, JAW, TICK0, HUM, FOG0, WHY,
  TO_HEAT, HEAT_A, HEAT_B, GLOW, FRY_COLD, SKIN, LEAK0, COOL, BUTTER, MELT, THERMO0, THERMO_POP, SPLASH, HISS, SURFACE, BLISS, OOPS, RUMBLE0, THINK,
  BIRD_SEA, FUNNY, LAND0, SHUT, LAST_BITE,
} from "./story";
import { fxBurger, fxPile, fxPileSmall, fxSausage, fxHummer, fxFeeder, fxSteam, fxSteamBurst, fxHeat, fxGlow, fxFog, fxHeater, fxHeart, fxFry, fxPotato, fxButter, fxThought, fxFrost } from "./props";

const { fxPancake, fxCrumbs, fxShards } = draw;

// ---------------- small helpers ----------------
/** white steam rising: a looping soft card whose bottom edge sits at `base` */
const steam = (c: Ctx, base: V3, w: number, a = 1, seed = 0, speed = 0.028) => {
  if (a <= 0.03) return;
  const t = q((((c.f * speed + seed) % 1) + 1) % 1, 30), aa = q(a, 10);
  fx(c, `steam${t}|${aa}`, 300, 400, (p) => fxSteam(p, t, aa), [base[0], base[1] + (w * 4) / 6, base[2]], w, (w * 4) / 3, { soft: true });
};
/** wavy heat lines rising from `base` (rot turns them, 0 = straight up) */
const heat = (c: Ctx, base: V3, w: number, a = 1, rot = 0, seed = 0, sx = 1, red = false) => {
  if (a <= 0.03) return;
  const t = q((((c.f * 0.045 + seed) % 1) + 1) % 1, 24), aa = q(a, 10), h = (w * 4) / 3;
  // sx = world x per screen-right x: +1 in the garden (lens looks north), -1 in the park (lens looks south)
  fx(c, `heat${t}|${aa}|${red ? 1 : 0}`, 300, 400, (p) => fxHeat(p, t, aa, red), [base[0] - sx * Math.sin(rot) * h * 0.5, base[1] + Math.cos(rot) * h * 0.5, base[2]], w, h, { soft: true, rot, gain: red ? 1.1 : 1.25 });
};
type BirdO = { wing?: number; lid?: number; fluff?: number; droop?: number; left?: boolean; w?: number; rot?: number; gain?: number };
/** the hummingbird, centred on pos (its card is 0.3 m wide unless w is given); left = beak to screen left */
const bird = (c: Ctx, pos: V3, o: BirdO = {}) => {
  const wing = o.wing ?? (c.f % 2 ? 1 : -1), lid = q(o.lid ?? 0, 8), fluff = q(o.fluff ?? 0, 10), droop = q(o.droop ?? 0, 8), w = o.w ?? 0.3, left = !!o.left;
  fx(c, `hummer|${wing}|${lid}|${fluff}|${droop}|${left ? "L" : "R"}`, 420, 320, (p) => { if (left) { p.g.translate(420, 0); p.g.scale(-1, 1); } fxHummer(p, wing, lid, fluff, droop); }, pos, w, (w * 320) / 420, { rot: o.rot ?? 0, gain: o.gain ?? 1 });
};
/** where the bird's beak tip is for a bird at pos (hovering, not drooping) */
const beak = (pos: V3, w = 0.3, left = false): V3 => [pos[0] + (left ? -1 : 1) * 0.452 * w, pos[1] + 0.09 * w, pos[2]];
const burgerCard = (c: Ctx, pos: V3, w = 0.34, rot = 0, gain = 1) => fx(c, "burger", 300, 240, fxBurger, pos, w, w * 0.8, { rot, gain });
const crumbs = (c: Ctx, at: V3, f0: number, size = 0.5) => { if (c.f >= f0 && c.f < f0 + 10) { const u = q((c.f - f0) / 10, 20); fx(c, `crumbs${u}`, 300, 300, (p) => fxCrumbs(p, u), at, size, size); } };
const eatLoop = (f: number) => ((f * 0.12) % 1 + 1) % 1;

// ---------------- the garden ----------------
const garden = (c: Ctx) => {
  const { id, f } = c;
  if (id === 1) {
    // HOOK: behind the burger table, a burger in each hand: left, right, left
    fx(c, "pile", 640, 420, fxPile, [TABLE[0] - 0.36, TABLE_H + 0.15, TABLE[2] - 0.12], 0.5, 0.328);
    fx(c, "pileS", 360, 260, fxPileSmall, [TABLE[0] + 0.42, TABLE_H + 0.1, TABLE[2] - 0.08], 0.34, 0.245);
    const bite = (f0: number) => sm(f, f0 - 7, f0 - 1) * (1 - sm(f, f0 + 3, f0 + 10));
    const kL = Math.max(bite(BITES[0]), bite(BITES[2])), kR = bite(BITES[1]);
    const biting = BITES.some((f0) => f >= f0 - 4 && f < f0 + 1), worried = f >= STEAM0 + 8;
    const base: Pose = { acc: 1, facing: 0 };
    const m = where(c, GUS, base, GUS_T, { wide: true, tall: true }), mouth = m.at(m.A.mouth, 0);
    // the burgers are cards at his hands (a hand prop would be drawn behind his own head when he bites)
    const holdL: Arm = { h: [0.6, 0.1], bend: -0.22, front: true }, holdR: Arm = { h: [0.6, 0.06], bend: -0.22, front: true };
    const toL: Arm = { h: reach(c, GUS_T, -1, [mouth[0] - 0.06, mouth[1] - 0.1, mouth[2]]), bend: -0.3, front: true };
    const toR: Arm = { h: reach(c, GUS_T, 1, [mouth[0] + 0.06, mouth[1] - 0.1, mouth[2]]), bend: -0.3, front: true };
    const expr: Expr = biting ? "bite" : worried ? "nervous" : "chew";
    const pose: Pose = { ...base, expr, chew: eatLoop(f), look: worried ? 0 : kL > 0.3 ? -0.6 : kR > 0.3 ? 0.6 : 0, blink: lidAt(f, 1, [BITES[0] - 4, BITES[0] + 1, BITES[1] - 4, BITES[1] + 1, BITES[2] - 4, BITES[2] + 1, STEAM0 + 8]),
      headTilt: 5 * kR - 5 * kL, tilt: 2 * Math.sin(f * 0.21), L: { ...armMix(holdL, toL, kL), front: true }, R: { ...armMix(holdR, toR, kR), front: true } };
    const g = put(c, GUS, pose, GUS_T, { wide: true, tall: true });
    burgerCard(c, add(g.at(g.A.L, 0.07), [-0.015, 0.07, 0]), 0.3, 0.12 * kL);
    burgerCard(c, add(g.at(g.A.R, 0.07), [0.015, 0.07, 0]), 0.3, -0.12 * kR);
    for (const f0 of BITES) crumbs(c, add(g.at(g.A.mouth, 0.1), [0, -0.08, 0]), f0, 0.6);
    // steam leaks from his collar and off the top of his head
    const a = sm(f, STEAM0, STEAM0 + 12), top = g.at(g.A.head, -0.05);
    steam(c, [top[0] - 0.3, top[1] - 0.12, top[2]], 0.34, a, 0.0);
    steam(c, [top[0] + 0.3, top[1] - 0.1, top[2]], 0.34, a, 0.45);
    steam(c, [top[0], top[1] + 0.3, top[2]], 0.42, a * sm(f, STEAM0 + 8, STEAM0 + 22), 0.7);
  } else if (id === 2) {
    // asleep in the deck chair; the hummingbird wakes him
    const awake = f >= WAKE, zap = f >= TAP;
    const jit = zap ? 0.006 * Math.sin(f * 2.6) : 0;
    const pose: Pose = awake
      ? { mode: "chair", expr: f < WAKE + 14 ? "shock" : zap ? "grin" : "wow", facing: f >= WAKE + 8 ? 1 : 0, look: f >= WAKE + 8 ? 1 : 0, blink: lidAt(f, 2, [WAKE, WAKE + 14, TAP]), headTilt: -4,
        L: { h: [0.3, 0.5], bend: 0.2 }, R: zap ? { h: [0.5 + 0.03 * Math.sin(f * 2.2), 0.3 + 0.03 * Math.cos(f * 2.2)], bend: 0.2 } : { h: [0.3, 0.5], bend: 0.2 } }
      : { mode: "chair", expr: "asleep", headTilt: 12 + 1.5 * Math.sin(f * 0.07), tilt: 3, L: { h: [0.2, 0.6], bend: 0.2 }, R: { h: [0.22, 0.6], bend: 0.2 } };
    const g = put(c, GUS, pose, [GUS_CHAIR[0] + jit, GUS_CHAIR[1], GUS_CHAIR[2]], { noBlob: true });
    const head = g.at(g.A.head, 0.05);
    if (!awake) sleepBubble(c, [head[0] - 0.36, head[1] - 0.12, head[2]], 0.3);
    burst(c, [head[0] - 0.4, head[1] - 0.12, head[2]], WAKE, 6, 0.6, "#d8eeff");
    // the bird: in from screen right, hovers, taps the glass, darts off
    if (f >= BIRD_IN - 2 && f < BIRD_OUT + 16) {
      const hov: V3 = [head[0] + 0.47, head[1] + 0.12 + 0.015 * Math.sin(f * 0.4), head[2] + 0.05];
      const inK = 1 - (1 - clamp01((f - (BIRD_IN - 2)) / 16)) ** 3, tap = sm(f, TAP - 6, TAP) * (1 - sm(f, TAP + 2, TAP + 9)), out = clamp01((f - BIRD_OUT) / 14) ** 2;
      const pos: V3 = [hov[0] + 2.2 * (1 - inK) - 0.1 * tap + 2.6 * out, hov[1] + 1.1 * (1 - inK) + 1.6 * out, hov[2]];
      bird(c, pos, { left: true, rot: 0.25 * (1 - inK) - 0.5 * out, w: 0.27 });
      sparkle(c, add(beak(pos, 0.27, true), [-0.02, 0, 0.03]), TAP, 14, 0.2);
    }
  } else if (id === 4) {
    // the burger tower grows beside him
    fx(c, "pile", 640, 420, fxPile, [TABLE[0] - 0.36, TABLE_H + 0.15, TABLE[2] - 0.12], 0.5, 0.328);
    fx(c, "pileS", 360, 260, fxPileSmall, [TABLE[0] + 0.42, TABLE_H + 0.1, TABLE[2] - 0.08], 0.34, 0.245);
    for (let n = 0; n < TOWER_N; n++) {
      const f0 = towerF(n);
      if (f < f0 - 1) break;
      const sc = popIn(f, f0 - 1, 4), sway = 0.0011 * n * n * Math.sin(f * 0.17) * (1 + 0.8 * sm(f, TOWER1, TOWER1 + 5) * Math.exp(-Math.max(0, f - TOWER1 - 5) / 9));
      burgerCard(c, [TOWER_X + sway, TABLE_H + 0.105 + 0.2 * n, TOWER_Z], 0.36 * sc, 0.04 * Math.sin(n * 2.3));
    }
    const up = sm(f, 430, 462), gulp = f >= LOOKUP;
    const pose: Pose = { acc: 1, expr: gulp ? "nervous" : f >= 414 ? "wow" : "chew", chew: eatLoop(f), facing: 1, look: 1, headTilt: -13 * up, blink: lidAt(f, 3, [414, LOOKUP]), tilt: -2 * up,
      L: HANG, R: { h: [0.5, 0.1], bend: -0.2, front: true, prop: "burger" } };
    put(c, GUS, pose, GUS_T, { wide: true, tall: true });
  } else if (id === 5) {
    // his wife flips pancakes; Gus catches every one in his mouth
    const flickAt = (ff: number) => FLIPS.reduce((s, f0) => s + lin([[f0 - 4, 0], [f0, 26], [f0 + 4, -4], [f0 + 9, 0]], ff), 0);
    const upAt = (ff: number) => FLIPS.reduce((s, f0) => s + lin([[f0 - 4, 0], [f0, 0.16], [f0 + 5, 0]], ff), 0);
    const tip = sm(f, GONE - 2, GONE + 6);          // the pan tipped over: empty
    const away = sm(f, GONE + 2, GONE + 10);
    const wifePose = (ff: number): Pose => ({ expr: "neutral", facing: away > 0.5 ? 0 : -1, look: q(-1 + away, 20), blink: lidAt(ff, 7, [GONE + 6]), headTilt: 4 * away,
      R: { h: [0.02, 0.74], bend: 0.36, front: true }, L: { h: [0.5, 0.4 - upAt(ff) - 0.12 * tip], bend: 0.12, front: true, prop: "pan", arg: flickAt(ff) + 118 * tip } });
    const w = put(c, WIFE, wifePose(f), WIFE5, { wide: true });
    const pan = w.at(w.A.propL, 0.05);
    const gm = where(c, GUS, { acc: 1, facing: 1 }, GUS5, { wide: true, tall: true }), mouth = gm.at(gm.A.mouth, 0.06);
    let biteNow = false, lastCatch = -99;
    FLIPS.forEach((f0, i) => {
      const f1 = CATCH[i];
      if (f >= f1) { lastCatch = f1; return; }
      if (f >= f1 - 7) biteNow = true;
      if (f < f0) { if (i === 0 || f >= CATCH[i - 1] + 1) { const sc = i === 0 ? 1 : popIn(f, CATCH[i - 1] + 1, 4); fx(c, "cake0.2", 300, 300, (p) => fxPancake(p, 0.2), [pan[0], pan[1] + 0.02, pan[2]], 0.34 * sc, 0.34 * sc); } return; }
      const rel = where(c, WIFE, wifePose(f0), WIFE5, { wide: true }), p0 = rel.at(rel.A.propL, 0.05), u = (f - f0) / (f1 - f0);
      // a flat toss that comes up to his mouth from below and in front: the path never crosses his eyes
      const pos: V3 = [lerp(p0[0], mouth[0] + 0.1, u ** 0.8), lerp(p0[1] + 0.03, mouth[1] - 0.03, u) + 0.1 * 4 * u * (1 - u) * (1 - u), lerp(p0[2], mouth[2], u)];
      const sq = q(Math.cos(u * Math.PI * 3), 20);
      fx(c, `cake${sq}`, 300, 300, (p) => fxPancake(p, sq), pos, 0.34 * (1 - 0.55 * u ** 3), 0.34 * (1 - 0.55 * u ** 3), { rot: 0.3 * Math.sin(u * 5) });
    });
    const waiting = f >= GONE + 4;
    const gpose: Pose = { acc: 1, facing: 1, look: 1, expr: biteNow ? "bite" : lastCatch > 0 ? (waiting ? "smile" : "chew") : "grin", chew: eatLoop(f), blink: lidAt(f, 4, [...CATCH.map((x) => x - 7), ...CATCH, GONE + 4]),
      tilt: 5, headTilt: -3, L: HANG, R: waiting ? { ...armMix(HANG, { h: [0.62, 0.1], bend: 0.1 }, sm(f, GONE + 4, GONE + 12)), front: true } : HANG };
    const g = put(c, GUS, gpose, GUS5, { wide: true, tall: true });
    for (const f1 of CATCH) crumbs(c, add(g.at(g.A.mouth, 0.08), [0.06, -0.05, 0]), f1, 0.5);
    sparkle(c, add(pan, [-0.02, 0.12, 0.03]), GONE, 14, 0.26);
  } else if (id === 6) {
    // the neighbor laughs over his fence, a sausage on his fork; Gus pops up right at the fork and it is gone
    const took = f >= POPUP + 5, notice = f >= POPUP + 9, jaw = f >= JAW;
    const laugh = !notice, shake = laugh ? 0.012 * Math.sin(f * 1.5) : 0;
    const forkArm = (prop: string): Arm => ({ h: [0.56, 0.16], bend: -0.3, front: true, prop, arg: 0 });
    const npose: Pose = { expr: jaw ? "jawdrop" : notice ? "shock" : "laugh", facing: notice ? 1 : -1, look: notice ? 1 : -1, blink: lidAt(f, 6, [POPUP + 9, JAW]),
      tilt: laugh ? -5 + 2.5 * Math.sin(f * 0.75) : 3, headTilt: laugh ? 5 * Math.sin(f * 0.75 + 1) : lerp(-4, 4, sm(f, JAW - 3, JAW + 4)),
      L: laugh ? { h: [0.86, 0.22 + 0.05 * Math.sin(f * 0.75)], bend: 0.1, front: true, hand: "point" } : { h: [0.5, 0.36], bend: 0.2, front: true },
      R: forkArm(took ? "forkEmpty" : "fork") };
    const n = put(c, NEIGHBOR, npose, [NEIGH[0], NEIGH[1] + shake, NEIGH[2]], { noBlob: true, wide: true });
    burst(c, n.at(n.A.propR, 0.06), POPUP + 5, 6, 0.6);
    if (f >= POPUP - 2) {
      // Gus comes up so that his mouth meets the sausage on the fork
      const still = where(c, NEIGHBOR, { tilt: 0, R: forkArm("fork") }, NEIGH, { wide: true }), sp = still.at(still.A.propR, 0);
      const gbase: Pose = { acc: 1, facing: -1 };
      const m0 = where(c, GUS, gbase, GUS6, { wide: true, tall: true }), mm = m0.at(m0.A.mouth, 0);
      const y = lerp(-1.3, 0, 1 - (1 - clamp01((f - (POPUP - 2)) / 8)) ** 2.6), eaten = f >= SAUSAGE;
      const gpose: Pose = { ...gbase, expr: !took ? "bite" : eaten && f >= SAUSAGE + 16 ? "smile_closed" : "chew", chew: eatLoop(f), look: -1, blink: lidAt(f, 5, [POPUP + 5, SAUSAGE + 16]), headTilt: 3,
        L: { h: [0.3, 0.5], bend: 0.2 }, R: { h: [0.3, 0.5], bend: 0.2 } };
      const g = put(c, GUS, gpose, [GUS6[0] + sp[0] - mm[0] + 0.07, GUS6[1] + y + sp[1] - mm[1] + 0.01, GUS6[2]], { noBlob: true, wide: true, tall: true });
      const m = g.at(g.A.mouth, 0.1);
      if (took && !eaten) { const sh = 1 - 0.55 * sm(f, SAUSAGE - 9, SAUSAGE); fx(c, "sausage", 200, 120, fxSausage, [m[0] - 0.09 * sh, m[1] + 0.005, m[2]], 0.2 * sh, 0.12); }
      crumbs(c, add(m, [-0.06, -0.05, 0]), SAUSAGE, 0.5);
    }
  } else if (id === 7) {
    // the heart that hums
    const buzz = f >= TICK0, birdIn = sm(f, HUM - 6, HUM + 6), turn = f >= HUM + 4;
    const pose: Pose = { expr: turn ? "smile" : buzz ? "wow" : "smile", facing: turn ? 1 : 0, look: turn ? 1 : 0, headTilt: turn ? -3 : 9 * sm(f, 722, 732), blink: lidAt(f, 8, [TICK0, HUM + 4]),
      L: HANG, R: buzz && !turn ? { ...armMix(HANG, { h: [-0.02, 0.36], bend: 0.3 }, sm(f, TICK0 + 6, TICK0 + 16)), front: true } : HANG };
    const g = put(c, GUS, pose, GUS_C);
    const m = g.at(g.A.mouth, 0.08), k = buzz ? f % 2 : 0, sc = popIn(f, 714, 5) * (buzz ? 1 + 0.05 * (k ? 1 : -1) : 1), hum = f >= HUM - 8;
    fx(c, `heart${k}${hum ? "h" : ""}`, 460, 300, (p) => fxHeart(p, k, hum), [m[0] - 0.02 + (buzz ? 0.006 * (k ? 1 : -1) : 0), m[1] - 0.4, m[2]], 0.442 * sc, 0.288 * sc);
    if (birdIn > 0) { const h = g.at(g.A.head, 0.05); bird(c, [h[0] + 0.5 + 1.4 * (1 - birdIn), h[1] + 0.1 + 0.4 * (1 - birdIn) + 0.012 * Math.sin(f * 0.4), h[2] + 0.04], { left: true }); }
  } else if (id === 8) {
    // the helmet fogs up
    const k = 0.56 * sm(f, 830, 884);
    const pose: Pose = { expr: f >= FOG0 ? "nervous" : "wow", look: q(Math.sin((f - 826) * 0.16), 10), blink: lidAt(f, 9, [FOG0]), headTilt: 2 * Math.sin(f * 0.1), L: HANG, R: HANG };
    const g = put(c, GUS, pose, GUS_C);
    const h = g.at(g.A.head, 0.06);
    fx(c, `fog${q(k, 60)}`, 300, 300, (p) => fxFog(p, q(k, 60)), [h[0], h[1] + 0.012, h[2]], 0.7, 0.7, { soft: true });
    const a = sm(f, FOG0 - 6, FOG0 + 6);
    steam(c, [h[0] - 0.3, h[1] - 0.33, h[2]], 0.24, a, 0.1, 0.035); steam(c, [h[0] + 0.3, h[1] - 0.33, h[2]], 0.24, a, 0.6, 0.035);
    question(c, [h[0] + 0.43, h[1] + 0.3, h[2]], WHY, 0.34);
  } else if (id === 9) {
    // all that food turns into heat; four space heaters
    const lit = f >= TO_HEAT, drop = sm(f, 962, 976), heatA = sm(f, TO_HEAT + 2, TO_HEAT + 14);
    const R: Arm = { ...armMix({ h: [0.56, -0.2], bend: -0.26 }, HANG, drop), front: true, prop: lit ? undefined : "burger" };
    const pose: Pose = { expr: lit ? (f < TO_HEAT + 16 ? "shock" : f >= GLOW + 7 ? "pained" : "nervous") : "smile", facing: 0, look: q(1 - drop, 10), blink: lidAt(f, 10, [TO_HEAT, TO_HEAT + 16, GLOW + 7]), headTilt: -3 * (1 - drop), L: HANG, R };
    const g = put(c, GUS, pose, GUS_C, { wide: true });
    // the flame grows over the burger for three frames before the burger is gone, and dies as he lowers his hand
    if (f >= TO_HEAT - 3 && f < 972) {
      const hand = g.at(lit ? g.A.R : g.A.propR, 0.06), k = q(sm(f, TO_HEAT - 3, TO_HEAT + 4) * (1 - sm(f, 960, 972)) * (0.9 + 0.1 * Math.sin(f * 1.3)), 20), t = q(((f * 0.19) % 1), 24);
      if (k > 0.04) fx(c, `flame9|${t}|${k}`, 300, 420, (p) => draw.fxFlame(p, t, k), [hand[0], hand[1] + 0.2 * k + (lit ? 0.02 : -0.04), hand[2]], 0.34, 0.48, { gain: 1.5 });
      sparkle(c, [hand[0] + 0.02, hand[1] + 0.12, hand[2] + 0.02], TO_HEAT - 1, 12, 0.5);
    }
    const top = g.at(g.A.head, -0.04);
    heat(c, [top[0], top[1] + 0.3, top[2]], 0.5, heatA, 0, 0.0);
    heat(c, [top[0] - 0.42, top[1] - 0.25, top[2]], 0.36, heatA, 0.35, 0.3); heat(c, [top[0] + 0.42, top[1] - 0.25, top[2]], 0.36, heatA, -0.35, 0.6);
    const glowK = sm(f, GLOW, GLOW + 10), gq = q(glowK, 16);
    [-0.57, -0.19, 0.19, 0.57].forEach((x, i) => {
      const f0 = i === 1 || i === 2 ? HEAT_A : HEAT_B;
      if (f < f0 - 1) return;
      const sc = popIn(f, f0 - 1, 5), pos: V3 = [x, 0.3 * sc, 0.55 + 0.04 * (i % 2)];
      fx(c, `heater${q(glowK, 8)}`, 300, 420, (p) => fxHeater(p, q(glowK, 8)), pos, 0.38 * sc, 0.532 * sc);
      // the glow sits behind the heater (a halo round it), the heat lines rise in front of Gus's legs
      if (glowK > 0) { fx(c, `glow${gq}`, 256, 256, (p) => fxGlow(p, "255,140,50", gq), [x, 0.34, 0.45], 0.95, 0.95, { soft: true, gain: 1.4 }); heat(c, [x, 0.56, 0.57], 0.26, glowK * 0.9, 0, i * 0.23); }
    });
    if (glowK > 0) fx(c, `glow${gq}`, 256, 256, (p) => fxGlow(p, "255,140,50", gq), [GUS_C[0], 1.25, GUS_C[2] - 0.12], 1.7, 2.3, { soft: true, gain: 1.1 });
  } else if (id >= 10 && id <= 12) {
    // the table: one french fry, one baked potato
    const cold = sm(f, FRY_COLD - 8, FRY_COLD + 2), fry: V3 = [FRY_AT[0], FRY_AT[1] + 0.105, FRY_AT[2]], pot: V3 = [POTATO_AT[0], POTATO_AT[1] + 0.148, POTATO_AT[2]];
    // 'more skin for their size': on SKIN the outline of both lights up and stays
    const rim = id === 12 ? q(popIn(f, SKIN - 2, 6) * 0.8, 20) : 0;
    fx(c, `fry${q(cold, 10)}|${rim}`, 420, 300, (p) => fxFry(p, q(cold, 10), rim), fry, 0.34, 0.243);
    steam(c, [fry[0] + 0.01, fry[1] + 0.0, fry[2] - 0.02], 0.2, 1 - sm(f, FRY_COLD - 22, FRY_COLD - 4), 0.2, 0.034);
    if (f >= FRY_COLD - 1) { const sc = popIn(f, FRY_COLD - 1, 5); fx(c, "frost", 200, 200, fxFrost, [fry[0] + 0.1, fry[1] + 0.12, fry[2] + 0.02], 0.09 * sc, 0.09 * sc, { rot: 0.02 * (f - FRY_COLD) }); }
    const butter = sm(f, 1150, 1205);
    fx(c, `potato${q(butter, 12)}|${rim}`, 460, 360, (p) => fxPotato(p, q(butter, 12), rim), pot, 0.4, 0.313);
    steam(c, [pot[0] - 0.03, pot[1] + 0.02, pot[2] - 0.02], 0.26, 1, 0.0, 0.03); steam(c, [pot[0] + 0.07, pot[1] + 0.05, pot[2] - 0.03], 0.3, 0.9, 0.5, 0.024);
    if (id === 12) {
      sparkle(c, [fry[0] - 0.06, fry[1] + 0.04, fry[2] + 0.04], SKIN, 14, 0.2); sparkle(c, [pot[0] + 0.12, pot[1] + 0.06, pot[2] + 0.04], SKIN + 4, 14, 0.22);
    }
  } else if (id === 14 || id === 15) {
    // Gus is the baked potato: butter on the helmet, then the thermometer
    const th = id === 15 || f >= THERMO0 - 9;
    const lvl = f >= THERMO_POP ? 2 : lin([[THERMO0 - 9, 0.12], [THERMO0, 0.2], [THERMO_POP - 1, 1.0]], f), popped = f >= THERMO_POP;
    const raise = sm(f, THERMO0 - 12, THERMO0 - 2);
    const R: Arm = th ? { ...armMix(HANG, { h: [0.74, -0.34], bend: 0.1 }, raise), front: true, prop: "thermo", arg: lvl } : HANG;
    const pose: Pose = { expr: popped ? "shock" : th ? "nervous" : f >= BUTTER ? "wow" : "nervous", facing: th && raise > 0.5 ? 1 : 0, look: th && raise > 0.5 ? 1 : 0, headTilt: th ? 0 : -7 * sm(f, BUTTER - 4, BUTTER + 2),
      blink: lidAt(f, 11, [BUTTER, THERMO0 - 7, THERMO_POP]), L: HANG, R };
    const g = put(c, GUS, pose, GUS_C, { wide: true });
    const top = g.at(g.A.head, 0.05), crown: V3 = [top[0], top[1] + 0.335, top[2]];
    const fall = clamp01((f - (BUTTER - 9)) / 9), melt = sm(f, MELT - 2, MELT + 22);
    if (f >= BUTTER - 9) fx(c, `butter${q(melt, 12)}`, 220, 200, (p) => fxButter(p, q(melt, 12)), [crown[0], crown[1] - 0.005 + 1.1 * (1 - fall * fall), crown[2]], 0.24, 0.218);
    sparkle(c, [crown[0] + 0.13, crown[1] + 0.1, crown[2] + 0.02], BUTTER, 12, 0.26); // (a burst of thin rays here scored 0.7 in the frame check)
    steam(c, [crown[0] - 0.04, crown[1] + 0.06, crown[2] - 0.04], 0.46, 1, 0.0, 0.03); steam(c, [crown[0] + 0.1, crown[1] + 0.1, crown[2] - 0.05], 0.52, 0.9, 0.5, 0.024);
    if (popped && f < THERMO_POP + 14) {
      const u = (f - THERMO_POP) / 14, at = g.at(g.A.propR, 0.05);
      const grow = 0.55 + 0.45 * sm(f, THERMO_POP, THERMO_POP + 4);
      fx(c, `shards${q(u, 30)}`, 400, 400, (p) => fxShards(p, q(u, 30)), at, 0.9 * grow, 0.9 * grow);
    }
  }
};

// ---------------- the park: the hummingbird at its feeder ----------------
// The park lens looks toward +z, so screen right is -x there: SX turns a screen offset into a world offset.
const SX = -1;
const park = (c: Ctx) => {
  const { id, f } = c, W = 0.36;
  const pos: V3 = [BIRD_P[0], BIRD_P[1] + 0.006 * Math.sin(f * 0.35), BIRD_P[2]];
  const level = id === 3 ? lerp(0.96, 0.07, sm(f, DRAIN0, DRAIN1)) : 0.62;
  const lv = q(level, 60);
  // the feeder hangs screen right of the bird, its flower port at the beak tip
  const tip = beak(BIRD_P, W);
  fx(c, `feeder${lv}`, 260, 900, (p) => fxFeeder(p, lv), [BIRD_P[0] + SX * (tip[0] - BIRD_P[0] + 0.076), tip[1] + 0.263, BIRD_P[2] + 0.01], 0.2, 0.692);
  if (id === 3) {
    bird(c, pos, { w: W });
    // "burns fuel": a little afterburner from its tail, pointing back (screen left)
    if (f >= BURN - 1) {
      const k = q(Math.min(1, (f - BURN + 2) / 4) * (0.82 + 0.18 * Math.sin(f * 1.3)), 20), t = q(((f * 0.19) % 1), 24);
      fx(c, `jet${t}|${k}`, 300, 420, (p) => draw.fxFlame(p, t, k), [pos[0] + SX * -0.24, pos[1] + 0.012, pos[2] + 0.02], 0.12, 0.17, { rot: Math.PI / 2, gain: 1.5 });
      burst(c, [pos[0] + SX * -0.17, pos[1] + 0.012, pos[2] + 0.03], BURN - 1, 5, 0.3, "#ffb52e");
    }
  } else {
    const happy = f >= COOL - 3 && f < COOL + 16;
    bird(c, pos, { lid: happy ? 1 : 0, w: W });
    // its heat just leaks away: wavy lines lift off its back and its belly side, drift up and thin out, twice
    for (const w0 of [LEAK0 - 8, LEAK0 + 9]) {
      const u = clamp01((f - w0) / 30);
      if (u <= 0 || u >= 1) continue;
      const a = Math.sin(Math.PI * u) ** 0.6, lift = 0.1 * u;
      heat(c, [pos[0] + SX * -0.07, pos[1] + 0.06 + lift, pos[2] - 0.02], 0.15, a, 0.3, 0.1, SX, true);
      heat(c, [pos[0] + SX * 0.045, pos[1] + 0.085 + lift, pos[2] - 0.02], 0.15, a, -0.12, 0.45, SX, true);
      heat(c, [pos[0] + SX * -0.2, pos[1] - 0.0 + lift, pos[2] - 0.02], 0.12, a * 0.9, 0.75, 0.8, SX, true);
    }
    sparkle(c, [pos[0] + SX * 0.06, pos[1] + 0.15, pos[2] + 0.03], COOL, 14, 0.14);
  }
};

// ---------------- the sea ----------------
const fisher = (c: Ctx, pose: Pose) => put(c, FISHER, { mode: "chair", ...pose }, FISHER_AT(c.f));
const FREST: Arm = { h: [0.3, 0.5], bend: 0.2 };
const ocean = (c: Ctx) => {
  const { id, f } = c;
  const gx = SEA_G[0], gz = SEA_G[2];
  if (id === 16) {
    const y = seaY(f), inAir = f < SPLASH + 6, under = f >= SPLASH + 6 && f < SURFACE - 7, up = f >= SURFACE - 7; // he sinks out of sight inside the splash
    if (inAir) put(c, GUS, { mode: "air", expr: "shock", flap: (f * 0.25) % 1, L: { h: [0.3, 0.55], bend: 0.3, front: true }, R: { h: [0.3, 0.6], bend: 0.3, front: true }, legs: [[-0.22, 0.62], [0.26, 0.6]] },
      [gx, y, gz], { noBlob: true });
    else if (!under) put(c, GUS, { expr: f >= BLISS - 4 ? "relief" : "relief_open", look: 0, blink: lidAt(f, 12, [BLISS - 4]), headTilt: 4 * sm(f, BLISS - 6, BLISS + 4), L: HANG, R: HANG }, [gx, y, gz], { noBlob: true });
    splash(c, [gx, 1.0, gz + 0.05], SPLASH, 17, 2.6);
    if (f >= HISS - 6 && f < HISS + 30) { const u = q((f - (HISS - 6)) / 36, 36); fx(c, `sburst${u}`, 500, 500, (p) => fxSteamBurst(p, u), [gx, 0.75 + 0.5 * u, gz + 0.1], 2.3, 2.3, { soft: true }); }
    if (up) { const a = (0.9 - 0.4 * sm(f, SURFACE + 10, SURFACE + 50)) * sm(f, SURFACE - 7, SURFACE + 4); steam(c, [gx - 0.05, y + 1.72, gz - 0.03], 0.4, a, 0.1, 0.03); steam(c, [gx + 0.16, y + 1.66, gz - 0.04], 0.34, a * 0.8, 0.6, 0.026); ripples(c, [gx, 0, gz], 2.0, 1.6, 44); }
    burst(c, [gx, 0.2, gz + 0.1], SURFACE - 6, 6, 0.9, "#d8eeff");
    const seen = f >= SPLASH - 14;
    fisher(c, { expr: f >= SPLASH ? (f >= SURFACE ? "wow" : "shock") : seen ? "wow" : "neutral", facing: -1, look: -1, headTilt: seen && f < SPLASH ? -12 : f >= SPLASH ? 4 : 0, blink: lidAt(f, 15, [SPLASH - 14, SPLASH, SURFACE]), L: FREST, R: FREST });
    ripples(c, [FISHER_AT(f)[0] - 0.1, 0, FISHER_AT(f)[2]], 4.6, 3.0, 66, 20);
  } else if (id === 17) {
    const oops = f >= OOPS, think = f >= THINK;
    const g = put(c, GUS, { expr: think ? "sad" : oops ? "nervous" : "relief", look: q(0.6 * sm(f, THINK - 2, THINK + 6), 10), blink: lidAt(f, 12, [OOPS, THINK]), headTilt: lerp(4, -3, sm(f, OOPS - 4, OOPS + 5)), L: HANG, R: HANG }, [gx, NECK + bobY(f), gz], { noBlob: true });
    const rum = f >= RUMBLE0 && f < RUMBLE0 + 30;
    ripples(c, [gx, 0, gz], rum ? 1.5 : 2.0, rum ? 1.2 : 1.6, rum ? 12 : 44, 0, rum ? 0.9 : 0.55);
    if (rum) ripples(c, [gx, 0, gz], 2.3, 1.8, 12, 6, 0.7);
    steam(c, [gx - 0.03, NECK + 1.72, gz - 0.03], 0.3, 0.45 * (1 - sm(f, 1690, 1730)), 0.1, 0.03);
    if (f >= THINK - 1) { const h = g.at(g.A.head, 0.05), sc = popIn(f, THINK - 1, 5); fx(c, "thought", 460, 420, fxThought, [h[0] + 0.3, h[1] + 0.56 + 0.01 * Math.sin(f * 0.2), h[2] + 0.02], 0.52 * sc, 0.475 * sc); }
    fisher(c, { expr: "wow", facing: -1, look: -1, headTilt: 4, blink: lidAt(f, 15), L: FREST, R: FREST });
  } else {
    // sunset and night: Gus lives in the water now; the bird comes to roost on the fisherman's hat
    const dim = id >= 20 ? 0.6 : 1; // effect cards are unlit: dim the burgers at night
    const biteK = id === 21 ? sm(f, LAST_BITE - 7, LAST_BITE - 1) * (1 - sm(f, LAST_BITE + 3, LAST_BITE + 10)) : 0;
    const gp: V3 = [gx, NECK + bobY(f), gz];
    const base: Pose = { acc: 1, facing: 0 };
    const m = where(c, GUS, base, gp, { wide: true, tall: true }), mouth = m.at(m.A.mouth, 0);
    const holdR: Arm = { h: [0.56, -0.5], bend: -0.2, front: true };
    const toR: Arm = { h: reach(c, gp, 1, [mouth[0] + 0.06, mouth[1] - 0.1, mouth[2]]), bend: -0.3, front: true };
    const biting = id === 21 && f >= LAST_BITE - 4 && f < LAST_BITE + 1;
    const gpose: Pose = { ...base, expr: biting ? "bite" : id === 21 && f < LAST_BITE ? "sad" : "chew", chew: eatLoop(f), look: 0, blink: id === 21 ? lidAt(f, 12, [LAST_BITE - 4, LAST_BITE + 1]) : lidAt(f, 12), headTilt: 3 * biteK,
      L: HANG, R: { ...armMix(holdR, toR, biteK), front: true } };
    const g = put(c, GUS, gpose, gp, { noBlob: true, wide: true, tall: true });
    burgerCard(c, add(g.at(g.A.R, 0.07), [0.015, 0.07, 0]), 0.3, -0.12 * biteK, dim);
    if (id === 21) crumbs(c, add(g.at(g.A.mouth, 0.1), [0, -0.08, 0]), LAST_BITE, 0.6);
    ripples(c, [gx, 0, gz], 2.0, 1.6, 44);
    const fp: Pose = { expr: "asleep", headTilt: 9 + 1.2 * Math.sin(f * 0.07), tilt: 3, L: { h: [0.2, 0.6], bend: 0.2 }, R: { h: [0.22, 0.6], bend: 0.2 } };
    const fg = fisher(c, fp), fpos = FISHER_AT(f);
    if (id !== 19 && id !== 20) sleepBubble(c, [fpos[0] - 0.24, fpos[1] + 1.0, fpos[2] + 0.06], 0.28);
    ripples(c, [fpos[0] - 0.1, 0, fpos[2]], 4.6, 3.0, 66, 20);
    // the bird: `top` is 0.09 m over the crown of the sou'wester; it perches a little to screen left of the lantern pole
    const top = fg.at(fg.A.top, 0.06), perch: V3 = [top[0] - 0.12, top[1] - 0.075, top[2]], hov: V3 = [top[0] - 0.22, top[1] + 0.3, top[2] + 0.02];
    if (id === 18) {
      if (f >= BIRD_SEA - 2) { const k = 1 - (1 - clamp01((f - (BIRD_SEA - 2)) / 18)) ** 3; bird(c, [hov[0] - 2.4 * (1 - k), hov[1] + 0.9 * (1 - k) + 0.02 * Math.sin(f * 0.4), hov[2]], { rot: -0.2 * (1 - k), w: 0.34 }); }
      question(c, [hov[0] - 0.5, hov[1] + 0.3, hov[2]], FUNNY, 0.44);
    } else if (id === 19) {
      const tired = sm(f, 1808, 1852), land = sm(f, LAND0 - 6, LAND0 + 6), folded = f >= LAND0 + 4; // settled a third of a second before the crossfade
      const slow = tired < 0.4 ? 1 : tired < 0.8 ? 2 : 3, wing = folded ? 0 : Math.floor(f / slow) % 2 ? 1 : -1;
      const dip = 0.05 * tired * Math.sin(f * 0.33) - 0.04 * tired;
      bird(c, [lerp(hov[0], perch[0], land), lerp(hov[1] + dip, perch[1], land), perch[2]], { wing, lid: 0.55 * tired, droop: tired * (1 - land), w: 0.34 });
    } else {
      const fluff = sm(f, 1884, 1904), shut = sm(f, SHUT - 4, SHUT + 1);
      bird(c, [perch[0], perch[1] + 0.008 * fluff, perch[2]], { wing: 0, lid: id === 21 || shut > 0.5 ? 1 : 0.5, fluff: id === 21 ? 1 : fluff, w: 0.34, gain: 0.62 });
      if (id === 21 || f >= SHUT + 5) sleepBubble(c, [perch[0] + 0.21, perch[1] + 0.03, perch[2] + 0.03], id === 21 ? 0.2 : 0.17 * sm(f, SHUT + 5, SHUT + 12));
    }
  }
};

/** everything with a face (and every 2D effect card) of one frame */
export const stage = (c: Ctx) => {
  const place = c.shot.place;
  if (place === "garden") garden(c);
  else if (place === "park") park(c);
  else ocean(c);
};
void HIP;
