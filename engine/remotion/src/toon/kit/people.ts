// The cast of the cartoon-short kit, drawn with the template's Pen API and construction (toon.ts): bean heads
// (H/W .94), bean torsos, single-stroke limbs with ink-dot hands, thick-thin plum outline weighted away from the
// light, the template's face library. One posable front-view puppet (`figure`) with explicit arm targets, so every
// beat of a story can be posed from its stage(); each character is a `Look` (colours + hair / hat / beard / helmet
// painters): GUS, WIFE, NEIGHBOR, FISHER here; a video adds its own by writing another Look.
// Design space 600 x 1000 units, soles at y = 975 (same card geometry as the template's bodies).
import {
  Pen, INK, SKIN, WHITE, mul, mix, shade, SH_SKIN, SH_CLOTH, P2, rad, clamp, rotAbout, curve, ellPts, rrect, taper, Blob, blobPts,
  headBlob, thickAngle, DEF_LIGHT, Expr, faceFront, lidOf, BUILD, Build, footStroke, hatOn,
} from "./toon";

export type Hand = "dot" | "thumb" | "point";
/** built-in hand props; any other name is looked up in PROPS */
export type PropName = "clipboard" | "thermo" | "pan" | "fork" | "plate" | "timer" | (string & {});
/** hand props a video adds: PROPS.torch = (p, hx, hy, side, u, arg) => { ...draw around the hand at (hx, hy);
 *  u = design units per "pixel" of the reference drawing (stroke widths x u), side = -1 left arm / +1 right arm,
 *  arg = Arm.arg...; return [x, y]; } returns the prop's own anchor (its tip), reported as Anchors.propL / propR */
export const PROPS: Record<string, (p: Pen, hx: number, hy: number, side: number, u: number, arg: number) => P2> = {};
/** h = hand position from the shoulder in head heights (x outward on that arm's side, y down); bend = elbow offset */
export type Arm = { h: [number, number]; bend?: number; front?: boolean; prop?: PropName; arg?: number; hand?: Hand };
export type Pose = {
  mode?: "stand" | "chair" | "sit" | "air";
  expr?: Expr; look?: number; blink?: number; facing?: -1 | 0 | 1;
  tilt?: number; headTilt?: number; squash?: number;
  L?: Arm; R?: Arm;
  /** air mode: foot offsets from the hips in head heights (screen x, y down), left then right */
  legs?: [[number, number], [number, number]];
  /** 0..1 phase: cloth and cheeks flap in the wind */
  flap?: number;
  /** accessory amount 0..1 (Gus: the fishbowl tipped back like a lid for one bite) */
  acc?: number;
  /** 0..1 phase of a chewing mouth */
  chew?: number;
  light?: number;
};
export type G = {
  cx: number; hc: number; H: Blob; W: number; HH: number; u: number; crown: number; chin: number; light: number; thick: number; ow: number;
  hp: P2[]; facing: number; seed: number; torsoBot: number; tcx: number; sole: number; mode: string; acc: number;
};
export type Look = {
  id: string; seed: number; skin?: string; build?: Build;
  top: string; limb: string; leg: string; foot: string; footW?: number; dress?: string;
  deco?: (p: Pen, g: G) => void;       // clipped to the torso (or the dress)
  headBack?: (p: Pen, g: G) => void;   // behind the head
  neck?: (p: Pen, g: G) => void;       // over the torso, under the head
  headFront?: (p: Pen, g: G) => void;  // hair / hat / beard, before the face
  faceOver?: (p: Pen, g: G) => void;   // over the face (helmet glass)
  moustache?: string; brow?: string; brim?: boolean;
};
export type Anchors = { L: P2; R: P2; propL: P2; propR: P2; mouth: P2; head: P2; top: P2 };

const TWO = Math.PI * 2;
/** the bite out of the sandwich: three scallops (x, y, r in u from the plate centre) taking a third of it */
const BITE: [number, number, number][] = [[17, -29, 8.5], [13.5, -19, 9.5], [17.5, -8.5, 8]];
const HANG: Arm = { h: [0.17, 0.92], bend: 0.07 };

// ---------------- props held in a hand ----------------
/** draws the prop around the hand at (hx, hy); returns the prop's own anchor (sausage, sandwich, bulb ...) */
const drawProp = (p: Pen, name: PropName, hx: number, hy: number, side: number, u: number, arg = 0): P2 => {
  const custom = PROPS[name];
  if (custom) return custom(p, hx, hy, side, u, arg);
  switch (name) {
    case "clipboard": {
      const a = rad(5 * side), c: P2 = [hx, hy];
      const R = (x: number, y: number): P2 => rotAbout([hx + x * u, hy + y * u], a, c);
      p.poly([R(-25, -66), R(25, -66), R(25, 6), R(-25, 6)], "#b98a52", 2.4 * u);
      p.poly([R(-20, -60), R(20, -60), R(20, 1), R(-20, 1)], "#fbf7ea", 1.4 * u);
      p.poly([R(-9, -70), R(9, -70), R(9, -61), R(-9, -61)], "#9aa2ab", 1.8 * u);
      // scribbled sums: wobbly rows, a plus, an equals, a circle with a line through it (the plan)
      for (let i = 0; i < 5; i++) {
        const y = -52 + i * 9.5, n = 4 + ((i * 3) % 4), pts: P2[] = [];
        for (let k = 0; k <= n * 3; k++) pts.push(R(-16 + k * (i === 1 ? 1.6 : 2.2), y + 1.8 * Math.sin(k * 2.1 + i * 1.7)));
        p.stroke(pts, 1.3 * u);
      }
      p.stroke([R(8, -44), R(14, -44)], 1.3 * u); p.stroke([R(11, -47), R(11, -41)], 1.3 * u);
      p.stroke([R(6, -25), R(12, -25)], 1.3 * u); p.stroke([R(6, -22), R(12, -22)], 1.3 * u);
      const [ex, ey] = R(10, -8);
      p.ell(ex, ey, 6.5 * u, 6.5 * u, "#cfe6f7", 1.4 * u);
      p.stroke([R(10, -15.5), R(10, -0.5)], 1.6 * u, "#d23b3b");
      return R(0, -30);
    }
    case "thermo": {
      const top = hy - 74 * u, bot = hy + 14 * u, popped = arg > 1.5, lvl = clamp(arg, 0, 1);
      if (popped) {
        p.poly([[hx - 5.5 * u, bot], [hx - 5.5 * u, hy - 40 * u], [hx - 2 * u, hy - 46 * u], [hx, hy - 38 * u], [hx + 3 * u, hy - 47 * u], [hx + 5.5 * u, hy - 41 * u], [hx + 5.5 * u, bot]], "#eef4f8", 2 * u);
        p.poly([[hx - 2.6 * u, bot], [hx - 2.6 * u, hy - 38 * u], [hx + 2.6 * u, hy - 38 * u], [hx + 2.6 * u, bot]], "#e2332d", 0);
      } else {
        p.poly(rrect(hx - 5.5 * u, top, hx + 5.5 * u, bot, 5 * u), "#eef4f8", 2 * u);
        const y = bot + (top + 5 * u - bot) * lvl;
        p.poly([[hx - 2.6 * u, bot], [hx - 2.6 * u, y], [hx + 2.6 * u, y], [hx + 2.6 * u, bot]], "#e2332d", 0);
        for (let i = 1; i < 7; i++) p.stroke([[hx + 5.5 * u, bot + (top - bot) * (i / 7.5)], [hx + 10 * u, bot + (top - bot) * (i / 7.5)]], 1.4 * u);
      }
      p.ell(hx, hy + 22 * u, 9.5 * u, 9.5 * u, "#e2332d", 2 * u);
      p.arc(hx - 2 * u, hy + 20 * u, 5 * u, 5 * u, 180, 250, 1.6 * u, "#ffb3a8");
      return [hx, popped ? hy - 44 * u : top];
    }
    case "pan": {
      // side-on frying pan held out; arg = flick angle in degrees (rim tips up)
      const a = rad(-arg * side), c: P2 = [hx, hy];
      const R = (x: number, y: number): P2 => rotAbout([hx + side * x * u, hy + y * u], a, c);
      p.band([R(-5, 0), R(22, -1)], "#4a3426", 4.2 * u, 1.4 * u, "round");
      const body: P2[] = [R(20, -5), R(64, -5), R(60, 5), R(24, 5)];
      p.poly(body, "#2f3138", 2.2 * u);
      const [ex, ey] = R(42, -5);
      p.ell(ex, ey, 22.5 * u, 4.6 * u, "#484b55", 2 * u, 0, 360, (-arg * side));
      return R(42, -7);
    }
    case "fork": {
      // long grill fork with a sausage on the prongs; arg: 0 raw, 1 catching fire, 2 burnt to a crisp
      const tip: P2 = [hx + side * 13 * u, hy - 78 * u], base: P2 = [hx - side * 2 * u, hy + 9 * u];
      const dx = tip[0] - base[0], dy = tip[1] - base[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
      const at = (t: number, s = 0): P2 => [base[0] + ux * t * L + nx * s * u, base[1] + uy * t * L + ny * s * u];
      p.band([at(0.2), at(0.86)], "#aab2bb", 2.2 * u, 1.2 * u, "round");
      for (const s of [-3.2, 3.2]) p.band([at(0.84, s), at(1.02, s)], "#aab2bb", 1.6 * u, 1.1 * u, "round");
      p.band([at(0.84, -3.2), at(0.84, 3.2)], "#aab2bb", 1.6 * u, 1.1 * u, "round");
      p.band([at(-0.02), at(0.24)], "#7a4b2a", 5 * u, 1.5 * u, "round");
      const c = at(0.95), col = arg >= 2 ? "#1f1b1e" : arg >= 1 ? "#a8452a" : "#cf6a45";
      const sa = rad(-18 * side), sx = Math.cos(sa), sy = Math.sin(sa);
      const e0: P2 = [c[0] - sx * 17 * u, c[1] - sy * 17 * u], e1: P2 = [c[0] + sx * 17 * u, c[1] + sy * 17 * u];
      p.stroke([e0, e1], 13 * u + 4.4 * u, INK); p.stroke([e0, e1], 13 * u, col);
      if (arg < 2) p.stroke([[e0[0] + sx * 5 * u + sy * 3 * u, e0[1] + sy * 5 * u - sx * 3 * u], [e0[0] + sx * 16 * u + sy * 3 * u, e0[1] + sy * 16 * u - sx * 3 * u]], 2.4 * u, arg >= 1 ? "#d98a5a" : "#f0a783");
      else for (const t of [-9, 0, 9]) p.stroke([[c[0] + sx * t * u - sy * 4 * u, c[1] + sy * t * u + sx * 4 * u], [c[0] + sx * (t + 3) * u + sy * 3 * u, c[1] + sy * (t + 3) * u - sx * 3 * u]], 1.5 * u, "#6a6468");
      return c;
    }
    case "plate": {
      // a sandwich on a plate; arg = 1: one bite gone (on the side away from the holder)
      u *= 1.4; // big enough to read in a two-shot
      const cx = hx + side * 4 * u, py = hy - 5 * u, s = side;
      const X = (x: number) => cx + s * x * u;
      const g = p.g;
      const lay = (x0: number, x1: number, y0: number, y1: number, col: string, r = 2.5) =>
        p.poly(rrect(Math.min(X(x0), X(x1)), py + y0 * u, Math.max(X(x0), X(x1)), py + y1 * u, r * u), col, 1.8 * u);
      lay(-17, 17, -12, -5, "#e6c483");
      { const pts: P2[] = []; for (let i = 0; i <= 12; i++) pts.push([X(-19 + (38 * i) / 12), py + (-13.5 + (i % 2 ? 2.2 : 0)) * u]); pts.push([X(19), py - 11 * u], [X(-19), py - 11 * u]); p.poly(pts, "#6fb24a", 1.5 * u); }
      lay(-18, 18, -18, -14, "#f0b6b0", 1.5);
      lay(-17.5, 17.5, -21.5, -17.5, "#f4d35e", 1.5);
      lay(-17, 17, -31, -21, "#d9a95c", 4.5);
      const bite: P2 = [X(17), py - 19 * u];
      if (arg >= 1) { // erase a scalloped bite, then ink its edge
        g.save(); g.globalCompositeOperation = "destination-out";
        for (const [bx, by, br] of BITE) { const [qx, qy] = p.P(X(bx), py + by * u); g.beginPath(); g.arc(qx, qy, br * u, 0, TWO); g.fill(); }
        g.restore();
        for (const [bx, by, br] of BITE) p.arc(X(bx), py + by * u, br * u, br * u, s > 0 ? 100 : -80, s > 0 ? 260 : 80, 2 * u);
      }
      p.ell(cx, py, 31 * u, 6.5 * u, "#fbfaf4", 2.2 * u);
      p.arc(cx, py - 0.5 * u, 22 * u, 3.6 * u, 10, 170, 1.3 * u, "#c9ccd2");
      return bite;
    }
    case "timer": {
      // egg timer: a white egg with a dial ring; arg = dial turn (degrees)
      const cy = hy - 13 * u;
      p.ell(hx, cy, 10.5 * u, 13 * u, "#fbfaf4", 2.2 * u);
      p.clip(ellPts(hx, cy, 10.5 * u, 13 * u), () => p.poly([[hx - 12 * u, cy + 1.5 * u], [hx + 12 * u, cy + 1.5 * u], [hx + 12 * u, cy + 14 * u], [hx - 12 * u, cy + 14 * u]], "#e2453c", 0));
      p.stroke([[hx - 10.5 * u, cy + 1.5 * u], [hx + 10.5 * u, cy + 1.5 * u]], 1.8 * u);
      p.ell(hx, cy, 10.5 * u, 13 * u, null, 2.2 * u);
      for (let i = 0; i < 5; i++) { const a = rad(-150 + i * 30); p.stroke([[hx + 6.5 * u * Math.cos(a), cy + 8 * u * Math.sin(a)], [hx + 8.6 * u * Math.cos(a), cy + 10.6 * u * Math.sin(a)]], 1.2 * u); }
      const a = rad(-90 + arg);
      p.stroke([[hx, cy - 1 * u], [hx + 7 * u * Math.cos(a), cy - 1 * u + 7 * u * Math.sin(a)]], 1.8 * u, "#d23b3b");
      p.dot(hx, cy - 1 * u, 1.6 * u);
      return [hx, cy];
    }
  }
  return [hx, hy];
};

// ---------------- the puppet ----------------
export const figure = (p: Pen, lk: Look, o: Pose): Anchors => {
  const { mode = "stand", expr = "neutral", look = 0, blink = 0, facing = 0, tilt = 0, headTilt = 0, squash = 0, light = DEF_LIGHT } = o;
  const Bd = BUILD[lk.build ?? "adult"], skin = lk.skin ?? SKIN, lid = lidOf(blink), seed = lk.seed;
  const H = headBlob(seed, Bd.a, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100, sole = 975;
  const torsoBot = mode === "sit" ? sole - 0.2 * HH : mode === "chair" ? sole - 0.82 * HH : sole - Bd.legs * HH + squash * 0.32 * HH;
  const chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, legW = 5.8 * u, footW = lk.footW ?? 7.5 * u;
  const fl = o.flap === undefined ? null : o.flap;
  // ---- legs + feet (not rotated) ----
  p.rot = null;
  if (mode === "sit") {
    for (const side of [-1, 1]) {
      const h: P2 = [300 + side * 15 * u, hipY], k: P2 = [300 + side * 36 * u, hipY + 0.2 * HH], f: P2 = [300 + side * 44 * u, sole - 8 * u];
      p.stroke(curve(h, k, f), legW, lk.leg);
      footStroke(p, [f[0] - side * 2 * u, f[1]], [f[0] + side * 12 * u, f[1] - 5 * u], footW, lk.foot);
    }
  } else if (mode === "air") {
    const legs = o.legs ?? [[-0.42, 1.1], [0.5, 0.96]];
    legs.forEach(([lx, ly], i) => {
      const side = i ? 1 : -1, h: P2 = [300 + side * 15 * u, hipY], f: P2 = [300 + lx * HH, hipY + ly * HH];
      const k: P2 = [(h[0] + f[0]) / 2 + side * 0.1 * HH, (h[1] + f[1]) / 2 - 0.02 * HH];
      p.stroke(curve(h, k, f), legW, lk.leg);
      const dx = f[0] - k[0], dy = f[1] - k[1], L = Math.hypot(dx, dy) || 1;
      footStroke(p, [f[0] - (dx / L) * 2 * u, f[1] - (dy / L) * 2 * u], [f[0] + side * 11 * u + (dx / L) * 4 * u, f[1] + (dy / L) * 6 * u], footW, lk.foot);
    });
  } else if (lk.dress) {
    const top = mode === "chair" ? sole - 0.5 * HH : sole - 0.4 * HH;
    for (const side of [-1, 1]) {
      const fx = 300 + side * (mode === "chair" ? 16 : 12) * u, fy = sole - 4 * u;
      p.stroke([[fx, top], [fx + side * u, fy]], legW, lk.leg);
      footStroke(p, [fx - side * 3 * u, fy], [fx + side * 12 * u, fy + u], footW, lk.foot);
    }
  } else if (mode === "chair") {
    for (const side of [-1, 1]) {
      const h: P2 = [300 + side * 14 * u, hipY], k: P2 = [300 + side * 31 * u, hipY + 0.14 * HH], f: P2 = [300 + side * 27 * u, sole - 4 * u];
      p.stroke(curve(h, k, f), legW, lk.leg);
      footStroke(p, [f[0] - side * 3 * u, f[1]], [f[0] + side * 13 * u, f[1] + 0.5 * u], footW, lk.foot);
    }
  } else {
    for (const side of [-1, 1]) {
      const hx = 300 + side * 15 * u, fx = 300 + side * (22 + squash * 9) * u, fy = sole - 4 * u;
      const k: P2 = [(hx + fx) / 2 + side * (1.5 + squash * 17) * u, (hipY + fy) / 2];
      p.stroke(curve([hx, hipY], k, [fx, fy]), legW, lk.leg);
      footStroke(p, [fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u], footW, lk.foot);
    }
  }
  // ---- upper body: rotates about the hips ----
  p.rot = tilt ? [rad(tilt), 300, hipY] : null;
  const T: Blob = { a: ((Bd.tw / 2) * W) / 1.06, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: lk.build === "stout" ? 0.17 : 0.12,
    asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + 3 * u * facing, tcy = torsoBot - T.b;
  let tp = blobPts(tcx, tcy, T);
  if (fl !== null) tp = tp.map(([x, y]): P2 => {
    const k = clamp((y - (tcy - 0.3 * T.b)) / (1.3 * T.b), 0, 1);
    return [x + k * 5.5 * u * Math.sin(y * 0.04 + fl * TWO), y + k * 3.2 * u * Math.sin(x * 0.05 - fl * TWO * 2)];
  });
  const sh = (side: number): P2 => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  type A3 = { pts: [P2, P2, P2]; side: number; a: Arm };
  const arm = (side: number, a: Arm): A3 => {
    const S = sh(side), Hd: P2 = [S[0] + side * a.h[0] * HH, S[1] + a.h[1] * HH];
    const dx = Hd[0] - S[0], dy = Hd[1] - S[1], L = Math.hypot(dx, dy) || 1, b = (a.bend ?? 0.07) * side;
    const E: P2 = [(S[0] + Hd[0]) / 2 + (dy / L) * b * HH, (S[1] + Hd[1]) / 2 - (dx / L) * b * HH];
    return { pts: [S, E, Hd], side, a };
  };
  const arms = [arm(-1, o.L ?? HANG), arm(1, o.R ?? HANG)];
  const anchors: Anchors = { L: [0, 0], R: [0, 0], propL: [0, 0], propR: [0, 0], mouth: [0, 0], head: [0, 0], top: [0, 0] };
  const drawArm = (A: A3) => {
    const [S, E, Hd] = A.pts, [hx, hy] = Hd, key = A.side < 0 ? "L" : "R";
    p.stroke(curve(S, E, Hd), 5.2 * u, lk.limb);
    let pa: P2 = Hd;
    if (A.a.prop) pa = drawProp(p, A.a.prop, hx, hy, A.side, u, A.a.arg ?? 0);
    p.dot(hx, hy, 5.5 * u);
    if (A.a.hand === "thumb") { p.stroke([[hx - A.side * 1 * u, hy - 4 * u], [hx - A.side * 3 * u, hy - 17 * u]], 7 * u); p.dot(hx, hy, 8.5 * u); }
    if (A.a.hand === "point") { const dx = Hd[0] - E[0], dy = Hd[1] - E[1], L = Math.hypot(dx, dy) || 1; p.stroke([Hd, [hx + (dx / L) * 12 * u, hy + (dy / L) * 12 * u]], 3.6 * u); }
    anchors[key] = p.P(hx, hy);
    anchors[key === "L" ? "propL" : "propR"] = p.P(pa[0], pa[1]);
  };
  for (const A of arms) if (!A.a.front) drawArm(A);
  // torso / dress: shaded fill -> clothing clipped to it -> thick-thin ink ring
  const g: G = { cx: 300, hc, H, W, HH, u, crown, chin, light, thick, ow, hp: [], facing, seed, torsoBot, tcx, sole, mode, acc: o.acc ?? 0 };
  if (lk.dress && mode !== "sit") {
    const hem = sole - (mode === "chair" ? 0.45 : 0.35) * HH;
    // one bell from the shoulders to the hem (the template's separate shoulder blob read as a scarf at her neck)
    const D: Blob = { a: 0.5 * W * 0.98, b: 0.5 * (hem - (chin - 0.2 * HH)), nTop: 2.3, nBot: 3.0, egg: 0.27, asym: 0.03 * facing, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(300, hem - D.b, D);
    p.gradFill(dp, lk.dress, mul(lk.dress, SH_CLOTH), light);
    if (lk.deco) p.clip(dp, () => lk.deco!(p, g));
    p.inkRing(dp, ow, thick);
  } else {
    p.gradFill(tp, lk.top, mul(lk.top, SH_CLOTH), light);
    if (lk.deco) p.clip(tp, () => lk.deco!(p, g));
    p.inkRing(tp, ow, thick);
  }
  lk.neck?.(p, g);
  for (const A of arms) if (A.a.front) drawArm(A);
  // ---- head: rotates with the body, plus its own tilt about the chin ----
  const Ah = tilt + headTilt, [cpx, cpy] = rotAbout([300, chin], rad(tilt), [300, hipY]);
  p.rot = Ah ? [rad(Ah), 300, chin, cpx - 300, cpy - chin] : null;
  lk.headBack?.(p, g);
  let hp = blobPts(300, hc, H);
  if (fl !== null) hp = hp.map(([x, y]): P2 => { // cheeks flap: the lower sides of the head wobble
    const k = clamp((y - hc) / H.b + 0.15, 0, 1) * clamp(Math.abs(x - 300) / H.a, 0, 1);
    return [x + Math.sign(x - 300) * k * 9 * u * (0.55 + 0.45 * Math.sin(fl * TWO * 2 + (x > 300 ? 1.7 : 0))), y + k * 3 * u * Math.sin(fl * TWO * 3 + x * 0.02)];
  });
  g.hp = hp;
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  lk.headFront?.(p, g);
  faceFront(p, 300, hc, W, expr, facing, look, lid, !!lk.brim, skin, lk.moustache, lk.build === "stout", fl ?? o.chew ?? 0, lk.brow ?? INK);
  lk.faceOver?.(p, g);
  anchors.mouth = p.P(300 + 8 * u * facing, hc + 20 * u);
  anchors.head = p.P(300, hc);
  anchors.top = p.P(300, crown - 0.3 * HH);
  p.rot = null;
  return anchors;
};

/** a Pen whose canvas swallows every call: figure() on it only returns the anchors (hands, props, mouth) */
const NULL_G: CanvasRenderingContext2D = (() => {
  const fn = () => proxy;
  const proxy: unknown = new Proxy(fn, { get: () => fn, set: () => true, apply: () => proxy });
  return proxy as CanvasRenderingContext2D;
})();
export const anchorsOf = (lk: Look, o: Pose) => figure(new Pen(NULL_G), lk, o);

// ---------------- the cast ----------------
/** Gus's glass bowl with its steel rim. acc 0 = on (rim at the collar); acc 1 = pushed up and tipped back like a
 *  lid: the rim rests across his forehead (one end in each hand), the dome stands behind and above his head, so his
 *  whole face is clear for a bite. All offsets in head half widths `a` from the head centre. */
export const BOWL_R = 1.3; // glass radius / head half width
export const bowlAt = (hc: number, a: number, b: number, acc: number) => {
  const R = BOWL_R * a, k = acc * acc * (3 - 2 * acc), rot = 12 * k;
  const cx = 300 + 0.28 * a * k, cy = hc - 0.05 * b - 1.89 * a * k, d = rad(90 + rot); // lifted: the rim lies along his hairline, clear of the brows
  // the mouth of the bowl: centre and half width of its rim (the chord 31 degrees either side of the opening axis)
  return { R, cx, cy, rot, mx: cx + 0.857 * R * Math.cos(d), my: cy + 0.857 * R * Math.sin(d), half: R * Math.sin(rad(31)) };
};
const glass = (p: Pen, g: G) => {
  const { u, hc, H, acc } = g, { R, cx, cy, rot } = bowlAt(hc, H.a, H.b, acc);
  p.arc(cx, cy, R, R, 121 + rot, 419 + rot, 3.4 * u);
  p.arc(cx, cy, R - 9 * u, R - 9 * u, 203 + rot, 248 + rot, 5 * u, "#ffffff");
  p.arc(cx, cy, R - 9 * u, R - 9 * u, 256 + rot, 263 + rot, 5 * u, "#ffffff");
};
const rim = (p: Pen, g: G) => {
  const { u, hc, H, acc } = g, B = bowlAt(hc, H.a, H.b, acc);
  p.ell(B.mx, B.my, B.half * 1.08, 6.2 * u, "#d5dbe2", 2.6 * u, 0, 360, B.rot);
  p.arc(B.mx, B.my - 1.5 * u, B.half * 0.84, 3.2 * u, 200, 340, 1.5 * u, "#ffffff");
};
const PJ = "#9cc7ee", PJ_STRIPE = "#3f73c4";
/** Gus: blue striped pyjamas, red slippers, a round glass fishbowl helmet (clear: only its rim, a collar and one highlight) */
export const GUS: Look = {
  id: "gus", seed: 3, top: PJ, limb: "#2c4f8c", leg: "#2c4f8c", foot: "#e23b32", footW: 9.5 * 2.36,
  deco: (p, g) => {
    const { u, HH, chin, tcx, torsoBot } = g;
    for (let i = -4; i <= 4; i++) p.stroke([[tcx + i * 13.5 * u, chin - 0.3 * HH], [tcx + i * 14.5 * u, torsoBot + 4 * u]], 5.2 * u, PJ_STRIPE);
    p.poly([[tcx - 13 * u, chin - 0.1 * HH], [tcx, chin + 0.2 * HH], [tcx + 13 * u, chin - 0.1 * HH], [tcx + 20 * u, chin + 0.02 * HH], [tcx, chin + 0.34 * HH], [tcx - 20 * u, chin + 0.02 * HH]], "#f4f8fc", 1.8 * u);
    for (let i = 0; i < 3; i++) { const y = chin + 0.46 * HH + i * 0.2 * HH; p.dot(tcx, y, 3.2 * u, INK); p.dot(tcx, y, 2.3 * u, "#f4f8fc"); }
  },
  neck: (p, g) => { if (g.acc <= 0.02) rim(p, g); },      // helmet rim at the collar
  headFront: (p, g) => { // a small tuft
    const { u, crown } = g;
    for (const [dx, bend] of [[-7, -7], [0, 3], [7, 9]] as const)
      p.stroke(curve([300 + dx * u, crown + 6 * u], [300 + (dx + bend * 0.6) * u, crown - 5 * u], [300 + (dx + bend) * u, crown - 11 * u]), 2.4 * u, "#5a3b2a");
  },
  headBack: (p, g) => { if (g.acc > 0.02) glass(p, g); },                       // lifted: the dome stands behind the head
  faceOver: (p, g) => { if (g.acc <= 0.02) glass(p, g); else rim(p, g); },      // on: glass over the face; lifted: the rim across his forehead
};

/** Gus's wife: green dress, white apron, hair bun; deadpan */
const HAIR_W = "#7a4a2a";
export const WIFE: Look = {
  id: "wife", seed: 6, top: "#4f9a52", limb: "#2f5f3a", leg: "#3a3040", foot: "#7a3b3b", dress: "#4f9a52", skin: "#ffe2c2",
  deco: (p, g) => {
    const { u, HH, chin, W, sole, mode } = g, hem = sole - (mode === "chair" ? 0.45 : 0.35) * HH;
    p.poly(rrect(300 - 0.25 * W, chin + 0.62 * HH, 300 + 0.25 * W, hem - 0.1 * HH, 7 * u), "#f7f3ea", 1.8 * u);
    p.poly(rrect(300 - 0.15 * W, chin + 0.2 * HH, 300 + 0.15 * W, chin + 0.66 * HH, 4 * u), "#f7f3ea", 1.8 * u);
    p.band([[300 - 0.6 * W, chin + 0.64 * HH], [300 + 0.6 * W, chin + 0.64 * HH]], "#f7f3ea", 4.5 * u, 1.4 * u);
    p.poly(rrect(300 - 0.09 * W, chin + 0.86 * HH, 300 + 0.09 * W, chin + 1.02 * HH, 3 * u), "#ebe5d6", 1.4 * u);
  },
  headBack: (p, g) => { const { u, crown, light } = g; const b = ellPts(300 + 4 * u, crown - 9 * u, 21 * u, 19 * u); p.shadedFill(b, HAIR_W, shade(HAIR_W, 0.66), light, 21 * u, 0.35); p.poly(b, null, 4.2 * u); },
  headFront: (p, g) => hatOn(p, { jacket: "", pants: "", boots: "", hat: "hair", hair: HAIR_W }, g.hp, g.H, 300, g.hc, g.light, g.seed, g.facing, false),
};

/** the neighbor: bald, big moustache, loud Hawaiian shirt */
const HAWAII = "#e8452f";
export const NEIGHBOR: Look = {
  id: "neigh", seed: 9, build: "stout", skin: "#f5c9a0", top: HAWAII, limb: "#a03323", leg: "#3d4440", foot: "#5a3b2a", moustache: "#5b3a22",
  deco: (p, g) => {
    const { u, HH, chin, tcx, torsoBot } = g, h = torsoBot - chin;
    const flower = (x: number, y: number, r: number, col: string) => {
      for (let k = 0; k < 5; k++) { const a = rad(k * 72 - 90); p.ell(x + r * 0.62 * Math.cos(a), y + r * 0.62 * Math.sin(a), r * 0.5, r * 0.5, col, 0); }
      p.dot(x, y, r * 0.3, "#e8452f");
    };
    const spots: [number, number, number, number][] = [[-30, 0.2, 9, 0], [22, 0.12, 8, 1], [-6, 0.42, 9.5, 1], [32, 0.5, 9, 0], [-33, 0.66, 8.5, 1], [10, 0.78, 9.5, 0], [38, 0.86, 8, 1], [-14, 0.95, 8, 0]];
    for (const [x, t, r, c] of spots) {
      const X = tcx + x * u, Y = chin + t * h;
      p.stroke(curve([X - 12 * u, Y + 9 * u], [X - 3 * u, Y + 10 * u], [X + 4 * u, Y + 3 * u]), 3 * u, "#2f8a4f");
      flower(X, Y, r * u, c ? "#ffd84a" : "#fff5e0");
    }
    // open collar
    p.poly([[tcx - 12 * u, chin - 0.12 * HH], [tcx, chin + 0.2 * HH], [tcx + 12 * u, chin - 0.12 * HH]], "#f5c9a0", 1.8 * u);
    p.stroke([[tcx, chin + 0.2 * HH], [tcx + u, torsoBot]], 1.6 * u);
  },
  headFront: (p, g) => p.arc(300 - 0.2 * g.W, g.hc - 0.52 * g.HH * 0.5, 0.2 * g.W, 0.12 * g.HH, 215, 262, 3 * g.u, "#fff3e2"),
};

/** the fisherman: yellow raincoat and sou'wester, grey beard */
const OILSKIN = "#f2c22e", BEARD = "#cfd3d9";
export const FISHER: Look = {
  id: "fisher", seed: 12, skin: "#f3cba6", top: OILSKIN, limb: "#b48a16", leg: "#3a3d47", foot: "#3a3d47", moustache: "#b9bec6", brow: "#8d939c", brim: true,
  deco: (p, g) => {
    const { u, HH, chin, tcx, torsoBot } = g;
    p.stroke([[tcx + 2 * u, chin], [tcx + 3 * u, torsoBot + 4 * u]], 1.8 * u);
    for (let i = 0; i < 3; i++) { const y = chin + 0.4 * HH + i * 0.22 * HH; p.band([[tcx - 5 * u, y], [tcx + 9 * u, y]], "#7a4b2a", 3 * u, 1.2 * u, "round"); }
  },
  headBack: (p, g) => { // the long back brim of the sou'wester shows on both sides of the head
    const { u, hc, W, HH, light } = g, b = ellPts(300, hc + 0.02 * HH, 0.69 * W, 0.4 * HH);
    p.gradFill(b, shade(OILSKIN, 0.8), shade(OILSKIN, 0.55), light); p.poly(b, null, 4.2 * u);
  },
  headFront: (p, g) => {
    const { u, hc, H, W, HH, crown, light } = g;
    // beard: the lower half of the head, a little wider and longer, scalloped
    const bp: P2[] = [];
    for (let i = 0; i <= 28; i++) {
      const a = rad(8 + (164 * i) / 28), k = 1.1 + 0.035 * Math.cos(i * Math.PI);
      bp.push([300 + H.a * 1.05 * k * Math.cos(a), hc + 0.1 * HH + H.b * 1.16 * k * Math.sin(a)]);
    }
    const top = curve([300 - H.a * 1.06, hc + 0.12 * HH], [300, hc + 0.2 * HH], [300 + H.a * 1.06, hc + 0.12 * HH], 8).reverse();
    const beard = [...bp, ...top];
    p.shadedFill(beard, BEARD, shade(BEARD, 0.78), light, H.a, 0.35); p.poly(beard, null, 3.6 * u);
    // hat: dome + front brim
    const dome = ellPts(300, crown + 0.36 * HH, 0.53 * W, 0.47 * HH, 180, 360);
    p.shadedFill(dome, OILSKIN, shade(OILSKIN, 0.7), light, 0.53 * W, 0.35); p.poly(dome, null, 4.4 * u);
    const brim = ellPts(300, crown + 0.36 * HH, 0.66 * W, 0.085 * HH);
    p.gradFill(brim, shade(OILSKIN, 0.92), shade(OILSKIN, 0.68), light); p.poly(brim, null, 4.2 * u);
  },
};

// ---------------- small 2D cards ----------------
/** tiny Gus for the Earth cutaway on a 300 x 400 canvas: a big fishbowl head, striped bean, red slippers, thick ink.
 *  arms: 0 = down, 1 = up (falling) */
export const miniGus = (p: Pen, arms = 1, expr: "o" | "smile" | "flat" = "o") => {
  const ol = 15;
  for (const s of [-1, 1]) { p.stroke([[150 + s * 22, 280], [150 + s * 36, 348]], 15); p.stroke([[150 + s * 30, 352], [150 + s * 62, 356]], 34, INK); p.stroke([[150 + s * 30, 352], [150 + s * 62, 356]], 22, "#e23b32"); }
  for (const s of [-1, 1]) p.stroke(arms ? [[150 + s * 48, 222], [150 + s * 88, 176], [150 + s * 104, 128]] : [[150 + s * 48, 222], [150 + s * 82, 262], [150 + s * 88, 300]], 15);
  const body = ellPts(150, 250, 56, 62);
  p.poly(body, PJ, 0);
  p.clip(body, () => { for (let i = -2; i <= 2; i++) p.stroke([[150 + i * 26, 180], [150 + i * 28, 320]], 11, PJ_STRIPE); });
  p.poly(body, null, ol);
  p.ell(150, 128, 68, 64, SKIN, ol);
  for (const s of [-1, 1]) p.ell(150 + s * 24, 124, 8, 11, INK, 0);
  if (expr === "o") p.ell(150, 158, 10, 12, "#5a1e28", 6); else if (expr === "smile") p.arc(150, 148, 20, 12, 20, 160, 8); else p.stroke([[136, 158], [164, 156]], 8);
  p.arc(150, 124, 100, 100, 118, 422, 12);
  p.arc(150, 124, 80, 80, 205, 250, 13, "#ffffff");
  p.ell(150, 212, 62, 13, "#d5dbe2", 9);
};

/** white feather on a 220 x 420 canvas (quill down) */
export const fxFeather = (p: Pen) => {
  const pts: P2[] = [];
  for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push([110 + 62 * Math.sin(Math.PI * t) ** 0.8 * (1 - 0.25 * t), 330 - 290 * t]); }
  for (let i = 20; i >= 0; i--) { const t = i / 20; pts.push([110 - 54 * Math.sin(Math.PI * t) ** 0.7 * (1 - 0.2 * t), 330 - 290 * t]); }
  p.poly(pts, "#fbfbf7", 10);
  p.clip(pts, () => { for (let i = 1; i < 9; i++) { const y = 330 - i * 31; p.stroke([[110, y], [178, y - 34]], 4, "#c9d3e0"); p.stroke([[110, y], [46, y - 30]], 4, "#c9d3e0"); } });
  p.stroke([[112, 398], [110, 330], [108, 50]], 7);
};

/** rifle bullet on a 200 x 420 canvas, flying nose DOWN: pointed copper nose leading, brass case with its
 *  shoulder and rim at the back, three short speed lines trailing above it */
export const fxBullet = (p: Pen) => {
  const nose: P2[] = [[62, 236]];
  for (let i = 0; i <= 14; i++) { const t = i / 14; nose.push([100 - 38 * (1 - t) ** 0.55, 236 + 168 * t]); }
  for (let i = 14; i >= 0; i--) { const t = i / 14; nose.push([100 + 38 * (1 - t) ** 0.55, 236 + 168 * t]); }
  p.poly(nose, "#c4703a", 10);
  p.clip(nose, () => p.poly([[70, 230], [84, 230], [96, 400], [90, 400]], "#e9a878", 0));
  p.poly(nose, null, 10);
  const cas: P2[] = [[48, 92], [152, 92], [152, 196], [138, 222], [138, 240], [62, 240], [62, 222], [48, 196]];
  p.poly(cas, "#d9a53c", 10);
  p.clip(cas, () => { p.poly([[58, 92], [76, 92], [76, 240], [62, 240]], "#f6da8c", 0); p.poly([[126, 92], [152, 92], [152, 240], [132, 240]], "#b48226", 0); });
  p.poly(cas, null, 10);
  p.poly(rrect(40, 70, 160, 96, 8), "#c9952f", 10);
  p.stroke([[48, 104], [152, 104]], 5);
  for (const [x, y0, y1] of [[60, 50, 22], [100, 46, 6], [140, 50, 22]] as const) p.stroke([[x, y0], [x, y1]], 9);
};

/** flame on a 300 x 420 canvas (base at the bottom centre); t = phase 0..1, k = size 0..1 */
export const fxFlame = (p: Pen, t: number, k = 1) => {
  const tongue = (s: number, col: string, ol: number, ph: number) => {
    const pts: P2[] = [], H = 330 * s * k, Wd = 96 * s * (0.75 + 0.25 * k);
    for (let i = 0; i <= 16; i++) { const v = i / 16; pts.push([150 + Wd * Math.sin(Math.PI * v ** 0.7) * (1 - 0.82 * v) + 16 * s * Math.sin(v * 5 + t * TWO + ph) * v, 400 - H * v]); }
    for (let i = 16; i >= 0; i--) { const v = i / 16; pts.push([150 - Wd * Math.sin(Math.PI * v ** 0.7) * (1 - 0.82 * v) + 16 * s * Math.sin(v * 5 + t * TWO + ph) * v, 400 - H * v]); }
    p.poly(pts, col, ol);
  };
  tongue(1, "#ff8a1e", 11, 0);
  tongue(0.66, "#ffd23e", 0, 1.3);
  tongue(0.36, "#fff6c8", 0, 2.1);
};

/** a puff of dark smoke on a 300 x 300 canvas; t = 0..1 */
export const fxSoot = (p: Pen, t: number) => {
  for (const [x, y, r] of [[120, 190, 52], [182, 170, 46], [150, 120, 44], [100, 130, 34]] as const)
    p.ell(x + 12 * Math.sin(t * 6 + x), y - 30 * t, r * (1 - 0.3 * t), r * 0.9 * (1 - 0.3 * t), "#5d5a66", 8);
};

/** big question mark on a 300 x 420 canvas (drawn, not type) */
export const fxQuestion = (p: Pen) => {
  const hook: P2[] = [];
  for (let i = 0; i <= 26; i++) { const a = rad(-205 + (265 * i) / 26); hook.push([150 + 78 * Math.cos(a), 140 + 78 * Math.sin(a)]); }
  hook.push([152, 236], [150, 286]);
  p.stroke(hook, 66, INK); p.stroke(hook, 42, "#ffd84a");
  p.dot(150, 368, 40, INK); p.dot(150, 368, 28, "#ffd84a");
};

/** chunky arrow pointing DOWN the canvas (300 x 520): the pull of gravity */
export const fxArrow = (p: Pen, col = "#7fe3ff") => {
  const pts: P2[] = [[108, 30], [192, 30], [192, 300], [262, 300], [150, 492], [38, 300], [108, 300]];
  p.poly(pts, col, 20);
  p.clip(pts, () => p.poly([[118, 30], [142, 30], [142, 330], [118, 330]], "#d9f7ff", 0));
  p.poly(pts, null, 20);
};

/** little striped pennant on a pole, 300 x 400 canvas (pole foot at the bottom centre); w = wave phase */
export const fxFlag = (p: Pen, w = 0) => {
  p.stroke([[150, 392], [150, 30]], 20, INK); p.stroke([[150, 388], [150, 34]], 9, "#f4e9cf");
  const pts: P2[] = [[152, 40]];
  for (let i = 1; i <= 8; i++) pts.push([152 + i * 15, 40 + i * 9 + 7 * Math.sin(i * 0.9 + w * TWO)]);
  for (let i = 8; i >= 0; i--) pts.push([152 + i * 15, 190 - i * 9 + 7 * Math.sin(i * 0.9 + w * TWO)]);
  p.poly(pts, PJ, 0);
  p.clip(pts, () => { for (let i = 0; i < 5; i++) p.stroke([[150, 58 + i * 30], [300, 58 + i * 30]], 13, PJ_STRIPE); });
  p.poly(pts, null, 12);
  p.dot(150, 28, 17, INK); p.dot(150, 28, 9, "#ffd84a");
};

/** pancake on a 300 x 300 canvas: sq = 1 face-on disc .. 0.2 edge-on (flipping in the air) */
export const fxPancake = (p: Pen, sq = 1) => {
  const ry = 100 * Math.max(0.16, Math.abs(sq));
  p.ell(150, 150 + (sq < 0 ? 0 : 6 * (1 - sq)), 112, ry, "#c98a3a", 10);
  p.ell(150, 146, 96, ry * 0.82, "#f0c46a", 0);
  if (Math.abs(sq) > 0.5) for (const [x, y, r] of [[120, 130, 16], [176, 162, 12], [160, 112, 9]] as const) p.ell(x, 150 + (y - 150) * Math.abs(sq), r, r * Math.abs(sq), "#dfa651", 0);
};
/** the pancake flat on the lawn, seen from above, on a 400 x 400 canvas: splat blob + splash ticks growing with t */
export const fxSplat = (p: Pen, t: number) => {
  const pts: P2[] = [];
  for (let i = 0; i < 40; i++) { const a = (i / 40) * TWO, r = 120 * (1 + 0.1 * Math.sin(3 * a + 1) + 0.07 * Math.sin(7 * a)); pts.push([200 + r * Math.cos(a), 200 + r * Math.sin(a)]); }
  p.poly(pts, "#c98a3a", 12);
  p.ell(196, 194, 96, 92, "#f0c46a", 0);
  for (const [x, y, r] of [[160, 170, 18], [226, 214, 14], [212, 150, 10]] as const) p.ell(x, y, r, r, "#dfa651", 0);
  if (t < 1) for (let i = 0; i < 9; i++) { const a = rad(i * 40 + 10), r0 = 140 + 40 * t, r1 = r0 + 34 * (1 - t); p.stroke([[200 + r0 * Math.cos(a), 200 + r0 * Math.sin(a)], [200 + r1 * Math.cos(a), 200 + r1 * Math.sin(a)]], 10 * (1 - t) + 3); }
};

/** white speed streak on a 48 x 512 canvas (soft card) */
export const fxStreak = (p: Pen, col = "255,255,255") => {
  const g = p.g, gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(0.35, `rgba(${col},0.85)`); gr.addColorStop(0.75, `rgba(${col},0.85)`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.beginPath(); g.moveTo(24, 0); g.quadraticCurveTo(40, 256, 24, 512); g.quadraticCurveTo(8, 256, 24, 0); g.fill();
};

/** four-point sparkle on a 200 x 200 canvas */
export const fxSparkle = (p: Pen, col = "#fff6c8") => {
  const pts: P2[] = [];
  for (let k = 0; k < 8; k++) { const r = k % 2 ? 22 : 88, a = rad(k * 45 - 90); pts.push([100 + r * Math.cos(a), 100 + r * Math.sin(a)]); }
  p.poly(pts, col, 9);
};

/** small bird gliding on a 240 x 140 canvas; flap -1..1 */
export const fxBird = (p: Pen, flap: number) => {
  const y = 70 - 34 * flap;
  p.stroke(curve([20, y], [70, 52 - 10 * flap], [120, 78]), 13, "#2b2f45");
  p.stroke(curve([120, 78], [170, 52 - 10 * flap], [220, y]), 13, "#2b2f45");
  p.ell(120, 82, 13, 10, "#2b2f45", 0);
};

/** speed trail for tiny Gus (200 x 400 canvas, streaks rising from the bottom) */
export const fxTrail = (p: Pen, k = 1) => {
  for (const [x, l, w] of [[60, 0.75, 16], [100, 1, 22], [140, 0.6, 16]] as const)
    p.poly([[x - w / 2, 396], [x + w / 2, 396], [x, 396 - 380 * l * k]], "#ffffff", 0);
};

/** glass shards + red drops flying from the popped thermometer, 400 x 400; t = 0..1 */
export const fxShards = (p: Pen, t: number) => {
  for (let i = 0; i < 9; i++) {
    const a = rad(i * 40 + 12), d = 50 + 150 * (1 - (1 - t) ** 2), x = 200 + d * Math.cos(a), y = 200 + d * Math.sin(a) + 60 * t * t, s = 16 * (1 - 0.5 * t);
    if (i % 3 === 0) p.ell(x, y, s * 0.8, s, "#e2332d", 6);
    else p.poly([[x - s, y - s * 0.4], [x + s * 0.8, y - s], [x + s * 0.3, y + s]], "#eef4f8", 6);
  }
};

/** sleep bubble at the fisherman's nose (200 x 200); k = size 0..1 */
export const fxBubble = (p: Pen, k: number) => {
  const r = 22 + 62 * k;
  p.ell(100, 100, r, r, "#bfe3ff", 7);
  p.arc(100, 100, r * 0.62, r * 0.62, 200, 255, 7, "#ffffff");
};

/** crumbs flying from the bite (300 x 300); t = 0..1 */
export const fxCrumbs = (p: Pen, t: number) => {
  for (let i = 0; i < 7; i++) {
    const a = rad(200 + i * 22), d = 30 + 110 * t, x = 150 + d * Math.cos(a), y = 170 + d * Math.sin(a) + 90 * t * t;
    p.ell(x, y, 9 * (1 - 0.4 * t), 8 * (1 - 0.4 * t), i % 2 ? "#e6c483" : "#d9a95c", 5);
  }
};

/** "pop!" over a hole or a pipe mouth on a 500 x 300 canvas: short dashes flying up and out, no solid centre; t = 0..1 */
export const fxPop = (p: Pen, t: number) => {
  const e = 1 - (1 - t) ** 2.5;
  for (let i = 0; i < 9; i++) {
    const a = rad(-170 + i * 20), r0 = 70 + 110 * e, r1 = r0 + 60 * (1 - t) + 10;
    p.stroke([[250 + r0 * Math.cos(a), 270 + r0 * 0.9 * Math.sin(a)], [250 + r1 * Math.cos(a), 270 + r1 * 0.9 * Math.sin(a)]], 12 * (1 - t) + 4);
  }
};

/** moustache-free helper for cast.ts: darker limb colour from a cloth colour, like the template's arms */
export const limbOf = (cloth: string, k = 0.5) => mix(cloth, INK, k);
export { taper, WHITE };
