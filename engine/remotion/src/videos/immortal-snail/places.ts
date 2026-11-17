// This video's own place. "beach": yellow sand to a blue sea under the kit's sky. Two planes and a strip of foam;
// the palm tree, the suitcase and everything else are cards (staging.ts).
import * as THREE from "three";
import { build, NOINK, PlaceFactory } from "../../toon/kit";

const basic = (color: string) => new THREE.MeshBasicMaterial({ color, fog: false });

export const beach: PlaceFactory = () => {
  const G = new THREE.Group();
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2), build.lam("snail_sand", () => ({ color: "#f0d58a" })));
  sand.receiveShadow = true; G.add(sand);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(900, 500).rotateX(-Math.PI / 2).translate(0, 0.02, -264), basic("#2f9fd6")); sea.layers.set(NOINK); G.add(sea);
  const deep = new THREE.Mesh(new THREE.PlaneGeometry(900, 440).rotateX(-Math.PI / 2).translate(0, 0.03, -300), basic("#2380c4")); deep.layers.set(NOINK); G.add(deep);
  const foam = new THREE.Mesh(new THREE.PlaneGeometry(900, 0.5).rotateX(-Math.PI / 2).translate(0, 0.04, -14), basic("#f4fbff")); foam.layers.set(NOINK); G.add(foam);
  return { group: G, sky: true, shadows: true, pose(c) { foam.position.z = 0.25 * Math.sin(c.f * 0.06); } };
};
