"use client";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useFinance } from "@/contexts/FinanceContext";
import { defaultQuery, type TransactionQuery } from "@/lib/calculations";
export function TransactionFilter({
  query,
  onChange,
}: {
  query: TransactionQuery;
  onChange: (value: TransactionQuery) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const {
    state: { categories, accounts },
  } = useFinance();
  const update = (key: keyof TransactionQuery, value: string) =>
    onChange({ ...query, [key]: value });
  return (
    <div className="filter-form no-print">
      <div className="filter-bar">
        <Input
          label="Cari transaksi"
          type="search"
          placeholder="Cari deskripsi transaksi..."
          className="search-field"
          value={query.search}
          onChange={(e) => update("search", e.target.value)}
        />
        <Select
          label="Jenis"
          value={query.type}
          onChange={(e) =>
            onChange({ ...query, type: e.target.value, categoryId: "" })
          }
        >
          <option value="">Semua tipe</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </Select>
        <Select
          label="Kategori"
          value={query.categoryId}
          onChange={(e) => update("categoryId", e.target.value)}
        >
          <option value="">Semua kategori</option>
          {categories
            .filter((c) => !query.type || c.type === query.type)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </Select>
        <Button
          variant="secondary"
          aria-expanded={expanded}
          aria-controls="advanced-filters"
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal size={16} />
          Filter
        </Button>
      </div>
      {expanded && (
        <div id="advanced-filters" className="advanced-filters">
          <Select
            label="Akun"
            value={query.accountId}
            onChange={(e) => update("accountId", e.target.value)}
          >
            <option value="">Semua akun</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
          <Input
            label="Tanggal awal"
            type="date"
            value={query.from}
            onInput={(e) => update("from", e.currentTarget.value)}
          />
          <Input
            label="Tanggal akhir"
            type="date"
            value={query.to}
            onInput={(e) => update("to", e.currentTarget.value)}
            error={
              query.from && query.to && query.from > query.to
                ? "Tanggal akhir harus setelah atau sama dengan tanggal awal."
                : undefined
            }
          />
          <Select
            label="Urutkan"
            value={query.sort}
            onChange={(e) => update("sort", e.target.value)}
          >
            <option value="date-desc">Tanggal terbaru</option>
            <option value="date-asc">Tanggal terlama</option>
            <option value="amount-desc">Nominal terbesar</option>
            <option value="amount-asc">Nominal terkecil</option>
          </Select>
        </div>
      )}
      <div className="filter-caption">
        <span>Filter diterapkan langsung</span>
        <Button variant="ghost" onClick={() => onChange({ ...defaultQuery })}>
          Bersihkan filter
        </Button>
      </div>
    </div>
  );
}
