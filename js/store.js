const KEY = 'swiat-pamieci:v1';
let state = {};
try { state = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { state = {}; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* tryb prywatny */ } };

export const store = {
  get(k, d) { return k in state ? state[k] : d; },
  set(k, v) { state[k] = v; save(); },
  update(k, fn, d) { this.set(k, fn(this.get(k, d))); }
};

const day = (offset = 0) => new Date(Date.now() - offset * 864e5).toLocaleDateString('sv');

/** Dzienna seria: wywołaj, gdy użytkownik zaczyna grać. */
export function touchStreak() {
  const today = day();
  const last = store.get('lastDay', null);
  if (last === today) return store.get('streak', 1);
  const streak = last === day(1) ? store.get('streak', 0) + 1 : 1;
  store.set('streak', streak);
  store.set('lastDay', today);
  return streak;
}

export function currentStreak() {
  const last = store.get('lastDay', null);
  return last === day() || last === day(1) ? store.get('streak', 0) : 0;
}
