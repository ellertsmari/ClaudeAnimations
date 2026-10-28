# Audio tools for the player-2-arcade template

Run with a Python venv that has `edge-tts` and `numpy` installed (plus ffmpeg on PATH):

    python -m venv .venv && .venv/bin/pip install edge-tts numpy
    .venv/bin/python -I tools/make_voice.py .      # Gunnar narration from SCRIPT.md -> assets/voice + audio_meta.json
    .venv/bin/python -I tools/make_chiptune.py .   # chiptune bed + 8-bit SFX from STORYBOARD.md `sfx:` lines

Then: `node <faceless-explainer>/scripts/audio.mjs sync-durations ...`, captions, assemble-index.
The pixel caption look is `.hyperframes/caption-skin.html`; fonts are in `assets/fonts/`.
After assembly, voice was boosted +7 dB (alimiter) and SFX volumes set to 0.12 / 0.08 in audio_meta.json.
