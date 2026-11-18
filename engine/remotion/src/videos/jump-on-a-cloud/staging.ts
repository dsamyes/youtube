// Staging of "What If You Jumped on a Cloud?": who is where in which pose, and every 2D card, for all 24 shots.
// stage(c) is a pure function of the shot and the frame; the timing comes from story.ts, the drawings from props.ts
// (plus the stopwatch and the number tag of immortal-snail).
import {
  Ctx, V3, Pose, Arm, PutOpt, put, fx, armMix, sm, lidAt, talk, q, HANG, HIP, clamp01, lerp, lin, add, hash, flail, reach, behind,
  GUS, WIFE, NEIGHBOR, NEIGH, sparkle, question, arrow, burst, puff, splash, cloud, birds, flame, popIn, sleepBubble, Pen,
} from "../../toon/kit";
import {
  PLUNGE, OUT1, GLINT, PILLOW, BLANKET, DREAM, WAVE, BOUNCE, STRAP, TUG, BURNER, KNOCK, TONS, ELEPH, JUMP, ENTER, WATCH, TICKS, T22,
  WHY, PULL, PIECE, FRIDGE, DROPS, DOOR, DROPLET, SINK, BREEZE, HELD, SAT, CUP, TIP, CHUTE, LAND, DAMP, SWARM, MERGE, RAINDROP, DARK, FIRST, POUR, UMBRELLA,
  CHAIR, GUS_AT, WIFE_AT, EVE, walk18, drop21, cloud1, cloud2, balloon8, jumpT, INCH, dropletY,
} from "./story";
import {
  CloudTone, fxFat, fxWisp, fxStreak, fxWhite, fxBalloon, fxBasket, fxHarness, fxPack, fxChute, fxTons, fxElephant, fxPillow, fxBlanket,
  fxLand, fxDashFrame, fxFridge, fxDrop, fxDroplet, fxScale, fxCup, fxRain, fxUmbrella, RED,
} from "./props";
import { fxWatch, fxHand, fxTag } from "../immortal-snail/props";

/** popIn that is 0 before its frame */
const pop = (f: number, f0: number, n = 6) => (f < f0 ? 0 : popIn(f, f0, n));
const pulse = (f: number, f0: number, up = 4, down = 8) => (f < f0 - up || f >= f0 + down ? 0 : f < f0 ? sm(f, f0 - up, f0) : 1 - sm(f, f0, f0 + down));

// ---------------- the cloud ----------------
/** the fat cloud, w metres wide, centre at `at`; part 0 whole, 1 back lobes, 2 front lobes; sy squashes it */
const fat = (c: Ctx, at: V3, w: number, part = 0, tone: CloudTone = "day", face = 0, sy = 1) =>
  fx(c, `fat|${part}|${tone}|${face}`, 1000, 600, (p) => fxFat(p, part, tone, face), at, w, w * 0.6 * sy);
/** streaks rushing up past a falling subject near the origin */
const streaks = (c: Ctx, n: number, speed: number, tone = 0, spread = 2.4) => {
  for (let i = 0; i < n; i++) {
    const x = (hash(i, 51) - 0.5) * 2 * spread, y = ((hash(i, 52) + c.f * speed * (0.7 + 0.6 * hash(i, 53))) % 1) * 9 - 4.5;
    if (Math.abs(x) < 0.55) continue;
    fx(c, `streak${tone}`, 40, 400, (p) => fxStreak(p, tone), [x, y, -0.6 + 0.9 * hash(i, 54)], 0.07, 0.9 + 0.8 * hash(i, 55));
  }
};
/** wisps of cloud drifting up past him */
const wisps = (c: Ctx, n: number, speed: number, tone = 0) => {
  for (let i = 0; i < n; i++) {
    const x = (hash(i, 61) - 0.5) * 6, y = ((hash(i, 62) + c.f * speed * (0.6 + 0.8 * hash(i, 63))) % 1) * 10 - 5;
    fx(c, `wisp${tone}`, 400, 120, (p) => fxWisp(p, tone), [x, y, -1.2 - hash(i, 64)], 1.6 + 1.2 * hash(i, 65), 0.5 + 0.3 * hash(i, 65));
  }
};
/** the inside of the cloud: a white wall behind everything */
const white = (c: Ctx) => fx(c, "white", 64, 64, fxWhite, [0, 0, -5], 80, 80);
const farClouds = (c: Ctx, y0 = -6, speed = 0.01) => {
  for (let i = 0; i < 7; i++) { const x0 = -30 + i * 9 + 4 * hash(i, 31), x = ((((x0 - speed * c.f) % 60) + 60) % 60) - 30; cloud(c, [x, y0 - 5 * hash(i, 32), -14 - 20 * hash(i, 33)], 7 + 5 * hash(i, 34), i % 4); }
};

// ---------------- Gus and his parachute ----------------
type GusOpt = PutOpt & { harness?: number };
/** Gus; harness 0..1 = the red parachute harness on his chest and the pack on his back (its pop-in scale) */
const gus = (c: Ctx, pose: Pose, pos: V3, o: GusOpt = {}) => {
  const hs = o.harness ?? 1, sc = o.scale ?? 1;
  const g = put(c, GUS, pose, pos, o);
  if (hs > 0.02) {
    const h = g.at(g.A.head, 0), m = g.at(g.A.mouth, 0), d: V3 = [m[0] - h[0], m[1] - h[1], m[2] - h[2]], L = Math.hypot(d[0], d[1], d[2]) || 1;
    const u: V3 = [d[0] / L, d[1] / L, d[2] / L];                               // down the card
    const rot = Math.atan2(u[0] * c.cam.right.x + u[1] * c.cam.right.y + u[2] * c.cam.right.z, -(u[0] * c.cam.up.x + u[1] * c.cam.up.y + u[2] * c.cam.up.z));
    const chestF = g.at(g.A.head, 0.05), chestB = g.at(g.A.head, -0.05), k = 0.52 * sc;
    fx(c, "harness", 200, 200, fxHarness, [chestF[0] + u[0] * k, chestF[1] + u[1] * k, chestF[2] + u[2] * k], 0.32 * sc * hs, 0.38 * sc * hs, { rot });
    fx(c, "pack", 300, 300, fxPack, [chestB[0] + u[0] * k, chestB[1] + u[1] * k, chestB[2] + u[2] * k], 0.48 * sc * hs, 0.56 * sc * hs, { rot });
  }
  return g;
};
/** falling Gus at `at` (body centre), tumbling a little */
const gusFall = (c: Ctx, at: V3, expr: Pose["expr"] = "shock", amp = 1, extra: Pose = {}) =>
  gus(c, { ...flail(c.f, amp), expr, blink: lidAt(c.f, 1), ...extra }, at, { face: true, roll: 0.12 * Math.sin(c.f * 0.21), wide: true, tall: true, noBlob: true });

const BH = 1040 / 600, BS = (1024 - 520) / 600;   // card height and basket floor below the centre, per metre of width
/** the hot-air balloon, w metres wide, centre at `ctr`, with Gus in the basket (pose null = empty); returns Gus */
const balloon = (c: Ctx, ctr: V3, w: number, pose: Pose | null, o: GusOpt = {}) => {
  fx(c, "balloon", 600, 1040, fxBalloon, [ctr[0], ctr[1], ctr[2] - 0.05], w, w * BH);
  const sc = w / 4.2, soles: V3 = [ctr[0], ctr[1] - BS * w + 0.05 * sc, ctr[2]];
  const g = pose ? gus(c, pose, soles, { scale: sc, noBlob: true, ...o }) : null;
  fx(c, "basket", 600, 1040, fxBasket, [ctr[0], ctr[1], ctr[2] + 0.06], w, w * BH);
  return { g, soles, sc };
};
const watch = (c: Ctx, at: V3, w: number, turns: number) => {
  if (w <= 0.01) return;
  fx(c, "watch", 300, 340, fxWatch, at, w, w * 1.133);
  fx(c, "hand", 300, 300, fxHand, [at[0], at[1] - (20 / 300) * w, at[2] + 0.02], w, w, { rot: -2 * Math.PI * turns });
};
/** a puff of cloud that swells and thins out */
const wpuff = (c: Ctx, at: V3, f0: number, n = 12, size = 1) => { const u = (c.f - f0) / n; if (u > 0 && u < 1) fx(c, "wisp1", 400, 120, (p) => fxWisp(p, 1), [at[0], at[1] + 0.5 * u, at[2]], size * (0.5 + u) * (1 - u * u * 0.6), size * 0.4 * (1 - u)); };
const drop = (c: Ctx, at: V3, w: number, rot = 0) => { if (w > 0.01) fx(c, "drop", 100, 140, fxDrop, at, w, w * 1.4, { rot }); };

// ---------------- the garden ----------------
const garden = (c: Ctx) => {
  const { id, f } = c;
  if (id === 3) {
    // Gus in his deck chair stares at a fat little cloud
    const lap: Arm = { h: [0.08, 0.52], bend: 0.25, front: true }, st = sm(f, 244, 252);
    gus(c, { mode: "chair", L: lap, R: lap, expr: f >= 248 ? "wow" : "smile", blink: lidAt(f, 1, [248]), headTilt: -4 - 5 * st + 1.2 * Math.sin(f * 0.06), look: q(-0.4 * st, 10) }, CHAIR, { noBlob: true, wide: true, harness: 0 });
    fat(c, [-1.4 + 0.004 * (f - 146), 17.2, -14], 7.5);
    birds(c, f - 150);
    sparkle(c, [0.2 + 0.004 * (f - 146), 18.6, -13.5], GLINT, 16, 2.4);
  } else if (id === 5) {
    // his wife: it's just fog
    const speaking = f >= 381 && f < 406, k = pulse(f, WAVE + 3, 7, 10);
    put(c, WIFE, { expr: speaking ? talk(f) : "neutral", blink: lidAt(f, 7), headTilt: 3 + 2 * k,
      L: armMix(HIP, { h: [0.66, -0.2], bend: -0.25 }, k), R: HIP }, WIFE_AT, { wide: true });
  } else if (id === 6) {
    // the neighbor bets he'll bounce
    const t = f - (BOUNCE - 2), y = t < 0 ? 0 : 0.15 * Math.sin(t * 0.3) ** 2 * Math.exp(-t / 26), th = sm(f, 420, 428);
    const n = put(c, NEIGHBOR, { expr: "grin", blink: lidAt(f, 6), headTilt: 3 * Math.sin(f * 0.2),
      L: HANG, R: { ...armMix(HANG, { h: [0.5, -0.02], bend: -0.35 }, th), hand: th > 0.5 ? "thumb" : undefined } }, [NEIGH[0], NEIGH[1] + y, NEIGH[2]], { noBlob: true, wide: true });
    sparkle(c, add(n.at(n.A.R, 0.06), [0, 0.18, 0]), BOUNCE + 6, 14, 0.24);
  } else if (id === 7) {
    // the parachute goes on
    const hs = pop(f, STRAP - 2, 6), tug = pulse(f, TUG, 5, 9), up = sm(f, TUG + 6, TUG + 12);
    const chest: Arm = { h: [0.02, 0.42], bend: 0.3, front: true };
    const g = gus(c, { expr: f >= TUG + 6 ? "smile" : "stern", blink: lidAt(f, 1, [TUG + 6]), squash: q(0.25 * pulse(f, STRAP, 2, 6), 40), headTilt: -6 * up,
      L: armMix(HIP, chest, tug), R: armMix(HIP, chest, tug) }, GUS_AT, { harness: hs, wide: true });
    sparkle(c, add(g.at(g.A.head, 0.1), [0.3, -0.5, 0]), STRAP + 2, 12, 0.3);
  } else if (id === 18) {
    // fog is a cloud that sat down
    const x = walk18(f), going = 1 - sm(f, 1436, 1444), ph = (f - 1393) * 0.5;
    const feel: Arm = { h: [0.74, 0.12 + 0.06 * Math.sin(ph)], bend: -0.05 }, at: V3 = [x, 0, 0.3];
    const u = clamp01((f - (SAT - 10)) / 10), wob = f >= SAT ? 1 - 0.16 * Math.exp(-(f - SAT) / 4) * Math.cos((f - SAT) * 0.9) : 1;
    const cy = 0.5 * wob + 4.2 * (1 - u * u), on = f >= SAT - 10;
    if (on) fat(c, [x + 0.05, cy + 0.02, 0.18], 2.9, 1, "day", 0, wob);
    gus(c, { mode: "air", legs: [[-0.16 + 0.22 * going * Math.sin(ph), 1.48 - 0.12 * going * Math.max(0, Math.cos(ph))], [0.16 - 0.22 * going * Math.sin(ph), 1.48 - 0.12 * going * Math.max(0, -Math.cos(ph))]],
      expr: f >= SAT ? "neutral" : "nervous", blink: lidAt(f, 1, [SAT]), look: q(Math.sin(f * 0.16) * going, 8), squash: q(0.3 * pulse(f, SAT + 1, 2, 7), 40),
      L: armMix(feel, HANG, 1 - going), R: armMix(feel, HANG, 1 - going) }, at, { wide: true, harness: 0 });
    if (on) fat(c, [x + 0.05, cy, 0.46], 2.9, 2, "day", 1, wob);
    puff(c, [x - 1.2, 0.15, 0.6], SAT, 10, 0.7); puff(c, [x + 1.3, 0.15, 0.6], SAT + 1, 10, 0.7);
        for (let i = 0; i < 6; i++) {
      const fxx = -2.2 + 0.85 * i + 0.4 * Math.sin(f * 0.02 + i * 2.1), fy = 0.3 + 1.3 * hash(i, 81), w = 1.6 + 1.0 * hash(i, 83);
      fx(c, "wisp2", 400, 120, (p) => fxWisp(p, 2), [fxx, fy, -0.5 - 2.2 * hash(i, 82)], w, w * 0.3);
    }
    // the fog itself: a thin white veil between the lens and everything
    fx(c, "veil", 64, 64, (p) => { p.g.fillStyle = "rgba(255,255,255,0.42)"; p.g.fillRect(0, 0, 64, 64); }, [0.3, 1.1, 2.4], 9, 9);
  } else if (id === 21) {
    // the landing: barely damp
    const y = drop21(f), landed = f >= LAND, k = sm(f, LAND, LAND + 22), meetY = y + lerp(1.25, 0.05, k), hh = lerp(1, 0.14, k), W = 3.3, H = 2.89 * hh;
    fx(c, "chute", 800, 700, fxChute, [GUS_AT[0] - 0.5 * k, meetY + 0.485 * H, GUS_AT[2] - 0.5], W, H);
    const hold: Arm = { h: [0.34, -0.72], bend: -0.2 };
    const g = gus(c, { mode: landed ? "stand" : "air", legs: [[-0.16, 1.44], [0.16, 1.44]], expr: !landed ? "relief_open" : f >= DAMP - 14 ? "grin" : "smile", blink: lidAt(f, 1, [LAND, DAMP - 14]),
      squash: q(0.5 * pulse(f, LAND + 2, 2, 7), 40), tilt: landed ? 0 : 2 * Math.sin(f * 0.2),
      L: armMix(hold, HIP, k), R: armMix(hold, HIP, k) }, [GUS_AT[0], y, GUS_AT[2]], { wide: true, tall: true });
    puff(c, [GUS_AT[0] - 0.35, 0.1, GUS_AT[2] + 0.1], LAND, 10, 0.7); puff(c, [GUS_AT[0] + 0.35, 0.1, GUS_AT[2] + 0.1], LAND + 1, 10, 0.7);
    const t0 = DAMP - 9, top = add(g.at(g.A.head, 0.08), [0.3, -0.12, 0]);
    if (f >= t0 && f < DAMP) { const u = (f - t0) / 9; drop(c, [top[0], lerp(top[1], 0.08, u * u), top[2]], 0.09); }
    burst(c, [top[0], 0.06, top[2]], DAMP, 5, 0.3, "#d8f1ff");
  } else if (id === 23) {
    // by evening the cloud has grown dark
    const up = sm(f, DARK - 8, DARK), r = c.cam.right, sl = lerp(-5.2, 0, sm(f, 1813, 1857)), p = behind(c, EVE, 0.7);
    fat(c, [p[0] + r.x * sl, 3.45, p[2] + r.z * sl], 3.9, 0, "dusk");
    put(c, GUS, { expr: f >= DARK - 4 ? "wow" : "smile_closed", blink: lidAt(f, 1, [DARK - 4]), headTilt: -7 * up, L: HIP, R: HIP }, EVE, { wide: true });
  } else if (id === 24) {
    // the cloud lands on Gus
    const r = c.cam.right, w = c.cam.fwd, G: V3 = [EVE[0] - 0.4 * r.x, 0, EVE[2] - 0.4 * r.z], Wf: V3 = [EVE[0] + 0.5 * r.x - 0.3 * w.x, 0, EVE[2] + 0.5 * r.z - 0.3 * w.z], p = behind(c, EVE, 0.7);
    fat(c, [p[0], 3.2, p[2]], 4.6, 0, "dusk");
    const wet = f >= POUR;
    const g = put(c, GUS, { expr: wet ? "neutral" : f >= FIRST ? "wow" : "smile", blink: lidAt(f, 1, [FIRST, POUR]), headTilt: -6 * sm(f, FIRST, FIRST + 7) * (1 - sm(f, POUR - 4, POUR + 4)),
      squash: q(0.25 * pulse(f, POUR + 1, 2, 7), 40), L: HANG, R: HANG }, G, { wide: true });
    const top = add(g.at(g.A.head, 0.1), [0, 0.3, 0]);
    if (f >= FIRST - 8 && f < FIRST) { const u = (f - (FIRST - 8)) / 8; drop(c, [top[0], lerp(3.0, top[1], u * u), top[2]], 0.1); }
    burst(c, top, FIRST, 5, 0.34, "#d8f1ff");
    // the rain: a few drops, then sheets
    const ph = q((f * 0.085) % 1, 12), heavy = f >= POUR, some = f >= FIRST + 8;
    const rc: V3 = [EVE[0] - 0.14 * w.x, 1.45, EVE[2] - 0.14 * w.z];
    if (some) fx(c, `rain|${ph}|${heavy ? 1 : 0}`, 600, 900, (pp: Pen) => fxRain(pp, ph, heavy ? 110 : 18), rc, 2.6, 3.9);
    splash(c, add(top, [0, 0.12, 0.02]), POUR, 14, 0.9);
    // his wife, dry
    const open = q(sm(f, UMBRELLA - 2, UMBRELLA + 9), 24), upA: Arm = { h: [0.3, 0.1], bend: 0.3, front: true };
    const wf = put(c, WIFE, { expr: f >= UMBRELLA + 6 ? "smile_closed" : "neutral", blink: lidAt(f, 7, [UMBRELLA + 6]), facing: -1, look: -1, L: upA, R: HIP }, Wf, { wide: true, tall: true });
    const hnd = wf.at(wf.A.L, 0.07);
    fx(c, `umb${open}`, 500, 520, (pp: Pen) => fxUmbrella(pp, open), [hnd[0], hnd[1] + 0.68, hnd[2]], 1.5, 1.56);
  }
};

// ---------------- the sky ----------------
const skyStage = (c: Ctx) => {
  const { id, f } = c;
  if (id === 1) {
    // HOOK: Gus drops into the cloud top, and it does not hold him
    const yc = cloud1(f) + 0.2;
    farClouds(c, -9, 0.02);
    fat(c, [0.3, yc, -0.3], 9, 1);
    if (f < 46) streaks(c, 16, 0.045, 1);
    gusFall(c, [0, 0, 0]);
    fat(c, [0.3, yc, 0.3], 9, 2);
    wpuff(c, [-0.7, yc + 1.25, 0.5], PLUNGE + 1, 14, 1.5); wpuff(c, [0.8, yc + 1.2, 0.5], PLUNGE + 3, 14, 1.3);
  } else if (id === 2) {
    // he drops out of its belly
    const yc = cloud2(f) - 0.15;
    if (f >= OUT1) streaks(c, 18, 0.05, 1);
    gusFall(c, [0, 0, 0]);
    fat(c, [0.3, yc, 0.3], 9, 0);
    for (let i = 0; i < 3; i++) { const u = (f - OUT1 - 2 * i) / 16; if (u > 0 && u < 1) fx(c, "wisp1", 400, 120, (p) => fxWisp(p, 1), [(i - 1) * 0.6, 1.3 + 1.6 * u, 0.2], 1.3 * (1 - u), 0.4 * (1 - u)); }
  } else if (id === 4) {
    // the softest bed in the world
    const C: V3 = [0, -0.7, 0];
    farClouds(c, -8);
    fat(c, C, 3.7, 0);
    const s1 = pop(f, PILLOW, 6), s2 = pop(f, BLANKET, 6);
    if (s1 > 0) fx(c, "pillow", 300, 200, fxPillow, [-0.72, 0.42, 0.03], 1.15 * s1, 0.77 * s1, { rot: 0.1 });
    const g = put(c, GUS, { expr: "asleep", L: HANG, R: HANG }, [0.2, 0.5, 0.05], { face: true, roll: Math.PI / 2, scale: 1, noBlob: true });
    if (s2 > 0) fx(c, "blanket", 500, 260, fxBlanket, [0.62, 0.36, 0.09], 1.75 * s2, 0.9 * s2, { rot: -0.03 });
    sleepBubble(c, add(g.at(g.A.mouth, 0.08), [0.05, 0.32, 0]), 0.34);
    sparkle(c, [0.9, 1.25, 0.2], DREAM, 16, 0.7); sparkle(c, [-1.0, 1.2, 0.2], DREAM + 5, 12, 0.4);
  } else if (id === 8) {
    // the balloon climbs above the cloud
    farClouds(c, -9);
    fat(c, [-1.5, -2.6, -0.3], 7);
    const b = balloon8(f), W = 2.7;
    balloon(c, b, W, { expr: "smile", blink: lidAt(f, 1), look: -0.6, L: HANG, R: HANG });
    flame(c, [b[0], b[1] - 0.2 * W, b[2] + 0.02], BURNER, BURNER + 16, 0.5);
  } else if (id === 9) {
    // up close it looks solid
    const K: V3 = [0.5, 0.2, 0.05], dip = Math.max(pulse(f, KNOCK, 4, 3), pulse(f, KNOCK + 6, 3, 4)), lean = sm(f, 588, 600);
    fat(c, [0.6, -1.9, -0.4], 8);
    const ctr: V3 = [-0.35, 2.95, 0];
    const soles: V3 = [ctr[0], ctr[1] - BS * 4.2 + 0.05, ctr[2]];
    const h = reach(c, soles, 1, [K[0] - 0.12, K[1] + 0.2 - 0.18 * dip, K[2]]);
    const b = balloon(c, ctr, 4.2, { expr: f >= KNOCK + 12 ? "wow" : "smile", blink: lidAt(f, 1, [KNOCK + 12]), tilt: 9 * lean, look: q(lean, 10), headTilt: 4 * lean,
      R: { ...armMix(HANG, { h, bend: 0.05 }, lean), front: true }, L: HANG }, { wide: true });
    void b;
    burst(c, K, KNOCK, 5, 0.42); burst(c, K, KNOCK + 6, 5, 0.42);
  } else if (id === 10) {
    // five hundred tons; a hundred elephants
    farClouds(c, -10);
    fat(c, [0, -2.0, -0.3], 6.2);
    const u = clamp01((f - (TONS - 12)) / 12), gone = 1 - sm(f, ELEPH[0] - 26, ELEPH[0] - 3), wy = 0.52 + 9 * (1 - u * u) - 0.1 * pulse(f, TONS + 2, 2, 6);
    if (gone > 0.02) fx(c, "tons", 640, 560, fxTons, [0, wy, 0], 2.7 * gone, 2.36 * gone);
    wpuff(c, [-1.5, -0.3, 0.2], TONS, 12, 1.8); wpuff(c, [1.5, -0.3, 0.2], TONS + 1, 12, 1.8);
    for (let r = 5; r >= 0; r--) for (let i = 0; i < 6 - r; i++) {
      const s = pop(f, ELEPH[Math.floor(r / 2)] + i + (r % 2) * 3, 5); if (s <= 0) continue;
      fx(c, "eleph", 300, 240, (p) => fxElephant(p), [(i - (5 - r) / 2) * 1.14, -0.62 + 0.7 * r + 0.5 * s, 0.05 - 0.02 * r], 1.24 * s, 1.0 * s);
    }
    balloon(c, [2.55, 6.3 + 0.05 * Math.sin(f * 0.1), -0.5], 1.5, { expr: "wow", L: HANG, R: HANG });
  } else if (id === 11) {
    // Gus jumps. He doesn't bounce.
    const t = jumpT(f), W = 3.4, ctr: V3 = [-0.9, 4.09, 0], sc = W / 4.2, s0 = ctr[1] - BS * W + 0.05 * sc;
    fat(c, [0.8, -3.16, -0.4], 8, 1);
    if (t < 0.1) {
      balloon(c, ctr, W, { expr: "stern", squash: q(0.55 * sm(f, 765, JUMP - 1) * (1 - sm(f, JUMP - 1, JUMP + 2)), 40), L: { h: [0.3, 0.6], bend: 0.2 }, R: { h: [0.3, 0.6], bend: 0.2 } }, { wide: true, tall: true });
    } else {
      balloon(c, ctr, W, null);
      const tt = Math.min(t, 1.5), up: Arm = { h: [0.62, -0.5], bend: -0.2 };
      gus(c, { mode: "air", legs: [[-0.3 - 0.1 * Math.sin(f), 1.2], [0.3 + 0.1 * Math.sin(f), 1.25]], expr: t < 0.45 ? "grin" : "wow", blink: lidAt(f, 1, [JUMP + 13]), L: up, R: up, tilt: 6 * tt },
        [-0.9 + 1.5 * tt, s0 + 6.5 * tt - 10.5 * tt * tt, 0.14], { scale: sc, noBlob: true, wide: true, tall: true });
    }
    fat(c, [0.8, -3.16, 0.4], 8, 2);
    wpuff(c, [0.1, -2.0, 0.6], ENTER + 2, 14, 1.6); wpuff(c, [1.2, -2.05, 0.6], ENTER + 4, 14, 1.3);
  } else if (id === 14) {
    // where are the hundred elephants?
    fat(c, [0.4, 3.45, -0.3], 8);
    const s = pop(f, WHY - 3, 6);
    if (s > 0) fx(c, "ghost", 300, 240, (p) => fxElephant(p, true), [-0.45, 2.85, -0.1], 1.5 * s, 1.2 * s);
    question(c, [0.7, 2.85, 0], WHY, 0.85);
    gus(c, { mode: "air", legs: [[-0.2, 1.4 + 0.03 * Math.sin(f * 0.3)], [0.2, 1.42 - 0.03 * Math.sin(f * 0.3)]], expr: "wow", blink: lidAt(f, 1), headTilt: -9 * sm(f, 988, 996),
      L: { h: [0.5, 0.5], bend: 0.05 }, R: { h: [0.5, 0.5], bend: 0.05 } }, [0, 0.04 * Math.sin(f * 0.15), 0], { face: true, roll: 0, wide: true, noBlob: true });
  } else if (id === 15) {
    // a cloud is huge
    fat(c, [0, 8, -0.5], 34);
    fx(c, "band", 64, 64, (p) => { p.g.fillStyle = "#6aab4f"; p.g.fillRect(0, 0, 64, 64); p.g.fillStyle = "#1c1420"; p.g.fillRect(0, 0, 64, 2); }, [0, -30.4, -0.3], 120, 20);
    fx(c, "land", 600, 300, fxLand, [0.5, -18.6, 0], 13, 6.5);
    sparkle(c, [0.6, -16.5, 0.3], PULL + 30, 18, 3.5);
  } else if (id === 16) {
    // a piece the size of your fridge: ten drops. The rest is air.
    fat(c, [-2.9, 1.6, -0.3], 6);
    const s = pop(f, PIECE, 6) * (1 - sm(f, FRIDGE - 6, FRIDGE + 2));
    const k = sm(f, FRIDGE - 14, FRIDGE), sc = lerp(0.55, 1, k), open = q(sm(f, DOOR, DOOR + 18), 36);
    if (f >= FRIDGE - 14) fx(c, `fridge${open}`, 460, 520, (p) => fxFridge(p, open), [lerp(-1.2, 0.3, k), lerp(1.25, 0.95, k) + 0.25 * Math.sin(Math.PI * k), 0.05], 2.14 * sc, 2.41 * sc);
    if (s > 0.02) fx(c, "dash", 300, 520, fxDashFrame, [-1.0, 1.25, 0.1], 0.9 * s, 1.56 * s);
    puff(c, [0.6, -0.2, 0.2], FRIDGE, 9, 0.9);
    for (let i = 0; i < 10; i++) drop(c, [(i % 5 - 2) * 0.62 + 0.05, i < 5 ? -1.45 : -2.3, 0.05], 0.4 * pop(f, DROPS - 6 + 3 * i, 5));
    if (f >= DOOR + 8) { const u = (f - DOOR - 8) / 34; cloud(c, [0.55 - 0.5 * u, 0.6 + 1.3 * u, 0.3], 0.7 * Math.min(1, u * 4) * Math.max(0, 1 - u * 0.6), 2); }
  } else if (id === 17) {
    // each droplet sinks half an inch a second; the faintest breeze holds it up
    const y = dropletY(f), awake = f >= HELD - 6;
    fx(c, "scale", 160, 700, fxScale, [1.2, 1.0 - (300 / 700) * 4.67 * INCH, -0.05], 1.07 * INCH, 4.67 * INCH);
    for (let i = 0; i < 11; i++) {
      const x = -1.5 + 2.0 * hash(i, 91) + (hash(i, 93) > 0.5 ? 0 : -0.1), yy = -2.3 + 4.8 * hash(i, 92), w = 0.14 + 0.16 * hash(i, 94);
      if (Math.abs(x + 0.25) < 0.85 && Math.abs(yy - 0.5) < 1.5) continue;
      fx(c, "dot0", 300, 300, (p) => fxDroplet(p, 0), [x, yy + (y - 1.0) + 0.03 * Math.sin(f * 0.13 + i), -0.02], w, w);
    }
    const s = pop(f, DROPLET, 9);
    if (s > 0) fx(c, `droplet${awake ? 2 : 1}`, 300, 300, (p) => fxDroplet(p, awake ? 2 : 1), [-0.25, y, 0], 1.3 * s, 1.3 * s);
    if (f >= SINK - 4) fx(c, "ptr", 64, 16, (p) => { p.g.fillStyle = RED; p.g.fillRect(0, 0, 64, 16); }, [0.62, y, 0.02], 0.34 * sm(f, SINK - 4, SINK + 2), 0.05);
    for (let i = 0; i < 3; i++) arrow(c, [-0.8 + 0.55 * i, y - 1.3 + 0.06 * Math.sin(f * 0.3 + i), 0.02], 0.8, Math.PI, BREEZE + 3 * i);
    sparkle(c, [0.35, y + 0.75, 0.2], HELD, 14, 0.5);
  } else if (id === 19) {
    // in his whole fall: one cup of water
    fat(c, [0.3, 3.3 + 0.035 * (f - 1480), -0.4], 9);
    streaks(c, 14, 0.04, 1, 2.0);
    const g = gusFall(c, [-0.25, 0, 0], f >= TIP ? "pained" : f >= CUP ? "wow" : "nervous", 0.5, { blink: lidAt(f, 1, [CUP, TIP]) });
    const s = pop(f, CUP, 6), tip = sm(f, CUP + 5, TIP - 2), level = q(1 - sm(f, TIP - 4, TIP + 5), 8), away = Math.max(0, f - TIP - 9);
    const cupAt: V3 = [0.6 - 0.25 * tip, 1.75 + 0.04 * away * away * 0.2, 0.12];
    if (s > 0) fx(c, `cup${level}`, 320, 300, (p) => fxCup(p, level), cupAt, 0.8 * s, 0.75 * s, { rot: 1.75 * tip });
    const top = add(g.at(g.A.head, 0.1), [0, 0.3, 0]);
    for (let i = 0; i < 3; i++) { const u = (f - (TIP - 5) - 2 * i) / 6; if (u > 0 && u < 1) drop(c, [lerp(cupAt[0] - 0.35, top[0], u), lerp(cupAt[1] - 0.05, top[1], u * u), 0.14], 0.13); }
    splash(c, add(top, [0, 0.1, 0.04]), TIP, 13, 1.0);
  } else if (id === 20) {
    // luckily his parachute opens
    farClouds(c, -7);
    const open = f >= CHUTE, s = pop(f, CHUTE - 1, 6), jerk = open ? 0.45 * Math.exp(-(f - CHUTE) / 4) * Math.cos((f - CHUTE) * 0.8) : 0, sway = open ? 0.12 * Math.sin((f - CHUTE) * 0.16) : 0;
    const at: V3 = [sway, open ? 0.5 * sm(f, CHUTE, CHUTE + 8) - jerk : 0, 0];
    if (!open) streaks(c, 14, 0.04, 1, 2.0);
    if (s > 0) fx(c, "chute", 800, 700, fxChute, [at[0], at[1] + 0.5 + 0.485 * 2.98 * s, -0.1], 3.4 * s, 2.98 * s);
    const hold: Arm = { h: [0.3, -0.62], bend: -0.2 };
    if (open) gus(c, { mode: "air", legs: [[-0.16, 1.46], [0.16, 1.46]], expr: "relief_open", L: hold, R: hold, tilt: 3 * Math.sin((f - CHUTE) * 0.16) }, at, { face: true, roll: 0, wide: true, tall: true, noBlob: true });
    else gusFall(c, at, "nervous", 0.6);
  } else if (id === 22) {
    // a million of those droplets make one raindrop
    const k = sm(f, MERGE, RAINDROP + 1), C: V3 = [0, 0.4, 0];
    if (k < 0.98) for (let i = 0; i < 80; i++) {
      const x = (hash(i, 101) - 0.5) * 3.2, y = -2.4 + 5.2 * hash(i, 102), w = (0.1 + 0.12 * hash(i, 103)) * (1 - 0.7 * k) * Math.min(1, (f - 1698 + 20 * hash(i, 104)) / 14 + 1);
      fx(c, "dot0", 300, 300, (p) => fxDroplet(p, 0), [lerp(x + 0.05 * Math.sin(f * 0.1 + i), C[0], k), lerp(y + 0.05 * Math.cos(f * 0.12 + i * 2), C[1], k), 0], w, w);
    }
    sparkle(c, [0.9, 1.9, 0.2], SWARM, 16, 0.6); sparkle(c, [-1.0, -0.6, 0.2], SWARM + 5, 14, 0.45);
    const s = pop(f, RAINDROP, 9), t = Math.max(0, f - RAINDROP - 15);
    drop(c, [C[0], C[1] - 0.006 * t * t, 0.05], 1.25 * s);
    burst(c, C, RAINDROP, 7, 1.3, "#d8f1ff");
  }
};

// ---------------- inside the cloud ----------------
const inside = (c: Ctx) => {
  const { id, f } = c;
  white(c); wisps(c, 12, 0.02); streaks(c, 16, 0.045);
  if (id === 12) {
    const g = gusFall(c, [-0.2, -0.1, 0], "shock");
    void g;
    const turns = (22 / 60) * clamp01((f - TICKS) / (T22 - 2 - TICKS)), s = pop(f, WATCH, 6), s2 = pop(f, WATCH + 4, 6);
    watch(c, [0.8, 1.1, 0.15], 0.8 * s, turns);
    if (s2 > 0) fx(c, "tag22", 300, 260, (p) => fxTag(p, "22"), [0.8, 1.1 + 0.8 * s2, 0.12], 0.66 * s2, 0.57 * s2);
    sparkle(c, [1.15, 1.6, 0.25], T22, 14, 0.4);
  } else {
    const look = lin([[947, 0], [953, -1], [961, -1], [968, 1], [990, 1]], f);
    gus(c, { ...flail(f, 0.35), expr: "nervous", look: q(look, 10), blink: lidAt(f, 1) }, [0, 0, 0], { face: true, roll: 0.05 * Math.sin(f * 0.2), wide: true, tall: true, noBlob: true });
  }
};

/** called once per frame and canvas; c.shot is the current shot */
export const stage = (c: Ctx) => {
  const place = c.shot.place;
  if (place === "sky") skyStage(c);
  else if (place === "cloud") inside(c);
  else garden(c);
};
