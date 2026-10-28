// head.js — puppet heads. The skull is one deformed ball; hair, beards and stubble are
// clay "smeared on" as layers over the same surface, thick where the mask is 1 and sinking
// under the skin where it is 0, so their edges taper like pressed plasticine (no seams).
import { THREE, clay, glossy, rng } from './clay.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const ss = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const dirAB = (a, b) => V(Math.sin(a) * Math.cos(b), Math.sin(b), Math.cos(a) * Math.cos(b));

function mesh(geo, mat, p) { const m = new THREE.Mesh(geo, mat); if (p) m.position.copy(p); return m; }
const ellip = (rx, ry, rz, mat, p, seg = 32) => { const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75)); g.scale(rx, ry, rz); return mesh(g, mat, p); };
const ball = (r, mat, p, seg = 24) => mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), mat, p);
const snake = (pts, r, mat, seg = 24) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r, 10, false), mat);
function roll(pts, r, mat) {
  const g = new THREE.Group();
  g.add(snake(pts, r, mat), ball(r, mat, pts[0], 12), ball(r, mat, pts[pts.length - 1], 12));
  return g;
}
const aim = (obj, n) => { obj.quaternion.setFromUnitVectors(V(0, 0, 1), n.clone().normalize()); return obj; };

// cheap smooth pseudo-noise on (a, b) for clumpy thickness
const wob = (a, b, s) => Math.sin(a * 6.1 + s) * Math.sin(b * 7.3 + s * 1.7) * 0.6 + Math.sin(a * 13.7 + s * 3.1 + b * 4.1) * 0.4;

export function headShape(R, tall = 1.06) {
  const surf = (d) => {
    const p = d.clone().multiplyScalar(R);
    p.y *= tall; p.z *= 0.94;
    if (p.y < 0) { // jaw comes forward, narrows toward the chin
      const k = Math.min(1, -p.y / (R * tall));
      p.z *= 1 + 0.16 * k; p.x *= 1 - 0.14 * k * k;
    }
    return p;
  };
  const at = (a, b, out = 0) => surf(dirAB(a, b)).add(dirAB(a, b).multiplyScalar(out));
  return { R, surf, at };
}

// build a ball-topology geometry whose surface is P(a, b); normals from finite differences
function sphereMap(P, wSeg = 72, hSeg = 54) {
  const g = new THREE.SphereGeometry(1, wSeg, hSeg);
  const pos = g.attributes.position, nor = g.attributes.normal;
  const v = V(0, 0, 0), e = 0.002;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const b = Math.asin(Math.max(-1, Math.min(1, v.y)));
    const a = Math.atan2(v.x, v.z);
    const p = P(a, b);
    pos.setXYZ(i, p.x, p.y, p.z);
    let n;
    if (Math.abs(b) > 1.53) n = V(0, Math.sign(b), 0);
    else {
      const da = P(a + e, b).sub(p), db = P(a, b + e).sub(p);
      n = da.cross(db).normalize().negate();
      if (n.dot(p) < 0) n.negate();
    }
    nor.setXYZ(i, n.x, n.y, n.z);
  }
  pos.needsUpdate = nor.needsUpdate = true;
  return g;
}

// a pressed-on layer: mask(a,b) in 0..1, thick(a,b) in metres
function layer(shape, mask, thick, mat, seg = [72, 54]) {
  return new THREE.Mesh(sphereMap((a, b) => {
    const m = ss(0, 1, mask(a, b));
    const off = -0.022 + (0.022 + thick(a, b)) * m;
    return shape.at(a, b, off);
  }, ...seg), mat);
}

// hairline pitch for yaw a: high on the forehead, lower over the ears, down the nape
const hairline = (a, front = 0.62) => {
  const c = Math.cos(a);
  return c > 0 ? 0.08 + (front - 0.08) * c : 0.08 + 0.62 * c;
};

function addHair(head, shape, spec, mats) {
  const h = spec.hair || {};
  const s = spec.seed || 1;
  const r = rng(s);
  const above = (a, b, front) => ss(-0.07, 0.07, b - hairline(a, front));
  const g = new THREE.Group();
  const L = (mask, thick) => g.add(layer(shape, mask, thick, mats.hair));
  switch (h.style) {
    case 'bald':
      L((a, b) => above(a, b) * (1 - ss(0.1, 0.36, b)) * (1 - ss(-0.25, 0.25, Math.cos(a))),
        (a, b) => 0.022 * (1 + 0.5 * wob(a, b, s)));
      break;
    case 'cropped':
      L((a, b) => above(a, b, 0.7), () => 0.006);
      break;
    case 'short':
      L((a, b) => above(a, b, 0.6), (a, b) => 0.03 * (1 + 0.45 * wob(a, b, s)) + 0.015 * ss(0.3, 0.9, b));
      break;
    case 'messy':
      L((a, b) => above(a, b, 0.55), (a, b) => 0.045 * (1 + 0.6 * wob(a, b, s)) + 0.02 * ss(0.4, 1, b));
      break;
    case 'fade':
      L((a, b) => above(a, b, 0.62), (a, b) => 0.006 + 0.055 * ss(0.45, 0.95, b) * (1 + 0.3 * wob(a, b, s)));
      break;
    case 'updo':
      L((a, b) => above(a, b, 0.6), (a, b) => 0.018 + 0.006 * wob(a, b * 3, s));
      g.add(ball(shape.R * 0.3, mats.hair, shape.at(0, 1.05, 0.05).add(V(0, 0.02, -0.03)), 28));
      for (let i = 0; i < 6; i++) g.add(ellip(0.04, 0.03, 0.04, mats.hair, shape.at((r() - 0.5) * 0.8, 1.15 + r() * 0.2, 0.09 + r() * 0.04), 12));
      break;
    case 'long':
      L((a, b) => above(a, b, 0.58), (a, b) => 0.04 * (1 + 0.4 * wob(a, b, s)));
      // two thick locks falling past the ears onto the shoulders, and a curtain down the back
      for (const sd of [-1, 1]) {
        const pts = [shape.at(sd * 1.2, 0.35, 0.02), shape.at(sd * 1.42, -0.15, 0.05), V(sd * shape.R * 0.98, -shape.R * 1.05, -shape.R * 0.18), V(sd * shape.R * 1.0, -shape.R * 1.75, -shape.R * 0.3)];
        g.add(snake(pts, shape.R * 0.16, mats.hair, 24));
        g.add(ball(shape.R * 0.16, mats.hair, pts[3], 16));
      }
      g.add(ellip(shape.R * 0.92, shape.R * 1.05, shape.R * 0.3, mats.hair, V(0, -shape.R * 0.75, -shape.R * 0.72)));
      g.add(ball(shape.R * 0.24, mats.hair, shape.at(Math.PI, 0.55, 0.06)));
      break;
    case 'curly':
      L((a, b) => above(a, b, 0.58), () => 0.025);
      for (let i = 0; i < 46; i++) {
        const a = r() * Math.PI * 2, b = 0.25 + r() * 1.25;
        if (b < hairline(a, 0.58) + 0.05) continue;
        g.add(ball(0.035 + r() * 0.02, mats.hair, shape.at(a, b, 0.04), 14));
      }
      break;
    case 'swoop': { // Jakub: wavy curls with a big forelock falling to one side
      L((a, b) => above(a, b, 0.6), (a, b) => 0.04 + 0.035 * ss(0.5, 1.1, b) * (1 + 0.5 * wob(a, b, s)));
      for (let i = 0; i < 30; i++) {
        const a = r() * Math.PI * 2, b = 0.55 + r() * 0.95;
        if (b < hairline(a, 0.6) + 0.12) continue;
        g.add(ellip(0.05 + r() * 0.02, 0.035, 0.045, mats.hair, shape.at(a, b, 0.065), 14));
      }
      // forelock: a fat curl sweeping from the crown over the forehead to the puppet's right
      const fl = [shape.at(0.35, 1.0, 0.08), shape.at(0.05, 0.82, 0.075), shape.at(-0.3, 0.68, 0.06), shape.at(-0.55, 0.52, 0.045)];
      g.add(snake(fl, 0.042, mats.hair, 20));
      g.add(ball(0.04, mats.hair, fl[3], 14));
      g.add(snake([shape.at(-0.1, 0.95, 0.08), shape.at(-0.45, 0.8, 0.07), shape.at(-0.75, 0.62, 0.05)], 0.034, mats.hair, 16));
      break;
    }
  }
  if (h.cap) { // trucker cap: crown dome + brim + a little patch
    const cm = clay(h.cap, { lump: 0.5 });
    const crown = new THREE.Mesh(new THREE.SphereGeometry(shape.R * 1.1, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.42), cm);
    crown.position.y = shape.R * 0.18; crown.scale.set(1, 0.95, 1.0); g.add(crown);
    const brim = ellip(shape.R * 0.75, 0.012, shape.R * 0.55, cm, V(0, shape.R * 0.62, shape.R * 0.88));
    brim.rotation.x = 0.18; g.add(brim);
    if (h.capPatch) g.add(ellip(0.07, 0.05, 0.02, clay(h.capPatch, { lump: 0.3 }), shape.at(0, 0.95, 0.12)));
  }
  head.add(g);
}

function addBeard(head, shape, spec, mats, mouthB) {
  const bd = spec.beard;
  if (!bd) return 0;
  const s = (spec.seed || 1) * 3;
  const top = (a) => -0.3 + 0.4 * ss(0.45, 1.35, Math.abs(a));
  const hole = (a, b, k = 1) => ss(0.75, 1.25, (a / (0.3 * k)) ** 2 + ((b - mouthB) / (0.07 * k)) ** 2);
  const region = (a, b) => ss(-0.05, 0.05, top(a) - b) * (1 - ss(1.45, 1.62, Math.abs(a))) * ss(-1.42, -1.25, b);
  if (bd.style === 'stubble') {
    head.add(layer(shape, (a, b) => region(a, b) * hole(a, b, 0.8), () => 0.008, mats.stubble));
    return 0.008;
  }
  const long = bd.style === 'long' ? 1 : 0, short = bd.style === 'short' ? 1 : 0;
  const thick = (a, b) => ((0.03 + 0.05 * ss(-0.55, -1.0, b) + long * 0.07 * ss(-0.6, -1.1, b)) * (1 - short * 0.55)) * (1 + 0.35 * wob(a, b, s));
  head.add(layer(shape, (a, b) => region(a, b) * hole(a, b), thick, mats.beard));
  if (long) head.add(ellip(shape.R * 0.5, shape.R * 0.55, shape.R * 0.4, mats.beard, shape.at(0, -1.0, 0.04).add(V(0, -0.08, 0.02))));
  // moustache, pressed above the lip
  const mb = mouthB + 0.085;
  head.add(roll([shape.at(-0.4, mb - 0.06, 0.022), shape.at(-0.14, mb, 0.03), shape.at(0.14, mb, 0.03), shape.at(0.4, mb - 0.06, 0.022)], 0.024, mats.beard));
  return 0.02;
}

function addFace(head, shape, spec, mats, rig) {
  const f = spec.face || {};
  const eyeY = f.eyeY ?? 0.12, eyeA = f.eyeGap ?? 0.26, eyeR = f.eyeR ?? 0.06;
  const mouthB = f.mouthY ?? -0.4;
  rig.eyes = []; rig.brows = [];
  for (const sd of [-1, 1]) {
    const pos = shape.at(sd * eyeA, eyeY, -0.024);
    const n = dirAB(sd * eyeA * 0.7, eyeY * 0.5);
    const eye = new THREE.Group(); eye.position.copy(pos); aim(eye, n);
    eye.add(ball(eyeR, glossy('#f4f1ea', { roughness: 0.16 }), null, 28));
    const lookPivot = new THREE.Group();
    const pupil = ball(eyeR * 0.4, glossy('#120e0d', { roughness: 0.08 }), V(0, 0, eyeR * 0.9), 18);
    pupil.scale.z = 0.45;
    lookPivot.add(pupil); eye.add(lookPivot);
    // lid: skin dome; tipped back = open, tipped forward = closed
    const lid = new THREE.Mesh(new THREE.SphereGeometry(eyeR * 1.09, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), mats.skin);
    lid.userData.open = -0.55; lid.userData.closed = 1.5;
    eye.add(lid);
    head.add(eye);
    rig.eyes.push({ eye, lookPivot, lid });
    const bA = sd * eyeA, bY = eyeY + (f.browY ?? 0.2);
    const brow = roll([shape.at(bA - sd * 0.15, bY - 0.03, 0.012), shape.at(bA, bY + 0.015, 0.016), shape.at(bA + sd * 0.14, bY - 0.035, 0.012)], f.browR ?? 0.015, mats.brow);
    head.add(brow); rig.brows.push(brow);
    const ear = ellip(0.04, 0.068, 0.03, mats.skin, shape.at(sd * 1.5, -0.02, -0.012), 16);
    ear.rotation.y = sd * 0.35; head.add(ear);
  }
  // nose: a pressed bean
  const nose = ellip(f.noseW ?? 0.04, f.noseH ?? 0.048, 0.045, mats.nose, shape.at(0, f.noseB ?? -0.08, 0.012), 24);
  aim(nose, dirAB(0, -0.2)); head.add(nose);
  return { mouthB };
}

function addMouth(head, shape, mats, rig, mouthB, out) {
  const mp = shape.at(0, mouthB, out - 0.006);
  const mouth = new THREE.Group(); mouth.position.copy(mp); aim(mouth, dirAB(0, mouthB * 0.6));
  const dark = glossy('#3a1414', { roughness: 0.4 });
  const slot = ellip(1, 1, 1, dark, null, 24);
  const teeth = ellip(1, 1, 1, clay('#f3eee2', { lump: 0.2 }), null, 16);
  const smile = roll([V(-0.075, 0.02, -0.004), V(-0.035, -0.006, 0.004), V(0.035, -0.006, 0.004), V(0.075, 0.02, -0.004)], 0.009, dark);
  const lip = roll([V(-0.07, 0, -0.006), V(0, -0.005, 0.006), V(0.07, 0, -0.006)], 0.012, mats.lip);
  mouth.add(slot, teeth, smile, lip);
  head.add(mouth);
  rig.mouth = { group: mouth, slot, teeth, smile, lip };
}

function addGlasses(head, shape, spec) {
  const gl = spec.glasses;
  if (!gl) return;
  const f = spec.face || {};
  const eyeY = f.eyeY ?? 0.12, eyeA = f.eyeGap ?? 0.26;
  const frame = glossy(gl.color || '#1a1a1a', { roughness: 0.3 });
  const w = gl.w ?? 0.058, h = gl.h ?? 0.044, tube = gl.thick ?? 0.0075, rr = Math.min(w, h) * (gl.round ?? 0.45);
  const g = new THREE.Group();
  const shape2 = new THREE.Shape();
  shape2.moveTo(-w + rr, -h); shape2.lineTo(w - rr, -h); shape2.quadraticCurveTo(w, -h, w, -h + rr);
  shape2.lineTo(w, h - rr); shape2.quadraticCurveTo(w, h, w - rr, h); shape2.lineTo(-w + rr, h);
  shape2.quadraticCurveTo(-w, h, -w, h - rr); shape2.lineTo(-w, -h + rr); shape2.quadraticCurveTo(-w, -h, -w + rr, -h);
  const pts = shape2.getSpacedPoints(48).map((p) => V(p.x, p.y, 0));
  const lensMat = new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.1, roughness: 0.05, clearcoat: 1, depthWrite: false });
  for (const sd of [-1, 1]) {
    const c = shape.at(sd * eyeA, eyeY, 0.052);
    const rim = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 64, tube, 8, true), frame);
    rim.position.copy(c); aim(rim, V(sd * 0.12, 0.03, 1));
    const lens = new THREE.Mesh(new THREE.ShapeGeometry(shape2), lensMat);
    lens.position.copy(c); aim(lens, V(sd * 0.12, 0.03, 1));
    g.add(rim, lens);
    const e0 = c.clone().add(V(sd * w * 0.97, h * 0.4, -0.006));
    g.add(snake([e0, shape.at(sd * 1.05, eyeY * 0.8, 0.025), shape.at(sd * 1.45, 0.03, 0.02)], tube * 0.75, frame, 12));
  }
  const b0 = shape.at(-eyeA, eyeY, 0.052).add(V(w * 0.95, h * 0.25, 0));
  const b1 = shape.at(eyeA, eyeY, 0.052).add(V(-w * 0.95, h * 0.25, 0));
  g.add(snake([b0, V(0, b0.y + 0.008, b0.z + 0.004), b1], tube * 0.8, frame, 8));
  head.add(g);
}

/** buildHead(headGroup, spec, mats, rig) — fills the group, returns the shape helper */
export function buildHead(head, spec, mats, rig) {
  const R = spec.headR ?? 0.25;
  const shape = headShape(R, spec.headTall ?? 1.06);
  head.add(new THREE.Mesh(sphereMap((a, b) => shape.at(a, b)), mats.skin));
  const { mouthB } = addFace(head, shape, spec, mats, rig);
  addHair(head, shape, spec, mats);
  const beardOut = addBeard(head, shape, spec, mats, mouthB);
  addMouth(head, shape, mats, rig, mouthB, beardOut);
  addGlasses(head, shape, spec);
  if (spec.earring) for (const sd of [-1, 1]) head.add(ball(0.011, glossy('#d8b45a', { metalness: 0.8, roughness: 0.3 }), shape.at(sd * 1.5, -0.24, 0.005), 10));
  rig.shape = shape;
  return shape;
}
