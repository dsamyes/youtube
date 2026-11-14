#!/usr/bin/env python3
"""Cartoon-short finishing: mux picture + sound, write captions, run the skill's frame-by-frame QA.

  python toon/finish.py <video_id> [--video remotion/out/<name>/video.mp4]

Inputs : the silent Remotion render, videos/<id>/audio/mix.wav, voice/words.json, shots.json
Outputs: videos/<id>/final/<id>.mp4 (H.264 + AAC), captions.srt, final/qa/report.md + contact sheets
"""
from __future__ import annotations
import argparse, json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def srt_time(t: float) -> str:
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def write_srt(words: list[dict], path: Path, max_words: int = 6, max_chars: int = 34) -> int:
    cues, cur = [], []
    def flush():
        if cur: cues.append(list(cur)); cur.clear()
    for i, w in enumerate(words):
        if cur and (w["line"] != cur[-1]["line"] or len(cur) >= max_words or len(" ".join(x["w"] for x in cur) + " " + w["w"]) > max_chars):
            flush()
        cur.append(w)
        if w["w"][-1] in ".?!":
            flush()
    flush()
    out = []
    for n, c in enumerate(cues, 1):
        end = min(c[-1]["e"] + 0.08, cues[n][0]["s"] - 0.01) if n < len(cues) else c[-1]["e"] + 0.3
        out.append(f"{n}\n{srt_time(c[0]['s'])} --> {srt_time(max(end, c[0]['s'] + 0.2))}\n{' '.join(x['w'] for x in c)}\n")
    path.write_text("\n".join(out), encoding="utf-8")
    return len(cues)

def main() -> None:
    ap = argparse.ArgumentParser(); ap.add_argument("video_id"); ap.add_argument("--video"); ap.add_argument("--no-qa", action="store_true")
    a = ap.parse_args()
    vdir = ROOT / "videos" / a.video_id
    shots = json.loads((vdir / "shots.json").read_text())
    video = Path(a.video) if a.video else ROOT / "remotion" / "out" / a.video_id / "video.mp4"
    mix = vdir / "audio" / "mix.wav"
    for p in (video, mix):
        if not p.exists(): sys.exit(f"[finish] missing {p}")
    final = vdir / "final"; final.mkdir(exist_ok=True)
    out = final / f"{a.video_id}.mp4"
    # Remotion writes a silent audio track: take the picture from input 0 and the sound from input 1 only
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-i", str(mix), "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-movflags", "+faststart", "-shortest", str(out)], check=True)
    n = write_srt(json.loads((vdir / "voice" / "words.json").read_text()), vdir / "captions.srt")
    print(f"[finish] {out} ({out.stat().st_size / 1e6:.1f} MB), {n} caption cues")
    if a.no_qa: return
    fl = shots.get("flash_at", [])                      # optional: one frame or a list of frames with a white flash
    flashes = [fl] if isinstance(fl, int) else list(fl or [])
    qa_meta = {"shots": [{"id": s["id"], "a": s["a"], "b": s["b"]} for s in shots["shots"]],
               "planned": [[f, f + 4] for f in flashes],
               "xfade": [[next(s["a"] for s in shots["shots"] if s["id"] == int(k)) - v // 2, next(s["a"] for s in shots["shots"] if s["id"] == int(k)) + v // 2] for k, v in shots.get("xfade", {}).items()]}
    (final / "qa").mkdir(exist_ok=True)
    (final / "qa" / "shots_qa.json").write_text(json.dumps(qa_meta))
    subprocess.run([sys.executable, str(Path(__file__).with_name("short_qa.py")), str(out), str(final / "qa"), str(final / "qa" / "shots_qa.json")], check=True)

if __name__ == "__main__":
    main()
