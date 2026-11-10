import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, DISPLAY, FONT } from "../brand";
import { clamp, prog, rand } from "../timeline";
import { Card, Slot, VideoProps } from "../types";

/* ------------------------------------------------------------------ background */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const stars = React.useMemo(
    () => Array.from({ length: 140 }).map((_, i) => ({ x: rand(i) * 1920, y: rand(i + 999) * 1080, r: 0.6 + rand(i + 77) * 1.8, p: rand(i + 5) })),
    [],
  );
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 62% 40%, #232A6B 0%, ${C.navy} 45%, ${C.deep} 100%)` }}>
      <svg width={1920} height={1080}>
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff"
            opacity={0.25 + 0.35 * (0.5 + 0.5 * Math.sin(frame / 40 + s.p * 6.28))} />
        ))}
      </svg>
      {/* subtle engineering grid */}
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(${C.faint} 1px, transparent 1px), linear-gradient(90deg, ${C.faint} 1px, transparent 1px)`,
        backgroundSize: "120px 120px", opacity: 0.18,
      }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ math card */
export const MathCard: React.FC<{ card: Card; t: number; len: number }> = ({ card, t, len }) => {
  const { fps } = useVideoConfig();
  const enter = spring({ frame: Math.round(t * fps), fps, config: { damping: 200 }, durationInFrames: Math.round(0.6 * fps) });
  const exit = prog(t, len - 0.4, len);
  const row = (i: number) => prog(t, 0.35 + i * 0.45, 0.85 + i * 0.45);
  return (
    <div style={{
      position: "absolute", right: 80, top: 190, width: 660, padding: "34px 40px 30px",
      background: "linear-gradient(160deg, rgba(27,33,87,0.94), rgba(10,13,44,0.94))",
      border: `2px solid ${C.cyan}`, borderRadius: 28, boxShadow: `0 0 60px ${C.cyan}33, 0 30px 60px #0008`,
      fontFamily: FONT, color: C.white, opacity: enter * (1 - exit),
      translate: `${interpolate(enter, [0, 1], [80, 0])}px 0px`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div style={{ background: C.cyan, color: C.deep, fontWeight: 900, fontSize: 22, padding: "6px 14px", borderRadius: 10, letterSpacing: 2 }}>MATH CARD</div>
        <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.15 }}>{card.title}</div>
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: 54, fontWeight: 800, color: C.cyan, opacity: row(0), margin: "8px 0 14px" }}>{card.formula}</div>
      <div style={{ fontSize: 30, fontWeight: 500, color: C.dim, opacity: row(1), marginBottom: 16 }}>{card.sub}</div>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${C.cyan}, ${C.purple})`, opacity: row(2), marginBottom: 16 }} />
      <div style={{ fontFamily: DISPLAY, fontSize: 46, fontWeight: 900, color: C.amber, opacity: row(2), scale: interpolate(row(2), [0, 1], [0.9, 1]), transformOrigin: "left center" }}>
        {/^[≈≥≤<>]/.test(card.result) ? card.result : `= ${card.result}`}
      </div>
      <div style={{ fontSize: 24, color: C.dim, marginTop: 16, opacity: row(3) }}>{card.note}</div>
      <div style={{ fontSize: 20, color: C.purple, marginTop: 10, fontWeight: 600, opacity: row(3) }}>Source: {card.src} · full list in description</div>
    </div>
  );
};

/* ------------------------------------------------------------------ kinetic headline */
export const Kinetic: React.FC<{ text: string; t: number; len: number; shifted: number }> = ({ text, t, len, shifted }) => {
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const out = prog(t, len - 0.35, len);
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center", flexWrap: "wrap",
      gap: "0 22px", padding: "0 160px", fontFamily: DISPLAY, fontWeight: 900, fontSize: 84, color: C.white,
      textShadow: "0 8px 30px #000a", opacity: 1 - out, translate: `${-shifted * 300}px 0px`,
      textTransform: "uppercase", letterSpacing: -1,
    }}>
      {words.map((w, i) => {
        const s = spring({ frame: Math.round((t - i * 0.09) * fps), fps, config: { damping: 14, stiffness: 160 } });
        const hl = /\d|→|←|×|≈|\+/.test(w);
        return (
          <span key={i} style={{ display: "inline-block", opacity: Math.min(1, s), translate: `0px ${(1 - s) * 40}px`, color: hl ? C.amber : C.white }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ HUD */
export const Hud: React.FC<{ data: VideoProps; time: number; slot: Slot | undefined }> = ({ data, time, slot }) => {
  const total = data.timing.total;
  const secs = data.timing.sections;
  const found = secs.findIndex((s) => time >= s.start && time < s.end);
  // after the last section (the closing tail) stay on the last chapter
  const cur = found >= 0 ? found : secs.length && time >= secs[secs.length - 1].start ? secs.length - 1 : found;
  const sec = secs[Math.max(0, cur)];
  const clock = sec?.clock;
  const clockIn = sec ? prog(time, sec.start, sec.start + 0.5) : 0;
  const barW = 1600;
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.white }}>
      {/* logo bug */}
      <div style={{ position: "absolute", left: 60, top: 44, display: "flex", alignItems: "center", gap: 16, opacity: 0.9 }}>
        <Img src={staticFile("logo.svg")} style={{ width: 62, height: 62 }} />
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, letterSpacing: 3 }}>THE IF ENGINE</div>
      </div>
      {/* scenario clock */}
      {clock ? (
        <div style={{
          position: "absolute", right: 60, top: 44, padding: "10px 22px", borderRadius: 14, border: `2px solid ${C.amber}`,
          background: "rgba(7,9,32,0.75)", fontFamily: DISPLAY, fontWeight: 800, fontSize: 34, color: C.amber,
          opacity: clockIn, display: "flex", gap: 14, alignItems: "baseline",
        }}>
          <span style={{ fontSize: 16, letterSpacing: 3, color: C.dim, fontFamily: FONT, fontWeight: 700 }}>SCENARIO CLOCK</span>
          {clock}
        </div>
      ) : null}
      {/* chapter progress */}
      <div style={{ position: "absolute", left: 160, bottom: 46, width: barW }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.dim, letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>
          {String(Math.max(1, cur + 1)).padStart(2, "0")} / {String(secs.length).padStart(2, "0")} · {sec?.chapter}
        </div>
        <div style={{ display: "flex", gap: 6, height: 8 }}>
          {secs.map((s, i) => {
            const w = ((s.end - s.start) / total) * (barW - 6 * secs.length);
            const fill = interpolate(time, [s.start, s.end], [0, 1], clamp);
            return (
              <div key={s.id} style={{ width: w, height: 8, borderRadius: 4, background: C.faint, overflow: "hidden" }}>
                <div style={{ width: `${fill * 100}%`, height: "100%", background: i === cur ? C.cyan : C.purple }} />
              </div>
            );
          })}
        </div>
      </div>
      {slot?.retention ? null : null}
    </AbsoluteFill>
  );
};
