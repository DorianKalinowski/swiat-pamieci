const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, '..', 'js', 'games');
const output = {
  modes: [],
  lessons: [],
  gameMenus: []
};

for (const game of fs.readdirSync(gamesDir)) {
  const gDir = path.join(gamesDir, game);
  if (!fs.statSync(gDir).isDirectory()) continue;

  // Modes
  const modesFile = path.join(gDir, 'modes.js');
  if (fs.existsSync(modesFile)) {
    const content = fs.readFileSync(modesFile, 'utf8');
    const nameMatches = content.match(/name:\s*['"]([^'"]+)['"]/g) || [];
    const descMatches = content.match(/desc:\s*['"]([^'"]+)['"]/g) || [];
    const badgeMatches = content.match(/badge:\s*['"]([^'"]+)['"]/g) || [];
    output.modes.push({
      game,
      names: nameMatches.map(m => m.replace(/name:\s*['"]/, '').slice(0, -1)),
      descs: descMatches.map(m => m.replace(/desc:\s*['"]/, '').slice(0, -1)),
      badges: badgeMatches.map(m => m.replace(/badge:\s*['"]/, '').slice(0, -1))
    });
  }

  // Index (game menu)
  const indexFile = path.join(gDir, 'index.js');
  if (fs.existsSync(indexFile)) {
    const content = fs.readFileSync(indexFile, 'utf8');
    output.gameMenus.push({
      game,
      content
    });
  }
}

fs.writeFileSync(path.join(__dirname, 'extracted_modes.json'), JSON.stringify(output.modes, null, 2), 'utf8');
console.log('Saved extracted_modes.json');
