"""Generate per-frame Icelandic narration with edge-tts (is-IS-GunnarNeural, slowed),
and write audio_meta.json in the frame-keyed shape the faceless-explainer scripts consume.

Card lines in SCRIPT.md are "Headword. | Sentence." — the headword and the sentence are
synthesized as two clips and joined with a pause, so learners hear the word alone first.

usage: python -I make_voice.py <project_dir>
"""
import asyncio
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

import edge_tts

VOICE = "is-IS-GunnarNeural"
RATE = "-10%"
GAP = 0.75  # silence between headword and sentence
# seconds of silence before / after the spoken line, per frame
PAD = {1: (1.0, 0.8), 10: (0.8, 2.6)}
DEFAULT_PAD = (0.9, 0.9)  # lead covers the headword typing in; tail lets the card breathe


def parse_script(md: str):
    lines = []
    for block in re.split(r"^## ", md, flags=re.M)[1:]:
        m = re.search(r"\(Frame (\d+)\)", block.splitlines()[0])
        if not m:
            continue
        spoken = " ".join(l[4:].strip() for l in block.splitlines() if l.startswith("    "))
        parts = [p.strip() for p in spoken.split("|")]
        lines.append((int(m.group(1)), parts))
    return lines


async def tts(text: str, out: Path):
    com = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary")
    words = []
    with out.open("wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / 1e7
                words.append({"text": chunk["text"], "start": start, "end": start + chunk["duration"] / 1e7})
    return words


def duration(path: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def trimmed_wav(raw: Path, out: Path, words):
    """Trim a clip to its spoken extent; return (speech_seconds, words shifted to clip start)."""
    s0 = max(0.0, words[0]["start"] - 0.08)
    s1 = min(duration(raw), words[-1]["end"] + 0.25)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(raw),
                    "-af", f"atrim={s0:.3f}:{s1:.3f},asetpts=PTS-STARTPTS,afade=t=out:st={max(0, s1 - s0 - 0.06):.3f}:d=0.06",
                    "-ar", "48000", "-ac", "2", str(out)], check=True)
    return s1 - s0, [dict(w, start=w["start"] - s0, end=w["end"] - s0) for w in words]


def main():
    proj = Path(sys.argv[1]).resolve()
    vdir = proj / "assets" / "voice"
    raw_dir = vdir / "_raw"
    raw_dir.mkdir(parents=True, exist_ok=True)
    voices = []
    for frame, parts in parse_script((proj / "SCRIPT.md").read_text(encoding="utf-8")):
        lead, tail = PAD.get(frame, DEFAULT_PAD)
        segs, all_words, t = [], [], lead
        for i, text in enumerate(parts):
            raw = raw_dir / f"{frame:02d}-{i}.mp3"
            words = asyncio.run(tts(text, raw))
            seg = raw_dir / f"{frame:02d}-{i}.wav"
            speech, words = trimmed_wav(raw, seg, words)
            if i > 0:
                t += GAP
            for w in words:
                all_words.append({"text": w["text"], "start": round(w["start"] + t, 3),
                                  "end": round(w["end"] + t, 3), "part": "head" if (len(parts) > 1 and i == 0) else "sentence"})
            segs.append((seg, t))
            t += speech
        total = round(t + tail, 3)
        # content-hashed name: changed narration gets a new URL, so no preview cache can replay an old take
        tag = hashlib.sha1(f"{VOICE}|{RATE}|{GAP}|{lead}|{tail}|{'|'.join(parts)}".encode()).hexdigest()[:8]
        for old in vdir.glob(f"{frame:02d}*.wav"):
            old.unlink()
        out = vdir / f"{frame:02d}-{tag}.wav"
        inputs, filters = [], []
        for k, (seg, at) in enumerate(segs):
            inputs += ["-i", str(seg)]
            filters.append(f"[{k}:a]adelay={int(at * 1000)}:all=1[a{k}]")
        mix = "".join(f"[a{k}]" for k in range(len(segs)))
        filters.append(f"{mix}amix=inputs={len(segs)}:normalize=0,apad=whole_dur={total}[out]")
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *inputs, "-filter_complex", ";".join(filters),
                        "-map", "[out]", "-ar", "48000", "-ac", "2", str(out)], check=True)
        total = round(duration(out), 3)
        ws = [dict(w, id=f"w{frame:02d}-{n}") for n, w in enumerate(all_words)]
        voices.append({"frame": frame, "path": f"assets/voice/{out.name}", "duration_s": total,
                       "lead_s": lead, "speech_s": round(t - lead, 3), "words": ws, "all_words": ws})
        print(f"frame {frame:2d}: {total:6.2f}s  ({len(all_words)} words)  {' | '.join(parts)[:60]}")
    meta_path = proj / "audio_meta.json"
    meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
    meta.update({"voices": voices, "bgm": meta.get("bgm"), "bgm_pending": False, "sfx": meta.get("sfx", [])})
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"total: {sum(v['duration_s'] for v in voices):.2f}s → {meta_path}")


if __name__ == "__main__":
    main()
