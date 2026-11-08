# Electronic Assembly Simulator

Simulator interaktif untuk merakit perangkat elektronik (HP, laptop, PC, tablet, konsol, smartwatch).

## Status
- Fase 1 selesai: dashboard, navigasi, pemilihan perangkat, inventory, database komponen, Premium (simulasi), profil, pengaturan.
- Fase 2: ruang kerja 3D (Three.js via CDN), drag-and-drop dari daftar ke titik pemasangan, animasi pasang/lepas, bongkar, progres, dan sistem kompatibilitas (socket, tipe RAM, slot storage, kapasitas PSU, urutan pemasangan, Premium).
- Fase 3: Testing Center (Power On, BIOS, Boot, suhu, benchmark CPU/GPU, RAM, storage, display, baterai) dengan skor kualitas dan grade.
- Fase 4-5 (toko, penjualan, optimasi) belum dibangun.

Catatan: Three.js dimuat dari jsDelivr (importmap di index.html), jadi butuh internet.

## Menjalankan
```
python3 -m http.server 8000
```
Buka http://localhost:8000 (harus lewat server karena memakai ES modules).
