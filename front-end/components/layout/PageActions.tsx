import Link from "next/link";
import { Printer, Plus } from "lucide-react";
export function PageActions({ addHref }: { addHref?: string }) {
  return (
    <>
      <Link href="/reports" className="button button-secondary">
        <Printer size={15} />
        Laporan
      </Link>
      {addHref && (
        <Link href={addHref} className="button button-primary">
          <Plus size={16} />
          Tambah
        </Link>
      )}
    </>
  );
}
