import { PageHeader } from "@/components/layout/PageHeader";
import { CategoryGrid } from "@/components/categories/CategoryGrid";
import { EntityEditor } from "@/components/ui/EntityEditor";
export const metadata = { title: "Kategori" };
export default function Categories() {
  return (
    <>
      <PageHeader
        title="Kategori"
        description="Atur klasifikasi transaksi agar laporan lebih jelas"
        actions={<EntityEditor entity="kategori" />}
      />
      <CategoryGrid />
    </>
  );
}
