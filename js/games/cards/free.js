import { h, rand, shuffle, sleep } from '../../dom.js';
import { sfx } from '../../sound.js';
import { store } from '../../store.js';
import { createRaccoon } from '../../raccoon.js';
import { CARDS_PAO, getCardSvg } from './deck.js';
import { MODES } from './modes.js';

export function mountFree(root, { modeId, nav }) {
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
            timeLeft += 2; // bonus czasowy za spryt!
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
            nextRound();
          } else {
            sfx.wrong();
            timeLeft = Math.max(1, timeLeft - 2);
            if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
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
