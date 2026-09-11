import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  categories,
  mergeSeoPages,
  storeImagePaths,
  type Order,
  type Product,
  type SeoPage,
  type StaffUser,
} from "@echo/shared";
import { seedOwner } from "./auth.js";

export type Db = {
  products: Product[];
  orders: Order[];
  users: StaffUser[];
  pages: SeoPage[];
};

const dir = dirname(fileURLToPath(import.meta.url));
const dataDir = join(dir, "..", "data");
const dbPath = join(dataDir, "db.json");

function emptyDb(): Db {
  return {
    products: [],
    orders: [],
    users: [seedOwner()],
    pages: mergeSeoPages([]),
  };
}

function storeProduct(product: Product): Product | null {
  const images = storeImagePaths([product.image, ...(product.images ?? [])]);
  if (!images.length) return null;
  return { ...product, image: images[0], images };
}

export function loadDb(): Db {
  if (!existsSync(dbPath)) {
    mkdirSync(dataDir, { recursive: true });
    const seed = emptyDb();
    writeFileSync(dbPath, JSON.stringify(seed, null, 2));
    return seed;
  }
  const raw = JSON.parse(readFileSync(dbPath, "utf8")) as Db;
  let dirty = false;
  if (!Array.isArray(raw.products)) {
    raw.products = [];
    dirty = true;
  } else {
    const cleaned = raw.products.map(storeProduct).filter((p): p is Product => Boolean(p));
    if (cleaned.length !== raw.products.length) {
      raw.products = cleaned;
      dirty = true;
    } else {
      raw.products = cleaned;
    }
  }
  if (!Array.isArray(raw.orders)) {
    raw.orders = [];
    dirty = true;
  }
  if (!Array.isArray(raw.users) || raw.users.length === 0) {
    raw.users = [seedOwner()];
    dirty = true;
  }
  const pages = mergeSeoPages(raw.pages);
  if (JSON.stringify(pages) !== JSON.stringify(raw.pages ?? [])) {
    raw.pages = pages;
    dirty = true;
  } else {
    raw.pages = pages;
  }
  if (dirty) saveDb(raw);
  return raw;
}

export function saveDb(db: Db) {
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export { categories, dataDir };
