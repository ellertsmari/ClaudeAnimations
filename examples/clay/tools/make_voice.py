"""Narration for 'From one island to another': one mp3 per scene + word timings.

usage: .venv/bin/python -I tools/make_voice.py <project_dir> [voice] [--demo]
  voice  edge-tts voice name (default en-GB-RyanNeural)
  --demo only scene s2 (the one with the Icelandic names), into assets/voice/demos/
Writes assets/voice/<scene>.mp3 and assets/voice/voice.json:
  {voice, scenes: [{id, file, dur, words: [{w, t, d}]}]}
"""
import asyncio, json, re, subprocess, sys
from pathlib import Path
import edge_tts

RATE = "-2%"
# respellings so an English voice says the Icelandic and Spanish names roughly right
SAY = {
    "Vefskólinn": "Vef-skoh-linn",
    "Tækniskólinn": "Tike-nee-skoh-linn",
    "El Rincón": "El Rin-kon",
    "Isard": "Ee-sard",
    "Tibu's": "Tee-boo's",
    "Tibu": "Tee-boo",
    "Jakub": "Yakub",
    "gracias": "grah-see-as",
}


def parse(md):
    out = []
    for block in re.split(r"^## ", md, flags=re.M)[1:]:
        sid = block.split()[0]
        say = re.search(r"^say: (.+)$", block, re.M).group(1)
        text = re.search(r"^text: (.+)$", block, re.M).group(1)
        out.append((sid, say, text))
    return out


def respell(s):
    for k, v in SAY.items():
        s = s.replace(k, v)
    return s


async def tts(text, voice, out):
    com = edge_tts.Communicate(text, voice, rate=RATE, boundary="WordBoundary")
    words = []
    with open(out, "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append({"w": ch["text"], "t": round(ch["offset"] / 1e7, 3), "d": round(ch["duration"] / 1e7, 3)})
    return words


def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]).decode())


async def main():
    root = Path(sys.argv[1])
    args = [a for a in sys.argv[2:] if not a.startswith("--")]
    voice = args[0] if args else "en-GB-RyanNeural"
    demo = "--demo" in sys.argv
    scenes = parse((root / "SCRIPT.md").read_text())
    vdir = root / "assets" / "voice"
    if demo:
        d = vdir / "demos"; d.mkdir(parents=True, exist_ok=True)
        sid, say, _ = [s for s in scenes if s[0] == "s2"][0]
        await tts(respell(say), voice, d / f"{voice}.mp3")
        print(d / f"{voice}.mp3")
        return
    vdir.mkdir(parents=True, exist_ok=True)
    meta = {"voice": voice, "rate": RATE, "scenes": []}
    for sid, say, text in scenes:
        f = vdir / f"{sid}.mp3"
        words = await tts(respell(say), voice, f)
        meta["scenes"].append({"id": sid, "file": f"assets/voice/{sid}.mp3", "dur": round(dur(f), 3), "text": text, "words": words})
        print(sid, meta["scenes"][-1]["dur"])
    (vdir / "voice.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1))


asyncio.run(main())
