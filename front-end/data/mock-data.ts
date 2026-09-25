import type { FinanceState } from "../types/finance";

export function createSeed(now = new Date()): FinanceState {
  const categories: FinanceState["categories"] = [
    {
      id: "food",
      name: "Makanan & Minuman",
      type: "expense",
      color: "#8b5cf6",
      icon: "utensils",
    },
    {
      id: "transport",
      name: "Transportasi",
      type: "expense",
      color: "#6366f1",
      icon: "car",
    },
    {
      id: "home",
      name: "Tempat Tinggal",
      type: "expense",
      color: "#a78bfa",
      icon: "wallet",
    },
    {
      id: "bills",
      name: "Tagihan",
      type: "expense",
      color: "#c084fc",
      icon: "receipt",
    },
    {
      id: "fun",
      name: "Hiburan",
      type: "expense",
      color: "#818cf8",
      icon: "sparkles",
    },
    {
      id: "education",
      name: "Pendidikan",
      type: "expense",
      color: "#38bdf8",
      icon: "briefcase",
    },
    {
      id: "health",
      name: "Kesehatan",
      type: "expense",
      color: "#f472b6",
      icon: "heart",
    },
    {
      id: "salary",
      name: "Gaji",
      type: "income",
      color: "#10b981",
      icon: "briefcase",
    },
    {
      id: "bonus",
      name: "Bonus",
      type: "income",
      color: "#34d399",
      icon: "banknote",
    },
    {
      id: "extra",
      name: "Pendapatan Tambahan",
      type: "income",
      color: "#2dd4bf",
      icon: "wallet",
    },
  ];
  const accounts: FinanceState["accounts"] = [
    {
      id: "cash",
      name: "Tunai",
      type: "cash",
      initialBalance: 500000,
      icon: "banknote",
      isActive: true,
    },
    {
      id: "bca",
      name: "BCA",
      type: "bank",
      initialBalance: 2000000,
      icon: "landmark",
      isActive: true,
    },
    {
      id: "seabank",
      name: "SeaBank",
      type: "bank",
      initialBalance: 1500000,
      icon: "wallet",
      isActive: true,
    },
    {
      id: "gopay",
      name: "GoPay",
      type: "e-wallet",
      initialBalance: 300000,
      icon: "wallet",
      isActive: true,
    },
  ];
  const month = (offset: number) => {
    const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };
  const transactions = Array.from({ length: 30 }, (_, index) => {
    const category = categories[index % 10];
    const date = `${month(-Math.floor(index / 10))}-${String((index % 10) + 1).padStart(2, "0")}`;
    return {
      id: `seed-${index + 1}`,
      date,
      type: category.type,
      categoryId: category.id,
      accountId: accounts[index % 4].id,
      amount: category.type === "income" ? 2500000 : ((index % 7) + 1) * 75000,
      description: `${category.name} bulanan`,
      note: "Data contoh awal; dapat diubah atau dihapus.",
      createdAt: `${date}T00:00:00Z`,
      updatedAt: `${date}T00:00:00Z`,
    };
  });
  return {
    transactions,
    categories,
    accounts,
    budgets: categories
      .slice(0, 5)
      .map((category, index) => ({
        id: `budget-${index + 1}`,
        categoryId: category.id,
        month: month(0),
        limitAmount: 1000000,
      })),
    preference: {
      name: "Samudra",
      email: "samudra@example.com",
      currency: "IDR",
      theme: "dark",
    },
  };
}
export function emptyState(): FinanceState {
  return {
    transactions: [],
    categories: [],
    accounts: [],
    budgets: [],
    preference: {
      name: "Samudra",
      email: "samudra@example.com",
      currency: "IDR",
      theme: "dark",
    },
  };
}
