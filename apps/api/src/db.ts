import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_CATEGORIES,
  mergeSeoPages,
  normalizeBanners,
  DEFAULT_SHOP_SETTINGS,
  DEFAULT_SHOP_STORY,
  normalizeShopSettings,
  normalizeShopStory,
  storeImagePaths,
  type Banner,
  type Category,
  type Order,
  type Product,
  type SeoPage,
  type ShopSettings,
  type ShopStory,
  type StaffUser,
} from "@echo/shared";
import { seedOwner } from "./auth.js";

export type Db = {
  products: Product[];
  orders: Order[];
  users: StaffUser[];
  pages: SeoPage[];
  categories: Category[];
  banners: Banner[];
  settings: ShopSettings;
  story: ShopStory;
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
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    banners: [],
    settings: { ...DEFAULT_SHOP_SETTINGS },
    story: { ...DEFAULT_SHOP_STORY },
  };
}

function normalizeCategories(raw: unknown): Category[] {
  if (!Array.isArray(raw)) return DEFAULT_CATEGORIES.map((c) => ({ ...c }));
  const out: Category[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Partial<Category>;
    const slug = String(row.slug ?? "").trim();
    const name = String(row.name ?? "").trim();
    if (!slug || !name || seen.has(slug)) continue;
    seen.add(slug);
    out.push({
      slug,
      name,
      description: String(row.description ?? "").trim(),
    });
  }
  return out.length ? out : DEFAULT_CATEGORIES.map((c) => ({ ...c }));
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
  const cats = normalizeCategories(raw.categories);
  if (JSON.stringify(cats) !== JSON.stringify(raw.categories ?? [])) {
    raw.categories = cats;
    dirty = true;
  } else {
    raw.categories = cats;
  }
  const banners = normalizeBanners(raw.banners);
  if (JSON.stringify(banners) !== JSON.stringify(raw.banners ?? [])) {
    raw.banners = banners;
    dirty = true;
  } else {
    raw.banners = banners;
  }
  const settings = normalizeShopSettings(raw.settings);
  if (JSON.stringify(settings) !== JSON.stringify(raw.settings ?? {})) {
    raw.settings = settings;
    dirty = true;
  } else {
    raw.settings = settings;
  }
  const story = normalizeShopStory((raw as { story?: unknown }).story);
  if (JSON.stringify(story) !== JSON.stringify(raw.story ?? {})) {
    raw.story = story;
    dirty = true;
  } else {
    raw.story = story;
  }
  if (dirty) saveDb(raw);
  return raw;
}

export function saveDb(db: Db) {
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export { dataDir };
