export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: "vay" | "set" | "ao" | "phu-kien";
  price: number;
  priceFmt: string;
  image: string;
  images: string[];
  badge?: string;
  featured?: boolean;
  flashPct?: number;
  description: string;
  detail: string;
  sizes: string[];
  colors: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
};

export const categories = [
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
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export function isUploadPath(src: string | undefined): src is string {
  return Boolean(src && src.startsWith("/uploads/"));
}

export function storeImagePaths(paths: Array<string | undefined>) {
  return paths.filter((p): p is string => isUploadPath(p));
}

export function productsByCategory(list: Product[], categorySlug?: string) {
  if (!categorySlug) return list;
  return list.filter((p) => p.categorySlug === categorySlug);
}

export function featuredOf(list: Product[]) {
  return list.filter((p) => p.featured);
}

export function flashSaleOf(list: Product[]) {
  return list.filter((p) => (p.flashPct ?? 0) > 0);
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

export function categoriesWithCovers(list: Product[]) {
  return categories
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
  if (product.flashPct == null || product.flashPct <= 0) return product.price;
  const raw = (product.price * (100 - product.flashPct)) / 100;
  return Math.round(raw / 1000) * 1000;
}

export type HomeCatalog = {
  featured: Product[];
  flash: Product[];
  picks: Product[];
  looks: Product[];
  categories: Array<(typeof categories)[number] & { image: string }>;
};

export function homeCatalogOf(list: Product[]): HomeCatalog {
  return {
    featured: featuredOf(list),
    flash: flashSaleOf(list),
    picks: picksRailOf(list),
    looks: lookSlidesOf(list),
    categories: categoriesWithCovers(list),
  };
}

export function flashSalePriceFmt(product: Product): string | null {
  if (product.flashPct == null || product.flashPct <= 0) return null;
  return formatVnd(productUnitPrice(product));
}
