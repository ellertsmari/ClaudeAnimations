---
workflow: faceless-explainer
flow: companion
storyboard: yes
message: "Gervigreind skrifar kóða — verðmætin felast í að stýra henni. Vefskólinn kennir það á einu ári."
destination: presentation (school screen / projector)
aspect: 1920x1080
language: is
audience: "19–20 ára nemendur sem eru að ljúka stúdentsprófi"
length: 116s (64 bars @ 132 BPM)
angle: narrative
narration: no (music only)
style_preset: custom neo-punk expressive pixel art (user's art-direction brief; 320x180 x6, 24 fps on twos)
---

## Intent

Third version (v3), separate from ../vefskolinn-kynning (v1 paper / v2 neon). Same school facts, much more emphasis on AI:
the programme may be renamed "AI assisted web development" (Icelandic used: "Vefþróun með gervigreind" — to confirm).
Opens on "Gervigreind skrifar kóðann. Til hvers að læra?" → "Einhver þarf að stýra henni."
Core scene: Lýstu → Gervigreindin smíðar → Prófaðu og lestu kóðann → Útskýrðu → Þú átt hverja línu.

## Customizations

- Follows the user's pasted art direction "Neo-Punk Expressive Pixel Art": flat 2–5 colour poster fields
  (black, cream #F3E4C6, orange #FF5A1F, blood red #C8102E, electric blue #1E3CFF, acid green #A8FF1A),
  lopsided characters with sharp teeth and mismatched eyes, drawings on twos, boiling outlines, 1–2 frame flash
  interruptions (max 2 per scene, no strobing), jump cuts, extreme close-ups, light grain.
- The AI is an acid-green one-eyed spiky creature (turns red when wrong). Two teachers with full hair + beards.
- Font: Jersey 15 at exactly 22px (its pixel grid; R, Ð, Þ, Á stay intact) and whole multiples. Micro 5 broke M/Ð, other sizes turned R into A, blackletter was unreadable. Keep a top margin so accents are not clipped.
- Music: original acid-punk, tools/make_music3.py -> assets/music/score.mp3; 303 acid line = the AI.

## Notes

- Storyboard engine: storyboard/px3.js, cast3.js, scenes-data3.js, scenes3.js.
- Open questions are on storyboard.html ("Your call").
