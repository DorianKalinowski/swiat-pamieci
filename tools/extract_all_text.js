const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, '..', 'js', 'games');
const texts = new Set();

function add(str) {
  if (!str || typeof str !== 'string') return;
  const s = str.trim();
  if (s.length > 1 && /[ąćęłńóśźżA-Za-z]/i.test(s) && !s.startsWith('http') && !s.startsWith('#/') && !s.startsWith('var(')) {
    texts.add(s);
  }
}

// 1. Scan modes
for (const g of fs.readdirSync(gamesDir)) {
  const modesPath = path.join(gamesDir, g, 'modes.js');
  if (fs.existsSync(modesPath)) {
    const c = fs.readFileSync(modesPath, 'utf8');
    for (const m of c.match(/name:\s*['"]([^'"]+)['"]/g) || []) add(m.replace(/name:\s*['"]/, '').slice(0, -1));
    for (const m of c.match(/desc:\s*['"]([^'"]+)['"]/g) || []) add(m.replace(/desc:\s*['"]/, '').slice(0, -1));
    for (const m of c.match(/badge:\s*['"]([^'"]+)['"]/g) || []) add(m.replace(/badge:\s*['"]/, '').slice(0, -1));
    for (const m of c.match(/tag:\s*['"]([^'"]+)['"]/g) || []) add(m.replace(/tag:\s*['"]/, '').slice(0, -1));
  }

  // 2. Scan index.js
  const indexPath = path.join(gamesDir, g, 'index.js');
  if (fs.existsSync(indexPath)) {
    const c = fs.readFileSync(indexPath, 'utf8');
    for (const m of c.match(/(?:bc-kicker|lead|section-title)['"],?\s*(?:h\([^)]*\),?\s*)?['"]([^'"]+)['"]/g) || []) {
      const match = m.match(/['"]([^'"]{3,})['"]$/);
      if (match) add(match[1]);
    }
  }

  // 3. Scan lessons.js
  const lessonsPath = path.join(gamesDir, g, 'lessons.js');
  if (fs.existsSync(lessonsPath)) {
    const c = fs.readFileSync(lessonsPath, 'utf8');
    for (const m of c.match(/title:\s*['"]([^'"]+)['"]/g) || []) add(m.replace(/title:\s*['"]/, '').slice(0, -1));
    for (const m of c.match(/subtitle:\s*['"]([^'"]+)['"]/g) || []) add(m.replace(/subtitle:\s*['"]/, '').slice(0, -1));
    for (const m of c.match(/prompt:\s*['"]([^'"]+)['"]/g) || []) add(m.replace(/prompt:\s*['"]/, '').slice(0, -1));
    for (const m of c.match(/hint:\s*['"]([^'"]+)['"]/g) || []) add(m.replace(/hint:\s*['"]/, '').slice(0, -1));
    for (const m of c.match(/options:\s*\[([\s\S]*?)\]/g) || []) {
      const opts = m.match(/['"]([^'"]+)['"]/g) || [];
      for (const o of opts) add(o.slice(1, -1));
    }
  }

  // 4. Scan train.js
  const trainPath = path.join(gamesDir, g, 'train.js');
  if (fs.existsSync(trainPath)) {
    const c = fs.readFileSync(trainPath, 'utf8');
    for (const m of c.match(/say\(\s*['"]([^'"]+)['"]/g) || []) add(m.replace(/say\(\s*['"]/, '').slice(0, -1));
  }
}

fs.writeFileSync(path.join(__dirname, 'all_needed_texts.json'), JSON.stringify(Array.from(texts).sort(), null, 2), 'utf8');
console.log('Total texts collected:', texts.size);
