import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { dataDir, loadDb, saveDb } from "./db.js";

const MAX_BYTES = 8 * 1024 * 1024;
const MASTER_PX = 1600;
const THUMB_PX = 720;
const MASTER_Q = 78;
const THUMB_Q = 70;

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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

function stemOf(name: string) {
  return name.replace(/\.sm\.webp$/i, "").replace(/\.[a-zA-Z0-9]+$/, "");
}

function masterFile(stem: string) {
  return `${stem}.webp`;
}

function thumbFile(stem: string) {
  return `${stem}.sm.webp`;
}

async function encodeWebp(input: Buffer, maxPx: number, quality: number) {
  return sharp(input, { failOn: "error", animated: false })
    .rotate()
    .resize({
      width: maxPx,
      height: maxPx,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 4, smartSubsample: true })
    .toBuffer();
}

export async function saveUpload(file: File) {
  if (file.size > MAX_BYTES) {
    return { error: "Ảnh tối đa 8MB", status: 400 as const };
  }
  if (!ALLOWED.has(file.type)) {
    return { error: "Chỉ nhận JPG, PNG, WEBP hoặc GIF", status: 400 as const };
  }
  const stem = `${Date.now()}-${randomBytes(4).toString("hex")}`;
  const buf = Buffer.from(await file.arrayBuffer());
  try {
    const [master, thumb] = await Promise.all([
      encodeWebp(buf, MASTER_PX, MASTER_Q),
      encodeWebp(buf, THUMB_PX, THUMB_Q),
    ]);
    const dir = uploadsDir();
    writeFileSync(join(dir, masterFile(stem)), master);
    writeFileSync(join(dir, thumbFile(stem)), thumb);
    return { url: `/uploads/${masterFile(stem)}` };
  } catch {
    return { error: "Không đọc được ảnh", status: 400 as const };
  }
}

function findMasterPath(stem: string) {
  const dir = uploadsDir();
  const webp = join(dir, masterFile(stem));
  if (existsSync(webp)) return webp;
  const hit = readdirSync(dir).find((name) => !name.endsWith(".sm.webp") && stemOf(name) === stem);
  return hit ? join(dir, hit) : null;
}

export async function readUpload(name: string) {
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) return null;
  const dir = uploadsDir();
  const direct = join(dir, name);
  if (existsSync(direct)) {
    const mime = name.endsWith(".webp") ? "image/webp" : (MIME[extname(name).toLowerCase()] ?? "application/octet-stream");
    return { body: readFileSync(direct), mime };
  }
  if (!name.endsWith(".sm.webp")) return null;
  const master = findMasterPath(stemOf(name));
  if (!master) return null;
  try {
    const thumb = await encodeWebp(readFileSync(master), THUMB_PX, THUMB_Q);
    writeFileSync(join(dir, name), thumb);
    return { body: thumb, mime: "image/webp" };
  } catch {
    return null;
  }
}

export async function compressLegacyUploads() {
  const dir = uploadsDir();
  const names = readdirSync(dir).filter((name) => !name.endsWith(".sm.webp"));
  const rewrite = new Map<string, string>();

  for (const name of names) {
    const from = join(dir, name);
    const stem = stemOf(name);
    const dest = join(dir, masterFile(stem));
    const thumb = join(dir, thumbFile(stem));
    try {
      const buf = readFileSync(from);
      if (name.endsWith(".webp") && existsSync(thumb)) continue;
      const [master, sm] = await Promise.all([
        encodeWebp(buf, MASTER_PX, MASTER_Q),
        encodeWebp(buf, THUMB_PX, THUMB_Q),
      ]);
      writeFileSync(dest, master);
      writeFileSync(thumb, sm);
      if (from !== dest) {
        unlinkSync(from);
        rewrite.set(`/uploads/${name}`, `/uploads/${masterFile(stem)}`);
      }
    } catch {
      // keep the original file
    }
  }

  if (!rewrite.size) return;
  const db = loadDb();
  let dirty = false;
  db.products = db.products.map((product) => {
    const image = rewrite.get(product.image) ?? product.image;
    const images = product.images.map((src) => rewrite.get(src) ?? src);
    if (image === product.image && images.every((src, i) => src === product.images[i])) return product;
    dirty = true;
    return { ...product, image, images };
  });
  if (dirty) saveDb(db);
}
