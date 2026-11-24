const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const gamesDir = path.join(rootDir, 'js', 'games');

const results = {};

for (const g of fs.readdirSync(gamesDir)) {
  const gDir = path.join(gamesDir, g);
  if (!fs.statSync(gDir).isDirectory()) continue;
  results[g] = {};

  for (const f of ['index.js', 'modes.js', 'train.js', 'free.js', 'lessons.js']) {
    const p = path.join(gDir, f);
    if (!fs.existsSync(p)) continue;
    const c = fs.readFileSync(p, 'utf8');

    // Extract all strings
    const strings = new Set();
    // Match string literals
    const matches = c.match(/'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)"/g) || [];
    for (const m of matches) {
      const s = m.slice(1, -1).trim();
      // Filter out code symbols, css classes, colors, paths
      if (s.length > 1 && !s.startsWith('#') && !s.startsWith('.') && !s.startsWith('var(') &&
          !s.includes('/') && !s.includes('{') && !s.includes('px') && !s.includes('deg') &&
          !s.startsWith('rgba') && !/^[a-z0-9_-]+$/i.test(s) && !s.startsWith('http')) {
        strings.add(s);
      }
    }
    results[g][f] = Array.from(strings);
  }
}

fs.writeFileSync(path.join(__dirname, 'game_strings_dump.json'), JSON.stringify(results, null, 2), 'utf8');

let total = 0;
for (const [g, files] of Object.entries(results)) {
  console.log(`=== GAME: ${g} ===`);
  for (const [f, list] of Object.entries(files)) {
    console.log(`  ${f}: ${list.length} candidate strings`);
    total += list.length;
  }
}
console.log('Total candidate strings:', total);
