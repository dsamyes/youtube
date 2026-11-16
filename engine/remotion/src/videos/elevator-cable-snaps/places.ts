// This video's own place: a lift car in its shaft, built from boxes with the kit's two-tone materials (so it takes
// the ink lines). The car stands still at the origin and the shaft's floors (bands, numbered landing doors, rail
// brackets) move up past it by `scroll`. The car's front (the door side, +z) is open: the lens looks in from there.
// One build serves two place names: "lift" (the lens close, inside) and "hoistway" (the lens outside, further back).
import * as THREE from "three";
import { build, paint, NOINK, PlaceFactory, PlaceCtx } from "../../toon/kit";
import { CAR_X, CAR_Z0, CAR_Z1, CAR_H, ROPE_Z, ROPE_Y, ROPE_X, RAIL_X, STOREY, LiftParams } from "./story";

const V = build.V;
const M = (k: string, color: string) => build.lam("el_" + k, () => ({ color }));
const basic = (color: string) => new THREE.MeshBasicMaterial({ color, fog: false });

/** amber digits on a black display; n < 0: two dashes; arrow = a small down arrow beside the number */
const digitsTex = (n: number, arrow: boolean, col = "#ffb02e") => paint.ctex(`elDigits${n}${arrow ? "a" : ""}${col}`, 256, 128, (g) => {
  g.fillStyle = "#14161c"; g.fillRect(0, 0, 256, 128);
  if (n === -2) return;
  g.fillStyle = col; g.font = `900 92px "Arial Black", Arial, Helvetica, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  if (n < 0) { g.fillRect(58, 54, 56, 20); g.fillRect(142, 54, 56, 20); return; }
  g.fillText(String(n), arrow ? 104 : 128, 70);
  if (arrow) { g.beginPath(); g.moveTo(196, 40); g.lineTo(240, 40); g.lineTo(218, 92); g.closePath(); g.fill(); }
});
/** the plate over a landing door: white number on dark blue */
const plateTex = (n: number) => paint.ctex(`elPlate${n}`, 160, 96, (g) => {
  g.fillStyle = "#24365e"; g.fillRect(0, 0, 160, 96);
  if (n < 1) return;
  g.fillStyle = "#ffffff"; g.font = `900 72px "Arial Black", Arial, Helvetica, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(n), 80, 52);
});
const buttonsTex = () => paint.ctex("elButtons", 96, 320, (g) => {
  g.fillStyle = "#aeb6c4"; g.fillRect(0, 0, 96, 320);
  for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) {
    g.beginPath(); g.arc(28 + c * 40, 36 + r * 50, 14, 0, Math.PI * 2); g.fillStyle = r === 0 && c === 1 ? "#ffb02e" : "#f4f6fa"; g.fill(); g.lineWidth = 4; g.strokeStyle = "#3a4152"; g.stroke();
  }
});

export const lift: PlaceFactory = () => {
  const G = new THREE.Group();
  const box = (a: THREE.Vector3, b: THREE.Vector3, mat: THREE.Material, parent: THREE.Object3D = G) => { const m = new THREE.Mesh(build.boxGeo(a, b, 0, true), mat); parent.add(m); return m; };
  const shaftM = M("shaft", "#59618a"), shaftD = M("shaftD", "#474e72"), band = M("band", "#8088ad"), doorM = M("ldoor", "#7f8bb0"), doorF = M("ldoorF", "#636d92");
  const steel = M("steel", "#c3cad6"), frame = M("frame", "#5d6678"), shell = M("shell", "#e9e3d2"), wood = M("wood", "#e2a35c"), woodD = M("woodD", "#b9763a");
  const carpet = M("carpet", "#b8433c"), ceil = M("ceil", "#f3efe2"), rope = M("rope", "#f4f1e4"), orange = M("wedge", "#ff8a1f"), dark = M("dark", "#2a2e3a");

  // ---- the shaft: walls (static), rails (static) ----
  box(V(-2.4, -90, -2.4), V(2.4, 90, -2.1), shaftM);
  box(V(-2.4, -90, -2.1), V(-2.05, 90, 3.0), shaftD);
  box(V(2.05, -90, -2.1), V(2.4, 90, 3.0), shaftD);
  for (const s of [-1, 1]) {
    box(V(s * RAIL_X - 0.05, -90, ROPE_Z - 0.09), V(s * RAIL_X + 0.05, 90, ROPE_Z + 0.09), steel);
    box(V(Math.min(s * RAIL_X, s * 2.05), -90, ROPE_Z - 0.03), V(Math.max(s * RAIL_X, s * 2.05), 90, ROPE_Z + 0.03), frame).layers.set(NOINK);
  }
  // ---- the floors: bands, landing doors with number plates, rail brackets; they move up as the car falls ----
  const floors = new THREE.Group(); G.add(floors);
  const SLOTS = [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5], plates: THREE.MeshBasicMaterial[] = [];
  for (const i of SLOTS) {
    const y = i * STOREY;
    box(V(-2.05, y - 0.28, -2.1), V(2.05, y, -1.92), band, floors);
    for (const s of [-1, 1]) box(V(Math.min(s * 1.92, s * 2.05), y - 0.28, -2.1), V(Math.max(s * 1.92, s * 2.05), y, 3.0), band, floors);
    box(V(-0.8, y, -2.1), V(0.8, y + 2.2, -2.04), doorF, floors);
    box(V(-0.7, y + 0.02, -2.1), V(-0.01, y + 2.1, -2.0), doorM, floors);
    box(V(0.01, y + 0.02, -2.1), V(0.7, y + 2.1, -2.0), doorM, floors);
    const pm = new THREE.MeshBasicMaterial({ map: plateTex(20 + i), fog: false }); plates.push(pm);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.36), pm); pl.position.set(0, y + 2.5, -2.03); floors.add(pl);
    box(V(-0.34, y + 2.29, -2.1), V(0.34, y + 2.71, -2.045), frame, floors);
    for (const s of [-1, 1]) box(V(Math.min(s * (RAIL_X - 0.12), s * 2.05), y + 1.4, ROPE_Z - 0.14), V(Math.max(s * (RAIL_X - 0.12), s * 2.05), y + 1.55, ROPE_Z + 0.14), frame, floors);
  }

  // ---- the car ----
  const car = new THREE.Group(); G.add(car);
  const X = CAR_X, t = 0.07;
  box(V(-X - t, -0.24, CAR_Z0 - t), V(X + t, -0.02, CAR_Z1), frame, car);                 // platform
  box(V(-X, -0.02, CAR_Z0), V(X, 0, CAR_Z1), carpet, car);
  box(V(-X - t, 0, CAR_Z0 - t), V(X + t, CAR_H, CAR_Z0), wood, car);                      // back wall
  box(V(-X, 0, CAR_Z0), V(X, 0.9, CAR_Z0 + 0.025), woodD, car);                           // dado
  box(V(-X + 0.12, 0.96, CAR_Z0), V(X - 0.12, 1.03, CAR_Z0 + 0.09), steel, car);          // handrail
  for (const s of [-1, 1]) {
    box(V(Math.min(s * X, s * (X + t)), 0, CAR_Z0), V(Math.max(s * X, s * (X + t)), CAR_H, CAR_Z1), shell, car);   // side walls
    box(V(Math.min(s * (X - 0.14), s * (X + t)), 0, CAR_Z1 - 0.06), V(Math.max(s * (X - 0.14), s * (X + t)), CAR_H, CAR_Z1), steel, car);   // door jambs
    box(V(Math.min(s * (X + t), s * (RAIL_X - 0.06)), CAR_H + 0.02, ROPE_Z - 0.13), V(Math.max(s * (X + t), s * (RAIL_X - 0.06)), CAR_H + 0.26, ROPE_Z + 0.13), frame, car);   // guide shoes, top
    box(V(Math.min(s * (X + t), s * (RAIL_X - 0.06)), -0.3, ROPE_Z - 0.13), V(Math.max(s * (X + t), s * (RAIL_X - 0.06)), -0.06, ROPE_Z + 0.13), frame, car);
  }
  box(V(-X - t, CAR_H, CAR_Z0 - t), V(X + t, CAR_H + 0.1, CAR_Z1), ceil, car);            // roof
  box(V(-X - t, CAR_H - 0.2, CAR_Z1 - 0.06), V(X + t, CAR_H + 0.1, CAR_Z1), steel, car);  // lintel
  const lamp = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.9).rotateX(Math.PI / 2), basic("#fffbe6")); lamp.position.set(0, CAR_H - 0.004, -0.7); lamp.layers.set(NOINK); car.add(lamp);
  box(V(-X - 0.3, CAR_H + 0.1, ROPE_Z - 0.12), V(X + 0.3, CAR_H + 0.3, ROPE_Z + 0.12), frame, car);   // crosshead
  box(V(-0.42, CAR_H + 0.3, ROPE_Z - 0.09), V(0.42, ROPE_Y, ROPE_Z + 0.09), steel, car);  // rope hitch
  // indicator and buttons on the back wall
  box(V(-0.33, 1.98, CAR_Z0), V(0.33, 2.3, CAR_Z0 + 0.05), dark, car);
  const indM = new THREE.MeshBasicMaterial({ map: digitsTex(20, true), fog: false });
  const ind = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.26), indM); ind.position.set(0, 2.14, CAR_Z0 + 0.054); ind.layers.set(NOINK); car.add(ind);
  box(V(0.7, 1.02, CAR_Z0), V(0.96, 1.78, CAR_Z0 + 0.035), frame, car);
  const btn = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.68), new THREE.MeshBasicMaterial({ map: buttonsTex(), fog: false })); btn.position.set(0.83, 1.4, CAR_Z0 + 0.04); btn.layers.set(NOINK); car.add(btn);
  // the safety plank under the car, and the two orange wedge blocks at the rails
  box(V(-RAIL_X + 0.25, -0.46, ROPE_Z - 0.11), V(RAIL_X - 0.25, -0.24, ROPE_Z + 0.11), frame, car);
  const wedges: THREE.Mesh[] = [];
  for (const s of [-1, 1]) {
    box(V(Math.min(s * (RAIL_X - 0.33), s * (RAIL_X - 0.08)), -0.72, ROPE_Z - 0.2), V(Math.max(s * (RAIL_X - 0.33), s * (RAIL_X - 0.08)), -0.2, ROPE_Z + 0.2), orange, car);
    box(V(Math.min(s * (RAIL_X + 0.08), s * (RAIL_X + 0.3)), -0.72, ROPE_Z - 0.2), V(Math.max(s * (RAIL_X + 0.08), s * (RAIL_X + 0.3)), -0.2, ROPE_Z + 0.2), orange, car);
    wedges.push(box(V(s * RAIL_X - 0.3, -0.78, ROPE_Z + 0.1), V(s * RAIL_X + 0.3, -0.72, ROPE_Z + 0.2), frame, car));
  }
  // ---- six ropes: the long run (hung from a pivot high up, so it can swing slack) and the stub left on the hitch ----
  const TOP = 40, ropes: { pivot: THREE.Group; long: THREE.Mesh; stub: THREE.Group }[] = [];
  for (let i = 0; i < 6; i++) {
    const pivot = new THREE.Group(); pivot.position.set(ROPE_X(i), TOP, ROPE_Z); car.add(pivot);
    const long = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 60, 8).translate(0, -(TOP - ROPE_Y) + 30, 0), rope);
    pivot.add(long);
    const stub = new THREE.Group(); stub.position.set(ROPE_X(i), ROPE_Y, ROPE_Z); car.add(stub);
    stub.add(new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.04, 0.42, 8).translate(0, 0.21, 0), rope));
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.14, 7).rotateX(Math.PI).translate(0, 0.47, 0), rope); stub.add(tuft);
    ropes.push({ pivot, long, stub });
  }

  return {
    group: G, sky: false, shadows: false,
    pose(c: PlaceCtx) {
      const q = c.params as LiftParams, f = c.f;
      const sc = q.scroll ?? 0, k = Math.floor(sc / STOREY);
      floors.position.y = sc - k * STOREY;
      plates.forEach((pm, j) => { const tx = plateTex(20 + SLOTS[j] - k); if (pm.map !== tx) { pm.map = tx; pm.needsUpdate = true; } });
      car.position.y = -(q.sag ?? 0);
      const fl = q.floor ?? 20, glow = q.glow ?? 0;
      const tx = digitsTex(fl, fl > 0, glow > 0.5 ? "#fff3b0" : "#ffb02e");
      if (indM.map !== tx) { indM.map = tx; indM.needsUpdate = true; }
      const sh = q.shiver ?? 0, sl = q.slack ?? 0;
      ropes.forEach((r, i) => {
        const age = q.snap ? q.snap[i] : -1, gone = age >= 0;
        r.stub.visible = gone;
        if (gone) r.stub.rotation.z = (i % 2 ? 1 : -1) * (0.35 + 0.1 * i) * (1 + 0.5 * Math.exp(-age / 9) * Math.cos(age * 0.9)) * Math.min(1, (age + 1) / 3);
        r.long.visible = !gone || age < 26;
        r.long.position.y = gone ? 0.25 + age * 1.5 + age * age * 0.05 : i === 2 ? 0 : 0.55 * sl;
        r.pivot.rotation.z = gone ? 0.004 * Math.sin(age * 1.3 + i) * Math.min(age, 6) : sh * 0.0009 * Math.sin(f * 2.3 + i * 1.7) + (i === 2 ? 0 : sl * 0.0045 * (i - 2) + sl * 0.0015 * Math.sin(f * 0.21 + i));
      });
      const w = q.wedge ?? 0;
      wedges.forEach((m) => { m.position.y = 0.1 * w; });
    },
  };
};
