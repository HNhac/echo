export const API = "/echo-api";
export const KEY_STORAGE = "echo-admin-key";

export function adminHeaders(key: string): HeadersInit {
  return { "Content-Type": "application/json", "x-admin-key": key };
}
