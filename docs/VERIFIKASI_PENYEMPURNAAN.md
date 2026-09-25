# Verifikasi penyempurnaan MyFinance — 24–25 September 2026

Implementasi menyelesaikan plan audit yang disetujui: logout yang mudah ditemukan, sesi per tab, penjelasan IDR, foto profil lokal, dan konsistensi akun nonaktif. Tidak ada commit, push, deploy, dependency baru, backend, atau autentikasi server. Baseline yang sudah berada di index Git tetap dipertahankan; perubahan lanjutan tidak di-stage.

## Fitur dan bukti pemeriksaan

| Fitur | Hasil |
|---|---|
| Menu Profil/Keluar | Header membuka menu Profil dan Keluar. Navigasi Profil berhasil. Logout header mengembalikan dua tab terbuka ke login; logout drawer ponsel juga berhasil. Sidebar desktop memakai komponen logout yang sama. |
| Sesi per tab | Refresh tab tetap masuk. Tab independen baru yang mengakses dashboard meminta login. Pada pemeriksaan lanjutan setelah sesi alat sebelumnya berakhir, dashboard langsung kembali ke login. Direct URL setelah logout ditolak; Back pada alur uji tidak membuka kembali konten dashboard. |
| Ingat email dan migrasi | Login dengan email diingat mengisi formulir tab baru; login cukup dengan memasukkan password contoh. Tanpa Ingat email, tab baru menampilkan checkbox tidak terpilih. Tes memverifikasi email lama dipertahankan, status loggedIn lama diabaikan, data keuangan tetap utuh, dan sesi tab lama tetap tidak berlaku setelah logout lalu login baru. |
| Foto profil | PNG sintetis berhasil diunggah dan muncul pada header, sidebar, serta profil. Gambar hasil berukuran 256×256 dengan data URL 1.699 karakter. Refresh, logout/login, dan reset mempertahankan foto. File lebih dari 5 MB ditolak tanpa mengganti foto sebelumnya. Hapus foto lalu refresh mengembalikan seluruh avatar ke inisial. |
| Validasi foto/storage | Tes tipe file tidak didukung, batas ukuran, data tersimpan tidak valid, kegagalan kuota, simpan/hapus, dan isolasi dari data keuangan lulus. JPEG/PNG/WebP diterima oleh validator; decode/crop di browser diuji memakai PNG. Kegagalan kuota diuji dengan storage tiruan, bukan memenuhi storage pengguna. |
| IDR | Preferensi menampilkan informasi tetap bahwa nominal dicatat dalam IDR dan konversi belum tersedia. Tidak ada dropdown kurs atau perubahan nominal. |
| Akun nonaktif | Setelah BCA dinonaktifkan pada data sintetis, form transaksi baru hanya menyediakan akun aktif. Transaksi historis BCA tetap menampilkan pilihan BCA (nonaktif); perubahan catatan berhasil disimpan. Tes menolak transaksi baru atau perpindahan ke akun nonaktif, serta menerima edit dengan akun historis asal. |
| Kejelasan demo | Login menjelaskan bahwa email tidak membuat akun server atau memisahkan data. Pendaftaran, pemulihan password, dan ikon notifikasi tanpa fungsi nyata dihapus. |
| Reset kosong | Reset data sintetis 30 transaksi/10 kategori/4 akun/5 anggaran lalu refresh menampilkan panduan kategori → akun → transaksi. Foto tetap ada. Pada kunjungan uji keesokan hari, saldo masih Rp0 dan koleksi tetap kosong tanpa seed kembali. |

## Pemeriksaan kualitas

- `yarn test`: **19/19 lulus** pada 24 September, mencakup aturan Milestone 3 serta sesi, migrasi, foto, dan akun nonaktif.
- `yarn lint`: **lulus**.
- `yarn typecheck`: **lulus**.
- `yarn build`: **lulus**, pemeriksaan TypeScript aktif. Percobaan sandbox sempat gagal `spawn EPERM`; pengulangan dengan izin menjalankan worker berhasil.
- Browser memakai build produksi di `http://127.0.0.1:3016` dan data sintetis; origin `localhost:3000` pengguna tidak diubah.
- Menu profil dan halaman dashboard kosong diperiksa pada lebar **375, 768, 1024, 1440 px**: tidak ada overflow horizontal halaman; menu tetap dalam viewport. Halaman profil juga diperiksa pada ponsel.
- Tab/Escape pada menu profil bekerja; Escape menutup menu dan mengembalikan fokus ke pemicu. Drawer ponsel menyediakan tombol Keluar yang berfungsi.
- Log browser final: **tidak ada error atau warning** pada alur yang diuji.
- Pada 25 September, perubahan tambahan hanya dokumentasi dan pemeriksaan browser terhadap build yang sama; tidak ada perubahan source aplikasi setelah quality checks tersebut.

## Batas verifikasi dan penggunaan

1. Tombol Cetak laporan telah dipanggil tanpa error JavaScript, tetapi pratinjau native printer/PDF belum terverifikasi. Alat hanya menyediakan Codex In-app Browser. Periksa manual di Chrome/Edge: pilih periode laporan, klik Cetak laporan, cek ringkasan/tabel dan pemisahan halaman sebelum menyimpan PDF.
2. Login tetap simulasi client-side, bukan perlindungan data keuangan setara autentikasi server. Sesi per tab memakai sessionStorage; fitur restore tab browser dapat memulihkannya. Pengujian tidak mencakup semua kebijakan pemulihan browser atau penutupan seluruh aplikasi browser pengguna.
3. Data/foto tetap hanya di browser dan origin yang sama. Belum ada ekspor/impor cadangan, sinkronisasi perangkat, atau database. Storage diblokir/penuh dapat membatasi persistensi dan sinkronisasi logout; aplikasi memberikan pesan kegagalan.
4. Tidak ada konversi mata uang. Seluruh nilai tetap IDR. Kesesuaian pixel dengan Figma aktif tetap di luar sertifikasi ini.

Implementasi terkait: `lib/session.ts`, `lib/avatar.ts`, `contexts/FinanceContext.tsx`, komponen avatar/menu/pengaturan, dan validasi transaksi. Dokumentasi penggunaan terbaru tersedia di [README front-end](../front-end/README.md).
