#!/usr/bin/env python3
"""Stage 4 - factcheck (a separate pass over the finished script).

Three layers, all must pass:
  A. Numbers: every number in narration, on-screen kinetic text and Shorts titles must equal the
     `display` of a calc.json value listed in that beat's claims (or a whitelisted structural
     number such as "Category 5"). Unlisted-but-valid numbers are flagged as traceability warnings.
  B. Worded comparisons ("faster than sound", "higher than Everest", "more than 6 times", ...)
     are re-derived from calc.json values.
  C. Editorial review: factcheck_review.json holds a verdict for EVERY beat, pinned to a hash of
     the beat's text. If the script changes after review, the stale beats fail until re-reviewed.
     The review file also carries the fix log (what the review pass changed in the script).
Writes factcheck.md (human-readable report) and updates manifest.
"""
from __future__ import annotations

import hashlib
import re

from lib import fail, log, numbers_in, read_json, set_stage, video_arg, video_dir, now

STAGE = "factcheck"

# numbers that are labels/ordinals, not measurements (with the reason they are safe)
WHITELIST = {
    "1": "'one second' / '1st law' / '+1' - scenario definitions and ordinals",
    "0.00": "scenario clock label", "1.00": "scenario clock label",
    "2": "ordinal / 'two' as a count in labels", "3": "ordinal in labels",
}


def h(text: str) -> str:
    return hashlib.sha1(text.encode()).hexdigest()[:12]


# visual params that are layout/styling, not claims (not scanned for numbers)
LAYOUT_KEYS = {"scene", "phase", "speed", "spin", "r", "dist", "color", "colors", "art", "spot", "x", "y", "size"}


def strings_in(o) -> list[str]:
    if isinstance(o, str):
        return [o]
    if isinstance(o, dict):
        return [x for k, v in o.items() if k not in LAYOUT_KEYS for x in strings_in(v)]
    if isinstance(o, list):
        return [x for v in o for x in strings_in(v)]
    return []


def norm(n: str) -> str:
    return n.replace(",", "")


def main() -> None:
    vid = video_arg()
    vdir = video_dir(vid)
    script = read_json(vdir / "script.json")
    calc = read_json(vdir / "calc.json")
    research = read_json(vdir / "research.json")
    review_p = vdir / "factcheck_review.json"
    review = read_json(review_p) if review_p.exists() else {"beats": {}, "fixes": []}
    V = calc["values"]
    facts = research["facts"]
    val = {k: v["value"] for k, v in V.items()}
    from calc import load_module
    mod = load_module(vdir)
    WHITELIST.update(getattr(mod, "WHITELIST", {}))

    errors, warns, rows = [], [], []
    disp_index = {}
    for k, v in V.items():
        disp_index.setdefault(norm(v["display"]), []).append(k)

    beats = [b for s in script["sections"] for b in s["beats"]]
    # native Shorts have their own narration: same tracing + review rules as long-form beats
    beats += [b for sh in script.get("shorts", []) for b in sh.get("beats", []) if isinstance(b, dict)]
    for b in beats:
        claims = b.get("claims", [])
        allowed = {norm(V[c]["display"]): c for c in claims if c in V}
        texts = [("narration", b["text"])] + ([("on-screen", b["kinetic"])] if b.get("kinetic") else [])
        texts += [("visual", t) for t in strings_in(b.get("visual", {}))]
        found = []
        for where, t in texts:
            t_clean = t
            # multi-number displays ("23 h 56 min 4 s", "3.7 × 10²³") are matched as a whole first
            for c in claims:
                d = V[c]["display"] if c in V else None
                if d and len(numbers_in(d)) > 1 and d in t_clean:
                    found.append((d, c, where))
                    t_clean = t_clean.replace(d, " ")
            for n in numbers_in(t_clean):
                nn = norm(n)
                if nn in allowed:
                    found.append((n, allowed[nn], where))
                elif nn in WHITELIST:
                    found.append((n, "whitelist", where))
                elif nn in disp_index:
                    if where != "visual":
                        # a typed number that merely equals some other value is not traceable
                        errors.append(f"{b['id']} ({where}): '{n}' equals {disp_index[nn]} but is not in this beat's claims "
                                      f"- use the {{{{key}}}} placeholder and list it in claims")
                    found.append((n, disp_index[nn][0], where))
                else:
                    errors.append(f"{b['id']} ({where}): number '{n}' has no source in calc.json")
        for c in claims:
            if c not in V and c not in facts:
                errors.append(f"{b['id']}: claim {c} unknown")
        rows.append((b, found))

    for sh in script.get("shorts", []):
        for field in ("title", "hook", "end"):
            for n in numbers_in(sh.get(field) or ""):
                if norm(n) not in disp_index and norm(n) not in WHITELIST:
                    errors.append(f"short {sh['id']} {field} number '{n}' unsourced")

    # ---- B. worded comparisons, re-derived ----
    text = {b["id"]: b["text"] for b in beats}
    rules = list(mod.comparisons(val, facts)) if hasattr(mod, "comparisons") else []
    rule_rows = []
    for bid, phrase, ok in rules:
        if bid not in text or phrase.lower() not in text[bid].lower():
            warns.append(f"rule for {bid} '{phrase}' no longer matches the text (phrase changed?)")
            rule_rows.append((bid, phrase, "n/a"))
            continue
        rule_rows.append((bid, phrase, "PASS" if ok else "FAIL"))
        if not ok:
            errors.append(f"{bid}: worded claim '{phrase}' contradicts calc.json")

    # ---- C. editorial review coverage ----
    if "--stamp" in __import__("sys").argv:
        # pin reviewed beats to their CURRENT text. Only beats that carry a verdict and a real note
        # (>= 15 chars) are stamped; anything else stays unreviewed and keeps failing.
        n = 0
        for b in beats:
            r = review["beats"].get(b["id"])
            if r and r.get("verdict") in ("ok", "fixed", "rhetoric") and len(r.get("note", "")) >= 15:
                if r.get("hash") != h(b["text"]):
                    r["hash"] = h(b["text"])
                    n += 1
        from lib import write_json
        write_json(review_p, review)
        log(STAGE, f"stamped {n} beat(s)")

    stale, missing = [], []
    for b in beats:
        r = review["beats"].get(b["id"])
        if not r:
            missing.append(b["id"])
        elif r.get("hash") != h(b["text"]):
            stale.append(b["id"])
        elif r.get("verdict") not in ("ok", "fixed", "rhetoric"):
            errors.append(f"{b['id']}: review verdict '{r.get('verdict')}' is not a pass")
    if missing:
        errors.append(f"no editorial review for beats: {', '.join(missing)}")
    if stale:
        errors.append(f"script changed since review (re-review needed): {', '.join(stale)}")
    if "--print-hashes" in __import__("sys").argv:
        for b in beats:
            print(b["id"], h(b["text"]))

    # ---- report ----
    src = research["sources"]
    L = [f"# Fact-check report: {script['title']}", "",
         f"Generated {now()} by `pipeline/factcheck.py`. Status: **{'PASS' if not errors else 'FAIL'}**", "",
         "Layers: (A) every number traced to calc.json, (B) worded comparisons re-derived from calc.json, "
         "(C) editorial verdict for every beat, pinned to a hash of the beat text.", "",
         "## Fixes made by the review pass", ""]
    for fx in review.get("fixes", []):
        L.append(f"- **{fx['beat']}**: {fx['issue']} → *{fx['fix']}*")
    L += ["", "## (B) Worded comparisons", "", "| Beat | Phrase | Result |", "|---|---|---|"]
    L += [f"| {a} | {b_} | {c} |" for a, b_, c in rule_rows]
    L += ["", "## (A + C) Beat-by-beat", ""]
    for b, found in rows:
        r = review["beats"].get(b["id"], {})
        L.append(f"### {b['id']} · verdict: {r.get('verdict', 'MISSING')}")
        L.append(f"> {b['text']}")
        L.append("")
        for n, key, where in found:
            if key == "whitelist":
                L.append(f"- `{n}` ({where}): structural number - {WHITELIST[norm(n)]}")
            else:
                v = V[key]
                srcs = sorted({s for f in v["facts"] for s in facts[f]["sources"]}) if v["facts"] else []
                L.append(f"- `{n}` ({where}) = `{key}` = {v['value']:.6g} {v['unit']} · {v['derivation']} · "
                         f"facts {', '.join(v['facts']) or '-'} · sources {', '.join(srcs) or '-'}")
        if r.get("note"):
            L.append(f"- Review: {r['note']}")
        L.append("")
    L += ["## Sources", ""] + [f"- {k}: {s['title']} - {s['url']}" for k, s in src.items()]
    if warns:
        L += ["", "## Warnings", ""] + [f"- {w}" for w in warns]
    if errors:
        L += ["", "## ERRORS", ""] + [f"- {e}" for e in errors]
    (vdir / "factcheck.md").write_text("\n".join(L) + "\n", encoding="utf-8")

    if errors:
        fail(vdir, STAGE, f"{len(errors)} error(s); see factcheck.md: " + " | ".join(errors[:5]))
    n_nums = sum(len(f) for _, f in rows)
    set_stage(vdir, STAGE, "done", outputs=["factcheck.md"], numbers_checked=n_nums,
              comparisons=len(rules), beats_reviewed=len(beats), fixes=len(review.get("fixes", [])),
              warnings=warns)
    for w in warns:
        log(STAGE, "WARN " + w)
    log(STAGE, f"PASS: {n_nums} numbers traced, {len(rules)} comparisons re-derived, {len(beats)} beats reviewed")


if __name__ == "__main__":
    main()
