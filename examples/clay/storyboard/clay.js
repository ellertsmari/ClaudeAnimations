// clay.js — the plasticine look: lumpy, fingerprinted clay materials that "boil"
// a little on every new pose, stepped time (12 poses/s = shot on twos at 24 fps),
// and a warm tabletop studio. Shared by the casting sheet, the storyboard and the render.
import * as THREE from './vendor/three.module.js';

export { THREE };
export const POSES_PER_SEC = 12;
export const stepOf = (t) => Math.floor(t * POSES_PER_SEC + 1e-6);
export const stepTime = (t) => stepOf(t) / POSES_PER_SEC;

// deterministic rng (mulberry32)
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// one uniform shared by every clay material: changes once per pose
export const BOIL = { value: 0 };
export function setPose(t) {
  const s = stepOf(t);
  BOIL.value = (s % 5) * 3.17; // cycle a handful of shapes like a re-squished puppet
  return s;
}

// ---------- textures (canvas, generated once) ----------
function canvasTex(w, h, draw, { repeat = 1, srgb = false } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 4;
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let _bump;
// fingerprints, thumb smears and tool dents, as a height map
export function clayBump() {
  if (_bump) return _bump;
  _bump = canvasTex(1024, 1024, (g, w, h) => {
    const r = rng(7);
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
    // soft dents
    for (let i = 0; i < 260; i++) {
      const x = r() * w, y = r() * h, rad = 6 + r() * 40;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      const d = r() < 0.6 ? 0 : 255;
      gr.addColorStop(0, `rgba(${d},${d},${d},${0.08 + r() * 0.12})`);
      gr.addColorStop(1, 'rgba(128,128,128,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill();
    }
    // fingerprints: whorls of fine ridges
    for (let i = 0; i < 34; i++) {
      const x = r() * w, y = r() * h, rot = r() * 6.28, sx = 1, sy = 0.65 + r() * 0.3;
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(sx, sy);
      const n = 10 + (r() * 8) | 0;
      for (let k = 1; k <= n; k++) {
        g.strokeStyle = `rgba(${k % 2 ? 70 : 190},${k % 2 ? 70 : 190},${k % 2 ? 70 : 190},${0.16 + r() * 0.1})`;
        g.lineWidth = 1.3;
        g.beginPath();
        const a0 = r() * 1.2, a1 = a0 + 4.2 + r() * 1.6;
        for (let a = a0; a < a1; a += 0.12) {
          const rr = k * 2.6 + Math.sin(a * 3 + k) * 0.6;
          const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
          a === a0 ? g.moveTo(px, py) : g.lineTo(px, py);
        }
        g.stroke();
      }
      g.restore();
    }
    // tool drags
    for (let i = 0; i < 40; i++) {
      const x = r() * w, y = r() * h, len = 30 + r() * 120, ang = r() * 6.28;
      g.strokeStyle = `rgba(90,90,90,${0.12 + r() * 0.1})`; g.lineWidth = 1 + r() * 2.5;
      g.beginPath(); g.moveTo(x, y);
      g.quadraticCurveTo(x + Math.cos(ang + 0.4) * len * 0.5, y + Math.sin(ang + 0.4) * len * 0.5,
        x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      g.stroke();
    }
  }, { repeat: 2 });
  return _bump;
}

let _strands;
// hair: wavy grooves running from the crown down (u = around, v = top to bottom)
export function hairBump() {
  if (_strands) return _strands;
  _strands = canvasTex(1024, 512, (g, w, h) => {
    const r = rng(17);
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 170; i++) {
      const x0 = r() * w, amp = 4 + r() * 10, ph = r() * 6, len = 0.5 + r() * 0.5, y0 = r() * h * 0.3;
      g.strokeStyle = r() < 0.5 ? `rgba(40,40,40,${0.35 + r() * 0.25})` : `rgba(215,215,215,${0.25 + r() * 0.2})`;
      g.lineWidth = 2 + r() * 4;
      g.beginPath();
      for (let y = y0; y < y0 + h * len; y += 6) {
        const x = x0 + Math.sin(y * 0.018 + ph) * amp;
        y === y0 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
    }
  }, { repeat: 1 });
  _strands.repeat.set(3, 1);
  return _strands;
}

let _mottle;
// slight colour unevenness of kneaded clay (multiplies the base colour)
export function clayMottle() {
  if (_mottle) return _mottle;
  _mottle = canvasTex(512, 512, (g, w, h) => {
    const r = rng(11);
    g.fillStyle = '#f4f4f4'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 500; i++) {
      const x = r() * w, y = r() * h, rad = 4 + r() * 30, v = 215 + r() * 40 | 0;
      g.fillStyle = `rgba(${v},${v},${v},0.25)`;
      g.beginPath(); g.ellipse(x, y, rad, rad * (0.4 + r() * 0.6), r() * 3, 0, 7); g.fill();
    }
  }, { repeat: 2, srgb: true });
  return _mottle;
}

// ---------- materials ----------
const NOISE_GLSL = /* glsl */`
uniform float uSeed; uniform float uF1; uniform float uA1; uniform float uA2;
float clayH(vec3 p){ p = fract(p*0.3183099 + .1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float clayN(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(clayH(i), clayH(i+vec3(1,0,0)), f.x), mix(clayH(i+vec3(0,1,0)), clayH(i+vec3(1,1,0)), f.x), f.y),
             mix(mix(clayH(i+vec3(0,0,1)), clayH(i+vec3(1,0,1)), f.x), mix(clayH(i+vec3(0,1,1)), clayH(i+vec3(1,1,1)), f.x), f.y), f.z)*2.0-1.0; }
float clayF(vec3 p){
  return clayN(p*uF1)*uA1 + clayN(p*uF1*2.7 + vec3(7.1))*uA1*0.35
       + clayN(p*uF1*1.9 + vec3(uSeed))*uA2;
}`;

const matCache = new Map();
/**
 * clay(color, opts)
 *   lump:  size of permanent lumps (0 = smooth, 1 = hand-rolled)
 *   boil:  how much the surface shifts between poses
 *   map:   optional colour texture (patterned shirts, faces of props)
 */
export function clay(color, { lump = 1, boil = 1, map = null, rough = 0.82, side = THREE.FrontSide, bump = 1, bumpTex = null, key = '' } = {}) {
  const k = `${color}|${lump}|${boil}|${map ? map.uuid : ''}|${rough}|${side}|${bump}|${bumpTex ? bumpTex.uuid : ''}|${key}`;
  if (matCache.has(k)) return matCache.get(k);
  const m = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: rough,
    metalness: 0,
    map: map || clayMottle(),
    bumpMap: bumpTex || clayBump(),
    bumpScale: 1.6 * bump,
    sheen: 0.35,
    sheenRoughness: 0.7,
    sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.35),
    side,
  });
  const u = { uSeed: BOIL, uF1: { value: 9 }, uA1: { value: 0.006 * lump }, uA2: { value: 0.0022 * boil } };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\n' + NOISE_GLSL)
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
        { vec3 p = position; float e = 0.004; float f0 = clayF(p);
          vec3 gr = vec3(clayF(p+vec3(e,0,0))-f0, clayF(p+vec3(0,e,0))-f0, clayF(p+vec3(0,0,e))-f0)/e;
          vec3 n = normalize(objectNormal);
          objectNormal = normalize(n - (gr - dot(gr,n)*n)); }`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        transformed += normalize(normal) * clayF(position);`);
  };
  m.customProgramCacheKey = () => 'clay1';
  matCache.set(k, m);
  return m;
}

// flat, slightly glossy materials for the bits that are not clay (glass, screen glow)
export function glossy(color, opts = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.25, metalness: 0, clearcoat: 0.6, ...opts });
}
export function glow(color, intensity = 1.2, map = null) {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), map, toneMapped: false });
}

// ---------- studio ----------
export function woodTexture() {
  return canvasTex(1024, 1024, (g, w, h) => {
    const r = rng(3);
    g.fillStyle = '#b07a4a'; g.fillRect(0, 0, w, h);
    const planks = 4;
    for (let p = 0; p < planks; p++) {
      const y0 = p * h / planks, tone = 160 + r() * 30;
      g.fillStyle = `rgb(${tone},${tone * 0.7 | 0},${tone * 0.43 | 0})`;
      g.fillRect(0, y0, w, h / planks);
      for (let i = 0; i < 90; i++) {
        const y = y0 + r() * h / planks, a = 0.05 + r() * 0.12;
        g.strokeStyle = `rgba(90,50,25,${a})`; g.lineWidth = 0.6 + r() * 2;
        g.beginPath(); g.moveTo(0, y);
        for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 3 * r());
        g.stroke();
      }
      g.fillStyle = 'rgba(60,30,15,0.5)'; g.fillRect(0, y0, w, 3);
    }
  }, { repeat: 1, srgb: true });
}

export function paperTexture(top = '#e9dcc5', bottom = '#d8c6a8') {
  return canvasTex(512, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, top); gr.addColorStop(1, bottom);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rng(5);
    for (let i = 0; i < 4000; i++) {
      g.fillStyle = `rgba(${r() < 0.5 ? 0 : 255},${r() < 0.5 ? 0 : 255},0,${0.03 * r()})`;
      g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
    }
  }, { srgb: true });
}

/**
 * A tabletop set: wooden table, a paper sweep behind, warm key + cool fill + rim.
 * Returns { scene, key, fill, rim, table, backdrop }.
 */
export function makeStudio({ backdrop = ['#e9dcc5', '#cdb894'], table = true, keyColor = '#ffe0bd', fog = null } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(backdrop[1]);
  if (fog) scene.fog = new THREE.Fog(fog[0], fog[1], fog[2]);

  const hemi = new THREE.HemisphereLight('#fff4e6', '#5a3c28', 0.55);
  scene.add(hemi);
  const key = new THREE.SpotLight(keyColor, 95, 0, 0.55, 0.6, 2);
  key.position.set(-2.6, 4.2, 4.2);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  key.shadow.radius = 6;
  key.shadow.camera.near = 1; key.shadow.camera.far = 20;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight('#bcd4ff', 0.55);
  fill.position.set(4, 2, 3);
  scene.add(fill);
  const rim = new THREE.DirectionalLight('#fff0dc', 1.1);
  rim.position.set(1.5, 3, -4);
  scene.add(rim);

  let tableMesh = null;
  if (table) {
    const tex = woodTexture(); tex.repeat.set(2, 2);
    tableMesh = new THREE.Mesh(new THREE.PlaneGeometry(30, 30),
      new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.62, clearcoat: 0.15, bumpMap: tex, bumpScale: 0.4 }));
    tableMesh.rotation.x = -Math.PI / 2;
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);
  }
  // paper sweep: floor-to-wall curve
  const sweep = new THREE.Group();
  const pm = new THREE.MeshStandardMaterial({ map: paperTexture(...backdrop), roughness: 0.95, side: THREE.DoubleSide });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), pm);
  wall.position.set(0, 7, -4); wall.receiveShadow = true;
  const curve = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 30, 24, 1, true, Math.PI, Math.PI / 2), pm);
  curve.rotation.z = Math.PI / 2; curve.position.set(0, 1, -3); curve.receiveShadow = true;
  sweep.add(wall, curve);
  scene.add(sweep);

  return { scene, key, fill, rim, hemi, table: tableMesh, backdrop: sweep };
}

export function makeRenderer(canvas, w, h) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1);
  r.setSize(w, h, false);
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  r.outputColorSpace = THREE.SRGBColorSpace;
  return r;
}

// stop-motion light flicker: tiny exposure change per pose
export function flicker(renderer, step, base = 1.05) {
  const r = rng(step * 31 + 1)();
  renderer.toneMappingExposure = base * (0.985 + r * 0.03);
}

// tiny per-pose nudge so puppets never sit perfectly still
export function nudge(obj, step, id, amt = 0.0025) {
  const r = rng(step * 977 + id * 131);
  obj.position.x += (r() - 0.5) * amt;
  obj.position.z += (r() - 0.5) * amt;
  obj.rotation.y += (r() - 0.5) * amt * 2;
}

export function shadowAll(obj) {
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return obj;
}
