"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { monthlyTotals } from "@/lib/calculations";
import { formatRupiah } from "@/lib/formatters";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Transaction } from "@/types/finance";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
export function FinanceChart({ rows }: { rows: Transaction[] }) {
  const months = monthlyTotals(rows);
  if (!rows.length)
    return (
      <EmptyState
        title="Belum ada arus kas"
        description="Grafik akan tampil setelah ada transaksi pada periode ini."
      />
    );
  return (
    <div className="chart-box">
      <Bar
        role="img"
        aria-label={`Arus kas per bulan: ${months.map((m) => `${m.month}, pemasukan ${formatRupiah(m.income)}, pengeluaran ${formatRupiah(m.expense)}`).join("; ")}`}
        data={{
          labels: months.map((m) => m.month),
          datasets: [
            {
              label: "Pemasukan",
              data: months.map((m) => m.income),
              backgroundColor: "#7165ee",
              borderRadius: 5,
              maxBarThickness: 32,
            },
            {
              label: "Pengeluaran",
              data: months.map((m) => m.expense),
              backgroundColor: "#a16aef",
              borderRadius: 5,
              maxBarThickness: 32,
            },
          ],
        }}
        options={{
          animation: false,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "#8292aa",
                usePointStyle: true,
                pointStyle: "circle",
                padding: 20,
              },
            },
            tooltip: {
              callbacks: {
                label: (item) =>
                  `${item.dataset.label}: ${formatRupiah(Number(item.raw))}`,
              },
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#8292aa" } },
            y: {
              beginAtZero: true,
              grid: { color: "rgba(148,163,184,.15)" },
              ticks: {
                color: "#8292aa",
                callback: (value) => `${Number(value) / 1000000} jt`,
              },
            },
          },
        }}
      />
    </div>
  );
}
