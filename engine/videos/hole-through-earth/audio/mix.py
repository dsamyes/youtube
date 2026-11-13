# Final mix of "What If You Jumped Into a Hole Through the Earth?": the narration (gain only) + the original score
# (ducked under speech, per-section level automation relative to the voice) + the synthesized SFX stem (ducked too).
# The skill's standard mix: music +3 dB (bed about -10 LU under the voice instead of -13), SFX events -6 dB under
# their naive level (sfx.SFX_DB), voice unchanged. Master gain to -14 LUFS integrated, own 4x-oversampled
# look-ahead limiter for <= -1 dBTP, exactly T.TOTAL / T.FPS seconds at 48 kHz / stereo / 24-bit.
# Writes mix.wav + stem_voice/music/sfx.wav (same master gain AND limiter gain on each, so the stems sum to the mix)
# and cues.md (every SFX cue with its frame, the music map, loudness tables). verify.py then measures the files.
# Music and SFX render in two processes; everything is seeded, nothing is downloaded. Nothing is cached either,
# unless AUDIO_CACHE=dir is set while tuning the mix by hand (build_audio.py ignores it).
import os
import time
import json
import pickle
import subprocess
import numpy as np
from concurrent.futures import ProcessPoolExecutor
from scipy import ndimage, signal
from dsp import SR, ns, st, dbg, read_wav, write_wav, integrated, momentary, short_term, lra, true_peak
import timeline as T

HERE = os.path.dirname(os.path.abspath(__file__))
N = ns(T.DUR)                    # 3,096,000 samples = 64.500 s
TARGET_LUFS = -14.0
CEIL_DBTP = -1.2                 # limiter ceiling (spec: true peak <= -1 dBTP)
DUCK_DB = -3.0                   # music dip while the voice speaks (key = words.json, not the audio)
SFX_DUCK_DB = -2.0               # SFX dip while the voice speaks

# music level per section, LU relative to the voice in that section (after ducking). "+3 dB music" standard: around
# -10 instead of -13; the explanation and the night ocean are deliberately softer, the fall grows as he speeds up.
MUSIC_TARGET = {"sunday": -9.5, "fall1": -11.0, "fall2": -10.3, "fall3": -9.5, "explain": -11.5, "swing": -11.0,
                "lullaby": -11.5, "luckily": -11.5, "return": -9.5, "payoff": -9.5}

# music rides (first frame, last frame, dB): keep the punch lines on top of the busiest bars; the band blooms again after them
DIPS_F = [(232, 262, -2.0),      # "straight through the planet." (the premise) under the tune's top note
          (824, 858, -2.5),      # "It's a very good tunnel." under the fastest bars, right before the dead stop
          (1700, 1716, -2.5),    # "he's back" under the theme's return
          (1876, 1921, -3.0)]    # "every seventy-six minutes.": the last line; the button after it is at full level
DIPS = [(T.fr(a), T.fr(b), db) for a, b, db in DIPS_F if b <= T.TOTAL]

_s = lambda i: T.shot_t(i)
REPORT = [("hook (1)", *_s(1)), ("garden (2-6)", _s(2)[0], _s(6)[1]), ("fall, crust (7-8)", _s(7)[0], _s(8)[1]),
          ("fall, mantle+core (9-11)", _s(9)[0], _s(11)[1]), ("fall, core (12)", *_s(12)), ("but wait (13)", *_s(13)),
          ("explanation (14)", *_s(14)), ("swing (15)", *_s(15)), ("ocean, rise (16)", *_s(16)),
          ("luckily / unluckily (17-18)", _s(17)[0], _s(18)[1]), ("return (19)", *_s(19)), ("payoff (20-21)", _s(20)[0], T.DUR)]


def log(*a):
    print(f"[{time.strftime('%H:%M:%S')}]", *a, flush=True)


# ================================================================ voice
def load_voice():
    x, sr = read_wav(T.VOICE_WAV)
    assert sr == SR, sr
    v = x[0] if x.shape[0] == 1 else x.mean(0)
    out = np.zeros(N)
    out[: min(N, len(v))] = v[:N]
    return st(out)


def speech_spans(words, merge=0.3):
    sp = []
    for w in words:
        s, e = float(w["s"]), float(w["e"])
        if sp and s - sp[-1][1] < merge:
            sp[-1][1] = max(sp[-1][1], e)
        else:
            sp.append([s, e])
    return sp


def duck_db(spans, depth=DUCK_DB, pre=0.08, post=0.12, att=0.07, rel=0.45):
    ctrl = 1000
    nc = int(T.DUR * ctrl) + 2
    va = np.zeros(nc)
    for s, e in spans:
        va[max(0, int((s - pre) * ctrl)): int((e + post) * ctrl)] = 1.0
    ka, kr = 1 - np.exp(-1 / (att * ctrl)), 1 - np.exp(-1 / (rel * ctrl))
    env = np.zeros(nc)
    e = 0.0
    for i in range(nc):
        tgt = va[i]
        e += (tgt - e) * (ka if tgt > e else kr)
        env[i] = e
    return np.interp(np.arange(N) / SR, np.arange(nc) / ctrl, depth * env)


# ================================================================ music level automation
def section_db(m_ducked, v, secs, silent):
    gains = {}
    for name, a, b in secs:
        if name in silent:
            continue
        seg = slice(ns(a), ns(b))
        Lm, Lv = integrated(m_ducked[:, seg]), integrated(v[:, seg])
        gains[name] = float(Lv + MUSIC_TARGET[name] - Lm) if np.isfinite(Lm) and np.isfinite(Lv) else 0.0
    curve = np.zeros(N)
    t = np.arange(N) / SR
    nxt = None
    for name, a, b in reversed(secs):               # a silent section takes the gain of the section after it,
        if name in silent:                          # so every switch next to a silence happens inside the silence
            gains[name] = nxt if nxt is not None else 0.0
        nxt = gains[name]
    for name, a, b in secs:
        curve[t >= a] = gains[name]
    curve = ndimage.uniform_filter1d(curve, ns(0.4), mode="nearest")
    for a, b, db in DIPS:
        d = np.zeros(N)
        d[ns(a): ns(b)] = db
        curve += ndimage.uniform_filter1d(d, ns(0.12), mode="nearest")
    return curve, gains


# ================================================================ limiter
def peak_env(x):
    """per-sample peak of the 4x-oversampled signal (max over the two channels)"""
    n = x.shape[1]
    up = np.abs(signal.resample_poly(x, 4, 1, axis=-1)).max(0)
    return np.pad(up, (0, max(0, 4 * n - len(up))))[: 4 * n].reshape(n, 4).max(1)


def limiter_gain(pk, ceil_db=CEIL_DBTP, look=0.005, rel=0.08):
    """look-ahead min filter, one-pole release, centred smoothing -> gain curve for a signal with peak envelope pk"""
    c = dbg(ceil_db)
    n = len(pk)
    gr = np.minimum(1.0, c / np.maximum(pk, 1e-12))
    La = max(1, ns(look))
    g1 = ndimage.minimum_filter1d(gr, 2 * La + 1, mode="nearest")
    g2 = g1.copy()
    idx = np.flatnonzero(g1 < 1.0)
    if len(idx):
        # one-pole release, run only over clusters of reduced samples (elsewhere the gain is 1)
        kr = 1 - np.exp(-1 / (rel * SR))
        gap = ns(rel * 8)
        brk = np.flatnonzero(np.diff(idx) > gap)
        starts = np.concatenate([[idx[0]], idx[brk + 1]])
        ends = np.concatenate([idx[brk], [idx[-1]]])
        for a, b_ in zip(starts, ends):
            e = min(n, b_ + gap)
            seg = g1[a:e].tolist()
            out = [0.0] * len(seg)
            g = 1.0
            for k, s_ in enumerate(seg):
                g = g + (1 - g) * kr
                if s_ < g:
                    g = s_
                out[k] = g
            g2[a:e] = out
    g3 = ndimage.uniform_filter1d(g2, 2 * La + 1, mode="nearest")
    return np.minimum(g3, 1.0)


# ================================================================ report helpers
def lufs(x):
    v = integrated(x)
    return float(v) if np.isfinite(v) else -99.0


def section_table(v, m, s, words):
    Mv, Mb = momentary(v), momentary(m + s)
    tc = np.arange(len(Mv)) * 0.01 + 0.2                   # centre of each 400 ms window
    speak = np.zeros(len(tc), bool)                        # window centred on a spoken word, voice actually present
    for w in words:
        speak |= (tc >= float(w["s"]) + 0.03) & (tc <= float(w["e"]) - 0.03)
    speak &= Mv > lufs(v) - 10
    rows = []
    for name, a, b in REPORT:
        seg = slice(ns(a), ns(b))
        Lv, Lm, Ls, Lb = lufs(v[:, seg]), lufs(m[:, seg]), lufs(s[:, seg]), lufs(m[:, seg] + s[:, seg])
        k = speak & (tc >= a) & (tc < b) & np.isfinite(Mb) & (Mb > -70)
        p10 = float(np.percentile(Mv[k] - Mb[k], 10)) if k.sum() > 5 else float("nan")
        med = float(np.median(Mv[k] - Mb[k])) if k.sum() > 5 else float("nan")
        rows.append((name, a, b, Lv, Lm, Ls, Lb, Lv - Lb, p10, med))
    return rows


def ffmpeg_ebur(path):
    try:
        r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"],
                           capture_output=True, text=True, timeout=300)
        txt = r.stderr
        i = txt.rfind("Summary:")
        if i < 0:
            return "ffmpeg ebur128 gave no summary"
        out = []
        for line in txt[i:].splitlines():
            out.append(line.rstrip())
            if line.strip().startswith("Peak:"):
                break
        return chr(10).join(l for l in out if l)
    except Exception as e:  # noqa
        return f"ffmpeg not available for the cross-check ({type(e).__name__})"


# ================================================================ renders (each in its own process)
def render_music():
    import music
    b = music.build()
    out, levels = music.render(b, ref=-20.0)
    return out.astype(np.float32), sorted(b.cues), levels, music.SECTIONS, music.SILENT


def cue_rows(C):
    return [dict(t=c.t, f=c.t * T.FPS, name=c.name, desc=c.desc, kind=c.kind, naive=c.naive, applied=c.applied, measured=c.measured,
                 peak_db=c.peak_db, p=c.p, t0=c.t0, end=c.end, ir=c.ir, send=c.send,
                 ev_type=c.ev.type if c.ev is not None else "", ev_f=c.ev.f if c.ev is not None else None,
                 ev_to=c.ev.to if c.ev is not None else None) for c in C]


def render_sfx(v_ref):
    import sfx
    out, C = sfx.render(v_ref)
    return out.astype(np.float32), cue_rows(C), sfx.unmapped()


# ================================================================ main
def main():
    t_start = time.time()
    words = T.words()
    spans = speech_spans(words)
    v = load_voice()
    v_ref = integrated(v)
    log(f"voice: {v_ref:.2f} LUFS (as stereo), TP {true_peak(v):.2f} dBTP, {len(words)} words; {T.TOTAL} frames = {N} samples")

    cache = os.environ.get("AUDIO_CACHE")             # development aid only: reuse the raw renders while tuning the mix
    cm, cs = (os.path.join(cache, "music.pkl"), os.path.join(cache, "sfx.pkl")) if cache else (None, None)
    with ProcessPoolExecutor(2) as ex:
        fm = None if cm and os.path.exists(cm) else ex.submit(render_music)
        fs = None if cs and os.path.exists(cs) else ex.submit(render_sfx, v_ref)
        rm = fm.result() if fm else pickle.load(open(cm, "rb"))
        rs = fs.result() if fs else pickle.load(open(cs, "rb"))
    if cache:
        os.makedirs(cache, exist_ok=True)
        if fm:
            pickle.dump(rm, open(cm, "wb"))
        if fs:
            pickle.dump(rs, open(cs, "wb"))
    m_raw, m_cues, m_levels, secs, silent = rm
    s_raw, C, unmapped = rs
    m_raw, s_raw = m_raw.astype(np.float64), s_raw.astype(np.float64)
    log(f"rendered music ({lufs(m_raw):.2f} LUFS raw) and sfx ({lufs(s_raw):.2f} LUFS, {len(C)} cues) in {time.time() - t_start:.0f} s")
    if unmapped:
        log("WARNING: event types without a sound (neutral fallback used):", unmapped)

    # ---------------- music: duck under the voice, then per-section level relative to the voice
    m_d = m_raw * dbg(duck_db(spans))[None, :]
    sec_curve, sec_gains = section_db(m_d, v, secs, silent)
    m = m_d * dbg(sec_curve)[None, :]
    # ---------------- sfx: duck under the voice
    s_st = s_raw * dbg(duck_db(spans, SFX_DUCK_DB))[None, :]

    # ---------------- master
    mix0 = v + m + s_st
    pk0 = peak_env(mix0)
    G = TARGET_LUFS - lufs(mix0)
    for it in range(8):
        g3 = limiter_gain(pk0 * dbg(G))
        y = mix0 * (dbg(G) * g3)[None, :]
        L = lufs(y)
        log(f"master iter {it}: gain {G:+.2f} dB -> {L:.2f} LUFS, max GR {-20 * np.log10(g3.min()):.2f} dB")
        if abs(L - TARGET_LUFS) < 0.02:
            break
        G += TARGET_LUFS - L
    tail = np.ones(N)
    k = ns(0.03)
    tail[-k:] = 0.5 + 0.5 * np.cos(np.pi * np.linspace(0, 1, k))
    mg = dbg(G) * g3 * tail                          # one gain curve for the mix and for every stem
    y = mix0 * mg[None, :]
    gv, gm, gs = v * mg[None, :], m * mg[None, :], s_st * mg[None, :]
    assert y.shape == (2, N)
    for name, x in (("mix", y), ("stem_voice", gv), ("stem_music", gm), ("stem_sfx", gs)):
        assert np.abs(x).max() < 1.0, (name, np.abs(x).max())
        write_wav(os.path.join(HERE, name + ".wav"), x)
    log("wrote mix + stems")

    # ---------------- measure
    I, TP, LRA = lufs(y), true_peak(y), lra(y)
    Mmax, Smax = float(np.max(momentary(y))), float(np.max(short_term(y)))
    grdb = -20 * np.log10(g3)
    gr_stats = dict(max=float(grdb.max()), pct_over_0_5=float((grdb > 0.5).mean() * 100), pct_over_0_1=float((grdb > 0.1).mean() * 100),
                    pct_over_3=float((grdb > 3).mean() * 100))
    peaks = {k_: float(20 * np.log10(np.abs(x).max() + 1e-12)) for k_, x in (("voice", gv), ("music", gm), ("sfx", gs))}
    rows = section_table(gv, gm, gs, words)
    eb = ffmpeg_ebur(os.path.join(HERE, "mix.wav"))
    stats = dict(I=I, TP=TP, LRA=LRA, Mmax=Mmax, Smax=Smax, G=float(G), gr=gr_stats, peaks=peaks, v_ref=float(v_ref),
                 voice_I=lufs(gv), music_I=lufs(gm), sfx_I=lufs(gs), sec_gains=sec_gains, m_levels=m_levels)
    log(json.dumps({k_: (round(v_, 2) if isinstance(v_, float) else v_) for k_, v_ in stats.items() if k_ not in ("gr", "peaks", "sec_gains", "m_levels")}))
    log("GR", {k_: round(v_, 2) for k_, v_ in gr_stats.items()}, "stem peaks dBFS", {k_: round(p, 2) for k_, p in peaks.items()})
    for r in rows:
        log(f"{r[0]:<28} voice {r[3]:6.1f}  music {r[4]:6.1f}  sfx {r[5]:6.1f}  bed {r[6]:6.1f}  margin {r[7]:5.1f}  speech med {r[9]:5.1f} p10 {r[8]:5.1f}")
    print(eb)
    write_cues(C, m_cues, stats, rows, eb, v_ref, G, unmapped)
    json.dump(dict(stats=stats, cues=C, music_cues=m_cues, sections=secs, silent=list(silent), unmapped=unmapped,
                   settings=dict(target_lufs=TARGET_LUFS, ceil_dbtp=CEIL_DBTP, duck_db=DUCK_DB, sfx_duck_db=SFX_DUCK_DB, music_target=MUSIC_TARGET)),
              open(os.path.join(HERE, "mix_report.json"), "w", encoding="utf-8"), indent=1)
    log(f"mix done in {time.time() - t_start:.0f} s")
    return stats


def write_cues(C, m_cues, st_, rows, eb, v_ref, G, unmapped):
    vI = st_["voice_I"]
    L = []
    w = L.append
    w("# What If You Jumped Into a Hole Through the Earth? - soundtrack cue sheet")
    w("")
    w("All sound is original and synthesized in numpy/scipy (no samples): `sfx_gen.py` / `instruments.py` make the sounds, "
      "`sfx.py` / `music.py` place them on the frames of `../shots.json` (read by `timeline.py`), `mix.py` mixes, `verify.py` measures. "
      "Rebuild everything with `python build_audio.py`.")
    w("Voice = `../voice/voice.wav`, gain only (no EQ, no compression, no pitch); the master limiter is the only dynamics.")
    w("")
    w("## Files")
    w("| file | content |")
    w("|---|---|")
    w(f"| `mix.wav` | final mix, 48 kHz, stereo, 24-bit, {N:,} samples = {T.TOTAL} frames at {T.FPS} fps = {T.DUR:.3f} s |")
    w("| `stem_voice.wav` / `stem_music.wav` / `stem_sfx.wav` | stems with the mix's master gain and limiter gain (they sum to the mix) |")
    w("| `cues.md` | this sheet (written by `mix.py`, the verification block at the end by `verify.py`) |")
    w("| `mix_report.json` / `verify.json` | the same numbers as data (levels of every cue, section gains, every measurement) |")
    w("")
    w("## Master loudness (own BS.1770-4 meter)")
    w(f"- Integrated **{st_['I']:.1f} LUFS**, true peak **{st_['TP']:.1f} dBTP**, LRA {st_['LRA']:.1f} LU, "
      f"max momentary {st_['Mmax']:.1f} LUFS, max short-term {st_['Smax']:.1f} LUFS")
    w(f"- Stems: voice {st_['voice_I']:.1f} LUFS, music {st_['music_I']:.1f} LUFS, sfx {st_['sfx_I']:.1f} LUFS "
      f"(master gain {G:+.2f} dB on everything; the voice file itself is {v_ref:.1f} LUFS)")
    gr = st_["gr"]
    w(f"- Master limiter (4x oversampled look-ahead, ceiling {CEIL_DBTP} dBTP): max gain reduction {gr['max']:.2f} dB, "
      f"active (>0.1 dB) on {gr['pct_over_0_1']:.2f} % of samples, >0.5 dB on {gr['pct_over_0_5']:.2f} %, >3 dB on {gr['pct_over_3']:.3f} %")
    w("")
    w("ffmpeg ebur128 cross-check:")
    w("```")
    w(eb)
    w("```")
    w("")
    w("## Voice on top: per-section loudness (LUFS, integrated per stem, at mix gain)")
    w("bed = music + sfx. margin = voice - bed (integrated over the section). speech median / p10 = median and 10th percentile of "
      "the 400 ms momentary margin (voice - bed) over windows centred on spoken words.")
    w("")
    w("| section (shots) | frames | voice | music | sfx | bed | margin LU | speech median LU | speech p10 LU |")
    w("|---|---|---|---|---|---|---|---|---|")
    for r in rows:
        f = lambda x: "-" if x <= -98 else f"{x:.1f}"
        w(f"| {r[0]} | {r[1] * T.FPS:.0f}-{r[2] * T.FPS:.0f} | {f(r[3])} | {f(r[4])} | {f(r[5])} | {f(r[6])} | {r[7]:.1f} | {r[9]:.1f} | {r[8]:.1f} |")
    w("")
    w("## Music map (original score: one 4-bar tune in F major, varied by every section)")
    w("The tune (clarinet, swung): `C A C F- D C | D Bb D G- F E | F A C'- A F D E | F`. "
      f"Music level per section, LU under the voice (after a {DUCK_DB:+.0f} dB speech duck keyed from words.json): " +
      ", ".join(f"{k} {v:+.1f}" for k, v in MUSIC_TARGET.items()) + ". Applied section gains (dB): " +
      ", ".join(f"{k} {v:+.1f}" for k, v in st_["sec_gains"].items()) + ".")
    if DIPS:
        w("")
        w("Rides (music only, dB): " + ", ".join(f"f{a * T.FPS:.0f}-{b * T.FPS:.0f} {db:+.1f}" for a, b, db in DIPS) +
          " - the punch lines stay on top of the busiest bars, the band blooms again after them.")
    w("")
    w("| frame | time s | music |")
    w("|---|---|---|")
    w("| 0 | 0.00 | (no music under the hook: the falling rush only) |")
    for t, d in m_cues:
        w(f"| {t * T.FPS:.1f} | {t:.2f} | {d} |")
    w("")
    w("## SFX cues (every event of shots.json, in frame order)")
    w(f"Level convention: every EVENT has a naive level (LU vs the voice stem, as the event's max momentary loudness); "
      f"applied = naive - 6 dB (standard mix rule). BEDS are integrated loudness, not reduced. Both are then ducked {SFX_DUCK_DB:+.0f} dB "
      f"while the narrator speaks. 'mix LUFS' = the cue's level in the final mix before that duck (voice stem = {vI:.1f} LUFS integrated). "
      f"Reverb by place: tunnel (shaft), open air (garden, park, ocean), void (earth cutaway). The white flash (f{T.FLASH_F}) and the "
      f"record stop cut everything that was sounding before them.")
    if unmapped:
        w("")
        w("**Event types without a sound of their own (neutral fallback used): " + ", ".join(unmapped) + "**")
    w("")
    w("| # | frame | to | time s | cue | what | naive LU | applied LU | mix LUFS | pan |")
    w("|---|---|---|---|---|---|---|---|---|---|")
    for i, c in enumerate(sorted(C, key=lambda c: (c["t"], c["name"]))):
        kind = " (bed)" if c["kind"] == "bed" else ""
        meas = c["measured"] if c["measured"] is not None else c["applied"]
        to = f"{c['ev_to']:g}" if c["ev_to"] is not None and c["name"] == c["ev_type"] else ""
        w(f"| {i + 1} | {c['f']:g} | {to} | {c['t']:.3f} | {c['name']}{kind} | {c['desc']} | {c['naive']:+.1f} | {c['applied']:+.1f} | {v_ref + G + meas:.1f} | {c['p']:+.2f} |")
    w("")
    open(os.path.join(HERE, "cues.md"), "w", encoding="utf-8").write("\n".join(L))


if __name__ == "__main__":
    main()
