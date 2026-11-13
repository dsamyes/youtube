# Picture timeline read from ../shots.json, the picture/sound contract of the short (shots with frame ranges, the
# crossfades, the white flash and the event table). Nothing here is specific to one story: a new short only needs
# a new shots.json (and ../voice/words.json). sfx.py turns every event into a sound, music.py reads its landmarks
# (shot starts and a few event frames) from here, mix.py reads the shots for its report.
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SHOTS_JSON = os.path.join(ROOT, "shots.json")
WORDS_JSON = os.path.join(ROOT, "voice", "words.json")
VOICE_WAV = os.path.join(ROOT, "voice", "voice.wav")

_S = json.load(open(SHOTS_JSON, encoding="utf-8"))

FPS = int(_S["fps"])
TOTAL = int(_S["total_frames"])
DUR = TOTAL / FPS
FLASH_F = int(_S.get("flash_at", 0))


def fr(f):
    """frame -> seconds"""
    return f / FPS


FLASH = fr(FLASH_F)

# id: (first frame, end frame, light, place)
SHOTS = {int(s["id"]): (int(s["a"]), int(s["b"]), s.get("light", ""), s.get("place", "")) for s in _S["shots"]}
SHOT_DOC = {int(s["id"]): s for s in _S["shots"]}
XFADE = {int(k): int(v) for k, v in _S.get("xfade", {}).items()}     # frames of crossfade INTO that shot
PLACES = dict(_S.get("places", {}))


def shot_t(i):
    a, b = SHOTS[i][:2]
    return fr(a), fr(b)


def shot_of(f):
    """shot id that owns frame f"""
    for i, (a, b, *_r) in SHOTS.items():
        if a <= f < b:
            return i
    return max(SHOTS)


def shot_at(t):
    return shot_of(t * FPS)


def place_of(f):
    return SHOTS[shot_of(f)][3]


def cut_in(f):
    """frames of picture crossfade if frame f is the first frame of a crossfaded shot, else 0 (hard cut)"""
    for i, (a, *_r) in SHOTS.items():
        if a == f:
            return XFADE.get(i, 0)
    return 0


class Event:
    """one row of the event table: f (frame), to (end frame of a span, or None), type, note"""

    def __init__(self, i, d):
        self.i = i
        self.f = float(d["f"])
        self.to = float(d["to"]) if d.get("to") is not None else None
        self.type = d["type"]
        self.note = d.get("note", "")
        self.t = fr(self.f)
        self.t_end = fr(self.to) if self.to is not None else None
        self.dur = (self.t_end - self.t) if self.to is not None else None
        self.shot = shot_of(self.f)
        self.place = SHOTS[self.shot][3]
        self.span = self.to is not None

    def __repr__(self):
        return f"<{self.type} f{self.f:g}{'-%g' % self.to if self.span else ''}>"


EVENTS = [Event(i, d) for i, d in enumerate(_S.get("events", []))]


def events(type=None, prefix=None):
    return [e for e in EVENTS if (type is None or e.type == type) and (prefix is None or e.type.startswith(prefix))]


def event_f(type, k=0, default=None, shot=None):
    """frame of the k-th event of a type (optionally inside one shot); default if it does not exist"""
    ev = [e for e in events(type) if shot is None or e.shot == shot]
    if len(ev) > k:
        return ev[k].f
    if default is None:
        raise KeyError(f"shots.json has no event {type!r} #{k}" + (f" in shot {shot}" if shot else ""))
    return default


# ---------------------------------------------------------------- mirrored from the picture (not in shots.json)
# The few picture constants the sound needs beyond the event table. Change them here if the picture changes.
PICTURE = {
    # story.ts swingTheta(): the swing does 1.25 cycles between the push (push_whoosh, back end of the arc) and
    # "fastest at the bottom" (whoosh), so it passes the bottom at 0.25, 0.75 and 1.25 cycles
    "swing_cycles_push_to_bottom": 1.25,
}


def swing_bottoms(push_f, bottom_f):
    """frames at which the swing passes the bottom of its arc, from the push up to and including bottom_f"""
    c = PICTURE["swing_cycles_push_to_bottom"]
    out, k = [], 0
    while 0.25 + 0.5 * k <= c + 1e-9:
        out.append(push_f + (0.25 + 0.5 * k) / c * (bottom_f - push_f))
        k += 1
    return out or [bottom_f]


def words(path=WORDS_JSON):
    return json.load(open(path, encoding="utf-8"))


if __name__ == "__main__":
    print(f"{TOTAL} frames @ {FPS} fps = {DUR:.3f} s, flash at f{FLASH_F}, {len(SHOTS)} shots, {len(EVENTS)} events")
    kinds = {}
    for e in EVENTS:
        kinds.setdefault(e.type, []).append(int(e.f))
    for k, v in sorted(kinds.items()):
        print(f"  {k:<26} {v}")
