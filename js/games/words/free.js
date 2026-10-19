import { h, rand, shuffle, sleep } from '../../dom.js';
import { sfx } from '../../sound.js';
import { store } from '../../store.js';
import { createParrot } from '../../parrot.js';
import { VOCAB } from './vocab.js';
import { MODES } from './modes.js';

export function mountFree(root, { modeId, nav }) {
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

  const CHEERS = ['Poliglota! 🦜✨', 'Most fonetyczny działa! 🌉', 'Jak rodowity mówca! 🗣️', 'Słowo zapamiętane! 📖', 'Bez pudła! 🎯'];
  function cheerParrot(c) {
    if (c % 3 === 0 && c > 0) {
      parrot.say(`Combo x${c}! Pola śpiewa z zachwytu! Twój słownik pęka w szwach! 🦜🎶`, 'cheer', { revert: 1400 });
      parrot.hop?.();
    } else {
      parrot.say(rand(CHEERS), 'cheer', { revert: 1000 });
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
            if (modeId === 'sprint') {
              timeLeft += 2; // bonus czasowy
              if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
            }
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerParrot(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            if (modeId === 'sprint') {
              sfx.wrong();
              timeLeft = Math.max(1, timeLeft - 2);
              if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
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
