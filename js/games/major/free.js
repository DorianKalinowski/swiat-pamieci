import { h, rand, shuffle, sleep } from '../../dom.js';
import { sfx } from '../../sound.js';
import { store } from '../../store.js';
import { createOwl } from '../../owl.js';
import { PHONETIC_MAP, PEG_WORDS_2DIGIT } from './codes.js';
import { MODES } from './modes.js';

export function mountFree(root, { modeId, nav }) {
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

  const CHEERS = ['Huuu-hu! Fenomenalnie! 🦉', 'Kod złamany w sekundę! 🔐', 'Spółgłoski opanowane! 📖', 'Geniusz pamięci! 💡', 'Świetny strzał! 🎯'];
  function cheerOwl(c) {
    if (c % 3 === 0 && c > 0) {
      owl.say(`Combo x${c}! Twój mózg zamienia liczby w arcydzieła! 🦉✨`, 'cheer', { revert: 1400 });
      owl.hop?.();
    } else {
      owl.say(rand(CHEERS), 'cheer', { revert: 1000 });
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
