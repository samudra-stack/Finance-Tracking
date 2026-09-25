import { useId, type InputHTMLAttributes } from "react";
export function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <div className={`field ${className}`}>
      <label htmlFor={fieldId}>{label}</label>
      <input
        {...props}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${fieldId}-error` : props["aria-describedby"]
        }
      />
      {error && (
        <span id={`${fieldId}-error`} className="field-error">
          {error}
        </span>
      )}
    </div>
  );
}
