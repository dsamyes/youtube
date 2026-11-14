#!/usr/bin/env python3
"""Frame-by-frame check of a rendered cartoon short (black / white / frozen frames and pops), before the sound exists.

usage: scripts/toon-qa.py <id> [--proxy | --video file]

Runs engine/toon/short_qa.py (the same check toon/finish.py runs on the finished film) on the silent picture:
out/<id>/video.mp4, or with --proxy the low-resolution pass out/<id>/proxy/video.mp4. The planned jumps (shot
changes, crossfades, flashes) come from engine/videos/<id>/shots.json. Report and 2 s contact sheets go to
out/<id>/qa/ (out/<id>/proxy/qa/ for the proxy); the report is printed, followed by the frames that come close to
a pop. Exit code 1 when it lists black frames, unplanned white frames, frozen spans or pops (on a proxy also near
pops, because a proxy reads a little low), so a pipeline step can stop on it.
"""
import json, os, re, subprocess, sys

import signal
if hasattr(signal, "SIGPIPE"): signal.signal(signal.SIGPIPE, signal.SIG_DFL)  # quiet exit when piped into head
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NEAR = r"""
import sys, json, numpy as np
d = np.load(sys.argv[1])["diff"]; meta = json.load(open(sys.argv[2])); lim = float(sys.argv[3])
planned = set()
for a, b in meta.get("xfade", []) + meta.get("planned", []): planned.update(range(a - 1, b + 1))
for s in meta["shots"]: planned.update((s["a"] - 1, s["a"]))
med = np.array([np.median(d[max(0, i - 8):i + 9]) for i in range(len(d))])
sc = d / (3 * med + 1.0)
print(json.dumps([[i + 1, round(float(sc[i]), 2)] for i in range(len(d)) if lim <= sc[i] <= 1.0 and (i + 1) not in planned]))
"""

def main():
    if len(sys.argv) < 2 or sys.argv[1].startswith("-"): print(__doc__); sys.exit(2)
    vid = sys.argv[1]
    plan = json.load(open(os.path.normpath(os.path.join(ROOT, "..", "videos", vid, "shots.json"))))
    proxy = "--proxy" in sys.argv
    base = os.path.join(ROOT, "out", vid, "proxy") if proxy else os.path.join(ROOT, "out", vid)
    video = sys.argv[sys.argv.index("--video") + 1] if "--video" in sys.argv else os.path.join(base, "video.mp4")
    if not os.path.exists(video): sys.exit("no %s" % video)
    qa = os.path.join(base, "qa"); os.makedirs(qa, exist_ok=True)
    fl = plan.get("flash_at", [])
    start = {s["id"]: s["a"] for s in plan["shots"]}
    meta = {"shots": [{"id": s["id"], "a": s["a"], "b": s["b"]} for s in plan["shots"]],
            "planned": [[f, f + 4] for f in ([fl] if isinstance(fl, int) else list(fl or []))],
            "xfade": [[start[int(k)] - v // 2, start[int(k)] + v // 2] for k, v in plan.get("xfade", {}).items()]}
    mp = os.path.join(qa, "shots_qa.json")
    json.dump(meta, open(mp, "w"))
    venv = os.path.normpath(os.path.join(ROOT, "..", ".venv", "bin", "python"))  # short_qa.py needs numpy and Pillow
    py = venv if os.path.exists(venv) else sys.executable
    r = subprocess.run([py, "-B", os.path.normpath(os.path.join(ROOT, "..", "toon", "short_qa.py")), video, qa, mp], capture_output=True, text=True)
    print(r.stdout, end="")
    if r.returncode: print(r.stderr[-800:]); sys.exit(r.returncode)
    m = re.search(r"black (\[.*?\]); unplanned white (\[.*?\]); frozen spans >=12f (\[.*?\])", r.stdout)
    pops = re.search(r"POPS[^:]*: (\[.*?\])", r.stdout)
    bad = [x for x in (list(m.groups()) if m else []) + ([pops.group(1)] if pops else []) if x != "[]"]
    # frames just under the pop threshold (score 1.0 = pop). A 0.25 proxy scores about 15 % lower than the final,
    # so on a proxy everything from 0.8 counts as a finding.
    lim = 0.8 if proxy else 0.9
    r2 = subprocess.run([py, "-B", "-c", NEAR, os.path.join(qa, "perframe.npz"), mp, str(lim)], capture_output=True, text=True)
    near = json.loads(r2.stdout) if r2.returncode == 0 and r2.stdout.strip() else []
    print("NEAR POPS (frame, score from %.2f; 1.0 = pop): %s" % (lim, near))
    if proxy and near: bad.append(str(near))
    print("QA %s  (%s)" % ("CLEAN" if not bad else "FINDINGS", os.path.relpath(os.path.join(qa, "report.md"), ROOT)))
    sys.exit(1 if bad else 0)

main()
