import { h, shuffle, rand, sleep } from '../../dom.js';
import { createTiger } from '../../tiger.js';
import { store } from '../../store.js';
import { sfx } from '../../sound.js';
import { confetti } from '../../fx.js';
import { LESSONS } from './lessons.js';
import { ROOMS, ITEMS, getRoomById, getItemById } from './rooms.js';

export function mountMap(root, { nav }) {
  const tiger = createTiger({ size: 'md' });
  const prog = store.get('palace.train', {});
  const totalStars = Object.values(prog).reduce((a, b) => a + b, 0);
  const doneCount = LESSONS.filter(l => prog[l.id]).length;

  const cards = LESSONS.map((les, idx) => {
    const stars = prog[les.id] || 0;
    const unlocked = idx === 0 || !!prog[LESSONS[idx - 1].id];
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
            const room = getRoomById(loc.roomId);
            const item = getItemById(loc.itemId);
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
        h('p', { class: 'lead' }, `Zdobyto ${totalStars} z ${LESSONS.length * 3} gwiazdek · Ukończono ${doneCount}/${LESSONS.length} lekcji`)
      )
    ),
    tiger.el,
    whyCard,
    h('div', { class: 'lesson-list' }, cards)
  );

  root.append(view);

  const hello = doneCount === 0
    ? 'Rawrr! Witaj na mapie szkolenia! Wybierz lekcję 1, a powoli oprowadzę Cię po pałacu 🐯'
    : doneCount === LESSONS.length
      ? 'Jesteś niesamowity! Ukończyłeś wszystkie lekcje z 10 komnatami! Czas pobić rekordy w grze swobodnej! 🏆'
      : `Świetne postępy! Masz już ${doneCount} z ${LESSONS.length} lekcji. Wybierz kolejną komnatę! 🏰`;

  setTimeout(() => { tiger.wave(); tiger.say(hello, 'happy'); }, 250);
  return () => tiger.destroy();
}

export function mountStep(root, { nav, index }) {
  const lesson = LESSONS[index];
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

  // Render mini room tracker on top of stage
  function renderPathTracker(activeIdx, maxIdx, completedIdx = -1) {
    const chips = lesson.loci.map((loc, i) => {
      const room = getRoomById(loc.roomId);
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

  // --- Phase 1: Intro dialogues ---
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

  // --- Phase 2: Palace Presentation (Walkthrough) ---
  function startPresentation() {
    currentRoomIdx = 0;
    renderRoomPresentation();
  }

  function renderRoomPresentation() {
    stage.replaceChildren();
    controls.replaceChildren();

    const loc = lesson.loci[currentRoomIdx];
    const room = getRoomById(loc.roomId);
    const item = getItemById(loc.itemId);

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

    // Controls
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

  // --- Phase 3: Recall Phase ---
  function startRecallPhase() {
    recallIdx = 0;
    renderRecallStep();
  }

  function renderRecallStep() {
    stage.replaceChildren();
    controls.replaceChildren();

    const loc = lesson.loci[recallIdx];
    const room = getRoomById(loc.roomId);
    const correctItem = getItemById(loc.itemId);

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

    // Generate 4 choice options: 1 correct + 3 random distractors
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
            // Correct answer!
            btn.classList.add('correct');
            sfx.good();
            tiger.roar();
            tiger.say(`Tak jest! ${correctItem.emoji} ${correctItem.name}! Świetna pamięć!`, 'cheer');

            // Disable all choices
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
            // Mistake
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

    // Hint button
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

  // --- Phase 4: Finish Lesson ---
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

    const hasNext = index + 1 < LESSONS.length;
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

  // Kick off intro
  showIntro();

  return () => {
    cleanedUp = true;
    tiger.destroy();
  };
}
