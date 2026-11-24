const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const gamesDir = path.join(rootDir, 'js', 'games');

const allTexts = {
  kickers: [],
  leads: [],
  trainSubtitles: [],
  mapLinks: [],
  modeNames: [],
  modeDescs: [],
  modeBadges: [],
  whyCards: [],
  lessonTitles: [],
  lessonSubtitles: [],
  lessonSpeeches: [],
  lessonPrompts: [],
  lessonHints: [],
  lessonTheories: [],
  lessonOptions: [],
  freeTexts: [],
  greetings: [],
  mascotPokes: [],
  dataStrings: []
};

function add(cat, str) {
  if (!str || typeof str !== 'string') return;
  const s = str.trim();
  if (s.length > 0 && !allTexts[cat].includes(s)) {
    allTexts[cat].push(s);
  }
}

// 1. Mascots poke lines
const mascots = ['cat', 'dog', 'fox', 'octopus', 'owl', 'parrot', 'raccoon', 'squirrel', 'tiger', 'turtle'];
for (const m of mascots) {
  const p = path.join(rootDir, 'js', `${m}.js`);
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf8');
    const pokeMatch = c.match(/const\s+(?:[A-Z_]+_)?POKE\s*=\s*\[([\s\S]*?)\];/);
    if (pokeMatch) {
      const lines = pokeMatch[1].match(/['"`](.*?)['"`]/g) || [];
      for (const line of lines) add('mascotPokes', line.slice(1, -1));
    }
  }
}

// 2. Games
for (const g of fs.readdirSync(gamesDir)) {
  const gDir = path.join(gamesDir, g);
  if (!fs.statSync(gDir).isDirectory()) continue;

  // index.js
  const idxP = path.join(gDir, 'index.js');
  if (fs.existsSync(idxP)) {
    const c = fs.readFileSync(idxP, 'utf8');
    const km = c.match(/bc-kicker['"]\s*\},?\s*['"]([^'"]+)['"]/);
    if (km) add('kickers', km[1]);

    const lm = c.match(/lead['"]\s*\},?\s*['"]([^'"]+)['"]/);
    if (lm) add('leads', lm[1]);

    const ml = c.match(/link center['"][^>]*\},?\s*['"]([^'"]+)['"]/);
    if (ml) add('mapLinks', ml[1]);

    const pMatch = c.match(/h\('p',\s*\{\},\s*(`[^`]+`|'[^']+'|"[^"]+")\)/g);
    if (pMatch) {
      for (const p of pMatch) {
        add('trainSubtitles', p.replace(/h\('p',\s*\{\},\s*/, '').slice(0, -1));
      }
    }

    const greetBlock = c.match(/const greet =([\s\S]*?);/);
    if (greetBlock) {
      const gLines = greetBlock[1].match(/['"`]([\s\S]*?)['"`]/g) || [];
      for (const gl of gLines) add('greetings', gl.slice(1, -1).trim());
    }
  }

  // modes.js
  const modesP = path.join(gDir, 'modes.js');
  if (fs.existsSync(modesP)) {
    const c = fs.readFileSync(modesP, 'utf8');
    for (const m of c.match(/(?:name|title):\s*['"]([^'"]+)['"]/g) || []) {
      add('modeNames', m.replace(/(?:name|title):\s*['"]/, '').slice(0, -1));
    }
    for (const m of c.match(/desc:\s*['"]([^'"]+)['"]/g) || []) {
      add('modeDescs', m.replace(/desc:\s*['"]/, '').slice(0, -1));
    }
    for (const m of c.match(/badge:\s*['"]([^'"]+)['"]/g) || []) {
      add('modeBadges', m.replace(/badge:\s*['"]/, '').slice(0, -1));
    }
  }

  // train.js
  const trainP = path.join(gDir, 'train.js');
  if (fs.existsSync(trainP)) {
    const c = fs.readFileSync(trainP, 'utf8');
    const whyM = c.match(/why-content['"][\s\S]*?h\('p',\s*\{\},\s*['"]([^'"]+)['"]/);
    if (whyM) add('whyCards', whyM[1]);
  }

  // lessons.js
  const lesP = path.join(gDir, 'lessons.js');
  if (fs.existsSync(lesP)) {
    const c = fs.readFileSync(lesP, 'utf8');
    for (const m of c.match(/title:\s*['"]([^'"]+)['"]/g) || []) {
      add('lessonTitles', m.replace(/title:\s*['"]/, '').slice(0, -1));
    }
    for (const m of c.match(/subtitle:\s*['"]([^'"]+)['"]/g) || []) {
      add('lessonSubtitles', m.replace(/subtitle:\s*['"]/, '').slice(0, -1));
    }
    for (const m of c.match(/prompt:\s*['"]([^'"]+)['"]/g) || []) {
      add('lessonPrompts', m.replace(/prompt:\s*['"]/, '').slice(0, -1));
    }
    for (const m of c.match(/hint:\s*['"]([^'"]+)['"]/g) || []) {
      add('lessonHints', m.replace(/hint:\s*['"]/, '').slice(0, -1));
    }
    for (const m of c.match(/speech:\s*['"]([^'"]+)['"]/g) || []) {
      add('lessonSpeeches', m.replace(/speech:\s*['"]/, '').slice(0, -1));
    }

    // theories
    const thMatches = c.match(/theory:\s*\[([\s\S]*?)\]\s*,\s*(?:diagram|task)/g) || [];
    for (const tm of thMatches) {
      const pMatches = tm.match(/['"`]([\s\S]*?)['"`]\s*(?:,|$)/g) || [];
      for (const pm of pMatches) {
        const clean = pm.replace(/^['"`]/, '').replace(/['"`]\s*,?$/, '').replace(/\\'/g, "'").replace(/\\"/g, '"');
        add('lessonTheories', clean);
      }
    }

    // options
    const optMatches = c.match(/options:\s*\[([\s\S]*?)\]/g) || [];
    for (const om of optMatches) {
      const opts = om.match(/['"]([^'"]+)['"]/g) || [];
      for (const o of opts) add('lessonOptions', o.slice(1, -1));
    }
  }

  // free.js
  const freeP = path.join(gDir, 'free.js');
  if (fs.existsSync(freeP)) {
    const c = fs.readFileSync(freeP, 'utf8');
    // Extract strings passed to h() or say()
    const sayMatches = c.match(/say\(\s*['"`]([\s\S]*?)['"`]\s*,/g) || [];
    for (const sm of sayMatches) {
      const clean = sm.replace(/^say\(\s*['"`]/, '').replace(/['"`]\s*,$/, '');
      add('freeTexts', clean);
    }
    const cheerArr = c.match(/CHEERS\s*=\s*\[([\s\S]*?)\];/);
    if (cheerArr) {
      const cm = cheerArr[1].match(/['"`]([\s\S]*?)['"`]/g) || [];
      for (const line of cm) add('freeTexts', line.slice(1, -1));
    }
  }
}

// Data files:
// names/faces.js
const facesP = path.join(gamesDir, 'names', 'faces.js');
if (fs.existsSync(facesP)) {
  const c = fs.readFileSync(facesP, 'utf8');
  for (const m of c.match(/feature:\s*['"]([^'"]+)['"]/g) || []) add('dataStrings', m.replace(/feature:\s*['"]/, '').slice(0, -1));
  for (const m of c.match(/hook:\s*['"]([^'"]+)['"]/g) || []) add('dataStrings', m.replace(/hook:\s*['"]/, '').slice(0, -1));
  for (const m of c.match(/job:\s*['"]([^'"]+)['"]/g) || []) add('dataStrings', m.replace(/job:\s*['"]/, '').slice(0, -1));
}

// palace/rooms.js
const roomsP = path.join(gamesDir, 'palace', 'rooms.js');
if (fs.existsSync(roomsP)) {
  const c = fs.readFileSync(roomsP, 'utf8');
  for (const m of c.match(/name:\s*['"]([^'"]+)['"]/g) || []) add('dataStrings', m.replace(/name:\s*['"]/, '').slice(0, -1));
  for (const m of c.match(/item:\s*['"]([^'"]+)['"]/g) || []) add('dataStrings', m.replace(/item:\s*['"]/, '').slice(0, -1));
}

// link/chains.js
const chainsP = path.join(gamesDir, 'link', 'chains.js');
if (fs.existsSync(chainsP)) {
  const c = fs.readFileSync(chainsP, 'utf8');
  for (const m of c.match(/word:\s*['"]([^'"]+)['"]/g) || []) add('dataStrings', m.replace(/word:\s*['"]/, '').slice(0, -1));
  for (const m of c.match(/hook:\s*['"]([^'"]+)['"]/g) || []) add('dataStrings', m.replace(/hook:\s*['"]/, '').slice(0, -1));
}

fs.writeFileSync(path.join(__dirname, 'all_extracted_for_translation.json'), JSON.stringify(allTexts, null, 2), 'utf8');

let total = 0;
for (const [k, arr] of Object.entries(allTexts)) {
  console.log(`${k}: ${arr.length} items`);
  total += arr.length;
}
console.log('Total extracted for translation:', total);
