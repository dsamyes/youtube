#!/usr/bin/env python3
"""Final render of the hole short, one chunk per shot, so a later fix only re-renders the shots it touched.

usage: scripts/toon-render.py [--force N,N,...] [--only N,N,...] [--keep] [--no-concat]
  --force N,N  render these shots again even if their chunk is up to date
  --only N,N   look at these shots only (the join still needs every chunk)
  --keep       a fix touched only the forced shots: keep every other complete chunk although the source is newer
               (their time stamp is refreshed, so the next plain run skips them too)

Reads the shot ranges from engine/videos/hole-through-earth/shots.json, renders shot N's frames a..b-1 to
out/hole/chunks/shot_NN.mp4, skips a chunk that already exists, has the right frame count and is newer than every file
in src/videos/hole/ (unless forced), checks each chunk with ffprobe, then joins them (stream copy) into
out/hole/video.mp4 (1935 frames, 1080x1920, 30 fps). Safe to stop and restart: a chunk is written to a temporary
name and renamed only when it is complete and verified.
"""
import json, os, subprocess, sys, time, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.normpath(os.path.join(ROOT, "..", "videos", "hole-through-earth", "shots.json"))
SRC = os.path.join(ROOT, "src", "videos", "hole")
OUT = os.path.join(ROOT, "out", "hole")
CHUNKS = os.path.join(OUT, "chunks")
ENTRY, COMP = "src/toon/hole-entry.tsx", "HoleShort"
CHROME = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"

def ids(flag):
    if flag not in sys.argv: return set()
    return {int(x) for x in sys.argv[sys.argv.index(flag) + 1].split(",") if x.strip()}

def probe(path):
    """(frames, width, height, fps) of the first video stream, or None"""
    try:
        r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries",
                            "stream=nb_read_frames,width,height,r_frame_rate", "-of", "json", path], capture_output=True, text=True, timeout=600)
        s = json.loads(r.stdout)["streams"][0]
        n, d = s["r_frame_rate"].split("/")
        return int(s["nb_read_frames"]), int(s["width"]), int(s["height"]), float(n) / float(d)
    except Exception:
        return None

def log(msg):
    line = time.strftime("%H:%M:%S ") + msg
    print(line, flush=True)
    with open(os.path.join(CHUNKS, "render_log.txt"), "a") as f: f.write(line + "\n")

def main():
    os.makedirs(CHUNKS, exist_ok=True)
    plan = json.load(open(SHOTS))
    shots, total, fps = plan["shots"], plan["total_frames"], plan["fps"]
    force, only, keep = ids("--force"), ids("--only"), "--keep" in sys.argv
    newest = max(os.path.getmtime(p) for p in glob.glob(os.path.join(SRC, "*")))
    env = dict(os.environ)
    env.setdefault("REMOTION_CHROME", CHROME)
    t_all, rendered, bad = time.time(), 0, []
    for s in shots:
        n, a, b = s["id"], s["a"], s["b"]
        out = os.path.join(CHUNKS, "shot_%02d.mp4" % n)
        want = b - a
        if only and n not in only: continue
        if n not in force and os.path.exists(out) and (keep or os.path.getmtime(out) > newest):
            p = probe(out)
            if p and p[0] == want:
                if keep: os.utime(out, None)
                log("shot %02d  frames %d-%d  %s" % (n, a, b - 1, "kept" if keep else "up to date")); continue
        tmp = os.path.join(CHUNKS, "shot_%02d.part.mp4" % n)
        if os.path.exists(tmp): os.remove(tmp)
        cmd = ["npx", "remotion", "render", ENTRY, COMP, tmp, "--frames=%d-%d" % (a, b - 1), "--public-dir=public-toon", "--codec", "h264",
               "--crf", "16", "--jpeg-quality", "95", "--concurrency=4", "--timeout=180000", "--muted", "--log=error"]
        ok = False
        for attempt in (1, 2):
            t0 = time.time()
            log("shot %02d  frames %d-%d  rendering (%d frames, attempt %d)" % (n, a, b - 1, want, attempt))
            r = subprocess.run(cmd, cwd=ROOT, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
            p = probe(tmp) if r.returncode == 0 and os.path.exists(tmp) else None
            if p and p[0] == want and p[1] == 1080 and p[2] == 1920 and abs(p[3] - fps) < 1e-6:
                os.replace(tmp, out); ok = True; rendered += want
                log("shot %02d  done in %.0f s (%.2f s/frame)" % (n, time.time() - t0, (time.time() - t0) / want)); break
            log("shot %02d  FAILED (exit %s, probe %s): %s" % (n, r.returncode, p, (r.stderr or "")[-400:].replace("\n", " | ")))
        if not ok: bad.append(n)
    log("rendered %d frames in %.1f min" % (rendered, (time.time() - t_all) / 60))
    if bad: log("chunks failed: %s" % bad); sys.exit(1)
    if "--no-concat" in sys.argv: return
    # every chunk present and right -> join
    lst = os.path.join(CHUNKS, "concat.txt")
    with open(lst, "w") as f:
        for s in shots:
            c = os.path.join(CHUNKS, "shot_%02d.mp4" % s["id"]); p = probe(c)
            if not p or p[0] != s["b"] - s["a"]: log("cannot join: shot %02d is missing or has %s frames" % (s["id"], p and p[0])); sys.exit(1)
            f.write("file '%s'\n" % c)
    video = os.path.join(OUT, "video.mp4"); tmpv = os.path.join(OUT, "video.part.mp4")
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-map", "0:v:0", "-c", "copy", "-movflags", "+faststart", tmpv], capture_output=True, text=True)
    p = probe(tmpv) if r.returncode == 0 else None
    if not p or p[0] != total or p[1] != 1080 or p[2] != 1920 or abs(p[3] - fps) > 1e-6:
        log("JOIN FAILED: %s %s" % (p, r.stderr[-300:])); sys.exit(1)
    os.replace(tmpv, video)
    log("video.mp4: %d frames, %dx%d, %g fps" % p)

main()
