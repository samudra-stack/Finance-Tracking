"use client";
import Link from "next/link";
import { useFinance } from "@/contexts/FinanceContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageActions } from "@/components/layout/PageActions";
import { SummaryCard } from "./SummaryCard";
import { FinanceChart } from "./FinanceChart";
import { CategoryChart } from "./CategoryChart";
import { RecentTransactions } from "./RecentTransactions";
import { BudgetProgress } from "@/components/budgets/BudgetProgress";
import { Card } from "@/components/ui/Card";
import { SetupGuide } from "@/components/ui/SetupGuide";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  budgetUsage,
  currentMonth,
  localDate,
  totals,
  totalBalance,
} from "@/lib/calculations";
import { formatRupiah } from "@/lib/formatters";
export function DashboardScreen() {
  const { state } = useFinance();
  const month = currentMonth();
  const rows = state.transactions.filter((t) => t.date.startsWith(month));
  const summary = totals(rows);
  const budgets = state.budgets.filter((b) => b.month === month);
  const remaining = budgets.reduce(
    (sum, b) => sum + budgetUsage(b, state.transactions).remaining,
    0,
  );
  const now = new Date();
  const from = localDate(new Date(now.getFullYear(), now.getMonth() - 5, 1));
  const trend = state.transactions.filter(
    (t) => t.date >= from && t.date.slice(0, 7) <= month,
  );
  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Ringkasan finansial bulan ${month}`}
        actions={<PageActions addHref="/transactions/new" />}
      />
      <SetupGuide />
      <div className="summary-grid">
        <SummaryCard
          label="Total saldo"
          value={formatRupiah(totalBalance(state))}
          hint="Seluruh akun dan transaksi"
        />
        <SummaryCard
          label="Pemasukan bulan ini"
          value={formatRupiah(summary.income)}
          hint={month}
          icon="income"
        />
        <SummaryCard
          label="Pengeluaran bulan ini"
          value={formatRupiah(summary.expense)}
          hint={month}
          icon="expense"
        />
        <SummaryCard
          label="Sisa anggaran"
          value={formatRupiah(remaining)}
          hint={`${budgets.length} anggaran bulan ini`}
          icon="budget"
        />
      </div>
      <div className="dashboard-grid">
        <Card>
          <div className="card-heading">
            <h2>Arus kas</h2>
            <span>6 bulan terakhir</span>
          </div>
          <FinanceChart rows={trend} />
        </Card>
        <Card>
          <div className="card-heading">
            <h2>Pengeluaran per kategori</h2>
            <span>{month}</span>
          </div>
          <CategoryChart rows={rows} categories={state.categories} />
        </Card>
        <Card>
          <div className="card-heading">
            <h2>Transaksi terbaru</h2>
            <Link href="/transactions">Lihat semua ↗</Link>
          </div>
          <RecentTransactions />
        </Card>
        <Card>
          <div className="card-heading">
            <h2>Anggaran bulan ini</h2>
            <Link href="/budgets">Lihat anggaran ↗</Link>
          </div>
          <div className="budget-list">
            {budgets.slice(0, 3).map((b) => (
              <BudgetProgress
                key={b.id}
                name={state.categories.find((c) => c.id === b.categoryId)!.name}
                spent={budgetUsage(b, state.transactions).spent}
                limit={b.limitAmount}
                compact
              />
            ))}
            {!budgets.length && (
              <EmptyState
                title="Belum ada anggaran"
                description="Tambahkan anggaran untuk bulan ini."
              />
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
