const fs = require('fs');

class MockElement {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.classList = {
      _classes: new Set(),
      add(...c) { c.forEach(x => this._classes.add(x)); },
      remove(...c) { c.forEach(x => this._classes.delete(x)); },
      toggle(c, force) {
        if (force === undefined) {
          if (this._classes.has(c)) this._classes.delete(c);
          else this._classes.add(c);
        } else if (force) this._classes.add(c);
        else this._classes.delete(c);
      },
      contains(c) { return this._classes.has(c); }
    };
    this.style = {
      setProperty: (k, v) => { this[k] = v; }
    };
    this.dataset = {};
    this.listeners = {};
    this._disabled = false;
  }
  get disabled() { return this._disabled; }
  set disabled(v) { this._disabled = Boolean(v); }
  setAttribute(k, v) {
    this[k] = v;
    if (k === 'disabled') this._disabled = true;
  }
  removeAttribute(k) {
    delete this[k];
    if (k === 'disabled') this._disabled = false;
  }
  getAttribute(k) { return this[k] || null; }
  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  removeEventListener(event, fn) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(f => f !== fn);
    }
  }
  dispatchEvent(event) {
    const list = this.listeners[event.type] || [];
    for (const fn of list) fn(event);
  }
  click() {
    console.log(`[CLICK on ${this.tagName} class="${Array.from(this.classList._classes).join(' ')}" disabled=${this.disabled}]`);
    if (this.disabled) {
      console.log('-> Button is DISABLED, click ignored by browser');
      return;
    }
    this.dispatchEvent({ type: 'click', target: this });
  }
  append(...kids) {
    for (const k of kids.flat(Infinity)) {
      if (k) this.children.push(k);
    }
  }
  appendChild(c) { this.children.push(c); return c; }
  replaceChildren(...kids) {
    this.children = [];
    this.append(...kids);
  }
  querySelector(sel) {
    return this.querySelectorAll(sel)[0] || null;
  }
  querySelectorAll(sel) {
    const res = [];
    const check = (node) => {
      if (!node || typeof node !== 'object') return;
      if (sel === 'svg' && node.tagName === 'SVG') res.push(node);
      else if (sel.startsWith('.') && node.classList && node.classList.contains(sel.slice(1))) res.push(node);
      else if (sel.startsWith('#') && node.id === sel.slice(1)) res.push(node);
      else if (sel === node.tagName?.toLowerCase()) res.push(node);
      if (node.children) {
        for (const c of node.children) check(c);
      }
    };
    check(this);
    return res;
  }
  getBoundingClientRect() { return { left: 0, top: 0, width: 100, height: 100 }; }
  animate() { return { finished: Promise.resolve() }; }
  remove() {}
}

const mockWindow = {
  AudioContext: class {
    constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
    createOscillator() { return { type: '', frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return this; }, start() {}, stop() {} }; }
    createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return this; } }; }
  },
  location: { hash: '#/digits/train/1', protocol: 'http:' },
  addEventListener: () => {},
  removeEventListener: () => {},
  matchMedia: () => ({ matches: false }),
  innerWidth: 1024, innerHeight: 768,
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); }
  },
  performance: { now: () => Date.now() },
  requestAnimationFrame: (cb) => setTimeout(cb, 10),
  scrollTo: () => {}
};

global.window = mockWindow;
global.document = {
  createElement: (t) => new MockElement(t),
  querySelector: (s) => appRoot.querySelector(s),
  querySelectorAll: (s) => appRoot.querySelectorAll(s),
  body: new MockElement('body'),
  createTextNode: (t) => ({ text: t, nodeType: 3 })
};
global.location = mockWindow.location;
global.localStorage = mockWindow.localStorage;
global.matchMedia = mockWindow.matchMedia;
global.addEventListener = mockWindow.addEventListener;
global.removeEventListener = mockWindow.removeEventListener;
global.devicePixelRatio = 1;

const appRoot = new MockElement('div');
appRoot.id = 'app';
global.document.body.appendChild(appRoot);

// Load bundle.js
const code = fs.readFileSync('C:/Users/Dorian/.gemini/antigravity/scratch/swiat-pamieci/js/bundle.js', 'utf8');

console.log('Running bundle.js...');
eval(code);

console.log('App mounted. Checking what is in appRoot...');
console.log('App children count:', appRoot.children.length);

// Let us find buttons in appRoot
async function test() {
  await new Promise(r => setTimeout(r, 100));
  console.log('Searching for intro button...');
  let btns = appRoot.querySelectorAll('button');
  console.log('Found buttons:', btns.map(b => b.textContent || b.getAttribute('aria-label') || b.className));

  // Step 1: Click through intro
  for (let step = 0; step < 3; step++) {
    const nextBtn = appRoot.querySelectorAll('.btn-primary')[0];
    if (nextBtn) {
      console.log(`Clicking intro button ${step}: "${nextBtn.textContent}"`);
      nextBtn.click();
      await new Promise(r => setTimeout(r, 100));
    }
  }

  // Step 2: Skip presentation if timebar present button exists
  await new Promise(r => setTimeout(r, 100));
  const skipBtn = appRoot.querySelectorAll('.btn-ghost').find(b => b.textContent?.includes('pamiętam'));
  if (skipBtn) {
    console.log('Clicking "Już pamiętam":', skipBtn.textContent);
    skipBtn.click();
  }

  await new Promise(r => setTimeout(r, 300));
  console.log('Now in recall phase!');
  
  // Find key '2'
  btns = appRoot.querySelectorAll('.key');
  console.log('Keypad keys found:', btns.map(b => b.textContent));
  const key2 = btns.find(b => b.textContent === '2');
  const keyOk = btns.find(b => b.textContent === '✓');

  console.log('keyOk before clicking 2: disabled =', keyOk.disabled);
  console.log('Clicking key "2"...');
  key2.click();

  console.log('keyOk after clicking 2: disabled =', keyOk.disabled);
  console.log('Clicking key "✓"...');
  keyOk.click();

  await new Promise(r => setTimeout(r, 500));
  console.log('After clicking "✓":');
  console.log('App buttons now:', appRoot.querySelectorAll('button').map(b => b.textContent));
}

test().catch(console.error);
