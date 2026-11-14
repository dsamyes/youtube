// Reference sheet: frame n shows entry n of ITEMS (a face, or a hand prop held up). scripts/toon-faces.py renders
// one still per entry and labels them. Keep the list in step with the names printed there.
import { Ctx, put, GUS, WIFE, NEIGHBOR, FISHER, HANG, Arm } from "../../toon/kit";
import { GUS_AT } from "./story";

export const FACES = ["neutral", "stern", "smile", "smile_closed", "grin", "laugh", "relief", "relief_open", "wow", "shock", "jawdrop",
  "nervous", "sad", "pained", "dazed", "asleep", "whistle", "lick", "bite", "chew", "flap"] as const;
export const PROPS: [string, number][] = [["clipboard", 0], ["thermo", 0.5], ["thermo", 2], ["pan", 0], ["fork", 0], ["fork", 1], ["fork", 2],
  ["plate", 0], ["plate", 1], ["timer", 90]];
export const CAST = [WIFE, NEIGHBOR, FISHER];

export const stage = (c: Ctx) => {
  const n = c.f;
  if (n < FACES.length) {
    put(c, GUS, { expr: FACES[n] as never, L: HANG, R: HANG }, GUS_AT);
  } else if (n < FACES.length + PROPS.length) {
    const [prop, arg] = PROPS[n - FACES.length];
    const up: Arm = { h: [0.52, -0.18], front: true, prop: prop as never, arg };
    put(c, GUS, { expr: "smile", L: up, R: HANG }, GUS_AT, { wide: true });
  } else if (n < FACES.length + PROPS.length + 1) {
    put(c, GUS, { expr: "smile", acc: 1, L: HANG, R: HANG }, GUS_AT, { tall: true });          // helmet tipped back
  } else {
    const who = CAST[Math.min(CAST.length - 1, n - FACES.length - PROPS.length - 1)];
    put(c, who, { expr: "smile", L: HANG, R: HANG }, GUS_AT);
  }
};
