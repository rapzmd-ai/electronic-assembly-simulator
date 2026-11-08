import { getState, setState, resetAll, toast, exportData, importData } from '../store.js';
export default function settings(el) {
  const s = getState().settings;
  el.innerHTML = `<div class="card" style="max-width:520px"><h3>Pengaturan</h3>
  <label class="row sp" style="margin:12px 0">Mode ringkas<input type="checkbox" id="cp" ${s.compact ? 'checked' : ''}></label>
  <label class="row sp" style="margin:12px 0">Warna aksen<input type="color" id="ac" value="${s.accent}"></label>
  <label class="row sp" style="margin:12px 0">Kualitas grafis 3D<select id="ql"><option value="high" ${s.quality === 'high' ? 'selected' : ''}>Tinggi</option><option value="low" ${s.quality === 'low' ? 'selected' : ''}>Hemat (laptop/HP lemah)</option></select></label>
  <div class="muted small" style="margin:-6px 0 12px">Kualitas grafis berlaku saat Workshop dibuka kembali.</div>
  <h3 style="margin-top:20px">Data</h3><div class="row" style="margin:10px 0"><button class="btn ghost" id="ex">Ekspor cadangan (.json)</button><button class="btn ghost" id="im">Impor cadangan</button><input type="file" id="fi" accept="application/json" hidden></div>
  <button class="btn danger" id="rs">Reset semua data</button></div>`;
  el.querySelector('#cp').onchange = e => { setState(st => ({ settings: { ...st.settings, compact: e.target.checked } })); applySettings(); };
  el.querySelector('#ac').onchange = e => { setState(st => ({ settings: { ...st.settings, accent: e.target.value } })); applySettings(); };
  el.querySelector('#ql').onchange = e => { setState(st => ({ settings: { ...st.settings, quality: e.target.value } })); toast('Tersimpan', 'ok'); };
  el.querySelector('#ex').onclick = () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([exportData()], { type: 'application/json' }));
    a.download = `eas-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast('Cadangan diunduh', 'ok');
  };
  el.querySelector('#im').onclick = () => el.querySelector('#fi').click();
  el.querySelector('#fi').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { if (!confirm('Timpa semua data saat ini dengan cadangan ini?')) return; importData(await f.text()); applySettings(); toast('Data dipulihkan', 'ok'); settings(el); }
    catch (err) { toast('Gagal impor: ' + err.message, 'bad'); }
  };
  el.querySelector('#rs').onclick = () => { if (confirm('Hapus semua data tersimpan?')) { resetAll(); toast('Data direset'); location.hash = '#/'; location.reload(); } };
}
export const applySettings = () => { const s = getState().settings; document.documentElement.style.setProperty('--accent', s.accent); document.body.style.fontSize = s.compact ? '13px' : '14px'; };
