import { h, rand, shuffle } from '../../dom.js';
import { t } from '../../i18n.js';
import { sfx } from '../../sound.js';
import { store } from '../../store.js';
import { createDog } from '../../dog.js';
import { ACROSTICS } from './acrostics.js';
import { MODES } from './modes.js';

export function mountFree(root, { modeId, nav }) {
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
