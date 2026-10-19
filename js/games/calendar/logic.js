export const DAYS_OF_WEEK = [
  { id: 0, name: 'Niedziela', short: 'Nd', emoji: '☀️' },
  { id: 1, name: 'Poniedziałek', short: 'Pn', emoji: '🌙' },
  { id: 2, name: 'Wtorek', short: 'Wt', emoji: '🔥' },
  { id: 3, name: 'Środa', short: 'Śr', emoji: '💧' },
  { id: 4, name: 'Czwartek', short: 'Cz', emoji: '⚡' },
  { id: 5, name: 'Piątek', short: 'Pt', emoji: '🎉' },
  { id: 6, name: 'Sobota', short: 'Sb', emoji: '🪐' }
];

export const MONTH_ANCHORS = [
  { month: 1, name: 'Styczeń', anchorDay: 3, rule: '3 stycznia (lub 4 w przestępnym)' },
  { month: 2, name: 'Luty', anchorDay: 28, rule: 'Ostatni dzień lutego (28 lub 29)' },
  { month: 3, name: 'Marzec', anchorDay: 14, rule: '14 marca (Dzień liczby Pi: 3.14)' },
  { month: 4, name: 'Kwiecień', anchorDay: 4, rule: '4 kwietnia (parzysty: 4.04)' },
  { month: 5, name: 'Maj', anchorDay: 9, rule: '9 maja („praca 9 do 5” -> 9.05)' },
  { month: 6, name: 'Czerwiec', anchorDay: 6, rule: '6 czerwca (parzysty: 6.06)' },
  { month: 7, name: 'Lipiec', anchorDay: 11, rule: '11 lipca („stacja 7/11” -> 11.07)' },
  { month: 8, name: 'Sierpień', anchorDay: 8, rule: '8 sierpnia (parzysty: 8.08)' },
  { month: 9, name: 'Wrzesień', anchorDay: 5, rule: '5 września („praca 9 do 5” -> 5.09)' },
  { month: 10, name: 'Październik', anchorDay: 10, rule: '10 października (parzysty: 10.10)' },
  { month: 11, name: 'Listopad', anchorDay: 7, rule: '7 listopada („stacja 7/11” -> 7.11)' },
  { month: 12, name: 'Grudzień', anchorDay: 12, rule: '12 grudnia (parzysty: 12.12)' }
];

export function getDoomsdayOfYear(year) {
  // Doomsday algorithm anchor for years
  // 2024: 4 (Czwartek), 2025: 5 (Piątek), 2026: 6 (Sobota)
  const d = new Date(year, 3, 4); // 4th April is always Doomsday
  return d.getDay();
}

export function calculateWeekday(year, month, day) {
  const d = new Date(year, month - 1, day);
  return d.getDay();
}
