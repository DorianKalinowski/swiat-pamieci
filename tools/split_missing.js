const fs = require('fs');
const path = require('path');

const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_missing_interactive.json'), 'utf8'));

const statics = [];
const templates = [];

list.forEach(s => {
  if (/\$\{/.test(s)) {
    templates.push(s);
  } else {
    statics.push(s);
  }
});

console.log('Statics count:', statics.length);
console.log('Templates count:', templates.length);

fs.writeFileSync(path.join(__dirname, 'missing_statics.json'), JSON.stringify(statics, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, 'missing_templates.json'), JSON.stringify(templates, null, 2), 'utf8');
