import { getState, esc, rupiah } from '../store.js';
import { DEVICES } from '../data/devices.js';
export default function products(el) {
  const s = getState(), bs = s.builds.filter(b => b.status !== 'assembling');
  el.innerHTML = (bs.length ? `<div class="grid">${bs.map(b => `<div class="card"><h3>${esc(b.name)}</h3><div class="muted small">${DEVICES[b.type].name} · ${b.status}</div></div>`).join('')}</div>` : '<div class="empty">Belum ada produk selesai.</div>')
    + `<h2>Riwayat penjualan</h2>` + (s.sales.length ? s.sales.map(x => `<div class="slot">${esc(x.name)}<span>${rupiah(x.price)}</span></div>`).join('') : '<div class="empty">Belum ada penjualan.</div>');
}
