---
workflow: general-video
flow: automation
storyboard: no
message: "Every frame of a film can be a web page, and you can make one by talking to Claude."
audience: Vefskólinn web development students (guide 4.4, Motion and video)
destination: GitHub Pages tutorial + classroom projector
aspect: "16:9"
length: 70-75 s
language: en
voice: none (music and sound effects, readable muted)
---

# View Source · a film about the "Animations with Claude" guide

## The ask (Smári's words)

> "make a video that explains this guide to the students and upload it as a 6th
> example. Surpise me with the style and focus on making it into something that
> will make the students eager to try to make a video themselves, something that
> will blow their minds. This one time I want you to make the whole video"

## Intent

"View Source": the film opens on a cinematic title, then a cursor right-clicks
it, picks **Inspect**, and Chrome DevTools slides in: the film is HTML. Editing
the text in DevTools rewrites the title live. Then the real five films (each
tagged like a DevTools element), the real prompts as a conversation, the 11
steps through a projector gate, the render as a flipbook, the guide page with
its model toggle, and a last reveal: this film was made from one message,
overnight.

## Notes

- Source of facts: the guide (`~/vefskolinn/presentations/animations-with-claude`)
  and the five films in `~/Documents/claudeMovies`.
- Quotes on screen are Smári's real prompts from the guide's "Our real prompts".
- No voice: the students' films must work muted, so this one does too.
- Music and effects are written in code (`tools/make_music.py`), like our other films.
