/**
 * "What If You Fell Into Jupiter?" style sample: a cut list of short shots (NASA footage, NASA stills,
 * our 3D, data cards) with camera grammar on every shot:
 *   - every hold creeps (push-in), never a static frame
 *   - cuts land 2-3 frames before their word; about 1 in 3 cuts enters with a whip or a zoom punch
 *   - a keyword landing inside a shot punches the frame in (+5%) with a 7-frame impact shake
 * The edit (build/props.json) is computed by engine/videos/jupiter-style-sample/build.py.
 */
import { Video } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, DISPLAY, FONT } from "../../brand";
import { Card, Stars } from "./Cards";
import { Shot3D } from "./Shot3D";
import { Cap, Captions, Keyword, Kw } from "./Text";

export type ShotP = {
  id: string; from: number; dur: number; kind: string; line: string;
  src?: string; srcs?: string[]; push?: [number, number]; fx?: number; fy?: number; earth?: boolean; credit?: string;
  move?: string; stars?: boolean; scene?: string; seed?: number; heat?: number; flash?: boolean; fast?: boolean; wide?: boolean; calm?: boolean;
  card?: string; label?: string; overlay?: string; stock?: string;
};
export type SampleProps = { fps: number; total: number; durationInFrames: number; shots: ShotP[]; kws: Kw[]; caps: Cap[] };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ------------------------------------------------------------------ media shots */
const Clip: React.FC<{ s: ShotP; t: number; len: number }> = ({ s, t, len }) => {
  const [z0, z1] = s.push ?? [1, 1.08];
  const z = interpolate(t, [0, len], [z0, z1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.6, 1) });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: String(z), transformOrigin: `${(s.fx ?? 0.5) * 100}% ${(s.fy ?? 0.5) * 100}%` }}>
        <Video src={staticFile(s.src!)} muted objectFit="cover" style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
      {s.earth ? <EarthDisc t={t} /> : null}
    </AbsoluteFill>
  );
};

/** Earth laid over the Great Red Spot at about the right scale (storm ~1.3 Earths wide in this shot:
 *  the oval spans ~800 px, so Earth is ~615 px), the classic size comparison */
const EarthDisc: React.FC<{ t: number }> = ({ t }) => {
  const k = interpolate(t, [0.45, 0.7], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 1.4, 0.4, 1) });
  const D = 590;
  return (
    <div style={{ position: "absolute", left: 820 - D / 2, top: 345 - D / 2, width: D, height: D, opacity: Math.min(1, k * 1.5) * 0.92, scale: String(0.6 + 0.4 * k) }}>
      <div style={{ width: D, height: D, borderRadius: "50%", overflow: "hidden", boxShadow: "0 0 50px rgba(90,168,255,0.7)", border: "3px solid rgba(255,255,255,0.8)" }}>
        <Img src={staticFile("lib/photos/earth_as17-148-22727.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", scale: "1.51" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: D * 0.44, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 38, letterSpacing: 10, color: C.white, textShadow: "0 3px 14px #000" }}>EARTH</div>
    </div>
  );
};

const Photo: React.FC<{ s: ShotP; t: number; len: number }> = ({ s, t, len }) => {
  const srcs = s.srcs ?? [];
  const f = Math.min(1, t / len);
  const move = s.move ?? "push";
  let z = 1 + 0.15 * f;
  let fx = s.fx ?? 0.5;
  let fy = s.fy ?? 0.5;
  if (move === "rush") z = 1 + 0.5 * Math.pow(f, 1.7);
  if (move === "diag") { z = 1.55; fx = interpolate(f, [0, 1], [0.12, 0.72]); fy = interpolate(f, [0, 1], [0.1, 0.78]); }
  if (move === "flip") z = 1.0 + 0.1 * f;
  const tx = (0.5 - fx) * 100 * (z - 1);
  const ty = (0.5 - fy) * 100 * (z - 1);
  // flipbook: step through the frames, 3-frame cross-dissolve between them
  const n = srcs.length;
  const pos = move === "flip" ? Math.min(n - 1, f * n * 1.05) : 0;
  const i0 = Math.floor(pos);
  const mix = move === "flip" ? interpolate(pos - i0, [0.82, 1], [0, 1], clamp) : 0;
  const layer = (src: string, op: number, extra = 1) => (
    <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: op,
      transform: `translate(${tx}%, ${ty}%) scale(${z * extra})`, transformOrigin: `${fx * 100}% ${fy * 100}%` }} />
  );
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {move === "flip" ? <Stars t={t} drift={40} opacity={0.8} /> : null}
      {layer(srcs[i0], 1)}
      {move === "flip" && i0 + 1 < n ? layer(srcs[i0 + 1], mix) : null}
      {move === "rush" ? <div style={{ position: "absolute", inset: 0, opacity: 0.35 * f, filter: "blur(6px)" }}>{layer(srcs[0], 1, 1.05)}</div> : null}
      {s.stars ? <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}><Stars t={t} drift={160} count={140} opacity={0.65} /></div> : null}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ per-shot camera grammar */
const ShotFrame: React.FC<{ s: ShotP; idx: number; kws: Kw[]; children: React.ReactNode }> = ({ s, idx, kws, children }) => {
  const f = useCurrentFrame();
  const entry = idx === 0 ? "cut" : idx % 3 === 1 ? "whip" : idx % 3 === 2 ? "punch" : "cut";
  const dir = idx % 2 ? 1 : -1;
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let blur = 0;
  if (entry === "whip" && s.kind !== "card") {
    const k = interpolate(f, [0, 5], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
    tx += dir * 160 * k;
    blur = 16 * k;
  }
  if (entry === "punch") scale *= interpolate(f, [0, 7], [1.14, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  for (const k of kws) {
    const r = s.from + f - k.from; // frames since the keyword landed
    if (k.from >= s.from && k.from < s.from + s.dur && r >= 0) {
      scale *= 1 + 0.05 * interpolate(r, [0, 4], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
      if (r < 8) {
        const a = 14 * Math.exp(-r / 2.6);
        tx += (r % 2 ? -1 : 1) * a;
        ty += (r % 2 ? 1 : -1) * a * 0.6;
      }
    }
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ scale: String(scale), translate: `${tx}px ${ty}px`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const ShotBody: React.FC<{ s: ShotP }> = ({ s }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const len = s.dur / fps;
  if (s.kind === "clip") return <Clip s={s} t={t} len={len} />;
  if (s.kind === "photo") return <Photo s={s} t={t} len={len} />;
  if (s.kind === "3d") return <Shot3D scene={s.scene!} t={t} len={len} seed={s.seed ?? 1} heat={s.heat} flash={s.flash} fast={s.fast} wide={s.wide} calm={s.calm} />;
  return <Card card={s.card ?? ""} t={t} len={len} label={s.label} />;
};

/** speed readout for the final plunge (counts up to the fact-checked 57 km/s) */
const SpeedHud: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = interpolate(f / fps, [0, len * 0.8], [41.0, 57.4], { ...clamp, easing: Easing.in(Easing.quad) });
  return (
    <div style={{ position: "absolute", right: 90, top: 80, textAlign: "right" }}>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 28, letterSpacing: 8, color: C.dim }}>SPEED</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 84, color: C.amber, fontVariantNumeric: "tabular-nums", textShadow: "0 0 24px rgba(255,181,71,0.5)" }}>
        {v.toFixed(1)}<span style={{ fontSize: 40, color: C.white }}> km/s</span>
      </div>
    </div>
  );
};

const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.45) 100%)" }} />
);

export const JupiterStyleSample: React.FC<SampleProps> = (p) => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {p.shots.map((s, i) => (
        <Sequence key={s.id} name={`${s.id} ${s.kind}${s.scene ? ":" + s.scene : ""}${s.card ? ":" + s.card : ""}`} from={s.from} durationInFrames={s.dur} premountFor={s.kind === "3d" ? 0 : 20}>
          <ShotFrame s={s} idx={i} kws={p.kws}>
            <ShotBody s={s} />
          </ShotFrame>
          {s.kind === "3d" && s.fast ? <SpeedHud len={s.dur / p.fps} /> : null}
          {s.overlay === "nope" && s.label ? (
            <AbsoluteFill style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-start", padding: 90 }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 120, color: C.white, textShadow: "0 6px 30px #000" }}>NO {s.label}</div>
            </AbsoluteFill>
          ) : null}
        </Sequence>
      ))}
      <Grade />
      {p.kws.map((k, i) => (
        <Sequence key={`kw${i}`} name={`kw ${k.text}`} from={k.from} durationInFrames={k.dur} layout="none">
          <Keyword kw={k} />
        </Sequence>
      ))}
      <Captions caps={p.caps} kws={p.kws} fps={p.fps} />
    </AbsoluteFill>
  );
};
