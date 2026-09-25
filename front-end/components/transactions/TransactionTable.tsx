"use client";
import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteEntity } from "@/components/ui/DeleteEntity";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate, formatRupiah } from "@/lib/formatters";
import type { Transaction } from "@/types/finance";
export function TransactionTable({
  rows,
  readOnly = false,
}: {
  rows?: Transaction[];
  readOnly?: boolean;
}) {
  const {
    state: { transactions: all, categories, accounts },
  } = useFinance();
  const transactions = rows ?? all;
  const [detail, setDetail] = useState<Transaction | null>(null);
  if (!transactions.length)
    return (
      <EmptyState
        title="Belum ada transaksi"
        description="Tidak ada transaksi untuk pilihan ini."
      />
    );
  return (
    <>
      <div
        className="table-scroll"
        role="region"
        aria-label="Tabel transaksi, geser horizontal pada layar kecil"
        tabIndex={0}
      >
        <table>
          <caption className="sr-only">Transaksi MyFinance</caption>
          <thead>
            <tr>
              <th>Transaksi</th>
              <th>Kategori</th>
              <th>Jenis</th>
              <th>Akun</th>
              <th>Tanggal</th>
              <th className="align-right">Jumlah</th>
              {!readOnly && <th className="align-right no-print">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {transactions.map((row) => {
              const category = categories.find(
                (item) => item.id === row.categoryId,
              );
              return (
                <tr key={row.id}>
                  <td>
                    <div className="transaction-name">
                      <CategoryIcon name={category?.icon} />
                      <div>
                        <strong>{row.description}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{category?.name}</td>
                  <td>
                    <Badge tone={row.type}>
                      {row.type === "income" ? "Pemasukan" : "Pengeluaran"}
                    </Badge>
                  </td>
                  <td>
                    {accounts.find((item) => item.id === row.accountId)?.name}
                  </td>
                  <td>{formatDate(row.date)}</td>
                  <td
                    className={`align-right amount ${row.type === "income" ? "text-income" : "text-expense"}`}
                  >
                    {row.type === "income" ? "+" : "−"}
                    {formatRupiah(row.amount)}
                  </td>
                  {!readOnly && (
                    <td className="no-print">
                      <div className="table-actions">
                        <Button
                          variant="ghost"
                          aria-label={`Detail ${row.description}`}
                          onClick={() => setDetail(row)}
                        >
                          <Eye size={15} />
                        </Button>
                        <Link
                          href={`/transactions/${row.id}/edit`}
                          className="button button-ghost"
                          aria-label={`Edit ${row.description}`}
                        >
                          <Pencil size={15} />
                        </Link>
                        <DeleteEntity
                          kind="TRANSACTION"
                          id={row.id}
                          name={row.description}
                        />
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Modal
        title="Detail transaksi"
        open={!!detail}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <dl className="detail-list">
            <div>
              <dt>Deskripsi</dt>
              <dd>{detail.description}</dd>
            </div>
            <div>
              <dt>Tanggal</dt>
              <dd>{formatDate(detail.date)}</dd>
            </div>
            <div>
              <dt>Nominal</dt>
              <dd>{formatRupiah(detail.amount)}</dd>
            </div>
            <div>
              <dt>Jenis</dt>
              <dd>{detail.type === "income" ? "Pemasukan" : "Pengeluaran"}</dd>
            </div>
            <div>
              <dt>Kategori</dt>
              <dd>
                {categories.find((item) => item.id === detail.categoryId)?.name}
              </dd>
            </div>
            <div>
              <dt>Akun</dt>
              <dd>
                {accounts.find((item) => item.id === detail.accountId)?.name}
              </dd>
            </div>
            <div>
              <dt>Catatan</dt>
              <dd>{detail.note || "—"}</dd>
            </div>
          </dl>
        )}
      </Modal>
    </>
  );
}
