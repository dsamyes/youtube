// This video's own place, "deep": under water in the pool. A tiled wall that scrolls with the depth and darkens, the
// tiled floor at a hundred feet, both unlit (the colours are the picture). Ball, barbell, marks and bubbles are cards.
import * as THREE from "three";
import { paint, PlaceFactory, PlaceCtx } from "../../toon/kit";
import { DeepParams, WALL_Z, FT_M, floorY, darkAt } from "./story";

const TILE = 0.36;                                              // metres per tile; the texture holds 4 x 4
const tiles = () => paint.ctex("plTiles", 512, 512, (g, r) => {
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const v = 0.9 + 0.1 * r(); g.fillStyle = `rgb(${Math.round(70 * v)},${Math.round(165 * v)},${Math.round(236 * v)})`; g.fillRect(i * 128, j * 128, 128, 128); g.fillStyle = "rgba(255,255,255,0.14)"; g.fillRect(i * 128 + 10, j * 128 + 10, 108, 16); }
  g.strokeStyle = "#1c4f9c"; g.lineWidth = 8; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, 512); g.moveTo(0, i * 128); g.lineTo(512, i * 128); g.stroke(); }
});
export const deep: PlaceFactory = () => {
  const G = new THREE.Group(), W = 60, n = W / (4 * TILE);
  const wt = tiles().clone(); wt.repeat.set(n, n); wt.needsUpdate = true;
  const ft = tiles().clone(); ft.repeat.set(n, n); ft.needsUpdate = true;
  const wm = new THREE.MeshBasicMaterial({ map: wt, fog: false }), fm = new THREE.MeshBasicMaterial({ map: ft, fog: false });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(W, W), wm); wall.position.set(0, 0, WALL_Z); G.add(wall);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, W).rotateX(-Math.PI / 2), fm); G.add(floor);
  // the water in front of the lens side: a far backdrop so nothing but blue is ever behind the cards
  return {
    group: G, sky: false, shadows: false,
    pose(c: PlaceCtx) {
      const q = c.params as DeepParams, d = q.depth ?? 100, k = darkAt(d);
      wt.offset.y = -(d * FT_M) / (4 * TILE);
      wm.color.setRGB(1 - 0.9 * k, 1 - 0.8 * k, 1 - 0.5 * k);
      fm.color.setRGB((1 - 0.9 * k) * 1.5, (1 - 0.8 * k) * 1.35, (1 - 0.5 * k) * 1.2);
      floor.position.y = floorY(d); floor.visible = q.floor !== false;
    },
  };
};
