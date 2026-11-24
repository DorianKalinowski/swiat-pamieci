const fs = require('fs');
const path = require('path');

function walk(dir) {
  let out = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) out = out.concat(walk(full));
    else if (f.name.endsWith('.js') && f.name !== 'i18n.js' && f.name !== 'bundle.js') out.push(full);
  }
  return out;
}

const files = walk(path.join(__dirname, '..', 'js'));

console.log('=== 1. DIRECT DOM ASSIGNMENTS (innerHTML, html:, textContent) ===');
for (const f of files) {
  const rel = path.relative(path.join(__dirname, '..'), f);
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((l, i) => {
    if (/(\.innerHTML\s*=|\bhtml\s*:|\.textContent\s*=)/.test(l)) {
      if (!l.trim().startsWith('//') && !l.trim().startsWith('*')) {
        console.log(`  ${rel}:${i + 1}: ${l.trim()}`);
      }
    }
  });
}

console.log('\n=== 2. TEMPLATE LITERALS IN UI / GAMEPLAY ===');
for (const f of files) {
  const rel = path.relative(path.join(__dirname, '..'), f);
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((l, i) => {
    if (l.includes('`') && /\$\{/.test(l)) {
      // exclude CSS / href / store / class / url
      if (!/href:|class:|style:|store\.|`#\//.test(l) && !/--p:|transform|rotate|hsl|rgb|rgba/.test(l)) {
        if (/[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]{2,}/.test(l.replace(/\$\{[^}]+\}/g, ''))) {
          console.log(`  ${rel}:${i + 1}: ${l.trim()}`);
        }
      }
    }
  });
}
