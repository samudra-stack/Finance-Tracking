import { PageHeader } from "@/components/layout/PageHeader";
import { EditTransactionScreen } from "@/components/transactions/EditTransactionScreen";
export const metadata = { title: "Edit transaksi" };
export default function EditTransaction() {
  return (
    <>
      <PageHeader
        title="Edit transaksi"
        description="Tinjau kembali detail transaksi Anda"
      />
      <EditTransactionScreen />
    </>
  );
}
