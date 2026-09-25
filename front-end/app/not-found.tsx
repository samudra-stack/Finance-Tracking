import Link from "next/link";
export default function NotFound() {
  return (
    <main className="not-found">
      <span className="eyebrow">MYFINANCE · 404</span>
      <h1>Halaman tidak ditemukan</h1>
      <p>
        Alamat ini tidak tersedia. Kembali untuk melihat ringkasan keuangan
        Anda.
      </p>
      <Link href="/dashboard" className="button button-primary">
        Kembali ke Dashboard
      </Link>
    </main>
  );
}
