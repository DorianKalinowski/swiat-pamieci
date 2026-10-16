import { h } from '../../dom.js';
import { sfx } from '../../sound.js';
import { splitGroups } from './util.js';

export const SHAPE_PEGS = {
  '0': { emoji: '🥚', name: 'Jajko' },
  '1': { emoji: '🕯️', name: 'Świeca' },
  '2': { emoji: '🦢', name: 'Łabędź' },
  '3': { emoji: '❤️', name: 'Serce' },
  '4': { emoji: '⛵', name: 'Żaglówka' },
  '5': { emoji: '🪝', name: 'Hak' },
  '6': { emoji: '🐌', name: 'Ślimak' },
  '7': { emoji: '🪓', name: 'Kosa' },
  '8': { emoji: '☃️', name: 'Bałwan' },
  '9': { emoji: '🎈', name: 'Balon' }
};

const VOWELS = 'aeiouyąęóAEIOUYĄĘÓ';

/**
 * Pokazuje cyfry do zapamiętania.
 * mode 'all' – wszystkie naraz z paskiem czasu; 'seq' – po jednej; `cards` – obrazki (system Major); `showShapes` – kształty cyfr.
 * Zwraca Promise z powodem zakończenia: 'time' | 'skip' | 'done' | 'abort'.
 */
export function present(host, { digits, mode = 'all', group = 0, time = 4000, interval = 700, cards = null, showShapes = false, signal, label } = {}) {
  return new Promise(resolve => {
    const timers = new Set();
    let finished = false;
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    const end = why => { if (finished) return; finished = true; timers.forEach(clearTimeout); resolve(why); };
    signal?.addEventListener('abort', () => end('abort'), { once: true });

    const wrap = h('div', { class: 'present' });
    host.replaceChildren(wrap);
    if (label) wrap.append(h('div', { class: 'present-label' }, label));

    if (mode === 'seq') {
      const big = h('div', { class: 'seq-digit', 'aria-hidden': 'true' });
      const shapeHint = h('div', { class: 'seq-shape', 'aria-hidden': 'true' });
      const dots = h('div', { class: 'seq-dots' }, [...digits].map(() => h('i')));
      wrap.append(big, showShapes ? shapeHint : null, dots, h('div', { class: 'sr-only', 'aria-live': 'polite' }, `Cyfry: ${[...digits].join(', ')}`));
      let step = 0, c = 0;
      const pop = () => { big.classList.remove('pop'); void big.offsetWidth; big.classList.add('pop'); };
      const showNext = () => {
        if (step >= digits.length) return later(() => end('done'), 300);
        big.className = 'seq-digit';
        const d = digits[step];
        big.textContent = d;
        if (showShapes && SHAPE_PEGS[d]) {
          shapeHint.textContent = `${SHAPE_PEGS[d].emoji} ${SHAPE_PEGS[d].name}`;
        }
        pop();
        dots.children[step].classList.add('on');
        sfx.digit(d);
        step++;
        later(() => {
          big.textContent = '';
          if (showShapes) shapeHint.textContent = '';
          later(showNext, 130);
        }, interval - 130);
      };
      const countdown = () => {
        if (c < 3) {
          big.className = 'seq-digit count';
          big.textContent = 3 - c;
          pop(); sfx.tick(); c++;
          later(countdown, 520);
        } else { big.textContent = ''; later(showNext, 220); }
      };
      countdown();
      return;
    }

    let n = 0;
    const body = cards
      ? h('div', { class: 'cards' }, cards.map((c, i) =>
          h('div', { class: 'mcard', style: `--i:${i}` },
            h('div', { class: 'mcard-num' }, c.d),
            h('div', { class: 'mcard-emoji' }, c.emoji),
            h('div', { class: 'mcard-word' }, [...c.word].map(ch => h('span', { class: VOWELS.includes(ch) ? 'v' : 'c' }, ch))))))
      : h('div', { class: `digit-groups${showShapes ? ' with-shapes' : ''}`, 'aria-label': [...digits].join(' ') },
          splitGroups(digits, group).map(g =>
            h('div', { class: 'digit-group' }, [...g].map(d => {
              const peg = showShapes && SHAPE_PEGS[d];
              return h('div', { class: 'digit-box', style: `--i:${n++}` },
                h('span', { class: 'digit' }, d),
                peg ? h('span', { class: 'digit-peg', title: peg.name }, peg.emoji) : null
              );
            }))));

    const bar = h('i');
    wrap.append(
      body,
      h('div', { class: 'timebar', role: 'presentation' }, bar),
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => end('skip') }, 'Już pamiętam ✓')
    );
    requestAnimationFrame(() => requestAnimationFrame(() => {
      bar.style.transition = `transform ${time}ms linear`;
      bar.style.transform = 'scaleX(0)';
    }));
    later(() => end('time'), time);
  });
}
