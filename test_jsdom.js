const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync('C:/Users/Dorian/.gemini/antigravity/scratch/swiat-pamieci/index.html', 'utf8')
  .replace('<script src="js/bundle.js"></script>', '');
const bundle = fs.readFileSync('C:/Users/Dorian/.gemini/antigravity/scratch/swiat-pamieci/js/bundle.js', 'utf8');

const dom = new JSDOM(html, {
  url: 'http://localhost:8080/#/digits/train/1',
  runScripts: 'dangerously',
  pretendToBeVisual: true
});

const { window } = dom;

window.AudioContext = class {
  constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
  createOscillator() { return { type: '', frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return this; }, start() {}, stop() {} }; }
  createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return this; } }; }
};
window.webkitAudioContext = window.AudioContext;
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });

window.addEventListener('error', e => {
  console.error('[WINDOW RUNTIME ERROR]:', e.error || e.message);
});

async function waitFor(fn, desc, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const val = fn();
    if (val) return val;
    await new Promise(r => setTimeout(r, 50));
  }
  throw new Error(`Timeout waiting for ${desc}`);
}

async function runTest() {
  console.log('Evaluating bundle.js...');
  window.eval(bundle);

  const doc = window.document;

  // 1. Intro clicks
  for (let i = 0; i < 3; i++) {
    console.log(`Waiting for intro button ${i}...`);
    const btn = await waitFor(() => doc.querySelector('.controls .btn-primary'), `intro button ${i}`);
    console.log(`Clicking: "${btn.textContent}"`);
    btn.click();
    await new Promise(r => setTimeout(r, 100));
  }

  // 2. Presentation phase - wait for skip button and click it
  console.log('Waiting for skip button in presentation phase...');
  const skipBtn = await waitFor(() => doc.querySelector('.present .btn-ghost'), 'skip button');
  console.log('Clicking skip presentation:', skipBtn.textContent);
  skipBtn.click();

  // 3. Recall phase - wait for keypad
  console.log('Waiting for keypad in recall phase...');
  const keypad = await waitFor(() => doc.querySelector('.keypad'), 'keypad');
  console.log('Keypad appeared!');

  const keys = Array.from(keypad.querySelectorAll('.key'));
  const key2 = keys.find(k => k.textContent.trim() === '2');
  const keyOk = keys.find(k => k.textContent.trim() === '✓');

  console.log('Key "✓" disabled before typing:', keyOk.disabled);
  console.log('Clicking key "2"...');
  key2.click();

  console.log('Slot text content:', doc.querySelector('.slot')?.textContent);
  console.log('Key "✓" disabled after typing 2:', keyOk.disabled);

  console.log('CLICKING CHECKMARK "✓"...');
  keyOk.click();

  console.log('Waiting to see what happens next in controls...');
  try {
    const nextBtn = await waitFor(() => doc.querySelector('.controls .btn-primary'), 'next lesson button', 5000);
    console.log('SUCCESS! Next lesson button appeared:', nextBtn.textContent);
    console.log('Stage stars:', doc.querySelector('.stage .stars')?.innerHTML);
    console.log('Cat speech bubble:', doc.querySelector('.bubble-text')?.textContent);
  } catch(e) {
    console.log('STUCK! Error or timeout waiting for next lesson button:', e.message);
    console.log('Controls HTML:', doc.querySelector('.controls')?.innerHTML);
    console.log('Stage HTML:', doc.querySelector('.stage')?.innerHTML);
    console.log('Keypad visible:', !!doc.querySelector('.keypad'));
    console.log('Cat bubble:', doc.querySelector('.bubble-text')?.textContent);
  }
}

runTest().catch(console.error);
