#!/usr/bin/env python3
"""Stage 8 - thumbnail (1280x720 PNG) from pipeline/templates/thumbnail.html (brand template).

Uses headless Chrome (CHROME env or google-chrome). Self-checks: layout script in the template
reports overlap/overflow; output must be 1280x720 and under YouTube's 2 MB limit.
"""
from __future__ import annotations

import argparse
import html
import os
import re
import subprocess
from pathlib import Path

from PIL import Image

from lib import ROOT, fail, log, read_json, set_stage, video_dir

STAGE = "thumbnail"
CHROME = os.environ.get("CHROME", "google-chrome")


def chrome(args):
    return subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
                           "--force-device-scale-factor=1", *args], capture_output=True, text=True, timeout=120)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video_id", nargs="?", default="earth-stops-1s")
    a = ap.parse_args()
    vdir = video_dir(a.video_id)
    script = read_json(vdir / "script.json")
    T = script.get("thumbnail")
    if not T:
        fail(vdir, STAGE, "script.json has no thumbnail block (add 'thumbnail' to script.template.json)")
    headline, number, badge = T["headline"], T["number"], T.get("badge", "")
    calc = read_json(vdir / "calc.json")["values"]
    disp = {v["display"].replace(",", "") for v in calc.values()}
    from lib import numbers_in
    bad = [n for n in numbers_in(re.sub("<.*?>", " ", f"{headline} {number} {badge}"))
           if n.replace(",", "") not in disp and n not in {"1", "2", "3"}]
    if bad:
        fail(vdir, STAGE, f"thumbnail numbers not from calc.json: {bad} (use {{{{keys}}}} in the template)")
    art = T.get("art", {})
    p1, p2, p3 = art.get("planet", ["#9be7ff", "#2b7bd6", "#0d2a66"])
    land = "" if not art.get("land", True) else (
        '<div class="land" style="right:330px;top:170px;width:150px;height:230px"></div>'
        '<div class="land" style="right:120px;top:260px;width:170px;height:140px"></div>'
        '<div class="land" style="right:210px;top:470px;width:110px;height:120px"></div>')
    winds = "" if not art.get("winds", False) else (
        '<div class="wind" style="right:-20px;top:210px;width:260px"></div>'
        '<div class="wind" style="right:40px;top:560px;width:200px"></div>'
        '<div class="wind" style="right:520px;top:620px;width:150px;opacity:.7"></div>')
    moon = '<div class="moon"></div>' if art.get("moon") else ""
    fontdir = (ROOT / "remotion" / "public" / "fonts").as_uri()
    tpl = (ROOT / "pipeline" / "templates" / "thumbnail.html").read_text(encoding="utf-8")
    for k, v in {"{{HEADLINE}}": headline, "{{NUMBER}}": html.escape(number), "{{BADGE}}": html.escape(badge),
                 "{{P1}}": p1, "{{P2}}": p2, "{{P3}}": p3, "{{LAND}}": land, "{{WINDS}}": winds,
                 "{{MOON}}": moon, "{{FONTDIR}}": fontdir}.items():
        tpl = tpl.replace(k, v)
    page = tpl if badge else tpl.replace('<div class="stop"></div>', "")
    build = vdir / "build"
    build.mkdir(exist_ok=True)
    src = build / "thumbnail.html"
    src.write_text(page, encoding="utf-8")
    out = vdir / "thumbnail.png"
    dom = chrome(["--dump-dom", "--window-size=1280,720", src.as_uri()]).stdout
    m = re.search(r"<title>(.*?)</title>", dom)
    layout = m.group(1) if m else "unknown"
    r = chrome([f"--screenshot={out}", "--window-size=1280,720", src.as_uri()])
    if not out.exists():
        fail(vdir, STAGE, f"chrome screenshot failed: {r.stderr[-300:]}")
    im = Image.open(out)
    problems = []
    if im.size != (1280, 720):
        problems.append(f"size {im.size}")
    if out.stat().st_size > 2_000_000:
        im.convert("RGB").save(out.with_suffix(".jpg"), quality=90)
        problems.append("PNG > 2MB (jpg fallback written)")
    if layout != "OK":
        problems.append(f"layout check: {layout}")
    if problems:
        fail(vdir, STAGE, "; ".join(problems))
    set_stage(vdir, STAGE, "done", outputs=["thumbnail.png"], size=f"{im.size[0]}x{im.size[1]}",
              bytes=out.stat().st_size, headline=re.sub("<.*?>", "", headline), number=number)
    log(STAGE, f"OK: {out} {im.size} {out.stat().st_size // 1024} KB, layout {layout}")


if __name__ == "__main__":
    main()
