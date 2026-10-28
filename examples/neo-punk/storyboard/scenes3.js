// "Vefþróun með gervigreind": the 14 scenes. ART[id](g, t, d) draws scene-local time t.
// The compositor (ART_draw) steps time on twos (12 drawings/s at 24 fps), boils outlines 8x/s,
// and applies one/two-frame flash interruptions by overriding the colour roles.
(function () {
  const { E } = window.PX;
  const C = window.CAST3;
  const PI = Math.PI;
  const BEAT = 60 / (window.BPM || 132);
  const b = (n) => n * BEAT;
  const DEF = { bg: "orange", fig: "cream", ink: "black", acc: "red", hi: "cream", ai: "green" };
  const pal = (g, r = {}) => { g.roles = Object.assign({}, DEF, r, g._ov || {}); };
  const withRoles = (g, r, fn) => { const keep = g.roles; g.roles = Object.assign({}, keep, r, g._ov || {}); const out = fn(); g.roles = keep; return out; };
  const sil = (c) => ({ fig: c, ink: c, acc: c, hi: c, ai: c });
  // pale figure with a cream rim, for black backgrounds
  const pale = (g, fn) => g.rim((L) => fn(L), "cream", 1);
  const pop = (t, at, len = 0.18) => E.back(E.seg(t, at, at + len));
  // poster text; fits to maxW by shrinking the scale
  function poster(g, str, x, y, o = {}) {
    let sc = o.scale || 3;
    const maxW = o.maxW || 300;
    while (sc > 1 && g.shout(str, 0, -999, { scale: sc }) > maxW) sc--;
    y = Math.max(y, 19 * PX.mapScale(sc) + 2); // keep accents (Á Ó Ú Í) inside the frame
    return g.shout(str, x, y, { scale: sc, color: o.color || "ink", shadow: o.shadow, align: o.align, seed: str.length });
  }
  // a slam: big -> normal over 2 frames, with shake
  const slamScale = (t, at, base) => (t < at ? 0 : t < at + 1 / 12 ? base + 1 : base);
  function codeLines(g, x, y, w, h, t, seed, c = "hi", speed = 30) {
    for (let i = 0; i < 14; i++) {
      const yy = y + ((i * 9 - t * speed) % (h + 20) + h + 20) % (h + 20) - 10;
      if (yy < y || yy > y + h - 3) continue;
      const ind = Math.floor(E.rnd(i + seed) * 3) * 6;
      g.rect(x + ind, yy, 8 + E.rnd(i * 7 + seed) * (w - 20 - ind), 3, c);
    }
  }
  function browser(g, x, y, w, h, c = "hi") { g.rect(x - 2, y - 2, w + 4, h + 4, "ink"); g.rect(x, y, w, h, c); g.rect(x, y, w, 7, "ink"); for (let i = 0; i < 3; i++) g.disc(x + 5 + i * 6, y + 3, 1, "hi"); }
  function stamp(g, str, x, y, t, at, o = {}) {
    if (t < at) return;
    const sc = t < at + 1 / 12 ? (o.scale || 2) + 1 : o.scale || 2;
    g.label(str, x, y, { scale: sc, fill: o.fill || "acc", color: o.color || "hi", align: "center" });
  }
  function horn(g, x, y, s) { g.poly([[x - 5 * s, y], [x + 5 * s, y], [x + 2 * s, y - 20 * s]], "ink"); g.poly([[x - 3 * s, y - 1], [x + 3 * s, y - 1], [x + 1.5 * s, y - 16 * s]], "hi"); }
  function tile(g, x, y, label, s = 1, fill = "hi") { g.rect(x - 20 * s + 2, y - 10 * s + 2, 40 * s, 20 * s, "ink"); g.rect(x - 20 * s, y - 10 * s, 40 * s, 20 * s, fill); g.text(label, x, y + 6 * s, { scale: s, raw: true, align: "center", color: "ink" }); }
  function check(g, x, y, s = 1, c = "acc") { g.line(x, y, x + 5 * s, y + 6 * s, c, 3 * s); g.line(x + 5 * s, y + 6 * s, x + 16 * s, y - 8 * s, c, 3 * s); }
  function balloon(g, x, y, str, tailX, tailY) {
    const w = g.measure(str, { scale: 1, raw: true }) + 20, h = 26;
    g.poly([[tailX, tailY], [x - 6, y + h / 2 - 2], [x + 8, y + h / 2 - 2]], "ink");
    const pts = []; for (let i = 0; i < 16; i++) { const a = (i / 16) * PI * 2, r = i % 2 ? 1 : 1.14; pts.push([x + Math.cos(a) * (w / 2) * r, y + Math.sin(a) * (h / 2) * r]); }
    g.polyO(pts, "hi", "ink", 2);
    g.text(str, x, y + 6, { scale: 1, raw: true, align: "center", color: "ink" });
  }

  const ART = {};

  // 1: hook
  ART[1] = (g, t) => {
    if (t < b(8)) {
      pal(g, { bg: "black" }); g.clear();
      if (t < b(2)) { C.ai(g, 190, 250, { R: 112, mood: "eager", t, look: Math.sin(t * 3) }); return; }
      codeLines(g, 14, 98, 130, 76, t, 3, "hi", 60);
      C.ai(g, 248, 166, { R: 32, mood: "type", t });
      poster(g, "GERVIGREIND", 14, 50, { scale: 4, color: "ai", align: "left" });
      poster(g, "SKRIFAR KÓÐANN", 14, 82, { scale: 3, color: "hi", align: "left" });
    } else if (t < b(14)) {
      pal(g, { bg: "blue" }); g.clear();
      C.head(g, 105, 100, 66, { face: "shock", t, id: 1, hair: "spikes" });
      poster(g, "TIL HVERS", 250, 74, { scale: 3, color: "hi", shadow: "ink", maxW: 150 });
      poster(g, "AÐ LÆRA?", 250, 108, { scale: 3, color: "hi", shadow: "ink", maxW: 150 });
    } else {
      pal(g, { bg: "orange" }); g.clear();
      const fall = E.seg(t, b(18), b(20));
      for (let i = 0; i < 7; i++) {
        const wob = t > b(15) ? Math.round(Math.sin(t * 20 + i) * (i * 0.6)) : 0;
        const fx = (E.rnd(i * 3) - 0.5) * 160 * fall, fy = fall * fall * (120 + i * 10) - Math.sin(fall * PI) * 30 * E.rnd(i);
        const red = i === 3 && t > b(16);
        g.rect(210 + wob + fx - 1, 162 - i * 15 + fy - 1, 52, 15, "ink");
        g.rect(210 + wob + fx, 162 - i * 15 + fy, 50, 13, red ? "acc" : "hi");
        g.rect(214 + wob + fx, 166 - i * 15 + fy, 20 + E.rnd(i) * 20, 2, "ink");
      }
      if (t > b(14)) C.ai(g, 290, 176, { R: 14, mood: t > b(16) ? "wrong" : "type", t });
      const h = C.hero(g, 86, 176, { R: 24, face: t > b(18) ? "smug" : "focus", arms: t > b(18) ? "point" : "hips", t });
      if (t > b(19)) { poster(g, "EINHVER ÞARF", 160, 32, { scale: 3, color: "ink", shadow: "hi" }); poster(g, "AÐ STÝRA HENNI", 160, 58, { scale: 3, color: "ink", shadow: "hi" }); }
    }
  };

  // 2: title slams
  ART[2] = (g, t) => {
    pal(g, { bg: "black" }); g.clear();
    if (t > b(10)) { pale(g, (L) => C.hero(L, 34, 190, { R: 20, face: "smug", arms: "hips", t })); C.ai(g, 292, 186, { R: 16, mood: "proud", t }); }
    const words = [["VEFÞRÓUN", "hi", 46, 0, 4], ["MEÐ", "orange", 82, 4, 3], ["GERVIGREIND", "ai", 128, 8, 4]];
    for (const [w, c, y, at, sc] of words) {
      const s = slamScale(t, b(at), sc); if (!s) continue;
      const sh = t < b(at) + 1 / 12 ? Math.round((E.rnd(at) - 0.5) * 6) : 0;
      poster(g, w, 160 + sh, y, { scale: s, color: c, maxW: 310 });
    }
    if (t > b(12)) poster(g, "VEFSKÓLINN · TÆKNISKÓLINN", 164, 166, { scale: 1, color: "hi" });
  };

  // 3: three years or one
  ART[3] = (g, t) => {
    pal(g, { bg: "cream" }); g.clear();
    g.rect(160, 0, 160, 180, "orange");
    // university silhouette
    const ux = 80, uy = 160;
    g.poly([[ux - 62, uy - 70], [ux + 62, uy - 70], [ux, uy - 102]], "ink");
    g.rect(ux - 56, uy - 70, 112, 70, "ink");
    for (let i = 0; i < 6; i++) g.rect(ux - 48 + i * 19, uy - 62, 6, 56, "hi");
    g.rect(0, uy, 160, 20, "ink");
    poster(g, "3 ÁR", 80, 40, { scale: 4, color: "ink" });
    poster(g, "1 ÁR", 240, 40, { scale: 4, color: "ink" });
    let face = "stars", arms = "pointL", look = -1, legs = "stand";
    if (t >= b(5)) { face = "panic"; arms = "shrug"; look = 0; }
    if (t >= b(9)) { face = "grin"; arms = "point"; look = 1; }
    if (t >= b(13)) { face = "joy"; arms = "up"; legs = "jump"; }
    C.hero(g, 166, legs === "jump" ? 168 : 178, { R: 20, face, arms, look, legs, cap: true, t });
  };

  // 4: design + code + AI = unicorn
  ART[4] = (g, t) => {
    pal(g, { bg: "green" }); g.clear();
    if (t < b(8)) {
      const copies = [[110, "orange", 0], [210, "blue", 2], [160, "ink", 4]];
      copies.forEach(([x, c, at]) => {
        if (t < b(at)) return;
        withRoles(g, sil(c === "ink" ? "black" : c), () => {
          const h = C.hero(g, x, 176, { R: 22, face: "focus", arms: c === "orange" ? "pointL" : c === "blue" ? "point" : "hips", t });
          if (c === "orange") g.line(h.hl[0], h.hl[1], h.hl[0] - 10, h.hl[1] - 14, "fig", 4);
          if (c === "blue") { g.rect(h.hr[0] - 2, h.hr[1] - 18, 28, 16, "fig"); }
          
        });
        if (c === "blue") g.text("</>", 233, 147, { size: 10, align: "center", color: "hi" });
        if (c === "ink") withRoles(g, {}, () => C.ai(g, 190, 104, { R: 9, mood: "happy", t }));
      });
    } else {
      const h = C.hero(g, 160, 176, { R: 26, face: "stars", arms: "up", t });
      horn(g, h.hx - 4, h.hy - 26, 1.2 * pop(t, b(8), 0.2));
      C.ai(g, 205, 112, { R: 12, mood: "happy", t });
    }
    poster(g, "HÖNNUN + KÓÐI + GERVIGREIND", 160, 30, { scale: 2, color: "ink" });
  };

  // 5: how you work with AI (four posters)
  ART[5] = (g, t) => {
    if (t < b(8)) {
      pal(g, { bg: "orange" }); g.clear();
      const h = C.hero(g, 84, 182, { R: 26, face: "scream", arms: "mega", t });
      C.megaphone(g, h.hr[0] + 2, h.hr[1], 1.4, 1);
      g.speed(h.hr[0] + 30, h.hr[1], 8, 26, 7, "ink", 1, Math.floor(t * 8));
      const p = E.inout(E.seg(t, b(2), b(5)));
      const wx = E.lerp(h.hr[0] + 30, 236, p), wy = E.lerp(h.hr[1], 112, p) - Math.sin(p * PI) * 30;
      g.rect(wx - 20 + 2, wy - 14 + 2, 40, 28, "ink"); g.rect(wx - 20, wy - 14, 40, 28, "hi");
      g.rect(wx - 16, wy - 10, 32, 4, "ink"); g.rect(wx - 16, wy - 3, 14, 12, "ink"); g.rect(wx + 1, wy - 3, 15, 3, "ink"); g.rect(wx + 1, wy + 3, 12, 3, "ink");
      C.ai(g, 278, 172, { R: 20, mood: t > b(5) ? "happy" : "eager", t, look: -1 });
      poster(g, "1. LÝSTU", 16, 34, { scale: 4, color: "ink", align: "left", shadow: "hi" });
    } else if (t < b(16)) {
      pal(g, { bg: "black" }); g.clear();
      C.ai(g, 66, 170, { R: 26, mood: "type", t });
      browser(g, 136, 46, 170, 118, "hi");
      const n = Math.floor((t - b(8)) / (BEAT / 2));
      const slots = [[140, 56, 162, 12, "orange"], [140, 72, 70, 50, "ai"], [214, 72, 88, 22, "ink"], [214, 98, 88, 24, "orange"], [140, 126, 162, 10, "ink"], [140, 140, 50, 20, "ai"], [194, 140, 108, 20, "orange"]];
      slots.slice(0, Math.min(slots.length, n)).forEach(([x, y, w, h, c]) => g.rect(x, y, w, h, c));
      poster(g, "2. GERVIGREINDIN SMÍÐAR", 160, 28, { scale: 2, color: "ai" });
    } else if (t < b(24)) {
      pal(g, { bg: "blue" }); g.clear();
      C.head(g, 52, 120, 74, { face: "focus", t, id: 1 });
      const bug = t >= b(20);
      g.ellO(208, 100, 62, 62, "hi", "ink", 3);
      for (let i = 0; i < 8; i++) { const y = 62 + i * 10, w = 40 + E.rnd(i + 5) * 50; g.rect(166 + (i % 3) * 6, y, w, 4, i === 4 && bug ? "acc" : "ink"); }
      if (bug) g.text("!", 290, 92, { size: 10, scale: 4, color: "acc" });
      g.line(160, 146, 128, 178, "ink", 8);
      C.ai(g, 296, 176, { R: 13, mood: bug ? "wrong" : "type", t });
      poster(g, "3. PRÓFAÐU · LESTU KÓÐANN", 160, 24, { scale: 2, color: "hi", shadow: "ink" });
    } else {
      pal(g, { bg: "cream", fig: "cream", hi: "cream" }); g.clear();
      browser(g, 120, 56, 90, 64, "orange");
      g.rect(126, 68, 78, 6, "ink"); g.rect(126, 80, 34, 30, "green"); g.rect(166, 80, 38, 12, "ink");
      C.hero(g, 70, 176, { R: 20, face: "smug", arms: "point", t });
      C.teacherA(g, 262, 176, { R: 20, face: t > b(27) ? "joy" : "think", arms: "hips", t });
      stamp(g, "ÞÚ ÁTT HVERJA LÍNU", 165, 140, t, b(28), { scale: 2 });
      poster(g, "4. ÚTSKÝRÐU", 16, 34, { scale: 3, color: "ink", align: "left" });
    }
  };

  // 6: the foundation pours into your head
  ART[6] = (g, t) => {
    pal(g, { bg: "red", acc: "black" }); g.clear();
    const landed = Math.max(0, Math.min(6, Math.floor((t - b(1)) / b(2)) + 1));
    const grow = landed * 1.5;
    C.head(g, 110, 112, 54 + grow, { face: landed >= 5 ? "smug" : "panic", t, id: 1 });
    const labels = ["HTML", "CSS", "TS", "REACT", "DB", "APP"];
    labels.forEach((l, i) => {
      const at = b(1 + i * 2), p = E.seg(t, at - b(1), at);
      if (p <= 0 || p >= 1) return;
      const x = E.lerp(290, 120, p), y = E.lerp(40 + i * 18, 40, p) - Math.sin(p * PI) * 30;
      tile(g, x, y, l, 1);
    });
    for (let i = 0; i < landed; i++) tile(g, 222 + (i % 2) * 48, 76 + Math.floor(i / 2) * 26, labels[i], 1, "hi");
    if (t % b(2) < 1 / 12 && t > b(1)) g.burst(110, 50, 10, 24, 7, "hi", t);
    poster(g, "LÆRÐU GRUNNINN", 250, 40, { scale: 2, color: "hi", shadow: "ink", maxW: 140 });
  };

  // 7: peer review + industry jury
  ART[7] = (g, t) => {
    if (t < b(8)) {
      pal(g, { bg: "cream" }); g.clear();
      const ok = t >= b(4);
      const h = C.hero(g, 66, 178, { R: 20, face: ok ? "joy" : "panic", arms: "hold", t });
      g.rect(h.hl[0] - 2, h.hl[1] - 18, 34, 24, "ink"); g.rect(h.hl[0], h.hl[1] - 16, 30, 20, "hi"); g.rect(h.hl[0] + 3, h.hl[1] - 13, 22, 3, "orange");
      C.person(g, 200, 178, { R: 18, hair: "bun", id: 5, face: ok ? "grin" : "focus", arms: ok ? "fist" : "hips", flip: true, t, shirt: "orange" });
      C.person(g, 262, 178, { R: 18, hair: "mohawk", hairC: "acc", id: 6, face: ok ? "joy" : "smug", arms: ok ? "fist" : "down", flip: true, t });
      stamp(g, "MÆLI MEÐ!", 132, 70, t, b(5), { scale: 2 });
      poster(g, "JAFNINGJAMAT", 160, 32, { scale: 4, color: "ink" });
    } else {
      pal(g, { bg: "black" }); g.clear();
      const joy = t >= b(13);
      const jump = joy ? Math.abs(Math.sin((t - b(13)) * PI / BEAT)) * 12 : 0;
      pale(g, (L) => C.hero(L, 50, 178 - jump, { R: 16, face: joy ? "joy" : "panic", arms: joy ? "up" : "down", legs: joy ? "jump" : "stand", t }));
      pale(g, (L) => C.person(L, 92, 178 - jump, { R: 14, hair: "bun", id: 5, face: joy ? "joy" : "focus", arms: joy ? "up" : "down", t, shirt: "orange" }));
      [200, 246, 292].forEach((x, i) => {
        withRoles(g, { fig: "cream", ink: "cream", acc: "cream" }, () => { g.ell(x, 130, 13, 14, "fig"); g.poly([[x - 16, 178], [x + 16, 178], [x + 12, 146], [x - 12, 146]], "fig"); });
        const at = b(10 + i * 0.5);
        if (t >= at) { const s = t < at + 1 / 12 ? 1.3 : 1; g.rect(x - 12 * s, 100 - 12 * s, 24 * s, 20 * s, "orange"); g.text(String([9, 10, 10][i]), x, 104, { scale: 1, raw: true, align: "center", color: "ink" }); }
      });
      g.rect(170, 160, 150, 20, "orange");
      poster(g, "5 HÓPVERKEFNI", 160, 42, { scale: 3, color: "orange" });
      poster(g, "DÓMNEFND ÚR ATVINNULÍFINU", 160, 68, { scale: 2, color: "hi" });
    }
  };

  // 8: the teachers
  ART[8] = (g, t) => {
    pal(g, { bg: "blue", acc: "orange" }); g.clear();
    const en = t >= b(8);
    C.teacherA(g, 96, 228, { R: 32, face: en ? "joy" : "grin", arms: en ? "down" : "wave", t, shirt: "orange" });
    C.teacherB(g, 228, 228, { R: 32, face: en ? "scream" : "grin", arms: en ? "fist" : "wave", t: t + 0.3, shirt: "hi" });
    if (en) balloon(g, 244, 34, "HELLO WORLD!", 230, 56);
    poster(g, en ? "KENNT Á ENSKU" : "Á STAÐNUM Í HAFNARFIRÐI", en ? 90 : 160, en ? 40 : 30, { scale: en ? 3 : 2, color: "hi", shadow: "ink", maxW: en ? 160 : 300 });
  };

  // 9: one year, three terms (poster swaps)
  ART[9] = (g, t) => {
    const k = Math.min(3, Math.floor(t / b(4)));
    const bgs = ["orange", "green", "red", "black"];
    pal(g, { bg: bgs[k], acc: k === 2 ? "black" : "red" }); g.clear();
    if (k < 3) {
      const [w, n] = [["HAUST", "30"], ["VOR", "60"], ["SUMAR", "90"]][k];
      poster(g, w, 20, 70, { scale: 6, color: k === 2 ? "hi" : "ink", align: "left", maxW: 200 });
      poster(g, n, 20, 140, { scale: 8, color: "hi", align: "left", shadow: "ink" });
      C.hero(g, 250, 178 - k * 14, { R: 20, face: "focus", arms: k % 2 ? "fist" : "up", legs: "jump", t });
      for (let i = 0; i <= k; i++) g.rect(214 + i * 26, 178 - i * 14, 24, i * 14 + 2, "ink");
    } else {
      poster(g, "1 ÁR · 3 ANNIR · 90 EIN.", 160, 50, { scale: 2, color: "hi" });
      pale(g, (L) => C.hero(L, 160, 178, { R: 24, face: "joy", arms: "up", t }));
    }
  };

  // 10: sleet to Las Palmas
  ART[10] = (g, t) => {
    if (t < b(8)) {
      pal(g, { bg: "blue" }); g.clear();
      for (let i = 0; i < 60; i++) { const x = (E.rnd(i) * 360 + t * 90) % 360 - 20, y = (E.rnd(i + 9) * 200 + t * 160) % 200 - 10; g.line(x, y, x - 3, y + 7, "hi", 1); }
      const shiver = Math.round(Math.sin(t * 60) * 1.5);
      C.hero(g, 160 + shiver, 186, { R: 30, face: "cry", arms: "hold", t });
      poster(g, "-3°", 272, 92, { scale: 4, color: "hi" });
    } else {
      pal(g, { bg: "orange", acc: "red" }); g.clear();
      g.disc(236, 70, 54, "red");
      for (let i = 0; i < 4; i++) g.rect(180, 84 + i * 9, 120, 2 + i, "orange");
      g.rect(0, 150, 320, 30, "ink");
      g.line(48, 176, 62, 70, "ink", 6);
      for (let i = 0; i < 5; i++) { const a = PI + i * PI / 5 + 0.2; g.poly([[62, 70], [62 + Math.cos(a) * 50, 70 + Math.sin(a) * 22 + 12], [62 + Math.cos(a + 0.18) * 40, 70 + Math.sin(a + 0.18) * 16 + 4]], "ink"); }
      const h = C.hero(g, 150, 170, { R: 22, face: "cool", arms: "hold", t });
      C.laptop(g, 150, h.hl[1] + 6, 30, 16, "green");
      C.ai(g, 214, 166, { R: 12, mood: "happy", t });
      g.poly([[202, 142], [226, 142], [220, 136], [208, 136]], "hi");
    }
    poster(g, "ERASMUS+ · LAS PALMAS", 160, 30, { scale: 2, color: t < b(8) ? "hi" : "ink" });
  };

  // 11: final project at a company, then work or study
  ART[11] = (g, t) => {
    if (t < b(8)) {
      pal(g, { bg: "cream" }); g.clear();
      const flip = E.seg(t, b(4), b(4) + 1 / 6);
      const w = Math.round(150 * Math.abs(Math.cos(flip * PI))), staff = flip >= 0.5;
      g.line(160, 0, 160, 30, "ink", 3);
      if (w > 4) {
        g.rect(160 - w / 2 + 4, 36, w, 80, "ink");
        g.rect(160 - w / 2, 32, w, 80, staff ? "acc" : "hi");
        g.rect(160 - w / 2 - 1, 31, w + 2, 2, "ink"); g.rect(160 - w / 2 - 1, 112, w + 2, 2, "ink"); g.rect(160 - w / 2 - 1, 31, 2, 83, "ink"); g.rect(160 + w / 2 - 1, 31, 2, 83, "ink");
        if (w > 100) poster(g, staff ? "STARFSMAÐUR" : "NEMI", 160, 84, { scale: staff ? 2 : 5, color: staff ? "hi" : "ink" });
      }
      C.head(g, 44, 176, 36, { face: staff ? "jaw" : "focus", jaw: 1.0, t, id: 1 });
      poster(g, "LOKAVERKEFNI Í FYRIRTÆKI", 200, 160, { scale: 2, color: "ink", maxW: 230 });
    } else {
      pal(g, { bg: "black" }); g.clear();
      const open = E.out(E.seg(t, b(9), b(9) + 1 / 6));
      [[70, "orange", "VINNA"], [250, "blue", "NÁM"]].forEach(([x, c, l]) => {
        g.rect(x - 32, 54, 64, 120, "hi");
        g.rect(x - 32, 54, 64 * (1 - open) + 4 * open, 120, c);
        poster(g, l, x, 44, { scale: 3, color: c });
      });
      pale(g, (L) => C.hero(L, 160, 178, { R: 22, face: t > b(10) ? "wink" : "grin", arms: "hips", t }));
    }
  };

  // 12: the price
  ART[12] = (g, t) => {
    pal(g, { bg: "green" }); g.clear();
    const rev = t >= b(8);
    const ang = Math.sin(t * 5) * 0.25 * (1 - E.seg(t, b(4), b(8)));
    const px = 220, py = 0, L = 30;
    const P = (dx, dy) => [px + dx * Math.cos(ang) - dy * Math.sin(ang), py + dx * Math.sin(ang) + dy * Math.cos(ang)];
    g.line(px, py, ...P(0, L), "ink", 2);
    const pts = [P(-58, L + 10), P(0, L - 6), P(58, L + 10), P(58, L + 82), P(-58, L + 82)];
    g.polyO(pts, "hi", "ink", 2);
    const [cx, cy] = P(0, L + 46);
    if (rev) {
      g.text("250.000", cx, cy - 16, { size: 10, scale: 2, align: "center", color: "ink" });
      g.line(cx - 34, cy - 24, cx + 34, cy - 20, "acc", 3);
      poster(g, "30.000 KR.", cx, cy + 12, { scale: 3, color: "acc", maxW: 112 });
    } else poster(g, "???", cx, cy + 8, { scale: 4, color: "ink" });
    C.hero(g, 78, 178, { R: 24, face: rev ? "jaw" : "scream", jaw: rev ? 1.2 + E.out(E.seg(t, b(8), b(9))) * 1.2 : 0, arms: rev ? "up" : "hold", t });
    if (rev) poster(g, "Á ÖNN", 220, 140, { scale: 3, color: "ink" });
    if (t >= b(12)) stamp(g, "LÁNSHÆFT", 220, 164, t, b(12), { scale: 2, fill: "ink" });
  };

  // 13: how to get in
  ART[13] = (g, t) => {
    if (t < b(8)) {
      pal(g, { bg: "cream" }); g.clear();
      const rows = ["STÚDENTSPRÓF", "GÓÐ ENSKA", "FORRITUN?"];
      rows.forEach((r, i) => {
        const at = b(i * 2);
        if (t < at) return;
        const w = poster(g, r, 20, 50 + i * 38, { scale: 3, color: "ink", align: "left" });
        if (i < 2 && t >= at + b(1)) check(g, 30 + w, 40 + i * 38, 1.4);
        if (i === 2 && t >= at + b(1)) stamp(g, "EKKI SKILYRÐI", 112, 142, t, at + b(1), { scale: 2 });
      });
      C.hero(g, 290, 180, { R: 16, face: t > b(6) ? "joy" : "panic", arms: t > b(6) ? "up" : "down", t });
    } else {
      pal(g, { bg: "orange" }); g.clear();
      poster(g, "UMSÓKNIR Í FEBRÚAR", 160, 44, { scale: 3, color: "ink", maxW: 300 });
      if (t >= b(12)) poster(g, "BYRJAR Í ÁGÚST", 160, 76, { scale: 3, color: "hi", shadow: "ink", maxW: 300 });
      C.hero(g, 160, 182 - (t >= b(12) ? 10 : 0), { R: 18, face: "grin", arms: t >= b(12) ? "up" : "point", legs: t >= b(12) ? "jump" : "stand", t, cap: true });
    }
  };

  // 14: end card
  ART[14] = (g, t) => {
    if (t < b(12)) {
      pal(g, { bg: "orange" }); g.clear();
      withRoles(g, { fig: "black", ink: "black", acc: "black", hi: "cream", ai: "black" }, () => {
        C.hero(g, 128, 186, { R: 30, face: "smug", arms: "hips", t, flip: true });
        C.ai(g, 214, 176, { R: 30, mood: "eager", t, look: -1 });
      });
      poster(g, "VEFÞRÓUN", 160, 42, { scale: 4, color: "ink" });
      poster(g, "MEÐ GERVIGREIND", 160, 74, { scale: 3, color: "hi", shadow: "ink" });
    } else if (t < b(23.5)) {
      pal(g, { bg: "black" }); g.clear();
      pale(g, (L) => C.head(L, 40, 176, 30, { face: "grin", t, id: 1 }));
      poster(g, "tskoli.is/vefthroun", 180, 90, { scale: 2, color: "ai", maxW: 250 });
      poster(g, "VEFSKÓLINN · TÆKNISKÓLINN", 180, 116, { scale: 1, color: "hi" });
      poster(g, "VEFÞRÓUN MEÐ GERVIGREIND", 180, 50, { scale: 2, color: "orange", maxW: 250 });
    } else { pal(g, { bg: "black" }); g.clear(); }
  };

  // ---------- compositor ----------
  const OV = {
    invert: { bg: "black", fig: "blue", ink: "blue", acc: "blue", hi: "blue", ai: "blue" },
    cream: { bg: "cream", fig: "black", ink: "black", acc: "black", hi: "black", ai: "black" },
    red: { bg: "red", fig: "cream", ink: "cream", acc: "cream", hi: "cream", ai: "cream" },
    swap: { bg: "blue", fig: "orange", ink: "black", acc: "cream", hi: "orange", ai: "cream" },
  };
  window.ART3 = ART;
  window.ART3_draw = (scene, g, t, d) => {
    const tq = Math.floor(t * 24 + 1e-6) / 24;           // 24 fps frames
    const ts = Math.floor(t * 12 + 1e-6) / 12;           // drawings on twos
    g.seed = Math.floor(t * 8);                          // outlines boil on threes
    let fl = null;
    for (const f of scene.flashes || []) { const a = f.beat * BEAT; if (tq >= a - 1e-6 && tq < a + f.frames / 24 - 1e-6) fl = f; }
    g._ov = fl ? OV[fl.kind] : null;
    g.rough = fl ? 2 : 1;
    g.x.save();
    if (fl) { g.x.translate(Math.round((E.rnd(g.seed) - 0.5) * 6), Math.round((E.rnd(g.seed + 3) - 0.5) * 4)); }
    ART[scene.id](g, ts, d);
    g.x.restore();
    if (fl && fl.kind === "red") { g.roles = Object.assign({}, g.roles, OV.red); g.speed(160, 90, 30, 220, 18, "cream", 2, g.seed); }
    g._ov = null;
    g.grain(Math.floor(t * 24), 90, "ink");
  };
})();
