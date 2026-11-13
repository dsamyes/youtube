// Painted textures for the hole short's own places (Canvas2D, cached, seams painted in as dark tints like the
// template's paint.ts): fence boards, soil, the shaft's rock mask, the Earth's surface and cut face, stars, the moon,
// washing, deck-chair canvas, the sea pipe.
import * as THREE from "three";
import { ctex, rng, jit, grassHD } from "./paint";

type G2 = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
const U = (r: () => number, a: number, b: number) => a + (b - a) * r();
const blot = (g: G2, x: number, y: number, rad: number, rgb: string, a: number, sx = 1) => {
  g.save(); g.translate(x, y); g.scale(sx, 1);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, rad);
  gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(-rad, -rad, rad * 2, rad * 2); g.restore();
};

/** garden fence: upright boards 0.2 m wide, 1024 px = 2 m along the fence x 512 px = full height; dark seams, nails */
export const fenceHD = () => ctex("fenceHD", 1024, 512, (g, r) => {
  const B = 1024 / 10;
  for (let i = 0; i < 10; i++) {
    const base = jit(r, "#c98f4e", 0.07, 3, 0.1);
    g.fillStyle = base; g.fillRect(i * B, 0, B, 512);
    for (let k = 0; k < 7; k++) { // grain along the board
      g.strokeStyle = r() < 0.5 ? "rgba(120,70,30,0.22)" : "rgba(255,225,170,0.2)"; g.lineWidth = U(r, 1.5, 3.5);
      const x = i * B + U(r, 10, B - 10); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + U(r, -8, 8), 170, x + U(r, -8, 8), 340, x + U(r, -5, 5), 512); g.stroke();
    }
    if (r() < 0.4) { const kx = i * B + U(r, 25, B - 25), ky = U(r, 120, 400); g.fillStyle = "rgba(110,62,26,0.55)"; g.beginPath(); g.ellipse(kx, ky, 7, 11, 0, 0, TAU); g.fill(); }
    g.fillStyle = "rgba(58,26,6,0.9)"; g.fillRect(i * B - 3, 0, 6, 512);                 // seam
    g.fillStyle = "rgba(255,232,190,0.35)"; g.fillRect(i * B + 3, 0, 3, 512);           // lit lip
    for (const y of [92, 400]) { g.fillStyle = "#3a2212"; g.beginPath(); g.arc(i * B + B / 2, y, 5, 0, TAU); g.fill(); g.fillStyle = "rgba(255,240,215,0.55)"; g.beginPath(); g.arc(i * B + B / 2 - 1.6, y - 1.6, 1.8, 0, TAU); g.fill(); }
  }
  const sh = g.createLinearGradient(0, 380, 0, 512); sh.addColorStop(0, "rgba(60,30,20,0)"); sh.addColorStop(1, "rgba(60,30,20,0.28)");
  g.fillStyle = sh; g.fillRect(0, 380, 1024, 132);                                       // darker toward the grass
});

/** dug soil: 512 px = 1.5 m, warm brown with clods and a few stones */
export const soilHD = () => ctex("soilHD", 512, 512, (g, r) => {
  g.fillStyle = "#8a5b3a"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 40; i++) blot(g, r() * 512, r() * 512, U(r, 30, 90), r() < 0.5 ? "112,70,42" : "160,110,72", 0.4);
  for (let i = 0; i < 90; i++) {
    const x = r() * 512, y = r() * 512, s = U(r, 6, 17);
    for (const ox of [-512, 0, 512]) for (const oy of [-512, 0, 512]) {
      g.fillStyle = "rgba(70,40,22,0.45)"; g.beginPath(); g.ellipse(x + ox + 2, y + oy + 3, s, s * 0.8, 0, 0, TAU); g.fill();
      g.fillStyle = r() < 0.15 ? "#b9b2a6" : jit(r, "#9a6a45", 0.12, 4, 0.1); g.beginPath(); g.ellipse(x + ox, y + oy, s, s * 0.8, 0, 0, TAU); g.fill();
    }
  }
});

/** inside of the garden hole: strata going down, fading to black (v = 1 at the lawn) */
export const pitHD = () => ctex("pitHD", 512, 1024, (g, r) => {
  const bands = ["#5d7a2e", "#7a5234", "#8a5e3c", "#74492e", "#8c6a4c", "#5e3d28", "#6f4a36", "#4a3226"];
  let y = 0;
  bands.forEach((c, i) => { const h = i === 0 ? 14 : U(r, 40, 110); g.fillStyle = c; g.fillRect(0, y, 512, h + 2); y += h; });
  g.fillStyle = "#3d2a20"; g.fillRect(0, y, 512, 1024 - y);
  for (let i = 0; i < 60; i++) { g.fillStyle = r() < 0.3 ? "rgba(190,180,165,0.8)" : "rgba(50,30,20,0.5)"; g.beginPath(); g.ellipse(r() * 512, 20 + r() * 500, U(r, 4, 12), U(r, 3, 8), 0, 0, TAU); g.fill(); }
  const sh = g.createLinearGradient(0, 0, 0, 1024); sh.addColorStop(0, "rgba(0,0,0,0)"); sh.addColorStop(0.1, "rgba(0,0,0,0.25)"); sh.addColorStop(0.55, "rgba(0,0,0,0.93)"); sh.addColorStop(1, "rgba(0,0,0,1)");
  g.fillStyle = sh; g.fillRect(0, 0, 512, 1024);
});

/** shaft wall mask, tileable 1024 x 1024 (data, NoColorSpace). The shader samples it twice:
 *  layer A (strata, slow in v): r = band value, g = jagged dark seams between bands + a few buried boulders;
 *  layer B (streaks, stretched along the fall): b = straight bright dashes and specks, also g for hairline cracks. */
export const rockMask = () => {
  const t = ctex("rockMask2", 1024, 1024, (g, r) => {
    const S = 1024;
    g.fillStyle = "rgb(0,0,0)"; g.fillRect(0, 0, S, S);
    g.globalCompositeOperation = "lighter";
    // strata: 9 bands with wobbling, stepped edges (tileable in x and y)
    const edges: number[] = []; let y = 0;
    while (y < S - 60) { edges.push(y); y += U(r, 70, 170); }
    const wob = edges.map(() => [U(r, 0, TAU), U(r, 0, TAU), U(r, 8, 20), Math.floor(U(r, 2, 5))]);
    const edgeY = (i: number, x: number) => { const w = wob[i % edges.length]; return edges[i % edges.length] + (i >= edges.length ? S : 0) + w[2] * Math.sin((x / S) * TAU * w[3] + w[0]) + 0.45 * w[2] * Math.sign(Math.sin((x / S) * TAU * (w[3] * 2 + 1) + w[1])); };
    for (let i = 0; i < edges.length; i++) {
      const v = Math.round(40 + 190 * ((i * 0.37 + r() * 0.3) % 1));
      for (const oy of [-S, 0]) {
        g.fillStyle = `rgb(${v},0,0)`; g.beginPath();
        for (let x = 0; x <= S; x += 8) g.lineTo(x, edgeY(i, x) + oy + (i === 0 ? S : 0) * 0);
        for (let x = S; x >= 0; x -= 8) g.lineTo(x, edgeY(i + 1, x) + oy);
        g.closePath(); g.fill();
        g.strokeStyle = "rgb(0,210,0)"; g.lineWidth = 7; g.beginPath();
        for (let x = 0; x <= S; x += 8) { const yy = edgeY(i, x) + oy; if (x) g.lineTo(x, yy); else g.moveTo(x, yy); }
        g.stroke();
      }
    }
    // buried boulders: angular, a little lighter, with a dark rim
    for (let i = 0; i < 16; i++) {
      const cx = U(r, 0, S), cy = U(r, 0, S), rad = U(r, 26, 60), n = 6 + Math.floor(r() * 3), pts: [number, number][] = [];
      for (let k = 0; k < n; k++) { const a2 = (k / n) * TAU + U(r, -0.25, 0.25), rr = rad * U(r, 0.7, 1.1); pts.push([rr * Math.cos(a2), rr * 0.5 * Math.sin(a2)]); }
      for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
        g.beginPath(); pts.forEach(([px, py], k) => (k ? g.lineTo(cx + ox + px, cy + oy + py) : g.moveTo(cx + ox + px, cy + oy + py))); g.closePath();
        g.fillStyle = "rgb(45,0,0)"; g.fill(); g.strokeStyle = "rgb(0,170,0)"; g.lineWidth = 5; g.stroke();
      }
    }
    // layer B: straight bright dashes + specks (b), hairline cracks (g, thin)
    g.lineCap = "round";
    for (let i = 0; i < 150; i++) {
      const x = U(r, 0, S), y0 = U(r, 0, S), len = U(r, 30, 260), w = r() < 0.15 ? U(r, 14, 30) : U(r, 3, 8), v = Math.round(w > 12 ? U(r, 60, 110) : U(r, 150, 255));
      g.strokeStyle = `rgb(0,0,${v})`; g.lineWidth = w;
      for (const oy of [-S, 0, S]) { g.beginPath(); g.moveTo(x, y0 + oy); g.lineTo(x, y0 + oy + len); g.stroke(); }
    }
    for (let i = 0; i < 260; i++) { g.fillStyle = "rgb(0,0,210)"; g.beginPath(); g.arc(U(r, 0, S), U(r, 0, S), U(r, 2, 5), 0, TAU); g.fill(); }
    g.globalCompositeOperation = "source-over";
  });
  t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4; t.needsUpdate = true;
  return t;
};

// ---------------- the Earth ----------------
/** cartoon Earth surface, equirectangular 2048 x 1024: flat ocean, green land blobs with a darker coast, ice caps */
export const earthSurface = () => ctex("earthSurface", 2048, 1024, (g, r) => {
  const W = 2048, H = 1024;
  const sea = g.createLinearGradient(0, 0, 0, H); sea.addColorStop(0, "#2f8fd8"); sea.addColorStop(0.5, "#2a7fd0"); sea.addColorStop(1, "#2a72c4");
  g.fillStyle = sea; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) blot(g, r() * W, U(r, 150, 870), U(r, 60, 180), "86,170,232", 0.3, 2);
  const land = (cx: number, cy: number, s: number, seed: number) => {
    const rr = rng(seed), n = 5 + Math.floor(rr() * 4), parts: [number, number, number, number][] = [];
    for (let i = 0; i < n; i++) parts.push([cx + (rr() - 0.5) * s * 1.6, cy + (rr() - 0.5) * s, s * (0.35 + rr() * 0.5), 0.6 + rr() * 0.5]);
    for (const [col, grow] of [["#2f7a3c", 9], ["#5fae4a", 0]] as const) for (const ox of [-W, 0, W]) {
      g.fillStyle = col; g.beginPath();
      for (const [x, y, rad, k] of parts) { g.moveTo(x + ox + rad + grow, y); g.ellipse(x + ox, y, rad + grow, (rad + grow) * k, 0, 0, TAU); }
      g.fill();
    }
    for (let i = 0; i < 4; i++) blot(g, cx + (rr() - 0.5) * s, cy + (rr() - 0.5) * s * 0.6, s * 0.3, i % 2 ? "150,200,90" : "214,190,120", 0.45);
  };
  const spots: [number, number, number][] = [[300, 330, 150], [470, 640, 110], [1000, 300, 170], [1090, 560, 130], [1500, 360, 190], [1700, 700, 90], [760, 420, 60], [1900, 450, 70], [120, 620, 60]];
  spots.forEach(([x, y, s], i) => land(x, y, s, i * 13 + 3));
  // the top of the globe is land (Gus's garden is up there), the bottom is open ocean (the far side)
  g.fillStyle = "#2f7a3c"; g.beginPath(); g.moveTo(0, 0); for (let x = 0; x <= W; x += 64) g.lineTo(x, 150 + 22 * Math.sin(x * 0.021) + 12 * Math.sin(x * 0.05)); g.lineTo(W, 0); g.closePath(); g.fill();
  g.fillStyle = "#5fae4a"; g.beginPath(); g.moveTo(0, 0); for (let x = 0; x <= W; x += 64) g.lineTo(x, 138 + 22 * Math.sin(x * 0.021) + 12 * Math.sin(x * 0.05)); g.lineTo(W, 0); g.closePath(); g.fill();
});

/** the cut face, one disc 1024 x 1024 (uv = 0.5 + 0.5 * p / R): crust, mantle, outer core, inner core as flat painted
 *  tones with soft inner modelling; the ink between them comes from the stepped geometry */
export const earthCut = (rm: number, ro: number, ri: number) => ctex("earthCut", 1024, 1024, (g, r) => {
  const C = 512, R = 512;
  const ring = (r0: number, r1: number, c0: string, c1: string) => {
    const gr = g.createRadialGradient(C, C, r0 * R, C, C, r1 * R); gr.addColorStop(0, c0); gr.addColorStop(1, c1);
    g.fillStyle = gr; g.beginPath(); g.arc(C, C, r1 * R + 1, 0, TAU); g.arc(C, C, Math.max(0, r0 * R - 1), 0, TAU, true); g.fill("evenodd");
  };
  ring(rm, 1.0, "#7a5236", "#5c3d28");            // crust (kept dark: it is thin)
  ring(ro, rm, "#f08a2c", "#d4421f");             // mantle: orange inside -> red outside
  ring(ri, ro, "#ffd23e", "#f9a02a");             // outer core
  ring(0, ri, "#fffbe6", "#ffe680");              // inner core
  // mantle: big soft convection sweeps
  g.save(); g.beginPath(); g.arc(C, C, rm * R, 0, TAU); g.arc(C, C, ro * R, 0, TAU, true); g.clip("evenodd");
  g.lineCap = "round";
  for (let i = 0; i < 26; i++) {
    const a = U(r, 0, TAU), rad = U(r, ro + 0.05, rm - 0.05) * R, len = U(r, 0.25, 0.7);
    g.strokeStyle = i % 2 ? "rgba(255,190,90,0.28)" : "rgba(150,30,20,0.25)"; g.lineWidth = U(r, 10, 26);
    g.beginPath(); g.arc(C, C, rad, a, a + len); g.stroke();
  }
  g.restore();
  // outer core: bright flecks
  g.save(); g.beginPath(); g.arc(C, C, ro * R, 0, TAU); g.arc(C, C, ri * R, 0, TAU, true); g.clip("evenodd");
  for (let i = 0; i < 30; i++) { const a = U(r, 0, TAU), rad = U(r, ri, ro) * R; g.fillStyle = "rgba(255,246,200,0.5)"; g.beginPath(); g.ellipse(C + rad * Math.cos(a), C + rad * Math.sin(a), U(r, 5, 14), U(r, 3, 6), a + 1.57, 0, TAU); g.fill(); }
  g.restore();
});

/** the moon: pale disc with a few flat craters and a soft rim (256 x 256, alpha) */
export const moonTex = () => ctex("moon", 256, 256, (g) => {
  g.clearRect(0, 0, 256, 256);
  g.fillStyle = "#f6f1dc"; g.beginPath(); g.arc(128, 128, 120, 0, TAU); g.fill();
  for (const [x, y, rad] of [[92, 88, 26], [150, 150, 34], [172, 82, 15], [84, 168, 17], [128, 110, 9], [196, 132, 10]] as const) {
    g.fillStyle = "#e0dac2"; g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill();
    g.strokeStyle = "rgba(190,184,160,0.9)"; g.lineWidth = 3; g.beginPath(); g.arc(x, y, rad, 3.6, 5.6); g.stroke();
  }
});

// ---------------- props ----------------
/** washing on the line: 0 Gus's spare pyjama top, 1 white sheet, 2 red checked towel, 3 pyjama trousers */
export const clothTex = (kind: number) => ctex("cloth" + kind, 256, 256, (g) => {
  const stripes = (bg: string, fg: string, n: number) => { g.fillStyle = bg; g.fillRect(0, 0, 256, 256); g.fillStyle = fg; for (let i = 0; i < n; i++) g.fillRect((i + 0.3) * (256 / n), 0, (256 / n) * 0.38, 256); };
  if (kind === 0 || kind === 3) stripes("#9cc7ee", "#3f73c4", 8);
  else if (kind === 1) { g.fillStyle = "#f6f3ea"; g.fillRect(0, 0, 256, 256); }
  else { g.fillStyle = "#f6f3ea"; g.fillRect(0, 0, 256, 256); g.fillStyle = "rgba(210,60,58,0.85)"; for (let i = 0; i < 8; i += 2) { g.fillRect(i * 32, 0, 32, 256); } g.fillStyle = "rgba(210,60,58,0.55)"; for (let i = 0; i < 8; i += 2) g.fillRect(0, i * 32, 256, 32); }
  for (let x = 0; x < 256; x++) { const s = Math.sin((x / 256) * TAU * 2.5); g.fillStyle = s > 0 ? `rgba(255,255,255,${0.1 * s})` : `rgba(40,50,90,${-0.12 * s})`; g.fillRect(x, 0, 1, 256); }
  g.fillStyle = "rgba(40,50,90,0.12)"; g.fillRect(0, 236, 256, 20);
});

/** deck-chair canvas: broad red / cream stripes along the sling */
export const slingTex = () => ctex("sling", 256, 256, (g) => {
  g.fillStyle = "#f3ead6"; g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#d8504a"; for (let i = 0; i < 4; i++) g.fillRect(i * 64 + 8, 0, 30, 256);
  g.fillStyle = "rgba(60,30,40,0.12)"; g.fillRect(0, 96, 256, 60);
});

/** the sea pipe: painted concrete-grey steel with weld bands, rust runs and a tide line (u around, v up; 1024 x 512) */
export const pipeHD = () => ctex("pipeHD", 1024, 512, (g, r) => {
  g.fillStyle = "#8f9aa6"; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 30; i++) blot(g, r() * 1024, r() * 512, U(r, 40, 110), r() < 0.5 ? "120,132,146" : "168,178,188", 0.4);
  for (const y of [120, 300]) { g.fillStyle = "rgba(60,66,80,0.6)"; g.fillRect(0, y, 1024, 7); g.fillStyle = "rgba(220,228,236,0.5)"; g.fillRect(0, y + 7, 1024, 4); }
  for (let i = 0; i < 16; i++) { const x = r() * 1024, y0 = U(r, 0, 300), len = U(r, 60, 200), w = U(r, 8, 22); const gr = g.createLinearGradient(0, y0, 0, y0 + len); gr.addColorStop(0, "rgba(168,84,40,0.75)"); gr.addColorStop(1, "rgba(168,84,40,0)"); g.fillStyle = gr; g.fillRect(x, y0, w, len); }
  for (let x = 0; x < 1024; x += 128) { g.fillStyle = "#4d5665"; g.beginPath(); g.arc(x + 64, 40, 10, 0, TAU); g.fill(); g.fillStyle = "rgba(230,236,244,0.6)"; g.beginPath(); g.arc(x + 61, 37, 3.5, 0, TAU); g.fill(); }
  const tide = g.createLinearGradient(0, 400, 0, 512); tide.addColorStop(0, "rgba(40,70,60,0)"); tide.addColorStop(0.35, "rgba(40,70,60,0.75)"); tide.addColorStop(1, "rgba(24,48,44,0.95)");
  g.fillStyle = tide; g.fillRect(0, 400, 1024, 112);
});

/** soft round glow (white, alpha falls off): lantern halo, core glow, atmosphere */
export const glowTex = () => ctex("glowSoft", 256, 256, (g) => {
  const im = g.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const u = Math.hypot(x - 127.5, y - 127.5) / 128, a = Math.max(0, 1 - u) ** 2.2;
    const i = (y * 256 + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = 255; im.data[i + 3] = Math.round(255 * a);
  }
  g.putImageData(im, 0, 0);
});

/** the garden lawn: the template's grass painting, pulled from lemon-lime toward the reference lawn green
 *  (on screen ~#7fc24a under the day light instead of ~#90d311) */
export const lawnHD = () => ctex("lawnHD", 1024, 1024, (g) => {
  g.drawImage(grassHD().image as HTMLCanvasElement, 0, 0);
  g.fillStyle = "rgba(96,158,120,0.42)"; g.fillRect(0, 0, 1024, 1024);
});
