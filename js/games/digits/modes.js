import { smartGroups } from './util.js';

/** Warianty gry swobodnej. `round(level, len)` opisuje, jak pokazać liczbę. */
export const MODES = [
  {
    id: 'classic', name: 'Klasyk', emoji: '🧠', color: ['#7c5cff', '#a678ff'],
    desc: 'Wszystkie cyfry naraz. Czysta pamięć – czas skraca się z poziomem.',
    reverse: false,
    round: (level, len) => ({ mode: 'all', time: len * Math.max(520, 900 - level * 22) + 900 })
  },
  {
    id: 'flash', name: 'Błysk', emoji: '⚡', color: ['#ffc857', '#ff8a5c'],
    desc: 'Cyfry mrugają po jednej. Nie zdążysz drugi raz – skup się!',
    reverse: false,
    round: level => ({ mode: 'seq', interval: Math.max(380, 820 - level * 20) })
  },
  {
    id: 'reverse', name: 'Odwrotnie', emoji: '🔄', color: ['#3ef0c0', '#4aa8ff'],
    desc: 'Zapamiętaj, a potem wpisz od końca. Mózg na wysokich obrotach.',
    reverse: true,
    round: (level, len) => ({ mode: 'all', time: len * Math.max(560, 950 - level * 22) + 1000 })
  },
  {
    id: 'groups', name: 'Paczki', emoji: '📱', color: ['#ff6bd6', '#ff8a5c'],
    desc: 'Cyfry w grupkach jak numer telefonu – ćwiczysz technikę grupowania.',
    reverse: false,
    round: (level, len) => ({ mode: 'all', group: smartGroups(len, 3), time: len * Math.max(480, 820 - level * 20) + 800 })
  },
  {
    id: 'melody', name: 'Melodia', emoji: '🎵', color: ['#12b5a0', '#3ef0c0'],
    desc: 'Każda cyfra to unikalny ton muzyczny. Zapamiętujesz rytm i melodię!',
    reverse: false,
    round: level => ({ mode: 'seq', interval: Math.max(420, 800 - level * 18) })
  },
  {
    id: 'shapes', name: 'Kształty', emoji: '🎨', color: ['#ff9966', '#ff5e62'],
    desc: 'Cyfry z podpowiedziami kształtów (np. 🦢, ☃️). Twórz w głowie szalone historie!',
    reverse: false,
    round: (level, len) => ({ mode: 'all', showShapes: true, time: len * Math.max(600, 1000 - level * 20) + 1200 })
  }
];

export const getMode = id => MODES.find(m => m.id === id);
