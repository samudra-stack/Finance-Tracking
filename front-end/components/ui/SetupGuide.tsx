"use client";
import Link from "next/link";
import { useFinance } from "@/contexts/FinanceContext";
export function SetupGuide() {
  const { state } = useFinance();
  if (state.categories.length && state.accounts.length) return null;
  return (
    <section className="setup-guide" aria-label="Persiapan transaksi">
      <h2>Mulai pencatatan dari awal</h2>
      <p>
        Data Anda kosong atau belum lengkap. Buat kategori dan akun terlebih
        dahulu sebelum menambah transaksi.
      </p>
      <ol>
        <li>
          <Link href="/categories">
            Buat kategori pemasukan atau pengeluaran
          </Link>
          {state.categories.length ? " ✓" : ""}
        </li>
        <li>
          <Link href="/accounts">Buat akun dan isi saldo awal</Link>
          {state.accounts.length ? " ✓" : ""}
        </li>
        <li>Setelah keduanya tersedia, buka Tambah transaksi.</li>
      </ol>
    </section>
  );
}
