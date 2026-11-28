// This video's own drawings (2D cards drawn with the kit's Pen on a canvas of the stated size, placed with fx()) and
// the 3D pool that is added to the kit's garden. No letters anywhere: only numbers on tags, marks and weights.
import * as THREE from "three";
import { Pen, INK, P2, toon, build, paint, NOINK } from "../../toon/kit";
import { PX0, PX1, PZ0, PZ1, RIM_W, RIM_H, WATER_Y } from "./story";

const { ellPts, rrect } = toon;
export const RED = "#e8452f", BLUE = "#2f8cf0", YELLOW = "#ffd22e", WATER = "#4fb2f0", WATER_D = "#2c7fd4", IRON = "#3a3f4c";

const numberOn = (p: Pen, text: string, x: number, y: number, size: number, fill = "#ffffff", ink = true) => {
  const g = p.g; g.font = `900 ${size}px "Arial Black", Arial, Helvetica, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineJoin = "round"; if (ink) { g.lineWidth = size * 0.16; g.strokeStyle = INK; g.strokeText(text, x, y); } g.fillStyle = fill; g.fillText(text, x, y);
};

// ---------------- the beach ball ----------------
/** outline of the ball: k = width as a fraction of full size (1 .. 0.6), the dents grow as it shrinks. 400 x 400, R 170 */
const ballPts = (k: number, sq = 0): P2[] => {
  const w = Math.min(1, (1 - k) / 0.37), pts: P2[] = [];
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const dent = w * (0.11 * Math.max(0, Math.sin(3 * a + 0.6)) ** 2 + 0.07 * Math.max(0, Math.sin(5 * a + 2.2)) ** 2 + 0.03 * Math.sin(9 * a));
    const r = 170 * k * (1 - dent);
    pts.push([200 + r * Math.cos(a) * (1 + 0.5 * sq), 200 + r * Math.sin(a) * (1 - 0.5 * sq)]);
  }
  return pts;
};
/** the striped beach ball, 400 x 400; k = width fraction, sq = squash 0..0.5 (pressed flat from above) */
export const fxBeach = (p: Pen, k: number, sq = 0) => {
  const c = ballPts(k, sq), R = 170 * k, cols = [RED, "#ffffff", YELLOW, "#ffffff", BLUE, "#ffffff"];
  p.poly(c, "#ffffff", 13);
  p.clip(c, () => {
    const px = 200 - 0.3 * R, py = 200 - 0.45 * R;                       // the pole the stripes run from
    for (let i = 0; i < 6; i++) { const a0 = (i / 6) * Math.PI * 2 + 0.3, a1 = a0 + Math.PI / 3; p.poly([[px, py], [px + 600 * Math.cos(a0), py + 600 * Math.sin(a0)], [px + 600 * Math.cos(a1), py + 600 * Math.sin(a1)]], cols[i], 0); }
    p.ell(200 + 0.45 * R, 200 + 0.5 * R, R * 0.9, R * 0.8, "rgba(20,30,90,0.16)", 0);
    p.ell(px, py, R * 0.13, R * 0.11, "#ffffff", 5);
    const w = Math.min(1, (1 - k) / 0.37);
    if (w > 0.15) for (const [a, l] of [[0.5, 0.5], [2.4, 0.42], [3.9, 0.5], [5.3, 0.36]] as P2[]) {     // wrinkles
      const x0 = 200 + R * 0.92 * Math.cos(a), y0 = 200 + R * 0.92 * Math.sin(a);
      p.stroke([[x0, y0], [200 + R * (0.92 - l * w) * Math.cos(a + 0.25), 200 + R * (0.92 - l * w) * Math.sin(a + 0.25)]], 6);
    }
  });
  p.poly(c, null, 13);
};
/** dashed ring: the ball's size at the surface, 400 x 400 */
export const fxRing = (p: Pen) => { for (let i = 0; i < 20; i++) { const a = i * 18; p.arc(200, 200, 182, 182, a, a + 10, 13); p.arc(200, 200, 182, 182, a + 1, a + 9, 6, "#ffffff"); } };
/** a basketball, 300 x 300 */
export const fxBasket = (p: Pen) => {
  const c = ellPts(150, 150, 128, 128);
  p.poly(c, "#f08a2c", 12);
  p.clip(c, () => { p.ell(196, 200, 120, 112, "rgba(120,40,0,0.22)", 0); p.stroke([[150, 10], [150, 290]], 8); p.stroke([[10, 150], [290, 150]], 8); p.arc(20, 150, 80, 120, -70, 70, 8); p.arc(280, 150, 80, 120, 110, 250, 8); });
  p.poly(c, null, 12);
};
/** the barbell, 640 x 300: a steel bar and two black plates with 100 on them */
export const fxBarbell = (p: Pen) => {
  p.poly(rrect(20, 136, 620, 164, 10), "#c9d2e2", 10);
  for (const x of [110, 530]) { const b = rrect(x - 62, 30, x + 62, 270, 34); p.poly(b, IRON, 13); p.clip(b, () => p.poly([[x + 10, 20], [x + 70, 20], [x + 70, 280], [x + 30, 280]], "#272a34", 0)); p.poly(b, null, 13); numberOn(p, "100", x, 150, 50, "#ffffff", false); }
  p.poly(rrect(30, 120, 56, 180, 6), "#aeb6c4", 8); p.poly(rrect(584, 120, 610, 180, 6), "#aeb6c4", 8);
};
/** a rope, vertical, 40 x 400 */
export const fxRope = (p: Pen) => { p.stroke([[20, 0], [20, 400]], 16); p.stroke([[20, 0], [20, 400]], 8, "#e6c98a"); for (let y = 12; y < 400; y += 26) p.stroke([[15, y], [25, y + 8]], 3, "#a8884a"); };
/** a bubble, 100 x 100 */
export const fxBubble = (p: Pen) => { p.ell(50, 50, 36, 36, "rgba(210,240,255,0.35)", 0); p.arc(50, 50, 36, 36, 0, 360, 6, "#e8f7ff"); p.arc(50, 50, 24, 24, 200, 260, 6, "#ffffff"); };
/** a white depth mark on the wall with a number, 360 x 200 */
export const fxMark = (p: Pen, text: string) => { p.poly(rrect(10, 14, 350, 186, 16), "#f4f8ff", 12); p.stroke([[10, 100], [70, 100]], 12, BLUE); p.stroke([[290, 100], [350, 100]], 12, BLUE); numberOn(p, text, 180, 104, 112, "#1f5fc0", false); };
/** a white tag with a red number, 360 x 260 (its point at 180, 252) */
export const fxNum = (p: Pen, text: string) => {
  p.poly([[180, 252], [146, 196], [24, 196], [24, 20], [336, 20], [336, 196], [214, 196]], "#ffffff", 12);
  numberOn(p, text, 180, 110, text.length > 2 ? 104 : 124, RED);
};

// ---------------- the garden ----------------
/** a dump truck heading left, heaped with dirt, 800 x 460 (wheels on y = 440) */
export const fxTruck = (p: Pen) => {
  p.poly([[300, 150], [360, 60], [470, 30], [600, 50], [690, 110], [740, 150]], "#8a5a34", 12);
  p.poly([[440, 60], [500, 44], [560, 70]], "#a8774a", 0);
  const bed: P2[] = [[270, 140], [770, 140], [740, 330], [290, 330]];
  p.poly(bed, "#f29a1f", 13); p.clip(bed, () => { p.poly([[260, 260], [780, 260], [780, 340], [260, 340]], "#cf7a12", 0); for (let x = 350; x < 760; x += 90) p.stroke([[x, 140], [x - 6, 330]], 7); }); p.poly(bed, null, 13);
  const cab: P2[] = [[60, 330], [60, 230], [110, 140], [250, 140], [250, 330]];
  p.poly(cab, "#f2b01f", 13); p.poly([[92, 226], [124, 164], [216, 164], [216, 226]], "#bfe6fb", 9);
  p.poly(rrect(30, 320, 770, 370, 10), "#4a4f5c", 11); p.poly(rrect(22, 330, 70, 366, 6), "#c9d2e2", 8);
  for (const x of [150, 520, 660]) { p.ell(x, 384, 58, 58, "#23252d", 12); p.ell(x, 384, 24, 24, "#c9d2e2", 7); }
};
/** a wall calendar, 400 x 460: 21 days, the first n crossed out */
export const fxCalendar = (p: Pen, n: number) => {
  p.poly(rrect(20, 30, 380, 440, 14), "#ffffff", 12); const top = rrect(20, 30, 380, 120, 14); p.poly(top, RED, 12);
  for (const x of [110, 290]) { p.poly(rrect(x - 12, 8, x + 12, 70, 8), "#c9d2e2", 8); }
  for (let i = 0; i < 21; i++) {
    const cx = 62 + (i % 7) * 46, cy = 176 + Math.floor(i / 7) * 86, b = rrect(cx - 18, cy - 30, cx + 18, cy + 30, 5);
    p.poly(b, "#e9eef6", 4);
    if (i < n) { p.stroke([[cx - 15, cy - 24], [cx + 15, cy + 24]], 9, RED); p.stroke([[cx + 15, cy - 24], [cx - 15, cy + 24]], 9, RED); }
  }
};
/** the garden hose in a hand, 500 x 420: the nozzle at (90, 90), water arcing down to the right, the hose trailing down */
export const fxHose = (p: Pen, ph: number) => {
  const hose: P2[] = []; for (let i = 0; i <= 20; i++) { const u = i / 20; hose.push([90 - 60 * Math.sin(u * 2.6), 96 + 320 * u]); }
  p.stroke(hose, 26); p.stroke(hose, 14, "#3fae4f");
  p.poly(rrect(70, 70, 150, 110, 8), "#f2b01f", 9);
  const arc: P2[] = []; for (let i = 0; i <= 16; i++) { const u = i / 16; arc.push([150 + 300 * u, 90 - 40 * u + 330 * u * u]); }
  p.stroke(arc, 22, "#ffffff"); p.stroke(arc, 14, WATER);
  for (let i = 0; i < 4; i++) { const u = ((i + ph) % 4) / 4; p.dot(150 + 300 * u, 90 - 40 * u + 330 * u * u, 8, "#ffffff"); }
};
/** a bucket full of water, 260 x 300 (handle top at 130, 20) */
export const fxBucket = (p: Pen) => {
  p.arc(130, 110, 96, 92, 180, 360, 9);
  const b: P2[] = [[30, 110], [230, 110], [200, 280], [60, 280]];
  p.poly(b, "#b9c2d2", 12); p.clip(b, () => { p.poly([[170, 100], [240, 100], [210, 290], [150, 290]], "#8f99ab", 0); p.stroke([[40, 170], [220, 170]], 7, "#7c8698"); }); p.poly(b, null, 12);
  p.ell(130, 110, 100, 24, WATER, 10); p.arc(120, 106, 50, 8, 190, 330, 5, "#ffffff");
};
/** a white plate, 420 x 110 */
export const fxPlate = (p: Pen) => { p.ell(210, 55, 196, 40, "#ffffff", 11); p.ell(210, 50, 140, 22, "#e3e8f0", 0); };
/** the duck swim ring from the front, 600 x 360: the ring's middle on y = 250, the duck's head at the left */
export const fxDuck = (p: Pen) => {
  p.ell(140, 120, 78, 74, YELLOW, 12); p.poly([[70, 118], [10, 132], [72, 150]], "#f08a2c", 10); p.dot(118, 100, 11);
  const r = ellPts(310, 250, 280, 92); p.poly(r, YELLOW, 13); p.clip(r, () => { p.ell(340, 290, 270, 70, "#e6ae12", 0); p.arc(300, 226, 230, 50, 200, 320, 8, "#fff3b0"); }); p.poly(r, null, 13);
};
/** a yellow ruler standing upright, 120 x 420 */
export const fxRuler = (p: Pen) => { p.poly(rrect(20, 10, 100, 410, 8), YELLOW, 11); for (let i = 0; i <= 10; i++) { const y = 30 + 36 * i; p.stroke([[24, y], [i % 5 ? 52 : 70, y]], i % 5 ? 5 : 8); } };

// ---------------- diagrams ----------------
/** a slab of the stack, 700 x 200: kind 0 = water (a wavy line), 1 = sky (a cloud) */
export const fxSlab = (p: Pen, kind: number) => {
  const b = rrect(14, 14, 686, 186, 30);
  p.poly(b, kind ? "#bfe3ff" : WATER, 13);
  p.clip(b, () => {
    p.poly([[0, 130], [700, 130], [700, 200], [0, 200]], kind ? "#9fd0f6" : WATER_D, 0);
    if (kind) { for (const [x, y, r] of [[300, 100, 44], [350, 84, 56], [410, 100, 46]] as const) p.ell(x, y, r, r * 0.8, "#ffffff", 8); p.ell(355, 104, 96, 30, "#ffffff", 0); }
    else { const w: P2[] = []; for (let x = 60; x <= 640; x += 20) w.push([x, 78 + 14 * Math.sin(x / 34)]); p.stroke(w, 10, "#ffffff"); }
  });
  p.poly(b, null, 13);
};
/** the scale's stand, 400 x 1000: pivot at (200, 60), foot on y = 980 */
export const fxStand = (p: Pen) => { p.poly([[40, 980], [100, 900], [300, 900], [360, 980]], "#8a5a34", 12); p.poly(rrect(178, 60, 222, 910, 8), "#b9824e", 12); p.ell(200, 60, 34, 34, YELLOW, 11); };
/** the beam, 1000 x 80 (pivot at its middle) */
export const fxBeam = (p: Pen) => { p.poly(rrect(20, 22, 980, 58, 14), "#b9824e", 12); p.ell(500, 40, 22, 22, YELLOW, 8); p.dot(40, 40, 10); p.dot(960, 40, 10); };
/** a pan on its three chains, 500 x 420: hook at (250, 10), the dish's top on y = 350 */
export const fxPan = (p: Pen) => { for (const x of [50, 450]) { p.stroke([[250, 10], [x, 352]], 9); p.stroke([[250, 10], [x, 352]], 3, "#c9d2e2"); } p.poly([[30, 350], [470, 350], [400, 408], [100, 408]], YELLOW, 12); p.poly([[30, 350], [470, 350], [462, 364], [38, 364]], "#e6ae12", 0); p.stroke([[30, 350], [470, 350]], 10); };
/** a block of water with a ruler along its left edge, 400 x 400 */
export const fxWBlock = (p: Pen) => {
  const b = rrect(70, 20, 380, 380, 14); p.poly(b, WATER, 13);
  p.clip(b, () => { p.poly([[280, 0], [400, 0], [400, 400], [250, 400]], WATER_D, 0); for (const y of [90, 190, 290]) { const w: P2[] = []; for (let x = 100; x <= 350; x += 16) w.push([x, y + 10 * Math.sin(x / 26 + y)]); p.stroke(w, 8, "#ffffff"); } });
  p.poly(b, null, 13);
  p.poly(rrect(14, 20, 62, 380, 6), YELLOW, 10); for (let i = 0; i <= 8; i++) p.stroke([[18, 40 + 40 * i], [i % 4 ? 38 : 50, 40 + 40 * i]], 5);
};
/** the column of air, 300 x 2400: pale sky with clouds at the bottom, dark blue higher, black with stars at the top */
export const fxAir = (p: Pen) => {
  const g = p.g, b = rrect(16, 16, 284, 2384, 20);
  p.poly(b, "#d9f0ff", 13);
  p.clip(b, () => {
    const gr = g.createLinearGradient(0, 2384, 0, 16);
    gr.addColorStop(0, "#d9f0ff"); gr.addColorStop(0.35, "#9fd0f6"); gr.addColorStop(0.62, "#3f6fd0"); gr.addColorStop(0.8, "#1a2466"); gr.addColorStop(1, "#05060f");
    g.fillStyle = gr; g.fillRect(0, 0, 300, 2400);
    for (const [x, y, s] of [[110, 2200, 1], [200, 1960, 0.8], [90, 1700, 0.7], [190, 1480, 0.55]] as const) { for (const [dx, r] of [[-40, 34], [0, 46], [42, 36]] as const) p.ell(x + dx * s, y, r * s, r * 0.8 * s, "#ffffff", 7 * s); p.ell(x, y + 12 * s, 76 * s, 24 * s, "#ffffff", 0); }
    for (let i = 0; i < 26; i++) { const x = 40 + ((i * 97) % 220), y = 40 + ((i * 173) % 520), r = 3 + (i % 3) * 2; p.dot(x, y, r, "#ffffff"); }
    for (const [x, y] of [[90, 130], [210, 300], [140, 470]] as P2[]) { p.poly([[x, y - 22], [x + 6, y - 6], [x + 22, y], [x + 6, y + 6], [x, y + 22], [x - 6, y + 6], [x - 22, y], [x - 6, y - 6]], "#fff6c0", 0); }
  });
  p.poly(b, null, 13);
};
/** a big iron weight with a 3 on it, 520 x 500 (its foot on y = 480) */
export const fxWeight = (p: Pen) => {
  p.arc(260, 96, 70, 64, 150, 390, 26); p.arc(260, 96, 70, 64, 150, 390, 10, "#6d7486");
  const b: P2[] = [[120, 130], [400, 130], [490, 480], [30, 480]];
  p.poly(b, IRON, 14); p.clip(b, () => { p.poly([[330, 120], [420, 120], [510, 490], [390, 490]], "#272a34", 0); p.stroke([[130, 160], [80, 440]], 10, "#5b6274"); }); p.poly(b, null, 14);
  numberOn(p, "3", 260, 320, 220, "#ffffff", false);
};
/** one floor tile lit up, seen from above, 300 x 300 (lies flat) */
export const fxTile = (p: Pen) => { p.poly(rrect(14, 14, 286, 286, 8), "rgba(255,214,46,0.55)", 0); p.g.strokeStyle = YELLOW; p.g.lineWidth = 22; p.g.strokeRect(20, 20, 260, 260); };
/** a small sweat drop, 80 x 120 */
export const fxDrop = (p: Pen) => p.poly([[40, 8], [66, 70], [56, 100], [40, 108], [24, 100], [14, 70]], "#8fd0f4", 8);

// ---------------- the pool in the garden (3D): a pale stone rim and very dark water ----------------
export const makePool = () => {
  const G = new THREE.Group(), V = build.V;
  const stone = build.lam("pl_rim", () => ({ color: "#ece6d6" }));
  const box = (a: THREE.Vector3, b: THREE.Vector3) => { const m = new THREE.Mesh(build.boxGeo(a, b, 0, true), stone); m.castShadow = true; m.receiveShadow = true; G.add(m); };
  box(V(PX0 - RIM_W, 0, PZ0 - RIM_W), V(PX1 + RIM_W, RIM_H, PZ0));
  box(V(PX0 - RIM_W, 0, PZ1), V(PX1 + RIM_W, RIM_H, PZ1 + RIM_W));
  box(V(PX0 - RIM_W, 0, PZ0), V(PX0, RIM_H, PZ1));
  box(V(PX1, 0, PZ0), V(PX1 + RIM_W, RIM_H, PZ1));
  const tex = paint.ctex("plWater", 512, 384, (g) => {
    const gr = g.createRadialGradient(256, 192, 20, 256, 192, 330);
    gr.addColorStop(0, "#04112e"); gr.addColorStop(0.55, "#0a2a66"); gr.addColorStop(0.85, "#1f6fd0"); gr.addColorStop(1, "#58b6f2");
    g.fillStyle = gr; g.fillRect(0, 0, 512, 384);
    g.strokeStyle = "rgba(255,255,255,0.75)"; g.lineWidth = 5; g.lineCap = "round";
    for (const [x, y, w] of [[90, 60, 60], [330, 40, 80], [420, 150, 50], [70, 230, 70], [250, 330, 90], [400, 300, 40], [180, 130, 40]]) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 8, x + w, y); g.stroke(); }
  });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(PX1 - PX0, PZ1 - PZ0).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: tex, fog: false }));
  water.position.set((PX0 + PX1) / 2, WATER_Y, (PZ0 + PZ1) / 2); water.layers.set(NOINK); G.add(water);
  return G;
};
