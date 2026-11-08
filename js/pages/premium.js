import { getState, setState, isPremium, rupiah, toast } from '../store.js';
const PRICE = 50000, DAY = 86400000;
export default function premium(el) {
  const s = getState(), on = isPremium(), days = Math.ceil((s.premiumUntil - Date.now()) / DAY);
  el.innerHTML = `<div class="card" style="max-width:520px"><div class="row sp"><h3>Premium</h3><span class="pill ${on ? 'ok' : ''}">${on ? `aktif · ${days} hari lagi` : 'tidak aktif'}</span></div>
  <div class="stat">${rupiah(PRICE)}<span class="muted small"> / 30 hari</span></div>
  <ul class="muted"><li>Satu langganan membuka semua kategori perangkat</li><li>CPU/GPU flagship, RAM besar, SSD pro, komponen workstation</li><li>Fitur dasar tetap gratis; rakitan selesai tetap tersimpan jika Premium berakhir</li></ul>
  <button class="btn" id="buy">${on ? 'Perpanjang 30 hari' : 'Berlangganan'}</button>
  <div class="muted small" style="margin-top:10px">Mode simulasi: dibayar dari saldo virtual, tidak ada pembayaran sungguhan.</div></div>`;
  el.querySelector('#buy').onclick = () => {
    if (getState().balance < PRICE) return toast('Saldo virtual tidak cukup', 'bad');
    setState(st => ({ balance: st.balance - PRICE, premiumUntil: Math.max(Date.now(), st.premiumUntil) + 30 * DAY }));
    toast('Premium aktif (simulasi)', 'ok'); premium(el);
  };
}
