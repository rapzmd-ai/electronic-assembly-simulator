import { getState, subscribe, rupiah, isPremium } from './store.js';
import dashboard from './pages/dashboard.js';
import devices from './pages/devices.js';
import inventory from './pages/inventory.js';
import workshop from './pages/workshop.js';
import products from './pages/products.js';
import premium from './pages/premium.js';
import profile from './pages/profile.js';
import settings, { applySettings } from './pages/settings.js';
import phase from './pages/phase.js';
const ROUTES = [
  ['', 'Dashboard', '◧', dashboard], ['devices', 'Device Selection', '▣', devices], ['inventory', 'Component Inventory', '▤', inventory],
  ['workshop', '3D Assembly Workshop', '⬡', workshop],
  ['testing', 'Testing Center', '◎', phase('Testing Center', 'Fase 3', ['Power On, BIOS, Boot', 'Suhu & benchmark CPU/GPU', 'Tes RAM, storage, display, baterai'])],
  ['store', 'Electronics Store', '◈', phase('Electronics Store', 'Fase 4', ['Smartphone / Computer / Laptop / Electronics Store', 'Penawaran harga & penilaian', 'Riwayat transaksi'])],
  ['products', 'My Products', '▥', products], ['premium', 'Premium Membership', '★', premium], ['profile', 'Profile', '◉', profile], ['settings', 'Settings', '⚙', settings],
];
const view = document.getElementById('view'), nav = document.getElementById('nav'), sb = document.getElementById('sidebar'), scrim = document.getElementById('scrim');
nav.innerHTML = ROUTES.map(r => `<a href="#/${r[0]}" data-r="${r[0]}"><i>${r[2]}</i>${r[1]}</a>`).join('');
let cleanup = null;
function render() {
  if (typeof cleanup === 'function') { try { cleanup(); } catch (e) { console.error(e); } } cleanup = null;
  const [path, ...rest] = location.hash.replace(/^#\/?/, '').split('?')[0].split('/');
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const r = ROUTES.find(x => x[0] === path) || ROUTES[0];
  document.getElementById('title').textContent = r[1];
  nav.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.dataset.r === r[0]));
  try { const out = r[3](view, params, rest[0]); if (typeof out === 'function') cleanup = out; } catch (e) { view.innerHTML = `<div class="empty">Terjadi error: ${e.message}</div>`; console.error(e); }
  sb.classList.remove('open'); scrim.classList.remove('on');
}
function side() { document.getElementById('side-balance').textContent = rupiah(getState().balance);
  const p = document.getElementById('side-prem'); p.textContent = isPremium() ? 'Premium' : 'Free'; p.className = 'pill ' + (isPremium() ? 'prem' : ''); }
document.getElementById('menu').onclick = () => { sb.classList.toggle('open'); scrim.classList.toggle('on'); };
scrim.onclick = () => { sb.classList.remove('open'); scrim.classList.remove('on'); };
subscribe(side); window.addEventListener('hashchange', render); applySettings(); side(); render();
