export type TransactionType = "income" | "expense";
export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  amount: number;
  description: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
}
export interface Account {
  id: string;
  name: string;
  type: "cash" | "bank" | "e-wallet";
  initialBalance: number;
  icon: string;
  isActive: boolean;
}
export interface Budget {
  id: string;
  categoryId: string;
  month: string;
  limitAmount: number;
}
export interface UserPreference {
  name: string;
  email: string;
  currency: "IDR";
  theme: "dark" | "light";
}
export interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  preference: UserPreference;
}
export interface Session {
  loggedIn: boolean;
  rememberedEmail: string;
}
