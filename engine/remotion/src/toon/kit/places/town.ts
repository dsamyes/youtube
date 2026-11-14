// The town place of the kit: one ground plane with Gus's back garden and the park. Place names "garden" and "park"
// both show it; they differ only in where the story puts its cameras and cast.
//   garden (around the origin, main view toward -z = north): lawn, plank fences, the HOLE (bottomless pit, stone rim),
//     the dirt mound and the shovel, washing line (north-east), flower beds, the neighbor's yard behind the north
//     fence with his log pile and kettle grill, house backs all around except to the west (the evening sun comes
//     from there), a deck chair that a shot can ask for.
//   park (around PARK, cameras look toward +z): the swing set frame, sand, hedge, trees, a row of houses.
// Per-shot / per-frame options: TownParams (returned by the story's place(id, f)).
import * as THREE from "three";
import { Batch, V, lam, boxGeo, quad, house, prop, setSight, Kit, Ray, rng } from "../build";
import { beam, rep } from "../paint";
import { fenceHD, soilHD, pitHD, clothTex, slingTex, glowTex, lawnHD } from "../paint2";
import { twoTone } from "../shade";
import { NOINK } from "../ink";
import { V3, hash } from "../story";
import { PlaceObj, PlaceCtx } from "./place";

// ---- landmarks (metres; ground y = 0) ----
export const HOLE_R = 0.62;                       // the hole is at the origin
export const MOUND: V3 = [-1.95, 0, -1.6];        // dirt mound centre (radius 1.1, height 0.85)
export const FENCE_N = -4.6;                      // the neighbor's fence (z)
export const FENCE_H = 1.15;
export const NEIGH: V3 = [2.5, 0.3, -5.08];       // where the neighbor stands behind his fence (on his log pile: head and shoulders show)
export const GRILL: V3 = [3.7, 0, -6.6];          // his kettle grill
export const PARK: V3 = [60, 0, 46];              // swing pivot base
/** the shovel standing in the mound */
export const SHOVEL_PLANTED: { top: V3; tip: V3 } = { top: [-1.42, 1.82, -1.05], tip: [-1.72, 0.58, -1.3] };

/** options of the town for one frame (all optional) */
export type TownParams = {
  /** the hole with its stone rim (default true; false = plain lawn) */
  hole?: boolean;
  /** the dirt mound beside it (default: same as hole) */
  mound?: boolean;
  /** the shovel: "planted" in the mound (default when the mound shows), "none", or its handle top and blade tip */
  shovel?: "planted" | "none" | { top: V3; tip: V3 };
  /** deck chair: where it stands and which way it faces (yaw, 0 = toward +z); default none */
  chair?: false | { pos: V3; yaw?: number };
  /** washing line in the north-east corner (default true) */
  washing?: boolean;
  /** the neighbor's kettle grill with smoke (default true) */
  grill?: boolean;
  /** lawn albedo multiplier. Default: 1 by day; under the golden light [0.95, 1.7, 2.6] in the garden and
   *  [0.78, 1.1, 0.83] in the park (the orange key turns a green lawn olive otherwise) */
  lawn?: V3;
};

const TAU = Math.PI * 2;
const beamBetween = (a: THREE.Vector3, b: THREE.Vector3, th: number) => {
  const g = new THREE.BoxGeometry(th, a.distanceTo(b), th);
  return g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()), V(1, 1, 1)));
};
const cyl = (a: THREE.Vector3, b: THREE.Vector3, r0: number, r1 = r0, seg = 10) => {
  const g = new THREE.CylinderGeometry(r1, r0, a.distanceTo(b), seg);
  return g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()), V(1, 1, 1)));
};
/** squashed, slightly lumpy ball with smooth normals (stones, clods, the mound) */
const lump = (rx: number, ry: number, rz: number, seed: number, amp = 0.12, half = false, seg = 16) => {
  const g = new THREE.SphereGeometry(1, seg, half ? Math.ceil(seg / 2) : Math.ceil(seg * 0.7), 0, TAU, 0, half ? Math.PI / 2 : Math.PI);
  const p = g.attributes.position as THREE.BufferAttribute, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = 1 + amp * (Math.sin(v.x * 3.1 + seed) * Math.cos(v.z * 2.7 + seed * 1.7) + 0.5 * Math.sin(v.y * 5 + v.x * 4 + seed * 0.3));
    p.setXYZ(i, v.x * n * rx, v.y * (half ? 1 : n) * ry * (half ? 0.92 + 0.08 * n : 1), v.z * n * rz);
  }
  g.computeVertexNormals();
  // the seam of the sphere (u = 0 / 1) would get split normals: weld them by position
  const q = g.attributes.normal as THREE.BufferAttribute, w = Math.ceil(seg) + 1;
  for (let r = 0; r * w < p.count; r++) { const a = r * w, b = r * w + w - 1; if (b >= p.count) break; const nx = q.getX(a) + q.getX(b), ny = q.getY(a) + q.getY(b), nz = q.getZ(a) + q.getZ(b), l = Math.hypot(nx, ny, nz) || 1; q.setXYZ(a, nx / l, ny / l, nz / l); q.setXYZ(b, nx / l, ny / l, nz / l); }
  return g;
};

export class Town implements PlaceObj {
  group = new THREE.Group();
  shadows = true;
  private gHole = new THREE.Group(); private gCover = new THREE.Group(); private gMound = new THREE.Group();
  private gWash = new THREE.Group(); private gGrill = new THREE.Group();
  private shovel = new THREE.Group();
  private chair = new THREE.Group();
  private cloths: { m: THREE.Mesh; w: number; h: number; ph: number }[] = [];
  private smoke: { m: THREE.Mesh; mat: THREE.MeshBasicMaterial; k: number }[] = [];
  private coals: THREE.Mesh;
  private lawnMat: THREE.MeshLambertMaterial;

  constructor(kit: Kit, rays: Ray[]) {
    const R = this.group, b = new Batch(), r = rng(23);
    // optional set pieces get their own meshes so a shot can switch them off
    const bh = new Batch(), bm = new Batch(), bw = new Batch(), bg = new Batch();
    R.add(this.gHole, this.gCover, this.gMound, this.gWash, this.gGrill);
    const M = {
      grass: lam("lawnHD", () => ({ map: lawnHD() })),
      wood: lam("wood", () => ({ map: beam() })),
      fence: lam("fenceHD", () => ({ map: fenceHD(), side: THREE.DoubleSide })),
      soil: lam("soilHD", () => ({ map: soilHD() })),
      soilFlat: lam("soilFlat", () => ({ map: rep(soilHD(), 1, 1), color: "#c9b8a8" })),
      sand: lam("sand", () => ({ color: "#e2c992" })),
      steel: twoTone(new THREE.MeshPhongMaterial({ color: "#aeb6bf", specular: "#b0b0b0", shininess: 45 }), 0.15),
      iron: twoTone(new THREE.MeshPhongMaterial({ color: "#3d414c", specular: "#8a8a8a", shininess: 60 }), 0.15),
      enamel: twoTone(new THREE.MeshPhongMaterial({ color: "#c8423a", specular: "#909090", shininess: 50 }), 0.15),
      white: lam("whitePaint", () => ({ color: "#efe9da" })),
    };
    this.lawnMat = M.grass;
    setSight(rays);
    // ---- lawn with the hole cut out, the pit below it ----
    const shape = new THREE.Shape(); shape.moveTo(-900, -900); shape.lineTo(900, -900); shape.lineTo(900, 900); shape.lineTo(-900, 900); shape.closePath();
    const cut = new THREE.Path(); cut.absarc(0, 0, HOLE_R, 0, TAU, true); shape.holes.push(cut);
    const lawn = new THREE.ShapeGeometry(shape, 40);
    { const uv = lawn.attributes.uv as THREE.BufferAttribute, p = lawn.attributes.position as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / 4, p.getY(i) / 4); }
    lawn.rotateX(-Math.PI / 2);
    b.add(lawn, M.grass);
    const pit = new THREE.Mesh(new THREE.CylinderGeometry(HOLE_R, HOLE_R, 7, 40, 1, true).translate(0, -3.5, 0), new THREE.MeshBasicMaterial({ map: pitHD(), side: THREE.BackSide }));
    const floor = new THREE.Mesh(new THREE.CircleGeometry(HOLE_R, 24).rotateX(-Math.PI / 2).translate(0, -7, 0), new THREE.MeshBasicMaterial({ color: "#3a1206" })); // the faint glow far down
    this.gHole.add(pit, floor);
    { // a patch of the same lawn that closes the hole when a shot wants none
      const g = new THREE.CircleGeometry(HOLE_R + 0.004, 40), uv = g.attributes.uv as THREE.BufferAttribute, p = g.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / 4, p.getY(i) / 4);
      const m = new THREE.Mesh(g.rotateX(-Math.PI / 2).translate(0, 0.002, 0), M.grass); m.receiveShadow = true; this.gCover.add(m);
    }
    // trampled soil around the hole and under the mound (flat decals), stone rim
    bh.add(new THREE.RingGeometry(HOLE_R, HOLE_R + 0.42, 40).rotateX(-Math.PI / 2).translate(0, 0.012, 0), M.soilFlat);
    bm.add(new THREE.CircleGeometry(1.55, 32).rotateX(-Math.PI / 2).translate(MOUND[0], 0.011, MOUND[2]), M.soilFlat);
    const stoneCols = ["#bdb8ae", "#aaa69d", "#c9c4b9"];
    for (let i = 0; i < 13; i++) {
      const a = (i / 13) * TAU + 0.2, rad = HOLE_R + 0.13 + 0.03 * hash(i, 3), sx = 0.15 + 0.05 * hash(i, 1), sy = 0.085 + 0.035 * hash(i, 2);
      bh.add(lump(sx, sy, 0.12 + 0.03 * hash(i, 4), i * 1.3, 0.1), lam("rim" + (i % 3), () => ({ color: stoneCols[i % 3] })),
        new THREE.Matrix4().compose(V(Math.cos(a) * rad, sy * 0.55, Math.sin(a) * rad), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), -a + Math.PI / 2 + 0.3 * (hash(i, 5) - 0.5)), V(1, 1, 1)));
    }
    // ---- the dirt mound: one big lumpy heap, a shoulder, loose clods ----
    bm.add(lump(1.12, 0.86, 1.0, 2.2, 0.1, true, 28), M.soil, new THREE.Matrix4().makeTranslation(MOUND[0], 0, MOUND[2]));
    bm.add(lump(0.62, 0.42, 0.56, 5.1, 0.12, true, 20), M.soil, new THREE.Matrix4().makeTranslation(MOUND[0] - 0.15, 0, MOUND[2] - 0.95));
    bm.add(lump(0.5, 0.3, 0.5, 7.7, 0.12, true, 18), M.soil, new THREE.Matrix4().makeTranslation(MOUND[0] - 1.0, 0, MOUND[2] + 0.45));
    for (let i = 0; i < 9; i++) {
      const a = 0.2 + hash(i, 7) * 2.6, d = 1.25 + 0.5 * hash(i, 8), s = 0.06 + 0.07 * hash(i, 9);
      bm.add(lump(s, s * 0.7, s, i * 2.1, 0.15, false, 10), M.soil, new THREE.Matrix4().makeTranslation(MOUND[0] + Math.cos(a) * d, s * 0.5, MOUND[2] + Math.sin(a) * d));
    }
    // ---- fences: painted board panels, cap rail, posts ----
    const fence = (x0: number, z0: number, x1: number, z1: number, h = FENCE_H, posts?: number[]) => {
      const a = V(x0, 0, z0), c = V(x1, 0, z1), len = a.distanceTo(c), dir = c.clone().sub(a).normalize(), nrm = V(-dir.z, 0, dir.x).multiplyScalar(0.025);
      for (const s of [1, -1]) {
        const p0 = a.clone().addScaledVector(nrm, s), p1 = c.clone().addScaledVector(nrm, s);
        const q0 = s > 0 ? p0 : p1, q1 = s > 0 ? p1 : p0;
        b.add(quad(q0, q1, q1.clone().setY(h), q0.clone().setY(h), len / 2, 1), M.fence);
      }
      b.add(beamBetween(a.clone().setY(h + 0.02), c.clone().setY(h + 0.02), 0.085), M.wood);
      const n = Math.max(1, Math.round(len / 2.2)), at = posts ?? Array.from({ length: n + 1 }, (_, i) => i / n);
      for (const u of at) { const p = a.clone().lerp(c, u); b.add(boxGeo(V(p.x - 0.06, 0, p.z - 0.06), V(p.x + 0.06, h + 0.14, p.z + 0.06), 1), M.wood); }
    };
    fence(-6.5, FENCE_N, 6.5, FENCE_N, FENCE_H, [-6.5, -4.3, -2.1, 0.1, 1.5, 4.7, 6.5].map((x) => (x + 6.5) / 13)); // no post in front of the neighbor or his grill
    fence(-6.5, FENCE_N, -6.5, 9.5);
    fence(6.5, 9.5, 6.5, FENCE_N);
    fence(-16, FENCE_N, -6.5, FENCE_N, 1.0); fence(6.5, FENCE_N, 16, FENCE_N, 1.0);
    // ---- houses: the row behind the neighbor's yard (backs to us), a second row, side neighbors, Gus's own house ----
    for (const [x, w, h, si] of [[1.2, 9, 7, 1], [-8.4, 9, 8.4, 0], [10.8, 9, 7, 2], [-18.2, 9, 7, 4], [20.4, 9, 8.4, 6], [-27.8, 7, 7, 5], [29.5, 7, 7, 3]] as const) house(b, x, -15.2, Math.PI, w, 8, h, si);
    for (const [x, w, h, si] of [[-4, 9, 9.8, 6], [6, 9, 9.8, 4], [-14, 9, 8.4, 2], [16, 7, 9.8, 0], [-24, 9, 9.8, 1], [26, 9, 8.4, 5]] as const) house(b, x, -33, 0, w, 8, h, si);
    // (nothing tall to the west: the evening sun comes in low from there)
    for (const [x, z, yaw, si, h] of [[16.5, -3, -Math.PI / 2, 3, 7], [16.5, 7, -Math.PI / 2, 0, 8.4]] as const) house(b, x, z, yaw, 9, 8, h, si);
    house(b, 0.5, 15, 0, 9, 8, 7, 4);
    house(b, -9.5, 15, 0, 9, 8, 8.4, 6); house(b, 10.5, 15, 0, 9, 8, 7, 1);
    // ---- trees and bushes ----
    for (const [n, x, z, h] of [["tree_oak", -7.4, -9.0, 6.8], ["tree_fat", 8.6, -9.4, 6.2], ["tree_default", -3.4, -21, 10], ["tree_oak", 6.0, -22, 10.5], ["tree_detailed", -13.5, -9.5, 8],
      ["tree_fat", 15.5, -10.5, 8], ["tree_default", 10.2, -0.6, 7], ["tree_oak", 10.8, 5.5, 7.5],
      ["tree-high-round", -23, -22, 11], ["tree-high-round", 24, -23, 11.5], ["tree_cone", -9.5, -24, 10], ["tree_cone", 14, -25, 11]] as const) prop(b, kit, n, x, 0, z, h, x * 1.7);
    for (const [x, z, h] of [[-5.3, -3.85, 1.15], [-3.9, -4.0, 0.9], [4.6, -3.9, 1.1], [5.7, -3.3, 0.85], [-5.9, -1.9, 0.95], [5.95, 1.4, 1.0], [5.9, 4.2, 1.1],
      [-4.2, -6.3, 1.2], [5.6, -7.9, 1.3], [-1.9, -9.9, 1.1]] as const) prop(b, kit, x * z > 0 ? "plant_bushLarge" : "plant_bush", x, 0, z, h, x);
    // flower beds along the fences (kit flowers; none on the camera's side of the hole)
    const FL = ["flower_redA", "flower_yellowA", "flower_purpleA", "flower_redB", "flower_yellowB", "flower_purpleB", "flower_redC", "flower_yellowC", "flower_purpleC"];
    for (let i = 0; i < 34; i++) { const x = -6 + 12 * r(), z = FENCE_N + 0.35 + 0.5 * r(), h = 0.3 + 0.14 * r(), yw = r() * 6; if (x < -1.6 || x > 4.6) prop(b, kit, FL[Math.floor(r() * 9)], x, 0, z, h, yw); } // (bed left open where the last move swings low over it)
    for (let i = 0; i < 16; i++) { const s = i % 2 ? 1 : -1; prop(b, kit, FL[Math.floor(r() * 9)], s * (5.75 + 0.45 * r()), 0, -3.5 + 9 * r(), 0.3 + 0.14 * r(), r() * 6); }
    for (let i = 0; i < 18; i++) prop(b, kit, FL[Math.floor(r() * 9)], -6 + 12 * r(), 0, FENCE_N - 0.4 - 1.2 * r(), 0.3 + 0.14 * r(), r() * 6);
    for (const [x, z] of [[-4.6, 6.8], [4.9, 7.2], [-5.3, 5.9]] as const) prop(b, kit, "pot_large", x, 0, z, 0.42, x);
    prop(b, kit, "log_stack", NEIGH[0], 0, NEIGH[2] - 0.04, 0.36, 1.57); // what the neighbor stands on
    prop(b, kit, "stump_round", -3.6, 0, -6.9, 0.4, 0.4);
    for (const [x, z] of [[2.4, 4.4], [3.1, 5.6], [2.2, 6.9]] as const) prop(b, kit, "path_stone", x, 0.0, z, 0.06, x * 2);
    // ---- washing line (north-east corner): two T posts, a sagging line, four things drying ----
    const A = V(5.0, 1.92, -2.9), B = V(6.15, 1.92, -4.3), along = B.clone().sub(A), L = along.length(), yaw = Math.atan2(-along.z, along.x);
    for (const p of [A, B]) {
      bw.add(cyl(V(p.x, 0, p.z), V(p.x, 2.02, p.z), 0.045, 0.04), M.white); // plain posts (a T bar behind a head reads as a propeller)
      bw.add(new THREE.SphereGeometry(0.06, 12, 8).translate(p.x, 2.05, p.z), M.white);
    }
    const sag = (u: number) => A.clone().lerp(B, u).add(V(0, -0.16 * 4 * u * (1 - u), 0));
    for (let i = 0; i < 10; i++) bw.add(cyl(sag(i / 10), sag((i + 1) / 10), 0.008, 0.008, 5), M.iron);
    [[0.12, 0.62, 0.62, 0], [0.38, 0.86, 1.0, 1], [0.66, 0.42, 0.52, 2], [0.86, 0.5, 0.8, 3]].forEach(([u, w, h, kind], i) => {
      const g = new THREE.PlaneGeometry(w, h, 8, 6).translate(0, -h / 2, 0);
      const m = new THREE.Mesh(g, lam("cloth" + kind, () => ({ map: clothTex(kind), side: THREE.DoubleSide })));
      const p = sag(u); m.position.set(p.x, p.y - 0.01, p.z); m.rotation.y = yaw; m.castShadow = true; m.receiveShadow = true;
      this.cloths.push({ m, w, h, ph: i * 1.7 }); this.gWash.add(m);
      for (const s of [-1, 1]) bw.add(boxGeo(V(-0.012, -0.05, -0.012), V(0.012, 0.03, 0.012)), M.wood, new THREE.Matrix4().makeTranslation(p.x + s * (w / 2 - 0.06) * (along.x / L), p.y, p.z + s * (w / 2 - 0.06) * (along.z / L)));
    });
    // ---- the neighbor's kettle grill ----
    const [gx, , gz] = GRILL, GH = 1.2; // rim height: the bowl shows over the fence
    for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU + 0.5; bg.add(cyl(V(gx + Math.cos(a) * 0.34, 0, gz + Math.sin(a) * 0.34), V(gx + Math.cos(a) * 0.16, GH - 0.22, gz + Math.sin(a) * 0.16), 0.018), M.steel); }
    bg.add(new THREE.SphereGeometry(0.36, 22, 10, 0, TAU, Math.PI / 2, Math.PI / 2).scale(1, 0.72, 1), M.iron, new THREE.Matrix4().makeTranslation(gx, GH, gz));
    bg.add(new THREE.TorusGeometry(0.36, 0.02, 6, 26).rotateX(Math.PI / 2), M.steel, new THREE.Matrix4().makeTranslation(gx, GH, gz));
    for (let i = -3; i <= 3; i++) { const x = i * 0.095, hw = Math.sqrt(Math.max(0.001, 0.35 * 0.35 - x * x)); bg.add(cyl(V(gx + x, GH + 0.02, gz - hw), V(gx + x, GH + 0.02, gz + hw), 0.008, 0.008, 5), M.iron); }
    const saus = lam("sausage", () => ({ color: "#c9603a" }));
    for (const [sx, sz, ry] of [[-0.13, 0.02, 0.2], [0.05, -0.08, -0.15], [0.12, 0.12, 0.4]] as const)
      bg.add(new THREE.CapsuleGeometry(0.035, 0.2, 4, 10).rotateZ(Math.PI / 2).rotateY(ry), saus, new THREE.Matrix4().makeTranslation(gx + sx, GH + 0.06, gz + sz));
    // the lid leans against a leg
    bg.add(new THREE.SphereGeometry(0.36, 22, 10, 0, TAU, 0, Math.PI / 2).scale(1, 0.6, 1), M.enamel, new THREE.Matrix4().compose(V(gx + 0.6, 0.32, gz + 0.1), new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), -1.2), V(1, 1, 1)));
    this.coals = new THREE.Mesh(new THREE.CircleGeometry(0.32, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 0.42, 0.08) }));
    this.coals.position.set(gx, GH - 0.03, gz); this.coals.layers.set(NOINK); this.gGrill.add(this.coals);
    const puff = glowTex();
    for (let k = 0; k < 6; k++) {
      const mat = new THREE.MeshBasicMaterial({ map: puff, transparent: true, depthWrite: false, color: "#cfd2dc", fog: false });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); m.layers.set(NOINK); m.renderOrder = 2;
      this.smoke.push({ m, mat, k: k / 6 }); this.gGrill.add(m);
    }
    // ---- park: swing set (frame only; the swing itself is a card hanging from the bar), sand, hedge, trees ----
    const [px, , pz] = PARK;
    for (const zz of [-2.2, 2.2]) for (const s of [-1, 1]) b.add(beamBetween(V(px, 3.0, pz + zz), V(px + s * 3.0, 0, pz + zz), 0.15), M.wood);
    b.add(beamBetween(V(px, 3.0, pz - 2.35), V(px, 3.0, pz + 2.35), 0.17), M.wood);
    b.add(new THREE.CircleGeometry(3.4, 32).rotateX(-Math.PI / 2).translate(px, 0.012, pz), M.sand);
    for (const [n, dx, dz, h] of [["tree_oak", -12, 9, 9.5], ["tree_fat", 14, 11, 8], ["tree_detailed", -16, -9, 9], ["tree_default", 18, -11, 9], ["tree_oak", 9, -20, 10],
      ["tree-high-round", -9, -19, 9], ["tree_default", 22, 2, 8.5]] as const) prop(b, kit, n, px + dx, 0, pz + dz, h, px + dx);
    for (let x = px - 20; x < px + 22; x += 3.2) prop(b, kit, "hedge", x, 0, pz + 18, 1.5);
    for (const [dx, dz] of [[-8, -1], [7, 4], [-4, -7], [5, -5], [-13, 2]] as const) prop(b, kit, r() < 0.5 ? "plant_bushLarge" : "plant_bushDetailed", px + dx, 0, pz + dz, 1.3);
    for (let i = 0; i < 26; i++) { const x = px - 14 + r() * 30, z = pz - 17 + r() * 32; if (Math.hypot(x - px, z - pz) > 4) prop(b, kit, FL[Math.floor(r() * 3)], x, 0, z, 0.5); }
    { let x = px - 36; while (x < px + 40) { const w = r() < 0.5 ? 7 : 9, h = [7, 8.4, 9.8][Math.floor(r() * 3)]; house(b, x + w / 2, pz + 37, Math.PI, w, 8, h, Math.floor(r() * 8)); x += w + (r() < 0.25 ? 2.5 : 0.25); } }
    for (const [dx, dz, h] of [[-30, 14, 9], [34, 16, 10], [-24, 27, 8], [30, 28, 8], [-40, 44, 11], [42, 46, 11]] as const) prop(b, kit, "tree_default", px + dx, 0, pz + dz, h, dx);
    // ---- hills and far trees around the valley (template) ----
    const hill = new THREE.SphereGeometry(1, 28, 14, 0, TAU, 0, Math.PI / 2);
    const hm = [lam("hillA", () => ({ color: "#78b257" })), lam("hillB", () => ({ color: "#6aa24e" })), lam("hillC", () => ({ color: "#8bbf63" }))];
    ([[-360, 250, 190, 52, 120], [140, 380, 240, 64, 140], [430, 150, 170, 48, 130], [-440, -130, 190, 44, 150], [-90, -390, 250, 58, 140],
      [320, -330, 210, 54, 130], [520, -60, 160, 40, 120], [-560, 60, 200, 46, 140]] as const).forEach(([x, z, sx, sy, sz], i) =>
      b.add(hill, hm[i % 3], new THREE.Matrix4().compose(V(x, -2, z), new THREE.Quaternion(), V(sx, sy, sz))));
    const trees = ["tree_oak", "tree_default", "tree_detailed", "tree_fat", "tree-high-round", "tree"];
    for (let i = 0; i < 90; i++) {
      const a = r() * TAU, d = 42 + r() * 190, x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (Math.hypot(x - px, z - pz) < 30) continue;
      prop(b, kit, trees[Math.floor(r() * 6)], x, 0, z, 7 + r() * 4, r() * 6);
    }
    for (let i = 0; i < 40; i++) { const a = r() * TAU, d = 230 + r() * 160; prop(b, kit, r() < 0.5 ? "tree_cone" : "tree_default", Math.cos(a) * d * 1.3, 0, Math.sin(a) * d, 12 + r() * 6, r() * 6); }
    b.build(R); bh.build(this.gHole); bm.build(this.gMound); bw.build(this.gWash); bg.build(this.gGrill);
    setSight([]);
    // ---- the shovel (posed every frame) ----
    const sm = (g: THREE.BufferGeometry, mat: THREE.Material) => { const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; this.shovel.add(m); };
    sm(new THREE.CylinderGeometry(0.032, 0.035, 0.8, 10).translate(0, 0.74, 0), M.wood);
    sm(new THREE.TorusGeometry(0.075, 0.024, 8, 18).translate(0, 1.2, 0), M.wood);
    sm(new THREE.CylinderGeometry(0.036, 0.042, 0.14, 10).translate(0, 0.36, 0), M.steel);
    { // blade: a shallow scoop with a rounded point
      const g = new THREE.PlaneGeometry(0.3, 0.36, 8, 8).translate(0, 0.16, 0), p = g.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), t = Math.max(0, 1 - (y + 0.02) / 0.2); p.setXYZ(i, x * Math.sqrt(Math.max(0.02, 1 - t * t * 0.96)), y, 0.7 * x * x + 0.02); }
      g.computeVertexNormals();
      const m = M.steel.clone(); m.side = THREE.DoubleSide; m.onBeforeCompile = M.steel.onBeforeCompile; m.customProgramCacheKey = M.steel.customProgramCacheKey;
      sm(g, m);
    }
    this.gMound.add(this.shovel);
    // ---- the deck chair (evening shots) ----
    const cm = (g: THREE.BufferGeometry, mat: THREE.Material) => { const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; this.chair.add(m); };
    for (const s of [-1, 1]) {
      cm(beamBetween(V(s * 0.3, 0.02, 0.5), V(s * 0.3, 1.02, -0.5), 0.045), M.wood);   // back rails
      cm(beamBetween(V(s * 0.3, 0.02, -0.42), V(s * 0.3, 0.5, 0.36), 0.045), M.wood);  // seat rails
      cm(beamBetween(V(s * 0.3, 0.28, 0.02), V(s * 0.33, 0.52, -0.08), 0.04), M.wood);
    }
    cm(beamBetween(V(-0.33, 1.0, -0.48), V(0.33, 1.0, -0.48), 0.045), M.wood);
    cm(beamBetween(V(-0.33, 0.48, 0.34), V(0.33, 0.48, 0.34), 0.045), M.wood);
    { const g = new THREE.PlaneGeometry(0.56, 1, 2, 12), p = g.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) { const u = p.getY(i) + 0.5; // 0 = front bar .. 1 = top bar
        const y = 0.48 + (1.0 - 0.48) * u - 0.2 * Math.sin(Math.PI * u) ** 0.9, z = 0.34 + (-0.48 - 0.34) * u + 0.05 * Math.sin(Math.PI * u);
        p.setXYZ(i, p.getX(i), y, z); }
      g.computeVertexNormals();
      cm(g, lam("sling", () => ({ map: slingTex(), side: THREE.DoubleSide }))); }
    this.chair.visible = false;
    R.add(this.chair);
  }

  pose(c: PlaceCtx) {
    const p = c.params as TownParams, t = c.f / 30, golden = c.shot.light === "golden";
    const hole = p.hole ?? true, mound = p.mound ?? hole;
    this.gHole.visible = hole; this.gCover.visible = !hole; this.gMound.visible = mound;
    this.gWash.visible = p.washing ?? true; this.gGrill.visible = p.grill ?? true;
    // shovel: planted in the mound unless the story holds it somewhere
    const sh = p.shovel ?? "planted";
    this.shovel.visible = sh !== "none";
    if (sh !== "none") {
      const { top: tp, tip: tb } = sh === "planted" ? SHOVEL_PLANTED : sh, tip = V(...tb), top = V(...tp), dir = top.clone().sub(tip);
      this.shovel.position.copy(tip);
      this.shovel.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
      this.shovel.rotateY(1.2);
      this.shovel.scale.set(1, dir.length() / 1.28, 1);
    }
    this.chair.visible = !!p.chair;
    if (p.chair) { this.chair.position.set(...p.chair.pos); this.chair.rotation.y = p.chair.yaw ?? 0; }
    // evening: the orange key turns a green lawn olive, so its albedo leans green-blue under the golden light
    const lawn: V3 = p.lawn ?? (golden ? (c.shot.place === "park" ? [0.78, 1.1, 0.83] : [0.95, 1.7, 2.6]) : [1, 1, 1]);
    this.lawnMat.color.setRGB(lawn[0], lawn[1], lawn[2]);
    for (const cl of this.cloths) {
      const q = cl.m.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < q.count; i++) { const v = -q.getY(i) / cl.h, x = q.getX(i); q.setZ(i, v * (0.06 * Math.sin(t * 1.6 + cl.ph + x * 2.2) + 0.03 * Math.sin(t * 2.7 + x * 5 + cl.ph)) + 0.015 * Math.sin(x * 9 + cl.ph)); }
      q.needsUpdate = true; cl.m.geometry.computeVertexNormals();
    }
    (this.coals.material as THREE.MeshBasicMaterial).color.setRGB(1.5 + 0.3 * Math.sin(t * 7), 0.42 + 0.08 * Math.sin(t * 9 + 1), 0.08);
    for (const s of this.smoke) {
      const u = (t * 0.22 + s.k) % 1, sz = 0.3 + u * 0.9;
      s.m.position.set(GRILL[0] + 0.25 * u * Math.sin(s.k * 9 + u * 3), 1.3 + u * 2.0, GRILL[2] - 0.1 * u);
      s.m.scale.set(sz, sz, 1); s.m.quaternion.copy(c.cam.quaternion);
      s.mat.opacity = 0.5 * Math.sin(Math.PI * Math.min(1, u * 1.15)) ** 0.8 * (1 - u);
    }
  }
}
