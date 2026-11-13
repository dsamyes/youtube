// One three.js scene for the whole short: sky, key light, fog, sun / moon, stars, clouds, the cast, and five places
// (each its own group, built the first time a shot needs it, only one visible at a time):
//   garden + park (town.ts), the shaft (shaft.ts), the Earth cutaway (earth.ts), the night ocean (ocean.ts).
// update(id, f, camera) poses everything for shot `id` at frame f (a pure function of id + f); bind() writes the
// shared shading uniforms of THIS world right before its canvas is drawn (two canvases are alive during a crossfade).
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { staticFile } from "remotion";
import { V, Kit, Ray } from "./build";
import { ctex, cloudHD } from "./paint";
import { starsHD, moonTex } from "./paint2";
import { LIGHTS, LOOK, LightPreset, LightName } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { CARD_K } from "./cardshade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage, SU_SWING, CamInfo } from "./cast";
import { SHOTS, camAt, ShotDef, tunnelK, shaftHeat, shaftScroll, shaftSpeed, lerp, earthGusS } from "./story";
import { Town } from "./town";
import { Shaft } from "./shaft";
import { Earth } from "./earth";
import { Ocean } from "./ocean";

// ---------------- assets ----------------
const KENNEY = ["flower_redA", "flower_redB", "flower_redC", "flower_yellowA", "flower_yellowB", "flower_yellowC", "flower_purpleA", "flower_purpleB", "flower_purpleC",
  "pot_large", "log_stack", "stump_round", "path_stone"];
let kitP: Promise<Kit> | null = null;
export const loadKit = () => {
  if (!kitP) {
    const loader = new GLTFLoader();
    kitP = Promise.all(KENNEY.map((n) => loader.loadAsync(staticFile(`toon/kenney/${n}.glb`)).then((g) => [n, g.scene] as const).catch(() => [n, null] as const)))
      .then((list) => Object.fromEntries(list.filter((e) => e[1]).map(([n, s]) => [n, s!])) as Kit);
  }
  return kitP;
};

/** sun disc (solid, soft rim) and the flat golden halo */
const discTex = () => ctex("sunDisc", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const haloTex = () => ctex("sunHalo", 256, 256, (g) => {
  const im = g.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const u = Math.hypot(x - 127.5, y - 127.5) / 128;
    const a = (0.55 * Math.exp(-((u / 0.25) ** 2)) + 0.35 * Math.exp(-((u / 0.6) ** 2))) * (1 - Math.min(1, Math.max(0, (u - 0.8) / 0.2)));
    const i = (y * 256 + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = 255; im.data[i + 3] = Math.round(255 * Math.min(1, a));
  }
  g.putImageData(im, 0, 0);
});

/** per-shot key light: camera-relative az / el (the template's rule), or an absolute world direction TOWARD the light */
const SUN_SHOT: Record<number, { az?: number; el?: number; abs?: [number, number, number] }> = {
  15: { az: -30, el: 18 },             // park: ringed by trees and houses (template)
  4: { az: 118 }, 5: { az: 105 }, 6: { az: 110 }, 13: { az: 112 }, // character shots: the sun over the lens's right shoulder (front-lit sets)
  20: { az: -84, el: 19 }, 21: { az: -84, el: 19 }, // evening garden: low sun from the open west side (screen left)
  3: { abs: [-0.5, 0.48, 0.72] }, 10: { abs: [-0.5, 0.48, 0.72] }, 14: { abs: [-0.5, 0.48, 0.72] },
  16: { az: -55, el: 38 }, 17: { az: -55, el: 38 }, 18: { az: -55, el: 38 },
};
for (const id of [1, 7, 8, 9, 11, 12, 19]) SUN_SHOT[id] = { abs: [0.12, -1, 0.2] }; // shaft: the glow below is the key
/** where the moon hangs in the night sky (world direction): low over the horizon, right behind where Gus stops */
const MOON_DIR = new THREE.Vector3(Math.sin(0.02) * Math.cos(0.27), Math.sin(0.27), -Math.cos(0.02) * Math.cos(0.27)).normalize();

/** shaft light by depth (0 crust, 1 mantle, 2 core): what the cards and ledges get */
const SHAFT_L: { lit: number[]; shade: number[]; tint: number[]; gain: number }[] = [
  { lit: [1.05, 0.82, 0.62], shade: [0.34, 0.25, 0.22], tint: [1.0, 0.93, 0.86], gain: 0.92 },
  { lit: [1.7, 0.85, 0.42], shade: [0.5, 0.16, 0.1], tint: [1.0, 0.8, 0.62], gain: 1.0 },
  { lit: [2.6, 2.2, 1.4], shade: [1.2, 0.8, 0.34], tint: [1.0, 0.95, 0.74], gain: 1.07 },
];
const GAIN: Record<LightName, number> = { day: 1.03, golden: 1.03, night: 0.86, space: 1.03, shaft: 1 };

/** lens positions of the garden / park shots looking at their subjects (houses and trees there are left out) */
const sightLines = (): Ray[] => {
  const out: Ray[] = [];
  for (const s of SHOTS) {
    if (s.place !== "garden" && s.place !== "park") continue;
    for (let f = s.a - 8; f < s.b + 8; f += 2) {
      const c = camAt(s.id, Math.max(0, f)), o = V(...c.pos), look = V(...c.look);
      const fw = look.clone().sub(o), len = fw.length();
      fw.normalize();
      const rt = fw.clone().cross(V(0, 1, 0)).normalize(), up = rt.clone().cross(fw);
      const ty = Math.tan((c.fov * Math.PI) / 360), tx = ty * (9 / 16);
      for (const [sx, sy] of [[0, 0], [-0.6, 0], [0.6, 0], [0, 0.6], [0, -0.4]])
        out.push({ o, d: fw.clone().addScaledVector(rt, sx * tx).addScaledVector(up, sy * ty), len, core: sx === 0 && sy === 0 });
    }
  }
  return out;
};

type Cur = { L: LightPreset; lit: number[]; shade: number[]; tint: number[]; gain: number; light: LightName };

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private swing: Actor;
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private stars: THREE.Mesh;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunDisc: THREE.Sprite; private sunHalo: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<string, THREE.Texture[]>;
  private clouds: THREE.Mesh[] = [];
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();
  private town?: Town; private shaft?: Shaft; private earth?: Earth; private ocean?: Ocean;
  private cur: Cur = { L: LIGHTS.day, lit: LIGHTS.day.lit, shade: LIGHTS.day.shade, tint: LIGHTS.day.charTint, gain: 1.03, light: "day" };
  private discMap: THREE.Texture; private moonMap: THREE.Texture;

  constructor(private kit: Kit) {
    const R = this.root;
    // sky: 5 colour stops by elevation, written as tone-map-inverted linear values
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    this.stars = new THREE.Mesh(new THREE.SphereGeometry(1000, 48, 24), new THREE.MeshBasicMaterial({ map: starsHD(), side: THREE.BackSide, depthWrite: false, fog: false,
      transparent: true, blending: THREE.AdditiveBlending }));
    this.stars.renderOrder = -0.9; this.stars.frustumCulled = false; this.stars.layers.set(NOINK);
    R.add(this.sky, this.stars);
    this.discMap = discTex(); this.moonMap = moonTex();
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.discMap, color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false, transparent: true }));
    this.sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: new THREE.Color(1, 1, 1), fog: false, depthWrite: false, depthTest: true,
      transparent: true, blending: THREE.AdditiveBlending }));
    this.sunDisc.renderOrder = -0.5; this.sunHalo.renderOrder = 5;
    for (const m of [this.sunDisc, this.sunHalo]) { m.frustumCulled = false; m.layers.set(NOINK); R.add(m); }
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(SHADOW_MAP, SHADOW_MAP);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)), night: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.night.cloud)) };
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, d = 620 + (i % 3) * 60;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 130 + (i % 4) * 30;
      m.position.set(Math.cos(a) * d, 120 + (i % 4) * 38, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }
    this.swing = new Actor(R, swingGeo);
  }

  /** key-light direction (toward the light), frozen per shot: camera-relative az / el unless the shot fixes it */
  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    const o = SUN_SHOT[id];
    if (o?.abs) v = new THREE.Vector3(...o.abs).normalize();
    else {
      let fx = 0, fz = 0;
      for (let f = s.a; f < s.b; f += 3) {
        const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
        fx += x / n; fz += z / n;
      }
      const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
      const az = THREE.MathUtils.degToRad(o?.az ?? L.az), el = THREE.MathUtils.degToRad(o?.el ?? L.el);
      const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az); // screen right = (-fz, fx)
      v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    }
    this.sunCache.set(id, v);
    return v;
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }
  private show(o: { group: THREE.Group } | undefined, on: boolean) { if (o) o.group.visible = on; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const s = SHOTS[id - 1], L = LIGHTS[s.light], K = LOOK[s.light], R = this.root;
    // ---- places: build on first use, show only this shot's ----
    const town = s.place === "garden" || s.place === "park";
    if (town && !this.town) { this.town = new Town(this.kit, sightLines()); R.add(this.town.group); }
    if (s.place === "shaft" && !this.shaft) { this.shaft = new Shaft(); R.add(this.shaft.group); }
    if (s.place === "earth" && !this.earth) { this.earth = new Earth(); R.add(this.earth.group); }
    if (s.place === "ocean" && !this.ocean) { this.ocean = new Ocean(); R.add(this.ocean.group); }
    this.show(this.town, town); this.show(this.shaft, s.place === "shaft"); this.show(this.earth, s.place === "earth"); this.show(this.ocean, s.place === "ocean");
    // ---- camera ----
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK); // sky, clouds, cards and sprites live on the no-ink layer but are still rendered
    // ---- key light: frozen per shot, shadow fitted around the subject ----
    const sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    let Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 95);
    if (s.light === "golden") Rr = Math.max(Rr, 30); // low sun: 2 m cards throw long shadows
    if (!town) Rr = 12;
    this.sun.position.copy(focus).addScaledVector(sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    const cur: Cur = { L, lit: L.lit, shade: L.shade, tint: L.charTint, gain: GAIN[s.light], light: s.light };
    // ---- the place ----
    if (s.place === "shaft") {
      const heat = shaftHeat(id, f), h = Math.max(0, Math.min(2, heat)), i = Math.min(1, Math.floor(h)), k = h - i, a = SHAFT_L[i], b = SHAFT_L[i + 1];
      this.shaft!.pose(heat, shaftScroll(id, f), shaftSpeed(id, f));
      const mix3 = (x: number[], y: number[]) => x.map((q, j) => lerp(q, y[j], k));
      cur.lit = mix3(a.lit, b.lit); cur.shade = mix3(a.shade, b.shade); cur.tint = mix3(a.tint, b.tint); cur.gain = lerp(a.gain, b.gain, k);
    } else if (s.place === "earth") {
      const sG = earthGusS(id, f), near = Math.max(0, 1 - Math.abs(sG) / 0.25);
      this.earth!.pose(id === 3 ? tunnelK(f) : 1, 1 + 0.25 * near + 0.04 * Math.sin(f * 0.21));
    } else if (s.place === "ocean") this.ocean!.pose(f, K);
    else this.town!.pose(id, f, cam, s.a, s.b);
    this.cur = cur;
    // ---- sky, fog (colour = horizon colour), sun / moon, stars, clouds ----
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((hx, i) => untone(hx, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position); this.stars.position.copy(cam.position);
    this.sky.visible = s.place !== "shaft";
    this.stars.visible = s.light === "night" || s.light === "space";
    (this.stars.material as THREE.MeshBasicMaterial).color.setScalar(s.light === "space" ? 1.15 : 0.9);
    this.stars.rotation.set(0.3, s.light === "space" ? 1.1 : 2.2, 0);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    const golden = s.light === "golden", night = s.light === "night";
    this.sunDisc.visible = this.sunHalo.visible = golden || night;
    if (golden || night) {
      const dir = night ? MOON_DIR : sunDir, dm = this.sunDisc.material as THREE.SpriteMaterial, hm = this.sunHalo.material as THREE.SpriteMaterial;
      this.sunDisc.position.copy(cam.position).addScaledVector(dir, 900);
      this.sunDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(night ? 5.2 : 1.7)));
      this.sunHalo.position.copy(this.sunDisc.position); this.sunHalo.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(night ? 17 : 24)));
      dm.map = night ? this.moonMap : this.discMap;
      if (night) dm.color.setRGB(1.25, 1.25, 1.18); else dm.color.setRGB(6.0, 4.4, 2.4);
      hm.color.set(L.sunDisc).multiplyScalar(night ? 0.55 : 1.3);
    }
    const cloudSet = this.cloudMaps[s.light];
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i], mat = m.material as THREE.MeshBasicMaterial;
      m.visible = !!cloudSet && !(night && i % 3 === 0);
      if (!cloudSet) continue;
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      mat.map = cloudSet[i % 4];
      mat.color.setScalar(night ? 0.9 : 1.1);
    }
    // ---- cast + effects ----
    const ci: CamInfo = { pos: cam.position, right: V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0), up: V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 1),
      fwd: cam.getWorldDirection(V(0, 0, 0)), sun: sunDir, roll: c.roll };
    const st = stage(id, f, ci);
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (p.geo !== "swing" && !this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = p.geo === "swing" ? this.swing : this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      if (p.face) { a.mesh.quaternion.copy(cam.quaternion); a.mesh.rotateZ(p.roll ?? 0); }
      else a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      a.mesh.castShadow = p.geo === "swing" ? true : L.actorShadow; // day: soft contact blobs instead
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    if (!used.includes(this.swing)) this.swing.mesh.visible = false;
    let fi = 0;
    const fused: [Fx, number][] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const fxm = this.fx(fi++);
      fxm.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      fxm.use(!!p.soft);
      fxm.mesh.visible = true;
      fxm.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) fxm.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { fxm.mesh.quaternion.copy(cam.quaternion); fxm.mesh.rotateZ(p.rot ?? 0); }
      fxm.mesh.scale.set(Math.max(1e-4, p.w), Math.max(1e-4, p.h), 1);
      fused.push([fxm, p.gain ?? 1]);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const [e2, g] of fused) e2.bind(g);
    return focus;
  }

  /** write this world's light into the shared shading uniforms (call right before this world's canvas is drawn) */
  bind() {
    const { L, lit, shade, tint, gain, light } = this.cur;
    TONE.uLitCol.value.set(lit[0], lit[1], lit[2]); TONE.uShadeCol.value.set(shade[0], shade[1], shade[2]); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...LOOK[light].bounce); TONE.uSat.value = LOOK[light].sat;
    CHAR.uCharTint.value.set(tint[0], tint[1], tint[2]); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    CARD_K.uGain.value = gain;
  }
}

/** shadow map size (the template's value) */
export const SHADOW_MAP = 4096;
const swingGeo = (() => { const g = new THREE.PlaneGeometry(700 * SU_SWING, 2300 * SU_SWING); g.translate(0, -(1150 - 20) * SU_SWING, 0); return g; })();
