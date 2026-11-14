#!/usr/bin/env python3
"""The gate a new cartoon short must pass before it is rendered: is everything there, and does it agree?

  python toon/check.py <video_id> [--final]

Without --final (end of the authoring session, and again by trusted code right after it):
  topic, facts, script, voice, shot plan, sound, picture source, metadata and ledger entry exist, have the right
  shape, and agree with each other (word counts, durations, frame ranges, event frames, title length ...).
With --final (after the full render and mux): the finished mp4 has the right size, length and loudness, and the
  frame-by-frame report shows no black frames, no unplanned white frames and no frozen stretch.
Prints every problem it finds, then "check OK" (exit 0) or "check FAILED: n problem(s)" (exit 1).
"""
from __future__ import annotations
import json, re, subprocess, sys, wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ID_RE = re.compile(r"^[a-z0-9][a-z0-9-]{2,40}$")
errs: list[str] = []
warns: list[str] = []


def err(m: str) -> None: errs.append(m)
def warn(m: str) -> None: warns.append(m)


def load(p: Path, what: str):
    if not p.exists():
        err(f"{what}: missing {p.relative_to(ROOT)}"); return None
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:
        err(f"{what}: {p.relative_to(ROOT)} is not valid JSON ({e})"); return None


def wav_seconds(p: Path) -> float | None:
    try:
        with wave.open(str(p), "rb") as w:
            return w.getnframes() / w.getframerate()
    except Exception:
        return None


def words_of(text: str) -> int:
    return len(re.findall(r"[A-Za-z0-9][A-Za-z0-9'’.,-]*", text))


def check_authoring(vid: str, vdir: Path) -> None:
    # topic ---------------------------------------------------------------------------------------------
    topic = load(vdir / "topic.json", "topic")
    if topic:
        for k in ("question", "answer_in_one_line", "trend_basis", "why_this_one"):
            if not topic.get(k): err(f"topic.json: '{k}' is missing or empty")
        tb = topic.get("trend_basis")
        if not isinstance(tb, list) or not all(isinstance(x, dict) and x.get("source") and x.get("evidence") for x in tb or [{}]):
            err("topic.json: trend_basis must be a list of {source, evidence}")
    # facts ---------------------------------------------------------------------------------------------
    if not (vdir / "calc_video.py").exists(): err("facts: calc_video.py is missing")
    load(vdir / "calc.json", "facts")
    sm = vdir / "SCRIPT.md"
    if not sm.exists(): err("facts: SCRIPT.md is missing")
    elif not re.search(r"https?://|doi|\b(19|20)\d\d\b", sm.read_text(encoding="utf-8")): err("facts: SCRIPT.md names no source")
    # script --------------------------------------------------------------------------------------------
    script = load(vdir / "script.json", "script")
    lines: list[str] = []
    if script:
        v = script.get("voice") or {}
        if v.get("provider") != "kokoro": err("script.json: voice.provider must be 'kokoro' (the free voice)")
        lines = [l if isinstance(l, str) else str(l.get("text", "")) for l in script.get("lines", [])]
        n = sum(words_of(l) for l in lines)
        if not 14 <= len(lines) <= 18: err(f"script: {len(lines)} lines (want 14 to 18)")
        if not 200 <= n <= 250: err(f"script: {n} words (want 205 to 245)")
        if not any(re.search(r"\byou see\b", l, re.I) for l in lines): warn("script: no 'You see,' pivot")
        if re.search(r"\b(subscribe|like and|comment below|follow for)\b", " ".join(lines), re.I): err("script: contains a call to action")
        if re.search(r"\d", " ".join(lines)): err("script: write numbers as spoken words, no digits")
    # voice ---------------------------------------------------------------------------------------------
    words = load(vdir / "voice" / "words.json", "voice")
    vlines = load(vdir / "voice" / "lines.json", "voice")
    dur = wav_seconds(vdir / "voice" / "voice.wav")
    if dur is None: err("voice: voice/voice.wav is missing or unreadable (run toon/voice.py)")
    if words and dur:
        if not 55 <= dur <= 68: err(f"voice: {dur:.1f} s long (want 55 to 68)")
        wps = len(words) / dur
        if not 3.45 <= wps <= 3.95: err(f"voice: pace {wps:.2f} words/s (want 3.5 to 3.9)")
        if abs(words[-1]["e"] - dur) > 1.0: err("voice: words.json does not match voice.wav (run toon/voice.py again)")
        if any(b["s"] < a["s"] for a, b in zip(words, words[1:])): err("voice: words.json is not in time order")
        if lines and vlines and len(vlines.get("lines", [])) != len(lines): err("voice: lines.json is older than script.json (run toon/voice.py again)")
        if lines and vlines:
            for a, b in zip(lines, vlines.get("lines", [])):
                if a.strip() != str(b.get("text", "")).strip(): err("voice: lines.json text differs from script.json (run toon/voice.py again)"); break
    # shot plan -----------------------------------------------------------------------------------------
    plan = load(vdir / "shots.json", "shots")
    total = 0
    if plan:
        total, shots = int(plan.get("total_frames", 0)), plan.get("shots", [])
        if plan.get("fps") != 30: err("shots.json: fps must be 30")
        if not 16 <= len(shots) <= 24: err(f"shots.json: {len(shots)} shots (want 16 to 24)")
        at = 0
        for i, s in enumerate(shots, 1):
            miss = [k for k in ("id", "a", "b", "place", "what") if k not in s]
            if miss: err(f"shots.json: shot {i} lacks {miss}"); continue
            if s["id"] != i: err(f"shots.json: shot ids must count 1,2,3... (position {i} has id {s['id']})")
            if s["a"] != at: err(f"shots.json: shot {i} starts at {s['a']}, previous shot ends at {at}")
            if s["b"] - s["a"] < 12: err(f"shots.json: shot {i} is only {s['b'] - s['a']} frames")
            if s["place"] not in plan.get("places", {}): err(f"shots.json: shot {i} uses place '{s['place']}' that is not in 'places'")
            if len(str(s["what"])) < 40: err(f"shots.json: shot {i} 'what' does not describe the picture")
            at = s["b"]
        if at != total: err(f"shots.json: shots end at {at} but total_frames is {total}")
        if dur and not 0.2 <= total / 30 - dur <= 1.2: err(f"shots.json: total_frames gives {total / 30:.2f} s, the voice is {dur:.2f} s (want 0.3 to 1.0 s of tail)")
        if not 3 <= len(plan.get("places", {})) <= 6: warn(f"shots.json: {len(plan.get('places', {}))} places (3 to 5 is the sweet spot)")
        ev = plan.get("events", [])
        if len(ev) < 20: err(f"shots.json: only {len(ev)} sound events (the example has 55)")
        for e in ev:
            if not isinstance(e.get("f"), int) or not 0 <= e["f"] < max(total, 1) or not e.get("type"): err(f"shots.json: bad event {e}"); break
            if "to" in e and not e["f"] < e["to"] <= total: err(f"shots.json: bad event range {e}"); break
        for k in plan.get("xfade", {}):
            if not (k.isdigit() and 2 <= int(k) <= len(shots)): err(f"shots.json: xfade key '{k}' is not a shot id")
    # sound ---------------------------------------------------------------------------------------------
    adir = vdir / "audio"
    load(adir / "score.json", "sound")
    mix = wav_seconds(adir / "mix.wav")
    if mix is None: err("sound: audio/mix.wav is missing (run toon/audio/build.py)")
    elif total and abs(mix - total / 30) > 0.25: err(f"sound: mix.wav is {mix:.2f} s, the film is {total / 30:.2f} s (run toon/audio/build.py again)")
    ver = load(adir / "verify.json", "sound") if (adir / "verify.json").exists() else None
    if isinstance(ver, dict) and ver.get("ok") is False: err("sound: the last audio build failed its checks (see audio/cues.md)")
    for dep in (vdir / "shots.json", adir / "score.json", vdir / "voice" / "voice.wav"):
        if dep.exists() and (adir / "mix.wav").exists() and dep.stat().st_mtime > (adir / "mix.wav").stat().st_mtime + 1:
            err(f"sound: {dep.name} changed after the last audio build (run toon/audio/build.py again)")
    # picture source ------------------------------------------------------------------------------------
    pdir = ROOT / "remotion" / "src" / "videos" / vid
    entry = pdir / "entry.tsx"
    if not entry.exists(): err(f"picture: {entry.relative_to(ROOT)} is missing")
    elif not re.search(r"""id=["']Short["']""", entry.read_text(encoding="utf-8")): err("picture: entry.tsx must register the composition id \"Short\"")
    src = "".join(p.read_text(encoding="utf-8", errors="ignore") for p in pdir.glob("*.ts*")) if pdir.exists() else ""
    if pdir.exists() and len(src) < 8000: err("picture: the video folder is still close to the empty template")
    if re.search(r"https?://(?!www\.w3\.org)", src): err("picture: source code must not load anything from the network")
    if pdir.exists() and (ROOT / "remotion" / "node_modules").exists():
        r = subprocess.run(["npx", "tsc", "--noEmit", "-p", "tsconfig.toon.json"], cwd=ROOT / "remotion", capture_output=True, text=True)
        if r.returncode != 0:
            err("picture: type check fails (cd remotion && npx tsc --noEmit -p tsconfig.toon.json): " + " | ".join((r.stdout or r.stderr).strip().splitlines()[:3]))
    sheets = list((ROOT / "remotion" / "out" / vid / "sheets").glob("*.jpg"))
    if not sheets: err("picture: no contact sheets in remotion/out/<id>/sheets (run scripts/toon-sheet.py and look at them)")
    elif pdir.exists() and max(p.stat().st_mtime for p in sheets) < max(p.stat().st_mtime for p in pdir.glob("*.ts*")) - 1:
        warn("picture: the contact sheets are older than the picture code; look at the final state once more")
    # metadata ------------------------------------------------------------------------------------------
    md = load(vdir / "metadata.json", "metadata")
    if md:
        t = str(md.get("title", ""))
        if not 15 <= len(t) <= 60: err(f"metadata: title is {len(t)} characters (want 15 to 60)")
        if re.search(r"\b[A-Z]{4,}\b", t): err("metadata: no ALL CAPS words in the title")
        d = str(md.get("description", ""))
        if "Sources" not in d: err("metadata: description lacks the Sources block")
        if "computed in code and checked" not in d: err("metadata: description lacks the disclosure line")
        if len(d) > 4500: err("metadata: description is too long")
        tags = md.get("tags", [])
        if not (isinstance(tags, list) and 8 <= len(tags) <= 15 and sum(len(x) for x in tags) < 450): err("metadata: want 10 to 14 tags, under 450 characters in total")
        if str(md.get("categoryId")) != "28": err("metadata: categoryId must be \"28\"")
        if md.get("playlist") != "Shorts: 60-Second Ifs": err("metadata: playlist must be \"Shorts: 60-Second Ifs\"")
    # ledger --------------------------------------------------------------------------------------------
    led = load(ROOT / "toon" / "episodes.json", "ledger")
    if led:
        mine = [e for e in led.get("episodes", []) if e.get("id") == vid]
        if len(mine) != 1: err(f"ledger: toon/episodes.json has {len(mine)} entries for {vid} (want 1)")
        elif mine[0].get("status") not in ("produced", "published"): err("ledger: status must be 'produced'")
        elif not (mine[0].get("title") and mine[0].get("topic") and mine[0].get("trend")): err("ledger: entry needs title, topic and trend")
        prod = [e["id"] for e in led.get("episodes", []) if e.get("status") == "produced"]
        if len(prod) > 1: err(f"ledger: more than one episode has status 'produced': {prod}")


def check_final(vid: str, vdir: Path) -> None:
    plan = load(vdir / "shots.json", "shots") or {}
    total = int(plan.get("total_frames", 0))
    mp4 = vdir / "final" / f"{vid}.mp4"
    if not mp4.exists(): err(f"final: {mp4.relative_to(ROOT)} is missing"); return
    r = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_frames,sample_rate",
                        "-of", "json", str(mp4)], capture_output=True, text=True)
    try: streams = json.loads(r.stdout)["streams"]
    except Exception: err("final: ffprobe cannot read the mp4"); return
    v = next((s for s in streams if s["codec_type"] == "video"), None)
    a = next((s for s in streams if s["codec_type"] == "audio"), None)
    if not v or (v["width"], v["height"], v["r_frame_rate"]) != (1080, 1920, "30/1"): err(f"final: video stream is {v and (v['width'], v['height'], v['r_frame_rate'])}, want 1080x1920 at 30 fps")
    elif int(v["nb_read_frames"]) != total: err(f"final: {v['nb_read_frames']} frames, the plan has {total}")
    if not a: err("final: no audio stream")
    rep = vdir / "final" / "qa" / "report.md"
    if not rep.exists(): err("final: final/qa/report.md is missing"); return
    txt = rep.read_text(encoding="utf-8")
    m = re.search(r"LOUDNESS I:\s*(-?[\d.]+) LUFS.*?Peak:\s*(-?[\d.]+)", txt)
    if not m: err("final: no loudness line in the QA report")
    else:
        if not -15.5 <= float(m.group(1)) <= -12.5: err(f"final: loudness {m.group(1)} LUFS (want about -14)")
        if float(m.group(2)) > -0.5: err(f"final: audio peak {m.group(2)} dBFS (want -1 or lower)")
    if "SILENCES none" not in txt: warn("final: the QA report lists a silence")
    m = re.search(r"black (\[.*?\]); unplanned white (\[.*?\]); frozen spans[^\[]*(\[.*?\])", txt)
    if not m: err("final: no frame line in the QA report")
    else:
        black, white, frozen = (json.loads(x.replace("(", "[").replace(")", "]")) for x in m.groups())
        if black: err(f"final: black frames {black[:8]}")
        if white: err(f"final: unplanned white frames {white[:8]}")
        if frozen: err(f"final: frozen stretches {frozen[:8]}")
    m = re.search(r"POPS[^\n]*: (\[.*?\])", txt)
    if m and m.group(1) != "[]": warn(f"final: frame pops {m.group(1)[:120]}")


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 1 or not ID_RE.match(args[0]): sys.exit("usage: toon/check.py <video_id> [--final]")
    vid = args[0]; vdir = ROOT / "videos" / vid
    if not vdir.is_dir(): sys.exit(f"check FAILED: {vdir} does not exist")
    (check_final if "--final" in sys.argv else check_authoring)(vid, vdir)
    for w in warns: print(f"warning: {w}")
    for e in errs: print(f"PROBLEM: {e}")
    if errs: print(f"check FAILED: {len(errs)} problem(s)"); sys.exit(1)
    print("check OK")


if __name__ == "__main__":
    main()
