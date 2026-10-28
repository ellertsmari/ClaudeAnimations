// props.js — clay set dressing: islands, sea, buildings, laptops, the Isard server, plaques with
// pressed clay lettering, flags, plane and sun on visible rig wires (it's stop-motion after all).
import { THREE, clay, glossy, glow, rng, shadowAll } from './clay.js';
import { makePuppet } from './puppet.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const FONT = 'Fredoka';

export async function loadFonts(base = '') {
  for (const w of [600, 700]) {
    const f = new FontFace(FONT, `url(${base}assets/fonts/fredoka-${w}.woff2)`, { weight: String(w) });
    document.fonts.add(await f.load());
  }
}

export function mesh(geo, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; }
export const ball = (r, mat, x = 0, y = 0, z = 0, seg = 28) => mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7)), mat, x, y, z);
export const ellip = (rx, ry, rz, mat, x = 0, y = 0, z = 0, seg = 28) => { const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7)); g.scale(rx, ry, rz); return mesh(g, mat, x, y, z); };
export const snake = (pts, r, mat, seg = 32, closed = false) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed), seg, r, 10, closed), mat);

function roundedRect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
// slab of clay: rounded rectangle w × h (in x/y), d deep (z), soft bevel
export function slab(w, h, d, mat, r = Math.min(w, h) * 0.18) {
  const bev = Math.min(d * 0.45, r * 0.6, 0.04);
  const g = new THREE.ExtrudeGeometry(roundedRect(w - bev * 2, h - bev * 2, Math.max(0.001, r - bev)), { depth: Math.max(0.001, d - bev * 2), bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 10 });
  g.translate(0, 0, -(d - bev * 2) / 2);
  return new THREE.Mesh(g, mat);
}

// ---------- canvas lettering ----------
const texCache = new Map();
/** text drawn for a plaque face: returns { map, bump } */
export function letterTex(lines, { w = 1024, h = 512, ink = '#2b2118', bg = '#f2e6cf', weight = 700, size = null, align = 'center', pad = 0.08 } = {}) {
  const key = JSON.stringify([lines, w, h, ink, bg, weight, size, align]);
  if (texCache.has(key)) return texCache.get(key);
  lines = [].concat(lines);
  const mk = (fill, back) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.fillStyle = back; g.fillRect(0, 0, w, h);
    let fs = size || h * 0.8 / lines.length;
    g.font = `${weight} ${fs}px ${FONT}`;
    const maxW = Math.max(...lines.map((l) => g.measureText(l).width));
    if (maxW > w * (1 - pad * 2)) fs *= (w * (1 - pad * 2)) / maxW;
    g.font = `${weight} ${fs}px ${FONT}`;
    g.textAlign = align; g.textBaseline = 'middle';
    g.lineJoin = 'round';
    const lh = fs * 1.12, y0 = h / 2 - (lh * (lines.length - 1)) / 2;
    lines.forEach((l, i) => {
      const x = align === 'center' ? w / 2 : w * pad;
      if (fill === '#ffffff') { g.strokeStyle = '#bbbbbb'; g.lineWidth = fs * 0.08; g.strokeText(l, x, y0 + i * lh); }
      g.fillStyle = fill; g.fillText(l, x, y0 + i * lh);
    });
    return c;
  };
  const map = new THREE.CanvasTexture(mk(ink, bg)); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
  const bump = new THREE.CanvasTexture(mk('#ffffff', '#000000'));
  const out = { map, bump };
  texCache.set(key, out);
  return out;
}

/** a clay plaque with raised lettering; faces +z */
export function plaque(lines, { w = 1.6, h = 0.5, d = 0.08, color = '#f2e6cf', ink = '#2b2118', weight = 700, size = null, edge = null } = {}) {
  const g = new THREE.Group();
  const base = slab(w, h, d, clay(edge || color, { lump: 0.35, boil: 0.5 }));
  g.add(base);
  const tx = letterTex(lines, { w: 1024, h: Math.round(1024 * h / w), ink, bg: color, weight, size });
  const faceMat = new THREE.MeshPhysicalMaterial({ map: tx.map, bumpMap: tx.bump, bumpScale: 6, roughness: 0.8, sheen: 0.3, sheenColor: new THREE.Color(color),
    polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  // sits clear of the slab so the clay's lumps and boil never poke through the lettering
  const face = mesh(new THREE.PlaneGeometry(w * 0.9, h * 0.84), faceMat, 0, 0, d / 2 + 0.008);
  face.castShadow = false;
  g.add(face);
  return shadowAll(g);
}

// ---------- land and sea ----------
function smoothOutline(pts, n = 120) {
  const c = new THREE.CatmullRomCurve3(pts.map(([x, y]) => V(x, y, 0)), true, 'centripetal');
  return c.getSpacedPoints(n).slice(0, -1).map((p) => new THREE.Vector2(p.x, p.y));
}
export const OUTLINES = {
  iceland: [[-1.0, 0.5], [-0.82, 0.78], [-0.6, 0.62], [-0.66, 0.42], [-0.42, 0.42], [-0.18, 0.66], [0.1, 0.56], [0.36, 0.72], [0.62, 0.62], [0.88, 0.44], [1.0, 0.16], [0.94, -0.08], [0.74, -0.3], [0.42, -0.46], [0.08, -0.56], [-0.24, -0.5], [-0.5, -0.36], [-0.8, -0.34], [-0.68, -0.14], [-0.92, 0.0], [-0.74, 0.16], [-0.98, 0.3]],
  granCanaria: [[0, 0.95], [0.55, 0.8], [0.92, 0.35], [0.95, -0.2], [0.62, -0.75], [0.05, -0.98], [-0.55, -0.8], [-0.92, -0.32], [-0.9, 0.3], [-0.5, 0.78]],
  denmark: [[-0.5, 1.0], [-0.2, 1.05], [0.0, 0.7], [-0.05, 0.3], [0.15, 0.05], [0.05, -0.4], [-0.1, -0.8], [-0.55, -0.85], [-0.7, -0.4], [-0.62, 0.2], [-0.75, 0.6]],
};

/** extruded clay island lying on the table; outline in units of `size` */
export function island(name, { size = 1, height = 0.16, color = '#7d9a5a', beach = '#d9c08a', seed = 1 } = {}) {
  const g = new THREE.Group();
  const pts = smoothOutline(OUTLINES[name].map(([x, y]) => [x * size, y * size]));
  const mk = (scale, h, mat, y0) => {
    const sh = new THREE.Shape(pts.map((p) => p.clone().multiplyScalar(scale)));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.06 * size, bevelSegments: 5, curveSegments: 24 });
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, mat); m.position.y = y0;
    return m;
  };
  g.add(mk(1.0, height * 0.45, clay(beach, { lump: 1.2 }), 0));
  g.add(mk(0.9, height, clay(color, { lump: 1.6 }), 0.01));
  return shadowAll(g);
}

export function waveTex() {
  if (texCache.has('waves')) return texCache.get('waves');
  const c = document.createElement('canvas'); c.width = 1024; c.height = 1024;
  const g = c.getContext('2d'); const r = rng(4);
  g.fillStyle = '#808080'; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 140; i++) {
    const x = r() * 1024, y = r() * 1024, L = 40 + r() * 90;
    g.strokeStyle = `rgba(230,230,230,${0.4 + r() * 0.4})`; g.lineWidth = 3 + r() * 4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + L / 2, y - 14, x + L, y); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3);
  texCache.set('waves', t);
  return t;
}
export function sea(w = 14, d = 8, color = '#3d7fb4') {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d, 120, 70), clay(color, { lump: 2.4, bumpTex: waveTex(), bump: 2.5, rough: 0.75, boil: 2 }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.035; // clear of the table even where the clay dips
  m.receiveShadow = true;
  return m;
}

export function cone(r, h, mat, seg = 28) { const g = new THREE.ConeGeometry(r, h, seg, 6); return mesh(g, mat); }
export function mountain(r, h, { color = '#6d6a62', snow = '#f4f2ec', snowLine = 0.55 } = {}) {
  const g = new THREE.Group();
  const prof = [[0, 0], [r, 0], [r * 0.8, h * 0.25], [r * 0.45, h * 0.7], [r * 0.12, h * 0.98], [0, h]].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 24), clay(color, { lump: 2.2 })));
  if (snow) {
    const sp = prof.filter((p) => p.y >= h * snowLine).map((p) => new THREE.Vector2(p.x * 1.05 + 0.005, p.y + 0.005));
    sp.unshift(new THREE.Vector2(sp[0].x * 1.02, sp[0].y - 0.02));
    g.add(new THREE.Mesh(new THREE.LatheGeometry(sp, 24), clay(snow, { lump: 1.6 })));
  }
  return shadowAll(g);
}

export function house({ wall = '#e9e2d2', roof = '#b8443a', s = 0.25 } = {}) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(s, s * 0.8, s * 0.8), clay(wall, { lump: 0.8 }), 0, s * 0.4, 0));
  const rf = mesh(new THREE.ConeGeometry(s * 0.78, s * 0.5, 4), clay(roof, { lump: 0.8 }), 0, s * 1.05, 0);
  rf.rotation.y = Math.PI / 4; rf.scale.z = 0.85; g.add(rf);
  g.add(mesh(new THREE.BoxGeometry(s * 0.2, s * 0.22, 0.01), glow('#ffd58a', 1.4), 0, s * 0.45, s * 0.405));
  return shadowAll(g);
}

export function palm(h = 0.6, seed = 1) {
  const g = new THREE.Group(); const r = rng(seed);
  const lean = (r() - 0.5) * 0.25;
  const pts = [V(0, 0, 0), V(lean * h * 0.4, h * 0.5, 0), V(lean * h, h, 0)];
  g.add(snake(pts, h * 0.035, clay('#8a6440', { lump: 1.5 }), 16));
  const top = pts[2];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + r();
    const leaf = new THREE.Group(); leaf.position.copy(top); leaf.rotation.y = a;
    const lp = [V(0, 0, 0), V(h * 0.18, h * 0.06, 0), V(h * 0.34, -h * 0.05, 0), V(h * 0.42, -h * 0.16, 0)];
    const l = snake(lp, h * 0.028, clay('#4f8a3a', { lump: 1 }), 12); l.scale.z = 2.4;
    leaf.add(l); g.add(leaf);
  }
  g.add(ball(h * 0.04, clay('#6b4a2a'), top.x, top.y - h * 0.03, 0.02, 12));
  return shadowAll(g);
}

// a rig rod: thin steel wire from the table (or from above) to the object — left visible on purpose
export function rod(from, to, r = 0.006) {
  const d = to.clone().sub(from), L = d.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 6), glossy('#9aa0a6', { metalness: 0.9, roughness: 0.3 }));
  m.position.copy(from).add(to).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  m.castShadow = true;
  return m;
}

// a rod that can be re-aimed every pose without allocating new geometry
export function liveRod(r = 0.004) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 6), glossy('#9aa0a6', { metalness: 0.9, roughness: 0.3 }));
  m.castShadow = true;
  m.set = (from, to) => {
    const d = to.clone().sub(from), L = Math.max(1e-4, d.length());
    m.position.copy(from).add(to).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
    m.scale.set(1, L, 1);
    return m;
  };
  return m;
}
// empty a group, freeing the geometry of what was in it (for things rebuilt per pose)
export function refill(group, ...objs) {
  group.traverse((o) => { if (o.isMesh && o.geometry && !o.userData.keepGeo) o.geometry.dispose(); });
  group.clear();
  objs.forEach((o) => group.add(o));
  return group;
}

export function sun(r = 0.28, { face = true } = {}) {
  const g = new THREE.Group();
  const m = clay('#ffc23a', { lump: 1 });
  g.add(ball(r, m, 0, 0, 0, 32));
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const c = mesh(new THREE.ConeGeometry(r * 0.16, r * 0.5, 10), m, Math.cos(a) * r * 1.2, Math.sin(a) * r * 1.2, 0);
    c.rotation.z = a - Math.PI / 2; g.add(c);
  }
  if (face) {
    for (const s of [-1, 1]) g.add(ball(r * 0.1, glossy('#2b1a10'), s * r * 0.35, r * 0.15, r * 0.92, 12));
    g.add(snake([V(-r * 0.4, -r * 0.2, r * 0.9), V(0, -r * 0.45, r * 0.95), V(r * 0.4, -r * 0.2, r * 0.9)], r * 0.05, glossy('#8a3a1a'), 12));
  }
  const glasses = new THREE.Group(); // shades, put on later
  const gm = glossy('#111111', { roughness: 0.15 });
  for (const s of [-1, 1]) { const l = ellip(r * 0.28, r * 0.18, r * 0.05, gm, s * r * 0.35, r * 0.15, r * 0.98, 16); glasses.add(l); }
  glasses.add(mesh(new THREE.BoxGeometry(r * 0.25, r * 0.05, r * 0.04), gm, 0, r * 0.2, r * 1.0));
  glasses.visible = false; g.add(glasses);
  g.userData.shades = glasses;
  return shadowAll(g);
}
export function moon(r = 0.18) {
  const g = new THREE.Group();
  g.add(ball(r, clay('#ece6cf', { lump: 1.6 }), 0, 0, 0, 28));
  const cm = clay('#cfc6a8', { lump: 0.8 });
  [[0.3, 0.2, 0.25], [-0.35, -0.1, 0.18], [0.05, -0.4, 0.2]].forEach(([x, y, s]) => g.add(ellip(r * s, r * s, r * 0.1, cm, x * r, y * r, r * 0.92, 14)));
  return shadowAll(g);
}
export function star(r = 0.06, color = '#ffe9a3') {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + Math.PI / 2, rr = i % 2 ? r * 0.45 : r; i ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  const g = new THREE.ExtrudeGeometry(s, { depth: r * 0.3, bevelEnabled: true, bevelSize: r * 0.12, bevelThickness: r * 0.12, bevelSegments: 3 });
  return shadowAll(new THREE.Group().add(new THREE.Mesh(g, clay(color, { lump: 0.5 }))));
}
export function cloud(s = 0.3, seed = 1) {
  const g = new THREE.Group(); const r = rng(seed); const m = clay('#f6f3ee', { lump: 1.2 });
  for (let i = 0; i < 6; i++) g.add(ball(s * (0.3 + r() * 0.25), m, (i - 2.5) * s * 0.3, r() * s * 0.2, (r() - 0.5) * s * 0.2, 18));
  return shadowAll(g);
}

export function plane(color = '#f3efe6', stripe = '#2f6fb0') {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.42, 8, 16), clay(color, { lump: 0.6 }));
  body.rotation.z = Math.PI / 2; g.add(body);
  const wm = clay(stripe, { lump: 0.6 });
  g.add(mesh(new THREE.BoxGeometry(0.16, 0.02, 0.62), wm, 0.02, -0.01, 0));
  g.add(mesh(new THREE.BoxGeometry(0.08, 0.13, 0.02), wm, -0.26, 0.08, 0));
  g.add(mesh(new THREE.BoxGeometry(0.07, 0.015, 0.22), wm, -0.26, 0.02, 0));
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) g.add(ball(0.014, glossy('#2a3a52'), 0.14 - i * 0.07, 0.03, s * 0.066, 8));
  g.add(ball(0.03, glossy('#2a3a52'), 0.27, 0.02, 0, 10));
  return shadowAll(g);
}

export function boat(color = '#c8562a') {
  const g = new THREE.Group();
  const hull = ellip(0.28, 0.08, 0.11, clay(color, { lump: 0.8 }), 0, 0.03, 0); hull.scale.y = 0.6; g.add(hull);
  g.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.4, 6), clay('#6b4a2a'), 0, 0.22, 0));
  const sail = new THREE.Shape(); sail.moveTo(0, 0); sail.lineTo(0.2, 0); sail.lineTo(0, 0.32); sail.closePath();
  const sm = new THREE.Mesh(new THREE.ExtrudeGeometry(sail, { depth: 0.01, bevelEnabled: false }), clay('#f4efe4', { lump: 0.4, side: THREE.DoubleSide }));
  sm.position.set(0.01, 0.06, 0); g.add(sm);
  return shadowAll(g);
}

// ---------- flags ----------
export function flagTex(kind) {
  if (texCache.has('flag' + kind)) return texCache.get('flag' + kind);
  const c = document.createElement('canvas'); c.width = kind === 'eu' ? 720 : 180; c.height = kind === 'eu' ? 512 : 128; const g = c.getContext('2d');
  if (kind === 'eu') g.scale(4, 4);
  if (kind === 'is') { g.fillStyle = '#02529c'; g.fillRect(0, 0, 180, 128); g.fillStyle = '#fff'; g.fillRect(50, 0, 32, 128); g.fillRect(0, 48, 180, 32); g.fillStyle = '#dc1e35'; g.fillRect(58, 0, 16, 128); g.fillRect(0, 56, 180, 16); }
  if (kind === 'dk') { g.fillStyle = '#c8102e'; g.fillRect(0, 0, 180, 128); g.fillStyle = '#fff'; g.fillRect(52, 0, 20, 128); g.fillRect(0, 54, 180, 20); }
  if (kind === 'es') { g.fillStyle = '#aa151b'; g.fillRect(0, 0, 180, 128); g.fillStyle = '#f1bf00'; g.fillRect(0, 32, 180, 64); }
  if (kind === 'eu') { // twelve five-pointed gold stars in a circle on reflex blue
    g.fillStyle = '#003399'; g.fillRect(0, 0, 180, 128); g.fillStyle = '#ffcc00';
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2, cx = 90 + Math.cos(a) * 40, cy = 64 + Math.sin(a) * 40;
      g.beginPath();
      for (let k = 0; k < 10; k++) { const b = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 2.6 : 6.4; k ? g.lineTo(cx + Math.cos(b) * r, cy + Math.sin(b) * r) : g.moveTo(cx + Math.cos(b) * r, cy + Math.sin(b) * r); }
      g.closePath(); g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  texCache.set('flag' + kind, t);
  return t;
}
export function flag(kind, h = 0.4) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, h, 8), clay('#e8d6b0', { lump: 0.3 }), 0, h / 2, 0));
  const geo = new THREE.PlaneGeometry(h * 0.45, h * 0.32, 12, 4);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin((p.getX(i) + h * 0.22) * 18) * 0.012);
  geo.computeVertexNormals();
  const f = mesh(geo, new THREE.MeshPhysicalMaterial({ map: flagTex(kind), roughness: 0.85, side: THREE.DoubleSide, sheen: 0.3 }), h * 0.23, h * 0.82, 0);
  g.add(f); g.userData.cloth = f;
  return shadowAll(g);
}

// ---------- furniture & tech ----------
export function desk(w = 1.4, d = 0.7, h = 0.55, top = '#c99a62') {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(w, 0.05, d), clay(top, { lump: 0.5 }), 0, h, 0));
  const lm = clay('#5a5f66', { lump: 0.3 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, h, 8), lm, sx * (w / 2 - 0.06), h / 2, sz * (d / 2 - 0.06)));
  return shadowAll(g);
}

/** code-ish screen; draw(g, w, h, t) can repaint it per pose */
export function screenTex(draw, w = 512, h = 320) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const api = { tex, canvas: c, paint: (t) => { draw(c.getContext('2d'), w, h, t); tex.needsUpdate = true; } };
  api.paint(0);
  return api;
}
export function codeScreen(seed = 1, accent = '#7ee0a1') {
  const r = rng(seed);
  const lines = Array.from({ length: 14 }, () => ({ ind: (r() * 4 | 0) * 18, segs: Array.from({ length: 1 + (r() * 4 | 0) }, () => ({ w: 20 + r() * 80, c: ['#7ab8ff', '#ffcf6b', accent, '#ff8fa3', '#d6d0c4'][r() * 5 | 0] })) }));
  return screenTex((g, w, h, t) => {
    g.fillStyle = '#1e2230'; g.fillRect(0, 0, w, h);
    const n = Math.min(lines.length, Math.floor(t * 3) + 3);
    lines.slice(0, n).forEach((l, i) => { let x = 24 + l.ind; l.segs.forEach((s) => { g.fillStyle = s.c; g.fillRect(x, 20 + i * 21, s.w, 10); x += s.w + 10; }); });
  });
}
export function laptop(scr, { color = '#4a4f57', w = 0.42 } = {}) {
  const g = new THREE.Group();
  const m = clay(color, { lump: 0.4 });
  g.add(mesh(new THREE.BoxGeometry(w, 0.025, w * 0.68), m, 0, 0.0125, 0));
  g.add(mesh(new THREE.BoxGeometry(w * 0.86, 0.004, w * 0.32), clay('#2f3338', { lump: 0.2 }), 0, 0.027, w * 0.08));
  const lid = new THREE.Group(); lid.position.set(0, 0.02, -w * 0.33); lid.rotation.x = -0.25;
  lid.add(mesh(new THREE.BoxGeometry(w, w * 0.64, 0.02), m, 0, w * 0.32, 0));
  if (scr) lid.add(mesh(new THREE.PlaneGeometry(w * 0.9, w * 0.56), glow('#ffffff', 1.0, scr.tex), 0, w * 0.33, 0.011));
  g.add(lid); g.userData.lid = lid;
  return shadowAll(g);
}

export function whiteboard(scr, w = 1.6, h = 0.9) {
  const g = new THREE.Group();
  g.add(slab(w + 0.06, h + 0.06, 0.04, clay('#9aa0a6', { lump: 0.3 }), 0.02));
  g.add(mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshPhysicalMaterial({ map: scr.tex, roughness: 0.35, clearcoat: 0.4 }), 0, 0, 0.022));
  g.add(mesh(new THREE.BoxGeometry(w * 0.6, 0.03, 0.06), clay('#9aa0a6', { lump: 0.3 }), 0, -h / 2 - 0.02, 0.04));
  for (const [x, c] of [[-0.15, '#2b55c8'], [0, '#c8342b'], [0.12, '#2b2b2b']]) {
    const mk = mesh(new THREE.CapsuleGeometry(0.012, 0.08, 4, 8), clay(c, { lump: 0.3 }), x, -h / 2 - 0.0, 0.05); mk.rotation.z = Math.PI / 2; g.add(mk);
  }
  return shadowAll(g);
}

export function server() {
  const g = new THREE.Group();
  const body = slab(0.42, 0.9, 0.5, clay('#3a3d44', { lump: 0.5 }), 0.04); body.position.y = 0.45; g.add(body);
  const pm = clay('#2a2c31', { lump: 0.3 });
  for (let i = 0; i < 5; i++) g.add(mesh(new THREE.BoxGeometry(0.34, 0.1, 0.02), pm, 0, 0.18 + i * 0.13, 0.25));
  const leds = [];
  for (let i = 0; i < 5; i++) for (let k = 0; k < 2; k++) {
    const led = ball(0.012, glow('#3cff7a', 1.6), 0.12 + k * 0.035, 0.18 + i * 0.13, 0.265, 8);
    g.add(led); leds.push(led);
  }
  const tag = plaque('isard', { w: 0.3, h: 0.1, d: 0.025, color: '#e9e1cf', ink: '#2b2118' });
  tag.position.set(0, 0.84, 0.26); g.add(tag);
  g.userData.leds = leds;
  return shadowAll(g);
}

export function conveyor(L = 2.2) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(L, 0.06, 0.34), clay('#5c6168', { lump: 0.3 }), 0, 0.22, 0));
  const beltTex = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 32; const x = c.getContext('2d'); x.fillStyle = '#2b2d31'; x.fillRect(0, 0, 256, 32); x.fillStyle = '#3c3f45'; for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 14, 32); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(L * 3, 1); return t; })();
  const belt = mesh(new THREE.PlaneGeometry(L, 0.3), new THREE.MeshStandardMaterial({ map: beltTex, roughness: 0.9 }), 0, 0.252, 0);
  belt.rotation.x = -Math.PI / 2; g.add(belt);
  const rm = clay('#8c9196', { lump: 0.2 });
  for (let i = 0; i < 7; i++) { const r = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.36, 12), rm, -L / 2 + (i + 0.5) * L / 7, 0.19, 0); r.rotation.x = Math.PI / 2; g.add(r); }
  for (const sx of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(0.05, 0.2, 0.3), rm, sx * (L / 2 - 0.1), 0.1, 0));
  g.userData.belt = beltTex;
  return shadowAll(g);
}
export function parcel(label = 'main', color = '#c9965a') {
  const g = new THREE.Group();
  const b = slab(0.3, 0.22, 0.24, clay(color, { lump: 0.6 }), 0.03); b.position.y = 0.11; g.add(b);
  g.add(mesh(new THREE.BoxGeometry(0.31, 0.03, 0.05), clay('#e9dcc0', { lump: 0.3 }), 0, 0.22, 0));
  const p = plaque(label, { w: 0.22, h: 0.09, d: 0.015, color: '#f4ecd9' }); p.position.set(0, 0.11, 0.125); g.add(p);
  return shadowAll(g);
}

export function paper(seed = 1, color = '#f6f2ea') {
  const c = document.createElement('canvas'); c.width = 128; c.height = 170; const x = c.getContext('2d'); const r = rng(seed);
  x.fillStyle = color; x.fillRect(0, 0, 128, 170); x.fillStyle = '#9aa3b5';
  for (let i = 0; i < 9; i++) x.fillRect(14, 20 + i * 15, 40 + r() * 60, 5);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const g = new THREE.PlaneGeometry(0.22, 0.29, 6, 6);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 9 + seed) * 0.012);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, side: THREE.DoubleSide }));
  m.castShadow = true;
  return m;
}
export function bubble(text, { color = '#ffffff', ink = '#2b2118', w = 0.6, h = 0.26 } = {}) {
  const g = new THREE.Group();
  g.add(plaque(text, { w, h, d: 0.06, color, ink }));
  const tail = mesh(new THREE.ConeGeometry(0.05, 0.12, 10), clay(color, { lump: 0.5 }), -w * 0.25, -h / 2 - 0.04, 0); tail.rotation.z = 0.5; g.add(tail);
  return shadowAll(g);
}
export function folder(color = '#e0b440') {
  const g = new THREE.Group();
  g.add(slab(0.36, 0.26, 0.04, clay(color, { lump: 0.6 }), 0.03));
  const tab = slab(0.14, 0.06, 0.04, clay(color, { lump: 0.6 }), 0.02); tab.position.set(-0.1, 0.15, 0); g.add(tab);
  return shadowAll(g);
}
export function mug(color = '#f2ede2') {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.1, 18), clay(color, { lump: 0.5 }), 0, 0.05, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.043, 0.043, 0.01, 18), clay('#7a4a2a', { lump: 0.2 }), 0, 0.096, 0));
  const h = mesh(new THREE.TorusGeometry(0.03, 0.01, 8, 16), clay(color, { lump: 0.5 }), 0.055, 0.05, 0); g.add(h);
  return shadowAll(g);
}
export function gradCap(color = '#1d1d22') {
  const g = new THREE.Group();
  const m = clay(color, { lump: 0.4 });
  g.add(mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.08, 16), m, 0, 0.04, 0));
  const top = mesh(new THREE.BoxGeometry(0.3, 0.02, 0.3), m, 0, 0.09, 0); top.rotation.y = Math.PI / 4; g.add(top);
  g.add(snake([V(0, 0.1, 0), V(0.1, 0.1, 0.02), V(0.14, 0.02, 0.03)], 0.006, clay('#e8b830', { lump: 0.2 }), 8));
  return shadowAll(g);
}
export function sdgWheel(r = 0.5) {
  const cols = ['#e5243b', '#dda63a', '#4c9f38', '#c5192d', '#ff3a21', '#26bde2', '#fcc30b', '#a21942', '#fd6925', '#dd1367', '#fd9d24', '#bf8b2e', '#3f7e44', '#0a97d9', '#56c02b', '#00689d', '#19486a'];
  const g = new THREE.Group();
  cols.forEach((c, i) => {
    const seg = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.16, 10, 8, (Math.PI * 2) / 17 * 0.92), clay(c, { lump: 0.6 }));
    seg.rotation.z = (i / 17) * Math.PI * 2; g.add(seg);
  });
  return shadowAll(g);
}

// ---------- students ----------
const SKINS = ['#f1c5a8', '#e0a985', '#c98b62', '#8d5a3b', '#eab79a', '#d9a07c'];
const HAIRS = [['short', '#2a1d16'], ['long', '#4a2e1c'], ['curly', '#1c1512'], ['fade', '#3b2a20'], ['updo', '#c99b5a'], ['long', '#b8743e'], ['short', '#d9b88a'], ['messy', '#5a3a22']];
export function student(i, team = '#2f6fb0') {
  const r = rng(500 + i * 17);
  const [style, color] = HAIRS[(i * 3 + 1) % HAIRS.length];
  const p = makePuppet({
    id: 'st' + i + team, seed: 600 + i, skin: SKINS[(i * 5) % SKINS.length], headR: 0.24,
    hair: { style, color }, shirt: { color: team }, trousers: ['#2b3240', '#3a4a68', '#2e2f33'][i % 3],
    glasses: r() < 0.3 ? { color: '#1d1d1d' } : null, build: { w: 0.24, h: 0.56, legs: 0.28 },
  });
  p.root.scale.setScalar(0.78);
  return p;
}
