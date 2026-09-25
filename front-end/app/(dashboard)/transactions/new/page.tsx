import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionForm } from "@/components/transactions/TransactionForm";
export const metadata = { title: "Tambah transaksi" };
export default function NewTransaction() {
  return (
    <>
      <PageHeader
        title="Tambah transaksi"
        description="Catat aktivitas keuangan baru"
      />
      <TransactionForm />
    </>
  );
}
