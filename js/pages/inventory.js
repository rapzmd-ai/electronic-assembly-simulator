import { getState, setState, isPremium, toast, esc } from '../store.js';
import { COMPONENTS } from '../data/components.js';
import { DEVICES, SLOT_LABEL } from '../data/devices.js';
let tab = 'catalog', fDev = '', fType = '', fTier = '';
export default function inventory(el) {
  const s = getState(), tabs = [['catalog', 'Katalog komponen'], ['owned', 'Komponen saya'], ['assembling', 'Sedang dirakit'], ['done', 'Selesai'], ['tested', 'Teruji']];
  let body = '';
  if (tab === 'catalog') {
    const list = COMPONENTS.filter(c => (!fDev || c.devices.includes(fDev)) && (!fType || c.type === fType) && (!fTier || c.tier === fTier));
    const types = [...new Set(COMPONENTS.map(c => c.type))];
    body = `<div class="row" style="margin-bottom:14px"><select id="fd"><option value="">Semua perangkat</option>${Object.entries(DEVICES).map(([k, d]) => `<option value="${k}" ${fDev === k ? 'selected' : ''}>${d.name}</option>`).join('')}</select>
    <select id="ft"><option value="">Semua jenis</option>${types.map(t => `<option value="${t}" ${fType === t ? 'selected' : ''}>${SLOT_LABEL[t]}</option>`).join('')}</select>
    <select id="fr"><option value="">Free + Premium</option><option value="free" ${fTier === 'free' ? 'selected' : ''}>Free</option><option value="premium" ${fTier === 'premium' ? 'selected' : ''}>Premium</option></select>
    <span class="muted small">${list.length} komponen</span></div>
    <div class="grid">${list.map(c => { const locked = c.tier === 'premium' && !isPremium();
      return `<div class="card"><div class="row sp"><span class="muted small">${SLOT_LABEL[c.type]}</span><span class="pill ${c.tier === 'premium' ? 'prem' : 'ok'}">${c.tier}</span></div>
      <h3 style="margin-top:6px">${c.name}</h3><div class="spec">${Object.entries(c.specs).map(([k, v]) => `<span>${k}: ${v}</span>`).join('')}</div>
      ${locked ? `<a class="btn ghost sm" href="#/premium">🔒 Butuh Premium</a>` : `<button class="btn sm" data-take="${c.id}">Ambil (gratis)</button>`}
      ${s.inventory[c.id] ? `<span class="muted small"> · dimiliki ${s.inventory[c.id]}</span>` : ''}</div>`; }).join('')}</div>`;
  } else if (tab === 'owned') {
    const items = COMPONENTS.filter(c => s.inventory[c.id]);
    body = items.length ? `<div class="grid">${items.map(c => `<div class="card"><h3>${c.name}</h3><div class="muted small">${SLOT_LABEL[c.type]} · jumlah ${s.inventory[c.id]}</div>
      <button class="btn danger sm" data-drop="${c.id}" style="margin-top:10px">Buang 1</button></div>`).join('')}</div>` : '<div class="empty">Belum ada komponen. Ambil dari Katalog.</div>';
  } else {
    const st = tab === 'assembling' ? ['assembling'] : tab === 'done' ? ['done', 'tested', 'sold'] : ['tested'];
    const bs = s.builds.filter(b => st.includes(b.status));
    body = bs.length ? `<div class="grid">${bs.map(b => `<a class="card" style="text-decoration:none;color:inherit" href="#/workshop/${b.id}"><h3>${esc(b.name)}</h3><div class="muted small">${DEVICES[b.type].name} · ${b.status}</div></a>`).join('')}</div>` : '<div class="empty">Tidak ada perangkat di kategori ini.</div>';
  }
  el.innerHTML = `<div class="tabs">${tabs.map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div>${body}`;
  el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; inventory(el); });
  const bind = (id, f) => { const e = el.querySelector(id); if (e) e.onchange = () => { f(e.value); inventory(el); }; };
  bind('#fd', v => fDev = v); bind('#ft', v => fType = v); bind('#fr', v => fTier = v);
  el.querySelectorAll('[data-take]').forEach(b => b.onclick = () => {
    const c = COMPONENTS.find(x => x.id === b.dataset.take);
    if (c.tier === 'premium' && !isPremium()) return toast('Komponen Premium terkunci', 'bad');
    setState(st => ({ inventory: { ...st.inventory, [c.id]: (st.inventory[c.id] || 0) + 1 } })); toast(c.name + ' ditambahkan', 'ok'); inventory(el);
  });
  el.querySelectorAll('[data-drop]').forEach(b => b.onclick = () => {
    setState(st => { const inv = { ...st.inventory }; inv[b.dataset.drop]--; if (inv[b.dataset.drop] <= 0) delete inv[b.dataset.drop]; return { inventory: inv }; }); inventory(el);
  });
}
