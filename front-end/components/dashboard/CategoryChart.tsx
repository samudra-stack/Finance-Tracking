"use client";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { categoryTotals, totals } from "@/lib/calculations";
import { formatRupiah } from "@/lib/formatters";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Category, Transaction } from "@/types/finance";
ChartJS.register(ArcElement, Tooltip, Legend);
export function CategoryChart({
  rows,
  categories,
}: {
  rows: Transaction[];
  categories: Category[];
}) {
  const values = categoryTotals(
    rows.filter((t) => t.type === "expense"),
    categories,
  ).filter((c) => c.total > 0);
  if (!values.length)
    return (
      <EmptyState
        title="Belum ada pengeluaran"
        description="Komposisi kategori akan tampil setelah ada pengeluaran."
      />
    );
  return (
    <div className="donut-layout">
      <div className="donut-box">
        <Doughnut
          role="img"
          aria-label={`Pengeluaran per kategori: ${values.map((c) => `${c.name} ${formatRupiah(c.total)}`).join(", ")}`}
          data={{
            labels: values.map((c) => c.name),
            datasets: [
              {
                data: values.map((c) => c.total),
                backgroundColor: values.map((c) => c.color),
                borderWidth: 0,
              },
            ],
          }}
          options={{
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            cutout: "78%",
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (item) =>
                    `${item.label}: ${formatRupiah(Number(item.raw))}`,
                },
              },
            },
          }}
        />
        <div className="donut-label">
          <strong>{formatRupiah(totals(rows).expense)}</strong>
          <span>Total pengeluaran</span>
        </div>
      </div>
      <div className="chart-legend">
        {values.map((c) => (
          <span key={c.id}>
            <i style={{ background: c.color }} />
            {c.name}
          </span>
        ))}
      </div>
    </div>
  );
}
