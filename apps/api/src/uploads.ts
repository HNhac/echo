import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { randomBytes } from "node:crypto";
import { dataDir } from "./db.js";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function uploadsDir() {
  const dir = join(dataDir, "uploads");
  mkdirSync(dir, { recursive: true });
  return dir;
}

export async function saveUpload(file: File) {
  if (file.size > MAX_BYTES) {
    return { error: "Ảnh tối đa 8MB", status: 400 as const };
  }
  const ext = ALLOWED[file.type];
  if (!ext) {
    return { error: "Chỉ nhận JPG, PNG, WEBP hoặc GIF", status: 400 as const };
  }
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  writeFileSync(join(uploadsDir(), name), buf);
  return { url: `/uploads/${name}` };
}

export function readUpload(name: string) {
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) return null;
  const file = join(uploadsDir(), name);
  if (!existsSync(file)) return null;
  const mime = MIME[extname(name).toLowerCase()] ?? "application/octet-stream";
  return { body: readFileSync(file), mime };
}
