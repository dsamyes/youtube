/**
 * Endless first-person fall through layered cloud decks (cheap "volumetric" look):
 * N horizontal planes below (and two above) the camera, recycled as you fall, each shaded from a
 * baked noise texture with distance fog, top/bottom lighting, optional emissive heat glow and
 * deterministic lightning. Plus rising streak particles that sell the speed.
 *
 * The palette (colours, density, light) is interpolated between presets by the scene so that the
 * fall moves smoothly from one cloud layer to the next.
 */
import React from "react";
import * as THREE from "three";
import { color, useTex } from "./core";

export type CloudPalette = {
  top: string; // lit cloud tops
  bottom: string; // shadowed undersides
  haze: string; // fog / background
  sky: string; // background colour looking up
  glow: string; // emissive colour (deep hot layers)
  glowK: number; // 0..1 emissive strength
  cover: number; // 0..1 cloud cover (higher = thicker)
  light: number; // overall light 0..1
  lightning: number; // flashes per ~10 s (0 = none)
  streak: string; // particle colour
  scale: number; // texture scale (bigger = smaller features)
  map: number; // 0..1 mix of the real Jupiter map on the planes (top deck)
};

/** presets for gas-giant layers (also usable for Saturn/Venus/Earth storms with other colours) */
export const PALETTES: Record<string, CloudPalette> = {
  space: { top: "#e8dcc6", bottom: "#6a5a4a", haze: "#05060c", sky: "#000000", glow: "#000000", glowK: 0, cover: 0.45, light: 1, lightning: 0, streak: "#ffffff", scale: 0.006, map: 1 },
  haze: { top: "#f2e7d2", bottom: "#a28f78", haze: "#7f8fa8", sky: "#1b2240", glow: "#000000", glowK: 0, cover: 0.4, light: 1, lightning: 0, streak: "#ffffff", scale: 0.012, map: 0.7 },
  ammonia: { top: "#fffaf0", bottom: "#9c8a70", haze: "#b9b2a2", sky: "#5d6f8f", glow: "#000000", glowK: 0, cover: 0.48, light: 0.95, lightning: 0, streak: "#ffffff", scale: 0.02, map: 0.25 },
  nh4sh: { top: "#e2a66a", bottom: "#6b3a1e", haze: "#9a6440", sky: "#4a3326", glow: "#000000", glowK: 0, cover: 0.6, light: 0.6, lightning: 0, streak: "#ffd8b0", scale: 0.024, map: 0 },
  water: { top: "#a9b8c9", bottom: "#2c3442", haze: "#3a4352", sky: "#1c2230", glow: "#000000", glowK: 0, cover: 0.62, light: 0.32, lightning: 2.2, streak: "#cfe0ff", scale: 0.022, map: 0 },
  dark: { top: "#5a4a3e", bottom: "#140c08", haze: "#1a100b", sky: "#070403", glow: "#ff5a1a", glowK: 0.15, cover: 0.55, light: 0.08, lightning: 0.4, streak: "#ffb27a", scale: 0.022, map: 0 },
  hot: { top: "#c8642a", bottom: "#200802", haze: "#2a0c04", sky: "#120400", glow: "#ff6a1a", glowK: 0.42, cover: 0.5, light: 0.05, lightning: 0, streak: "#ffd09a", scale: 0.022, map: 0 },
  fluid: { top: "#e8975a", bottom: "#3a1204", haze: "#5a2008", sky: "#2a0a02", glow: "#ff9a4a", glowK: 0.6, cover: 0.42, light: 0, lightning: 0, streak: "#fff0d0", scale: 0.022, map: 0 },
  metallic: { top: "#cfe6ff", bottom: "#3a2a7a", haze: "#4a3a8a", sky: "#140a30", glow: "#a8c8ff", glowK: 1, cover: 0.38, light: 0, lightning: 0, streak: "#e8f2ff", scale: 0.02, map: 0 },
  core: { top: "#fff2c8", bottom: "#9a3a10", haze: "#e07a2a", sky: "#a0400c", glow: "#fff0c0", glowK: 1, cover: 0.3, light: 0, lightning: 0, streak: "#ffffff", scale: 0.025, map: 0 },
  earth: { top: "#ffffff", bottom: "#8a96a8", haze: "#9fc3ea", sky: "#3f7fd8", glow: "#000000", glowK: 0, cover: 0.5, light: 1, lightning: 0, streak: "#ffffff", scale: 0.02, map: 0 },
  venus: { top: "#f6e2b0", bottom: "#9a7a40", haze: "#d8b878", sky: "#c09a58", glow: "#000000", glowK: 0, cover: 0.65, light: 0.7, lightning: 0, streak: "#fff2d0", scale: 0.02, map: 0 },
};

const hex = (c: THREE.Color) => c;
export const mixPalette = (a: CloudPalette, b: CloudPalette, f: number): CloudPalette => {
  const mc = (x: string, y: string) => "#" + hex(new THREE.Color(x).lerp(new THREE.Color(y), f)).getHexString();
  const mn = (x: number, y: number) => x + (y - x) * f;
  return {
    top: mc(a.top, b.top), bottom: mc(a.bottom, b.bottom), haze: mc(a.haze, b.haze), sky: mc(a.sky, b.sky), glow: mc(a.glow, b.glow),
    streak: mc(a.streak, b.streak), glowK: mn(a.glowK, b.glowK), cover: mn(a.cover, b.cover), light: mn(a.light, b.light),
    lightning: mn(a.lightning, b.lightning), scale: mn(a.scale, b.scale), map: mn(a.map, b.map),
  };
};

const vert = /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const frag = /* glsl */ `
uniform sampler2D noise; uniform sampler2D jmap; uniform vec3 top; uniform vec3 bottom; uniform vec3 haze; uniform vec3 glow;
uniform float glowK; uniform float cover; uniform float light; uniform float scale; uniform float mapK; uniform float fogK;
uniform vec2 drift; uniform float seed; uniform float flash; uniform vec2 flashPos; uniform float nearFade; uniform float above;
varying vec3 vW;
void main(){
  vec2 p = vW.xz * scale + drift + vec2(seed * 0.37, seed * 0.61);
  vec4 a = texture2D(noise, p);                      // r: fbm density, b: baked relief light
  vec4 b = texture2D(noise, p * 3.1 + vec2(0.31, 0.17)); // a: fine detail
  float n = a.r * 0.82 + b.a * 0.18;
  float thr = 1.0 - cover;
  float d = smoothstep(thr - 0.12, thr + 0.18, n);
  if (d < 0.01) discard;
  float h = smoothstep(thr, thr + 0.4, n);
  float lit = a.b;
  vec3 c = mix(bottom, top, mix(h, 1.0 - h, above));
  c *= mix(0.55, 1.25, lit) * mix(1.0, 0.7, above);
  if (mapK > 0.0) {
    vec3 m = texture2D(jmap, vec2(fract(vW.x * 0.00035 + 0.62), 0.42 + vW.z * 0.00012)).rgb;
    c = mix(c, m * (0.75 + 0.5 * h), mapK);
  }
  c *= (0.25 + 0.75 * light);
  c += glow * glowK * (0.35 + 0.9 * b.a) * (0.6 + 0.6 * h);
  float fl = flash * exp(-length(vW.xz - flashPos) * 0.012);
  c += vec3(0.85, 0.9, 1.0) * fl * (0.6 + h);
  float dist = length(vW - cameraPosition);
  float fog = 1.0 - exp(-dist * fogK);
  if (fog > 0.985) discard;
  c = mix(c, haze, fog);
  float alpha = d * smoothstep(0.0, nearFade, dist);
  gl_FragColor = vec4(c, alpha);
}`;

const skyFrag = /* glsl */ `uniform vec3 up; uniform vec3 down; uniform vec3 mid; uniform float flash; varying vec3 vW;
void main(){ vec3 d = normalize(vW - cameraPosition); float y = d.y; vec3 c = y > 0.0 ? mix(mid, up, smoothstep(0.0, 0.8, y)) : mix(mid, down, smoothstep(0.0, 0.6, -y)); c += vec3(0.6,0.65,0.8) * flash * 0.25; gl_FragColor = vec4(c, 1.0); }`;

/** deterministic lightning: returns flash intensity at time t for a rate (flashes per 10 s) */
export const lightningAt = (t: number, rate: number, seed = 3): { k: number; x: number; z: number } => {
  if (rate <= 0) return { k: 0, x: 0, z: 0 };
  const slot = 10 / rate;
  const i = Math.floor(t / slot);
  const r = (n: number) => { const x = Math.sin((i + seed) * 127.1 + n * 311.7) * 43758.5453; return x - Math.floor(x); };
  const t0 = i * slot + r(1) * slot * 0.7;
  const dt = t - t0;
  if (dt < 0 || dt > 0.6) return { k: 0, x: 0, z: 0 };
  const k = Math.exp(-dt * 9) * (1 + 0.6 * Math.sin(dt * 90)) + (dt > 0.12 ? 0.6 * Math.exp(-(dt - 0.12) * 14) : 0);
  return { k: Math.max(0, k) * (0.6 + r(2) * 0.6), x: (r(3) - 0.5) * 300, z: -(60 + r(4) * 260) };
};

export type CloudFallProps = {
  palette: CloudPalette;
  /** metres fallen (scene units) - drives plane recycling and colour; feed a monotonic value */
  fallen: number;
  camX: number; camZ: number;
  time: number;
  spacing?: number;
  layers?: number;
  fogK?: number;
};

/** the decks + background gradient; the caller positions the camera at (camX, 0, camZ) */
export const CloudFall: React.FC<CloudFallProps> = ({ palette: P, fallen, camX, camZ, time, spacing = 14, layers = 7, fogK = 0.006 }) => {
  const noise = useTex("noise", false);
  const jmap = useTex("jupiter");
  const mats = React.useMemo(() => Array.from({ length: layers + 2 }, (_, i) => new THREE.ShaderMaterial({
    uniforms: {
      noise: { value: noise }, jmap: { value: jmap }, top: { value: new THREE.Color() }, bottom: { value: new THREE.Color() }, haze: { value: new THREE.Color() },
      glow: { value: new THREE.Color() }, glowK: { value: 0 }, cover: { value: 0.5 }, light: { value: 1 }, scale: { value: 0.02 }, mapK: { value: 0 },
      fogK: { value: fogK }, drift: { value: new THREE.Vector2() }, seed: { value: i }, flash: { value: 0 }, flashPos: { value: new THREE.Vector2() },
      nearFade: { value: 6 }, above: { value: 0 },
    },
    vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, side: THREE.DoubleSide,
  })), [noise, jmap, layers]); // eslint-disable-line react-hooks/exhaustive-deps
  const skyMat = React.useMemo(() => new THREE.ShaderMaterial({
    uniforms: { up: { value: new THREE.Color() }, down: { value: new THREE.Color() }, mid: { value: new THREE.Color() }, flash: { value: 0 } },
    vertexShader: vert, fragmentShader: skyFrag, side: THREE.BackSide, depthWrite: false,
  }), []);
  const fl = lightningAt(time, P.lightning);
  const frac = (fallen / spacing) % 1;
  const ix = Math.floor(fallen / spacing);
  const planes = [];
  for (let k = -2; k < layers; k++) {
    const y = -((k + 1) - frac) * spacing; // relative to camera at y=0
    const m = mats[k + 2];
    const u = m.uniforms;
    (u.top.value as THREE.Color).set(P.top);
    (u.bottom.value as THREE.Color).set(P.bottom);
    (u.haze.value as THREE.Color).set(P.haze);
    (u.glow.value as THREE.Color).set(P.glow);
    u.glowK.value = P.glowK;
    u.cover.value = P.cover;
    u.light.value = P.light;
    u.scale.value = P.scale;
    u.mapK.value = P.map;
    u.fogK.value = fogK;
    const id = ix + k; // stable identity of this deck while it is on screen
    u.seed.value = ((id * 7919) % 97) * 0.731;
    (u.drift.value as THREE.Vector2).set(time * 0.004 * ((id % 3) - 1), time * 0.003);
    u.flash.value = fl.k;
    (u.flashPos.value as THREE.Vector2).set(camX + fl.x, camZ + fl.z);
    u.above.value = y > 0 ? 1 : 0;
    u.nearFade.value = spacing * 0.45;
    planes.push(
      <mesh key={k} material={m} position={[camX, y, camZ]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={y > 0 ? 2 + k : 20 - k}>
        <planeGeometry args={[1400, 1400, 1, 1]} />
      </mesh>,
    );
  }
  (skyMat.uniforms.up.value as THREE.Color).set(P.sky);
  (skyMat.uniforms.mid.value as THREE.Color).set(P.haze);
  (skyMat.uniforms.down.value as THREE.Color).set(new THREE.Color(P.haze).multiplyScalar(0.55));
  skyMat.uniforms.flash.value = fl.k;
  return (
    <group>
      <mesh material={skyMat} position={[camX, 0, camZ]} renderOrder={-5}>
        <sphereGeometry args={[900, 32, 16]} />
      </mesh>
      {planes}
    </group>
  );
};

/** rising streaks around the camera (speed lines); `speed` in scene units / s */
export const Streaks: React.FC<{ time: number; speed: number; color?: string; count?: number; box?: number; dir?: [number, number, number]; opacity?: number }> = ({ time, speed, color: c = "#ffffff", count = 500, box = 30, dir = [0, 1, 0], opacity = 0.6 }) => {
  const base = React.useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = (n: number) => { const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453; return x - Math.floor(x); };
      a.set([(r(1) - 0.5) * box, (r(2) - 0.5) * box, (r(3) - 0.5) * box], i * 3);
    }
    return a;
  }, [count, box]);
  const geo = React.useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 6), 3));
    return g;
  }, [count]);
  const mat = React.useMemo(() => new THREE.LineBasicMaterial({ color: color(c), transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }), []); // eslint-disable-line react-hooks/exhaustive-deps
  mat.color.set(c);
  mat.opacity = opacity;
  const pos = geo.attributes.position.array as Float32Array;
  const len = Math.min(box * 0.6, 0.08 * speed + 0.05);
  const off = time * speed;
  const d = new THREE.Vector3(...dir).normalize();
  for (let i = 0; i < count; i++) {
    let x = base[i * 3] + d.x * off, y = base[i * 3 + 1] + d.y * off, z = base[i * 3 + 2] + d.z * off;
    const w = (v: number) => ((((v + box / 2) % box) + box) % box) - box / 2;
    x = w(x); y = w(y); z = w(z);
    pos.set([x, y, z, x - d.x * len, y - d.y * len, z - d.z * len], i * 6);
  }
  geo.attributes.position.needsUpdate = true;
  return <lineSegments geometry={geo} material={mat} renderOrder={40} />;
};
