import { h, rand, shuffle } from '../../dom.js';
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
  let timeLeft = modeId === 'sprint' ? 30 : 0;
  let timerInterval = null;
  let isGameOver = false;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const timerEl = modeId === 'sprint' ? h('span', { class: 'hud-timer' }, '⏱ 30s') : null;
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/words', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      timerEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Czas'), timerEl) : null
    ),
    parrot.el,
    playArea
  );

  root.append(view);

  function saveBest() {
    const prev = store.get(`words.best.${modeId}`, 0);
    if (score > prev) store.set(`words.best.${modeId}`, score);
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
    playArea.append(
      h('div', { class: 'game-over-box' },
        h('h2', {}, '🎉 Rewelacyjny wynik!'),
        h('div', { class: 'go-score' },
          h('b', {}, `${score}`),
          h('span', {}, 'punktów')
        ),
        h('div', { class: 'go-best' }, `🏆 Rekord w tym trybie: ${best}`),
        h('div', { class: 'go-actions' },
          h('button', { class: 'btn btn-primary', type: 'button' }, 'Zagraj ponownie 🔄')
        )
      )
    );
    playArea.querySelector('.go-actions button').addEventListener('click', () => {
      mountFree(root, { modeId, nav });
    });
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
        h('span', { class: 'vocab-lang' }, `Język: ${target.lang}`)
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
            parrot.setMood('cheer', 1000);
            nextRound();
          } else {
            sfx.wrong();
            if (modeId === 'polyglot') {
              gameOver();
            } else {
              combo = 0;
              parrot.setMood('sad', 1200);
              parrot.say(`${target.foreign} to ${target.meaning}! Pamiętasz most: ${target.bridge}?`, 'think', { revert: 2800 });
              btn.classList.add('wrong');
              setTimeout(nextRound, 1200);
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
        h('p', { class: 'text-muted' }, 'Jaki jest polski most fonetyczny (brzmieniowy) dla tego słowa?')
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
            parrot.setMood('cheer', 1000);
            nextRound();
          } else {
            sfx.wrong();
            combo = 0;
            parrot.setMood('sad', 1200);
            parrot.say(`Mostem dla ${target.foreign} jest: ${target.bridge}!`, 'think', { revert: 2800 });
            btn.classList.add('wrong');
            setTimeout(nextRound, 1200);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);
    }
  }

  if (modeId === 'sprint') {
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }, 1000);
  }

  nextRound();

  return () => {
    if (timerInterval) clearInterval(timerInterval);
    parrot.destroy();
  };
}
