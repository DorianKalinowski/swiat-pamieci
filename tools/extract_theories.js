const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, '..', 'js', 'games');
const texts = new Set();

function add(str) {
  if (!str || typeof str !== 'string') return;
  const s = str.trim();
  if (s.length > 1 && /[ąćęłńóśźżA-Za-z]/i.test(s) && !s.startsWith('http') && !s.startsWith('#/') && !s.startsWith('var(') && !s.startsWith('rgba(')) {
    texts.add(s);
  }
}

for (const g of fs.readdirSync(gamesDir)) {
  const gDir = path.join(gamesDir, g);
  if (!fs.statSync(gDir).isDirectory()) continue;

  const lessonsPath = path.join(gDir, 'lessons.js');
  if (fs.existsSync(lessonsPath)) {
    const c = fs.readFileSync(lessonsPath, 'utf8');
    // Extract theory arrays
    const theoryMatches = c.match(/theory:\s*\[([\s\S]*?)\]\s*,\s*(?:diagram|task)/g) || [];
    for (const tm of theoryMatches) {
      const pMatches = tm.match(/['"`]([\s\S]*?)['"`]\s*(?:,|$)/g) || [];
      for (const pm of pMatches) {
        const clean = pm.replace(/^['"`]/, '').replace(/['"`]\s*,?$/, '').replace(/\\'/g, "'").replace(/\\"/g, '"');
        add(clean);
      }
    }
    // Extract speeches
    const speechMatches = c.match(/speech:\s*['"`]([\s\S]*?)['"`]\s*,/g) || [];
    for (const sm of speechMatches) {
      const clean = sm.replace(/^speech:\s*['"`]/, '').replace(/['"`]\s*,$/, '');
      add(clean);
    }
  }
}

console.log('Total theory paragraphs & speeches extracted:', texts.size);
fs.writeFileSync(path.join(__dirname, 'all_theories_speeches.json'), JSON.stringify(Array.from(texts).sort(), null, 2), 'utf8');
