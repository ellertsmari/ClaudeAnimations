---
format: 1920x1080
duration: 80s
message: "Lærðu átta orð — þá skilur þú áfangann: hvað þú gerir, hvernig þú færð einkunn og hvar þú færð hjálp."
arc: listicle — hook → 8 co-equal word cards → recap + wrap
audience: "Nemendur á Íslenskubraut (16–20 ára, íslenska sem annað mál) í UPPT1ÍA03AT"
mode: collaborative
music: none
---

# Orðabókin — UPPT1ÍA03AT á átta orðum

One consistent stage for frames 2–9: a white **flashcard** (4px black border, 8px hard shadow) tilted −2° on the left two-thirds, on a pastel ground that cycles each card (blue → pink → green → yellow → cream → blue → pink → green). On the card: a label-pill "orð N af 8", the **headword in lowercase** (dictionary style, Inter 900, the biggest thing on screen), and under it the one sentence in large Inter 600 sentence case (≥ 2.8cqw). The sentence highlights word by word as Gunnar says it (karaoke, from the voice's word timings). On the right third, a simple invented picture made of BlockFrame shapes (bordered squares, pills, star bursts) that shows the word's meaning. The headword types itself in letter by letter (borrowed typing effect), then the picture pops in, then the sentence plays.

Narration pattern per card: Gunnar says the **word alone**, a short pause, then the **sentence**. The on-screen sentence is the caption — no separate caption track.

## Video direction

- Design: BlockFrame (`frame.md`) — 4px/8px black borders + hard shadows, five pastels cycled per card, Inter 900 headword in **lowercase** (dictionary convention, deliberate override of the preset's uppercase display), Space Grotesk chrome pills.
- Stage: frames 2–9 share one flashcard composition (card left, invented picture right, 8-square progress top-right). Built by `tools/build_frames.py` so all cards are identical in structure.
- Motion per card: card pops in (back.out) → progress square fills → grammar pill pops → headword types letter by letter just before Gunnar says it → sentence appears dimmed → each word lights up yellow as it is spoken (karaoke from edge-tts word timings) → picture parts pop in one by one across the sentence. Slow card drift underneath; no exits (the push-slide seam is the exit).
- Exception to the worker rule "never render narration as text": the on-screen sentence IS the lesson and the caption; the separate caption track is skipped.
- Seams: push-slide LEFT between word cards (a deck being flipped), crossfade into the ending. Soft flip SFX on each card; gentle code-made music bed.

## Frame 1: Velkomin (0–7s)

- act: Inngangur
- type: hook
- persuasion: promise of a small, finite task (8 words → you understand the course)
- beat: welcome, curiosity, "this is doable"
- scene: Eight flashcards fan out like a hand of cards; title "Orðabókin" over them, pill "UPPT1ÍA03AT · Upplýsingatækni"; a star burst says "8 orð".
- duration: 8.068s
- transition_in: cut
- blueprint: kinetic-type-beats
- status: animated
- voiceover: "Velkomin í upplýsingatækni! Lærðu átta orð. Þá skilur þú áfangann."
- src: compositions/frames/01-velkomin.html

narrativeRole: Welcomes the student and turns "understand the course plan" into a small, countable task.
keyMessage: Eight words are enough to understand this course.

## Frame 2: námsáætlun (7–15s)

- act: Orðin
- type: feature_showcase
- persuasion: define-by-function (what the thing does for you)
- beat: orientation
- scene: Card 1 of 8 on blue. Picture: a bordered "plan" sheet with three rows that tick in — a book icon (hvað þú lærir), a calendar (hvenær), a star badge "einkunn".
- duration: 7.21s
- transition_in: push-slide LEFT
- status: animated
- voiceover: "Námsáætlun. Námsáætlun segir hvað þú lærir og hvernig þú færð einkunn."
- src: compositions/frames/02-namsaaetlun.html

narrativeRole: Names the thing the whole film is about and says what it is for.
keyMessage: The námsáætlun tells you what you learn and how you get a grade.

## Frame 3: verkefni (15–22s)

- act: Orðin
- type: feature_showcase
- persuasion: concrete routine (one class = one task)
- beat: "I know what to do each day"
- scene: Card 2 of 8 on pink. Picture: a laptop block with ONE task card on its screen; a small row of four day-pills (mán · þri · mið · fim), each lighting up with "1 verkefni".
- duration: 5.891s
- transition_in: push-slide LEFT
- status: animated
- voiceover: "Verkefni. Í hverjum tíma gerir þú eitt verkefni."
- src: compositions/frames/03-verkefni.html

narrativeRole: Sets the daily rhythm of the course.
keyMessage: Every class has one task.

## Frame 4: stig (22–30s)

- act: Orðin
- type: feature_showcase
- persuasion: visual arithmetic (6 + 2 + 2 = 10)
- beat: clarity, "start easy"
- scene: Card 3 of 8 on green. Picture: a 10-block bar that fills in three chunks — 6 green blocks "Hluti 1", 2 yellow "Hluti 2", 2 pink "Hluti 3"; a pointer arrow on Hluti 1 says "byrjaðu hér".
- duration: 7.952s
- transition_in: push-slide LEFT
- status: animated
- voiceover: "Stig. Hvert verkefni gefur 10 stig. Byrjaðu alltaf á Hluta 1."
- src: compositions/frames/04-stig.html

narrativeRole: Explains how one task is scored and lowers the threshold (part 1 first).
keyMessage: A task is worth 10 points, and you always start with Hluti 1.

## Frame 5: hópverkefni (30–37s)

- act: Orðin
- type: feature_showcase
- persuasion: show, don't list (three people around one card)
- beat: belonging
- scene: Card 4 of 8 on yellow. Picture: three simple bordered figure-blocks (pastel heads, no faces, no names) around one shared task card; two month-pills "nóvember" and "desember".
- duration: 6.391s
- transition_in: push-slide LEFT
- status: animated
- voiceover: "Hópverkefni. Í nóvember og desember vinnur þú í hóp."
- src: compositions/frames/05-hopverkefni.html

narrativeRole: Says that there is group work, without naming any project or date.
keyMessage: In November and December you work in a group.

## Frame 6: einkunn (37–45s)

- act: Orðin
- type: feature_showcase
- persuasion: scale with a marked threshold
- beat: "I know the goal"
- scene: Card 5 of 8 on cream. Picture: a ruler of ten bordered squares 1–10; squares 1–4 stay white, a pointer lands on 5 marked "þú þarft 5", squares 5–10 fill green.
- duration: 7.216s
- transition_in: push-slide LEFT
- status: animated
- voiceover: "Einkunn. Lokaeinkunn er 1 til 10. Þú þarft 5."
- src: compositions/frames/06-einkunn.html

narrativeRole: Gives the passing line in one picture.
keyMessage: The final grade is 1–10, and you need 5 to pass.

## Frame 7: mæting (45–52s)

- act: Orðin
- type: feature_showcase
- persuasion: proportion made visible (8 of 10 blocks)
- beat: firm but friendly
- scene: Card 6 of 8 on blue. Picture: ten bordered class-blocks in a row; eight get a check mark one by one, a bracket over them says "80%".
- duration: 7.146s
- transition_in: push-slide LEFT
- status: animated
- voiceover: "Mæting. Mættu í tíma. Minnst 80%."
- src: compositions/frames/07-maeting.html

narrativeRole: States the attendance rule.
keyMessage: Come to class — at least 80% of the time.

## Frame 8: skila (52–61s)

- act: Orðin
- type: feature_showcase
- persuasion: two-step rule (deliver today, improve later)
- beat: relief ("I can fix it")
- scene: Card 7 of 8 on pink. Picture: a yellow button "Skila" gets pressed (a hard-shadow press); a curved arrow loops back to it labelled "bæta", ending at a calendar tag "11. desember".
- duration: 7.813s
- transition_in: push-slide LEFT
- status: animated
- voiceover: "Skila. Skilaðu sama dag. Þú mátt bæta til 11. desember."
- src: compositions/frames/08-skila.html

narrativeRole: The hand-in rule plus the safety net of resubmitting.
keyMessage: Hand in the same day; you may improve your work until 11 December.

## Frame 9: hjálp (61–68s)

- act: Orðin
- type: feature_showcase
- persuasion: give the learner the exact phrase to say
- beat: safety
- scene: Card 8 of 8 on green. Picture: a big bordered speech bubble with „Geturðu hjálpað mér?“ and a star burst; a small hand-raise block.
- duration: 5.391s
- transition_in: push-slide LEFT
- status: animated
- voiceover: "Hjálp. Segðu: Geturðu hjálpað mér?"
- src: compositions/frames/09-hjalp.html

narrativeRole: Ends the list with permission and a ready-made sentence for asking for help.
keyMessage: When you don't understand, say "Geturðu hjálpað mér?".

## Frame 10: Nú kanntu átta orð (68–80s)

- act: Lok
- type: cta
- persuasion: recap grid (retrieval practice) + pointer to the official source
- beat: confidence, closure
- scene: The eight words land as a 4×2 grid of small bordered cards (each in its pastel). Then they slide up and an inverted black close-frame with the yellow shadow says "Mundu að spyrja kennarann um hjálp." and "Það má alltaf hjálpast að."; small sign-off "Gangi þér vel!".
- duration: 11.902s
- transition_in: crossfade
- blueprint: grid-card-assemble
- status: animated
- voiceover: "Nú kanntu átta orð. Mundu að spyrja kennarann um hjálp. Það má alltaf hjálpast að. Gangi þér vel!"
- src: compositions/frames/10-lok.html

narrativeRole: Reviews the vocabulary once and ends on a warm reminder that asking for help is always fine.
keyMessage: You know the eight words — ask the teacher, help each other, good luck.
