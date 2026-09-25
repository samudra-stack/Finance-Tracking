import { formatRupiah } from "@/lib/formatters";
import { Badge } from "@/components/ui/Badge";
export function BudgetProgress({
  name,
  spent,
  limit,
  compact = false,
}: {
  name: string;
  spent: number;
  limit: number;
  compact?: boolean;
}) {
  const ratio = limit > 0 ? (spent / limit) * 100 : 0;
  const percent = Math.round(ratio * 10) / 10;
  const status =
    ratio > 100 ? "Terlampaui" : ratio >= 80 ? "Hampir habis" : "Aman";
  return (
    <div className={`budget-progress ${compact ? "compact" : ""}`}>
      <div className="budget-label">
        <strong>{name}</strong>
        {compact ? (
          <span>{percent}%</span>
        ) : (
          <div>
            <strong>{formatRupiah(spent)}</strong>
            <small>dari {formatRupiah(limit)}</small>
          </div>
        )}
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={`Penggunaan anggaran ${name}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(percent, 100)}
        aria-valuetext={`${percent}% digunakan, ${status}`}
      >
        <span style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
      {!compact && (
        <div className="budget-caption">
          <Badge
            tone={ratio > 100 ? "expense" : ratio >= 80 ? "warning" : "income"}
          >
            {status}
          </Badge>
          <span>{percent}% digunakan</span>
        </div>
      )}
    </div>
  );
}
