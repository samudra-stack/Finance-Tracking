# Verifikasi Milestone 2

Tanggal: 22 September 2026. Lingkungan: Windows, Node.js 24.21.0, Yarn 1.22.22, Next.js 16.3.5, React 19.2.8.

## Quality check

- `yarn lint`: lulus.
- `yarn typecheck`: lulus, tanpa emit atau incremental cache.
- `yarn build`: lulus. Sandbox awal memblokir worker dengan `spawn EPERM`; build berhasil dijalankan dengan izin subprocess. Tidak ada pemeriksaan TypeScript yang dinonaktifkan.
- Entry point CLI dalam script Yarn ditulis eksplisit melalui Node karena resolusi executable `.bin` pada lingkungan audit gagal. Dependency tetap dikelola Yarn dan terkunci dalam `yarn.lock`.
- Peer dependency Lucide React 1.47.0 dan react-chartjs-2 5.3.1 mencakup React 19; Chart.js 4.5.1 sesuai rentang wrapper.

## Routing dan layout browser

Kesepuluh route diperiksa pada viewport 1440, 1024, 768, dan 375 px: Login, Dashboard, Transaksi, Tambah Transaksi, Edit Transaksi (`demo-1`), Kategori, Akun, Anggaran, Laporan, dan Pengaturan. Heading dan judul halaman tampil sesuai route. Tidak ada overflow horizontal pada dokumen setelah perbaikan canvas render awal. Tabel dan navigasi tab pengaturan memiliki scroll internal saat diperlukan.

Pemeriksaan visual mencakup Login dan Dashboard desktop; Pengaturan desktop/laptop/tablet/mobile; Laporan pada laptop; serta Dashboard, Transaksi, form edit, drawer, dan konfirmasi hapus pada mobile. Referensi visual berasal dari screenshot lokal, bukan hasil ekspor Figma aktif.

## Interaksi yang diverifikasi

- Input Login kosong menampilkan error email dan password di bawah field; tombol tampil/sembunyikan password mengubah tipe input.
- Email dan password contoh yang valid membuka Dashboard tanpa menyimpan sesi.
- Drawer mobile membuka navigasi dan menutup setelah pemilihan menu. Tab/Shift+Tab tetap di dalam dialog; Escape menutup dan mengembalikan fokus ke pemicu.
- Pratinjau hapus menampilkan konfirmasi, lalu toast; jumlah transaksi tetap enam.
- Form edit `demo-1` memuat Makan siang dan nominal 85000. Perubahan jenis menyesuaikan pilihan kategori; submit menampilkan pemberitahuan belum disimpan.
- ID edit yang tidak dikenal menampilkan empty state; URL yang tidak dikenal menampilkan halaman 404.
- Console browser tidak menunjukkan error/warning aplikasi pada pemeriksaan interaksi.

## Batas hasil

Figma frame `9:3` tidak dapat diambil karena kuota MCP paket Starter habis. Kesesuaian pixel dan rancangan mobile terhadap file aktif belum diverifikasi. Wordmark menggunakan teks/CSS; favicon sementara menggunakan aset Lucide resmi, bukan logo vektor final Figma.

CRUD, penyimpanan, AuthGuard, filter data, pagination multi-halaman, perhitungan laporan, cetak, dan tema dinamis tidak diuji sebagai fitur aktif karena merupakan Milestone 3. Angka ringkasan/grafik adalah snapshot demonstrasi dan belum diturunkan dari transaksi. Interaksi data diberi keterangan pratinjau.

## Repository

Root Git: `S:/MyFinance`. Dokumentasi dan aplikasi berada dalam satu repository. `.gitignore` mengecualikan dependency, `.next`, output build, environment lokal, serta `.verification`. Tidak ada remote, commit awal, atau deployment yang dibuat pada tahap ini.

## Pemeriksaan ulang — 23 September 2026

- Implementasi sebelumnya tetap utuh; tidak ada perubahan source aplikasi yang belum masuk staging saat pemeriksaan dimulai.
- `yarn lint`, `yarn typecheck`, dan `yarn build` kembali lulus. Build menghasilkan sepuluh route aplikasi dan halaman not-found; route edit dinamis tersedia.
- Server dev yang sebelumnya sudah berhenti dinyalakan kembali pada `http://127.0.0.1:3000`.
- Sepuluh route diuji ulang pada empat lebar (1440, 1024, 768, 375 px): 40 pemeriksaan berhasil, tanpa overflow horizontal dokumen. Console browser tidak menampilkan error/warning aplikasi selama pengujian route.
- Drawer kembali lulus pemeriksaan fokus Shift+Tab dan pengembalian fokus melalui Escape. Pratinjau hapus mempertahankan enam transaksi (tujuh baris tabel termasuk header). Empty state ID edit dan halaman 404 kembali tampil benar.
- Konektor Figma dicoba kembali dengan file dan node `9:3` yang diberikan pengguna. Respons terbaru menyatakan tidak ada layer terpilih. Jadi, hambatan saat ini tidak dapat dinyatakan semata-mata sebagai kuota; verifikasi file Figma aktif tetap belum selesai.
- Next.js menghasilkan `front-end/AGENTS.md` dan `front-end/CLAUDE.md` otomatis ketika dev server dimulai. Kedua panduan dipertahankan bersama project.
- Tidak diperlukan perubahan kode aplikasi baru dari pemeriksaan ini. Tidak ada commit, push, atau deployment yang dilakukan.
