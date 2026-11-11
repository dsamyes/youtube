/**
 * Planet cutaway: the real surface map on a sphere with a quarter wedge removed; the two exposed cut
 * faces show the interior layers as concentric bands (colours/radii from the scene params, so the
 * radii can come from calc.json). Returns screen positions of label anchors through `onAnchors`.
 */
import { useThree } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";
import { BODIES, color, useTex } from "./core";

export type Layer = { r: number; color: string; label?: string; glow?: number };

const MAX = 8;
const vert = /* glsl */ `varying vec3 vL; void main(){ vL = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const faceFrag = /* glsl */ `
uniform float radii[${MAX}]; uniform vec3 cols[${MAX}]; uniform float glows[${MAX}]; uniform int count; uniform int hi; uniform float hiK;
uniform sampler2D noise; uniform float time; uniform float R; uniform float shade; varying vec3 vL;
void main(){
  float r = length(vL.xy) / R;
  vec3 c = cols[0]; float g = glows[0]; int idx = 0;
  for (int i = ${MAX - 1}; i >= 0; i--) { if (i < count && r <= radii[i] + 0.002) { c = cols[i]; g = glows[i]; idx = i; } }
  // soft boundary to the next outer layer
  float n = texture2D(noise, vL.xy / R * 0.8 + vec2(time * 0.01, 0.0)).r;
  float m = texture2D(noise, vL.xy / R * 3.0 - vec2(0.0, time * 0.02)).g;
  vec3 col = c * (0.72 + 0.4 * n) * (0.9 + 0.2 * m);
  float edge = 0.0;
  for (int i = 0; i < ${MAX}; i++) { if (i < count) edge = max(edge, 1.0 - smoothstep(0.0, 0.006, abs(r - radii[i]))); }
  col = mix(col, col * 0.45, edge * 0.8);
  col += c * g * (0.5 + 0.5 * n);
  if (idx == hi) col += c * hiK * 0.55 + vec3(1.0) * hiK * 0.08;
  col *= shade;
  gl_FragColor = vec4(col, 1.0);
}`;

export const Cutaway: React.FC<{
  body?: string; layers: Layer[]; time: number; highlight?: number; hiK?: number; sun?: [number, number, number];
  spin?: number; marker?: number; markerColor?: string;
}> = ({ body = "jupiter", layers, time, highlight = -1, hiK = 0, sun = [1, 0.4, 0.6], spin = 0.01, marker, markerColor = "#7fe8ff" }) => {
  const P = BODIES[body] ?? BODIES.jupiter;
  const map = useTex(P.tex ?? "moon");
  const noise = useTex("noise", false);
  const gl = useThree((s) => s.gl);
  gl.localClippingEnabled = true;
  const R = 1;
  const sorted = [...layers].sort((a, b) => a.r - b.r).slice(0, MAX);
  const clip = React.useMemo(() => [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)], []);
  const shell = React.useMemo(() => new THREE.MeshLambertMaterial({ map, clippingPlanes: clip, clipIntersection: true, side: THREE.DoubleSide }), [map, clip]);
  const faceMat = (shade: number) => new THREE.ShaderMaterial({
    uniforms: {
      radii: { value: new Array(MAX).fill(1) }, cols: { value: Array.from({ length: MAX }, () => new THREE.Color()) }, glows: { value: new Array(MAX).fill(0) },
      count: { value: 0 }, hi: { value: -1 }, hiK: { value: 0 }, noise: { value: noise }, time: { value: 0 }, R: { value: R }, shade: { value: shade },
    },
    vertexShader: vert, fragmentShader: faceFrag, side: THREE.DoubleSide,
  });
  const faces = React.useMemo(() => [faceMat(1.0), faceMat(0.78)], [noise]); // eslint-disable-line react-hooks/exhaustive-deps
  for (const f of faces) {
    const u = f.uniforms;
    sorted.forEach((l, i) => { u.radii.value[i] = l.r; (u.cols.value[i] as THREE.Color).set(l.color); u.glows.value[i] = l.glow ?? 0; });
    u.count.value = sorted.length;
    u.hi.value = highlight >= 0 ? sorted.findIndex((l) => l === layers[highlight]) : -1;
    u.hiK.value = hiK;
    u.time.value = time;
  }
  const sunV = new THREE.Vector3(...sun).normalize().multiplyScalar(10);
  return (
    <group rotation={cutawayRotation(time, spin)}>
      <ambientLight intensity={0.18} />
      <directionalLight position={[sunV.x, sunV.y, sunV.z]} intensity={2.2} />
      <mesh material={shell}><sphereGeometry args={[R, 96, 48]} /></mesh>
      {/* cut faces: half discs in the planes x = 0 (z > 0) and z = 0 (x > 0) */}
      <mesh material={faces[0]} rotation={[0, -Math.PI / 2, 0]}><circleGeometry args={[R * 0.999, 96, -Math.PI / 2, Math.PI]} /></mesh>
      <mesh material={faces[1]} rotation={[0, 0, 0]}><circleGeometry args={[R * 0.999, 96, -Math.PI / 2, Math.PI]} /></mesh>
      {marker !== undefined ? (
        <mesh position={[0.012, 0, marker * R]}>
          <sphereGeometry args={[0.022, 16, 8]} />
          <meshBasicMaterial color={color(markerColor)} />
        </mesh>
      ) : null}
    </group>
  );
};

/** the group rotation used by <Cutaway> (scenes use it to project label anchors) */
export const cutawayRotation = (time: number, spin = 0.01): [number, number, number] => [0.12, time * spin, 0];

/** world position of a point on the z = 0 cut face at radius r (fraction of R) and angle a (rad, 0 = +x) */
export const cutawayPoint = (r: number, a: number, time: number, spin = 0.01): THREE.Vector3 => {
  const v = new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), 0.002);
  return v.applyEuler(new THREE.Euler(...cutawayRotation(time, spin)));
};
