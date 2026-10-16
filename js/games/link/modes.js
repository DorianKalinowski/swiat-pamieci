export const MODES = [
  {
    id: 'forward',
    name: 'Łańcuch w przód',
    emoji: '⏩',
    desc: 'Podążaj za akcją historii! Wskaż przedmiot, który następuje bezpośrednio po obecnym.',
    color: ['#f83600', '#fe8c00'],
    badge: 'Klasyczny'
  },
  {
    id: 'reverse',
    name: 'Spacer w tył',
    emoji: '⏪',
    desc: 'Prawdziwy test siły Twoich skojarzeń: czy potrafisz cofnąć taśmę filmu w tył?',
    color: ['#b224ef', '#7579ff'],
    badge: 'Pod prąd'
  },
  {
    id: 'missing_link',
    name: 'Brakujące ogniwo',
    emoji: '🔗',
    desc: 'Element A i element C są na ekranie. Jaki przedmiot łączy je pośrodku?',
    color: ['#11998e', '#38ef7d'],
    badge: 'Dedukcja'
  },
  {
    id: 'endless_chain',
    name: 'Nieskończone domino',
    emoji: '🌰',
    desc: 'Wiewiórka Basia dokłada kolejne orzeszki-ogniwa. Jak długi łańcuch zdołasz zbudować?',
    color: ['#ff0844', '#ffb199'],
    badge: 'Nieskończony'
  }
];
