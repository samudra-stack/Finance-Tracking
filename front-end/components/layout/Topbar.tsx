"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HelpCircle, Menu, Search, LogOut, UserRound } from "lucide-react";
import { useRef, useState, useEffect, useId } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/contexts/ToastContext";
import { navigation } from "./navigation";
import { useFinance } from "@/contexts/FinanceContext";
export function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, logout } = useFinance();
  const [profileOpen, setProfileOpen] = useState(false);
  const profile = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const profileId = useId();
  useEffect(() => {
    if (!profileOpen) return;
    const outside = (event: PointerEvent) => {
      if (!profile.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setProfileOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [profileOpen]);
  const notify = useToast();
  const title = pathname.endsWith("/edit")
    ? "Edit transaksi"
    : (navigation.find((item) => item.href === pathname)?.label ?? "MyFinance");
  return (
    <header className="topbar">
      <Button
        variant="ghost"
        className="menu-toggle"
        onClick={onMenu}
        aria-label="Buka menu navigasi"
      >
        <Menu size={21} />
      </Button>
      <div className="breadcrumb">
        MyFinance <span>/</span> <strong>{title}</strong>
      </div>
      <div className="topbar-actions">
        <button
          className="global-search"
          onClick={() => router.push("/transactions")}
        >
          <Search size={14} />
          <span>Cari transaksi...</span>
        </button>
        <Button
          variant="secondary"
          className="icon-button"
          aria-label="Bantuan"
          onClick={() =>
            notify(
              "MyFinance: buat kategori dan akun, lalu catat transaksi. Data disimpan pada browser ini. Laporan dapat dicetak dari menu Laporan.",
            )
          }
        >
          <HelpCircle size={16} />
        </Button>
        <div className="profile-menu" ref={profile} onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setProfileOpen(false);
        }}>
          <button ref={trigger} type="button" className="profile-trigger" aria-label={`Menu profil ${state.preference.name}`} aria-expanded={profileOpen} aria-controls={profileId} onClick={() => setProfileOpen(!profileOpen)}>
            <Avatar size="small" />
          </button>
          {profileOpen && <div id={profileId} className="profile-popover" aria-label="Menu profil">
            <strong>{state.preference.name}</strong>
            <Link href="/settings" onClick={() => setProfileOpen(false)}><UserRound size={16} />Profil</Link>
            <button type="button" onClick={() => {
              logout();
              setProfileOpen(false);
              router.replace("/");
            }}><LogOut size={16} />Keluar</button>
          </div>}
        </div>
      </div>
    </header>
  );
}
