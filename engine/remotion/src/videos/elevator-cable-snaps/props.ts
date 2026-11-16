// This video's own drawings: 2D cards drawn with the kit's Pen on a canvas of the stated size and placed with fx().
import { Pen, INK, P2, toon } from "../../toon/kit";

const { rad, rrect, ellPts } = toon;
const STEEL = "#c3cad6", IRON = "#5d6678", RED = "#e0352c", ORANGE = "#ff8a1f", CREAM = "#e9e3d2", NAVY = "#39527f";

const numberOn = (p: Pen, text: string, x: number, y: number, size: number, col = "#ffffff") => {
  const g = p.g; g.font = `900 ${size}px "Arial Black", Arial, Helvetica, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineJoin = "round"; g.lineWidth = size * 0.18; g.strokeStyle = INK; g.strokeText(text, x, y); g.fillStyle = col; g.fillText(text, x, y);
};

// ---------------- the cutaway building, 350 x 1400: twenty floors, the lift shaft down the middle ----------------
export const BLD_TOP = 96, BLD_FLOOR = 62;            // y of the roof line, height of one floor (px)
export const fxBuilding = (p: Pen) => {
  p.poly([[20, BLD_TOP], [330, BLD_TOP], [330, 1386], [20, 1386]], "#f1c98a", 12);
  p.poly([[8, BLD_TOP - 30], [342, BLD_TOP - 30], [342, BLD_TOP + 6], [8, BLD_TOP + 6]], "#b9763a", 10);
  p.poly([[130, BLD_TOP - 76], [220, BLD_TOP - 76], [220, BLD_TOP - 30], [130, BLD_TOP - 30]], IRON, 9);   // machine room
  p.poly([[140, BLD_TOP + 6], [210, BLD_TOP + 6], [210, 1380], [140, 1380]], "#39405c", 8);                // the shaft
  for (let i = 0; i < 20; i++) {
    const y = BLD_TOP + 14 + i * BLD_FLOOR;
    for (const x of [40, 88, 228, 276]) p.poly(rrect(x, y + 8, x + 34, y + 44, 5), i % 3 === 1 && x === 88 ? "#fff3a0" : "#8ecbf7", 5);
    p.stroke([[20, y + BLD_FLOOR - 6], [140, y + BLD_FLOOR - 6]], 4, "#b9763a"); p.stroke([[210, y + BLD_FLOOR - 6], [330, y + BLD_FLOOR - 6]], 4, "#b9763a");
  }
  p.poly(rrect(152, 1330, 198, 1380, 4), "#7a4b2a", 6);
};
/** the tiny car in that shaft, 80 x 80 */
export const fxTinyCar = (p: Pen) => { p.poly(rrect(10, 10, 70, 70, 8), CREAM, 9); p.stroke([[40, 16], [40, 64]], 5); };

// ---------------- speedometer: dial (600 x 600, numbers 0..100) and needle (600 x 600, pointing up) ----------------
/** needle angle for a speed in mph, degrees clockwise from straight up */
export const dialAngle = (mph: number) => -120 + 2.4 * mph;
const onDial = (deg: number, r: number): P2 => [300 + r * Math.sin(rad(deg)), 300 - r * Math.cos(rad(deg))];
export const fxSpeedo = (p: Pen) => {
  p.ell(300, 300, 284, 284, "#39405c", 18);
  p.ell(300, 300, 244, 244, "#ffffff", 8);
  const bandOf = (a0: number, a1: number, col: string) => { const pts: P2[] = []; for (let a = a0; a <= a1; a += 4) pts.push(onDial(a, 236)); for (let a = a1; a >= a0; a -= 4) pts.push(onDial(a, 204)); p.poly(pts, col, 0); };
  bandOf(dialAngle(0), dialAngle(20), "#5fd07a"); bandOf(dialAngle(20), dialAngle(50), "#ffd84a"); bandOf(dialAngle(50), dialAngle(100), "#ff6b5e");
  for (let v = 0; v <= 100; v += 10) p.stroke([onDial(dialAngle(v), 238), onDial(dialAngle(v), v % 20 ? 214 : 196)], v % 20 ? 6 : 10);
  for (let v = 0; v <= 100; v += 20) { const [x, y] = onDial(dialAngle(v), 150); numberOn(p, String(v), x, y, 58, "#ffffff"); }
};
export const fxNeedle = (p: Pen) => { p.poly([[284, 316], [300, 78], [316, 316]], RED, 10); p.dot(300, 300, 36, INK); p.dot(300, 300, 23, STEEL); };

// ---------------- the governor diagram ----------------
/** the car as an icon between its two rails, 260 x 300 (rails are drawn apart): a box with a door and a roof bar */
export const fxCarIcon = (p: Pen, brake = false) => {
  p.poly(rrect(34, 40, 226, 280, 14), CREAM, 12);
  p.poly(rrect(70, 90, 190, 268, 6), "#e2a35c", 7); p.stroke([[130, 94], [130, 264]], 6);
  p.poly(rrect(20, 22, 240, 52, 6), IRON, 9);
  for (const x of [22, 238]) p.poly(rrect(x - 20, 252, x + 20, 296, 5), brake ? "#ffd84a" : ORANGE, 8);
};
/** two rails, 260 x 1500 */
export const fxRails = (p: Pen) => { for (const x of [22, 238]) p.line([[x, 10], [x, 1490]], STEEL, 12); };
/** the governor rope: a loop coming down from the wheel, 340 x 1500 (wheel centre at the top middle) */
export const fxLoop = (p: Pen) => { p.line([[26, 170], [26, 1490]], "#f1ede2", 9); p.line([[314, 170], [314, 1490]], "#f1ede2", 9); };
/** the wheel, 500 x 500, hub at the centre; k 0..1 = how far its two weights have flown out */
export const fxWheel = (p: Pen, k: number) => {
  p.ell(250, 250, 172, 172, "#8f9db8", 14); p.ell(250, 250, 138, 138, "#e7ecf5", 9);
  for (let a = 0; a < 180; a += 60) p.line([[250 + 138 * Math.cos(rad(a)), 250 + 138 * Math.sin(rad(a))], [250 - 138 * Math.cos(rad(a)), 250 - 138 * Math.sin(rad(a))]], "#8f9db8", 9);
  for (const s of [-1, 1]) {
    const r = 70 + 150 * k;
    p.line([[250 + s * 24, 250], [250 + s * (r - 30), 250]], "#3a4152", 7);                     // its arm (a spring holds it in)
    p.ell(250 + s * r, 250, 40, 34, RED, 9);
  }
  p.dot(250, 250, 30, INK); p.dot(250, 250, 18, STEEL);
};
/** the trip lever, 300 x 300, pivot at the centre, handle pointing up */
export const fxLever = (p: Pen) => { p.poly(rrect(134, 40, 166, 170, 12), "#ffd84a", 9); p.ell(150, 46, 30, 30, RED, 9); p.dot(150, 150, 24, INK); p.dot(150, 150, 13, STEEL); };

// ---------------- the wedge diagram, 900 x 1200 at 225 px per metre ----------------
/** background: the rail up the middle, the car's underside on top with a tapered jaw on each side of the rail */
export const fxWedgeBg = (p: Pen) => {
  p.poly([[40, 20], [860, 20], [860, 300], [40, 300]], CREAM, 14);                              // the car's underside
  p.poly([[40, 200], [860, 200], [860, 300], [40, 300]], IRON, 12);
  for (const s of [-1, 1]) {
    const X = (x: number) => 450 + s * x;
    // jaw: its inner face leans toward the rail going up (gap 60 px at the top, 210 px at the bottom)
    p.poly([[X(90), 300], [X(380), 300], [X(380), 900], [X(240), 900]], "#7d889e", 13);
    for (const y of [380, 560, 740]) p.dot(X(330), y, 12, "#4d5666");
  }
  p.poly([[420, 0], [480, 0], [480, 1200], [420, 1200]], STEEL, 12);                            // the rail
  p.stroke([[436, 10], [436, 1190]], 6, "#ffffff");
};
/** one wedge, 200 x 400: side = -1 left of the rail (vertical face on its right), +1 right of it */
export const fxWedge = (p: Pen, side: number) => {
  const X = (x: number) => (side < 0 ? 200 - x : x);
  p.poly([[X(14), 20], [X(96), 20], [X(186), 380], [X(14), 380]], ORANGE, 12);
  for (let y = 60; y < 370; y += 44) p.stroke([[X(22), y], [X(46), y + 12]], 7, "#b85a0c");       // teeth on the rail side
};

// ---------------- three things the wedges do not need, 300 x 300: a symbol in a red "no" ring ----------------
export const fxNo = (p: Pen, kind: number) => {
  p.ell(150, 150, 132, 132, "#ffffff", 0);
  if (kind === 0) {                                                                              // a power plug
    p.poly(rrect(104, 110, 196, 196, 16), "#3a4152", 8); p.poly(rrect(118, 62, 136, 114, 5), STEEL, 6); p.poly(rrect(164, 62, 182, 114, 5), STEEL, 6);
    p.line([[150, 196], [150, 244]], "#3a4152", 12);
  } else if (kind === 1) {                                                                       // a computer
    p.poly(rrect(74, 72, 226, 178, 10), "#3a4152", 8); p.poly(rrect(88, 86, 212, 164, 4), "#8ecbf7", 0);
    p.poly([[132, 178], [168, 178], [176, 210], [124, 210]], STEEL, 7); p.poly(rrect(96, 208, 204, 226, 6), STEEL, 7);
  } else {                                                                                       // a four-leaf clover
    p.line([[150, 150], [176, 236]], "#3f8f3a", 9);
    for (let a = 45; a < 360; a += 90) p.ell(150 + 44 * Math.cos(rad(a)), 144 + 44 * Math.sin(rad(a)), 40, 40, "#5fd07a", 7);
    p.dot(150, 144, 10, "#3f8f3a");
  }
  const g = p.g; g.lineCap = "butt";
  g.beginPath(); g.arc(150, 150, 126, 0, Math.PI * 2); g.lineWidth = 34; g.strokeStyle = INK; g.stroke();
  g.beginPath(); g.moveTo(62, 62); g.lineTo(238, 238); g.lineWidth = 34; g.stroke();
  g.beginPath(); g.arc(150, 150, 126, 0, Math.PI * 2); g.lineWidth = 22; g.strokeStyle = RED; g.stroke();
  g.beginPath(); g.moveTo(64, 64); g.lineTo(236, 236); g.lineWidth = 22; g.stroke();
};

// ---------------- the little red car in the garden, from its side, nose to the right: 1100 x 520 ----------------
/** layer 0 = everything behind the driver (far side, seat, windscreen, belt post); layer 1 = the near side and wheels */
export const fxAuto = (p: Pen, layer: number) => {
  const body: P2[] = [[40, 300], [70, 250], [330, 236], [700, 236], [760, 250], [1010, 268], [1064, 330], [1064, 420], [40, 420]];
  if (layer === 0) {
    p.poly(body, "#b82a24", 13);
    p.poly([[694, 240], [640, 96], [664, 90], [730, 240]], "#cfeaff", 9);                        // windscreen
    p.line([[600, 250], [640, 196]], "#3a4152", 12); p.ell(644, 190, 16, 42, "#3a4152", 8, 0, 360, 28);   // steering wheel
    p.poly(rrect(262, 60, 300, 300, 10), IRON, 10);                                              // belt post
    p.ell(281, 66, 34, 34, STEEL, 9); p.dot(281, 66, 10, INK);                                   // the reel
    p.poly(rrect(318, 110, 396, 320, 22), "#3a4152", 11); p.poly(rrect(326, 62, 388, 128, 18), "#3a4152", 10);   // seat back and headrest
  } else {
    p.poly(body, RED, 13);
    p.clip(body, () => p.poly([[40, 236], [1064, 236], [1064, 282], [40, 282]], "#ff5a4e", 0));
    p.poly(body, null, 13);
    p.stroke([[330, 250], [330, 410]], 6); p.stroke([[700, 250], [700, 410]], 6);                // the door
    p.poly(rrect(560, 300, 640, 322, 8), STEEL, 6);
    p.poly(rrect(1020, 300, 1062, 344, 10), "#ffe27a", 7); p.poly(rrect(40, 308, 66, 350, 8), "#ffb02e", 7);
    for (const x of [230, 860]) { p.dot(x, 420, 88, INK); p.dot(x, 420, 68, "#3a3f4b"); p.dot(x, 420, 30, STEEL); }
  }
};
/** the belt strap, 400 x 40: a grey band, stretched between two points by the card's size */
export const fxStrap = (p: Pen) => { p.poly([[4, 6], [396, 6], [396, 34], [4, 34]], "#59606e", 6); p.stroke([[10, 20], [390, 20]], 3, "#7c8798"); };
/** the belt's tongue in the hand, 100 x 100 */
export const fxTongue = (p: Pen) => { p.poly(rrect(18, 26, 82, 74, 10), STEEL, 8); p.poly(rrect(40, 40, 70, 60, 4), "#59606e", 0); };

// ---------------- shot 20: the car's old place and the five feet ----------------
/** dashed outline of the car, 440 x 500 */
export const fxGhost = (p: Pen) => {
  const g = p.g; g.setLineDash([34, 22]); g.lineWidth = 14; g.strokeStyle = "#fff3a0"; g.lineJoin = "round";
  g.strokeRect(12, 12, 416, 476); g.setLineDash([]);
};
/** a vertical double arrow, 160 x 600 */
export const fxDouble = (p: Pen) => p.poly([[80, 8], [150, 110], [106, 110], [106, 490], [150, 490], [80, 592], [10, 490], [54, 490], [54, 110], [10, 110]], "#ffd84a", 11);
/** a ring of sparks, 300 x 300, u 0..1 */
export const fxSparks = (p: Pen, u: number, seed = 0) => {
  for (let i = 0; i < 9; i++) {
    const a = rad(i * 40 + seed * 17 + 20 * Math.sin(i * 3.1)), r0 = 30 + 80 * u, r1 = r0 + 34 * (1 - u) + 8;
    p.line([[150 + r0 * Math.cos(a), 150 + r0 * Math.sin(a)], [150 + r1 * Math.cos(a), 150 + r1 * Math.sin(a)]], i % 2 ? "#ffd84a" : "#fff3b0", 9, false);
  }
};
export { ellPts, NAVY };
