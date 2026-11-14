#!/usr/bin/env python
# "Listening" by measurement: renders every event type of the vocabulary alone, with its default options, and
# measures what an ear would notice first. Nobody can listen in a headless build; these numbers are the stand-in.
#     engine/.venv/bin/python engine/toon/audio/audition.py [type ...]
# For each type: length (until it has decayed 60 dB), how fast it starts (10 % rise minus its pre-roll; it must land
# on its frame), spectral centroid and the band holding 90 % of its energy, energy above 12 kHz and below 30 Hz, DC,
# crest factor, and its sample peak in a finished mix (voice at -14.3 LUFS, the effect at its default level).
# Exit 1 if a sound is silent, not finite, starts late, clips, or has its energy where no phone speaker or ear
# will find it. Run it after touching sfx_gen.py or sfx.py.
import os
import sys
import types
import numpy as np

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scipy import signal                                    # noqa: E402
from dsp import SR, pan, dbg, lp, hp, momentary_max, integrated     # noqa: E402
from project import Event, Shot                             # noqa: E402
import sfx                                                  # noqa: E402

VOICE_MIX_LUFS = -14.3          # where the narration sits in a finished mix (hole short)
START_MAX_S = 0.02              # a sound must reach 10 % of its early level within this time of its frame
SPAN_F = 150                    # beds and optional spans are auditioned over 5 s


def stub(fps=30, total=900):
    """the little a builder needs from a project: one outdoor shot, no flashes, the key of F"""
    P = types.SimpleNamespace(fps=fps, total=total, dur=total / fps, flashes=[], rooms={"x": "outdoor"}, xfade={})
    P.shots = {1: Shot(dict(id=1, a=0, b=total, place="x"))}
    P.fr = lambda f: f / fps
    P.shot_of = lambda f: 1
    P.cut_in = lambda f: 0
    P.events = lambda type=None: []
    return P, types.SimpleNamespace(tonic=lambda f: 5)


def measure(x, anchor, kind, applied):
    x = np.asarray(x, float)
    x = pan(x, 0.0) if x.ndim == 1 else x
    if not np.isfinite(x).all() or not np.any(x):
        return None
    cur = momentary_max(x) if kind == "event" else integrated(x)
    x = lp(hp(x * dbg(VOICE_MIX_LUFS + applied - cur), 25, 2), 11000, 4)      # as loud as it will be in the mix, through the SFX stem's filters
    m = x.mean(0)
    e = np.abs(x).max(0)
    pk = e.max()
    last = np.flatnonzero(e > pk * 1e-3)[-1]
    f, Pw = signal.welch(m, SR, nperseg=min(8192, len(m)))
    tot = Pw.sum() + 1e-30
    c = np.cumsum(Pw) / tot
    rms = np.sqrt((x ** 2).mean()) + 1e-30
    return dict(dur=(last + 1) / SR, start=sfx.rise10(x) - anchor, centroid=float((f * Pw).sum() / tot), lo=float(f[np.searchsorted(c, 0.05)]),
                hi=float(f[min(np.searchsorted(c, 0.95), len(f) - 1)]), above12k=10 * np.log10(Pw[f >= 12000].sum() / tot + 1e-30),
                below30=10 * np.log10(Pw[f < 30].sum() / tot + 1e-30), dc=20 * np.log10(abs(m.mean()) / rms + 1e-30),
                crest=20 * np.log10(pk / rms), peak=20 * np.log10(pk), lufs=VOICE_MIX_LUFS + applied)


def main(argv):
    P, plan = stub()
    K = sfx.Kit(P, plan)
    names = argv or list(sfx.SOUND)
    bad = []
    print(f"{'type':<26}{'kind':<6}{'level':>6}{'len s':>7}{'start ms':>9}{'centroid':>9}{'90 % band Hz':>15}{'>12k dB':>8}{'<30 dB':>7}{'DC dB':>7}{'crest':>6}{'peak dBFS':>10}")
    for name in names:
        if name not in sfx.SOUND:
            print(f"{name}: unknown type")
            bad.append(name)
            continue
        sp = sfx.SOUND[name]
        d = dict(f=30, type=name, note="audition")
        if sp.span != "no":
            d["to"] = 30 + SPAN_F
        ev = Event(0, d, P)
        c = sfx.SOUND[name].fn(K, ev, {}, sfx._rng(ev))[0]
        x, anchor = c.gen()
        r = measure(x, anchor, c.kind, c.applied)
        if r is None:
            print(f"{name:<26}SILENT or not finite")
            bad.append(name)
            continue
        why = []
        if abs(r["start"]) > START_MAX_S:
            why.append("starts late")
        if r["peak"] > -1.0:
            why.append("clips")
        if not 60 <= r["centroid"] <= 7000:
            why.append("centroid out of range")
        if r["hi"] < 250:
            why.append("nothing above 250 Hz (inaudible on a phone)")
        if r["above12k"] > -20 or r["dc"] > -30:
            why.append("energy above 12 kHz / DC")
        if c.kind == "event" and not 0.03 <= r["dur"] <= 6.5:
            why.append("odd length")
        print(f"{name:<26}{c.kind:<6}{c.naive:>6.1f}{r['dur']:>7.2f}{1000 * r['start']:>9.1f}{r['centroid']:>9.0f}{r['lo']:>7.0f}-{r['hi']:<7.0f}{r['above12k']:>8.1f}"
              f"{r['below30']:>7.1f}{r['dc']:>7.1f}{r['crest']:>6.1f}{r['peak']:>10.1f}" + ("   <-- " + ", ".join(why) if why else ""))
        if why:
            bad.append(name)
    print(f"audition: {len(names) - len(bad)}/{len(names)} event types measure sane" + (f"; PROBLEMS: {', '.join(bad)}" if bad else ""))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
