/**
 * Planet: a real NASA/USGS map on a sphere with a soft terminator, limb darkening, colour grading,
 * differential band rotation for gas giants (zonal jets), an inner scattering rim and an outer
 * atmosphere glow shell; optional rings. Everything is driven by `time` (seconds) from the frame.
 */
import React from "react";
import * as THREE from "three";
import { BODIES, BodyPreset, color, useTex } from "./core";

/* eslint-disable @typescript-eslint/no-explicit-any */
const vert = /* glsl */ `
varying vec2 vUv; varying vec3 vN; varying vec3 vW;
void main() {
  vUv = uv; vN = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const frag = /* glsl */ `
uniform sampler2D map; uniform sampler2D noise; uniform vec3 sunDir; uniform float time; uniform float spin;
uniform float shear; uniform float contrast; uniform float sat; uniform vec3 tint; uniform float tintMix;
uniform vec3 atmo; uniform float atmoK; uniform float ambient; uniform float gas; uniform float detail; uniform float night;
varying vec2 vUv; varying vec3 vN; varying vec3 vW;
void main() {
  vec2 uv = vUv;
  float lat = (uv.y - 0.5) * 3.14159;
  // zonal jets: alternating band speeds (gas giants), plus a slow global spin
  float jet = gas * shear * (sin(lat * 13.0) * 0.6 + sin(lat * 7.0 + 1.3) * 0.4);
  uv.x = fract(uv.x + time * spin * (1.0 + jet));
  if (gas > 0.5 && detail > 0.0) {
    vec4 n = texture2D(noise, uv * vec2(6.0, 3.0) + vec2(time * spin * 2.0, 0.0));
    uv += (n.rg - 0.5) * 0.004 * detail;
  }
  vec3 c = texture2D(map, uv).rgb;
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(l), c, sat);
  c = (c - 0.5) * contrast + 0.5;
  c = mix(c, tint * (0.35 + l), tintMix);
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  float ndl = dot(N, normalize(sunDir));
  float day = smoothstep(-0.12, 0.28, ndl);
  float mu = clamp(dot(N, V), 0.0, 1.0);
  float limb = mix(1.0, pow(mu, 0.35), gas > 0.5 ? 0.8 : 0.35);
  vec3 col = c * (ambient + day * 1.15 * max(ndl * 0.6 + 0.4, 0.0)) * limb;
  // scattering rim on the lit side
  float rim = pow(1.0 - mu, 2.6) * atmoK;
  col += atmo * rim * (0.15 + day) * 0.9;
  // terminator warm band
  col += vec3(1.0, 0.45, 0.2) * atmoK * 0.12 * smoothstep(0.25, 0.0, abs(ndl)) * (1.0 - mu);
  col += c * night * (1.0 - day) * 0.08;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}`;

const glowFrag = /* glsl */ `
uniform vec3 atmo; uniform vec3 sunDir; uniform float k; varying vec3 vN; varying vec3 vW; varying vec2 vUv;
void main() {
  vec3 N = normalize(vN); vec3 V = normalize(cameraPosition - vW);
  float mu = abs(dot(N, V));
  float edge = pow(clamp(1.0 - mu, 0.0, 1.0), 1.0) * smoothstep(0.0, 0.35, mu);
  float lit = smoothstep(-0.35, 0.45, dot(N, normalize(sunDir)));
  float a = pow(edge, 2.2) * k * (0.02 + lit);
  gl_FragColor = vec4(atmo * a, 1.0);
}`;

const ringVert = /* glsl */ `varying float vR; void main() { vR = length(position.xy); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const ringFrag = /* glsl */ `
uniform vec3 c1; uniform vec3 c2; uniform float inner; uniform float outer; uniform vec3 sunDir; varying float vR;
float h(float x) { return fract(sin(x * 127.1) * 43758.5); }
void main() {
  float r = vR;
  float f = (r - inner) / (outer - inner);
  if (f < 0.0 || f > 1.0) discard;
  float bands = 0.55 + 0.45 * sin(f * 90.0) * sin(f * 23.0 + 1.0) + 0.25 * h(floor(f * 300.0));
  float gap = smoothstep(0.58, 0.6, f) * (1.0 - smoothstep(0.64, 0.66, f));
  float a = clamp(bands, 0.0, 1.0) * (1.0 - gap * 0.9) * smoothstep(0.0, 0.05, f) * (1.0 - smoothstep(0.92, 1.0, f));
  vec3 col = mix(c1, c2, f) * (0.35 + 0.65 * max(dot(normalize(sunDir), vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5, 0.0));
  gl_FragColor = vec4(col * a, a * 0.85);
}`;

export type PlanetProps = {
  body?: string;
  preset?: Partial<BodyPreset>;
  position?: [number, number, number];
  radius?: number;
  time: number;
  /** turns per second of the texture (gas giants: visible but slow) */
  spin?: number;
  sun?: [number, number, number];
  tilt?: number;
  rotationY?: number;
  rings?: boolean | { inner: number; outer: number; c1?: string; c2?: string };
  ambient?: number;
  segments?: number;
  glow?: number;
};

export const Planet: React.FC<PlanetProps> = ({ body = "jupiter", preset, position = [0, 0, 0], radius, time, spin = 0.004, sun = [1, 0.25, 0.6], tilt = 0.05, rotationY = 0, rings = false, ambient = 0.04, segments = 96, glow = 1 }) => {
  const P: BodyPreset = { ...(BODIES[body] ?? BODIES.jupiter), ...preset };
  const map = useTex(P.tex ?? "moon");
  const noise = useTex("noise", false);
  const R = radius ?? P.radius;
  const sunV = React.useMemo(() => new THREE.Vector3(...sun).normalize(), [sun[0], sun[1], sun[2]]); // eslint-disable-line react-hooks/exhaustive-deps
  const mat = React.useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      map: { value: map }, noise: { value: noise }, sunDir: { value: sunV.clone() }, time: { value: 0 }, spin: { value: spin },
      shear: { value: P.gas ? 0.35 : 0 }, contrast: { value: P.contrast ?? 1 }, sat: { value: P.saturation ?? 1 },
      tint: { value: color(P.tint ?? "#ffffff") }, tintMix: { value: P.tint ? 0.55 : 0 }, atmo: { value: color(P.atmo) },
      atmoK: { value: P.atmoStrength }, ambient: { value: ambient }, gas: { value: P.gas ? 1 : 0 }, detail: { value: 1 }, night: { value: 0 },
    },
    vertexShader: vert, fragmentShader: frag,
  }), [map, noise, body]); // eslint-disable-line react-hooks/exhaustive-deps
  mat.uniforms.time.value = time;
  mat.uniforms.spin.value = spin;
  mat.uniforms.ambient.value = ambient;
  (mat.uniforms.sunDir.value as THREE.Vector3).copy(sunV);
  const glowMat = React.useMemo(() => new THREE.ShaderMaterial({
    uniforms: { atmo: { value: color(P.atmo) }, sunDir: { value: sunV.clone() }, k: { value: P.atmoStrength * glow } },
    vertexShader: vert, fragmentShader: glowFrag, side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
  }), [body]); // eslint-disable-line react-hooks/exhaustive-deps
  (glowMat.uniforms.sunDir.value as THREE.Vector3).copy(sunV);
  glowMat.uniforms.k.value = P.atmoStrength * glow;
  const ring = rings === true ? { inner: 1.24, outer: 2.27 } : rings || null;
  const ringMat = React.useMemo(() => ring ? new THREE.ShaderMaterial({
    uniforms: { c1: { value: color((ring as any).c1 ?? "#8a7a62") }, c2: { value: color((ring as any).c2 ?? "#e8dcc0") }, inner: { value: ring.inner * R }, outer: { value: ring.outer * R }, sunDir: { value: sunV.clone() } },
    vertexShader: ringVert, fragmentShader: ringFrag, side: THREE.DoubleSide, transparent: true, depthWrite: false,
  }) : null, [!!ring, R]); // eslint-disable-line react-hooks/exhaustive-deps
  const flat = 1 - (P.flatten ?? 0);
  return (
    <group position={position} rotation={[tilt, rotationY, 0]}>
      <mesh material={mat} scale={[R, R * flat, R]}>
        <sphereGeometry args={[1, segments, Math.round(segments / 2)]} />
      </mesh>
      {P.atmoStrength > 0 && glow > 0 ? (
        <mesh material={glowMat} scale={[R * 1.06, R * flat * 1.06, R * 1.06]}>
          <sphereGeometry args={[1, 64, 32]} />
        </mesh>
      ) : null}
      {ring && ringMat ? (
        <mesh material={ringMat} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ring.inner * R, ring.outer * R, 128, 1]} />
        </mesh>
      ) : null}
    </group>
  );
};

/** additive sun/star glow sprite (fake bloom, cheap) */
export const SunGlow: React.FC<{ position: [number, number, number]; size?: number; color?: string; intensity?: number }> = ({ position, size = 1, color: c = "#fff4dc", intensity = 1 }) => {
  const mat = React.useMemo(() => new THREE.ShaderMaterial({
    uniforms: { c: { value: color(c) }, k: { value: intensity } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(0.0,0.0,0.0,1.0); mv.xy += position.xy * vec2(1.0); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `uniform vec3 c; uniform float k; varying vec2 vUv; void main(){ float r = length(vUv - 0.5) * 2.0; float a = exp(-r*r*18.0) * 1.6 + exp(-r*5.0) * 0.45 + 0.08 * exp(-r*1.5); a *= k * (1.0 - smoothstep(0.85, 1.0, r)); gl_FragColor = vec4(c * a, 1.0); }`,
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, depthTest: false,
  }), [c]); // eslint-disable-line react-hooks/exhaustive-deps
  mat.uniforms.k.value = intensity;
  return (
    <mesh position={position} material={mat} renderOrder={5}>
      <planeGeometry args={[size, size]} />
    </mesh>
  );
};
