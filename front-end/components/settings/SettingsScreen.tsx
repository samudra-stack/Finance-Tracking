"use client";
import { useState } from "react";
import { UserRound, SlidersHorizontal, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { AvatarEditor } from "./AvatarEditor";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SetupGuide } from "@/components/ui/SetupGuide";
import { useToast } from "@/contexts/ToastContext";
import { useFinance } from "@/contexts/FinanceContext";
import { validatePreference, type Errors } from "@/lib/validators";
const tabs = [
  { id: "profile", label: "Profil", icon: UserRound },
  { id: "preference", label: "Preferensi", icon: SlidersHorizontal },
  { id: "about", label: "Tentang & reset data", icon: Info },
];
export function SettingsScreen() {
  const { state, execute } = useFinance();
  const { preference } = state;
  const [tab, setTab] = useState("profile");
  const [reset, setReset] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const notify = useToast();
  return (
    <>
      <SetupGuide />
      <div className="settings-layout">
        <Card className="settings-nav">
          <nav aria-label="Bagian pengaturan">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={id === tab ? "active" : ""}
                aria-current={id === tab ? "page" : undefined}
                onClick={() => {
                  setTab(id);
                  setErrors({});
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </Card>
        <Card className="settings-panel">
          {(tab === "profile" || tab === "preference") && (
            <form
              key={`${tab}-${preference.name}-${preference.email}`}
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const next = {
                  ...preference,
                  name: String(data.get("name") ?? preference.name).trim(),
                  email: String(data.get("email") ?? preference.email).trim(),
                };
                const issues = validatePreference(next);
                setErrors(issues);
                if (Object.keys(issues).length) return;
                const error = execute({
                  type: "UPDATE_PREFERENCE",
                  payload: next,
                });
                if (error) {
                  setErrors({ form: error });
                  return;
                }
                notify("Profil disimpan.");
              }}
            >
              <div className="settings-profile">
                <Avatar size="large" />
                <div>
                  <h2>{preference.name}</h2>
                  <p>{preference.email}</p>
                </div>
              </div>
              {tab === "profile" && (
                <>
                  <AvatarEditor />
                  <div className="form-grid">
                    <Input
                      label="Nama lengkap"
                      name="name"
                      defaultValue={preference.name}
                      error={errors.name}
                      required
                      maxLength={80}
                    />
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      defaultValue={preference.email}
                      error={errors.email}
                      required
                    />
                  </div>
                  {errors.form && <p className="field-error">{errors.form}</p>}
                  <div className="form-actions">
                    <Button type="submit">Simpan profil</Button>
                  </div>
                </>
              )}
              {tab === "preference" && (
                <>
                  <div className="currency-info">
                    <h3>Mata uang</h3>
                    <strong>IDR — Rupiah Indonesia</strong>
                    <p className="muted">Semua nominal dicatat dalam IDR. Konversi mata uang belum tersedia.</p>
                  </div>
                  <div className="setting-row">
                    <div>
                      <strong>Mode gelap</strong>
                      <p>Tema diterapkan dan disimpan langsung.</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-label="Mode gelap"
                      aria-checked={preference.theme === "dark"}
                      className={`switch ${preference.theme === "dark" ? "checked" : ""}`}
                      onClick={() => {
                        const error = execute({
                          type: "UPDATE_PREFERENCE",
                          payload: {
                            ...preference,
                            theme:
                              preference.theme === "dark" ? "light" : "dark",
                          },
                        });
                        notify(error ?? "Tema diperbarui.");
                      }}
                    >
                      <span />
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
          {tab === "about" && (
            <div className="settings-info">
              <h2>Tentang MyFinance</h2>
              <p>Take Control of Your Money · Milestone 3</p>
              <p>
                Data dan foto profil disimpan di browser ini. Sesi simulasi berlaku
                selama tab terbuka; refresh tidak mengakhiri sesi. Pemulihan tab oleh
                browser dapat memulihkan sesi. Kata sandi tidak disimpan. Tidak ada akun server atau sinkronisasi
                antarperangkat.
              </p>
              <h2>Reset data</h2>
              <p>
                Kosongkan semua transaksi, kategori, akun, dan anggaran. Profil,
                foto, tema, dan sesi tetap dipertahankan.
              </p>
              <Button variant="danger" onClick={() => setReset(true)}>
                Reset data
              </Button>
            </div>
          )}
        </Card>
      </div>
      <Modal
        title="Kosongkan semua data?"
        open={reset}
        onClose={() => setReset(false)}
      >
        <p>Empat koleksi berikut akan dihapus permanen dari browser ini:</p>
        <ul>
          <li>Transaksi ({state.transactions.length})</li>
          <li>Kategori ({state.categories.length})</li>
          <li>Akun ({state.accounts.length})</li>
          <li>Anggaran ({state.budgets.length})</li>
        </ul>
        <p>
          Profil, foto, tema, dan sesi tetap ada. Setelah reset, buat kategori dan
          akun terlebih dahulu sebelum menambah transaksi. Data contoh tidak
          akan diisi kembali setelah refresh.
        </p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setReset(false)}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              const error = execute({ type: "RESET_DATA" });
              notify(
                error ??
                  "Semua data dikosongkan. Buat kategori dan akun terlebih dahulu.",
              );
              if (!error) setReset(false);
            }}
          >
            Kosongkan semua
          </Button>
        </div>
      </Modal>
    </>
  );
}
