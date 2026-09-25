import type {
  Account,
  Budget,
  Category,
  FinanceState,
  Transaction,
  UserPreference,
} from "../types/finance";
export type Errors = Record<string, string>;
export const validEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const validMonth = (value: string) =>
  /^\d{4}-(0[1-9]|1[0-2])$/.test(value) && Number(value.slice(0, 4)) > 0;
export const validDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  validMonth(value.slice(0, 7)) &&
  !Number.isNaN(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
const positive = (value: number) =>
  Number.isFinite(value) && value > 0 && value <= Number.MAX_SAFE_INTEGER;
export function validateDateRange(from: string, to: string): string | null {
  return validDate(from) && validDate(to) && from <= to
    ? null
    : "Isi tanggal valid dengan tanggal awal sebelum atau sama dengan tanggal akhir.";
}
export function validateLogin(email: string, password: string): Errors {
  return {
    ...(!validEmail(email) && { email: "Masukkan alamat email yang valid." }),
    ...(password.length < 6 && { password: "Kata sandi minimal 6 karakter." }),
  };
}
export function validateTransaction(
  t: Transaction,
  state: FinanceState,
): Errors {
  const errors: Errors = {};
  if (!validDate(t.date)) errors.date = "Tanggal wajib valid.";
  if (!["income", "expense"].includes(t.type))
    errors.type = "Pilih jenis transaksi.";
  if (!t.description.trim()) errors.description = "Deskripsi wajib diisi.";
  if (!positive(t.amount)) errors.amount = "Nominal harus positif dan valid.";
  if (!state.categories.some((c) => c.id === t.categoryId && c.type === t.type))
    errors.categoryId = "Pilih kategori yang sesuai jenis transaksi.";
  if (!state.accounts.some((a) => a.id === t.accountId))
    errors.accountId = "Pilih akun yang tersedia.";
  return errors;
}
export function transactionAccountError(t: Transaction, state: FinanceState, previous?: Transaction): string | null {
  const account = state.accounts.find((a) => a.id === t.accountId);
  return account && !account.isActive && previous?.accountId !== account.id
    ? "Akun nonaktif tidak dapat digunakan untuk transaksi baru atau pemindahan transaksi. Pilih akun aktif."
    : null;
}
export function validateCategory(c: Category, state: FinanceState): Errors {
  const errors: Errors = {};
  if (!c.name.trim()) errors.name = "Nama wajib diisi.";
  if (!["income", "expense"].includes(c.type))
    errors.type = "Pilih jenis kategori.";
  if (!/^#[0-9a-f]{6}$/i.test(c.color)) errors.color = "Warna harus valid.";
  if (!c.icon.trim()) errors.icon = "Ikon wajib diisi.";
  if (
    state.categories.some(
      (x) =>
        x.id !== c.id &&
        x.type === c.type &&
        x.name.trim().toLocaleLowerCase() === c.name.trim().toLocaleLowerCase(),
    )
  )
    errors.name = "Nama kategori sudah digunakan untuk jenis ini.";
  if (
    state.transactions.some(
      (t) => t.categoryId === c.id && t.type !== c.type,
    ) ||
    (c.type !== "expense" && state.budgets.some((b) => b.categoryId === c.id))
  )
    errors.type = "Jenis tidak dapat diubah karena kategori masih digunakan.";
  return errors;
}
export function validateAccount(a: Account): Errors {
  const errors: Errors = {};
  if (!a.name.trim()) errors.name = "Nama wajib diisi.";
  if (!["cash", "bank", "e-wallet"].includes(a.type))
    errors.type = "Pilih jenis akun.";
  if (
    !Number.isFinite(a.initialBalance) ||
    Math.abs(a.initialBalance) > Number.MAX_SAFE_INTEGER
  )
    errors.initialBalance = "Saldo awal harus berupa angka valid.";
  if (!a.icon.trim()) errors.icon = "Ikon wajib diisi.";
  return errors;
}
export function validateBudget(b: Budget, state: FinanceState): Errors {
  const errors: Errors = {};
  if (
    !state.categories.some((c) => c.id === b.categoryId && c.type === "expense")
  )
    errors.categoryId = "Pilih kategori pengeluaran.";
  if (!validMonth(b.month)) errors.month = "Periode wajib valid.";
  if (!positive(b.limitAmount))
    errors.limitAmount = "Batas anggaran harus positif dan valid.";
  if (
    state.budgets.some(
      (x) =>
        x.id !== b.id && x.categoryId === b.categoryId && x.month === b.month,
    )
  )
    errors.categoryId = "Kategori sudah memiliki anggaran pada periode ini.";
  return errors;
}
export function validatePreference(p: UserPreference): Errors {
  return {
    ...(!p.name.trim() && { name: "Nama wajib diisi." }),
    ...(!validEmail(p.email) && { email: "Email harus valid." }),
    ...(!["dark", "light"].includes(p.theme) && {
      theme: "Tema tidak didukung.",
    }),
    ...(p.currency !== "IDR" && { currency: "Mata uang harus IDR." }),
  };
}
export function deletionError(
  state: FinanceState,
  kind: "CATEGORY" | "ACCOUNT",
  id: string,
): string | null {
  const count = state.transactions.filter((t) =>
    kind === "CATEGORY" ? t.categoryId === id : t.accountId === id,
  ).length;
  const budgets =
    kind === "CATEGORY"
      ? state.budgets.filter((b) => b.categoryId === id).length
      : 0;
  return count || budgets
    ? `Tidak dapat dihapus: digunakan oleh ${count} transaksi dan ${budgets} anggaran. Pindahkan atau hapus relasi tersebut terlebih dahulu.`
    : null;
}
// Validate unknown JSON before it reaches components or financial calculations.
export function isFinanceState(value: unknown): value is FinanceState {
  if (!value || typeof value !== "object") return false;
  const s = value as FinanceState;
  const text = (x: unknown) => typeof x === "string";
  const fields = (x: unknown, names: string[]) =>
    !!x &&
    typeof x === "object" &&
    names.every((n) => text((x as Record<string, unknown>)[n]));
  if (
    ![s.transactions, s.categories, s.accounts, s.budgets].every(Array.isArray)
  )
    return false;
  for (const list of [s.transactions, s.categories, s.accounts, s.budgets]) {
    if (
      !list.every((x) => fields(x, ["id"]) && x.id.trim()) ||
      new Set(list.map((x) => x.id)).size !== list.length
    )
      return false;
  }
  if (
    !fields(s.preference, ["name", "email", "theme", "currency"]) ||
    Object.keys(validatePreference(s.preference)).length
  )
    return false;
  if (!s.categories.every((c) => fields(c, ["name", "type", "color", "icon"])))
    return false;
  if (
    !s.accounts.every(
      (a) =>
        fields(a, ["name", "type", "icon"]) &&
        typeof a.isActive === "boolean" &&
        !Object.keys(validateAccount(a)).length,
    )
  )
    return false;
  if (
    !s.transactions.every(
      (t) =>
        fields(t, [
          "date",
          "type",
          "categoryId",
          "accountId",
          "description",
          "createdAt",
          "updatedAt",
        ]) &&
        (t.note === undefined || text(t.note)) &&
        Number.isFinite(Date.parse(t.createdAt)) &&
        Number.isFinite(Date.parse(t.updatedAt)) &&
        !Object.keys(validateTransaction(t, s)).length,
    )
  )
    return false;
  if (
    !s.budgets.every(
      (b) =>
        fields(b, ["categoryId", "month"]) &&
        !Object.keys(validateBudget(b, s)).length,
    )
  )
    return false;
  return s.categories.every((c) => !Object.keys(validateCategory(c, s)).length);
}
