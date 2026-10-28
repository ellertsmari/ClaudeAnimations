# The Sustainable Island 2027: how we use AI

**Logline:** Students from three schools build an app with AI on one island; they catch what the AI gets wrong, keep notes every day, explain their code at the group visits, take a day off on a bus trip, and turn their notes into a report that gets graded.

**Length:** 69.6 s at 24 fps, 1920×1080, 100 bpm (a beat is 0.6 s, a bar 2.4 s; every shot starts on a bar line).

**World:** one small painted island in the Atlantic, with a little volcano (the Canaries and Iceland both have them). Paper and watercolour, boiling ink lines, flat 2D.
- **Palette:** sea teal, sand, basalt, paper; the three schools are lava orange (El Rincón), Atlantic blue (Tækniskólinn) and moss green (TECHCOLLEGE). The AI is a warm four-point sparkle.
- **Colour arc:** dawn (arrival) → bright day (work) → evening (notes) → day (visits, bus trip) → days and nights racing → golden hour (the report) → sunset (the grade) → dusk (departure).

**No mascot.** People are simple painted figures in their school's colour. Teachers wear a lanyard. The AI is a sparkle that floats by the laptop; it flickers orange when it's wrong.

**Motif:** paper pages. The student's blue page and the AI's green page appear every evening, pile up, and fly together into the report.

**Sound:** narration (Kokoro, voice af_heart, tts/narration.txt), original music at 100 bpm (marimba, pad, bass, light percussion) and sound effects on every event, made in audio/make_audio.py. The music ducks under the voice.

**Title cards:** short painted words, never over a transition.

## Shots (video time)

| shot | time | what happens | transition in | narration starts | card |
|---|---|---|---|---|---|
| A | 0.0–9.6 | Dawn. Three boats in the school colours sail in from three sides; people step off and meet in the middle | fade up from paper | 1.2 | The Sustainable Island 2027 |
| B | 9.6–16.8 | Under an awning, a student directs; blocks fly out of the laptop and click into a tower; the AI sparkle glows brighter with each | push into light | 10.2 | Use AI freely |
| C | 16.8–24.0 | The sixth block lands (cut on action). Block 4 glows orange and buzzes; a key floats away; the student notices (!), catches it, locks it in a box; the block is fixed | cut on action | 17.4 | Check its work. Own every line. |
| D | 24.0–31.2 | Evening. The student writes a blue page, the AI writes a green one; both fly into the folder | brush wipe | 24.6 | Every day: your notes + the AI's account |
| E | 31.2–40.8 | 21 January. Eight tables of mixed students; three teacher pairs, each from two countries, walk in. Close: one asks (?), one ticks five boxes as the students explain in turn; the pair walks on | iris open | 31.8 | 21 January: group visits |
| F | 40.8–48.0 | 22 January. A bus of mixed students drives the coast road past the volcano to the beach; they jump into the surf | whip pan | 41.4 | 22 January: around the island |
| G | 48.0–52.8 | 25–28 January. Four days and nights race past; two pages land on the pile each evening; day dots fill | brush wipe | 48.4 | — |
| H | 52.8–60.0 | Golden hour. The pile whirls up into a report with six bands; the orange "what the AI got wrong" band glows | light flash | 53.2 | The AI report, built from your notes |
| I | 60.0–69.6 | A stamp swings in and lands with a thud: a green tick. Brush wipe to the island at sunset; the three boats sail away | continuous, then brush wipe | 60.6 | Graded on how well you understand it · Use AI. Own every line. Show your work. |

Out: fade to paper.

## Build and render

```bash
~/.venvs/tts/bin/python tts/speak.py af_heart          # narration, one WAV per shot
~/.venvs/tts/bin/python audio/make_audio.py af_heart   # music + effects + voice → out/mix.wav
node render.mjs --frames --workers=4                   # frames → out/frames
node render.mjs --encode --out=out/video.mp4           # MP4 with out/mix.wav
```

Change a line in tts/narration.txt, re-run the first two commands and `--encode`: the pictures don't need re-rendering unless a line gets longer than its shot.
