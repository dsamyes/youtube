// The cartoon-short kit: everything a video's story files import. See README.md (the producer's manual).
export * from "./story";
export * from "./cast";
export * from "./effects";
export { makeShort } from "./Short";
export type { Story } from "./world";
export { PLACE_NAMES } from "./world";
export type { PlaceObj, PlaceCtx, PlaceLight, PlaceFactory } from "./places/place";
// cast: the puppet, its looks, hand props, small drawings
export { figure, anchorsOf, GUS, WIFE, NEIGHBOR, FISHER, PROPS, miniGus, limbOf } from "./people";
export type { Look, Pose, Arm, Hand, PropName, Anchors, G } from "./people";
export * as draw from "./people";
export * as toon from "./toon";
export { Pen, INK, SKIN, WHITE } from "./toon";
export type { Expr, P2 } from "./toon";
// places: landmarks and options
export { HOLE_R, MOUND, FENCE_N, FENCE_H, NEIGH, GRILL, PARK, SHOVEL_PLANTED } from "./places/town";
export type { TownParams } from "./places/town";
export { SHAFT_R } from "./places/shaft";
export type { ShaftParams } from "./places/shaft";
export { EARTH_R, EARTH_YAW, EARTH_ROLL, LAYERS, earthPoint } from "./places/earth";
export type { EarthParams } from "./places/earth";
export { PIPE_H, PIPE_R, BOAT, FISHER as FISHER_SEAT } from "./places/ocean";
export type { OceanParams } from "./places/ocean";
// for a video's own places and props (3D building blocks, painted textures, shading)
export * as build from "./build";
export * as paint from "./paint";
export * as paint2 from "./paint2";
export { twoTone } from "./shade";
export { NOINK } from "./ink";
export type { LightName } from "./lights";
