"""Generate per-frame Icelandic narration with edge-tts (is-IS-GunnarNeural),
pad each line with a frame-specific lead-in / tail, and write audio_meta.json
in the frame-keyed shape the faceless-explainer scripts consume.

usage: python -I make_voice.py <project_dir>
"""
import asyncio
import json
import re
import subprocess
import sys
from pathlib import Path

import edge_tts

VOICE = "is-IS-GunnarNeural"
# seconds of silence before / after the spoken line, per frame
PAD = {
    1: (1.6, 0.6), 2: (0.3, 0.6), 3: (0.3, 0.5), 4: (0.3, 0.6),
    5: (0.6, 0.4), 6: (0.6, 0.4), 7: (0.6, 0.9), 8: (0.5, 0.6),
    9: (0.3, 0.6), 10: (0.4, 0.8), 11: (0.5, 3.2),
}
# frames whose words are NOT captioned (frame 1's dialog box is its own caption)
NO_CAPTION = {1}


def parse_script(md: str):
    lines = []
    for block in re.split(r"^## ", md, flags=re.M)[1:]:
        m = re.search(r"\(Frame (\d+)\)", block.splitlines()[0])
        if not m:
            continue
        spoken = [l[4:] for l in block.splitlines() if l.startswith("    ")]
        lines.append((int(m.group(1)), " ".join(s.strip() for s in spoken)))
    return lines


async def tts(text: str, out: Path):
    com = edge_tts.Communicate(text, VOICE, boundary="WordBoundary")
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


def main():
    proj = Path(sys.argv[1]).resolve()
    vdir = proj / "assets" / "voice"
    vdir.mkdir(parents=True, exist_ok=True)
    raw_dir = vdir / "_raw"
    raw_dir.mkdir(exist_ok=True)
    voices = []
    for frame, text in parse_script((proj / "SCRIPT.md").read_text(encoding="utf-8")):
        raw = raw_dir / f"{frame:02d}.mp3"
        words = asyncio.run(tts(text, raw))
        lead, tail = PAD.get(frame, (0.3, 0.5))
        # trim the clip's own leading/trailing silence to the word extents
        s0 = max(0.0, words[0]["start"] - 0.08)
        s1 = min(duration(raw), words[-1]["end"] + 0.25)
        for w in words:
            w["start"] -= s0
            w["end"] -= s0
        speech = s1 - s0
        total = round(lead + speech + tail, 3)
        out = vdir / f"{frame:02d}.wav"
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(raw),
                        "-af", f"atrim={s0:.3f}:{s1:.3f},asetpts=PTS-STARTPTS,"
                               f"afade=t=out:st={max(0, speech - 0.06):.3f}:d=0.06,"
                               f"adelay={int(lead * 1000)}:all=1,apad=whole_dur={total}",
                        "-ar", "48000", "-ac", "2", str(out)], check=True)
        total = round(duration(out), 3)
        ws = [] if frame in NO_CAPTION else [
            {"id": f"w{frame:02d}-{i}", "text": w["text"], "start": round(w["start"] + lead, 3),
             "end": round(w["end"] + lead, 3)} for i, w in enumerate(words)]
        voices.append({"frame": frame, "path": f"assets/voice/{frame:02d}.wav", "duration_s": total,
                       "lead_s": lead, "speech_s": round(speech, 3), "words": ws,
                       "all_words": [{"text": w["text"], "start": round(w["start"] + lead, 3),
                                      "end": round(w["end"] + lead, 3)} for w in words]})
        print(f"frame {frame:2d}: {total:6.2f}s  ({len(words)} words)  {text[:50]}")
    meta_path = proj / "audio_meta.json"
    meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
    meta.update({"voices": voices, "bgm": meta.get("bgm"), "bgm_pending": False, "sfx": meta.get("sfx", [])})
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"total: {sum(v['duration_s'] for v in voices):.2f}s → {meta_path}")


if __name__ == "__main__":
    main()
