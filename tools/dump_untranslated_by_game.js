const fs = require('fs');
const path = require('path');

const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'walkthrough_untranslated.json'), 'utf8'));

const games = ['digits', 'palace', 'acrostic', 'mindmap', 'names', 'major', 'words', 'cards', 'link', 'calendar'];

for (const g of games) {
  const items = list.filter(item => item.context.startsWith(g));
  fs.writeFileSync(path.join(__dirname, `untranslated_${g}.json`), JSON.stringify(items, null, 2), 'utf8');
  console.log(`${g}: ${items.length} items saved`);
}

const others = list.filter(item => !games.some(g => item.context.startsWith(g)));
fs.writeFileSync(path.join(__dirname, `untranslated_subtitles.json`), JSON.stringify(others, null, 2), 'utf8');
console.log(`subtitles: ${others.length} items saved`);
