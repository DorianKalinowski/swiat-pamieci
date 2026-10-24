import { h } from '../../dom.js';
import { sfx } from '../../sound.js';
import { store } from '../../store.js';
import { createParrot } from '../../parrot.js';
import { LESSONS } from './lessons.js';

export function mountMap(root, { nav }) {
  const parrot = createParrot({ size: 'md' });
  const prog = store.get('words.train', {});
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
        : h('a', { class: 'btn btn-sm btn-sub', href: `#/words/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, '3x szybsza nauka słówek z języka angielskiego! Zamiast wkuwać 50 razy, tworzysz jeden polski most dźwiękowy i pamiętasz znaczenie od razu!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/words', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🦜 ', h('span', { class: 'grad' }, 'Szkoła Językowa Papużki Poli')),
    h('p', { class: 'lead' }, 'Poznaj metodę słów-kluczy i zapamiętuj obce słówka w locie bez zakuwania.'),
    parrot.el,
    whyCard,
    h('div', { class: 'map-list' }, items)
  );

  root.append(view);
  setTimeout(() => {
    parrot.say(
      doneCount === 0
        ? 'A kysz, nudne powtórki! Jestem Papużka Pola 🦜 Pokażę Ci, jak zapamiętywać słówka w ułamku sekundy!'
        : `Brawo! ${doneCount}/${LESSONS.length} lekcji za nami! Lećmy dalej!`,
      'happy'
    );
  }, 200);

  return () => parrot.destroy();
}

export function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const parrot = createParrot({ size: 'md' });
  let answered = false;

  const theoryBox = h('div', { class: 'theory-card' },
    h('h3', {}, '🦜 Papuzie odkrycie: ', les.title),
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '🦜 Podpowiedź Poli');
  hintBtn.addEventListener('click', () => {
    parrot.say(les.task.hint, 'think', { revert: 4000 });
  });

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/words/train', class: 'back' }, '← Mapa szkolenia')),
    h('div', { class: 'step-head' },
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    parrot.el,
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
      parrot.setMood('cheer', 2500);
      parrot.say('Kraaa! Dokładnie tak! Twoja wyobraźnia działa cuda!', 'cheer');

      const prog = store.get('words.train', {});
      prog[les.id] = 3;
      store.set('words.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono kurs! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/words/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/words';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      parrot.setMood('sad', 1800);
      parrot.say(les.task.hint, 'think', { revert: 3500 });
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
    parrot.say(les.speech || `Lekcja ${index + 1}: ${les.subtitle}. Posłuchaj tego słówka!`, 'happy');
  }, 250);

  return () => parrot.destroy();
}
