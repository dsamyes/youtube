// This video's own drawings: 2D cards drawn with the kit's Pen on a canvas of the stated size and placed with fx().
import { Pen, INK, P2, toon, hash } from "../../toon/kit";

const { rad, ellPts, rrect, curve } = toon;
const AIR = "#49a6ff", AIR_HI = "#bfe2ff", IRON = "#4d5666", WHITE = "#f4f6fa", NAVY = "#39527f";

/** an air dot: a small blue ball with a highlight */
const airDot = (p: Pen, x: number, y: number, r: number) => { p.dot(x, y, r + Math.max(3, r * 0.2), INK); p.dot(x, y, r, AIR); p.dot(x - r * 0.3, y - r * 0.3, r * 0.35, AIR_HI); };

// ---------------- the airliner, side view, nose to the right, on a 1400 x 560 canvas ----------------
const fuselage = (): P2[] => [[86, 204], [300, 182], [1150, 182], ...ellPts(1186, 260, 124, 78, -90, 90, 0, 24), [1150, 338], [430, 338], [86, 236]];
/** cut = cutaway (the cabin and its air show), gear = wheels down, open = the front door stands open */
export const fxPlane = (p: Pen, cut = false, gear = false, open = false) => {
  const body = fuselage();
  if (gear) {
    for (const x of [1128, 640]) p.line([[x, 330], [x, 428]], "#9aa3b2", 12);
    for (const [x, r] of [[1128, 30], [612, 34], [672, 34]] as const) { p.dot(x, 468 - r, r, INK); p.dot(x, 468 - r, r * 0.42, "#c9d2e2"); }
  }
  p.poly([[112, 206], [56, 36], [176, 36], [336, 186]], "#2f67c8", 12);                       // fin
  p.poly([[96, 226], [34, 204], [58, 186], [236, 222]], "#c9d2e2", 10);                       // tailplane
  p.poly(body, WHITE, 0);
  p.clip(body, () => {
    if (cut) {
      p.poly([[60, 196], [1330, 196], [1330, 326], [60, 326]], "#ffe9b8", 0);                 // the cabin
      p.poly([[60, 296], [1330, 296], [1330, 326], [60, 326]], "#d9c49a", 0);                 // under the floor
      p.stroke([[60, 296], [1330, 296]], 6);
      for (let x = 330; x < 1090; x += 46) { p.poly(rrect(x, 262, x + 26, 296, 6), "#3f72d6", 5); p.poly(rrect(x + 18, 232, x + 30, 296, 5), "#3f72d6", 5); }
      for (let i = 0; i < 70; i++) airDot(p, 150 + hash(i, 11) * 1090, 210 + hash(i, 12) * 72, 10);
    } else {
      p.poly([[60, 300], [1330, 300], [1330, 360], [60, 360]], "#3b78d8", 0);                 // belly
      p.poly([[60, 290], [1330, 290], [1330, 300], [60, 300]], "#e0352c", 0);                 // cheat line
      for (let x = 330; x < 1090; x += 44) p.poly(rrect(x, 222, x + 18, 248, 6), NAVY, 0);
      p.poly([[1218, 214], [1268, 234], [1256, 252], [1204, 246]], NAVY, 6);                  // cockpit
      p.poly(rrect(250, 212, 292, 318, 8), WHITE, 5);
      p.poly(rrect(1108, 212, 1150, 318, 8), open ? "#2b3a5c" : WHITE, 5);
      if (!open) p.poly(rrect(1120, 228, 1138, 252, 5), NAVY, 0);
    }
  });
  p.poly(body, null, 12);
  p.poly([[560, 300], [420, 476], [524, 476], [800, 312]], "#c9d2e2", 11);                    // wing
  p.poly(rrect(600, 330, 744, 394, 28), "#e9edf4", 10);                                       // engine
  p.ell(738, 362, 12, 28, NAVY, 5);
};
/** the door leaf swung open beside its doorway, 120 x 240 canvas */
export const fxLeaf = (p: Pen) => { p.poly(rrect(14, 14, 106, 226, 16), WHITE, 10); p.poly(rrect(40, 44, 80, 96, 10), NAVY, 0); p.poly(rrect(34, 130, 86, 146, 6), "#e0352c", 5); };

// ---------------- pressure gauge: dial (500 x 500) and needle (500 x 500, pointing up, pivot at the centre) ----------------
/** angle of the needle for a value 0..1, degrees clockwise from straight up */
export const dialAngle = (v: number) => -120 + 240 * v;
const onDial = (deg: number, r: number): P2 => [250 + r * Math.sin(rad(deg)), 250 - r * Math.cos(rad(deg))];
export const fxDial = (p: Pen, blink = false) => {
  p.ell(250, 250, 236, 236, "#e9edf4", 16);
  p.ell(250, 250, 196, 196, "#ffffff", 8);
  const band = (a0: number, a1: number, col: string) => { const pts: P2[] = []; for (let a = a0; a <= a1; a += 4) pts.push(onDial(a, 188)); for (let a = a1; a >= a0; a -= 4) pts.push(onDial(a, 150)); p.poly(pts, col, 0); };
  band(dialAngle(0), dialAngle(0.24), "#ff6b5e"); band(dialAngle(0.24), dialAngle(0.76), "#ffd84a"); band(dialAngle(0.76), dialAngle(1), "#5fd07a");
  for (let i = 0; i <= 5; i++) p.stroke([onDial(dialAngle(i / 5), 192), onDial(dialAngle(i / 5), 138)], 9);
  // a little house at "full" (the ground)
  const [hx, hy] = onDial(dialAngle(1), 104);
  if (blink) p.ell(hx, hy + 4, 56, 56, "#fff3a0", 0);
  p.poly([[hx - 30, hy + 34], [hx - 30, hy], [hx, hy - 30], [hx + 30, hy], [hx + 30, hy + 34]], "#e8734a", 7);
  p.poly([[hx - 8, hy + 34], [hx - 8, hy + 12], [hx + 8, hy + 12], [hx + 8, hy + 34]], "#7a4b2a", 0);
  // a tiny plane at one fifth
  const [px, py] = onDial(dialAngle(0.2), 100);
  p.poly(rrect(px - 40, py - 10, px + 40, py + 10, 10), WHITE, 6); p.poly([[px - 8, py], [px - 30, py + 34], [px - 12, py + 34], [px + 16, py]], "#c9d2e2", 6); p.poly([[px - 40, py - 6], [px - 52, py - 30], [px - 34, py - 30], [px - 22, py - 8]], "#2f67c8", 6);
};
export const fxNeedle = (p: Pen) => { p.poly([[238, 262], [250, 64], [262, 262]], "#e0352c", 9); p.dot(250, 250, 30, INK); p.dot(250, 250, 19, "#9aa3b2"); };

// ---------------- iron weights with a number ----------------
const numberOn = (p: Pen, text: string, x: number, y: number, size: number) => {
  const g = p.g; g.font = `900 ${size}px "Arial Black", Arial, Helvetica, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineJoin = "round"; g.lineWidth = size * 0.16; g.strokeStyle = INK; g.strokeText(text, x, y); g.fillStyle = "#ffffff"; g.fillText(text, x, y);
};
/** small weight, 300 x 300 */
export const fxWeight = (p: Pen, label = "8") => {
  p.arc(150, 76, 44, 40, 180, 360, 44, INK); p.arc(150, 76, 44, 40, 180, 360, 22, "#7c8798");
  const body: P2[] = [[78, 84], [222, 84], [270, 268], [30, 268]];
  p.poly(body, IRON, 14);
  p.clip(body, () => p.poly([[60, 84], [96, 84], [66, 268], [20, 268]], "#6b7688", 0));
  p.poly(body, null, 14);
  if (label) numberOn(p, label, 150, 182, 116);
};
/** the big one, 640 x 560 */
export const fxBigWeight = (p: Pen) => {
  p.arc(320, 120, 86, 76, 180, 360, 70, INK); p.arc(320, 120, 86, 76, 180, 360, 40, "#7c8798");
  const body: P2[] = [[150, 130], [490, 130], [610, 530], [30, 530]];
  p.poly(body, IRON, 20);
  p.clip(body, () => p.poly([[110, 130], [190, 130], [110, 530], [10, 530]], "#6b7688", 0));
  p.poly(body, null, 20);
  numberOn(p, "20,000", 320, 350, 128);
};
/** tiny pale arrow pointing left, 200 x 120: the thin air outside */
export const fxFeeble = (p: Pen) => p.poly([[190, 46], [96, 46], [96, 20], [14, 60], [96, 100], [96, 74], [190, 74]], "#d6ecff", 8);

// ---------------- the garden: cars on a door ----------------
/** a cartoon car from the side, 500 x 240 */
export const fxCar = (p: Pen, col: string, honk = false) => {
  p.poly([[110, 96], [150, 26], [330, 26], [392, 96]], col, 11);
  p.poly([[160, 92], [182, 44], [236, 44], [236, 92]], "#cfeaff", 7); p.poly([[254, 92], [254, 44], [316, 44], [350, 92]], "#cfeaff", 7);
  p.poly(rrect(18, 92, 482, 196, 36), col, 11);
  p.poly(rrect(446, 112, 480, 140, 10), honk ? "#fff7b0" : "#ffe27a", 6); p.poly(rrect(18, 116, 40, 144, 8), "#e0352c", 6);
  p.stroke([[246, 100], [246, 188]], 5);
  for (const x of [128, 372]) { p.dot(x, 196, 44, INK); p.dot(x, 196, 31, "#3a3f4b"); p.dot(x, 196, 14, "#c9d2e2"); }
};
/** the plane door lying flat, seen from its edge, 500 x 70 */
export const fxSlab = (p: Pen) => { p.poly(rrect(196, 6, 300, 30, 8), "#e0352c", 7); p.poly(rrect(8, 22, 492, 62, 12), "#dfe4ec", 9); p.stroke([[30, 42], [470, 42]], 4, "#8e98ac"); };
/** a rope from the lower right corner to the upper left, 400 x 300 */
export const fxRope = (p: Pen) => p.line(curve([388, 288], [200, 170], [12, 12], 14), "#caa46a", 11);

// ---------------- suction cup, 320 x 200: stuck to something on its left, handle to the right ----------------
export const fxCup = (p: Pen) => {
  p.poly([[14, 14], [40, 30], [120, 76], [150, 82], [150, 118], [120, 124], [40, 170], [14, 186]], "#e0352c", 10);
  p.clip([[14, 14], [40, 30], [120, 76], [150, 82], [150, 118], [120, 124], [40, 170], [14, 186]], () => p.poly([[14, 14], [60, 40], [130, 78], [130, 92], [50, 60], [14, 50]], "#ff7a70", 0));
  p.poly(rrect(146, 84, 226, 116, 10), "#f1ede2", 9);
  p.ell(262, 100, 44, 44, "#f1ede2", 10); p.ell(262, 100, 18, 18, "#cfc8b6", 0);
};

// ---------------- thought bubble with a toilet, 460 x 460 ----------------
export const fxThought = (p: Pen) => {
  const blobs: [number, number, number][] = [[150, 170, 92], [250, 130, 104], [340, 180, 88], [300, 240, 84], [190, 244, 86]];
  for (const [x, y, r] of blobs) p.ell(x, y, r + 9, (r + 9) * 0.82, INK, 0);
  for (const [x, y, r] of blobs) p.ell(x, y, r, r * 0.82, "#ffffff", 0);
  p.ell(112, 340, 30, 25, "#ffffff", 8); p.ell(62, 392, 17, 14, "#ffffff", 7);
  // toilet from the side: cistern, bowl, foot, lid
  p.poly(rrect(168, 96, 222, 196, 8), "#eef3fa", 8);
  p.poly([[214, 190], [334, 190], [326, 222], [290, 250], [240, 250], [214, 226]], "#eef3fa", 8);
  p.poly([[244, 250], [290, 250], [300, 286], [236, 286]], "#eef3fa", 8);
  p.poly(rrect(208, 176, 342, 194, 8), "#8ecbf7", 7);
  p.poly(rrect(176, 110, 200, 122, 4), "#9aa3b2", 0);
};
/** a small bicep, 200 x 160 */
export const fxBicep = (p: Pen) => { p.ell(100, 100, 80, 52, "#ffe2c2", 9, 180, 360); p.arc(118, 92, 34, 22, 200, 320, 6); };
/** a seat belt across a belly, 420 x 100 */
export const fxBelt = (p: Pen) => { p.poly([[6, 34], [414, 34], [414, 66], [6, 66]], "#59606e", 7); p.poly(rrect(170, 18, 250, 82, 8), "#c9d2e2", 8); p.poly(rrect(190, 34, 230, 66, 4), "#8e98ac", 0); };
/** a bathtub plug on its chain, 300 x 380 */
export const fxPlug = (p: Pen) => {
  const ch = curve([150, 196], [250, 120], [236, 20], 9);
  for (const [x, y] of ch) p.ell(x, y, 13, 13, null, 7);
  p.ell(150, 210, 26, 22, null, 9);
  p.poly([[66, 232], [234, 232], [206, 330], [94, 330]], "#3a3f4b", 11);
  p.poly([[52, 220], [248, 220], [248, 250], [52, 250]], "#59606e", 10);
};

// ---------------- the plug diagram, seen from above ----------------
/** background, 900 x 1200: the wall cut through (hole 240 wide outside, 320 inside), the cabin below it full of air */
export const fxDiagram = (p: Pen) => {
  p.poly(rrect(40, 600, 860, 1170, 40), "#ffe9b8", 12);
  for (let i = 0; i < 110; i++) airDot(p, 80 + hash(i, 21) * 740, 660 + hash(i, 22) * 470, 11);
  for (let i = 0; i < 7; i++) airDot(p, 90 + hash(i, 23) * 720, 60 + hash(i, 24) * 380, 11);
  for (const s of [-1, 1]) {
    const X = (x: number) => 450 + s * x;
    const w: P2[] = [[X(410), 520], [X(120), 520], [X(160), 620], [X(410), 620]];
    p.poly(w, "#c9d2e2", 13);
    for (const x of [220, 290, 360]) p.dot(X(x), 570, 9, "#8e98ac");
  }
  // two seats, so the lower side reads as the cabin
  for (const x of [130, 690]) { p.poly(rrect(x, 1040, x + 84, 1110, 12), "#3f72d6", 8); p.poly(rrect(x, 1100, x + 84, 1130, 8), "#f3eee0", 7); }
};
/** the plug door, 360 x 160: 240 wide outside (top), 320 inside (bottom), the red handle on the cabin side */
export const fxPlugDoor = (p: Pen) => { p.poly(rrect(150, 118, 210, 146, 8), "#e0352c", 7); p.poly([[60, 30], [300, 30], [340, 130], [20, 130]], WHITE, 12); p.stroke([[80, 56], [280, 56]], 5, "#8e98ac"); };
/** a handful of air dots spread over a 600 x 600 canvas */
export const fxDots = (p: Pen, seed: number, n: number) => { for (let i = 0; i < n; i++) airDot(p, 70 + hash(i, seed) * 460, 70 + hash(i, seed + 1) * 460, 44); };
/** sweat drops flying off, 200 x 200 (u 0..1) */
export const fxSweat = (p: Pen, u: number) => {
  for (const [a, r] of [[-150, 1], [-110, 0.8], [-60, 0.9], [-25, 1]] as const) {
    const d = 40 + 56 * u * r, x = 100 + d * Math.cos(rad(a)), y = 120 + d * Math.sin(rad(a)) + 30 * u * u;
    p.poly([[x, y - 14], [x + 9, y + 4], [x, y + 12], [x - 9, y + 4]], "#8ecbf7", 5);
  }
};
