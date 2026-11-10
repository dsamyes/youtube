#!/usr/bin/env python3
"""Stage 1 - research.

research.md is written by a researcher (human or agent with web search). This stage turns it into
machine-readable research.json and validates it:
  * every fact row has a numeric value (or 'qualitative') and at least one source ID
  * every source ID used is defined with an http(s) URL
  * optionally probes each URL (--probe) and records reachability (informational, never fatal,
    because sandboxed/CI networks often block government sites)
"""
from __future__ import annotations

import re
import sys
import urllib.request

from lib import fail, log, set_stage, video_arg, video_dir, write_json, now

STAGE = "research"


def parse(md: str) -> dict:
    facts, sources, cities = {}, {}, {}
    for line in md.splitlines():
        m = re.match(r"^\|\s*(F\d+)\s*\|(.+?)\|(.+?)\|(.+?)\|(.+?)\|\s*$", line)
        if m:
            fid, text, val, unit, srcs = (x.strip() for x in m.groups())
            try:
                value = float(val)
            except ValueError:
                value = val
            facts[fid] = {"fact": text, "value": value, "unit": unit,
                          "sources": [s.strip() for s in srcs.split(",") if s.strip()]}
            continue
        m = re.match(r"^- (S\d+):\s*(.+?)\s+(https?://\S+)\s*$", line)
        if m:
            sources[m.group(1)] = {"title": m.group(2).rstrip(". "), "url": m.group(3)}
    m = re.search(r"City latitudes[^:]*:(.+?)\n\n", md, re.S)
    if m:
        for name, lat in re.findall(r"([A-Z][A-Za-z ]+?)\s+(-?\d+(?:\.\d+)?)", m.group(1)):
            cities[name.strip()] = float(lat)
    return {"facts": facts, "sources": sources, "cities": cities}


def probe(url: str) -> str:
    try:
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "if-engine-research/1.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            return str(r.status)
    except Exception as e:  # noqa: BLE001
        return f"unreachable ({type(e).__name__})"


def main() -> None:
    vid = video_arg()
    vdir = video_dir(vid)
    md_path = vdir / "research.md"
    if not md_path.exists():
        fail(vdir, STAGE, "research.md missing - write it first (see videos/<id>/research.md format)")
    data = parse(md_path.read_text(encoding="utf-8"))
    errors = []
    if len(data["facts"]) < 10:
        errors.append(f"only {len(data['facts'])} facts parsed")
    for fid, f in data["facts"].items():
        if not f["sources"]:
            errors.append(f"{fid} has no source")
        for s in f["sources"]:
            if s not in data["sources"]:
                errors.append(f"{fid} cites undefined source {s}")
        if not isinstance(f["value"], float) and f["value"] != "qualitative":
            errors.append(f"{fid} value not numeric: {f['value']}")
    if errors:
        fail(vdir, STAGE, "; ".join(errors))

    reach = {}
    if "--probe" in sys.argv:
        for sid, s in data["sources"].items():
            reach[sid] = probe(s["url"])
            log(STAGE, f"{sid} {reach[sid]} {s['url']}")
    data["generated"] = now()
    data["url_probe"] = reach
    write_json(vdir / "research.json", data)
    ok = sum(1 for v in reach.values() if v.startswith("2") or v.startswith("3"))
    set_stage(vdir, STAGE, "done", outputs=["research.md", "research.json"],
              facts=len(data["facts"]), sources=len(data["sources"]),
              urls_reachable=f"{ok}/{len(reach)}" if reach else "not probed")
    log(STAGE, f"OK: {len(data['facts'])} facts, {len(data['sources'])} sources, {len(data['cities'])} cities")


if __name__ == "__main__":
    main()
