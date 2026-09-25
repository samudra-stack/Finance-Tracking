# MyFinance

Aplikasi manajemen keuangan pribadi untuk Project-Based Learning Pemrograman Web II.

## Menjalankan aplikasi

Gunakan Node.js 24 dan Yarn 1.22.22. Jalankan dari folder `front-end`:

```sh
yarn install --frozen-lockfile
yarn dev
```

Buka http://localhost:3000. Pemeriksaan kualitas: `yarn lint`, `yarn typecheck`, dan `yarn build`.

## Status

Milestone 3 telah diimplementasikan: CRUD transaksi, kategori, akun, dan anggaran; validasi relasi; sesi simulasi; pencarian/filter/sorting/pagination; dashboard dan laporan dinamis; profil serta tema persisten. Context dan useReducer menggunakan localStorage, tanpa backend, database, Route Handler, atau Server Actions.

Reset “Kosongkan semua” menyimpan empat koleksi kosong, mempertahankan profil/tema/sesi, dan menampilkan panduan membuat kategori serta akun sebelum transaksi. Seed hanya dibuat saat key data belum ada, bukan ketika koleksi kosong. Pengujian fungsi murni: `yarn test` dari `front-end`. Hasil lengkap dan batas verifikasi cetak: [VERIFIKASI_MILESTONE_3.md](docs/VERIFIKASI_MILESTONE_3.md). Tidak ada commit, push, atau deploy dalam pelaksanaan ini.

Penyempurnaan 24–25 September 2026 menambahkan menu Profil/Keluar, sesi per tab melalui sessionStorage dan logout lintas tab, “Ingat email”, unggah/hapus foto profil lokal, penjelasan IDR tanpa konversi, serta larangan akun nonaktif pada transaksi baru. Login tetap demo tanpa akun server. Hasil 19 tes, pemeriksaan build, dan browser: [VERIFIKASI_PENYEMPURNAAN.md](docs/VERIFIKASI_PENYEMPURNAAN.md).

Sumber utama: [PERANCANGAN.md](docs/PERANCANGAN.md). Referensi visual: screenshot Figma di `docs/images`.

Satu repository mencakup `docs` dan `front-end`. Aset aplikasi berada di `front-end/public`; folder `assets` lama dipertahankan. Vercel menggunakan Root Directory `front-end`; static export tidak diaktifkan karena route edit dinamis.
