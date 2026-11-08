import { getState, esc } from '../store.js';
import { DEVICES, SLOT_LABEL } from '../data/devices.js';
export default function workshop(el, _p, id) {
  const b = getState().builds.find(x => x.id === id);
  if (!b) { const bs = getState().builds;
    el.innerHTML = bs.length ? `<div class="grid">${bs.map(x => `<a class="card" style="text-decoration:none;color:inherit" href="#/workshop/${x.id}"><h3>${esc(x.name)}</h3><div class="muted small">${DEVICES[x.type].name}</div></a>`).join('')}</div>`
      : '<div class="empty">Belum ada rakitan. <a href="#/devices" style="color:var(--accent)">Pilih perangkat</a> dulu.</div>'; return; }
  const d = DEVICES[b.type], f = Object.keys(b.slots).length;
  el.innerHTML = `<div class="row sp"><div><h3 style="margin:0">${esc(b.name)}</h3><div class="muted small">${d.name} · ${f}/${d.slots.length} terpasang</div></div><a class="btn ghost sm" href="#/devices">Kembali</a></div>
  <div class="bar" style="margin:12px 0 18px"><i style="width:${f / d.slots.length * 100}%"></i></div>
  <div class="card" style="margin-bottom:16px"><b>Ruang kerja 3D: Fase 2.</b><div class="muted small">Ruang 3D, drag-and-drop, titik pemasangan, dan pengecekan kompatibilitas dibangun di Fase 2 (butuh Three.js). Daftar slot di bawah adalah struktur yang akan dipakai.</div></div>
  <div class="grid">${d.slots.map(s => `<div class="slot"><span>${SLOT_LABEL[s]}</span><span class="muted">${b.slots[s] ? 'terpasang' : 'kosong'}</span></div>`).join('')}</div>`;
}
