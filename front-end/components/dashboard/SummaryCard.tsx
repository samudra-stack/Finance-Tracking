import { ArrowDownLeft, ArrowUpRight, Wallet, CircleGauge } from "lucide-react";
import { Card } from "@/components/ui/Card";
const icons = {
  wallet: Wallet,
  income: ArrowDownLeft,
  expense: ArrowUpRight,
  budget: CircleGauge,
};
export function SummaryCard({
  label,
  value,
  hint,
  icon = "wallet",
}: {
  label: string;
  value: string;
  hint: string;
  icon?: keyof typeof icons;
}) {
  const Icon = icons[icon];
  return (
    <Card className="summary-card">
      <div>
        <span>{label}</span>
        <span className="summary-icon">
          <Icon size={17} />
        </span>
      </div>
      <strong>{value}</strong>
      <small>{hint}</small>
    </Card>
  );
}
