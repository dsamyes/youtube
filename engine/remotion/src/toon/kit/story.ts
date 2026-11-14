// Story toolkit of the cartoon-short kit: the types a video's story file fills in, small math helpers, the camera
// rig (key framings, smootherstep glides, creeping push-ins, impact kicks), the depth-of-field table, crossfade
// layers and the reader for engine/videos/<id>/shots.json. Nothing in here knows a particular story.
// Camera grammar (from the cartoon-3d-short skill): every move is a symmetric smootherstep glide of 18-40 f; a reframe
// bigger than about half a frame width is a hard cut on its key frame; every hold pushes in 0.1-0.35 %/f (0.4-0.7 %/f
// on a punch word); impact kicks flip sign every frame and decay over 7 f; no hand-held float.
// Everything must stay a pure function of the frame number.
export const FPS = 30;
export const D0 = 0; // ground level of the town (garden + park)
export type V3 = [number, number, number];

// ---------------- math ----------------
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** piecewise-linear table lookup: lin([[f0, v0], [f1, v1], ...], f) */
export const lin = (pts: [number, number][], x: number) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return pts[pts.length - 1][1];
};
/** deterministic hash in [0, 1) (use it instead of Math.random) */
export const hash = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };

// ---------------- shots ----------------
/** light presets (lights.ts): any place can be shot under any of them */
export type Light = "day" | "golden" | "night" | "space" | "shaft";
/** key light of one shot: camera-relative azimuth / elevation in degrees (0 = straight ahead = backlight, +90 = screen
 *  right, 180 = behind the lens), or `abs` = a fixed world direction TOWARD the light */
export type SunDef = { az?: number; el?: number; abs?: V3 };
/** one shot: frames a <= f < b (ids run 1, 2, 3 ... in order), where it plays and under which light */
export type ShotDef = { id: number; a: number; b: number; place: string; light: Light; sun?: SunDef };
/** what engine/videos/<id>/shots.json holds (the contract with the sound) */
export type ShotsJson = {
  fps?: number; total_frames: number; flash_at?: number | number[];
  shots: { id: number; a: number; b: number; place: string; light?: string }[];
  xfade?: Record<string, number>;
  events?: { f: number; to?: number; type: string; note?: string; id?: string }[];
};
const LIGHTS_OK = ["day", "golden", "night", "space", "shaft"];
/** shots.json -> the timeline pieces of a Story. Light names that are not presets map by their first word
 *  ("shaft_hot" -> "shaft"); unknown ones fall back to "day". */
export const readShots = (plan: ShotsJson, sun: Record<number, SunDef> = {}) => {
  const shots: ShotDef[] = plan.shots.map((s) => {
    const l = (s.light ?? "day").split("_")[0];
    return { id: s.id, a: s.a, b: s.b, place: s.place, light: (LIGHTS_OK.includes(l) ? l : "day") as Light, sun: sun[s.id] };
  });
  const xfade: Record<number, number> = {};
  for (const [k, v] of Object.entries(plan.xfade ?? {})) xfade[Number(k)] = v;
  const flash = plan.flash_at === undefined ? [] : Array.isArray(plan.flash_at) ? plan.flash_at : [plan.flash_at];
  /** frame of an event of shots.json: by its own name, at("flip1") for {"f": 495, "type": "whoosh", "id": "flip1"}
   *  (safe when events are added or removed later), or the n-th (0-based) event of a type, at("splat"), at("ding", 1) */
  const at = (type: string, n = 0) => {
    const ev = plan.events ?? [];
    const e = ev.find((x) => x.id === type) ?? ev.filter((x) => x.type === type)[n];
    if (!e) throw new Error(`shots.json has no event "${type}" #${n}`);
    return e.f;
  };
  return { total: plan.total_frames, shots, xfade, flash, at };
};
export const shotAt = (shots: ShotDef[], f: number) => shots.find((s) => f >= s.a && f < s.b) ?? shots[shots.length - 1];
/** layers to draw at frame f: base shot, plus the next shot fading in during a crossfade */
export const layersAt = (shots: ShotDef[], xfade: Record<number, number>, f: number): { id: number; alpha: number }[] => {
  for (const s of shots) {
    const x = xfade[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(shots, f).id, alpha: 1 }];
};

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Framing = Partial<Cam> & { pos: V3; look: V3 };
/** a camera key: from frame f the framing s(f) applies; without `cut` the lens glides to it over `dur` frames */
export type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Framing };
/** reference camera ease: symmetric smootherstep (attack = release, ~10 f each on a 23 f move) */
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Framing): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
/** push-in factor since f0: the subject grows ~rate per frame; `punch` raises it (with 8 f soft edges) for n frames from p0 */
export const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35, p0 = f0) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) { const y = Math.max(0, f - p0); for (let i = 0; i < Math.min(y, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8)); }
  return Math.exp(-s);
};
/** dolly push: the camera slides toward the look point by factor k (k = pushK(...)) */
export const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Framing =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
/** zoom push (camera stays put, for a lens next to a wall): tan(fov/2) shrinks by k */
export const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Framing =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/** The camera of a story. cams[shot id] = that shot's keys (two shots may share one list for an invisible shot
 *  change). kicks = [frame, strength] impact shakes: the image offset flips sign every frame (~3 px at 720p per unit of
 *  strength) and decays to 0 in 7 f. */
export const camRig = (cams: Record<number, Key[]>, kicks: [number, number][] = []) => {
  const kickAt = (f: number) => {
    let a = 0;
    for (const [f0, g] of kicks) { const n = f - f0; if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5; }
    return a;
  };
  const camAt = (id: number, f: number): Cam => {
    const keys = cams[id];
    if (!keys) throw new Error(`no camera keys for shot ${id}`);
    const c = run(keys, f), a = kickAt(f);
    if (!a) return c;
    const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
    const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
    const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a; // metres at the look distance for 3 px x a
    return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
  };
  return { camAt, kickAt };
};

// ---------------- lens: depth of field ----------------
/** cInf = blur-disc radius in px at 1080x1920 for things at infinity; 0 = all sharp (close-ups 12-14, medium shots
 *  8-12, wides 0). Entries switch on cuts (no dur) or ramp with the camera glide they share f / dur with.
 *  focus = world point (else the camera look point). */
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const dofTable = (table: Dof[]) => (f: number) => {
  let i = 0; while (i + 1 < table.length && f >= table[i + 1].f) i++;
  const d = table[i], p = table[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
/** focus helper: a fixed point (plus dy) */
export const focusOn = (p: V3, dy = 0) => (): V3 => [p[0], p[1] + dy, p[2]];
