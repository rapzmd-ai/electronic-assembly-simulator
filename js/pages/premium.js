import { getState, setState, isPremium, rupiah, toast } from '../store.js';
import { COMPONENTS } from '../data/components.js';
import { SLOT_LABEL } from '../data/devices.js';
const PRICE = 50000, DAY = 86400000;
export default function premium(el) {
  const s = getState(), on = isPremium(), days = Math.ceil((s.premiumUntil - Date.now()) / DAY);
  const prem = COMPONENTS.filter(c => c.tier === 'premium'), types = [...new Set(prem.map(c => c.type))];
  el.innerHTML = `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))"><div class="card"><div class="row sp"><h3>Premium</h3><span class="pill ${on ? 'ok' : ''}">${on ? `aktif · ${days} hari lagi` : s.premiumUntil ? 'sudah berakhir' : 'tidak aktif'}</span></div>
    <div class="stat">${rupiah(PRICE)}<span class="muted small"> / 30 hari</span></div>
    <ul class="muted"><li>Satu langganan membuka semua kategori perangkat</li><li>${prem.length} komponen eksklusif: CPU/GPU flagship, RAM besar, SSD pro, workstation</li><li>Fitur dasar tetap gratis</li><li>Rakitan yang sudah selesai tetap tersimpan jika Premium berakhir; komponen Premium hanya terkunci untuk rakitan baru</li></ul>
    <div class="row"><button class="btn" id="buy">${on ? 'Perpanjang 30 hari' : 'Berlangganan'}</button>${on ? '<button class="btn danger" id="cx">Batalkan</button>' : ''}</div>
    <div class="muted small" style="margin-top:10px">Mode simulasi: dibayar dari saldo virtual (${rupiah(s.balance)}). Tidak ada pembayaran sungguhan.</div></div>
    <div class="card"><h3>Yang terbuka dengan Premium</h3><div class="muted small" style="margin-bottom:8px">${prem.length} komponen di ${types.length} kategori</div>
    ${types.map(t => `<div class="small" style="margin-bottom:4px"><span class="muted">${SLOT_LABEL[t]}:</span> ${[...new Set(prem.filter(c => c.type === t).map(c => c.name))].slice(0, 3).join(', ')}</div>`).join('')}</div></div>
  <h2>Riwayat langganan</h2>${s.premiumLog.length ? s.premiumLog.slice().reverse().map(x => `<div class="slot" style="margin-bottom:6px"><span>${new Date(x.at).toLocaleString('id-ID')} · ${x.type}</span><span>${x.price ? rupiah(x.price) : '-'}</span></div>`).join('') : '<div class="empty">Belum ada riwayat.</div>'}`;
  el.querySelector('#buy').onclick = () => {
    if (getState().balance < PRICE) return toast('Saldo virtual tidak cukup', 'bad');
    setState(st => ({ balance: st.balance - PRICE, premiumUntil: Math.max(Date.now(), st.premiumUntil) + 30 * DAY, premiumNotified: true, premiumLog: [...st.premiumLog, { at: Date.now(), price: PRICE, type: isPremium() ? 'Perpanjang' : 'Langganan' }] }));
    toast('Premium aktif (simulasi)', 'ok'); premium(el);
  };
  el.querySelector('#cx')?.addEventListener('click', () => {
    if (!confirm('Batalkan Premium sekarang? Sisa hari hangus, tanpa pengembalian saldo.')) return;
    setState(st => ({ premiumUntil: 0, premiumNotified: true, premiumLog: [...st.premiumLog, { at: Date.now(), price: 0, type: 'Dibatalkan' }] })); toast('Premium dibatalkan'); premium(el);
  });
}
