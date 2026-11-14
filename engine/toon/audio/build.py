#!/usr/bin/env python
# One command builds the whole soundtrack of a cartoon short from data:
#     engine/.venv/bin/python engine/toon/audio/build.py <video_id>
# reads   engine/videos/<id>/shots.json, voice/voice.wav + words.json + lines.json, audio/score.json
# writes  engine/videos/<id>/audio/mix.wav, stem_voice.wav, stem_music.wav, stem_sfx.wav, cues.md, verify.json
# Exit 0 = built and every check passed. 1 = built, a check failed (see the end of the output / cues.md).
# 2 = the inputs are wrong; nothing was rendered, every problem is listed with the valid choices.
#     build.py <video_id> --check     only validate the inputs (about a second); before audio/score.json exists it
#                                     checks the shot plan and the events alone
#     build.py --list                 print every event type, mood, tune and acoustics the library knows
# numpy + scipy only, headless, seeded, no downloads; about 40 s for a 65 s short on 4 cores. The manual is README.md.
import os
import sys
import time

sys.dont_write_bytecode = True
os.environ["PYTHONDONTWRITEBYTECODE"] = "1"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def vocabulary():
    """the library's vocabulary as Markdown (the tables of README.md are this output)"""
    import music
    import sfx
    out = ["## Event types", "", "| type | span | what it sounds like, when to use it | options |", "|---|---|---|---|"]
    seen = {}
    for name, sp in sfx.SOUND.items():
        seen.setdefault(id(sp.fn), (sp, []))[1].append(name)
    span = {"need": 'needs "to"', "opt": '"to" optional', "no": "one shot"}
    for group, title in (("bed", "ambience beds"), ("spot", "spot effects")):
        out.append(f"| **{title}** | | | |")
        for sp, names in seen.values():
            if sp.group == group:
                opts = "; ".join(f"`{k}`: {v}" for k, v in sp.params.items()).replace(" | ", " / ") or "-"
                out.append(f"| {', '.join('`%s`' % n for n in names)} | {span[sp.span]} | {sp.doc} | {opts} |")
    out += ["", "Every event also takes " + "; ".join(f"`{k}` ({v})" for k, v in sfx.COMMON.items()) + ".", "",
            "## Acoustics (score.json places)", "", "| name | for |", "|---|---|"]
    out += [f"| `{k}` | {v} |" for k, v in sfx.ROOM_DOC.items()]
    out += ["", "## Moods (score.json sections)", "", "| mood | level LU | hits | what it sounds like, when to use it |", "|---|---|---|---|"]
    for k, m in music.MOODS.items():
        lv = "-" if m.level is None else (" / ".join(f"{x:g}" for x in m.level) if isinstance(m.level, tuple) else f"{m.level:g}")
        out.append(f"| `{k}` | {lv} | {m.hits} | {m.doc} |")
    out += ["", "## Tunes (score.json theme)", "", ", ".join(f"`{k}`" for k in music.THEMES) + ', or `"seed:<number>"` for a tune made from that number.']
    return "\n".join(out)


def main(argv):
    args = [a for a in argv if not a.startswith("--")]
    flags = {a for a in argv if a.startswith("--")}
    if "--list" in flags:
        print(vocabulary())
        return 0
    if len(args) != 1 or flags - {"--check"}:
        print("usage: build.py <video_id> [--check]   |   build.py --list      (the manual: engine/toon/audio/README.md)")
        return 2
    t0 = time.time()
    from project import Project, Problems
    import music
    import sfx
    try:
        P = Project(args[0], events_only="--check" in flags)
        plan = music.Plan(P)
        bad = P.problems + plan.problems + sfx.problems(P, plan)
        if bad:
            raise Problems(bad)
    except Problems as e:
        print(f"build: cannot build '{args[0]}': {len(e.items)} problem{'s' if len(e.items) != 1 else ''} in the inputs, nothing was rendered")
        for i, p in enumerate(e.items, 1):
            print(f"  {i}. {p}")
        print("Fix the files and run the command again. Event types, moods and options: engine/toon/audio/README.md (or build.py --list).")
        return 2
    for n in plan.notes:
        print("note:", n)
    if "--check" in flags and P.standin:
        print(f"build: shots.json of '{P.id}' is valid: {P.total} frames at {P.fps} fps, {len(P.ev)} events. There is no audio/score.json yet, "
              "so only the shot plan and the events were checked (against silence); run --check again once the score exists.")
        return 0
    if "--check" in flags:
        print(f"build: inputs of '{P.id}' are valid: {P.total} frames at {P.fps} fps, {len(P.ev)} events, {len(plan.secs)} score sections, key {P.key}, tempo {P.tempo:g}")
        return 0
    import mix
    import verify
    mixed = mix.run(P, plan)
    fails = verify.run(P, plan, mixed)
    print(f"build: {'OK, all checks passed' if not fails else 'CHECKS FAILED (%d)' % len(fails)} in {time.time() - t0:.0f} s -> {P.out}")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
