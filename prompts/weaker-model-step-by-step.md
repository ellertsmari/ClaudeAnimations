# Prompts for a weaker model: tell it exactly what to do

Use these with a smaller, older or free model (for example Haiku, a free tier,
or a model running locally). A weaker model can still write a good scene, but
it gets lost when it has to plan a whole film, choose tools and invent a style
at the same time. So **you** make those decisions and give it:

- **the process:** one phase per message, and it stops after each one;
- **the tools:** exact commands, exact file names, and nothing else;
- **the style:** a fully specified style card, so it doesn't have to invent one;
- **a working example:** the `starter/` project in this folder, which passes `npm run check`;
- **a check after every step:** it runs a command and shows you the output.

Send one phase per message. Don't move on until the check passes.
If it gets stuck, paste the exact error back, or start that scene again in a new chat with Phase 0 + the phase you're on.

Replace everything in `[brackets]`.

**Before Phase 1:** take 3–4 screenshots of your page (1920×1080 is easiest) and put
them in `films/my-launch-film/assets/shots/`. The film is built from them.

---

**Choose the voice yourself** (skip this for a film without voice). The model can't
hear, so make two or three demos and listen to them:

```sh
python3 -m venv .venv && .venv/bin/pip install edge-tts
.venv/bin/edge-tts --list-voices | grep en-        # or is-, pl-, es- …
.venv/bin/edge-tts --voice en-GB-RyanNeural --text "Meet Recipe Finder." --write-media demo-ryan.mp3
```

---

## Phase 0 · Rules (send this first, every new chat)

```text
You are helping me make a [40]-second launch film for my web page. We will use HyperFrames: the film is an HTML page animated with GSAP, and HyperFrames renders it frame by frame to an MP4.

Tools you may use. Do not use any other tools or libraries:
- npx hyperframes (init, check, snapshot, preview, render, docs)
- GSAP 3 (already loaded in index.html from cdn.jsdelivr.net)
- ffmpeg and ffprobe
- python3 with edge-tts (only in Phase 5)

Rules for every HTML file you write:
1. The film is index.html. Each scene is its own file, compositions/sN.html, mounted in index.html with data-composition-src.
2. Every timed element has data-start and data-duration (seconds) and class="clip".
3. Each file has ONE GSAP timeline created with gsap.timeline({ paused: true }) and registered as window.__timelines["<composition-id>"]. Never call play().
4. Times inside a scene file start at 0 for that scene.
5. No Math.random(), no Date.now(), no fetch, no setTimeout or setInterval. The same frame must always look the same.
6. CSS ids and classes must not start with a digit. Prefix every id with the scene id (s1-title, s2-shot).
7. Fonts and images are local files in assets/. No web fonts from Google at render time.

Work in phases. I will send one phase at a time. At the end of each phase: run the check I ask for, show me the output, and STOP. Do not start the next phase until I send it.

First, run these and read the output:
  npx hyperframes docs compositions
  npx hyperframes docs data-attributes
  npx hyperframes docs gsap
Then explain the rules above back to me in your own words, in 7 short lines. Then stop.
```

## Phase 1 · Brief and script (no code yet)

```text
Phase 1. Write two files in the folder [films/my-launch-film]. Do not write any HTML yet.

BRIEF.md, with exactly these headings:
- Message: one sentence the viewer should remember: "[e.g. Recipe Finder tells you what to cook from what is already in your fridge.]"
- Audience: [e.g. classmates and teachers at demo day]
- Where it is shown: [projector, with sound]
- Length: [40] seconds, 1920x1080, 30 fps
- Voice: [none / English, en-GB-RyanNeural]
- Style: the style card below, copied in full

SCRIPT.md: a table with exactly 5 scenes and these columns:
| id | seconds | what we see | words on screen (max 6) | voice line (max 15 words, or "none") |
Scene s1 is the title. Scene s5 is the end card with the URL [URL]. Scenes s2–s4 show: the problem, the main feature, and one detail people will like. Use the screenshots in assets/shots/: [list the file names].
The seconds must add up to [40].

[PASTE THE STYLE CARD HERE]

Show me SCRIPT.md and stop.
```

## Phase 2 · Storyboard page

```text
Phase 2. Make storyboard.html in the same folder: a static web page (no GSAP, no JavaScript needed) that I can open in a browser.
For each scene in SCRIPT.md: one card with
- a 16:9 box, 640x360, that shows the scene's key moment in the style card's colours, fonts and layout (HTML and CSS only, use the real screenshots)
- the scene id and the start–end time
- the words on screen and the voice line
- one line: "what moves" (e.g. "headline slides up, screenshot scales in, accent bar wipes left to right")
Put the cards in a grid, 2 per row. Use the fonts from assets/fonts.
Tell me the command to open it (python3 -m http.server 8000) and stop. I will send you changes.
```

Then send changes like: `In s3, the words should be "Just type what you have". Make the screenshot bigger.`

## Phase 3 · Project + the first scene

```text
Phase 3. Set up the project and build ONLY scene s1.
1. Copy the starter project into [films/my-launch-film] (index.html, compositions/, package.json, hyperframes.json, meta.json). Keep BRIEF.md, SCRIPT.md and storyboard.html.
2. Put the fonts in assets/fonts:
     npm install @fontsource/inter @fontsource/space-grotesk
   then copy the latin .woff2 files you need from node_modules/@fontsource/*/files/ into assets/fonts and load them with @font-face.
3. Change compositions/s1.html so it matches the s1 card in storyboard.html and the motion rules in the style card. Keep the same structure as the starter file: <template>, <style>, a root div with data-composition-id="s1", one paused timeline registered as window.__timelines["s1"].
4. In index.html, set each scene's data-start and data-duration from SCRIPT.md, and set the root data-duration and the tl.to({}, { duration: N }) line to the total length.
5. Run:  npm run check
   Fix every error. Then run:  npx hyperframes snapshot --at 0.5,2,3.5 -o snaps
6. Start Studio so I can look at it myself:  npx hyperframes preview --background
7. Show me the check output, the paths of the snapshot images and the Studio link, and stop.
```

## Phase 4 · One more scene (repeat for s2, s3, s4, s5)

```text
Phase 4. Build ONLY scene [s2], in compositions/[s2].html, following the [s2] card in storyboard.html and the style card.
Copy the structure of compositions/s1.html exactly; only change the ids (prefix [s2]-), the content and the animation.
Add it to index.html if it isn't there yet. Then run: npm run check
and: npx hyperframes snapshot --range [START],[END] --frames 3 -o snaps
Show me the output and stop.
```

## Phase 5 · Voice (skip this if your film has no voice)

```text
Phase 5. Add the voice.
1. Make a Python virtual environment and install edge-tts:
     python3 -m venv .venv && .venv/bin/pip install edge-tts
2. For each scene with a voice line in SCRIPT.md, run:
     .venv/bin/edge-tts --voice [en-GB-RyanNeural] --rate=[-5%] --text "<the line>" --write-media assets/voice/<scene>.mp3
   Write numbers as words in the text ("forty", not "40").
3. Measure each file:  ffprobe -v error -show_entries format=duration -of csv=p=0 assets/voice/<scene>.mp3
4. If a voice clip is longer than its scene minus 1 second, make the scene longer and update SCRIPT.md, every data-start after it in index.html, and the total length.
5. Add one <audio> per clip inside the root div of index.html:
     <audio id="voice-<scene>" src="assets/voice/<scene>.mp3" data-start="<scene start + 0.4>" data-duration="<clip length>" data-track-index="10" data-volume="1"></audio>
6. Run npm run check, show me the output and a table of scene, clip length and scene length, and stop.
I will listen to the voice myself.
```

**Music:** if you want music, put a track you are allowed to use at `assets/music.mp3` and ask for one more `<audio>` line on track 11 with `data-volume="0.15"`. A strong model can also write music in code; a weak one usually can't.

## Fix · One exact change (after you've watched it in Studio)

Open Studio (`npx hyperframes preview --background`), pause where something is
wrong and click it. The Compositions list tells you the scene file and the
Inspector tells you the id. Studio shows the time in the whole film, but each scene
file counts from 0, so subtract the scene's start. One change per message:

```text
Change only compositions/[s3].html. [#s3-shot] starts its animation at [0.8] s, which is too early. Start it at [1.6] s instead, and change nothing else.
Then run npm run check and npx hyperframes snapshot --range [START],[END] --frames 3 -o snaps, show me the output and stop.
```

## Phase 6 · Render and write it down

```text
Phase 6.
1. Run npm run check. It must pass with 0 errors.
2. Render: npx hyperframes render -o renders/film.mp4
   Tell me how long the render took.
3. Make a small copy for slides:
     ffmpeg -i renders/film.mp4 -vf scale=-2:720 -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 128k renders/film-720p.mp4
4. Add a row to ../STYLE-LIBRARY.md (create it from the template if it doesn't exist): the style name, the technology, this film, how to make another one, what broke and how we fixed it, and the render time.
Then stop.
```

---

## The style card (copy it into Phase 1)

A weaker model needs exact values. Use this one, or make your own with the same headings.

```text
STYLE CARD: "Bold poster"
Canvas: 1920x1080, 30 fps.
Colours (use only these):
  paper #F4EFE6 · ink #111111 · accent #FF4F1F · blue #2F5BFF
  A scene uses at most 3 of them. Text is ink on paper, or paper on ink.
Fonts:
  Headlines: Inter 900, 140–180 px, letter-spacing -0.04em, max 6 words per screen.
  Small labels: Space Grotesk 500, 32 px, UPPERCASE, letter-spacing 0.08em.
Layout:
  Left-aligned. Text starts at x = 160 px. Keep 100 px clear on every edge.
  Screenshots sit in a simple browser frame: 12 px ink border, 40 px top bar, 8 px hard ink shadow offset (no blur).
Motion:
  Things enter in 0.5 s with ease "power3.out" (y: 60 → 0, or scale 0.9 → 1).
  Several items: stagger 0.08 s.
  After the last item arrives, HOLD at least 1.5 s with nothing new happening.
  Only one thing moves at a time. Nothing moves at constant speed except progress bars.
  The title is already on screen at 0 s (the first frame is the thumbnail).
Between scenes:
  A hard cut, or an accent-colour panel that wipes across the screen in 0.4 s (ease "power2.inOut").
End card:
  The page name, the URL, and nothing else. Hold it for 3 s.
Avoid:
  Gradients, glows, blur, emoji, stock icons, rotating 3D, more than 6 words on screen.
```
