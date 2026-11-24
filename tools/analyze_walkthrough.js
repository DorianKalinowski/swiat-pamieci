const fs = require('fs');
const path = require('path');

const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'walkthrough_untranslated.json'), 'utf8'));

const byGame = {};
for (const item of list) {
  const g = item.context.split(' ')[0];
  if (!byGame[g]) byGame[g] = [];
  byGame[g].push(item);
}

for (const [g, items] of Object.entries(byGame)) {
  console.log(`${g}: ${items.length} untranslated items`);
}
