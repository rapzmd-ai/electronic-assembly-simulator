// Store sederhana bergaya Zustand + persistensi localStorage
const KEY = 'eas-state-v1';
const DEFAULT = {
  balance: 10_000_000, premiumUntil: 0, inventory: {}, builds: [], sales: [],
  profile: { name: 'Perakit', joined: Date.now() }, settings: { compact: false, accent: '#3b82f6', quality: 'high' }, premiumLog: [], premiumNotified: true,
};
let state = load();
const subs = new Set();
function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); return s ? { ...DEFAULT, ...s, profile:{...DEFAULT.profile,...s.profile}, settings:{...DEFAULT.settings,...s.settings} } : structuredClone(DEFAULT); }
  catch { return structuredClone(DEFAULT); }
}
export const getState = () => state;
export function setState(patch) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  subs.forEach(f => f(state));
}
export const subscribe = f => (subs.add(f), () => subs.delete(f));
export const isPremium = () => state.premiumUntil > Date.now();
export const resetAll = () => { localStorage.removeItem(KEY); state = structuredClone(DEFAULT); subs.forEach(f => f(state)); };
export const uid = () => Math.random().toString(36).slice(2, 9);
export const rupiah = n => 'Rp' + Math.round(n).toLocaleString('id-ID');
export const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function toast(msg, kind = 'info') {
  const el = document.createElement('div'); el.className = 'toast ' + kind; el.textContent = msg;
  document.getElementById('toasts').appendChild(el); setTimeout(() => el.remove(), 3000);
}
export const exportData = () => JSON.stringify(state, null, 1);
export function importData(text) {
  const d = JSON.parse(text);
  if (typeof d !== 'object' || !Array.isArray(d.builds) || typeof d.balance !== 'number') throw new Error('Format file tidak valid');
  state = { ...structuredClone(DEFAULT), ...d, profile: { ...DEFAULT.profile, ...d.profile }, settings: { ...DEFAULT.settings, ...d.settings } };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  subs.forEach(f => f(state));
}
