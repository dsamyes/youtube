# The music engine: an original score composed and synthesized here (instruments.py; no samples) from the plan in
# videos/<id>/audio/score.json. A plan is a home key, a tempo, a tune and a list of SECTIONS; each section names a
# MOOD, a way of playing the tune, and runs from its "from" frame to the next section's:
#   silence      no music (a cold open, a dead stop, a held breath)
#   theme        the tune, swung: clarinet, pizzicato boom-chick, brushes; second statement doubled by marimba + glock
#   chase        the tune's head as an ostinato that accelerates and climbs, ends unresolved on the dominant
#   mystery      the tune at half speed in the relative minor over a tick-tock (vibes, pizzicato, woodblock)
#   waltz        music-box waltz: down to a low point, then an arpeggio that climbs slower and slower to a rest
#   lullaby      the tune rocking in 6/8 in the flat-sixth key (music box, harp, warm pad), ends on a question
#   bittersweet  one little phrase twice: sweet, then it droops (sad trombone) onto the dominant
#   runup        short accelerating ostinato on the dominant that runs up into the tune
#   finale       the tune comes home, warm and a little faster, tag and BUTTON (the last note of the film)
# Every bar count follows from the section length and the tempo, then the bars are fitted exactly to the frames, so a
# retimed plan retimes the score. Everything is written in F and transposed to the home key. One seeded random
# stream runs through the sections in order (velocities, micro-timing, phases): same plan, same samples.
# The hole-through-earth short is the reference: its score.json reproduces the score that was first composed for it.
import math
import numpy as np
from scipy.interpolate import PchipInterpolator
from dsp import ns, rng, pan, place, dbg, make_ir, convolve_st, integrated, lp, hp
import instruments as I
from project import pick

NAMES = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]
FIT = 1.45                       # a section may stretch or squeeze its bars by at most this factor around the plan tempo

# ---------------------------------------------------------------- tunes: (bar, beat, length in beats, midi), F major
# Four bars over F | Gm C7 | F Dm C7 | F; bar 4 is always the home note held for two beats.
THEMES = {
    "stroll": [   # the hole short's tune: sol-mi-sol-do'
        (0, 0, .5, 72), (0, .5, .5, 69), (0, 1, .5, 72), (0, 1.5, 1, 77), (0, 2.5, .5, 74), (0, 3, 1, 72),
        (1, 0, .5, 74), (1, .5, .5, 70), (1, 1, .5, 74), (1, 1.5, 1, 79), (1, 2.5, .5, 77), (1, 3, 1, 76),
        (2, 0, .5, 77), (2, .5, .5, 81), (2, 1, 1, 84), (2, 2, .5, 81), (2, 2.5, .5, 77), (2, 3, .5, 74), (2, 3.5, .5, 76),
        (3, 0, 2, 77),
    ],
    "hop": [      # starts on the home note and bounces: do, sol-la-do, mi-re
        (0, 0, 1, 77), (0, 1, .5, 72), (0, 1.5, .5, 74), (0, 2, 1, 77), (0, 3, .5, 81), (0, 3.5, .5, 79),
        (1, 0, 1, 79), (1, 1, .5, 74), (1, 1.5, .5, 77), (1, 2, 1.5, 76), (1, 3.5, .5, 72),
        (2, 0, .5, 77), (2, .5, .5, 79), (2, 1, 1, 81), (2, 2, .5, 77), (2, 2.5, .5, 74), (2, 3, .5, 76), (2, 3.5, .5, 72),
        (3, 0, 2, 77),
    ],
    "tiptoe": [   # creeps up by steps and thirds, a sneakier contour
        (0, 0, .5, 69), (0, .5, .5, 72), (0, 1, 1, 77), (0, 2, .5, 77), (0, 2.5, .5, 79), (0, 3, 1, 81),
        (1, 0, .5, 82), (1, .5, .5, 79), (1, 1, 1, 74), (1, 2, .5, 76), (1, 2.5, .5, 79), (1, 3, 1, 82),
        (2, 0, 1, 81), (2, 1, .5, 77), (2, 1.5, .5, 72), (2, 2, 1, 74), (2, 3, .5, 79), (2, 3.5, .5, 76),
        (3, 0, 2, 77),
    ],
}
HEAD = [(0, .5), (.5, .5), (1, .5), (1.5, 1), (2.5, .5), (3, 1)]          # rhythm of the head motif (chase)
CH = {  # root, fifth (pizzicato bass), chord tones (plucked)
    "F": (41, 48, [57, 60, 65]), "Gm": (43, 50, [58, 62, 65]), "C7": (48, 43, [58, 60, 64]), "Dm": (50, 45, [57, 62, 65]),
    "Bb": (46, 41, [58, 62, 65]), "C": (48, 43, [55, 60, 64]), "Eb": (51, 46, [58, 63, 67]), "G": (43, 50, [59, 62, 67]),
    "A7": (45, 40, [57, 61, 64]), "Db": (37, 44, [56, 61, 65]),
}
CH4 = [["F"] * 4, ["Gm", "Gm", "C7", "C7"], ["F", "F", "Dm", "C7"], ["F", "F", "C7", "F"]]      # the tune's four bars
PCS = {"F": (5, 9, 0), "Gm": (7, 10, 2), "C7": (0, 4, 7, 10), "Dm": (2, 5, 9)}
SCALE = (5, 7, 9, 10, 0, 2, 4)
RHYTHMS = [[(0, .5), (.5, .5), (1, .5), (1.5, 1), (2.5, .5), (3, 1)], [(0, 1), (1, .5), (1.5, .5), (2, 1), (3, .5), (3.5, .5)],
           [(0, .5), (.5, .5), (1, 1), (2, .5), (2.5, .5), (3, 1)], [(0, 1), (1, 1), (2, .5), (2.5, .5), (3, 1)],
           [(0, .5), (.5, .5), (1, 1), (2, .5), (2.5, .5), (3, .5), (3.5, .5)]]


def seed_theme(seed):
    """a tune made from a number: swung rhythms from a small bank, chord tones on the beats, scale steps between,
    small leaps, the top note in bar 3, and a step into the home note of bar 4"""
    r = rng(1000003 + int(seed))
    out, prev = [], int(r.choice([72, 77, 69]))
    for bar in range(3):
        rhy = RHYTHMS[int(r.integers(len(RHYTHMS)))]
        for j, (beat, d) in enumerate(rhy):
            on = float(beat).is_integer()
            pcs = PCS[CH4[bar][int(beat)]] if on else SCALE
            last = bar == 2 and j == len(rhy) - 1
            cand = [m for m in range(67, 85) if m % 12 in (SCALE if last else pcs) and m != prev and abs(m - prev) <= (7 if on else 2)]
            if last:
                cand = [m for m in (76, 79, 74) if abs(m - prev) <= 7] or [76]
            if bar == 0 and j == 0:
                cand = [prev]
            w = np.array([1.0 / (1.0 + abs(m - prev)) * math.exp(-0.5 * ((m - (73 + 3.5 * bar)) / 5.0) ** 2) for m in cand])
            prev = int(cand[int(r.choice(len(cand), p=w / w.sum()))])
            out.append((bar, beat, d, prev))
    return out + [(3, 0, 2, 77)]


def get_theme(name):
    if isinstance(name, str) and name.startswith("seed:") and name[5:].isdigit():
        return seed_theme(int(name[5:]))
    if name in THEMES:
        return THEMES[name]
    raise ValueError(pick(name, list(THEMES) + ["seed:<number>"], "theme"))


# ---------------------------------------------------------------- time grids
def lin_grid(fr, f0, bar_frames, beats=4):
    return lambda bar, beat=0.0: fr(f0 + (bar + beat / beats) * bar_frames)


def geo_grid(fr, marks, counts, q):
    """accelerating bars: lengths ~ q^k, rescaled piecewise so that the downbeats hit every mark (frames)"""
    raw = q ** np.arange(sum(counts))
    lens, k = [], 0
    for (a, b), c in zip(zip(marks[:-1], marks[1:]), counts):
        seg = raw[k:k + c]
        lens += list(seg * (b - a) / seg.sum())
        k += c
    downs = marks[0] + np.concatenate([[0.0], np.cumsum(lens)])
    pc = PchipInterpolator(np.arange(len(downs)), downs)
    return (lambda bar, beat=0.0: fr(float(pc(bar + beat / 4)))), downs


def low_points(pickup_f, low_f, cycles):
    """frames at which a pendulum that is pushed at pickup_f passes its low point, the last one being low_f"""
    out, k = [], 0
    while 0.25 + 0.5 * k <= cycles + 1e-9:
        out.append(pickup_f + (0.25 + 0.5 * k) / cycles * (low_f - pickup_f))
        k += 1
    return out or [low_f]


def sw(beat, amount=2 / 3):
    """swing: the off-beat eighth is played late"""
    fl = np.floor(beat)
    return fl + (amount if abs(beat - fl - 0.5) < 1e-6 else beat - fl)


def _fit(length, nominal, counts, per=lambda n: n):
    """bar count from `counts` whose fitted bar (length / per(n)) is closest to the nominal bar; -> (n, ratio)"""
    n = min(counts, key=lambda n: abs(math.log(length / per(n) / nominal)))
    return n, length / per(n) / nominal


# ---------------------------------------------------------------- the band
TRACKS = [("clar", 0.16), ("glock", 0.22), ("mar", 0.14), ("bass", 0.10), ("chord", 0.16), ("brush", 0.10), ("wood", 0.14),
          ("vibes", 0.24), ("mbox", 0.26), ("harp", 0.22), ("pad", 0.25), ("horn", 0.20), ("timp", 0.18), ("cymbal", 0.16), ("tri", 0.25)]
PAN = {"clar": 0.12, "glock": -0.3, "mar": 0.28, "bass": -0.05, "chord": 0.22, "brush": 0.1, "wood": -0.2, "vibes": -0.25, "mbox": 0.18,
       "harp": -0.15, "horn": -0.2, "timp": -0.1, "cymbal": 0.0, "tri": 0.3}
TARGET = {  # relative balance inside the band (LU, integrated loudness of each track over the whole score)
    "clar": 0.0, "glock": -7.0, "mar": -2.5, "bass": -3.0, "chord": -7.5, "brush": -13.0, "wood": -12.0, "vibes": -3.0, "mbox": -2.5,
    "harp": -5.0, "pad": -6.0, "horn": -6.5, "timp": -7.0, "cymbal": -13.0, "tri": -16.0,
}


class Band:
    def __init__(self, P, plan):
        self.P, self.fps, self.N = P, P.fps, P.n
        self.R = rng(P.seed)
        self.tr, self.theme = plan.tr, plan.theme
        self.tk, self.send, self.cues = {}, {}, []
        for name, send in TRACKS:
            self.tk[name] = np.zeros((2, self.N))
            self.send[name] = send

    def fr(self, f):
        return f / self.fps

    def hz(self, m):
        return I.m2f(m + self.tr)

    def r(self):
        return rng(int(self.R.integers(1 << 30)))

    def v(self, v, spread=0.06):
        return v * self.R.uniform(1 - spread, 1 + spread)

    def add(self, name, x, t, p=0.0, g=1.0):
        place(self.tk[name], pan(x, p) if np.ndim(x) == 1 else x, t, g)

    def cue(self, f, text):
        self.cues.append((self.fr(f), text))

    def bpm(self, bar_frames, beats=4):
        return 60 * beats * self.fps / bar_frames

    def key(self, shift=0, minor=False):
        return NAMES[(5 + self.tr + shift) % 12] + (" minor" if minor else " major")


def note(b, track, m, t, d, vel, **kw):
    """one note of `track` at time t (s), length d (s)"""
    f = b.hz(m)
    if track == "clar":
        x = I.clarinet(f, max(d, 0.06), b.v(vel), b.r(), **kw)
    elif track == "glock":
        x = I.glock(f, b.v(vel), b.r(), dur=kw.get("dur", 1.4))
    elif track == "mar":
        x = I.mallet(f, b.v(vel), b.r(), kw.get("kind", "marimba"))
    elif track == "bass":
        x = I.pluck(f, b.v(vel), b.r(), dur=kw.get("dur", 0.8), bright=0.35)
    elif track == "chord":
        x = I.pluck(f, b.v(vel), b.r(), dur=kw.get("dur", 0.4), bright=0.6)
    elif track == "vibes":
        x = I.vibes(f, b.v(vel), b.r(), dur=max(1.2, d + 0.9), damp=d + kw.get("ring", 0.4), trem_depth=kw.get("trem", 0.1))
    elif track == "mbox":
        x = I.musicbox(f, b.v(vel), b.r(), dur=kw.get("dur", 1.6))
    elif track == "harp":
        x = I.harp(f, b.v(vel), b.r(), dur=kw.get("dur", 2.2))
    elif track == "horn":
        x = I.brass(f, d, vel, b.r(), kw.get("kind", "soft"), scoop=kw.get("scoop", -8.0), fall=kw.get("fall", 0.0), rel=kw.get("rel", 0.1))
    else:
        raise KeyError(track)
    b.add(track, x, t + b.R.normal(0, 0.0015), PAN.get(track, 0.0) + kw.get("dp", 0.0))


def strum(b, tones, t, vel, dur=0.4, up=False):
    seq = tones[::-1] if up else tones
    for k, m in enumerate(seq):
        b.add("chord", I.pluck(b.hz(m), b.v(vel), b.r(), dur=dur, bright=0.6), t + 0.007 * k, PAN["chord"] - 0.08 * k)


def brush(b, t, vel, swish=False):
    b.add("brush", I.brush(b.v(vel), b.r(), dur=0.36 if swish else 0.3, swish=swish), t - (0.05 if swish else 0.0), PAN["brush"])


def wood(b, t, vel, hi=True):
    b.add("wood", I.woodblock(b.v(vel), b.r(), 1180.0 if hi else 880.0), t, PAN["wood"])


def timp(b, m, vel, t, dur):
    b.add("timp", I.timpani(b.hz(m), vel, b.r(), dur=dur), t, PAN["timp"])


def padc(b, ms, t0, t1, vel, att=0.3, rel=0.5, trem=None):
    b.add("pad", I.pad([b.hz(m) for m in ms], t1 - t0, vel, b.r(), att=att, rel=rel, trem=trem), t0)


def tune(b, g, bars, vel, tracks=("clar",), swing=2 / 3, octave=0, gate=0.88):
    """play the tune's bars `bars` on grid g (bar index on the grid = position in `bars`)"""
    for i, tb in enumerate(bars):
        for (bar, beat, d, m) in b.theme:
            if bar != tb:
                continue
            t0, t1 = g(i, sw(beat, swing)), g(i, sw(beat + d, swing))
            for tr in tracks:
                o = 12 if tr == "glock" else 0
                kw = dict(dur=min(1.4, t1 - t0 + 0.3)) if tr == "glock" else {}     # damped glock: stepwise notes do not smear
                note(b, tr, m + octave + o, t0, (t1 - t0) * gate, vel * (0.55 if tr == "glock" else (0.8 if tr == "mar" else 1.0)), **kw)


def boom_chick(b, g, i, chords, vel, swing=2 / 3, ghost=True, brushes=True, walk=None):
    """one bar of the stroll accompaniment: pizzicato bass on 1 and 3, plucked chords on 2 and 4 (+ swung up-strokes)"""
    for beat in range(4):
        root, fifth, tones = CH[chords[beat]]
        t = g(i, beat)
        if beat in (0, 2):
            m = root if (beat == 0 or chords[beat] != chords[0]) else fifth
            note(b, "bass", m, t, 0.4, vel)
            if brushes:
                brush(b, t, 0.42 * vel, swish=True)
        else:
            strum(b, tones, t, 0.55 * vel)
            if brushes:
                brush(b, t, 0.6 * vel)
        if ghost and beat in (1, 3):
            strum(b, tones[1:], g(i, sw(beat + 0.5, swing)), 0.28 * vel, dur=0.25, up=True)
            if brushes:
                brush(b, g(i, sw(beat + 0.5, swing)), 0.3 * vel)
    if walk:
        for (beat, m) in walk:
            note(b, "bass", m, g(i, sw(beat, swing)), 0.3, vel * 0.9)


# ================================================================ moods: layout (bars from the frames) + playing
def _nominal(P):
    return 240.0 * P.fps / P.tempo                       # frames in one 4/4 bar at the plan tempo


def _short(s, P, what, min_frames):
    return ValueError(f"{what} needs at least {min_frames / P.fps:.1f} s at tempo {P.tempo:g}; this section is {(s.z - s.a) / P.fps:.1f} s. "
                      f"Make it longer, merge it with a neighbour, or use another mood")


# ---------------------------------------------------------------- theme
def lay_theme(P, s):
    L, nom = s.z - s.a, _nominal(P)
    n, ratio = (s.bars, 1.0) if s.bars else _fit(L, nom, range(2, 65))
    if not 1 / FIT <= ratio <= FIT:
        raise _short(s, P, "theme (two bars of the tune)", 2 * nom / FIT)
    if s.opts.get("end", "open") not in ("open", "stop"):
        raise ValueError(pick(s.opts["end"], ["open", "stop"], "end for a theme"))
    s.n, s.bar = n, L / float(n)


def play_theme(b, s):
    a, n, bar = s.a, s.n, s.bar
    g = lin_grid(b.fr, a, bar)
    stop = s.opts.get("end", "open") == "stop"
    body = n - 1 if stop else n                          # bars that play the tune; a stop bar ends on the stop chord
    k0 = min(4, body)
    b.cue(a, f"THEME: {b.key()}, swung, {b.bpm(bar):.1f} bpm, {n} bars; clarinet tune, pizzicato boom-chick, brushes")
    b.add("tri", I.triangle(0.4, b.r(), dur=1.2), g(0), PAN["tri"])
    b.add("cymbal", I.cymbal(0.22, b.r(), dur=1.4), g(0))
    tune(b, g, list(range(k0)), 0.62, ("clar",))
    for (bar_, beat, d, m) in b.theme:                  # glock sparkles on the long notes
        if d >= 1 and bar_ < k0:
            note(b, "glock", m + 12, g(bar_, sw(beat)), 0.5, 0.34)
    for i in range(k0):
        boom_chick(b, g, i, CH4[i], 0.62 if i else 0.58, ghost=i > 0,
                   walk=[(3.5, 45)] if i == 0 else ([(3.5, 40)] if i == 2 else None))
    if k0 == 4:
        strum(b, CH["C7"][2], g(3, 2), 0.5, dur=0.3), note(b, "bass", 41, g(3, 3), 0.4, 0.66)      # "pom-pom": C7, F
        wood(b, g(3, 2), 0.5), wood(b, g(3, 3), 0.55, hi=False)
        b.cue(a + 3 * bar, "theme bar 4: the tune lands on the home note, 'pom-pom' answer on beats 3 and 4")
    # later statements: fuller, the tune doubled by marimba + glock
    for i in range(4, body):
        tune(b, lin_grid(b.fr, a + i * bar, bar), [i % 4], 0.68, ("clar", "mar", "glock"))
    if body > 4:
        b.cue(a + 4 * bar, "second statement: tune doubled by marimba and glockenspiel")
    last = n - 1
    if stop:                                            # the stop bar starts like its bar of the tune ...
        for (bar_, beat, d, m) in b.theme:
            if bar_ != last % 4 or beat >= 2:
                continue
            d = min(d, 2 - beat)
            for tr in ("clar", "mar", "glock"):
                note(b, tr, m + (12 if tr == "glock" else 0), g(last, sw(beat)), (g(last, sw(beat + d)) - g(last, sw(beat))) * 0.85, 0.7 * (0.55 if tr == "glock" else 1.0))
    for i in range(4, body):
        boom_chick(b, g, i, CH4[i % 4], 0.68, walk=[(3.5, 42)] if i % 4 == 0 else ([(3.5, 40)] if i % 4 == 2 else None))
        if i % 4 == 3:
            strum(b, CH["C7"][2], g(i, 2), 0.5, dur=0.3), note(b, "bass", 41, g(i, 3), 0.4, 0.66)
            wood(b, g(i, 2), 0.5), wood(b, g(i, 3), 0.55, hi=False)
    if stop:
        root, fifth, tones = CH[CH4[last % 4][0]]
        note(b, "bass", root, g(last, 0), 0.4, 0.68), brush(b, g(last, 0), 0.3, swish=True)
        strum(b, tones, g(last, 1), 0.4), brush(b, g(last, 1), 0.4)
        ts = g(last, 2)                                 # ... and STOPS on the dominant seventh; vibes let it ring
        for m in (48, 36):
            note(b, "bass", m, ts, 0.3, 0.8)
        strum(b, [58, 60, 64, 67], ts, 0.6, dur=0.3)
        note(b, "clar", 76, ts, 0.16, 0.72), note(b, "mar", 76, ts, 0.2, 0.6), note(b, "glock", 88, ts, 0.3, 0.42, dur=0.8)
        for m in (58, 64, 67, 72):
            note(b, "vibes", m, ts, b.fr(s.z) - ts - 0.15, 0.3, trem=0.3, ring=0.1)      # damped as the next section starts
        wood(b, ts, 0.6)
        b.cue(a + (last + 0.5) * bar, "stop chord (dominant seventh): the band leaves the next two beats to the sound effects, vibes ring")


# ---------------------------------------------------------------- chase
CHASE_CH = ["F", "F", "Gm", "Gm", "Bb", "C", "Dm", "Eb", "F", "G", "C7"]
CHASE_OST = [(60, 57, 60, 65), (60, 57, 60, 65), (62, 58, 62, 67), (62, 58, 62, 67), (65, 62, 65, 70), (67, 64, 67, 72), (69, 65, 69, 74),
             (70, 67, 70, 75), (72, 69, 72, 77), (74, 71, 74, 79), (76, 72, 76, 79)]
CHASE_HEADS = (0, 2, 4, 5, 6, 7, 8, 9)                   # bars of the 11-bar climb on which the clarinet plays the head


def lay_chase(P, s):
    L, nom = s.z - s.a, _nominal(P) / 1.085              # it starts a little faster than the plan tempo
    best = None
    for N in ([s.bars] if s.bars else range(3, 65)):
        q = max(0.938, 0.5 ** (1.0 / (N - 1)))           # every bar 6 % shorter, but never more than twice as fast at the end
        L0 = L * (1 - q) / (1 - q ** N)
        err = abs(math.log(L0 / nom))
        if best is None or err < best[0]:
            best = (err, N, q, L0)
    err, N, q, L0 = best
    if N < 3 or (not s.bars and err > math.log(FIT)):
        raise _short(s, P, "chase (three accelerating bars)", 2.6 * nom / FIT)
    free = s.a + L0 * (1 - q ** np.arange(N + 1)) / (1 - q)
    ks = []
    for h in s.hits:                                     # every hit becomes the nearest downbeat
        k = int(np.clip(np.argmin(np.abs(free - h)), 1, N - 1))
        if ks and k <= ks[-1]:
            raise ValueError(f"chase hits {s.hits} are closer than one bar (about {L0 / P.fps:.1f} s here); drop one or move them apart")
        ks.append(k)
    if len(ks) >= 2:
        b1, b2 = ks[0], ks[-1]
    elif len(ks) == 1:
        b1, b2 = (ks[0], max(ks[0] + 1, round((ks[0] + N) / 2))) if ks[0] <= N / 2 else (max(1, round(ks[0] / 2)), ks[0])
    else:
        b1 = max(1, round(N * 4 / 11))
        b2 = max(b1 + 1, round(N * 7 / 11))
    b2 = min(b2, N - 1)
    b1 = max(1, min(b1, b2 - 1))
    s.N, s.q, s.b1, s.b2 = N, q, b1, b2
    s.accents = ks if ks else [b1, b2]
    s.marks = [s.a] + list(s.hits) + [s.z]
    s.counts = [k1 - k0 for k0, k1 in zip([0] + ks, ks + [N])]
    _, downs = geo_grid(P.fr, s.marks, s.counts, q)
    at = dict(zip(ks, s.hits))
    s.parts = [s.a, at.get(b1, float(downs[b1])), at.get(b2, float(downs[b2])), s.z]      # where it steps up a gear
    tp = [(i * 4) // b1 if i < b1 else (4 + ((i - b1) * 3) // (b2 - b1) if i < b2 else 7 + ((i - b2) * 4) // (N - b2)) for i in range(N)]
    tp[-1] = 10                                          # the last bar is always the dominant seventh
    s.tp = tp


def play_chase(b, s):
    g, downs = geo_grid(b.fr, s.marks, s.counts, s.q)
    nb, b1, b2 = len(downs) - 1, s.b1, s.b2
    bpm = lambda i: 60 * 4 * b.fps / (downs[i + 1] - downs[i])
    chords = [CHASE_CH[t] for t in s.tp]
    ost = [CHASE_OST[t] for t in s.tp]
    b.cue(s.a, f"CHASE OSTINATO: the tune's head as running eighths (marimba), {bpm(0):.0f} bpm and accelerating over {nb} bars, climbing from {b.key()}")
    for i in range(nb):
        u = i / (nb - 1)
        vel = 0.46 + 0.3 * u
        root, fifth, tones = CH[chords[i]]
        for k in range(8):
            m = ost[i][k % 4]
            if i == nb - 1 and k >= 4:
                m = (79, 76, 79, 82)[k - 4]            # last half bar climbs to the 7th: unresolved at the cut
            t = g(i, k / 2)
            acc = 1.0 if k % 4 == 0 else (0.86 if k % 2 == 0 else 0.74)
            note(b, "mar", m, t, 0.1, vel * acc)
            if i >= b1:
                note(b, "mar", m + 12, t, 0.1, vel * acc * (0.5 + 0.25 * u), kind="xylo", dp=-0.5)
            if i >= b2 and k % 2 == 0:
                note(b, "glock", m + 24, t, 0.2, 0.2 + 0.16 * u, dur=0.5)
            # pizzicato bass: 1 and 3 -> every beat -> running eighths
            if (i < b1 and k in (0, 4)) or (b1 <= i < b2 and k % 2 == 0) or i >= b2:
                bm = (root if k == 0 else fifth) if i < b1 else (root if k % 4 == 0 else (fifth if k % 2 == 0 else root + 12))
                note(b, "bass", bm, t, 0.2, (0.6 + 0.25 * u) * (1.0 if k % 2 == 0 else 0.7), dur=0.5)
            brush(b, t, (0.22 + 0.4 * u) * (1.0 if k % 2 == 0 else 0.7))
            if i >= b1 and k % 2 == 0:
                wood(b, t, 0.3 + 0.3 * u, hi=k % 4 == 0)
        if s.tp[i] in CHASE_HEADS and (i == 0 or s.tp[i] != s.tp[i - 1]):      # the tune's head, one step higher every time (clarinet)
            base = ost[i][0] + 12
            ivs = np.array(ost[i]) - ost[i][0]          # sol mi sol do' of this chord
            seq = [base, base + ivs[1], base, base + ivs[3], base + ivs[3] - (3 if chords[i] in ("F", "Bb", "C", "Eb", "G") else 2), base]
            for (beat, d), m in zip(HEAD, seq):
                t0 = g(i, beat)
                note(b, "clar", int(m), t0, (g(i, beat + d) - t0) * 0.85, 0.5 + 0.28 * u)
                if i >= b2 and d >= 1:
                    note(b, "glock", int(m) + 12, t0, 0.3, 0.3, dur=0.7)
        if i >= b2:                                     # top gear: soft brass swell per bar
            for m in tones:
                note(b, "horn", m, g(i), (g(i + 1) - g(i)) * 0.92, min(0.3 + 0.12 * (i - b2), 0.66), rel=0.05)
    last = nb - 1
    for k, m in enumerate([88, 84, 88, 91, 91, 93, 94, 94]):     # last bar: clarinet runs up with the ostinato
        t0 = g(last, k / 2)
        note(b, "clar", m, t0, (g(last, (k + 1) / 2) - t0) * 0.8, 0.74)
    for i in s.accents:
        root = CH[chords[i]][0]
        timp(b, root if root <= 46 else root - 12, 0.7, g(i), 1.6)
        b.add("cymbal", I.cymbal(0.3, b.r(), dur=1.5), g(i))
        b.cue(downs[i], f"accent downbeat (bar {i + 1}): timpani + cymbal; {bpm(i):.0f} bpm"
              + (", bass on every beat, xylophone doubles the ostinato" if i == b1 else (", running bass, glock on top, soft brass swells" if i == b2 else "")))
    for k in range(8):                                  # timpani eighths crescendo through the last bar
        timp(b, 36, 0.3 + 0.07 * k, g(last, k / 2), 0.8)
    b.cue(downs[last], f"last bar: dominant seventh, {bpm(last):.0f} bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved")


# ---------------------------------------------------------------- mystery
MYST_MEL = [(0, 0, 1, 69), (0, 1, 1, 65), (0, 2, 1, 69), (0, 3, 2, 74), (1, 1, 1, 70), (1, 2, 2, 69),
            (2, 0, 1, 70), (2, 1, 1, 67), (2, 2, 1, 70), (2, 3, 2, 76), (3, 1, 1, 74), (3, 2, 2, 73)]


def lay_mystery(P, s):
    L, nom = s.z - s.a, _nominal(P)
    n, ratio = (s.bars, 1.0) if s.bars else _fit(L, nom, [2] + list(range(4, 65, 4)))
    if n != 2 and n % 4:
        raise ValueError(f"mystery bars must be 2 or a multiple of 4 (got {n})")
    if not 1 / FIT <= ratio <= FIT:
        raise _short(s, P, "mystery (two slow bars)", 2 * nom / FIT)
    s.n, s.bar = n, L / float(n)
    # (melody bar, chord, is it the closing bar) for every bar played
    s.seq = [(0, "Dm", False), (1, "A7", True)] if n == 2 else [(i, c, p == n // 4 - 1 and i == 3) for p in range(n // 4) for i, c in enumerate(["Dm", "Dm", "Gm", "A7"])]


def play_mystery(b, s):
    a, bar, end = s.a, s.bar, b.fr(s.z)
    g = lin_grid(b.fr, a, bar)
    b.cue(a, f"MYSTERY: the tune at half speed in {b.key(-3, True)} (vibes), tick-tock woodblock + pizzicato, {b.bpm(bar):.0f} bpm felt in two; soft")
    for j, (mb, chord, last) in enumerate(s.seq):
        for (i, beat, d, m) in MYST_MEL:
            if i != mb:
                continue
            t0 = g(j, beat)
            d_s = min(g(j, beat + d), end - 0.12) - t0          # nothing of the minor key rings into the next section
            note(b, "vibes", m, t0, d_s * 0.97, 0.52, trem=0.06, ring=0.1)
            if d >= 2:
                note(b, "mbox", m + 12, t0, 0.5, 0.22, dur=min(1.6, end - 0.05 - t0))
    for j, (mb, chord, last) in enumerate(s.seq):
        root, fifth, tones = CH[chord]
        note(b, "bass", root, g(j, 0), 0.5, 0.5)
        if not last:
            note(b, "bass", fifth, g(j, 2), 0.5, 0.42)
            for beat in range(4):
                wood(b, g(j, beat), 0.44 if beat % 2 == 0 else 0.36, hi=beat % 2 == 0)
            for beat in (1.5, 3.5):
                strum(b, tones[1:], g(j, beat), 0.2, dur=0.22)
        padc(b, [tones[0] - 12] + tones, g(j, 0), g(j + 1, 0) - (0.2 if last else 0.0), 0.22, att=0.35, rel=0.2 if last else 0.45)
    fin = len(s.seq) - 1
    k_ = min(1.0, bar / (52.0 * b.fps / 30)) * b.fps / 30
    for k, df in enumerate([0.0, 14.0, 30.0]):          # the clock runs down: tick ... tock ..... tick
        wood(b, b.fr(a + fin * bar + df * k_), 0.42 - 0.07 * k, hi=k % 2 == 0)
    strum(b, [57, 61, 64, 69], g(fin, 2), 0.22, dur=0.7)
    if len(s.seq) >= 4:
        b.cue(a + (fin - 1) * bar, "answering phrase a step higher")
    b.cue(a + fin * bar, "half cadence: the tick-tock slows and stops")


# ---------------------------------------------------------------- waltz
def lay_waltz(P, s):
    L, fps = s.z - s.a, P.fps
    if len(s.hits) not in (0, 3):
        raise ValueError(f"a waltz takes no hits or exactly three, [pick-up, low point, rest] (got {s.hits})")
    pickup, low, top = s.hits if s.hits else (s.a + 0.1 * fps, s.a + round(0.634 * L), s.z - round(fps / 3))
    nom = 0.75 * _nominal(P) / 1.16                     # one 3/4 bar, a little faster than the plan tempo
    n, ratio = (s.bars, 1.0) if s.bars else _fit(low - pickup, nom, range(2, 33, 2), lambda n: n + 0.5)
    if n % 2:
        raise ValueError(f"waltz bars must be even (got {n})")
    if not 1 / FIT <= ratio <= FIT or top - low < 0.5 * fps:
        raise _short(s, P, "waltz (two bars down to the low point, then at least half a second up to the rest)", 2.5 * nom / FIT + 0.9 * fps)
    if s.z - top > 1.2 * fps:
        raise ValueError(f"waltz: the rest (frame {top:g}) is {(s.z - top) / fps:.1f} s before the end of the section; keep it within 1.2 s or the score has a hole")
    s.n, s.pickup, s.low, s.top = n, pickup, low, top
    lows = low_points(pickup, low, (n + 0.5) / 2)       # one 3/4 bar per half swing
    s.bar = lows[-1] - lows[-2] if len(lows) > 1 else (low - pickup) / (n + 0.5)


def play_waltz(b, s):
    a, n, bar, pickup, low, top = s.a, s.n, s.bar, s.pickup, s.low, s.top
    g = lin_grid(b.fr, low - n * bar, bar, beats=3)     # the last melody bar runs into the low point: g(n) = low
    b.cue(a, f"WALTZ: music box in {b.key()}, {b.bpm(bar, 3):.0f} bpm, pick-up on f{pickup:g}, "
             f"downbeats at " + ", ".join(f"f{g(i) * b.fps:.0f}" for i in range(n)) + f", low point f{low:g}")
    for k, m in enumerate([60, 65, 69]):                 # harp rolls up into the pick-up
        note(b, "harp", m, b.fr(a + 0.3 + 0.9 * k), 0.4, 0.3, dur=1.2)
    note(b, "bass", 41, b.fr(pickup), 0.5, 0.4)
    mel = [(0, -1.5, 1.5, 84), (0, 0, 1, 81), (0, 1, 2, 84), (1, 0, 1, 89), (1, 1, 1, 86), (1, 2, 1, 82)]       # sol | mi sol- | do' la fa
    for p in range(n // 2):
        for (i, beat, d, m) in mel:
            note(b, "mbox", m, g(2 * p + i, beat), 0.4, 0.55)
            note(b, "vibes", m - 12, g(2 * p + i, beat), (g(2 * p + i, beat + d) - g(2 * p + i, beat)) * 0.9, 0.26, trem=0.05)
    for p in range(n // 2):
        for i, (bm, tones) in enumerate([(41, [57, 60]), (46, [58, 62])]):          # I, IV
            note(b, "bass", bm, g(2 * p + i, 0), 0.5, 0.5)
            for beat in (1, 2):
                strum(b, tones, g(2 * p + i, beat), 0.22, dur=0.3)
    # the low point, then up, slower and slower, to the rest
    b.cue(g(n - 1) * b.fps, "the tune steps down do-la-fa into")
    b.cue(low, "the low point (low home note); then the arpeggio climbs, slower and slower, to the rest")
    note(b, "bass", 41, b.fr(low), 0.6, 0.55)
    span = top - low
    for u, m, v in [(0.0, 77, 0.5), (0.26, 81, 0.5), (0.56, 84, 0.5), (1.0, 89, 0.56)]:
        # only the top note (shared with the flat-sixth key of a lullaby) may ring into the next section
        note(b, "mbox", m, b.fr(low + u * span), 0.5, v, dur=2.0 if u == 1.0 else min(1.6, b.fr(s.z - 1) - b.fr(low + u * span)))
        note(b, "vibes", m - 12, b.fr(low + u * span), 0.6, 0.24, trem=0.05)
    b.cue(top, "the rest: the high home note rings, everything else waits")
    for p in range(n // 2):
        padc(b, [53, 57, 60, 65], b.fr(a) if p == 0 else g(2 * p, 0), g(2 * p + 1, 0), 0.2, att=0.25, rel=0.4)
        padc(b, [53, 58, 62, 65], g(2 * p + 1, 0), b.fr(low) if p == n // 2 - 1 else g(2 * p + 2, 0), 0.2, att=0.2, rel=0.4)
    padc(b, [53, 57, 60, 65], b.fr(low), b.fr(top), 0.2, att=0.2, rel=0.3)


# ---------------------------------------------------------------- lullaby
LULL = {  # per kind of bar: melody (eighth, length, midi), harp arpeggio, pad chord
    "A": ([(0, 2, 80), (2, 1, 77), (3, 2, 80), (5, 4, 85)], [49, 56, 61, 65, 61, 56], [49, 56, 61, 63, 65]),
    "B": ([(3, 2, 82), (5, 1, 80)], [49, 58, 61, 66, 61, 58], [49, 58, 61, 66]),
    "C": ([(0, 2, 82), (2, 1, 78), (3, 2, 82), (5, 1, 87)], [44, 51, 56, 61, 66], [44, 56, 61, 63]),
}


def lay_lullaby(P, s):
    L, nom = s.z - s.a, 1.05 * _nominal(P)
    n, ratio = (s.bars, 1.0) if s.bars else _fit(L, nom, range(2, 33))
    if not 1 / FIT <= ratio <= FIT:
        raise _short(s, P, "lullaby (two rocking bars)", 2 * nom / FIT)
    s.n, s.bar = n, L / float(n)
    s.kinds = ["C" if i == n - 1 else "AB"[i % 2] for i in range(n)]       # ... A B A B, the last bar climbs and stays open


def play_lullaby(b, s):
    a, n, bar = s.a, s.n, s.bar
    e = bar / 6.0                                        # one eighth of the 6/8 bar, in frames
    at = lambda i, k=0.0: b.fr(a + i * bar + k * e)
    b.cue(a, f"LULLABY: the tune rocking in 6/8, {b.key(-4)} (the home note is its third), music box + harp + warm pad, "
             f"{60 * b.fps / (bar / 2):.0f} dotted-quarters a minute")
    for i, kind in enumerate(s.kinds):
        for (k, d, m) in LULL[kind][0]:
            note(b, "mbox", m, at(i, k), 0.5, 0.56 if d > 1 else 0.48)
    for i, kind in enumerate(s.kinds):
        for k, m in enumerate(LULL[kind][1]):
            note(b, "harp", m, at(i, k), 0.5, (0.42 if k == 0 else 0.3) * (1.0 if kind != "C" else 1.0 - 0.12 * k))
    wave = lambda t0: (lambda t: 1 + 0.12 * np.sin(2 * np.pi * (t + t0 - b.fr(a)) / (bar / b.fps)))
    for i, kind in enumerate(s.kinds):
        if kind == "A":
            padc(b, LULL[kind][2], at(i), at(i + 1), 0.24, att=0.3, rel=0.5, trem=wave(at(i)))
        elif kind == "B":
            padc(b, LULL[kind][2], at(i), at(i + 1), 0.24, att=0.25, rel=0.5, trem=wave(at(i)))
        else:
            padc(b, LULL[kind][2], at(i), b.fr(s.z) - 0.25, 0.22, att=0.25, rel=0.25, trem=wave(at(i)))
    b.cue(a + (n - 1) * bar, "last bar climbs to an unresolved second (a rising slide whistle can aim for the same note)")


# ---------------------------------------------------------------- bittersweet
def lay_bittersweet(P, s):
    L, fps = s.z - s.a, P.fps
    if len(s.hits) > 1:
        raise ValueError(f"bittersweet takes at most one hit, the frame where the phrase turns sour (got {s.hits})")
    turn = s.hits[0] if s.hits else s.a + round(0.48 * L)
    q = min(8.0 * fps / 30, (turn - s.a) / 9.0, (s.z - turn) / 9.6)       # frames per eighth
    if q < 5.0 * fps / 30:
        raise ValueError(f"bittersweet needs at least 1.5 s before the turn (frame {turn:g}) and 1.6 s after it; this section runs {s.a:g}-{s.z:g}")
    s.turn, s.q = turn, q


def play_bittersweet(b, s):
    a, turn, q, end = s.a, s.turn, s.q, b.fr(s.z)
    lk = lambda f0, k: b.fr(f0 + k * q)
    b.cue(a, f"BITTERSWEET, sweet: the head of the tune in {b.key(-4)} (music box, harp), ending on a rolled chord")
    for (k, m, v) in [(0, 80, 0.5), (2, 77, 0.45), (3, 80, 0.5), (5, 85, 0.56)]:
        note(b, "mbox", m, lk(a, k), 0.5, v)
    for k, m in enumerate([49, 56, 65, 49, 56, 65]):
        note(b, "harp", m, lk(a, k), 0.5, 0.36 if k % 3 == 0 else 0.28)
    for j, m in enumerate([61, 65, 68, 75]):
        note(b, "harp", m, lk(a, 6) + 0.045 * j, 0.5, 0.3)
    padc(b, [49, 56, 61, 65], b.fr(a), b.fr(turn) - 0.1, 0.22, att=0.3, rel=0.35)
    b.cue(turn, "the same phrase again ...")
    note(b, "mbox", 80, lk(turn, 0), 0.5, 0.5)
    note(b, "mbox", 77, lk(turn, 2), 0.5, 0.45, dur=q / b.fps + 0.04)          # the third stops when the flat third arrives
    for k, m in enumerate([49, 56, 65]):
        note(b, "harp", m, lk(turn, k), 0.5, 0.36 if k == 0 else 0.28, dur=1.3 * q / b.fps if k == 2 else min(4.0, end - lk(turn, k)))       # the major third is damped as the smile drops
    droop = [(3, 2, 76), (5, 1, 75), (6, 1, 73), (7, 2.6, 72)]      # four steps down: the smile drops
    for (k, d, m) in droop:
        note(b, "mbox", m, lk(turn, k), 0.5, 0.46, dur=d * q / b.fps + 0.04)
        note(b, "horn", m - 12, lk(turn, k), d * q / b.fps * 0.95, 0.42, kind="soft", scoop=-30.0, fall=-1.2 if k == 7 else 0.0, rel=0.12)
    for k, m in enumerate([49, 56, 64]):
        note(b, "harp", m, lk(turn, 3 + k), 0.5, 0.3, dur=min(4.0, end - lk(turn, 3 + k)))      # the minor chord is gone when the next section starts
    note(b, "harp", 48, lk(turn, 7), 0.6, 0.36)
    padc(b, [49, 56, 61, 65], b.fr(turn), lk(turn, 3), 0.22, att=0.2, rel=0.3)
    padc(b, [49, 56, 61, 64], lk(turn, 3), lk(turn, 7), 0.22, att=0.15, rel=0.3)
    padc(b, [48, 55, 58, 64], lk(turn, 7), end, 0.24, att=0.15, rel=0.25)
    b.cue(turn + 3 * q, "... but it droops: four steps down with a soft sad trombone, landing on the dominant (the way home)")


# ---------------------------------------------------------------- runup
RUN_OST = [(67, 64, 67, 70), (70, 67, 70, 76), (76, 72, 76, 79)]


def lay_runup(P, s):
    L, nom = s.z - s.a, 0.6 * _nominal(P)                # fast: a time-lapse, a dash
    n, ratio = (s.bars, 1.0) if s.bars else _fit(L, nom, range(2, 17))
    if n < 2 or not 1 / FIT <= ratio <= FIT:
        raise _short(s, P, "runup (two fast bars)", 2 * nom / FIT)
    s.n, s.q = n, max(31.0 / 33.0, 0.8 ** (1.0 / (n - 1)))


def play_runup(b, s):
    n = s.n
    g, downs = geo_grid(b.fr, [s.a, s.z], [n], s.q)
    b.cue(s.a, f"RUN-UP: the ostinato on the dominant seventh, {60 * 4 * b.fps / (downs[1] - downs[0]):.0f} bpm and accelerating, {n} bars up into the next section")
    last = n - 1
    for i in range(n):
        u = i / (n - 1)
        o = RUN_OST[2 if i == last else (1 if (last - 1 - i) % 2 == 0 else 0)]
        for k in range(8):
            m = o[k % 4] if not (i == last and k >= 4) else (79, 76, 79, 82)[k - 4]
            t = g(i, k / 2)
            acc = 1.0 if k % 4 == 0 else (0.86 if k % 2 == 0 else 0.74)
            note(b, "mar", m, t, 0.1, (0.5 + 0.2 * u) * acc)
            note(b, "mar", m + 12, t, 0.1, (0.3 + 0.2 * u) * acc, kind="xylo", dp=-0.5)
            if k % 2 == 0 or i == last:
                note(b, "bass", 48 if k % 4 == 0 else (43 if k % 2 == 0 else 60), t, 0.2, 0.62 + 0.15 * u, dur=0.5)
            brush(b, t, (0.3 + 0.25 * u) * (1.0 if k % 2 == 0 else 0.7))
            if k % 2 == 0:
                wood(b, t, 0.35 + 0.15 * u, hi=k % 4 == 0)
    for k, m in enumerate([60, 62, 64, 65, 67, 69, 70, 71]):         # run up into the tune's first note
        t0 = g(last, k / 2)
        note(b, "clar", m, t0, (g(last, (k + 1) / 2) - t0) * 0.8, 0.6 + 0.02 * k)
        note(b, "glock", m + 24, t0, 0.2, 0.28, dur=0.5)
    for k in range(4):
        timp(b, 36, 0.34 + 0.1 * k, g(last, k), 0.8)
    for m in (48, 58, 64):
        note(b, "horn", m, g(n - 2), (g(n) - g(n - 2)) * 0.95, 0.34, rel=0.05)


# ---------------------------------------------------------------- finale
WARM = {0: [(0, 4, [53, 57, 60])], 1: [(0, 2, [53, 58, 62]), (2, 2, [52, 58, 60])], 2: [(0, 2, [53, 57, 60]), (2, 1, [53, 57, 62]), (3, 1, [52, 58, 60])],
        3: [(0, 2, [53, 57, 60]), (2, 1, [52, 58, 60]), (3, 1, [53, 57, 60])], "end": [(0, 2, [53, 57, 60]), (2, 2, [52, 58, 60])]}


def lay_finale(P, s):
    fps = P.fps
    if len(s.hits) > 1:
        raise ValueError(f"a finale takes at most one hit, the frame of the button (got {s.hits})")
    button = s.hits[0] if s.hits else s.z - round(fps / 3)
    nom = _nominal(P) / 1.12                             # it comes home a little faster
    n, ratio = (s.bars, 1.0) if s.bars else _fit(button - s.a, nom, range(2, 33), lambda n: n + 0.5)
    if n < 2 or not 1 / FIT <= ratio <= FIT:
        raise _short(s, P, "finale (two bars of the tune, the tag and the button)", 2.5 * nom / FIT + (s.z - button))
    if not 0.2 * fps <= s.z - button <= 0.7 * fps:
        raise ValueError(f"finale: the button (frame {button:g}) must sit 0.2 to 0.7 s before the end of the section (frame {s.z:g}); "
                         f"put it right after the narrator's last word, about {round(fps / 3)} frames before the end")
    s.n, s.button, s.bar = n, button, (button - s.a) / (n + 0.5)


def play_finale(b, s):
    a, n, bar, button = s.a, s.n, s.bar, s.button
    g = lin_grid(b.fr, a, bar)
    sg = 0.62
    b.cue(a, f"FINALE: the tune comes home, {b.key()}, warm and a little faster ({b.bpm(bar):.1f} bpm): clarinet + glock + marimba, soft horns, pad")
    b.add("cymbal", I.cymbal(0.3, b.r(), dur=1.6), g(0))
    b.add("tri", I.triangle(0.4, b.r(), dur=1.2), g(0), PAN["tri"])
    e = n - 1                                            # the closing bar
    tune(b, g, [i % 4 for i in range(e)], 0.72, ("clar", "mar", "glock"), swing=sg)
    for tr in ("clar", "mar", "glock"):                  # closing bar: home note, then sol-la-ti back up to
        note(b, tr, 77 + (12 if tr == "glock" else 0), g(e, 0), (g(e, 1.5) - g(e, 0)) * 0.9, 0.72 * (0.55 if tr == "glock" else 1.0))
    for (beat, m) in [(2.5, 72), (3, 74), (3.5, 76)]:
        note(b, "clar", m, g(e, sw(beat, sg)), 0.14, 0.7), note(b, "glock", m + 12, g(e, sw(beat, sg)), 0.2, 0.36, dur=0.6)
    for i in range(n):
        boom_chick(b, g, i, ["F", "F", "C7", "C7"] if i == e else CH4[i % 4], 0.7, swing=sg,
                   walk=[(3, 50), (3.5, 52)] if i == e else ([(3.5, 45)] if i % 4 == 0 else None))
    for i in range(n):
        for (beat, d, ms) in WARM["end" if i == e else i % 4]:
            for m in ms:
                note(b, "horn", m, g(i, beat), (g(i, beat + d) - g(i, beat)) * 0.94, 0.4, rel=0.06)
            padc(b, ms + [ms[0] + 12], g(i, beat), g(i, beat + d), 0.27, att=0.12, rel=0.3)
    # tag: "... ti DO! (pom) DO!"  - the last DO is the button, after the narrator's last word
    t1, t2, t3 = g(n, 0), g(n, 1), b.fr(button)
    b.cue(a + n * bar, "tag: tutti home chord ('ta-da'), one low pizzicato dominant ...")
    for m in (41, 53):
        note(b, "bass", m, t1, 0.3, 0.8)
    strum(b, [57, 60, 65, 69], t1, 0.6, dur=0.3)
    note(b, "clar", 77, t1, 0.15, 0.75), note(b, "mar", 77, t1, 0.2, 0.6), note(b, "glock", 89, t1, 0.3, 0.42, dur=0.7)
    wood(b, t1, 0.5)
    note(b, "bass", 48, t2, 0.3, 0.7), wood(b, t2, 0.4, hi=False)
    b.cue(button, "BUTTON: final home chord (pizzicato, marimba, glock, clarinet, soft timpani, triangle), choked to silence by the last frame")
    for m in (41, 53):
        note(b, "bass", m, t3, 0.3, 0.9)
    strum(b, [53, 57, 60, 65, 69], t3, 0.7, dur=0.35)
    note(b, "clar", 77, t3, 0.14, 0.8), note(b, "clar", 65, t3, 0.14, 0.7)
    note(b, "mar", 65, t3, 0.2, 0.7), note(b, "mar", 77, t3, 0.2, 0.6, kind="xylo")
    for m in (89, 93, 96):
        note(b, "glock", m, t3, 0.3, 0.4, dur=0.6)
    for m in (53, 57, 60):
        note(b, "horn", m, t3, 0.12, 0.5, kind="stab", scoop=-12.0)
    timp(b, 41, 0.6, t3, 0.6)
    b.add("tri", I.triangle(0.4, b.r(), dur=0.5), t3, PAN["tri"])


def lay_silence(P, s):
    if s.z - s.a < 0.25 * P.fps:
        raise ValueError(f"a silence shorter than a quarter second ({s.z - s.a:g} frames) is not heard as one; remove it or make it longer")


# ---------------------------------------------------------------- the mood table
class Mood:
    def __init__(self, lay, play, level, shift, choke, hits, doc):
        self.lay, self.play, self.level, self.shift, self.choke, self.hits, self.doc = lay, play, level, shift, choke, hits, doc


# level = music level in LU relative to the voice (after the speech duck); shift = key of the section relative to home
# (semitones); choke = a silence after it fades the ring in 0.18 s instead of cutting it dead
MOODS = {
    "silence": Mood(lay_silence, None, None, 0, False, "none", "No music. Under the cold open (the effects carry it), for a dead stop after a chase, for a held breath."),
    "theme": Mood(lay_theme, play_theme, -9.5, 0, False, "none", "The tune, swung and bouncy: clarinet, pizzicato bass, plucked chords, brushes; repeats are doubled by marimba and glockenspiel. "
                  'Option "end": "stop" ends it on a stop chord two beats before the next section (leaves room for a boing, a slide whistle).'),
    "chase": Mood(lay_chase, play_chase, (-11.0, -10.3, -9.5), 0, False, "0-2 frames where a downbeat with timpani + cymbal must land (a kick, a reveal)",
                  "Running marimba ostinato that accelerates to twice its speed and climbs chord by chord; adds xylophone, running bass, glockenspiel and brass in three gears; "
                  "ends unresolved. For falls, pursuits, countdowns, anything that builds. Follow it with silence (dead stop) or let it crash into the next mood."),
    "mystery": Mood(lay_mystery, play_mystery, -11.5, 0, True, "none", "The tune at half speed in the relative minor: vibraphone over a tick-tock woodblock and pizzicato, the clock runs down at the end. "
                    "For explanations, 'but wait', thinking, science."),
    "waltz": Mood(lay_waltz, play_waltz, -11.0, 0, True, "none, or exactly three: [pick-up, low point, rest]",
                  "Music-box waltz: a pick-up, down to a low point, then an arpeggio that climbs slower and slower to a ringing rest. For swings, pendulums, floating, gentle analogies."),
    "lullaby": Mood(lay_lullaby, play_lullaby, -11.5, -4, True, "none", "The tune rocking in 6/8 in a warmer, darker key: music box, harp arpeggios, breathing pad; the last bar stays open. "
                    "For night, sea, space, sleep, wonder. A silence after it sounds like a held breath."),
    "bittersweet": Mood(lay_bittersweet, play_bittersweet, -11.5, -4, True, "0-1: the frame where it turns sour (default: the middle)",
                        "One little phrase twice: first sweet (music box, harp), then it droops with a soft sad trombone and lands on the dominant. For 'luckily ... unluckily', hope then oops."),
    "runup": Mood(lay_runup, play_runup, -9.5, 0, False, "none", "Two to six fast accelerating bars on the dominant with a clarinet run: a spring that releases into the next section. "
                  "For time-lapses, returns, 'here we go again'. Put it right before a theme or the finale."),
    "finale": Mood(lay_finale, play_finale, -9.5, 0, False, "0-1: the frame of the button (default: a third of a second before the section ends)",
                   "The tune comes home, warm and a little faster, with horns and pad, then the tag and the BUTTON, one short final chord. Use it once, as the last section."),
}
SECTION_KEYS = ("from", "mood", "hits", "bars", "end", "level")


class Sec:
    def __init__(self, i, d, a, z):
        self.i, self.mood, self.a, self.z = i, d.get("mood"), a, z
        self.hits = list(d.get("hits", []) or [])
        self.bars = d.get("bars")
        self.opts = {k: v for k, v in d.items() if k not in ("from", "mood", "hits", "bars") and not k.startswith("_")}
        self.silent = self.mood == "silence"

    @property
    def name(self):
        return f"{self.i + 1} {self.mood}"


class Plan:
    """the score plan of one video, checked and laid out (bars, grids) but not played. problems / notes are sentences."""

    def __init__(self, P):
        self.P, self.problems, self.notes, self.secs = P, [], [], []
        self.tr = (P.key_pc - 5 + 6) % 12 - 6            # written in F; transposed by -6..+5 semitones
        try:
            self.theme = get_theme(P.theme)
        except ValueError as e:
            self.problems.append(f"score.json: {e}")
            self.theme = THEMES["stroll"]
        raw, bad = P.sections, self.problems
        starts = []
        for i, d in enumerate(raw):
            f = d.get("from")
            if not (isinstance(f, (int, float)) and not isinstance(f, bool)) or not 0 <= f < P.total:
                bad.append(f"score.json: section {i + 1} needs \"from\", a frame inside 0..{P.total - 1} (got {f!r})")
                return
            starts.append(f)
        if starts[0] != 0:
            bad.append(f'score.json: the first section must start at frame 0 (it starts at {starts[0]:g}); use {{"from": 0, "mood": "silence"}} for a cold open without music')
        if any(b_ <= a_ for a_, b_ in zip(starts, starts[1:])):
            bad.append(f"score.json: sections must be in frame order, each 'from' after the one before (got {', '.join(f'{x:g}' for x in starts)})")
            return
        marks = P.landmarks()
        for i, d in enumerate(raw):
            where = f"score.json: section {i + 1} (from {starts[i]:g})"
            for k in d:
                if not k.startswith("_") and k not in SECTION_KEYS:
                    bad.append(f"{where}: " + pick(k, SECTION_KEYS, "key"))
            if d.get("mood") not in MOODS:
                bad.append(f"{where}: " + pick(d.get("mood"), MOODS, "mood"))
                continue
            s = Sec(i, d, starts[i], starts[i + 1] if i + 1 < len(raw) else P.total)
            ok = isinstance(s.hits, list) and all(isinstance(h, (int, float)) and not isinstance(h, bool) for h in s.hits)
            if not ok or any(not s.a <= h < s.z for h in s.hits) or any(y <= x for x, y in zip(s.hits, s.hits[1:])):
                bad.append(f"{where}: hits must be frames in rising order inside the section, {s.a:g}..{s.z - 1:g} (got {d.get('hits')!r})")
                continue
            if s.hits and MOODS[s.mood].hits == "none":
                bad.append(f"{where}: mood {s.mood} takes no hits (got {s.hits})")
                continue
            if s.bars is not None and not (isinstance(s.bars, int) and not isinstance(s.bars, bool) and 2 <= s.bars <= 64):
                bad.append(f"{where}: bars must be a whole number 2..64 (got {s.bars!r}); leave it out to let the tempo decide")
                continue
            if "end" in s.opts and s.mood != "theme":
                bad.append(f'{where}: "end" is only for mood theme')
            lv, want = s.opts.get("level"), (3 if s.mood == "chase" else 1)
            lvs = lv if isinstance(lv, list) else [lv] * want
            if lv is not None and (s.silent or len(lvs) != want or not all(isinstance(x, (int, float)) and not isinstance(x, bool) and -24 <= x <= -6 for x in lvs)):
                bad.append(f"{where}: level must be LU under the voice, -24..-6" + (", or a list of three for the three gears of a chase" if s.mood == "chase" else "") + f" (got {lv!r})")
                continue
            try:
                MOODS[s.mood].lay(P, s)
            except ValueError as e:
                bad.append(f"{where}, {s.mood}: {e}")
                continue
            if s.a not in marks:
                near = min(marks, key=lambda m: abs(m - s.a))
                self.notes.append(f"section {i + 1} ({s.mood}) starts at frame {s.a:g}, which is no shot start, event or word start (nearest: {near:g})")
            self.secs.append(s)
        if bad:
            return
        if not any(not s.silent for s in self.secs):
            self.notes.append("the score is silent from start to end (every section is 'silence')")
        for s in self.secs:
            if s.mood == "finale" and s is not self.secs[-1]:
                self.notes.append(f"section {s.i + 1} is a finale but not the last section: its button will sound in the middle of the film")
        last = self.secs[-1]
        if last.mood == "finale" and P.words and P.fr(last.button) < P.words[-1]["e"] - 0.05:
            self.notes.append(f"the button (frame {last.button:g}) sounds before the narrator's last word ends ({P.words[-1]['e'] * P.fps:.0f}); it is meant to come right after it")

    # ---- what the mix needs: one row per stretch of music with its own level
    def levels(self):
        """[(name, start s, end s, LU under the voice or None for silence)]"""
        out, fr = [], self.P.fr
        for s in self.secs:
            d = MOODS[s.mood].level
            lv = s.opts.get("level", d)
            if s.mood == "chase":
                lv = lv if isinstance(lv, (list, tuple)) else d
                for k in range(3):
                    out.append((f"{s.name} {'abc'[k]}", fr(s.parts[k]), fr(s.parts[k + 1]), float(lv[k])))
            else:
                out.append((s.name, fr(s.a), fr(s.z), None if s.silent else float(lv)))
        return out

    def tonic(self, f):
        """pitch class (0 = C) of the key the music is in at frame f; a silence keeps the key of the music before it"""
        cur = None
        for s in self.secs:
            if s.silent:
                continue
            if s.a <= f or cur is None:
                cur = s
        return (self.P.key_pc + (MOODS[cur.mood].shift if cur else 0)) % 12


# ================================================================ render
def build(P, plan):
    b = Band(P, plan)
    for s in plan.secs:
        if not s.silent:
            MOODS[s.mood].play(b, s)
    return b


def gates(P, plan):
    """score-wide silences, applied after the reverb so they are really silent: every 'silence' section (cut dead,
    or choked in 0.18 s after a mood that rings) and the end of the film (the button is choked over the last frames)"""
    N, fr = P.n, P.fr
    g = np.ones(N)

    def close(f_a, f_b, fade=0.008):
        a, z = ns(fr(f_a)), min(N, ns(fr(f_b)))
        k = min(ns(fade), a)
        g[a - k:a] *= np.linspace(1, 0, k)
        g[a:z] = 0.0
    for i, s in enumerate(plan.secs):
        if not s.silent:
            continue
        open_at = s.z - 0.5 if s.z < P.total else s.z     # the music may start half a frame early, never late
        if i == 0:
            g[: (ns(fr(s.z)) - ns(0.004)) if s.z < P.total else N] = 0.0
        elif MOODS[plan.secs[i - 1].mood].choke:
            a, z = ns(fr(s.a) - 0.06), ns(fr(s.a) + 0.12)       # choke the ring around the stop (0.18 s)
            g[a:z] *= np.linspace(1, 0, z - a) ** 1.5
            g[z: ns(fr(open_at))] = 0.0
        else:
            close(s.a, open_at)
    a = ns(fr(P.total - 5))                              # button: full for 5 frames, gone 5 frames later
    g[a:] *= np.linspace(1, 0, N - a) ** 1.3
    return g


def render(P, plan, b, ref=-20.0):
    hall = make_ir(1.4, 7, pre=0.018, hf=1.5)
    N = P.n
    dry = np.zeros((2, N))
    wet = np.zeros((2, N))
    levels = {}
    for k, x in b.tk.items():
        if not np.any(x):
            continue
        if k in ("brush", "cymbal"):
            x = lp(x, 9500, 2)
        L = integrated(x)
        tgt = ref + TARGET.get(k, -6)
        levels[k] = (round(float(L), 1), round(tgt, 1))
        x = x * dbg(tgt - L)
        b.tk[k] = x
        dry += x
        wet += b.send[k] * x
    out = dry + 0.7 * convolve_st(wet.mean(0), hall)
    out = lp(hp(out, 30, 2), 12000, 4)
    return out * gates(P, plan)[None, :], levels
