import { h } from '../../dom.js';
import { sfx, buzz } from '../../sound.js';
import { splitGroups } from './util.js';

/** Ekran odpowiedzi: sloty na cyfry + własna klawiatura numeryczna (bez klawiatury systemowej na telefonie). */
export function createRecall({ length, group = 0, onSubmit }) {
  let value = '', locked = false, destroyed = false;

  const slots = [];
  const slotsEl = h('div', { class: 'slots', role: 'group', 'aria-label': `Wpisz ${length} cyfr` },
    splitGroups('x'.repeat(length), group).map(g =>
      h('div', { class: 'slot-group' }, [...g].map(() => { const s = h('span', { class: 'slot' }); slots.push(s); return s; }))));

  const ok = h('button', { class: 'key key-ok', type: 'button', 'aria-label': 'Sprawdź', disabled: true, onclick: send }, '✓');
  const back = h('button', { class: 'key key-fn', type: 'button', 'aria-label': 'Usuń ostatnią cyfrę', onclick: del }, '⌫');
  const digitKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d =>
    h('button', { class: 'key', type: 'button', onclick: () => add(String(d)) }, d));
  const pad = h('div', { class: 'keypad' }, ...digitKeys.slice(0, 9), back, digitKeys[9], ok);
  const el = h('div', { class: 'recall' }, slotsEl, pad);

  function render() {
    slots.forEach((s, i) => {
      const c = value[i];
      s.textContent = c ?? '';
      s.classList.toggle('filled', c != null);
      s.classList.toggle('cur', !locked && i === value.length);
    });
    ok.disabled = locked || value.length !== length;
  }
  function add(d) {
    if (locked || value.length >= length) return;
    value += d; sfx.digit(d); buzz(8); render();
    slots[value.length - 1].animate([{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 160 });
  }
  function del() { if (locked || !value) return; value = value.slice(0, -1); render(); }
  function send() { if (locked || value.length !== length) return; locked = true; render(); onSubmit(value); }

  function onKey(e) {
    if (destroyed || !el.isConnected || locked || e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.querySelector('dialog[open]')) return;
    if (/^[0-9]$/.test(e.key)) { add(e.key); e.preventDefault(); }
    else if (e.key === 'Backspace') { del(); e.preventDefault(); }
    else if (e.key === 'Enter') { send(); e.preventDefault(); }
  }
  addEventListener('keydown', onKey);
  render();

  return {
    el,
    get value() { return value; },
    get typed() { return value.length; },
    lock() { locked = true; render(); },
    /** Pokazuje wyblakłe podpowiedzi na pierwszych `n` miejscach. */
    reveal(n, expected) {
      slots.slice(0, n).forEach((s, i) => { s.dataset.ghost = expected[i]; s.classList.add('ghost'); });
    },
    mark(expected) {
      locked = true; render();
      slots.forEach((s, i) => { s.classList.remove('cur'); s.classList.add(expected[i] === value[i] ? 'ok' : 'bad'); });
    },
    shake() { slotsEl.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(0)' }], { duration: 320 }); },
    destroy() { destroyed = true; removeEventListener('keydown', onKey); }
  };
}
