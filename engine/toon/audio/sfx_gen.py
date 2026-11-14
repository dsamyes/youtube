# Procedural sound-effect generators (own numpy synthesis, seeded, no samples). Three layers, all in one style:
#   - the bridge kit: boots on planks, creaks, chains, metal, timber, splashes, river water, formant-synthesized
#     crowd voices (oofs, whoa, murmur, hurrah), applause, birds, crickets, breeze, hammer, footsteps, whooshes
#   - the cartoon kit: slide whistles, pops, boing, splat, sizzle, poof, timer, chomp, record stop, the stylised
#     speed rush, garden / night-ocean ambiences
#   - the generic kit (end of the file): thunder, explosion, rocket roar, crowd gasp, car horn, laser, heartbeat,
#     clock, wind, rain, fire, drone, doors, alarms, bells, buzzers, clicks and other everyday sounds
# sfx.py maps event types of shots.json to these functions. Rule for every generator: the sound STARTS at sample 0
# (so the cue lands on its frame), it is soft enough to sit under a voice, nothing important above ~10 kHz.
import numpy as np
from scipy import signal
from dsp import (SR, TAU, ns, tt, rng, lp, hp, bp, reson, resbank, peq, colored, smooth_noise, ramp, fades, shape,
                 phase, modal, impulse_train, pan, st, widen)


def _place_mono(buf, x, t):
    i = ns(t)
    a, b = max(0, i), min(len(buf), i + len(x))
    if b > a:
        buf[a:b] += x[a - i: b - i]


# ================================================================ creak engine (stick-slip friction)
def stick_slip(dur, rate, r, jitter=0.12, amp=None, accel_noise=0.0):
    """impulse train whose instantaneous rate follows `rate` (array or float, Hz); returns (impulses, times)"""
    n = ns(dur)
    rt = np.full(n, rate, float) if np.isscalar(rate) else np.interp(np.arange(n), np.linspace(0, n - 1, len(rate)), rate)
    x = np.zeros(n)
    t = r.uniform(0, 1.0 / max(rt[0], 1))
    while t < dur:
        k = ns(t)
        if k >= n:
            break
        a = 1.0 if amp is None else amp[min(k, len(amp) - 1)]
        x[k] += a * r.uniform(0.55, 1.0)
        t += (1.0 / max(rt[k], 1.0)) * (1 + r.normal(0, jitter))
    return x


WOOD = [(230, 9, 1.0), (520, 12, 0.8), (940, 14, 0.55), (1650, 16, 0.35), (2800, 18, 0.18)]
TIMBER = [(95, 7, 1.0), (180, 9, 0.9), (330, 11, 0.7), (560, 12, 0.5), (930, 14, 0.3), (1500, 15, 0.15)]
CHAIN = [(190, 28, 0.9), (430, 34, 1.0), (760, 38, 0.8), (1180, 42, 0.6), (1720, 45, 0.45), (2500, 50, 0.3), (3400, 55, 0.18)]
SMALLMETAL = [(1850, 40, 1.0), (3100, 45, 0.8), (4600, 50, 0.6), (6900, 55, 0.35)]


def creak(dur, r, rate0=110, rate1=180, modes=WOOD, shape_pts=None, rough=0.12, noise=0.05, scale=1.0):
    """wooden/metal creak: friction impulses exciting a resonator bank; rate glides rate0 -> rate1 (with a bend)"""
    n = ns(dur)
    u = np.linspace(0, 1, 64)
    rate = rate0 + (rate1 - rate0) * u + 0.15 * (rate0 + rate1) / 2 * np.sin(np.pi * u) * r.uniform(-1, 1)
    env_pts = shape_pts or [(0, 0), (0.15, 1), (0.7, 0.85), (1.0, 0)]
    env = np.interp(np.linspace(0, 1, n), [p[0] for p in env_pts], [p[1] for p in env_pts])
    x = stick_slip(dur, rate, r, rough, env)
    md = [(f * scale * r.uniform(0.94, 1.06), q, g) for f, q, g in modes]
    y = resbank(x, md)
    y += noise * bp(r.standard_normal(n), 400, 4000, 1) * env
    return fades(y, 0.004, 0.03)


def clink(r, f0=None, dur=0.12, bright=1.0):
    """one small metal-on-metal clink (chain link, buckle, canteen)"""
    f0 = f0 or np.exp(r.uniform(np.log(1800), np.log(5200)))
    modes = [(f0, 1.0, r.uniform(0.012, 0.03)), (f0 * r.uniform(2.3, 2.9), 0.5 * bright, 0.01), (f0 * r.uniform(3.9, 5.1), 0.25 * bright, 0.006)]
    y = modal(dur, modes, r)
    t = tt(dur)
    y += hp(r.standard_normal(len(t)), 3000) * np.exp(-t / 0.0008) * 0.4
    return y


def rattle(dur, r, density=30.0, env=None, heavy=False):
    """chain / kit rattle: a cloud of clinks"""
    n = ns(dur)
    y = np.zeros(n)
    cnt = int(density * dur) + 1
    times = np.sort(r.uniform(0, dur, cnt))
    for tm in times:
        k = ns(tm)
        a = 1.0 if env is None else env[min(k, n - 1)]
        if a < 0.02:
            continue
        c = clink(r, np.exp(r.uniform(np.log(700 if heavy else 1600), np.log(2600 if heavy else 5500))), 0.1)
        _place_mono(y, c * a * r.uniform(0.4, 1.0), tm)
    return y


# ================================================================ marching boots
def boot(r, hard=1.0):
    """one hobnailed boot heel on a wooden plank"""
    dur = 0.22
    t = tt(dur)
    f = r.uniform(78, 118)
    thump = np.exp(-t / r.uniform(0.028, 0.045)) * np.sin(phase(f * (1 + 0.18 * np.exp(-t / 0.012))))
    plank = modal(dur, [(r.uniform(170, 260), 0.6, r.uniform(0.018, 0.035)), (r.uniform(380, 620), 0.45, r.uniform(0.012, 0.025)),
                        (r.uniform(800, 1300), 0.25, 0.01)], r)
    nz = r.standard_normal(len(t))
    slap = bp(nz, 500, 3500, 1) * np.exp(-t / 0.006) * 0.5
    click = hp(nz, 3500) * np.exp(-t / 0.0012) * 0.22 * hard
    return thump + plank + slap + click


def column_stomp(r, intensity=1.0, foot=0, boots=30, spread=0.007, width=0.6, boom_gain=1.0):
    """74 men landing the same foot together: ~30 audible boots with tiny timing spread + deck boom + kit jingle"""
    dur = 0.6
    out = np.zeros((2, ns(dur)))
    pre = 0.03
    for i in range(boots):
        row = i // 4
        g = r.uniform(0.6, 1.0) * 10 ** (-0.35 * row / 20)
        dt = pre + abs(r.normal(0, spread)) * (1 if r.uniform() < 0.7 else -0.6)
        x = boot(r, intensity) * g
        p = np.clip((i % 4 - 1.5) / 1.5 * width * 0.6 + r.normal(0, 0.1) + (0.05 if foot else -0.05), -1, 1)
        k = ns(max(0, dt))
        seg = pan(x, p)
        m = min(seg.shape[1], out.shape[1] - k)
        out[:, k:k + m] += seg[:, :m]
    t = tt(dur)
    boom = np.exp(-t / 0.13) * np.sin(phase(r.uniform(47, 56) * (1 + 0.25 * np.exp(-t / 0.02)))) * 2.2 * intensity * boom_gain
    out += np.roll(st(boom), ns(pre), axis=1)
    kit = rattle(0.25, r, 50, np.exp(-np.linspace(0, 1, ns(0.25)) * 3)) * 0.35
    out[:, ns(pre + 0.02): ns(pre + 0.02) + len(kit)] += widen(kit, r, 9, 0.8)
    return out, pre


def deck_flex(r, a):
    """the deck answers a footfall once it is bouncing: low flex 'whump', plank creak on the rebound, hangers rattle"""
    dur = 0.75
    n = ns(dur)
    t = np.arange(n) / SR
    whump = np.exp(-t / 0.2) * np.sin(phase(r.uniform(38, 48) * (1 - 0.12 * t))) * (1 - np.exp(-t / 0.015))
    c = creak(r.uniform(0.2, 0.32) + 0.2 * a, r, r.uniform(70, 110), r.uniform(150, 260), WOOD, rough=0.15, scale=r.uniform(0.85, 1.2))
    y = whump * 1.6
    _place_mono(y, c * (0.35 + 0.65 * a), r.uniform(0.07, 0.13))
    ratt = rattle(0.35, r, 25 + 40 * a, np.exp(-np.linspace(0, 1, ns(0.35)) * 2.5), heavy=True) * 0.3 * a
    _place_mono(y, ratt, 0.04)
    return widen(y, r, 13, 0.6)


def chain_groan(dur, r, i0=0.2, i1=1.0, rate0=22, rate1=40, beats=None, t0=0.0):
    """iron chains under rising tension: slow stick-slip through metal modes + a low moan; swells on each footfall"""
    n = ns(dur)
    t = np.arange(n) / SR
    inten = i0 + (i1 - i0) * (t / dur) ** 1.4
    am = np.full(n, 0.35)
    if beats is not None:
        for b in beats:
            u = t + t0 - (b + 0.04)
            am += np.where(u > 0, np.exp(-u / 0.22) * (1 - np.exp(-u / 0.03)), 0)
    env = np.clip(am, 0, 1.2) * inten
    rate = np.linspace(rate0, rate1, 64) * (1 + 0.1 * np.sin(np.linspace(0, 9, 64)))
    x = stick_slip(dur, rate, r, 0.2, env)
    y = resbank(x, [(f * r.uniform(0.97, 1.03), q, g) for f, q, g in CHAIN])
    moan_f = np.linspace(48, 72, n) * (1 + 0.03 * smooth_noise(n, r, 1.5))
    ph = phase(moan_f)
    moan = sum(np.sin(k * ph) / k for k in range(1, 14))
    moan = bp(moan, 180, 900, 2) * env * 0.4
    return fades(y + moan, 0.2, 0.05)


# ================================================================ metal / bolt
def bolt_strain(r, a=1.0, dur=0.32):
    c = creak(dur, r, r.uniform(320, 420) * (0.9 + 0.3 * a), r.uniform(520, 760) * (0.9 + 0.3 * a), SMALLMETAL,
              [(0, 0), (0.2, 1), (0.75, 0.7), (1, 0)], rough=0.1, noise=0.02)
    tick = clink(r, r.uniform(2500, 3800), 0.08) * 0.6
    y = c
    _place_mono(y, tick, 0.0)
    return y


def bolt_snap(r):
    """bolt shears: crack + two bolt halves ringing as they fly (slight Doppler drop) + release thunk + chain jolt"""
    dur = 1.6
    n = ns(dur)
    t = np.arange(n) / SR
    nz = r.standard_normal(n)
    crack = bp(nz, 900, 14000, 2) * np.exp(-t / 0.0028) * 2.2
    crack[: ns(0.0004)] += 1.5
    y = crack
    for k, (f0, dl, gl) in enumerate([(1760, 0.0, -0.07), (2090, 0.009, -0.05)]):
        g = 1 + gl * (1 - np.exp(-t / 0.35))
        ph = phase(f0 * g)
        ring = (np.exp(-t / 0.55) * np.sin(ph) + 0.55 * np.exp(-t / 0.22) * np.sin(2.756 * ph + 1)
                + 0.3 * np.exp(-t / 0.08) * np.sin(5.404 * ph + 2) + 0.12 * np.exp(-t / 0.03) * np.sin(8.933 * ph))
        ring *= 1 - np.exp(-t / 0.0015)
        y = y + np.roll(ring, ns(dl)) * (0.8 if k else 1.0)
    thunk = np.exp(-t / 0.07) * np.sin(phase(105 * (1 - 0.3 * t))) * 1.2
    y += thunk
    jolt = rattle(0.35, r, 70, np.exp(-np.linspace(0, 1, ns(0.35)) * 3), heavy=True) * 0.6
    _place_mono(y, jolt, 0.01)
    return fades(y, 0.0, 0.1)


def whoosh(dur, r, peak=0.3, f_lo=350, f_hi=2200, width=0.8, tail=0.25, air=0.15):
    """noise whoosh: band centre and level rise to `peak` then fall (ease-out burst when peak is early)"""
    n = ns(dur)
    nz = colored(n, r, 0.6)
    t = np.arange(n) / SR
    env = np.where(t < peak, (t / peak) ** 2.2, np.exp(-(t - peak) / tail))
    fc = lambda T: f_lo + (f_hi - f_lo) * np.interp(T, t, np.where(t < peak, t / peak, np.exp(-(t - peak) / (tail * 1.3))))
    y = shape(nz, lambda T, F: np.exp(-0.5 * (np.log2(np.maximum(F[:, None], 20) / fc(T)[None, :]) / width) ** 2), 1024, 256)
    y = y * env + air * hp(nz, 4000) * env ** 2
    return fades(y, 0.005, 0.04)


def chain_whip(r):
    """the snapped backstay whipping up: fast swish + rattle along it + heavy clank as it flops"""
    y = whoosh(0.75, r, peak=0.07, f_lo=500, f_hi=2600, width=0.7, tail=0.18, air=0.3)
    ratt = rattle(0.6, r, 90, np.exp(-np.linspace(0, 1, ns(0.6)) * 2.2), heavy=True) * 0.5
    _place_mono(y, ratt, 0.02)
    clank = modal(0.5, [(310, 0.8, 0.09), (690, 0.6, 0.06), (1130, 0.4, 0.04), (1870, 0.25, 0.03)], r)
    clank += lp(r.standard_normal(ns(0.5)), 500) * np.exp(-tt(0.5) / 0.03) * 0.8
    _place_mono(y, np.concatenate([clank, np.zeros(ns(0.3))]) * 0.7, 0.6)
    return y


# ================================================================ timber + water
def timber_tear(r, dur=0.8):
    """the near half tearing loose: big low creak + splintering crackle that thickens"""
    n = ns(dur)
    t = np.arange(n) / SR
    c = creak(dur, r, 28, 75, TIMBER, [(0, 0), (0.3, 0.8), (0.85, 1), (1, 0.3)], rough=0.25, noise=0.08)
    dens = 10 + 120 * (t / dur) ** 2
    cr = np.zeros(n)
    tm = 0.05
    while tm < dur:
        k = ns(tm)
        crk = modal(0.06, [(r.uniform(600, 1800), 1, 0.006), (r.uniform(2000, 5000), 0.6, 0.003)], r)
        crk += hp(r.standard_normal(ns(0.06)), 1500) * np.exp(-tt(0.06) / 0.002)
        _place_mono(cr, crk * r.uniform(0.2, 1.0) * (t[min(k, n - 1)] / dur), tm)
        tm += r.exponential(1.0 / dens[min(k, n - 1)])
    return c + 0.5 * cr


def wood_crack(r):
    """deck slamming down: splintering crack burst + heavy timber boom"""
    dur = 1.2
    n = ns(dur)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for i in range(9):
        tm = (abs(r.normal(0, 0.03)) if i else 0.0) + i * 0.006     # first splinter exactly on the impact
        md = [(r.uniform(500, 1400), 1.0, 0.012), (r.uniform(1500, 3500), 0.7, 0.006), (r.uniform(3500, 7000), 0.4, 0.003)]
        k = modal(0.15, md, r) + hp(r.standard_normal(ns(0.15)), 1200) * np.exp(-tt(0.15) / 0.003)
        _place_mono(y, k * (1.0 if i == 0 else r.uniform(0.3, 0.8)), tm)
    boom = np.exp(-t / 0.32) * np.sin(phase(52 * (1 + 0.4 * np.exp(-t / 0.03)))) * 3.0
    boom += resbank(lp(r.standard_normal(n), 900) * np.exp(-t / 0.05), [(f, q, g) for f, q, g in TIMBER[:4]]) * 0.5
    return y + boom


def bubbles(dur, r, rate, f_lo=300, f_hi=2500, tau=(0.008, 0.035), env=None, rise=(4, 12)):
    """Minnaert-style bubble 'plinks': damped sines gliding up"""
    n = ns(dur)
    y = np.zeros(n)
    tm = 0.0
    while tm < dur:
        k = ns(tm)
        a = 1.0 if env is None else env[min(k, n - 1)]
        rr = rate if np.isscalar(rate) else rate[min(k, n - 1)]
        if a > 0.01:
            f0 = np.exp(r.uniform(np.log(f_lo), np.log(f_hi)))
            ta = r.uniform(*tau)
            L = min(int(ta * 6 * SR), n - k)
            if L > 8:
                tl = np.arange(L) / SR
                b = np.exp(-tl / ta) * np.sin(phase(f0 * (1 + r.uniform(*rise) * tl)))
                y[k:k + L] += b * a * r.uniform(0.2, 1.0) * (600 / f0) ** 0.3
        tm += r.exponential(1.0 / max(rr, 0.1))
    return y


def splash_big(r):
    """the near half of the deck + 70 soldiers hitting two feet of water: thump, slap, body, bubble cloud, spray"""
    dur = 2.6
    n = ns(dur)
    t = np.arange(n) / SR
    nz = r.standard_normal(n)
    thump = np.exp(-t / 0.2) * np.sin(phase(58 * (1 + 0.5 * np.exp(-t / 0.025)))) * 2.0
    slap = bp(nz, 250, 7000, 1) * np.exp(-t / 0.035) * 1.6
    body_env = (1 - np.exp(-t / 0.02)) * (0.6 * np.exp(-t / 0.18) + 0.4 * np.exp(-t / 0.7))
    body = shape(colored(n, r, 0.4), lambda T, F: (np.exp(-0.5 * (np.log2(np.maximum(F[:, None], 20) / (900 + 1800 * np.exp(-T[None, :] / 0.4))) / 1.4) ** 2)), 1024, 256)
    body *= body_env * 1.4
    bub = bubbles(dur, r, 900 * np.exp(-t / 0.5) + 20, 250, 2600, (0.006, 0.03), np.exp(-t / 0.8)) * 1.1
    spray_env = np.clip((t - 0.25) / 0.2, 0, 1) * np.exp(-np.maximum(t - 0.45, 0) / 0.55)
    spray = bubbles(dur, r, 500 * spray_env + 5, 1200, 5000, (0.003, 0.012), spray_env, rise=(8, 25)) * 0.6
    spray += hp(nz, 3000) * spray_env * 0.06
    return fades(thump + slap + body + bub + spray, 0.0, 0.3)


def water_bed(dur, r, close=1.0, slosh_rate=0.8):
    """river around the soldiers sitting in it: flow noise, babble, lapping, sloshes, drips"""
    n = ns(dur)
    t = np.arange(n) / SR
    out = np.zeros((2, n))
    for ch in range(2):
        lap = 0.65 + 0.35 * smooth_noise(n, r, 0.5)
        flow = bp(colored(n, r, 0.8), 180, 2600, 1) * lap * 0.5
        bab = bubbles(dur, r, 70 * close + 15, 350, 2400, (0.006, 0.025)) * 0.9 * close
        rum = lp(colored(n, r, 2.0), 160, 2) * 0.35
        out[ch] = flow + bab + rum
    tm = r.uniform(0.2, 0.8)
    while tm < dur - 0.5:
        sl = shape(r.standard_normal(ns(0.5)), lambda T, F: np.exp(-0.5 * (np.log2(np.maximum(F[:, None], 20) / 700) / 1.2) ** 2), 512, 128)
        sl *= np.exp(-tt(0.5) / 0.12) * (1 - np.exp(-tt(0.5) / 0.03)) * 0.9 * close
        sl += bubbles(0.5, r, 120, 300, 1500, (0.006, 0.02), np.exp(-tt(0.5) / 0.15)) * 0.7 * close
        p = r.uniform(-0.7, 0.7)
        seg = pan(sl, p)
        k = ns(tm)
        out[:, k:k + seg.shape[1]] += seg[:, : n - k]
        tm += r.exponential(1 / slosh_rate) + 0.3
    drips = bubbles(dur, r, 3.5 * close, 1500, 4200, (0.004, 0.012), rise=(10, 30)) * 0.9
    out += widen(drips, r, 7, 1.0)
    return out


# ================================================================ formant voices
VOW = {"a": (730, 1090, 2440, 3400), "o": (570, 840, 2410, 3400), "u": (300, 870, 2240, 3300), "U": (440, 1020, 2240, 3300),
       "A": (640, 1190, 2390, 3400), "e": (530, 1840, 2480, 3500), "i": (270, 2290, 3010, 3600), "ae": (660, 1720, 2410, 3400),
       "er": (490, 1350, 1690, 3300), "E": (580, 1700, 2500, 3500), "ei": (400, 2000, 2550, 3500)}
BWS = np.array([85.0, 110.0, 160.0, 220.0])


def vox(f0, forms, amp, r, scale=1.0, tilt=1.15, breath=0.12, fmax=5500.0, jitter=0.012):
    """additive source-filter voice: f0 (n,), forms (n, 4) formant tracks, amp (n,) -> mono"""
    n = len(f0)
    jit = 1 + jitter * smooth_noise(n, r, 18.0)
    ph = phase(f0 * jit)
    y = np.zeros(n)
    K = int(fmax / max(f0.min(), 60))
    Fm = forms * scale
    for k in range(1, K + 1):
        fk = k * f0
        H = np.ones(n)
        for i in range(4):
            Fi = Fm[:, i]
            H *= Fi ** 2 / np.sqrt((Fi ** 2 - fk ** 2) ** 2 + (fk * BWS[i] * (1 + 0.3 * (scale - 1))) ** 2)
        y += H * k ** (-tilt) * np.sin(k * ph + r.uniform(0, TAU)) * (fk < fmax)
    asp = peq(bp(r.standard_normal(n), 500, 5000, 1), float(np.mean(Fm[:, 1])), 8, 1.5)
    y = y / (np.std(y) + 1e-9) + breath * asp / (np.std(asp) + 1e-9)
    return y * amp


def _track(n, pts, t_rel):
    """pts = [(time_s, value)] -> per-sample curve"""
    return np.interp(t_rel, [p[0] for p in pts], [p[1] for p in pts])


def vowel_track(n, segs):
    """segs = [(time_s, vowel)] -> (n, 4) formant tracks with smooth transitions"""
    t = np.arange(n) / SR
    out = np.zeros((n, 4))
    for i in range(4):
        out[:, i] = np.interp(t, [s[0] for s in segs], [VOW[s[1]][i] for s in segs])
    return out


def oof(r, kind="oof", base=None, scale=None):
    """one man's impact grunt: 'oof', 'ugh', 'oh', 'ow' (falling pitch, pushed air, fricative / glottal end)"""
    base = base or r.uniform(95, 150)
    scale = scale or r.uniform(0.95, 1.1)
    if kind == "oof":
        d = r.uniform(0.2, 0.26)
        segs, fpts = [(0, "U"), (d, "u")], [(0, 1.3), (0.05, 1.2), (d, 0.82)]
    elif kind == "ugh":
        d = r.uniform(0.18, 0.24)
        segs, fpts = [(0, "A"), (d, "er")], [(0, 1.25), (d * 0.6, 1.05), (d, 0.7)]
    elif kind == "oh":
        d = r.uniform(0.22, 0.3)
        segs, fpts = [(0, "o"), (d, "U")], [(0, 1.4), (0.06, 1.45), (d, 0.9)]
    else:  # ow
        d = r.uniform(0.28, 0.36)
        segs, fpts = [(0, "a"), (d * 0.45, "a"), (d, "u")], [(0, 1.2), (d * 0.3, 1.5), (d, 0.85)]
    tail = 0.12 if kind == "oof" else 0.04
    n = ns(d + tail)
    t = np.arange(n) / SR
    f0 = base * _track(n, fpts, t)
    forms = vowel_track(n, segs)
    amp = np.clip(t / 0.012, 0, 1) * np.where(t < d, 1 - 0.35 * t / d, np.clip(1 - (t - d) / 0.025, 0, 1) * 0.65)
    y = vox(f0, forms, amp, r, scale, tilt=1.05, breath=0.35)
    push = bp(r.standard_normal(n), 300, 3000, 1) * np.exp(-t / 0.03) * 0.5
    y += push
    if kind == "oof":
        fr = hp(r.standard_normal(n), 1300) * np.clip((t - d + 0.03) / 0.03, 0, 1) * np.exp(-np.maximum(t - d, 0) / 0.05) * 0.35
        y += peq(fr, 4000, 6, 1.0)
    return fades(y, 0.002, 0.02)


def whoa(r, base=None, dur=None):
    base = base or r.uniform(105, 165)
    d = dur or r.uniform(0.38, 0.55)
    n = ns(d)
    t = np.arange(n) / SR
    f0 = base * _track(n, [(0, 1.0), (d * 0.4, 1.35), (d, 1.1)], t)
    forms = vowel_track(n, [(0, "u"), (0.07, "o"), (d * 0.6, "a"), (d, "A")])
    amp = np.clip(t / 0.05, 0, 1) * np.clip((d - t) / 0.08, 0, 1)
    return vox(f0, forms, amp, r, r.uniform(0.95, 1.1), tilt=1.0, breath=0.25)


def babble(dur, r, base, scale, rate=4.2, active=0.75, fmax=3600):
    """one person talking far away: random syllables, consonant puffs, pauses"""
    n = ns(dur)
    t = np.arange(n) / SR
    segs, fp, ap = [], [], []
    tm = r.uniform(0, 0.4)
    vs = list(VOW)
    while tm < dur:
        if r.uniform() > active:
            tm += r.uniform(0.25, 0.8)
            ap += [(tm - 0.01, 0.0)]
            continue
        L = r.uniform(0.6, 1.4) / rate
        v = vs[r.integers(len(vs))]
        segs.append((tm + L * 0.5, v))
        fp += [(tm, r.uniform(0.9, 1.2)), (tm + L, r.uniform(0.8, 1.1))]
        ap += [(tm, 0.05), (tm + L * 0.25, r.uniform(0.6, 1.0)), (tm + L * 0.8, r.uniform(0.4, 0.8)), (tm + L, 0.05)]
        tm += L
    if len(segs) < 2:
        return np.zeros(n)
    forms = vowel_track(n, [(0, segs[0][1])] + segs)
    f0 = base * _track(n, [(0, 1.0)] + sorted(fp), t) * (1 - 0.08 * t / dur)
    amp = _track(n, [(0, 0.0)] + sorted(ap) + [(dur, 0.0)], t)
    y = vox(f0, forms, amp, r, scale, tilt=1.25, breath=0.2, fmax=fmax)
    cons = hp(r.standard_normal(n), 2500) * np.clip(np.abs(np.gradient(amp)) * SR * 0.02, 0, 1) * 0.3
    return y + cons


def hurrah(r, base, scale, kid=False):
    """one 'hurrah!' / 'hooray!' / 'hey!'"""
    kind = r.integers(3)
    if kind == 0:   # hur-RAH
        d = r.uniform(0.6, 0.85)
        segs = [(0, "er"), (0.08, "er"), (0.16, "a"), (d, "A")]
        fpts = [(0, 1.15), (0.12, 1.2), (0.2, 1.6), (d * 0.7, 1.5), (d, 1.15)]
    elif kind == 1:  # hoo-RAY
        d = r.uniform(0.55, 0.8)
        segs = [(0, "u"), (0.1, "U"), (0.2, "e"), (d * 0.6, "ei"), (d, "i")]
        fpts = [(0, 1.2), (0.15, 1.25), (0.25, 1.65), (d, 1.3)]
    else:           # HEY!
        d = r.uniform(0.3, 0.45)
        segs = [(0, "E"), (d * 0.7, "ei"), (d, "i")]
        fpts = [(0, 1.5), (0.08, 1.7), (d, 1.35)]
    n = ns(d)
    t = np.arange(n) / SR
    f0 = base * _track(n, fpts, t)
    forms = vowel_track(n, segs)
    amp = np.clip(t / 0.04, 0, 1) * np.clip((d - t) / 0.1, 0, 1) * (0.7 + 0.3 * np.clip((t - 0.15) / 0.1, 0, 1))
    h = hp(r.standard_normal(n), 800) * np.clip(1 - t / 0.06, 0, 1) * 0.4
    return vox(f0, forms, amp, r, scale, tilt=0.9 if not kid else 0.95, breath=0.3) + h


def applause(dur, r, people=36, env=None):
    n = ns(dur)
    out = np.zeros((2, n))
    for p in range(people):
        rate = r.uniform(3.6, 5.6)
        fc = r.uniform(900, 2600)
        cup = r.uniform(0.0, 0.6)
        tm = r.uniform(0, 1 / rate)
        y = np.zeros(n)
        while tm < dur:
            k = ns(tm)
            L = ns(0.05)
            if k + L >= n:
                break
            tl = np.arange(L) / SR
            c = reson(r.standard_normal(L), fc * r.uniform(0.9, 1.1), 1.4) * np.exp(-tl / r.uniform(0.005, 0.009))
            c += cup * reson(r.standard_normal(L), r.uniform(400, 700), 4) * np.exp(-tl / 0.012)
            y[k:k + L] += c * r.uniform(0.6, 1.0)
            tm += (1 / rate) * r.uniform(0.9, 1.1)
        out += pan(y, r.uniform(-0.9, 0.9))
    if env is not None:
        out *= env[None, :]
    return out


# ================================================================ nature
def bird_chirps(dur, r, density=0.5, kind="sparrow"):
    """sparse distant birds: sparrow chips or a blackbird-like fluting phrase"""
    n = ns(dur)
    y = np.zeros(n)
    tm = r.uniform(0.2, 1.5)
    while tm < dur - 1.0:
        if kind == "sparrow":
            for j in range(r.integers(2, 6)):
                L = r.uniform(0.04, 0.08)
                tl = tt(L)
                f = r.uniform(3800, 5600) * (1 - 0.35 * tl / L) if r.uniform() < 0.6 else r.uniform(3000, 4200) * (1 + 0.4 * tl / L)
                c = np.sin(phase(f)) * np.sin(np.pi * tl / L) ** 2
                _place_mono(y, c * r.uniform(0.5, 1.0), tm + j * r.uniform(0.09, 0.16))
            tm += r.exponential(1 / density) + 0.6
        else:
            for j in range(r.integers(3, 7)):
                L = r.uniform(0.09, 0.22)
                tl = tt(L)
                f0 = r.uniform(1500, 2900)
                f = f0 * (1 + r.uniform(-0.25, 0.3) * np.sin(np.pi * tl / L * r.uniform(0.5, 1.5)))
                c = (np.sin(phase(f)) + 0.15 * np.sin(2 * phase(f))) * np.sin(np.pi * tl / L) ** 1.5
                _place_mono(y, c * r.uniform(0.4, 1.0), tm)
                tm += L + r.uniform(0.03, 0.12)
            tm += r.exponential(1 / density) + 1.0
    return y


def crickets(dur, r, voices=3):
    n = ns(dur)
    y = np.zeros(n)
    t = np.arange(n) / SR
    for v in range(voices):
        f = r.uniform(4200, 4900)
        pulse = (np.sin(TAU * r.uniform(28, 34) * t) > 0.2).astype(float)
        chirp = (np.sin(TAU * r.uniform(1.6, 2.4) * t + r.uniform(0, TAU)) > 0.55).astype(float)
        e = lp(pulse * chirp, 200, 1)
        y += np.sin(TAU * f * t) * e * r.uniform(0.4, 1.0)
    return y


def breeze(dur, r, level=1.0, gust=0.18, bright=900):
    n = ns(dur)
    out = np.zeros((2, n))
    g = 0.6 + 0.4 * smooth_noise(n, r, gust)
    for ch in range(2):
        w = lp(colored(n, r, 1.0), bright, 2) * g
        w += 0.25 * bp(colored(n, r, 0.5), 1200, 4000, 1) * g ** 2
        out[ch] = w * level
    return out


def flag_flutter(dur, r):
    n = ns(dur)
    t = np.arange(n) / SR
    rate = 5.5 + 1.5 * smooth_noise(n, r, 0.3)
    m = 0.5 + 0.5 * np.sin(phase(rate))
    return bp(r.standard_normal(n), 300, 3000, 1) * m ** 3 * (0.5 + 0.5 * smooth_noise(n, r, 0.2))


# ================================================================ park, sign, tourists
def swing_squeak(r, a=1.0, fwd=True):
    """playground swing hanger squeak through the bottom of the arc ('eee' forward, 'aww' back)"""
    d = 0.22 + 0.2 * a
    lo, hi = (520, 760) if fwd else (380, 470)
    c = creak(d, r, lo, hi, SMALLMETAL if fwd else CHAIN[2:], [(0, 0), (0.35, 1), (0.65, 1), (1, 0)], rough=0.06, noise=0.01,
              scale=r.uniform(0.9, 1.1))
    return c


def push_thump(r):
    d = 0.3
    t = tt(d)
    th = lp(r.standard_normal(len(t)), 350, 2) * np.exp(-t / 0.035) * 1.5
    cloth = bp(r.standard_normal(len(t)), 900, 4500, 1) * np.exp(-t / 0.05) * 0.25
    jing = rattle(0.25, r, 30, np.exp(-np.linspace(0, 1, ns(0.25)) * 3), heavy=False) * 0.25
    y = th + cloth
    _place_mono(y, jing, 0.02)
    return y


def hammer_hit(r, big=1.0):
    """officer's hammer: steel on nail head ('tink') + wooden sign 'thock' + post thump"""
    d = 0.9
    t = tt(d)
    tink = modal(d, [(3150, 0.6, 0.05), (5070, 0.45, 0.03), (7900, 0.25, 0.015)], r)
    sign = modal(d, [(165, 1.0, 0.09), (345, 0.8, 0.07), (610, 0.55, 0.05), (990, 0.35, 0.03), (1520, 0.2, 0.02)], r, glide=0.03)
    nz = r.standard_normal(len(t))
    hit = bp(nz, 400, 6000, 1) * np.exp(-t / 0.004) * 1.2
    post = np.exp(-t / 0.08) * np.sin(phase(82 * (1 + 0.3 * np.exp(-t / 0.01)))) * 1.3
    return fades((tink * 0.8 + sign * 1.2 + hit + post) * big, 0.0, 0.1)


def stroll_step(r, scuff=0.5):
    d = 0.3
    t = tt(d)
    heel = np.exp(-t / 0.03) * np.sin(phase(r.uniform(90, 130) * (1 + 0.15 * np.exp(-t / 0.01))))
    plank = modal(d, [(r.uniform(180, 280), 0.5, 0.025), (r.uniform(420, 700), 0.35, 0.015)], r)
    nz = r.standard_normal(len(t))
    tap = bp(nz, 700, 4000, 1) * np.exp(-t / 0.005) * 0.4
    sc = bp(nz, 400, 3000, 1) * np.clip(t / 0.02, 0, 1) * np.exp(-t / 0.07) * 0.25 * scuff
    return (heel * 0.7 + plank + tap + sc)


# ================================================================================================================
# CARTOON KIT (added for "What If You Jumped Into a Hole Through the Earth?", same style as the generators above:
# numpy synthesis only, seeded). Comedy spot effects: slide whistles, pops, boing, splat, sizzle, poof, timer, chomp,
# record stop, the stylised tunnel rush, garden / night-ocean ambiences. Rules for all of them: the sound STARTS at
# sample 0 (so the cue lands on its frame), soft enough to sit under a voice, nothing important above ~10 kHz.
# ================================================================================================================
def _band(n, r, fc_of_t, width=0.8, slope=0.6, nper=1024, hop=256):
    """noise in a log-gaussian band whose centre follows fc_of_t(times) (Hz); unit std"""
    nz = colored(n, r, slope)
    y = shape(nz, lambda T, F: np.exp(-0.5 * (np.log2(np.maximum(F[:, None], 20) / fc_of_t(T)[None, :]) / width) ** 2), nper, hop)
    return y / (np.std(y) + 1e-9)


def slide_whistle(dur, r, f0, f1, bend=1.0, ease_out=False, fade_tail=0.0, vib=9.0, breath=0.05):
    """slide whistle (piston in a stopped pipe): near-sine with weak odd partials, breath and a little vibrato,
    gliding f0 -> f1 on a log scale. bend > 1 moves faster at the end (a falling body); ease_out moves fast
    first and slows down; fade_tail = last fraction of the note that fades to nothing."""
    n = ns(dur)
    t = np.arange(n) / SR
    u = t / dur
    w = 1 - (1 - u) ** bend if ease_out else u ** bend
    f = f0 * (f1 / f0) ** w
    cents = vib * np.clip((t - 0.08) / 0.15, 0, 1) * np.sin(TAU * 5.8 * t + r.uniform(0, TAU)) + 4 * smooth_noise(n, r, 3.0)
    f = f * 2 ** (cents / 1200)
    ph = phase(f)
    y = np.sin(ph) + 0.11 * np.sin(3 * ph + 0.7) + 0.035 * np.sin(2 * ph + 0.3) + 0.02 * np.sin(5 * ph + 1.1)
    nz = r.standard_normal(n)
    br = shape(nz, lambda T, F: np.exp(-0.5 * (np.log2(np.maximum(F[:, None], 20) / np.interp(T, t, f)[None, :]) / 0.12) ** 2), 1024, 256)
    br = br / (np.std(br) + 1e-9)
    env = (1 - np.exp(-t / 0.006)) * (1 + 0.25 * np.exp(-t / 0.02))
    if fade_tail > 0:
        env = env * np.clip((1 - u) / fade_tail, 0, 1) ** 1.5
    y = env * (y + breath * br + breath * 0.25 * hp(nz, 3000))
    y += bp(nz, f0, min(f0 * 4, 9000), 1) * np.exp(-t / 0.012) * (1 - np.exp(-t / 0.001)) * 0.35      # chiff: the breath hits the pipe
    return fades(y, 0.001, 0.03)


def cork_pop(r, f=520.0, size=1.0):
    """cork out of a bottle / cartoon 'pop': pressure click + a short hollow resonance whose pitch drops as it opens"""
    dur = 0.28
    t = tt(dur)
    fr_ = f * (1 + 1.6 * np.exp(-t / 0.006))
    ph = phase(fr_)
    body = np.exp(-t / (0.038 * size)) * np.sin(ph)
    neck = 0.35 * np.exp(-t / 0.018) * np.sin(2.31 * ph + 0.6)
    nz = r.standard_normal(len(t))
    click = bp(nz, 700, 6000, 1) * np.exp(-t / 0.0035) * 0.7
    puff = lp(nz, 900, 2) * np.exp(-t / 0.05) * (1 - np.exp(-t / 0.01)) * 0.12
    return fades((body + neck) * (1 - np.exp(-t / 0.0006)) + click + puff, 0.0, 0.05)


def pop_small(r, f=880.0):
    """small bright cartoon pop (a flag, an arrow card)"""
    dur = 0.16
    t = tt(dur)
    y = np.exp(-t / 0.022) * np.sin(phase(f * (1 + 1.2 * np.exp(-t / 0.004)))) * (1 - np.exp(-t / 0.0005))
    y += bp(r.standard_normal(len(t)), 1500, 7000, 1) * np.exp(-t / 0.002) * 0.4
    return fades(y, 0.0, 0.03)


def blip(notes, r):
    """tiny tuned cartoon blips: notes = [(t, dur, f0, f1)] - sine glides with a soft mallet click"""
    total = max(tn + d for tn, d, *_r in notes) + 0.15
    y = np.zeros(ns(total))
    for (tn, d, f0, f1) in notes:
        n = ns(d + 0.12)
        t = np.arange(n) / SR
        ph = phase(f0 * (f1 / f0) ** np.clip(t / d, 0, 1))
        e = (1 - np.exp(-t / 0.002)) * np.where(t < d, 1 - 0.3 * t / d, 0.7 * np.exp(-(t - d) / 0.03))
        x = e * (np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph))
        x += hp(r.standard_normal(n), 2500) * np.exp(-t / 0.0015) * 0.12
        _place_mono(y, x, tn)
    return y


def splat(r):
    """something soft and wet hits the ground (a pancake on a lawn): flop slap + squelch + a few glops + low thud"""
    dur = 0.6
    n = ns(dur)
    t = np.arange(n) / SR
    nz = r.standard_normal(n)
    slap = bp(nz, 250, 4500, 1) * np.exp(-t / 0.012) * 1.3
    sq = _band(n, r, lambda T: 450 + 1500 * np.exp(-T / 0.05), 0.9, 0.5, 512, 128)
    sq = sq * (1 - np.exp(-t / 0.004)) * np.exp(-t / 0.075) * 0.9
    glop = bubbles(dur, r, 140 * np.exp(-t / 0.12) + 4, 220, 1200, (0.008, 0.03), np.exp(-t / 0.16), rise=(2, 8)) * 0.9
    thud = np.exp(-t / 0.05) * np.sin(phase(88 * (1 + 0.5 * np.exp(-t / 0.015)))) * 1.1
    return fades(slap + sq + glop + thud, 0.0, 0.08)


def sizzle(r, dur=0.7, crackle=1.0):
    """frying sizzle that dies away: band-limited hiss with a fluttering level + small crackles"""
    n = ns(dur)
    t = np.arange(n) / SR
    fry = bp(r.standard_normal(n), 2800, 8500, 2) * (0.7 + 0.3 * smooth_noise(n, r, 25.0))
    env = (1 - np.exp(-t / 0.008)) * np.exp(-t / (dur * 0.33))
    y = fry * env * 0.5
    tm = 0.0
    while tm < dur * 0.85:
        k = ns(tm)
        tl = tt(0.03)
        c = modal(0.03, [(r.uniform(1800, 5200), 1.0, r.uniform(0.002, 0.005))], r)
        c += hp(r.standard_normal(len(tl)), 3000) * np.exp(-tl / 0.0008) * 0.5
        _place_mono(y, c * r.uniform(0.2, 0.8) * crackle * env[min(k, n - 1)], tm)
        tm += r.exponential(1 / 45.0)
    return fades(lp(y, 9500, 2), 0.0, 0.08)


def flame_poof(r):
    """something catches fire: soft 'fwoomp' (low bloom that opens and closes) + flutter + a few fading crackles"""
    dur = 0.9
    n = ns(dur)
    t = np.arange(n) / SR
    body = _band(n, r, lambda T: 170 + 1150 * np.clip(T / 0.06, 0, 1) * np.exp(-np.maximum(T - 0.06, 0) / 0.2), 1.1, 1.2)
    env = np.where(t < 0.04, 0.25 + 0.75 * (t / 0.04) ** 1.5, np.exp(-(t - 0.04) / 0.17))
    flut = 1 + 0.35 * np.sin(TAU * 23 * t + r.uniform(0, TAU)) * np.exp(-t / 0.3)
    thump = np.exp(-t / 0.09) * np.sin(phase(68 * (1 + 0.4 * np.exp(-t / 0.03)))) * 0.9 * (1 - np.exp(-t / 0.003))
    air = hp(r.standard_normal(n), 2500) * env ** 2 * 0.07
    y = body * env * flut * 1.2 + thump + air
    tm = 0.12
    while tm < dur - 0.1:
        tl = tt(0.03)
        c = modal(0.03, [(r.uniform(1500, 4200), 1.0, r.uniform(0.002, 0.005))], r) + hp(r.standard_normal(len(tl)), 2500) * np.exp(-tl / 0.001) * 0.4
        _place_mono(y, c * r.uniform(0.1, 0.35) * np.exp(-tm / 0.35), tm)
        tm += r.exponential(1 / 22.0)
    return fades(lp(y, 9000, 2), 0.001, 0.12)


def glass_pop(r):
    """a thermometer bulb pops: small pressure pop + glass 'tink' + a handful of tiny shards"""
    dur = 0.55
    y = np.zeros(ns(dur))
    t = tt(dur)
    _place_mono(y, cork_pop(r, 950.0, 0.6) * 0.9, 0.0)
    y += modal(dur, [(3320, 1.0, 0.09), (5210, 0.55, 0.05), (7480, 0.3, 0.025)], r) * (1 - np.exp(-t / 0.0004)) * 0.5
    for i in range(9):
        tm = min(abs(r.normal(0.06, 0.07)) + 0.012, dur - 0.13)
        f = np.exp(r.uniform(np.log(2600), np.log(7800)))
        s = modal(0.12, [(f, 1.0, r.uniform(0.008, 0.03)), (f * r.uniform(1.4, 1.9), 0.5, 0.008)], r)
        _place_mono(y, s * r.uniform(0.15, 0.5), tm)
    return fades(lp(y, 10000, 2), 0.0, 0.05)


def timer_tick(r, tock=False):
    dur = 0.06
    t = tt(dur)
    f = (1750 if tock else 2300) * r.uniform(0.98, 1.02)
    y = modal(dur, [(f, 1.0, 0.004), (f * 1.83, 0.6, 0.003), (f * 2.9, 0.3, 0.002), (640, 0.5, 0.006)], r)
    return lp(y + hp(r.standard_normal(len(t)), 3000) * np.exp(-t / 0.0006) * 0.5, 9000, 2)


def timer_ticks(dur, r, step):
    """wind-up egg timer: tick-tock every `step` s, first tick at 0, last one at `dur`; faint clockwork whirr under it"""
    k = int(round(dur / step))
    n = ns(dur + 0.08)
    y = np.zeros(n)
    for i in range(k + 1):
        _place_mono(y, timer_tick(r, i % 2 == 1) * (1.0 if i % 2 == 0 else 0.8), i * step)
    t = np.arange(n) / SR
    whirr = bp(r.standard_normal(n), 500, 1400, 1) * (0.5 + 0.5 * np.sin(TAU * t / step)) ** 2 * 0.02
    return y + fades(whirr, 0.01, 0.05)


def timer_ding(r, f=2093.0):
    """kitchen-timer bell: one bright strike, a beating pair of modes, about one second of ring"""
    dur = 1.3
    t = tt(dur)
    modes = [(f, 1.0, 0.42), (f * 1.006, 0.6, 0.38), (f * 2.76, 0.35, 0.16), (f * 2.78, 0.2, 0.14), (f * 0.5, 0.15, 0.25), (f * 4.07, 0.08, 0.05)]
    y = modal(dur, modes, r) * (1 - np.exp(-t / 0.0005))
    y += hp(r.standard_normal(len(t)), 3500) * np.exp(-t / 0.0012) * 0.3
    return fades(y, 0.0, 0.12)


def ding(r, f=1568.0, ratio=4 / 3, dur=1.0):
    """friendly 'ding!': two small bells a fourth apart (glockenspiel-like partials)"""
    t = tt(dur)
    f2 = f * ratio
    y = modal(dur, [(f, 1.0, 0.42), (f * 2.756, 0.22, 0.1), (f2, 0.75, 0.38), (f2 * 2.756, 0.12, 0.08)], r) * (1 - np.exp(-t / 0.0005))
    y += hp(r.standard_normal(len(t)), 3000) * np.exp(-t / 0.0008) * 0.2
    return fades(y, 0.0, 0.1)


def twinkle(r, freqs, step=0.042):
    """sparkle: a quick run of tiny bells + a breath of shimmer"""
    n = ns(0.75 + step * len(freqs))
    y = np.zeros(n)
    for i, f in enumerate(freqs):
        md = [(f, 1.0, 0.17), (f * 2.0, 0.06, 0.08)] + ([(f * 2.76, 0.16, 0.05)] if f * 2.76 < 10000 else [])
        x = modal(0.6, md, r) * (1 - np.exp(-tt(0.6) / 0.0006))
        _place_mono(y, x * (0.75 + 0.25 * (i % 2)) * r.uniform(0.85, 1.0), i * step * r.uniform(0.92, 1.08) if i else 0.0)
    t = np.arange(n) / SR
    y += bp(r.standard_normal(n), 4500, 9000, 1) * np.exp(-t / 0.12) * (1 - np.exp(-t / 0.01)) * 0.03
    return fades(y, 0.0, 0.1)


def zip_by(r, f_lo=420.0, f_hi=3200.0, dur=0.32, tp=0.035):
    """something small and fast goes by: 'zwip' - tone + air band race up, peak as it passes (tp), short Doppler fall"""
    n = ns(dur)
    t = np.arange(n) / SR
    w = np.where(t < tp, (t / tp) ** 0.8, 1 - 0.55 * (1 - np.exp(-(t - tp) / 0.06)))
    f = f_lo * (f_hi / f_lo) ** w
    ph = phase(f)
    tone = np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    env = np.where(t < tp, 0.2 + 0.8 * (t / tp) ** 1.3, np.exp(-(t - tp) / 0.07))
    air = _band(n, r, lambda T: np.interp(T, t, f), 0.5, 0.3, 512, 128)
    return fades(env * (0.55 * tone + 0.9 * air), 0.002, 0.04)


def ricochet(r, f0=2500.0, f1=1150.0, dur=0.55):
    """cartoon ricochet 'pyeeow': a metal ping whose pitch falls with a little wobble"""
    n = ns(dur)
    t = np.arange(n) / SR
    f = (f1 + (f0 - f1) * np.exp(-t / 0.16)) * (1 + 0.02 * np.sin(TAU * 31 * t) * np.clip(t / 0.05, 0, 1))
    ph = phase(f)
    y = np.exp(-t / 0.17) * (np.sin(ph) + 0.35 * np.sin(2.4 * ph + 1) + 0.15 * np.sin(3.9 * ph + 2) * np.exp(-t / 0.05))
    y *= 1 - np.exp(-t / 0.0006)
    y += hp(r.standard_normal(n), 3000) * np.exp(-t / 0.0015) * 0.5
    return fades(y, 0.0, 0.06)


def impact_kick(r, weight=1.0):
    """speed-surge kick: soft sub thump + knock + a short airy burst racing upward"""
    dur = 0.55
    n = ns(dur)
    t = np.arange(n) / SR
    thump = np.exp(-t / 0.11) * np.sin(phase(52 * (1 + 1.3 * np.exp(-t / 0.02)))) * 1.6 * weight
    knock = lp(r.standard_normal(n), 500, 2) * np.exp(-t / 0.02) * 0.9
    air = whoosh(dur, r, peak=0.035, f_lo=350, f_hi=2600, width=0.9, tail=0.13, air=0.15)
    return fades(thump + knock + 0.9 * air[:n], 0.0, 0.06)


def shovel_thunk(r):
    """a shovel planted in a mound of earth: low thud + gritty dirt crunch + a short dull ring of the blade"""
    dur = 0.45
    n = ns(dur)
    t = np.arange(n) / SR
    nz = r.standard_normal(n)
    thud = np.exp(-t / 0.055) * np.sin(phase(92 * (1 + 0.6 * np.exp(-t / 0.012)))) * 1.4
    dirt = bp(nz, 500, 3800, 1) * np.clip(smooth_noise(n, r, 90.0) * 2, 0, 1) ** 2 * np.exp(-t / 0.05) * 1.6
    hit = bp(nz, 300, 3000, 1) * np.exp(-t / 0.006) * 0.9
    blade = modal(dur, [(1180, 0.5, 0.06), (2370, 0.4, 0.045), (3890, 0.25, 0.03), (310, 0.6, 0.03)], r) * 0.35
    return fades(thud + dirt + hit + blade, 0.0, 0.08)


def paper_flick(r):
    """a clipboard whipped up: two or three paper flaps + the board's small knock"""
    dur = 0.3
    y = np.zeros(ns(dur))
    for tm, g in [(0.0, 1.0), (0.06, 0.6), (0.105, 0.35)]:
        tl = tt(0.05)
        f = bp(r.standard_normal(len(tl)), 1200, 7500, 1) * np.exp(-tl / 0.009) * (1 - np.exp(-tl / 0.0008))
        f += bp(r.standard_normal(len(tl)), 350, 1100, 1) * np.exp(-tl / 0.012) * 0.5
        _place_mono(y, f * g, tm)
    _place_mono(y, modal(0.1, [(640, 1.0, 0.012), (1480, 0.6, 0.008)], r) * 0.5, 0.0)
    return lp(y, 8500, 2)


def boing(r, f=175.0, dur=0.55):
    """cartoon spring 'boing': a harmonic-rich twang whose pitch wobbles and whose formant sweeps up"""
    n = ns(dur)
    t = np.arange(n) / SR
    wob = 0.22 * np.exp(-t / 0.16) * np.sin(TAU * (14 * t + 22 * t * t))
    ph = phase(f * (1 + 0.35 * t / dur) * (1 + wob))
    fm = 500 + 1900 * (1 - np.exp(-t / 0.12))
    y = 0.5 * np.sin(ph)
    for k in range(2, 19):
        y += k ** -0.8 * np.exp(-0.5 * ((k * f - fm) / (380 + 0.2 * fm)) ** 2) * np.sin(k * ph + r.uniform(0, TAU))
    env = (1 - np.exp(-t / 0.003)) * np.exp(-t / 0.17)
    return fades(y * env, 0.0, 0.05)


def gulp(r):
    """cartoon gulp: soft throat thump + a bubble that dips and rises"""
    dur = 0.3
    n = ns(dur)
    t = np.arange(n) / SR
    f = 150 + 70 * np.exp(-t / 0.03) + 330 * np.clip((t - 0.05) / 0.09, 0, 1) ** 2
    env = (1 - np.exp(-t / 0.004)) * np.exp(-np.maximum(t - 0.06, 0) / 0.045)
    ph = phase(f)
    y = env * (np.sin(ph) + 0.3 * np.sin(2 * ph + 0.5))
    y += lp(r.standard_normal(n), 400, 2) * np.exp(-t / 0.012) * 0.6
    return fades(y, 0.0, 0.04)


def chomp(r):
    """one big cartoon bite: jaw snap + crisp crunch + a soft closing 'omp'"""
    dur = 0.42
    n = ns(dur)
    t = np.arange(n) / SR
    y = np.zeros(n)
    _place_mono(y, modal(0.2, [(190, 1.0, 0.03), (430, 0.7, 0.02), (980, 0.35, 0.012)], r, glide=0.3, glide_tau=0.01), 0.0)
    y += bp(r.standard_normal(n), 700, 5000, 1) * np.exp(-t / 0.018) * 0.8
    tm = 0.004
    while tm < 0.14:
        c = modal(0.03, [(r.uniform(900, 3200), 1.0, r.uniform(0.003, 0.007)), (r.uniform(3200, 6500), 0.5, 0.002)], r)
        _place_mono(y, c * r.uniform(0.3, 1.0) * np.exp(-tm / 0.05), tm)
        tm += r.exponential(1 / 160.0)
    tl = tt(0.2)
    omp = np.exp(-tl / 0.035) * np.sin(phase(135 * (1 + 0.4 * np.exp(-tl / 0.012)))) * 0.8 * (1 - np.exp(-tl / 0.004))
    _place_mono(y, omp, 0.11)
    return fades(y, 0.0, 0.05)


def record_stop(r, chord=(261.6, 329.6, 392.0, 466.2), dur=0.42):
    """a band on a turntable that somebody stops by hand: needle scratch + the last chord winding down to nothing"""
    ts = tt(0.6)
    src = np.zeros_like(ts)
    for f in chord:
        ph = TAU * f * ts + r.uniform(0, TAU)
        for k in range(1, 9):
            src += np.sin(k * ph) / k
    src = src / (np.std(src) + 1e-9) + 0.4 * bp(r.standard_normal(len(ts)), 300, 5000, 1)
    n = ns(dur)
    t = np.arange(n) / SR
    speed = (1 - t / dur) ** 1.6
    y = np.interp(np.cumsum(speed) / SR, ts, src) * (1 - t / dur) ** 0.6
    scratch = _band(n, r, lambda T: 3200 * np.exp(-T / 0.04) + 500, 0.7, 0.2, 512, 128) * np.exp(-t / 0.035) * 1.4
    return fades(hp(lp(y, 6000, 2) + scratch, 60, 2), 0.0, 0.03)


def decel_whoosh(dur, r, f_hi=1700.0, f_lo=240.0):
    """the opposite of a whoosh: an air band (and a faint tone inside it) sinking in pitch and level as something slows"""
    n = ns(dur)
    t = np.arange(n) / SR
    u = t / dur
    f = f_hi * (f_lo / f_hi) ** (u ** 0.85)
    air = _band(n, r, lambda T: np.interp(T, t, f), 0.7, 0.6)
    tone = np.sin(phase(f * 0.5)) * 0.25
    env = (1 - np.exp(-t / 0.01)) * (1 - u) ** 1.2
    return fades((air + tone) * env, 0.001, 0.05)


def rope_creak(r, a=1.0, fwd=True):
    """swing ropes taking the load as the seat passes: a short low creak ('errk' forward, 'orrk' back)"""
    d = 0.24 + 0.14 * a
    lo, hi = (62, 128) if fwd else (96, 54)
    c = creak(d, r, lo, hi, WOOD, [(0, 0.35), (0.2, 1), (0.6, 0.9), (1, 0)], rough=0.14, noise=0.0, scale=r.uniform(1.15, 1.4))
    fibre = bp(r.standard_normal(len(c)), 500, 2600, 2) * np.interp(np.linspace(0, 1, len(c)), [0, 0.2, 0.6, 1], [0.3, 1, 0.8, 0]) * 0.012
    tl = tt(0.05)
    tick = modal(0.05, [(r.uniform(620, 760), 1.0, 0.007), (r.uniform(1350, 1650), 0.6, 0.004)], r) * (1 - np.exp(-tl / 0.0004)) * 0.03    # the rope takes the load
    c = c + fibre
    c[: len(tick)] += tick
    return lp(c, 6500, 2)


def whoosh_deep(r, dur=1.0):
    """big camera move into depth: an air band diving from bright to dark + a soft sub swell ('whooom')"""
    n = ns(dur)
    t = np.arange(n) / SR
    f = 2600.0 * (180.0 / 2600.0) ** (np.clip(t / 0.55, 0, 1) ** 0.8)
    air = _band(n, r, lambda T: np.interp(T, t, f), 0.6, 0.4)
    env = np.where(t < 0.04, 0.15 + 0.85 * (t / 0.04) ** 1.5, np.exp(-(t - 0.04) / 0.3))
    sub = np.sin(phase(95 * (1 - 0.35 * np.clip(t / 0.6, 0, 1)))) * (1 - np.exp(-t / 0.03)) * np.exp(-t / 0.28) * 0.9
    return fades(air * env + sub, 0.002, 0.08)


def cricket_solo(dur, r, first=0.22, every=0.62):
    """the one cricket of an awkward silence: 3-pulse chirps"""
    n = ns(dur)
    t = np.arange(n) / SR
    y = np.zeros(n)
    f = r.uniform(4300, 4600)
    tm = first
    while tm < dur - 0.15:
        for j in range(3):
            tl = tt(0.022)
            _place_mono(y, np.sin(TAU * f * tl) * np.sin(np.pi * tl / 0.022) ** 2 * (0.7 + 0.15 * j), tm + j * 0.034)
        tm += every * r.uniform(0.93, 1.07)
    return y


def wind_rush(dur, r, f_pts, a_pts, flutter=(6.0, 15.0), whistle=0.10):
    """stylised falling rush (a cartoon whoosh that lasts, NOT real wind): a band of noise whose centre (f_pts, Hz)
    and level (a_pts, 0..1) follow the speed, a faint whistle resonance above it, a flutter that quickens with the
    level. pts = [(u in 0..1, value)]. Returns stereo (decorrelated sides)."""
    n = ns(dur)
    t = np.arange(n) / SR
    u = t / dur
    fc = np.exp(np.interp(u, [p[0] for p in f_pts], np.log([p[1] for p in f_pts])))
    a = np.interp(u, [p[0] for p in a_pts], [p[1] for p in a_pts])
    fcT = lambda T: np.interp(T, t, fc)

    def g(T, F):
        lf = np.log2(np.maximum(F[:, None], 20))
        c = np.log2(fcT(T))[None, :]
        return np.exp(-0.5 * ((lf - c) / 0.75) ** 2) + whistle * np.exp(-0.5 * ((lf - c - 1.6) / 0.09) ** 2)
    out = np.zeros((2, n))
    for ch in range(2):
        y = shape(colored(n, r, 0.8), g, 2048, 512)
        out[ch] = y / (np.std(y) + 1e-9)
    an = a / (a.max() + 1e-9)
    fl = 1 + 0.14 * np.sin(phase(flutter[0] + (flutter[1] - flutter[0]) * an)) + 0.18 * smooth_noise(n, r, 2.0)
    out *= (a * fl)[None, :]
    out += (lp(colored(n, r, 2.0), 140, 2) * a * 0.35)[None, :]
    return out


def amb_garden(dur, r, birds=1.0, cricket=0.0, evening=False):
    """back-garden air: light breeze + sparrows (day) or blackbird phrases + crickets (evening); cricket = the lone one"""
    n = ns(dur)
    x = breeze(dur, r, 0.35 if evening else 0.45, 0.15, 650 if evening else 850)
    kind = "blackbird" if evening else "sparrow"
    if birds > 0:                                        # the birds carry the bed; the breeze is only air under them
        a = bird_chirps(dur + 1.2, r, 0.7, kind)
        b = bird_chirps(dur + 1.2, r, 0.5, kind)
        x += pan(a[:n] * 0.30 * birds, 0.5) + pan(b[:n] * 0.20 * birds, -0.6)
    if evening:
        x += widen(crickets(dur, r, 3) * 0.04, r, 9, 1.0)
    if cricket > 0:
        x += pan(cricket_solo(dur, r) * 0.03 * cricket, 0.35)
    return x


def ocean_night(dur, r, period=4.3):
    """open sea at night, close to a small boat: slow swells washing, a little foam on each crest, water lapping
    on the hull, the boat's timber creaking now and then"""
    n = ns(dur)
    t = np.arange(n) / SR
    out = np.zeros((2, n))
    sw = phase((1.0 / period) * (1 + 0.12 * smooth_noise(n, r, 0.3))) + r.uniform(0, TAU)
    for ch in range(2):
        w = (0.5 - 0.5 * np.cos(sw + 0.5 * ch)) ** 1.5
        wash = bp(colored(n, r, 1.0), 120, 2200, 1) * (0.35 + 0.65 * w)
        foam = bp(colored(n, r, 0.3), 1800, 6500, 1) * w ** 4 * 0.16
        out[ch] = wash + foam + lp(colored(n, r, 2.0), 120, 2) * 0.25
    lap = bubbles(dur, r, 7.0, 300, 1400, (0.01, 0.03), rise=(2, 8)) * 0.45
    out += widen(lap, r, 7, 1.0)
    tm = r.uniform(0.9, 1.6)
    k = 0
    while tm < dur - 0.9:
        c = creak(r.uniform(0.45, 0.7), r, r.uniform(28, 40), r.uniform(50, 75), TIMBER, [(0, 0), (0.35, 1), (0.75, 0.7), (1, 0)], 0.2, 0.03)
        seg = pan(c * 0.16 * r.uniform(0.6, 1.0), -0.35)
        i = ns(tm)
        m = min(seg.shape[1], n - i)
        out[:, i:i + m] += seg[:, :m]
        tm += r.uniform(2.3, 3.4)
        k += 1
    return out


# ================================================================================================================
# GENERIC KIT: everyday sounds a new story may need (same style and rules as the kits above; stereo where it says so).
# ================================================================================================================
def _unit(x):
    return x / (np.std(x) + 1e-9)


def _clicks(dur, r, rate, f_lo, f_hi, tau=(0.002, 0.006), env=None):
    """a cloud of tiny resonant clicks (crackle, patter, debris), about `rate` per second"""
    n = ns(dur)
    y = np.zeros(n)
    tm = r.exponential(1.0 / rate)
    while tm < dur:
        k = ns(tm)
        a = 1.0 if env is None else env[min(k, n - 1)]
        L = min(ns(0.03), n - k)
        if a > 0.01 and L > 8:
            tl = np.arange(L) / SR
            f = np.exp(r.uniform(np.log(f_lo), np.log(f_hi)))
            y[k:k + L] += a * r.uniform(0.2, 1.0) ** 2 * np.exp(-tl / r.uniform(*tau)) * np.sin(TAU * f * tl + r.uniform(0, TAU))
        tm += r.exponential(1.0 / rate)
    return y


def thunder(r, dur=3.4, close=0.7):
    """thunder: a tearing crack (close = how near, 0..1), then a rumble that rolls, sinks and fades. Stereo."""
    n = ns(dur)
    t = np.arange(n) / SR
    env = (1 - np.exp(-t / 0.05)) * np.exp(-t / (0.32 * dur))
    for tm, g in [(0.55, 0.6), (1.2, 0.45), (1.9, 0.3)]:           # the rolls: three later, softer swells
        env += g * np.exp(-0.5 * ((t - tm * dur / 3.4) / 0.16) ** 2)
    crack = np.zeros(n)
    for tm, g in [(0.0, 1.0), (r.uniform(0.06, 0.1), 0.6), (r.uniform(0.17, 0.26), 0.4)]:
        k = ns(tm)
        crack[k:] += g * bp(r.standard_normal(n - k), 220, 5200, 1) * np.exp(-t[: n - k] / 0.045)
    out = np.zeros((2, n))
    for ch in range(2):
        low = _unit(hp(lp(colored(n, r, 1.5), 220, 2), 40, 2)) * (0.65 + 0.35 * smooth_noise(n, r, 5.0))
        mid = _unit(bp(colored(n, r, 1.2), 150, 1100, 1)) * (0.5 + 0.5 * smooth_noise(n, r, 9.0)) * np.exp(-t / (0.25 * dur)) * 0.55
        out[ch] = (low + mid) * env + 3.0 * close * crack
    return fades(out, 0.0, 0.5)


def explosion(r, dur=2.0, size=1.0):
    """cartoon explosion: a sub thump whose pitch drops, a blast of noise that darkens fast, rumble, falling debris. Stereo."""
    n = ns(dur)
    t = np.arange(n) / SR
    sub = np.sin(phase(40 + 95 * np.exp(-t / 0.05))) * np.exp(-t / (0.3 * size)) * (1 - np.exp(-t / 0.002)) * 1.7
    blast = _band(n, r, lambda T: 260 + 4300 * np.exp(-T / 0.085), 1.3, 0.8, 512, 128) * np.exp(-t / 0.2) * (1 - np.exp(-t / 0.002)) * 1.2
    core = np.tanh(1.3 * (sub + blast))
    deb_env = np.clip((t - 0.15) / 0.2, 0, 1) * np.exp(-np.maximum(t - 0.35, 0) / 0.45)
    out = np.zeros((2, n))
    for ch in range(2):
        tail = _unit(hp(lp(colored(n, r, 1.4), 520, 2), 40, 2)) * (0.6 + 0.4 * smooth_noise(n, r, 8.0)) * np.clip(t / 0.06, 0, 1) * np.exp(-t / (0.55 * size)) * 0.55
        out[ch] = core + tail + _clicks(dur, r, 40.0, 500, 3500, (0.003, 0.012), deb_env) * 0.5
    return fades(out, 0.0, 0.3)


def roar(dur, r, shape_="rise"):
    """rocket / jet / big engine: a low roar, a crackling band over it, a little flutter. shape_: rise | steady | fade. Stereo."""
    n = ns(dur)
    t = np.arange(n) / SR
    u = t / dur
    env = {"rise": 0.35 + 0.65 * u ** 1.4, "steady": np.ones(n), "fade": 1.0 - 0.8 * u ** 0.8}[shape_]
    out = np.zeros((2, n))
    for ch in range(2):
        low = _unit(hp(lp(colored(n, r, 1.5), 260, 2), 40, 2))
        mid = _unit(bp(colored(n, r, 0.8), 200, 2600, 1))
        out[ch] = low + mid * (0.3 + 1.1 * np.clip(smooth_noise(n, r, 45.0), 0, 1) ** 2)
    return out * (env * (1 + 0.08 * np.sin(TAU * 12 * t)))[None, :]


def gasp(r, base, scale):
    """one person's sharp gasp: a breathy 'hah!' that jumps up in pitch"""
    d = r.uniform(0.26, 0.38)
    n = ns(d + 0.04)
    t = np.arange(n) / SR
    f0 = base * np.interp(t, [0, d * 0.5, d], [1.0, 1.5, 1.7])
    forms = vowel_track(n, [(0, "A"), (d * 0.5, "a"), (d, "ae")])
    amp = np.clip(t / 0.025, 0, 1) * np.clip((d - t) / 0.035, 0, 1) * (0.55 + 0.45 * np.clip(t / (0.5 * d), 0, 1))
    return fades(vox(f0, forms, amp, r, scale, tilt=1.3, breath=2.2), 0.002, 0.02)


def crowd(r, kind="gasp", people=9, dur=1.8):
    """a small crowd reacting together: gasp | ooh | cheer (dur = length of a cheer). The first voice starts at
    sample 0. Stereo."""
    L = {"gasp": 0.6, "ooh": 0.95, "cheer": dur}[kind]
    n = ns(L + 0.3)
    out = np.zeros((2, n))
    for i in range(people):
        woman = r.uniform() < 0.5
        base = r.uniform(185, 250) if woman else r.uniform(105, 150)
        scale = r.uniform(1.1, 1.2) if woman else r.uniform(0.95, 1.08)
        if kind == "gasp":
            x, tm = gasp(r, base, scale), abs(r.normal(0, 0.035))
        elif kind == "ooh":
            x, tm = whoa(r, base * 1.1, r.uniform(0.5, 0.75)), abs(r.normal(0, 0.06))
        else:
            x, tm = hurrah(r, base * 1.25, scale), r.uniform(0, 0.55 * L)
        seg = pan(x * r.uniform(0.6, 1.0), r.uniform(-0.8, 0.8))
        k = 0 if i == 0 else ns(tm)
        m = min(seg.shape[1], n - k)
        out[:, k:k + m] += seg[:, :m]
    if kind == "cheer":
        tn = np.arange(n) / SR
        e = np.clip(tn / 0.2, 0.3, 1) * np.clip((L + 0.3 - tn) / 0.5, 0, 1)
        out = _unit(out) + 0.6 * _unit(applause(L + 0.3, r, 22)) * e[None, :]
    return fades(lp(out, 9000, 2), 0.0, 0.05)


def murmur(dur, r, people=6):
    """a room of people talking, far enough that no word is understood: six voices, each a few seconds of babble
    repeated out of step with the others. Stereo."""
    n = ns(dur)
    seg = min(max(dur, 1.5), 6.0)
    out = np.zeros((2, n))
    for i in range(people):
        woman = i % 2 == 0
        x = babble(seg, r, r.uniform(180, 240) if woman else r.uniform(100, 145), r.uniform(1.1, 1.18) if woman else r.uniform(0.95, 1.06),
                   rate=r.uniform(3.6, 4.8), fmax=3000)
        y = np.tile(fades(x, 0.05, 0.05), int(np.ceil(dur / seg)) + 1)[ns(r.uniform(0, seg)):][:n]
        out += pan(lp(y, 2600, 1) * r.uniform(0.6, 1.0), r.uniform(-0.9, 0.9))
    return out


def car_horn(r, beeps=2, f=(415.0, 523.0)):
    """two-tone car horn: 'beep-beep' (beeps = 2) or one long honk (beeps = 1)"""
    d = 0.5 if beeps == 1 else 0.16
    gap = 0.1
    y = np.zeros(ns(beeps * d + (beeps - 1) * gap + 0.08))
    for j in range(beeps):
        n = ns(d + 0.03)
        t = np.arange(n) / SR
        x = np.zeros(n)
        for f0 in f:
            ph = phase(f0 * (1 + 0.003 * smooth_noise(n, r, 12.0)))
            for k in range(1, int(9000 / f0) + 1):
                x += k ** -0.7 * (1 + 2.2 * np.exp(-((k * f0 - 2300) / 900.0) ** 2)) * np.sin(k * ph + r.uniform(0, TAU))
        _place_mono(y, x * np.clip(t / 0.006, 0, 1) * np.clip((d + 0.03 - t) / 0.03, 0, 1), j * (d + gap))
    return lp(y, 7000, 2)


def bubbling(dur, r, rate=26.0):
    """a liquid bubbling (a pot, a lab flask, lava, under water): plinks of all sizes over a low gurgle. Stereo."""
    n = ns(dur)
    out = np.zeros((2, n))
    for ch in range(2):
        big = bubbles(dur, r, rate * 0.35, 180, 700, (0.02, 0.06), rise=(1, 5))
        small = bubbles(dur, r, rate, 500, 2600, (0.008, 0.03), rise=(3, 12)) * 0.7
        out[ch] = big + small + _unit(hp(lp(colored(n, r, 1.8), 260, 2), 40, 2)) * (0.5 + 0.5 * smooth_noise(n, r, 3.0)) * 0.12
    return out


def laser_zap(r, f0=3300.0, f1=260.0, dur=0.32):
    """toy ray gun 'pew': a tone that dives more than three octaves with a fast wobble"""
    n = ns(dur)
    t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** ((t / dur) ** 0.55) * (1 + 0.05 * np.sin(TAU * 60 * t))
    ph = phase(f)
    y = (np.sin(ph) + 0.35 * np.sin(2 * ph + 0.4) + 0.15 * np.sin(3 * ph + 1.0)) * (1 - np.exp(-t / 0.0012)) * np.exp(-t / 0.1)
    y += hp(r.standard_normal(n), 3000) * np.exp(-t / 0.004) * 0.25
    return fades(lp(y, 9500, 2), 0.0, 0.04)


def heartbeat(dur, r, bpm=72.0):
    """lub-dub, lub-dub: two soft thumps per beat, with enough knock in them to be heard on a phone"""
    def thump(f, tau, g):
        tl = tt(0.2)
        gl = 1 + 0.8 * np.exp(-tl / 0.015)
        x = np.sin(phase(f * gl)) * np.exp(-tl / tau) + 0.8 * np.sin(phase(2 * f * gl) + 0.5) * np.exp(-tl / (0.7 * tau))
        x += 0.6 * np.sin(phase(3 * f * gl) + 1.1) * np.exp(-tl / (0.5 * tau)) + bp(r.standard_normal(len(tl)), 120, 520, 1) * np.exp(-tl / 0.016) * 1.8
        return x * (1 - np.exp(-tl / 0.003)) * g
    per = 60.0 / bpm
    y = np.zeros(ns(dur + 0.25))
    tm = 0.0
    while tm < dur - 0.02:
        _place_mono(y, thump(70.0, 0.06, 1.0), tm)
        _place_mono(y, thump(88.0, 0.045, 0.7), tm + min(0.32, 0.38 * per))
        tm += per
    return fades(y, 0.0, 0.05)


def clock_ticks(dur, r, step=0.5):
    """wall clock: tick ... tock every `step` s, the first one at 0"""
    y = np.zeros(ns(dur + 0.12))
    k = 0
    while k * step <= dur + 1e-6:
        tl = tt(0.1)
        f = (2050.0 if k % 2 == 0 else 1560.0) * r.uniform(0.985, 1.015)
        x = modal(0.1, [(f, 1.0, 0.007), (f * 2.4, 0.5, 0.004), (430, 0.8, 0.014), (860, 0.3, 0.008)], r)
        x += hp(r.standard_normal(len(tl)), 2500) * np.exp(-tl / 0.0008) * 0.4
        _place_mono(y, x * (1 - np.exp(-tl / 0.0003)) * (1.0 if k % 2 == 0 else 0.85), k * step)
        k += 1
    return lp(y, 9000, 2)


def wind(dur, r, strength=0.6):
    """real wind (not the cartoon speed rush): gusting air with a hollow howl that wanders. Stereo."""
    n = ns(dur)
    t = np.arange(n) / SR
    gust = 0.55 + 0.45 * smooth_noise(n, r, 0.3)
    wander = smooth_noise(n, r, 0.4)
    out = np.zeros((2, n))
    for ch in range(2):
        body = _unit(hp(lp(colored(n, r, 1.3), 650, 2), 40, 2)) * gust
        howl = _band(n, r, lambda T: 430.0 * 2 ** (0.8 * np.interp(T, t, wander)), 0.3, 0.5, 2048, 512) * gust ** 2 * (0.25 + 0.5 * strength)
        out[ch] = body + howl + _unit(bp(colored(n, r, 0.4), 1800, 6000, 1)) * gust ** 3 * 0.1
    return out


def rain(dur, r, heavy=0.5):
    """rain: a steady hiss, drops pattering on things, a little low weight (heavy = 0 drizzle .. 1 downpour). Stereo."""
    n = ns(dur)
    out = np.zeros((2, n))
    for ch in range(2):
        hiss = _unit(bp(colored(n, r, 0.2), 1600, 9000, 1)) * (0.85 + 0.15 * smooth_noise(n, r, 1.2))
        out[ch] = hiss * (0.35 + 0.5 * heavy) + _clicks(dur, r, 90.0 + 260.0 * heavy, 1500, 6500, (0.0015, 0.005)) * 0.9
        out[ch] += _unit(hp(lp(colored(n, r, 1.4), 380, 2), 40, 2)) * 0.3
    return lp(out, 9000, 2)


def fire(dur, r, size=0.5):
    """a fire burning (campfire .. lava): low fluttering roar, hiss, crackles and now and then a pop. Stereo."""
    n = ns(dur)
    out = np.zeros((2, n))
    for ch in range(2):
        low = _unit(hp(lp(colored(n, r, 1.5), 420, 2), 45, 2)) * (0.6 + 0.4 * smooth_noise(n, r, 6.0)) * (0.25 + 0.5 * size)
        hiss = _unit(bp(colored(n, r, 0.3), 2400, 7000, 1)) * 0.07 * (0.6 + 0.4 * smooth_noise(n, r, 3.0))
        out[ch] = low + hiss + _clicks(dur, r, 14.0, 1200, 5200, (0.002, 0.007)) * 1.6 + _clicks(dur, r, 2.0, 500, 1500, (0.006, 0.015)) * 1.2
    return out


def drone(dur, r):
    """the hum of empty space, a spaceship, a machine hall: a low open fifth that breathes, and a little air. Stereo."""
    n = ns(dur)
    t = np.arange(n) / SR
    out = np.zeros((2, n))
    for ch in range(2):
        y = np.zeros(n)
        for f, a in [(55.0, 0.5), (82.5, 0.5), (110.0, 0.8), (165.0, 0.6), (220.4, 0.6), (330.2, 0.4), (440.7, 0.25), (660.5, 0.12)]:
            y += a * (0.7 + 0.3 * smooth_noise(n, r, 0.12)) * np.sin(phase(f * (1 + 0.002 * smooth_noise(n, r, 0.2))) + r.uniform(0, TAU))
        out[ch] = 0.4 * y + _unit(bp(colored(n, r, 1.0), 1400, 5000, 1)) * 0.08 * (0.6 + 0.4 * smooth_noise(n, r, 0.25))
    return out


def room_tone(dur, r):
    """indoor quiet: soft air and a faint mains hum, so that a room is never dead silent. Stereo."""
    n = ns(dur)
    t = np.arange(n) / SR
    out = np.zeros((2, n))
    for ch in range(2):
        out[ch] = _unit(hp(lp(colored(n, r, 1.2), 400, 2), 50, 2)) + 0.35 * _unit(bp(colored(n, r, 1.0), 300, 2500, 1))
        out[ch] += 0.08 * np.sin(TAU * 100 * t + r.uniform(0, TAU)) + 0.04 * np.sin(TAU * 200 * t + r.uniform(0, TAU))
    return out


def soft_step(r):
    """one step on grass, carpet or sand: a dull thud and a little rustle"""
    t = tt(0.26)
    nz = r.standard_normal(len(t))
    thud_ = np.exp(-t / 0.035) * np.sin(phase(r.uniform(75, 100) * (1 + 0.3 * np.exp(-t / 0.012)))) * 1.1
    return fades(thud_ + lp(nz, 500, 2) * np.exp(-t / 0.03) * 0.8 + bp(nz, 1400, 5500, 1) * np.clip(t / 0.015, 0, 1) * np.exp(-t / 0.05) * 0.22, 0.0, 0.03)


def steps(times, r, soft=False):
    """somebody walking: one step at every time (s), left and right feet a little different. Stereo."""
    out = np.zeros((2, ns(max(times) + 0.4)))
    for i, tm in enumerate(times):
        x = soft_step(r) if soft else fades(stroll_step(r, 0.5), 0.0, 0.03)
        seg = pan(x * (1.0 if i % 2 == 0 else 0.88), -0.12 if i % 2 == 0 else 0.12)
        k = ns(tm)
        out[:, k:k + seg.shape[1]] += seg[:, : out.shape[1] - k]
    return out


def door_slam(r):
    """a door slammed shut: heavy thump, the panel's wooden ring, the latch, the frame rattling"""
    dur = 0.75
    t = tt(dur)
    y = np.exp(-t / 0.07) * np.sin(phase(72 * (1 + 0.6 * np.exp(-t / 0.012)))) * 1.0
    y += modal(dur, [(148, 1.0, 0.08), (287, 0.9, 0.06), (505, 0.8, 0.045), (910, 0.6, 0.03), (1630, 0.35, 0.018)], r, glide=0.04) * (1 - np.exp(-t / 0.0005)) * 2.2
    y += bp(r.standard_normal(len(t)), 250, 4500, 1) * np.exp(-t / 0.008) * 2.0
    _place_mono(y, clink(r, 2600.0, 0.1) * 0.45, 0.014)
    _place_mono(y, rattle(0.3, r, 40, np.exp(-np.linspace(0, 1, ns(0.3)) * 3), heavy=True) * 0.18, 0.03)
    return fades(y, 0.0, 0.1)


def knock(r, count=3, gap=0.17):
    """knuckles on a wooden door: knock knock knock"""
    y = np.zeros(ns((count - 1) * gap + 0.3))
    for i in range(count):
        tl = tt(0.2)
        x = modal(0.2, [(205, 1.0, 0.03), (415, 0.7, 0.022), (770, 0.4, 0.014), (1340, 0.2, 0.008)], r, glide=0.06, glide_tau=0.008)
        x += bp(r.standard_normal(len(tl)), 500, 3500, 1) * np.exp(-tl / 0.004) * 0.6
        _place_mono(y, x * (1 - np.exp(-tl / 0.0004)) * (1.0, 0.82, 0.92)[i % 3], i * gap * r.uniform(0.96, 1.04))
    return y


def alarm(dur, r, kind="beep"):
    """an alarm for `dur` s. beep = digital, four beeps a second; siren = two-tone hi-lo; bell = alarm clock
    (a hammer rattling on a small bell)"""
    n = ns(dur)
    t = np.arange(n) / SR
    if kind == "beep":
        ph = TAU * 1976.0 * t
        y = (np.sin(ph) + 0.33 * np.sin(3 * ph) + 0.15 * np.sin(5 * ph)) * lp(((t % 0.25) < 0.12).astype(float), 400, 1)
    elif kind == "siren":
        ph = phase(495.0 + 165.0 * lp(((t % 1.0) < 0.5).astype(float), 40, 1))
        y = lp(sum(k ** -1.1 * np.sin(k * ph + 0.7 * k) for k in range(1, 13)), 5000, 2)
    else:
        y = np.zeros(n + ns(0.3))
        k = 0
        while k / 14.0 < dur:
            tl = tt(0.25)
            x = modal(0.25, [(2100, 1.0, 0.12), (2117, 0.6, 0.1), (5630, 0.4, 0.05), (8200, 0.2, 0.02)], r) * (1 - np.exp(-tl / 0.0004))
            _place_mono(y, x + hp(r.standard_normal(len(tl)), 3000) * np.exp(-tl / 0.001) * 0.3, k / 14.0)
            k += 1
        y = y[:n] * np.clip((dur - t) / 0.05, 0, 1)
    return fades(y, 0.002, 0.03)


def plop(r):
    """something small drops into water: a hollow plop whose pitch rises, a column of bubbles, a few drips"""
    dur = 0.7
    n = ns(dur)
    t = np.arange(n) / SR
    y = np.exp(-t / 0.06) * np.sin(phase(210 + 420 * np.clip(t / 0.09, 0, 1) ** 1.5)) * (1 - np.exp(-t / 0.002)) * 1.3
    y += bp(r.standard_normal(n), 400, 5000, 1) * np.exp(-t / 0.012) * 0.6
    return fades(y + bubbles(dur, r, 120 * np.exp(-t / 0.15) + 3, 350, 2600, (0.006, 0.025), np.exp(-t / 0.25)) * 0.8, 0.0, 0.1)


def thud(r, weight=1.0):
    """something heavy and soft hits the floor (a body, a sack, a book): low thump, no ring"""
    t = tt(0.45)
    nz = r.standard_normal(len(t))
    gl = 1 + 0.7 * np.exp(-t / 0.014)
    y = np.exp(-t / (0.06 * weight)) * np.sin(phase(78 / weight ** 0.3 * gl)) + 0.6 * np.exp(-t / 0.045) * np.sin(phase(156 / weight ** 0.3 * gl) + 0.4)
    return fades(y + lp(nz, 600, 2) * np.exp(-t / 0.028) * 2.0 + bp(nz, 150, 900, 1) * np.exp(-t / 0.035) * 3.0 + bp(nz, 300, 2800, 1) * np.exp(-t / 0.009) * 1.5, 0.0, 0.08)


def crash(r):
    """something big falls over or breaks: splintering crack and boom, then bits clattering down"""
    y = np.zeros(ns(1.9))
    wc = wood_crack(r)
    _place_mono(y, wc - 0.8 * lp(wc, 110, 2), 0.0)             # less sub boom: it has to read on a phone
    _place_mono(y, rattle(1.0, r, 45, np.exp(-np.linspace(0, 1, ns(1.0)) * 3.0), heavy=True) * 0.5, 0.06)
    for i in range(7):
        tm = r.uniform(0.15, 1.1)
        k = modal(0.2, [(r.uniform(180, 420), 1.0, 0.03), (r.uniform(500, 1100), 0.6, 0.02), (r.uniform(1300, 2800), 0.3, 0.01)], r)
        _place_mono(y, k * r.uniform(0.3, 0.8) * np.exp(-tm / 0.5), tm)
    return fades(y, 0.0, 0.2)


def clang(r, f=310.0):
    """a big piece of metal struck (pipe, pan, anvil, hull): bright hit and a long inharmonic ring"""
    dur = 1.5
    t = tt(dur)
    md = [(f, 1.0, 0.5), (f * 2.23, 0.8, 0.38), (f * 3.64, 0.6, 0.26), (f * 6.03, 0.45, 0.16), (f * 8.5, 0.3, 0.09), (f * 11.2, 0.18, 0.05)]
    y = modal(dur, md, r) * (1 - np.exp(-t / 0.0004)) + bp(r.standard_normal(len(t)), 500, 7000, 1) * np.exp(-t / 0.004) * 1.2
    return fades(y, 0.0, 0.2)


def bell(r, f=392.0, dur=2.8):
    """one stroke of a big bell (clock tower, school, ship): strike, then hum, prime, tierce, quint and nominal"""
    t = tt(dur)
    md = [(f * 0.5, 0.45, 2.3), (f, 1.0, 1.7), (f * 1.19, 0.6, 1.2), (f * 1.5, 0.35, 0.9), (f * 2.0, 0.7, 1.0), (f * 2.51, 0.25, 0.5),
          (f * 3.01, 0.2, 0.4), (f * 4.17, 0.12, 0.22)]
    y = modal(dur, md, r) * (1 - np.exp(-t / 0.0008)) + bp(r.standard_normal(len(t)), 600, 5000, 1) * np.exp(-t / 0.006) * 0.5
    return fades(y, 0.0, 0.4)


def buzzer(r, dur=0.5, f=116.5):
    """game-show 'wrong!' buzzer: two rough low tones a little apart"""
    n = ns(dur)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for f0 in (f, f * 1.065):
        ph = TAU * f0 * t + r.uniform(0, TAU)
        for k in range(1, int(3400 / f0) + 1):
            y += np.sin(k * ph) / k
    return lp(y * np.clip(t / 0.004, 0, 1) * np.clip((dur - t) / 0.012, 0, 1), 3200, 2)


def tick_click(r, f=1900.0, weight=1.0):
    """one small mechanical click (a switch, a button, a key)"""
    tl = tt(0.06)
    x = modal(0.06, [(f, 1.0, 0.004), (f * 1.74, 0.6, 0.003), (f * 0.33, 0.5 * weight, 0.009)], r)
    return (x + hp(r.standard_normal(len(tl)), 2500) * np.exp(-tl / 0.0009) * 0.5) * (1 - np.exp(-tl / 0.0003))


def camera_click(r):
    """camera shutter: click, tiny whirr, clack"""
    y = np.zeros(ns(0.3))
    _place_mono(y, tick_click(r, 2600.0, 1.2), 0.0)
    _place_mono(y, tick_click(r, 2100.0, 1.0) * 0.8, 0.075)
    tl = tt(0.09)
    _place_mono(y, bp(r.standard_normal(len(tl)), 900, 3000, 1) * np.sin(np.pi * tl / 0.09) ** 2 * 0.06, 0.005)
    return lp(y, 9000, 2)


def typing(dur, r, rate=9.0):
    """somebody typing: key clicks in bursts, the first one at 0"""
    y = np.zeros(ns(dur + 0.08))
    tm = 0.0
    while tm < dur:
        _place_mono(y, tick_click(r, r.uniform(1500, 2600), 1.5) * r.uniform(0.6, 1.0), tm)
        tm += r.exponential(1.0 / rate) * 0.6 + 0.4 / rate + (r.uniform(0.15, 0.35) if r.uniform() < 0.12 else 0.0)
    return lp(y, 9000, 2)


def power_sweep(r, up=True, dur=0.7):
    """a machine powering up (pitch and shimmer rise to a held tone) or down (it sinks and dies)"""
    n = ns(dur)
    t = np.arange(n) / SR
    u = t / dur
    w = np.clip(1.25 * u ** 0.7, 0, 1) if up else 1 - u ** 1.3
    ph = phase(170.0 * (1500.0 / 170.0) ** w)
    y = (np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)) * (1 - 0.3 * (0.5 + 0.5 * np.sin(phase(10 + 25 * w))))
    env = np.clip(t / 0.01, 0, 1) * (np.clip((dur - t) / 0.08, 0, 1) if up else (1 - u) ** 0.8)
    return fades(lp(y * env, 8000, 2), 0.0, 0.03)


def zap(r, dur=0.32):
    """electric spark or shock: a ragged crackle that buzzes at mains rate"""
    n = ns(dur)
    t = np.arange(n) / SR
    rag = np.clip(smooth_noise(n, r, 70.0) * 1.5 + 0.4, 0, 1) ** 2
    y = bp(r.standard_normal(n), 1500, 9000, 2) * (0.25 + 0.75 * (np.sin(TAU * 100 * t + r.uniform(0, TAU)) > 0)) * rag
    y += 0.25 * np.sin(phase(2600 + 900 * smooth_noise(n, r, 40.0))) * rag
    y = y * np.exp(-t / (0.4 * dur)) + hp(r.standard_normal(n), 2000) * np.exp(-t / 0.004) * 0.8      # the first spark
    return fades(lp(y, 9500, 2), 0.0, 0.04)


def squeak(r, dur=0.2):
    """rubber-toy squeak (also a mouse, a squeaky shoe): a nasal tone that arcs up and back"""
    n = ns(dur)
    t = np.arange(n) / SR
    u = t / dur
    ph = phase(1500.0 * 2 ** (0.8 * np.sin(np.pi * u ** 0.8)) * (1 + 0.01 * np.sin(TAU * 45 * t)))
    env = (1 - np.exp(-t / 0.004)) * np.sin(np.pi * np.clip(u, 0, 1)) ** 0.5
    y = (np.sin(ph) + 0.45 * np.sin(2 * ph + 0.3) + 0.2 * np.sin(3 * ph + 0.9) + 0.04 * hp(r.standard_normal(n), 3000)) * env
    return fades(lp(y, 9500, 2), 0.0, 0.02)


def drip(r):
    """one drop of water into water: a plink that bends up, and its small echo"""
    y = np.zeros(ns(0.4))
    for tm, g, f0 in [(0.0, 1.0, r.uniform(1100, 1500)), (0.085, 0.35, r.uniform(1700, 2300))]:
        tl = tt(0.2)
        _place_mono(y, np.exp(-tl / 0.03) * np.sin(phase(f0 * (1 + 7.0 * tl))) * (1 - np.exp(-tl / 0.0008)) * g, tm)
    return fades(y, 0.0, 0.05)


def bonk(r):
    """cartoon bonk on the head: a hollow wooden knock that dips in pitch"""
    dur = 0.3
    t = tt(dur)
    y = modal(dur, [(520, 1.0, 0.05), (1035, 0.45, 0.03), (1660, 0.25, 0.015)], r, glide=0.25, glide_tau=0.012)
    y += np.exp(-t / 0.03) * np.sin(phase(120 * (1 + 0.5 * np.exp(-t / 0.01)))) * 0.6
    y += bp(r.standard_normal(len(t)), 600, 4000, 1) * np.exp(-t / 0.003) * 0.5
    return fades(y * (1 - np.exp(-t / 0.0004)), 0.0, 0.05)


def tweet(r, chips=4):
    """one small bird saying something: a few quick chirps, the first at 0"""
    y = np.zeros(ns(0.2 * chips + 0.2))
    tm = 0.0
    for j in range(chips):
        L = r.uniform(0.05, 0.09)
        tl = tt(L)
        f = r.uniform(3200, 4600) * (1 - 0.3 * tl / L) if r.uniform() < 0.6 else r.uniform(2800, 3800) * (1 + 0.35 * tl / L)
        _place_mono(y, np.sin(phase(f)) * np.sin(np.pi * tl / L) ** 2 * r.uniform(0.6, 1.0), tm)
        tm += L + r.uniform(0.03, 0.08)
    return y


def car_pass(dur, r):
    """a car driving past, left to right: an engine note that drops as it passes (Doppler) and tyre noise. Stereo."""
    n = ns(dur)
    t = np.arange(n) / SR
    x = (t - 0.45 * dur) / (0.18 * dur)                 # position: 0 = right in front
    dop = 1 - 0.11 * x / np.sqrt(1 + x * x)
    amp = (1 + x * x) ** -0.75
    ph = phase(96.0 * dop)
    eng = np.zeros(n)
    for k in range(1, 15):
        eng += k ** -0.9 * np.sin(k * ph + r.uniform(0, TAU)) * (1.0 if k % 2 else 0.6)
    eng = _unit(lp(eng, 1500, 2) * (1 + 0.25 * np.sin(ph / 2)))
    y = (0.5 * eng + 0.9 * _band(n, r, lambda T: 1300.0 * np.interp(T, t, dop) ** 3, 0.9, 0.5) * amp ** 0.5) * amp
    th = (np.clip(x / 2.5, -1, 1) * 0.75 + 1) * np.pi / 4
    return fades(np.stack([y * np.cos(th), y * np.sin(th)]) * np.sqrt(2), 0.005, 0.1)
