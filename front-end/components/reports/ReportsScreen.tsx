"use client";
import { useState } from "react";
import { Printer } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FinanceChart } from "@/components/dashboard/FinanceChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import {
  categoryTotals,
  currentMonth,
  localDate,
  queryTransactions,
  defaultQuery,
  totals,
} from "@/lib/calculations";
import { validateDateRange } from "@/lib/validators";
import { formatRupiah } from "@/lib/formatters";
export function ReportsScreen() {
  const { state } = useFinance();
  const [range, setRange] = useState({
    from: `${currentMonth()}-01`,
    to: localDate(),
  });
  const [error, setError] = useState("");
  const rows = queryTransactions(state.transactions, {
    ...defaultQuery,
    ...range,
  });
  const summary = totals(rows);
  const categories = categoryTotals(rows, state.categories).filter(
    (c) => c.count,
  );
  return (
    <section className="report-content">
      <PageHeader
        title="Laporan"
        description="Analisis keuangan berdasarkan rentang tanggal"
        actions={
          <Button
            className="no-print"
            variant="secondary"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            Cetak laporan
          </Button>
        }
      />
      <form
        className="filter-bar no-print"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const draft = {
            from: String(form.get("from") ?? ""),
            to: String(form.get("to") ?? ""),
          };
          const issue = validateDateRange(draft.from, draft.to);
          if (issue) {
            setError(issue);
            return;
          }
          setError("");
          setRange(draft);
        }}
      >
        <Input
          label="Tanggal awal"
          type="date"
          name="from"
          defaultValue={range.from}
          required
        />
        <Input
          label="Tanggal akhir"
          type="date"
          name="to"
          defaultValue={range.to}
          error={error}
          required
        />
        <Button type="submit">Terapkan periode</Button>
      </form>
      <p className="report-period">
        {state.preference.name} · Periode {range.from} sampai {range.to}{" "}
        (inklusif) · {rows.length} transaksi
      </p>
      <div className="summary-grid three">
        <SummaryCard
          label="Pemasukan"
          value={formatRupiah(summary.income)}
          hint="Dalam periode terpilih"
          icon="income"
        />
        <SummaryCard
          label="Pengeluaran"
          value={formatRupiah(summary.expense)}
          hint="Dalam periode terpilih"
          icon="expense"
        />
        <SummaryCard
          label="Saldo bersih periode"
          value={formatRupiah(summary.net)}
          hint="Pemasukan dikurangi pengeluaran"
        />
      </div>
      <div className="dashboard-grid">
        <Card>
          <div className="card-heading">
            <h2>Tren pendapatan vs pengeluaran</h2>
          </div>
          <FinanceChart rows={rows} />
        </Card>
        <Card>
          <div className="card-heading">
            <h2>Komposisi pengeluaran</h2>
          </div>
          <CategoryChart rows={rows} categories={state.categories} />
        </Card>
      </div>
      <Card>
        <h2>Rincian kategori</h2>
        {!categories.length && <p>Tidak ada data pada periode ini.</p>}
        <dl className="detail-list">
          {categories.map((c) => (
            <div key={c.id}>
              <dt>
                {c.name} · {c.type === "income" ? "Pemasukan" : "Pengeluaran"} (
                {c.count})
              </dt>
              <dd>{formatRupiah(c.total)}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <div className="section-heading">
        <h2>Rincian transaksi</h2>
        <span>{rows.length} transaksi</span>
      </div>
      <TransactionTable rows={rows} readOnly />
    </section>
  );
}
