"use client";
import { useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { BudgetProgress } from "./BudgetProgress";
import { Card } from "@/components/ui/Card";
import { EntityEditor } from "@/components/ui/EntityEditor";
import { DeleteEntity } from "@/components/ui/DeleteEntity";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { budgetUsage, currentMonth } from "@/lib/calculations";
import { formatRupiah } from "@/lib/formatters";
export function BudgetsScreen() {
  const { state } = useFinance();
  const [month, setMonth] = useState(currentMonth());
  const rows = state.budgets.filter((b) => b.month === month);
  const limit = rows.reduce((sum, b) => sum + b.limitAmount, 0);
  const spent = rows.reduce(
    (sum, b) => sum + budgetUsage(b, state.transactions).spent,
    0,
  );
  return (
    <>
      <PageHeader
        title="Anggaran"
        description="Tetapkan batas dan kendalikan pengeluaran"
        actions={<EntityEditor entity="anggaran" />}
      />
      <Input
        label="Bulan anggaran"
        type="month"
        value={month}
        onInput={(e) => setMonth(e.currentTarget.value)}
      />
      <div className="summary-grid three">
        <SummaryCard
          label="Total anggaran"
          value={formatRupiah(limit)}
          hint={`${rows.length} kategori`}
          icon="budget"
        />
        <SummaryCard
          label="Sudah digunakan"
          value={formatRupiah(spent)}
          hint="Pengeluaran dalam kategori yang dianggarkan"
          icon="expense"
        />
        <SummaryCard
          label="Sisa tersedia"
          value={formatRupiah(limit - spent)}
          hint="Batas dikurangi penggunaan"
          icon="income"
        />
      </div>
      {!rows.length && (
        <EmptyState
          title="Belum ada anggaran"
          description="Buat kategori pengeluaran, lalu tambahkan anggaran untuk periode ini."
        />
      )}
      <div className="budget-cards">
        {rows.map((b) => {
          const name = state.categories.find(
            (c) => c.id === b.categoryId,
          )!.name;
          const usage = budgetUsage(b, state.transactions);
          return (
            <Card key={b.id}>
              <div className="entity-card-top">
                <span>{b.month}</span>
                <div className="table-actions">
                  <EntityEditor entity="anggaran" item={b} />
                  <DeleteEntity kind="BUDGET" id={b.id} name={name} />
                </div>
              </div>
              <BudgetProgress
                name={name}
                spent={usage.spent}
                limit={b.limitAmount}
              />
              <p>Sisa: {formatRupiah(usage.remaining)}</p>
            </Card>
          );
        })}
      </div>
    </>
  );
}
