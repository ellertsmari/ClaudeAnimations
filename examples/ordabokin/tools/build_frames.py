"""Write the ten frame compositions + a sketch index for Orðabókin.

One shared flashcard stage for the eight word frames, so every card is identical in structure.
usage: python3 -I tools/build_frames.py <project_dir> [--sketch]
"""
import json
import sys
from html import escape
from pathlib import Path

PROJ = Path(sys.argv[1]).resolve()
SKETCH = "--sketch" in sys.argv

C = dict(black="#000000", white="#FFFFFF", offwhite="#FFFDF5", pink="#FE90E8", blue="#C0F7FE",
         green="#99E885", yellow="#F7CB46", cream="#FFDC8B")

FONTS = "".join(
    f"@font-face{{font-family:'Inter';font-weight:{w};src:url('assets/fonts/inter-latin-{w}-normal.woff2') format('woff2');}}"
    for w in (500, 600, 700, 800, 900)) + "".join(
    f"@font-face{{font-family:'Space Grotesk';font-weight:{w};src:url('assets/fonts/space-grotesk-latin-{w}-normal.woff2') format('woff2');}}"
    for w in (500, 600, 700))

# word cards: (frame, id, headword, grammar, ground, accent, on-screen sentence)
WORDS = [
    (2, "02-namsaaetlun", "námsáætlun", "nafnorð · kvk", "blue", "yellow",
     "Námsáætlun segir hvað þú lærir og hvernig þú færð einkunn."),
    (3, "03-verkefni", "verkefni", "nafnorð · hk", "pink", "green",
     "Í hverjum tíma gerir þú eitt verkefni."),
    (4, "04-stig", "stig", "nafnorð · hk", "green", "yellow",
     "Hvert verkefni gefur 10 stig. Byrjaðu alltaf á Hluta 1."),
    (5, "05-hopverkefni", "hópverkefni", "nafnorð · hk", "yellow", "pink",
     "Í nóvember og desember vinnur þú í hóp."),
    (6, "06-einkunn", "einkunn", "nafnorð · kvk", "cream", "green",
     "Lokaeinkunn er 1 til 10. Þú þarft 5."),
    (7, "07-maeting", "mæting", "nafnorð · kvk", "blue", "pink",
     "Mættu í tíma. Minnst 80%."),
    (8, "08-skila", "skila", "sögn", "pink", "yellow",
     "Skilaðu sama dag. Þú mátt bæta til 11. desember."),
    (9, "09-hjalp", "hjálp", "nafnorð · kvk", "green", "blue",
     "Segðu: „Geturðu hjálpað mér?“"),
]
ALL_WORDS = [w[2] for w in WORDS]


def meta():
    m = json.loads((PROJ / "audio_meta.json").read_text(encoding="utf-8"))
    return {v["frame"]: v for v in m["voices"]}


VOICES = meta()


def dur(frame):
    return round(VOICES[frame]["duration_s"], 3)


BASE_CSS = """
#root{position:absolute;inset:0;font-family:'Inter',sans-serif;color:#000;container-type:size;}
#root *{box-sizing:border-box;}
.F-ground{position:absolute;inset:0;}
.F-dots{position:absolute;width:520px;height:360px;background-image:radial-gradient(#000 1.6px,transparent 1.7px);background-size:26px 26px;opacity:.22;}
.F-pill{display:inline-block;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;letter-spacing:.06em;text-transform:uppercase;
  border:4px solid #000;border-radius:9999px;box-shadow:5px 5px 0 #000;padding:8px 24px;line-height:1.1;}
.F-star{position:absolute;display:flex;align-items:center;justify-content:center;border:0;text-align:center;
  clip-path:polygon(50% 0%,61% 18%,82% 10%,79% 32%,100% 38%,84% 54%,96% 74%,73% 76%,67% 98%,50% 85%,33% 98%,27% 76%,4% 74%,16% 54%,0% 38%,21% 32%,18% 10%,39% 18%);}
.F-box{border:5px solid #000;box-shadow:9px 9px 0 #000;background:#fff;}
.F-chip{border:4px solid #000;box-shadow:5px 5px 0 #000;}
"""


def css(fid):
    return (FONTS + BASE_CSS).replace(".F-", f".k{fid}-")


def template(fid, duration, body, extra_css="", script=""):
    return f"""<template>
<style>{css(fid)}{extra_css}</style>
<div id="root" data-composition-id="{fid}" data-start="0" data-duration="{duration}" data-width="1920" data-height="1080">
<div id="k{fid}-bg" class="clip {fid}-ground" data-start="0" data-duration="{duration}" data-track-index="0">{body['ground']}</div>
<div id="k{fid}-stage" class="clip" data-start="0" data-duration="{duration}" data-track-index="1" style="position:absolute;inset:0;">{body['stage']}</div>
</div>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<script>
(function(){{
const tl = gsap.timeline({{ paused: true }});
{script}
window.__timelines["{fid}"] = tl;
}})();
</script>
</template>
"""


def ground(fid, color, dots_at="right:60px;bottom:40px;"):
    return f'<div style="position:absolute;inset:0;background:{C[color]};"></div><div class="k{fid}-dots" style="{dots_at}"></div>'


def progress(fid, n):
    sq = "".join(
        f'<div class="k{fid}-chip k{fid}-pg{i}" style="width:34px;height:34px;background:{C["black"] if i < n - 1 or (SKETCH and i < n) else C["white"]};box-shadow:3px 3px 0 #000;border-width:3px;"></div>'
        for i in range(8))
    return f'<div id="k{fid}-progress" style="position:absolute;right:110px;top:70px;display:flex;gap:12px;">{sq}</div>'


def sentence_html(fid, text, hi=None):
    out = []
    for i, w in enumerate(text.split(" ")):
        on = SKETCH and hi is not None and i == hi
        bg = (f"background:{C['yellow']};box-shadow:0 0 0 6px {C['yellow']};" if on
              else "background:rgba(247,203,70,0);box-shadow:0 0 0 6px rgba(247,203,70,0);")
        out.append(f'<span class="k{fid}-w" data-i="{i}" style="display:inline-block;margin-right:.26em;{bg}">{escape(w)}</span>')
    return "".join(out)


def head_size(word):
    return min(178, int(930 / (len(word) * 0.6)))


# ---------- right-hand pictures (invented, BlockFrame atoms only) ----------
def check(fid, size=46, color="#000"):
    return (f'<div style="width:{size*0.5}px;height:{size}px;border-right:{size*0.18:.0f}px solid {color};'
            f'border-bottom:{size*0.18:.0f}px solid {color};transform:rotate(40deg);margin-top:-{size*0.15:.0f}px;"></div>')


def pic(fid, frame):
    P = f'<div id="k{fid}-pic" class="k{fid}-pic" style="position:absolute;left:1250px;top:200px;width:560px;height:660px;">'
    if frame == 2:  # plan sheet with three ticked rows
        rows = [("hvað?", "pink"), ("hvenær?", "green"), ("einkunn?", "yellow")]
        r = "".join(
            f'<div id="k{fid}-row{i}" data-r style="display:flex;align-items:center;gap:26px;margin:0 0 30px;">'
            f'<div class="k{fid}-chip" style="width:86px;height:86px;background:{C[c]};display:flex;align-items:center;justify-content:center;">{check(fid)}</div>'
            f'<div style="font-weight:800;font-size:54px;">{t}</div></div>' for i, (t, c) in enumerate(rows))
        return P + (f'<div class="k{fid}-box" style="position:absolute;left:30px;top:40px;width:500px;height:560px;transform:rotate(2deg);padding:0;">'
                    f'<div style="background:#000;color:#fff;font-family:Space Grotesk;font-weight:700;font-size:28px;letter-spacing:.08em;padding:18px 28px;">NÁMSÁÆTLUN</div>'
                    f'<div style="padding:44px 40px 0;">{r}</div></div></div>')
    if frame == 3:  # laptop with one task + four days
        days = "".join(
            f'<div class="k{fid}-chip" id="k{fid}-day{i}" data-r style="width:116px;padding:10px 0;background:#fff;text-align:center;font-weight:800;font-size:30px;">{d}<div style="font-size:24px;font-weight:600;margin-top:4px;">1 ✱</div></div>'
            for i, d in enumerate(["mán", "þri", "mið", "fim"]))
        days = days.replace("1 ✱", "1")
        return P + (f'<div class="k{fid}-box" style="position:absolute;left:20px;top:30px;width:520px;height:330px;background:#000;padding:22px;">'
                    f'<div style="width:100%;height:100%;background:{C["blue"]};border:4px solid #000;display:flex;align-items:center;justify-content:center;">'
                    f'<div class="k{fid}-chip" id="k{fid}-task" data-r style="background:#fff;padding:22px 34px;font-weight:900;font-size:50px;transform:rotate(-3deg);">1 verkefni</div></div></div>'
                    f'<div style="position:absolute;left:-10px;top:364px;width:580px;height:40px;background:#fff;border:5px solid #000;box-shadow:9px 9px 0 #000;"></div>'
                    f'<div style="position:absolute;left:10px;top:470px;display:flex;gap:22px;">{days}</div></div>')
    if frame == 4:  # 6 + 2 + 2 blocks
        cols = ["green"] * 6 + ["yellow"] * 2 + ["pink"] * 2
        sq = "".join(f'<div class="k{fid}-chip" id="k{fid}-b{i}" data-r style="width:86px;height:86px;background:{C[c]};"></div>' for i, c in enumerate(cols))
        legend = "".join(
            f'<div data-r style="display:flex;align-items:center;gap:16px;margin-bottom:16px;font-weight:800;font-size:38px;">'
            f'<div class="k{fid}-chip" style="width:44px;height:44px;background:{C[c]};"></div>{t}</div>'
            for c, t in [("green", "Hluti 1 = 6"), ("yellow", "Hluti 2 = 2"), ("pink", "Hluti 3 = 2")])
        return P + (f'<div style="position:absolute;left:10px;top:20px;display:grid;grid-template-columns:repeat(5,86px);gap:20px;">{sq}</div>'
                    f'<div style="position:absolute;left:10px;top:280px;">{legend}</div>'
                    f'<div class="k{fid}-chip" data-r style="position:absolute;left:10px;top:520px;background:#000;color:#fff;padding:16px 30px;font-weight:900;font-size:52px;">= 10 stig</div></div>')
    if frame == 5:  # three figures around one card
        def fig(x, c, rot):
            return (f'<div data-r style="position:absolute;left:{x}px;top:60px;transform:rotate({rot}deg);">'
                    f'<div class="k{fid}-chip" style="width:110px;height:110px;background:{C[c]};margin:0 auto;"></div>'
                    f'<div class="k{fid}-chip" style="width:150px;height:200px;background:#fff;margin-top:14px;"></div></div>')
        return P + (fig(0, "pink", -4) + fig(200, "blue", 2) + fig(400, "green", 5) +
                    f'<div class="k{fid}-box" id="k{fid}-pcard" data-r style="position:absolute;left:60px;top:300px;width:440px;padding:26px;text-align:center;font-weight:900;font-size:50px;transform:rotate(-2deg);">hópverkefni</div>'
                    f'<div style="position:absolute;left:30px;top:500px;display:flex;gap:24px;">'
                    f'<span data-r class="k{fid}-pill" style="background:{C["cream"]};">nóvember</span><span data-r class="k{fid}-pill" style="background:{C["blue"]};">desember</span></div></div>')
    if frame == 6:  # 1-10 ruler, need 5
        sq = "".join(
            f'<div class="k{fid}-chip" id="k{fid}-n{i}" data-r style="width:86px;height:86px;background:{C["green"] if i >= 5 else "#fff"};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:44px;">{i}</div>'
            for i in range(1, 11))
        return P + (f'<div style="position:absolute;left:10px;top:120px;display:grid;grid-template-columns:repeat(5,86px);gap:20px;">{sq}</div>'
                    f'<div data-r class="k{fid}-star" style="left:300px;top:330px;width:250px;height:250px;background:{C["yellow"]};font-weight:900;font-size:36px;line-height:1.05;flex-direction:column;filter:drop-shadow(5px 5px 0 #000);"><div>þú þarft</div><div style="font-size:72px;">5</div></div></div>')
    if frame == 7:  # 8 of 10 checked
        sq = "".join(
            f'<div class="k{fid}-chip" id="k{fid}-c{i}" data-r style="width:86px;height:86px;background:{C["green"] if i < 8 else "#fff"};display:flex;align-items:center;justify-content:center;">{check(fid, 40) if i < 8 else ""}</div>'
            for i in range(10))
        return P + (f'<div style="position:absolute;left:10px;top:60px;display:grid;grid-template-columns:repeat(5,86px);gap:20px;">{sq}</div>'
                    f'<div data-r class="k{fid}-box" style="position:absolute;left:10px;top:330px;width:520px;padding:20px 30px;background:#000;color:#fff;transform:rotate(-2deg);">'
                    f'<div style="font-weight:900;font-size:150px;line-height:1;">80%</div>'
                    f'<div style="font-family:Space Grotesk;font-weight:700;font-size:30px;letter-spacing:.08em;margin-top:6px;">MINNST</div></div></div>')
    if frame == 8:  # submit button + improve loop
        return P + (f'<div class="k{fid}-box" id="k{fid}-btn" data-r style="position:absolute;left:40px;top:80px;width:400px;padding:30px 0;background:{C["yellow"]};text-align:center;font-weight:900;font-size:80px;">Skila</div>'
                    f'<svg data-r style="position:absolute;left:300px;top:150px;overflow:visible" width="260" height="330" viewBox="0 0 260 330">'
                    f'<path id="k{fid}-loop" d="M150 60 C 260 60, 260 300, 120 300 C 60 300, 40 260, 40 240" fill="none" stroke="#000" stroke-width="10"/>'
                    f'<polygon points="18,250 62,250 40,212" fill="#000" transform="rotate(180 40 231)"/></svg>'
                    f'<span data-r class="k{fid}-pill" style="position:absolute;left:380px;top:300px;background:#fff;font-size:30px;">bæta</span>'
                    f'<div class="k{fid}-box" id="k{fid}-cal" data-r style="position:absolute;left:60px;top:430px;width:300px;transform:rotate(-3deg);padding:0;text-align:center;">'
                    f'<div style="background:{C["pink"]};border-bottom:5px solid #000;font-family:Space Grotesk;font-weight:700;font-size:30px;letter-spacing:.08em;padding:10px;">DESEMBER</div>'
                    f'<div style="font-weight:900;font-size:120px;line-height:1.15;">11.</div></div></div>')
    if frame == 9:  # speech bubble + raised hand figure
        return P + (f'<div class="k{fid}-box" id="k{fid}-bubble" data-r style="position:absolute;left:0;top:40px;width:560px;padding:40px 36px;font-weight:900;font-size:60px;line-height:1.1;transform:rotate(-2deg);">„Geturðu hjálpað mér?“</div>'
                    f'<div data-r="with" style="position:absolute;left:110px;top:282px;width:0;height:0;border-left:30px solid transparent;border-right:30px solid transparent;border-top:60px solid #000;"></div>'
                    f'<div data-r="with" style="position:absolute;left:120px;top:274px;width:0;height:0;border-left:20px solid transparent;border-right:20px solid transparent;border-top:44px solid #fff;"></div>'
                    f'<div data-r style="position:absolute;left:60px;top:380px;">'
                    f'<div class="k{fid}-chip" style="width:110px;height:110px;background:{C["pink"]};"></div>'
                    f'<div class="k{fid}-chip" style="width:150px;height:170px;background:#fff;margin:14px 0 0 -20px;"></div></div>'
                    
                    f'<div data-r class="k{fid}-star" style="left:330px;top:400px;width:200px;height:200px;background:{C["yellow"]};font-weight:900;font-size:110px;filter:drop-shadow(5px 5px 0 #000);">?</div></div>')
    return P + "</div>"


def word_frame(frame, fid, word, gram, gc, accent, sentence):
    d = dur(frame)
    n = frame - 1
    hs = head_size(word)
    stage = (
        f'<div style="position:absolute;left:110px;top:66px;"><span class="k{fid}-pill" style="background:{C["yellow"]};">orðabókin</span></div>'
        + progress(fid, n)
        + f'<div id="k{fid}-card" class="k{fid}-box k{fid}-card" style="position:absolute;left:110px;top:170px;width:1060px;height:690px;transform:rotate(-1.5deg);padding:56px 64px;box-shadow:14px 14px 0 #000;border-width:6px;">'
        f'<span class="k{fid}-pill k{fid}-gram" style="background:{C[accent]};font-size:24px;">{gram}</span>'
        f'<div id="k{fid}-head" style="font-weight:900;font-size:{hs}px;line-height:1.05;letter-spacing:-.03em;margin:30px 0 26px;white-space:nowrap;">{letters(fid, word)}</div>'
        f'<div style="height:6px;background:#000;width:100%;margin-bottom:34px;"></div>'
        f'<div id="k{fid}-sent" style="font-weight:700;font-size:58px;line-height:1.3;">{sentence_html(fid, sentence, hi=len(sentence.split())-1)}</div>'
        f'</div>'
        + pic(fid, frame)
    )
    return template(fid, d, {"ground": ground(fid, gc), "stage": stage}, script="" if SKETCH else word_script(frame, fid, word, sentence))


def letters(fid, word):
    return "".join(f'<span class="k{fid}-L" style="display:inline-block;">{escape(ch)}</span>' for ch in word)


def J(x):
    return json.dumps(x)


def words_of(frame, part=None):
    ws = VOICES[frame]["words"]
    return [w for w in ws if part is None or w.get("part") == part]


def karaoke(fid, display_n, spoken, end_hold=0.45):
    """Map display tokens to spoken words; return tween lines lighting each token as it is spoken."""
    n_sp = len(spoken)
    groups = [[i] for i in range(display_n)]
    if n_sp > display_n:  # extra spoken words (e.g. '80%' = 'áttatíu prósent') belong to the last token
        groups[-1] = list(range(display_n - 1, n_sp))
    out = []
    for i, g in enumerate(groups):
        s = spoken[g[0]]["start"]
        e = spoken[g[-1]]["end"]
        nxt = spoken[groups[i + 1][0]]["start"] if i + 1 < len(groups) else e + end_hold
        sel = f'.k{fid}-w[data-i="{i}"]'
        out.append(f'tl.to({J(sel)},{{opacity:1,backgroundColor:"rgba(247,203,70,1)",boxShadow:"0 0 0 6px rgba(247,203,70,1)",duration:0.08}},{s:.3f});')
        out.append(f'tl.to({J(sel)},{{backgroundColor:"rgba(247,203,70,0)",boxShadow:"0 0 0 6px rgba(247,203,70,0)",duration:0.12}},{max(nxt, s + 0.12):.3f});')
    return out


def reveal_units(fid, t0, t1):
    """Reveal the picture's [data-r] parts evenly between t0 and t1 (tails ride with their bubble)."""
    return [
        f'(function(){{var all=Array.prototype.slice.call(document.querySelectorAll(".k{fid}-pic [data-r]"));',
        'var units=[];all.forEach(function(el){if(el.getAttribute("data-r")==="with"&&units.length){units[units.length-1].push(el);}else{units.push([el]);}});',
        f'var t0={t0:.3f},t1={t1:.3f},step=units.length>1?(t1-t0)/(units.length-1):0;',
        'units.forEach(function(u,k){tl.fromTo(u,{opacity:0,scale:0.55},{opacity:1,scale:1,duration:0.38,ease:"back.out(2.2)"},t0+k*step);});})();',
    ]


def word_script(frame, fid, word, sentence):
    d = dur(frame)
    head = words_of(frame, "head")
    sent = words_of(frame, "sentence")
    hs = head[0]["start"]
    s0, s1 = sent[0]["start"], sent[-1]["end"]
    L = []
    L.append(f'tl.fromTo(".k{fid}-card",{{opacity:0,y:70,rotation:-5}},{{opacity:1,y:0,rotation:-1.5,duration:0.5,ease:"back.out(1.4)"}},0);')
    L.append(f'tl.to(".k{fid}-card",{{rotation:-0.8,duration:{d - 0.6:.3f},ease:"none"}},0.5);')
    L.append(f'tl.fromTo(".k{fid}-pg{frame - 2}",{{backgroundColor:"#FFFFFF"}},{{backgroundColor:"#000000",duration:0.15}},0.35);')
    L.append(f'tl.fromTo(".k{fid}-gram",{{opacity:0,scale:0.6}},{{opacity:1,scale:1,duration:0.3,ease:"back.out(2)"}},0.3);')
    type_start = max(0.3, hs - 0.5)
    stagger = min(0.07, 0.45 / max(1, len(word)))
    L.append(f'tl.fromTo(".k{fid}-L",{{opacity:0,y:18}},{{opacity:1,y:0,duration:0.05,stagger:{stagger:.3f}}},{type_start:.3f});')
    L.append(f'tl.fromTo(".k{fid}-w",{{opacity:0,y:14}},{{opacity:0.28,y:0,duration:0.25,stagger:0.02}},{max(0.6, s0 - 0.45):.3f});')
    L += karaoke(fid, len(sentence.split(" ")), sent)
    L += reveal_units(fid, max(0.55, hs - 0.1), max(s0 + 0.4, s1 - 0.3))
    if frame == 8:  # the Skila button gets pressed when "Skilaðu" is said
        L.append(f'tl.to(".k{fid}-pic [data-r]:first-child",{{x:7,y:7,boxShadow:"2px 2px 0 #000",duration:0.1}},{s0 + 0.05:.3f});')
        L.append(f'tl.to(".k{fid}-pic [data-r]:first-child",{{x:0,y:0,boxShadow:"9px 9px 0 #000",duration:0.18}},{s0 + 0.2:.3f});')
    return "\n".join(L)


def intro_frame():
    fid, d = "01-velkomin", dur(1)
    sp = words_of(1)
    cols = ["blue", "pink", "green", "yellow", "cream", "blue", "pink", "green"]
    rots = [-14 + i * 4 for i in range(8)]
    fan = "".join(
        f'<div class="k{fid}-chip k{fid}-fan" style="position:absolute;left:{1040 + i * 74}px;top:{250 + (i % 2) * 36}px;width:280px;height:360px;background:{C[c]};'
        f'transform:rotate({rots[i]}deg);transform-origin:50% 120%;padding:26px 22px;"><div style="background:#fff;border:4px solid #000;height:70px;"></div>'
        f'<div style="height:8px;background:#000;margin:26px 0 0;width:70%;"></div><div style="height:8px;background:#000;margin:18px 0 0;width:50%;"></div></div>'
        for i, c in enumerate(cols))
    stage = (
        f'<div style="position:absolute;left:110px;top:150px;width:900px;">'
        f'<span class="k{fid}-pill k{fid}-hello" style="background:{C["yellow"]};">Velkomin í upplýsingatækni</span>'
        f'<div style="font-weight:900;font-size:170px;line-height:.95;letter-spacing:-.04em;margin:44px 0 30px;white-space:nowrap;">{letters(fid, "orðabókin")}</div>'
        f'<div class="k{fid}-sub" style="font-family:Space Grotesk;font-weight:700;font-size:34px;letter-spacing:.06em;">UPPT1ÍA03AT · SPÖNN 2 · HAUST 2026</div>'
        f'<div class="k{fid}-box k{fid}-sbox" style="margin-top:56px;padding:28px 36px;font-weight:700;font-size:56px;line-height:1.25;transform:rotate(-1deg);width:860px;">'
        f'{sentence_html(fid, "Lærðu 8 orð. Þá skilur þú áfangann.", hi=1)}</div></div>'
        f'<div style="position:absolute;inset:0;">{fan}</div>'
        f'<div class="k{fid}-star k{fid}-eight" style="left:1560px;top:640px;width:260px;height:260px;background:{C["pink"]};font-weight:900;font-size:64px;filter:drop-shadow(6px 6px 0 #000);">8 orð</div>'
    )
    L = [
        f'tl.fromTo(".k{fid}-hello",{{opacity:0,scale:0.6}},{{opacity:1,scale:1,duration:0.35,ease:"back.out(2)"}},0.15);',
        f'tl.fromTo(".k{fid}-L",{{opacity:0,y:30}},{{opacity:1,y:0,duration:0.06,stagger:0.07}},0.3);',
        f'tl.fromTo(".k{fid}-sub",{{opacity:0,x:-30}},{{opacity:1,x:0,duration:0.4}},1.0);',
    ]
    for i, r in enumerate(rots):
        L.append(f'tl.fromTo(document.querySelectorAll(".k{fid}-fan")[{i}],{{opacity:0,rotation:0,x:300}},{{opacity:1,rotation:{r},x:0,duration:0.45,ease:"back.out(1.6)"}},{0.5 + i * 0.22:.3f});')
    s3 = sp[3]["start"]
    L.append(f'tl.fromTo(".k{fid}-sbox",{{opacity:0,y:40,rotation:-4}},{{opacity:1,y:0,rotation:-1,duration:0.4,ease:"back.out(1.6)"}},{s3 - 0.5:.3f});')
    L.append(f'tl.fromTo(".k{fid}-w",{{opacity:0}},{{opacity:0.28,duration:0.2,stagger:0.02}},{s3 - 0.35:.3f});')
    L += karaoke(fid, 7, sp[3:10])
    L.append(f'tl.fromTo(".k{fid}-eight",{{opacity:0,scale:0.3,rotation:-40}},{{opacity:1,scale:1,rotation:0,duration:0.5,ease:"back.out(2.4)"}},{sp[4]["start"]:.3f});')
    L.append(f'tl.to(".k{fid}-eight",{{rotation:12,duration:{d - sp[4]["start"] - 0.6:.3f},ease:"none"}},{sp[4]["start"] + 0.5:.3f});')
    return fid, template(fid, d, {"ground": ground(fid, "cream", "left:40px;bottom:30px;"), "stage": stage}, script="\n".join(L))


def outro_frame():
    fid, d = "10-lok", dur(10)
    sp = words_of(10)
    cols = ["blue", "pink", "green", "yellow", "cream", "blue", "pink", "green"]
    grid = "".join(
        f'<div class="k{fid}-chip k{fid}-g" style="background:{C[c]};padding:16px 10px;text-align:center;font-weight:900;font-size:40px;transform:rotate({(-1) ** i * 2}deg);">{escape(w)}</div>'
        for i, (w, c) in enumerate(zip(ALL_WORDS, cols)))
    stage = (
        f'<div style="position:absolute;left:110px;top:60px;"><span class="k{fid}-pill k{fid}-know" style="background:{C["yellow"]};">Nú kanntu 8 orð</span></div>'
        f'<div style="position:absolute;left:110px;top:150px;width:1700px;display:grid;grid-template-columns:repeat(4,1fr);gap:28px 34px;">{grid}</div>'
        f'<div class="k{fid}-close" style="position:absolute;left:260px;top:420px;width:1400px;height:440px;border:6px solid #fff;box-shadow:22px 22px 0 {C["yellow"]};background:#000;color:#fff;padding:50px 70px;">'
        f'<div style="font-weight:900;font-size:80px;line-height:1.08;letter-spacing:-.02em;"><div>Mundu að spyrja</div><div>kennarann um hjálp.</div></div>'
        f'<div class="k{fid}-l2" style="font-weight:700;font-size:56px;line-height:1.3;margin-top:26px;">Það má alltaf hjálpast að.</div>'
        f'<span class="k{fid}-pill k{fid}-bye" style="margin-top:36px;background:{C["pink"]};color:#000;font-size:30px;">Gangi þér vel!</span></div>'
        f'<div class="k{fid}-star k{fid}-burst" style="left:1560px;top:720px;width:200px;height:200px;background:{C["green"]};filter:drop-shadow(6px 6px 0 #fff);"></div>'
    )
    L = [f'tl.fromTo(".k{fid}-know",{{opacity:0,scale:0.6}},{{opacity:1,scale:1,duration:0.35,ease:"back.out(2)"}},0.1);']
    for i in range(8):
        r = (-1) ** i * 2
        L.append(f'tl.fromTo(document.querySelectorAll(".k{fid}-g")[{i}],{{opacity:0,scale:0.4,rotation:{r * 6}}},{{opacity:1,scale:1,rotation:{r},duration:0.4,ease:"back.out(2)"}},{0.3 + i * 0.2:.3f});')
    first = lambda txt: next(w["start"] for w in sp if w["text"].strip(".,!") == txt)
    t_this, t_open, t_bye = first("Mundu"), first("Það"), first("Gangi")
    L.append(f'tl.fromTo(".k{fid}-close",{{opacity:0,y:90}},{{opacity:1,y:0,duration:0.5,ease:"back.out(1.3)"}},{t_this - 0.35:.3f});')
    L.append(f'tl.fromTo(".k{fid}-l2",{{opacity:0,x:-30}},{{opacity:1,x:0,duration:0.4}},{t_open - 0.2:.3f});')
    L.append(f'tl.fromTo(".k{fid}-bye",{{opacity:0,scale:0.5}},{{opacity:1,scale:1,duration:0.4,ease:"back.out(2.4)"}},{t_bye - 0.1:.3f});')
    L.append(f'tl.fromTo(".k{fid}-burst",{{opacity:0,scale:0.2,rotation:-60}},{{opacity:1,scale:1,rotation:0,duration:0.5,ease:"back.out(2.4)"}},{t_bye + 0.3:.3f});')
    L.append(f'tl.to(".k{fid}-burst",{{rotation:30,duration:{d - t_bye - 1.0:.3f},ease:"none"}},{t_bye + 0.8:.3f});')
    L.append(f'tl.to(".k{fid}-stagefade",{{opacity:1,duration:0.7}},{d - 0.8:.3f});')
    stage += f'<div class="k{fid}-stagefade" style="position:absolute;inset:0;background:#000;opacity:0;"></div>'
    return fid, template(fid, d, {"ground": f'<div style="position:absolute;inset:0;background:#000;"></div>', "stage": stage}, script="\n".join(L))



def main():
    out = PROJ / "compositions" / "frames"
    out.mkdir(parents=True, exist_ok=True)
    frames = [(1,) + intro_frame()]
    for w in WORDS:
        frames.append((w[0], w[1], word_frame(*w)))
    frames.append((10,) + outro_frame())
    frames.sort()
    t, hosts, starts = 0.0, [], {}
    for frame, fid, html in frames:
        (out / f"{fid}.html").write_text(html, encoding="utf-8")
        d = dur(frame)
        starts[frame] = (round(t, 3), d)
        hosts.append(f'<div id="host-{fid}" data-composition-id="{fid}" data-composition-src="compositions/frames/{fid}.html" '
                     f'data-start="{t:.3f}" data-duration="{d}" data-track-index="1" data-width="1920" data-height="1080"></div>')
        t += d
    if SKETCH:
        index = f"""<!doctype html>
<html lang="is"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>*{{margin:0;padding:0;box-sizing:border-box;}} html,body{{margin:0;width:1920px;height:1080px;overflow:hidden;background:#FFFDF5;}} #root{{position:relative;width:100%;height:100%;background:#FFFDF5;}}</style>
</head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{t:.3f}" data-width="1920" data-height="1080">
{chr(10).join(hosts)}
</div>
<script>const tl = gsap.timeline({{ paused: true }}); window.__timelines["main"] = tl;</script>
</body></html>
"""
        (PROJ / "index.html").write_text(index, encoding="utf-8")
    print(json.dumps({f: s for f, s in starts.items()}))
    print(f"total {t:.2f}s")


if __name__ == "__main__":
    main()
