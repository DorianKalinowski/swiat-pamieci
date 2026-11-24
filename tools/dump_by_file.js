const fs = require('fs');
const path = require('path');

const missing = JSON.parse(fs.readFileSync(path.join(__dirname, 'missing_data_strings.json'), 'utf8'));

const files = [
  'js/games/calendar/logic.js',
  'js/games/digits/present.js',
  'js/games/cards/deck.js',
  'js/games/major/codes.js',
  'js/games/names/faces.js',
  'js/games/palace/rooms.js',
  'js/games/acrostic/acrostics.js',
  'js/games/mindmap/mindmaps.js',
  'js/games/words/vocab.js'
];

for (const rel of files) {
  const full = path.join(__dirname, '..', rel);
  if (!fs.existsSync(full)) continue;
  const content = fs.readFileSync(full, 'utf8');

  const fileItems = missing.filter(s => content.includes(s));
  const tag = path.basename(path.dirname(rel));
  fs.writeFileSync(path.join(__dirname, `missing_data_${tag}.json`), JSON.stringify(fileItems, null, 2), 'utf8');
  console.log(`Saved ${fileItems.length} items to missing_data_${tag}.json`);
}
