// Neo-punk expressive pixel engine. 320x180 canvas shown at 6x (1920x1080).
// Colours are drawn by ROLE (bg, fig, ink, acc, hi, ai) so a scene can swap its whole palette in one frame
// (flash frames, inversions, silhouettes). Shapes are drawn slightly rough and "boil" between drawings.
(function () {
  const PAL = {
    black: "#000000",
    cream: "#F3E4C6",
    orange: "#FF5A1F",
    red: "#C8102E",
    blue: "#1E3CFF",
    green: "#A8FF1A",
  };
  const W = 320, H = 180;
  // Jersey 15 lands on its own pixel grid at 22px (every R keeps its leg, Ð/Þ/Á stay clear);
  // bigger text is a whole-number multiple of that.
  const FONT = "Jersey 15";
  const mapScale = (s) => Math.max(1, Math.round(s * 0.5));
  const rnd = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  class G {
    constructor(canvas) {
      this.cv = canvas;
      this.x = canvas.getContext("2d", { willReadFrequently: true });
      this.x.imageSmoothingEnabled = false;
      this.W = canvas.width; this.H = canvas.height;
      this.roles = { bg: "orange", fig: "cream", ink: "black", acc: "red", hi: "cream", ai: "green" };
      this.seed = 0;      // boil seed: changes 8x per second
      this.rough = 1;     // 0 = clean shapes, 1 = hand-drawn wobble
      this._txt = new Map();
    }
    col(c) { let r = this.roles[c]; if (r && !PAL[r] && this.roles[r]) r = this.roles[r]; return PAL[r] || PAL[c] || r || c; }
    // draw fn(layer) with a 1px rim around everything it painted (pale figures on black)
    rim(fn, color = "cream", r = 1) {
      this._L = this._L || [0, 1].map(() => { const c = document.createElement("canvas"); c.width = this.W; c.height = this.H; const l = new G(c); l._txt = this._txt; return l; });
      const [L, T] = this._L;
      L.x.clearRect(0, 0, this.W, this.H); T.x.clearRect(0, 0, this.W, this.H);
      L.roles = this.roles; L.seed = this.seed; L.rough = this.rough;
      const ret = fn(L);
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx || dy) T.x.drawImage(L.cv, dx, dy);
      T.x.globalCompositeOperation = "source-in"; T.x.fillStyle = this.col(color); T.x.fillRect(0, 0, this.W, this.H); T.x.globalCompositeOperation = "source-over";
      this.x.drawImage(T.cv, 0, 0); this.x.drawImage(L.cv, 0, 0);
      return ret;
    }
    j(i) { return this.rough ? Math.round((rnd(i * 13.7 + this.seed * 7.3) - 0.5) * 1.6 * this.rough) : 0; }
    clear(c = "bg") { this.rect(0, 0, this.W, this.H, c); }
    rect(x, y, w, h, c) { if (w <= 0 || h <= 0) return; this.x.fillStyle = this.col(c); this.x.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
    px(x, y, c) { this.rect(x, y, 1, 1, c); }
    // rough filled ellipse (spans jitter by a pixel: irregular outline)
    ell(cx, cy, rx, ry, c, k = 0) {
      cx = Math.round(cx); cy = Math.round(cy); rx = Math.max(0, Math.round(rx)); ry = Math.max(0, Math.round(ry));
      for (let dy = -ry; dy <= ry; dy++) {
        const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / ((ry + 0.5) * (ry + 0.5)))));
        const a = Math.abs(dy) > ry - 2 ? 0 : this.j(dy + k * 31), b = Math.abs(dy) > ry - 2 ? 0 : this.j(dy * 3 + 7 + k * 31);
        this.rect(cx - w + a, cy + dy, 2 * w + 1 - a + b, 1, c);
      }
    }
    ellO(cx, cy, rx, ry, fill, out = "ink", t = 1, k = 0) { this.ell(cx, cy, rx + t, ry + t, out, k); this.ell(cx, cy, rx, ry, fill, k + 1); }
    disc(cx, cy, r, c) { this.ell(cx, cy, r, r, c); }
    line(x0, y0, x1, y1, c, w = 1) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy; const o = Math.floor(w / 2);
      for (;;) { this.rect(x0 - o, y0 - o, w, w, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
    }
    poly(pts, c, rough = true) {
      if (rough && this.rough) pts = pts.map(([x, y], i) => [x + this.j(i * 5 + 1) * 0.8, y + this.j(i * 5 + 2) * 0.8]);
      let minY = Infinity, maxY = -Infinity;
      for (const [, y] of pts) { minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
      for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
        const yc = y + 0.5, xs = [];
        for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax)); }
        xs.sort((a, b) => a - b);
        for (let i = 0; i + 1 < xs.length; i += 2) this.rect(Math.round(xs[i]), y, Math.round(xs[i + 1]) - Math.round(xs[i]), 1, c);
      }
    }
    polyO(pts, fill, out = "ink", t = 1) {
      // outline = same polygon pushed out from its centroid
      const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
      const grow = pts.map(([x, y]) => { const d = Math.hypot(x - cx, y - cy) || 1; return [x + ((x - cx) / d) * t, y + ((y - cy) / d) * t]; });
      this.poly(grow, out); this.poly(pts, fill);
    }
    arc(cx, cy, rx, ry, a0, a1, c, w = 1) {
      const n = Math.max(6, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) / 1.2)); let px = null, py = null;
      for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n, x = Math.round(cx + Math.cos(a) * rx), y = Math.round(cy + Math.sin(a) * ry); if (px !== null) this.line(px, py, x, y, c, w); px = x; py = y; }
    }
    // jagged starburst (impact shape)
    burst(cx, cy, r0, r1, n, c, rot = 0) {
      const pts = [];
      for (let i = 0; i < n * 2; i++) { const a = rot + (i / (n * 2)) * Math.PI * 2, r = i % 2 ? r0 : r1 * (0.75 + 0.5 * rnd(i + n)); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
      this.poly(pts, c);
    }
    // radiating impact lines
    speed(cx, cy, r0, r1, n, c, w = 1, seed = 0) {
      for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + rnd(i + seed) * 0.3, rr = r0 + rnd(i * 3 + seed) * 10; this.line(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, c, w); }
    }
    halftone(x, y, w, h, c, step = 3) { for (let j = 0; j < h; j += step) for (let i = ((j / step) % 2) * Math.floor(step / 2); i < w; i += step) this.px(x + i, y + j, c); }
    // very light screen-print grain
    grain(seed, n = 140, c = "ink") { for (let i = 0; i < n; i++) this.px(Math.floor(rnd(seed * 91 + i) * this.W), Math.floor(rnd(seed * 37 + i * 7) * this.H), i % 3 ? c : "hi"); }

    // text, rasterised then thresholded (no anti-aliasing). scale > 1 makes chunky poster letters.
    text(str, x, y, o = {}) {
      const font = o.font || FONT, size = o.font ? o.size || 10 : 22, color = this.col(o.color || "ink"), align = o.align || "left";
      const sc = o.raw ? o.scale || 1 : mapScale(o.scale || 1);
      const key = [str, size, font, color].join("|");
      let spr = this._txt.get(key);
      if (!spr) {
        const off = document.createElement("canvas"), cx = off.getContext("2d", { willReadFrequently: true });
        cx.font = `${size}px "${font}"`;
        const w = Math.ceil(cx.measureText(str).width) + 4, h = Math.ceil(size * 1.4) + 4;
        off.width = w; off.height = h; cx.font = `${size}px "${font}"`; cx.fillStyle = "#000";
        cx.fillText(str, 2, Math.round(size * 1.0) + 2);
        const d = cx.getImageData(0, 0, w, h).data, out = document.createElement("canvas"); out.width = w; out.height = h;
        const ox = out.getContext("2d"), od = ox.createImageData(w, h), rgb = color.match(/\w\w/g).map((v) => parseInt(v, 16));
        let minX = w, maxX = 0;
        for (let i = 0; i < w * h; i++) if (d[i * 4 + 3] > 110) { od.data[i * 4] = rgb[0]; od.data[i * 4 + 1] = rgb[1]; od.data[i * 4 + 2] = rgb[2]; od.data[i * 4 + 3] = 255; const px = i % w; minX = Math.min(minX, px); maxX = Math.max(maxX, px); }
        ox.putImageData(od, 0, 0);
        spr = { cv: out, w: maxX >= minX ? maxX - minX + 1 : 0, x0: minX, h, base: Math.round(size) + 2 };
        this._txt.set(key, spr);
      }
      let dx = Math.round(x) - spr.x0 * sc;
      if (align === "center") dx -= Math.floor((spr.w * sc) / 2); else if (align === "right") dx -= spr.w * sc;
      if (!o.dry) this.x.drawImage(spr.cv, 0, 0, spr.cv.width, spr.cv.height, dx, Math.round(y) - spr.base * sc, spr.cv.width * sc, spr.cv.height * sc);
      return spr.w * sc;
    }
    measure(str, o = {}) { return this.text(str, 0, 0, { ...o, dry: true }); }
    // ransom-note poster word: each letter its own slight offset; shadow block behind
    shout(str, x, y, o = {}) {
      const sc = mapScale(o.scale || 2), gap = o.gap ?? 1;
      const widths = [...str].map((ch) => (ch === " " ? 4 * sc : this.measure(ch, { scale: sc, raw: true })));
      const total = widths.reduce((a, b) => a + b + gap * sc, -gap * sc);
      let cx = o.align === "left" ? x : x - total / 2;
      [...str].forEach((ch, i) => {
        if (ch !== " ") {
          const dy = o.jitter ? Math.round((rnd(i * 3.1 + (o.seed || 0)) - 0.5) * 1.6) : 0;
          if (o.shadow) this.text(ch, cx + sc, y + dy + sc, { scale: sc, raw: true, color: o.shadow });
          this.text(ch, cx, y + dy, { scale: sc, raw: true, color: o.color || "ink" });
        }
        cx += widths[i] + gap * sc;
      });
      return total;
    }
    // text on a solid block
    label(str, x, y, o = {}) {
      const sc = mapScale(o.scale || 1), w = this.measure(str, { scale: sc, raw: true }) + 10 * sc, h = 22 * sc;
      const xx = Math.round(o.align === "center" ? x - w / 2 : o.align === "right" ? x - w : x), yy = Math.round(y - h / 2);
      if (o.shadow !== false) this.rect(xx + 2, yy + 2, w, h, o.shadow || "ink");
      this.rect(xx, yy, w, h, o.fill || "ink");
      this.text(str, xx + w / 2, yy + h - 4 * sc, { scale: sc, raw: true, align: "center", color: o.color || "hi" });
      return { x: xx, y: yy, w, h };
    }
  }

  const E = {
    clamp: (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)),
    seg: (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a))),
    out: (p) => 1 - (1 - p) ** 3,
    inout: (p) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2),
    back: (p) => { const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * (p - 1) ** 3 + c1 * (p - 1) ** 2; },
    lerp: (a, b, p) => a + (b - a) * p,
    rnd,
    // stepped time: animate "on twos/threes"
    step: (t, fps = 12) => Math.floor(t * fps + 1e-6) / fps,
  };

  window.PX = { PAL, W, H, G, E, FONT, mapScale };
})();
