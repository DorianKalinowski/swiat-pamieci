const fs = require('fs');
const path = require('path');
const i18n = require('../js/i18n.js');

const missing = JSON.parse(fs.readFileSync(path.join(__dirname, 'missing_data_strings.json'), 'utf8'));

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

const byFile = {};
for (const rel of files) {
  const full = path.join(__dirname, '..', rel);
  if (!fs.existsSync(full)) continue;
  const content = fs.readFileSync(full, 'utf8');

  byFile[rel] = [];
  for (const s of missing) {
    if (content.includes(s)) {
      byFile[rel].push(s);
    }
  }
}

for (const [f, list] of Object.entries(byFile)) {
  console.log(`${f}: ${list.length} items`);
}
