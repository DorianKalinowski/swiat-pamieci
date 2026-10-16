export const SUITS = [
  { id: 'spades', symbol: '♠', name: 'Pik', color: '#1e293b', theme: 'Noc / Cień / Iluzja' },
  { id: 'hearts', symbol: '♥', name: 'Kier', color: '#e11d48', theme: 'Ogień / Pasja / Rycerze' },
  { id: 'diamonds', symbol: '♦', name: 'Karo', color: '#ea580c', theme: 'Złoto / Klejnoty / Bogactwo' },
  { id: 'clubs', symbol: '♣', name: 'Trefl', color: '#16a34a', theme: 'Natura / Las / Tajemnica' }
];

export const CARDS_PAO = [
  {
    id: 'as_spades',
    rank: 'A',
    suit: 'spades',
    name: 'As Pik',
    person: 'Szop Magik 🦝',
    action: 'wyciąga z cylindra',
    object: 'świecący cylinder 🎩',
    full: 'As Pik to Szop Magik wyciągający lśniący cylinder!'
  },
  {
    id: 'k_hearts',
    rank: 'K',
    suit: 'hearts',
    name: 'Król Kier',
    person: 'Król Artur 👑',
    action: 'wyciąga ze skały',
    object: 'złoty miecz Excalibur ⚔️',
    full: 'Król Kier to Król Artur wyciągający złoty miecz Excalibur!'
  },
  {
    id: 'q_diamonds',
    rank: 'Q',
    suit: 'diamonds',
    name: 'Dama Karo',
    person: 'Królowa Kleopatra 👸',
    action: 'rzuca w dal',
    object: 'ogromny błękitny diament 💎',
    full: 'Dama Karo to Kleopatra rzucająca ogromnym błękitnym diamentem!'
  },
  {
    id: 'j_clubs',
    rank: 'J',
    suit: 'clubs',
    name: 'Walet Trefl',
    person: 'Robin Hood 🏹',
    action: 'napina i wystrzeliwuje',
    object: 'dębowy łuk ze strzałą 🎯',
    full: 'Walet Trefl to Robin Hood strzelający z dębowego łuku!'
  },
  {
    id: '10_spades',
    rank: '10',
    suit: 'spades',
    name: '10 Pik',
    person: 'Mroczny Batman 🦇',
    action: 'szybuje i rzuca',
    object: 'czarny batarang ⚡',
    full: '10 Pik to Batman rzucający czarny batarang!'
  },
  {
    id: '7_hearts',
    rank: '7',
    suit: 'hearts',
    name: '7 Kier',
    person: 'Agent 007 🍸',
    action: 'wznosi toast',
    object: 'kieliszek złotego martini 🍸',
    full: '7 Kier to James Bond wznoszący toast kieliszkiem martini!'
  },
  {
    id: '8_diamonds',
    rank: '8',
    suit: 'diamonds',
    name: '8 Karo',
    person: 'Pirat z Karaibów 🏴‍☠️',
    action: 'otwiera z hukiem',
    object: 'skrzynia ze złotymi dukatami 🪙',
    full: '8 Karo to Pirat otwierający skrzynię ze złotymi dukatami!'
  },
  {
    id: '9_clubs',
    rank: '9',
    suit: 'clubs',
    name: '9 Trefl',
    person: 'Mądry Druid 🧙',
    action: 'uderza o ziemię',
    object: 'magiczna laska z kryształem 🪄',
    full: '9 Trefl to Druid uderzający o ziemię magiczną laską!'
  }
];

export function getCardSvg(card) {
  const suitMeta = SUITS.find(s => s.id === card.suit) || SUITS[0];
  return `
  <div class="playing-card" style="color: ${suitMeta.color};">
    <div class="pc-corner top-left">
      <span class="pc-rank">${card.rank}</span>
      <span class="pc-suit">${suitMeta.symbol}</span>
    </div>
    <div class="pc-center">
      <span class="pc-big-symbol">${suitMeta.symbol}</span>
    </div>
    <div class="pc-corner bottom-right">
      <span class="pc-rank">${card.rank}</span>
      <span class="pc-suit">${suitMeta.symbol}</span>
    </div>
  </div>`;
}
