"""Shared helpers for The If Engine pipeline: paths, manifest bookkeeping, JSON IO."""
from __future__ import annotations

import datetime as _dt
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VIDEOS = ROOT / "videos"
REMOTION = ROOT / "remotion"
SECRETS = Path(os.environ.get("IF_ENGINE_SECRETS", ROOT / "secrets"))

STAGES = [
    "research", "calc", "script", "factcheck", "voice", "captions",
    "render", "thumbnail", "metadata", "upload", "shorts",
]


def video_dir(video_id: str) -> Path:
    d = VIDEOS / video_id
    if not d.is_dir():
        sys.exit(f"[if-engine] no such video folder: {d}")
    return d


def now() -> str:
    return _dt.datetime.now(_dt.timezone.utc).replace(microsecond=0).isoformat()


def read_json(p: Path):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def write_json(p: Path, data) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    tmp = p.with_suffix(p.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    tmp.replace(p)


def load_manifest(vdir: Path) -> dict:
    p = vdir / "manifest.json"
    if p.exists():
        m = read_json(p)
    else:
        m = {"video_id": vdir.name, "created": now(), "stages": {}}
    for s in STAGES:
        m["stages"].setdefault(s, {"status": "pending"})
    return m


def set_stage(vdir: Path, stage: str, status: str, **info) -> dict:
    """status: pending | running | done | degraded | failed | skipped | ready"""
    m = load_manifest(vdir)
    entry = {"status": status, "updated": now()}
    entry.update(info)
    m["stages"][stage] = entry
    m["updated"] = now()
    write_json(vdir / "manifest.json", m)
    return m


def get_stage(vdir: Path, stage: str) -> dict:
    return load_manifest(vdir)["stages"].get(stage, {"status": "pending"})


def require(vdir: Path, *stages: str) -> None:
    m = load_manifest(vdir)
    bad = [s for s in stages if m["stages"][s]["status"] not in ("done", "degraded")]
    if bad:
        sys.exit(f"[if-engine] upstream stage(s) not complete: {', '.join(bad)}")


def fail(vdir: Path, stage: str, msg: str, **info) -> None:
    set_stage(vdir, stage, "failed", error=msg, **info)
    sys.exit(f"[{stage}] FAILED: {msg}")


def log(stage: str, msg: str) -> None:
    print(f"[{stage}] {msg}", flush=True)


def fmt_ts(seconds: float, srt: bool = False) -> str:
    ms = int(round(seconds * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    if srt:
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


NUM_RE = re.compile(r"(?<![\w.])[-−]?\d[\d,]*(?:\.\d+)?")


def numbers_in(text: str) -> list[str]:
    return [n.replace("−", "-") for n in NUM_RE.findall(text)]


def video_arg() -> str:
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("video_id", nargs="?", default="earth-stops-1s")
    a, _ = ap.parse_known_args()
    return a.video_id
