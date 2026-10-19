/** Sztywne (nie generowane) lekcje szkolenia „Cyfry”: od 1 do 12 cyfr, z naciskiem na 9 cyfr telefonu. */

export const CHAPTERS = [
  { title: 'Kształty Cyfr i Pierwsze Kroki', emoji: '🐾', desc: 'Od 1 cyfry do pierwszej żywej historyjki' },
  { title: 'Grupowanie w Życiu (Chunking)', emoji: '✂️', desc: 'PIN do karty, kod pocztowy i płatność BLIK' },
  { title: 'Granica Millera i Telefon', emoji: '📱', desc: '7 cyfr, daty i pełny 9-cyfrowy numer telefonu!' },
  { title: 'Główny System Pamięciowy (Major)', emoji: '🖼️', desc: 'Zamiana cyfr w słowa – sekret arcymistrzów' },
  { title: 'Arcymistrzostwo', emoji: '🏆', desc: '10, 11 i 12 cyfr – poziom zawodów pamięciowych' }
];

const majorPanel = `
<div class="major">
  <p class="panel-title">Alfabet cyfr (System Major)</p>
  <div class="major-grid">
    <div><b>0</b><span>S Z C</span></div><div><b>1</b><span>T D</span></div><div><b>2</b><span>N</span></div>
    <div><b>3</b><span>M</span></div><div><b>4</b><span>R</span></div><div><b>5</b><span>L</span></div>
    <div><b>6</b><span>SZ CZ Ż</span></div><div><b>7</b><span>K G</span></div><div><b>8</b><span>F W</span></div>
    <div><b>9</b><span>P B</span></div>
  </div>
  <p class="panel-note">Samogłoski (A E I O U Y) są „za darmo” – wstawiasz je, żeby powstało słowo. <b>TOR</b> → T=1, R=4 → <b>14</b>.</p>
</div>`;

export const LESSONS = [
  // ───────── Rozdział 0: Kształty Cyfr i Pierwsze Kroki ─────────
  {
    id: 'l1', ch: 0, title: 'Jedna cyfra i jej kształt',
    intro: [
      'Miau! Cześć! Jestem kotek Mruczek 🐾 i nauczę Cię niezwykłej supermocy!',
      'Po co uczyć się cyfr? Wyobraź sobie, że w 3 sekundy zapamiętujesz kod BLIK, PIN do telefonu, kod do domofonu czy numer do rodziców w nagłej sytuacji – bez paniki i bez kartki!',
      'Sekret jest prosty: nasz mózg gubi się w nudnych cyfrach, ale uwielbia bajki i kolorowe obrazy! 🖼️',
      'Zobacz: cyfra 2 wygląda dokładnie jak dumny łabędź płynący po stawie 🦢. Spójrz na ekran i zapamiętaj łabędzia!'
    ],
    digits: '2', time: 4500, showShapes: true,
    hints: ['Cyfra 2 wygląda jak wygięta szyja łabędzia 🦢', 'Wpisz cyfrę 2!']
  },
  {
    id: 'l2', ch: 0, title: 'Dwie cyfry – pierwsza historyjka',
    intro: [
      'Świetnie! A teraz połączmy dwie cyfry: 2 (Łabędź 🦢) i 8 (Bałwan ☃️).',
      'Sekret nr 2: połącz je w absurdalną scenę w wyobraźni!',
      'Wyobraź sobie, jak Łabędź podpływa do brzegu i nakłada szalik Bałwanowi 🦢🧣☃️.'
    ],
    digits: '28', time: 5500, showShapes: true,
    hints: ['Pamiętasz scenę na śniegu? Łabędź (2) i Bałwan (8)!', 'Pierwsza cyfra to 2, druga to 8.']
  },
  {
    id: 'l3', ch: 0, title: 'Trzy cyfry – melodia obrazów',
    intro: [
      'Trzy cyfry! Użyjemy trzech kształtów: 4 (Żaglówka ⛵), 8 (Bałwan ☃️) i 2 (Łabędź 🦢).',
      'Scena: Bałwan płynie Żaglówką ciągniętą przez wielkiego Łabędzia!',
      'Możesz też powtórzyć w myślach rytm: cztery-osiem-dwa 🎵'
    ],
    digits: '482', time: 6000, showShapes: true,
    hints: ['Żaglówka (4), Bałwan (8), Łabędź (2). Ucho pomaga oku! 👂', 'Zacznij od 4 – żaglówki!']
  },

  // ───────── Rozdział 1: Grupowanie w Życiu (Chunking) ─────────
  {
    id: 'l4', ch: 1, title: 'Cztery cyfry – Twój kod PIN',
    intro: [
      'Pora na najważniejszą technikę codzienności: GRUPOWANIE (Chunking) ✂️',
      'Pamięć robocza nie lubi 4 osobnych cyfr. Zamiast 7-1-5-9 podziel je na dwie pary: 71 i 59!',
      'Dokładnie tak, jak zapamiętujesz kod PIN do karty bankomatowej.'
    ],
    digits: '7159', group: 2, time: 6500,
    hints: ['Dwie paczki: siedemdziesiąt jeden (71) i pięćdziesiąt dziewięć (59).', 'Pierwsza para to 71, druga to 59.']
  },
  {
    id: 'l5', ch: 1, title: 'Pięć cyfr – Kod pocztowy',
    intro: [
      'Pięć cyfr z rzędu bez techniki to dla większości ludzi chaos.',
      'Ale podziel je na 30 i 694 – i nagle to tylko DWA proste elementy!',
      'Zupełnie jak kod pocztowy Twojego ulubionego miasta 📮'
    ],
    digits: '30694', group: [2, 3], time: 7000,
    hints: ['Dwie paczki: 30 i 694. Dwa kawałki zamiast pięciu!', 'Zacznij od 30, potem 694.']
  },
  {
    id: 'l6', ch: 1, title: 'Sześć cyfr – Kod BLIK w 3 sekundy!',
    intro: [
      'Płacisz w internecie kodem BLIK? Kod ma 6 cyfr podzielonych 3 + 3.',
      'Zobacz: 528 i 913. Przeczytaj je jak dwie liczby: „pięćset dwadzieścia osiem” i „dziewięćset trzynaście”.',
      'Mruczek czeka na zakupy! 🛍️'
    ],
    digits: '528913', group: 3, time: 7500,
    hints: ['Dwie paczki: 528 oraz 913.', 'Pierwsza paczka: 528.']
  },

  // ───────── Rozdział 2: Granica Millera i Telefon ─────────
  {
    id: 'l7', ch: 2, title: 'Siedem cyfr – Liczba Millera',
    intro: [
      'Sławny psycholog George Miller udowodnił, że ludzka pamięć mieści 7 ± 2 elementy.',
      'Większość ludzi tu odpada. Ty podziel te 7 cyfr na 3 paczki: 730 · 52 · 91.',
      'Rytm w głowie czyni cuda!'
    ],
    digits: '7305291', group: [3, 2, 2], time: 8000,
    hints: ['Trzy paczki: 730 · 52 · 91.', 'Pierwsza paczka to 730.']
  },
  {
    id: 'l8', ch: 2, title: 'Osiem cyfr – Znane daty',
    intro: [
      'Najlepsze paczki pamięciowe to te, które już znasz!',
      'Zobaczysz 8 cyfr złożonych z dwóch słynnych dat z historii Polski 📜',
      'Mózg od razu je rozpozna!'
    ],
    digits: '14101939', group: 4, time: 8000,
    hints: ['Bitwa pod Grunwaldem (1410) i początek II wojny (1939).', '1410 i 1939.']
  },
  {
    id: 'l9', ch: 2, title: 'Dziewięć cyfr – Cały numer telefonu! 📱',
    intro: [
      'OTO ŚWIĘTY GRAAL SZKOLENIA: PEŁNE 9 CYFR! 📱',
      'Wyobraź sobie, że ktoś dyktuje Ci swój numer: 604 · 281 · 937.',
      'Trzy paczki po 3 cyfry. Powtórz je w myślach jak refren hitu z radia!'
    ],
    digits: '604281937', group: 3, time: 9500,
    hints: ['Trzy paczki: 604 · 281 · 937. Rytmicznie jak refren piosenki.', 'Pierwsza paczka: 604.']
  },

  // ───────── Rozdział 3: Główny System Pamięciowy (Major) ─────────
  {
    id: 'l10', ch: 3, title: 'Cyfry mają literki',
    panel: majorPanel,
    intro: [
      'Teraz magia arcymistrzów! ✨ System Major zamienia cyfry w SPÓŁGŁOSKI.',
      'Samogłoski (A E I O U Y) wstawiasz dowolnie, tworząc słowa!',
      'Np. 14 = T-R → „TOR” 🛤️ oraz 31 = M-T → „MATA” 🧘. Zapamiętaj obrazy!'
    ],
    digits: '1431', group: 2, time: 9000,
    cards: [{ d: '14', emoji: '🛤️', word: 'TOR' }, { d: '31', emoji: '🧘', word: 'MATA' }],
    hints: ['Tor i mata. Mata rozłożona na torze – dziwne = zapamiętane!', 'TOR = 14, MATA = 31.']
  },
  {
    id: 'l11', ch: 3, title: 'Trzy obrazy = sześć cyfr',
    panel: majorPanel,
    intro: [
      'Trzy obrazy dają aż 6 cyfr na raz! Połącz je w krótką historyjkę.',
      'Im śmieszniejsza, tym lepiej – mózg kocha absurd 🤪'
    ],
    digits: '149207', group: 2, time: 10500,
    cards: [{ d: '14', emoji: '🛤️', word: 'TOR' }, { d: '92', emoji: '🎩', word: 'PAN' }, { d: '07', emoji: '🧃', word: 'SOK' }],
    hints: ['Historyjka: PAN w cylindrze stoi na TORZE i pije SOK. 🎩🛤️🧃', 'TOR 14 → PAN 92 → SOK 07.']
  },
  {
    id: 'l12', ch: 3, title: 'Łańcuch czterech obrazów',
    panel: majorPanel,
    intro: [
      'Cztery obrazy – aż 8 cyfr! Każdy kolejny obraz wpinaj jak wagonik pociągu.',
      'FALA 🌊 uderza w NOS 👃, który trzyma LINĘ 🪢 przywiązaną do MATY 🧘!'
    ],
    digits: '85205231', group: 2, time: 13000,
    cards: [{ d: '85', emoji: '🌊', word: 'FALA' }, { d: '20', emoji: '👃', word: 'NOS' }, { d: '52', emoji: '🪢', word: 'LINA' }, { d: '31', emoji: '🧘', word: 'MATA' }],
    hints: ['FALA uderza w NOS, trzymający LINĘ przy MATIE. 🌊👃🪢🧘', 'FALA 85 · NOS 20 · LINA 52 · MATA 31.']
  },

  // ───────── Rozdział 4: Arcymistrzostwo ─────────
  {
    id: 'l13', ch: 4, title: 'Dziesięć cyfr – Pięć par',
    intro: [
      'Czas sprawdzić swoje siły bez podpowiedzi obrazkowych!',
      '10 cyfr! Zastosuj podział na 5 par: 48 · 26 · 15 · 09 · 37.'
    ],
    digits: '4826150937', group: 2, time: 11000,
    hints: ['Pięć par: 48 · 26 · 15 · 09 · 37.', 'Zaczyna się od 48.']
  },
  {
    id: 'l14', ch: 4, title: 'Numer z kierunkowym kraju (+48)',
    intro: [
      'Pełny numer z kierunkowym to aż 11 cyfr!',
      'Pierwsze dwie znasz bez mrugnięcia okiem: 48 to Polska 🇵🇱! Zostały tylko 3 paczki telefonu.'
    ],
    digits: '48602713958', group: [2, 3, 3, 3], time: 11500,
    hints: ['48 (Polska), a potem 602 · 713 · 958.', 'Polska 48, potem 602.']
  },
  {
    id: 'l15', ch: 4, title: 'Wielki Finał – 12 cyfr!',
    intro: [
      'To jest ten moment! Finałowa lekcja szkolenia: aż 12 cyfr w 4 paczkach.',
      'Połącz wszystko: kształty, rytm i grupowanie. Wierzę w Ciebie! 🌟'
    ],
    digits: '951730482615', group: 3, time: 14000,
    hints: ['Cztery paczki po trzy: 951 · 730 · 482 · 615.', '951, potem 730.']
  }
];

export const PRAISE_PERFECT = [
  'Mrrr! Perfekcyjnie! Bez żadnej podpowiedzi! 🌟', 'Mistrz pamięci! Aż mi się ogon zakręcił! 🏆', 'Idealnie! Twój mózg to superkomputer!'
];
export const PRAISE_OK = [
  'Miau! Dobra robota, tak trzymaj! 😸', 'Brawo! Pamięć rośnie w siłę! 💪', 'Tak jest! Jedziemy dalej!'
];
export const ENCOURAGE = [
  'Prawie! Pamięć to mięsień – trenuj, a urośnie 💪', 'Nic nie szkodzi! Spróbujmy jeszcze raz, tym razem spokojniej.', 'Miau… tym razem się nie udało. Ale Ty dasz radę! 🐾'
];
export const NUDGES = [
  'Hej, tu Mruczek! Potrzebujesz podpowiedzi? Przycisk 💡 czeka!', 'Nie spiesz się… ale mruczę z niecierpliwości 😸', 'Spróbuj odtworzyć cyfry „w głowie”, jakbyś je słyszał.'
];
