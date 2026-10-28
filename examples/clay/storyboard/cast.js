// cast.js — the people in the film, as clay puppet specs.
// Sculpted from the io.vefskoli.is hero video and photos the user sent (Oct 2026).
export const CAST = [
  { id: 'smari', n: 1, name: 'Smári', seed: 22, skin: '#ecbb9e', headR: 0.25,
    hair: { style: 'short', color: '#9a6038' }, brow: '#8a5530', beard: { style: 'full', color: '#8e5a36' },
    shirt: { color: '#1f1f22', logo: '( , ) =>' }, shortSleeves: true, trousers: '#2b3240',
    build: { w: 0.27, h: 0.62 } },
  { id: 'jakub', n: 2, name: 'Jakub', seed: 41, skin: '#e9b795', headR: 0.255,
    hair: { style: 'swoop', color: '#3e2b1f' }, brow: '#33241a', beard: { style: 'short', color: '#4a3424' },
    shirt: { color: '#1f1f22', logo: '( , ) =>' }, shortSleeves: true, trousers: '#30343c',
    build: { w: 0.29, h: 0.62, belly: 1.08 }, face: { mouthY: -0.42 } },
  { id: 'tibu', n: 3, name: 'Tibu', seed: 11, skin: '#e2ad8a', headR: 0.255,
    hair: { style: 'short', color: '#241a15' }, brow: '#221812', beard: { style: 'stubble', color: '#2a1e18' },
    glasses: { color: '#a9adb2', thick: 0.0055 },
    shirt: { color: '#f1ece6', pattern: 'gingham', colors: ['#b8343a'] }, collar: '#f1ece6', trousers: '#3a4a68',
    build: { w: 0.28, h: 0.62, belly: 1.05 } },
  { id: 'heinz', n: 4, name: 'Heinz', seed: 44, skin: '#ecb79c', headR: 0.245, headTall: 1.1,
    hair: { style: 'short', color: '#c2a16c' }, brow: '#a98b5c', beard: { style: 'full', color: '#a8957a' },
    shirt: { color: '#1c1c1f' }, shortSleeves: true, trousers: '#2a2e36',
    build: { w: 0.26, h: 0.7, legs: 0.36 } },
  { id: 'alberto', n: 5, name: 'Alberto', seed: 33, skin: '#e7b597', headR: 0.25,
    hair: { style: 'bald', color: '#8d8a86' }, beard: { style: 'stubble', color: '#8d8a86' }, brow: '#6b6660',
    glasses: { color: '#1d1d1d' },
    shirt: { color: '#e9e6df' }, jacket: { color: '#2f6a43' }, trousers: '#2e2f33',
    build: { w: 0.28, h: 0.6, belly: 1.06 } },
];
// alternative outfits for particular scenes
export const OUTFITS = {
  heinzCanaria: { hair: { style: 'short', color: '#c2a16c', cap: '#1d1d1d', capPatch: '#b33a3a' }, shirt: { color: '#1b1b1d', pattern: 'tropical' }, shortSleeves: true },
  smariPolo: { shirt: { color: '#7b9a52', pattern: 'stripes', colors: ['#5e7d3c', '#a9c07c'] }, collar: '#7b9a52' },
};
