import { h } from '../../dom.js';
import { sfx } from '../../sound.js';
import { store } from '../../store.js';
import { createRaccoon } from '../../raccoon.js';
import { LESSONS } from './lessons.js';

export function mountMap(root, { nav }) {
  const raccoon = createRaccoon({ size: 'md' });
  const prog = store.get('cards.train', {});
  const doneCount = LESSONS.filter(l => prog[l.id]).length;

  const items = LESSONS.map((les, idx) => {
    const stars = prog[les.id] || 0;
    const isLocked = idx > 0 && !prog[LESSONS[idx - 1].id] && !prog[les.id];
    return h('div', { class: `map-node ${stars ? 'done' : ''} ${isLocked ? 'locked' : ''}` },
      h('div', { class: 'mn-idx' }, `${idx + 1}`),
      h('div', { class: 'mn-body' },
        h('h3', {}, les.title),
        h('p', {}, les.subtitle),
        h('div', { class: 'mn-stars' }, '⭐'.repeat(stars) || '☆☆☆')
      ),
      isLocked
        ? h('span', { class: 'mn-lock' }, '🔒')
        : h('a', { class: 'btn btn-sm btn-sub', href: `#/cards/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, 'Elitarny trening skupienia, uwagi i pamięci roboczej stosowany przez arcymistrzów. Zwiększa koncentrację przy nauce, pozwala dominować w grach karcianych i uczy kodowania złożonych procedur!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/cards', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🦝 ', h('span', { class: 'grad' }, 'Szkoła Magii Kart')),
    h('p', { class: 'lead' }, 'Poznaj technikę PAO i zapamiętuj całe talie kart z Szopem Magikiem.'),
    raccoon.el,
    whyCard,
    h('div', { class: 'map-list' }, items)
  );

  root.append(view);
  setTimeout(() => {
    raccoon.say(
      doneCount === 0
        ? 'Tadaam! Jestem Szop Magik 🦝 Talia 52 kart w głowie to żaden problem, to czysta iluzja!'
        : `Świetny postęp! ${doneCount}/${LESSONS.length} lekcji za nami! Tasujemy dalej!`,
      'happy'
    );
  }, 200);

  return () => raccoon.destroy();
}

export function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const raccoon = createRaccoon({ size: 'md' });
  let answered = false;

  const theoryBox = h('div', { class: 'theory-card' },
    h('h3', {}, '🦝 Magiczna sztuczka Szopa: ', les.title),
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '🦝 Podpowiedź Szopa');
  hintBtn.addEventListener('click', () => {
    raccoon.say(les.task.hint, 'think', { revert: 4000 });
  });

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/cards/train', class: 'back' }, '← Mapa szkolenia')),
    h('div', { class: 'step-head' },
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    raccoon.el,
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
      raccoon.setMood('cheer', 2500);
      raccoon.say('Brawo! Prawdziwy mistrz iluzji!', 'cheer');

      const prog = store.get('cards.train', {});
      prog[les.id] = 3;
      store.set('cards.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono szkołę magii! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/cards/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/cards';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      raccoon.setMood('sad', 1800);
      raccoon.say(les.task.hint, 'think', { revert: 3500 });
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
    raccoon.say(les.speech || `Abrakadabra! Lekcja ${index + 1}: ${les.subtitle}. Spójrz na magiczną sztuczkę!`, 'happy');
  }, 250);

  return () => raccoon.destroy();
}
