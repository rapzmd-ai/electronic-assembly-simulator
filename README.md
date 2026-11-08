# Electronic Assembly Simulator

Simulator interaktif untuk merakit perangkat elektronik (HP, laptop, PC, tablet, konsol, smartwatch), menguji, lalu menjualnya ke toko virtual.

## Fitur (Fase 1-5 selesai)
- Dashboard, navigasi sidebar (responsif), 10 halaman.
- Device Selection dan Component Inventory (sekitar 90 komponen, Free dan Premium).
- 3D Assembly Workshop (Three.js via CDN): drag-and-drop ke titik pemasangan, animasi, bongkar, progres.
- Kompatibilitas: socket, tipe RAM, slot storage, daya PSU, urutan pasang, kunci Premium.
- Testing Center: Power On, BIOS, Boot, suhu, benchmark CPU/GPU, RAM, storage, display, baterai, skor kualitas dan grade.
- Electronics Store: 4 toko, penilaian, tawar-menawar, jual, saldo virtual, riwayat transaksi. My Products.
- Premium Rp50.000/30 hari (simulasi), riwayat, batal, notifikasi kedaluwarsa.
- Data tersimpan di localStorage; ekspor/impor cadangan JSON; pengaturan kualitas grafis 3D.

## Menjalankan
```
python3 -m http.server 8000
```
Buka http://localhost:8000 (wajib lewat server karena memakai ES modules). Ruang 3D memuat Three.js dari jsDelivr, jadi butuh internet dan WebGL.

## Catatan teknis
Dibuat tanpa build step (tanpa Vite/React/TS) karena lingkungan pengembangan tidak punya akses install paket. State memakai store kecil ala Zustand (js/store.js).
