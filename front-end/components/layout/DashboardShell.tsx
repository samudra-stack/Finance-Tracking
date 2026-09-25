"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Footer } from "./Footer";
import { MobileSidebar } from "./MobileSidebar";
import { AuthGuard } from "./AuthGuard";
export function DashboardShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const close = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);
  return (
    <AuthGuard>
      <div className="app-shell">
        <a href="#main-content" className="skip-link">
          Lewati ke konten
        </a>
        <aside className="desktop-sidebar">
          <Sidebar />
        </aside>
        <MobileSidebar open={open} onClose={() => setOpen(false)} />
        <div className="app-body">
          <Topbar onMenu={() => setOpen(true)} />
          <main id="main-content" className="page-content" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </AuthGuard>
  );
}
