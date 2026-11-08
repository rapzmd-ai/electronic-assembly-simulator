import { getState, setState, esc, rupiah, toast } from '../store.js';
import { DEVICES } from '../data/devices.js';
import { compOf } from '../compat.js';
import { sellable, specValue } from '../shop/pricing.js';
const ST = { assembling: 'Dirakit', done: 'Selesai, belum diuji', tested: 'Teruji' };
export default function products(el) {
  const draw = () => {
    const s = getState();
    el.innerHTML = `<div class="grid">${s.builds.map(b => { const n = Object.keys(b.slots).length, tot = DEVICES[b.type].slots.length, t = b.test;
      return `<div class="card"><div class="row sp"><h3>${esc(b.name)}</h3><span class="pill ${b.status === 'tested' ? 'ok' : ''}">${ST[b.status]}</span></div>
      <div class="muted small">${DEVICES[b.type].name} · ${n}/${tot} komponen</div>
      ${t?.quality !== undefined ? `<div style="margin:8px 0"><b>${t.quality}/100 · Grade ${t.grade}</b> <span class="muted small">nilai komponen ${rupiah(specValue(b))}</span></div>` : ''}
      <div class="spec">${Object.values(b.slots).slice(0, 6).map(id => `<span>${esc(compOf(id)?.name || '?')}</span>`).join('')}${n > 6 ? `<span>+${n - 6}</span>` : ''}</div>
      <div class="row" style="margin-top:10px"><a class="btn ghost sm" href="#/workshop/${b.id}">Workshop</a>${b.status !== 'assembling' ? `<a class="btn ghost sm" href="#/testing">Uji</a>` : ''}
      ${sellable(b) ? `<a class="btn sm" href="#/store?b=${b.id}">Jual</a>` : ''}<button class="btn danger sm" data-del="${b.id}">Hapus</button></div></div>`; }).join('') || '<div class="empty" style="grid-column:1/-1">Belum ada produk. Mulai dari <a href="#/devices" style="color:var(--accent)">Device Selection</a>.</div>'}</div>
    <h2>Riwayat penjualan terakhir</h2>${s.sales.length ? s.sales.slice(-5).reverse().map(x => `<div class="slot" style="margin-bottom:6px"><span>${esc(x.name)} <span class="muted small">· ${esc(x.storeName)}</span></span><b>${rupiah(x.price)}</b></div>`).join('') + '<a class="btn ghost sm" href="#/store" style="margin-top:8px">Semua transaksi</a>' : '<div class="empty">Belum ada penjualan.</div>'}`;
    el.querySelectorAll('[data-del]').forEach(x => x.onclick = () => { if (confirm('Hapus produk ini?')) { setState(st => ({ builds: st.builds.filter(b => b.id !== x.dataset.del) })); toast('Dihapus'); draw(); } });
  };
  draw();
}
