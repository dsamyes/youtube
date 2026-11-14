// This video's own places. "cabin": the inside of an airliner by day, built from boxes with the kit's two-tone
// materials (so it takes the ink lines): the door wall with the exit door (red handle), the lavatory door beside it,
// eight rows of seats with windows and overhead bins. The south side of the cross-aisle is open: the lens stands
// there. "sky": nothing but the kit's sky (the airliner and the diagrams are cards, staging.ts) and, for the landing,
// a runway.
import * as THREE from "three";
import { build, paint, NOINK, PlaceFactory, PlaceCtx } from "../../toon/kit";
import { WALL_Z, DOOR_X, DOOR_W, DOOR_H, LAV_X, LAV_W, LAV_H, ROW0, ROW_D, ROWS, SEAT_Z, GRID_C, GRID_R, SQ, SQ0, sqPos, LATCH, CabinParams, SkyParams } from "./story";

const V = build.V;
const M = (k: string, color: string) => build.lam("pd_" + k, () => ({ color }));
const basic = (color: string) => new THREE.MeshBasicMaterial({ color, fog: false });

/** yellow squares with dark edges: n in a row */
const squaresTex = (n: number) => paint.ctex(`pdSquares${n}`, 64 * n, 64, (g) => {
  g.clearRect(0, 0, 64 * n, 64);
  for (let i = 0; i < n; i++) { g.fillStyle = "rgba(255,206,40,0.78)"; g.fillRect(i * 64 + 3, 3, 58, 58); g.strokeStyle = "rgba(60,36,10,0.95)"; g.lineWidth = 6; g.strokeRect(i * 64 + 3, 3, 58, 58); }
});
/** the lavatory sign: two little figures on a blue plate (no letters) */
const signTex = () => paint.ctex("pdLavSign", 128, 128, (g) => {
  g.fillStyle = "#2f67c8"; g.fillRect(0, 0, 128, 128);
  g.fillStyle = "#ffffff";
  for (const [x, skirt] of [[40, false], [88, true]] as const) {
    g.beginPath(); g.arc(x, 30, 11, 0, Math.PI * 2); g.fill();
    g.beginPath();
    if (skirt) { g.moveTo(x - 6, 46); g.lineTo(x + 6, 46); g.lineTo(x + 20, 88); g.lineTo(x - 20, 88); } else { g.rect(x - 13, 46, 26, 42); }
    g.closePath(); g.fill();
    g.fillRect(x - 11, 88, 8, 26); g.fillRect(x + 3, 88, 8, 26);
  }
  g.fillRect(62, 14, 4, 100);
});
/** the green exit sign: a white arrow (no letters) */
const exitTex = () => paint.ctex("pdExitSign", 192, 80, (g) => {
  g.fillStyle = "#1fa64f"; g.fillRect(0, 0, 192, 80);
  g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(40, 30); g.lineTo(112, 30); g.lineTo(112, 14); g.lineTo(156, 40); g.lineTo(112, 66); g.lineTo(112, 50); g.lineTo(40, 50); g.closePath(); g.fill();
});

export const cabin: PlaceFactory = () => {
  const G = new THREE.Group();
  const box = (a: THREE.Vector3, b: THREE.Vector3, mat: THREE.Material, parent: THREE.Object3D = G) => { const m = new THREE.Mesh(build.boxGeo(a, b, 0, true), mat); parent.add(m); return m; };
  const wall = M("wall", "#ece8dc"), dado = M("dado", "#b4c3dc"), carpet = M("carpet", "#3d5aa6"), ceil = M("ceil", "#f6f3ea"), frame = M("frame", "#8e98ac");
  const doorM = M("door", "#dfe4ec"), red = M("red", "#e0352c"), steel = M("steel", "#9aa3b2"), lavM = M("lav", "#ecd9b2"), seat = M("seat", "#3f72d6"), seatD = M("seatD", "#2c55aa"), cover = M("cover", "#f3eee0");
  const bins = M("bins", "#f1eee6"), curtain = M("curtain", "#6b83c4"), glass = basic("#8ecbf7"), glassHi = basic("#d9f0ff");
  const z0 = WALL_Z;
  // ---- shell ----
  box(V(-7, -0.2, z0 - 0.2), V(12, 0, 4.5), carpet);
  box(V(-7, 0, z0 - 0.2), V(12, 2.45, z0), wall);
  box(V(-7, 0, z0), V(12, 0.9, z0 + 0.02), dado);
  box(V(-7, 0.9, z0), V(12, 0.96, z0 + 0.035), frame);
  box(V(-7, 2.4, z0 - 0.2), V(12, 2.6, 4.5), ceil);
  box(V(ROW0 - 0.5, 0, 1.9), V(12, 2.45, 2.1), wall);                                   // south wall, seat zone only
  box(V(ROW0 - 0.5, 0, 1.88), V(12, 0.9, 1.9), dado);
  box(V(ROW0 + ROWS * ROW_D + 0.1, 0, z0), V(ROW0 + ROWS * ROW_D + 0.2, 2.45, 1.9), curtain);   // far bulkhead
  // ---- the exit door ----
  const dx0 = DOOR_X - DOOR_W / 2, dx1 = DOOR_X + DOOR_W / 2;
  box(V(dx0 - 0.07, 0, z0), V(dx1 + 0.07, DOOR_H + 0.07, z0 + 0.04), frame);
  box(V(dx0, 0.02, z0), V(dx1, DOOR_H, z0 + 0.07), doorM);
  box(V(DOOR_X - 0.17, 1.4, z0 + 0.07), V(DOOR_X + 0.17, 1.78, z0 + 0.085), frame);     // its window
  box(V(DOOR_X - 0.13, 1.44, z0 + 0.085), V(DOOR_X + 0.13, 1.74, z0 + 0.088), glass).layers.set(NOINK);
  box(V(DOOR_X - 0.13, 1.44, z0 + 0.088), V(DOOR_X + 0.13, 1.53, z0 + 0.09), glassHi).layers.set(NOINK); // cloud tops
  const es = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.175), new THREE.MeshBasicMaterial({ map: exitTex(), fog: false })); es.position.set(DOOR_X, DOOR_H + 0.25, z0 + 0.03); G.add(es);
  box(V(DOOR_X - 0.23, DOOR_H + 0.15, z0), V(DOOR_X + 0.23, DOOR_H + 0.35, z0 + 0.025), frame);
  const handle = new THREE.Group(); handle.position.set(DOOR_X + 0.05, 1.05, z0 + 0.07); G.add(handle);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.06, 20).rotateX(Math.PI / 2).translate(0, 0, 0.03), steel); handle.add(hub);
  box(V(-0.44, -0.045, 0.05), V(0.03, 0.045, 0.1), red, handle);
  box(V(-0.46, -0.06, 0.04), V(-0.3, 0.06, 0.12), red, handle);                          // the grip
  // ---- the squares on the door (flat, unlit, no ink) ----
  const flat = (tex: THREE.Texture, w: number, h: number) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false })); m.layers.set(NOINK); m.renderOrder = 2; G.add(m); return m; };
  const first = flat(squaresTex(1), SQ, SQ); first.position.set(...sqPos(SQ0.c, SQ0.r)); first.position.z += 0.002;
  const rows: THREE.Mesh[] = [];
  for (let r = 0; r < GRID_R; r++) { const m = flat(squaresTex(GRID_C), GRID_C * SQ, SQ); m.position.set(DOOR_X, sqPos(0, r)[1], sqPos(0, r)[2]); rows.push(m); }
  // ---- air arrows leaning on the door (3D, they point at it) ----
  const arrows = new THREE.Group(); G.add(arrows);
  const blue = M("air", "#49a6ff");
  for (const [ax, ay] of [[-0.26, 0.42], [0.22, 0.32], [-0.3, 1.5], [0.28, 0.82]] as const) {
    const a = new THREE.Group();
    a.add(new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.3, 18).translate(0, -0.15, 0).rotateX(-Math.PI / 2), blue));
    a.add(new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.5, 14).rotateX(Math.PI / 2).translate(0, 0, 0.54), blue));
    a.position.set(DOOR_X + ax, ay, z0 + 0.13); a.userData.z = z0 + 0.13; a.userData.ph = ax * 7 + ay * 3;
    arrows.add(a);
  }
  // ---- the lavatory door ----
  const lx0 = LAV_X - LAV_W / 2, lx1 = LAV_X + LAV_W / 2;
  box(V(lx0 - 0.05, 0, z0), V(lx1 + 0.05, LAV_H + 0.05, z0 + 0.03), frame);
  box(V(lx0, 0.02, z0), V(lx1, LAV_H, z0 + 0.05), lavM);
  box(V(lx0 + 0.07, 0.12, z0 + 0.05), V(lx1 - 0.07, 0.5, z0 + 0.058), M("lavVent", "#d3bf96"));
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), steel); knob.position.set(LAV_X + 0.22, 1.0, z0 + 0.09); G.add(knob);
  box(V(LATCH[0] - 0.1, LATCH[1] - 0.05, z0 + 0.05), V(LATCH[0] + 0.1, LATCH[1] + 0.05, z0 + 0.062), steel);
  const latchM = basic("#3fd070");
  box(V(LATCH[0] - 0.075, LATCH[1] - 0.03, z0 + 0.062), V(LATCH[0] + 0.075, LATCH[1] + 0.03, z0 + 0.066), latchM).layers.set(NOINK);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: signTex(), fog: false })); sign.position.set(LAV_X, 1.6, z0 + 0.056); G.add(sign);
  box(V(LAV_X - 0.11, 1.49, z0 + 0.05), V(LAV_X + 0.11, 1.71, z0 + 0.054), frame);
  // ---- seats, windows, bins ----
  for (let i = 0; i < ROWS; i++) {
    const x = ROW0 + i * ROW_D;
    for (const s of [-1, 1]) for (const zc of SEAT_Z) {
      const z = s * zc;
      box(V(x - 0.26, 0.26, z - 0.215), V(x + 0.2, 0.45, z + 0.215), seat);
      box(V(x + 0.12, 0.3, z - 0.225), V(x + 0.27, 1.3, z + 0.225), seat);
      box(V(x + 0.1, 1.26, z - 0.19), V(x + 0.28, 1.58, z + 0.19), cover);
      box(V(x - 0.2, 0, z - 0.17), V(x + 0.18, 0.26, z + 0.17), seatD);
    }
    for (const s of [-1, 1]) {
      const zw = s < 0 ? z0 : 1.9, zi = s < 0 ? 0.02 : -0.02, a = Math.min(zw, zw + zi), b = Math.max(zw, zw + zi);
      box(V(x - 0.36, 1.05, a), V(x - 0.02, 1.56, b), frame);
      box(V(x - 0.32, 1.09, Math.min(zw + zi, zw + zi * 1.4)), V(x - 0.06, 1.52, Math.max(zw + zi, zw + zi * 1.4)), glass).layers.set(NOINK);
    }
  }
  box(V(ROW0 - 0.5, 1.86, z0), V(12, 2.3, z0 + 0.62), bins);
  box(V(ROW0 - 0.5, 1.86, 1.28), V(12, 2.3, 1.9), bins);

  return {
    group: G, sky: true, shadows: false,
    pose(c: PlaceCtx) {
      const q = c.params as CabinParams;
      handle.rotation.z = q.handle ?? 0;
      const sq = q.square ?? 0, nr = q.rows ?? 0;
      first.visible = sq > 0.01; first.scale.setScalar(Math.max(0.01, sq));
      rows.forEach((m, r) => { const k = Math.max(0, Math.min(1, nr - r)); m.visible = k > 0.01; m.scale.set(1, Math.max(0.01, k), 1); });
      const ak = q.arrows ?? 0;
      arrows.visible = ak > 0.01;
      for (const a of arrows.children) { a.scale.setScalar(Math.max(0.01, ak)); a.position.z = (a.userData.z as number) + 0.1 + 0.08 * Math.sin(c.f * 0.35 + (a.userData.ph as number)); }
      latchM.color.set(q.busy ? "#ff3b30" : "#3fd070");
    },
  };
};

export const sky: PlaceFactory = () => {
  const G = new THREE.Group();
  const tarmac = new THREE.Mesh(new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2), M("tarmac", "#8f93a0")); G.add(tarmac);
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(900, 400).rotateX(-Math.PI / 2).translate(0, 0.01, -230), M("grass", "#6aab4f")); G.add(grass);
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(900, 0.5).rotateX(-Math.PI / 2).translate(0, 0.02, -14), basic("#f3d24a")); stripe.layers.set(NOINK); G.add(stripe);
  return { group: G, sky: true, shadows: false, pose(c: PlaceCtx) { const on = !!(c.params as SkyParams).ground; tarmac.visible = grass.visible = stripe.visible = on; } };
};
