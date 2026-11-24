const fs = require('fs');
const path = require('path');

const results = {};
let totalCount = 0;

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.js') && !p.endsWith('bundle.js') && !p.endsWith('i18n.js')) {
      const content = fs.readFileSync(p, 'utf8');
      const lines = content.split('\n');
      const fileStrings = new Set();
      for (const line of lines) {
        // Find single-quoted, double-quoted, and backtick strings
        const matches = line.match(/'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)"|`([^`\\]*(?:\\.[^`\\]*)*)`/g);
        if (matches) {
          for (const m of matches) {
            const raw = m.slice(1, -1);
            if (/[ąćęłńóśźż]/i.test(raw) && raw.length > 1) {
              fileStrings.add(raw);
            }
          }
        }
      }
      if (fileStrings.size > 0) {
        const arr = Array.from(fileStrings);
        results[p.replace(/\\/g, '/')] = arr;
        totalCount += arr.length;
      }
    }
  }
}

walk(path.join(__dirname, '..', 'js'));
console.log('Total unique Polish lines/phrases across codebase:', totalCount);
fs.writeFileSync(path.join(__dirname, 'all_pl_strings.json'), JSON.stringify(results, null, 2), 'utf8');

for (const [f, list] of Object.entries(results)) {
  console.log(`- ${f}: ${list.length} phrases`);
}
