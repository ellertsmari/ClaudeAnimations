"""Original score for 'From one island to another': a light stop-motion caper.

Plucked ukulele (Karplus-Strong), pizzicato bass, glockenspiel and a soft shaker at 100 BPM in F,
with the arrangement following the scene timeline (assets/timeline.json).
Also writes assets/audio/animatic.mp3 = music + narration, for the storyboard page.

usage: .venv/bin/python -I tools/make_music.py <project_dir>
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
BPM = 100
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(7)

NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}
def hz(name):  # "F4", "A#3"
    n, o = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((NOTE[n] + 12 * (o + 1) - 69) / 12)

CHORDS = {  # ukulele voicings (G C E A tuning, re-entrant), bass root
    "F": (["A4", "C4", "F4", "A4"], "F2"), "Dm": (["A4", "D4", "F4", "A4"], "D2"),
    "Bb": (["A#4", "D4", "F4", "A#4"], "A#1"), "C": (["G4", "C4", "E4", "C5"], "C2"),
    "Gm": (["G4", "D4", "G4", "A#4"], "G1"), "A": (["A4", "C#4", "E4", "A4"], "A1"),
    "Am": (["A4", "C4", "E4", "A4"], "A1"),
}
TONES = {"F": ["F", "A", "C"], "Dm": ["D", "F", "A"], "Bb": ["A#", "D", "F"], "C": ["C", "E", "G"],
         "Gm": ["G", "A#", "D"], "A": ["A", "C#", "E"], "Am": ["A", "C", "E"]}

# arrangement per scene: progression, layers, energy
ARR = {
    "s1": dict(prog=["F", "F", "Dm", "C"], uke=0.6, bass=0.0, glock=0.8, shaker=0.0, pizz8=False),
    "s2": dict(prog=["F", "Dm", "Bb", "C"], uke=1.0, bass=1.0, glock=0.5, shaker=0.6, pizz8=False),
    "s3": dict(prog=["F", "Dm", "Bb", "C"], uke=1.0, bass=1.0, glock=0.7, shaker=0.8, pizz8=False),
    "s4": dict(prog=["Dm", "Bb", "Gm", "A"], uke=0.8, bass=1.0, glock=0.3, shaker=1.0, pizz8=True),
    "s5": dict(prog=["F", "Am", "Bb", "C"], uke=1.0, bass=1.0, glock=0.6, shaker=0.9, pizz8=False),
    "s6": dict(prog=["F", "Dm", "Bb", "C"], uke=1.0, bass=1.0, glock=0.9, shaker=0.9, pizz8=False),
    "s7": dict(prog=["Bb", "F", "Gm", "C"], uke=0.6, bass=0.7, glock=0.6, shaker=0.0, pizz8=False),
    "s8": dict(prog=["F", "Bb", "C", "F"], uke=1.0, bass=1.0, glock=1.0, shaker=1.0, pizz8=False),
}


def ks(freq, dur, decay=0.996, bright=0.5):
    """Karplus-Strong plucked string."""
    n = int(SR * dur)
    period = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, period)
    buf = np.convolve(buf, np.ones(3) / 3, mode="same") * (0.5 + bright)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % period]
        buf[i % period] = decay * 0.5 * (buf[i % period] + buf[(i + 1) % period])
    return out


_ks_cache = {}
def pluck(freq, dur, decay=0.996, bright=0.5):
    k = (round(freq, 2), dur, decay, bright)
    if k not in _ks_cache:
        _ks_cache[k] = ks(freq, dur, decay, bright)
    return _ks_cache[k]


def bell(freq, dur):
    t = np.arange(int(SR * dur)) / SR
    s = (np.sin(2 * np.pi * freq * t) * np.exp(-t * 3.2)
         + 0.35 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t * 7)
         + 0.15 * np.sin(2 * np.pi * freq * 5.4 * t) * np.exp(-t * 12))
    s[: int(SR * 0.002)] *= np.linspace(0, 1, int(SR * 0.002))
    return s


def pizz(freq, dur=0.5):
    t = np.arange(int(SR * dur)) / SR
    f = freq * (1 + 0.02 * np.exp(-t * 40))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = (np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.1 * np.sin(3 * ph)) * np.exp(-t * 6)
    s[: 60] *= np.linspace(0, 1, 60)
    return s


def shaker(dur=0.08):
    n = int(SR * dur)
    s = rng.uniform(-1, 1, n) * np.exp(-np.arange(n) / SR * 60)
    return sosfilt(butter(2, [5000, 11000], "bandpass", fs=SR, output="sos"), s)


def add(buf, sig, t, gain, pan=0.0):
    i = int(t * SR)
    if i >= buf.shape[1]:
        return
    sig = sig[: buf.shape[1] - i]
    buf[0, i:i + len(sig)] += sig * gain * (1 - pan) * 0.5 * 2 ** 0.5
    buf[1, i:i + len(sig)] += sig * gain * (1 + pan) * 0.5 * 2 ** 0.5


def main():
    root = Path(sys.argv[1])
    tl = json.loads((root / "assets/timeline.json").read_text())
    total = tl["total"]
    scenes = tl["scenes"]
    buf = np.zeros((2, int(SR * (total + 3))))
    scene_at = lambda t: next((s["id"] for s in reversed(scenes) if s["start"] <= t + 1e-3), "s1")

    nbars = int(np.ceil(total / BAR))
    for b in range(nbars):
        t0 = b * BAR
        sid = scene_at(t0 + 0.05)
        a = ARR[sid]
        # bar index within the scene's progression
        first = int(np.ceil(next(s["start"] for s in scenes if s["id"] == sid) / BAR - 1e-6))
        chord = a["prog"][(b - first) % 4]
        voicing, root_note = CHORDS[chord]
        last_bar = b == nbars - 1
        # ukulele: off-beat "chunk" strums + down strum on 1
        if a["uke"]:
            for beat in range(4):
                for half, g in ((0, 0.55), (0.5, 0.85)):
                    if beat == 0 and half == 0:
                        g = 0.9
                    tt = t0 + (beat + half) * BEAT
                    for k, note in enumerate(voicing):
                        add(buf, pluck(hz(note), 0.9, 0.993, 0.4), tt + k * 0.011, 0.07 * g * a["uke"], pan=-0.25)
        # pizzicato bass on 1 and 3 (8ths in the chaos scene)
        if a["bass"]:
            r = hz(root_note)
            hits = [(0, r), (2, r * 1.5)] if not a["pizz8"] else [(i * 0.5, r * (1.5 if i % 4 == 2 else 1)) for i in range(8)]
            for beat, f in hits:
                add(buf, pizz(f, 0.6), t0 + beat * BEAT, 0.28 * a["bass"], pan=0.1)
        # shaker 8ths with a little swing
        if a["shaker"]:
            for i in range(8):
                tt = t0 + (i * 0.5 + (0.06 if i % 2 else 0)) * BEAT
                add(buf, shaker(), tt, (0.05 if i % 2 else 0.03) * a["shaker"], pan=0.35)
        # glockenspiel: a few chord tones high up, more on bar 1 of 4
        if a["glock"]:
            tones = TONES[chord]
            pattern = [0, 1.5, 2, 3] if (b - first) % 2 == 0 else [0.5, 2.5]
            for i, beat in enumerate(pattern):
                n = tones[(b + i * 2) % 3] + ("6" if i % 3 == 2 else "5")
                add(buf, bell(hz(n), 1.4), t0 + beat * BEAT, 0.09 * a["glock"], pan=0.3)
        if last_bar:
            pass

    # final chord ring-out on F, timed to the last line's end
    end = scenes[-1]["voiceAt"] + scenes[-1]["voiceDur"] + 0.2
    for k, note in enumerate(["F3", "A3", "C4", "F4", "A4"]):
        add(buf, pluck(hz(note), 3.0, 0.9985, 0.5), end + k * 0.03, 0.1)
    for note in ["F5", "A5", "C6"]:
        add(buf, bell(hz(note), 3.0), end + 0.05, 0.08)
    add(buf, pizz(hz("F1"), 1.5), end, 0.35)

    # fades: gentle in, out at the end
    n_end = int(SR * (total + 1.0))
    buf = buf[:, :n_end]
    fade = np.ones(n_end)
    fi = int(SR * 0.8); fade[:fi] = np.linspace(0, 1, fi)
    fo = int(SR * 2.0); fade[-fo:] = np.linspace(1, 0, fo)
    buf *= fade
    buf /= max(1e-6, np.abs(buf).max()) / 0.89

    out = root / "assets/music"; out.mkdir(parents=True, exist_ok=True)
    wav = out / "score.wav"
    import wave
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((buf.T * 32767).astype("<i2").tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-b:a", "192k", str(out / "score.mp3")], check=True)

    # animatic mix: narration over music (music 0.16, voice +6 dB with a limiter)
    aud = root / "assets/audio"; aud.mkdir(parents=True, exist_ok=True)
    inputs = ["-i", str(out / "score.mp3")]
    filt = []
    for i, s in enumerate(scenes, start=1):
        inputs += ["-i", str(root / s["file"])]
        ms = int(s["voiceAt"] * 1000)
        filt.append(f"[{i}]adelay={ms}|{ms},volume=2.0[v{i}]")
    vs = "".join(f"[v{i}]" for i in range(1, len(scenes) + 1))
    filt.append(f"{vs}amix=inputs={len(scenes)}:normalize=0,alimiter=limit=0.9[vo]")
    filt.append("[0]volume=0.16[m]")
    filt.append("[m][vo]amix=inputs=2:normalize=0:duration=first[out]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[out]",
                    str(aud / "mix.wav")], check=True)  # the film's soundtrack
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(aud / "mix.wav"), "-b:a", "160k", str(aud / "animatic.mp3")], check=True)
    print("score", round(n_end / SR, 2), "s ->", out / "score.mp3", "| animatic ->", aud / "animatic.mp3")


main()
