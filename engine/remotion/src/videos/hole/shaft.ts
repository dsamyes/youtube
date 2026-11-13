// The inside of the tunnel. Gus and the camera ride at the origin; the round rock tube stands still and its painted
// wall texture scrolls UP past them (shaftScroll), stretched along the fall so it streaks without strobing. Colour and
// glow follow the depth (heat 0 = brown crust, 1 = red/orange mantle, 2 = white-yellow core): a hot glow rises from
// below, darkness sits above, so the tube reads as DOWN. Rock ledges ride the scroll and take the world ink.
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
uniform float uScroll, uStretch, uEmit, uGlowK;
uniform vec3 cDark, cMid, cLight, cGlow;
varying vec3 vWP; varying vec2 vUv;
void main() {
  float y = vWP.y;
  vec3 m = texture2D(tMask, vec2(vUv.x * 5.0, (y - uScroll) / (8.0 * uStretch))).rgb;
  vec3 m2 = texture2D(tMask, vec2(vUv.x * 9.0 + 0.37, (y - uScroll * 1.3) / (21.0 * uStretch) + 0.21)).rgb;
  vec3 col = mix(cDark, cMid, smoothstep(0.3, 0.8, m.r));
  col = mix(col, cDark * 0.6, clamp(m.g, 0.0, 1.0) * 0.85);
  col = mix(col, cLight, clamp(max(m.b, m2.b * 0.7), 0.0, 1.0) * 0.9);
  col *= uEmit;
  float dy = y - cameraPosition.y;
  col = mix(col, cGlow, smoothstep(-2.0, -60.0, dy) * uGlowK);   // the hot glow rises from below
  col *= mix(1.0, 0.22, smoothstep(3.0, 40.0, dy));              // darkness above
  gl_FragColor = vec4(col, 1.0);
}`;

const SPAN = 132, LEDGES = 20;
export class Shaft {
  group = new THREE.Group();
  private U: Record<string, THREE.IUniform>;
  private ledges: { m: THREE.Mesh; base: number }[] = [];
  private ledgeMat: THREE.MeshLambertMaterial;
  private glow: THREE.Mesh; private cap: THREE.Mesh;

  constructor() {
    const R = this.group;
    this.U = {
      tMask: { value: rockMask() }, uScroll: { value: 0 }, uStretch: { value: 1 }, uEmit: { value: 1 }, uGlowK: { value: 1 },
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
    // rock ledges: arcs of a squashed ring hugging the wall, on the far side from the cameras (which sit at +z)
    this.ledgeMat = lam("shaftLedge", () => ({ color: "#8a6243" }));
    for (let i = 0; i < LEDGES; i++) {
      const start = Math.PI * (0.83 + 0.8 * hash(i, 3)), arc = Math.min(0.9 + 1.2 * hash(i, 1), Math.PI * 2.14 - start), th = 0.2 + 0.2 * hash(i, 2);
      const g = new THREE.TorusGeometry(SHAFT_R - 0.02, th, 8, 28, arc).rotateX(Math.PI / 2).rotateY(-start).scale(1, 0.62 + 0.3 * hash(i, 4), 1);
      const m = new THREE.Mesh(g, this.ledgeMat);
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
    U.uStretch.value = 1.2 + 1.6 * speed; // faster = longer streaks (the pattern itself never moves more than ~1/3 of a feature per frame)
    U.uGlowK.value = 1;
    (this.glow.material as THREE.MeshBasicMaterial).color.setRGB(glow[0] * 1.6, glow[1] * 1.6, glow[2] * 1.6);
    mixC(a.ledge, b.ledge, this.ledgeMat.color);
    for (const l of this.ledges) l.m.position.y = ((((l.base + scroll) % SPAN) + SPAN) % SPAN) - SPAN * 0.42;
    return { glow, k: h };
  }
}
