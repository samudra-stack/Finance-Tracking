"use client";
import { useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
export function Avatar({ size = "" }: { size?: "" | "small" | "large" }) {
  const { avatar, state } = useFinance();
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <span className={`avatar ${size ? `avatar-${size}` : ""}`}>
      {avatar && failed !== avatar ? (
        // Local, compressed data URLs do not need the Next image optimizer.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt={`Foto profil ${state.preference.name}`} width={256} height={256} onError={() => setFailed(avatar)} />
      ) : state.preference.name.slice(0, 2).toUpperCase()}
    </span>
  );
}
