import { LINK_ITEMS } from './chains.js';

export const LESSONS = [
  {
    id: 'link-1',
    title: 'Efekt domina: Pierwsze 4 ogniwa',
    subtitle: 'Parasol ☂️ → Arbuz 🍉 → Rower 🚲 → Zegar ⏰',
    desc: 'Odkryj zasadę dynamicznej akcji i zapamiętaj pierwsze 4 ogniwa wielkiego łańcucha.',
    speech: 'Chrup, chrup! Cześć! Jestem Wiewiórka Basia 🐿️ Zawsze wiem, gdzie schowałam każdy orzeszek! Nauczę Cię metody łańcucha skojarzeń – dzięki niej zapamiętasz całą listę aż 20 rzeczy bez ani jednej kartki papieru!',
    theory: [
      'Po co nam ta technika? Ile razy zdarzyło Ci się zapomnieć rzeczy do szkoły, listy zakupów czy punktów prezentacji?',
      'Metoda łańcuchowa łączy myśli w głowie jak klocki domina: gdy popchniesz pierwszy klocek, cała reszta sama wskakuje do pamięci!',
      'ZASADA NR 1: PRAWIDŁO DYNAMICZNEJ AKCJI:',
      'Nasz mózg natychmiast zapomina nudne, spokojne obrazki. Aby coś zapamiętać na zawsze, potrzebujesz ruchu, dźwięku i zderzenia!',
      'Poznajmy pierwsze 4 ogniwa naszego wielkiego łańcucha:',
      '1. PARASOL ☂️ → otwiera się z potężnym hukiem i z impetem taranuje wielkiego soczystego...',
      '2. ARBUZA 🍉 → który eksploduje fontanną słodkiego czerwonego soku, na którym ślizga się...',
      '3. ROWER 🚲 → który trąbi klaksonem i z łomotem wpada na gigantyczny...',
      '4. ZEGAR ⏰ → który dzwoni jak oszalały!'
    ],
    task: {
      prompt: 'W jaki sposób PARASOL łączy się w wyobraźni z ARBUZEM?',
      options: [
        'Parasol wystrzeliwuje i z impetem taranuje arbuza, rozbryzgując czerwony sok!',
        'Parasol leży spokojnie na stole obok arbuza',
        'Parasol i arbuz są czarno-białe',
        'Parasol wisi na wieszaku w sklepie'
      ],
      correct: 0,
      hint: 'Wybierz najbardziej wybuchową, dynamiczną akcję!'
    }
  },
  {
    id: 'link-2',
    title: 'Zmysły i przesada: Ogniwa 4 do 8',
    subtitle: 'Zegar ⏰ → Balon 🎈 → Kaktus 🌵 → Gitara 🎸 → Lody 🍦',
    desc: 'Włączamy dźwięk, dotyk i gigantyczne rozmiary w kolejnych 4 ogniwach.',
    speech: 'Włączamy zmysły! Zobacz, jak zegar porywa balon na kaktus, a gitara gra rocka w lodach!',
    theory: [
      'Aby łańcuch trzymał jak ze stali, używaj zmysłów: dźwięku, dotyku i komicznej przesady!',
      'Dołączamy kolejne 4 ogniwa do naszego pociągu (mamy już 8!):',
      '4. ZEGAR ⏰ → dzwoni na alarm, a z jego tarczy wyskakuje kolorowy...',
      '5. BALON 🎈 → który unosi się wysoko w niebo i z hukiem pęka, bo nabija się na kolczasty...',
      '6. KAKTUS 🌵 → w który z głośnym brzękiem uderza spadająca z nieba elektryczna...',
      '7. GITARA 🎸 → grająca ostre rockowe solo, na której struny z góry skapują wielkie truskawkowe...',
      '8. LODY 🍦 → które zalewają gryf gitary słodkim kremem!'
    ],
    task: {
      prompt: 'Co dzieje się z GITARĄ 🎸 po zderzeniu z kaktusem?',
      options: [
        'Gra rockowe solo, a na jej struny skapują z góry truskawkowe lody 🍦',
        'Zostaje schowana do futerału',
        'Leży cicho w szafie',
        'Zamienia się w drewno'
      ],
      correct: 0,
      hint: 'Gitara gra rocka, a lody skapują na jej struny!'
    }
  },
  {
    id: 'link-3',
    title: 'Zagadka w jaskini: Ogniwa 8 do 12',
    subtitle: 'Lody 🍦 → Klucz 🔑 → Latarka 🔦 → Skarb 💎 → Smok 🐉',
    desc: 'Odkryj tajemnicę klucza, latarki, skarbu i smoka – już 12 ogniw!',
    speech: 'Mamy już 12 ogniw! W lodach tkwi klucz, latarka rozświetla skarb, a w jaskini czuwa smok!',
    theory: [
      'Wielka zaleta łańcucha: skupiasz się ZAWSZE tylko na bieżącej parze ogniw (A i B). Reszta przyjdzie sama!',
      'Budujemy kolejne 4 fascynujące ogniwa:',
      '8. LODY 🍦 → wgryzasz się w lody i nagle zgrzytasz zębami o zamrożony w środku złoty...',
      '9. KLUCZ 🔑 → wyjmujesz klucz, a w ciemności rozświetla go silnym laserowym snopem potężna...',
      '10. LATARKA 🔦 → promień latarki pada w głąb jaskini i ukazuje olbrzymi, błyszczący...',
      '11. SKARB 💎 → pełen diamentów i złota, którego z groźnym rykiem pilnuje zielony...',
      '12. SMOK 🐉 → ziejący kłębami ognia!'
    ],
    task: {
      prompt: 'W jaki sposób KLUCZ 🔑 łączy się w łańcuchu z LATARKĄ 🔦?',
      options: [
        'Złoty klucz rozświetla w ciemności silny snop światła z latarki',
        'Klucz leży w szufladzie, a latarka na biurku',
        'Latarka ma wyjęte baterie',
        'Klucz jest z plastiku'
      ],
      correct: 0,
      hint: 'Latarka oświetla klucz jaskrawym promieniem!'
    }
  },
  {
    id: 'link-4',
    title: 'Kosmiczny lot: Ogniwa 12 do 16',
    subtitle: 'Smok 🐉 → Rakieta 🚀 → Księżyc 🌙 → Ser 🧀 → Mysz 🐭',
    desc: 'Smok odpala rakietę i leci na serowy księżyc! Opanowane aż 16 ogniw.',
    speech: 'Kosmiczny lot u Basi! Smok odpala rakietę i ląduje na księżycu z sera! To już 16 ogniw!',
    theory: [
      'Mózg uwielbia opowieści z rozmachem – im bardziej fantastyczne, tym silniejszy ślad pamięciowy!',
      'Łączymy kolejne 4 ogniwa kosmicznej podróży:',
      '12. SMOK 🐉 → macha skrzydłami, zieje ogniem i z rykiem odpala kosmiczną...',
      '13. RAKIETĘ 🚀 → która z rykiem silników leci prosto w kosmos i ląduje na srebrzystym...',
      '14. KSIĘŻYCU 🌙 → który po wbiciu flagi okazuje się w całości zrobiony ze smakowitego, żółtego...',
      '15. SERA 🧀 → z wielkimi dziurami, w których biega i wygryza kawałki wesoła polna...',
      '16. MYSZ 🐭 → z długim ogonkiem!'
    ],
    task: {
      prompt: 'Co okazuje się po wylądowaniu rakiety na KSIĘŻYCU 🌙?',
      options: [
        'Księżyc jest w całości zrobiony z żółtego sera 🧀, w którym biega mysz!',
        'Księżyc jest zimną skałą bez niczego',
        'Rakieta zawraca na Ziemię',
        'Księżyc gaśnie i znika'
      ],
      correct: 0,
      hint: 'Księżyc z żółtego sera!'
    }
  },
  {
    id: 'link-5',
    title: 'Finałowa piątka i bieg w tył: 16 do 20',
    subtitle: 'Mysz 🐭 → Trampolina 🎪 → Tort 🎂 → Świeca 🕯️ → Kryształ 🔮',
    desc: 'Ostatnie 4 ogniwa i niezwykła umiejętność odtwarzania całego łańcucha od końca!',
    speech: 'Mamy komplet 20 ogniw! A teraz najfajniejsza supermoc: odtworzymy wszystko od tyłu!',
    theory: [
      'Dopinamy ostatnie ogniwa do pełnej liczby DWUDZIESTU:',
      '16. MYSZ 🐭 → wystraszona ucieka i z impetem skacze wysoko na sprężystą...',
      '17. TRAMPOLINĘ 🎪 → która wystrzeliwuje mysz jak z procy prosto w wielki czekoladowy...',
      '18. TORT 🎂 → na którego samym szczycie płonie woskowa...',
      '19. ŚWIECA 🕯️ → której gorący wosk zastyga w magiczny, lśniący...',
      '20. KRYSZTAŁ 🔮 → odbijający w środku całą naszą niesamowitą przygodę!',
      'SUPERMOC: Ten łańcuch działa w obie strony! Cofnij się od końca:',
      'Kryształ ← Świeca ← Tort ← Trampolina ← Mysz... i tak aż do Parasola!'
    ],
    task: {
      prompt: 'Co zastyga z wosku płonącej ŚWIECY 🕯️ na torcie, kończąc 20-elementowy łańcuch?',
      options: [
        'Magiczny, lśniący KRYSZTAŁ 🔮',
        'Zwykły szary kamień',
        'Kawałek drewna',
        'Kropla wody'
      ],
      correct: 0,
      hint: 'Wosk zamienia się w błyszczący kryształ!'
    }
  },
  {
    id: 'link-6',
    title: 'Egzamin Mistrza: Cały łańcuch 20 ogniw!',
    subtitle: 'Kompletna lista 20 skarbów pamięci',
    desc: 'Wielki sprawdzian u Wiewiórki Basi. Sprawdź, jak bez wysiłku znasz całe 20 wyrazów po kolei!',
    speech: 'Wielki Finał u Wiewiórki Basi! Właśnie nauczyłeś się listy 20 wyrazów w idealnym porządku! Jesteś prawdziwym Mistrzem Skojarzeń! 🐿️🏆',
    theory: [
      'Spójrz na to, czego dokonałeś bez ani jednej kartki papieru:',
      '1. Parasol ☂️ → 2. Arbuz 🍉 → 3. Rower 🚲 → 4. Zegar ⏰ → 5. Balon 🎈 →',
      '6. Kaktus 🌵 → 7. Gitara 🎸 → 8. Lody 🍦 → 9. Klucz 🔑 → 10. Latarka 🔦 →',
      '11. Skarb 💎 → 12. Smok 🐉 → 13. Rakieta 🚀 → 14. Księżyc 🌙 → 15. Ser 🧀 →',
      '16. Mysz 🐭 → 17. Trampolina 🎪 → 18. Tort 🎂 → 19. Świeca 🕯️ → 20. Kryształ 🔮.',
      'Każde ogniwo nieuchronnie pociąga kolejne. Możesz w ten sposób zapamiętać przemówienie, procedurę czy 20 sprawunków na zakupy!',
      'Wiewiórka Basia kręci z radości piruety i wręcza Ci Złotego Orzeszka Pamięci! 🌰✨'
    ],
    task: {
      prompt: 'Co znajduje się bezpośrednio po SKARBIE (11), a przed RAKIETĄ (13)?',
      options: [
        'Smok 🐉 (strzegący skarbu i odpalający rakietę)',
        'Gitara 🎸',
        'Zegar ⏰',
        'Tort 🎂'
      ],
      correct: 0,
      hint: 'Skarbu pilnował ziejący ogniem smok, który wsiadł do rakiety!'
    }
  }
];
