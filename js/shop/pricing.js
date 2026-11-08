// Penilaian & harga jual. Murni fungsi (mudah diuji).
import { compOf } from '../compat.js';
import { applicable } from '../testing/engine.js';
export const STORES = [
  { id: 'smartphone', name: 'PhoneHub Smartphone Store', bio: 'Spesialis HP, tablet, dan smartwatch.', accepts: ['smartphone', 'tablet', 'smartwatch'], mul: 1.08 },
  { id: 'computer', name: 'ByteWorks Computer Store', bio: 'PC desktop dan konsol game.', accepts: ['pc', 'console'], mul: 1.06 },
  { id: 'laptop', name: 'LapZone Laptop Store', bio: 'Khusus laptop semua kelas.', accepts: ['laptop'], mul: 1.07 },
  { id: 'electronics', name: 'ElectroMart Electronics Store', bio: 'Menerima semua perangkat, harga standar.', accepts: ['smartphone', 'tablet', 'smartwatch', 'pc', 'console', 'laptop'], mul: .95 },
];
const BASE = { motherboard: 900e3, chipset: 1.8e6, cpu: 2.5e6, gpu: 4e6, ram: 6e5, storage: 4.5e5, ssd: 7e5, storage_pc: 6.5e5, display: 8e5, battery: 2.5e5, camera: 4e5,
  speaker: 1.2e5, microphone: 6e4, charging_port: 8e4, casing: 3.5e5, cooling: 1.5e5, keyboard: 2e5, fan: 1.2e5, heatsink: 1.5e5, psu: 7e5, cpu_cooler: 3.5e5, case_fan: 8e4, cable: 6e4, monitor: 1.6e6, peripheral: 3e5, sensor: 2e5 };
export const partPrice = c => Math.round((BASE[c.type] || 2e5) * (.35 + 1.65 * Math.pow(c.specs.score / 100, 2)) * (c.tier === 'premium' ? 1.6 : 1) / 1000) * 1000;
export const specValue = b => Object.values(b.slots).map(compOf).filter(Boolean).reduce((a, c) => a + partPrice(c), 0);
const GRADE = { S: 1.1, A: 1.04, B: 1, C: .95, D: .85 };
const hash = s => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
const seeded = s => (hash(s) % 1000) / 1000; // 0..1 stabil
export const sellable = b => b.status === 'tested' && b.test?.results?.power?.status === 'pass' && b.test.quality !== undefined;
export function assess(b, store) {
  const t = b.test, res = Object.values(t.results), warns = res.filter(r => r.status === 'warn').length, fails = res.filter(r => r.status === 'fail').length;
  const cond = Math.max(0, 100 - warns * 8 - fails * 20);
  const cpu = compOf(b.slots.cpu), gpu = compOf(b.slots.gpu), pen = cpu && gpu ? Math.min(10, Math.abs(cpu.specs.score - gpu.specs.score) * .25) : 0;
  const fit = Math.round(100 - pen * 5);
  const day = Math.floor(Date.now() / 864e5), noise = .97 + seeded(`${b.id}|${store.id}|${day}`) * .06;
  const f = { spec: specValue(b) * .8, quality: .55 + t.quality / 100 * .6, cond: .75 + .25 * cond / 100, fit: 1 - pen * 1.5 / 100, grade: GRADE[t.grade] || 1, store: store.mul, noise };
  const haggle = b.haggle?.[store.id]?.mul || 1;
  const offer = Math.round(f.spec * f.quality * f.cond * f.fit * f.grade * f.store * noise * haggle / 1000) * 1000;
  const stars = Math.max(1, Math.min(5, Math.round((t.quality * .9 + cond * .1) / 20 + (seeded(`${store.id}|${b.id}`) - .5) * .6)));
  const comment = ['', 'Kualitas sangat rendah.', 'Di bawah standar kami.', 'Cukup, ada beberapa catatan.', 'Produk bagus.', 'Produk istimewa!'][stars];
  return { offer, stars, comment, cond, fit, parts: [['Nilai komponen (spesifikasi)', f.spec, 'Rp'], ['Kualitas rakitan', f.quality], ['Hasil pengujian (grade ' + t.grade + ')', f.grade], ['Kondisi produk ' + cond + '%', f.cond], ['Kesesuaian komponen ' + fit + '%', f.fit], ['Faktor toko', f.store * noise * haggle]] };
}
// Tawar-menawar sekali per toko per perangkat: peluang naik tergantung kualitas
export const haggleOutcome = (b, store) => Math.random() < .15 + b.test.quality / 100 * .65 ? { ok: true, mul: 1.08 } : { ok: false, mul: .95 };
