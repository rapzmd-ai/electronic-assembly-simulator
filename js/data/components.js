// Database komponen. tier: 'free' | 'premium'. devices: perangkat yang bisa memakai.
const seq = {}; // id harus unik per jenis walau komponen dibuat dalam beberapa grup
const L = (type, devices, items) => items.map(([name, tier, specs]) => ({ id: `${type}-${seq[type] = (seq[type] || 0) + 1}`, type, name, tier, specs, devices }));
const ALL = ['smartphone','laptop','pc','tablet','console','smartwatch'];
export const COMPONENTS = [
  ...L('motherboard',['pc'],[
    ['B650 Micro-ATX','free',{socket:'AM5',ramType:'DDR5',slot:'M.2',score:60}],
    ['H610 Micro-ATX','free',{socket:'LGA1700',ramType:'DDR4',slot:'M.2',score:40}],
    ['Z790 ATX','premium',{socket:'LGA1700',ramType:'DDR5',slot:'M.2',score:85}],
    ['X870E Workstation','premium',{socket:'AM5',ramType:'DDR5',slot:'M.2',score:95}]]),
  ...L('motherboard',['laptop'],[
    ['Laptop Board LB-14 (DDR4)','free',{socket:'BGA-14',ramType:'DDR4',slot:'M.2',score:45}],
    ['Laptop Board LB-16 (DDR5)','free',{socket:'BGA-16',ramType:'DDR5',slot:'M.2',score:65}],
    ['Laptop Board Pro-17','premium',{socket:'BGA-16',ramType:'DDR5',slot:'M.2',score:90}]]),
  ...L('motherboard',['smartphone','tablet','smartwatch'],[
    ['Mobile Board M1 (SoC-A)','free',{socket:'SoC-A',ramType:'LPDDR4',slot:'UFS',score:40}],
    ['Mobile Board M2 (SoC-B)','free',{socket:'SoC-B',ramType:'LPDDR5',slot:'UFS',score:65}],
    ['Mobile Board Flagship (SoC-B)','premium',{socket:'SoC-B',ramType:'LPDDR5',slot:'UFS',score:92}]]),
  ...L('motherboard',['console'],[
    ['Console Board C1','free',{socket:'AM5',ramType:'DDR5',slot:'M.2',score:60}],
    ['Console Board C-Pro','premium',{socket:'AM5',ramType:'DDR5',slot:'M.2',score:90}]]),
  ...L('cpu',['pc','console'],[
    ['Ryzen 5 7600','free',{socket:'AM5',cores:6,watt:65,score:62}],
    ['Core i3-12100','free',{socket:'LGA1700',cores:4,watt:60,score:45}],
    ['Core i5-13400','free',{socket:'LGA1700',cores:10,watt:65,score:66}],
    ['Ryzen 9 9950X','premium',{socket:'AM5',cores:16,watt:170,score:97}],
    ['Core i9-14900K','premium',{socket:'LGA1700',cores:24,watt:253,score:96}]]),
  ...L('cpu',['laptop'],[
    ['Mobile i5-1235U','free',{socket:'BGA-14',cores:10,watt:15,score:50}],
    ['Mobile Ryzen 7 8845H','free',{socket:'BGA-16',cores:8,watt:45,score:70}],
    ['Mobile i9-14900HX','premium',{socket:'BGA-16',cores:24,watt:55,score:95}]]),
  ...L('gpu',['pc','console'],[
    ['GTX 1650 4GB','free',{watt:75,vram:4,score:35}],
    ['RTX 3060 12GB','free',{watt:170,vram:12,score:58}],
    ['RTX 4090 24GB','premium',{watt:450,vram:24,score:99}],
    ['RX 7900 XTX 24GB','premium',{watt:355,vram:24,score:92}]]),
  ...L('gpu',['laptop'],[
    ['Mobile GTX 1650','free',{watt:50,vram:4,score:32}],
    ['Mobile RTX 4060','free',{watt:80,vram:8,score:60}],
    ['Mobile RTX 4090','premium',{watt:150,vram:16,score:96}]]),
  ...L('ram',['pc','laptop','console'],[
    ['DDR4 8GB 3200','free',{ramType:'DDR4',gb:8,score:30}],
    ['DDR4 16GB 3200','free',{ramType:'DDR4',gb:16,score:42}],
    ['DDR5 16GB 5600','free',{ramType:'DDR5',gb:16,score:58}],
    ['DDR5 64GB 6400','premium',{ramType:'DDR5',gb:64,score:92}],
    ['DDR5 128GB ECC','premium',{ramType:'DDR5',gb:128,score:98}]]),
  ...L('ram',['smartphone','tablet','smartwatch'],[
    ['LPDDR4 4GB','free',{ramType:'LPDDR4',gb:4,score:30}],
    ['LPDDR5 8GB','free',{ramType:'LPDDR5',gb:8,score:60}],
    ['LPDDR5X 16GB','premium',{ramType:'LPDDR5',gb:16,score:90}]]),
  ...L('storage',['smartphone','tablet','smartwatch'],[
    ['UFS 64GB','free',{slot:'UFS',gb:64,score:30}],
    ['UFS 128GB','free',{slot:'UFS',gb:128,score:50}],
    ['UFS 4.0 512GB','premium',{slot:'UFS',gb:512,score:92}]]),
  ...L('ssd',['laptop','console'],[
    ['NVMe SSD 256GB','free',{slot:'M.2',gb:256,score:45}],
    ['NVMe SSD 1TB','free',{slot:'M.2',gb:1000,score:65}],
    ['NVMe Pro 4TB','premium',{slot:'M.2',gb:4000,score:96}]]),
  ...L('storage_pc',['pc'],[
    ['HDD 1TB 7200rpm','free',{slot:'SATA',gb:1000,score:25}],
    ['NVMe SSD 500GB','free',{slot:'M.2',gb:500,score:55}],
    ['NVMe Gen5 2TB Pro','premium',{slot:'M.2',gb:2000,score:98}]]),
  ...L('display',ALL,[
    ['LCD HD Standar','free',{res:'1280x720',hz:60,score:35}],
    ['IPS FHD 60Hz','free',{res:'1920x1080',hz:60,score:55}],
    ['OLED QHD 120Hz','premium',{res:'2560x1440',hz:120,score:92}]]),
  ...L('battery',['smartphone','tablet','smartwatch','laptop'],[
    ['Baterai Standar','free',{mah:3000,score:40}],
    ['Baterai Besar','free',{mah:5000,score:65}],
    ['Baterai Silikon-Karbon','premium',{mah:6500,score:90}]]),
  ...L('camera',['smartphone','tablet'],[
    ['Kamera 12MP','free',{mp:12,score:40}],
    ['Kamera 50MP','free',{mp:50,score:65}],
    ['Kamera 200MP Periskop','premium',{mp:200,score:95}]]),
  ...L('speaker',['smartphone','tablet','laptop'],[
    ['Speaker Mono','free',{score:30}],['Speaker Stereo','free',{score:55}],['Speaker Quad Dolby','premium',{score:90}]]),
  ...L('microphone',['smartphone'],[['Mic Standar','free',{score:40}],['Mic Noise-Cancel','free',{score:65}]]),
  ...L('charging_port',['smartphone'],[['USB-C 18W','free',{score:40}],['USB-C 65W','free',{score:70}]]),
  ...L('casing',ALL,[
    ['Casing Plastik','free',{score:30}],['Casing Aluminium','free',{score:60}],['Casing Titanium','premium',{score:92}]]),
  ...L('cooling',['smartphone'],[['Heat Pipe Tipis','free',{score:40}],['Vapor Chamber','free',{score:70}]]),
  ...L('keyboard',['laptop'],[['Keyboard Membrane','free',{score:35}],['Keyboard Mekanikal Low-Profile','free',{score:65}]]),
  ...L('fan',['laptop','console'],[['Kipas Standar','free',{score:40}],['Kipas Dual Blade','free',{score:65}]]),
  ...L('heatsink',['laptop'],[['Heatsink Aluminium','free',{score:45}],['Heatsink Tembaga','free',{score:70}]]),
  ...L('psu',['pc','console'],[
    ['PSU 450W Bronze','free',{watt:450,score:40}],['PSU 650W Gold','free',{watt:650,score:65}],
    ['PSU 1000W Platinum','premium',{watt:1000,score:90}],['PSU 1600W Titanium','premium',{watt:1600,score:98}]]),
  ...L('cpu_cooler',['pc'],[['Cooler Stok','free',{score:35}],['Tower Air Cooler','free',{score:65}],['AIO 360mm','premium',{score:92}]]),
  ...L('case_fan',['pc'],[['Fan 120mm','free',{score:45}],['Fan 140mm PWM','free',{score:65}]]),
  ...L('cable',['pc'],[['Kabel Standar','free',{score:50}],['Kabel Sleeved','free',{score:65}]]),
  ...L('monitor',['pc'],[['Monitor 24" FHD','free',{score:55}],['Monitor 27" 4K 144Hz','premium',{score:92}]]),
  ...L('peripheral',['pc'],[['Keyboard + Mouse Dasar','free',{score:45}],['Set Gaming RGB','free',{score:65}]]),
  ...L('sensor',['smartwatch'],[['Sensor Detak Jantung','free',{score:55}],['Sensor ECG + SpO2','premium',{score:90}]]),
  ...L('chipset',['smartphone','tablet','smartwatch'],[
    ['Chipset A-Lite','free',{socket:'SoC-A',cores:8,score:40}],
    ['Chipset B-Plus','free',{socket:'SoC-B',cores:8,score:65}],
    ['Chipset B-Ultra Flagship','premium',{socket:'SoC-B',cores:10,score:96}]]),
];
export const byType = (type, device) => COMPONENTS.filter(c => c.type === type && (!device || c.devices.includes(device)));
