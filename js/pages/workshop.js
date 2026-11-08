import { getState, setState, isPremium, toast, esc } from '../store.js';
import { DEVICES, SLOT_LABEL } from '../data/devices.js';
import { COMPONENTS } from '../data/components.js';
import { checkInstall, checkRemove, removalOrder, compOf } from '../compat.js';
import { createAssembly } from '../three/assembly3d.js';

export default function workshop(el, _p, id) {
  const cur = () => getState().builds.find(x => x.id === id);
  if (!cur()) {
    const bs = getState().builds;
    el.innerHTML = bs.length ? `<div class="grid">${bs.map(x => `<a class="card" style="text-decoration:none;color:inherit" href="#/workshop/${x.id}"><h3>${esc(x.name)}</h3><div class="muted small">${DEVICES[x.type].name} · ${x.status}</div></a>`).join('')}</div>`
      : '<div class="empty">Belum ada rakitan. <a href="#/devices" style="color:var(--accent)">Pilih perangkat</a> dulu.</div>';
    return;
  }
  let disposed = false, asm = null, selected = null, drag = null, floater = null;
  const open = new Set(['motherboard']);
  const b0 = cur(), total = DEVICES[b0.type].slots.length;
  el.innerHTML = `<div class="row sp" style="margin-bottom:12px"><div><h3 style="margin:0">${esc(b0.name)}</h3><div class="muted small" id="ws-sub"></div></div>
    <div class="row"><button class="btn ghost sm" id="ws-cam">Reset kamera</button><button class="btn danger sm" id="ws-all">Bongkar semua</button><a class="btn ghost sm" href="#/devices">Kembali</a></div></div>
    <div class="bar" style="margin-bottom:12px"><i id="ws-bar"></i></div>
    <div class="ws-body"><div class="ws-canvas" id="ws-cv"><div class="ws-hint">Seret komponen dari daftar ke titik pemasangan yang menyala. Klik komponen terpasang untuk melepasnya. Putar: seret · Zoom: scroll/cubit.</div><div class="ws-load" id="ws-load">Memuat ruang 3D…</div></div>
    <aside class="ws-tray" id="ws-tray"></aside></div>`;
  const $ = s => el.querySelector(s), tray = $('#ws-tray'), cv = $('#ws-cv');

  function refresh() {
    const b = cur(), n = Object.keys(b.slots).length, d = DEVICES[b.type], prem = isPremium();
    $('#ws-sub').textContent = `${d.name} · ${n}/${total} terpasang${b.status === 'done' ? ' · SELESAI, siap diuji di Testing Center' : ''}`;
    $('#ws-bar').style.width = (n / total * 100) + '%';
    const sel = selected && b.slots[selected] ? compOf(b.slots[selected]) : null;
    tray.innerHTML = (sel ? `<div class="card" style="margin-bottom:10px;border-color:var(--accent)"><div class="muted small">Dipilih</div><b>${esc(sel.name)}</b>
      <div class="row" style="margin-top:8px"><button class="btn danger sm" data-rm="${selected}">Lepas</button><button class="btn ghost sm" data-desel>Batal</button></div></div>` : '') +
      d.slots.map(s => {
        const inst = b.slots[s] && compOf(b.slots[s]);
        const items = inst ? '' : COMPONENTS.filter(c => c.type === s && c.devices.includes(b.type)).map(c => {
          const locked = c.tier === 'premium' && !prem, r = checkInstall(b, c, prem);
          return `<div class="chip ${locked ? 'locked' : ''} ${!locked && !r.ok ? 'bad' : ''}" ${locked ? '' : `data-comp="${c.id}"`} title="${esc(locked ? 'Butuh Premium' : r.ok ? 'Seret ke titik pemasangan' : r.reason)}">
          <span>${locked ? '🔒 ' : ''}${esc(c.name)}</span><span class="pill ${c.tier === 'premium' ? 'prem' : ''}">${c.tier}</span></div>`;
        }).join('');
        return `<details data-slot="${s}" ${open.has(s) ? 'open' : ''}><summary><span>${SLOT_LABEL[s]}</span><span class="${inst ? 'ok-txt' : 'muted'}">${inst ? '✓ ' + esc(inst.name) : 'kosong'}</span></summary>
          ${inst ? `<button class="btn danger sm" data-rm="${s}">Lepas</button>` : items}</details>`;
      }).join('');
  }
  function install(comp) {
    const b = cur(), r = checkInstall(b, comp, isPremium());
    if (!r.ok) return toast(r.reason, 'bad');
    setState(st => ({
      builds: st.builds.map(x => { if (x.id !== id) return x; const slots = { ...x.slots, [comp.type]: comp.id }; return { ...x, slots, status: Object.keys(slots).length === total ? 'done' : 'assembling', test: undefined }; }),
      inventory: (() => { const inv = { ...st.inventory }; if (inv[comp.id] > 0) { inv[comp.id]--; if (!inv[comp.id]) delete inv[comp.id]; } return inv; })(),
    }));
    asm?.addPart(comp.type, comp.tier, true); open.delete(comp.type);
    toast(`${comp.name} terpasang`, 'ok'); if (cur().status === 'done') toast('Rakitan selesai!', 'ok'); refresh();
  }
  function remove(slot, quiet) {
    const b = cur(), r = checkRemove(b, slot); if (!r.ok) return toast(r.reason, 'bad');
    const c = compOf(b.slots[slot]); if (!c) return;
    setState(st => ({
      builds: st.builds.map(x => { if (x.id !== id) return x; const slots = { ...x.slots }; delete slots[slot]; return { ...x, slots, status: 'assembling', test: undefined }; }),
      inventory: { ...st.inventory, [c.id]: (st.inventory[c.id] || 0) + 1 },
    }));
    asm?.removePart(slot, true); if (selected === slot) { selected = null; asm?.setSelected(null); }
    if (!quiet) toast(`${c.name} dilepas ke inventory`); refresh();
  }

  // Drag dari daftar komponen
  const move = e => { if (!drag) return; asm.updateDrag(e.clientX, e.clientY); floater.style.left = e.clientX + 12 + 'px'; floater.style.top = e.clientY + 12 + 'px'; };
  const stop = e => {
    if (!drag) return; const { comp, res } = drag; move(e); const r = asm.endDrag(); drag = null; floater.remove(); floater = null;
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', stop); window.removeEventListener('pointercancel', stop);
    if (r.snapped) { res.ok ? install(comp) : toast(res.reason, 'bad'); }
    else if (r.inside) toast('Lepaskan tepat di titik pemasangan yang menyala.');
  };
  tray.addEventListener('pointerdown', e => {
    const chip = e.target.closest('[data-comp]'); if (!chip || !asm || drag) return;
    const comp = compOf(chip.dataset.comp), res = checkInstall(cur(), comp, isPremium());
    if (!asm.beginDrag(comp.type, comp.tier, res)) return;
    e.preventDefault(); drag = { comp, res };
    floater = document.createElement('div'); floater.className = 'floater'; floater.textContent = comp.name; document.body.appendChild(floater);
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', stop); window.addEventListener('pointercancel', stop); move(e);
  });
  tray.addEventListener('click', e => {
    const rm = e.target.closest('[data-rm]'); if (rm) return remove(rm.dataset.rm);
    if (e.target.closest('[data-desel]')) { selected = null; asm?.setSelected(null); refresh(); }
  });
  tray.addEventListener('toggle', e => { const s = e.target.dataset?.slot; if (s) e.target.open ? open.add(s) : open.delete(s); }, true);
  $('#ws-cam').onclick = () => asm?.resetCamera();
  $('#ws-all').onclick = () => {
    const order = removalOrder(cur()); if (!order.length) return toast('Belum ada komponen terpasang');
    if (!confirm('Bongkar semua komponen?')) return;
    order.forEach((s, i) => setTimeout(() => !disposed && cur() && remove(s, true), i * 130));
  };
  refresh();

  (async () => {
    try {
      const THREE = await import('three'), { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
      if (disposed) return;
      asm = createAssembly(THREE, OrbitControls, cv, b0.type);
      asm.onPick = slot => { selected = slot; asm.setSelected(slot); refresh(); };
      asm.load(Object.entries(cur().slots).map(([s, cid]) => [s, compOf(cid)?.tier]));
      $('#ws-load')?.remove();
    } catch (err) {
      console.error(err); const l = $('#ws-load');
      if (l) l.innerHTML = `Ruang 3D gagal dimuat (${esc(err.message)}).<br>Three.js dimuat dari CDN, jadi butuh koneksi internet dan WebGL aktif.`;
    }
  })();

  return () => { // dibersihkan saat pindah halaman
    disposed = true; asm?.dispose(); floater?.remove();
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', stop); window.removeEventListener('pointercancel', stop);
  };
}
