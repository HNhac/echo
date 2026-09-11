import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { categories, products, type Order, type Product, type StaffUser } from "@echo/shared";
import { seedOwner } from "./auth.js";

export type Db = {
  products: Product[];
  orders: Order[];
  users: StaffUser[];
};

const dir = dirname(fileURLToPath(import.meta.url));
const dataDir = join(dir, "..", "data");
const dbPath = join(dataDir, "db.json");

function emptyDb(): Db {
  return {
    products: structuredClone(products),
    orders: [],
    users: [seedOwner()],
  };
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
    raw.products = structuredClone(products);
    dirty = true;
  }
  if (!Array.isArray(raw.orders)) {
    raw.orders = [];
    dirty = true;
  }
  if (!Array.isArray(raw.users) || raw.users.length === 0) {
    raw.users = [seedOwner()];
    dirty = true;
  }
  if (dirty) saveDb(raw);
  return raw;
}

export function saveDb(db: Db) {
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export { categories, dataDir };
