// The cartoon Earth cutaway floating in space: the back half of the globe (painted oceans and land, lit by the sun)
// and the cut face turned a little away from the lens, so a crescent of the surface shows beside it. The face is four
// stepped discs (thin crust, mantle, outer core, inner core): the steps give the world ink its lines between layers.
// A dark channel runs straight through the centre (the tunnel), a tiny house and tree mark the garden on top.
// Local frame: globe centre at the origin, face normal +z, tunnel along the y axis (garden at +y).
import * as THREE from "three";
import { lam, V } from "./build";
import { earthSurface, earthCut, glowTex } from "./paint2";
import { NOINK } from "./ink";
import { EARTH_R, EARTH_YAW, EARTH_ROLL, LAYERS } from "./story";

const STEP = 0.11; // how far each inner layer stands proud of the one around it (m)
const TUNNEL_W = 0.64;

export class Earth {
  group = new THREE.Group();
  private globe = new THREE.Group();
  private tunnel: THREE.Mesh;
  private pipe = new THREE.Group();
  private core!: THREE.MeshBasicMaterial;

  constructor() {
    const G = this.globe, R = EARTH_R;
    G.rotation.set(0, EARTH_YAW, EARTH_ROLL, "ZYX");
    this.group.add(G);
    // back half of the globe (z <= 0), two-tone lit
    const shell = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 40, Math.PI, Math.PI), lam("earthSurface", () => ({ map: earthSurface() })));
    shell.receiveShadow = false;
    G.add(shell);
    // the cut face: one painted disc texture shared by all rings (uv from the position)
    const cut = earthCut(LAYERS.crust, LAYERS.mantle, LAYERS.outer);
    const faceUV = (g: THREE.BufferGeometry) => {
      const p = g.attributes.position as THREE.BufferAttribute, uv = g.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) uv.setXY(i, 0.5 + (0.5 * p.getX(i)) / R, 0.5 + (0.5 * p.getY(i)) / R);
      return g;
    };
    const flat = (k: number) => new THREE.MeshBasicMaterial({ map: cut, color: new THREE.Color(k, k, k) });
    const wallCol = ["#3f2a1c", "#a8321a", "#e08a1e"];
    const radii = [1, LAYERS.crust, LAYERS.mantle, LAYERS.outer];
    radii.forEach((r1, i) => {
      const z = i * STEP, r0 = i < 3 ? radii[i + 1] : 0;
      const g = i < 3 ? faceUV(new THREE.RingGeometry(r0 * R, r1 * R, 96, 1)) : faceUV(new THREE.CircleGeometry(r1 * R, 64));
      const mat = flat(i === 3 ? 1.75 : i === 2 ? 1.2 : 1); // the inner core is HDR: it blooms
      if (i === 3) this.core = mat;
      const m = new THREE.Mesh(g, mat); m.position.z = z; G.add(m);
      if (i > 0) { // the little cliff down to the layer around it
        const w = new THREE.Mesh(new THREE.CylinderGeometry(r1 * R, r1 * R, STEP, 96, 1, true).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: wallCol[i - 1] }));
        w.position.z = z - STEP / 2; G.add(w);
      }
    });
    // the tunnel: a dark channel standing just proud of the inner core, garden end at +y (grows in shot 3)
    this.tunnel = new THREE.Mesh(new THREE.BoxGeometry(TUNNEL_W, 2 * R, 0.08).translate(0, -R, 0), new THREE.MeshBasicMaterial({ color: "#1b1420" }));
    this.tunnel.position.set(0, R, 3 * STEP + 0.05);
    G.add(this.tunnel);
    // the far mouth of the tunnel: the tiny rim of the ocean pipe of shots 16-18, sticking out of the sea at the bottom
    const steel = lam("miniPipe", () => ({ color: "#9aa6b2" })), rimM = lam("pipeRim", () => ({ color: "#a4aeb9" }));
    this.pipe.add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.42, 0.62, 20).translate(0, -0.31, 0), steel));
    this.pipe.add(new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.14, 20).translate(0, -0.6, 0), rimM));
    this.pipe.add(new THREE.Mesh(new THREE.CircleGeometry(0.33, 18).rotateX(Math.PI / 2).translate(0, -0.675, 0), new THREE.MeshBasicMaterial({ color: "#0b0d16" })));
    this.pipe.position.set(0, -R + 0.12, 0.14);
    G.add(this.pipe);
    // the garden on top: a tiny house and a tree standing on the surface beside the tunnel mouth
    const wall = lam("miniWall", () => ({ color: "#ecdab2" })), roof = lam("miniRoof", () => ({ color: "#d27a62" })), leaf = lam("miniLeaf", () => ({ color: "#5aa83c" })), bark = lam("barkHD", () => ({ color: "#8f5d3b" }));
    const stand = (o: THREE.Object3D, ang: number, back = 0.45) => { // put an object on the surface at `ang` from the pole, up = radial
      const n = V(Math.sin(ang), Math.cos(ang), 0);
      o.position.copy(n.clone().multiplyScalar(R - 0.02)).add(V(0, 0, -back));
      o.quaternion.setFromUnitVectors(V(0, 1, 0), n); G.add(o);
    };
    const hs = new THREE.Group();
    hs.add(new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.44, 0.5).translate(0, 0.22, 0), wall));
    hs.add(new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.36, 4).rotateY(Math.PI / 4).scale(1, 1, 0.85).translate(0, 0.62, 0), roof));
    stand(hs, 0.13);
    const tr = new THREE.Group();
    tr.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.3, 8).translate(0, 0.15, 0), bark));
    tr.add(new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 10).translate(0, 0.5, 0), leaf));
    stand(tr, -0.11);
    const tr2 = tr.clone(); tr2.scale.setScalar(0.8); stand(tr2, 0.25, 0.3);
    // thin blue air glow behind the globe
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(0.35, 0.6, 1.4), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
    halo.scale.setScalar(R * 3.2); halo.position.set(0, 0, -R * 1.4); halo.layers.set(NOINK); halo.renderOrder = -0.4;
    this.group.add(halo);
    G.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = false; m.receiveShadow = false; } });
  }

  /** k = how far the tunnel has been dug (0..1 from the garden end), pulse = core glow gain, pipe = 0..1 the far
   *  rim popping out of the sea */
  pose(k: number, pulse = 1, pipe = 1) {
    this.pipe.visible = pipe > 0.01; this.pipe.scale.set(1, Math.max(0.01, pipe), 1);
    this.tunnel.scale.y = Math.max(0.0001, k);
    this.tunnel.visible = k > 0.001;
    this.core.color.setScalar(1.75 * pulse);
  }
}
