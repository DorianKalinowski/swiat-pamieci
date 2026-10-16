/**
 * Tryby gry swobodnej dla Pałacu Pamięci.
 */

export const MODES = [
  {
    id: 'walk',
    name: 'Wędrówka Odkrywcy',
    emoji: '🧭',
    desc: 'Klasyczna wędrówka przez komnaty. Z każdym poziomem trasa wydłuża się o jedno miejsce!',
    color: ['#ff9233', '#ffc857'],
    tag: 'Klasyczny Loci',
    minLoci: 3,
    maxLoci: 12
  },
  {
    id: 'speed',
    name: 'Błyskawiczny Pałac',
    emoji: '⚡',
    desc: 'Spacer na czas! Komnaty zmieniają się automatycznie co 3 sekundy. Twórz skojarzenia w ułamku oka!',
    color: ['#ff5376', '#ff8a5c'],
    tag: 'Na czas',
    timePerRoom: 3200
  },
  {
    id: 'reverse',
    name: 'Spacer w Tył',
    emoji: '🔄',
    desc: 'Prawdziwy test mistrza: zapamiętaj trasę od wejścia, a potem odtwórz ją od końca do początku!',
    color: ['#a678ff', '#ff6bd6'],
    tag: 'Odwrotna kolejność'
  },
  {
    id: 'quiz',
    name: 'Strażnik Komnat',
    emoji: '🎯',
    desc: 'Losowe wyzwanie! Tygrysek pyta wyrywkowo: „Gdzie ukrył się jednorożec?” lub „Co zostawiłeś w Wieży?”.',
    color: ['#3ef0c0', '#4aa8ff'],
    tag: 'Dostęp bezpośredni'
  },
  {
    id: 'survival',
    name: 'Nieskończona Wędrówka',
    emoji: '🏆',
    desc: 'Zaczynasz od 3 komnat. Z każdą rundą dochodzi kolejna, aż do pierwszej pomyłki. Jaki jest Twój rekord?',
    color: ['#ffd166', '#ef476f'],
    tag: 'Survival'
  }
];

export function getMode(id) {
  return MODES.find(m => m.id === id) || MODES[0];
}
