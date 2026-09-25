import { PageHeader } from "@/components/layout/PageHeader";
import { PageActions } from "@/components/layout/PageActions";
import { TransactionsScreen } from "@/components/transactions/TransactionsScreen";
export const metadata = { title: "Transaksi" };
export default function Transactions() {
  return (
    <>
      <PageHeader
        title="Transaksi"
        description="Kelola seluruh pemasukan dan pengeluaran"
        actions={<PageActions addHref="/transactions/new" />}
      />
      <TransactionsScreen />
    </>
  );
}
