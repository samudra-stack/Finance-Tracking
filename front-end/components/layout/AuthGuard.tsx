"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useFinance } from "@/contexts/FinanceContext";
export function AuthGuard({ children }: { children: ReactNode }) {
  const { ready, session } = useFinance();
  const router = useRouter();
  useEffect(() => {
    if (ready && !session.loggedIn) router.replace("/");
  }, [ready, session.loggedIn, router]);
  return ready && session.loggedIn ? (
    children
  ) : (
    <main className="empty-state" role="status">
      Memeriksa sesi…
    </main>
  );
}
