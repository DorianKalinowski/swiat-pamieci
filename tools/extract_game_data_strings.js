const fs = require('fs');
const path = require('path');
const i18n = require('../js/i18n.js');

const files = [
  'js/games/acrostic/acrostics.js',
  'js/games/mindmap/mindmaps.js',
  'js/games/palace/rooms.js',
  'js/games/cards/deck.js',
  'js/games/calendar/logic.js',
  'js/games/words/vocab.js',
  'js/games/digits/present.js',
  'js/games/major/codes.js',
  'js/games/names/faces.js'
];

const extracted = new Set();

for (const rel of files) {
  const full = path.join(__dirname, '..', rel);
  if (!fs.existsSync(full)) continue;
  const content = fs.readFileSync(full, 'utf8');

  // Match all string literals
  const stringRegex = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;
  let match;
  while ((match = stringRegex.exec(content)) !== null) {
    const s = match[2];
    if (!s || !s.trim()) continue;
    if (s.length < 2) continue;
    // skip svg or css
    if (s.startsWith('<svg') || s.startsWith('#') || s.startsWith('.') || s.includes('{') || s.includes(';')) continue;
    // only if contains letters
    if (!/[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(s)) continue;

    // clean
    const cleaned = s.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
    extracted.add(cleaned);
  }
}

console.log('Total extracted data strings:', extracted.size);

// Check translation
const missing = [];
for (const s of extracted) {
  const trans = i18n.translateEn(s);
  if (trans === s && /[ąćęłńóśźż]/i.test(s)) {
    missing.push(s);
  }
}

console.log('Missing data strings needing translation:', missing.length);
fs.writeFileSync(path.join(__dirname, 'missing_data_strings.json'), JSON.stringify(missing, null, 2), 'utf8');
