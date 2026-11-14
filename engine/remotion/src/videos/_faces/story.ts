// Reference sheet of the kit's faces and hand props: one fixed medium close-up, no motion (every frame is a still).
import { V3, Key, readShots, camRig, dolly, dofTable, focusOn, TownParams } from "../../toon/kit";
import plan from "../../../../videos/_faces/shots.json";

export const T = readShots(plan, { 1: { az: 110 } });
export const GUS_AT: V3 = [-0.85, 0, -0.55];
export const placeAt = (_id: number, _f: number): TownParams => ({ hole: false, mound: false, shovel: "none", washing: false, grill: false });
const CAMS: Record<number, Key[]> = { 1: [{ f: 0, s: () => dolly([-0.55, 1.42, 1.75], [-0.83, 1.28, -0.5], 0, { fov: 38 }) }] };
export const { camAt } = camRig(CAMS, []);
export const dofAt = dofTable([{ f: 0, cInf: 12, focus: focusOn(GUS_AT, 1.4) }]);
