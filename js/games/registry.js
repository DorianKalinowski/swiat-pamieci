/**
 * Rejestr 8 systemów pamięciowych i gier Świat Pamięci.
 * Każda gra ma dedykowaną uroczą maskotkę, interaktywne szkolenie i bogatą grę swobodną.
 */
export const GAMES = [
  {
    id: 'digits',
    title: 'Cyfry',
    emoji: '🐱',
    status: 'ready',
    tagline: 'Zapamiętuj numery telefonów, PIN i ciągi cyfr. Szkolenie z Kotkiem Mruczkiem + 6 trybów gry swobodnej.',
    accent: ['#7c5cff', '#ff6bd6'],
    tags: ['Kotek Mruczek 🐱', '9 lekcji', '6 trybów', 'Kształty cyfr'],
    load: () => import('./digits/index.js')
  },
  {
    id: 'palace',
    title: 'Pałac pamięci',
    emoji: '🐯',
    status: 'ready',
    tagline: 'Metoda Loci i spacer po komnatach. Szkolenie z Tygryskiem Leonem + 5 wariantów gry swobodnej.',
    accent: ['#ff9233', '#ffc857'],
    tags: ['Tygrysek Leon 🐯', '8 lekcji', '5 wariantów', 'Metoda Loci'],
    load: () => import('./palace/index.js')
  },
  {
    id: 'names',
    title: 'Imiona i twarze',
    emoji: '🦊',
    status: 'ready',
    tagline: 'Nigdy więcej „znam tę twarz, ale jak on miał na imię?”. Kotwice cech i mosty fonetyczne z Liskiem.',
    accent: ['#ff6b35', '#f7971e'],
    tags: ['Lisek Bystrzak 🦊', '6 lekcji', '4 warianty', 'Kotwice twarzy'],
    load: () => import('./names/index.js')
  },
  {
    id: 'major',
    title: 'System Major',
    emoji: '🦉',
    status: 'ready',
    tagline: 'Tajemny kod mistrzów: zamieniaj cyfry 0-9 na spółgłoski, słowa i żywe obrazy ze Sówką Profesorem.',
    accent: ['#8a2be2', '#da70d6'],
    tags: ['Sówka Profesor 🦉', '8 wykładów', '4 warianty', 'Kołki fonetyczne'],
    load: () => import('./major/index.js')
  },
  {
    id: 'words',
    title: 'Słówka i języki obce',
    emoji: '🦜',
    status: 'ready',
    tagline: 'Angielski i hiszpański w mig! Metoda słów-kluczy (Keyword Method) z kolorową Papużką Polą.',
    accent: ['#00b09b', '#96c93d'],
    tags: ['Papużka Pola 🦜', '6 lekcji', '4 warianty', 'Słowa-klucze'],
    load: () => import('./words/index.js')
  },
  {
    id: 'cards',
    title: 'Karty do gry',
    emoji: '🦝',
    status: 'ready',
    tagline: 'Cała talia 52 kart w głowie! System PAO (Postać - Akcja - Obiekt) prowadzony przez Szopa Magika.',
    accent: ['#e11d48', '#fb7185'],
    tags: ['Szop Magik 🦝', '6 lekcji', '4 warianty', 'System PAO'],
    load: () => import('./cards/index.js')
  },
  {
    id: 'link',
    title: 'Łańcuch skojarzeń',
    emoji: '🐿️',
    status: 'ready',
    tagline: 'Efekt domina w pamięci! Zapamiętuj listy zakupów, przemówienia i procedury z Wiewiórką Basią.',
    accent: ['#d35400', '#f39c12'],
    tags: ['Wiewiórka Basia 🐿️', '6 lekcji', '4 warianty', 'Efekt domina'],
    load: () => import('./link/index.js')
  },
  {
    id: 'calendar',
    title: 'Kalendarz w głowie',
    emoji: '🐢',
    status: 'ready',
    tagline: 'Dzień tygodnia dowolnej daty w historii w 3 sekundy. Genialny algorytm Doomsday z Żółwikiem Zegarowym.',
    accent: ['#16a34a', '#22c55e'],
    tags: ['Żółwik Zegarowy 🐢', '6 lekcji', '4 warianty', 'Algorytm Doomsday'],
    load: () => import('./calendar/index.js')
  }
];
