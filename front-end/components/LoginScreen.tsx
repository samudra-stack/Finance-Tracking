"use client";
import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Brand } from "@/components/layout/Brand";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/contexts/ToastContext";
import { useFinance } from "@/contexts/FinanceContext";
import { validateLogin } from "@/lib/validators";
export function LoginScreen() {
  const router = useRouter();
  const notify = useToast();
  const [visible, setVisible] = useState(false);
  const { ready, session, login } = useFinance();
  useEffect(() => {
    if (ready && session.loggedIn) router.replace("/dashboard");
  }, [ready, session.loggedIn, router]);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const next = validateLogin(email, password);
    setErrors(next);
    if (!next.email && !next.password) {
      login(email, data.get("remember") === "on");
      notify("Berhasil masuk ke sesi simulasi.");
      router.replace("/dashboard");
    }
  }
  return (
    <main className="login-page">
      <section className="login-story">
        <Brand />
        <div className="login-pitch">
          <span className="eyebrow">TAKE CONTROL OF YOUR MONEY</span>
          <h1>
            Keuangan lebih jernih,
            <br />
            hidup lebih tenang.
          </h1>
          <p>
            Pantau setiap rupiah, buat keputusan lebih cerdas, dan wujudkan
            tujuan finansialmu.
          </p>
          <div className="balance-preview">
            <span>ILUSTRASI SALDO</span>
            <strong>Rp 24.850.000</strong>
            <small>↗ 12,5% bulan ini</small>
            <div className="mini-chart" aria-hidden="true">
              {[22, 34, 30, 48, 42, 60, 54, 76, 70, 91].map((height, index) => (
                <i key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </div>
        <p className="login-story-footer">
          Satu tempat untuk semua rencana keuanganmu.
        </p>
      </section>
      <section className="login-form-section">
        <div className="login-form-wrap">
          <Brand />
          <h2>Selamat datang di demo MyFinance</h2>
          <p className="muted">
            Coba pencatatan keuangan dengan data lokal pada browser ini.
          </p>
          <form
            key={ready ? "ready" : "loading"}
            onSubmit={submit}
            method="post"
            noValidate
          >
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="samudra@example.com"
              autoComplete="email"
              required
              error={errors.email}
              defaultValue={session.rememberedEmail}
            />
            <div className="password-field">
              <Input
                name="password"
                type={visible ? "text" : "password"}
                label="Kata sandi"
                placeholder="Minimal 6 karakter"
                autoComplete="current-password"
                required
                minLength={6}
                error={errors.password}
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={
                  visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                }
                aria-pressed={visible}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <div className="login-options">
              <label>
                <input
                  type="checkbox"
                  name="remember"
                  defaultChecked={!!session.rememberedEmail}
                />{" "}
                Ingat email
              </label>
            </div>
            <Button type="submit" className="login-submit" disabled={!ready}>
              {ready ? "Masuk ke demo" : "Menyiapkan formulir…"}
              <ArrowRight size={16} />
            </Button>
          </form>
          <p className="demo-note">
            Login simulasi · Gunakan email valid dan kata sandi contoh minimal 6 karakter.
            Email tidak membuat akun server atau memisahkan data antar pengguna.
            Kata sandi tidak disimpan. Data dan profil hanya tersedia di browser ini.
            Sesi berakhir saat tab ditutup, kecuali browser memulihkan tab tersebut.
          </p>
        </div>
      </section>
    </main>
  );
}
