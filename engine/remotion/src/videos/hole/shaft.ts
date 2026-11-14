// The inside of the tunnel. Gus and the camera ride at the origin; the round rock tube stands still and its painted
// wall texture scrolls UP past them (shaftScroll), stretched along the fall so it streaks without strobing. Colour and
// glow follow the depth (heat 0 = brown crust, 1 = red/orange mantle, 2 = white-yellow core): a hot glow rises from
// below, darkness sits above, so the tube reads as DOWN. Thin strata rings ride the scroll and take the world ink.
import * as THREE from "three";
import { lam } from "./build";
import { rockMask } from "./paint2";
import { NOINK } from "./ink";
import { SHAFT_R, hash, lerp } from "./story";

type C3 = [number, number, number];
/** palette stops by heat: dark, mid, light wall tones (sRGB hex), glow from below (linear HDR), emission gain */
const PAL: { dark: string; mid: string; light: string; glow: C3; emit: number; ledge: string }[] = [
  { dark: "#33241d", mid: "#7b5338", light: "#b48a5e", glow: [0.55, 0.2, 0.07], emit: 1.0, ledge: "#8a6243" },
  { dark: "#5c130f", mid: "#c23a1d", light: "#ff8a36", glow: [3.2, 1.25, 0.3], emit: 1.15, ledge: "#b5482a" },
  { dark: "#e0862a", mid: "#ffc94a", light: "#fff6cf", glow: [4.2, 3.6, 2.3], emit: 1.75, ledge: "#f2b04a" },
];
const VERT = /* glsl */ `
varying vec3 vWP; varying vec2 vUv;
void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vWP = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const FRAG = /* glsl */ `
uniform sampler2D tMask;
uniform float uScroll, uTileA, uTileB, uEmit, uGlowK;
uniform vec3 cDark, cMid, cLight, cGlow;
varying vec3 vWP; varying vec2 vUv;
void main() {
  float y = vWP.y;
  vec3 a = texture2D(tMask, vec2(vUv.x * 3.0, (y - uScroll) / uTileA)).rgb;          // strata: broad bands sweeping up
  vec3 b = texture2D(tMask, vec2(vUv.x * 6.0 + 0.37, (y - uScroll) / uTileB + 0.21)).rgb; // streaks
  vec3 col = mix(cDark, cMid, smoothstep(0.12, 0.85, a.r));
  col = mix(col, cDark * 0.55, clamp(a.g, 0.0, 1.0) * 0.9);
  col = mix(col, cLight, clamp(b.b, 0.0, 1.0) * 0.85);
  col *= uEmit;
  float dy = y - cameraPosition.y;
  col = mix(col, cGlow, smoothstep(-2.0, -60.0, dy) * uGlowK);   // the hot glow rises from below
  col *= mix(1.0, 0.22, smoothstep(3.0, 40.0, dy));              // darkness above
  gl_FragColor = vec4(col, 1.0);
}`;

/** a strata ring: a thin, slightly lumpy band that wraps the WHOLE tube and stands a hand's width proud of the wall
 *  (smooth normals; the world ink draws its two edges). Isolated ledges read as flying planks in stills. */
const ringGeo = (th: number, hgt: number, seed: number) => {
  const NA = 72, NT = 7, pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= NA; i++) {
    const t = i / NA, a = t * Math.PI * 2;
    const rr = th * (0.8 + 0.3 * Math.sin(a * 3 + seed) + 0.2 * Math.sin(a * 7 + seed * 2.3)), yw = 0.1 * Math.sin(a * 2 + seed * 3) + 0.05 * Math.sin(a * 5 + seed);
    for (let j = 0; j < NT; j++) {
      const p = (j / NT) * Math.PI * 2, c = Math.max(0, Math.cos(p));
      pos.push((SHAFT_R + 0.03 - rr * c) * Math.cos(a), yw + hgt * 0.5 * Math.sin(p), (SHAFT_R + 0.03 - rr * c) * Math.sin(a));
    }
  }
  for (let i = 0; i < NA; i++) for (let j = 0; j < NT; j++) { const a0 = i * NT + j, a1 = i * NT + ((j + 1) % NT), b0 = a0 + NT, b1 = a1 + NT; idx.push(a0, b0, a1, a1, b0, b1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  { // close the seam: first and last ring of vertices share positions, so share their normals too
    const n = g.attributes.normal as THREE.BufferAttribute;
    for (let j = 0; j < NT; j++) { const a0 = j, a1 = NA * NT + j, x = n.getX(a0) + n.getX(a1), y = n.getY(a0) + n.getY(a1), z = n.getZ(a0) + n.getZ(a1), l = Math.hypot(x, y, z) || 1; n.setXYZ(a0, x / l, y / l, z / l); n.setXYZ(a1, x / l, y / l, z / l); }
  }
  g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2));
  return g;
};

const SPAN = 132, LEDGES = 14;
export class Shaft {
  group = new THREE.Group();
  private U: Record<string, THREE.IUniform>;
  private ledges: { m: THREE.Mesh; base: number }[] = [];
  private ledgeMat: THREE.MeshLambertMaterial;
  private glow: THREE.Mesh; private cap: THREE.Mesh;

  constructor() {
    const R = this.group;
    this.U = {
      tMask: { value: rockMask() }, uScroll: { value: 0 }, uTileA: { value: 40 }, uTileB: { value: 12 }, uEmit: { value: 1 }, uGlowK: { value: 1 },
      cDark: { value: new THREE.Color() }, cMid: { value: new THREE.Color() }, cLight: { value: new THREE.Color() }, cGlow: { value: new THREE.Color() },
    };
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(SHAFT_R, SHAFT_R, 900, 56, 1, true),
      new THREE.ShaderMaterial({ uniforms: this.U, vertexShader: VERT, fragmentShader: FRAG, side: THREE.BackSide, fog: false }));
    tube.frustumCulled = false;
    R.add(tube);
    // the far bottom: the glow itself (HDR, blooms); the top: darkness
    this.glow = new THREE.Mesh(new THREE.CircleGeometry(SHAFT_R, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }));
    this.glow.position.y = -440; this.glow.layers.set(NOINK);
    this.cap = new THREE.Mesh(new THREE.CircleGeometry(SHAFT_R, 32).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x050303, fog: false }));
    this.cap.position.y = 440; this.cap.layers.set(NOINK);
    R.add(this.glow, this.cap);
    // strata rings riding the scroll: thin bands all the way round, 14 in the 132 m loop, each a little different
    this.ledgeMat = lam("shaftLedge", () => ({ color: "#8a6243", side: THREE.DoubleSide }));
    for (let i = 0; i < LEDGES; i++) {
      const m = new THREE.Mesh(ringGeo(0.1 + 0.1 * hash(i, 2), 0.16 + 0.2 * hash(i, 4), i * 1.7), this.ledgeMat);
      m.frustumCulled = false;
      this.ledges.push({ m, base: (i + hash(i, 5) * 0.7) * (SPAN / LEDGES) }); R.add(m);
    }
  }

  /** returns the blended palette entry so world.ts can light the cards to match */
  pose(heat: number, scroll: number, speed: number) {
    const h = Math.max(0, Math.min(2, heat)), i = Math.min(1, Math.floor(h)), k = h - i, a = PAL[i], b = PAL[i + 1];
    const U = this.U, c0 = new THREE.Color(), c1 = new THREE.Color();
    const mixC = (x: string, y: string, out: THREE.Color) => out.copy(c0.set(x)).lerp(c1.set(y), k);
    mixC(a.dark, b.dark, U.cDark.value); mixC(a.mid, b.mid, U.cMid.value); mixC(a.light, b.light, U.cLight.value);
    const glow: C3 = [lerp(a.glow[0], b.glow[0], k), lerp(a.glow[1], b.glow[1], k), lerp(a.glow[2], b.glow[2], k)];
    (U.cGlow.value as THREE.Color).setRGB(...glow);
    U.uEmit.value = lerp(a.emit, b.emit, k);
    U.uScroll.value = scroll;
    // strata bands ~1/9 of tile A: they travel less than a quarter of their thickness per frame (no strobing);
    // streak dashes stretch with the speed so each one overlaps itself from frame to frame
    U.uTileA.value = 44 * Math.max(0.6, speed); U.uTileB.value = 16 * Math.max(0.6, speed);
    U.uGlowK.value = 1;
    (this.glow.material as THREE.MeshBasicMaterial).color.setRGB(glow[0] * 1.6, glow[1] * 1.6, glow[2] * 1.6);
    mixC(a.ledge, b.ledge, this.ledgeMat.color);
    for (const l of this.ledges) l.m.position.y = ((((l.base + scroll) % SPAN) + SPAN) % SPAN) - SPAN * 0.42;
    return { glow, k: h };
  }
}
