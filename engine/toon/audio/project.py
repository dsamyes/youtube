# One video's inputs, loaded and checked: videos/<id>/shots.json (the picture/sound contract: shots with frame
# ranges, places, crossfades, white flashes and the event table), videos/<id>/audio/score.json (the sound plan: key,
# tempo, music sections, acoustics of each place, per-event options) and videos/<id>/voice/ (voice.wav, words.json,
# lines.json). Nothing here knows a story. Everything wrong with the files is collected and reported at once, in
# plain words, with the valid choices: a headless build must fail before it renders, not after.
import difflib
import json
import os
import re
import wave

ENGINE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VIDEOS = os.path.join(ENGINE, "videos")
SR = 48000

EVENT_KEYS = ("f", "to", "type", "note")                  # everything else on an event is a sound option
SCORE_KEYS = ("key", "tempo", "seed", "theme", "sections", "places", "dips", "sfx")
KEYS = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9,
        "A#": 10, "Bb": 10, "B": 11}


class Problems(Exception):
    """the inputs cannot be built; .items = one plain sentence per problem"""

    def __init__(self, items):
        self.items = list(items)
        super().__init__("; ".join(self.items))


def pick(word, valid, what):
    """'unknown <what> "x". Valid: a, b, c. Nearest: b.' for error messages"""
    valid = sorted(valid)
    close = difflib.get_close_matches(str(word), valid, n=3, cutoff=0.45)
    return f'unknown {what} "{word}". Valid: {", ".join(valid)}.' + (f' Nearest: {", ".join(close)}.' if close else "")


def midi(v):
    """note name ("Eb6", "F#4"; C4 = 60) or MIDI number -> MIDI number"""
    if isinstance(v, bool):
        raise ValueError(f"bad pitch {v!r}")
    if isinstance(v, (int, float)):
        return float(v)
    m = re.fullmatch(r"\s*([A-Ga-g])([#b]?)(-?\d)\s*", str(v))
    if not m:
        raise ValueError(f'bad pitch "{v}": write a note name like "Eb6" or "F#4" (C4 = middle C), a MIDI number, or Hz above 127')
    return 12.0 * (int(m.group(3)) + 1) + KEYS[m.group(1).upper() + m.group(2)]


def hz(v):
    """pitch option -> Hz: a note name, a MIDI number (<= 127) or a frequency in Hz (> 127)"""
    if isinstance(v, (int, float)) and not isinstance(v, bool) and v > 127:
        return float(v)
    return 440.0 * 2 ** ((midi(v) - 69) / 12.0)


class Shot:
    def __init__(self, d):
        self.id, self.a, self.b = int(d["id"]), int(d["a"]), int(d["b"])
        self.place, self.light = str(d.get("place", "")), str(d.get("light", ""))


class Event:
    """one row of the event table: f (frame), to (end frame of a span, or None), type, note, opts (sound options)"""

    def __init__(self, i, d, P):
        self.i = i
        self.f = float(d["f"])
        self.to = float(d["to"]) if d.get("to") is not None else None
        self.type = d["type"]
        self.note = str(d.get("note", ""))
        self.opts = {k: v for k, v in d.items() if k not in EVENT_KEYS and not k.startswith("_")}
        self.t = P.fr(self.f)
        self.t_end = P.fr(self.to) if self.to is not None else None
        self.dur = (self.t_end - self.t) if self.to is not None else None
        self.shot = P.shot_of(self.f)
        self.place = P.shots[self.shot].place
        self.span = self.to is not None

    @property
    def key(self):
        return f"{self.type}@{self.f:g}"

    def __repr__(self):
        return f"<{self.type} f{self.f:g}{'-%g' % self.to if self.span else ''}>"


def _json(path, what, bad):
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except json.JSONDecodeError as e:
        bad.append(f"{what} is not valid JSON: {e.msg} at line {e.lineno}, column {e.colno}")
    return None


def _num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


class Project:
    def __init__(self, video):
        """video = an id under engine/videos/, or a path to a video folder. Raises Problems when files are missing
        or the timeline is broken; everything else that is wrong is collected in .problems."""
        self.dir = os.path.abspath(video) if os.path.isdir(video) else os.path.join(VIDEOS, video)
        self.id = os.path.basename(self.dir.rstrip(os.sep))
        self.out = os.path.join(self.dir, "audio")
        self.shots_json = os.path.join(self.dir, "shots.json")
        self.score_json = os.path.join(self.out, "score.json")
        self.voice_wav = os.path.join(self.dir, "voice", "voice.wav")
        self.words_json = os.path.join(self.dir, "voice", "words.json")
        self.lines_json = os.path.join(self.dir, "voice", "lines.json")
        rel = lambda p: os.path.relpath(p, os.path.dirname(ENGINE)) if p.startswith(ENGINE) else p
        bad = []
        if not os.path.isdir(self.dir):
            have = sorted(d for d in os.listdir(VIDEOS) if os.path.isfile(os.path.join(VIDEOS, d, "shots.json"))) if os.path.isdir(VIDEOS) else []
            raise Problems([f'no video folder {rel(self.dir)}. Folders with a shots.json: {", ".join(have) or "none"}.'])
        need = [(self.shots_json, "the shot plan with the event table"), (self.score_json, "the sound plan; start from engine/videos/_audio_test/audio/score.json or the hole short's, see engine/toon/audio/README.md"),
                (self.voice_wav, "the narration, written by toon/voice.py"), (self.words_json, "word timings, written by toon/voice.py"),
                (self.lines_json, "line timings, written by toon/voice.py")]
        missing = [f"missing file {rel(p)} ({why})" for p, why in need if not os.path.isfile(p)]
        if missing:
            raise Problems(missing)
        S = _json(self.shots_json, "shots.json", bad)
        C = _json(self.score_json, "audio/score.json", bad)
        W = _json(self.words_json, "voice/words.json", bad)
        Lj = _json(self.lines_json, "voice/lines.json", bad)
        if bad:
            raise Problems(bad)
        for name, v, kind in (("shots.json", S, dict), ("audio/score.json", C, dict), ("voice/words.json", W, list)):
            if not isinstance(v, kind):
                bad.append(f"{name} must be a JSON {'object' if kind is dict else 'list'}")
        if bad:
            raise Problems(bad)
        self._shots(S, bad)
        if bad:                                           # nothing below makes sense without a valid timeline
            raise Problems(bad)
        self._score(C, bad)
        self._events(S, bad)
        self._voice(W, Lj, bad)
        self.problems = bad                               # not fatal for the other checks: build.py reports them all together

    # ------------------------------------------------------------ shots.json
    def _shots(self, S, bad):
        fps, total = S.get("fps"), S.get("total_frames")
        if not (_num(fps) and fps > 0 and float(fps).is_integer()):
            bad.append(f"shots.json: fps must be a whole number of frames per second (got {fps!r})")
        if not (isinstance(total, int) and not isinstance(total, bool) and total > 0):
            bad.append(f"shots.json: total_frames must be a whole number > 0 (got {total!r})")
        shots = S.get("shots")
        if not (isinstance(shots, list) and shots):
            bad.append("shots.json: 'shots' must be a non-empty list of {id, a, b, place}")
        if bad:
            return
        self.fps, self.total = int(fps), int(total)
        self.dur = self.total / self.fps
        self.n = int(round(self.dur * SR))
        self.shots, at = {}, 0
        for k, s in enumerate(shots):
            if not isinstance(s, dict) or not all(isinstance(s.get(x), int) and not isinstance(s.get(x), bool) for x in ("id", "a", "b")):
                bad.append(f"shots.json: shot #{k + 1} needs whole-number id, a (first frame) and b (end frame)")
                continue
            if s["id"] in self.shots:
                bad.append(f"shots.json: shot id {s['id']} is used twice")
            if s["a"] != at:
                bad.append(f"shots.json: shot {s['id']} starts at frame {s['a']} but the shot before it ends at {at} (shots must touch, the first starts at 0)")
            if s["b"] <= s["a"]:
                bad.append(f"shots.json: shot {s['id']} has b {s['b']} <= a {s['a']}")
            if not (isinstance(s.get("place"), str) and s["place"]):
                bad.append(f"shots.json: shot {s['id']} needs a 'place' (the sound picks its ambience and reverb from it)")
            at = s["b"]
            self.shots[s["id"]] = Shot(s)
        if not bad and at != self.total:
            bad.append(f"shots.json: the last shot ends at frame {at} but total_frames is {self.total}")
        fl = S.get("flash_at", [])
        fl = [fl] if _num(fl) else fl
        if not isinstance(fl, list) or not all(_num(f) and 0 <= f < self.total for f in fl):
            bad.append(f"shots.json: flash_at must be a frame, or a list of frames, inside 0..{self.total - 1} (got {S.get('flash_at')!r})")
            fl = []
        self.flashes = sorted({float(f) for f in fl if f > 0})
        self.xfade = {}
        for k, v in (S.get("xfade") or {}).items():
            if not (str(k).lstrip("-").isdigit() and int(k) in self.shots and isinstance(v, int) and 0 <= v <= 30):
                bad.append(f"shots.json: xfade {k!r}: {v!r} must map a shot id ({', '.join(str(i) for i in self.shots)}) to 0..30 frames of crossfade into that shot")
            else:
                self.xfade[int(k)] = v
        self.place_doc = dict(S.get("places") or {})
        self._raw_events = S.get("events", [])
        if not isinstance(self._raw_events, list):
            bad.append("shots.json: 'events' must be a list of {f, to?, type, note}")
            self._raw_events = []

    # ------------------------------------------------------------ score.json
    def _score(self, C, bad):
        for k in C:
            if not k.startswith("_") and k not in SCORE_KEYS:
                bad.append("score.json: " + pick(k, SCORE_KEYS, "key"))
        self.score = C
        key = C.get("key", "F")
        if key not in KEYS:
            bad.append("score.json: " + pick(key, [k for k in KEYS if "#" not in k] + ["F#"], "key (the home key, always major)"))
            key = "F"
        self.key = key
        self.key_pc = KEYS[key]
        self.tempo = C.get("tempo", 131)
        if not (_num(self.tempo) and 90 <= self.tempo <= 180):
            bad.append(f"score.json: tempo must be 90..180 beats per minute (got {self.tempo!r}; the hole short is 131)")
            self.tempo = 131
        self.seed = C.get("seed", 3811)
        if not (isinstance(self.seed, int) and not isinstance(self.seed, bool) and 0 <= self.seed < 2 ** 31):
            bad.append(f"score.json: seed must be a whole number 0..2147483647 (got {self.seed!r})")
            self.seed = 3811
        self.theme = C.get("theme", "stroll")
        self.sections = C.get("sections")
        if not (isinstance(self.sections, list) and self.sections and all(isinstance(s, dict) for s in self.sections)):
            bad.append('score.json: \'sections\' must be a non-empty list like [{"from": 0, "mood": "silence"}, {"from": 118, "mood": "theme"}]')
            self.sections = [{"from": 0, "mood": "silence"}]
        self.rooms = C.get("places", {})
        if not isinstance(self.rooms, dict):
            bad.append('score.json: \'places\' must map every place of shots.json to its acoustics, e.g. {"garden": "outdoor"}')
            self.rooms = {}
        self.dips = []
        for d in C.get("dips", []) or []:
            if not (isinstance(d, list) and len(d) == 3 and all(_num(x) for x in d) and 0 <= d[0] < d[1] <= self.total and -12 <= d[2] <= 0):
                bad.append(f"score.json: dip {d!r} must be [first frame, last frame, dB] with frames inside 0..{self.total} and dB between -12 and 0")
            else:
                self.dips.append(tuple(d))
        self.sfx_opts = C.get("sfx", {}) or {}
        if not (isinstance(self.sfx_opts, dict) and all(isinstance(v, dict) for v in self.sfx_opts.values())):
            bad.append('score.json: \'sfx\' must map "type@frame" to options, e.g. {"ting@1442": {"pitch": "Eb6"}}')
            self.sfx_opts = {}

    # ------------------------------------------------------------ events
    def _events(self, S, bad):
        self.ev = []
        for i, d in enumerate(self._raw_events):
            where = f"shots.json: event #{i + 1}"
            if not isinstance(d, dict) or not isinstance(d.get("type"), str) or not d.get("type"):
                bad.append(f"{where} needs a 'type' (a string) and a frame 'f': {json.dumps(d)[:120]}")
                continue
            where += f' ("{d["type"]}")'
            f, to = d.get("f"), d.get("to")
            if not (_num(f) and 0 <= f < self.total):
                bad.append(f"{where}: bad frame f = {f!r}; it must be a number inside 0..{self.total - 1} (the film has {self.total} frames)")
                continue
            if to is not None and not (_num(to) and f < to <= self.total):
                bad.append(f"{where} at f{f:g}: bad end frame to = {to!r}; it must be after f and at most {self.total}")
                continue
            self.ev.append(Event(i, d, self))
        keys = {}
        for e in self.ev:
            keys.setdefault(e.key, e)
        for k, o in self.sfx_opts.items():
            if k not in keys:
                typ = k.split("@")[0]
                same = [f"{e.f:g}" for e in self.ev if e.type == typ]
                bad.append(f'score.json: sfx "{k}" matches no event of shots.json. ' + (f'Events of type {typ} are at frames {", ".join(same)}.' if same
                           else pick(typ, {e.type for e in self.ev}, "event type in this shots.json")))
        for e in self.ev:
            e.opts = {**e.opts, **{k: v for k, v in self.sfx_opts.get(e.key, {}).items() if not k.startswith("_")}}

    # ------------------------------------------------------------ voice
    def _voice(self, W, Lj, bad):
        ok = all(isinstance(w, dict) and _num(w.get("s")) and _num(w.get("e")) and w["e"] >= w["s"] >= 0 for w in W)
        if not ok or not W:
            bad.append('voice/words.json must be a non-empty list of {"w": word, "s": start seconds, "e": end seconds} (run toon/voice.py)')
            W = []
        self.words = W
        self.lines = Lj.get("lines", []) if isinstance(Lj, dict) else []
        if not (isinstance(self.lines, list) and all(isinstance(l, dict) and _num(l.get("s")) and _num(l.get("e")) for l in self.lines)):
            bad.append('voice/lines.json must be {"lines": [{"line", "text", "s", "e"}, ...]} (run toon/voice.py)')
            self.lines = []
        try:
            with wave.open(self.voice_wav, "rb") as w:
                sr, ch, sw, n = w.getframerate(), w.getnchannels(), w.getsampwidth(), w.getnframes()
        except (wave.Error, EOFError) as e:
            bad.append(f"voice/voice.wav is not a PCM WAV file ({e}); toon/voice.py writes 48 kHz mono 16-bit")
            return
        if sr != SR or sw not in (2, 3, 4):
            bad.append(f"voice/voice.wav is {sr} Hz, {8 * sw}-bit; it must be 48000 Hz PCM, 16/24/32-bit (toon/voice.py writes that)")
        self.voice_s = n / sr
        if self.voice_s > self.dur + 1.0 / self.fps:
            bad.append(f"voice/voice.wav is {self.voice_s:.2f} s but shots.json total_frames {self.total} is only {self.dur:.2f} s: the narration would be cut")
        if W and W[-1]["e"] > self.dur + 1.0 / self.fps:
            bad.append(f"voice/words.json ends at {W[-1]['e']:.2f} s, after the last frame ({self.dur:.2f} s)")

    # ------------------------------------------------------------ timeline helpers
    def fr(self, f):
        """frame -> seconds"""
        return f / self.fps

    def shot_of(self, f):
        """shot id that owns frame f"""
        for i, s in self.shots.items():
            if s.a <= f < s.b:
                return i
        return max(self.shots)

    def cut_in(self, f):
        """frames of picture crossfade if frame f is the first frame of a crossfaded shot, else 0 (hard cut)"""
        for i, s in self.shots.items():
            if s.a == f:
                return self.xfade.get(i, 0)
        return 0

    def events(self, type=None):
        return [e for e in self.ev if type is None or e.type == type]

    def landmarks(self):
        """frames where something happens in the picture or the voice: shot starts, event frames, word starts"""
        out = {s.a for s in self.shots.values()} | {self.total} | {e.f for e in self.ev} | {e.to for e in self.ev if e.span}
        return out | {round(w["s"] * self.fps) for w in self.words}
