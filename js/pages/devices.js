import { getState, setState, uid, esc, toast } from '../store.js';
import { DEVICES } from '../data/devices.js';
export default function devices(el, params) {
  const s = getState(), pre = params.get('new');
  el.innerHTML = `<div class="grid">${Object.entries(DEVICES).map(([k, d]) => `<div class="card">
    <h3>${d.icon} ${d.name}</h3><div class="muted small">${d.desc}</div><div class="spec">${d.slots.length} slot</div>
    <button class="btn" data-new="${k}">Mulai rakit</button></div>`).join('')}</div>
  <h2>Rakitan saya</h2>${s.builds.length ? `<div class="grid">${s.builds.map(b => `<div class="card"><h3>${esc(b.name)}</h3>
    <div class="muted small">${DEVICES[b.type].name} · ${b.status}</div><div class="row" style="margin-top:12px">
    <a class="btn sm" href="#/workshop/${b.id}">Buka</a><button class="btn danger sm" data-del="${b.id}">Hapus</button></div></div>`).join('')}</div>`
    : '<div class="empty">Belum ada rakitan.</div>'}`;
  const create = k => {
    const name = prompt(`Nama ${DEVICES[k].name} baru:`, `${DEVICES[k].name} #${getState().builds.length + 1}`);
    if (!name || !name.trim()) return;
    const id = uid();
    setState(st => ({ builds: [...st.builds, { id, type: k, name: name.trim().slice(0, 40), slots: {}, status: 'assembling', created: Date.now() }] }));
    toast('Rakitan dibuat', 'ok'); location.hash = '#/workshop/' + id;
  };
  el.querySelectorAll('[data-new]').forEach(b => b.onclick = () => create(b.dataset.new));
  el.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    if (confirm('Hapus rakitan ini?')) { setState(st => ({ builds: st.builds.filter(x => x.id !== b.dataset.del) })); toast('Dihapus'); }
  });
  if (pre && DEVICES[pre]) { history.replaceState(null, '', '#/devices'); setTimeout(() => create(pre), 50); }
}
