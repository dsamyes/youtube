#!/usr/bin/env python3
"""Render a cartoon short (src/toon/kit), one resumable chunk per shot.

usage: scripts/toon-render.py <id> [--part i/n] [--scale s] [--force N,N] [--only N,N] [--keep]
                                   [--no-concat] [--concat-only] [--dry] [--concurrency N]

  <id>           the video: src/videos/<id>/entry.tsx (composition "Short") and engine/videos/<id>/shots.json
  --part i/n     render only the i-th of n groups of shots (1-based). The groups are balanced by estimated cost
                 (frames x a weight per place + a start-up cost per chunk) and depend on shots.json alone, so n
                 parallel jobs cover every shot exactly once. Implies --no-concat.
  --scale s      low-resolution proxy (0.25 -> 270x480): chunks go to out/<id>/proxy/, the joined file is
                 out/<id>/proxy/video.mp4. The WebGL buffer, the card drawings and the bloom shrink with it: about
                 6x faster than the final, same motion, same colours within 2 %.
  --force N,N    render these shots again even if their chunk is up to date
  --only N,N     look at these shots only (the join still needs every chunk)
  --keep         keep every complete chunk although the source is newer (their time stamp is refreshed)
  --no-concat    render chunks only
  --concat-only  render nothing: check the chunks (rendered here or by other jobs) and join them
  --dry          print the plan (groups, estimated minutes, what would render) and stop
  --concurrency  browser tabs per chunk (default 4)

Output: out/<id>/chunks/shot_NN.mp4 and out/<id>/video.mp4 (1080x1920, 30 fps, silent). A chunk is skipped when it
exists, has the right frame count and is newer than every code file in src/videos/<id>/ and src/toon/kit/ and than shots.json. A
chunk is written to a temporary name and renamed only when complete and verified, so the script is safe to stop and
start again. Log: <chunk dir>/render_log.txt.
Browser: $REMOTION_CHROME when it is an existing file, else the headless shell under /opt/pw-browsers when there is
one, else Remotion's own bundled shell (CI sets REMOTION_CHROME=bundled). WebGL: $REMOTION_GL, default swangle.
"""
import glob, json, os, subprocess, sys, time

import signal
if hasattr(signal, "SIGPIPE"): signal.signal(signal.SIGPIPE, signal.SIG_DFL)  # quiet exit when piped into head
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# seconds per frame at 1080x1920 with software WebGL on 4 vCPU (fitted to the hole short's final render, 4 tabs; a
# garden or ocean shot with depth of field costs about 1.5x a sharp one, the weight is the mix), and the start-up of
# one chunk (bundle + browser + building the place)
WEIGHT = {"shaft": 1.8, "earth": 1.4, "garden": 3.3, "park": 3.4, "ocean": 2.2}
WEIGHT_OTHER, STARTUP = 3.0, 30.0

def arg(flag, default=None):
    return sys.argv[sys.argv.index(flag) + 1] if flag in sys.argv else default

def ids(flag):
    return {int(x) for x in (arg(flag) or "").split(",") if x.strip()}

def chrome():
    e = os.environ.get("REMOTION_CHROME", "")
    if e and os.path.isfile(e): return e
    for p in sorted(glob.glob("/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell"), reverse=True):
        if os.path.isfile(p): return p
    return None

def cost(s):
    """estimated seconds to render one shot at full size"""
    return (s["b"] - s["a"]) * WEIGHT.get(s["place"], WEIGHT_OTHER) + STARTUP

def groups(shots, n):
    """n groups of shot ids, balanced by cost: biggest shot first into the lightest group (ties: lower index)"""
    g = [[] for _ in range(n)]; load = [0.0] * n
    for s in sorted(shots, key=lambda s: (-cost(s), s["id"])):
        k = min(range(n), key=lambda i: (load[i], i))
        g[k].append(s["id"]); load[k] += cost(s)
    return [sorted(x) for x in g], load

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

def main():
    if len(sys.argv) < 2 or sys.argv[1].startswith("-"): print(__doc__); sys.exit(2)
    vid = sys.argv[1]
    plan_path = os.path.normpath(os.path.join(ROOT, "..", "videos", vid, "shots.json"))
    entry = os.path.join("src", "videos", vid, "entry.tsx")
    if not os.path.exists(plan_path): sys.exit("no %s" % plan_path)
    if not os.path.exists(os.path.join(ROOT, entry)): sys.exit("no %s" % entry)
    plan = json.load(open(plan_path))
    shots, total, fps = plan["shots"], plan["total_frames"], plan.get("fps", 30)
    scale = float(arg("--scale", "1"))
    W, H = 1080 * scale, 1920 * scale
    if abs(W - round(W)) > 1e-6 or abs(H - round(H)) > 1e-6 or round(W) % 2 or round(H) % 2: sys.exit("--scale %g gives %gx%g: both must be even whole numbers (try 0.25, 0.5, 0.75)" % (scale, W, H))
    W, H = round(W), round(H)
    proxy = scale != 1
    out = os.path.join(ROOT, "out", vid, "proxy") if proxy else os.path.join(ROOT, "out", vid)
    chunks = out if proxy else os.path.join(out, "chunks")
    os.makedirs(chunks, exist_ok=True)
    force, only, keep, dry = ids("--force"), ids("--only"), "--keep" in sys.argv, "--dry" in sys.argv
    concat_only, no_concat = "--concat-only" in sys.argv, "--no-concat" in sys.argv
    conc = arg("--concurrency", os.environ.get("TOON_CONCURRENCY", "4"))

    def log(msg):
        line = time.strftime("%H:%M:%S ") + msg
        print(line, flush=True)
        if not dry:
            with open(os.path.join(chunks, "render_log.txt"), "a") as f: f.write(line + "\n")

    # ---- which shots this run looks at ----
    mine = {s["id"] for s in shots}
    part = arg("--part")
    if part:
        i, n = (int(x) for x in part.split("/"))
        if not 1 <= i <= n: sys.exit("--part i/n needs 1 <= i <= n")
        g, load = groups(shots, n)
        k = (0.18 if scale <= 0.25 else 0.4) if proxy else 1  # measured: a 0.25 proxy frame costs about a sixth of a full one
        for j in range(n):
            est = sum((cost(s) - STARTUP) * k + STARTUP * 0.6 for s in shots if s["id"] in g[j]) / 60 if proxy else load[j] / 60
            print("%s part %d/%d: shots %s  (%d frames, about %.0f min)" % ("->" if j == i - 1 else "  ", j + 1, n, ",".join(map(str, g[j])) or "-",
                  sum(s["b"] - s["a"] for s in shots if s["id"] in g[j]), est), flush=True)
        mine = set(g[i - 1]); no_concat = True
    if only: mine &= only
    src = [p for d in (os.path.join(ROOT, "src", "videos", vid), os.path.join(ROOT, "src", "toon", "kit")) for p in glob.glob(os.path.join(d, "**", "*"), recursive=True)
           if os.path.isfile(p) and p.endswith((".ts", ".tsx", ".js", ".json"))]
    newest = max([os.path.getmtime(p) for p in src] + [os.path.getmtime(plan_path)])
    exe = chrome()
    env = dict(os.environ)
    env["REMOTION_CHROME"] = exe or "bundled"
    env.setdefault("REMOTION_GL", "swangle")
    if dry or not concat_only: print("browser: %s   gl: %s   size: %dx%d   chunks: %s" % (exe or "Remotion's bundled shell", env["REMOTION_GL"], W, H, os.path.relpath(chunks, ROOT)), flush=True)

    t_all, rendered, bad, serve = time.time(), 0, [], None
    for s in shots:
        n, a, b = s["id"], s["a"], s["b"]
        if n not in mine or concat_only: continue
        dst = os.path.join(chunks, "shot_%02d.mp4" % n)
        want = b - a
        if n not in force and os.path.exists(dst) and (keep or os.path.getmtime(dst) > newest):
            p = probe(dst)
            if p and p[0] == want and p[1] == W and p[2] == H:
                if keep and not dry: os.utime(dst, None)
                log("shot %02d  frames %d-%d  %s" % (n, a, b - 1, "kept" if keep else "up to date")); continue
        if dry: log("shot %02d  frames %d-%d  %s  would render (%d frames)" % (n, a, b - 1, s["place"], want)); continue
        tmp = os.path.join(chunks, "shot_%02d.part.mp4" % n)
        if os.path.exists(tmp): os.remove(tmp)
        if serve is None:  # bundle once per run; every chunk renders from that bundle (saves the bundling of each chunk)
            bdir = os.path.join(chunks, "bundle")
            t0 = time.time()
            r = subprocess.run(["npx", "remotion", "bundle", entry, "--out-dir=%s" % bdir, "--public-dir=public-toon", "--log=error"], cwd=ROOT, env=env, capture_output=True, text=True)
            serve = bdir if r.returncode == 0 and os.path.exists(os.path.join(bdir, "index.html")) else entry
            log("bundle %s in %.0f s" % ("ready" if serve == bdir else "FAILED, each chunk bundles itself: " + (r.stderr or r.stdout)[-300:].replace("\n", " | "), time.time() - t0))
        cmd = ["npx", "remotion", "render", serve, "Short", tmp, "--frames=%d-%d" % (a, b - 1), "--public-dir=public-toon", "--codec", "h264",
               "--crf", "20" if proxy else "16", "--jpeg-quality", "80" if proxy else "95", "--concurrency=%s" % conc, "--timeout=180000", "--muted", "--log=error",
               "--gl=%s" % env["REMOTION_GL"]]
        if proxy:
            # the WebGL buffer, the card drawings and the bloom chain shrink with the output (their full-size cost is
            # fixed, so without this a proxy is only 3x faster than the final)
            post = {"dpr": scale, "cards": min(1, max(0.25, 2 * scale)), "bloomBase": 480 if scale <= 0.25 else 960 if scale <= 0.5 else 1920}
            cmd += ["--scale=%g" % scale, "--props=%s" % json.dumps({"post": post})]
        ok = False
        for attempt in (1, 2):
            t0 = time.time()
            log("shot %02d  frames %d-%d  rendering (%d frames, attempt %d)" % (n, a, b - 1, want, attempt))
            r = subprocess.run(cmd, cwd=ROOT, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
            p = probe(tmp) if r.returncode == 0 and os.path.exists(tmp) else None
            if p and p[0] == want and p[1] == W and p[2] == H and abs(p[3] - fps) < 1e-6:
                os.replace(tmp, dst); ok = True; rendered += want
                log("shot %02d  done in %.0f s (%.2f s/frame)" % (n, time.time() - t0, (time.time() - t0) / want)); break
            log("shot %02d  FAILED (exit %s, probe %s): %s" % (n, r.returncode, p, (r.stderr or "")[-600:].replace("\n", " | ")))
        if not ok: bad.append(n)
    if dry: return
    if not concat_only: log("rendered %d frames in %.1f min" % (rendered, (time.time() - t_all) / 60))
    if bad: log("chunks failed: %s" % bad); sys.exit(1)
    if no_concat: return
    # ---- every chunk present and right -> join (stream copy) ----
    lst = os.path.join(chunks, "concat.txt")
    with open(lst, "w") as f:
        for s in shots:
            c = os.path.join(chunks, "shot_%02d.mp4" % s["id"]); p = probe(c)
            if not p or p[0] != s["b"] - s["a"] or p[1] != W or p[2] != H:
                log("cannot join: shot %02d is missing or wrong (%s; want %d frames at %dx%d)" % (s["id"], p, s["b"] - s["a"], W, H)); sys.exit(1)
            f.write("file '%s'\n" % c)
    video = os.path.join(out, "video.mp4"); tmpv = os.path.join(out, "video.part.mp4")
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-map", "0:v:0", "-c", "copy", "-movflags", "+faststart", tmpv], capture_output=True, text=True)
    p = probe(tmpv) if r.returncode == 0 else None
    if not p or p[0] != total or p[1] != W or p[2] != H or abs(p[3] - fps) > 1e-6:
        log("JOIN FAILED: %s %s" % (p, r.stderr[-300:])); sys.exit(1)
    os.replace(tmpv, video)
    log("%s: %d frames, %dx%d, %g fps" % ((os.path.relpath(video, ROOT),) + p))

main()
