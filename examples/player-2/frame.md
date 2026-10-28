---
version: alpha
name: Player 2 óskast — Frame (video / frame layer)
description: >
  Bespoke retro pixel-arcade system for a recruitment video. The unit is the frame (1920×1080),
  styled as a 16-bit arcade cabinet screen: deep indigo night, a CRT scanline veil, a persistent
  HUD bar, chunky stepped-corner pixel panels, and pixel sprites. Three pixel faces: Press Start 2P
  for Latin-only arcade chrome (PLAYER, START, LEVEL, scores), Jersey 10 for every Icelandic line,
  Silkscreen for small uppercase labels. Hard pixel edges, no blur, no soft shadows.
unit: the frame — 1920×1080 primary
principle: atoms are sacred · composition is free · it must feel like a game you want to play

colors:
  night: "#14112B"        # ground — arcade-screen indigo
  night-2: "#1E1940"      # raised panel fill
  night-3: "#2C2560"      # panel border mid / inactive cells
  ink: "#F4F1FF"          # primary text
  ink-dim: "#A9A3D9"      # secondary text, inactive menu items
  coin: "#FFE14D"         # yellow — scores, highlights, selected item, CTA
  p1: "#3FE0D0"           # cyan — Player 1 (Smári & Jakub)
  p2: "#FF4F8B"           # pink — Player 2 (the teacher)
  xp: "#7CFF6B"           # green — level-up, success, unlocked
  shadow: "#0A0818"       # hard offset shadow, outlines
  scanline: "rgba(10,8,24,0.22)"

typography:
  # — arcade chrome: Press Start 2P, LATIN + DIGITS ONLY (its accented capitals are broken) —
  hud:          { fontFamily: "Press Start 2P", cqw: 0.9, weight: 400, tracking: "0.04em", upper: true }
  hud-big:      { fontFamily: "Press Start 2P", cqw: 2.2, weight: 400, tracking: "0.04em", upper: true }
  arcade-title: { fontFamily: "Press Start 2P", cqw: 5.2, weight: 400, lineHeight: 1.15, upper: true }
  # — every Icelandic line: Jersey 10 —
  body:         { fontFamily: "Jersey 10", cqw: 2.4, weight: 400, lineHeight: 1.1 }
  menu-item:    { fontFamily: "Jersey 10", cqw: 3.6, weight: 400, lineHeight: 1.05 }
  headline:     { fontFamily: "Jersey 10", cqw: 6.0, weight: 400, lineHeight: 0.95 }
  display:      { fontFamily: "Jersey 10", cqw: 9.5, weight: 400, lineHeight: 0.9 }
  display-hero: { fontFamily: "Jersey 10", cqw: 13.0, weight: 400, lineHeight: 0.88 }
  # — small uppercase labels that may carry accents: Silkscreen —
  label:        { fontFamily: "Silkscreen", cqw: 1.25, weight: 400, tracking: "0.08em", upper: true }
  label-big:    { fontFamily: "Silkscreen", cqw: 2.0, weight: 400, tracking: "0.06em", upper: true }

fonts:
  "Press Start 2P": "assets/fonts/PressStart2P-Regular.ttf"
  "Jersey 10": "assets/fonts/Jersey10-Regular.ttf"
  "Silkscreen": "assets/fonts/Silkscreen-Regular.ttf"

spacing:
  px: "0.3125cqw"       # one "game pixel" = 6px @1920 — every border, shadow and sprite cell is a multiple
  edge: "4cqw"
  hud-height: "4.2cqw"
  gap-md: "2cqw"

components:
  crt-veil:
    fill: "repeating-linear-gradient(0deg, {colors.scanline} 0 2px, transparent 2px 4px) + radial vignette to {colors.shadow} at 140%"
    placement: "topmost layer of EVERY frame, pointer-events none, full bleed"
    description: "Scanlines + soft corner vignette. The only non-flat effect allowed."
  hud-bar:
    typography: "{typography.hud}"
    layout: "top strip {spacing.hud-height}: left '1UP' (p1) + score (ink) · center 'HI-SCORE' (coin) · right '2UP' (p2) + blinking state"
    description: "Persistent arcade HUD. Scores are decorative (000000-style counters). Right slot blinks 'PRESS START' until Player 2 joins, then shows 'READY'."
  pixel-panel:
    backgroundColor: "{colors.night-2}"
    border: "stepped corners — box-shadow stack in {spacing.px} steps, outer {colors.ink}, inner {colors.night-3}"
    shadow: "hard offset {spacing.px}×2 {colors.shadow}, no blur"
    description: "Dialog box / menu panel. Corners are notched, never rounded."
  menu-cursor:
    shape: "pixel triangle ▶ in {colors.coin}, blinks with steps(1) timing"
    description: "Selection arrow beside the active menu item; the active item turns {colors.coin}."
  sprite:
    construction: "CSS grid or SVG <rect> cells at {spacing.px}×N; 12×16-cell characters; 2-frame idle bob"
    palette: "p1 sprites cyan, p2 sprite pink, outlines {colors.shadow}"
    description: "Pixel characters for Player 1 (two sprites: Smári, Jakub) and Player 2 (the teacher, holding a lightbulb/idea)."
  level-banner:
    typography: "{typography.hud-big} 'LEVEL N' + {typography.headline} Icelandic title"
    description: "Full-width band that slides in on hard steps; under it an XP bar fills in {colors.xp}."
  xp-bar:
    cells: "row of square cells, {colors.night-3} empty → {colors.xp} filled, step-filled"
    description: "Progress/level-up meter; also used as a timer bar."
  achievement-toast:
    layout: "pixel-panel, trophy/star sprite left, {typography.label} 'AFREK OPNAÐ' + {typography.body} text"
    description: "Pops in from the bottom with a 2-step overshoot; used for unlocked skills and loot."
  coin:
    construction: "8×8-cell pixel coin in {colors.coin} with 3-frame spin"
    description: "Decorative pickups; INSERT HUGMYND uses a lightbulb-coin."
---

# Player 2 óskast — Frame (video / frame layer)

## Overview

The whole video is **one arcade game**. Smári and Jakub are Player 1 (cyan), already on screen and
playing; the empty Player 2 slot (pink) blinks at the viewer. Each frame is a screen of that game —
title screen, quest-select menu, character intro, three levels, loot, rules, and the insert-coin
end screen. The viewer should feel invited to grab the second joystick.

## The Frame

- **Ground:** `{colors.night}` full-bleed on its own clip layer, with an optional faint pixel
  starfield or 4-cell grid in `{colors.night-3}`.
- **HUD bar** on every frame except the title screen and the final card.
- **CRT veil** on top of everything, always.
- **One game pixel = `{spacing.px}`.** Borders, shadows, sprite cells, and motion distances snap to it.
- Safe area `{spacing.edge}`; keep the bottom 18% clear for captions.

## Colors

Indigo night ground, near-white ink. Color carries meaning: **cyan = us (P1)**, **pink = you (P2)**,
**yellow = what to look at / select / act on**, **green = progress, unlocked, done**. Never use
more than three accents in one frame. No gradients except the CRT vignette.

## Typography

- **Press Start 2P** only for strings with no accented letters: `PLAYER 1`, `PLAYER 2`, `PRESS START`,
  `LEVEL 1`, `HI-SCORE`, `1UP`, digits. Its accented capitals (Á, Ý, Ó) are broken — never feed it Icelandic.
- **Jersey 10** for every Icelandic word: headlines, menu items, dialog, end card. It renders
  þ ð æ ö á é í ó ú ý cleanly in both cases.
- **Silkscreen** for small uppercase labels (it also handles Icelandic capitals): `AFREK OPNAÐ`, `VERÐLAUN`.
- Legibility floor 2.0cqw for anything load-bearing; Press Start 2P never below 0.85cqw.

## Depth & Surface

Flat, layered like sprites. Depth = hard offset shadows in `{colors.shadow}` at 1–2 game pixels.
No blur, no soft shadow, no rounded corners, no glow except a 1-pixel `{colors.coin}` outline flash
on selection.

## Motion feel (guidance for builders)

Arcade motion is **stepped**: prefer `steps()`-style or snapped positions for sprites, blinking at
~2Hz, menu cursor hops, 2-step overshoot pops. Smooth eases are allowed only for camera moves and
the level banner slide. Text appears by **typewriter (per character)** in dialog boxes, like an RPG.

## Composition Rules

### Do
- Keep the HUD and CRT veil — they are the cabinet.
- Make the pink Player 2 slot visibly **empty and waiting** until the CTA frame.
- Use menus, dialog boxes, level banners, XP bars, loot grids, and achievement toasts as the layout vocabulary.

### Don't
- No glowing neural networks, robots, circuit-brain clichés.
- No photo, no vector-smooth illustration, no soft UI cards.
- Never set Icelandic in Press Start 2P.
- Never promise money, deadlines, or applications on screen.

## Approved Entities

- Names: **Smári**, **Jakub**. School: **Vefskólinn**, **Tækniskólinn**. Report: **Gervigreind til góðs** (2026).
- Canvas is mentioned by name only (no Canvas logo).

## Numerals & Claims (hard rule)

HUD scores and coin counts are decorative game furniture. No real statistics appear in this video.
