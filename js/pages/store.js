import { getState, setState, rupiah, esc, uid, toast } from '../store.js';
import { DEVICES } from '../data/devices.js';
import { STORES, assess, sellable, haggleOutcome } from '../shop/pricing.js';

let tab = 'offers', selected = null, fStore = '';
export default function shop(el, params) {
  const draw = () => {
    const s = getState(), eligible = s.builds.filter(b => b.status === 'done' || b.status === 'tested');
    const q = params?.get('b'); if (q && eligible.find(b => b.id === q)) { selected = q; params.delete('b'); }
    if (!eligible.find(b => b.id === selected)) selected = (eligible.find(sellable) || eligible[0])?.id || null;
    const b = eligible.find(x => x.id === selected);
    el.innerHTML = `<div class="row sp" style="margin-bottom:12px"><div class="tabs" style="margin:0;border:0">
      <button data-tab="offers" class="${tab === 'offers' ? 'on' : ''}">Penawaran</button><button data-tab="history" class="${tab === 'history' ? 'on' : ''}">Riwayat transaksi (${s.sales.length})</button></div>
      <div class="muted small">Saldo: <b style="color:var(--text)">${rupiah(s.balance)}</b></div></div>` + (tab === 'offers' ? offers(b, eligible) : history(s));
    el.querySelectorAll('[data-tab]').forEach(x => x.onclick = () => { tab = x.dataset.tab; draw(); });
    el.querySelector('#pick')?.addEventListener('change', e => { selected = e.target.value; draw(); });
    el.querySelector('#fs')?.addEventListener('change', e => { fStore = e.target.value; draw(); });
    el.querySelectorAll('[data-sell]').forEach(x => x.onclick = () => sell(b, STORES.find(t => t.id === x.dataset.sell)));
    el.querySelectorAll('[data-haggle]').forEach(x => x.onclick = () => haggle(b, STORES.find(t => t.id === x.dataset.haggle)));
  };
  function offers(b, eligible) {
    if (!eligible.length) return '<div class="empty">Belum ada perangkat selesai. Rakit di <a href="#/workshop" style="color:var(--accent)">Workshop</a>, lalu uji di Testing Center.</div>';
    const ok = sellable(b);
    return `<div class="card" style="margin-bottom:16px"><div class="row sp"><div><div class="muted small">Produk yang dijual</div>
      <select id="pick">${eligible.map(x => `<option value="${x.id}" ${x.id === b.id ? 'selected' : ''}>${esc(x.name)} (${DEVICES[x.type].name})${x.status === 'tested' ? '' : ' - belum diuji'}</option>`).join('')}</select></div>
      ${ok ? `<div><div class="muted small">Kualitas</div><b>${b.test.quality}/100 · Grade ${b.test.grade}</b></div>` : '<a class="btn" href="#/testing">Uji dulu di Testing Center</a>'}</div></div>
    ${ok ? `<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">${STORES.map(st => {
      const accepts = st.accepts.includes(b.type);
      if (!accepts) return `<div class="card" style="opacity:.55"><h3>${st.name}</h3><div class="muted small">${st.bio}</div><div class="muted small" style="margin-top:10px">Tidak menerima ${DEVICES[b.type].name}.</div></div>`;
      const a = assess(b, st), h = b.haggle?.[st.id];
      return `<div class="card"><h3>${st.name}</h3><div class="muted small">${st.bio}</div>
        <div style="margin:10px 0">${'★'.repeat(a.stars)}<span class="muted">${'★'.repeat(5 - a.stars)}</span> <span class="muted small">${a.comment}</span></div>
        <div class="stat">${rupiah(a.offer)}</div>
        <details style="margin:8px 0"><summary class="muted small" style="cursor:pointer">Rincian penawaran</summary>${a.parts.map(([l, v, u]) => `<div class="row sp small muted"><span>${l}</span><span>${u ? rupiah(v) : '×' + v.toFixed(2)}</span></div>`).join('')}</details>
        <div class="row"><button class="btn sm" data-sell="${st.id}">Jual</button><button class="btn ghost sm" data-haggle="${st.id}" ${h ? 'disabled' : ''}>${h ? (h.ok ? 'Tawaran dinaikkan' : 'Tawaran diturunkan') : 'Tawar'}</button></div></div>`; }).join('')}</div>` : ''}`;
  }
  function history(s) {
    const list = s.sales.filter(x => !fStore || x.storeId === fStore).slice().reverse(), total = list.reduce((a, x) => a + x.price, 0);
    return `<div class="row sp" style="margin-bottom:12px"><select id="fs"><option value="">Semua toko</option>${STORES.map(t => `<option value="${t.id}" ${fStore === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}</select>
      <span class="muted small">${list.length} transaksi · total ${rupiah(total)}</span></div>` +
      (list.length ? list.map(x => `<div class="slot" style="margin-bottom:6px"><div><b>${esc(x.name)}</b> <span class="muted small">${DEVICES[x.type]?.name || ''} · grade ${x.grade} · ${esc(x.storeName)}</span><div class="muted small">${new Date(x.at).toLocaleString('id-ID')}</div></div><b>${rupiah(x.price)}</b></div>`).join('') : '<div class="empty">Belum ada transaksi.</div>');
  }
  function sell(b, st) {
    if (!sellable(b)) return toast('Perangkat belum lolos pengujian', 'bad');
    const a = assess(b, st); if (!confirm(`Jual ${b.name} ke ${st.name} seharga ${rupiah(a.offer)}?`)) return;
    setState(s => ({ balance: s.balance + a.offer, builds: s.builds.filter(x => x.id !== b.id),
      sales: [...s.sales, { id: uid(), storeId: st.id, storeName: st.name, name: b.name, type: b.type, price: a.offer, quality: b.test.quality, grade: b.test.grade, at: Date.now() }] }));
    toast(`Terjual ${rupiah(a.offer)}`, 'ok'); draw();
  }
  function haggle(b, st) {
    if (b.haggle?.[st.id]) return; const r = haggleOutcome(b, st);
    setState(s => ({ builds: s.builds.map(x => x.id === b.id ? { ...x, haggle: { ...x.haggle, [st.id]: r } } : x) }));
    toast(r.ok ? 'Toko setuju menaikkan tawaran 8%!' : 'Toko menurunkan tawaran 5%.', r.ok ? 'ok' : 'bad'); draw();
  }
  draw();
}
