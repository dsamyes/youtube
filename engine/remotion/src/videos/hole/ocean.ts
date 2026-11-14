// Open ocean at night on the far side of the world: the template's water (depression-angle gradient + drifting crest
// and glint marks, night palette), the far mouth of the tunnel (a wide flanged pipe standing out of the sea), and a
// wooden rowboat with a lantern on a pole, a fishing rod over the side and its float. The moon and the stars belong
// to world.ts (sky); the fisherman and Gus are cards (cast.ts).
import * as THREE from "three";
import { lam, V, boxGeo } from "./build";
import { beamHD, planksHD, rep, waterNear, waterFar } from "./paint";
import { pipeHD, glowTex } from "./paint2";
import { twoTone, LFB, untone } from "./shade";
import { NOINK } from "./ink";
import { WorldLook } from "./lights";
import { PIPE_H, BOAT, HOLE_R } from "./story";

const TAU = Math.PI * 2;
const WATER_DECL = `#include <common>
varying vec3 vWP;
uniform vec3 wNearC, wMidC, wFarC, wCrest, wTrough, wGlint, wShade;
uniform sampler2D wNearTex, wFarTex;
uniform float wTime;`;
const WATER_COL = `
  vec3 wV = vWP - cameraPosition;
  float wd = length(wV);
  float wDep = asin(clamp(-wV.y / wd, 0.0, 1.0));       // depression angle of the view ray
  float wf = 1.0 - smoothstep(0.0, 0.42, wDep);         // 1 at the horizon .. 0 at 24 deg down
  vec3 wc = mix(mix(wNearC, wMidC, smoothstep(0.0, 0.55, wf)), wFarC, smoothstep(0.55, 1.0, wf));
  vec2 wp = vWP.xz + vec2(0.25 * wTime, 0.12 * wTime);  // slow swell drift
  vec4 mk = mix(texture2D(wNearTex, wp / 8.0), texture2D(wFarTex, wp / 40.0 + 0.37), smoothstep(25.0, 90.0, wd));
  wc = mix(wc, wTrough, mk.g * 0.6);
  wc = mix(wc, wCrest, mk.r * 0.7);
  wc = mix(wc, wGlint, mk.b * (0.3 + 0.5 * wf));
  diffuseColor.rgb = wc;`;
const cyl = (a: THREE.Vector3, b: THREE.Vector3, r0: number, r1 = r0, seg = 10) => {
  const g = new THREE.CylinderGeometry(r1, r0, a.distanceTo(b), seg);
  return g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()), V(1, 1, 1)));
};

/** lofted rowboat hull, bow toward +z: outer skin, inner skin, gunwale cap, transom. length L, beam B */
const hull = (L: number, B: number) => {
  const NS = 18, NA = 12, out: THREE.BufferGeometry[] = [];
  const half = (t: number) => { const u = 2 * t - 1; return u > 0 ? (B / 2) * Math.max(0, 1 - u ** 2.3) ** 0.75 : (B / 2) * (0.8 + 0.2 * (1 - u * u)); }; // pointed bow, squarer stern
  const sheer = (t: number) => 0.4 + 0.2 * Math.max(0, 2 * t - 1) ** 2 + 0.04 * Math.max(0, 1 - 2 * t) ** 2;
  const keel = (t: number) => -0.14 + 0.2 * Math.max(0, 2 * t - 1) ** 3;
  const skin = (k: number, flip: boolean) => {
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let i = 0; i <= NS; i++) {
      const t = i / NS, z = (t - 0.5) * L, b = half(t) * k + (k < 1 ? -0.0 : 0), y1 = sheer(t), y0 = keel(t) + (1 - k) * 0.5;
      for (let j = 0; j <= NA; j++) { const a = (j / NA) * Math.PI; pos.push(b * Math.cos(a), y1 - (y1 - y0) * Math.sin(a) ** 0.72, z); uv.push(t * 2, j / NA); }
    }
    for (let i = 0; i < NS; i++) for (let j = 0; j < NA; j++) { const a = i * (NA + 1) + j, c = a + NA + 1; if (flip) idx.push(a, a + 1, c, a + 1, c + 1, c); else idx.push(a, c, a + 1, a + 1, c, c + 1); }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    return g;
  };
  out.push(skin(1, false), skin(0.9, true));
  // gunwale cap + transom (flat pieces: their creases take the ink)
  const cap: number[] = [], capI: number[] = [];
  for (let i = 0; i <= NS; i++) { const t = i / NS, z = (t - 0.5) * L, y = sheer(t) + 0.005; for (const s of [-1, 1]) { cap.push(s * half(t), y, z, s * half(t) * 0.86, y, z); } }
  for (let i = 0; i < NS; i++) for (const o of [0, 2]) { const a = i * 4 + o, c = a + 4; if (o === 0) capI.push(a, a + 1, c, a + 1, c + 1, c); else capI.push(a, c, a + 1, a + 1, c, c + 1); }
  const cg = new THREE.BufferGeometry(); cg.setAttribute("position", new THREE.Float32BufferAttribute(cap, 3));
  cg.setAttribute("uv", new THREE.Float32BufferAttribute(cap.filter((_v, i) => i % 3 !== 1), 2)); cg.setIndex(capI); cg.computeVertexNormals();
  const tr: number[] = [0, sheer(0), -L / 2], ti: number[] = [];
  for (let j = 0; j <= NA; j++) { const a = (j / NA) * Math.PI, b = half(0); tr.push(b * Math.cos(a), sheer(0) - (sheer(0) - keel(0)) * Math.sin(a) ** 0.72, -L / 2); if (j) ti.push(0, j + 1, j); }
  const tg = new THREE.BufferGeometry(); tg.setAttribute("position", new THREE.Float32BufferAttribute(tr, 3));
  tg.setAttribute("uv", new THREE.Float32BufferAttribute(tr.filter((_v, i) => i % 3 !== 2), 2)); tg.setIndex(ti); tg.computeVertexNormals();
  return { skins: out, cap: cg, transom: tg, sheer, half };
};

export class Ocean {
  group = new THREE.Group();
  private WU: Record<string, THREE.IUniform>;
  private boat = new THREE.Group();
  private float: THREE.Mesh; private lineG: THREE.Mesh;
  private lamp: THREE.MeshBasicMaterial; private halo: THREE.Sprite;

  constructor() {
    const R = this.group;
    // ---- water ----
    const wNear = waterNear(), wFar = waterFar();
    for (const t of [wNear, wFar]) { t.colorSpace = THREE.NoColorSpace; t.anisotropy = 16; t.needsUpdate = true; }
    this.WU = {
      wNearC: { value: new THREE.Color() }, wMidC: { value: new THREE.Color() }, wFarC: { value: new THREE.Color() },
      wCrest: { value: new THREE.Color() }, wTrough: { value: new THREE.Color() }, wGlint: { value: new THREE.Color() },
      wShade: { value: new THREE.Vector3(0.5, 0.56, 0.72) }, wNearTex: { value: wNear }, wFarTex: { value: wFar }, wTime: { value: 0 },
    };
    const waterM = new THREE.MeshLambertMaterial({ color: 0xffffff });
    waterM.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, this.WU);
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWP;")
        .replace("#include <project_vertex>", "#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", WATER_DECL)
        .replace("#include <map_fragment>", WATER_COL)
        .replace("#include <lights_fragment_begin>", "float sunVis = 1.0;\n" + LFB)
        .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\n  reflectedLight.directDiffuse = diffuseColor.rgb * mix(wShade, vec3(1.0), sunVis);\n  reflectedLight.indirectDiffuse = vec3(0.0);");
    };
    waterM.customProgramCacheKey = () => "sea1";
    const wm = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000).rotateX(-Math.PI / 2), waterM);
    wm.receiveShadow = true;
    R.add(wm);
    // ---- the pipe: the far mouth of the tunnel ----
    const pipeM = lam("pipeHD", () => ({ map: pipeHD() })), rimM = lam("pipeRim", () => ({ color: "#a4aeb9" })), dark = new THREE.MeshBasicMaterial({ color: "#05060c" });
    const ro = HOLE_R + 0.09, rf = HOLE_R + 0.22, H = PIPE_H;
    const add = (g: THREE.BufferGeometry, m: THREE.Material, cast = true) => { const x = new THREE.Mesh(g, m); x.castShadow = cast; x.receiveShadow = true; R.add(x); return x; };
    add(new THREE.CylinderGeometry(ro, ro + 0.03, H + 1.6, 36, 1, true).translate(0, (H - 1.6) / 2, 0), pipeM);
    add(new THREE.CylinderGeometry(rf, rf, 0.15, 36, 1, true).translate(0, H - 0.075, 0), rimM);
    add(new THREE.RingGeometry(HOLE_R, rf, 36).rotateX(-Math.PI / 2).translate(0, H, 0), rimM);
    add(new THREE.RingGeometry(ro, rf, 36).rotateX(Math.PI / 2).translate(0, H - 0.15, 0), rimM);
    const inner = add(new THREE.CylinderGeometry(HOLE_R, HOLE_R, 2.4, 36, 1, true).translate(0, H - 1.2, 0), lam("pipeIn", () => ({ color: "#3a4352", side: THREE.BackSide })), false);
    inner.receiveShadow = false;
    add(new THREE.CircleGeometry(HOLE_R, 28).rotateX(-Math.PI / 2).translate(0, H - 1.25, 0), dark, false);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + 0.2; add(new THREE.SphereGeometry(0.035, 8, 6).translate(Math.cos(a) * (rf - 0.07), H + 0.012, Math.sin(a) * (rf - 0.07)), lam("pipeBolt", () => ({ color: "#5b6472" }))); }
    // ---- the rowboat ----
    const B = this.boat, L = 2.7, W = 1.16, h = hull(L, W);
    const wood = lam("boatWood", () => ({ map: rep(planksHD(), 1, 1), color: "#d9c3a4", side: THREE.DoubleSide })), woodIn = lam("boatIn", () => ({ map: rep(beamHD(), 2, 1), color: "#caa98a", side: THREE.DoubleSide }));
    const trim = lam("boatTrim", () => ({ color: "#e9e2cf", side: THREE.DoubleSide })), seat = lam("boatSeat", () => ({ map: rep(beamHD(), 1, 1) }));
    const iron = twoTone(new THREE.MeshPhongMaterial({ color: "#3d414c", specular: "#8a8a8a", shininess: 60 }), 0.15);
    const bm = (g: THREE.BufferGeometry, m: THREE.Material) => { const x = new THREE.Mesh(g, m); x.castShadow = true; x.receiveShadow = true; B.add(x); return x; };
    bm(h.skins[0], wood); bm(h.skins[1], woodIn); bm(h.cap, trim); bm(h.transom, wood);
    for (const z of [-0.6, 0.45]) bm(boxGeo(V(-h.half(z / L + 0.5) * 0.9, 0.2, z - 0.11), V(h.half(z / L + 0.5) * 0.9, 0.24, z + 0.11), 1), seat);
    // oars shipped along the gunwales
    for (const s of [-1, 1]) {
      bm(cyl(V(s * 0.5, 0.44, -0.9), V(s * 0.4, 0.5, 0.95), 0.02, 0.02, 8), seat);
      bm(boxGeo(V(s * 0.4 - 0.07, 0.49, 0.9), V(s * 0.4 + 0.07, 0.51, 1.3), 1), seat);
    }
    // lantern on a pole at the stern: warm glass (HDR, blooms) + a soft halo
    bm(cyl(V(0.0, 0.3, -1.2), V(0.0, 1.95, -1.25), 0.022, 0.018, 8), iron);
    bm(cyl(V(0.0, 1.95, -1.25), V(0.0, 1.98, -0.98), 0.014, 0.014, 6), iron);
    this.lamp = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.9, 0.6) });
    const glass = bm(new THREE.CylinderGeometry(0.075, 0.085, 0.2, 10).translate(0, 1.76, -0.98), this.lamp); glass.castShadow = false;
    bm(new THREE.ConeGeometry(0.11, 0.08, 10).translate(0, 1.9, -0.98), iron);
    bm(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 10).translate(0, 1.65, -0.98), iron);
    this.halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(1.5, 0.82, 0.3), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
    this.halo.position.set(0, 1.76, -0.98); this.halo.scale.setScalar(2.3); this.halo.layers.set(NOINK); this.halo.renderOrder = 4;
    B.add(this.halo);
    // fishing rod propped over the side, its line and float
    // the rod rests on the boat: butt on the floor boards by his feet, lying across the gunwale, tip out over the water
    const tip = V(1.95, 0.86, 0.3);
    bm(cyl(V(-0.12, 0.2, -0.28), tip, 0.022, 0.008, 6), lam("rod", () => ({ color: "#6e4b33" })));
    this.lineG = bm(new THREE.CylinderGeometry(0.004, 0.004, 1, 4).translate(0, -0.5, 0), iron); this.lineG.position.copy(tip); this.lineG.castShadow = false;
    B.position.set(BOAT[0], 0, BOAT[2]); B.rotation.y = -0.5; // three-quarter view: the near gunwale runs in front of his legs
    R.add(B);
    this.float = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8).scale(1, 1.3, 1), lam("floatRed", () => ({ color: "#e2453c" })));
    R.add(this.float);
  }

  /** set the palette from the light's look and animate the swell */
  pose(f: number, K: WorldLook) {
    const W = this.WU, wc = K.water, t = f / 30;
    untone(wc.near, W.wNearC.value); untone(wc.mid, W.wMidC.value); untone(wc.far, W.wFarC.value);
    untone(wc.crest, W.wCrest.value); untone(wc.trough, W.wTrough.value); untone(wc.glint, W.wGlint.value);
    W.wShade.value.set(...wc.shade); W.wTime.value = t;
    const B = this.boat;
    B.position.y = 0.025 * Math.sin(f * 0.07);
    B.rotation.z = 0.02 * Math.sin(f * 0.05 + 1); B.rotation.x = 0.012 * Math.sin(f * 0.043);
    B.updateMatrixWorld();
    // the float bobs on the water; the line runs from the rod tip to it
    const tip = this.lineG.getWorldPosition(new THREE.Vector3()), fl = new THREE.Vector3(tip.x + 0.25, 0.03 + 0.02 * Math.sin(f * 0.09), tip.z + 0.2);
    this.float.position.copy(fl);
    const d = fl.clone().sub(tip), len = d.length();
    this.lineG.scale.set(1, len, 1);
    this.lineG.quaternion.copy(B.quaternion.clone().invert()).multiply(new THREE.Quaternion().setFromUnitVectors(V(0, -1, 0), d.normalize()));
    const fk = 1 + 0.06 * Math.sin(f * 0.9) + 0.04 * Math.sin(f * 1.7 + 1);
    this.lamp.color.setRGB(3.2 * fk, 1.9 * fk, 0.6 * fk);
    this.halo.scale.setScalar(2.3 * (0.96 + 0.04 * fk));
  }
}
