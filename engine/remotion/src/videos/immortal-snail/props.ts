// This video's own drawings: 2D cards drawn with the kit's Pen on a canvas of the stated size and placed with fx().
// No letters anywhere: a dollar sign on the sack, numbers on the ruler, the tag, the milestones.
import { Pen, INK, P2, toon, miniGus } from "../../toon/kit";

const { ellPts, rrect, curve } = toon;
export const RED = "#e8452f", BLUE = "#2f8cf0";
const BODY = "#f0cf96", BODY_D = "#d9ae6c", SHELL = "#c0763c", SHELL_D = "#7d4521", SHELL_L = "#e6a465", WATER = "#59b8f2", WATER_D = "#2f8cd8", STEEL = "#c9d2e2";

const numberOn = (p: Pen, text: string, x: number, y: number, size: number, fill = "#ffffff", ink = true) => {
  const g = p.g; g.font = `900 ${size}px "Arial Black", Arial, Helvetica, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineJoin = "round"; if (ink) { g.lineWidth = size * 0.16; g.strokeStyle = INK; g.strokeText(text, x, y); } g.fillStyle = fill; g.fillText(text, x, y);
};

// ---------------- the snail ----------------
/** the snail from the side on a 400 x 300 canvas, facing right, its foot on y = 280.
 *  st 0..1 = how far it is stretched out; eye: 0 open, 1 narrowed (it means it), 2 wink, 3 wide; reach 0..1 = the
 *  front eye stalk stretches forward; flat = squashed (under a weight) */
export const fxSnail = (p: Pen, st = 0, eye = 0, reach = 0, ol = 11) => {
  const L = 34 * st;
  const body: P2[] = [[22 - 0.5 * L, 280], [48 - 0.4 * L, 262], [96, 244], [236, 236], [280 + L, 226], ...ellPts(322 + L, 216, 40, 44, 200, 430, 0, 14), [330 + L, 280]];
  // eye stalks (behind the head)
  const e1: P2 = [306 + L, 118], e2: P2 = [352 + L + 70 * reach, 112 + 46 * reach];
  for (const [e, x0] of [[e1, 308 + L], [e2, 338 + L]] as [P2, number][]) { p.stroke([[x0, 190], e], 24); p.stroke([[x0, 190], e], 12, BODY); }
  p.poly(body, BODY, ol);
  p.clip(body, () => p.stroke([[20, 284], [330 + L, 284]], 26, BODY_D));
  p.poly(body, null, ol);
  // the shell
  p.ell(160, 150, 104, 98, SHELL, ol + 1);
  p.arc(160, 150, 70, 66, -60, 250, 13, SHELL_D);
  p.arc(168, 156, 36, 33, 0, 300, 12, SHELL_D);
  p.dot(170, 158, 9, SHELL_D);
  p.arc(160, 150, 88, 82, 200, 262, 12, SHELL_L);
  // eyes
  ([e1, e2] as P2[]).forEach(([x, y], i) => {
    if (eye === 2 && i === 1) { p.dot(x, y, 20, INK); p.dot(x, y, 12, BODY); p.arc(x, y + 2, 9, 7, 200, 340, 6); return; }
    const r = eye === 3 ? 23 : 20;
    p.dot(x, y, r + 5, INK); p.dot(x, y, r, "#ffffff"); p.dot(x + 5, y + (eye === 1 ? 3 : 0), eye === 3 ? 7 : 9, INK);
    if (eye === 1) { p.clip(ellPts(x, y, r + 6, r + 6), () => p.poly([[x - 30, y - 30], [x + 30, y - 30], [x + 30, y - 2], [x - 30, y - 10]], BODY_D, 0)); p.stroke([[x - 22, y - 10], [x + 22, y - 2]], 7); }
  });
  // mouth
  if (eye === 1) p.stroke([[330 + L, 238], [352 + L, 234]], 7); else p.arc(338 + L, 228, 14, 11, 20, 150, 7);
};
/** a silver slime trail, 600 x 60 */
export const fxTrail = (p: Pen) => { p.stroke([[20, 30], [580, 30]], 26, "rgba(214,238,255,0.85)"); for (let x = 60; x < 560; x += 90) p.stroke([[x, 26], [x + 36, 26]], 5, "#ffffff"); };

// ---------------- money ----------------
/** the money sack on a 300 x 340 canvas */
export const fxSack = (p: Pen) => {
  const sack: P2[] = [[112, 96], [188, 96], [236, 150], [272, 232], [262, 300], [210, 326], [90, 326], [38, 300], [28, 232], [64, 150]];
  p.poly([[100, 100], [78, 36], [120, 56], [150, 28], [180, 56], [222, 36], [200, 100]], "#d9b579", 11);
  p.poly(sack, "#d9b579", 12);
  p.clip(sack, () => p.poly([[20, 240], [280, 240], [280, 340], [20, 340]], "#c39a5c", 0));
  p.poly(sack, null, 12);
  p.stroke([[104, 100], [196, 100]], 15); p.stroke([[104, 100], [196, 100]], 7, "#8c5a2b");
  numberOn(p, "$", 150, 222, 130, "#2f9e4f");
};
/** a red cross, 200 x 200 */
export const fxCross = (p: Pen) => { for (const s of [-1, 1]) { p.stroke([[100 - 62, 100 - 62 * s], [100 + 62, 100 + 62 * s]], 46); } for (const s of [-1, 1]) p.stroke([[100 - 62, 100 - 62 * s], [100 + 62, 100 + 62 * s]], 26, RED); };

// ---------------- the race ----------------
/** a wooden ruler with thirteen inches on a 1300 x 220 canvas: mark 0 at x = 80, mark 13 at x = 1220 */
export const fxRuler = (p: Pen) => {
  p.poly(rrect(14, 30, 1286, 206, 14), "#f3d27a", 12);
  for (let i = 0; i <= 26; i++) { const x = 80 + (1140 * i) / 26; p.stroke([[x, 36], [x, i % 2 ? 66 : 92]], i % 2 ? 5 : 8); }
  numberOn(p, "0", 80, 150, 72, INK, false); numberOn(p, "13", 1210, 150, 72, INK, false);
};
/** checkered flag on a pole, 200 x 320 (pole foot at 30, 310) */
export const fxFlag = (p: Pen) => {
  p.stroke([[30, 310], [30, 16]], 14);
  const fl = rrect(34, 20, 186, 132, 4); p.poly(fl, "#ffffff", 9);
  p.clip(fl, () => { for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2 === 0) p.poly([[34 + i * 38, 20 + j * 38], [72 + i * 38, 20 + j * 38], [72 + i * 38, 58 + j * 38], [34 + i * 38, 58 + j * 38]], INK, 0); });
  p.poly(fl, null, 9);
};
/** a stopwatch on a 300 x 340 canvas, dial centre at (150, 190), without its hand */
export const fxWatch = (p: Pen) => {
  p.poly(rrect(128, 14, 172, 64, 8), STEEL, 10); p.poly(rrect(112, 4, 188, 30, 8), RED, 9);
  p.ell(150, 190, 132, 132, STEEL, 13); p.ell(150, 190, 104, 104, "#ffffff", 9);
  for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; p.stroke([[150 + 84 * Math.sin(a), 190 - 84 * Math.cos(a)], [150 + (i % 3 ? 96 : 100) * Math.sin(a), 190 - (i % 3 ? 96 : 100) * Math.cos(a)]], i % 3 ? 5 : 9); }
};
/** its hand on a 300 x 300 canvas, turning about the centre, pointing up */
export const fxHand = (p: Pen) => { p.poly([[139, 160], [150, 62], [161, 160]], RED, 8); p.dot(150, 150, 17, INK); p.dot(150, 150, 8, STEEL); };
/** a tally of turns done: n filled dots out of m, on a 60m x 60 canvas */
export const fxTally = (p: Pen, n: number, m: number) => { for (let i = 0; i < m; i++) { p.dot(30 + 60 * i, 30, 22, INK); p.dot(30 + 60 * i, 30, 14, i < n ? RED : "#ffffff"); } };
/** the board with two race lanes, 1300 x 700 */
export const fxLanes = (p: Pen) => {
  const b = rrect(14, 14, 1286, 686, 26); p.poly(b, "#e9744a", 13);
  for (const y of [40, 362]) p.poly(rrect(44, y, 1256, y + 298, 12), "#f6b08c", 8);
  for (const y of [40, 362]) { p.stroke([[150, y + 6], [150, y + 292]], 10, "#ffffff"); for (let j = 0; j < 6; j++) for (let i = 0; i < 2; i++) if ((i + j) % 2 === 0) p.poly([[1150 + i * 40, y + 6 + j * 48], [1190 + i * 40, y + 6 + j * 48], [1190 + i * 40, y + 54 + j * 48], [1150 + i * 40, y + 54 + j * 48]].map(([x, yy]) => [x, Math.min(yy, y + 292)] as P2), INK, 0); }
};
/** tiny Gus leaning into a sprint with speed streaks behind him, 520 x 400 (he moves to the right) */
export const fxDash = (p: Pen) => {
  for (const [y, x0, x1] of [[120, 20, 190], [200, 0, 170], [280, 40, 200]] as const) p.stroke([[x0, y], [x1, y]], 16, "#ffffff");
  const g = p.g; g.save(); g.translate(360, 200); g.rotate(0.22); g.translate(-150, -200); miniGus(p, 0, "smile"); g.restore();
};
/** sweat drops, 200 x 200 (u 0..1) */
export const fxSweat = (p: Pen, u: number) => {
  for (const [a, r] of [[-150, 1], [-110, 0.8], [-60, 0.9], [-25, 1]] as const) {
    const d = 40 + 56 * u * r, x = 100 + d * Math.cos((a * Math.PI) / 180), y = 120 + d * Math.sin((a * Math.PI) / 180) + 30 * u * u;
    p.poly([[x, y - 14], [x + 9, y + 4], [x, y + 12], [x - 9, y + 4]], "#8ecbf7", 5);
  }
};

// ---------------- the tap and the bathtub ----------------
/** a chrome tap on a 400 x 300 canvas; the spout's mouth is at (120, 262) */
export const fxTap = (p: Pen) => {
  const pipe = [...curve([400, 110], [150, 96], [120, 240], 12)];
  p.stroke(pipe, 74); p.stroke(pipe, 52, STEEL); p.stroke(curve([392, 96], [170, 84], [136, 200], 12), 10, "#ffffff");
  p.poly(rrect(82, 226, 158, 262, 8), "#aab4c6", 10);
  p.poly(rrect(364, 52, 394, 168, 8), "#aab4c6", 10);
  p.stroke([[262, 84], [262, 36]], 30); p.stroke([[262, 84], [262, 36]], 14, STEEL);
  p.poly(rrect(196, 12, 328, 44, 14), RED, 10);
};
/** a water drop, 100 x 140 */
export const fxDrop = (p: Pen) => { const d: P2[] = [[50, 10], ...ellPts(50, 88, 36, 40, -40, 220, 0, 16)]; p.poly(d, WATER, 9); p.arc(40, 92, 16, 20, 100, 170, 7, "#ffffff"); };
/** the bathtub cut open on a 1000 x 600 canvas: level 0..1 of water (1 = to the brim, more = spilling), duck = a rubber duck floats on it */
export const fxTub = (p: Pen, level: number, duck = false) => {
  for (const x of [220, 780]) { p.poly([[x - 40, 470], [x + 40, 470], [x + 56, 566], [x - 56, 566]], STEEL, 11); }
  const out: P2[] = [[60, 130], [940, 130], [900, 400], [800, 490], [200, 490], [100, 400]];
  const inn: P2[] = [[110, 150], [890, 150], [856, 384], [776, 452], [224, 452], [144, 384]];
  p.poly(out, "#ffffff", 14);
  p.poly(inn, "#e3eef8", 8);
  const lv = Math.min(1, level), wy = 452 - 300 * lv;
  if (level > 0.01) p.clip(inn, () => { p.poly([[100, wy], [900, wy], [900, 470], [100, 470]], WATER, 0); p.stroke([[100, wy + 4], [900, wy + 4]], 9, "#d8f1ff"); p.poly([[100, wy + 150], [900, wy + 150], [900, 470], [100, 470]], WATER_D, 0); });
  p.poly(inn, null, 8);
  p.poly(rrect(36, 104, 964, 150, 22), "#ffffff", 13);
  if (duck) {
    const y = wy - 4, x = 620;
    p.ell(x, y - 26, 62, 40, "#ffd22e", 10); p.ell(x + 46, y - 78, 34, 32, "#ffd22e", 10); p.poly([[x + 74, y - 82], [x + 112, y - 72], [x + 76, y - 62]], "#f08a1c", 8); p.dot(x + 54, y - 86, 6, INK);
    p.poly([[x - 62, y - 30], [x - 86, y - 62], [x - 40, y - 48]], "#ffd22e", 9);
  }
  if (level > 1) { const k = Math.min(1, (level - 1) * 4); for (const s of [-1, 1]) { const x = 500 + s * 452; p.stroke([[x, 118], [x + s * 26, 160], [x + s * 30, 160 + 380 * k]], 30, WATER); p.stroke([[x + s * 30, 190], [x + s * 30, 160 + 300 * k]], 8, "#d8f1ff"); } }
};
/** a little sun, 200 x 200 */
export const fxSun = (p: Pen) => { for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; p.stroke([[100 + 62 * Math.cos(a), 100 + 62 * Math.sin(a)], [100 + 88 * Math.cos(a), 100 + 88 * Math.sin(a)]], 16); p.stroke([[100 + 62 * Math.cos(a), 100 + 62 * Math.sin(a)], [100 + 88 * Math.cos(a), 100 + 88 * Math.sin(a)]], 7, "#ffd22e"); } p.ell(100, 100, 50, 50, "#ffd22e", 10); };

// ---------------- distances ----------------
/** a yellow measuring tape, 900 x 100 */
export const fxTape = (p: Pen) => { p.poly(rrect(8, 22, 892, 78, 6), "#ffd22e", 9); for (let i = 0; i < 29; i++) p.stroke([[30 + i * 30, 26], [30 + i * 30, i % 5 ? 44 : 58]], i % 5 ? 4 : 6); };
/** a tag with a number, 300 x 260 (its point at 150, 250) */
export const fxTag = (p: Pen, text: string) => { p.poly([[150, 252], [116, 196], [34, 196], [34, 20], [266, 20], [266, 196], [184, 196]], "#ffffff", 12); numberOn(p, text, 150, 110, 120, RED); };
/** a strip of road, 1500 x 200; off 0..1 = how far the dashes have slid to the left */
export const fxRoad = (p: Pen, off: number) => {
  const r = rrect(10, 40, 1490, 190, 10); p.poly(r, "#6f7686", 12);
  p.clip(r, () => { for (let i = -1; i < 9; i++) { const x = (i - off) * 190 + 60; p.poly([[x, 104], [x + 100, 104], [x + 100, 126], [x, 126]], "#ffffff", 0); } });
  p.poly(r, null, 12);
};
/** a milestone with a number and a small picture, 300 x 420. icon: sun (a day), cal (a year), glass (years) */
export const fxMile = (p: Pen, text: string, icon: "sun" | "cal" | "glass") => {
  const st: P2[] = [[40, 410], [40, 130], ...ellPts(150, 130, 110, 100, 180, 360, 0, 14), [260, 410]];
  p.poly(st, "#eceff4", 13); p.clip(st, () => p.poly([[200, 0], [300, 0], [300, 420], [226, 420]], "#c8cfdb", 0)); p.poly(st, null, 13);
  numberOn(p, text, 150, 290, text.length > 2 ? 104 : 128, RED);
  const g = p.g; g.save(); g.translate(150, 132);
  if (icon === "sun") { g.scale(0.62, 0.62); g.translate(-100, -100); fxSun(p); }
  else if (icon === "cal") { p.poly(rrect(-54, -50, 54, 56, 8), "#ffffff", 8); p.poly(rrect(-54, -50, 54, -18, 8), RED, 8); for (const x of [-28, 28]) p.stroke([[x, -62], [x, -40]], 10); for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) p.dot(-28 + i * 28, 6 + j * 26, 7, "#8e98ac"); }
  else { p.poly([[-42, -58], [42, -58], [6, 0], [42, 58], [-42, 58], [-6, 0]], "#d8f1ff", 8); p.poly([[-24, 54], [24, 54], [0, 22]], "#f0b63a", 0); p.poly([[-20, -30], [20, -30], [0, -4]], "#f0b63a", 0); p.stroke([[-50, -60], [50, -60]], 12); p.stroke([[-50, 60], [50, 60]], 12); }
  g.restore();
};
/** a grassy islet floating in the sky, 600 x 240 (its top at y = 70) */
export const fxIslet = (p: Pen) => {
  p.poly([[40, 80], [560, 80], [470, 190], [300, 232], [130, 190]], "#a9794b", 12);
  const top: P2[] = [[20, 90], ...ellPts(300, 84, 284, 36, 180, 360, 0, 20), [580, 90], [540, 116], [60, 116]];
  p.poly(top, "#6dbb4d", 12);
};

// ---------------- the trip ----------------
/** a red suitcase on a 300 x 360 canvas, standing on y = 350 */
export const fxCase = (p: Pen, handle = true) => {
  if (handle) { p.arc(150, 64, 46, 40, 180, 360, 30, INK); p.arc(150, 64, 46, 40, 180, 360, 12, "#59606e"); }
  const b = rrect(24, 64, 276, 344, 26); p.poly(b, RED, 13);
  p.clip(b, () => { p.poly([[24, 250], [276, 250], [276, 350], [24, 350]], "#c43622", 0); for (const x of [84, 216]) p.poly([[x - 15, 60], [x + 15, 60], [x + 15, 350], [x - 15, 350]], "#8c5a2b", 7); });
  p.poly(b, null, 13);
  for (const x of [84, 216]) p.poly(rrect(x - 22, 150, x + 22, 186, 5), "#f0c44a", 7);
};
/** the X-ray bubble on a 600 x 600 canvas: the suitcase in the hold with the snail stuck to its side. eye = the snail's eye mode */
export const fxXray = (p: Pen, eye: number) => {
  p.ell(300, 300, 280, 280, "#22304e", 16);
  p.clip(ellPts(300, 300, 272, 272), () => {
    p.poly([[0, 470], [600, 470], [600, 600], [0, 600]], "#3a4a6e", 0); p.stroke([[0, 470], [600, 470]], 8);
    p.poly(rrect(40, 300, 150, 470, 10), "#5a7ab8", 9); p.poly(rrect(470, 250, 600, 470, 10), "#6fae6a", 9);
    const g = p.g; g.save(); g.translate(170, 148); g.scale(0.92, 0.92); fxCase(p); g.restore();
    g.save(); g.translate(206, 262); g.scale(0.52, 0.52); fxSnail(p, 0.2, eye, 0, 16); g.restore();
  });
  p.ell(300, 300, 280, 280, null, 16);
};
/** a palm tree on a 600 x 900 canvas, foot at (300, 890) */
export const fxPalm = (p: Pen) => {
  const tr = curve([300, 890], [250, 560], [330, 260], 14);
  p.stroke(tr, 74); p.stroke(tr, 52, "#b98552");
  for (let i = 2; i < 13; i += 2) { const [x, y] = tr[i]; p.stroke([[x - 28, y + 6], [x + 28, y - 6]], 7); }
  for (const [dx, dy, s] of [[-250, 40, 1], [250, 60, 1], [-190, -150, 0.9], [200, -140, 0.9], [-30, -220, 0.8], [-240, 190, 0.8], [250, 200, 0.8]] as const) {
    const tip: P2 = [330 + dx, 260 + dy], mid: P2 = [330 + dx * 0.5, 260 + dy * 0.5 - 80 * s];
    const a = curve([330, 250], mid, tip, 10), b = curve(tip, [mid[0], mid[1] + 70], [330, 290], 10);
    p.poly([...a, ...b], "#3fae4c", 11);
  }
  for (const [x, y] of [[306, 286], [352, 296]] as const) p.ell(x, y, 26, 26, "#8c5a2b", 9);
};
