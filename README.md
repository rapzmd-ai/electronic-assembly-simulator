# Electronic Assembly Simulator

Simulator interaktif untuk merakit perangkat elektronik (HP, laptop, PC, tablet, konsol, smartwatch).

## Status
- Fase 1 selesai: dashboard, navigasi, pemilihan perangkat, inventory, database komponen, Premium (simulasi), profil, pengaturan.
- Fase 2: ruang kerja 3D (Three.js via CDN), drag-and-drop dari daftar ke titik pemasangan, animasi pasang/lepas, bongkar, progres, dan sistem kompatibilitas (socket, tipe RAM, slot storage, kapasitas PSU, urutan pemasangan, Premium).
- Fase 3-5 (testing, toko, optimasi) belum dibangun.

Catatan: Three.js dimuat dari jsDelivr (importmap di index.html), jadi butuh internet.

## Menjalankan
```
python3 -m http.server 8000
```
Buka http://localhost:8000 (harus lewat server karena memakai ES modules).
