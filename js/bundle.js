// Świat pamięci – Kompletny, zintegrowany pakiet aplikacji (obsługuje bezpośrednie otwarcie file:/// oraz serwery http:// i PWA)
(function() {
  'use strict';

  /* ==========================================================================
     1. DOM UTILS
     ========================================================================== */
  function h(tag, attrs = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = (typeof v === 'string' && !v.trim().startsWith('<svg') && typeof t === 'function' ? t(v) : v);
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else if (k === 'title' || k === 'aria-label' || k === 'placeholder') el.setAttribute(k, typeof t === 'function' ? t(v) : v);
      else el.setAttribute(k, v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      const val = typeof kid === 'string' && typeof t === 'function' ? t(kid) : kid;
      el.append(val.nodeType ? val : document.createTextNode(val));
    }
    return el;
  }

  const $ = (s, r = document) => r.querySelector(s);
  const rand = (a, b) => (b === undefined ? (Array.isArray(a) ? a[Math.floor(Math.random() * a.length)] : Math.floor(Math.random() * a)) : Math.floor(Math.random() * (b - a + 1)) + a);

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function sleep(ms, signal) {
    return new Promise(res => {
      if (signal?.aborted) return res(false);
      const t = setTimeout(() => res(true), ms);
      signal?.addEventListener('abort', () => { clearTimeout(t); res(false); }, { once: true });
    });
  }

  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     2. STORE & STREAK
     ========================================================================== */
  const KEY = 'swiat-pamieci:v1';
  let state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { state = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* tryb incognito */ } };

  const store = {
    get(k, d) { return k in state ? state[k] : d; },
    set(k, v) { state[k] = v; save(); },
    update(k, fn, d) { this.set(k, fn(this.get(k, d))); }
  };

  function getDateString(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getDayDifference(dateStrA, dateStrB) {
    if (!dateStrA || !dateStrB) return Infinity;
    const partsA = dateStrA.split('-').map(Number);
    const partsB = dateStrB.split('-').map(Number);
    if (partsA.length !== 3 || partsB.length !== 3) return Infinity;
    const utc1 = Date.UTC(partsA[0], partsA[1] - 1, partsA[2]);
    const utc2 = Date.UTC(partsB[0], partsB[1] - 1, partsB[2]);
    return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
  }

  function touchStreak() {
    const today = getDateString();
    const last = store.get('lastDay', null);
    if (last === today) {
      return Math.max(1, store.get('streak', 1));
    }
    const diff = last ? getDayDifference(last, today) : Infinity;
    let newStreak = 1;
    if (diff === 1) {
      newStreak = Math.max(0, store.get('streak', 0)) + 1;
    } else {
      newStreak = 1;
    }
    store.set('streak', newStreak);
    store.set('lastDay', today);
    return newStreak;
  }

  function currentStreak() {
    const today = getDateString();
    const last = store.get('lastDay', null);
    if (!last) return 0;
    const diff = getDayDifference(last, today);
    if (diff === 0) {
      return store.get('streak', 1);
    } else if (diff === 1) {
      return store.get('streak', 0);
    } else {
      if (store.get('streak', 0) !== 0) {
        store.set('streak', 0);
      }
      return 0;
    }
  }

  
  
  
  
  
  
  
  
  
  
  
  /* ==========================================================================
     2B. INTERNATIONALIZATION (i18n) – POLSKI 🇵🇱 & AMERICAN ENGLISH 🇺🇸
     ========================================================================== */
  /**
 * Moduł internacjonalizacji (i18n) dla Świat Pamięci.
 * Obsługuje język polski (PL 🇵🇱 - domyślny) oraz amerykański angielski (USA 🇺🇸).
 */



let currentLang = (typeof store !== 'undefined' && store.get ? store.get('lang', 'pl') : 'pl');

function getLang() {
  return currentLang;
}

function setLang(lang) {
  currentLang = lang === 'en' ? 'en' : 'pl';
  if (typeof store !== 'undefined' && store.set) {
    store.set('lang', currentLang);
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = currentLang;
    applyLangToDOM(currentLang);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SŁOWNIK JĘZYKA ANGIELSKIEGO (AMERICAN ENGLISH)
// ─────────────────────────────────────────────────────────────────────────────

const DICTIONARY_EN = {
  '50': '50',
  '500': '500',
  '1000': '1000',
  'Świat pamięci': 'World of Memory',
  'Świat ': 'World of ',
  'pamięci': 'Memory',
  'Techniki pamięciowe': 'Memory Techniques',
  'Ściągawka technik pamięciowych': 'Memory Techniques Cheat Sheet',
  'Dźwięk': 'Sound',
  'Pobierz': 'Install',
  'Poznaj autora – Dorian Kalinowski': 'Meet the Creator – Dorian Kalinowski',
  'Dorian Kalinowski – Twórca': 'Dorian Kalinowski – Creator',
  'Stworzył Dorian Kalinowski': 'Created by Dorian Kalinowski',
  '· Wszelkie prawa zastrzeżone © 2026': '· All rights reserved © 2026',
  'Wszelkie prawa zastrzeżone © 2026': 'All rights reserved © 2026',
  'Wszelkie prawa zastrzeżone © 2026 Dorian Kalinowski': 'All rights reserved © 2026 Dorian Kalinowski',
  'Do gry! 🚀': 'Let\'s play! 🚀',
  'Wszystko jasne! 🚀': 'Got it! 🚀',
  'Zamknij': 'Close',
  'Mini-gry, w których uczysz się technik pamięciowych używanych przez mistrzów. Zapamiętasz numer telefonu i całe listy w kilka chwil!': 'Mini-games teaching you memory techniques used by world champions. Memorize phone numbers and whole lists in moments!',
  'Mini-gry, w których uczysz się technik pamięciowych używanych przez mistrzów. Zapamiętasz numer telefonu po jednym spojrzeniu!': 'Mini-games teaching you memory techniques used by world champions. Memorize phone numbers at a single glance!',
  'Wybierz grę': 'Choose a Game',
  'Graj ▶': 'Play ▶',
  'Wkrótce': 'Coming Soon',
  'dzień z rzędu': 'day streak',
  'dni z rzędu': 'days streak',
  'gwiazdek': 'stars',
  'gier gotowych': 'games ready',
  'systemów pamięci': 'memory systems',
  'Miau! Jestem Mruczek 🐾 Zagramy w „Cyfry”?': 'Meow! I\'m Whiskers 🐾 Want to play "Digits"?',
  'Cześć! Pamięć czeka na trening 💪': 'Hi there! Your memory is ready for a workout 💪',
  'Mrrr… gotowy na szybki trening?': 'Purrr… ready for a quick brain workout?',
  'Kotek Mruczek 🐱': 'Whiskers the Cat 🐱',
  '9 lekcji': '9 lessons',
  '6 trybów': '6 modes',
  'Kształty cyfr': 'Number shapes',
  'Tygrysek Leon 🐯': 'Leo the Tiger 🐯',
  '8 lekcji': '8 lessons',
  '5 wariantów': '5 modes',
  'Metoda Loci': 'Method of Loci',
  'Lisek Bystrzak 🦊': 'Rusty the Fox 🦊',
  '6 lekcji': '6 lessons',
  '4 warianty': '4 modes',
  'Kotwice twarzy': 'Face anchors',
  'Sówka Profesor 🦉': 'Professor Owl 🦉',
  '8 wykładów': '8 lectures',
  'Kołki fonetyczne': 'Phonetic pegs',
  'Papużka Pola 🦜': 'Polly the Parrot 🦜',
  'Słowa-klucze': 'Keywords',
  'Szop Magik 🦝': 'Bandit the Magician 🦝',
  'System PAO': 'PAO System',
  'Wiewiórka Basia 🐿️': 'Hazel the Squirrel 🐿️',
  'Efekt domina': 'Domino effect',
  'Żółwik Zenon 🐢': 'Clockwork Turtle 🐢',
  'Żółwik Zegarowy 🐢': 'Clockwork Turtle 🐢',
  'Algorytm Doomsday': 'Doomsday Algorithm',
  'Piesek Łatek 🐶': 'Patch the Dog 🐶',
  '10 lekcji': '10 lessons',
  'Haczyki liter': 'Letter hooks',
  'Ośmiornica Inka 🐙': 'Inky the Octopus 🐙',
  'Cyfry': 'Digits',
  'Pałac pamięci': 'Memory Palace',
  'Imiona i twarze': 'Names & Faces',
  'System Major': 'Major System',
  'Słówka i języki': 'Vocabulary & Languages',
  'Słówka i języki obce': 'Vocabulary & Languages',
  'Karty do gry': 'Playing Cards',
  'Łańcuch skojarzeń': 'Link System',
  'Kalendarz w głowie': 'Mental Calendar',
  'Akrostychy i rymy': 'Acrostics & Rhymes',
  'Mapy myśli': 'Mind Maps',
  'Zapamiętuj numery telefonów, PIN i ciągi cyfr. Szkolenie z Kotkiem Mruczkiem + 6 trybów gry.': 'Memorize phone numbers, PINs, and digit sequences. Training with Whiskers the Cat + 6 game modes.',
  'Zapamiętuj numery telefonów, PIN i ciągi cyfr. Szkolenie z Kotkiem Mruczkiem + 6 trybów gry swobodnej.': 'Memorize phone numbers, PINs, and digit sequences. Training with Whiskers the Cat + 6 free play modes.',
  'Metoda Loci i spacer po komnatach. Szkolenie z Tygryskiem Leonem + 5 wariantów gry.': 'Method of Loci & walking through mental rooms. Training with Leo the Tiger + 5 game modes.',
  'Metoda Loci i spacer po komnatach. Szkolenie z Tygryskiem Leonem + 5 wariantów gry swobodnej.': 'Method of Loci & walking through mental rooms. Training with Leo the Tiger + 5 free play modes.',
  'Nigdy więcej „znam tę twarz, ale jak on miał na imię?”. Kotwice cech i mosty fonetyczne z Liskiem.': 'Never again say "I know that face, but what\'s their name?". Feature anchors & phonetic bridges with Rusty.',
  'Tajemny kod mistrzów: zamieniaj cyfry 0-9 na spółgłoski, słowa i żywe obrazy ze Sówką Profesorem.': 'The secret code of masters: convert digits 0-9 into consonants, words, and vivid imagery with Professor Owl.',
  'Angielski i hiszpański w mig! Metoda słów-kluczy (Keyword Method) z Papużką Polą.': 'Master foreign vocabulary fast! The Keyword Method with Polly the Parrot.',
  'Angielski i hiszpański w mig! Metoda słów-kluczy (Keyword Method) z kolorową Papużką Polą.': 'Master foreign vocabulary fast! The Keyword Method with Polly the Parrot.',
  'Cała talia 52 kart w głowie! System PAO (Postać - Akcja - Obiekt) z Szopem Magikiem.': 'A full 52-card deck in your mind! The PAO system (Person - Action - Object) with Bandit the Magician.',
  'Cała talia 52 kart w głowie! System PAO (Postać - Akcja - Obiekt) prowadzony przez Szopa Magika.': 'A full 52-card deck in your mind! The PAO system (Person - Action - Object) with Bandit the Magician.',
  'Efekt domina w pamięci! Listy zakupów, przemówienia i procedury z Wiewiórką Basią.': 'The domino effect in memory! Grocery lists, speeches, and procedures with Hazel the Squirrel.',
  'Efekt domina w pamięci! Zapamiętuj listy zakupów, przemówienia i procedury z Wiewiórką Basią.': 'The domino effect in memory! Memorize grocery lists, speeches, and procedures with Hazel the Squirrel.',
  'Dzień tygodnia dowolnej daty w historii w 3 sekundy. Genialny algorytm Doomsday z Żółwikiem.': 'Day of the week for any date in history in 3 seconds. The brilliant Doomsday algorithm with Clockwork Turtle.',
  'Dzień tygodnia dowolnej daty w historii w 3 sekundy. Genialny algorytm Doomsday z Żółwikiem Zegarowym.': 'Day of the week for any date in history in 3 seconds. The brilliant Doomsday algorithm with Clockwork Turtle.',
  'Złap trop pierwszych liter! Planety, tęcza, rzymskie cyfry i reguły szkolne z Pieskiem Łatkiem.': 'Track down first letters! Planets, rainbows, Roman numerals, and rules with Patch the Dog.',
  'Ogarnij chaos wiedzy! Promieniste gałęzie, słowa-klucze i kolorowe notatki z Ośmiornicą Inką.': 'Conquer information overload! Radiant branches, keywords, and colorful notes with Inky the Octopus.',
  'Rozwiń 8 macek swojej wyobraźni! Twórz nielinearne notatki wizualne i zapamiętuj całe działy z Ośmiornicą Inką.': 'Unfurl all 8 tentacles of imagination! Create radiant visual notes and master entire topics with Inky the Octopus.',
  '← Wszystkie gry': '← All Games',
  'Wszystkie gry': 'All Games',
  '← Strona główna': '← Home',
  '← Menu gry': '← Game Menu',
  '← Mapa szkolenia': '← Training Map',
  '← Wybór trybu': '← Mode Selection',
  '← Cyfry': '← Digits',
  '← Mapa': '← Map',
  'Trening (lekcje)': 'Training (Lessons)',
  'Gra swobodna': 'Free Play',
  'Gra swobodna ': 'Free Play ',
  'Szkolenie': 'Training',
  'Zresetuj postęp': 'Reset Progress',
  'Potwierdź reset': 'Confirm Reset',
  'Anuluj': 'Cancel',
  'Czy na pewno chcesz zresetować postęp w tej grze?': 'Are you sure you want to reset your progress in this game?',
  'Po co Ci ta technika w codziennym życiu?': 'Why do you need this technique in everyday life?',
  'Wybierz tryb gry swobodnej': 'Choose a Free Play Mode',
  'Start ▶': 'Start ▶',
  'Powtórz': 'Review',
  'Następna lekcja ▶': 'Next Lesson ▶',
  'Zagraj ponownie ↻': 'Play Again ↻',
  'Zagraj ponownie ↺': 'Play Again ↺',
  'Kolejny poziom ▶': 'Next Level ▶',
  'Kolejny poziom 2 ▶': 'Next Level 2 ▶',
  'Koniec gry!': 'Game Over!',
  'Czas minął!': 'Time\'s up!',
  'Zatwierdź': 'Submit',
  'Sprawdź': 'Check',
  'Dalej ▶': 'Next ▶',
  'Dalej': 'Next',
  'Gotowe': 'Done',
  'Punkty': 'Score',
  'Poziom': 'Level',
  'Runda': 'Round',
  'Czas': 'Time',
  'Błędy': 'Mistakes',
  'Szanse': 'Lives',
  'Najlepszy': 'Best',
  'Rekord': 'Best Score',
  'rekord': 'record',
  'brak': 'none',
  'punktów': 'points',
  'pkt': 'pts',
  'Podpowiedź': 'Hint',
  'Wskazówka': 'Clue',
  'Ukończono szkolenie! 🎉': 'Training Completed! 🎉',
  'Spróbuj jeszcze raz ↻': 'Try Again ↻',
  'Inny tryb': 'Other Mode',
  'Wpisz z pamięci': 'Type from memory',
  '💡 Podpowiedź': '💡 Hint',
  '👁 Pokaż jeszcze raz': '👁 Show once more',
  'Jeszcze raz': 'Once More',
  'Mapa': 'Map',
  'Do gry swobodnej 🚀': 'To Free Play 🚀',
  'Zaczynamy! ▶': 'Let\'s begin! ▶',
  'do pierwszej pomyłki': 'until first mistake',
  '5 unikalnych wariantów': '5 unique modes',
  'Wpisz cyfry z pamięci!': 'Enter digits from memory!',
  'Wpisz z pamięci:': 'Type from memory:',
  'Usuń ostatnią cyfrę': 'Delete last digit',
  '🐱 Podpowiedź Mruczka': '🐱 Whiskers\' Hint',
  '🐯 Podpowiedź Leona': '🐯 Leo\'s Hint',
  '🦊 Podpowiedź Liska': '🦊 Rusty\'s Hint',
  '🦉 Podpowiedź Sówki': '🦉 Owl\'s Hint',
  '🦜 Podpowiedź Poli': '🦜 Polly\'s Hint',
  '🦝 Podpowiedź Szopa': '🦝 Bandit\'s Hint',
  '🐿️ Podpowiedź Basi': '🐿️ Hazel\'s Hint',
  '🐢 Podpowiedź Żółwika': '🐢 Turtle\'s Hint',
  '🐶 Podpowiedź Pieska': '🐶 Patch\'s Hint',
  '🐙 Podpowiedź Inki': '🐙 Inky\'s Hint',
  '💡 Podpowiedź Liska': '💡 Rusty\'s Hint',
  '💡 Podpowiedź Mruczka': '💡 Whiskers\' Hint',
  '💡 Podpowiedź Leona': '💡 Leo\'s Hint',
  '💡 Podpowiedź Sówki': '💡 Owl\'s Hint',
  '💡 Podpowiedź Poli': '💡 Polly\'s Hint',
  '💡 Podpowiedź Szopa': '💡 Bandit\'s Hint',
  '💡 Podpowiedź Basi': '💡 Hazel\'s Hint',
  '💡 Podpowiedź Żółwika': '💡 Turtle\'s Hint',
  '💡 Podpowiedź Pieska': '💡 Patch\'s Hint',
  '💡 Podpowiedź Inki': '💡 Inky\'s Hint',
  '🐱 Tajnik Kotka: ': '🐱 Whiskers\' Secret: ',
  '🐯 Krok Leona: ': '🐯 Leo\'s Step: ',
  '🦊 Wskazówka Liska: ': '🦊 Rusty\'s Tip: ',
  '🦉 Tajnik Sówki: ': '🦉 Owl\'s Secret: ',
  '🦜 Podpowiedź Poli: ': '🦜 Polly\'s Tip: ',
  '🦝 Trik Szopa: ': '🦝 Bandit\'s Trick: ',
  '🐿️ Krok Basi: ': '🐿️ Hazel\'s Step: ',
  '🐢 Krok Żółwika: ': '🐢 Turtle\'s Step: ',
  '🐢 Mądrość Żółwika: ': '🐢 Turtle\'s Wisdom: ',
  '🐶 Trop Pieska: ': '🐶 Patch\'s Clue: ',
  '🐙 Pędzel Inki: ': '🐙 Inky\'s Brush: ',
  '📲 Zainstaluj Świat pamięci': '📲 Install World of Memory',
  'Aplikacja działa w 100% offline jako Progressive Web App (PWA) – bez reklam i bez pobierania ze sklepu!': 'The app runs 100% offline as a Progressive Web App (PWA) – zero ads and no store download required!',
  'Zainstaluj teraz ⬇': 'Install Now ⬇',
  '🤖 Na Androidzie (Chrome / Edge / Samsung):': '🤖 On Android (Chrome / Edge / Samsung):',
  'Kliknij przycisk poniżej lub menu przeglądarki (trzy kropki ⋮).': 'Click the button below or your browser menu (three dots ⋮).',
  'Wybierz „Zainstaluj aplikację” lub „Dodaj do ekranu głównego”.': 'Select "Install app" or "Add to Home Screen".',
  '🍏 Na iPhone / iPad (Safari):': '🍏 On iPhone / iPad (Safari):',
  'Kliknij przycisk Udostępnij na dole ekranu (kwadrat ze strzałką w górę 📤).': 'Tap the Share button at the bottom of the screen (square with an arrow pointing up 📤).',
  'Wybierz „Do ekranu początkowego” (Add to Home Screen).': 'Choose "Add to Home Screen".',
  'Kliknij „Dodaj” – gotowe! 🚀': 'Tap "Add" – all done! 🚀',
  'Ups, coś poszło nie tak. Sprawdź połączenie i odśwież stronę.': 'Oops, something went wrong. Check your connection and refresh the page.',
  '🐶 Szkolenie z Pieskiem Łatkiem': '🐶 Training with Patch the Dog',
  '🐢 Szkolenie z Żółwikiem Zegarowym': '🐢 Training with Clockwork Turtle',
  '🐢 Szkolenie z Żółwikiem Zenonem': '🐢 Training with Clockwork Turtle',
  '🦝 Szkoła Magii Szopa Magika': '🦝 Bandit the Magician\'s School of Magic',
  '🎓 Szkolenie z kotem': '🎓 Training with the Cat',
  '🐿️ Szkolenie z Wiewiórką Basią': '🐿️ Training with Hazel the Squirrel',
  '🦉 Akademia Sówki Profesora': '🦉 Professor Owl\'s Academy',
  '🐙 Szkolenie z Ośmiornicą Inką': '🐙 Training with Inky the Octopus',
  '🦊 Szkolenie z Liskiem Bystrzakiem': '🦊 Training with Rusty the Fox',
  '🐯 Szkolenie z Tygryskiem Leonem': '🐯 Training with Leo the Tiger',
  '🦜 Szkolenie z Papużką Polą': '🦜 Training with Polly the Parrot',
  'Złap każdy trop pamięciowy! Zapamiętuj kolejność planet, kolory tęczy, rzymskie cyfry i reguły szkolne za pomocą pierwszych liter.': 'Track down every memory clue! Memorize the order of planets, rainbow colors, Roman numerals, and school rules using first letters.',
  'Opanuj algorytm Doomsday. Podaj dzień tygodnia dowolnej daty w historii w kilka sekund.': 'Master the Doomsday algorithm. Determine the day of the week for any date in history in seconds.',
  'Cała talia 52 kart w głowie! Poznaj system PAO stosowany przez mistrzów iluzji i pamięci.': 'An entire 52-card deck in your mind! Discover the PAO system used by masters of illusion and memory.',
  'Naucz się zapamiętywać liczby – krok po kroku.': 'Learn to memorize numbers – step by step.',
  'Łącz myśli jak kostki domina. Zapamiętuj listy zakupów, przemówienia i procedury bez kartki papieru.': 'Connect thoughts like domino tiles. Memorize grocery lists, speeches, and procedures without paper.',
  'Tajemny kod mistrzów pamięci: zamieniaj liczby na słowa i obrazy.': 'The secret code of memory masters: turn numbers into words and images.',
  'Rozwiń 8 macek swojej wyobraźni! Twórz nielinearne notatki wizualne, zapamiętuj całe książki, projekty i wystąpienia na jednej kartce.': 'Unfurl all 8 tentacles of imagination! Create non-linear visual notes, memorize whole books, projects, and speeches on a single page.',
  'Nigdy więcej „znam tę twarz, ale jak on miał na imię?”. Opanuj technikę kotwic i mostów fonetycznych.': 'Never again say "I know that face, but what was their name?". Master the technique of anchors and phonetic bridges.',
  'Poznaj najstarszą i najpotężniejszą technikę pamięciową świata – metodę Loci.': 'Discover the oldest and most powerful memory technique in the world – the Method of Loci.',
  'Naucz się obcych języków bez zkuwania. Twórz dźwiękowe mosty i żywe sceny!': 'Learn foreign languages without cramming. Build sound bridges and vivid scenes!',
  'Rozpocznij naukę twarzy': 'Start Face Learning',
  'Rozpocznij naukę cyfr': 'Start Learning Digits',
  'Rozpocznij naukę pałacu pamięci': 'Start Learning Memory Palace',
  'Rozpocznij naukę imion i twarzy': 'Start Learning Names & Faces',
  'Rozpocznij naukę Systemu Major': 'Start Learning Major System',
  'Rozpocznij naukę słówek': 'Start Learning Vocabulary',
  'Rozpocznij naukę kart': 'Start Learning Playing Cards',
  'Rozpocznij naukę łańcucha skojarzeń': 'Start Learning Link System',
  'Rozpocznij naukę kalendarza': 'Start Learning Mental Calendar',
  'Rozpocznij naukę akrostychów': 'Start Learning Acrostics',
  'Rozpocznij naukę map myśli': 'Start Learning Mind Maps',
  'Rozpocznij naukę Map Myśli': 'Start Learning Mind Maps',
  'Powtórz szkolenie': 'Repeat Training',
  'Kontynuuj szkolenie': 'Continue Training',
  'Ukończono szkolenie': 'Training Completed',
  '10 lekcji · haczyki pierwszych liter · całe listy wiedzy w jednym zdaniu': '10 lessons · first-letter hooks · full lists in one sentence',
  '6 lekcji · algorytm Doomsday · kotwice miesięcy · dni tygodnia w pamięci': '6 lessons · Doomsday algorithm · month anchors · mental calendar',
  '6 lekcji · żywioły talii · metoda PAO · zapamiętywanie rozdań': '6 lessons · suits of the deck · PAO method · memorizing deals',
  '9 lekcji · od 3 do 12 cyfr · podpowiedzi Mruczka': '9 lessons · 3 to 12 digits · Whiskers\' hints',
  '15 lekcji · od 1 do 12 cyfr · podpowiedzi Mruczka': '15 lessons · 1 to 12 digits · Whiskers\' hints',
  '15 lekcji · od 3 do 12 cyfr · podpowiedzi Mruczka': '15 lessons · 3 to 12 digits · Whiskers\' hints',
  '6 interaktywnych lekcji · kotwice cech · mosty fonetyczne': '6 interactive lessons · feature anchors · phonetic bridges',
  '10 lekcji · od 2 do 10 komnat · spokojne wskazówki Leona': '10 lessons · 2 to 10 rooms · Leo\'s calm tips',
  '6 lekcji · efekt domina · cały łańcuch 20 ogniw bez kartki': '6 lessons · domino effect · 20 links without notes',
  '8 lekcji · spółgłoski 0-9 · kołki pamięciowe · zapamiętywanie PIN': '8 lessons · consonants 0-9 · memory pegs · memorizing PINs',
  '10 lekcji · promieniście od centrum · nielinearne notatki i gałęzie wiedzy': '10 lessons · radiant from center · non-linear notes & knowledge branches',
  '8 lekcji · od 2 do 10 komnat · spokojne wskazówki Leona': '8 lessons · 2 to 10 rooms · Leo\'s calm tips',
  '6 lekcji · metoda słów-kluczy · ponad 100 angielskich słówek w locie': '6 lessons · Keyword Method · over 100 English words on the fly',
  'Zobacz mapę lekcji akrostychów →': 'View acrostics lesson map →',
  'Zobacz mapę lekcji kalendarza →': 'View calendar lesson map →',
  'Zobacz mapę lekcji magii →': 'View magic lesson map →',
  'Zobacz mapę lekcji →': 'View lesson map →',
  'Zobacz mapę lekcji skojarzeń →': 'View link lesson map →',
  'Zobacz wykaz wykładów →': 'View lecture list →',
  'Zobacz mapę lekcji kartografii umysłu →': 'View mind cartography lesson map →',
  'Zobacz mapę komnat i lekcji →': 'View room & lesson map →',
  'Zobacz mapę lekcji cyfr →': 'View digits lesson map →',
  'Zobacz mapę lekcji pałacu →': 'View palace lesson map →',
  'Zobacz mapę lekcji tropienia wiedzy →': 'View knowledge tracking lesson map →',
  'Rozszyfruj Akrostych': 'Decode Acrostic',
  'Kolejność Mistrza': 'Master\'s Sequence',
  'Brakujące Ogniwo': 'Missing Link',
  'Brakujące ogniwo': 'Missing Link',
  'Błyskawiczny Tropiciel': 'Speed Tracker',
  'Jaki to dzień tygodnia?': 'What Day Is It?',
  'Kotwice miesięcy': 'Month Anchors',
  'Wyścig z żółwikiem': 'Turtle Sprint',
  'Podróżnik w czasie': 'Time Traveler',
  'Sekwencja magika': 'Magician\'s Sequence',
  'Rozpoznaj PAO': 'Identify PAO',
  'Zaginiona karta': 'Missing Card',
  'Gorączka talii': 'Deck Frenzy',
  'Klasyk': 'Classic',
  'Błysk': 'Flash',
  'Odwrotnie': 'Reverse',
  'Paczki': 'Chunks',
  'Melodia': 'Melody',
  'Kształty': 'Shapes',
  'Łańcuch w przód': 'Forward Chain',
  'Spacer w tył': 'Backward Walk',
  'Spacer w Tył': 'Backward Walk',
  'Nieskończone domino': 'Endless Dominoes',
  'Kołki 0-9': 'Pegs 0-9',
  'Dekoder słów': 'Word Decoder',
  'Szybki szyfrant': 'Speed Encoder',
  'Trening PIN': 'PIN Training',
  'Brakująca Gałąź': 'Missing Branch',
  'Brakująca gałąź': 'Missing Branch',
  'Gdzie Przypiąć Mackę?': 'Where to Attach the Tentacle?',
  'Przypisz do gałęzi': 'Assign to Branch',
  'Znajdź Intruza': 'Find the Intruder',
  'Znajdź intruza': 'Find the Intruder',
  'Wyścig z Inką (30 sek)': 'Race with Inky (30s)',
  'Szybka mapa': 'Speed Map',
  'Kto to jest?': 'Who Is This?',
  'Kto jest kim?': 'Who is Who?',
  'Znajdź osobę': 'Find the Person',
  'Sprint imion': 'Name Sprint',
  'Koktajl Party': 'Cocktail Party',
  'Wędrówka Odkrywcy': 'Explorer\'s Journey',
  'Błyskawiczny Pałac': 'Speed Palace',
  'Strażnik Komnat': 'Chamber Guardian',
  'Nieskończona Wędrówka': 'Endless Journey',
  'Błyskawiczny tłumacz': 'Speed Translator',
  'Mosty Poli': 'Polly\'s Bridges',
  'Sprint papugi': 'Parrot Sprint',
  'Nieskończony poliglota': 'Endless Polyglot',
  'Klasyczny': 'Classic',
  'Kolejność': 'Sequence',
  'Bystre Oko': 'Sharp Eye',
  'Na czas': 'Timed',
  'Fundament': 'Foundation',
  'Wyzwanie': 'Challenge',
  'Pamięć': 'Memory',
  'Kojarzenie': 'Association',
  'Koncentracja': 'Focus',
  'Pod prąd': 'Upstream',
  'Dedukcja': 'Deduction',
  'Nieskończony': 'Endless',
  'Podstawy': 'Basics',
  'Odszyfruj': 'Decode',
  'Kodowanie': 'Encoding',
  'Praktyka': 'Practice',
  'Spostrzegawczość': 'Observation',
  'Mnemotechnika': 'Mnemonics',
  'Widzisz słynne zdanie mnemotechniczne. Rozszyfruj, jakie pojęcia kryją się za jego pierwszymi literami!': 'See a famous mnemonic sentence. Decode which concepts are hidden behind its first letters!',
  'Użyj tropu w głowie i wskaż prawidłowe następstwo elementów (np. planet lub barw tęczy).': 'Use the clue in your mind and identify the correct sequence of items (e.g. planets or rainbow colors).',
  'Pieskowi uciekł jeden element z sekwencji! Czy potrafisz wytropić, czego brakuje na liście?': 'One item escaped Patch\'s sequence! Can you track down what is missing from the list?',
  '30 sekund na zegarze! Ile haseł i tropów zdołasz rozpoznać w zawrotnym tempie?': '30 seconds on the clock! How many clues and keywords can you recognize at breakneck speed?',
  'Widzisz datę w bieżącym roku. Oblicz w głowie jej dzień tygodnia w kilka sekund!': 'See a date in the current year. Calculate its weekday in your head in seconds!',
  'Przetestuj znajomość magicznych dat bazowych (4.04, 6.06, 9.05, 11.07 itp.).': 'Test your knowledge of the magical anchor dates (4/4, 6/6, 9/5, 11/7, etc.).',
  '30 sekund na zegarze! Ile dni tygodnia zdołasz błyskawicznie obliczyć?': '30 seconds on the clock! How many weekdays can you calculate in a flash?',
  'Dowolne daty z historii i przyszłości (1970–2040). Czy potrafisz obliczyć dzień swoich urodzin?': 'Any dates from history and the future (1970–2040). Can you calculate your own birthday\'s weekday?',
  'Szop Magik tasuje i odkrywa karty. Zapamiętaj ich kolejność i odtwórz bezbłędnie!': 'Bandit the Magician shuffles and reveals cards. Memorize their order and recreate it flawlessly!',
  'Spójrz na kartę i wskaż jej postać, unikalną akcję lub rekwizyt.': 'Look at the card and pick its character, unique action, or prop.',
  'Cztery karty leżą na stole. Szop zakrywa jedną z nich – zgadniesz, która zniknęła?': 'Four cards lie on the table. Bandit covers one of them – can you guess which disappeared?',
  '30 sekund! Błyskawiczne odczytywanie kart i ich znaczeń w zawrotnym tempie.': '30 seconds! Rapid-fire card reading and meaning recognition at high speed.',
  'Wszystkie cyfry naraz. Czysta pamięć – czas skraca się z poziomem.': 'All digits at once. Pure memory – viewing time shrinks with each level.',
  'Cyfry mrugają po jednej. Nie zdążysz drugi raz – skup się!': 'Digits flash one by one. No second glance – stay focused!',
  'Zapamiętaj, a potem wpisz od końca. Mózg na wysokich obrotach.': 'Memorize, then type in reverse. Brain running on high gear.',
  'Cyfry w grupkach jak numer telefonu – ćwiczysz technikę grupowania.': 'Digits grouped like a phone number – practice your chunking technique.',
  'Każda cyfra to unikalny ton muzyczny. Zapamiętujesz rytm i melodię!': 'Each digit is a unique musical tone. Memorize rhythm and melody!',
  'Cyfry z podpowiedziami kształtów (np. 🦢, ☃️). Twórz w głowie szalone historie!': 'Digits with shape hints (e.g. 🦢, ☃️). Create wild stories in your mind!',
  'Podążaj za akcją historii! Wskaż przedmiot, który następuje bezpośrednio po obecnym.': 'Follow the storyline! Pick the item that immediately follows the current one.',
  'Prawdziwy test siły Twoich skojarzeń: czy potrafisz cofnąć taśmę filmu w tył?': 'The ultimate test of your links: can you rewind the movie tape backward?',
  'Element A i element C są na ekranie. Jaki przedmiot łączy je pośrodku?': 'Item A and Item C are on screen. Which object bridges them in the middle?',
  'Wiewiórka Basia dokłada kolejne orzeszki-ogniwa. Jak długi łańcuch zdołasz zbudować?': 'Hazel the Squirrel adds acorn links one by one. How long of a chain can you build?',
  'Opanuj alfabet fonetyczny do perfekcji: błyskawicznie łącz cyfry 0-9 z ich dźwiękami.': 'Master the phonetic alphabet to perfection: connect digits 0-9 to their consonant sounds in a flash.',
  'Widzisz słowo (np. KOT, BALON, NOS). Jakie cyfry kryją się w jego spółgłoskach?': 'See a word (e.g. CAT, BALLOON, NOSE). Which digits hide inside its consonants?',
  'Widzisz liczbę (np. 14, 52, 91). Wybierz słowo, które poprawnie koduje te cyfry!': 'See a number (e.g. 14, 52, 91). Choose the word that correctly encodes those digits!',
  'Prawdziwe wyzwanie! Zapamiętuj 4-cyfrowe kody PIN zamieniając je w 2 żywe obrazy.': 'A real challenge! Memorize 4-digit PINs by turning them into 2 vivid images.',
  'Ośmiornica Inka ukryła jedno z ramion mapy myśli! Odgadnij, jak nazywa się brakująca gałąź wiedzy.': 'Inky the Octopus hid one of the mind map branches! Guess the name of the missing branch of knowledge.',
  'Pojawia się pojedyncze pojęcie lub zjawisko. Przypnij je do właściwego ramienia mapy myśli!': 'A single term or concept appears. Attach it to the correct branch of the mind map!',
  'Na jednej z gałęzi zaplątał się element, który kompletnie nie pasuje do kategorii. Oczyść mapę myśli!': 'An intruder got tangled on one of the branches that doesn\'t fit the category. Clean up the mind map!',
  'Czysty 30-sekundowy bieg! Ile powiązań na mapie myśli zdołasz poprawnie skojarzyć, zanim minie czas?': 'A pure 30-second sprint! How many mind map associations can you make before time runs out?',
  'Spójrz na twarz, znajdź kotwicę i wybierz właściwe imię z 4 propozycji.': 'Look at the face, find the anchor, and pick the correct name from 4 choices.',
  'Lisek wymienia gościa. Znajdź go błyskawicznie w tłumie na podstawie cech!': 'Rusty names a guest. Find them instantly in the crowd based on their features!',
  '30 sekund na zegarze! Ile twarzy zdołasz bezbłędnie przywitać?': '30 seconds on the clock! How many faces can you greet flawlessly?',
  'Poznajesz kolejnych gości na bankiecie. Sprawdzian co rundę, aż do pierwszej pomyłki!': 'Meet new guests at the banquet. Tested every round until your first mistake!',
  'Klasyczna wędrówka przez komnaty. Z każdym poziomem trasa wydłuża się o jedno miejsce!': 'Classic journey through the rooms. With each level, the route extends by one spot!',
  'Spacer na czas! Komnaty zmieniają się automatycznie co 3 sekundy. Twórz skojarzenia w ułamku oka!': 'Speed walk! Rooms advance automatically every 3 seconds. Forge associations in the blink of an eye!',
  'Prawdziwy test mistrza: zapamiętaj trasę od wejścia, a potem odtwórz ją od końca do początku!': 'A true master\'s test: remember the route from the entrance, then recall it from finish to start!',
  'Losowe wyzwanie! Tygrysek pyta wyrywkowo: „Gdzie ukrył się jednorożec?” lub „Co zostawiłeś w Wieży?”.': 'Random challenge! Leo asks on the spot: "Where did the unicorn hide?" or "What was left in the Tower?".',
  'Zaczynasz od 3 komnat. Z każdą rundą dochodzi kolejna, aż do pierwszej pomyłki. Jaki jest Twój rekord?': 'Start with 3 rooms. Another room is added each round until your first mistake. What is your record?',
  'Spójrz na angielskie słowo i błyskawicznie wskaż polskie znaczenie.': 'Look at the English word and instantly identify the Polish meaning.',
  'Wskaż genialne polskie skojarzenie brzmieniowe (most), które łączy słowo ze znaczeniem.': 'Pick the brilliant acoustic sound bridge connecting the word with its meaning.',
  '30 sekund na zegarze! Ile słówek zdołasz przetłumaczyć w locie?': '30 seconds on the clock! How many words can you translate on the fly?',
  'Gra aż do pierwszej pomyłki. Każda poprawna odpowiedź zwiększa mnożnik punktów!': 'Play until the first mistake. Each correct answer boosts your point multiplier!',
  'Pewność siebie w szkole i na studiach! Zapamiętasz kolejność planet, kolory tęczy, wzory i reguły raz na zawsze bez wkuwania po nocach!': 'Confidence in school and college! Remember the order of planets, rainbow colors, formulas, and rules once and for all without late-night cramming!',
  'Wygoda i podziw znajomych! Obliczysz dzień tygodnia dowolnej daty (urodzin, rocznicy, historycznego wydarzenia) w głowie w 3 sekundy bez sięgania po telefon!': 'Convenience and awe from friends! Calculate the weekday of any date (birthdays, anniversaries, historic events) in your head in 3 seconds without reaching for a phone!',
  'Skupienie i niezwykła wyobraźnia! Zapamiętanie całej talii kart to szczytowe osiągnięcie mistrzów pamięci – rozwija koncentrację i logiczne myślenie jak mało co!': 'Focus and extraordinary imagination! Memorizing a full deck of cards is a pinnacle feat of memory champions – developing concentration and logical thinking like nothing else!',
  'Kody BLIK na zakupach (zanim znikną z ekranu!), PIN-y do kart, kody do domofonów i numery telefonów bliskich w nagłych wypadkach – zapamiętasz je w 3 sekundy bez panicznego szukania komórki!': 'Online shopping codes (before they vanish!), card PINs, door entry codes, and family phone numbers in emergencies – remember them in 3 seconds without panicking for your phone!',
  'Koniec z zapominaniem zakupów i wystąpienia publiczne bez kartki! Każdy punkt prezentacji czy procedury pociąga za sobą kolejny jak kostki domina – pełna swoboda!': 'No more forgotten groceries and note-free public speaking! Each point of a presentation or procedure triggers the next like dominoes – total freedom!',
  'Najpotężniejsze narzędzie pamięciowe w historii nauki! Z łatwością zapamiętasz kody PIN, numery kont, daty historyczne i trudne numery telefonów zamieniając je w słowa!': 'The most powerful memory tool in the history of learning! Effortlessly remember PINs, bank accounts, history dates, and tricky phone numbers by turning them into words!',
  'Ogarnięcie chaosu w szkole i pracy! Zamiast nudnych stron notatek – jedna barwna mapa, z której uczysz się całych działów do egzaminów i planujesz wielkie projekty!': 'Conquering chaos in study and work! Instead of boring pages of notes – one colorful map to master entire exam subjects and plan big projects!',
  'Pewność siebie w nowej pracy, w szkole i na spotkaniach towarzyskich! Gdy zwrócisz się do nowo poznanej osoby po imieniu już po pierwszej rozmowie, zrobisz oszałamiające wrażenie i od razu zyskasz jej sympatię!': 'Confidence at a new job, in school, and at social gatherings! When you address someone by name after the very first conversation, you make a stunning impression and win their affection immediately!',
  'Nieograniczony dysk twardy w Twojej głowie! Starożytni mówcy używali metody Loci, by wygłaszać wielogodzinne mowy bez ani jednej kartki. Dziś to fundament każdego mistrza świata!': 'An unlimited hard drive in your head! Ancient orators used the Method of Loci to deliver multi-hour speeches without a single note. Today, it is the cornerstone of every world champion!',
  'Nauka języków staje się czystą zabawą! Zamiast wkuwać 20 razy to samo słowo, tworzysz jedno śmieszne skojarzenie brzmieniowe i zapamiętujesz je od pierwszego razu!': 'Language learning becomes pure fun! Instead of repeating a word 20 times, build one hilarious sound-alike connection and remember it on the very first try!',
  'Hau! Jestem Piesek Łatek 🐶 Zbudujemy razem sprytne tropy ze zdań i wierszyków!': 'Woof! I\'m Patch the Dog 🐶 Together we\'ll build clever clues out of sentences and rhymes!',
  'Opanowałeś metodę pierwszych liter po mistrzowsku! Wybierz tryb gry swobodnej! 🏆': 'You mastered the first-letter method like a champion! Choose a free play mode! 🏆',
  'Tik-tak! Jestem Żółwik Zegarowy 🐢 Nie spiesz się – kalendarz to prosty rytm, nauczę Cię go!': 'Tick-tock! I\'m Clockwork Turtle 🐢 Take your time – the calendar is a simple rhythm, I\'ll teach you!',
  'Znasz kalendarz w głowie lepiej niż zegarmistrz! Zagraj w trybie swobodnym! 🏆': 'You know the mental calendar better than a watchmaker! Play in free mode! 🏆',
  'Tadaam! Jestem Szop Magik 🦝 Pokażę Ci, jak zapamiętać dowolny układ kart!': 'Ta-da! I\'m Bandit the Magician 🦝 I\'ll show you how to memorize any deck arrangement!',
  'Twoja pamięć kart jest magiczna! Czas na grę swobodną! 🏆': 'Your card memory is magical! Time for free play! 🏆',
  'Miau! Jestem Mruczek 🐾 Zacznij od szkolenia – nauczę Cię sztuczek, a potem sprawdź się w grze swobodnej!': 'Meow! I\'m Whiskers 🐾 Start with training – I\'ll teach you tricks, then test yourself in free play!',
  'Ukończyłeś szkolenie! 🏆 Czas pobić rekordy w grze swobodnej!': 'You completed training! 🏆 Time to break records in free play!',
  'Chrup! Jestem Wiewiórka Basia 🐿️ Zbudujemy razem łańcuch myśli, który nigdy się nie zerwie!': 'Crunch! I\'m Hazel the Squirrel 🐿️ We\'ll forge a thought chain that will never break!',
  'Opanowałeś metodę łańcuchową po mistrzowsku! Wybierz tryb gry swobodnej! 🏆': 'You mastered the link method like a champion! Choose a free play mode! 🏆',
  'Uhuhu! Jestem Sówka Profesor 🦉 Nauczę Cię zamieniać nudne cyfry w fascynujące obrazy!': 'Hoo-hoo! I\'m Professor Owl 🦉 I\'ll teach you to turn dry digits into fascinating imagery!',
  'Ukończyłeś całą Akademię Majora! Sprawdź swój refleks w grze swobodnej! 🏆': 'You graduated from the Major Academy! Test your reflexes in free play! 🏆',
  'Plusk! Jestem Ośmiornica Inka 🐙 Rozrysujemy każdą wiedzę w barwne gałęzie myśli!': 'Splash! I\'m Inky the Octopus 🐙 We\'ll map all knowledge into radiant branches of thought!',
  'Opanowałeś mapy myśli po mistrzowsku! Wybierz tryb gry swobodnej! 🏆': 'You mastered mind maps like a champion! Choose a free play mode! 🏆',
  'Hau! Jestem Lisek Bystrzak 🦊 Każda twarz ma w sobie sekret. Nauczę Cię go czytać!': 'Hi there! I\'m Rusty the Fox 🦊 Every face holds a secret. I\'ll teach you how to read it!',
  'Twoja pamięć twarzy jest bystra jak lis! Wybierz tryb gry swobodnej! 🏆': 'Your face memory is sharp like a fox! Choose a free play mode! 🏆',
  'Rawrr! Jestem Leon 🐯 Nauczę Cię metody Loci bez pośpiechu. Zaczynamy od szkolenia!': 'Rawrr! I\'m Leo the Tiger 🐯 I\'ll teach you the Method of Loci at an easy pace. Let\'s start training!',
  'Opanowałeś cały pałac! 🏆 Sprawdź swoje siły w 5 wariantach gry swobodnej!': 'You mastered the whole palace! 🏆 Test your powers in 5 free play modes!',
  'Kraaa! Jestem Papużka Pola 🦜 Pokażę Ci, jak zapamiętywać słówka w 3 sekundy!': 'Squawk! I\'m Polly the Parrot 🦜 I\'ll show you how to memorize vocabulary in 3 seconds!',
  'Znasz już metodę słów-kluczy jak prawdziwy poliglota! Wybierz tryb gry! 🏆': 'You master the keyword method like a true polyglot! Choose a game mode! 🏆',
  'Szkolenie: Imiona i twarze': 'Training: Names and Faces',
  'Krok po kroku naucz się zapamiętywać każdą twarz i imię na całe życie.': 'Step by step, learn to remember every face and name for a lifetime.',
  '🦊 Szkolenie: Imiona i twarze': '🦊 Training: Names & Faces',
  '🐶 Szkolenie: Akrostychy i rymy': '🐶 Training: Acrostics & Rhymes',
  '🐢 Szkolenie: Kalendarz w głowie': '🐢 Training: Mental Calendar',
  '🦝 Szkolenie: Karty do gry': '🦝 Training: Playing Cards',
  '🐿️ Szkolenie: Łańcuch skojarzeń': '🐿️ Training: Link System',
  '🦉 Szkolenie: System Major': '🦉 Training: Major System',
  '🐙 Szkolenie: Mapy myśli': '🐙 Training: Mind Maps',
  '🐯 Szkolenie: Pałac pamięci': '🐯 Training: Memory Palace',
  '🦜 Szkolenie: Słówka i języki': '🦜 Training: Vocabulary & Languages',
  'Miau! Łaskoczesz mnie! 😸': 'Meow! You are tickling me! 😸',
  'Mrrrau! Kręcę się z radości! 🐾': 'Purrr! Spinning with joy! 🐾',
  'Hej! Wracamy do ćwiczeń? Razem pobijemy rekord! ✨': 'Hey! Back to training? We\'ll break the record together! ✨',
  'Wiesz, że koty śpią 16 godzin? Ty ćwicz pamięć!': 'Did you know cats sleep 16 hours? You keep training your memory!',
  'Mruuu… ale fajnie! Twój mózg jest niesamowity! 🧠': 'Purrr… so nice! Your brain is amazing! 🧠',
  'Głaszcz, głaszcz! Każde głaskanie to +10 do koncentracji! 🐱': 'Pet me, pet me! Each petting gives +10 to concentration! 🐱',
  'Hau, hau! Jestem Piesek Łatek 🐶 Złapię każdy trop pamięciowy!': 'Woof, woof! I\'m Patch the Dog 🐶 I track every memory clue!',
  'Wystarczy pierwsza literka, a całe słowo samo wskakuje do głowy! 🐾': 'Just the first letter, and the whole word leaps into your mind! 🐾',
  'Moje oklapnięte uszka nasłuchują nowych wierszyków i skrótów! ✨': 'My floppy ears are listening for new rhymes and acronyms! ✨',
  '„Moja Wiecznie Zapracowana Mama...” – znasz już planety na pamięć? 🪐': '"My Very Educated Mother..." – do you know the planets by heart already? 🪐',
  'Hau! Za każde dobrze odgadnięte hasło merdam ogonkiem! 🦴': 'Woof! For every correct word, I wag my tail with glee! 🦴',
  'Wytropmy razem wszystkie sekrety pamięci! Do dzieła! 🐶': 'Let\'s track down all memory secrets together! Let\'s go! 🐶',
  'Hau! Lisek Bystrzak na tropie! 🦊': 'Hi! Rusty the Fox on the trail! 🦊',
  'Każda twarz to mapa skarbów – szukaj kotwic! ⚓': 'Every face is a treasure map – look for anchors! ⚓',
  'Widzisz te okulary? To gotowy most fonetyczny! 👓': 'See those glasses? That is a ready phonetic bridge! 👓',
  'Mój rudy ogon macha z zachwytu! Świetnie trenujesz! 🌟': 'My bushy red tail wags with delight! Great training! 🌟',
  'Zapamiętałeś już Marka i Basię? Sprawdźmy to! 👥': 'Remembered Mark and Barbara yet? Let us test it! 👥',
  'Spryt jak u lisa, pamięć jak u mistrza! 🧠': 'Clever as a fox, memory of a champion! 🧠',
  'Plusk! Jestem Ośmiornica Inka 🐙 Moje 8 macek ogarnia cały chaos!': 'Splash! I\'m Inky the Octopus 🐙 My 8 tentacles conquer all chaos!',
  'Mózg nie myśli w nudnych linijkach, tylko promieniście! 💡': 'The brain thinks radiantly, not in dull lines! 💡',
  'Jedna gałąź = jedno słowo-klucz! To złota zasada kartografa! 🎨': 'One branch = one keyword! The cartographer’s golden rule! 🎨',
  'Moje przyssawki trzymają każdą wiedzę mocniej niż klej! 🪸': 'My suction cups hold onto knowledge tighter than glue! 🪸',
  'Rysuj piktogramy! Obraz jest wart 60 000 słów! 🖍️': 'Draw pictograms! An image is worth 60,000 words! 🖍️',
  'Zanurz się w oceanie wyobraźni razem ze mną! 🌊': 'Dive into the ocean of imagination with me! 🌊',
  'Uhuhu! Wiedza to największy skarb! 🦉': 'Hoo-hoo! Knowledge is the greatest treasure! 🦉',
  'Cyfra 0 to S lub Z, cyfra 1 to T lub D... pamiętasz? 📚': 'Digit 0 is S/Z, digit 1 is T/D... remember? 📚',
  'Samogłoski to tylko klej łączący spółgłoski! 🧪': 'Vowels are just the glue connecting consonants! 🧪',
  'W mojej bibliotece każda liczba ma swoje słowo! 🏛️': 'In my library, every number has its own word! 🏛️',
  'Mądrość przychodzi z każdym kolejnym treningiem! 🌟': 'Wisdom grows with every single practice session! 🌟',
  'Uhu! Twoje postępy imponują nawet profesorowi! 🎓': 'Hoot! Your progress impresses even a professor! 🎓',
  'Kraaa! Papużka Pola wita na pokładzie! 🦜': 'Squawk! Polly the Parrot welcomes you aboard! 🦜',
  'Mushroom to pieczarka, bo mistrz boksu (champion) ją zajada! 🥊': 'Mushroom is champignon, because a boxing champion eats it! 🥊',
  'Kolorowe piórka, kolorowe skojarzenia! 🌈': 'Colorful feathers, colorful associations! 🌈',
  'Powtórz słówko na głos – dźwięk szybciej wpada do głowy! 🗣️': 'Say the word out loud – sound enters memory faster! 🗣️',
  'Kraaa! Angielski jest prostszy niż myślisz! ✈️': 'Squawk! English is simpler than you think! ✈️',
  'Kto nie ćwiczy języka, ten zapomina słówka! Trenujmy! 🍌': 'He who neglects practice forgets words! Let us train! 🍌',
  'Tadaam! Szop Magik wyciąga asa z rękawa! 🦝': 'Ta-da! Bandit the Magician pulls an ace from his sleeve! 🦝',
  'Postać, Akcja, Obiekt – to cała tajemnica PAO! 🃏': 'Person, Action, Object – that is the whole PAO secret! 🃏',
  'Karty nie mają sekretów przed bystrym iluzjonistą! 🎩': 'Cards hold no secrets from a sharp illusionist! 🎩',
  'Magia pamięci to najwspanialsza sztuczka świata! ✨': 'Memory magic is the greatest illusion in the world! ✨',
  'Pik, Kier, Karo, Trefl – cztery żywioły w Twojej dłoni! ♠️': 'Spades, Hearts, Diamonds, Clubs – four suits in your hand! ♠️',
  'Spójrz na moje łapki – nic w nich nie ma, a karty pamiętam! 🪄': 'Look at my paws – nothing inside, yet I remember all cards! 🪄',
  'Chrup, chrup! Zbieram orzeszki na zimę i wspomnienia! 🐿️': 'Crunch, crunch! Gathering acorns for winter and memories! 🐿️',
  'Jedno skojarzenie pociąga drugie jak kostki domina! 🌰': 'One association triggers the next like domino tiles! 🌰',
  'Im śmieszniejsza historyjka, tym mocniej siedzi w głowie! 🎈': 'The funnier the story, the stronger it sticks in your head! 🎈',
  'Mój puszysty ogonek pomaga mi utrzymać równowagę myśli! 🌿': 'My fluffy tail helps me balance my thoughts! 🌿',
  'Zbudujmy łańcuch ze 100 ogniw! Damy radę! 🔗': 'Let\'s build a chain of 100 links! We can do it! 🔗',
  'Nie bój się przesady – gigantyczny arbuz łatwiej zapamiętać! 🍉': 'Don\'t fear exaggeration – a gigantic watermelon is easier to recall! 🍉',
  'Rawrr! Cześć! Jestem Leon – król pamięci pałacowej! 🐯': 'Rawrr! Hi! I\'m Leo – king of palace memory! 🐯',
  'Komnaty Twojego domu to najlepsza skarbnica wiedzy! 🏰': 'The rooms of your home are the greatest treasure vault of knowledge! 🏰',
  'Zawsze idź tą samą ścieżką – to złota reguła Loci! 🚶': 'Always follow the exact same route – that is the golden rule of Loci! 🚶',
  'Moje tygrysie paski symbolizują kolejne przystanki w pałacu! 🐾': 'My tiger stripes represent consecutive stops in the palace! 🐾',
  'Wyobraź sobie coś absurdalnego, a nigdy tego nie zapomnisz! 🍌': 'Imagine something absurd, and you will never forget it! 🍌',
  'Rawrr! Twój pałac pamięci rośnie z każdym dniem! 🏛️': 'Rawrr! Your memory palace expands every single day! 🏛️',
  'Tik-tak! Czas to sprzymierzeniec, a nie wróg! 🐢': 'Tick-tock! Time is an ally, not an enemy! 🐢',
  'Kotwica roku to fundament – reszta to prosta matematyka! ⏱️': 'The anchor day is the cornerstone – the rest is simple math! ⏱️',
  'Nawet najwolniejszy żółw wygra wyścig dzięki technice! 🏁': 'Even the slowest turtle wins the race through technique! 🏁',
  '4.04, 6.06, 8.08... te daty zawsze lądują na tym samym dniu! 🗓️': '4/4, 6/6, 8/8... these dates always land on the exact same weekday! 🗓️',
  'Mój zegar skorupowy nigdy się nie spóźnia! ⏰': 'My shell-clock is never late! ⏰',
  'Opanuj Doomsday, a zaimponujesz każdemu w towarzystwie! 🎩': 'Master Doomsday and you will impress everyone at every gathering! 🎩',
  'Hau! Trop podchwycony w ułamku sekundy! 🐶⚡': 'Woof! Clue caught in a split second! 🐶⚡',
  'Genialny węch pamięciowy! Masz to w głowie! 🦴✨': 'Brilliant memory scent! You have it locked in your head! 🦴✨',
  'Akrostych rozszyfrowany jak u prawdziwego mistrza! 🔤🏆': 'Acrostic decoded like a true champion! 🔤🏆',
  'Bez pudła! Piesek Łatek macha ogonem z zachwytu! 🐾⭐': 'Spot on! Patch the Dog wags his tail in delight! 🐾⭐',
  'Precyzja detektywa! Żadna litera Ci nie umknie! 🔍🎯': 'Detective precision! No letter escapes you! 🔍🎯',
  'Zaczynamy od nowa! Kalendarz w Twojej głowie! 🐢🗓️': 'Starting fresh! The calendar is in your head! 🐢🗓️',
  'Dzień obliczony w ułamku sekundy! 🐢⚡': 'Day calculated in a split second! 🐢⚡',
  'Prawdziwy władca czasu i kalendarza! 📅✨': 'A true master of time and calendar! 📅✨',
  'Algorytm Conwaya opanowany po mistrzowsku! 🧠⏱️': 'Conway\'s algorithm mastered to perfection! 🧠⏱️',
  'Bez pudła! Żółwik kłania się w uznaniu! 🎯🐢': 'Spot on! Clockwork Turtle bows in respect! 🎯🐢',
  'Zegarmistrzowska precyzja! Nic Cię nie zaskoczy! ⏰⭐': 'Watchmaker precision! Nothing surprises you! ⏰⭐',
  'Spokój i geniusz! Kalendarz w Twojej głowie lśni! 🪐🗓️': 'Calm and brilliance! The mental calendar shines bright! 🪐🗓️',
  'Zaczynamy od nowa! Pokaż mistrzowską pamięć! 🦝✨': 'Starting fresh! Show off your master memory! 🦝✨',
  'Abrakadabra! Czysta iluzja pamięci! 🦝✨': 'Abracadabra! Pure memory illusion! 🦝✨',
  'Karta w garści! As wyciągnięty z rękawa! ♠️🎩': 'Card in hand! Ace pulled right from the sleeve! ♠️🎩',
  'Magia PAO działa bezbłędnie! Postać i akcja w punkt! 🪄⭐': 'PAO magic works flawlessly! Character and action on point! 🪄⭐',
  'Oklaski na sali! Szop Magik kłania się z kapeluszem! 👏🃏': 'Applause in the room! Bandit the Magician bows with his hat! 👏🃏',
  'Talia kart nie ma przed Tobą tajemnic! 👑💎': 'The card deck holds no secrets from you! 👑💎',
  'Niezwykły pokaz zręczności umysłu! Płyniemy dalej! 🚀🦝': 'Spectacular display of mental agility! Sailing forward! 🚀🦝',
  'Zdobyłeś 🛡️ tarczę! Mruczek kręci piruet z radości!': 'You earned a 🛡️ shield! Whiskers spins in delight!',
  'Ojej! Ale 🛡️ tarcza Cię uratowała! Próbujemy jeszcze raz ten poziom.': 'Oops! But the 🛡️ shield saved you! Trying this level once more.',
  'Tak! Kotek mruczy z zachwytu! 😸✨': 'Yes! Whiskers purrs with joy! 😸✨',
  'Mrrr, bezbłędnie w punkt! 🐾': 'Purrr, flawlessly on point! 🐾',
  'Kocia precyzja! Pamięć jak u rysia! 🐈💨': 'Feline precision! Memory like a lynx! 🐈💨',
  'Pazurki w górę! Fenomenalnie! 😻⭐': 'Paws up! Phenomenal! 😻⭐',
  'Bez pudła! Cyfry wchodzą gładko! 🎯': 'Flawless! Digits slide right in! 🎯',
  'Miau! Kolejny poziom zdobyty! 🌟🚀': 'Meow! Another level conquered! 🌟🚀',
  'Czysty geniusz! Mruczek bije brawo! 👏😸': 'Pure genius! Whiskers applauds! 👏😸',
  'Zaczynamy od nowa! Połączmy wszystkie ogniwa! 🐿️🌰': 'Starting fresh! Let\'s connect all the links! 🐿️🌰',
  'Chrup, chrup! Łańcuch trzyma jak ze stali! 🐿️✨': 'Crunch, crunch! The chain holds like solid steel! 🐿️✨',
  'Efekt domina w akcji! Myśli przeskakują same! 💥🔗': 'Domino effect in action! Thoughts leap on their own! 💥🔗',
  'Kolejne ogniwo połączone mistrzowską historią! 📖⭐': 'Another link forged with a master story! 📖⭐',
  'Wyobraźnia na 200%! Basia skacze z gałęzi z radości! 🌰🎉': 'Imagination at 200%! Hazel leaps across branches in joy! 🌰🎉',
  'Ani jedno ogniwo nie pękło! Żelazna pamięć! 🛡️🐿️': 'Not a single link snapped! Iron memory! 🛡️🐿️',
  'Spiżarnia pełna skojarzeń! Budujemy dalej! 🏰🥜': 'Pantry full of associations! Keep building! 🏰🥜',
  'Zaczynamy od nowa! Spółgłoski czekają! 🦉📚': 'Starting fresh! Consonants are waiting! 🦉📚',
  'Huuu-hu! Fenomenalnie! Kod złamany! 🦉✨': 'Hoo-hoo! Phenomenal! The code is cracked! 🦉✨',
  'Spółgłoski opanowane do perfekcji! 📖🔐': 'Consonants mastered to perfection! 📖🔐',
  'Geniusz fonetyczny! Sówka bije skrzydłami! 💡🎉': 'Phonetic genius! Professor Owl flutters his wings! 💡🎉',
  'Świetny strzał! Cyfry zamieniają się w magię! 🎯🦉': 'Great shot! Numbers transform into magic! 🎯🦉',
  'Uhuhu! Błyskawiczny umysł profesora! ⚡🧠': 'Hoo-hoo! Rapid mind of a professor! ⚡🧠',
  'Arcydzieło pamięci! Twój kod działa bez pudła! 🌟📚': 'Masterpiece of memory! Your code works spot on! 🌟📚',
  'Prawdziwy erudyta! Lecimy po kolejny rekord! 🚀🦉': 'A true scholar! Flying towards the next record! 🚀🦉',
  'Oj, pomyłka! Prawidłowa odpowiedź: ': 'Oops, a mistake! Correct answer: ',
  'Plusk! Genialne połączenie na mapie myśli! 🐙💡': 'Splash! Brilliant connection on the mind map! 🐙💡',
  'Oto siła nielinearnych notatek! Masz to w głowie! 🎨✨': 'Here is the power of radiant notes! It is right in your head! 🎨✨',
  'Twoje macki myśli sięgają wszędzie! Pięknie! 🧠⚡': 'Your tentacles of thought reach everywhere! Beautiful! 🧠⚡',
  'Brakująca gałąź znaleziona w ułamku sekundy! 🗺️⭐': 'Missing branch found in a split second! 🗺️⭐',
  'Czysta kartografia umysłu! Inka bije brawo wszystkimi mackami! 🌊👏': 'Pure mental cartography! Inky applauds with all tentacles! 🌊👏',
  'Zaczynamy od nowa! Pokaż lisi spryt! 🦊✨': 'Starting fresh! Show off your clever fox wit! 🦊✨',
  'To nie ta osoba! Przypomnij sobie jej cechę 🔍 Pozostało szans: ': 'Not that person! Recall their unique feature 🔍 Chances left: ',
  'Lisi spryt w akcji! Twarz zapamiętana! 🦊✨': 'Fox cleverness in action! Face memorized! 🦊✨',
  'Kotwica zadziałała bezbłędnie! ⚓🎯': 'Anchor worked flawlessly! ⚓🎯',
  'Oko detektywa! Nikt się przed Tobą nie ukryje! 🔍⭐': 'Detective eye! No one can hide from you! 🔍⭐',
  'Brawo! Twoja pamięć do twarzy imponuje! 🌟': 'Bravo! Your face memory is impressive! 🌟',
  'Hau! Celne trafienie prosto w dziesiątkę! 🎯🦊': 'Spot on! Bullseye hit! 🎯🦊',
  'Genialnie! Kojarzenie na poziomie mistrza! 🧠💡': 'Genius! Association on a master level! 🧠💡',
  'Lisek skacze z radości! Jesteś nie do zatrzymania! 🐾🎉': 'Rusty leaps with joy! You are unstoppable! 🐾🎉',
  'Strażnik Komnat pyta! Sprawdźmy Twój bezpośredni dostęp do loci! 🎯': 'The Chamber Guardian asks! Let\'s check your direct access to loci! 🎯',
  'Nie przejmuj się! Każdy mistrz czasem zgubi ścieżkę. Spróbujmy jeszcze raz! 🐾': 'Don\'t worry! Every master loses the trail sometimes. Let\'s try again! 🐾',
  'Potężny skok! Komnaty pałacu stoją przed Tobą otworem! 🏰✨': 'A powerful leap! The palace rooms open wide before you! 🏰✨',
  'Rrr! Niezrównana pamięć! Leon skacze z dumy! 🐾🎉': 'Rrr! Unmatched memory! Leo leaps with pride! 🐾🎉',
  'Genialna wędrówka! Twój pałac pamięci lśni czystym złotem! 🏛️💎': 'Brilliant walk! Your memory palace shines like pure gold! 🏛️💎',
  'Mistrzowskie przejście! Loci w głowie poukładane jak w skarbcu! 🗝️⭐': 'Masterful route! Loci in mind organized like a treasure vault! 🗝️⭐',
  'Rawrr! Ani jednej pomyłki! Następny poziom czeka! 🚀🔥': 'Rawrr! Zero mistakes! The next level is waiting! 🚀🔥',
  'Zaczynamy od nowa! Poliglotyczna przygoda trwa! 🦜✨': 'Starting fresh! The polyglot adventure continues! 🦜✨',
  'Kraaa! Poliglota w pełnej krasie! 🦜✨': 'Squawk! Polyglot in full glory! 🦜✨',
  'Most fonetyczny połączył słowa idealnie! 🌉⭐': 'The phonetic bridge linked the words perfectly! 🌉⭐',
  'Mówisz jak rodowity mieszkaniec! 🗣️🎉': 'You speak like a native! 🗣️🎉',
  'Słowo wyryte w pamięci na zawsze! 📖💎': 'The word is etched in memory forever! 📖💎',
  'Bez pudła! Języki świata stoją przed Tobą otworem! 🌍🎯': 'Flawless! World languages are open to you! 🌍🎯',
  'Pola śpiewa z zachwytu! Co za słuch i pamięć! 🎶🦜': 'Polly sings in awe! What an ear and memory! 🎶🦜',
  'Genialne skojarzenie! Pędzimy do kolejnych słówek! 🚀💡': 'Brilliant association! Speeding ahead to more words! 🚀💡',
  '🎉 Świetna gra!': '🎉 Great game!',
  'Wynik:': 'Score:',
  'Twój rekord:': 'Your record:',
  'Wybierz kartę:': 'Choose a card:',
  'Jakie słowo koduje tę liczbę?': 'Which word encodes this number?',
  'Jakie cyfry kryją się w słowie:': 'Which digits hide inside the word:',
  'Jakie cyfry ma ten PIN?': 'Which digits does this PIN have?',
  'Jaki dzień tygodnia przypada na:': 'What weekday falls on:',
  'Rozpoznaj twarz z własnej pamięci!': 'Recognize the face from your own memory!',
  'Znajdź: ': 'Find: ',
  'Zawód: ': 'Occupation: ',
  'Wielkie okrągłe okulary w złotej oprawce': 'Big round glasses in golden frames',
  'Wysoki rudy kok i piegi na policzkach': 'Tall red bun and freckles on cheeks',
  'Bujna, gęsta czarna broda drwala': 'Lush, thick black lumberjack beard',
  'Lśniące fioletowe włosy i kolczyk w nosie': 'Shining purple hair and nose piercing',
  'Szeroki, hollywoodzki uśmiech i elegancka muszka': 'Broad Hollywood smile and elegant bow tie',
  'Dwa zawadiackie kucyki i zielona opaska na czole': 'Two playful pigtails and green headband',
  'Czarne wąsy a la Poirot i elegancki monokl': 'Black Poirot mustache and elegant monocle',
  'Uroczy pieprzyk nad ustami i srebrne kolczyki koła': 'Charming beauty mark above lips and silver hoop earrings',
  'Marek ma MARKER i maluje nim wielkie okulary!': 'Mark takes a neon MARKER and draws all over his giant glasses!',
  'Basia gra na BASIE, a jej rudy kok podskakuje w rytm!': 'Barbara plays the BASS guitar as her red bun bobs to the rhythm!',
  'KRZACZASTY Krzysztof gubi w brodzie Krzyżacki miecz!': 'BUSHY Christopher loses a Crusader sword in his thick beard!',
  'Kasia pije KAKAO z fioletowego kubka, a kolczyk brzęczy!': 'Katie drinks hot COCOA from a purple mug as her piercing rings!',
  'Tomasz to mistrz TOMU wierszy – kłania się w muszce i błyszczy zębami!': 'Thomas holds a heavy TOME of poems – bowing in his bow tie with sparkling teeth!',
  'Ola krzyczy OLE! na meczu i macha kucykami!': 'Ola shouts OLE! at the soccer match waving her pigtails!',
  'Piotr pisze gęsim PIÓREM przez swój złoty monokl!': 'Peter writes with a goose QUILL through his golden monocle!',
  'Ania je soczystego ANANASA, a sok skapuje na pieprzyk!': 'Anna eats a juicy PINEAPPLE as sweet juice drips near her beauty mark!',
  'Architekt': 'Architect',
  'Muzyczka': 'Musician',
  'Programista': 'Software Engineer',
  'Projektantka UX': 'UX Designer',
  'Prezenter TV': 'TV Host',
  'Trenerka fitness': 'Fitness Coach',
  'Detektyw': 'Detective',
  'Fotografka': 'Photographer',
  'Złota Brama': 'Golden Gate',
  'Marmurowy Hol': 'Marble Hall',
  'Sala Kominkowa': 'Fireplace Chamber',
  'Królewska Biblioteka': 'Royal Library',
  'Ogród Zimowy': 'Winter Garden',
  'Gabinet Luster': 'Hall of Mirrors',
  'Zamkowa Kuchnia': 'Castle Kitchen',
  'Skarbiec': 'Treasury',
  'Wieża Astronomiczna': 'Astronomy Tower',
  'Balkon Widokowy': 'Observatory Balcony',
  'Zbrojownia': 'Armory',
  'Pracownia Alchemika': 'Alchemist\'s Workshop',
  'Sala Balowa': 'Ballroom',
  'Kryształowa Grota': 'Crystal Grotto',
  'Spiżarnia Cukiernika': 'Confectioner\'s Pantry',
  'Dach Pałacu': 'Palace Roof',
  'Świecący Banan': 'Glowing Banana',
  'Kapelusz Magika': 'Magician\'s Top Hat',
  'Słoń na Wrotkach': 'Elephant on Roller Skates',
  'Płonąca Pizza': 'Flaming Pizza',
  'Gitara Elektryczna': 'Electric Guitar',
  'Rakieta Kosmiczna': 'Space Rocket',
  'Korona Królewska': 'Royal Crown',
  'Żaba w Okularach': 'Frog with Glasses',
  'Błękitny Diament': 'Blue Diamond',
  'Rapujące Awokado': 'Rapping Avocado',
  'Mleczny Gejzer': 'Milky Geyser',
  'Ogromna Bagietka': 'Giant Baguette',
  'Ser na Sprężynach': 'Springy Cheese',
  'Złote Jabłko': 'Golden Apple',
  'Jednorożec': 'Unicorn',
  'Kosmiczny Balon': 'Cosmic Balloon',
  'Lewitujące Sushi': 'Levitating Sushi',
  'Cytrynowy Rower': 'Lemon Bicycle',
  'Złoty Bębenek': 'Golden Snare Drum',
  'Różowy Flaming': 'Pink Flamingo',
  'Góra Lodowa z Wanilii': 'Vanilla Iceberg',
  'Kaczuszka Wikinga': 'Viking Rubber Duck',
  'Tańczący Kaktus': 'Dancing Cactus',
  'Tykanie z Kukułką': 'Ticking Cuckoo Clock',
  'Haczyki Pierwszych Liter': 'Hooks of First Letters',
  'Mistrz Języka i Nawigacji': 'Master of Language & Navigation',
  'Kod Nauki, Chemii i Muzyki': 'Code of Science, Chemistry & Music',
  'Laboratorium Tropiciela': 'Tracker\'s Laboratory',
  'Sekret Tropiciela: Tęcza i pierwsze litery': 'Tracker\'s Secret: Rainbow & First Letters',
  'Czym jest akrostych i jak działa pamięć literowa?': 'What is an acrostic and how does letter memory work?',
  'Kosmiczna Flota: 8 planet w 3 sekundy': 'Cosmic Fleet: 8 Planets in 3 Seconds',
  'Niezawodne zdanie o mamie smażącej placki': 'The reliable sentence of mom frying pancakes',
  'Skarb Króla Lecha: Rzymskie liczby L, C, D, M': 'King Lech\'s Treasure: Roman Numerals L, C, D, M',
  'Lech Chce Dobrze Mieszkać: 50, 100, 500, 1000': 'Lazy Cows Drink Milk: 50, 100, 500, 1000',
  'Kompas w Głowie: 4 strony świata': 'Mental Compass: 4 Cardinal Directions',
  'Na Ekranie Siedzi Wrona: N, E, S, W': 'Na Ekranie Siedzi Wrona: N, E, S, W',
  'Pogromca Deklinacji: 7 przypadków polskich': 'Conqueror of Declension: 7 Grammar Cases',
  'Mama Dała Córce Bułkę Nasmarowaną Masłem Wiejskim': 'No Good Dog Attacks Innocent Little Visitors',
  'Niezłomna Ortografia: Rymowanki na ratunek': 'Rock-Solid Spelling: Rhymes to the Rescue',
  'Rymy ortograficzne, które zostają w głowie na całe życie': 'Spelling rhymes that stick in your brain for life',
  'Cząstki Życia i Zdrowia: CHNOPS i Witaminy': 'Elements of Life & Health: CHNOPS & Vitamins',
  'Kluczowe pierwiastki biogenne i witaminy rozpuszczalne w tłuszczach': 'Key bio-elements and fat-soluble vitamins',
  'Muzyczne Struny: Dźwięki E H G D A E': 'Musical Strings: Notes E B G D A E',
  'Edek Hoduje Gołębie Dla Agaty Ewy': 'Eddie Ate Dynamite, Good Bye Eddie (Guitar Strings)',
  'Drabina Linneusza: Klasyfikacja Biologiczna': 'Linnaeus\' Ladder: Biological Classification',
  'Król Tybetański Gryzł Rybę Rodzinną Rano Gotowaną': 'Dear King Philip Came Over For Good Soup (Taxonomy)',
  'Fabryka Własnych Tropów: Generuj akrostychy': 'Custom Clue Factory: Crafting Acrostics',
  '3 złote zasady tworzenia własnych mnemotechnik do wszystkiego': '3 golden rules of building mnemonics for anything',
  'Sekret kalendarza i Kotwica Roku': 'Calendar Secret & Year Anchor',
  'Dni tygodnia 0-6 oraz fundament Doomsday': 'Days 0-6 & Doomsday Foundation',
  'Bliźniacze daty parzyste': 'Twin Even Dates',
  '4.04, 6.06, 8.08, 10.10, 12.12': '4/4, 6/6, 8/8, 10/10, 12/12',
  'Miesiące nieparzyste i Dzień Pi': 'Odd Months & Pi Day',
  'Praca 9 do 5 na stacji 7/11, Dzień Pi (14.03) i luty': '9 to 5 at 7-Eleven, Pi Day (3/14) and February',
  'Obliczanie daty w 3 krokach': 'Calculating Dates in 3 Steps',
  'Przykład: 15 sierpnia 2026': 'Example: August 15, 2026',
  'Podróżnik w czasie: Inne lata!': 'Time Traveler: Other Years!',
  'Jak znaleźć kotwicę dla 2027, 2028 czy 2035 roku?': 'How to find the anchor for 2027, 2028, or 2035?',
  'Egzamin Władcy Czasu': 'Exam of the Time Master',
  'Sprawdzian dat w przeszłości i przyszłości': 'Test of dates in the past and future',
  'Cztery żywioły talii': 'Four Suits of the Deck',
  'Pik, Kier, Karo i Trefl': 'Spades, Hearts, Diamonds & Clubs',
  'Karty dworskie': 'Court Cards',
  'Walet, Dama i Król': 'Jack, Queen & King',
  'Filozofia PAO': 'Philosophy of PAO',
  'Postać, Akcja i Obiekt': 'Person, Action & Object',
  'Łączenie 2 kart w 1 scenę': 'Combining 2 Cards into 1 Scene',
  'Fuzja Króla Artura i Kleopatry': 'Fusion of King Arthur & Cleopatra',
  'Praktyka: Rozdanie pokerowe': 'Practice: Poker Deal',
  'Zapamiętaj 3 karty na stole': 'Memorize 3 cards on the table',
  'Egzamin Iluzjonisty': 'Illusionist\'s Exam',
  'Ostateczny test Szopa Magika': 'Final test of Bandit the Magician',
  'Kształty Cyfr i Pierwsze Kroki': 'Digit Shapes & First Steps',
  'Grupowanie w Życiu (Chunking)': 'Chunking in Daily Life',
  'Granica Millera i Telefon': 'Miller\'s Limit & Phone Numbers',
  'Główny System Pamięciowy (Major)': 'Major Memory System',
  'Arcymistrzostwo': 'Grandmastery',
  'Jedna cyfra i jej kształt': 'One Digit and Its Shape',
  'Dwie cyfry – pierwsza historyjka': 'Two Digits – First Mini-Story',
  'Trzy cyfry – melodia obrazów': 'Three Digits – Melody of Images',
  'Cztery cyfry – Twój kod PIN': 'Four Digits – Your PIN Code',
  'Pięć cyfry – Kod pocztowy': 'Five Digits – Postal Code',
  'Sześć cyfr – Kod BLIK w 3 sekundy!': 'Six Digits – 6-Digit Code in 3 Seconds!',
  'Siedem cyfr – Liczba Millera': 'Seven Digits – Miller\'s Number',
  'Osiem cyfr – Znane daty': 'Eight Digits – Memorable Dates',
  'Dziewięć cyfr – Cały numer telefonu! 📱': 'Nine Digits – Full Phone Number! 📱',
  'Cyfry mają literki': 'Digits Turn into Letters',
  'Trzy obrazy = sześć cyfr': 'Three Pictures = Six Digits',
  'Łańcuch czterech obrazów': 'Chain of Four Pictures',
  'Dziesięć cyfr – Pięć par': 'Ten Digits – Five Pairs',
  'Numer z kierunkowym kraju (+48)': 'Country Code Phone Number (+1 / +48)',
  'Wielki Finał – 12 cyfr!': 'Grand Finale – 12 Digits!',
  'Efekt domina: Pierwsze 4 ogniwa': 'Domino Effect: First 4 Links',
  'Parasol ☂️ → Arbuz 🍉 → Rower 🚲 → Zegar ⏰': 'Umbrella ☂️ → Watermelon 🍉 → Bike 🚲 → Clock ⏰',
  'Zmysły i przesada: Ogniwa 4 do 8': 'Senses & Exaggeration: Links 4 to 8',
  'Zegar ⏰ → Balon 🎈 → Kaktus 🌵 → Gitara 🎸 → Lody 🍦': 'Clock ⏰ → Balloon 🎈 → Cactus 🌵 → Guitar 🎸 → Ice Cream 🍦',
  'Zagadka w jaskini: Ogniwa 8 do 12': 'Cave Mystery: Links 8 to 12',
  'Lody 🍦 → Klucz 🔑 → Latarka 🔦 → Skarb 💎 → Smok 🐉': 'Ice Cream 🍦 → Key 🔑 → Flashlight 🔦 → Treasure 💎 → Dragon 🐉',
  'Kosmiczny lot: Ogniwa 12 do 16': 'Cosmic Flight: Links 12 to 16',
  'Smok 🐉 → Rakieta 🚀 → Księżyc 🌙 → Ser 🧀 → Mysz 🐭': 'Dragon 🐉 → Rocket 🚀 → Moon 🌙 → Cheese 🧀 → Mouse 🐭',
  'Finałowa piątka i bieg w tył: 16 do 20': 'Final Five & Backward Run: 16 to 20',
  'Mysz 🐭 → Trampolina 🎪 → Tort 🎂 → Świeca 🕯️ → Kryształ 🔮': 'Mouse 🐭 → Trampoline 🎪 → Cake 🎂 → Candle 🕯️ → Crystal 🔮',
  'Egzamin Mistrza: Cały łańcuch 20 ogniw!': 'Master\'s Exam: Entire 20-Link Chain!',
  'Kompletna lista 20 skarbów pamięci': 'Complete list of 20 memory treasures',
  'Cyfry 0 i 1 (S/Z oraz T/D)': 'Digits 0 and 1 (S/Z and T/D)',
  'Pierwsze litery alfabetu pamięci': 'First letters of the memory alphabet',
  'Cyfry 2 i 3 (N oraz M)': 'Digits 2 and 3 (N and M)',
  'Nóżki liter': 'Letter legs',
  'Cyfry 4 i 5 (R oraz L)': 'Digits 4 and 5 (R and L)',
  'CzteRy oraz rzymskie L': 'FouR and Roman L',
  'Cyfry 6 i 7 (J/SZ/CZ oraz K/G)': 'Digits 6 and 7 (J/SH/CH and K/G)',
  'Szóstka i kanciaste K': 'Six and angular K',
  'Cyfry 8 i 9 (F/W oraz P/B)': 'Digits 8 and 9 (F/V and P/B)',
  'Pętelki i lustrzane odbicia': 'Loops and mirror reflections',
  'Samogłoski jako klej': 'Vowels as Glue',
  'Budowanie słów z samogłosek A, E, I, O, U, Y': 'Building words with vowels A, E, I, O, U, Y',
  '2-cyfrowe obrazy (kołki pamięciowe)': '2-Digit Images (Memory Pegs)',
  'TOR, RAK, FALA, BUT': 'CAT, ROCK, FOIL, BOAT',
  'Egzamin Profesora: Kod PIN': 'Professor\'s Exam: PIN Code',
  'Praktyczne zapamiętanie 4-cyfrowego kodu': 'Practical memorization of a 4-digit code',
  'Rewolucja Nielinearna': 'Non-Linear Revolution',
  'Narzędzia Kartografa': 'Cartographer\'s Tools',
  'Architektura Drzewa Wiedzy': 'Architecture of the Tree of Knowledge',
  'Mapy Myśli w Codziennym Życiu': 'Mind Maps in Everyday Life',
  'Czym jest mapa myśli? Mózg myśli promieniście!': 'What is a Mind Map? The brain thinks radiantly!',
  'Dlaczego tradycyjne notatki linijka po linijce usypiają umysł?': 'Why do traditional line-by-line notes put your mind to sleep?',
  '❌ Tradycyjna szara notatka': '❌ Traditional Dull Note',
  '✅ Promienista Mapa Myśli Inki': '✅ Inky\'s Radiant Mind Map',
  'Serce Mapy: Wyrazisty Obraz Centralny': 'Heart of the Map: Striking Central Image',
  'Kartka poziomo A4 i trójkolorowy symbol w centrum': 'Landscape A4 page & 3-color central symbol',
  '8 Macek Inki: Główne Filary Tematu': 'Inky\'s 8 Tentacles: Core Pillars of the Topic',
  'Jak podzielić potężny materiał na 3–7 kluczowych ramion?': 'How to divide complex material into 3–7 key branches?',
  'Złota Reguła: 1 Słowo-Klucz na gałęzi': 'Golden Rule: 1 Keyword Per Branch',
  'Dlaczego surowo zabraniamy pisać całych zdań?': 'Why do we strictly forbid writing whole sentences?',
  '❌ Błąd: Całe zdanie': '❌ Mistake: Full Sentence',
  '✅ Mistrzostwo: Słowa-Klucze': '✅ Mastery: Keywords',
  'Mnemorysunki i Piktogramy: Myśl obrazami!': 'Mnemo-Drawings & Pictograms: Think in pictures!',
  'Rysuj jak dziecko! Symbole przetwarzane 60 000x szybciej': 'Draw like a child! Symbols processed 60,000x faster',
  'Kod Kolorów: Wizualne szufladki pamięci': 'Color Code: Visual Memory Drawers',
  'Dlaczego każde ramię potrzebuje własnej unikalnej barwy?': 'Why does each branch need its own unique color?',
  'Płynna Hierarchia: Od grubych konarów do liści': 'Fluid Hierarchy: From thick boughs to leaves',
  'Hierarchia grubości linii i długości słów': 'Hierarchy of line thickness and word length',
  'Mistrzowska Czytelność: Pismo drukowane poziomo': 'Master Clarity: Horizontal Print Lettering',
  'Żadnego czytania do góry nogami i łączenie strzałkami': 'No upside-down reading & linking with arrows',
  '❌ Bazgroły i obracanie kartki': '❌ Scribbles & Turning the Page',
  '✅ Mistrzowski Standard Inki': '✅ Inky\'s Master Standard',
  'Praktyka Mistrza: Cały rozdział na 1 kartce A4': 'Master Practice: Entire Chapter on 1 Landscape Page',
  'Studium przypadku: Od 20 stron tekstu do 2 minut powtórki': 'Case Study: From 20 pages of text to 2-minute review',
  'Wystąpienie bez Kartki i Wielki Finał': 'Note-Free Public Speaking & Grand Finale',
  'Mów swobodnie przez 15 minut z uśmiechem, patrząc na ludzi': 'Speak freely for 15 minutes with a smile, looking at people',
  'Kotwica twarzy': 'Face Anchor',
  'Zauważ to, co unikalne': 'Notice what is unique',
  'Most fonetyczny': 'Phonetic Bridge',
  'Zamieniaj abstrakcyjne imiona w obrazy': 'Turn abstract names into concrete images',
  'Wybuchowe połączenie': 'Explosive Connection',
  'Połącz kotwicę twarzy z mostem fonetycznym': 'Connect face anchor with phonetic bridge',
  'Spotkanie w trójkę': 'Three-Way Meeting',
  'Zastosuj technikę dla 3 osób': 'Apply the technique for 3 people',
  'Rozszerzona galeria (5 osób)': 'Expanded Gallery (5 people)',
  'Dodajemy Kasię i Tomasza': 'Adding Katie and Thomas',
  'Egzamin mistrza przyjęć': 'Party Master Exam',
  '7 gości na bankiecie': '7 guests at the banquet',
  'Pierwsze dwa kroki': 'First Two Steps',
  'Moc Absurdu i Ruchu': 'Power of Absurdity and Motion',
  'Zawsze Ta Sama Ścieżka': 'Always the Exact Same Route',
  'Lista Zakupów bez Kartki': 'Grocery List without Paper',
  'Zaangażuj Wszystkie Zmysły': 'Engage All Senses',
  'Sztuka Przemawiania (7 punktów)': 'Art of Public Speaking (7 points)',
  'Wielka Trasa 8 Komnat': 'Grand Tour of 8 Rooms',
  'Egzamin Mistrzowski (10 Komnat)': 'Mastery Exam (10 Rooms)',
  'Metoda słów-kluczy': 'The Keyword Method',
  'Koniec z nudnym wkuwaniem słówek': 'No more boring vocabulary cramming',
  'Dźwiękowy bliźniak': 'Acoustic Twin',
  'Jak brzmi angielskie „mushroom”?': 'What does English "mushroom" sound like?',
  'Wybuchowa scenka': 'Explosive Scene',
  'Łączenie mostu ze znaczeniem': 'Linking bridge with meaning',
  'Angielski w mig': 'English in a Flash',
  'Candle, Feather, Pillow': 'Candle, Feather, Pillow',
  'Kolejne perełki: Shark, Beetle, Fork': 'More gems: Shark, Beetle, Fork',
  'Rekin Szarik, Chrząszcze The Beatles i Foka z widelcem': 'Shark, The Beatles beetles, and Seal with a fork',
  'Egzamin Poligloty': 'Polyglot\'s Exam',
  'Wielki sprawdzian angielskich mostów': 'Grand test of English sound bridges',
  'Cześć, tu sprytny Lisek! 🦊 Czy zdarzyło Ci się poznać kogoś w klasie lub na urodzinach i od razu zapomnieć jego imię? Pokażę Ci detektywistyczny trik z kotwicą – zapamiętasz każdego kolegę i koleżankę od pierwszego wejrzenia!': 'Hi, Rusty the clever Fox here! 🦊 Have you ever met someone at a party or school and immediately forgotten their name? I\'ll show you a detective anchor trick – you\'ll remember everyone at first glance!',
  'Krok drugi to most fonetyczny! Zamieniamy każde imię w zabawną rzecz, którą można dotknąć!': 'Step two is the phonetic bridge! We turn each name into a tangible, memorable object!',
  'A teraz najfajniejsza część: robimy wybuchowy film w głowie! Zobacz, jak to działa!': 'Now for the most fun part: creating an explosive mental movie! See how it works!',
  'Świetnie! Czas poznać 3 osoby naraz. Zbudujmy dla każdej z nich kotwicę i most!': 'Great! Time to meet 3 people at once. Let\'s build an anchor and bridge for each of them!',
  'Dołączają Kasia i Tomasz! Popatrz uważnie na ich wyjątkowe cechy!': 'Katie and Thomas join! Look closely at their unique features!',
  'Wielki finał u Liska! 7 osób na uroczystym bankiecie. Sprawdźmy Twoją bystrość!': 'Grand finale with Rusty! 7 guests at the gala banquet. Let us test your razor-sharp observation!',
  'Co jest najsilniejszą kotwicą Marka?': 'What is Mark\'s strongest anchor?',
  'Spójrz w oczy Marka – złote oprawki dominują jego twarz!': 'Look at Mark\'s eyes – golden frames dominate his face!',
  'Jaki most fonetyczny najlepiej pasuje do imienia Basia?': 'Which phonetic bridge best matches the name Barbara?',
  'Basia brzmi dokładnie jak BAS / Kontrabas!': 'Basia sounds like BASS / Double Bass!',
  'Basia ma rudy kok i gra na basie. Jakie połączenie najsilniej zadziała w pamięci?': 'Barbara has a red bun and plays bass. Which association works strongest in memory?',
  'Kto na bankiecie ma bujną czarną brodę drwala?': 'Who at the banquet has a lush, black lumberjack beard?',
  'Pomyśl o drwalu w lesie z wielką ciemną brodą!': 'Think of a lumberjack in the forest with a big dark beard!',
  'Jaka kotwica należy do Kasi?': 'Which anchor belongs to Katie?',
  'Spójrz na jej nietypowy kolor włosów i błyszczący nosek!': 'Look at her unique hair color and sparkling nose piercing!',
  'Jakie imię nosi elegancki pan z hollywoodzkim uśmiechem i muszką?': 'What is the name of the elegant gentleman with a Hollywood smile and bow tie?',
  'Pamiętasz wielki TOM poezji, który czyta ten elegancki pan?': 'Remember the thick TOME of poetry this gentleman reads?',
  'Jaki kolor tęczy kryje się pod słowem „Żabko” w zdaniu o tęczy?': 'Which rainbow color is hidden under the word "Yellow" in the rainbow sentence?',
  'Która planeta jest czwarta od Słońca, odpowiadając słowu „Mama”?': 'Which planet is fourth from the Sun, matching the word "Mother"?',
  'Jaką wartość ma rzymska litera C w zdaniu „Lech Chce Dobrze Mieszkać”?': 'What value does the Roman letter C represent in "I Value Xylophones Like Cows Do Milk"?',
  'Który kierunek znajduje się po prawej stronie mapy (odpowiadający słowu „Ekranie”)?': 'Which direction is on the right side of a map (matching East)?',
  'Jaki przypadek odpowiada słowu „Córce” (trzecie słowo w zdaniu)?': 'Which grammar case corresponds to the third word in the sentence?',
  'Jak brzmi złota zasada dotycząca pisowni wyrazów zakończonych na „-uje” (np. maluje, trenuje)?': 'What is the golden rule for spelling verb endings in grammar?',
  'Które 4 witaminy rozpuszczają się w tłuszczach, tworząc imię chłopca „ADEK”?': 'Which 4 vitamins are fat-soluble, forming the acronym "ADEK"?',
  'Jaki dźwięk ma najgrubsza, szósta struna basowa w gitarze (słowo „Ewy”)?': 'What note is the thickest, sixth bass string on a guitar (word "Eddie")?',
  'Która ranga biologiczna odpowiada słowu „Gryzł” (trzeci szczebel od góry)?': 'Which biological rank corresponds to the third level from the top (Class)?',
  'Co sprawia, że własny akrostych zostaje najsilniej utrwalony w ludzkiej pamięci?': 'What makes a personal acrostic stick strongest in human memory?',
  'Dlaczego tradycyjne notatki linijka po linijce usypiają mózg?': 'Why do traditional line-by-line notes put the brain to sleep?',
  'Co musi znajdować się w samym sercu każdej mistrzowskiej mapy myśli?': 'What must sit at the very heart of every masterful mind map?',
  'Ile głównych ramion (gałęzi I rzędu) najlepiej sprawdza się na mapie myśli?': 'How many main branches (primary limbs) work best on a mind map?',
  'Jaka jest złota zasada dotycząca tekstu na gałęziach mapy myśli?': 'What is the golden rule regarding text on mind map branches?',
  'Dlaczego piktogramy i rysunki są potężniejsze od samego tekstu?': 'Why are pictograms and drawings more powerful than plain text?',
  'Do czego służy kodowanie barwami na mapie myśli?': 'What is the purpose of color coding on a mind map?',
  'Jak zmienia się grubość linii gałęzi w miarę oddalania się od centrum?': 'How does branch line thickness change moving away from the center?',
  'W jaki sposób należy zapisywać słowa na gałęziach mapy myśli?': 'How should words be written along mind map branches?',
  'Jak przenieść cały 20-stronicowy rozdział podręcznika na mapę myśli?': 'How do you transfer an entire 20-page textbook chapter onto a mind map?',
  'Jak wykorzystać mapę myśli do publicznego wystąpienia bez kartki?': 'How do you use a mind map to deliver a public speech without notes?',
  'Po co nam ta umiejętność? Ile razy ktoś przedstawił Ci się w nowej klasie, na placu zabaw albo na uroczystości, a Ty po 5 sekundach miałeś pustkę w głowie? To przydarza się każdemu!': 'Why do we need this skill? How many times has someone introduced themselves to you, and 5 seconds later your mind was a blank slate? It happens to everyone!',
  'Sekret mistrzów pamięci: nasz mózg nie potrafi utrzymać samego dźwięku imienia. Musimy je „przyczepić” do twarzy jak kolorową naklejkę!': 'Memory champions\' secret: our brain cannot easily hold onto an isolated name sound. We must \'stick\' it to the face like a bright colorful sticker!',
  'KROK 1 – ZNAJDŹ KOTWICĘ DETEKTYWA:': 'STEP 1 – FIND THE DETECTIVE ANCHOR:',
  'Gdy na kogoś patrzysz, poszukaj jednej charakterystycznej rzeczy: wielkie okulary, bujna broda, zabawna fryzura czy wielki uśmiech.': 'When you look at someone, scan for one distinctive feature: oversized glasses, a bushy beard, an unusual haircut, or a broad smile.',
  'Spójrz na Marka poniżej: widzisz te wielkie okrągłe złote okulary? To nasza idealna kotwica!': 'Look at Mark below: see those giant round gold glasses? That is our perfect anchor!',
  'Imię samo w sobie jest ulotnym dźwiękiem. Trudno „zobaczyć” słowo Basia czy Marek.': 'A name by itself is an elusive sound. It is hard to "see" the abstract sound of a name.',
  'Dlatego budujemy MOST FONETYCZNY – szukamy przedmiotu, który brzmi prawie tak samo:': 'That is why we build a PHONETIC BRIDGE – looking for a tangible object that sounds almost identical:',
  '• Basia → wielki KONTRA-BAS 🎻': '• Barbara → a giant jazz DOUBLE BASS 🎻',
  '• Kasia → kubek pachnącego KAKAO ☕': '• Katie → a steaming mug of COCOA ☕',
  '• Marek → gruby jaskrawy MARKER 🖊️': '• Mark → a thick neon MARKER 🖊️',
  'Gdy usłyszysz imię, Twój umysł od razu widzi ten przedmiot przed oczami!': 'Whenever you hear the name, your mind immediately visualizes that object before your eyes!',
  'Mamy już kotwicę (okulary Marka) i most fonetyczny (MARKER).': 'We already have the anchor (Mark’s glasses) and the phonetic bridge (MARKER).',
  'Teraz najważniejszy krok: połączmy je w śmieszną, dynamiczną akcję!': 'Now comes the most critical step: let’s fuse them in funny, dynamic action!',
  'Nie wyobrażaj sobie po prostu markera leżącego obok Marka.': 'Do not simply imagine a marker resting quietly next to Mark.',
  'Zobacz, jak Marek wyciąga neonowy MARKER i z uśmiechem zamalowuje nim swoje własne OKULARY, aż nic przez nie nie widzi!': 'Picture Mark pulling out a neon yellow MARKER and gleefully coloring over his own GLASSES until he cannot see a thing!',
  'Im bardziej szalona i dynamiczna akcja, tym mocniej zostaje w pamięci!': 'The crazier, louder, and more dynamic the action, the deeper it engraves in memory!',
  'Krzysztof ma wielką, gęstą czarną brodę drwala. Wyobraź sobie, że ukrył w niej KRZYŻACKI miecz! ⚔️': 'Christopher has a huge, dense black lumberjack beard. Picture him hiding a Crusader SWORD right inside his beard! ⚔️',
  'Basia ma wysoki rudy kok i piegi. Wyobraź sobie, że jej kok podskakuje w rytm potężnego BASU! 🎻': 'Barbara has a tall red bun and freckles. Picture her bun bobbing to the booming rhythm of a jazz DOUBLE BASS! 🎻',
  'Zauważ: każda twarz ma swoją kotwicę, a każde imię ma swój dźwiękowy most.': 'Notice: every face has its unique anchor, and every name has its sound bridge.',
  'Kasia ma lśniące fioletowe włosy i kolczyk w nosie. Pije gorące KAKAO, a para z kubka barwi jej włosy na fioletowo! ☕': 'Katie has shining purple hair and a nose ring. She sips hot COCOA as purple steam dyes her hair violet! ☕',
  'Tomasz ma hollywoodzki uśmiech i muchę. Trzyma wielki TOM encyklopedii, który przygniata mu krawat! 📖': 'Thomas sports a Hollywood smile and bow tie. He holds a massive TOME of poetry crushing his stylish tie! 📖',
  'Trening czyni mistrza – twórz skojarzenia natychmiast przy powitaniu!': 'Practice makes perfect – forge associations the instant you say hello!',
  'Na bankiecie poznasz 7 wspaniałych osób: Marek, Basia, Krzysztof, Kasia, Tomasz, Ola i Piotr.': 'At the gala banquet you will meet 7 wonderful people: Mark, Barbara, Christopher, Katie, Thomas, Ola, and Peter.',
  'Ola krzyczy OLE! na stadionie, a Piotr pisze gęsim PIÓREM przez swój złoty monokl.': 'Ola shouts OLE! in the arena, while Peter writes with a feather QUILL through his golden monocle.',
  'Połącz wszystkie techniki i zostań niekwestionowanym mistrzem bankietów!': 'Combine all techniques and become the undisputed master of every social gathering!',
  'Miau! Cześć! Jestem kotek Mruczek 🐾 i nauczę Cię niezwykłej supermocy!': 'Meow! Hi! I\'m Whiskers the Cat 🐾 and I\'ll teach you an extraordinary superpower!',
  'Po co uczyć się cyfr? Wyobraź sobie, że w 3 sekundy zapamiętujesz kod BLIK, PIN do telefonu, kod do domofonu czy numer do rodziców w nagłej sytuacji – bez paniki i bez kartki!': 'Why learn numbers? Imagine memorizing instant codes, card PINs, door passcodes, and phone numbers in 3 seconds – zero panic, zero paper!',
  'Sekret jest prosty: nasz mózg gubi się w nudnych cyfrach, ale uwielbia bajki i kolorowe obrazy! 🎨': 'The secret is simple: our brain gets lost in boring numbers, but loves fairy tales and vibrant pictures! 🎨',
  'Zobacz: cyfra 2 wygląda dokładnie jak dumny łabędź płynący po stawie 🦢. Spójrz na ekran i zapamiętaj łabędzia!': 'Look: digit 2 looks exactly like a proud swan gliding across a pond 🦢. Look at the screen and remember the swan!',
  'Świetnie! A teraz połączmy dwie cyfry: 2 (Łabędź 🦢) i 8 (Bałwan ☃️).': 'Great! Now let’s combine two digits: 2 (Swan 🦢) and 8 (Snowman ☃️).',
  'Sekret nr 2: połącz je w absurdalną scenę w wyobraźni!': 'Secret #2: connect them into an absurd scene in your imagination!',
  'Wyobraź sobie, że dumny Łabędź owija ciepłym szalikiem zmarzniętego Bałwana! 🧣☃️': 'Imagine the proud Swan wrapping a warm scarf around a freezing Snowman! 🧣☃️',
  'Zobacz tę scenę jak żywy film w głowie. Gdy zobaczysz 28 – od razu widzisz Łabędzia i Bałwana!': 'See that scene like a vivid movie in your mind. Whenever you see 28 – you instantly see the Swan and Snowman!',
  'Mamy już 3 cyfry! 2 (Łabędź 🦢), 8 (Bałwan ☃️) i 4 (Żaglówka ⛵).': 'Now we have 3 digits! 2 (Swan 🦢), 8 (Snowman ☃️), and 4 (Sailboat ⛵).',
  'Zamiast wkuwać „dwa-osiem-cztery”, ułóż z nich jedną zwariowaną historyjkę:': 'Instead of cramming "two-eight-four", build one crazy story out of them:',
  'Łabędź lepi Bałwana, a potem razem wsiadają na Żaglówkę i płyną w rejs! ⛵🌊': 'The Swan builds a Snowman, then both hop onto a Sailboat and set sail! ⛵🌊',
  'Mózg kocha akcję, ruch i humor. Zamknij oczy i zobacz ten film!': 'The brain loves action, movement, and humor. Close your eyes and see this movie!',
  'Cztery cyfry to klasyczny kod PIN do karty bankowej albo telefonu! 💳': 'Four digits is the classic PIN code for bank cards and smartphones! 💳',
  'Połączmy dwie pary: 28 (Łabędź + Bałwan) oraz 14 (Świeca 🕯️ + Żaglówka ⛵).': 'Let’s combine two pairs: 28 (Swan + Snowman) and 14 (Candle 🕯️ + Sailboat ⛵).',
  'Łabędź i Bałwan płyną żaglówką, a na maszcie pali się wielka Świeca oświetlająca drogę!': 'Swan and Snowman sail the boat, while a giant Candle burns atop the mast lighting the way!',
  'Widzisz? 4 cyfry w jednym obrazie. Zapamiętasz ten PIN na całe lata!': 'See? 4 digits in one vivid picture. You’ll remember this PIN for years!',
  'Kod pocztowy ma 5 cyfr (np. 02-148). Podzielmy go na 2 i 3 cyfry!': 'A zip code has 5 digits. Let’s chunk it into a group of 2 and a group of 3!',
  'Grupowanie (Chunking) to sekret mistrzów pamięci – mózg o wiele łatwiej radzi sobie z mniejszymi paczkami.': 'Chunking is the secret of memory masters – the brain handles smaller bite-sized chunks with ease.',
  'Sześć cyfr to kod BLIK przy płatnościach internetowych! 🛒': 'Six digits is the instant checkout code for online payments! 🛒',
  'Zamiast patrzeć 5 razy w telefon, zapamiętaj dwie trójki cyfr jako dwie wesołe scenki.': 'Instead of glancing 5 times at your phone, memorize two 3-digit triplets as two lively mini-scenes.',
  'Siedem cyfr to słynna Granica Millera – psycholog George Miller udowodnił, że ludzka pamięć robocza mieści około 7 elementów.': 'Seven digits is Miller\'s famous limit – psychologist George Miller proved working memory holds about 7 items.',
  'Dzięki technice kształtów i grupowania bez problemu przekroczysz tę granicę!': 'With shapes and chunking, you will surpass this biological limit with ease!',
  'Osiem cyfr to pełna data urodzenia albo ważny dzień w historii (np. 14.07.1789).': 'Eight digits is a full birth date or historic anniversary.',
  'Dziewięć cyfr – pełny numer telefonu komórkowego! 📱': 'Nine digits – a full mobile phone number! 📱',
  'Podziel go na trzy trójki: np. 502 - 814 - 396. Trzy dynamiczne sceny i numer jest Twój!': 'Split it into three triplets: e.g. 502 - 814 - 396. Three dynamic scenes and the number is locked!',
  'Rawrr! Cześć! Jestem Tygrysek Leon 🐯 i zabiorę Cię do najpotężniejszej twierdzy Twojego umysłu – Pałacu Pamięci!': 'Rawrr! Hi! I\'m Leo the Tiger 🐯 and I\'ll guide you to the mightiest fortress of your mind – the Memory Palace!',
  'Metoda Loci (z łaciny: „miejsca”) ma ponad 2500 lat. Wymyślili ją starożytni Grecy, by pamiętać wielogodzinne mowy bez kartki!': 'The Method of Loci (Latin for "places") is over 2,500 years old. Ancient Greeks invented it to deliver multi-hour speeches without notes!',
  'Zasada jest prosta: spacerujesz po dobrze znanym miejscu (np. swoim pokoju) i kładziesz w nim niezwykłe przedmioty.': 'The rule is simple: walk through a well-known place (like your room) and place extraordinary objects in each spot.',
  'W komnacie 1 (Złota Brama) kładziemy gigantyczny Świecący Banan 🍌. W komnacie 2 (Marmurowy Hol) kładziemy Kapelusz Magika 🎩!': 'In Room 1 (Golden Gate) we drop a giant Glowing Banana 🍌. In Room 2 (Marble Hall) we place a Magician’s Top Hat 🎩!',
  'Sekret Pałacu nr 2: Im bardziej absurdalny, wyolbrzymiony i ruchomy jest przedmiot, tym łatwiej go przypomnieć!': 'Palace Secret #2: The more absurd, oversized, and dynamic the mental image, the more unforgettable it becomes!',
  'Nie wyobrażaj sobie małego słonika. Zobacz wielkiego Słonia na Wrotkach 🐘, który ściga się z Płonącą Pizzą 🍕!': 'Do not imagine a tiny elephant. Picture a massive Elephant on Roller Skates 🐘 racing against a Flaming Pizza 🍕!',
  'Najważniejsza zasada mistrzów: ZAWSZE idź tą samą ścieżką! Nigdy nie zawracaj i nie skacz chaotycznie między pokojami.': 'The golden rule of masters: ALWAYS follow the exact same route! Never backtrack or jump chaotically between rooms.',
  'Krok 1 → Krok 2 → Krok 3... Wtedy każdy kolejny punkt trasy sam przywoła zapamiętaną rzecz!': 'Step 1 → Step 2 → Step 3... Then every subsequent checkpoint naturally triggers the stored memory!',
  'Wyobraź sobie listę zakupów na wielkie przyjęcie: 5 rzeczy, zero kartki w dłoni.': 'Imagine a grocery list for a big party: 5 items, zero paper in hand.',
  'Gdy wejdziesz do supermarketu, po prostu przejdź w myślach przez swój Pałac – zobaczysz wszystkie produkty na swoich miejscach!': 'When you enter the grocery store, simply walk through your Palace in your mind – you will see every product right in place!',
  'Zaangażuj wszystkie zmysły: poczuj zapach cynamonu, usłysz brzęk strun Gitary Elektrycznej 🎸 i zobacz płomienie Rakiety Kosmicznej 🚀!': 'Engage all senses: smell the fresh aroma, hear the strum of the Electric Guitar 🎸, and see the fiery glow of the Rocket 🚀!',
  'Starożytny filozof Cyceron przygotowywał przemówienia umieszczając kolejne myśli w komnatach pałacu.': 'Ancient orator Cicero prepared speeches by placing consecutive talking points inside palace chambers.',
  'Dzięki temu nigdy nie zgubił wątku i mówił z pełną pewnością siebie przez wiele godzin!': 'That way, he never lost his train of thought and spoke with complete confidence for hours!',
  'Wielka Trasa 8 Komnat to poziom zawodów pamięciowych. Twój umysł ma nieograniczoną pojemność!': 'The Grand Tour of 8 Rooms reaches memory competition level. Your mind possesses limitless storage!',
  'Wielki Finał Pałacu: 10 komnat i 10 niezwykłych skarbów wyobraźni. Udowodnij swoje mistrzostwo!': 'Grand Palace Finale: 10 chambers and 10 extraordinary treasures of imagination. Prove your true mastery!',
  'Kraaa! Cześć! Tu Papużka Pola 🦜 Czy wiesz, dlaczego wkuwanie słówek z listy jest nudne i po 3 dniach nic nie pamiętasz?': 'Squawk! Hi! Polly the Parrot here 🦜 Do you know why cramming vocab lists is so dull, leaving you with zero recall after 3 days?',
  'Bo mózg nienawidzi suchych słówek! Ale uwielbia METODĘ SŁÓW-KLUCZY (Keyword Method).': 'Because the brain hates dry vocabulary! But it absolutely loves the KEYWORD METHOD.',
  'Gdy uczysz się obcego słowa, znajdź w swoim języku słowo, które brzmi bardzo podobnie:': 'When learning a foreign word, find an acoustic twin in your language that sounds very similar:',
  'Np. angielskie mushroom (pieczarka/grzyb) brzmi jak CHAMPION (mistrz)! 🥊': 'E.g. English mushroom sounds like CHAMPION! 🥊',
  'Teraz wyobraź sobie mistrza boksu w rękawicach, który zamiast worka treningowego okłada olbrzymią pieczarkę! 🥊🍄': 'Now picture a world boxing CHAMPION punching a giant mushroom in the training ring! 🥊🍄',
  'Mushroom → Champion → Pieczarka! Gotowe w 3 sekundy!': 'Mushroom → Champion → Mushroom! Done in 3 seconds!',
  'Zobacz kolejne perełki: candle (świeca) brzmi jak KANDELABR 🕯️, feather (pióro) jak FEDORA z piórkiem 🪶!': 'Look at more gems: candle sounds like chandelier/candelabra 🕯️, feather sounds like fedora with a plume 🪶!',
  'Pillow (poduszka) brzmi jak PILOT, który śpi na miękkiej poduszce w kokpicie samolotu! ✈️😴': 'Pillow sounds like a PILOT sleeping on a soft pillow in the airplane cockpit! ✈️😴',
  'Shark (rekin) to piesek SZARIK pływający z płetwą rekina 🦈, a fork (widelec) to FOKA jedząca widelcem rybę! 🦭🍴': 'Shark sounds like a pet dog swimming with a shark fin 🦈, and fork sounds like a seal eating fish with a fork! 🦭🍴',
  'Metoda słów-kluczy działa dla każdego języka: angielskiego, hiszpańskiego, niemieckiego i francuskiego!': 'The keyword method works wonders for every language: English, Spanish, German, French, and beyond!',
  'Po co nam ta technika? Nasz mózg gubi się w suchych, nudnych cyfrach, ale uwielbia słowa i kolorowe obrazy!': 'Why do we need this technique? Our brain gets lost in dry, boring numbers, but loves words and colorful images!',
  'System Major zamienia cyfry na dźwięki spółgłosek. Dzięki temu z dowolnego numeru ułożysz śmieszne słowo, które od razu zapamiętasz!': 'The Major System converts digits into consonant sounds. That way, any number becomes a memorable word you remember instantly!',
  'Poznajmy dwie pierwsze cyfry kodu:': 'Let us learn the first two digits of the code:',
  '• 0 = S oraz Z – słowo „Zero” zaczyna się na literę Z, a zero syczy cichutko jak wąż: sss!': '• 0 = S and Z – the word "Zero" starts with Z, and zero hisses quietly like a snake: sss!',
  '• 1 = T oraz D – spójrz na literę T oraz D: obie mają JEDNĄ prostą pionową kreskę, dokładnie jak cyfra 1!': '• 1 = T and D – look at T and D: both have ONE simple vertical downstroke, exactly like digit 1!',
  'To bardzo proste! Zobacz: słowo „KOT” ma T na końcu (1), a słowo „SOS” ma S (0).': 'It is that simple! Notice: word "CAT" has T at the end (1), while "SAUCE" has S (0).',
  'Pora na cyfry 2 i 3! Mają genialną, logiczną zasadę:': 'Time for digits 2 and 3! They follow a brilliant, logical visual rule:',
  '• 2 = N – spójrz na małą literę n: ma dokładnie 2 pionowe nóżki! 🦵🦵': '• 2 = N – look at letter n: it has exactly 2 vertical downstrokes! 🦵🦵',
  '• 3 = M – spójrz na małą literę m: ma dokładnie 3 pionowe nóżki! 🦵🦵🦵': '• 3 = M – look at letter m: it has exactly 3 vertical downstrokes! 🦵🦵🦵',
  'Obróć cyfrę 3 o 90 stopni w lewo, a zobaczysz literę M. Prawda, że łatwe?': 'Rotate digit 3 by 90 degrees counter-clockwise, and you see letter M. Pretty neat, right?',
  'Kolejna para to 4 i 5:': 'The next pair is 4 and 5:',
  '• 4 = R – posłuchaj dominującej spółgłoski w słowie „czteRy” (R!) lub angielskim „fouR”.': '• 4 = R – listen to the dominant consonant sound in "fouR" (R!) or "czteRy".',
  '• 5 = L – spójrz na rzymską liczbę L, która oznacza dokładnie 50! Dodatkowo dłoń z 5 palcami tworzy literę L między kciukiem a palcem wskazującym. 🖐️': '• 5 = L – Roman numeral L means 50! Plus a hand with 5 fingers forms an L shape between thumb and index finger. 🖐️',
  'Pora na cyfry 6 i 7:': 'Time for digits 6 and 7:',
  '• 6 = J, SZ, CZ, Ż, DŻ – to miękkie, szumiące dźwięki. Małe j to lustrzane odbicie cyfry 6!': '• 6 = J, SH, CH, SOFT G – soft hissing/ch sounds. Lowercase j looks like a flipped digit 6!',
  '• 7 = K oraz G – spójrz na wielką literę K: składa się z dwóch połączonych cyfr 7!': '• 7 = K and G – look at capital K: it is formed by two sevens joined together!',
  'Ostatnia para cyfr pojedynczych: 8 i 9:': 'The final pair of single digits: 8 and 9:',
  '• 8 = F oraz W/V – pisana litera f ma dwie pętelki, dokładnie jak ósemka 8!': '• 8 = F and V – cursive lowercase f has two loops, exactly like an 8!',
  '• 9 = P oraz B – litera P to lustrzane odbicie cyfry 9, a B to dziewiątka odwrócona do góry nogami!': '• 9 = P and B – letter P is a mirror reflection of digit 9, and B is an upside-down 9!',
  'Sekret Systemu Major: Samogłoski (A, E, I, O, U, Y) to darmowy klej!': 'The Major System secret: Vowels (A, E, I, O, U, Y) are free glue!',
  'Nie mają przypisanych żadnych cyfr. Wstawiasz je między spółgłoski, by ułożyć dowolne słowo:': 'They carry no numerical value. Insert them between consonants to forge any word:',
  '• 14 = T + R → wstawiamy O → TOR 🚂': '• 14 = T + R → insert A, I → TRAIN 🚂',
  '• 71 = K + T → wstawiamy O → KOT 🐱': '• 71 = K + T → insert A → CAT 🐱',
  '• 85 = F + L → wstawiamy A, A → FALA 🌊': '• 85 = F + L → insert O, I → FOIL / FILE 📁',
  'Gdy chcesz zapamiętać 4-cyfrowy PIN (np. 1471), dzielisz go na dwie pary: 14 i 71.': 'To remember a 4-digit PIN (e.g. 1471), split it into two pairs: 14 and 71.',
  '14 to TOR 🚂, a 71 to KOT 🐱. Wyobraź sobie wielkiego KOTA kierującego pociągiem na TORACH!': '14 is TRAIN 🚂, 71 is CAT 🐱. Picture a giant CAT driving a speeding TRAIN on the tracks!',
  'Talia kart dzieli się na 4 kolory (żywioły):': 'A card deck is split into 4 suits (elements):',
  '• Pik (♠️) – czarne liście, żywioł powietrza i nocy': '• Spades (♠️) – black leaves, air and night',
  '• Kier (♥️) – czerwone serca, żywioł ognia i miłości': '• Hearts (♥️) – red hearts, fire and love',
  '• Karo (♦️) – złote diamenty, żywioł ziemi i bogactwa': '• Diamonds (♦️) – golden diamonds, earth and wealth',
  '• Trefl (♣️) – zielone koniczynki, żywioł natury i wody': '• Clubs (♣️) – green clovers, nature and water',
  'Karty dworskie reprezentują wybitne postacie historyczne i legendarne:': 'Court cards represent prominent historic and legendary figures:',
  '• Król Pik (K♠️) – Król Artur z mieczem Excalibur 👑🗡️': '• King of Spades (K♠️) – King Arthur with Excalibur 👑🗡️',
  '• Dama Karo (Q♦️) – Kleopatra owijająca się w złote szaty 🐍': '• Queen of Diamonds (Q♦️) – Cleopatra draped in gold 🐍',
  '• Walet Trefl (J♣️) – Robin Hood strzelający z łuku 🏹': '• Jack of Clubs (J♣️) – Robin Hood shooting an arrow 🏹',
  'System PAO (Person - Action - Object) to szczytowe osiągnięcie mistrzów pamięci:': 'The PAO system (Person - Action - Object) is the peak achievement of memory champions:',
  'Każda karta posiada 3 atrybuty: unikalną POSTAĆ, AKCJĘ, którą ta postać wykonuje, oraz OBIEKT.': 'Each card possesses 3 attributes: a unique PERSON, an ACTION they perform, and an OBJECT.',
  'Gdy zapamiętujesz sekwencję, łączysz 3 karty w 1 filmową scenę:': 'When memorizing a deal, you fuse 3 cards into 1 cinematic scene:',
  'Karta 1 daje POSTAĆ, Karta 2 daje AKCJĘ, a Karta 3 daje OBIEKT!': 'Card 1 provides PERSON, Card 2 provides ACTION, Card 3 provides OBJECT!',
  'Dzięki temu 52 karty talii kompresują się w zaledwie kilkanaście wyrazistych scen!': 'Through PAO, a full 52-card deck compresses into just a dozen vivid movie scenes!',
  'Metoda łańcuchowa (efekt domina) polega na łączeniu kolejnych słów w pary za pomocą żywej akcji.': 'The link method (domino effect) connects consecutive items in pairs through dynamic action.',
  'Nie próbuj zapamiętać 20 rzeczy naraz! Pamiętaj tylko: A łączy się z B, B łączy się z C, C z D...': 'Do not try to remember 20 things at once! Just link: A with B, B with C, C with D...',
  'Zasada przesady: im większy, głośniejszy i bardziej absurdalny obraz, tym silniejszy ślad w pamięci!': 'Exaggeration rule: the larger, louder, and more absurd the image, the stronger the memory trace!',
  'Parasol ☂️ wbija się w gigantycznego Arbuza 🍉, tryska fontanna soku, która zalewa Rower 🚲, a dzwonek Roweru budzi wielki Zegar ⏰!': 'Umbrella ☂️ pierces a giant Watermelon 🍉, spraying a juice geyser over a Bike 🚲, whose bell rings waking a Clock ⏰!',
  'Zmysły utrwalają pamięć: poczuj zapach, usłysz dźwięk, zobacz jaskrawe barwy.': 'Senses lock in memory: smell the scent, hear the noise, visualize neon colors.',
  'Prawdziwy test siły łańcucha: potrafisz odtworzyć całą historię od tyłu, od 20. do 1. ogniwa!': 'True test of chain strength: you can recall the entire story backward, from link 20 back to link 1!',
  'Po co nam ta technika? Wyobraź sobie miny znajomych w szkole lub w pracy, gdy ktoś rzuci datę, a Ty po 2 sekundach w pamięci odpowiesz: „To będzie sobota!”. Poczujesz się jak chodzący ludzki kalkulator!': 'Why do we need this technique? Imagine the jaws dropping when someone mentions a date, and 2 seconds later you say: "That was a Saturday!". You will feel like a human calendar!',
  'Tydzień ma 7 dni i kręci się w kółko jak karuzela. Ponumerujmy dni tygodnia od 0 do 6:': 'The week has 7 days spinning like a carousel. Let us number days from 0 to 6:',
  '• 1 = Poniedziałek 🌙 | 2 = Wtorek 🔥 | 3 = Środa 💧 | 4 = Czwartek ⚡ | 5 = Piątek 🎉 | 6 = Sobota 🪐': '• 1 = Monday 🌙 | 2 = Tuesday 🔥 | 3 = Wednesday 💧 | 4 = Thursday ⚡ | 5 = Friday 🎉 | 6 = Saturday 🪐',
  '• 0 = Niedziela ☀️ (dzień relaksu i odpoczynku, okrągłe zero pracy!)': '• 0 = Sunday ☀️ (day of relaxation and rest, round zero work!)',
  'CZYM JEST KOTWICA ROKU?': 'WHAT IS THE YEAR ANCHOR?',
  'Każdy rok ma swój magiczny Dzień Doomsday (Kotwicę). W roku 2026 kotwicą jest SOBOTA (6)!': 'Every year has its magic Doomsday anchor day. In 2026, the anchor is SATURDAY (6)!',
  'Co to oznacza? Że seria łatwych do zapamiętania dat ląduje DOKŁADNIE na tym samym dniu tygodnia:': 'What does this mean? A series of memorable dates lands on the EXACT same weekday:',
  'Parzyste miesiące podwajają liczbę dnia: 4.04, 6.06, 8.08, 10.10, 12.12 – wszystkie to SOBOTY!': 'Even months match their number: 4/4, 6/6, 8/8, 10/10, 12/12 – all land on SATURDAY in 2026!',
  'Miesiące nieparzyste zapamiętasz rymowanką: „Pracuję od 9 do 5 w sklepie 7/11”:': 'Odd months are recalled via: "Working 9 to 5 (9/5 & 5/9) at 7-Eleven (7/11 & 11/7)":',
  '9 maja (9.05) i 5 września (5.09) oraz 11 lipca (11.07) i 7 listopada (7.11) – to też SOBOTY!': 'May 9 (5/9) & Sep 5 (9/5), plus July 11 (7/11) & Nov 7 (11/7) – all are SATURDAYS!',
  'Dla innych lat dodajemy przesunięcie: zwykły rok przesuwa kotwicę o +1 dzień, a przestępny o +2 dni!': 'For other years add offset: a standard year shifts the anchor by +1 day, a leap year by +2 days!',
  'Dlaczego mózg kocha pierwsze litery i wierszyki?': 'Why does the brain love first letters and rhymes?',
  'Akrostych to zdanie, w którym pierwsze litery każdego wyrazu tworzą ukryte hasło lub listę wiedzy.': 'An acrostic is a sentence where the first letter of each word encodes a secret keyword or list of knowledge.',
  'Np. tęcza: „Czemu Patrzysz Żabko Zielona Na Fiołki?” → Czerwony, Pomarańczowy, Żółty, Zielony, Niebieski, Fioletowy!': 'E.g. rainbow: "Richard Of York Gave Battle In Vain" → Red, Orange, Yellow, Green, Blue, Indigo, Violet!',
  'Planety: „Moja Wiecznie Zapracowana Mama...” → Merkury, Wenus, Ziemia, Mars, Jowisz, Saturn, Uran, Neptun!': 'Planets: "My Very Educated Mother Just Served Us Noodles" → Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune!',
  'Rzymskie liczby L, C, D, M: „Lech Chce Dobrze Mieszkać” → 50, 100, 500, 1000!': 'Roman numerals L, C, D, M: "I Value Xylophones Like Cows Do Milk" → 50, 100, 500, 1000!',
  'Nawigacja: „Na Ekranie Siedzi Wrona” → North, East, South, West (Północ, Wschód, Południe, Zachód)!': 'Navigation: "Never Eat Soggy Waffles" → North, East, South, West!',
  'Tradycyjne notatki linijka po linijce usypiają mózg – powodują zmęczenie wzroku i spadek koncentracji.': 'Traditional line-by-line notes put your brain to sleep – causing visual fatigue and concentration drop.',
  'Mózg myśli PROMIENIŚCIE: od środka na zewnątrz, we wszystkich kierunkach jednocześnie!': 'The brain thinks RADIANTLY: from the center outward, in all directions at once!',
  'W sercu mapy myśli zawsze umieszczaj wyrazisty, barwny symbol centralny na poziomej kartce A4.': 'At the heart of a mind map, always place a vibrant central symbol on a landscape page.',
  'Od centrum odchodzi 3–7 głównych konarów – każdy oznaczony własnym unikalnym kolorem.': 'From the center radiate 3–7 primary branches – each coded with its own unique color.',
  'Złota zasada kartografa umysłu: TYLKO 1 Słowo-Klucz na gałęzi. Żadnych nudnych zdań!': 'The mind cartographer’s golden rule: ONLY 1 Keyword per branch. Zero full sentences!',
  'Rysuj piktogramy i symbole! Obrazy są przetwarzane przez ludzki mózg 60 000 razy szybciej niż tekst.': 'Draw pictograms and symbols! Images are processed by the human brain 60,000 times faster than text.',
  'Hierarchia grubości: linie stają się coraz cieńsze w miarę oddalania się od pnia do liści.': 'Hierarchy of thickness: lines taper thinner moving outward from main trunk to leafy twigs.',
  'Pismo drukowane poziomo: mapa musi być natychmiast czytelna bez obracania kartki w dłoniach!': 'Horizontal print lettering: the map must be instantly legible without tilting the page!',
  'Żółty (Ż jak Żabko!)': 'Yellow (Y as in Yellow!)',
  'Zielony': 'Green',
  'Czerwony': 'Red',
  'Fioletowy': 'Purple',
  'Mars (czwarta planeta, czerwona jak sos!)': 'Mars (fourth planet, red as sauce!)',
  'Jowisz': 'Jupiter',
  'Merkury': 'Mercury',
  'Wenus': 'Venus',
  '100 (Chce = C = 100)': '100 (C = 100)',
  'East / Wschód (w prawo ➡️)': 'East (to the right ➡️)',
  'West / Zachód': 'West',
  'North / Północ': 'North',
  'South / Południe': 'South',
  'Celownik (komu? czemu? Córce!)': 'Dative (to whom? for whom?)',
  'Biernik': 'Accusative',
  'Dopełniacz': 'Genitive',
  'Miejscownik': 'Locative',
  'Kto kreskuje -uje, ten dostaje dwóje! (zawsze piszemy U)': 'Never use Ó for -uje, always write with U!',
  'Wyrazy na -uje zawsze piszemy przez Ó': 'Words ending in -uje are always written with Ó',
  'Zależy od nastroju autora tekstu': 'Depends on the writer\'s mood',
  'Można pisać na przemian U oraz Ó': 'Can alternate between U and Ó',
  'A, D, E, K (tłuszczowy ADEK!)': 'A, D, E, K (fat-soluble ADEK!)',
  'B, C, D, E': 'B, C, D, E',
  'C, H, N, O': 'C, H, N, O',
  'P, S, K, A': 'P, S, K, A',
  'Dźwięk E (Ewy)': 'Note E',
  'Dźwięk A (Agaty)': 'Note A',
  'Dźwięk D (Dla)': 'Note D',
  'Dźwięk G (Gołębie)': 'Note G',
  'Gromada (trzecia ranga po Domena i Królestwo!)': 'Class (third rank after Domain and Kingdom!)',
  'Gatunek': 'Species',
  'Rodzina': 'Family',
  'Rząd': 'Order',
  'Musi być zabawny, wyrazisty i budzić emocje!': 'Must be funny, vivid, and evoke strong emotions!',
  'Musi być jak najdłuższy i jak najbardziej skomplikowany': 'Must be as long and complicated as possible',
  'Musi używać wyłącznie łacińskich słów ze słownika': 'Must use only Latin words from a dictionary',
  'Powinien być zapisany małym drukiem w notesie': 'Should be written in small print in a notebook',
  'Niedziela (dzień 0)': 'Sunday (day 0)',
  'Sobota (dzień 6)': 'Saturday (day 6)',
  'Poniedziałek (dzień 1)': 'Monday (day 1)',
  'Piątek (dzień 5)': 'Friday (day 5)',
  '6 czerwca (6.06)': 'June 6 (6/6)',
  '1 maja (1.05)': 'May 1 (5/1)',
  '7 lipca (7.07)': 'July 7 (7/7)',
  '10 listopada (10.11)': 'November 10 (11/10)',
  'Piątek (kotwica 9.05 to sobota, więc 8 maja to sobota minus 1)': 'Friday (anchor 5/9 is Saturday, so May 8 is Saturday minus 1)',
  'Sobota': 'Saturday',
  'Czwartek': 'Thursday',
  'Niedziela': 'Sunday',
  'Sobota (15 sierpnia to dokładnie kotwica Doomsday!)': 'Saturday (August 15 is an exact Doomsday anchor!)',
  'Niedziela (Dzień Słońca)': 'Sunday (Sun Day)',
  'Piątek (początek weekendu)': 'Friday (weekend start)',
  'Poniedziałek (początek tygodnia)': 'Monday (week start)',
  'Niedziela (sobota + 1 dzień przeskoku)': 'Sunday (Saturday + 1 jump day)',
  'Poniedziałek (sobota + 2 dni)': 'Monday (Saturday + 2 days)',
  'Piątek (sobota - 1 dzień)': 'Friday (Saturday - 1 day)',
  'Sobota (kotwica pozostaje bez zmian)': 'Saturday (anchor remains unchanged)',
  'Poniedziałek (rok przestępny = +2 dni od soboty!)': 'Monday (leap year = +2 days from Saturday!)',
  'Wtorek (+3 dni)': 'Tuesday (+3 days)',
  'Niedziela (+1 dzień)': 'Sunday (+1 day)',
  'Kier (♥️ Czerwone Serce)': 'Hearts (♥️ Red Heart)',
  'Pik (♠️ Czarny Liść)': 'Spades (♠️ Black Leaf)',
  'Karo (♦️ Złoty Diament)': 'Diamonds (♦️ Golden Diamond)',
  'Trefl (♣️ Koniczynka)': 'Clubs (♣️ Clover)',
  'Dama Kier (Q♥️)': 'Queen of Hearts (Q♥️)',
  'Król Pik (K♠️)': 'King of Spades (K♠️)',
  'Walet Trefl (J♣️)': 'Jack of Clubs (J♣️)',
  'As Karo (A♦️)': 'Ace of Diamonds (A♦️)',
  'Postać (Kto?), Akcja (Co robi?), Obiekt (Czym/Z czym?)': 'Person (Who?), Action (Does what?), Object (With what?)',
  'Punktacja, Asy, Odrzucenie': 'Points, Aces, Outs',
  'Pik, Akcja, Ogień': 'Spade, Action, Fire',
  'Prostota, Architektura, Ogród': 'Purity, Architecture, Order',
  'Król Artur (Postać z K♠️) zamienia się w mumię i owija bandażami (Akcja z Q♦️)!': 'King Arthur (Person of K♠️) turns into a mummy wrapped in bandages (Action of Q♦️)!',
  'Król Artur kładzie kartę na stole i wychodzi': 'King Arthur places a card on the table and walks away',
  'Dwie karty leżą obok siebie w teczce': 'Two cards lie side by side in a folder',
  'Kleopatra czyta książkę o rycerzach': 'Cleopatra reads a book about knights',
  'Postać z pierwszej karty robi Akcję z drugiej karty z Obiektem z trzeciej karty!': 'Person of 1st card performs Action of 2nd card with Object of 3rd card!',
  'Wszystkie trzy karty trzeba powtórzyć 20 razy na głos': 'All three cards must be repeated 20 times out loud',
  'Zapisujemy symbole w telefonie': 'Write the symbols on a phone',
  'Liczymy sumę punktów na kartach': 'Sum the points on the cards',
  '3 karty zlewają się w jedną dynamiczną, absurdalną scenę filmową': '3 cards fuse into one dynamic, absurd movie scene',
  'Karty układa się według kolorów tęczy': 'Cards are sorted by rainbow colors',
  'Zapamiętuje się tylko cyfry kart, ignorując kolory': 'Memorize only card numbers, ignoring suits',
  'Szop Magik chowa karty do kieszeni': 'Bandit the Magician pockets the cards',
  'Parasol przebija olbrzymiego arbuza, tryska czerwony sok! 🍉💥': 'An umbrella pierces a giant watermelon, spraying red juice! 🍉💥',
  'Parasol leży obok arbuza na stole': 'Umbrella lies next to watermelon on a table',
  'Kupujemy arbuz w sklepie parasolowym': 'Buy a watermelon in an umbrella shop',
  'Arbuz ma kolor zielony jak parasol': 'Watermelon is green like an umbrella',
  'Zegar wielkości wieży uderza w wielki balon z helem, który pęka z hukiem! 🎈💥': 'A tower-sized clock smashes into a giant helium balloon, popping with a roar! 🎈💥',
  'Zegar pokazuje godzinę piątą obok balonu': 'Clock shows 5 o\'clock next to a balloon',
  'Kupujemy balon w kształcie zegarka': 'Buy a balloon shaped like a watch',
  'Balon leci powoli nad zegarem ratuszowym': 'Balloon flies slowly over a city clock',
  'Lody o smaku cytrynowym wpadają na wielki złoty klucz i go zamrażają! 🔑❄️': 'Lemon ice cream splashes onto a giant golden key and freezes it solid! 🔑❄️',
  'Klucz leży w lodówce obok lodów': 'Key lies in a freezer next to ice cream',
  'Klucznik kupuje lody na deser': 'Locksmith buys ice cream for dessert',
  'Lody waniliowe mają kształt małego kluczyka': 'Vanilla ice cream is shaped like a tiny key',
  'Smok zieje ogniem pod rakietę kosmiczną i odpala jej silniki! 🚀🔥': 'Dragon breathes fire under a space rocket, igniting its thrusters! 🚀🔥',
  'Smok ogląda start rakiety w telewizji': 'Dragon watches rocket launch on TV',
  'Rakieta przelatuje nad śpiącym smokiem': 'Rocket flies over a sleeping dragon',
  'W kosmosie lata plastikowy model smoka': 'Plastic toy dragon flies in outer space',
  'Ogromna mysz skacze na trampolinie tak wysoko, że przebija dach namiotu! 🎪💥': 'A giant mouse bounces on a trampoline so high it tears through the circus roof! 🎪💥',
  'Myszka biega pod trampoliną w ogrodzie': 'Little mouse scurries under a backyard trampoline',
  'Cyrkowiec trzyma małą białą myszkę w dłoni': 'Circus artist holds a small white mouse in hand',
  'Trampolina ma namalowany obrazek myszy': 'Trampoline has a painted picture of a mouse',
  'Rakieta kosmiczna (napędzana ogniem Smoka, lecąca na Księżyc z sera!) 🚀': 'Space rocket (fueled by Dragon\'s fire, flying to the Moon of cheese!) 🚀',
  'Złoty klucz': 'Golden key',
  'Czekoladowy tort': 'Chocolate cake',
  'Biały parasol': 'White umbrella',
  '0 = S/Z, 1 = T/D (Zero syczy jak wąż SSS, a T i D mają jedną pionową kreskę!)': '0 = S/Z, 1 = T/D (Zero hisses like SSS, T and D have one vertical stroke!)',
  '0 = A, 1 = B': '0 = A, 1 = B',
  '0 = K, 1 = L': '0 = K, 1 = L',
  '0 = P, 1 = R': '0 = P, 1 = R',
  'N ma 2 nóżki (2), a M ma 3 nóżki (3)!': 'N has 2 legs (2), and M has 3 legs (3)!',
  'M ma dwie kreski, a N ma cztery': 'M has two strokes, N has four',
  'To losowy wybór bez żadnej logiki': 'It is a random choice without logic',
  'Litery N i M przypominają cyfry rzymskie': 'Letters N and M look like Roman numerals',
  'R to dominująca spółgłoska słowa czteRy (4), a L to rzymskie 50 (5)!': 'R is dominant in fouR (4), and L is Roman 50 (5)!',
  'R ma 5 pętelek, a L ma 4 kreski': 'R has 5 loops, L has 4 strokes',
  'Litera R przypomina ucho, a L przypomina nogę': 'Letter R looks like an ear, L like a leg',
  'Słowo \'Las\' ma 4 litery': 'Word \'Forest\' has 4 letters',
  'Szóstka to miękkie J/SZ/CZ, a K wygląda jak dwa połączone znaki 7!': 'Six is soft J/SH/CH, and K looks like two sevens joined together!',
  'K to zawsze zero, a J to dziewiątka': 'K is always zero, J is nine',
  'Siódemka syczy jak wąż': 'Seven hisses like a snake',
  'Szóstka jest okrągła jak litera O': 'Six is round like letter O',
  'F pisane ma dwie pętelki jak 8, a P to lustrzane odbicie 9!': 'Cursive F has two loops like 8, and P is mirror image of 9!',
  'P ma 8 kresek, a B to odwrócone 3': 'P has 8 strokes, B is inverted 3',
  'Cyfra 8 wygląda jak okulary, a 9 jak balonik': 'Digit 8 looks like glasses, 9 like a balloon',
  'Ósemka nie ma żadnych liter': 'Eight has no letters',
  'Samogłoski (A, E, I, O, U, Y) – nie mają przypisanych cyfr, służą do tworzenia słów!': 'Vowels (A, E, I, O, U, Y) – have no digits, used as glue to make words!',
  'Spółgłoski twarde': 'Hard consonants',
  'Cyfry rzymskie': 'Roman numerals',
  'Znaki interpunkcyjne': 'Punctuation marks',
  'TOR (T=1, R=4 -> samogłoska O jest darmowym klejem!)': 'CAT (C=7, T=1 -> vowel A is free glue!)',
  'KOT': 'COAT-CAT',
  'DOM': 'HOUSE',
  'RYBA': 'FISH',
  'Wyobrażamy sobie fuzję dwóch żywych obrazów: np. KOT zjada BALON!': 'We visualize the fusion of two vivid objects: e.g. CAT eats BALLOON!',
  'Zapisujemy cyfry na kartce papieru': 'Write the digits down on paper',
  'Wpisujemy losowe cyfry do bankomatu': 'Type random numbers at the ATM',
  'Powtarzamy ciąg 4 cyfr sto razy w myślach': 'Repeat 4 digits a hundred times in thought',
  'Mózg myśli obrazami i skojarzeniami promienistymi, a nie monotonnym szarym tekstem!': 'The brain thinks in pictures and radiant associations, not monotone gray text!',
  'Ponieważ tusz w długopisie jest zbyt ciemny': 'Because pen ink is too dark',
  'Ponieważ kartki papieru są zbyt małe': 'Because sheets of paper are too small',
  'Ponieważ litery alfabetu są przestarzałe': 'Because letters of the alphabet are outdated',
  'Wyrazisty, wielobarwny piktogram/symbol na poziomej kartce A4!': 'A striking, multi-color pictogram/symbol on a landscape A4 page!',
  'Długie, 5-zdaniowe wprowadzenie pisane małym drukiem': 'A long, 5-sentence intro written in small print',
  'Czarna kropka bez żadnego rysunku': 'A black dot without any drawing',
  'Tabela z kolumnami i wierszami': 'A table with columns and rows',
  'Od 3 do 7 głównych macek (optymalna pojemność pamięci roboczej)': 'From 3 to 7 main branches (optimal working memory span)',
  'Dokładnie 50 drobnych kresek': 'Exactly 50 tiny strokes',
  'Tylko 1 pojedyncza linia': 'Only 1 single line',
  'Nieskończenie wiele linii bez żadnego podziału': 'Infinite lines with zero structure',
  'Ścisła reguła: TYLKO 1 Słowo-Klucz na danej gałęzi (żadnych całych zdań!)': 'Strict rule: ONLY 1 Keyword per branch (no full sentences!)',
  'Należy przepisywać całe akapity z podręcznika': 'You must copy entire paragraphs from textbooks',
  'Nie wolno używać żadnych słów, wyłącznie cyfry': 'No words allowed, only numbers',
  'Słowa muszą być pisane wspak od prawej do lewej': 'Words must be written backwards from right to left',
  'Mózg przetwarza obrazy 60 000 razy szybciej niż suchy tekst!': 'The brain processes images 60,000 times faster than text!',
  'Piktogramy zajmują więcej miejsca na kartce': 'Pictograms take up more space on the page',
  'Rysunki sprawiają, że kartka jest cięższa': 'Drawings make the sheet heavier',
  'Nauczyciele wolą rysunki od tekstu': 'Teachers prefer drawings over text',
  'Kolory tworzą unikalne wizualne szufladki w mózgu i ułatwiają natychmiastową segregację wiedzy!': 'Colors create unique visual drawers in the brain and enable instant knowledge grouping!',
  'Kolory służą wyłącznie do ozdoby, żeby mapa ładnie wyglądała na Instagramie': 'Colors are purely decorative for aesthetic appeal',
  'Używanie kolorów jest zabronione przez Tony\'ego Buzana': 'Using colors is forbidden by Tony Buzan',
  'Wszystkie gałęzie powinny być szare lub czarne': 'All branches should be gray or black',
  'Gałęzie stają się coraz cieńsze w miarę oddalania się od centrum (jak konary i gałązki drzewa!)': 'Branches taper thinner away from the center (like tree boughs and twigs!)',
  'Wszystkie linie muszą mieć dokładnie 5 milimetrów grubości': 'All lines must be exactly 5mm thick',
  'Linie na zewnątrz są najgrubsze, a w centrum najcieńsze': 'Outer lines are thickest, center is thinnest',
  'Grubość linii jest całkowicie losowa': 'Line thickness is completely random',
  'Drukowanymi literami, zawsze wzdłuż linii i idealnie poziomo (żadnego czytania do góry nogami!)': 'In print letters, along lines, and horizontal (no upside-down reading!)',
  'Pismem odręcznym pod kątem 90 stopni pionowo': 'In cursive handwriting tilted 90 degrees vertically',
  'Tekst piszemy do góry nogami, żeby trenować elastyczność szyi': 'Write text upside down to train neck flexibility',
  'Każdą literę piszemy innym kolorem tęczy': 'Write each letter in a different rainbow color',
  'Wybieramy 4-6 głównych tematów na macki i uzupełniamy je słowami-kluczami oraz piktogramami': 'Pick 4-6 main themes for branches, filling them with keywords and pictograms',
  'Przepisujemy słowo w słowo 20 stron drobnym drukiem na jedną kartkę': 'Copy 20 pages word for word in tiny print onto one page',
  'Rysujemy 200 takich samych kółek i numerujemy je od 1 do 200': 'Draw 200 identical circles and number them 1 to 200',
  'Kserujemy spis treści i wklejamy na środku': 'Photocopy the table of contents and paste in the center',
  'Rzucasz okiem na kolorowe gałęzie jak na mapę metra i swobodnie opowiadasz własnymi słowami!': 'Glance at colorful branches like a subway map and speak freely in your own words!',
  'Czytasz mapę słowo w słowo z nosami w kartce': 'Read the map word for word with your nose on the paper',
  'Uczysz się całej mapy na pamięć przez 100 godzin bez snu': 'Memorize the map for 100 hours without sleep',
  'Chowasz mapę do kieszeni i nic nie mówisz': 'Hide the map in your pocket and stay silent',
  'Ogromne okrągłe okulary w złotej oprawce': 'Huge round glasses in golden frames',
  'Zielony krawat w kropki': 'Green polka-dot tie',
  'Zegarek ze stoperem': 'Watch with stopwatch',
  'Czapka z daszkiem': 'Baseball cap',
  'Wielki kontrabas grający jazz': 'A giant double bass playing jazz',
  'Słoik z dżemem': 'A jar of strawberry jam',
  'Biały żaglowiec na morzu': 'A white sailboat on the sea',
  'Złota moneta': 'A shiny gold coin',
  'Jej rudy kok podskakuje i uderza w wielki kontrabas wydając potężne basowe dźwięki! 🎶': 'Her red bun bobs and bangs against a giant double bass with booming jazz notes! 🎶',
  'Basia stoi spokojnie na przystanku autobusowym': 'Barbara stands quietly at a bus stop',
  'Basia czyta gazetę w bibliotece': 'Barbara reads a newspaper in a library',
  'Kontrabas leży w futerale w szafie': 'The double bass rests quietly inside a closet',
  'Krzysztof (czarna broda)': 'Christopher (black beard)',
  'Marek (złote okulary)': 'Mark (golden glasses)',
  'Basia (rudy kok)': 'Barbara (red bun)',
  'Tomasz (elegancka muszka)': 'Thomas (sleek bow tie)',
  'Biały kapelusz z piórkiem': 'White hat with a feather',
  'Złoty łańcuszek na szyi': 'Gold chain around the neck',
  'Czerwone rękawiczki': 'Red winter gloves',
  'Tomasz (muszka i uśmiech)': 'Thomas (bow tie and smile)',
  'Marek (okulary)': 'Mark (glasses)',
  'Krzysztof (broda)': 'Christopher (beard)',
  'Piotr (monokl)': 'Peter (monocle)',
  'Mushroom brzmi jak Champion (mistrz), który zjada pieczarkę przed walką! 🥊🍄': 'Mushroom sounds like Champion, who eats a mushroom before the bout! 🥊🍄',
  'Mushroom brzmi jak polskie słowo \'morze\'': 'Mushroom sounds like the ocean',
  'Trzeba powtórzyć \'pieczarka\' sto razy': 'You must repeat \'mushroom\' a hundred times',
  'Zapisujemy słowo w zeszycie na marginesie': 'Write the word in the notebook margin',
  'Szary kamień leżący na ścieżce': 'A dull gray stone on a gravel path',
  'Błyszczący ekran telefonu': 'A glowing smartphone display',
  'Ptasie piórko unoszące się na wietrze': 'A bird feather floating in the wind',
  'Świeca (Candle brzmi jak KAN-delabr ze świecami!) 🕯️': 'Candle (sounds like a giant chandelier with candles!) 🕯️',
  'Poduszka': 'Pillow',
  'Książka': 'Book',
  'Widelec': 'Fork',
  'Rekin Szarik, Chrząszcze The Beatles i Foka z widelcem!': 'Shark, The Beatles beetles, and a Seal with a fork!',
  'Trzy nudne definicje ze słownika': 'Three dry dictionary definitions',
  'Trzy cyfry zapisane ołówkiem': 'Three digits written with a pencil',
  'Wszystkie słowa na literę B': 'All words starting with letter B',
  'Klucz do drzwi': 'Door key',
  'Latarka': 'Flashlight',
  'Skarb': 'Treasure',
  'Smok': 'Dragon',
  'Zamiast wkuwać nudne listy na pamięć, zamieniasz je w jedno wesołe zdanie. Niezbędna w szkole (planety, kolory tęczy, przypadki) i w pracy (zapamiętywanie skrótów, procedur i wierszy)!': 'Instead of cramming boring lists, you turn them into a single catchy sentence. Invaluable in school (planets, rainbow colors, grammar cases) and at work (acronyms, procedures, and presentations)!',
  'Błyskawiczne planowanie spotkań, terminów i wyjazdów bez sięgania po smartfon. Zrobisz też genialny popis na imprezie, podając dzień tygodnia urodzin każdego ze znajomych!': 'Lightning-fast scheduling and trip planning without reaching for a smartphone. You will also dazzle friends at parties by stating the weekday of anyone’s birthday on the spot!',
  'Elitarny trening skupienia, uwagi i pamięci roboczej stosowany przez arcymistrzów. Zwiększa koncentrację przy nauce, pozwala dominować w grach karcianych i uczy kodowania złożonych procedur!': 'Elite mental workout of focus, attention, and working memory used by grandmasters. Sharpen study focus, dominate card games, and master multi-step procedures with ease!',
  'Duże zakupy w markecie bez spoglądania w telefon, kolejność punktów wystąpienia czy procedury krok po kroku – dzięki efektowi domina jedno ogniwo samo pociąga kolejne!': 'Big supermarket shopping without checking your phone, speech bullet points, or step-by-step procedures – with the domino effect, one link naturally pulls the next!',
  'Daty historyczne, rocznice, numery kont, statystyki i kody dostępowe. Zamiast męczących liczb pamiętasz żywe obrazy i filmy, które zostają w głowie na całe lata!': 'Historical dates, anniversaries, bank accounts, statistics, and access codes. Instead of tiring digits, you remember vibrant scenes that stay with you for years!',
  'Zamiast gubić się w nudnych, ciągnących się notatkach linijka po linijce, zamieniasz całą wiedzę w barwne drzewo skojarzeń. Niezbędna do nauki całych działów do egzaminu, przygotowywania wystąpień publicznych bez kartki oraz planowania złożonych projektów!': 'Instead of getting lost in boring, line-by-line notes, you transform knowledge into a colorful radiant tree. Essential for studying entire textbook chapters for exams, delivering note-free public speeches, and planning complex projects!',
  'Wygłaszanie przemówień i prezentacji bez ani jednej kartki, bezstresowe zdawanie egzaminów i lista 20 zadań w głowie – Twój mózg myśli przestrzenią, a pałac to Twój wewnętrzny segregator wiedzy!': 'Deliver presentations without notes, ace exams without stress, and hold 20 to-dos in your mind – your brain thinks spatially, and the palace is your mental binder!',
  '3x szybsza nauka słówek z języka angielskiego! Zamiast wkuwać 50 razy, tworzysz jeden polski most dźwiękowy i pamiętasz znaczenie od razu!': '3x faster foreign vocabulary learning! Instead of repeating a word 50 times, create a memorable sound bridge and remember the meaning immediately!',
  'Pięć cyfr – Kod pocztowy': 'Five Digits – ZIP Code',
  'Merdam ogonkiem z radości! Twój mózg tropi wiedzę jak prawdziwy detektyw! 🦴': 'Wagging my tail in joy! Your mind tracks down knowledge like a true detective! 🦴',
  'Pierwsze litery to najwygodniejsze haczyki pamięciowe na świecie! 🎯': 'First letters are the handiest memory hooks in the world! 🎯',
  'Hau! Jestem Lisek Bystrzak 🦊 Każda twarz ma w sobie sekret!': 'Hi! I am Rusty the Fox 🦊 Every face holds a secret within!',
  'Zauważ ten mały pieprzyk albo okulary – to Twój pamięciowy haczyk! 🔍': 'Spot that tiny beauty mark or glasses – that is your memory hook! 🔍',
  'Mój puszysty ogon kręci się z zachwytu! Gotowy poznać nowych ludzi? 🐾': 'My fluffy tail swishes in delight! Ready to meet new people? 🐾',
  'Nigdy więcej nie powiesz: „Znam tę twarz, ale jak on miał na imię?”. ✨': 'Never again will you say: "I know that face, but what was their name?". ✨',
  'Twój wzrok jest bystrzejszy niż myślisz! Złapiesz każdą twarz w sekundę! 🎯': 'Your eyes are sharper than you think! You will catch every face in a second! 🎯',
  'Lisi spryt to potężna broń – łącz imię z charakterystyczną cechą! ⚓': 'Fox cunning is a powerful tool – link the name with a striking feature! ⚓',
  'Plusk! Jestem Ośmiornica Inka 🐙 Moje 8 macek ogarnia każdy chaos!': 'Splash! I am Inky the Octopus 🐙 My 8 tentacles conquer every chaos!',
  'Zapomnij o nudnych notatkach linijka po linijce – narysujmy myśl promieniście! 💡': 'Forget boring line-by-line notes – let us draw thoughts radiantly! 💡',
  'Głowa to temat główny, a macki to gałęzie wiedzy! Proste i genialne, prawda? 🎨': 'The head is the core topic, and the tentacles are branches of knowledge! Simple and brilliant! 🎨',
  'Mój atrament nigdy nie wysycha! Każda gałąź z osobnym kolorem to +50% do pamięci! ✨': 'My ink never dries! Each branch in a distinct color adds +50% to memory retention! ✨',
  'Jedno słowo-klucz i mały symbol wystarczą, by zapamiętać cały wykład! 🧠': 'A single keyword and tiny symbol are enough to recall an entire lecture! 🧠',
  'Twój mózg uwielbia rozgałęzienia tak samo jak ja pływanie w rafie koralowej! 🌊': 'Your brain loves branching thoughts just like I love gliding through coral reefs! 🌊',
  'Huu-huu! Jestem Sówka Profesor 🦉 Zamienię każdą liczbę w słowo!': 'Hoo-hoo! I am Professor Owl 🦉 I convert every number into a word!',
  'Litery to klucze do pamięci. Dźwięk rodzi obraz, a obraz zostaje na zawsze! 📜': 'Letters are keys to memory. Sound creates an image, and the image stays forever! 📜',
  'Mój dziób klaszcze z podziwu! Gotowy na kolejną zagadkę Majora? ✨': 'My beak clacks with admiration! Ready for the next Major puzzle? ✨',
  'Starożytni uczeni nie mieli smartfonów – mieli genialny System Major! 💡': 'Ancient scholars had no smartphones – they had the brilliant Major System! 💡',
  'Mądrość to po prostu dobra technika skojarzeń! 🎓': 'Wisdom is simply the art of smart association! 🎓',
  'Huu! Pamięć to najpotężniejszy mięsień Twojego umysłu! 🌟': 'Hoot! Memory is the mightiest muscle of your mind! 🌟',
  'Kraa! Jestem Papużka Pola 🦜 Znam słówka ze wszystkich zakątków świata!': 'Squawk! I am Polly the Parrot 🦜 I know words from every corner of the globe!',
  'Most fonetyczny to magia: nietoperz z baseballowym batem i już pamiętasz bat! ⚾': 'Phonetic bridges are pure magic: picture a bat holding a baseball bat and you never forget! ⚾',
  'Moje piórka mienią się jak tęcza! Gotowy na kolejną porcję słówek? 🌈': 'My feathers shimmer like a rainbow! Ready for another batch of words? 🌈',
  'Mów do mnie w dowolnym języku – zamienię go w zabawny obrazek! 🌴': 'Speak to me in any language – I will turn it into a hilarious picture! 🌴',
  'Kra-kra! Twój mózg to najszybszy tłumacz na świecie! ✨': 'Squawk-squawk! Your brain is the fastest translator in the world! ✨',
  'Każde nowe słówko to jak kolorowe piórko w Twojej koronie wiedzy! 👑': 'Each new word is like a vibrant feather in your crown of wisdom! 👑',
  'Szast-prast! Jestem Szop Magik 🦝 Talia 52 kart nie ma przede mną tajemnic!': 'Presto! I am Bandit the Magician 🦝 A deck of 52 cards holds no secrets from me!',
  'Mój pręgowany ogon faluje z ekscytacji! Gotowy na karcianą sztuczkę? ✨': 'My striped tail wags with excitement! Ready for a card trick? ✨',
  'Nie musisz być magikiem – wystarczy, że dasz kartom twarze swoich bohaterów! 🎩': 'You do not need to be a wizard – just give cards the faces of your heroes! 🎩',
  'Wybierz kartę, dowolną kartę... a ja powiem Ci, która to była! 🪄': 'Pick a card, any card... and I will tell you which one it was! 🪄',
  'Abrakadabra! Twój mózg tasuje obrazy szybciej niż krupier w Vegas! ♠️': 'Abracadabra! Your mind shuffles pictures faster than a Vegas dealer! ♠️',
  'Cześć! Jestem Wiewiórka Basia 🐿️ Łączę myśli jak żołędzie w łańcuch!': 'Hi! I am Hazel the Squirrel 🐿️ I link thoughts like acorns on a chain!',
  'Im bardziej szalona akcja między dwoma rzeczami, tym trwalej zapamiętasz! 💥': 'The crazier the action between two objects, the firmer the memory sticks! 💥',
  'Wyobraź sobie, że parasol wystrzeliwuje w niebo jak rakieta! Widzisz to? 🚀': 'Imagine an umbrella blasting into the sky like a rocket! Can you see it? 🚀',
  'Jeden element pociąga za sobą kolejny – efekt domina w Twojej pamięci! 🔗': 'One item pulls the next – the domino effect in your memory! 🔗',
  'Chrup, chrup! Każde żywe skojarzenie to kolejny orzeszek na zimę! 🌰': 'Crunch, crunch! Every vivid association is another acorn saved for winter! 🌰',
  'Skaczę po gałęziach wyobraźni! Lista 20 zakupów to dla nas pestka! ✨': 'Leaping through branches of imagination! A list of 20 groceries is a breeze for us! ✨',
  'Rawrr! Jestem Leon – Twój przewodnik po Pałacu Pamięci! 🐯': 'Rawrr! I am Leo – your guide through the Memory Palace! 🐯',
  'Wiesz, że starożytni mówcy pamiętali wielogodzinne mowy dzięki loci?': 'Did you know ancient orators delivered multi-hour speeches using loci?',
  'Im bardziej absurdalny i żywy obraz stworzysz, tym trwalej go zapamiętasz! ⚡': 'The more absurd and lively the image you craft, the more permanently you remember! ⚡',
  'Grr! Zobacz, jak macham ogonem – zwiedźmy kolejną komnatę! 🏰': 'Grr! Look at my tail wagging – let us explore the next room! 🏰',
  'Twój mózg to zamek z nieograniczoną liczbą pokoi. Wykorzystaj go! ✨': 'Your mind is a grand castle with endless rooms. Put it to work! ✨',
  'Tygrysia pamięć nigdy nie zawodzi! Leon trzyma za Ciebie kciuki! 🐾': 'A tiger memory never fails! Leo is rooting for you! 🐾',
  'Tik-tak! Jestem Żółwik Zegarowy 🐢 Znam dzień tygodnia każdej daty w historii!': 'Tick-tock! I am Clockwork Turtle 🐢 I know the weekday of any date in history!',
  'Nie spiesz się! Kalendarz to tylko prosty rytm: 4.04, 6.06, 8.08, 10.10, 12.12! ⏱️': 'Take your time! The calendar is a simple rhythm: 4/4, 6/6, 8/8, 10/10, 12/12! ⏱️',
  'Nawet żółw potrafi obliczyć dzień tygodnia w 3 sekundy. Nauczę Cię tego krok po kroku! ⏳': 'Even a turtle can calculate any weekday in 3 seconds. I will teach you step by step! ⏳',
  'Dzień Sądu (Doomsday) brzmi groźnie, ale to po prostu nasza niezawodna kotwica w czasie! ⚓': 'Doomsday sounds menacing, but it is simply our reliable anchor in time! ⚓',
  'Pamięć i czas to najlepsi przyjaciele! Sprawdźmy dowolny rok i dzień! 📅': 'Memory and time are best friends! Let us test any year and day! 📅',
  'Spokojnie, precyzyjnie i bez stresu – Twój mózg to najdokładniejszy zegar! 🕰️': 'Calmly, precisely, with zero stress – your brain is the most accurate clock! 🕰️',
  'Hau, hau! Cześć! Jestem Piesek Łatek 🐶. Pokażę Ci, jak pierwsze litery słów stają się najwierniejszymi tropami pamięci!': 'Woof, woof! Hi! I\'m Patch the Dog 🐶. I\'ll show you how the first letters of words become the most loyal memory clues!',
  'Lecimy w kosmos! 🪐 Z tym tropem zagniesz każdego nauczyciela geografii i fizyki!': 'Blasting into space! 🪐 With this clue, you\'ll outshine any science teacher!',
  'Często myli Ci się, czy D to 500 czy 100? Piesek Łatek ma na to genialny patent!': 'Do you get confused if D is 500 or 100? Patch the Dog has a brilliant trick for that!',
  'Nigdy więcej gubienia się na mapie! Pokażę Ci wronę, która zna wszystkie strony świata! 🧭': 'Never get lost on a map again! Let me show you a crow that knows every compass direction! 🧭',
  'Przypadki w szkole bywają zmorą, ale z bułką z wiejskim masłem nauczysz się ich w minutę! 🍞': 'Grammar cases can be a pain in school, but with our buttered bread sentence you will master them in a minute! 🍞',
  'Koniec z czerwonym długopisem w zeszycie! Rymowane zaklęcia Łatka działają jak tarcza! 🛡️': 'No more red pens on your homework! Patch’s rhyming spells work like an impenetrable shield! 🛡️',
  'Hau! Wskakujemy w fartuch laboratoryjny! Pokażę Ci, z czego zbudowany jest każdy człowiek! 🧪': 'Woof! Let us put on our lab coats! I will show you what every living human is made of! 🧪',
  'Chcesz zagrać rockowy kawałek? Piesek Łatek podpowie Ci, jak nastroić gitarę! 🎸': 'Want to play a rock track? Patch the Dog shows you how to tune your guitar strings! 🎸',
  'Hau! Wytropmy ewolucję! To zdanie to prawdziwy hit wśród olimpijczyków biologii! 🐾🌿': 'Woof! Let us track down evolution! This sentence is a huge hit among biology olympians! 🐾🌿',
  'Hau! Dotarłeś na szczyt! 🏆 Teraz posiądziesz najcenniejszą wiedzę: jak samemu stworzyć akrostych do absolutnie każdej listy na świecie!': 'Woof! You reached the pinnacle! 🏆 Now you master the ultimate skill: building your own acrostic for any list on Earth!',
  'Tik-tak! Cześć! Tu Żółwik Zenon 🐢. Zdradzę Ci sekret Doomsday – w 3 sekundy podasz dzień tygodnia każdej daty w roku!': 'Tick-tock! Hi! Clockwork Turtle here 🐢. I\'ll share the secret of Doomsday – calculate any date\'s weekday in 3 seconds!',
  'Popatrz na parzyste miesiące! Kalendarz sam podpowiada daty kotwiczne, spójrz jak łatwo je zapamiętać!': 'Look at the even months! The calendar naturally whispers the anchor dates, see how easy they are!',
  'Miesiące nieparzyste mają genialną rymowankę o stacji benzynowej 7/11 i pracy 9-5! Zobacz to!': 'Odd months have a catchy rhyme about 7-Eleven and working 9 to 5! Watch this!',
  'Mamy już wszystkie kotwice! Czas na prostą matematykę: wystarczy policzyć, ile dni dzieli Twoją datę od najbliższej kotwicy!': 'We have all the anchors! Now simple math: just count how many days separate your date from the nearest anchor!',
  'Podróż w czasie! Rok 2027 i kolejne lata to tylko mały krok przeskoku kotwicy w kalendarzu!': 'Time travel! 2027 and future years are just a small step jump of the calendar anchor!',
  'Wielki egzamin u Żółwika! Zostań prawdziwym Władcą Czasu i obliczaj daty z zamkniętymi oczami! 🏆': 'Grand exam with Clockwork Turtle! Become a true Master of Time and calculate dates with your eyes closed! 🏆',
  'Tadaam! Witam w Szkole Magii! 🦝 Pokażę Ci, jak zapamiętać całą talię 52 kart bez zająknięcia!': 'Ta-da! Welcome to the School of Magic! 🦝 I\'ll show you how to memorize a full 52-card deck without a stutter!',
  'Karty dworskie to prawdziwe legendy! Królowie, Damy i Waleci mają swoje własne, unikalne role!': 'Court cards are living legends! Kings, Queens, and Jacks each hold their own unique roles!',
  'Sekret profesjonalnych iluzjonistów i mistrzów pamięci: system PAO! Każda karta to Postać, Akcja i Obiekt!': 'The secret of illusionists and champions: the PAO system! Each card is a Person, an Action, and an Object!',
  'Czas połączyć karty! Dwie karty łączą się w jedną wybuchową, filmową scenę!': 'Time to fuse cards! Two cards merge into one explosive, cinematic scene!',
  'Przechodzimy do praktyki: pokerowe rozdanie 3 kart w jednej scenie! Zobacz, jak mózg natychmiast to koduje!': 'Onto practice: a poker deal of 3 cards in one scene! See how your brain encodes it instantly!',
  'Finałowy egzamin Szopa Magika! Udowodnij, że potrafisz odczytać układ kart jak z otwartej księgi! 🏆': 'Final exam of Bandit the Magician! Prove you can read card deals like an open book! 🏆',
  'Chrup, chrup! Cześć! Tu Wiewiórka Basia 🐿️. Zbudujmy razem łańcuch pamięci, który nigdy się nie zerwie!': 'Crunch, crunch! Hi! Hazel the Squirrel here 🐿️. Let\'s build a memory chain that never breaks!',
  'Zmysły i przesada to klucz! Nie bój się szalonych, gigantycznych obrazów – mózg je uwielbia!': 'Senses and exaggeration are the key! Never fear wild, colossal images – your brain adores them!',
  'Wchodzimy do tajemniczej jaskini! Kolejne ogniwa łańcucha połączą się w ekscytującą przygodę!': 'Entering a mysterious cave! The next links in the chain fuse into an exciting adventure!',
  'Kosmiczny lot! Zobacz, jak smok, rakieta i ser łączą się w niesamowitą sekwencję!': 'Cosmic flight! Watch the dragon, rocket, and cheese link into an incredible sequence!',
  'Finałowe ogniwa i bieg wstecz! Sprawdźmy, czy potrafisz cofnąć taśmę filmową w swojej pamięci!': 'Final links and the backward run! Let us see if you can rewind the movie reel in your memory!',
  'Wielki egzamin Basi! 20 ogniw bez ani jednej kartki! Twoja spiżarnia pamięci jest pełna skarbów! 🏆': 'Grand exam with Hazel! 20 links without a single note! Your memory pantry is overflowing with treasures! 🏆',
  'Uhuhu! Witam w Akademii Majora! 🦉 Nauczę Cię tajemnego kodu mistrzów: zamieniania cyfr w spółgłoski!': 'Hoo-hoo! Welcome to the Major Academy! 🦉 I\'ll teach you the secret code of champions: converting numbers into consonants!',
  'Kolejna para cyfr: 2 i 3! Zobacz, jak ich kształt sam podpowiada właściwe litery!': 'Next digit pair: 2 and 3! See how their very shapes reveal the right letters!',
  'Cyfry 4 i 5 kryją się w rzymskich liczbach i dźwiękach słów! Sprawdźmy to!': 'Digits 4 and 5 hide inside Roman numerals and word sounds! Let us test them!',
  'Szumiące 6 i kanciaste 7! Zobacz, jak łatwo połączyć je z literami J, SZ oraz K!': 'Soft 6 and angular 7! See how easily they connect with letters J, SH, and K!',
  'Ostatnia para: 8 i 9! Pętelki i lustrzane odbicia dopełniają nasz alfabet fonetyczny!': 'Final pair: 8 and 9! Loops and mirror reflections complete our phonetic alphabet!',
  'Samogłoski to darmowy klej! Łączymy spółgłoski w żywe, zapadające w pamięć słowa!': 'Vowels are free glue! We connect consonants into vivid, memorable words!',
  'Dwucyfrowe kołki pamięciowe! Zamień dowolną liczbę 00-99 w konkretny, dotykalny przedmiot!': 'Two-digit memory pegs! Turn any number 00-99 into a tangible, touchable object!',
  'Wielki egzamin Profesora! Wykorzystaj System Major do zapamiętania 4-cyfrowego kodu PIN! 🏆': 'Professor\'s grand exam! Use the Major System to memorize a 4-digit PIN code! 🏆',
  'Plusk! Cześć! Tu Ośmiornica Inka 🐙. Zamiast nudnych notatek w linijkach, nauczę Cię myśleć promieniście!': 'Splash! Hi! Inky the Octopus here 🐙. Instead of boring line-by-line notes, I\'ll teach you radiant thinking!',
  'Serce mapy to wyrazisty symbol centralny! Kartka poziomo i ruszamy z wyobraźnią!': 'The heart of a map is a striking central symbol! Turn your page landscape and unleash your imagination!',
  '8 macek Inki to 8 głównych filarów każdego tematu! Podziel wiedzę na przejrzyste gałęzie!': 'Inky’s 8 tentacles are 8 core pillars of any topic! Organize knowledge into crystal-clear branches!',
  'Złota zasada kartografii: TYLKO JEDNO słowo-klucz na gałęzi! Zero nudnych zdań!': 'Golden cartography rule: ONLY ONE keyword per branch! Zero boring sentences!',
  'Mnemorysunki i piktogramy! Obraz jest wart 60 000 słów w Twoim mózgu!': 'Mnemo-drawings and pictograms! An image is worth 60,000 words in your brain!',
  'Kolorowe kodowanie! Każda gałąź potrzebuje własnego koloru, by mózg natychmiast ją rozpoznał!': 'Color coding! Every branch needs its own color for your brain to recognize it in an instant!',
  'Płynna hierarchia: grube konary przechodzą w coraz cieńsze gałązki wiedzy!': 'Fluid hierarchy: thick boughs taper into slender twigs of knowledge!',
  'Czytelność mistrza: drukowane litery poziomo, by czytać mapę bez kręcenia głową!': 'Master legibility: horizontal print lettering to read the map without tilting your head!',
  'Praktyka mistrza: skompresuj cały 20-stronicowy rozdział na jednej kartce A4!': 'Master practice: compress an entire 20-page chapter onto a single landscape page!',
  'Wielki finał! Z mapą myśli wygłosisz 15-minutowe wystąpienie bez ani jednej kartki w dłoni! 🏆': 'Grand finale! Deliver a 15-minute speech with zero notes in hand using your mind map! 🏆',
  'Jaki dzień tygodnia odpowiada liczbie 5 w systemie kalendarzowym?': 'Which weekday corresponds to number 5 in the calendar system?',
  'Która data jest kotwicą Doomsday dla sierpnia (8. miesiąc)?': 'Which date is the Doomsday anchor for August (8th month)?',
  'Jaki dzień maja (5. miesiąc) jest kotwicą w regule „od 9 do 5”?': 'Which day in May (5th month) is an anchor in the "9 to 5" rule?',
  'Jeśli 8 sierpnia to Sobota, jaki dzień tygodnia to 10 sierpnia (8 + 2 dni)?': 'If August 8 is Saturday, what weekday is August 10 (8 + 2 days)?',
  'Jeśli w 2026 roku kotwicą jest Sobota, jaka będzie kotwica roku 2027 (zwykły rok, +1 dzień)?': 'If 2026 anchor is Saturday, what will be 2027 anchor (+1 day)?',
  'Który żywioł reprezentuje kolor Kier (♥️)?': 'Which element is represented by Hearts (♥️)?',
  'Która karta dworska przedstawia Króla Artura z mieczem?': 'Which court card depicts King Arthur with a sword?',
  'Co oznacza skrót PAO w systemie zapamiętywania kart?': 'What does the acronym PAO stand for in card memory?',
  'Jak w systemie PAO połączyć Króla Pika (K♠️) i Damę Karo (Q♦️)?': 'How do you link King of Spades (K♠️) and Queen of Diamonds (Q♦️) in PAO?',
  'Jak zapamiętać 3 karty naraz w jednym pokerowym rozdaniu?': 'How do you memorize 3 cards at once in a single poker deal?',
  'Jak połączyć w żywą scenę Parasol i Arbuza (pierwsze 2 ogniwa)?': 'How do you connect Umbrella and Watermelon in a dynamic scene?',
  'Co dzieje się z Zegarem i Balonem (ogniwa 4 i 5)?': 'What happens between Clock and Balloon (links 4 and 5)?',
  'Jaki przedmiot łączy lody cytrynowe ze złotym kluczem w jaskini?': 'What object connects lemon ice cream with a golden key in the cave?',
  'Jak Smok odpala Rakietę kosmiczną w drodze na Księżyc?': 'How does Dragon ignite the space Rocket on the way to the Moon?',
  'Co robi olbrzymia Mysz na cyrkowej trampolinie?': 'What does the giant Mouse do on the circus trampoline?',
  'Które ogniwo łańcucha znajduje się bezpośrednio za Smokiem?': 'Which link in the chain comes immediately after Dragon?',
  'Jakie spółgłoski odpowiadają cyfrom 0 oraz 1 w Systemie Major?': 'Which consonants correspond to digits 0 and 1 in the Major System?',
  'Dlaczego cyfra 2 to litera N, a cyfra 3 to litera M?': 'Why is digit 2 letter N, and digit 3 letter M?',
  'Dlaczego cyfra 4 to R, a cyfra 5 to L?': 'Why is digit 4 letter R, and digit 5 letter L?',
  'Jakie spółgłoski reprezentują cyfry 6 i 7?': 'Which consonants represent digits 6 and 7?',
  'Jakie litery przypisane są do cyfr 8 i 9?': 'Which letters are assigned to digits 8 and 9?',
  'Jaką rolę w Systemie Major pełnią samogłoski (A, E, I, O, U, Y)?': 'What role do vowels play in the Major System?',
  'Jakie słowo koduje liczbę 14 w Systemie Major (T=1, R=4)?': 'Which word encodes number 14 in the Major System (T=1, R=4)?',
  'Jak zapamiętać 4-cyfrowy kod PIN za pomocą Systemu Major?': 'How do you remember a 4-digit PIN code using the Major System?',
  'Słowo „Żabko” zaczyna się na literę Ż – to kolor Żółty!': 'The word begins with Y – that is the color Yellow!',
  'Lech to 50, a Chce (C) to okrągłe 100!': 'L is 50, and C is round 100!',
  'Na (góra) -> Ekranie (prawo) -> Siedzi (dół) -> Wrona (lewo)!': 'North (up) -> East (right) -> South (down) -> West (left)!',
  'Mama (Mianownik), Dała (Dopełniacz), Córce (Celownik)!': 'Nominative, Genitive, Dative!',
  'Pamiętasz rymowankę? Kto kreskuje -uje, ten dwóje otrzymuje!': 'Remember the rule? Words ending in -uje always take U!',
  'CHNOPS i ADEK – 4 witaminy rozpuszczalne w tłuszczach!': 'CHNOPS and ADEK – 4 fat-soluble vitamins!',
  'Eddie Ate Dynamite Good Bye Eddie – struny E, A, D, G, B, E!': 'Eddie Ate Dynamite Good Bye Eddie – strings E, A, D, G, B, E!',
  'Domena -> Królestwo -> Gromada (Gryzł)!': 'Domain -> Kingdom -> Class!',
  'Im śmieszniejszy i bardziej osobisty akrostych, tym trwalsza pamięć!': 'The funnier and more personal your acrostic, the firmer your recall!',
  'Niedziela to 0, Poniedziałek to 1, Sobota to 6!': 'Sunday is 0, Monday is 1, Saturday is 6!',
  'W parzystych miesiącach dzień równa się numerowi miesiąca: 8.08!': 'In even months, the day matches month number: 8/8!',
  'Pamiętasz regułę 9-5 i stację 7/11? 9 maja i 5 września!': 'Remember working 9 to 5? May 9 and Sept 5!',
  'Sobota (8 sierpnia) + 2 dni = Poniedziałek (10 sierpnia)!': 'Saturday (Aug 8) + 2 days = Monday (Aug 10)!',
  'Zwykły rok to przesunięcie o dokładnie 1 dzień w przód!': 'A standard year shifts the anchor forward by exactly 1 day!',
  'Kier to czerwone, bijące serce z płomieni miłości!': 'Hearts is the glowing red heart of love and fire!',
  'Król Artur dzierży miecz Excalibur w kolorze Pika!': 'King Arthur wields Excalibur in the suit of Spades!',
  'Person (Postać) + Action (Akcja) + Object (Obiekt) = PAO!': 'Person + Action + Object = PAO!',
  'Postać z pierwszej karty wykonuje akcję drugiej karty!': 'The person from the first card performs the action of the second!',
  '1. karta = Kto?, 2. karta = Co robi?, 3. karta = Czym?': '1st card = Who?, 2nd card = Does what?, 3rd card = With what?',
  'Parasol przebija arbuza, a czerwony sok tryska na wszystkie strony!': 'Umbrella pierces watermelon, spraying juice everywhere!',
  'Zegar uderza w wielki balon z helem, który pęka z głośnym hukiem!': 'Clock smashes into a helium balloon, popping with a loud bang!',
  'Cytrynowe lody oblepiają wielki złoty klucz i go zamrażają!': 'Lemon ice cream coats the giant golden key and freezes it solid!',
  'Smok zieje ogniem pod silnik rakiety kosmicznej!': 'Dragon breathes fire beneath the space rocket thrusters!',
  'Mysz skacze tak wysoko na trampolinie, że przebija namiot cyrkowy!': 'Mouse bounces so high on the trampoline that it tears the tent!',
  'Za Smokiem leci Rakieta Kosmiczna napędzana jego ogniem!': 'After Dragon comes the Space Rocket powered by dragon flame!',
  '0 syczy jak wąż (S/Z), a 1 ma pionową kreskę (T/D)!': '0 hisses like a snake (S/Z), 1 has a single downstroke (T/D)!',
  'czteRy = R (4), rzymskie L = 50 (5)!': 'fouR = R (4), Roman L = 50 (5)!',
  'Małe j to lustrzane odbicie 6, a K składa się z dwóch siódemek!': 'Lowercase j mirrors 6, capital K is two sevens joined!',
  'Pisane f ma dwie pętelki (8), a P to lustrzane odbicie 9!': 'Cursive f has two loops (8), P is mirror of 9!',
  'Samogłoski (A, E, I, O, U, Y) nie mają liczb – łączą spółgłoski w słowa!': 'Vowels carry no numbers – they fuse consonants into words!',
  'T=1, R=4 -> wstawiamy samogłoskę O i mamy TOR!': 'T=1, R=4 -> insert vowel O and you get TOR!',
  'Dzielimy 4 cyfry na dwie pary i tworzymy fuzję dwóch wyrazistych obrazów!': 'Split 4 digits into two pairs and fuse two striking images!',
  'Zawsze przez „u” otwarte („Kto kreskuje -uje, ten dwóje otrzymuje”)!': 'Always with simple "u" ("Never dot the -uje ending")!',
  'Zawsze przez „ó” z kreską': 'Always spelled with accented o-acute',
  'Zależy od tego, czy wyraz jest długi czy krótki': 'Depends on whether the word is long or short',
  'Z końcówką „-óje” w liczbie mnogiej': 'With plural ending \'-oje\'',
  'Gromada (Królestwo -> Typ -> Gromada)': 'Class (Kingdom -> Phylum -> Class)',
  'Humor, absurd i żywe wyobrażenie sobie całej sceny w myślach': 'Humor, absurdity, and a vivid mental movie of the entire scene',
  'Zapisanie go nudnym, szarym ołówkiem w zeszycie': 'Writing it down with a dull gray pencil in a notebook',
  'Używanie wyłącznie trudnych, naukowych słów': 'Using exclusively difficult, obscure scientific words',
  'Powtarzanie go po cichu sto razy bez żadnych obrazów': 'Repeating it silently a hundred times with zero images',
  'Piątek (5. dzień)': 'Friday (5th day)',
  'Poniedziałek (1)': 'Monday (1)',
  'Środa (3)': 'Wednesday (3)',
  'Poniedziałek (Sobota + 2 dni)': 'Monday (Saturday + 2 days)',
  'Niedziela (Sobota + 1 dzień)': 'Sunday (Saturday + 1 day)',
  'Poniedziałek': 'Monday',
  'Piątek': 'Friday',
  'Niedziela (bo 4.04 to bezpośrednia kotwica Doomsday!)': 'Sunday (because 4/4 is a direct Doomsday anchor!)',
  'Środa': 'Wednesday',
  'Diamenty, złoto i skarby': 'Diamonds, gold, and treasures',
  'Śnieg i lód': 'Snow and ice',
  'Król Artur ze złotym mieczem Excalibur': 'King Arthur with golden sword Excalibur',
  'Robin Hood z łukiem': 'Robin Hood with a longbow',
  'Person – Action – Object (Postać – Akcja – Obiekt)': 'Person – Action – Object (PAO)',
  'Król Kier (K♥) + Dama Karo (Q♦)': 'King of Hearts (K♥) + Queen of Diamonds (Q♦)',
  'Dama Karo + Król Trefl': 'Queen of Diamonds + King of Clubs',
  'Król Artur': 'King Arthur',
  'Świecący cylinder / magiczny rekwizyt': 'Glowing top hat / magical prop',
  'Kawałek pizzy': 'Slice of pizza',
  'Szklaną kulę': 'Crystal ball',
  'Parasol wystrzeliwuje i z impetem taranuje arbuza, rozbryzgując czerwony sok!': 'An umbrella launches like a rocket, slamming into the watermelon with spraying red juice!',
  'Parasol leży spokojnie na stole obok arbuza': 'An umbrella lies quietly on a table next to a watermelon',
  'Parasol i arbuz są czarno-białe': 'The umbrella and watermelon are black and white',
  'Gra rockowe solo, a na jej struny skapują z góry truskawkowe lody 🍦': 'Plays a blistering rock solo as strawberry ice cream drips from above onto its strings! 🍦',
  'Zostaje schowana do futerału': 'Is packed away in a guitar case',
  'Leży cicho w szafie': 'Rests quietly inside a closet',
  'Zamienia się w drewno': 'Turns into dull wood',
  'Złoty klucz rozświetla w ciemności silny snop światła z latarki': 'The golden key is lit up in the dark by a powerful flashlight beam',
  'Klucz leży w szufladzie, a latarka na biurku': 'The key lies in a drawer, flashlight on the desk',
  'Latarka ma wyjęte baterie': 'The flashlight has its batteries removed',
  'Księżyc jest w całości zrobiony z żółtego sera 🧀, w którym biega mysz!': 'The Moon is entirely made of yellow Swiss cheese 🧀 with a mouse scurrying inside!',
  'Księżyc jest zimną skałą bez niczego': 'The Moon is a cold barren rock with nothing on it',
  'Rakieta zawraca na Ziemię': 'The rocket turns back toward Earth',
  'Księżyc gaśnie i znika': 'The Moon goes dark and disappears',
  'Magiczny, lśniący KRYSZTAŁ 🔮': 'A magical, glowing CRYSTAL 🔮',
  'Zwykły szary kamień': 'An ordinary gray rock',
  'Kawałek drewna': 'A piece of driftwood',
  'Smok 🐉 (strzegący skarbu i odpalający rakietę)': 'Dragon 🐉 (guarding treasure and igniting the rocket)',
  'M (trzy nóżki)': 'M (three downstrokes)',
  'Ponieważ litera „m” ma 3 nóżki': 'Because the letter "m" has 3 downstrokes',
  'Bo M to pierwsza litera słowa Major': 'Because M is the first letter of Major',
  'R (z dominującego R w słowie „czteRy”)': 'R (from dominant R sound in fouR)',
  'Bo lustrzane odbicie 9 to P, a obrócona to b': 'Because the mirror image of 9 is P, and rotated is b',
  'Bo pies ma 9 żyć': 'Because dogs have 9 lives',
  'Mózg myśli skojarzeniami rozchodzącymi się we wszystkich kierunkach od centrum, a nie nudnymi linijkami tekstu': 'The brain thinks via associations radiating in all directions from the center, not dull linear text lines',
  'Mózg potrafi myśleć wyłącznie w szarych, pionowych tabelach': 'The brain can only think in gray, vertical tables',
  'Notatki linearne są znacznie bardziej pobudzające dla prawej półkuli mózgu': 'Linear notes are far more stimulating for the right brain hemisphere',
  'Myślenie promieniste polega na przepisywaniu całych zdań z podręcznika': 'Radiant thinking means copying full sentences from a textbook',
  'Bo pole widzenia ludzkich oczu jest panoramiczne, co daje przestrzeń na rozrastanie się gałęzi w lewo i w prawo': 'Because the field of vision is panoramic, giving ample room for branches spreading left and right',
  'Ponieważ pionowe kartki są zakazane przez prawo edukacyjne': 'Because portrait paper is banned by school rules',
  'Bo na poziomej kartce mieści się mniej słów': 'Because landscape paper fits fewer words',
  'Aby móc oprzeć o nią łokieć podczas pisania': 'So you can rest your elbow while writing',
  'Powinny być grube u nasady, organicznie zakrzywione i bezpośrednio połączone z centralnym obrazem': 'They should be thick at the trunk, organically curved, and directly connected to the central image',
  'Muszą być idealnie proste, narysowane czarną linijką pod kątem 90 stopni': 'They must be ruler-straight, drawn in black at 90-degree angles',
  'Powinny być przerywane i ledwo widoczne': 'They should be dashed and barely visible',
  'Nie wolno ich łączyć z centrum mapy': 'They must not connect to the center of the map',
  'Bo jedno słowo-klucz wyzwala sieć skojarzeń i pozwala na błyskawiczne powtórki bez znużenia': 'Because a single keyword unleashes an associative network and allows rapid, fatigue-free review',
  'Ponieważ na kartce papieru nie mieszczą się litery alfabetu': 'Because the alphabet letters do not fit on a page',
  'Bo w mapach myśli wolno używać wyłącznie języka obcego': 'Because only foreign languages are allowed in mind maps',
  'Aby nikt inny nie był w stanie zrozumieć naszej notatki': 'So no one else can understand our notes',
  'Tworzy podwójny ślad pamięciowy (słowo + obraz), a mózg przetwarza obrazy 60 000 razy szybciej niż tekst': 'It creates a dual memory trace (word + image), and the brain processes images 60,000x faster than text',
  'Bo rysunki zakrywają puste miejsca na kartce papieru': 'Because drawings cover empty white space',
  'Tylko po to, by rysunek spodobał się znajomym na wystawie sztuki': 'Merely to show off art to friends',
  'Piktogramy nie mają żadnego wpływu na szybkość zapamiętywania': 'Pictograms have zero impact on memory speed',
  'Działa jak wizualna szufladka: mózg natychmiast lokalizuje w wyobraźni, na którym ramieniu była dana informacja': 'It acts as a visual filing drawer: the brain instantly pinpoints which branch holds the information',
  'Sprawia, że kartka staje się cięższa od atramentu': 'It makes the sheet heavier with ink',
  'Kolor nie ma żadnego znaczenia dla pamięci wzrokowej': 'Color has no relevance for visual memory',
  'Na najcieńszych pod-gałęziach (liściach) odchodzących od odpowiedniego ramienia': 'On the slender sub-branches (leaves) stemming from the respective limb',
  'W samym środku obrazka centralnego drobnym drukiem': 'In the dead center of the main drawing in tiny print',
  'W losowym rogu kartki bez żadnych linii': 'In a random corner of the sheet without lines',
  'Poziomo, drukowanymi literami wzdłuż linii, by można było je przeczytać bez kręcenia głową': 'Horizontally, in print capital letters along lines, readable without tilting your head',
  'Pionowo, drobnym pismem odręcznym do góry nogami': 'Vertically, in tiny cursive upside down',
  'Wyłącznie skrótami złożonymi z samych samogłosek': 'Exclusively with vowel-only abbreviations',
  'Szybki przegląd spisu treści, nagłówków i podsumowań, by uchwycić strukturę tematu przed rysowaniem': 'Quick skim of contents, headings, and chapter summaries to capture the topic architecture before drawing',
  'Przepisanie pierwszego akapitu słowo w słowo na gałąź': 'Copying the opening paragraph word for word onto a branch',
  'Pokolorowanie wszystkich stron podręcznika na żółto': 'Highlighting every page of the textbook in yellow',
  'Wyrwanie stron z książki i naklejenie ich na kartkę': 'Tearing pages out of the book and gluing them to the sheet',
  'Daje w pamięci panoramiczny obraz 4 ramion tematu, pozwalając mówić swobodnie i utrzymać kontakt wzrokowy ze słuchaczami': 'Provides a panoramic mental view of the 4 topic branches, letting you speak freely with constant audience eye contact',
  'Zwalnia mówcę z obowiązku wypowiadania jakichkolwiek słów': 'Exempts the speaker from saying any words',
  'Wymaga wyświetlenia skomplikowanego programu komputerowego': 'Requires projecting complicated software',
  'Sprawia, że słuchacze zasypiają po minucie': 'Puts the audience to sleep within a minute',
  'Basia czyta książkę o historii muzyki': 'Barbara reads a music history book',
  'Basia ma na sobie zwykły płaszcz': 'Barbara wears an ordinary raincoat',
  'Most fonetyczny (brzmienie) + żywa scenka ze znaczeniem': 'Phonetic sound bridge + lively scene linking the meaning',
  'Przepisywanie słówka 100 razy w zeszycie': 'Writing the word 100 times in a notebook',
  'Czekanie, aż słówko samo wejdzie do głowy': 'Waiting for the word to enter your mind on its own',
  'Słuchanie nagrań przez sen': 'Listening to audio tapes while sleeping',
  'candle (świeca)': 'candle',
  'feather (pióro)': 'feather',
  'beetle (chrząszcz)': 'beetle',
  'W każdym roku istnieje jeden magiczny dzień tygodnia, zwany Kotwicą Roku (Doomsday).': 'In every year, there is one magical day of the week known as the Year Anchor (Doomsday).',
  'Spójrz, jak genialnie zbudowany jest kalendarz:': 'Look at how brilliantly the calendar is designed:',
  'W każdym parzystym miesiącu numer miesiąca to dokładnie ten sam dzień kotwiczny:': 'In every even-numbered month, the month number matches the anchor date exactly:',
  '• 10 października (10.10)': '• October 10 (10/10)',
  'Dla miesięcy nieparzystych mamy łatwe powiedzonko:': 'For odd-numbered months, we have an easy catchphrase:',
  '„Pracuję od 9 do 5 na stacji 7/11”:': '"Working 9 to 5 (9/5 & 5/9) at 7-Eleven (7/11 & 11/7)":',
  '• 9 maja (9.05) oraz 5 września (5.09) → zamieniamy 9 i 5!': '• May 9 (5/9) and September 5 (9/5) → swap 9 and 5!',
  'Do tego dochodzą pierwsze trzy miesiące roku:': 'On top of that come the first three months of the year:',
  '• Styczeń: 3 stycznia (3.01) w zwykłym roku (lub 4.01 w przestępnym) – pamiętamy: 3 dni odpoczynku po sylwestrze!': '• January: Jan 3 (or Jan 4 in leap years) – remember: 3 days of rest after New Year\'s Eve!',
  '• Luty: ZAWSZE OSTATNI DZIEŃ LUTEGO (28.02, a w przestępnym 29.02).': '• February: ALWAYS THE LAST DAY OF FEBRUARY (Feb 28, or Feb 29 in leap years).',
  '• Marzec: 14 marca (3.14 to słynny Dzień Liczby Pi!).': '• March: March 14 (3/14 is the celebrated Pi Day!).',
  'Chcesz wiedzieć, jaki dzień tygodnia to np. 15 sierpnia 2026:': 'Want to know what weekday August 15, 2026 falls on:',
  '1. Znasz kotwicę sierpnia: to bliźniak 8 sierpnia (8.08).': '1. You know August\'s anchor: it is the twin date August 8 (8/8).',
  '2. Wiesz, że w 2026 roku kotwica to SOBOTA (6).': '2. You know that in 2026, the anchor day is SATURDAY (6).',
  '3. Liczymy różnicę dni: 15 - 8 = 7 dni. Pełne 7 dni to dokładnie tydzień, więc 15 sierpnia to również SOBOTA!': '3. Count the day difference: 15 - 8 = 7 days. A full 7 days is an exact week, so August 15 is also SATURDAY!',
  'Dlaczego to działa w każdym roku?': 'Why does this work for every single year?',
  'Zwykły rok ma 365 dni = 52 pełne tygodnie + 1 dzień zapasu. Dlatego każdy zwykły rok przesuwa kotwicę o dokładnie +1 dzień!': 'A standard year has 365 days = 52 full weeks + 1 extra day. That is why each standard year shifts the anchor by +1 day!',
  'Rok przestępny (ma 29 lutego) przesuwa kotwicę o +2 dni!': 'A leap year (with Feb 29) shifts the anchor by +2 days!',
  'JAK TO LICZYĆ W PAMIĘCI?': 'HOW TO CALCULATE IN YOUR HEAD?',
  'Naszą domową bazą jest rok 2026 = SOBOTA (6):': 'Our baseline home year is 2026 = SATURDAY (6):',
  '• Rok 2028: (przestępny! +2 dni) → Niedziela + 2 = WTOREK (2)!': '• Year 2028: (leap year! +2 days) → Sunday + 2 = TUESDAY (2)!',
  '• Rok 2025: (-1 rok w tył) → Sobota - 1 = PIĄTEK (5)!': '• Year 2025: (-1 year back) → Saturday - 1 = FRIDAY (5)!',
  '• Rok 2035: różnica 9 lat + 2 lata przestępne (2028, 2032) = 11 dni przesunięcia. 11 mod 7 = 4 dni w przód od Soboty = ŚRODA (3)!': '• Year 2035: 9-year difference + 2 leap years = 11 days offset. 11 mod 7 = 4 days forward from Saturday = WEDNESDAY (3)!',
  '• Wiek XXI (lata 2000–2099): baza stulecia to WTOREK (2, łatwo zapamiętać: rok 2000 ma dwójkę na początku)!': '• 21st Century (2000–2099): century anchor is TUESDAY (2, easy to recall: year 2000 starts with 2)!',
  'Brawo! Masz w głowie kompletny, wieczysty kalendarz na dowolny rok:': 'Bravo! You now hold a complete, perpetual calendar in your head for any year:',
  '1. Znasz kotwice miesięcy: 4.04, 6.06, 8.08, 10.10, 12.12, 9.05, 5.09, 11.07, 7.11, 14.03, 28.02.': '1. You know month anchors: 4/4, 6/6, 8/8, 10/10, 12/12, 5/9, 9/5, 7/11, 11/7, 3/14, 2/28.',
  '2. Znasz bazę 2026 (Sobota) i potrafisz przesunąć kotwicę na dowolny rok (+1 na rok, +2 na przestępny).': '2. You know the 2026 base (Saturday) and can shift the anchor to any year (+1 standard, +2 leap).',
  '3. Dodajesz lub odejmujesz różnicę dni do najbliższej kotwicy!': '3. Add or subtract the day difference to the nearest anchor!',
  'Po co uczyć się zapamiętywania kart? To nie tylko wspaniała sztuczka, którą zachwycisz kolegów w szkole i rodzinę przy stole!': 'Why learn to memorize playing cards? It is not just a dazzling trick to amaze your friends and family!',
  'System PAO (karty i sekwencje) to najpotężniejsza technika do zapamiętywania długich ciągów kolejnych kroków, przepisów, procedur i list!': 'The PAO system (cards & sequences) is the most powerful technique for memorizing long sequences of steps, recipes, procedures, and lists!',
  'Zaczynamy od 4 magicznych żywiołów talii:': 'We start with the 4 magical suits of the deck:',
  '• PIK (♠) – tajemniczy, czarny świat magów, iluzjonistów i nocy.': '• SPADES (♠) – mysterious, black realm of magicians, illusionists, and night.',
  '• KIER (♥) – czerwone serca, dzielni rycerze, królowie, ogień i przygoda.': '• HEARTS (♥) – red hearts, brave knights, kings, fire, and adventure.',
  '• KARO (♦) – diamenty, złoto, bogactwo, skrzynie skarbów i piraci.': '• DIAMONDS (♦) – diamonds, gold, wealth, treasure chests, and pirates.',
  '• TREFL (♣) – zielone liście, las, natura, druidzi i leśni łucznicy.': '• CLUBS (♣) – green leaves, forest, nature, druids, and woodland archers.',
  'Karty dworskie najłatwiej zamienić na wyrazistych bohaterów:': 'Court cards are easiest to turn into vivid heroes:',
  '• Król Kier (K♥) → Król Artur w złotej koronie ze świecącym mieczem Excalibur 👑': '• King of Hearts (K♥) → King Arthur in golden crown with glowing sword Excalibur 👑',
  '• Dama Karo (Q♦) → Królowa Kleopatra rzucająca lśniącym błękitnym diamentem 💎': '• Queen of Diamonds (Q♦) → Queen Cleopatra tossing a brilliant blue diamond 💎',
  '• Walet Trefl (J♣) → Robin Hood strzelający z potężnego dębowego łuku 🏹': '• Jack of Clubs (J♣) → Robin Hood drawing a mighty oak longbow 🏹',
  '• As Pik (A♠) → Szop Magik wyciągający lśniący cylinder z kapelusza 🦝': '• Ace of Spades (A♠) → Bandit the Magician pulling a glowing top hat from nowhere 🦝',
  'System PAO (Person - Action - Object) przypisuje do każdej karty:': 'The PAO system (Person - Action - Object) assigns to each card:',
  '1. POSTAĆ (kto to jest?)': '1. PERSON (who are they?)',
  '2. AKCJĘ (co robi?)': '2. ACTION (what are they doing?)',
  '3. OBIEKT (czym się bawi lub czym rzuca?)': '3. OBJECT (what prop do they use?)',
  'Dzięki temu jedna karta daje postać, druga jej akcję, a trzecia przedmiot.': 'Thanks to this, the 1st card gives person, 2nd gives action, and 3rd gives object.',
  'Wyobraź sobie parę kart: pierwsza to Król Kier (K♥), a druga to Dama Karo (Q♦).': 'Picture a pair of cards: the first is King of Hearts (K♥), second is Queen of Diamonds (Q♦).',
  'Bierzemy POSTAĆ z pierwszej karty: Król Artur 👑': 'We take PERSON from the 1st card: King Arthur 👑',
  'I bierzemy AKCJĘ + OBIEKT z drugiej karty: rzuca błękitnym diamentem 💎!': 'And we take ACTION + OBJECT from the 2nd card: tossing a blue diamond 💎!',
  'Scena w głowie: Król Artur bierze zamach i z całej siły ciska wielkim diamentem w dal!': 'Mental movie: King Arthur winds up and hurls a massive diamond with all his might!',
  'Na stole lądują 3 karty: As Pik (A♠), Walet Trefl (J♣) i 7 Kier (7♥).': 'On the table land 3 cards: Ace of Spades (A♠), Jack of Clubs (J♣), and 7 of Hearts (7♥).',
  '• A♠ = Szop Magik (Postać)': '• A♠ = Bandit the Magician (Person)',
  '• J♣ = napina i strzela z dębowego łuku (Akcja)': '• J♣ = draws and fires an oak longbow (Action)',
  '• 7♥ = kieliszek złotego napoju (Obiekt)': '• 7♥ = golden goblet of wine (Object)',
  'Zobacz to: Szop Magik bierze wielki łuk i z uśmiechem wystrzeliwuje z niego kieliszek niczym strzałę!': 'Picture it: Bandit the Magician grabs an archery bow and shoots a goblet like an arrow with a grin!',
  'Brawo! Znasz już sekrety pamięciowych iluzjonistów:': 'Bravo! You now know the secrets of memory illusionists:',
  '1. 4 żywioły kolorów talii.': '1. The 4 suits of the card deck.',
  '3. Formuła PAO (Postać - Akcja - Obiekt).': '3. The PAO formula (Person - Action - Object).',
  'Po co nam ta technika? Ile razy zdarzyło Ci się zapomnieć rzeczy do szkoły, listy zakupów czy punktów prezentacji?': 'Why do we need this technique? How many times have you forgotten school items, groceries, or presentation points?',
  'Metoda łańcuchowa łączy myśli w głowie jak klocki domina: gdy popchniesz pierwszy klocek, cała reszta sama wskakuje do pamięci!': 'The link method connects thoughts like dominoes: push the first tile, and the entire chain falls smoothly into place!',
  'ZASADA NR 1: PRAWIDŁO DYNAMICZNEJ AKCJI:': 'RULE #1: PRINCIPLE OF DYNAMIC ACTION:',
  'Nasz mózg natychmiast zapomina nudne, spokojne obrazki. Aby coś zapamiętać na zawsze, potrzebujesz ruchu, dźwięku i zderzenia!': 'Our brain quickly forgets dull, static images. To remember permanently, you need movement, sound, and impact!',
  'Poznajmy pierwsze 4 ogniwa naszego wielkiego łańcucha:': 'Let us meet the first 4 links of our grand chain:',
  '1. PARASOL ☂️ → otwiera się z potężnym hukiem i z impetem taranuje wielkiego soczystego...': '1. UMBRELLA ☂️ → pops open with a loud bang and forcefully rams into a giant juicy...',
  '2. ARBUZA 🍉 → który eksploduje fontanną słodkiego czerwonego soku, na którym ślizga się...': '2. WATERMELON 🍉 → exploding into a fountain of red sweet juice, upon which skids a...',
  '3. ROWER 🚲 → który trąbi klaksonem i z łomotem wpada na gigantyczny...': '3. BICYCLE 🚲 → honking its horn and crashing with a rattle into an enormous...',
  'Aby łańcuch trzymał jak ze stali, używaj zmysłów: dźwięku, dotyku i komicznej przesady!': 'For the chain to hold like steel, use senses: sound, touch, and comical exaggeration!',
  'Dołączamy kolejne 4 ogniwa do naszego pociągu (mamy już 8!):': 'We attach the next 4 links to our train (now we have 8!):',
  '5. BALON 🎈 → który unosi się wysoko w niebo i z hukiem pęka, bo nabija się na kolczasty...': '5. BALLOON 🎈 → soaring into the sky and popping with a bang on a prickly...',
  '6. KAKTUS 🌵 → w który z głośnym brzękiem uderza spadająca z nieba elektryczna...': '6. CACTUS 🌵 → struck with a loud chord by a falling electric...',
  '7. GITARA 🎸 → grająca ostre rockowe solo, na której struny z góry skapują wielkie truskawkowe...': '7. GUITAR 🎸 → shredding a rock solo, while onto its strings drip giant strawberry...',
  'Wielka zaleta łańcucha: skupiasz się ZAWSZE tylko na bieżącej parze ogniw (A i B). Reszta przyjdzie sama!': 'The great power of the chain: ALWAYS focus solely on the active pair of links (A and B). The rest follows!',
  'Budujemy kolejne 4 fascynujące ogniwa:': 'We forge the next 4 fascinating links:',
  '8. LODY 🍦 → wgryzasz się w lody i nagle zgrzytasz zębami o zamrożony w środku złoty...': '8. ICE CREAM 🍦 → you bite into the ice cream and crunch your teeth on a frozen golden...',
  '9. KLUCZ 🔑 → wyjmujesz klucz, a w ciemności rozświetla go silnym laserowym snopem potężna...': '9. KEY 🔑 → you pull the key out, and in the darkness it is lit by a powerful beam from a...',
  '10. LATARKA 🔦 → promień latarki pada w głąb jaskini i ukazuje olbrzymi, błyszczący...': '10. FLASHLIGHT 🔦 → the beam shines deep into the cave revealing an enormous, glittering...',
  '11. SKARB 💎 → pełen diamentów i złota, którego z groźnym rykiem pilnuje zielony...': '11. TREASURE 💎 → filled with diamonds and gold, guarded with a ferocious roar by a green...',
  'Mózg uwielbia opowieści z rozmachem – im bardziej fantastyczne, tym silniejszy ślad pamięciowy!': 'The brain loves grand stories – the more fantastical, the deeper the memory trace!',
  'Łączymy kolejne 4 ogniwa kosmicznej podróży:': 'We connect the next 4 links of our cosmic journey:',
  '12. SMOK 🐉 → macha skrzydłami, zieje ogniem i z rykiem odpala kosmiczną...': '12. DRAGON 🐉 → flaps its wings, breathes flame, and ignites a cosmic...',
  '13. RAKIETĘ 🚀 → która z rykiem silników leci prosto w kosmos i ląduje na srebrzystym...': '13. ROCKET 🚀 → roaring its engines into outer space and touching down on the silvery...',
  '14. KSIĘŻYCU 🌙 → który po wbiciu flagi okazuje się w całości zrobiony ze smakowitego, żółtego...': '14. MOON 🌙 → which turns out to be made entirely of delicious, yellow Swiss...',
  '15. SERA 🧀 → z wielkimi dziurami, w których biega i wygryza kawałki wesoła polna...': '15. CHEESE 🧀 → with giant holes where scurries and nibbles a cheerful little...',
  'Dopinamy ostatnie ogniwa do pełnej liczby DWUDZIESTU:': 'We snap in the final links up to the full TWENTY:',
  '16. MYSZ 🐭 → wystraszona ucieka i z impetem skacze wysoko na sprężystą...': '16. MOUSE 🐭 → startled, leaps high onto a bouncy...',
  '17. TRAMPOLINĘ 🎪 → która wystrzeliwuje mysz jak z procy prosto w wielki czekoladowy...': '17. TRAMPOLINE 🎪 → launching the mouse like a slingshot right into a giant chocolate...',
  '18. TORT 🎂 → na którego samym szczycie płonie woskowa...': '18. CAKE 🎂 → atop of which flickers a wax...',
  '19. ŚWIECA 🕯️ → której gorący wosk zastyga w magiczny, lśniący...': '19. CANDLE 🕯️ → whose hot wax hardens into a magical, glittering...',
  '20. KRYSZTAŁ 🔮 → odbijający w środku całą naszą niesamowitą przygodę!': '20. CRYSTAL 🔮 → reflecting our entire incredible adventure within!',
  'SUPERMOC: Ten łańcuch działa w obie strony! Cofnij się od końca:': 'SUPERPOWER: This chain works both ways! Trace it backwards from the end:',
  'Spójrz na to, czego dokonałeś bez ani jednej kartki papieru:': 'Look at what you achieved without a single scrap of paper:',
  '11. Skarb 💎 → 12. Smok 🐉 → 13. Rakieta 🚀 → 14. Księżyc 🌙 → 15. Ser 🧀 →': '11. Treasure 💎 → 12. Dragon 🐉 → 13. Rocket 🚀 → 14. Moon 🌙 → 15. Cheese 🧀 →',
  '16. Mysz 🐭 → 17. Trampolina 🎪 → 18. Tort 🎂 → 19. Świeca 🕯️ → 20. Kryształ 🔮.': '16. Mouse 🐭 → 17. Trampoline 🎪 → 18. Cake 🎂 → 19. Candle 🕯️ → 20. Crystal 🔮.',
  'Każde ogniwo nieuchronnie pociąga kolejne. Możesz w ten sposób zapamiętać przemówienie, procedurę czy 20 sprawunków na zakupy!': 'Each link inevitably pulls the next. You can memorize speeches, procedures, or 20 grocery items this way!',
  'Kolejne dwie cyfry to najprostsza zabawa w skojarzenia kształtów:': 'The next two digits are the easiest game of shape association:',
  '• 2 = N – małe „n” ma DWA brzuszki / dwie nóżki stojące na ziemi.': '• 2 = N – lowercase \'n\' has TWO downstrokes standing on the ground.',
  '• 3 = M – małe „m” ma TRZY nóżki (raz, dwa, trzy!).': '• 3 = M – lowercase \'m\' has THREE downstrokes (one, two, three!).',
  'To najprostsza zasada wizualna w całym systemie!': 'This is the simplest visual rule in the entire system!',
  'Gdy w numerze telefonu lub dacie widzisz 2 → myślisz o N (np. Nos, Nóż).': 'Whenever you see 2 in a number → think of N (e.g. Nose, Net).',
  '• 4 = R – powiedz głośno słowo „czteRy” – słyszysz to mocne, dźwięczne R na końcu?': '• 4 = R – say \'fouR\' out loud – hear that strong, clear R at the end?',
  '• 5 = L – spójrz na dłoń: kciuk i palec wskazujący tworzą kształt litery L, a cała dłoń ma 5 palców! (Rzymskie L to też 50).': '• 5 = L – look at your hand: thumb and index finger make an L shape, and a hand has 5 fingers! (Roman L is 50).',
  'Poznajemy szóstkę i siódemkę:': 'Meeting six and seven:',
  '• 6 = J, SZ, CZ – powiedz „Sześć” – to najbardziej szeleszcząca cyfra w języku polskim! (A litera J to 6. spółgłoska alfabetu).': '• 6 = J, SH, CH – soft hissing sounds! (And lowercase j is a flipped 6).',
  '• 7 = K, G – wyobraź sobie dwie cyfry 7 przytknięte do siebie plecami – tworzą ostre ramiona litery K!': '• 7 = K, G – imagine two 7s back to back – they form the sharp arms of letter K!',
  'Domykamy cały alfabet cyfr:': 'Completing the digit alphabet:',
  '• 8 = F, W – pisana mała literka „f” ma dwie pętelki na górze i na dole, dokładnie jak cyfra 8.': '• 8 = F, V – cursive lowercase \'f\' has two loops, top and bottom, just like digit 8.',
  '• 9 = P, B – cyfra 9 w lustrze wygląda jak litera P, a gdy obróci się ją do góry nogami – jak małe b!': '• 9 = P, B – digit 9 in a mirror looks like P, and flipped upside down – like lowercase b!',
  'Gratulacje! Znasz już całe 0 do 9:': 'Congratulations! You know all 0 through 9:',
  'Po co nam samogłoski (A, E, I, O, U, Y)?': 'Why do we need vowels (A, E, I, O, U, Y)?',
  'W systemie Major samogłoski NIE MAJĄ żadnej cyfry – są jak darmowy klej albo plastelina!': 'In the Major system, vowels carry NO numbers – they are like free glue or modeling clay!',
  'Dzięki temu możesz wstawić DOWOLNE samogłoski między spółgłoski, by utworzyć sensowne, barwne słowo!': 'This allows you to insert ANY vowels between consonants to form meaningful, vibrant words!',
  'Spójrz na liczbę 71:': 'Look at number 71:',
  '• Wkładasz samogłoskę „O” w środek → powstaje puszysty KOT!': '• Insert vowel \'A\' in the middle → you get a fluffy CAT!',
  'Zamiast pamiętać nudne liczby, pamiętasz wyraziste obrazy (kołki pamięciowe):': 'Instead of remembering dry digits, you remember vivid objects (memory pegs):',
  '• 47 = R(4) + K(7) = szczypiący RAK 🦞': '• 47 = R(4) + K(7) = solid ROCK 🪨',
  '• 91 = B(9) + T(1) = skórzany BUT 👞': '• 91 = B(9) + T(1) = wooden BOAT ⛵',
  'Twój nowy kod PIN do telefonu lub karty to: 7114.': 'Your new PIN code is: 7114.',
  'Dzielimy go na dwa 2-cyfrowe kołki:': 'We split it into two 2-digit pegs:',
  'Łączymy je w żywą scenę: Gigantyczny KOT leży na TORACH i łapą zatrzymuje pociąg!': 'We fuse them into a vivid scene: A giant CAT lies on TRAIN tracks stopping the locomotive with a paw!',
  'Po co nam ta technika? W szkole i pracy uczono nas pisać notatki linijka pod linijką, od góry do dołu, jednym kolorem długopisu. Dla naszego mózgu taki jednolity blok tekstu jest szary i nudny – po 10 minutach czytania oczy się męczą, a treść wylatuje z głowy.': 'Why do we need this technique? In school and work, we were taught line-by-line notes, top to bottom in monochrome ink. For our brain, such a uniform text block is dull and gray – after 10 minutes, eyes tire and recall evaporates.',
  'Twój mózg nie myśli w prostych liniach! Myśli promieniście – od jednego kluczowego pomysłu wybuchają we wszystkich kierunkach setki powiązanych skojarzeń, dokładnie tak, jak rozchodzą się macki ośmiornicy lub promienie słońca!': 'Your brain does not think in straight lines! It thinks radiantly – from one core idea, hundreds of associations explode in all directions, just like octopus tentacles or sunbeams!',
  'Gdy słyszysz słowo „PIES”, nie wyświetla Ci się w głowie czarny napis P-I-E-S na białym tle, prawda? Widzisz merdający ogon, słyszysz szczekanie, przypominasz sobie spacer w parku i miękką sierść!': 'When you hear the word \'DOG\', you don\'t see black letters D-O-G on white paper, do you? You see a wagging tail, hear a bark, recall a sunny park walk, and feel soft fur!',
  'Po co nam ta zasada? Najczęstszy błąd to położenie kartki pionowo i wpisanie w kółeczku nudnego słowa długopisem. Taka notatka nie ma siły przyciągania.': 'Why this rule? The common beginner mistake is placing the paper portrait and writing a dry word in a pen circle. That note has zero magnetic pull.',
  'Oto 3 żelazne reguły centrum mapy:': 'Here are 3 iron rules for the center of the map:',
  '1. 📐 Kartka ZAWSZE poziomo (orientacja pejzażowa): Nasze oczy są ułożone obok siebie, dlatego naturalne pole widzenia człowieka to panorama 16:9, a nie pionowa szczelina!': '1. 📐 Paper ALWAYS landscape: Our eyes sit side by side, making human vision panoramic (16:9), not a narrow vertical slit!',
  '2. 🎨 Kolorowy OBRAZ w centrum zamiast samego tekstu: Użyj co najmniej 3 różnych kolorów. Obraz jest przetwarzany przez korę wzrokową tysiące razy szybciej niż litery.': '2. 🎨 Colorful IMAGE at the center: Use at least 3 distinct colors. Images are processed by the visual cortex thousands of times faster than text.',
  'Po co nam ta zasada? Gdy stajemy przed trudnym egzaminem, grubą książką lub wielkim projektem, czujemy przytłoczenie ogromem materiału. Kluczem do opanowania chaosu jest kategoryzacja.': 'Why this rule? Facing hard exams, thick books, or huge projects brings overwhelm. The master key to conquering chaos is categorization.',
  'Od centralnego obrazu wypuszczamy grube, organiczne gałęzie (najlepiej 3 do 7 głównych ramion, zgodnie z magiczną liczbą George’a Millera 7 ± 2). Każda gałąź odpowiada jednemu wielkiemu filarowi tematu.': 'From the central image we sprout thick, organic branches (ideally 3 to 7 limbs, following Miller\'s magic number 7 ± 2). Each branch represents one grand pillar of the subject.',
  'Zasady głównych ramion:': 'Rules of the main branches:',
  '• Łączą się bezpośrednio z centrum – są najgrubsze u nasady, dokładnie jak gałęzie wyrastające z pnia drzewa.': '• Connect directly to the center – thickest at the trunk, just like natural tree boughs.',
  '• Są faliste i organiczne – mózg nie znosi prostych linii rysowanych od linijki, bo w naturze nie ma linii idealnie prostych!': '• Wavy and organic – the brain dislikes rigid ruler lines, as pure straight lines do not exist in nature!',
  'Po co nam ta zasada? Najczęstszym błędem początkujących jest wciskanie na gałęzie całych zdań z podręcznika. Kiedy zapiszesz całe zdanie, Twój mózg staje się leniwy – przestaje myśleć i zaczyna czytać jak automat.': 'Why this rule? Beginners often cram full textbook sentences onto branches. When you write a full sentence, your brain goes passive – it stops thinking and reads like an automaton.',
  'Na każdej gałęzi i pod-gałęzi umieszczamy tylko JEDNO SŁOWO-KLUCZ (rzeczownik lub czasownik).': 'On every branch and twig, place only ONE KEYWORD (a noun or active verb).',
  'Zobacz spektakularną różnicę:': 'See the spectacular difference:',
  '• Nudna notatka: „Układ Słoneczny powstał około 4,6 miliarda lat temu w wyniku grawitacyjnego zapadnięcia się obłoku molekularnego.” (18 słów, zasypiasz po przeczytaniu).': '• Dull note: "The Solar System formed around 4.6 billion years ago from gravitational collapse of a molecular cloud." (18 words, sleep-inducing).',
  '• Mapa myśli: Gałąź „Powstanie” → odnoga „4,6 mld lat ⏳” → odnoga „Zapada obłok 🌌”.': '• Mind map: Branch "Formation" → twig "4.6B yrs ⏳" → twig "Collapsing cloud 🌌".',
  'Po co nam rysunki? Badania neuropsychologiczne dowodzą, że ludzki mózg przetwarza obrazy aż 60 000 razy szybciej niż tekst pisany! Pismo powstało zaledwie kilka tysięcy lat temu, ale wzrok i rozpoznawanie kształtów rozwijały się przez miliony lat ewolucji.': 'Why drawings? Neuropsychological studies prove the human brain processes images 60,000 times faster than text! Writing is a few millennia old, while vision evolved over millions of years.',
  'Nie musisz mieć talentu plastycznego! W mapach myśli używamy prostych piktogramów:': 'No artistic talent required! In mind maps we use simple pictograms:',
  '• 💡 Żarówka = Pomysł, odkrycie, innowacja': '• 💡 Lightbulb = Idea, discovery, innovation',
  '• ⚡ Błyskawica = Energia, szybkość, zagrożenie': '• ⚡ Lightning = Energy, speed, danger',
  '• 💰 Worek złota = Koszt, zysk, budżet': '• 💰 Moneybag = Cost, profit, budget',
  '• 🔍 Lupa = Analiza, badanie, szczegół': '• 🔍 Magnifier = Analysis, study, detail',
  'Po co nam kolory? W naturze kolor niesie kluczowe informacje: dojrzały owoc jest czerwony, woda błękitna, liście zielone, a drapieżnik ma kontrastowe paski. Monochromatyczne, czarno-białe notatki nasz mózg odbiera jak martwe tło.': 'Why colors? In nature, color carries vital cues: ripe fruit is red, water blue, leaves green, and predators wear contrasting stripes. Monotone notes are received as static dead background.',
  'Żelazna zasada kolorowania mapy myśli:': 'Iron rule of mind map coloring:',
  'Każde główne ramię (oraz WSZYSTKIE odchodzące od niego cieńsze gałązki) rysujemy TYM SAMYM, DEDYKOWANYM KOLOREM!': 'Draw each primary branch (and ALL its offshoot twigs) using THE EXACT SAME DEDICATED COLOR!',
  '• Ramię Niebieskie 🌊 → Wszystkie odnogi i napisy są niebieskie': '• Blue Branch 🌊 → All offshoots and labels are blue',
  '• Ramię Zielone 🌿 → Wszystkie odnogi i napisy są zielone': '• Green Branch 🌿 → All offshoots and labels are green',
  '• Ramię Czerwone 🔥 → Wszystkie odnogi i napisy są czerwone': '• Red Branch 🔥 → All offshoots and labels are red',
  '• Ramię Fioletowe 🔮 → Wszystkie odnogi i napisy są fioletowe': '• Purple Branch 🔮 → All offshoots and labels are purple',
  'Po co nam ta zasada? W każdym temacie oprócz wielkich kategorii istnieją konkretne daty, nazwiska, wzory i liczby. Jeśli wrzucimy je w jedno miejsce, powstanie nieczytelny kłąb myśli.': 'Why this rule? Beyond big categories exist precise dates, names, formulas, and figures. Lumped together, they form an illegible knot of thoughts.',
  'W profesjonalnej mapie myśli stosujemy hierarchię grubości linii:': 'In professional mind maps we implement line thickness hierarchy:',
  '1. Poziom 1 (Konary główne): Bardzo grube, organiczne linie dotykające centrum. Niosą nadrzędne działy.': '1. Level 1 (Main Boughs): Very thick organic lines touching the center, carrying overarching themes.',
  '2. Poziom 2 (Pod-gałęzie): Średniej grubości linie wypływające z konarów. Niosą podkategorie.': '2. Level 2 (Sub-branches): Medium-thick lines flowing from boughs, carrying subcategories.',
  '3. Poziom 3 (Drobne gałązki): Cienkie linie na samym brzegu kartki. Niosą konkretne fakty, daty, nazwiska i liczby.': '3. Level 3 (Slender Twigs): Thin lines at the outer perimeter, carrying precise facts, dates, names, and figures.',
  'Po co nam ta zasada? Początkujący często obracają kartkę i piszą litery pionowo lub do góry nogami wzdłuż wygiętej gałęzi. Kiedy potem próbują powtórzyć materiał, muszą kręcić głową jak sowa!': 'Why this rule? Beginners often spin the sheet, writing vertically or upside down. Later when studying, they have to twist their heads like owls!',
  'Oto 3 reguły ergonomii wzrokowej:': 'Here are 3 rules of visual ergonomics:',
  '1. ✍️ Zawsze pismo poziome: Wszystkie słowa leżą na gałęziach w taki sposób, byś mógł je przeczytać bez przekrzywiania głowy i bez obracania kartki.': '1. ✍️ Always horizontal lettering: All words rest on branches readable without tilting your head or turning the paper.',
  '2. 🔤 Litery drukowane: Drukowane litery (blokowe) mają wyraźne, ostre kontury. Mózg rejestruje je w 10 milisekund, podczas gdy pismo odręczne z zawijasami wymaga ciągłego odszyfrowywania.': '2. 🔤 Print lettering: Print block letters have sharp contours. The brain registers them in 10ms, while messy cursive demands deciphering.',
  'Jak przełożyć gęsty materiał z podręcznika lub raportu na mapę myśli? Oto niezawodny 4-etapowy proces Ośmiornicy Inki:': 'How to translate dense textbook chapters into a mind map? Here is Inky\'s reliable 4-step process:',
  '1. 🔎 Szybki przegląd (Skimming): Zanim zaczniesz pisać, przekartkuj cały rozdział. Zwróć uwagę na nagłówki, pogrubienia, wykresy i podsumowanie na końcu. Zobacz, o czym w ogóle jest tekst.': '1. 🔎 Skimming: Skim the entire chapter before writing. Note headings, bold text, diagrams, and summaries to grasp the big picture.',
  '2. 🎯 Obraz centralny: Połóż kartkę A4 poziomo. Narysuj na środku symbol tematu (np. dla działu „Starożytny Rzym” narysuj rzymski hełm legionisty 🏛️).': '2. 🎯 Central Image: Place an A4 sheet landscape. Draw a central symbol of the topic (e.g. Roman helmet for \'Ancient Rome\' 🏛️).',
  '3. 🌳 4-6 głównych konarów: Każdy podrozdział książki staje się jednym ramieniem: 1. Ustrój, 2. Legiony, 3. Architektura, 4. Upadek.': '3. 🌳 4-6 Main Boughs: Each subchapter becomes one limb: 1. Government, 2. Legions, 3. Architecture, 4. Fall.',
  '4. 🌿 Odnogi ze słowami-kluczami: Przeczytaj tekst akapit po akapicie i wyłapuj tylko esencję: nazwiska, daty bitew, wynalazki (np. akwedukty, drogi, beton).': '4. 🌿 Twigs with Keywords: Read paragraph by paragraph, extracting pure essence: names, dates, inventions (aqueducts, roads, concrete).',
  'Gratulacje! Przeszedłeś kompletną drogę nielinearnego myślenia. Ostatnia wielka supermoc mapy myśli to publiczne wystąpienia bez czytania z kartki.': 'Congratulations! You completed the full journey of radiant thinking. The final superpower of mind mapping is note-free public speaking.',
  'Dlaczego prelegenci czytający z kartek wypadają nudno? Bo nie mają kontaktu wzrokowego ze słuchaczami! Czytają zdanie po zdaniu z głową w dół.': 'Why are speakers reading from sheets so dull? They lack audience eye contact! They read sentence by sentence with their heads down.',
  'Gdy przygotujesz prezentację w formie mapy myśli:': 'When you design a speech as a mind map:',
  '1. W centrum masz temat wystąpienia 🎯': '1. At the center is your speech theme 🎯',
  '2. Masz tylko 4 główne ramiona: Wstęp (problem), Rozwiązanie, Przykłady, Wnioski (wezwanie do działania).': '2. You have only 4 primary branches: Intro (problem), Solution, Case Studies, Conclusion (call to action).',
  '3. Wychodzisz na scenę lub przed tablicę. Nie masz ze sobą kartek. Zamykasz oczy na ułamek sekundy i WIDZISZ całą mapę przed oczami!': '3. Step on stage with zero notes. Close your eyes for a split second and you clearly SEE the entire map in your mind!',
  'Mówisz swobodnie, własnymi słowami, uśmiechasz się i patrzysz prosto w oczy słuchaczom. Płyniesz od gałęzi do gałęzi jak ryba w oceanie!': 'You speak naturally, smile, and make direct eye contact. You glide effortlessly from branch to branch like a dolphin in the ocean!',
  'Ćwiczymy całą pętlę pamięciową dla 3 gości:': 'We practice the complete memory loop for 3 guests:',
  '1. Marek → złote okulary → MARKER zamalowuje szkła!': '1. Mark → golden glasses → neon MARKER colors the lenses!',
  'Wchodzimy do większego salonu! Poznaj kolejne dwie wspaniałe osoby:': 'Entering a larger parlor! Meet two more wonderful people:',
  '• Kasia (projektantka) → fioletowe włosy & kolczyk w nosie → pije gorące KAKAO, a kolczyk brzęczy!': '• Katie (designer) → purple hair & nose ring → drinks hot COCOA as her piercing rings!',
  'Brawo! Znasz już kompletną metodę zapamiętywania każdego człowieka:': 'Bravo! You now command the complete method for remembering any person:',
  '1. Zauważ kotwicę (okulary, broda, monokl, opaska, muszka).': '1. Spot the anchor (glasses, beard, monocle, headband, bow tie).',
  '2. Zamień imię na most fonetyczny (Basia=Bas, Marek=Marker, Piotr=Pióro).': '2. Convert name into a phonetic bridge (Barbara=Bass, Mark=Marker, Peter=Quill).',
  '3. Zobacz szaloną interakcję kotwicy z mostem w swojej wyobraźni.': '3. Envision the wild interaction between anchor and bridge in your imagination.',
  'Po co nam ta metoda? Zwykłe powtarzanie angielskich słówek po 50 razy w zeszycie jest nudne, męczące i szybko ulatuje z głowy.': 'Why this method? Repeating foreign words 50 times in a notebook is tiring, boring, and quickly forgotten.',
  'Metoda słów-kluczy (Keyword Method) to sekret poliglotów i mistrzów pamięci na całym świecie!': 'The Keyword Method is the secret of polyglots and memory champions worldwide!',
  'Składa się z 2 prostych, zabawnych kroków:': 'It consists of 2 simple, fun steps:',
  '1. Znajdź polskie słowo, które brzmi podobnie do angielskiego wyrazu (to nasz Most Fonetyczny).': '1. Find a sound-alike word in your language (our Phonetic Bridge).',
  '2. Połącz ten dźwięk ze znaczeniem słówka w śmieszną, bajkową scenkę w wyobraźni!': '2. Connect that acoustic sound with the word\'s meaning in a hilarious fairy-tale mental scene!',
  'Krok 1 w praktyce: szukamy dźwiękowego bliźniaka.': 'Step 1 in practice: discovering the acoustic twin.',
  'Spójrz na angielskie słówko „mushroom” (grzyb).': 'Look at the foreign word "mushroom".',
  'Powiedz je na głos: „masz-rum”.': 'Say it out loud: "mush-room".',
  'Brzmi dokładnie jak polskie pytanie: „MASZ RUM?!” 🏴‍☠️': 'Sounds just like "champion" or pirate asking for rum! 🏴‍☠️',
  'Mamy już most „MASZ RUM” i wiemy, że mushroom oznacza GRZYB.': 'We have our sound bridge and know that mushroom means mushroom.',
  'Teraz najważniejszy moment – zrób z tego film przed oczami:': 'Now the most crucial moment – make a mental movie before your eyes:',
  'Wielki leśny prawdziwek z wąsami i w trójkątnym kapeluszu pirata staje przed Tobą, uderza pięścią w stół i groźnie krzyczy: „MASZ RUM W BUTELCE?!”': 'A boxing champion in gloves enters the ring and bites into a giant mushroom for energy!',
  'Poczuj zapach lasu i zobacz tego śmiesznego grzyba.': 'Smell the fresh forest and see that hilarious mushroom.',
  'Ćwiczymy kolejne angielskie mosty dźwiękowe:': 'Practicing more foreign sound bridges:',
  '• CANDLE (świeca) → KUNDEL: wesoły kundelek biegnie z płonącą świecą na ogonie! 🕯️': '• CANDLE → chandelier / candelabra: a dog running with a blazing candle on its tail! 🕯️',
  '• FEATHER (pióro) → SWETER: z wełnianego swetra nagle wyrastają wielkie gęsie pióra! 🪶': '• FEATHER → fedora: goose feathers sprouting directly out of a stylish hat! 🪶',
  'Poznajemy kolejne 3 angielskie perełki z naszej bogatej puli ponad 100 wyrazów:': 'Meeting 3 more gems from our rich pool of over 100 words:',
  '• SHARK (rekin) → SZARIK: groźny rekin w wodzie macha przyjaźnie ogonem i szczeka jak pies Szarik! 🦈': '• SHARK → a pet dog swimming with a giant shark fin barking at fish! 🦈',
  '• BEETLE (chrząszcz) → BITELSI: cztery chrząszcze w garniturach grają rocka jak zespół The Beatles! 🪲': '• BEETLE → The Beatles: four beetles in suits rocking guitars on stage! 🪲',
  'Brawo! Masz w ręku najpotężniejsze narzędzie do nauki języka angielskiego na świecie.': 'Bravo! You now hold the most powerful tool for learning foreign vocabulary in the world.',
  'Gdy w szkole, filmie czy w podróży spotkasz nowe angielskie słówko:': 'Whenever you encounter a new word at school, in a movie, or while traveling:',
  '1. Usłysz jego dźwięk i znajdź polskiego bliźniaka.': '1. Hear its sound and find an acoustic sound-alike twin.',
  '2. Stwórz wyrazistą, zabawną scenkę.': '2. Create a striking, comical scene linking sound to meaning.',
  'Cześć! Jestem Żółwik Zenon 🐢. Nigdy się nie spieszę, bo znam sekret czasu! Czy wiesz, że możesz w 2 sekundy odgadnąć, w jaki dzień tygodnia wypadną Twoje urodziny, Boże Narodzenie w 2026, a nawet data w 2035 roku? Pokażę Ci tę niezwykłą sztuczkę!': 'Hi! I\'m Clockwork Turtle 🐢. I never rush because I hold the secret of time! Did you know you can tell in 2 seconds what weekday your birthday or Christmas will fall on? I\'ll teach you this trick!',
  'Oto najłatwiejsza reguła na świecie: daty parzyste to lustrzane bliźniaki w każdym roku!': 'Here is the simplest rule on earth: even dates are mirror twins in every single year!',
  'A co z miesiącami nieparzystymi? Mamy na nie wesołą rymowankę o stacji benzynowej i liczbie Pi!': 'What about odd months? We have a cheerful rhyme about 7-Eleven, 9 to 5, and Pi Day!',
  'Teraz połączymy kropki! Zobacz, jak w 3 prostych krokach policzyć dowolną datę w roku!': 'Now we connect the dots! See how in 3 simple steps you calculate any date in the year!',
  'A teraz prawdziwa magia: Podróżnik w czasie! Nauczę Cię błyskawicznie znajdować kotwicę dla dowolnego innego roku!': 'Now for true magic: Time Traveler! I will teach you to find the anchor for any other year!',
  'Wielki Finał u Żółwika Zenona! Jesteś gotów na dowolny rok – przeszły, teraźniejszy i przyszły! 🐢⏳': 'Grand Finale with Clockwork Turtle! You are ready for any year – past, present, and future! 🐢⏳',
  'Abrakadabra! Cześć, jestem Szop Magik! 🦝 Czy wiesz, jak iluzjoniści pamiętają całą talię kart w kilkadziesiąt sekund? Zamieniają nudne figury w superbohaterów i kręcą z nich bajkowy film! Pokażę Ci, jak to zrobić!': 'Abracadabra! Hi, I\'m Bandit the Magician! 🦝 Know how illusionists memorize a deck of cards in seconds? They turn cards into superheroes and make an epic movie! Let me show you!',
  'Oto nasi bohaterowie! Każda figura zamienia się w żywą postać z bajki!': 'Meet our heroes! Every court card turns into a living, vibrant character!',
  'Sekret rekordzistów Guinnessa: formuła PAO! Trzy karty zamieniamy w jedną bajkę!': 'The secret of Guinness record holders: the PAO formula! Three cards become one vivid scene!',
  'Połączmy dwie karty w jedną scenę! Król Artur i Kleopatra robią coś szalonego!': 'Let’s fuse two cards into one scene! King Arthur and Cleopatra do something wildly memorable!',
  'Prawdziwe rozdanie na stole! Trzy karty zapamiętane w 3 sekundy!': 'A real deal on the table! Three cards memorized in 3 seconds!',
  'Wielki egzamin iluzjonisty! Twoja pamięć jest teraz szybsza niż zręczne dłonie magika!': 'Grand illusionist exam! Your memory is now swifter than the sleight of hand of a magician!',
  'Chrup, chrup! Cześć! Jestem Wiewiórka Basia 🐿️ Zawsze wiem, gdzie schowałam każdy orzeszek! Nauczę Cię metody łańcucha skojarzeń – dzięki niej zapamiętasz całą listę aż 20 rzeczy bez ani jednej kartki papieru!': 'Crunch, crunch! Hi! I\'m Hazel the Squirrel 🐿️ I always know where every acorn is buried! I\'ll teach you the link method to memorize 20 items without a scrap of paper!',
  'Włączamy zmysły! Zobacz, jak zegar porywa balon na kaktus, a gitara gra rocka w lodach!': 'Engage your senses! See how a clock pops a balloon onto a cactus, and a guitar shreds in ice cream!',
  'Mamy już 12 ogniw! W lodach tkwi klucz, latarka rozświetla skarb, a w jaskini czuwa smok!': 'Now 12 links! Ice cream holds a key, flashlight illuminates treasure, and a dragon guards the cave!',
  'Kosmiczny lot u Basi! Smok odpala rakietę i ląduje na księżycu z sera! To już 16 ogniw!': 'Cosmic flight with Hazel! Dragon ignites a rocket landing on a cheese moon! That is 16 links!',
  'Mamy komplet 20 ogniw! A teraz najfajniejsza supermoc: odtworzymy wszystko od tyłu!': 'Full set of 20 links! Now the coolest superpower: recalling everything backward!',
  'Wielki Finał u Wiewiórki Basi! Właśnie nauczyłeś się listy 20 wyrazów w idealnym porządku! Jesteś prawdziwym Mistrzem Skojarzeń! 🐿️🏆': 'Grand Finale with Hazel! You just mastered a list of 20 words in flawless order! You are a true Master of Association! 🐿️🏆',
  'Uhuhu! Cześć! Jestem Sówka 🦉 Zastanawiasz się, po co uczyć się tej techniki? Pokażę Ci sekretny kod, dzięki któremu łatwo zapamiętasz numer PIN, PESEL czy ważne daty w szkole – bez nudnego wkuwania!': 'Hoo-hoo! Hi! I\'m Professor Owl 🦉 Wondering why you need this? I\'ll teach you the secret code to easily remember PINs, ID numbers, and history dates without rote cramming!',
  'Świetnie Ci poszło! Zobacz, cyfry 2 i 3 mają swoje ukryte nóżki – dzieci i dorośli zapamiętują je w sekundę!': 'Great job! Digits 2 and 3 have their hidden downstrokes – kids and adults remember them in a second!',
  'Uhuhu! Pora na cyfry 4 i 5. Wsłuchaj się w dźwięki i spójrz na dłoń!': 'Hoo-hoo! Time for digits 4 and 5. Listen to the sounds and look at your hand!',
  'Jesteśmy już w połowie drogi! Szeleszcząca szóstka i kanciaste K czekają na Ciebie!': 'Halfway there! Soft six and angular K are waiting for you!',
  'Ostatni krok alfabetu! Dwie pętelki i obrócona dziewiątka – i cały kod 0-9 masz w małym palcu!': 'Final alphabet step! Two loops and a flipped nine – and the entire 0-9 code is at your fingertips!',
  'Teraz dzieje się magia! Użyjemy samogłosek jak plasteliny do lepienia całych słów!': 'Now magic happens! We use vowels like modeling clay to sculpt whole words!',
  'Uhuhu! Popatrz, jak liczby zamieniają się w trójwymiarowe zabawki w Twojej głowie!': 'Hoo-hoo! Watch numbers turn into 3D objects in your imagination!',
  'Pora na wielki finał! Zobacz, jak w 3 sekundy zapamiętasz 4-cyfrowy PIN do bankomatu lub telefonu na zawsze!': 'Time for the grand finale! Memorize a 4-digit bank or phone PIN in 3 seconds forever!',
  'Plusk! Cześć! Jestem Ośmiornica Inka 🐙. Pokażę Ci, jak mój atrament i 8 macek porządkują każdą wiedzę na świecie!': 'Splash! Hi! I\'m Inky the Octopus 🐙. I\'ll show you how my ink and 8 tentacles organize all knowledge on earth!',
  'Kartka zawsze poziomo! Pole widzenia Twoich oczu jest panoramiczne, dokładnie jak w kinie! 🎬': 'Paper always landscape! Your eyes’ field of vision is panoramic, just like at the movies! 🎬',
  'Spójrz na moje macki! Każda z nich to osobny, gruby konar dla wielkiej kategorii wiedzy! 💡': 'Look at my tentacles! Each is a thick branch for a major category of knowledge! 💡',
  'Koniec z przepisywaniem podręczników! Jedno trafne słowo-klucz uwalnia lawinę pamięci! 🎯': 'No more copying textbooks! One crisp keyword unleashes an avalanche of recall! 🎯',
  'Nie musisz być Picassem! Prosta buźka, żarówka czy strzałka działają cuda! 🎨✨': 'No need to be Picasso! A simple smiley, lightbulb, or arrow works wonders! 🎨✨',
  'Mój atrament ma tysiące barw! 🌈 Kolory to adresy pocztowe w Twojej wyobraźni!': 'My ink has thousands of colors! 🌈 Colors are postal addresses in your imagination!',
  'Każda macka ma przyssawki! Tak samo konar wypuszcza drobniejsze gałązki na fakty i daty! 🌿': 'Every tentacle has suction cups! Just so, boughs sprout slender twigs for facts and dates! 🌿',
  'Koniec z obracaniem kartki o 360 stopni! Notatka ma być czytelna pod każdym kątem! 📐': 'No more rotating the paper 360 degrees! Notes must be readable from any angle! 📐',
  'Wyobraź sobie: 20 stron nudnego podręcznika zredukowane do jednej pięknej kartki A4! 📄✨': 'Imagine: 20 pages of a dry textbook compressed onto a single beautiful landscape sheet! 📄✨',
  'Brawo! Dotarłeś do finału! 🏆 Teraz posiądziesz najcenniejszą umiejętność: swobodne mówienie z pamięci!': 'Bravo! You reached the finale! 🏆 Now you command the ultimate skill: speaking freely from memory!',
  'Pora na małe przyjęcie! Przedstawię Ci troje znajomych – połączmy ich kotwice w żywe scenki!': 'Time for a small party! Meet 3 acquaintances – let’s link their anchors into lively scenes!',
  'Idzie Ci wyśmienicie! Powiększamy grono do 5 osób – Kasia i Tomasz dołączają do zabawy!': 'You are doing wonderfully! Expanding our circle to 5 – Katie and Thomas join the fun!',
  'Wielki finał u Liska! Znasz już całą technikę mistrzów – żaden bankiet ani nowa klasa Cię nie zaskoczy!': 'Grand finale with Rusty! You now master the champions’ technique – no banquet or crowd will ever surprise you!',
  'Cześć, tu Papużka Pola! 🦜 Marzysz o swobodnych podróżach po świecie i piątkach z angielskiego? Pokażę Ci czarodziejski trik ze słowami-kluczami – zapamiętasz każde angielskie słówko w kilka sekund, bez nudnego wkuwania!': 'Hi, Polly the Parrot here! 🦜 Dream of traveling the world and acing foreign languages? I\'ll show you the magic keyword trick – memorize vocabulary in seconds without cramming!',
  'Posłuchaj dźwięków! Każde angielskie słówko ma w języku polskim swojego śmiesznego bliźniaka!': 'Listen to the sounds! Every foreign word has a funny sound-alike twin in your language!',
  'A teraz łączymy dźwięk ze znaczeniem! Zobacz tego pirackiego prawdziwka w swojej wyobraźni!': 'Now we connect sound with meaning! Envision that boxing champion biting a giant mushroom!',
  'Kraaa! Zobacz, jak w minutę zapamiętasz trzy angielskie słówka na klasówkę z angielskiego!': 'Squawk! See how in one minute you memorize three vocabulary words for your test!',
  'Zobacz, jak wesołe są angielskie skojarzenia! Każde słówko to gotowa historyjka!': 'See how fun foreign associations are! Every word is a ready-made story!',
  'Wielki finał u Papużki Poli! Z tą techniką masz w pamięci ponad 100 angielskich słówek!': 'Grand finale with Polly! With this technique, you hold over 100 foreign words in memory!',
  'Jaki dzień tygodnia to 4 kwietnia 2027 roku (pamiętając, że kotwica 2027 to Niedziela)?': 'What weekday is April 4, 2027 (recalling that the 2027 anchor is Sunday)?',
  'Kim jest Król Kier (K♥) w naszym systemie kart?': 'Who is the King of Hearts (K♥) in our card system?',
  'Co oznacza skrót metody PAO?': 'What does the acronym PAO stand for?',
  'Jakie karty koduje scena: „Król Artur rzuca wielkim błękitnym diamentem”?': 'Which cards are encoded by the scene: "King Arthur throws a giant blue diamond"?',
  'Kto strzelał z łuku w naszej scenie (reprezentując Asa Pik)?': 'Who shot with a bow in our scene (representing the Ace of Spades)?',
  'Co wyciąga Szop Magik z cylindra na karcie As Pik?': 'What does Bandit the Magician pull out of his top hat on the Ace of Spades?',
  'W jaki sposób PARASOL łączy się w wyobraźni z ARBUZEM?': 'How does UMBRELLA connect with WATERMELON in your imagination?',
  'Co dzieje się z GITARĄ 🎸 po zderzeniu z kaktusem?': 'What happens to the GUITAR 🎸 after crashing into the cactus?',
  'W jaki sposób KLUCZ 🔑 łączy się w łańcuchu z LATARKĄ 🔦?': 'How does the KEY 🔑 link with the FLASHLIGHT 🔦 in the chain?',
  'Co okazuje się po wylądowaniu rakiety na KSIĘŻYCU 🌙?': 'What is revealed after the rocket touches down on the MOON 🌙?',
  'Co zastyga z wosku płonącej ŚWIECY 🕯️ na torcie, kończąc 20-elementowy łańcuch?': 'What crystallizes from the melted CANDLE 🕯️ wax on the cake, ending our 20-item chain?',
  'Co znajduje się bezpośrednio po SKARBIE (11), a przed RAKIETĄ (13)?': 'What comes immediately after TREASURE (11) and before ROCKET (13)?',
  'Która spółgłoska odpowiada cyfrze 1 w systemie Major?': 'Which consonant corresponds to digit 1 in the Major System?',
  'Jaki dźwięk odpowiada cyfrze 4?': 'Which sound corresponds to digit 4?',
  'Która para spółgłosek odpowiada cyfrze 7?': 'Which pair of consonants corresponds to digit 7?',
  'Jaką liczbę koduje słowo „NOS” (N=2, S=0)?': 'Which number is encoded by the word "NOSE" (N=2, S=0)?',
  'Które słowo poprawnie koduje liczbę 14 (1=T, 4=R)?': 'Which word correctly encodes number 14 (1=T, 4=R)?',
  'Czym różni się naturalne myślenie promieniste mózgu od tradycyjnych notatek linearnych?': 'How does radiant brain thinking differ from traditional linear notes?',
  'Dlaczego kartkę do mapy myśli kładziemy ZAWSZE w poziomie (orientacja pejzażowa)?': 'Why do we ALWAYS position paper landscape for a mind map?',
  'Jak powinny wyglądać główne gałęzie wychodzące z centrum mapy myśli?': 'How should the primary branches radiating from the center appear?',
  'Dlaczego na gałęziach mapy myśli umieszczamy pojedyncze słowa-klucze zamiast całych zdań?': 'Why do we place single keywords instead of full sentences on mind map branches?',
  'Dlaczego uzupełnienie słów-kluczy małymi symbolami i piktogramami tak potężnie wzmacnia pamięć?': 'Why does accompanying keywords with pictograms boost memory so powerfully?',
  'W jaki sposób zasada „jedno ramię = jeden unikalny kolor” pomaga podczas egzaminu lub testu?': 'How does the rule "one branch = one unique color" help during an exam?',
  'Gdzie na mapie myśli umieszczamy konkretne liczby, daty i nazwiska szczegółowe?': 'Where on a mind map do we place precise numbers, dates, and detailed names?',
  'W jaki sposób powinny być zapisane słowa na gałęziach mapy myśli, by zapewnić maksymalną czytelność?': 'How should words be written along mind map branches for maximum legibility?',
  'Jaki jest pierwszy krok procesu syntezy 20 stron podręcznika do mapy myśli?': 'What is the first step in synthesizing 20 textbook pages into a mind map?',
  'Dlaczego mapa myśli pozwala na znacznie lepsze wystąpienie publiczne niż tradycyjny tekst na kartce?': 'Why does a mind map enable a far superior public speech compared to reading from notes?',
  'Kto ukrył krzyżacki miecz w swojej wielkiej czarnej brodzie?': 'Who hid a sword in his massive black beard?',
  'Jak ma na imię ta osoba z fioletowymi włosami i kolczykiem?': 'What is the name of the person with purple hair and a piercing?',
  'Kto nosi złoty monokl, wąsy i pisze gęsim PIÓREM?': 'Who wears a golden monocle, mustache, and writes with a feather QUILL?',
  'Z jakich dwóch kroków składa się metoda słów-kluczy w nauce angielskiego?': 'What are the two steps of the keyword method in language learning?',
  'Jaki polski zwrot brzmi niemal identycznie jak angielskie słówko „mushroom”?': 'What sound-alike word resembles foreign "mushroom"?',
  'Co oznacza angielskie słówko „mushroom”?': 'What does foreign "mushroom" mean?',
  'KUNDEL niosący świecę na ogonie pomaga zapamiętać słówko:': 'A dog carrying a candle helps remember the word:',
  'FOKA żonglująca na nosie widelcem pomaga zapamiętać angielskie słowo:': 'A seal juggling a fork on its nose helps remember the word:',
  'Co oznacza angielskie słówko „shark” (most: pies SZARIK machający ogonem w płetwie rekina)?': 'What does "shark" mean (bridge: pet dog swimming in a shark fin)?',
  'Wystarczy połączyć litery w słowo ADEK: witaminy A, D, E oraz K!': 'Simply combine the letters into ADEK: vitamins A, D, E, and K!',
  'Edek (1), Hoduje (2), Gołębie (3), Dla (4), Agaty (5), Ewy (6 -> E)!': 'Eddie (1), Ate (2), Dynamite (3), Good (4), Bye (5), Eddie (6 -> E)!',
  'Król (Królestwo), Tybetański (Typ), Gryzł (Gromada)!': 'Domain, Kingdom, Phylum, Class!',
  'Mózg kocha humor i żywe obrazy – im zdanie jest bardziej zabawne i niezwykłe, tym silniejszy ślad pamięciowy!': 'The brain loves humor and vivid imagery – the more entertaining, the deeper the memory trace!',
  'Poniedziałek to 1, Wtorek 2, Środa 3, Czwartek 4, Piątek to 5!': 'Monday is 1, Tuesday 2, Wednesday 3, Thursday 4, Friday is 5!',
  'Miesiąc parzysty: numer miesiąca = numer dnia (8.08)!': 'Even month: month number = day number (8/8)!',
  'Od 9 do 5: 9. dzień 5. miesiąca = 9 maja!': 'From 9 to 5: 9th day of 5th month = May 9!',
  'Sobota + 1 dzień = Niedziela; Sobota + 2 dni = Poniedziałek!': 'Saturday + 1 day = Sunday; Saturday + 2 days = Monday!',
  'Każdy normalny rok przesuwa kotwicę o 1 dzień w przód: Sobota + 1 = Niedziela!': 'Each standard year advances the anchor by 1 day: Saturday + 1 = Sunday!',
  '4.04 to kwietniowa kotwica – w 2027 roku przypada dokładnie w dzień kotwicy: Niedzielę!': '4/4 is the April anchor – in 2027 it falls on Sunday!',
  'Karo to kształt diamentu – kojarzy się z bogactwem i skarbami!': 'Diamonds are shaped like gems – associated with wealth and treasure!',
  'Kier to czerwone serce i rycerski Król Artur!': 'Hearts is the glowing red heart and noble King Arthur!',
  'Pamiętasz: Postać wykonuje Akcję z Obiektem!': 'Remember: Person performs Action with Object!',
  'Król Artur (K♥) wykonuje akcję diamentu Kleopatry (Q♦)!': 'King Arthur (K♥) performs the diamond throw action of Cleopatra (Q♦)!',
  'Magik zawsze żongluje cylindrem!': 'A magician always conjures a top hat!',
  'Wystrzelenie parasola prosto w soczystego arbuza!': 'Launching the umbrella straight into a juicy watermelon!',
  'Gra ostre rockowe solo, a z góry kapią truskawkowe lody!': 'Shreds a blazing rock solo as strawberry ice cream drips from above!',
  'Silny promień latarki rozświetla w jaskini złoty klucz!': 'A strong flashlight beam lights up the golden key in the cave!',
  'Cały księżyc okazuje się żółtym serem z dziurami!': 'The entire moon turns out to be yellow Swiss cheese with holes!',
  'Z gorącego wosku świecy na torcie zastyga lśniący kryształ!': 'From hot wax on the birthday cake crystallizes a gleaming crystal!',
  'Między Skarbem a Rakietą czuwa ziegnący ogniem Smok!': 'Between the Treasure and the Rocket stands the fire-breathing Dragon!',
  'T i D mają jedną pionową kreskę (dokładnie jak cyfra 1)!': 'T and D have one vertical downstroke (just like digit 1)!',
  'CzteRy ma dominującą spółgłoskę R!': 'FouR features the dominant consonant R!',
  'K składa się z dwóch połączonych cyfr 7!': 'Letter K is two sevens joined back to back!',
  'N to 2 (dwie nóżki), a S to 0 (syczenie)!': 'N is 2 (two downstrokes), S is 0 (hissing)!',
  '1 = T, 4 = R -> TOR!': '1 = T, 4 = R -> TOR / TRAIN!',
  'Mózg myśli skojarzeniami rozchodzącymi się we wszystkich kierunkach od centrum!': 'The brain thinks via associations radiating in all directions from the center!',
  'Pole widzenia ludzkich oczu to naturalna panorama!': 'Human vision is naturally panoramic!',
  'Grube u nasady, organiczne i faliste jak konary drzewa!': 'Thick at the base, organic and wavy like tree boughs!',
  'Pojedyncze słowo-klucz natychmiast uwalnia sieć skojarzeń bez czytania całych zdań!': 'A single keyword unleashes an associative network without reading full sentences!',
  'Działa jak wizualna szufladka ułatwiająca natychmiastową lokalizację wiedzy!': 'Functions like a visual drawer enabling instant knowledge retrieval!',
  'Na najcieńszych zewnętrznych pod-gałązkach (liściach)!': 'On the slender outermost twigs (leaves)!',
  'Drukowanymi literami, zawsze poziomo wzdłuż linii!': 'In print capital letters, always horizontally along the line!',
  'Szybki przegląd (skimming) całego materiału przed rysowaniem!': 'Skimming the entire text before putting pen to paper!',
  'Daje panoramiczny wgląd w 4 filary i pozwala utrzymać kontakt wzrokowy!': 'Provides a panoramic view of the 4 pillars and maintains eye contact!',
  'Krzysztof ma wielką czarną brodę, w której gubi miecz!': 'Christopher has a giant black beard where he loses a sword!',
  'Kasia ma fioletowe włosy i pije kakao!': 'Katie has purple hair and drinks cocoa!',
  'Piotr nosi monokl i pisze gęsim piórem!': 'Peter sports a monocle and writes with a quill!',
  '1. Znajdź dźwiękowego bliźniaka, 2. Stwórz śmieszną scenkę ze znaczeniem!': '1. Find an acoustic twin, 2. Build a funny scene with the meaning!',
  'Mushroom brzmi jak „masz rum” lub „champion”!': 'Mushroom sounds like "champion"!',
  'Pieczarka / grzyb!': 'Mushroom!',
  'Candle = świeca!': 'Candle = candle!',
  'Fork = widelec!': 'Fork = fork!',
  'Shark = rekin!': 'Shark = shark!',
  'Wybierz najbardziej wybuchową, dynamiczną akcję!': 'Choose the most explosive, dynamic action!',
  'Gitara gra rocka, a lody skapują na jej struny!': 'The guitar shreds rock, and ice cream drips onto its strings!',
  'Latarka oświetla klucz jaskrawym promieniem!': 'The flashlight shines a bright beam on the key!',
  'Księżyc z żółtego sera!': 'A moon made of yellow cheese!',
  'Wosk zamienia się w błyszczący kryształ!': 'Wax turns into a sparkling crystal!',
  'Skarbu pilnował ziejący ogniem smok, który wsiadł do rakiety!': 'The treasure was guarded by a fire-breathing dragon who boarded a rocket!',
  'Pomyśl o jednej pionowej kresce w literach T i D!': 'Think of the single vertical stroke in letters T and D!',
  'Policz nóżki w literze m: raz, dwa, trzy!': 'Count the downstrokes in the letter m: one, two, three!',
  'Wsłuchaj się w słowo „czteRy”!': 'Listen closely to the sound of "fouR" or "czteRy"!',
  'Dwie siódemki tworzą literę K!': 'Two sevens form the letter K!',
  'Obróć cyfrę 9 w wyobraźni!': 'Rotate the digit 9 in your imagination!',
  'N to 2 nóżki, O to klej, S to zero (20)!': 'N is 2 downstrokes, O is glue, S is zero (20)!',
  'Mózg myśli promieniście jak słońce lub macki ośmiornicy – od centrum wybuchają wielobarwne skojarzenia!': 'The brain thinks radiantly like the sun or octopus tentacles – colorful associations burst outward from the center!',
  'Oczy człowieka widzą panoramicznie – pozioma kartka daje pełną swobodę dla gałęzi po obu stronach!': 'Human eyes see panoramically – landscape orientation gives full freedom for branches on both sides!',
  'Główne gałęzie są jak konary drzewa lub macki ośmiornicy – grube, faliste i wychodzące prosto z serca tematu!': 'Main branches are like tree limbs or octopus tentacles – thick, curved, radiating directly from the core topic!',
  'Jedno słowo-klucz to zapalnik skojarzeń – zamiast czytać nudne zdania, mózg błyskawicznie przypomina sobie kontekst!': 'A single keyword is an associative trigger – instead of reading dull sentences, your brain recalls full context instantly!',
  'Obraz + słowo = podwójny ślad w mózgu! Kora wzrokowa koduje symbol w ułamku sekundy.': 'Image + word = dual coding in the brain! The visual cortex encodes symbols in a fraction of a second.',
  'Kolor to natychmiastowy adres w pamięci wzrokowej – od razu wiesz, w której szufladce szukać odpowiedzi!': 'Color is an instant address in visual memory – you immediately know which mental drawer holds the answer!',
  'Szczegóły (daty, liczby, nazwiska) wędrują na najdalsze, najcieńsze gałązki właściwego konaru!': 'Details (dates, numbers, names) go on the outermost, thinnest twigs of the appropriate branch!',
  'Pismo poziome i drukowane pozwala Twojemu mózgowi przeskanować całą mapę w kilka sekund bez obracania kartki!': 'Horizontal print writing allows your brain to scan the entire map in seconds without turning the page!',
  'Zawsze zaczynamy od lotu ptaka – przeglądamy nagłówki i strukturę, by wiedzieć, jak zaplanować główne gałęzie!': 'Always begin with a bird\'s-eye view – scan headings and structure first to plan out the main branches!',
  'Mapa myśli w Twojej głowie daje Ci pełną strukturę wystąpienia w ułamku sekundy – patrzysz w oczy ludziom i mówisz z pasją!': 'A mind map in your head gives you the entire presentation structure in a flash – make eye contact and speak with passion!',
  'Wybierz najbardziej dynamiczną, żywą i dźwięczną akcję!': 'Choose the most dynamic, vivid, and memorable action!',
  'Przypomnij sobie kotwicę brody i krzaczastego Krzysztofa!': 'Recall the beard anchor and bushy Christopher!',
  'Pamiętasz gorące KAKAO i fioletowe włosy?': 'Remember hot COCOA and purple hair?',
  'PIÓRO to most fonetyczny dla Piotra!': 'FEATHER is the phonetic bridge for Peter!',
  'Spójrz w górę bramy – co tam świeci żółtym blaskiem?': 'Look up at the gate – what is glowing with a yellow light?',
  'Co krąży w powietrzu nad marmurową posadzką?': 'What is hovering in the air above the marble floor?',
  'Kto robił piruety na kanapie przy kominku?': 'Who was doing pirouettes on the couch by the fireplace?',
  'Jaka gorąca włoska potrawa fruwa po kuchni?': 'What hot Italian dish is flying around the kitchen?',
  'Jaki instrument hałasuje między słoikami w spiżarni?': 'What instrument is making a racket among the jars in the pantry?',
  'Co wystrzeliło z hukiem z regału z książkami?': 'What blasted with a bang from the bookshelf?',
  'Kto czyta gazetę w egzotycznym ogrodzie?': 'Who is reading a newspaper in the exotic garden?',
  'Jaki drogocenny niebieski kamień odbija się w lustrach?': 'What precious blue gem is reflected in the mirrors?',
  'Co szybuje w powietrzu nad pałacowym balkonem?': 'What is soaring in the air above the palace balcony?',
  'Jaki zielony owoc rymuje przy bramie wejściowej?': 'What green fruit is rhyming at the entrance gate?',
  'Jaki biały napój tryska w holu jak gejzer?': 'What white drink is spouting in the hall like a geyser?',
  'Jakie francuskie pieczywo grzeje się w kominku?': 'What French pastry is warming up in the fireplace?',
  'Co żółtego i dziurawego skacze po kuchennym blacie?': 'What yellow and hole-filled thing is bouncing on the kitchen counter?',
  'Jaki owoc śpiewa w skarbcu pełnym kosztowności?': 'What fruit is singing in the vault full of valuables?',
  'Co ciężkiego, lśniącego i królewskiego spoczywa na bramie?': 'What heavy, glittering royal object rests on the gate?',
  'Jaki cytrusowy pojazd pachnie świeżą cytryną?': 'What citrus vehicle smells of fresh lemon?',
  'Jaki instrument wibruje i dudni między książkami?': 'What instrument vibrates and thuds among the books?',
  'Jaki różowy ptak stoi w wodzie w kaloszach?': 'What pink bird is standing in water wearing rubber boots?',
  'Jaki olbrzymi, mroźny deser chłodzi salę luster?': 'What giant frozen dessert cools down the hall of mirrors?',
  'Jakie urządzenie głośno tyka i kuka na wieży?': 'What device ticks loudly and cuckoos in the tower?',
  'Co symbolizuje magiczny wstęp przy bramie?': 'What symbolizes the magical entrance at the gate?',
  'Kto analizuje dane w okularach wśród książek?': 'Who analyzes data wearing glasses among the books?',
  'Co cennego i błyszczącego leży w skarbcu?': 'What precious, sparkling item lies in the treasury?',
  'Jakie mityczne zwierzę pije herbatę na balkonie na pożegnanie?': 'What mythical creature is sipping tea on the balcony for farewell?',
  'Co świeci jasno przy wejściu?': 'What shines brightly at the entrance?',
  'Jaki instrument bębni w holu?': 'What instrument is drumming in the hall?',
  'Kto jeździ na wrotkach przy kominku?': 'Who is roller-skating by the fireplace?',
  'Co sprężynuje w kuchni pod sufitem?': 'What is bouncing in the kitchen near the ceiling?',
  'Co królewskiego spoczywa na poduszce w skarbcu?': 'What royal item rests on a pillow in the treasury?',
  'Co leci w stronę gwiazd z wieży?': 'What is flying toward the stars from the tower?',
  'Kto w hełmie wikinga pilnuje dachu pałacu?': 'Who in a Viking helmet is guarding the palace roof?',
  'Locus 1: Co rozświetla bramę wejściową?': 'Locus 1: What illuminates the entrance gate?',
  'Locus 3: Kto tańczy przy kominku?': 'Locus 3: Who dances by the fireplace?',
  'Locus 6: Co błyszczy w lustrach?': 'Locus 6: What sparkles in the mirrors?',
  'Locus 8: Co leży w skarbcu na poduszce?': 'Locus 8: What lies on the pillow in the vault?',
  'Locus 9: Co leci ku gwiazdom z wieży?': 'Locus 9: What flies toward the stars from the tower?',
  'Dźwiękowy most i wyobraźnia to klucz do sukcesu!': 'Sound bridge and imagination are the keys to success!',
  'Powiedz mushroom szybko na głos: masz-rum!': 'Say mushroom quickly out loud: "masz-rum"!',
  'Pamiętasz wielkiego leśnego prawdziwka żądającego rumu?': 'Remember the giant forest boletus demanding rum?',
  'Foka żongluje widelcem = fork!': 'A seal juggling a fork = fork!',
  '🦊 SZKOLENIE Z LISKIEM BYSTRZAKIEM': '🦊 TRAINING WITH RUSTY THE FOX',
  'Nigdy więcej "znam tę twarz, ale jak on miał na imię?". Opanuj technikę kotwic i mostów fonetycznych.': 'Never again say "I know that face, but what was their name?". Master the technique of anchors and phonetic bridges.',
  'Rozpocznij naukę Loci': 'Start Learning Loci',
  'Klasyczny Loci': 'Classic Loci',
  'Odwrotna kolejność': 'Reverse Order',
  'Dostęp bezpośredni': 'Direct Access',
  'Zacznij naukę': 'Start Learning',
  'Rozpocznij naukę Majora': 'Start Learning Major',
  'Powtórz akademię': 'Repeat Academy',
  'Kontynuuj akademię': 'Continue Academy',
  'Rozpocznij naukę łańcucha': 'Start Learning Chain Method',
  '🦊 Wskazówka Liska:': '🦊 Rusty\'s Tip:',
  'Brawo! Dokładnie o to chodzi! Znakomita pamięć!': 'Bravo! Exactly right! Excellent memory!',
  '← Pałac pamięci': '← Memory Palace',
  'Rawrr! Witaj na mapie szkolenia! Wybierz lekcję 1, a powoli oprowadzę Cię po pałacu 🐯': 'Rawrr! Welcome to the training map! Pick lesson 1 and I will guide you through the palace 🐯',
  'Jesteś niesamowity! Ukończyłeś wszystkie lekcje z 10 komnatami! Czas pobić rekordy w grze swobodnej! 🏆': 'You are incredible! You completed all lessons with 10 rooms! Time to break records in free play! 🏆',
  '💡 Zamknij na moment oczy i zobacz ten obraz w swojej głowie!': '💡 Close your eyes for a moment and see this image in your head!',
  'Sprawdź pamięć! 🎯': 'Test Memory! 🎯',
  'Kolejna komnata →': 'Next Room →',
  'Co umieściłeś w tej komnacie?': 'What did you place in this room?',
  'Powtórz ↺': 'Repeat ↺',
  'Wszystko zaliczone! Możesz wracać do dowolnej lekcji, żeby zdobyć brakujące gwiazdki ⭐': 'All completed! You can return to any lesson to earn missing stars ⭐',
  'Wybierz lekcję. Świecąca czeka na Ciebie! ✨': 'Choose a lesson. The glowing one is waiting for you! ✨',
  'Zaczynamy od pierwszej lekcji. Kliknij ją! 🐾': 'We start with lesson one. Click it! 🐾',
  'Patrz uważnie jeszcze raz! 👀': 'Look closely once more! 👀',
  'Patrz uważnie! 👀 Pasek pokazuje, ile masz czasu.': 'Watch closely! 👀 The bar shows how much time you have.',
  'WSZYSTKIE LEKCJE ZALICZONE! 🏆 Jesteś mistrzem cyfr! Czas na grę swobodną!': 'ALL LESSONS PASSED! 🏆 You are a master of digits! Time for free play!',
  'Teraz Twoja kolej! Wpisz cyfry z pamięci. 🧠': 'Now your turn! Enter digits from memory. 🧠',
  'Akademia Majora ze Sówką': 'Major Academy with Professor Owl',
  '8 fundamentalnych lekcji, od dźwięków 0-9 po swobodne zapamiętywanie kodów PIN i PESEL.': '8 fundamental lessons, from sounds 0-9 to memorizing PIN and ID codes.',
  'Uhuhu! Jestem Sówka Profesor 🦉 Znam tajemny kod zamieniający nudne cyfry w barwne obrazy!': 'Hoot-hoot! I am Professor Owl 🦉 I know the secret code turning boring digits into vivid images!',
  '🦉 Tajnik Sówki:': '🦉 Owl\'s Secret:',
  'Znakomicie! Doskonałe zrozumienie zasad systemu Major!': 'Outstanding! Flawless understanding of the Major System!',
  'Ukończono Akademię! 🎉': 'Academy Completed! 🎉',
  'Szkoła Magii Kart': 'Card Magic Academy',
  'Poznaj technikę PAO i zapamiętuj całe talie kart z Szopem Magikiem.': 'Learn the PAO technique and memorize whole card decks with Bandit the Magician.',
  'Tadaam! Jestem Szop Magik 🦝 Talia 52 kart w głowie to żaden problem, to czysta iluzja!': 'Ta-da! I am Bandit the Magician 🦝 A 52-card deck in your head is no problem, pure illusion!',
  'Brawo! Prawdziwy mistrz iluzji!': 'Bravo! A true master of illusion!',
  'Ukończono szkołę magii! 🎉': 'Magic Academy Completed! 🎉',
  'Łańcuch Skojarzeń z Basią': 'Association Chain with Hazel',
  'Poznaj metodę łączenia myśli jak domino i nigdy więcej nie zgub wątku.': 'Learn to link thoughts like dominoes and never lose your train of thought again.',
  'Cześć! Jestem Wiewiórka Basia 🐿️ Nauczę Cię łączyć myśli w żelazny łańcuch!': 'Hi! I am Hazel the Squirrel 🐿️ I will teach you to link thoughts into an iron chain!',
  'Brawo! To skojarzenie jest nierozerwalne jak stalowy łańcuch!': 'Bravo! This link is as unbreakable as a steel chain!',
  'Ukończono szkolenie łańcucha! 🎉': 'Chain Training Completed! 🎉',
  'Kalendarz w głowie z Żółwikiem': 'Mental Calendar with Clockwork Turtle',
  'Poznaj algorytm Doomsday i naucz się podawać dzień tygodnia każdej daty w kilka sekund.': 'Learn the Doomsday algorithm and name the weekday of any date in seconds.',
  'Tik-tak! Jestem Żółwik Zegarowy 🐢 Nauczę Cię czytać czas w pamięci bez pośpiechu!': 'Tick-tock! I am Clockwork Turtle 🐢 I will teach you to read mental time at a calm pace!',
  '🐢 Mądrość Żółwika:': '🐢 Turtle\'s Wisdom:',
  'Perfekcyjnie! Czas nie ma przed Tobą żadnych tajemnic!': 'Perfect! Time holds no secrets from you!',
  'Ukończono szkolenie czasu! 🎉': 'Time Training Completed! 🎉',
  'Akrostychy z Pieskiem Łatkiem': 'Acrostics with Patch the Dog',
  'Poznaj metodę pierwszych liter i naucz się zapamiętywać całe listy wiedzy w jednym prostym zdaniu.': 'Learn the first-letter method and memorize entire lists in one simple sentence.',
  'Hau, hau! Jestem Piesek Łatek 🐶 Nauczę Cię łapać wiedzę na haczyki pierwszych liter!': 'Woof, woof! I am Patch the Dog 🐶 I will teach you to hook knowledge onto first letters!',
  'Brawo! Wytropiłeś właściwe słowo bez pudła! Hau! 🦴✨': 'Bravo! You tracked down the right word without missing a beat! Woof! 🦴✨',
  'Ukończono szkolenie Tropiciela! 🎉': 'Tracker Training Completed! 🎉',
  'Szkoła Językowa Papużki Poli': 'Polly\'s Language School',
  'Poznaj metodę słów-kluczy i zapamiętuj obce słówka w locie bez zakuwania.': 'Learn the Keyword Method and memorize foreign words on the fly without cramming.',
  'A kysz, nudne powtórki! Jestem Papużka Pola 🦜 Pokażę Ci, jak zapamiętywać słówka w ułamku sekundy!': 'Shoo, boring flashcards! I am Polly the Parrot 🦜 I will show you how to memorize words in a split second!',
  'Kraaa! Dokładnie tak! Twoja wyobraźnia działa cuda!': 'Squawk! Exactly right! Your imagination works wonders!',
  'Ukończono kurs! 🎉': 'Course Completed! 🎉',
  'Mapy Myśli z Ośmiornicą Inką': 'Mind Maps with Inky the Octopus',
  'Opanuj sztukę nielinearnych notatek, rozgałęziaj myśli w 8 stron i zapamiętuj całe książki na jednej kartce.': 'Master the art of non-linear notes, branch thoughts in 8 directions, and memorize whole books on one page.',
  'Plusk! Jestem Ośmiornica Inka 🐙 Rozciągnijmy macki wyobraźni i stwórzmy Twoją pierwszą mapę myśli!': 'Splash! I am Inky the Octopus 🐙 Let us stretch the tentacles of imagination and create your first mind map!',
  '🐙 Pędzel Inki:': '🐙 Inky\'s Brush:',
  'Brawo! Trafiłeś w samo sedno mapy myśli! Moje macki biją brawo! 🐙✨': 'Bravo! You hit the bullseye of the mind map! My tentacles applaud! 🐙✨',
  'Ukończono szkolenie Kartografa! 🎉': 'Cartographer Training Completed! 🎉',
  'Wynik': 'Score',
  'Znajdź:': 'Find:',
  'Poziom:': 'Level:',
  'Rekord:': 'Record:',
  '⚡ Stwórz żywy, dynamiczny obraz w wyobraźni!': '⚡ Create a vivid, dynamic image in your mind!',
  'Co znajdowało się w tej komnacie przed wyjściem?': 'What was in this room before leaving?',
  'Jaki przedmiot znajdował się w tej komnacie?': 'Which item was in this room?',
  'W której komnacie znajdował się ten przedmiot?': 'In which room was this item placed?',
  'Menu pałacu': 'Palace Menu',
  'Koniec gry': 'Game Over',
  'poziom': 'level',
  'Rozgrzewka za nami! Teraz robi się ciekawie 😼': 'Warm-up complete! Now things get interesting 😼',
  'Pięć cyfr! Większość ludzi odpada właśnie tutaj.': 'Five digits! Most people drop out right here.',
  'Siedem cyfr – magiczna liczba pamięci! ✨': 'Seven digits – the magical memory number! ✨',
  'Dziewięć cyfr = cały numer telefonu! 📱': 'Nine digits = an entire phone number! 📱',
  'DZIESIĘĆ! Mruczek jest pod wrażeniem 🙀': 'TEN! Whiskers is thoroughly impressed 🙀',
  'Dwanaście cyfr?! Jesteś mistrzem! 🏆': 'Twelve digits?! You are a master! 🏆',
  'Piętnaście! To poziom zawodów pamięciowych 🤯': 'Fifteen! That is memory championship level 🤯',
  'Tarcza chroni przed jedną pomyłką': 'Shield protects against one mistake',
  'Wpisz od KOŃCA 🔄': 'Type in REVERSE 🔄',
  'Odwrotnie! Zapamiętaj, a potem wpisz od końca. 🔄': 'In reverse! Memorize, then type backward. 🔄',
  'Błysk! Cyfry pojawią się po jednej – nie mrugaj! ⚡': 'Flash! Digits appear one by one – do not blink! ⚡',
  'Do pierwszej pomyłki! Powodzenia! 🐾': 'Until the first mistake! Good luck! 🐾',
  'Od końca! 🔄': 'In reverse! 🔄',
  'Rozgrzewka się nie udała… ale to tylko trening! 🐾': 'Warm-up missed… but it is just practice! 🐾',
  'Imponujące! Prawie jak mistrz pamięci! 🌟': 'Impressive! Almost like a memory champion! 🌟',
  'Dobra próba! Każdy rekord zaczyna się od porażki 💪': 'Good attempt! Every record starts with a stumble 💪',
  '🏆 Nowy rekord!': '🏆 New Record!',
  '🎓 Wspaniała runda!': '🎓 Wonderful round!',
  'Jakie dźwięki odpowiadają tej cyfrze?': 'What sounds correspond to this digit?',
  'Wybierz słowo o spółgłoskach kodujących tę liczbę:': 'Pick the word whose consonants encode this number:',
  'Wyobraź sobie akcję łączącą oba przedmioty!': 'Imagine an action linking both items!',
  'Zaawansowany PIN 6-cyfrowy! Zakoduj 3 obrazy w myślach.': 'Advanced 6-digit PIN! Encode 3 images in your mind.',
  'Zakoduj obie liczby w słowa i stwórz własną scenkę w głowie!': 'Encode both numbers into words and create your own scene in your head!',
  '💳 Zapamiętaj 6-cyfrowy PIN:': '💳 Memorize the 6-digit PIN:',
  '💳 Zapamiętaj PIN:': '💳 Memorize the PIN:',
  'Zapamiętane! Sprawdź mnie ▶': 'Memorized! Test me ▶',
  'Jaki był kod PIN?': 'What was the PIN code?',
  '🎉 Pokaz zakończony sukcesem!': '🎉 Performance completed successfully!',
  'Wybierz kartę nr': 'Select card #',
  'Jaka postać i akcja odpowiada tej karcie?': 'Which character and action corresponds to this card?',
  'Która karta została zakryta?': 'Which card was hidden?',
  '🎉 Świetny łańcuch myśli!': '🎉 Great chain of thoughts!',
  'Co jest kolejnym ogniwem w tym łańcuchu?': 'What is the next link in this chain?',
  'Cofamy taśmę! Jaki przedmiot znajdował się bezpośrednio przed nim?': 'Rewinding tape! What item came immediately before it?',
  'Jakie ogniwo łączy te dwa przedmioty w historii?': 'What link connects these two items in the story?',
  'Wskaż natychmiast kolejne powiązanie:': 'Instantly identify the next connection:',
  '🎉 Mistrzowski wynik!': '🎉 Masterful score!',
  'Miesiąc:': 'Month:',
  'Który dzień tego miesiąca jest kotwicą Doomsday?': 'Which day of this month is the Doomsday anchor?',
  'Zagraj ponownie 🔄': 'Play Again 🔄',
  'Koniec gry! 🐾': 'Game Over! 🐾',
  'Twój wynik:': 'Your Score:',
  '⭐ NOWY REKORD! ⭐': '⭐ NEW RECORD! ⭐',
  'Co oznacza słowo': 'What does the word mean',
  'Jaki element następuje bezpośrednio potem?': 'Which item follows immediately next?',
  'Którego elementu brakuje w sekwencji?': 'Which element is missing from the sequence?',
  '🎉 Rewelacyjny wynik!': '🎉 Sensational score!',
  'Jaki jest polski most fonetyczny (brzmieniowy) dla tego słowa?': 'What is the phonetic bridge for this word?',
  'Koniec gry! 🐙': 'Game Over! 🐙',
  'Świetny trening map myśli!': 'Great mind map workout!',
  '← Zmień tryb': '← Change Mode',
  '❓ [Brakujące ramię]': '❓ [Missing branch]',
  'Który z poniższych elementów jest INTRUZEM i nie pasuje do tej gałęzi?': 'Which of the following items is an INTRUDER and does not belong to this branch?',
  '\n<div class="major">\n  <p class="panel-title">Alfabet cyfr (System Major)</p>\n  <div class="major-grid">\n    <div><b>0</b><span>S Z C</span></div><div><b>1</b><span>T D</span></div><div><b>2</b><span>N</span></div>\n    <div><b>3</b><span>M</span></div><div><b>4</b><span>R</span></div><div><b>5</b><span>L</span></div>\n    <div><b>6</b><span>SZ CZ Ż</span></div><div><b>7</b><span>K G</span></div><div><b>8</b><span>F W</span></div>\n    <div><b>9</b><span>P B</span></div>\n  </div>\n  <p class="panel-note">Samogłoski (A E I O U Y) są „za darmo” – wstawiasz je, żeby powstało słowo. <b>TOR</b> → T=1, R=4 → <b>14</b>.</p>\n</div>': '\n<div class="major">\n  <p class="panel-title">Digit Alphabet (Major System)</p>\n  <div class="major-grid">\n    <div><b>0</b><span>S Z</span></div><div><b>1</b><span>T D</span></div><div><b>2</b><span>N</span></div>\n    <div><b>3</b><span>M</span></div><div><b>4</b><span>R</span></div><div><b>5</b><span>L</span></div>\n    <div><b>6</b><span>J SH CH</span></div><div><b>7</b><span>K G</span></div><div><b>8</b><span>F V</span></div>\n    <div><b>9</b><span>P B</span></div>\n  </div>\n  <p class="panel-note">Vowels (A E I O U Y) are free glue – insert them to build words. <b>TAR</b> → T=1, R=4 → <b>14</b>.</p>\n</div>',
  'Kot Mruczek – kliknij, żeby pogłaskać': 'Whiskers the Cat – click to pet',
  'Piesek Łatek – kliknij, żeby pogłaskać': 'Patch the Dog – click to pet',
  'Lisek Bystrzak – kliknij, żeby pogłaskać': 'Rusty the Fox – click to pet',
  'Ośmiornica Inka – kliknij, żeby pogłaskać': 'Inky the Octopus – click to pet',
  'Sówka Profesor – kliknij, żeby pogłaskać': 'Professor Owl – click to pet',
  'Papużka Pola – kliknij, żeby pogłaskać': 'Polly the Parrot – click to pet',
  'Szop Magik – kliknij, żeby pogłaskać': 'Bandit the Magician – click to pet',
  'Wiewiórka Basia – kliknij, żeby pogłaskać': 'Hazel the Squirrel – click to pet',
  'Tygrysek Leon – kliknij, żeby pogłaskać': 'Leo the Tiger – click to pet',
  'Żółwik Zegarowy – kliknij, żeby pogłaskać': 'Clockwork Turtle – click to pet',
  'Śr': 'Wed',
  'Styczeń': 'January',
  '3 stycznia (lub 4 w przestępnym)': 'January 3 (or 4 in leap year)',
  'Ostatni dzień lutego (28 lub 29)': 'Last day of February (28 or 29)',
  '14 marca (Dzień liczby Pi: 3.14)': 'March 14 (Pi Day: 3.14)',
  'Kwiecień': 'April',
  'Sierpień': 'August',
  'Wrzesień': 'September',
  '5 września („praca 9 do 5” -> 5.09)': 'September 5 ("9 to 5" -> 5.09)',
  'Październik': 'October',
  '10 października (parzysty: 10.10)': 'October 10 (even: 10.10)',
  'Grudzień': 'December',
  'koń': 'horse',
  'Świeca': 'Candle',
  'Łabędź': 'Swan',
  'Żaglówka': 'Sailboat',
  'Ślimak': 'Snail',
  'Bałwan': 'Snowman',
  'aeiouyąęóAEIOUYĄĘÓ': 'aeiouyAEIOUY',
  'Już pamiętam ✓': 'I remember ✓',
  'Noc / Cień / Iluzja': 'Night / Shadow / Illusion',
  'Ogień / Pasja / Rycerze': 'Fire / Passion / Knights',
  'Złoto / Klejnoty / Bogactwo': 'Gold / Jewels / Wealth',
  'wyciąga z cylindra': 'pulls from top hat',
  'świecący cylinder 🎩': 'glowing top hat 🎩',
  'As Pik to Szop Magik wyciągający lśniący cylinder!': 'Ace of Spades is Bandit the Magician pulling out a glowing top hat!',
  'Król Kier': 'King of Hearts',
  'Król Artur 👑': 'King Arthur 👑',
  'wyciąga ze skały': 'pulls from stone',
  'złoty miecz Excalibur ⚔️': 'golden sword Excalibur ⚔️',
  'Król Kier to Król Artur wyciągający złoty miecz Excalibur!': 'King of Hearts is King Arthur pulling out golden sword Excalibur!',
  'Królowa Kleopatra 👸': 'Queen Cleopatra 👸',
  'ogromny błękitny diament 💎': 'huge blue diamond 💎',
  'Dama Karo to Kleopatra rzucająca ogromnym błękitnym diamentem!': 'Queen of Diamonds is Cleopatra throwing a huge blue diamond!',
  'dębowy łuk ze strzałą 🎯': 'oak bow with arrow 🎯',
  'Walet Trefl to Robin Hood strzelający z dębowego łuku!': 'Jack of Clubs is Robin Hood shooting an oak bow!',
  '10 Pik to Batman rzucający czarny batarang!': '10 of Spades is Batman throwing a black batarang!',
  'kieliszek złotego martini 🍸': 'glass of golden martini 🍸',
  '7 Kier to James Bond wznoszący toast kieliszkiem martini!': '7 of Hearts is James Bond toasting with a martini!',
  'Pirat z Karaibów 🏴‍☠️': 'Pirate of the Caribbean 🏴‍☠️',
  'skrzynia ze złotymi dukatami 🪙': 'chest of gold coins 🪙',
  '8 Karo to Pirat otwierający skrzynię ze złotymi dukatami!': '8 of Diamonds is Pirate opening a chest of gold coins!',
  'Mądry Druid 🧙': 'Wise Druid 🧙',
  'uderza o ziemię': 'strikes the ground',
  'magiczna laska z kryształem 🪄': 'magic staff with crystal 🪄',
  '9 Trefl to Druid uderzający o ziemię magiczną laską!': '9 of Clubs is Druid striking the ground with a magic staff!',
  'Zero zaczyna się na Z, syczący dźwięk': 'Zero starts with Z, hissing sound',
  'Ząb': 'Tooth',
  'Litera T i D mają jedną pionową kreskę (jak 1)': 'Letters T and D have one vertical downstroke (like 1)',
  'Małe „n” ma dwie nóżki': 'Lowercase "n" has two legs',
  'Nóż': 'Knife',
  'Koń': 'Horse',
  'Małe „m” ma trzy nóżki': 'Lowercase "m" has three legs',
  'Młot': 'Hammer',
  'Słowo czteRy ma dominujące R': 'Word fouR has dominant R',
  'Liść': 'Leaf',
  'Szóstka brzmi jak „sz”, jota jest 6. spółgłoską': 'Six sounds like "sh"',
  'Jeż': 'Hedgehog',
  'Dwie cyfry 7 połączone brzuszkami tworzą literę K': 'Two 7 digits back-to-back form letter K',
  'Pisana mała litera f ma dwie pętelki jak ósemka': 'Cursive letter f has two loops like an 8',
  'Lustrzane odbicie 9 to P, odwrócona 9 to b': 'Mirror of 9 is P, upside down 9 is b',
  'Ciężki młot': 'Heavy hammer',
  'Róża': 'Rose',
  'Czerwona róża': 'Red rose',
  'Szczypiący rak': 'Pinching crab',
  'Skórzany but': 'Leather boot',
  'płaszcz': 'coat',
  'Żółty': 'Yellow',
  'Wielka kuta brama ze złotymi lwami przy wejściu do pałacu.': 'Grand wrought-iron gate with golden lions at the palace entrance.',
  'Lśniąca posadzka w szachownicę i olbrzymi kryształowy żyrandol.': 'Gleaming checkered floor and giant crystal chandelier.',
  'Trzaskające płomienie w wielkim kamiennym kominku i miękki dywan.': 'Crackling flames in a massive stone fireplace and soft plush rug.',
  'Wysokie dębowe regały z drabinami, pachnące starym pergaminem.': 'Tall oak bookshelves with ladders, smelling of aged parchment.',
  'Szklana kopuła, egzotyczne palmy, kwitnące orchidee i śpiew kanarka.': 'Glass dome, exotic palms, blooming orchids, and singing canaries.',
  'Dziesiątki ozdobnych luster odbijających światło setek świec.': 'Dozens of ornate mirrors reflecting the light of hundreds of candles.',
  'Wielki piec chlebowy, miedziane patelnie i zapach świeżych wypieków.': 'Grand bread oven, copper pans, and aroma of fresh pastries.',
  'Ciężkie okute skrzynie ze złotem, rubinami i drogocennymi pucharami.': 'Heavy iron-bound chests filled with gold, rubies, and precious goblets.',
  'Potężny mosiężny teleskop i mapa gwiazd na sklepieniu wieży.': 'Mighty brass telescope and star chart painted on tower vault.',
  'Kamienna balustrada z widokiem na góry o zachodzie słońca.': 'Stone balustrade overlooking mountains at sunset.',
  'Błyszczące zbroje rycerskie, herby rodowe i skrzyżowane miecze.': 'Gleaming knight armor, family crests, and crossed swords.',
  'Bulgoczące retorty z neonowymi miksturami i kłęby fioletowego dymu.': 'Bubbling flasks with neon potions and plumes of purple smoke.',
  'Błyszczący parkiet, złocone sztukaterie i lewitujące maski weneckie.': 'Polished ballroom floor, gilded stucco, and levitating Venetian masks.',
  'Podziemna jaskinia z turkusowym źródełkiem i świecącymi minerałami.': 'Underground cavern with turquoise spring and glowing minerals.',
  'Półki pełne słoików z miodem, piramid z makaroników i fontanna kakao.': 'Shelves packed with honey jars, macaron pyramids, and cocoa fountain.',
  'Wietrzny szczyt z powiewającymi sztandarami i widokiem na całe królestwo.': 'Breezy peak with fluttering banners and panoramic kingdom views.',
  'wisi i świeci jaskrawym neonowym światłem': 'hangs and glows with bright neon light',
  'Coś żółtego i owocowego, co emituje neonowe światło!': 'Something yellow and fruity emitting neon light!',
  'lewituje i wyskakują z niego kolorowe gołębie': 'levitates as colorful doves burst out of it',
  'Czarne nakrycie głowy iluzjonisty z gołębiami!': 'Black magician\'s top hat with doves!',
  'robi piruety w różowych wrotkach': 'twirls in pink roller skates',
  'Olbrzymie szare zwierzę w różowych wrotkach!': 'Giant gray animal in pink roller skates!',
  'kręci się w powietrzu jak ogniste frisbee': 'spins through the air like a fiery frisbee',
  'Włoski przysmak kręcący się w płomieniach!': 'Italian delicacy spinning in flames!',
  'sama gra głośne rockowe solo': 'plays a loud rock solo all by itself',
  'Instrument rockowy robiący mnóstwo hałasu!': 'Rock instrument making lots of noise!',
  'startuje z hukiem, zostawiając obłok dymu': 'blasts off with a roar, leaving a cloud of smoke',
  'Pojazd kosmiczny buchający białym dymem!': 'Space vehicle belching white smoke!',
  'lśni złotem i jest wysadzana rubinami': 'shines with gold and is encrusted with rubies',
  'Złoty symbol władcy ze świecącymi klejnotami!': 'Golden royal symbol with sparkling jewels!',
  'czyta gazetę i głośno rechocze': 'reads a newspaper and croaks loudly',
  'Zielony płaz w okularach czytający wiadomości!': 'Green amphibian wearing glasses reading the news!',
  'strzela promieniami błękitnego lasera': 'fires beams of blue laser',
  'Twardy, niebieski kryształ świecący laserem!': 'Hard blue crystal shining with lasers!',
  'Zielony owoc z wielką pestką, który nawija rymy!': 'Green fruit with a big pit dropping rhymes!',
  'bucha strumieniem spienionego mleka aż po sufit': 'geysers foamed milk all the way to the ceiling',
  'Biały napój wytryskujący w górę!': 'White drink spouting skyward!',
  'służy jako szpada i głośno chrupie': 'serves as a sword and crunches loudly',
  'Długie francuskie pieczywo z chrupiącą skórką!': 'Long French bread with a crunchy crust!',
  'Żółty przysmak z dziurami skaczący jak piłka!': 'Yellow hole-filled delicacy bouncing like a ball!',
  'podskakuje i śpiewa operowym głosem': 'hops and sings in an operatic voice',
  'Owoc znany z mitologii, który ma operowy głos!': 'Mythological fruit with an operatic voice!',
  'pije herbatkę z porcelanowej filiżanki': 'sips tea from a porcelain cup',
  'Magiczny koń z rogiem popijający herbatę!': 'Magical horned horse sipping tea!',
  'pulsuje wszystkimi kolorami tęczy': 'pulses with every color of the rainbow',
  'pływa w powietrzu jak mała rybka': 'swims through the air like a little fish',
  'Japońska przekąska z łososiem latająca w powietrzu!': 'Japanese salmon snack flying through the air!',
  'jeździ sam na kołach z plastrów cytryny': 'rides on wheels made of lemon slices',
  'Pojazd dwukołowy z kołami z kwaśnych cytrusów!': 'Two-wheeled vehicle with sour citrus wheels!',
  'sam wybija żywiołowy rytm karnawału': 'beats out a vibrant carnival rhythm',
  'Instrument perkusyjny grający sambę!': 'Percussion instrument playing samba!',
  'Długonogi różowy ptak w żółtych kaloszach!': 'Long-legged pink bird in yellow rainboots!',
  'nigdy się nie topi i pachnie wanilią': 'never melts and smells like vanilla',
  'Zimny letni deser wielkości małej góry!': 'Cold summer dessert the size of a small mountain!',
  'nosi rogaty hełm i macha miniaturowym toporkiem': 'wears a horned helmet and swings a tiny axe',
  'Żółta gumowa kaczka gotowa do morskiej wyprawy!': 'Yellow rubber duck ready for a sea voyage!',
  'wije się w tańcu z marakasami w dłoniach': 'dances with maracas in hand',
  'Pustynna roślina z kolcami grająca na marakasach!': 'Spiky desert plant playing maracas!',
  'budzik dzwoni i wyrzuca małą złotą kukułkę': 'alarm rings and pops out a small golden cuckoo',
  'Głośne urządzenie odmierzające czas o poranku!': 'Loud morning timekeeping device!',
  'Planety Układu Słonecznego': 'Solar System Planets',
  'Kolejność 8 planet od Słońca': 'Order of 8 planets from the Sun',
  'Moja Wiecznie Zapracowana Mama Zawsze Smaży Nam Placki': 'My Very Educated Mother Just Served Us Noodles',
  'Wyobraź sobie mamę w kosmicznym fartuszku, która smaży na patelni wielkie, gwiezdne naleśniki!': 'Imagine mom in a cosmic apron making starry pancakes for the whole galaxy!',
  'Kolory Tęczy': 'Colors of the Rainbow',
  'Kolejność 6 głównych barw tęczy': 'Order of 6 main rainbow colors',
  'Czemu Patrzysz Żabko Zielona Na Fiołki': 'Run Out Yearly Gathering Blue Violets',
  'Pomarańczowy': 'Orange',
  'Mała zielona żabka siedzi na łące z lupą i ze zdziwieniem wpatruje się w pachnące fiołki!': 'A little green frog sits with a magnifying glass staring at fragrant violets!',
  'C - Czerwony, P - Pomarańczowy, Ż - Żółty, Z - Zielony, N - Niebieski, F - Fioletowy': 'R - Red, O - Orange, Y - Yellow, G - Green, B - Blue, V - Violet',
  'Rzymskie Duże Liczby (50, 100, 500, 1000)': 'Large Roman Numerals (50, 100, 500, 1000)',
  'Kolejność wartości rzymskich liter': 'Order of Roman numeral letter values',
  'Lech Chce Dobrze Mieszkać': 'Lazy Cows Drink Milk',
  'Król Lech buduje wielki, luksusowy marmurowy pałac z basenem w Rzymie!': 'King builds a grand luxury marble palace in ancient Rome!',
  'Geografia i Podróże': 'Geography and Travel',
  'Kierunki Świata na Mapie (Zgodnie z zegarem)': 'Compass Directions on a Map (Clockwise)',
  'Północ, Wschód, Południe, Zachód (N, E, S, W)': 'North, East, South, West (N, E, S, W)',
  'North (Północ)': 'North',
  'East (Wschód)': 'East',
  'South (Południe)': 'South',
  'West (Zachód)': 'West',
  'Wielka czarna wrona w okularach siada na samym środku Twojego ekranu i kracze!': 'A big black crow with spectacles lands right in the center of your screen!',
  'N (góra) -> E (prawo) -> S (dół) -> W (lewo)': 'N (top) -> E (right) -> S (bottom) -> W (left)',
  'Język Polski i Szkoła': 'Language and Grammar',
  'Przypadki w Języku Polskim': 'Grammar Cases',
  '7 przypadków deklinacji': '7 declension cases',
  'Dopełniacz (kogo? czego?)': 'Genitive case',
  'Narzędnik (z kim? z czym?)': 'Instrumental case',
  'Wołacz (o!)': 'Vocative case',
  'Mama kroi świeżą chrupiącą bułkę i smaruje ją wiejskim, pachnącym masłem prosto od krowy!': 'Mom slices fresh crispy bread and spreads country butter straight from the farm!',
  'Mianownik, Dopełniacz, Celownik, Biernik, Narzędnik, Miejscownik, Wołacz': 'Nominative, Genitive, Dative, Accusative, Instrumental, Locative, Vocative',
  'Witaminy Rozpuszczalne w Tłuszczach': 'Fat-Soluble Vitamins',
  'Cztery kluczowe witaminy rozpuszczalne w tłuszczach': 'Four key fat-soluble vitamins',
  'ADEK pije mleko z masłem': 'All Dogs Eat Kibble',
  'Witamina D (odporność i kości)': 'Vitamin D (immunity & bones)',
  'Witamina E (młodość)': 'Vitamin E (cellular youth)',
  'Witamina K (krzepnięcie krwi)': 'Vitamin K (blood clotting)',
  'Chłopiec o imieniu ADEK zjada kromkę z awokado i rośnie silny jak dąb!': 'A boy named ADEK eats an avocado sandwich and grows strong as an oak!',
  'Witaminy A, D, E, K potrzebują tłuszczu, aby organizm mógł je wchłonąć': 'Vitamins A, D, E, K require fat for proper bodily absorption',
  'Kierunki Świata po Polsku (P-W-P-Z)': 'Cardinal Compass Directions',
  'Północ, Wschód, Południe, Zachód': 'North, East, South, West',
  'Pewien Wilk Polował Zawsze': 'Naughty Elephants Spray Water',
  'Północ': 'North',
  'Wschód': 'East',
  'Południe': 'South',
  'Zachód': 'West',
  'Szary wilk z kompasem na szyi biega po lesie i szuka tropów w cztery strony świata!': 'A gray wolf wearing a compass dashes through the woods exploring all 4 directions!',
  'Północ (góra), Wschód (prawo), Południe (dół), Zachód (lewo)': 'North (up), East (right), South (down), West (left)',
  'Dźwięki na Liniach Pięciolinii': 'Treble Clef Line Notes',
  'Pięć linii klucza wiolinowego: E, G, H (B), D, F': 'Five lines of treble clef: E, G, B, D, F',
  'Dźwięki od dołu do góry: E - G - H(B) - D - F': 'Notes from bottom to top: E - G - B - D - F',
  'Układ Słoneczny': 'Solar System',
  'Małe Ciała': 'Small Celestial Bodies',
  'Słońce 🔥': 'Sun 🔥',
  'Ciepło i Światło ⚡': 'Heat and Light ⚡',
  'Przebiśniegi 🌼': 'Snowdrops 🌼',
  'Pąki liści 🌱': 'Leaf buds 🌱',
  'Powrót ptaków 🐦': 'Returning birds 🐦',
  'Upał 🏖️': 'Heat wave 🏖️',
  'Dojrzałe truskawki 🍓': 'Ripe strawberries 🍓',
  'Jesień': 'Autumn',
  'Złote liście 🍁': 'Golden leaves 🍁',
  'Śnieg i bałwan ⛄': 'Snow and snowman ⛄',
  'Mróz na szybie 🧊': 'Window frost 🧊',
  'Ciemny pokój 🌑': 'Dark room 🌑',
  'Brak ekranów przed snem 📵': 'No screens before sleep 📵',
  'Świeże owoce 🍊': 'Fresh fruit 🍊',
  'Ruch i Siła': 'Movement & Strength',
  'Rozciąganie 🧘': 'Stretching 🧘',
  'Sport z przyjaciółmi ⚽': 'Sports with friends ⚽',
  'Spokój Umysłu': 'Peace of Mind',
  'Głęboki oddech 🌬️': 'Deep breath 🌬️',
  'Uśmiech i śmiech 😊': 'Smiles & laughter 😊',
  'Głębia Oceanu': 'Ocean Depths',
  'Błazenek Nemo 🐠': 'Clownfish Nemo 🐠',
  'Kolorowe ukwały 🌸': 'Colorful anemones 🌸',
  'Wesoły delfin 🐬': 'Playful dolphin 🐬',
  'Płetwal błękitny 🐳': 'Blue whale 🐳',
  'Szybcy Łowcy': 'Swift Hunters',
  'Rekin żarłacz 🦈': 'Great white shark 🦈',
  'Drapieżna orka 🖤': 'Predatory orca 🖤',
  'Mieszkańcy Głębin': 'Deep-Sea Dwellers',
  'Świecąca ryba głębinowa 💡': 'Bioluminescent anglerfish 💡',
  'Wielka kałamarnica 🦑': 'Giant squid 🦑',
  'Łączność i Wiedza': 'Communication & Knowledge',
  'Podróże i Ruch': 'Travel & Motion',
  'Okrągłe koło 🛞': 'Round wheel 🛞',
  'Pociąg parowy 🚂': 'Steam train 🚂',
  'Moc i Światło': 'Power & Light',
  'Ogień w jaskini 🔥': 'Cave fire 🔥',
  'Szklana żarówka 💡': 'Glass lightbulb 💡',
  'Zdrowie i Życie': 'Health & Life',
  'Strunowe Dźwięki': 'String Sounds',
  'Dęta Energia': 'Brass Energy',
  'Złota trąbka 🎺': 'Golden trumpet 🎺',
  'Błyszczący saksofon 🎷': 'Shiny saxophone 🎷',
  'Mocny bęben 🥁': 'Thunderous drum 🥁',
  'Dźwięczne talerze 🔔': 'Resonant cymbals 🔔',
  'Równy rytm ⏱️': 'Steady tempo ⏱️',
  'Wpadająca w ucho melodia 🎼': 'Catchy melody 🎼',
  'Ciepła harmonia 🎹': 'Warm harmony 🎹',
  'Mistrzowski Dzień': 'Masterful Day',
  'Zasłane łóżko 🛏️': 'Made bed 🛏️',
  'Plan 3 najważniejszych celów 📋': 'Top 3 daily goals 📋',
  'Głęboka Koncentracja': 'Deep Focus',
  'Świeży Reset': 'Fresh Reset',
  'Krótki spacer 🚶': 'Brisk walk 🚶',
  'Głęboki oddech 🍃': 'Deep breathing 🍃',
  'Chrupiące jabłko 🍏': 'Crisp apple 🍏',
  'Wieczorny Spokój': 'Evening Serenity',
  'Podsumowanie sukcesów ⭐': 'Wins review ⭐',
  'Dobra książka 📖': 'Good book 📖',
  'Ciepłe światło 🕯️': 'Warm glow 🕯️',
  'Pachnące Zioła': 'Aromatic Herbs',
  'Świeża bazylia 🍃': 'Fresh basil 🍃',
  'Włoski makaron 🍝': 'Italian pasta 🍝',
  'Biały ryż 🍚': 'White rice 🍚',
  'Chrupiąca bagietka 🥖': 'Crispy baguette 🥖',
  'Słodka marchewka 🥕': 'Sweet carrot 🥕',
  'Żółta papryka 🫑': 'Yellow bell pepper 🫑',
  'Słodka Nagroda': 'Sweet Reward',
  'Ciepła szarlotka 🥧': 'Warm apple pie 🥧',
  'jabłko': 'apple',
  'pokój': 'room',
  'łóżko': 'bed',
  'książka': 'book',
  'angielski': 'English',
  'Znaczenie:': 'Meaning:',
  'Język:': 'Language:',
  'Wymowa zbliżona do:': 'Pronunciation close to:',
  'grzyb': 'mushroom',
  'Grzyb': 'Mushroom',
  'Wielki leśny borowik wyciąga rękę i krzyczy pirackim głosem: „MASZ RUM w butelce?!”': 'A giant forest mushroom waives its arms inside a cramped tiny ROOM squeezed like MUSH!',
  'świeca': 'candle',
  'Wesoły KUNDELEK biegnie przez pokój, niosąc na czubku ogona płonącą, woskową ŚWIECĘ!': 'A cheerful CAN-DO puppy sprints across the room balancing a glowing wax CANDLE on its tail!',
  'pióro': 'feather',
  'Pióro': 'Feather',
  'Zakładasz wełniany SWETER, a z każdego oczka wyrasta wielkie, łaskoczące gęsie PIÓRO!': 'Checking the WEATHER forecast, fluffy goose FEATHERS drift down from the clouds like snow!',
  'poduszka': 'pillow',
  'Chcesz uciąć deskę, ale zamiast PIŁY trzymasz miękką puchową PODUSZKĘ, z której lecą pióra!': 'A giant vitamin PILL lies asleep in a LOW hammock made of a soft fluffy PILLOW!',
  'rekin': 'shark',
  'Rekin': 'Shark',
  'Groźny żarłacz REKIN macha przyjaźnie ogonem i szczeka jak wierny pies SZARIK!': 'A SHARK with razor-SHARP teeth steers Noah\'s ARK across the waves!',
  'chrząszcz': 'beetle',
  'Chrząszcz': 'Beetle',
  'Cztery CHRZĄSZCZE w czarnych garniturach grają na gitarach na scenie jak The BEATLES!': 'Four shiny green BEETLES in black suits jam on guitars on stage just like The BEATLES!',
  'widelec': 'fork',
  'Wesoła FOKA na plaży żongluje na nosie wielkim, srebrnym WIDELCEM!': 'A playful seal at the beach balances a giant gleaming silver FORK right on its nose!',
  'nietoperz': 'bat',
  'Nietoperz': 'Bat',
  'Czarny NIETOPERZ w masce Zorro lata pod sufitem i strzela z długiego skórzanego BATA!': 'A night BAT wearing a cape zooms past the rafters cracking a superhero grapple!',
  'statek': 'ship',
  'Statek': 'Ship',
  'Potężny STATEK oceaniczny ma zamiast masztów wielkie kolczaste SZYPUŁKI dzikiej róży!': 'A massive ocean SHIP carries a whole flock of fluffy white SHEEP on its main deck!',
  'chmura': 'cloud',
  'Chmura': 'Cloud',
  'Wesoły KLAUN z czerwonym nosem skacze jak na trampolinie po puszystej białej CHMURZE!': 'A laughing CLOWN with a red nose bounces on a soft white CLOUD like a trampoline!',
  'chleb': 'bread',
  'Chleb': 'Bread',
  'Chcesz zjeść chrupiący CHLEB, ale ma na skórce wielki napis BRUD zrobiony z czekolady!': 'You try to slice crusty fresh BREAD, only to find it BARKing cheerfully like a puppy!',
  'Biały KOŃ zakłada garnitur maklera i krzyczy na giełdzie: „Idzie HOSSA, kupujemy siano!”': 'A majestic white HORSE clears its throat because its neigh sounds funny and HOARSE!',
  'wąż': 'snake',
  'Wąż': 'Snake',
  'Długi zielony WĄŻ w ciepłej czapce lepi wesołego bałwana ze ŚNIEGU na mrozie!': 'A sneaky green SNAKE wearing a knit cap tries to SNEAK past a frosty snowman!',
  'Płaszcz': 'Coat',
  'Rudy KOT spaceruje dumnie w długim, ciepłym zimowym PŁASZCZU z paskiem!': 'A ginger CAT struts proudly down the avenue wearing a long belted winter COAT!',
  'lustro': 'mirror',
  'Lustro': 'Mirror',
  'Spoglądasz w LUSTRO, a zamiast Twojej twarzy rośnie w nim zielona MURAWA piłkarska!': 'You gaze into a wall MIRROR and instead of your face, a colorful MURAL blooms inside!',
  'łyżka': 'spoon',
  'Łyżka': 'Spoon',
  'Błyszcząca ŁYŻKA w ciemnych okularach udaje SZPIEGA i nurkuje w talerzu z rosołem!': 'A shiny SPOON wearing SPOOKY sunglasses dives like a secret agent into hot soup!',
  'talerz': 'plate',
  'Talerz': 'Plate',
  'Płetwonurek kładzie wielką gumową PŁETWĘ prosto na płaski TALERZ obiadowy!': 'A scuba diver serves a giant neon rubber diving FIN right on a shiny dinner PLATE!',
  'kubek': 'cup',
  'Kubek': 'Cup',
  'Z kranu robi głośne KAP, KAP, KAP wprost do kolorowego KUBKA z herbatą!': 'Water drips CAP-drip straight from a magic bottle CAP into a bright teacup!',
  'but': 'boot',
  'But': 'Boot',
  'Kowbojski skórzany BUT ma zamiast obcasa wielką metalową BUTLĘ z gazem!': 'A leather cowboy BOOT has a fizzing glass soda BOTTLE instead of a heel!',
  'pierścień': 'ring',
  'Pierścień': 'Ring',
  'Na środku bokserskiego RINGU lśni gigantyczny złoty PIERŚCIEŃ z diamentem!': 'Right in the center of a boxing RING sparkles a giant diamond gold RING!',
  'dzwon': 'bell',
  'Dzwon': 'Bell',
  'Pod dachem wisi drewniana BELKA, na której zawieszony jest wielki mosiężny DZWON!': 'Hanging from a heavy oak BEAM sways a gleaming brass ship\'s BELL!',
  'klucz': 'key',
  'Klucz': 'Key',
  'Wielki złoty KLUCZ do sejfu służy hokeiście jako zakrzywiony KIJ do gry!': 'A giant golden vault KEY is used by an ice hockey star as a winning stick!',
  'zamek': 'lock',
  'Zamek': 'Lock',
  'Fryzjerka robi lokówką wielki, sprężysty LOK z metalowego ZAMKA w drzwiach!': 'A hairstylist uses a curling iron to turn a heavy steel door LOCK into a springy CURL!',
  'lina': 'rope',
  'Lina': 'Rope',
  'Chcesz wspiąć się po LINIE, ale jest cała oblepiona czarną, śliską ROPĄ naftową!': 'You grab a thick climbing ROPE, only to find it dripping in slick dark oil!',
  'liść': 'leaf',
  'Zielony dębowy LIŚĆ wsiada do windy (LIFTU) i wjeżdża na sam czubek drzewa!': 'A bright green oak LEAF steps inside an ELEVATOR and rides to the very treetop!',
  'drzewo': 'tree',
  'Drzewo': 'Tree',
  'W koronie rozłożystego DRZEWA wesołe TRIO wiewiórek śpiewa operową arię!': 'High in the crown of a sprawling TREE, a musical TRIO of squirrels belts an opera!',
  'most': 'bridge',
  'Most': 'Bridge',
  'Kierowcy stoją na wielkim MOŚCIE i z nudów grają na maskach aut w BRYDŻA!': 'Travelers gather atop a towering stone BRIDGE to play a fierce card game of BRIDGE!',
  'jezioro': 'lake',
  'Jezioro': 'Lake',
  'Wrzucasz do czystego JEZIORA musujący LEK witaminowy i cała woda buzuje bąbelkami!': 'You drop a giant fizzy vitamin tablet into a clear blue LAKE and it bubbles like soda!',
  'brzoskwinia': 'peach',
  'Brzoskwinia': 'Peach',
  'Gryziesz soczystą, miękką BRZOSKWINIĘ, a ona głośno PISZCZY ze śmiechu!': 'You bite into a juicy fuzzy PEACH and it SQUEAKS with laughter!',
  'żaba': 'frog',
  'Żaba': 'Frog',
  'Zielona ŻABA zakłada balowy elegancki FRAK (frok) i tańczy walca na liściu lilii!': 'A dashing green FROG slips into a formal evening FROCK and waltzes on a lily pad!',
  'kaczka': 'duck',
  'Kaczka': 'Duck',
  'Żółta KACZKA pływa po stawie i zamiast chleba zajada słodkie DAKTYLE!': 'A yellow DUCK paddles across the pond munching sweet honey DATES instead of bread!',
  'niedźwiedź': 'bear',
  'Niedźwiedź': 'Bear',
  'Brunatny NIEDŹWIEDŹ w koronie trzyma w łapie złote królewskie BERŁO i je miód!': 'A crowned grizzly BEAR holds a gleaming golden SCEPTER while eating wild honey!',
  'wilk': 'wolf',
  'Wilk': 'Wolf',
  'Szary WILK wyje do księżyca stojąc na samym szczycie dymiącego WULKANU!': 'A gray WOLF howls dramatically at the moon right atop an erupting VOLCANO!',
  'lis': 'fox',
  'Lis': 'Fox',
  'Rudy LIS zakłada smoking i tańczy po lesie eleganckiego FOKSTROTA!': 'A sly red FOX buttons a tuxedo and glides through the forest dancing the FOXTROT!',
  'jeleń': 'deer',
  'Jeleń': 'Deer',
  'Dumny JELEŃ z wielkim porożem siada za biurkiem jako nowy DYREKTOR korporacji!': 'A proud DEER with towering antlers sits at a mahogany desk as company DIRECTOR!',
  'koza': 'goat',
  'Koza': 'Goat',
  'Biała rogata KOZA ubiera się na czarno i słucha mrocznej muzyki jak prawdziwy GOT!': 'A horned mountain GOAT dresses in all black and blasts heavy GOTH rock!',
  'świnia': 'pig',
  'Świnia': 'Pig',
  'Różowa ŚWINIA w fartuchu lekarskim przepisuje na katar wielką różową PIGUŁKĘ!': 'A pink PIG wearing a doctor\'s lab coat prescribes a giant pink PILL for a sneeze!',
  'krowa': 'cow',
  'Krowa': 'Cow',
  'Łaciata KROWA na pastwisku pije z filiżanki gorącą KAWĘ z pianką z własnego mleka!': 'A spotted COW out in the pasture sips hot foamy COFFEE from a porcelain cup!',
  'owca': 'sheep',
  'Owca': 'Sheep',
  'Puchata biała OWCA biegnie przez łąkę i z impetem myje językiem wielką SZYBĘ!': 'A fluffy white SHEEP trots across the meadow and shines a giant ship window!',
  'mysz': 'mouse',
  'Mysz': 'Mouse',
  'Mała polna MYSZ w marynarskich pasiastych MAJTKACH steruje żaglówką!': 'A tiny field MOUSE in striped sailor shorts steers a sailboat across the waves!',
  'ptak': 'bird',
  'Ptak': 'Bird',
  'Kolorowy PTAK na gałęzi krzyczy i wywołuje na podwórku wielką awanturę i BURDĘ!': 'A loud tropical BIRD perched overhead starts a noisy backyard BRAWL!',
  'sowa': 'owl',
  'Sowa': 'Owl',
  'Mądra SOWA w birecie profesorskim prowadzi wykład w wielkiej uniwersyteckiej AULI!': 'A wise OWL wearing a mortarboard cap delivers a lecture in a grand university HALL!',
  'orzeł': 'eagle',
  'Orzeł': 'Eagle',
  'Wielki górski ORZEŁ trzyma w szponach zamiast gałązki cienką krawiecką IGŁĘ z nitką!': 'A soaring golden EAGLE clutches a gleaming tailor\'s NEEDLE threaded with silver!',
  'pająk': 'spider',
  'Pająk': 'Spider',
  'Wielki włochaty PAJĄK zakłada kostium Spider-Mana (SPAJDI) i wspina się po ścianie!': 'A giant fuzzy SPIDER pulls on a SPIDEY superhero mask and scales the brick wall!',
  'pszczoła': 'bee',
  'Pszczoła': 'Bee',
  'Pracowita PSZCZOŁA zakłada buty z kolcami i bierze udział w BIEGU sprinterskim na 100m!': 'A busy little BEE laces up track cleats to win the 100-meter SPRINT!',
  'mrówka': 'ant',
  'Mrówka': 'Ant',
  'Mała pracowita MRÓWKA niesie na plecach olbrzymią telewizyjną ANTENĘ satelitarną!': 'A tiny hardworking ANT marches along carrying a giant satellite ANTENNA on its back!',
  'krab': 'crab',
  'Krab': 'Crab',
  'Czerwony morski KRAB szczypcami rozłupuje wielką lodową KRĘ na biegunie!': 'A bright red sea CRAB snaps its giant claws to CRACK a huge polar ice floe!',
  'wieloryb': 'whale',
  'Wieloryb': 'Whale',
  'Olbrzymi błękitny WIELORYB nosi na grzbiecie elegancki smoking uszyty z WELURU!': 'A colossal blue WHALE wears a plush tuxedo tailored from royal VELOUR!',
  'foka': 'seal',
  'Foka': 'Seal',
  'Zwinna FOKA pływa w oceanie z doczepionym do ogona motorowodnym SILNIKIEM turbo!': 'An agile SEAL zooms through ocean swells powered by a roaring turbo ENGINE!',
  'lew': 'lion',
  'Lew': 'Lion',
  'Król zwierząt LEW przed polowaniem zajada chrupiący batonik LION!': 'The king of beasts, a proud LION, unwraps a crunchy caramel LION bar before roaming!',
  'tygrys': 'tiger',
  'Tygrys': 'Tiger',
  'Pasiasty TYGRYS w futrzanej czapce biega po syberyjskiej TAJDZE i szuka ciepła!': 'A striped TIGER wearing a cozy fur hat dashes through the snowy TAIGA!',
  'małpa': 'monkey',
  'Małpa': 'Monkey',
  'Wesoła MAŁPKA kradnie w sklepie elegancką koszulę i zapina złoty spinek w MANKIECIE!': 'A playful MONKEY puts on a tailored dress shirt and snaps gold CUFFlinks in place!',
  'Jabłko': 'Apple',
  'Dyrektor szkoły staje na środku boiska i ogłasza APEL, rzucając w uczniów JABŁKAMI!': 'A school principal makes a grand APPEAL at assembly while juggling shiny APPLES!',
  'gruszka': 'pear',
  'Gruszka': 'Pear',
  'Rozkrawasz żółtą słodką GRUSZKĘ, a w środku lśni wielka biała morska PERŁA!': 'You slice open a sweet golden PEAR and find a shimmering white sea PEARL inside!',
  'śliwka': 'plum',
  'Śliwka': 'Plum',
  'Fioletowa soczysta ŚLIWKA spada na biały obrus i zostawia wielką atramentową PLAMĘ!': 'A juicy purple PLUM drops onto a white tablecloth leaving a giant ink STAIN!',
  'wiśnia': 'cherry',
  'Wiśnia': 'Cherry',
  'Dojrzała czerwona WIŚNIA świeci w nocy intensywną, neonową CZERWIENIĄ!': 'A ripe red CHERRY glows in the pitch dark like a blazing neon RED beacon!',
  'orzech': 'nut',
  'Orzech': 'Nut',
  'Rozłupujesz twardy ORZECH włoski, a ze środka wylatuje złota, śpiewająca NUTA muzyczna!': 'You crack open a hard walnut NUT and out floats a singing golden musical NOTE!',
  'marchew': 'carrot',
  'Marchew': 'Carrot',
  'Królewska pomarańczowa MARCHEW jedzie do pałacu w złotej KARECIE zaprzężonej w konie!': 'A royal orange CARROT rides to the palace inside a glittering golden CARRIAGE!',
  'cebula': 'onion',
  'Cebula': 'Onion',
  'Kroisz ostrą CEBULĘ i płaczesz, a biały ANIOŁ podaje Ci chusteczkę do nosa!': 'You chop a sharp ONION and tear up until a snow-white ANGEL hands you a tissue!',
  'czosnek': 'garlic',
  'Czosnek': 'Garlic',
  'Biały ząbek CZOSNKU wskakuje do wielkiego GARA z gorącą zupą i odstrasza wampiry!': 'A clove of white GARLIC leaps into a giant bubbling soup POT to scare off vampires!',
  'mleko': 'milk',
  'Mleko': 'Milk',
  'Karton białego MLEKA wygrywa na loterii MILION złotych i oblewa wszystkich ze szczęścia!': 'A carton of fresh MILK wins a MILLION-dollar lottery and throws a splash party!',
  'ser': 'cheese',
  'Ser': 'Cheese',
  'Żółty szwajcarski SER z dziurami bierze kąpiel w wannie, bo lubi być pachnący i CZYSTY!': 'A wedge of Swiss CHEESE takes a bubble bath because it insists on staying squeaky CLEAN!',
  'masło': 'butter',
  'Masło': 'Butter',
  'Smarujesz kanapkę żółtym MASŁEM, a kromka zaczyna świecić, bo masło to BATERIA!': 'You spread yellow BUTTER on toast and the slice glows bright like a high-voltage BATTERY!',
  'mięso': 'meat',
  'Mięso': 'Meat',
  'Wikingowie siadają przy ognisku, pieką soczyste MIĘSO i opowiadają prastary grecki MIT!': 'Vikings gather around a roaring campfire to roast juicy MEAT and swap an ancient MYTH!',
  'ryba': 'fish',
  'Ryba': 'Fish',
  'Srebrna RYBA wyskakuje z wody i uczy się słówek, zapisując je na papierowej FISZCE!': 'A silver FISH leaps out of the river to study new flashcards by the bank!',
  'zupa': 'soup',
  'Zupa': 'Soup',
  'Głodny leśny SĘP przylatuje do kuchni i z apetytem zajada gorącą pomidorową ZUPĘ!': 'A hungry mountain VULTURE swoops into the kitchen and slurps up hot tomato SOUP!',
  'sól': 'salt',
  'Sól': 'Salt',
  'Solniczka z białą SOLĄ wyskakuje w powietrze i robi potrójne akrobatyczne SALTO!': 'A crystal SALT shaker springs off the table and flips a triple acrobatic SOMERSAULT!',
  'cukier': 'sugar',
  'Cukier': 'Sugar',
  'Biały słodki CUKIER wsypuje się do szklanki z głośnym SZUR, SZUR po dnie!': 'Sweet white SUGAR pours into a tall glass making a rhythmic rustling cascade!',
  'miód': 'honey',
  'Miód': 'Honey',
  'Mała dziewczynka HANIA smaruje pajdę chleba słodkim, lejącym się MIODEM!': 'A buzzing bee named HONEY spreads thick golden HONEY across a warm slice of bread!',
  'ciasto': 'cake',
  'Ciasto': 'Cake',
  'Kucharz piecze urodzinowe CIASTO, ale przez pomyłkę wychodzi mu bakaliowy KEKS!': 'A pastry chef bakes a birthday CAKE that mysteriously transforms into a fruit-packed pound loaf!',
  'dom': 'house',
  'Dom': 'House',
  'Wielki piętrowy DOM trzęsie się w posadach, bo dzieci robią w nim potworny HAŁAS!': 'A grand two-story HOUSE shakes from roof to cellar with a joyful HULLABALOO!',
  'Pokój': 'Room',
  'Otwierasz drzwi do POKOJU, a tam meble tańczą i robią ogromny RUMOR!': 'You open the DOOR to your ROOM and find all the furniture dancing in a wild RUMOR!',
  'drzwi': 'door',
  'Drzwi': 'Door',
  'Pukasz w drewniane DRZWI, a one grają głośny, wesoły akord w tonacji C-DUR!': 'You knock on an oak DOOR and it chimes back with a booming major piano CHORD!',
  'okno': 'window',
  'Okno': 'Window',
  'Zamiast otwierać OKNO, wciskasz guzik i całe okno zjeżdża w dół jak WINDA!': 'Instead of pushing the WINDOW latch, you press a button and the glass glides down like an elevator!',
  'podłoga': 'floor',
  'Podłoga': 'Floor',
  'Myjesz PODŁOGĘ mopem, a deski zamieniają się w piaszczystą plażę na FLORYDZIE!': 'You mop the wooden FLOOR and suddenly the planks turn into a sunny FLORIDA beach!',
  'dach': 'roof',
  'Dach': 'Roof',
  'Na spadzisty DACH domu spada z nieba wielka drewniana RUFA statku piratów!': 'High atop the slanted HOUSE ROOF drops the wooden STERN of a floating pirate ship!',
  'ściana': 'wall',
  'Ściana': 'Wall',
  'Biała ŚCIANA w pokoju pęka i zamienia się w wysoki ziemny WAŁ przeciwpowodziowy!': 'The white bedroom WALL opens up into a towering stone castle rampart!',
  'stół': 'table',
  'Stół': 'Table',
  'Drewniany STÓŁ jadalny zamienia się nagle w szkolną TABLICĘ ze wzorami matematycznymi!': 'A wooden dining TABLE flips upright into a classroom CHALKBOARD packed with equations!',
  'krzesło': 'chair',
  'Krzesło': 'Chair',
  'Wygodne biurowe KRZESŁO zaczyna świecić na jaskrawy CZERWONY kolor!': 'A comfy rolling office CHAIR begins glowing bright cherry RED!',
  'Łóżko': 'Bed',
  'Pustynny BEDUIN rozbija namiot na piasku i kładzie się spać w wielkim miękkim ŁÓŻKU!': 'A desert nomad pitches a tent on golden dunes and sinks into a giant plush BED!',
  'zegar': 'clock',
  'Zegar': 'Clock',
  'Ścienny ZEGAR tyka głośno, a z kukułki zamiast ptaka wylatuje ciężki drewniany KLOC!': 'A wall CLOCK ticks loud while a heavy wooden BLOCK shoots out of the cuckoo door!',
  'W wielkiej starej KSIĄŻCE zamiast papieru są liście potężnego BUKU!': 'Inside an ancient leather BOOK, every crisp page is made of vibrant green beech leaves!',
  'długopis': 'pen',
  'Długopis': 'Pen',
  'Piszesz sprawdzian DŁUGOPISEM, a z wkładu zamiast tuszu wylatują złote PIENIĄDZE!': 'You write with a ballpoint PEN and shiny golden PENNIES pour out instead of ink!',
  'torba': 'bag',
  'Torba': 'Bag',
  'Wrzucasz zakupy do płóciennej TORBY, a w środku bulgocze zielone, pachnące BAGNO!': 'You toss groceries into a canvas BAG and discover a bubbling emerald BOG inside!',
  'pudełko': 'box',
  'Pudełko': 'Box',
  'Otwierasz kartonowe PUDEŁKO z paczką, a ze środka wyskakuje BOKSER w rękawicach!': 'You rip open a cardboard BOX and a prizefighting BOXER pops out wearing giant red gloves!',
  'samochód': 'car',
  'Samochód': 'Car',
  'Szybki sportowy SAMOCHÓD parkuje na zakazie i kierowcę spotyka surowa KARA!': 'A sleek red sports CAR parks beside a hydrant and gets a giant neon parking TICKET!',
  'autobus': 'bus',
  'Autobus': 'Bus',
  'Żółty szkolny AUTOBUS gubi drogę we mgle i kierowca nawiguje wielką mosiężną BUSOLĄ!': 'A yellow school BUS steers through thick fog using a gigantic gleaming brass COMPASS!',
  'pociąg': 'train',
  'Pociąg': 'Train',
  'Długi POCIĄG towarowy zatrzymuje się na stacji, a maszynistą jest surowy TRENER fitness!': 'A long freight TRAIN pulls into the station driven by a whistle-blowing fitness TRAINER!',
  'samolot': 'plane',
  'Samolot': 'Plane',
  'Wielki pasażerski SAMOLOT rozkłada w locie gigantyczny papierowy PLAN miasta!': 'A giant silver airPLANE unfolds a colossal city blueprint across the sky!',
  'rower': 'bike',
  'Rower': 'Bike',
  'Czerwony dziecięcy ROWER sam kręci pedałami i przenosi Cię wprost w środek BAJKI!': 'A bright red BICYCLE pedals all by itself, carrying you straight into a fairy TALE!',
  'droga': 'road',
  'Droga': 'Road',
  'Szeroka asfaltowa DROGA prowadzi prosto do zamku, w którym mieszka królewski RÓD!': 'A wide cobblestone ROAD leads straight up to the castle of a noble ROYAL line!',
  'słońce': 'sun',
  'Słońce': 'Sun',
  'Gorące żółte SŁOŃCE zakłada okulary przeciwsłoneczne i jeździ po chmurach w SANIACH!': 'The blazing golden SUN wears sunglasses and glides across the clouds in a wooden SLEIGH!',
  'księżyc': 'moon',
  'Księżyc': 'Moon',
  'Srebrny KSIĘŻYC w pełni zakłada wojskowy MUNDUR i salutuje gwiazdom na niebie!': 'The bright full MOON buttons up a crisp dress UNIFORM and salutes the twinkling stars!',
  'gwiazda': 'star',
  'Gwiazda': 'Star',
  'Jasna lśniąca GWIAZDA na niebie mruga okiem i mówi, że jest już bardzo STARA!': 'A dazzling STAR in the midnight sky winks and tells stories billions of years old!',
  'deszcz': 'rain',
  'Deszcz': 'Rain',
  'Z nieba leje ulewny DESZCZ, a renifery Świętego Mikołaja tańczą w kałużach!': 'Pouring summer RAIN drumbeats outside while Santa\'s REINDEER tap-dance in the puddles!',
  'śnieg': 'snow',
  'Śnieg': 'Snow',
  'Zimą na pole spada biały puchaty ŚNIEG i przykrywa wysoki SNOPEK siana!': 'Soft winter SNOW drifts across the fields blanketing a tall golden SHEAF of wheat!',
  'wiatr': 'wind',
  'Wiatr': 'Wind',
  'Za oknem wieje potężny WIATR, który porywa zewnętrzną szklaną WINDĘ wieżowca!': 'A gusty autumn WIND whistles outside and spins a skyscraper\'s glass elevator!',
  'ogień': 'fire',
  'Ogień': 'Fire',
  'W kominku płonie wesoły OGIEŃ, z którego strzelają kolorowe sylwestrowe FAJERWERKI!': 'A cozy hearth FIRE crackles brightly, launching colorful New Year\'s FIREWORKS!',
  'woda': 'water',
  'Woda': 'Water',
  'Odkręcasz kran z czystą WODĄ, a ze zlewu zamiast kropel wylatuje słodka WATA cukrowa!': 'You turn on the tap for fresh WATER and clouds of sweet pink COTTON CANDY pour out!',
  'morze': 'sea',
  'Morze': 'Sea',
  'Błękitne wzburzone MORZE wyrzuca na brzeg falę, która jest miękka jak kocia SIERŚĆ!': 'A rolling turquoise SEA crashes onto the shore with waves as fluffy as kitten FUR!',
  'piasek': 'sand',
  'Piasek': 'Sand',
  'Chodzisz po gorącej plaży, a żółty drobny PIASEK sam wskakuje Ci w skórzany SANDAŁ!': 'Strolling across a sunny beach, warm golden SAND leaps playfully into your leather SANDAL!',
  'skała': 'rock',
  'Skała': 'Rock',
  'Stroma twarda SKAŁA w górach ma na szczycie wielki napis: „Szczęśliwego Nowego ROKU!”': 'A towering granite ROCK on the mountain peak is carved with a giant \'HAPPY NEW YEAR!\' banner!',
  'moneta': 'coin',
  'Moneta': 'Coin',
  'Wrzucasz do skarbonki błyszczącą MONETĘ, a ze środka słychać, jak rży mały KOŃ!': 'You drop a gleaming gold COIN into your piggy bank and hear a tiny HORSE neigh inside!',
  'miecz': 'sword',
  'Miecz': 'Sword',
  'Rycerz wyciąga ze skały ostry MIECZ, a w powietrzu unosi się zapach spalenizny i SWĄD!': 'A valiant knight draws a blazing SWORD from the stone trailing sparks and smoky plumes!',
  'korona': 'crown',
  'Korona': 'Crown',
  'Królewska złota KORONA z diamentami leży w łazience i zatyka cieknący KRAN!': 'A jeweled royal golden CROWN sits in the sink plugging a leaky bathroom FAUCET!',
  'Sekret jest prosty: nasz mózg gubi się w nudnych cyfrach, ale uwielbia bajki i kolorowe obrazy! 🖼️': 'The secret is simple: our brains get lost in dull digits, but adore stories and colorful pictures! 🖼️',
  'Wyobraź sobie, jak Łabędź podpływa do brzegu i nakłada szalik Bałwanowi 🦢🧣☃️.': 'Imagine a Swan swimming to shore and wrapping a scarf around a Snowman 🦢🧣☃️.',
  'Trzy cyfry! Użyjemy trzech kształtów: 4 (Żaglówka ⛵), 8 (Bałwan ☃️) i 2 (Łabędź 🦢).': 'Three digits! We\'ll use three shapes: 4 (Sailboat ⛵), 8 (Snowman ☃️), and 2 (Swan 🦢).',
  'Scena: Bałwan płynie Żaglówką ciągniętą przez wielkiego Łabędzia!': 'Scene: A Snowman sails in a Sailboat pulled by a giant Swan!',
  'Możesz też powtórzyć w myślach rytm: cztery-osiem-dwa 🎵': 'You can also repeat the rhythm in your mind: four-eight-two 🎵',
  'Pora na najważniejszą technikę codzienności: GRUPOWANIE (Chunking) ✂️': 'Time for the most vital everyday technique: CHUNKING ✂️',
  'Pamięć robocza nie lubi 4 osobnych cyfr. Zamiast 7-1-5-9 podziel je na dwie pary: 71 i 59!': 'Working memory dislikes 4 isolated digits. Instead of 7-1-5-9, split them into two pairs: 71 and 59!',
  'Dokładnie tak, jak zapamiętujesz kod PIN do karty bankomatowej.': 'Just like memorizing a debit card PIN code.',
  'Pięć cyfr z rzędu bez techniki to dla większości ludzi chaos.': 'Five digits in a row without a technique feels like chaos to most people.',
  'Zupełnie jak kod pocztowy Twojego ulubionego miasta 📮': 'Just like the ZIP code of your favorite city 📮',
  'Płacisz w internecie kodem BLIK? Kod ma 6 cyfr podzielonych 3 + 3.': 'Paying online with a 6-digit code? It\'s divided 3 + 3.',
  'Zobacz: 528 i 913. Przeczytaj je jak dwie liczby: „pięćset dwadzieścia osiem” i „dziewięćset trzynaście”.': 'Look: 528 and 913. Read them as two numbers: "five hundred twenty-eight" and "nine hundred thirteen".',
  'Sławny psycholog George Miller udowodnił, że ludzka pamięć mieści 7 ± 2 elementy.': 'Famous psychologist George Miller proved that human working memory holds 7 ± 2 items.',
  'Większość ludzi tu odpada. Ty podziel te 7 cyfr na 3 paczki: 730 · 52 · 91.': 'Most people drop out here. You divide those 7 digits into 3 chunks: 730 · 52 · 91.',
  'Rytm w głowie czyni cuda!': 'Mental rhythm works wonders!',
  'Najlepsze paczki pamięciowe to te, które już znasz!': 'The best memory chunks are the ones you already know!',
  'Zobaczysz 8 cyfr złożonych z dwóch słynnych dat z historii Polski 📜': 'You will see 8 digits made of two historic milestone dates 📜',
  'Mózg od razu je rozpozna!': 'Your brain recognizes them instantly!',
  'OTO ŚWIĘTY GRAAL SZKOLENIA: PEŁNE 9 CYFR! 📱': 'HERE IS THE HOLY GRAIL OF TRAINING: A FULL 9 DIGITS! 📱',
  'Wyobraź sobie, że ktoś dyktuje Ci swój numer: 604 · 281 · 937.': 'Imagine someone dictating their phone number: 604 · 281 · 937.',
  'Trzy paczki po 3 cyfry. Powtórz je w myślach jak refren hitu z radia!': 'Three chunks of 3 digits. Repeat them like a catchy radio chorus!',
  'Teraz magia arcymistrzów! ✨ System Major zamienia cyfry w SPÓŁGŁOSKI.': 'Now for grandmaster magic! ✨ The Major System turns digits into CONSONANTS.',
  'Samogłoski (A E I O U Y) wstawiasz dowolnie, tworząc słowa!': 'Insert vowels (A E I O U Y) freely to form memorable words!',
  'Np. 14 = T-R → „TOR” 🛤️ oraz 31 = M-T → „MATA” 🧘. Zapamiętaj obrazy!': 'E.g., 14 = T-R → "TRACK" 🛤️ and 31 = M-T → "MAT" 🧘. Memorize the images!',
  'Trzy obrazy dają aż 6 cyfr na raz! Połącz je w krótką historyjkę.': 'Three images yield 6 digits at once! Weave them into a short story.',
  'Im śmieszniejsza, tym lepiej – mózg kocha absurd 🤪': 'The funnier, the better – the brain loves absurdity 🤪',
  'Cztery obrazy – aż 8 cyfr! Każdy kolejny obraz wpinaj jak wagonik pociągu.': 'Four images – 8 full digits! Hook each new image like a train car.',
  'FALA 🌊 uderza w NOS 👃, który trzyma LINĘ 🪢 przywiązaną do MATY 🧘!': 'A WAVE 🌊 hits a NOSE 👃 holding a ROPE 🪢 tied to a MAT 🧘!',
  'Czas sprawdzić swoje siły bez podpowiedzi obrazkowych!': 'Time to test your strength without image hints!',
  '10 cyfr! Zastosuj podział na 5 par: 48 · 26 · 15 · 09 · 37.': '10 digits! Use a 5-pair split: 48 · 26 · 15 · 09 · 37.',
  'Pełny numer z kierunkowym to aż 11 cyfr!': 'A full international number is 11 digits!',
  'Pierwsze dwie znasz bez mrugnięcia okiem: 48 to Polska 🇵🇱! Zostały tylko 3 paczki telefonu.': 'You know the first two in a blink: 48 is the country code 🇵🇱! Only 3 phone chunks left.',
  'To jest ten moment! Finałowa lekcja szkolenia: aż 12 cyfr w 4 paczkach.': 'This is the moment! The grand finale lesson: 12 digits in 4 chunks.',
  'Połącz wszystko: kształty, rytm i grupowanie. Wierzę w Ciebie! 🌟': 'Combine everything: shapes, rhythm, and chunking. I believe in you! 🌟',
  'Rawrr! Cześć! Jestem Tygrysek Leon 🐯 i zabiorę Cię do Twojego własnego Pałacu Pamięci.': 'Rawrr! Hi! I\'m Leo the Tiger 🐯 and I will guide you to your own Memory Palace.',
  'Po co Ci ta technika? Dzięki niej wygłosisz prezentację w szkole lub w pracy bez żadnej ściągawki, zapamiętasz wierszyk, trudne fakty na klasówkę z historii albo całą listę zadań na dany dzień!': 'Why this technique? Deliver school or work presentations without notes, memorize poems, exam facts, or your daily to-do list with ease!',
  'Czy wiesz, że Twój mózg pamięta drogę do domu nawet po latach, ale zapomina listę zakupów w 5 minut? Mamy w głowie genialny GPS!': 'Did you know your brain remembers the way home for years, but forgets a shopping list in 5 minutes? We have a built-in GPS!',
  'Metoda Loci polega na tym, że zamiast nudnego wkuwania, wchodzimy do wyobrażonego pałacu i zostawiamy w pokojach śmieszne przedmioty.': 'The Method of Loci lets you walk through an imaginary palace and place funny objects in each room instead of rote memorization.',
  'Zacznijmy powoli od zaledwie 2 komnat: Złotej Bramy i Marmurowego Holu. Zobacz, jakie to proste i przyjemne!': 'Let\'s begin gently with just 2 rooms: the Golden Gate and the Marble Hall. See how simple and fun it is!',
  'Wspaniale Ci poszło! Czas na najważniejszą zasadę zapamiętywania: ZASADĘ ABSURDU ⚡': 'Wonderful work! Time for the single most important memory rule: THE PRINCIPLE OF ABSURDITY ⚡',
  'Gdybyś wyobraził sobie zwykły ołówek leżący na stole – zapomnisz go za godzinę. Ale gdy ten ołówek skacze na jednej nodze i krzyczy – zostanie w głowie na zawsze!': 'Imagine a plain pencil on a table – forgotten in an hour. But if that pencil hops on one foot screaming, it sticks forever!',
  'Im obraz jest bardziej komiczny, przerysowany i dynamiczny, tym mocniej angażuje neurony.': 'The more comical, exaggerated, and dynamic the mental picture, the deeper the neural imprint.',
  'Odwiedzimy 3 komnaty: Salę Kominkową, Kuchnię i Spiżarnię. Wyobrażaj sobie te sceny bardzo wyraźnie!': 'We\'ll visit 3 rooms: Fireplace Hall, Kitchen, and Pantry. Visualize these scenes in vivid detail!',
  'Rozwijasz skrzydła! Dziś poznasz ZASADĘ ŚCIEŻKI 🧭': 'Spreading your wings! Today you will learn THE PATHWAY RULE 🧭',
  'Wyobraź sobie, że wchodzisz do pokoju. Zawsze omiataj go wzrokiem w stałym porządku – na przykład zgodnie z ruchem wskazówek zegara: od lewej do prawej.': 'Picture entering a room. Always scan it in a fixed direction – clockwise, left to right.',
  'Dzięki temu nigdy nie pominiesz żadnego przedmiotu ani nie pomylisz ich kolejności.': 'This guarantees you\'ll never skip an object or scramble the order.',
  'Przejdźmy trasę przez 4 kolejne komnaty pałacu: Bibliotekę, Ogród Zimowy, Gabinet Luster i Balkon.': 'Let\'s trace a route through 4 palace rooms: Library, Winter Garden, Hall of Mirrors, and Balcony.',
  'Czy zdarzyło Ci się pójść do sklepu, zapomnieć kartki i wrócić bez połowy zakupów? Od dziś to przeszłość! 🛒': 'Ever walk into a grocery store and forget half your items? Never again! 🛒',
  'Użyjemy 5 pierwszych komnat pałacu, aby bezbłędnie zapamiętać 5 codziennych sprawunkowych przedmiotów.': 'We will use the first 5 palace rooms to memorize 5 everyday shopping items flawlessly.',
  'Zamień nudne zakupy w szaloną kreskówkę!': 'Turn boring shopping into a wacky cartoon!',
  'Półmetek szkolenia! Czas na prawdziwe wyzwanie: 6 komnat i ZASADĘ ZMYSŁÓW 🎨👃👂': 'Halfway mark! Time for a real challenge: 6 rooms and THE SENSORY RULE 🎨👃👂',
  'Włącz zmysły: poczuj zapach dymu z kominka, usłysz brzęk miedzianych patelni, dotknij zimnego marmuru.': 'Engage all senses: smell fireplace smoke, hear clattering copper pans, touch cold marble.',
  'Im więcej zmysłów zaangażujesz, tym trwalszy ślad w pamięci!': 'The more senses you activate, the stronger the memory trace!',
  'Siedem komnat! To idealna liczba na zapamiętanie dni tygodnia, 7 cudów świata czy 7 nawyków skutecznego działania.': 'Seven rooms! Perfect for days of the week, the 7 wonders of the world, or 7 core habits.',
  'Przejdź przez pałac z uśmiechem i pewnością siebie – Twój umysł radzi sobie rewelacyjnie!': 'Walk through the palace with confidence and a smile – your mind is doing brilliantly!',
  'Przed Tobą aż 8 komnat! Tyle wystarczy, by zapamiętać kolejność planet od Słońca albo główne punkty referatu.': 'Eight grand rooms ahead! Enough to memorize planets from the sun or main presentation bullet points.',
  'Zwróć uwagę, jak płynnie przechodzisz z jednej komnaty do drugiej, jakbyś oglądał film.': 'Notice how smoothly you glide from room to room, just like watching a movie.',
  'Prawie na szczycie! 9 komnat to już poziom profesjonalnych mnemotechników.': 'Almost at the summit! 9 rooms is professional mnemonist territory.',
  'Dodajemy Skarbiec i Wysoką Wieżę. Zobacz, jak Twój pałac tętni życiem!': 'We add the Treasury and High Tower. See your palace buzzing with life!',
  'WIELKI FINAŁ U TYGRYSKA LEONA! 🏰🏆': 'GRAND FINALE WITH LEO THE TIGER! 🏰🏆',
  'Wszystkie 10 komnat w jednym wielkim marszu: od Złotej Bramy aż po Taras Widokowy na dachu pałacu.': 'All 10 rooms in one grand tour: from Golden Gate to the rooftop Scenic Terrace.',
  'Opanowałeś najpotężniejszą technikę starożytnych greckich mówców. Gratulacje, Mistrzu Loci!': 'You have mastered the most potent technique of ancient Greek orators. Congratulations, Master of Loci!',
  'Po co nam ta technika? Nasz mózg bardzo szybko męczy się i gubi, gdy musi zapamiętać suchą listę rzeczy w konkretnej kolejności. Jednak gdy z pierwszych liter ułożysz jedno zabawne, rymowane zdanie – zapamiętasz całą listę w mgnieniu oka na całe życie!': 'Why this technique? Our brains tire quickly trying to memorize dry lists in strict order. But when first letters form a funny rhyming sentence, you remember the whole list effortlessly for life!',
  'Ta metoda nazywa się akrostychem lub metodą pierwszych liter. Zobacz, jak łatwo zapamiętać wszystkie 6 głównych kolorów tęczy:': 'This is called an acrostic or first-letter method. See how easy it is to memorize the 6 main rainbow colors:',
  'Zdanie-trop brzmi: „Czemu Patrzysz Żabko Zielona Na Fiołki?”': 'The memory cue is: "Richard Of York Gave Battle In Vain" (Red, Orange, Yellow, Green, Blue, Indigo, Violet)',
  'Spójrz na pierwsze litery każdego słowa:': 'Look at the first letter of each word:',
  '• Czemu → Czerwień (Czerwony 🔴)': '• C / Red → Red 🔴',
  '• Patrzysz → Pomarańcz (Pomarańczowy 🟠)': '• P / Orange → Orange 🟠',
  '• Żabko → Żółć (Żółty 🟡)': '• Y / Yellow -> Yellow 🟡',
  '• Zielona → Zieleń (Zielony 🟢)': '• Z / Green → Green 🟢',
  '• Fiołki → Fiolet (Fioletowy 🟣)': '• F / Violet → Violet 🟣',
  'Wystarczy, że wyobrazisz sobie małą zieloną żabkę wąchającą fiołki, a kolory tęczy ułożą się same!': 'Picture a little green frog smelling violets, and the colors fall into place automatically!',
  'Po co nam ten trop? Pytanie o kolejność planet pojawia się w szkole, w teleturniejach i w quizach wiedzy ogólnej. Próba wkuwania ich na pamięć kończy się myleniem Merkurego z Marsem.': 'Why this cue? Planet order appears in school, trivia, and quizzes. Rote cramming leads to mixing up Mercury and Mars.',
  'Oto najsłynniejsze i najskuteczniejsze zdanie w polskiej edukacji:': 'Here is the classic and most effective mnemonic sentence:',
  '„Moja Wiecznie Zapracowana Mama Zawsze Smaży Nam Placki”': '"My Very Educated Mother Just Served Us Noodles" (or Polish: "Moja Wiecznie Zapracowana Mama...")',
  'Każde słowo koduje kolejną planetę wędrującą od Słońca:': 'Each word codes the next planet traveling outward from the Sun:',
  '• Moja → Merkury ☿️ (najbliżej Słońca)': '• My / Moja → Mercury ☿️ (closest to the Sun)',
  '• Wiecznie → Wenus ♀️ (najgorętsza)': '• Very / Wiecznie → Venus ♀️ (hottest planet)',
  '• Zapracowana → Ziemia 🌍 (nasz dom!)': '• Educated / Zapracowana → Earth 🌍 (our home!)',
  '• Mama → Mars ♂️ (Czerwona Planeta)': '• Mother / Mama → Mars ♂️ (the Red Planet)',
  '• Zawsze → Jowisz ♃ (największy gazowy gigant)': '• Just / Zawsze → Jupiter ♃ (giant gas giant)',
  '• Smaży → Saturn ♄ (zjawiskowe pierścienie)': '• Served / Smaży → Saturn ♄ (spectacular rings)',
  '• Nam → Uran ♅ (lodowy błękit)': '• Us / Nam → Uranus ♅ (ice blue giant)',
  '• Placki → Neptun ♆ (wietrzny i odległy)': '• Noodles / Placki → Neptune ♆ (windy and distant)',
  'Wyobraź sobie mamę w skafandrze kosmicznym smażącą gwiezdne placki, a układ planet masz w małym palcu!': 'Imagine mom in a space suit frying cosmic pancakes, and the solar system is yours!',
  'Po co nam ten trop? Na zegarach, budynkach i w datach książek spotykasz rzymskie litery L, C, D, M. Większość ludzi nie wie, która jest większa!': 'Why this cue? Clocks, monuments, and book copyrights use Roman numerals L, C, D, M. Most people mix up which is larger!',
  'Dzięki Pieskowi Łatkowi zapamiętasz je w 5 sekund na całe życie! Zdanie brzmi:': 'Thanks to Patch the Dog, remember them in 5 seconds for life! The phrase is:',
  '„Lech Chce Dobrze Mieszkać”': '"Lazy Cows Drink Milk" (L=50, C=100, D=500, M=1000)',
  'Zobacz, jak litery rosną od 50 do 1000:': 'See how the numerals grow from 50 to 1,000:',
  '• Lech → L = 50 🏛️': '• Lazy / Lech → L = 50 🏛️',
  '• Chce → C = 100 💯 (jak stulecie - century)': '• Cows / Chce → C = 100 💯 (like century)',
  '• Dobrze → D = 500 🏰': '• Drink / Dobrze → D = 500 🏰',
  '• Mieszkać → M = 1000 👑 (jak millennium)': '• Milk / Mieszkać → M = 1,000 👑 (like millennium)',
  'Gdy widzisz rzymską liczbę, przypomnij sobie króla Lecha budującego zamek i od razu znasz wartość!': 'Whenever you spot Roman numerals, recall King Lech building his castle and decode them instantly!',
  'Wchodzimy w świat biologii i medycyny! Czy wiesz, z jakich 6 pierwiastków zbudowane jest 99% każdego żywego organizmu na Ziemi?': 'Welcome to biology and medicine! Did you know 99% of living matter on Earth is made of 6 chemical elements?',
  'Zamiast uczyć się ich na pamięć, wystarczy jedno magiczne słowo-klucz:': 'Instead of brute cramming, one magical acronym unlocks them all:',
  'Słowo-klucz: „C-H-N-O-P-S” (czytamy: CHNOPS)': 'Key acronym: "C-H-N-O-P-S" (pronounced: CHNOPS)',
  'To symbole chemiczne pierwiastków życia:': 'These are the chemical symbols for the elements of life:',
  '• C → Węgiel (Carbon ⬛)': '• C → Carbon ⬛',
  '• H → Wodór (Hydrogen 💧)': '• H → Hydrogen 💧',
  '• N → Azot (Nitrogen 💨)': '• N → Nitrogen 💨',
  '• O → Tlen (Oxygen 🫁)': '• O → Oxygen 🫁',
  '• P → Fosfor (Phosphorus ⚡)': '• P → Phosphorus ⚡',
  '• S → Siarka (Sulfur 🌋)': '• S → Sulfur 🌋',
  'A jak zapamiętać witaminy rozpuszczalne w tłuszczach? Wystarczy imię chłopca: ADEK (witaminy A, D, E, K)!': 'And how about fat-soluble vitamins? Just remember the boy\'s name: ADEK (vitamins A, D, E, K)!',
  'Pora na muzykę i naukę języka polskiego! Jak zapamiętać dźwięki 6 strun gitary od najgrubszej do najcieńszej (E, H, G, D, A, E)?': 'Time for music and language arts! How to memorize 6 guitar strings from thickest to thinnest (E, B, G, D, A, E)?',
  'Oto wesołe zdanie gitarzystów:': 'Here is the guitarist\'s favorite rhyme:',
  '„Edek Hoduje Gołębie Dla Agaty Ewy”': '"Every Good Boy Does Fine" (Treble Staff E-G-B-D-F)',
  'A jak zapamiętać 7 przypadków gramatycznych (Mianownik, Dopełniacz, Celownik, Biernik, Narzędnik, Miejscownik, Wołacz)?': 'And what about the 7 grammar cases (Nominative, Genitive, Dative, Accusative, Instrumental, Locative, Vocative)?',
  'Klasyczne polskie zdanie ze szkoły:': 'The classic school mnemonic sentence:',
  '„Mama Dała Córce Bułkę Nasmarowaną Masłem Wiejskim”': '"Mama Gave Daughter A Buttered Roll" (7 grammatical cases)',
  '• Mianownik (Mama), Dopełniacz (Dała), Celownik (Córce), Biernik (Bułkę), Narzędnik (Nasmarowaną), Miejscownik (Masłem), Wołacz (Wiejskim)!': '• Nominative, Genitive, Dative, Accusative, Instrumental, Locative, Vocative!',
  'WIELKI FINAŁ U PIESKA ŁATKA! Jak tworzyć własne akrostychy do dowolnego sprawdzianu?': 'GRAND FINALE WITH PATCH THE DOG! How to build your own acrostics for any test?',
  'Oto prosta formuła w 3 krokach:': 'Here is the simple 3-step formula:',
  '1. Wypisz pierwsze litery listy, którą musisz zapamiętać.': '1. Write down the first letters of the list you need to memorize.',
  '2. Ułóż z nich wesołe, rymowane zdanie z wyrazistym bohaterem.': '2. Form a cheerful, funny sentence starring a vivid character.',
  '3. Wyobraź sobie tę scenę na 5 sekund – gotowe!': '3. Picture that scene in your mind for 5 seconds – done!',
  'Przykład: Taksonomia biologiczna (Królestwo, Typ, Gromada, Rząd, Rodzina, Rodzaj, Gatunek):': 'Example: Biological taxonomy (Domain, Kingdom, Phylum, Class, Order, Family, Genus, Species):',
  '„Król Tybetański Gryzł Rybę Rodzinną Rano Gotowaną”': '"Dear King Philip Came Over For Good Soup" (Taxonomy hierarchy)',
  'Jesteś oficjalnym Mistrzem Akrostychów! Żadna lista w szkole ani w pracy Cię nie zaskoczy! 🐶🏆': 'You are an official Master of Acrostics! No list at school or work will ever trip you up! 🐶🏆',
  'Mapa myśli łączy obie półkule mózgu: lewą (słowa, logika, liczby) z prawą (kolory, przestrzeń, wyobraźnia i rytm). Dzięki temu zapamiętujesz 5 razy szybciej i uczysz się bez znużenia!': 'A mind map bridges both hemispheres of the brain: left (words, logic, numbers) with right (colors, space, imagination, and rhythm). You learn 5 times faster without fatigue!',
  '3. 🚫 Żadnych sztywnych ramek: Nie zamykaj tematu w kwadracie ani sztywnym prostokącie! Zamknięta ramka krzyczy do mózgu: „Koniec, tu się zatrzymaj!”. Obraz centralny musi swobodnie promieniować na boki.': '3. 🚫 No rigid borders: Never trap your topic in a stiff box or rectangle! A box shouts to the brain: "Stop here!". The central image must radiate freely outward.',
  'Na przykład dla tematu „Zdrowe Życie”: Ramię 1: Sen 💤, Ramię 2: Dieta 🥗, Ramię 3: Ruch 🏃, Ramię 4: Umysł 🧠.': 'For example, with "Healthy Life": Branch 1: Sleep 💤, Branch 2: Diet 🥗, Branch 3: Exercise 🏃, Branch 4: Mind 🧠.',
  'Dlaczego to działa? Pojedyncze słowo działa jak klucz w zamku. Nie zamyka myśli, lecz otwiera natychmiastowy dostęp do wiedzy w Twojej głowie!': 'Why does it work? A single keyword acts like a key in a lock. It doesn\'t restrict thought – it opens instant access to knowledge in your head!',
  'Każde słowo z małym symbolem obok tworzy podwójny ślad pamięciowy (kod werbalny + kod wizualny). Tego nie da się zapomnieć!': 'Each word paired with a tiny symbol forms a dual memory trace (verbal + visual code). Unforgettable!',
  'Co to daje na egzaminie? Zamykasz oczy na 2 sekundy i wewnętrznym wzrokiem widzisz: „Aha! Pytanie dotyczy klimatu – klimat był na zielonym ramieniu po prawej stronie na dole!”. Kolor działa jak błyskawiczny drogowskaz w pamięci!': 'How does this help on an exam? Close your eyes for 2 seconds and picture it: "Aha! The question is about climate – climate was on the green branch on the lower right!". Color acts as an instant memory beacon!',
  'Dodatkowa zasada: Długość linii powinna odpowiadać długości słowa! Nie rysuj metrowej linii dla słowa z trzech liter. Kompaktowość sprawia, że mapa jest gęsta, zwarta i piękna!': 'Pro tip: Line length should match word length! Don\'t draw a foot-long line for a 3-letter word. Compactness keeps your map tight, structured, and beautiful!',
  '3. 🔗 Powiązania międzydziałowe: Gdy zauważysz, że pomysł z gałęzi czerwonej łączy się z faktem z gałęzi niebieskiej – połącz je przerywaną strzałką! Twój mózg uwielbia dostrzegać synapsy pomiędzy odległymi dziedzinami wiedzy!': '3. 🔗 Cross-links: When an idea on the red branch connects with a fact on the blue branch, link them with a dashed arrow! The brain loves discovering synapses between distant fields!',
  'Efekt? Twoi koledzy przed klasówką w panice czytają 20 stron, a Ty patrzysz na 1 barwną mapę przez 2 minuty i wiesz wszystko!': 'The result? While classmates frantically cram 20 pages before a test, you glance at 1 vibrant map for 2 minutes and master everything!',
  'Z mapami myśli żaden egzamin, prezentacja ani projekt nie będą dla Ciebie wyzwaniem. Posiadasz atrament mistrza!': 'With mind maps, no exam, presentation, or project will ever intimidate you. You wield master ink!',
  '3. Krzysztof → czarna broda drwala → KRZAK albo KRZYŻACY gubią miecz w jego brodzie!': '3. Christopher → bushy lumberjack beard → BUSH or TEUTONIC KNIGHTS losing a sword in his beard!',
  '• Tomasz (prezenter) → lśniący uśmiech & muszka → czyta wielki, opasły TOM encyklopedii!': '• Thomas (presenter) → dazzling smile & bowtie → reading a giant massive TOME of an encyclopedia!',
  'Jesteś w 100% gotowy na każdy bankiet, klasę i grę swobodną!': 'You are 100% ready for every party, classroom, and free play challenge!',
  'Gdy widzisz 3 → myślisz o M (np. Mysz, Młot).': 'When you see 3 → think of M (e.g., Mouse, Hammer).',
  'Przykłady ze świata: 4 to Rura lub Ryba, a 5 to Liść lub Lama.': 'Examples: 4 is Pipe or Fish (R), and 5 is Leaf or Llama (L).',
  'Z tych literek powstaną fantastyczne słowa: 6 to Jeż lub Szal, a 7 to Koc, Kot lub Kura.': 'From these letters come fantastic words: 6 is Hedgehog or Scarf, and 7 is Cat or Hen.',
  'Gdy usłyszysz angielskie słowo, Twój mózg natychmiast przypomni sobie śmieszną scenkę i od razu znasz znaczenie!': 'When you hear the foreign word, your brain recalls the funny scene and you instantly know the meaning!',
  'Dźwiękowy bliźniak nie musi być w 100% idealny – wystarczy, że da Twojemu umysłowi wesoły punkt zaczepienia!': 'The phonetic bridge doesn\'t need to be 100% identical – it just needs to give your mind a playful anchor!',
  'Teraz już nigdy w życiu nie zapomnisz słowa mushroom!': 'Now you will never forget the word mushroom in your entire life!',
  '• PILLOW (poduszka) → PIŁA: drwal próbuje ściąć wielkie drzewo miękką puchową poduszką! 🛏️': '• PILLOW (cushion) -> PILLOW / SAW: a lumberjack tries chopping down a giant tree with a soft fluffy pillow! 🛏️',
  '• FORK (widelec) → FOKA: cyrkowa foka na plaży żongluje na czubku nosa wielkim widelcem! 🍴': '• FORK (silverware) → FOKA / FORK: a circus seal on the beach juggles a giant fork on the tip of its nose! 🍴',
  '3. Ciesz się swobodną znajomością angielskiego bez stresu i zakuwania! 🦜🇬🇧': '3. Enjoy fluent foreign vocabulary without stress and rote cramming! 🦜🇬🇧',
  'Gdy widzisz kolor, od razu wiesz, do jakiego świata należy karta!': 'When you spot the suit, you immediately know which realm the card belongs to!',
  'Zamiast płaskiego kartonika widzisz żywą postać jak z komiksu!': 'Instead of flat cardboard, you see a living comic-book character!',
  'To pozwala skompresować aż 3 karty w JEDEN zabawny, filmowy kadr w głowie!': 'This compresses 3 cards into ONE cinematic scene in your mind!',
  'Gdy widzisz tę scenę przed oczami, natychmiast odczytujesz: K♥ oraz Q♦!': 'When you visualize this scene, you instantly decode: K♥ and Q♦!',
  'Śmieszne, wyraziste i nie do zapomnienia!': 'Hilarious, vivid, and impossible to forget!',
  'Teraz jesteś gotowy na każdą rozgrywkę z przyjaciółmi i grę swobodną!': 'Now you\'re ready for any game with friends and free play!',
  '4. ZEGAR ⏰ → który dzwoni jak oszalały!': '4. CLOCK ⏰ → ringing like crazy!',
  '8. LODY 🍦 → które zalewają gryf gitary słodkim kremem!': '8. ICE CREAM 🍦 → melting sweet cream all over the guitar neck!',
  '12. SMOK 🐉 → ziejący kłębami ognia!': '12. DRAGON 🐉 → belching billowing fire!',
  '16. MYSZ 🐭 → z długim ogonkiem!': '16. MOUSE 🐭 → with a long tail!',
  'Kryształ ← Świeca ← Tort ← Trampolina ← Mysz... i tak aż do Parasola!': 'Crystal ← Candle ← Cake ← Trampoline ← Mouse... all the way back to Umbrella!',
  'Wiewiórka Basia kręci z radości piruety i wręcza Ci Złotego Orzeszka Pamięci! 🌰✨': 'Hazel the Squirrel twirls with joy and awards you the Golden Acorn of Memory! 🌰✨',
  'W roku 2026 dniem kotwicznym jest SOBOTA (6). Zapamiętajmy tę liczbę!': 'In 2026, the anchor day is SATURDAY (6). Let\'s remember this number!',
  'Te 5 dat ZAWSZE wypada w ten sam dzień tygodnia w danym roku! W 2026 roku każda z nich to dokładnie SOBOTA!': 'These 5 dates ALWAYS fall on the very same weekday in any given year! In 2026, each is SATURDAY!',
  'Wszystkie te daty to w 2026 roku również ta sama nasza kotwica: SOBOTA!': 'All these dates in 2026 also share our anchor: SATURDAY!',
  'Gdyby to był 10 sierpnia? 8 sierpnia + 2 dni: Sobota + 2 dni = Poniedziałek!': 'What about August 10th? August 8 + 2 days: Saturday + 2 days = Monday!',
  '• Wiek XX (lata 1900–1999): baza stulecia to ŚRODA (3, 3 sylaby: „dzie-więć-set”)!': '• 20th Century (1900–1999): century base is WEDNESDAY (3 syllables: "nine-teen-hun")!',
  'Możesz teraz śmiało wejść w tryb „Podróżnik w czasie” i błyskawicznie podać dzień tygodnia dla dowolnej daty w historii i przyszłości! 🐢🪐': 'Now step boldly into Time Traveler mode and name the weekday of any date in past or future! 🐢🪐',
  'Teraz wykorzystamy Pałac Pamięci do czegoś w 100% praktycznego: 5-elementowej listy zakupów.': 'Now we\'ll use the Memory Palace for something 100% practical: a 5-item grocery list.',
  'Nasze produkty to: Awokado, Mleko, Bagietka, Żółty Ser i Soczyste Jabłka.': 'Our items are: Avocado, Milk, Baguette, Yellow Cheese, and Juicy Apples.',
  'Umieścimy je w 5 komnatach, wplatając w każdą z nich zabawną akcję. Chodźmy!': 'We\'ll place them across 5 rooms, weaving a fun action into each one. Let\'s go!',
  'Wiesz, dlaczego zapach ciasta u babci przypomina Ci dzieciństwo w ułamku sekundy? Węch i słuch to autostrady do pamięci emocjonalnej! 👃👂': 'Do you know why the scent of fresh baking instantly sparks childhood memories? Smell and sound are expressways to emotional memory! 👃👂',
  'W tej lekcji dodamy do każdego obrazu bodziec zmysłowy: chłód lodu, zapach wanilii, dźwięk dzwonków czy ciężar złota.': 'In this lesson, we add sensory sparks to every image: the chill of ice, the aroma of vanilla, ringing chimes, or the heavy weight of gold.',
  'Odwiedzimy 6 komnat Pałacu Pamięci. Zamykaj na chwilę oczy i naprawdę POCZUJ każdy przedmiot!': 'We will visit 6 rooms of the Memory Palace. Close your eyes for a moment and truly FEEL each object!',
  'W starożytnym Rzymie Cyceron wygłaszał wielogodzinne mowy przed senatem bez żadnych notatek. Jak to robił? 🏛️': 'In ancient Rome, Cicero gave hours-long speeches to the senate without a single note. How did he do it? 🏛️',
  'Przed przemową spacerował po swoim pałacu, umieszczając kluczowe argumenty w kolejnych pokojach. Gdy mówił, po prostu szedł tą ścieżką w myślach!': 'Before a speech, he strolled through his palace, placing key points into consecutive rooms. While speaking, he simply retraced that path in his mind!',
  'Skup się i idź spokojnie krok za krokiem. Jestem z Ciebie dumny!': 'Stay focused and walk smoothly step by step. I am proud of you!',
  'Twoja pamięć przestrzenna jest już niesamowicie wytrenowana! 🔥': 'Your spatial memory is already trained to an incredible level! 🔥',
  'Teraz sprawdzimy, jak radzisz sobie z dłuższą trasą 8 komnat. Zwróć uwagę, jak naturalnie jedna komnata prowadzi do drugiej.': 'Now let\'s test how you handle a longer 8-room route. Notice how naturally one room leads into the next.',
  'Gdy wychodzisz z Biblioteki, przed sobą masz Ogród; za Ogrodem wchodzisz do Skarbca... Twój mózg tworzy spójną mapę 3D!': 'As you leave the Library, the Garden is right ahead; past the Garden, you enter the Vault... Your brain builds a coherent 3D map!',
  'Gotowy na 8 przystanków? Weź głęboki oddech i ruszamy!': 'Ready for 8 stops? Take a deep breath and let\'s go!',
  'Oto nadszedł wielki moment – Egzamin Mistrza Pałacu Pamięci! 👑': 'The big moment is here – The Memory Palace Master Exam! 👑',
  'Przejdziesz kompletną, 10-punktową trasę od Złotej Bramy aż po sam Szczyt Pałacu.': 'You will walk the complete 10-stop route from the Golden Gate all the way to the Palace Summit.',
  'Po ukończeniu tej lekcji będziesz potrafił zapamiętać dowolną listę 10 rzeczy w ułamku chwili – numery, zadania, przemówienia, daty!': 'Upon finishing this lesson, you will be able to memorize any 10-item list in an instant – numbers, tasks, speeches, dates!',
  'Zaufaj swojej wyobraźni. Spaceruj spokojnie. Tygrysek Leon kibicuje z całych sił! 🐯✨': 'Trust your imagination. Walk at a steady pace. Leo the Tiger is cheering you on with all his heart! 🐯✨',
  'Zobacz, jak każda planeta wskakuje na swoje miejsce od Słońca:': 'See how each planet falls into place starting from the Sun:',
  '1. Moja → Merkury ☀️ (najbliżej Słońca)': '1. My -> Mercury ☀️ (closest to the Sun)',
  '2. Wiecznie → Wenus 🌟 (najgorętsza)': '2. Very -> Venus 🌟 (hottest planet)',
  '5. Zawsze → Jowisz 🪐 (największy gazowy gigant)': '5. Just -> Jupiter 🪐 (largest gas giant)',
  '6. Smaży → Saturn 💫 (planeta z wielkimi pierścieniami)': '6. Served -> Saturn 💫 (planet with giant rings)',
  '7. Nam → Uran ❄️ (błękitny lodowy olbrzym)': '7. Us -> Uranus ❄️ (blue ice giant)',
  '8. Placki → Neptun 🌊 (najdalszy wietrzny błękit)': '8. Noodles -> Neptune 🌊 (distant windy blue giant)',
  'Wyobraź sobie mamę w skafandrze kosmicznym z wielką patelnią pośród gwiazd – obraz jest tak żywy, że zostanie z Tobą na zawsze!': 'Picture a mother in a spacesuit holding a giant frying pan among the stars – the image is so vivid it stays forever!',
  'Po co nam ten trop? Rzymskie cyfry I (1), V (5) i X (10) zna każdy. Problem zaczyna się przy wyższych wartościach: L, C, D, M. Na zegarach, pomnikach, datach w filmach i na fasadach budynków ludzie często zastanawiają się: „Ile to było C, a ile D?”.': 'Why this cue? Everyone knows Roman numerals I (1), V (5), and X (10). The trouble starts with higher values: L, C, D, M. On clocks, monuments, movie copyright dates, and buildings, people often wonder: "Was C 100 or 500?".',
  'Wystarczy zapamiętać jedno proste zdanie o legendarnym królu Lechu:': 'All you need is one simple sentence:',
  'Litery rosną w nim dokładnie tak, jak wartości rzymskie:': 'The letters scale upward exactly like the Roman values:',
  '• C = 100 (Chce – od łacińskiego Centum)': '• C = 100 (Cows / Latin Centum = 100)',
  '• M = 1000 (Mieszkać – od łacińskiego Mille, czyli tysiąc)': '• M = 1000 (Milk / Latin Mille = 1,000)',
  'Po co nam ten trop? Podczas czytania mapy, w nawigacji GPS lub w grach komputerowych kierunki podawane są w standardzie międzynarodowym: N, E, S, W. Wiele osób myli wschód (East) z zachodem (West).': 'Why this cue? When reading maps, GPS systems, or games, directions follow international standards: N, E, S, W. Many people mix up East and West.',
  'Spójrz na tarczę kompasu zgodnie z ruchem wskazówek zegara, zaczynając od góry:': 'Look at the compass face clockwise, starting from the top:',
  '• Na (Góra) → North (Północ ⬆️)': '• N (Top) -> North ⬆️',
  '• Ekranie (Prawo) → East (Wschód ➡️)': '• E (Right) -> East ➡️',
  '• Siedzi (Dół) → South (Południe ⬇️)': '• S (Bottom) -> South ⬇️',
  '• Wrona (Lewo) → West (Zachód ⬅️)': '• W (Left) -> West ⬅️',
  'Gdy spojrzysz na mapę, od razu widzisz czarną wronę siedzącą po lewej stronie ekranu i bez wahania wiesz, gdzie jest East, a gdzie West!': 'Think "Never Eat Soggy Waffles" or see the compass face clockwise – you will never mix up East and West again!',
  'Po co nam ten trop? W języku polskim mamy 7 przypadków gramatycznych. Uczniowie godzinami próbują zapamiętać ich kolejność, myląc celownik z biernikiem lub narzędnik z miejscownikiem.': 'Why this cue? Language grammar cases often confuse students who spend hours memorizing their exact sequence.',
  'Oto pyszne zdanie-klucz, które rozwiązuje ten problem raz na zawsze:': 'Here is the delicious key sentence that solves this sequence once and for all:',
  'Każde słowo to pierwszy człon kolejnego przypadku z pytaniami:': 'Each word anchors the next grammatical case in sequence:',
  '2. Dała → Dopełniacz (kogo? czego? – nie ma)': '2. Genitive (Whose? Of what?)',
  '3. Córce → Celownik (komu? czemu? – się przyglądam)': '3. Dative (To whom? For what?)',
  '4. Bułkę → Biernik (kogo? co? – widzę)': '4. Accusative (Whom? What do I see?)',
  '5. Nasmarowaną → Narzędnik (z kim? z czym? – idę)': '5. Instrumental (With whom? With what?)',
  '6. Masłem → Miejscownik (o kim? o czym? – rozmawiam)': '6. Locative (About whom? About what?)',
  '7. Wiejskim → Wołacz (o! – witaj!)': '7. Vocative (O! Direct address / greeting)',
  'Z taką bułką żaden sprawdzian z języka polskiego Cię nie zaskoczy!': 'With this mental image, no case sequence will ever catch you off guard!',
  'Po co nam rymowanki? Nasz słuch kocha rym i rytm. Suche regułki gramatyczne ulatują z głowy, ale wierszyk o prostej melodyjce zapamiętujemy natychmiast.': 'Why rhymes? Our hearing loves cadence and rhythm. Dry rules slip away, but a catchy rhyme sticks in memory effortlessly.',
  'Oto 3 złote zasady, które uratowały miliony uczniów przed dwójami:': 'Here are 3 golden spelling rules that save students from bad grades:',
  '1. Końcówka „-uje”: „Kto kreskuje -uje, ten dwóje otrzymuje!” (maluje, rysuje, gotuje – ZAWSZE przez u zwykłe!).': '1. Endings rule: "Words ending in -uje take simple u" (maluje, rysuje, gotuje – always simple u!).',
  '2. Cząstka „-by”: Z czasownikami w formie osobowej PISZEMY ZAWSZE RAZEM: zrobiłby, poszedłby, zaśpiewałaby.': '2. The conditional suffix "-by": Written together with personal verbs: zrobilby, poszedlby, zaspiewalaby.',
  '3. Rz po spółgłoskach (p, b, t, d, k, g, ch, j, w): Zdanie-trop brzmi: „Prosił Bohaterski Tygrys Dobrego Konia, Gdy Chciał Jeść Warzywa”. Po literach P, B, T, D, K, G, CH, J, W piszemy RZ (np. przyjaciel, brzeg, trzeba, drzewo, krzak)!': '3. Consonant clusters rule: "P, B, T, D, K, G, CH, J, W lead to RZ" (przyjaciel, brzeg, trzeba, drzewo, krzak)!',
  'Wystarczy zanucić wierszyk i wiesz, jaką literę postawić na kartce!': 'Just hum the rhyme and you will immediately know the right letter to write!',
  'Po co nam ten trop? Chemia i biologia pełne są trudnych nazw. Na szczęście naukowcy stworzyli genialne akronimy, które streszczają całe rozdziały podręcznika.': 'Why this cue? Chemistry and biology are packed with complex terms. Fortunately, scientists crafted brilliant acronyms that condense entire chapters.',
  '1. Pierwiastki biogenne CHNOPS: Aż 96% masy ciała człowieka składa się z zaledwie 6 pierwiastków:': '1. Biogenic elements CHNOPS: About 96% of human body mass is composed of just 6 elements:',
  '• C → Węgiel (Carbon 🧬)': '• C -> Carbon 🧬',
  '• P → Fosfor (Phosphorus 🦴 - mocne kości)': '• P -> Phosphorus 🦴 (strong bones)',
  '• S → Siarka (Sulfur 💅 - włosy i paznokcie)': '• S -> Sulfur 💅 (hair and nails)',
  '2. Witaminy rozpuszczalne w tłuszczach: Witaminy dzielą się na rozpuszczalne w wodzie i tłuszczach. Te drugie tworzą imię chłopca: ADEK (witaminy A, D, E, K)!': '2. Fat-soluble vitamins: Vitamins divide into water-soluble and fat-soluble. The fat-soluble ones form the name ADEK (Vitamins A, D, E, K)!',
  'Wyobraź sobie chłopca ADEK pijącego mleko z masłem (tłuszcz!), a zapamiętasz to na całe życie!': 'Picture a boy named ADEK drinking milk with butter (fats!), and you will remember it for life!',
  'Po co nam ten trop? Każdy, kto zaczyna naukę gry na gitarze klasycznej, akustycznej lub elektrycznej, musi znać dźwięki pustych strun. Początkujący bez przerwy mylą kolejność strun basowych i wiolinowych.': 'Why this cue? Anyone learning classical, acoustic, or electric guitar must know the open string notes. Beginners often mix up bass and treble order.',
  'Struny gitary liczymy od najcieńszej (na dole, e1) do najgrubszej (na górze, E6):': 'Guitar strings run from thickest (top E6) to thinnest (bottom e1):',
  'Zdanie-klucz brzmi: „Edek Hoduje Gołębie Dla Agaty Ewy”': 'The key mnemonic is: "Eddie Ate Dynamite, Good Bye Eddie" (Strings E-A-D-G-B-E)',
  'Zobacz dźwięki kolejnych strun:': 'Check out the string notes in order:',
  '• Edek → e (struna 1, wiolinowa – najwyższy dźwięk 🎶)': '• E -> High e string (string 1, highest pitch 🎶)',
  '• Gołębie → g (struna 3)': '• G -> G string (string 3)',
  'Dzięki Edkowi i jego gołębiom nastrojenie instrumentu staje się dziecinnie proste!': 'Thanks to this handy mnemonic, tuning your instrument becomes child\'s play!',
  'Po co nam ten trop? Systematyka biologiczna stworzona przez Karola Linneusza to fundament nauk o przyrodzie. Uczniowie nagminnie mylą, czy rząd jest przed rodziną, czy gromada przed typem.': 'Why this cue? Biological taxonomy developed by Carl Linnaeus is the foundation of life sciences. Students often mix up Order, Family, and Class.',
  'Każde słowo to szczebel taksonomiczny od najszerszego do najwęższego:': 'Each word marks a taxonomic rank from broadest to narrowest:',
  '1. Król → Królestwo (np. zwierzęta 🦁)': '1. King -> Kingdom (e.g. Animalia 🦁)',
  '2. Tybetański → Typ (np. strunowce)': '2. Philip -> Phylum (e.g. Chordata)',
  '3. Gryzł → Gromada (np. ssaki 🐾)': '3. Came -> Class (e.g. Mammalia 🐾)',
  '4. Rybę → Rząd (np. drapieżne)': '4. Over -> Order (e.g. Carnivora)',
  '5. Rodzinną → Rodzina (np. psowate 🐶)': '5. For -> Family (e.g. Canidae 🐶)',
  '7. Gotowaną → Gatunek (np. pies domowy / Canis familiaris)': '7. Soup -> Species (e.g. Canis familiaris / Domestic Dog)',
  'Widzisz tybetańskiego króla gryzącego gotowaną rybę i cała drabina biologiczna stoi przed Tobą otworem!': 'Picture King Philip enjoying his soup, and the whole biological ladder opens right before you!',
  'Gratulacje! Znasz już potęgę akrostychów w szkole, nauce i życiu. Czas na mistrzostwo: jak ułożyć własne zdanie-klucz w 3 prostych krokach?': 'Congratulations! You know the power of acrostics for school, study, and life. Time for mastery: how to build your own mnemonic in 3 easy steps?',
  'Oto algorytm Pieska Łatka:': 'Here is Patch the Dog\'s 3-step formula:',
  '1. 📝 Wypisz pierwsze litery: Zapisz słowa, które musisz zapamiętać i podkreśl ich pierwsze litery (np. zakupy: Chleb, Masło, Pomidory, Ser → C, M, P, S).': '1. 📝 Write the first letters: Note down the words you need and underline their first letters (e.g. Bread, Milk, Tomatoes, Cheese -> B, M, T, C).',
  '2. 🤪 Znajdź śmieszne, żywe słowa: Nie twórz nudnych zdań! Twój mózg ignoruje przeciętność. Ułóż coś zaskakującego, np. „Czarny Małpiszon Pożarł Śrubokręt!” (C, M, P, S).': '2. 🤪 Pick funny, vivid words: Avoid dull sentences! Your brain ignores boring things. Create something absurd, like "Big Monkeys Throw Coconuts!" (B, M, T, C).',
  '3. 🎨 Zobacz to w wyobraźni: Zamknij oczy na 3 sekundy i zobacz wielką czarną małpę z wielkim uśmiechem i śrubokrętem. Poczuj emocje, śmiech i absurd!': '3. 🎨 Visualize the scene: Close your eyes for 3 seconds and picture huge monkeys playfully throwing coconuts. Feel the humor and vivid motion!',
  'Gotowe! Z tym 3-krokowym algorytmem zapamiętasz przemówienie na 10 punktów, procedurę w pracy, etapy projektu czy listę rzeczy na wakacje!': 'Done! With this 3-step formula, you can memorize a 10-point speech, a workplace procedure, project milestones, or a vacation packing list!',
  'Świat pamięci – strona główna': 'World of Memory – home page',
  'Miau! 10 potężnych systemów pamięciowych czeka na Ciebie! 🐾': 'Meow! 10 powerful memory systems are waiting for you! 🐾',
  'Cześć! 10 genialnych modułów pamięciowych czeka na Ciebie 💪': 'Hi! 10 brilliant memory modules are waiting for you 💪',
  'Gotowy na trening pamięci? Wybierz grę! ✨': 'Ready for memory training? Choose a game! ✨',
  '❓ [BRAK]': '❓ [MISSING]',
  'Od 1 cyfry do pierwszej żywej historyjki': 'From 1 digit to your first vivid story',
  'PIN do karty, kod pocztowy i płatność BLIK': 'Card PIN, ZIP code, and 6-digit verification codes',
  '7 cyfr, daty i pełny 9-cyfrowy numer telefonu!': '7 digits, famous dates, and a full 9-digit phone number!',
  'Zamiana cyfr w słowa – sekret arcymistrzów': 'Turning digits into words – the grandmasters\' secret',
  '10, 11 i 12 cyfr – poziom zawodów pamięciowych': '10, 11, and 12 digits – memory championship level',
  'TOR': 'TAR',
  'MATA': 'MAT',
  'PAN': 'PAN',
  'SOK': 'SOCK',
  'FALA': 'FALL',
  'NOS': 'NOSE',
  'LINA': 'LINE',
  'Cyfra 2 wygląda jak wygięta szyja łabędzia 🦢': 'Digit 2 looks like a curved swan\'s neck 🦢',
  'Wpisz cyfrę 2!': 'Enter digit 2!',
  'Pamiętasz scenę na śniegu? Łabędź (2) i Bałwan (8)!': 'Remember the snow scene? Swan (2) and Snowman (8)!',
  'Żaglówka (4), Bałwan (8), Łabędź (2). Ucho pomaga oku! 👂': 'Sailboat (4), Snowman (8), Swan (2). Your ear helps your eye! 👂',
  'Zacznij od 4 – żaglówki!': 'Start with 4 – the sailboat!',
  'Dwie paczki: siedemdziesiąt jeden (71) i pięćdziesiąt dziewięć (59).': 'Two chunks: seventy-one (71) and fifty-nine (59).',
  'Dwie paczki: 30 i 694. Dwa kawałki zamiast pięciu!': 'Two chunks: 30 and 694. Two pieces instead of five!',
  'Bitwa pod Grunwaldem (1410) i początek II wojny (1939).': 'Historic milestone (1410) and WWII outbreak (1939).',
  'Tor i mata. Mata rozłożona na torze – dziwne = zapamiętane!': 'TAR (14) and MAT (31). Asphalt TAR spilled on a yoga MAT – weird = unforgettable!',
  'FALA uderza w NOS, trzymający LINĘ przy MATIE. 🌊👃🪢🧘': 'A Waterfall (FALL 85) hits a NOSE (20) holding a LINE (52) tied to a MAT (31)! 🌊👃🪢🧘',
  'Pięć par: 48 · 26 · 15 · 09 · 37.': 'Five pairs: 48 · 26 · 15 · 09 · 37.',
  'Zaczyna się od 48.': 'Starts with 48.',
  'Mrrr! Perfekcyjnie! Bez żadnej podpowiedzi! 🌟': 'Purr-fect! Spot-on without a single hint! 🌟',
  'Mistrz pamięci! Aż mi się ogon zakręcił! 🏆': 'Memory master! My tail just curled in amazement! 🏆',
  'Idealnie! Twój mózg to superkomputer!': 'Flawless! Your brain is a supercomputer!',
  'Brawo! Pamięć rośnie w siłę! 💪': 'Bravo! Your memory is growing stronger! 💪',
  'Prawie! Pamięć to mięsień – trenuj, a urośnie 💪': 'So close! Memory is a muscle – train it and it grows 💪',
  'Nic nie szkodzi! Spróbujmy jeszcze raz, tym razem spokojniej.': 'No worries! Let\'s try again, nice and steady.',
  'Miau… tym razem się nie udało. Ale Ty dasz radę! 🐾': 'Meow... didn\'t quite get it this time. You\'ve got this! 🐾',
  'Nie spiesz się… ale mruczę z niecierpliwości 😸': 'Take your time... though I\'m purring with excitement 😸',
  'Spróbuj odtworzyć cyfry „w głowie”, jakbyś je słyszał.': 'Try replaying the digits in your mind as if you hear them.',
  'Słuchaj uważnie! Każda cyfra gra swoją nutę 🎵': 'Listen closely! Every digit plays its own musical note 🎵',
  'Kojarz cyfry z obrazami! Zobacz kształty 🦢⛵': 'Connect digits with pictures! Watch the shapes 🦢⛵',
  '\n  <div class="major">\n    <p class="panel-title">Alfabet cyfr (System Major)</p>\n    <div class="major-grid">\n      <div><b>0</b><span>S Z C</span></div><div><b>1</b><span>T D</span></div><div><b>2</b><span>N</span></div>\n      <div><b>3</b><span>M</span></div><div><b>4</b><span>R</span></div><div><b>5</b><span>L</span></div>\n      <div><b>6</b><span>SZ CZ Ż</span></div><div><b>7</b><span>K G</span></div><div><b>8</b><span>F W</span></div>\n      <div><b>9</b><span>P B</span></div>\n    </div>\n    <p class="panel-note">Samogłoski (A E I O U Y) są „za darmo” – wstawiasz je, żeby powstało słowo. <b>TOR</b> → T=1, R=4 → <b>14</b>.</p>\n  </div>': '\n  <div class="major">\n    <p class="panel-title">Digit Alphabet (Major System)</p>\n    <div class="major-grid">\n      <div><b>0</b><span>S Z</span></div><div><b>1</b><span>T D</span></div><div><b>2</b><span>N</span></div>\n      <div><b>3</b><span>M</span></div><div><b>4</b><span>R</span></div><div><b>5</b><span>L</span></div>\n      <div><b>6</b><span>J SH CH</span></div><div><b>7</b><span>K G</span></div><div><b>8</b><span>F V</span></div>\n      <div><b>9</b><span>P B</span></div>\n    </div>\n    <p class="panel-note">Vowels (A E I O U Y) are free glue – insert them to build words. <b>TAR</b> → T=1, R=4 → <b>14</b>.</p>\n  </div>',
  'Lekcja 1 · Czym jest Pałac Pamięci?': 'Lesson 1 · What Is a Memory Palace?',
  'Odkryj tajemnicę starożytnych oratorów. Twój mózg myśli przestrzenią, a nie suchymi słowami!': 'Discover the secret of ancient orators. Your brain thinks in spaces, not dry words!',
  'Na szczycie Złotej Bramy wisi olbrzymi Świecący Banan 🍌. Jest tak jasny, że oślepia strażników!': 'Atop the Golden Gate hangs a giant Glowing Banana 🍌. It shines so bright it dazzles the guards!',
  'Wchodzisz do Holu, a tam na środku lewituje czarny Kapelusz Magika 🎩, z którego bez przerwy wylatują białe gołębie!': 'You enter the Hall, and floating right in the center is a black Magician\'s Hat 🎩 shooting out white doves non-stop!',
  'Zapamiętałeś: Złota Brama ➡️ Świecący Banan, Marmurowy Hol ➡️ Kapelusz Magika.': 'Remembered: Golden Gate ➡️ Glowing Banana, Marble Hall ➡️ Magician\'s Hat.',
  'Genialnie! Właśnie przeszedłeś przez swoje pierwsze 2 loci w Pałacu Pamięci! 🏆': 'Brilliant! You just walked through your first 2 loci in the Memory Palace! 🏆',
  'Nasz mózg błyskawicznie zapomina nudne rzeczy, ale uwielbia humor, ruch i komizm.': 'Our brain instantly forgets boring things, but adores humor, motion, and comedy.',
  'W Sali Kominkowej na wielkiej kanapie Słoń na Różowych Wrotkach 🐘 kręci piruety i gasi kominek lemoniadą!': 'In the Fireplace Room, an Elephant on Pink Skates 🐘 spins piruettes on the sofa and puts out the fire with lemonade!',
  'W Kuchni z pieca wylatuje Płonąca Pizza 🍕 i wiruje w powietrzu jak ogniste UFO!': 'In the Kitchen, a Flaming Pizza 🍕 blasts out of the oven and spins in mid-air like a fiery UFO!',
  'W Spiżarni na półce z dżemami stoi Gitara Elektryczna 🎸 i sama rzęzi głośne rockowe solo!': 'In the Pantry, an Electric Guitar 🎸 stands on the jam shelf shredding a loud rock solo all by itself!',
  'Kominek ➡️ Słoń na wrotkach, Kuchnia ➡️ Płonąca pizza, Spiżarnia ➡️ Gitara rockowa.': 'Fireplace ➡️ Elephant on skates, Kitchen ➡️ Flaming pizza, Pantry ➡️ Electric guitar.',
  'Brawo! Zasada absurdu działa cuda – widzisz te obrazy jak na filmie! 🎬': 'Bravo! The rule of absurdity works wonders – you see these images like a movie! 🎬',
  'W Pałacu Pamięci kluczowy jest stały kierunek. Zawsze poruszaj się w tę samą stronę!': 'In a Memory Palace, a consistent direction is key. Always walk the exact same path!',
  'W Bibliotece między starymi książkami startuje mała Rakieta Kosmiczna 🚀, zostawiając chmurę białego dymu!': 'In the Library, a small Space Rocket 🚀 launches right between antique books, leaving a cloud of white smoke!',
  'W Ogrodzie Zimowym na liściu wielkiej palmy siedzi Żaba w Okularach 🐸 i z powagą czyta poranne wiadomości!': 'In the Winter Garden, a Frog in Glasses 🐸 sits on a giant palm leaf solemnly reading the morning news!',
  'W Gabinecie Luster na postumencie leży wielki Błękitny Diament 💎 i strzela laserami we wszystkie lustra naraz!': 'In the Hall of Mirrors, a giant Blue Diamond 💎 sits on a pedestal firing laser beams at every mirror at once!',
  'Wychodzisz na Balkon Widokowy, a nad nim unosi się gigantyczny Tęczowy Balon 🎈 oświetlony zachodem słońca!': 'You step onto the Viewing Balcony, and floating above it is a giant Rainbow Balloon 🎈 lit by the sunset!',
  'Biblioteka ➡️ Rakieta, Ogród ➡️ Żaba w okularach, Lustra ➡️ Diament, Balkon ➡️ Balon.': 'Library ➡️ Rocket, Garden ➡️ Frog in glasses, Mirrors ➡️ Diamond, Balcony ➡️ Balloon.',
  'Świetnie zachowana kolejność! Zbudowałeś solidną 4-punktową ścieżkę pamięciową! 🌟': 'Sequence locked in! You built a solid 4-stop memory route! 🌟',
  'Czas na praktyczny życiowy test! Zapamiętasz 5 produktów ze sklepu bez zapisywania.': 'Time for a practical real-life test! Memorize 5 grocery items without writing a single word.',
  'Przy Złotej Bramie stoi Rapujące Awokado 🥑 z mikrofonem i wielkim złotym łańcuchem na szyi!': 'At the Golden Gate stands a Rapping Avocado 🥑 holding a microphone and wearing a chunky gold chain!',
  'W Marmurowym Holu nagle wybucha fontanna – to Mleczny Gejzer 🥛 chlapiący na kryształowy żyrandol!': 'In the Marble Hall, a fountain suddenly erupts – it\'s a Milk Geyser 🥛 splashing up onto the crystal chandelier!',
  'W Sali Kominkowej zamiast polan drewna w kominku leży ogromna chrupiąca Bagietka 🥖 i pachnie świeżym chlebem!': 'In the Fireplace Room, instead of firewood, a Giant Crispy Baguette 🥖 crackles in the hearth, smelling like fresh bread!',
  'W Kuchni wielki kawałek Żółtego Sera 🧀 na sprężynach skacze po miedzianych patelniach!': 'In the Kitchen, a giant wedge of Spring-Loaded Cheese 🧀 bounces wildly across the copper pans!',
  'W Skarbcu w otwartej skrzyni ze złotem leży Złote Jabłko 🍎 i śpiewa czystym operowym głosem!': 'In the Treasury, inside an open chest of gold sits a Golden Apple 🍎 singing in a crystal-clear opera voice!',
  'Brama ➡️ Awokado, Hol ➡️ Mleko, Kominek ➡️ Bagietka, Kuchnia ➡️ Ser, Skarbiec ➡️ Jabłko.': 'Gate ➡️ Avocado, Hall ➡️ Milk, Fireplace ➡️ Baguette, Kitchen ➡️ Cheese, Treasury ➡️ Apple.',
  'Najpotężniejsza pamięć to ta, która czuje zapach, słyszy dźwięk i dotyka faktury.': 'The strongest memory is one that smells aromas, hears sounds, and feels textures.',
  'Złota Brama zwieńczona jest ciężką Koroną Królewską 👑. Poczuj chłód metalu i dotknij ostrych rubinów!': 'The Golden Gate is crowned with a heavy Royal Crown 👑. Feel the cold metal and touch the sharp rubies!',
  'Przez Hol pędzi Cytrynowy Rower 🚲 na kołach z cytryn. Poczuj intensywny, kwaskowaty zapach owoców i usłysz terkot łańcucha!': 'Racing through the Hall is a Lemon Bicycle 🚲 with giant lemon wheels. Smell the sharp citrus zest and hear the chain rattle!',
  'W Bibliotece Złoty Bębenek 🥁 sam dudni energetycznym rytmem. Poczuj wibracje w podłodze i powietrzu!': 'In the Library, a Golden Drum 🥁 pounds an energetic beat all on its own. Feel the vibration through the floor and air!',
  'W Ogrodzie Zimowym stoi Różowy Flaming 🦩 w wielkich żółtych kaloszach i pluszcze w fontannie!': 'In the Winter Garden stands a Pink Flamingo 🦩 wearing oversized yellow rain boots, splashing joyfully in the fountain!',
  'W Gabinecie Luster stoi Góra Lodowa z Wanilii 🍦. Poczuj lodowaty powiew i słodki aromat wanilii!': 'In the Hall of Mirrors towers a Vanilla Iceberg 🍦. Feel the icy breeze and breathe in the sweet vanilla aroma!',
  'W Wieży Astronomicznej bije stary zegar z Tykaniem i Kukułką ⏰. Słyszysz głośne: TIK-TAK, TIK-TAK i kukanie ptaszka!': 'In the Observatory Tower ticks an antique Cuckoo Clock ⏰. You hear a loud TICK-TOCK, TICK-TOCK and the bird\'s chime!',
  'Brama ➡️ Korona, Hol ➡️ Rower, Biblioteka ➡️ Bębenek, Ogród ➡️ Flaming, Lustra ➡️ Lody, Wieża ➡️ Zegar.': 'Gate ➡️ Crown, Hall ➡️ Bike, Library ➡️ Drum, Garden ➡️ Flamingo, Mirrors ➡️ Iceberg, Tower ➡️ Clock.',
  'Prawdziwy multisensoryczny majstersztyk! Twój pałac tętni dźwiękami i zapachami! 🎨': 'A true multi-sensory masterpiece! Your palace bursts with sounds and scents! 🎨',
  'Opanuj metodę rzymskich mówców. Wygłoś 7-punktowe wystąpienie bez ani jednej kartki w dłoni.': 'Master the method of Roman orators. Deliver a 7-point speech without a single cue card.',
  'Punkt 1 (Wstęp): Przy Złotej Bramie kłania się Kapelusz Magika 🎩 – symbol zaskakującego początku wystąpienia!': 'Point 1 (Intro): At the Golden Gate bows a Magician\'s Hat 🎩 – symbolizing a surprising opening hook!',
  'Punkt 2 (Wielka Wizja): W Holu startuje Rakieta 🚀 ku niebu – pokazujesz słuchaczom ambitny cel!': 'Point 2 (Big Vision): In the Hall a Rocket 🚀 blasts skyward – showing your audience an ambitious goal!',
  'Punkt 3 (Problem/Płomień): W Sali Kominkowej płonie Pizza 🍕 – mówisz o palącym problemie do rozwiązania!': 'Point 3 (Problem): In the Fireplace Room a Pizza 🍕 blazes – highlighting the burning issue to solve!',
  'Punkt 4 (Dane i Fakty): W Bibliotece mądra Żaba w Okularach 🐸 przedstawia twarde dowody z książek!': 'Point 4 (Facts & Data): In the Library a wise Frog in Glasses 🐸 presents solid evidence from thick books!',
  'Punkt 5 (Zdrowie i Rozwój): W Ogrodzie Rapujące Awokado 🥑 głosi odnowę i dobrą energię!': 'Point 5 (Growth): In the Garden a Rapping Avocado 🥑 preaches vitality and fresh momentum!',
  'Punkt 6 (Wartość/Zysk): W Skarbcu lśni Diament 💎 – dowód, ile zyskają słuchacze!': 'Point 6 (Value): In the Treasury gleams a Blue Diamond 💎 – proof of the value listeners gain!',
  'Punkt 7 (Zakończenie z klasą): Na Balkonie stoi Jednorożec 🦄 z herbatą – spektakularny, niezapomniany finał!': 'Point 7 (Memorable Close): On the Balcony stands a Unicorn 🦄 sipping tea – a spectacular finale!',
  '7 punktów przemowy: Kapelusz ➡️ Rakieta ➡️ Pizza ➡️ Żaba ➡️ Awokado ➡️ Diament ➡️ Jednorożec.': '7 speech points: Hat ➡️ Rocket ➡️ Pizza ➡️ Frog ➡️ Avocado ➡️ Diamond ➡️ Unicorn.',
  'Rzymski Senat wstałby do owacji na stojąco! Jesteś gotowy na każdą prezentację! 🎓': 'The Roman Senate would give you a standing ovation! You\'re ready for any presentation! 🎓',
  'Wydłużamy ścieżkę do 8 komnat. Płynny spacer, pewność i automatyzm skojarzeń.': 'Expanding the path to 8 rooms. A smooth walk, total confidence, and automatic recall.',
  'Złota Brama rozświetlona jest przez wielki Świecący Banan 🍌.': 'The Golden Gate is illuminated by a giant Glowing Banana 🍌.',
  'W Marmurowym Holu stoi Złoty Bębenek 🥁 i wygrywa wesoły marsz na powitanie.': 'In the Marble Hall stands a Golden Drum 🥁 beating a cheerful welcome march.',
  'W Sali Kominkowej tańczy Słoń na Różowych Wrotkach 🐘.': 'In the Fireplace Room dances an Elephant on Pink Skates 🐘.',
  'W Bibliotece rockowa Gitara 🎸 brzęczy na drewnianym pulpicie.': 'In the Library a rock Guitar 🎸 strums on the wooden lectern.',
  'W Kuchni sprężynujący Ser Żółty 🧀 odbija się od sufitu.': 'In the Kitchen spring-loaded Yellow Cheese 🧀 bounces off the ceiling.',
  'W Skarbcu na aksamitnej poduszce błyszczy rubinowa Korona 👑.': 'In the Treasury on a velvet cushion glitters a ruby Crown 👑.',
  'Z Wieży Astronomicznej w stronę gwiazd leci Rakieta 🚀.': 'From the Observatory Tower a Space Rocket 🚀 shoots toward the stars.',
  'Na szczycie Dachu stoi dumna Kaczuszka Wikinga 🦆 w rogatym hełmie i patrzy na horyzont!': 'Atop the Palace Roof stands a proud Viking Duck 🦆 in a horned helmet gazing at the horizon!',
  'Brama ➡️ Banan, Hol ➡️ Bębenek, Kominek ➡️ Słoń, Biblioteka ➡️ Gitara, Kuchnia ➡️ Ser, Skarbiec ➡️ Korona, Wieża ➡️ Rakieta, Dach ➡️ Kaczka.': 'Gate ➡️ Banana, Hall ➡️ Drum, Fireplace ➡️ Elephant, Library ➡️ Guitar, Kitchen ➡️ Cheese, Treasury ➡️ Crown, Tower ➡️ Rocket, Roof ➡️ Duck.',
  'Lekcja 8 · Wielki Finał Szkolenia': 'Lesson 8 · Grand Training Finale',
  'Kompletna trasa przez cały Pałac Królewski! 10 komnat, 10 niezwykłych obiektów, tytuł Mistrza Loci.': 'The complete tour of the Royal Palace! 10 rooms, 10 bizarre objects, and the Master of Loci title.',
  'Locus 1 (Brama): Świecący neonowy Banan 🍌.': 'Locus 1 (Gate): Neon Glowing Banana 🍌.',
  'Locus 2 (Hol): Lewitujący Kapelusz Magika 🎩 z gołębiami.': 'Locus 2 (Hall): Floating Magician\'s Hat 🎩 with doves.',
  'Locus 3 (Kominek): Słoń na Różowych Wrotkach 🐘 kręci piruety.': 'Locus 3 (Fireplace): Elephant on Pink Skates 🐘 doing pirouettes.',
  'Locus 4 (Biblioteka): Żaba w Okularach 🐸 czyta encyklopedię.': 'Locus 4 (Library): Frog in Glasses 🐸 reading an encyclopedia.',
  'Locus 5 (Ogród Zimowy): Różowy Flaming 🦩 w kaloszach.': 'Locus 5 (Winter Garden): Pink Flamingo 🦩 in yellow boots.',
  'Locus 6 (Gabinet Luster): Błękitny Diament 💎 strzelający laserem.': 'Locus 6 (Mirrors): Blue Diamond 💎 firing lasers.',
  'Locus 7 (Kuchnia): Wirująca w ogniu Płonąca Pizza 🍕.': 'Locus 7 (Kitchen): Spinning Flaming Pizza 🍕.',
  'Locus 8 (Skarbiec): Złota Korona 👑 z rubinami.': 'Locus 8 (Treasury): Golden Crown 👑 with rubies.',
  'Locus 9 (Wieża): Startująca ku gwiazdom Rakieta 🚀.': 'Locus 9 (Tower): Space Rocket 🚀 launching to the stars.',
  'Locus 10 (Dach): Magiczny Jednorożec 🦄 pijący herbatkę z widokiem na królestwo.': 'Locus 10 (Roof): Magic Unicorn 🦄 sipping tea overlooking the kingdom.',
  '10 Loci Mistrza: Banan ➡️ Kapelusz ➡️ Słoń ➡️ Żaba ➡️ Flaming ➡️ Diament ➡️ Pizza ➡️ Korona ➡️ Rakieta ➡️ Jednorożec.': '10 Master Loci: Banana ➡️ Hat ➡️ Elephant ➡️ Frog ➡️ Flamingo ➡️ Diamond ➡️ Pizza ➡️ Crown ➡️ Rocket ➡️ Unicorn.',
  'MISTRZ PAŁACU PAMIĘCI! Zdobyłeś najwyższy laur oratorski! Leon ryczy z dumy i zachwytu! 🐯🏆👑': 'MEMORY PALACE MASTER! You earned the highest orator\'s laurel! Leo roars with pride and joy! 🐯🏆👑',
  'Dlaczego mózg kocha myślenie promieniste, a nie szary tekst?': 'Why does the brain love radiant thinking instead of gray walls of text?',
  'Słowa-klucze, piktogramy i kodowanie barwami': 'Keywords, pictograms, and color coding',
  'Hierarchia grubości linii, drukowane pismo i powiązania': 'Line thickness hierarchy, print lettering, and cross-links',
  'Streszczanie podręczników, wystąpienia bez kartki i projekty': 'Summarizing textbooks, note-free speeches, and project planning',
  'Odkryj tajemnicę nielinearnego myślenia i przewagę nad szarym tekstem.': 'Discover the secret of non-linear thinking and why it beats linear text.',
  'Jednokolorowy blok tekstu. Oko gubi się w linijkach, mózg zasypia, powtórka trwa długo i męczy wzrok.': 'Monochrome wall of text. Your eye gets lost in lines, the brain zones out, and review takes forever.',
  'Obraz w centrum, 4-8 barwnych macek, słowa-klucze i symbole. Pełny wgląd w temat w 5 sekund!': 'Central image, 4–8 colorful tentacles, keywords, and symbols. Full grasp of the topic in 5 seconds!',
  'Jak poprawnie rozpocząć mapę, by przyciągała wzrok obu półkul.': 'How to start your map right so it engages both brain hemispheres.',
  'Głębiny i rafy': 'Depths & reefs',
  'Drzewa i fauna': 'Trees & wildlife',
  'Góry': 'Mountains',
  'Szczyty i skały': 'Peaks & cliffs',
  'Chmury i wiatr': 'Clouds & wind',
  'Budowa grubych, organicznych konarów wiedzy.': 'Building thick, organic main branches of knowledge.',
  '🏃 Zdrowe Życie': '🏃 Healthy Living',
  '8h · ciemność · stała pora': '8h · darkness · fixed time',
  'spacery · trening · rozciąganie': 'walks · workouts · stretching',
  'Umysł': 'Mind',
  'Maksimum znaczenia przy minimalnej ilości znaków.': 'Maximum meaning with minimum words.',
  '„Ptaki drapieżne polują głównie w dzień i posiadają doskonały wzrok.” (Zbyt dużo zbędnego atramentu, mózg nie koduje esencji).': '"Birds of prey hunt primarily during daylight hours and possess extraordinary vision." (Too much wasted ink; your brain misses the core).',
  'Gałąź „Ptaki 🦅” ➔ „Drapieżne” ➔ „Wzrok 👁️” ➔ „Dzień ☀️”. Czysta esencja, błyskawiczna powtórka!': 'Branch "Birds 🦅" ➔ "Raptors" ➔ "Vision 👁️" ➔ "Day ☀️". Pure essence, instant recall!',
  'Dlaczego mały szkic jest wart więcej niż tysiąc słów tekstu.': 'Why a tiny sketch is worth a thousand words of text.',
  '🎨 Magia Piktogramów': '🎨 Magic of Pictograms',
  'Pomysły': 'Ideas',
  'żarówka · błysk': 'lightbulb · spark',
  'Budżet': 'Budget',
  'Jak kora wzrokowa mózgu segreguje wiedzę w barwne szufladki.': 'How your visual cortex sorts knowledge into colorful mental compartments.',
  'Woda · Chłód · Logika': 'Water · Cool · Logic',
  'Od ogółu do szczegółu: jak zmieścić liczby, daty i fakty bez chaosu.': 'General to specific: fitting numbers, dates, and facts without clutter.',
  'Konar Główny': 'Main Branch',
  'Pod-gałąź': 'Sub-Branch',
  'Średnia linia · Podgrupa': 'Medium line · Subgroup',
  'Gałązka Faktu': 'Fact Twig',
  'Długość linii': 'Line Length',
  'Dopasowana dokładnie do słowa': 'Matched to the exact word length',
  'Pismo odręczne, litery pisane pionowo i do góry nogami. Trzeba obracać kartkę, by cokolwiek przeczytać.': 'Cursive handwriting tilted sideways or upside down. You have to twist the page just to read it.',
  'Poziome litery drukowane na górnej krawędzi linii. Błyskawiczny skan wzrokowy, strzałki łączące fakty!': 'Horizontal PRINTED letters resting on top of each line. Instant visual scanning with linking arrows!',
  'Lustrzanym odbiciem od prawej do lewej': 'Mirror writing from right to left',
  'Kompletny proces syntezy podręcznika szkolnego lub raportu w 4 krokach.': 'Complete 4-step workflow to condense any textbook chapter or report.',
  '🏛️ Starożytny Rzym': '🏛️ Ancient Rome',
  'Ustrój': 'Government',
  'Inżynieria': 'Engineering',
  'Prezentacje, przemówienia, planowanie projektów i certyfikat Kartografa Umysłu.': 'Presentations, speeches, project planning, and Mind Cartographer certification.',
  '1. Wstęp': '1. Intro',
  '2. Rozwiązanie': '2. Solution',
  'Sedno ➔ Nowy pomysł ➔ Fakty': 'Core Idea ➔ Innovation ➔ Facts',
  '3. Przykłady': '3. Examples',
  '4. Finał': '4. Finale',
  'Planety Skaliste': 'Rocky Planets',
  'Gazowe Olbrzymy': 'Gas Giants',
  'Gwiazda Centralna': 'Central Star',
  'Cztery Pory Roku': 'Four Seasons',
  'Supermoc Zdrowia': 'Health Superpower',
  'Sen i Regeneracja': 'Sleep & Recovery',
  'Dobre Paliwo': 'Clean Fuel',
  'Rafa Koralowa': 'Coral Reef',
  'Ssaki Morskie': 'Marine Mammals',
  'Wielkie Wynalazki': 'Great Inventions',
  'Kraina Muzyki': 'Land of Music',
  'Rytmiczne Uderzenie': 'Rhythmic Beat',
  'Dusza Piosenki': 'Soul of the Song',
  'Poranny Start': 'Morning Start',
  'Magia Gotowania': 'Cooking Magic',
  'Baza i Energia': 'Base & Energy',
  'Kolorowe Warzywa': 'Colorful Veggies',
  'Od tęczy po odległe planety i rzymskie skarby': 'From rainbow colors to distant planets and Roman treasure',
  'Pierwiastki życia, witaminy, struny gitary i taksonomia': 'Elements of life, vitamins, guitar strings, and taxonomy',
  'Metoda tworzenia własnych akrostychów do dowolnej wiedzy': 'How to build your own acrostics for any subject',
  'Odkryj tajemnicę zdań-kluczy na wesołym przykładzie kolorów tęczy.': 'Uncover the secret of cue sentences with a fun rainbow colors example.',
  'Kolejność wszystkich planet Układu Słonecznego od Słońca.': 'Order of all Solar System planets from the Sun.',
  'Jak natychmiast odróżnić rzymskie setki i tysiące bez wahania?': 'How to instantly tell apart Roman 50, 100, 500, and 1000?',
  'Błyskawiczna orientacja na mapie i w grach terenowych.': 'Instant orientation on maps and in outdoor games.',
  'Kompletna deklinacja języka polskiego bez zająknięcia.': 'All 7 grammatical declension cases effortlessly in order.',
  'Jak rymy i wierszyki eliminują błędy z „-uje”, „-by” i „rz”.': 'How catchy rhymes prevent common grammar and spelling slips.',
  'Akronimy, które otwierają drzwi do biologii i medycyny.': 'Acronyms that unlock biology, chemistry, and medicine.',
  'Jak w sekundę zapamiętać nazwy wszystkich 6 strun gitary.': 'How to memorize all 6 open guitar string notes in a second.',
  'Pełna hierarchia systematyki organizmów od królestwa po gatunek.': 'The full biological taxonomy rank ladder from Kingdom to Species.',
  'Finał szkolenia u Pieska Łatka! Zostań niezależnym twórcą pamięci.': 'Graduation with Patch the Dog! Become an independent memory creator.',
  '„Czemu Patrzysz Żabko Zielona Na Fiołki?”': '"Run Out Yearly Gathering Blue Violets"',
  'Na Ekranie Siedzi Wrona': 'Never Eat Soggy Waffles',
  'Elegancki Gitarzysta Bardzo Dobrze Fika': 'Every Good Boy Does Fine',
  '„Żabko”': '"Yearly"',
  'Ż': 'Y',
  'Żabko': 'Yearly',
  'Fiołki': 'Violets',
  'Smaży': 'Served',
  'Mieszkać': 'Milk',
  'North (Północ ⬆️)': 'North ⬆️',
  'East (Wschód ➡️)': 'East ➡️',
  'South (Południe ⬇️)': 'South ⬇️',
  'West (Zachód ⬅️)': 'West ⬅️',
  'Dała': 'Good',
  'Córce': 'Dog',
  'Bułkę': 'Attacks',
  'Nasmarowaną': 'Innocent',
  'Masłem': 'Little',
  '„Kto kreskuje -uje, ten dwóje otrzymuje!”': '"Words ending in -uje take simple u!"',
  'Zawsze przez u zwykłe!': 'Always simple u!',
  'Rz po spółgłoskach!': 'Consonant cluster rule!',
  '„CHNOPS buduje ciało, a ADEK kocha masło!”': '"CHNOPS builds the body, and ADEK loves fats!"',
  'Węgiel': 'Carbon',
  'Wodór': 'Hydrogen',
  'Gołębie': 'Good',
  'Król': 'King',
  'Królestwo': 'Kingdom',
  'Tybetański': 'Philip',
  'Gryzł': 'Came',
  'Rybę': 'Over',
  'Rodzinną': 'For',
  'Gotowaną': 'Soup',
  '„Wypisz litery → Dodaj humor → Zobacz obraz w głowie!”': '"List letters -> Add humor -> Picture it!"',
  'Wypisz pierwsze litery listy': 'Write down the first letters of the list',
  'Ułóż zabawne, absurdalne zdanie': 'Create a funny, absurd sentence',
  'Zobacz scenę w wyobraźni na 3 sekundy': 'Visualize the scene vividly for 3 seconds',
  'Kosmos i Nauka': 'Space & Science',
  'Przyroda i Kolory': 'Nature & Colors',
  'Historia i Liczby': 'History & Numbers',
  'Biologia i Zdrowie': 'Biology & Health',
  'Geografia Polski': 'Geography & Compass',
  'Muzyka i Sztuka': 'Music & Arts',
  'As Pik': 'Ace of Spades',
  'Dama Karo': 'Queen of Diamonds',
  'Walet Trefl': 'Jack of Clubs',
  'Rzymskie L to 50; dłoń z 5 palcami tworzy kąt L': 'Roman L is 50; a hand with 5 fingers forms an L angle',
  'Tor kolejowy': 'Train track',
  'Nos klauna': 'Clown nose',
  'Rzeka Nil': 'Nile river',
  'Gruba lina': 'Thick rope',
  'Czarny kot': 'Black cat',
  'Morska fala': 'Ocean wave',
  'Neonowy bar': 'Neon sign bar',
  'Kryształ': 'Crystal',
  'otwiera się z hukiem i z impetem taranuje soczystego...': 'pops open with a bang and smashes into a juicy...',
  'eksploduje fontanną słodkiego soku, na którym ślizga się...': 'explodes into a sweet juice fountain that sends slipping...',
  'trąbi jak szalony i z łomotem wpada na gigantyczny...': 'trumpets wildly and crashes with a thud into a giant...',
  'unosi się w powietrzu i przebija go ostry pustynny...': 'floats in mid-air and gets poked by a prickly desert...',
  'w który z głośnym brzękiem uderza grająca rocka...': 'which gets struck with a loud twang by a rocking...',
  'na której struny skapują z góry zimne, pyszne...': 'onto whose strings drip cold, delicious scoops of...',
  'w których zamrożony jest wielki, złoty...': 'inside which is frozen a giant golden...',
  'który z błyskiem rozświetla silna kieszonkowa...': 'which is lit up in a flash by a bright pocket...',
  'której snop światła pada na lśniący, drogocenny...': 'whose beam shines directly onto a sparkling, precious...',
  'którego w jaskini pilnuje potężny, ziejący ogniem...': 'guarded inside a cavern by a mighty fire-breathing...',
  'który ryczy i odpala wielką, srebrną...': 'who roars and launches a massive silver...',
  'która z prędkością światła ląduje na srebrzystym...': 'which lands at light speed right onto the silvery...',
  'który okazuje się w całości zrobiony z żółtego...': 'which turns out to be made entirely of yellow...',
  'w którym wielkie dziury wygryza mała, zwinna...': 'in which giant holes are nibbled by a tiny nimble...',
  'która ucieka i z impetem skacze na sprężystą...': 'which darts away and leaps onto a bouncy...',
  'która wystrzeliwuje mysz wprost w wielki czekoladowy...': 'which catapults the mouse straight into a giant chocolate...',
  'na którego samym szczycie płonie woskowa...': 'on whose very top burns a glowing wax...',
  'której rozgrzany wosk zastyga w magiczny, błyszczący...': 'whose melted wax hardens into a magical shimmering...',
  'który w środku odbija cały ten 20-elementowy świat skojarzeń!': 'which reflects this entire 20-item world of associations inside!',
  'MASZ RUM': 'MUSH-ROOM',
  'KUNDEL': 'CAN-DO',
  'SWETER': 'WEATHER',
  'PIŁA': 'PILL-LOW',
  'SZARIK': 'SHARP-ARK',
  'BITELSI': 'BEATLES',
  'FOKA': 'FORK-SEAL',
  'BAT': 'BATMAN',
  'SZYP': 'SHEEP-SHIP',
  'KLAUN': 'CLOWN',
  'BRUD': 'BREAD-BARK',
  'HOSSA': 'HOARSE',
  'ŚNIEG': 'SNEAK',
  'MURAWA': 'MIRROR-MURAL',
  'SZPIEG': 'SPOOKY',
  'PŁETWA': 'PLATE-FIN',
  'KAP': 'CAP',
  'BUTLA': 'BOOT-BOTTLE',
  'BELKA': 'BELL-BEAM',
  'KIJ': 'KEY-STICK',
  'LOK': 'LOCK-CURL',
  'ROPA': 'ROPE-OIL',
  'LIFT': 'ELEVATOR',
  'BRYDŻ': 'BRIDGE-CARDS',
  'LEK': 'LAKE-REMEDY',
  'PISZCZY': 'PEACH-SQUEAK',
  'FROK': 'FROCK-FROG',
  'DAKTYL': 'DUCK-DATE',
  'BERŁO': 'BEAR-SCEPTER',
  'WULKAN': 'VOLCANO',
  'FOKS': 'FOXTROT',
  'DYREKTOR': 'DIRECTOR',
  'GOT': 'GOTH',
  'PIGUŁKA': 'PINK-PILL',
  'KAWA': 'COFFEE-COW',
  'SZYBA': 'SHIP-GLASS',
  'MAJTEK': 'SAILOR-MOUSE',
  'BURDA': 'BIRD-BRAWL',
  'AUL': 'OWL-HALL',
  'IGŁA': 'EAGLE-NEEDLE',
  'SPAJDI': 'SPIDEY',
  'BIEG': 'BEE-SPRINT',
  'ANTENA': 'ANTENNA',
  'KRA': 'ICE-CRACK',
  'WELUR': 'VELOUR',
  'SILNIK': 'SEAL-ENGINE',
  'LAJON': 'LION-BAR',
  'TAJGA': 'TAIGA',
  'MANKIET': 'MONKEY-CUFF',
  'APEL': 'APPEAL',
  'PERŁA': 'PEARL',
  'PLAMA': 'PLUM-STAIN',
  'CZERWIEŃ': 'CHERRY-RED',
  'NUTA': 'NUT-NOTE',
  'KARETA': 'CARROT-CARRIAGE',
  'ANIOŁ': 'ONION-ANGEL',
  'GARLIK / GAR': 'GARLIC-POT',
  'MILK / MILION': 'MILK-MILLION',
  'CZYSTY': 'CHEEKY-CLEAN',
  'BATERIA': 'BATTERY-BUTTER',
  'MIT': 'MEET-MYTH',
  'FISZKA': 'FISH-CARD',
  'SĘP': 'SOUP-VULTURE',
  'SALTO': 'SOMERSAULT',
  'SZUR': 'SHUSH-SUGAR',
  'HANI': 'HONEY-BEE',
  'KEKS': 'CAKE-MIX',
  'HAŁAS': 'HOUSE-HULLABALOO',
  'RUMOR': 'ROOM-RUMOR',
  'DÓR': 'DOOR-CHORD',
  'WINDA': 'WIND-LIFT',
  'FLOR / FLORYDA': 'FLORIDA-FLOOR',
  'RUFA': 'ROOF-STERN',
  'WAŁ': 'WALL-LEVEE',
  'TABLICA': 'TABLE-CHALKBOARD',
  'CZERW': 'CHERRY-CHAIR',
  'BEDUIN': 'BEDOUIN',
  'KLOC': 'CLOCK-BLOCK',
  'BUK': 'BEECH-BOOK',
  'PIENIĄDZ': 'PEN-PENNY',
  'BAGNO': 'BAG-BOG',
  'BOKSER': 'BOXER',
  'KARA': 'CAR-TICKET',
  'BUSOLA': 'BUS-COMPASS',
  'TRENER': 'TRAIN-TRAINER',
  'PLAN': 'PLANE-PLAN',
  'BAJKA': 'BIKE-TALE',
  'RÓD': 'ROYAL-ROAD',
  'SANIE': 'SUN-SLEIGH',
  'MUNDUR': 'MOON-UNIFORM',
  'STARA': 'STAR-SPARK',
  'REIN / RENIFER': 'REINDEER-RAIN',
  'SNOPEK': 'SNOW-SHEAF',
  'FAJERWERKI': 'FIREWORKS',
  'WATA': 'WATER-CANDY',
  'SIERŚĆ': 'SEA-FUR',
  'SANDAŁ': 'SAND-SANDAL',
  'ROK': 'ROCK-YEAR',
  'KOŃ': 'COIN-HORSE',
  'SWĄD': 'SWORD-SMOKE',
  'KRAN': 'CROWN-FAUCET',
  'Miau! Jestem Mruczek 🐾 Zagramy w "Cyfry"?': 'Meow! I\'m Whiskers 🐾 Want to play "Digits"?',
  'Nigdy więcej "znam tę twarz, ale jak on miał na imię?". Kotwice cech i mosty fonetyczne z Liskiem.': 'Never again say "I know that face, but what\'s their name?". Feature anchors & phonetic bridges with Rusty.',
  'Wybierz "Zainstaluj aplikację" lub "Dodaj do ekranu głównego".': 'Select "Install app" or "Add to Home Screen".',
  'Wybierz "Do ekranu początkowego" (Add to Home Screen).': 'Choose "Add to Home Screen".',
  'Kliknij "Dodaj" – gotowe! 🚀': 'Tap "Add" – all done! 🚀',
  'Losowe wyzwanie! Tygrysek pyta wyrywkowo: "Gdzie ukrył się jednorożec?" lub "Co zostawiłeś w Wieży?".': 'Random challenge! Leo asks on the spot: "Where did the unicorn hide?" or "What was left in the Tower?".',
  '"Moja Wiecznie Zapracowana Mama..." – znasz już planety na pamięć? 🪐': '"My Very Educated Mother..." – do you know the planets by heart already? 🪐',
  'Jak brzmi angielskie "mushroom"?': 'What does English "mushroom" sound like?',
  'Jaki kolor tęczy kryje się pod słowem "Żabko" w zdaniu o tęczy?': 'Which rainbow color is hidden under the word "Yellow" in the rainbow sentence?',
  'Która planeta jest czwarta od Słońca, odpowiadając słowu "Mama"?': 'Which planet is fourth from the Sun, matching the word "Mother"?',
  'Jaką wartość ma rzymska litera C w zdaniu "Lech Chce Dobrze Mieszkać"?': 'What value does the Roman letter C represent in "I Value Xylophones Like Cows Do Milk"?',
  'Który kierunek znajduje się po prawej stronie mapy (odpowiadający słowu "Ekranie")?': 'Which direction is on the right side of a map (matching East)?',
  'Jaki przypadek odpowiada słowu "Córce" (trzecie słowo w zdaniu)?': 'Which grammar case corresponds to the third word in the sentence?',
  'Jak brzmi złota zasada dotycząca pisowni wyrazów zakończonych na "-uje" (np. maluje, trenuje)?': 'What is the golden rule for spelling verb endings in grammar?',
  'Które 4 witaminy rozpuszczają się w tłuszczach, tworząc imię chłopca "ADEK"?': 'Which 4 vitamins are fat-soluble, forming the acronym "ADEK"?',
  'Jaki dźwięk ma najgrubsza, szósta struna basowa w gitarze (słowo "Ewy")?': 'What note is the thickest, sixth bass string on a guitar (word "Eddie")?',
  'Która ranga biologiczna odpowiada słowu "Gryzł" (trzeci szczebel od góry)?': 'Which biological rank corresponds to the third level from the top (Class)?',
  'Sekret mistrzów pamięci: nasz mózg nie potrafi utrzymać samego dźwięku imienia. Musimy je "przyczepić" do twarzy jak kolorową naklejkę!': 'Memory champions\' secret: our brain cannot easily hold onto an isolated name sound. We must \'stick\' it to the face like a bright colorful sticker!',
  'Imię samo w sobie jest ulotnym dźwiękiem. Trudno "zobaczyć" słowo Basia czy Marek.': 'A name by itself is an elusive sound. It is hard to "see" the abstract sound of a name.',
  'Zamiast wkuwać "dwa-osiem-cztery", ułóż z nich jedną zwariowaną historyjkę:': 'Instead of cramming "two-eight-four", build one crazy story out of them:',
  'Metoda Loci (z łaciny: "miejsca") ma ponad 2500 lat. Wymyślili ją starożytni Grecy, by pamiętać wielogodzinne mowy bez kartki!': 'The Method of Loci (Latin for "places") is over 2,500 years old. Ancient Greeks invented it to deliver multi-hour speeches without notes!',
  '• 0 = S oraz Z – słowo "Zero" zaczyna się na literę Z, a zero syczy cichutko jak wąż: sss!': '• 0 = S and Z – the word "Zero" starts with Z, and zero hisses quietly like a snake: sss!',
  'To bardzo proste! Zobacz: słowo "KOT" ma T na końcu (1), a słowo "SOS" ma S (0).': 'It is that simple! Notice: word "CAT" has T at the end (1), while "SAUCE" has S (0).',
  '• 4 = R – posłuchaj dominującej spółgłoski w słowie "czteRy" (R!) lub angielskim "fouR".': '• 4 = R – listen to the dominant consonant sound in "fouR" (R!) or "czteRy".',
  'Po co nam ta technika? Wyobraź sobie miny znajomych w szkole lub w pracy, gdy ktoś rzuci datę, a Ty po 2 sekundach w pamięci odpowiesz: "To będzie sobota!". Poczujesz się jak chodzący ludzki kalkulator!': 'Why do we need this technique? Imagine the jaws dropping when someone mentions a date, and 2 seconds later you say: "That was a Saturday!". You will feel like a human calendar!',
  'Miesiące nieparzyste zapamiętasz rymowanką: "Pracuję od 9 do 5 w sklepie 7/11":': 'Odd months are recalled via: "Working 9 to 5 (9/5 & 5/9) at 7-Eleven (7/11 & 11/7)":',
  'Np. tęcza: "Czemu Patrzysz Żabko Zielona Na Fiołki?" → Czerwony, Pomarańczowy, Żółty, Zielony, Niebieski, Fioletowy!': 'E.g. rainbow: "Richard Of York Gave Battle In Vain" → Red, Orange, Yellow, Green, Blue, Indigo, Violet!',
  'Planety: "Moja Wiecznie Zapracowana Mama..." → Merkury, Wenus, Ziemia, Mars, Jowisz, Saturn, Uran, Neptun!': 'Planets: "My Very Educated Mother Just Served Us Noodles" → Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune!',
  'Rzymskie liczby L, C, D, M: "Lech Chce Dobrze Mieszkać" → 50, 100, 500, 1000!': 'Roman numerals L, C, D, M: "I Value Xylophones Like Cows Do Milk" → 50, 100, 500, 1000!',
  'Nawigacja: "Na Ekranie Siedzi Wrona" → North, East, South, West (Północ, Wschód, Południe, Zachód)!': 'Navigation: "Never Eat Soggy Waffles" → North, East, South, West!',
  'Nigdy więcej nie powiesz: "Znam tę twarz, ale jak on miał na imię?". ✨': 'Never again will you say: "I know that face, but what was their name?". ✨',
  'Jaki dzień maja (5. miesiąc) jest kotwicą w regule "od 9 do 5"?': 'Which day in May (5th month) is an anchor in the "9 to 5" rule?',
  'Słowo "Żabko" zaczyna się na literę Ż – to kolor Żółty!': 'The word begins with Y – that is the color Yellow!',
  'Zawsze przez "u" otwarte ("Kto kreskuje -uje, ten dwóje otrzymuje")!': 'Always with simple "u" ("Never dot the -uje ending")!',
  'Zawsze przez "ó" z kreską': 'Always spelled with accented o-acute',
  'Z końcówką "-óje" w liczbie mnogiej': 'With plural ending \'-oje\'',
  'Ponieważ litera "m" ma 3 nóżki': 'Because the letter "m" has 3 downstrokes',
  'R (z dominującego R w słowie "czteRy")': 'R (from dominant R sound in fouR)',
  '"Pracuję od 9 do 5 na stacji 7/11":': '"Working 9 to 5 (9/5 & 5/9) at 7-Eleven (7/11 & 11/7)":',
  '• 2 = N – małe "n" ma DWA brzuszki / dwie nóżki stojące na ziemi.': '• 2 = N – lowercase \'n\' has TWO downstrokes standing on the ground.',
  '• 3 = M – małe "m" ma TRZY nóżki (raz, dwa, trzy!).': '• 3 = M – lowercase \'m\' has THREE downstrokes (one, two, three!).',
  '• 4 = R – powiedz głośno słowo "czteRy" – słyszysz to mocne, dźwięczne R na końcu?': '• 4 = R – say \'fouR\' out loud – hear that strong, clear R at the end?',
  '• 6 = J, SZ, CZ – powiedz "Sześć" – to najbardziej szeleszcząca cyfra w języku polskim! (A litera J to 6. spółgłoska alfabetu).': '• 6 = J, SH, CH – soft hissing sounds! (And lowercase j is a flipped 6).',
  '• 8 = F, W – pisana mała literka "f" ma dwie pętelki na górze i na dole, dokładnie jak cyfra 8.': '• 8 = F, V – cursive lowercase \'f\' has two loops, top and bottom, just like digit 8.',
  '• Wkładasz samogłoskę "O" w środek → powstaje puszysty KOT!': '• Insert vowel \'A\' in the middle → you get a fluffy CAT!',
  'Gdy słyszysz słowo "PIES", nie wyświetla Ci się w głowie czarny napis P-I-E-S na białym tle, prawda? Widzisz merdający ogon, słyszysz szczekanie, przypominasz sobie spacer w parku i miękką sierść!': 'When you hear the word \'DOG\', you don\'t see black letters D-O-G on white paper, do you? You see a wagging tail, hear a bark, recall a sunny park walk, and feel soft fur!',
  'Od centralnego obrazu wypuszczamy grube, organiczne gałęzie (najlepiej 3 do 7 głównych ramion, zgodnie z magiczną liczbą George\'a Millera 7 ± 2). Każda gałąź odpowiada jednemu wielkiemu filarowi tematu.': 'From the central image we sprout thick, organic branches (ideally 3 to 7 limbs, following Miller\'s magic number 7 ± 2). Each branch represents one grand pillar of the subject.',
  '• Nudna notatka: "Układ Słoneczny powstał około 4,6 miliarda lat temu w wyniku grawitacyjnego zapadnięcia się obłoku molekularnego." (18 słów, zasypiasz po przeczytaniu).': '• Dull note: "The Solar System formed around 4.6 billion years ago from gravitational collapse of a molecular cloud." (18 words, sleep-inducing).',
  '• Mapa myśli: Gałąź "Powstanie" → odnoga "4,6 mld lat ⏳" → odnoga "Zapada obłok 🌌".': '• Mind map: Branch "Formation" → twig "4.6B yrs ⏳" → twig "Collapsing cloud 🌌".',
  '2. 🎯 Obraz centralny: Połóż kartkę A4 poziomo. Narysuj na środku symbol tematu (np. dla działu "Starożytny Rzym" narysuj rzymski hełm legionisty 🏛️).': '2. 🎯 Central Image: Place an A4 sheet landscape. Draw a central symbol of the topic (e.g. Roman helmet for \'Ancient Rome\' 🏛️).',
  'Spójrz na angielskie słówko "mushroom" (grzyb).': 'Look at the foreign word "mushroom".',
  'Powiedz je na głos: "masz-rum".': 'Say it out loud: "mush-room".',
  'Brzmi dokładnie jak polskie pytanie: "MASZ RUM?!" 🏴‍☠️': 'Sounds just like "champion" or pirate asking for rum! 🏴‍☠️',
  'Mamy już most "MASZ RUM" i wiemy, że mushroom oznacza GRZYB.': 'We have our sound bridge and know that mushroom means mushroom.',
  'Wielki leśny prawdziwek z wąsami i w trójkątnym kapeluszu pirata staje przed Tobą, uderza pięścią w stół i groźnie krzyczy: "MASZ RUM W BUTELCE?!"': 'A boxing champion in gloves enters the ring and bites into a giant mushroom for energy!',
  'Jakie karty koduje scena: "Król Artur rzuca wielkim błękitnym diamentem"?': 'Which cards are encoded by the scene: "King Arthur throws a giant blue diamond"?',
  'Jaką liczbę koduje słowo "NOS" (N=2, S=0)?': 'Which number is encoded by the word "NOSE" (N=2, S=0)?',
  'W jaki sposób zasada "jedno ramię = jeden unikalny kolor" pomaga podczas egzaminu lub testu?': 'How does the rule "one branch = one unique color" help during an exam?',
  'Jaki polski zwrot brzmi niemal identycznie jak angielskie słówko "mushroom"?': 'What sound-alike word resembles foreign "mushroom"?',
  'Co oznacza angielskie słówko "mushroom"?': 'What does foreign "mushroom" mean?',
  'Co oznacza angielskie słówko "shark" (most: pies SZARIK machający ogonem w płetwie rekina)?': 'What does "shark" mean (bridge: pet dog swimming in a shark fin)?',
  'Mushroom brzmi jak "masz rum" lub "champion"!': 'Mushroom sounds like "champion"!',
  'Wsłuchaj się w słowo "czteRy"!': 'Listen closely to the sound of "fouR" or "czteRy"!',
  '\n<div class="major">\n  <p class="panel-title">Alfabet cyfr (System Major)</p>\n  <div class="major-grid">\n    <div><b>0</b><span>S Z C</span></div><div><b>1</b><span>T D</span></div><div><b>2</b><span>N</span></div>\n    <div><b>3</b><span>M</span></div><div><b>4</b><span>R</span></div><div><b>5</b><span>L</span></div>\n    <div><b>6</b><span>SZ CZ Ż</span></div><div><b>7</b><span>K G</span></div><div><b>8</b><span>F W</span></div>\n    <div><b>9</b><span>P B</span></div>\n  </div>\n  <p class="panel-note">Samogłoski (A E I O U Y) są "za darmo" – wstawiasz je, żeby powstało słowo. <b>TOR</b> → T=1, R=4 → <b>14</b>.</p>\n</div>': '\n<div class="major">\n  <p class="panel-title">Digit Alphabet (Major System)</p>\n  <div class="major-grid">\n    <div><b>0</b><span>S Z</span></div><div><b>1</b><span>T D</span></div><div><b>2</b><span>N</span></div>\n    <div><b>3</b><span>M</span></div><div><b>4</b><span>R</span></div><div><b>5</b><span>L</span></div>\n    <div><b>6</b><span>J SH CH</span></div><div><b>7</b><span>K G</span></div><div><b>8</b><span>F V</span></div>\n    <div><b>9</b><span>P B</span></div>\n  </div>\n  <p class="panel-note">Vowels (A E I O U Y) are free glue – insert them to build words. <b>TAR</b> → T=1, R=4 → <b>14</b>.</p>\n</div>',
  '5 września ("praca 9 do 5" -> 5.09)': 'September 5 ("9 to 5" -> 5.09)',
  'Małe "n" ma dwie nóżki': 'Lowercase "n" has two legs',
  'Małe "m" ma trzy nóżki': 'Lowercase "m" has three legs',
  'Szóstka brzmi jak "sz", jota jest 6. spółgłoską': 'Six sounds like "sh"',
  'Wielki leśny borowik wyciąga rękę i krzyczy pirackim głosem: "MASZ RUM w butelce?!"': 'A giant forest mushroom waives its arms inside a cramped tiny ROOM squeezed like MUSH!',
  'Biały KOŃ zakłada garnitur maklera i krzyczy na giełdzie: "Idzie HOSSA, kupujemy siano!"': 'A majestic white HORSE clears its throat because its neigh sounds funny and HOARSE!',
  'Stroma twarda SKAŁA w górach ma na szczycie wielki napis: "Szczęśliwego Nowego ROKU!"': 'A towering granite ROCK on the mountain peak is carved with a giant \'HAPPY NEW YEAR!\' banner!',
  'Zobacz: 528 i 913. Przeczytaj je jak dwie liczby: "pięćset dwadzieścia osiem" i "dziewięćset trzynaście".': 'Look: 528 and 913. Read them as two numbers: "five hundred twenty-eight" and "nine hundred thirteen".',
  'Np. 14 = T-R → "TOR" 🛤️ oraz 31 = M-T → "MATA" 🧘. Zapamiętaj obrazy!': 'E.g., 14 = T-R → "TRACK" 🛤️ and 31 = M-T → "MAT" 🧘. Memorize the images!',
  'Zdanie-trop brzmi: "Czemu Patrzysz Żabko Zielona Na Fiołki?"': 'The memory cue is: "Richard Of York Gave Battle In Vain" (Red, Orange, Yellow, Green, Blue, Indigo, Violet)',
  '"Moja Wiecznie Zapracowana Mama Zawsze Smaży Nam Placki"': '"My Very Educated Mother Just Served Us Noodles" (or Polish: "Moja Wiecznie Zapracowana Mama...")',
  '"Lech Chce Dobrze Mieszkać"': '"Lazy Cows Drink Milk" (L=50, C=100, D=500, M=1000)',
  'Słowo-klucz: "C-H-N-O-P-S" (czytamy: CHNOPS)': 'Key acronym: "C-H-N-O-P-S" (pronounced: CHNOPS)',
  '"Edek Hoduje Gołębie Dla Agaty Ewy"': '"Every Good Boy Does Fine" (Treble Staff E-G-B-D-F)',
  '"Mama Dała Córce Bułkę Nasmarowaną Masłem Wiejskim"': '"Mama Gave Daughter A Buttered Roll" (7 grammatical cases)',
  '"Król Tybetański Gryzł Rybę Rodzinną Rano Gotowaną"': '"Dear King Philip Came Over For Good Soup" (Taxonomy hierarchy)',
  '3. 🚫 Żadnych sztywnych ramek: Nie zamykaj tematu w kwadracie ani sztywnym prostokącie! Zamknięta ramka krzyczy do mózgu: "Koniec, tu się zatrzymaj!". Obraz centralny musi swobodnie promieniować na boki.': '3. 🚫 No rigid borders: Never trap your topic in a stiff box or rectangle! A box shouts to the brain: "Stop here!". The central image must radiate freely outward.',
  'Na przykład dla tematu "Zdrowe Życie": Ramię 1: Sen 💤, Ramię 2: Dieta 🥗, Ramię 3: Ruch 🏃, Ramię 4: Umysł 🧠.': 'For example, with "Healthy Life": Branch 1: Sleep 💤, Branch 2: Diet 🥗, Branch 3: Exercise 🏃, Branch 4: Mind 🧠.',
  'Co to daje na egzaminie? Zamykasz oczy na 2 sekundy i wewnętrznym wzrokiem widzisz: "Aha! Pytanie dotyczy klimatu – klimat był na zielonym ramieniu po prawej stronie na dole!". Kolor działa jak błyskawiczny drogowskaz w pamięci!': 'How does this help on an exam? Close your eyes for 2 seconds and picture it: "Aha! The question is about climate – climate was on the green branch on the lower right!". Color acts as an instant memory beacon!',
  '• Wiek XX (lata 1900–1999): baza stulecia to ŚRODA (3, 3 sylaby: "dzie-więć-set")!': '• 20th Century (1900–1999): century base is WEDNESDAY (3 syllables: "nine-teen-hun")!',
  'Możesz teraz śmiało wejść w tryb "Podróżnik w czasie" i błyskawicznie podać dzień tygodnia dla dowolnej daty w historii i przyszłości! 🐢🪐': 'Now step boldly into Time Traveler mode and name the weekday of any date in past or future! 🐢🪐',
  'Po co nam ten trop? Rzymskie cyfry I (1), V (5) i X (10) zna każdy. Problem zaczyna się przy wyższych wartościach: L, C, D, M. Na zegarach, pomnikach, datach w filmach i na fasadach budynków ludzie często zastanawiają się: "Ile to było C, a ile D?".': 'Why this cue? Everyone knows Roman numerals I (1), V (5), and X (10). The trouble starts with higher values: L, C, D, M. On clocks, monuments, movie copyright dates, and buildings, people often wonder: "Was C 100 or 500?".',
  '1. Końcówka "-uje": "Kto kreskuje -uje, ten dwóje otrzymuje!" (maluje, rysuje, gotuje – ZAWSZE przez u zwykłe!).': '1. Endings rule: "Words ending in -uje take simple u" (maluje, rysuje, gotuje – always simple u!).',
  '2. Cząstka "-by": Z czasownikami w formie osobowej PISZEMY ZAWSZE RAZEM: zrobiłby, poszedłby, zaśpiewałaby.': '2. The conditional suffix "-by": Written together with personal verbs: zrobilby, poszedlby, zaspiewalaby.',
  '3. Rz po spółgłoskach (p, b, t, d, k, g, ch, j, w): Zdanie-trop brzmi: "Prosił Bohaterski Tygrys Dobrego Konia, Gdy Chciał Jeść Warzywa". Po literach P, B, T, D, K, G, CH, J, W piszemy RZ (np. przyjaciel, brzeg, trzeba, drzewo, krzak)!': '3. Consonant clusters rule: "P, B, T, D, K, G, CH, J, W lead to RZ" (przyjaciel, brzeg, trzeba, drzewo, krzak)!',
  'Zdanie-klucz brzmi: "Edek Hoduje Gołębie Dla Agaty Ewy"': 'The key mnemonic is: "Eddie Ate Dynamite, Good Bye Eddie" (Strings E-A-D-G-B-E)',
  '2. 🤪 Znajdź śmieszne, żywe słowa: Nie twórz nudnych zdań! Twój mózg ignoruje przeciętność. Ułóż coś zaskakującego, np. "Czarny Małpiszon Pożarł Śrubokręt!" (C, M, P, S).': '2. 🤪 Pick funny, vivid words: Avoid dull sentences! Your brain ignores boring things. Create something absurd, like "Big Monkeys Throw Coconuts!" (B, M, T, C).',
  'Spróbuj odtworzyć cyfry "w głowie", jakbyś je słyszał.': 'Try replaying the digits in your mind as if you hear them.',
  '\n  <div class="major">\n    <p class="panel-title">Alfabet cyfr (System Major)</p>\n    <div class="major-grid">\n      <div><b>0</b><span>S Z C</span></div><div><b>1</b><span>T D</span></div><div><b>2</b><span>N</span></div>\n      <div><b>3</b><span>M</span></div><div><b>4</b><span>R</span></div><div><b>5</b><span>L</span></div>\n      <div><b>6</b><span>SZ CZ Ż</span></div><div><b>7</b><span>K G</span></div><div><b>8</b><span>F W</span></div>\n      <div><b>9</b><span>P B</span></div>\n    </div>\n    <p class="panel-note">Samogłoski (A E I O U Y) są "za darmo" – wstawiasz je, żeby powstało słowo. <b>TOR</b> → T=1, R=4 → <b>14</b>.</p>\n  </div>': '\n  <div class="major">\n    <p class="panel-title">Digit Alphabet (Major System)</p>\n    <div class="major-grid">\n      <div><b>0</b><span>S Z</span></div><div><b>1</b><span>T D</span></div><div><b>2</b><span>N</span></div>\n      <div><b>3</b><span>M</span></div><div><b>4</b><span>R</span></div><div><b>5</b><span>L</span></div>\n      <div><b>6</b><span>J SH CH</span></div><div><b>7</b><span>K G</span></div><div><b>8</b><span>F V</span></div>\n      <div><b>9</b><span>P B</span></div>\n    </div>\n    <p class="panel-note">Vowels (A E I O U Y) are free glue – insert them to build words. <b>TAR</b> → T=1, R=4 → <b>14</b>.</p>\n  </div>',
  '"Ptaki drapieżne polują głównie w dzień i posiadają doskonały wzrok." (Zbyt dużo zbędnego atramentu, mózg nie koduje esencji).': '"Birds of prey hunt primarily during daylight hours and possess extraordinary vision." (Too much wasted ink; your brain misses the core).',
  'Gałąź "Ptaki 🦅" ➔ "Drapieżne" ➔ "Wzrok 👁️" ➔ "Dzień ☀️". Czysta esencja, błyskawiczna powtórka!': 'Branch "Birds 🦅" ➔ "Raptors" ➔ "Vision 👁️" ➔ "Day ☀️". Pure essence, instant recall!',
  'Jak rymy i wierszyki eliminują błędy z "-uje", "-by" i "rz".': 'How catchy rhymes prevent common grammar and spelling slips.',
  '"Czemu Patrzysz Żabko Zielona Na Fiołki?"': '"Run Out Yearly Gathering Blue Violets"',
  '"Żabko"': '"Yearly"',
  '"Kto kreskuje -uje, ten dwóje otrzymuje!"': '"Words ending in -uje take simple u!"',
  '"CHNOPS buduje ciało, a ADEK kocha masło!"': '"CHNOPS builds the body, and ADEK loves fats!"',
  '"Wypisz litery → Dodaj humor → Zobacz obraz w głowie!"': '"List letters -> Add humor -> Picture it!"'
};

// Wzorce regex dla napisów dynamicznych (poziomy, lekcje, serie itp.)
const PATTERNS_EN = [
  [/^To nie ta osoba! Przypomnij sobie jej cechę 🔍 Pozostało szans:\s*(\d+)$/, 'Not that person! Recall their unique feature 🔍 Chances left: $1'],
  [/^Poziom (\d+) w kieszeni! Pokaż pazur w kolejnej komnacie! 🐯🔥$/, 'Level $1 in the bag! Show your claws in the next room! 🐯🔥'],
  [/^🎉 Poziom (\d+) zaliczony!$/, '🎉 Level $1 completed!'],
  [/^Kolejny poziom (\d+) ▶$/, 'Next Level $1 ▶'],
  [/^Zapamiętaj kolejność (\d+) kart!$/, 'Memorize the order of $1 cards!'],
  [/^Zapamiętaj te (\d+) karty!$/, 'Memorize these $1 cards!'],
  [/^NOWY REKORD:\s*(\d+)\s*cyfr! 🏆🎉$/, 'NEW RECORD: $1 digits! 🏆🎉'],
  [/^🏆 Rekord w tym trybie:\s*(\d+)(.*)$/, '🏆 Record in this mode: $1$2'],
  [/^🏆 Twój rekord:\s*(\d+)(.*)$/, '🏆 Your record: $1$2'],
  [/^Rekord:\s*(\d+)(.*)$/, 'Record: $1$2'],
  [/^Najlepszy wynik:\s*(\d+)\s*pkt$/, 'Best score: $1 pts'],
  [/^Najlepszy wynik:\s*(\d+)$/, 'Best score: $1'],
  [/^Lekcja (\d+):\s*(.*?)!\s*Sprawdź moją sprytną wskazówkę\.$/, 'Lesson $1: $2! Check out my clever tip.'],
  [/^Zdobyto (\d+) z (\d+) gwiazdek · Ukończono (\d+)\/(\d+) lekcji$/, 'Earned $1 of $2 stars · Completed $3/$4 lessons'],
  [/^Świetne postępy! Masz już (\d+) z (\d+) lekcji\. Wybierz kolejną komnatę! 🏰$/, 'Great progress! You have $1 of $2 lessons. Pick the next room! 🏰'],
  [/^Komnata (\d+) z (\d+)$/, 'Room $1 of $2'],
  [/^Tak jest!\s*(.*?)\s*!\s*Świetna pamięć!$/, 'That\'s it! $1! Excellent memory!'],
  [/^Ups! To nie to\. Spokojnie, rozejrzyj się po komnacie (.*?) jeszcze raz!$/, 'Oops! Not that one. Relax, look around the $1 room again!'],
  [/^Podpowiedź:\s*(.*)$/, 'Hint: $1'],
  [/^Przystanek (\d+):\s*(.*?)\.\s*Pamiętasz, co tu zostawiliśmy\?$/, 'Stop $1: $2. Remember what we left here?'],
  [/^Świetny postęp! Masz już (\d+)\/(\d+) wykładów zaliczonych!$/, 'Great progress! You have $1/$2 lectures completed!'],
  [/^Uhuhu! Lekcja (\d+):\s*(.*?)\.\s*Spójrz na podpowiedź poniżej!$/, 'Hoot-hoot! Lesson $1: $2. Check the hint below!'],
  [/^Świetny postęp! (\d+)\/(\d+) lekcji za nami! Tasujemy dalej!$/, 'Great progress! $1/$2 lessons behind us! Keep shuffling!'],
  [/^Abrakadabra! Lekcja (\d+):\s*(.*?)\.\s*Spójrz na magiczną sztuczkę!$/, 'Abracadabra! Lesson $1: $2. Behold the magic trick!'],
  [/^Chrup, chrup! Lekcja (\d+):\s*(.*?)\.\s*Zobacz, jak połączymy te rzeczy!$/, 'Crunch, crunch! Lesson $1: $2. See how we link these items!'],
  [/^Świetnie! Mamy (\d+)\/(\d+) lekcji czasu za sobą! Idziemy dalej\?$/, 'Great! We have $1/$2 time lessons behind us! Moving on?'],
  [/^Cześć! Lekcja (\d+):\s*(.*?)\.\s*Spokojnie zbadajmy daty!$/, 'Hi! Lesson $1: $2. Let\'s explore dates calmly!'],
  [/^Świetnie! Mamy za sobą (\d+)\/(\d+) lekcji tropienia! Ruszamy dalej\? 🐾$/, 'Great! We have $1/$2 tracking lessons behind us! Moving on? 🐾'],
  [/^Hau! Lekcja (\d+):\s*(.*?)\.\s*Złapmy ten trop!$/, 'Woof! Lesson $1: $2. Let\'s catch this scent!'],
  [/^Brawo! (\d+)\/(\d+) lekcji za nami! Lećmy dalej!$/, 'Bravo! $1/$2 lessons behind us! Flying forward!'],
  [/^Lekcja (\d+):\s*(.*?)\.\s*Posłuchaj tego słówka!$/, 'Lesson $1: $2. Listen to this word!'],
  [/^Plusk! Lekcja (\d+):\s*(.*?)\.\s*Zbudujmy tę gałąź!$/, 'Splash! Lesson $1: $2. Let\'s grow this branch!'],
  [/^Gość na bankiecie \((\d+) osób w sali\)$/, 'Party guest ($1 people in the room)'],
  [/^W komnacie (.*?) znajduje się (.*?)!\s*(.*?)\.$/, 'Inside $1 there is $2! It $3.'],
  [/^Komnata (\d+):\s*(.*?)\.\s*Zobacz:\s*(.*)$/, 'Room $1: $2. Visualize: $3'],
  [/^Komnata (\d+):\s*(.*?)!\s*Szybko zapamiętaj!$/, 'Room $1: $2! Memorize quickly!'],
  [/^Komnata (\d+):\s*(.*?)\s*➡️\s*(.*?)$/, 'Room $1: $2 ➡️ $3'],
  [/^Krok (\d+) \(W TYŁ\)$/, 'Step $1 (BACKWARD)'],
  [/^Cofamy się! Komnata:\s*(.*?)\.\s*Co tam było\?$/, 'Going back! Room: $1. What was there?'],
  [/^Co ukrywa (.*?)\?$/, 'What is hidden in $1?'],
  [/^Genialnie! Twój pałac rośnie w siłę! Wynik:\s*(\d+)\s*(.*?)[!.]?$/, 'Brilliant! Your palace grows stronger! Score: $1 rooms!'],
  [/^Poziom (\d+) w kieszeni! Pokaż pazur w kolejnej komnacie! 🐯🔥$/, 'Level $1 in the bag! Show your claws in the next room! 🐯🔥'],
  [/^W komnacie (.*?) znajdował się:\s*(.*?),\s*a wybrano:\s*(.*?)\.?$/, 'Inside $1 was: $2, but selected: $3.'],
  [/^NOWY REKORD:\s*(\d+)\s*cyfr! 🏆🎉$/, 'NEW RECORD: $1 digits! 🏆🎉'],
  [/^🏆 Rekord w tym trybie:\s*(\d+)(.*)$/, '🏆 Record in this mode: $1$2'],
  [/^Wyobrażenie:\s*(.*)$/, 'Mental Image: $1'],
  [/^Zapamiętaj kolejność (\d+) kart!$/, 'Memorize the order of $1 cards!'],
  [/^Ojej!\s*(.*?) to:\s*(.*?)\s*\((.*?)\)!\s*Masz jeszcze (\d+) szanse\.\s*🦝$/, 'Oh! $1 is: $2 ($3)! You still have $4 chances left. 🦝'],
  [/^Zapamiętaj te (\d+) karty!$/, 'Memorize these $1 cards!'],
  [/^(.*?)Masz jeszcze (\d+) szanse\.\s*🐿️$/, '$1You still have $2 chances left. 🐿️'],
  [/^Po (.*?) następuje (.*?)!$/, 'After $1 comes $2!'],
  [/^Przed (.*?) znajdował się:\s*(.*?)!$/, 'Before $1 was: $2!'],
  [/^Ogniwo #(\d+) w łańcuchu domina\.$/, 'Link #$1 in the domino chain.'],
  [/^Wskazówka: kotwica miesiąca to (.*?)\s*\(w 2026 to (.*?)\)$/, 'Hint: month anchor is $1 (in 2026 it\'s $2)'],
  [/^Wskazówka: kotwica roku (\d+) to (.*?) ⏳ \(kotwica miesiąca:\s*(.*?)\)$/, 'Hint: year $1 anchor is $2 ⏳ (month anchor: $3)'],
  [/^Wskazówka: kotwica (.*?) to (.*?)$/, 'Hint: anchor of $1 is $2'],
  [/^(\d+)\.\s*dzień miesiąca$/, 'Day $1 of month'],
  [/^Niezwykły bieg! Zdobywasz (\d+) punktów! Piesek Łatek jest z Ciebie dumny! 🐶🏆$/, 'Unreal run! You scored $1 points! Patch the Dog is proud of you! 🐶🏆'],
  [/^Dobra runda! Zdobywasz (\d+) punktów\. Każdy trening wyostrza Twój zmysł pamięci! 🐾$/, 'Good round! You scored $1 points. Every practice sharpens your memory sense! 🐾'],
  [/^Najlepszy wynik:\s*(\d+)(.*)$/, 'Best score: $1$2'],
  [/^Słowo [„"](.*?)[”"] to (.*?)!$/, 'Word "$1" is $2!'],
  [/^Po [„"](.*?)[”"] następuje [„"](.*?)[”]!$/, 'After "$1" comes "$2"!'],
  [/^Język:\s*(.*)$/, 'Language: $1'],
  [/^Wymowa zbliżona do:\s*[„"](.*?)[”"]$/, 'Pronunciation close to: "$1"'],
  [/^Wspaniały wynik! Zdobywasz (\d+) punktów! Ośmiornica Inka jest pod wielkim wrażeniem! 🐙🏆$/, 'Splendid score! You earned $1 points! Inky the Octopus is deeply impressed! 🐙🏆'],
  [/^Dobra runda! Zdobywasz (\d+) punktów\. Z każdą mapą myśli Twoja pamięć jest coraz silniejsza! 💡$/, 'Good round! You earned $1 points. With each mind map, your memory grows stronger! 💡'],
  [/^Jak nazywa się brakujące ramię w mapie myśli [„"](.*?)[”"]\?$/, 'What is the name of the missing branch in the mind map "$1"?'],
  [/^Do którego ramienia mapy myśli [„"](.*?)[”"] przypniesz element [„"](.*?)[”"]\?$/, 'To which branch of the mind map "$1" will you attach the item "$2"?'],
  [/^Ramię:\s*(.*)$/, 'Branch: $1'],
  [/^Szybko! Do którego ramienia należy [„"](.*?)[”"]\?$/, 'Quick! Which branch does "$1" belong to?'],
  [/^\(litera (.*)\)\?$/, '(letter $1)?'],
  [/^(\d+)\s*cyfr\s*·\s*kształty$/, '$1 digits · shapes'],
  [/^(\d+)\s*cyfr\s*·\s*obrazy$/, '$1 digits · pictures'],
  [/^(\d+)\s*cyfry?$/, '$1 digits'],
  [/^(\d+)\s*z\s*(\d+)\s*gwiazdek$/, '$1 of $2 stars'],
  [/^Cyfry:\s*(.*)$/, 'Digits: $1'],
  [/^Zdanie:\s*[„"](.*)[”"]$/, 'Sentence: "$1"'],
  [/^Kategoria:\s*(.*)$/, 'Category: $1'],
  [/^Miau!\s*(\d+)\s*(?:dni|dzień)\s*z\s*rzędu\s*[–-]\s*świetna passa!\s*🔥\s*Twoje urocze zwierzątka czekają na trening!$/, 'Meow! $1-day streak – awesome! 🔥 Your cute pets are waiting for training!'],
  [/^Słowo\s*[„"](.*?)[”"]\s*to\s*(.*?)!$/, 'Word "$1" is $2!'],
  [/^Po\s*[„"](.*?)[”"]\s*następuje\s*[„"](.*?)[”"]!$/, 'After "$1" comes "$2"!'],
  [/^(\d+)\s+([a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ]+)\s+(\d{4})$/, '$2 $1, $3'],
  [/^(.*?)\s*\([„"](.*?)[”"]\)$/, '$1 ("$2")'],
  [/^Brakującym elementem był:\s*(.*?)!$/, 'The missing element was: $1!'],
  [/^⭐\s*(\d+)\/(\d+)\s*gwiazdek$/, '⭐ $1/$2 stars'],
  [/^(\d+)\/(\d+)\s*gwiazdek$/, '$1/$2 stars'],
  [/^(\d+)\s*gwiazdek$/, '$1 stars'],
  [/^(\d+)\s*interaktywnych lekcji\s*·\s*kotwice cech\s*·\s*mosty fonetyczne$/, '$1 interactive lessons · feature anchors · phonetic bridges'],
  [/^(\d+)\s*lekcji\s*·\s*haczyki pierwszych liter\s*·\s*całe listy wiedzy w jednym zdaniu$/, '$1 lessons · first-letter hooks · full lists in one sentence'],
  [/^(\d+)\s*lekcji\s*·\s*algorytm Doomsday\s*·\s*kotwice miesięcy\s*·\s*dni tygodnia w pamięci$/, '$1 lessons · Doomsday algorithm · month anchors · mental calendar'],
  [/^(\d+)\s*lekcji\s*·\s*żywioły talii\s*·\s*metoda PAO\s*·\s*zapamiętywanie rozdań$/, '$1 lessons · suits of the deck · PAO method · memorizing deals'],
  [/^(\d+)\s*(?:interaktywnych\s+)?lekcji\s*·\s*od\s*(\d+)\s*do\s*(\d+)\s*cyfr\s*·\s*podpowiedzi Mruczka$/i, '$1 lessons · $2 to $3 digits · Whiskers\' hints'],
  [/^(\d+)\s*lekcji\s*·\s*efekt domina\s*·\s*cały łańcuch 20 ogniw bez kartki$/, '$1 lessons · domino effect · 20 links without notes'],
  [/^(\d+)\s*lekcji\s*·\s*spółgłoski 0-9\s*·\s*kołki pamięciowe\s*·\s*zapamiętywanie PIN$/, '$1 lessons · consonants 0-9 · memory pegs · memorizing PINs'],
  [/^(\d+)\s*lekcji\s*·\s*promieniście od centrum\s*·\s*nielinearne notatki i gałęzie wiedzy$/, '$1 lessons · radiant from center · non-linear notes & knowledge branches'],
  [/^(\d+)\s*(?:interaktywnych\s+)?lekcji\s*·\s*od\s*(\d+)\s*do\s*(\d+)\s*komnat\s*·\s*spokojne wskazówki Leona$/i, '$1 lessons · $2 to $3 rooms · Leo\'s calm tips'],
  [/^(\d+)\s*lekcji\s*·\s*metoda słów-kluczy\s*·\s*ponad 100 angielskich słówek w locie$/, '$1 lessons · Keyword Method · over 100 English words on the fly'],
  [/^(\d+)\s*interaktywnych lekcji$/, '$1 interactive lessons'],
  [/^(\d+)\s*lekcji$/, '$1 lessons'],
  [/^(\d+)\s*wykładów$/, '$1 lectures'],
  [/^Lekcja (\d+) z (\d+)$/, 'Lesson $1 of $2'],
  [/^Lekcja (\d+) w (.*)$/, 'Lesson $1 in $2'],
  [/^Lekcja (\d+)\/(\d+): (.*)$/, 'Lesson $1/$2: $3'],
  [/^Lekcja (\d+): (.*)$/, 'Lesson $1: $2'],
  [/^(\d+)\/(\d+) lekcji$/, '$1/$2 lessons'],
  [/^Mamy opanowane (\d+) z (\d+) lekcji\. Dokończmy szkolenie! 🦊$/, 'We\'ve mastered $1 of $2 lessons. Let\'s finish training! 🦊'],
  [/^Świetnie! Mamy (\d+) z (\d+) lekcji! Ruszajmy po kolejne gwiazdki! 🐾$/, 'Great! We have $1 of $2 lessons! Let\'s go for more stars! 🐾'],
  [/^Świetnie! Masz (\d+) z (\d+) lekcji! Ruszajmy po kolejne gwiazdki! 🌊$/, 'Great! You have $1 of $2 lessons! Let\'s go for more stars! 🌊'],
  [/^Zrobiłeś (\d+) z (\d+) lekcji czasu! Chodźmy dalej!$/, 'You completed $1 of $2 time lessons! Let\'s move on!'],
  [/^Masz za sobą (\d+) z (\d+) lekcji\. Dokończmy szkolenie iluzji!$/, 'You have $1 of $2 lessons behind you. Let\'s finish illusion training!'],
  [/^Wróciłeś! Masz za sobą (\d+) z (\d+) lekcji\. Kontynuujemy\? 😸$/, 'You returned! You have $1 of $2 lessons done. Shall we continue? 😸'],
  [/^Mamy (\d+) z (\d+) lekcji! Dokończmy spiżarnię skojarzeń!$/, 'We have $1 of $2 lessons! Let\'s finish the association pantry!'],
  [/^Mamy za sobą (\d+) z (\d+) wykładów\. Chodźmy dalej do biblioteki! 📚$/, 'We have $1 of $2 lectures done. Onward to the library! 📚'],
  [/^Witaj z powrotem w pałacu! Mamy za sobą (\d+) z (\d+) lekcji\. Idziemy dalej\? 🏰$/, 'Welcome back to the palace! We have $1 of $2 lessons behind us. Moving on? 🏰'],
  [/^Zrobiliśmy (\d+) z (\d+) lekcji! Lecimy dalej z językami\?$/, 'We did $1 of $2 lessons! Flying forward with vocabulary?'],
  [/^Świetnie! Masz zaliczone (\d+)\/(\d+) lekcji! Kontynuujmy!$/, 'Great! You passed $1/$2 lessons! Let\'s continue!'],
  [/^Cześć! Jestem Lisek Bystrzak 🦊 Przejdźmy razem (\d+) kroków do mistrzowskiej pamięci twarzy!$/, 'Hi! I\'m Rusty the Fox 🦊 Let\'s take $1 steps to master face memory together!'],
  [/^Mamy za sobą (\d+)\/(\d+) lekcji tropienia! Ruszajmy dalej\? 🐾$/, 'We\'ve completed $1/$2 tracking lessons! Moving on? 🐾'],
  [/^Świetnie! Masz zaliczone (\d+)\/(\d+) lekcji kartografii umysłu! Płyniemy dalej\? 🌊$/, 'Great! You\'ve passed $1/$2 mind mapping lessons! Sailing onward? 🌊'],
  [/^Niewiarygodne combo x(\d+)! Jesteś legendą bankietu! 🦊🏆✨$/, 'Incredible combo x$1! You are a party legend! 🦊🏆✨'],
  [/^Combo x(\d+)! Twoje oko wyłapie każdy detal! 🦊✨$/, 'Combo x$1! Your eye catches every single detail! 🦊✨'],
  [/^Absolutne mistrzostwo x(\d+)! Piesek Łatek kręci piruety z radości! 🐶🏆✨$/, 'Absolute mastery x$1! Patch the Dog twirls with joy! 🐶🏆✨'],
  [/^Combo x(\d+)! Twój umysł tropi wiedzę bez zawahania! 🐾⚡$/, 'Combo x$1! Your mind tracks knowledge without hesitation! 🐾⚡'],
  [/^Absolutne mistrzostwo x(\d+)! Żółwik Zenon bije brawo z zachwytu! 🐢🏆⏱️$/, 'Absolute mastery x$1! Clockwork Turtle applauds in awe! 🐢🏆⏱️'],
  [/^Combo x(\d+)! Twój zegar biologiczny wyprzedza komputery! 🐢✨$/, 'Combo x$1! Your biological clock beats computers! 🐢✨'],
  [/^Potężne combo x(\d+)! Szop kręci cylinder w piruecie! 🦝🎩✨$/, 'Mighty combo x$1! Bandit spins his top hat! 🦝🎩✨'],
  [/^Combo x(\d+)! Cała talia drży przed Twoją pamięcią! 🦝🪄$/, 'Combo x$1! The whole deck trembles before your memory! 🦝🪄'],
  [/^Cudowne combo x(\d+)! Wiewiórcza opowieść wszech czasów! 🐿️🏆🌰$/, 'Wonderful combo x$1! The greatest squirrel story ever! 🐿️🏆🌰'],
  [/^Combo x(\d+)! Twoja opowieść jest nierozerwalna! 🐿️🌰$/, 'Combo x$1! Your story is unbreakable! 🐿️🌰'],
  [/^Mega combo x(\d+)! Tytuł Wielkiego Mistrza Majora jest Twój! 🦉🏆🌟$/, 'Mega combo x$1! Grandmaster of Major title is yours! 🦉🏆🌟'],
  [/^Combo x(\d+)! Twój mózg zamienia liczby w arcydzieła! 🦉✨$/, 'Combo x$1! Your brain turns numbers into masterpieces! 🦉✨'],
  [/^Niesamowita seria x(\d+)! Ośmiornica Inka kręci piruety z zachwytu! 🐙🏆✨$/, 'Incredible streak x$1! Inky the Octopus pirouettes in delight! 🐙🏆✨'],
  [/^Combo x(\d+)! Twoje neurony rozrastają się jak rafa koralowa! 🪸⚡$/, 'Combo x$1! Your neurons branch out like coral reef! 🪸⚡'],
  [/^Niewiarygodne combo x(\d+)! Pola bije skrzydłami w piruecie! 🦜👑✨$/, 'Incredible combo x$1! Polly flutters her wings in a spin! 🦜👑✨'],
  [/^Combo x(\d+)! Twój słownik pęka w szwach! 🦜🎶$/, 'Combo x$1! Your vocabulary is bursting at the seams! 🦜🎶'],
  [/^Koniec gry! Twój wynik: (\d+) pkt! Wspaniała spostrzegawczość! 🦊$/, 'Game over! Your score: $1 pts! Outstanding observation! 🦊'],
  [/^Koniec gry! Twój wynik: (\d+) pkt! Prawdziwy władca kalendarza! 🐢$/, 'Game over! Your score: $1 pts! True ruler of the calendar! 🐢'],
  [/^Brawo! Koniec pokazu magii! Twój wynik: (\d+) pkt! 🦝$/, 'Bravo! End of magic show! Your score: $1 pts! 🦝'],
  [/^Koniec gry! Twój wynik: (\d+) pkt! Łańcuch trzymał się dzielnie! 🐿️$/, 'Game over! Your score: $1 pts! The chain held strong! 🐿️'],
  [/^Koniec sesji! Osiągnięty wynik: (\d+) pkt! Wiedza godna profesora! 🦉$/, 'Session over! Final score: $1 pts! Knowledge worthy of a professor! 🦉'],
  [/^Koniec gry! Twój wynik: (\d+) pkt! Pola jest z Ciebie dumna! 🦜$/, 'Game over! Your score: $1 pts! Polly is so proud of you! 🦜'],
  [/^Koniec szans! Prawidłowa odpowiedź to: (.*)\. Zobaczmy Twój wynik! 🐙$/, 'Out of lives! Correct answer was: $1. Let us see your score! 🐙'],
  [/^Twój wynik: (\d+) pkt$/, 'Your score: $1 pts'],
  [/^Wynik: (\d+) pkt$/, 'Score: $1 pts'],
  [/^Rekord: (\d+) pkt$/, 'Best: $1 pts'],
  [/^🏆 Twój rekord: (\d+)$/, '🏆 Your record: $1'],
  [/^🏆 Twój rekord: (\d+) pkt$/, '🏆 Your record: $1 pts'],
  [/^(.*?)Pozostało szans:\s*(\d+)\s*(🐶|🐢|🦉|🦜|🐾|🦊|🦝|🐿️)?$/, '$1Chances left: $2 $3'],
  [/^Zakrytą kartą był (.*?)! Zostały Ci (\d+) szanse\. 🦝$/, 'The hidden card was $1! You have $2 chances left. 🦝'],
  [/^Oj, pomyłka! Prawidłowa odpowiedź:\s*(.*?)\.\s*Walczymy dalej! 💡$/, 'Oops, mistake! Correct answer was: $1. Keep fighting! 💡'],
  [/^Słowo "(.*?)" to (.*?)!$/, 'Word "$1" is $2!'],
  [/^Po "(.*?)" następuje "(.*?)"!$/, 'After "$1" comes "$2"!'],
  [/^Brakującym elementem był:\s*(.*?)!$/, 'The missing element was: $1!'],
  [/^(.*?) to (.*?) \(most:\s*(.*?)\)!$/, '$1 is $2 (bridge: $3)!'],
  [/^Mostem dla (.*?) jest:\s*(.*?)!$/, 'The bridge for $1 is: $2!'],
  [/^Cyfra (\d+) to:\s*(.*?)!\s*\((.*?)\)$/, 'Digit $1 is: $2! ($3)'],
  [/^(.*?) koduje liczbę (\d+) \((.*?)\)$/, '$1 encodes number $2 ($3)'],
  [/^Dla liczby (\d+) poprawny jest (.*?) \((.*?)\)$/, 'For number $1 the correct one is $2 ($3)'],
  [/^Prawidłowy PIN to (\d+)\.$/, 'Correct PIN is $1.'],
  [/^Dla (.*?) kotwicą jest (\d+)\. dzień \((.*?)\)!$/, 'For $1 the anchor is day $2 ($3)!'],
  [/^(\d+) (.*?) (\d{4}) to (.*?)!$/, '$2 $1, $3 is $4!'],
  [/^To (.*?)! Kotwica: (.*?) ⚓ Masz jeszcze (\d+) szanse\. 🦊$/, 'That\'s $1! Anchor: $2 ⚓ You still have $3 chances left. 🦊'],
  [/^To nie ta osoba! Przypomnij sobie jej cechę 🔍 Pozostało szans: (\d+)$/, 'Not that person! Recall their unique feature 🔍 Chances left: $1'],
  [/^Podpowiedź cechy: (.*)$/, 'Feature clue: $1'],
  [/^Pozostało szans: (\d+)(.*)$/, 'Chances left: $1$2'],
  [/^Masz jeszcze (\d+) szanse(.*)$/, 'You still have $1 chances left$2'],
  [/^Zostały Ci (\d+) szanse(.*)$/, 'You have $1 chances left$2'],
  [/^Zawód: (.*)$/, 'Occupation: $1'],
  [/^Znajdź: (.*)$/, 'Find: $1'],
  [/^Komnata (\d+): (.*)$/, 'Room $1: $2'],
  [/^Poziom (\d+) w kieszeni! (.*)$/, 'Level $1 in the bag! $2'],
  [/^Poziom (\d+) zaliczony!?$/, 'Level $1 Completed!'],
  [/^Poziom (\d+) zaliczony$/, 'Level $1 Completed'],
  [/^Kolejny poziom (\d+) ▶$/, 'Next Level $1 ▶'],
  [/^Runda (\d+) \/ (\d+)$/, 'Round $1 / $2'],
  [/^Runda (\d+)$/, 'Round $1'],
  [/^Poziom (\d+)$/, 'Level $1'],
  [/^Czas: (\d+)s$/, 'Time: $1s'],
  [/^⏱ (\d+)s$/, '⏱ $1s'],
  [/^Poprawne: (\d+)$/, 'Correct: $1'],
  [/^Błędy: (\d+)$/, 'Mistakes: $1'],
  [/^Wpisz (\d+) cyfr$/, 'Enter $1 digits'],
  [/^(\d+) cyfr(a|y)? · obrazy$/, '$1 digits · images'],
  [/^(\d+) dni z rzędu$/, '$1-day streak'],
  [/^(\d+) dzień z rzędu$/, '$1-day streak'],
  [/^(\d+) gier gotowych$/, '$1 games ready'],
  [/^Miau! (\d+) dni z rzędu – świetna passa! 🔥 Zagramy\?$/, 'Meow! $1-day streak – on fire! 🔥 Shall we play?'],
  [/^Hau! Lekcja (\d+): (.*)$/, 'Woof! Lesson $1: $2'],
  [/^Plusk! Lekcja (\d+): (.*)$/, 'Splash! Lesson $1: $2'],
  [/^Uhuhu! Lekcja (\d+): (.*)$/, 'Hoot! Lesson $1: $2']
];

function translateEn(str, depth = 0) {
  if (!str || typeof str !== 'string' || depth > 4) return str;
  if (DICTIONARY_EN[str]) return DICTIONARY_EN[str];

  const trimmed = str.trim();
  const lead = str.match(/^\s*/)[0];
  const trail = str.match(/\s*$/)[0];

  if (DICTIONARY_EN[trimmed]) {
    return lead + DICTIONARY_EN[trimmed] + trail;
  }

  const normQuotes = trimmed.replace(/[„”«»]/g, '"').replace(/[’‘]/g, "'");
  if (DICTIONARY_EN[normQuotes]) {
    return lead + DICTIONARY_EN[normQuotes] + trail;
  }

  // Case-insensitive first-letter match (e.g. lowercase month names)
  if (/^[a-ząćęłńóśźż]/.test(trimmed)) {
    const cap = trimmed[0].toUpperCase() + trimmed.slice(1);
    if (DICTIONARY_EN[cap]) {
      return lead + DICTIONARY_EN[cap] + trail;
    }
  }

  // Quoted single token wrapper e.g. „Żabko”
  const quoteWrap = trimmed.match(/^[„"](.*)[”"]$/);
  if (quoteWrap) {
    const inner = translateEn(quoteWrap[1], depth + 1);
    if (inner !== quoteWrap[1]) {
      return lead + '"' + inner + '"' + trail;
    }
  }

  // Recursive regex patterns: translates captured groups automatically!
  const applyPattern = (input, re, repl) => {
    return input.replace(re, (...args) => {
      return repl.replace(/\$(\d+)/g, (_, idxStr) => {
        const val = args[Number(idxStr)];
        if (val === undefined) return '';
        if (/^\d+$/.test(val)) return val;
        return translateEn(val, depth + 1);
      });
    });
  };

  for (const [re, repl] of PATTERNS_EN) {
    if (re.test(trimmed)) {
      return lead + applyPattern(trimmed, re, repl) + trail;
    }
    if (re.test(normQuotes)) {
      return lead + applyPattern(normQuotes, re, repl) + trail;
    }
  }

  // Arrow-separated sequence fallback (e.g. Acrostic steps / Mindmap flow)
  if (trimmed.includes(' ➔ ')) {
    const parts = trimmed.split(' ➔ ');
    const mapped = parts.map(p => translateEn(p, depth + 1));
    if (mapped.some((m, i) => m !== parts[i])) {
      return lead + mapped.join(' ➔ ') + trail;
    }
  }

  // Leading emoji or bullet strip-and-preserve (e.g. "⚡ Błysk", "📚 Królewska Biblioteka")
  const emojiLead = trimmed.match(/^((?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F\u200D]+|•|·|▪|▫|▶|◀|➔|➡)\s+)(.+)$/u);
  if (emojiLead) {
    const transRest = translateEn(emojiLead[2], depth + 1);
    if (transRest !== emojiLead[2]) {
      return lead + emojiLead[1] + transRest + trail;
    }
  }

  // "PartA: PartB" pair fallback if PartA translates cleanly (e.g. "Złota Brama: Świecący Banan")
  const colonIdx = trimmed.indexOf(': ');
  if (colonIdx > 1 && colonIdx < 45) {
    const left = trimmed.slice(0, colonIdx);
    const right = trimmed.slice(colonIdx + 2);
    const tLeft = translateEn(left, depth + 1);
    const tRight = translateEn(right, depth + 1);
    if (tLeft !== left || tRight !== right) {
      return lead + tLeft + ': ' + tRight + trail;
    }
  }

  return str;
}

function t(text) {
  if (currentLang !== 'en' || typeof text !== 'string' || !text) return text;
  return translateEn(text);
}

// ─────────────────────────────────────────────────────────────────────────────
// AKTUALIZACJA STATYCZNYCH ELEMENTÓW DOM (TOPBAR, MODALE, FOOTER, META)
// ─────────────────────────────────────────────────────────────────────────────

let domCache = null;

function applyLangToDOM(lang) {
  if (typeof document === 'undefined') return;

  const titleEl = document.querySelector('title');
  const metaDesc = document.querySelector('meta[name="description"]');
  const brandEl = document.querySelector('.brand');
  const brandSpan = document.querySelector('.brand span');
  const guideBtn = document.querySelector('#guideBtn');
  const soundBtn = document.querySelector('#soundBtn');
  const installBtnSpan = document.querySelector('#installBtn span');
  const authorBtn = document.querySelector('#authorBtn');
  const authorLink = document.querySelector('#authorLink');
  const footerSpan = document.querySelector('.footer span');

  const aboutRole = document.querySelector('.about-role');
  const missionQuote = document.querySelector('.mission-quote');
  const aboutDesc = document.querySelector('.about-desc');
  const roadmapPreview = document.querySelector('.roadmap-preview');
  const aboutMuted = document.querySelector('#about .muted');
  const aboutCopy = document.querySelector('#about .muted + p');
  const aboutPrimaryBtn = document.querySelector('#about .btn-primary');

  const guideTitle = document.querySelector('#guideTitle');
  const guideScroll = document.querySelector('.guide-scroll');
  const guidePrimaryBtn = document.querySelector('#guide .btn-primary');

  const installTitle = document.querySelector('#installTitle');
  const installLead = document.querySelector('#installModal p');
  const installOptions = document.querySelector('#installModal .install-options');
  const installDirectBtn = document.querySelector('#directInstallBtn');
  const installGhostBtn = document.querySelector('#installModal .btn-ghost');
  const dialogXs = document.querySelectorAll('.dialog-x');

  // Zachowaj oryginalną wersję polską przy pierwszym uruchomieniu
  if (!domCache) {
    domCache = {
      title: titleEl?.textContent || '',
      metaDesc: metaDesc?.getAttribute('content') || '',
      brandAria: brandEl?.getAttribute('aria-label') || '',
      brand: brandSpan?.textContent || '',
      guideBtnTitle: guideBtn?.getAttribute('title') || '',
      guideBtnAria: guideBtn?.getAttribute('aria-label') || '',
      soundBtnAria: soundBtn?.getAttribute('aria-label') || '',
      installBtnText: installBtnSpan?.textContent || '',
      authorBtnTitle: authorBtn?.getAttribute('title') || '',
      authorBtnAria: authorBtn?.getAttribute('aria-label') || '',
      authorLink: authorLink?.textContent || '',
      footerSpan: footerSpan?.textContent || '',
      aboutRole: aboutRole?.textContent || '',
      missionQuote: missionQuote?.textContent || '',
      aboutDesc: aboutDesc?.textContent || '',
      roadmapPreviewHtml: roadmapPreview?.innerHTML || '',
      aboutMuted: aboutMuted?.textContent || '',
      aboutCopy: aboutCopy?.textContent || '',
      aboutPrimaryBtn: aboutPrimaryBtn?.textContent || '',
      guideTitle: guideTitle?.textContent || '',
      guideScrollHtml: guideScroll?.innerHTML || '',
      guidePrimaryBtn: guidePrimaryBtn?.textContent || '',
      installTitle: installTitle?.textContent || '',
      installLead: installLead?.textContent || '',
      installOptionsHtml: installOptions?.innerHTML || '',
      installDirectBtn: installDirectBtn?.textContent || '',
      installGhostBtn: installGhostBtn?.textContent || '',
      dialogXAria: dialogXs[0]?.getAttribute('aria-label') || 'Zamknij'
    };
  }

  if (lang === 'en') {
    if (titleEl) titleEl.textContent = 'World of Memory – Brain Games That Train Your Memory';
    if (metaDesc) metaDesc.setAttribute('content', 'Interactive mini-games that teach you the world\'s most popular memory techniques. Start with Digits and Whiskers the Cat.');
    if (brandEl) brandEl.setAttribute('aria-label', 'World of Memory – home page');
    if (brandSpan) brandSpan.textContent = 'World of Memory';
    dialogXs.forEach(x => x.setAttribute('aria-label', 'Close'));
    if (guideBtn) {
      guideBtn.setAttribute('title', 'Memory Techniques Cheat Sheet');
      guideBtn.setAttribute('aria-label', 'Memory Techniques');
    }
    if (soundBtn) soundBtn.setAttribute('aria-label', 'Sound');
    if (installBtnSpan) installBtnSpan.textContent = 'Install';
    if (authorBtn) {
      authorBtn.setAttribute('title', 'Dorian Kalinowski – Creator');
      authorBtn.setAttribute('aria-label', 'Meet the Creator – Dorian Kalinowski');
    }
    if (authorLink) authorLink.textContent = 'Created by Dorian Kalinowski';
    if (footerSpan) footerSpan.textContent = '· All rights reserved © 2026 · v1.1';

    if (aboutRole) aboutRole.textContent = 'Creator of "World of Memory" (v1.1)';
    if (missionQuote) missionQuote.textContent = '“My mission is to empower everyone to learn the most powerful memory techniques through engaging games.”';
    if (aboutDesc) aboutDesc.textContent = 'Hi! I believe no one has a "bad memory". All the techniques memory champions show off (memorizing phone numbers in 3 seconds, decks of cards, or hundreds of words) are based on simple, remarkably fun principles.';
    if (roadmapPreview) {
      roadmapPreview.innerHTML = `
        <b>10 memory systems and their animal teachers:</b>
        <ul>
          <li>🔢 <strong>Digits</strong> – Whiskers the Cat 🐱 (Number shapes and chunking)</li>
          <li>🏰 <strong>Memory Palace</strong> – Leo the Tiger 🐯 (Method of Loci & rooms of imagination)</li>
          <li>🦊 <strong>Names & Faces</strong> – Rusty the Fox 🦊 (Feature anchors and phonetic bridges)</li>
          <li>🦉 <strong>Major System</strong> – Professor Owl 🦉 (Consonants 0-9 & PIN codes)</li>
          <li>🦜 <strong>Vocabulary & Languages</strong> – Polly the Parrot 🦜 (Keyword Method)</li>
          <li>🦝 <strong>Playing Cards</strong> – Bandit the Magician 🦝 (PAO: Person - Action - Object)</li>
          <li>🐿️ <strong>Link System</strong> – Hazel the Squirrel 🐿️ (Domino effect and 20 links)</li>
          <li>🐢 <strong>Mental Calendar</strong> – Clockwork Turtle 🐢 (Doomsday algorithm & years)</li>
          <li>🐶 <strong>Acrostics & Rhymes</strong> – Patch the Dog 🐶 (First-letter hooks & verses)</li>
          <li>🐙 <strong>Mind Maps</strong> – Inky the Octopus 🐙 (Non-linear notes & branches of knowledge)</li>
        </ul>
      `;
    }
    if (aboutMuted) aboutMuted.textContent = 'Play just a few minutes every day. Your cute animal companions will cheer you on! 🐾';
    if (aboutCopy) aboutCopy.textContent = 'All rights reserved © 2026 Dorian Kalinowski · v1.1';
    if (aboutPrimaryBtn) aboutPrimaryBtn.textContent = "Let's play! 🚀";

    if (guideTitle) guideTitle.textContent = '💡 10 Memory Techniques in a Nutshell';
    if (guideScroll) {
      guideScroll.innerHTML = `
        <div class="guide-card">
          <h3>1. Digits – Number Shapes (Whiskers the Cat 🐱)</h3>
          <p>The brain thinks in pictures, not dry numbers. Turn each digit 0-9 into a recognizable object:</p>
          <div class="peg-grid">
            <div><b>0</b> <span>🥚 Egg</span></div>
            <div><b>1</b> <span>🕯️ Candle</span></div>
            <div><b>2</b> <span>🦢 Swan</span></div>
            <div><b>3</b> <span>❤️ Heart</span></div>
            <div><b>4</b> <span>⛵ Sailboat</span></div>
            <div><b>5</b> <span>🪝 Hook</span></div>
            <div><b>6</b> <span>🐌 Snail</span></div>
            <div><b>7</b> <span>🪓 Scythe</span></div>
            <div><b>8</b> <span>☃️ Snowman</span></div>
            <div><b>9</b> <span>🎈 Balloon</span></div>
          </div>
          <p class="tip">Want to remember <strong>28</strong>? Imagine a <strong>Swan</strong> (2) wrapping a scarf around a <strong>Snowman</strong> (8)!</p>
        </div>

        <div class="guide-card">
          <h3>2. Memory Palace (Method of Loci) – Leo the Tiger 🐯</h3>
          <p>The most celebrated technique of antiquity: stroll through an imagined palace and place items inside its rooms!</p>
          <div class="peg-grid" style="grid-template-columns:repeat(4,1fr)">
            <div><b>1. Gate</b> <span>🍌 Banana</span></div>
            <div><b>2. Hall</b> <span>🎩 Top Hat</span></div>
            <div><b>3. Fireplace</b> <span>🐘 Elephant</span></div>
            <div><b>4. Kitchen</b> <span>🍕 Pizza</span></div>
          </div>
          <p class="tip"><strong>Absurdity rule:</strong> The more comedic, oversized, and dynamic the mental image, the more vivid your memory!</p>
        </div>

        <div class="guide-card">
          <h3>3. Names & Faces (Rusty the Fox 🦊)</h3>
          <p>Three straightforward steps: Facial Anchor → Phonetic Bridge → Explosive Action!</p>
          <p class="panel-note">Spotting Mark with thick glasses? Visualize him taking out a bright yellow MARKER and coloring his glasses yellow!</p>
        </div>

        <div class="guide-card">
          <h3>4. Major System (Professor Owl 🦉)</h3>
          <p>The cornerstone of memory championships: translate digits 0-9 into consonants and build memorable words.</p>
          <div class="major-grid">
            <div><b>0</b><span>S, Z</span></div><div><b>1</b><span>T, D</span></div><div><b>2</b><span>N</span></div>
            <div><b>3</b><span>M</span></div><div><b>4</b><span>R</span></div><div><b>5</b><span>L</span></div>
            <div><b>6</b><span>J, SH</span></div><div><b>7</b><span>K, G</span></div><div><b>8</b><span>F, V</span></div>
            <div><b>9</b><span>P, B</span></div>
          </div>
          <p class="panel-note">Vowels (A, E, I, O, U, Y) act as glue: <strong>71</strong> = K-T = <strong>CAT</strong> 🐱, <strong>14</strong> = T-R = <strong>TRAIN</strong> 🛤️.</p>
        </div>

        <div class="guide-card">
          <h3>5. Vocabulary & Languages (Polly the Parrot 🦜)</h3>
          <p>The Keyword Method: discover an acoustic sound-alike word in your language and fuse it with the meaning.</p>
          <p class="panel-note">E.g., learning French <em>champignon</em> (mushroom)? Picture a boxing CHAMPION biting into a giant mushroom!</p>
        </div>

        <div class="guide-card">
          <h3>6. Playing Cards – PAO System (Bandit the Magician 🦝)</h3>
          <p>Each card represents a Person, an Action, and an Object. 3 cards combine into 1 vivid movie scene!</p>
          <p class="panel-note">Ace of Spades is Bandit the Magician, King of Hearts is King Arthur, Queen of Diamonds is Cleopatra.</p>
        </div>

        <div class="guide-card">
          <h3>7. Link System – Domino Effect (Hazel the Squirrel 🐿️)</h3>
          <p>Connect items in dynamic pairs through action, sound, and exaggeration. One link naturally pulls the next!</p>
          <p class="panel-note">Perfect for grocery lists, public speeches, and multi-step procedures.</p>
        </div>

        <div class="guide-card">
          <h3>8. Mental Calendar – Doomsday Algorithm (Clockwork Turtle 🐢)</h3>
          <p>Even double-month dates always land on the exact same weekday: <strong>4/4, 6/6, 8/8, 10/10, 12/12</strong>!</p>
          <p class="panel-note">For odd months: "Working 9 to 5 (9/5 & 5/9) at 7-Eleven (7/11 & 11/7)". Add modulo 7 and calculate any day in history!</p>
        </div>

        <div class="guide-card">
          <h3>9. Acrostics & Rhymes (Patch the Dog 🐶)</h3>
          <p>First letters create catchy sentences that permanently lock in orders and lists of knowledge.</p>
          <p class="panel-note">E.g., planets: <em>"My Very Educated Mother Just Served Us Noodles"</em> or Roman numerals: <em>"I Value Xylophones Like Cows Do Milk"</em> (I, V, X, L, C, D, M)!</p>
        </div>

        <div class="guide-card">
          <h3>10. Mind Maps (Inky the Octopus 🐙)</h3>
          <p>The brain thinks radiantly from the center outward. Instead of dull lines of text – a central picture and radiant colorful branches!</p>
          <p class="panel-note">The center is your core theme, and 8 tentacles are knowledge categories with 1 keyword and symbol. Indispensable for exam prep and project planning!</p>
        </div>
      `;
    }
    if (guidePrimaryBtn) guidePrimaryBtn.textContent = 'Got it! 🚀';

    if (installTitle) installTitle.textContent = '📲 Install World of Memory';
    if (installLead) installLead.textContent = 'The app runs 100% offline as a Progressive Web App (PWA) – zero ads and no app store download required!';
    if (installOptions) {
      installOptions.innerHTML = `
        <div class="install-item">
          <b>🤖 On Android (Chrome / Edge / Samsung):</b>
          <ol class="steps">
            <li>Tap the button below or open the browser menu (three dots ⋮).</li>
            <li>Choose <strong>"Install app"</strong> or "Add to Home screen".</li>
          </ol>
        </div>
        <div class="install-item">
          <b>🍏 On iPhone / iPad (Safari):</b>
          <ol class="steps">
            <li>Tap the <strong>Share</strong> button at the bottom of the screen (square with up arrow 📤).</li>
            <li>Select <strong>"Add to Home Screen"</strong>.</li>
            <li>Tap "Add" – done! 🚀</li>
          </ol>
        </div>
      `;
    }
    if (installDirectBtn) installDirectBtn.textContent = 'Install Now ⬇';
    if (installGhostBtn) installGhostBtn.textContent = 'Close';
  } else {
    // Przywróć polską wersję z cache
    if (titleEl) titleEl.textContent = domCache.title;
    if (metaDesc) metaDesc.setAttribute('content', domCache.metaDesc);
    if (brandEl) brandEl.setAttribute('aria-label', domCache.brandAria);
    if (brandSpan) brandSpan.textContent = domCache.brand;
    dialogXs.forEach(x => x.setAttribute('aria-label', domCache.dialogXAria));
    if (guideBtn) {
      guideBtn.setAttribute('title', domCache.guideBtnTitle);
      guideBtn.setAttribute('aria-label', domCache.guideBtnAria);
    }
    if (soundBtn) soundBtn.setAttribute('aria-label', domCache.soundBtnAria);
    if (installBtnSpan) installBtnSpan.textContent = domCache.installBtnText;
    if (authorBtn) {
      authorBtn.setAttribute('title', domCache.authorBtnTitle);
      authorBtn.setAttribute('aria-label', domCache.authorBtnAria);
    }
    if (authorLink) authorLink.textContent = domCache.authorLink;
    if (footerSpan) footerSpan.textContent = domCache.footerSpan;

    if (aboutRole) aboutRole.textContent = domCache.aboutRole;
    if (missionQuote) missionQuote.textContent = domCache.missionQuote;
    if (aboutDesc) aboutDesc.textContent = domCache.aboutDesc;
    if (roadmapPreview) roadmapPreview.innerHTML = domCache.roadmapPreviewHtml;
    if (aboutMuted) aboutMuted.textContent = domCache.aboutMuted;
    if (aboutCopy) aboutCopy.textContent = domCache.aboutCopy;
    if (aboutPrimaryBtn) aboutPrimaryBtn.textContent = domCache.aboutPrimaryBtn;

    if (guideTitle) guideTitle.textContent = domCache.guideTitle;
    if (guideScroll) guideScroll.innerHTML = domCache.guideScrollHtml;
    if (guidePrimaryBtn) guidePrimaryBtn.textContent = domCache.guidePrimaryBtn;

    if (installTitle) installTitle.textContent = domCache.installTitle;
    if (installLead) installLead.textContent = domCache.installLead;
    if (installOptions) installOptions.innerHTML = domCache.installOptionsHtml;
    if (installDirectBtn) installDirectBtn.textContent = domCache.installDirectBtn;
    if (installGhostBtn) installGhostBtn.textContent = domCache.installGhostBtn;
  }
}













  /* ==========================================================================
     3. SOUND (WEB AUDIO API & HARMONIC PENTATONIC TONES)
     ========================================================================== */
  let ctx;
  let audioEnabled = store.get('sound', true);

  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(f, d = .12, type = 'sine', v = .06, delay = 0, slideTo) {
    if (!audioEnabled) return;
    const c = ac();
    if (!c) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + .01);
    g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + d + .02);
  }

  const DIGIT_NOTES = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

  const sfx = {
    key(n = 1) { tone(520 + n * 18, .05, 'triangle', .05); },
    digit(d) {
      const idx = parseInt(d, 10);
      const f = isNaN(idx) ? 440 : (DIGIT_NOTES[idx % 10] || 440);
      tone(f, .14, 'triangle', .08);
    },
    tick() { tone(880, .05, 'sine', .04); },
    pop() { tone(700, .08, 'sine', .05, 0, 1000); },
    good() { [523, 659, 784].forEach((f, i) => tone(f, .18, 'triangle', .07, i * .08)); },
    win() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .22, 'triangle', .07, i * .09)); },
    bad() { tone(300, .35, 'sawtooth', .035, 0, 140); },
    meow() { tone(520, .28, 'sine', .07, 0, 900); tone(900, .25, 'sine', .05, .2, 420); },
    roar() {
      tone(260, .28, 'sawtooth', .04, 0, 190);
      tone(380, .24, 'triangle', .05, .04, 220);
      tone(520, .28, 'sine', .06, .1, 640);
    },
    sparkle() { [784, 987, 1174, 1568].forEach((f, i) => tone(f, .12, 'sine', .04, i * .05)); },
    success() { [523, 659, 784].forEach((f, i) => tone(f, .18, 'triangle', .07, i * .08)); },
    wrong() { tone(300, .35, 'sawtooth', .035, 0, 140); },
    fanfare() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .22, 'triangle', .07, i * .09)); },
    purr() { tone(700, .08, 'sine', .05, 0, 1000); }
  };

  const buzz = p => { if (audioEnabled) navigator.vibrate?.(p); };

  const sound = {
    get on() { return audioEnabled; },
    toggle() { audioEnabled = !audioEnabled; store.set('sound', audioEnabled); return audioEnabled; }
  };

  /* ==========================================================================
     4. CONFETTI FX
     ========================================================================== */
  function confetti(count = 120) {
    if (reducedMotion()) return;
    const c = document.createElement('canvas');
    const gctx = c.getContext ? c.getContext('2d') : null;
    if (!gctx) return;
    c.className = 'confetti';
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = c.width = innerWidth * dpr;
    const H = c.height = innerHeight * dpr;
    document.body.append(c);
    const colors = ['#7c5cff', '#ff6bd6', '#3ef0c0', '#ffc857', '#ffffff'];
    const ps = Array.from({ length: count }, () => ({
      x: W / 2 + (Math.random() - .5) * W * .3,
      y: H * .55,
      vx: (Math.random() - .5) * 16 * dpr,
      vy: (-Math.random() * 18 - 6) * dpr,
      s: (4 + Math.random() * 6) * dpr,
      r: Math.random() * 6.28,
      vr: (Math.random() - .5) * .4,
      c: colors[Math.floor(Math.random() * colors.length)]
    }));
    const t0 = performance.now();
    (function frame(t) {
      const k = (t - t0) / 2400;
      gctx.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.vy += .45 * dpr; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vx *= .99;
        gctx.save();
        gctx.globalAlpha = Math.max(0, 1 - k);
        gctx.translate(p.x, p.y); gctx.rotate(p.r);
        gctx.fillStyle = p.c;
        gctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6);
        gctx.restore();
      }
      if (k < 1) requestAnimationFrame(frame); else c.remove();
    })(t0);
  }

  /* ==========================================================================
     5. KOT MRUCZEK (MASCOT)
     ========================================================================== */
  const CAT_SVG = `
  <svg class="cat" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
    <ellipse cx="100" cy="222" rx="56" ry="6" fill="#000" opacity=".25"/>
    <g class="all">
      <g class="tail"><path d="M140 190 C 196 196, 202 128, 172 108" stroke="#f59a3c" stroke-width="17" fill="none" stroke-linecap="round"/><path d="M172 108 C 168 102, 166 100, 164 98" stroke="#fff3e0" stroke-width="17" fill="none" stroke-linecap="round"/></g>
      <g class="body">
        <ellipse cx="100" cy="170" rx="52" ry="48" fill="#ffb35c"/>
        <ellipse cx="100" cy="180" rx="30" ry="34" fill="#ffe9cc"/>
      </g>
      <path class="arm arm-l" d="M62 152 q-14 22 -6 44" stroke="#ffb35c" stroke-width="17" stroke-linecap="round" fill="none"/>
      <path class="arm arm-r" d="M138 152 q14 22 6 44" stroke="#ffb35c" stroke-width="17" stroke-linecap="round" fill="none"/>
      <ellipse cx="80" cy="214" rx="17" ry="9" fill="#ffb35c"/><ellipse cx="120" cy="214" rx="17" ry="9" fill="#ffb35c"/>
      <g class="head">
        <g class="ear ear-l"><path d="M48 76 L52 22 L96 54 Z" fill="#ffb35c"/><path d="M58 64 L60 38 L82 54 Z" fill="#ff9db0"/></g>
        <g class="ear ear-r"><path d="M152 76 L148 22 L104 54 Z" fill="#ffb35c"/><path d="M142 64 L140 38 L118 54 Z" fill="#ff9db0"/></g>
        <ellipse cx="100" cy="92" rx="60" ry="52" fill="#ffb35c"/>
        <path d="M100 42 v14 M86 45 l3 12 M114 45 l-3 12" stroke="#f08a2c" stroke-width="5" stroke-linecap="round"/>
        <circle cx="64" cy="106" r="9" fill="#ff708f" opacity=".6"/><circle cx="136" cy="106" r="9" fill="#ff708f" opacity=".6"/>
        <ellipse cx="94" cy="110" rx="8" ry="5" fill="#fff8ef" opacity=".7"/><ellipse cx="106" cy="110" rx="8" ry="5" fill="#fff8ef" opacity=".7"/>
        <g class="eyes">
          <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b2140"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
          <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b2140"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
        </g>
        <g class="eyes-closed" fill="none" stroke="#2b2140" stroke-width="5" stroke-linecap="round"><path d="M64 94 Q76 78 88 94"/><path d="M112 94 Q124 78 136 94"/></g>
        <path d="M94 104 h12 l-6 7 z" fill="#ff6f8c"/>
        <path class="mouth m-smile" d="M100 111 q-8 11 -17 4 M100 111 q8 11 17 4" stroke="#2b2140" stroke-width="3.4" fill="none" stroke-linecap="round"/>
        <path class="mouth m-open" d="M86 114 q14 22 28 0 z" fill="#2b2140"/>
        <path class="mouth m-sad" d="M86 123 q14 -13 28 0" stroke="#2b2140" stroke-width="3.4" fill="none" stroke-linecap="round"/>
        <path class="tear" d="M62 106 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
        <g stroke="#2b2140" stroke-width="2" stroke-linecap="round" opacity=".55"><path d="M52 108 l-24 -5 M52 114 l-24 5 M148 108 l24 -5 M148 114 l24 5"/></g>
      </g>
    </g>
  </svg>`;

  const POKE = [
    'Miau! Łaskoczesz mnie! 😸',
    'Mrrrau! Kręcę się z radości! 🐾',
    'Hej! Wracamy do ćwiczeń? Razem pobijemy rekord! ✨',
    'Wiesz, że koty śpią 16 godzin? Ty ćwicz pamięć!',
    'Mruuu… ale fajnie! Twój mózg jest niesamowity! 🧠',
    'Głaszcz, głaszcz! Każde głaskanie to +10 do koncentracji! 🐱'
  ];

  function createCat({ size = 'md', pokeLines = POKE } = {}) {
    const figure = h('button', { class: 'cat-figure', type: 'button', 'aria-label': 'Kot Mruczek – kliknij, żeby pogłaskać', html: CAT_SVG });
    const svg = figure.querySelector('svg');
    const text = h('span', { class: 'bubble-text' });
    const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
    const bubble = h('div', { class: 'bubble' }, text, live);
    const el = h('div', { class: `cat-wrap cat-${size}` }, figure, bubble);

    let typeId = 0, revertT, wasConnected = false, born = Date.now(), dead = false;

    function setMood(m, revertMs = 0) {
      svg.dataset.mood = m;
      clearTimeout(revertT);
      if (revertMs) revertT = setTimeout(() => { svg.dataset.mood = 'happy'; }, revertMs);
    }

    async function say(msg, mood = 'happy', { revert = 0, speed = 14 } = {}) {
      const id = ++typeId;
      setMood(mood, revert);
      bubble.classList.add('show');
      const finalMsg = typeof t === "function" ? t(msg) : msg;
    live.textContent = finalMsg;
    text.textContent = "";
    for (let i = 1; i <= finalMsg.length; i++) {
        if (id !== typeId) return;
        text.textContent = finalMsg.slice(0, i);
        await sleep(speed);
      }
    }

    function flash(cls, ms) {
      svg.classList.add(cls);
      setTimeout(() => svg.classList.remove(cls), ms);
    }

    function spin() {
      figure.classList.remove('spin'); void figure.offsetWidth;
      figure.classList.add('spin');
      sfx.meow();
    }

    figure.addEventListener('click', () => {
      spin();
      say(rand(pokeLines), 'cheer', { revert: 1800 });
    });

    function onMove(e) {
      if (!el.isConnected) return;
      const r = svg.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height * .4);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 220);
      svg.style.setProperty('--px', (dx / d * k * 4).toFixed(2));
      svg.style.setProperty('--py', (dy / d * k * 4).toFixed(2));
    }
    addEventListener('pointermove', onMove, { passive: true });

    (async function idle() {
      while (!dead) {
        await sleep(4500 + Math.random() * 4500);
        if (el.isConnected) wasConnected = true;
        else if (wasConnected || Date.now() - born > 30000) break;
        else continue;
        flash(rand(['ear-twitch', 'tail-fast', 'hop']), 900);
      }
      removeEventListener('pointermove', onMove);
    })();

    return {
      el, say, setMood, spin,
      wave(ms = 1800) { flash('wave', ms); },
      hop() { flash('hop', 700); },
      hide() { bubble.classList.remove('show'); typeId++; },
      set pokeLines(l) { pokeLines = l; },
      destroy() { dead = true; typeId++; removeEventListener('pointermove', onMove); }
    };
  }

  /* ==========================================================================
     5B. TYGRYSEK LEON (MASCOT FOR PALACE)
     ========================================================================== */
  const TIGER_SVG = `
  <svg class="tiger" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
    <ellipse cx="100" cy="222" rx="56" ry="6" fill="#000" opacity=".25"/>
    <g class="all">
      <g class="tail">
        <path d="M140 190 C 196 196, 202 128, 172 108" stroke="#ff8a2b" stroke-width="18" fill="none" stroke-linecap="round"/>
        <path d="M152 191 l2 -10" stroke="#281a17" stroke-width="5" stroke-linecap="round"/>
        <path d="M172 178 l-5 -10" stroke="#281a17" stroke-width="5" stroke-linecap="round"/>
        <path d="M184 152 l-11 -4" stroke="#281a17" stroke-width="5" stroke-linecap="round"/>
        <path d="M180 126 l-11 4" stroke="#281a17" stroke-width="5" stroke-linecap="round"/>
        <path d="M172 108 C 168 102, 166 100, 164 98" stroke="#fff5ea" stroke-width="18" fill="none" stroke-linecap="round"/>
      </g>
      <g class="body">
        <ellipse cx="100" cy="170" rx="54" ry="48" fill="#ff8a2b"/>
        <ellipse cx="100" cy="180" rx="32" ry="34" fill="#fff5ea"/>
        <path d="M52 156 l14 4 M48 172 l18 2 M52 188 l14 -2" stroke="#281a17" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M148 156 l-14 4 M152 172 l-18 2 M148 188 l-14 -2" stroke="#281a17" stroke-width="4.5" stroke-linecap="round"/>
      </g>
      <path class="arm arm-l" d="M62 152 q-14 22 -6 44" stroke="#ff8a2b" stroke-width="17" stroke-linecap="round" fill="none"/>
      <path class="arm arm-r" d="M138 152 q14 22 6 44" stroke="#ff8a2b" stroke-width="17" stroke-linecap="round" fill="none"/>
      <ellipse cx="78" cy="214" rx="18" ry="9" fill="#ff8a2b"/>
      <ellipse cx="122" cy="214" rx="18" ry="9" fill="#ff8a2b"/>
      <ellipse cx="78" cy="213" rx="10" ry="5" fill="#fff5ea"/>
      <ellipse cx="122" cy="213" rx="10" ry="5" fill="#fff5ea"/>
      <g class="head">
        <g class="ear ear-l">
          <path d="M46 72 C 34 32, 74 24, 88 52 Z" fill="#ff8a2b"/>
          <path d="M54 62 C 48 38, 70 34, 78 50 Z" fill="#ff9db0"/>
          <path d="M48 42 C 54 36, 64 34, 70 36" stroke="#281a17" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        </g>
        <g class="ear ear-r">
          <path d="M154 72 C 166 32, 126 24, 112 52 Z" fill="#ff8a2b"/>
          <path d="M146 62 C 152 38, 130 34, 122 50 Z" fill="#ff9db0"/>
          <path d="M152 42 C 146 36, 136 34, 130 36" stroke="#281a17" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        </g>
        <ellipse cx="100" cy="92" rx="62" ry="52" fill="#ff8a2b"/>
        <path d="M40 92 l-8 8 l8 4 l-6 8 l10 0" fill="#ff8a2b"/>
        <path d="M160 92 l8 8 l-8 4 l6 8 l-10 0" fill="#ff8a2b"/>
        <!-- Paski na czole -->
        <path d="M100 42 v18" stroke="#281a17" stroke-width="5" stroke-linecap="round"/>
        <path d="M88 47 h24" stroke="#281a17" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M92 56 h16" stroke="#281a17" stroke-width="4" stroke-linecap="round"/>
        <path d="M74 54 l10 8" stroke="#281a17" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M126 54 l-10 8" stroke="#281a17" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Paski na policzkach -->
        <path d="M48 84 l14 4 M46 94 l16 2" stroke="#281a17" stroke-width="4" stroke-linecap="round"/>
        <path d="M152 84 l-14 4 M154 94 l-16 2" stroke="#281a17" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="100" cy="112" rx="34" ry="22" fill="#fff5ea"/>
        <circle cx="66" cy="108" r="9" fill="#ff708f" opacity=".6"/>
        <circle cx="134" cy="108" r="9" fill="#ff708f" opacity=".6"/>
        <g class="eyes">
          <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#281a17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
          <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#281a17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
        </g>
        <g class="eyes-closed" fill="none" stroke="#281a17" stroke-width="5" stroke-linecap="round">
          <path d="M64 94 Q76 78 88 94"/>
          <path d="M112 94 Q124 78 136 94"/>
        </g>
        <path d="M92 104 h16 l-8 8 z" fill="#ff6f8c"/>
        <g stroke="#281a17" stroke-width="2.2" stroke-linecap="round" opacity=".6">
          <path d="M62 108 l-26 -3 M62 114 l-28 4 M62 120 l-24 10"/>
          <path d="M138 108 l26 -3 M138 114 l28 4 M138 120 l24 10"/>
        </g>
        <path class="mouth m-smile" d="M100 112 q-9 10 -18 3 M100 112 q9 10 18 3" stroke="#281a17" stroke-width="3.4" fill="none" stroke-linecap="round"/>
        <g class="mouth m-open">
          <path d="M84 114 q16 26 32 0 z" fill="#281a17"/>
          <path d="M89 114 l3 6 l3 -6 M105 114 l3 6 l3 -6" fill="#fff"/>
          <ellipse cx="100" cy="132" rx="8" ry="4" fill="#ff6f8c"/>
        </g>
        <path class="mouth m-sad" d="M86 123 q14 -13 28 0" stroke="#281a17" stroke-width="3.4" fill="none" stroke-linecap="round"/>
        <path class="tear" d="M62 106 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
      </g>
    </g>
  </svg>`;

  const TIGER_POKE = [
    'Rawrr! Jestem Leon – Twój przewodnik po Pałacu Pamięci! 🐯',
    'Wiesz, że starożytni mówcy pamiętali wielogodzinne mowy dzięki loci?',
    'Im bardziej absurdalny i żywy obraz stworzysz, tym trwalej go zapamiętasz! ⚡',
    'Grr! Zobacz, jak macham ogonem – zwiedźmy kolejną komnatę! 🏰',
    'Twój mózg to zamek z nieograniczoną liczbą pokoi. Wykorzystaj go! ✨',
    'Tygrysia pamięć nigdy nie zawodzi! Leon trzyma za Ciebie kciuki! 🐾'
  ];

  function createTiger({ size = 'md', pokeLines = TIGER_POKE } = {}) {
    const figure = h('button', {
      class: 'tiger-figure',
      type: 'button',
      'aria-label': 'Tygrysek Leon – kliknij, żeby pogłaskać',
      html: TIGER_SVG
    });
    const svg = figure.querySelector('svg');
    const text = h('span', { class: 'bubble-text' });
    const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
    const bubble = h('div', { class: 'bubble' }, text, live);
    const el = h('div', { class: `tiger-wrap tiger-${size}` }, figure, bubble);

    let typeId = 0, revertT, dead = false, wasConnected = false, born = Date.now();

    function setMood(m, revertMs = 0) {
      svg.dataset.mood = m;
      clearTimeout(revertT);
      if (revertMs) revertT = setTimeout(() => { svg.dataset.mood = 'happy'; }, revertMs);
    }

    async function say(msg, mood = 'happy', { revert = 0, speed = 14 } = {}) {
      const id = ++typeId;
      setMood(mood, revert);
      bubble.classList.add('show');
      const finalMsg = typeof t === "function" ? t(msg) : msg;
    live.textContent = finalMsg;
    text.textContent = "";
    for (let i = 1; i <= finalMsg.length; i++) {
        if (id !== typeId) return;
        text.textContent = finalMsg.slice(0, i);
        await sleep(speed);
      }
    }

    function flash(cls, ms) {
      svg.classList.add(cls);
      setTimeout(() => svg.classList.remove(cls), ms);
    }

    function spin() {
      figure.classList.remove('spin'); void figure.offsetWidth;
      figure.classList.add('spin');
      sfx.roar?.();
    }

    function roar() {
      setMood('roar', 1500);
      figure.classList.remove('hop'); void figure.offsetWidth;
      figure.classList.add('hop');
      sfx.roar?.();
    }

    figure.addEventListener('click', () => {
      spin();
      say(rand(pokeLines), 'cheer', { revert: 2000 });
    });

    function onMove(e) {
      if (!el.isConnected) return;
      const r = svg.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height * .4);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 220);
      svg.style.setProperty('--px', (dx / d * k * 4).toFixed(2));
      svg.style.setProperty('--py', (dy / d * k * 4).toFixed(2));
    }
    addEventListener('pointermove', onMove, { passive: true });

    (async function idle() {
      while (!dead) {
        await sleep(4500 + Math.random() * 4500);
        if (el.isConnected) wasConnected = true;
        else if (wasConnected || Date.now() - born > 30000) break;
        else continue;
        const pick = rand(['ear-twitch', 'tail-fast', 'hop']);
        flash(pick, 900);
      }
      removeEventListener('pointermove', onMove);
    })();

    return {
      el, svg, say, setMood, spin, roar,
      wave(ms = 1800) { flash('wave', ms); },
      hop() { flash('hop', 700); },
      hide() { bubble.classList.remove('show'); typeId++; },
      destroy() { dead = true; typeId++; clearTimeout(revertT); removeEventListener('pointermove', onMove); }
    };
  }

  /* ==========================================================================
     6. DIGITS GAME UTILITIES
     ========================================================================== */
  function splitGroups(str, group = 0) {
    if (!group) return [str];
    const out = [];
    let i = 0;
    if (Array.isArray(group)) {
      for (const g of group) { if (i >= str.length) break; out.push(str.slice(i, i + g)); i += g; }
      if (i < str.length) out.push(str.slice(i));
      return out;
    }
    for (; i < str.length; i += group) out.push(str.slice(i, i + group));
    return out;
  }

  function smartGroups(len, size = 3) {
    if (len <= size + 1) return [len];
    const groups = Array(Math.floor(len / size)).fill(size);
    const r = len % size;
    if (r === 1) groups[groups.length - 1] += 1; else if (r > 1) groups.push(r);
    return groups;
  }

  function randomDigits(n) {
    let s = '';
    for (let i = 0; i < n; i++) {
      let d;
      do { d = Math.floor(Math.random() * 10); }
      while (s.length >= 2 && s.at(-1) === String(d) && s.at(-2) === String(d));
      s += d;
    }
    return s;
  }

  const reverse = s => [...s].reverse().join('');

  function compareView(expected, value, group = 0) {
    const row = (label, str, mark) => h('div', { class: 'cmp-row' },
      h('span', { class: 'cmp-label' }, label),
      h('div', { class: 'cmp-digits' }, splitGroups(str, group).map((g, gi) => {
        const offset = splitGroups(str, group).slice(0, gi).join('').length;
        return h('span', { class: 'cmp-group' }, [...g].map((d, i) => {
          const ok = expected[offset + i] === d;
          return h('span', { class: mark ? (ok ? 'ok' : 'bad') : 'plain' }, d);
        }));
      })));
    return h('div', { class: 'compare' }, row('Poprawnie', expected, false), row('Ty', value, true));
  }

  const starsEl = (n, total = 3) =>
    h('div', { class: 'stars', 'aria-label': `${n} z ${total} gwiazdek` },
      Array.from({ length: total }, (_, i) => h('span', { class: i < n ? 'on' : '', style: `--i:${i}` }, '★')));

  /* ==========================================================================
     7. DIGITS PRESENTATION & SHAPE PEGS
     ========================================================================== */
  const SHAPE_PEGS = {
    '0': { emoji: '🥚', name: 'Jajko' },
    '1': { emoji: '🕯️', name: 'Świeca' },
    '2': { emoji: '🦢', name: 'Łabędź' },
    '3': { emoji: '❤️', name: 'Serce' },
    '4': { emoji: '⛵', name: 'Żaglówka' },
    '5': { emoji: '🪝', name: 'Hak' },
    '6': { emoji: '🐌', name: 'Ślimak' },
    '7': { emoji: '🪓', name: 'Kosa' },
    '8': { emoji: '☃️', name: 'Bałwan' },
    '9': { emoji: '🎈', name: 'Balon' }
  };

  const VOWELS = 'aeiouyąęóAEIOUYĄĘÓ';

  function present(host, { digits, mode = 'all', group = 0, time = 4000, interval = 700, cards = null, showShapes = false, signal, label } = {}) {
    return new Promise(resolve => {
      const timers = new Set();
      let finished = false;
      const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
      const end = why => { if (finished) return; finished = true; timers.forEach(clearTimeout); resolve(why); };
      signal?.addEventListener('abort', () => end('abort'), { once: true });

      const wrap = h('div', { class: 'present' });
      host.replaceChildren(wrap);
      if (label) wrap.append(h('div', { class: 'present-label' }, label));

      if (mode === 'seq') {
        const big = h('div', { class: 'seq-digit', 'aria-hidden': 'true' });
        const shapeHint = h('div', { class: 'seq-shape', 'aria-hidden': 'true' });
        const dots = h('div', { class: 'seq-dots' }, [...digits].map(() => h('i')));
        wrap.append(big, showShapes ? shapeHint : null, dots, h('div', { class: 'sr-only', 'aria-live': 'polite' }, `Cyfry: ${[...digits].join(', ')}`));
        let step = 0, c = 0;
        const pop = () => { big.classList.remove('pop'); void big.offsetWidth; big.classList.add('pop'); };
        const showNext = () => {
          if (step >= digits.length) return later(() => end('done'), 300);
          big.className = 'seq-digit';
          const d = digits[step];
          big.textContent = d;
          if (showShapes && SHAPE_PEGS[d]) {
            shapeHint.textContent = `${SHAPE_PEGS[d].emoji} ${typeof t === "function" ? t(SHAPE_PEGS[d].name) : SHAPE_PEGS[d].name}`;
          }
          pop();
          dots.children[step].classList.add('on');
          sfx.digit(d);
          step++;
          later(() => {
            big.textContent = '';
            if (showShapes) shapeHint.textContent = '';
            later(showNext, 130);
          }, interval - 130);
        };
        const countdown = () => {
          if (c < 3) {
            big.className = 'seq-digit count';
            big.textContent = 3 - c;
            pop(); sfx.tick(); c++;
            later(countdown, 520);
          } else { big.textContent = ''; later(showNext, 220); }
        };
        countdown();
        return;
      }

      let n = 0;
      const body = cards
        ? h('div', { class: 'cards' }, cards.map((c, i) =>
            h('div', { class: 'mcard', style: `--i:${i}` },
              h('div', { class: 'mcard-num' }, c.d),
              h('div', { class: 'mcard-emoji' }, c.emoji),
              h('div', { class: 'mcard-word' }, [...(typeof t === "function" ? t(c.word) : c.word)].map(ch => h('span', { class: VOWELS.includes(ch) ? 'v' : 'c' }, ch))))))
        : h('div', { class: `digit-groups${showShapes ? ' with-shapes' : ''}`, 'aria-label': [...digits].join(' ') },
            splitGroups(digits, group).map(g =>
              h('div', { class: 'digit-group' }, [...g].map(d => {
                const peg = showShapes && SHAPE_PEGS[d];
                return h('div', { class: 'digit-box', style: `--i:${n++}` },
                  h('span', { class: 'digit' }, d),
                  peg ? h('span', { class: 'digit-peg', title: peg.name }, peg.emoji) : null
                );
              }))));

      const bar = h('i');
      wrap.append(
        body,
        h('div', { class: 'timebar', role: 'presentation' }, bar),
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => end('skip') }, 'Już pamiętam ✓')
      );
      requestAnimationFrame(() => requestAnimationFrame(() => {
        bar.style.transition = `transform ${time}ms linear`;
        bar.style.transform = 'scaleX(0)';
      }));
      later(() => end('time'), time);
    });
  }

  /* ==========================================================================
     8. DIGITS RECALL & KEYPAD
     ========================================================================== */
  function createRecall({ length, group = 0, onSubmit }) {
    let value = '', locked = false, destroyed = false;

    const slots = [];
    const slotsEl = h('div', { class: 'slots', role: 'group', 'aria-label': `Wpisz ${length} cyfr` },
      splitGroups('x'.repeat(length), group).map(g =>
        h('div', { class: 'slot-group' }, [...g].map(() => { const s = h('span', { class: 'slot' }); slots.push(s); return s; }))));

    const ok = h('button', { class: 'key key-ok', type: 'button', 'aria-label': 'Sprawdź', disabled: true, onclick: send }, '✓');
    const back = h('button', { class: 'key key-fn', type: 'button', 'aria-label': 'Usuń ostatnią cyfrę', onclick: del }, '⌫');
    const digitKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d =>
      h('button', { class: 'key', type: 'button', onclick: () => add(String(d)) }, d));
    const pad = h('div', { class: 'keypad' }, ...digitKeys.slice(0, 9), back, digitKeys[9], ok);
    const el = h('div', { class: 'recall' }, slotsEl, pad);

    function render() {
      slots.forEach((s, i) => {
        const c = value[i];
        s.textContent = c ?? '';
        s.classList.toggle('filled', c != null);
        s.classList.toggle('cur', !locked && i === value.length);
      });
      ok.disabled = locked || value.length !== length;
    }
    function add(d) {
      if (locked || value.length >= length) return;
      value += d; sfx.digit(d); buzz(8); render();
      slots[value.length - 1]?.animate?.([{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 160 });
    }
    function del() { if (locked || !value) return; value = value.slice(0, -1); render(); }
    function send() { if (locked || value.length !== length) return; locked = true; render(); onSubmit(value); }

    function onKey(e) {
      if (destroyed || !el.isConnected || locked || e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.querySelector('dialog[open]')) return;
      if (/^[0-9]$/.test(e.key)) { add(e.key); e.preventDefault(); }
      else if (e.key === 'Backspace') { del(); e.preventDefault(); }
      else if (e.key === 'Enter') { send(); e.preventDefault(); }
    }
    addEventListener('keydown', onKey);
    render();

    return {
      el,
      get value() { return value; },
      get typed() { return value.length; },
      lock() { locked = true; render(); },
      reveal(n, expected) {
        slots.slice(0, n).forEach((s, i) => { s.dataset.ghost = expected[i]; s.classList.add('ghost'); });
      },
      mark(expected) {
        locked = true; render();
        slots.forEach((s, i) => { s.classList.remove('cur'); s.classList.add(expected[i] === value[i] ? 'ok' : 'bad'); });
      },
      shake() { slotsEl.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(0)' }], { duration: 320 }); },
      destroy() { destroyed = true; removeEventListener('keydown', onKey); }
    };
  }

  /* ==========================================================================
     9. LESSONS & CHAPTERS
     ========================================================================== */
  const CHAPTERS = [
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

  const LESSONS = [
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

  const PRAISE_PERFECT = [
    'Mrrr! Perfekcyjnie! Bez żadnej podpowiedzi! 🌟', 'Mistrz pamięci! Aż mi się ogon zakręcił! 🏆', 'Idealnie! Twój mózg to superkomputer!'
  ];
  const PRAISE_OK = [
    'Miau! Dobra robota, tak trzymaj! 😸', 'Brawo! Pamięć rośnie w siłę! 💪', 'Tak jest! Jedziemy dalej!'
  ];
  const ENCOURAGE = [
    'Prawie! Pamięć to mięsień – trenuj, a urośnie 💪', 'Nic nie szkodzi! Spróbujmy jeszcze raz, tym razem spokojniej.', 'Miau… tym razem się nie udało. Ale Ty dasz radę! 🐾'
  ];
  const NUDGES = [
    'Hej, tu Mruczek! Potrzebujesz podpowiedzi? Przycisk 💡 czeka!', 'Nie spiesz się… ale mruczę z niecierpliwości 😸', 'Spróbuj odtworzyć cyfry „w głowie”, jakbyś je słyszał.'
  ];

  /* ==========================================================================
     10. MODES (FREE PLAY)
     ========================================================================== */
  const MODES = [
    {
      id: 'classic', name: 'Klasyk', emoji: '🧠', color: ['#7c5cff', '#a678ff'],
      desc: 'Wszystkie cyfry naraz. Czysta pamięć – czas skraca się z poziomem.',
      reverse: false,
      round: (level, len) => ({ mode: 'all', time: len * Math.max(520, 900 - level * 22) + 900 })
    },
    {
      id: 'flash', name: 'Błysk', emoji: '⚡', color: ['#ffc857', '#ff8a5c'],
      desc: 'Cyfry mrugają po jednej. Nie zdążysz drugi raz – skup się!',
      reverse: false,
      round: level => ({ mode: 'seq', interval: Math.max(380, 820 - level * 20) })
    },
    {
      id: 'reverse', name: 'Odwrotnie', emoji: '🔄', color: ['#3ef0c0', '#4aa8ff'],
      desc: 'Zapamiętaj, a potem wpisz od końca. Mózg na wysokich obrotach.',
      reverse: true,
      round: (level, len) => ({ mode: 'all', time: len * Math.max(560, 950 - level * 22) + 1000 })
    },
    {
      id: 'groups', name: 'Paczki', emoji: '📱', color: ['#ff6bd6', '#ff8a5c'],
      desc: 'Cyfry w grupkach jak numer telefonu – ćwiczysz technikę grupowania.',
      reverse: false,
      round: (level, len) => ({ mode: 'all', group: smartGroups(len, 3), time: len * Math.max(480, 820 - level * 20) + 800 })
    },
    {
      id: 'melody', name: 'Melodia', emoji: '🎵', color: ['#12b5a0', '#3ef0c0'],
      desc: 'Każda cyfra to unikalny ton muzyczny. Zapamiętujesz rytm i melodię!',
      reverse: false,
      round: level => ({ mode: 'seq', interval: Math.max(420, 800 - level * 18) })
    },
    {
      id: 'shapes', name: 'Kształty', emoji: '🎨', color: ['#ff9966', '#ff5e62'],
      desc: 'Cyfry z podpowiedziami kształtów (np. 🦢, ☃️). Twórz w głowie szalone historie!',
      reverse: false,
      round: (level, len) => ({ mode: 'all', showShapes: true, time: len * Math.max(600, 1000 - level * 20) + 1200 })
    }
  ];

  const getMode = id => MODES.find(m => m.id === id);

  /* ==========================================================================
     11. TRAINING SCREEN (MAP & STEP)
     ========================================================================== */
  const progress = () => store.get('digits.train', {});

  function mountMap(root) {
    const cat = createCat({ size: 'sm' });
    const prog = progress();
    const firstOpen = LESSONS.findIndex(l => !prog[l.id]);
    const done = LESSONS.filter(l => prog[l.id]).length;

    const chapters = CHAPTERS.map((ch, ci) =>
      h('div', { class: 'chapter' },
        h('h3', {}, h('span', {}, ch.emoji), ' ', ch.title, h('small', {}, ch.desc)),
        LESSONS.map((l, i) => ({ l, i })).filter(x => x.l.ch === ci).map(({ l, i }) => {
          const stars = prog[l.id] || 0;
          const locked = firstOpen !== -1 && i > firstOpen;
          const state = stars ? 'done' : locked ? 'locked' : 'current';
          return h(locked ? 'div' : 'a', {
            class: `lesson ${state}`, href: locked ? null : `#/digits/train/${i + 1}`,
            'aria-disabled': locked ? 'true' : null
          },
            h('span', { class: 'ln' }, locked ? '🔒' : stars ? '✓' : i + 1),
            h('span', { class: 'lt' }, h('b', {}, l.title), h('small', {}, `${l.digits.length} cyfr${l.cards ? ' · obrazy' : l.showShapes ? ' · kształty' : ''}`)),
            starsEl(stars));
        })));

    const whyCard = h('div', { class: 'why-card' },
      h('span', { class: 'why-icon' }, '🎯'),
      h('div', { class: 'why-content' },
        h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
        h('p', {}, 'Kody BLIK na zakupach (zanim znikną z ekranu!), PIN-y do kart, kody do domofonów i numery telefonów bliskich w nagłych wypadkach – zapamiętasz je w 3 sekundy bez panicznego szukania komórki!')
      )
    );

    root.append(h('section', { class: 'screen' },
      h('div', { class: 'crumbs' }, h('a', { href: '#/digits', class: 'back' }, '← Cyfry')),
      h('div', { class: 'game-head' }, h('h1', {}, 'Mapa ', h('span', { class: 'grad' }, 'szkolenia'))),
      cat.el,
      whyCard,
      h('div', { class: 'bar-progress', style: `--p:${done / LESSONS.length * 100}%` }, h('i')),
      ...chapters));
    setTimeout(() => cat.say(done === LESSONS.length ? 'Wszystko zaliczone! Możesz wracać do dowolnej lekcji, żeby zdobyć brakujące gwiazdki ⭐' : done ? 'Wybierz lekcję. Świecąca czeka na Ciebie! ✨' : 'Zaczynamy od pierwszej lekcji. Kliknij ją! 🐾', 'happy'), 250);
    return () => cat.destroy();
  }

  function mountStep(root, { index, nav }) {
    const lesson = LESSONS[index];
    if (!lesson) { nav('digits/train'); return () => {}; }

    const ctrl = new AbortController();
    const { signal } = ctrl;
    const cat = createCat({ size: 'sm' });
    const panel = h('div', { class: 'panel', html: lesson.panel || '' });
    const stage = h('div', { class: 'stage' });
    const controls = h('div', { class: 'controls' });
    let recall = null;
    let penalties = 0, hintLevel = 0, replayed = false;

    const dots = h('div', { class: 'step-dots' }, LESSONS.map((_, i) => h('i', { class: i < index ? 'done' : i === index ? 'now' : '' })));
    root.append(h('section', { class: 'screen step' },
      h('div', { class: 'crumbs' }, h('a', { href: '#/digits/train', class: 'back' }, '← Mapa'), h('span', { class: 'crumb-title' }, `Lekcja ${index + 1}/${LESSONS.length}: ${lesson.title}`)),
      dots, cat.el, lesson.panel ? panel : null, stage, controls));

    const button = (label, cls, onclick) => h('button', { class: `btn ${cls}`, type: 'button', onclick }, label);
    const waitClick = (label, cls = 'btn-primary') => new Promise(res => {
      controls.replaceChildren(button(label, cls, () => { controls.replaceChildren(); res(); }));
    });

    async function run() {
      stage.replaceChildren(h('div', { class: 'intro-art' }, h('span', {}, lesson.cards ? '🖼️' : lesson.showShapes ? '🦢' : lesson.group ? '✂️' : '🔢')));
      for (let i = 0; i < lesson.intro.length; i++) {
        if (i === 0) cat.wave();
        await cat.say(lesson.intro[i], i === lesson.intro.length - 1 ? 'think' : 'happy');
        await waitClick(i < lesson.intro.length - 1 ? 'Dalej' : 'Zaczynamy! ▶');
        if (signal.aborted) return;
      }

      for (;;) {
        cat.say(hintLevel || replayed ? 'Patrz uważnie jeszcze raz! 👀' : 'Patrz uważnie! 👀 Pasek pokazuje, ile masz czasu.', 'think');
        controls.replaceChildren();
        await present(stage, { digits: lesson.digits, group: lesson.group, time: lesson.time, cards: lesson.cards, showShapes: lesson.showShapes, signal });
        if (signal.aborted) return;
        await sleep(200, signal);

        let result = await recallPhase();
        if (signal.aborted) return;
        if (result === 'replay') { penalties++; replayed = true; continue; }

        recall.mark(lesson.digits);
        recall.el.classList.add('finished');
        recall.destroy();
        controls.replaceChildren();
        if (result === lesson.digits) {
          const stars = Math.max(1, 3 - penalties);
          store.update('digits.train', t => ({ ...(t || {}), [lesson.id]: Math.max((t && t[lesson.id]) || 0, stars) }), {});
          sfx.good(); buzz([30, 40, 30]);
          const last = index === LESSONS.length - 1;
          confetti(last ? 260 : 90);
          if (last) sfx.win();
          stage.append(starsEl(stars));
          cat.spin();
          await cat.say(last ? 'WSZYSTKIE LEKCJE ZALICZONE! 🏆 Jesteś mistrzem cyfr! Czas na grę swobodną!' : stars === 3 ? rand(PRAISE_PERFECT) : rand(PRAISE_OK), 'cheer');
          controls.replaceChildren(
            last ? button('Do gry swobodnej 🚀', 'btn-primary', () => nav('digits')) : button('Następna lekcja ▶', 'btn-primary', () => nav(`digits/train/${index + 2}`)),
            button('Mapa', 'btn-ghost', () => nav('digits/train')),
            button('Jeszcze raz', 'btn-ghost', () => nav(`digits/train/${index + 1}`)));
          return;
        }
        penalties++;
        sfx.bad(); buzz(120);
        stage.append(compareView(lesson.digits, result, lesson.group));
        cat.say(rand(ENCOURAGE), 'sad');
        await waitClick('Spróbuj jeszcze raz ↻');
        if (signal.aborted) return;
      }
    }

    function recallPhase() {
      return new Promise(resolve => {
        let nudge = null;
        recall = createRecall({ length: lesson.digits.length, group: lesson.group, onSubmit: v => { if (nudge) clearInterval(nudge); resolve(v); } });
        const label = h('div', { class: 'present-label' }, 'Wpisz z pamięci');
        stage.replaceChildren(label, recall.el);
        cat.say('Teraz Twoja kolej! Wpisz cyfry z pamięci. 🧠', 'think');

        const hintBtn = button('💡 Podpowiedź', 'btn-ghost', () => {
          const text = lesson.hints[Math.min(hintLevel, lesson.hints.length - 1)];
          if (hintLevel === 0) penalties++;
          hintLevel++;
          recall.reveal(Math.min(lesson.digits.length, hintLevel * (hintLevel > 1 ? 2 : 1)), lesson.digits);
          cat.say(text, 'think'); cat.hop(); sfx.pop();
          hintBtn.classList.add('used');
        });
        const replayBtn = button('👁 Pokaż jeszcze raz', 'btn-ghost', () => { recall.destroy(); if (nudge) clearInterval(nudge); resolve('replay'); });
        if (replayed) replayBtn.disabled = true;
        controls.replaceChildren(hintBtn, replayBtn);

        let lastTyped = 0, idle = 0;
        nudge = setInterval(() => {
          if (signal.aborted) { if (nudge) clearInterval(nudge); return; }
          if (recall.typed !== lastTyped) { lastTyped = recall.typed; idle = 0; return; }
          if (++idle >= 3) { idle = 0; cat.say(rand(NUDGES), 'think'); cat.hop(); }
        }, 4000);
        signal.addEventListener('abort', () => { if (nudge) clearInterval(nudge); recall.destroy(); }, { once: true });
      });
    }

    run().catch(console.error);
    return () => { ctrl.abort(); cat.destroy(); recall?.destroy(); };
  }

  /* ==========================================================================
     12. FREE PLAY (ENDLESS SURVIVAL)
     ========================================================================== */
  const MILESTONES = {
    3: 'Rozgrzewka za nami! Teraz robi się ciekawie 😼',
    5: 'Pięć cyfr! Większość ludzi odpada właśnie tutaj.',
    7: 'Siedem cyfr – magiczna liczba pamięci! ✨',
    9: 'Dziewięć cyfr = cały numer telefonu! 📱',
    10: 'DZIESIĘĆ! Mruczek jest pod wrażeniem 🙀',
    12: 'Dwanaście cyfr?! Jesteś mistrzem! 🏆',
    15: 'Piętnaście! To poziom zawodów pamięciowych 🤯'
  };
  const CHEERS = [
    'Tak! Kotek mruczy z zachwytu! 😸✨',
    'Mrrr, bezbłędnie w punkt! 🐾',
    'Kocia precyzja! Pamięć jak u rysia! 🐈💨',
    'Pazurki w górę! Fenomenalnie! 😻⭐',
    'Bez pudła! Cyfry wchodzą gładko! 🎯',
    'Miau! Kolejny poziom zdobyty! 🌟🚀',
    'Czysty geniusz! Mruczek bije brawo! 👏😸'
  ];

  function mountFree(root, { modeId, nav }) {
    const mode = getMode(modeId);
    if (!mode) { nav('digits'); return () => {}; }

    const ctrl = new AbortController();
    const { signal } = ctrl;
    const cat = createCat({ size: 'sm' });
    const bestKey = `digits.best.${mode.id}`;
    let best = store.get(bestKey, 0);
    let level = 1, shield = 0, recall = null, startBest = best;

    const levelEl = h('b', {}, '1');
    const shieldEl = h('span', { class: 'hud-shield', title: 'Tarcza chroni przed jedną pomyłką' }, '🛡️');
    const bestEl = h('b', {}, best || '–');
    const hud = h('div', { class: 'hud' },
      h('div', {}, h('small', {}, 'Poziom'), levelEl),
      h('div', { class: 'hud-mid' }, shieldEl),
      h('div', {}, h('small', {}, 'Rekord'), bestEl));
    const stage = h('div', { class: 'stage' });
    const controls = h('div', { class: 'controls' });

    root.append(h('section', { class: 'screen step' },
      h('div', { class: 'crumbs' }, h('a', { href: '#/digits', class: 'back' }, '← Cyfry'), h('span', { class: 'crumb-title' }, `${mode.emoji} ${mode.name}`)),
      hud, cat.el, stage, controls));

    const paintHud = () => {
      levelEl.textContent = level;
      shieldEl.classList.toggle('on', shield > 0);
      shieldEl.hidden = false;
      bestEl.textContent = best || '–';
    };
    const button = (label, cls, onclick) => h('button', { class: `btn ${cls}`, type: 'button', onclick }, label);

    function ask(expected, group) {
      return new Promise(resolve => {
        recall = createRecall({ length: expected.length, group, onSubmit: resolve });
        stage.replaceChildren(
          h('div', { class: 'present-label' }, mode.reverse ? 'Wpisz od KOŃCA 🔄' : 'Wpisz z pamięci'),
          recall.el);
        signal.addEventListener('abort', () => recall.destroy(), { once: true });
      });
    }

    async function play() {
      level = 1; shield = 0; startBest = best; paintHud();
      controls.replaceChildren();
      store.update('digits.plays', n => n + 1, 0);
      await cat.say(mode.reverse ? 'Odwrotnie! Zapamiętaj, a potem wpisz od końca. 🔄' : mode.id === 'flash' ? 'Błysk! Cyfry pojawią się po jednej – nie mrugaj! ⚡' : mode.id === 'melody' ? 'Słuchaj uważnie! Każda cyfra gra swoją nutę 🎵' : mode.id === 'shapes' ? 'Kojarz cyfry z obrazami! Zobacz kształty 🦢⛵' : 'Do pierwszej pomyłki! Powodzenia! 🐾', 'happy');

      while (!signal.aborted) {
        const len = level + 2;
        const cfg = mode.round(level, len);
        const digits = randomDigits(len);
        const expected = mode.reverse ? reverse(digits) : digits;

        stage.replaceChildren(h('div', { class: 'banner' }, h('small', {}, `Poziom ${level}`), h('b', {}, `${len} cyfr`)));
        paintHud();
        if (!(await sleep(850, signal))) return;

        cat.say(MILESTONES[len] && level > 1 ? MILESTONES[len] : '👀', 'think', { speed: 8 });
        await present(stage, { digits, signal, ...cfg });
        if (signal.aborted) return;
        await sleep(180, signal);

        cat.say(mode.reverse ? 'Od końca! 🔄' : 'Teraz Ty! 🧠', 'think', { speed: 8 });
        const answer = await ask(expected, mode.reverse ? 0 : cfg.group);
        if (signal.aborted) return;
        recall.mark(expected);
        recall.el.classList.add('finished');
        recall.destroy();

        if (answer === expected) {
          sfx.good(); buzz(25);
          best = Math.max(best, len); store.set(bestKey, best);
          if (level % 5 === 0 && shield < 1) {
            shield = 1;
            cat.spin();
            confetti(70);
            cat.say('Zdobyłeś 🛡️ tarczę! Mruczek kręci piruet z radości!', 'cheer', { revert: 2200 });
          } else {
            cat.hop();
            cat.say(rand(CHEERS), 'cheer', { revert: 1200 });
          }
          level++;
          if (!(await sleep(1250, signal))) return;
          continue;
        }

        sfx.bad(); buzz(120);
        if (shield > 0) {
          shield = 0; paintHud();
          stage.append(compareView(expected, answer, mode.reverse ? 0 : cfg.group));
          cat.say('Ojej! Ale 🛡️ tarcza Cię uratowała! Próbujemy jeszcze raz ten poziom.', 'sad');
          if (!(await sleep(2800, signal))) return;
          continue;
        }
        return gameOver(expected, answer, cfg.group, len);
      }
    }

    function gameOver(expected, answer, group, len) {
      const reached = Math.max(0, len - 1);
      const record = reached > 0 && reached > startBest;
      if (record) { confetti(200); sfx.win(); }
      const text = reached === 0 ? 'Rozgrzewka się nie udała… ale to tylko trening! 🐾'
        : record ? `NOWY REKORD: ${reached} cyfr! 🏆🎉` : reached >= 9 ? 'Imponujące! Prawie jak mistrz pamięci! 🌟' : 'Dobra próba! Każdy rekord zaczyna się od porażki 💪';
      cat.say(text, record ? 'cheer' : 'sad');
      stage.replaceChildren(
        h('div', { class: 'gameover' },
          h('small', {}, 'Koniec gry'),
          h('div', { class: 'go-score' }, h('b', {}, reached), h('span', {}, reached === 1 ? 'cyfra' : 'cyfr')),
          h('div', { class: 'go-best' }, record ? '🏆 Nowy rekord!' : `Rekord: ${best || 0}`),
          compareView(expected, answer, mode.reverse ? 0 : group)));
      controls.replaceChildren(
        button('Jeszcze raz ↻', 'btn-primary', () => { paintHud(); play(); }),
        h('a', { class: 'btn btn-ghost', href: '#/digits' }, 'Inny tryb'));
    }

    play().catch(console.error);
    return () => { ctrl.abort(); cat.destroy(); recall?.destroy(); };
  }

  /* ==========================================================================
     13. DIGITS GAME ROOT
     ========================================================================== */
  function mountMenu(root, { nav }) {
    const cat = createCat({ size: 'md' });
    const prog = store.get('digits.train', {});
    const done = LESSONS.filter(l => prog[l.id]).length;
    const stars = Object.values(prog).reduce((a, b) => a + b, 0);
    const pct = Math.round(done / LESSONS.length * 100);
    const next = LESSONS.findIndex(l => !prog[l.id]);

    const trainCard = h('a', { class: 'big-card train-card', href: next === -1 ? '#/digits/train' : `#/digits/train/${next + 1}` },
      h('div', { class: 'bc-top' },
        h('div', {},
          h('span', { class: 'bc-kicker' }, '🎓 Szkolenie z kotem'),
          h('h3', {}, done === 0 ? 'Zacznij naukę' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
          h('p', {}, `${LESSONS.length} lekcji · od 1 do 12 cyfr · podpowiedzi Mruczka`)),
        h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))),
      h('div', { class: 'bc-foot' }, h('span', {}, `⭐ ${stars}/${LESSONS.length * 3}`), h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶'))
    );
    const mapLink = h('a', { class: 'link center', href: '#/digits/train' }, 'Zobacz mapę lekcji →');

    const modeCards = MODES.map(m => {
      const best = store.get(`digits.best.${m.id}`, 0);
      return h('a', { class: 'mode-card', href: `#/digits/free/${m.id}`, style: `--c1:${m.color[0]};--c2:${m.color[1]}` },
        h('div', { class: 'mc-emoji' }, m.emoji),
        h('div', { class: 'mc-body' }, h('h3', {}, m.name), h('p', {}, m.desc)),
        h('div', { class: 'mc-best' }, h('b', {}, best || '–'), h('span', {}, best ? 'rekord' : 'brak')));
    });

    const view = h('section', { class: 'screen' },
      h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
      h('div', { class: 'game-head' },
        h('div', {}, h('h1', {}, '🔢 ', h('span', { class: 'grad' }, 'Cyfry')), h('p', { class: 'lead' }, 'Naucz się zapamiętywać liczby – krok po kroku.')),
      ),
      cat.el,
      h('h2', { class: 'section-title' }, 'Szkolenie'),
      trainCard, mapLink,
      h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, 'do pierwszej pomyłki')),
      h('div', { class: 'mode-list' }, modeCards)
    );
    root.append(view);

    const greet = done === 0
      ? 'Miau! Jestem Mruczek 🐾 Zacznij od szkolenia – nauczę Cię sztuczek, a potem sprawdź się w grze swobodnej!'
      : done < LESSONS.length
        ? `Wróciłeś! Masz za sobą ${done} z ${LESSONS.length} lekcji. Kontynuujemy? 😸`
        : 'Ukończyłeś szkolenie! 🏆 Czas pobić rekordy w grze swobodnej!';
    setTimeout(() => { cat.wave(); cat.say(greet, 'happy'); }, 300);
    return () => cat.destroy();
  }

  const digitsGame = {
    mount(root, ctx) {
      const [a, b] = ctx.params;
      if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
      if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
      return mountMenu(root, ctx);
    }
  };

  /* ==========================================================================
     13B. PAŁAC PAMIĘCI (MEMORY PALACE MODULE)
     ========================================================================== */
  const PALACE_ROOMS = [
    { id: 'gate', name: 'Złota Brama', emoji: '🚪', desc: 'Wielka kuta brama ze złotymi lwami przy wejściu do pałacu.', color: ['#f6d365', '#fda085'] },
    { id: 'hall', name: 'Marmurowy Hol', emoji: '🏛️', desc: 'Lśniąca posadzka w szachownicę i olbrzymi kryształowy żyrandol.', color: ['#a18cd1', '#fbc2eb'] },
    { id: 'fireplace', name: 'Sala Kominkowa', emoji: '🔥', desc: 'Trzaskające płomienie w wielkim kamiennym kominku i miękki dywan.', color: ['#ff9a9e', '#fecfef'] },
    { id: 'library', name: 'Królewska Biblioteka', emoji: '📚', desc: 'Wysokie dębowe regały z drabinami, pachnące starym pergaminem.', color: ['#4facfe', '#00f2fe'] },
    { id: 'wintergarden', name: 'Ogród Zimowy', emoji: '🌿', desc: 'Szklana kopuła, egzotyczne palmy, kwitnące orchidee i śpiew kanarka.', color: ['#43e97b', '#38f9d7'] },
    { id: 'mirrors', name: 'Gabinet Luster', emoji: '🪞', desc: 'Dziesiątki ozdobnych luster odbijających światło setek świec.', color: ['#fa709a', '#fee140'] },
    { id: 'kitchen', name: 'Zamkowa Kuchnia', emoji: '🍳', desc: 'Wielki piec chlebowy, miedziane patelnie i zapach świeżych wypieków.', color: ['#f6d365', '#fda085'] },
    { id: 'treasury', name: 'Skarbiec', emoji: '💎', desc: 'Ciężkie okute skrzynie ze złotem, rubinami i drogocennymi pucharami.', color: ['#a8edea', '#fed6e3'] },
    { id: 'tower', name: 'Wieża Astronomiczna', emoji: '🔭', desc: 'Potężny mosiężny teleskop i mapa gwiazd na sklepieniu wieży.', color: ['#667eea', '#764ba2'] },
    { id: 'balcony', name: 'Balkon Widokowy', emoji: '🌅', desc: 'Kamienna balustrada z widokiem na góry o zachodzie słońca.', color: ['#ff0844', '#ffb199'] },
    { id: 'armory', name: 'Zbrojownia', emoji: '🛡️', desc: 'Błyszczące zbroje rycerskie, herby rodowe i skrzyżowane miecze.', color: ['#6a11cb', '#2575fc'] },
    { id: 'alchemy', name: 'Pracownia Alchemika', emoji: '🧪', desc: 'Bulgoczące retorty z neonowymi miksturami i kłęby fioletowego dymu.', color: ['#b3ffab', '#12fff7'] },
    { id: 'ballroom', name: 'Sala Balowa', emoji: '🎭', desc: 'Błyszczący parkiet, złocone sztukaterie i lewitujące maski weneckie.', color: ['#f093fb', '#f5576c'] },
    { id: 'grotto', name: 'Kryształowa Grota', emoji: '💧', desc: 'Podziemna jaskinia z turkusowym źródełkiem i świecącymi minerałami.', color: ['#30cfd0', '#330867'] },
    { id: 'pantry', name: 'Spiżarnia Cukiernika', emoji: '🧁', desc: 'Półki pełne słoików z miodem, piramid z makaroników i fontanna kakao.', color: ['#ffecd2', '#fcb69f'] },
    { id: 'roof', name: 'Dach Pałacu', emoji: '🏰', desc: 'Wietrzny szczyt z powiewającymi sztandarami i widokiem na całe królestwo.', color: ['#48c6ef', '#6f86d6'] }
  ];

  const PALACE_ITEMS = [
    { id: 'banana', name: 'Świecący Banan', emoji: '🍌', action: 'wisi i świeci jaskrawym neonowym światłem', hint: 'Coś żółtego i owocowego, co emituje neonowe światło!' },
    { id: 'hat', name: 'Kapelusz Magika', emoji: '🎩', action: 'lewituje i wyskakują z niego kolorowe gołębie', hint: 'Czarne nakrycie głowy iluzjonisty z gołębiami!' },
    { id: 'elephant', name: 'Słoń na Wrotkach', emoji: '🐘', action: 'robi piruety w różowych wrotkach', hint: 'Olbrzymie szare zwierzę w różowych wrotkach!' },
    { id: 'pizza', name: 'Płonąca Pizza', emoji: '🍕', action: 'kręci się w powietrzu jak ogniste frisbee', hint: 'Włoski przysmak kręcący się w płomieniach!' },
    { id: 'guitar', name: 'Gitara Elektryczna', emoji: '🎸', action: 'sama gra głośne rockowe solo', hint: 'Instrument rockowy robiący mnóstwo hałasu!' },
    { id: 'rocket', name: 'Rakieta Kosmiczna', emoji: '🚀', action: 'startuje z hukiem, zostawiając obłok dymu', hint: 'Pojazd kosmiczny buchający białym dymem!' },
    { id: 'crown', name: 'Korona Królewska', emoji: '👑', action: 'lśni złotem i jest wysadzana rubinami', hint: 'Złoty symbol władcy ze świecącymi klejnotami!' },
    { id: 'frog', name: 'Żaba w Okularach', emoji: '🐸', action: 'czyta gazetę i głośno rechocze', hint: 'Zielony płaz w okularach czytający wiadomości!' },
    { id: 'diamond', name: 'Błękitny Diament', emoji: '💎', action: 'strzela promieniami błękitnego lasera', hint: 'Twardy, niebieski kryształ świecący laserem!' },
    { id: 'avocado', name: 'Rapujące Awokado', emoji: '🥑', action: 'trzyma mikrofon i rymuje w rytm hip-hopu', hint: 'Zielony owoc z wielką pestką, który nawija rymy!' },
    { id: 'milk', name: 'Mleczny Gejzer', emoji: '🥛', action: 'bucha strumieniem spienionego mleka aż po sufit', hint: 'Biały napój wytryskujący w górę!' },
    { id: 'baguette', name: 'Ogromna Bagietka', emoji: '🥖', action: 'służy jako szpada i głośno chrupie', hint: 'Długie francuskie pieczywo z chrupiącą skórką!' },
    { id: 'cheese', name: 'Ser na Sprężynach', emoji: '🧀', action: 'skacze po meblach i pachnie serem gouda', hint: 'Żółty przysmak z dziurami skaczący jak piłka!' },
    { id: 'apple', name: 'Złote Jabłko', emoji: '🍎', action: 'podskakuje i śpiewa operowym głosem', hint: 'Owoc znany z mitologii, który ma operowy głos!' },
    { id: 'unicorn', name: 'Jednorożec', emoji: '🦄', action: 'pije herbatkę z porcelanowej filiżanki', hint: 'Magiczny koń z rogiem popijający herbatę!' },
    { id: 'balloon', name: 'Kosmiczny Balon', emoji: '🎈', action: 'pulsuje wszystkimi kolorami tęczy', hint: 'Lekki nadmuchiwany przedmiot prosto z kosmosu!' },
    { id: 'sushi', name: 'Lewitujące Sushi', emoji: '🍣', action: 'pływa w powietrzu jak mała rybka', hint: 'Japońska przekąska z łososiem latająca w powietrzu!' },
    { id: 'bicycle', name: 'Cytrynowy Rower', emoji: '🚲', action: 'jeździ sam na kołach z plastrów cytryny', hint: 'Pojazd dwukołowy z kołami z kwaśnych cytrusów!' },
    { id: 'drum', name: 'Złoty Bębenek', emoji: '🥁', action: 'sam wybija żywiołowy rytm karnawału', hint: 'Instrument perkusyjny grający sambę!' },
    { id: 'flamingo', name: 'Różowy Flaming', emoji: '🦩', action: 'stoi na jednej nodze w wielkich kaloszach', hint: 'Długonogi różowy ptak w żółtych kaloszach!' },
    { id: 'icecream', name: 'Góra Lodowa z Wanilii', emoji: '🍦', action: 'nigdy się nie topi i pachnie wanilią', hint: 'Zimny letni deser wielkości małej góry!' },
    { id: 'duck', name: 'Kaczuszka Wikinga', emoji: '🦆', action: 'nosi rogaty hełm i macha miniaturowym toporkiem', hint: 'Żółta gumowa kaczka gotowa do morskiej wyprawy!' },
    { id: 'cactus', name: 'Tańczący Kaktus', emoji: '🌵', action: 'wije się w tańcu z marakasami w dłoniach', hint: 'Pustynna roślina z kolcami grająca na marakasach!' },
    { id: 'clock', name: 'Tykanie z Kukułką', emoji: '⏰', action: 'budzik dzwoni i wyrzuca małą złotą kukułkę', hint: 'Głośne urządzenie odmierzające czas o poranku!' }
  ];

  function getPalaceRoomById(id) {
    return PALACE_ROOMS.find(r => r.id === id) || PALACE_ROOMS[0];
  }

  function getPalaceItemById(id) {
    return PALACE_ITEMS.find(i => i.id === id) || PALACE_ITEMS[0];
  }

  const PALACE_LESSONS = [
    {
      id: 1, title: 'Pierwsze dwa kroki', kicker: 'Lekcja 1 · Czym jest Pałac Pamięci?',
      desc: 'Odkryj tajemnicę starożytnych oratorów. Twój mózg myśli przestrzenią, a nie suchymi słowami!',
      intro: [
        'Rawrr! Cześć! Jestem Tygrysek Leon 🐯 i zabiorę Cię do Twojego własnego Pałacu Pamięci.',
        'Po co Ci ta technika? Dzięki niej wygłosisz prezentację w szkole lub w pracy bez żadnej ściągawki, zapamiętasz wierszyk, trudne fakty na klasówkę z historii albo całą listę zadań na dany dzień!',
        'Czy wiesz, że Twój mózg pamięta drogę do domu nawet po latach, ale zapomina listę zakupów w 5 minut? Mamy w głowie genialny GPS!',
        'Metoda Loci polega na tym, że zamiast nudnego wkuwania, wchodzimy do wyobrażonego pałacu i zostawiamy w pokojach śmieszne przedmioty.',
        'Zacznijmy powoli od zaledwie 2 komnat: Złotej Bramy i Marmurowego Holu. Zobacz, jakie to proste i przyjemne!'
      ],
      loci: [
        { roomId: 'gate', itemId: 'banana', story: 'Na szczycie Złotej Bramy wisi olbrzymi Świecący Banan 🍌. Jest tak jasny, że oślepia strażników!', hint: 'Spójrz w górę bramy – co tam świeci żółtym blaskiem?' },
        { roomId: 'hall', itemId: 'hat', story: 'Wchodzisz do Holu, a tam na środku lewituje czarny Kapelusz Magika 🎩, z którego bez przerwy wylatują białe gołębie!', hint: 'Co krąży w powietrzu nad marmurową posadzką?' }
      ],
      review: 'Zapamiętałeś: Złota Brama ➡️ Świecący Banan, Marmurowy Hol ➡️ Kapelusz Magika.',
      tigerCongrats: 'Genialnie! Właśnie przeszedłeś przez swoje pierwsze 2 loci w Pałacu Pamięci! 🏆'
    },
    {
      id: 2, title: 'Moc Absurdu i Ruchu', kicker: 'Lekcja 2 · 3 komnaty',
      desc: 'Nasz mózg błyskawicznie zapomina nudne rzeczy, ale uwielbia humor, ruch i komizm.',
      intro: [
        'Wspaniale Ci poszło! Czas na najważniejszą zasadę zapamiętywania: ZASADĘ ABSURDU ⚡',
        'Gdybyś wyobraził sobie zwykły ołówek leżący na stole – zapomnisz go za godzinę. Ale gdy ten ołówek skacze na jednej nodze i krzyczy – zostanie w głowie na zawsze!',
        'Im obraz jest bardziej komiczny, przerysowany i dynamiczny, tym mocniej angażuje neurony.',
        'Odwiedzimy 3 komnaty: Salę Kominkową, Kuchnię i Spiżarnię. Wyobrażaj sobie te sceny bardzo wyraźnie!'
      ],
      loci: [
        { roomId: 'fireplace', itemId: 'elephant', story: 'W Sali Kominkowej na wielkiej kanapie Słoń na Różowych Wrotkach 🐘 kręci piruety i gasi kominek lemoniadą!', hint: 'Kto robił piruety na kanapie przy kominku?' },
        { roomId: 'kitchen', itemId: 'pizza', story: 'W Kuchni z pieca wylatuje Płonąca Pizza 🍕 i wiruje w powietrzu jak ogniste UFO!', hint: 'Jaka gorąca włoska potrawa fruwa po kuchni?' },
        { roomId: 'pantry', itemId: 'guitar', story: 'W Spiżarni na półce z dżemami stoi Gitara Elektryczna 🎸 i sama rzęzi głośne rockowe solo!', hint: 'Jaki instrument hałasuje między słoikami w spiżarni?' }
      ],
      review: 'Kominek ➡️ Słoń na wrotkach, Kuchnia ➡️ Płonąca pizza, Spiżarnia ➡️ Gitara rockowa.',
      tigerCongrats: 'Brawo! Zasada absurdu działa cuda – widzisz te obrazy jak na filmie! 🎬'
    },
    {
      id: 3, title: 'Zawsze Ta Sama Ścieżka', kicker: 'Lekcja 3 · 4 komnaty',
      desc: 'W Pałacu Pamięci kluczowy jest stały kierunek. Zawsze poruszaj się w tę samą stronę!',
      intro: [
        'Rozwijasz skrzydła! Dziś poznasz ZASADĘ ŚCIEŻKI 🧭',
        'Wyobraź sobie, że wchodzisz do pokoju. Zawsze omiataj go wzrokiem w stałym porządku – na przykład zgodnie z ruchem wskazówek zegara: od lewej do prawej.',
        'Dzięki temu nigdy nie pominiesz żadnego przedmiotu ani nie pomylisz ich kolejności.',
        'Przejdźmy trasę przez 4 kolejne komnaty pałacu: Bibliotekę, Ogród Zimowy, Gabinet Luster i Balkon.'
      ],
      loci: [
        { roomId: 'library', itemId: 'rocket', story: 'W Bibliotece między starymi książkami startuje mała Rakieta Kosmiczna 🚀, zostawiając chmurę białego dymu!', hint: 'Co wystrzeliło z hukiem z regału z książkami?' },
        { roomId: 'wintergarden', itemId: 'frog', story: 'W Ogrodzie Zimowym na liściu wielkiej palmy siedzi Żaba w Okularach 🐸 i z powagą czyta poranne wiadomości!', hint: 'Kto czyta gazetę w egzotycznym ogrodzie?' },
        { roomId: 'mirrors', itemId: 'diamond', story: 'W Gabinecie Luster na postumencie leży wielki Błękitny Diament 💎 i strzela laserami we wszystkie lustra naraz!', hint: 'Jaki drogocenny niebieski kamień odbija się w lustrach?' },
        { roomId: 'balcony', itemId: 'balloon', story: 'Wychodzisz na Balkon Widokowy, a nad nim unosi się gigantyczny Tęczowy Balon 🎈 oświetlony zachodem słońca!', hint: 'Co szybuje w powietrzu nad pałacowym balkonem?' }
      ],
      review: 'Biblioteka ➡️ Rakieta, Ogród ➡️ Żaba w okularach, Lustra ➡️ Diament, Balkon ➡️ Balon.',
      tigerCongrats: 'Świetnie zachowana kolejność! Zbudowałeś solidną 4-punktową ścieżkę pamięciową! 🌟'
    },
    {
      id: 4, title: 'Lista Zakupów bez Kartki', kicker: 'Lekcja 4 · 5 komnat w praktyce',
      desc: 'Czas na praktyczny życiowy test! Zapamiętasz 5 produktów ze sklepu bez zapisywania.',
      intro: [
        'Czy zdarzyło Ci się pójść do sklepu, zapomnieć kartki i wrócić bez połowy zakupów? Od dziś to przeszłość! 🛒',
        'Teraz wykorzystamy Pałac Pamięci do czegoś w 100% praktycznego: 5-elementowej listy zakupów.',
        'Nasze produkty to: Awokado, Mleko, Bagietka, Żółty Ser i Soczyste Jabłka.',
        'Umieścimy je w 5 komnatach, wplatając w każdą z nich zabawną akcję. Chodźmy!'
      ],
      loci: [
        { roomId: 'gate', itemId: 'avocado', story: 'Przy Złotej Bramie stoi Rapujące Awokado 🥑 z mikrofonem i wielkim złotym łańcuchem na szyi!', hint: 'Jaki zielony owoc rymuje przy bramie wejściowej?' },
        { roomId: 'hall', itemId: 'milk', story: 'W Marmurowym Holu nagle wybucha fontanna – to Mleczny Gejzer 🥛 chlapiący na kryształowy żyrandol!', hint: 'Jaki biały napój tryska w holu jak gejzer?' },
        { roomId: 'fireplace', itemId: 'baguette', story: 'W Sali Kominkowej zamiast polan drewna w kominku leży ogromna chrupiąca Bagietka 🥖 i pachnie świeżym chlebem!', hint: 'Jakie francuskie pieczywo grzeje się w kominku?' },
        { roomId: 'kitchen', itemId: 'cheese', story: 'W Kuchni wielki kawałek Żółtego Sera 🧀 na sprężynach skacze po miedzianych patelniach!', hint: 'Co żółtego i dziurawego skacze po kuchennym blacie?' },
        { roomId: 'treasury', itemId: 'apple', story: 'W Skarbcu w otwartej skrzyni ze złotem leży Złote Jabłko 🍎 i śpiewa czystym operowym głosem!', hint: 'Jaki owoc śpiewa w skarbcu pełnym kosztowności?' }
      ],
      review: 'Brama ➡️ Awokado, Hol ➡️ Mleko, Kominek ➡️ Bagietka, Kuchnia ➡️ Ser, Skarbiec ➡️ Jabłko.',
      tigerCongrats: 'Zakupy zrobione bez ani jednej notatki! Widzisz, jakie to praktyczne? 🛍️'
    },
    {
      id: 5, title: 'Zaangażuj Wszystkie Zmysły', kicker: 'Lekcja 5 · 6 komnat',
      desc: 'Najpotężniejsza pamięć to ta, która czuje zapach, słyszy dźwięk i dotyka faktury.',
      intro: [
        'Wiesz, dlaczego zapach ciasta u babci przypomina Ci dzieciństwo w ułamku sekundy? Węch i słuch to autostrady do pamięci emocjonalnej! 👃👂',
        'W tej lekcji dodamy do każdego obrazu bodziec zmysłowy: chłód lodu, zapach wanilii, dźwięk dzwonków czy ciężar złota.',
        'Odwiedzimy 6 komnat Pałacu Pamięci. Zamykaj na chwilę oczy i naprawdę POCZUJ każdy przedmiot!'
      ],
      loci: [
        { roomId: 'gate', itemId: 'crown', story: 'Złota Brama zwieńczona jest ciężką Koroną Królewską 👑. Poczuj chłód metalu i dotknij ostrych rubinów!', hint: 'Co ciężkiego, lśniącego i królewskiego spoczywa na bramie?' },
        { roomId: 'hall', itemId: 'bicycle', story: 'Przez Hol pędzi Cytrynowy Rower 🚲 na kołach z cytryn. Poczuj intensywny, kwaskowaty zapach owoców i usłysz terkot łańcucha!', hint: 'Jaki cytrusowy pojazd pachnie świeżą cytryną?' },
        { roomId: 'library', itemId: 'drum', story: 'W Bibliotece Złoty Bębenek 🥁 sam dudni energetycznym rytmem. Poczuj wibracje w podłodze i powietrzu!', hint: 'Jaki instrument wibruje i dudni między książkami?' },
        { roomId: 'wintergarden', itemId: 'flamingo', story: 'W Ogrodzie Zimowym stoi Różowy Flaming 🦩 w wielkich żółtych kaloszach i pluszcze w fontannie!', hint: 'Jaki różowy ptak stoi w wodzie w kaloszach?' },
        { roomId: 'mirrors', itemId: 'icecream', story: 'W Gabinecie Luster stoi Góra Lodowa z Wanilii 🍦. Poczuj lodowaty powiew i słodki aromat wanilii!', hint: 'Jaki olbrzymi, mroźny deser chłodzi salę luster?' },
        { roomId: 'tower', itemId: 'clock', story: 'W Wieży Astronomicznej bije stary zegar z Tykaniem i Kukułką ⏰. Słyszysz głośne: TIK-TAK, TIK-TAK i kukanie ptaszka!', hint: 'Jakie urządzenie głośno tyka i kuka na wieży?' }
      ],
      review: 'Brama ➡️ Korona, Hol ➡️ Rower, Biblioteka ➡️ Bębenek, Ogród ➡️ Flaming, Lustra ➡️ Lody, Wieża ➡️ Zegar.',
      tigerCongrats: 'Prawdziwy multisensoryczny majstersztyk! Twój pałac tętni dźwiękami i zapachami! 🎨'
    },
    {
      id: 6, title: 'Sztuka Przemawiania (7 punktów)', kicker: 'Lekcja 6 · 7 komnat jak Cyceron',
      desc: 'Opanuj metodę rzymskich mówców. Wygłoś 7-punktowe wystąpienie bez ani jednej kartki w dłoni.',
      intro: [
        'W starożytnym Rzymie Cyceron wygłaszał wielogodzinne mowy przed senatem bez żadnych notatek. Jak to robił? 🏛️',
        'Przed przemową spacerował po swoim pałacu, umieszczając kluczowe argumenty w kolejnych pokojach. Gdy mówił, po prostu szedł tą ścieżką w myślach!',
        'Teraz zrobimy to samo dla 7-punktowej mowy. 7 komnat, 7 wyrazistych kotwic.',
        'Skup się i idź spokojnie krok za krokiem. Jestem z Ciebie dumny!'
      ],
      loci: [
        { roomId: 'gate', itemId: 'hat', story: 'Punkt 1 (Wstęp): Przy Złotej Bramie kłania się Kapelusz Magika 🎩 – symbol zaskakującego początku wystąpienia!', hint: 'Co symbolizuje magiczny wstęp przy bramie?' },
        { roomId: 'hall', itemId: 'rocket', story: 'Punkt 2 (Wielka Wizja): W Holu startuje Rakieta 🚀 ku niebu – pokazujesz słuchaczom ambitny cel!', hint: 'Jaki kosmiczny obiekt wyznacza wielki cel w holu?' },
        { roomId: 'fireplace', itemId: 'pizza', story: 'Punkt 3 (Problem/Płomień): W Sali Kominkowej płonie Pizza 🍕 – mówisz o palącym problemie do rozwiązania!', hint: 'Jaka ognista potrawa symbolizuje problem w kominku?' },
        { roomId: 'library', itemId: 'frog', story: 'Punkt 4 (Dane i Fakty): W Bibliotece mądra Żaba w Okularach 🐸 przedstawia twarde dowody z książek!', hint: 'Kto analizuje dane w okularach wśród książek?' },
        { roomId: 'wintergarden', itemId: 'avocado', story: 'Punkt 5 (Zdrowie i Rozwój): W Ogrodzie Rapujące Awokado 🥑 głosi odnowę i dobrą energię!', hint: 'Jaki owoc rapuje o rozwoju w ogrodzie?' },
        { roomId: 'treasury', itemId: 'diamond', story: 'Punkt 6 (Wartość/Zysk): W Skarbcu lśni Diament 💎 – dowód, ile zyskają słuchacze!', hint: 'Co cennego i błyszczącego leży w skarbcu?' },
        { roomId: 'balcony', itemId: 'unicorn', story: 'Punkt 7 (Zakończenie z klasą): Na Balkonie stoi Jednorożec 🦄 z herbatą – spektakularny, niezapomniany finał!', hint: 'Jakie mityczne zwierzę pije herbatę na balkonie na pożegnanie?' }
      ],
      review: '7 punktów przemowy: Kapelusz ➡️ Rakieta ➡️ Pizza ➡️ Żaba ➡️ Awokado ➡️ Diament ➡️ Jednorożec.',
      tigerCongrats: 'Rzymski Senat wstałby do owacji na stojąco! Jesteś gotowy na każdą prezentację! 🎓'
    },
    {
      id: 7, title: 'Wielka Trasa 8 Komnat', kicker: 'Lekcja 7 · 8 komnat',
      desc: 'Wydłużamy ścieżkę do 8 komnat. Płynny spacer, pewność i automatyzm skojarzeń.',
      intro: [
        'Twoja pamięć przestrzenna jest już niesamowicie wytrenowana! 🔥',
        'Teraz sprawdzimy, jak radzisz sobie z dłuższą trasą 8 komnat. Zwróć uwagę, jak naturalnie jedna komnata prowadzi do drugiej.',
        'Gdy wychodzisz z Biblioteki, przed sobą masz Ogród; za Ogrodem wchodzisz do Skarbca... Twój mózg tworzy spójną mapę 3D!',
        'Gotowy na 8 przystanków? Weź głęboki oddech i ruszamy!'
      ],
      loci: [
        { roomId: 'gate', itemId: 'banana', story: 'Złota Brama rozświetlona jest przez wielki Świecący Banan 🍌.', hint: 'Co świeci jasno przy wejściu?' },
        { roomId: 'hall', itemId: 'drum', story: 'W Marmurowym Holu stoi Złoty Bębenek 🥁 i wygrywa wesoły marsz na powitanie.', hint: 'Jaki instrument bębni w holu?' },
        { roomId: 'fireplace', itemId: 'elephant', story: 'W Sali Kominkowej tańczy Słoń na Różowych Wrotkach 🐘.', hint: 'Kto jeździ na wrotkach przy kominku?' },
        { roomId: 'library', itemId: 'guitar', story: 'W Bibliotece rockowa Gitara 🎸 brzęczy na drewnianym pulpicie.', hint: 'Co gra rocka na pulpicie bibliotecznym?' },
        { roomId: 'kitchen', itemId: 'cheese', story: 'W Kuchni sprężynujący Ser Żółty 🧀 odbija się od sufitu.', hint: 'Co sprężynuje w kuchni pod sufitem?' },
        { roomId: 'treasury', itemId: 'crown', story: 'W Skarbcu na aksamitnej poduszce błyszczy rubinowa Korona 👑.', hint: 'Co królewskiego spoczywa na poduszce w skarbcu?' },
        { roomId: 'tower', itemId: 'rocket', story: 'Z Wieży Astronomicznej w stronę gwiazd leci Rakieta 🚀.', hint: 'Co leci w stronę gwiazd z wieży?' },
        { roomId: 'roof', itemId: 'duck', story: 'Na szczycie Dachu stoi dumna Kaczuszka Wikinga 🦆 w rogatym hełmie i patrzy na horyzont!', hint: 'Kto w hełmie wikinga pilnuje dachu pałacu?' }
      ],
      review: 'Brama ➡️ Banan, Hol ➡️ Bębenek, Kominek ➡️ Słoń, Biblioteka ➡️ Gitara, Kuchnia ➡️ Ser, Skarbiec ➡️ Korona, Wieża ➡️ Rakieta, Dach ➡️ Kaczka.',
      tigerCongrats: '8 komnat pokonane bez zadyszki! Twoja mentalna mapa jest krystalicznie czysta! 🗺️'
    },
    {
      id: 8, title: 'Egzamin Mistrzowski (10 Komnat)', kicker: 'Lekcja 8 · Wielki Finał Szkolenia',
      desc: 'Kompletna trasa przez cały Pałac Królewski! 10 komnat, 10 niezwykłych obiektów, tytuł Mistrza Loci.',
      intro: [
        'Oto nadszedł wielki moment – Egzamin Mistrza Pałacu Pamięci! 👑',
        'Przejdziesz kompletną, 10-punktową trasę od Złotej Bramy aż po sam Szczyt Pałacu.',
        'Po ukończeniu tej lekcji będziesz potrafił zapamiętać dowolną listę 10 rzeczy w ułamku chwili – numery, zadania, przemówienia, daty!',
        'Zaufaj swojej wyobraźni. Spaceruj spokojnie. Tygrysek Leon kibicuje z całych sił! 🐯✨'
      ],
      loci: [
        { roomId: 'gate', itemId: 'banana', story: 'Locus 1 (Brama): Świecący neonowy Banan 🍌.', hint: 'Locus 1: Co rozświetla bramę wejściową?' },
        { roomId: 'hall', itemId: 'hat', story: 'Locus 2 (Hol): Lewitujący Kapelusz Magika 🎩 z gołębiami.', hint: 'Locus 2: Co lewituje w marmurowym holu?' },
        { roomId: 'fireplace', itemId: 'elephant', story: 'Locus 3 (Kominek): Słoń na Różowych Wrotkach 🐘 kręci piruety.', hint: 'Locus 3: Kto tańczy przy kominku?' },
        { roomId: 'library', itemId: 'frog', story: 'Locus 4 (Biblioteka): Żaba w Okularach 🐸 czyta encyklopedię.', hint: 'Locus 4: Kto czyta w okularach w bibliotece?' },
        { roomId: 'wintergarden', itemId: 'flamingo', story: 'Locus 5 (Ogród Zimowy): Różowy Flaming 🦩 w kaloszach.', hint: 'Locus 5: Jaki ptak stoi w ogrodzie w kaloszach?' },
        { roomId: 'mirrors', itemId: 'diamond', story: 'Locus 6 (Gabinet Luster): Błękitny Diament 💎 strzelający laserem.', hint: 'Locus 6: Co błyszczy w lustrach?' },
        { roomId: 'kitchen', itemId: 'pizza', story: 'Locus 7 (Kuchnia): Wirująca w ogniu Płonąca Pizza 🍕.', hint: 'Locus 7: Co fruwa w kuchni?' },
        { roomId: 'treasury', itemId: 'crown', story: 'Locus 8 (Skarbiec): Złota Korona 👑 z rubinami.', hint: 'Locus 8: Co leży w skarbcu na poduszce?' },
        { roomId: 'tower', itemId: 'rocket', story: 'Locus 9 (Wieża): Startująca ku gwiazdom Rakieta 🚀.', hint: 'Locus 9: Co leci ku gwiazdom z wieży?' },
        { roomId: 'roof', itemId: 'unicorn', story: 'Locus 10 (Dach): Magiczny Jednorożec 🦄 pijący herbatkę z widokiem na królestwo.', hint: 'Locus 10: Jakie magiczne stworzenie czeka na szczycie dachu?' }
      ],
      review: '10 Loci Mistrza: Banan ➡️ Kapelusz ➡️ Słoń ➡️ Żaba ➡️ Flaming ➡️ Diament ➡️ Pizza ➡️ Korona ➡️ Rakieta ➡️ Jednorożec.',
      tigerCongrats: 'MISTRZ PAŁACU PAMIĘCI! Zdobyłeś najwyższy laur oratorski! Leon ryczy z dumy i zachwytu! 🐯🏆👑'
    }
  ];

  const PALACE_MODES = [
    { id: 'walk', name: 'Wędrówka Odkrywcy', emoji: '🧭', desc: 'Klasyczna wędrówka przez komnaty. Z każdym poziomem trasa wydłuża się o jedno miejsce!', color: ['#ff9233', '#ffc857'], tag: 'Klasyczny Loci' },
    { id: 'speed', name: 'Błyskawiczny Pałac', emoji: '⚡', desc: 'Spacer na czas! Komnaty zmieniają się automatycznie co 3 sekundy. Twórz skojarzenia w ułamku oka!', color: ['#ff5376', '#ff8a5c'], tag: 'Na czas' },
    { id: 'reverse', name: 'Spacer w Tył', emoji: '🔄', desc: 'Prawdziwy test mistrza: zapamiętaj trasę od wejścia, a potem odtwórz ją od końca do początku!', color: ['#a678ff', '#ff6bd6'], tag: 'Odwrotna kolejność' },
    { id: 'quiz', name: 'Strażnik Komnat', emoji: '🎯', desc: 'Losowe wyzwanie! Tygrysek pyta wyrywkowo: „Gdzie ukrył się jednorożec?” lub „Co zostawiłeś w Wieży?”.', color: ['#3ef0c0', '#4aa8ff'], tag: 'Dostęp bezpośredni' },
    { id: 'survival', name: 'Nieskończona Wędrówka', emoji: '🏆', desc: 'Zaczynasz od 3 komnat. Z każdą rundą dochodzi kolejna, aż do pierwszej pomyłki. Jaki jest Twój rekord?', color: ['#ffd166', '#ef476f'], tag: 'Survival' }
  ];

  function getPalaceMode(id) {
    return PALACE_MODES.find(m => m.id === id) || PALACE_MODES[0];
  }

  function mountPalaceMap(root, { nav }) {
    const tiger = createTiger({ size: 'md' });
    const prog = store.get('palace.train', {});
    const totalStars = Object.values(prog).reduce((a, b) => a + b, 0);
    const doneCount = PALACE_LESSONS.filter(l => prog[l.id]).length;

    const cards = PALACE_LESSONS.map((les, idx) => {
      const stars = prog[les.id] || 0;
      const unlocked = idx === 0 || !!prog[PALACE_LESSONS[idx - 1].id];
      const isNext = unlocked && !prog[les.id];

      return h(unlocked ? 'a' : 'div', {
        class: `lesson-card${unlocked ? '' : ' locked'}${isNext ? ' pulse-next' : ''}`,
        href: unlocked ? `#/palace/train/${les.id}` : null,
        'aria-disabled': unlocked ? null : 'true'
      },
        h('div', { class: 'lc-num' }, unlocked ? (stars ? '✓' : idx + 1) : '🔒'),
        h('div', { class: 'lc-body' },
          h('span', { class: 'lc-kicker' }, les.kicker),
          h('h3', {}, les.title),
          h('p', {}, les.desc),
          h('div', { class: 'lc-loci-preview' },
            les.loci.map(loc => {
              const room = getPalaceRoomById(loc.roomId);
              const item = getPalaceItemById(loc.itemId);
              return h('span', { class: 'locus-chip', title: `${room.name}: ${item.name}` }, `${room.emoji} ${item.emoji}`);
            })
          )
        ),
        h('div', { class: 'lc-stars' },
          [0, 1, 2].map(i => h('span', { class: i < stars ? 'on' : 'off' }, '★'))
        )
      );
    });

    const whyCard = h('div', { class: 'why-card' },
      h('span', { class: 'why-icon' }, '🎯'),
      h('div', { class: 'why-content' },
        h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
        h('p', {}, 'Wygłaszanie przemówień i prezentacji bez ani jednej kartki, bezstresowe zdawanie egzaminów i lista 20 zadań w głowie – Twój mózg myśli przestrzenią, a pałac to Twój wewnętrzny segregator wiedzy!')
      )
    );

    const view = h('section', { class: 'screen' },
      h('div', { class: 'crumbs' },
        h('a', { href: '#/palace', class: 'back' }, '← Pałac pamięci')
      ),
      h('div', { class: 'game-head' },
        h('div', {},
          h('h1', {}, '🏰 Mapa szkolenia Loci'),
          h('p', { class: 'lead' }, `Zdobyto ${totalStars} z ${PALACE_LESSONS.length * 3} gwiazdek · Ukończono ${doneCount}/${PALACE_LESSONS.length} lekcji`)
        )
      ),
      tiger.el,
      whyCard,
      h('div', { class: 'lesson-list' }, cards)
    );

    root.append(view);

    const hello = doneCount === 0
      ? 'Rawrr! Witaj na mapie szkolenia! Wybierz lekcję 1, a powoli oprowadzę Cię po pałacu 🐯'
      : doneCount === PALACE_LESSONS.length
        ? 'Jesteś niesamowity! Ukończyłeś wszystkie lekcje z 10 komnatami! Czas pobić rekordy w grze swobodnej! 🏆'
        : `Świetne postępy! Masz już ${doneCount} z ${PALACE_LESSONS.length} lekcji. Wybierz kolejną komnatę! 🏰`;

    setTimeout(() => { tiger.wave(); tiger.say(hello, 'happy'); }, 250);
    return () => tiger.destroy();
  }

  function mountPalaceStep(root, { nav, index }) {
    const lesson = PALACE_LESSONS[index];
    if (!lesson) { nav('palace/train'); return () => {}; }

    const tiger = createTiger({ size: 'md' });
    const prog = store.get('palace.train', {});
    let penalties = 0;
    let hintLevel = 0;
    let currentRoomIdx = 0;
    let recallIdx = 0;
    let cleanedUp = false;

    const head = h('div', { class: 'game-head' },
      h('div', {},
        h('div', { class: 'crumbs' },
          h('a', { href: '#/palace/train', class: 'back' }, '← Mapa szkolenia'),
          h('span', { class: 'badge' }, lesson.kicker)
        ),
        h('h1', {}, lesson.title),
        h('p', { class: 'lead' }, lesson.desc)
      )
    );

    const stage = h('div', { class: 'palace-stage' });
    const controls = h('div', { class: 'controls' });

    const view = h('section', { class: 'screen palace-screen' }, head, tiger.el, stage, controls);
    root.append(view);

    function renderPathTracker(activeIdx, maxIdx, completedIdx = -1) {
      const chips = lesson.loci.map((loc, i) => {
        const room = getPalaceRoomById(loc.roomId);
        const isDone = i < completedIdx;
        const isCur = i === activeIdx;
        return h('div', {
          class: `path-step${isCur ? ' current' : ''}${isDone ? ' done' : ''}`,
          title: `${i + 1}. ${room.name}`
        },
          h('span', { class: 'ps-num' }, isDone ? '✓' : i + 1),
          h('span', { class: 'ps-icon' }, room.emoji)
        );
      });
      return h('div', { class: 'path-tracker' }, chips);
    }

    let introIdx = 0;
    function showIntro() {
      stage.replaceChildren();
      controls.replaceChildren();

      const introBox = h('div', { class: 'intro-box' },
        h('div', { class: 'intro-icon' }, '🏰'),
        h('p', { class: 'intro-text' }, lesson.intro[introIdx]),
        h('div', { class: 'intro-dots' },
          lesson.intro.map((_, i) => h('span', { class: i === introIdx ? 'dot on' : 'dot' }))
        )
      );
      stage.append(introBox);

      const isLast = introIdx >= lesson.intro.length - 1;
      const nextBtn = h('button', { class: 'btn btn-primary', type: 'button' }, isLast ? 'Zaczynamy spacer! ▶' : 'Dalej ▶');
      nextBtn.onclick = () => {
        sfx.pop();
        if (isLast) {
          startPresentation();
        } else {
          introIdx++;
          showIntro();
        }
      };
      controls.append(nextBtn);
      tiger.say(lesson.intro[introIdx], isLast ? 'cheer' : 'happy');
    }

    function startPresentation() {
      currentRoomIdx = 0;
      renderRoomPresentation();
    }

    function renderRoomPresentation() {
      stage.replaceChildren();
      controls.replaceChildren();

      const loc = lesson.loci[currentRoomIdx];
      const room = getPalaceRoomById(loc.roomId);
      const item = getPalaceItemById(loc.itemId);

      const tracker = renderPathTracker(currentRoomIdx, lesson.loci.length);

      const roomCard = h('div', {
        class: 'palace-room-card',
        style: `background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(0,0,0,0.3)), linear-gradient(135deg, ${room.color[0]}22, ${room.color[1]}33); border-color: ${room.color[0]}55`
      },
        h('div', { class: 'room-header' },
          h('span', { class: 'room-badge' }, `Komnata ${currentRoomIdx + 1} z ${lesson.loci.length}`),
          h('h2', { class: 'room-name' }, `${room.emoji} ${room.name}`),
          h('p', { class: 'room-desc' }, room.desc)
        ),
        h('div', { class: 'room-scene' },
          h('div', { class: 'room-locus-visual' },
            h('span', { class: 'item-emoji pulse-item' }, item.emoji),
            h('span', { class: 'item-name' }, item.name)
          ),
          h('div', { class: 'story-bubble' },
            h('span', { class: 'story-quote' }, `„${loc.story}”`),
            h('small', { class: 'story-tip' }, '💡 Zamknij na moment oczy i zobacz ten obraz w swojej głowie!')
          )
        )
      );

      stage.append(tracker, roomCard);

      const prevBtn = h('button', { class: 'btn btn-ghost', type: 'button', disabled: currentRoomIdx === 0 }, '← Poprzednia');
      prevBtn.onclick = () => {
        if (currentRoomIdx > 0) {
          currentRoomIdx--;
          sfx.pop();
          renderRoomPresentation();
        }
      };

      const isLastRoom = currentRoomIdx === lesson.loci.length - 1;
      const nextBtn = h('button', { class: 'btn btn-primary', type: 'button' },
        isLastRoom ? 'Sprawdź pamięć! 🎯' : 'Kolejna komnata →'
      );
      nextBtn.onclick = () => {
        sfx.pop();
        if (isLastRoom) {
          startRecallPhase();
        } else {
          currentRoomIdx++;
          renderRoomPresentation();
        }
      };

      controls.append(prevBtn, nextBtn);
      tiger.say(`Komnata ${currentRoomIdx + 1}: ${room.name}. Zobacz: ${loc.story}`, 'think');
    }

    function startRecallPhase() {
      recallIdx = 0;
      renderRecallStep();
    }

    function renderRecallStep() {
      stage.replaceChildren();
      controls.replaceChildren();

      const loc = lesson.loci[recallIdx];
      const room = getPalaceRoomById(loc.roomId);
      const correctItem = getPalaceItemById(loc.itemId);

      const tracker = renderPathTracker(recallIdx, lesson.loci.length, recallIdx);

      const recallCard = h('div', {
        class: 'palace-recall-card',
        style: `border-color: ${room.color[0]}66`
      },
        h('div', { class: 'recall-prompt' },
          h('span', { class: 'room-badge' }, `Krok ${recallIdx + 1} z ${lesson.loci.length}`),
          h('h2', { class: 'recall-room-title' }, `${room.emoji} ${room.name}`),
          h('p', { class: 'recall-question' }, 'Co umieściłeś w tej komnacie?')
        ),
        h('div', { class: 'recall-target-slot' },
          h('span', { class: 'slot-question' }, '?')
        )
      );

      const distractors = shuffle(PALACE_ITEMS.filter(it => it.id !== correctItem.id)).slice(0, 3);
      const choices = shuffle([correctItem, ...distractors]);

      const choiceGrid = h('div', { class: 'choice-grid' },
        choices.map(choice => {
          const btn = h('button', { class: 'choice-btn', type: 'button' },
            h('span', { class: 'cb-emoji' }, choice.emoji),
            h('span', { class: 'cb-name' }, choice.name)
          );

          btn.onclick = () => {
            if (btn.disabled) return;
            if (choice.id === correctItem.id) {
              btn.classList.add('correct');
              sfx.good();
              tiger.roar();
              tiger.say(`Tak jest! ${correctItem.emoji} ${correctItem.name}! Świetna pamięć!`, 'cheer');

              choiceGrid.querySelectorAll('button').forEach(b => { b.disabled = true; });

              setTimeout(() => {
                if (cleanedUp) return;
                if (recallIdx + 1 < lesson.loci.length) {
                  recallIdx++;
                  renderRecallStep();
                } else {
                  finishLesson();
                }
              }, 800);
            } else {
              btn.classList.add('wrong');
              btn.disabled = true;
              penalties++;
              sfx.bad();
              tiger.setMood('think', 1500);
              tiger.say(`Ups! To nie to. Spokojnie, rozejrzyj się po komnacie ${room.name} jeszcze raz!`, 'think');
            }
          };
          return btn;
        })
      );

      stage.append(tracker, recallCard, choiceGrid);

      const hintBtn = h('button', { class: 'btn btn-ghost', type: 'button' }, '💡 Podpowiedź Leona');
      hintBtn.onclick = () => {
        hintLevel++;
        penalties += 0.5;
        sfx.pop();
        tiger.say(`Podpowiedź: ${loc.hint}`, 'think');
        hintBtn.disabled = true;
      };
      controls.append(hintBtn);

      tiger.say(`Przystanek ${recallIdx + 1}: ${room.name}. Pamiętasz, co tu zostawiliśmy?`, 'happy');
    }

    function finishLesson() {
      stage.replaceChildren();
      controls.replaceChildren();

      const stars = penalties === 0 ? 3 : penalties <= 1.5 ? 2 : 1;
      prog[lesson.id] = Math.max(prog[lesson.id] || 0, stars);
      store.set('palace.train', prog);

      sfx.win();
      confetti();
      tiger.roar();

      const starsRow = h('div', { class: 'stars-finish' },
        [0, 1, 2].map(i => h('span', { class: i < stars ? 'on pop-star' : 'off', style: `--delay: ${i * 0.2}s` }, '★'))
      );

      const summaryCard = h('div', { class: 'palace-finish-card' },
        h('h2', {}, '🎉 Komnaty Opanowane!'),
        starsRow,
        h('p', { class: 'finish-review' }, lesson.review),
        h('p', { class: 'finish-congrats' }, lesson.tigerCongrats)
      );

      stage.append(summaryCard);

      const replayBtn = h('button', { class: 'btn btn-ghost', type: 'button' }, 'Powtórz ↺');
      replayBtn.onclick = () => {
        sfx.pop();
        penalties = 0;
        hintLevel = 0;
        startPresentation();
      };

      const hasNext = index + 1 < PALACE_LESSONS.length;
      const nextBtn = h('button', { class: 'btn btn-primary', type: 'button' },
        hasNext ? 'Następna lekcja ▶' : 'Mapa lekcji 🗺️'
      );
      nextBtn.onclick = () => {
        sfx.pop();
        nav(hasNext ? `palace/train/${index + 2}` : 'palace/train');
      };

      controls.append(replayBtn, nextBtn);
      tiger.say(lesson.tigerCongrats, 'cheer');
    }

    showIntro();

    return () => {
      cleanedUp = true;
      tiger.destroy();
    };
  }

  function mountPalaceFree(root, { nav, modeId }) {
    const mode = getPalaceMode(modeId);
    const tiger = createTiger({ size: 'md' });
    let cleanedUp = false;
    let timerId = null;

    let level = 1;
    let score = 0;
    let best = store.get(`palace.best.${mode.id}`, 0);

    const head = h('div', { class: 'game-head' },
      h('div', {},
        h('div', { class: 'crumbs' },
          h('a', { href: '#/palace', class: 'back' }, '← Pałac pamięci'),
          h('span', { class: 'badge', style: `background: linear-gradient(135deg, ${mode.color[0]}, ${mode.color[1]}); color: #15172e` }, mode.tag)
        ),
        h('h1', {}, `${mode.emoji} ${mode.name}`),
        h('p', { class: 'lead' }, mode.desc)
      )
    );

    const statsBar = h('div', { class: 'free-stats' },
      h('div', { class: 'stat-pill' }, h('span', {}, 'Poziom:'), h('b', { id: 'statLevel' }, '1')),
      h('div', { class: 'stat-pill' }, h('span', {}, 'Rekord:'), h('b', { id: 'statBest' }, String(best)))
    );

    const stage = h('div', { class: 'palace-stage' });
    const controls = h('div', { class: 'controls' });

    const view = h('section', { class: 'screen palace-screen' }, head, statsBar, tiger.el, stage, controls);
    root.append(view);

    function generateLoci(count) {
      const pickedRooms = shuffle([...PALACE_ROOMS]).slice(0, count);
      const pickedItems = shuffle([...PALACE_ITEMS]).slice(0, count);
      return pickedRooms.map((r, i) => ({
        room: r,
        item: pickedItems[i]
      }));
    }

    function startRound() {
      clearTimeout(timerId);
      statsBar.querySelector('#statLevel').textContent = String(level);

      let count = 3;
      if (mode.id === 'walk') count = Math.min(3 + level - 1, 12);
      else if (mode.id === 'speed') count = Math.min(3 + Math.floor(level / 2), 8);
      else if (mode.id === 'reverse') count = Math.min(3 + level - 1, 9);
      else if (mode.id === 'quiz') count = Math.min(3 + level - 1, 8);
      else if (mode.id === 'survival') count = 2 + level;

      const loci = generateLoci(count);
      runPresentation(loci);
    }

    function runPresentation(loci) {
      let curIdx = 0;

      function renderCurrent() {
        if (cleanedUp) return;
        stage.replaceChildren();
        controls.replaceChildren();

        const pair = loci[curIdx];
        const tracker = h('div', { class: 'path-tracker' },
          loci.map((_, i) => h('div', { class: `path-step${i === curIdx ? ' current' : i < curIdx ? ' done' : ''}` },
            h('span', { class: 'ps-num' }, i + 1)
          ))
        );

        const roomCard = h('div', {
          class: 'palace-room-card',
          style: `background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(0,0,0,0.3)), linear-gradient(135deg, ${pair.room.color[0]}22, ${pair.room.color[1]}33); border-color: ${pair.room.color[0]}55`
        },
          h('div', { class: 'room-header' },
            h('span', { class: 'room-badge' }, `Komnata ${curIdx + 1} z ${loci.length}`),
            h('h2', { class: 'room-name' }, `${pair.room.emoji} ${pair.room.name}`)
          ),
          h('div', { class: 'room-scene' },
            h('div', { class: 'room-locus-visual' },
              h('span', { class: 'item-emoji pulse-item' }, pair.item.emoji),
              h('span', { class: 'item-name' }, pair.item.name)
            ),
            h('div', { class: 'story-bubble' },
              h('span', { class: 'story-quote' }, `W komnacie ${pair.room.name} znajduje się ${pair.item.name}! ${pair.item.action}.`),
              h('small', { class: 'story-tip' }, '⚡ Stwórz żywy, dynamiczny obraz w wyobraźni!')
            )
          )
        );

        stage.append(tracker, roomCard);

        if (mode.id === 'speed') {
          const timerBar = h('div', { class: 'speed-timer-bar', style: 'animation: shrink 3.2s linear forwards' });
          stage.append(timerBar);

          timerId = setTimeout(() => {
            if (curIdx + 1 < loci.length) {
              curIdx++;
              renderCurrent();
            } else {
              startRecall(loci);
            }
          }, 3200);

          tiger.say(`Komnata ${curIdx + 1}: ${pair.item.name}! Szybko zapamiętaj!`, 'think');
        } else {
          const isLast = curIdx === loci.length - 1;
          const nextBtn = h('button', { class: 'btn btn-primary', type: 'button' },
            isLast ? 'Sprawdź pamięć! 🎯' : 'Kolejna komnata →'
          );
          nextBtn.onclick = () => {
            sfx.pop();
            if (isLast) {
              startRecall(loci);
            } else {
              curIdx++;
              renderCurrent();
            }
          };

          const prevBtn = h('button', { class: 'btn btn-ghost', type: 'button', disabled: curIdx === 0 }, '← Poprzednia');
          prevBtn.onclick = () => {
            if (curIdx > 0) {
              curIdx--;
              sfx.pop();
              renderCurrent();
            }
          };

          controls.append(prevBtn, nextBtn);
          tiger.say(`Komnata ${curIdx + 1}: ${pair.room.name} ➡️ ${pair.item.name}`, 'happy');
        }
      }

      renderCurrent();
    }

    function startRecall(loci) {
      if (mode.id === 'reverse') {
        const reversedLoci = [...loci].reverse();
        runStepByStepRecall(reversedLoci, true);
      } else if (mode.id === 'quiz') {
        runQuizRecall(loci);
      } else {
        runStepByStepRecall(loci, false);
      }
    }

    function runStepByStepRecall(lociList, isReverse = false) {
      let recallIdx = 0;

      function renderStep() {
        if (cleanedUp) return;
        stage.replaceChildren();
        controls.replaceChildren();

        const pair = lociList[recallIdx];
        const correctItem = pair.item;

        const tracker = h('div', { class: 'path-tracker' },
          lociList.map((_, i) => h('div', { class: `path-step${i === recallIdx ? ' current' : i < recallIdx ? ' done' : ''}` },
            h('span', { class: 'ps-num' }, isReverse ? lociList.length - i : i + 1)
          ))
        );

        const recallCard = h('div', { class: 'palace-recall-card' },
          h('div', { class: 'recall-prompt' },
            h('span', { class: 'room-badge' }, isReverse ? `Krok ${recallIdx + 1} (W TYŁ)` : `Krok ${recallIdx + 1} z ${lociList.length}`),
            h('h2', { class: 'recall-room-title' }, `${pair.room.emoji} ${pair.room.name}`),
            h('p', { class: 'recall-question' }, isReverse ? 'Co znajdowało się w tej komnacie przed wyjściem?' : 'Co umieściłeś w tej komnacie?')
          )
        );

        const distractors = shuffle(PALACE_ITEMS.filter(it => it.id !== correctItem.id)).slice(0, 3);
        const choices = shuffle([correctItem, ...distractors]);

        const choiceGrid = h('div', { class: 'choice-grid' },
          choices.map(choice => {
            const btn = h('button', { class: 'choice-btn', type: 'button' },
              h('span', { class: 'cb-emoji' }, choice.emoji),
              h('span', { class: 'cb-name' }, choice.name)
            );

            btn.onclick = () => {
              if (btn.disabled) return;
              if (choice.id === correctItem.id) {
                btn.classList.add('correct');
                sfx.good();
                tiger.roar();
                choiceGrid.querySelectorAll('button').forEach(b => { b.disabled = true; });

                setTimeout(() => {
                  if (cleanedUp) return;
                  if (recallIdx + 1 < lociList.length) {
                    recallIdx++;
                    renderStep();
                  } else {
                    handleRoundWin();
                  }
                }, 700);
              } else {
                btn.classList.add('wrong');
                sfx.bad();
                handleGameOver(pair, correctItem, choice);
              }
            };
            return btn;
          })
        );

        stage.append(tracker, recallCard, choiceGrid);
        tiger.say(isReverse ? `Cofamy się! Komnata: ${pair.room.name}. Co tam było?` : `Co ukrywa ${pair.room.name}?`, 'think');
      }

      renderStep();
    }

    function runQuizRecall(lociList) {
      let questionIdx = 0;
      const questions = shuffle([...lociList]);

      function renderQuizStep() {
        if (cleanedUp) return;
        stage.replaceChildren();
        controls.replaceChildren();

        const target = questions[questionIdx];
        const askItem = Math.random() > 0.5;

        const promptCard = h('div', { class: 'palace-recall-card' },
          h('div', { class: 'recall-prompt' },
            h('span', { class: 'room-badge' }, `Pytanie ${questionIdx + 1} z ${questions.length}`),
            h('h2', { class: 'recall-room-title' }, askItem ? `${target.room.emoji} ${target.room.name}` : `${target.item.emoji} ${target.item.name}`),
            h('p', { class: 'recall-question' }, askItem ? 'Jaki przedmiot znajdował się w tej komnacie?' : 'W której komnacie znajdował się ten przedmiot?')
          )
        );

        let choiceGrid;
        if (askItem) {
          const distractors = shuffle(PALACE_ITEMS.filter(i => i.id !== target.item.id)).slice(0, 3);
          const choices = shuffle([target.item, ...distractors]);
          choiceGrid = h('div', { class: 'choice-grid' },
            choices.map(c => {
              const btn = h('button', { class: 'choice-btn', type: 'button' },
                h('span', { class: 'cb-emoji' }, c.emoji),
                h('span', { class: 'cb-name' }, c.name)
              );
              btn.onclick = () => {
                if (c.id === target.item.id) {
                  btn.classList.add('correct');
                  sfx.good();
                  nextQuiz();
                } else {
                  btn.classList.add('wrong');
                  sfx.bad();
                  handleGameOver(target, target.item, c);
                }
              };
              return btn;
            })
          );
        } else {
          const distractors = shuffle(PALACE_ROOMS.filter(r => r.id !== target.room.id)).slice(0, 3);
          const choices = shuffle([target.room, ...distractors]);
          choiceGrid = h('div', { class: 'choice-grid' },
            choices.map(c => {
              const btn = h('button', { class: 'choice-btn', type: 'button' },
                h('span', { class: 'cb-emoji' }, c.emoji),
                h('span', { class: 'cb-name' }, c.name)
              );
              btn.onclick = () => {
                if (c.id === target.room.id) {
                  btn.classList.add('correct');
                  sfx.good();
                  nextQuiz();
                } else {
                  btn.classList.add('wrong');
                  sfx.bad();
                  handleGameOver(target, target.room, c);
                }
              };
              return btn;
            })
          );
        }

        function nextQuiz() {
          choiceGrid.querySelectorAll('button').forEach(b => { b.disabled = true; });
          setTimeout(() => {
            if (cleanedUp) return;
            if (questionIdx + 1 < questions.length) {
              questionIdx++;
              renderQuizStep();
            } else {
              handleRoundWin();
            }
          }, 700);
        }

        stage.append(promptCard, choiceGrid);
        tiger.say('Strażnik Komnat pyta! Sprawdźmy Twój bezpośredni dostęp do loci! 🎯', 'think');
      }

      renderQuizStep();
    }

    function handleRoundWin() {
      score = level;
      if (score > best) {
        best = score;
        store.set(`palace.best.${mode.id}`, best);
        statsBar.querySelector('#statBest').textContent = String(best);
      }

      sfx.win();
      confetti(90);
      tiger.roar();
      tiger.hop();

      stage.replaceChildren();
      controls.replaceChildren();

      const makeNext = (cls = 'btn btn-primary btn-lg pulse-next') => {
        const b = h('button', { class: cls, type: 'button' }, `Kolejny poziom ${level + 1} ▶`);
        b.onclick = () => {
          sfx.pop();
          level++;
          startRound();
        };
        return b;
      };

      const makeMenu = (cls = 'btn btn-ghost') => {
        const b = h('button', { class: cls, type: 'button' }, 'Menu pałacu');
        b.onclick = () => {
          sfx.pop();
          nav('palace');
        };
        return b;
      };

      const winCard = h('div', { class: 'palace-finish-card' },
        h('h2', {}, `🎉 Poziom ${level} zaliczony!`),
        h('p', { class: 'finish-congrats' }, `Genialnie! Twój pałac rośnie w siłę! Wynik: ${score} ${score === 1 ? 'komnata' : score < 5 ? 'komnaty' : 'komnat'}.`),
        h('div', { class: 'finish-actions mt-3', style: 'display:flex; gap:12px; flex-wrap:wrap; justify-content:center;' },
          makeNext(),
          makeMenu()
        )
      );
      stage.append(winCard);

      controls.append(
        makeNext('btn btn-primary'),
        makeMenu('btn btn-ghost')
      );

      const TIGER_CHEERS = [
        `Poziom ${level} w kieszeni! Pokaż pazur w kolejnej komnacie! 🐯🔥`,
        `Potężny skok! Komnaty pałacu stoją przed Tobą otworem! 🏰✨`,
        `Rrr! Niezrównana pamięć! Leon skacze z dumy! 🐾🎉`,
        `Genialna wędrówka! Twój pałac pamięci lśni czystym złotem! 🏛️💎`,
        `Mistrzowskie przejście! Loci w głowie poukładane jak w skarbcu! 🗝️⭐`,
        `Rawrr! Ani jednej pomyłki! Następny poziom czeka! 🚀🔥`
      ];
      tiger.say(rand(TIGER_CHEERS), 'cheer');
    }

    function handleGameOver(pair, expected, picked) {
      if (score > best) {
        best = score;
        store.set(`palace.best.${mode.id}`, best);
        statsBar.querySelector('#statBest').textContent = String(best);
      }

      stage.replaceChildren();
      controls.replaceChildren();

      const overCard = h('div', { class: 'gameover' },
        h('small', {}, 'Koniec gry'),
        h('div', { class: 'go-score' }, h('b', {}, String(score)), h('span', {}, 'poziom')),
        h('p', { class: 'go-best' }, `🏆 Rekord: ${best}`),
        h('p', { class: 'muted' }, `W komnacie ${pair.room?.name || 'pałacu'} znajdował się: ${expected.name || expected}, a wybrano: ${picked.name || picked}.`)
      );
      stage.append(overCard);

      const retryBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Zagraj ponownie ↺');
      retryBtn.onclick = () => {
        sfx.pop();
        level = 1;
        score = 0;
        startRound();
      };

      const menuBtn = h('button', { class: 'btn btn-ghost', type: 'button' }, 'Menu pałacu');
      menuBtn.onclick = () => {
        sfx.pop();
        nav('palace');
      };

      controls.append(retryBtn, menuBtn);
      tiger.setMood('sad', 2500);
      tiger.say('Nie przejmuj się! Każdy mistrz czasem zgubi ścieżkę. Spróbujmy jeszcze raz! 🐾', 'sad');
    }

    startRound();

    return () => {
      cleanedUp = true;
      clearTimeout(timerId);
      tiger.destroy();
    };
  }

  function mountPalaceMenu(root, { nav }) {
    const tiger = createTiger({ size: 'md' });
    const prog = store.get('palace.train', {});
    const done = PALACE_LESSONS.filter(l => prog[l.id]).length;
    const stars = Object.values(prog).reduce((a, b) => a + b, 0);
    const pct = Math.round(done / PALACE_LESSONS.length * 100);
    const next = PALACE_LESSONS.findIndex(l => !prog[l.id]);

    const trainCard = h('a', {
      class: 'big-card train-card',
      href: next === -1 ? '#/palace/train' : `#/palace/train/${next + 1}`
    },
      h('div', { class: 'bc-top' },
        h('div', {},
          h('span', { class: 'bc-kicker' }, '🐯 Szkolenie z Tygryskiem Leonem'),
          h('h3', {}, done === 0 ? 'Rozpocznij naukę Loci' : done === PALACE_LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
          h('p', {}, `${PALACE_LESSONS.length} lekcji · od 2 do 10 komnat · spokojne wskazówki Leona`)
        ),
        h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${PALACE_LESSONS.length}`))
      ),
      h('div', { class: 'bc-foot' },
        h('span', {}, `⭐ ${stars}/${PALACE_LESSONS.length * 3} gwiazdek`),
        h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
      )
    );

    const mapLink = h('a', { class: 'link center', href: '#/palace/train' }, 'Zobacz mapę komnat i lekcji →');

    const modeCards = PALACE_MODES.map(m => {
      const best = store.get(`palace.best.${m.id}`, 0);
      return h('a', {
        class: 'mode-card',
        href: `#/palace/free/${m.id}`,
        style: `--c1:${m.color[0]};--c2:${m.color[1]}`
      },
        h('div', { class: 'mc-emoji' }, m.emoji),
        h('div', { class: 'mc-body' },
          h('h3', {}, m.name),
          h('p', {}, m.desc)
        ),
        h('div', { class: 'mc-best' },
          h('b', {}, best ? `${best}` : '–'),
          h('span', {}, best ? 'rekord' : 'brak')
        )
      );
    });

    const view = h('section', { class: 'screen' },
      h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
      h('div', { class: 'game-head' },
        h('div', {},
          h('h1', {}, '🏰 ', h('span', { class: 'grad' }, 'Pałac pamięci')),
          h('p', { class: 'lead' }, 'Poznaj najstarszą i najpotężniejszą technikę pamięciową świata – metodę Loci.')
        )
      ),
      tiger.el,
      h('h2', { class: 'section-title' }, 'Szkolenie'),
      trainCard,
      mapLink,
      h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '5 unikalnych wariantów')),
      h('div', { class: 'mode-list' }, modeCards)
    );

    root.append(view);

    const greet = done === 0
      ? 'Rawrr! Jestem Leon 🐯 Nauczę Cię metody Loci bez pośpiechu. Zaczynamy od szkolenia!'
      : done < PALACE_LESSONS.length
        ? `Witaj z powrotem w pałacu! Mamy za sobą ${done} z ${PALACE_LESSONS.length} lekcji. Idziemy dalej? 🏰`
        : 'Opanowałeś cały pałac! 🏆 Sprawdź swoje siły w 5 wariantach gry swobodnej!';

    setTimeout(() => { tiger.wave(); tiger.say(greet, 'happy'); }, 300);
    return () => tiger.destroy();
  }

  const palaceGame = {
    mount(root, ctx) {
      const [a, b] = ctx.params;
      if (a === 'train') return b ? mountPalaceStep(root, { ...ctx, index: Number(b) - 1 }) : mountPalaceMap(root, ctx);
      if (a === 'free' && b) return mountPalaceFree(root, { ...ctx, modeId: b });
      return mountPalaceMenu(root, ctx);
    }
  };


  /* ==========================================================================
     NOWE MASKOTKI (LIS, SÓWKA, PAPUGA, SZOP, WIEWIÓRKA, ŻÓŁWIK, PIESEK, OŚMIORNICA)
     ========================================================================== */





const FOX_SVG = `
<svg class="fox" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
  <ellipse cx="100" cy="222" rx="56" ry="6" fill="#000" opacity=".25"/>
  <g class="all">
    <!-- Ogon z białym pędzelkiem -->
    <g class="tail">
      <path d="M140 190 C 205 200, 215 120, 175 95" stroke="#ff6b35" stroke-width="26" fill="none" stroke-linecap="round"/>
      <path d="M175 95 C 168 90, 162 86, 155 82" stroke="#fff6ed" stroke-width="22" fill="none" stroke-linecap="round"/>
    </g>
    <!-- Ciało liska -->
    <g class="body">
      <ellipse cx="100" cy="170" rx="52" ry="48" fill="#ff6b35"/>
      <ellipse cx="100" cy="178" rx="28" ry="34" fill="#fff6ed"/>
    </g>
    <!-- Łapki w czarnych skarpetkach -->
    <path class="arm arm-l" d="M62 152 q-14 22 -6 44" stroke="#ff6b35" stroke-width="17" stroke-linecap="round" fill="none"/>
    <path class="arm arm-r" d="M138 152 q14 22 6 44" stroke="#ff6b35" stroke-width="17" stroke-linecap="round" fill="none"/>
    <ellipse cx="78" cy="214" rx="17" ry="9" fill="#2b1b17"/>
    <ellipse cx="122" cy="214" rx="17" ry="9" fill="#2b1b17"/>
    <!-- Głowa liska -->
    <g class="head">
      <!-- Uszy ze spiczastymi czarnymi końcówkami -->
      <g class="ear ear-l">
        <path d="M42 74 L32 16 L84 48 Z" fill="#ff6b35"/>
        <path d="M38 42 L32 16 L54 32 Z" fill="#2b1b17"/>
        <path d="M48 64 L40 28 L72 48 Z" fill="#ff9db0"/>
      </g>
      <g class="ear ear-r">
        <path d="M158 74 L168 16 L116 48 Z" fill="#ff6b35"/>
        <path d="M162 42 L168 16 L146 32 Z" fill="#2b1b17"/>
        <path d="M152 64 L160 28 L128 48 Z" fill="#ff9db0"/>
      </g>
      <!-- Kształt głowy i puszyste policzki -->
      <ellipse cx="100" cy="92" rx="60" ry="50" fill="#ff6b35"/>
      <path d="M42 90 l-14 12 l14 4 l-10 12 l18 -4" fill="#ff6b35"/>
      <path d="M158 90 l14 12 l-14 4 l10 12 l-18 -4" fill="#ff6b35"/>
      <!-- Białe policzki i pyszczek -->
      <path d="M48 94 Q 100 70 152 94 Q 100 134 48 94 Z" fill="#fff6ed"/>
      <circle cx="64" cy="106" r="9" fill="#ff708f" opacity=".6"/>
      <circle cx="136" cy="106" r="9" fill="#ff708f" opacity=".6"/>
      <!-- Oczy w bezpiecznych slotach -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
      </g>
      <g class="eyes-closed" fill="none" stroke="#2b1b17" stroke-width="5" stroke-linecap="round">
        <path d="M64 94 Q76 78 88 94"/>
        <path d="M112 94 Q124 78 136 94"/>
      </g>
      <!-- Nosek i uśmiech -->
      <path d="M94 105 h12 l-6 7 z" fill="#2b1b17"/>
      <path class="mouth m-smile" d="M100 112 q-8 9 -16 3 M100 112 q8 9 16 3" stroke="#2b1b17" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="mouth m-open" d="M88 114 q12 20 24 0 z" fill="#2b1b17"/>
      <path class="mouth m-sad" d="M88 122 q12 -12 24 0" stroke="#2b1b17" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="tear" d="M62 106 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
    </g>
  </g>
</svg>`;

const FOX_POKE = [
  'Hau! Jestem Lisek Bystrzak 🦊 Każda twarz ma w sobie sekret!',
  'Zauważ ten mały pieprzyk albo okulary – to Twój pamięciowy haczyk! 🔍',
  'Mój puszysty ogon kręci się z zachwytu! Gotowy poznać nowych ludzi? 🐾',
  'Nigdy więcej nie powiesz: „Znam tę twarz, ale jak on miał na imię?”. ✨',
  'Twój wzrok jest bystrzejszy niż myślisz! Złapiesz każdą twarz w sekundę! 🎯',
  'Lisi spryt to potężna broń – łącz imię z charakterystyczną cechą! ⚓'
];

function createFox({ size = 'md', pokeLines = FOX_POKE } = {}) {
  const figure = h('button', {
    class: 'fox-figure',
    type: 'button',
    'aria-label': 'Lisek Bystrzak – kliknij, żeby pogłaskać',
    html: FOX_SVG
  });
  const svg = figure.querySelector('svg');
  const text = h('span', { class: 'bubble-text' });
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
  const bubble = h('div', { class: 'bubble' }, text, live);
  const el = h('div', { class: `fox-wrap fox-${size}` }, figure, bubble);

  let typeId = 0, revertT, dead = false;

  function setMood(m, revertMs = 0) {
    svg.dataset.mood = m;
    clearTimeout(revertT);
    if (revertMs) revertT = setTimeout(() => { svg.dataset.mood = 'happy'; }, revertMs);
  }

  async function say(msg, mood = 'happy', { revert = 0, speed = 14 } = {}) {
    const id = ++typeId;
    setMood(mood, revert);
    bubble.classList.add('show');
    const finalMsg = typeof t === "function" ? t(msg) : msg;
    live.textContent = finalMsg;
    text.textContent = "";
    for (let i = 1; i <= finalMsg.length; i++) {
      if (id !== typeId) return;
      text.textContent = finalMsg.slice(0, i);
      await sleep(speed);
    }
  }

  function flash(cls, ms) {
    svg.classList.add(cls);
    setTimeout(() => svg.classList.remove(cls), ms);
  }

  function spin() {
    figure.classList.remove('spin'); void figure.offsetWidth;
    figure.classList.add('spin');
    sfx.pop?.();
  }

  figure.addEventListener('click', () => {
    spin();
    say(rand(pokeLines), 'cheer', { revert: 2000 });
  });

  function onMove(e) {
    if (!el.isConnected) return;
    const r = svg.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height * .4);
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 220);
    svg.style.setProperty('--px', (dx / d * k * 4).toFixed(2));
    svg.style.setProperty('--py', (dy / d * k * 4).toFixed(2));
  }
  addEventListener('pointermove', onMove, { passive: true });

  (async function idle() {
    while (!dead) {
      await sleep(rand([3500, 5000, 6500]));
      if (dead || !el.isConnected) continue;
      const pick = rand(['ear-twitch', 'tail-fast', 'hop']);
      flash(pick, 800);
    }
  })();

  return {
    el,
    svg,
    say,
    setMood,
    spin,
    wave(ms = 1800) { flash('wave', ms); },
    hop() { flash('hop', 700); },
    destroy() {
      dead = true;
      typeId++;
      clearTimeout(revertT);
      removeEventListener('pointermove', onMove);
      el.remove();
    }
  };
}





const OWL_SVG = `
<svg class="owl" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
  <ellipse cx="100" cy="222" rx="54" ry="6" fill="#000" opacity=".25"/>
  <g class="all">
    <!-- Ciało sówki -->
    <g class="body">
      <ellipse cx="100" cy="155" rx="56" ry="58" fill="#8d5b32"/>
      <ellipse cx="100" cy="165" rx="36" ry="42" fill="#fff4e0"/>
      <!-- Piórka na brzuszku -->
      <path d="M90 148 q10 6 20 0 M84 162 q16 8 32 0 M88 176 q12 7 24 0" stroke="#c99763" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    </g>
    <!-- Skrzydła sówki -->
    <g class="wings">
      <ellipse class="arm arm-l" cx="50" cy="155" rx="14" ry="38" fill="#734520" transform="rotate(12 50 155)"/>
      <ellipse class="arm arm-r" cx="150" cy="155" rx="14" ry="38" fill="#734520" transform="rotate(-12 150 155)"/>
    </g>
    <!-- Pazurki -->
    <g fill="#f59e0b">
      <ellipse cx="80" cy="214" rx="14" ry="7"/><ellipse cx="120" cy="214" rx="14" ry="7"/>
      <circle cx="74" cy="215" r="4"/><circle cx="86" cy="215" r="4"/>
      <circle cx="114" cy="215" r="4"/><circle cx="126" cy="215" r="4"/>
    </g>
    <!-- Głowa sówki -->
    <g class="head">
      <!-- Piórowe uszka na czubku głowy -->
      <g class="ear ear-l">
        <path d="M52 64 L36 24 L76 46 Z" fill="#734520"/>
        <path d="M50 56 L40 32 L66 46 Z" fill="#ffd699"/>
      </g>
      <g class="ear ear-r">
        <path d="M148 64 L164 24 L124 46 Z" fill="#734520"/>
        <path d="M150 56 L160 32 L134 46 Z" fill="#ffd699"/>
      </g>
      <ellipse cx="100" cy="92" rx="60" ry="50" fill="#8d5b32"/>
      <!-- Jasna maska twarzowa -->
      <path d="M60 88 C 60 70, 96 70, 100 86 C 104 70, 140 70, 140 88 C 140 114, 100 128, 100 128 C 100 128, 60 114, 60 88 Z" fill="#fff4e0"/>
      <!-- Złote profesorskie okulary -->
      <circle cx="76" cy="90" r="22" stroke="#f59e0b" stroke-width="4.5" fill="none"/>
      <circle cx="124" cy="90" r="22" stroke="#f59e0b" stroke-width="4.5" fill="none"/>
      <path d="M98 90 h4" stroke="#f59e0b" stroke-width="4.5"/>
      <!-- Rumieńce -->
      <circle cx="58" cy="106" r="8" fill="#ff708f" opacity=".6"/>
      <circle cx="142" cy="106" r="8" fill="#ff708f" opacity=".6"/>
      <!-- Oczy w bezpiecznych slotach -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
      </g>
      <g class="eyes-closed" fill="none" stroke="#2b1b17" stroke-width="5" stroke-linecap="round">
        <path d="M66 94 Q76 82 86 94"/>
        <path d="M114 94 Q124 82 134 94"/>
      </g>
      <!-- Dzióbek sówki -->
      <path d="M94 98 L106 98 L100 112 Z" fill="#f59e0b"/>
      <path class="mouth m-smile" d="M100 114 q0 4 0 4" stroke="#d97706" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="mouth m-open" d="M95 110 q5 12 10 0 z" fill="#734520"/>
      <path class="mouth m-sad" d="M95 114 q5 -8 10 0" stroke="#734520" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="tear" d="M60 108 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
    </g>
  </g>
</svg>`;

const OWL_POKE = [
  'Huu-huu! Jestem Sówka Profesor 🦉 Zamienię każdą liczbę w słowo!',
  'Litery to klucze do pamięci. Dźwięk rodzi obraz, a obraz zostaje na zawsze! 📜',
  'Mój dziób klaszcze z podziwu! Gotowy na kolejną zagadkę Majora? ✨',
  'Starożytni uczeni nie mieli smartfonów – mieli genialny System Major! 💡',
  'Mądrość to po prostu dobra technika skojarzeń! 🎓',
  'Huu! Pamięć to najpotężniejszy mięsień Twojego umysłu! 🌟'
];

function createOwl({ size = 'md', pokeLines = OWL_POKE } = {}) {
  const figure = h('button', {
    class: 'owl-figure',
    type: 'button',
    'aria-label': 'Sówka Profesor – kliknij, żeby pogłaskać',
    html: OWL_SVG
  });
  const svg = figure.querySelector('svg');
  const text = h('span', { class: 'bubble-text' });
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
  const bubble = h('div', { class: 'bubble' }, text, live);
  const el = h('div', { class: `owl-wrap owl-${size}` }, figure, bubble);

  let typeId = 0, revertT, dead = false;

  function setMood(m, revertMs = 0) {
    svg.dataset.mood = m;
    clearTimeout(revertT);
    if (revertMs) revertT = setTimeout(() => { svg.dataset.mood = 'happy'; }, revertMs);
  }

  async function say(msg, mood = 'happy', { revert = 0, speed = 14 } = {}) {
    const id = ++typeId;
    setMood(mood, revert);
    bubble.classList.add('show');
    const finalMsg = typeof t === "function" ? t(msg) : msg;
    live.textContent = finalMsg;
    text.textContent = "";
    for (let i = 1; i <= finalMsg.length; i++) {
      if (id !== typeId) return;
      text.textContent = finalMsg.slice(0, i);
      await sleep(speed);
    }
  }

  function flash(cls, ms) {
    svg.classList.add(cls);
    setTimeout(() => svg.classList.remove(cls), ms);
  }

  function spin() {
    figure.classList.remove('spin'); void figure.offsetWidth;
    figure.classList.add('spin');
    sfx.pop?.();
  }

  figure.addEventListener('click', () => {
    spin();
    say(rand(pokeLines), 'cheer', { revert: 2000 });
  });

  function onMove(e) {
    if (!el.isConnected) return;
    const r = svg.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height * .4);
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 220);
    svg.style.setProperty('--px', (dx / d * k * 4).toFixed(2));
    svg.style.setProperty('--py', (dy / d * k * 4).toFixed(2));
  }
  addEventListener('pointermove', onMove, { passive: true });

  (async function idle() {
    while (!dead) {
      await sleep(rand([3500, 5000, 6500]));
      if (dead || !el.isConnected) continue;
      const pick = rand(['ear-twitch', 'hop']);
      flash(pick, 800);
    }
  })();

  return {
    el,
    svg,
    say,
    setMood,
    spin,
    wave(ms = 1800) { flash('wave', ms); },
    hop() { flash('hop', 700); },
    destroy() {
      dead = true;
      typeId++;
      clearTimeout(revertT);
      removeEventListener('pointermove', onMove);
      el.remove();
    }
  };
}





const PARROT_SVG = `
<svg class="parrot" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
  <ellipse cx="100" cy="222" rx="54" ry="6" fill="#000" opacity=".25"/>
  <g class="all">
    <!-- Kolorowy ogon papużki -->
    <g class="tail">
      <path d="M125 185 C 160 215, 175 160, 185 130" stroke="#00b4d8" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M115 190 C 145 220, 160 170, 172 145" stroke="#ffb703" stroke-width="12" fill="none" stroke-linecap="round"/>
    </g>
    <!-- Ciało papużki -->
    <g class="body">
      <ellipse cx="100" cy="162" rx="52" ry="52" fill="#2ec4b6"/>
      <ellipse cx="100" cy="170" rx="32" ry="38" fill="#ffb703"/>
    </g>
    <!-- Skrzydełka -->
    <g class="wings">
      <ellipse class="arm arm-l" cx="52" cy="158" rx="14" ry="36" fill="#00b4d8" transform="rotate(10 52 158)"/>
      <ellipse class="arm arm-r" cx="148" cy="158" rx="14" ry="36" fill="#00b4d8" transform="rotate(-10 148 158)"/>
    </g>
    <!-- Nóżki -->
    <g fill="#ff5964">
      <ellipse cx="80" cy="214" rx="15" ry="7"/><ellipse cx="120" cy="214" rx="15" ry="7"/>
    </g>
    <!-- Głowa z czubkiem z piórek -->
    <g class="head">
      <!-- Czubek na głowie (irokez) -->
      <g class="ear ear-l">
        <path d="M90 42 C 80 14, 94 8, 98 34" stroke="#ff5964" stroke-width="8" fill="none" stroke-linecap="round"/>
        <path d="M102 42 C 102 10, 114 8, 110 34" stroke="#ffb703" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M112 44 C 122 18, 130 16, 120 38" stroke="#00b4d8" stroke-width="6" fill="none" stroke-linecap="round"/>
      </g>
      <ellipse cx="100" cy="92" rx="58" ry="48" fill="#2ec4b6"/>
      <!-- Białe obwódki wokół oczu -->
      <ellipse cx="76" cy="90" rx="20" ry="22" fill="#fffef5"/>
      <ellipse cx="124" cy="90" rx="20" ry="22" fill="#fffef5"/>
      <circle cx="56" cy="106" r="8" fill="#ff5964" opacity=".55"/>
      <circle cx="144" cy="106" r="8" fill="#ff5964" opacity=".55"/>
      <!-- Oczy w bezpiecznych slotach -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
      </g>
      <g class="eyes-closed" fill="none" stroke="#2b1b17" stroke-width="5" stroke-linecap="round">
        <path d="M66 94 Q76 82 86 94"/>
        <path d="M114 94 Q124 82 134 94"/>
      </g>
      <!-- Zakrzywiony słodki dzióbek -->
      <path d="M92 94 C 92 84, 108 84, 108 94 C 108 116, 100 120, 100 120 C 100 120, 92 116, 92 94 Z" fill="#ff5964"/>
      <path class="mouth m-smile" d="M96 112 q4 5 8 0" stroke="#b91c1c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path class="mouth m-open" d="M96 108 q4 14 8 0 z" fill="#b91c1c"/>
      <path class="mouth m-sad" d="M96 116 q4 -6 8 0" stroke="#b91c1c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path class="tear" d="M58 108 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
    </g>
  </g>
</svg>`;

const PARROT_POKE = [
  'Kraa! Jestem Papużka Pola 🦜 Znam słówka ze wszystkich zakątków świata!',
  'Most fonetyczny to magia: nietoperz z baseballowym batem i już pamiętasz bat! ⚾',
  'Moje piórka mienią się jak tęcza! Gotowy na kolejną porcję słówek? 🌈',
  'Mów do mnie w dowolnym języku – zamienię go w zabawny obrazek! 🌴',
  'Kra-kra! Twój mózg to najszybszy tłumacz na świecie! ✨',
  'Każde nowe słówko to jak kolorowe piórko w Twojej koronie wiedzy! 👑'
];

function createParrot({ size = 'md', pokeLines = PARROT_POKE } = {}) {
  const figure = h('button', {
    class: 'parrot-figure',
    type: 'button',
    'aria-label': 'Papużka Pola – kliknij, żeby pogłaskać',
    html: PARROT_SVG
  });
  const svg = figure.querySelector('svg');
  const text = h('span', { class: 'bubble-text' });
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
  const bubble = h('div', { class: 'bubble' }, text, live);
  const el = h('div', { class: `parrot-wrap parrot-${size}` }, figure, bubble);

  let typeId = 0, revertT, dead = false;

  function setMood(m, revertMs = 0) {
    svg.dataset.mood = m;
    clearTimeout(revertT);
    if (revertMs) revertT = setTimeout(() => { svg.dataset.mood = 'happy'; }, revertMs);
  }

  async function say(msg, mood = 'happy', { revert = 0, speed = 14 } = {}) {
    const id = ++typeId;
    setMood(mood, revert);
    bubble.classList.add('show');
    const finalMsg = typeof t === "function" ? t(msg) : msg;
    live.textContent = finalMsg;
    text.textContent = "";
    for (let i = 1; i <= finalMsg.length; i++) {
      if (id !== typeId) return;
      text.textContent = finalMsg.slice(0, i);
      await sleep(speed);
    }
  }

  function flash(cls, ms) {
    svg.classList.add(cls);
    setTimeout(() => svg.classList.remove(cls), ms);
  }

  function spin() {
    figure.classList.remove('spin'); void figure.offsetWidth;
    figure.classList.add('spin');
    sfx.pop?.();
  }

  figure.addEventListener('click', () => {
    spin();
    say(rand(pokeLines), 'cheer', { revert: 2000 });
  });

  function onMove(e) {
    if (!el.isConnected) return;
    const r = svg.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height * .4);
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 220);
    svg.style.setProperty('--px', (dx / d * k * 4).toFixed(2));
    svg.style.setProperty('--py', (dy / d * k * 4).toFixed(2));
  }
  addEventListener('pointermove', onMove, { passive: true });

  (async function idle() {
    while (!dead) {
      await sleep(rand([3500, 5000, 6500]));
      if (dead || !el.isConnected) continue;
      const pick = rand(['ear-twitch', 'hop']);
      flash(pick, 800);
    }
  })();

  return {
    el,
    svg,
    say,
    setMood,
    spin,
    wave(ms = 1800) { flash('wave', ms); },
    hop() { flash('hop', 700); },
    destroy() {
      dead = true;
      typeId++;
      clearTimeout(revertT);
      removeEventListener('pointermove', onMove);
      el.remove();
    }
  };
}





const RACCOON_SVG = `
<svg class="raccoon" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
  <ellipse cx="100" cy="222" rx="54" ry="6" fill="#000" opacity=".25"/>
  <g class="all">
    <!-- Pręgowany ogon szopa -->
    <g class="tail">
      <path d="M140 190 C 205 200, 215 125, 175 100" stroke="#8d99ae" stroke-width="24" fill="none" stroke-linecap="round"/>
      <path d="M152 188 l2 -12" stroke="#2b2d42" stroke-width="7" stroke-linecap="round"/>
      <path d="M174 172 l-6 -12" stroke="#2b2d42" stroke-width="7" stroke-linecap="round"/>
      <path d="M188 145 l-12 -6" stroke="#2b2d42" stroke-width="7" stroke-linecap="round"/>
      <path d="M182 120 l-10 6" stroke="#2b2d42" stroke-width="7" stroke-linecap="round"/>
      <path d="M175 100 C 170 94, 166 92, 162 90" stroke="#2b2d42" stroke-width="24" fill="none" stroke-linecap="round"/>
    </g>
    <!-- Ciało szopa -->
    <g class="body">
      <ellipse cx="100" cy="170" rx="54" ry="48" fill="#8d99ae"/>
      <ellipse cx="100" cy="180" rx="30" ry="34" fill="#edf2f4"/>
    </g>
    <!-- Łapki w ciemnych rękawiczkach -->
    <path class="arm arm-l" d="M62 152 q-14 22 -6 44" stroke="#8d99ae" stroke-width="17" stroke-linecap="round" fill="none"/>
    <path class="arm arm-r" d="M138 152 q14 22 6 44" stroke="#8d99ae" stroke-width="17" stroke-linecap="round" fill="none"/>
    <ellipse cx="78" cy="214" rx="17" ry="9" fill="#2b2d42"/>
    <ellipse cx="122" cy="214" rx="17" ry="9" fill="#2b2d42"/>
    <!-- Czerwona muszka magika -->
    <g class="bowtie">
      <path d="M92 138 L84 130 L84 146 Z" fill="#e63946"/>
      <path d="M108 138 L116 130 L116 146 Z" fill="#e63946"/>
      <circle cx="100" cy="138" r="4.5" fill="#d90429"/>
    </g>
    <!-- Głowa szopa -->
    <g class="head">
      <!-- Zaokrąglone uszka z białym obrzeżem -->
      <g class="ear ear-l">
        <circle cx="50" cy="56" r="20" fill="#2b2d42"/>
        <circle cx="50" cy="56" r="14" fill="#edf2f4"/>
      </g>
      <g class="ear ear-r">
        <circle cx="150" cy="56" r="20" fill="#2b2d42"/>
        <circle cx="150" cy="56" r="14" fill="#edf2f4"/>
      </g>
      <ellipse cx="100" cy="92" rx="62" ry="50" fill="#8d99ae"/>
      <!-- Puszyste policzki -->
      <path d="M44 92 l-12 10 l12 4 l-8 10 l16 -2" fill="#8d99ae"/>
      <path d="M156 92 l12 10 l-12 4 l8 10 l-16 -2" fill="#8d99ae"/>
      <!-- Czarna maska rabusia / magika wokół oczu -->
      <path d="M52 92 C 52 74, 94 76, 100 88 C 106 76, 148 74, 148 92 C 148 108, 106 104, 100 102 C 94 104, 52 108, 52 92 Z" fill="#2b2d42"/>
      <path d="M98 42 v18" stroke="#edf2f4" stroke-width="4.5" stroke-linecap="round"/>
      <!-- Biały pyszczek -->
      <ellipse cx="100" cy="112" rx="26" ry="18" fill="#edf2f4"/>
      <!-- Rumieńce -->
      <circle cx="60" cy="108" r="8" fill="#ff708f" opacity=".6"/>
      <circle cx="140" cy="108" r="8" fill="#ff708f" opacity=".6"/>
      <!-- Oczy w bezpiecznych slotach -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#1e2022"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#1e2022"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
      </g>
      <g class="eyes-closed" fill="none" stroke="#edf2f4" stroke-width="5" stroke-linecap="round">
        <path d="M66 94 Q76 82 86 94"/>
        <path d="M114 94 Q124 82 134 94"/>
      </g>
      <!-- Nosek i uśmieszek -->
      <path d="M94 104 h12 l-6 7 z" fill="#1e2022"/>
      <path class="mouth m-smile" d="M100 112 q-8 8 -16 2 M100 112 q8 8 16 2" stroke="#2b2d42" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="mouth m-open" d="M88 114 q12 20 24 0 z" fill="#1e2022"/>
      <path class="mouth m-sad" d="M88 122 q12 -12 24 0" stroke="#2b2d42" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="tear" d="M58 108 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
    </g>
  </g>
</svg>`;

const RACCOON_POKE = [
  'Szast-prast! Jestem Szop Magik 🦝 Talia 52 kart nie ma przede mną tajemnic!',
  'System PAO: Osoba, Akcja, Obiekt. Trzy karty to jedna niezapomniana scena! 🃏',
  'Mój pręgowany ogon faluje z ekscytacji! Gotowy na karcianą sztuczkę? ✨',
  'Nie musisz być magikiem – wystarczy, że dasz kartom twarze swoich bohaterów! 🎩',
  'Wybierz kartę, dowolną kartę... a ja powiem Ci, która to była! 🪄',
  'Abrakadabra! Twój mózg tasuje obrazy szybciej niż krupier w Vegas! ♠️'
];

function createRaccoon({ size = 'md', pokeLines = RACCOON_POKE } = {}) {
  const figure = h('button', {
    class: 'raccoon-figure',
    type: 'button',
    'aria-label': 'Szop Magik – kliknij, żeby pogłaskać',
    html: RACCOON_SVG
  });
  const svg = figure.querySelector('svg');
  const text = h('span', { class: 'bubble-text' });
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
  const bubble = h('div', { class: 'bubble' }, text, live);
  const el = h('div', { class: `raccoon-wrap raccoon-${size}` }, figure, bubble);

  let typeId = 0, revertT, dead = false;

  function setMood(m, revertMs = 0) {
    svg.dataset.mood = m;
    clearTimeout(revertT);
    if (revertMs) revertT = setTimeout(() => { svg.dataset.mood = 'happy'; }, revertMs);
  }

  async function say(msg, mood = 'happy', { revert = 0, speed = 14 } = {}) {
    const id = ++typeId;
    setMood(mood, revert);
    bubble.classList.add('show');
    const finalMsg = typeof t === "function" ? t(msg) : msg;
    live.textContent = finalMsg;
    text.textContent = "";
    for (let i = 1; i <= finalMsg.length; i++) {
      if (id !== typeId) return;
      text.textContent = finalMsg.slice(0, i);
      await sleep(speed);
    }
  }

  function flash(cls, ms) {
    svg.classList.add(cls);
    setTimeout(() => svg.classList.remove(cls), ms);
  }

  function spin() {
    figure.classList.remove('spin'); void figure.offsetWidth;
    figure.classList.add('spin');
    sfx.pop?.();
  }

  figure.addEventListener('click', () => {
    spin();
    say(rand(pokeLines), 'cheer', { revert: 2000 });
  });

  function onMove(e) {
    if (!el.isConnected) return;
    const r = svg.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height * .4);
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 220);
    svg.style.setProperty('--px', (dx / d * k * 4).toFixed(2));
    svg.style.setProperty('--py', (dy / d * k * 4).toFixed(2));
  }
  addEventListener('pointermove', onMove, { passive: true });

  (async function idle() {
    while (!dead) {
      await sleep(rand([3500, 5000, 6500]));
      if (dead || !el.isConnected) continue;
      const pick = rand(['ear-twitch', 'tail-fast', 'hop']);
      flash(pick, 800);
    }
  })();

  return {
    el,
    svg,
    say,
    setMood,
    spin,
    wave(ms = 1800) { flash('wave', ms); },
    hop() { flash('hop', 700); },
    destroy() {
      dead = true;
      typeId++;
      clearTimeout(revertT);
      removeEventListener('pointermove', onMove);
      el.remove();
    }
  };
}





const SQUIRREL_SVG = `
<svg class="squirrel" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
  <ellipse cx="100" cy="222" rx="58" ry="6" fill="#000" opacity=".25"/>
  <g class="all">
    <!-- Ogromny puszysty ogon wiewiórki z tyłu -->
    <g class="tail">
      <path d="M130 195 C 220 210, 230 100, 185 55 C 160 25, 125 35, 120 55 C 115 75, 145 95, 160 120 C 175 145, 165 185, 130 195 Z" fill="#d35400"/>
      <path d="M140 180 C 205 195, 210 110, 175 70 C 158 48, 136 52, 132 65 C 128 80, 150 100, 160 125 C 170 148, 160 172, 140 180 Z" fill="#e67e22"/>
      <path d="M148 165 C 190 175, 195 120, 170 85 C 155 70, 145 80, 150 95 C 155 115, 150 145, 148 165 Z" fill="#fdf2e9" opacity=".4"/>
    </g>
    <!-- Ciało wiewiórki -->
    <g class="body">
      <ellipse cx="100" cy="168" rx="50" ry="46" fill="#d35400"/>
      <ellipse cx="100" cy="174" rx="28" ry="32" fill="#fdf2e9"/>
    </g>
    <!-- Trzymany żołądź -->
    <g class="acorn" transform="translate(85, 158)">
      <ellipse cx="15" cy="16" rx="14" ry="17" fill="#d4ac0d"/>
      <path d="M1 9 Q 15 -2 29 9 L 27 12 Q 15 3 3 12 Z" fill="#6e2c00"/>
      <rect x="13" y="-5" width="4" height="6" rx="2" fill="#4a235a"/>
    </g>
    <!-- Łapki trzymające orzeszek -->
    <path class="arm arm-l" d="M66 156 q12 8 20 12" stroke="#d35400" stroke-width="14" stroke-linecap="round" fill="none"/>
    <path class="arm arm-r" d="M134 156 q-12 8 -20 12" stroke="#d35400" stroke-width="14" stroke-linecap="round" fill="none"/>
    <ellipse cx="74" cy="214" rx="18" ry="9" fill="#ba4a00"/>
    <ellipse cx="126" cy="214" rx="18" ry="9" fill="#ba4a00"/>
    <!-- Głowa wiewiórki -->
    <g class="head">
      <!-- Pędzelkowate uszka -->
      <g class="ear ear-l">
        <path d="M46 70 L34 18 L78 46 Z" fill="#d35400"/>
        <path d="M42 22 L34 18 L32 10 L44 14 Z" fill="#ba4a00"/>
        <path d="M50 62 L42 28 L70 46 Z" fill="#f5b7b1"/>
      </g>
      <g class="ear ear-r">
        <path d="M154 70 L166 18 L122 46 Z" fill="#d35400"/>
        <path d="M158 22 L166 18 L168 10 L156 14 Z" fill="#ba4a00"/>
        <path d="M150 62 L158 28 L130 46 Z" fill="#f5b7b1"/>
      </g>
      <!-- Policzki i pyszczek -->
      <ellipse cx="100" cy="94" rx="58" ry="48" fill="#d35400"/>
      <!-- Puszyste jasne policzki -->
      <circle cx="68" cy="106" r="24" fill="#fdf2e9"/>
      <circle cx="132" cy="106" r="24" fill="#fdf2e9"/>
      <ellipse cx="100" cy="112" rx="18" ry="14" fill="#fdf2e9"/>
      <circle cx="60" cy="108" r="9" fill="#ff708f" opacity=".65"/>
      <circle cx="140" cy="108" r="9" fill="#ff708f" opacity=".65"/>
      <!-- Oczy w bezpiecznych slotach -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
      </g>
      <g class="eyes-closed" fill="none" stroke="#2b1b17" stroke-width="5" stroke-linecap="round">
        <path d="M64 94 Q76 78 88 94"/>
        <path d="M112 94 Q124 78 136 94"/>
      </g>
      <!-- Nosek i ząbki / uśmiech -->
      <polygon points="95,104 105,104 100,109" fill="#2b1b17"/>
      <!-- Ząbek wiewiórki -->
      <rect x="97" y="114" width="6" height="5" rx="1" fill="#fff" stroke="#2b1b17" stroke-width="1"/>
      <path class="mouth m-smile" d="M100 110 q-8 7 -14 2 M100 110 q8 7 14 2" stroke="#2b1b17" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="mouth m-open" d="M88 113 q12 18 24 0 z" fill="#2b1b17"/>
      <path class="mouth m-sad" d="M88 122 q12 -12 24 0" stroke="#2b1b17" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="tear" d="M62 106 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
    </g>
  </g>
</svg>`;

const SQUIRREL_POKE = [
  'Cześć! Jestem Wiewiórka Basia 🐿️ Łączę myśli jak żołędzie w łańcuch!',
  'Im bardziej szalona akcja między dwoma rzeczami, tym trwalej zapamiętasz! 💥',
  'Wyobraź sobie, że parasol wystrzeliwuje w niebo jak rakieta! Widzisz to? 🚀',
  'Jeden element pociąga za sobą kolejny – efekt domina w Twojej pamięci! 🔗',
  'Chrup, chrup! Każde żywe skojarzenie to kolejny orzeszek na zimę! 🌰',
  'Skaczę po gałęziach wyobraźni! Lista 20 zakupów to dla nas pestka! ✨'
];

function createSquirrel({ size = 'md', pokeLines = SQUIRREL_POKE } = {}) {
  const figure = h('button', {
    class: 'squirrel-figure',
    type: 'button',
    'aria-label': 'Wiewiórka Basia – kliknij, żeby pogłaskać',
    html: SQUIRREL_SVG
  });
  const svg = figure.querySelector('svg');
  const text = h('span', { class: 'bubble-text' });
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
  const bubble = h('div', { class: 'bubble' }, text, live);
  const el = h('div', { class: `squirrel-wrap squirrel-${size}` }, figure, bubble);

  let typeId = 0, revertT, dead = false;

  function setMood(m, revertMs = 0) {
    svg.dataset.mood = m;
    clearTimeout(revertT);
    if (revertMs) revertT = setTimeout(() => { svg.dataset.mood = 'happy'; }, revertMs);
  }

  async function say(msg, mood = 'happy', { revert = 0, speed = 14 } = {}) {
    const id = ++typeId;
    setMood(mood, revert);
    bubble.classList.add('show');
    const finalMsg = typeof t === "function" ? t(msg) : msg;
    live.textContent = finalMsg;
    text.textContent = "";
    for (let i = 1; i <= finalMsg.length; i++) {
      if (id !== typeId) return;
      text.textContent = finalMsg.slice(0, i);
      if (i % 3 === 0) sfx.purr();
      await sleep(speed);
    }
    if (revert) {
      clearTimeout(revertT);
      revertT = setTimeout(() => {
        if (id === typeId) {
          bubble.classList.remove('show');
          svg.dataset.mood = 'happy';
        }
      }, revert);
    }
  }

  function hideBubble() {
    typeId++;
    bubble.classList.remove('show');
  }

  function poke() {
    sfx.meow();
    setMood('cheer', 1500);
    const line = pokeLines[rand(0, pokeLines.length - 1)];
    say(line, 'cheer', { revert: 3200 });
  }
  figure.addEventListener('click', poke);

  function lookAt(x, y) {
    if (svg.dataset.mood === 'sleep') return;
    const r = figure.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.4;
    const dx = Math.max(-1, Math.min(1, (x - cx) / (window.innerWidth / 2 || 1)));
    const dy = Math.max(-1, Math.min(1, (y - cy) / (window.innerHeight / 2 || 1)));
    const pupils = figure.querySelectorAll('.pupil');
    pupils.forEach(p => {
      p.setAttribute('transform', `translate(${(dx * 4).toFixed(1)} ${(dy * 3).toFixed(1)})`);
    });
  }

  const onMove = e => lookAt(e.clientX, e.clientY);
  window.addEventListener('pointermove', onMove, { passive: true });

  return {
    el,
    svg,
    setMood,
    say,
    hideBubble,
    poke,
    lookAt,
    destroy() {
      dead = true;
      clearTimeout(revertT);
      window.removeEventListener('pointermove', onMove);
    }
  };
}

function createSquirrelAvatar(mood = 'happy', size = 56) {
  const wrap = h('div', {
    class: 'squirrel-avatar',
    style: `width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;`,
    html: SQUIRREL_SVG
  });
  const svg = wrap.querySelector('svg');
  svg.dataset.mood = mood;
  return wrap;
}





const TURTLE_SVG = `
<svg class="turtle" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
  <ellipse cx="100" cy="222" rx="58" ry="6" fill="#000" opacity=".25"/>
  <g class="all">
    <!-- Płetwy / łapki tylne -->
    <ellipse cx="50" cy="195" rx="20" ry="12" fill="#229954" transform="rotate(-20 50 195)"/>
    <ellipse cx="150" cy="195" rx="20" ry="12" fill="#229954" transform="rotate(20 150 195)"/>
    <ellipse cx="40" cy="197" rx="4" ry="3" fill="#145a32"/>
    <ellipse cx="160" cy="197" rx="4" ry="3" fill="#145a32"/>

    <!-- Skorupa żółwia z motywem zegara -->
    <g class="shell">
      <!-- Główny pancerz -->
      <ellipse cx="100" cy="165" rx="64" ry="52" fill="#196f3d"/>
      <ellipse cx="100" cy="165" rx="56" ry="44" fill="#27ae60"/>
      <!-- Tarcza zegarowa na skorupie -->
      <circle cx="100" cy="165" r="34" fill="#fcf3cf" stroke="#b7950b" stroke-width="3"/>
      <!-- Oznaczenia godzin 12, 3, 6, 9 -->
      <rect x="99" y="135" width="2" height="6" fill="#7d6608"/>
      <rect x="99" y="189" width="2" height="6" fill="#7d6608"/>
      <rect x="70" y="164" width="6" height="2" fill="#7d6608"/>
      <rect x="124" y="164" width="6" height="2" fill="#7d6608"/>
      <!-- Wskazówki zegara -->
      <line x1="100" y1="165" x2="100" y2="145" stroke="#7d6608" stroke-width="3" stroke-linecap="round"/>
      <line x1="100" y1="165" x2="116" y2="165" stroke="#9a7d0a" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="100" cy="165" r="3.5" fill="#d4ac0d"/>
      <!-- Płytki skorupy dookoła tarczy -->
      <path d="M50 150 Q70 142 80 152" stroke="#196f3d" stroke-width="2.5" fill="none"/>
      <path d="M150 150 Q130 142 120 152" stroke="#196f3d" stroke-width="2.5" fill="none"/>
      <path d="M52 180 Q70 186 82 178" stroke="#196f3d" stroke-width="2.5" fill="none"/>
      <path d="M148 180 Q130 186 118 178" stroke="#196f3d" stroke-width="2.5" fill="none"/>
    </g>

    <!-- Płetwy / łapki przednie machające -->
    <path class="arm arm-l" d="M46 142 q-22 18 -10 38" stroke="#2ecc71" stroke-width="16" stroke-linecap="round" fill="none"/>
    <path class="arm arm-r" d="M154 142 q22 18 10 38" stroke="#2ecc71" stroke-width="16" stroke-linecap="round" fill="none"/>
    <ellipse cx="78" cy="216" rx="15" ry="8" fill="#1e8449"/>
    <ellipse cx="122" cy="216" rx="15" ry="8" fill="#1e8449"/>

    <!-- Głowa żółwika -->
    <g class="head">
      <ellipse cx="100" cy="92" rx="54" ry="46" fill="#2ecc71"/>
      <ellipse cx="100" cy="106" rx="36" ry="24" fill="#a9dfbf" opacity=".6"/>
      <!-- Różowe policzki -->
      <circle cx="66" cy="104" r="9" fill="#ff708f" opacity=".6"/>
      <circle cx="134" cy="104" r="9" fill="#ff708f" opacity=".6"/>
      <!-- Mały kapelusik lub czapeczka studencka z cyferblatem -->
      <ellipse cx="100" cy="50" rx="18" ry="4" fill="#d4ac0d"/>
      <path d="M92 49 L94 38 L106 38 L108 49 Z" fill="#b7950b"/>
      <circle cx="100" cy="38" r="3" fill="#f9e79f"/>

      <!-- Oczy w bezpiecznych slotach -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#145a32"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#145a32"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
      </g>
      <g class="eyes-closed" fill="none" stroke="#145a32" stroke-width="5" stroke-linecap="round">
        <path d="M64 94 Q76 78 88 94"/>
        <path d="M112 94 Q124 78 136 94"/>
      </g>
      <!-- Nozdrza i uśmiech -->
      <circle cx="96" cy="105" r="1.5" fill="#145a32"/>
      <circle cx="104" cy="105" r="1.5" fill="#145a32"/>
      <path class="mouth m-smile" d="M100 110 q-9 8 -16 2 M100 110 q9 8 16 2" stroke="#145a32" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="mouth m-open" d="M88 112 q12 18 24 0 z" fill="#145a32"/>
      <path class="mouth m-sad" d="M88 120 q12 -12 24 0" stroke="#145a32" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="tear" d="M62 104 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
    </g>
  </g>
</svg>`;

const TURTLE_POKE = [
  'Tik-tak! Jestem Żółwik Zegarowy 🐢 Znam dzień tygodnia każdej daty w historii!',
  'Nie spiesz się! Kalendarz to tylko prosty rytm: 4.04, 6.06, 8.08, 10.10, 12.12! ⏱️',
  'Nawet żółw potrafi obliczyć dzień tygodnia w 3 sekundy. Nauczę Cię tego krok po kroku! ⏳',
  'Dzień Sądu (Doomsday) brzmi groźnie, ale to po prostu nasza niezawodna kotwica w czasie! ⚓',
  'Pamięć i czas to najlepsi przyjaciele! Sprawdźmy dowolny rok i dzień! 📅',
  'Spokojnie, precyzyjnie i bez stresu – Twój mózg to najdokładniejszy zegar! 🕰️'
];

function createTurtle({ size = 'md', pokeLines = TURTLE_POKE } = {}) {
  const figure = h('button', {
    class: 'turtle-figure',
    type: 'button',
    'aria-label': 'Żółwik Zegarowy – kliknij, żeby pogłaskać',
    html: TURTLE_SVG
  });
  const svg = figure.querySelector('svg');
  const text = h('span', { class: 'bubble-text' });
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
  const bubble = h('div', { class: 'bubble' }, text, live);
  const el = h('div', { class: `turtle-wrap turtle-${size}` }, figure, bubble);

  let typeId = 0, revertT, dead = false;

  function setMood(m, revertMs = 0) {
    svg.dataset.mood = m;
    clearTimeout(revertT);
    if (revertMs) revertT = setTimeout(() => { svg.dataset.mood = 'happy'; }, revertMs);
  }

  async function say(msg, mood = 'happy', { revert = 0, speed = 14 } = {}) {
    const id = ++typeId;
    setMood(mood, revert);
    bubble.classList.add('show');
    const finalMsg = typeof t === "function" ? t(msg) : msg;
    live.textContent = finalMsg;
    text.textContent = "";
    for (let i = 1; i <= finalMsg.length; i++) {
      if (id !== typeId) return;
      text.textContent = finalMsg.slice(0, i);
      if (i % 3 === 0) sfx.purr();
      await sleep(speed);
    }
    if (revert) {
      clearTimeout(revertT);
      revertT = setTimeout(() => {
        if (id === typeId) {
          bubble.classList.remove('show');
          svg.dataset.mood = 'happy';
        }
      }, revert);
    }
  }

  function hideBubble() {
    typeId++;
    bubble.classList.remove('show');
  }

  function poke() {
    sfx.meow();
    setMood('cheer', 1500);
    const line = pokeLines[rand(0, pokeLines.length - 1)];
    say(line, 'cheer', { revert: 3200 });
  }
  figure.addEventListener('click', poke);

  function lookAt(x, y) {
    if (svg.dataset.mood === 'sleep') return;
    const r = figure.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.4;
    const dx = Math.max(-1, Math.min(1, (x - cx) / (window.innerWidth / 2 || 1)));
    const dy = Math.max(-1, Math.min(1, (y - cy) / (window.innerHeight / 2 || 1)));
    const pupils = figure.querySelectorAll('.pupil');
    pupils.forEach(p => {
      p.setAttribute('transform', `translate(${(dx * 4).toFixed(1)} ${(dy * 3).toFixed(1)})`);
    });
  }

  const onMove = e => lookAt(e.clientX, e.clientY);
  window.addEventListener('pointermove', onMove, { passive: true });

  return {
    el,
    svg,
    setMood,
    say,
    hideBubble,
    poke,
    lookAt,
    destroy() {
      dead = true;
      clearTimeout(revertT);
      window.removeEventListener('pointermove', onMove);
    }
  };
}

function createTurtleAvatar(mood = 'happy', size = 56) {
  const wrap = h('div', {
    class: 'turtle-avatar',
    style: `width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;`,
    html: TURTLE_SVG
  });
  const svg = wrap.querySelector('svg');
  svg.dataset.mood = mood;
  return wrap;
}





const DOG_SVG = `
<svg class="dog" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
  <defs>
    <radialGradient id="dog-patch-g" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </radialGradient>
    <linearGradient id="dog-coat-g" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fbb040"/>
      <stop offset="60%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="dog-ear-g" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#92400e"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="dog-medal-g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>

  <!-- Miękki cień pod pieskiem -->
  <ellipse cx="100" cy="222" rx="58" ry="6" fill="#000" opacity=".22"/>

  <g class="all">
    <!-- Wesoły, merdający ogonek z puszystym jasnym pędzelkiem -->
    <g class="tail">
      <path d="M140 188 C 192 198, 212 126, 172 96" stroke="url(#dog-coat-g)" stroke-width="20" fill="none" stroke-linecap="round"/>
      <path d="M172 96 C 165 90, 156 85, 148 82" stroke="#fff8ee" stroke-width="16" fill="none" stroke-linecap="round"/>
    </g>

    <!-- Ciało pieska -->
    <g class="body">
      <ellipse cx="100" cy="170" rx="52" ry="48" fill="url(#dog-coat-g)"/>
      <!-- Puszysty jasny brzuszek -->
      <ellipse cx="100" cy="178" rx="30" ry="34" fill="#fff8ee"/>
      <!-- Urocza plamka/łatka na boku -->
      <ellipse cx="132" cy="160" rx="14" ry="18" fill="url(#dog-patch-g)" opacity=".85"/>
    </g>

    <!-- Przednie łapki oparte z boku -->
    <path class="arm arm-l" d="M62 152 Q48 174 58 196" stroke="url(#dog-coat-g)" stroke-width="17" stroke-linecap="round" fill="none"/>
    <path class="arm arm-r" d="M138 152 Q152 174 142 196" stroke="url(#dog-coat-g)" stroke-width="17" stroke-linecap="round" fill="none"/>

    <!-- Tylne łapki z uroczymi poduszeczkami (paw pads) -->
    <ellipse cx="76" cy="214" rx="17" ry="10" fill="#b45309"/>
    <ellipse cx="124" cy="214" rx="17" ry="10" fill="#b45309"/>
    <ellipse cx="76" cy="213" rx="8" ry="5.5" fill="#fef3c7"/>
    <ellipse cx="124" cy="213" rx="8" ry="5.5" fill="#fef3c7"/>
    <circle cx="70" cy="207" r="2.2" fill="#fef3c7"/>
    <circle cx="76" cy="205" r="2.2" fill="#fef3c7"/>
    <circle cx="82" cy="207" r="2.2" fill="#fef3c7"/>
    <circle cx="118" cy="207" r="2.2" fill="#fef3c7"/>
    <circle cx="124" cy="205" r="2.2" fill="#fef3c7"/>
    <circle cx="130" cy="207" r="2.2" fill="#fef3c7"/>

    <!-- Czerwona elegancka obróżka z medalionem Tropiciela -->
    <path d="M66 135 Q 100 150 134 135" stroke="#ef4444" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M68 135 Q 100 150 132 135" stroke="#dc2626" stroke-width="4" fill="none" stroke-linecap="round"/>
    <!-- Złoty medalion tropiciela z odciskiem łapki -->
    <g transform="translate(100 146)">
      <circle cx="0" cy="0" r="9" fill="url(#dog-medal-g)" stroke="#b45309" stroke-width="1.8"/>
      <ellipse cx="0" cy="1.2" rx="3.5" ry="2.6" fill="#78350f"/>
      <circle cx="-3" cy="-2.2" r="1.1" fill="#78350f"/>
      <circle cx="0" cy="-3.6" r="1.1" fill="#78350f"/>
      <circle cx="3" cy="-2.2" r="1.1" fill="#78350f"/>
      <circle cx="-2.5" cy="-2.5" r="1" fill="#ffffff" opacity=".65"/>
    </g>

    <!-- Głowa pieska -->
    <g class="head">
      <!-- Oklapnięte, puszyste uszka z naturalnym zaokrągleniem -->
      <g class="ear ear-l">
        <path d="M52 56 C 18 62, 14 122, 44 126 C 60 128, 66 94, 62 60 Z" fill="url(#dog-ear-g)"/>
        <path d="M46 68 C 26 78, 24 114, 44 118 C 50 119, 54 100, 52 76 Z" fill="#f87171" opacity=".4"/>
      </g>
      <g class="ear ear-r">
        <path d="M148 56 C 182 62, 186 122, 156 126 C 140 128, 134 94, 138 60 Z" fill="url(#dog-ear-g)"/>
        <path d="M154 68 C 174 78, 176 114, 156 118 C 150 119, 146 100, 148 76 Z" fill="#f87171" opacity=".4"/>
      </g>

      <!-- Kształt główki z puchatymi policzkami -->
      <ellipse cx="100" cy="92" rx="59" ry="49" fill="url(#dog-coat-g)"/>

      <!-- Kosmyk / czuprynka na czubku główki -->
      <path d="M96 44 C 94 36, 102 33, 104 38 C 107 33, 114 36, 110 44 Z" fill="url(#dog-coat-g)"/>

      <!-- Ciemniejsza łatka wokół lewego oka -->
      <path d="M53 82 C 50 58, 93 54, 93 83 C 93 106, 55 106, 53 82 Z" fill="url(#dog-patch-g)"/>

      <!-- Kremowy pyszczek (podwójna miękka poduszka) -->
      <ellipse cx="88" cy="108" rx="19" ry="15" fill="#fff8ee"/>
      <ellipse cx="112" cy="108" rx="19" ry="15" fill="#fff8ee"/>
      <ellipse cx="100" cy="113" rx="17" ry="13" fill="#fff8ee"/>

      <!-- Kropeczki wąsików na pyszczku -->
      <circle cx="78" cy="109" r="1.3" fill="#92400e" opacity=".7"/>
      <circle cx="82" cy="112" r="1.3" fill="#92400e" opacity=".7"/>
      <circle cx="77" cy="115" r="1.3" fill="#92400e" opacity=".7"/>
      <circle cx="122" cy="109" r="1.3" fill="#92400e" opacity=".7"/>
      <circle cx="118" cy="112" r="1.3" fill="#92400e" opacity=".7"/>
      <circle cx="123" cy="115" r="1.3" fill="#92400e" opacity=".7"/>

      <!-- Zaróżowione rumieńce -->
      <circle cx="62" cy="107" r="9" fill="#ff4d6d" opacity=".45"/>
      <circle cx="138" cy="107" r="9" fill="#ff4d6d" opacity=".45"/>

      <!-- Bezpieczne sloty oczu -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#201526"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#201526"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
      </g>

      <!-- Oczy zamknięte (mruganie / radość) -->
      <g class="eyes-closed" fill="none" stroke="#201526" stroke-width="5" stroke-linecap="round">
        <path d="M64 94 Q76 80 88 94"/>
        <path d="M112 94 Q124 80 136 94"/>
      </g>

      <!-- Błyszczący nosek trufelka z odblaskami światła -->
      <path d="M91 100 C 91 95, 109 95, 109 100 C 109 108, 91 108, 91 100 Z" fill="#1e1b4b"/>
      <ellipse cx="96" cy="98.5" rx="3" ry="1.4" fill="#ffffff" opacity=".85"/>
      <circle cx="103" cy="100" r="1" fill="#ffffff" opacity=".5"/>

      <!-- Wywieszony wesoły języczek z bruzdą -->
      <g class="tongue">
        <path d="M95 116 C 94 130, 106 130, 105 116 Z" fill="#fb7185" stroke="#e11d48" stroke-width="1.5"/>
        <line x1="100" y1="117" x2="100" y2="126" stroke="#e11d48" stroke-width="1.3" stroke-linecap="round"/>
      </g>

      <!-- Uśmiech pieska -->
      <path class="mouth m-smile" d="M100 108 L100 114 M100 114 Q91 122 83 115 M100 114 Q109 122 117 115" stroke="#201526" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path class="mouth m-open" d="M87 114 q13 22 26 0 z" fill="#201526"/>
      <path class="mouth m-sad" d="M87 124 q13 -14 26 0" stroke="#201526" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path class="tear" d="M62 106 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
    </g>
  </g>
</svg>`;

const DOG_POKE = [
  'Hau, hau! Jestem Piesek Łatek 🐶 Złapię każdy trop pamięciowy!',
  'Wystarczy pierwsza literka, a całe słowo samo wskakuje do głowy! 🐾',
  'Moje oklapnięte uszka nasłuchują nowych wierszyków i skrótów! ✨',
  '„Moja Wiecznie Zapracowana Mama...” – znasz już planety na pamięć? 🪐',
  'Merdam ogonkiem z radości! Twój mózg tropi wiedzę jak prawdziwy detektyw! 🦴',
  'Pierwsze litery to najwygodniejsze haczyki pamięciowe na świecie! 🎯'
];

function createDog({ size = 'md', pokeLines = DOG_POKE } = {}) {
  const figure = h('button', {
    class: 'dog-figure',
    type: 'button',
    'aria-label': 'Piesek Łatek – kliknij, żeby pogłaskać',
    html: DOG_SVG
  });
  const svg = figure.querySelector('svg');
  const text = h('span', { class: 'bubble-text' });
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
  const bubble = h('div', { class: 'bubble' }, text, live);
  const el = h('div', { class: `dog-wrap dog-${size}` }, figure, bubble);

  let typeId = 0, revertT, dead = false;

  function setMood(m, revertMs = 0) {
    svg.dataset.mood = m;
    clearTimeout(revertT);
    if (revertMs) revertT = setTimeout(() => { svg.dataset.mood = 'happy'; }, revertMs);
  }

  async function say(msg, mood = 'happy', { revert = 0, speed = 14 } = {}) {
    const id = ++typeId;
    setMood(mood, revert);
    bubble.classList.add('show');
    const finalMsg = typeof t === "function" ? t(msg) : msg;
    live.textContent = finalMsg;
    text.textContent = "";
    for (let i = 1; i <= finalMsg.length; i++) {
      if (id !== typeId) return;
      text.textContent = finalMsg.slice(0, i);
      await sleep(speed);
    }
  }

  function flash(cls, ms) {
    svg.classList.add(cls);
    setTimeout(() => svg.classList.remove(cls), ms);
  }

  function spin() {
    figure.classList.remove('spin'); void figure.offsetWidth;
    figure.classList.add('spin');
    sfx.pop?.();
  }

  figure.addEventListener('click', () => {
    spin();
    say(rand(pokeLines), 'cheer', { revert: 2000 });
  });

  function onMove(e) {
    if (!el.isConnected) return;
    const r = svg.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height * .4);
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 220);
    svg.style.setProperty('--px', (dx / d * k * 4).toFixed(2));
    svg.style.setProperty('--py', (dy / d * k * 4).toFixed(2));
  }
  addEventListener('pointermove', onMove, { passive: true });

  (async function idle() {
    while (!dead) {
      await sleep(rand([3500, 5000, 6500]));
      if (dead || !el.isConnected) continue;
      const pick = rand(['ear-twitch', 'tail-fast', 'hop']);
      flash(pick, 800);
    }
  })();

  return {
    el,
    svg,
    say,
    setMood,
    spin,
    wave(ms = 1800) { flash('wave', ms); },
    hop() { flash('hop', 700); },
    destroy() {
      dead = true;
      typeId++;
      clearTimeout(revertT);
      removeEventListener('pointermove', onMove);
      el.remove();
    }
  };
}





const OCTOPUS_SVG = `
<svg class="octopus" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
  <defs>
    <radialGradient id="octo-head-g" cx="42%" cy="38%" r="65%">
      <stop offset="0%" stop-color="#f472b6"/>
      <stop offset="50%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#7e22ce"/>
    </radialGradient>
    <linearGradient id="octo-tentacle-g" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#6b21a8"/>
    </linearGradient>
    <linearGradient id="octo-beret-g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2dd4bf"/>
      <stop offset="100%" stop-color="#0f766e"/>
    </linearGradient>
  </defs>

  <!-- Miękki cień pod ośmiornicą -->
  <ellipse cx="100" cy="222" rx="58" ry="6" fill="#000" opacity=".22"/>

  <g class="all">
    <!-- 8 Macków Ośmiornicy Inki (promieniście jak gałęzie mapy myśli) -->
    <g class="tentacles">
      <!-- Tylne macki (ciemniejsze, rozłożone promieniście) -->
      <g class="tentacles-back" stroke="url(#octo-tentacle-g)" stroke-width="14" fill="none" stroke-linecap="round">
        <path class="tentacle-back-1" d="M68 135 C 32 145, 16 175, 24 204 C 28 216, 42 216, 48 206 C 52 198, 48 186, 62 172"/>
        <path class="tentacle-back-2" d="M132 135 C 168 145, 184 175, 176 204 C 172 216, 158 216, 152 206 C 148 198, 152 186, 138 172"/>
        <path class="tentacle-back-3" d="M60 120 C 18 118, 12 152, 28 168 C 40 178, 54 164, 52 152"/>
        <path class="tentacle-back-4" d="M140 120 C 182 118, 188 152, 172 168 C 160 178, 146 164, 148 152"/>
      </g>

      <!-- Pędzel artystki myśli w prawej macce -->
      <g class="octo-brush" transform="translate(162 138) rotate(35)">
        <rect x="-3" y="-18" width="6" height="32" rx="2" fill="#d97706"/>
        <path d="M-4 14 L0 26 L4 14 Z" fill="#7e22ce"/>
        <circle cx="0" cy="25" r="2.5" fill="#f43f5e"/>
      </g>

      <!-- Przednie macki z widocznymi przyssawkami -->
      <g class="tentacles-front">
        <path class="tentacle-front-1" d="M72 138 C 50 162, 45 196, 62 215 C 72 224, 84 212, 78 200 C 74 190, 80 180, 84 160" stroke="url(#octo-head-g)" stroke-width="15" fill="none" stroke-linecap="round"/>
        <circle cx="53" cy="180" r="3.2" fill="#fbcfe8"/>
        <circle cx="56" cy="198" r="3.2" fill="#fbcfe8"/>
        <circle cx="68" cy="212" r="3.2" fill="#fbcfe8"/>

        <path class="tentacle-front-2" d="M128 138 C 150 162, 155 196, 138 215 C 128 224, 116 212, 122 200 C 126 190, 120 180, 116 160" stroke="url(#octo-head-g)" stroke-width="15" fill="none" stroke-linecap="round"/>
        <circle cx="147" cy="180" r="3.2" fill="#fbcfe8"/>
        <circle cx="144" cy="198" r="3.2" fill="#fbcfe8"/>
        <circle cx="132" cy="212" r="3.2" fill="#fbcfe8"/>

        <path class="tentacle-front-3" d="M86 142 C 78 174, 86 205, 96 216 C 104 225, 108 214, 102 202 C 98 192, 94 175, 96 155" stroke="url(#octo-head-g)" stroke-width="14" fill="none" stroke-linecap="round"/>
        <circle cx="82" cy="185" r="2.8" fill="#fbcfe8"/>
        <circle cx="88" cy="204" r="2.8" fill="#fbcfe8"/>

        <path class="tentacle-front-4" d="M114 142 C 122 174, 114 205, 104 216 C 96 225, 92 214, 98 202 C 102 192, 106 175, 104 155" stroke="url(#octo-head-g)" stroke-width="14" fill="none" stroke-linecap="round"/>
        <circle cx="118" cy="185" r="2.8" fill="#fbcfe8"/>
        <circle cx="112" cy="204" r="2.8" fill="#fbcfe8"/>
      </g>
    </g>

    <!-- Głowa / kopuła ośmiorniczki -->
    <g class="head">
      <ellipse cx="100" cy="88" rx="58" ry="52" fill="url(#octo-head-g)"/>
      <ellipse cx="100" cy="120" rx="46" ry="24" fill="url(#octo-head-g)"/>

      <!-- Błysk światła na czubku głowy -->
      <ellipse cx="76" cy="54" rx="14" ry="7" fill="#ffffff" opacity=".35" transform="rotate(-25 76 54)"/>
      <circle cx="94" cy="50" r="3" fill="#ffffff" opacity=".4"/>

      <!-- Turkusowy beret artystki myśli -->
      <g class="beret" transform="translate(100 42) rotate(-14)">
        <ellipse cx="0" cy="0" rx="34" ry="14" fill="url(#octo-beret-g)"/>
        <ellipse cx="0" cy="2" rx="36" ry="5" fill="#0d9488"/>
        <circle cx="0" cy="-14" r="3.5" fill="#fef08a"/>
        <line x1="0" y1="-14" x2="0" y2="-6" stroke="#fef08a" stroke-width="2"/>
      </g>

      <!-- Zaróżowione rumieńce -->
      <circle cx="62" cy="107" r="9" fill="#ff4d6d" opacity=".5"/>
      <circle cx="138" cy="107" r="9" fill="#ff4d6d" opacity=".5"/>

      <!-- Bezpieczne standardowe sloty oczu -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#201526"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#201526"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
      </g>

      <!-- Oczy zamknięte (mruganie / radość) -->
      <g class="eyes-closed" fill="none" stroke="#201526" stroke-width="5" stroke-linecap="round">
        <path d="M64 94 Q76 80 88 94"/>
        <path d="M112 94 Q124 80 136 94"/>
      </g>

      <!-- Uśmieszek Inki -->
      <path class="mouth m-smile" d="M92 112 Q100 121 108 112" stroke="#201526" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path class="mouth m-open" d="M89 112 q11 18 22 0 z" fill="#201526"/>
      <path class="mouth m-sad" d="M89 122 q11 -12 22 0" stroke="#201526" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path class="tear" d="M62 106 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
    </g>
  </g>
</svg>`;

const OCTOPUS_POKE = [
  'Plusk! Jestem Ośmiornica Inka 🐙 Moje 8 macek ogarnia każdy chaos!',
  'Zapomnij o nudnych notatkach linijka po linijce – narysujmy myśl promieniście! 💡',
  'Głowa to temat główny, a macki to gałęzie wiedzy! Proste i genialne, prawda? 🎨',
  'Mój atrament nigdy nie wysycha! Każda gałąź z osobnym kolorem to +50% do pamięci! ✨',
  'Jedno słowo-klucz i mały symbol wystarczą, by zapamiętać cały wykład! 🧠',
  'Twój mózg uwielbia rozgałęzienia tak samo jak ja pływanie w rafie koralowej! 🌊'
];

function createOctopus({ size = 'md', pokeLines = OCTOPUS_POKE } = {}) {
  const figure = h('button', {
    class: 'octopus-figure',
    type: 'button',
    'aria-label': 'Ośmiornica Inka – kliknij, żeby pogłaskać',
    html: OCTOPUS_SVG
  });
  const svg = figure.querySelector('svg');
  const text = h('span', { class: 'bubble-text' });
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
  const bubble = h('div', { class: 'bubble' }, text, live);
  const el = h('div', { class: `octopus-wrap octopus-${size}` }, figure, bubble);

  let typeId = 0, revertT, dead = false;

  function setMood(m, revertMs = 0) {
    svg.dataset.mood = m;
    clearTimeout(revertT);
    if (revertMs) revertT = setTimeout(() => { svg.dataset.mood = 'happy'; }, revertMs);
  }

  async function say(msg, mood = 'happy', { revert = 0, speed = 14 } = {}) {
    const id = ++typeId;
    setMood(mood, revert);
    bubble.classList.add('show');
    const finalMsg = typeof t === "function" ? t(msg) : msg;
    live.textContent = finalMsg;
    text.textContent = "";
    for (let i = 1; i <= finalMsg.length; i++) {
      if (id !== typeId) return;
      text.textContent = finalMsg.slice(0, i);
      await sleep(speed);
    }
  }

  function flash(cls, ms) {
    svg.classList.add(cls);
    setTimeout(() => svg.classList.remove(cls), ms);
  }

  function spin() {
    figure.classList.remove('spin'); void figure.offsetWidth;
    figure.classList.add('spin');
    sfx.pop?.();
  }

  figure.addEventListener('click', () => {
    spin();
    say(rand(pokeLines), 'cheer', { revert: 2000 });
  });

  function onMove(e) {
    if (!el.isConnected) return;
    const r = svg.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height * .4);
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 220);
    svg.style.setProperty('--px', (dx / d * k * 4).toFixed(2));
    svg.style.setProperty('--py', (dy / d * k * 4).toFixed(2));
  }
  addEventListener('pointermove', onMove, { passive: true });

  (async function idle() {
    while (!dead) {
      await sleep(rand([3500, 5000, 6500]));
      if (dead || !el.isConnected) continue;
      const pick = rand(['tentacle-wave', 'hop']);
      flash(pick, 800);
    }
  })();

  return {
    el,
    svg,
    say,
    setMood,
    spin,
    wave(ms = 1800) { flash('wave', ms); },
    hop() { flash('hop', 700); },
    destroy() {
      dead = true;
      typeId++;
      clearTimeout(revertT);
      removeEventListener('pointermove', onMove);
      el.remove();
    }
  };
}



  /* --- NAMES GAME MODULE --- */
  const namesGame = (function() {
    const FACES = [
  {
    id: 'f1',
    name: 'Marek',
    feature: 'Wielkie okrągłe okulary w złotej oprawce',
    hook: 'Marek ma MARKER i maluje nim wielkie okulary!',
    job: 'Architekt',
    color: '#3498db',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="m-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fed7aa"/><stop offset="100%" stop-color="#fbcfe8"/></linearGradient>
        <linearGradient id="m-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#d97706"/></linearGradient>
        <linearGradient id="m-hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#451a03"/><stop offset="100%" stop-color="#1e1b4b"/></linearGradient>
      </defs>
      <!-- Ramiona / koszula architekta -->
      <path d="M22 96 C22 80 32 76 50 76 C68 76 78 80 78 96 Z" fill="#3b82f6"/>
      <path d="M42 76 L50 86 L58 76 Z" fill="#ffffff"/>
      <path d="M46 76 L50 82 L54 76 Z" fill="#93c5fd"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v14 h-16 z" fill="#fbcfe8"/>
      <circle cx="21" cy="50" r="7" fill="#fed7aa"/>
      <circle cx="79" cy="50" r="7" fill="#fed7aa"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="48" rx="30" ry="32" fill="url(#m-skin)"/>
      <!-- Włosy stylowe -->
      <path d="M20 40 C18 20 32 10 50 10 C68 10 82 20 80 40 C75 24 65 18 50 18 C35 18 25 24 20 40 Z" fill="url(#m-hair)"/>
      <path d="M24 34 C30 22 45 20 54 26 C46 22 32 26 28 36 Z" fill="#78350f" opacity="0.6"/>
      <!-- Oczy i brwi -->
      <path d="M30 38 Q36 34 42 38" stroke="#451a03" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M58 38 Q64 34 70 38" stroke="#451a03" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="36" cy="48" r="3.5" fill="#1e293b"/>
      <circle cx="37.5" cy="46.5" r="1.2" fill="#ffffff"/>
      <circle cx="64" cy="48" r="3.5" fill="#1e293b"/>
      <circle cx="65.5" cy="46.5" r="1.2" fill="#ffffff"/>
      <!-- Nos i uśmiech -->
      <path d="M48 48 Q50 54 53 54" stroke="#d97706" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M40 62 Q50 70 60 62" stroke="#b45309" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <!-- Róż na policzkach -->
      <circle cx="28" cy="56" r="4.5" fill="#f43f5e" opacity="0.25"/>
      <circle cx="72" cy="56" r="4.5" fill="#f43f5e" opacity="0.25"/>
      <!-- SYGNOWANA CECHA: WIELKIE OKRĄGŁE OKULARY W ZŁOTEJ OPRAWCE -->
      <circle cx="36" cy="48" r="14.5" fill="none" stroke="url(#m-gold)" stroke-width="3.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"/>
      <circle cx="64" cy="48" r="14.5" fill="none" stroke="url(#m-gold)" stroke-width="3.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"/>
      <path d="M50.5 48 H50" stroke="url(#m-gold)" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="21.5" y1="46" x2="16" y2="44" stroke="url(#m-gold)" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="78.5" y1="46" x2="84" y2="44" stroke="url(#m-gold)" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Odblask w szkłach okularów -->
      <path d="M26 42 Q32 37 40 40" stroke="#ffffff" stroke-width="1.8" fill="none" opacity="0.75" stroke-linecap="round"/>
      <path d="M54 42 Q60 37 68 40" stroke="#ffffff" stroke-width="1.8" fill="none" opacity="0.75" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'f2',
    name: 'Basia',
    feature: 'Wysoki rudy kok i piegi na policzkach',
    hook: 'Basia gra na BASIE, a jej rudy kok podskakuje w rytm!',
    job: 'Muzyczka',
    color: '#e67e22',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="b-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff1f2"/><stop offset="100%" stop-color="#fecdd3"/></linearGradient>
        <linearGradient id="b-hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f97316"/><stop offset="50%" stop-color="#ea580c"/><stop offset="100%" stop-color="#c2410c"/></linearGradient>
      </defs>
      <!-- SYGNOWANA CECHA 1: WYSOKI RUDY KOK -->
      <circle cx="50" cy="14" r="15" fill="url(#b-hair)" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.2))"/>
      <circle cx="50" cy="14" r="11" fill="none" stroke="#fdba74" stroke-width="2" opacity="0.6"/>
      <!-- Gumka do koka z perełką -->
      <rect x="42" y="24" width="16" height="5" rx="2.5" fill="#4f46e5"/>
      <circle cx="50" cy="26.5" r="2.5" fill="#facc15"/>
      <!-- Ramiona / dekolt z naszyjnikiem -->
      <path d="M20 96 C20 78 32 74 50 74 C68 74 80 78 80 96 Z" fill="#ec4899"/>
      <path d="M42 74 Q50 82 58 74" stroke="#fbbf24" stroke-width="2" fill="none"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v12 h-16 z" fill="#fecdd3"/>
      <circle cx="21" cy="52" r="6.5" fill="#ffe4e6"/>
      <circle cx="79" cy="52" r="6.5" fill="#ffe4e6"/>
      <!-- Kolczyki nutki -->
      <circle cx="21" cy="59" r="2" fill="#fbbf24"/>
      <circle cx="79" cy="59" r="2" fill="#fbbf24"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="50" rx="29" ry="30" fill="url(#b-skin)"/>
      <!-- Grzywka i pasma włosów -->
      <path d="M21 44 C20 30 34 26 50 26 C66 26 80 30 79 44 C72 32 60 30 50 34 C40 30 28 32 21 44 Z" fill="url(#b-hair)"/>
      <!-- Pasemka spadające po bokach -->
      <path d="M20 44 Q17 56 21 64" stroke="url(#b-hair)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M80 44 Q83 56 79 64" stroke="url(#b-hair)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- Oczy z rzęsami i brwi -->
      <path d="M31 40 Q37 36 43 40" stroke="#9a3412" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M57 40 Q63 36 69 40" stroke="#9a3412" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="37" cy="48" r="3.5" fill="#047857"/>
      <circle cx="38" cy="46.5" r="1.3" fill="#ffffff"/>
      <path d="M33 46 L31 44 M41 46 L43 44" stroke="#1e293b" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="63" cy="48" r="3.5" fill="#047857"/>
      <circle cx="64" cy="46.5" r="1.3" fill="#ffffff"/>
      <path d="M59 46 L57 44 M67 46 L69 44" stroke="#1e293b" stroke-width="1.2" stroke-linecap="round"/>
      <!-- Nosek i radosny uśmiech -->
      <path d="M48 49 Q50 53 52 50" stroke="#ea580c" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M41 62 Q50 72 59 62" stroke="#e11d48" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="28" cy="56" r="5" fill="#fb7185" opacity="0.3"/>
      <circle cx="72" cy="56" r="5" fill="#fb7185" opacity="0.3"/>
      <!-- SYGNOWANA CECHA 2: PIEGI NA POLICZKACH I NOSIE -->
      <circle cx="26" cy="54" r="1.5" fill="#c2410c"/>
      <circle cx="29" cy="58" r="1.6" fill="#9a3412"/>
      <circle cx="33" cy="54" r="1.4" fill="#c2410c"/>
      <circle cx="31" cy="62" r="1.3" fill="#9a3412"/>
      <circle cx="47" cy="54" r="1.2" fill="#c2410c"/>
      <circle cx="53" cy="54" r="1.2" fill="#c2410c"/>
      <circle cx="67" cy="54" r="1.4" fill="#c2410c"/>
      <circle cx="71" cy="58" r="1.6" fill="#9a3412"/>
      <circle cx="74" cy="54" r="1.5" fill="#c2410c"/>
      <circle cx="69" cy="62" r="1.3" fill="#9a3412"/>
    </svg>`
  },
  {
    id: 'f3',
    name: 'Krzysztof',
    feature: 'Bujna, gęsta czarna broda drwala',
    hook: 'KRZACZASTY Krzysztof gubi w brodzie Krzyżacki miecz!',
    job: 'Programista',
    color: '#10b981',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="k-beard" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#27272a"/><stop offset="50%" stop-color="#18181b"/><stop offset="100%" stop-color="#09090b"/></linearGradient>
        <linearGradient id="k-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#fed7aa"/></linearGradient>
      </defs>
      <!-- Koszula w kratę drwala -->
      <path d="M18 96 C18 78 30 74 50 74 C70 74 82 78 82 96 Z" fill="#dc2626"/>
      <line x1="30" y1="76" x2="30" y2="96" stroke="#991b1b" stroke-width="2"/>
      <line x1="70" y1="76" x2="70" y2="96" stroke="#991b1b" stroke-width="2"/>
      <line x1="18" y1="86" x2="82" y2="86" stroke="#991b1b" stroke-width="2"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v12 h-16 z" fill="#fed7aa"/>
      <circle cx="20" cy="48" r="7" fill="#fde68a"/>
      <circle cx="80" cy="48" r="7" fill="#fde68a"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="46" rx="30" ry="31" fill="url(#k-skin)"/>
      <!-- Włosy -->
      <path d="M20 38 C20 16 34 12 50 12 C66 12 80 16 80 38 C74 24 62 20 50 20 C38 20 26 24 20 38 Z" fill="url(#k-beard)"/>
      <path d="M22 36 C25 28 35 24 45 23" stroke="#3f3f46" stroke-width="2" fill="none"/>
      <!-- Gęste brwi i oczy programisty -->
      <path d="M28 38 L43 38" stroke="#18181b" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M57 38 L72 38" stroke="#18181b" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="36" cy="45" r="3.6" fill="#18181b"/>
      <circle cx="37.5" cy="43.5" r="1.3" fill="#ffffff"/>
      <circle cx="64" cy="45" r="3.6" fill="#18181b"/>
      <circle cx="65.5" cy="43.5" r="1.3" fill="#ffffff"/>
      <!-- Nos -->
      <path d="M47 44 Q50 51 53 51" stroke="#d97706" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- SYGNOWANA CECHA: BUJNA, GĘSTA CZARNA BRODA DRWALA -->
      <path d="M20 48 C20 85, 32 96, 50 96 C68 96, 80 85, 80 48 C76 52, 70 56, 62 55 C56 54, 52 58, 50 58 C48 58, 44 54, 38 55 C30 56, 24 52, 20 48 Z" fill="url(#k-beard)" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.35))"/>
      <!-- Wąsy drwala -->
      <path d="M32 55 Q50 63 68 55 Q50 52 32 55 Z" fill="#27272a"/>
      <!-- Uśmiech widoczny pod wąsem -->
      <path d="M43 62 Q50 67 57 62" stroke="#fef08a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Pasma faktury brody -->
      <path d="M35 70 Q50 88 50 94" stroke="#3f3f46" stroke-width="1.8" fill="none" opacity="0.6"/>
      <path d="M65 70 Q50 88 50 94" stroke="#3f3f46" stroke-width="1.8" fill="none" opacity="0.6"/>
    </svg>`
  },
  {
    id: 'f4',
    name: 'Kasia',
    feature: 'Lśniące fioletowe włosy i kolczyk w nosie',
    hook: 'Kasia pije KAKAO z fioletowego kubka, a kolczyk brzęczy!',
    job: 'Projektantka UX',
    color: '#8b5cf6',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ka-hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#c084fc"/><stop offset="40%" stop-color="#9333ea"/><stop offset="100%" stop-color="#581c87"/></linearGradient>
        <linearGradient id="ka-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#fed7aa"/></linearGradient>
      </defs>
      <!-- Ramiona / czarny golf UX designerki -->
      <path d="M22 96 C22 80 32 76 50 76 C68 76 78 80 78 96 Z" fill="#18181b"/>
      <rect x="42" y="70" width="16" height="8" rx="3" fill="#27272a"/>
      <!-- Szyja i uszy -->
      <path d="M42 64 h16 v10 h-16 z" fill="#fed7aa"/>
      <circle cx="22" cy="50" r="6.5" fill="#fde68a"/>
      <circle cx="78" cy="50" r="6.5" fill="#fde68a"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="48" rx="28" ry="30" fill="url(#ka-skin)"/>
      <!-- SYGNOWANA CECHA 1: LŚNIĄCE FIOLETOWE WŁOSY (Asymetryczny styl) -->
      <path d="M16 48 C12 24 30 10 50 10 C70 10 86 22 84 52 C78 28 66 20 50 20 C32 20 18 32 16 48 Z" fill="url(#ka-hair)"/>
      <path d="M16 48 C14 68 24 82 28 86 C24 72 20 58 22 46 Z" fill="url(#ka-hair)"/>
      <path d="M84 48 C86 64 80 74 76 80 C78 68 82 58 80 46 Z" fill="url(#ka-hair)"/>
      <!-- Błyszczące pasmo fioletowe -->
      <path d="M28 22 Q42 16 56 22 Q40 20 30 30 Z" fill="#e9d5ff" opacity="0.8"/>
      <!-- Oczy i staranne brwi -->
      <path d="M31 38 Q37 34 43 38" stroke="#581c87" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M57 38 Q63 34 69 38" stroke="#581c87" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="37" cy="46" r="3.5" fill="#312e81"/>
      <circle cx="38" cy="44.5" r="1.3" fill="#ffffff"/>
      <path d="M32 44 L30 42 M42 44 L44 42" stroke="#312e81" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="63" cy="46" r="3.5" fill="#312e81"/>
      <circle cx="64" cy="44.5" r="1.3" fill="#ffffff"/>
      <path d="M58 44 L56 42 M68 44 L70 42" stroke="#312e81" stroke-width="1.3" stroke-linecap="round"/>
      <!-- Nos -->
      <path d="M48 46 Q50 54 52 53" stroke="#b45309" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- SYGNOWANA CECHA 2: ZŁOTY KOLCZYK W NOSIE (NOSE RING) -->
      <circle cx="55" cy="53" r="3" fill="none" stroke="#f59e0b" stroke-width="2.2" filter="drop-shadow(0 1px 3px rgba(0,0,0,0.3))"/>
      <circle cx="56.5" cy="52" r="0.8" fill="#ffffff"/>
      <!-- Usta z modną szminką -->
      <path d="M41 64 Q50 72 59 64" stroke="#9333ea" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="28" cy="55" r="4.5" fill="#c084fc" opacity="0.3"/>
      <circle cx="72" cy="55" r="4.5" fill="#c084fc" opacity="0.3"/>
    </svg>`
  },
  {
    id: 'f5',
    name: 'Tomasz',
    feature: 'Szeroki, hollywoodzki uśmiech i elegancka muszka',
    hook: 'Tomasz to mistrz TOMU wierszy – kłania się w muszce i błyszczy zębami!',
    job: 'Prezenter TV',
    color: '#f43f5e',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="t-suit" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>
        <linearGradient id="t-bow" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ef4444"/><stop offset="100%" stop-color="#991b1b"/></linearGradient>
      </defs>
      <!-- Garnitur prezentera TV -->
      <path d="M18 96 C18 78 30 74 50 74 C70 74 82 78 82 96 Z" fill="url(#t-suit)"/>
      <!-- Biała koszula ze stójką -->
      <path d="M40 74 L50 86 L60 74 Z" fill="#ffffff"/>
      <!-- SYGNOWANA CECHA 1: ELEGANCKA CZERWONA MUSZKA -->
      <path d="M40 84 L48 87 L40 90 Z" fill="url(#t-bow)"/>
      <path d="M60 84 L52 87 L60 90 Z" fill="url(#t-bow)"/>
      <circle cx="50" cy="87" r="3" fill="#b91c1c" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v10 h-16 z" fill="#fed7aa"/>
      <circle cx="21" cy="48" r="6.5" fill="#ffedd5"/>
      <circle cx="79" cy="48" r="6.5" fill="#ffedd5"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="46" rx="29" ry="30" fill="#ffedd5"/>
      <!-- Fryzura prezentera z przedziałkiem -->
      <path d="M21 38 C20 16 35 10 50 10 C66 10 80 16 79 38 C75 22 62 18 48 18 C34 18 25 24 21 38 Z" fill="#78350f"/>
      <path d="M30 22 Q48 16 68 22" stroke="#b45309" stroke-width="2" fill="none" opacity="0.6"/>
      <!-- Brwi i błyszczące oczy -->
      <path d="M31 36 Q37 32 43 36" stroke="#451a03" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M57 36 Q63 32 69 36" stroke="#451a03" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="37" cy="44" r="3.5" fill="#1e293b"/>
      <circle cx="38.5" cy="42.5" r="1.3" fill="#ffffff"/>
      <circle cx="63" cy="44" r="3.5" fill="#1e293b"/>
      <circle cx="64.5" cy="42.5" r="1.3" fill="#ffffff"/>
      <!-- Nos -->
      <path d="M48 45 Q50 51 53 51" stroke="#d97706" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- SYGNOWANA CECHA 2: SZEROKI, HOLLYWOODZKI UŚMIECH Z ZĘBAMI -->
      <path d="M30 58 Q50 78 70 58 Q50 54 30 58 Z" fill="#1e293b" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"/>
      <path d="M33 58 Q50 63 67 58 C64 68 36 68 33 58 Z" fill="#ffffff"/>
      <line x1="50" y1="58" x2="50" y2="65" stroke="#e2e8f0" stroke-width="1.2"/>
      <!-- Błysk w zębach (Hollywood sparkle) -->
      <path d="M36 59 L38 59 M37 58 L37 60" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'f6',
    name: 'Ola',
    feature: 'Dwa zawadiackie kucyki i zielona opaska na czole',
    hook: 'Ola krzyczy OLE! na meczu i macha kucykami!',
    job: 'Trenerka fitness',
    color: '#06b6d4',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="o-hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#b45309"/><stop offset="50%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
      </defs>
      <!-- SYGNOWANA CECHA 1: DWA ZAWADIACKIE KUCYKI (Lewy i Prawy) -->
      <ellipse cx="14" cy="34" rx="11" ry="14" fill="url(#o-hair)" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.25))"/>
      <circle cx="21" cy="36" r="4" fill="#ec4899"/>
      <ellipse cx="86" cy="34" rx="11" ry="14" fill="url(#o-hair)" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.25))"/>
      <circle cx="79" cy="36" r="4" fill="#ec4899"/>
      <!-- Ramiona / koszulka sportowa fitness -->
      <path d="M22 96 C22 78 32 74 50 74 C68 74 78 78 78 96 Z" fill="#06b6d4"/>
      <path d="M38 74 L50 86 L62 74 Z" fill="#fed7aa"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v12 h-16 z" fill="#fed7aa"/>
      <circle cx="22" cy="52" r="6" fill="#fed7aa"/>
      <circle cx="78" cy="52" r="6" fill="#fed7aa"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="50" rx="28" ry="30" fill="#fed7aa"/>
      <!-- Włosy na głowie -->
      <path d="M22 40 C22 20 34 16 50 16 C66 16 78 20 78 40 C74 26 62 22 50 22 C38 22 26 26 22 40 Z" fill="url(#o-hair)"/>
      <!-- SYGNOWANA CECHA 2: ZIELONA OPASKA SPORTOWA NA CZOLE -->
      <rect x="20" y="30" width="60" height="9" rx="4.5" fill="#10b981" stroke="#059669" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"/>
      <line x1="25" y1="34.5" x2="75" y2="34.5" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.8"/>
      <!-- Oczy i wesołe mrugnięcie -->
      <circle cx="36" cy="48" r="3.5" fill="#1e293b"/>
      <circle cx="37" cy="46.5" r="1.3" fill="#ffffff"/>
      <!-- Drugie oko mrugające zawadiacko! -->
      <path d="M60 48 Q64 43 68 48" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Brwi -->
      <path d="M30 41 L40 40" stroke="#78350f" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M60 40 L70 41" stroke="#78350f" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Nos i uśmiech sportowca -->
      <path d="M48 49 Q50 53 52 50" stroke="#b45309" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M40 61 Q50 71 60 61" stroke="#dc2626" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <circle cx="28" cy="56" r="4.5" fill="#fb7185" opacity="0.35"/>
      <circle cx="72" cy="56" r="4.5" fill="#fb7185" opacity="0.35"/>
    </svg>`
  },
  {
    id: 'f7',
    name: 'Piotr',
    feature: 'Czarne wąsy a la Poirot i elegancki monokl',
    hook: 'Piotr pisze gęsim PIÓREM przez swój złoty monokl!',
    job: 'Detektyw',
    color: '#6366f1',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="p-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#eab308"/><stop offset="100%" stop-color="#ca8a04"/></linearGradient>
      </defs>
      <!-- Płaszcz detektywa z klapami -->
      <path d="M18 96 C18 78 30 74 50 74 C70 74 82 78 82 96 Z" fill="#334155"/>
      <path d="M42 74 L50 86 L58 74 Z" fill="#ffffff"/>
      <path d="M47 74 L50 82 L53 74 Z" fill="#475569"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v12 h-16 z" fill="#ffedd5"/>
      <circle cx="21" cy="48" r="6.5" fill="#ffedd5"/>
      <circle cx="79" cy="48" r="6.5" fill="#ffedd5"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="46" rx="29" ry="30" fill="#ffedd5"/>
      <!-- Ulizana fryzura a la Poirot -->
      <path d="M21 38 C20 16 35 12 50 12 C65 12 80 16 79 38 C74 24 62 20 50 20 C38 20 26 24 21 38 Z" fill="#18181b"/>
      <!-- Lewe oko i brew -->
      <path d="M30 36 Q36 32 42 36" stroke="#18181b" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="36" cy="44" r="3.2" fill="#1e293b"/>
      <circle cx="37.2" cy="42.8" r="1.1" fill="#ffffff"/>
      <!-- Prawe oko (pod monoklem) -->
      <path d="M58 35 Q64 30 70 35" stroke="#18181b" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="64" cy="44" r="3.5" fill="#1e293b"/>
      <circle cx="65.5" cy="42.5" r="1.3" fill="#ffffff"/>
      <!-- SYGNOWANA CECHA 1: ZŁOTY MONOKL Z ŁAŃCUSZKIEM -->
      <circle cx="64" cy="44" r="12" fill="none" stroke="url(#p-gold)" stroke-width="2.8" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
      <path d="M57 38 Q64 34 71 37" stroke="#ffffff" stroke-width="1.6" fill="none" opacity="0.75" stroke-linecap="round"/>
      <!-- Łańcuszek biegnący od monokla do klapy płaszcza -->
      <path d="M74 48 C80 58 78 72 70 82" stroke="url(#p-gold)" stroke-width="1.8" fill="none" stroke-dasharray="2 1.5"/>
      <!-- Nos detektywa -->
      <path d="M47 43 Q50 51 53 51" stroke="#d97706" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- SYGNOWANA CECHA 2: ZAKRĘCONY WĄS A LA POIROT -->
      <path d="M26 56 C34 50 44 58 50 57 C56 58 66 50 74 56 C78 58 78 63 73 60 C66 56 56 65 50 60 C44 65 34 56 27 60 C22 63 22 58 26 56 Z" fill="#18181b" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
      <!-- Lekki dyskretny uśmieszek pod wąsem -->
      <path d="M44 66 Q50 70 56 66" stroke="#b45309" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'f8',
    name: 'Ania',
    feature: 'Uroczy pieprzyk nad ustami i srebrne kolczyki koła',
    hook: 'Ania je soczystego ANANASA, a sok skapuje na pieprzyk!',
    job: 'Fotografka',
    color: '#ec4899',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="an-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#64748b"/></linearGradient>
        <linearGradient id="an-hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#262626"/><stop offset="100%" stop-color="#171717"/></linearGradient>
      </defs>
      <!-- Ramiona / stylowa koszulka fotografki z paskiem aparatu -->
      <path d="M20 96 C20 78 32 74 50 74 C68 74 80 78 80 96 Z" fill="#475569"/>
      <path d="M26 96 L60 74 L66 76 L32 96 Z" fill="#1e293b"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v12 h-16 z" fill="#fef08a"/>
      <circle cx="22" cy="50" r="6.5" fill="#fef08a"/>
      <circle cx="78" cy="50" r="6.5" fill="#fef08a"/>
      <!-- SYGNOWANA CECHA 1: SREBRNE KOLCZYKI KOŁA (HOOP EARRINGS) -->
      <circle cx="19" cy="54" r="8" fill="none" stroke="url(#an-silver)" stroke-width="2.6" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
      <circle cx="81" cy="54" r="8" fill="none" stroke="url(#an-silver)" stroke-width="2.6" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="48" rx="28" ry="30" fill="#fef08a"/>
      <!-- Fryzura: Stylowy ciemny bob z grzywką -->
      <path d="M18 46 C16 22 30 12 50 12 C70 12 84 22 82 46 C86 64 78 72 74 74 C78 56 80 40 76 34 C68 24 58 24 50 24 C42 24 32 24 24 34 C20 40 22 56 26 74 C22 72 14 64 18 46 Z" fill="url(#an-hair)"/>
      <path d="M26 30 Q50 20 74 30 Q50 26 26 30 Z" fill="#404040"/>
      <!-- Oczy z ładnymi rzęsami i brwi -->
      <path d="M32 38 Q37 34 43 38" stroke="#171717" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M57 38 Q63 34 69 38" stroke="#171717" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <circle cx="37" cy="46" r="3.5" fill="#451a03"/>
      <circle cx="38" cy="44.5" r="1.3" fill="#ffffff"/>
      <path d="M33 44 L31 42 M41 44 L43 42" stroke="#171717" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="63" cy="46" r="3.5" fill="#451a03"/>
      <circle cx="64" cy="44.5" r="1.3" fill="#ffffff"/>
      <path d="M59 44 L57 42 M67 44 L69 42" stroke="#171717" stroke-width="1.3" stroke-linecap="round"/>
      <!-- Nos -->
      <path d="M48 47 Q50 52 52 50" stroke="#d97706" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <!-- Usta z malinową szminką -->
      <path d="M41 62 Q50 71 59 62" stroke="#e11d48" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- SYGNOWANA CECHA 2: UROCZY PIEPRZYK NAD USTAMI (BEAUTY MARK) -->
      <circle cx="43" cy="57" r="2.2" fill="#171717" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.4))"/>
      <circle cx="28" cy="54" r="4.5" fill="#fb7185" opacity="0.3"/>
      <circle cx="72" cy="54" r="4.5" fill="#fb7185" opacity="0.3"/>
    </svg>`
  }
];


const MODES = [
  {
    id: 'who',
    name: 'Kto to jest?',
    emoji: '👤',
    desc: 'Spójrz na twarz, znajdź kotwicę i wybierz właściwe imię z 4 propozycji.',
    color: ['#38ef7d', '#11998e'],
    badge: 'Klasyczny'
  },
  {
    id: 'find',
    name: 'Znajdź osobę',
    emoji: '🔍',
    desc: 'Lisek wymienia gościa. Znajdź go błyskawicznie w tłumie na podstawie cech!',
    color: ['#4facfe', '#00f2fe'],
    badge: 'Spostrzegawczość'
  },
  {
    id: 'speed',
    name: 'Sprint imion',
    emoji: '⚡',
    desc: '30 sekund na zegarze! Ile twarzy zdołasz bezbłędnie przywitać?',
    color: ['#f093fb', '#f5576c'],
    badge: 'Na czas'
  },
  {
    id: 'cocktail',
    name: 'Koktajl Party',
    emoji: '🍸',
    desc: 'Poznajesz kolejnych gości na bankiecie. Sprawdzian co rundę, aż do pierwszej pomyłki!',
    color: ['#fa709a', '#fee140'],
    badge: 'Nieskończony'
  }
];




const LESSONS = [
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








function mountMap(root, { nav }) {
  const fox = createFox({ size: 'md' });
  const prog = store.get('names.train', {});
  const doneCount = LESSONS.filter(l => prog[l.id]).length;

  const items = LESSONS.map((les, idx) => {
    const stars = prog[les.id] || 0;
    const isLocked = idx > 0 && !prog[LESSONS[idx - 1].id] && !prog[les.id];
    return h('div', { class: `map-node ${stars ? 'done' : ''} ${isLocked ? 'locked' : ''}` },
      h('div', { class: 'mn-idx' }, `${idx + 1}`),
      h('div', { class: 'mn-body' },
        h('h3', {}, les.title),
        h('p', {}, les.subtitle),
        h('div', { class: 'mn-stars' }, '⭐'.repeat(stars) || '☆☆☆')
      ),
      isLocked
        ? h('span', { class: 'mn-lock' }, '🔒')
        : h('a', { class: 'btn btn-sm btn-sub', href: `#/names/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, 'Pewność siebie w nowej pracy, w szkole i na spotkaniach towarzyskich! Gdy zwrócisz się do nowo poznanej osoby po imieniu już po pierwszej rozmowie, zrobisz oszałamiające wrażenie i od razu zyskasz jej sympatię!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/names', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🦊 ', h('span', { class: 'grad' }, 'Szkolenie: Imiona i twarze')),
    h('p', { class: 'lead' }, 'Krok po kroku naucz się zapamiętywać każdą twarz i imię na całe życie.'),
    fox.el,
    whyCard,
    h('div', { class: 'map-list' }, items)
  );

  root.append(view);
  setTimeout(() => {
    fox.say(
      doneCount === 0
        ? 'Cześć! Jestem Lisek Bystrzak 🦊 Przejdźmy razem 6 kroków do mistrzowskiej pamięci twarzy!'
        : `Świetnie! Masz zaliczone ${doneCount}/${LESSONS.length} lekcji! Kontynuujmy!`,
      'happy'
    );
  }, 200);

  return () => fox.destroy();
}

function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const fox = createFox({ size: 'md' });
  let answered = false;

  const facesRow = h('div', { class: 'train-faces-row' },
    (les.faces || []).map(f => h('div', { class: 'face-card' },
      h('div', { class: 'fc-avatar', html: f.svg }),
      h('div', { class: 'fc-name' }, f.name),
      h('div', { class: 'fc-job' }, f.job),
      h('div', { class: 'fc-feature' }, '🔍 ', f.feature),
      h('div', { class: 'fc-hook' }, '💡 ', f.hook)
    ))
  );

  const theoryBox = h('div', { class: 'theory-card' },
    h('h3', {}, '🦊 Wskazówka Liska: ', les.title),
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '💡 Podpowiedź Liska');
  hintBtn.addEventListener('click', () => {
    fox.say(les.task.hint, 'think', { revert: 4000 });
  });

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/names/train', class: 'back' }, '← Mapa szkolenia')),
    h('div', { class: 'step-head' },
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    fox.el,
    theoryBox,
    facesRow,
    h('div', { class: 'task-box' },
      h('h3', { class: 'task-prompt' }, les.task.prompt),
      optContainer,
      h('div', { class: 'task-foot' }, hintBtn)
    )
  );

  function pick(idx, btn) {
    if (answered) return;
    const isOk = idx === les.task.correct;
    if (isOk) {
      answered = true;
      btn.classList.add('correct');
      sfx.success();
      fox.setMood('cheer', 2500);
      fox.say('Brawo! Dokładnie o to chodzi! Znakomita pamięć!', 'cheer');

      const prog = store.get('names.train', {});
      prog[les.id] = 3;
      store.set('names.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono szkolenie! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/names/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/names';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      fox.setMood('sad', 1800);
      fox.say(les.task.hint, 'think', { revert: 3500 });
      setTimeout(() => btn.classList.remove('wrong'), 800);
    }
  }

  (les.task.options || []).forEach((opt, idx) => {
    const btn = h('button', { class: 'btn-opt', type: 'button' }, opt);
    btn.addEventListener('click', () => pick(idx, btn));
    optContainer.append(btn);
  });

  root.append(view);
  setTimeout(() => {
    fox.say(les.speech || `Lekcja ${index + 1}: ${les.subtitle}! Sprawdź moją sprytną wskazówkę.`, 'happy');
  }, 250);

  return () => fox.destroy();
}









function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const fox = createFox({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let lives = 3;
  let timeLeft = modeId === 'speed' ? 30 : 0;
  let timerInterval = null;
  let isGameOver = false;

  const pool = [...FACES];
  let cocktailPool = [FACES[0], FACES[1], FACES[2]];
  let currentTarget = null;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const livesEl = (modeId === 'who' || modeId === 'find') ? h('span', { class: 'hud-lives' }, '❤️❤️❤️') : null;
  const timerEl = modeId === 'speed' ? h('span', { class: 'hud-timer' }, '⏱ 30s') : null;
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/names', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      livesEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Szanse'), livesEl) : null,
      timerEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Czas'), timerEl) : null
    ),
    fox.el,
    playArea
  );

  root.append(view);

  const CHEERS = [
    'Lisi spryt w akcji! Twarz zapamiętana! 🦊✨',
    'Kotwica zadziałała bezbłędnie! ⚓🎯',
    'Oko detektywa! Nikt się przed Tobą nie ukryje! 🔍⭐',
    'Brawo! Twoja pamięć do twarzy imponuje! 🌟',
    'Hau! Celne trafienie prosto w dziesiątkę! 🎯🦊',
    'Genialnie! Kojarzenie na poziomie mistrza! 🧠💡',
    'Lisek skacze z radości! Jesteś nie do zatrzymania! 🐾🎉'
  ];
  function cheerFox(c) {
    if (c % 5 === 0 && c > 0) {
      fox.say(`Niewiarygodne combo x${c}! Jesteś legendą bankietu! 🦊🏆✨`, 'cheer', { revert: 1800 });
      fox.spin?.();
    } else if (c % 2 === 0 && c > 0) {
      fox.say(`Combo x${c}! Twoje oko wyłapie każdy detal! 🦊✨`, 'cheer', { revert: 1400 });
      fox.hop?.();
    } else {
      fox.hop?.();
      fox.say(rand(CHEERS), 'cheer', { revert: 1100 });
    }
  }

  function updateLives() {
    if (livesEl) {
      livesEl.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
    }
  }

  function saveBest() {
    const prev = store.get(`names.best.${modeId}`, 0);
    if (score > prev) {
      store.set(`names.best.${modeId}`, score);
    }
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }, 1000);
  }

  function restartGame() {
    isGameOver = false;
    score = 0;
    round = 1;
    combo = 0;
    lives = 3;
    cocktailPool = [FACES[0], FACES[1], FACES[2]];
    timeLeft = modeId === 'speed' ? 30 : 0;
    scoreEl.textContent = '0';
    roundEl.textContent = '1';
    updateLives();
    if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
    if (timerInterval) clearInterval(timerInterval);
    if (modeId === 'speed') startTimer();
    fox.setMood('happy');
    fox.say('Zaczynamy od nowa! Pokaż lisi spryt! 🦊✨', 'happy');
    nextRound();
  }

  function gameOver() {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    saveBest();
    sfx.fanfare();
    fox.setMood('cheer', 3000);
    fox.say(`Koniec gry! Twój wynik: ${score} pkt! Wspaniała spostrzegawczość! 🦊`, 'cheer');

    const best = store.get(`names.best.${modeId}`, score);
    playArea.innerHTML = '';

    const restartBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Zagraj ponownie ↻');
    restartBtn.addEventListener('click', restartGame);
    const backBtn = h('a', { class: 'btn btn-ghost', href: '#/names' }, 'Inny tryb');

    playArea.append(
      h('div', { class: 'game-over-box' },
        h('h2', {}, '🎉 Świetna gra!'),
        h('div', { class: 'go-score' },
          h('b', {}, `${score}`),
          h('span', {}, 'punktów')
        ),
        h('div', { class: 'go-best' }, `🏆 Twój rekord: ${best}`),
        h('div', { class: 'go-actions' }, restartBtn, backBtn)
      )
    );
  }

  function nextRound() {
    if (isGameOver) return;
    playArea.innerHTML = '';

    if (modeId === 'who') {
      currentTarget = pool[rand(0, pool.length - 1)];
      const others = pool.filter(f => f.id !== currentTarget.id);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([currentTarget, ...wrong]);

      // W pierwszych 3 rundach dajemy podpowiedź cechy, potem gracz musi rozpoznać sam!
      const clueText = round <= 3
        ? `Podpowiedź cechy: ${currentTarget.feature}`
        : 'Rozpoznaj twarz z własnej pamięci!';

      const card = h('div', { class: 'who-target-card' },
        h('div', { class: 'who-avatar', html: currentTarget.svg }),
        h('div', { class: 'who-clue' }, clueText)
      );

      const opts = h('div', { class: 'who-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt-face', type: 'button' }, c.name);
        btn.addEventListener('click', () => {
          if (c.id === currentTarget.id) {
            sfx.success();
            score += 10 + combo * 2;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerFox(combo);
            nextRound();
          } else {
            sfx.wrong();
            combo = 0;
            lives--;
            updateLives();
            btn.classList.add('wrong');
            if (lives <= 0) {
              gameOver();
            } else {
              fox.setMood('sad', 1200);
              fox.say(`To ${currentTarget.name}! Kotwica: ${currentTarget.feature} ⚓ Masz jeszcze ${lives} szanse. 🦊`, 'think', { revert: 2600 });
              setTimeout(nextRound, 1200);
            }
          }
        });
        opts.append(btn);
      });

      playArea.append(card, opts);
    } else if (modeId === 'find') {
      currentTarget = pool[rand(0, pool.length - 1)];
      const count = Math.min(pool.length, round <= 2 ? 4 : round <= 5 ? 6 : 8);
      const others = pool.filter(f => f.id !== currentTarget.id);
      const displayed = shuffle([currentTarget, ...shuffle(others).slice(0, count - 1)]);

      const question = h('div', { class: 'find-question' },
        h('h3', {}, `Znajdź: `, h('span', { class: 'grad' }, currentTarget.name)),
        h('p', {}, `Zawód: ${currentTarget.job}`)
      );

      const grid = h('div', { class: 'faces-selection-grid' });
      displayed.forEach(f => {
        const btn = h('button', { class: 'face-tile-btn', type: 'button', html: f.svg });
        btn.addEventListener('click', () => {
          if (f.id === currentTarget.id) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerFox(combo);
            nextRound();
          } else {
            sfx.wrong();
            combo = 0;
            lives--;
            updateLives();
            btn.classList.add('wrong');
            if (lives <= 0) {
              gameOver();
            } else {
              fox.setMood('sad', 1000);
              fox.say(`To nie ta osoba! Przypomnij sobie jej cechę 🔍 Pozostało szans: ${lives}`, 'think', { revert: 2200 });
            }
          }
        });
        grid.append(btn);
      });

      playArea.append(question, grid);
    } else if (modeId === 'speed') {
      currentTarget = pool[rand(0, pool.length - 1)];
      const others = pool.filter(f => f.id !== currentTarget.id);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([currentTarget, ...wrong]);

      const card = h('div', { class: 'who-target-card' },
        h('div', { class: 'who-avatar', html: currentTarget.svg })
      );

      const opts = h('div', { class: 'who-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt-face', type: 'button' }, c.name);
        btn.addEventListener('click', () => {
          if (c.id === currentTarget.id) {
            sfx.pop();
            score += 10;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            nextRound();
          } else {
            sfx.wrong();
            btn.classList.add('wrong');
            setTimeout(nextRound, 300);
          }
        });
        opts.append(btn);
      });

      playArea.append(card, opts);
    } else if (modeId === 'cocktail') {
      // Cocktail party endless mode
      if (round > cocktailPool.length && cocktailPool.length < pool.length) {
        cocktailPool.push(pool[cocktailPool.length]);
      }
      currentTarget = cocktailPool[rand(0, cocktailPool.length - 1)];
      const choices = shuffle(cocktailPool);

      const card = h('div', { class: 'who-target-card' },
        h('div', { class: 'who-avatar', html: currentTarget.svg }),
        h('div', { class: 'who-clue' }, `Gość na bankiecie (${cocktailPool.length} osób w sali)`)
      );

      const opts = h('div', { class: 'who-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt-face', type: 'button' }, c.name);
        btn.addEventListener('click', () => {
          if (c.id === currentTarget.id) {
            sfx.success();
            score += 20 + cocktailPool.length * 5;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${cocktailPool.length}`;
            fox.setMood('cheer', 1000);
            nextRound();
          } else {
            sfx.wrong();
            gameOver();
          }
        });
        opts.append(btn);
      });

      playArea.append(card, opts);
    }
  }

  if (modeId === 'speed') {
    startTimer();
  }

  nextRound();

  return () => {
    if (timerInterval) clearInterval(timerInterval);
    fox.destroy();
  };
}










function mountMenu(root, { nav }) {
  const fox = createFox({ size: 'md' });
  const prog = store.get('names.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/names/train' : `#/names/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🦊 Szkolenie z Liskiem Bystrzakiem'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę twarzy' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
        h('p', {}, `${LESSONS.length} interaktywnych lekcji · kotwice cech · mosty fonetyczne`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/names/train' }, 'Zobacz mapę lekcji →');

  const modeCards = MODES.map(m => {
    const best = store.get(`names.best.${m.id}`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/names/free/${m.id}`,
      style: `--c1:${m.color[0]};--c2:${m.color[1]}`
    },
      h('div', { class: 'mc-emoji' }, m.emoji),
      h('div', { class: 'mc-body' },
        h('h3', {}, m.name),
        h('p', {}, m.desc)
      ),
      h('div', { class: 'mc-best' },
        h('b', {}, best ? `${best}` : '–'),
        h('span', {}, best ? 'rekord' : 'brak')
      )
    );
  });

  const view = h('section', { class: 'screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
    h('div', { class: 'game-head' },
      h('div', {},
        h('h1', {}, '🦊 ', h('span', { class: 'grad' }, 'Imiona i twarze')),
        h('p', { class: 'lead' }, 'Nigdy więcej „znam tę twarz, ale jak on miał na imię?”. Opanuj technikę kotwic i mostów fonetycznych.')
      )
    ),
    fox.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Hau! Jestem Lisek Bystrzak 🦊 Każda twarz ma w sobie sekret. Nauczę Cię go czytać!'
    : done < LESSONS.length
      ? `Mamy opanowane ${done} z ${LESSONS.length} lekcji. Dokończmy szkolenie! 🦊`
      : 'Twoja pamięć twarzy jest bystra jak lis! Wybierz tryb gry swobodnej! 🏆';

  setTimeout(() => { fox.say(greet, 'happy'); }, 300);
  return () => fox.destroy();
}

return {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};

  })();
  


  /* --- MAJOR GAME MODULE --- */
  const majorGame = (function() {
    const PHONETIC_MAP = [
  { digit: 0, sounds: 'S, Z', rule: 'Zero zaczyna się na Z, syczący dźwięk', pegs: ['SOS', 'Ser', 'Ząb', 'Waza'] },
  { digit: 1, sounds: 'T, D', rule: 'Litera T i D mają jedną pionową kreskę (jak 1)', pegs: ['Troll', 'Dom', 'Dach', 'Kot'] },
  { digit: 2, sounds: 'N', rule: 'Małe „n” ma dwie nóżki', pegs: ['Nóż', 'Nos', 'Noc', 'Koń'] },
  { digit: 3, sounds: 'M', rule: 'Małe „m” ma trzy nóżki', pegs: ['Mysz', 'Miecz', 'Mama', 'Młot'] },
  { digit: 4, sounds: 'R', rule: 'Słowo czteRy ma dominujące R', pegs: ['Rura', 'Rak', 'Rower', 'Ryba'] },
  { digit: 5, sounds: 'L', rule: 'Rzymskie L to 50; dłoń z 5 palcami tworzy kąt L', pegs: ['Liść', 'Lama', 'Las', 'Lupa'] },
  { digit: 6, sounds: 'J, SZ, CZ', rule: 'Szóstka brzmi jak „sz”, jota jest 6. spółgłoską', pegs: ['Jajko', 'Jeż', 'Szal', 'Czajnik'] },
  { digit: 7, sounds: 'K, G', rule: 'Dwie cyfry 7 połączone brzuszkami tworzą literę K', pegs: ['Koc', 'Kura', 'Kot', 'Gitara'] },
  { digit: 8, sounds: 'F, W', rule: 'Pisana mała litera f ma dwie pętelki jak ósemka', pegs: ['Fala', 'Wino', 'Waga', 'Foka'] },
  { digit: 9, sounds: 'P, B', rule: 'Lustrzane odbicie 9 to P, odwrócona 9 to b', pegs: ['Pies', 'But', 'Balon', 'Bomba'] }
];

const PEG_WORDS_2DIGIT = [
  { num: '10', word: 'TOS', code: 'T(1) + S(0)', img: 'Toster', hint: 'T(1) + S(0)' },
  { num: '14', word: 'TOR', code: 'T(1) + R(4)', img: 'Tor kolejowy', hint: 'T(1) + R(4)' },
  { num: '20', word: 'NOS', code: 'N(2) + S(0)', img: 'Nos klauna', hint: 'N(2) + S(0)' },
  { num: '25', word: 'NIL', code: 'N(2) + L(5)', img: 'Rzeka Nil', hint: 'N(2) + L(5)' },
  { num: '31', word: 'Młot', code: 'M(3) + T(1)', img: 'Ciężki młot', hint: 'M(3) + T(1)' },
  { num: '40', word: 'Róża', code: 'R(4) + Z(0)', img: 'Czerwona róża', hint: 'R(4) + Z(0)' },
  { num: '47', word: 'RAK', code: 'R(4) + K(7)', img: 'Szczypiący rak', hint: 'R(4) + K(7)' },
  { num: '52', word: 'LIN', code: 'L(5) + N(2)', img: 'Gruba lina', hint: 'L(5) + N(2)' },
  { num: '71', word: 'KOT', code: 'K(7) + T(1)', img: 'Czarny kot', hint: 'K(7) + T(1)' },
  { num: '85', word: 'FALA', code: 'F(8) + L(5)', img: 'Morska fala', hint: 'F(8) + L(5)' },
  { num: '91', word: 'BUT', code: 'B(9) + T(1)', img: 'Skórzany but', hint: 'B(9) + T(1)' },
  { num: '94', word: 'BAR', code: 'B(9) + R(4)', img: 'Neonowy bar', hint: 'B(9) + R(4)' }
];


const MODES = [
  {
    id: 'peg',
    name: 'Kołki 0-9',
    emoji: '🦉',
    desc: 'Opanuj alfabet fonetyczny do perfekcji: błyskawicznie łącz cyfry 0-9 z ich dźwiękami.',
    color: ['#ff758c', '#ff7eb3'],
    badge: 'Podstawy'
  },
  {
    id: 'decode',
    name: 'Dekoder słów',
    emoji: '🔍',
    desc: 'Widzisz słowo (np. KOT, BALON, NOS). Jakie cyfry kryją się w jego spółgłoskach?',
    color: ['#a18cd1', '#fbc2eb'],
    badge: 'Odszyfruj'
  },
  {
    id: 'encode',
    name: 'Szybki szyfrant',
    emoji: '⚡',
    desc: 'Widzisz liczbę (np. 14, 52, 91). Wybierz słowo, które poprawnie koduje te cyfry!',
    color: ['#fad0c4', '#ffd1ff'],
    badge: 'Kodowanie'
  },
  {
    id: 'pin',
    name: 'Trening PIN',
    emoji: '💳',
    desc: 'Prawdziwe wyzwanie! Zapamiętuj 4-cyfrowe kody PIN zamieniając je w 2 żywe obrazy.',
    color: ['#43e97b', '#38f9d7'],
    badge: 'Praktyka'
  }
];




const LESSONS = [
  {
    id: 'major-1',
    title: 'Cyfry 0 i 1 (S/Z oraz T/D)',
    subtitle: 'Pierwsze litery alfabetu pamięci',
    desc: 'Poznaj sekret, dzięki któremu mistrzowie świata zapamiętują tysiące cyfr.',
    speech: 'Uhuhu! Cześć! Jestem Sówka 🦉 Zastanawiasz się, po co uczyć się tej techniki? Pokażę Ci sekretny kod, dzięki któremu łatwo zapamiętasz numer PIN, PESEL czy ważne daty w szkole – bez nudnego wkuwania!',
    theory: [
      'Po co nam ta technika? Nasz mózg gubi się w suchych, nudnych cyfrach, ale uwielbia słowa i kolorowe obrazy!',
      'System Major zamienia cyfry na dźwięki spółgłosek. Dzięki temu z dowolnego numeru ułożysz śmieszne słowo, które od razu zapamiętasz!',
      'Poznajmy dwie pierwsze cyfry kodu:',
      '• 0 = S oraz Z – słowo „Zero” zaczyna się na literę Z, a zero syczy cichutko jak wąż: sss!',
      '• 1 = T oraz D – spójrz na literę T oraz D: obie mają JEDNĄ prostą pionową kreskę, dokładnie jak cyfra 1!',
      'To bardzo proste! Zobacz: słowo „KOT” ma T na końcu (1), a słowo „SOS” ma S (0).'
    ],
    task: {
      prompt: 'Która spółgłoska odpowiada cyfrze 1 w systemie Major?',
      options: ['T oraz D (jedna pionowa kreska)', 'M (trzy nóżki)', 'R (cztery)', 'F oraz W'],
      correct: 0,
      hint: 'Pomyśl o jednej pionowej kresce w literach T i D!'
    }
  },
  {
    id: 'major-2',
    title: 'Cyfry 2 i 3 (N oraz M)',
    subtitle: 'Nóżki liter',
    desc: 'Spójrz na litery N i M – ich kształt mówi sam za siebie!',
    speech: 'Świetnie Ci poszło! Zobacz, cyfry 2 i 3 mają swoje ukryte nóżki – dzieci i dorośli zapamiętują je w sekundę!',
    theory: [
      'Kolejne dwie cyfry to najprostsza zabawa w skojarzenia kształtów:',
      '• 2 = N – małe „n” ma DWA brzuszki / dwie nóżki stojące na ziemi.',
      '• 3 = M – małe „m” ma TRZY nóżki (raz, dwa, trzy!).',
      'To najprostsza zasada wizualna w całym systemie!',
      'Gdy w numerze telefonu lub dacie widzisz 2 → myślisz o N (np. Nos, Nóż).',
      'Gdy widzisz 3 → myślisz o M (np. Mysz, Młot).'
    ],
    task: {
      prompt: 'Dlaczego cyfrze 3 przypisana jest litera M?',
      options: ['Ponieważ litera „m” ma 3 nóżki', 'Bo 3 to magiczna liczba', 'Bo M to pierwsza litera słowa Major', 'Przez przypadek'],
      correct: 0,
      hint: 'Policz nóżki w literze m: raz, dwa, trzy!'
    }
  },
  {
    id: 'major-3',
    title: 'Cyfry 4 i 5 (R oraz L)',
    subtitle: 'CzteRy oraz rzymskie L',
    desc: 'Jak zapamiętać 4 i 5 bez wysiłku?',
    speech: 'Uhuhu! Pora na cyfry 4 i 5. Wsłuchaj się w dźwięki i spójrz na dłoń!',
    theory: [
      'Dlaczego 4 to R, a 5 to L? To sprytne skojarzenia:',
      '• 4 = R – powiedz głośno słowo „czteRy” – słyszysz to mocne, dźwięczne R na końcu?',
      '• 5 = L – spójrz na dłoń: kciuk i palec wskazujący tworzą kształt litery L, a cała dłoń ma 5 palców! (Rzymskie L to też 50).',
      'Przykłady ze świata: 4 to Rura lub Ryba, a 5 to Liść lub Lama.'
    ],
    task: {
      prompt: 'Jaki dźwięk odpowiada cyfrze 4?',
      options: ['R (z dominującego R w słowie „czteRy”)', 'K i G', 'S i Z', 'P i B'],
      correct: 0,
      hint: 'Wsłuchaj się w słowo „czteRy”!'
    }
  },
  {
    id: 'major-4',
    title: 'Cyfry 6 i 7 (J/SZ/CZ oraz K/G)',
    subtitle: 'Szóstka i kanciaste K',
    desc: 'Połowa alfabetu za nami! Poznaj szeleszczące dźwięki i siódemkę.',
    speech: 'Jesteśmy już w połowie drogi! Szeleszcząca szóstka i kanciaste K czekają na Ciebie!',
    theory: [
      'Poznajemy szóstkę i siódemkę:',
      '• 6 = J, SZ, CZ – powiedz „Sześć” – to najbardziej szeleszcząca cyfra w języku polskim! (A litera J to 6. spółgłoska alfabetu).',
      '• 7 = K, G – wyobraź sobie dwie cyfry 7 przytknięte do siebie plecami – tworzą ostre ramiona litery K!',
      'Z tych literek powstaną fantastyczne słowa: 6 to Jeż lub Szal, a 7 to Koc, Kot lub Kura.'
    ],
    task: {
      prompt: 'Która para spółgłosek odpowiada cyfrze 7?',
      options: ['K oraz G', 'F oraz W', 'T oraz D', 'N oraz M'],
      correct: 0,
      hint: 'Dwie siódemki tworzą literę K!'
    }
  },
  {
    id: 'major-5',
    title: 'Cyfry 8 i 9 (F/W oraz P/B)',
    subtitle: 'Pętelki i lustrzane odbicia',
    desc: 'Ostatnie dwie cyfry domykające alfabet Majora.',
    speech: 'Ostatni krok alfabetu! Dwie pętelki i obrócona dziewiątka – i cały kod 0-9 masz w małym palcu!',
    theory: [
      'Domykamy cały alfabet cyfr:',
      '• 8 = F, W – pisana mała literka „f” ma dwie pętelki na górze i na dole, dokładnie jak cyfra 8.',
      '• 9 = P, B – cyfra 9 w lustrze wygląda jak litera P, a gdy obróci się ją do góry nogami – jak małe b!',
      'Gratulacje! Znasz już całe 0 do 9:',
      '0: S/Z | 1: T/D | 2: N | 3: M | 4: R | 5: L | 6: J/SZ | 7: K/G | 8: F/W | 9: P/B.'
    ],
    task: {
      prompt: 'Dlaczego cyfra 9 to P oraz B?',
      options: ['Bo lustrzane odbicie 9 to P, a obrócona to b', 'Bo 9 to ostatnia cyfra', 'Bo pies ma 9 żyć', 'Bo brzmi jak B'],
      correct: 0,
      hint: 'Obróć cyfrę 9 w wyobraźni!'
    }
  },
  {
    id: 'major-6',
    title: 'Samogłoski jako klej',
    subtitle: 'Budowanie słów z samogłosek A, E, I, O, U, Y',
    desc: 'Samogłoski NIE MAJĄ wartości liczbowej. Służą tylko do lepienia słów!',
    speech: 'Teraz dzieje się magia! Użyjemy samogłosek jak plasteliny do lepienia całych słów!',
    theory: [
      'Po co nam samogłoski (A, E, I, O, U, Y)?',
      'W systemie Major samogłoski NIE MAJĄ żadnej cyfry – są jak darmowy klej albo plastelina!',
      'Dzięki temu możesz wstawić DOWOLNE samogłoski między spółgłoski, by utworzyć sensowne, barwne słowo!',
      'Spójrz na liczbę 71:',
      '• 7 = K, 1 = T.',
      '• Wkładasz samogłoskę „O” w środek → powstaje puszysty KOT!',
      '• Albo dodajesz „A” → KAT! Albo „I” → KIT!'
    ],
    task: {
      prompt: 'Jaką liczbę koduje słowo „NOS” (N=2, S=0)?',
      options: ['20', '31', '71', '40'],
      correct: 0,
      hint: 'N to 2 nóżki, O to klej, S to zero (20)!'
    }
  },
  {
    id: 'major-7',
    title: '2-cyfrowe obrazy (kołki pamięciowe)',
    subtitle: 'TOR, RAK, FALA, BUT',
    desc: 'Przekształcaj pary liczb w konkretne, trójwymiarowe przedmioty.',
    speech: 'Uhuhu! Popatrz, jak liczby zamieniają się w trójwymiarowe zabawki w Twojej głowie!',
    theory: [
      'Zamiast pamiętać nudne liczby, pamiętasz wyraziste obrazy (kołki pamięciowe):',
      '• 14 = T(1) + R(4) = kolejowy TOR 🚂',
      '• 47 = R(4) + K(7) = szczypiący RAK 🦞',
      '• 71 = K(7) + T(1) = puszysty KOT 🐱',
      '• 91 = B(9) + T(1) = skórzany BUT 👞',
      'Gdy widzisz obraz przed oczami → od razu wiesz, jaka to liczba!'
    ],
    task: {
      prompt: 'Które słowo poprawnie koduje liczbę 14 (1=T, 4=R)?',
      options: ['TOR', 'NOS', 'RAK', 'DOM'],
      correct: 0,
      hint: '1 to T, 4 to R → T + O + R = TOR!'
    }
  },
  {
    id: 'major-8',
    title: 'Egzamin Profesora: Kod PIN',
    subtitle: 'Praktyczne zapamiętanie 4-cyfrowego kodu',
    desc: 'Wykorzystaj 2 obrazy, aby zapamiętać PIN 71-14 na zawsze.',
    speech: 'Pora na wielki finał! Zobacz, jak w 3 sekundy zapamiętasz 4-cyfrowy PIN do bankomatu lub telefonu na zawsze!',
    theory: [
      'Twój nowy kod PIN do telefonu lub karty to: 7114.',
      'Dzielimy go na dwa 2-cyfrowe kołki:',
      '• 71 = KOT 🐱 (K=7, T=1)',
      '• 14 = TOR kolejowy 🚂 (T=1, R=4)',
      'Łączymy je w żywą scenę: Gigantyczny KOT leży na TORACH i łapą zatrzymuje pociąg!',
      'Gdy stoisz przed bankomatem, widzisz Kota na Torach: Kot(71) + Tor(14) = 7114!'
    ],
    task: {
      prompt: 'Jaki PIN ukryty jest w historii o KOCIE (71) na TORACH (14)?',
      options: ['7114', '1471', '2047', '9125'],
      correct: 0,
      hint: 'Kot to 71, Tor to 14 → 7114!'
    }
  }
];









function mountMap(root, { nav }) {
  const owl = createOwl({ size: 'md' });
  const prog = store.get('major.train', {});
  const doneCount = LESSONS.filter(l => prog[l.id]).length;

  const items = LESSONS.map((les, idx) => {
    const stars = prog[les.id] || 0;
    const isLocked = idx > 0 && !prog[LESSONS[idx - 1].id] && !prog[les.id];
    return h('div', { class: `map-node ${stars ? 'done' : ''} ${isLocked ? 'locked' : ''}` },
      h('div', { class: 'mn-idx' }, `${idx + 1}`),
      h('div', { class: 'mn-body' },
        h('h3', {}, les.title),
        h('p', {}, les.subtitle),
        h('div', { class: 'mn-stars' }, '⭐'.repeat(stars) || '☆☆☆')
      ),
      isLocked
        ? h('span', { class: 'mn-lock' }, '🔒')
        : h('a', { class: 'btn btn-sm btn-sub', href: `#/major/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, 'Daty historyczne, rocznice, numery kont, statystyki i kody dostępowe. Zamiast męczących liczb pamiętasz żywe obrazy i filmy, które zostają w głowie na całe lata!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/major', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🦉 ', h('span', { class: 'grad' }, 'Akademia Majora ze Sówką')),
    h('p', { class: 'lead' }, '8 fundamentalnych lekcji, od dźwięków 0-9 po swobodne zapamiętywanie kodów PIN i PESEL.'),
    owl.el,
    whyCard,
    h('div', { class: 'map-list' }, items)
  );

  root.append(view);
  setTimeout(() => {
    owl.say(
      doneCount === 0
        ? 'Uhuhu! Jestem Sówka Profesor 🦉 Znam tajemny kod zamieniający nudne cyfry w barwne obrazy!'
        : `Świetny postęp! Masz już ${doneCount}/${LESSONS.length} wykładów zaliczonych!`,
      'happy'
    );
  }, 200);

  return () => owl.destroy();
}

function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const owl = createOwl({ size: 'md' });
  let answered = false;

  const theoryBox = h('div', { class: 'theory-card' },
    h('h3', {}, '🦉 Tajnik Sówki: ', les.title),
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '🦉 Podpowiedź Sówki');
  hintBtn.addEventListener('click', () => {
    owl.say(les.task.hint, 'think', { revert: 4000 });
  });

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/major/train', class: 'back' }, '← Wykaz lekcji')),
    h('div', { class: 'step-head' },
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    owl.el,
    theoryBox,
    h('div', { class: 'task-box' },
      h('h3', { class: 'task-prompt' }, les.task.prompt),
      optContainer,
      h('div', { class: 'task-foot' }, hintBtn)
    )
  );

  function pick(idx, btn) {
    if (answered) return;
    const isOk = idx === les.task.correct;
    if (isOk) {
      answered = true;
      btn.classList.add('correct');
      sfx.success();
      owl.setMood('cheer', 2500);
      owl.say('Znakomicie! Doskonałe zrozumienie zasad systemu Major!', 'cheer');

      const prog = store.get('major.train', {});
      prog[les.id] = 3;
      store.set('major.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono Akademię! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/major/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/major';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      owl.setMood('sad', 1800);
      owl.say(les.task.hint, 'think', { revert: 3500 });
      setTimeout(() => btn.classList.remove('wrong'), 800);
    }
  }

  (les.task.options || []).forEach((opt, idx) => {
    const btn = h('button', { class: 'btn-opt', type: 'button' }, opt);
    btn.addEventListener('click', () => pick(idx, btn));
    optContainer.append(btn);
  });

  root.append(view);
  setTimeout(() => {
    owl.say(les.speech || `Uhuhu! Lekcja ${index + 1}: ${les.subtitle}. Spójrz na podpowiedź poniżej!`, 'happy');
  }, 250);

  return () => owl.destroy();
}









function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const owl = createOwl({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let lives = 3;
  let isGameOver = false;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const livesEl = h('span', { class: 'hud-lives' }, '❤️❤️❤️');
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/major', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Szanse'), livesEl)
    ),
    owl.el,
    playArea
  );

  root.append(view);

  const CHEERS = [
    'Huuu-hu! Fenomenalnie! Kod złamany! 🦉✨',
    'Spółgłoski opanowane do perfekcji! 📖🔐',
    'Geniusz fonetyczny! Sówka bije skrzydłami! 💡🎉',
    'Świetny strzał! Cyfry zamieniają się w magię! 🎯🦉',
    'Uhuhu! Błyskawiczny umysł profesora! ⚡🧠',
    'Arcydzieło pamięci! Twój kod działa bez pudła! 🌟📚',
    'Prawdziwy erudyta! Lecimy po kolejny rekord! 🚀🦉'
  ];
  function cheerOwl(c) {
    if (c % 5 === 0 && c > 0) {
      owl.say(`Mega combo x${c}! Tytuł Wielkiego Mistrza Majora jest Twój! 🦉🏆🌟`, 'cheer', { revert: 1800 });
      owl.spin?.();
    } else if (c % 2 === 0 && c > 0) {
      owl.say(`Combo x${c}! Twój mózg zamienia liczby w arcydzieła! 🦉✨`, 'cheer', { revert: 1400 });
      owl.hop?.();
    } else {
      owl.hop?.();
      owl.say(rand(CHEERS), 'cheer', { revert: 1100 });
    }
  }

  function updateLives() {
    livesEl.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
  }

  function saveBest() {
    const prev = store.get(`major.best.${modeId}`, 0);
    if (score > prev) store.set(`major.best.${modeId}`, score);
  }

  function restartGame() {
    isGameOver = false;
    score = 0;
    round = 1;
    combo = 0;
    lives = 3;
    scoreEl.textContent = '0';
    roundEl.textContent = '1';
    updateLives();
    owl.setMood('happy');
    owl.say('Zaczynamy od nowa! Spółgłoski czekają! 🦉📚', 'happy');
    nextRound();
  }

  function gameOver() {
    isGameOver = true;
    saveBest();
    sfx.fanfare();
    owl.setMood('cheer', 3000);
    owl.say(`Koniec sesji! Osiągnięty wynik: ${score} pkt! Wiedza godna profesora! 🦉`, 'cheer');

    const best = store.get(`major.best.${modeId}`, score);
    playArea.innerHTML = '';

    const restartBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Zagraj ponownie ↻');
    restartBtn.addEventListener('click', restartGame);
    const backBtn = h('a', { class: 'btn btn-ghost', href: '#/major' }, 'Inny tryb');

    playArea.append(
      h('div', { class: 'game-over-box' },
        h('h2', {}, '🎓 Wspaniała runda!'),
        h('div', { class: 'go-score' },
          h('b', {}, `${score}`),
          h('span', {}, 'punktów')
        ),
        h('div', { class: 'go-best' }, `🏆 Rekord w tym trybie: ${best}`),
        h('div', { class: 'go-actions' }, restartBtn, backBtn)
      )
    );
  }

  function handleWrong(solutionText) {
    sfx.wrong();
    combo = 0;
    lives--;
    updateLives();
    if (lives <= 0) {
      gameOver();
    } else {
      owl.setMood('sad', 1200);
      owl.say(`${solutionText} Pozostało szans: ${lives} 🦉`, 'think', { revert: 2600 });
      setTimeout(nextRound, 1200);
    }
  }

  function nextRound() {
    if (isGameOver) return;
    playArea.innerHTML = '';

    if (modeId === 'peg') {
      const target = PHONETIC_MAP[rand(0, PHONETIC_MAP.length - 1)];
      const others = PHONETIC_MAP.filter(m => m.digit !== target.digit);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([target, ...wrong]);

      const card = h('div', { class: 'major-card' },
        h('span', { class: 'major-big-num' }, `${target.digit}`),
        h('p', {}, 'Jakie dźwięki odpowiadają tej cyfrze?')
      );

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, c.sounds);
        btn.addEventListener('click', () => {
          if (c.digit === target.digit) {
            sfx.success();
            score += 10 + combo * 2;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerOwl(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            handleWrong(`Cyfra ${target.digit} to: ${target.sounds}! (${target.rule})`);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'decode') {
      const target = PEG_WORDS_2DIGIT[rand(0, PEG_WORDS_2DIGIT.length - 1)];
      const others = PEG_WORDS_2DIGIT.filter(p => p.num !== target.num);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([target, ...wrong]);

      const card = h('div', { class: 'major-card' },
        h('span', { class: 'major-word-target' }, target.word),
        h('p', {}, `Wyobrażenie: ${target.img}`)
      );

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, c.num);
        btn.addEventListener('click', () => {
          if (c.num === target.num) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerOwl(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            handleWrong(`${target.word} koduje liczbę ${target.num} (${target.code})`);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'encode') {
      const target = PEG_WORDS_2DIGIT[rand(0, PEG_WORDS_2DIGIT.length - 1)];
      const others = PEG_WORDS_2DIGIT.filter(p => p.num !== target.num);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([target, ...wrong]);

      const card = h('div', { class: 'major-card' },
        h('span', { class: 'major-big-num' }, target.num),
        h('p', {}, 'Wybierz słowo o spółgłoskach kodujących tę liczbę:')
      );

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, c.word);
        btn.addEventListener('click', () => {
          if (c.num === target.num) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerOwl(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            handleWrong(`Dla liczby ${target.num} poprawny jest ${target.word} (${target.code})`);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'pin') {
      // 4-digit PIN training (or 6-digit in later rounds)
      const is6Digit = round >= 7;
      const p1 = PEG_WORDS_2DIGIT[rand(0, PEG_WORDS_2DIGIT.length - 1)];
      const p2 = PEG_WORDS_2DIGIT[rand(0, PEG_WORDS_2DIGIT.length - 1)];
      const p3 = is6Digit ? PEG_WORDS_2DIGIT[rand(0, PEG_WORDS_2DIGIT.length - 1)] : null;
      const pinCode = is6Digit ? `${p1.num}${p2.num}${p3.num}` : `${p1.num}${p2.num}`;

      // Podpowiedzi w pierwszych 3 rundach, potem pamięć własna!
      const storyContent = round <= 3
        ? h('div', { class: 'pin-story' },
            h('p', {}, `Obraz 1: `, h('b', {}, p1.word), ` (${p1.img})`),
            h('p', {}, `Obraz 2: `, h('b', {}, p2.word), ` (${p2.img})`),
            h('p', { class: 'muted' }, `Wyobraź sobie akcję łączącą oba przedmioty!`)
          )
        : h('div', { class: 'pin-story' },
            h('p', { class: 'muted' }, is6Digit ? 'Zaawansowany PIN 6-cyfrowy! Zakoduj 3 obrazy w myślach.' : 'Zakoduj obie liczby w słowa i stwórz własną scenkę w głowie!')
          );

      const card = h('div', { class: 'major-card' },
        h('h3', {}, is6Digit ? '💳 Zapamiętaj 6-cyfrowy PIN:' : '💳 Zapamiętaj PIN:'),
        h('span', { class: 'pin-display' }, pinCode),
        storyContent
      );

      const checkBtn = h('button', { class: 'btn btn-primary mt-2', type: 'button' }, 'Zapamiętane! Sprawdź mnie ▶');
      checkBtn.addEventListener('click', () => {
        playArea.innerHTML = '';
        const quizCard = h('div', { class: 'major-card' },
          h('h3', {}, 'Jaki był kod PIN?')
        );

        const wrongPins = is6Digit
          ? [
              `${p2.num}${p1.num}${p3.num}`,
              `${p1.num}${p3.num}${p2.num}`,
              `${p3.num}${p2.num}${p1.num}`
            ].filter(p => p !== pinCode)
          : [
              `${p2.num}${p1.num}`,
              `${p1.num}${PEG_WORDS_2DIGIT[rand(0, PEG_WORDS_2DIGIT.length - 1)].num}`,
              `${PEG_WORDS_2DIGIT[rand(0, PEG_WORDS_2DIGIT.length - 1)].num}${p2.num}`
            ].filter(p => p !== pinCode);

        const pinChoices = shuffle([pinCode, ...wrongPins]).slice(0, 4);
        const pinOpts = h('div', { class: 'opt-grid' });
        pinChoices.forEach(pinOpt => {
          const btn = h('button', { class: 'btn-opt', type: 'button' }, pinOpt);
          btn.addEventListener('click', () => {
            if (pinOpt === pinCode) {
              sfx.fanfare();
              score += (is6Digit ? 35 : 25) + combo * 5;
              combo++;
              round++;
              scoreEl.textContent = `${score}`;
              roundEl.textContent = `${round}`;
              cheerOwl(combo);
              setTimeout(nextRound, 1200);
            } else {
              btn.classList.add('wrong');
              handleWrong(`Prawidłowy PIN to ${pinCode}.`);
            }
          });
          pinOpts.append(btn);
        });

        playArea.append(quizCard, pinOpts);
      });

      playArea.append(card, checkBtn);
    }
  }

  nextRound();
  return () => owl.destroy();
}










function mountMenu(root, { nav }) {
  const owl = createOwl({ size: 'md' });
  const prog = store.get('major.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/major/train' : `#/major/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🦉 Akademia Sówki Profesora'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę Majora' : done === LESSONS.length ? 'Powtórz akademię' : 'Kontynuuj akademię'),
        h('p', {}, `${LESSONS.length} lekcji · spółgłoski 0-9 · kołki pamięciowe · zapamiętywanie PIN`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/major/train' }, 'Zobacz wykaz wykładów →');

  const modeCards = MODES.map(m => {
    const best = store.get(`major.best.${m.id}`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/major/free/${m.id}`,
      style: `--c1:${m.color[0]};--c2:${m.color[1]}`
    },
      h('div', { class: 'mc-emoji' }, m.emoji),
      h('div', { class: 'mc-body' },
        h('h3', {}, m.name),
        h('p', {}, m.desc)
      ),
      h('div', { class: 'mc-best' },
        h('b', {}, best ? `${best}` : '–'),
        h('span', {}, best ? 'rekord' : 'brak')
      )
    );
  });

  const view = h('section', { class: 'screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
    h('div', { class: 'game-head' },
      h('div', {},
        h('h1', {}, '🦉 ', h('span', { class: 'grad' }, 'System Major')),
        h('p', { class: 'lead' }, 'Tajemny kod mistrzów pamięci: zamieniaj liczby na słowa i obrazy.')
      )
    ),
    owl.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Uhuhu! Jestem Sówka Profesor 🦉 Nauczę Cię zamieniać nudne cyfry w fascynujące obrazy!'
    : done < LESSONS.length
      ? `Mamy za sobą ${done} z ${LESSONS.length} wykładów. Chodźmy dalej do biblioteki! 📚`
      : 'Ukończyłeś całą Akademię Majora! Sprawdź swój refleks w grze swobodnej! 🏆';

  setTimeout(() => { owl.say(greet, 'happy'); }, 300);
  return () => owl.destroy();
}

return {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};

  })();
  


  /* --- WORDS GAME MODULE --- */
  const wordsGame = (function() {
    const VOCAB = [
  { id: 'w1', foreign: 'mushroom', lang: 'angielski', meaning: 'grzyb', bridge: 'MASZ RUM', story: 'Wielki leśny borowik wyciąga rękę i krzyczy pirackim głosem: „MASZ RUM w butelce?!”', emoji: '🍄' },
  { id: 'w2', foreign: 'candle', lang: 'angielski', meaning: 'świeca', bridge: 'KUNDEL', story: 'Wesoły KUNDELEK biegnie przez pokój, niosąc na czubku ogona płonącą, woskową ŚWIECĘ!', emoji: '🕯️' },
  { id: 'w3', foreign: 'feather', lang: 'angielski', meaning: 'pióro', bridge: 'SWETER', story: 'Zakładasz wełniany SWETER, a z każdego oczka wyrasta wielkie, łaskoczące gęsie PIÓRO!', emoji: '🪶' },
  { id: 'w4', foreign: 'pillow', lang: 'angielski', meaning: 'poduszka', bridge: 'PIŁA', story: 'Chcesz uciąć deskę, ale zamiast PIŁY trzymasz miękką puchową PODUSZKĘ, z której lecą pióra!', emoji: '🛏️' },
  { id: 'w5', foreign: 'shark', lang: 'angielski', meaning: 'rekin', bridge: 'SZARIK', story: 'Groźny żarłacz REKIN macha przyjaźnie ogonem i szczeka jak wierny pies SZARIK!', emoji: '🦈' },
  { id: 'w6', foreign: 'beetle', lang: 'angielski', meaning: 'chrząszcz', bridge: 'BITELSI', story: 'Cztery CHRZĄSZCZE w czarnych garniturach grają na gitarach na scenie jak The BEATLES!', emoji: '🪲' },
  { id: 'w7', foreign: 'fork', lang: 'angielski', meaning: 'widelec', bridge: 'FOKA', story: 'Wesoła FOKA na plaży żongluje na nosie wielkim, srebrnym WIDELCEM!', emoji: '🍴' },
  { id: 'w8', foreign: 'bat', lang: 'angielski', meaning: 'nietoperz', bridge: 'BAT', story: 'Czarny NIETOPERZ w masce Zorro lata pod sufitem i strzela z długiego skórzanego BATA!', emoji: '🦇' },
  { id: 'w9', foreign: 'ship', lang: 'angielski', meaning: 'statek', bridge: 'SZYP', story: 'Potężny STATEK oceaniczny ma zamiast masztów wielkie kolczaste SZYPUŁKI dzikiej róży!', emoji: '🚢' },
  { id: 'w10', foreign: 'cloud', lang: 'angielski', meaning: 'chmura', bridge: 'KLAUN', story: 'Wesoły KLAUN z czerwonym nosem skacze jak na trampolinie po puszystej białej CHMURZE!', emoji: '☁️' },
  { id: 'w11', foreign: 'bread', lang: 'angielski', meaning: 'chleb', bridge: 'BRUD', story: 'Chcesz zjeść chrupiący CHLEB, ale ma na skórce wielki napis BRUD zrobiony z czekolady!', emoji: '🍞' },
  { id: 'w12', foreign: 'horse', lang: 'angielski', meaning: 'koń', bridge: 'HOSSA', story: 'Biały KOŃ zakłada garnitur maklera i krzyczy na giełdzie: „Idzie HOSSA, kupujemy siano!”', emoji: '🐴' },
  { id: 'w13', foreign: 'snake', lang: 'angielski', meaning: 'wąż', bridge: 'ŚNIEG', story: 'Długi zielony WĄŻ w ciepłej czapce lepi wesołego bałwana ze ŚNIEGU na mrozie!', emoji: '🐍' },
  { id: 'w14', foreign: 'coat', lang: 'angielski', meaning: 'płaszcz', bridge: 'KOT', story: 'Rudy KOT spaceruje dumnie w długim, ciepłym zimowym PŁASZCZU z paskiem!', emoji: '🧥' },
  { id: 'w15', foreign: 'mirror', lang: 'angielski', meaning: 'lustro', bridge: 'MURAWA', story: 'Spoglądasz w LUSTRO, a zamiast Twojej twarzy rośnie w nim zielona MURAWA piłkarska!', emoji: '🪞' },
  { id: 'w16', foreign: 'spoon', lang: 'angielski', meaning: 'łyżka', bridge: 'SZPIEG', story: 'Błyszcząca ŁYŻKA w ciemnych okularach udaje SZPIEGA i nurkuje w talerzu z rosołem!', emoji: '🥄' },
  { id: 'w17', foreign: 'plate', lang: 'angielski', meaning: 'talerz', bridge: 'PŁETWA', story: 'Płetwonurek kładzie wielką gumową PŁETWĘ prosto na płaski TALERZ obiadowy!', emoji: '🍽️' },
  { id: 'w18', foreign: 'cup', lang: 'angielski', meaning: 'kubek', bridge: 'KAP', story: 'Z kranu robi głośne KAP, KAP, KAP wprost do kolorowego KUBKA z herbatą!', emoji: '☕' },
  { id: 'w19', foreign: 'boot', lang: 'angielski', meaning: 'but', bridge: 'BUTLA', story: 'Kowbojski skórzany BUT ma zamiast obcasa wielką metalową BUTLĘ z gazem!', emoji: '👢' },
  { id: 'w20', foreign: 'ring', lang: 'angielski', meaning: 'pierścień', bridge: 'RING', story: 'Na środku bokserskiego RINGU lśni gigantyczny złoty PIERŚCIEŃ z diamentem!', emoji: '💍' },
  { id: 'w21', foreign: 'bell', lang: 'angielski', meaning: 'dzwon', bridge: 'BELKA', story: 'Pod dachem wisi drewniana BELKA, na której zawieszony jest wielki mosiężny DZWON!', emoji: '🔔' },
  { id: 'w22', foreign: 'key', lang: 'angielski', meaning: 'klucz', bridge: 'KIJ', story: 'Wielki złoty KLUCZ do sejfu służy hokeiście jako zakrzywiony KIJ do gry!', emoji: '🔑' },
  { id: 'w23', foreign: 'lock', lang: 'angielski', meaning: 'zamek', bridge: 'LOK', story: 'Fryzjerka robi lokówką wielki, sprężysty LOK z metalowego ZAMKA w drzwiach!', emoji: '🔒' },
  { id: 'w24', foreign: 'rope', lang: 'angielski', meaning: 'lina', bridge: 'ROPA', story: 'Chcesz wspiąć się po LINIE, ale jest cała oblepiona czarną, śliską ROPĄ naftową!', emoji: '🪢' },
  { id: 'w25', foreign: 'leaf', lang: 'angielski', meaning: 'liść', bridge: 'LIFT', story: 'Zielony dębowy LIŚĆ wsiada do windy (LIFTU) i wjeżdża na sam czubek drzewa!', emoji: '🍃' },
  { id: 'w26', foreign: 'tree', lang: 'angielski', meaning: 'drzewo', bridge: 'TRIO', story: 'W koronie rozłożystego DRZEWA wesołe TRIO wiewiórek śpiewa operową arię!', emoji: '🌳' },
  { id: 'w27', foreign: 'bridge', lang: 'angielski', meaning: 'most', bridge: 'BRYDŻ', story: 'Kierowcy stoją na wielkim MOŚCIE i z nudów grają na maskach aut w BRYDŻA!', emoji: '🌉' },
  { id: 'w28', foreign: 'lake', lang: 'angielski', meaning: 'jezioro', bridge: 'LEK', story: 'Wrzucasz do czystego JEZIORA musujący LEK witaminowy i cała woda buzuje bąbelkami!', emoji: '🌊' },
  { id: 'w29', foreign: 'peach', lang: 'angielski', meaning: 'brzoskwinia', bridge: 'PISZCZY', story: 'Gryziesz soczystą, miękką BRZOSKWINIĘ, a ona głośno PISZCZY ze śmiechu!', emoji: '🍑' },
  { id: 'w30', foreign: 'frog', lang: 'angielski', meaning: 'żaba', bridge: 'FROK', story: 'Zielona ŻABA zakłada balowy elegancki FRAK (frok) i tańczy walca na liściu lilii!', emoji: '🐸' },
  { id: 'w31', foreign: 'duck', lang: 'angielski', meaning: 'kaczka', bridge: 'DAKTYL', story: 'Żółta KACZKA pływa po stawie i zamiast chleba zajada słodkie DAKTYLE!', emoji: '🦆' },
  { id: 'w32', foreign: 'bear', lang: 'angielski', meaning: 'niedźwiedź', bridge: 'BERŁO', story: 'Brunatny NIEDŹWIEDŹ w koronie trzyma w łapie złote królewskie BERŁO i je miód!', emoji: '🐻' },
  { id: 'w33', foreign: 'wolf', lang: 'angielski', meaning: 'wilk', bridge: 'WULKAN', story: 'Szary WILK wyje do księżyca stojąc na samym szczycie dymiącego WULKANU!', emoji: '🐺' },
  { id: 'w34', foreign: 'fox', lang: 'angielski', meaning: 'lis', bridge: 'FOKS', story: 'Rudy LIS zakłada smoking i tańczy po lesie eleganckiego FOKSTROTA!', emoji: '🦊' },
  { id: 'w35', foreign: 'deer', lang: 'angielski', meaning: 'jeleń', bridge: 'DYREKTOR', story: 'Dumny JELEŃ z wielkim porożem siada za biurkiem jako nowy DYREKTOR korporacji!', emoji: '🦌' },
  { id: 'w36', foreign: 'goat', lang: 'angielski', meaning: 'koza', bridge: 'GOT', story: 'Biała rogata KOZA ubiera się na czarno i słucha mrocznej muzyki jak prawdziwy GOT!', emoji: '🐐' },
  { id: 'w37', foreign: 'pig', lang: 'angielski', meaning: 'świnia', bridge: 'PIGUŁKA', story: 'Różowa ŚWINIA w fartuchu lekarskim przepisuje na katar wielką różową PIGUŁKĘ!', emoji: '🐷' },
  { id: 'w38', foreign: 'cow', lang: 'angielski', meaning: 'krowa', bridge: 'KAWA', story: 'Łaciata KROWA na pastwisku pije z filiżanki gorącą KAWĘ z pianką z własnego mleka!', emoji: '🐮' },
  { id: 'w39', foreign: 'sheep', lang: 'angielski', meaning: 'owca', bridge: 'SZYBA', story: 'Puchata biała OWCA biegnie przez łąkę i z impetem myje językiem wielką SZYBĘ!', emoji: '🐑' },
  { id: 'w40', foreign: 'mouse', lang: 'angielski', meaning: 'mysz', bridge: 'MAJTEK', story: 'Mała polna MYSZ w marynarskich pasiastych MAJTKACH steruje żaglówką!', emoji: '🐭' },
  { id: 'w41', foreign: 'bird', lang: 'angielski', meaning: 'ptak', bridge: 'BURDA', story: 'Kolorowy PTAK na gałęzi krzyczy i wywołuje na podwórku wielką awanturę i BURDĘ!', emoji: '🐦' },
  { id: 'w42', foreign: 'owl', lang: 'angielski', meaning: 'sowa', bridge: 'AUL', story: 'Mądra SOWA w birecie profesorskim prowadzi wykład w wielkiej uniwersyteckiej AULI!', emoji: '🦉' },
  { id: 'w43', foreign: 'eagle', lang: 'angielski', meaning: 'orzeł', bridge: 'IGŁA', story: 'Wielki górski ORZEŁ trzyma w szponach zamiast gałązki cienką krawiecką IGŁĘ z nitką!', emoji: '🦅' },
  { id: 'w44', foreign: 'spider', lang: 'angielski', meaning: 'pająk', bridge: 'SPAJDI', story: 'Wielki włochaty PAJĄK zakłada kostium Spider-Mana (SPAJDI) i wspina się po ścianie!', emoji: '🕷️' },
  { id: 'w45', foreign: 'bee', lang: 'angielski', meaning: 'pszczoła', bridge: 'BIEG', story: 'Pracowita PSZCZOŁA zakłada buty z kolcami i bierze udział w BIEGU sprinterskim na 100m!', emoji: '🐝' },
  { id: 'w46', foreign: 'ant', lang: 'angielski', meaning: 'mrówka', bridge: 'ANTENA', story: 'Mała pracowita MRÓWKA niesie na plecach olbrzymią telewizyjną ANTENĘ satelitarną!', emoji: '🐜' },
  { id: 'w47', foreign: 'crab', lang: 'angielski', meaning: 'krab', bridge: 'KRA', story: 'Czerwony morski KRAB szczypcami rozłupuje wielką lodową KRĘ na biegunie!', emoji: '🦀' },
  { id: 'w48', foreign: 'whale', lang: 'angielski', meaning: 'wieloryb', bridge: 'WELUR', story: 'Olbrzymi błękitny WIELORYB nosi na grzbiecie elegancki smoking uszyty z WELURU!', emoji: '🐋' },
  { id: 'w49', foreign: 'seal', lang: 'angielski', meaning: 'foka', bridge: 'SILNIK', story: 'Zwinna FOKA pływa w oceanie z doczepionym do ogona motorowodnym SILNIKIEM turbo!', emoji: '🦭' },
  { id: 'w50', foreign: 'lion', lang: 'angielski', meaning: 'lew', bridge: 'LAJON', story: 'Król zwierząt LEW przed polowaniem zajada chrupiący batonik LION!', emoji: '🦁' },
  { id: 'w51', foreign: 'tiger', lang: 'angielski', meaning: 'tygrys', bridge: 'TAJGA', story: 'Pasiasty TYGRYS w futrzanej czapce biega po syberyjskiej TAJDZE i szuka ciepła!', emoji: '🐯' },
  { id: 'w52', foreign: 'monkey', lang: 'angielski', meaning: 'małpa', bridge: 'MANKIET', story: 'Wesoła MAŁPKA kradnie w sklepie elegancką koszulę i zapina złoty spinek w MANKIECIE!', emoji: '🐵' },
  { id: 'w53', foreign: 'apple', lang: 'angielski', meaning: 'jabłko', bridge: 'APEL', story: 'Dyrektor szkoły staje na środku boiska i ogłasza APEL, rzucając w uczniów JABŁKAMI!', emoji: '🍎' },
  { id: 'w54', foreign: 'pear', lang: 'angielski', meaning: 'gruszka', bridge: 'PERŁA', story: 'Rozkrawasz żółtą słodką GRUSZKĘ, a w środku lśni wielka biała morska PERŁA!', emoji: '🍐' },
  { id: 'w55', foreign: 'plum', lang: 'angielski', meaning: 'śliwka', bridge: 'PLAMA', story: 'Fioletowa soczysta ŚLIWKA spada na biały obrus i zostawia wielką atramentową PLAMĘ!', emoji: '🫐' },
  { id: 'w56', foreign: 'cherry', lang: 'angielski', meaning: 'wiśnia', bridge: 'CZERWIEŃ', story: 'Dojrzała czerwona WIŚNIA świeci w nocy intensywną, neonową CZERWIENIĄ!', emoji: '🍒' },
  { id: 'w57', foreign: 'nut', lang: 'angielski', meaning: 'orzech', bridge: 'NUTA', story: 'Rozłupujesz twardy ORZECH włoski, a ze środka wylatuje złota, śpiewająca NUTA muzyczna!', emoji: '🥜' },
  { id: 'w58', foreign: 'carrot', lang: 'angielski', meaning: 'marchew', bridge: 'KARETA', story: 'Królewska pomarańczowa MARCHEW jedzie do pałacu w złotej KARECIE zaprzężonej w konie!', emoji: '🥕' },
  { id: 'w59', foreign: 'onion', lang: 'angielski', meaning: 'cebula', bridge: 'ANIOŁ', story: 'Kroisz ostrą CEBULĘ i płaczesz, a biały ANIOŁ podaje Ci chusteczkę do nosa!', emoji: '🧅' },
  { id: 'w60', foreign: 'garlic', lang: 'angielski', meaning: 'czosnek', bridge: 'GARLIK / GAR', story: 'Biały ząbek CZOSNKU wskakuje do wielkiego GARA z gorącą zupą i odstrasza wampiry!', emoji: '🧄' },
  { id: 'w61', foreign: 'milk', lang: 'angielski', meaning: 'mleko', bridge: 'MILK / MILION', story: 'Karton białego MLEKA wygrywa na loterii MILION złotych i oblewa wszystkich ze szczęścia!', emoji: '🥛' },
  { id: 'w62', foreign: 'cheese', lang: 'angielski', meaning: 'ser', bridge: 'CZYSTY', story: 'Żółty szwajcarski SER z dziurami bierze kąpiel w wannie, bo lubi być pachnący i CZYSTY!', emoji: '🧀' },
  { id: 'w63', foreign: 'butter', lang: 'angielski', meaning: 'masło', bridge: 'BATERIA', story: 'Smarujesz kanapkę żółtym MASŁEM, a kromka zaczyna świecić, bo masło to BATERIA!', emoji: '🧈' },
  { id: 'w64', foreign: 'meat', lang: 'angielski', meaning: 'mięso', bridge: 'MIT', story: 'Wikingowie siadają przy ognisku, pieką soczyste MIĘSO i opowiadają prastary grecki MIT!', emoji: '🥩' },
  { id: 'w65', foreign: 'fish', lang: 'angielski', meaning: 'ryba', bridge: 'FISZKA', story: 'Srebrna RYBA wyskakuje z wody i uczy się słówek, zapisując je na papierowej FISZCE!', emoji: '🐟' },
  { id: 'w66', foreign: 'soup', lang: 'angielski', meaning: 'zupa', bridge: 'SĘP', story: 'Głodny leśny SĘP przylatuje do kuchni i z apetytem zajada gorącą pomidorową ZUPĘ!', emoji: '🍲' },
  { id: 'w67', foreign: 'salt', lang: 'angielski', meaning: 'sól', bridge: 'SALTO', story: 'Solniczka z białą SOLĄ wyskakuje w powietrze i robi potrójne akrobatyczne SALTO!', emoji: '🧂' },
  { id: 'w68', foreign: 'sugar', lang: 'angielski', meaning: 'cukier', bridge: 'SZUR', story: 'Biały słodki CUKIER wsypuje się do szklanki z głośnym SZUR, SZUR po dnie!', emoji: '🍬' },
  { id: 'w69', foreign: 'honey', lang: 'angielski', meaning: 'miód', bridge: 'HANI', story: 'Mała dziewczynka HANIA smaruje pajdę chleba słodkim, lejącym się MIODEM!', emoji: '🍯' },
  { id: 'w70', foreign: 'cake', lang: 'angielski', meaning: 'ciasto', bridge: 'KEKS', story: 'Kucharz piecze urodzinowe CIASTO, ale przez pomyłkę wychodzi mu bakaliowy KEKS!', emoji: '🍰' },
  { id: 'w71', foreign: 'house', lang: 'angielski', meaning: 'dom', bridge: 'HAŁAS', story: 'Wielki piętrowy DOM trzęsie się w posadach, bo dzieci robią w nim potworny HAŁAS!', emoji: '🏠' },
  { id: 'w72', foreign: 'room', lang: 'angielski', meaning: 'pokój', bridge: 'RUMOR', story: 'Otwierasz drzwi do POKOJU, a tam meble tańczą i robią ogromny RUMOR!', emoji: '🚪' },
  { id: 'w73', foreign: 'door', lang: 'angielski', meaning: 'drzwi', bridge: 'DÓR', story: 'Pukasz w drewniane DRZWI, a one grają głośny, wesoły akord w tonacji C-DUR!', emoji: '🚪' },
  { id: 'w74', foreign: 'window', lang: 'angielski', meaning: 'okno', bridge: 'WINDA', story: 'Zamiast otwierać OKNO, wciskasz guzik i całe okno zjeżdża w dół jak WINDA!', emoji: '🪟' },
  { id: 'w75', foreign: 'floor', lang: 'angielski', meaning: 'podłoga', bridge: 'FLOR / FLORYDA', story: 'Myjesz PODŁOGĘ mopem, a deski zamieniają się w piaszczystą plażę na FLORYDZIE!', emoji: '🪵' },
  { id: 'w76', foreign: 'roof', lang: 'angielski', meaning: 'dach', bridge: 'RUFA', story: 'Na spadzisty DACH domu spada z nieba wielka drewniana RUFA statku piratów!', emoji: '🏠' },
  { id: 'w77', foreign: 'wall', lang: 'angielski', meaning: 'ściana', bridge: 'WAŁ', story: 'Biała ŚCIANA w pokoju pęka i zamienia się w wysoki ziemny WAŁ przeciwpowodziowy!', emoji: '🧱' },
  { id: 'w78', foreign: 'table', lang: 'angielski', meaning: 'stół', bridge: 'TABLICA', story: 'Drewniany STÓŁ jadalny zamienia się nagle w szkolną TABLICĘ ze wzorami matematycznymi!', emoji: '🪵' },
  { id: 'w79', foreign: 'chair', lang: 'angielski', meaning: 'krzesło', bridge: 'CZERW', story: 'Wygodne biurowe KRZESŁO zaczyna świecić na jaskrawy CZERWONY kolor!', emoji: '🪑' },
  { id: 'w80', foreign: 'bed', lang: 'angielski', meaning: 'łóżko', bridge: 'BEDUIN', story: 'Pustynny BEDUIN rozbija namiot na piasku i kładzie się spać w wielkim miękkim ŁÓŻKU!', emoji: '🛏️' },
  { id: 'w81', foreign: 'clock', lang: 'angielski', meaning: 'zegar', bridge: 'KLOC', story: 'Ścienny ZEGAR tyka głośno, a z kukułki zamiast ptaka wylatuje ciężki drewniany KLOC!', emoji: '⏰' },
  { id: 'w82', foreign: 'book', lang: 'angielski', meaning: 'książka', bridge: 'BUK', story: 'W wielkiej starej KSIĄŻCE zamiast papieru są liście potężnego BUKU!', emoji: '📖' },
  { id: 'w83', foreign: 'pen', lang: 'angielski', meaning: 'długopis', bridge: 'PIENIĄDZ', story: 'Piszesz sprawdzian DŁUGOPISEM, a z wkładu zamiast tuszu wylatują złote PIENIĄDZE!', emoji: '🖊️' },
  { id: 'w84', foreign: 'bag', lang: 'angielski', meaning: 'torba', bridge: 'BAGNO', story: 'Wrzucasz zakupy do płóciennej TORBY, a w środku bulgocze zielone, pachnące BAGNO!', emoji: '🛍️' },
  { id: 'w85', foreign: 'box', lang: 'angielski', meaning: 'pudełko', bridge: 'BOKSER', story: 'Otwierasz kartonowe PUDEŁKO z paczką, a ze środka wyskakuje BOKSER w rękawicach!', emoji: '📦' },
  { id: 'w86', foreign: 'car', lang: 'angielski', meaning: 'samochód', bridge: 'KARA', story: 'Szybki sportowy SAMOCHÓD parkuje na zakazie i kierowcę spotyka surowa KARA!', emoji: '🚗' },
  { id: 'w87', foreign: 'bus', lang: 'angielski', meaning: 'autobus', bridge: 'BUSOLA', story: 'Żółty szkolny AUTOBUS gubi drogę we mgle i kierowca nawiguje wielką mosiężną BUSOLĄ!', emoji: '🚌' },
  { id: 'w88', foreign: 'train', lang: 'angielski', meaning: 'pociąg', bridge: 'TRENER', story: 'Długi POCIĄG towarowy zatrzymuje się na stacji, a maszynistą jest surowy TRENER fitness!', emoji: '🚆' },
  { id: 'w89', foreign: 'plane', lang: 'angielski', meaning: 'samolot', bridge: 'PLAN', story: 'Wielki pasażerski SAMOLOT rozkłada w locie gigantyczny papierowy PLAN miasta!', emoji: '✈️' },
  { id: 'w90', foreign: 'bike', lang: 'angielski', meaning: 'rower', bridge: 'BAJKA', story: 'Czerwony dziecięcy ROWER sam kręci pedałami i przenosi Cię wprost w środek BAJKI!', emoji: '🚲' },
  { id: 'w91', foreign: 'road', lang: 'angielski', meaning: 'droga', bridge: 'RÓD', story: 'Szeroka asfaltowa DROGA prowadzi prosto do zamku, w którym mieszka królewski RÓD!', emoji: '🛣️' },
  { id: 'w92', foreign: 'sun', lang: 'angielski', meaning: 'słońce', bridge: 'SANIE', story: 'Gorące żółte SŁOŃCE zakłada okulary przeciwsłoneczne i jeździ po chmurach w SANIACH!', emoji: '☀️' },
  { id: 'w93', foreign: 'moon', lang: 'angielski', meaning: 'księżyc', bridge: 'MUNDUR', story: 'Srebrny KSIĘŻYC w pełni zakłada wojskowy MUNDUR i salutuje gwiazdom na niebie!', emoji: '🌙' },
  { id: 'w94', foreign: 'star', lang: 'angielski', meaning: 'gwiazda', bridge: 'STARA', story: 'Jasna lśniąca GWIAZDA na niebie mruga okiem i mówi, że jest już bardzo STARA!', emoji: '⭐' },
  { id: 'w95', foreign: 'rain', lang: 'angielski', meaning: 'deszcz', bridge: 'REIN / RENIFER', story: 'Z nieba leje ulewny DESZCZ, a renifery Świętego Mikołaja tańczą w kałużach!', emoji: '🌧️' },
  { id: 'w96', foreign: 'snow', lang: 'angielski', meaning: 'śnieg', bridge: 'SNOPEK', story: 'Zimą na pole spada biały puchaty ŚNIEG i przykrywa wysoki SNOPEK siana!', emoji: '❄️' },
  { id: 'w97', foreign: 'wind', lang: 'angielski', meaning: 'wiatr', bridge: 'WINDA', story: 'Za oknem wieje potężny WIATR, który porywa zewnętrzną szklaną WINDĘ wieżowca!', emoji: '💨' },
  { id: 'w98', foreign: 'fire', lang: 'angielski', meaning: 'ogień', bridge: 'FAJERWERKI', story: 'W kominku płonie wesoły OGIEŃ, z którego strzelają kolorowe sylwestrowe FAJERWERKI!', emoji: '🔥' },
  { id: 'w99', foreign: 'water', lang: 'angielski', meaning: 'woda', bridge: 'WATA', story: 'Odkręcasz kran z czystą WODĄ, a ze zlewu zamiast kropel wylatuje słodka WATA cukrowa!', emoji: '💧' },
  { id: 'w100', foreign: 'sea', lang: 'angielski', meaning: 'morze', bridge: 'SIERŚĆ', story: 'Błękitne wzburzone MORZE wyrzuca na brzeg falę, która jest miękka jak kocia SIERŚĆ!', emoji: '🌊' },
  { id: 'w101', foreign: 'sand', lang: 'angielski', meaning: 'piasek', bridge: 'SANDAŁ', story: 'Chodzisz po gorącej plaży, a żółty drobny PIASEK sam wskakuje Ci w skórzany SANDAŁ!', emoji: '🏖️' },
  { id: 'w102', foreign: 'rock', lang: 'angielski', meaning: 'skała', bridge: 'ROK', story: 'Stroma twarda SKAŁA w górach ma na szczycie wielki napis: „Szczęśliwego Nowego ROKU!”', emoji: '🪨' },
  { id: 'w103', foreign: 'coin', lang: 'angielski', meaning: 'moneta', bridge: 'KOŃ', story: 'Wrzucasz do skarbonki błyszczącą MONETĘ, a ze środka słychać, jak rży mały KOŃ!', emoji: '🪙' },
  { id: 'w104', foreign: 'sword', lang: 'angielski', meaning: 'miecz', bridge: 'SWĄD', story: 'Rycerz wyciąga ze skały ostry MIECZ, a w powietrzu unosi się zapach spalenizny i SWĄD!', emoji: '⚔️' },
  { id: 'w105', foreign: 'crown', lang: 'angielski', meaning: 'korona', bridge: 'KRAN', story: 'Królewska złota KORONA z diamentami leży w łazience i zatyka cieknący KRAN!', emoji: '👑' }
];


const MODES = [
  {
    id: 'translate',
    name: 'Błyskawiczny tłumacz',
    emoji: '🦜',
    desc: 'Spójrz na angielskie słowo i błyskawicznie wskaż polskie znaczenie.',
    color: ['#00b09b', '#96c93d'],
    badge: 'Klasyczny'
  },
  {
    id: 'bridge',
    name: 'Mosty Poli',
    emoji: '🌉',
    desc: 'Wskaż genialne polskie skojarzenie brzmieniowe (most), które łączy słowo ze znaczeniem.',
    color: ['#ff9966', '#ff5e62'],
    badge: 'Mnemotechnika'
  },
  {
    id: 'sprint',
    name: 'Sprint papugi',
    emoji: '⚡',
    desc: '30 sekund na zegarze! Ile słówek zdołasz przetłumaczyć w locie?',
    color: ['#f857a6', '#ff5858'],
    badge: 'Na czas'
  },
  {
    id: 'polyglot',
    name: 'Nieskończony poliglota',
    emoji: '🌎',
    desc: 'Gra aż do pierwszej pomyłki. Każda poprawna odpowiedź zwiększa mnożnik punktów!',
    color: ['#8e2de2', '#4a00e0'],
    badge: 'Nieskończony'
  }
];




const LESSONS = [
  {
    id: 'words-1',
    title: 'Metoda słów-kluczy',
    subtitle: 'Koniec z nudnym wkuwaniem słówek',
    desc: 'Odkryj metodę badaczy Atkinsona i Raugha, która zwiększa tempo nauki angielskiego trzykrotnie!',
    speech: 'Cześć, tu Papużka Pola! 🦜 Marzysz o swobodnych podróżach po świecie i piątkach z angielskiego? Pokażę Ci czarodziejski trik ze słowami-kluczami – zapamiętasz każde angielskie słówko w kilka sekund, bez nudnego wkuwania!',
    theory: [
      'Po co nam ta metoda? Zwykłe powtarzanie angielskich słówek po 50 razy w zeszycie jest nudne, męczące i szybko ulatuje z głowy.',
      'Metoda słów-kluczy (Keyword Method) to sekret poliglotów i mistrzów pamięci na całym świecie!',
      'Składa się z 2 prostych, zabawnych kroków:',
      '1. Znajdź polskie słowo, które brzmi podobnie do angielskiego wyrazu (to nasz Most Fonetyczny).',
      '2. Połącz ten dźwięk ze znaczeniem słówka w śmieszną, bajkową scenkę w wyobraźni!',
      'Gdy usłyszysz angielskie słowo, Twój mózg natychmiast przypomni sobie śmieszną scenkę i od razu znasz znaczenie!'
    ],
    task: {
      prompt: 'Z jakich dwóch kroków składa się metoda słów-kluczy w nauce angielskiego?',
      options: [
        'Most fonetyczny (brzmienie) + żywa scenka ze znaczeniem',
        'Przepisywanie słówka 100 razy w zeszycie',
        'Czekanie, aż słówko samo wejdzie do głowy',
        'Słuchanie nagrań przez sen'
      ],
      correct: 0,
      hint: 'Dźwiękowy most i wyobraźnia to klucz do sukcesu!'
    }
  },
  {
    id: 'words-2',
    title: 'Dźwiękowy bliźniak',
    subtitle: 'Jak brzmi angielskie „mushroom”?',
    desc: 'Uczymy się szukać polskich słów brzmiących jak angielski wyraz.',
    speech: 'Posłuchaj dźwięków! Każde angielskie słówko ma w języku polskim swojego śmiesznego bliźniaka!',
    theory: [
      'Krok 1 w praktyce: szukamy dźwiękowego bliźniaka.',
      'Spójrz na angielskie słówko „mushroom” (grzyb).',
      'Powiedz je na głos: „masz-rum”.',
      'Brzmi dokładnie jak polskie pytanie: „MASZ RUM?!” 🏴‍☠️',
      'Dźwiękowy bliźniak nie musi być w 100% idealny – wystarczy, że da Twojemu umysłowi wesoły punkt zaczepienia!'
    ],
    task: {
      prompt: 'Jaki polski zwrot brzmi niemal identycznie jak angielskie słówko „mushroom”?',
      options: ['MASZ RUM', 'MASZ SER', 'MYSZ W DOMU', 'MISKA ZUPY'],
      correct: 0,
      hint: 'Powiedz mushroom szybko na głos: masz-rum!'
    }
  },
  {
    id: 'words-3',
    title: 'Wybuchowa scenka',
    subtitle: 'Łączenie mostu ze znaczeniem',
    desc: 'Sam dźwięk nie wystarczy – musisz połączyć go z tym, co dane słówko oznacza.',
    speech: 'A teraz łączymy dźwięk ze znaczeniem! Zobacz tego pirackiego prawdziwka w swojej wyobraźni!',
    theory: [
      'Mamy już most „MASZ RUM” i wiemy, że mushroom oznacza GRZYB.',
      'Teraz najważniejszy moment – zrób z tego film przed oczami:',
      'Wielki leśny prawdziwek z wąsami i w trójkątnym kapeluszu pirata staje przed Tobą, uderza pięścią w stół i groźnie krzyczy: „MASZ RUM W BUTELCE?!”',
      'Poczuj zapach lasu i zobacz tego śmiesznego grzyba.',
      'Teraz już nigdy w życiu nie zapomnisz słowa mushroom!'
    ],
    task: {
      prompt: 'Co oznacza angielskie słówko „mushroom”?',
      options: ['Grzyb', 'Rum', 'Pirat', 'Butelka'],
      correct: 0,
      hint: 'Pamiętasz wielkiego leśnego prawdziwka żądającego rumu?'
    }
  },
  {
    id: 'words-4',
    title: 'Angielski w mig',
    subtitle: 'Candle, Feather, Pillow',
    desc: 'Trzy nowe angielskie słówka zapamiętane w minutę.',
    speech: 'Kraaa! Zobacz, jak w minutę zapamiętasz trzy angielskie słówka na klasówkę z angielskiego!',
    theory: [
      'Ćwiczymy kolejne angielskie mosty dźwiękowe:',
      '• CANDLE (świeca) → KUNDEL: wesoły kundelek biegnie z płonącą świecą na ogonie! 🕯️',
      '• FEATHER (pióro) → SWETER: z wełnianego swetra nagle wyrastają wielkie gęsie pióra! 🪶',
      '• PILLOW (poduszka) → PIŁA: drwal próbuje ściąć wielkie drzewo miękką puchową poduszką! 🛏️'
    ],
    task: {
      prompt: 'KUNDEL niosący świecę na ogonie pomaga zapamiętać słówko:',
      options: ['candle (świeca)', 'feather (pióro)', 'pillow (poduszka)', 'mushroom (grzyb)'],
      correct: 0,
      hint: 'Kundel = Candle!'
    }
  },
  {
    id: 'words-5',
    title: 'Kolejne perełki: Shark, Beetle, Fork',
    subtitle: 'Rekin Szarik, Chrząszcze The Beatles i Foka z widelcem',
    desc: 'Błyskawiczne skojarzenia dla rekinów, chrząszczy i widelców po angielsku!',
    speech: 'Zobacz, jak wesołe są angielskie skojarzenia! Każde słówko to gotowa historyjka!',
    theory: [
      'Poznajemy kolejne 3 angielskie perełki z naszej bogatej puli ponad 100 wyrazów:',
      '• SHARK (rekin) → SZARIK: groźny rekin w wodzie macha przyjaźnie ogonem i szczeka jak pies Szarik! 🦈',
      '• BEETLE (chrząszcz) → BITELSI: cztery chrząszcze w garniturach grają rocka jak zespół The Beatles! 🪲',
      '• FORK (widelec) → FOKA: cyrkowa foka na plaży żongluje na czubku nosa wielkim widelcem! 🍴'
    ],
    task: {
      prompt: 'FOKA żonglująca na nosie widelcem pomaga zapamiętać angielskie słowo:',
      options: ['fork (widelec)', 'shark (rekin)', 'beetle (chrząszcz)', 'candle (świeca)'],
      correct: 0,
      hint: 'Foka żongluje widelcem = fork!'
    }
  },
  {
    id: 'words-6',
    title: 'Egzamin Poligloty',
    subtitle: 'Wielki sprawdzian angielskich mostów',
    desc: 'Czas na ostateczny test u Papużki Poli! Błyskawiczne tłumaczenie z angielskiego.',
    speech: 'Wielki finał u Papużki Poli! Z tą techniką masz w pamięci ponad 100 angielskich słówek!',
    theory: [
      'Brawo! Masz w ręku najpotężniejsze narzędzie do nauki języka angielskiego na świecie.',
      'Gdy w szkole, filmie czy w podróży spotkasz nowe angielskie słówko:',
      '1. Usłysz jego dźwięk i znajdź polskiego bliźniaka.',
      '2. Stwórz wyrazistą, zabawną scenkę.',
      '3. Ciesz się swobodną znajomością angielskiego bez stresu i zakuwania! 🦜🇬🇧'
    ],
    task: {
      prompt: 'Co oznacza angielskie słówko „shark” (most: pies SZARIK machający ogonem w płetwie rekina)?',
      options: ['Rekin', 'Pies', 'Statek', 'Woda'],
      correct: 0,
      hint: 'Szarik jako rekin w oceanie!'
    }
  }
];








function mountMap(root, { nav }) {
  const parrot = createParrot({ size: 'md' });
  const prog = store.get('words.train', {});
  const doneCount = LESSONS.filter(l => prog[l.id]).length;

  const items = LESSONS.map((les, idx) => {
    const stars = prog[les.id] || 0;
    const isLocked = idx > 0 && !prog[LESSONS[idx - 1].id] && !prog[les.id];
    return h('div', { class: `map-node ${stars ? 'done' : ''} ${isLocked ? 'locked' : ''}` },
      h('div', { class: 'mn-idx' }, `${idx + 1}`),
      h('div', { class: 'mn-body' },
        h('h3', {}, les.title),
        h('p', {}, les.subtitle),
        h('div', { class: 'mn-stars' }, '⭐'.repeat(stars) || '☆☆☆')
      ),
      isLocked
        ? h('span', { class: 'mn-lock' }, '🔒')
        : h('a', { class: 'btn btn-sm btn-sub', href: `#/words/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, '3x szybsza nauka słówek z języka angielskiego! Zamiast wkuwać 50 razy, tworzysz jeden polski most dźwiękowy i pamiętasz znaczenie od razu!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/words', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🦜 ', h('span', { class: 'grad' }, 'Szkoła Językowa Papużki Poli')),
    h('p', { class: 'lead' }, 'Poznaj metodę słów-kluczy i zapamiętuj obce słówka w locie bez zakuwania.'),
    parrot.el,
    whyCard,
    h('div', { class: 'map-list' }, items)
  );

  root.append(view);
  setTimeout(() => {
    parrot.say(
      doneCount === 0
        ? 'A kysz, nudne powtórki! Jestem Papużka Pola 🦜 Pokażę Ci, jak zapamiętywać słówka w ułamku sekundy!'
        : `Brawo! ${doneCount}/${LESSONS.length} lekcji za nami! Lećmy dalej!`,
      'happy'
    );
  }, 200);

  return () => parrot.destroy();
}

function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const parrot = createParrot({ size: 'md' });
  let answered = false;

  const theoryBox = h('div', { class: 'theory-card' },
    h('h3', {}, '🦜 Papuzie odkrycie: ', les.title),
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '🦜 Podpowiedź Poli');
  hintBtn.addEventListener('click', () => {
    parrot.say(les.task.hint, 'think', { revert: 4000 });
  });

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/words/train', class: 'back' }, '← Mapa szkolenia')),
    h('div', { class: 'step-head' },
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    parrot.el,
    theoryBox,
    h('div', { class: 'task-box' },
      h('h3', { class: 'task-prompt' }, les.task.prompt),
      optContainer,
      h('div', { class: 'task-foot' }, hintBtn)
    )
  );

  function pick(idx, btn) {
    if (answered) return;
    const isOk = idx === les.task.correct;
    if (isOk) {
      answered = true;
      btn.classList.add('correct');
      sfx.success();
      parrot.setMood('cheer', 2500);
      parrot.say('Kraaa! Dokładnie tak! Twoja wyobraźnia działa cuda!', 'cheer');

      const prog = store.get('words.train', {});
      prog[les.id] = 3;
      store.set('words.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono kurs! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/words/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/words';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      parrot.setMood('sad', 1800);
      parrot.say(les.task.hint, 'think', { revert: 3500 });
      setTimeout(() => btn.classList.remove('wrong'), 800);
    }
  }

  (les.task.options || []).forEach((opt, idx) => {
    const btn = h('button', { class: 'btn-opt', type: 'button' }, opt);
    btn.addEventListener('click', () => pick(idx, btn));
    optContainer.append(btn);
  });

  root.append(view);
  setTimeout(() => {
    parrot.say(les.speech || `Lekcja ${index + 1}: ${les.subtitle}. Posłuchaj tego słówka!`, 'happy');
  }, 250);

  return () => parrot.destroy();
}









function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const parrot = createParrot({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let lives = 3;
  let timeLeft = modeId === 'sprint' ? 30 : 0;
  let timerInterval = null;
  let isGameOver = false;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const livesEl = (modeId === 'translate' || modeId === 'bridge') ? h('span', { class: 'hud-lives' }, '❤️❤️❤️') : null;
  const timerEl = modeId === 'sprint' ? h('span', { class: 'hud-timer' }, '⏱ 30s') : null;
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/words', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      livesEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Szanse'), livesEl) : null,
      timerEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Czas'), timerEl) : null
    ),
    parrot.el,
    playArea
  );

  root.append(view);

  const CHEERS = [
    'Kraaa! Poliglota w pełnej krasie! 🦜✨',
    'Most fonetyczny połączył słowa idealnie! 🌉⭐',
    'Mówisz jak rodowity mieszkaniec! 🗣️🎉',
    'Słowo wyryte w pamięci na zawsze! 📖💎',
    'Bez pudła! Języki świata stoją przed Tobą otworem! 🌍🎯',
    'Pola śpiewa z zachwytu! Co za słuch i pamięć! 🎶🦜',
    'Genialne skojarzenie! Pędzimy do kolejnych słówek! 🚀💡'
  ];
  function cheerParrot(c) {
    if (c % 5 === 0 && c > 0) {
      parrot.say(`Niewiarygodne combo x${c}! Pola bije skrzydłami w piruecie! 🦜👑✨`, 'cheer', { revert: 1800 });
      parrot.spin?.();
    } else if (c % 2 === 0 && c > 0) {
      parrot.say(`Combo x${c}! Twój słownik pęka w szwach! 🦜🎶`, 'cheer', { revert: 1400 });
      parrot.hop?.();
    } else {
      parrot.hop?.();
      parrot.say(rand(CHEERS), 'cheer', { revert: 1100 });
    }
  }

  function updateLives() {
    if (livesEl) {
      livesEl.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
    }
  }

  function saveBest() {
    const prev = store.get(`words.best.${modeId}`, 0);
    if (score > prev) store.set(`words.best.${modeId}`, score);
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }, 1000);
  }

  function restartGame() {
    isGameOver = false;
    score = 0;
    round = 1;
    combo = 0;
    lives = 3;
    timeLeft = modeId === 'sprint' ? 30 : 0;
    scoreEl.textContent = '0';
    roundEl.textContent = '1';
    updateLives();
    if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
    if (timerInterval) clearInterval(timerInterval);
    if (modeId === 'sprint') startTimer();
    parrot.setMood('happy');
    parrot.say('Zaczynamy od nowa! Poliglotyczna przygoda trwa! 🦜✨', 'happy');
    nextRound();
  }

  function gameOver() {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    saveBest();
    sfx.fanfare();
    parrot.setMood('cheer', 3000);
    parrot.say(`Koniec gry! Twój wynik: ${score} pkt! Pola jest z Ciebie dumna! 🦜`, 'cheer');

    const best = store.get(`words.best.${modeId}`, score);
    playArea.innerHTML = '';

    const restartBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Zagraj ponownie ↻');
    restartBtn.addEventListener('click', restartGame);
    const backBtn = h('a', { class: 'btn btn-ghost', href: '#/words' }, 'Inny tryb');

    playArea.append(
      h('div', { class: 'game-over-box' },
        h('h2', {}, '🎉 Rewelacyjny wynik!'),
        h('div', { class: 'go-score' },
          h('b', {}, `${score}`),
          h('span', {}, 'punktów')
        ),
        h('div', { class: 'go-best' }, `🏆 Rekord w tym trybie: ${best}`),
        h('div', { class: 'go-actions' }, restartBtn, backBtn)
      )
    );
  }

  function handleWrong(solutionText) {
    sfx.wrong();
    combo = 0;
    if (modeId === 'polyglot') {
      gameOver();
      return;
    }
    lives--;
    updateLives();
    if (lives <= 0) {
      gameOver();
    } else {
      parrot.setMood('sad', 1200);
      parrot.say(`${solutionText} Pozostało szans: ${lives} 🦜`, 'think', { revert: 2600 });
      setTimeout(nextRound, 1200);
    }
  }

  function nextRound() {
    if (isGameOver) return;
    playArea.innerHTML = '';

    const target = VOCAB[rand(0, VOCAB.length - 1)];
    const others = VOCAB.filter(v => v.id !== target.id);
    const wrong = shuffle(others).slice(0, 3);

    if (modeId === 'translate' || modeId === 'sprint' || modeId === 'polyglot') {
      const choices = shuffle([target, ...wrong]);
      const card = h('div', { class: 'vocab-card' },
        h('span', { class: 'vocab-emoji' }, target.emoji),
        h('h2', { class: 'vocab-word' }, target.foreign),
        h('span', { class: 'vocab-lang' }, `Język: ${target.lang}`),
        round <= 2 && modeId === 'translate' ? h('p', { class: 'muted' }, `Wymowa zbliżona do: „${target.bridge}”`) : null
      );

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, c.meaning);
        btn.addEventListener('click', () => {
          if (c.id === target.id) {
            sfx.success();
            score += 10 + combo * 2;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerParrot(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            if (modeId === 'sprint') {
              sfx.wrong();
              setTimeout(nextRound, 300);
            } else {
              handleWrong(`${target.foreign} to ${target.meaning} (most: ${target.bridge})!`);
            }
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'bridge') {
      const choices = shuffle([target, ...wrong]);
      const card = h('div', { class: 'vocab-card' },
        h('span', { class: 'vocab-emoji' }, target.emoji),
        h('h2', { class: 'vocab-word' }, target.foreign),
        h('p', {}, `Znaczenie: `, h('b', {}, target.meaning)),
        h('p', { class: 'muted' }, 'Jaki jest polski most fonetyczny (brzmieniowy) dla tego słowa?')
      );

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, c.bridge);
        btn.addEventListener('click', () => {
          if (c.id === target.id) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerParrot(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            handleWrong(`Mostem dla ${target.foreign} jest: ${target.bridge}!`);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);
    }
  }

  if (modeId === 'sprint') {
    startTimer();
  }

  nextRound();

  return () => {
    if (timerInterval) clearInterval(timerInterval);
    parrot.destroy();
  };
}










function mountMenu(root, { nav }) {
  const parrot = createParrot({ size: 'md' });
  const prog = store.get('words.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/words/train' : `#/words/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🦜 Szkolenie z Papużką Polą'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę słówek' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
        h('p', {}, `${LESSONS.length} lekcji · metoda słów-kluczy · ponad 100 angielskich słówek w locie`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/words/train' }, 'Zobacz mapę lekcji →');

  const modeCards = MODES.map(m => {
    const best = store.get(`words.best.${m.id}`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/words/free/${m.id}`,
      style: `--c1:${m.color[0]};--c2:${m.color[1]}`
    },
      h('div', { class: 'mc-emoji' }, m.emoji),
      h('div', { class: 'mc-body' },
        h('h3', {}, m.name),
        h('p', {}, m.desc)
      ),
      h('div', { class: 'mc-best' },
        h('b', {}, best ? `${best}` : '–'),
        h('span', {}, best ? 'rekord' : 'brak')
      )
    );
  });

  const view = h('section', { class: 'screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
    h('div', { class: 'game-head' },
      h('div', {},
        h('h1', {}, '🦜 ', h('span', { class: 'grad' }, 'Słówka i języki obce')),
        h('p', { class: 'lead' }, 'Naucz się obcych języków bez zkuwania. Twórz dźwiękowe mosty i żywe sceny!')
      )
    ),
    parrot.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Kraaa! Jestem Papużka Pola 🦜 Pokażę Ci, jak zapamiętywać słówka w 3 sekundy!'
    : done < LESSONS.length
      ? `Zrobiliśmy ${done} z ${LESSONS.length} lekcji! Lecimy dalej z językami?`
      : 'Znasz już metodę słów-kluczy jak prawdziwy poliglota! Wybierz tryb gry! 🏆';

  setTimeout(() => { parrot.say(greet, 'happy'); }, 300);
  return () => parrot.destroy();
}

return {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};

  })();
  


  /* --- CARDS GAME MODULE --- */
  const cardsGame = (function() {
    const SUITS = [
  { id: 'spades', symbol: '♠', name: 'Pik', color: '#1e293b', theme: 'Noc / Cień / Iluzja' },
  { id: 'hearts', symbol: '♥', name: 'Kier', color: '#e11d48', theme: 'Ogień / Pasja / Rycerze' },
  { id: 'diamonds', symbol: '♦', name: 'Karo', color: '#ea580c', theme: 'Złoto / Klejnoty / Bogactwo' },
  { id: 'clubs', symbol: '♣', name: 'Trefl', color: '#16a34a', theme: 'Natura / Las / Tajemnica' }
];

const CARDS_PAO = [
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

function getCardSvg(card) {
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


const MODES = [
  {
    id: 'sequence',
    name: 'Sekwencja magika',
    emoji: '🎴',
    desc: 'Szop Magik tasuje i odkrywa karty. Zapamiętaj ich kolejność i odtwórz bezbłędnie!',
    color: ['#ff416c', '#ff4b2b'],
    badge: 'Pamięć'
  },
  {
    id: 'pao',
    name: 'Rozpoznaj PAO',
    emoji: '🎭',
    desc: 'Spójrz na kartę i wskaż jej postać, unikalną akcję lub rekwizyt.',
    color: ['#7f00ff', '#e100ff'],
    badge: 'Kojarzenie'
  },
  {
    id: 'missing',
    name: 'Zaginiona karta',
    emoji: '❓',
    desc: 'Cztery karty leżą na stole. Szop zakrywa jedną z nich – zgadniesz, która zniknęła?',
    color: ['#00c6ff', '#0072ff'],
    badge: 'Koncentracja'
  },
  {
    id: 'deck_rush',
    name: 'Gorączka talii',
    emoji: '⚡',
    desc: '30 sekund! Błyskawiczne odczytywanie kart i ich znaczeń w zawrotnym tempie.',
    color: ['#f7971e', '#ffd200'],
    badge: 'Na czas'
  }
];




const LESSONS = [
  {
    id: 'cards-1',
    title: 'Cztery żywioły talii',
    subtitle: 'Pik, Kier, Karo i Trefl',
    desc: 'Poznaj cztery kolory talii i ich wizualne motywy przewodnie.',
    speech: 'Abrakadabra! Cześć, jestem Szop Magik! 🦝 Czy wiesz, jak iluzjoniści pamiętają całą talię kart w kilkadziesiąt sekund? Zamieniają nudne figury w superbohaterów i kręcą z nich bajkowy film! Pokażę Ci, jak to zrobić!',
    theory: [
      'Po co uczyć się zapamiętywania kart? To nie tylko wspaniała sztuczka, którą zachwycisz kolegów w szkole i rodzinę przy stole!',
      'System PAO (karty i sekwencje) to najpotężniejsza technika do zapamiętywania długich ciągów kolejnych kroków, przepisów, procedur i list!',
      'Zaczynamy od 4 magicznych żywiołów talii:',
      '• PIK (♠) – tajemniczy, czarny świat magów, iluzjonistów i nocy.',
      '• KIER (♥) – czerwone serca, dzielni rycerze, królowie, ogień i przygoda.',
      '• KARO (♦) – diamenty, złoto, bogactwo, skrzynie skarbów i piraci.',
      '• TREFL (♣) – zielone liście, las, natura, druidzi i leśni łucznicy.',
      'Gdy widzisz kolor, od razu wiesz, do jakiego świata należy karta!'
    ],
    task: {
      prompt: 'Jaki motyw wizualny odpowiada kolorowi KARO (♦)?',
      options: ['Diamenty, złoto i skarby', 'Noc i cienie', 'Las i koniczyna', 'Śnieg i lód'],
      correct: 0,
      hint: 'Karo to kształt diamentu – kojarzy się z bogactwem i skarbami!'
    }
  },
  {
    id: 'cards-2',
    title: 'Karty dworskie',
    subtitle: 'Walet, Dama i Król',
    desc: 'Figury to najpotężniejsze persony w talii. Każda ma swoją osobowość.',
    speech: 'Oto nasi bohaterowie! Każda figura zamienia się w żywą postać z bajki!',
    theory: [
      'Karty dworskie najłatwiej zamienić na wyrazistych bohaterów:',
      '• Król Kier (K♥) → Król Artur w złotej koronie ze świecącym mieczem Excalibur 👑',
      '• Dama Karo (Q♦) → Królowa Kleopatra rzucająca lśniącym błękitnym diamentem 💎',
      '• Walet Trefl (J♣) → Robin Hood strzelający z potężnego dębowego łuku 🏹',
      '• As Pik (A♠) → Szop Magik wyciągający lśniący cylinder z kapelusza 🦝',
      'Zamiast płaskiego kartonika widzisz żywą postać jak z komiksu!'
    ],
    task: {
      prompt: 'Kim jest Król Kier (K♥) w naszym systemie kart?',
      options: ['Król Artur ze złotym mieczem Excalibur', 'Szop Magik z cylindrem', 'Robin Hood z łukiem', 'Batman z batarangiem'],
      correct: 0,
      hint: 'Kier to czerwone serce i rycerski Król Artur!'
    }
  },
  {
    id: 'cards-3',
    title: 'Filozofia PAO',
    subtitle: 'Postać, Akcja i Obiekt',
    desc: 'Metoda stosowana przez rekordzistów Guinnessa do zapamiętania 52 kart w 20 sekund!',
    speech: 'Sekret rekordzistów Guinnessa: formuła PAO! Trzy karty zamieniamy w jedną bajkę!',
    theory: [
      'System PAO (Person - Action - Object) przypisuje do każdej karty:',
      '1. POSTAĆ (kto to jest?)',
      '2. AKCJĘ (co robi?)',
      '3. OBIEKT (czym się bawi lub czym rzuca?)',
      'Dzięki temu jedna karta daje postać, druga jej akcję, a trzecia przedmiot.',
      'To pozwala skompresować aż 3 karty w JEDEN zabawny, filmowy kadr w głowie!'
    ],
    task: {
      prompt: 'Co oznacza skrót metody PAO?',
      options: ['Person – Action – Object (Postać – Akcja – Obiekt)', 'Play – Ace – Over', 'Power – Agility – Order', 'Pakiet – Atut – Opcja'],
      correct: 0,
      hint: 'Pamiętasz: Postać wykonuje Akcję z Obiektem!'
    }
  },
  {
    id: 'cards-4',
    title: 'Łączenie 2 kart w 1 scenę',
    subtitle: 'Fuzja Króla Artura i Kleopatry',
    desc: 'Jak zapamiętać parę kart w ułamku sekundy?',
    speech: 'Połączmy dwie karty w jedną scenę! Król Artur i Kleopatra robią coś szalonego!',
    theory: [
      'Wyobraź sobie parę kart: pierwsza to Król Kier (K♥), a druga to Dama Karo (Q♦).',
      'Bierzemy POSTAĆ z pierwszej karty: Król Artur 👑',
      'I bierzemy AKCJĘ + OBIEKT z drugiej karty: rzuca błękitnym diamentem 💎!',
      'Scena w głowie: Król Artur bierze zamach i z całej siły ciska wielkim diamentem w dal!',
      'Gdy widzisz tę scenę przed oczami, natychmiast odczytujesz: K♥ oraz Q♦!'
    ],
    task: {
      prompt: 'Jakie karty koduje scena: „Król Artur rzuca wielkim błękitnym diamentem”?',
      options: ['Król Kier (K♥) + Dama Karo (Q♦)', 'As Pik + Walet Trefl', '10 Pik + 7 Kier', 'Dama Karo + Król Trefl'],
      correct: 0,
      hint: 'Król Artur (K♥) wykonuje akcję diamentu Kleopatry (Q♦)!'
    }
  },
  {
    id: 'cards-5',
    title: 'Praktyka: Rozdanie pokerowe',
    subtitle: 'Zapamiętaj 3 karty na stole',
    desc: 'Sprawdź swoje umiejętności na stole do gry.',
    speech: 'Prawdziwe rozdanie na stole! Trzy karty zapamiętane w 3 sekundy!',
    theory: [
      'Na stole lądują 3 karty: As Pik (A♠), Walet Trefl (J♣) i 7 Kier (7♥).',
      '• A♠ = Szop Magik (Postać)',
      '• J♣ = napina i strzela z dębowego łuku (Akcja)',
      '• 7♥ = kieliszek złotego napoju (Obiekt)',
      'Zobacz to: Szop Magik bierze wielki łuk i z uśmiechem wystrzeliwuje z niego kieliszek niczym strzałę!',
      'Śmieszne, wyraziste i nie do zapomnienia!'
    ],
    task: {
      prompt: 'Kto strzelał z łuku w naszej scenie (reprezentując Asa Pik)?',
      options: ['Szop Magik', 'Batman', 'Król Artur', 'Druid'],
      correct: 0,
      hint: 'As Pik to nasz uroczy Szop Magik!'
    }
  },
  {
    id: 'cards-6',
    title: 'Egzamin Iluzjonisty',
    subtitle: 'Ostateczny test Szopa Magika',
    desc: 'Opanowałeś tajniki talii kart. Czas na certyfikat iluzjonisty!',
    speech: 'Wielki egzamin iluzjonisty! Twoja pamięć jest teraz szybsza niż zręczne dłonie magika!',
    theory: [
      'Brawo! Znasz już sekrety pamięciowych iluzjonistów:',
      '1. 4 żywioły kolorów talii.',
      '2. Postacie dworskie.',
      '3. Formuła PAO (Postać - Akcja - Obiekt).',
      'Teraz jesteś gotowy na każdą rozgrywkę z przyjaciółmi i grę swobodną!'
    ],
    task: {
      prompt: 'Co wyciąga Szop Magik z cylindra na karcie As Pik?',
      options: ['Świecący cylinder / magiczny rekwizyt', 'Pocisk armatni', 'Kawałek pizzy', 'Szklaną kulę'],
      correct: 0,
      hint: 'Magik zawsze żongluje cylindrem!'
    }
  }
];








function mountMap(root, { nav }) {
  const raccoon = createRaccoon({ size: 'md' });
  const prog = store.get('cards.train', {});
  const doneCount = LESSONS.filter(l => prog[l.id]).length;

  const items = LESSONS.map((les, idx) => {
    const stars = prog[les.id] || 0;
    const isLocked = idx > 0 && !prog[LESSONS[idx - 1].id] && !prog[les.id];
    return h('div', { class: `map-node ${stars ? 'done' : ''} ${isLocked ? 'locked' : ''}` },
      h('div', { class: 'mn-idx' }, `${idx + 1}`),
      h('div', { class: 'mn-body' },
        h('h3', {}, les.title),
        h('p', {}, les.subtitle),
        h('div', { class: 'mn-stars' }, '⭐'.repeat(stars) || '☆☆☆')
      ),
      isLocked
        ? h('span', { class: 'mn-lock' }, '🔒')
        : h('a', { class: 'btn btn-sm btn-sub', href: `#/cards/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, 'Elitarny trening skupienia, uwagi i pamięci roboczej stosowany przez arcymistrzów. Zwiększa koncentrację przy nauce, pozwala dominować w grach karcianych i uczy kodowania złożonych procedur!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/cards', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🦝 ', h('span', { class: 'grad' }, 'Szkoła Magii Kart')),
    h('p', { class: 'lead' }, 'Poznaj technikę PAO i zapamiętuj całe talie kart z Szopem Magikiem.'),
    raccoon.el,
    whyCard,
    h('div', { class: 'map-list' }, items)
  );

  root.append(view);
  setTimeout(() => {
    raccoon.say(
      doneCount === 0
        ? 'Tadaam! Jestem Szop Magik 🦝 Talia 52 kart w głowie to żaden problem, to czysta iluzja!'
        : `Świetny postęp! ${doneCount}/${LESSONS.length} lekcji za nami! Tasujemy dalej!`,
      'happy'
    );
  }, 200);

  return () => raccoon.destroy();
}

function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const raccoon = createRaccoon({ size: 'md' });
  let answered = false;

  const theoryBox = h('div', { class: 'theory-card' },
    h('h3', {}, '🦝 Magiczna sztuczka Szopa: ', les.title),
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '🦝 Podpowiedź Szopa');
  hintBtn.addEventListener('click', () => {
    raccoon.say(les.task.hint, 'think', { revert: 4000 });
  });

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/cards/train', class: 'back' }, '← Mapa szkolenia')),
    h('div', { class: 'step-head' },
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    raccoon.el,
    theoryBox,
    h('div', { class: 'task-box' },
      h('h3', { class: 'task-prompt' }, les.task.prompt),
      optContainer,
      h('div', { class: 'task-foot' }, hintBtn)
    )
  );

  function pick(idx, btn) {
    if (answered) return;
    const isOk = idx === les.task.correct;
    if (isOk) {
      answered = true;
      btn.classList.add('correct');
      sfx.success();
      raccoon.setMood('cheer', 2500);
      raccoon.say('Brawo! Prawdziwy mistrz iluzji!', 'cheer');

      const prog = store.get('cards.train', {});
      prog[les.id] = 3;
      store.set('cards.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono szkołę magii! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/cards/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/cards';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      raccoon.setMood('sad', 1800);
      raccoon.say(les.task.hint, 'think', { revert: 3500 });
      setTimeout(() => btn.classList.remove('wrong'), 800);
    }
  }

  (les.task.options || []).forEach((opt, idx) => {
    const btn = h('button', { class: 'btn-opt', type: 'button' }, opt);
    btn.addEventListener('click', () => pick(idx, btn));
    optContainer.append(btn);
  });

  root.append(view);
  setTimeout(() => {
    raccoon.say(les.speech || `Abrakadabra! Lekcja ${index + 1}: ${les.subtitle}. Spójrz na magiczną sztuczkę!`, 'happy');
  }, 250);

  return () => raccoon.destroy();
}









function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const raccoon = createRaccoon({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let lives = 3;
  let timeLeft = modeId === 'deck_rush' ? 30 : 0;
  let timerInterval = null;
  let isGameOver = false;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const livesEl = (modeId === 'pao' || modeId === 'missing') ? h('span', { class: 'hud-lives' }, '❤️❤️❤️') : null;
  const timerEl = modeId === 'deck_rush' ? h('span', { class: 'hud-timer' }, '⏱ 30s') : null;
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/cards', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      livesEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Szanse'), livesEl) : null,
      timerEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Czas'), timerEl) : null
    ),
    raccoon.el,
    playArea
  );

  root.append(view);

  const CHEERS = [
    'Abrakadabra! Czysta iluzja pamięci! 🦝✨',
    'Karta w garści! As wyciągnięty z rękawa! ♠️🎩',
    'Magia PAO działa bezbłędnie! Postać i akcja w punkt! 🪄⭐',
    'Oklaski na sali! Szop Magik kłania się z kapeluszem! 👏🃏',
    'Talia kart nie ma przed Tobą tajemnic! 👑💎',
    'Niezwykły pokaz zręczności umysłu! Płyniemy dalej! 🚀🦝'
  ];
  function cheerRaccoon(c) {
    if (c % 5 === 0 && c > 0) {
      raccoon.say(`Potężne combo x${c}! Szop kręci cylinder w piruecie! 🦝🎩✨`, 'cheer', { revert: 1800 });
      raccoon.spin?.();
    } else if (c % 2 === 0 && c > 0) {
      raccoon.say(`Combo x${c}! Cała talia drży przed Twoją pamięcią! 🦝🪄`, 'cheer', { revert: 1400 });
      raccoon.hop?.();
    } else {
      raccoon.hop?.();
      raccoon.say(rand(CHEERS), 'cheer', { revert: 1100 });
    }
  }

  function updateLives() {
    if (livesEl) {
      livesEl.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
    }
  }

  function saveBest() {
    const prev = store.get(`cards.best.${modeId}`, 0);
    if (score > prev) store.set(`cards.best.${modeId}`, score);
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }, 1000);
  }

  function restartGame() {
    isGameOver = false;
    score = 0;
    round = 1;
    combo = 0;
    lives = 3;
    timeLeft = modeId === 'deck_rush' ? 30 : 0;
    scoreEl.textContent = '0';
    roundEl.textContent = '1';
    updateLives();
    if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
    if (timerInterval) clearInterval(timerInterval);
    if (modeId === 'deck_rush') startTimer();
    raccoon.setMood('happy');
    raccoon.say('Zaczynamy od nowa! Pokaż mistrzowską pamięć! 🦝✨', 'happy');
    nextRound();
  }

  function gameOver() {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    saveBest();
    sfx.fanfare();
    raccoon.setMood('cheer', 3000);
    raccoon.say(`Brawo! Koniec pokazu magii! Twój wynik: ${score} pkt! 🦝`, 'cheer');

    const best = store.get(`cards.best.${modeId}`, score);
    playArea.innerHTML = '';

    const restartBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Zagraj ponownie ↻');
    restartBtn.addEventListener('click', restartGame);
    const backBtn = h('a', { class: 'btn btn-ghost', href: '#/cards' }, 'Inny tryb');

    playArea.append(
      h('div', { class: 'game-over-box' },
        h('h2', {}, '🎉 Pokaz zakończony sukcesem!'),
        h('div', { class: 'go-score' },
          h('b', {}, `${score}`),
          h('span', {}, 'punktów')
        ),
        h('div', { class: 'go-best' }, `🏆 Rekord w tym trybie: ${best}`),
        h('div', { class: 'go-actions' }, restartBtn, backBtn)
      )
    );
  }

  async function nextRound() {
    if (isGameOver) return;
    playArea.innerHTML = '';

    if (modeId === 'sequence') {
      const seqLen = Math.min(10, 2 + Math.floor(round / 2));
      const sequence = shuffle([...CARDS_PAO]).slice(0, seqLen);

      const previewBox = h('div', { class: 'cards-preview-box' },
        h('h3', {}, `Zapamiętaj kolejność ${seqLen} kart!`),
        h('div', { class: 'cards-row' }, sequence.map(c => h('div', { html: getCardSvg(c) })))
      );
      playArea.append(previewBox);

      await sleep(1800 + seqLen * 500);
      if (isGameOver) return;
      playArea.innerHTML = '';

      let pickedIndex = 0;
      const pickState = h('div', { class: 'pick-state' },
        h('h3', {}, `Wybierz kartę nr `, h('span', { class: 'grad' }, `${pickedIndex + 1}`), ` z ${seqLen}:`),
        h('div', { class: 'selected-cards-row' })
      );

      const allChoices = shuffle([...sequence]);
      const choicesGrid = h('div', { class: 'cards-choices-grid' });
      allChoices.forEach(card => {
        const btn = h('button', { class: 'card-choice-btn', type: 'button', html: getCardSvg(card) });
        btn.addEventListener('click', () => {
          if (card.id === sequence[pickedIndex].id) {
            sfx.pop();
            btn.disabled = true;
            btn.style.opacity = '0.3';
            pickState.querySelector('.selected-cards-row').append(h('div', { html: getCardSvg(card) }));
            pickedIndex++;
            if (pickedIndex >= seqLen) {
              sfx.success();
              score += seqLen * 10 + combo * 2;
              combo++;
              round++;
              scoreEl.textContent = `${score}`;
              roundEl.textContent = `${round}`;
              cheerRaccoon(combo);
              nextRound();
            } else {
              pickState.querySelector('span.grad').textContent = `${pickedIndex + 1}`;
            }
          } else {
            sfx.wrong();
            gameOver();
          }
        });
        choicesGrid.append(btn);
      });

      playArea.append(pickState, choicesGrid);

    } else if (modeId === 'pao') {
      const target = CARDS_PAO[rand(0, CARDS_PAO.length - 1)];
      const others = CARDS_PAO.filter(c => c.id !== target.id);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([target, ...wrong]);

      const card = h('div', { class: 'cards-pao-card' },
        h('div', { class: 'target-card-wrap', html: getCardSvg(target) }),
        h('p', {}, `Jaka postać i akcja odpowiada tej karcie?`)
      );

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${c.person} – ${c.action}`);
        btn.addEventListener('click', () => {
          if (c.id === target.id) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerRaccoon(combo);
            nextRound();
          } else {
            sfx.wrong();
            combo = 0;
            lives--;
            updateLives();
            btn.classList.add('wrong');
            if (lives <= 0) {
              gameOver();
            } else {
              raccoon.setMood('sad', 1200);
              raccoon.say(`Ojej! ${target.name} to: ${target.person} (${target.action})! Masz jeszcze ${lives} szanse. 🦝`, 'think', { revert: 2600 });
              setTimeout(nextRound, 1200);
            }
          }
        });
        opts.append(btn);
      });

      playArea.append(card, opts);

    } else if (modeId === 'missing') {
      const cardCount = Math.min(6, 3 + Math.floor(round / 3));
      const poolCards = shuffle([...CARDS_PAO]).slice(0, cardCount);
      const hiddenIdx = rand(0, poolCards.length - 1);
      const hiddenCard = poolCards[hiddenIdx];

      const previewBox = h('div', { class: 'cards-preview-box' },
        h('h3', {}, `Zapamiętaj te ${cardCount} karty!`),
        h('div', { class: 'cards-row' }, poolCards.map(c => h('div', { html: getCardSvg(c) })))
      );
      playArea.append(previewBox);

      await sleep(1800 + cardCount * 400);
      if (isGameOver) return;
      playArea.innerHTML = '';

      const coveredRow = h('div', { class: 'cards-row' },
        poolCards.map((c, i) => i === hiddenIdx
          ? h('div', { class: 'playing-card card-back' }, '❓')
          : h('div', { html: getCardSvg(c) })
        )
      );

      const question = h('div', { class: 'missing-q' },
        h('h3', {}, 'Która karta została zakryta?'),
        coveredRow
      );

      const others = CARDS_PAO.filter(c => c.id !== hiddenCard.id);
      const choices = shuffle([hiddenCard, ...shuffle(others).slice(0, 3)]);
      const opts = h('div', { class: 'opt-grid' });

      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${c.name} (${c.person})`);
        btn.addEventListener('click', () => {
          if (c.id === hiddenCard.id) {
            sfx.success();
            score += 20 + combo * 4;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerRaccoon(combo);
            nextRound();
          } else {
            sfx.wrong();
            combo = 0;
            lives--;
            updateLives();
            btn.classList.add('wrong');
            if (lives <= 0) {
              gameOver();
            } else {
              raccoon.setMood('sad', 1200);
              raccoon.say(`Zakrytą kartą był ${hiddenCard.name}! Zostały Ci ${lives} szanse. 🦝`, 'think', { revert: 2600 });
              setTimeout(nextRound, 1200);
            }
          }
        });
        opts.append(btn);
      });

      playArea.append(question, opts);

    } else if (modeId === 'deck_rush') {
      const target = CARDS_PAO[rand(0, CARDS_PAO.length - 1)];
      const others = CARDS_PAO.filter(c => c.id !== target.id);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([target, ...wrong]);

      const card = h('div', { class: 'cards-pao-card' },
        h('div', { class: 'target-card-wrap', html: getCardSvg(target) })
      );

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, c.name);
        btn.addEventListener('click', () => {
          if (c.id === target.id) {
            sfx.pop();
            score += 10;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            nextRound();
          } else {
            sfx.wrong();
            btn.classList.add('wrong');
            setTimeout(nextRound, 300);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);
    }
  }

  if (modeId === 'deck_rush') {
    startTimer();
  }

  nextRound();

  return () => {
    if (timerInterval) clearInterval(timerInterval);
    raccoon.destroy();
  };
}










function mountMenu(root, { nav }) {
  const raccoon = createRaccoon({ size: 'md' });
  const prog = store.get('cards.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/cards/train' : `#/cards/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🦝 Szkoła Magii Szopa Magika'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę kart' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
        h('p', {}, `${LESSONS.length} lekcji · żywioły talii · metoda PAO · zapamiętywanie rozdań`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/cards/train' }, 'Zobacz mapę lekcji magii →');

  const modeCards = MODES.map(m => {
    const best = store.get(`cards.best.${m.id}`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/cards/free/${m.id}`,
      style: `--c1:${m.color[0]};--c2:${m.color[1]}`
    },
      h('div', { class: 'mc-emoji' }, m.emoji),
      h('div', { class: 'mc-body' },
        h('h3', {}, m.name),
        h('p', {}, m.desc)
      ),
      h('div', { class: 'mc-best' },
        h('b', {}, best ? `${best}` : '–'),
        h('span', {}, best ? 'rekord' : 'brak')
      )
    );
  });

  const view = h('section', { class: 'screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
    h('div', { class: 'game-head' },
      h('div', {},
        h('h1', {}, '🦝 ', h('span', { class: 'grad' }, 'Karty do gry')),
        h('p', { class: 'lead' }, 'Cała talia 52 kart w głowie! Poznaj system PAO stosowany przez mistrzów iluzji i pamięci.')
      )
    ),
    raccoon.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Tadaam! Jestem Szop Magik 🦝 Pokażę Ci, jak zapamiętać dowolny układ kart!'
    : done < LESSONS.length
      ? `Masz za sobą ${done} z ${LESSONS.length} lekcji. Dokończmy szkolenie iluzji!`
      : 'Twoja pamięć kart jest magiczna! Czas na grę swobodną! 🏆';

  setTimeout(() => { raccoon.say(greet, 'happy'); }, 300);
  return () => raccoon.destroy();
}

return {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};

  })();
  


  /* --- LINK GAME MODULE --- */
  const linkGame = (function() {
    const LINK_ITEMS = [
  { id: 'li1', name: 'Parasol', emoji: '☂️', storyAction: 'otwiera się z hukiem i z impetem taranuje soczystego...' },
  { id: 'li2', name: 'Arbuz', emoji: '🍉', storyAction: 'eksploduje fontanną słodkiego soku, na którym ślizga się...' },
  { id: 'li3', name: 'Rower', emoji: '🚲', storyAction: 'trąbi jak szalony i z łomotem wpada na gigantyczny...' },
  { id: 'li4', name: 'Zegar', emoji: '⏰', storyAction: 'bije na alarm i porywa go wysoko w chmury kolorowy...' },
  { id: 'li5', name: 'Balon', emoji: '🎈', storyAction: 'unosi się w powietrzu i przebija go ostry pustynny...' },
  { id: 'li6', name: 'Kaktus', emoji: '🌵', storyAction: 'w który z głośnym brzękiem uderza grająca rocka...' },
  { id: 'li7', name: 'Gitara', emoji: '🎸', storyAction: 'na której struny skapują z góry zimne, pyszne...' },
  { id: 'li8', name: 'Lody', emoji: '🍦', storyAction: 'w których zamrożony jest wielki, złoty...' },
  { id: 'li9', name: 'Klucz', emoji: '🔑', storyAction: 'który z błyskiem rozświetla silna kieszonkowa...' },
  { id: 'li10', name: 'Latarka', emoji: '🔦', storyAction: 'której snop światła pada na lśniący, drogocenny...' },
  { id: 'li11', name: 'Skarb', emoji: '💎', storyAction: 'którego w jaskini pilnuje potężny, ziejący ogniem...' },
  { id: 'li12', name: 'Smok', emoji: '🐉', storyAction: 'który ryczy i odpala wielką, srebrną...' },
  { id: 'li13', name: 'Rakieta', emoji: '🚀', storyAction: 'która z prędkością światła ląduje na srebrzystym...' },
  { id: 'li14', name: 'Księżyc', emoji: '🌙', storyAction: 'który okazuje się w całości zrobiony z żółtego...' },
  { id: 'li15', name: 'Ser', emoji: '🧀', storyAction: 'w którym wielkie dziury wygryza mała, zwinna...' },
  { id: 'li16', name: 'Mysz', emoji: '🐭', storyAction: 'która ucieka i z impetem skacze na sprężystą...' },
  { id: 'li17', name: 'Trampolina', emoji: '🎪', storyAction: 'która wystrzeliwuje mysz wprost w wielki czekoladowy...' },
  { id: 'li18', name: 'Tort', emoji: '🎂', storyAction: 'na którego samym szczycie płonie woskowa...' },
  { id: 'li19', name: 'Świeca', emoji: '🕯️', storyAction: 'której rozgrzany wosk zastyga w magiczny, błyszczący...' },
  { id: 'li20', name: 'Kryształ', emoji: '🔮', storyAction: 'który w środku odbija cały ten 20-elementowy świat skojarzeń!' }
];


const MODES = [
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




const LESSONS = [
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








function mountMap(root, { nav }) {
  const squirrel = createSquirrel({ size: 'md' });
  const prog = store.get('link.train', {});
  const doneCount = LESSONS.filter(l => prog[l.id]).length;

  const items = LESSONS.map((les, idx) => {
    const stars = prog[les.id] || 0;
    const isLocked = idx > 0 && !prog[LESSONS[idx - 1].id] && !prog[les.id];
    return h('div', { class: `map-node ${stars ? 'done' : ''} ${isLocked ? 'locked' : ''}` },
      h('div', { class: 'mn-idx' }, `${idx + 1}`),
      h('div', { class: 'mn-body' },
        h('h3', {}, les.title),
        h('p', {}, les.subtitle),
        h('div', { class: 'mn-stars' }, '⭐'.repeat(stars) || '☆☆☆')
      ),
      isLocked
        ? h('span', { class: 'mn-lock' }, '🔒')
        : h('a', { class: 'btn btn-sm btn-sub', href: `#/link/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, 'Duże zakupy w markecie bez spoglądania w telefon, kolejność punktów wystąpienia czy procedury krok po kroku – dzięki efektowi domina jedno ogniwo samo pociąga kolejne!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/link', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🐿️ ', h('span', { class: 'grad' }, 'Łańcuch Skojarzeń z Basią')),
    h('p', { class: 'lead' }, 'Poznaj metodę łączenia myśli jak domino i nigdy więcej nie zgub wątku.'),
    squirrel.el,
    whyCard,
    h('div', { class: 'map-list' }, items)
  );

  root.append(view);
  setTimeout(() => {
    squirrel.say(
      doneCount === 0
        ? 'Cześć! Jestem Wiewiórka Basia 🐿️ Nauczę Cię łączyć myśli w żelazny łańcuch!'
        : `Chrup! ${doneCount}/${LESSONS.length} lekcji za nami! Zbieramy kolejne orzeszki!`,
      'happy'
    );
  }, 200);

  return () => squirrel.destroy();
}

function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const squirrel = createSquirrel({ size: 'md' });
  let answered = false;

  const theoryBox = h('div', { class: 'theory-card' },
    h('h3', {}, '🐿️ Sprytny trik Basi: ', les.title),
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '🐿️ Podpowiedź Basi');
  hintBtn.addEventListener('click', () => {
    squirrel.say(les.task.hint, 'think', { revert: 4000 });
  });

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/link/train', class: 'back' }, '← Mapa szkolenia')),
    h('div', { class: 'step-head' },
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    squirrel.el,
    theoryBox,
    h('div', { class: 'task-box' },
      h('h3', { class: 'task-prompt' }, les.task.prompt),
      optContainer,
      h('div', { class: 'task-foot' }, hintBtn)
    )
  );

  function pick(idx, btn) {
    if (answered) return;
    const isOk = idx === les.task.correct;
    if (isOk) {
      answered = true;
      btn.classList.add('correct');
      sfx.success();
      squirrel.setMood('cheer', 2500);
      squirrel.say('Brawo! To skojarzenie jest nierozerwalne jak stalowy łańcuch!', 'cheer');

      const prog = store.get('link.train', {});
      prog[les.id] = 3;
      store.set('link.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono szkolenie łańcucha! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/link/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/link';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      squirrel.setMood('sad', 1800);
      squirrel.say(les.task.hint, 'think', { revert: 3500 });
      setTimeout(() => btn.classList.remove('wrong'), 800);
    }
  }

  (les.task.options || []).forEach((opt, idx) => {
    const btn = h('button', { class: 'btn-opt', type: 'button' }, opt);
    btn.addEventListener('click', () => pick(idx, btn));
    optContainer.append(btn);
  });

  root.append(view);
  setTimeout(() => {
    squirrel.say(les.speech || `Chrup, chrup! Lekcja ${index + 1}: ${les.subtitle}. Zobacz, jak połączymy te rzeczy!`, 'happy');
  }, 250);

  return () => squirrel.destroy();
}









function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const squirrel = createSquirrel({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let lives = 3;
  let isGameOver = false;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const livesEl = (modeId === 'forward' || modeId === 'reverse') ? h('span', { class: 'hud-lives' }, '❤️❤️❤️') : null;
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/link', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      livesEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Szanse'), livesEl) : null
    ),
    squirrel.el,
    playArea
  );

  root.append(view);

  const CHEERS = [
    'Chrup, chrup! Łańcuch trzyma jak ze stali! 🐿️✨',
    'Efekt domina w akcji! Myśli przeskakują same! 💥🔗',
    'Kolejne ogniwo połączone mistrzowską historią! 📖⭐',
    'Wyobraźnia na 200%! Basia skacze z gałęzi z radości! 🌰🎉',
    'Ani jedno ogniwo nie pękło! Żelazna pamięć! 🛡️🐿️',
    'Spiżarnia pełna skojarzeń! Budujemy dalej! 🏰🥜'
  ];
  function cheerSquirrel(c) {
    if (c % 5 === 0 && c > 0) {
      squirrel.say(`Cudowne combo x${c}! Wiewiórcza opowieść wszech czasów! 🐿️🏆🌰`, 'cheer', { revert: 1800 });
      squirrel.spin?.();
    } else if (c % 2 === 0 && c > 0) {
      squirrel.say(`Combo x${c}! Twoja opowieść jest nierozerwalna! 🐿️🌰`, 'cheer', { revert: 1400 });
      squirrel.hop?.();
    } else {
      squirrel.hop?.();
      squirrel.say(rand(CHEERS), 'cheer', { revert: 1100 });
    }
  }

  function updateLives() {
    if (livesEl) {
      livesEl.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
    }
  }

  function saveBest() {
    const prev = store.get(`link.best.${modeId}`, 0);
    if (score > prev) store.set(`link.best.${modeId}`, score);
  }

  function restartGame() {
    isGameOver = false;
    score = 0;
    round = 1;
    combo = 0;
    lives = 3;
    scoreEl.textContent = '0';
    roundEl.textContent = '1';
    updateLives();
    squirrel.setMood('happy');
    squirrel.say('Zaczynamy od nowa! Połączmy wszystkie ogniwa! 🐿️🌰', 'happy');
    nextRound();
  }

  function gameOver() {
    isGameOver = true;
    saveBest();
    sfx.fanfare();
    squirrel.setMood('cheer', 3000);
    squirrel.say(`Koniec gry! Twój wynik: ${score} pkt! Łańcuch trzymał się dzielnie! 🐿️`, 'cheer');

    const best = store.get(`link.best.${modeId}`, score);
    playArea.innerHTML = '';

    const restartBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Zagraj ponownie ↻');
    restartBtn.addEventListener('click', restartGame);
    const backBtn = h('a', { class: 'btn btn-ghost', href: '#/link' }, 'Inny tryb');

    playArea.append(
      h('div', { class: 'game-over-box' },
        h('h2', {}, '🎉 Świetny łańcuch myśli!'),
        h('div', { class: 'go-score' },
          h('b', {}, `${score}`),
          h('span', {}, 'punktów')
        ),
        h('div', { class: 'go-best' }, `🏆 Rekord w tym trybie: ${best}`),
        h('div', { class: 'go-actions' }, restartBtn, backBtn)
      )
    );
  }

  function handleWrong(solutionText) {
    sfx.wrong();
    combo = 0;
    if (modeId === 'missing_link' || modeId === 'endless_chain') {
      gameOver();
      return;
    }
    lives--;
    updateLives();
    if (lives <= 0) {
      gameOver();
    } else {
      squirrel.setMood('sad', 1200);
      squirrel.say(`${solutionText} Masz jeszcze ${lives} szanse. 🐿️`, 'think', { revert: 2600 });
      setTimeout(nextRound, 1200);
    }
  }

  function nextRound() {
    if (isGameOver) return;
    playArea.innerHTML = '';

    if (modeId === 'forward') {
      const idx = rand(0, LINK_ITEMS.length - 2);
      const curr = LINK_ITEMS[idx];
      const nextItem = LINK_ITEMS[idx + 1];

      const card = h('div', { class: 'link-card' },
        h('span', { class: 'link-emoji' }, curr.emoji),
        h('h2', {}, curr.name),
        round <= 3 ? h('p', { class: 'link-action-hint' }, `Akcja: ${curr.storyAction}`) : null,
        h('p', { class: 'muted' }, 'Co jest kolejnym ogniwem w tym łańcuchu?')
      );

      const others = LINK_ITEMS.filter(it => it.id !== nextItem.id);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([nextItem, ...wrong]);

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${c.emoji} ${c.name}`);
        btn.addEventListener('click', () => {
          if (c.id === nextItem.id) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerSquirrel(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            handleWrong(`Po ${curr.name} następuje ${nextItem.name}!`);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'reverse') {
      const idx = rand(1, LINK_ITEMS.length - 1);
      const curr = LINK_ITEMS[idx];
      const prevItem = LINK_ITEMS[idx - 1];

      const card = h('div', { class: 'link-card' },
        h('span', { class: 'link-emoji' }, curr.emoji),
        h('h2', {}, curr.name),
        h('p', { class: 'muted' }, 'Cofamy taśmę! Jaki przedmiot znajdował się bezpośrednio przed nim?')
      );

      const others = LINK_ITEMS.filter(it => it.id !== prevItem.id);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([prevItem, ...wrong]);

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${c.emoji} ${c.name}`);
        btn.addEventListener('click', () => {
          if (c.id === prevItem.id) {
            sfx.success();
            score += 20 + combo * 4;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerSquirrel(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            handleWrong(`Przed ${curr.name} znajdował się: ${prevItem.name}!`);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'missing_link') {
      const idx = rand(0, LINK_ITEMS.length - 3);
      const first = LINK_ITEMS[idx];
      const middle = LINK_ITEMS[idx + 1];
      const last = LINK_ITEMS[idx + 2];

      const card = h('div', { class: 'link-card' },
        h('div', { class: 'missing-chain-row' },
          h('span', { class: 'mc-item' }, `${first.emoji} ${first.name}`),
          h('span', { class: 'mc-arrow' }, '➡️'),
          h('span', { class: 'mc-item unknown' }, '❓ [?]'),
          h('span', { class: 'mc-arrow' }, '➡️'),
          h('span', { class: 'mc-item' }, `${last.emoji} ${last.name}`)
        ),
        h('p', { class: 'muted' }, 'Jakie ogniwo łączy te dwa przedmioty w historii?')
      );

      const others = LINK_ITEMS.filter(it => it.id !== middle.id);
      const choices = shuffle([middle, ...shuffle(others).slice(0, 3)]);

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${c.emoji} ${c.name}`);
        btn.addEventListener('click', () => {
          if (c.id === middle.id) {
            sfx.success();
            score += 20 + combo * 4;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerSquirrel(combo);
            nextRound();
          } else {
            sfx.wrong();
            gameOver();
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'endless_chain') {
      const idx = rand(0, LINK_ITEMS.length - 2);
      const curr = LINK_ITEMS[idx];
      const nextItem = LINK_ITEMS[idx + 1];

      const card = h('div', { class: 'link-card' },
        h('span', { class: 'link-emoji' }, curr.emoji),
        h('h2', {}, curr.name),
        h('p', {}, `Ogniwo #${round} w łańcuchu domina.`),
        h('p', { class: 'muted' }, 'Wskaż natychmiast kolejne powiązanie:')
      );

      const others = LINK_ITEMS.filter(it => it.id !== nextItem.id);
      const choices = shuffle([nextItem, ...shuffle(others).slice(0, 3)]);

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${c.emoji} ${c.name}`);
        btn.addEventListener('click', () => {
          if (c.id === nextItem.id) {
            sfx.success();
            score += 25 + round * 5;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            squirrel.setMood('cheer', 1000);
            nextRound();
          } else {
            sfx.wrong();
            gameOver();
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);
    }
  }

  nextRound();
  return () => squirrel.destroy();
}










function mountMenu(root, { nav }) {
  const squirrel = createSquirrel({ size: 'md' });
  const prog = store.get('link.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/link/train' : `#/link/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🐿️ Szkolenie z Wiewiórką Basią'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę łańcucha' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
        h('p', {}, `${LESSONS.length} lekcji · efekt domina · cały łańcuch 20 ogniw bez kartki`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/link/train' }, 'Zobacz mapę lekcji skojarzeń →');

  const modeCards = MODES.map(m => {
    const best = store.get(`link.best.${m.id}`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/link/free/${m.id}`,
      style: `--c1:${m.color[0]};--c2:${m.color[1]}`
    },
      h('div', { class: 'mc-emoji' }, m.emoji),
      h('div', { class: 'mc-body' },
        h('h3', {}, m.name),
        h('p', {}, m.desc)
      ),
      h('div', { class: 'mc-best' },
        h('b', {}, best ? `${best}` : '–'),
        h('span', {}, best ? 'rekord' : 'brak')
      )
    );
  });

  const view = h('section', { class: 'screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
    h('div', { class: 'game-head' },
      h('div', {},
        h('h1', {}, '🐿️ ', h('span', { class: 'grad' }, 'Łańcuch skojarzeń')),
        h('p', { class: 'lead' }, 'Łącz myśli jak kostki domina. Zapamiętuj listy zakupów, przemówienia i procedury bez kartki papieru.')
      )
    ),
    squirrel.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Chrup! Jestem Wiewiórka Basia 🐿️ Zbudujemy razem łańcuch myśli, który nigdy się nie zerwie!'
    : done < LESSONS.length
      ? `Mamy ${done} z ${LESSONS.length} lekcji! Dokończmy spiżarnię skojarzeń!`
      : 'Opanowałeś metodę łańcuchową po mistrzowsku! Wybierz tryb gry swobodnej! 🏆';

  setTimeout(() => { squirrel.say(greet, 'happy'); }, 300);
  return () => squirrel.destroy();
}

return {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};

  })();
  


  /* --- CALENDAR GAME MODULE --- */
  const calendarGame = (function() {
    const DAYS_OF_WEEK = [
  { id: 0, name: 'Niedziela', short: 'Nd', emoji: '☀️' },
  { id: 1, name: 'Poniedziałek', short: 'Pn', emoji: '🌙' },
  { id: 2, name: 'Wtorek', short: 'Wt', emoji: '🔥' },
  { id: 3, name: 'Środa', short: 'Śr', emoji: '💧' },
  { id: 4, name: 'Czwartek', short: 'Cz', emoji: '⚡' },
  { id: 5, name: 'Piątek', short: 'Pt', emoji: '🎉' },
  { id: 6, name: 'Sobota', short: 'Sb', emoji: '🪐' }
];

const MONTH_ANCHORS = [
  { month: 1, name: 'Styczeń', anchorDay: 3, rule: '3 stycznia (lub 4 w przestępnym)' },
  { month: 2, name: 'Luty', anchorDay: 28, rule: 'Ostatni dzień lutego (28 lub 29)' },
  { month: 3, name: 'Marzec', anchorDay: 14, rule: '14 marca (Dzień liczby Pi: 3.14)' },
  { month: 4, name: 'Kwiecień', anchorDay: 4, rule: '4 kwietnia (parzysty: 4.04)' },
  { month: 5, name: 'Maj', anchorDay: 9, rule: '9 maja („praca 9 do 5” -> 9.05)' },
  { month: 6, name: 'Czerwiec', anchorDay: 6, rule: '6 czerwca (parzysty: 6.06)' },
  { month: 7, name: 'Lipiec', anchorDay: 11, rule: '11 lipca („stacja 7/11” -> 11.07)' },
  { month: 8, name: 'Sierpień', anchorDay: 8, rule: '8 sierpnia (parzysty: 8.08)' },
  { month: 9, name: 'Wrzesień', anchorDay: 5, rule: '5 września („praca 9 do 5” -> 5.09)' },
  { month: 10, name: 'Październik', anchorDay: 10, rule: '10 października (parzysty: 10.10)' },
  { month: 11, name: 'Listopad', anchorDay: 7, rule: '7 listopada („stacja 7/11” -> 7.11)' },
  { month: 12, name: 'Grudzień', anchorDay: 12, rule: '12 grudnia (parzysty: 12.12)' }
];

function getDoomsdayOfYear(year) {
  // Doomsday algorithm anchor for years
  // 2024: 4 (Czwartek), 2025: 5 (Piątek), 2026: 6 (Sobota)
  const d = new Date(year, 3, 4); // 4th April is always Doomsday
  return d.getDay();
}

function calculateWeekday(year, month, day) {
  const d = new Date(year, month - 1, day);
  return d.getDay();
}


const MODES = [
  {
    id: 'weekday',
    name: 'Jaki to dzień tygodnia?',
    emoji: '📅',
    desc: 'Widzisz datę w bieżącym roku. Oblicz w głowie jej dzień tygodnia w kilka sekund!',
    color: ['#11998e', '#38ef7d'],
    badge: 'Klasyczny'
  },
  {
    id: 'anchors',
    name: 'Kotwice miesięcy',
    emoji: '⚓',
    desc: 'Przetestuj znajomość magicznych dat bazowych (4.04, 6.06, 9.05, 11.07 itp.).',
    color: ['#4facfe', '#00f2fe'],
    badge: 'Fundament'
  },
  {
    id: 'clock_beat',
    name: 'Wyścig z żółwikiem',
    emoji: '⚡',
    desc: '30 sekund na zegarze! Ile dni tygodnia zdołasz błyskawicznie obliczyć?',
    color: ['#f093fb', '#f5576c'],
    badge: 'Na czas'
  },
  {
    id: 'time_travel',
    name: 'Podróżnik w czasie',
    emoji: '⏳',
    desc: 'Dowolne daty z historii i przyszłości (1970–2040). Czy potrafisz obliczyć dzień swoich urodzin?',
    color: ['#fa709a', '#fee140'],
    badge: 'Wyzwanie'
  }
];




const LESSONS = [
  {
    id: 'cal-1',
    title: 'Sekret kalendarza i Kotwica Roku',
    subtitle: 'Dni tygodnia 0-6 oraz fundament Doomsday',
    desc: 'Odkryj tajemnicę geniusza Johna Conwaya – kalendarz w pamięci.',
    speech: 'Cześć! Jestem Żółwik Zenon 🐢. Nigdy się nie spieszę, bo znam sekret czasu! Czy wiesz, że możesz w 2 sekundy odgadnąć, w jaki dzień tygodnia wypadną Twoje urodziny, Boże Narodzenie w 2026, a nawet data w 2035 roku? Pokażę Ci tę niezwykłą sztuczkę!',
    theory: [
      'Po co nam ta technika? Wyobraź sobie miny znajomych w szkole lub w pracy, gdy ktoś rzuci datę, a Ty po 2 sekundach w pamięci odpowiesz: „To będzie sobota!”. Poczujesz się jak chodzący ludzki kalkulator!',
      'Tydzień ma 7 dni i kręci się w kółko jak karuzela. Ponumerujmy dni tygodnia od 0 do 6:',
      '• 1 = Poniedziałek 🌙 | 2 = Wtorek 🔥 | 3 = Środa 💧 | 4 = Czwartek ⚡ | 5 = Piątek 🎉 | 6 = Sobota 🪐',
      '• 0 = Niedziela ☀️ (dzień relaksu i odpoczynku, okrągłe zero pracy!)',
      'CZYM JEST KOTWICA ROKU?',
      'W każdym roku istnieje jeden magiczny dzień tygodnia, zwany Kotwicą Roku (Doomsday).',
      'W roku 2026 dniem kotwicznym jest SOBOTA (6). Zapamiętajmy tę liczbę!'
    ],
    task: {
      prompt: 'Jaki dzień tygodnia odpowiada liczbie 5 w systemie kalendarzowym?',
      options: ['Piątek (5. dzień)', 'Poniedziałek (1)', 'Niedziela (0)', 'Środa (3)'],
      correct: 0,
      hint: 'Poniedziałek to 1, Wtorek 2, Środa 3, Czwartek 4, Piątek to 5!'
    }
  },
  {
    id: 'cal-2',
    title: 'Bliźniacze daty parzyste',
    subtitle: '4.04, 6.06, 8.08, 10.10, 12.12',
    desc: 'Wszystkie parzyste miesiące mają kotwicę w dniu równym numerowi miesiąca!',
    speech: 'Oto najłatwiejsza reguła na świecie: daty parzyste to lustrzane bliźniaki w każdym roku!',
    theory: [
      'Spójrz, jak genialnie zbudowany jest kalendarz:',
      'W każdym parzystym miesiącu numer miesiąca to dokładnie ten sam dzień kotwiczny:',
      '• 4 kwietnia (4.04)',
      '• 6 czerwca (6.06)',
      '• 8 sierpnia (8.08)',
      '• 10 października (10.10)',
      '• 12 grudnia (12.12)',
      'Te 5 dat ZAWSZE wypada w ten sam dzień tygodnia w danym roku! W 2026 roku każda z nich to dokładnie SOBOTA!'
    ],
    task: {
      prompt: 'Która data jest kotwicą Doomsday dla sierpnia (8. miesiąc)?',
      options: ['8 sierpnia (8.08)', '1 sierpnia', '15 sierpnia', '31 sierpnia'],
      correct: 0,
      hint: 'Miesiąc parzysty: numer miesiąca = numer dnia (8.08)!'
    }
  },
  {
    id: 'cal-3',
    title: 'Miesiące nieparzyste i Dzień Pi',
    subtitle: 'Praca 9 do 5 na stacji 7/11, Dzień Pi (14.03) i luty',
    desc: 'Komplet kotwic dla wszystkich 12 miesięcy w roku.',
    speech: 'A co z miesiącami nieparzystymi? Mamy na nie wesołą rymowankę o stacji benzynowej i liczbie Pi!',
    theory: [
      'Dla miesięcy nieparzystych mamy łatwe powiedzonko:',
      '„Pracuję od 9 do 5 na stacji 7/11”:',
      '• 9 maja (9.05) oraz 5 września (5.09) → zamieniamy 9 i 5!',
      '• 11 lipca (11.07) oraz 7 listopada (7.11) → zamieniamy 7 i 11!',
      'Do tego dochodzą pierwsze trzy miesiące roku:',
      '• Styczeń: 3 stycznia (3.01) w zwykłym roku (lub 4.01 w przestępnym) – pamiętamy: 3 dni odpoczynku po sylwestrze!',
      '• Luty: ZAWSZE OSTATNI DZIEŃ LUTEGO (28.02, a w przestępnym 29.02).',
      '• Marzec: 14 marca (3.14 to słynny Dzień Liczby Pi!).',
      'Wszystkie te daty to w 2026 roku również ta sama nasza kotwica: SOBOTA!'
    ],
    task: {
      prompt: 'Jaki dzień maja (5. miesiąc) jest kotwicą w regule „od 9 do 5”?',
      options: ['9 maja (9.05)', '1 maja', '15 maja', '31 maja'],
      correct: 0,
      hint: 'Od 9 do 5: 9. dzień 5. miesiąca = 9 maja!'
    }
  },
  {
    id: 'cal-4',
    title: 'Obliczanie daty w 3 krokach',
    subtitle: 'Przykład: 15 sierpnia 2026',
    desc: 'Jak policzyć dzień tygodnia dla dowolnego dnia w miesiącu?',
    speech: 'Teraz połączymy kropki! Zobacz, jak w 3 prostych krokach policzyć dowolną datę w roku!',
    theory: [
      'Chcesz wiedzieć, jaki dzień tygodnia to np. 15 sierpnia 2026:',
      '1. Znasz kotwicę sierpnia: to bliźniak 8 sierpnia (8.08).',
      '2. Wiesz, że w 2026 roku kotwica to SOBOTA (6).',
      '3. Liczymy różnicę dni: 15 - 8 = 7 dni. Pełne 7 dni to dokładnie tydzień, więc 15 sierpnia to również SOBOTA!',
      'Gdyby to był 10 sierpnia? 8 sierpnia + 2 dni: Sobota + 2 dni = Poniedziałek!'
    ],
    task: {
      prompt: 'Jeśli 8 sierpnia to Sobota, jaki dzień tygodnia to 10 sierpnia (8 + 2 dni)?',
      options: ['Poniedziałek (Sobota + 2 dni)', 'Niedziela', 'Wtorek', 'Czwartek'],
      correct: 0,
      hint: 'Sobota + 1 dzień = Niedziela; Sobota + 2 dni = Poniedziałek!'
    }
  },
  {
    id: 'cal-5',
    title: 'Podróżnik w czasie: Inne lata!',
    subtitle: 'Jak znaleźć kotwicę dla 2027, 2028 czy 2035 roku?',
    desc: 'Sekret przenoszenia kotwicy w przyszłość i przeszłość.',
    speech: 'A teraz prawdziwa magia: Podróżnik w czasie! Nauczę Cię błyskawicznie znajdować kotwicę dla dowolnego innego roku!',
    theory: [
      'Dlaczego to działa w każdym roku?',
      'Zwykły rok ma 365 dni = 52 pełne tygodnie + 1 dzień zapasu. Dlatego każdy zwykły rok przesuwa kotwicę o dokładnie +1 dzień!',
      'Rok przestępny (ma 29 lutego) przesuwa kotwicę o +2 dni!',
      'JAK TO LICZYĆ W PAMIĘCI?',
      'Naszą domową bazą jest rok 2026 = SOBOTA (6):',
      '• Rok 2027: (+1 rok) → Sobota + 1 = NIEDZIELA (0)! Wszystkie kotwice (4.04, 8.08, 12.12) w 2027 to Niedziela!',
      '• Rok 2028: (przestępny! +2 dni) → Niedziela + 2 = WTOREK (2)!',
      '• Rok 2025: (-1 rok w tył) → Sobota - 1 = PIĄTEK (5)!',
      '• Rok 2035: różnica 9 lat + 2 lata przestępne (2028, 2032) = 11 dni przesunięcia. 11 mod 7 = 4 dni w przód od Soboty = ŚRODA (3)!',
      'KOTWICE STULECI:',
      '• Wiek XXI (lata 2000–2099): baza stulecia to WTOREK (2, łatwo zapamiętać: rok 2000 ma dwójkę na początku)!',
      '• Wiek XX (lata 1900–1999): baza stulecia to ŚRODA (3, 3 sylaby: „dzie-więć-set”)!'
    ],
    task: {
      prompt: 'Jeśli w 2026 roku kotwicą jest Sobota, jaka będzie kotwica roku 2027 (zwykły rok, +1 dzień)?',
      options: ['Niedziela (Sobota + 1 dzień)', 'Poniedziałek', 'Piątek', 'Wtorek'],
      correct: 0,
      hint: 'Każdy normalny rok przesuwa kotwicę o 1 dzień w przód: Sobota + 1 = Niedziela!'
    }
  },
  {
    id: 'cal-6',
    title: 'Egzamin Władcy Czasu',
    subtitle: 'Sprawdzian dat w przeszłości i przyszłości',
    desc: 'Wielki finał u Żółwika Zenona! Oblicz dzień tygodnia w innym roku.',
    speech: 'Wielki Finał u Żółwika Zenona! Jesteś gotów na dowolny rok – przeszły, teraźniejszy i przyszły! 🐢⏳',
    theory: [
      'Brawo! Masz w głowie kompletny, wieczysty kalendarz na dowolny rok:',
      '1. Znasz kotwice miesięcy: 4.04, 6.06, 8.08, 10.10, 12.12, 9.05, 5.09, 11.07, 7.11, 14.03, 28.02.',
      '2. Znasz bazę 2026 (Sobota) i potrafisz przesunąć kotwicę na dowolny rok (+1 na rok, +2 na przestępny).',
      '3. Dodajesz lub odejmujesz różnicę dni do najbliższej kotwicy!',
      'Możesz teraz śmiało wejść w tryb „Podróżnik w czasie” i błyskawicznie podać dzień tygodnia dla dowolnej daty w historii i przyszłości! 🐢🪐'
    ],
    task: {
      prompt: 'Jaki dzień tygodnia to 4 kwietnia 2027 roku (pamiętając, że kotwica 2027 to Niedziela)?',
      options: ['Niedziela (bo 4.04 to bezpośrednia kotwica Doomsday!)', 'Sobota', 'Poniedziałek', 'Środa'],
      correct: 0,
      hint: '4.04 to kwietniowa kotwica – w 2027 roku przypada dokładnie w dzień kotwicy: Niedzielę!'
    }
  }
];








function mountMap(root, { nav }) {
  const turtle = createTurtle({ size: 'md' });
  const prog = store.get('calendar.train', {});
  const doneCount = LESSONS.filter(l => prog[l.id]).length;

  const items = LESSONS.map((les, idx) => {
    const stars = prog[les.id] || 0;
    const isLocked = idx > 0 && !prog[LESSONS[idx - 1].id] && !prog[les.id];
    return h('div', { class: `map-node ${stars ? 'done' : ''} ${isLocked ? 'locked' : ''}` },
      h('div', { class: 'mn-idx' }, `${idx + 1}`),
      h('div', { class: 'mn-body' },
        h('h3', {}, les.title),
        h('p', {}, les.subtitle),
        h('div', { class: 'mn-stars' }, '⭐'.repeat(stars) || '☆☆☆')
      ),
      isLocked
        ? h('span', { class: 'mn-lock' }, '🔒')
        : h('a', { class: 'btn btn-sm btn-sub', href: `#/calendar/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, 'Błyskawiczne planowanie spotkań, terminów i wyjazdów bez sięgania po smartfon. Zrobisz też genialny popis na imprezie, podając dzień tygodnia urodzin każdego ze znajomych!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/calendar', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🐢 ', h('span', { class: 'grad' }, 'Kalendarz w głowie z Żółwikiem')),
    h('p', { class: 'lead' }, 'Poznaj algorytm Doomsday i naucz się podawać dzień tygodnia każdej daty w kilka sekund.'),
    turtle.el,
    whyCard,
    h('div', { class: 'map-list' }, items)
  );

  root.append(view);
  setTimeout(() => {
    turtle.say(
      doneCount === 0
        ? 'Tik-tak! Jestem Żółwik Zegarowy 🐢 Nauczę Cię czytać czas w pamięci bez pośpiechu!'
        : `Świetnie! Mamy ${doneCount}/${LESSONS.length} lekcji czasu za sobą! Idziemy dalej?`,
      'happy'
    );
  }, 200);

  return () => turtle.destroy();
}

function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const turtle = createTurtle({ size: 'md' });
  let answered = false;

  const theoryBox = h('div', { class: 'theory-card' },
    h('h3', {}, '🐢 Mądrość Żółwika: ', les.title),
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '🐢 Podpowiedź Żółwika');
  hintBtn.addEventListener('click', () => {
    turtle.say(les.task.hint, 'think', { revert: 4000 });
  });

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/calendar/train', class: 'back' }, '← Mapa szkolenia')),
    h('div', { class: 'step-head' },
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    turtle.el,
    theoryBox,
    h('div', { class: 'task-box' },
      h('h3', { class: 'task-prompt' }, les.task.prompt),
      optContainer,
      h('div', { class: 'task-foot' }, hintBtn)
    )
  );

  function pick(idx, btn) {
    if (answered) return;
    const isOk = idx === les.task.correct;
    if (isOk) {
      answered = true;
      btn.classList.add('correct');
      sfx.success();
      turtle.setMood('cheer', 2500);
      turtle.say('Perfekcyjnie! Czas nie ma przed Tobą żadnych tajemnic!', 'cheer');

      const prog = store.get('calendar.train', {});
      prog[les.id] = 3;
      store.set('calendar.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono szkolenie czasu! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/calendar/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/calendar';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      turtle.setMood('sad', 1800);
      turtle.say(les.task.hint, 'think', { revert: 3500 });
      setTimeout(() => btn.classList.remove('wrong'), 800);
    }
  }

  (les.task.options || []).forEach((opt, idx) => {
    const btn = h('button', { class: 'btn-opt', type: 'button' }, opt);
    btn.addEventListener('click', () => pick(idx, btn));
    optContainer.append(btn);
  });

  root.append(view);
  setTimeout(() => {
    turtle.say(les.speech || `Cześć! Lekcja ${index + 1}: ${les.subtitle}. Spokojnie zbadajmy daty!`, 'happy');
  }, 250);

  return () => turtle.destroy();
}









function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const turtle = createTurtle({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let lives = 3;
  let timeLeft = modeId === 'clock_beat' ? 30 : 0;
  let timerInterval = null;
  let isGameOver = false;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const livesEl = modeId !== 'clock_beat' ? h('span', { class: 'hud-lives' }, '❤️❤️❤️') : null;
  const timerEl = modeId === 'clock_beat' ? h('span', { class: 'hud-timer' }, '⏱ 30s') : null;
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/calendar', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      livesEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Szanse'), livesEl) : null,
      timerEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Czas'), timerEl) : null
    ),
    turtle.el,
    playArea
  );

  root.append(view);

  const CHEERS = [
    'Dzień obliczony w ułamku sekundy! 🐢⚡',
    'Prawdziwy władca czasu i kalendarza! 📅✨',
    'Algorytm Conwaya opanowany po mistrzowsku! 🧠⏱️',
    'Bez pudła! Żółwik kłania się w uznaniu! 🎯🐢',
    'Zegarmistrzowska precyzja! Nic Cię nie zaskoczy! ⏰⭐',
    'Spokój i geniusz! Kalendarz w Twojej głowie lśni! 🪐🗓️'
  ];
  function cheerTurtle(c) {
    if (c % 5 === 0 && c > 0) {
      turtle.say(`Absolutne mistrzostwo x${c}! Żółwik Zenon bije brawo z zachwytu! 🐢🏆⏱️`, 'cheer', { revert: 1800 });
      turtle.spin?.();
    } else if (c % 2 === 0 && c > 0) {
      turtle.say(`Combo x${c}! Twój zegar biologiczny wyprzedza komputery! 🐢✨`, 'cheer', { revert: 1400 });
      turtle.hop?.();
    } else {
      turtle.hop?.();
      turtle.say(rand(CHEERS), 'cheer', { revert: 1100 });
    }
  }

  function updateLives() {
    if (livesEl) {
      livesEl.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
    }
  }

  function saveBest() {
    const prev = store.get(`calendar.best.${modeId}`, 0);
    if (score > prev) store.set(`calendar.best.${modeId}`, score);
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }, 1000);
  }

  function restartGame() {
    isGameOver = false;
    score = 0;
    round = 1;
    combo = 0;
    lives = 3;
    timeLeft = modeId === 'clock_beat' ? 30 : 0;
    scoreEl.textContent = '0';
    roundEl.textContent = '1';
    updateLives();
    if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
    if (timerInterval) clearInterval(timerInterval);
    if (modeId === 'clock_beat') startTimer();
    turtle.setMood('happy');
    turtle.say('Zaczynamy od nowa! Kalendarz w Twojej głowie! 🐢🗓️', 'happy');
    nextRound();
  }

  function gameOver() {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    saveBest();
    sfx.fanfare();
    turtle.setMood('cheer', 3000);
    turtle.say(`Koniec gry! Twój wynik: ${score} pkt! Prawdziwy władca kalendarza! 🐢`, 'cheer');

    const best = store.get(`calendar.best.${modeId}`, score);
    playArea.innerHTML = '';

    const restartBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Zagraj ponownie ↻');
    restartBtn.addEventListener('click', restartGame);
    const backBtn = h('a', { class: 'btn btn-ghost', href: '#/calendar' }, 'Inny tryb');

    playArea.append(
      h('div', { class: 'game-over-box' },
        h('h2', {}, '🎉 Mistrzowski wynik!'),
        h('div', { class: 'go-score' },
          h('b', {}, `${score}`),
          h('span', {}, 'punktów')
        ),
        h('div', { class: 'go-best' }, `🏆 Rekord w tym trybie: ${best}`),
        h('div', { class: 'go-actions' }, restartBtn, backBtn)
      )
    );
  }

  function handleWrong(solutionText) {
    sfx.wrong();
    combo = 0;
    lives--;
    updateLives();
    if (lives <= 0) {
      gameOver();
    } else {
      turtle.setMood('sad', 1200);
      turtle.say(`${solutionText} Pozostało szans: ${lives} 🐢`, 'think', { revert: 2600 });
      setTimeout(nextRound, 1200);
    }
  }

  function nextRound() {
    if (isGameOver) return;
    playArea.innerHTML = '';

    if (modeId === 'weekday' || modeId === 'clock_beat' || modeId === 'time_travel') {
      let year;
      if (modeId === 'time_travel') {
        if (round <= 3) {
          // Rundy 1-3: bliskie lata (2024-2028), gracz utrwala przesunięcie od 2026 (-2 do +2)
          year = rand(2024, 2028);
        } else if (round <= 7) {
          // Rundy 4-7: lata 2020-2032
          year = rand(2020, 2032);
        } else {
          // Rundy 8+: szersza podróż w czasie (1990-2035)
          year = rand(1990, 2035);
        }
      } else {
        year = 2026;
      }

      const mIdx = rand(0, MONTH_ANCHORS.length - 1);
      const mInfo = MONTH_ANCHORS[mIdx];
      const maxDays = [1, 3, 5, 7, 8, 10, 12].includes(mInfo.month) ? 31 : mInfo.month === 2 ? 28 : 30;
      const day = rand(1, maxDays);
      const correctDayIdx = calculateWeekday(year, mInfo.month, day);
      const correctDay = DAYS_OF_WEEK[correctDayIdx];

      const mAnchorText = `${mInfo.anchorDay}.${mInfo.month < 10 ? '0' + mInfo.month : mInfo.month}`;
      const yearAnchor = DAYS_OF_WEEK[getDoomsdayOfYear(year)];

      let hintText = null;
      if (modeId === 'weekday' && round <= 3) {
        hintText = `Wskazówka: kotwica miesiąca to ${mAnchorText} (w 2026 to Sobota)`;
      } else if (modeId === 'time_travel') {
        if (round <= 4) {
          hintText = `Wskazówka: kotwica roku ${year} to ${yearAnchor.name} ⏳ (kotwica miesiąca: ${mAnchorText})`;
        } else if (round <= 8) {
          hintText = `Wskazówka: kotwica ${mInfo.name.toLowerCase()} to ${mAnchorText}`;
        }
      }

      const card = h('div', { class: 'calendar-card' },
        h('div', { class: 'cal-date-badge' }, `${day} ${mInfo.name.toLowerCase()} ${year}`),
        h('h2', {}, 'Jaki to dzień tygodnia?'),
        hintText ? h('p', { class: 'muted' }, hintText) : null
      );

      const opts = h('div', { class: 'opt-grid' });
      DAYS_OF_WEEK.forEach(d => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${d.emoji} ${d.name}`);
        btn.addEventListener('click', () => {
          if (d.id === correctDayIdx) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerTurtle(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            if (modeId === 'clock_beat') {
              sfx.wrong();
              setTimeout(nextRound, 300);
            } else {
              handleWrong(`${day} ${mInfo.name} ${year} to ${correctDay.name}!`);
            }
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'anchors') {
      const target = MONTH_ANCHORS[rand(0, MONTH_ANCHORS.length - 1)];
      const card = h('div', { class: 'calendar-card' },
        h('h2', {}, `Miesiąc: `, h('span', { class: 'grad' }, target.name)),
        h('p', { class: 'muted' }, 'Który dzień tego miesiąca jest kotwicą Doomsday?')
      );

      const others = MONTH_ANCHORS.filter(m => m.anchorDay !== target.anchorDay);
      const wrong = shuffle(others).map(m => m.anchorDay).slice(0, 3);
      const choices = shuffle([target.anchorDay, ...wrong]);

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(dayChoice => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${dayChoice}. dzień miesiąca`);
        btn.addEventListener('click', () => {
          if (dayChoice === target.anchorDay) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerTurtle(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            handleWrong(`Dla ${target.name} kotwicą jest ${target.anchorDay}. dzień (${target.rule})!`);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);
    }
  }

  if (modeId === 'clock_beat') {
    startTimer();
  }

  nextRound();

  return () => {
    if (timerInterval) clearInterval(timerInterval);
    turtle.destroy();
  };
}










function mountMenu(root, { nav }) {
  const turtle = createTurtle({ size: 'md' });
  const prog = store.get('calendar.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/calendar/train' : `#/calendar/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🐢 Szkolenie z Żółwikiem Zegarowym'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę kalendarza' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
        h('p', {}, `${LESSONS.length} lekcji · algorytm Doomsday · kotwice miesięcy · dni tygodnia w pamięci`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/calendar/train' }, 'Zobacz mapę lekcji kalendarza →');

  const modeCards = MODES.map(m => {
    const best = store.get(`calendar.best.${m.id}`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/calendar/free/${m.id}`,
      style: `--c1:${m.color[0]};--c2:${m.color[1]}`
    },
      h('div', { class: 'mc-emoji' }, m.emoji),
      h('div', { class: 'mc-body' },
        h('h3', {}, m.name),
        h('p', {}, m.desc)
      ),
      h('div', { class: 'mc-best' },
        h('b', {}, best ? `${best}` : '–'),
        h('span', {}, best ? 'rekord' : 'brak')
      )
    );
  });

  const view = h('section', { class: 'screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
    h('div', { class: 'game-head' },
      h('div', {},
        h('h1', {}, '🐢 ', h('span', { class: 'grad' }, 'Kalendarz w głowie')),
        h('p', { class: 'lead' }, 'Opanuj algorytm Doomsday. Podaj dzień tygodnia dowolnej daty w historii w kilka sekund.')
      )
    ),
    turtle.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Tik-tak! Jestem Żółwik Zegarowy 🐢 Nie spiesz się – kalendarz to prosty rytm, nauczę Cię go!'
    : done < LESSONS.length
      ? `Zrobiłeś ${done} z ${LESSONS.length} lekcji czasu! Chodźmy dalej!`
      : 'Znasz kalendarz w głowie lepiej niż zegarmistrz! Zagraj w trybie swobodnym! 🏆';

  setTimeout(() => { turtle.say(greet, 'happy'); }, 300);
  return () => turtle.destroy();
}

return {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};

  })();
  


  /* --- ACROSTIC GAME MODULE --- */
  const acrosticGame = (function() {
    const ACROSTICS = [
  {
    id: 'planets',
    category: 'Kosmos i Nauka',
    title: 'Planety Układu Słonecznego',
    clue: 'Kolejność 8 planet od Słońca',
    sentence: 'Moja Wiecznie Zapracowana Mama Zawsze Smaży Nam Placki',
    items: ['Merkury', 'Wenus', 'Ziemia', 'Mars', 'Jowisz', 'Saturn', 'Uran', 'Neptun'],
    letters: ['M', 'W', 'Z', 'M', 'J', 'S', 'U', 'N'],
    emoji: '🪐',
    story: 'Wyobraź sobie mamę w kosmicznym fartuszku, która smaży na patelni wielkie, gwiezdne naleśniki!',
    anchorTip: 'M - Merkury, W - Wenus, Z - Ziemia, M - Mars, J - Jowisz, S - Saturn, U - Uran, N - Neptun'
  },
  {
    id: 'rainbow',
    category: 'Przyroda i Kolory',
    title: 'Kolory Tęczy',
    clue: 'Kolejność 6 głównych barw tęczy',
    sentence: 'Czemu Patrzysz Żabko Zielona Na Fiołki',
    items: ['Czerwony', 'Pomarańczowy', 'Żółty', 'Zielony', 'Niebieski', 'Fioletowy'],
    letters: ['C', 'P', 'Ż', 'Z', 'N', 'F'],
    emoji: '🌈',
    story: 'Mała zielona żabka siedzi na łące z lupą i ze zdziwieniem wpatruje się w pachnące fiołki!',
    anchorTip: 'C - Czerwony, P - Pomarańczowy, Ż - Żółty, Z - Zielony, N - Niebieski, F - Fioletowy'
  },
  {
    id: 'roman_big',
    category: 'Historia i Liczby',
    title: 'Rzymskie Duże Liczby (50, 100, 500, 1000)',
    clue: 'Kolejność wartości rzymskich liter',
    sentence: 'Lech Chce Dobrze Mieszkać',
    items: ['L (50)', 'C (100)', 'D (500)', 'M (1000)'],
    letters: ['L', 'C', 'D', 'M'],
    emoji: '🏛️',
    story: 'Król Lech buduje wielki, luksusowy marmurowy pałac z basenem w Rzymie!',
    anchorTip: 'L = 50, C = 100 (Centum), D = 500, M = 1000 (Mille)'
  },
  {
    id: 'directions',
    category: 'Geografia i Podróże',
    title: 'Kierunki Świata na Mapie (Zgodnie z zegarem)',
    clue: 'Północ, Wschód, Południe, Zachód (N, E, S, W)',
    sentence: 'Na Ekranie Siedzi Wrona',
    items: ['North (Północ)', 'East (Wschód)', 'South (Południe)', 'West (Zachód)'],
    letters: ['N', 'E', 'S', 'W'],
    emoji: '🧭',
    story: 'Wielka czarna wrona w okularach siada na samym środku Twojego ekranu i kracze!',
    anchorTip: 'N (góra) -> E (prawo) -> S (dół) -> W (lewo)'
  },
  {
    id: 'cases',
    category: 'Język Polski i Szkoła',
    title: 'Przypadki w Języku Polskim',
    clue: '7 przypadków deklinacji',
    sentence: 'Mama Dała Córce Bułkę Nasmarowaną Masłem Wiejskim',
    items: ['Mianownik (kto? co?)', 'Dopełniacz (kogo? czego?)', 'Celownik (komu? czemu?)', 'Biernik (kogo? co?)', 'Narzędnik (z kim? z czym?)', 'Miejscownik (o kim? o czym?)', 'Wołacz (o!)'],
    letters: ['M', 'D', 'C', 'B', 'N', 'M', 'W'],
    emoji: '📚',
    story: 'Mama kroi świeżą chrupiącą bułkę i smaruje ją wiejskim, pachnącym masłem prosto od krowy!',
    anchorTip: 'Mianownik, Dopełniacz, Celownik, Biernik, Narzędnik, Miejscownik, Wołacz'
  },
  {
    id: 'vitamins',
    category: 'Biologia i Zdrowie',
    title: 'Witaminy Rozpuszczalne w Tłuszczach',
    clue: 'Cztery kluczowe witaminy rozpuszczalne w tłuszczach',
    sentence: 'ADEK pije mleko z masłem',
    items: ['Witamina A (wzrok)', 'Witamina D (odporność i kości)', 'Witamina E (młodość)', 'Witamina K (krzepnięcie krwi)'],
    letters: ['A', 'D', 'E', 'K'],
    emoji: '🥑',
    story: 'Chłopiec o imieniu ADEK zjada kromkę z awokado i rośnie silny jak dąb!',
    anchorTip: 'Witaminy A, D, E, K potrzebują tłuszczu, aby organizm mógł je wchłonąć'
  },
  {
    id: 'cardinal_pl',
    category: 'Geografia Polski',
    title: 'Kierunki Świata po Polsku (P-W-P-Z)',
    clue: 'Północ, Wschód, Południe, Zachód',
    sentence: 'Pewien Wilk Polował Zawsze',
    items: ['Północ', 'Wschód', 'Południe', 'Zachód'],
    letters: ['P', 'W', 'P', 'Z'],
    emoji: '🐺',
    story: 'Szary wilk z kompasem na szyi biega po lesie i szuka tropów w cztery strony świata!',
    anchorTip: 'Północ (góra), Wschód (prawo), Południe (dół), Zachód (lewo)'
  },
  {
    id: 'notes',
    category: 'Muzyka i Sztuka',
    title: 'Dźwięki na Liniach Pięciolinii',
    clue: 'Pięć linii klucza wiolinowego: E, G, H (B), D, F',
    sentence: 'Elegancki Gitarzysta Bardzo Dobrze Fika',
    items: ['E (1. linia)', 'G (2. linia)', 'H / B (3. linia)', 'D (4. linia)', 'F (5. linia)'],
    letters: ['E', 'G', 'B', 'D', 'F'],
    emoji: '🎵',
    story: 'Gitarzysta w smokingu gra solo na scenie i robi salta w powietrzu nad nutami!',
    anchorTip: 'Dźwięki od dołu do góry: E - G - H(B) - D - F'
  }
];


const MODES = [
  {
    id: 'decode',
    name: 'Rozszyfruj Akrostych',
    emoji: '🔍',
    desc: 'Widzisz słynne zdanie mnemotechniczne. Rozszyfruj, jakie pojęcia kryją się za jego pierwszymi literami!',
    color: ['#f59e0b', '#d97706'],
    badge: 'Klasyczny'
  },
  {
    id: 'order',
    name: 'Kolejność Mistrza',
    emoji: '🎯',
    desc: 'Użyj tropu w głowie i wskaż prawidłowe następstwo elementów (np. planet lub barw tęczy).',
    color: ['#fbbf24', '#f59e0b'],
    badge: 'Kolejność'
  },
  {
    id: 'missing',
    name: 'Brakujące Ogniwo',
    emoji: '🦴',
    desc: 'Pieskowi uciekł jeden element z sekwencji! Czy potrafisz wytropić, czego brakuje na liście?',
    color: ['#ea580c', '#c2410c'],
    badge: 'Bystre Oko'
  },
  {
    id: 'speed_dog',
    name: 'Błyskawiczny Tropiciel',
    emoji: '⚡',
    desc: '30 sekund na zegarze! Ile haseł i tropów zdołasz rozpoznać w zawrotnym tempie?',
    color: ['#f97316', '#ea580c'],
    badge: 'Na czas'
  }
];


/**
 * 10 rozbudowanych, mistrzowskich lekcji Akrostychów i Rymowanek z Pieskiem Łatkiem 🐶
 * Z podziałem na rozdziały, bogatą teorią, wizualnymi podglądami i życiowymi przykładami.
 */

const CHAPTERS = [
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

const LESSONS = [
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








function mountMap(root, { nav }) {
  const dog = createDog({ size: 'md' });
  const prog = store.get('acrostic.train', {});
  const doneCount = LESSONS.filter(l => prog[l.id]).length;

  const chaptersElements = CHAPTERS.map((ch, ci) => {
    const chapterLessons = LESSONS.map((les, idx) => ({ les, idx }))
      .filter(item => item.les.ch === ci);

    const lessonNodes = chapterLessons.map(({ les, idx }) => {
      const stars = prog[les.id] || 0;
      const isLocked = idx > 0 && !prog[LESSONS[idx - 1].id] && !prog[les.id];
      const state = stars ? 'done' : isLocked ? 'locked' : 'current';

      return h('div', { class: `map-node step-node lesson ${state}` },
        h('div', { class: 'mn-idx ln' }, isLocked ? '🔒' : stars ? '✓' : `${idx + 1}`),
        h('div', { class: 'mn-body lt' },
          h('h3', {}, les.title),
          h('p', {}, les.subtitle),
          h('div', { class: 'mn-stars' }, '⭐'.repeat(stars) || '☆☆☆')
        ),
        isLocked
          ? h('span', { class: 'mn-lock' }, '🔒')
          : h('a', { class: 'btn btn-sm btn-sub', href: `#/acrostic/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
      );
    });

    return h('div', { class: 'chapter' },
      h('h3', {},
        h('span', {}, ch.emoji), ' ', ch.title,
        h('small', {}, ch.desc)
      ),
      h('div', { class: 'chapter-lessons' }, lessonNodes)
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, 'Zamiast wkuwać nudne listy na pamięć, zamieniasz je w jedno wesołe zdanie. Niezbędna w szkole (planety, kolory tęczy, przypadki) i w pracy (zapamiętywanie skrótów, procedur i wierszy)!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/acrostic', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🐶 ', h('span', { class: 'grad' }, 'Akrostychy z Pieskiem Łatkiem')),
    h('p', { class: 'lead' }, 'Poznaj metodę pierwszych liter i naucz się zapamiętywać całe listy wiedzy w jednym prostym zdaniu.'),
    dog.el,
    whyCard,
    h('div', { class: 'bar-progress', style: `--p:${(doneCount / LESSONS.length) * 100}%` }, h('i')),
    h('div', { class: 'map-list' }, chaptersElements)
  );

  root.append(view);
  setTimeout(() => {
    dog.say(
      doneCount === 0
        ? 'Hau, hau! Jestem Piesek Łatek 🐶 Nauczę Cię łapać wiedzę na haczyki pierwszych liter!'
        : `Świetnie! Mamy za sobą ${doneCount}/${LESSONS.length} lekcji tropienia! Ruszamy dalej? 🐾`,
      'happy'
    );
  }, 200);

  return () => dog.destroy();
}

function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const dog = createDog({ size: 'md' });
  let answered = false;

  const acrosticVisual = les.acrostic ? h('div', { class: 'acrostic-board' },
    h('div', { class: 'acrostic-phrase-banner' }, les.acrostic.phrase),
    h('div', { class: 'acrostic-rows-list' },
      les.acrostic.items.map(item =>
        h('div', { class: 'acrostic-item-row' },
          h('div', { class: 'acrostic-letter-box' }, item.letter),
          h('div', { class: 'acrostic-word-col' }, item.word),
          h('span', { class: 'acrostic-arrow' }, '➔'),
          h('div', { class: 'acrostic-target-col' },
            h('span', {}, item.icon || '📌'),
            h('span', {}, item.target)
          )
        )
      )
    )
  ) : null;

  const theoryBox = h('div', { class: 'theory-card theory-box' },
    h('h3', {}, '🐶 Trop Pieska: ', les.title),
    acrosticVisual,
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '🐶 Podpowiedź Pieska');
  hintBtn.addEventListener('click', () => {
    dog.say(les.task.hint, 'think', { revert: 4000 });
  });

  const dots = h('div', { class: 'step-dots' }, LESSONS.map((_, i) => h('i', { class: i < index ? 'done' : i === index ? 'now' : '' })));

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/acrostic/train', class: 'back' }, '← Mapa szkolenia')),
    h('div', { class: 'step-head' },
      dots,
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    dog.el,
    theoryBox,
    h('div', { class: 'task-box' },
      h('h3', { class: 'task-prompt' }, les.task.prompt),
      optContainer,
      h('div', { class: 'task-foot' }, hintBtn)
    )
  );

  function pick(idx, btn) {
    if (answered) return;
    const isOk = idx === les.task.correct;
    if (isOk) {
      answered = true;
      btn.classList.add('correct');
      sfx.success();
      dog.setMood('cheer', 2500);
      dog.say('Brawo! Wytropiłeś właściwe słowo bez pudła! Hau! 🦴✨', 'cheer');

      const prog = store.get('acrostic.train', {});
      prog[les.id] = 3;
      store.set('acrostic.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono szkolenie Tropiciela! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/acrostic/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/acrostic';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      dog.setMood('sad', 1800);
      dog.say(les.task.hint, 'think', { revert: 3500 });
      setTimeout(() => btn.classList.remove('wrong'), 800);
    }
  }

  (les.task.options || []).forEach((opt, idx) => {
    const btn = h('button', { class: 'btn-opt', type: 'button' }, opt);
    btn.addEventListener('click', () => pick(idx, btn));
    optContainer.append(btn);
  });

  root.append(view);
  setTimeout(() => {
    dog.say(les.speech || `Hau! Lekcja ${index + 1}: ${les.subtitle}. Złapmy ten trop!`, 'happy');
  }, 250);

  return () => dog.destroy();
}










function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const dog = createDog({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let lives = 3;
  let timeLeft = modeId === 'speed_dog' ? 30 : 0;
  let timerInterval = null;
  let isGameOver = false;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const livesEl = modeId !== 'speed_dog' ? h('span', { class: 'hud-lives' }, '❤️❤️❤️') : null;
  const timerEl = modeId === 'speed_dog' ? h('span', { class: 'hud-timer' }, '⏱ 30s') : null;
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/acrostic', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      livesEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Szanse'), livesEl) : null,
      timerEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Czas'), timerEl) : null
    ),
    dog.el,
    playArea
  );

  root.append(view);

  const CHEERS = [
    'Hau! Trop podchwycony w ułamku sekundy! 🐶⚡',
    'Genialny węch pamięciowy! Masz to w głowie! 🦴✨',
    'Akrostych rozszyfrowany jak u prawdziwego mistrza! 🔤🏆',
    'Bez pudła! Piesek Łatek macha ogonem z zachwytu! 🐾⭐',
    'Precyzja detektywa! Żadna litera Ci nie umknie! 🔍🎯'
  ];

  function cheerDog(c) {
    if (c % 5 === 0 && c > 0) {
      dog.say(`Absolutne mistrzostwo x${c}! Piesek Łatek kręci piruety z radości! 🐶🏆✨`, 'cheer', { revert: 1800 });
      dog.spin?.();
    } else if (c % 2 === 0 && c > 0) {
      dog.say(`Combo x${c}! Twój umysł tropi wiedzę bez zawahania! 🐾⚡`, 'cheer', { revert: 1400 });
      dog.hop?.();
    } else {
      dog.hop?.();
      dog.say(rand(CHEERS), 'cheer', { revert: 1100 });
    }
  }

  function updateLives() {
    if (livesEl) livesEl.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      if (isGameOver) return;
      timeLeft--;
      if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }, 1000);
  }

  function gameOver() {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    playArea.innerHTML = '';

    const bestKey = `acrostic.free.${modeId}.best`;
    const prevBest = store.get(bestKey, 0);
    const isNewRecord = score > prevBest;
    if (isNewRecord) store.set(bestKey, score);

    sfx.fanfare();
    dog.setMood('happy');
    dog.say(
      score > 60
        ? `Niezwykły bieg! Zdobywasz ${score} punktów! Piesek Łatek jest z Ciebie dumny! 🐶🏆`
        : `Dobra runda! Zdobywasz ${score} punktów. Każdy trening wyostrza Twój zmysł pamięci! 🐾`,
      'happy'
    );

    const restartBtn = h('button', { class: 'btn btn-primary btn-lg', type: 'button' }, 'Zagraj ponownie 🔄');
    restartBtn.addEventListener('click', () => {
      score = 0;
      round = 1;
      combo = 0;
      lives = 3;
      isGameOver = false;
      timeLeft = modeId === 'speed_dog' ? 30 : 0;
      scoreEl.textContent = '0';
      roundEl.textContent = '1';
      updateLives();
      if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
      if (modeId === 'speed_dog') startTimer();
      nextRound();
    });

    const backBtn = h('a', { class: 'btn btn-ghost btn-lg', href: '#/acrostic' }, '← Inny tryb');

    playArea.append(
      h('div', { class: 'game-over-card' },
        h('h2', {}, 'Koniec gry! 🐾'),
        h('p', { class: 'go-score' }, `Twój wynik: `, h('span', {}, `${score}`)),
        isNewRecord
          ? h('p', { class: 'badge badge-gold' }, '⭐ NOWY REKORD! ⭐')
          : h('p', { class: 'muted' }, `Najlepszy wynik: ${Math.max(score, prevBest)}`),
        h('div', { class: 'go-actions' }, restartBtn, backBtn)
      )
    );
  }

  function handleWrong(solutionText) {
    sfx.wrong();
    combo = 0;
    lives--;
    updateLives();
    if (lives <= 0) {
      gameOver();
    } else {
      dog.setMood('sad', 1200);
      dog.say(`${solutionText} Pozostało szans: ${lives} 🐶`, 'think', { revert: 2600 });
      setTimeout(nextRound, 1200);
    }
  }

  function nextRound() {
    if (isGameOver) return;
    playArea.innerHTML = '';

    const acr = ACROSTICS[rand(0, ACROSTICS.length - 1)];

    if (modeId === 'decode' || modeId === 'speed_dog') {
      // Wybierz losowy element z akrostychu
      const targetIdx = rand(0, acr.items.length - 1);
      const targetItem = acr.items[targetIdx];
      const dispSentence = typeof t === 'function' ? t(acr.sentence) : acr.sentence;
      const words = dispSentence.split(/\s+/);
      const rawWord = words[targetIdx];
      const targetWord = rawWord || acr.letters[targetIdx];
      const targetLetter = rawWord ? rawWord[0].toUpperCase() : acr.letters[targetIdx];

      // Generuj złe odpowiedzi
      const allOtherItems = ACROSTICS.flatMap(a => a.items).filter(it => it !== targetItem);
      const wrong = shuffle(allOtherItems).slice(0, 3);
      const choices = shuffle([targetItem, ...wrong]);

      const card = h('div', { class: 'link-card' },
        h('span', { class: 'link-emoji' }, acr.emoji),
        h('p', { class: 'muted' }, `Kategoria: ${acr.category}`),
        h('h2', {}, `Zdanie: „${acr.sentence}”`),
        h('p', { class: 'lead' }, `Co oznacza słowo `, h('b', { style: 'color:var(--amber);font-size:1.3rem;' }, `„${targetWord}”`), ` (litera ${targetLetter})?`)
      );

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, c);
        btn.addEventListener('click', () => {
          if (c === targetItem) {
            sfx.pop();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerDog(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            if (modeId === 'speed_dog') {
              sfx.wrong();
              setTimeout(nextRound, 300);
            } else {
              handleWrong(`Słowo „${targetWord}” to ${targetItem}!`);
            }
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'order') {
      // Co następuje po wybranym elemencie
      const maxIdx = acr.items.length - 2;
      const targetIdx = rand(0, Math.max(0, maxIdx));
      const currentItem = acr.items[targetIdx];
      const nextItem = acr.items[targetIdx + 1];

      const allOthers = acr.items.filter(it => it !== nextItem && it !== currentItem);
      const wrong = shuffle(allOthers).slice(0, 3);
      // Jeżeli brakuje wrong items z tego samego akrostychu, dobierz z innych
      while (wrong.length < 3) {
        const extra = rand(ACROSTICS.flatMap(a => a.items));
        if (extra !== nextItem && extra !== currentItem && !wrong.includes(extra)) wrong.push(extra);
      }
      const choices = shuffle([nextItem, ...wrong]);

      const card = h('div', { class: 'link-card' },
        h('span', { class: 'link-emoji' }, acr.emoji),
        h('p', { class: 'muted' }, `${acr.title} („${acr.sentence}”)`),
        h('h2', {}, `Po elemencie: `, h('span', { class: 'grad' }, currentItem)),
        h('p', { class: 'lead' }, 'Jaki element następuje bezpośrednio potem?')
      );

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, c);
        btn.addEventListener('click', () => {
          if (c === nextItem) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerDog(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            handleWrong(`Po „${currentItem}” następuje „${nextItem}”!`);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'missing') {
      // Wskaż brakujący element z sekwencji
      const missingIdx = rand(0, acr.items.length - 1);
      const missingItem = acr.items[missingIdx];
      const displayedSequence = acr.items.map((it, idx) => idx === missingIdx ? '❓ [BRAK]' : it).join(' ➔ ');

      const allOthers = ACROSTICS.flatMap(a => a.items).filter(it => it !== missingItem);
      const wrong = shuffle(allOthers).slice(0, 3);
      const choices = shuffle([missingItem, ...wrong]);

      const card = h('div', { class: 'link-card' },
        h('span', { class: 'link-emoji' }, acr.emoji),
        h('p', { class: 'muted' }, `${acr.title}`),
        h('h2', { style: 'font-size:1.15rem;line-height:1.5;' }, displayedSequence),
        h('p', { class: 'lead' }, 'Którego elementu brakuje w sekwencji?')
      );

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, c);
        btn.addEventListener('click', () => {
          if (c === missingItem) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerDog(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            handleWrong(`Brakującym elementem był: ${missingItem}!`);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);
    }
  }

  if (modeId === 'speed_dog') {
    startTimer();
  }

  nextRound();

  return () => {
    if (timerInterval) clearInterval(timerInterval);
    dog.destroy();
  };
}










function mountMenu(root, { nav }) {
  const dog = createDog({ size: 'md' });
  const prog = store.get('acrostic.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/acrostic/train' : `#/acrostic/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🐶 Szkolenie z Pieskiem Łatkiem'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę akrostychów' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
        h('p', {}, `${LESSONS.length} lekcji · haczyki pierwszych liter · całe listy wiedzy w jednym zdaniu`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/acrostic/train' }, 'Zobacz mapę lekcji akrostychów →');

  const modeCards = MODES.map(m => {
    const best = store.get(`acrostic.best.${m.id}`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/acrostic/free/${m.id}`,
      style: `--c1:${m.color[0]};--c2:${m.color[1]}`
    },
      h('div', { class: 'mc-emoji' }, m.emoji),
      h('div', { class: 'mc-body' },
        h('h3', {}, m.name),
        h('p', {}, m.desc)
      ),
      h('div', { class: 'mc-best' },
        h('b', {}, best ? `${best}` : '–'),
        h('span', {}, best ? 'rekord' : 'brak')
      )
    );
  });

  const view = h('section', { class: 'screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
    h('div', { class: 'game-head' },
      h('div', {},
        h('h1', {}, '🐶 ', h('span', { class: 'grad' }, 'Akrostychy i rymowanki')),
        h('p', { class: 'lead' }, 'Złap każdy trop pamięciowy! Zapamiętuj kolejność planet, kolory tęczy, rzymskie cyfry i reguły szkolne za pomocą pierwszych liter.')
      )
    ),
    dog.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Hau! Jestem Piesek Łatek 🐶 Zbudujemy razem sprytne tropy ze zdań i wierszyków!'
    : done < LESSONS.length
      ? `Świetnie! Mamy ${done} z ${LESSONS.length} lekcji! Ruszajmy po kolejne gwiazdki! 🐾`
      : 'Opanowałeś metodę pierwszych liter po mistrzowsku! Wybierz tryb gry swobodnej! 🏆';

  setTimeout(() => { dog.say(greet, 'happy'); }, 300);
  return () => dog.destroy();
}

return {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};

  })();
  


  /* --- MINDMAP GAME MODULE --- */
  const mindmapGame = (function() {
    /**
 * Baza map myśli dla Ośmiornicy Inki.
 * Każda mapa myśli posiada:
 * - temat centralny (centrum mapy / głowa ośmiornicy)
 * - 4 główne gałęzie tematyczne (macki), każda z kolorem i emotką
 * - listę pod-gałęzi / słów-kluczy dla każdej z odnóg
 */
const MIND_MAPS = [
  {
    id: 'solar',
    title: 'Układ Słoneczny',
    emoji: '🪐',
    color: '#f59e0b',
    branches: [
      {
        name: 'Planety Skaliste',
        emoji: '🪨',
        color: '#ef4444',
        items: ['Merkury 🌑', 'Wenus 🌋', 'Ziemia 🌍', 'Mars 🔴']
      },
      {
        name: 'Gazowe Olbrzymy',
        emoji: '🌪️',
        color: '#8b5cf6',
        items: ['Jowisz 🌀', 'Saturn 🪐', 'Uran ❄️', 'Neptun 🌊']
      },
      {
        name: 'Małe Ciała',
        emoji: '☄️',
        color: '#06b6d4',
        items: ['Komety 🌠', 'Planetoidy 🪨', 'Pluton ❄️']
      },
      {
        name: 'Gwiazda Centralna',
        emoji: '☀️',
        color: '#facc15',
        items: ['Słońce 🔥', 'Ciepło i Światło ⚡', 'Grawitacja 🧲']
      }
    ]
  },
  {
    id: 'nature',
    title: 'Cztery Pory Roku',
    emoji: '🌳',
    color: '#10b981',
    branches: [
      {
        name: 'Wiosna',
        emoji: '🌸',
        color: '#ec4899',
        items: ['Przebiśniegi 🌼', 'Pąki liści 🌱', 'Powrót ptaków 🐦']
      },
      {
        name: 'Lato',
        emoji: '☀️',
        color: '#eab308',
        items: ['Upał 🏖️', 'Dojrzałe truskawki 🍓', 'Burza z piorunami ⛈️']
      },
      {
        name: 'Jesień',
        emoji: '🍂',
        color: '#f97316',
        items: ['Złote liście 🍁', 'Grzybobranie 🍄', 'Kasztany 🌰']
      },
      {
        name: 'Zima',
        emoji: '❄️',
        color: '#38bdf8',
        items: ['Śnieg i bałwan ⛄', 'Sen zimowy 🐻', 'Mróz na szybie 🧊']
      }
    ]
  },
  {
    id: 'energy',
    title: 'Supermoc Zdrowia',
    emoji: '⚡',
    color: '#06b6d4',
    branches: [
      {
        name: 'Sen i Regeneracja',
        emoji: '💤',
        color: '#6366f1',
        items: ['8 godzin snu 🛌', 'Ciemny pokój 🌑', 'Brak ekranów przed snem 📵']
      },
      {
        name: 'Dobre Paliwo',
        emoji: '🥗',
        color: '#22c55e',
        items: ['Woda mineralna 💧', 'Kolorowe warzywa 🥦', 'Świeże owoce 🍊']
      },
      {
        name: 'Ruch i Siła',
        emoji: '🏃',
        color: '#f59e0b',
        items: ['Szybki spacer 🚶', 'Rozciąganie 🧘', 'Sport z przyjaciółmi ⚽']
      },
      {
        name: 'Spokój Umysłu',
        emoji: '🧠',
        color: '#d946ef',
        items: ['Głęboki oddech 🌬️', 'Uśmiech i śmiech 😊', 'Odpoczynek na trawie 🌿']
      }
    ]
  },
  {
    id: 'ocean',
    title: 'Głębia Oceanu',
    emoji: '🌊',
    color: '#3b82f6',
    branches: [
      {
        name: 'Rafa Koralowa',
        emoji: '🪸',
        color: '#f43f5e',
        items: ['Błazenek Nemo 🐠', 'Kolorowe ukwały 🌸', 'Rozgwiazda ⭐']
      },
      {
        name: 'Ssaki Morskie',
        emoji: '🐋',
        color: '#0ea5e9',
        items: ['Wesoły delfin 🐬', 'Płetwal błękitny 🐳', 'Foka na krze 🦭']
      },
      {
        name: 'Szybcy Łowcy',
        emoji: '🦈',
        color: '#64748b',
        items: ['Rekin żarłacz 🦈', 'Drapieżna orka 🖤', 'Szybki miecznik 🗡️']
      },
      {
        name: 'Mieszkańcy Głębin',
        emoji: '🐙',
        color: '#a855f7',
        items: ['Ośmiornica Inka 🐙', 'Świecąca ryba głębinowa 💡', 'Wielka kałamarnica 🦑']
      }
    ]
  },
  {
    id: 'inventions',
    title: 'Wielkie Wynalazki',
    emoji: '💡',
    color: '#eab308',
    branches: [
      {
        name: 'Łączność i Wiedza',
        emoji: '📡',
        color: '#3b82f6',
        items: ['Pismo na papirusie 📜', 'Druk Gutenberga 📖', 'Globalny Internet 🌐']
      },
      {
        name: 'Podróże i Ruch',
        emoji: '🚀',
        color: '#ef4444',
        items: ['Okrągłe koło 🛞', 'Pociąg parowy 🚂', 'Szybki samolot ✈️']
      },
      {
        name: 'Moc i Światło',
        emoji: '⚡',
        color: '#f59e0b',
        items: ['Ogień w jaskini 🔥', 'Szklana żarówka 💡', 'Bateria elektryczna 🔋']
      },
      {
        name: 'Zdrowie i Życie',
        emoji: '🔬',
        color: '#10b981',
        items: ['Cudowna penicylina 💊', 'Precyzyjny mikroskop 🔬', 'Promienie rentgena 🩻']
      }
    ]
  },
  {
    id: 'music',
    title: 'Kraina Muzyki',
    emoji: '🎵',
    color: '#ec4899',
    branches: [
      {
        name: 'Strunowe Dźwięki',
        emoji: '🎻',
        color: '#8b5cf6',
        items: ['Skrzypce w orkiestrze 🎻', 'Gitara akustyczna 🎸', 'Czarne pianino 🎹']
      },
      {
        name: 'Dęta Energia',
        emoji: '🎺',
        color: '#f97316',
        items: ['Złota trąbka 🎺', 'Drewniany flet 🪈', 'Błyszczący saksofon 🎷']
      },
      {
        name: 'Rytmiczne Uderzenie',
        emoji: '🥁',
        color: '#ef4444',
        items: ['Mocny bęben 🥁', 'Dźwięczne talerze 🔔', 'Drewniane marakasy 🪇']
      },
      {
        name: 'Dusza Piosenki',
        emoji: '🎶',
        color: '#06b6d4',
        items: ['Równy rytm ⏱️', 'Wpadająca w ucho melodia 🎼', 'Ciepła harmonia 🎹']
      }
    ]
  },
  {
    id: 'productivity',
    title: 'Mistrzowski Dzień',
    emoji: '⏰',
    color: '#8b5cf6',
    branches: [
      {
        name: 'Poranny Start',
        emoji: '🌅',
        color: '#f59e0b',
        items: ['Szklanka zimnej wody 💧', 'Zasłane łóżko 🛏️', 'Plan 3 najważniejszych celów 📋']
      },
      {
        name: 'Głęboka Koncentracja',
        emoji: '🎯',
        color: '#ef4444',
        items: ['Praca nad jednym zadaniem 🎯', 'Blok 45 minut skupienia ⏳', 'Wyciszony telefon 🔕']
      },
      {
        name: 'Świeży Reset',
        emoji: '🌿',
        color: '#10b981',
        items: ['Krótki spacer 🚶', 'Głęboki oddech 🍃', 'Chrupiące jabłko 🍏']
      },
      {
        name: 'Wieczorny Spokój',
        emoji: '🌙',
        color: '#6366f1',
        items: ['Podsumowanie sukcesów ⭐', 'Dobra książka 📖', 'Ciepłe światło 🕯️']
      }
    ]
  },
  {
    id: 'cooking',
    title: 'Magia Gotowania',
    emoji: '🍳',
    color: '#f97316',
    branches: [
      {
        name: 'Pachnące Zioła',
        emoji: '🌿',
        color: '#10b981',
        items: ['Świeża bazylia 🍃', 'Aromatyczny czosnek 🧄', 'Pikantny pieprz 🧂']
      },
      {
        name: 'Baza i Energia',
        emoji: '🌾',
        color: '#f59e0b',
        items: ['Włoski makaron 🍝', 'Biały ryż 🍚', 'Chrupiąca bagietka 🥖']
      },
      {
        name: 'Kolorowe Warzywa',
        emoji: '🍅',
        color: '#ef4444',
        items: ['Soczysty pomidor 🍅', 'Słodka marchewka 🥕', 'Żółta papryka 🫑']
      },
      {
        name: 'Słodka Nagroda',
        emoji: '🍰',
        color: '#ec4899',
        items: ['Ciepła szarlotka 🥧', 'Gorzka czekolada 🍫', 'Kremowe lody 🍨']
      }
    ]
  }
];


/**
 * Tryby gry swobodnej dla Map Myśli z Ośmiornicą Inką.
 */
const MODES = [
  {
    id: 'missing_branch',
    title: 'Brakująca Gałąź',
    emoji: '🐙',
    desc: 'Ośmiornica Inka ukryła jedno z ramion mapy myśli! Odgadnij, jak nazywa się brakująca gałąź wiedzy.',
    accent: ['#d946ef', '#8b5cf6']
  },
  {
    id: 'categorize',
    title: 'Gdzie Przypiąć Mackę?',
    emoji: '🧭',
    desc: 'Pojawia się pojedyncze pojęcie lub zjawisko. Przypnij je do właściwego ramienia mapy myśli!',
    accent: ['#06b6d4', '#3b82f6']
  },
  {
    id: 'find_intruder',
    title: 'Znajdź Intruza',
    emoji: '🔍',
    desc: 'Na jednej z gałęzi zaplątał się element, który kompletnie nie pasuje do kategorii. Oczyść mapę myśli!',
    accent: ['#f59e0b', '#ef4444']
  },
  {
    id: 'speed_map',
    title: 'Wyścig z Inką (30 sek)',
    emoji: '⚡',
    desc: 'Czysty 30-sekundowy bieg! Ile powiązań na mapie myśli zdołasz poprawnie skojarzyć, zanim minie czas?',
    accent: ['#ec4899', '#f43f5e']
  }
];


/**
 * 10 rozbudowanych, mistrzowskich lekcji Map Myśli (Mind Mapping) z Ośmiornicą Inką 🐙
 * Z podziałem na rozdziały, diagramami porównawczymi, bogatą teorią i życiowymi przykładami.
 */

const CHAPTERS = [
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

const LESSONS = [
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








function mountMap(root, { nav }) {
  const octopus = createOctopus({ size: 'md' });
  const prog = store.get('mindmap.train', {});
  const doneCount = LESSONS.filter(l => prog[l.id]).length;

  const chaptersElements = CHAPTERS.map((ch, ci) => {
    const chapterLessons = LESSONS.map((les, idx) => ({ les, idx }))
      .filter(item => item.les.ch === ci);

    const lessonNodes = chapterLessons.map(({ les, idx }) => {
      const stars = prog[les.id] || 0;
      const isLocked = idx > 0 && !prog[LESSONS[idx - 1].id] && !prog[les.id];
      const state = stars ? 'done' : isLocked ? 'locked' : 'current';

      return h('div', { class: `map-node step-node lesson ${state}` },
        h('div', { class: 'mn-idx ln' }, isLocked ? '🔒' : stars ? '✓' : `${idx + 1}`),
        h('div', { class: 'mn-body lt' },
          h('h3', {}, les.title),
          h('p', {}, les.subtitle),
          h('div', { class: 'mn-stars' }, '⭐'.repeat(stars) || '☆☆☆')
        ),
        isLocked
          ? h('span', { class: 'mn-lock' }, '🔒')
          : h('a', { class: 'btn btn-sm btn-sub', href: `#/mindmap/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
      );
    });

    return h('div', { class: 'chapter' },
      h('h3', {},
        h('span', {}, ch.emoji), ' ', ch.title,
        h('small', {}, ch.desc)
      ),
      h('div', { class: 'chapter-lessons' }, lessonNodes)
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, 'Zamiast gubić się w nudnych, ciągnących się notatkach linijka po linijce, zamieniasz całą wiedzę w barwne drzewo skojarzeń. Niezbędna do nauki całych działów do egzaminu, przygotowywania wystąpień publicznych bez kartki oraz planowania złożonych projektów!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/mindmap', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🐙 ', h('span', { class: 'grad' }, 'Mapy Myśli z Ośmiornicą Inką')),
    h('p', { class: 'lead' }, 'Opanuj sztukę nielinearnych notatek, rozgałęziaj myśli w 8 stron i zapamiętuj całe książki na jednej kartce.'),
    octopus.el,
    whyCard,
    h('div', { class: 'bar-progress', style: `--p:${(doneCount / LESSONS.length) * 100}%` }, h('i')),
    h('div', { class: 'map-list' }, chaptersElements)
  );

  root.append(view);
  setTimeout(() => {
    octopus.say(
      doneCount === 0
        ? 'Plusk! Jestem Ośmiornica Inka 🐙 Rozciągnijmy macki wyobraźni i stwórzmy Twoją pierwszą mapę myśli!'
        : `Świetnie! Masz zaliczone ${doneCount}/${LESSONS.length} lekcji kartografii umysłu! Płyniemy dalej? 🌊`,
      'happy'
    );
  }, 200);

  return () => octopus.destroy();
}

function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const octopus = createOctopus({ size: 'md' });
  let answered = false;

  let diagramVisual = null;
  if (les.diagram) {
    if (les.diagram.type === 'comparison') {
      diagramVisual = h('div', { class: 'mm-compare-box' },
        h('div', { class: 'mm-compare-bad' },
          h('b', {}, les.diagram.bad.title),
          h('p', {}, les.diagram.bad.desc)
        ),
        h('div', { class: 'mm-compare-good' },
          h('b', {}, les.diagram.good.title),
          h('p', {}, les.diagram.good.desc)
        )
      );
    } else if (les.diagram.type === 'mindmap') {
      diagramVisual = h('div', { class: 'mm-lesson-diagram' },
        h('div', { class: 'mm-diag-center' }, les.diagram.center),
        h('div', { class: 'mm-diag-branches-grid' },
          les.diagram.branches.map(br =>
            h('div', { class: 'mm-diag-branch-card', style: `--bcolor:${br.color}` },
              h('b', {}, `${br.icon} ${br.name}`),
              h('span', {}, br.note)
            )
          )
        )
      );
    }
  }

  const theoryBox = h('div', { class: 'theory-card theory-box' },
    h('h3', {}, '🐙 Pędzel Inki: ', les.title),
    diagramVisual,
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '🐙 Podpowiedź Inki');
  hintBtn.addEventListener('click', () => {
    octopus.say(les.task.hint, 'think', { revert: 4000 });
  });

  const dots = h('div', { class: 'step-dots' }, LESSONS.map((_, i) => h('i', { class: i < index ? 'done' : i === index ? 'now' : '' })));

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/mindmap/train', class: 'back' }, '← Mapa szkolenia')),
    h('div', { class: 'step-head' },
      dots,
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    octopus.el,
    theoryBox,
    h('div', { class: 'task-box' },
      h('h3', { class: 'task-prompt' }, les.task.prompt),
      optContainer,
      h('div', { class: 'task-foot' }, hintBtn)
    )
  );

  function pick(idx, btn) {
    if (answered) return;
    const isOk = idx === les.task.correct;
    if (isOk) {
      answered = true;
      btn.classList.add('correct');
      sfx.success();
      octopus.setMood('cheer', 2500);
      octopus.say('Brawo! Trafiłeś w samo sedno mapy myśli! Moje macki biją brawo! 🐙✨', 'cheer');

      const prog = store.get('mindmap.train', {});
      prog[les.id] = 3;
      store.set('mindmap.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono szkolenie Kartografa! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/mindmap/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/mindmap';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      octopus.setMood('sad', 1800);
      octopus.say(les.task.hint, 'think', { revert: 3500 });
      setTimeout(() => btn.classList.remove('wrong'), 800);
    }
  }

  (les.task.options || []).forEach((opt, idx) => {
    const btn = h('button', { class: 'btn-opt', type: 'button' }, opt);
    btn.addEventListener('click', () => pick(idx, btn));
    optContainer.append(btn);
  });

  root.append(view);
  setTimeout(() => {
    octopus.say(les.speech || `Plusk! Lekcja ${index + 1}: ${les.subtitle}. Zbudujmy tę gałąź!`, 'happy');
  }, 250);

  return () => octopus.destroy();
}









function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const octopus = createOctopus({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let lives = 3;
  let timeLeft = modeId === 'speed_map' ? 30 : 0;
  let timerInterval = null;
  let isGameOver = false;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const livesEl = modeId !== 'speed_map' ? h('span', { class: 'hud-lives' }, '❤️❤️❤️') : null;
  const timerEl = modeId === 'speed_map' ? h('span', { class: 'hud-timer' }, '⏱ ', h('b', {}, '30s')) : null;
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/mindmap', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      livesEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Szanse'), livesEl) : null,
      timerEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Czas'), timerEl) : null
    ),
    octopus.el,
    playArea
  );

  root.append(view);

  const CHEERS = [
    'Plusk! Genialne połączenie na mapie myśli! 🐙💡',
    'Oto siła nielinearnych notatek! Masz to w głowie! 🎨✨',
    'Twoje macki myśli sięgają wszędzie! Pięknie! 🧠⚡',
    'Brakująca gałąź znaleziona w ułamku sekundy! 🗺️⭐',
    'Czysta kartografia umysłu! Inka bije brawo wszystkimi mackami! 🌊👏'
  ];

  function cheerInka(c) {
    if (c % 5 === 0 && c > 0) {
      octopus.say(`Niesamowita seria x${c}! Ośmiornica Inka kręci piruety z zachwytu! 🐙🏆✨`, 'cheer', { revert: 1800 });
      octopus.spin?.();
    } else if (c % 2 === 0 && c > 0) {
      octopus.say(`Combo x${c}! Twoje neurony rozrastają się jak rafa koralowa! 🪸⚡`, 'cheer', { revert: 1400 });
      octopus.hop?.();
    } else {
      octopus.hop?.();
      octopus.say(rand(CHEERS), 'cheer', { revert: 1100 });
    }
  }

  function updateLives() {
    if (livesEl) livesEl.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      if (isGameOver) return;
      timeLeft--;
      if (timerEl) {
        timerEl.replaceChildren('⏱ ', h('b', {}, `${timeLeft}s`));
      }
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }, 1000);
  }

  function gameOver() {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    playArea.innerHTML = '';

    const bestKey = `mindmap.free.${modeId}.best`;
    const prevBest = store.get(bestKey, 0);
    const isNewRecord = score > prevBest;
    if (isNewRecord) store.set(bestKey, score);

    sfx.fanfare();
    octopus.setMood('happy');
    octopus.say(
      score > 60
        ? `Wspaniały wynik! Zdobywasz ${score} punktów! Ośmiornica Inka jest pod wielkim wrażeniem! 🐙🏆`
        : `Dobra runda! Zdobywasz ${score} punktów. Z każdą mapą myśli Twoja pamięć jest coraz silniejsza! 💡`,
      'happy'
    );

    const restartBtn = h('button', { class: 'btn btn-primary btn-lg', type: 'button' }, 'Zagraj ponownie 🔄');
    restartBtn.addEventListener('click', () => {
      score = 0;
      round = 1;
      combo = 0;
      lives = 3;
      timeLeft = modeId === 'speed_map' ? 30 : 0;
      isGameOver = false;
      scoreEl.textContent = '0';
      roundEl.textContent = '1';
      updateLives();
      if (timerEl) timerEl.textContent = '⏱ 30s';
      nextRound();
      if (modeId === 'speed_map') startTimer();
    });

    const goCard = h('div', { class: 'go-card' },
      h('div', { class: 'go-badge' }, 'Koniec gry! 🐙'),
      h('h2', {}, 'Świetny trening map myśli!'),
      h('div', { class: 'go-score' }, `${score} pkt`),
      isNewRecord ? h('p', { class: 'badge badge-gold mb-2' }, '⭐ NOWY REKORD! ⭐') : null,
      h('p', { class: 'text-muted mb-4' }, `Najlepszy wynik: ${Math.max(prevBest, score)} pkt`),
      h('div', { class: 'go-actions' },
        restartBtn,
        h('a', { class: 'btn btn-ghost btn-lg', href: '#/mindmap' }, '← Zmień tryb')
      )
    );

    playArea.append(goCard);
  }

  function handleWrong(solution) {
    sfx.wrong();
    combo = 0;
    if (modeId !== 'speed_map') {
      lives--;
      updateLives();
      if (lives <= 0) {
        octopus.setMood('sad', 1500);
        octopus.say(`Koniec szans! Prawidłowa odpowiedź to: ${solution}. Zobaczmy Twój wynik! 🐙`, 'think', { revert: 2200 });
        setTimeout(gameOver, 800);
        return;
      }
    }
    octopus.setMood('sad', 1200);
    octopus.say(`Oj, pomyłka! Prawidłowa odpowiedź: ${solution}. Walczymy dalej! 💡`, 'think', { revert: 2000 });
    round++;
    roundEl.textContent = `${round}`;
    setTimeout(nextRound, 700);
  }

  function handleCorrect(pts = 10) {
    sfx.pop();
    score += pts + combo * 2;
    combo++;
    scoreEl.textContent = `${score}`;
    cheerInka(combo);
    round++;
    roundEl.textContent = `${round}`;
    setTimeout(nextRound, 550);
  }

  function nextRound() {
    if (isGameOver) return;
    playArea.innerHTML = '';
    let answered = false;

    const m = rand(MIND_MAPS);

    switch (modeId) {
      // 1. BRAKUJĄCA GAŁĄŹ: jedno z 4 ramion ma znak ?
      case 'missing_branch': {
        const targetBranch = rand(m.branches);
        const wrongBranches = MIND_MAPS.flatMap(mm => mm.branches)
          .filter(b => b.name !== targetBranch.name)
          .map(b => `${b.emoji} ${b.name}`);
        const choices = shuffle([`${targetBranch.emoji} ${targetBranch.name}`, ...shuffle(wrongBranches).slice(0, 3)]);

        const mapPreview = h('div', { class: 'mindmap-card' },
          h('div', { class: 'mm-center-badge' }, `${m.emoji} ${m.title}`),
          h('div', { class: 'mm-branches-preview' },
            m.branches.map(b => {
              const isTarget = b.name === targetBranch.name;
              return h('div', { class: `mm-branch-pill ${isTarget ? 'target' : ''}` },
                isTarget ? '❓ [Brakujące ramię]' : `${b.emoji} ${b.name}`
              );
            })
          ),
          h('p', { class: 'lead' }, `Jak nazywa się brakujące ramię w mapie myśli „${m.title}”?`)
        );

        const optGrid = h('div', { class: 'choice-grid opt-grid' });
        choices.forEach(c => {
          const btn = h('button', { class: 'btn-opt', type: 'button' }, c);
          btn.addEventListener('click', () => {
            if (answered) return;
            answered = true;
            if (c === `${targetBranch.emoji} ${targetBranch.name}`) {
              btn.classList.add('correct');
              handleCorrect(15);
            } else {
              btn.classList.add('wrong');
              handleWrong(`${targetBranch.emoji} ${targetBranch.name}`);
            }
          });
          optGrid.append(btn);
        });

        playArea.append(mapPreview, optGrid);
        break;
      }

      // 2. GDZIE PRZYPIĄĆ MACKĘ: do której gałęzi należy element?
      case 'categorize': {
        const branch = rand(m.branches);
        const item = rand(branch.items);
        const otherBranches = m.branches.filter(b => b.name !== branch.name);
        const choices = shuffle([`${branch.emoji} ${branch.name}`, ...otherBranches.map(b => `${b.emoji} ${b.name}`)]);

        const card = h('div', { class: 'mindmap-card' },
          h('div', { class: 'mm-center-badge' }, `${m.emoji} ${m.title}`),
          h('div', { class: 'mm-item-showcase' }, item),
          h('p', { class: 'lead' }, `Do którego ramienia mapy myśli „${m.title}” przypniesz element „${item}”?`)
        );

        const optGrid = h('div', { class: 'choice-grid opt-grid' });
        choices.forEach(c => {
          const btn = h('button', { class: 'btn-opt', type: 'button' }, c);
          btn.addEventListener('click', () => {
            if (answered) return;
            answered = true;
            if (c === `${branch.emoji} ${branch.name}`) {
              btn.classList.add('correct');
              handleCorrect(12);
            } else {
              btn.classList.add('wrong');
              handleWrong(`${branch.emoji} ${branch.name}`);
            }
          });
          optGrid.append(btn);
        });

        playArea.append(card, optGrid);
        break;
      }

      // 3. ZNAJDŹ INTRUZA: jeden element nie pasuje do gałęzi
      case 'find_intruder': {
        const branch = rand(m.branches);
        const legitimateItems = shuffle(branch.items).slice(0, 3);
        // Pobierz intruza z zupełnie innej mapy
        const otherMaps = MIND_MAPS.filter(mm => mm.id !== m.id);
        const randomOtherMap = rand(otherMaps);
        const intruder = rand(rand(randomOtherMap.branches).items);

        const choices = shuffle([...legitimateItems, intruder]);

        const card = h('div', { class: 'mindmap-card' },
          h('div', { class: 'mm-center-badge' }, `${m.emoji} ${m.title}`),
          h('div', { class: 'mm-branch-focus' }, `Ramię: ${branch.emoji} ${branch.name}`),
          h('p', { class: 'lead' }, `Który z poniższych elementów jest INTRUZEM i nie pasuje do tej gałęzi?`)
        );

        const optGrid = h('div', { class: 'choice-grid opt-grid' });
        choices.forEach(c => {
          const btn = h('button', { class: 'btn-opt', type: 'button' }, c);
          btn.addEventListener('click', () => {
            if (answered) return;
            answered = true;
            if (c === intruder) {
              btn.classList.add('correct');
              handleCorrect(15);
            } else {
              btn.classList.add('wrong');
              handleWrong(intruder);
            }
          });
          optGrid.append(btn);
        });

        playArea.append(card, optGrid);
        break;
      }

      // 4. WYŚCIG Z INKĄ (30 sekund)
      case 'speed_map': {
        const branch = rand(m.branches);
        const item = rand(branch.items);
        const wrongBranches = MIND_MAPS.flatMap(mm => mm.branches)
          .filter(b => b.name !== branch.name)
          .map(b => `${b.emoji} ${b.name}`);
        const choices = shuffle([`${branch.emoji} ${branch.name}`, ...shuffle(wrongBranches).slice(0, 3)]);

        const card = h('div', { class: 'mindmap-card' },
          h('div', { class: 'mm-center-badge' }, `${m.emoji} ${m.title}`),
          h('div', { class: 'mm-item-showcase speed' }, item),
          h('p', { class: 'lead' }, `Szybko! Do którego ramienia należy „${item}”?`)
        );

        const optGrid = h('div', { class: 'choice-grid opt-grid' });
        choices.forEach(c => {
          const btn = h('button', { class: 'btn-opt', type: 'button' }, c);
          btn.addEventListener('click', () => {
            if (answered) return;
            answered = true;
            if (c === `${branch.emoji} ${branch.name}`) {
              btn.classList.add('correct');
              handleCorrect(15);
            } else {
              btn.classList.add('wrong');
              handleWrong(`${branch.emoji} ${branch.name}`);
            }
          });
          optGrid.append(btn);
        });

        playArea.append(card, optGrid);
        break;
      }
    }
  }

  nextRound();
  if (modeId === 'speed_map') startTimer();

  return () => {
    if (timerInterval) clearInterval(timerInterval);
    octopus.destroy();
  };
}










function mountMenu(root, { nav }) {
  const octopus = createOctopus({ size: 'md' });
  const prog = store.get('mindmap.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/mindmap/train' : `#/mindmap/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🐙 Szkolenie z Ośmiornicą Inką'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę Map Myśli' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
        h('p', {}, `${LESSONS.length} lekcji · promieniście od centrum · nielinearne notatki i gałęzie wiedzy`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/mindmap/train' }, 'Zobacz mapę lekcji kartografii umysłu →');

  const modeCards = MODES.map(m => {
    const best = store.get(`mindmap.free.${m.id}.best`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/mindmap/free/${m.id}`,
      style: `--c1:${m.accent[0]};--c2:${m.accent[1]}`
    },
      h('div', { class: 'mc-emoji' }, m.emoji),
      h('div', { class: 'mc-body' },
        h('h3', {}, m.title),
        h('p', {}, m.desc)
      ),
      h('div', { class: 'mc-best' },
        h('b', {}, best ? `${best}` : '–'),
        h('span', {}, best ? 'rekord' : 'brak')
      )
    );
  });

  const view = h('section', { class: 'screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
    h('div', { class: 'game-head' },
      h('div', {},
        h('h1', {}, '🐙 ', h('span', { class: 'grad' }, 'Mapy myśli')),
        h('p', { class: 'lead' }, 'Rozwiń 8 macek swojej wyobraźni! Twórz nielinearne notatki wizualne, zapamiętuj całe książki, projekty i wystąpienia na jednej kartce.')
      )
    ),
    octopus.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Plusk! Jestem Ośmiornica Inka 🐙 Rozrysujemy każdą wiedzę w barwne gałęzie myśli!'
    : done < LESSONS.length
      ? `Świetnie! Masz ${done} z ${LESSONS.length} lekcji! Ruszajmy po kolejne gwiazdki! 🌊`
      : 'Opanowałeś mapy myśli po mistrzowsku! Wybierz tryb gry swobodnej! 🏆';

  setTimeout(() => { octopus.say(greet, 'happy'); }, 300);
  return () => octopus.destroy();
}

return {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};

  })();
  


  /* ==========================================================================
     14. GAMES REGISTRY (10 PEŁNYCH SYSTEMÓW PAMIĘCIOWYCH)
     ========================================================================== */
  const GAMES = [
    {
      id: 'digits', title: 'Cyfry', emoji: '🐱', status: 'ready',
      tagline: 'Zapamiętuj numery telefonów, PIN i ciągi cyfr. Szkolenie z Kotkiem Mruczkiem + 6 trybów gry.',
      accent: ['#7c5cff', '#ff6bd6'], tags: ['Kotek Mruczek 🐱', '9 lekcji', '6 trybów'],
      load: () => Promise.resolve(digitsGame)
    },
    {
      id: 'palace', title: 'Pałac pamięci', emoji: '🐯', status: 'ready',
      tagline: 'Metoda Loci i spacer po komnatach. Szkolenie z Tygryskiem Leonem + 5 wariantów gry.',
      accent: ['#ff9233', '#ffc857'], tags: ['Tygrysek Leon 🐯', '8 lekcji', '5 wariantów'],
      load: () => Promise.resolve(palaceGame)
    },
    {
      id: 'names', title: 'Imiona i twarze', emoji: '🦊', status: 'ready',
      tagline: 'Nigdy więcej „znam tę twarz, ale jak on miał na imię?”. Kotwice cech i mosty fonetyczne z Liskiem.',
      accent: ['#ff6b35', '#f7971e'], tags: ['Lisek Bystrzak 🦊', '6 lekcji', '4 warianty'],
      load: () => Promise.resolve(namesGame)
    },
    {
      id: 'major', title: 'System Major', emoji: '🦉', status: 'ready',
      tagline: 'Tajemny kod mistrzów: zamieniaj cyfry 0-9 na spółgłoski, słowa i żywe obrazy ze Sówką Profesorem.',
      accent: ['#8a2be2', '#da70d6'], tags: ['Sówka Profesor 🦉', '8 wykładów', '4 warianty'],
      load: () => Promise.resolve(majorGame)
    },
    {
      id: 'words', title: 'Słówka i języki', emoji: '🦜', status: 'ready',
      tagline: 'Angielski i hiszpański w mig! Metoda słów-kluczy (Keyword Method) z Papużką Polą.',
      accent: ['#00b09b', '#96c93d'], tags: ['Papużka Pola 🦜', '6 lekcji', '4 warianty'],
      load: () => Promise.resolve(wordsGame)
    },
    {
      id: 'cards', title: 'Karty do gry', emoji: '🦝', status: 'ready',
      tagline: 'Cała talia 52 kart w głowie! System PAO (Postać - Akcja - Obiekt) z Szopem Magikiem.',
      accent: ['#e11d48', '#fb7185'], tags: ['Szop Magik 🦝', '6 lekcji', '4 warianty'],
      load: () => Promise.resolve(cardsGame)
    },
    {
      id: 'link', title: 'Łańcuch skojarzeń', emoji: '🐿️', status: 'ready',
      tagline: 'Efekt domina w pamięci! Listy zakupów, przemówienia i procedury z Wiewiórką Basią.',
      accent: ['#d35400', '#f39c12'], tags: ['Wiewiórka Basia 🐿️', '6 lekcji', '4 warianty'],
      load: () => Promise.resolve(linkGame)
    },
    {
      id: 'calendar', title: 'Kalendarz w głowie', emoji: '🐢', status: 'ready',
      tagline: 'Dzień tygodnia dowolnej daty w historii w 3 sekundy. Genialny algorytm Doomsday z Żółwikiem.',
      accent: ['#16a34a', '#22c55e'], tags: ['Żółwik Zenon 🐢', '6 lekcji', '4 warianty'],
      load: () => Promise.resolve(calendarGame)
    },
    {
      id: 'acrostic', title: 'Akrostychy i rymy', emoji: '🐶', status: 'ready',
      tagline: 'Złap trop pierwszych liter! Planety, tęcza, rzymskie cyfry i reguły szkolne z Pieskiem Łatkiem.',
      accent: ['#f59e0b', '#d97706'], tags: ['Piesek Łatek 🐶', '10 lekcji', '4 warianty'],
      load: () => Promise.resolve(acrosticGame)
    },
    {
      id: 'mindmap', title: 'Mapy myśli', emoji: '🐙', status: 'ready',
      tagline: 'Ogarnij chaos wiedzy! Promieniste gałęzie, słowa-klucze i kolorowe notatki z Ośmiornicą Inką.',
      accent: ['#d946ef', '#8b5cf6'], tags: ['Ośmiornica Inka 🐙', '10 lekcji', '4 warianty'],
      load: () => Promise.resolve(mindmapGame)
    }
  ];


  /* ==========================================================================
     15. APP ROUTING & CORE INIT
     ========================================================================== */






































































  const app = $('#app');
  let cleanup = null;
  let routeId = 0;

  const nav = path => { location.hash = '#/' + path; };

  function renderHub() {
    const cat = createCat({ size: 'lg' });
    const trainStars =
      Object.values(store.get('digits.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('palace.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('names.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('major.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('words.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('cards.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('link.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('calendar.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('acrostic.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('mindmap.train', {})).reduce((a, b) => a + b, 0);
    const streak = currentStreak();

    const cards = GAMES.map(g => {
      const ready = g.status === 'ready';
      const el = h(ready ? 'a' : 'div', {
        class: `game-card${ready ? '' : ' soon'}`,
        style: `--c1:${g.accent[0]};--c2:${g.accent[1]}`,
        href: ready ? `#/${g.id}` : null,
        'aria-disabled': ready ? null : 'true'
      },
        h('div', { class: 'gc-emoji' }, g.emoji),
        h('h3', {}, g.title),
        h('p', {}, g.tagline),
        ready
          ? h('div', { class: 'gc-tags' }, g.tags.map(t => h('span', {}, t)))
          : h('div', { class: 'gc-tags' }, h('span', { class: 'soon-badge' }, 'Wkrótce')),
        ready && h('span', { class: 'gc-play' }, 'Graj ▶')
      );
      return el;
    });

    const view = h('section', { class: 'screen hub' },
      h('div', { class: 'hero' },
        cat.el,
        h('h1', {}, 'Świat ', h('span', { class: 'grad' }, 'pamięci')),
        h('p', { class: 'lead' }, 'Mini-gry, w których uczysz się technik pamięciowych używanych przez mistrzów. Zapamiętasz numer telefonu i całe listy w kilka chwil!')
      ),
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('b', {}, `🔥 ${streak}`), h('span', {}, streak === 1 ? 'dzień z rzędu' : 'dni z rzędu')),
        h('div', { class: 'stat' }, h('b', {}, `⭐ ${trainStars}`), h('span', {}, 'gwiazdek')),
        h('div', { class: 'stat' }, h('b', {}, `🎮 ${GAMES.filter(g => g.status === 'ready').length}/${GAMES.length}`), h('span', {}, 'gier gotowych'))
      ),
      h('h2', { class: 'section-title' }, 'Wybierz grę'),
      h('div', { class: 'game-grid' }, cards)
    );
    app.append(view);

    const hello = streak > 1
      ? `Miau! ${streak} dni z rzędu – świetna passa! 🔥 Twoje urocze zwierzątka czekają na trening!`
      : rand(['Miau! 10 potężnych systemów pamięciowych czeka na Ciebie! 🐾', 'Cześć! 10 genialnych modułów pamięciowych czeka na Ciebie 💪', 'Gotowy na trening pamięci? Wybierz grę! ✨']);
    setTimeout(() => { cat.wave(); cat.say(hello, 'happy'); }, 350);
    return () => cat.destroy();
  }

  async function route() {
    const id = ++routeId;
    cleanup?.(); cleanup = null;
    app.replaceChildren();
    window.scrollTo(0, 0);

    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    const game = GAMES.find(g => g.id === parts[0] && g.load);
    if (document.body) document.body.dataset.game = game ? game.id : 'hub';

    if (!game) { cleanup = renderHub(); return; }
    try {
      const mod = await game.load();
      if (id !== routeId) return;
      touchStreak();
      cleanup = mod.mount(app, { params: parts.slice(1), nav });
    } catch (err) {
      console.error(err);
      if (id === routeId) app.append(h('p', { class: 'screen' }, 'Ups, coś poszło nie tak. Odśwież stronę.'));
    }
  }

  addEventListener('hashchange', route);
  route();

  /* ==========================================================================
     16. GLOBAL UI LISTENERS & DIALOGS
     ========================================================================== */
  const soundBtn = $('#soundBtn');
  const paintSound = () => {
    if (!soundBtn) return;
    soundBtn.textContent = sound.on ? '🔊' : '🔇';
    soundBtn.setAttribute('aria-pressed', String(sound.on));
  };
  soundBtn?.addEventListener('click', () => { sound.toggle(); paintSound(); sfx.pop(); });
  paintSound();

  
  
  
  
  
  
  
  
  /* ---------- Język (PL / USA) ---------- */
  const langPlBtn = $('#langPlBtn');
  const langEnBtn = $('#langEnBtn');
  const paintLang = () => {
    const cur = typeof getLang === 'function' ? getLang() : 'pl';
    if (langPlBtn) {
      langPlBtn.classList.toggle('active', cur === 'pl');
      langPlBtn.setAttribute('aria-pressed', String(cur === 'pl'));
    }
    if (langEnBtn) {
      langEnBtn.classList.toggle('active', cur === 'en');
      langEnBtn.setAttribute('aria-pressed', String(cur === 'en'));
    }
  };
  langPlBtn?.addEventListener('click', () => {
    if (typeof getLang === 'function' && getLang() === 'pl') return;
    if (typeof setLang === 'function') setLang('pl');
    paintLang();
    sfx.pop();
    route();
  });
  langEnBtn?.addEventListener('click', () => {
    if (typeof getLang === 'function' && getLang() === 'en') return;
    if (typeof setLang === 'function') setLang('en');
    paintLang();
    sfx.pop();
    route();
  });
  paintLang();
  if (typeof applyLangToDOM === 'function') {
    applyLangToDOM(typeof getLang === 'function' ? getLang() : 'pl');
  }

  const guide = $('#guide');
  const openGuide = () => { guide?.showModal(); sfx.pop(); };
  $('#guideBtn')?.addEventListener('click', openGuide);

  const about = $('#about');
  const openAbout = () => { about?.showModal(); sfx.pop(); };
  $('#authorBtn')?.addEventListener('click', openAbout);
  $('#authorLink')?.addEventListener('click', openAbout);
  document.querySelectorAll('dialog').forEach(d =>
    d.addEventListener('click', e => { if (e.target === d) d.close(); }));

  const installBtn = $('#installBtn');
  const installModal = $('#installModal');
  const directInstallBtn = $('#directInstallBtn');
  let deferred = null;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;

  if (standalone && installBtn) {
    installBtn.hidden = true;
  }

  addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferred = e;
    if (directInstallBtn) directInstallBtn.hidden = false;
  });

  addEventListener('appinstalled', () => {
    if (installBtn) installBtn.hidden = true;
    installModal?.close();
    deferred = null;
  });

  const triggerInstall = async () => {
    if (deferred) {
      deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === 'accepted') {
        deferred = null;
        if (installBtn) installBtn.hidden = true;
        installModal?.close();
      }
    } else {
      installModal?.showModal();
    }
  };

  installBtn?.addEventListener('click', triggerInstall);
  directInstallBtn?.addEventListener('click', triggerInstall);

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(console.warn));
  }
})();
