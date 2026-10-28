"""Synthesize an original chiptune music bed + 8-bit SFX for the Player 2 video,
then register them in audio_meta.json (bgm + frame-keyed sfx cues parsed from
the `- sfx: name@seconds` lines in STORYBOARD.md).

usage: python -I make_chiptune.py <project_dir>
Deterministic: noise uses a fixed-seed generator.
"""
import json
import re
import sys
import wave
from pathlib import Path

import numpy as np

SR = 48000
RNG = np.random.default_rng(1977)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def t_axis(dur):
    return np.arange(int(SR * dur)) / SR


def pulse(freq, dur, duty=0.5):
    t = t_axis(dur)
    ph = (t * freq) % 1.0
    return np.where(ph < duty, 1.0, -1.0)


def tri(freq, dur):
    t = t_axis(dur)
    ph = (t * freq) % 1.0
    return 4 * np.abs(ph - 0.5) - 1


def noise(dur, step=1):
    n = int(SR * dur)
    v = RNG.uniform(-1, 1, n // step + 1)
    return np.repeat(v, step)[:n]


def env(x, a=0.002, d=0.05, s=0.6, r=0.03):
    n = len(x)
    e = np.ones(n) * s
    ai, di, ri = int(a * SR), int(d * SR), int(r * SR)
    ai = min(ai, n)
    e[:ai] = np.linspace(0, 1, ai) if ai else e[:ai]
    di2 = min(di, n - ai)
    if di2 > 0:
        e[ai:ai + di2] = np.linspace(1, s, di2)
    ri = min(ri, n)
    if ri:
        e[-ri:] *= np.linspace(1, 0, ri)
    return x * e


def decay(x, k=8.0):
    return x * np.exp(-k * t_axis(len(x) / SR))


def sweep(f0, f1, dur, kind="pulse", duty=0.5):
    t = t_axis(dur)
    f = f0 * (f1 / f0) ** (t / dur)
    ph = np.cumsum(f) / SR % 1.0
    if kind == "tri":
        return 4 * np.abs(ph - 0.5) - 1
    if kind == "sine":
        return np.sin(2 * np.pi * ph)
    return np.where(ph < duty, 1.0, -1.0)


def place(buf, x, at):
    i = int(at * SR)
    j = min(len(buf), i + len(x))
    if i < len(buf):
        buf[i:j] += x[: j - i]


def seq(notes, step, dur_each=None, duty=0.5, k=10):
    dur_each = dur_each or step
    out = np.zeros(int(SR * (step * len(notes) + dur_each)) + 1)
    for i, n in enumerate(notes):
        if n:
            place(out, decay(pulse(midi(n), dur_each, duty), k), i * step)
    return out


def write_wav(path, mono, gain=1.0):
    x = np.clip(mono * gain, -1, 1)
    pcm = (x * 32767).astype("<i2")
    st = np.repeat(pcm[:, None], 2, axis=1).tobytes()
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(st)


# ---------------------------------------------------------------- SFX
def sfx_bank():
    b = {}
    b["blip"] = env(pulse(880, 0.07), d=0.03, s=0.4, r=0.02)
    b["blip-hi"] = env(pulse(1320, 0.08), d=0.03, s=0.4, r=0.02)
    b["blip-lo"] = env(pulse(440, 0.09, 0.25), d=0.04, s=0.4, r=0.02)
    b["blink"] = env(pulse(523, 0.05, 0.25), d=0.02, s=0.4, r=0.01)
    typ = np.zeros(int(SR * 2.1))
    for i in range(int(2.0 / 0.07)):
        place(typ, env(pulse(1150 if i % 2 else 1250, 0.028, 0.25), d=0.01, s=0.5, r=0.008) * 0.6, i * 0.07)
    b["type-blips"] = typ
    drop = decay(sweep(700, 140, 0.28), 4) * 0.8
    thump = decay(noise(0.12, 8) * 0.6 + tri(70, 0.12), 25)
    d = np.zeros(int(SR * 0.45)); place(d, drop, 0); place(d, thump, 0.0)
    b["logo-drop"] = d
    b["menu-open"] = seq([84, 88, 91], 0.045, 0.06, 0.25)
    st = np.zeros(int(SR * 0.3)); place(st, decay(noise(0.1, 4), 30), 0); place(st, decay(pulse(110, 0.2), 12) * 0.7, 0)
    b["stamp"] = st
    b["slam"] = st * 1.1
    b["jump"] = decay(sweep(300, 950, 0.16), 6) * 0.8
    b["unlock"] = seq([88, 95], 0.08, 0.12, 0.5, 8)
    vib = pulse(92, 0.32, 0.5) * (1 + 0.0 * t_axis(0.32))
    b["buzz"] = env(vib + pulse(97, 0.32, 0.5), d=0.05, s=0.7, r=0.05) * 0.45
    pu = np.zeros(int(SR * 0.65))
    for i, n in enumerate([60, 64, 67, 72, 76, 79, 84, 88]):
        place(pu, decay(pulse(midi(n), 0.07, 0.25), 6), i * 0.06)
    b["powerup"] = pu
    b["jingle"] = seq([72, 76, 79, 84], 0.09, 0.12, 0.5, 6) * 0.9
    jt = np.zeros(int(SR * 0.7)); place(jt, b["jingle"], 0); place(jt, decay(pulse(midi(84), 0.35, 0.5), 5) * 0.6, 0.36)
    b["jingle"] = jt
    b["ding"] = decay(tri(1568, 0.35) * 0.7 + pulse(1568, 0.35, 0.125) * 0.3, 9)
    scr = np.zeros(int(SR * 0.9))
    for i in range(14):
        place(scr, decay(noise(0.03, 2), 60) * 0.35, i * 0.06)
    b["scribble"] = scr
    b["draw"] = scr * 0.8
    sn = np.zeros(int(SR * 0.15)); place(sn, decay(noise(0.02, 1), 120), 0); place(sn, decay(pulse(1760, 0.07, 0.25), 25) * 0.7, 0.01)
    b["snap"] = sn
    b["xp"] = seq([79, 83, 86, 91], 0.05, 0.06, 0.25)
    br = np.zeros(int(SR * 1.0))
    for at in (0.0, 0.37, 0.72):
        place(br, decay(pulse(150, 0.12) * 0.6 + noise(0.12, 6) * 0.4, 22), at)
    b["bricks"] = br
    rn = np.zeros(int(SR * 0.7))
    for i in range(7):
        place(rn, decay(noise(0.025, 3) * (0.5 if i % 2 else 0.35), 80), i * 0.09)
    b["run"] = rn
    b["hearts"] = seq([93, 0, 96, 0, 98], 0.06, 0.1, 0.25, 9)
    b["build"] = seq([72, 74, 76, 79, 81, 84], 0.07, 0.08, 0.25, 9)
    ach = np.zeros(int(SR * 0.9)); place(ach, seq([79, 84, 88], 0.08, 0.1, 0.5, 6), 0)
    place(ach, decay(pulse(midi(91), 0.4, 0.125), 5) * 0.5, 0.26)
    b["achievement"] = ach
    lv = np.zeros(int(SR * 0.9))
    place(lv, seq([72, 76, 79, 84, 88, 91, 96, 100], 0.045, 0.05, 0.25, 8), 0)
    for n in (84, 88, 91):
        place(lv, decay(pulse(midi(n), 0.4, 0.5), 4) * 0.35, 0.38)
    b["levelup"] = lv
    ch = np.zeros(int(SR * 0.8)); place(ch, decay(sweep(90, 200, 0.2, "pulse", 0.25), 3) * 0.5, 0)
    for i, n in enumerate([88, 91, 95, 100, 96, 103]):
        place(ch, decay(pulse(midi(n), 0.06, 0.25), 10) * 0.6, 0.18 + i * 0.06)
    b["chest"] = ch
    coin = np.zeros(int(SR * 0.4)); place(coin, pulse(988, 0.07, 0.5) * 0.8, 0); place(coin, decay(pulse(1319, 0.3, 0.5), 7) * 0.8, 0.07)
    b["pickup"] = coin
    b["star"] = seq([96, 100, 103, 108, 103], 0.07, 0.12, 0.125, 7)
    b["select"] = seq([76, 83], 0.05, 0.07, 0.5, 8)
    ar = np.zeros(int(SR * 0.9))
    for i in range(12):
        place(ar, decay(pulse(midi(72 + [0, 4, 7, 12][i % 4] + 12 * (i // 8)), 0.06, 0.25), 10) * 0.7, i * 0.06)
    b["arpeggio"] = ar
    ci = np.zeros(int(SR * 0.6)); place(ci, coin, 0); place(ci, decay(noise(0.06, 6) * 0.6 + tri(90, 0.06), 30), 0.33)
    b["coin-insert"] = ci
    po = np.zeros(int(SR * 0.6)); place(po, decay(sweep(1400, 45, 0.45, "sine"), 2) * 0.7, 0); place(po, decay(noise(0.45, 2) * 0.15, 4), 0)
    b["power-off"] = po
    return b


# ---------------------------------------------------------------- music
BPM = 120
BAR = 4 * 60 / BPM  # 2.0 s
E8 = BAR / 8
CHORDS = {"C": (48, [60, 64, 67]), "G": (43, [55, 59, 62]), "Am": (45, [57, 60, 64]), "F": (41, [53, 57, 60])}
PROG = ["C", "G", "Am", "F"]
MEL_A = [[76, 79, 84, 79, 76, 79, 74, 76], [74, 79, 83, 79, 74, 79, 83, 86],
         [84, 83, 81, 76, 81, 83, 84, 88], [86, 84, 81, 77, 81, 84, 86, 84]]
MEL_B = [[79, -1, -1, 76, -1, 72, 74, 76], [74, -1, 71, -1, 74, 79, -1, -1],
         [81, -1, 79, 76, -1, 72, 74, 76], [77, 76, 74, 72, -1, -1, 67, -1]]


def music(total, end_at):
    buf = np.zeros(int(SR * (total + 1)))
    nbars = int(np.ceil(end_at / BAR))
    for bar in range(nbars):
        t0 = bar * BAR
        final = bar == nbars - 1
        chord = "C" if final else ("G" if bar == nbars - 2 else PROG[bar % 4])
        root, tones = CHORDS[chord]
        intro = bar < 2
        # arpeggio layer (16ths)
        for i in range(16):
            n = tones[i % 3] + 12 * ((i // 3) % 2)
            place(buf, decay(pulse(midi(n + 12), BAR / 16, 0.125), 18) * 0.10, t0 + i * BAR / 16)
            if final and i >= 3:
                break
        # bass (8ths, root / octave)
        if bar >= 1:
            for i in range(8 if not final else 1):
                n = root + (12 if i % 2 else 0)
                d = E8 if not final else 2.0
                place(buf, env(tri(midi(n), d * 0.95), d=0.05, s=0.8, r=0.02) * 0.30, t0 + i * E8)
        # drums
        if bar >= 1 and not final:
            for beat in range(4):
                bt = t0 + beat * BAR / 4
                if beat in (0, 2):
                    place(buf, decay(sweep(150, 45, 0.12, "sine"), 18) * 0.45, bt)
                else:
                    place(buf, decay(noise(0.12, 3), 28) * 0.22, bt)
                place(buf, decay(noise(0.03, 1), 120) * 0.07, bt + BAR / 8)
        # lead melody
        if not intro and not final:
            phrase = MEL_A if ((bar - 2) // 4) % 2 == 0 else MEL_B
            if bar == nbars - 2:
                phrase = [None, [79, 83, 86, 91, 86, 83, 79, 74]] * 2
            notes = phrase[(bar - 2) % 4] if bar != nbars - 2 else phrase[1]
            i = 0
            while i < 8:
                n = notes[i]
                if n and n > 0:
                    L = 1
                    while i + L < 8 and notes[i + L] == -1:
                        L += 1
                    d = E8 * L
                    place(buf, env(pulse(midi(n), d * 0.92, 0.25), d=0.06, s=0.55, r=0.03) * 0.16, t0 + i * E8)
                    i += L
                else:
                    i += 1
        if final:
            for n in tones + [72]:
                place(buf, env(pulse(midi(n + 12), end_at - t0 + 0.1, 0.25), d=0.3, s=0.5, r=0.4) * 0.10, t0)
            place(buf, env(tri(midi(root), end_at - t0), d=0.2, s=0.7, r=0.4) * 0.3, t0)
    # cut hard at end_at (CRT power-off) with a 30 ms fade
    e = int(end_at * SR)
    f = int(0.03 * SR)
    buf[e - f:e] *= np.linspace(1, 0, f)
    buf[e:] = 0
    return buf[: int(SR * total)]


def main():
    proj = Path(sys.argv[1]).resolve()
    meta_path = proj / "audio_meta.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    durs = {v["frame"]: v["duration_s"] for v in meta["voices"]}
    total = round(sum(durs.values()), 3)
    starts, acc = {}, 0.0
    for f in sorted(durs):
        starts[f] = acc
        acc += durs[f]
    end_at = starts[11] + 7.85  # CRT power-off in frame 11

    bank = sfx_bank()
    for name, x in bank.items():
        write_wav(proj / "assets" / "sfx" / f"{name}.wav", x, 0.8 / max(1e-9, float(np.abs(x).max())))
    bgm = music(total, end_at)
    write_wav(proj / "assets" / "bgm" / "chiptune.wav", bgm, 0.9 / max(1e-9, float(np.abs(bgm).max())))

    sb = (proj / "STORYBOARD.md").read_text(encoding="utf-8")
    cues, cur = [], None
    for line in sb.splitlines():
        m = re.match(r"^## Frame (\d+) —", line)
        if m:
            cur = int(m.group(1))
        m = re.match(r"^- sfx:\s*(.+)$", line)
        if m and cur:
            for item in m.group(1).split(","):
                name, at = item.strip().split("@")
                x = bank[name]
                dur = round(len(x) / SR, 3)
                if name == "type-blips":
                    dur = {1: 2.0, 4: 2.1, 7: 1.0, 11: 0.65}.get(cur, 1.0)
                vol = 0.30 if name in ("type-blips", "scribble", "draw", "run") else 0.42
                cues.append({"frame": cur, "file": f"assets/sfx/{name}.wav", "offset_s": float(at),
                             "duration_s": dur, "volume": vol})
    meta["bgm"] = {"path": "assets/bgm/chiptune.wav", "volume": 0.16, "query": "original chiptune (synthesized)",
                   "duration_s": total}
    meta["bgm_pending"] = False
    meta["sfx"] = cues
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"bgm {total}s (power-off cut at {end_at:.2f}s), {len(bank)} sfx files, {len(cues)} cues")


if __name__ == "__main__":
    main()
