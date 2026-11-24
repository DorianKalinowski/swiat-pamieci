/**
 * Tryby gry swobodnej dla Map Myśli z Ośmiornicą Inką.
 */
export const MODES = [
  {
    id: 'missing_branch',
    title: 'Brakująca Gałąź',
    emoji: '🐙',
    desc: 'Ośmiornica Inka ukryła jedno z ramion mapy myśli! Odgadnij, jak nazywa się brakująca gałąź wiedzy.',
    accent: ['#d946ef', '#8b5cf6']
  },
  {
    id: 'categorize',
    title: 'Gdzie Przypiąć Mackę?',
    emoji: '🧭',
    desc: 'Pojawia się pojedyncze pojęcie lub zjawisko. Przypnij je do właściwego ramienia mapy myśli!',
    accent: ['#06b6d4', '#3b82f6']
  },
  {
    id: 'find_intruder',
    title: 'Znajdź Intruza',
    emoji: '🔍',
    desc: 'Na jednej z gałęzi zaplątał się element, który kompletnie nie pasuje do kategorii. Oczyść mapę myśli!',
    accent: ['#f59e0b', '#ef4444']
  },
  {
    id: 'speed_map',
    title: 'Wyścig z Inką (30 sek)',
    emoji: '⚡',
    desc: 'Czysty 30-sekundowy bieg! Ile powiązań na mapie myśli zdołasz poprawnie skojarzyć, zanim minie czas?',
    accent: ['#ec4899', '#f43f5e']
  }
];
