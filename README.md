# 🧠 Świat Pamięci

> **Nowoczesna, interaktywna aplikacja webowa (PWA) do praktycznej nauki najskuteczniejszych technik pamięciowych poprzez wciągające mini-gry z uroczymi zwierzęcymi mentorami.**

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-success.svg)](#-funkcje-pwa-i-offline)
[![Zero Runtime Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20JS)-blue.svg)](#-architektura-i-technologie)
[![Tests Passing](https://img.shields.io/badge/Tests-96%2F96%20Passed-brightgreen.svg)](#-testy-automatyczne)
[![Author](https://img.shields.io/badge/Autor-Dorian%20Kalinowski-orange.svg)](#-o-projekcie-i-autorze)

---

## 🌟 O projekcie i autorze

**Autor:** Dorian Kalinowski  
**Misja projektu:** Umożliwić każdemu opanowanie i praktyczne wykorzystanie najpotężniejszych technik pamięciowych świata w formie lekkich, wciągających gier i ustrukturyzowanych lekcji.

Aplikacja została zaprojektowana z myślą o maksymalnej przystępności, pięknej minimalistycznej estetyce oraz pełnym komforcie gry na urządzeniach mobilnych (zarówno w przeglądarce, jak i w formie zainstalowanej aplikacji PWA).

---

## 🐾 8 Systemów Pamięciowych i Nasi Nauczyciele

Każda technika pamięciowa ma dedykowanego nauczyciela – urocze, animowane zwierzątko z własną paletą barw, minimalistycznym tłem ambientowym oraz unikalną osobowością:

| Moduł | Nauczyciel | Technika Pamięciowa | Co ćwiczysz? |
| :--- | :--- | :--- | :--- |
| **1. Cyfry** | 🐱 **Kotek Mruczek** | *System Kształtów Cyfr / Zakładkowy* | Błyskawiczne zapamiętywanie kodów PIN, numerów kont i ciągów cyfr dzięki skojarzeniom wizualnym (np. 1 = świeca, 2 = łabędź). |
| **2. Pałac Pamięci** | 🐯 **Tygrysek Leoś** | *Metoda Loci (Rzymski Pokój)* | Przestrzenne rozmieszczanie informacji w wyobrażonym pokoju (drzwi, sofa, biurko, regał, okno itp.). |
| **3. Imiona i Twarze** | 🦊 **Lisek Chytrusek** | *Hak Cechy Twarzy i Skojarzenia* | Kojarzenie charakterystycznych detali (okulary, fryzura, uśmiech) z imionami i barwnymi obrazami. |
| **4. Główny System Pamięciowy** | 🦉 **Sówka Mądra Głowa** | *Fonetyczny System Cyfrowy (Major System)* | Kodowanie liczb od 0 do 99 w spółgłoski i słowa, pozwalające zapamiętywać daty, telefony i rekordy. |
| **5. Słówka Językowe** | 🦜 **Papużka Pola** | *Metoda Słów Kluczy (Keyword Method)* | Błyskawiczne przyswajanie obcego słownictwa przez most fonetyczny w języku ojczystym. |
| **6. Karty i Kolory** | 🦝 **Szop Pracz Filip** | *System Kolorów, Figur i Kodu Kart* | Technika wielkich mistrzów pamięci (Memory Champions) do zapamiętywania talii kart. |
| **7. Metoda Łańcuchowa** | 🐿️ **Wiewiórka Basia** | *Łańcuch Skojarzeń i Żywe Opowieści* | Dynamiczne, barwne łączenie pojęć, list zakupów i przemówień w jedną niezapomnianą historię. |
| **8. Kalendarz w Głowie** | 🐢 **Żółw Nestor** | *Algorytm Dnia Tygodnia (Doomsday)* | Obliczanie w pamięci dnia tygodnia dla dowolnej daty roku za pomocą prostych kotwic i wag miesięcy. |

---

## 🎮 Tryby rozgrywki w każdym module

1. **Interaktywne Szkolenie (Krok po kroku):**
   - Starannie przygotowane lekcje od zupełnych podstaw do zaawansowanych wyzwań.
   - Prowadzone na sztywnych, przemyślanych przykładach edukacyjnych.
   - Zwierzątka na bieżąco podpowiadają, mrugają, kręcą główkami i reagują na Twoje kliknięcia.
2. **Gra Swobodna (Free Play):**
   - Nieskończona rozgrywka z generatorem zadań o rosnącej trudności.
   - Zwierzątka kibicują w trakcie gry, wysyłają serdeczne dialogi dopingu po sukcesach oraz dają ciepłe wsparcie przy pomyłkach.
   - System rekordów (High Scores) zapisywanych w pamięci urządzenia.

---

## 🚀 Kluczowe Cechy i Technologia

- **Zero Zależności Runtime (100% Pure Vanilla JS/HTML5/CSS3):**
  - Cała aplikacja na produkcji to zaledwie kilka lekkich plików (`index.html`, `bundle.js`, `styles.css`), ważących łącznie **poniżej 400 KB**.
  - Brak ciężkich frameworków (React, Angular itp.) oznacza natychmiastowe ładowanie (poniżej 100 ms).
- **PWA (Progressive Web App):**
  - Pełne wsparcie dla instalacji na smartfonach (**Android** oraz **iOS / Safari**).
  - Wbudowany Service Worker (`sw.js`) umożliwia **grę całkowicie w trybie offline** bez dostępu do Internetu.
- **Harmonijny Proceduralny Dźwięk (Web Audio API):**
  - Wszystkie dźwięki (kliknięcia, sukcesy, fanfary, pomyłki) są syntezowane proceduralnie w locie.
  - Brak konieczności pobierania plików MP3/WAV – zerowy narzut transferu danych.
- **Licznik Dni i Seria Aktywności (Daily Streak):**
  - Inteligentne śledzenie dni aktywności oparte o czas kalendarzowy UTC.
  - Każdy kolejny dzień z rzędu zwiększa serię (`+1`).
  - Pominięcie przynajmniej jednego dnia automatycznie zeruje serię, motywując do codziennego treningu.
- **Minimalistyczna Grafika i Płynne Animacje 60 FPS:**
  - Maskotki zaimplementowane w czystym, responsywnym kodzie SVG z mruganiem, zaróżowionymi policzkami i trójwymiarowymi błyskami w oczach.
  - Dedykowane dla każdego zwierzątka, animowane tła ambientowe z pływającymi motywami tematycznymi (nuty, piórka, gwiazdki, liście, karty, zegary), zoptymalizowane pod kątem GPU i baterii telefonu.

---

## 📂 Struktura Projektu i Informacja o Plikach

```text
swiat-pamieci/
├── assets/                     # Zdjęcia i materiały statyczne (w tym zdjęcie autora)
├── css/
│   └── styles.css              # Style aplikacji, animacje 60 FPS, motywy kolorystyczne maskotek
├── icons/                      # Ikony PWA w formatach 192x192, 512x512 itp.
├── js/
│   ├── bundle.js               # Zbudowany, scalony bundle produkcyjny (zawiera silnik i wszystkie 8 gier)
│   ├── app.js                  # Główny router i kontroler widoków
│   ├── audio.js                # Proceduralna synteza audio (Web Audio API)
│   ├── store.js                # Zarządzanie stanem, rekordami i serią dni (streak)
│   ├── mascots/                # Moduły SVG 8 maskotek (cat, tiger, fox, owl, parrot, raccoon, squirrel, turtle)
│   └── games/                  # Moduły gier (szkolenie i gra swobodna dla 8 systemów)
├── scripts/
│   └── build_bundle.js         # Lekki skrypt łączący moduły JS w jeden bundle produkcyjny
├── index.html                  # Główny punkt wejścia aplikacji PWA
├── manifest.webmanifest        # Manifest instalacyjny PWA dla systemów Android / iOS
├── sw.js                       # Service Worker zapewniający działanie offline
├── test_all_8_systems.js       # Pełny zestaw testów automatycznych (96 testów)
├── Uruchom gre.bat             # Szybki skrypt startowy dla systemu Windows
├── .gitignore                  # Wykluczenia gita (node_modules, pliki tymczasowe)
└── README.md                   # Niniejsza dokumentacja
```

### 💡 Dlaczego w repozytorium deweloperskim widać dużo plików?
- Ponad 98% plików w folderze roboczym to katalog `node_modules/`.
- Katalog ten został pobrany **wyłącznie do uruchamiania testów automatycznych w środowisku Node.js (`jsdom`)**.
- Sama aplikacja produkcyjna **nie wymaga Node.js ani żadnych zewnętrznych bibliotek**. Po wdrożeniu na serwer statyczny (np. Vercel, Netlify, GitHub Pages, Firebase) wgrywane są wyłącznie czyste pliki źródłowe HTML/CSS/JS.

---

## 💻 Jak uruchomić aplikację lokalnie?

### Metoda 1: Najszybsza (Windows)
Wystarczy dwukrotnie kliknąć plik:
```cmd
Uruchom gre.bat
```
Skrypt automatycznie uruchomi lokalny serwer i otworzy aplikację w Twojej domyślnej przeglądarce.

### Metoda 2: Dowolny serwer statyczny
Możesz użyć dowolnego narzędzia do serwowania plików statycznych, np.:
```bash
# Używając Pythona:
python -m http.server 8000

# Lub używając npx:
npx serve .
```
Następnie wejdź w przeglądarce pod adres: `http://localhost:8000`.

---

## 🧪 Testy Automatyczne

Aplikacja posiada rygorystyczny zestaw 96 testów automatycznych, weryfikujący:
1. Prawidłowość struktury SVG i renderowania oczu wszystkich 8 maskotek.
2. Działanie routera i przełączanie pomiędzy widokami wszystkich modułów.
3. Wszystkie lekcje szkoleniowe i ich walidację dla każdego z 8 systemów pamięciowych.
4. Generatory gier swobodnych, dialogi dopingu i pocieszenia.
5. Poprawność naliczania i zerowania serii dni (`streak`).
6. Czystość i integralność PWA oraz manifestu.

Aby uruchomić testy:
```bash
node test_all_8_systems.js
```

Wynik:
```text
=== PODSUMOWANIE TESTOW WSZYSTKICH 8 SYSTEMOW ===
Przeszlo: 96 / 96 testow
Bledy: 0
Status: WSZYSTKIE 8 SYSTEMOW DZIALAJA PERFEKCYJNIE!
```

---

## 📱 Instalacja PWA na telefonie

- **Android (Chrome):** Otwórz stronę, kliknij przycisk „Pobierz aplikację” w nagłówku lub wybierz menu przeglądarki `(⋮)` -> *Zainstaluj aplikację*.
- **iOS / iPhone (Safari):** Otwórz stronę w Safari, kliknij ikonę udostępniania na dole ekranu `(Kwadrat ze strzałką w górę)` -> przewiń w dół i wybierz *Do ekranu początkowego* (*Add to Home Screen*).

---

## 📄 Licencja

Projekt stworzony przez **Doriana Kalinowskiego**. Wszelkie prawa zastrzeżone © 2026.
