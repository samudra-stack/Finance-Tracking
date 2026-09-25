"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Toast } from "@/components/ui/Toast";
const ToastContext = createContext<((message: string) => void) | null>(null);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((value: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(value);
    timer.current = setTimeout(() => setMessage(""), 6500);
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <ToastContext value={notify}>
      {children}
      <Toast message={message} onClose={() => setMessage("")} />
    </ToastContext>
  );
}
export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast harus berada dalam ToastProvider");
  return value;
}
