# Prompts for a strong model (Claude Opus 5.5): explore

With a strong model you describe the **goal**, the **audience** and the
**checkpoints**, and you let it invent. You don't tell it which tools to use.
You ask it for options, react to what it shows you, and keep the decisions
for yourself.

Send these one at a time, in this order. Replace everything in `[brackets]`.
Write the way you talk. Our real prompts had typos, and that didn't matter.

---

## 1 · Kick-off: ask for ideas, not a film

```text
I want to make a short animated film, about [40] seconds, that launches my web page [NAME]: [one line on what it does and who it is for].
The code is in [path or repo] and it is live at [URL]. Read those first, and nothing else.

The film will be shown [at our demo day on a projector / at the start of my presentation / on my portfolio]. It has to work [with sound / muted too].

I haven't chosen a style yet. Before you build anything, give me 4–5 pitches that look really different from each other. For each one: the concept, the look, the technology you would use, and what happens in the first five seconds. Tell me which one you would pick and why. I've already seen [the watercolour, arcade and neo-punk films from class], so surprise me.

Then ask me everything you need to know, with your default answer in brackets, so I can answer in one message. Show me the storyboard on an HTML page before you start making the video.
```

## 2 · React to the pitches

```text
Number [3], but with the ending from [5]. Make it a bit more [playful / calm / punk / handmade].
```

Not sure? Ask it to explore further:

```text
None of these is quite it. Give me three more, further from each other, and one that is a bit weird.
```

```text
How hard would it be to make it look like [stop-motion clay / a watercolour painting / an old arcade game]? What would it cost in render time on my laptop?
```

Want real people in it as characters (the clay film had five colleagues as puppets)? Ask them first, then:

```text
Can you make [me and my two teammates] into characters in the film? Here are some photos: [photos]. Number the faces you find, and tell me when you want me to say who is who.
```

## 3 · Voice (or no voice)

```text
Can you make me short demos of two or three [English / Icelandic / Polish] voices reading the opening lines before you start the storyboard? Put them in one folder so I can compare them. If I need to install something, just say so.
```

or

```text
Skip the voice. Carry it with music and a few keywords on screen, so it works muted.
```

## 4 · Approve the plan, keep control of the storyboard

```text
Yes, this plan is good. Do it your way, and I'll correct anything on the storyboard.
```

## 5 · The storyboard page

```text
Make me a web page that shows the storyboard with pictures of every scene, so it is easier for me to picture it.
```

Edit the storyboard, not the finished film. Be specific:

```text
In scene [4], instead of saying "[old line]", say something like "[new line]".
```

```text
Can you make the style a bit more [neo-punk], but keep the content as it is and the expressions on the faces?
```

If you have a strong idea of the look, paste a full art direction. The model will follow it literally:

```text
Make another one in a totally different style. Here is the art direction:
"""
[Palette: 2–5 colours …
 Shapes and lines: …
 How it moves: on twos, snaps, holds, smears …
 Transitions: …
 What to avoid: …]
"""
```

## 6 · Go

```text
Perfect, now do it!
```

## 7 · Review the draft like a director

Watch it once at full speed, once muted, then give a list:

```text
Fix the overlapping nodes in scene [7] and the zoom in scene [9]. Make the sound effects quieter and the voice louder. Show me again before rendering.
```

```text
Some of the letters are hard to read. Check every word at the size it will actually be rendered.
```

Point at the exact frame. The agent opens the draft in HyperFrames Studio (`npx hyperframes preview`), where you can pause, read the time and click an element to see its id. The agent can also read what you clicked itself (`npx hyperframes preview --selection`):

```text
At [0:19], [#03-player-one-panel] comes in too early: let it come in after the two characters. At [0:42] the text is too close to the edge. And look at what I've selected in Studio right now: make it [smaller and slower]. Show me again before rendering.
```

## 8 · Render

```text
Render it.
```

## 9 · Write it down (the part you hand in)

```text
Save this style as a template, and add a row to my STYLE-LIBRARY.md: the technology, this film, how to make another one, what broke and how we fixed it, and how long the render took.
```

## Curious questions are good prompts too

```text
Last time the render took much longer and my laptop got hot. What is the difference now? Why was this one so much faster?
```

```text
What did you not know about this when we started, that you had to find out by failing?
```
