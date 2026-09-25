import { useId, type SelectHTMLAttributes } from "react";
export function Select({
  label,
  children,
  id,
  className = "",
  error,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
}) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <div className={`field ${className}`}>
      <label htmlFor={fieldId}>{label}</label>
      <select
        {...props}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${fieldId}-error` : props["aria-describedby"]
        }
      >
        {children}
      </select>
      {error && (
        <span id={`${fieldId}-error`} className="field-error">
          {error}
        </span>
      )}
    </div>
  );
}
