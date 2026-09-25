"use client";
import { useFinance } from "@/contexts/FinanceContext";
import { queryTransactions, defaultQuery } from "@/lib/calculations";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { formatRupiah } from "@/lib/formatters";
export function RecentTransactions() {
  const {
    state: { transactions: all, categories },
  } = useFinance();
  const transactions = queryTransactions(all, defaultQuery);
  if (!transactions.length)
    return (
      <EmptyState
        title="Belum ada transaksi"
        description="Tambahkan transaksi setelah membuat kategori dan akun."
      />
    );
  return (
    <div className="recent-list">
      {transactions.slice(0, 3).map((transaction) => {
        const category = categories.find(
          (item) => item.id === transaction.categoryId,
        );
        return (
          <div key={transaction.id} className="recent-row">
            <CategoryIcon name={category?.icon} />
            <div>
              <strong>{transaction.description}</strong>
              <small>{category?.name}</small>
            </div>
            <span
              className={
                transaction.type === "income" ? "text-income" : "text-expense"
              }
            >
              {transaction.type === "income" ? "+" : "−"}
              {formatRupiah(transaction.amount)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
