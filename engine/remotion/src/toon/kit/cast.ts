// Cast system of the cartoon-short kit: characters are lit flat sprites in the 3D world (the template's cards).
// Each frame every character asks for a drawing (a key + a draw call); the pool keeps one canvas per distinct drawing.
// Characters are camera-facing cards shaded by cardShade() (scene tint, bright floor, side gradient toward the key
// light, painted crescent in the drawing); standing ones get a contact blob. Effects are unlit cards. Cards, effects
// and blobs live on the NOINK layer so the world ink pass never outlines their quads.
// A story's stage(c) calls put() for every character and fx() (or the helpers in effects.ts) for every effect card;
// it must be a pure function of the shot and the frame.
import * as THREE from "three";
import { Pen, bodySide, swingKid, KID, PARENT, fxShadow, fxContact, Expr, SideOpts, P2 } from "./toon";
import { figure, anchorsOf, Look, Pose, Arm, fxStreak } from "./people";
import { V3, ShotDef, smooth, clamp01, lerp, hash } from "./story";
import { LightName } from "./lights";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";
import { PARK } from "./places/town";

// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
export const SU_SWING = 2.3 / 1830; // swing canvas: rope of 1830 units = 2.3 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
/** wide card (1000 x 1000 design units, figure centred) for poses whose arm or prop reaches past the 600-unit card */
const WIDE = 200;
const BODY_WIDE = (() => { const g = new THREE.PlaneGeometry((600 + 2 * WIDE) * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
/** wide and tall card (1000 x 1200: 200 more units of headroom) for Gus with the fishbowl pushed up over his head */
const TALL = 200;
const BODY_TALL = (() => { const g = new THREE.PlaneGeometry((600 + 2 * WIDE) * SU, (1000 + TALL) * SU); g.translate(0, (975 + TALL - (1000 + TALL) / 2) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);

/** lit flat character: cardShade() material, receives shadows (dims to the bright floor only), casts its silhouette
 *  when world.ts says so (golden). Drawn after the contact blobs (renderOrder 1). */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false;
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    // rim width is in output pixels: tell the card shader the render height (1920 = 1080 x 1920 frame)
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
  /** standard 600-unit card or the wide one */
  shape(wide: boolean, tall = false) { const g = tall ? BODY_TALL : wide ? BODY_WIDE : BODY; if (this.mesh.geometry !== g) this.mesh.geometry = g; }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, streaks) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide, fog: false });
    this.mat.alphaToCoverage = false;
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind(gain = 1) {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      // no mipmaps: at grazing views the mip chain averages the blob with its white surround and it fades out
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mat.color.setScalar(gain); this.soft.color.setScalar(gain); this.mesh.renderOrder = this.mesh.material === this.soft ? 3 : 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: "body" | "swing"; roll?: number; size?: [number, number, number];
  /** fully camera-facing (falling in the shaft): the card takes the camera's orientation, then rolls */
  face?: boolean;
  /** drawn on the wide card / the wide and tall card */
  wide?: boolean; tall?: boolean;
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean; gain?: number };
/** sun = world direction TOWARD the key light */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; up: THREE.Vector3; fwd: THREE.Vector3; sun: THREE.Vector3; roll: number };
export type Stage = { places: Place[]; fx: FxPlace[] };

/** quantise (drawing keys: fewer distinct drawings = fewer canvases) */
export const q = (v: number, n = 120) => Math.round(v * n) / n;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design]; sized for the 1440 x 2560 final */
export const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const tmp = new THREE.Vector3();
/** canvas angle the key light comes FROM on a card facing the camera, in 45-degree steps (small texture cache) */
export const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = cam.sun.dot(cam.right) * (mirror ? -1 : 1), sy = -cam.sun.dot(cam.up);
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};
export const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

// ---------------- life: blinks ----------------
/** eyelid 0 open .. 1 shut. Gaps 0.5-2.3 s, 4-frame blink half / shut / shut / half; a blink across every swap in `swaps` */
const LID = [0.5, 1, 1, 0.5];
export const lidAt = (f: number, i: number, swaps: number[] = []) => {
  for (const fs of swaps) { const k = f - fs + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hash(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hash(i * 31 + n, 13));
  }
  return 0;
};

// ---------------- staging helpers ----------------
/** what a story's stage(c) gets: the shot, the frame, the lens, and the lists it fills through put() / fx() */
export type Ctx = { id: number; f: number; cam: CamInfo; out: Stage; light: LightName; shot: ShotDef };
export type PutOpt = { scale?: number; mirror?: boolean; face?: boolean; roll?: number; blob?: number; noBlob?: boolean; wide?: boolean; tall?: boolean };
const PIVOT = 375; // design units from the soles to the body centre (the pivot of a tumbling card)
/** where a puppet's card stands and how a design-space anchor (hands, props, mouth) maps to world space */
export const where = (c: Ctx, lk: Look, pose: Pose, pos: V3, o: PutOpt = {}) => {
  const { cam } = c, scale = o.scale ?? 1, mirror = !!o.mirror, roll = o.roll ?? 0;
  let [x, y, z] = pos;
  const R = new THREE.Vector3(), U = new THREE.Vector3();
  if (o.face) {
    R.copy(cam.right).multiplyScalar(Math.cos(roll)).addScaledVector(cam.up, Math.sin(roll));
    U.copy(cam.up).multiplyScalar(Math.cos(roll)).addScaledVector(cam.right, -Math.sin(roll));
    x -= U.x * PIVOT * SU * scale; y -= U.y * PIVOT * SU * scale; z -= U.z * PIVOT * SU * scale;
  } else {
    const yaw = Math.atan2(cam.pos.x - x, cam.pos.z - z);
    R.set(Math.cos(yaw), 0, -Math.sin(yaw)); U.set(0, 1, 0);
  }
  const ps: Pose = { ...pose, light: light2D(cam, mirror) };
  const A = anchorsOf(lk, ps);
  const at = (pt: P2, toCam = 0.02): V3 => {
    const ax = (pt[0] - 300) * SU * scale * (mirror ? -1 : 1), ay = (975 - pt[1]) * SU * scale;
    return [x + R.x * ax + U.x * ay - cam.fwd.x * toCam, y + R.y * ax + U.y * ay - cam.fwd.y * toCam, z + R.z * ax + U.z * ay - cam.fwd.z * toCam];
  };
  return { A, at, ps, x, y, z, U, scale, mirror, roll };
};
/** place one puppet; returns its anchors and the anchor-to-world map */
export const put = (c: Ctx, lk: Look, pose: Pose, pos: V3, o: PutOpt = {}) => {
  const w = where(c, lk, pose, pos, o), { ps, x, y, z, scale } = w;
  const d = c.cam.pos.distanceTo(tmp.set(x, y, z).addScaledVector(w.U, 1.2 * scale)) / scale;
  const [cw, ch, k] = tier(d), tall = !!o.tall, wide = !!o.wide || tall, add = wide ? WIDE : 0, top = tall ? TALL : 0;
  c.out.places.push({ key: `${lk.id}|${wide ? "W" : ""}${tall ? "T" : ""}${fkey(ps)}`, x, y, z, scale, mirror: w.mirror, face: o.face, roll: w.roll, wide, tall,
    draw: (p) => { if (add || top) p.g.translate(add, top); figure(p, lk, ps); }, size: [Math.round((cw * (600 + 2 * add)) / 600), Math.round((ch * (1000 + top)) / 1000), k] });
  if (!o.face && !o.noBlob && (c.light === "day" || c.light === "golden")) blob(c, pos[0], pos[1], pos[2], scale, o.blob ?? 1);
  return { A: w.A, at: w.at };
};
/** hand target (head heights from the shoulder) that reaches the world point `to` for an adult card at `pos`
 *  (sy = shoulder height over the soles: 1.14 m standing, 0.86 m in "chair" mode); the reach is capped at `max` */
export const reach = (c: Ctx, pos: V3, side: number, to: V3, sy = 1.14, max = 1.6): [number, number] => {
  const HHm = 221.8 * SU, sx = side * 0.163;
  const yaw = Math.atan2(c.cam.pos.x - pos[0], c.cam.pos.z - pos[2]);
  const dx = (to[0] - pos[0]) * Math.cos(yaw) - (to[2] - pos[2]) * Math.sin(yaw);
  const h: [number, number] = [((dx - sx) * side) / HHm, (sy - (to[1] - pos[1])) / HHm], L = Math.hypot(h[0], h[1]);
  return L > max ? [(h[0] * max) / L, (h[1] * max) / L] : h;
};
/** a point `d` metres further from the lens than p (cards that must sit behind a character) */
export const behind = (c: Ctx, p: V3, d = 0.15): V3 => { const h = Math.hypot(c.cam.fwd.x, c.cam.fwd.z) || 1; return [p[0] + (c.cam.fwd.x / h) * d, p[1], p[2] + (c.cam.fwd.z / h) * d]; };
/** one 2D effect card: `key` names the drawing (same key = same canvas), cw x ch = its canvas, draw = the drawing,
 *  pos = centre in the world, w x h = size in metres. o: flat (lies on the ground), rot, soft (see-through), gain */
export const fx = (c: Ctx, key: string, cw: number, ch: number, draw: (p: Pen) => void, pos: V3, w: number, h: number, o: Partial<FxPlace> = {}) =>
  c.out.fx.push({ key, cw, ch, draw, x: pos[0], y: pos[1], z: pos[2], w, h, ...o });
/** blend two arm poses (k 0..1): hand target and bend interpolate, the rest switches at the middle */
export const armMix = (a: Arm, b: Arm, k: number): Arm => ({ ...(k < 0.5 ? a : b), h: [lerp(a.h[0], b.h[0], k), lerp(a.h[1], b.h[1], k)], bend: lerp(a.bend ?? 0.07, b.bend ?? 0.07, k) });
/** smoothstep from frame a to frame b (0 before, 1 after): ease every pose change with it */
export const sm = (f: number, a: number, b: number) => smooth((f - a) / (b - a));
/** arm hanging at the side / hand on the hip */
export const HANG: Arm = { h: [0.17, 0.92], bend: 0.07 };
export const HIP: Arm = { h: [0.06, 0.7], bend: 0.3 };

/** ground shadow under a standing card (template): a tight contact pool right under the feet, plus by day a lighter
 *  soft tail stretched AWAY from the sun. Golden: world.ts casts real card shadows. */
const CONTACT: Record<string, [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const x = clamp01(v); return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055; };
const hexOf = (col: [number, number, number], k: number) => "#" + col.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
export const blob = (c: Ctx, x: number, y: number, z: number, sc = 1, k = 1) => {
  const S = c.cam.sun, hl = Math.hypot(S.x, S.z) || 1, ox = -S.x / hl, oz = -S.z / hl, rot = Math.atan2(-ox, -oz);
  if (c.light === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, S.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, cc = 0.3 * h;
    const tc = hexOf(TAIL, k);
    c.out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * cc, y: y + 0.018, z: z + oz * cc, w: 0.72 * sc, h, flat: true, rot });
  }
  const col = hexOf(CONTACT[c.light] ?? CONTACT.day, k);
  c.out.fx.push({ key: `blob|contact|${col}`, cw: 128, ch: 128, draw: (p) => fxContact(p, col), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc, w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};


// ---------------- falling ----------------
const HEAT_COL = ["255,236,214", "255,214,150", "255,250,226"]; // streak colour: crust, mantle, core
/** 2D speed lines around a subject at the origin, rushing up the frame (falling); they keep clear of the middle.
 *  n lines of ~len metres; fade 0..1; heat 0..2 picks the colour and brightness (the shaft's heat) */
export const speedLines = (c: Ctx, n: number, len: number, fade = 1, heat = 0) => {
  if (fade <= 0.02) return;
  const { cam, f, id } = c, col = HEAT_COL[Math.min(2, Math.round(heat))];
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1, sx = side * (0.5 + 1.05 * hash(i, 1 + id)), period = 4 + Math.floor(hash(i, 2 + id) * 5);
    const ph = ((f + Math.floor(hash(i, 3) * period)) % period) / period, sy = -2.6 + 5.2 * ph, dep = -0.6 + 1.6 * hash(i, 4);
    const h = len * (0.6 + 0.8 * hash(i, 5)), w = 0.028 + 0.03 * hash(i, 6);
    const p: V3 = [cam.right.x * sx + sy * 0 + cam.fwd.x * -dep, sy + 0.1, cam.right.z * sx + cam.fwd.z * -dep];
    fx(c, `streak|${col}`, 48, 512, (pp) => fxStreak(pp, col), p, w, h, { soft: true, rot: -cam.roll, gain: 0.55 * fade + 0.5 * fade * Math.min(1, heat) });
  }
};
/** a falling body: arms and legs flail (amp 0.35 calm .. 1 panic; pass f * 0.4 for a slow tumble). Spread it into a
 *  pose: { ...flail(f), expr: "shock" } and put() it with { face: true, roll } */
export const flail = (f: number, amp = 1): Pose => {
  const a = f * 0.62;
  return {
    mode: "air",
    L: { h: [0.72 + 0.14 * Math.sin(a), -0.3 + 0.42 * amp * Math.sin(a * 1.31 + 1)], bend: -0.2 },
    R: { h: [0.7 + 0.14 * Math.sin(a + 2), -0.25 + 0.42 * amp * Math.sin(a * 1.17 + 2.6)], bend: -0.2 },
    legs: [[-0.44 + 0.14 * amp * Math.sin(a * 1.1), 1.02 + 0.14 * amp * Math.cos(a * 1.1)], [0.5 + 0.14 * amp * Math.sin(a * 0.93 + 2), 0.94 + 0.14 * amp * Math.cos(a * 0.93 + 2)]],
  };
};

// ---------------- the park swing: the kid on the swing and the adult who pushes ----------------
/** motion of the swing for one frame. angle = rope angle in rad (negative = back, toward the pusher); vel = -1..1
 *  (+ = moving forward; drives the kid's leg kick); ampAt(f) = amplitude in rad at frame f (expressions, and where
 *  the pusher stands); pushes = frames on which a push lands (the swing is at its back end) */
export type SwingMotion = { angle: number; vel: number; ampAt: (f: number) => number; pushes: number[] };
/** a plain pendulum for swingScene(): starts at its back end on f0 with a push, one push per period for `pushes`
 *  periods, amplitude growing from amp0 by `grow` degrees per push */
export const pendulum = (f: number, f0: number, o: { period?: number; amp0?: number; grow?: number; pushes?: number } = {}): SwingMotion => {
  const T = o.period ?? 71, n = o.pushes ?? 2, list = Array.from({ length: n }, (_x, i) => f0 + i * T);
  const ampAt = (ff: number) => (((o.amp0 ?? 13) + list.reduce((s, fp) => s + (o.grow ?? 12) * smooth((ff - fp) / 9), 0)) * Math.PI) / 180;
  const th = ((f - f0) / T) * 2 * Math.PI;
  return { angle: -ampAt(f) * Math.cos(th), vel: Math.sin(th), ampAt, pushes: list };
};
/** the swing kid's back in world space when the swing is at angle th */
const kidBack = (at: V3, th: number): [number, number] => {
  const lx = -0.083, ly = -2.174; // local to the swing card (pivot at the origin), card yawed by PI
  return [at[0] - (lx * Math.cos(th) - ly * Math.sin(th)), at[1] + 2.88 + lx * Math.sin(th) + ly * Math.cos(th)];
};
/** Draws the kid on the park swing (town place, swing frame at `at` = PARK) and the adult who pushes him, seen from
 *  the south (cameras at z < PARK z looking toward +z). The pusher steps back as the arc grows. */
export const swingScene = (c: Ctx, m: SwingMotion, at: V3 = PARK) => {
  const { f, cam } = c, th = m.angle, vel = m.vel, PUSHES = m.pushes;
  const pushSpot = (k: number) => {
    const A = m.ampAt(PUSHES[k] - 1), [bx, by] = kidBack(at, -A);
    const cy = 975 - (by - at[1]) / SU, dy = cy - 515, dx = Math.sqrt(Math.max(120 * 120, 222 * 222 - dy * dy));
    return { px: bx + (53 + dx) * SU, hand: [300 + 53 + dx, cy] as [number, number] };
  };
  const A = m.ampAt(f), kick = q(0.35 + 0.55 * vel, 40);
  const expr: Expr = A < 0.4 ? "smile" : A < 0.62 ? "grin" : "laugh";
  const light = light2D(cam, true), lid = lidAt(f, 78);
  c.out.places.push({ key: `swing|${kick}|${expr}|${q(light)}|${lid}`, geo: "swing", x: at[0], y: at[1] + 2.88, z: at[2], yaw: Math.PI, roll: th,
    draw: (p) => swingKid(p, KID, kick, expr, light, lid), size: [490, 1610, 0.7] });
  if (!PUSHES.length) return;
  const push = Math.max(0, ...PUSHES.map((fp) => 1 - Math.abs(f - fp + 1.5) / 9.6));
  let k = 0;
  while (k < PUSHES.length - 1 && f > PUSHES[k] + 10) k++;
  const cur = pushSpot(k), prev = pushSpot(Math.max(0, k - 1));
  const step = k > 0 ? smooth((f - (PUSHES[k - 1] + 10)) / (PUSHES[k] - PUSHES[k - 1] - 22)) : 1;
  const px = prev.px + (cur.px - prev.px) * step, pz = at[2] + 0.1;
  const so: SideOpts = { mode: "push", pose: q(push, 40), expr: push > 0.3 ? "grin" : "smile", blink: lidAt(f, 77), hand: cur.hand, light, seed: 4 };
  const d = cam.pos.distanceTo(tmp.set(px, at[1] + 1.2, pz)), [w, h, kk] = tier(d);
  c.out.places.push({ key: `parent|${fkey(so)}`, x: px, y: at[1], z: pz, yaw: Math.PI, draw: (p) => bodySide(p, PARENT, so), size: [w, h, kk] });
  blob(c, px, at[1], pz);
};
