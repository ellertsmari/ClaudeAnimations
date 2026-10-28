---
workflow: general-video
flow: companion
storyboard: yes
message: "Thanks to El Rincón we have our own LMS on their Isard server, a shared GitHub workflow from Tibu, and years of growth and memories — gracias."
destination: presentation (projector, Tækniskólinn international week)
aspect: 1920x1080
language: en
audience: "Teachers from I.E.S. El Rincón (Gran Canaria) visiting Tækniskólinn — know the Sustainable Island project, not the details; know Tibu well"
length: ~107s (user asked ~90 s; flagged on the storyboard)
angle: narrative
narration: yes — English, edge-tts en-GB-RyanNeural at -2% (alternatives on the storyboard)
style_preset: custom clay stop-motion (Three.js plasticine, 12 poses/s on twos at 24 fps)
---

## Intent

Stop-motion clay film introducing Vefskólinn and the Sustainable Island partnership to El Rincón teachers.
Must cover: our own LMS (the Sustainable Island LMS, sustainable-island.ieselrincon.es) hosted on the Isard
server at El Rincón; Tibu's GitHub guide used by us and Heinz; the effect of El Rincón on us — in the user's words:
"professional development with great teachers and good memories to share with many groups of students who have now graduated".
Keep io.vefskoli.is (Vercel) separate from the LMS on Isard.

## Cast (storyboard/cast.js)

Smári, Jakub, Tibu (Tiburcio Cruz, El Rincón teacher on the project), Heinz (Heinz Kanstrup, TECHCOLLEGE Aalborg),
Alberto (El Rincón). Nira is named in the narration but has no puppet yet (no photo).

## Customizations

- Clay engine: storyboard/clay.js (lumpy fingerprinted materials that boil per pose, stepped time, light flicker),
  puppet.js + head.js (pressed-on hair/beard layers), props.js, scenes.js (all shots, timed to narration word timings).
- Same engine renders the storyboard and will render the film.
- Music: tools/make_music.py (ukulele/pizzicato/glockenspiel, 100 BPM, F major) -> assets/music/score.mp3.
- Voice: tools/make_voice.py (respelled names) -> assets/voice/*.mp3 + voice.json; tools/make_timeline.py -> assets/timeline.json.
- Subtitles: English, sentence chunks (captions() in scenes.js).

## Notes

- Storyboard: storyboard.html (needs http: `python3 -m http.server 8765` in this folder). Open questions are on the page.
