// puppet.js — Aardman-ish plasticine people built from a small spec.
// Units: roughly metres, but cartoon proportions (big head, short legs). Faces look down +z.
import { THREE, clay, glossy, rng, shadowAll, hairBump } from './clay.js';
import { buildHead } from './head.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}
const ball = (r, mat, x, y, z, seg = 40) => mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), mat, x, y, z);
const ellip = (rx, ry, rz, mat, x, y, z, seg = 40) => {
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75));
  g.scale(rx, ry, rz);
  return mesh(g, mat, x, y, z);
};
const snake = (pts, r, mat, seg = 24) =>
  new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r, 10, false), mat);
// a sausage with rounded ends along a curve (eyebrows, lips, moustaches)
function roll(pts, r, mat) {
  const g = new THREE.Group();
  g.add(snake(pts, r, mat));
  g.add(ball(r, mat, ...pts[0].toArray(), 12));
  g.add(ball(r, mat, ...pts[pts.length - 1].toArray(), 12));
  return g;
}

// ---------- shirt textures ----------
const texCache = new Map();
function shirtTex(shirt) {
  const key = JSON.stringify(shirt);
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = shirt.color; g.fillRect(0, 0, 512, 256);
  const r = rng(9);
  if (shirt.pattern === 'plaid') {
    const [c2, c3] = shirt.colors || ['#2b3f7a', '#f2efe8'];
    g.globalAlpha = 0.55;
    for (let x = 0; x < 512; x += 28) { g.fillStyle = c2; g.fillRect(x, 0, 9, 256); g.fillStyle = c3; g.fillRect(x + 15, 0, 3, 256); }
    for (let y = 0; y < 256; y += 28) { g.fillStyle = c2; g.fillRect(0, y, 512, 9); g.fillStyle = c3; g.fillRect(0, y + 15, 512, 3); }
    g.globalAlpha = 1;
  } else if (shirt.pattern === 'gingham') { // small even checks
    const c2 = (shirt.colors || ['#c23b3b'])[0];
    g.globalAlpha = 0.5; g.fillStyle = c2;
    for (let x = 0; x < 512; x += 22) g.fillRect(x, 0, 11, 256);
    for (let y = 0; y < 256; y += 22) g.fillRect(0, y, 512, 11);
    g.globalAlpha = 1;
  } else if (shirt.pattern === 'tropical') { // Heinz's black-and-white leaf shirt
    for (let i = 0; i < 40; i++) {
      const x = r() * 512, y = r() * 256, a = r() * 6.28, L = 30 + r() * 40;
      g.save(); g.translate(x, y); g.rotate(a); g.strokeStyle = '#e8e4da'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(L, 0); g.stroke();
      for (let k = 6; k < L; k += 6) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 8, -10); g.moveTo(k, 0); g.lineTo(k + 8, 10); g.stroke(); }
      g.restore();
    }
  } else if (shirt.pattern === 'stripes') {
    const [c2, c3] = shirt.colors || ['#2a3346', '#c9ccd2'];
    for (let y = 0; y < 256; y += 30) { g.fillStyle = c2; g.fillRect(0, y, 512, 12); g.fillStyle = c3; g.fillRect(0, y + 12, 512, 4); }
  }
  if (shirt.logo) { // the Vefskólinn tee: a small cream "{ }" on the chest (u = 0.5 is the front)
    g.fillStyle = '#efe6d2'; g.font = 'bold 26px monospace'; g.textAlign = 'center';
    g.fillText(shirt.logo, 256, 96);
  }
  // hand-pressed unevenness
  for (let i = 0; i < 300; i++) {
    g.fillStyle = `rgba(${r() < 0.5 ? 0 : 255},${r() < 0.5 ? 0 : 255},${r() < 0.5 ? 0 : 255},0.035)`;
    g.beginPath(); g.arc(r() * 512, r() * 256, 3 + r() * 14, 0, 7); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  texCache.set(key, t);
  return t;
}

// ---------- body ----------
const PROFILE = (belly) => [[0, 0], [0.88, 0.0], [1.0, 0.12], [1.02 * belly, 0.38], [0.98, 0.62], [0.9, 0.82], [0.62, 0.96], [0.25, 1.0], [0, 1.0]];
// torso radius (as a fraction of bw) at height fraction f
function profileR(f, belly = 1) {
  const p = PROFILE(belly);
  for (let i = 1; i < p.length; i++) if (p[i][1] >= f && p[i][1] > p[i - 1][1]) {
    const k = (f - p[i - 1][1]) / (p[i][1] - p[i - 1][1]);
    return p[i - 1][0] + (p[i][0] - p[i - 1][0]) * k;
  }
  return 0.5;
}
function torsoGeo(bw, bh, belly = 1) {
  const p = PROFILE(belly).map(([x, y]) => new THREE.Vector2(x * bw, y * bh));
  const g = new THREE.LatheGeometry(p, 40, Math.PI, Math.PI * 2);
  g.scale(1, 1, 0.78); // a bit flatter front-to-back
  return g;
}

function makeArm(spec, mats, side) {
  const shoulder = new THREE.Group();
  const up = 0.24, fore = 0.22, r = spec.armR ?? 0.062;
  const upper = new THREE.Mesh(new THREE.CapsuleGeometry(r, up, 8, 16), mats.sleeve);
  upper.position.y = -up / 2;
  shoulder.add(upper);
  const elbow = new THREE.Group(); elbow.position.y = -up;
  shoulder.add(elbow);
  const lower = new THREE.Mesh(new THREE.CapsuleGeometry(r * 0.88, fore, 8, 16), spec.shortSleeves ? mats.skin : mats.sleeve);
  lower.position.y = -fore / 2;
  elbow.add(lower);
  const hand = new THREE.Group(); hand.position.y = -fore - 0.04;
  hand.add(ellip(0.065, 0.075, 0.045, mats.skin, 0, -0.01, 0, 20));
  hand.add(ellip(0.022, 0.04, 0.022, mats.skin, side * -0.05, 0.02, 0.02, 12)); // thumb
  elbow.add(hand);
  return { shoulder, elbow, hand };
}

/**
 * makePuppet(spec) -> { root, rig, pose(p), height }
 * spec: { id, seed, skin, hair:{style,color}, beard:{style,color}?, glasses:{color,w,h,round}?,
 *         shirt:{color,pattern?,colors?,logo?}, jacket?:{color}, trousers, shoes, build:{w,h,belly}, headR, face:{...} }
 */
export function makePuppet(spec) {
  const R = spec.headR ?? 0.25;
  const bw = spec.build?.w ?? 0.26, bh = spec.build?.h ?? 0.62, belly = spec.build?.belly ?? 1;
  const legH = spec.build?.legs ?? 0.3;
  const skinC = new THREE.Color(spec.skin);
  const mats = {
    skin: clay(spec.skin, { lump: 0.6 }),
    nose: clay('#' + skinC.clone().lerp(new THREE.Color('#c0605a'), 0.18).getHexString(), { lump: 0.5 }),
    lip: clay('#' + skinC.clone().lerp(new THREE.Color('#a8484a'), 0.35).getHexString(), { lump: 0.3 }),
    hair: clay(spec.hair?.color || '#3a2a1e', { lump: 1.4, bump: 2.2, bumpTex: hairBump(), rough: 0.7 }),
    brow: clay(spec.brow || spec.hair?.color || '#3a2a1e', { lump: 0.8 }),
    beard: clay(spec.beard?.color || spec.hair?.color || '#3a2a1e', { lump: 1.6, bump: 2.2, bumpTex: hairBump(), rough: 0.72 }),
    stubble: clay('#' + skinC.clone().lerp(new THREE.Color(spec.beard?.color || '#3a2a1e'), 0.42).getHexString(), { lump: 0.4, side: THREE.DoubleSide }),
    shirt: clay('#ffffff', { lump: 0.8, map: shirtTex(spec.shirt), key: spec.id + 'shirt' }),
    sleeve: clay(spec.jacket?.color || spec.shirt.sleeve || spec.shirt.color, { lump: 0.8 }),
    trousers: clay(spec.trousers || '#2c3442', { lump: 0.8 }),
    shoes: clay(spec.shoes || '#1d1a18', { lump: 0.5 }),
  };
  const root = new THREE.Group();
  const rig = { spec };

  // legs + shoes
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, legH - 0.1, 8, 16), mats.trousers);
    leg.position.set(s * bw * 0.42, legH / 2 + 0.03, 0);
    root.add(leg);
    root.add(ellip(0.085, 0.05, 0.13, mats.shoes, s * bw * 0.42, 0.045, 0.04, 20));
  }
  // torso
  const hips = new THREE.Group(); hips.position.y = legH; root.add(hips);
  rig.hips = hips;
  const torso = new THREE.Mesh(torsoGeo(bw, bh, belly), mats.shirt);
  hips.add(torso);
  if (spec.jacket) { // open puffer jacket: two front panels + quilting rolls
    const jm = clay(spec.jacket.color, { lump: 1.1 });
    jm.side = THREE.DoubleSide;
    // phi = 0 is the front, so start past it to leave the jacket open
    const jg = new THREE.LatheGeometry(torsoGeo(bw * 1.08, bh * 0.98, belly).parameters.points, 40, 0.55, Math.PI * 2 - 1.1);
    jg.scale(1, 1, 0.8);
    hips.add(new THREE.Mesh(jg, jm));
    for (let i = 1; i < 5; i++) { // quilting rolls, open at the front
      const f = i / 5.2, rr = bw * 1.1 * profileR(f, belly);
      const tg = new THREE.TorusGeometry(rr, 0.013, 6, 40, Math.PI * 2 - 1.3);
      tg.rotateX(Math.PI / 2); tg.rotateY(Math.PI * 1.5 - 0.65); tg.scale(1, 1, 0.8);
      hips.add(mesh(tg, jm, 0, bh * 0.98 * f, 0));
    }
  }
  // neck + head
  const neck = new THREE.Group(); neck.position.y = bh * 0.97; hips.add(neck);
  neck.add(mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.12, 16), mats.skin, 0, 0.03, 0));
  if (spec.collar) {
    const col = mesh(new THREE.TorusGeometry(0.085, 0.022, 8, 24), clay(spec.collar, { lump: 0.6 }));
    col.rotation.x = Math.PI / 2; neck.add(col);
  }
  const head = new THREE.Group(); head.position.y = 0.05 + R * 0.95; neck.add(head);
  rig.head = head; rig.neck = neck;
  buildHead(head, spec, mats, rig);

  // arms
  rig.arms = [];
  for (const s of [-1, 1]) {
    const a = makeArm(spec, mats, s);
    a.shoulder.position.set(s * bw * 0.98, bh * 0.83, 0);
    hips.add(a.shoulder);
    hips.add(ball(spec.armR ?? 0.062, mats.sleeve, s * bw * 0.95, bh * 0.83, 0, 16));
    rig.arms.push({ ...a, side: s });
  }

  shadowAll(root);
  const height = legH + bh + 0.1 + R * 2.1;
  const puppet = { root, rig, height, pose: (p) => applyPose(rig, p) };
  puppet.pose({});
  return puppet;
}

/**
 * pose fields (all optional, radians unless noted):
 *   lean, twist, headYaw, headPitch, headTilt,
 *   armL/armR: { out, fwd, elbow, twist }  (out = away from body, fwd = forward swing)
 *   mouth: 0..1 open, smile: -1..1, blink: 0..1, look: {x,y} -1..1, brow: -1..1 (raise)
 */
export function applyPose(rig, p) {
  rig.hips.rotation.set(p.lean || 0, p.twist || 0, p.sway || 0);
  rig.head.rotation.set(-(p.headPitch || 0), p.headYaw || 0, p.headTilt || 0);
  rig.arms.forEach((a) => {
    const q = (a.side < 0 ? p.armR : p.armL) || {};
    a.shoulder.rotation.set(-(q.fwd ?? 0.05), q.twist || 0, a.side * (q.out ?? 0.12));
    a.elbow.rotation.set(-(q.elbow ?? 0.15), 0, 0);
  });
  const m = rig.mouth, open = Math.max(0, Math.min(1, p.mouth || 0)), smile = p.smile ?? 0.4;
  m.slot.visible = m.teeth.visible = open > 0.06;
  m.smile.visible = !m.slot.visible;
  m.slot.scale.set(0.075 + open * 0.01, 0.012 + open * 0.05, 0.02);
  m.teeth.scale.set(0.06, 0.012, 0.012); m.teeth.position.set(0, 0.006 + open * 0.035, 0.008);
  m.smile.scale.set(1, smile, 1);
  m.lip.position.y = -(0.016 + open * 0.05);
  m.lip.scale.set(1, 1 - smile * 0.3, 1);
  const blink = Math.max(0, Math.min(1, p.blink || 0));
  rig.eyes.forEach((e) => {
    e.lid.rotation.x = e.lid.userData.open + (e.lid.userData.closed - e.lid.userData.open) * blink;
    e.lookPivot.rotation.set(-(p.look?.y || 0) * 0.3, (p.look?.x || 0) * 0.35, 0);
  });
  (rig.brows || []).forEach((b) => { b.position.y = (p.brow || 0) * 0.02; });
}
