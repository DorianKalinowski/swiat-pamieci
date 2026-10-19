import { FACES } from './faces.js';

export const LESSONS = [
  {
    id: 'names-1',
    title: 'Kotwica twarzy',
    subtitle: 'Zauważ to, co unikalne',
    desc: 'Dlaczego zapominamy imiona? Bo mózg traktuje twarz jako całość. Naucz się szukać jednego wyrazistego elementu!',
    faces: [FACES[0], FACES[2]], // Marek (okulary), Krzysztof (broda)
    speech: 'Cześć, tu sprytny Lisek! 🦊 Czy zdarzyło Ci się poznać kogoś w klasie lub na urodzinach i od razu zapomnieć jego imię? Pokażę Ci detektywistyczny trik z kotwicą – zapamiętasz każdego kolegę i koleżankę od pierwszego wejrzenia!',
    theory: [
      'Po co nam ta umiejętność? Ile razy ktoś przedstawił Ci się w nowej klasie, na placu zabaw albo na uroczystości, a Ty po 5 sekundach miałeś pustkę w głowie? To przydarza się każdemu!',
      'Sekret mistrzów pamięci: nasz mózg nie potrafi utrzymać samego dźwięku imienia. Musimy je „przyczepić” do twarzy jak kolorową naklejkę!',
      'KROK 1 – ZNAJDŹ KOTWICĘ DETEKTYWA:',
      'Gdy na kogoś patrzysz, poszukaj jednej charakterystycznej rzeczy: wielkie okulary, bujna broda, zabawna fryzura czy wielki uśmiech.',
      'Spójrz na Marka poniżej: widzisz te wielkie okrągłe złote okulary? To nasza idealna kotwica!'
    ],
    task: {
      type: 'feature-pick',
      prompt: 'Co jest najsilniejszą kotwicą Marka?',
      face: FACES[0],
      options: ['Ogromne okrągłe okulary w złotej oprawce', 'Zielony krawat w kropki', 'Zegarek ze stoperem', 'Czapka z daszkiem'],
      correct: 0,
      hint: 'Spójrz w oczy Marka – złote oprawki dominują jego twarz!'
    }
  },
  {
    id: 'names-2',
    title: 'Most fonetyczny',
    subtitle: 'Zamieniaj abstrakcyjne imiona w obrazy',
    desc: 'Imię to tylko dźwięk. Aby je pamiętać, zamień je w konkretny, dotykalny przedmiot.',
    faces: [FACES[1], FACES[3]], // Basia (kontrabas), Kasia (kakao)
    speech: 'Krok drugi to most fonetyczny! Zamieniamy każde imię w zabawną rzecz, którą można dotknąć!',
    theory: [
      'Imię samo w sobie jest ulotnym dźwiękiem. Trudno „zobaczyć” słowo Basia czy Marek.',
      'Dlatego budujemy MOST FONETYCZNY – szukamy przedmiotu, który brzmi prawie tak samo:',
      '• Basia → wielki KONTRA-BAS 🎻',
      '• Kasia → kubek pachnącego KAKAO ☕',
      '• Marek → gruby jaskrawy MARKER 🖊️',
      'Gdy usłyszysz imię, Twój umysł od razu widzi ten przedmiot przed oczami!'
    ],
    task: {
      type: 'bridge-pick',
      prompt: 'Jaki most fonetyczny najlepiej pasuje do imienia Basia?',
      face: FACES[1],
      options: ['Wielki kontrabas grający jazz', 'Słoik z dżemem', 'Biały żaglowiec na morzu', 'Złota moneta'],
      correct: 0,
      hint: 'Basia brzmi dokładnie jak BAS / Kontrabas!'
    }
  },
  {
    id: 'names-3',
    title: 'Wybuchowe połączenie',
    subtitle: 'Połącz kotwicę twarzy z mostem fonetycznym',
    desc: 'Sekret mistrzów pamięci: spraw, by przedmiot wszedł w żywą interakcję z twarzą!',
    faces: [FACES[0], FACES[1]],
    speech: 'A teraz najfajniejsza część: robimy wybuchowy film w głowie! Zobacz, jak to działa!',
    theory: [
      'Mamy już kotwicę (okulary Marka) i most fonetyczny (MARKER).',
      'Teraz najważniejszy krok: połączmy je w śmieszną, dynamiczną akcję!',
      'Nie wyobrażaj sobie po prostu markera leżącego obok Marka.',
      'Zobacz, jak Marek wyciąga neonowy MARKER i z uśmiechem zamalowuje nim swoje własne OKULARY, aż nic przez nie nie widzi!',
      'Im bardziej szalona i dynamiczna akcja, tym mocniej zostaje w pamięci!'
    ],
    task: {
      type: 'action-pick',
      prompt: 'Basia ma rudy kok i gra na basie. Jakie połączenie najsilniej zadziała w pamięci?',
      face: FACES[1],
      options: [
        'Jej rudy kok podskakuje i uderza w wielki kontrabas wydając potężne basowe dźwięki! 🎶',
        'Basia stoi spokojnie na przystanku autobusowym',
        'Basia czyta książkę o historii muzyki',
        'Basia ma na sobie zwykły płaszcz'
      ],
      correct: 0,
      hint: 'Wybierz najbardziej dynamiczną, żywą i dźwięczną akcję!'
    }
  },
  {
    id: 'names-4',
    title: 'Spotkanie w trójkę',
    subtitle: 'Zastosuj technikę dla 3 osób',
    desc: 'Czas na praktykę! Poznaj Marka, Basię i Krzysztofa, a potem bezbłędnie ich rozpoznaj.',
    faces: [FACES[0], FACES[1], FACES[2]],
    speech: 'Pora na małe przyjęcie! Przedstawię Ci troje znajomych – połączmy ich kotwice w żywe scenki!',
    theory: [
      'Ćwiczymy całą pętlę pamięciową dla 3 gości:',
      '1. Marek → złote okulary → MARKER zamalowuje szkła!',
      '2. Basia → rudy kok → BAS podskakuje w rytm muzyki!',
      '3. Krzysztof → czarna broda drwala → KRZAK albo KRZYŻACY gubią miecz w jego brodzie!'
    ],
    task: {
      type: 'test-multiple',
      prompt: 'Kto ukrył krzyżacki miecz w swojej wielkiej czarnej brodzie?',
      options: ['Krzysztof (czarna broda)', 'Marek (złote okulary)', 'Basia (rudy kok)', 'Tomasz (muszka)'],
      correct: 0,
      hint: 'Przypomnij sobie kotwicę brody i krzaczastego Krzysztofa!'
    }
  },
  {
    id: 'names-5',
    title: 'Rozszerzona galeria (5 osób)',
    subtitle: 'Dodajemy Kasię i Tomasza',
    desc: 'Podnosimy poprzeczkę: 5 osób z różnymi stylami, fryzurami i rekwizytami.',
    faces: [FACES[0], FACES[1], FACES[2], FACES[3], FACES[4]],
    speech: 'Idzie Ci wyśmienicie! Powiększamy grono do 5 osób – Kasia i Tomasz dołączają do zabawy!',
    theory: [
      'Wchodzimy do większego salonu! Poznaj kolejne dwie wspaniałe osoby:',
      '• Kasia (projektantka) → fioletowe włosy & kolczyk w nosie → pije gorące KAKAO, a kolczyk brzęczy!',
      '• Tomasz (prezenter) → lśniący uśmiech & muszka → czyta wielki, opasły TOM encyklopedii!'
    ],
    task: {
      type: 'identify-face',
      target: FACES[3],
      prompt: 'Jak ma na imię ta osoba z fioletowymi włosami i kolczykiem?',
      options: ['Kasia', 'Basia', 'Ola', 'Ania'],
      correct: 0,
      hint: 'Pamiętasz gorące KAKAO i fioletowe włosy?'
    }
  },
  {
    id: 'names-6',
    title: 'Egzamin mistrza przyjęć',
    subtitle: '7 gości na bankiecie',
    desc: 'Ostateczny sprawdzian szkolenia! Przetestuj technikę na pełnej grupie gości z losowymi pytaniami.',
    faces: FACES.slice(0, 7),
    speech: 'Wielki finał u Liska! Znasz już całą technikę mistrzów – żaden bankiet ani nowa klasa Cię nie zaskoczy!',
    theory: [
      'Brawo! Znasz już kompletną metodę zapamiętywania każdego człowieka:',
      '1. Zauważ kotwicę (okulary, broda, monokl, opaska, muszka).',
      '2. Zamień imię na most fonetyczny (Basia=Bas, Marek=Marker, Piotr=Pióro).',
      '3. Zobacz szaloną interakcję kotwicy z mostem w swojej wyobraźni.',
      'Jesteś w 100% gotowy na każdy bankiet, klasę i grę swobodną!'
    ],
    task: {
      type: 'final-exam',
      target: FACES[6], // Piotr z monoklem
      prompt: 'Kto nosi złoty monokl, wąsy i pisze gęsim PIÓREM?',
      options: ['Piotr', 'Tomasz', 'Marek', 'Krzysztof'],
      correct: 0,
      hint: 'PIÓRO to most fonetyczny dla Piotra!'
    }
  }
];
