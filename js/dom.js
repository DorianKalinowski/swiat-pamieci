export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(kid));
  }
  return el;
}

export const $ = (s, r = document) => r.querySelector(s);
export const rand = arr => arr[Math.floor(Math.random() * arr.length)];

/** Czeka `ms`; zwraca false, jeśli przerwano sygnałem (wtedy kod ma przestać działać). */
export function sleep(ms, signal) {
  return new Promise(res => {
    if (signal?.aborted) return res(false);
    const t = setTimeout(() => res(true), ms);
    signal?.addEventListener('abort', () => { clearTimeout(t); res(false); }, { once: true });
  });
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
