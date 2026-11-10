#!/usr/bin/env python3
"""Stage 3 - script.

Renders script.template.json -> script.json by substituting {{calc_key}} placeholders with the
`display` strings from calc.json, so every number in narration and on-screen text comes from code.
Validates structure and pacing *before* any audio exists (estimates at WPM_EST):
  * no unresolved placeholders, every card id / claim key exists
  * hook (first section) <= 15 s
  * retention beats no more than ~90 s apart
  * total length within the 8-12 minute target
  * native Shorts (own beats) are rendered and checked like long-form beats
  * ending sets up the next video
"""
from __future__ import annotations

import re

from lib import fail, log, read_json, set_stage, video_arg, video_dir, write_json, now
from textnorm import spoken, spoken_word_count

STAGE = "script"
WPM_EST = 176          # measured: Kokoro am_michael @ speed 1.12 ~ 176 wpm
BEAT_GAP = 0.4        # seconds of silence between beats
SECTION_GAP = 0.9      # extra silence between sections
PH = re.compile(r"\{\{(\w+)\}\}")
SHORT_GAP = 0.25       # pause between native-Short beats (shorts.py uses the same)
SHORT_PAD = 1.6        # lead-in + end card tail of a native Short
SHORT_MIN, SHORT_MAX = 25.0, 50.0


def is_native(sh: dict) -> bool:
    """A native Short carries its own beats (dicts); a legacy cut lists two long-form beat ids."""
    return bool(sh.get("beats")) and isinstance(sh["beats"][0], dict)


def main() -> None:
    vid = video_arg()
    vdir = video_dir(vid)
    tpl = read_json(vdir / "script.template.json")
    calc = read_json(vdir / "calc.json")
    research = read_json(vdir / "research.json")
    values, cards, facts = calc["values"], calc["cards"], research["facts"]
    errors, warnings = [], []

    def render(s: str | None, where: str) -> str | None:
        if s is None:
            return None

        def sub(m):
            k = m.group(1)
            if k not in values:
                errors.append(f"{where}: unknown placeholder {{{{{k}}}}}")
                return m.group(0)
            return values[k]["display"]
        return PH.sub(sub, s)

    def render_any(o, where):
        if isinstance(o, str):
            return render(o, where)
        if isinstance(o, dict):
            return {k: render_any(v, f"{where}.{k}") for k, v in o.items()}
        if isinstance(o, list):
            return [render_any(v, f"{where}[{i}]") for i, v in enumerate(o)]
        return o

    out = {k: v for k, v in tpl.items() if k not in ("sections", "metadata", "thumbnail")}
    out["generated"] = now()
    out["sections"] = []
    t = 0.0
    retention_times = []
    for si, sec in enumerate(tpl["sections"]):
        s_out = {k: v for k, v in sec.items() if k != "beats"}
        s_out["beats"] = []
        s_out["est_start"] = round(t, 1)
        for b in sec["beats"]:
            nb = dict(b)
            nb["template_text"] = b["text"]
            nb["text"] = render(b["text"], b["id"])
            nb["kinetic"] = render(b.get("kinetic"), b["id"] + ".kinetic")
            nb["visual"] = render_any(b.get("visual", {}), b["id"] + ".visual")
            if not nb["visual"].get("scene"):
                errors.append(f"{b['id']}: visual.scene missing")
            nb["spoken"] = spoken(nb["text"])
            if b.get("card") and b["card"] not in cards:
                errors.append(f"{b['id']}: unknown math card {b['card']}")
            for c in b.get("claims", []):
                if c not in values and c not in facts:
                    errors.append(f"{b['id']}: claim key {c} not in calc.json or research.json")
            # template keys used must be listed as claims (traceability)
            for k in PH.findall(b["text"]):
                if k not in b.get("claims", []):
                    warnings.append(f"{b['id']}: placeholder {k} not listed in claims")
            words = spoken_word_count(nb["text"])
            est = words / WPM_EST * 60
            nb["est_start"], nb["est_dur"] = round(t, 1), round(est, 1)
            if b.get("retention"):
                retention_times.append((t, b["id"], b["retention"]))
            t += est + BEAT_GAP
            s_out["beats"].append(nb)
        t += SECTION_GAP
        out["sections"].append(s_out)
    out["est_total_s"] = round(t, 1)

    # ---- structural checks ----
    hook = out["sections"][0]
    hook_end = hook["beats"][-1]["est_start"] + hook["beats"][-1]["est_dur"]
    if hook_end > 15.0:
        errors.append(f"hook too long: est {hook_end:.1f}s > 15s")
    gaps = []
    prev = 0.0
    for tt, bid, _ in retention_times + [(t, "END", "")]:
        gaps.append(round(tt - prev, 1))
        if tt - prev > 95:
            warnings.append(f"retention gap {tt - prev:.0f}s before {bid} (target 60-90s)")
        prev = tt
    if not (8 * 60 <= t <= 12 * 60):
        warnings.append(f"estimated length {t / 60:.1f} min outside 8-12 min target")
    last = out["sections"][-1]["beats"][-1]["text"].lower()
    nv = tpl["next_video"].lower()
    if not any(w in last for w in re.findall(r"[a-z]{5,}", nv)):
        errors.append("ending does not set up the next video")
    if "do the math" not in last:
        warnings.append("ending lacks the channel tagline")
    out["shorts"] = []
    for sh in tpl.get("shorts", []):
        for k in PH.findall(sh["title"]):
            if k not in values:
                errors.append(f"short {sh['id']}: unknown placeholder {k}")
        s_out = dict(sh, title=render(sh["title"], sh["id"]))
        if is_native(sh):
            # NATIVE vertical Short: its own script (beats with text/visual/claims), voiced and rendered
            # at 1080x1920 by shorts.py. Same rules as long-form beats.
            s_out["hook"] = render(sh.get("hook", ""), sh["id"] + ".hook")
            s_out["end"] = render(sh.get("end", ""), sh["id"] + ".end")
            st, beats = 0.0, []
            for b in sh["beats"]:
                nb = dict(b)
                nb["template_text"] = b["text"]
                nb["text"] = render(b["text"], b["id"])
                nb["kinetic"] = render(b.get("kinetic"), b["id"] + ".kinetic")
                nb["visual"] = render_any(b.get("visual", {}), b["id"] + ".visual")
                nb["spoken"] = spoken(nb["text"])
                if not nb["visual"].get("scene"):
                    errors.append(f"{b['id']}: visual.scene missing")
                for c in b.get("claims", []):
                    if c not in values and c not in facts:
                        errors.append(f"{b['id']}: claim key {c} not in calc.json or research.json")
                for k in PH.findall(b["text"]):
                    if k not in b.get("claims", []):
                        warnings.append(f"{b['id']}: placeholder {k} not listed in claims")
                st += spoken_word_count(nb["text"]) / WPM_EST * 60 + SHORT_GAP
                beats.append(nb)
            s_out["beats"] = beats
            s_out["est_s"] = round(st + SHORT_PAD, 1)
            if not (SHORT_MIN <= st + SHORT_PAD <= SHORT_MAX):
                warnings.append(f"short {sh['id']}: est {st + SHORT_PAD:.0f}s outside {SHORT_MIN}-{SHORT_MAX}s")
            if beats and spoken_word_count(beats[0]["text"]) > 25:
                warnings.append(f"short {sh['id']}: first line is long ({spoken_word_count(beats[0]['text'])} words); "
                                "the hook must land in the first 2-3 s")
        out["shorts"].append(s_out)
    for key in ("metadata", "thumbnail"):
        if key not in tpl:
            errors.append(f"template lacks a '{key}' block")
        else:
            out[key] = render_any(tpl[key], key)
    if len(out["shorts"]) != 3:
        warnings.append(f"{len(out['shorts'])} shorts defined (expected 3)")
    out["checks"] = {"hook_est_s": round(hook_end, 1), "retention_gaps_est_s": gaps,
                     "est_total_min": round(t / 60, 2), "warnings": warnings}
    if errors:
        fail(vdir, STAGE, "; ".join(errors))
    write_json(vdir / "script.json", out)
    n_beats = sum(len(s["beats"]) for s in out["sections"])
    words = sum(len(b["text"].split()) for s in out["sections"] for b in s["beats"])
    set_stage(vdir, STAGE, "done", outputs=["script.json"], sections=len(out["sections"]), beats=n_beats,
              words=words, est_minutes=round(t / 60, 2), warnings=warnings)
    for w in warnings:
        log(STAGE, "WARN " + w)
    log(STAGE, f"OK: {len(out['sections'])} sections, {n_beats} beats, {words} words, est {t / 60:.1f} min, "
               f"hook {hook_end:.1f}s, retention gaps {gaps}")


if __name__ == "__main__":
    main()
