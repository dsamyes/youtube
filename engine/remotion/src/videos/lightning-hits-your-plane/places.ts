// This video's places. "cabin" is the airliner cabin of plane-door-midflight (imported, not edited) flown at night:
// a dark pane sits in front of every window and flares white when lightning is near (`flare` 0..1 from story.ts).
// "sky" is that episode's open sky, used here under the night light as the board for the plane and the diagrams.
import * as THREE from "three";
import { NOINK, PlaceFactory, PlaceCtx } from "../../toon/kit";
import { cabin as dayCabin, sky } from "../plane-door-midflight/places";
import { WALL_Z, DOOR_X, ROW0, ROW_D, ROWS } from "../plane-door-midflight/story";
import { NightCabin } from "./story";

export { sky };

export const cabin: PlaceFactory = (kit, rays) => {
  const base = dayCabin(kit, rays);
  const mat = new THREE.MeshBasicMaterial({ color: "#17203c", fog: false });
  const pane = (w: number, h: number, x: number, y: number, z: number, back = false) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y, z); if (back) m.rotation.y = Math.PI;
    m.layers.set(NOINK); base.group.add(m);
  };
  for (let i = 0; i < ROWS; i++) {
    const x = ROW0 + i * ROW_D - 0.19;
    pane(0.26, 0.43, x, 1.305, WALL_Z + 0.034);
    pane(0.26, 0.43, x, 1.305, 1.9 - 0.034, true);
  }
  pane(0.26, 0.3, DOOR_X, 1.59, WALL_Z + 0.094);
  const dark = new THREE.Color("#17203c"), hot = new THREE.Color("#f4f8ff");
  return {
    group: base.group, sky: base.sky, shadows: base.shadows,
    pose(c: PlaceCtx) {
      const r = base.pose(c);
      mat.color.copy(dark).lerp(hot, Math.max(0, Math.min(1, (c.params as NightCabin).flare ?? 0)));
      return r;
    },
  };
};
