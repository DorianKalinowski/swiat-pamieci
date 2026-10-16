/** Dzieli ciąg cyfr na grupy: liczba (stały rozmiar) lub tablica rozmiarów. */
export function splitGroups(str, group = 0) {
  if (!group) return [str];
  const out = [];
  let i = 0;
  if (Array.isArray(group)) {
    for (const g of group) { if (i >= str.length) break; out.push(str.slice(i, i + g)); i += g; }
    if (i < str.length) out.push(str.slice(i));
    return out;
  }
  for (; i < str.length; i += group) out.push(str.slice(i, i + group));
  return out;
}

/** Ładne grupy po 3: 7 → 3+4, 8 → 3+3+2, 10 → 3+3+4. */
export function smartGroups(len, size = 3) {
  if (len <= size + 1) return [len];
  const groups = Array(Math.floor(len / size)).fill(size);
  const r = len % size;
  if (r === 1) groups[groups.length - 1] += 1; else if (r > 1) groups.push(r);
  return groups;
}

export function randomDigits(n) {
  let s = '';
  for (let i = 0; i < n; i++) {
    let d;
    do { d = Math.floor(Math.random() * 10); }
    while (s.length >= 2 && s.at(-1) === String(d) && s.at(-2) === String(d)); // bez „777”
    s += d;
  }
  return s;
}

export const reverse = s => [...s].reverse().join('');

/** Porównanie: oczekiwane vs wpisane, z oznaczeniem błędów. */
import { h } from '../../dom.js';
export function compareView(expected, value, group = 0) {
  const row = (label, str, mark) => h('div', { class: 'cmp-row' },
    h('span', { class: 'cmp-label' }, label),
    h('div', { class: 'cmp-digits' }, splitGroups(str, group).map((g, gi) => {
      const offset = splitGroups(str, group).slice(0, gi).join('').length;
      return h('span', { class: 'cmp-group' }, [...g].map((d, i) => {
        const ok = expected[offset + i] === d;
        return h('span', { class: mark ? (ok ? 'ok' : 'bad') : 'plain' }, d);
      }));
    })));
  return h('div', { class: 'compare' }, row('Poprawnie', expected, false), row('Ty', value, true));
}

export const starsEl = (n, total = 3) =>
  h('div', { class: 'stars', 'aria-label': `${n} z ${total} gwiazdek` },
    Array.from({ length: total }, (_, i) => h('span', { class: i < n ? 'on' : '', style: `--i:${i}` }, '★')));
