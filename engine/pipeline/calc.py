#!/usr/bin/env python3
"""Stage 2 - calc.

Runs the per-video calc module videos/<id>/calc_video.py (see calclib.py for its contract) on the
facts in research.json and writes calc.json:
  values: key -> {value, unit, display, derivation, facts}
          `display` is the exact string the script template inserts (single source of truth).
  cards:  Math Card overlays (title, formula, substitution, result, note, src).
  extra:  free-form data for scenes (data.extra in Remotion).
Any failed self-check aborts the stage. Generic sanity checks: every value cites >= 0 known facts,
displays are non-empty, numbers are finite, every card references existing displays.
"""
from __future__ import annotations

import importlib.util
import math
import sys

from calclib import Calc, CheckFailed
from lib import fail, log, read_json, set_stage, video_arg, video_dir, write_json, now

STAGE = "calc"


def load_module(vdir):
    p = vdir / "calc_video.py"
    if not p.exists():
        fail(vdir, STAGE, f"{p} missing - write the per-video calc module first")
    spec = importlib.util.spec_from_file_location(f"calc_video_{vdir.name.replace('-', '_')}", p)
    mod = importlib.util.module_from_spec(spec)
    sys.path.insert(0, str(p.parent.parent.parent / "pipeline"))
    spec.loader.exec_module(mod)
    return mod


def main() -> None:
    vid = video_arg()
    vdir = video_dir(vid)
    research = read_json(vdir / "research.json")
    mod = load_module(vdir)
    c = Calc(research)
    try:
        mod.compute(c)
    except CheckFailed as e:
        fail(vdir, STAGE, f"self-check failed: {e}", checks=c.checks)
    except Exception as e:  # noqa: BLE001
        fail(vdir, STAGE, f"calc module crashed: {type(e).__name__}: {e}")
    errs = []
    for k, v in c.values.items():
        if isinstance(v["value"], float) and not math.isfinite(v["value"]):
            errs.append(f"{k} not finite")
        if not str(v["display"]).strip():
            errs.append(f"{k} empty display")
    if len(c.checks) < 3:
        errs.append(f"only {len(c.checks)} self-checks; add sanity checks for the key numbers")
    if not c.cards:
        errs.append("no Math Cards defined")
    if errs:
        fail(vdir, STAGE, "; ".join(errs))
    data = {"generated": now(), "video_id": vid, "values": c.values, "cards": c.cards,
            "extra": c.extra, "checks": c.checks}
    write_json(vdir / "calc.json", data)
    set_stage(vdir, STAGE, "done", outputs=["calc.json"], values=len(c.values), cards=len(c.cards),
              self_checks=f"{sum(x['pass'] for x in c.checks)}/{len(c.checks)} passed")
    log(STAGE, f"OK: {len(c.values)} values, {len(c.cards)} math cards, {len(c.checks)} self-checks passed")


if __name__ == "__main__":
    main()
