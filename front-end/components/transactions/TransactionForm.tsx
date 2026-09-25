"use client";
import Link from "next/link";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SetupGuide } from "@/components/ui/SetupGuide";
import { useToast } from "@/contexts/ToastContext";
import { useFinance } from "@/contexts/FinanceContext";
import { formatRupiah } from "@/lib/formatters";
import { validateTransaction, transactionAccountError, type Errors } from "@/lib/validators";
import { localDate } from "@/lib/calculations";
import type { Transaction, TransactionType } from "@/types/finance";
export function TransactionForm({
  transaction,
}: {
  transaction?: Transaction;
}) {
  const { state, execute } = useFinance();
  const { categories, accounts } = state;
  const notify = useToast();
  const router = useRouter();
  const noteId = useId();
  const [type, setType] = useState<TransactionType>(
    transaction?.type ?? "expense",
  );
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? "");
  const [accountId, setAccountId] = useState(transaction?.accountId ?? "");
  const [amount, setAmount] = useState(String(transaction?.amount ?? ""));
  const [errors, setErrors] = useState<Errors>({});
  const choices = categories.filter((c) => c.type === type);
  const availableAccounts = accounts.filter((a) => a.isActive || a.id === transaction?.accountId);
  return (
    <>
      <SetupGuide />
      <div className="form-layout">
        <Card>
          <h2 className="section-title">Detail transaksi</h2>
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const now = new Date().toISOString();
              const next: Transaction = {
                id: transaction?.id ?? crypto.randomUUID(),
                type,
                categoryId,
                accountId,
                amount: Number(amount),
                date: String(data.get("date")),
                description: String(data.get("description")).trim(),
                note: String(data.get("note")).trim(),
                createdAt: transaction?.createdAt ?? now,
                updatedAt: now,
              };
              const issues = validateTransaction(next, state);
              const accountIssue = transactionAccountError(next, state, transaction);
              if (accountIssue) issues.accountId = accountIssue;
              setErrors(issues);
              if (Object.keys(issues).length) return;
              const error = execute({
                type: transaction ? "UPDATE_TRANSACTION" : "ADD_TRANSACTION",
                payload: next,
              });
              if (error) {
                setErrors({ form: error });
                return;
              }
              notify(
                transaction
                  ? "Transaksi diperbarui."
                  : "Transaksi ditambahkan.",
              );
              router.push("/transactions");
            }}
          >
            <div className="form-grid">
              <Select
                label="Tipe transaksi"
                value={type}
                error={errors.type}
                onChange={(e) => {
                  setType(e.target.value as TransactionType);
                  setCategoryId("");
                }}
              >
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </Select>
              <Input
                label="Tanggal"
                name="date"
                type="date"
                defaultValue={transaction?.date ?? localDate()}
                error={errors.date}
                required
              />
              <Input
                label="Nama transaksi"
                name="description"
                defaultValue={transaction?.description}
                maxLength={120}
                error={errors.description}
                required
              />
              <Input
                label="Jumlah (Rp)"
                name="amount"
                type="number"
                min="0.01"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                error={errors.amount}
                required
              />
              <Select
                label="Kategori"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                error={errors.categoryId}
              >
                <option value="">Pilih kategori</option>
                {choices.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Akun sumber"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                error={errors.accountId}
              >
                <option value="">Pilih akun</option>
                {availableAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                    {a.isActive ? "" : " (nonaktif)"}
                  </option>
                ))}
              </Select>
            </div>
            {!choices.length && (
              <p className="field-error">
                Belum ada kategori{" "}
                {type === "income" ? "pemasukan" : "pengeluaran"}.{" "}
                <Link href="/categories">Buat kategori terlebih dahulu.</Link>
              </p>
            )}
            {!availableAccounts.length && <p className="field-error">Belum ada akun aktif. <Link href="/accounts">Buat atau aktifkan akun terlebih dahulu.</Link></p>}
            {transaction && accounts.some((a) => a.id === transaction.accountId && !a.isActive) && <p className="muted">Transaksi lama ini tetap boleh memakai akun nonaktif asalnya, atau dipindahkan ke akun aktif.</p>}
            <div className="field note-field">
              <label htmlFor={noteId}>Catatan (opsional)</label>
              <textarea
                id={noteId}
                name="note"
                rows={4}
                defaultValue={transaction?.note}
              />
            </div>
            {errors.form && (
              <p role="alert" className="field-error">
                {errors.form}
              </p>
            )}
            <div className="form-actions">
              <Link href="/transactions" className="button button-secondary">
                Batal
              </Link>
              <Button
                type="submit"
                disabled={!choices.length || !availableAccounts.length}
              >
                Simpan transaksi
              </Button>
            </div>
          </form>
        </Card>
        <aside className="form-aside">
          <Card className="accent-card">
            <h2>Ringkasan transaksi</h2>
            <dl className="detail-list">
              <div>
                <dt>Tipe</dt>
                <dd>{type === "income" ? "Pemasukan" : "Pengeluaran"}</dd>
              </div>
              <div>
                <dt>Kategori</dt>
                <dd>
                  {categories.find((c) => c.id === categoryId)?.name ??
                    "Belum dipilih"}
                </dd>
              </div>
              <div>
                <dt>Akun</dt>
                <dd>
                  {accounts.find((a) => a.id === accountId)?.name ??
                    "Belum dipilih"}
                </dd>
              </div>
              <div className="total-row">
                <dt>Total</dt>
                <dd>
                  {formatRupiah(
                    Number.isFinite(Number(amount)) ? Number(amount) : 0,
                  )}
                </dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>
    </>
  );
}
