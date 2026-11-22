// This video's own drawings: 2D cards drawn with the kit's Pen on a canvas of the stated size and placed with fx(),
// and Gus's spacesuit (a Look). No letters anywhere: numbers on rulers, dials and tags only.
import { Pen, INK, P2, toon, GUS, Look } from "../../toon/kit";
const { ellPts, rrect, curve } = toon;
export const RED = "#e8452f", BLUE = "#2f8cf0", GREEN = "#b5d84a", GREEN_D = "#7fa32c";
const STEEL = "#c9d2e2", IRON = "#4d5666", HULL = "#eef1f6", HULL_D = "#c3cbd9", ORANGE = "#f08a2c";

const numberOn = (p: Pen, text: string, x: number, y: number, size: number, fill = "#ffffff", ink = true) => {
  const g = p.g; g.font = `900 ${size}px "Arial Black", Arial, Helvetica, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  if (ink) { g.lineJoin = "round"; g.lineWidth = size * 0.16; g.strokeStyle = INK; g.strokeText(text, x, y); }
  g.fillStyle = fill; g.fillText(text, x, y);
};
const punch = (p: Pen, pts: P2[]) => { const g = p.g; g.save(); g.globalCompositeOperation = "destination-out"; p.path(pts, true); g.fillStyle = "#000"; g.fill(); g.restore(); };

// ---------------- Gus's spacesuit: the kit's Gus (fishbowl, red slippers) in a white suit with a chest box ----------------
export const GUS_SUIT: Look = {
  ...GUS, id: "gussuit", top: "#f1f3f7", limb: "#aab3c4", leg: "#aab3c4",
  deco: (p, g) => {
    const { u, HH, chin, tcx, torsoBot } = g;
    p.stroke([[tcx - 60 * u, torsoBot - 5 * u], [tcx + 60 * u, torsoBot - 5 * u]], 9 * u, ORANGE);
    p.stroke([[tcx - 60 * u, chin + 0.2 * HH], [tcx + 60 * u, chin + 0.2 * HH]], 6 * u, ORANGE);
    p.poly(rrect(tcx - 21 * u, chin + 0.34 * HH, tcx + 21 * u, chin + 0.74 * HH, 4 * u), "#d5dbe6", 2.2 * u);
    p.dot(tcx - 10 * u, chin + 0.46 * HH, 4.2 * u, INK); p.dot(tcx - 10 * u, chin + 0.46 * HH, 3 * u, RED);
    p.dot(tcx + 2 * u, chin + 0.46 * HH, 4.2 * u, INK); p.dot(tcx + 2 * u, chin + 0.46 * HH, 3 * u, "#ffd22e");
    p.dot(tcx + 13 * u, chin + 0.46 * HH, 4.2 * u, INK); p.dot(tcx + 13 * u, chin + 0.46 * HH, 3 * u, "#4fae5a");
    p.stroke([[tcx - 13 * u, chin + 0.63 * HH], [tcx + 13 * u, chin + 0.63 * HH]], 3 * u, IRON);
  },
};

// ---------------- the ship ----------------
/** canvas geometry of the hull card (1200 x 1200 = 6 x 6 m): hatch, rope ring, two windows */
export const HATCH_C: P2 = [330, 470], HATCH_R: P2 = [150, 235], RING_C: P2 = [470, 96], WIN_C: P2[] = [[720, 330], [1000, 330]], WIN_R = 118;
const hatchPts = () => ellPts(HATCH_C[0], HATCH_C[1], HATCH_R[0], HATCH_R[1]);
/** the white hull, running off the right and bottom edges; the hatch and the windows are holes */
export const fxHull = (p: Pen) => {
  const body: P2[] = [[70, 1200], ...ellPts(290, 350, 220, 220, 180, 270, 0, 16), [1200, 130], [1200, 1200]];
  p.arc(RING_C[0], RING_C[1], 30, 34, 0, 360, 22); p.arc(RING_C[0], RING_C[1], 30, 34, 0, 360, 9, STEEL);
  p.poly(body, HULL, 16);
  p.clip(body, () => {
    p.poly([[70, 980], [1200, 980], [1200, 1200], [70, 1200]], HULL_D, 0);
    p.poly([[70, 760], [1200, 760], [1200, 800], [70, 800]], ORANGE, 0);
    p.stroke([[70, 760], [1200, 760]], 7); p.stroke([[70, 800], [1200, 800]], 7);
    for (let x = 560; x < 1200; x += 160) p.stroke([[x, 560], [x, 760]], 5, HULL_D);
    p.stroke([[560, 560], [1200, 560]], 5, HULL_D);
    for (let i = 0; i < 9; i++) p.dot(120 + i * 130, 900, 9, HULL_D);
    for (let i = 0; i < 9; i++) p.dot(590 + i * 70, 180, 7, HULL_D);
  });
  p.poly(body, null, 16);
  // hatch frame and window frames, then the holes
  p.ell(HATCH_C[0], HATCH_C[1], HATCH_R[0] + 34, HATCH_R[1] + 34, STEEL, 13);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; p.dot(HATCH_C[0] + (HATCH_R[0] + 17) * Math.cos(a), HATCH_C[1] + (HATCH_R[1] + 17) * Math.sin(a), 6, IRON); }
  for (const [x, y] of WIN_C) p.ell(x, y, WIN_R + 26, WIN_R + 26, STEEL, 12);
  punch(p, hatchPts()); for (const [x, y] of WIN_C) punch(p, ellPts(x, y, WIN_R, WIN_R));
  p.poly(hatchPts(), null, 12); for (const [x, y] of WIN_C) p.ell(x, y, WIN_R, WIN_R, null, 11);
  for (const [x, y] of WIN_C) p.arc(x, y, WIN_R - 16, WIN_R - 16, 205, 250, 9, "rgba(255,255,255,0.75)");
};
/** what shows through the holes: the lit inside, 300 x 300 */
export const fxInside = (p: Pen) => {
  const g = p.g, gr = g.createLinearGradient(0, 0, 0, 300); gr.addColorStop(0, "#ffd98a"); gr.addColorStop(1, "#e89a4e");
  g.fillStyle = gr; g.beginPath(); g.ellipse(150, 150, 148, 148, 0, 0, Math.PI * 2); g.fill();
};
/** the hatch cover, 400 x 580 */
export const fxDoor = (p: Pen) => {
  p.ell(200, 290, 176, 262, STEEL, 13); p.ell(200, 290, 120, 190, HULL_D, 9);
  p.arc(200, 290, 52, 52, 0, 360, 26); p.arc(200, 290, 52, 52, 0, 360, 12, "#ffd22e");
  for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + 0.4; p.stroke([[200, 290], [200 + 52 * Math.cos(a), 290 + 52 * Math.sin(a)]], 9); }
};
/** the inside wall of the ship for the last shot, 800 x 1000 */
export const fxWall = (p: Pen) => {
  const g = p.g, gr = g.createLinearGradient(0, 0, 0, 1000); gr.addColorStop(0, "#f3d9a4"); gr.addColorStop(1, "#d99a5c");
  g.fillStyle = gr; g.fillRect(0, 0, 800, 1000);
  for (let x = 0; x <= 800; x += 200) p.stroke([[x, 0], [x, 1000]], 7, "#b97a42");
  for (let y = 100; y <= 1000; y += 300) p.stroke([[0, y], [800, y]], 7, "#b97a42");
  for (let x = 100; x < 800; x += 200) for (let y = 250; y < 1000; y += 300) p.dot(x, y, 10, "#b97a42");
  p.ell(600, 330, 96, 96, STEEL, 11); p.ell(600, 330, 72, 72, "#16203c", 8);
  for (const [x, y] of [[575, 310], [630, 350], [610, 290]] as const) p.dot(x, y, 4, "#ffffff");
};
/** the Earth's curve, 1200 x 600: ocean, a little cloud, a thin blue rim of air */
export const fxEarth = (p: Pen) => {
  const disc = ellPts(600, 1560, 1500, 1500, 180, 360, 0, 90);
  p.poly(ellPts(600, 1560, 1524, 1524, 180, 360, 0, 90), "rgba(120,190,255,0.45)", 0);
  p.poly(disc, "#2a78d6", 0);
  p.clip(disc, () => {
    p.ell(300, 420, 330, 150, "#3f93e6", 0); p.ell(900, 520, 380, 130, "#3f93e6", 0);
    p.poly([[760, 150], [900, 120], [1010, 170], [1060, 260], [960, 330], [840, 300], [770, 230]], "#5fae57", 0);
    p.poly([[110, 300], [220, 250], [300, 310], [240, 400], [130, 380]], "#5fae57", 0);
    for (const [x, y, w] of [[430, 180, 170], [560, 300, 220], [200, 520, 200], [1000, 430, 180], [700, 470, 150]] as const) { p.ell(x, y, w, 26, "rgba(255,255,255,0.9)", 0); p.ell(x + 60, y - 22, w * 0.5, 22, "rgba(255,255,255,0.9)", 0); }
  });
};
/** a small glint, drawn by the kit's sparkle; nothing here */

// ---------------- rope, ruler, thought bubble, the green puff ----------------
/** the safety rope, 200 x 800: from the top middle down to a hook at the bottom; slack 0..1 makes it wavy */
export const fxRope = (p: Pen, slack: number) => {
  const pts: P2[] = []; for (let i = 0; i <= 30; i++) { const t = i / 30; pts.push([100 + 70 * slack * Math.sin(t * 9) * Math.sin(t * Math.PI), 16 + 690 * t]); }
  p.stroke(pts, 15); p.stroke(pts, 7, ORANGE);
  p.arc(100, 744, 26, 36, 300, 610, 22); p.arc(100, 744, 26, 36, 300, 610, 9, STEEL);
};
/** the hook alone, 160 x 200 */
export const fxHook = (p: Pen) => { p.arc(80, 100, 40, 56, 300, 610, 30); p.arc(80, 100, 40, 56, 300, 610, 13, STEEL); };
/** dashed measuring line with end bars, 160 x 800 (runs from y 30 to y 770) */
export const fxDash = (p: Pen) => {
  for (let y = 30; y < 770; y += 62) p.stroke([[80, y], [80, Math.min(770, y + 34)]], 13, "#ffffff");
  for (const y of [30, 770]) p.stroke([[30, y], [130, y]], 13, "#ffffff");
};
/** white tag with a number, 300 x 200 */
export const fxNum = (p: Pen, text: string, col = RED) => { p.poly(rrect(16, 16, 284, 184, 30), "#ffffff", 12); numberOn(p, text, 150, 104, text.length > 4 ? 78 : text.length > 2 ? 100 : 120, col, false); };
/** the green puff, 300 x 220 */
export const fxPuff = (p: Pen, fade = 1) => {
  const g = p.g; g.save(); g.globalAlpha = fade;
  const L: [number, number, number][] = [[100, 120, 62], [170, 96, 70], [222, 132, 52], [150, 146, 58]];
  for (const [x, y, r] of L) p.dot(x, y, r + 9, INK);
  for (const [x, y, r] of L) p.dot(x, y, r, GREEN);
  p.arc(150, 120, 38, 26, 30, 150, 7, GREEN_D); p.arc(205, 118, 20, 14, 200, 330, 6, GREEN_D);
  g.restore();
};
/** a rocket, 300 x 700, nose up; flame 0 = none, 1 / 2 = two flicker shapes */
export const fxRocket = (p: Pen, flame = 0) => {
  if (flame) { const k = flame === 1 ? 1 : 0.8; p.poly([[104, 470], [150, 470 + 220 * k], [196, 470]], "#ffb52e", 11); p.poly([[126, 470], [150, 470 + 120 * k], [174, 470]], "#fff3b0", 0); }
  for (const s of [-1, 1]) p.poly([[150 + s * 62, 330], [150 + s * 128, 470], [150 + s * 62, 440]], RED, 11);
  const body: P2[] = [...curve([84, 440], [70, 180], [150, 30], 14), ...curve([150, 30], [230, 180], [216, 440], 14)];
  p.poly(body, "#f1f3f7", 12);
  p.clip(body, () => { p.poly([[60, 30], [240, 30], [240, 150], [60, 150]], RED, 0); p.poly([[176, 30], [240, 30], [240, 440], [196, 440]], "rgba(60,70,110,0.16)", 0); });
  p.poly(body, null, 12);
  p.ell(150, 250, 34, 34, "#7cc4f5", 10);
  p.poly([[96, 440], [204, 440], [190, 474], [110, 474]], IRON, 10);
};
/** thought bubble, 500 x 440: kind 0 = a rocket inside, 1 = the green puff */
export const fxBubble = (p: Pen, kind: number) => {
  for (const [x, y, r] of [[70, 400, 16], [112, 350, 26]] as const) { p.dot(x, y, r + 8, INK); p.dot(x, y, r, "#ffffff"); }
  const L: [number, number, number][] = [[170, 190, 120], [300, 150, 130], [390, 220, 100], [260, 250, 120]];
  for (const [x, y, r] of L) p.dot(x, y, r + 10, INK);
  for (const [x, y, r] of L) p.dot(x, y, r, "#ffffff");
  const g = p.g; g.save();
  if (kind === 0) { g.translate(290, 190); g.rotate(0.6); g.scale(0.42, 0.42); g.translate(-150, -300); fxRocket(p, 1); }
  else { g.translate(275, 195); g.scale(0.85, 0.85); g.translate(-150, -120); fxPuff(p); }
  g.restore();
};

// ---------------- small things held or thrown ----------------
/** radio handset, 140 x 240 */
export const fxHandset = (p: Pen) => { p.stroke([[96, 60], [104, 8]], 12); p.poly(rrect(30, 50, 110, 226, 16), IRON, 11); p.poly(rrect(46, 70, 94, 120, 6), "#9fe3a8", 6); for (let i = 0; i < 3; i++) p.stroke([[50, 146 + i * 22], [90, 146 + i * 22]], 7, "#232936"); };
/** a tin of beans, 220 x 300: full = open and heaped, else closed (no label text: a bean on it) */
export const fxCan = (p: Pen, full = false) => {
  if (full) { for (const [x, y] of [[70, 62], [110, 44], [150, 60], [92, 76], [132, 78]] as const) p.ell(x, y, 26, 18, "#c9642c", 8, 0, 360, 0.4); }
  p.poly(rrect(34, 70, 186, 280, 12), STEEL, 11);
  p.poly([[34, 120], [186, 120], [186, 236], [34, 236]], RED, 8);
  p.ell(110, 178, 36, 24, "#f2a65e", 7, 0, 360, -0.4); p.arc(104, 174, 16, 9, 200, 330, 5, "#a8572a");
  p.ell(110, 72, 76, 15, full ? "#8a4a22" : "#e3e8f0", 9);
};
/** Gus's red slipper from the side, 300 x 170, toe to the right */
export const fxSlipper = (p: Pen) => {
  const s: P2[] = [[24, 130], ...curve([24, 130], [20, 70], [90, 78], 8), ...curve([90, 78], [150, 30], [230, 56], 10), ...curve([230, 56], [292, 80], [276, 132], 8), [276, 146], [24, 146]];
  p.poly(s, "#e23b32", 12);
  p.clip(s, () => p.poly([[0, 128], [300, 128], [300, 170], [0, 170]], "#f4e3c0", 0));
  p.poly(s, null, 12); p.ell(196, 62, 22, 18, "#ffffff", 8);
};
/** a speed streak, 400 x 40 */
export const fxStreak = (p: Pen) => p.poly([[6, 20], [394, 10], [394, 30]], "rgba(255,255,255,0.85)", 0);
/** skateboard from the side, 520 x 150 */
export const fxSkate = (p: Pen) => {
  for (const x of [120, 400]) { p.dot(x, 108, 32, INK); p.dot(x, 108, 21, "#ffd22e"); p.dot(x, 108, 7, INK); }
  p.poly([[20, 40], ...curve([20, 40], [40, 66], [90, 66], 6), [430, 66], ...curve([430, 66], [480, 66], [500, 40], 6), [506, 54], ...curve([506, 54], [484, 84], [430, 84], 6), [90, 84], ...curve([90, 84], [36, 84], [14, 54], 6)], BLUE, 11);
};
/** a fat backpack, 320 x 360 */
export const fxPack = (p: Pen) => {
  p.arc(160, 70, 54, 50, 180, 360, 26); p.arc(160, 70, 54, 50, 180, 360, 11, "#8f2a22");
  const b = rrect(30, 70, 290, 344, 70); p.poly(b, "#d8392f", 13);
  p.clip(b, () => p.poly([[210, 60], [300, 60], [300, 350], [236, 350]], "rgba(70,10,10,0.2)", 0)); p.poly(b, null, 13);
  p.poly(rrect(84, 196, 236, 300, 20), "#b52a22", 10); p.stroke([[100, 150], [220, 150]], 9, "#7c1f18"); p.poly(rrect(144, 232, 176, 262, 5), STEEL, 6);
};

// ---------------- instruments ----------------
/** magnifying glass, 800 x 900: in the lens one upright hair and the toe of the slipper crossing its width; t 0..1 */
export const fxLens = (p: Pen, t: number) => {
  p.stroke([[560, 600], [730, 840]], 70); p.stroke([[560, 600], [730, 840]], 44, "#8a5a2c");
  const glass = ellPts(380, 380, 330, 330);
  p.poly(glass, "#dff1ff", 0);
  p.clip(glass, () => {
    p.poly([[348, 0], [412, 0], [412, 800], [348, 800]], "#5a3b2a", 9);
    for (let y = 60; y < 800; y += 110) p.stroke([[352, y], [408, y + 30]], 5, "#3a2418");
    const g = p.g; g.save(); g.translate(-196 + 64 * t, 300); g.scale(1.75, 1.75); fxSlipper(p); g.restore();
    for (const x of [348, 412]) { for (let y = 20; y < 300; y += 44) p.stroke([[x, y], [x, y + 22]], 6, RED); }
    p.poly([[230, 80], [300, 60], [240, 250], [170, 270]], "rgba(255,255,255,0.4)", 0);
  });
  p.arc(380, 380, 330, 330, 0, 360, 44); p.arc(380, 380, 330, 330, 0, 360, 22, STEEL);
};
/** calendar sheet, 600 x 680: four weeks of seven boxes, the first n crossed out */
export const fxCalendar = (p: Pen, n: number) => {
  p.poly(rrect(20, 40, 580, 660, 20), "#ffffff", 13); p.poly([[20, 140], [580, 140], [580, 60], ...curve([580, 60], [580, 40], [560, 40], 4), [40, 40], ...curve([40, 40], [20, 40], [20, 60], 4)], RED, 13);
  for (const x of [150, 450]) { p.stroke([[x, 16], [x, 80]], 26); p.stroke([[x, 16], [x, 80]], 10, STEEL); }
  for (let r = 0; r < 4; r++) for (let d = 0; d < 7; d++) {
    const x = 52 + d * 72, y = 176 + r * 118, i = r * 7 + d;
    p.poly(rrect(x, y, x + 60, y + 96, 8), i >= 21 ? "#fbe9e6" : "#eef1f6", 5);
    if (i < n) { p.stroke([[x + 10, y + 16], [x + 50, y + 80]], 11, RED); p.stroke([[x + 50, y + 16], [x + 10, y + 80]], 11, RED); }
  }
};
/** round dial, 420 x 420: a scale from lower left over the top to lower right, the last part red if `red`; text under the hub */
export const fxDial = (p: Pen, text: string, red = false) => {
  p.ell(210, 210, 196, 196, STEEL, 13); p.ell(210, 210, 160, 160, "#ffffff", 9);
  if (red) p.arc(210, 210, 134, 134, 135, 190, 26, RED);
  for (let i = 0; i <= 8; i++) { const a = ((135 + i * 33.75) * Math.PI) / 180; p.stroke([[210 + 118 * Math.cos(a), 210 + 118 * Math.sin(a)], [210 + 148 * Math.cos(a), 210 + 148 * Math.sin(a)]], 8); }
  numberOn(p, text, 210, 308, text.length > 2 ? 68 : 84, INK, false);
};
/** its needle, 420 x 420, pointing up; turn it with rot */
export const fxNeedle = (p: Pen) => { p.poly([[196, 222], [210, 76], [224, 222]], RED, 8); p.dot(210, 210, 22, INK); p.dot(210, 210, 10, STEEL); };
/** warning lamp, 120 x 120 */
export const fxLamp = (p: Pen, on: boolean) => { p.dot(60, 60, 48, INK); p.dot(60, 60, 36, on ? "#ff4a36" : "#7a2a24"); if (on) p.arc(60, 60, 22, 22, 200, 260, 7, "#ffd0c8"); };
/** iron weight, 420 x 400; text may be empty */
export const fxWeight = (p: Pen, text = "") => {
  p.arc(210, 96, 60, 54, 180, 360, 48, INK); p.arc(210, 96, 60, 54, 180, 360, 26, "#7c8798");
  const body: P2[] = [[96, 104], [324, 104], [400, 380], [20, 380]];
  p.poly(body, IRON, 14); p.clip(body, () => p.poly([[70, 104], [130, 104], [80, 380], [10, 380]], "#6b7688", 0)); p.poly(body, null, 14);
  if (text) numberOn(p, text, 210, 252, 150);
};
/** a sign, 200 x 200: 0 = multiplication cross, 1 = equals */
export const fxSign = (p: Pen, kind: number) => {
  const L: [P2, P2][] = kind === 0 ? [[[44, 44], [156, 156]], [[156, 44], [44, 156]]] : [[[36, 70], [164, 70]], [[36, 130], [164, 130]]];
  for (const l of L) p.stroke(l, 44); for (const l of L) p.stroke(l, 24, "#ffffff");
};
/** kitchen scale, 520 x 440: a pan on a body with a read-out; text "" = blank */
export const fxKScale = (p: Pen, text: string) => {
  p.poly([[40, 60], [480, 60], [440, 110], [80, 110]], STEEL, 12); p.poly(rrect(226, 108, 294, 170, 4), IRON, 10);
  p.poly(rrect(60, 168, 460, 420, 30), "#f1f3f7", 13);
  p.poly(rrect(130, 220, 390, 360, 14), "#203322", 10);
  if (text) numberOn(p, text, 260, 294, 104, "#8dff7a", false);
};
/** ruler marked 0 to 10, 1300 x 220: mark 0 at x 90, mark 10 at x 1210 */
export const fxRuler = (p: Pen) => {
  p.poly(rrect(14, 30, 1286, 206, 14), "#f3d27a", 12);
  for (let i = 0; i <= 20; i++) { const x = 90 + 56 * i; p.stroke([[x, 36], [x, i % 2 ? 66 : 96]], i % 2 ? 5 : 8); }
  numberOn(p, "0", 90, 152, 72, INK, false); numberOn(p, "10", 1196, 152, 72, INK, false);
};
/** bathroom scale seen from the front, 760 x 300: a low box with a window; text "" = blurred while it spins */
export const fxBScale = (p: Pen, text: string) => {
  p.poly(rrect(20, 60, 740, 280, 40), "#8fd0c8", 14); p.poly(rrect(20, 60, 740, 120, 30), "#b9e6df", 10);
  p.poly(rrect(250, 140, 510, 262, 16), "#ffffff", 11);
  if (text) numberOn(p, text, 380, 204, 96, INK, false); else for (let i = 0; i < 5; i++) p.stroke([[280 + i * 50, 170], [270 + i * 50, 236]], 12, "#9aa3b5");
  p.poly([[372, 140], [388, 140], [380, 160]], RED, 5);
};
/** blueprint board, 800 x 800 */
export const fxBoard = (p: Pen) => {
  const g = p.g; g.fillStyle = "#1f3f7a"; g.fillRect(0, 0, 800, 800);
  for (let i = 0; i <= 40; i++) { g.fillStyle = i % 5 ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.16)"; g.fillRect(i * 20 - 1, 0, 2, 800); g.fillRect(0, i * 20 - 1, 800, 2); }
};
/** a lump of hot gas, 120 x 120 */
export const fxLump = (p: Pen) => { p.dot(60, 60, 48, INK); p.dot(60, 60, 38, "#ffb52e"); p.dot(52, 52, 16, "#fff3b0"); };
/** the haze inside the fishbowl, 400 x 400 (the bowl is the circle of radius 190 at the centre); level 0..1 from the bottom */
export const fxHaze = (p: Pen, level: number) => {
  const bowl = ellPts(200, 200, 186, 186), top = 386 - 372 * level;
  p.clip(bowl, () => {
    const pts: P2[] = [[0, 400], [0, top]]; for (let i = 0; i <= 10; i++) pts.push([i * 40, top + 14 * Math.sin(i * 1.9 + level * 9)]); pts.push([400, 400]);
    p.poly(pts, "rgba(150,200,40,0.55)", 0);
    for (let i = 0; i < 6; i++) { const y = top + 40 + i * 62; if (y < 380) p.arc(120 + ((i * 97) % 170), y, 46, 20, 190, 350, 8, "rgba(120,160,40,0.55)"); }
  });
};
