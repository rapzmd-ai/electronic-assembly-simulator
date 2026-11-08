// Definisi perangkat dan slot komponen (sesuai spesifikasi proyek)
export const DEVICES = {
  smartphone: { name: 'Smartphone', icon: '▯', desc: 'Rakit HP dari motherboard hingga casing.',
    slots: ['motherboard','chipset','ram','storage','display','battery','camera','speaker','microphone','charging_port','casing','cooling'] },
  laptop: { name: 'Laptop', icon: '▭', desc: 'Laptop dengan CPU, GPU, pendingin, dan keyboard.',
    slots: ['motherboard','cpu','gpu','ram','ssd','display','keyboard','battery','fan','heatsink','speaker','casing'] },
  pc: { name: 'PC Desktop', icon: '▣', desc: 'PC desktop lengkap dengan PSU, cooler, dan periferal.',
    slots: ['motherboard','cpu','gpu','ram','storage_pc','psu','cpu_cooler','case_fan','casing','cable','monitor','peripheral'] },
  tablet: { name: 'Tablet', icon: '▢', desc: 'Tablet dengan chipset, layar, dan kamera.',
    slots: ['motherboard','chipset','ram','storage','display','battery','camera','speaker','casing'] },
  console: { name: 'Konsol Game', icon: '◫', desc: 'Konsol game portabel / rumahan.',
    slots: ['motherboard','cpu','gpu','ram','ssd','psu','fan','casing'] },
  smartwatch: { name: 'Smartwatch', icon: '◔', desc: 'Jam pintar dengan sensor dan baterai kecil.',
    slots: ['motherboard','chipset','storage','display','battery','sensor','casing'] },
};
export const SLOT_LABEL = {
  motherboard:'Motherboard', chipset:'Chipset', cpu:'CPU', gpu:'GPU', ram:'RAM', storage:'Storage', ssd:'SSD',
  storage_pc:'SSD / HDD', display:'Display', battery:'Battery', camera:'Camera', speaker:'Speaker',
  microphone:'Microphone', charging_port:'Charging Port', casing:'Casing', cooling:'Cooling System',
  keyboard:'Keyboard', fan:'Cooling Fan', heatsink:'Heatsink', psu:'PSU', cpu_cooler:'CPU Cooler',
  case_fan:'Case Fan', cable:'Kabel', monitor:'Monitor', peripheral:'Periferal', sensor:'Sensor',
};
