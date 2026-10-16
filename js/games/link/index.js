import { h } from '../../dom.js';
import { createSquirrel } from '../../squirrel.js';
import { store } from '../../store.js';
import { LESSONS } from './lessons.js';
import { MODES } from './modes.js';
import { mountMap, mountStep } from './train.js';
import { mountFree } from './free.js';

function mountMenu(root, { nav }) {
  const squirrel = createSquirrel({ size: 'md' });
  const prog = store.get('link.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/link/train' : `#/link/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🐿️ Szkolenie z Wiewiórką Basią'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę łańcucha' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
        h('p', {}, `${LESSONS.length} lekcji · efekt domina · lista zakupów bez kartki · spacer w tył`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/link/train' }, 'Zobacz mapę lekcji skojarzeń →');

  const modeCards = MODES.map(m => {
    const best = store.get(`link.best.${m.id}`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/link/free/${m.id}`,
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
        h('h1', {}, '🐿️ ', h('span', { class: 'grad' }, 'Łańcuch skojarzeń')),
        h('p', { class: 'lead' }, 'Łącz myśli jak kostki domina. Zapamiętuj listy zakupów, przemówienia i procedury bez kartki papieru.')
      )
    ),
    squirrel.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Chrup! Jestem Wiewiórka Basia 🐿️ Zbudujemy razem łańcuch myśli, który nigdy się nie zerwie!'
    : done < LESSONS.length
      ? `Mamy ${done} z ${LESSONS.length} lekcji! Dokończmy spiżarnię skojarzeń!`
      : 'Opanowałeś metodę łańcuchową po mistrzowsku! Wybierz tryb gry swobodnej! 🏆';

  setTimeout(() => { squirrel.say(greet, 'happy'); }, 300);
  return () => squirrel.destroy();
}

export default {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};
