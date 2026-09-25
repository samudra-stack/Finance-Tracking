"use client";
import { useFinance } from "@/contexts/FinanceContext";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { EntityEditor } from "@/components/ui/EntityEditor";
import { DeleteEntity } from "@/components/ui/DeleteEntity";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRupiah } from "@/lib/formatters";
import { accountBalance, totalBalance } from "@/lib/calculations";
export function AccountGrid() {
  const { state } = useFinance();
  return (
    <>
      <Card className="accent-card account-total">
        <div>
          <h2>Total saldo akun</h2>
          <p>
            {state.accounts.length} akun · saldo awal + pemasukan − pengeluaran
          </p>
        </div>
        <strong>{formatRupiah(totalBalance(state))}</strong>
      </Card>
      {!state.accounts.length && (
        <EmptyState
          title="Belum ada akun"
          description="Buat akun dan isi saldo awal sebelum menambah transaksi."
        />
      )}
      <div className="entity-grid">
        {state.accounts.map((a) => (
          <Card key={a.id} className="account-card">
            <div className="entity-card-top">
              <CategoryIcon name={a.icon} />
              <Badge tone={a.isActive ? "income" : "neutral"}>
                {a.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
            <h2>{a.name}</h2>
            <p>
              {a.type === "bank"
                ? "Rekening bank"
                : a.type === "cash"
                  ? "Tunai"
                  : "E-wallet"}
            </p>
            <strong className="entity-value">
              {formatRupiah(accountBalance(a, state.transactions))}
            </strong>
            <div className="account-bottom">
              <span>Saldo awal {formatRupiah(a.initialBalance)}</span>
              <div className="table-actions">
                <EntityEditor entity="akun" item={a} />
                <DeleteEntity kind="ACCOUNT" id={a.id} name={a.name} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
