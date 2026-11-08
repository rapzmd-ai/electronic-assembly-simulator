// Mesin pengujian: menghitung hasil dari spesifikasi komponen yang terpasang.
import { compOf } from '../compat.js';
export const TESTS = [
  ['power', 'Power On Test'], ['bios', 'BIOS Simulation'], ['boot', 'Boot Test'], ['temp', 'Temperature Monitoring'], ['cpu', 'CPU Benchmark'],
  ['gpu', 'GPU Benchmark'], ['ram', 'RAM Test'], ['storage', 'Storage Test'], ['display', 'Display Test'], ['battery', 'Battery Test'],
].map(([id, label]) => ({ id, label }));
export const DEFAULT_CFG = { fan: 'balanced', turbo: false };
const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n));
const rnd = (a, b) => a + Math.random() * (b - a);
const part = (b, s) => b.slots[s] && compOf(b.slots[s]);
const chip = b => part(b, 'cpu') || part(b, 'chipset');
const store = b => part(b, 'ssd') || part(b, 'storage_pc') || part(b, 'storage');
const GPUK = { pc: 1, laptop: 1, console: 1 };
export const applicable = b => TESTS.filter(t => t.id !== 'battery' || b.slots.battery);
const status = (score, warn = 55, pass = 35) => score >= warn ? 'pass' : score >= pass ? 'warn' : 'fail';

function needWatt(b) { return (part(b, 'gpu')?.specs.watt || 0) + (part(b, 'cpu')?.specs.watt || 0) + 100; }
function cooling(b) {
  const c = ['cpu_cooler', 'heatsink', 'fan', 'case_fan', 'cooling'].map(s => part(b, s)).filter(Boolean);
  if (c.length) return c.reduce((a, x) => a + x.specs.score, 0) / c.length;
  return 40 + (part(b, 'casing')?.specs.score || 0) * .2;
}
export function thermal(b, cfg) {
  const ch = chip(b), gpu = part(b, 'gpu');
  const cpuW = part(b, 'cpu')?.specs.watt ?? (b.type === 'smartwatch' ? 2.5 : 4 + (ch?.specs.score || 0) / 100 * 7 * (b.type === 'tablet' ? 1.4 : 1));
  const heat = cpuW + (gpu ? gpu.specs.watt * .8 : 0);
  const k = { pc: .22, console: .3, laptop: .6, smartphone: 3.5, tablet: 2.5, smartwatch: 8 }[b.type] || .5;
  let peak = 30 + heat * k * (1.2 - cooling(b) / 100);
  peak *= { silent: 1.1, balanced: 1, performance: .9 }[cfg.fan] * (cfg.turbo ? 1.1 : 1);
  peak = clamp(peak, 28, 110);
  return { peak, throttle: peak > 90 ? Math.max(.7, 1 - (peak - 90) / 60) : 1 };
}
export function compute(id, b, cfg = DEFAULT_CFG) {
  const th = thermal(b, cfg), ch = chip(b), turbo = cfg.turbo ? 1.08 : 1, ram = part(b, 'ram');
  switch (id) {
    case 'power': {
      const psu = part(b, 'psu');
      if (psu && psu.specs.watt < needWatt(b)) return { score: 0, status: 'fail', detail: `PSU ${psu.specs.watt}W kurang (butuh ±${needWatt(b)}W)` };
      return { score: 100, status: 'pass', detail: 'Daya stabil, perangkat menyala' };
    }
    case 'bios': return { score: 100, status: 'pass', detail: `Kipas: ${cfg.fan}, Turbo: ${cfg.turbo ? 'On' : 'Off'}` };
    case 'boot': {
      const t = 8 + (100 - (store(b)?.specs.score || 30)) * .15 + (100 - (ch?.specs.score || 40)) * .05 + rnd(-.6, .6), score = clamp(100 - (t - 8) * 3);
      return { score, status: status(score), detail: `Boot ${t.toFixed(1)} detik`, data: { seconds: t } };
    }
    case 'temp': {
      const peak = th.peak, curve = Array.from({ length: 30 }, (_, i) => +(30 + (peak - 30) * (1 - Math.exp(-i / 6)) + rnd(-.8, .8)).toFixed(1)), score = clamp(100 - Math.max(0, peak - 50) * 1.6);
      return { score, status: peak <= 80 ? 'pass' : peak <= 95 ? 'warn' : 'fail', detail: `Puncak ${peak.toFixed(0)}°C${th.throttle < 1 ? ' · thermal throttling' : ''}`, data: { curve, peak } };
    }
    case 'cpu': {
      const s = clamp((ch?.specs.score || 30) * turbo * th.throttle * rnd(.95, 1.05) * (.97 + (ram?.specs.score || 40) / 3000));
      return { score: s, status: status(s), detail: `${Math.round(s * 150).toLocaleString('id-ID')} poin${th.throttle < 1 ? ' (throttled)' : ''}` };
    }
    case 'gpu': {
      const g = part(b, 'gpu'), s = clamp((g ? g.specs.score : (ch?.specs.score || 30) * .75) * th.throttle * rnd(.95, 1.05));
      return { score: s, status: status(s), detail: `${Math.round(s * 210).toLocaleString('id-ID')} poin${g ? '' : ' (GPU terintegrasi)'}` };
    }
    case 'ram': {
      const s = clamp((ram?.specs.score || 30) * rnd(.97, 1.03));
      return { score: s, status: status(s), detail: `${ram?.specs.gb} GB · ${Math.round(s * 320).toLocaleString('id-ID')} MB/s · 0 error` };
    }
    case 'storage': {
      const st = store(b), sc = st?.specs.score || 30, rd = st?.specs.slot === 'SATA' ? sc * 5.5 : sc * sc * .55, s = clamp(sc * rnd(.97, 1.03));
      return { score: s, status: status(s, 50, 30), detail: `Baca ${Math.round(rd)} MB/s · Tulis ${Math.round(rd * .8)} MB/s` };
    }
    case 'display': {
      const d = part(b, 'display') || part(b, 'monitor'), s = clamp((d?.specs.score || 40) * rnd(.97, 1.03));
      return { score: s, status: status(s), detail: `${d?.specs.res || '-'} @ ${d?.specs.hz || 60}Hz` };
    }
    case 'battery': {
      const bt = part(b, 'battery'), sc = chip(b)?.specs.score || 40;
      const draw = { smartphone: 300 + sc * 5, tablet: (300 + sc * 5) * 1.5, smartwatch: 150, laptop: 2000 + (part(b, 'cpu')?.specs.watt || 15) * 60 + (part(b, 'gpu')?.specs.watt || 0) * 40 }[b.type] || 500;
      const hrs = (bt.specs.mah * (b.type === 'laptop' ? 8 : 1)) / draw * rnd(.95, 1.05), s = clamp(hrs * 8);
      return { score: s, status: status(s), detail: `${hrs.toFixed(1)} jam pemakaian`, data: { hours: hrs } };
    }
  }
}
export function finalize(b, results) {
  const list = applicable(b); if (!list.every(t => results[t.id])) return null;
  const scores = list.filter(t => !['power', 'bios'].includes(t.id)).map(t => results[t.id].score);
  const avg = scores.reduce((a, x) => a + x, 0) / scores.length, notes = [];
  let penalty = 0; const cpu = part(b, 'cpu'), gpu = part(b, 'gpu');
  if (cpu && gpu && GPUK[b.type]) { const diff = Math.abs(cpu.specs.score - gpu.specs.score); penalty = Math.min(10, diff * .25); if (diff > 30) notes.push(`CPU dan GPU tidak seimbang (${cpu.specs.score} vs ${gpu.specs.score}): terjadi bottleneck.`); }
  for (const t of list) if (results[t.id].status === 'fail') notes.push(`${t.label} gagal: ${results[t.id].detail}.`);
  else if (results[t.id].status === 'warn') notes.push(`${t.label} perlu perhatian: ${results[t.id].detail}.`);
  const quality = results.power.status === 'fail' ? 0 : Math.round(clamp(avg - penalty));
  return { quality, grade: quality >= 90 ? 'S' : quality >= 80 ? 'A' : quality >= 65 ? 'B' : quality >= 50 ? 'C' : 'D', notes };
}
