import { Easing, interpolate } from "remotion";
import { SceneRun, Slot, VideoProps } from "./types";

export function buildSlots(d: VideoProps): Slot[] {
  const tb = Object.fromEntries(d.timing.beats.map((b) => [b.id, b]));
  const flat = d.sections.flatMap((s) => s.beats.map((b) => ({ ...b, section: s.id })));
  return flat.map((b, i) => {
    const t = tb[b.id];
    const next = flat[i + 1] ? tb[flat[i + 1].id].start : d.timing.total;
    return { ...b, start: i === 0 ? 0 : t.start, end: t.end, showUntil: next };
  });
}

export function buildRuns(slots: Slot[]): SceneRun[] {
  const runs: SceneRun[] = [];
  for (const s of slots) {
    const last = runs[runs.length - 1];
    if (last && last.scene === s.visual.scene) {
      last.slots.push(s);
      last.end = s.showUntil;
    } else {
      runs.push({ scene: s.visual.scene, start: s.start, end: s.showUntil, slots: [s] });
    }
  }
  return runs;
}

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** 0->1 over [a, b] seconds with ease-out */
export const prog = (t: number, a: number, b: number, e = ease) =>
  interpolate(t, [a, b], [0, 1], { ...clamp, easing: e });

/** fade in over `inn`, fade out over last `out` seconds of a window of length `len` */
export const windowFade = (t: number, len: number, inn = 0.35, out = 0.35) =>
  Math.min(prog(t, 0, inn), 1 - prog(t, len - out, len));

/** deterministic pseudo-random in [0,1) */
export const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const fmtNum = (x: number, dec = 0) =>
  x.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
