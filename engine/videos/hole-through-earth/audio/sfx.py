# Every event of ../shots.json as a synthesized sound, plus the ambience beds, rendered into one stereo SFX stem.
# Data-driven: timeline.py reads the event table; SOUND maps each event TYPE to a builder; VARIANT holds the few
# story-specific options of single events (keyed by type + frame). An event type without a builder gets a neutral
# blip / whoosh and is reported, so a new shots.json always builds.
# Levels follow the skill's standard mix: each EVENT has a "naive" level (LU relative to the voice stem, measured as
# the event's max momentary loudness) and is placed SFX_DB = -6 dB under it; ambience BEDS (integrated loudness)
# are not reduced. Every sound starts on its frame (anchor <= 0.02 s of pre-roll for the whooshes).
# The place of the shot picks the reverb: tunnel (shaft), open air (garden / park / ocean), void (earth cutaway).
# "Dead cuts" (the white flash, every record_stop) silence everything that started before them, reverb included.
import zlib
import numpy as np
from dsp import SR, ns, tt, rng, dbg, lp, hp, pan, st, place, widen, make_ir, convolve_st, momentary_max, integrated
import sfx_gen as G
import instruments as I
import timeline as T

N = ns(T.DUR)
SFX_DB = -6.0
F = T.FPS

# place -> (reverb, send)
PLACE_FX = {"shaft": ("tunnel", 0.22), "garden": ("open", 0.10), "park": ("open", 0.12), "ocean": ("open", 0.14),
            "earth": ("void", 0.16), "_": ("open", 0.10)}
DEAD_CUTS = sorted({T.FLASH} | {e.t for e in T.events("record_stop")})

_HZ = lambda m: 440.0 * 2 ** ((m - 69) / 12.0)


def _first(type_, shot, default):
    try:
        return T.event_f(type_, shot=shot)
    except KeyError:
        return default


def _variants():
    """story-specific shaping of single events: (type, frame) -> options read by that type's builder.
    Pitches are tuned to the score (music.py: F major, D minor for the explanation, Db major over the ocean)."""
    V = {}
    w = T.events("wind_rush")
    if len(w) > 0:      # the hook: already falling fast, still getting faster, cut by the flash
        V[("wind_rush", int(w[0].f))] = dict(f=[(0, 520), (1, 1250)], a=[(0, 0.5), (0.85, 1.0), (1, 1.0)], level=-8.5,
                                             what="falling rush under the hook, rising into the flash")
    if len(w) > 1:      # the fall: pitch and level rise steadily until the core shot, then hold until the record stop
        e = w[1]
        hold = T.SHOTS[T.shot_of(e.to - 1)][0]           # first frame of the last shot of the fall (white-hot core)
        u = ((hold if e.f < hold < e.to else e.f + 0.7 * (e.to - e.f)) - e.f) / (e.to - e.f)
        V[("wind_rush", int(e.f))] = dict(f=[(0, 230), (u, 1500), (1, 1500)], a=[(0, 0.22), (u, 1.0), (1, 1.0)], level=-16.0,
                                          what=f"tunnel rush: pitch and level rise to f{e.f + u * (e.to - e.f):.0f}, then hold; cut dead by the record stop")
    if len(w) > 2:      # the return trip in time-lapse: up to top speed, then slowing as he comes up
        V[("wind_rush", int(w[2].f))] = dict(f=[(0, 520), (0.45, 1500), (1, 430)], a=[(0, 0.6), (0.45, 1.0), (0.9, 0.5), (1, 0.3)],
                                             level=-15.5, what="return trip: rush up to top speed and down again (time-lapse)")
    for e in T.events("amb_garden"):
        if "quiet" in e.note or "cricket" in e.note:
            V[("amb_garden", int(e.f))] = dict(birds=0.0, cricket=1.0, level=-33.0, what="awkward quiet: faint breeze and ONE cricket")
    for e in T.events("twinkle"):
        scale = [80, 82, 85, 89, 92] if e.place == "ocean" else [81, 84, 86, 89, 93]       # Db / F pentatonic
        V[("twinkle", int(e.f))] = dict(freqs=[_HZ(m + 12) for m in scale])
    for e in T.events("ting"):
        V[("ting", int(e.f))] = dict(f=_HZ(87) if e.place == "ocean" else _HZ(89))          # Eb6 over the ocean, F6 at home
    for e in T.events("slide_whistle_down"):
        V[("slide_whistle_down", int(e.f))] = dict(f0=_HZ(85) if e.place == "ocean" else _HZ(88), f1=_HZ(60) if e.place == "ocean" else _HZ(65))
    for e in T.events("slide_whistle_up_slowing"):
        V[("slide_whistle_up_slowing", int(e.f))] = dict(f0=_HZ(68), f1=_HZ(87))            # Ab4 -> Eb6, the lullaby's last note
    for e in T.events("cork_pop"):
        V[("cork_pop", int(e.f))] = dict(wet=e.place == "ocean")
    for e in T.events("zip"):
        if e.place == "earth":
            V[("zip", int(e.f))] = dict(f_lo=520.0, f_hi=3600.0, level=-8.0)
    for e in T.events("swing_creak"):                    # the ropes creak as they take the push, then on every pass
        bottom = _first("whoosh", e.shot, e.f + 0.65 * (e.to - e.f))                     # through the bottom of the arc,
        push, top = _first("push_whoosh", e.shot, e.f - 4), _first("ting", e.shot, e.to)   # once more on the way up
        fr_ = [e.f] + [b for b in T.swing_bottoms(push, bottom) if b > e.f + 6] + [0.5 * (bottom + top)]
        V[("swing_creak", int(e.f))] = dict(times=[(f_ - e.f) / F for f_ in fr_ if f_ < e.to - 6])
    for e in T.events("sizzle"):
        if e.place == "shaft":
            V[("sizzle", int(e.f))] = dict(dur=0.85, level=-10.0)
    return V


VARIANT = _variants()


class Cue:
    def __init__(self, t, name, desc, gen, naive, kind="event", p=0.0, extra=0.0, lpf=None, send=0.0, ir="open", ev=None):
        self.t, self.name, self.desc, self.gen, self.naive = t, name, desc, gen, naive
        self.kind, self.p, self.extra, self.lpf, self.send, self.ir, self.ev = kind, p, extra, lpf, send, ir, ev
        self.applied = naive + (SFX_DB if kind == "event" else 0.0) + extra
        self.measured = None
        self.peak_db = None
        self.t0 = None
        self.end = None


def _rng(ev, salt=0):
    return rng(zlib.crc32(f"{ev.type}:{ev.f:g}:{salt}".encode()))


def E(ev, gen, naive, desc, p=0.0, send=1.0, name=None, t=None, **kw):
    """event cue at the event's frame, reverb chosen by the place of its shot"""
    ir, s = PLACE_FX.get(ev.place, PLACE_FX["_"])
    return Cue(ev.t if t is None else t, name or ev.type, desc, gen, naive, "event", p, send=s * send, ir=ir, ev=ev, **kw)


def B(ev, make, naive, desc):
    """ambience bed over the event's span: fades in on its frame (over the picture crossfade if there is one), runs
    through the crossfade at its end, or stays at full level into a dead cut"""
    fin = max(T.cut_in(int(ev.f)), 1) / F
    xo = T.cut_in(int(ev.to)) / F
    dead = any(abs(ev.t_end - c) < 1e-6 for c in DEAD_CUTS)
    ext = 0.08 if dead else (xo if xo > 0 else 0.02)
    fout = 0.0 if dead else (xo if xo > 0 else (0.12 if ev.to >= T.TOTAL else 0.04))
    L = ev.dur + ext

    def gen():
        x = st(np.asarray(make(L), float))
        n = x.shape[1]
        a, b = ns(fin), ns(fout)
        env = np.ones(n)
        env[:a] = np.linspace(0, 1, a, endpoint=False) ** 0.5        # equal-power: audible from its first frame
        if b:
            env[n - b:] = np.linspace(1, 0, b)
        return x * env[None, :], 0.0
    return Cue(ev.t, ev.type, desc, gen, naive, "bed", ev=ev)


SOUND = {}


def sound(*types):
    def deco(fn):
        for t in types:
            SOUND[t] = fn
        return fn
    return deco


# ================================================================ beds
@sound("wind_rush")
def _wind(ev, o, r):
    f = o.get("f", [(0, 420), (1, 1300)])
    a = o.get("a", [(0, 0.5), (1, 1.0)])

    def make(L):
        k = ev.dur / L
        return G.wind_rush(L, r, [(u * k, v) for u, v in f] + [(1.0, f[-1][1])], [(u * k, v) for u, v in a] + [(1.0, a[-1][1])])
    return [B(ev, make, o.get("level", -15.0), o.get("what", "stylised falling rush") + " (noise band + faint whistle + flutter, follows the speed)")]


@sound("amb_garden", "amb_garden_evening")
def _garden(ev, o, r):
    evening = ev.type.endswith("evening")
    birds, cricket = o.get("birds", 1.0), o.get("cricket", 0.0)
    what = o.get("what", "evening garden: soft breeze, blackbird phrases, crickets" if evening else "garden air: light breeze, sparrows")
    out = [B(ev, lambda L: G.amb_garden(L, r, birds, 0.0, evening), o.get("level", -25.0), what)]
    if cricket > 0:
        r2 = _rng(ev, 1)
        out.append(E(ev, lambda: (G.cricket_solo(ev.dur + 0.15, r2, first=0.0), 0.0), -15.0, "the one cricket (3-pulse chirps, about 1.6 per second)",
                     p=0.35, send=0.5, name="cricket", t=ev.t + 0.2))
    return out


@sound("amb_ocean_night")
def _ocean(ev, o, r):
    return [B(ev, lambda L: G.ocean_night(L, r), o.get("level", -21.0), "night ocean: slow swells, foam, water lapping on the boat, timber creaks")]


# ================================================================ whooshes / hits
@sound("whoosh")
def _whoosh(ev, o, r):
    return [E(ev, lambda: (G.whoosh(0.6, r, 0.045, 330, 2000, 0.8, 0.18, 0.15), 0.02), o.get("level", -10.0), "quick whoosh (ease-out burst): " + ev.note)]


@sound("whoosh_big")
def _whoosh_big(ev, o, r):
    return [E(ev, lambda: (G.whoosh_deep(r), 0.02), o.get("level", -2.0), "big deep whoosh (air band diving from bright to dark + sub swell): " + ev.note)]


@sound("flash_hit")
def _flash(ev, o, r):
    def gen():
        dur = 0.8
        t = tt(dur)
        y = G.whoosh(dur, r, 0.03, 500, 4200, 0.9, 0.12, 0.4)[: len(t)]
        y = y + np.exp(-t / 0.12) * np.sin(2 * np.pi * 62 * t) * 0.8
        return widen(y, r, 12, 0.9), 0.012
    return [E(ev, gen, o.get("level", -5.0), "white flash: bright airy burst + soft low whoomp; the hook's rush is cut here", send=1.5)]


@sound("impact_kick")
def _kick(ev, o, r):
    return [E(ev, lambda: (G.impact_kick(r), 0.0), o.get("level", -5.0), "speed-surge kick (sub thump + upward air burst): " + ev.note)]


@sound("decel_whoosh")
def _decel(ev, o, r):
    d = ev.dur or 0.8
    return [E(ev, lambda: (G.decel_whoosh(d, r), 0.0), o.get("level", -10.0), "slowing down: air band + faint tone sinking in pitch and level")]


@sound("push_whoosh")
def _push(ev, o, r):
    def gen():
        y = np.zeros(ns(0.5))
        G._place_mono(y, G.push_thump(r), 0.0)
        G._place_mono(y, G.whoosh(0.4, r, 0.045, 300, 1500, 0.8, 0.1, 0.1) * 0.9, 0.0)
        return y, 0.0
    return [E(ev, gen, o.get("level", -9.0), "push on the swing: hands on the back + chain jingle + soft whoosh", p=0.1)]


@sound("zip")
def _zip(ev, o, r):
    return [E(ev, lambda: (G.zip_by(r, o.get("f_lo", 420.0), o.get("f_hi", 3200.0)), 0.02), o.get("level", -7.0), "'zwip' pass-by: " + ev.note)]


# ================================================================ pops, blips, bells
@sound("pop")
def _pop(ev, o, r):
    return [E(ev, lambda: (G.pop_small(r, 880.0), 0.0), o.get("level", -8.0), "small bright pop: " + ev.note)]


@sound("arrow_pop")
def _arrow(ev, o, r):
    def gen():
        y = np.zeros(ns(0.4))
        G._place_mono(y, G.pop_small(r, 1175.0), 0.0)
        G._place_mono(y, G.blip([(0.0, 0.07, 1175.0, 1175.0)], r) * 0.5, 0.012)
        return y, 0.0
    return [E(ev, gen, o.get("level", -8.0), "arrow card pops in: pop + tiny D6 blip")]


@sound("flip_blip")
def _flip(ev, o, r):
    def gen():
        y = np.zeros(ns(0.45))
        G._place_mono(y, G.blip([(0.0, 0.05, 1568.0, 1568.0), (0.075, 0.09, 1175.0, 1245.0)], r), 0.0)
        G._place_mono(y, G.whoosh(0.2, r, 0.03, 600, 2500, 0.6, 0.05, 0.2) * 0.35, 0.0)
        return y, 0.0
    return [E(ev, gen, o.get("level", -8.0), "arrow flips: two-note 'bi-dup' (G6, D6) + a flick of air")]


@sound("question_blip")
def _question(ev, o, r):
    return [E(ev, lambda: (G.blip([(0.0, 0.09, 880.0, 880.0), (0.13, 0.16, 1108.7, 1318.5)], r), 0.0), o.get("level", -7.0),
              "'?' card: two soft blips, the second one bending up like a question (A5, C#6 -> E6)")]


@sound("ding")
def _ding(ev, o, r):
    return [E(ev, lambda: (G.ding(r, o.get("f", 1568.0)), 0.0), o.get("level", -7.0), "friendly two-bell 'ding' (G6 + C7): " + ev.note)]


@sound("ting")
def _ting(ev, o, r):
    return [E(ev, lambda: (I.triangle(0.5, r, dur=1.2, f=o.get("f", 1397.0)) , 0.0), o.get("level", -9.0), "triangle 'ting': " + ev.note)]


@sound("twinkle")
def _twinkle(ev, o, r):
    fr = o.get("freqs", [1760.0, 2093.0, 2349.3, 2793.8, 3520.0])
    return [E(ev, lambda: (G.twinkle(r, fr), 0.0), o.get("level", -9.0), "sparkle run of five tiny bells: " + ev.note)]


@sound("ricochet_ping")
def _rico(ev, o, r):
    return [E(ev, lambda: (G.ricochet(r), 0.0), o.get("level", -9.0), "cartoon ricochet 'pyeeow', small: " + ev.note, p=0.15)]


@sound("cork_pop")
def _cork(ev, o, r):
    def gen():
        y = np.zeros(ns(0.5))
        G._place_mono(y, G.cork_pop(r, 520.0), 0.0)
        if o.get("wet"):
            t = tt(0.45)
            G._place_mono(y, G.bubbles(0.45, r, 55.0, 900, 3200, (0.004, 0.012), np.exp(-t / 0.12), rise=(8, 25)) * 0.3, 0.02)
        return y, 0.0
    return [E(ev, gen, o.get("level", -3.0), "cork pop" + (" + a few drips" if o.get("wet") else "") + ": " + ev.note)]


@sound("glass_pop")
def _glass(ev, o, r):
    return [E(ev, lambda: (G.glass_pop(r), 0.0), o.get("level", -6.0), "thermometer pops: small pop + glass tink + tiny shards")]


@sound("timer_ticks")
def _ticks(ev, o, r):
    d = ev.dur or 1.4
    step = d / max(1, round(d / (3.5 / F)))
    return [E(ev, lambda: (G.timer_ticks(d, r, step), 0.0), o.get("level", -14.0),
              f"egg timer: {round(d / step) + 1} tick-tocks, one every {step * F:.1f} frames, last one on f{ev.to:g}", p=-0.15)]


@sound("timer_ding")
def _tding(ev, o, r):
    return [E(ev, lambda: (G.timer_ding(r, o.get("f", 2093.0)), 0.0), o.get("level", -4.0), "kitchen-timer bell (C7), rings about 1 s: " + ev.note, p=-0.15)]


# ================================================================ comedy bodies
@sound("shovel_thunk")
def _shovel(ev, o, r):
    return [E(ev, lambda: (G.shovel_thunk(r), 0.0), o.get("level", -6.0), "shovel into the dirt mound: thud + grit + dull blade ring")]


@sound("flame_poof")
def _poof(ev, o, r):
    return [E(ev, lambda: (G.flame_poof(r), 0.0), o.get("level", -6.0 if ev.f < T.TOTAL - 45 else -9.0), "'fwoomp' + flutter + crackle: " + ev.note, p=0.2)]


@sound("sizzle")
def _sizzle(ev, o, r):
    return [E(ev, lambda: (G.sizzle(r, o.get("dur", 0.7)), 0.0), o.get("level", -9.0), "sizzle dying away: " + ev.note, p=0.2)]


@sound("splat")
def _splat(ev, o, r):
    return [E(ev, lambda: (G.splat(r), 0.0), o.get("level", -4.0), "wet splat: slap + squelch + glops + thud (" + ev.note + ")", p=-0.1)]


@sound("paper_flick")
def _paper(ev, o, r):
    return [E(ev, lambda: (G.paper_flick(r), 0.0), o.get("level", -11.0), "paper flaps + board knock: " + ev.note)]


@sound("jump_boing")
def _boing(ev, o, r):
    return [E(ev, lambda: (G.boing(r), 0.0), o.get("level", -5.0), "spring 'boing': " + ev.note)]


@sound("gulp")
def _gulp(ev, o, r):
    return [E(ev, lambda: (G.gulp(r), 0.0), o.get("level", -7.0), "cartoon gulp: " + ev.note)]


@sound("chomp")
def _chomp(ev, o, r):
    return [E(ev, lambda: (G.chomp(r), 0.0), o.get("level", -5.0), "one big bite: jaw snap + crunch + 'omp'")]


@sound("record_stop")
def _recstop(ev, o, r):
    chord = [_HZ(m) for m in o.get("chord", (60, 64, 67, 70))]      # the score's last chord (C7)
    return [E(ev, lambda: (G.record_stop(r, chord), 0.0), o.get("level", -3.0), "record stop: needle scratch + the last chord winding down to nothing (0.4 s)", send=0.3)]


@sound("slide_whistle_down")
def _slide_down(ev, o, r):
    d = ev.dur or 0.55
    f0, f1 = o.get("f0", 1318.5), o.get("f1", 349.2)
    return [E(ev, lambda: (G.slide_whistle(d, r, f0, f1, bend=1.25), 0.0), o.get("level", -7.0),
              f"slide whistle falling {f0:.0f} -> {f1:.0f} Hz over {d * F:.0f} frames: " + ev.note)]


@sound("slide_whistle_up_slowing")
def _slide_up(ev, o, r):
    d = ev.dur or 3.0
    f0, f1 = o.get("f0", 415.3), o.get("f1", 1244.5)
    return [E(ev, lambda: (G.slide_whistle(d, r, f0, f1, bend=2.2, ease_out=True, fade_tail=0.5, vib=6.0), 0.0), o.get("level", -9.0),
              f"slide whistle rising {f0:.0f} -> {f1:.0f} Hz, slower and slower, fading to nothing by f{ev.to:g}")]


@sound("swing_creak")
def _swing(ev, o, r):
    d = ev.dur or 4.0
    times = o.get("times") or [i * 0.95 for i in range(int((d - 0.25) / 0.95) + 1)]
    k = len(times)

    def gen():
        y = np.zeros(ns(d + 0.1))
        for i, tm in enumerate(times):
            soft = i == 0 or i == k - 1                 # taking the push / slowing on the way up
            G._place_mono(y, G.rope_creak(r, 0.5 if soft else 1.0, i % 2 == 1) * (0.7 if soft else 1.0), tm)
        return y, 0.0
    return [E(ev, gen, o.get("level", -9.0), f"swing ropes creak in rhythm with the swing: {k} creaks at f"
              + ", ".join(f"{ev.f + tm * F:.0f}" for tm in times) + " (the push, every pass through the bottom, once on the way up)", p=0.15)]


def _fallback(ev, o, r):
    if ev.span and ev.dur > 1.0:
        return [B(ev, lambda L: G.breeze(L, r, 1.0, 0.15, 800), -28.0, "UNMAPPED event type (neutral air bed): " + ev.note)]
    return [E(ev, lambda: (G.blip([(0.0, 0.08, 990.0, 990.0)], r), 0.0), -10.0, "UNMAPPED event type (neutral blip): " + ev.note)]


def unmapped():
    return sorted({e.type for e in T.EVENTS if not e.type.startswith("music_") and e.type not in SOUND})


def cues():
    C = []
    for ev in T.EVENTS:
        if ev.type.startswith("music_"):        # scored in music.py
            continue
        C += SOUND.get(ev.type, _fallback)(ev, VARIANT.get((ev.type, int(ev.f)), {}), _rng(ev))
    return C


# ================================================================ render
def _irs():
    return {
        "open": make_ir(0.45, 71, pre=0.006, hf=2.2),
        "tunnel": make_ir(1.3, 72, pre=0.004, hf=1.3, early=[(0.021, 0.6, -0.4), (0.037, 0.5, 0.5), (0.058, 0.4, -0.2), (0.083, 0.3, 0.3)]),
        "void": make_ir(1.7, 73, pre=0.03, hf=1.0),
    }


def render(v_ref, on_event=None):
    """v_ref = integrated loudness of the voice stem (stereo). Returns (stereo stem, cue list with measured levels).
    on_event(cue, x, t0) is called with every placed (dry) cue, for analysis."""
    C = cues()
    IR = _irs()
    nseg = len(DEAD_CUTS) + 1
    dry = np.zeros((nseg, 2, N))
    send = {k: np.zeros((nseg, N)) for k in IR}
    for c in C:
        x, anchor = c.gen()
        x = np.asarray(x, float)
        x = pan(x, c.p) if x.ndim == 1 else x
        tgt = v_ref + c.applied
        cur = momentary_max(x) if c.kind == "event" else integrated(x)
        if np.isfinite(cur):
            x = x * dbg(tgt - cur)
        if c.lpf:
            x = lp(x, c.lpf, 1)
        c.measured = (momentary_max(x) if c.kind == "event" else integrated(x)) - v_ref
        c.peak_db = 20 * np.log10(np.abs(x).max() + 1e-12)
        t0 = c.t - anchor
        c.t0, c.end = t0, t0 + x.shape[1] / SR
        seg = sum(1 for d in DEAD_CUTS if d <= c.t + 1e-9)
        place(dry[seg], x, t0)
        if on_event:
            on_event(c, x, t0)
        if c.send > 0:
            G._place_mono(send[c.ir][seg], c.send * x.mean(0), t0)
    out = np.zeros((2, N))
    for seg in range(nseg):
        bus = dry[seg]
        for k, ir in IR.items():
            if np.any(send[k][seg]):
                bus = bus + 0.6 * convolve_st(send[k][seg], ir)
        if seg < len(DEAD_CUTS):                         # everything that started before the cut is gone at the cut
            z = ns(DEAD_CUTS[seg])
            a = max(0, z - ns(0.008))
            bus[:, a:z] *= np.linspace(1, 0, z - a)[None, :]
            bus[:, z:] = 0.0
        out += bus
    out = lp(hp(out, 25, 2), 11000, 4)
    end = ns(T.DUR - 0.12)
    out[:, end:] *= np.linspace(1, 0, N - end)[None, :] ** 2
    return out, C


if __name__ == "__main__":
    import time
    t_ = time.time()
    s, C = render(-19.3)
    print(f"{len(C)} cues, stem {integrated(s):.1f} LUFS, peak {20 * np.log10(np.abs(s).max()):.1f} dBFS, {time.time() - t_:.1f} s; unmapped: {unmapped()}")
    for c in sorted(C, key=lambda c: c.t):
        print(f"  f{c.t * F:7.1f}  {c.name:<26} {c.kind:<5} naive {c.naive:+5.1f} applied {c.applied:+5.1f} peak {c.peak_db:6.1f} dBFS  {c.t0 * F:7.1f}-{c.end * F:7.1f}  {c.ir} {c.send:.2f}")
