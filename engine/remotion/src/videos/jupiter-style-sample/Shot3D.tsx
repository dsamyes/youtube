/**
 * 3D shots for the style sample. They COMPOSE the shared library (Stage, CameraRig, Planet, SkyDome,
 * CloudFall, Streaks, SunGlow) with short, purposeful camera moves: every shot is 1.5-4 s, so each
 * one gets one idea and one move. Everything is driven by `t` (seconds into the shot) from
 * useCurrentFrame() (no useFrame), so renders are deterministic.
 *
 * Candidates for shared code (components/three/): Meteor (fireball + plasma trail), ScaleRow
 * (N bodies along a diameter), Pod.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import * as THREE from "three";
import { CameraRig, Stage, Vec3, easeInOut, shake, smooth } from "../../components/three/core";
import { CloudFall, PALETTES, Streaks, mixPalette } from "../../components/three/Clouds";
import { Planet, SunGlow } from "../../components/three/Planet";
import { SkyDome } from "../../components/three/Sky";
import { PovFrame } from "../../components/Cinema";

export type Shot3DProps = { scene: string; t: number; len: number; seed: number; heat?: number; flash?: boolean; fast?: boolean; wide?: boolean; calm?: boolean };

const DEG = Math.PI / 180;
const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
const v3 = (a: Vec3, b: Vec3, f: number): Vec3 => [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/** quality of the WebGL layer for this sample: 0.62 of 1080p (sharper than the engine's 0.5, still CPU-cheap) */
const Q = 0.62;

/* ------------------------------------------------------------------ meteor: you, a fireball over the limb */
const Fireball: React.FC<{ head: Vec3; dir: Vec3; t: number; size: number; trail: number }> = ({ head, dir, t, size, trail }) => {
  const n = 72;
  const d = new THREE.Vector3(...dir).normalize();
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const f = i / (n - 1);
        const wob = Math.sin(t * 40 + i * 1.7) * 0.004 * size * (1 + f * 4);
        const p: Vec3 = [head[0] - d.x * trail * f + wob, head[1] - d.y * trail * f + wob * 0.6, head[2] - d.z * trail * f];
        const col = f < 0.06 ? "#ffffff" : f < 0.25 ? "#ffd9a0" : f < 0.55 ? "#ff8a3a" : "#ff4a1a";
        return <SunGlow key={i} position={p} size={size * (1.25 - f * 0.8) * (i === 0 ? 2.4 : 1)} color={col} intensity={(1 - f) ** 1.4 * (i === 0 ? 1.8 : 0.42)} />;
      })}
      <SunGlow position={head} size={size * 7} color="#ffb070" intensity={0.35} />
    </group>
  );
};

const Meteor: React.FC<Shot3DProps> = ({ t, len, wide }) => {
  const f = t / len;
  // camera rides just above the cloud tops, looking along the limb; the fireball overtakes it
  const camPos: Vec3 = wide ? [0.35, 0.22, 2.6] : [0.3, 0.55, 1.95];
  const look: Vec3 = wide ? [-0.15, 0.05, 0] : [-0.3, 0.62, 0];
  const sh = shake(t, wide ? 0.0012 : 0.004 + 0.006 * f, 7);
  // the fireball is in frame from the first frame (money shot) and dives toward the limb
  const head: Vec3 = wide ? v3([1.6, 1.4, 0.5], [0.42, 0.86, 0.35], smooth(f * 1.1)) : v3([0.44, 0.91, 0.74], [-0.22, 0.84, 0.32], Math.pow(f, 1.15));
  const dir: Vec3 = wide ? [-1.2, -0.55, -0.15] : [-1.37, -0.32, -0.57];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage fov={wide ? 34 : 44} quality={Q}>
        <CameraRig pos={add(v3(camPos, add(camPos, [-0.05, -0.02, -0.04]), f), sh)} look={look} fov={wide ? 34 : 44} roll={-6 * DEG} />
        <SkyDome bright={0.45} stars={1} />
        <Planet body="jupiter" time={t + 40} sun={[0.55, 0.45, 0.9]} spin={0.003} />
        <Fireball head={head} dir={dir} t={t} size={wide ? 0.05 : 0.1} trail={wide ? 0.9 : 0.8} />
      </Stage>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ far: one million km out, moons drift by (parallax) */
const MOONS: { body: string; pos: Vec3 }[] = [
  { body: "callisto", pos: [-0.55, -0.12, 9.2] },
  { body: "ganymede", pos: [0.95, 0.18, 6.0] },
  { body: "europa", pos: [-1.6, 0.05, 3.2] },
  { body: "io", pos: [1.3, -0.08, 2.0] },
];
const Far: React.FC<Shot3DProps> = ({ t, len }) => {
  const f = easeInOut(t / len);
  const pos: Vec3 = [lerp(-0.6, 0.35, f), lerp(0.25, 0.1, f), lerp(14.5, 11.5, f)];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage fov={30} quality={Q}>
        <CameraRig pos={pos} look={[0.6, 0, 0]} fov={30} />
        <SkyDome bright={0.6} stars={1.2} />
        <Planet body="jupiter" time={t + 10} sun={[1, 0.15, 0.7]} spin={0.003} />
        {MOONS.map((m, i) => <Planet key={i} body={m.body} position={m.pos} radius={0.07} time={t} sun={[1, 0.15, 0.7]} spin={0.002} segments={48} glow={0} />)}
      </Stage>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ fall: the planet swells (fast = final plunge) */
const Fall: React.FC<Shot3DProps> = ({ t, len, fast }) => {
  const lin = Math.min(1, t / len);
  const d0 = fast ? 2.0 : 5.2;
  const d1 = fast ? 1.07 : 2.6;
  const dist = lerp(d0, d1, fast ? Math.pow(lin, 1.6) : easeInOut(lin));
  const az = (fast ? 18 : 30) * DEG + lin * 4 * DEG;
  const el = (fast ? 4 : 10) * DEG;
  const sh = shake(t, fast ? 0.004 + 0.012 * lin * lin : 0.0006, 3);
  const pos: Vec3 = add([dist * Math.cos(el) * Math.sin(az), dist * Math.sin(el), dist * Math.cos(el) * Math.cos(az)], sh);
  const side = 0.24;
  const look: Vec3 = [Math.cos(az) * side * dist * 0.35, fast ? 0.1 : 0, -Math.sin(az) * side * dist * 0.35];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage fov={38} quality={Q}>
        <CameraRig pos={pos} look={look} fov={38} roll={(fast ? -4 : 2) * DEG} />
        <SkyDome bright={0.5} stars={1} />
        <Planet body="jupiter" time={t + (fast ? 70 : 20)} sun={[Math.sin(az + 80 * DEG), 0.18, Math.cos(az + 80 * DEG)]} spin={0.003} />
      </Stage>
      {fast ? <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(255,120,40,${0.12 * lin}) 100%)` }} /> : null}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ scale: eleven Earths across the disc */
// The Earths are a 2D row of the Apollo 17 photo laid across the 3D disc: sized from the camera
// distance so 11.2 Earth diameters span the projected diameter (the 3D Earth map is a night map).
const EARTH_ZOOM = 1.51; // the Apollo 17 disc fills 66% of its photo
const Scale: React.FC<Shot3DProps> = ({ t, len }) => {
  const f = Math.min(1, t / len);
  const sun: Vec3 = [0.6, 0.2, 1];
  const d = lerp(4.6, 4.3, easeInOut(f));
  const rpx = (Math.tan(Math.asin(1 / d)) / Math.tan(15 * DEG)) * 540;
  const e = (2 * rpx) / 11.21;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage fov={30} quality={Q}>
        <CameraRig pos={[0, 0, d]} look={[0, 0, 0]} fov={30} />
        <SkyDome bright={0.35} stars={0.8} />
        <Planet body="jupiter" time={t + 5} sun={sun} spin={0.002} />
      </Stage>
      {Array.from({ length: 11 }, (_, i) => {
        const k = smooth((t - 0.15 - i * 0.07) / 0.18);
        const x = 960 - rpx + e * 0.105 + i * e * 1.0 + e / 2;
        return k > 0 ? (
          <div key={i} style={{ position: "absolute", left: x - (e * k) / 2, top: 560 - (e * k) / 2, width: e * k, height: e * k, borderRadius: "50%",
            overflow: "hidden", boxShadow: "0 0 12px rgba(90,168,255,0.85)" }}>
            <Img src={staticFile("lib/photos/earth_as17-148-22727.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", scale: String(EARTH_ZOOM) }} />
          </div>
        ) : null;
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ dive / plasma / window / pod: inside the atmosphere */
const Atmos: React.FC<Shot3DProps & { look: "down" | "ahead"; speed: number; palette: string; pov?: string; pod?: boolean }> = ({ t, seed, heat = 0, look, speed, palette, pov, pod, flash }) => {
  const P = PALETTES[palette] ?? PALETTES.ammonia;
  const pal = heat > 0 ? mixPalette(P, PALETTES.hot, Math.min(0.55, heat * 0.5)) : P;
  const fallen = seed * 37 + t * speed;
  const pitch = look === "ahead" ? -16 * DEG : -88 * DEG;
  const yaw = (seed * 23 + t * 3) * DEG;
  const shk = heat > 0 ? 0.35 + heat * 0.8 : 0.25;
  const sh = shake(t + seed, 0.12 * shk, 4);
  const camX = Math.sin(t * 0.05 + seed) * 20 - (look === "ahead" ? t * speed * 0.6 : 0) * Math.sin(yaw);
  const camZ = -(look === "ahead" ? t * speed * 0.6 : 0) * Math.cos(yaw);
  const pos: Vec3 = [camX + sh[0], sh[1], camZ + sh[2]];
  const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
  const lookAt: Vec3 = [pos[0] + dir.x, pos[1] + dir.y, pos[2] + dir.z];
  const up: Vec3 = look === "down" ? [Math.sin(yaw), 0, -Math.cos(yaw)] : [0, 1, 0];
  const fov = look === "down" ? 78 : 64;
  const fl = flash ? Math.max(0, 1 - t / 0.35) : 0;
  // pod: a capsule in front of the camera (3/4 view), heat shield down
  const podPos: Vec3 = [pos[0] + dir.x * 3 + Math.cos(yaw) * 0.75, pos[1] + dir.y * 3 - 0.3 + Math.sin(t * 2) * 0.03, pos[2] + dir.z * 3 + Math.sin(yaw) * 0.75];
  return (
    <AbsoluteFill style={{ background: pal.haze }}>
      <Stage fov={fov} quality={Q}>
        <CameraRig pos={pos} look={lookAt} fov={fov} up={up} roll={Math.sin(t * 0.7) * 0.03 * shk} />
        <CloudFall palette={pal} fallen={fallen} camX={camX} camZ={camZ} time={t + seed} spacing={14} layers={5} fogK={0.006} />
        <group position={pos}>
          <Streaks time={t + seed} speed={speed * 1.4} color={heat > 0.5 ? "#ffe0b0" : pal.streak} dir={look === "down" ? [0, 1, 0] : [-dir.x * 0.8, 0.45 - dir.y * 0.8, -dir.z * 0.8]} count={heat > 0 ? 700 : 420} opacity={heat > 0 ? 0.5 : 0.35} />
        </group>
        {pod ? (
          <group position={podPos} rotation={[0.25 + Math.sin(t * 1.3) * 0.04, t * 0.4, 0.35]}>
            <hemisphereLight args={["#fff4e0", "#5a4030", 1.1]} />
            <directionalLight position={[3, 5, 2]} intensity={2.2} />
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.16, 0.34, 0.42, 48]} />
              <meshStandardMaterial color="#e6e9ee" metalness={0.25} roughness={0.38} />
            </mesh>
            <mesh position={[0, -0.12, 0]} scale={[1, 0.38, 1]}>
              <sphereGeometry args={[0.36, 48, 24]} />
              <meshStandardMaterial color="#5a3a24" metalness={0.2} roughness={0.6} emissive="#ff7a30" emissiveIntensity={0.55} />
            </mesh>
            <mesh position={[0.0, 0.17, 0.205]} rotation={[0.25, 0, 0]}>
              <circleGeometry args={[0.07, 32]} />
              <meshStandardMaterial color="#9fd8ff" emissive="#7fc8ff" emissiveIntensity={0.9} />
            </mesh>
            <SunGlow position={[0, -0.25, 0]} size={1.6} color="#ff9a50" intensity={0.5} />
          </group>
        ) : null}
      </Stage>
      {heat > 0 ? <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 112%, rgba(255,150,60,${0.6 * heat}) 0%, rgba(255,70,10,${0.25 * heat}) 38%, rgba(0,0,0,0) 72%)`, mixBlendMode: "screen" }} /> : null}
      {pov ? <PovFrame kind={pov} t={t} shakeX={sh[0] * 200} shakeY={sh[1] * 200} heat={heat} /> : null}
      {fl > 0 ? <AbsoluteFill style={{ background: "#fff6e8", opacity: fl }} /> : null}
    </AbsoluteFill>
  );
};

export const Shot3D: React.FC<Shot3DProps> = (p) => {
  switch (p.scene) {
    case "meteor": return <Meteor {...p} />;
    case "far": return <Far {...p} />;
    case "fall": return <Fall {...p} />;
    case "scale": return <Scale {...p} />;
    case "dive": return <Atmos {...p} look="down" speed={p.calm ? 10 : 42} palette={p.calm ? "haze" : "ammonia"} />;
    case "plasma": return <Atmos {...p} look="ahead" speed={90} palette="space" heat={p.heat ?? 0.6} />;
    case "window": return <Atmos {...p} look="ahead" speed={80} palette="space" heat={0.85} pov="window" />;
    case "pod": return <Atmos {...p} look="ahead" speed={14} palette="ammonia" pod />;
    default: return <Meteor {...p} />;
  }
};
