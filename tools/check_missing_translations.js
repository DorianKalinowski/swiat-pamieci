const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const i18nContent = fs.readFileSync(path.join(rootDir, 'js', 'i18n.js'), 'utf8');

// Extract current keys in DICTIONARY_EN
const dictKeys = new Set();
const dictMatch = i18nContent.match(/export\s+const\s+DICTIONARY_EN\s*=\s*\{([\s\S]*?)\n\};/);
if (dictMatch) {
  const lines = dictMatch[1].split('\n');
  for (const l of lines) {
    const m = l.match(/^\s*['"](.*?)['"]\s*:/);
    if (m) dictKeys.add(m[1].replace(/\\'/g, "'").replace(/\\"/g, '"'));
  }
}

console.log('Current DICTIONARY_EN has', dictKeys.size, 'keys.');

// Load all scanned strings from games
const scanned = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_scanned_ui.json'), 'utf8'));

const missing = {
  kickers: scanned.kickers.filter(k => !dictKeys.has(k)),
  leads: scanned.leads.filter(k => !dictKeys.has(k)),
  mapLinks: scanned.mapLinks.filter(k => !dictKeys.has(k)),
  modeNames: scanned.modeNames.filter(k => !dictKeys.has(k)),
  modeDescs: scanned.modeDescs.filter(k => !dictKeys.has(k)),
  modeBadges: scanned.modeBadges.filter(k => !dictKeys.has(k)),
  lessonTitles: scanned.lessonTitles.filter(k => !dictKeys.has(k)),
  lessonSubtitles: scanned.lessonSubtitles.filter(k => !dictKeys.has(k)),
  lessonPrompts: scanned.lessonPrompts.filter(k => !dictKeys.has(k)),
  lessonHints: scanned.lessonHints.filter(k => !dictKeys.has(k)),
  lessonSpeeches: scanned.lessonSpeeches.filter(k => !dictKeys.has(k)),
  greetings: scanned.greetings.filter(k => !dictKeys.has(k)),
  mascotPokes: scanned.mascotPokes.filter(k => !dictKeys.has(k))
};

let missingCount = 0;
for (const [cat, list] of Object.entries(missing)) {
  console.log(`Missing in ${cat}: ${list.length}`);
  missingCount += list.length;
}
console.log('Total missing in scanned UI:', missingCount);

fs.writeFileSync(path.join(__dirname, 'missing_ui.json'), JSON.stringify(missing, null, 2), 'utf8');
