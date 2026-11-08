import { getState, setState, toast, esc } from '../store.js';
import { DEVICES } from '../data/devices.js';
import { compOf } from '../compat.js';
import { TESTS, DEFAULT_CFG, applicable, compute, finalize } from '../testing/engine.js';

let selected = null;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const LOGS = {
  power: b => ['Memeriksa jalur daya…', 'Menguji tegangan rail…', 'Menyalakan perangkat…'],
  boot: b => ['POST…', `Deteksi CPU: ${(compOf(b.slots.cpu) || compOf(b.slots.chipset))?.name}`, `Memori: ${compOf(b.slots.ram)?.specs.gb ?? '-'} GB`, 'Memuat bootloader…', 'Memuat sistem operasi…', 'Boot selesai'],
  temp: () => ['Menjalankan beban penuh…', 'Membaca sensor suhu…', 'Mengumpulkan data 60 detik…'],
  cpu: () => ['Menjalankan uji integer…', 'Menjalankan uji floating point…', 'Multi-core stress…'],
  gpu: () => ['Render scene 3D…', 'Uji shader…', 'Menghitung FPS…'],
  ram: () => ['Menulis pola 0xAA…', 'Membaca & verifikasi…', 'Uji alamat acak…'],
  storage: () => ['Tes baca sekuensial…', 'Tes tulis sekuensial…', 'Tes akses acak…'],
  battery: () => ['Mengukur kapasitas…', 'Simulasi beban kerja…', 'Menghitung estimasi pemakaian…'],
};
export default function testing(el) {
  let dead = false, busy = false;
  const builds = () => getState().builds.filter(b => b.status === 'done' || b.status === 'tested');
  const cur = () => builds().find(b => b.id === selected) || null;
  const SW = a => `<svg viewBox="0 0 300 80" style="width:100%;height:80px"><polyline fill="none" stroke="var(--accent)" stroke-width="2" points="${a.map((v, i) => `${i / (a.length - 1) * 300},${80 - (v - 20) / 90 * 80}`).join(' ')}"/></svg>`;

  function save(b, patch) {
    setState(st => ({ builds: st.builds.map(x => {
      if (x.id !== b.id) return x; const test = { cfg: DEFAULT_CFG, results: {}, ...x.test, ...patch }; let out = { ...x, test };
      const fin = finalize(x, test.results); if (fin) { out.test = { ...test, ...fin, at: Date.now() }; out.status = 'tested'; } else { out.test = { ...test, quality: undefined, grade: undefined, notes: undefined }; out.status = 'done'; }
      return out; }) }));
  }
  const result = (b, id, r) => save(b, { results: { ...(cur().test?.results || {}), [id]: r } });
  const stage = () => el.querySelector('#stage');
  async function logRun(b, id) {
    const lines = LOGS[id](b), st = stage(); st.innerHTML = `<div class="card"><b>${TESTS.find(t => t.id === id).label}</b><div class="bar" style="margin:10px 0"><i id="pb"></i></div><pre id="lg" class="muted small" style="margin:0;white-space:pre-wrap"></pre></div>`;
    for (let i = 0; i < lines.length; i++) { if (dead) return; st.querySelector('#lg').textContent += lines[i] + '\n'; st.querySelector('#pb').style.width = ((i + 1) / lines.length * 100) + '%'; await sleep(450); }
  }
  async function bios(b, interactive) {
    const cfg = { ...DEFAULT_CFG, ...cur().test?.cfg };
    if (!interactive) return cfg;
    return new Promise(res => {
      const ram = compOf(b.slots.ram), cpu = compOf(b.slots.cpu) || compOf(b.slots.chipset), gpu = compOf(b.slots.gpu);
      stage().innerHTML = `<div class="card" style="font-family:monospace;background:#05070a;border-color:#1e3a8a"><b style="color:#93c5fd">BIOS SETUP UTILITY</b>
      <div class="small muted" style="margin:8px 0">Prosesor: ${esc(cpu?.name)} · RAM: ${ram?.specs.gb ?? '-'} GB ${ram?.specs.ramType ?? ''}${gpu ? ' · GPU: ' + esc(gpu.name) : ''}</div>
      <label class="row sp" style="margin:10px 0">Profil kipas<select id="bf"><option value="silent">Silent</option><option value="balanced">Balanced</option><option value="performance">Performance</option></select></label>
      <label class="row sp" style="margin:10px 0">CPU Turbo Boost<input type="checkbox" id="bt"></label>
      <div class="row"><button class="btn" id="bs">Simpan & Keluar</button><button class="btn ghost" id="bd">Default</button></div></div>`;
      stage().querySelector('#bf').value = cfg.fan; stage().querySelector('#bt').checked = cfg.turbo;
      stage().querySelector('#bs').onclick = () => res({ fan: stage().querySelector('#bf').value, turbo: stage().querySelector('#bt').checked });
      stage().querySelector('#bd').onclick = () => res({ ...DEFAULT_CFG });
    });
  }
  async function display(b, interactive) {
    const cols = ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000'], st = stage();
    st.innerHTML = `<div class="card"><b>Display Test</b><div id="px" style="height:160px;border-radius:8px;margin:10px 0;border:1px solid var(--line)"></div><div id="dx"></div></div>`;
    const px = st.querySelector('#px');
    if (!interactive) { for (const c of cols) { if (dead) return {}; px.style.background = c; await sleep(350); } return { dead: false }; }
    return new Promise(res => { let i = 0; px.style.background = cols[0];
      const dx = st.querySelector('#dx'), next = () => { i++; if (i >= cols.length) { dx.innerHTML = `<div class="muted small" style="margin-bottom:8px">Apakah ada piksel mati atau bercak?</div><div class="row"><button class="btn" id="dn">Normal</button><button class="btn danger" id="dd">Ada masalah</button></div>`;
        dx.querySelector('#dn').onclick = () => res({ dead: false }); dx.querySelector('#dd').onclick = () => res({ dead: true }); } else { px.style.background = cols[i]; draw(); } };
      const draw = () => { dx.innerHTML = `<button class="btn" id="nx">Warna berikutnya (${i + 1}/${cols.length})</button>`; dx.querySelector('#nx').onclick = next; }; draw(); });
  }
  async function run(id, interactive) {
    const b = cur(); let cfg = { ...DEFAULT_CFG, ...b.test?.cfg };
    if (id === 'bios') { cfg = await bios(b, interactive); if (dead) return; const old = cur().test?.results || {}, keep = { ...old }; ['temp', 'cpu', 'gpu', 'bios'].forEach(k => delete keep[k]);
      save(b, { cfg, results: { ...keep, bios: compute('bios', b, cfg) } }); stage().innerHTML = ''; return; }
    if (id === 'display') { const o = await display(b, interactive); if (dead) return; const r = compute('display', b, cfg);
      if (o.dead) { r.score = Math.max(0, r.score - 25); r.status = 'warn'; r.detail += ' · piksel mati dilaporkan'; } result(b, id, r); stage().innerHTML = ''; return; }
    await logRun(b, id); if (dead) return;
    const r = compute(id, b, cfg); result(b, id, r); stage().innerHTML = '';
    if (id === 'power' && r.status === 'fail') toast('Perangkat gagal menyala: ' + r.detail, 'bad');
  }
  async function guarded(fn) { if (busy) return; busy = true; draw(); try { await fn(); } finally { busy = false; if (!dead) draw(); } }
  const reset = () => { const b = cur(); setState(st => ({ builds: st.builds.map(x => x.id === b.id ? { ...x, test: undefined, status: 'done' } : x) })); draw(); };

  function draw() {
    const bs = builds(); if (!bs.find(x => x.id === selected)) selected = bs[0]?.id || null;
    const b = cur();
    if (!b) { el.innerHTML = `<div class="empty">Belum ada perangkat yang selesai dirakit.<br><br><a class="btn" href="#/workshop">Ke Workshop</a></div>`; return; }
    const t = b.test || {}, res = t.results || {}, list = applicable(b), done = list.filter(x => res[x.id]).length, powered = res.power?.status === 'pass';
    el.innerHTML = `<div class="row sp" style="margin-bottom:14px"><select id="sel">${bs.map(x => `<option value="${x.id}" ${x.id === selected ? 'selected' : ''}>${esc(x.name)} (${DEVICES[x.type].name})</option>`).join('')}</select>
      <div class="row"><button class="btn" id="all" ${busy ? 'disabled' : ''}>Jalankan semua</button><button class="btn ghost" id="rst" ${busy || !done ? 'disabled' : ''}>Reset hasil</button></div></div>
    <div class="muted small" style="margin-bottom:6px">${done}/${list.length} pengujian selesai</div><div class="bar" style="margin-bottom:16px"><i style="width:${done / list.length * 100}%"></i></div>
    ${t.quality !== undefined ? `<div class="card" style="margin-bottom:16px"><div class="row sp"><div><div class="muted small">Kualitas produk</div><div class="stat">${t.quality}/100 · Grade ${t.grade}</div></div><a class="btn ghost sm" href="#/store">Jual produk</a></div>
      ${t.notes?.length ? `<ul class="muted small">${t.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : '<div class="muted small">Tidak ada masalah ditemukan.</div>'}</div>` : ''}
    <div id="stage" style="margin-bottom:16px"></div>
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">${list.map(x => { const r = res[x.id], locked = x.id !== 'power' && !powered;
      return `<div class="card"><div class="row sp"><b>${x.label}</b>${r ? `<span class="pill ${r.status === 'pass' ? 'ok' : ''}" style="${r.status === 'fail' ? 'color:var(--bad)' : r.status === 'warn' ? 'color:var(--warn)' : ''}">${r.status}</span>` : ''}</div>
      ${r ? `<div class="bar" style="margin:10px 0"><i style="width:${r.score}%"></i></div><div class="muted small">${esc(r.detail)} · skor ${Math.round(r.score)}</div>${x.id === 'temp' && r.data?.curve ? SW(r.data.curve) : ''}` : '<div class="muted small" style="margin:8px 0">Belum diuji</div>'}
      <button class="btn ${r ? 'ghost' : ''} sm" data-run="${x.id}" ${busy || locked ? 'disabled' : ''} title="${locked ? 'Lulus Power On Test dulu' : ''}">${r ? 'Ulangi' : 'Jalankan'}</button></div>`; }).join('')}</div>`;
    el.querySelector('#sel').onchange = e => { selected = e.target.value; draw(); };
    el.querySelector('#rst').onclick = reset;
    el.querySelector('#all').onclick = () => guarded(async () => { for (const x of applicable(cur())) { if (dead) return; if (x.id !== 'power' && cur().test?.results?.power?.status !== 'pass') break; await run(x.id, false); } });
    el.querySelectorAll('[data-run]').forEach(bn => bn.onclick = () => guarded(() => run(bn.dataset.run, true)));
  }
  draw();
  return () => { dead = true; };
}
