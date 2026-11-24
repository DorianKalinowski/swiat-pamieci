const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Load all dictionary modules
const dictBase = require('./dict_base.js');
const dictMenus = require('./dict_menus_modes.js');
const dictMascotsFree = require('./dict_mascots_free.js');
const dictLessons = require('./dict_lessons.js');
const dictTheories1 = require('./dict_theories_1.js');
const dictTheories2 = require('./dict_theories_2.js');
const dictOptions = require('./translate_options.js');
const dictRemainingUi = require('./dict_remaining_ui.js');
const dictRemainingLessons = require('./dict_remaining_lessons.js');
const dictRemainingOptions = require('./dict_remaining_options.js');
const dictRemainingTheories = require('./dict_remaining_theories.js');
const dictFinal171 = require('./dict_final_171.js');
const dictHints67 = require('./dict_hints_67.js');
const dictInteractiveStatics = require('./dict_interactive_statics.js');
const dictDataCalDigCardsMaj = require('./dict_data_calendar_digits_cards_major.js');
const dictDataPalace = require('./dict_data_palace.js');
const dictDataAcrostic = require('./dict_data_acrostic.js');
const dictDataMindmap = require('./dict_data_mindmap.js');
const dictDataWords = require('./dict_data_words.js');
const dictWalkthroughAll = require('./dict_walkthrough_all.js');
const dictPatch92 = require('./dict_walkthrough_patch92.js');
const dictMissingData250 = require('./dict_missing_data_250.js');
const dictWordsCleanEn = require('./dict_words_clean_en.js');
const patterns = require('./dict_patterns.js');
const interactivePatterns = require('./dict_interactive_patterns.js');

// Merge dictionaries
const fullDict = Object.assign({},
  dictBase,
  dictMenus,
  dictMascotsFree,
  dictLessons,
  dictTheories1,
  dictTheories2,
  dictOptions,
  dictRemainingUi,
  dictRemainingLessons,
  dictRemainingOptions,
  dictRemainingTheories,
  dictFinal171,
  dictHints67,
  dictInteractiveStatics,
  dictDataCalDigCardsMaj,
  dictDataPalace,
  dictDataAcrostic,
  dictDataMindmap,
  dictDataWords,
  dictWalkthroughAll,
  dictPatch92,
  dictMissingData250,
  dictWordsCleanEn
);

// Add quote-normalized keys
for (const [k, v] of Object.entries(Object.assign({}, fullDict))) {
  const normK = k.replace(/[„”«»]/g, '"').replace(/[’‘]/g, "'");
  if (!fullDict[normK]) {
    fullDict[normK] = v;
  }
}

const allPatterns = interactivePatterns.concat(patterns);

console.log('Total merged DICTIONARY_EN entries:', Object.keys(fullDict).length);
console.log('Total dynamic patterns:', allPatterns.length);

// Read existing DOM manipulation functions and cheat sheet HTML from js/i18n.js
const i18nOriginal = fs.readFileSync(path.join(rootDir, 'js', 'i18n.js'), 'utf8');

// Find applyLangToDOM function
const applyDomMatch = i18nOriginal.match(/let domCache = null;[\s\S]*$/);
if (!applyDomMatch) {
  console.error('Failed to locate applyLangToDOM in js/i18n.js');
  process.exit(1);
}
const domSection = applyDomMatch[0];

// Format dictionary for output
const dictLines = Object.entries(fullDict).map(([k, v]) => {
  const escapedK = k.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
  const escapedV = v.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
  return `  '${escapedK}': '${escapedV}'`;
}).join(',\n');

// Format patterns for output
const patternLines = allPatterns.map(([re, repl]) => {
  return `  [${re.toString()}, '${repl.replace(/'/g, "\\'")}']`;
}).join(',\n');

const newI18nCode = `/**
 * Moduł internacjonalizacji (i18n) dla Świat Pamięci.
 * Obsługuje język polski (PL 🇵🇱 - domyślny) oraz amerykański angielski (USA 🇺🇸).
 */

import { store } from './store.js';

let currentLang = (typeof store !== 'undefined' && store.get ? store.get('lang', 'pl') : 'pl');

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  currentLang = lang === 'en' ? 'en' : 'pl';
  if (typeof store !== 'undefined' && store.set) {
    store.set('lang', currentLang);
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = currentLang;
    applyLangToDOM(currentLang);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SŁOWNIK JĘZYKA ANGIELSKIEGO (AMERICAN ENGLISH)
// ─────────────────────────────────────────────────────────────────────────────

export const DICTIONARY_EN = {
${dictLines}
};

// Wzorce regex dla napisów dynamicznych (poziomy, lekcje, serie itp.)
const PATTERNS_EN = [
${patternLines}
];

export function translateEn(str, depth = 0) {
  if (!str || typeof str !== 'string' || depth > 4) return str;
  if (DICTIONARY_EN[str]) return DICTIONARY_EN[str];

  const trimmed = str.trim();
  const lead = str.match(/^\\s*/)[0];
  const trail = str.match(/\\s*$/)[0];

  if (DICTIONARY_EN[trimmed]) {
    return lead + DICTIONARY_EN[trimmed] + trail;
  }

  const normQuotes = trimmed.replace(/[„”«»]/g, '"').replace(/[’‘]/g, "'");
  if (DICTIONARY_EN[normQuotes]) {
    return lead + DICTIONARY_EN[normQuotes] + trail;
  }

  // Case-insensitive first-letter match (e.g. lowercase month names)
  if (/^[a-ząćęłńóśźż]/.test(trimmed)) {
    const cap = trimmed[0].toUpperCase() + trimmed.slice(1);
    if (DICTIONARY_EN[cap]) {
      return lead + DICTIONARY_EN[cap] + trail;
    }
  }

  // Quoted single token wrapper e.g. „Żabko”
  const quoteWrap = trimmed.match(/^[„"](.*)[”"]$/);
  if (quoteWrap) {
    const inner = translateEn(quoteWrap[1], depth + 1);
    if (inner !== quoteWrap[1]) {
      return lead + '"' + inner + '"' + trail;
    }
  }

  // Recursive regex patterns: translates captured groups automatically!
  const applyPattern = (input, re, repl) => {
    return input.replace(re, (...args) => {
      return repl.replace(/\\$(\\d+)/g, (_, idxStr) => {
        const val = args[Number(idxStr)];
        if (val === undefined) return '';
        if (/^\\d+$/.test(val)) return val;
        return translateEn(val, depth + 1);
      });
    });
  };

  for (const [re, repl] of PATTERNS_EN) {
    if (re.test(trimmed)) {
      return lead + applyPattern(trimmed, re, repl) + trail;
    }
    if (re.test(normQuotes)) {
      return lead + applyPattern(normQuotes, re, repl) + trail;
    }
  }

  // Arrow-separated sequence fallback (e.g. Acrostic steps / Mindmap flow)
  if (trimmed.includes(' ➔ ')) {
    const parts = trimmed.split(' ➔ ');
    const mapped = parts.map(p => translateEn(p, depth + 1));
    if (mapped.some((m, i) => m !== parts[i])) {
      return lead + mapped.join(' ➔ ') + trail;
    }
  }

  // Leading emoji or bullet strip-and-preserve (e.g. "⚡ Błysk", "📚 Królewska Biblioteka")
  const emojiLead = trimmed.match(/^((?:[\\u{1F000}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\uFE0F\\u200D]+|•|·|▪|▫|▶|◀|➔|➡)\\s+)(.+)$/u);
  if (emojiLead) {
    const transRest = translateEn(emojiLead[2], depth + 1);
    if (transRest !== emojiLead[2]) {
      return lead + emojiLead[1] + transRest + trail;
    }
  }

  // "PartA: PartB" pair fallback if PartA translates cleanly (e.g. "Złota Brama: Świecący Banan")
  const colonIdx = trimmed.indexOf(': ');
  if (colonIdx > 1 && colonIdx < 45) {
    const left = trimmed.slice(0, colonIdx);
    const right = trimmed.slice(colonIdx + 2);
    const tLeft = translateEn(left, depth + 1);
    const tRight = translateEn(right, depth + 1);
    if (tLeft !== left || tRight !== right) {
      return lead + tLeft + ': ' + tRight + trail;
    }
  }

  return str;
}

export function t(text) {
  if (currentLang !== 'en' || typeof text !== 'string' || !text) return text;
  return translateEn(text);
}

// ─────────────────────────────────────────────────────────────────────────────
// AKTUALIZACJA STATYCZNYCH ELEMENTÓW DOM (TOPBAR, MODALE, FOOTER, META)
// ─────────────────────────────────────────────────────────────────────────────

${domSection}
`;

fs.writeFileSync(path.join(rootDir, 'js', 'i18n.js'), newI18nCode, 'utf8');
console.log('Successfully written updated js/i18n.js! File size:', newI18nCode.length, 'bytes');
