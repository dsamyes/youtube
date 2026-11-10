#!/usr/bin/env python3
"""Run The If Engine pipeline end to end for one video, stopping at the first failed stage.

  python pipeline/run_pipeline.py earth-stops-1s                     # everything except upload (dry run)
  python pipeline/run_pipeline.py earth-stops-1s --render full       # 1080p full length (slow)
  python pipeline/run_pipeline.py earth-stops-1s --from voice        # resume from a stage
  python pipeline/run_pipeline.py earth-stops-1s --upload private    # real upload at the end

Stage order: research -> calc -> script -> factcheck -> voice -> captions -> render -> thumbnail
             -> metadata -> shorts -> upload(dry-run unless --upload)
Every stage writes its status to videos/<id>/manifest.json; print it with --status.
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from lib import load_manifest, video_dir

HERE = Path(__file__).resolve().parent
PY = sys.executable


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video_id", nargs="?", default="earth-stops-1s")
    ap.add_argument("--from", dest="start", default="research")
    ap.add_argument("--to", dest="stop", default="upload", help="last stage to run (inclusive)")
    ap.add_argument("--render", choices=["low", "full", "preview", "low+preview", "none"], default="low+preview")
    ap.add_argument("--probe-urls", action="store_true", help="research: check source URLs are reachable")
    ap.add_argument("--tts", choices=["elevenlabs", "kokoro", "piper", "silent"], help="force a TTS provider")
    ap.add_argument("--upload", choices=["private", "unlisted", "public"], help="really upload (else dry run)")
    ap.add_argument("--publish-at")
    ap.add_argument("--confirm-reviewed", action="store_true")
    ap.add_argument("--status", action="store_true")
    a = ap.parse_args()
    vid = a.video_id
    vdir = video_dir(vid)
    if a.status:
        for k, v in load_manifest(vdir)["stages"].items():
            print(f"{k:10s} {v['status']:9s} {v.get('updated', '')}  {v.get('error') or v.get('note') or ''}")
        return

    renders = {"low": [["--mode", "low"]], "full": [["--mode", "full"]], "preview": [["--mode", "preview"]],
               "low+preview": [["--mode", "preview"], ["--mode", "low"]], "none": []}[a.render]
    up = ["--dry-run"] if not a.upload else ["--privacy", a.upload]
    if a.publish_at:
        up += ["--publish-at", a.publish_at]
    if a.confirm_reviewed:
        up.append("--confirm-reviewed")
    plan = [
        ("research", [["research.py", vid] + (["--probe"] if a.probe_urls else [])]),
        ("calc", [["calc.py", vid]]),
        ("script", [["build_script.py", vid]]),
        ("factcheck", [["factcheck.py", vid]]),
        ("voice", [["tts.py", vid] + (["--provider", a.tts] if a.tts else [])]),
        ("captions", [["captions.py", vid]]),
        ("render", [["render.py", vid, *r] for r in renders] + ([["render.py", vid, "--stills"]] if renders else [])),
        ("thumbnail", [["thumbnail.py", vid]]),
        ("metadata", [["metadata.py", vid]]),
        ("shorts", [["shorts.py", vid]] if a.render != "none" else []),
        ("upload", [["upload.py", vid, *up]]),
    ]
    names = [p[0] for p in plan]
    if a.start not in names:
        sys.exit(f"--from must be one of {names}")
    if a.stop not in names:
        sys.exit(f"--to must be one of {names}")
    for name, cmds in plan[names.index(a.start):names.index(a.stop) + 1]:
        for cmd in cmds:
            print(f"\n=== {name}: {' '.join(cmd)}", flush=True)
            r = subprocess.run([PY, "-B", str(HERE / cmd[0]), *cmd[1:]], cwd=HERE)
            if r.returncode:
                print(f"\n*** pipeline stopped at stage '{name}' (see videos/{vid}/manifest.json)")
                sys.exit(r.returncode)
    print("\nPipeline finished. Stage status:")
    for k, v in load_manifest(vdir)["stages"].items():
        print(f"  {k:10s} {v['status']}")


if __name__ == "__main__":
    main()
