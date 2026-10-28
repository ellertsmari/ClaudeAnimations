---
workflow: faceless-explainer
flow: automation
storyboard: yes
message: "Lærðu átta orð — þá skilur þú áfangann: hvað þú gerir, hvernig þú færð einkunn og hvar þú færð hjálp."
destination: canvas
aspect: 1920x1080
language: is
audience: "Nemendur á Íslenskubraut Tækniskólans (16–20 ára, íslenska sem annað mál, sumir byrjendur) í UPPT1ÍA03AT, spönn 2, haust 2026"
length: 80s
angle: listicle
narration: yes
voice: is-IS-GunnarNeural
voice_rate: "-10%"
style_preset: orðabókin (custom picture-dictionary flashcards)
---

## Intent

A short welcome film that explains the course plan (námsáætlun) of UPPT1ÍA03AT in very simple Icelandic. It will sit on the Canvas front page and be shown in class on the first day. The audience is students learning Icelandic as a second language, so the film doubles as a vocabulary lesson.

Chosen concept (pitch 1, "Orðabókin"): a picture dictionary. The film teaches the 8 words a student needs to understand the course — námsáætlun, verkefni, stig, hópverkefni, einkunn, mæting, skila, hjálp. Each word arrives as a big flashcard with a simple invented picture and one short sentence; the narrator says the word, then the sentence. Opens: "Lærðu átta orð. Þá skilur þú áfangann." Optional: borrow a typing effect for how each word appears.

Approved draft script (user confirmed):

0. Velkomin í upplýsingatækni! Lærðu átta orð. Þá skilur þú áfangann.
1. námsáætlun — Námsáætlun segir hvað þú lærir og hvernig þú færð einkunn.
2. verkefni — Í hverjum tíma gerir þú eitt verkefni.
3. stig — Hvert verkefni gefur 10 stig. Byrjaðu alltaf á Hluta 1.
4. hópverkefni — Í nóvember og desember vinnur þú í hóp.
5. einkunn — Lokaeinkunn er 1 til 10. Þú þarft 5.
6. mæting — Mættu í tíma. Minnst 80%.
7. skila — Skilaðu sama dag. Þú mátt bæta til 11. desember.
8. hjálp — Segðu: „Geturðu hjálpað mér?“
End. Þetta er stutt yfirlit. Opinbera námsáætlunin er í Canvas.

## Customizations

- Icelandic narration, Microsoft Edge neural voice is-IS-GunnarNeural via edge-tts, slowed about 10% for language learners. Reuse `../videos/player-2-wanted/tools/make_voice.py` approach; venv with edge-tts at `../videos/vefskolinn-kynning/.venv`.
- Every spoken sentence is also written large on screen (the on-screen text is part of the lesson).
- Gentle, quiet background music made in code; a soft card-flip sound per card.
- Font must carry þ ð æ ö á é í ó ú ý — test before building.
- Storyboard web page with stills before the build.

## Notes

- Same content rules as the Canvas front page: promise as little as possible about the projects (no project titles, topics or project dates). Only fixed dates: 19. okt, 16. nóv, 11. des, 16. des.
- Ending (user change after first preview): no "official námsáætlun" disclaimer — it is obviously just a video. Close on "Mundu að spyrja kennarann um hjálp. Það má alltaf hjálpast að. Gangi þér vel!" after "Nú kanntu átta orð".
- No student names or student data. Teachers' first names only (Ellert Smári, Jakub) if needed.
- Icelandic only, no English glosses.
- Project lives at `~/Documents/claudeMovies/introToUppt` (user's choice). Add a row to `../STYLE-LIBRARY.md` at the end.
