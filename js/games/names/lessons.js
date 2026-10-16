import { FACES } from './faces.js';

export const LESSONS = [
  {
    id: 'names-1',
    title: 'Kotwica twarzy',
    subtitle: 'Zauważ to, co unikalne',
    desc: 'Dlaczego zapominamy imiona? Bo mózg traktuje twarz jako całość. Naucz się szukać jednego wyrazistego elementu!',
    faces: [FACES[0], FACES[2]], // Marek (okulary), Krzysztof (broda)
    theory: [
      'Nasz mózg zapomina imiona w 5 sekund, jeśli nie przyczepimy ich do konkretnego punktu.',
      'Krok 1 to ZNALEZIENIE KOTWICY – jednej rzeczy, która rzuca się w oczy jako pierwsza: okulary, bujna broda, fryzura, pieprzyk czy uśmiech.',
      'Spójrz na Marka – widzisz te ogromne złote okulary? To nasza kotwica!'
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
    theory: [
      'Imię samo w sobie jest abstrakcyjne. Trudno „zobaczyć” słowo Basia.',
      'Dlatego tworzymy MOST FONETYCZNY – skojarzenie brzmieniowe z realnym przedmiotem:',
      '• Basia → wielki KONTRA-BAS 🎻',
      '• Kasia → kubek gorącego KAKAO ☕',
      '• Marek → neonowy MARKER 🖊️',
      'Gdy słyszysz imię, Twój umysł od razu widzi ten przedmiot!'
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
    theory: [
      'Masz już kotwicę (np. okulary Marka) i most fonetyczny (MARKER).',
      'Teraz NAJWAŻNIEJSZY KROK: zrób z nich film w głowie!',
      'Nie wyobrażaj sobie po prostu Markera obok Marka.',
      'Zobacz, jak Marek wyciąga gruby, jaskrawy MARKER i zamalowuje nim swoje własne OKULARY, aż nic przez nie nie widzi!',
      'Im bardziej absurdalna i dynamiczna akcja, tym trwalej zapada w pamięć!'
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
    theory: [
      'Ćwiczymy całą pętlę pamięciową dla 3 gości:',
      '1. Marek → złote okulary → MARKER maluje szkła!',
      '2. Basia → rudy kok → BAS podskakuje w rytm!',
      '3. Krzysztof → czarna broda drwala → KRZAK / KRZYŻACY gubią miecz w jego brodzie!'
    ],
    task: {
      type: 'test-multiple',
      prompt: 'Kto ukrył krzyżacki miecz w swojej wielkiej czarnej brodzie?',
      facesTest: [FACES[0], FACES[1], FACES[2]],
      correctFaceId: 'f3',
      correctName: 'Krzysztof',
      hint: 'Przypomnij sobie kotwicę brody i krzaczastego Krzysztofa!'
    }
  },
  {
    id: 'names-5',
    title: 'Rozszerzona galeria (5 osób)',
    subtitle: 'Dodajemy Kasię i Tomasza',
    desc: 'Podnosimy poprzeczkę: 5 osób z różnymi stylami, fryzurami i rekwizytami.',
    faces: [FACES[0], FACES[1], FACES[2], FACES[3], FACES[4]],
    theory: [
      'Wchodzimy do większego salonu! Poznaj kolejne dwie osoby:',
      '• Kasia (UX designerka) → fioletowe włosy & kolczyk w nosie → pije KAKAO, a kolczyk brzęczy!',
      '• Tomasz (prezenter) → lśniący uśmiech & muszka → czyta wielki TOM encyklopedii!'
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
    theory: [
      'Brawo! Znasz już całą metodologię:',
      '1. Zauważ kotwicę (okulary, broda, monokl, opaska, muszka).',
      '2. Zamień imię na most fonetyczny.',
      '3. Wyobraź sobie interakcję kotwicy z mostem.',
      'Jesteś w 100% gotowy na każdy bankiet, konferencję czy grę swobodną!'
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
