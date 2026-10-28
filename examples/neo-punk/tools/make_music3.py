"""Acid-punk score for "Vefþróun með gervigreind" (v3), synthesized in code.

132 BPM, E minor (Em-C-G-D). Raw punk drums, fuzz bass, power chords, and a squelchy 303-style acid line
that plays the AI. The arrangement follows storyboard/scenes-data3.js (scene lengths in bars) and hits
the picture's cues: snaps, the code-tower collapse, title slams, the bug, the stamp, the price stop.

usage: .venv/bin/python -I tools/make_music3.py <project_dir>
"""
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, lfilter, sosfilt

SR = 44100
BPM = 132
BEAT = 60 / BPM
BAR = BEAT * 4
rng = np.random.default_rng(11)


def scene_bars(proj):
    src = (proj / "storyboard" / "scenes-data3.js").read_text()
    return [int(b) for b in re.findall(r'id:\s*\d+,\s*title:.*?bars:\s*(\d+)', src)]


def lp(x, f, order=2):
    return sosfilt(butter(order, min(f, SR / 2 - 100), "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def saw(f, d, det=0.0):
    t = tt(d)
    return 2 * ((t * f * (1 + det) + rng.random()) % 1.0) - 1


def env(n, a=0.002, d=0.2, s=0.0, r=0.02):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * (s + (1 - s) * np.exp(-t / max(d, 1e-4)))
    k = int(r * SR)
    if k and n > k:
        e[-k:] *= np.linspace(1, 0, k)
    return e


class Track:
    def __init__(self, n):
        self.buf = np.zeros(n)

    def add(self, sig, at, gain=1.0):
        i = int(round(at * SR))
        if i >= len(self.buf) or i < 0:
            return
        j = min(len(self.buf), i + len(sig))
        self.buf[i:j] += sig[: j - i] * gain


# ---------- drums: rawer than v2 ----------
def kick():
    t = tt(0.32)
    f = 52 + 140 * np.exp(-t * 34)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    s[:80] += rng.uniform(-1, 1, 80) * np.linspace(0.7, 0, 80)
    return np.tanh(s * 2.2)


def snare(big=False):
    t = tt(0.4 if big else 0.25)
    n = bp(rng.uniform(-1, 1, len(t)), 700, 7000) * np.exp(-t * (7 if big else 13))
    body = np.sin(2 * np.pi * 200 * t) * np.exp(-t * 30)
    return np.tanh((n * 1.5 + body * 0.9) * 1.6)


def hat(open_=False):
    t = tt(0.22 if open_ else 0.05)
    return hp(rng.uniform(-1, 1, len(t)), 6500) * np.exp(-t * (13 if open_ else 80))


def tom(f0=110):
    t = tt(0.35)
    f = f0 + f0 * 0.8 * np.exp(-t * 20)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8) * 1.5)


def crash():
    t = tt(2.0)
    return hp(rng.uniform(-1, 1, len(t)), 4000) * np.exp(-t * 1.9)


def riser(d):
    t = tt(d)
    n = rng.uniform(-1, 1, len(t))
    out = np.zeros_like(n)
    for k in range(20):
        a, b = int(k * len(n) / 20), int((k + 1) * len(n) / 20)
        f = 400 * (10000 / 400) ** (k / 20)
        out[a:b] = bp(n, f * 0.7, min(f * 1.4, 19000))[a:b]
    return out * (t / d) ** 2


# ---------- tonal ----------
def fuzz_bass(m, d):
    s = saw(mtof(m), d) + 0.6 * saw(mtof(m) * 1.003, d)
    s = np.tanh(s * 4.0)
    s = lp(s, 1500)
    return s * env(len(s), 0.002, 0.12, 0.5, 0.015)


def power(m, d, chug=True):
    s = np.zeros(int(d * SR))
    for iv in (0, 7, 12):
        for det in (-0.006, 0.0, 0.006):
            s += saw(mtof(m + iv), d, det)
    s = np.tanh(s * 4.5)            # fuzzier than v2
    s = lp(s, 3000 if chug else 3800)
    return s * env(len(s), 0.002, 0.06 if chug else 0.8, 0.0 if chug else 0.4, 0.02) * 0.45


def stab(ms, d):
    s = np.zeros(int(d * SR))
    for m in ms:
        for det in (-0.01, 0.01):
            t = tt(d)
            s += np.where((t * mtof(m) * (1 + det)) % 1 < 0.5, 1.0, -1.0)
    return lp(np.tanh(s), 3500) * env(len(s), 0.002, 0.15, 0.0, 0.02) * 0.4


def acid_line(notes, length):
    """notes: list of (start_s, midi, dur_s, accent, slide). 303-style: saw -> resonant LP with per-note env."""
    n = int(length * SR)
    f = np.zeros(n)
    amp = np.zeros(n)
    cut = np.zeros(n)
    for (st, m, d, acc, slide) in notes:
        a, b = int(st * SR), min(n, int((st + d) * SR))
        if a >= n:
            continue
        f[a:b] = mtof(m)
        k = np.arange(b - a) / SR
        amp[a:b] = np.minimum(1, k / 0.003) * (0.9 if acc else 0.7)
        cut[a:b] = (300 + (2600 if acc else 1300) * np.exp(-k / (0.09 if acc else 0.06)))
        if b - a > 200:
            amp[b - 200:b] *= np.linspace(1, 0, 200)
    # glide: smooth frequency a little
    f = lfilter([0.02], [1, -0.98], f)
    ph = np.cumsum(f) / SR
    s = 2 * (ph % 1.0) - 1
    out = np.zeros(n)
    zi = np.zeros(2)
    blk = 128
    Q = 7.0
    for i in range(0, n, blk):
        fc = max(80.0, cut[i])
        w0 = 2 * np.pi * fc / SR
        al = np.sin(w0) / (2 * Q)
        cw = np.cos(w0)
        bq = np.array([(1 - cw) / 2, 1 - cw, (1 - cw) / 2])
        aq = np.array([1 + al, -2 * cw, 1 - al])
        y, zi = lfilter(bq / aq[0], aq / aq[0], s[i:i + blk], zi=zi)
        out[i:i + blk] = y
    return np.tanh(out * amp * 2.2) * 0.6


CHORDS = [40, 36, 43, 38]  # E2, C2, G2, D2 roots (Em-C-G-D)
# acid pattern (16 steps per bar): semitone offset from E, accent, slide; None = rest
ACID = [(0, 1, 0), (12, 0, 0), None, (0, 0, 1), (10, 1, 0), None, (7, 0, 0), (12, 1, 1),
        (0, 0, 0), None, (3, 1, 0), (5, 0, 1), (7, 1, 0), None, (10, 0, 0), (12, 1, 0)]


def main():
    proj = Path(sys.argv[1]).resolve()
    bars = scene_bars(proj)
    starts = np.cumsum([0] + bars)
    S = lambda i: int(starts[i - 1])
    total = int(starts[-1])
    length = total * BAR + 3.0
    n = int(length * SR)
    dr, ba, gt, fx = Track(n), Track(n), Track(n), Track(n)
    K, SN, SNB, CR = kick(), snare(), snare(True), crash()
    at = lambda bar, beat=0.0: bar * BAR + beat * BEAT

    # ---- section per bar ----
    sec = ["verse"] * total
    def put(a, b, v):
        for k in range(int(a), int(b)):
            sec[k] = v
    put(S(1), S(1) + 2, "acid_solo"); put(S(1) + 2, S(1) + 4, "verse"); put(S(1) + 4, S(2), "chorus")
    put(S(2), S(2) + 3, "slams"); put(S(2) + 3, S(3), "verse")
    put(S(4), S(4) + 2, "build"); put(S(4) + 2, S(5), "chorus")
    put(S(5), S(5) + 2, "verse"); put(S(5) + 2, S(5) + 4, "acid_drive"); put(S(5) + 4, S(5) + 6, "tension"); put(S(5) + 6, S(6), "chorus")
    put(S(8), S(9), "light")
    put(S(9), S(10), "chorus")
    put(S(10), S(10) + 2, "muffled"); put(S(10) + 2, S(11), "chorus")
    put(S(12), S(12) + 2, "tension")
    put(S(13), S(14), "build")
    put(S(14), S(14) + 3, "chorus"); put(S(14) + 3, total, "outro")

    acid_notes = []
    for bar in range(total):
        s = sec[bar]
        root = CHORDS[bar % 4]
        t0 = at(bar)
        if s in ("verse", "chorus", "acid_drive", "light", "tension", "build"):
            half = s == "tension"
            for k in range(4):
                if half and k % 2:
                    continue
                dr.add(K, at(bar, k), 0.9)
                if s in ("chorus", "acid_drive") :
                    dr.add(K, at(bar, k + 0.5), 0.45) if k in (1, 3) else None
            if s != "build":
                for k in ([2] if half else [1, 3]):
                    dr.add(SN, at(bar, k), 0.8)
            for k in range(8):
                dr.add(hat(open_=(s == "chorus" and k % 2 == 1)), at(bar, k / 2), 0.25 if k % 2 else 0.35)
        if s == "build":
            for k in range(16 if bar % 2 else 8):
                step = 0.25 if bar % 2 else 0.5
                dr.add(SN, at(bar, k * step), 0.2 + 0.04 * k)
            if bar % 2 == 0:
                fx.add(riser(BAR * 2), t0, 0.32)
        # bass
        if s in ("verse", "chorus", "acid_drive", "light", "build", "tension", "muffled"):
            for k in range(8):
                if s == "tension" and k % 2:
                    continue
                ba.add(fuzz_bass(root + (12 if s == "chorus" and k % 4 == 3 else 0), BEAT / 2 * 0.92), at(bar, k / 2), 0.8)
        # guitars
        if s in ("chorus", "verse"):
            for k in range(8):
                if s == "verse" and k % 2:
                    continue
                gt.add(power(root + 12, BEAT / 2, True), at(bar, k / 2), 0.4 if s == "chorus" else 0.28)
            if s == "chorus" and bar % 2 == 0:
                gt.add(power(root + 12, BAR * 0.98, False), t0, 0.22)
                fx.add(CR, t0, 0.22)
        # acid
        if s in ("acid_solo", "acid_drive", "slams", "outro", "chorus", "muffled"):
            for k, st in enumerate(ACID):
                if st is None:
                    continue
                if s == "chorus" and k % 2:
                    continue
                off, acc, sl = st
                acid_notes.append((at(bar, k / 4), 52 + off + (root - 40), BEAT / 4 * (1.6 if sl else 0.9), acc, sl))

    # ---- picture cues ----
    # S1: drums crash in on the snap to blue (beat 8), collapse at beat 18
    fx.add(CR, at(S(1), 8), 0.35); dr.add(SNB, at(S(1), 8), 0.8)
    fx.add(riser(BEAT * 4), at(S(1), 14), 0.3)
    fx.add(CR, at(S(1), 18), 0.45); dr.add(K, at(S(1), 18), 1.1); gt.add(power(52, BAR * 0.9, False), at(S(1), 18), 0.35)
    # S2: three title slams
    for k in (0, 4, 8):
        dr.add(K, at(S(2), k), 1.1); dr.add(SNB, at(S(2), k), 0.9); fx.add(CR, at(S(2), k), 0.35)
        gt.add(power(52 if k != 4 else 48, BEAT * 3.5, False), at(S(2), k), 0.4)
    # S4 drop
    fx.add(CR, at(S(4), 8), 0.45)
    # S5: shout stabs on "lýstu", scratch on the bug, stamp
    for k in (1, 3, 5):
        gt.add(stab([64, 67, 71], BEAT * 0.5), at(S(5), k), 0.5)
    bug = at(S(5), 20)
    st_ = tt(0.4)
    fsc = 1000 * np.exp(-st_ * 8) + 70
    fx.add(np.tanh(np.sin(2 * np.pi * np.cumsum(fsc) / SR) * np.exp(-st_ * 4) * 3), bug, 0.4)
    dr.add(SNB, at(S(5), 28), 1.0); fx.add(CR, at(S(5), 28), 0.45); dr.add(K, at(S(5), 28), 1.0)
    # S6: a tom on every tile landing
    for i in range(6):
        dr.add(tom(140 - i * 12), at(S(6), 1 + i * 2), 0.7)
    # S7: score cards
    for i in range(3):
        dr.add(SNB, at(S(7), 10 + i * 0.5), 0.6)
    # S9: crash on each poster swap
    for i in range(4):
        fx.add(CR, at(S(9), i * 4), 0.3)
    # S10: sun cut
    fx.add(CR, at(S(10), 8), 0.45); dr.add(SNB, at(S(10), 8), 0.8)
    # S11: riser into the badge flip
    fx.add(riser(BEAT * 4), at(S(11), 0), 0.3); fx.add(CR, at(S(11), 4), 0.4)
    # S12: stop then bass drop
    stop_a, stop_b = int(at(S(12), 7) * SR), int(at(S(12), 8) * SR)
    ba.add(fuzz_bass(28, BAR * 0.9) * 1.4, at(S(12), 8), 1.0); dr.add(K, at(S(12), 8), 1.2); fx.add(CR, at(S(12), 8), 0.45)
    # S14: final hit
    fin = at(S(14), 23)
    dr.add(K, fin, 1.2); dr.add(SNB, fin, 1.0); fx.add(CR, fin, 0.55)
    ring = power(40, length - fin, False) * 1.0 + power(47, length - fin, False) * 0.6
    gt.add(ring, fin, 0.6)

    acid = Track(n)
    acid.buf[:] = acid_line(acid_notes, length)[:n]

    # muffled sleet: filter the scene-10 opening
    a, z = int(at(S(10)) * SR), int(at(S(10), 8) * SR)
    for tr in (dr, ba, gt, acid):
        tr.buf[a:z] = lp(tr.buf[a:z], 600)
    for tr in (dr, ba, gt, acid, fx):
        tr.buf[stop_a:stop_b] *= 0.0
    # nothing after the final hit except the ring
    for tr in (dr, ba, acid):
        tr.buf[int((fin + 0.4) * SR):] *= 0

    mix = dr.buf * 0.9 + ba.buf * 0.55 + gt.buf * 0.75 + acid.buf * 0.55 + fx.buf * 0.7
    mix = hp(mix, 30)
    mix = lp(mix, 11000)
    mix = np.tanh(mix * 1.2) / np.tanh(1.2)
    fade = int(1.5 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)
    mix = mix / np.max(np.abs(mix)) * 0.7
    right = np.concatenate([np.zeros(int(0.011 * SR)), mix])[: len(mix)]
    st = np.stack([mix * 0.97 + right * 0.03, mix * 0.6 + right * 0.4], axis=1)
    out = proj / "assets" / "music"
    out.mkdir(parents=True, exist_ok=True)
    with wave.open(str(out / "score.wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(st, -1, 1) * 32767).astype("<i2").tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(out / "score.wav"), "-b:a", "192k", str(out / "score.mp3")], check=True)
    print(f"bars {total}  length {length:.2f}s")


main()
