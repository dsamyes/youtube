// Native vertical Short (1080x1920): its own narration and beats, rendered with the video's own
// scenes (scenes read useVideoConfig() and lay themselves out vertically), plus word-by-word
// captions in the Shorts safe area, a first-frame hook line and a light end pill.
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, DISPLAY, FONT } from "./brand";
import { VIDEO_OVERLAY } from "./generated/registry";
import { RunView } from "./IfEngineVideo";
import { buildRuns, buildSlots, clamp, prog } from "./timeline";
import { ShortProps, Slot, Word } from "./types";

// Shorts UI covers the bottom ~22% and a right-hand column of buttons: keep text inside this box
const SAFE = { left: 70, right: 960, capY: 1235 };

/** group words into caption chunks of up to 3 words, breaking after punctuation */
const chunk = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= 3 || /[.,?!:;]$/.test(w.w)) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

const Captions: React.FC<{ words: Word[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const groups = React.useMemo(() => chunk(words), [words]);
  const g = groups.find((gr, i) => t >= gr[0].start - 0.05 && t < (groups[i + 1]?.[0].start ?? gr[gr.length - 1].end + 0.6));
  if (!g) return null;
  const g0 = g[0].start;
  const enter = spring({ frame: Math.round((t - g0) * fps), fps, config: { damping: 16, stiffness: 220 } });
  return (
    <div style={{
      position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: SAFE.capY, display: "flex", flexWrap: "wrap",
      justifyContent: "center", gap: "0 22px", fontFamily: DISPLAY, fontWeight: 900, fontSize: 92, lineHeight: 1.08,
      textTransform: "uppercase", letterSpacing: -1, scale: interpolate(enter, [0, 1], [0.86, 1]), opacity: Math.min(1, enter * 1.4),
    }}>
      {g.map((w, i) => {
        const on = t >= w.start - 0.03;
        const hot = t >= w.start - 0.03 && t < w.end + 0.05;
        const num = /\d/.test(w.w);
        return (
          <span key={i} style={{
            color: hot || num ? C.amber : C.white, opacity: on || hot ? 1 : 0.92,
            WebkitTextStroke: "3px #070920", paintOrder: "stroke fill", textShadow: "0 6px 26px #000c, 0 0 2px #000",
          }}>{w.w}</span>
        );
      })}
    </div>
  );
};

const Hook: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (!text || t > 3.2) return null;
  const out = prog(t, 2.6, 3.2);
  return (
    <div style={{
      position: "absolute", left: SAFE.left, width: SAFE.right - SAFE.left, top: 200, textAlign: "center", fontFamily: DISPLAY,
      fontWeight: 900, fontSize: 64, lineHeight: 1.04, color: C.white, textTransform: "uppercase", letterSpacing: -1,
      textShadow: "0 8px 30px #000d", opacity: 1 - out, translate: `0px ${-out * 40}px`,
    }}>
      {text.split(/(\d[\d,.]*)/).map((p, i) => (<span key={i} style={{ color: /\d/.test(p) ? C.amber : undefined }}>{p}</span>))}
    </div>
  );
};

const Brand: React.FC<{ total: number; end: string }> = ({ total, end }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pill = prog(t, total - 3.4, total - 2.9);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: SAFE.left, top: 120, display: "flex", alignItems: "center", gap: 14, opacity: 0.92 }}>
        <Img src={staticFile("logo.svg")} style={{ width: 54, height: 54 }} />
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, letterSpacing: 3, color: C.white }}>THE IF ENGINE</div>
      </div>
      {/* thin progress line: makes the loop point visible */}
      <div style={{ position: "absolute", left: 0, top: 0, height: 8, width: `${interpolate(t, [0, total], [0, 100], clamp)}%`, background: C.cyan, opacity: 0.8 }} />
      {end ? (
        <div style={{
          position: "absolute", right: 1080 - SAFE.right, top: 112, display: "flex", justifyContent: "flex-end",
          opacity: pill, translate: `${(1 - pill) * 40}px 0px`,
        }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.deep, background: C.cyan, padding: "10px 24px", borderRadius: 40, letterSpacing: 1 }}>{end}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const OverlayLayer: React.FC<{ data: ShortProps; slots: Slot[] }> = ({ data, slots }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const cur = slots.find((s) => time >= s.start && time < s.showUntil);
  const VO = VIDEO_OVERLAY;
  return VO ? <VO data={data} time={time} slots={slots} slot={cur} /> : null;
};

export const IfEngineShort: React.FC<ShortProps> = (data) => {
  const { fps } = useVideoConfig();
  const slots = React.useMemo(() => buildSlots(data), [data]);
  const runs = React.useMemo(() => buildRuns(slots), [slots]);
  const noShift = React.useCallback(() => 0, []);
  return (
    <AbsoluteFill style={{ background: C.deep }}>
      {runs.map((run, i) => (
        <Sequence key={i} name={`${run.scene} · ${run.slots[0].id}`} from={Math.round(run.start * fps)}
          durationInFrames={Math.max(1, Math.round((run.end - run.start) * fps))}>
          <RunView run={run} data={data} cardShift={noShift} noFadeIn={i === 0} />
        </Sequence>
      ))}
      <OverlayLayer data={data} slots={slots} />
      <Brand total={data.timing.total} end={data.end} />
      <Hook text={data.hook} />
      <Captions words={data.words} />
      {data.hasAudio ? <Audio src={staticFile(data.audioFile)} /> : null}
    </AbsoluteFill>
  );
};
