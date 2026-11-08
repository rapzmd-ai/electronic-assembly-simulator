import { getState, setState, resetAll, toast } from '../store.js';
export default function settings(el) {
  const s = getState().settings;
  el.innerHTML = `<div class="card" style="max-width:480px"><h3>Pengaturan</h3>
  <label class="row sp" style="margin:12px 0">Mode ringkas<input type="checkbox" id="cp" ${s.compact ? 'checked' : ''}></label>
  <label class="row sp" style="margin:12px 0">Warna aksen<input type="color" id="ac" value="${s.accent}"></label>
  <button class="btn danger" id="rs">Reset semua data</button></div>`;
  const apply = () => { document.documentElement.style.setProperty('--accent', getState().settings.accent); document.body.style.fontSize = getState().settings.compact ? '13px' : '14px'; };
  el.querySelector('#cp').onchange = e => { setState(st => ({ settings: { ...st.settings, compact: e.target.checked } })); apply(); };
  el.querySelector('#ac').onchange = e => { setState(st => ({ settings: { ...st.settings, accent: e.target.value } })); apply(); };
  el.querySelector('#rs').onclick = () => { if (confirm('Hapus semua data tersimpan?')) { resetAll(); toast('Data direset'); location.hash = '#/'; location.reload(); } };
}
export const applySettings = () => { const s = getState().settings; document.documentElement.style.setProperty('--accent', s.accent); document.body.style.fontSize = s.compact ? '13px' : '14px'; };
