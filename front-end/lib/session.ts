import { STORAGE_KEYS } from "./constants";
import type { StoragePort } from "./storage";
import type { Session } from "../types/finance";
import { validEmail } from "./validators";

type Port = StoragePort | null;
const warning = "Sesi atau email tidak dapat disimpan di browser. Sesi dapat berakhir setelah refresh; logout lintas tab mungkin tidak tersedia.";
function required(storage: Port): StoragePort {
  if (!storage) throw new Error("Storage unavailable");
  return storage;
}
function rememberedEmail(local: Port): string {
  const storage = required(local);
  let raw = storage.getItem(STORAGE_KEYS.rememberedEmail);
  if (raw === null) {
    // Only migrate the email. A legacy persistent login never grants access.
    const legacy = JSON.parse(storage.getItem(STORAGE_KEYS.session) ?? "null");
    const email = typeof legacy?.rememberedEmail === "string" && validEmail(legacy.rememberedEmail)
      ? legacy.rememberedEmail : "";
    raw = JSON.stringify(email);
    storage.setItem(STORAGE_KEYS.rememberedEmail, raw);
    storage.setItem(STORAGE_KEYS.session, JSON.stringify({ loggedIn: false, rememberedEmail: "" }));
  }
  const email: unknown = JSON.parse(raw);
  if (typeof email !== "string" || (email && !validEmail(email))) throw new Error("Invalid email");
  return email;
}
export function readSession(local: Port, tab: Port): { session: Session; warning: string } {
  const session: Session = { loggedIn: false, rememberedEmail: "" };
  let issue = "";
  try { session.rememberedEmail = rememberedEmail(local); } catch { issue = warning; }
  try {
    const saved = JSON.parse(required(tab).getItem(STORAGE_KEYS.tabSession) ?? "null");
    const version = required(local).getItem(STORAGE_KEYS.logoutVersion) ?? "";
    session.loggedIn = saved?.loggedIn === true && typeof saved.logoutVersion === "string" && saved.logoutVersion === version;
  } catch { issue = warning; }
  return { session, warning: issue };
}
export function startSession(local: Port, tab: Port, email: string, remember: boolean) {
  const session: Session = { loggedIn: true, rememberedEmail: remember ? email : "" };
  let issue = "";
  try { required(local).setItem(STORAGE_KEYS.rememberedEmail, JSON.stringify(session.rememberedEmail)); } catch { issue = warning; }
  try {
    const version = required(local).getItem(STORAGE_KEYS.logoutVersion) ?? "";
    required(tab).setItem(STORAGE_KEYS.tabSession, JSON.stringify({ loggedIn: true, logoutVersion: version }));
  } catch { issue = warning; }
  return { session, warning: issue };
}
export function endSession(local: Port, tab: Port, version: string): string {
  let issue = "";
  try { required(tab).setItem(STORAGE_KEYS.tabSession, JSON.stringify({ loggedIn: false, logoutVersion: version })); } catch { issue = warning; }
  try { required(local).setItem(STORAGE_KEYS.logoutVersion, version); } catch { issue = warning; }
  return issue;
}
