import { h } from '../../dom.js';
import { createFox } from '../../fox.js';
import { store } from '../../store.js';
import { LESSONS } from './lessons.js';
import { MODES } from './modes.js';
import { mountMap, mountStep } from './train.js';
import { mountFree } from './free.js';

function mountMenu(root, { nav }) {
  const fox = createFox({ size: 'md' });
  const prog = store.get('names.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/names/train' : `#/names/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🦊 Szkolenie z Liskiem Bystrzakiem'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę twarzy' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
        h('p', {}, `${LESSONS.length} interaktywnych lekcji · kotwice cech · mosty fonetyczne`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/names/train' }, 'Zobacz mapę lekcji →');

  const modeCards = MODES.map(m => {
    const best = store.get(`names.best.${m.id}`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/names/free/${m.id}`,
      style: `--c1:${m.color[0]};--c2:${m.color[1]}`
    },
      h('div', { class: 'mc-emoji' }, m.emoji),
      h('div', { class: 'mc-body' },
        h('h3', {}, m.name),
        h('p', {}, m.desc)
      ),
      h('div', { class: 'mc-best' },
        h('b', {}, best ? `${best}` : '–'),
        h('span', {}, best ? 'rekord' : 'brak')
      )
    );
  });

  const view = h('section', { class: 'screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
    h('div', { class: 'game-head' },
      h('div', {},
        h('h1', {}, '🦊 ', h('span', { class: 'grad' }, 'Imiona i twarze')),
        h('p', { class: 'lead' }, 'Nigdy więcej „znam tę twarz, ale jak on miał na imię?”. Opanuj technikę kotwic i mostów fonetycznych.')
      )
    ),
    fox.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Hau! Jestem Lisek Bystrzak 🦊 Każda twarz ma w sobie sekret. Nauczę Cię go czytać!'
    : done < LESSONS.length
      ? `Mamy opanowane ${done} z ${LESSONS.length} lekcji. Dokończmy szkolenie! 🦊`
      : 'Twoja pamięć twarzy jest bystra jak lis! Wybierz tryb gry swobodnej! 🏆';

  setTimeout(() => { fox.say(greet, 'happy'); }, 300);
  return () => fox.destroy();
}

export default {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};
