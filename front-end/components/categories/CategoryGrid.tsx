"use client";
import { useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { EntityEditor } from "@/components/ui/EntityEditor";
import { DeleteEntity } from "@/components/ui/DeleteEntity";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { categoryTotals } from "@/lib/calculations";
import { formatRupiah } from "@/lib/formatters";
export function CategoryGrid() {
  const { state } = useFinance();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const rows = categoryTotals(state.transactions, state.categories)
    .filter((c) =>
      c.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    )
    .sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name) : b.total - a.total,
    );
  return (
    <>
      <div className="filter-bar category-filter">
        <Input
          label="Cari kategori"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-field"
        />
        <Select
          label="Urutkan"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="name">Nama kategori</option>
          <option value="total">Nominal terbesar</option>
        </Select>
      </div>
      {!rows.length && (
        <EmptyState
          title="Belum ada kategori"
          description="Klik Tambah untuk membuat kategori pemasukan atau pengeluaran."
        />
      )}
      <div className="entity-grid">
        {rows.map((c) => (
          <Card key={c.id} className="category-card">
            <div className="entity-card-top">
              <span style={{ color: c.color }}>
                <CategoryIcon name={c.icon} />
              </span>
              <div className="table-actions">
                <EntityEditor entity="kategori" item={c} />
                <DeleteEntity kind="CATEGORY" id={c.id} name={c.name} />
              </div>
            </div>
            <h2>{c.name}</h2>
            <p>{c.count} transaksi seluruh periode</p>
            <Badge tone={c.type}>
              {c.type === "income" ? "Pemasukan" : "Pengeluaran"}
            </Badge>
            <strong className="entity-value">{formatRupiah(c.total)}</strong>
            <div className="progress-track">
              <span style={{ width: "100%", background: c.color }} />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
