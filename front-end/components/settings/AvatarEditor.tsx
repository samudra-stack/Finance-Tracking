"use client";
import { useRef, useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { useToast } from "@/contexts/ToastContext";
import { prepareAvatar } from "@/lib/avatar";
import { Button } from "@/components/ui/Button";
export function AvatarEditor() {
  const { avatar, updateAvatar } = useFinance();
  const notify = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="avatar-editor">
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Pilih foto profil" hidden onChange={async (event) => {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = "";
        if (!file) return;
        setBusy(true);
        setError("");
        try {
          const value = await prepareAvatar(file);
          const issue = updateAvatar(value);
          if (issue) setError(issue);
          else notify("Foto profil disimpan pada browser ini.");
        } catch (issue) { setError(issue instanceof Error ? issue.message : "Foto gagal diproses."); }
        finally { setBusy(false); }
      }} />
      <div className="avatar-actions">
        <Button variant="secondary" loading={busy} onClick={() => input.current?.click()}>Unggah foto</Button>
        {avatar && <Button variant="ghost" disabled={busy} onClick={() => {
          const issue = updateAvatar("");
          setError(issue ?? "");
          if (!issue) notify("Foto dihapus. Avatar kembali menggunakan inisial.");
        }}>Hapus foto</Button>}
      </div>
      <p className="muted">JPEG, PNG, atau WebP, maksimal 5 MB. Bagian tengah foto dipotong persegi. Foto hanya disimpan di browser ini.</p>
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}
