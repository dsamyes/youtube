/**
 * Cinematic 3D core (shared, protected): the WebGL stage, deterministic camera rig, texture loading
 * and the asset catalogue of remotion/public/lib (credits: public/lib/CREDITS.md).
 *
 * Rules (Remotion): everything animates from props derived from useCurrentFrame() (never useFrame()),
 * textures load through Suspense (ThreeCanvas holds the render until they are ready).
 *
 * PERFORMANCE: CI renders with software WebGL (SwiftShader via --gl=swangle, 4 vCPU). The stage renders
 * at an internal resolution of `quality` x the frame size (default 0.5 = 960x540 for 1080p) and is
 * upscaled by the compositor; HTML overlays stay sharp. Keep fragment shaders cheap (baked noise
 * texture lookups, no raymarching).
 */
import { ThreeCanvas } from "@remotion/three";
import { useLoader, useThree } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";
import { staticFile, useVideoConfig } from "remotion";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** textures in public/lib/tex (equirectangular maps unless noted) */
export const TEX = {
  jupiter: "lib/tex/jupiter.jpg",
  io: "lib/tex/io.jpg",
  ganymede: "lib/tex/ganymede.jpg",
  moon: "lib/tex/moon.jpg",
  earth: "lib/tex/earth.jpg",
  milkyway: "lib/tex/milkyway_gal.jpg",
  noise: "lib/tex/noise.png", // tileable spectral noise, 4 channels (not a map)
} as const;
export type TexName = keyof typeof TEX;

/** photos in public/lib/photos for Ken Burns shots: key -> [file, on-screen credit] */
export const PHOTOS: Record<string, [string, string]> = {
  jupiter_globe: ["jupiter_globe_PIA02873.jpg", "NASA/JPL/University of Arizona (Cassini)"],
  jupiter_grs: ["jupiter_grs_PIA21773.jpg", "NASA/JPL-Caltech/SwRI/MSSS, enhanced by Gerald Eichstädt (Juno)"],
  jupiter_south: ["jupiter_south_PIA21381.jpg", "NASA/JPL-Caltech/SwRI/MSSS (Juno)"],
  jupiter_clouds: ["jupiter_clouds_PIA21984.jpg", "NASA/JPL-Caltech/SwRI/MSSS, enhanced by Kevin M. Gill (CC BY)"],
  jupiter_storms: ["jupiter_storms_PIA22949.jpg", "NASA/JPL-Caltech/SwRI/MSSS, enhanced by Kevin M. Gill (CC BY)"],
  jupiter_chaos: ["jupiter_chaos_PIA25729.jpg", "NASA/JPL-Caltech/SwRI/MSSS, processing by Gary Eason (CC BY)"],
  jupiter_pearl: ["jupiter_pearl_PIA21377.jpg", "NASA/JPL-Caltech/SwRI/MSSS, enhanced by Eric Jorgensen (Juno)"],
  jupiter_cyclones_ir: ["jupiter_cyclones_ir_PIA23558.jpg", "NASA/JPL-Caltech/SwRI/ASI/INAF/JIRAM (Juno, infrared)"],
  galileo_probe_art: ["galileo_probe_art_AC89-0146-2.jpg", "NASA Ames Research Center (art, 1989)"],
  earth_apollo17: ["earth_as17-148-22727.jpg", "NASA, Apollo 17 crew (AS17-148-22727)"],
  iss: ["iss_iss066e081130.jpg", "NASA/ESA, Thomas Pesquet (iss066e081130)"],
  milkyway_art: ["milkyway_PIA10748.jpg", "NASA/JPL-Caltech/R. Hurt (SSC/Caltech), PIA10748"],
  andromeda: ["andromeda_PIA04921.jpg", "NASA/JPL/Caltech (GALEX), PIA04921"],
};

/** physical presets for bodies (radius in scene units; Jupiter = 1) */
export type BodyPreset = {
  tex: TexName | null; color: string; radius: number; atmo: string; atmoStrength: number; gas: boolean;
  flatten?: number; tint?: string; contrast?: number; saturation?: number;
};
export const BODIES: Record<string, BodyPreset> = {
  jupiter: { tex: "jupiter", color: "#d8c3a5", radius: 1, atmo: "#c9d8ff", atmoStrength: 0.55, gas: true, flatten: 0.065, contrast: 1.18, saturation: 1.05 },
  earth: { tex: "earth", color: "#2b6cd6", radius: 0.0892, atmo: "#5aa8ff", atmoStrength: 1.2, gas: false, contrast: 1.05, saturation: 1.1 },
  moon: { tex: "moon", color: "#bbbbbb", radius: 0.0243, atmo: "#000000", atmoStrength: 0, gas: false, contrast: 1.1 },
  io: { tex: "io", color: "#e6d36a", radius: 0.0255, atmo: "#000000", atmoStrength: 0, gas: false, saturation: 0.8 },
  europa: { tex: "moon", color: "#e8dccb", radius: 0.0219, atmo: "#000000", atmoStrength: 0, gas: false, tint: "#f2e2c8", contrast: 0.7, saturation: 0.4 },
  ganymede: { tex: "ganymede", color: "#9a9088", radius: 0.0377, atmo: "#000000", atmoStrength: 0, gas: false },
  callisto: { tex: "moon", color: "#6f6458", radius: 0.0345, atmo: "#000000", atmoStrength: 0, gas: false, tint: "#7d6b58", contrast: 1.3, saturation: 0.6 },
  saturn: { tex: "jupiter", color: "#e3d2a2", radius: 0.843, atmo: "#f0e2b8", atmoStrength: 0.6, gas: true, flatten: 0.098, tint: "#ead9a8", contrast: 0.6, saturation: 0.5 },
  neptune: { tex: "jupiter", color: "#3e66d8", radius: 0.354, atmo: "#7fb0ff", atmoStrength: 1.1, gas: true, flatten: 0.017, tint: "#3d6be0", contrast: 0.5, saturation: 0.2 },
  mars: { tex: "moon", color: "#b5532d", radius: 0.0475, atmo: "#e0a080", atmoStrength: 0.35, gas: false, tint: "#c8603a", contrast: 1.2, saturation: 0.5 },
  venus: { tex: "jupiter", color: "#e8d3a0", radius: 0.0847, atmo: "#ffe6b0", atmoStrength: 1.1, gas: true, tint: "#e9d3a2", contrast: 0.25, saturation: 0.2 },
};

export const tex = (name: TexName) => staticFile(TEX[name]);

/** load a library texture (Suspense; cached across canvases) */
export const useTex = (name: TexName, srgb = true): THREE.Texture => {
  const t = useLoader(THREE.TextureLoader, tex(name));
  if (srgb && t.colorSpace !== THREE.SRGBColorSpace && name !== "noise") {
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
  }
  if (name === "noise" && t.wrapS !== THREE.RepeatWrapping) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.needsUpdate = true;
  }
  if (t.anisotropy !== 4 && name !== "noise") {
    t.anisotropy = 4;
    t.needsUpdate = true;
  }
  return t;
};

/** Quality of the WebGL layer: fraction of the frame size it renders at (0.35-1). */
export const defaultQuality = (): number => {
  const q = typeof process !== "undefined" ? Number((process.env as any)?.REMOTION_3D_QUALITY) : NaN;
  return Number.isFinite(q) && q > 0 ? q : 0.5;
};

/** The 3D stage: renders at width*quality and is scaled up to the frame. */
export const Stage: React.FC<{ children: React.ReactNode; quality?: number; fov?: number; style?: React.CSSProperties }> = ({ children, quality, fov = 50, style }) => {
  const { width, height } = useVideoConfig();
  const q = Math.min(1, Math.max(0.25, quality ?? defaultQuality()));
  const w = Math.round(width * q);
  const h = Math.round(height * q);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transformOrigin: "0 0", transform: `scale(${1 / q})`, ...style }}>
      <ThreeCanvas width={w} height={h} dpr={1} linear={false} flat
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: true }}
        camera={{ fov, near: 0.001, far: 5000, position: [0, 0, 5] }}
        onCreated={({ gl }) => { gl.setClearColor("#000000", 1); gl.outputColorSpace = THREE.SRGBColorSpace; }}>
        {children}
      </ThreeCanvas>
    </div>
  );
};

export type Vec3 = [number, number, number];
const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
export const lerp3 = (a: Vec3, b: Vec3, f: number): Vec3 => [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];
export const smooth = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };
export const easeInOut = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2; };

/** deterministic camera: set every render from props (no useFrame) */
export const CameraRig: React.FC<{ pos: Vec3; look: Vec3; fov?: number; roll?: number; up?: Vec3 }> = ({ pos, look, fov, roll = 0, up = [0, 1, 0] }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.up.set(up[0], up[1], up[2]);
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(look[0], look[1], look[2]);
  if (roll) camera.rotateZ(roll);
  if (fov && Math.abs(camera.fov - fov) > 1e-4) {
    camera.fov = fov;
  }
  camera.near = 0.0005;
  camera.far = 5000;
  camera.updateProjectionMatrix();
  return null;
};

/** handheld/turbulence shake, deterministic (seconds -> small offset) */
export const shake = (t: number, amt: number, seed = 1): Vec3 => {
  const n = (k: number) => Math.sin(t * (7.1 + k) + seed * 3.3) * 0.5 + Math.sin(t * (13.7 + k * 1.7) + seed) * 0.3 + Math.sin(t * (23.3 + k * 0.7)) * 0.2;
  return [n(0) * amt, n(1.3) * amt, n(2.6) * amt * 0.5];
};

export const color = (c: string) => new THREE.Color(c);
