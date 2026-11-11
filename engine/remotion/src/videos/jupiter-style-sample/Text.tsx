/**
 * Kinetic keywords (1-3 words, huge, pop on the spoken word) and short bottom captions (<= 3 words,
 * current word highlighted). Captions hide while a keyword is on screen, so there is one thing to read.
 */
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, DISPLAY, FONT } from "../../brand";

export type Kw = { from: number; dur: number; text: string; style: string };
export type Cap = { from: number; to: number; words: { w: string; t: number }[] };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pop = Easing.bezier(0.2, 1.6, 0.4, 1);

const STYLE: Record<string, { size: number; color: string; glow: string; top: number; track: number; italic?: boolean; grad?: string }> = {
  num: { size: 176, color: C.white, glow: "rgba(255,181,71,0.55)", top: 0.6, track: 2 },
  numTop: { size: 160, color: C.white, glow: "rgba(255,181,71,0.55)", top: 0.17, track: 2 },
  big: { size: 150, color: C.white, glow: "rgba(0,0,0,0.75)", top: 0.6, track: 4 },
  question: { size: 140, color: C.white, glow: "rgba(0,0,0,0.75)", top: 0.6, track: 2 },
  titleTop: { size: 104, color: C.white, glow: "rgba(61,224,255,0.45)", top: 0.2, track: 18 },
  title: { size: 112, color: C.white, glow: "rgba(61,224,255,0.45)", top: 0.5, track: 22 },
  clock: { size: 168, color: C.white, glow: "rgba(61,224,255,0.5)", top: 0.6, track: 2 },
  speed: { size: 190, color: C.white, glow: "rgba(255,120,40,0.7)", top: 0.6, track: 0, italic: true },
  hot: { size: 180, color: "#fff4d8", glow: "rgba(255,110,30,0.9)", top: 0.6, track: 6, grad: "linear-gradient(180deg,#fffbe8 0%,#ffd27a 45%,#ff7a2a 100%)" },
};

export const Keyword: React.FC<{ kw: Kw }> = ({ kw }) => {
  const f = useCurrentFrame(); // relative to the keyword's Sequence
  const S0 = STYLE[kw.style] ?? STYLE.big;
  // long lines shrink so they never touch the frame edge (1920 px minus margins)
  const est = kw.text.length * (S0.size * 0.62 + S0.track);
  const S = est > 1640 ? { ...S0, size: S0.size * 1640 / est, track: S0.track * 1640 / est } : S0;
  const words = kw.text.split(" ");
  const out = interpolate(f, [kw.dur - 5, kw.dur], [1, 0], clamp);
  const n = kw.style === "clock" ? Math.round(interpolate(f, [0, 16], [0, 27], clamp)) : null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: `${S.top * 100}%`, translate: "0 -50%", display: "flex", justifyContent: "center", gap: S.size * 0.28, opacity: out }}>
        {words.map((w, i) => {
          const k = interpolate(f - i * 2, [0, 7], [0, 1], { ...clamp, easing: pop });
          const txt = n !== null && i === 0 ? String(n) : w;
          const last = w.endsWith("?");
          return (
            <span key={i} style={{
              fontFamily: DISPLAY, fontWeight: 900, fontSize: S.size, letterSpacing: S.track, lineHeight: 1, color: S.color,
              fontStyle: S.italic ? "italic" : "normal", display: "inline-block", fontVariantNumeric: "tabular-nums",
              opacity: Math.min(1, k * 1.6), scale: String(0.55 + 0.45 * k), translate: `0 ${(1 - k) * 40}px`,
              textShadow: `0 6px 24px rgba(0,0,0,0.85), 0 0 60px ${S.glow}`,
              ...(S.grad ? { backgroundImage: S.grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: `drop-shadow(0 0 30px ${S.glow}) drop-shadow(0 6px 18px rgba(0,0,0,0.8))`, textShadow: "none" } : {}),
            }}>
              {last ? <>{txt.slice(0, -1)}<span style={{ color: C.amber }}>?</span></> : txt}
            </span>
          );
        })}
      </div>
      {kw.style.startsWith("title") ? (
        <div style={{ position: "absolute", left: "50%", top: `${S.top * 100 + 7}%`, width: interpolate(f, [2, 12], [0, 520], clamp), height: 4, translate: "-50% 0", background: C.cyan, opacity: out * 0.9, boxShadow: `0 0 20px ${C.cyan}` }} />
      ) : null}
    </AbsoluteFill>
  );
};

export const Captions: React.FC<{ caps: Cap[]; kws: Kw[]; fps: number }> = ({ caps, kws, fps }) => {
  const frame = useCurrentFrame();
  const t = frame / fps;
  const hide = kws.some((k) => frame >= k.from - 2 && frame < k.from + k.dur);
  const c = caps.find((x) => t >= x.from && t < x.to);
  if (!c || hide) return null;
  const k = interpolate(t - c.from, [0, 0.1], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 92, display: "flex", justifyContent: "center", gap: 18, opacity: k, scale: String(0.94 + 0.06 * k) }}>
        {c.words.map((w, i) => {
          const on = t >= w.t - 0.03 && (i === c.words.length - 1 || t < c.words[i + 1].t - 0.03);
          return (
            <span key={i} style={{ fontFamily: FONT, fontWeight: 900, fontSize: 60, letterSpacing: 0.5, textTransform: "uppercase",
              color: on ? C.amber : C.white, WebkitTextStroke: "2px rgba(0,0,0,0.85)", paintOrder: "stroke fill",
              textShadow: "0 4px 14px rgba(0,0,0,0.9)" }}>{w.w}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
