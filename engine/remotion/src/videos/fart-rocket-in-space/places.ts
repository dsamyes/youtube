// This video's places. "space" and "board" are the same empty place: nothing but the kit's sky (black with stars
// under the "space" light); the ship, the Earth and the diagrams are flat cards drawn by staging.ts.
// "street" is the open sky of plane-door-midflight with its ground switched on (tarmac, a yellow line, grass).
import * as THREE from "three";
import { PlaceFactory } from "../../toon/kit";
export { sky as street } from "../plane-door-midflight/places";

export const space: PlaceFactory = () => ({ group: new THREE.Group(), sky: true, shadows: false, pose() {} });
