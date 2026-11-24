/**
 * 10 rozbudowanych, mistrzowskich lekcji Akrostychów i Rymowanek z Pieskiem Łatkiem 🐶
 * Z podziałem na rozdziały, bogatą teorią, wizualnymi podglądami i życiowymi przykładami.
 */

export const CHAPTERS = [
  {
    title: 'Haczyki Pierwszych Liter',
    emoji: '🐾',
    desc: 'Od tęczy po odległe planety i rzymskie skarby'
  },
  {
    title: 'Mistrz Języka i Nawigacji',
    emoji: '🧭',
    desc: 'Kompas w terenie, przypadki gramatyczne i ortografia'
  },
  {
    title: 'Kod Nauki, Chemii i Muzyki',
    emoji: '🔬',
    desc: 'Pierwiastki życia, witaminy, struny gitary i taksonomia'
  },
  {
    title: 'Laboratorium Tropiciela',
    emoji: '🏆',
    desc: 'Metoda tworzenia własnych akrostychów do dowolnej wiedzy'
  }
];

export const LESSONS = [
  // ─── ROZDZIAŁ 0: Haczyki Pierwszych Liter ───
  {
    id: 'dog-1',
    ch: 0,
    title: 'Sekret Tropiciela: Tęcza i pierwsze litery',
    subtitle: 'Czym jest akrostych i jak działa pamięć literowa?',
    desc: 'Odkryj tajemnicę zdań-kluczy na wesołym przykładzie kolorów tęczy.',
    speech: 'Hau, hau! Cześć! Jestem Piesek Łatek 🐶. Pokażę Ci, jak pierwsze litery słów stają się najwierniejszymi tropami pamięci!',
    theory: [
      'Po co nam ta technika? Nasz mózg bardzo szybko męczy się i gubi, gdy musi zapamiętać suchą listę rzeczy w konkretnej kolejności. Jednak gdy z pierwszych liter ułożysz jedno zabawne, rymowane zdanie – zapamiętasz całą listę w mgnieniu oka na całe życie!',
      'Ta metoda nazywa się akrostychem lub metodą pierwszych liter. Zobacz, jak łatwo zapamiętać wszystkie 6 głównych kolorów tęczy:',
      'Zdanie-trop brzmi: „Czemu Patrzysz Żabko Zielona Na Fiołki?”',
      'Spójrz na pierwsze litery każdego słowa:',
      '• Czemu → Czerwień (Czerwony 🔴)',
      '• Patrzysz → Pomarańcz (Pomarańczowy 🟠)',
      '• Żabko → Żółć (Żółty 🟡)',
      '• Zielona → Zieleń (Zielony 🟢)',
      '• Na → Niebo (Niebieski 🔵)',
      '• Fiołki → Fiolet (Fioletowy 🟣)',
      'Wystarczy, że wyobrazisz sobie małą zieloną żabkę wąchającą fiołki, a kolory tęczy ułożą się same!'
    ],
    acrostic: {
      phrase: '„Czemu Patrzysz Żabko Zielona Na Fiołki?”',
      items: [
        { letter: 'C', word: 'Czemu', target: 'Czerwony', icon: '🔴' },
        { letter: 'P', word: 'Patrzysz', target: 'Pomarańczowy', icon: '🟠' },
        { letter: 'Ż', word: 'Żabko', target: 'Żółty', icon: '🟡' },
        { letter: 'Z', word: 'Zielona', target: 'Zielony', icon: '🟢' },
        { letter: 'N', word: 'Na', target: 'Niebieski', icon: '🔵' },
        { letter: 'F', word: 'Fiołki', target: 'Fioletowy', icon: '🟣' }
      ]
    },
    task: {
      prompt: 'Jaki kolor tęczy kryje się pod słowem „Żabko” w zdaniu o tęczy?',
      options: ['Żółty (Ż jak Żabko!)', 'Zielony', 'Czerwony', 'Fioletowy'],
      correct: 0,
      hint: 'Słowo „Żabko” zaczyna się na literę Ż – to kolor Żółty!'
    }
  },
  {
    id: 'dog-2',
    ch: 0,
    title: 'Kosmiczna Flota: 8 planet w 3 sekundy',
    subtitle: 'Niezawodne zdanie o mamie smażącej placki',
    desc: 'Kolejność wszystkich planet Układu Słonecznego od Słońca.',
    speech: 'Lecimy w kosmos! 🪐 Z tym tropem zagniesz każdego nauczyciela geografii i fizyki!',
    theory: [
      'Po co nam ten trop? Pytanie o kolejność planet pojawia się w szkole, w teleturniejach i w quizach wiedzy ogólnej. Próba wkuwania ich na pamięć kończy się myleniem Merkurego z Marsem.',
      'Oto najsłynniejsze i najskuteczniejsze zdanie w polskiej edukacji:',
      '„Moja Wiecznie Zapracowana Mama Zawsze Smaży Nam Placki”',
      'Zobacz, jak każda planeta wskakuje na swoje miejsce od Słońca:',
      '1. Moja → Merkury ☀️ (najbliżej Słońca)',
      '2. Wiecznie → Wenus 🌟 (najgorętsza)',
      '3. Zapracowana → Ziemia 🌍 (nasz dom!)',
      '4. Mama → Mars 🔴 (czerwona planeta)',
      '5. Zawsze → Jowisz 🪐 (największy gazowy gigant)',
      '6. Smaży → Saturn 💫 (planeta z wielkimi pierścieniami)',
      '7. Nam → Uran ❄️ (błękitny lodowy olbrzym)',
      '8. Placki → Neptun 🌊 (najdalszy wietrzny błękit)',
      'Wyobraź sobie mamę w skafandrze kosmicznym z wielką patelnią pośród gwiazd – obraz jest tak żywy, że zostanie z Tobą na zawsze!'
    ],
    acrostic: {
      phrase: '„Moja Wiecznie Zapracowana Mama Zawsze Smaży Nam Placki”',
      items: [
        { letter: 'M', word: 'Moja', target: 'Merkury', icon: '☀️' },
        { letter: 'W', word: 'Wiecznie', target: 'Wenus', icon: '🌟' },
        { letter: 'Z', word: 'Zapracowana', target: 'Ziemia', icon: '🌍' },
        { letter: 'M', word: 'Mama', target: 'Mars', icon: '🔴' },
        { letter: 'Z', word: 'Zawsze', target: 'Jowisz', icon: '🪐' },
        { letter: 'S', word: 'Smaży', target: 'Saturn', icon: '💫' },
        { letter: 'N', word: 'Nam', target: 'Uran', icon: '❄️' },
        { letter: 'P', word: 'Placki', target: 'Neptun', icon: '🌊' }
      ]
    },
    task: {
      prompt: 'Która planeta jest czwarta od Słońca, odpowiadając słowu „Mama”?',
      options: ['Mars (czwarta planeta, czerwona jak sos!)', 'Jowisz', 'Merkury', 'Wenus'],
      correct: 0,
      hint: 'Moja (1), Wiecznie (2), Zapracowana (3), Mama (4) -> M to Mars!'
    }
  },
  {
    id: 'dog-3',
    ch: 0,
    title: 'Skarb Króla Lecha: Rzymskie liczby L, C, D, M',
    subtitle: 'Lech Chce Dobrze Mieszkać: 50, 100, 500, 1000',
    desc: 'Jak natychmiast odróżnić rzymskie setki i tysiące bez wahania?',
    speech: 'Często myli Ci się, czy D to 500 czy 100? Piesek Łatek ma na to genialny patent!',
    theory: [
      'Po co nam ten trop? Rzymskie cyfry I (1), V (5) i X (10) zna każdy. Problem zaczyna się przy wyższych wartościach: L, C, D, M. Na zegarach, pomnikach, datach w filmach i na fasadach budynków ludzie często zastanawiają się: „Ile to było C, a ile D?”.',
      'Wystarczy zapamiętać jedno proste zdanie o legendarnym królu Lechu:',
      '„Lech Chce Dobrze Mieszkać”',
      'Litery rosną w nim dokładnie tak, jak wartości rzymskie:',
      '• L = 50 (Lech)',
      '• C = 100 (Chce – od łacińskiego Centum)',
      '• D = 500 (Dobrze)',
      '• M = 1000 (Mieszkać – od łacińskiego Mille, czyli tysiąc)',
      'Teraz widzisz: L (50) < C (100) < D (500) < M (1000). Proste, eleganckie i niezawodne!'
    ],
    acrostic: {
      phrase: '„Lech Chce Dobrze Mieszkać”',
      items: [
        { letter: 'L', word: 'Lech', target: '50', icon: '🪙' },
        { letter: 'C', word: 'Chce', target: '100 (Centum)', icon: '🏛️' },
        { letter: 'D', word: 'Dobrze', target: '500', icon: '🏰' },
        { letter: 'M', word: 'Mieszkać', target: '1000 (Mille)', icon: '👑' }
      ]
    },
    task: {
      prompt: 'Jaką wartość ma rzymska litera C w zdaniu „Lech Chce Dobrze Mieszkać”?',
      options: ['100 (Chce = C = 100)', '50', '500', '1000'],
      correct: 0,
      hint: 'Lech to 50, a Chce (C) to okrągłe 100!'
    }
  },

  // ─── ROZDZIAŁ 1: Mistrz Języka i Nawigacji ───
  {
    id: 'dog-4',
    ch: 1,
    title: 'Kompas w Głowie: 4 strony świata',
    subtitle: 'Na Ekranie Siedzi Wrona: N, E, S, W',
    desc: 'Błyskawiczna orientacja na mapie i w grach terenowych.',
    speech: 'Nigdy więcej gubienia się na mapie! Pokażę Ci wronę, która zna wszystkie strony świata! 🧭',
    theory: [
      'Po co nam ten trop? Podczas czytania mapy, w nawigacji GPS lub w grach komputerowych kierunki podawane są w standardzie międzynarodowym: N, E, S, W. Wiele osób myli wschód (East) z zachodem (West).',
      'Spójrz na tarczę kompasu zgodnie z ruchem wskazówek zegara, zaczynając od góry:',
      '„Na Ekranie Siedzi Wrona”',
      '• Na (Góra) → North (Północ ⬆️)',
      '• Ekranie (Prawo) → East (Wschód ➡️)',
      '• Siedzi (Dół) → South (Południe ⬇️)',
      '• Wrona (Lewo) → West (Zachód ⬅️)',
      'Gdy spojrzysz na mapę, od razu widzisz czarną wronę siedzącą po lewej stronie ekranu i bez wahania wiesz, gdzie jest East, a gdzie West!'
    ],
    acrostic: {
      phrase: '„Na Ekranie Siedzi Wrona”',
      items: [
        { letter: 'N', word: 'Na', target: 'North (Północ ⬆️)', icon: '🧭' },
        { letter: 'E', word: 'Ekranie', target: 'East (Wschód ➡️)', icon: '🌅' },
        { letter: 'S', word: 'Siedzi', target: 'South (Południe ⬇️)', icon: '🌴' },
        { letter: 'W', word: 'Wrona', target: 'West (Zachód ⬅️)', icon: '🌄' }
      ]
    },
    task: {
      prompt: 'Który kierunek znajduje się po prawej stronie mapy (odpowiadający słowu „Ekranie”)?',
      options: ['East / Wschód (w prawo ➡️)', 'West / Zachód', 'North / Północ', 'South / Południe'],
      correct: 0,
      hint: 'Na (góra) -> Ekranie (prawo) -> Siedzi (dół) -> Wrona (lewo)!'
    }
  },
  {
    id: 'dog-5',
    ch: 1,
    title: 'Pogromca Deklinacji: 7 przypadków polskich',
    subtitle: 'Mama Dała Córce Bułkę Nasmarowaną Masłem Wiejskim',
    desc: 'Kompletna deklinacja języka polskiego bez zająknięcia.',
    speech: 'Przypadki w szkole bywają zmorą, ale z bułką z wiejskim masłem nauczysz się ich w minutę! 🍞',
    theory: [
      'Po co nam ten trop? W języku polskim mamy 7 przypadków gramatycznych. Uczniowie godzinami próbują zapamiętać ich kolejność, myląc celownik z biernikiem lub narzędnik z miejscownikiem.',
      'Oto pyszne zdanie-klucz, które rozwiązuje ten problem raz na zawsze:',
      '„Mama Dała Córce Bułkę Nasmarowaną Masłem Wiejskim”',
      'Każde słowo to pierwszy człon kolejnego przypadku z pytaniami:',
      '1. Mama → Mianownik (kto? co? – jest)',
      '2. Dała → Dopełniacz (kogo? czego? – nie ma)',
      '3. Córce → Celownik (komu? czemu? – się przyglądam)',
      '4. Bułkę → Biernik (kogo? co? – widzę)',
      '5. Nasmarowaną → Narzędnik (z kim? z czym? – idę)',
      '6. Masłem → Miejscownik (o kim? o czym? – rozmawiam)',
      '7. Wiejskim → Wołacz (o! – witaj!)',
      'Z taką bułką żaden sprawdzian z języka polskiego Cię nie zaskoczy!'
    ],
    acrostic: {
      phrase: '„Mama Dała Córce Bułkę Nasmarowaną Masłem Wiejskim”',
      items: [
        { letter: 'M', word: 'Mama', target: 'Mianownik (kto? co?)', icon: '👩' },
        { letter: 'D', word: 'Dała', target: 'Dopełniacz (kogo? czego?)', icon: '🤲' },
        { letter: 'C', word: 'Córce', target: 'Celownik (komu? czemu?)', icon: '👧' },
        { letter: 'B', word: 'Bułkę', target: 'Biernik (kogo? co?)', icon: '🥖' },
        { letter: 'N', word: 'Nasmarowaną', target: 'Narzędnik (z kim? z czym?)', icon: '🧈' },
        { letter: 'M', word: 'Masłem', target: 'Miejscownik (o kim? o czym?)', icon: '🥣' },
        { letter: 'W', word: 'Wiejskim', target: 'Wołacz (o!)', icon: '📣' }
      ]
    },
    task: {
      prompt: 'Jaki przypadek odpowiada słowu „Córce” (trzecie słowo w zdaniu)?',
      options: ['Celownik (komu? czemu? Córce!)', 'Biernik', 'Dopełniacz', 'Miejscownik'],
      correct: 0,
      hint: 'Mama (Mianownik), Dała (Dopełniacz), Córce (Celownik)!'
    }
  },
  {
    id: 'dog-6',
    ch: 1,
    title: 'Niezłomna Ortografia: Rymowanki na ratunek',
    subtitle: 'Rymy ortograficzne, które zostają w głowie na całe życie',
    desc: 'Jak rymy i wierszyki eliminują błędy z „-uje”, „-by” i „rz”.',
    speech: 'Koniec z czerwonym długopisem w zeszycie! Rymowane zaklęcia Łatka działają jak tarcza! 🛡️',
    theory: [
      'Po co nam rymowanki? Nasz słuch kocha rym i rytm. Suche regułki gramatyczne ulatują z głowy, ale wierszyk o prostej melodyjce zapamiętujemy natychmiast.',
      'Oto 3 złote zasady, które uratowały miliony uczniów przed dwójami:',
      '1. Końcówka „-uje”: „Kto kreskuje -uje, ten dwóje otrzymuje!” (maluje, rysuje, gotuje – ZAWSZE przez u zwykłe!).',
      '2. Cząstka „-by”: Z czasownikami w formie osobowej PISZEMY ZAWSZE RAZEM: zrobiłby, poszedłby, zaśpiewałaby.',
      '3. Rz po spółgłoskach (p, b, t, d, k, g, ch, j, w): Zdanie-trop brzmi: „Prosił Bohaterski Tygrys Dobrego Konia, Gdy Chciał Jeść Warzywa”. Po literach P, B, T, D, K, G, CH, J, W piszemy RZ (np. przyjaciel, brzeg, trzeba, drzewo, krzak)!',
      'Wystarczy zanucić wierszyk i wiesz, jaką literę postawić na kartce!'
    ],
    acrostic: {
      phrase: '„Kto kreskuje -uje, ten dwóje otrzymuje!”',
      items: [
        { letter: 'U', word: '-uje', target: 'Zawsze przez u zwykłe!', icon: '✍️' },
        { letter: 'BY', word: '-by', target: 'Razem z czasownikami!', icon: '🔗' },
        { letter: 'RZ', word: 'p,b,t,d...', target: 'Rz po spółgłoskach!', icon: '✨' }
      ]
    },
    task: {
      prompt: 'Jak brzmi złota zasada dotycząca pisowni wyrazów zakończonych na „-uje” (np. maluje, trenuje)?',
      options: [
        'Zawsze przez „u” otwarte („Kto kreskuje -uje, ten dwóje otrzymuje”)!',
        'Zawsze przez „ó” z kreską',
        'Zależy od tego, czy wyraz jest długi czy krótki',
        'Z końcówką „-óje” w liczbie mnogiej'
      ],
      correct: 0,
      hint: 'Pamiętasz rymowankę? Kto kreskuje -uje, ten dwóje otrzymuje!'
    }
  },

  // ─── ROZDZIAŁ 2: Kod Nauki, Chemii i Muzyki ───
  {
    id: 'dog-7',
    ch: 2,
    title: 'Cząstki Życia i Zdrowia: CHNOPS i Witaminy',
    subtitle: 'Kluczowe pierwiastki biogenne i witaminy rozpuszczalne w tłuszczach',
    desc: 'Akronimy, które otwierają drzwi do biologii i medycyny.',
    speech: 'Hau! Wskakujemy w fartuch laboratoryjny! Pokażę Ci, z czego zbudowany jest każdy człowiek! 🧪',
    theory: [
      'Po co nam ten trop? Chemia i biologia pełne są trudnych nazw. Na szczęście naukowcy stworzyli genialne akronimy, które streszczają całe rozdziały podręcznika.',
      '1. Pierwiastki biogenne CHNOPS: Aż 96% masy ciała człowieka składa się z zaledwie 6 pierwiastków:',
      '• C → Węgiel (Carbon 🧬)',
      '• H → Wodór (Hydrogen 💧)',
      '• N → Azot (Nitrogen 💨)',
      '• O → Tlen (Oxygen 🫁)',
      '• P → Fosfor (Phosphorus 🦴 - mocne kości)',
      '• S → Siarka (Sulfur 💅 - włosy i paznokcie)',
      '2. Witaminy rozpuszczalne w tłuszczach: Witaminy dzielą się na rozpuszczalne w wodzie i tłuszczach. Te drugie tworzą imię chłopca: ADEK (witaminy A, D, E, K)!',
      'Wyobraź sobie chłopca ADEK pijącego mleko z masłem (tłuszcz!), a zapamiętasz to na całe życie!'
    ],
    acrostic: {
      phrase: '„CHNOPS buduje ciało, a ADEK kocha masło!”',
      items: [
        { letter: 'C', word: 'Carbon', target: 'Węgiel', icon: '🧬' },
        { letter: 'H', word: 'Hydrogen', target: 'Wodór', icon: '💧' },
        { letter: 'N', word: 'Nitrogen', target: 'Azot', icon: '💨' },
        { letter: 'O', word: 'Oxygen', target: 'Tlen', icon: '🫁' },
        { letter: 'P', word: 'Phosphorus', target: 'Fosfor', icon: '🦴' },
        { letter: 'S', word: 'Sulfur', target: 'Siarka', icon: '⚡' }
      ]
    },
    task: {
      prompt: 'Które 4 witaminy rozpuszczają się w tłuszczach, tworząc imię chłopca „ADEK”?',
      options: ['A, D, E, K (Witaminy ADEK)', 'B, C, D, E', 'A, B, C, D', 'C, D, E, K'],
      correct: 0,
      hint: 'Wystarczy połączyć litery w słowo ADEK: witaminy A, D, E oraz K!'
    }
  },
  {
    id: 'dog-8',
    ch: 2,
    title: 'Muzyczne Struny: Dźwięki E H G D A E',
    subtitle: 'Edek Hoduje Gołębie Dla Agaty Ewy',
    desc: 'Jak w sekundę zapamiętać nazwy wszystkich 6 strun gitary.',
    speech: 'Chcesz zagrać rockowy kawałek? Piesek Łatek podpowie Ci, jak nastroić gitarę! 🎸',
    theory: [
      'Po co nam ten trop? Każdy, kto zaczyna naukę gry na gitarze klasycznej, akustycznej lub elektrycznej, musi znać dźwięki pustych strun. Początkujący bez przerwy mylą kolejność strun basowych i wiolinowych.',
      'Struny gitary liczymy od najcieńszej (na dole, e1) do najgrubszej (na górze, E6):',
      'Zdanie-klucz brzmi: „Edek Hoduje Gołębie Dla Agaty Ewy”',
      'Zobacz dźwięki kolejnych strun:',
      '• Edek → e (struna 1, wiolinowa – najwyższy dźwięk 🎶)',
      '• Hoduje → h (struna 2)',
      '• Gołębie → g (struna 3)',
      '• Dla → d (struna 4)',
      '• Agaty → a (struna 5)',
      '• Ewy → E (struna 6, basowa – najgrubsza! 🎸)',
      'Dzięki Edkowi i jego gołębiom nastrojenie instrumentu staje się dziecinnie proste!'
    ],
    acrostic: {
      phrase: '„Edek Hoduje Gołębie Dla Agaty Ewy”',
      items: [
        { letter: 'E', word: 'Edek', target: 'struna 1 (e)', icon: '🎵' },
        { letter: 'H', word: 'Hoduje', target: 'struna 2 (h)', icon: '🕊️' },
        { letter: 'G', word: 'Gołębie', target: 'struna 3 (g)', icon: '🎶' },
        { letter: 'D', word: 'Dla', target: 'struna 4 (d)', icon: '🎸' },
        { letter: 'A', word: 'Agaty', target: 'struna 5 (a)', icon: '✨' },
        { letter: 'E', word: 'Ewy', target: 'struna 6 (E basowe)', icon: '🔊' }
      ]
    },
    task: {
      prompt: 'Jaki dźwięk ma najgrubsza, szósta struna basowa w gitarze (słowo „Ewy”)?',
      options: ['E (grube E basowe)', 'A', 'D', 'H'],
      correct: 0,
      hint: 'Edek (1), Hoduje (2), Gołębie (3), Dla (4), Agaty (5), Ewy (6 -> E)!'
    }
  },
  {
    id: 'dog-9',
    ch: 2,
    title: 'Drabina Linneusza: Klasyfikacja Biologiczna',
    subtitle: 'Król Tybetański Gryzł Rybę Rodzinną Rano Gotowaną',
    desc: 'Pełna hierarchia systematyki organizmów od królestwa po gatunek.',
    speech: 'Hau! Wytropmy ewolucję! To zdanie to prawdziwy hit wśród olimpijczyków biologii! 🐾🌿',
    theory: [
      'Po co nam ten trop? Systematyka biologiczna stworzona przez Karola Linneusza to fundament nauk o przyrodzie. Uczniowie nagminnie mylą, czy rząd jest przed rodziną, czy gromada przed typem.',
      'Oto legendarne zdanie z polskiej dydaktyki:',
      '„Król Tybetański Gryzł Rybę Rodzinną Rano Gotowaną”',
      'Każde słowo to szczebel taksonomiczny od najszerszego do najwęższego:',
      '1. Król → Królestwo (np. zwierzęta 🦁)',
      '2. Tybetański → Typ (np. strunowce)',
      '3. Gryzł → Gromada (np. ssaki 🐾)',
      '4. Rybę → Rząd (np. drapieżne)',
      '5. Rodzinną → Rodzina (np. psowate 🐶)',
      '6. Rano → Rodzaj (np. pies / Canis)',
      '7. Gotowaną → Gatunek (np. pies domowy / Canis familiaris)',
      'Widzisz tybetańskiego króla gryzącego gotowaną rybę i cała drabina biologiczna stoi przed Tobą otworem!'
    ],
    acrostic: {
      phrase: '„Król Tybetański Gryzł Rybę Rodzinną Rano Gotowaną”',
      items: [
        { letter: 'K', word: 'Król', target: 'Królestwo', icon: '👑' },
        { letter: 'T', word: 'Tybetański', target: 'Typ', icon: '🏔️' },
        { letter: 'G', word: 'Gryzł', target: 'Gromada', icon: '🦷' },
        { letter: 'R', word: 'Rybę', target: 'Rząd', icon: '🐟' },
        { letter: 'R', word: 'Rodzinną', target: 'Rodzina', icon: '🏡' },
        { letter: 'R', word: 'Rano', target: 'Rodzaj', icon: '🌅' },
        { letter: 'G', word: 'Gotowaną', target: 'Gatunek', icon: '🍲' }
      ]
    },
    task: {
      prompt: 'Która ranga biologiczna odpowiada słowu „Gryzł” (trzeci szczebel od góry)?',
      options: ['Gromada (Królestwo -> Typ -> Gromada)', 'Gatunek', 'Rząd', 'Rodzina'],
      correct: 0,
      hint: 'Król (Królestwo), Tybetański (Typ), Gryzł (Gromada)!'
    }
  },

  // ─── ROZDZIAŁ 3: Laboratorium Tropiciela ───
  {
    id: 'dog-10',
    ch: 3,
    title: 'Fabryka Własnych Tropów: Generuj akrostychy',
    subtitle: '3 złote zasady tworzenia własnych mnemotechnik do wszystkiego',
    desc: 'Finał szkolenia u Pieska Łatka! Zostań niezależnym twórcą pamięci.',
    speech: 'Hau! Dotarłeś na szczyt! 🏆 Teraz posiądziesz najcenniejszą wiedzę: jak samemu stworzyć akrostych do absolutnie każdej listy na świecie!',
    theory: [
      'Gratulacje! Znasz już potęgę akrostychów w szkole, nauce i życiu. Czas na mistrzostwo: jak ułożyć własne zdanie-klucz w 3 prostych krokach?',
      'Oto algorytm Pieska Łatka:',
      '1. 📝 Wypisz pierwsze litery: Zapisz słowa, które musisz zapamiętać i podkreśl ich pierwsze litery (np. zakupy: Chleb, Masło, Pomidory, Ser → C, M, P, S).',
      '2. 🤪 Znajdź śmieszne, żywe słowa: Nie twórz nudnych zdań! Twój mózg ignoruje przeciętność. Ułóż coś zaskakującego, np. „Czarny Małpiszon Pożarł Śrubokręt!” (C, M, P, S).',
      '3. 🎨 Zobacz to w wyobraźni: Zamknij oczy na 3 sekundy i zobacz wielką czarną małpę z wielkim uśmiechem i śrubokrętem. Poczuj emocje, śmiech i absurd!',
      'Gotowe! Z tym 3-krokowym algorytmem zapamiętasz przemówienie na 10 punktów, procedurę w pracy, etapy projektu czy listę rzeczy na wakacje!'
    ],
    acrostic: {
      phrase: '„Wypisz litery → Dodaj humor → Zobacz obraz w głowie!”',
      items: [
        { letter: '1', word: 'Litery', target: 'Wypisz pierwsze litery listy', icon: '🔤' },
        { letter: '2', word: 'Humor', target: 'Ułóż zabawne, absurdalne zdanie', icon: '😄' },
        { letter: '3', word: 'Wizja', target: 'Zobacz scenę w wyobraźni na 3 sekundy', icon: '🧠' }
      ]
    },
    task: {
      prompt: 'Co sprawia, że własny akrostych zostaje najsilniej utrwalony w ludzkiej pamięci?',
      options: [
        'Humor, absurd i żywe wyobrażenie sobie całej sceny w myślach',
        'Zapisanie go nudnym, szarym ołówkiem w zeszycie',
        'Używanie wyłącznie trudnych, naukowych słów',
        'Powtarzanie go po cichu sto razy bez żadnych obrazów'
      ],
      correct: 0,
      hint: 'Mózg kocha humor i żywe obrazy – im zdanie jest bardziej zabawne i niezwykłe, tym silniejszy ślad pamięciowy!'
    }
  }
];
