import { getState, rupiah, isPremium, esc } from '../store.js';
import { DEVICES } from '../data/devices.js';
export default function dashboard(el) {
  const s = getState(), parts = Object.values(s.inventory).reduce((a, b) => a + b, 0);
  const done = s.builds.filter(b => b.status !== 'assembling').length;
  el.innerHTML = `<div class="grid">
    <div class="card"><div class="muted small">Saldo virtual</div><div class="stat">${rupiah(s.balance)}</div></div>
    <div class="card"><div class="muted small">Komponen di inventory</div><div class="stat">${parts}</div></div>
    <div class="card"><div class="muted small">Perangkat dirakit / selesai</div><div class="stat">${s.builds.length - done} / ${done}</div></div>
    <div class="card"><div class="muted small">Status Premium</div><div class="stat">${isPremium() ? 'Aktif' : 'Free'}</div>
      <a class="btn ghost sm" href="#/premium">Kelola</a></div></div>
  <h2>Mulai merakit</h2><div class="grid">${Object.entries(DEVICES).map(([k, d]) =>
    `<a class="card" style="text-decoration:none;color:inherit" href="#/devices?new=${k}"><h3>${d.icon} ${d.name}</h3><div class="muted small">${d.desc}</div></a>`).join('')}</div>
  <h2>Rakitan terbaru</h2>${s.builds.length ? `<div class="grid">${s.builds.slice(-4).reverse().map(b => {
    const n = DEVICES[b.type].slots.length, f = Object.keys(b.slots).length;
    return `<a class="card" style="text-decoration:none;color:inherit" href="#/workshop/${b.id}"><h3>${esc(b.name)}</h3><div class="muted small">${DEVICES[b.type].name} · ${f}/${n} komponen</div><div class="bar" style="margin-top:10px"><i style="width:${f / n * 100}%"></i></div></a>`;
  }).join('')}</div>` : `<div class="empty">Belum ada rakitan. <a href="#/devices" style="color:var(--accent)">Pilih perangkat</a> untuk memulai.</div>`}`;
}
