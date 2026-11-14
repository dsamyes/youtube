# The event vocabulary: every event TYPE of shots.json as a synthesized sound, rendered into one stereo SFX stem.
# Data-driven: SOUND maps each type to a builder (registered with @sound, which also carries the type's options and
# its one-line description for the manual); the builders call the generators of sfx_gen.py / instruments.py.
# A type that is not in SOUND stops the build before anything is rendered (build.py lists the valid ones).
# Options of one event come from the event itself (extra keys in shots.json) and from score.json "sfx"
# ({"type@frame": {...}}, which wins). Every event takes "level" and "pan".
# Levels follow the standard mix: each EVENT has a "naive" level (LU relative to the voice stem, measured as the
# event's max momentary loudness) and is placed SFX_DB = -6 dB under it; ambience BEDS (integrated loudness) are not
# reduced. Every sound starts on its frame (anchor <= 0.02 s of pre-roll for the whooshes).
# The place of the shot picks the reverb (score.json "places"). Tuned effects (ting, twinkle, slide whistles, record
# stop, fanfares) take their pitch from the key the score is in at that frame.
# "Dead cuts" (every white flash, every record_stop) silence everything that started before them, reverb included.
import zlib
import numpy as np
from dsp import SR, ns, tt, rng, dbg, lp, hp, pan, st, place, widen, fades, make_ir, convolve_st, momentary_max, integrated
import sfx_gen as G
import instruments as I
from project import pick, hz

SFX_DB = -6.0

# acoustics of a place -> (reverb, send, wet). score.json "places" maps every place of shots.json to one of these.
ROOMS = {"outdoor": ("open", 0.10, False), "water": ("open", 0.14, True), "tunnel": ("tunnel", 0.22, False),
         "void": ("void", 0.16, False), "room": ("room", 0.12, False), "hall": ("hall", 0.20, False)}
ROOM_DOC = {"outdoor": "open air: garden, street, park, field, desert (short, dry)", "water": "open air at or on water: sea, lake, pool, rain (pops get drips)",
            "tunnel": "pipe, shaft, corridor, cave mouth (long with close echoes)", "void": "space, a diagram, an abstract cutaway (long, far)",
            "room": "small indoor room: kitchen, lab, bedroom (very short)", "hall": "big indoor space: hangar, cave, cathedral, stadium (long)"}
IRS = {"open": lambda: make_ir(0.45, 71, pre=0.006, hf=2.2),
       "tunnel": lambda: make_ir(1.3, 72, pre=0.004, hf=1.3, early=[(0.021, 0.6, -0.4), (0.037, 0.5, 0.5), (0.058, 0.4, -0.2), (0.083, 0.3, 0.3)]),
       "void": lambda: make_ir(1.7, 73, pre=0.03, hf=1.0),
       "room": lambda: make_ir(0.28, 74, pre=0.003, hf=1.8, early=[(0.007, 0.5, -0.3), (0.013, 0.4, 0.4)]),
       "hall": lambda: make_ir(2.1, 75, pre=0.022, hf=1.4, early=[(0.031, 0.4, -0.5), (0.053, 0.35, 0.5)])}

_HZ = lambda m: 440.0 * 2 ** ((m - 69) / 12.0)


class Cue:
    def __init__(self, t, name, desc, gen, naive, kind="event", p=0.0, extra=0.0, lpf=None, send=0.0, ir="open", ev=None):
        self.t, self.name, self.desc, self.gen, self.naive = t, name, desc, gen, naive
        self.kind, self.p, self.extra, self.lpf, self.send, self.ir, self.ev = kind, p, extra, lpf, send, ir, ev
        self.applied = naive + (SFX_DB if kind == "event" else 0.0) + extra
        self.measured = None
        self.peak_db = None
        self.t0 = None
        self.end = None


class Spec:
    def __init__(self, fn, span, params, doc, group):
        self.fn, self.span, self.params, self.doc, self.group = fn, span, params, doc, group


SOUND = {}
COMMON = {"level": "naive level in LU relative to the voice (the default is in the table; -3 is loud, -12 soft)", "pan": "-1 left .. +1 right"}


def sound(*types, span="no", params=None, doc="", group="spot"):
    """register a builder. span: "need" = the event must have "to", "opt" = "to" sets its length, "no" = one shot."""
    def deco(fn):
        for t in types:
            SOUND[t] = Spec(fn, span, dict(params or {}), doc, group)
        return fn
    return deco


def _rng(ev, salt=0):
    return rng(zlib.crc32(f"{ev.type}:{ev.f:g}:{salt}".encode()))


def _lv(o, default):
    v = o.get("level", default)
    if not (isinstance(v, (int, float)) and not isinstance(v, bool) and -40 <= v <= 0):
        raise ValueError(f"level must be a number of LU relative to the voice, -40..0 (got {v!r})")
    return float(v)


def _one(o, name, valid, default):
    v = o.get(name, default)
    if v not in valid:
        raise ValueError(pick(v, valid, name))
    return v


def _numo(o, name, default, lo, hi):
    v = o.get(name, default)
    if not (isinstance(v, (int, float)) and not isinstance(v, bool) and lo <= v <= hi):
        raise ValueError(f"{name} must be a number {lo:g}..{hi:g} (got {v!r})")
    return v


class Kit:
    """what a builder may ask for: the project, the frame rate, the key of the score, the acoustics of a place"""

    def __init__(self, P, plan):
        self.P, self.plan, self.F = P, plan, P.fps
        self.dead = sorted({P.fr(f) for f in P.flashes} | {e.t for e in P.events("record_stop")})

    def room(self, place_):
        v = self.P.rooms.get(place_, "outdoor")
        if isinstance(v, dict):
            ir, send, wet = ROOMS[v.get("room", "outdoor")]
            return ir, float(v.get("send", send)), bool(v.get("wet", wet))
        return ROOMS[v]

    def tonic6(self, ev):
        """MIDI note of the home note of the score at this event, in the octave C6..B6"""
        return 84 + self.plan.tonic(ev.f)

    def E(self, ev, gen, naive, desc, p=0.0, send=1.0, name=None, t=None, **kw):
        """event cue at the event's frame, reverb chosen by the place of its shot"""
        ir, s, _wet = self.room(ev.place)
        if name is None and "pan" in ev.opts:
            p = _numo(ev.opts, "pan", 0.0, -1, 1)
        return Cue(ev.t if t is None else t, name or ev.type, desc, gen, naive, "event", p, send=s * send, ir=ir, ev=ev, **kw)

    def B(self, ev, make, naive, desc):
        """ambience bed over the event's span: fades in on its frame (over the picture crossfade if there is one),
        runs through the crossfade at its end, or stays at full level into a dead cut"""
        P, F = self.P, self.F
        fin = max(P.cut_in(int(ev.f)), 1) / F
        xo = P.cut_in(int(ev.to)) / F
        dead = any(abs(ev.t_end - c) < 1e-6 for c in self.dead)
        ext = 0.08 if dead else (xo if xo > 0 else 0.02)
        fout = 0.0 if dead else (xo if xo > 0 else (0.12 if ev.to >= P.total else 0.04))
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

    def cues(self):
        C = []
        for ev in self.P.ev:
            if ev.type.startswith("music_"):        # a marker for the score; the score itself is score.json
                continue
            C += SOUND[ev.type].fn(self, ev, ev.opts, _rng(ev))
        return C


def _mono(n_or_dur):
    return np.zeros(ns(n_or_dur))


# ================================================================ beds (ambiences; they need "to")
WIND_SHAPES = {  # band centre (Hz) and level over the span, naive level, description
    "rise": ([(0, 420), (1, 1300)], [(0, 0.5), (1, 1.0)], -15.0, "speed rush, rising"),
    "hook": ([(0, 520), (1, 1250)], [(0, 0.5), (0.85, 1.0), (1, 1.0)], -8.5, "falling rush under the hook, rising into the flash"),
    "hold": (None, None, -16.0, "rush: pitch and level rise to f{peak:.0f}, then hold"),
    "arc": ([(0, 520), (0.45, 1500), (1, 430)], [(0, 0.6), (0.45, 1.0), (0.9, 0.5), (1, 0.3)], -15.5, "rush up to top speed and down again"),
}


@sound("wind_rush", span="need", group="bed", params={
    "shape": "rise (default: faster and faster) | hook (already fast, loud; alone under a cold open, no music) | hold (rises to 'peak', then stays) | arc (up to 'peak' and down again)",
    "peak": "frame of top speed for hold / arc (default: the start of the last shot inside the span, or 45 % for arc)"},
    doc="Stylised speed rush, a cartoon whoosh that lasts (not real wind): a band of noise with a faint whistle and flutter that follows the speed. Falling, flying, driving fast. Default level -15 (hook -8.5).")
def _wind(K, ev, o, r):
    shape = _one(o, "shape", WIND_SHAPES, "rise")
    f, a, level, what = WIND_SHAPES[shape]
    peak = o.get("peak")
    if peak is not None and not (isinstance(peak, (int, float)) and ev.f < peak < ev.to):
        raise ValueError(f"peak must be a frame inside the span {ev.f:g}..{ev.to:g} (got {peak!r})")
    if shape == "hold":                                  # rises steadily until the peak, then holds
        if peak is None:
            peak = K.P.shots[K.P.shot_of(ev.to - 1)].a   # first frame of the last shot of the span
        u = ((peak if ev.f < peak < ev.to else ev.f + 0.7 * (ev.to - ev.f)) - ev.f) / (ev.to - ev.f)
        f, a = [(0, 230), (u, 1500), (1, 1500)], [(0, 0.22), (u, 1.0), (1, 1.0)]
        what = what.format(peak=ev.f + u * (ev.to - ev.f))
    elif shape == "arc" and peak is not None:
        u = (peak - ev.f) / (ev.to - ev.f)
        f, a = [(0, 520), (u, 1500), (1, 430)], [(0, 0.6), (u, 1.0), (u + 0.82 * (1 - u), 0.5), (1, 0.3)]

    def make(L):
        k = ev.dur / L
        return G.wind_rush(L, r, [(u * k, v) for u, v in f] + [(1.0, f[-1][1])], [(u * k, v) for u, v in a] + [(1.0, a[-1][1])])
    return [K.B(ev, make, _lv(o, level), what + " (noise band + faint whistle + flutter, follows the speed)")]


@sound("amb_garden", "amb_garden_evening", "amb_cricket", span="need", group="bed", params={
    "birds": "0..1, how much bird song (default 1; amb_cricket 0)", "cricket": "1 adds ONE cricket chirping alone, the sound of an awkward silence (default 0; amb_cricket 1)"},
    doc="Outdoor air. amb_garden: light breeze and sparrows (day). amb_garden_evening: softer breeze, blackbird phrases, crickets. "
        "amb_cricket: almost nothing, faint air and one cricket (the awkward pause after a dead stop). Default level -25 (amb_cricket -33).")
def _garden(K, ev, o, r):
    if ev.type == "amb_cricket":
        o = {"birds": 0.0, "cricket": 1.0, "level": -33.0, **o}
    evening = ev.type.endswith("evening")
    birds, cricket = _numo(o, "birds", 1.0, 0, 1), _numo(o, "cricket", 0.0, 0, 1)
    what = "awkward quiet: faint breeze and ONE cricket" if cricket > 0 and birds == 0 else (
        "evening garden: soft breeze, blackbird phrases, crickets" if evening else "garden air: light breeze, sparrows")
    out = [K.B(ev, lambda L: G.amb_garden(L, r, birds, 0.0, evening), _lv(o, -25.0), what)]
    if cricket > 0:
        r2 = _rng(ev, 1)
        out.append(K.E(ev, lambda: (G.cricket_solo(ev.dur + 0.15, r2, first=0.0), 0.0), -15.0, "the one cricket (3-pulse chirps, about 1.6 per second)",
                       p=0.35, send=0.5, name="cricket", t=ev.t + 0.2))
    return out


@sound("amb_ocean_night", span="need", group="bed",
       doc="Open sea close to a small boat: slow swells, foam, water lapping on the hull, timber creaks. Sea, lake, harbour, any calm water. Level -21.")
def _ocean(K, ev, o, r):
    return [K.B(ev, lambda L: G.ocean_night(L, r), _lv(o, -21.0), "night ocean: slow swells, foam, water lapping on the boat, timber creaks")]


@sound("amb_night", span="need", group="bed", doc="Night outdoors without birds: a chorus of crickets over faint air. Camping, desert night, a quiet street. Level -27.")
def _night(K, ev, o, r):
    return [K.B(ev, lambda L: G.breeze(L, r, 0.3, 0.15, 600) + widen(G.crickets(L, r, 3) * 0.05, r, 9, 1.0), _lv(o, -27.0), "night air: crickets over a faint breeze")]


@sound("amb_wind", span="need", group="bed", params={"strength": "0 light .. 1 storm (default 0.6)"},
       doc="Real wind: gusting air with a hollow howl that wanders. Mountain top, storm, desert, the outside of a plane. Level -22.")
def _awind(K, ev, o, r):
    s = _numo(o, "strength", 0.6, 0, 1)
    return [K.B(ev, lambda L: G.wind(L, r, s), _lv(o, -22.0), "wind: gusts with a wandering howl")]


@sound("amb_rain", span="need", group="bed", params={"heavy": "0 drizzle .. 1 downpour (default 0.5)"},
       doc="Rain: steady hiss, drops pattering, a little low weight. Add thunder events for a storm. Level -23.")
def _rain(K, ev, o, r):
    h = _numo(o, "heavy", 0.5, 0, 1)
    return [K.B(ev, lambda L: G.rain(L, r, h), _lv(o, -23.0), "rain: hiss and patter")]


@sound("amb_fire", span="need", group="bed", params={"size": "0 campfire .. 1 inferno (default 0.5)"},
       doc="Fire burning: low fluttering roar, hiss, crackles, now and then a pop. Campfire, lava, a burning house, the surface of a star. Level -23.")
def _fire(K, ev, o, r):
    s = _numo(o, "size", 0.5, 0, 1)
    return [K.B(ev, lambda L: G.fire(L, r, s), _lv(o, -23.0), "fire: fluttering roar and crackle")]


@sound("amb_river", span="need", group="bed", doc="Running water close by: flow, babble, lapping, a slosh and a drip now and then. River, stream, flooded street, a bath. Level -22.")
def _river(K, ev, o, r):
    return [K.B(ev, lambda L: G.water_bed(L, r, 0.6, 0.5), _lv(o, -22.0), "running water: flow, babble, sloshes")]


@sound("bubbling", span="need", group="bed", params={"rate": "small bubbles per second, 5..80 (default 26)"},
       doc="A liquid bubbling: plinks of all sizes over a low gurgle. Boiling pot, lab flask, lava, swamp, under water. Level -22.")
def _bubbling(K, ev, o, r):
    rate = _numo(o, "rate", 26.0, 5, 80)
    return [K.B(ev, lambda L: G.bubbling(L, r, rate), _lv(o, -22.0), "bubbling liquid")]


@sound("amb_drone", span="need", group="bed", doc="The hum of empty space, a spaceship or a machine hall: a low open fifth that breathes, a little air. Space, deep sea, inside a computer, a dream. Level -24.")
def _drone(K, ev, o, r):
    return [K.B(ev, lambda L: G.drone(L, r), _lv(o, -24.0), "low breathing drone")]


@sound("amb_room", span="need", group="bed", doc="Indoor quiet: soft air and a faint mains hum, so a room is never dead silent. Kitchen, lab, office, bedroom. Level -32.")
def _roomtone(K, ev, o, r):
    return [K.B(ev, lambda L: G.room_tone(L, r), _lv(o, -32.0), "room tone: soft air, faint hum")]


@sound("amb_crowd", span="need", group="bed", doc="A room of people talking, no word understood. Market, classroom, stadium before the game, a party. Level -26.")
def _acrowd(K, ev, o, r):
    return [K.B(ev, lambda L: G.murmur(L, r), _lv(o, -26.0), "crowd murmur: six far voices")]


@sound("rocket_rumble", span="need", group="bed", params={"shape": "rise (default: builds over the span) | steady | fade (flies away)"},
       doc="Rocket, jet or giant engine: low roar with a crackling band and flutter. Launches, volcano, earthquake, a monster truck. Level -13 (it is meant to be felt).")
def _rocket(K, ev, o, r):
    shape = _one(o, "shape", ("rise", "steady", "fade"), "rise")
    return [K.B(ev, lambda L: G.roar(L, r, shape), _lv(o, -13.0), f"engine roar ({shape}): low rumble + crackle")]


# ================================================================ whooshes / hits
@sound("whoosh", doc="Quick light whoosh, an ease-out burst of air. Hard cuts, a fast arm, something passing. The everyday transition sound. Level -10.")
def _whoosh(K, ev, o, r):
    return [K.E(ev, lambda: (G.whoosh(0.6, r, 0.045, 330, 2000, 0.8, 0.18, 0.15), 0.02), _lv(o, -10.0), "quick whoosh (ease-out burst): " + ev.note)]


@sound("whoosh_big", doc="Big deep 'whooom': an air band diving from bright to dark with a sub swell, 1 s. Big camera moves, a reveal of scale, a giant passing. Level -2.")
def _whoosh_big(K, ev, o, r):
    return [K.E(ev, lambda: (G.whoosh_deep(r), 0.02), _lv(o, -2.0), "big deep whoosh (air band diving from bright to dark + sub swell): " + ev.note)]


@sound("flash_hit", doc="The white flash: bright airy burst with a soft low whoomp. Put it on every flash_at frame. Level -5.")
def _flash(K, ev, o, r):
    def gen():
        dur = 0.8
        t = tt(dur)
        y = G.whoosh(dur, r, 0.03, 500, 4200, 0.9, 0.12, 0.4)[: len(t)]
        y = y + np.exp(-t / 0.12) * np.sin(2 * np.pi * 62 * t) * 0.8
        return widen(y, r, 12, 0.9), 0.012
    return [K.E(ev, gen, _lv(o, -5.0), "white flash: bright airy burst + soft low whoomp; whatever sounded before is cut here", send=1.5)]


@sound("impact_kick", doc="Speed-surge kick: soft sub thump with an upward burst of air. A sudden acceleration, a launch, a punchy emphasis on one word. Level -5.")
def _kick(K, ev, o, r):
    return [K.E(ev, lambda: (G.impact_kick(r), 0.0), _lv(o, -5.0), "speed-surge kick (sub thump + upward air burst): " + ev.note)]


@sound("decel_whoosh", span="opt", doc="The opposite of a whoosh: air and a faint tone sinking in pitch and level as something slows down ('to' sets the length, default 0.8 s). Level -10.")
def _decel(K, ev, o, r):
    d = ev.dur or 0.8
    return [K.E(ev, lambda: (G.decel_whoosh(d, r), 0.0), _lv(o, -10.0), "slowing down: air band + faint tone sinking in pitch and level")]


@sound("push_whoosh", doc="A push or shove: hands on a back, a little jingle, a soft whoosh. Pushing a swing, a cart, a door. Level -9.")
def _push(K, ev, o, r):
    def gen():
        y = np.zeros(ns(0.5))
        G._place_mono(y, G.push_thump(r), 0.0)
        G._place_mono(y, G.whoosh(0.4, r, 0.045, 300, 1500, 0.8, 0.1, 0.1) * 0.9, 0.0)
        return y, 0.0
    return [K.E(ev, gen, _lv(o, -9.0), "push: hands on the back + jingle + soft whoosh", p=0.1)]


@sound("zip", params={"size": "normal (default) | small (higher and lighter: something tiny, or seen from far)"},
       doc="'Zwip' pass-by: a tone and air racing up, a short Doppler fall. A bullet, a bee, a fast car in the distance, text flying in. Level -7 (small -8).")
def _zip(K, ev, o, r):
    lo, hi, lv = {"normal": (420.0, 3200.0, -7.0), "small": (520.0, 3600.0, -8.0)}[_one(o, "size", ("normal", "small"), "normal")]
    return [K.E(ev, lambda: (G.zip_by(r, lo, hi), 0.02), _lv(o, lv), "'zwip' pass-by: " + ev.note)]


@sound("car_pass", span="opt", doc="A car driving past, left to right: engine note dropping as it passes, tyre noise ('to' sets the length, default 1.2 s). Any vehicle going by. Level -6.")
def _carpass(K, ev, o, r):
    d = ev.dur or 1.2
    return [K.E(ev, lambda: (G.car_pass(d, r), 0.0), _lv(o, -6.0), "car passing left to right: " + ev.note)]


# ================================================================ pops, blips, bells
def _pitch(o, default, name="pitch"):
    return hz(o[name]) if name in o else default


PITCH = {"pitch": 'note name ("G6"), MIDI number, or Hz above 127'}


@sound("pop", params=PITCH, doc="Small bright cartoon pop. Something appears: a flag, a label, a bubble, an idea. Level -8.")
def _pop(K, ev, o, r):
    f = _pitch(o, 880.0)
    return [K.E(ev, lambda: (G.pop_small(r, f), 0.0), _lv(o, -8.0), "small bright pop: " + ev.note)]


@sound("arrow_pop", doc="A graphic card pops in: pop with a tiny high blip. Arrows, labels, numbers on screen. Level -8.")
def _arrow(K, ev, o, r):
    def gen():
        y = np.zeros(ns(0.4))
        G._place_mono(y, G.pop_small(r, 1175.0), 0.0)
        G._place_mono(y, G.blip([(0.0, 0.07, 1175.0, 1175.0)], r) * 0.5, 0.012)
        return y, 0.0
    return [K.E(ev, gen, _lv(o, -8.0), "card pops in: pop + tiny D6 blip")]


@sound("flip_blip", doc="Two-note 'bi-dup' with a flick of air. A card flips, a sign reverses, a value changes. Level -8.")
def _flip(K, ev, o, r):
    def gen():
        y = np.zeros(ns(0.45))
        G._place_mono(y, G.blip([(0.0, 0.05, 1568.0, 1568.0), (0.075, 0.09, 1175.0, 1245.0)], r), 0.0)
        G._place_mono(y, G.whoosh(0.2, r, 0.03, 600, 2500, 0.6, 0.05, 0.2) * 0.35, 0.0)
        return y, 0.0
    return [K.E(ev, gen, _lv(o, -8.0), "flip: two-note 'bi-dup' (G6, D6) + a flick of air")]


@sound("question_blip", doc="Two soft blips, the second bending up like a question. A '?' appears, somebody wonders. Level -7.")
def _question(K, ev, o, r):
    return [K.E(ev, lambda: (G.blip([(0.0, 0.09, 880.0, 880.0), (0.13, 0.16, 1108.7, 1318.5)], r), 0.0), _lv(o, -7.0),
                "'?': two soft blips, the second one bending up like a question (A5, C#6 -> E6)")]


@sound("blip", "beep", params=PITCH, doc="blip: one tiny neutral tone (0.08 s), the plainest marker for anything on screen. beep: the same, longer (0.2 s): a machine, a scanner, a countdown. Level -10 / -9.")
def _blip(K, ev, o, r):
    d, lv = (0.08, -10.0) if ev.type == "blip" else (0.2, -9.0)
    f = _pitch(o, 990.0 if ev.type == "blip" else 1318.5)
    return [K.E(ev, lambda: (G.blip([(0.0, d, f, f)], r), 0.0), _lv(o, lv), f"{ev.type} at {f:.0f} Hz: " + ev.note)]


@sound("ding", params=PITCH, doc="Friendly two-bell 'ding!' (G6 + C7). Correct, done, thumbs-up, an idea lands. Level -7.")
def _ding(K, ev, o, r):
    f = _pitch(o, 1568.0)
    return [K.E(ev, lambda: (G.ding(r, f), 0.0), _lv(o, -7.0), "friendly two-bell 'ding': " + ev.note)]


@sound("ting", params={"pitch": PITCH["pitch"] + "; default: the home note of the score at that frame"},
       doc="One triangle 'ting', tuned to the score. Something stops dead, hangs in the air, a tiny highlight. Level -9.")
def _ting(K, ev, o, r):
    f = _pitch(o, _HZ(K.tonic6(ev)))
    return [K.E(ev, lambda: (I.triangle(0.5, r, dur=1.2, f=f), 0.0), _lv(o, -9.0), f"triangle 'ting' ({f:.0f} Hz): " + ev.note)]


@sound("twinkle", doc="Sparkle: a quick run of five tiny bells, tuned to the score. Magic, stars, something delicate, a friendly wave, clean and shiny. Level -9.")
def _twinkle(K, ev, o, r):
    pcs = {(K.plan.tonic(ev.f) + d) % 12 for d in (0, 4, 7, 9)}          # the key's major-sixth chord
    fr = [_HZ(m + 12) for m in [m for m in range(80, 104) if m % 12 in pcs][:5]]
    return [K.E(ev, lambda: (G.twinkle(r, fr), 0.0), _lv(o, -9.0), "sparkle run of five tiny bells: " + ev.note)]


@sound("ricochet_ping", doc="Small cartoon ricochet 'pyeeow'. A near miss, something bounces off, a cheeky glance. Level -9.")
def _rico(K, ev, o, r):
    return [K.E(ev, lambda: (G.ricochet(r), 0.0), _lv(o, -9.0), "cartoon ricochet 'pyeeow', small: " + ev.note, p=0.15)]


@sound("laser_zap", doc="Toy ray gun 'pew': a tone that dives three octaves. Lasers, robots, sci-fi gadgets, a scanner beam. Level -7.")
def _laser(K, ev, o, r):
    return [K.E(ev, lambda: (G.laser_zap(r), 0.0), _lv(o, -7.0), "ray gun 'pew': " + ev.note)]


@sound("zap", doc="Electric spark: a ragged crackle buzzing at mains rate, 0.3 s. Electric shock, lightning close up, static, a short circuit. Level -7.")
def _zap(K, ev, o, r):
    return [K.E(ev, lambda: (G.zap(r), 0.0), _lv(o, -7.0), "electric spark: " + ev.note)]


@sound("power_up", "power_down", doc="A machine powering up (pitch and shimmer rise to a held tone) or down (it sinks and dies), 0.7 s. Switching on, charging, shutting down, deflating. Level -8.")
def _power(K, ev, o, r):
    up = ev.type == "power_up"
    return [K.E(ev, lambda: (G.power_sweep(r, up), 0.0), _lv(o, -8.0), ("power up: " if up else "power down: ") + ev.note)]


@sound("cork_pop", params={"wet": "true adds a few drips (default: true in a place whose acoustics is 'water')"},
       doc="Loud cork 'pop!'. Somebody or something pops out of a hole, a pipe, the water, a box. Level -3.")
def _cork(K, ev, o, r):
    wet = bool(o.get("wet", K.room(ev.place)[2]))

    def gen():
        y = np.zeros(ns(0.5))
        G._place_mono(y, G.cork_pop(r, 520.0), 0.0)
        if wet:
            t = tt(0.45)
            G._place_mono(y, G.bubbles(0.45, r, 55.0, 900, 3200, (0.004, 0.012), np.exp(-t / 0.12), rise=(8, 25)) * 0.3, 0.02)
        return y, 0.0
    return [K.E(ev, gen, _lv(o, -3.0), "cork pop" + (" + a few drips" if wet else "") + ": " + ev.note)]


@sound("glass_pop", doc="Small glass pop: pressure pop, glass tink, tiny shards. A thermometer, a light bulb, a test tube, a window far away. Level -6.")
def _glass(K, ev, o, r):
    return [K.E(ev, lambda: (G.glass_pop(r), 0.0), _lv(o, -6.0), "glass pops: small pop + glass tink + tiny shards")]


@sound("timer_ticks", span="opt", doc="Wind-up egg timer: fast tick-tock (about 9 a second) with a faint whirr, the last tick on 'to' (default 1.4 s). Waiting, a short countdown. Level -14.")
def _ticks(K, ev, o, r):
    d = ev.dur or 1.4
    step = d / max(1, round(d / (3.5 / K.F)))
    return [K.E(ev, lambda: (G.timer_ticks(d, r, step), 0.0), _lv(o, -14.0),
                f"egg timer: {round(d / step) + 1} tick-tocks, one every {step * K.F:.1f} frames, last one on f{ev.f + d * K.F:g}", p=-0.15)]


@sound("clock_tick", span="opt", params={"every": "frames between ticks (default: half a second)"},
       doc="Wall clock: slow tick ... tock ('to' sets the length, default 2 s). Time passing, a long wait, a slow countdown, suspense. Level -13.")
def _clock(K, ev, o, r):
    d = ev.dur or 2.0
    step = _numo(o, "every", 0.5 * K.F, 3, 120) / K.F
    return [K.E(ev, lambda: (G.clock_ticks(d, r, step), 0.0), _lv(o, -13.0), f"clock: tick-tock every {step * K.F:g} frames", p=-0.15)]


@sound("timer_ding", params=PITCH, doc="Kitchen-timer bell (C7), one bright strike ringing for a second. Time is up, ready, the answer arrives. Level -4.")
def _tding(K, ev, o, r):
    f = _pitch(o, 2093.0)
    return [K.E(ev, lambda: (G.timer_ding(r, f), 0.0), _lv(o, -4.0), "kitchen-timer bell, rings about 1 s: " + ev.note, p=-0.15)]


@sound("bell", params={"pitch": PITCH["pitch"] + " (default G4)"}, doc="One stroke of a big bell, ringing 2.8 s. Clock tower, school, church, a ship, a boxing round. Level -6.")
def _bell(K, ev, o, r):
    f = _pitch(o, 392.0)
    return [K.E(ev, lambda: (G.bell(r, f), 0.0), _lv(o, -6.0), f"big bell ({f:.0f} Hz): " + ev.note)]


@sound("buzzer", doc="Game-show 'wrong!' buzzer, half a second. A wrong answer, a myth busted, access denied. Level -6.")
def _buzzer(K, ev, o, r):
    return [K.E(ev, lambda: (G.buzzer(r), 0.0), _lv(o, -6.0), "'wrong' buzzer: " + ev.note)]


@sound("alarm", span="opt", params={"kind": "beep (default: digital, four beeps a second) | siren (two-tone hi-lo) | bell (alarm clock)"},
       doc="An alarm ('to' sets the length, default 1.5 s). Warning, emergency, wake up, a countdown running out. Level -12 (it sits in the speech band; keep it short under narration).")
def _alarm(K, ev, o, r):
    d = ev.dur or 1.5
    kind = _one(o, "kind", ("beep", "siren", "bell"), "beep")
    return [K.E(ev, lambda: (G.alarm(d, r, kind), 0.0), _lv(o, -12.0), f"alarm ({kind}): " + ev.note)]


@sound("car_horn", params={"beeps": "2 (default: beep-beep) | 1 (one long honk)"}, doc="Two-tone car horn. Traffic, impatience, 'out of the way', a clown car. Level -5.")
def _horn(K, ev, o, r):
    n = _one(o, "beeps", (1, 2), 2)
    return [K.E(ev, lambda: (G.car_horn(r, n), 0.0), _lv(o, -5.0), ("car horn, beep-beep: " if n == 2 else "car horn, one long honk: ") + ev.note)]


@sound("camera_click", "click", doc="camera_click: shutter click-whirr-clack (a photo, a snapshot of a moment). click: one small mechanical click (a switch, a button, a seat belt). Level -10 / -11.")
def _click(K, ev, o, r):
    if ev.type == "click":
        return [K.E(ev, lambda: (G.tick_click(r), 0.0), _lv(o, -11.0), "click: " + ev.note)]
    return [K.E(ev, lambda: (G.camera_click(r), 0.0), _lv(o, -10.0), "camera shutter: " + ev.note)]


@sound("typing", span="opt", doc="Somebody typing: key clicks in bursts ('to' sets the length, default 1.5 s). Computers, hacking, a calculation, a letter being written. Level -13.")
def _typing(K, ev, o, r):
    d = ev.dur or 1.5
    return [K.E(ev, lambda: (G.typing(d, r), 0.0), _lv(o, -13.0), "typing: " + ev.note, p=0.1)]


# ================================================================ comedy bodies
@sound("shovel_thunk", doc="A blade into earth: thud, grit, dull metal ring. Digging, planting a flag or a sign, an axe, a spade. Level -6.")
def _shovel(K, ev, o, r):
    return [K.E(ev, lambda: (G.shovel_thunk(r), 0.0), _lv(o, -6.0), "blade into the dirt: thud + grit + dull ring")]


@sound("flame_poof", doc="'Fwoomp': something catches fire, with flutter and a few crackles. Ignition, a match, a burner, a dragon's hiccup. Level -6.")
def _poof(K, ev, o, r):
    return [K.E(ev, lambda: (G.flame_poof(r), 0.0), _lv(o, -6.0), "'fwoomp' + flutter + crackle: " + ev.note, p=0.2)]


@sound("sizzle", params={"dur": "seconds, 0.3..3 (default 0.7)"}, doc="Frying sizzle that dies away. Burnt, hot surface, acid, something fizzing or dissolving. Level -9.")
def _sizzle(K, ev, o, r):
    d = _numo(o, "dur", 0.7, 0.3, 3.0)
    return [K.E(ev, lambda: (G.sizzle(r, d), 0.0), _lv(o, -9.0), "sizzle dying away: " + ev.note, p=0.2)]


@sound("splat", doc="Wet splat: slap, squelch, glops, low thud. Food on the floor, mud, slime, a tomato, a bug on a windscreen. Level -4.")
def _splat(K, ev, o, r):
    return [K.E(ev, lambda: (G.splat(r), 0.0), _lv(o, -4.0), "wet splat: slap + squelch + glops + thud (" + ev.note + ")", p=-0.1)]


@sound("splash", params={"size": "small (default: a plop with bubbles) | big (a body or a boat hits the water, 2.6 s)"},
       doc="Something falls into water. Level -5 (big -3).")
def _splash(K, ev, o, r):
    big = _one(o, "size", ("small", "big"), "small") == "big"
    return [K.E(ev, lambda: ((widen(G.splash_big(r), r, 11, 0.6) if big else G.plop(r)), 0.0), _lv(o, -3.0 if big else -5.0),
                ("big splash: thump, slap, bubble cloud, spray: " if big else "plop + bubbles: ") + ev.note)]


@sound("drip", doc="One drop of water into water, with its small echo. A leak, a cave, a tear, a tap, 'one drop is enough'. Level -10.")
def _drip(K, ev, o, r):
    return [K.E(ev, lambda: (G.drip(r), 0.0), _lv(o, -10.0), "water drop: " + ev.note)]


@sound("paper_flick", doc="Paper flaps and a small board knock. A clipboard, a map, a newspaper, a page turned, a card held up. Level -11.")
def _paper(K, ev, o, r):
    return [K.E(ev, lambda: (G.paper_flick(r), 0.0), _lv(o, -11.0), "paper flaps + board knock: " + ev.note)]


@sound("jump_boing", "boing", doc="Cartoon spring 'boing'. A hop, a bounce, a jump off, eyes popping out. Level -5.")
def _boing(K, ev, o, r):
    return [K.E(ev, lambda: (G.boing(r), 0.0), _lv(o, -5.0), "spring 'boing': " + ev.note)]


@sound("bonk", doc="Hollow wooden 'bonk' that dips in pitch. A knock on the head, a coconut, a dumb idea, two things bump. Level -6.")
def _bonk(K, ev, o, r):
    return [K.E(ev, lambda: (G.bonk(r), 0.0), _lv(o, -6.0), "cartoon bonk: " + ev.note)]


@sound("squeak", doc="Rubber-toy squeak. A squeaky shoe, a mouse, a tiny brake, something small squeezed. Level -8.")
def _squeak(K, ev, o, r):
    return [K.E(ev, lambda: (G.squeak(r), 0.0), _lv(o, -8.0), "rubber squeak: " + ev.note)]


@sound("gulp", doc="Cartoon gulp: a throat thump and a bubble. Nervous, 'uh-oh', swallowing, the smile drops. Level -7.")
def _gulp(K, ev, o, r):
    return [K.E(ev, lambda: (G.gulp(r), 0.0), _lv(o, -7.0), "cartoon gulp: " + ev.note)]


@sound("chomp", doc="One big bite: jaw snap, crunch, 'omp'. Eating, a shark, a black hole swallowing something. Level -5.")
def _chomp(K, ev, o, r):
    return [K.E(ev, lambda: (G.chomp(r), 0.0), _lv(o, -5.0), "one big bite: jaw snap + crunch + 'omp'")]


@sound("thud", doc="Something heavy and soft hits the floor: low thump, no ring. A body, a sack, a book, fainting, landing. Level -5.")
def _thud(K, ev, o, r):
    return [K.E(ev, lambda: (G.thud(r), 0.0), _lv(o, -5.0), "heavy soft thud: " + ev.note)]


@sound("crash", doc="Something big falls over or breaks: splintering crack and boom, bits clattering down, 1.9 s. A shelf, a tree, a wall, a pile of plates. Level -3.")
def _crash(K, ev, o, r):
    return [K.E(ev, lambda: (widen(G.crash(r), r, 11, 0.6), 0.0), _lv(o, -3.0), "crash: crack + boom + clatter: " + ev.note)]


@sound("metal_clang", params={"pitch": PITCH["pitch"] + " (default 310 Hz; higher = smaller object)"},
       doc="A big piece of metal struck: bright hit, long inharmonic ring. A pipe, a pan, an anvil, a hull, a robot's head. Level -6.")
def _clang(K, ev, o, r):
    f = _pitch(o, 310.0)
    return [K.E(ev, lambda: (G.clang(r, f), 0.0), _lv(o, -6.0), "metal clang: " + ev.note)]


@sound("door_slam", "knock", "door_creak", span="opt", params={"count": "knock only: how many knocks, 1..6 (default 3)"},
       doc="door_slam: heavy thump, panel ring, latch, rattle (level -4). knock: knuckles on wood (level -7). door_creak: a slow wooden creak, 'to' sets the length, default 0.9 s (level -9).")
def _door(K, ev, o, r):
    if ev.type == "door_slam":
        return [K.E(ev, lambda: (G.door_slam(r), 0.0), _lv(o, -4.0), "door slam: " + ev.note)]
    if ev.type == "knock":
        n = int(_numo(o, "count", 3, 1, 6))
        return [K.E(ev, lambda: (G.knock(r, n), 0.0), _lv(o, -7.0), f"{n} knocks on wood: " + ev.note)]
    d = ev.dur or 0.9
    return [K.E(ev, lambda: (lp(G.creak(d, r, 55, 150, G.WOOD, [(0, 0.3), (0.1, 1), (0.8, 0.8), (1, 0)], rough=0.14, noise=0.03, scale=1.2), 5000, 2), 0.0), _lv(o, -9.0),
                "door creak: " + ev.note)]


@sound("footsteps", span="opt", params={"pace": "steps per second, 0.5..6 (default 2)", "surface": "hard (default: floor, planks, pavement) | soft (grass, carpet, sand, snow)",
                                         "at": "list of frames, one step on each (instead of pace)"},
       doc="Somebody walking or running, left-right ('to' sets the length, default two steps). Level -11.")
def _steps(K, ev, o, r):
    soft = _one(o, "surface", ("hard", "soft"), "hard") == "soft"
    step = 1.0 / _numo(o, "pace", 2.0, 0.5, 6)
    times = _times(K, ev, o, step, ev.dur or step + 0.26, edge=0.0)
    return [K.E(ev, lambda: (G.steps(times, r, soft), 0.0), _lv(o, -11.0), f"{len(times)} footsteps ({'soft' if soft else 'hard'} ground): " + ev.note)]


@sound("heartbeat", span="opt", params={"bpm": "beats per minute, 40..200 (default 72; 120+ is fear or effort)"},
       doc="Lub-dub heartbeat ('to' sets the length, default two beats). Fear, suspense, the body, 'still alive'. Works best with little music. Level -8.")
def _heart(K, ev, o, r):
    bpm = _numo(o, "bpm", 72.0, 40, 200)
    d = ev.dur or 2 * 60.0 / bpm
    return [K.E(ev, lambda: (G.heartbeat(d, r, bpm), 0.0), _lv(o, -8.0), f"heartbeat, {bpm:g} bpm: " + ev.note)]


@sound("bird_tweet", doc="One small bird: a few quick chirps. A bird lands, somebody is knocked silly, a peaceful beat. Level -11.")
def _tweet(K, ev, o, r):
    return [K.E(ev, lambda: (G.tweet(r), 0.0), _lv(o, -11.0), "bird chirps: " + ev.note, p=0.2)]


# ================================================================ big ones
@sound("thunder", params={"distance": "near (default: crack, then rumble) | far (rumble only, softer)"},
       doc="Thunder: a tearing crack, then a rumble that rolls for 3.4 s. Storms, a giant's footstep far away, doom. Level -3 (far -8).")
def _thunder(K, ev, o, r):
    far = _one(o, "distance", ("near", "far"), "near") == "far"
    return [K.E(ev, lambda: (G.thunder(r, close=0.0 if far else 0.7), 0.0), _lv(o, -8.0 if far else -3.0), ("far thunder: " if far else "thunder crack + rolling rumble: ") + ev.note)]


@sound("explosion", params={"size": "0.5 small .. 1.5 huge (default 1)"},
       doc="Cartoon explosion: sub thump, a blast that darkens fast, rumble, debris, 2 s. Booms, eruptions, impacts, a failed experiment. Level -2.")
def _explosion(K, ev, o, r):
    s = _numo(o, "size", 1.0, 0.5, 1.5)
    return [K.E(ev, lambda: (G.explosion(r, 2.0 * s ** 0.5, s), 0.0), _lv(o, -2.0), "explosion: thump + blast + debris: " + ev.note)]


# ================================================================ people
@sound("crowd_gasp", "crowd_ooh", "crowd_cheer", "applause", span="opt",
       doc="A small crowd (formant-synthesized voices). crowd_gasp: a sharp shared gasp (level -6). crowd_ooh: an impressed 'ooh' (-7). "
           "crowd_cheer: hurrahs over clapping, 'to' sets the length, default 1.8 s (-8). applause: clapping only, default 2 s (-10).")
def _crowd(K, ev, o, r):
    if ev.type == "applause":
        d = ev.dur or 2.0

        def gen():
            n = ns(d + 0.3)
            tn = np.arange(n) / SR
            return lp(G.applause(d + 0.3, r, 24, np.clip(tn / 0.15, 0.35, 1) * np.clip((d + 0.3 - tn) / 0.5, 0, 1)), 9000, 2), 0.0
        return [K.E(ev, gen, _lv(o, -10.0), "applause: " + ev.note, send=0.6)]
    kind = ev.type[6:]
    d = ev.dur or 1.8
    pre = {"gasp": 0.01, "ooh": 0.02, "cheer": 0.0}[kind]                 # voices need a few ms to speak up
    return [K.E(ev, lambda: (G.crowd(r, kind, 9, d), pre), _lv(o, {"gasp": -6.0, "ooh": -7.0, "cheer": -8.0}[kind]), f"crowd {kind}: " + ev.note, send=0.6)]


@sound("oof", params={"kind": "oof (default) | ugh | oh | ow"}, doc="One man's short impact grunt. Somebody lands, gets hit, lifts something heavy. Level -6.")
def _oof(K, ev, o, r):
    kind = _one(o, "kind", ("oof", "ugh", "oh", "ow"), "oof")
    return [K.E(ev, lambda: (G.oof(r, kind), 0.0), _lv(o, -6.0), f"'{kind}': " + ev.note)]


# ================================================================ musical stings (they are in the key of the score)
@sound("record_stop", doc="Record stop: needle scratch and the band's last chord winding down in 0.4 s. It is also a DEAD CUT: every sound that started before it stops. "
                          "Put it on the first frame of a 'silence' section, for 'But wait'. Level -3.")
def _recstop(K, ev, o, r):
    t0 = 60 + (K.plan.tonic(ev.f) - 0) % 12              # the score's dominant seventh, around middle C
    chord = [_HZ(m) for m in (t0 - 5, t0 - 1, t0 + 2, t0 + 5)]
    return [K.E(ev, lambda: (G.record_stop(r, chord), 0.0), _lv(o, -3.0), "record stop: needle scratch + the last chord winding down to nothing (0.4 s)", send=0.3)]


SLIDE = {"pitch": "start note (default from the key of the score)", "pitch_to": "end note (default from the key of the score)"}


@sound("slide_whistle_down", span="opt", params=SLIDE, doc="Slide whistle falling two octaves onto the home note, faster at the end like a falling body ('to' = when it lands, default 0.55 s). "
                                                           "Falling, dropping out of frame, deflating, a plan failing. Level -7.")
def _slide_down(K, ev, o, r):
    d = ev.dur or 0.55
    f0, f1 = _pitch(o, _HZ(K.tonic6(ev) - 1)), _pitch(o, _HZ(K.tonic6(ev) - 24), "pitch_to")
    return [K.E(ev, lambda: (G.slide_whistle(d, r, f0, f1, bend=1.25), 0.0), _lv(o, -7.0),
                f"slide whistle falling {f0:.0f} -> {f1:.0f} Hz over {d * K.F:.0f} frames: " + ev.note)]


@sound("slide_whistle_up", span="opt", params=SLIDE, doc="Slide whistle shooting up two octaves ('to' = when it arrives, default 0.5 s). Jumping up, taking off, a rocket-powered idea, eyebrows. Level -7.")
def _slide_up_fast(K, ev, o, r):
    d = ev.dur or 0.5
    f0, f1 = _pitch(o, _HZ(K.tonic6(ev) - 24)), _pitch(o, _HZ(K.tonic6(ev) - 1), "pitch_to")
    return [K.E(ev, lambda: (G.slide_whistle(d, r, f0, f1, bend=1.25), 0.0), _lv(o, -7.0),
                f"slide whistle rising {f0:.0f} -> {f1:.0f} Hz over {d * K.F:.0f} frames: " + ev.note)]


@sound("slide_whistle_up_slowing", span="opt", params=SLIDE, doc="Slide whistle rising slower and slower and fading to nothing by 'to' (default 3 s). "
                                                                 "Something rises and runs out of speed: a ball thrown up, a balloon, hope. Level -9.")
def _slide_up(K, ev, o, r):
    d = ev.dur or 3.0
    f0, f1 = _pitch(o, _HZ(K.tonic6(ev) - 17)), _pitch(o, _HZ(K.tonic6(ev)), "pitch_to")
    return [K.E(ev, lambda: (G.slide_whistle(d, r, f0, f1, bend=2.2, ease_out=True, fade_tail=0.5, vib=6.0), 0.0), _lv(o, -9.0),
                f"slide whistle rising {f0:.0f} -> {f1:.0f} Hz, slower and slower, fading to nothing by f{ev.f + d * K.F:g}")]


@sound("sad_trombone", doc="'Wah wah wah waaah': four falling trombone notes, 1.9 s, in the key of the score. Failure, disappointment, the plan did not work. "
                           "Only in a 'silence' section or over mystery / lullaby. Level -5.")
def _sadtrombone(K, ev, o, r):
    top = 55 + (K.plan.tonic(ev.f) + 7) % 12              # starts on the fifth of the key, steps down by semitones

    def gen():
        y = _mono(2.2)
        for k, (tm, d) in enumerate([(0.0, 0.3), (0.36, 0.3), (0.72, 0.3), (1.08, 0.8)]):
            G._place_mono(y, I.brass(_HZ(top - k), d, 0.6, r, "horn", scoop=-45.0, fall=-1.6 if k == 3 else -0.3, rel=0.1), tm)
        return y, 0.0
    return [K.E(ev, gen, _lv(o, -5.0), "sad trombone, four falling notes: " + ev.note, p=-0.1)]


@sound("tada", doc="'Ta-daa!': two brass chords and a cymbal, 1 s, in the key of the score. A reveal, a result, a proud moment. Only in a 'silence' section "
                   "(the finale has its own). Level -4.")
def _tada(K, ev, o, r):
    t0 = 60 + K.plan.tonic(ev.f)

    def gen():
        y = np.zeros((2, ns(1.6)))
        for m, p_ in ((t0, -0.2), (t0 + 4, 0.0), (t0 + 7, 0.2)):
            place(y, pan(I.brass(_HZ(m), 0.1, 0.7, r, "stab", scoop=-12.0), p_), 0.0)
        for m, p_ in ((t0 + 4, -0.2), (t0 + 7, 0.0), (t0 + 12, 0.2)):
            place(y, pan(I.brass(_HZ(m), 0.6, 0.75, r, "horn", scoop=-18.0, rel=0.15), p_), 0.17)
        place(y, pan(lp(I.cymbal(0.35, r, dur=1.3), 9500, 2), 0.0), 0.17)
        return y, 0.0
    return [K.E(ev, gen, _lv(o, -4.0), "'ta-daa': two brass chords + cymbal: " + ev.note)]


@sound("rimshot", doc="'Ba-dum tss': two drum hits and a cymbal, 1.2 s. The punch line of a joke. Only in a 'silence' section or over soft music. Level -5.")
def _rimshot(K, ev, o, r):
    def gen():
        y = _mono(1.3)
        G._place_mono(y, I.snare(0.75, r, tune=1.2), 0.0)
        G._place_mono(y, I.snare(0.85, r, tune=0.78, snappy=0.45), 0.15)
        G._place_mono(y, lp(I.cymbal(0.55, r, dur=0.9), 9500, 2), 0.33)
        G._place_mono(y, I.snare(0.5, r, tune=1.0, snappy=0.3) * 0.5, 0.33)
        return lp(y, 9500, 2), 0.0
    return [K.E(ev, gen, _lv(o, -5.0), "rimshot 'ba-dum tss': " + ev.note)]


@sound("drum_roll", span="opt", doc="Snare roll that swells and ends in a cymbal crash on 'to' (default 1.5 s). Suspense before a reveal: 'and the answer is ...'. "
                                    "Only in a 'silence' section or over soft music. Level -8.")
def _drumroll(K, ev, o, r):
    d = ev.dur or 1.5

    def gen():
        y = _mono(d + 1.2)
        for tm, v in I.snare_roll(0.0, d, 0.25, 0.8, r):
            G._place_mono(y, I.snare(v, r, dur=0.2, buzz=True) * 0.7, max(tm, 0.0))
        G._place_mono(y, I.snare(0.95, r), d)
        G._place_mono(y, I.cymbal(0.6, r, dur=1.1), d)
        return lp(y, 9500, 2), 0.0
    return [K.E(ev, gen, _lv(o, -8.0), f"drum roll swelling into a crash on f{ev.f + d * K.F:g}: " + ev.note)]


# ================================================================ rhythmic bodies
def _times(K, ev, o, step, d, edge=6.0):
    """times (s, from the event's frame) of a repeated sound: option "at" (frames) or one every `step` s"""
    at = o.get("at")
    if at is None:
        return [i * step for i in range(int(max(d - 0.25, 0) / step) + 1)]
    end = ev.to if ev.to is not None else K.P.total
    if not (isinstance(at, list) and at and all(isinstance(f, (int, float)) and not isinstance(f, bool) for f in at) and all(ev.f <= f < end for f in at)):
        raise ValueError(f"at must be a list of frames inside the event, {ev.f:g}..{end:g} (got {at!r})")
    return [(f - ev.f) / K.F for f in sorted(at) if f < end - edge] or [0.0]


@sound("swing_creak", span="opt", params={"at": "list of frames, one creak on each (default: one every 0.95 s)"},
       doc="Ropes or hinges creaking under a load, in rhythm ('to' sets the length, default 4 s). A swing, a hammock, a rope bridge, a rocking boat or chair. Level -9.")
def _swing(K, ev, o, r):
    d = ev.dur or 4.0
    times = _times(K, ev, o, 0.95, d)
    k = len(times)

    def gen():
        y = np.zeros(ns(d + 0.1))
        for i, tm in enumerate(times):
            soft = i == 0 or i == k - 1                 # taking the load / coming to rest
            G._place_mono(y, G.rope_creak(r, 0.5 if soft else 1.0, i % 2 == 1) * (0.7 if soft else 1.0), tm)
        return y, 0.0
    return [K.E(ev, gen, _lv(o, -9.0), f"ropes creak in rhythm: {k} creaks at f" + ", ".join(f"{ev.f + tm * K.F:.0f}" for tm in times), p=0.15)]


# ================================================================ checks before rendering
def problems(P, plan):
    """everything in shots.json events / score.json places that would not render, as sentences"""
    bad = []
    used = {}
    for s in P.shots.values():
        used.setdefault(s.place, []).append(s.id)
    for name, shots in used.items():
        v = P.rooms.get(name)
        room = v.get("room") if isinstance(v, dict) else v
        if v is None:
            bad.append(f'score.json: places has no acoustics for "{name}" (shots {", ".join(map(str, shots))}). Add "{name}": one of {", ".join(ROOMS)}.')
        elif not isinstance(room, str) or room not in ROOMS:
            bad.append(f'score.json: places "{name}": ' + pick(room, ROOMS, "acoustics"))
        elif isinstance(v, dict) and (set(v) - {"room", "send", "wet"} or not isinstance(v.get("send", 0.1), (int, float)) or not 0 <= v.get("send", 0.1) <= 0.5):
            bad.append(f'score.json: places "{name}": the long form is {{"room": ..., "send": 0..0.5, "wet": true/false}} (got {v!r})')
    for name in P.rooms:
        if name not in used and not name.startswith("_"):
            bad.append(f'score.json: places names "{name}", which no shot uses. Places in shots.json: {", ".join(sorted(used))}.')
    if bad:
        return bad
    K = Kit(P, plan)
    seen = {}
    for ev in P.ev:
        where = f'shots.json: event #{ev.i + 1} ("{ev.type}" at f{ev.f:g})'
        if ev.type.startswith("music_"):
            continue
        if ev.type not in SOUND:
            bad.append(f"{where}: " + pick(ev.type, SOUND, "event type") + " Use the nearest existing type; new sounds are not written per video.")
            continue
        if ev.key in seen:
            bad.append(f"{where}: a second {ev.type} on the same frame (event #{seen[ev.key] + 1}); remove one")
        seen[ev.key] = ev.i
        spec = SOUND[ev.type]
        if spec.span == "need" and not ev.span:
            bad.append(f'{where} is an ambience: it needs "to", the frame where it ends (usually the end of the shots in that place)')
            continue
        valid = {**COMMON, **spec.params}
        unknown = [k for k in ev.opts if k not in valid]
        if unknown:
            bad.append(f"{where}: " + pick(unknown[0], valid, f"option for {ev.type}"))
            continue
        try:
            spec.fn(K, ev, ev.opts, _rng(ev))
            if "pan" in ev.opts:
                _numo(ev.opts, "pan", 0.0, -1, 1)
        except ValueError as e:
            bad.append(f"{where}: {e}")
    return bad


def rise10(x, win=0.25):
    """time (s) at which the envelope of an isolated cue first reaches 10 % of its maximum over the first `win` s"""
    e = np.abs(x).max(0) if x.ndim == 2 else np.abs(x)
    k = max(1, ns(0.001))
    e = np.convolve(e[: ns(win) + k], np.ones(k) / k, mode="same")
    return float(np.argmax(e >= 0.1 * e.max())) / SR


# ================================================================ render
def render(P, plan, v_ref, keep=False):
    """v_ref = integrated loudness of the voice stem (stereo). Returns (stereo stem, cue list with measured levels,
    and with keep=True one dict per cue for the checks: its mono signal, where it starts, its rise time and how much
    of its energy survives the next dead cut and the end of the film)."""
    K = Kit(P, plan)
    C = K.cues()
    N, dead = P.n, K.dead
    nseg = len(dead) + 1
    dry, send, iso = {}, {}, []
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
        seg = sum(1 for d in dead if d <= c.t + 1e-9)
        if seg not in dry:
            dry[seg] = np.zeros((2, N))
        place(dry[seg], x, t0)
        if keep:
            stop = min([d for d in dead if d > c.t + 1e-9] + [P.dur])
            e = (x ** 2).sum(0)
            iso.append(dict(xm=x.mean(0).astype(np.float32), t0=t0, r10=rise10(x),
                            alive=float(e[: max(0, ns(stop - t0))].sum() / (e.sum() + 1e-30)), stop_f=stop * P.fps))
        if c.send > 0:
            if (c.ir, seg) not in send:
                send[(c.ir, seg)] = np.zeros(N)
            G._place_mono(send[(c.ir, seg)], c.send * x.mean(0), t0)
    irs = {k: IRS[k]() for k in IRS if any(key[0] == k for key in send)}
    out = np.zeros((2, N))
    for seg in range(nseg):
        if seg not in dry:
            continue
        bus = dry[seg]
        for k, ir in irs.items():
            if (k, seg) in send and np.any(send[(k, seg)]):
                bus = bus + 0.6 * convolve_st(send[(k, seg)], ir)
        if seg < len(dead):                              # everything that started before the cut is gone at the cut
            z = ns(dead[seg])
            a = max(0, z - ns(0.008))
            bus[:, a:z] *= np.linspace(1, 0, z - a)[None, :]
            bus[:, z:] = 0.0
        out += bus
    out = lp(hp(out, 25, 2), 11000, 4)
    end = ns(P.dur - 0.12)
    out[:, end:] *= np.linspace(1, 0, N - end)[None, :] ** 2
    return out, C, iso
