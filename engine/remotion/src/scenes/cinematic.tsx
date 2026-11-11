/**
 * Cinematic shared scenes (real 3D with @remotion/three, NASA textures, procedural sky/clouds).
 * Per-video code only COMPOSES these through the beat's `visual` params; see PRODUCER.md for the
 * parameter reference. Layout/camera numbers (plain JSON numbers) are not fact-checked; any string
 * shown on screen (label, sub, readout values, layer labels) is, so measured numbers go there only
 * as {{calc_keys}}.
 *
 * Scenes: space, descent, cutaway, photo
 */
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useVideoConfig } from "remotion";
import * as THREE from "three";
import { C, DISPLAY, FONT } from "../brand";
import { Credit, Grade, PovFrame, Readouts, SceneLabel } from "../components/Cinema";
import { CameraRig, PHOTOS, Stage, Vec3, easeInOut, shake, smooth } from "../components/three/core";
import { CloudFall, CloudPalette, PALETTES, Streaks, mixPalette } from "../components/three/Clouds";
import { Cutaway, Layer, cutawayPoint } from "../components/three/Cutaway";
import { Planet, SunGlow } from "../components/three/Planet";
import { NebulaDome, SkyDome } from "../components/three/Sky";
import { clamp, prog } from "../timeline";
import { SceneEntry, SceneProps } from "../types";

/* eslint-disable @typescript-eslint/no-explicit-any */
const DEG = Math.PI / 180;
const num = (v: unknown, d: number) => (typeof v === "number" && Number.isFinite(v) ? v : d);

/** the shot clock: a beat that sets its own `shot` (or `cut: true`) starts a new shot */
export const shotClock = (p: SceneProps, key = "shot") => {
  const slots = p.run.slots;
  let k = 0;
  for (let i = p.idx; i >= 0; i--) {
    const v = slots[i].visual as any;
    if (i === 0 || v[key] !== undefined || v.cut) { k = i; break; }
  }
  let e = slots.length;
  for (let i = p.idx + 1; i < slots.length; i++) {
    const v = slots[i].visual as any;
    if (v[key] !== undefined || v.cut) { e = i; break; }
  }
  const start = k === 0 ? p.run.start : slots[k].start;
  const end = e < slots.length ? slots[e].start : p.run.end;
  const abs = p.run.start + p.t;
  return { s: abs - start, len: Math.max(0.5, end - start), first: k };
};

/** previous beat's merged params (for smooth blends between beats of one run) */
const beforeParams = (p: SceneProps) => Object.assign({}, ...p.run.slots.slice(0, p.idx).map((s) => s.visual)) as any;

/** label, sub and readout belong to the beat that sets them (not merged over the run); pov "none" clears */
const Overlays: React.FC<{ p: SceneProps; pov?: string; sx?: number; sy?: number; heat?: number; credit?: string; vignette?: number; tint?: string; tintK?: number }> = ({ p, pov, sx, sy, heat, credit, vignette, tint, tintK }) => {
  const own = (p.run.slots[p.idx]?.visual ?? {}) as any;
  return (
    <>
      <Grade vignette={vignette} tint={tint} tintK={tintK} />
      <PovFrame kind={pov && pov !== "none" ? pov : undefined} t={p.t} shakeX={sx} shakeY={sy} heat={heat} />
      <SceneLabel text={own.label} sub={own.sub} t={p.pt} />
      <Readouts items={own.readout} t={p.pt} />
      <Credit text={credit} />
    </>
  );
};

/* ------------------------------------------------------------------ space: planet hero shots */
const MOONS: Record<string, { body: string; pos: Vec3 }[]> = {
  galilean: [
    { body: "io", pos: [-3.2, 0.15, 1.6] }, { body: "europa", pos: [4.2, -0.2, -1.2] },
    { body: "ganymede", pos: [-6.5, 0.4, -3.5] }, { body: "callisto", pos: [10, 0.7, -7] },
  ],
};

export const Space: React.FC<SceneProps> = (p) => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const P = p.params;
  const { s, len } = shotClock(p);
  const shot: string = P.shot ?? "approach";
  const f = easeInOut(s / len);
  const lin = Math.min(1, s / len);
  const d0 = num(P.dist, shot === "limb" ? 1.25 : 3.4);
  const d1 = num(P.dist2, shot === "approach" ? d0 * 0.72 : shot === "fall" ? 1.08 : d0);
  let dist = d0 + (d1 - d0) * (shot === "fall" ? Math.pow(lin, 1.8) : f);
  const az0 = num(P.az, 25) * DEG;
  const az = az0 + (shot === "orbit" ? num(P.orbit, 35) * DEG * lin : shot === "drift" ? 6 * DEG * lin : 0);
  const el = num(P.el, 8) * DEG;
  const sunAz = az + num(P.sun, shot === "limb" ? 35 : 75) * DEG;
  const sun: Vec3 = [Math.sin(sunAz), 0.18, Math.cos(sunAz)];
  if (portrait) dist *= 1.35;
  let pos: Vec3 = [dist * Math.cos(el) * Math.sin(az), dist * Math.sin(el), dist * Math.cos(el) * Math.cos(az)];
  let look: Vec3 = [0, 0, 0];
  let up: Vec3 = [0, 1, 0];
  // frame the planet off-centre (rule of thirds) unless asked otherwise
  const side = num(P.frame, portrait ? 0 : 0.28);
  const right = new THREE.Vector3(Math.cos(az), 0, -Math.sin(az));
  look = [right.x * side * dist * 0.35, 0, right.z * side * dist * 0.35];
  if (shot === "limb") {
    // skim the cloud tops: look along the horizon (horizon in the upper third)
    const n = new THREE.Vector3(...pos).normalize();
    const tan = new THREE.Vector3().crossVectors(n, new THREE.Vector3(0, 1, 0)).normalize();
    const a = Math.acos(Math.min(0.999, 1 / dist)) - num(P.tilt, 10) * DEG;
    const dir = tan.multiplyScalar(Math.cos(a)).add(n.clone().multiplyScalar(-Math.sin(a)));
    look = [pos[0] + dir.x, pos[1] + dir.y, pos[2] + dir.z];
    up = [n.x, n.y, n.z];
  }
  const sh = shot === "fall" ? shake(p.t, 0.004 + 0.02 * lin * lin, 2) : shake(p.t, 0.0008, 1);
  pos = [pos[0] + sh[0], pos[1] + sh[1], pos[2] + sh[2]];
  const fov = num(P.fov, 38) * (portrait ? 1.6 : 1);
  const moons = typeof P.moons === "string" ? MOONS[P.moons] ?? [] : Array.isArray(P.moons) ? P.moons : [];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage fov={fov}>
        <CameraRig pos={pos} look={look} fov={fov} up={up} roll={num(P.roll, 0) * DEG} />
        <SkyDome bright={num(P.mw, 0.5)} stars={num(P.stars, 1)} />
        {P.nebula ? <NebulaDome time={p.t} colors={Array.isArray(P.nebula) ? (P.nebula as [string, string, string]) : undefined} intensity={num(P.nebulaK, 0.7)} /> : null}
        <Planet body={P.body ?? "jupiter"} time={p.t + num(P.t0, 0)} sun={sun} rings={!!P.rings} spin={num(P.spin, 0.0025)} />
        {moons.map((m: { body: string; pos: Vec3 }, i: number) => (
          <Planet key={i} body={m.body} position={m.pos} time={p.t} sun={sun} spin={0.002} segments={48} glow={0} />
        ))}
        {P.sunglow ? <SunGlow position={[sun[0] * 400, sun[1] * 400, sun[2] * 400]} size={90} intensity={num(P.sunglow, 1)} /> : null}
      </Stage>
      <Overlays p={p} pov={P.pov} vignette={0.5} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ descent: first-person fall through cloud layers */
const palette = (v: unknown): CloudPalette => {
  if (v && typeof v === "object") return { ...PALETTES.ammonia, ...(v as any) };
  return PALETTES[String(v ?? "ammonia")] ?? PALETTES.ammonia;
};

export const Descent: React.FC<SceneProps> = (p) => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const P = p.params;
  const before = beforeParams(p);
  const blend = num(P.blend, 2.5);
  const pal = p.idx > 0 && before.palette !== undefined && JSON.stringify(before.palette) !== JSON.stringify(P.palette)
    ? mixPalette(palette(before.palette), palette(P.palette), smooth(p.pt / blend))
    : palette(P.palette);
  // fallen distance = integral of each beat's speed (continuous across beats)
  let fallen = 0;
  const abs = p.run.start + p.t;
  const merged: any = {};
  p.run.slots.forEach((sl, i) => {
    Object.assign(merged, sl.visual);
    const a = i === 0 ? p.run.start : sl.start;
    const b = Math.min(abs, sl.showUntil);
    if (b > a) fallen += num(merged.speed, 16) * (b - a);
  });
  const speed = num(P.speed, 16);
  const look = P.look ?? "down";
  const pitch = typeof look === "number" ? look * DEG : look === "ahead" ? -18 * DEG : look === "up" ? 70 * DEG : -88 * DEG;
  const yaw = p.t * num(P.turn, 2.5) * DEG;
  const shk = num(P.shake, 0.25);
  const sh = shake(p.t, 0.12 * shk, 4);
  const camX = Math.sin(p.t * 0.05) * 20 - (look === "ahead" ? p.t * speed * 0.6 : 0) * Math.sin(yaw);
  const camZ = -(look === "ahead" ? p.t * speed * 0.6 : 0) * Math.cos(yaw);
  const pos: Vec3 = [camX + sh[0], sh[1], camZ + sh[2]];
  const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
  const lookAt: Vec3 = [pos[0] + dir.x, pos[1] + dir.y, pos[2] + dir.z];
  const up: Vec3 = look === "down" ? [Math.sin(yaw), 0, -Math.cos(yaw)] : [0, 1, 0];
  const fov = num(P.fov, look === "down" ? 75 : 62) * (portrait ? 1.35 : 1);
  const heat = num(P.heat, 0);
  return (
    <AbsoluteFill style={{ background: pal.haze }}>
      <Stage fov={fov} quality={num(P.quality, 0.4)}>
        <CameraRig pos={pos} look={lookAt} fov={fov} up={up} roll={Math.sin(p.t * 0.7) * 0.02 * shk} />
        <CloudFall palette={pal} fallen={fallen} camX={camX} camZ={camZ} time={p.t} spacing={num(P.spacing, 14)} layers={num(P.layers, 5)} fogK={num(P.fog, 0.006)} />
        <group position={pos}>
          <Streaks time={p.t} speed={speed * 1.4} color={pal.streak} dir={look === "down" ? [0, 1, 0] : [-dir.x * 0.8, 0.45 - dir.y * 0.8, -dir.z * 0.8]} count={num(P.streaks, 1) > 0 ? Math.round(420 * num(P.streaks, 1)) : 1} opacity={num(P.streaks, 1) > 0 ? 0.35 : 0} />
        </group>
      </Stage>
      {heat > 0 ? <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 110%, rgba(255,120,40,${0.55 * heat}) 0%, rgba(255,60,10,${0.2 * heat}) 35%, rgba(0,0,0,0) 70%)` }} /> : null}
      <Overlays p={p} pov={P.pov} sx={sh[0] * 200} sy={sh[1] * 200} heat={heat} vignette={0.6} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ cutaway: interior layers */
export const CutawayScene: React.FC<SceneProps> = (p) => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const P = p.params;
  const layers: Layer[] = P.layers ?? [];
  const hi = num(P.hi, -1);
  const before = beforeParams(p);
  const hiK = hi >= 0 ? prog(p.pt, 0.2, 1.2) : 0;
  const dist = num(P.dist, 3.4) * (portrait ? 1.55 : 1);
  const az = (num(P.az, 28) + p.t * num(P.orbit, 1.2)) * DEG;
  const el = num(P.el, 16) * DEG;
  const pos: Vec3 = [dist * Math.cos(el) * Math.sin(az), dist * Math.sin(el), dist * Math.cos(el) * Math.cos(az)];
  const side = portrait ? 0 : num(P.frame, 0.3);
  const right = new THREE.Vector3(Math.cos(az), 0, -Math.sin(az));
  const look: Vec3 = [right.x * side, portrait ? -0.25 : 0, right.z * side];
  const fov = num(P.fov, 36) * (portrait ? 1.5 : 1);
  const spin = 0.01;
  const markerR = P.marker === undefined ? undefined : num(P.marker, 0.9);
  const prevMarker = before.marker === undefined ? markerR : num(before.marker, 0.9);
  const mR = markerR === undefined ? undefined : (prevMarker ?? markerR) + (markerR - (prevMarker ?? markerR)) * smooth(p.pt / 2.5);
  // project label anchors (mid-radius of each layer on the z = 0 cut face) to screen
  const cam = new THREE.PerspectiveCamera(fov, width / height, 0.01, 100);
  cam.position.set(...pos);
  cam.lookAt(...look);
  cam.updateMatrixWorld();
  const sorted = [...layers].map((l, i) => ({ ...l, i })).sort((a, b) => a.r - b.r);
  const anchors = sorted.map((l, k) => {
    const inner = k === 0 ? 0 : sorted[k - 1].r;
    const w = cutawayPoint((inner + l.r) / 2, -0.5 + 0.08 * k, p.t, spin).project(cam);
    return { ...l, x: (w.x * 0.5 + 0.5) * width, y: (-w.y * 0.5 + 0.5) * height };
  });
  const labelX = portrait ? 0 : width * 0.66;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Stage fov={fov}>
        <CameraRig pos={pos} look={look} fov={fov} />
        <SkyDome bright={0.35} stars={0.8} />
        <Cutaway body={P.body ?? "jupiter"} layers={layers} time={p.t} highlight={hi} hiK={hiK} spin={spin} marker={mR} />
      </Stage>
      {!portrait && P.labels !== false ? (
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          {anchors.filter((a) => a.label).map((a, k) => {
            const ly = 300 + k * (560 / Math.max(1, anchors.length - 1));
            const on = a.i === hi;
            const op = prog(p.t, 0.4 + k * 0.15, 1.2 + k * 0.15) * (hi >= 0 && !on ? 0.55 : 1);
            return (
              <g key={k} opacity={op}>
                <polyline points={`${a.x},${a.y} ${labelX - 30},${ly} ${labelX - 6},${ly}`} fill="none" stroke={on ? C.amber : "rgba(244,246,255,0.55)"} strokeWidth={on ? 2.5 : 1.5} />
                <circle cx={a.x} cy={a.y} r={on ? 6 : 4} fill={on ? C.amber : C.white} />
                <text x={labelX} y={ly + 9} fontFamily={FONT} fontWeight={on ? 800 : 600} fontSize={on ? 32 : 27} fill={on ? C.amber : C.white} style={{ textShadow: "0 2px 10px #000" } as any}>{a.label}</text>
              </g>
            );
          })}
        </svg>
      ) : null}
      {portrait && hi >= 0 && layers[hi]?.label ? (
        <div style={{ position: "absolute", left: 70, right: 120, top: 1060, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, color: C.amber, opacity: hiK, textShadow: "0 4px 20px #000" }}>{layers[hi].label}</div>
      ) : null}
      <Overlays p={p} vignette={0.45} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ photo: Ken Burns on a library photo */
export const Photo: React.FC<SceneProps> = (p) => {
  const { width, height } = useVideoConfig();
  const P = p.params;
  const { s, len } = shotClock(p, "photo");
  const ph = PHOTOS[String(P.photo ?? "jupiter_globe")] ?? PHOTOS.jupiter_globe;
  const f = interpolate(s, [0, len], [0, 1], clamp);
  const move = String(P.move ?? "in");
  const z0 = num(P.zoom0, move === "out" ? 1.28 : 1.04);
  const z1 = num(P.zoom, move === "out" ? 1.04 : move === "in" ? 1.22 : 1.12);
  const z = z0 + (z1 - z0) * f;
  const fx = num(P.fx, 0.5);
  const fy = num(P.fy, 0.5);
  const pan = move === "left" ? -1 : move === "right" ? 1 : 0;
  const tilt = move === "up" ? -1 : move === "down" ? 1 : 0;
  const tx = (0.5 - fx) * 100 * (z - 1) + pan * (f - 0.5) * 6;
  const ty = (0.5 - fy) * 100 * (z - 1) + tilt * (f - 0.5) * 6;
  const fit = P.fit === "contain" ? "contain" : "cover";
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {fit === "contain" ? (
        <Img src={staticFile(`lib/photos/${ph[0]}`)} style={{ position: "absolute", inset: 0, width, height, objectFit: "cover", filter: "blur(40px) brightness(0.35)", scale: 1.2 }} />
      ) : null}
      <Img src={staticFile(`lib/photos/${ph[0]}`)} style={{ position: "absolute", inset: 0, width, height, objectFit: fit, transform: `translate(${tx}%, ${ty}%) scale(${z})`, transformOrigin: `${fx * 100}% ${fy * 100}%` }} />
      <Overlays p={p} credit={ph[1]} vignette={0.5} />
    </AbsoluteFill>
  );
};

export const CINEMATIC_SCENES: Record<string, SceneEntry> = {
  space: { C: Space, shift: false, opaque: true },
  descent: { C: Descent, shift: false, opaque: true },
  cutaway: { C: CutawayScene, shift: false, opaque: true },
  photo: { C: Photo, shift: false, opaque: true },
};
