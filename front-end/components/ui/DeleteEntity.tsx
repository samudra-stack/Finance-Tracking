"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { useFinance } from "@/contexts/FinanceContext";
import { useToast } from "@/contexts/ToastContext";
import { deletionError } from "@/lib/validators";
export function DeleteEntity({
  kind,
  id,
  name,
}: {
  kind: "TRANSACTION" | "CATEGORY" | "ACCOUNT" | "BUDGET";
  id: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const { state, execute } = useFinance();
  const notify = useToast();
  const blocked =
    kind === "CATEGORY" || kind === "ACCOUNT"
      ? deletionError(state, kind, id)
      : null;
  return (
    <>
      <Button
        variant="ghost"
        aria-label={`Hapus ${name}`}
        onClick={() => {
          setError("");
          setOpen(true);
        }}
      >
        <Trash2 size={15} />
      </Button>
      <Modal title="Hapus data?" open={open} onClose={() => setOpen(false)}>
        <p>
          Hapus <strong>{name}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
        {(blocked || error) && (
          <p className="field-error" role="alert">
            {blocked || error}
          </p>
        )}
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            variant="danger"
            disabled={!!blocked}
            onClick={() => {
              const result = execute({ type: `DELETE_${kind}`, payload: id });
              if (result) {
                setError(result);
                return;
              }
              setOpen(false);
              notify("Data dihapus.");
            }}
          >
            Hapus data
          </Button>
        </div>
      </Modal>
    </>
  );
}
