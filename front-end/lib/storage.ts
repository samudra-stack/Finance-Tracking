import { createSeed, emptyState } from "../data/mock-data";
import type { FinanceState } from "../types/finance";
import { STORAGE_KEYS } from "./constants";
import { isFinanceState } from "./validators";
export type StoragePort = Pick<Storage, "getItem" | "setItem">;
export function loadFinance(storage: StoragePort): {
  state: FinanceState;
  warning: string;
  writable: boolean;
} {
  try {
    const raw = storage.getItem(STORAGE_KEYS.data);
    if (raw === null)
      return { state: createSeed(), warning: "", writable: true };
    const parsed: unknown = JSON.parse(raw);
    if (!isFinanceState(parsed)) throw new Error("invalid");
    return { state: parsed, warning: "", writable: true };
  } catch {
    return {
      state: emptyState(),
      writable: false,
      warning:
        "Data lokal rusak atau penyimpanan tidak dapat dibaca. Aplikasi memakai data kosong sementara dalam memori; perubahan tidak disimpan. Data lama tidak ditimpa. Gunakan Reset data untuk memulai ulang.",
    };
  }
}
export function saveStorage(
  storage: StoragePort,
  key: string,
  value: unknown,
): string {
  try {
    storage.setItem(key, JSON.stringify(value));
    return "";
  } catch {
    return "Penyimpanan browser gagal. Perubahan hanya tersedia dalam memori dan dapat hilang setelah refresh.";
  }
}
