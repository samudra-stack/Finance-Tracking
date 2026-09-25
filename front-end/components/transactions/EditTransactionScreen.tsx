"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useFinance } from "@/contexts/FinanceContext";
import { TransactionForm } from "./TransactionForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
export function EditTransactionScreen() {
  const { id } = useParams<{ id: string }>();
  const {
    state: { transactions },
  } = useFinance();
  const transaction = transactions.find((item) => item.id === id);
  return transaction ? (
    <TransactionForm key={id} transaction={transaction} />
  ) : (
    <Card>
      <EmptyState
        title="Transaksi tidak ditemukan"
        description="ID ini tidak tersedia. Pilih transaksi dari daftar untuk mengedit."
      />
      <div className="center">
        <Link href="/transactions" className="button button-secondary">
          Kembali ke transaksi
        </Link>
      </div>
    </Card>
  );
}
