---
format: 1920x1080
duration: 81s
message: "Áttu hugmynd sem Canvas ræður ekki við? Við smíðum hana með þér og kennum þér að þróa hana áfram með gervigreind. Svaraðu á padletinn."
arc: story-explainer with how-to-process
audience: Kennarar í Tækniskólanum, ekki forritarar
mode: collaborative
music: original upbeat chiptune, ~120 BPM, 8-bit square/triangle/noise, generated in code; ducked under voice; level-up jingle on each LEVEL banner
voice: is-IS-GunnarNeural (Microsoft Edge neural, via edge-tts)
captions: Icelandic, pixel style (Jersey 10), bottom band
---

## Changes from v1

- User note (verbatim): "maybe instead of saying 'engin umsókn, engin frestur og þú þarft ekki að kunna að forrita' it would be beter to just say 'best er ef þú kannt alls ekki að forrita en hefur góða hugmynd um hvað þig langar til að gera' or something like that"
- Frame 10 rewritten as "Ideal Player 2" stat card with the new line.

## Locked

- Sketch sheet v2 (storyboard.html) approved by the user: "perfect, now do it!" — every frame's layout, copy and colors are locked. Open questions kept at their sheet defaults (both teach web dev; "Kennslukerfi #1 / #2"; generic pixel avatars; "borð" in VO, LEVEL on screen).

## Video direction

- **Palette (frame.md roles):** ground `night`, raised panels `night-2`, inactive cells `night-3`, text `ink` / `ink-dim`. Meaning colors only: cyan `p1` = Smári & Jakub, pink `p2` = the teacher / Player 2, yellow `coin` = where to look / selected / the ask, green `xp` = progress, unlocked, done. Max three accents per frame.
- **Furniture on every frame:** full-bleed night ground with a faint pixel starfield (own background clip), the CRT veil (scanlines + corner vignette) as the TOP layer, and the HUD bar on frames 02–11 (`1UP` score in cyan · `HI-SCORE 099999` in yellow · `2UP` + `PRESS START` in pink; frame 11 shows `READY?`). Frame 01 has no HUD. The 1UP score steps up between frames (004200 → 008400 → 012600) — decorative only.
- **Sprites:** reuse the exact pixel symbols from storyboard.html (`#hero`, `#bulb`, `#heart`, `#star`, `#chip`, `#chest`, `#coinico`, `#check`, `#cross`, `#joy`, `#win`, `#cur`) — copy the `<symbol>` defs into each composition and draw with `<use>`, `shape-rendering="crispEdges"`. Smári = cyan shirt, default dark hair; Jakub = cyan shirt, `--hair:#8a5a2b`. Player 2 is ALWAYS the pink ghost (opacity ~0.4–0.55, pink shirt and hair) until the final frame.
- **Motion grammar — arcade, deliberately stepped:** sprites, blinks, menu-cursor hops, panel opens and stamps move on hard steps (GSAP `steps(n)` eases, 2–4 steps) — this is the visual style, not jank. Banners, camera slides and cards rising use a smooth long-tail `power3` settle. Overshoot ONLY for explicitly playful game pickups (coin, power-up chip, achievement toast): a 2-step pop, never elastic. Text in dialog boxes types per character behind a yellow `▌` caret (`discrete-text-sequence`). Blinks are finite stepped opacity tweens over the hold (~2 Hz), never `repeat: -1`.
- **Reveal model:** every element enters on the word that names it (times below are frame-relative seconds taken from the real TTS word timings in audio_meta.json). At t=0 only the frame furniture and what the VO is saying exist.
- **Held frames:** 04 ends on a held read after the chip lands; 10 holds still after MAX; 11 holds the end card ~3 s. Holds are still — subtle jitter at most, on the one focal element.
- **Sound (generated in code, mounted by the assembler):** chiptune bed under everything, plus 8-bit SFX at the cue times listed in each frame's `sfx:` line (`name@seconds`). Builders never embed audio.
- **Negative list:** no glowing brains/robots/circuits, no gradients except the CRT vignette, no rounded corners, no blur, no smooth vector illustration, no Icelandic text in Press Start 2P (Jersey 10 for every Icelandic word, Silkscreen for small uppercase labels), nothing important in the bottom 17% caption band. Both motion failures banned: slideshow (dump then freeze) and screensaver (everything floating).

## Frame 1 — Title screen

- scene: Arcade title screen — "PLAYER 2" in Press Start 2P over "ÓSKAST" in Jersey 10, a spinning lightbulb-coin, blinking PRESS START; the question types into an RPG dialog box.
- voiceover: "Áttu hugmynd sem Canvas ræður ekki við?"
- duration: 4.53s
- poster: 4s
- transition_in: cut
- status: animated
- src: compositions/frames/01-title.html
- type: hook
- persuasion: Rhetorical question + direct address
- beat: curiosity + recognition
- blueprint: typewriter-reveal (Adapt)
- focal: the RPG dialog box with the typed question
- roles: PLAYER 2 / ÓSKAST logo = foreground title · dialog box = foreground subject · bulb-coins = supporting · starfield = background
- sfx: logo-drop@0.45, blip-hi@0.75, type-blips@1.68, blip-lo@3.95
- sketch: storyboard.html#frame-01

narrativeRole: Opens the gap in the teacher's own language — the thing they wished Canvas could do — and sets the whole video as a game they are invited into.
keyMessage: This is for you if you have an idea Canvas can't handle.

Adapt: keep the typewriter signature (the line types as a human would, caret blinking); the brand payoff is the arcade title already standing above it, and the "sub-line" is PRESS START.
Scene 1 (0.00–0.70s): starfield + CRT only; "PLAYER 2" (arcade-title, coin, hard pink offset shadow) drops from above the frame in 3 hard steps and lands at 0.45s, centered upper third.
Scene 2 (0.70–1.50s): "ÓSKAST" (display-hero, Jersey 10, p2) pops in under it on a 3-step scale (0.75s); the two bulb-coins appear at 1.0s left and right of the title and do one finite 3-frame spin.
Scene 3 (1.50–3.90s): the pixel-panel dialog box opens in 3 height steps at 1.45s (centered, ~64% width, just above the caption band); the question types per character from 1.68s, paced so "við?" completes at ~3.65s, yellow caret blinking after the last char.
Scene 4 (3.90–4.53s): "PRESS START" (hud-big, coin) blinks on at 3.95s with stepped opacity; hold. Footer label "© 2026 SMÁRI & JAKUB · VEFSKÓLINN" (Silkscreen, ink-dim) is present from 1.0s, tiny at the bottom edge above the band.

## Frame 2 — Quest select

- scene: "VELDU VERKEFNI" menu panel; the yellow ▶ cursor hops down three quests as each is named (Leikur fyrir nemendurna · Ný leið til að meta verkefni · Eitthvað sem enginn hefur gert), then lands on a fourth blinking slot "??? — þín hugmynd"; on the last cue a cyan banner stamps "VIÐ SMÍÐUM ÞAÐ MEÐ ÞÉR".
- voiceover: "Leik fyrir nemendurna þína? Nýja leið til að meta verkefni? Eða eitthvað sem enginn hefur gert áður? Við smíðum það með þér."
- duration: 9.742s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/02-quest-select.html
- type: pain_point
- persuasion: Rule of three + concretization (a menu of real examples)
- beat: intrigue → anticipation
- blueprint: fixed-anchor-cycle (Adapt)
- focal: the quest menu with the hopping yellow cursor
- roles: menu panel = foreground subject (left ~55%) · cyan stamp = foreground payoff (right) · P1 sprites = supporting · HUD/starfield = background
- sfx: menu-open@0.05, blip@0.38, blip@2.54, blip@4.93, blip-hi@6.60, stamp@7.89, jump@8.30
- sketch: storyboard.html#frame-02

narrativeRole: Turns the abstract "software" into three concrete things a teacher could want, and lands the value claim by beat 2: we build it with you.
keyMessage: Your idea can be a game, an assessment, or something brand new — and we build it with you.

Adapt: the pinned anchor is the "VELDU VERKEFNI" menu panel (enters once, never moves); the cycling region is the menu cursor stepping item to item; the emphasis beat is the stamp.
Scene 1 (0.00–0.38s): the menu panel opens (stepped height) on the left 55%, header "VELDU VERKEFNI" (label-big, coin) types in; items not yet visible.
Scene 2 (0.38–2.54s): "Leikur fyrir nemendurna" appears (menu-item, ink) and the ▶ cursor hops to it — the active item is coin, the others ink-dim.
Scene 3 (2.54–4.93s): "Ný leið til að meta verkefni" appears; cursor hops down one step; previous item dims.
Scene 4 (4.93–6.60s): "Eitthvað sem enginn hefur gert" appears; cursor hops.
Scene 5 (6.60–7.73s): "??? — þín hugmynd" (??? in p2, rest ink) appears with a yellow 1-px-step outline box; cursor hops to it; the ??? blinks (stepped, finite).
Scene 6 (7.73–9.74s): on "smíðum" (7.89s) the cyan stamp box "VIÐ SMÍÐUM ÞAÐ MEÐ ÞÉR" (Jersey 10, p1, rotated −4°) slams on from 1.4× to 1× in 2 hard steps on the right; at 8.30s the two cyan P1 sprites hop up into place under it (2-step jump). Hold.

## Frame 3 — Player 1

- scene: Character screen — two cyan pixel sprites labeled SMÁRI and JAKUB bob in idle; beside them a pixel panel shows two unlocked items "Kennslukerfi #1" and "Kennslukerfi #2" (the LMSs they built), with a small grey "Canvas" box that gets a pixel ✕ on "gerði ekki það sem við þurftum".
- voiceover: "Við erum Smári og Jakub. Við smíðuðum okkar eigin kennslukerfi, af því að Canvas gerði ekki það sem við þurftum."
- duration: 7.655s
- transition_in: cut
- status: animated
- src: compositions/frames/03-player-one.html
- type: social_proof
- persuasion: Demonstration of credibility (we already did this for ourselves)
- beat: trust + recognition
- blueprint: comparison-split (Adapt)
- focal: Smári and Jakub as cyan Player-1 sprites
- roles: two sprites on pedestals = foreground subject (left 40%) · 'HLUTIR OPNAÐIR' unlock panel = foreground right · Canvas row + pink ✕ = supporting contrast · HUD/starfield = background
- sfx: jump@0.70, jump@1.27, menu-open@2.62, unlock@3.75, unlock@4.20, buzz@5.77
- sketch: storyboard.html#frame-03

narrativeRole: Introduces who is asking and proves they can deliver — they already built their own systems for the same reason.
keyMessage: Smári and Jakub have done this before, for their own teaching.

Adapt: keep two paired sides of equal weight; the left side is the two players, the right side is the unlock panel; the signature "badge pop" becomes the green ticks and the pink ✕.
Scene 1 (0.00–0.70s): "PLAYER 1" (hud-big, p1) types top-left; an empty pedestal bar sits under the sprite positions.
Scene 2 (0.70–2.60s): on "Smári" (0.70s) sprite 1 drops onto the pedestal in 3 steps with its name plate "SMÁRI" (label-big, p1); on "Jakub" (1.27s) sprite 2 does the same with "JAKUB"; "Vefþróun · Vefskólinn" (body, ink-dim) steps in at 1.8s. Each sprite does one 2-frame idle bob afterwards (finite).
Scene 3 (2.60–5.00s): the unlock panel opens on the right at 2.62s with "HLUTIR OPNAÐIR" (label, coin); on "kennslukerfi" (3.75s) row "Kennslukerfi #1" pops in with a green window icon and green ✓; row "Kennslukerfi #2" at 4.20s.
Scene 4 (5.00–7.66s): on "Canvas" (5.02s) a dim grey "Canvas" row appears below a dashed divider; on "ekki" (5.77s) a pink pixel ✕ stamps over its right end and the small line "gerði ekki það sem við þurftum" (ink-dim) steps in. Hold.

## Frame 4 — Player 2 wanted

- scene: Split screen — left the two cyan P1 sprites ready; right an empty pink Player 2 slot: dashed-outline ghost sprite with a "?" and "PLAYER 2" blinking, label "ÓSKAST: kennari með hugmynd"; on "gervigreindinni" a yellow power-up chip labeled GERVIGREIND drops between them.
- voiceover: "Nú vantar okkur leikmann númer tvö: kennara sem vill smíða sinn eigin hugbúnað, með okkur og gervigreindinni."
- duration: 6.817s
- transition_in: cut
- status: animated
- src: compositions/frames/04-player-two-wanted.html
- type: product_intro
- persuasion: Frame-then-fill (show the empty slot, then say who fills it)
- beat: anticipation + invitation
- blueprint: kinetic-type-beats (Adapt)
- focal: the empty pink Player 2 slot with the blinking ?
- roles: P1 side (label + two cyan sprites) = left supporting · pink dashed slot + ghost + ? = foreground subject (right) · yellow AI chip = payoff element (center) · HUD/starfield = background
- sfx: blip-lo@1.16, blink@1.85, type-blips@2.27, powerup@5.35
- sketch: storyboard.html#frame-04

narrativeRole: Names the role the viewer is invited to take: Player 2, the teacher who owns the idea, with AI as the power-up.
keyMessage: We're looking for one teacher to build their own software with us and AI.

Adapt: the statement builds across beats onto a payoff pop; the "words" are the slot appearing, the label typing, and the chip landing.
Scene 1 (0.00–1.16s): left: "PLAYER 1" + "TILBÚNIR" and the two cyan sprites standing (already established characters — present at t=0). The right half is empty night.
Scene 2 (1.16–2.27s): on "leikmann" the pink dashed slot flickers on (border appears in 3 steps); on "tvö" (1.85s) "PLAYER 2" (hud-big, p2) blinks on above it and the HUD's 2UP PRESS START brightens.
Scene 3 (2.27–5.27s): on "kennara" the pink ghost sprite steps in inside the slot and a pink "?" pops above its head; "ÓSKAST: kennari með hugmynd" types under the slot from 2.3s to ~4.4s (ÓSKAST in p2, rest ink).
Scene 4 (5.27–6.82s): on "gervigreindinni" the yellow power-up chip drops from the HUD into the gap between the two sides with a 2-step bounce (explicitly playful) and its label "GERVIGREIND" (label, coin) appears under it at 5.6s. Held read to the end.

## Frame 5 — Level 1: Hugmyndin

- scene: World-map stage with three level nodes on a pixel path; camera on node 1. Banner "LEVEL 1 · Hugmyndin" slides in; the ghost-pink P2 sprite gets a lightbulb; a rough pixel sketch on a board snaps into a clean wireframe as P1 sprites join.
- voiceover: "Fyrsta borð: hugmyndin. Þú segir okkur hvað þig vantar, og við hönnum það saman."
- duration: 6.155s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/05-level-one.html
- type: feature_showcase
- persuasion: Signposting (first… then… finally) + progressive disclosure
- beat: orientation + focus
- blueprint: spatial-pan-stations (Adapt)
- focal: the LEVEL 1 banner and the sketch-to-wireframe board
- roles: world-map path with 3 nodes = background stage (consistent through 05–07) · level banner = foreground title · pink ghost + bulb = subject · board = focal development · P1 sprites = supporting · XP bar = supporting
- sfx: jingle@0.10, ding@3.84, scribble@3.28, jump@4.48, snap@5.11, xp@5.40
- sketch: storyboard.html#frame-05

narrativeRole: Step one of the process — the teacher brings the need, design happens together.
keyMessage: You describe what you need; we design it together.

Adapt: the oversized stage is the world map (path + nodes 1·2·3 across the lower-middle band, ~y 62–68%); the camera "pan" between stations is carried by the push-slide transitions between 05→06→07; inside this frame the station is node 1.
Scene 1 (0.00–1.35s): world map present; the full-width level banner slides in from the left (power3) by 0.5s with "LEVEL 1" (hud-big, coin); "Hugmyndin" (headline, ink) types in on its word at 1.35s; node 1 turns coin with a stepped pulse ring.
Scene 2 (1.35–3.80s): on "Þú" (2.82s) the pink ghost sprite steps in above node 1 with a tiny "ÞÚ" label; on "segir okkur" (3.28s) a dotted scribble draws itself on the left half of the board panel (svg-path-draw, stepped); on "vantar" (3.84s) a yellow bulb pops above the ghost's head.
Scene 3 (3.80–6.16s): on "við" (4.48s) the two cyan sprites hop in at the right of the board; on "saman" (5.11s) the scribble snaps into a clean yellow wireframe (header bar + three boxes) on the right half of the board, with a ▶ between; the XP bar (bottom-left, above the caption band) steps 0→4 cells at 5.40s. Hold.

## Frame 6 — Level 2: Saman

- scene: Same world map, camera on node 2. Banner "LEVEL 2 · Saman"; pixel bricks stack into an app window built by P1 sprites; three small student sprites run in, try it, and hearts pop above them; XP bar fills to two thirds.
- voiceover: "Annað borð: saman. Við smíðum fyrstu útgáfuna, og þú prófar hana með nemendunum þínum."
- duration: 6.668s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/06-level-two.html
- type: feature_showcase
- persuasion: Signposting + demonstration
- beat: momentum
- blueprint: spatial-pan-stations (Adapt)
- focal: the app window being built from bricks
- roles: same world map (node 1 now green ✓, node 2 coin) · level banner · 'Útgáfa 1' window = focal · P1 sprites = builders · three student sprites + hearts = payoff · XP bar
- sfx: jingle@0.10, bricks@2.88, blip@3.57, run@5.10, hearts@5.74, xp@6.10
- sketch: storyboard.html#frame-06

narrativeRole: Step two — we build version 1, the teacher tries it with real students.
keyMessage: We build the first version; you try it with your students.

Adapt: same stage, camera now at node 2 (the push-slide transition did the travel).
Scene 1 (0.00–1.33s): banner shows "LEVEL 2", "Saman" types at 1.33s; node 1 flips to green with a ✓ in 2 steps at 0.3s; node 2 turns coin.
Scene 2 (1.33–4.30s): the two cyan sprites stand at left; an empty app-window frame (p1 title bar) is center; from "smíðum" (2.88s) brick rows drop into it row by row in 3 hard-stepped drops (2.88, 3.25, 3.60s); "ÚTGÁFA 1" (label) appears in the window header on "útgáfuna" (3.57s).
Scene 3 (4.30–6.67s): on "nemendunum" (5.10s) three small student sprites (yellow, green, violet shirts) run in from the right edge in stepped walk frames and stop in a row; on "þínum" (5.74s) a pink heart pops above each, staggered; "NEMENDURNIR ÞÍNIR" label under them; the XP bar steps to 8 cells at 6.10s. Hold.

## Frame 7 — Level 3: Þú við stýrið

- scene: Same world map, camera on node 3. Banner "LEVEL 3 · Þú við stýrið"; the P1 sprites step back and the pink P2 sprite takes a joystick; a chat bubble types "Bættu við stigatöflu…" and the app window updates with a new panel; achievement toast "AFREK OPNAÐ · Þú smíðar með gervigreind"; XP bar full → LEVEL UP flash.
- voiceover: "Þriðja borð: þú við stýrið. Þú lætur gervigreindina breyta honum og bæta, alveg eftir þínu höfði."
- duration: 7.755s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/07-level-three.html
- type: feature_showcase
- persuasion: Signposting + payoff of the build-up (handover)
- beat: mastery + delight
- blueprint: prompt-type-submit-generate (Adapt)
- focal: the chat bubble prompt and the app growing a leaderboard
- roles: same world map (nodes 1·2 green, node 3 coin) · banner · pink ghost with joystick = subject (center) · chat bubble = prompt input · app window = generated artifact · achievement toast = payoff · dimmed P1 sprites = supporting
- sfx: jingle@0.10, blip@1.77, type-blips@3.62, build@4.98, achievement@6.10, levelup@6.55
- sketch: storyboard.html#frame-07

narrativeRole: Step three, the heart of the project — the teacher takes over and improves the software with AI themselves.
keyMessage: In the end you're in charge, changing it with AI however you like.

Adapt: keep the signature "watch me ask, watch it answer" — the prompt types into an input (here a pixel chat bubble) and the machine answers by changing the artifact; no product UI, it's a game-world app window.
Scene 1 (0.00–1.44s): banner "LEVEL 3", "Þú við stýrið" types on its words at 1.44s; nodes 1–2 green, node 3 coin.
Scene 2 (1.44–3.60s): on "þú við stýrið" the two cyan sprites step back to the far left in 2 steps and dim to ~60%; the pink ghost steps to center and a pink joystick appears in its hand at 1.77s.
Scene 3 (3.60–4.98s): on "gervigreindina" (3.62s) a pixel chat bubble opens above-left of the ghost and "Bættu við stigatöflu…" types per char with the yellow caret (ends ~4.6s); the app window (p1 title bar) stands to the right.
Scene 4 (4.98–6.07s): on "bæta" (4.98s) a green "STIGATAFLA" panel steps into the window's right half and its three rows fill in staggered.
Scene 5 (6.07–7.76s): on "þínu" (6.10s) the achievement toast pops in at the top-right (star + "AFREK OPNAÐ" label + "Þú smíðar með gervigreind"), 2-step overshoot; at 6.55s "LEVEL UP!" (hud, xp) flashes twice in the banner and the XP bar fills to 12 green cells. Hold.

## Frame 8 — Loot

- scene: Treasure chest opens on a "VERÐLAUN" screen; two loot cards pop up in a staggered cascade: "Hugbúnaður sniðinn að þínum hópi — þinn" (pink) and "Færni sem fáir kennarar hafa enn" (green), coins burst.
- voiceover: "Verðlaunin? Hugbúnaður sniðinn að þínum hópi, sem þú átt. Og færni sem fáir kennarar hafa enn."
- duration: 8.205s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/08-loot.html
- type: benefit_highlight
- persuasion: Concretization (rewards as loot) + rule of two
- beat: desire + delight
- blueprint: grid-card-assemble (Adapt)
- focal: the open treasure chest and the two loot cards
- roles: chest = centerpiece · pink card (left) and green card (right) = the two foreground subjects · coins = supporting burst · 'VERÐLAUN' header · HUD/starfield = background
- sfx: blip@0.58, chest@1.20, pickup@2.06, stamp@4.28, pickup@5.62, blip@6.50
- sketch: storyboard.html#frame-08

narrativeRole: Answers "what's in it for me" honestly — the software is yours to keep, plus a rare skill — without promising money or time off.
keyMessage: You keep the software, and you gain a skill few teachers have.

Adapt: N=2 cards self-assemble in a staggered cascade, but out of the chest rather than from off-screen; no grid zoom-out.
Scene 1 (0.00–1.20s): closed chest center (slightly above middle); on "Verðlaunin" (0.58s) the header "VERÐLAUN" (label-big, coin) types in centered above it.
Scene 2 (1.20–2.06s): the chest lid flips open in 2 steps at 1.20s and 6–8 coins burst out on deterministic index-based arcs and land around it (finite).
Scene 3 (2.06–5.48s): on "Hugbúnaður" the pink-bordered card rises out of the chest and settles at the left third (power3), window icon + "Hugbúnaður sniðinn að þínum hópi" (headline-scale Jersey); on "átt" (4.28s) the tag "ÞINN" (label, p2) stamps in its top-right corner.
Scene 4 (5.48–8.21s): on "færni" (5.62s) the green-bordered card rises to the right third with the star icon + "Færni sem fáir kennarar hafa enn"; tag "NÝ FÆRNI" (label, xp) at 6.50s. Hold.

## Frame 9 — Why we're doing this

- scene: A pixel path forks into two branches that both end at the same gold star: branch A "Hver kennari getur það" and branch B "Hvað forritarar þurfa enn að kunna"; header "STARFENDARANNSÓKN"; small footer label "Í anda skýrslunnar Gervigreind til góðs: kennarar fyrst".
- voiceover: "Þetta er starfendarannsókn. Við viljum vita hversu langt kennari kemst með gervigreind, og hvað forritarar framtíðarinnar þurfa enn að kunna."
- duration: 8.693s
- transition_in: cut
- status: animated
- src: compositions/frames/09-why.html
- type: branding
- persuasion: Comparison of two outcomes (both win) + citation
- beat: conviction + curiosity
- blueprint: comparison-split (Adapt)
- focal: the forked path where both routes reach the same gold star
- roles: header 'Starfendarannsókn' · two players at the path start = supporting · route A card (cyan) and route B card (green) = the paired subjects · gold star = payoff · report footer label = supporting
- sfx: blip@0.76, draw@2.50, blip@3.78, blip@5.68, star@7.28
- sketch: storyboard.html#frame-09

narrativeRole: Gives the honest purpose — research on our own practice, where either result is useful — so the teacher sees they are a partner, not a test subject.
keyMessage: It's action research: we learn how far a teacher can go, and what developers still need to learn.

Adapt: keep two paired items of equal weight held at once with a badge pop; they are stacked (A above, B below) on a forking pixel path instead of book-open tilts, and the "badge" is the shared gold star.
Scene 1 (0.00–2.47s): on "starfendarannsókn" (0.76s) the header (Jersey 10, ink, centered top) types in; the small cyan + pink-ghost pair stands at the left path start; the footer label "Í anda skýrslunnar Gervigreind til góðs: kennarar fyrst" (label, ink-dim) steps in at 1.6s.
Scene 2 (2.47–5.30s): the dotted path draws itself from the players and forks (svg-path-draw, stepped) 2.5–3.2s; on "kennari" (3.78s) route A card lights cyan: "LEIÐ A · Hver kennari getur það".
Scene 3 (5.30–7.00s): on "forritarar" (5.68s) route B card lights green: "LEIÐ B · Hvað forritarar þurfa / enn að kunna" (two lines).
Scene 4 (7.00–8.69s): both routes extend to the right and meet; on "enn" (7.28s) the gold star pops (2-step) with "BÁÐAR LEIÐIR VINNA" (label, coin) under it at 7.6s. Hold.

## Frame 10 — Ideal Player 2

- scene: Character-stat card headed "TILVALINN LEIKMAÐUR 2" with the pink ghost sprite; two stat bars fill in on cue: "FORRITUN" stays at 0 and stamps a green "Fullkomið!", then "HUGMYND" fills all the way in coin-yellow to "MAX".
- voiceover: "Og best er ef þú kannt alls ekki að forrita, en hefur góða hugmynd um hvað þig langar til að gera."
- duration: 6.193s
- transition_in: cut
- status: animated
- src: compositions/frames/10-ideal-player.html
- type: benefit_highlight
- persuasion: Counterintuitive claim (no programming is the ideal) + concretization as game stats
- beat: surprise + relief
- blueprint: dataviz-countup (Adapt)
- focal: the two stat bars: FORRITUN at 0 and HUGMYND at MAX
- roles: 'TILVALINN LEIKMAÐUR 2' header · pink dashed portrait with ghost = supporting (left) · stat panel = foreground subject (right ~57%) · 'Fullkomið!' stamp + MAX = payoffs
- sfx: select@0.05, blip@0.97, stamp@1.83, arpeggio@3.14, ding@3.95
- sketch: storyboard.html#frame-10

narrativeRole: Flips the biggest worry (I can't program) into the qualification, and names the one thing that matters: a good idea.
keyMessage: Best if you can't program at all, as long as you know what you want to make.

Adapt: the data carries the argument; the signature count-up becomes a bar filling cell by cell to MAX (stat-bars-and-fills), and the twist is that the other bar's zero is celebrated.
Scene 1 (0.00–0.97s): the character card flips in like a select screen (stepped scaleX 0→1 at 0.05s): header "TILVALINN LEIKMAÐUR 2" (label-big, coin) centered top, pink dashed portrait with the ghost sprite and "ÞÚ?" on the left, empty stat panel on the right.
Scene 2 (0.97–2.96s): "FORRITUN" label + an empty 12-cell bar appear at 0.97s with "0" at its end; on "ekki" (1.83s) a green ✓ + "Fullkomið!" (headline, xp) stamps in under the bar.
Scene 3 (2.96–4.00s): "HUGMYND" label + empty bar appear at 2.96s; from "góða" (3.14s) the bar fills cell by cell in coin yellow (12 steps, done by ~3.85s); "MAX" (hud, coin) pops at 3.95s.
Scene 4 (4.00–6.19s): held still — the deliberate breather before the ask.

## Frame 11 — Insert idea

- scene: Arcade coin slot; a lightbulb-coin drops into "INSERT HUGMYND", the pink PLAYER 2 slot lights up "READY?"; resolves to the end card: "Svaraðu á padletinn" big in coin-yellow, "Smári & Jakub" in cyan, small "Vefskólinn · Tækniskólinn"; PRESS START blinks to the end.
- voiceover: "Ertu til? Svaraðu á padletinn, eða stoppaðu okkur á ganginum."
- duration: 8.33s
- poster: 6s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/11-insert-idea.html
- type: cta
- persuasion: Callback (back to the title screen's PRESS START) + single clear ask
- beat: resolve + invitation
- blueprint: cta-morph-press (Adapt)
- focal: the coin slot taking the lightbulb coin, then 'Svaraðu á padletinn'
- roles: coin slot panel + bulb coin = opening subject (left) · 'Svaraðu á padletinn' = foreground hero (right, ~60% width) · 'Smári & Jakub' + school line = supporting · PRESS START = closing chrome
- sfx: coin-insert@1.05, blip-hi@1.30, slam@2.72, type-blips@4.08, power-off@7.85
- sketch: storyboard.html#frame-11

narrativeRole: The one ask, made as easy as possible, closing the loop opened on the title screen.
keyMessage: Reply on the padlet — or just stop us in the hallway.

Adapt: the "press" is the coin going into the slot (identity → action); the CTA is the text the slot unlocks. This is the only frame with a real exit.
Scene 1 (0.00–1.00s): coin-slot panel at the left with the pink "PLAYER 2" label on its face; the bulb-coin hovers above it doing one finite 3-frame spin.
Scene 2 (1.00–2.10s): on "til" the bulb-coin drops into the slot in 3 hard steps (lands 1.05s); the slot's rim flashes coin; at 1.30s the HUD 2UP changes to "READY?" (p2) and "INSERT HUGMYND" (hud, coin) appears under the slot.
Scene 3 (2.10–3.60s): "Svaraðu á" lands on "Svaraðu" (2.10s) and "padletinn" on its word (2.72s), display-scale Jersey 10 in coin with a hard pink-free shadow (shadow color), right ~60% of the frame, upper two-thirds.
Scene 4 (3.60–4.90s): on "okkur" (4.08s) "Smári & Jakub" (headline, p1) types in under it; "VEFSKÓLINN · TÆKNISKÓLINN" (label, ink-dim) steps in at 4.6s.
Scene 5 (4.90–8.33s): held end card; "PRESS START" blinks (stepped, finite) bottom-right. Final exit 7.85–8.33s: classic CRT power-off — the whole picture collapses vertically to a bright horizontal line, then to a dot, then black (stepped).
