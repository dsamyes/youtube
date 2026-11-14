// TEMPLATE story file: copy the three files of this folder to src/videos/<id>/, point the import below at
// engine/videos/<id>/shots.json and rewrite. Manual: src/toon/kit/README.md. Worked example of a full film:
// src/videos/hole-through-earth/.
// This file holds the numbers over time: when things happen (from shots.json), the options of each place, the
// cameras and the depth of field. staging.ts draws the cast; entry.tsx registers the film.
// Everything must be a pure function of the frame number (no Math.random, no state).
import { V3, Key, SunDef, readShots, camRig, pushK, dolly, dofTable, focusOn, lin, TownParams, EarthParams } from "../../toon/kit";
import plan from "../../../../videos/_template/shots.json";

// ---------------- shots: boundaries, places, lights, crossfades and flashes come from shots.json ----------------
/** key light where the default is not wanted: the sun over the lens's right shoulder for a front-lit character shot */
const SUN: Record<number, SunDef> = { 1: { az: 110 } };
export const T = readShots(plan, SUN);
/** action frames by event type (the sound uses the same file) */
export const POINT = T.at("pop"), ARROW = T.at("arrow_pop"), DING = T.at("ding");

// ---------------- where things are ----------------
export const GUS_AT: V3 = [-0.85, 0, -0.55];                                  // beside the hole (the hole is at the origin)
/** shot 2: tiny Gus in the tunnel, -1 = the garden on top .. +1 = the far side */
export const fallS = (f: number) => lin([[60, -0.75], [105, 0.1]], f);

// ---------------- options of each shot's place for this frame ----------------
export const placeAt = (id: number, _f: number): TownParams | EarthParams | undefined => {
  if (id === 2) return { tunnel: 1, pipe: 1 };                               // earth: tunnel dug right through
  return { shovel: "planted", washing: true };                                // garden: hole, mound and shovel as built
};

// ---------------- cameras: one list of keys per shot ----------------
// dolly(pos, look, pushK(f, firstFrame, rate)) = a hold that creeps in; a second key with `dur` glides to a new framing.
const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: (f) => dolly([0.2, 1.45, 2.75], [-0.74, 1.14, -0.5], pushK(f, 0, 0.002), { fov: 38 }) }],              // medium shot of Gus
  2: [{ f: 60, s: (f) => dolly([0.4, 0.5, 34.2], [0.2, -0.1, 0], pushK(f, 60, 0.001), { fov: 31, roll: -0.02 }) }],     // the globe fills the width
  3: [
    { f: 105, s: (f) => dolly([1.0, 2.15, 5.5], [-0.42, 0.74, -0.55], pushK(f, 105, 0.001), { fov: 42 }) },             // wide: hole in front, Gus, the mound
    { f: 116, dur: 20, s: (f) => dolly([0.7, 1.9, 4.6], [-0.6, 0.95, -0.55], pushK(f, 126, 0.002), { fov: 42 }) },      // glides closer, centred on the ding
  ],
};
/** impact kicks: [frame, strength] */
export const { camAt } = camRig(CAMS, [[DING, 0.4]]);

// ---------------- depth of field: blur radius at infinity per stretch (0 = all sharp) ----------------
export const dofAt = dofTable([
  { f: 0, cInf: 12, focus: focusOn(GUS_AT, 1.4) },   // medium shot: background melts
  { f: 60, cInf: 0 },                                 // Earth: sharp
  { f: 105, cInf: 0 },                                // wide: sharp
]);
