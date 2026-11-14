// What a place of the kit is to the world: a group of scenery posed once per frame from the story's parameters.
// The built-in places (town = garden + park, shaft, earth, ocean) implement it; a video can add its own
// (Story.places) by returning the same shape from a factory.
import * as THREE from "three";
import { ShotDef } from "../story";
import { WorldLook } from "../lights";
import { Kit, Ray } from "../build";

/** what a place gets every frame; params = whatever the story's place(id, f) returned for this shot */
export type PlaceCtx = { id: number; f: number; shot: ShotDef; cam: THREE.PerspectiveCamera; look: WorldLook; params: Record<string, unknown> };
/** optional light a place sets for itself (linear RGB): world two-tone lit / shade, card tint, card gain */
export type PlaceLight = { lit?: number[]; shade?: number[]; tint?: number[]; gain?: number };
export interface PlaceObj {
  group: THREE.Group;
  /** false = the sky dome is hidden while this place shows (an interior) */
  sky?: boolean;
  /** true = fit the sun's shadow map around the subject (outdoor sets with ground) */
  shadows?: boolean;
  pose(c: PlaceCtx): PlaceLight | void;
}
/** rays = the film's sight lines in this place (lens -> subject): leave scenery out of their way (build.ts setSight) */
export type PlaceFactory = (kit: Kit, rays: Ray[]) => PlaceObj;
