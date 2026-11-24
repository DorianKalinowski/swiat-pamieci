import { h } from '../../dom.js';
import { sfx } from '../../sound.js';
import { store } from '../../store.js';
import { createDog } from '../../dog.js';
import { LESSONS, CHAPTERS } from './lessons.js';

export function mountMap(root, { nav }) {
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

export function mountStep(root, { nav, index }) {
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
