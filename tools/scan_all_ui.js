const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const gamesDir = path.join(rootDir, 'js', 'games');

const collected = {
  kickers: new Set(),
  leads: new Set(),
  trainSubtitles: new Set(),
  mapLinks: new Set(),
  greetings: new Set(),
  modeNames: new Set(),
  modeDescs: new Set(),
  modeBadges: new Set(),
  lessonTitles: new Set(),
  lessonSubtitles: new Set(),
  lessonPrompts: new Set(),
  lessonHints: new Set(),
  lessonSpeeches: new Set(),
  lessonTheories: new Set(),
  options: new Set(),
  freeHud: new Set(),
  freeFeedback: new Set(),
  freeDialogs: new Set(),
  mascotPokes: new Set()
};

// 1. Mascots
const mascots = ['cat', 'dog', 'fox', 'octopus', 'owl', 'parrot', 'raccoon', 'squirrel', 'tiger', 'turtle'];
for (const m of mascots) {
  const p = path.join(rootDir, 'js', `${m}.js`);
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf8');
    const pokeMatch = c.match(/const\s+(?:[A-Z_]+_)?POKE\s*=\s*\[([\s\S]*?)\];/);
    if (pokeMatch) {
      const lines = pokeMatch[1].match(/['"`](.*?)['"`]/g) || [];
      for (const line of lines) collected.mascotPokes.add(line.slice(1, -1));
    }
  }
}

// 2. Games
for (const g of fs.readdirSync(gamesDir)) {
  const gDir = path.join(gamesDir, g);
  if (!fs.statSync(gDir).isDirectory()) continue;

  // index.js
  const idxPath = path.join(gDir, 'index.js');
  if (fs.existsSync(idxPath)) {
    const c = fs.readFileSync(idxPath, 'utf8');
    const kicker = c.match(/class:\s*['"]bc-kicker['"]\s*\},?\s*['"]([^'"]+)['"]/);
    if (kicker) collected.kickers.add(kicker[1]);

    const lead = c.match(/class:\s*['"]lead['"]\s*\},?\s*['"]([^'"]+)['"]/);
    if (lead) collected.leads.add(lead[1]);

    const mapLink = c.match(/class:\s*['"]link center['"][^>]*\},?\s*['"]([^'"]+)['"]/);
    if (mapLink) collected.mapLinks.add(mapLink[1]);

    const pMatch = c.match(/h\('p',\s*\{\},\s*(`[^`]+`|'[^']+'|"[^"]+")\)/g);
    if (pMatch) {
      for (const p of pMatch) {
        const str = p.replace(/h\('p',\s*\{\},\s*/, '').slice(0, -1);
        collected.trainSubtitles.add(str);
      }
    }

    const greetBlock = c.match(/const greet =([\s\S]*?);/);
    if (greetBlock) {
      const gLines = greetBlock[1].match(/['"`]([\s\S]*?)['"`]/g) || [];
      for (const gl of gLines) collected.greetings.add(gl.slice(1, -1).trim());
    }
  }

  // modes.js
  const modesPath = path.join(gDir, 'modes.js');
  if (fs.existsSync(modesPath)) {
    const c = fs.readFileSync(modesPath, 'utf8');
    for (const m of c.match(/(?:name|title):\s*['"]([^'"]+)['"]/g) || []) {
      collected.modeNames.add(m.replace(/(?:name|title):\s*['"]/, '').slice(0, -1));
    }
    for (const m of c.match(/desc:\s*['"]([^'"]+)['"]/g) || []) {
      collected.modeDescs.add(m.replace(/desc:\s*['"]/, '').slice(0, -1));
    }
    for (const m of c.match(/badge:\s*['"]([^'"]+)['"]/g) || []) {
      collected.modeBadges.add(m.replace(/badge:\s*['"]/, '').slice(0, -1));
    }
  }

  // lessons.js
  const lessonsPath = path.join(gDir, 'lessons.js');
  if (fs.existsSync(lessonsPath)) {
    const c = fs.readFileSync(lessonsPath, 'utf8');
    for (const m of c.match(/title:\s*['"]([^'"]+)['"]/g) || []) {
      collected.lessonTitles.add(m.replace(/title:\s*['"]/, '').slice(0, -1));
    }
    for (const m of c.match(/subtitle:\s*['"]([^'"]+)['"]/g) || []) {
      collected.lessonSubtitles.add(m.replace(/subtitle:\s*['"]/, '').slice(0, -1));
    }
    for (const m of c.match(/prompt:\s*['"]([^'"]+)['"]/g) || []) {
      collected.lessonPrompts.add(m.replace(/prompt:\s*['"]/, '').slice(0, -1));
    }
    for (const m of c.match(/hint:\s*['"]([^'"]+)['"]/g) || []) {
      collected.lessonHints.add(m.replace(/hint:\s*['"]/, '').slice(0, -1));
    }
    for (const m of c.match(/speech:\s*['"]([^'"]+)['"]/g) || []) {
      collected.lessonSpeeches.add(m.replace(/speech:\s*['"]/, '').slice(0, -1));
    }
  }
}

const out = {};
for (const [k, set] of Object.entries(collected)) {
  out[k] = Array.from(set);
}

fs.writeFileSync(path.join(__dirname, 'all_scanned_ui.json'), JSON.stringify(out, null, 2), 'utf8');
console.log('UI Scanned:');
for (const [k, arr] of Object.entries(out)) {
  console.log(`  ${k}: ${arr.length} items`);
}
