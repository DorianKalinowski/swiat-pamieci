/**
 * 10 rozbudowanych, mistrzowskich lekcji Map Myśli (Mind Mapping) z Ośmiornicą Inką 🐙
 * Z podziałem na rozdziały, diagramami porównawczymi, bogatą teorią i życiowymi przykładami.
 */

export const CHAPTERS = [
  {
    title: 'Rewolucja Nielinearna',
    emoji: '🐙',
    desc: 'Dlaczego mózg kocha myślenie promieniste, a nie szary tekst?'
  },
  {
    title: 'Narzędzia Kartografa',
    emoji: '🎨',
    desc: 'Słowa-klucze, piktogramy i kodowanie barwami'
  },
  {
    title: 'Architektura Drzewa Wiedzy',
    emoji: '🌳',
    desc: 'Hierarchia grubości linii, drukowane pismo i powiązania'
  },
  {
    title: 'Mapy Myśli w Codziennym Życiu',
    emoji: '🚀',
    desc: 'Streszczanie podręczników, wystąpienia bez kartki i projekty'
  }
];

export const LESSONS = [
  // ─── ROZDZIAŁ 0: Rewolucja Nielinearna ───
  {
    id: 'mindmap-1',
    ch: 0,
    title: 'Czym jest mapa myśli? Mózg myśli promieniście!',
    subtitle: 'Dlaczego tradycyjne notatki linijka po linijce usypiają umysł?',
    desc: 'Odkryj tajemnicę nielinearnego myślenia i przewagę nad szarym tekstem.',
    speech: 'Plusk! Cześć! Jestem Ośmiornica Inka 🐙. Pokażę Ci, jak mój atrament i 8 macek porządkują każdą wiedzę na świecie!',
    theory: [
      'Po co nam ta technika? W szkole i pracy uczono nas pisać notatki linijka pod linijką, od góry do dołu, jednym kolorem długopisu. Dla naszego mózgu taki jednolity blok tekstu jest szary i nudny – po 10 minutach czytania oczy się męczą, a treść wylatuje z głowy.',
      'Twój mózg nie myśli w prostych liniach! Myśli promieniście – od jednego kluczowego pomysłu wybuchają we wszystkich kierunkach setki powiązanych skojarzeń, dokładnie tak, jak rozchodzą się macki ośmiornicy lub promienie słońca!',
      'Gdy słyszysz słowo „PIES”, nie wyświetla Ci się w głowie czarny napis P-I-E-S na białym tle, prawda? Widzisz merdający ogon, słyszysz szczekanie, przypominasz sobie spacer w parku i miękką sierść!',
      'Mapa myśli łączy obie półkule mózgu: lewą (słowa, logika, liczby) z prawą (kolory, przestrzeń, wyobraźnia i rytm). Dzięki temu zapamiętujesz 5 razy szybciej i uczysz się bez znużenia!'
    ],
    diagram: {
      type: 'comparison',
      bad: {
        title: '❌ Tradycyjna szara notatka',
        desc: 'Jednokolorowy blok tekstu. Oko gubi się w linijkach, mózg zasypia, powtórka trwa długo i męczy wzrok.'
      },
      good: {
        title: '✅ Promienista Mapa Myśli Inki',
        desc: 'Obraz w centrum, 4-8 barwnych macek, słowa-klucze i symbole. Pełny wgląd w temat w 5 sekund!'
      }
    },
    task: {
      prompt: 'Czym różni się naturalne myślenie promieniste mózgu od tradycyjnych notatek linearnych?',
      options: [
        'Mózg myśli skojarzeniami rozchodzącymi się we wszystkich kierunkach od centrum, a nie nudnymi linijkami tekstu',
        'Mózg potrafi myśleć wyłącznie w szarych, pionowych tabelach',
        'Notatki linearne są znacznie bardziej pobudzające dla prawej półkuli mózgu',
        'Myślenie promieniste polega na przepisywaniu całych zdań z podręcznika'
      ],
      correct: 0,
      hint: 'Mózg myśli promieniście jak słońce lub macki ośmiornicy – od centrum wybuchają wielobarwne skojarzenia!'
    }
  },
  {
    id: 'mindmap-2',
    ch: 0,
    title: 'Serce Mapy: Wyrazisty Obraz Centralny',
    subtitle: 'Kartka poziomo A4 i trójkolorowy symbol w centrum',
    desc: 'Jak poprawnie rozpocząć mapę, by przyciągała wzrok obu półkul.',
    speech: 'Kartka zawsze poziomo! Pole widzenia Twoich oczu jest panoramiczne, dokładnie jak w kinie! 🎬',
    theory: [
      'Po co nam ta zasada? Najczęstszy błąd to położenie kartki pionowo i wpisanie w kółeczku nudnego słowa długopisem. Taka notatka nie ma siły przyciągania.',
      'Oto 3 żelazne reguły centrum mapy:',
      '1. 📐 Kartka ZAWSZE poziomo (orientacja pejzażowa): Nasze oczy są ułożone obok siebie, dlatego naturalne pole widzenia człowieka to panorama 16:9, a nie pionowa szczelina!',
      '2. 🎨 Kolorowy OBRAZ w centrum zamiast samego tekstu: Użyj co najmniej 3 różnych kolorów. Obraz jest przetwarzany przez korę wzrokową tysiące razy szybciej niż litery.',
      '3. 🚫 Żadnych sztywnych ramek: Nie zamykaj tematu w kwadracie ani sztywnym prostokącie! Zamknięta ramka krzyczy do mózgu: „Koniec, tu się zatrzymaj!”. Obraz centralny musi swobodnie promieniować na boki.'
    ],
    diagram: {
      type: 'mindmap',
      center: '🌍 Ziemia i Przyroda',
      branches: [
        { name: 'Oceany', color: '#06b6d4', icon: '🌊', note: 'Głębiny i rafy' },
        { name: 'Lasy', color: '#22c55e', icon: '🌲', note: 'Drzewa i fauna' },
        { name: 'Góry', color: '#eab308', icon: '⛰️', note: 'Szczyty i skały' },
        { name: 'Atmosfera', color: '#a855f7', icon: '💨', note: 'Chmury i wiatr' }
      ]
    },
    task: {
      prompt: 'Dlaczego kartkę do mapy myśli kładziemy ZAWSZE w poziomie (orientacja pejzażowa)?',
      options: [
        'Bo pole widzenia ludzkich oczu jest panoramiczne, co daje przestrzeń na rozrastanie się gałęzi w lewo i w prawo',
        'Ponieważ pionowe kartki są zakazane przez prawo edukacyjne',
        'Bo na poziomej kartce mieści się mniej słów',
        'Aby móc oprzeć o nią łokieć podczas pisania'
      ],
      correct: 0,
      hint: 'Oczy człowieka widzą panoramicznie – pozioma kartka daje pełną swobodę dla gałęzi po obu stronach!'
    }
  },
  {
    id: 'mindmap-3',
    ch: 0,
    title: '8 Macek Inki: Główne Filary Tematu',
    subtitle: 'Jak podzielić potężny materiał na 3–7 kluczowych ramion?',
    desc: 'Budowa grubych, organicznych konarów wiedzy.',
    speech: 'Spójrz na moje macki! Każda z nich to osobny, gruby konar dla wielkiej kategorii wiedzy! 💡',
    theory: [
      'Po co nam ta zasada? Gdy stajemy przed trudnym egzaminem, grubą książką lub wielkim projektem, czujemy przytłoczenie ogromem materiału. Kluczem do opanowania chaosu jest kategoryzacja.',
      'Od centralnego obrazu wypuszczamy grube, organiczne gałęzie (najlepiej 3 do 7 głównych ramion, zgodnie z magiczną liczbą George’a Millera 7 ± 2). Każda gałąź odpowiada jednemu wielkiemu filarowi tematu.',
      'Zasady głównych ramion:',
      '• Łączą się bezpośrednio z centrum – są najgrubsze u nasady, dokładnie jak gałęzie wyrastające z pnia drzewa.',
      '• Są faliste i organiczne – mózg nie znosi prostych linii rysowanych od linijki, bo w naturze nie ma linii idealnie prostych!',
      'Na przykład dla tematu „Zdrowe Życie”: Ramię 1: Sen 💤, Ramię 2: Dieta 🥗, Ramię 3: Ruch 🏃, Ramię 4: Umysł 🧠.'
    ],
    diagram: {
      type: 'mindmap',
      center: '🏃 Zdrowe Życie',
      branches: [
        { name: 'Sen', color: '#6366f1', icon: '💤', note: '8h · ciemność · stała pora' },
        { name: 'Dieta', color: '#22c55e', icon: '🥗', note: 'woda 2L · warzywa · orzechy' },
        { name: 'Ruch', color: '#f59e0b', icon: '⚡', note: 'spacery · trening · rozciąganie' },
        { name: 'Umysł', color: '#ec4899', icon: '🧠', note: 'oddech · medytacja · czytanie' }
      ]
    },
    task: {
      prompt: 'Jak powinny wyglądać główne gałęzie wychodzące z centrum mapy myśli?',
      options: [
        'Powinny być grube u nasady, organicznie zakrzywione i bezpośrednio połączone z centralnym obrazem',
        'Muszą być idealnie proste, narysowane czarną linijką pod kątem 90 stopni',
        'Powinny być przerywane i ledwo widoczne',
        'Nie wolno ich łączyć z centrum mapy'
      ],
      correct: 0,
      hint: 'Główne gałęzie są jak konary drzewa lub macki ośmiornicy – grube, faliste i wychodzące prosto z serca tematu!'
    }
  },

  // ─── ROZDZIAŁ 1: Narzędzia Kartografa ───
  {
    id: 'mindmap-4',
    ch: 1,
    title: 'Złota Reguła: 1 Słowo-Klucz na gałęzi',
    subtitle: 'Dlaczego surowo zabraniamy pisać całych zdań?',
    desc: 'Maksimum znaczenia przy minimalnej ilości znaków.',
    speech: 'Koniec z przepisywaniem podręczników! Jedno trafne słowo-klucz uwalnia lawinę pamięci! 🎯',
    theory: [
      'Po co nam ta zasada? Najczęstszym błędem początkujących jest wciskanie na gałęzie całych zdań z podręcznika. Kiedy zapiszesz całe zdanie, Twój mózg staje się leniwy – przestaje myśleć i zaczyna czytać jak automat.',
      'Na każdej gałęzi i pod-gałęzi umieszczamy tylko JEDNO SŁOWO-KLUCZ (rzeczownik lub czasownik).',
      'Zobacz spektakularną różnicę:',
      '• Nudna notatka: „Układ Słoneczny powstał około 4,6 miliarda lat temu w wyniku grawitacyjnego zapadnięcia się obłoku molekularnego.” (18 słów, zasypiasz po przeczytaniu).',
      '• Mapa myśli: Gałąź „Powstanie” → odnoga „4,6 mld lat ⏳” → odnoga „Zapada obłok 🌌”.',
      'Dlaczego to działa? Pojedyncze słowo działa jak klucz w zamku. Nie zamyka myśli, lecz otwiera natychmiastowy dostęp do wiedzy w Twojej głowie!'
    ],
    diagram: {
      type: 'comparison',
      bad: {
        title: '❌ Błąd: Całe zdanie',
        desc: '„Ptaki drapieżne polują głównie w dzień i posiadają doskonały wzrok.” (Zbyt dużo zbędnego atramentu, mózg nie koduje esencji).'
      },
      good: {
        title: '✅ Mistrzostwo: Słowa-Klucze',
        desc: 'Gałąź „Ptaki 🦅” ➔ „Drapieżne” ➔ „Wzrok 👁️” ➔ „Dzień ☀️”. Czysta esencja, błyskawiczna powtórka!'
      }
    },
    task: {
      prompt: 'Dlaczego na gałęziach mapy myśli umieszczamy pojedyncze słowa-klucze zamiast całych zdań?',
      options: [
        'Bo jedno słowo-klucz wyzwala sieć skojarzeń i pozwala na błyskawiczne powtórki bez znużenia',
        'Ponieważ na kartce papieru nie mieszczą się litery alfabetu',
        'Bo w mapach myśli wolno używać wyłącznie języka obcego',
        'Aby nikt inny nie był w stanie zrozumieć naszej notatki'
      ],
      correct: 0,
      hint: 'Jedno słowo-klucz to zapalnik skojarzeń – zamiast czytać nudne zdania, mózg błyskawicznie przypomina sobie kontekst!'
    }
  },
  {
    id: 'mindmap-5',
    ch: 1,
    title: 'Mnemorysunki i Piktogramy: Myśl obrazami!',
    subtitle: 'Rysuj jak dziecko! Symbole przetwarzane 60 000x szybciej',
    desc: 'Dlaczego mały szkic jest wart więcej niż tysiąc słów tekstu.',
    speech: 'Nie musisz być Picassem! Prosta buźka, żarówka czy strzałka działają cuda! 🎨✨',
    theory: [
      'Po co nam rysunki? Badania neuropsychologiczne dowodzą, że ludzki mózg przetwarza obrazy aż 60 000 razy szybciej niż tekst pisany! Pismo powstało zaledwie kilka tysięcy lat temu, ale wzrok i rozpoznawanie kształtów rozwijały się przez miliony lat ewolucji.',
      'Nie musisz mieć talentu plastycznego! W mapach myśli używamy prostych piktogramów:',
      '• 💡 Żarówka = Pomysł, odkrycie, innowacja',
      '• ⚡ Błyskawica = Energia, szybkość, zagrożenie',
      '• ⏳ Klepsydra = Czas, termin, historia',
      '• 🎯 Tarcza = Cel, misja, priorytet',
      '• 💰 Worek złota = Koszt, zysk, budżet',
      '• 🔍 Lupa = Analiza, badanie, szczegół',
      'Każde słowo z małym symbolem obok tworzy podwójny ślad pamięciowy (kod werbalny + kod wizualny). Tego nie da się zapomnieć!'
    ],
    diagram: {
      type: 'mindmap',
      center: '🎨 Magia Piktogramów',
      branches: [
        { name: 'Pomysły', color: '#eab308', icon: '💡', note: 'żarówka · błysk' },
        { name: 'Cele', color: '#ef4444', icon: '🎯', note: 'tarcza · sukces' },
        { name: 'Czas', color: '#06b6d4', icon: '⏳', note: 'zegar · etapy' },
        { name: 'Budżet', color: '#10b981', icon: '💎', note: 'diament · zysk' }
      ]
    },
    task: {
      prompt: 'Dlaczego uzupełnienie słów-kluczy małymi symbolami i piktogramami tak potężnie wzmacnia pamięć?',
      options: [
        'Tworzy podwójny ślad pamięciowy (słowo + obraz), a mózg przetwarza obrazy 60 000 razy szybciej niż tekst',
        'Bo rysunki zakrywają puste miejsca na kartce papieru',
        'Tylko po to, by rysunek spodobał się znajomym na wystawie sztuki',
        'Piktogramy nie mają żadnego wpływu na szybkość zapamiętywania'
      ],
      correct: 0,
      hint: 'Obraz + słowo = podwójny ślad w mózgu! Kora wzrokowa koduje symbol w ułamku sekundy.'
    }
  },
  {
    id: 'mindmap-6',
    ch: 1,
    title: 'Kod Kolorów: Wizualne szufladki pamięci',
    subtitle: 'Dlaczego każde ramię potrzebuje własnej unikalnej barwy?',
    desc: 'Jak kora wzrokowa mózgu segreguje wiedzę w barwne szufladki.',
    speech: 'Mój atrament ma tysiące barw! 🌈 Kolory to adresy pocztowe w Twojej wyobraźni!',
    theory: [
      'Po co nam kolory? W naturze kolor niesie kluczowe informacje: dojrzały owoc jest czerwony, woda błękitna, liście zielone, a drapieżnik ma kontrastowe paski. Monochromatyczne, czarno-białe notatki nasz mózg odbiera jak martwe tło.',
      'Żelazna zasada kolorowania mapy myśli:',
      'Każde główne ramię (oraz WSZYSTKIE odchodzące od niego cieńsze gałązki) rysujemy TYM SAMYM, DEDYKOWANYM KOLOREM!',
      '• Ramię Niebieskie 🌊 → Wszystkie odnogi i napisy są niebieskie',
      '• Ramię Zielone 🌿 → Wszystkie odnogi i napisy są zielone',
      '• Ramię Czerwone 🔥 → Wszystkie odnogi i napisy są czerwone',
      '• Ramię Fioletowe 🔮 → Wszystkie odnogi i napisy są fioletowe',
      'Co to daje na egzaminie? Zamykasz oczy na 2 sekundy i wewnętrznym wzrokiem widzisz: „Aha! Pytanie dotyczy klimatu – klimat był na zielonym ramieniu po prawej stronie na dole!”. Kolor działa jak błyskawiczny drogowskaz w pamięci!'
    ],
    diagram: {
      type: 'mindmap',
      center: '🌈 Kolorowe Macki',
      branches: [
        { name: 'Niebieskie', color: '#0284c7', icon: '🌊', note: 'Woda · Chłód · Logika' },
        { name: 'Zielone', color: '#16a34a', icon: '🌿', note: 'Ekologia · Wzrost · Natura' },
        { name: 'Czerwone', color: '#dc2626', icon: '🔥', note: 'Energia · Pasja · Uwaga' },
        { name: 'Fioletowe', color: '#9333ea', icon: '🔮', note: 'Magia · Filozofia · Sztuka' }
      ]
    },
    task: {
      prompt: 'W jaki sposób zasada „jedno ramię = jeden unikalny kolor” pomaga podczas egzaminu lub testu?',
      options: [
        'Działa jak wizualna szufladka: mózg natychmiast lokalizuje w wyobraźni, na którym ramieniu była dana informacja',
        'Zmusza gracza do kupienia drogiego zestawu 100 kredek',
        'Sprawia, że kartka staje się cięższa od atramentu',
        'Kolor nie ma żadnego znaczenia dla pamięci wzrokowej'
      ],
      correct: 0,
      hint: 'Kolor to natychmiastowy adres w pamięci wzrokowej – od razu wiesz, w której szufladce szukać odpowiedzi!'
    }
  },

  // ─── ROZDZIAŁ 2: Architektura Drzewa Wiedzy ───
  {
    id: 'mindmap-7',
    ch: 2,
    title: 'Płynna Hierarchia: Od grubych konarów do liści',
    subtitle: 'Hierarchia grubości linii i długości słów',
    desc: 'Od ogółu do szczegółu: jak zmieścić liczby, daty i fakty bez chaosu.',
    speech: 'Każda macka ma przyssawki! Tak samo konar wypuszcza drobniejsze gałązki na fakty i daty! 🌿',
    theory: [
      'Po co nam ta zasada? W każdym temacie oprócz wielkich kategorii istnieją konkretne daty, nazwiska, wzory i liczby. Jeśli wrzucimy je w jedno miejsce, powstanie nieczytelny kłąb myśli.',
      'W profesjonalnej mapie myśli stosujemy hierarchię grubości linii:',
      '1. Poziom 1 (Konary główne): Bardzo grube, organiczne linie dotykające centrum. Niosą nadrzędne działy.',
      '2. Poziom 2 (Pod-gałęzie): Średniej grubości linie wypływające z konarów. Niosą podkategorie.',
      '3. Poziom 3 (Drobne gałązki): Cienkie linie na samym brzegu kartki. Niosą konkretne fakty, daty, nazwiska i liczby.',
      'Dodatkowa zasada: Długość linii powinna odpowiadać długości słowa! Nie rysuj metrowej linii dla słowa z trzech liter. Kompaktowość sprawia, że mapa jest gęsta, zwarta i piękna!'
    ],
    diagram: {
      type: 'mindmap',
      center: '🌳 Hierarchia Linii',
      branches: [
        { name: 'Konar Główny', color: '#d946ef', icon: '🐘', note: 'Gruba linia · Wielka kategoria' },
        { name: 'Pod-gałąź', color: '#8b5cf6', icon: '🦌', note: 'Średnia linia · Podgrupa' },
        { name: 'Gałązka Faktu', color: '#06b6d4', icon: '🕊️', note: 'Cienka linia · Data, liczba, detal' },
        { name: 'Długość linii', color: '#10b981', icon: '📏', note: 'Dopasowana dokładnie do słowa' }
      ]
    },
    task: {
      prompt: 'Gdzie na mapie myśli umieszczamy konkretne liczby, daty i nazwiska szczegółowe?',
      options: [
        'Na najcieńszych pod-gałęziach (liściach) odchodzących od odpowiedniego ramienia',
        'W samym środku obrazka centralnego drobnym drukiem',
        'W osobnym przypisie na odwrocie kartki',
        'W losowym rogu kartki bez żadnych linii'
      ],
      correct: 0,
      hint: 'Szczegóły (daty, liczby, nazwiska) wędrują na najdalsze, najcieńsze gałązki właściwego konaru!'
    }
  },
  {
    id: 'mindmap-8',
    ch: 2,
    title: 'Mistrzowska Czytelność: Pismo drukowane poziomo',
    subtitle: 'Żadnego czytania do góry nogami i łączenie strzałkami',
    desc: 'Zasady ergonomii widzenia: litery drukowane, poziome pismo i chmurki.',
    speech: 'Koniec z obracaniem kartki o 360 stopni! Notatka ma być czytelna pod każdym kątem! 📐',
    theory: [
      'Po co nam ta zasada? Początkujący często obracają kartkę i piszą litery pionowo lub do góry nogami wzdłuż wygiętej gałęzi. Kiedy potem próbują powtórzyć materiał, muszą kręcić głową jak sowa!',
      'Oto 3 reguły ergonomii wzrokowej:',
      '1. ✍️ Zawsze pismo poziome: Wszystkie słowa leżą na gałęziach w taki sposób, byś mógł je przeczytać bez przekrzywiania głowy i bez obracania kartki.',
      '2. 🔤 Litery drukowane: Drukowane litery (blokowe) mają wyraźne, ostre kontury. Mózg rejestruje je w 10 milisekund, podczas gdy pismo odręczne z zawijasami wymaga ciągłego odszyfrowywania.',
      '3. 🔗 Powiązania międzydziałowe: Gdy zauważysz, że pomysł z gałęzi czerwonej łączy się z faktem z gałęzi niebieskiej – połącz je przerywaną strzałką! Twój mózg uwielbia dostrzegać synapsy pomiędzy odległymi dziedzinami wiedzy!'
    ],
    diagram: {
      type: 'comparison',
      bad: {
        title: '❌ Bazgroły i obracanie kartki',
        desc: 'Pismo odręczne, litery pisane pionowo i do góry nogami. Trzeba obracać kartkę, by cokolwiek przeczytać.'
      },
      good: {
        title: '✅ Mistrzowski Standard Inki',
        desc: 'Poziome litery drukowane na górnej krawędzi linii. Błyskawiczny skan wzrokowy, strzałki łączące fakty!'
      }
    },
    task: {
      prompt: 'W jaki sposób powinny być zapisane słowa na gałęziach mapy myśli, by zapewnić maksymalną czytelność?',
      options: [
        'Poziomo, drukowanymi literami wzdłuż linii, by można było je przeczytać bez kręcenia głową',
        'Pionowo, drobnym pismem odręcznym do góry nogami',
        'Lustrzanym odbiciem od prawej do lewej',
        'Wyłącznie skrótami złożonymi z samych samogłosek'
      ],
      correct: 0,
      hint: 'Pismo poziome i drukowane pozwala Twojemu mózgowi przeskanować całą mapę w kilka sekund bez obracania kartki!'
    }
  },

  // ─── ROZDZIAŁ 3: Mapy Myśli w Codziennym Życiu ───
  {
    id: 'mindmap-9',
    ch: 3,
    title: 'Praktyka Mistrza: Cały rozdział na 1 kartce A4',
    subtitle: 'Studium przypadku: Od 20 stron tekstu do 2 minut powtórki',
    desc: 'Kompletny proces syntezy podręcznika szkolnego lub raportu w 4 krokach.',
    speech: 'Wyobraź sobie: 20 stron nudnego podręcznika zredukowane do jednej pięknej kartki A4! 📄✨',
    theory: [
      'Jak przełożyć gęsty materiał z podręcznika lub raportu na mapę myśli? Oto niezawodny 4-etapowy proces Ośmiornicy Inki:',
      '1. 🔎 Szybki przegląd (Skimming): Zanim zaczniesz pisać, przekartkuj cały rozdział. Zwróć uwagę na nagłówki, pogrubienia, wykresy i podsumowanie na końcu. Zobacz, o czym w ogóle jest tekst.',
      '2. 🎯 Obraz centralny: Połóż kartkę A4 poziomo. Narysuj na środku symbol tematu (np. dla działu „Starożytny Rzym” narysuj rzymski hełm legionisty 🏛️).',
      '3. 🌳 4-6 głównych konarów: Każdy podrozdział książki staje się jednym ramieniem: 1. Ustrój, 2. Legiony, 3. Architektura, 4. Upadek.',
      '4. 🌿 Odnogi ze słowami-kluczami: Przeczytaj tekst akapit po akapicie i wyłapuj tylko esencję: nazwiska, daty bitew, wynalazki (np. akwedukty, drogi, beton).',
      'Efekt? Twoi koledzy przed klasówką w panice czytają 20 stron, a Ty patrzysz na 1 barwną mapę przez 2 minuty i wiesz wszystko!'
    ],
    diagram: {
      type: 'mindmap',
      center: '🏛️ Starożytny Rzym',
      branches: [
        { name: 'Ustrój', color: '#e11d48', icon: '👑', note: 'Republika ➔ Senat ➔ Cesarstwo' },
        { name: 'Armia', color: '#f59e0b', icon: '⚔️', note: 'Legiony ➔ Tarcze ➔ Dyscyplina' },
        { name: 'Inżynieria', color: '#06b6d4', icon: '🧱', note: 'Drogi ➔ Akwedukty ➔ Koloseum' },
        { name: 'Prawo', color: '#8b5cf6', icon: '📜', note: '12 Tablic ➔ Fundament Europy' }
      ]
    },
    task: {
      prompt: 'Jaki jest pierwszy krok procesu syntezy 20 stron podręcznika do mapy myśli?',
      options: [
        'Szybki przegląd spisu treści, nagłówków i podsumowań, by uchwycić strukturę tematu przed rysowaniem',
        'Przepisanie pierwszego akapitu słowo w słowo na gałąź',
        'Pokolorowanie wszystkich stron podręcznika na żółto',
        'Wyrwanie stron z książki i naklejenie ich na kartkę'
      ],
      correct: 0,
      hint: 'Zawsze zaczynamy od lotu ptaka – przeglądamy nagłówki i strukturę, by wiedzieć, jak zaplanować główne gałęzie!'
    }
  },
  {
    id: 'mindmap-10',
    ch: 3,
    title: 'Wystąpienie bez Kartki i Wielki Finał',
    subtitle: 'Mów swobodnie przez 15 minut z uśmiechem, patrząc na ludzi',
    desc: 'Prezentacje, przemówienia, planowanie projektów i certyfikat Kartografa Umysłu.',
    speech: 'Brawo! Dotarłeś do finału! 🏆 Teraz posiądziesz najcenniejszą umiejętność: swobodne mówienie z pamięci!',
    theory: [
      'Gratulacje! Przeszedłeś kompletną drogę nielinearnego myślenia. Ostatnia wielka supermoc mapy myśli to publiczne wystąpienia bez czytania z kartki.',
      'Dlaczego prelegenci czytający z kartek wypadają nudno? Bo nie mają kontaktu wzrokowego ze słuchaczami! Czytają zdanie po zdaniu z głową w dół.',
      'Gdy przygotujesz prezentację w formie mapy myśli:',
      '1. W centrum masz temat wystąpienia 🎯',
      '2. Masz tylko 4 główne ramiona: Wstęp (problem), Rozwiązanie, Przykłady, Wnioski (wezwanie do działania).',
      '3. Wychodzisz na scenę lub przed tablicę. Nie masz ze sobą kartek. Zamykasz oczy na ułamek sekundy i WIDZISZ całą mapę przed oczami!',
      'Mówisz swobodnie, własnymi słowami, uśmiechasz się i patrzysz prosto w oczy słuchaczom. Płyniesz od gałęzi do gałęzi jak ryba w oceanie!',
      'Z mapami myśli żaden egzamin, prezentacja ani projekt nie będą dla Ciebie wyzwaniem. Posiadasz atrament mistrza!'
    ],
    diagram: {
      type: 'mindmap',
      center: '🎤 Prezentacja bez kartki',
      branches: [
        { name: '1. Wstęp', color: '#3b82f6', icon: '❓', note: 'Zaskocz ➔ Problem ➔ Pytanie' },
        { name: '2. Rozwiązanie', color: '#10b981', icon: '💡', note: 'Sedno ➔ Nowy pomysł ➔ Fakty' },
        { name: '3. Przykłady', color: '#f59e0b', icon: '📊', note: 'Liczby ➔ Ludzie ➔ Historia' },
        { name: '4. Finał', color: '#ec4899', icon: '🏆', note: 'Wnioski ➔ Wezwanie ➔ Pytania' }
      ]
    },
    task: {
      prompt: 'Dlaczego mapa myśli pozwala na znacznie lepsze wystąpienie publiczne niż tradycyjny tekst na kartce?',
      options: [
        'Daje w pamięci panoramiczny obraz 4 ramion tematu, pozwalając mówić swobodnie i utrzymać kontakt wzrokowy ze słuchaczami',
        'Zwalnia mówcę z obowiązku wypowiadania jakichkolwiek słów',
        'Wymaga wyświetlenia skomplikowanego programu komputerowego',
        'Sprawia, że słuchacze zasypiają po minucie'
      ],
      correct: 0,
      hint: 'Mapa myśli w Twojej głowie daje Ci pełną strukturę wystąpienia w ułamku sekundy – patrzysz w oczy ludziom i mówisz z pasją!'
    }
  }
];
