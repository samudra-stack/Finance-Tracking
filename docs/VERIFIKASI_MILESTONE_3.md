# Verifikasi Milestone 3 — 23–24 September 2026

Catatan lanjutan: perilaku sesi, foto profil, dan akun nonaktif telah disempurnakan setelah pemeriksaan ini. Lihat [Verifikasi penyempurnaan 24–25 September](VERIFIKASI_PENYEMPURNAAN.md) untuk keadaan terbaru; tabel berikut mempertahankan catatan historis Milestone 3.

Implementasi mengikuti plan 12 tahap yang disetujui. Perubahan baru tidak di-stage; baseline Milestone 2 tetap berada di index Git. Tidak dilakukan commit, push, deploy, pemasangan dependency produksi baru, backend, database, Route Handler, atau Server Actions.

## Hasil per tahap

| Tahap | Implementasi | Bukti pemeriksaan |
|---|---|---|
| 1. Fondasi data | Seed 30 transaksi, tiga bulan, 10 kategori, 4 akun, 5 anggaran, profil | Tes jumlah, ID unik, dan seluruh relasi lulus |
| 2. State/storage | FinanceProvider, useReducer, storage adapter, schema dan relasi tervalidasi, fallback memori | Tes missing key, array kosong, JSON/schema/relasi rusak, baca diblokir dan gagal tulis lulus; CRUD bertahan setelah reload browser |
| 3. Sesi | Login/logout simulasi, guard setelah mount, Ingat saya, tidak menyimpan password | Login input salah menghasilkan error per field; login valid dan refresh dashboard berhasil; setelah logout direct URL akun kembali ke `/`; checkbox Ingat saya tetap terpilih. Isi field login disamarkan oleh alat browser; kontrak storage sesi diperiksa melalui tes dan source |
| 4. Transaksi | Tambah, detail, edit, hapus, konfirmasi batal, validasi terpusat | Browser menambah QA Transaksi Rp100.000, melihat catatan, mengedit Rp200.000, refresh, membatalkan hapus, lalu menghapus dan refresh. Form kosong menampilkan error nominal/deskripsi/kategori/akun |
| 5. Kategori/akun | CRUD, jumlah relasi, saldo awal, status akun | Browser tambah → edit → refresh → hapus untuk entitas bebas. Penghapusan Makanan & Minuman ditolak (3 transaksi, 1 anggaran); BCA berelasi juga diblokir. Duplikat kategori dan perubahan jenis berelasi diuji otomatis |
| 6. Anggaran | CRUD kategori pengeluaran, kategori–bulan unik, penggunaan dari transaksi | Browser Kesehatan Rp500.000 menunjukkan 105% Terlampaui; edit Rp1.000.000 bertahan setelah refresh dengan 52,5% Aman; hapus berhasil. Tes batas 79%, 80%, 100%, 100,01% lulus |
| 7. Selektor | Saldo akun/total, income/expense/net, penggunaan anggaran, agregasi kategori/bulan | Tes kosong, multi-akun, lintas bulan dan perubahan transaksi lulus. Browser saldo dashboard dan akun sama Rp815.000 dari saldo awal Rp1.000.000 dikurangi Rp160.000 dan Rp25.000 |
| 8. Daftar transaksi | Cari deskripsi, jenis/kategori/akun/tanggal, empat urutan, pagination 10 baris | Browser halaman 2 dari 3 kembali ke halaman 1 saat mencari Gaji (3 hasil). Filter tanggal 31 Agustus menampilkan satu transaksi. Tes kombinasi filter, urutan, pagination, dan clamp setelah data berkurang lulus |
| 9. Dashboard/grafik | Ringkasan bulan berjalan, arus kas enam bulan terakhir, kategori, terbaru, anggaran | Setelah edit transaksi menjadi Rp160.000: pengeluaran September Rp160.000, saldo Rp815.000, sisa anggaran Rp40.000, progress 80% Hampir habis; label grafik juga berubah. Empty state grafik tidak menimbulkan error |
| 10. Laporan | Rentang inklusif tervalidasi, total/net, tren, kategori, seluruh tabel, window.print dan CSS cetak | Bug pembacaan input tanggal ditemukan dan diperbaiki dengan FormData. Uji ulang tanggal terbalik menampilkan error; 31 Agustus–23 September mencakup dua transaksi dengan total Rp125.000; rentang 2025 kosong. Tombol cetak diklik tanpa error JS, tetapi dialog/pratinjau native tidak tersedia pada browser alat uji; hasil printer/PDF belum disertifikasi |
| 11. Pengaturan/reset | Profil, tema gelap/terang, dialog daftar empat koleksi, reset kosong | Nama/email profil dan tema terang bertahan setelah reload. Dialog reset menampilkan jumlah 30/10/4/5; setelah konfirmasi dan tiga refresh menjadi 0/0/0/0. Profil dan tema tetap. Form transaksi kosong diblokir dengan panduan; membuat kategori → akun → transaksi dari nol berhasil dan persisten |
| 12. Pemeriksaan akhir | Tes fungsi murni, lint, TypeScript, build, browser, keyboard, responsif | Lihat quality check dan batas verifikasi di bawah |

## Quality check

Verifikasi akhir dilanjutkan pada 24 September 2026 setelah sesi sebelumnya terhenti karena limit penggunaan. Seluruh perubahan terakhir telah tercakup dalam build dan pemeriksaan di bawah.

- `yarn test`: **lulus 14/14**, tanpa dependency test tambahan. Mencakup seed, seluruh reducer CRUD, validasi, relasi, storage, sesi, perhitungan, sorting/filter/pagination, reset dan mulai dari kosong.
- `yarn lint`: **lulus**, pemeriksaan seluruh source; file test CommonJS diberi pengecualian khusus aturan import, bukan pengecualian aplikasi.
- `yarn typecheck`: **lulus**, TypeScript tanpa emit/incremental.
- `yarn build`: build produksi Next.js berhasil dengan pemeriksaan TypeScript aktif. Percobaan sandbox awal terhalang `spawn EPERM`; build dijalankan ulang melalui izin proses di luar sandbox.
- `git diff --check`: **lulus**. Git masih tanpa commit; 92 file staged baseline tidak diubah.

## Pemeriksaan browser

Server produksi uji memakai `http://localhost:3013` agar reset tidak menyentuh storage port 3000. Semua data QA sintetis.

Pemeriksaan final 24 September menggunakan build baru di `http://127.0.0.1:3014`, terpisah dari origin aplikasi pengguna. Hasil:

- Guard mengembalikan direct URL laporan tanpa sesi ke login; login valid membuka dashboard.
- Tanggal laporan terbalik menghasilkan error. Rentang 1 Juli–30 September mencakup seluruh 30 transaksi seed: pemasukan Rp22.500.000, pengeluaran Rp6.300.000, net Rp16.200.000.
- Modal detail menampilkan tanggal, nominal, jenis, kategori, akun, dan catatan transaksi dengan benar.
- Reset diikuti tiga refresh kembali menghasilkan transaksi/kategori/akun/anggaran masing-masing **0**; panduan awal tersedia dan tombol simpan transaksi nonaktif sebelum prasyarat tersedia.
- Tidak ada log error atau warning browser pada pemeriksaan final. Tab dan server uji final ditutup setelah selesai.

- Seluruh sepuluh route diperiksa pada 1440, 1024, 768, dan 375 px: tidak ada overflow horizontal halaman. Tabel tetap dapat digeser pada layar kecil.
- Modal kategori pada keempat ukuran muat di viewport; Tab dari tombol terakhir kembali ke tombol pertama, Escape menutup dialog, dan fokus kembali ke pemicu.
- Drawer mobile dapat dibuka/ditutup dengan Escape. Route edit ID hilang menampilkan “Transaksi tidak ditemukan”; route tak dikenal menampilkan 404.
- Browser tidak mencatat error aplikasi pada alur yang diuji; tidak ditemukan hydration error.
- Uji cetak native terbatas: hanya Codex In-app Browser tersedia. Permintaan membuka Chrome tidak tersedia; tidak ada perubahan pada pengaturan browser pengguna untuk mengakalinya.

## Batas yang masih ada

1. Pratinjau printer/PDF perlu pemeriksaan manual pada browser biasa: buka Laporan, pilih periode, klik Cetak laporan, periksa ringkasan/tabel dan pemisahan halaman sebelum menyimpan PDF. Implementasi tombol/CSS tersedia, tetapi hasil native belum diverifikasi.
2. Kesesuaian pixel terhadap Figma aktif tetap belum disertifikasi; desain memakai baseline dan screenshot lokal Milestone 2.
3. Sesi hanya simulasi client-side. Data terikat origin/browser; storage diblokir atau kuota penuh berarti fallback memori dan banner, bukan jaminan persistensi.

## Uji ulang reset secara manual

1. Masuk dengan email valid dan password contoh minimal enam karakter.
2. Pengaturan → Tentang & reset data → Reset data → Kosongkan semua.
3. Refresh beberapa kali. Dashboard tetap nol, semua koleksi kosong, dan panduan awal tetap tampil.
4. Buat kategori sesuai jenis transaksi, lalu akun beserta saldo awal.
5. Tambah transaksi; refresh; pastikan transaksi tersimpan dan saldo berubah sesuai nominal.

Menghapus key storage secara manual berbeda dengan reset aplikasi: key yang benar-benar tidak ada memang memicu seed kunjungan pertama.
