const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const baseDir = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(baseDir, 'js', 'bundle.js'), 'utf8');

function setupDom(initialHash = '#/digits', initialLang = 'en') {
  const dom = new JSDOM(html.replace('<script src="js/bundle.js"></script>', ''), {
    url: `http://localhost:8000/${initialHash}`,
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });
  const { window } = dom;

  if (initialLang) {
    window.localStorage.setItem('swiat-pamieci:v1', JSON.stringify({ lang: initialLang }));
  }

  window.AudioContext = class {
    constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
    createOscillator() { return { type: '', frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return { connect() {} }; }, start() {}, stop() {} }; }
    createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return this; } }; }
  };
  window.webkitAudioContext = window.AudioContext;
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.scrollTo = () => {};
  window.Element.prototype.animate = () => ({ finished: Promise.resolve(), cancel: () => {}, play: () => {}, pause: () => {} });

  window.eval(js);
  return dom;
}

async function run() {
  const dom = setupDom('#/digits', 'en');
  const { window } = dom;
  await new Promise(r => setTimeout(r, 400));

  const main = window.document.querySelector('#app');
  console.log('--- RENDERED TEXT IN #/digits ---');
  console.log(main ? main.textContent : 'No #app');
  
  const bubble = window.document.querySelector('.speech-bubble');
  if (bubble) console.log('Mascot bubble:', bubble.textContent);
  process.exit(0);
}

run();
