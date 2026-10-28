// scenes.js — every shot of "From one island to another", timed to the narration's word timings.
// A shot = { scene, from, to (local s), build(ctx) -> { scene, camera, update(lt) } }.
import { THREE, makeStudio, stepOf, POSES_PER_SEC, clay, glossy, glow, rng, nudge, shadowAll } from './clay.js';
import { makePuppet } from './puppet.js';
import { CAST, OUTFITS } from './cast.js';
import * as P from './props.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const lerp = (a, b, k) => a + (b - a) * k;

// ---------- helpers shared by shots ----------
const byId = Object.fromEntries(CAST.map((c) => [c.id, c]));
function cast(id, outfit) { return makePuppet(outfit ? { ...byId[id], ...OUTFITS[outfit], id: id + outfit } : byId[id]); }

// stop-motion "pop" on: tiny, overshoot, settle — one value per pose
const POP = [0.25, 0.7, 1.18, 1.06, 0.97, 1];
function pop(obj, lt, at, base = 1) {
  if (lt < at) { obj.visible = false; return 0; }
  obj.visible = true;
  const k = Math.floor((lt - at) * POSES_PER_SEC + 1e-6);
  const s = k < POP.length ? POP[k] : 1;
  obj.scale.setScalar(base * s);
  return s;
}
const blink = (lt, seed = 0) => ((stepOf(lt) + seed * 13) % 37) < 2 ? 1 : 0;
const jig = (lt, seed = 0, amt = 0.05) => Math.sin(stepOf(lt) * 0.9 + seed) * amt; // small, stepped wobble

function camera(fov = 30) { return new THREE.PerspectiveCamera(fov, 16 / 9, 0.05, 80); }
// keyed camera path: keys [{t, pos:[x,y,z], look:[x,y,z], fov?}], eased between keys
function camPath(cam, lt, keys) {
  let i = 0; while (i < keys.length - 1 && lt > keys[i + 1].t) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const k = b === a ? 0 : ease((lt - a.t) / Math.max(0.001, b.t - a.t));
  const pos = a.pos.map((v, j) => lerp(v, b.pos[j], k)), look = a.look.map((v, j) => lerp(v, b.look[j], k));
  cam.position.set(...pos); cam.lookAt(...look);
  const fov = lerp(a.fov ?? cam.fov, b.fov ?? a.fov ?? cam.fov, k);
  if (fov !== cam.fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
}
function place(obj, x, y, z, ry = 0) { obj.position.set(x, y, z); obj.rotation.y = ry; return obj; }
function at(p, x, z, ry = 0) { p.root.position.set(x, 0, z); p.root.rotation.set(0, ry, 0); return p; }

// poses
const ARMS_DOWN = { armL: { out: 0.12, fwd: 0.05, elbow: 0.2 }, armR: { out: 0.12, fwd: 0.05, elbow: 0.2 } };
const type = (lt, s = 0) => ({ armL: { out: 0.28, fwd: 1.05 + jig(lt, s, 0.08), elbow: 0.95 }, armR: { out: 0.28, fwd: 1.05 + jig(lt, s + 2, 0.08), elbow: 0.95 } });
const waveR = (lt, s = 0) => ({ out: 2.5, fwd: 0.25, elbow: ((stepOf(lt) + s) % 4 < 2) ? 0.2 : 0.75 });
const waveL = (lt, s = 0) => ({ out: 2.5, fwd: 0.25, elbow: ((stepOf(lt) + s) % 4 < 2) ? 0.2 : 0.75 });
const cheer = { out: 2.7, fwd: 0.3, elbow: 0.25 };
const thumbs = { out: 0.35, fwd: 0.7, elbow: 1.7 };
const scratch = { out: 1.1, fwd: 0.9, elbow: 2.3 };
const hold = { out: 0.2, fwd: 0.9, elbow: 0.75 };

function idle(lt, seed = 0, extra = {}) {
  return { smile: 0.55, blink: blink(lt, seed), headYaw: jig(lt, seed, 0.04), headTilt: jig(lt, seed + 3, 0.03), ...ARMS_DOWN, ...extra };
}
function holdOnHips(p, obj, x, y, z) { p.rig.hips.add(obj); obj.position.set(x, y, z); return obj; }

// a painted sky board standing behind a set (stop-motion backdrop)
function skyBoard(stops, { w = 14, h = 6, z = -2.6, y = 2.6, horizontal = false } = {}) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  const gr = horizontal ? g.createLinearGradient(0, 0, 1024, 0) : g.createLinearGradient(0, 0, 0, 512);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
  const r = rng(9);
  for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(255,255,255,${0.02 * r()})`; g.fillRect(r() * 1024, r() * 512, 2, 2); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 1 }));
  m.position.set(0, y, z); m.receiveShadow = true;
  return m;
}
function room(st, { wall = '#efe3cf', floor = null } = {}) {
  const w = P.mesh(new THREE.PlaneGeometry(12, 5), clay(wall, { lump: 0.4 }), 0, 2.5, -1.6);
  w.receiveShadow = true; st.scene.add(w);
  return w;
}

// ---------- the shots ----------
export function shotList(tl) {
  const sc = Object.fromEntries(tl.scenes.map((s) => [s.id, s]));
  const norm = (w) => w.toLowerCase().replace(/[^a-z0-9-]/g, '');
  // local time of the nth occurrence of a spoken word in a scene
  const W = (sid, word, n = 0) => {
    const s = sc[sid]; const hits = s.words.filter((w) => norm(w.w) === norm(word));
    if (!hits[n]) throw new Error(`word "${word}" not in ${sid}`);
    return +(hits[n].t - s.start).toFixed(3);
  };
  const end = (sid) => sc[sid].dur;
  const shots = [];
  const add = (scene, from, to, label, build) => shots.push({ scene, from, to, label, build, start: sc[scene].start + from });

  // ===== s1: two islands =====
  add('s1', 0, end('s1'), 'Two islands on a tabletop sea', () => {
    const st = makeStudio({ backdrop: ['#1d2a4a', '#2b3a5c'], table: true });
    st.scene.add(skyBoard([[0, '#16213f'], [0.42, '#2c3c66'], [0.6, '#f2b183'], [1, '#ffd9a0']], { horizontal: true, w: 16, h: 7, z: -3, y: 3 }));
    st.scene.add(P.sea(16, 9));
    // Iceland, left
    const ice = P.island('iceland', { size: 1.35, color: '#7f9a6a', beach: '#4a4a4e', height: 0.18 }); place(ice, -2.3, 0, 0.1);
    st.scene.add(ice);
    [[-2.6, -0.05, 0.45, 0.55], [-2.0, 0.2, 0.35, 0.45], [-1.6, -0.25, 0.3, 0.38]].forEach(([x, z, r, h]) => st.scene.add(place(P.mountain(r, h, { color: '#5f5d58' }), x, 0.18, z)));
    [[-2.9, 0.5, '#c0463c'], [-2.65, 0.62, '#3c6fb0'], [-2.35, 0.55, '#e0b440'], [-1.45, 0.4, '#c0463c']].forEach(([x, z, roof]) => st.scene.add(place(P.house({ roof, s: 0.17 }), x, 0.18, z, 0.3)));
    const moon = P.moon(0.2); place(moon, -3.0, 2.3, -1.6); st.scene.add(moon, P.rod(V(-3.0, 2.1, -1.6), V(-3.0, 0, -1.6)));
    const stars = [[-4.2, 2.8], [-1.8, 3.1], [-3.6, 3.5], [-1.2, 2.5], [-0.6, 3.3]].map(([x, y], i) => { const s = P.star(0.07); place(s, x, y, -2.4); st.scene.add(s, P.rod(V(x, y + 0.05, -2.4), V(x, 6, -2.4), 0.003)); return s; });
    const paleSun = P.sun(0.16, { face: false }); paleSun.scale.setScalar(0.8); st.scene.add(paleSun);
    // Gran Canaria, right
    const gc = P.island('granCanaria', { size: 1.0, color: '#b49a5c', beach: '#e6cc8e', height: 0.2 }); place(gc, 2.3, 0, 0.1);
    st.scene.add(gc);
    st.scene.add(place(P.mountain(0.55, 0.62, { color: '#8a5f3e', snow: null }), 2.35, 0.2, 0.0));
    st.scene.add(place(P.mountain(0.12, 0.3, { color: '#6e4b33', snow: null }), 2.45, 0.6, -0.05)); // Roque Nublo-ish
    [[1.55, 0.55], [1.75, 0.85], [3.05, 0.6], [2.9, 0.95]].forEach(([x, z], i) => st.scene.add(place(P.palm(0.45, i + 3), x, 0.2, z)));
    [[2.0, 0.95, '#d9762f'], [2.3, 1.05, '#d9762f'], [2.65, 0.98, '#3c6fb0']].forEach(([x, z, roof]) => st.scene.add(place(P.house({ roof, s: 0.15, wall: '#f6f1e6' }), x, 0.2, z, -0.2)));
    const sun = P.sun(0.32); sun.traverse((o) => { o.castShadow = false; }); st.scene.add(sun);
    const sunRod = P.liveRod(0.006); st.scene.add(sunRod);
    // title
    const title = P.plaque(['From one island', 'to another'], { w: 2.6, h: 0.9, d: 0.12, color: '#f2e6cf', ink: '#2b2118' });
    st.scene.add(title, P.rod(V(0, 1.15, 0.6), V(0, 6, 0.6), 0.004));
    const titleRod = st.scene.children[st.scene.children.length - 1];
    st.key.position.set(0, 5, 5); st.key.angle = 0.75;
    const cold = new THREE.PointLight('#7fa0ff', 6, 6); cold.position.set(-2.4, 2, 1.5); st.scene.add(cold);
    const warm = new THREE.PointLight('#ffb36b', 4, 5); warm.position.set(2.4, 2, 1.5); st.scene.add(warm);
    const cam = camera(34);
    const tN = W('s1', 'North'), tShort = W('s1', 'short'), tAfr = W('s1', 'Africa'), tNot = W('s1', 'not');
    return {
      scene: st.scene, camera: cam, update(lt) {
        camPath(cam, lt, [
          { t: 0, pos: [0, 2.3, 7.4], look: [0, 0.7, 0] },
          { t: tN - 0.2, pos: [0, 2.3, 7.4], look: [0, 0.7, 0] },
          { t: tN + 1.0, pos: [-1.7, 1.5, 4.6], look: [-2.1, 0.7, 0] },
          { t: tAfr - 0.6, pos: [-1.6, 1.5, 4.5], look: [-2.1, 0.7, 0] },
          { t: tAfr + 0.6, pos: [1.7, 1.5, 4.6], look: [2.2, 0.8, 0] },
          { t: tNot + 1.0, pos: [1.7, 1.5, 4.6], look: [2.2, 0.8, 0] },
          { t: tNot + 2.0, pos: [0, 2.1, 6.8], look: [0, 0.8, 0] },
        ]);
        // the pale Icelandic winter sun peeks up and drops again on "short"
        const up = ease((lt - (tN + 0.6)) / 0.8) - ease((lt - (tShort - 0.2)) / 0.5);
        paleSun.position.set(-1.9, 0.1 + up * 0.55, -0.9);
        // the Canarian sun rises on "Africa", shades on for "not"
        const rise = ease((lt - (tAfr - 0.3)) / 1.2);
        sun.position.set(2.9, 0.4 + rise * 1.6, -1.2);
        sunRod.set(V(2.9, sun.position.y - 0.32, -1.2), V(2.9, 0, -1.2));
        sun.userData.shades.visible = lt >= tNot + 0.15;
        sun.rotation.z = lt >= tNot + 0.15 && lt < tNot + 0.7 ? 0.15 : 0;
        stars.forEach((s, i) => { s.rotation.z = jig(lt, i, 0.2); });
        const tt = tNot + 0.75;
        pop(title, lt, tt); titleRod.visible = lt >= tt; title.position.set(0, 0.75, 0.6); title.rotation.x = -0.12;
      },
    };
  });

  // ===== s2: Vefskólinn =====
  const tOne = W('s2', 'One'), tOur = W('s2', 'Our');
  add('s2', 0, tOne, 'Vefskólinn, Tækniskólinn, in the snow', () => {
    const st = makeStudio({ backdrop: ['#c9d6e6', '#9fb1c9'] });
    st.scene.add(skyBoard([[0, '#7f93b8'], [1, '#d6dde8']], { z: -2.8 }));
    const snow = P.mesh(new THREE.PlaneGeometry(14, 8, 60, 40), clay('#f3f1ec', { lump: 3 }), 0, 0.01, 0); snow.rotation.x = -Math.PI / 2; snow.receiveShadow = true; st.scene.add(snow);
    const b = new THREE.Group();
    b.add(place(P.slab(2.6, 1.3, 1.2, clay('#d8d4cc', { lump: 0.8 }), 0.06), 0, 0.65, 0));
    b.add(place(P.slab(2.7, 0.12, 1.3, clay('#f6f4ef', { lump: 1.5 }), 0.05), 0, 1.33, 0)); // snow on the roof
    for (let i = 0; i < 6; i++) for (let k = 0; k < 2; k++) b.add(P.mesh(new THREE.BoxGeometry(0.28, 0.24, 0.02), glow('#ffd58a', 1.25), -1.0 + i * 0.4, 0.45 + k * 0.45, 0.61));
    b.add(P.mesh(new THREE.BoxGeometry(0.36, 0.5, 0.03), clay('#3b4250', { lump: 0.4 }), 0, 0.25, 0.61));
    const sign = P.plaque('Vefskólinn', { w: 1.5, h: 0.36, d: 0.08, color: '#1f2a44', ink: '#f2e6cf' }); place(sign, 0, 1.62, 0.3); b.add(sign);
    const sign2 = P.plaque('Tækniskólinn', { w: 1.0, h: 0.2, d: 0.05, color: '#f2e6cf', ink: '#1f2a44', weight: 600 }); place(sign2, 0, 1.3, 0.66); b.add(sign2);
    shadowAll(b); place(b, 0, 0, -0.4); st.scene.add(b);
    const fl = P.flag('is', 0.9); place(fl, 1.7, 0, 0.2); st.scene.add(fl);
    [[-1.9, 0.4], [2.2, -0.5], [-2.4, -0.6]].forEach(([x, z]) => st.scene.add(place(P.mountain(0.18, 0.5, { color: '#3e5a3e', snowLine: 0.3 }), x, 0, z)));
    const r = rng(3); const flakes = Array.from({ length: 70 }, () => { const f = P.ball(0.018, clay('#ffffff', { lump: 0.3 }), 0, 0, 0, 8); st.scene.add(f); return { f, x: (r() - 0.5) * 7, z: (r() - 0.5) * 3 + 0.5, y0: r() * 3, v: 0.25 + r() * 0.2 }; });
    const cam = camera(32);
    return { scene: st.scene, camera: cam, update(lt) {
      camPath(cam, lt, [{ t: 0, pos: [0.4, 1.4, 6.2], look: [0, 0.95, 0] }, { t: tOne, pos: [0.2, 1.3, 5.2], look: [0, 1.0, 0] }]);
      flakes.forEach((k) => { k.f.position.set(k.x + Math.sin(k.y0 + lt) * 0.05, 3 - ((k.y0 + lt * k.v) % 3), k.z); });
      fl.userData.cloth.rotation.y = jig(lt, 1, 0.12);
    } };
  });
  add('s2', tOne, tOur, 'Smári at the whiteboard, Jakub at his laptop', () => {
    const st = makeStudio({ backdrop: ['#efe3cf', '#d9c7a8'] });
    room(st, { wall: '#e9dcc4' });
    const wb = P.screenTex((g, w, h, t) => {
      g.fillStyle = '#fbfaf7'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#2b55c8'; g.font = `600 40px ${P.FONT}`;
      const txt = ['const Header = () => {', '  return <h1>Hi!</h1>', '}', 'export default Header'];
      let n = Math.floor(t * 14);
      txt.forEach((l, i) => { const s = l.slice(0, Math.max(0, n)); n -= l.length; g.fillText(s, 30, 70 + i * 62); });
    });
    const board = P.whiteboard(wb, 1.7, 0.95); place(board, -0.55, 1.35, -1.5); st.scene.add(board);
    const smari = cast('smari'); at(smari, 0.5, -1.0, -0.7); st.scene.add(smari.root);
    const marker = P.mesh(new THREE.CapsuleGeometry(0.014, 0.08, 4, 8), clay('#2b55c8', { lump: 0.3 })); smari.rig.arms[0].hand.add(marker); marker.position.set(0, -0.06, 0.03);
    const desk = P.desk(1.0, 0.55, 0.5); place(desk, 1.95, 0, 0.15, -0.45); st.scene.add(desk);
    const scr = P.codeScreen(5, '#c9a6ff'); const lap = P.laptop(scr); place(lap, 1.95, 0.525, 0.2, -0.45); st.scene.add(lap);
    const jakub = cast('jakub'); at(jakub, 1.75, -0.45, -0.45); st.scene.add(jakub.root);
    // a stool for Jakub to sit on would hide his legs; keep him standing at a high desk
    const tag = P.plaque(['1 year', 'taught in English'], { w: 1.2, h: 0.5, d: 0.07, color: '#c8562a', ink: '#fff6e6' }); st.scene.add(tag);
    const cam = camera(30);
    const tEng = W('s2', 'English');
    return { scene: st.scene, camera: cam, update(lt) {
      const l = lt - tOne;
      camPath(cam, l, [{ t: 0, pos: [0.7, 1.55, 5.0], look: [0.55, 1.1, -0.5] }, { t: tOur - tOne, pos: [0.6, 1.5, 4.6], look: [0.55, 1.1, -0.5] }]);
      wb.paint(l);
      smari.pose(idle(l, 1, { headYaw: l % 3 < 1.6 ? -0.5 : 0.35, armR: { out: 1.3, fwd: 0.75, elbow: 0.45 + jig(l, 1, 0.1) } }));
      jakub.pose(idle(l, 2, { ...type(l, 3), headYaw: l > 1.2 ? 0.45 : -0.2, smile: 0.9 }));
      scr.paint(l);
      pop(tag, lt, tEng - 0.3); place(tag, 1.75, 2.05, -1.3, -0.1);
    } };
  });
  add('s2', tOur, end('s2'), 'Students build in teams and review each other', () => {
    const st = makeStudio({ backdrop: ['#e6efe9', '#c3d3c8'] });
    room(st, { wall: '#dfe8df' });
    const desk = P.desk(2.4, 0.8, 0.5); place(desk, 0, 0, 0); st.scene.add(desk);
    const studs = [0, 1, 2, 3].map((i) => { const s = P.student(i, ['#2f6fb0', '#c8562a', '#4f7d4a', '#7a4fa0'][i]); at(s, -0.9 + i * 0.6, -0.65, 0); st.scene.add(s.root); return s; });
    const scrs = studs.map((_, i) => P.codeScreen(10 + i));
    const laps = scrs.map((s, i) => { const l = P.laptop(s, { w: 0.36 }); place(l, -0.9 + i * 0.6, 0.525, -0.15, 0); st.scene.add(l); return l; });
    const ok = P.bubble('✓ Looks good!', { w: 0.8, h: 0.24, color: '#ffffff', ink: '#2f7a3a' }); st.scene.add(ok);
    const tRev = W('s2', 'reviewing');
    const cam = camera(30);
    return { scene: st.scene, camera: cam, update(lt) {
      const l = lt - tOur;
      camPath(cam, l, [{ t: 0, pos: [0, 1.25, 4.5], look: [0, 0.75, -0.4] }, { t: 6, pos: [0.3, 1.2, 4.1], look: [0, 0.75, -0.4] }]);
      const rev = lt >= tRev - 0.2;
      studs.forEach((s, i) => s.pose(idle(l, i, { ...type(l, i), headYaw: rev && i === 2 ? 0.6 : rev && i === 1 ? -0.5 : jig(l, i, 0.15) })));
      // student 1 turns the laptop to student 2 for a review
      laps[1].rotation.y = rev ? -0.6 : 0; laps[1].position.x = rev ? -0.15 : -0.3;
      scrs.forEach((s) => s.paint(l));
      pop(ok, lt, tRev + 0.4); place(ok, 0.15, 1.55, -0.6, 0);
    } };
  });

  // ===== s3: The Sustainable Island =====
  const tBuild = W('s3', 'build');
  add('s3', 0, tBuild, 'Three schools on the map, planes fly south', () => {
    const st = makeStudio({ backdrop: ['#e9dcc5', '#cdb894'] });
    st.scene.add(P.sea(16, 10, '#4a86b8'));
    const ice = P.island('iceland', { size: 0.95, color: '#7f9a6a', beach: '#4a4a4e' }); place(ice, -2.0, 0, -1.3); st.scene.add(ice);
    const dk = P.island('denmark', { size: 0.75, color: '#7aa05a', beach: '#d9c08a' }); place(dk, 2.0, 0, -1.4); st.scene.add(dk);
    const gc = P.island('granCanaria', { size: 0.65, color: '#b49a5c', beach: '#e6cc8e' }); place(gc, 0.1, 0, 1.25); st.scene.add(gc);
    st.scene.add(place(P.mountain(0.3, 0.35, { color: '#8a5f3e', snow: null }), 0.12, 0.18, 1.2));
    const flags = [['is', -2.0, -1.35], ['dk', 1.85, -1.5], ['es', 0.25, 1.2]].map(([k, x, z]) => { const f = P.flag(k, 0.55); place(f, x, 0.18, z); st.scene.add(f); return f; });
    const names = [['Tækniskólinn', -2.0, -0.55, '#2f6fb0'], ['TECHCOLLEGE', 2.0, -0.6, '#4f7d4a'], ['I.E.S. El Rincón', 1.45, 1.25, '#c8562a']].map(([t, x, z, c]) => {
      const p = P.plaque(t, { w: 1.3, h: 0.26, d: 0.05, color: c, ink: '#fff6e6' }); place(p, x, 0.3, z); p.rotation.x = -0.35; st.scene.add(p); return p;
    });
    const yr = P.plaque('since 2023', { w: 1.2, h: 0.36, d: 0.08, color: '#f2e6cf' }); st.scene.add(yr);
    const planes = [P.plane('#f3efe6', '#2f6fb0'), P.plane('#f3efe6', '#4f7d4a')]; planes.forEach((p) => st.scene.add(p));
    const wires = planes.map(() => { const r = P.liveRod(0.003); st.scene.add(r); return r; });
    const paths = [[V(-2.0, 0.5, -1.3), V(-1.4, 1.4, 0.0), V(-0.05, 0.55, 1.1)], [V(2.0, 0.5, -1.4), V(1.4, 1.5, 0.0), V(0.25, 0.55, 1.05)]].map((p) => new THREE.QuadraticBezierCurve3(...p));
    const tFly = W('s3', 'fly'), tSince = 0.3;
    const cam = camera(36);
    return { scene: st.scene, camera: cam, update(lt) {
      camPath(cam, lt, [{ t: 0, pos: [0, 4.6, 5.0], look: [0, 0, 0.1] }, { t: tBuild, pos: [0, 4.2, 4.4], look: [0, 0, 0.2] }]);
      pop(yr, lt, tSince); place(yr, 0, 0.35, 0.1); yr.rotation.x = -0.6;
      names.forEach((n, i) => pop(n, lt, 1.2 + i * 0.9));
      flags.forEach((f, i) => { f.userData.cloth.rotation.y = jig(lt, i, 0.15); });
      planes.forEach((p, i) => {
        const k = ease((lt - tFly - i * 0.2) / 3.0);
        const pos = paths[i].getPoint(k), ahead = paths[i].getPoint(Math.min(1, k + 0.02));
        p.position.copy(pos); p.lookAt(ahead); p.rotateY(-Math.PI / 2);
        p.visible = lt >= tFly - 0.6;
        wires[i].visible = p.visible; wires[i].set(pos.clone().add(V(0, 0.07, 0)), V(pos.x, 6, pos.z));
      });
    } };
  });
  add('s3', tBuild, end('s3'), 'A mixed team builds for the UN goals', () => {
    const st = makeStudio({ backdrop: ['#f3e7d3', '#dcc8a6'] });
    room(st, { wall: '#f0e4cf' });
    const wheel = P.sdgWheel(0.42); place(wheel, 0, 1.62, -1.45); st.scene.add(wheel);
    const desk = P.desk(1.8, 0.75, 0.5); place(desk, 0, 0, 0); st.scene.add(desk);
    const scr = P.codeScreen(21, '#ffcf6b'); const lap = P.laptop(scr, { w: 0.5 }); place(lap, 0, 0.525, 0.05); st.scene.add(lap);
    const team = [['#2f6fb0', -0.7], ['#c8562a', 0], ['#4f7d4a', 0.7]].map(([c, x], i) => { const s = P.student(i + 4, c); at(s, x, -0.6, -x * 0.4); st.scene.add(s.root); return s; });
    const tMixed = W('s3', 'mixed');
    const cam = camera(30);
    return { scene: st.scene, camera: cam, update(lt) {
      const l = lt - tBuild;
      camPath(cam, l, [{ t: 0, pos: [0, 1.3, 4.0], look: [0, 0.95, -0.5] }, { t: 5, pos: [0, 1.25, 3.6], look: [0, 0.95, -0.5] }]);
      wheel.rotation.z = -stepOf(l) * 0.02;
      const yay = lt >= tMixed;
      team.forEach((s, i) => s.pose(idle(l, i, yay ? { armL: cheer, armR: cheer, smile: 1, mouth: 0.5, headPitch: 0.15 } : { ...type(l, i), headYaw: (i - 1) * -0.4 })));
      scr.paint(l);
    } };
  });

  // ===== s4: where was that document? =====
  add('s4', 0, end('s4'), 'Three teachers lost in Drive, Teams, Slack, WhatsApp', () => {
    const st = makeStudio({ backdrop: ['#e3e1ea', '#bdb9cc'] });
    room(st, { wall: '#e4e1ea' });
    const desk = P.desk(2.0, 0.8, 0.5); place(desk, 0, 0, 0.1); st.scene.add(desk);
    const people = [['heinz', -0.85, -0.2, 0.35], ['tibu', 0, -0.45, 0], ['smari', 0.85, -0.2, -0.35]].map(([id, x, z, ry]) => { const p = cast(id); at(p, x, z, ry); st.scene.add(p.root); return p; });
    const laps = [-0.8, 0, 0.8].map((x, i) => { const s = P.codeScreen(30 + i); const l = P.laptop(s, { w: 0.36 }); place(l, x, 0.525, 0.15); st.scene.add(l); return l; });
    const words = ['Drive', 'Teams', 'Slack', 'WhatsApp'];
    const cols = ['#f2c14e', '#6a6fd1', '#d14e8a', '#3fae5a'];
    const tags = words.map((w, i) => { const p = P.plaque(w, { w: 0.9, h: 0.26, d: 0.06, color: cols[i], ink: '#ffffff' }); st.scene.add(p); return p; });
    const junk = []; const r = rng(8);
    for (let i = 0; i < 14; i++) { const o = i % 3 === 0 ? P.folder(['#e0b440', '#6a9fd1'][i % 2]) : P.paper(i); st.scene.add(o); junk.push({ o, a: r() * 6.28, rad: 1.1 + r() * 0.6, y: 1.5 + r() * 0.9, sp: 0.6 + r() * 0.5 }); }
    junk.forEach((j) => { j.rod = P.liveRod(0.0025); st.scene.add(j.rod); });
    const q = P.bubble('?', { w: 0.3, h: 0.3, color: '#ffffff', ink: '#c8342b' }); st.scene.add(q);
    const tW = words.map((w) => W('s4', w)), tWhere = W('s4', 'Where');
    const cam = camera(32);
    return { scene: st.scene, camera: cam, update(lt) {
      camPath(cam, lt, [{ t: 0, pos: [0, 1.7, 4.8], look: [0, 1.2, -0.2] }, { t: end('s4'), pos: [0, 1.6, 4.3], look: [0, 1.2, -0.2] }]);
      const chaos = clamp01((lt - tW[0] + 0.6) / 1.5);
      if (lt > tW[0] && lt < tWhere) { cam.position.x += jig(lt, 1, 0.025); cam.position.y += jig(lt, 4, 0.02); }
      junk.forEach((j, i) => {
        const a = j.a + lt * j.sp * chaos;
        const drop = lt > tWhere + 1.0 ? ease((lt - tWhere - 1.0) / 0.5) : 0;
        j.o.position.set(Math.cos(a) * j.rad, lerp(j.y, 0.56 + (i % 4) * 0.02, drop), Math.sin(a) * j.rad * 0.5 - 0.2);
        j.o.rotation.set(a * 0.7, a, a * 0.3);
        j.o.visible = chaos > 0.05;
        j.rod.visible = j.o.visible && drop < 1; j.rod.set(j.o.position.clone(), V(j.o.position.x, 6, j.o.position.z));
      });
      tags.forEach((t, i) => { pop(t, lt, tW[i] - 0.05); const a = i * 1.57 + lt * 0.35; place(t, Math.cos(a) * 1.3, 1.78 + (i % 2) * 0.3, Math.sin(a) * 0.4 - 0.1); t.lookAt(cam.position); });
      const lost = lt >= tWhere;
      people.forEach((p, i) => p.pose(idle(lt, i, lost
        ? { headYaw: Math.sin(stepOf(lt) * 0.35 + i) * 0.7, headPitch: 0.15, smile: -0.4, mouth: i === 1 ? 0.45 : 0, brow: 1, armR: i === 0 ? scratch : ARMS_DOWN.armR, armL: i === 2 ? scratch : ARMS_DOWN.armL }
        : { ...type(lt, i), headYaw: jig(lt, i, 0.35), smile: 0.2, brow: chaos })));
      pop(q, lt, tWhere + 0.3); place(q, 0, 2.15, -0.45);
    } };
  });

  // ===== s5: our own LMS on Isard =====
  const tLives = W('s5', 'lives'), tTibu5 = W('s5', 'Tee-boo'), tEvery = W('s5', 'Every');
  add('s5', 0, tLives, 'Jakub designs it, everyone codes it', () => {
    const st = makeStudio({ backdrop: ['#f1dcc0', '#d9b98e'] });
    room(st, { wall: '#efdcc2' });
    const board = P.slab(1.5, 1.1, 0.06, clay('#2b2f3a', { lump: 0.4 }), 0.05); place(board, -1.55, 1.45, -1.5); st.scene.add(board);
    const cards = [['Team Hub', '#c8562a'], ['Peer review', '#2f6fb0'], ['Groups', '#4f7d4a'], ['Gallery', '#d9a23a']].map(([t, c], i) => { const p = P.plaque(t, { w: 0.62, h: 0.36, d: 0.04, color: c, ink: '#fff6e6' }); place(p, -1.55 + (i % 2 ? 0.34 : -0.34), 1.68 - Math.floor(i / 2) * 0.46, -1.44); st.scene.add(p); return p; });
    const jakub = cast('jakub'); at(jakub, -0.6, -1.0, -0.7); st.scene.add(jakub.root);
    const desk = P.desk(2.1, 0.7, 0.5); place(desk, 1.15, 0, 0.1); st.scene.add(desk);
    const coders = [['smari', 0.5], ['heinz', 1.15], ['tibu', 1.8]].map(([id, x], i) => { const p = cast(id); at(p, x, -0.45, 0); st.scene.add(p.root); return p; });
    const scrs = coders.map((_, i) => P.codeScreen(40 + i));
    scrs.forEach((s, i) => st.scene.add(place(P.laptop(s, { w: 0.36 }), 0.5 + i * 0.65, 0.525, 0.15)));
    const tCoded = W('s5', 'coded'), tDesigned = W('s5', 'designed');
    const cam = camera(32);
    return { scene: st.scene, camera: cam, update(lt) {
      camPath(cam, lt, [{ t: 0, pos: [-0.9, 1.5, 4.2], look: [-1.0, 1.25, -0.8] }, { t: tCoded - 0.3, pos: [-0.8, 1.5, 4.1], look: [-0.9, 1.25, -0.8] }, { t: tCoded + 0.5, pos: [0.3, 1.65, 5.4], look: [0.2, 1.0, -0.4] }]);
      cards.forEach((c, i) => pop(c, lt, tDesigned - 0.3 + i * 0.35));
      jakub.pose(idle(lt, 2, { headYaw: lt > tDesigned + 1.2 ? 0.6 : -0.3, smile: 0.9, armR: lt < tDesigned + 1.4 ? { out: 1.2, fwd: 1.0, elbow: 0.5 + jig(lt, 2, 0.15) } : ARMS_DOWN.armR }));
      coders.forEach((p, i) => p.pose(idle(lt, i + 3, lt > tCoded - 0.2 ? type(lt, i) : { headYaw: -0.5 })));
      scrs.forEach((s) => s.paint(Math.max(0, lt - tCoded + 0.4)));
    } };
  });
  // the school building in Las Palmas as an open dollhouse, the server inside
  function rinconSet(st, { withSign = true } = {}) {
    st.scene.add(skyBoard([[0, '#6fb6e8'], [1, '#d8efff']], { z: -2.8 }));
    const g = new THREE.Group();
    const wall = clay('#f4efe4', { lump: 0.8 });
    g.add(place(P.slab(3.2, 1.6, 0.12, wall, 0.04), 0, 0.8, -1.0));
    g.add(place(P.slab(0.12, 1.6, 2.0, wall, 0.04), -1.6, 0.8, 0));
    g.add(place(P.slab(0.12, 1.6, 2.0, wall, 0.04), 1.6, 0.8, 0));
    const floor = P.mesh(new THREE.BoxGeometry(3.2, 0.05, 2.0), clay('#c9c2b6', { lump: 0.4 }), 0, 0.025, 0); g.add(floor);
    g.add(place(P.slab(3.4, 0.14, 2.2, clay('#d9762f', { lump: 1 }), 0.04), 0, 1.66, 0));
    g.add(place(P.slab(1.0, 0.1, 0.06, clay('#2f6fb0', { lump: 0.5 }), 0.03), 0.8, 1.2, -0.93));
    if (withSign) { // blue school sign with a white swoosh, like the one at the entrance
      const sg = new THREE.Group();
      sg.add(P.slab(0.9, 0.9, 0.06, clay('#2a4fa8', { lump: 0.4 }), 0.04));
      const sw = clay('#e9eef7', { lump: 0.3 });
      sg.add(P.snake([V(-0.05, -0.3, 0.04), V(-0.12, 0.0, 0.04), V(0.05, 0.22, 0.04), V(0.3, 0.32, 0.04)], 0.035, sw, 20));
      sg.add(P.snake([V(-0.3, 0.1, 0.04), V(-0.05, 0.02, 0.04), V(0.2, 0.08, 0.04)], 0.03, sw, 16));
      const lbl = P.plaque(['I.E.S.', 'El Rincón'], { w: 0.42, h: 0.22, d: 0.02, color: '#2a4fa8', ink: '#f2f5fb', weight: 600 }); place(lbl, 0.2, -0.3, 0.04); sg.add(lbl);
      place(sg, -0.9, 1.0, -0.9); g.add(sg);
    }
    shadowAll(g); st.scene.add(g);
    [[-2.1, 0.6, 1], [2.15, 0.4, 2], [2.5, -0.6, 3]].forEach(([x, z, s]) => st.scene.add(place(P.palm(0.95, s), x, 0, z)));
    const sv = P.server(); place(sv, 0.6, 0.05, -0.55); st.scene.add(sv);
    const inside = new THREE.PointLight('#fff0dc', 7, 5); inside.position.set(0.3, 1.35, 0.8); st.scene.add(inside);
    const sun = P.sun(0.25); place(sun, 2.4, 2.7, -2.0); st.scene.add(sun, P.rod(V(2.4, 2.45, -2.0), V(2.4, 6, -2.0)));
    return { server: sv, sun };
  }
  add('s5', tLives, tTibu5, 'The Isard server at El Rincón', () => {
    const st = makeStudio({ backdrop: ['#bfe2f7', '#8fc6e8'], keyColor: '#fff1d6' });
    const { server } = rinconSet(st);
    const tag = P.plaque('Isard server', { w: 1.0, h: 0.26, d: 0.05, color: '#f2e6cf' }); st.scene.add(tag);
    const tIsard = W('s5', 'Ee-sard');
    const cam = camera(34);
    return { scene: st.scene, camera: cam, update(lt) {
      const l = lt - tLives;
      camPath(cam, l, [{ t: 0, pos: [0, 1.7, 6.4], look: [0, 0.9, -0.4] }, { t: tTibu5 - tLives, pos: [0.4, 1.3, 4.0], look: [0.5, 0.7, -0.5] }]);
      server.userData.leds.forEach((d, i) => { d.visible = (stepOf(lt) + i * 3) % 7 !== 0; });
      pop(tag, lt, tIsard + 0.2); place(tag, 0.6, 1.25, -0.3);
    } };
  });
  add('s5', tTibu5, tEvery, 'Tibu and Alberto keep it running', () => {
    const st = makeStudio({ backdrop: ['#bfe2f7', '#8fc6e8'], keyColor: '#fff1d6' });
    const { server } = rinconSet(st, { withSign: false });
    const tibu = cast('tibu'); at(tibu, -0.25, -0.2, 0.35); st.scene.add(tibu.root);
    const alberto = cast('alberto'); at(alberto, 1.35, -0.3, -0.5); st.scene.add(alberto.root);
    const scr = P.codeScreen(55, '#7ee0a1'); const lap = P.laptop(scr, { w: 0.34 }); holdOnHips(tibu, lap, 0, 0.42, 0.33); lap.rotation.x = 0.1;
    const cable = new THREE.Group(); st.scene.add(cable);
    const tAl = W('s5', 'Alberto'), tRun = W('s5', 'running');
    const cam = camera(30);
    return { scene: st.scene, camera: cam, update(lt) {
      const l = lt - tTibu5;
      camPath(cam, l, [{ t: 0, pos: [0.55, 1.35, 3.9], look: [0.55, 0.95, -0.4] }, { t: 4, pos: [0.55, 1.3, 3.6], look: [0.55, 0.95, -0.4] }]);
      const ok = lt >= tRun;
      tibu.pose(idle(l, 1, ok ? { armL: thumbs, armR: hold, smile: 0.95, headYaw: 0.2 } : { armL: hold, armR: hold, headPitch: -0.25, look: { x: 0, y: -0.6 } }));
      alberto.pose(idle(l, 2, ok ? { armR: thumbs, smile: 0.95, headYaw: -0.3 } : { armR: { out: 0.6, fwd: 1.2, elbow: 0.4 }, headYaw: -0.6 }));
      scr.paint(l);
      const hand = new THREE.Vector3(); alberto.rig.arms[0].hand.getWorldPosition(hand);
      P.refill(cable, P.snake([V(0.75, 0.6, -0.3), V(0.95, 0.35, -0.1), hand.clone().add(V(0, -0.05, 0))], 0.012, clay('#d14e3a', { lump: 0.3 }), 16));
      server.userData.leds.forEach((d, i) => { d.visible = ok ? true : (stepOf(lt) + i) % 3 !== 0; });
    } };
  });
  add('s5', tEvery, end('s5'), 'Merge to main and it deploys itself', () => {
    const st = makeStudio({ backdrop: ['#e6efe9', '#c3d3c8'] });
    room(st, { wall: '#e2ebe3' });
    const belt = P.conveyor(2.6); place(belt, 0, 0, 0); st.scene.add(belt);
    const sv = P.server(); place(sv, 1.75, 0, -0.1, -0.35); st.scene.add(sv);
    const smari = cast('smari'); at(smari, -1.75, -0.25, 0.45); st.scene.add(smari.root);
    const desk = P.desk(0.7, 0.55, 0.5); place(desk, -1.4, 0, 0.25); st.scene.add(desk);
    const scr = P.screenTex((g, w, h, t) => { g.fillStyle = '#1e2230'; g.fillRect(0, 0, w, h); g.fillStyle = '#7ee0a1'; g.font = `600 44px ${P.FONT}`; g.fillText('git merge', 40, 120); if (t > 0.6) { g.fillStyle = '#ffcf6b'; g.fillText('→ main ✓', 40, 200); } });
    st.scene.add(place(P.laptop(scr, { w: 0.36 }), -1.4, 0.525, 0.25, 0.6));
    const box = P.parcel('main'); st.scene.add(box);
    const url = P.plaque(['sustainable-island', '.ieselrincon.es  ✓'], { w: 1.9, h: 0.5, d: 0.07, color: '#2f7a3a', ink: '#f4fff2', weight: 600 }); st.scene.add(url);
    const tMain = W('s5', 'main'), tDep = W('s5', 'deploys');
    const cam = camera(32);
    return { scene: st.scene, camera: cam, update(lt) {
      const l = lt - tEvery;
      camPath(cam, l, [{ t: 0, pos: [0, 1.6, 5.6], look: [0, 0.7, 0] }, { t: 4, pos: [0.1, 1.55, 5.2], look: [0, 0.7, 0] }]);
      scr.paint(lt - tMain);
      const k = ease((lt - tMain) / Math.max(0.5, tDep - tMain + 0.5));
      box.visible = lt >= tMain - 0.4 && k < 0.98;
      place(box, lerp(-1.1, 1.45, k), 0.255, 0);
      belt.userData.belt.offset.x = -stepOf(lt) * 0.06;
      const live = lt >= tDep + 0.3;
      sv.userData.leds.forEach((d, i) => { d.visible = live ? (stepOf(lt) + i) % 2 === 0 : true; });
      pop(url, lt, tDep + 0.4); place(url, 0.6, 1.55, -0.5);
      smari.pose(idle(l, 1, live ? { armL: cheer, armR: cheer, smile: 1, mouth: 0.5 } : { ...type(l, 1), headYaw: 0.5 }));
    } };
  });

  // ===== s6: Tibu's GitHub guide =====
  const tIssue = W('s6', 'Issue'), tHeinz = W('s6', 'Heinz');
  function booklet() {
    const g = new THREE.Group();
    g.add(P.slab(0.42, 0.56, 0.05, clay('#2a4fa8', { lump: 0.4 }), 0.03));
    const t = P.plaque(['Git', 'step by step', '21 steps'], { w: 0.34, h: 0.42, d: 0.02, color: '#2a4fa8', ink: '#f6f2e8' }); t.position.z = 0.03; g.add(t);
    return shadowAll(g);
  }
  add('s6', 0, tIssue, 'Tibu shows his Git step-by-step guide', () => {
    const st = makeStudio({ backdrop: ['#f0d6cf', '#d6aea2'] });
    room(st, { wall: '#efd8cf' });
    const tibu = cast('tibu'); at(tibu, 0, -0.3, 0); st.scene.add(tibu.root);
    const bk = booklet(); holdOnHips(tibu, bk, 0, 0.5, 0.42); bk.rotation.x = -0.15;
    const cam = camera(26);
    return { scene: st.scene, camera: cam, update(lt) {
      camPath(cam, lt, [{ t: 0, pos: [0.25, 1.35, 3.6], look: [0, 1.05, 0] }, { t: tIssue, pos: [0.2, 1.3, 3.1], look: [0, 1.0, 0] }]);
      tibu.pose(idle(lt, 1, { armL: hold, armR: hold, smile: 0.95, headTilt: jig(lt, 2, 0.06) }));
      bk.position.y = 0.5 + (stepOf(lt) % 12 < 2 ? 0.03 : 0);
    } };
  });
  add('s6', tIssue, tHeinz, 'Issue, branch, pull request, review, merge', () => {
    const st = makeStudio({ backdrop: ['#e3e1ea', '#bdb9cc'] });
    const mainM = clay('#2f6fb0', { lump: 0.6 }), brM = clay('#c8562a', { lump: 0.6 });
    const mainPts = Array.from({ length: 9 }, (_, i) => V(-2.4 + i * 0.6, 0.06, 0));
    const brPts = [V(-0.6, 0.06, 0), V(-0.25, 0.06, -0.55), V(0.35, 0.06, -0.75), V(0.95, 0.06, -0.55), V(1.2, 0.06, 0)];
    const mainLine = new THREE.Group(), brLine = new THREE.Group(); st.scene.add(mainLine, brLine);
    const commits = mainPts.map((p) => { const b = P.ball(0.09, mainM, p.x, 0.09, p.z, 20); st.scene.add(b); return b; });
    const brCommits = [brPts[1], brPts[2], brPts[3]].map((p) => { const b = P.ball(0.085, brM, p.x, 0.09, p.z, 20); st.scene.add(b); return b; });
    const mergeBall = P.ball(0.13, clay('#7a4fa0', { lump: 0.6 }), 1.2, 0.12, 0, 24); st.scene.add(mergeBall);
    const labels = [['issue #28', '#f2e6cf', V(-0.6, 0.65, -0.15)], ['branch', '#c8562a', V(-0.15, 0.65, -0.75)], ['pull request', '#d9a23a', V(0.6, 0.85, -0.85)], ['review ✓', '#2f7a3a', V(1.05, 0.65, -0.45)], ['merge', '#7a4fa0', V(1.45, 0.6, 0.25)]]
      .map(([t, c, p]) => { const pl = P.plaque(t, { w: 0.85, h: 0.24, d: 0.05, color: c, ink: c === '#f2e6cf' ? '#2b2118' : '#fff8ec' }); pl.position.copy(p); st.scene.add(pl, P.rod(V(p.x, 0, p.z - 0.04), V(p.x, p.y - 0.12, p.z - 0.04), 0.005)); return pl; });
    const ts = ['Issue', 'branch', 'pull', 'review', 'merge'].map((w) => W('s6', w));
    const cam = camera(32);
    const growTube = (grp, pts, k, mat) => { P.refill(grp); if (k <= 0) return; const c = new THREE.CatmullRomCurve3(pts); const sub = c.getPoints(40).slice(0, Math.max(2, Math.round(40 * k) + 1)); grp.add(P.snake(sub, 0.04, mat, 40)); };
    return { scene: st.scene, camera: cam, update(lt) {
      const l = lt - tIssue;
      camPath(cam, l, [{ t: 0, pos: [-0.3, 2.3, 4.0], look: [-0.1, 0.2, -0.2] }, { t: tHeinz - tIssue, pos: [0.2, 2.1, 3.6], look: [0.1, 0.2, -0.3] }]);
      growTube(mainLine, mainPts, clamp01(0.45 + l * 0.12), mainM);
      commits.forEach((c, i) => { c.visible = i / (mainPts.length - 1) <= clamp01(0.45 + l * 0.12) + 0.01; });
      growTube(brLine, brPts, clamp01((lt - ts[1] + 0.1) / ((ts[4] - ts[1]) || 1)), brM);
      brCommits.forEach((c, i) => pop(c, lt, ts[1] + 0.25 + i * ((ts[3] - ts[1]) / 3)));
      labels.forEach((p, i) => { pop(p, lt, ts[i] - 0.05); p.lookAt(cam.position); });
      pop(mergeBall, lt, ts[4] + 0.15);
    } };
  });
  add('s6', tHeinz, end('s6'), 'Heinz teaches it in Denmark, we teach it in Iceland', () => {
    const st = makeStudio({ backdrop: ['#efe2bd', '#d3bf86'] });
    room(st, { wall: '#ece0c2' });
    const divider = P.slab(0.08, 1.2, 1.4, clay('#c9b48a', { lump: 0.5 }), 0.03); place(divider, 0, 0.6, -0.6); st.scene.add(divider);
    const heinz = cast('heinz'); at(heinz, -1.4, -0.4, 0.25); st.scene.add(heinz.root);
    const fdk = P.flag('dk', 0.9); place(fdk, -2.2, 0, -0.6); st.scene.add(fdk);
    const smari = cast('smari'); at(smari, 0.9, -0.4, -0.15); st.scene.add(smari.root);
    const jakub = cast('jakub'); at(jakub, 1.7, -0.5, -0.35); st.scene.add(jakub.root);
    const fis = P.flag('is', 0.9); place(fis, 2.4, 0, -0.7); st.scene.add(fis);
    const books = [heinz, smari].map((p) => { const b = booklet(); holdOnHips(p, b, 0, 0.5, 0.4); b.scale.setScalar(0.85); return b; });
    const lblDK = P.plaque('Aalborg', { w: 0.8, h: 0.22, d: 0.05, color: '#c8102e', ink: '#ffffff' }); st.scene.add(lblDK);
    const lblIS = P.plaque('Reykjavík', { w: 0.9, h: 0.22, d: 0.05, color: '#02529c', ink: '#ffffff' }); st.scene.add(lblIS);
    const tWe = W('s6', 'we');
    const cam = camera(34);
    return { scene: st.scene, camera: cam, update(lt) {
      const l = lt - tHeinz;
      camPath(cam, l, [{ t: 0, pos: [-1.2, 1.5, 4.0], look: [-1.3, 1.0, -0.3] }, { t: tWe - tHeinz - 0.5, pos: [-1.1, 1.5, 3.9], look: [-1.2, 1.0, -0.3] }, { t: tWe - tHeinz + 0.5, pos: [0.3, 1.7, 5.4], look: [0.2, 0.95, -0.3] }]);
      heinz.pose(idle(l, 1, { armL: hold, armR: { out: 1.0, fwd: 0.9, elbow: 0.6 + jig(l, 2, 0.2) }, smile: 0.8, headYaw: jig(l, 1, 0.3) }));
      const ours = lt >= tWe - 0.3;
      smari.pose(idle(l, 2, ours ? { armL: hold, armR: hold, smile: 0.9 } : {}));
      jakub.pose(idle(l, 3, ours ? { armR: thumbs, smile: 1 } : {}));
      [fdk, fis].forEach((f, i) => { f.userData.cloth.rotation.y = jig(l, i, 0.15); });
      pop(lblDK, lt, tHeinz + 0.3); place(lblDK, -1.4, 2.05, -1.2);
      pop(lblIS, lt, tWe); place(lblIS, 1.3, 2.05, -1.2);
    } };
  });

  // ===== s7: what you gave us =====
  const tAnd7 = W('s7', 'And');
  add('s7', 0, tAnd7, 'Great teachers: a toast in Las Palmas', () => {
    const st = makeStudio({ backdrop: ['#2a2440', '#3a3050'], keyColor: '#ffc98a' });
    st.scene.add(skyBoard([[0, '#1d1a33'], [1, '#4a3a5a']], { z: -2.6 }));
    const desk = P.desk(3.0, 0.8, 0.5, '#8a5f3e'); place(desk, 0, 0, 0.25); st.scene.add(desk);
    // café umbrella and a string of warm bulbs
    const umb = new THREE.Group();
    umb.add(P.mesh(new THREE.ConeGeometry(1.6, 0.35, 8, 1, true), clay('#f3ede2', { lump: 0.6, side: THREE.DoubleSide }), 0, 2.45, 0));
    umb.add(P.mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.3, 8), clay('#9a9a9a', { lump: 0.2 }), 0, 1.2, 0));
    place(umb, 0.3, 0, -1.15); st.scene.add(shadowAll(umb));
    for (let i = 0; i < 11; i++) { const x = -2.6 + i * 0.52; st.scene.add(P.ball(0.045, glow('#ffd58a', 2), x, 2.75 - Math.sin((i / 10) * Math.PI) * 0.35, -1.3, 10)); }
    const lamp = new THREE.PointLight('#ffb870', 10, 5); lamp.position.set(0, 2.0, 0.6); st.scene.add(lamp);
    const ids = [['tibu', -1.55, -0.2, 0.55], ['jakub', -0.78, -0.5, 0.25], ['smari', 0, -0.6, 0], ['heinz', 0.78, -0.5, -0.25], ['alberto', 1.55, -0.2, -0.55]];
    const ppl = ids.map(([id, x, z, ry]) => { const p = cast(id, id === 'heinz' ? 'heinzCanaria' : undefined); at(p, x, z, ry); st.scene.add(p.root); return p; });
    const mugs = ppl.map((p) => { const m = P.mug(); p.rig.arms[0].hand.add(m); m.position.set(0, -0.07, 0.04); m.rotation.x = -1.2; return m; });
    const tToast = W('s7', 'great');
    const cam = camera(30);
    return { scene: st.scene, camera: cam, update(lt) {
      camPath(cam, lt, [{ t: 0, pos: [0.2, 1.6, 5.2], look: [0, 1.1, -0.3] }, { t: tAnd7, pos: [0.1, 1.55, 4.8], look: [0, 1.1, -0.3] }]);
      const up = lt >= tToast - 0.4;
      ppl.forEach((p, i) => p.pose(idle(lt, i, { armR: up ? { out: 0.45, fwd: 2.05, elbow: 0.35 } : { out: 0.3, fwd: 0.9, elbow: 0.9 }, smile: up ? 1 : 0.7, mouth: up && (stepOf(lt) + i) % 6 < 3 ? 0.45 : 0, headPitch: up ? 0.1 : 0 })));
    } };
  });
  function polaroidTex(seed, bg) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 220; const g = c.getContext('2d'); const r = rng(seed);
    const gr = g.createLinearGradient(0, 0, 0, 220); gr.addColorStop(0, bg[0]); gr.addColorStop(1, bg[1]); g.fillStyle = gr; g.fillRect(0, 0, 256, 220);
    const team = ['#2f6fb0', '#c8562a', '#4f7d4a'];
    for (let i = 0; i < 5; i++) {
      const x = 30 + i * 48 + r() * 8, y = 120 + r() * 20;
      g.fillStyle = team[(i + seed) % 3]; g.beginPath(); g.ellipse(x, y + 60, 20, 42, 0, 0, 7); g.fill();
      g.fillStyle = ['#f1c5a8', '#e0a985', '#c98b62', '#eab79a'][(i + seed) % 4]; g.beginPath(); g.arc(x, y, 17, 0, 7); g.fill();
      g.fillStyle = ['#2a1d16', '#b8743e', '#4a2e1c', '#d9b88a'][(i * 3 + seed) % 4]; g.beginPath(); g.arc(x, y - 6, 17, Math.PI, 0); g.fill();
      g.fillStyle = '#222'; g.fillRect(x - 6, y - 2, 3, 3); g.fillRect(x + 4, y - 2, 3, 3);
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  add('s7', tAnd7, end('s7'), 'Good memories with students who have graduated', () => {
    const st = makeStudio({ backdrop: ['#f1dcc0', '#d9b98e'] });
    const cork = P.slab(3.6, 1.9, 0.08, clay('#b98a55', { lump: 1.4 }), 0.06); place(cork, 0, 1.5, -1.3); st.scene.add(cork);
    const bgs = [['#7fc3ee', '#f2d79a'], ['#efe3cf', '#c9b48a'], ['#2a3a6a', '#7a5a8a'], ['#9ad0a0', '#e9e0b0'], ['#f0b98a', '#f6e0c0'], ['#bcd6f0', '#ffffff']];
    const pols = bgs.map((bg, i) => {
      const g = new THREE.Group();
      g.add(P.slab(0.62, 0.66, 0.03, clay('#fbf8f1', { lump: 0.3 }), 0.02));
      g.add(P.mesh(new THREE.PlaneGeometry(0.52, 0.45), new THREE.MeshStandardMaterial({ map: polaroidTex(i + 1, bg), roughness: 0.6 }), 0, 0.05, 0.017));
      g.add(P.ball(0.025, clay(['#d14e3a', '#3f7fb0', '#e0b440'][i % 3]), 0, 0.29, 0.03, 10));
      place(g, -1.25 + (i % 3) * 1.25, 1.95 - Math.floor(i / 3) * 0.8, -1.2); g.rotation.z = (rng(i + 9)() - 0.5) * 0.25;
      shadowAll(g); st.scene.add(g); return g;
    });
    const years = ['2024', '2025', '2026'].map((y, i) => { const p = P.plaque(y, { w: 0.42, h: 0.17, d: 0.03, color: '#f2e6cf', weight: 600 }); place(p, -1.25 + i * 1.25, 0.35, -1.18); st.scene.add(p); return p; });
    const caps = [0, 1, 2, 3, 4].map((i) => { const c = P.gradCap(); st.scene.add(c); return c; });
    const capRods = caps.map(() => { const r = P.liveRod(0.003); st.scene.add(r); return r; });
    const tMem = W('s7', 'memories'), tGrad = W('s7', 'graduated');
    const cam = camera(32);
    return { scene: st.scene, camera: cam, update(lt) {
      const l = lt - tAnd7;
      camPath(cam, l, [{ t: 0, pos: [0, 1.5, 4.8], look: [0, 1.4, -1] }, { t: end('s7') - tAnd7, pos: [0, 1.45, 4.3], look: [0, 1.35, -1] }]);
      pols.forEach((p, i) => pop(p, lt, tMem - 0.2 + i * 0.42));
      years.forEach((y, i) => pop(y, lt, tMem + 0.6 + i * 0.6));
      caps.forEach((c, i) => {
        const k = clamp01((lt - tGrad + 0.1 - i * 0.08) / 1.2);
        c.visible = k > 0;
        const y = 0.1 + Math.sin(k * Math.PI * 0.85) * 1.8 + k * 0.2;
        place(c, -1.6 + i * 0.8, y, 0.6 + (i % 2) * 0.3, k * 6 + i);
        c.rotation.x = k * 2 + i;
        capRods[i].visible = c.visible; capRods[i].set(c.position.clone(), V(c.position.x, 6, c.position.z));
      });
    } };
  });

  // ===== s8: gracias =====
  const tCard = +(sc.s8.voiceAt + sc.s8.voiceDur - sc.s8.start + 1.1).toFixed(3);
  add('s8', 0, tCard, 'Everyone waves: ¡Gracias, El Rincón!', () => {
    const st = makeStudio({ backdrop: ['#f3e7d3', '#dcc8a6'] });
    st.scene.add(skyBoard([[0, '#16213f'], [0.45, '#2c3c66'], [0.55, '#f2b183'], [1, '#ffd9a0']], { horizontal: true, w: 16, h: 7, z: -3.4, y: 3 }));
    st.scene.add(P.sea(16, 3.5, '#3d7fb4')).children;
    const seaM = st.scene.children[st.scene.children.length - 1]; seaM.position.z = -2.0;
    const ice = P.island('iceland', { size: 0.9, color: '#7f9a6a', beach: '#4a4a4e' }); place(ice, -2.7, 0, -2.2); st.scene.add(ice);
    const gc = P.island('granCanaria', { size: 0.7, color: '#b49a5c', beach: '#e6cc8e' }); place(gc, 2.8, 0, -2.2); st.scene.add(gc);
    st.scene.add(place(P.mountain(0.35, 0.4, { color: '#8a5f3e', snow: null }), 2.8, 0.18, -2.25));
    st.scene.add(place(P.mountain(0.3, 0.38, { color: '#5f5d58' }), -2.6, 0.18, -2.25));
    const order = ['heinz', 'tibu', 'smari', 'jakub', 'alberto'];
    const ppl = order.map((id, i) => { const p = cast(id); at(p, -1.6 + i * 0.8, -0.2 + Math.abs(i - 2) * -0.15, (2 - i) * 0.12); st.scene.add(p.root); return p; });
    const big = P.plaque('¡Gracias, El Rincón!', { w: 3.6, h: 0.62, d: 0.12, color: '#c8562a', ink: '#fff6e6' });
    const small = P.plaque('Welcome to Tækniskólinn', { w: 2.6, h: 0.34, d: 0.08, color: '#2f6fb0', ink: '#f2f5fb', weight: 600 });
    st.scene.add(big, small);
    const rods = [P.liveRod(0.004).set(V(-1.4, 2.8, -0.95), V(-1.4, 6, -0.95)), P.liveRod(0.004).set(V(1.4, 2.8, -0.95), V(1.4, 6, -0.95))]; rods.forEach((r) => st.scene.add(r));
    const tGr = W('s8', 'grah-see-as'), tWel = W('s8', 'welcome');
    const cam = camera(34);
    return { scene: st.scene, camera: cam, update(lt) {
      camPath(cam, lt, [{ t: 0, pos: [0, 1.9, 6.4], look: [0, 1.25, -0.5] }, { t: tCard, pos: [0, 1.85, 5.9], look: [0, 1.25, -0.5] }]);
      const waving = lt >= tGr - 0.3;
      ppl.forEach((p, i) => p.pose(idle(lt, i, waving ? { armR: i % 2 ? waveR(lt, i) : ARMS_DOWN.armR, armL: i % 2 ? ARMS_DOWN.armL : waveL(lt, i), smile: 1, mouth: (stepOf(lt) + i * 2) % 8 < 3 ? 0.4 : 0 } : {})));
      pop(big, lt, tGr - 0.1); place(big, 0, 2.55, -0.9);
      pop(small, lt, tWel - 0.1); place(small, 0, 2.0, -0.85);
      rods.forEach((r) => { r.visible = big.visible; });
    } };
  });

  add('s8', tCard, end('s8'), 'Erasmus+ end card', () => {
    const st = makeStudio({ backdrop: ['#f3e7d3', '#dcc8a6'] });
    room(st, { wall: '#f1e6d2' });
    const card = new THREE.Group();
    const emb = P.slab(0.9, 0.6, 0.06, clay('#003399', { lump: 0.3 }), 0.03); card.add(emb);
    const face = P.mesh(new THREE.PlaneGeometry(0.86, 0.58), new THREE.MeshPhysicalMaterial({ map: P.flagTex('eu'), roughness: 0.75 }), 0, 0, 0.032); card.add(face);
    const co = P.plaque(['Co-funded by', 'the European Union'], { w: 1.5, h: 0.6, d: 0.05, color: '#f8f3ea', ink: '#003399', weight: 600 }); place(co, 1.25, 0, 0); card.add(co);
    place(card, -0.55, 1.75, -1.4); st.scene.add(card);
    const er = P.plaque('Erasmus+  ·  The Sustainable Island', { w: 2.9, h: 0.32, d: 0.06, color: '#2f6fb0', ink: '#f8f3ea', weight: 600 }); st.scene.add(er);
    const schools = [['I.E.S. El Rincón', '#c8562a'], ['Tækniskólinn', '#2f6fb0'], ['TECHCOLLEGE', '#4f7d4a']].map(([t, c], i) => {
      const p = P.plaque(t, { w: 1.15, h: 0.24, d: 0.05, color: c, ink: '#fff6e6', weight: 600 }); st.scene.add(p); return p;
    });
    const cam = camera(30);
    return { scene: st.scene, camera: cam, update(lt) {
      const l = lt - tCard;
      camPath(cam, l, [{ t: 0, pos: [0, 1.4, 4.4], look: [0, 1.25, -1.2] }, { t: 6, pos: [0, 1.4, 4.2], look: [0, 1.25, -1.2] }]);
      pop(card, lt, tCard + 0.15);
      pop(er, lt, tCard + 0.6); place(er, 0, 1.12, -1.35);
      schools.forEach((p, i) => { pop(p, lt, tCard + 1.0 + i * 0.25); place(p, -1.3 + i * 1.3, 0.68, -1.3); });
    } };
  });

  return shots;
}

// ---------- director: picks the shot for a time and renders the pose ----------
export function createDirector(renderer, tl) {
  const shots = shotList(tl);
  const shotAt = (t) => { let s = shots[0]; for (const x of shots) if (x.start <= t + 1e-6) s = x; return s; };
  return {
    shots,
    shotAt,
    prepare(shot) { if (!shot.inst) shot.inst = shot.build(); return shot.inst; },
    render(t, { onlyShot } = {}) {
      const shot = onlyShot || shotAt(t);
      const inst = this.prepare(shot);
      const ts = Math.floor(t * POSES_PER_SEC + 1e-6) / POSES_PER_SEC; // stepped: shot on twos
      const sc = tl.scenes.find((s) => s.id === shot.scene);
      inst.update(ts - sc.start);
      renderer.render(inst.scene, inst.camera);
      return shot;
    },
  };
}

// subtitle chunks: sentences of the scene text, timed proportionally and snapped to word starts
export function captions(tl) {
  const out = [];
  for (const s of tl.scenes) {
    const safe = s.text.replace(/I\.E\.S\./g, 'I·E·S·');
    let sentences = safe.match(/[^.!?]+[.!?]*\s*/g).map((x) => x.trim().replace(/I·E·S·/g, 'I.E.S.')).filter(Boolean);
    // long sentences break at the comma nearest the middle, so a caption never runs past two lines
    sentences = sentences.flatMap((x) => {
      if (x.length <= 80) return [x];
      const commas = [...x.matchAll(/, /g)].map((m) => m.index);
      if (!commas.length) return [x];
      const cut = commas.reduce((b, c) => Math.abs(c - x.length / 2) < Math.abs(b - x.length / 2) ? c : b);
      return [x.slice(0, cut + 1), x.slice(cut + 2)];
    });
    const total = sentences.join(' ').length;
    let acc = 0;
    const starts = s.words.map((w) => w.t);
    sentences.forEach((txt, i) => {
      const raw = s.voiceAt + s.voiceDur * (acc / total);
      const snap = starts.reduce((b, x) => Math.abs(x - raw) < Math.abs(b - raw) ? x : b, starts[0]);
      out.push({ text: txt, start: i === 0 ? s.voiceAt : snap });
      acc += txt.length + 1;
    });
  }
  out.forEach((c, i) => { c.end = i + 1 < out.length ? Math.min(out[i + 1].start, c.start + 7) : c.start + 4; });
  // don't run past the end of the scene's voice
  return out;
}
