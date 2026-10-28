# Review · View Source

Made overnight from one message, with no checkpoints: Smári was asleep. These
are the calls I made alone, what I checked, and what I would change next.

## Creative calls

- **Storyline A, "View Source".** Three storylines are in `STORYLINES.md`. I
  built the one that shows the idea instead of telling it: the opening title
  gets right-clicked, inspected and rewritten in DevTools, so the first ten
  seconds prove "a film can be a web page" before any text says it.
- **No voice.** The guide tells students to make films that work muted, so this
  one does too. All the words are on screen, in English like the guide.
- **The guide's own brand**: ink, paper, safety orange, teal, Space Grotesk.
  Each scene gets its own world (orange page, Chrome, paper chat, film strip,
  teal darkroom, the real guide) so the cuts feel like chapters.
- **Real material only.** The five clips are from our films, the chat lines are
  Smári's real prompts from "Our real prompts", the storyboard page is the real
  Player 2 one, and the last scene uses screenshots of the guide itself with its
  model toggle.
- **The ending tells the truth about this film**: "This film was made from one
  message." That is the hook for students: they can do the same.

## What I checked

- `npx hyperframes check`: 0 errors. Warnings left on purpose:
  - `line_unread` on the slot-machine reel in the chat scene (22.9–24.8 s): the
    pitches are meant to blur past; the one that lands holds.
  - `nested_media_start_basis_ambiguous` on the clips in `films.html`: their
    `data-start` is local to the scene on purpose.
  - `contrast_aa_failure` on frames dimmed behind the film-strip gate (37 s).
- Snapshots at every scene start and middle, and five frames around every cut
  (`snapshot --review`). All looked right.
- Sound: measured, **not heard**. I can't listen, so I checked levels with
  FFmpeg instead. The mix (music at 0.65, effects at 0.8) is about −18 LUFS
  with a true peak of −1.3 dBTP. Every effect is placed at a time copied from
  the scene files, but whether it *feels* in sync needs a human ear.

## Render

`npx hyperframes render`: 74 s (2220 frames, 1080p, 30 fps) rendered in
1 min 6 s with 4 workers on the laptop, 22.7 MB. The final file measures
−18.9 LUFS with a true peak of −2.0 dBTP. The guide page has a 720p copy
(6 MB).

## Weakest parts (what I'd fix next)

1. **The 11 steps (34–50.5 s)** go by at 1.5 s each. The titles are readable,
   but the small pictures inside each frame (the terminal, the file list) are
   too small to read in that time. It works as rhythm, not as reading. A fix:
   fewer steps on screen (5 groups) with 3 s each.
2. **"I recommend 4: a retro arcade game."** is on screen 1.4 s before the chat
   scrolls. It should hold about 2.5 s.
3. **The zoom through the orange button (62.4–63.1 s)** passes over some
   blurred text of the guide on the way in. It's quick, but a cleaner zoom
   target would hide it.
4. **The music is plain.** It is made in code from simple saw waves and noise
   (`tools/make_music.py`), like the other films' music. A real track would lift
   the whole film.
5. The guide screenshots in the last scene were taken before this film was
   added, so the page in the film still says "Five films, five styles".
   The film shows screenshots of the guide from 28 October 2026. If the page
   changes a lot, retake `assets/img/guide-strong.jpg` and `guide-weak.jpg`.
