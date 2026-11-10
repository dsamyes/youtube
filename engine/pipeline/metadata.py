#!/usr/bin/env python3
"""Stage 9 - metadata.json for YouTube (long-form + Shorts).

Everything video-specific comes from the "metadata" block of script.template.json (rendered with
calc displays by build_script.py): alt_titles, hook, summary, key_numbers, assumptions, tags,
hashtags. This stage adds chapters (from real narration timing), sources actually used by the
script's claims, the AI-voice disclosure and per-Short metadata. Validated against YouTube limits:
title <= 100 chars, description <= 5000, tags <= 500, no < or >, chapters start at 0:00, >= 3
chapters each >= 10 s; every number in titles must come from calc.json.
"""
from __future__ import annotations

import re

from lib import fail, fmt_ts, log, numbers_in, read_json, require, set_stage, video_arg, video_dir, write_json, now

STAGE = "metadata"
CATEGORY_SCIENCE_TECH = "28"
SHORTS_PLAYLIST = "Shorts: 60-Second Ifs"
LONG_URL = "{{LONG_URL}}"  # replaced by upload.py --related-id for Shorts


def short_title(t: str) -> str:
    t = re.sub(r"\s*\([^)]*\)", "", t)
    return t if len(t) <= 70 else t[:67].rstrip() + "..."


def main():
    vid = video_arg()
    vdir = video_dir(vid)
    require(vdir, "factcheck", "voice")
    script = read_json(vdir / "script.json")
    timing = read_json(vdir / "timing.json")
    research = read_json(vdir / "research.json")
    calc = read_json(vdir / "calc.json")
    M = script["metadata"]
    facts, sources = research["facts"], research["sources"]
    displays = {re.sub(",", "", v["display"]) for v in calc["values"].values()}

    chapters = [(0.0 if i == 0 else s["start"], s["chapter"]) for i, s in enumerate(timing["sections"])]
    used = set()
    for s in script["sections"]:
        for b in s["beats"]:
            for c in b.get("claims", []):
                fids = calc["values"][c]["facts"] if c in calc["values"] else [c]
                for f in fids:
                    used.update(facts[f]["sources"])
    order = sorted(sources, key=lambda k: int(k[1:]))
    used_list = [k for k in order if k in used]
    other = [k for k in order if k not in used]

    title = script["title"]
    alt_titles = M["alt_titles"]
    lines = [M["hook"], "", M["summary"], "", "⏱ Chapters"]
    lines += [f"{fmt_ts(t)} {name}" for t, name in chapters]
    lines += ["", "🧮 The numbers (computed in code, rounded)"] + [f"• {k}" for k in M["key_numbers"]]
    lines += ["", "📚 Sources"] + [f"[{k}] {short_title(sources[k]['title'])}: {sources[k]['url']}" for k in used_list]
    tail = ["", M.get("assumptions", ""),
            "", "How this video was made: animations are generated from code; the narration voice is synthetic "
            "(text-to-speech); every number is computed by our calculation script and checked against the sources above.",
            "", f"Next: {script['next_video']}", "", M.get("hashtags", "#science #physics #whatif")]
    further = (["", "Further reading"] + [f"[{k}] {sources[k]['url']}" for k in other]) if other else []
    description = "\n".join(lines + further + tail)
    if len(description) > 4900:
        description = "\n".join(lines + tail)

    # ---- Shorts ----
    beats = {b["id"]: b for s in script["sections"] for b in s["beats"]}
    shorts_md = []
    for sh in script.get("shorts", []):
        first = re.split(r"(?<=[.?!])\s", beats[sh["beats"][0]]["text"])[0]
        st = sh["title"] if len(sh["title"]) <= 90 else sh["title"][:90]
        shorts_md.append({
            "id": sh["id"], "file": f"shorts/{vid}_{sh['id']}.mp4",
            "title": f"{st} #Shorts",
            "description": f"{first}\n\nThe full explanation, with every calculation on screen: {LONG_URL}\n\n"
                           f"{M.get('hashtags', '')} #Shorts".strip(),
            "tags": M["tags"][:10] + ["shorts"],
        })

    md = {
        "video_id": vid, "generated": now(),
        "title": title, "alt_titles": alt_titles, "description": description, "tags": M["tags"],
        "categoryId": CATEGORY_SCIENCE_TECH, "category": "Science & Technology",
        "defaultLanguage": "en", "defaultAudioLanguage": "en",
        "playlist": script.get("series", "Planet Breakers"), "shorts_playlist": SHORTS_PLAYLIST,
        "madeForKids": False,
        # YouTube "altered or synthetic content" (status.containsSyntheticMedia) is for REALISTIC content
        # a viewer could mistake for real people/places/events. Stylised vector animation + a generic
        # synthetic narrator (no cloned/real voice) does not meet that bar; the TTS voice is disclosed in
        # the description. Set True if photoreal generated footage or a cloned voice is ever used.
        "containsSyntheticMedia": False,
        "containsSyntheticMedia_rationale": "Stylised, clearly animated vector graphics; generic TTS narrator not imitating any real person. AI voice disclosed in description.",
        "chapters": [{"t": round(t, 2), "label": n} for t, n in chapters],
        "license": "youtube", "embeddable": True,
        "human_review_required": True,
        "shorts": shorts_md,
    }
    errs = []
    # links are only allowed in the generated Sources list (from research.md), never in free text
    free = " ".join([M["hook"], M["summary"], M.get("assumptions", ""), M.get("hashtags", ""), *M["key_numbers"],
                     *alt_titles, *[s["title"] for s in script.get("shorts", [])]])
    if re.search(r"https?://|www\.|\.[a-z]{2,6}/", free, re.I):
        errs.append("links/domains are not allowed in metadata free text (hook, summary, key_numbers, titles)")
    for t in [title, *alt_titles] + [s["title"] for s in shorts_md]:
        if len(t) > 100:
            errs.append(f"title > 100 chars: {t[:40]}...")
        for n in numbers_in(t):
            if n.replace(",", "") not in displays and n not in {"1", "2", "3"}:
                errs.append(f"title number '{n}' not from calc.json: {t}")
    if len(alt_titles) != 2:
        errs.append("need exactly 2 alt titles for A/B testing")
    for d in [description] + [s["description"] for s in shorts_md]:
        if len(d) > 5000:
            errs.append(f"description {len(d)} chars > 5000")
        if "<" in d or ">" in d:
            errs.append("description contains < or > (rejected by YouTube API)")
    if sum(len(t) for t in M["tags"]) + len(M["tags"]) > 500:
        errs.append("tags > 500 chars")
    if chapters[0][0] != 0 or len(chapters) < 3:
        errs.append("chapters must start at 0:00 and have >= 3 entries")
    ends = [c[0] for c in chapters[1:]] + [timing["total"]]
    for (t0, n), t1 in zip(chapters, ends):
        if t1 - t0 < 10:
            errs.append(f"chapter '{n}' shorter than 10 s")
    if errs:
        fail(vdir, STAGE, "; ".join(errs))
    write_json(vdir / "metadata.json", md)
    set_stage(vdir, STAGE, "done", outputs=["metadata.json"], chapters=len(chapters),
              description_chars=len(description), sources_cited=len(used_list), shorts=len(shorts_md))
    log(STAGE, f"OK: {len(chapters)} chapters, description {len(description)} chars, {len(used_list)} sources used, "
               f"{len(shorts_md)} shorts")


if __name__ == "__main__":
    main()
