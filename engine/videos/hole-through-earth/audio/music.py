# Original score for "What If You Jumped Into a Hole Through the Earth?", composed and synthesized here
# (instruments.py; no samples). Not a march: a bouncy swung "Sunday stroll" for clarinet, pizzicato, marimba, glock.
# ONE four-bar tune (THEME, F major) that every section varies:
#   hook            f0-118      no music (the rush only)
#   sunday          118-448     the tune, swung, 130.9 bpm: 4 bars + first half again, stop chord before the jump
#   fall            448-861     the tune's head ("sol-mi-sol-do'") as an ostinato that accelerates (142 -> 269 bpm) and
#                               climbs through F Gm Bb C Dm Eb F G C7, downbeats on the kick (633) and the core (743)
#   stop            861         cut dead ("But wait"), silent until 915
#   explain         915-1123    the tune at half speed in D minor over a tick-tock (vibes, pizzicato, woodblock)
#   swing           1123-1268   music-box waltz in F, one bar per half swing of the picture's swing: pick-up on the
#                               push (1126), down to the bottom (1215), up slower and slower to the top (1258)
#   lullaby         1268-1442   the tune as a 6/8 lullaby in Db (music box, harp, pad); breath held at 1442
#   luckily/unl.    1465-1614   the same little phrase twice: sweet, then it droops (sad trombone) onto C
#   return          1614-1707   ostinato on C7, accelerating, up into
#   payoff          1707-1925   the tune, warm, a little faster (148.6 bpm), tag, button on 1925, silent by 1935
# All landmarks are read from the timeline (shot starts and event frames), so a retimed shots.json retimes the score.
import numpy as np
from scipy.interpolate import PchipInterpolator
from dsp import ns, rng, pan, place, dbg, make_ir, convolve_st, integrated, lp, hp
import instruments as I
import timeline as T

N = ns(T.DUR)
F = I.m2f
fr = T.fr

# ---------------------------------------------------------------- landmarks (frames)
_w = T.events("wind_rush")
FL = T.FLASH_F                                              # 118  white flash: music starts
FALL = _w[1].f                                              # 448  he is in the tunnel
KICK = T.event_f("impact_kick", 0)                          # 633  "shoots"
STOP = T.event_f("record_stop")                             # 861  "But wait"
CORE = T.SHOTS[T.shot_of(STOP - 1)][0]                      # 743  last shot of the fall (white-hot core)
MYST = T.event_f("music_mystery")                           # 915  explanation
_sw = T.events("swing_creak")[0]
SW0 = T.SHOTS[_sw.shot][0]                                  # 1123 park
BOTTOM = T.event_f("whoosh", shot=_sw.shot)                 # 1215 fastest at the bottom
TOP = T.event_f("ting", shot=_sw.shot)                      # 1258 stops at the top
OCEAN = T.event_f("amb_ocean_night")                        # 1268
_oc = T.shot_of(OCEAN)
HOLD = T.event_f("ting", shot=_oc)                          # 1442 he stops; held breath
LUCK = T.SHOTS[_oc + 1][0]                                  # 1465 "Luckily"
UNLUCK = T.SHOTS[_oc + 2][0]                                # 1537 "Unluckily"
RET = _w[2].f                                               # 1614 return trip
HOME = _w[2].to                                             # 1707 back in his garden
BUTTON = T.event_f("music_button")                          # 1925
END = T.TOTAL

SECTIONS = [("hook", 0.0, fr(FL)), ("sunday", fr(FL), fr(FALL)), ("fall1", fr(FALL), fr(KICK)), ("fall2", fr(KICK), fr(CORE)),
            ("fall3", fr(CORE), fr(STOP)), ("stop", fr(STOP), fr(MYST)), ("explain", fr(MYST), fr(SW0)), ("swing", fr(SW0), fr(OCEAN)),
            ("lullaby", fr(OCEAN), fr(HOLD)), ("breath", fr(HOLD), fr(LUCK)), ("luckily", fr(LUCK), fr(RET)), ("return", fr(RET), fr(HOME)),
            ("payoff", fr(HOME), T.DUR)]
SILENT = ("hook", "stop", "breath")

# ---------------------------------------------------------------- the tune: (bar, beat, length in beats, midi), F major
THEME = [
    (0, 0, .5, 72), (0, .5, .5, 69), (0, 1, .5, 72), (0, 1.5, 1, 77), (0, 2.5, .5, 74), (0, 3, 1, 72),
    (1, 0, .5, 74), (1, .5, .5, 70), (1, 1, .5, 74), (1, 1.5, 1, 79), (1, 2.5, .5, 77), (1, 3, 1, 76),
    (2, 0, .5, 77), (2, .5, .5, 81), (2, 1, 1, 84), (2, 2, .5, 81), (2, 2.5, .5, 77), (2, 3, .5, 74), (2, 3.5, .5, 76),
    (3, 0, 2, 77),
]
HEAD = [(0, .5), (.5, .5), (1, .5), (1.5, 1), (2.5, .5), (3, 1)]          # rhythm of a theme bar's head motif
CH = {  # root, fifth (pizzicato bass), chord tones (plucked)
    "F": (41, 48, [57, 60, 65]), "Gm": (43, 50, [58, 62, 65]), "C7": (48, 43, [58, 60, 64]), "Dm": (50, 45, [57, 62, 65]),
    "Bb": (46, 41, [58, 62, 65]), "C": (48, 43, [55, 60, 64]), "Eb": (51, 46, [58, 63, 67]), "G": (43, 50, [59, 62, 67]),
    "A7": (45, 40, [57, 61, 64]), "Db": (37, 44, [56, 61, 65]),
}
SUNDAY_CH = [["F"] * 4, ["Gm", "Gm", "C7", "C7"], ["F", "F", "Dm", "C7"], ["F", "F", "C7", "F"], ["F"] * 4, ["Gm", "Gm", "C7", "C7"]]

R = rng(3811)


def _r():
    return rng(int(R.integers(1 << 30)))


def _v(v, spread=0.06):
    return v * R.uniform(1 - spread, 1 + spread)


def sw(beat, amount=2 / 3):
    """swing: the off-beat eighth is played late"""
    fl = np.floor(beat)
    return fl + (amount if abs(beat - fl - 0.5) < 1e-6 else beat - fl)


def lin_grid(f0, bar_frames, beats=4):
    return lambda bar, beat=0.0: fr(f0 + (bar + beat / beats) * bar_frames)


def geo_grid(marks, counts, q):
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


class Band:
    def __init__(self):
        self.tr, self.send, self.cues = {}, {}, []

    def track(self, name, send):
        if name not in self.tr:
            self.tr[name] = np.zeros((2, N))
            self.send[name] = send
        return self.tr[name]

    def add(self, name, x, t, p=0.0, g=1.0):
        place(self.tr[name], pan(x, p) if np.ndim(x) == 1 else x, t, g)

    def cue(self, f, text):
        self.cues.append((fr(f), text))


TRACKS = [("clar", 0.16), ("glock", 0.22), ("mar", 0.14), ("bass", 0.10), ("chord", 0.16), ("brush", 0.10), ("wood", 0.14),
          ("vibes", 0.24), ("mbox", 0.26), ("harp", 0.22), ("pad", 0.25), ("horn", 0.20), ("timp", 0.18), ("cymbal", 0.16), ("tri", 0.25)]
PAN = {"clar": 0.12, "glock": -0.3, "mar": 0.28, "bass": -0.05, "chord": 0.22, "brush": 0.1, "wood": -0.2, "vibes": -0.25, "mbox": 0.18,
       "harp": -0.15, "horn": -0.2, "timp": -0.1, "cymbal": 0.0, "tri": 0.3}


def note(b, track, m, t, d, vel, **kw):
    """one note of `track` at time t (s), length d (s)"""
    f = F(m)
    if track == "clar":
        x = I.clarinet(f, max(d, 0.06), _v(vel), _r(), **kw)
    elif track == "glock":
        x = I.glock(f, _v(vel), _r(), dur=kw.get("dur", 1.4))
    elif track == "mar":
        x = I.mallet(f, _v(vel), _r(), kw.get("kind", "marimba"))
    elif track == "bass":
        x = I.pluck(f, _v(vel), _r(), dur=kw.get("dur", 0.8), bright=0.35)
    elif track == "chord":
        x = I.pluck(f, _v(vel), _r(), dur=kw.get("dur", 0.4), bright=0.6)
    elif track == "vibes":
        x = I.vibes(f, _v(vel), _r(), dur=max(1.2, d + 0.9), damp=d + kw.get("ring", 0.4), trem_depth=kw.get("trem", 0.1))
    elif track == "mbox":
        x = I.musicbox(f, _v(vel), _r(), dur=kw.get("dur", 1.6))
    elif track == "harp":
        x = I.harp(f, _v(vel), _r(), dur=kw.get("dur", 2.2))
    elif track == "horn":
        x = I.brass(f, d, vel, _r(), kw.get("kind", "soft"), scoop=kw.get("scoop", -8.0), fall=kw.get("fall", 0.0), rel=kw.get("rel", 0.1))
    else:
        raise KeyError(track)
    b.add(track, x, t + R.normal(0, 0.0015), PAN.get(track, 0.0) + kw.get("dp", 0.0))


def strum(b, tones, t, vel, dur=0.4, up=False):
    seq = tones[::-1] if up else tones
    for k, m in enumerate(seq):
        b.add("chord", I.pluck(F(m), _v(vel), _r(), dur=dur, bright=0.6), t + 0.007 * k, PAN["chord"] - 0.08 * k)


def brush(b, t, vel, swish=False):
    b.add("brush", I.brush(_v(vel), _r(), dur=0.36 if swish else 0.3, swish=swish), t - (0.05 if swish else 0.0), PAN["brush"])


def wood(b, t, vel, hi=True):
    b.add("wood", I.woodblock(_v(vel), _r(), 1180.0 if hi else 880.0), t, PAN["wood"])


def padc(b, ms, t0, t1, vel, att=0.3, rel=0.5, trem=None):
    b.add("pad", I.pad([F(m) for m in ms], t1 - t0, vel, _r(), att=att, rel=rel, trem=trem), t0)


def tune(b, g, bars, vel, tracks=("clar",), swing=2 / 3, octave=0, gate=0.88, only=None):
    """play THEME bars `bars` on grid g (bar index on the grid = position in `bars`)"""
    for i, tb in enumerate(bars):
        for (bar, beat, d, m) in THEME:
            if bar != tb or (only and not only(bar, beat)):
                continue
            t0, t1 = g(i, sw(beat, swing)), g(i, sw(beat + d, swing))
            for tr in tracks:
                o = 12 if tr == "glock" else 0
                kw = dict(dur=min(1.4, t1 - t0 + 0.3)) if tr == "glock" else {}     # damped glock: stepwise notes do not smear
                note(b, tr, m + octave + o, t0, (t1 - t0) * gate, vel * (0.55 if tr == "glock" else (0.8 if tr == "mar" else 1.0)), **kw)


def boom_chick(b, g, i, chords, vel, swing=2 / 3, ghost=True, brushes=True, walk=None):
    """one bar of the Sunday accompaniment: pizzicato bass on 1 and 3, plucked chords on 2 and 4 (+ swung up-strokes)"""
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


# ================================================================ sections
def sunday(b):
    bar = (FALL - FL) / 6.0
    g = lin_grid(FL, bar)
    b.cue(FL, f"SUNDAY THEME starts on the flash: F major, swung, {60 * 4 * T.FPS / bar:.1f} bpm; clarinet tune, pizzicato boom-chick, brushes")
    b.add("tri", I.triangle(0.4, _r(), dur=1.2), g(0), PAN["tri"])
    b.add("cymbal", I.cymbal(0.22, _r(), dur=1.4), g(0))
    tune(b, g, [0, 1, 2, 3], 0.62, ("clar",))
    for (bar_, beat, d, m) in THEME:                    # glock sparkles on the long notes
        if d >= 1 and bar_ < 4:
            note(b, "glock", m + 12, g(bar_, sw(beat)), 0.5, 0.34)
    for i in range(4):
        boom_chick(b, g, i, SUNDAY_CH[i], 0.62 if i else 0.58, ghost=i > 0,
                   walk=[(3.5, 45)] if i == 0 else ([(3.5, 40)] if i == 2 else None))
    strum(b, CH["C7"][2], g(3, 2), 0.5, dur=0.3), note(b, "bass", 41, g(3, 3), 0.4, 0.66)      # "pom-pom": C7, F
    wood(b, g(3, 2), 0.5), wood(b, g(3, 3), 0.55, hi=False)
    b.cue(FL + 3 * bar, "theme bar 4: the tune lands on F, 'pom-pom' answer (C7, F) on beats 3 and 4")
    # second statement (bars 5-6): fuller, tune doubled by marimba + glock; bar 6 stops on a C7 chord for the jump
    tune(b, lin_grid(FL + 4 * bar, bar), [0], 0.68, ("clar", "mar", "glock"))
    b.cue(FL + 4 * bar, "second statement: tune doubled by marimba and glockenspiel")
    for (i_, beat, d, m) in [(5, 0, .5, 74), (5, .5, .5, 70), (5, 1, .5, 74), (5, 1.5, .5, 79)]:
        for tr in ("clar", "mar", "glock"):
            note(b, tr, m + (12 if tr == "glock" else 0), g(i_, sw(beat)), (g(i_, sw(beat + d)) - g(i_, sw(beat))) * 0.85, 0.7 * (0.55 if tr == "glock" else 1.0))
    boom_chick(b, g, 4, SUNDAY_CH[4], 0.68, walk=[(3.5, 42)])
    root, fifth, tones = CH["Gm"]
    note(b, "bass", root, g(5, 0), 0.4, 0.68), brush(b, g(5, 0), 0.3, swish=True)
    strum(b, tones, g(5, 1), 0.4), brush(b, g(5, 1), 0.4)
    ts = g(5, 2)                                        # STOP CHORD: C7, everybody short; vibes let it ring under the boing
    for m in (48, 36):
        note(b, "bass", m, ts, 0.3, 0.8)
    strum(b, [58, 60, 64, 67], ts, 0.6, dur=0.3)
    note(b, "clar", 76, ts, 0.16, 0.72), note(b, "mar", 76, ts, 0.2, 0.6), note(b, "glock", 88, ts, 0.3, 0.42, dur=0.8)
    for m in (58, 64, 67, 72):
        note(b, "vibes", m, ts, fr(FALL) - ts - 0.15, 0.3, trem=0.3, ring=0.1)      # damped as the fall starts
    wood(b, ts, 0.6)
    b.cue(FL + 5.5 * bar, "stop chord (C7) on 'math': the band leaves the boing and the slide whistle alone, vibes ring")


def fall(b):
    g, downs = geo_grid([FALL, KICK, CORE, STOP], [4, 3, 4], 0.938)
    nb = len(downs) - 1
    bpm = lambda i: 60 * 4 * T.FPS / (downs[i + 1] - downs[i])
    b.cue(FALL, f"FALL OSTINATO: the tune's head as running eighths (marimba), {bpm(0):.0f} bpm and accelerating; bars F F Gm Gm")
    chords = ["F", "F", "Gm", "Gm", "Bb", "C", "Dm", "Eb", "F", "G", "C7"]
    ost = [(60, 57, 60, 65), (60, 57, 60, 65), (62, 58, 62, 67), (62, 58, 62, 67), (65, 62, 65, 70), (67, 64, 67, 72), (69, 65, 69, 74),
           (70, 67, 70, 75), (72, 69, 72, 77), (74, 71, 74, 79), (76, 72, 76, 79)]
    heads = {0: 60, 2: 62, 4: 65, 5: 67, 6: 69, 7: 70, 8: 72, 9: 74}       # "sol" of each bar's head motif
    for i in range(nb):
        u = i / (nb - 1)
        vel = 0.46 + 0.3 * u
        root, fifth, tones = CH[chords[i]]
        for k in range(8):
            m = ost[i][k % 4]
            if i == nb - 1 and k >= 4:
                m = (79, 76, 79, 82)[k - 4]            # last half bar climbs to the 7th (Bb): unresolved at the cut
            t = g(i, k / 2)
            acc = 1.0 if k % 4 == 0 else (0.86 if k % 2 == 0 else 0.74)
            note(b, "mar", m, t, 0.1, vel * acc)
            if i >= 4:
                note(b, "mar", m + 12, t, 0.1, vel * acc * (0.5 + 0.25 * u), kind="xylo", dp=-0.5)
            if i >= 7 and k % 2 == 0:
                note(b, "glock", m + 24, t, 0.2, 0.2 + 0.16 * u, dur=0.5)
            # pizzicato bass: 1 and 3 -> every beat -> running eighths
            if (i < 4 and k in (0, 4)) or (4 <= i < 7 and k % 2 == 0) or i >= 7:
                bm = (root if k == 0 else fifth) if i < 4 else (root if k % 4 == 0 else (fifth if k % 2 == 0 else root + 12))
                note(b, "bass", bm, t, 0.2, (0.6 + 0.25 * u) * (1.0 if k % 2 == 0 else 0.7), dur=0.5)
            brush(b, t, (0.22 + 0.4 * u) * (1.0 if k % 2 == 0 else 0.7))
            if i >= 4 and k % 2 == 0:
                wood(b, t, 0.3 + 0.3 * u, hi=k % 4 == 0)
        if i in heads:                                  # the tune's head, one step higher every time (clarinet)
            base = heads[i] + 12
            ivs = np.array(ost[i]) - ost[i][0]          # sol mi sol do' of this chord
            seq = [base, base + ivs[1], base, base + ivs[3], base + ivs[3] - (3 if chords[i] in ("F", "Bb", "C", "Eb", "G") else 2), base]
            for (beat, d), m in zip(HEAD, seq):
                t0 = g(i, beat)
                note(b, "clar", int(m), t0, (g(i, beat + d) - t0) * 0.85, 0.5 + 0.28 * u)
                if i >= 7 and d >= 1:
                    note(b, "glock", int(m) + 12, t0, 0.3, 0.3, dur=0.7)
        if i >= 7:                                      # white-hot core: soft brass swell per bar
            for m in tones:
                note(b, "horn", m, g(i), (g(i + 1) - g(i)) * 0.92, 0.3 + 0.12 * (i - 7), rel=0.05)
    last = nb - 1
    for k, m in enumerate([88, 84, 88, 91, 91, 93, 94, 94]):     # last bar: clarinet runs up with the ostinato
        t0 = g(last, k / 2)
        note(b, "clar", m, t0, (g(last, (k + 1) / 2) - t0) * 0.8, 0.74)
    for i, why in [(4, "kick ('shoots')"), (7, "the white-hot core")]:
        root = CH[chords[i]][0]
        b.add("timp", I.timpani(F(root if root <= 46 else root - 12), 0.7, _r(), dur=1.6), g(i), PAN["timp"])
        b.add("cymbal", I.cymbal(0.3, _r(), dur=1.5), g(i))
        b.cue(downs[i], f"downbeat on {why}: {chords[i]} major, timpani + cymbal; {bpm(i):.0f} bpm"
              + (", bass on every beat, xylophone doubles the ostinato" if i == 4 else ", running bass, glock on top, soft brass swells"))
    for k in range(8):                                  # timpani eighths crescendo through the last bar
        b.add("timp", I.timpani(F(36), 0.3 + 0.07 * k, _r(), dur=0.8), g(last, k / 2), PAN["timp"])
    b.cue(downs[last], f"last bar: C7, {bpm(last):.0f} bpm, everything climbs (clarinet run, timpani eighths)")
    b.cue(STOP, "DEAD STOP on 'But wait' (unresolved C7): the score is silent until the explanation")


def explain(b):
    bar = (SW0 - MYST) / 4.0
    g = lin_grid(MYST, bar)
    b.cue(MYST, f"EXPLANATION: the tune at half speed in D minor (vibes), tick-tock woodblock + pizzicato, {60 * 4 * T.FPS / bar:.0f} bpm felt in two; soft")
    melody = [(0, 0, 1, 69), (0, 1, 1, 65), (0, 2, 1, 69), (0, 3, 2, 74), (1, 1, 1, 70), (1, 2, 2, 69),
              (2, 0, 1, 70), (2, 1, 1, 67), (2, 2, 1, 70), (2, 3, 2, 76), (3, 1, 1, 74), (3, 2, 2, 73)]
    for (i, beat, d, m) in melody:
        t0 = g(i, beat)
        d_s = min(g(i, beat + d), fr(SW0) - 0.12) - t0          # nothing of D minor rings into the swing
        note(b, "vibes", m, t0, d_s * 0.97, 0.52, trem=0.06, ring=0.1)
        if d >= 2:
            note(b, "mbox", m + 12, t0, 0.5, 0.22, dur=min(1.6, fr(SW0) - 0.05 - t0))
    chords = ["Dm", "Dm", "Gm", "A7"]
    for i in range(4):
        root, fifth, tones = CH[chords[i]]
        last = i == 3
        note(b, "bass", root, g(i, 0), 0.5, 0.5)
        if not last:
            note(b, "bass", fifth, g(i, 2), 0.5, 0.42)
            for beat in range(4):
                wood(b, g(i, beat), 0.44 if beat % 2 == 0 else 0.36, hi=beat % 2 == 0)
            for beat in (1.5, 3.5):
                strum(b, tones[1:], g(i, beat), 0.2, dur=0.22)
        padc(b, [tones[0] - 12] + tones, g(i, 0), g(i + 1, 0) - (0.2 if last else 0.0), 0.22, att=0.35, rel=0.2 if last else 0.45)
    for k, df in enumerate([0.0, 14.0, 30.0]):          # the clock runs down: tick ... tock ..... tick
        wood(b, fr(MYST + 3 * bar + df), 0.42 - 0.07 * k, hi=k % 2 == 0)
    strum(b, [57, 61, 64, 69], g(3, 2), 0.22, dur=0.7)
    b.cue(MYST + 2 * bar, "answering phrase a step higher (Gm), as he passes the centre")
    b.cue(MYST + 3 * bar, "half cadence on A: the tick-tock slows and stops ('slowing him down')")


def swing(b):
    push = T.event_f("push_whoosh", shot=_sw.shot, default=SW0 + 3)
    bots = T.swing_bottoms(push, BOTTOM)                 # the swing passes the bottom here (the rope creaks)
    bar = bots[-1] - bots[-2] if len(bots) > 1 else (BOTTOM - push) / 2.5       # frames per half swing = one 3/4 bar
    g = lin_grid(BOTTOM - 2 * bar, bar, beats=3)         # bars 0 and 1 run up to the bottom; g(2) = BOTTOM
    b.cue(SW0, f"SWING WALTZ: music box in F, one 3/4 bar per half swing ({60 * 3 * T.FPS / bar:.0f} bpm), pick-up on the push (f{push:g}), "
               f"downbeats when the swing passes the bottom (f{g(0) * T.FPS:.0f}, f{g(1) * T.FPS:.0f}, f{BOTTOM:g})")
    for k, m in enumerate([60, 65, 69]):                 # harp rolls up into the push
        note(b, "harp", m, fr(SW0 + 0.3 + 0.9 * k), 0.4, 0.3, dur=1.2)
    note(b, "bass", 41, fr(push), 0.5, 0.4)
    mel = [(0, -1.5, 1.5, 84), (0, 0, 1, 81), (0, 1, 2, 84), (1, 0, 1, 89), (1, 1, 1, 86), (1, 2, 1, 82)]       # sol | mi sol- | do' la fa
    for (i, beat, d, m) in mel:
        note(b, "mbox", m, g(i, beat), 0.4, 0.55)
        note(b, "vibes", m - 12, g(i, beat), (g(i, beat + d) - g(i, beat)) * 0.9, 0.26, trem=0.05)
    for i, (bm, tones) in enumerate([(41, [57, 60]), (46, [58, 62])]):          # F, Bb
        note(b, "bass", bm, g(i, 0), 0.5, 0.5)
        for beat in (1, 2):
            strum(b, tones, g(i, beat), 0.22, dur=0.3)
    # bottom of the arc, then up, slower and slower, to the top
    b.cue(g(1) * T.FPS, "'all the speed it gains going down': the tune steps down F-D-Bb into")
    b.cue(BOTTOM, "the bottom of the arc (low F); then the arpeggio climbs F-A-C-F, slower and slower, to the top")
    note(b, "bass", 41, fr(BOTTOM), 0.6, 0.55)
    span = TOP - BOTTOM
    for u, m, v in [(0.0, 77, 0.5), (0.26, 81, 0.5), (0.56, 84, 0.5), (1.0, 89, 0.56)]:
        # only the top F (the common tone with Db major) may ring into the lullaby
        note(b, "mbox", m, fr(BOTTOM + u * span), 0.5, v, dur=2.0 if u == 1.0 else min(1.6, fr(OCEAN - 1) - fr(BOTTOM + u * span)))
        note(b, "vibes", m - 12, fr(BOTTOM + u * span), 0.6, 0.24, trem=0.05)
    b.cue(TOP, "top of the arc: high F rings, everything else waits")
    padc(b, [53, 57, 60, 65], fr(SW0), g(1, 0), 0.2, att=0.25, rel=0.4)
    padc(b, [53, 58, 62, 65], g(1, 0), fr(BOTTOM), 0.2, att=0.2, rel=0.4)
    padc(b, [53, 57, 60, 65], fr(BOTTOM), fr(TOP), 0.2, att=0.2, rel=0.3)


def lullaby(b):
    bar = (HOLD - OCEAN) / 3.0
    e = bar / 6.0                                        # one eighth of the 6/8 bar, in frames
    at = lambda i, k=0.0: fr(OCEAN + i * bar + k * e)
    b.cue(OCEAN, f"LULLABY: the tune rocking in 6/8, Db major (F is the common tone), music box + harp + warm pad, {60 * T.FPS / (bar / 2):.0f} dotted-quarters a minute")
    mel = [(0, 0, 2, 80), (0, 2, 1, 77), (0, 3, 2, 80), (0, 5, 4, 85), (1, 3, 2, 82), (1, 5, 1, 80),
           (2, 0, 2, 82), (2, 2, 1, 78), (2, 3, 2, 82), (2, 5, 1, 87)]
    for (i, k, d, m) in mel:
        note(b, "mbox", m, at(i, k), 0.5, 0.56 if d > 1 else 0.48)
    arps = [[49, 56, 61, 65, 61, 56], [49, 58, 61, 66, 61, 58], [44, 51, 56, 61, 66]]
    for i, arp in enumerate(arps):
        for k, m in enumerate(arp):
            note(b, "harp", m, at(i, k), 0.5, (0.42 if k == 0 else 0.3) * (1.0 if i < 2 else 1.0 - 0.12 * k))
    wave = lambda t0: (lambda t: 1 + 0.12 * np.sin(2 * np.pi * (t + t0 - fr(OCEAN)) / (bar / T.FPS)))
    padc(b, [49, 56, 61, 63, 65], at(0), at(1), 0.24, att=0.3, rel=0.5, trem=wave(at(0)))
    padc(b, [49, 58, 61, 66], at(1), at(2), 0.24, att=0.25, rel=0.5, trem=wave(at(1)))
    padc(b, [44, 56, 61, 63], at(2), fr(HOLD) - 0.25, 0.22, att=0.25, rel=0.25, trem=wave(at(2)))
    b.cue(OCEAN + 2 * bar, "third bar climbs to an unresolved Eb (the slide whistle is heading for the same note)")
    b.cue(HOLD, "HELD BREATH: he stops, the music stops (choked on the Eb); silence until 'Luckily'")

    # "Luckily": the phrase, sweet.  "Unluckily": the same phrase, and then it droops.
    q = 8.0                                              # frames per eighth
    lk = lambda f0, k: fr(f0 + k * q)
    b.cue(LUCK, "'Luckily': the head of the tune once more, sweet, ending on a rolled Db chord")
    for (k, m, v) in [(0, 80, 0.5), (2, 77, 0.45), (3, 80, 0.5), (5, 85, 0.56)]:
        note(b, "mbox", m, lk(LUCK, k), 0.5, v)
    for k, m in enumerate([49, 56, 65, 49, 56, 65]):
        note(b, "harp", m, lk(LUCK, k), 0.5, 0.36 if k % 3 == 0 else 0.28)
    for j, m in enumerate([61, 65, 68, 75]):
        note(b, "harp", m, lk(LUCK, 6) + 0.045 * j, 0.5, 0.3)
    padc(b, [49, 56, 61, 65], fr(LUCK), fr(UNLUCK) - 0.1, 0.22, att=0.3, rel=0.35)
    b.cue(UNLUCK, "'Unluckily': the same phrase again ...")
    note(b, "mbox", 80, lk(UNLUCK, 0), 0.5, 0.5)
    note(b, "mbox", 77, lk(UNLUCK, 2), 0.5, 0.45, dur=q / T.FPS + 0.04)          # F stops when the Fb arrives
    for k, m in enumerate([49, 56, 65]):
        note(b, "harp", m, lk(UNLUCK, k), 0.5, 0.36 if k == 0 else 0.28, dur=1.3 * q / T.FPS if k == 2 else fr(RET) - lk(UNLUCK, k))       # the major third is damped as the smile drops
    droop = [(3, 2, 76), (5, 1, 75), (6, 1, 73), (7, 2.6, 72)]      # Fb Eb Db C: the smile drops
    for (k, d, m) in droop:
        note(b, "mbox", m, lk(UNLUCK, k), 0.5, 0.46, dur=d * q / T.FPS + 0.04)
        note(b, "horn", m - 12, lk(UNLUCK, k), d * q / T.FPS * 0.95, 0.42, kind="soft", scoop=-30.0, fall=-1.2 if k == 7 else 0.0, rel=0.12)
    for k, m in enumerate([49, 56, 64]):
        note(b, "harp", m, lk(UNLUCK, 3 + k), 0.5, 0.3, dur=fr(RET) - lk(UNLUCK, 3 + k))      # Db minor is gone when the C7 starts
    note(b, "harp", 48, lk(UNLUCK, 7), 0.6, 0.36)
    padc(b, [49, 56, 61, 65], fr(UNLUCK), lk(UNLUCK, 3), 0.22, att=0.2, rel=0.3)
    padc(b, [49, 56, 61, 64], lk(UNLUCK, 3), lk(UNLUCK, 7), 0.22, att=0.15, rel=0.3)
    padc(b, [48, 55, 58, 64], lk(UNLUCK, 7), fr(RET), 0.24, att=0.15, rel=0.25)
    b.cue(UNLUCK + 3 * q, "... but it droops: Fb-Eb-Db-C with a soft sad trombone, landing on C (the way home)")


def ret(b):
    g, downs = geo_grid([RET, HOME], [3], 31.0 / 33.0)
    b.cue(RET, f"RETURN: the ostinato again on C7, {60 * 4 * T.FPS / (downs[1] - downs[0]):.0f} bpm and accelerating, three bars up into the theme")
    ost = [(67, 64, 67, 70), (70, 67, 70, 76), (76, 72, 76, 79)]
    for i in range(3):
        u = i / 2
        for k in range(8):
            m = ost[i][k % 4] if not (i == 2 and k >= 4) else (79, 76, 79, 82)[k - 4]
            t = g(i, k / 2)
            acc = 1.0 if k % 4 == 0 else (0.86 if k % 2 == 0 else 0.74)
            note(b, "mar", m, t, 0.1, (0.5 + 0.2 * u) * acc)
            note(b, "mar", m + 12, t, 0.1, (0.3 + 0.2 * u) * acc, kind="xylo", dp=-0.5)
            if k % 2 == 0 or i == 2:
                note(b, "bass", 48 if k % 4 == 0 else (43 if k % 2 == 0 else 60), t, 0.2, 0.62 + 0.15 * u, dur=0.5)
            brush(b, t, (0.3 + 0.25 * u) * (1.0 if k % 2 == 0 else 0.7))
            if k % 2 == 0:
                wood(b, t, 0.35 + 0.15 * u, hi=k % 4 == 0)
    for k, m in enumerate([60, 62, 64, 65, 67, 69, 70, 71]):         # run up into the tune's first note (C5)
        t0 = g(2, k / 2)
        note(b, "clar", m, t0, (g(2, (k + 1) / 2) - t0) * 0.8, 0.6 + 0.02 * k)
        note(b, "glock", m + 24, t0, 0.2, 0.28, dur=0.5)
    for k in range(4):
        b.add("timp", I.timpani(F(36), 0.34 + 0.1 * k, _r(), dur=0.8), g(2, k), PAN["timp"])
    for m in (48, 58, 64):
        note(b, "horn", m, g(1), (g(3) - g(1)) * 0.95, 0.34, rel=0.05)


def payoff(b):
    bar = (BUTTON - HOME) / 4.5
    g = lin_grid(HOME, bar)
    s = 0.62
    b.cue(HOME, f"PAYOFF: the tune comes home, F major, warm and a little faster ({60 * 4 * T.FPS / bar:.1f} bpm): clarinet + glock + marimba, soft horns, pad")
    b.add("cymbal", I.cymbal(0.3, _r(), dur=1.6), g(0))
    b.add("tri", I.triangle(0.4, _r(), dur=1.2), g(0), PAN["tri"])
    tune(b, g, [0, 1, 2], 0.72, ("clar", "mar", "glock"), swing=s)
    for tr in ("clar", "mar", "glock"):                  # bar 4: home note, then sol-la-ti back up to
        note(b, tr, 77 + (12 if tr == "glock" else 0), g(3, 0), (g(3, 1.5) - g(3, 0)) * 0.9, 0.72 * (0.55 if tr == "glock" else 1.0))
    for (beat, m) in [(2.5, 72), (3, 74), (3.5, 76)]:
        note(b, "clar", m, g(3, sw(beat, s)), 0.14, 0.7), note(b, "glock", m + 12, g(3, sw(beat, s)), 0.2, 0.36, dur=0.6)
    chords = [SUNDAY_CH[0], SUNDAY_CH[1], SUNDAY_CH[2], ["F", "F", "C7", "C7"]]
    for i in range(4):
        boom_chick(b, g, i, chords[i], 0.7, swing=s, walk=[(3.5, 45)] if i == 0 else ([(3, 50), (3.5, 52)] if i == 3 else None))
    warm = [(0, 0, 4, [53, 57, 60]), (1, 0, 2, [53, 58, 62]), (1, 2, 2, [52, 58, 60]), (2, 0, 2, [53, 57, 60]), (2, 2, 1, [53, 57, 62]),
            (2, 3, 1, [52, 58, 60]), (3, 0, 2, [53, 57, 60]), (3, 2, 2, [52, 58, 60])]
    for (i, beat, d, ms) in warm:
        for m in ms:
            note(b, "horn", m, g(i, beat), (g(i, beat + d) - g(i, beat)) * 0.94, 0.4, rel=0.06)
        padc(b, ms + [ms[0] + 12], g(i, beat), g(i, beat + d), 0.27, att=0.12, rel=0.3)
    # tag: "... ti DO! (pom) DO!"  - the last DO is the button, after the narrator's last word
    t1, t2, t3 = g(4, 0), g(4, 1), fr(BUTTON)
    b.cue(HOME + 4 * bar, "tag: tutti F chord ('ta-da'), one low pizzicato C ...")
    for m in (41, 53):
        note(b, "bass", m, t1, 0.3, 0.8)
    strum(b, [57, 60, 65, 69], t1, 0.6, dur=0.3)
    note(b, "clar", 77, t1, 0.15, 0.75), note(b, "mar", 77, t1, 0.2, 0.6), note(b, "glock", 89, t1, 0.3, 0.42, dur=0.7)
    wood(b, t1, 0.5)
    note(b, "bass", 48, t2, 0.3, 0.7), wood(b, t2, 0.4, hi=False)
    b.cue(BUTTON, "BUTTON: final F (pizzicato, marimba, glock, clarinet, soft timpani, triangle), choked to silence by the last frame")
    for m in (41, 53):
        note(b, "bass", m, t3, 0.3, 0.9)
    strum(b, [53, 57, 60, 65, 69], t3, 0.7, dur=0.35)
    note(b, "clar", 77, t3, 0.14, 0.8), note(b, "clar", 65, t3, 0.14, 0.7)
    note(b, "mar", 65, t3, 0.2, 0.7), note(b, "mar", 77, t3, 0.2, 0.6, kind="xylo")
    for m in (89, 93, 96):
        note(b, "glock", m, t3, 0.3, 0.4, dur=0.6)
    for m in (53, 57, 60):
        note(b, "horn", m, t3, 0.12, 0.5, kind="stab", scoop=-12.0)
    b.add("timp", I.timpani(F(41), 0.6, _r(), dur=0.6), t3, PAN["timp"])
    b.add("tri", I.triangle(0.4, _r(), dur=0.5), t3, PAN["tri"])


def build():
    b = Band()
    for name, send in TRACKS:
        b.track(name, send)
    for part in (sunday, fall, explain, swing, lullaby, ret, payoff):
        part(b)
    return b


TARGET = {  # relative balance inside the band (LU, integrated loudness of each track over the whole score)
    "clar": 0.0, "glock": -7.0, "mar": -2.5, "bass": -3.0, "chord": -7.5, "brush": -13.0, "wood": -12.0, "vibes": -3.0, "mbox": -2.5,
    "harp": -5.0, "pad": -6.0, "horn": -6.5, "timp": -7.0, "cymbal": -13.0, "tri": -16.0,
}


def gates():
    """score-wide silences, applied after the reverb so they are really silent: before the flash, the dead stop,
    the held breath, and the end of the film (the button is choked over the last frames)"""
    g = np.ones(N)

    def close(f_a, f_b, fade=0.008):
        a, z = ns(fr(f_a)), min(N, ns(fr(f_b)))
        k = min(ns(fade), a)
        g[a - k:a] *= np.linspace(1, 0, k)
        g[a:z] = 0.0
    g[: ns(fr(FL)) - ns(0.004)] = 0.0
    close(STOP, MYST - 0.5)
    a, z = ns(fr(HOLD) - 0.06), ns(fr(HOLD) + 0.12)      # choke the lullaby around the stop (0.18 s)
    g[a:z] *= np.linspace(1, 0, z - a) ** 1.5
    g[z: ns(fr(LUCK - 0.5))] = 0.0
    a = ns(fr(END - 5))                                  # button: full for 5 frames, gone 5 frames later
    g[a:] *= np.linspace(1, 0, N - a) ** 1.3
    return g


def render(b, ref=-20.0):
    hall = make_ir(1.4, 7, pre=0.018, hf=1.5)
    dry = np.zeros((2, N))
    wet = np.zeros((2, N))
    levels = {}
    for k, x in b.tr.items():
        if not np.any(x):
            continue
        if k in ("brush", "cymbal"):
            x = lp(x, 9500, 2)
        L = integrated(x)
        tgt = ref + TARGET.get(k, -6)
        levels[k] = (round(float(L), 1), round(tgt, 1))
        x = x * dbg(tgt - L)
        b.tr[k] = x
        dry += x
        wet += b.send[k] * x
    out = dry + 0.7 * convolve_st(wet.mean(0), hall)
    out = lp(hp(out, 30, 2), 12000, 4)
    return out * gates()[None, :], levels


if __name__ == "__main__":
    import time
    t_ = time.time()
    b = build()
    t1 = time.time()
    m, lv = render(b)
    print(f"build {t1 - t_:.1f} s, render {time.time() - t1:.1f} s, {integrated(m):.1f} LUFS, peak {20 * np.log10(np.abs(m).max()):.1f} dBFS")
    print(lv)
    for name, a, z in SECTIONS:
        seg = m[:, ns(a): ns(z)]
        L = integrated(seg) if np.any(seg) else -99
        print(f"  {name:<8} f{a * T.FPS:6.0f}-{z * T.FPS:6.0f}  {L:6.1f} LUFS")
    for t, d in sorted(b.cues):
        print(f"  f{t * T.FPS:7.1f}  {d}")
