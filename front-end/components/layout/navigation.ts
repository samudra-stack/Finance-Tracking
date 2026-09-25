import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  Shapes,
  Wallet,
  CircleGauge,
  ChartNoAxesCombined,
  Settings,
} from "lucide-react";
export const navigation = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    group: "UTAMA",
  },
  {
    href: "/transactions",
    label: "Transaksi",
    icon: ArrowLeftRight,
    group: "UTAMA",
  },
  {
    href: "/transactions/new",
    label: "Input transaksi",
    icon: Plus,
    group: "UTAMA",
  },
  { href: "/categories", label: "Kategori", icon: Shapes, group: "MANAJEMEN" },
  { href: "/accounts", label: "Akun", icon: Wallet, group: "MANAJEMEN" },
  {
    href: "/budgets",
    label: "Anggaran",
    icon: CircleGauge,
    group: "MANAJEMEN",
  },
  {
    href: "/reports",
    label: "Laporan",
    icon: ChartNoAxesCombined,
    group: "MANAJEMEN",
  },
  {
    href: "/settings",
    label: "Pengaturan",
    icon: Settings,
    group: "MANAJEMEN",
  },
];
