"""Score and sound effects for 'View Source', written in code.

Music: 120 BPM in A minor (Am F C G), a bar every 2 s, so every cut in the film
lands on a beat. Near silence while the page is inspected, a drop when the
camera dives into the letters (10 s), a build into the guide page (54-58 s),
a breakdown for "made from one message" (66 s) and one last chord (69.5 s).

Effects: every effect has a cause on screen; the times below are copied from
the scene files (compositions/*.html), in film seconds.

usage: .venv/bin/python -I tools/make_music.py <project_dir>
writes assets/audio/music.mp3 and assets/audio/sfx.mp3
"""
import subprocess, sys
from pathlib import Path
import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
BPM = 120
BEAT = 60 / BPM          # 0.5 s
BAR = 4 * BEAT           # 2 s
LENGTH = 74.0
N = int(SR * LENGTH)
rng = np.random.default_rng(42)

NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}
def hz(name):
    n, o = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((NOTE[n] + 12 * (o + 1) - 69) / 12)

CHORDS = {  # bass root, chord tones (pad), arp tones
    "Am": ("A1", ["A3", "C4", "E4"], ["A4", "C5", "E5", "A5"]),
    "F":  ("F1", ["F3", "A3", "C4"], ["F4", "A4", "C5", "F5"]),
    "C":  ("C2", ["G3", "C4", "E4"], ["E4", "G4", "C5", "E5"]),
    "G":  ("G1", ["G3", "B3", "D4"], ["D4", "G4", "B4", "D5"]),
}
PROG = ["Am", "F", "C", "G"]

def chord_at(t):
    return PROG[int(t // BAR) % 4]

# ---------- helpers ----------
def sos(kind, f, order=2):
    return butter(order, f, btype=kind, fs=SR, output="sos")

def env(n, a, d, sustain=0.0, curve=4.0):
    """attack seconds, decay seconds (exponential)"""
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-6), sustain + (1 - sustain) * np.exp(-(t - a) * curve / max(d, 1e-6)))
    return e

def place(buf, sig, t, gain=1.0):
    i = int(round(t * SR))
    if i >= len(buf): return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain

def saw(f, n, detune=0.0):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for d in (-detune, 0.0, detune):
        ph = (t * f * (1 + d)) % 1.0
        out += 2 * ph - 1
    return out / 3

def sine(f, n):
    return np.sin(2 * np.pi * f * np.arange(n) / SR)

def noise(n):
    return rng.uniform(-1, 1, n)

# ---------- instruments ----------
def kick():
    n = int(0.38 * SR); t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t * 28)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    click = sosfilt(sos("highpass", 1500), noise(n)) * np.exp(-t * 300) * 0.4
    return np.tanh(1.6 * (body + click))

def clap():
    n = int(0.22 * SR); t = np.arange(n) / SR
    nz = sosfilt(sos("bandpass", [900, 4000]), noise(n))
    e = np.exp(-t * 22)
    for off in (0.0, 0.011, 0.022):  # three hands
        k = int(off * SR); e[k:k + 60] += 0.6
    return nz * e * 0.9 + sine(190, n) * np.exp(-t * 40) * 0.3

def hat(open_=False):
    n = int((0.16 if open_ else 0.045) * SR); t = np.arange(n) / SR
    return sosfilt(sos("highpass", 7000), noise(n)) * np.exp(-t * (18 if open_ else 90))

def bass_note(f, dur):
    n = int(dur * SR)
    s = saw(f, n, 0.004) * 0.7 + sine(f, n) * 0.6
    s = sosfilt(sos("lowpass", 420), s)
    return s * env(n, 0.005, dur * 0.9, 0.3, 3)

def pad_chord(notes, dur, cutoff=1400):
    n = int(dur * SR)
    s = sum(saw(hz(x), n, 0.006) for x in notes) / len(notes)
    s = sosfilt(sos("lowpass", cutoff), s)
    a = min(0.4, dur / 3)
    t = np.arange(n) / SR
    e = np.clip(t / a, 0, 1) * np.clip((dur - t) / 0.25, 0, 1)
    return s * e

def pluck(f, dur=0.32, bright=3200):
    n = int(dur * SR); t = np.arange(n) / SR
    s = saw(f, n, 0.002) * 0.6 + np.sign(sine(f, n)) * 0.25
    s = sosfilt(sos("lowpass", bright), s)
    return s * np.exp(-t * 11)

def lead(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t)
    ph = np.cumsum(f * vib) / SR
    s = (2 * (ph % 1) - 1) * 0.5 + np.sign(np.sin(2 * np.pi * ph)) * 0.3
    s = sosfilt(sos("lowpass", 2600), s)
    return s * env(n, 0.01, dur, 0.55, 2) * np.clip((dur - t) / 0.06, 0, 1)

def riser(dur):
    n = int(dur * SR); t = np.arange(n) / SR
    out = np.zeros(n)
    nz = noise(n)
    # sweep a band of noise upwards in slices
    slices = 40
    for k in range(slices):
        a, b = k * n // slices, (k + 1) * n // slices
        fc = 300 * (1 + 25 * (k / slices) ** 2)
        out[a:b] = sosfilt(sos("bandpass", [fc * 0.7, min(fc * 1.4, 18000)]), nz[a:b])
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2 * t / dur)) / SR) * 0.25
    return (out * 0.8 + tone) * (t / dur) ** 2

def impact():
    n = int(2.2 * SR); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(40 + 60 * np.exp(-t * 6)) / SR) * np.exp(-t * 2.2)
    crash = sosfilt(sos("highpass", 3000), noise(n)) * np.exp(-t * 3.5) * 0.35
    return np.tanh(1.3 * boom) + crash

# ---------- the arrangement ----------
def music():
    m = np.zeros(N + SR * 3)
    drums = np.zeros_like(m)
    K, CL, HC, HO = kick(), clap(), hat(), hat(True)

    def section(t0, t1, kick_on=True, clap_on=True, hats="8", bass=True, arp=True, pad=0.5, lead_on=False, cutoff=1400):
        b = t0
        while b < t1 - 1e-6:
            ch = chord_at(b)
            root, padn, arpn = CHORDS[ch]
            bar_end = min(b + BAR, t1)
            if pad: place(m, pad_chord(padn, bar_end - b, cutoff), b, 0.22 * pad)
            for s in range(16):            # sixteenths
                ts = b + s * BEAT / 4
                if ts >= t1 - 1e-6: break
                if s % 4 == 0 and kick_on: place(drums, K, ts, 0.9)
                if s in (4, 12) and clap_on: place(drums, CL, ts, 0.5)
                if hats == "8" and s % 4 == 2: place(drums, HO, ts, 0.18)
                if hats == "16" and s % 2 == 1: place(drums, HC, ts, 0.22 if s % 4 == 3 else 0.12)
                if hats == "16" and s % 4 == 2: place(drums, HO, ts, 0.16)
                if bass and s % 2 == 1: place(m, bass_note(hz(root) * (2 if s % 4 == 3 else 1), BEAT / 2.2), ts, 0.42)
                if arp: place(m, pluck(hz(arpn[(s * 3) % 4])), ts, 0.11 if s % 4 else 0.15)
            if lead_on:
                # a four-note hook per bar, A minor pentatonic
                hook = {"Am": ["E5", "G5", "A5", "C6"], "F": ["C6", "A5", "G5", "E5"],
                        "C": ["E5", "G5", "C6", "D6"], "G": ["D6", "B5", "G5", "D5"]}[ch]
                for i, nme in enumerate(hook):
                    tt = b + [0, 0.75, 1.0, 1.5][i] * BEAT * 2 / 2
                    place(m, lead(hz(nme), 0.42), tt, 0.13)
            b += BAR

    # 0-10: the page is inspected: a quiet pad, a soft pulse from 4 s, a riser into the dive
    section(0, 10, kick_on=False, clap_on=False, hats=None, bass=False, arp=False, pad=0.55, cutoff=700)
    for k in range(int(4 / BEAT), int(10 / BEAT)):
        place(m, sine(hz("A1"), int(0.25 * SR)) * np.exp(-np.arange(int(0.25 * SR)) / SR * 14), k * BEAT, 0.25)
    place(m, riser(2.0), 8.0, 0.45)
    place(m, impact(), 10.0, 0.75)
    # 10-22 the five films
    section(10, 22, hats="8", pad=0.5)
    # 22-34 the conversation: lighter, no clap for the first bar of each message
    section(22, 34, clap_on=True, hats="8", pad=0.35, arp=True)
    # 34-50 the eleven steps: driving
    section(34, 50, hats="16", pad=0.45)
    # 50-58 the render: build, snare roll, riser
    section(50, 54, hats="16", pad=0.3, cutoff=900)
    section(54, 58, kick_on=True, clap_on=False, hats="16", pad=0.3, cutoff=2400)
    roll_t = 54.0
    while roll_t < 58.0:
        step = BEAT / 2 if roll_t < 56 else (BEAT / 4 if roll_t < 57 else BEAT / 8)
        place(drums, CL, roll_t, 0.18 + 0.3 * (roll_t - 54) / 4)
        roll_t += step
    place(m, riser(4.0), 54.0, 0.5)
    place(m, impact(), 58.0, 0.8)
    # 58-66 the guide and "Your turn.": everything, with the hook
    section(58, 66, hats="16", pad=0.55, lead_on=True, cutoff=2000)
    # 66-69.5 "made from one message": breakdown, no drums
    section(66, 69.5, kick_on=False, clap_on=False, hats=None, bass=False, arp=True, pad=0.7, cutoff=1100)
    # 69.5 the end card: one last chord, ringing out
    place(m, impact(), 69.5, 0.55)
    end = pad_chord(["A2", "E3", "A3", "C4", "E4"], 4.5, 1600)
    place(m, end, 69.5, 0.35)
    place(m, bass_note(hz("A1"), 2.0), 69.5, 0.6)
    for i, nme in enumerate(["A4", "C5", "E5", "A5"]):
        place(m, pluck(hz(nme), 1.6, 2600), 69.5 + i * 0.06, 0.16)

    # sidechain: duck the music under each kick
    duck = np.ones_like(m)
    for k in range(int(LENGTH / BEAT)):
        t = k * BEAT
        if 10 <= t < 66:
            i = int(t * SR); L = int(0.18 * SR)
            duck[i:i + L] = np.minimum(duck[i:i + L], 0.55 + 0.45 * np.linspace(0, 1, L) ** 0.7)
    mix = m * duck + drums
    mix = mix[:N]
    # fade out at the very end
    fade = int(1.5 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade) ** 1.5
    return mix

# ---------- effects ----------
def mouse_click():
    n = int(0.03 * SR); t = np.arange(n) / SR
    a = sosfilt(sos("bandpass", [1800, 6000]), noise(n)) * np.exp(-t * 600)
    b = np.zeros(n); k = int(0.012 * SR)
    b[k:] = (sosfilt(sos("bandpass", [2500, 8000]), noise(n - k)) * np.exp(-np.arange(n - k) / SR * 900)) * 0.6
    return (a + b) * 0.9

def key_tick(seed):
    r = np.random.default_rng(seed)
    n = int(0.03 * SR); t = np.arange(n) / SR
    s = sosfilt(sos("bandpass", [1500 + 800 * r.random(), 7000]), r.uniform(-1, 1, n)) * np.exp(-t * (350 + 150 * r.random()))
    return s + sine(220 + 60 * r.random(), n) * np.exp(-t * 120) * 0.25

def pop(f0=620):
    n = int(0.09 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(f0 * np.exp(-t * 12)) / SR) * np.exp(-t * 40)

def whoosh(dur=0.4, seed=0, up=True):
    r = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / SR
    nz = r.uniform(-1, 1, n); out = np.zeros(n)
    slices = 24
    for k in range(slices):
        a, b = k * n // slices, (k + 1) * n // slices
        x = k / slices if up else 1 - k / slices
        fc = 400 + 4000 * x
        out[a:b] = sosfilt(sos("bandpass", [fc * 0.6, fc * 1.6]), nz[a:b])
    e = np.sin(np.pi * t / dur) ** 2
    return out * e

def clack(seed):
    r = np.random.default_rng(seed)
    n = int(0.16 * SR); t = np.arange(n) / SR
    thump = np.sin(2 * np.pi * np.cumsum(140 * np.exp(-t * 20) + 60) / SR) * np.exp(-t * 35)
    s = thump * 0.8
    for off in (0.0, 0.028, 0.05):           # the claw, the gate, the shutter
        k = int(off * SR)
        L = int(0.02 * SR)
        s[k:k + L] += sosfilt(sos("bandpass", [1200, 5000]), r.uniform(-1, 1, L)) * np.exp(-np.arange(L) / SR * 400) * (0.9 - off * 6)
    return s

def shutter(seed):
    r = np.random.default_rng(seed)
    n = int(0.06 * SR); s = np.zeros(n)
    for off in (0.0, 0.022):
        k = int(off * SR); L = int(0.015 * SR)
        s[k:k + L] += sosfilt(sos("bandpass", [2500, 9000]), r.uniform(-1, 1, L)) * np.exp(-np.arange(L) / SR * 500)
    return s

def sfx():
    s = np.zeros(N + SR)
    # s1 inspect
    for t in (2.6, 3.4, 4.9, 5.02, 8.0):
        place(s, mouse_click(), t, 0.7)
    for k in range(8):
        place(s, key_tick(k), 5.3 + k * 0.075, 0.45)
    place(s, key_tick(99), 6.0, 0.6)                       # Enter
    for k in range(16):                                    # the value being pushed up
        place(s, key_tick(200 + k), 8.1 + k * 0.06, 0.18)
    place(s, whoosh(1.0, 3, True), 9.0, 0.35)              # the dive
    # s2 films (+10)
    place(s, whoosh(0.35, 4), 11.85, 0.5)                  # whip
    place(s, whoosh(0.3, 5), 15.9, 0.3)                    # iris
    place(s, whoosh(0.35, 6, False), 17.85, 0.5)           # push up
    # s3 talk (+22)
    for t in (22.05, 26.5, 30.35):
        place(s, pop(560), t, 0.35)                        # message sent
    for t in (22.9, 27.3, 31.1):
        place(s, pop(820), t, 0.25)                        # Claude answers
    for k in range(1, 19):                                 # the slot reel
        place(s, key_tick(300 + k), 22 + 1.3 + 1.6 * (k / 18) ** 1.6, 0.3)
    place(s, pop(700), 25.1, 0.35)
    for k in range(10):
        place(s, key_tick(400 + k), 31.4 + k * 0.12, 0.18)
    place(s, whoosh(0.7, 7, True), 33.2, 0.45)             # the bubble swallows the frame
    # s4 steps (+34): a projector clack per pull-down
    for i in range(11):
        place(s, clack(500 + i), 34.0 + i * 1.5, 0.55)
    place(s, whoosh(0.38, 8), 50.1, 0.45)
    # s5 render (+50.5): a shutter per still, then the flipbook
    for k in range(1, 31):
        place(s, shutter(600 + k), 50.5 + 0.6 + 4.7 * (k / 30) ** 0.55, 0.45)
    for k in range(30):
        place(s, key_tick(700 + k), 50.5 + 5.45 + k * 0.045, 0.14)
    place(s, pop(500), 56.72, 0.4)
    # s6 your turn (+58)
    for t in (59.95, 61.5):
        place(s, mouse_click(), t, 0.7)
    place(s, whoosh(0.7, 9, True), 62.4, 0.45)
    place(s, pop(640), 67.62, 0.3)
    return s[:N]

def normalise(x, peak_db=-1.5):
    return x / (np.max(np.abs(x)) + 1e-9) * 10 ** (peak_db / 20)

def write(x, path):
    wav = path.with_suffix(".wav")
    st = np.stack([x, x], axis=1)
    pcm = (np.clip(st, -1, 1) * 32767).astype("<i2")
    import wave
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", "192k", str(path)], check=True)
    wav.unlink()

if __name__ == "__main__":
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
    out = root / "assets" / "audio"
    out.mkdir(parents=True, exist_ok=True)
    m = normalise(np.tanh(music() * 1.2), -1.5)
    write(m * 0.75, out / "music.mp3")
    write(normalise(sfx(), -1.5) * 0.8, out / "sfx.mp3")
    print("wrote", out / "music.mp3", out / "sfx.mp3")
