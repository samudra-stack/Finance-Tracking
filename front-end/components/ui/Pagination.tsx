"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
export function Pagination({
  page,
  pages,
  total,
  onChange,
  size = 10,
}: {
  page: number;
  pages: number;
  total: number;
  onChange: (page: number) => void;
  size?: number;
}) {
  return (
    <div className="pagination no-print">
      <span>
        Menampilkan {total ? (page - 1) * size + 1 : 0}–
        {Math.min(page * size, total)} dari {total} transaksi
      </span>
      <nav aria-label="Pagination transaksi">
        <Button
          variant="ghost"
          disabled={page <= 1}
          aria-label="Halaman sebelumnya"
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft size={15} />
        </Button>
        <span aria-live="polite">
          Halaman {page} dari {pages}
        </span>
        <Button
          variant="ghost"
          disabled={page >= pages}
          aria-label="Halaman berikutnya"
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight size={15} />
        </Button>
      </nav>
    </div>
  );
}
