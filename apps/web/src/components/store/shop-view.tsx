import { ShopLink as Link } from "@/components/store/shop-link";
import { categories, productsByCategory, type CategorySlug, type Product } from "@/data/catalog";
import { ProductCard } from "@/components/product/product-card";
import { EmptyCatalog } from "@/components/store/empty-catalog";

function isCategorySlug(v: string | undefined): v is CategorySlug {
  return categories.some((c) => c.slug === v);
}

export function ShopView({
  products,
  categorySlug,
}: {
  products: Product[];
  categorySlug?: CategorySlug;
}) {
  const slug = isCategorySlug(categorySlug) ? categorySlug : undefined;
  const activeCategory = slug ? categories.find((c) => c.slug === slug) : undefined;
  const list = productsByCategory(products, slug);

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
            {activeCategory ? activeCategory.description : "Váy, set bộ, áo và phụ kiện — size 90–140."}
          </p>
          <p className="mt-2 text-sm tabular-nums text-[var(--ink-faint)]">{list.length} sản phẩm</p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link
            href="/san-pham"
            className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
              !slug
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
                slug === c.slug
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--ink-faint)]"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {list.length ? (
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyCatalog />
        )}
      </div>
    </div>
  );
}
