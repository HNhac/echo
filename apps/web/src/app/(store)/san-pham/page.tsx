import Link from "next/link";
import type { Metadata } from "next";
import {
  categories,
  productsByCategory,
  type CategorySlug,
} from "@/data/catalog";
import { ProductCard } from "@/components/product/product-card";
import { brandPageTitle } from "@/config/brand";
import { fetchProducts } from "@/lib/store-api";

export const metadata: Metadata = {
  title: brandPageTitle("Cửa hàng"),
  description: "Váy đầm, set bộ, áo và phụ kiện bé gái — size 90–140.",
};

type Search = { "danh-muc"?: string };

function isCategorySlug(v: string | undefined): v is CategorySlug {
  return categories.some((c) => c.slug === v);
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const filter = sp["danh-muc"];
  const categorySlug = isCategorySlug(filter) ? filter : undefined;
  const list = productsByCategory(await fetchProducts(), categorySlug);
  const activeCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : undefined;

  return (
    <div className="bg-[var(--surface)]">
      <div className="shop-wrap py-12 sm:py-16">
        <nav aria-label="Breadcrumb" className="text-center text-sm text-[var(--ink-muted)]">
          <Link href="/" className="hover:text-[var(--ink)]">
            Trang chủ
          </Link>
          <span className="mx-2 text-[var(--ink-faint)]">/</span>
          <span className="text-[var(--ink)]">Cửa hàng</span>
        </nav>

        <div className="section-head mt-8">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[var(--ink)] sm:text-5xl">
            {activeCategory ? activeCategory.name : "Cửa hàng bé gái"}
          </h1>
          <p className="mt-3 text-[var(--ink-muted)]">
            {activeCategory
              ? activeCategory.description
              : "Váy, set bộ, áo và phụ kiện — size 90–140."}
          </p>
          <p className="mt-2 text-sm tabular-nums text-[var(--ink-faint)]">{list.length} sản phẩm</p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link
            href="/san-pham"
            className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
              !categorySlug
                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--ink-faint)]"
            }`}
          >
            Tất cả
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/san-pham?danh-muc=${c.slug}`}
              className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
                categorySlug === c.slug
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--ink-faint)]"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
