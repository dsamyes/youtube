/**
 * Sky: the real Milky Way (NASA SVS Deep Star Maps 2020, galactic frame) on a background sphere plus
 * ~9,000 real stars (HYG v4.0) as soft points with temperature colours. Both are attached to the
 * camera position so they never parallax.
 */
import { useThree } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";
import { staticFile } from "remotion";
import { useTex } from "./core";

/* eslint-disable @typescript-eslint/no-explicit-any */
let starCache: Promise<Float32Array[]> | null = null;
const loadStars = () => {
  if (!starCache) {
    starCache = fetch(staticFile("lib/data/stars.json")).then((r) => r.json()).then((d: { stars: number[][] }) => {
      const n = d.stars.length;
      const pos = new Float32Array(n * 3);
      const col = new Float32Array(n * 3);
      const size = new Float32Array(n);
      d.stars.forEach(([x, y, z, m, T], i) => {
        pos.set([x * 1000, y * 1000, z * 1000], i * 3);
        // blackbody-ish tint from temperature
        const t = Math.min(1, Math.max(0, (T - 3000) / 9000));
        const r = 1.0;
        const g = 0.72 + 0.26 * Math.min(1, t * 1.6);
        const b = 0.45 + 0.6 * t;
        const f = 1 / Math.max(r, g, b);
        const lum = Math.pow(10, -0.4 * (m - 1.5));
        const a = Math.min(1.6, 0.18 + Math.sqrt(lum));
        col.set([r * f * a, g * f * a, b * f * a], i * 3);
        size[i] = Math.max(1.0, 3.6 - 0.42 * m);
      });
      return [pos, col, size];
    });
  }
  return starCache;
};

/** Suspense-based (ThreeCanvas holds the frame until the catalogue is loaded) */
const useStars = () => React.use(loadStars());

const starVert = /* glsl */ `
attribute float size; attribute vec3 color; varying vec3 vColor; uniform float uScale; uniform float uBright;
void main() { vColor = color * uBright; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = size * uScale; }`;
const starFrag = /* glsl */ `
varying vec3 vColor;
void main() { vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0; float a = exp(-r * r * 4.0); if (a < 0.02) discard; gl_FragColor = vec4(vColor * a, 1.0); }`;

const skyVert = /* glsl */ `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const skyFrag = /* glsl */ `
uniform sampler2D map; uniform float uBright; uniform vec3 uTint; varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  float l = atan(d.x, d.z); float b = asin(clamp(d.y, -1.0, 1.0));
  vec2 uv = vec2(0.5 - l / 6.2831853, 0.5 + b / 3.1415926);
  vec3 c = texture2D(map, uv).rgb;
  gl_FragColor = vec4(c * uBright * uTint, 1.0);
}`;

/**
 * @param bright milky way brightness (0 = stars only)
 * @param stars  star brightness (0 hides them)
 * @param rotation euler (radians) orienting the galaxy in the scene
 * @param scale  star point size scale (raise for 4K / lower quality stages)
 */
export const SkyDome: React.FC<{ bright?: number; stars?: number; rotation?: [number, number, number]; tint?: string; scale?: number }> = ({ bright = 0.55, stars = 1, rotation = [0.35, 0.9, 0.2], tint = "#ffffff", scale }) => {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const mw = useTex("milkyway");
  const st = useStars();
  const geo = React.useMemo(() => {
    if (!st) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(st[0], 3));
    g.setAttribute("color", new THREE.BufferAttribute(st[1], 3));
    g.setAttribute("size", new THREE.BufferAttribute(st[2], 1));
    return g;
  }, [st]);
  const skyMat = React.useMemo(() => new THREE.ShaderMaterial({
    uniforms: { map: { value: mw }, uBright: { value: bright }, uTint: { value: new THREE.Color(tint) } },
    vertexShader: skyVert, fragmentShader: skyFrag, side: THREE.BackSide, depthWrite: false, depthTest: true,
  }), [mw]); // eslint-disable-line react-hooks/exhaustive-deps
  skyMat.uniforms.uBright.value = bright;
  (skyMat.uniforms.uTint.value as THREE.Color).set(tint);
  const starMat = React.useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uScale: { value: 1 }, uBright: { value: 1 } }, vertexShader: starVert, fragmentShader: starFrag,
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true, transparent: false,
  }), []);
  starMat.uniforms.uScale.value = (scale ?? 1) * Math.max(0.6, size.height / 540);
  starMat.uniforms.uBright.value = stars;
  const p = camera.position;
  return (
    <group position={[p.x, p.y, p.z]} rotation={rotation} renderOrder={-10}>
      {bright > 0 ? <mesh material={skyMat} renderOrder={-10}><sphereGeometry args={[1500, 48, 24]} /></mesh> : null}
      {geo && stars > 0 ? <points geometry={geo} material={starMat} renderOrder={-9} /> : null}
    </group>
  );
};

const nebFrag = /* glsl */ `
uniform sampler2D noise; uniform vec3 c1; uniform vec3 c2; uniform vec3 c3; uniform float k; uniform float time; varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  vec2 uv = vec2(atan(d.x, d.z) / 6.2831853 + 0.5, d.y * 0.5 + 0.5);
  vec4 a = texture2D(noise, uv * vec2(1.0, 0.5) + vec2(time * 0.0005, 0.0));
  vec4 b = texture2D(noise, uv * vec2(2.0, 1.0) + a.rg * 0.08);
  float band = exp(-pow((d.y - 0.15 * sin(uv.x * 6.2831853 * 2.0)) * 2.4, 2.0));
  float den = smoothstep(0.42, 1.0, a.r * 0.75 + b.g * 0.35) * band;
  float dust = smoothstep(0.55, 0.85, b.b) * band;
  vec3 col = mix(c1, c2, smoothstep(0.2, 0.8, a.g)) * den * 0.7 + c3 * pow(den, 4.0) * 0.7;
  col *= (1.0 - dust * 0.6);
  gl_FragColor = vec4(col * k, 1.0);
}`;

/** procedural emission nebula on a background sphere (additive over the sky). Colours are artistic. */
export const NebulaDome: React.FC<{ time: number; colors?: [string, string, string]; intensity?: number; rotation?: [number, number, number] }> = ({ time, colors = ["#3a1a6e", "#c0306a", "#ffd2a0"], intensity = 0.55, rotation = [0.3, 0.6, 0] }) => {
  const camera = useThree((s) => s.camera);
  const noise = useTex("noise", false);
  const mat = React.useMemo(() => new THREE.ShaderMaterial({
    uniforms: { noise: { value: noise }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, k: { value: 1 }, time: { value: 0 } },
    vertexShader: skyVert, fragmentShader: nebFrag, side: THREE.BackSide, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, transparent: false,
  }), [noise]);
  (mat.uniforms.c1.value as THREE.Color).set(colors[0]);
  (mat.uniforms.c2.value as THREE.Color).set(colors[1]);
  (mat.uniforms.c3.value as THREE.Color).set(colors[2]);
  mat.uniforms.k.value = intensity;
  mat.uniforms.time.value = time;
  const p = camera.position;
  return (
    <mesh material={mat} position={[p.x, p.y, p.z]} rotation={rotation} renderOrder={-8}>
      <sphereGeometry args={[1400, 48, 24]} />
    </mesh>
  );
};
