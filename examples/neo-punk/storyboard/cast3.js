// Cast for the neo-punk film. Everything is drawn by colour ROLE (fig, ink, acc, hi, ai) so flash frames can
// recolour or silhouette a whole frame. Characters are deliberately lopsided: asymmetric skulls, mismatched eyes.
(function () {
  const { E } = window.PX;
  const PI = Math.PI;
  const R_ = E.rnd;

  // ---------- face ----------
  // hx, hy = head centre; R = head radius. o: look, fangs (default true), brows, mood colour
  function face(g, hx, hy, R, expr, t = 0, o = {}) {
    const T = Math.max(1, Math.round(R / 14));           // line weight
    const look = Math.round((o.look || 0) * R * 0.08);
    const eL = { x: hx - R * 0.38, y: hy + R * 0.02, r: R * 0.34 };
    const eR = { x: hx + R * 0.38, y: hy + R * 0.07, r: R * 0.26 };
    const my = hy + R * 0.58, mw = R * 0.52;
    const fangs = o.fangs !== false;
    const MC = o.beard ? "acc" : "ink"; // mouth colour: red inside a black beard

    const eye = (e, k = 1, pupil = 0.18) => { g.ellO(e.x, e.y, e.r * k, e.r * k * 1.08, "hi", "ink", T); g.disc(e.x + look, e.y + e.r * 0.1, Math.max(1, e.r * pupil), "ink"); };
    const shut = (e, up = true) => g.arc(e.x, e.y + (up ? e.r * 0.5 : -e.r * 0.3), e.r, e.r * 0.8, up ? PI * 1.1 : PI * 0.1, up ? PI * 1.9 : PI * 0.9, "ink", T + 1);
    const lid = (e) => { eye(e, 1, 0.2); g.rect(e.x - e.r - T, e.y - e.r - T - 1, e.r * 2 + 2 * T + 1, e.r + T, "fig"); g.rect(e.x - e.r - T, e.y - 1, e.r * 2 + 2 * T + 1, T + 1, "ink"); };
    const brow = (e, a, dy = 0) => { const y = e.y - e.r * 1.25 + dy; g.line(e.x - e.r * 1.1, y + a * e.r * 0.5, e.x + e.r * 1.1, y - a * e.r * 0.5, "ink", T + 1); };
    const teeth = (x0, x1, y, h, dir = 1) => { const n = Math.max(3, Math.round((x1 - x0) / Math.max(2, R * 0.12))); for (let i = 0; i < n; i++) { const a = x0 + ((x1 - x0) * i) / n, b = x0 + ((x1 - x0) * (i + 1)) / n; g.poly([[a, y], [b, y], [(a + b) / 2, y + dir * h]], "hi", false); } };
    const grinMouth = (w = mw, h = R * 0.22) => {
      g.poly([[hx - w, my - h * 0.4], [hx + w * 1.05, my - h * 0.7], [hx + w * 0.7, my + h], [hx - w * 0.6, my + h * 0.9]], MC);
      if (fangs) teeth(hx - w * 0.85, hx + w * 0.95, my - h * 0.45, h * 0.7, 1); else g.rect(hx - w * 0.7, my - h * 0.3, w * 1.5, Math.max(1, h * 0.35), "hi");
    };
    const openMouth = (w = mw * 0.7, h = R * 0.45, tongue = true) => {
      g.ell(hx, my + h * 0.3, w, h, MC);
      if (tongue) g.ell(hx + w * 0.15, my + h * 0.9, w * 0.55, h * 0.35, MC === "acc" ? "ink" : "acc");
      if (fangs) { teeth(hx - w * 0.8, hx + w * 0.8, my - h * 0.55, h * 0.4, 1); teeth(hx - w * 0.6, hx + w * 0.6, my + h * 1.15, -h * 0.3, 1); }
    };
    const sweat = (x, y, s = 1) => { g.poly([[x, y - 4 * s], [x - 2.5 * s, y + 1], [x + 2.5 * s, y + 1]], "ink", false); g.ell(x, y + 1, 2.5 * s, 2.5 * s, "ink"); g.ell(x, y + 1, 1.5 * s, 1.5 * s, "hi"); };

    switch (expr) {
      case "grin": brow(eL, -0.3); brow(eR, 0.4); eye(eL); eye(eR); grinMouth(); break;
      case "shock": brow(eL, -0.5, -R * 0.12); brow(eR, 0.5, -R * 0.12); eye(eL, 1.25, 0.08); eye(eR, 1.3, 0.08); openMouth(mw * 0.45, R * 0.42); sweat(hx + R * 1.05, hy - R * 0.4, R / 18); break;
      case "scream": g.line(eL.x - eL.r, eL.y - eL.r * 0.6, eL.x + eL.r, eL.y, "ink", T + 1); g.line(eL.x - eL.r, eL.y + eL.r * 0.6, eL.x + eL.r, eL.y, "ink", T + 1); g.line(eR.x + eR.r, eR.y - eR.r * 0.6, eR.x - eR.r, eR.y, "ink", T + 1); g.line(eR.x + eR.r, eR.y + eR.r * 0.6, eR.x - eR.r, eR.y, "ink", T + 1); openMouth(mw * 0.9, R * 0.55); break;
      case "smug": brow(eL, 0.1, R * 0.08); brow(eR, -0.5, -R * 0.08); lid(eL); lid(eR); g.line(hx - mw * 0.6, my, hx + mw * 0.8, my - R * 0.15, "ink", T + 1); if (fangs) g.poly([[hx + mw * 0.3, my - R * 0.05], [hx + mw * 0.55, my - R * 0.1], [hx + mw * 0.42, my + R * 0.12]], "hi", false); break;
      case "focus": brow(eL, -0.6); brow(eR, 0.6); g.rect(eL.x - eL.r, eL.y, eL.r * 2, T + 1, "ink"); eye(eR, 1.1, 0.25); g.line(hx - mw * 0.5, my, hx + mw * 0.5, my, "ink", T + 1); g.ell(hx + mw * 0.4, my + R * 0.12, R * 0.1, R * 0.12, "acc"); break;
      case "panic": brow(eL, 0.6); brow(eR, -0.6); eye(eL, 1.3, 0.06); eye(eR, 0.7, 0.3); { const j = Math.round(Math.sin(t * 40)); for (let i = 0; i < 6; i++) g.line(hx - mw * 0.7 + i * mw * 0.25, my + (i % 2 ? -1 : 1) * R * 0.08 + j, hx - mw * 0.7 + (i + 1) * mw * 0.25, my + (i % 2 ? 1 : -1) * R * 0.08 + j, "ink", T + 1); } sweat(hx - R * 1.1, hy - R * 0.1, R / 18); sweat(hx + R * 1.1, hy - R * 0.5, R / 22); break;
      case "joy": shut(eL); shut(eR); openMouth(mw * 0.85, R * 0.42); break;
      case "stars": g.burst(eL.x, eL.y, eL.r * 0.45, eL.r * 1.25, 5, "acc", t); g.burst(eR.x, eR.y, eR.r * 0.45, eR.r * 1.25, 5, "acc", -t); openMouth(mw * 0.8, R * 0.4); break;
      case "cry": shut(eL); shut(eR); openMouth(mw * 0.8, R * 0.42); { const f = (t * 6) % 1; for (const e of [eL, eR]) { g.rect(e.x - e.r * 0.2, e.y, Math.max(2, R * 0.08), R * 0.7, "hi"); g.ellO(e.x + (e === eL ? -1 : 1) * f * R * 0.3, e.y + R * 0.6 + f * R * 0.4, R * 0.06, R * 0.09, "hi", "ink"); } } break;
      case "cool": g.poly([[hx - R * 0.85, hy - R * 0.22], [hx + R * 0.8, hy - R * 0.18], [hx + R * 0.7, hy + R * 0.25], [hx + R * 0.1, hy + R * 0.2], [hx - R * 0.05, hy + R * 0.05], [hx - R * 0.2, hy + R * 0.22], [hx - R * 0.75, hy + R * 0.22]], "ink"); g.line(hx - R * 0.6, hy - R * 0.08, hx - R * 0.4, hy - R * 0.12, "hi", T); grinMouth(); break;
      case "jaw": { const jaw = R * (o.jaw ?? 1.6); brow(eL, -0.5, -R * 0.2); brow(eR, 0.5, -R * 0.2); eye(eL, 1.4, 0.06); eye(eR, 1.5, 0.06); g.rect(hx - mw * 0.55 - T, my - R * 0.1, mw * 1.1 + 2 * T, jaw + T, "ink"); g.rect(hx - mw * 0.55 + T, my - R * 0.1 + T, mw * 1.1 - 2 * T, jaw - T, "ink"); g.ell(hx, my + jaw - R * 0.12, mw * 0.4, R * 0.12, "acc"); if (fangs) teeth(hx - mw * 0.5, hx + mw * 0.5, my - R * 0.1, R * 0.2, 1); break; }
      case "wink": brow(eL, 0.3); shut(eL); eye(eR); grinMouth(mw * 0.9); break;
      case "think": brow(eL, 0.4, -R * 0.1); brow(eR, -0.2); eye(eL, 1, 0.2); eye(eR, 1, 0.2); { for (let i = 0; i < 4; i++) g.line(hx - mw * 0.4 + i * mw * 0.2, my + (i % 2) * 2, hx - mw * 0.2 + i * mw * 0.2, my + ((i + 1) % 2) * 2, "ink", T); } break;
      default: eye(eL); eye(eR); g.line(hx - mw * 0.5, my, hx + mw * 0.5, my - 1, "ink", T + 1);
    }
  }

  // ---------- head ----------
  function head(g, hx, hy, R, o = {}) {
    const T = Math.max(1, Math.round(R / 14));
    // lopsided skull: two overlapping ellipses
    g.ell(hx - R * 0.18, hy - R * 0.22, R * 0.92 + T, R * 0.9 + T, "ink", 3);
    g.ell(hx, hy + R * 0.05, R + T, R * 1.02 + T, "ink", 4);
    g.ell(hx - R * 0.18, hy - R * 0.22, R * 0.92, R * 0.9, "fig", 5);
    g.ell(hx, hy + R * 0.05, R, R * 1.02, "fig", 6);
    // ear with a ring
    g.ellO(hx + R * 0.98, hy + R * 0.15, R * 0.14, R * 0.22, "fig", "ink", T);
    if (o.ring !== false) g.arc(hx + R * 1.02, hy + R * 0.42, R * 0.08, R * 0.1, 0, PI * 2, "ink", T);
    hair(g, hx, hy, R, o.hair || "spikes", o.hairC || "ink", o.id || 1);
    if (o.beard) beard(g, hx, hy, R, o.hairC || "ink");
    // nose: little hook
    g.line(hx + R * 0.02, hy + R * 0.18, hx - R * 0.08, hy + R * 0.36, "ink", T); g.line(hx - R * 0.08, hy + R * 0.36, hx + R * 0.06, hy + R * 0.38, "ink", T);
    face(g, hx, hy, R, o.face || "grin", o.t || 0, o);
    if (o.glasses) { const T2 = T + 1; g.rect(hx - R * 0.72, hy - R * 0.28, R * 0.66, T2, "ink"); g.rect(hx + R * 0.12, hy - R * 0.24, R * 0.58, T2, "ink"); g.rect(hx - R * 0.72, hy + R * 0.32, R * 0.66, T2, "ink"); g.rect(hx + R * 0.12, hy + R * 0.34, R * 0.58, T2, "ink"); g.rect(hx - R * 0.72, hy - R * 0.28, T2, R * 0.62, "ink"); g.rect(hx - R * 0.08, hy - R * 0.26, T2, R * 0.62, "ink"); g.rect(hx + R * 0.12, hy - R * 0.24, T2, R * 0.6, "ink"); g.rect(hx + R * 0.68, hy - R * 0.24, T2, R * 0.6, "ink"); }
  }
  function hair(g, hx, hy, R, kind, c, id) {
    if (kind === "spikes") {
      const pts = [[hx - R * 1.05, hy - R * 0.05]];
      const n = 8;
      for (let i = 0; i <= n; i++) {
        const a = PI * (1.05 + (i / n) * 0.95), rr = R * (1.0 + (i % 2 ? 0.05 : 0.55 + R_(i + id * 9) * 0.6));
        pts.push([hx - R * 0.1 + Math.cos(a) * rr * 1.05, hy - R * 0.15 + Math.sin(a) * rr]);
      }
      pts.push([hx + R * 0.95, hy - R * 0.2], [hx + R * 0.35, hy - R * 0.55], [hx + R * 0.15, hy - R * 0.2], [hx - R * 0.15, hy - R * 0.52], [hx - R * 0.55, hy - R * 0.15], [hx - R * 0.7, hy - R * 0.5]);
      g.poly(pts, c);
    } else if (kind === "long") {
      g.poly([[hx - R * 1.15, hy + R * 1.1], [hx - R * 1.2, hy - R * 0.4], [hx - R * 0.7, hy - R * 1.15], [hx + R * 0.3, hy - R * 1.2], [hx + R * 1.1, hy - R * 0.7], [hx + R * 1.2, hy + R * 1.1], [hx + R * 0.9, hy + R * 0.9], [hx + R * 0.85, hy - R * 0.3], [hx + R * 0.2, hy - R * 0.62], [hx - R * 0.3, hy - R * 0.45], [hx - R * 0.85, hy - R * 0.2], [hx - R * 0.85, hy + R * 0.95]], c);
    } else if (kind === "curly") {
      for (let i = 0; i < 9; i++) { const a = PI * (1.0 + (i / 8) * 1.0); g.ell(hx + Math.cos(a) * R * 1.0, hy - R * 0.2 + Math.sin(a) * R * 0.95, R * 0.3, R * 0.28, c, i); }
      g.ell(hx, hy - R * 0.72, R * 0.78, R * 0.28, c, 40);
    } else if (kind === "bun") {
      g.poly([[hx - R * 1.0, hy - R * 0.1], [hx - R * 0.8, hy - R * 0.8], [hx + R * 0.2, hy - R * 1.05], [hx + R * 1.0, hy - R * 0.4], [hx + R * 0.6, hy - R * 0.45], [hx - R * 0.4, hy - R * 0.4]], c);
      g.ell(hx + R * 0.1, hy - R * 1.25, R * 0.38, R * 0.32, c, 7);
    } else if (kind === "mohawk") {
      const pts = [[hx - R * 0.25, hy - R * 0.7]];
      for (let i = 0; i < 6; i++) pts.push([hx - R * 0.35 + i * R * 0.15, hy - R * (1.5 + (i % 2) * 0.35)], [hx - R * 0.28 + i * R * 0.15, hy - R * 1.0]);
      pts.push([hx + R * 0.6, hy - R * 0.8]);
      g.poly(pts, c);
    }
  }
  function beard(g, hx, hy, R, c) {
    g.poly([[hx - R * 0.98, hy + R * 0.2], [hx - R * 0.75, hy + R * 0.95], [hx - R * 0.3, hy + R * 1.4], [hx + R * 0.05, hy + R * 1.55], [hx + R * 0.45, hy + R * 1.35], [hx + R * 0.85, hy + R * 0.9], [hx + R * 1.0, hy + R * 0.2], [hx + R * 0.75, hy + R * 0.5], [hx + R * 0.3, hy + R * 0.42], [hx - R * 0.3, hy + R * 0.42], [hx - R * 0.75, hy + R * 0.5]], c);
  }

  // ---------- full figure ----------
  // (x, y) = point between the feet. R = head radius. o: face, arms, legs, t, look, hair, hairC, beard, glasses, cap, jacket, shirt, squash
  function person(g, x, y, o = {}) {
    const R = o.R || 18, t = o.t || 0, T = Math.max(1, Math.round(R / 10));
    const leg = R * 1.0, bodyH = R * 1.25, bw = R * 1.1;
    const sq = o.squash || 0; // -1..1 : squash (+) / stretch (-)
    const by = y - leg * (1 - sq * 0.4) - bodyH * (1 - sq * 0.3);
    const hx = x + (o.lean || 0), hy = by - R * 0.95;
    const A = o.arms || "down";
    // legs + boots
    if (o.legs !== "none") {
      const L = o.legs || "stand", ph = Math.sin(t * 14);
      const fx = L === "wide" ? [-R * 0.55, R * 0.55] : L === "run" ? [-R * 0.4 + ph * R * 0.4, R * 0.3 - ph * R * 0.4] : L === "jump" ? [-R * 0.3, R * 0.35] : [-R * 0.25, R * 0.25];
      const fy = L === "jump" ? [y - leg * 0.35, y - leg * 0.2] : [y, y];
      for (let k = 0; k < 2; k++) { g.line(x + (k ? R * 0.18 : -R * 0.18), by + bodyH - 2, x + fx[k], fy[k] - T * 2, "ink", T + 1); g.poly([[x + fx[k] - R * 0.22, fy[k]], [x + fx[k] + R * 0.38, fy[k]], [x + fx[k] + R * 0.3, fy[k] - R * 0.25], [x + fx[k] - R * 0.18, fy[k] - R * 0.28]], "ink"); }
    }
    // arms behind for "up"
    const sh = [x - bw * 0.5, by + R * 0.25], sr = [x + bw * 0.5, by + R * 0.25];
    let hl, hr;
    const wig = Math.sin(t * 16) * R * 0.25;
    switch (A) {
      case "up": hl = [x - R * 1.4, hy - R * 1.1]; hr = [x + R * 1.5, hy - R * 1.2]; break;
      case "point": hl = [sh[0] - R * 0.2, by + bodyH * 0.9]; hr = [sr[0] + R * 1.5, by - R * 0.1]; break;
      case "pointL": hl = [sh[0] - R * 1.5, by - R * 0.1]; hr = [sr[0] + R * 0.2, by + bodyH * 0.9]; break;
      case "type": { const b = Math.round(Math.sin(t * 40) * T); hl = [x - R * 0.5, by + bodyH * 0.6 + b]; hr = [x + R * 0.5, by + bodyH * 0.6 - b]; break; }
      case "hold": hl = [x - R * 0.45, by + bodyH * 0.55]; hr = [x + R * 0.45, by + bodyH * 0.55]; break;
      case "shrug": hl = [x - R * 1.3, by - R * 0.15]; hr = [x + R * 1.3, by - R * 0.15]; break;
      case "fist": hl = [sh[0] - R * 0.2, by + bodyH * 0.9]; hr = [x + R * 1.0, hy - R * 1.3]; break;
      case "wave": hl = [sh[0] - R * 0.2, by + bodyH * 0.9]; hr = [x + R * 1.3 + wig, hy - R * 0.9]; break;
      case "hips": hl = [x - R * 0.95, by + bodyH * 0.55]; hr = [x + R * 0.95, by + bodyH * 0.55]; break;
      case "mega": hl = [sh[0] - R * 0.2, by + bodyH * 0.9]; hr = [hx + R * 0.9, hy + R * 0.55]; break;
      case "lens": hl = [sh[0] - R * 0.2, by + bodyH * 0.9]; hr = [sr[0] + R * 1.2, by - R * 0.3]; break;
      default: hl = [sh[0] - R * 0.25, by + bodyH * 0.95]; hr = [sr[0] + R * 0.25, by + bodyH * 0.95];
    }
    if (o.flip) { const m = (p) => [2 * x - p[0], p[1]]; [hl, hr] = [m(hr), m(hl)]; }
    const back = A === "up" || A === "fist" || A === "wave";
    const arms = () => { for (const [s, h] of [[sh, hl], [sr, hr]]) { g.line(s[0], s[1], h[0], h[1], "ink", T + 1); g.ellO(h[0], h[1], R * 0.17, R * 0.17, "fig", "ink", 1); } };
    if (back) arms();
    // jacket with jagged hem, shirt V, safety pin
    const j = o.jacket || "ink";
    g.poly([[x - bw * 0.55, by], [x + bw * 0.55, by], [x + bw * 0.7, by + bodyH], [x + bw * 0.35, by + bodyH - R * 0.18], [x + bw * 0.05, by + bodyH + R * 0.05], [x - bw * 0.3, by + bodyH - R * 0.15], [x - bw * 0.68, by + bodyH]], j);
    g.poly([[x - R * 0.25, by], [x + R * 0.25, by], [x, by + R * 0.65]], o.shirt || "acc");
    if (j === "ink") { g.line(x - bw * 0.35, by + R * 0.4, x - bw * 0.15, by + R * 0.3, "hi", 1); g.px(x - bw * 0.35, by + R * 0.42, "hi"); }
    // head
    head(g, hx, hy, R, { ...o, t });
    if (o.cap) studentCap(g, hx - R * 0.05, hy - R * 0.85, R * 2.1, o.capTilt || -0.12);
    if (!back) arms();
    return { hx, hy, R, hl, hr, by, bodyH };
  }

  // Icelandic white student cap
  function studentCap(g, x, y, w, tilt = 0) {
    const h = w * 0.3, sk = tilt * w;
    g.poly([[x - w * 0.55 + sk, y - h], [x + w * 0.55 + sk, y - h - sk * 0.5], [x + w * 0.48, y], [x - w * 0.48, y]], "ink", false);
    g.poly([[x - w * 0.52 + sk, y - h + 1], [x + w * 0.52 + sk, y - h + 1 - sk * 0.5], [x + w * 0.45, y - 1], [x - w * 0.45, y - 1]], "hi");
    g.rect(x - w * 0.48, y - h * 0.35, w * 0.96, h * 0.4, "ink");
    g.ell(x + w * 0.2, y + h * 0.2, w * 0.32, h * 0.18, "ink");
    g.rect(x - 1, y - h * 0.3, 3, 2, "acc");
  }

  // ---------- the AI: a spiky one-eyed acid-green creature ----------
  // mood: happy | eager | type | wrong | sheepish | proud
  function ai(g, x, y, o = {}) {
    const R = o.R || 16, t = o.t || 0, mood = o.mood || "happy", T = Math.max(1, Math.round(R / 10));
    const wrong = mood === "wrong";
    const body = wrong ? "acc" : "ai";
    const bob = Math.round(Math.sin(t * 6) * R * 0.08);
    const cy = y - R + bob;
    // stubby arms (typing smear when mood=type)
    const armA = mood === "type" ? Math.sin(t * 50) * R * 0.3 : mood === "proud" ? -R * 0.9 : 0;
    g.line(x - R * 0.9, cy + R * 0.3, x - R * 1.5, cy + R * 0.7 + armA, "ink", T + 1);
    g.line(x + R * 0.9, cy + R * 0.3, x + R * 1.5, cy + R * 0.7 - armA, "ink", T + 1);
    g.ellO(x - R * 1.5, cy + R * 0.7 + armA, R * 0.18, R * 0.18, body, "ink", 1);
    g.ellO(x + R * 1.5, cy + R * 0.7 - armA, R * 0.18, R * 0.18, body, "ink", 1);
    // spiky body
    g.burst(x, cy, R * 1.0, R * 1.35, 9, "ink", t * 0.3);
    g.burst(x, cy, R * 0.9, R * 1.18, 9, body, t * 0.3);
    g.ell(x, cy, R * 0.95, R * 0.9, body, 9);
    // antenna: a cursor arrow
    g.line(x + R * 0.2, cy - R * 0.9, x + R * 0.45, cy - R * 1.6, "ink", T);
    g.poly([[x + R * 0.4, cy - R * 2.1], [x + R * 0.4, cy - R * 1.45], [x + R * 0.58, cy - R * 1.6], [x + R * 0.75, cy - R * 1.35], [x + R * 0.85, cy - R * 1.42], [x + R * 0.7, cy - R * 1.68], [x + R * 0.9, cy - R * 1.75]], "hi");
    // the eye
    const ex = x - R * 0.05, ey = cy - R * 0.25, er = R * 0.5;
    if (mood === "happy" || mood === "proud") g.arc(ex, ey + er * 0.4, er, er * 0.8, PI * 1.1, PI * 1.9, "ink", T + 1);
    else {
      g.ellO(ex, ey, er, er * 1.05, "hi", "ink", T);
      if (wrong) { for (let k = 0; k < 3; k++) g.arc(ex, ey, er * (0.25 + k * 0.22), er * (0.25 + k * 0.22), t * 8 + k, t * 8 + k + PI * 1.4, "ink", 1); }
      else { const lk = mood === "sheepish" ? -er * 0.45 : (o.look || 0) * er * 0.4; g.rect(ex + lk - Math.max(1, er * 0.12), ey - er * 0.7, Math.max(2, er * 0.25), er * 1.4, "ink"); }
    }
    // mouth full of little teeth
    const my = cy + R * 0.42, mw = mood === "sheepish" ? R * 0.3 : R * 0.62;
    g.poly([[x - mw, my - R * 0.05], [x + mw, my - R * 0.12], [x + mw * 0.7, my + R * 0.25], [x - mw * 0.7, my + R * 0.28]], "ink");
    const n = Math.max(3, Math.round(mw / 2));
    for (let i = 0; i < n; i++) { const a = x - mw * 0.85 + (mw * 1.7 * i) / n, b = a + (mw * 1.7) / n; g.poly([[a, my - R * 0.06], [b, my - R * 0.08], [(a + b) / 2, my + R * 0.1]], "hi", false); }
    if (mood === "sheepish") { g.ellO(x + R * 1.2, cy - R * 0.6, R * 0.12, R * 0.18, "hi", "ink", 1); }
    return { x, y: cy, R };
  }

  // teachers: full hair + full beard, friendlier (no fangs)
  const teacherA = (g, x, y, o = {}) => person(g, x, y, { R: 18, hair: "long", hairC: "ink", beard: true, fangs: false, ring: false, shirt: "hi", id: 3, ...o });
  const teacherB = (g, x, y, o = {}) => person(g, x, y, { R: 18, hair: "curly", hairC: "ink", beard: true, glasses: true, fangs: false, ring: false, shirt: "acc", id: 4, ...o });
  const hero = (g, x, y, o = {}) => person(g, x, y, { R: 18, hair: "spikes", id: 1, ...o });

  // ---------- props ----------
  function laptop(g, x, y, w = 30, h = 18, screen = "hi") { g.poly([[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2 - 2, y - 3], [x - w / 2 + 2, y - 3]], "ink"); g.rect(x - w / 2 + 3, y - h + 3, w - 6, h - 8, screen); g.rect(x - w / 2 - 5, y - 3, w + 10, 3, "ink"); }
  function megaphone(g, x, y, s = 1, dir = 1) { g.poly([[x, y - 3 * s], [x + dir * 16 * s, y - 9 * s], [x + dir * 16 * s, y + 9 * s], [x, y + 3 * s]], "hi"); g.rect(x - dir * 4 * s - (dir < 0 ? 0 : 0), y - 3 * s, 4 * s, 6 * s, "ink"); g.line(x + dir * 16 * s, y - 9 * s, x + dir * 16 * s, y + 9 * s, "ink", 2); }
  function lens(g, x, y, r, inner) { g.ellO(x, y, r, r, "hi", "ink", 2); if (inner) inner(); g.line(x - r * 0.7, y + r * 0.7, x - r * 1.6, y + r * 1.6, "ink", Math.max(2, r * 0.25)); }
  function block(g, x, y, w, h, c, out = "ink") { g.rect(x - 1, y - 1, w + 2, h + 2, out); g.rect(x, y, w, h, c); }

  window.CAST3 = { person, hero, teacherA, teacherB, ai, head, face, studentCap, laptop, megaphone, lens, block };
})();
