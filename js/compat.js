import { COMPONENTS } from './data/components.js';
import { DEVICES, SLOT_LABEL } from './data/devices.js';
export const compOf = id => COMPONENTS.find(c => c.id === id);
const L = s => SLOT_LABEL[s] || s;
// Urutan pemasangan: komponen -> slot yang harus sudah terpasang
export const DEPENDS = {
  chipset: ['motherboard'], cpu: ['motherboard'], gpu: ['motherboard'], ram: ['motherboard'], storage: ['motherboard'],
  ssd: ['motherboard'], storage_pc: ['motherboard'], camera: ['motherboard'], sensor: ['motherboard'], casing: ['motherboard'],
  cpu_cooler: ['cpu'], heatsink: ['cpu'], cooling: ['chipset'],
};
const deps = (b, s) => (DEPENDS[s] || []).filter(d => DEVICES[b.type].slots.includes(d));
const need = (b, extra = {}) => {
  const get = s => { const id = extra[s] ?? b.slots[s]; return id && compOf(id); };
  return (get('gpu')?.specs.watt || 0) + (get('cpu')?.specs.watt || 0) + 100;
};
export function checkInstall(b, c, premiumActive) {
  const s = c.type, no = reason => ({ ok: false, reason });
  if (!DEVICES[b.type].slots.includes(s) || !c.devices.includes(b.type)) return no(`${c.name} tidak dipakai di ${DEVICES[b.type].name}.`);
  if (b.slots[s]) return no(`Slot ${L(s)} sudah terisi. Lepas dulu komponen lama.`);
  if (c.tier === 'premium' && !premiumActive) return no('Komponen Premium terkunci. Aktifkan Premium untuk memakainya.');
  for (const d of deps(b, s)) if (!b.slots[d]) return no(`Pasang ${L(d)} terlebih dahulu.`);
  const mb = b.slots.motherboard && compOf(b.slots.motherboard);
  if (mb && (s === 'cpu' || s === 'chipset') && c.specs.socket !== mb.specs.socket)
    return no(`Socket ${c.specs.socket} tidak cocok dengan motherboard (${mb.specs.socket}).`);
  if (mb && s === 'ram' && c.specs.ramType !== mb.specs.ramType)
    return no(`RAM ${c.specs.ramType} tidak cocok dengan motherboard yang memakai ${mb.specs.ramType}.`);
  if (mb && ['storage', 'ssd', 'storage_pc'].includes(s) && c.specs.slot !== 'SATA' && c.specs.slot !== mb.specs.slot)
    return no(`Storage berslot ${c.specs.slot} tidak cocok dengan motherboard (${mb.specs.slot}).`);
  if (s === 'gpu' || s === 'cpu') {
    const psu = b.slots.psu && compOf(b.slots.psu);
    if (psu && psu.specs.watt < need(b, { [s]: c.id })) return no(`Kapasitas PSU ${psu.specs.watt}W kurang. Butuh sekitar ${need(b, { [s]: c.id })}W.`);
  }
  if (s === 'psu') {
    const n = need(b);
    if (c.specs.watt < n) return no(`PSU ${c.specs.watt}W tidak cukup untuk komponen terpasang (butuh sekitar ${n}W).`);
  }
  return { ok: true };
}
export function checkRemove(b, slot) {
  const dep = Object.keys(b.slots).filter(o => (DEPENDS[o] || []).includes(slot));
  return dep.length ? { ok: false, reason: `Lepas ${dep.map(L).join(', ')} dulu sebelum melepas ${L(slot)}.` } : { ok: true };
}
export function removalOrder(b) {
  const left = Object.keys(b.slots), out = [];
  while (left.length) { const i = left.findIndex(s => !left.some(o => o !== s && (DEPENDS[o] || []).includes(s))); out.push(left.splice(i < 0 ? 0 : i, 1)[0]); }
  return out;
}
