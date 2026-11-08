// Tata letak 3D: slot -> [x, y, z, lebar, tinggi, dalam]. Satuan relatif (1 ≈ 10 cm).
const sc = (L, k) => Object.fromEntries(Object.entries(L).map(([id, v]) => [id, v.map(n => n * k)]));
const PHONE = {
  motherboard: [0, .16, 0, 3, .12, 6], chipset: [0, .34, -1.9, 1, .16, 1], ram: [-.85, .32, -.6, .8, .12, .7],
  storage: [.85, .32, -.6, .8, .12, .7], camera: [.8, .5, -2.55, .8, .34, .8], battery: [0, .36, 1.25, 2.4, .2, 2.1],
  speaker: [-.95, .34, 2.65, .6, .2, .6], microphone: [.95, .3, 2.7, .35, .15, .35], charging_port: [0, .3, 2.88, .9, .16, .3],
  cooling: [0, .56, -.05, 2.2, .05, .45], sensor: [0, .34, 2.5, .5, .1, .5], display: [0, 1.15, 0, 3.2, .1, 6.3], casing: [0, .65, 0, 3.5, 1.35, 6.7],
};
export const LAYOUTS = {
  smartphone: { cam: 13, slots: PHONE },
  tablet: { cam: 18, slots: sc(PHONE, 1.6) },
  smartwatch: { cam: 9, slots: sc(PHONE, .75) },
  laptop: { cam: 15, slots: {
    motherboard: [0, .16, 0, 8, .12, 5.5], cpu: [-1.5, .32, -.8, 1.2, .16, 1.2], gpu: [1.6, .34, -.8, 1.7, .22, 1.2],
    ram: [-2.5, .3, .9, 1.4, .12, .5], ssd: [.8, .3, 1.4, 1.4, .1, .5], heatsink: [-1.5, .52, -.8, 1.8, .14, 1.8],
    fan: [3.2, .36, -.9, 1.2, .25, 1.2], battery: [0, .34, 2.2, 4.6, .2, .8], speaker: [-3.4, .3, 1.5, .7, .2, .7],
    keyboard: [0, .85, .6, 7, .12, 3], display: [0, 2.2, -3.3, 7, 4, .1], casing: [0, .8, 0, 8.4, 1.8, 6.2] } },
  pc: { cam: 20, slots: {
    motherboard: [0, .2, 0, 6, .12, 6], cpu: [0, .36, -1.2, 1, .16, 1], cpu_cooler: [0, .95, -1.2, 1.6, .9, 1.6],
    ram: [1.8, .5, -1, .3, .5, 1.8], gpu: [0, .75, 1.5, 4.5, .6, 1.2], storage_pc: [-2.2, .32, -2.2, 1, .12, .7],
    psu: [3.9, .9, 2.2, 2, 1.4, 2.8], case_fan: [-3.9, .35, -1.5, 1.2, .3, 1.2], cable: [2.2, .34, -2.6, 2, .08, .3],
    monitor: [0, 1.7, -6.5, 5, 3, .2], peripheral: [0, .12, 6.6, 3.5, .15, 1.2], casing: [0, .95, 0, 10, 2.1, 6.9] } },
  console: { cam: 11, slots: {
    motherboard: [0, .16, 0, 5, .12, 4], cpu: [-.8, .32, -.6, 1, .16, 1], gpu: [1.2, .34, -.6, 1.3, .2, 1],
    ram: [-1.5, .3, .8, 1.2, .12, .5], ssd: [0, .3, 1.3, 1.2, .1, .5], psu: [0, .5, 2.8, 3, .6, 1.1],
    fan: [1.9, .35, 1, 1.2, .25, 1.2], casing: [0, .7, .5, 5.8, 1.5, 5.6] } },
};
