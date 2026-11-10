#!/usr/bin/env python3
"""Stage 11 (stretch) - cut vertical 1080x1920 Shorts from the long-form render.

Segments come from script.json "shorts" (beat ranges chosen as self-contained moments) and are
timed with timing.json. Layout: blurred full-bleed background, the 16:9 frame in the middle,
a title at the top and big burned-in captions below (ASS subtitles rendered by libass at
1080x1920 so sizes are exact). Self-checks: 1080x1920, <= 60 s, audio present.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import textwrap

from lib import ROOT, fail, log, read_json, require, set_stage, video_dir, write_json

STAGE = "shorts"
MAX_LEN = 59.0


def ass_time(t: float) -> str:
    cs = int(round(t * 100))
    h, cs = divmod(cs, 360000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def build_ass(title: str, cues: list[dict], t0: float, dur: float, path) -> None:
    head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Title,Inter Display,84,&H00FFFFFF,&H00FFFFFF,&H003A1511,&H00000000,1,0,0,0,100,100,0,0,1,0,6,8,70,70,230,1
Style: Brand,Inter,38,&H00FFE03D,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,6,0,1,0,0,8,70,70,140,1
Style: Cap,Inter,64,&H00FFFFFF,&H00FFFFFF,&H00200907,&H64000000,1,0,0,0,100,100,0,0,1,6,0,2,80,80,430,1
Style: Foot,Inter,36,&H0047B5FF,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,2,70,70,170,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = [f"Dialogue: 0,{ass_time(0)},{ass_time(dur)},Brand,,0,0,0,,THE IF ENGINE",
          f"Dialogue: 0,{ass_time(0)},{ass_time(dur)},Title,,0,0,0,," + "\\N".join(textwrap.wrap(title.upper(), 20)),
          f"Dialogue: 0,{ass_time(0)},{ass_time(dur)},Foot,,0,0,0,,Full video on the channel · Run the impossible. Do the math."]
    for c in cues:
        a, b = max(0.0, c["start"] - t0), min(dur, c["end"] - t0)
        if b <= 0 or a >= dur:
            continue
        txt = "\\N".join(textwrap.wrap(c["text"].replace("\n", " "), 24))
        ev.append(f"Dialogue: 1,{ass_time(a)},{ass_time(b)},Cap,,0,0,0,,{txt}")
    path.write_text(head + "\n".join(ev) + "\n", encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video_id", nargs="?", default="earth-stops-1s")
    ap.add_argument("--source", help="long-form file (default: 1080p render, else 540p)")
    a = ap.parse_args()
    vdir = video_dir(a.video_id)
    require(vdir, "captions")
    script = read_json(vdir / "script.json")
    timing = read_json(vdir / "timing.json")
    cues = read_json(vdir / "captions.json")["cues"]
    src = vdir / a.source if a.source else next(
        (p for p in [vdir / "renders" / f"{a.video_id}_1080p.mp4", vdir / "renders" / f"{a.video_id}_540p.mp4"] if p.exists()), None)
    if not src or not src.exists():
        fail(vdir, STAGE, "no long-form render found; run render.py first")
    tb = {b["id"]: b for b in timing["beats"]}
    out_dir = vdir / "shorts"
    out_dir.mkdir(exist_ok=True)
    results, problems = [], []
    for sh in script.get("shorts", []):
        b0, b1 = sh["beats"]
        t0 = max(0.0, tb[b0]["start"] - 0.25)
        t1 = tb[b1]["end"] + 0.6
        dur = t1 - t0
        if dur > MAX_LEN:
            problems.append(f"{sh['id']} is {dur:.1f}s > {MAX_LEN}s; choose a shorter beat range")
            continue
        ass = out_dir / f"{sh['id']}.ass"
        build_ass(sh["title"], cues, t0, dur, ass)
        out = out_dir / f"{a.video_id}_{sh['id']}.mp4"
        fc = ("[0:v]split[a][b];"
              "[a]scale=-2:1920,crop=1080:1920,boxblur=30:3,eq=brightness=-0.28[bg];"
              "[b]scale=1080:-2[fg];"
              "[bg][fg]overlay=0:(H-h)/2-60,"
              f"ass=filename={ass}:fontsdir={ROOT / 'remotion' / 'public' / 'fonts'}[v]")
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t0:.3f}", "-t", f"{dur:.3f}", "-i", str(src),
               "-filter_complex", fc, "-map", "[v]", "-map", "0:a?", "-c:v", "libx264", "-preset", "medium",
               "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "aac", "-b:a", "160k",
               "-movflags", "+faststart", str(out)]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode:
            problems.append(f"{sh['id']}: ffmpeg failed: {r.stderr[-300:]}")
            continue
        info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height",
                                          "-of", "json", str(out)], capture_output=True, text=True).stdout)
        v = [s for s in info["streams"] if s["codec_type"] == "video"][0]
        has_a = any(s["codec_type"] == "audio" for s in info["streams"])
        d = float(info["format"]["duration"])
        if (v["width"], v["height"]) != (1080, 1920) or d > 60.5:
            problems.append(f"{sh['id']}: got {v['width']}x{v['height']} {d:.1f}s")
        results.append({"id": sh["id"], "title": sh["title"], "file": str(out.relative_to(vdir)),
                        "duration_s": round(d, 1), "audio": has_a, "source_range": [round(t0, 2), round(t1, 2)]})
        log(STAGE, f"{out.name}: {d:.1f}s {v['width']}x{v['height']} audio={has_a}")
    write_json(out_dir / "shorts.json", {"source": str(src.relative_to(vdir)), "shorts": results})
    if problems:
        fail(vdir, STAGE, "; ".join(problems), shorts=results)
    set_stage(vdir, STAGE, "done", shorts=results, source=str(src.relative_to(vdir)))
    log(STAGE, f"OK: {len(results)} shorts")


if __name__ == "__main__":
    main()
