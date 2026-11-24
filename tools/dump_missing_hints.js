const fs = require('fs');
const path = require('path');
const i18n = require('../js/i18n.js');
const extracted = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_extracted_for_translation.json'), 'utf8'));

const missing = [];
for (const raw of extracted.lessonHints) {
  const item = raw.replace(/`/g, '').trim();
  const res = i18n.translateEn(item);
  if (res === item && /[ąćęłńóśźż]/i.test(item)) {
    missing.push(item);
  }
}

fs.writeFileSync(path.join(__dirname, 'missing_hints_66.json'), JSON.stringify(missing, null, 2), 'utf8');
console.log('Saved missing hints:', missing.length);
