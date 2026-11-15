// This video's own drawings: 2D cards drawn with the kit's Pen on a canvas of the stated size and placed with fx().
// Glass is pale blue with white shines and the kit's ink outline. No letters anywhere; the only number is the 10 on
// the big weight (drawn by plane-door-midflight's fxWeight).
import { Pen, INK, P2, toon, hash, miniGus } from "../../toon/kit";

const { rad, ellPts, rrect, curve } = toon;
export const GLASS = "#cdeeff", GLASS_D = "#93d2f1", GLASS_L = "#eefaff", RED = "#e8452f", BLUE = "#2f8cf0";
const PJ = "#9cc7ee", PJ_STRIPE = "#3f73c4";

// ---------------- the glass slipper ----------------
const SHOE: P2[] = [[95, 150], [200, 165], [300, 225], [400, 295], [480, 335], [620, 372], [760, 410], [850, 455], [866, 505], [800, 540], [640, 522], [480, 472], [330, 412], [215, 348], [120, 335], [78, 300], [80, 200]];
/** the glass slipper from the side on a 900 x 630 canvas, toe to the right, heel post on the left standing on
 *  y = 600. heel: 0 whole, 1 cracked, 2 broken off (a jagged stub) */
export const fxSlipper = (p: Pen, heel = 0, ol = 13) => {
  const post: P2[] = heel === 2 ? [[100, 325], [215, 345], [204, 392], [176, 372], [152, 402], [128, 378], [106, 394]] : [[100, 325], [215, 345], [182, 600], [118, 600]];
  p.poly(post, GLASS_D, ol);
  if (heel !== 2) { p.clip(post, () => p.stroke([[128, 350], [134, 590]], 16, GLASS_L)); p.poly(post, null, ol); }
  if (heel === 1) p.stroke([[104, 452], [138, 470], [150, 446], [176, 474], [196, 458]], 9);
  p.poly(SHOE, GLASS, ol);
  p.clip(SHOE, () => {
    p.stroke([[80, 330], [215, 372], [330, 436], [480, 496], [640, 546], [860, 560]], 44, GLASS_D);
    p.stroke([[110, 190], [116, 290]], 16, GLASS_L);
    p.stroke([[560, 388], [700, 426], [800, 462]], 15, "#ffffff");
    p.stroke([[330, 268], [420, 330]], 12, "#ffffff");
  });
  p.poly(SHOE, null, ol);
};
/** the slipper small, for a foot: 300 x 210 canvas; dir 1 = toe to screen right, -1 = to the left */
export const fxSlip = (p: Pen, dir: number, heel = 0) => {
  const g = p.g; g.save();
  if (dir < 0) { g.translate(300, 0); g.scale(-1 / 3, 1 / 3); } else g.scale(1 / 3, 1 / 3);
  fxSlipper(p, heel, 30); g.restore();
};
/** the broken-off heel on a 160 x 320 canvas */
export const fxHeelBit = (p: Pen) => {
  const post: P2[] = [[30, 40], [58, 62], [80, 34], [104, 60], [130, 44], [112, 290], [52, 290]];
  p.poly(post, GLASS_D, 11); p.clip(post, () => p.stroke([[64, 70], [68, 280]], 13, GLASS_L)); p.poly(post, null, 11);
};
/** shards on a 300 x 200 canvas; col = their colour */
export const fxShards = (p: Pen, seed: number, col = GLASS, n = 7) => {
  for (let i = 0; i < n; i++) {
    const x = 40 + 220 * hash(i, seed), y = 40 + 120 * hash(i, seed + 1), r = 16 + 20 * hash(i, seed + 2), a = hash(i, seed + 3) * 6.28;
    p.poly([0, 2.2, 4.1].map((d, k) => [x + r * (k === 1 ? 0.7 : 1) * Math.cos(a + d), y + r * Math.sin(a + d)] as P2), col, 7);
  }
};
/** the big diagram foot on a 900 x 900 canvas: striped pyjama leg, sock, glass slipper (its heel stands on y = 870) */
export const fxFoot = (p: Pen) => {
  const leg: P2[] = [[120, -20], [330, -20], [345, 400], [135, 420]];
  p.poly(leg, PJ, 13);
  p.clip(leg, () => { for (let i = 0; i < 4; i++) p.stroke([[150 + i * 52, -20], [160 + i * 52, 420]], 20, PJ_STRIPE); });
  p.poly(leg, null, 13);
  p.poly([[128, 400], [352, 382], [470, 560], [400, 640], [120, 600]], "#f4f8fc", 13);
  const g = p.g; g.save(); g.translate(0, 270); fxSlipper(p, 0); g.restore();
};

// ---------------- elephants ----------------
/** an elephant from the side on a 520 x 420 canvas, facing right, feet on y = 400 */
export const fxElephant = (p: Pen, col = "#9aa5b5") => {
  const dark = toon.mix(col, "#56607a", 0.3), ol = 11;
  p.stroke([[86, 160], [58, 236]], 22, INK); p.stroke([[86, 160], [58, 236]], 10, col);
  for (const x of [186, 296]) p.poly(rrect(x, 250, x + 62, 400, 16), dark, ol);
  p.ell(236, 196, 166, 112, col, ol);
  for (const x of [112, 362]) p.poly(rrect(x, 250, x + 64, 400, 16), col, ol);
  for (const x of [112, 362]) for (const dx of [12, 32, 52]) p.arc(x + dx, 396, 8, 8, 180, 360, 5, "#f3efe2");
  p.ell(404, 168, 84, 82, col, ol);
  const trunk = curve([468, 196], [512, 262], [470, 336], 12);
  p.stroke(trunk, 52, INK); p.stroke(trunk, 32, col);
  p.stroke([[440, 226], [474, 262]], 20, INK); p.stroke([[440, 226], [474, 262]], 10, "#fffdf2");
  p.ell(366, 162, 50, 66, toon.mix(col, "#ffffff", 0.25), ol);
  p.dot(432, 146, 9, INK); p.dot(435, 143, 3, "#ffffff");
  p.arc(430, 122, 16, 8, 200, 330, 6);
};

// ---------------- cubes, shelf, rubble ----------------
const CUBE_COL: Record<string, [string, string, string]> = { glass: [GLASS, GLASS_L, GLASS_D], sugar: ["#ffffff", "#fdfdf8", "#dfe3ea"], concrete: ["#aaa9a3", "#c6c5be", "#85847e"] };
/** a cube on a 300 x 300 canvas (it stands on y = 280) */
export const fxCube = (p: Pen, kind: "glass" | "sugar" | "concrete") => {
  const [front, top, side] = CUBE_COL[kind], ol = 12;
  p.poly([[230, 90], [280, 40], [280, 230], [230, 280]], side, ol);
  p.poly([[40, 90], [90, 40], [280, 40], [230, 90]], top, ol);
  const f: P2[] = [[40, 90], [230, 90], [230, 280], [40, 280]];
  p.poly(f, front, ol);
  if (kind === "glass") p.clip(f, () => { p.stroke([[70, 120], [70, 250]], 14, "#ffffff"); p.stroke([[100, 120], [100, 170]], 9, "#ffffff"); });
  else p.clip(f, () => { for (let i = 0; i < 26; i++) p.dot(52 + 166 * hash(i, 7), 102 + 166 * hash(i, 8), kind === "sugar" ? 3.5 : 5, kind === "sugar" ? "#d5dae3" : hash(i, 9) > 0.5 ? "#8b8a84" : "#c4c3bc"); });
  p.poly(f, null, ol);
};
/** a heap of concrete rubble on a 360 x 200 canvas (it lies on y = 190) */
export const fxRubble = (p: Pen) => {
  for (let i = 0; i < 11; i++) {
    const x = 50 + 260 * hash(i, 11), y = 160 - 70 * hash(i, 12) * (1 - Math.abs(x - 180) / 190), r = 24 + 22 * hash(i, 13), a = hash(i, 14) * 6.28;
    p.poly([0, 1.4, 2.9, 4.4].map((d) => [x + r * Math.cos(a + d), Math.min(186, y + r * 0.8 * Math.sin(a + d))] as P2), ["#aaa9a3", "#c6c5be", "#85847e"][i % 3], 8);
  }
};
/** a wooden shelf on a 1200 x 110 canvas */
export const fxShelf = (p: Pen) => {
  const b = rrect(14, 14, 1186, 96, 12);
  p.poly(b, "#b7814a", 12);
  p.clip(b, () => { p.stroke([[20, 34], [1180, 30]], 12, "#d09a5e"); for (let i = 0; i < 9; i++) p.stroke([[60 + i * 130, 62 + 8 * hash(i, 3)], [140 + i * 130, 60 + 8 * hash(i, 4)]], 5, "#8e5f31"); });
  p.poly(b, null, 12);
};
/** n small iron weights stacked in rows of five on a 520 x 520 canvas, from the bottom (y = 510) up */
export const fxWeights = (p: Pen, n: number) => {
  for (let i = 0; i < n; i++) {
    const x = 60 + (i % 5) * 100, y = 510 - Math.floor(i / 5) * 98;
    p.arc(x, y - 78, 16, 14, 180, 360, 15, INK); p.arc(x, y - 78, 16, 14, 180, 360, 6, "#7c8798");
    const b: P2[] = [[x - 26, y - 74], [x + 26, y - 74], [x + 44, y], [x - 44, y]];
    p.poly(b, "#566072", 8); p.clip(b, () => p.poly([[x - 34, y - 74], [x - 16, y - 74], [x - 32, y], [x - 50, y]], "#77839a", 0)); p.poly(b, null, 8);
  }
};

// ---------------- the party ----------------
/** thought bubble with a glass slipper on a 460 x 420 canvas; broken = it is in pieces */
export const fxThoughtShoe = (p: Pen, broken: boolean) => {
  const blobs: [number, number, number][] = [[150, 170, 92], [250, 130, 104], [340, 180, 88], [300, 240, 84], [190, 244, 86]];
  for (const [x, y, r] of blobs) p.ell(x, y, r + 9, (r + 9) * 0.82, INK, 0);
  for (const [x, y, r] of blobs) p.ell(x, y, r, r * 0.82, "#ffffff", 0);
  p.ell(112, 340, 30, 25, "#ffffff", 8); p.ell(62, 392, 17, 14, "#ffffff", 7);
  const g = p.g; g.save(); g.translate(118, 86);
  if (broken) { g.scale(0.9, 0.9); fxShards(p, 5, GLASS, 9); } else { g.scale(0.28, 0.28); fxSlipper(p, 0, 30); }
  g.restore();
};
/** a white cup on a 200 x 200 canvas */
export const fxCup = (p: Pen) => {
  p.arc(150, 104, 30, 34, -80, 80, 22, INK); p.arc(150, 104, 30, 34, -80, 80, 9, "#ffffff");
  const b: P2[] = [[40, 50], [150, 50], [138, 168], [52, 168]];
  p.poly(b, "#ffffff", 10); p.clip(b, () => p.stroke([[126, 56], [118, 164]], 20, "#dfe5ee")); p.poly(b, null, 10);
  p.ell(95, 50, 55, 13, "#f3e7d3", 9); p.stroke([[52, 96], [136, 96]], 9, RED);
};
/** the pole clock on a 300 x 900 canvas: round face centred on (150, 165), radius 130; hour = the hour hand's
 *  angle in degrees from twelve (330 = eleven) */
export const fxClock = (p: Pen, hour: number) => {
  p.poly(rrect(132, 280, 168, 880, 8), "#3d4a5c", 10);
  p.poly(rrect(92, 850, 208, 892, 10), "#3d4a5c", 10);
  p.ell(150, 165, 140, 140, "#3d4a5c", 12); p.ell(150, 165, 114, 114, "#fff7df", 9);
  for (let i = 0; i < 12; i++) { const a = rad(i * 30 - 90), r0 = i % 3 ? 96 : 86; p.stroke([[150 + r0 * Math.cos(a), 165 + r0 * Math.sin(a)], [150 + 106 * Math.cos(a), 165 + 106 * Math.sin(a)]], i % 3 ? 6 : 11); }
  p.stroke([[150, 165], [150, 72]], 10);
  const a = rad(hour - 90);
  p.stroke([[150, 165], [150 + 64 * Math.cos(a), 165 + 64 * Math.sin(a)]], 15, RED);
  p.dot(150, 165, 13, INK);
};
/** a string of paper lanterns on an 1800 x 240 canvas */
export const fxLanterns = (p: Pen) => {
  const y = (x: number) => 30 + 46 * Math.sin((x / 1800) * Math.PI);
  const pts: P2[] = []; for (let i = 0; i <= 30; i++) pts.push([i * 60, y(i * 60)]);
  p.stroke(pts, 6);
  ["#ffd34d", "#ff7a59", "#ff9ecf", "#8fe0a0", "#ffd34d", "#7fc8ff", "#ff7a59", "#ffd34d", "#ff9ecf"].forEach((col, i) => {
    const x = 110 + i * 197, y0 = y(x);
    p.stroke([[x, y0], [x, y0 + 22]], 5);
    p.ell(x, y0 + 84, 50, 62, col, 9);
    p.clip(ellPts(x, y0 + 84, 50, 62), () => { for (const dx of [-24, 0, 24]) p.arc(x + dx * 0.3, y0 + 84, 22 + Math.abs(dx), 62, 0, 360, 4, "rgba(60,30,20,0.35)"); });
    p.poly(rrect(x - 22, y0 + 16, x + 22, y0 + 30, 4), "#5a3b2a", 6); p.poly(rrect(x - 22, y0 + 138, x + 22, y0 + 152, 4), "#5a3b2a", 6);
  });
};
/** the checkered dance floor on an 800 x 800 canvas (a flat card) */
export const fxFloor = (p: Pen) => {
  const b = rrect(10, 10, 790, 790, 26);
  p.poly(b, "#f3e7cf", 14);
  p.clip(b, () => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) p.poly([[30 + i * 92.5, 30 + j * 92.5], [122.5 + i * 92.5, 30 + j * 92.5], [122.5 + i * 92.5, 122.5 + j * 92.5], [30 + i * 92.5, 122.5 + j * 92.5]], "#b4553f", 0); });
  p.poly(b, null, 14); p.poly(rrect(28, 28, 772, 772, 14), null, 7);
};
/** a white garden gate between two posts on a 420 x 420 canvas (it stands on y = 410) */
export const fxGate = (p: Pen) => {
  for (const x of [26, 350]) { p.poly(rrect(x, 70, x + 44, 410, 6), "#f6f3ea", 10); p.poly([[x - 8, 74], [x + 22, 34], [x + 52, 74]], "#f6f3ea", 10); }
  for (let i = 0; i < 6; i++) { const x = 84 + i * 44; p.poly([[x, 410], [x, 150], [x + 15, 124], [x + 30, 150], [x + 30, 410]], "#ffffff", 9); }
  p.poly(rrect(72, 210, 348, 236, 5), "#f6f3ea", 8); p.poly(rrect(72, 330, 348, 356, 5), "#f6f3ea", 8);
};

// ---------------- the diagrams ----------------
/** half a little Gus (the left half) on a 300 x 400 canvas */
export const fxHalfGus = (p: Pen) => { p.clip([[0, 0], [150, 0], [150, 400], [0, 400]], () => miniGus(p, 0, "smile")); p.stroke([[150, 30], [150, 380]], 9); };
export const fxMiniGus = (p: Pen) => miniGus(p, 0, "smile");
const arrowPoly = (p: Pen, x: number, y: number, ang: number, len: number, col: string) => {
  const c = Math.cos(ang), s = Math.sin(ang), R = (u: number, v: number): P2 => [x + u * c - v * s, y + u * s + v * c], w = len * 0.2;
  p.poly([R(0, -w), R(len * 0.55, -w), R(len * 0.55, -2.2 * w), R(len, 0), R(len * 0.55, 2.2 * w), R(len * 0.55, w), R(0, w)], col, 9);
};
/** the glass heel on a 700 x 1000 canvas: a piece of sole on top, the post standing on a floor line (y = 905).
 *  bend 0..1 leans the top over to the right; sq / st 0..1 = size of the blue squeeze arrows (inside of the bend,
 *  right) and of the red stretch arrows (outside, left) */
export const fxHeel = (p: Pen, bend: number, sq: number, st: number) => {
  const cx = (t: number) => 280 + 150 * bend * (1 - t) ** 2, yy = (t: number) => 170 + 730 * t, hw = 92;
  const L: P2[] = [], R: P2[] = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16; L.push([cx(t) - hw, yy(t)]); R.push([cx(t) + hw, yy(t)]); }
  const post = [...L, ...R.reverse()];
  p.stroke([[30, 905], [670, 905]], 14);
  p.poly(post, GLASS, 14);
  p.clip(post, () => { p.stroke(L.map(([x, y]) => [x + 40, y] as P2), 22, "#ffffff"); p.stroke(R.map(([x, y]) => [x - 22, y] as P2), 30, GLASS_D); });
  p.poly(post, null, 14);
  const sx = 150 * bend;
  const sole: P2[] = [[30 + sx, 66], [510 + sx, 34], [526 + sx, 126], [46 + sx, 178]];
  p.poly(sole, GLASS, 14); p.clip(sole, () => p.stroke([[70 + sx, 90], [480 + sx, 62]], 14, "#ffffff")); p.poly(sole, null, 14);
  if (sq > 0.02) { const x = cx(0.5) + hw + 60; arrowPoly(p, x, 380 - 90 * sq, Math.PI / 2, 150 * sq, BLUE); arrowPoly(p, x, 700 + 90 * sq, -Math.PI / 2, 150 * sq, BLUE); }
  if (st > 0.02) {
    const x = cx(0.5) - hw - 60; arrowPoly(p, x, 520, -Math.PI / 2, 150 * st, RED); arrowPoly(p, x, 570, Math.PI / 2, 150 * st, RED);
    p.stroke([[cx(0.5) - hw, 545], [cx(0.5) - hw + 34 * st, 545]], 8);
  }
};
/** a long glass bar on a 1000 x 300 canvas (rrect 40..960 x 90..210). notch 0..1 = how open the scratch in the
 *  middle of its top edge is; crack 0..1 = how far the crack has run down from it */
export const fxBar = (p: Pen, notch = 0, crack = 0) => {
  const b = rrect(40, 90, 960, 210, 16);
  p.poly(b, GLASS, 13);
  p.clip(b, () => { p.stroke([[70, 116], [930, 116]], 13, "#ffffff"); p.stroke([[60, 196], [940, 196]], 22, GLASS_D); });
  p.poly(b, null, 13);
  if (notch > 0.02) p.poly([[500 - 34 * notch, 82], [500, 90 + 56 * notch], [500 + 34 * notch, 82]], "#ffffff", 8);
  else if (notch > -0.5) p.stroke([[500, 90], [500, 108]], 6);
  if (crack > 0.02) { const pts: P2[] = [[500, 140]]; for (let i = 1; i <= 6; i++) if (i / 6 <= crack + 0.001) pts.push([500 + (i % 2 ? 12 : -10), 140 + i * 12]); if (pts.length > 1) p.stroke(pts, 8); }
};
/** one half of the broken bar on a 520 x 300 canvas; side -1 = the left half (jagged edge on the right) */
export const fxBarHalf = (p: Pen, side: number) => {
  const j: P2[] = [[470, 90], [488, 112], [466, 134], [490, 156], [468, 180], [484, 210]];
  const b: P2[] = [[56, 90], ...j, [56, 210], [40, 194], [40, 106]];
  const g = p.g; g.save(); if (side > 0) { g.translate(520, 0); g.scale(-1, 1); }
  p.poly(b, GLASS, 13); p.clip(b, () => { p.stroke([[70, 116], [450, 116]], 13, "#ffffff"); p.stroke([[60, 196], [470, 196]], 22, GLASS_D); }); p.poly(b, null, 13);
  g.restore();
};
/** an upright glass bar on a 240 x 700 canvas (rrect 70..170 x 30..670); part 0 whole, 1 upper half, 2 lower half */
export const fxBarV = (p: Pen, part = 0) => {
  const b: P2[] = part === 0 ? rrect(70, 30, 170, 670, 14) : part === 1 ? [[70, 30], [170, 30], [170, 330], [146, 352], [122, 326], [96, 350], [70, 334]] : [[70, 380], [96, 396], [122, 372], [146, 398], [170, 376], [170, 670], [70, 670]];
  p.poly(b, GLASS, 12); p.clip(b, () => { p.stroke([[94, 40], [94, 660]], 12, "#ffffff"); p.stroke([[160, 30], [160, 670]], 16, GLASS_D); }); p.poly(b, null, 12);
};
/** a beam with a hook on a 400 x 160 canvas (the hook's eye at (200, 130)) */
export const fxHook = (p: Pen) => { p.poly(rrect(14, 14, 386, 70, 10), "#b7814a", 11); p.stroke([[200, 70], [200, 112]], 12); p.arc(200, 130, 18, 18, -90, 180, 11); };
/** the magnifying glass on a 520 x 640 canvas: lens centred on (250, 240), radius 200; in the lens the bar's edge,
 *  enlarged, is full of V-shaped scratches */
export const fxLens = (p: Pen) => {
  p.stroke([[392, 392], [486, 590]], 60, INK); p.stroke([[392, 392], [486, 590]], 38, "#8a5a33");
  const lens = ellPts(250, 240, 200, 200);
  p.poly(lens, "#f4fbff", 0);
  p.clip(lens, () => {
    const top: P2[] = [[30, 238]];
    for (let i = 0; i < 5; i++) { const x = 84 + i * 82, d = [44, 26, 60, 30, 46][i], w = [18, 12, 22, 12, 16][i]; top.push([x - w, 238], [x, 238 + d], [x + w, 238]); }
    top.push([470, 238], [470, 460], [30, 460]);
    p.poly(top, GLASS, 11);
    p.stroke([[50, 420], [450, 420]], 30, GLASS_D);
  });
  p.ell(250, 240, 200, 200, null, 26); p.arc(250, 240, 176, 176, 200, 250, 12, "#ffffff");
};
/** a red bag of chips on a 300 x 400 canvas; state 0 shut (a tiny notch in the top left edge), 1 torn open */
export const fxChips = (p: Pen, state: number) => {
  const zig = (y: number, up: number): P2[] => { const o: P2[] = []; for (let i = 0; i <= 12; i++) o.push([40 + i * 18.3, y + (i % 2 ? up : 0)]); return o; };
  const body: P2[] = state ? [[40, 96], [70, 70], [96, 104], [128, 64], [150, 100], [186, 58], [214, 98], [260, 74], [260, 96], ...zig(372, 12).reverse()] : [...zig(40, -12), ...zig(372, 12).reverse()];
  if (state) for (const [x, y, r] of [[96, 78, -20], [150, 62, 10], [204, 76, 30]] as const) p.ell(x, y, 34, 22, "#ffd84a", 8, 0, 360, r);
  p.poly(body, "#e23b32", 11);
  p.clip(body, () => { p.poly([[30, 330], [270, 330], [270, 400], [30, 400]], "#c22e27", 0); if (!state) p.poly([[30, 20], [270, 20], [270, 64], [30, 64]], "#c22e27", 0); p.stroke([[66, 110], [66, 300]], 14, "#ff8a7a"); });
  p.poly(body, null, 11);
  p.ell(150, 216, 70, 62, "#ffd84a", 9); p.ell(150, 216, 40, 24, "#f6a821", 6, 0, 360, -18);
  if (!state) p.poly([[36, 86], [58, 96], [36, 106]], "#ffffff", 5);
};
/** one chip on a 120 x 100 canvas */
export const fxChip = (p: Pen) => { p.ell(60, 50, 46, 30, "#ffd84a", 8, 0, 360, -14); p.arc(60, 50, 26, 12, 190, 330, 5, "#f6a821"); };
