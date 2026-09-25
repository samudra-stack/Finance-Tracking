"use client";
import { Info, X } from "lucide-react";
export function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div aria-live="polite" aria-atomic="true" className="toast-region">
      {message && (
        <div className="toast">
          <Info size={20} aria-hidden="true" />
          <p>{message}</p>
          <button aria-label="Tutup notifikasi" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
