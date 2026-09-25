import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
}
export function Button({
  variant = "primary",
  loading,
  className = "",
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`button button-${variant} ${className}`}
    >
      {loading && (
        <LoaderCircle size={16} className="spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
