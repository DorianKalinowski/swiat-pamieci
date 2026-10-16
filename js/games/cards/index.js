import { h } from '../../dom.js';
import { createRaccoon } from '../../raccoon.js';
import { store } from '../../store.js';
import { LESSONS } from './lessons.js';
import { MODES } from './modes.js';
import { mountMap, mountStep } from './train.js';
import { mountFree } from './free.js';

function mountMenu(root, { nav }) {
  const raccoon = createRaccoon({ size: 'md' });
  const prog = store.get('cards.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/cards/train' : `#/cards/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🦝 Szkoła Magii Szopa Magika'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę kart' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
        h('p', {}, `${LESSONS.length} lekcji · żywioły talii · metoda PAO · zapamiętywanie rozdań`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/cards/train' }, 'Zobacz mapę lekcji magii →');

  const modeCards = MODES.map(m => {
    const best = store.get(`cards.best.${m.id}`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/cards/free/${m.id}`,
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
        h('h1', {}, '🦝 ', h('span', { class: 'grad' }, 'Karty do gry')),
        h('p', { class: 'lead' }, 'Cała talia 52 kart w głowie! Poznaj system PAO stosowany przez mistrzów iluzji i pamięci.')
      )
    ),
    raccoon.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Tadaam! Jestem Szop Magik 🦝 Pokażę Ci, jak zapamiętać dowolny układ kart!'
    : done < LESSONS.length
      ? `Masz za sobą ${done} z ${LESSONS.length} lekcji. Dokończmy szkolenie iluzji!`
      : 'Twoja pamięć kart jest magiczna! Czas na grę swobodną! 🏆';

  setTimeout(() => { raccoon.say(greet, 'happy'); }, 300);
  return () => raccoon.destroy();
}

export default {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};
