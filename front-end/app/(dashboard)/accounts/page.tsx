import { PageHeader } from "@/components/layout/PageHeader";
import { AccountGrid } from "@/components/accounts/AccountGrid";
import { EntityEditor } from "@/components/ui/EntityEditor";
export const metadata = { title: "Akun & dompet" };
export default function Accounts() {
  return (
    <>
      <PageHeader
        title="Akun & dompet"
        description="Pantau saldo pada setiap sumber dana"
        actions={<EntityEditor entity="akun" />}
      />
      <AccountGrid />
    </>
  );
}
