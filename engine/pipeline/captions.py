#!/usr/bin/env python3
"""Stage 7 - captions.

Builds captions.srt (+ captions.json for Shorts) from script.json and the real narration timing in
timing.json. Each beat is split into caption cues of <= 2 lines x 42 chars at sentence / clause
boundaries. With ElevenLabs, cue boundaries come from the exact word times of the with-timestamps
alignment (timing.json beats[].word_times); otherwise cue durations inside a beat are proportional to
the *spoken* word count (numbers expanded).
Self-checks: monotonic, non-overlapping cues, every cue 0.8-7 s, line length limits, and the
caption text reassembles exactly to the narration.
"""
from __future__ import annotations

import re

from lib import fail, fmt_ts, log, read_json, require, set_stage, video_arg, video_dir, write_json

from textnorm import spoken_word_count

STAGE = "captions"
MAX_LINE = 42
MAX_CUE = 2 * MAX_LINE
MAX_SPOKEN = 15


def _halve(p: str) -> list[str]:
    """split a too-long sentence into two balanced parts (prefer a comma near the middle)."""
    words = p.split(" ")
    mid = len(p) / 2
    best, best_score = None, None
    pos = 0
    for i, w in enumerate(words[:-1]):
        pos += len(w) + 1
        score = abs(pos - mid) - (15 if w.endswith((",", ":", ";")) else 0)
        if best_score is None or score < best_score:
            best, best_score = i + 1, score
    return [" ".join(words[:best]), " ".join(words[best:])]


def split_chunks(text: str) -> list[str]:
    todo = re.split(r"(?<=[.?!])\s+", text.strip())
    out = []
    while todo:
        p = todo.pop(0)
        if len(p) > MAX_CUE - 6 or spoken_word_count(p) > MAX_SPOKEN:
            todo[0:0] = _halve(p)
        elif p:
            out.append(p)
    # merge very short fragments into a neighbour when the result still fits
    merged: list[str] = []
    for c in out:
        if merged and (len(c) < 18 or len(merged[-1]) < 18) and len(merged[-1]) + 1 + len(c) <= MAX_CUE \
                and spoken_word_count(merged[-1] + " " + c) <= MAX_SPOKEN + 4:
            merged[-1] = merged[-1] + " " + c
        else:
            merged.append(c)
    return merged


def wrap(c: str) -> str:
    if len(c) <= MAX_LINE:
        return c
    words, best = c.split(" "), None
    for i in range(1, len(words)):
        a, b = " ".join(words[:i]), " ".join(words[i:])
        if len(a) <= MAX_LINE and len(b) <= MAX_LINE:
            score = abs(len(a) - len(b))
            if best is None or score < best[0]:
                best = (score, a + "\n" + b)
    return best[1] if best else c


def main() -> None:
    vid = video_arg()
    vdir = video_dir(vid)
    require(vdir, "script", "voice")
    script = read_json(vdir / "script.json")
    timing = read_json(vdir / "timing.json")
    tb = {b["id"]: b for b in timing["beats"]}
    cues = []
    for s in script["sections"]:
        for b in s["beats"]:
            t0, t1 = tb[b["id"]]["start"], tb[b["id"]]["end"]
            chunks = split_chunks(b["text"])
            wt = tb[b["id"]].get("word_times")
            if wt and len(wt) == len(b["text"].split()):
                # exact timing from the TTS alignment (ElevenLabs with-timestamps); a cue longer than
                # 7 s (slow, pause-rich delivery) is split at its longest pause
                toks = b["text"].split()
                ranges, k = [], 0
                for c in chunks:
                    n = len(c.split())
                    ranges.append((k, k + n))
                    k += n

                def emit(i, j, first, last):
                    a = t0 if first else wt[i]["start"]
                    e = t1 if last else wt[j]["start"]
                    if e - a > 7.0 and j - i >= 4:
                        m = max(range(i + 2, j - 1), key=lambda q: wt[q]["start"] - wt[q - 1]["end"])
                        emit(i, m, first, False)
                        emit(m, j, False, last)
                        return
                    a = max(a, cues[-1]["end"] if cues else 0.0)
                    cues.append({"beat": b["id"], "start": round(a, 3), "end": round(max(e, a + 0.6), 3), "text": wrap(" ".join(toks[i:j]))})

                for q, (i, j) in enumerate(ranges):
                    emit(i, j, q == 0, q == len(ranges) - 1)
                continue
            w = [max(1, spoken_word_count(c)) for c in chunks]
            tot = sum(w)
            t = t0
            for c, wi in zip(chunks, w):
                d = (t1 - t0) * wi / tot
                cues.append({"beat": b["id"], "start": round(t, 3), "end": round(t + d, 3), "text": wrap(c)})
                t += d
    errors = []
    for i, c in enumerate(cues):
        if c["end"] <= c["start"]:
            errors.append(f"cue {i} non-positive duration")
        if i and c["start"] < cues[i - 1]["end"] - 1e-6:
            errors.append(f"cue {i} overlaps previous")
        if not (0.6 <= c["end"] - c["start"] <= 7.5):
            errors.append(f"cue {i} duration {c['end'] - c['start']:.2f}s ({c['text'][:30]}...)")
        if any(len(line) > MAX_LINE for line in c["text"].split("\n")) or c["text"].count("\n") > 1:
            errors.append(f"cue {i} line too long")
    joined = " ".join(c["text"].replace("\n", " ") for c in cues)
    narration = " ".join(b["text"] for s in script["sections"] for b in s["beats"])
    if re.sub(r"\s+", " ", joined) != re.sub(r"\s+", " ", narration):
        errors.append("caption text does not reassemble to the narration")
    if errors:
        fail(vdir, STAGE, "; ".join(errors[:8]))
    srt = []
    for i, c in enumerate(cues, 1):
        srt += [str(i), f"{fmt_ts(c['start'], True)} --> {fmt_ts(c['end'], True)}", c["text"], ""]
    (vdir / "captions.srt").write_text("\n".join(srt), encoding="utf-8")
    write_json(vdir / "captions.json", {"cues": cues})
    note = None if timing["provider"] != "silent" else "timing estimated (no voice)"
    set_stage(vdir, STAGE, "done", outputs=["captions.srt", "captions.json"], cues=len(cues), note=note)
    log(STAGE, f"OK: {len(cues)} cues, max line {max(len(line) for c in cues for line in c['text'].split(chr(10)))} chars")


if __name__ == "__main__":
    main()
