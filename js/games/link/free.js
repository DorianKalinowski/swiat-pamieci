import { h, rand, shuffle, sleep } from '../../dom.js';
import { sfx } from '../../sound.js';
import { store } from '../../store.js';
import { createSquirrel } from '../../squirrel.js';
import { LINK_ITEMS } from './chains.js';
import { MODES } from './modes.js';

export function mountFree(root, { modeId, nav }) {
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
