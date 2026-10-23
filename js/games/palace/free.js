import { h, shuffle, rand, sleep } from '../../dom.js';
import { createTiger } from '../../tiger.js';
import { store } from '../../store.js';
import { sfx } from '../../sound.js';
import { confetti } from '../../fx.js';
import { getMode } from './modes.js';
import { ROOMS, ITEMS } from './rooms.js';

export function mountFree(root, { nav, modeId }) {
  const mode = getMode(modeId);
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

  // Generate loci sequence for current level
  function generateLoci(count) {
    const pickedRooms = shuffle([...ROOMS]).slice(0, count);
    const pickedItems = shuffle([...ITEMS]).slice(0, count);
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
        // Auto advance timer
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
        // Manual controls
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
      // Recall in reverse order (from last to first)
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

      // Choices
      const distractors = shuffle(ITEMS.filter(it => it.id !== correctItem.id)).slice(0, 3);
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
      // Randomly alternate between: "Which item was in Room X?" vs "Which room had Item Y?"
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
        const distractors = shuffle(ITEMS.filter(i => i.id !== target.item.id)).slice(0, 3);
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
        const distractors = shuffle(ROOMS.filter(r => r.id !== target.room.id)).slice(0, 3);
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

  // Kick off first round
  startRound();

  return () => {
    cleanedUp = true;
    clearTimeout(timerId);
    tiger.destroy();
  };
}
