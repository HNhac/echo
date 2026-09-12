import type { Banner } from "./banner";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  priceFmt: string;
  salePrice?: number;
  saleKind?: "amount" | "percent";
  image: string;
  images: string[];
  badge?: string;
  featured?: boolean;
  flashPct?: number;
  description: string;
  detail: string;
  sizes: string[];
  colors: string[];
  stock?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
};

export const DEFAULT_CATEGORIES: Category[] = [
  {
    slug: "vay",
    name: "Váy đầm",
    description: "Váy xòe, đầm tiệc, đầm đi học",
  },
  {
    slug: "set",
    name: "Set bộ",
    description: "Áo quần đồng bộ, dễ mix, dễ giặt",
  },
  {
    slug: "ao",
    name: "Áo",
    description: "Áo thun, sơ mi, cardigan mỏng",
  },
  {
    slug: "phu-kien",
    name: "Phụ kiện",
    description: "Nơ, kẹp tóc, tất, túi mini",
  },
];

export const categories = DEFAULT_CATEGORIES;

export type CategorySlug = string;

export function slugifyLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function uniqueCategorySlug(name: string, taken: string[], preferred?: string) {
  const base = slugifyLabel(preferred || name) || "nhom";
  if (!taken.includes(base)) return base;
  let i = 2;
  while (taken.includes(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

export function isUploadPath(src: string | undefined): src is string {
  return Boolean(src && src.startsWith("/uploads/"));
}

export type MediaSize = "full" | "sm";

export function uploadVariant(src: string | undefined, size: MediaSize = "full"): string {
  if (!isUploadPath(src)) return "";
  if (size === "sm") {
    if (src.endsWith(".sm.webp")) return src;
    return src.replace(/\.[a-zA-Z0-9]+$/, ".sm.webp");
  }
  return src;
}

export function storeImagePaths(paths: Array<string | undefined>) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of paths) {
    if (!isUploadPath(raw) || seen.has(raw)) continue;
    seen.add(raw);
    out.push(raw);
  }
  return out;
}

export function productImages(product: Pick<Product, "image" | "images">) {
  return storeImagePaths([product.image, ...(product.images ?? [])]);
}

export function productsByCategory(list: Product[], categorySlug?: string) {
  if (!categorySlug) return list;
  return list.filter((p) => p.categorySlug === categorySlug);
}

export function featuredOf(list: Product[]) {
  return list.filter((p) => p.featured);
}

export type SaleKind = "amount" | "percent";

export type SaleInput = {
  salePrice?: number | null;
  flashPct?: number | null;
  saleKind?: SaleKind | null;
};

function pctSalePrice(price: number, pct: number) {
  return Math.round((price * (100 - pct)) / 100 / 1000) * 1000;
}

export function saleAmount(product: Product): number | null {
  if (product.saleKind === "percent" && product.flashPct != null && product.flashPct > 0) {
    const next = pctSalePrice(product.price, product.flashPct);
    return next > 0 && next < product.price ? next : null;
  }
  if (product.salePrice != null && product.salePrice > 0 && product.salePrice < product.price) {
    return product.salePrice;
  }
  if (product.flashPct != null && product.flashPct > 0) {
    const next = pctSalePrice(product.price, product.flashPct);
    return next > 0 && next < product.price ? next : null;
  }
  return null;
}

export function flashPctOf(product: Product): number {
  if (product.saleKind === "percent" && product.flashPct != null && product.flashPct > 0) {
    return Math.min(99, Math.round(product.flashPct));
  }
  if (product.salePrice != null && product.salePrice > 0 && product.salePrice < product.price) {
    return Math.max(1, Math.round((1 - product.salePrice / product.price) * 100));
  }
  return product.flashPct ?? 0;
}

export function applySaleFields(price: number, sale?: number | SaleInput | null) {
  const input: SaleInput = typeof sale === "number" ? { saleKind: "amount", salePrice: sale } : (sale ?? {});
  const kind = input.saleKind === "percent" ? "percent" : input.saleKind === "amount" ? "amount" : undefined;
  const pct = Number(input.flashPct);
  const amount = Number(input.salePrice);

  if (kind === "percent" || (kind !== "amount" && !(amount > 0) && pct > 0)) {
    if (pct > 0 && pct < 100) {
      const salePrice = pctSalePrice(price, pct);
      if (salePrice > 0 && salePrice < price) {
        return { salePrice, flashPct: Math.round(pct), saleKind: "percent" as const };
      }
    }
    return { salePrice: undefined, flashPct: undefined, saleKind: undefined };
  }

  if (amount > 0 && amount < price) {
    return {
      salePrice: amount,
      flashPct: Math.max(1, Math.round((1 - amount / price) * 100)),
      saleKind: "amount" as const,
    };
  }
  return { salePrice: undefined, flashPct: undefined, saleKind: undefined };
}

export function flashSaleOf(list: Product[]) {
  return list.filter((p) => saleAmount(p) != null);
}

export function picksRailOf(list: Product[]) {
  const flashSlugs = new Set(flashSaleOf(list).map((p) => p.slug));
  const feat = list.filter((p) => p.featured && !flashSlugs.has(p.slug));
  const rest = list.filter((p) => !p.featured && !flashSlugs.has(p.slug));
  const out: Product[] = [];
  const seen = new Set<string>();
  for (const p of [...feat, ...rest]) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    out.push(p);
    if (out.length >= 12) break;
  }
  return out;
}

export function lookSlidesOf(list: Product[]) {
  const withImage = list.filter((p) => isUploadPath(p.image));
  const featured = featuredOf(withImage);
  return (featured.length ? featured : withImage).slice(0, 8);
}

export function categoriesWithCovers(list: Product[], cats: Category[] = DEFAULT_CATEGORIES) {
  return cats
    .map((c) => {
      const cover = list.find((p) => p.categorySlug === c.slug && isUploadPath(p.image));
      if (!cover) return null;
      return { ...c, image: cover.image };
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
}

export function formatVnd(n: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(n)}₫`;
}

export function productUnitPrice(product: Product): number {
  return saleAmount(product) ?? product.price;
}

export type HomeCatalog = {
  featured: Product[];
  flash: Product[];
  picks: Product[];
  looks: Product[];
  categories: Array<Category & { image: string }>;
  banners: Banner[];
  bannerEnabled?: boolean;
  seasonTheme?: import("./banner").SeasonThemeId;
  seasonFx?: import("./banner").SeasonFx;
};

export function homeCatalogOf(list: Product[], cats: Category[] = DEFAULT_CATEGORIES): HomeCatalog {
  return {
    featured: featuredOf(list),
    flash: flashSaleOf(list),
    picks: picksRailOf(list),
    looks: lookSlidesOf(list),
    categories: categoriesWithCovers(list, cats),
    banners: [],
  };
}

export function flashSalePriceFmt(product: Product): string | null {
  const sale = saleAmount(product);
  return sale == null ? null : formatVnd(sale);
}
