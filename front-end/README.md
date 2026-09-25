# MyFinance — Front-end

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Chart.js. Node.js 24 dan Yarn 1.22.22.

## Menjalankan

```sh
yarn install --frozen-lockfile
yarn dev
```

Buka http://localhost:3000. Semua perintah dijalankan dari folder `front-end`.

```sh
yarn test
yarn lint
yarn typecheck
yarn build
yarn start
```

Script memakai CLI lokal melalui Node untuk kompatibilitas Windows. Test memakai runner bawaan Node tanpa worker subprocess, serta compiler TypeScript yang sudah tersedia. Build Next.js memerlukan izin menjalankan worker; jika sandbox menghasilkan `spawn EPERM`, jalankan pada terminal yang mengizinkan proses Node. Pemeriksaan TypeScript tidak dinonaktifkan.

## Perilaku Milestone 3

- Login simulasi menerima email valid dan password contoh minimal enam karakter. Password tidak disimpan; email tidak membuat akun server atau memisahkan data pengguna. “Ingat email” hanya menyimpan email. Semua route dashboard dilindungi guard client-side; ini bukan autentikasi server.
- Seed awal: 30 transaksi tiga bulan, 10 kategori, 4 akun, 5 anggaran, dan profil. Bulan mengikuti waktu kunjungan pertama. ID contoh `seed-1` tersedia hanya sebelum seed dihapus.
- `myfinance_data_v1`: transaksi, kategori, akun, anggaran, dan `preference` (nama, email, IDR, tema).
- `myfinance_tab_session_v1` di sessionStorage: sesi per tab, tetap masuk setelah refresh. Tab baru meminta login; pemulihan tab oleh browser dapat memulihkan sesi.
- `myfinance_remembered_email_v1` dan `myfinance_logout_version_v1` di localStorage: email yang diingat dan penanda logout lintas tab. Key lama `myfinance_session_v1` hanya dibaca untuk migrasi email; status login lama diabaikan.
- Menu avatar header menyediakan Profil/Keluar, dan sidebar menyediakan tombol Keluar, termasuk drawer ponsel. Logout disinkronkan melalui storage event/BroadcastChannel dan pemeriksaan ulang saat tab aktif.
- `myfinance_avatar_v1` di localStorage: foto terpisah dari data keuangan. JPEG/PNG/WebP maksimal 5 MB dipotong tengah menjadi 256×256 dan disimpan sebagai JPEG data URL maksimal 200 KB. Unggah/hapus tersedia di Profil; kegagalan simpan mempertahankan foto sebelumnya, dan gambar tidak valid memakai inisial.
- Seed hanya dibuat jika key data tidak ada. Array kosong yang valid selalu dipertahankan. Reset mengosongkan transaksi/kategori/akun/anggaran dengan satu action; profil, foto, tema, dan sesi tetap ada. Logout juga mempertahankan data dan foto.
- JSON atau schema rusak memakai data kosong dalam memori dan tidak menimpa nilai lama. Banner menjelaskan kegagalan dan jalur reset. Kegagalan baca/tulis storage ditangkap; perubahan dalam memori dapat hilang setelah refresh.
- Kategori/akun berelasi tidak dapat dihapus. Jenis kategori tidak dapat diubah jika tidak cocok dengan transaksi/anggarannya. Anggaran hanya kategori pengeluaran dan unik per kategori–bulan.
- Akun nonaktif tidak dapat dipakai untuk transaksi baru atau tujuan pemindahan transaksi. Transaksi historis tetap dapat diedit dengan akun nonaktif asalnya.
- Saldo akun = saldo awal + pemasukan − pengeluaran. Saldo negatif diperbolehkan. Dashboard bulan berjalan, grafik enam bulan terakhir, serta laporan rentang inklusif menggunakan selektor yang sama.
- Laporan memuat semua transaksi pada rentang terpilih, tanpa pagination cetak. Tombol cetak memanggil `window.print()`; CSS cetak menyembunyikan navigasi dan kontrol. Pratinjau native printer/PDF belum terverifikasi di browser bawaan alat uji.
- Mata uang tetap IDR tanpa konversi kurs; pengaturan menampilkan penjelasan tetap, bukan dropdown. Tema gelap/terang tersedia. Ekspor/impor cadangan, privasi nominal, dan notifikasi eksternal belum tersedia. Tombol pendaftaran/pemulihan password serta ikon notifikasi demo telah dihapus.

## Struktur

- `app`: routing, metadata, layout, provider, stylesheet.
- `components`: UI, layout, form entitas, dan screen per fitur.
- `contexts/FinanceContext.tsx`: lifecycle browser, state reducer, persistensi dan sesi.
- `contexts/ToastContext.tsx`: umpan balik tindakan.
- `data/mock-data.ts`: seed dan state kosong.
- `lib/reducer.ts`, `validators.ts`, `storage.ts`, `calculations.ts`: aturan data dan fungsi murni.
- `tests/finance.test.cjs`: tes Node untuk seed, reducer, validasi, storage, serta perhitungan.
- `types/finance.ts`: kontrak entitas dan state.
- `public/fonts`, `public/icons`: font dan ikon lokal beserta lisensi.

[Perancangan](../docs/PERANCANGAN.md) · [Verifikasi Milestone 3](../docs/VERIFIKASI_MILESTONE_3.md) · [Verifikasi penyempurnaan](../docs/VERIFIKASI_PENYEMPURNAAN.md). Referensi visual tetap screenshot Figma lokal. Kesesuaian dengan file Figma aktif belum disertifikasi.
