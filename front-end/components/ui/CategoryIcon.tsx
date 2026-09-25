import {
  Utensils,
  Car,
  Receipt,
  ShoppingBag,
  Sparkles,
  Heart,
  BriefcaseBusiness,
  Wallet,
  Landmark,
  Banknote,
  type LucideIcon,
} from "lucide-react";
const icons: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  receipt: Receipt,
  bag: ShoppingBag,
  sparkles: Sparkles,
  heart: Heart,
  briefcase: BriefcaseBusiness,
  wallet: Wallet,
  landmark: Landmark,
  banknote: Banknote,
};
export function CategoryIcon({ name = "wallet" }: { name?: string }) {
  const Icon = icons[name] ?? Wallet;
  return (
    <span className="category-icon">
      <Icon size={18} aria-hidden="true" />
    </span>
  );
}
