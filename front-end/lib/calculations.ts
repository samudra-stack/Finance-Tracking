import type {
  Account,
  Budget,
  Category,
  FinanceState,
  Transaction,
} from "../types/finance";
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export const currentMonth = () => localDate().slice(0, 7);
export function totals(rows: Transaction[]) {
  const income = rows
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = rows
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  return { income, expense, net: income - expense };
}
export const accountBalance = (account: Account, rows: Transaction[]) =>
  account.initialBalance +
  totals(rows.filter((t) => t.accountId === account.id)).net;
export const totalBalance = (s: FinanceState) =>
  s.accounts.reduce(
    (sum, account) => sum + accountBalance(account, s.transactions),
    0,
  );
export function budgetUsage(budget: Budget, rows: Transaction[]) {
  const spent = totals(
    rows.filter(
      (t) =>
        t.categoryId === budget.categoryId &&
        t.date.slice(0, 7) === budget.month,
    ),
  ).expense;
  const percent = (spent / budget.limitAmount) * 100;
  return {
    spent,
    remaining: budget.limitAmount - spent,
    percent,
    status:
      percent > 100 ? "Terlampaui" : percent >= 80 ? "Hampir habis" : "Aman",
  };
}
export function categoryTotals(rows: Transaction[], categories: Category[]) {
  return categories.map((c) => ({
    ...c,
    total: rows
      .filter((t) => t.categoryId === c.id)
      .reduce((sum, t) => sum + t.amount, 0),
    count: rows.filter((t) => t.categoryId === c.id).length,
  }));
}
export function monthlyTotals(rows: Transaction[]) {
  return [...new Set(rows.map((t) => t.date.slice(0, 7)))]
    .sort()
    .map((month) => ({
      month,
      ...totals(rows.filter((t) => t.date.startsWith(month))),
    }));
}
export interface TransactionQuery {
  search: string;
  type: string;
  categoryId: string;
  accountId: string;
  from: string;
  to: string;
  sort: string;
}
export const defaultQuery: TransactionQuery = {
  search: "",
  type: "",
  categoryId: "",
  accountId: "",
  from: "",
  to: "",
  sort: "date-desc",
};
export function queryTransactions(rows: Transaction[], q: TransactionQuery) {
  return rows
    .filter(
      (t) =>
        (!q.search ||
          t.description
            .toLocaleLowerCase()
            .includes(q.search.trim().toLocaleLowerCase())) &&
        (!q.type || t.type === q.type) &&
        (!q.categoryId || t.categoryId === q.categoryId) &&
        (!q.accountId || t.accountId === q.accountId) &&
        (!q.from || t.date >= q.from) &&
        (!q.to || t.date <= q.to),
    )
    .sort(
      (a, b) =>
        (q.sort === "amount-asc"
          ? a.amount - b.amount
          : q.sort === "amount-desc"
            ? b.amount - a.amount
            : q.sort === "date-asc"
              ? a.date.localeCompare(b.date)
              : b.date.localeCompare(a.date)) || a.id.localeCompare(b.id),
    );
}
export function paginate<T>(rows: T[], page: number, size = 10) {
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const safePage = Math.max(1, Math.min(page, pages));
  return {
    rows: rows.slice((safePage - 1) * size, safePage * size),
    page: safePage,
    pages,
    total: rows.length,
  };
}
