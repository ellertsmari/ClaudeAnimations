# SPEC · View Source

GOAL:    a student finishes the film thinking "that was a web page? I want to make one", and opens the guide.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps.
TIME:    74 s x 30 = 2220 frames. 120 BPM: 15 frames a beat, 60 a bar; bars on every even second.

LOOK:    the guide's own brand, one world per scene:
         ink #17140f · paper #f3eee4 · card #fbf8f2 · safety orange #e5461c (accent: the edited word, "Your turn.", "Claude" on the end card) · teal #1d6b73 · strip brown #2a251d.
         Display: Space Grotesk 700, titles 150-240 px, tracking -0.035em. Chat: Atkinson Hyperlegible 400/700 at 50 px.
         Code and DevTools: JetBrains Mono 400/600, 28-34 px.
         Chrome as it really looks: tab strip #dee1e6, active tab #ffffff, omnibox #f1f3f4 (radius 22 px);
         DevTools dark #202124, toolbar #292a2d, text #e8eaed, tag #5db0d7, attribute #9bbbdc, value #f29766,
         selected row #2f4562, CSS property #35d4c7.
         Element highlight overlay: content rgba(111,168,220,.66), padding rgba(147,196,125,.55), margin rgba(246,178,107,.66).
         Depth: hard ink shadow 12 px 12 px 0, no blur. No grain, no glow.
OBJECTS: a Chromium window (tabs, omnibox, viewport), its context menu, DevTools (Elements + Styles), a mouse cursor 76 px tall,
         chat bubbles, a celluloid strip with sprocket holes (28 x 18 px, every 56 px), stills stacking like photographs, the guide's real hero screenshot.
MOTION:  arrivals expo.out 0.45-0.7 s; camera power2.inOut 0.6-0.9 s; zoom-through power3.in 0.6-0.9 s; strip pull-down power3.inOut 0.32 s with 10 px x-blur;
         hits are tl.set; words 0.07 s apart; landed titles hold dead still.
SHOTS:
  s1 0-10      Orange page "This is a film." full frame at 0 → pull back into Chrome (1.0-1.8) → cursor right-clicks (2.6) → Inspect (3.4) →
               DevTools docks; overlay on the h1 → double-click the text node, "film" → "web page", live in the page (4.9-6.0), hold →
               Styles: font-size scrubbed 180 → 900 px (8.1-9.0) → camera dives into the giant letters, ink flood (9.0-10.0).
  s2 10-22     Five real films, one per bar, each tagged by a DevTools tooltip (tag#id, dims, technology): clay (grows out of the ink),
               Player 2 (whip), neo-punk (hard cut), island (iris), Orðabókin (push up) → orange flood, "Five films. None drawn by hand."
  s3 22-34     Paper chat. "I want to try a different style now" → Claude's pitches roll like a slot machine, land on "4. Player 2 wanted" →
               "make me a website that shows the storyboard" → the real storyboard page rises and scrolls → "perfect, now do it!" →
               "On it. Scene 1 of 11…" counts → the ink bubble grows past the frame (33.2-34.0).
  s4 34-50.5   The 11 steps on a celluloid strip, one frame through the gate every 1.5 s, a projector clack per pull-down.
  s5 50.5-58   Teal. "Chrome photographs every frame." Stills fly onto a pile while the counter races 0001 → 2220; the pile riffles (flipbook) → "film.mp4" lands.
  s6 58-74     Impact: the guide's real page in Chrome → push in on "Which model are you using?" → cursor clicks Weaker, then Opus: the page swaps state →
               the orange button swallows the frame: "Your turn." → paper: "This film was made from one message." + Smári's quote →
               ink end card: "Animations with Claude", guide 4.4, the URL. Held 3.5 s.
SOUND:   music/effects in code (tools/make_music.py): near silence + soft pad until 10.0, drop on the zoom-through, groove,
         build 54-58, impact at 58.0, warm chord at 69.5 ringing out. Effects: clicks on clicks, ticks on typed keys, clacks on pull-downs,
         shutter ticks on captures, whooshes on whips. Music ~0.55, effects ~0.8 in the mix; peaks under -1 dBTP.
BANNED:  dark-navy void, glow, particles, purple gradients, glass cards, everything centred, fade-and-slide-up entrances,
         titles drifting after they land, three cards in a row, docked logo, typing into a prompt box as the opener.
QA:      0.0 (thumbnail: title readable) · 3.6 (DevTools + overlay) · 6.5 ("web page" in page and in DOM) · 9.95 (ink flood) ·
         10.6, 12.6, 14.6, 16.6, 18.6 (clips + tooltips) · 21 (line) · 25.2 (pitch landed) · 29 (storyboard) · 32 (count) ·
         35, 42, 49 (strip frames readable) · 53, 56.8 (counter, flipbook) · 59.4 (toggle) · 64 ("Your turn.") · 67.8 (quote) · 72 (end card).
