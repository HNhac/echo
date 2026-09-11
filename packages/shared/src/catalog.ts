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
};

const KID_SIZES = ["90", "100", "110", "120", "130", "140"];

export const categories = [
  {
    slug: "vay",
    name: "Váy đầm",
    description: "Váy xòe, đầm tiệc, đầm đi học",
    image:
      "https://images.unsplash.com/photo-1471286174890-9c00182169d7?w=800&q=80",
  },
  {
    slug: "set",
    name: "Set bộ",
    description: "Áo quần đồng bộ, dễ mix, dễ giặt",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",
  },
  {
    slug: "ao",
    name: "Áo",
    description: "Áo thun, sơ mi, cardigan mỏng",
    image:
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&q=80",
  },
  {
    slug: "phu-kien",
    name: "Phụ kiện",
    description: "Nơ, kẹp tóc, tất, túi mini",
    image:
      "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=800&q=80",
  },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export const products: Product[] = [
  {
    id: "1",
    slug: "vay-xoe-nang-hong",
    name: "Váy xòe nắng hồng",
    category: "Váy đầm",
    categorySlug: "vay",
    price: 289000,
    priceFmt: "289.000₫",
    image:
      "https://images.unsplash.com/photo-1471286174890-9c00182169d7?w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1471286174890-9c00182169d7?w=960&q=80",
      "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=960&q=80",
      "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=960&q=80",
    ],
    badge: "Mới",
    featured: true,
    flashPct: 18,
    description: "Váy cotton xòe nhẹ, nơ lưng — mặc đi chơi, chụp ảnh cực xinh.",
    detail:
      "Vải cotton mềm, không xù. Có lớp lót trong. Giặt máy nhẹ, không tẩy. Size 90–140 (khoảng 1–10 tuổi).",
    sizes: KID_SIZES,
    colors: ["Hồng pastel", "Kem", "Tím nhạt"],
  },
  {
    id: "2",
    slug: "dam-cong-chua-voan",
    name: "Đầm công chúa voan",
    category: "Váy đầm",
    categorySlug: "vay",
    price: 359000,
    priceFmt: "359.000₫",
    image:
      "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=960&q=80",
      "https://images.unsplash.com/photo-1471286174890-9c00182169d7?w=960&q=80",
      "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=960&q=80",
    ],
    featured: true,
    description: "Đầm tiệc voan 2 lớp, tay bồng — sinh nhật, thôi nôi, sự kiện nhỏ.",
    detail: "Lót cotton sát da. Khóa sau ẩn. Ủi hơi nước, không ủi trực tiếp voan.",
    sizes: KID_SIZES,
    colors: ["Trắng kem", "Hồng baby"],
  },
  {
    id: "3",
    slug: "set-bo-nang-he",
    name: "Set bộ nắng hè",
    category: "Set bộ",
    categorySlug: "set",
    price: 259000,
    priceFmt: "259.000₫",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=960&q=80",
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=960&q=80",
      "https://images.unsplash.com/photo-1476234251651-f353703a034d?w=960&q=80",
    ],
    featured: true,
    flashPct: 22,
    description: "Áo + quần short đồng bộ, co giãn — bé chạy nhảy thoải mái.",
    detail: "Cotton 100%, bo chun mềm. Giặt máy, phơi mát.",
    sizes: KID_SIZES,
    colors: ["Vàng kem", "Xanh mint", "Hồng"],
  },
  {
    id: "4",
    slug: "set-di-hoc-ke-caro",
    name: "Set đi học kẻ caro",
    category: "Set bộ",
    categorySlug: "set",
    price: 279000,
    priceFmt: "279.000₫",
    image:
      "https://images.unsplash.com/photo-1476234251651-f353703a034d?w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1476234251651-f353703a034d?w=960&q=80",
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=960&q=80",
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=960&q=80",
    ],
    badge: "Bán chạy",
    featured: true,
    description: "Set caro nhẹ nhàng, túi giả — mặc lớp, dã ngoại đều dễ.",
    detail: "Vải thô mềm, không xước da. Có túi quần.",
    sizes: KID_SIZES,
    colors: ["Caro hồng", "Caro be"],
  },
  {
    id: "5",
    slug: "ao-thun-hoa-nhi",
    name: "Áo thun họa nhi",
    category: "Áo",
    categorySlug: "ao",
    price: 159000,
    priceFmt: "159.000₫",
    image:
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=960&q=80",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=960&q=80",
      "https://images.unsplash.com/photo-1632642968865-2fdec5b39543?w=960&q=80",
    ],
    featured: true,
    description: "Áo thun cotton in họa tiết hoa nhỏ — mix váy hoặc quần short.",
    detail: "180gsm, cổ tròn mềm. In không bong.",
    sizes: KID_SIZES,
    colors: ["Trắng", "Hồng", "Vàng"],
  },
  {
    id: "6",
    slug: "cardigan-mong-kem",
    name: "Cardigan mỏng kem",
    category: "Áo",
    categorySlug: "ao",
    price: 219000,
    priceFmt: "219.000₫",
    image:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=960&q=80",
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=960&q=80",
      "https://images.unsplash.com/photo-1632642968865-2fdec5b39543?w=960&q=80",
    ],
    featured: true,
    flashPct: 15,
    description: "Áo khoác len mỏng, nút ngọc — khoác ngoài đầm khi máy lạnh.",
    detail: "Len cotton blend, không xù nhiều. Giặt tay hoặc túi lưới.",
    sizes: KID_SIZES,
    colors: ["Kem", "Hồng sữa"],
  },
  {
    id: "7",
    slug: "ao-so-mi-be-linen",
    name: "Sơ mi bé linen",
    category: "Áo",
    categorySlug: "ao",
    price: 189000,
    priceFmt: "189.000₫",
    image:
      "https://images.unsplash.com/photo-1632642968865-2fdec5b39543?w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1632642968865-2fdec5b39543?w=960&q=80",
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=960&q=80",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=960&q=80",
    ],
    description: "Sơ mi linen mát, tay lỡ — mặc lớp hoặc đi chơi cùng chân váy.",
    detail: "Linen pha, nhăn nhẹ tự nhiên. Cài nút trước.",
    sizes: KID_SIZES,
    colors: ["Trắng ngà", "Xanh baby"],
  },
  {
    id: "8",
    slug: "kep-no-nhung",
    name: "Kẹp nơ nhung",
    category: "Phụ kiện",
    categorySlug: "phu-kien",
    price: 59000,
    priceFmt: "59.000₫",
    image:
      "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=960&q=80",
      "https://images.unsplash.com/photo-1601924638867-3a6f8a584f6b?w=960&q=80",
      "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=960&q=80",
    ],
    featured: true,
    flashPct: 20,
    description: "Set 2 kẹp nơ nhung — kẹp tóc mái, không đau da đầu.",
    detail: "Kẹp cá sấu bọc vải. One size.",
    sizes: ["One size"],
    colors: ["Hồng", "Kem", "Đỏ cherry"],
  },
  {
    id: "9",
    slug: "tui-mini-gau",
    name: "Túi mini gấu",
    category: "Phụ kiện",
    categorySlug: "phu-kien",
    price: 129000,
    priceFmt: "129.000₫",
    image:
      "https://images.unsplash.com/photo-1601924638867-3a6f8a584f6b?w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1601924638867-3a6f8a584f6b?w=960&q=80",
      "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=960&q=80",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=960&q=80",
    ],
    description: "Túi đeo chéo mini, đựng khăn giấy và son dưỡng của mẹ.",
    detail: "Dây điều chỉnh. Khóa kéo. Lau ẩm được.",
    sizes: ["One size"],
    colors: ["Kem gấu", "Hồng"],
  },
  {
    id: "10",
    slug: "tat-co-nho-set",
    name: "Set tất cổ nhỏ",
    category: "Phụ kiện",
    categorySlug: "phu-kien",
    price: 79000,
    priceFmt: "79.000₫",
    image:
      "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=720&q=80",
    images: [
      "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=960&q=80",
      "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=960&q=80",
      "https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=960&q=80",
    ],
    flashPct: 12,
    description: "Set 3 đôi tất cotton, cổ thấp — đi giày búp bê hoặc sneaker.",
    detail: "Cotton thoáng. Size 90–140 tương ứng bàn chân.",
    sizes: ["90–110", "120–140"],
    colors: ["Mix pastel"],
  },
];

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

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategorySlug(categorySlug: string | undefined) {
  return productsByCategory(products, categorySlug);
}

export function getFeaturedProducts(): Product[] {
  return featuredOf(products);
}

export const featuredProducts = getFeaturedProducts();

export function formatVnd(n: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(n)}₫`;
}

export function productUnitPrice(product: Product): number {
  if (product.flashPct == null || product.flashPct <= 0) return product.price;
  const raw = (product.price * (100 - product.flashPct)) / 100;
  return Math.round(raw / 1000) * 1000;
}

export function flashSalePriceFmt(product: Product): string | null {
  if (product.flashPct == null || product.flashPct <= 0) return null;
  return formatVnd(productUnitPrice(product));
}

export function getFlashSaleProducts(): Product[] {
  return flashSaleOf(products);
}

export function getPicksRailProducts(): Product[] {
  return picksRailOf(products);
}
