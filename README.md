# Animations with Claude · tutorial

A step-by-step tutorial for Vefskólinn students (guide 4.4, Motion and video) on
making a short film with a coding agent, the way we made ours in autumn 2026:
the watercolour island film, *Player 2 óskast*, the neo-punk *Vefþróun með
gervigreind*, *Orðabókin*, and the clay stop-motion *From one island to
another* for the El Rincón teachers.

It is built from those projects in `~/Documents/claudeMovies` (the briefs,
`STYLE-LIBRARY.md`, the tool scripts) and from the prompts we actually sent in
those Claude Code sessions.

## What's in it

The page starts with our five films, each with the files behind it, then
walks through eleven steps (00–10): set up, your message, pitches, voice,
plan, storyboard page, checking the letters, build, review, render, and
writing it down. Step 08 (Review) shows HyperFrames Studio in an annotated
screenshot and explains how to point the agent at an exact frame and element.

At the top, students pick which model they use, and the steps change to match.
There is a big toggle in the hero, a small one in the contents, and one that
floats at the bottom on phones. The choice is remembered in the browser, and
`index.html?model=weak` or `?model=strong` opens the page in one mode (handy
for a link in the LMS).

- **Claude Opus 5.5 · explore**: short, conversational prompts that ask for
  pitches and options, keep checkpoints ("show me the storyboard first"), and
  leave the decisions to the student. Modelled on our real prompts.
- **Weaker model · step by step**: one phase per message (rules, brief and
  script, storyboard, one scene at a time, voice, render). Each phase names the
  exact tools, commands and file names, and ends with a check and a stop. It
  comes with a fully specified style card, so the model doesn't have to
  invent a look. The student makes the voice demos and writes exact fixes
  (scene file, id, time) themselves.

A "Why two ways?" box under How it works compares the two. "All the prompts"
lists every prompt from the steps for the chosen model (built by `app.js`
from the steps, so there is only one copy to edit). After that: our real
prompts, a troubleshooting table and a suggested hand-in list.

## Run it

Serve the folder and open the link it prints:

```sh
npx serve .
# or: python3 -m http.server 8000
```

Most of the page works straight from disk too, but the clay storyboard loads
ES modules and `fetch()`es its timeline, which browsers only allow from a
server, and the Copy buttons need http://localhost for the clipboard. Step
ticks are saved in the viewer's browser only.

To open one of the films in HyperFrames Studio (step 08):

```sh
npx hyperframes preview examples/clay          # prints a localhost link
npx hyperframes preview examples/clay --stop
```

## Files

- `index.html`, `styles.css`, `app.js`: the tutorial page
- `prompts/opus-explore.md`: the Opus prompts, in order, ready to copy
- `prompts/weaker-model-step-by-step.md`: the phase prompts and the style card
- `starter/`: a two-scene HyperFrames project (`index.html` and
  `compositions/s1.html`, `s2.html`). It passes `npm run check` with no errors
  or warnings on hyperframes 0.8.209 and renders 8 s in about 16 s. The
  weak-model prompts copy it.
- `templates/STYLE-LIBRARY.md`, `templates/BRIEF.md`: blanks for students
- `assets/`:
  - `clay.mp4` + `clay.jpg`: a 720p copy of *From one island to another*
    (the 86 MB original is in `~/Documents/claudeMovies/videos/el-rincon-clay/renders/`)
  - `ordabokin.mp4` + poster: the Orðabókin film (from `introToUppt-glaerur`)
  - `studio.jpg`: Studio with the Player 2 film at 0:19 and one element
    selected, used in step 08 with numbered markers
  - The island, Player 2 and neo-punk films are loaded from
    `../introToModule4/assets/`, so they aren't stored twice. If this folder is
    moved on its own, copy `island.mp4`, `player2.mp4`, `neopunk.mp4` and their
    `.jpg` posters into `assets/` and change the paths in `index.html`.
- `examples/`: copies of the files behind each film, linked under the film on
  the page. Copied from `~/Documents/claudeMovies` and
  `~/vefskolinn/sustainable-island-film` in late October 2026, so they won't
  pick up later changes.
  - `STYLE-LIBRARY.md`: the full style library
  - `watercolour/`: `STORYBOARD.md`, `ANIMATION_GUIDE.md` and its two model sheets
  - `player-2/`, `neo-punk/`, `clay/`, `ordabokin/`: complete HyperFrames
    projects (`index.html`, `compositions/` or the engine scripts, `assets/`),
    plus the storyboard page, the `.md` files and the Python tools for voice
    and music. Only the files each film loads were copied. The WAV audio was
    converted to MP3 in the copies (and the HTML updated to match), which
    brings them from 105 MB to 17 MB, so the sound is a little lower quality
    than the originals. All four pass `hyperframes check` with 0 errors, and a
    snapshot at 20 s matches the film. For a full-quality render, use the
    originals.
  - Not copied: the rendered films, `.venv` folders, and the El Rincón casting
    page (it has photos of people from the hero video).

## Before presenting

- The install commands and CLI flags were checked on 27 October 2026
  (hyperframes 0.8.209, edge-tts 7.3.1). HyperFrames moves fast, so rerun
  `npx hyperframes <command> --help` if something has changed.
- The "Our real prompts" section quotes your own messages verbatim (typos kept on
  purpose) and leaves out colleagues' names in the El Rincón prompts. Check
  you're happy to show them.
- The clay film shows colleagues from El Rincón and TECHCOLLEGE as puppets.
  Check they're fine with it being shown to students.
- The hand-in list in the last section is a suggestion. Align it with the 4.4
  guide in the LMS.
