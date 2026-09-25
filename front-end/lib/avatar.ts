import { STORAGE_KEYS } from "./constants";
import type { StoragePort } from "./storage";

export const MAX_AVATAR_FILE = 5 * 1024 * 1024;
export const MAX_AVATAR_DATA = 200 * 1024;
export function avatarFileError(file: Pick<File, "type" | "size">): string | null {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Pilih foto JPEG, PNG, atau WebP.";
  if (!file.size || file.size > MAX_AVATAR_FILE) return "Ukuran foto harus lebih dari 0 dan maksimal 5 MB.";
  return null;
}
export function validAvatar(value: unknown): value is string {
  return typeof value === "string" && (value === "" || (value.length <= MAX_AVATAR_DATA && /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value)));
}
export function readAvatar(storage: StoragePort | null): string {
  try {
    const value: unknown = JSON.parse(storage?.getItem(STORAGE_KEYS.avatar) ?? '""');
    return validAvatar(value) ? value : "";
  } catch { return ""; }
}
export function storeAvatar(storage: StoragePort | null, value: string): string | null {
  if (!validAvatar(value)) return "Foto tidak valid atau hasil kompresi terlalu besar.";
  try {
    if (!storage) throw new Error("Storage unavailable");
    storage.setItem(STORAGE_KEYS.avatar, JSON.stringify(value));
    return null;
  } catch { return "Foto gagal disimpan. Penyimpanan browser penuh atau diblokir. Foto sebelumnya tetap digunakan."; }
}
export async function prepareAvatar(file: File): Promise<string> {
  const issue = avatarFileError(file);
  if (issue) throw new Error(issue);
  const url = URL.createObjectURL(file);
  try {
    const photo = new Image();
    photo.src = url;
    await photo.decode();
    if (!photo.naturalWidth || !photo.naturalHeight) throw new Error("Invalid image");
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    context.fillStyle = "#ece9ff";
    context.fillRect(0, 0, 256, 256);
    const side = Math.min(photo.naturalWidth, photo.naturalHeight);
    context.drawImage(photo, (photo.naturalWidth - side) / 2, (photo.naturalHeight - side) / 2, side, side, 0, 0, 256, 256);
    for (const quality of [0.85, 0.7, 0.5]) {
      const result = canvas.toDataURL("image/jpeg", quality);
      if (validAvatar(result)) return result;
    }
    throw new Error("Foto masih terlalu besar setelah dikompresi.");
  } catch (error) {
    throw new Error(error instanceof Error && error.message.includes("dikompresi") ? error.message : "Foto tidak dapat dibaca. Pilih file gambar lain.");
  } finally { URL.revokeObjectURL(url); }
}
