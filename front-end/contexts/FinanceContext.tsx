"use client";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { emptyState } from "@/data/mock-data";
import { financeReducer, type FinanceAction } from "@/lib/reducer";
import { loadFinance, saveStorage } from "@/lib/storage";
import { readSession, startSession, endSession } from "@/lib/session";
import { readAvatar, storeAvatar } from "@/lib/avatar";
import { STORAGE_KEYS } from "@/lib/constants";
import type { FinanceState, Session } from "@/types/finance";
interface FinanceValue {
  state: FinanceState;
  ready: boolean;
  session: Session;
  execute: (action: FinanceAction) => string | null;
  login: (email: string, remember: boolean) => void;
  logout: () => void;
  avatar: string;
  updateAvatar: (value: string) => string | null;
}
function browserStorage(kind: "localStorage" | "sessionStorage") {
  try { return window[kind]; } catch { return null; }
}
const FinanceContext = createContext<FinanceValue | null>(null);
export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, undefined, emptyState);
  const current = useRef(state);
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session>({
    loggedIn: false,
    rememberedEmail: "",
  });
  const [warning, setWarning] = useState("");
  const [sessionWarning, setSessionWarning] = useState("");
  const [avatar, setAvatar] = useState("");
  const channel = useRef<BroadcastChannel | null>(null);
  const writable = useRef(false);
  useEffect(() => {
    // Browser storage is an external system, loaded only after mount.
    const init = () => {
      try {
        const result = loadFinance(window.localStorage);
        writable.current = result.writable;
        current.current = result.state;
        dispatch({ type: "LOAD_DATA", payload: result.state });
        setWarning(result.warning);
        if (result.writable)
          setWarning(
            saveStorage(window.localStorage, STORAGE_KEYS.data, result.state),
          );
      } catch {
        setWarning(
          "Penyimpanan browser diblokir. Data dan sesi hanya tersedia dalam memori; refresh akan menghilangkannya.",
        );
      }
      const saved = readSession(browserStorage("localStorage"), browserStorage("sessionStorage"));
      setSession(saved.session);
      setSessionWarning(saved.warning);
      setAvatar(readAvatar(browserStorage("localStorage")));
      setReady(true);
    };
    init();
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.data && event.newValue !== null) {
        const result = loadFinance(window.localStorage);
        writable.current = result.writable;
        if (result.writable) {
          current.current = result.state;
          dispatch({ type: "LOAD_DATA", payload: result.state });
        }
        setWarning(result.warning);
      }
      if (event.key === STORAGE_KEYS.avatar || event.key === null)
        setAvatar(readAvatar(browserStorage("localStorage")));
      if (event.key === STORAGE_KEYS.logoutVersion || event.key === STORAGE_KEYS.rememberedEmail || event.key === null) {
        const saved = readSession(browserStorage("localStorage"), browserStorage("sessionStorage"));
        setSession(saved.session);
        setSessionWarning(saved.warning);
      }
    };
    const recheck = () => {
      const saved = readSession(browserStorage("localStorage"), browserStorage("sessionStorage"));
      setSession(saved.session);
      setSessionWarning(saved.warning);
    };
    try {
      channel.current = new BroadcastChannel("myfinance-session");
      channel.current.onmessage = (event) => {
        if (event.data !== "logout") return;
        try { browserStorage("sessionStorage")?.setItem(STORAGE_KEYS.tabSession, "null"); } catch { /* In-memory logout still applies. */ }
        setSession((previous) => ({ ...previous, loggedIn: false }));
      };
    } catch { /* Storage events remain available when BroadcastChannel is unsupported. */ }
    window.addEventListener("storage", sync);
    window.addEventListener("pageshow", recheck);
    window.addEventListener("focus", recheck);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("pageshow", recheck);
      window.removeEventListener("focus", recheck);
      channel.current?.close();
      channel.current = null;
    };
  }, []);
  useEffect(() => {
    if (ready) document.documentElement.dataset.theme = state.preference.theme;
  }, [ready, state.preference.theme]);
  function execute(action: FinanceAction): string | null {
    try {
      const next = financeReducer(current.current, action);
      current.current = next;
      dispatch(action);
      if (action.type === "RESET_DATA") writable.current = true;
      if (writable.current) {
        try {
          setWarning(saveStorage(window.localStorage, STORAGE_KEYS.data, next));
        } catch {
          setWarning(
            "Penyimpanan browser diblokir. Perubahan hanya tersedia dalam memori.",
          );
        }
      }
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : "Perubahan gagal.";
    }
  }
  return (
    <FinanceContext.Provider
      value={{
        state,
        ready,
        session,
        execute,
        login: (email, remember) => {
          const result = startSession(browserStorage("localStorage"), browserStorage("sessionStorage"), email, remember);
          setSession(result.session);
          setSessionWarning(result.warning);
        },
        logout: () => {
          setSession((previous) => ({ ...previous, loggedIn: false }));
          setSessionWarning(endSession(browserStorage("localStorage"), browserStorage("sessionStorage"), crypto.randomUUID()));
          channel.current?.postMessage("logout");
        },
        avatar,
        updateAvatar: (value) => {
          const error = storeAvatar(browserStorage("localStorage"), value);
          if (!error) setAvatar(value);
          return error;
        },
      }}
    >
      {(warning || sessionWarning) && (
        <div className="storage-warning" role="alert">
          {warning} {sessionWarning}
        </div>
      )}
      {children}
    </FinanceContext.Provider>
  );
}
export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("FinanceProvider diperlukan.");
  return context;
}
