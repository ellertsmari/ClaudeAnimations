"""Scene timeline from the narration: assets/timeline.json, read by the music, storyboard and render.

usage: python3 -I tools/make_timeline.py <project_dir>
"""
import json, sys
from pathlib import Path

# seconds of picture before the voice starts / after it ends, per scene
LEAD = {"s1": 1.4, "s4": 0.4, "s5": 0.6, "s8": 0.5}
TAIL = {"s1": 1.8, "s3": 0.7, "s4": 0.9, "s5": 0.8, "s6": 0.8, "s7": 0.9, "s8": 6.4}
DEFAULT_LEAD, DEFAULT_TAIL = 0.35, 0.55

root = Path(sys.argv[1])
voice = json.loads((root / "assets/voice/voice.json").read_text())
t = 0.0
scenes = []
for s in voice["scenes"]:
    lead, tail = LEAD.get(s["id"], DEFAULT_LEAD), TAIL.get(s["id"], DEFAULT_TAIL)
    dur = round(lead + s["dur"] + tail, 3)
    scenes.append({"id": s["id"], "start": round(t, 3), "dur": dur, "voiceAt": round(t + lead, 3),
                   "voiceDur": s["dur"], "file": s["file"], "text": s["text"],
                   "words": [{**w, "t": round(w["t"] + t + lead, 3)} for w in s["words"]]})
    t += dur
out = {"total": round(t, 3), "fps": 24, "scenes": scenes}
(root / "assets/timeline.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
# same data as a script, so the render page needs no fetch
(root / "assets/timeline.js").write_text("window.TIMELINE = " + json.dumps(out, ensure_ascii=False) + ";\n")
print("total", round(t, 2), [(s["id"], s["start"], s["dur"]) for s in scenes])
