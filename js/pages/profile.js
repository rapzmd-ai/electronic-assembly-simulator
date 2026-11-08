import { getState, setState, toast, rupiah } from '../store.js';
export default function profile(el) {
  const s = getState();
  el.innerHTML = `<div class="card" style="max-width:480px"><h3>Profil</h3><div class="row" style="margin:12px 0"><input id="nm" value="${s.profile.name.replace(/"/g, '&quot;')}" maxlength="30"><button class="btn" id="sv">Simpan</button></div>
  <div class="muted small">Bergabung: ${new Date(s.profile.joined).toLocaleDateString('id-ID')}</div><div class="muted small">Saldo: ${rupiah(s.balance)} · Rakitan: ${s.builds.length} · Penjualan: ${s.sales.length}</div></div>`;
  el.querySelector('#sv').onclick = () => { const v = el.querySelector('#nm').value.trim(); if (!v) return toast('Nama kosong', 'bad'); setState(st => ({ profile: { ...st.profile, name: v } })); toast('Tersimpan', 'ok'); };
}
