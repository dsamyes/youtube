// The cast as lit flat sprites in the 3D world (the template's card system) and the staging of all 21 shots.
// Each frame every character asks for a drawing (a key + a draw call); the pool keeps one canvas per distinct drawing.
// Characters are camera-facing cards shaded by cardShade() (scene tint, bright floor, side gradient toward the key
// light, painted crescent in the drawing); standing ones get a contact blob. Effects are unlit cards. Cards, effects
// and blobs live on the NOINK layer so the world ink pass never outlines their quads.
// stage(id, f, cam) is a pure function of the shot and the frame.
import * as THREE from "three";
import { Pen, bodySide, swingKid, KID, PARENT, fxBurst, fxRing, fxShadow, fxContact, fxPuff, Expr, SideOpts, P2 } from "./toon";
import {
  figure, anchorsOf, Look, Pose, Arm, GUS, WIFE, NEIGHBOR, FISHER, miniGus, fxFeather, fxBullet, fxFlame, fxSoot, fxQuestion, fxArrow,
  fxFlag, fxPancake, fxSplat, fxStreak, fxSparkle, fxBird, fxTrail, fxShards, fxBubble, fxCrumbs, fxPop,
} from "./people";
import {
  FPS, SHOTS, V3, smooth, clamp01, lerp, lin, hash, PARK, GUS_STAND, NEIGH, WIFE5, PANCAKE_AT, CHAIR, hopAt, gardenGusY, HANG_Y,
  POP1, HANG1, DROP1, POP2, BITE, DROP2, FISHER as FISHER_AT, POP_SEA, STOP_SEA, SINK_SEA, GONE_SEA, seaGusY, PIPE_H, PUSHES, swingTheta,
  swingAmp, swingAngle, EARTH_ROLL, earthPoint, earthGusS, FLAG_POP, ARROW_POP, PASS, hookDrop, shaftHeat, SHOVEL_HIT, shovelK,
} from "./story";
import { LightName } from "./lights";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";

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
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean; gain?: number };
/** sun = world direction TOWARD the key light */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; up: THREE.Vector3; fwd: THREE.Vector3; sun: THREE.Vector3; roll: number };
export type Stage = { places: Place[]; fx: FxPlace[] };

const q = (v: number, n = 120) => Math.round(v * n) / n;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design]; sized for the 1440 x 2560 final */
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const tmp = new THREE.Vector3();
/** canvas angle the key light comes FROM on a card facing the camera, in 45-degree steps (small texture cache) */
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = cam.sun.dot(cam.right) * (mirror ? -1 : 1), sy = -cam.sun.dot(cam.up);
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

// ---------------- life: blinks ----------------
/** eyelid 0 open .. 1 shut. Gaps 0.5-2.3 s, 4-frame blink half / shut / shut / half; a blink across every swap in `swaps` */
const LID = [0.5, 1, 1, 0.5];
const lidAt = (f: number, i: number, swaps: number[] = []) => {
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
type Ctx = { id: number; f: number; cam: CamInfo; out: Stage; light: LightName };
type PutOpt = { scale?: number; mirror?: boolean; face?: boolean; roll?: number; blob?: number; noBlob?: boolean };
const PIVOT = 375; // design units from the soles to the body centre (the pivot of a tumbling card)
/** place one puppet; returns a function that maps a design-space anchor (hands, props, mouth) to world space */
const put = (c: Ctx, lk: Look, pose: Pose, pos: V3, o: PutOpt = {}) => {
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
  const d = cam.pos.distanceTo(tmp.set(x, y, z).addScaledVector(U, 1.2 * scale)) / scale;
  const [w, h, k] = tier(d);
  const ps: Pose = { ...pose, light: light2D(cam, mirror) };
  c.out.places.push({ key: `${lk.id}|${fkey(ps)}`, x, y, z, scale, mirror, face: o.face, roll, draw: (p) => { figure(p, lk, ps); }, size: [w, h, k] });
  if (!o.face && !o.noBlob && (c.light === "day" || c.light === "golden")) blob(c, pos[0], pos[1], pos[2], scale, o.blob ?? 1);
  const A = anchorsOf(lk, ps);
  const at = (pt: P2, toCam = 0.02): V3 => {
    const ax = (pt[0] - 300) * SU * scale * (mirror ? -1 : 1), ay = (975 - pt[1]) * SU * scale;
    return [x + R.x * ax + U.x * ay - cam.fwd.x * toCam, y + R.y * ax + U.y * ay - cam.fwd.y * toCam, z + R.z * ax + U.z * ay - cam.fwd.z * toCam];
  };
  return { A, at };
};
/** hand target (head heights from the shoulder) that reaches the world point `to` for a standing adult card at `pos` */
const reach = (c: Ctx, pos: V3, side: number, to: V3): [number, number] => {
  const HHm = 221.8 * SU, sx = side * 0.163, sy = 1.14;
  const yaw = Math.atan2(c.cam.pos.x - pos[0], c.cam.pos.z - pos[2]);
  const dx = (to[0] - pos[0]) * Math.cos(yaw) - (to[2] - pos[2]) * Math.sin(yaw);
  return [((dx - sx) * side) / HHm, (sy - (to[1] - pos[1])) / HHm];
};
const fx = (c: Ctx, key: string, cw: number, ch: number, draw: (p: Pen) => void, pos: V3, w: number, h: number, o: Partial<FxPlace> = {}) =>
  c.out.fx.push({ key, cw, ch, draw, x: pos[0], y: pos[1], z: pos[2], w, h, ...o });
const armMix = (a: Arm, b: Arm, k: number): Arm => ({ ...(k < 0.5 ? a : b), h: [lerp(a.h[0], b.h[0], k), lerp(a.h[1], b.h[1], k)], bend: lerp(a.bend ?? 0.07, b.bend ?? 0.07, k) });
const sm = (f: number, a: number, b: number) => smooth((f - a) / (b - a));
const HANG: Arm = { h: [0.17, 0.92], bend: 0.07 };
const HIP: Arm = { h: [0.06, 0.7], bend: 0.3 };

/** ground shadow under a standing card (template): a tight contact pool right under the feet, plus by day a lighter
 *  soft tail stretched AWAY from the sun. Golden: world.ts casts real card shadows. */
const CONTACT: Record<string, [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const x = clamp01(v); return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055; };
const hexOf = (col: [number, number, number], k: number) => "#" + col.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (c: Ctx, x: number, y: number, z: number, sc = 1, k = 1) => {
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

// ---------------- the shaft ----------------
const HEAT_COL = ["255,236,214", "255,214,150", "255,250,226"]; // streak colour: crust, mantle, core
/** 2D speed lines around the subject, rushing up the frame; they keep clear of the middle */
const speedLines = (c: Ctx, n: number, len: number, fade = 1) => {
  if (fade <= 0.02) return;
  const { cam, f, id } = c, heat = shaftHeat(id, f), col = HEAT_COL[Math.min(2, Math.round(heat))];
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1, sx = side * (0.5 + 1.05 * hash(i, 1 + id)), period = 4 + Math.floor(hash(i, 2 + id) * 5);
    const ph = ((f + Math.floor(hash(i, 3) * period)) % period) / period, sy = -2.6 + 5.2 * ph, dep = -0.6 + 1.6 * hash(i, 4);
    const h = len * (0.6 + 0.8 * hash(i, 5)), w = 0.028 + 0.03 * hash(i, 6);
    const p: V3 = [cam.right.x * sx + sy * 0 + cam.fwd.x * -dep, sy + 0.1, cam.right.z * sx + cam.fwd.z * -dep];
    fx(c, `streak|${col}`, 48, 512, (pp) => fxStreak(pp, col), p, w, h, { soft: true, rot: -cam.roll, gain: 0.55 * fade + 0.5 * fade * Math.min(1, heat) });
  }
};
const flail = (f: number, amp = 1): Pose => {
  const a = f * 0.62;
  return {
    mode: "air",
    L: { h: [0.72 + 0.14 * Math.sin(a), -0.3 + 0.42 * amp * Math.sin(a * 1.31 + 1)], bend: -0.2 },
    R: { h: [0.7 + 0.14 * Math.sin(a + 2), -0.25 + 0.42 * amp * Math.sin(a * 1.17 + 2.6)], bend: -0.2 },
    legs: [[-0.44 + 0.14 * amp * Math.sin(a * 1.1), 1.02 + 0.14 * amp * Math.cos(a * 1.1)], [0.5 + 0.14 * amp * Math.sin(a * 0.93 + 2), 0.94 + 0.14 * amp * Math.cos(a * 0.93 + 2)]],
  };
};
const shaft = (c: Ctx) => {
  const { id, f } = c;
  const drift: V3 = [0.03 * Math.sin(f * 0.11), 0.04 * Math.sin(f * 0.17 + 1), 0];
  if (id === 1) {
    const dy = hookDrop(f);
    put(c, GUS, { ...flail(f), expr: "shock", flap: (f * 0.23) % 1, blink: 0 }, [drift[0], drift[1] - dy, -0.02 * dy], { face: true, roll: 0.22 * Math.sin(f * 0.085) - 0.1 });
    speedLines(c, 12, 1.5, 1 - sm(f, 90, 100));
  } else if (id === 7) {
    const feather = sm(f, 497, 513), lookF = f >= 505;
    const pose: Pose = { ...flail(f * 0.45, 0.45), expr: f < 470 ? "nervous" : lookF ? (f >= 512 ? "wow" : "neutral") : "smile", facing: lookF ? 1 : 0, look: lookF ? 1 : 0,
      headTilt: lookF ? 6 * sm(f, 505, 512) : 0, blink: lidAt(f, 1, [470, 505]), flap: (f * 0.13) % 1 };
    const g = put(c, GUS, pose, drift, { face: true, roll: 0.1 * Math.sin(f * 0.05) + 0.06 });
    if (f >= 496) {
      const hp = g.at(g.A.head), k = 1 - feather;
      fx(c, "feather", 220, 420, fxFeather, [hp[0] + 0.6 + 1.3 * k, hp[1] + 0.06 + 1.5 * k * k, hp[2] + 0.05], 0.22, 0.42, { rot: -0.35 });
      if (f >= 513 && f < 523) { const u = (f - 513) / 10; fx(c, "sparkle", 200, 200, fxSparkle, [hp[0] + 0.8, hp[1] + 0.3, hp[2] + 0.06], 0.16 * Math.sin(Math.PI * u), 0.16 * Math.sin(Math.PI * u), { rot: u }); }
    }
    speedLines(c, 8, 0.9);
  } else if (id === 8) {
    const by = lin([[537, -1.85], [564, 0.32], [581, 0.92], [598, 2.0]], f), wave = f >= 578;
    const pose: Pose = { ...flail(f * 0.4, 0.35), expr: f < 560 ? "neutral" : f < 578 ? "wow" : "smile", facing: 1, look: 1, blink: lidAt(f, 2, [560, 578]), headTilt: lin([[537, 14], [564, 0], [598, -10]], f),
      flap: (f * 0.15) % 1 };
    if (wave) pose.R = { h: [0.6 + 0.1 * Math.sin((f - 578) * 1.1), -0.62], bend: -0.25 };
    put(c, GUS, pose, drift, { face: true, roll: -0.05 });
    fx(c, "bullet", 160, 320, fxBullet, [0.74, by, 0.05], 0.25, 0.5);
    speedLines(c, 9, 1.0);
  } else if (id === 9) {
    const fl = (f * 0.31) % 1, sh = 0.012 * Math.sin(f * 2.3);
    const pose: Pose = { mode: "air", expr: "flap", flap: fl,
      L: { h: [0.5 + 0.05 * Math.sin(f * 1.9), -0.72 + 0.06 * Math.sin(f * 2.3)], bend: -0.12 }, R: { h: [0.52 + 0.05 * Math.sin(f * 2.1 + 1), -0.7 + 0.06 * Math.sin(f * 1.7)], bend: -0.12 },
      legs: [[-0.46 + 0.04 * Math.sin(f * 2), 0.82], [0.5 + 0.04 * Math.sin(f * 2.4), 0.74]] };
    put(c, GUS, pose, [drift[0] + sh, drift[1], 0], { face: true, roll: 0.05 });
    speedLines(c, 14, 1.8);
  } else if (id === 11) {
    const fl = (f * 0.37) % 1, jx = 0.008 * Math.sin(f * 2.9), jy = 0.008 * Math.sin(f * 3.7);
    put(c, GUS, { mode: "air", expr: "flap", flap: fl, L: { h: [0.5, -0.7], bend: -0.12 }, R: { h: [0.52, -0.7], bend: -0.12 }, legs: [[-0.46, 0.82], [0.5, 0.74]] }, [jx, jy, 0], { face: true, roll: 0.03 });
    speedLines(c, 16, 1.4);
  } else if (id === 12) {
    const lvl = f >= 801 ? 2 : lin([[745, 0.06], [765, 0.22], [786, 0.7], [800, 1.0]], f);
    const lower = sm(f, 812, 826), calm = f >= 822, thumb = sm(f, 831, 836);
    const R: Arm = armMix({ h: [0.86, -0.3], bend: 0.1, front: true, prop: "thermo", arg: lvl }, { h: [0.42, 0.75], bend: 0.1, front: true, prop: "thermo", arg: lvl }, lower);
    const pose: Pose = { mode: "air", expr: f >= 801 && f < 809 ? "shock" : calm ? "smile_closed" : "neutral", facing: calm ? 0 : 1, look: calm ? 0 : 1, blink: lidAt(f, 3, [801, 822]),
      R: { ...R, prop: "thermo", arg: lvl, front: true }, L: f >= 831 ? armMix(HANG, { h: [0.36, 0.12], bend: -0.3, front: true, hand: "thumb" }, thumb) : { h: [0.3, 0.8], bend: 0.1 },
      legs: [[-0.3, 1.2], [0.36, 1.16]], flap: (f * 0.17) % 1 };
    if (f >= 831) pose.L = { ...pose.L!, hand: "thumb", front: true };
    const g = put(c, GUS, pose, drift, { face: true, roll: 0.03 });
    if (f >= 801 && f < 815) {
      const u = (f - 801) / 14, at = g.at(g.A.propR, 0.05);
      fx(c, `shards${q(u, 30)}`, 400, 400, (p) => fxShards(p, q(u, 30)), at, 0.9, 0.9);
      if (u < 0.45) fx(c, `burstR${q(u / 0.45, 30)}`, 500, 500, (p) => fxBurst(p, q(u / 0.45, 30), "#ffd9c8", 9, 30, 200), at, 0.7, 0.7);
    }
    if (f >= 836 && f < 850) { const u = (f - 836) / 14, at = g.at(g.A.L, 0.06), s = 0.2 * Math.sin(Math.PI * u) ** 0.6; fx(c, "sparkle", 200, 200, fxSparkle, [at[0] - 0.02, at[1] + 0.16, at[2]], s, s, { rot: u * 1.2 }); }
    speedLines(c, 12, 1.4);
  } else if (id === 19) {
    const yawn = f >= 1652 && f < 1672;
    const pose: Pose = { mode: "air", expr: yawn ? "asleep" : "neutral", look: yawn ? 0 : Math.sin(f * 0.04) > 0 ? 1 : -1, blink: lidAt(f, 4, [1652, 1672]),
      L: { h: [-0.5, 0.44], bend: 0.3, front: true }, R: { h: [-0.46, 0.52], bend: 0.3, front: true }, legs: [[0.16, 1.24], [-0.12, 1.2]], flap: (f * 0.21) % 1 };
    put(c, GUS, pose, [-drift[0], drift[1], 0], { face: true, roll: -0.28 + 0.03 * Math.sin(f * 0.06), mirror: true });
    speedLines(c, 14, 1.7);
  }
};

// ---------------- the garden ----------------
const birds = (c: Ctx, f: number) => {
  for (let i = 0; i < 3; i++) {
    const x = -26 + 0.09 * (f - 118) * (0.8 + 0.3 * i) + i * 9, y = 15 + 2.5 * i + 0.3 * Math.sin(f * 0.1 + i), fl = q(Math.sin(f * 0.5 + i * 2), 8);
    fx(c, `bird${fl}`, 240, 140, (p) => fxBird(p, fl), [x, y, -46 - 6 * i], 1.5, 0.87);
  }
};
/** the shovel in shot 2: handle top and blade tip (world), for the 3D prop and Gus's hand */
export const shovelAt = (f: number): { top: V3; tip: V3; grip: V3 } => {
  // held: standing on the lawn beside him; planted: stuck in the mound's near slope, leaning his way
  const H0: V3 = [-1.44, 1.3, -0.5], T0: V3 = [-1.48, 0.02, -0.5], H1: V3 = [-1.42, 1.82, -1.05], T1: V3 = [-1.72, 0.58, -1.3];
  const k = shovelK(f), u = Math.max(0, k), w = Math.max(0, -k) / 0.35;
  const lift = 0.5 * w + 0.5 * (u < 1 ? 1 - u * u : 0) * (k > 0 ? 1 : 0);
  const mix3 = (a: V3, b: V3): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + lift, lerp(a[2], b[2], u)];
  const top = mix3(H0, H1), tip = mix3(T0, T1);
  tip[0] -= 0.12 * w; tip[2] -= 0.2 * w; // the wind-up already swings the blade toward the mound
  const g = 0.66;
  return { top, tip, grip: [lerp(tip[0], top[0], g), lerp(tip[1], top[1], g), lerp(tip[2], top[2], g)] };
};
const NEIGH_BASE: Pose = { mode: "stand" };
const neighbor = (c: Ctx, pose: Pose, pos: V3 = NEIGH, o: PutOpt = {}) => put(c, NEIGHBOR, { ...NEIGH_BASE, ...pose }, pos, { noBlob: pos === NEIGH, ...o });
const sausageFire = (c: Ctx, at: V3, f: number, f0: number, f1: number) => {
  // poof on f0, burns, dies by f1
  if (f < f0 || (f1 > 0 && f >= f1 + 3)) return;
  const grow = clamp01((f - f0 + 1) / 4), die = f1 > 0 ? 1 - clamp01((f - (f1 - 3)) / 6) : 1, k = Math.max(0.05, grow * die), t = q(((f * 0.19) % 1), 24);
  fx(c, `flame${t}|${q(k, 20)}`, 300, 420, (p) => fxFlame(p, t, q(k, 20)), [at[0], at[1] + 0.2 * k + 0.02, at[2]], 0.34, 0.48, { gain: 1.5 });
  if (f < f0 + 6) { const u = (f - f0) / 6; fx(c, `poof${q(u, 30)}`, 500, 500, (p) => fxBurst(p, q(u, 30), "#ffb52e", 10, 34, 220), [at[0], at[1] + 0.05, at[2]], 0.85, 0.85, { gain: 1.4 }); }
};
const garden = (c: Ctx) => {
  const { id, f } = c;
  if (id === 2) {
    const sh = shovelAt(f), planted = f >= SHOVEL_HIT, look = f >= 170 && f < 190;
    const proud = f >= 190;
    const L: Arm = { h: reach(c, GUS_STAND, -1, sh.grip), bend: 0.12, front: !planted };
    const pose: Pose = { expr: proud ? "relief_open" : look ? "grin" : "smile_closed", facing: look ? -1 : 0, look: look ? -1 : 0, blink: lidAt(f, 5, [170, 190]),
      L, R: HIP, tilt: look ? -4 * sm(f, 170, 176) * (1 - sm(f, 184, 192)) : 0, headTilt: proud ? -4 : 0 };
    put(c, GUS, pose, GUS_STAND);
    if (f >= SHOVEL_HIT && f < SHOVEL_HIT + 10) {
      const u = (f - SHOVEL_HIT) / 10;
      fx(c, `puff${q(u, 20)}`, 300, 300, (p) => fxPuff(p, q(u, 20)), [sh.tip[0] + 0.12, sh.tip[1] + 0.25, sh.tip[2] + 0.3], 0.9 + 0.5 * u, 0.9 + 0.5 * u, { soft: true });
      for (let i = 0; i < 4; i++) { const a = 0.6 + i * 0.55, r = 0.5 * u; fx(c, "clod", 60, 60, (p) => p.ell(30, 30, 20, 17, "#7a5236", 8), [sh.tip[0] + 0.1 + Math.cos(a) * r, sh.tip[1] + 0.3 + Math.sin(a) * r * 1.4 - 1.2 * u * u, sh.tip[2] + 0.35], 0.07, 0.07); }
    }
    birds(c, f);
  } else if (id === 4) {
    const burn = f >= 287, crisp = f >= 305, notice = f >= 300;
    const laugh = !notice, shake = laugh ? 0.012 * Math.sin(f * 1.5) : 0;
    const pose: Pose = { expr: crisp ? "sad" : notice ? "shock" : "laugh", facing: notice ? 1 : -1, look: notice ? 1 : -1, blink: notice ? 0 : lidAt(f, 6, [300]),
      tilt: laugh ? -5 + 2.5 * Math.sin(f * 0.75) : 3, headTilt: laugh ? 5 * Math.sin(f * 0.75 + 1) : -4,
      L: laugh ? { h: [0.86, 0.22 + 0.05 * Math.sin(f * 0.75)], bend: 0.1, front: true, hand: "point" } : { h: [0.5, 0.36], bend: 0.2, front: true },
      R: { h: [0.52, -0.18], bend: -0.3, front: true, prop: "fork", arg: crisp ? 2 : burn ? 1 : 0 } };
    const g = neighbor(c, pose, [NEIGH[0], NEIGH[1] + shake, NEIGH[2]]);
    const at = g.at(g.A.propR, 0.04);
    sausageFire(c, at, f, 287, 306);
    if (crisp) { const u = ((f - 305) % 14) / 14; fx(c, `soot${q(u, 14)}`, 300, 300, (p) => fxSoot(p, q(u, 14)), [at[0] + 0.02, at[1] + 0.2 + 0.25 * u, at[2]], 0.3, 0.3); }
  } else if (id === 5) {
    const flick = lin([[333, 0], [337, 26], [341, -4], [346, 0]], f), up = lin([[333, 0], [337, 0.16], [342, 0]], f);
    const landed = f >= 351;
    const pose: Pose = { expr: "neutral", facing: 0, look: f >= 337 && f < 349 ? 0 : landed && f < 372 ? -1 : 0, blink: lidAt(f, 7, [351, 372]),
      headTilt: f >= 338 && f < 350 ? -5 : landed && f < 372 ? 4 : 0,
      L: { h: [-0.42, 0.46], bend: 0.3, front: true }, R: { h: [0.5, 0.4 - up], bend: 0.12, front: true, prop: "pan", arg: flick } };
    const g = put(c, WIFE, pose, WIFE5);
    const pan = g.at(g.A.propR, 0.05);
    if (f < 337) fx(c, "cake0.2", 300, 300, (p) => fxPancake(p, 0.2), [pan[0], pan[1] + 0.02, pan[2]], 0.34, 0.34);
    else if (!landed) {
      const u = (f - 337) / 14, p0: V3 = [pan[0], WIFE5[1] + 0.86, pan[2]];
      const pos: V3 = [lerp(p0[0], PANCAKE_AT[0], u), lerp(p0[1], 0.05, u) + 1.05 * 4 * u * (1 - u), lerp(p0[2], PANCAKE_AT[2], u)];
      const sq = q(Math.cos(u * Math.PI * 3), 20);
      fx(c, `cake${sq}`, 300, 300, (p) => fxPancake(p, sq), pos, 0.36, 0.36, { rot: 0.3 * Math.sin(u * 5) });
    } else {
      const u = Math.min(1, (f - 351) / 8), s = 0.62 * (0.75 + 0.25 * Math.min(1, (f - 350) / 2));
      fx(c, `splat${q(u, 16)}`, 400, 400, (p) => fxSplat(p, q(u, 16)), PANCAKE_AT, s, s, { flat: true, rot: 0.4 });
      if (f < 359) for (let i = 0; i < 6; i++) { const a = 0.25 + i * 0.52, r = 0.16 + (0.4 + 0.25 * hash(i, 5)) * u; fx(c, "drop", 60, 60, (p) => p.ell(30, 30, 20, 20, "#f0c46a", 8), [PANCAKE_AT[0] + Math.cos(a) * r, 0.05 + (0.3 + 0.5 * hash(i, 6)) * Math.sin(Math.PI * u), PANCAKE_AT[2] + 0.15], 0.06, 0.06); }
    }
  } else if (id === 6) {
    const hp = hopAt(f), up = sm(f, 404, 411), sal = sm(f, 417, 421) * (1 - sm(f, 425, 428));
    const air = hp.air;
    const pose: Pose = air
      ? { mode: "air", expr: "grin", L: { h: [0.5, -0.72], bend: -0.15 }, R: { h: [0.5, -0.66], bend: -0.15, front: true, prop: "clipboard" }, legs: [[-0.34, 0.86], [0.4, 0.8]], flap: (f * 0.2) % 1 }
      : { expr: f < 404 ? "smile" : f < 417 ? "smile_closed" : "grin", blink: lidAt(f, 8, [404, 417]), squash: hp.squash, headTilt: -3 * up,
        R: armMix(HANG, { h: [0.52, -0.2], bend: -0.28, front: true }, up), L: armMix(HANG, { h: [0.16, -0.64], bend: -0.42, front: true }, sal) };
    if (!air) pose.R = { ...pose.R!, front: true, prop: "clipboard" };
    put(c, GUS, pose, [hp.x, hp.y, hp.z], { noBlob: air && hp.y < -0.05, blob: air ? 0.5 : 1 });
    if (f >= 411 && f < 417) { const u = (f - 411) / 6; fx(c, "sparkle", 200, 200, fxSparkle, [GUS_STAND[0] + 0.52, 1.72, GUS_STAND[2] + 0.1], 0.2 * Math.sin(Math.PI * u), 0.2 * Math.sin(Math.PI * u), { rot: u }); }
  } else if (id === 13) {
    const q0 = f >= 895, bob = 0.01 * Math.sin(f * 0.2);
    put(c, WIFE, { expr: "neutral", facing: 1, look: 1, tilt: 15 + bob * 40, headTilt: 9, blink: lidAt(f, 9, [895]), R: { h: [0.34, -0.56], bend: -0.4 }, L: HIP }, [-0.84, 0, -0.18]);
    neighbor(c, { expr: q0 ? "wow" : "neutral", facing: -1, look: -1, tilt: -15 - bob * 40, headTilt: -9, blink: lidAt(f, 10, [895]), L: { h: [0.34, -0.56], bend: -0.4 }, R: HIP }, [0.84, 0, -0.18]);
    if (f >= 895) {
      const u = (f - 895) / 6, s = u < 1 ? 1.25 * Math.sin((Math.PI / 2) * u) : 1 + 0.25 * Math.exp(-(u - 1) * 1.2) * Math.cos((u - 1) * 2.2);
      fx(c, "what", 300, 420, fxQuestion, [0, 1.62 + 0.03 * Math.sin(f * 0.25), 0.05], 0.5 * s, 0.7 * s, { rot: 0.1 * Math.sin(f * 0.2) });
    }
  } else if (id === 20 || id === 21) {
    const y = gardenGusY(f), top1 = f >= HANG1 - 6 && f < DROP1, rise2 = f >= POP2 - 3 && f < DROP2;
    const visible = y > -2.2;
    // --- Gus ---
    let lift = 0, bite = 0;
    if (rise2) { lift = sm(f, POP2 + 8, BITE - 3) * (1 - sm(f, BITE + 8, BITE + 16)); bite = f >= BITE - 3 && f < BITE ? 1 : f >= BITE ? 2 : 0; }
    if (visible) {
      const falling = (f >= DROP1 && f < POP2 - 3) || f >= DROP2;
      const up: Arm = { h: [0.62, -0.5], bend: -0.2 }, hold: Arm = { h: [0.44, -0.66 - 0.5 * lift], bend: -0.35, front: true };
      const pose: Pose = falling
        ? { mode: "air", expr: f >= DROP2 ? "chew" : "shock", L: { h: [0.5, -0.8], bend: -0.12 }, R: { h: [0.52, -0.78], bend: -0.12 }, legs: [[-0.2, 1.3], [0.24, 1.28]], flap: (f * 0.25) % 1 }
        : rise2
          ? { expr: bite === 1 ? "bite" : bite === 2 ? "chew" : "smile", facing: -1, look: -1, blink: lidAt(f, 11, [BITE]), acc: lift, tilt: -7 * sm(f, BITE - 6, BITE - 1) * (1 - sm(f, BITE + 5, BITE + 12)),
            L: armMix(HANG, hold, sm(f, POP2 + 5, POP2 + 10)), R: armMix(HANG, hold, sm(f, POP2 + 5, POP2 + 10)) }
          : { expr: top1 ? "relief_open" : "smile", facing: -1, look: -1, blink: lidAt(f, 11, [HANG1 - 6]), L: armMix(HANG, up, sm(f, POP1 + 6, HANG1 - 4)), R: armMix(HANG, up, sm(f, POP1 + 6, HANG1 - 4)) };
      put(c, GUS, pose, [0, y, 0], { noBlob: true });
    }
    for (const f0 of [POP1, POP2]) if (f >= f0 && f < f0 + 7) { const u = (f - f0) / 7; fx(c, `pop${q(u, 28)}`, 500, 300, (p) => fxPop(p, q(u, 28)), [0, 0.2, 0.2], 1.9, 1.14); }
    // --- his wife in the deck chair ---
    const wind = f >= 1786 && f < 1812, offer = sm(f, 1812, 1826), rewind = f >= 1893 && f < 1922;
    const lookUp = (f >= POP1 && f < DROP1 + 8) || (f >= POP2 - 2 && f < DROP2 + 6);
    const timerArm: Arm = { h: [-0.18, 0.36], bend: 0.3, front: true, prop: "timer", arg: wind ? (f - 1786) * 14 : rewind ? (f - 1893) * 14 : f >= 1812 ? 300 - ((f - 1812) / 22) * 300 : 0 };
    const rest: Arm = { h: [0.2, 0.5], bend: 0.25, front: true, prop: "plate", arg: f >= BITE ? 1 : 0 };
    const out: Arm = { h: [0.93, -0.06], bend: 0.04, front: true, prop: "plate", arg: f >= BITE ? 1 : 0 };
    const back = sm(f, 1884, 1894);
    const wpose: Pose = { mode: "chair", expr: "neutral", facing: 1, look: lookUp ? 1 : wind || rewind ? -1 : 0, headTilt: lookUp ? -6 : wind || rewind ? 5 : 0, blink: lidAt(f, 12, [POP1, DROP1 + 8, POP2 - 2, DROP2 + 6]),
      L: f < 1780 ? { h: [0.1, 0.52], bend: 0.3, front: true, prop: "timer", arg: 0 } : timerArm,
      R: wind || rewind ? { ...armMix(out, { h: [-0.02, 0.2], bend: 0.3, front: true }, 1), prop: undefined, h: [-0.05 + 0.03 * Math.sin(f * 1.6), 0.2 + 0.03 * Math.cos(f * 1.6)] }
        : { ...armMix(rest, out, offer * (1 - back)), prop: "plate", arg: f >= BITE ? 1 : 0, front: true } };
    const w = put(c, WIFE, wpose, CHAIR, { noBlob: true });
    if (f >= BITE && f < BITE + 9) { const u = (f - BITE) / 9, at = w.at(w.A.propR, 0.06); fx(c, `crumbs${q(u, 18)}`, 300, 300, (p) => fxCrumbs(p, q(u, 18)), [at[0] + 0.08, at[1], at[2]], 0.5, 0.5); }
    if (f >= POP2 && f < POP2 + 12) { const u = (f - POP2) / 12, at = w.at(w.A.propL, 0.06), s = 0.22 * Math.sin(Math.PI * u) ** 0.6; fx(c, "sparkle", 200, 200, fxSparkle, [at[0], at[1] + 0.16, at[2]], s, s, { rot: u }); }
    // --- the neighbor at the fence (the payoff) ---
    if (id === 21) {
      const seen = f >= POP2 + 3, jaw = f >= DROP2 + 5, fire = f >= 1905;
      const pose: Pose = { expr: jaw ? "jawdrop" : seen ? "shock" : "neutral", facing: -1, look: -1, blink: jaw || seen ? 0 : lidAt(f, 13), headTilt: jaw ? 3 : 0,
        L: { h: [0.45, 0.4], bend: 0.25, front: true }, R: { h: [0.5, jaw ? 0.02 : -0.12], bend: -0.3, front: true, prop: "fork", arg: fire ? 1 : 0 } };
      // he comes up behind his fence while Gus drops away (the lens is on its way over to him from f1880)
      if (f >= 1870) {
        const g = neighbor(c, pose, [NEIGH[0], NEIGH[1] - 0.9 * (1 - sm(f, 1870, 1880)), NEIGH[2]], { noBlob: true });
        sausageFire(c, g.at(g.A.propR, 0.04), f, 1905, 0);
      }
    }
  }
};

// ---------------- the Earth cutaway ----------------
const mini = (c: Ctx, s: number, size: number, arms: number, expr: "o" | "smile" | "flat", trail: number, dirDown: boolean) => {
  const p = earthPoint(s, 0.8), rot = EARTH_ROLL + (dirDown ? 0 : 0);
  if (trail > 0.05) {
    const t = earthPoint(s + (dirDown ? -1 : 1) * (0.09 + 0.1 * trail) * (size / 1.0), 0.76);
    fx(c, `trail${q(trail, 10)}`, 200, 400, (pp) => fxTrail(pp, q(trail, 10)), t, 0.5 * size, 1.0 * size * (0.5 + 0.5 * trail), { rot: rot + (dirDown ? 0 : Math.PI), soft: false });
  }
  fx(c, `mini|${arms}|${expr}`, 300, 400, (pp) => miniGus(pp, arms, expr), p, 0.82 * size, 1.09 * size, { rot });
};
const earth = (c: Ctx) => {
  const { id, f } = c;
  if (id === 3) {
    if (f >= FLAG_POP - 1) {
      const u = (f - (FLAG_POP - 1)) / 6, s = u < 1 ? 1.3 * Math.sin((Math.PI / 2) * u) : 1 + 0.3 * Math.exp(-(u - 1) * 0.9) * Math.cos((u - 1) * 1.9);
      const base = earthPoint(1.0, 0.25), tip = earthPoint(1.0 + 0.28 * s, 0.25);
      const w = q(((f * 0.07) % 1), 16);
      fx(c, `flag${w}`, 300, 400, (p) => fxFlag(p, w), [(base[0] + tip[0]) / 2 + (tip[0] - base[0]) * 0.5, (base[1] + tip[1]) / 2 + (tip[1] - base[1]) * 0.5, base[2]], 2.1 * s, 2.8 * s, { rot: Math.PI + EARTH_ROLL });
      if (u < 1) fx(c, `popE${q(u, 20)}`, 500, 500, (p) => fxBurst(p, q(u, 20), "#fff6d8", 9, 50, 230), earthPoint(1.02, 0.5), 2.6, 2.6);
    }
  } else if (id === 10) {
    const s = earthGusS(id, f);
    mini(c, s, 1.7, 1, "o", 1, true);
    if (Math.abs(s) < 0.1) { const u = clamp01((s + 0.1) / 0.2); fx(c, `coreFlash${q(u, 12)}`, 500, 500, (p) => fxBurst(p, q(u, 12), "#ffffff", 12, 60, 240), earthPoint(0, 0.7), 3.2, 3.2, { gain: 1.6 }); }
  } else if (id === 14) {
    const s = earthGusS(id, f), speed = Math.sqrt(Math.max(0, 1 - (s / 0.93) ** 2));
    mini(c, s, 1.9, s < 0.6 ? 1 : 0, f > 1080 ? "smile" : "o", speed * 0.9, true);
    if (f >= ARROW_POP - 1) {
      const u = (f - (ARROW_POP - 1)) / 6, pop = u < 1 ? 1.25 * Math.sin((Math.PI / 2) * u) : 1 + 0.25 * Math.exp(-(u - 1) * 1.0) * Math.cos((u - 1) * 2.0);
      const flip = clamp01((f - (PASS - 3)) / 6), dir = flip < 0.5 ? 1 : -1, sq = Math.abs(Math.cos(Math.PI * flip)); // squash through zero as it flips
      const kick = f >= PASS && f < PASS + 8 ? 1 + 0.25 * Math.sin(Math.PI * (f - PASS) / 8) : 1;
      const size = (0.75 + 0.6 * Math.abs(s)) * pop * kick, len = 1.75 * size * Math.max(0.08, sq);
      // the arrow sits beside the tunnel, between Gus and the centre, always pointing AT the centre
      const mid = s * 0.5, p = earthPoint(mid, 0.85, 1.75);
      fx(c, "arrow", 300, 520, (pp) => fxArrow(pp), p, 1.0 * size, len, { rot: EARTH_ROLL + (dir > 0 ? 0 : Math.PI) });
      // the middle: a pulsing ring that the arrow points at
      const r = q(((f * 0.035) % 1), 30);
      fx(c, `ring${r}`, 600, 600, (pp) => fxRing(pp, r), earthPoint(0, 0.6), 1.7, 1.7);
    }
  }
};

// ---------------- the park swing (the template's push, re-timed by story.swingTheta) ----------------
/** the swing kid's back in world space when the swing is at angle th */
const kidBack = (th: number): [number, number] => {
  const lx = -0.083, ly = -2.174; // local to the swing card (pivot at the origin), card yawed by PI
  return [PARK[0] - (lx * Math.cos(th) - ly * Math.sin(th)), PARK[1] + 2.88 + lx * Math.sin(th) + ly * Math.cos(th)];
};
const pushSpot = (k: number) => {
  const A = (swingAmp(PUSHES[k] - 1) * Math.PI) / 180, [bx, by] = kidBack(-A);
  const cy = 975 - (by - PARK[1]) / SU, dy = cy - 515, dx = Math.sqrt(Math.max(120 * 120, 222 * 222 - dy * dy));
  return { px: bx + (53 + dx) * SU, hand: [300 + 53 + dx, cy] as [number, number] };
};
const park = (c: Ctx) => {
  const { f, cam } = c, th = swingAngle(f), vel = Math.sin(swingTheta(f));
  const A = (swingAmp(f) * Math.PI) / 180, kick = q(0.35 + 0.55 * vel, 40);
  const expr: Expr = A < 0.4 ? "smile" : A < 0.62 ? "grin" : "laugh";
  const light = light2D(cam, true), lid = lidAt(f, 78);
  c.out.places.push({ key: `swing|${kick}|${expr}|${q(light)}|${lid}`, geo: "swing", x: PARK[0], y: PARK[1] + 2.88, z: PARK[2], yaw: Math.PI, roll: th,
    draw: (p) => swingKid(p, KID, kick, expr, light, lid), size: [490, 1610, 0.7] });
  const push = Math.max(0, ...PUSHES.map((fp) => 1 - Math.abs(f - fp + 1.5) / 9.6));
  let k = 0;
  while (k < PUSHES.length - 1 && f > PUSHES[k] + 10) k++;
  const cur = pushSpot(k), prev = pushSpot(Math.max(0, k - 1));
  const step = k > 0 ? smooth((f - (PUSHES[k - 1] + 10)) / (PUSHES[k] - PUSHES[k - 1] - 22)) : 1;
  const px = prev.px + (cur.px - prev.px) * step, pz = PARK[2] + 0.1;
  const so: SideOpts = { mode: "push", pose: q(push, 40), expr: push > 0.3 ? "grin" : "smile", blink: lidAt(f, 77), hand: cur.hand, light, seed: 4 };
  const d = cam.pos.distanceTo(tmp.set(px, PARK[1] + 1.2, pz)), [w, h, kk] = tier(d);
  c.out.places.push({ key: `parent|${fkey(so)}`, x: px, y: PARK[1], z: pz, yaw: Math.PI, draw: (p) => bodySide(p, PARENT, so), size: [w, h, kk] });
  blob(c, px, PARK[1], pz);
};

// ---------------- the ocean ----------------
const ocean = (c: Ctx) => {
  const { id, f } = c, y = seaGusY(f);
  const bobY = 0.025 * Math.sin(f * 0.07), fpos: V3 = [FISHER_AT[0], FISHER_AT[1] + bobY, FISHER_AT[2]];
  // --- Gus ---
  const out = y > PIPE_H - 1.75;
  if (out && f >= POP_SEA - 1) {
    let pose: Pose;
    if (id === 16) {
      const k = sm(f, POP_SEA + 30, STOP_SEA);
      pose = { expr: f < STOP_SEA - 20 ? "wow" : "nervous", look: f > STOP_SEA - 12 ? 1 : 0, facing: f > STOP_SEA - 12 ? 1 : 0, blink: lidAt(f, 14, [STOP_SEA - 20]),
        L: armMix({ h: [0.14, 0.92], bend: 0.05 }, { h: [0.5, 0.55], bend: 0.12 }, k), R: armMix({ h: [0.14, 0.92], bend: 0.05 }, { h: [0.5, 0.55], bend: 0.12 }, k) };
    } else if (f < SINK_SEA - 3) {
      const wave = f >= 1480 && f < 1530;
      pose = { expr: f < 1468 ? "nervous" : wave ? "relief_open" : "relief", facing: 1, look: 1, blink: lidAt(f, 14, [1468, 1480]), headTilt: wave ? 5 : 0,
        L: { h: [0.4, 0.62], bend: 0.12 }, R: wave ? { h: [0.62 + 0.12 * Math.sin((f - 1480) * 0.75), -0.6], bend: -0.25 } : armMix({ h: [0.5, 0.55], bend: 0.12 }, { h: [0.62, -0.6], bend: -0.25 }, sm(f, 1475, 1481) * (1 - sm(f, 1530, 1538))) };
    } else {
      const grab = sm(f, 1566, 1578), gone = f >= GONE_SEA - 2;
      pose = { mode: gone ? "air" : "stand", expr: gone ? "shock" : f < 1568 ? "sad" : "nervous", facing: 1, look: 1, blink: 0, tilt: 10 * grab * (gone ? 0.3 : 1),
        L: gone ? { h: [0.5, -0.8], bend: -0.12 } : { h: [0.45, 0.4], bend: 0.12 }, R: gone ? { h: [0.55, -0.78], bend: -0.12 } : armMix({ h: [0.5, 0.55], bend: 0.12 }, { h: [1.04, -0.22], bend: 0.02, front: true }, grab),
        legs: [[-0.26, 1.28], [0.3, 1.26]], flap: gone ? (f * 0.25) % 1 : undefined };
    }
    put(c, GUS, pose, [0, y, 0]);
  }
  if (f >= POP_SEA && f < POP_SEA + 7) { const u = (f - POP_SEA) / 7; fx(c, `pop${q(u, 28)}`, 500, 300, (p) => fxPop(p, q(u, 28)), [0, PIPE_H + 0.2, 0.3], 2.0, 1.2); }
  // --- the fisherman ---
  const awake = f >= POP_SEA + 3, follow = clamp01((y - PIPE_H) / 1.6);
  let fp: Pose;
  if (!awake) fp = { mode: "chair", expr: "asleep", headTilt: 13 + 1.5 * Math.sin(f * 0.07), tilt: 3, L: { h: [0.2, 0.6], bend: 0.2 }, R: { h: [0.22, 0.6], bend: 0.2 } };
  else if (id === 16) fp = { mode: "chair", expr: "shock", facing: -1, look: -1, headTilt: -4 - 9 * follow, L: { h: [0.3, 0.5], bend: 0.2 }, R: { h: [0.3, 0.5], bend: 0.2 } };
  else {
    const wv = id === 17 ? sm(f, 1496, 1510) : 1, frozen = f >= SINK_SEA + 10;
    const ph = frozen ? 1.2 : (f - 1500) * 0.28;
    fp = { mode: "chair", expr: f >= GONE_SEA + 2 ? "wow" : id === 17 && f < 1492 ? "shock" : "wow", facing: -1, look: -1, headTilt: f >= GONE_SEA ? lerp(-13, 6, sm(f, GONE_SEA, GONE_SEA + 8)) : -13,
      blink: lidAt(f, 15, [1492]), R: { h: [0.3, 0.5], bend: 0.2 },
      L: armMix({ h: [0.3, 0.5], bend: 0.2 }, { h: [0.6 + 0.1 * Math.sin(ph), -0.52], bend: -0.25 }, wv) };
  }
  put(c, FISHER, fp, fpos);
  if (!awake) { // sleep bubble
    const k = q(0.5 - 0.5 * Math.cos((f - 1268) * 0.105), 24), s = 0.3;
    fx(c, `bubble${k}`, 200, 200, (p) => fxBubble(p, k), [fpos[0] - 0.2 - 0.07 * k, fpos[1] + 1.02 - 0.03 * k, fpos[2] + 0.06], s, s, { gain: 0.8 });
  } else if (f < POP_SEA + 9) { const u = (f - POP_SEA - 3) / 6; fx(c, `bpop${q(u, 20)}`, 500, 500, (p) => fxBurst(p, q(u, 20), "#d8eeff", 8, 30, 200), [fpos[0] - 0.25, fpos[1] + 1.0, fpos[2] + 0.06], 0.6, 0.6); }
  // --- rings on the water around the pipe and the boat ---
  for (let i = 0; i < 2; i++) { const u = q((((f + i * 33) % 66) / 66), 33); fx(c, `ring${u}`, 600, 600, (p) => fxRing(p, u), [i ? FISHER_AT[0] - 0.1 : 0, 0.03, i ? FISHER_AT[2] : 0], i ? 4.6 : 2.6, i ? 3.0 : 2.6, { flat: true, gain: 0.55 }); }
};

/** everything with a face (and every 2D effect card) in shot `id` at frame f */
export const stage = (id: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] }, s = SHOTS[id - 1];
  const c: Ctx = { id, f, cam, out, light: s.light };
  if (s.place === "shaft") shaft(c);
  else if (s.place === "garden") garden(c);
  else if (s.place === "earth") earth(c);
  else if (s.place === "park") park(c);
  else ocean(c);
  return out;
};
export { FPS, HANG_Y };
