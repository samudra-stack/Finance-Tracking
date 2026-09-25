"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { LogOut } from "lucide-react";
import { Brand } from "./Brand";
import { navigation } from "./navigation";
import { useFinance } from "@/contexts/FinanceContext";
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, logout } = useFinance();
  return (
    <div className="sidebar-content">
      <Brand />
      <nav aria-label="Navigasi utama">
        {["UTAMA", "MANAJEMEN"].map((group) => (
          <div key={group} className="nav-group">
            <p>{group}</p>
            {navigation
              .filter((item) => item.group === group)
              .map(({ href, label, icon: Icon }) => {
                const active =
                  href === "/transactions"
                    ? pathname === href || pathname.endsWith("/edit")
                    : pathname === href;
                return (
                  <Link
                    href={href}
                    key={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`nav-link ${active ? "active" : ""}`}
                  >
                    <Icon size={17} aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <Link href="/settings" className="profile-card" onClick={onNavigate}>
          <Avatar />
          <span>
            <strong>{state.preference.name}</strong>
            <small>PROFIL LOKAL</small>
          </span>
        </Link>
        <button
          type="button"
          className="nav-link logout-button"
          onClick={() => {
            logout();
            onNavigate?.();
            router.replace("/");
          }}
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </div>
  );
}
