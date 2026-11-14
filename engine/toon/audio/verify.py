# The checks. Nobody listens in a headless build, so the written files are MEASURED: format and exact length,
# integrated loudness and true peak (own BS.1770-4 meter; mix.py adds an ffmpeg cross-check), clipping, stems = mix,
# the onset of every shots.json event in stem_sfx.wav, events chopped by a dead cut, the voice-to-bed level in the
# speech band while the narrator speaks, silence gaps, spectrum sanity, and the score's landmarks (it starts where
# the plan says, every 'silence' section is silent, the button sits on its frame).
# Writes verify.json ({"ok": true/false, "fails": [...], ...}) and appends a "Verification" block to cues.md.
# A FAIL names what to change in shots.json / score.json; the manual (README.md) says how to react to each.
import os
import json
import wave
import numpy as np
from scipy import signal
from dsp import SR, ns, dbg, read_wav, integrated, true_peak, lra, momentary
import music

TOL_F = 1.0                       # an event's onset must sit within one frame of its frame in shots.json
SPEECH_BAND = (300.0, 3000.0)
VOICE_MIN_DB = 6.0                # voice minus bed in the speech band while speaking, whole film
VOICE_MIN_SECTION_DB = 4.0        # ... and in every score section with at least a second of speech
ALIVE_MIN = 0.5                   # an event must keep at least half of its energy before the next dead cut / the end


def db(x):
    return 20 * np.log10(np.maximum(np.abs(x), 1e-12))


def pdb(p):
    return 10 * np.log10(np.maximum(p, 1e-24))


def load(P, name):
    p = os.path.join(P.out, name)
    with wave.open(p, "rb") as w:
        meta = dict(sr=w.getframerate(), ch=w.getnchannels(), bits=8 * w.getsampwidth(), frames=w.getnframes())
    x, _ = read_wav(p)
    return x, meta


# ---------------------------------------------------------------- onsets
EDGES = np.geomspace(100, 11000, 29)


def band_levels(x, hop=96, nper=1024):
    """band energies of a mono signal: 28 log-spaced bands 100 Hz - 11 kHz, 21 ms window, 2 ms hop; returns (times, power[bands, frames])"""
    f, t, Z = signal.stft(x, SR, "hann", nper, nper - hop, boundary=None, padded=False)
    P_ = np.abs(Z) ** 2
    B = np.stack([P_[(f >= lo) & (f < hi)].sum(0) for lo, hi in zip(EDGES[:-1], EDGES[1:])])
    return t, B


def check_onsets(P, stem_sfx, C, iso):
    """Two independent looks at where each event starts in the written SFX stem.
    matched: cross-correlation of the stem with the cue as it was rendered alone, over lags of +-3 frames, gives where
             the cue really sits; plus the cue's own 10 % rise time = its onset. Works for soft beds under louder
             sounds. This one decides.
    blind:   band-energy flux of the stem (rise of log energy over 6 ms, weighted with the bands the cue's first 30 ms
             live in); the first strong rise (>= half the largest one, >= 5x the local median) within +-3 frames of the
             event's frame, not searching past the midpoint to a neighbouring event. Reported: an event it cannot
             resolve is masked by something louder on the same frames."""
    N, F = P.n, P.fps
    S = stem_sfx.mean(0)
    lead = ns(0.1)                                           # 0.1 s of silence in front, so an onset at t = 0 is a rise too
    t, B = band_levels(np.pad(S, (lead, 0)))
    t = t - lead / SR
    floor = B.max() * 1e-8
    Ldb = pdb(B + floor)
    k = 3
    D = np.maximum(Ldb[:, k:] - Ldb[:, :-k], 0.0)           # (bands, frames) half-wave rectified rise over 6 ms
    tD = t[k:]
    main = [(c, i) for c, i in zip(C, iso) if c["ev_f"] is not None and c["name"] == c["ev_type"]]     # extra layers are not events
    ev_times = sorted({c["ev_f"] / F for c, _ in main} | {c["ev_to"] / F for c, _ in main if c["ev_to"] is not None and c["kind"] == "event"})
    rows = []
    for c, i in main:
        te = c["ev_f"] / F
        xm, t0, r10 = i["xm"].astype(np.float64), i["t0"], i["r10"]
        # ---- matched: lag of the stem against the isolated cue
        i0 = ns(t0)
        lagmax = ns(3 / F)
        a, z = i0 - lagmax, i0 + len(xm) + lagmax
        seg = S[max(a, 0): min(z, N)]
        seg = np.pad(seg, (max(0, -a), max(0, z - N)))
        cc = signal.correlate(seg, xm, mode="valid", method="fft")
        lag = int(np.argmax(cc)) - lagmax
        coh = float(cc.max() / (np.sqrt((xm ** 2).sum() * (seg[lagmax + lag: lagmax + lag + len(xm)] ** 2).sum()) + 1e-20))
        on_m = (i0 + lag) / SR + r10
        # ---- blind: weighted flux around the event's frame
        j0 = ns(r10)
        _, Bx = band_levels(np.pad(xm[j0: j0 + ns(0.03)], (512, 512)))        # the bands its first 30 ms live in
        w = Bx.sum(1)
        w = np.sqrt(w / (w.max() + 1e-30))
        w[w < 0.15] = 0.0
        o = (w[:, None] * D).sum(0) / (w.sum() + 1e-9)
        lo, hi = te - 3 / F, te + 3 / F
        for other in ev_times:                              # do not search into a neighbouring event
            if other < te - 1e-6 and te - other <= 6 / F:
                lo = max(lo, (te + other) / 2)
            if other > te + 1e-6 and other - te <= 6 / F:
                hi = min(hi, (te + other) / 2)
        m = (tD >= lo) & (tD <= hi)
        near = (tD >= te - 1.0) & (tD <= te + 1.0)
        om, med = o[m], float(np.median(o[near])) + 1e-9
        snr = float(om.max() / med)
        pk = int(np.argmax(om >= max(0.5 * om.max(), 5.0 * med))) if snr >= 5.0 else int(np.argmax(om))
        while pk + 1 < len(om) and om[pk + 1] > om[pk]:      # climb to the top of that first rise
            pk += 1
        on_b = float(tD[m][pk])
        rows.append(dict(type=c["ev_type"], f=c["ev_f"], to=c["ev_to"], kind=c["kind"], lag_samples=lag, coherence=round(coh, 3),
                         onset_matched_f=round(on_m * F, 2), err_matched_f=round((on_m - te) * F, 2),
                         onset_blind_f=round(on_b * F, 2), err_blind_f=round((on_b - te) * F, 2), blind_snr=round(min(snr, 999.0), 1),
                         blind_resolved=bool(snr >= 5.0), alive=round(i["alive"], 3), stop_f=round(i["stop_f"], 1)))
    return rows


# ---------------------------------------------------------------- level / gaps / spectrum
def speaking_mask(words, n_hop, hop):
    tc = (np.arange(n_hop) + 0.5) * hop / SR
    m = np.zeros(n_hop, bool)
    for w in words:
        m |= (tc >= float(w["s"])) & (tc <= float(w["e"]))
    return m, tc


def voice_to_bed(P, voice, bed, words, sections, lines):
    """voice level minus bed level in the speech band, only while the narrator is speaking (words.json + voice present)"""
    N, F = P.n, P.fps
    sos = signal.butter(4, SPEECH_BAND, "bandpass", fs=SR, output="sos")
    pv = (signal.sosfilt(sos, voice, axis=-1) ** 2).mean(0)
    pb = (signal.sosfilt(sos, bed, axis=-1) ** 2).mean(0)
    hop = ns(0.01)
    win = ns(0.4)
    c_v, c_b = np.concatenate([[0], np.cumsum(pv)]), np.concatenate([[0], np.cumsum(pb)])
    n_hop = N // hop
    fv = (c_v[hop::hop][:n_hop] - c_v[:-hop:hop][:n_hop]) / hop           # 10 ms frame powers
    fb = (c_b[hop::hop][:n_hop] - c_b[:-hop:hop][:n_hop]) / hop
    mask, tc = speaking_mask(words, n_hop, hop)
    mask &= pdb(fv) > pdb(fv[mask].mean()) - 30                          # voice really present in this frame
    out = {}

    def stat(sel):
        k = mask & sel
        if k.sum() < 20:
            return None
        diff = pdb(fv[k].mean()) - pdb(fb[k].mean())
        # distribution over 400 ms windows centred on speaking frames
        idx = np.flatnonzero(k)[::10]
        a = np.clip(idx * hop - win // 2, 0, N - win)
        dv = (c_v[a + win] - c_v[a]) / win
        dbd = (c_b[a + win] - c_b[a]) / win
        d = pdb(dv) - pdb(dbd)
        return dict(diff_db=round(float(diff), 2), median_db=round(float(np.median(d)), 2), p10_db=round(float(np.percentile(d, 10)), 2),
                    p90_db=round(float(np.percentile(d, 90)), 2), speaking_s=round(float(k.sum() * hop / SR), 2))
    out["overall"] = stat(np.ones(n_hop, bool))
    out["sections"] = []
    for name, a, b, _t in sections:
        s = stat((tc >= a) & (tc < b))
        if s:
            out["sections"].append(dict(name=name, f_a=round(a * F), f_b=round(b * F), **s))
    out["lines"] = []
    for l in lines:
        s = stat((tc >= float(l["s"])) & (tc < float(l["e"])))
        if s:
            out["lines"].append(dict(line=l.get("line"), text=str(l.get("text", ""))[:70], f_a=round(float(l["s"]) * F), f_b=round(float(l["e"]) * F), diff_db=s["diff_db"]))
    return out


def gaps(P, x, thr_db, min_s=0.5):
    """runs longer than min_s where the 50 ms RMS (louder channel) stays under thr_db dBFS -> [(frame_a, frame_b)]"""
    p = (x ** 2).max(0)
    w = ns(0.05)
    c = np.concatenate([[0], np.cumsum(p)])
    hop = ns(0.005)
    a = np.arange(0, P.n - w + 1, hop)
    r = pdb((c[a + w] - c[a]) / w)
    quiet = r < thr_db
    out, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            t0, t1 = a[i] / SR, (a[j - 1] + w) / SR
            if t1 - t0 > min_s:
                out.append((round(t0 * P.fps, 1), round(t1 * P.fps, 1)))
            i = j
        else:
            i += 1
    return out


def spectrum(x):
    f, P_ = signal.welch(x, SR, nperseg=16384, axis=-1)
    P_ = P_.sum(0)
    tot = P_.sum()
    bands = [(0, 20), (20, 60), (60, 300), (300, 3000), (3000, 8000), (8000, 12000), (12000, 16000), (16000, 24001)]
    return dict(dc_dbfs=round(float(db(np.abs(x.mean(1)).max())), 1),
                bands_db={f"{lo}-{hi if hi < 24000 else 24000} Hz": round(float(pdb(P_[(f >= lo) & (f < hi)].sum() / tot)), 1) for lo, hi in bands},
                above_12k_db=round(float(pdb(P_[f >= 12000].sum() / tot)), 1), below_20_db=round(float(pdb(P_[f < 20].sum() / tot)), 1),
                centroid_hz=round(float((f * P_).sum() / tot)))


def music_landmarks(P, plan, mus, fails, notes):
    """is the score where the plan says: silent in every 'silence' section, starting on the frame after each one,
    the button on its frame"""
    N, F, fr = P.n, P.fps, P.fr
    r = lambda fa, fb: float(pdb((mus[:, ns(fr(fa)): ns(fr(fb))] ** 2).mean() + 1e-30)) if fb > fa else -240.0
    e = np.abs(mus).max(0)
    k = ns(0.002)
    env = np.convolve(e, np.ones(k) / k, mode="same")
    loud = env > dbg(-50)
    rep = dict(rms_last_10ms_dbfs=round(float(pdb((mus[:, -ns(0.01):] ** 2).mean() + 1e-30)), 1), sections=[])
    if not loud.any():
        if any(not s.silent for s in plan.secs):
            fails.append("the score is silent although score.json has music sections")
        return rep
    rep["first_sound_f"] = round(float(np.argmax(loud)) / SR * F, 2)
    rep["last_sound_f"] = round(float(N - np.argmax(loud[::-1])) / SR * F, 2)
    t, B = band_levels(mus.mean(0))
    L = pdb(B + B.max() * 1e-8)
    o = np.maximum(L[:, 3:] - L[:, :-3], 0).sum(0)
    tD = t[3:]

    def onset_near(f0):
        m = (tD >= fr(f0 - 3)) & (tD <= fr(f0 + 3))
        return round(float(tD[m][np.argmax(o[m])] * F), 2) if m.any() else None
    secs = plan.secs
    first = next(s for s in secs if not s.silent)
    if abs(rep["first_sound_f"] - first.a) > TOL_F:
        fails.append(f"music: the first sound of the score is at frame {rep['first_sound_f']}, the plan starts it at {first.a:g}")
    for i, s in enumerate(secs):
        row = dict(section=s.name, f_a=s.a, f_b=s.z)
        if s.silent:
            choked = i > 0 and music.MOODS[secs[i - 1].mood].choke
            row["rms_dbfs"] = round(r(s.a + (5 if choked else 0.5), s.z - 0.5), 1)
            if row["rms_dbfs"] > -70:
                fails.append(f"music: section {s.name} (frames {s.a:g}-{s.z:g}) is not silent: {row['rms_dbfs']} dBFS")
        else:
            row["onset_f"] = onset_near(s.a)
            after_silence = i == 0 or secs[i - 1].silent
            if row["onset_f"] is not None and abs(row["onset_f"] - s.a) > TOL_F:
                (fails if after_silence else notes).append(f"music: section {s.name} should start on frame {s.a:g}; the strongest onset near it is at {row['onset_f']}")
            if s.mood == "finale":
                row["button_f"], row["button_onset_f"] = s.button, onset_near(s.button)
                if row["button_onset_f"] is None or abs(row["button_onset_f"] - s.button) > TOL_F:
                    fails.append(f"music: the button should sound on frame {s.button:g}; measured {row['button_onset_f']}")
        rep["sections"].append(row)
    return rep


# ---------------------------------------------------------------- main
def run(P, plan, mixed):
    """measure the files mix.run() wrote. Returns the list of failed checks (empty = all passed)."""
    N, F = P.n, P.fps
    rep, fails, notes = {}, [], list(plan.notes)
    files = {}
    for name in ("mix.wav", "stem_voice.wav", "stem_music.wav", "stem_sfx.wav"):
        x, meta = load(P, name)
        files[name] = x
        meta["peak_dbfs"] = round(float(db(np.abs(x).max())), 2)
        meta["full_scale_samples"] = int((np.abs(x) >= 1.0 - 2.0 ** -23).sum())
        rep.setdefault("files", {})[name] = meta
        if not (meta["sr"] == 48000 and meta["ch"] == 2 and meta["frames"] == N == round(P.total / P.fps * 48000)):
            fails.append(f"{name}: format/length {meta}")
        if meta["full_scale_samples"]:
            fails.append(f"{name}: {meta['full_scale_samples']} clipped samples")
    mix, voice, mus, sfxs = (files[k] for k in ("mix.wav", "stem_voice.wav", "stem_music.wav", "stem_sfx.wav"))
    bed = mus + sfxs
    words, st_ = P.words, mixed["stats"]

    I, TP = float(integrated(mix)), float(true_peak(mix))
    rep["loudness"] = dict(integrated_lufs=round(I, 2), true_peak_dbtp=round(TP, 2), lra_lu=round(float(lra(mix)), 2),
                           max_momentary_lufs=round(float(momentary(mix).max()), 2), sample_peak_dbfs=round(float(db(np.abs(mix).max())), 2),
                           voice_lufs=round(float(integrated(voice)), 2), music_lufs=round(float(integrated(mus)), 2), sfx_lufs=round(float(integrated(sfxs)), 2),
                           limiter=st_["gr"], master_gain_db=round(st_["G"], 2), voice_file_lufs=round(st_["v_ref"], 2))
    if abs(I + 14.0) > 0.2:
        fails.append(f"integrated loudness {I:.2f} LUFS (target -14.0 +- 0.2)")
    if TP > -1.0:
        fails.append(f"true peak {TP:.2f} dBTP (limit -1.0)")
    res = mix - (voice + mus + sfxs)
    rep["stems_sum_residual_db"] = round(float(pdb((res ** 2).mean() / (mix ** 2).mean())), 1)
    if rep["stems_sum_residual_db"] > -60:
        fails.append(f"the stems do not sum to the mix (residual {rep['stems_sum_residual_db']} dB)")
    rep["loudness"]["stem_true_peaks_dbtp"] = {k: round(float(true_peak(files[k])), 2) for k in ("stem_voice.wav", "stem_music.wav", "stem_sfx.wav")}

    rows = check_onsets(P, sfxs, mixed["cues"], mixed["iso"])
    n_ev = len([e for e in P.ev if not e.type.startswith("music_")])
    if len(rows) != n_ev:
        fails.append(f"{len(rows)} cues for {n_ev} non-music events")
    if rows:
        em = np.array([abs(r["err_matched_f"]) for r in rows])
        res_rows = [r for r in rows if r["blind_resolved"]]
        eb = np.array([abs(r["err_blind_f"]) for r in res_rows])
        rep["onsets"] = dict(events=len(rows), tolerance_frames=TOL_F,
                             matched_max_abs_err_f=round(float(em.max()), 2), matched_within_tol=int((em <= TOL_F).sum()),
                             matched_max_lag_samples=int(max(abs(r["lag_samples"]) for r in rows)),
                             blind_resolved=len(res_rows), blind_within_tol=int((eb <= TOL_F).sum()), blind_max_abs_err_f=round(float(eb.max()), 2) if len(eb) else None,
                             blind_unresolved=[f"{r['type']}@{r['f']:g}" for r in rows if not r["blind_resolved"]], rows=rows)
        if (em > TOL_F).any():
            fails.append("event onsets off by more than a frame: " + ", ".join(f"{r['type']}@{r['f']:g} {r['err_matched_f']:+.2f}" for r in rows if abs(r["err_matched_f"]) > TOL_F))
        off = [r for r in res_rows if abs(r["err_blind_f"]) > TOL_F]
        rep["onsets"]["blind_off"] = [f"{r['type']}@{r['f']:g} {r['err_blind_f']:+.2f} (snr {r['blind_snr']})" for r in off]
        if off:
            notes.append("the blind onset detector hears these events early or late, usually because a louder sound starts within 3 frames of them: " + ", ".join(rep["onsets"]["blind_off"]))
        masked = [f"{r['type']}@{r['f']:g}" for r in rows if not r["blind_resolved"] and r["kind"] == "event"]
        if masked:
            notes.append("these events do not stand out in the SFX stem (a louder sound covers their start): " + ", ".join(masked))
        cut = [r for r in rows if r["kind"] == "event" and r["alive"] < ALIVE_MIN]
        if cut:
            fails.append("events cut off before they have sounded: " + ", ".join(
                f"{r['type']}@{r['f']:g} keeps {100 * r['alive']:.0f} % of its sound before " + ("the end of the film" if r["stop_f"] >= P.total else f"the dead cut at frame {r['stop_f']:g}") for r in cut))
    else:
        rep["onsets"] = dict(events=0, tolerance_frames=TOL_F, rows=[], blind_unresolved=[], blind_off=[])

    secs = mixed["secs"]
    rep["voice_to_bed"] = vb = voice_to_bed(P, voice, bed, words, secs, P.lines)
    vb["band_hz"] = list(SPEECH_BAND)
    worst = sorted(vb["lines"], key=lambda l: l["diff_db"])[:3]
    hint = "; the most covered lines: " + ", ".join(f"line {l['line']} (frames {l['f_a']}-{l['f_b']}, {l['diff_db']} dB)" for l in worst) if worst else ""
    if vb["overall"] is None:
        fails.append("no speech found: voice/words.json and voice.wav do not agree")
    else:
        if vb["overall"]["diff_db"] < VOICE_MIN_DB:
            fails.append(f"the voice is only {vb['overall']['diff_db']} dB above music + effects in the speech band (minimum {VOICE_MIN_DB:g})" + hint)
        low = [s for s in vb["sections"] if s["speaking_s"] >= 1.0 and s["diff_db"] < VOICE_MIN_SECTION_DB]
        if low:
            fails.append("the voice is covered in " + ", ".join(f"section {s['name']} (frames {s['f_a']}-{s['f_b']}): {s['diff_db']} dB" for s in low)
                         + f" (minimum {VOICE_MIN_SECTION_DB:g})" + hint)

    rep["gaps_over_0.5s"] = dict(mix_below_minus50=gaps(P, mix, -50.0), bed_below_minus60=gaps(P, bed, -60.0), music_below_minus60=gaps(P, mus, -60.0),
                                 sfx_below_minus60=gaps(P, sfxs, -60.0))
    if rep["gaps_over_0.5s"]["mix_below_minus50"]:
        fails.append(f"silence in the mix (frames): {rep['gaps_over_0.5s']['mix_below_minus50']}")
    rep["spectrum"] = dict(mix=spectrum(mix), voice=spectrum(voice), music=spectrum(mus), sfx=spectrum(sfxs))
    if rep["spectrum"]["mix"]["dc_dbfs"] > -60:
        fails.append(f"DC offset {rep['spectrum']['mix']['dc_dbfs']} dBFS")
    if rep["spectrum"]["mix"]["above_12k_db"] > -30:
        fails.append(f"energy above 12 kHz {rep['spectrum']['mix']['above_12k_db']} dB")
    rep["music"] = music_landmarks(P, plan, mus, fails, notes)
    intended = [(s.a, s.z) for s in plan.secs if s.silent]
    extra = [g for g in rep["gaps_over_0.5s"]["music_below_minus60"] if not any(a - 1 <= g[0] and g[1] <= b + 1 for a, b in intended)]
    rep["gaps_over_0.5s"]["music_unintended"] = extra
    if extra and any(not s.silent for s in plan.secs):
        fails.append(f"unintended gaps in the score (frames): {extra}")
    out = dict(ok=not fails, fails=fails, notes=notes, video=P.id, settings=mixed["settings"], **rep,
               mix=dict(sec_gains=st_["sec_gains"], m_levels=st_["m_levels"], cues=mixed["cues"], music_cues=mixed["music_cues"], sections=secs))
    json.dump(out, open(os.path.join(P.out, "verify.json"), "w", encoding="utf-8"), indent=1)
    append_cues(P, out)
    summary(out)
    return fails


def summary(rep):
    lo, on, vb = rep["loudness"], rep["onsets"], rep["voice_to_bed"]
    print("---------------- verify ----------------")
    print("files: " + ", ".join("%s %d fr %d Hz %d ch peak %s dBFS" % (k, v["frames"], v["sr"], v["ch"], v["peak_dbfs"]) for k, v in rep["files"].items()))
    print(f"loudness: {lo['integrated_lufs']} LUFS integrated, true peak {lo['true_peak_dbtp']} dBTP, LRA {lo['lra_lu']} LU, limiter max GR {lo['limiter']['max']:.2f} dB; "
          f"stems - mix residual {rep['stems_sum_residual_db']} dB")
    if on["events"]:
        print(f"onsets: {on['events']} events; matched: {on['matched_within_tol']}/{on['events']} within {TOL_F:g} frame (max {on['matched_max_abs_err_f']} f, lag max {on['matched_max_lag_samples']} samples); "
              f"blind: {on['blind_within_tol']}/{on['blind_resolved']} resolved onsets within tolerance (max {on['blind_max_abs_err_f']} f), unresolved: {on['blind_unresolved']}")
    o = vb["overall"]
    if o:
        print(f"voice - bed, {SPEECH_BAND[0]:.0f}-{SPEECH_BAND[1]:.0f} Hz while speaking: {o['diff_db']} dB (400 ms windows: median {o['median_db']}, p10 {o['p10_db']}, p90 {o['p90_db']})")
    for s in vb["sections"]:
        print(f"    {s['name']:<16} f{s['f_a']:>5}-{s['f_b']:<5} {s['diff_db']:6.2f} dB  (median {s['median_db']:6.2f}, p10 {s['p10_db']:6.2f})")
    print("gaps > 0.5 s:", {k: v for k, v in rep["gaps_over_0.5s"].items()})
    sp = rep["spectrum"]["mix"]
    print(f"spectrum (mix): DC {sp['dc_dbfs']} dBFS, <20 Hz {sp['below_20_db']} dB, >12 kHz {sp['above_12k_db']} dB, centroid {sp['centroid_hz']} Hz; bands {sp['bands_db']}")
    print("music:", {k: v for k, v in rep["music"].items() if k != "sections"}, [{k: v for k, v in r.items() if k not in ("f_a", "f_b")} for r in rep["music"]["sections"]])
    for n in rep["notes"]:
        print("NOTE:", n)
    print("RESULT:", "FAIL\n  - " + "\n  - ".join(rep["fails"]) if rep["fails"] else "all checks passed")


def append_cues(P, rep):
    p = os.path.join(P.out, "cues.md")
    txt = open(p, encoding="utf-8").read()
    i = txt.find("## Verification")
    if i >= 0:
        txt = txt[:i].rstrip() + "\n"
    lo, on, vb, sp, mu, gp = rep["loudness"], rep["onsets"], rep["voice_to_bed"], rep["spectrum"], rep["music"], rep["gaps_over_0.5s"]
    L = ["", "## Verification (measured from the written WAV files; nobody listened)"]
    w = L.append
    w(f"- **Result: {'FAIL' if rep['fails'] else 'all checks passed'}**")
    for f_ in rep["fails"]:
        w(f"  - FAIL: {f_}")
    for n_ in rep["notes"]:
        w(f"  - note: {n_}")
    w("- Files: " + "; ".join(f"`{k}` {v['frames']:,} samples, {v['sr']} Hz, {v['ch']} ch, {v['bits']}-bit, peak {v['peak_dbfs']} dBFS, {v['full_scale_samples']} clipped" for k, v in rep["files"].items()))
    w(f"- Loudness of `mix.wav`: **{lo['integrated_lufs']} LUFS** integrated, true peak **{lo['true_peak_dbtp']} dBTP** (sample peak {lo['sample_peak_dbfs']} dBFS), "
      f"LRA {lo['lra_lu']} LU, max momentary {lo['max_momentary_lufs']} LUFS. Stems minus mix: {rep['stems_sum_residual_db']} dB.")
    if on["events"]:
        w(f"- Event onsets in `stem_sfx.wav` ({on['events']} events, tolerance {TOL_F:g} frame): matched {on['matched_within_tol']}/{on['events']} within tolerance "
          f"(largest error {on['matched_max_abs_err_f']} frame, largest lag {on['matched_max_lag_samples']} samples); blind band-flux detector resolved {on['blind_resolved']} "
          f"of them, {on['blind_within_tol']} within tolerance (largest error {on['blind_max_abs_err_f']} frame). "
          f"Not resolved blind (soft starts under louder sounds, placement confirmed by the matched test): {', '.join(on['blind_unresolved']) or 'none'}.")
    o = vb["overall"]
    if o:
        w(f"- Voice minus bed (music + sfx) in {SPEECH_BAND[0]:.0f}-{SPEECH_BAND[1]:.0f} Hz while the narrator speaks: **{o['diff_db']} dB** over {o['speaking_s']} s of speech "
          f"(400 ms windows: median {o['median_db']}, 10th percentile {o['p10_db']}, 90th {o['p90_db']} dB). Minimum {VOICE_MIN_DB:g} dB overall, {VOICE_MIN_SECTION_DB:g} dB per section.")
    w("- Silence gaps longer than 0.5 s (50 ms RMS): mix under -50 dBFS: " + (str(gp["mix_below_minus50"]) if gp["mix_below_minus50"] else "none") +
      "; score under -60 dBFS (frames): " + (", ".join(f"{a:g}-{b:g}" for a, b in gp["music_below_minus60"]) or "none") +
      " (intended: the 'silence' sections); unintended: " + (str(gp["music_unintended"]) if gp["music_unintended"] else "none") +
      "; bed (music + sfx) under -60 dBFS: " + (", ".join(f"{a:g}-{b:g}" for a, b in gp["bed_below_minus60"]) or "none") + ".")
    m_ = sp["mix"]
    w(f"- Spectrum of the mix: DC {m_['dc_dbfs']} dBFS, below 20 Hz {m_['below_20_db']} dB, above 12 kHz {m_['above_12k_db']} dB of the total energy, centroid {m_['centroid_hz']} Hz. "
      "Bands (dB of total): " + ", ".join(f"{k} {v}" for k, v in m_["bands_db"].items()) + ".")
    parts = []
    for r in mu["sections"]:
        if "rms_dbfs" in r:
            parts.append(f"{r['section']} f{r['f_a']:g}-{r['f_b']:g}: {r['rms_dbfs']} dBFS")
        else:
            parts.append(f"{r['section']}: onset at f{r['onset_f']} (plan f{r['f_a']:g})" + (f", button at f{r['button_onset_f']} (plan f{r['button_f']:g})" if "button_f" in r else ""))
    w(f"- Score landmarks: first sound at f{mu.get('first_sound_f', '-')}; " + "; ".join(parts) + f"; last 10 ms {mu['rms_last_10ms_dbfs']} dBFS.")
    w("")
    w("### Voice minus bed per score section (speech band, while speaking)")
    w("| section | frames | level difference dB | median of 400 ms windows | 10th percentile |")
    w("|---|---|---|---|---|")
    for s in vb["sections"]:
        w(f"| {s['name']} | {s['f_a']}-{s['f_b']} | {s['diff_db']} | {s['median_db']} | {s['p10_db']} |")
    w("")
    w("### Voice minus bed per narration line (speech band, while speaking)")
    w("| line | frames | level difference dB | text |")
    w("|---|---|---|---|")
    for l in vb["lines"]:
        w(f"| {l['line']} | {l['f_a']}-{l['f_b']} | {l['diff_db']} | {l['text']} |")
    w("")
    w("### Onset of every event in the SFX stem")
    w("err = detected onset minus the frame in shots.json, in frames. matched = cross-correlation with the cue rendered alone + its 10 % rise; "
      "blind = first strong band-energy rise within 3 frames (snr = largest rise over the local median; under 5 = not resolved). "
      "alive = share of the event's energy that sounds before the next dead cut or the end of the film.")
    w("")
    w("| frame | event | matched onset | err | lag samples | blind onset | err | snr | alive |")
    w("|---|---|---|---|---|---|---|---|---|")
    for r in sorted(on["rows"], key=lambda r: r["f"]):
        w(f"| {r['f']:g}{'-%g' % r['to'] if r['to'] is not None else ''} | {r['type']} | {r['onset_matched_f']} | {r['err_matched_f']:+.2f} | {r['lag_samples']} | "
          f"{r['onset_blind_f'] if r['blind_resolved'] else '-'} | {'%+.2f' % r['err_blind_f'] if r['blind_resolved'] else '-'} | {r['blind_snr']} | {r['alive']:.2f} |")
    w("")
    open(p, "w", encoding="utf-8").write(txt.rstrip() + "\n" + "\n".join(L))
