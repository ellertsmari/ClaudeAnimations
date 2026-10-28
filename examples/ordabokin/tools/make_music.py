"""Gentle, quiet music bed + soft card-flip SFX for Orðabókin, synthesized in code.

Soft marimba-like plucks over a warm pad, I–vi–IV–V in F major at 84 BPM.
usage: python -I make_music.py <project_dir> <seconds>
"""
import sys
import wave
from pathlib import Path

import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def write_wav(path: Path, x: np.ndarray):
    x = np.clip(x, -1, 1)
    st = np.stack([x, x], axis=1) if x.ndim == 1 else x
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype("<i2").tobytes())


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def pluck(f, dur, amp):
    t = np.arange(int(SR * dur)) / SR
    env = np.exp(-t * 5.5) * (1 - np.exp(-t * 400))
    tone = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 18)
    return amp * env * tone


def pad(freqs, dur, amp):
    t = np.arange(int(SR * dur)) / SR
    env = np.minimum(1, t / 0.8) * np.minimum(1, (dur - t) / 0.8)
    x = sum(np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.003 * t) for f in freqs)
    return amp * env * x / len(freqs)


def music(seconds):
    bpm = 84
    beat = 60 / bpm
    bar = 4 * beat
    n = int(SR * (seconds + 2))
    out = np.zeros(n)
    # F, Dm, Bb, C (midi roots) with triads
    chords = [(53, [65, 69, 72]), (50, [62, 65, 69]), (46, [58, 62, 65]), (48, [60, 64, 67])]
    pattern = [0, 2, 1, 2, 0, 2, 1, 2]  # eighth-note arpeggio over the triad
    t = 0.0
    i = 0
    while t < seconds + 1:
        root, triad = chords[i % 4]
        s = int(SR * t)
        p = pad([hz(root), hz(root + 12)] + [hz(m) for m in triad], bar + 0.6, 0.05)
        out[s:s + len(p)] += p[: max(0, n - s)]
        for k, idx in enumerate(pattern):
            if (i % 8) >= 6 and k % 2:  # breathe every few bars
                continue
            note = triad[idx] + (12 if k == 4 else 0)
            st = int(SR * (t + k * beat / 2))
            x = pluck(hz(note), 1.4, 0.10 if k % 2 == 0 else 0.07)
            out[st:st + len(x)] += x[: max(0, n - st)]
        t += bar
        i += 1
    out = out[: int(SR * seconds)]
    # simple stereo-ish room: short delay
    d = int(SR * 0.19)
    wet = np.zeros_like(out)
    wet[d:] = out[:-d] * 0.25
    out = out + wet
    fade_in, fade_out = int(SR * 1.5), int(SR * 3.0)
    out[:fade_in] *= np.linspace(0, 1, fade_in)
    out[-fade_out:] *= np.linspace(1, 0, fade_out)
    return out / (np.max(np.abs(out)) + 1e-9) * 0.8


def flip():
    dur = 0.32
    t = np.arange(int(SR * dur)) / SR
    noise = rng.standard_normal(len(t))
    # sweep a one-pole lowpass from bright to dull = paper swish
    y = np.zeros_like(noise)
    a_start, a_end = 0.55, 0.08
    for k in range(1, len(noise)):
        a = a_start + (a_end - a_start) * k / len(noise)
        y[k] = y[k - 1] + a * (noise[k] - y[k - 1])
    env = np.minimum(1, t / 0.02) * np.exp(-t * 11)
    thump = 0.6 * np.sin(2 * np.pi * 140 * t) * np.exp(-t * 30)
    x = (y * 0.9 + thump) * env
    return x / (np.max(np.abs(x)) + 1e-9) * 0.7


def main():
    proj = Path(sys.argv[1]).resolve()
    seconds = float(sys.argv[2])
    write_wav(proj / "assets" / "bgm" / "gentle.wav", music(seconds))
    write_wav(proj / "assets" / "sfx" / "flip.wav", flip())
    print("wrote assets/bgm/gentle.wav, assets/sfx/flip.wav")


if __name__ == "__main__":
    main()
