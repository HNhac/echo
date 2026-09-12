"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  formatVnd,
  productsByCategory,
  productUnitPrice,
  saleAmount,
  type Category,
  type Product,
} from "@/data/catalog";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/motion/reveal";
import { EmptyCatalog } from "@/components/store/empty-catalog";
import { cn } from "@/lib/utils";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function formatVndInput(value: string) {
  const digits = digitsOnly(value);
  if (!digits) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(digits));
}

function matchesQuery(product: Product, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (`${product.name} ${product.slug} ${product.category}`.toLowerCase().includes(q)) return true;
  const digits = digitsOnly(q);
  if (!digits) return false;
  const amounts = [...new Set([product.price, productUnitPrice(product)])];
  return amounts.some((n) => String(n).includes(digits) || formatVnd(n).toLowerCase().includes(q));
}

function syncCategoryUrl(slug?: string) {
  const path = slug ? `/san-pham?danh-muc=${encodeURIComponent(slug)}` : "/san-pham";
  const hash = window.location.hash;
  window.history.replaceState(null, "", `${path}${hash}`);
}

const inputClass =
  "h-9 w-full rounded-lg border-0 bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none ring-1 ring-[var(--border)] placeholder:text-[var(--ink-faint)] focus:ring-2 focus:ring-[var(--accent)]/35";

function SidebarSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-[var(--border)] py-3.5 first:border-t-0 first:pt-0 last:pb-0">
      <h3 className="mb-2 text-sm font-bold text-[var(--ink)]">{title}</h3>
      {children}
    </section>
  );
}

export function ShopView({
  products,
  categories,
  categorySlug,
}: {
  products: Product[];
  categories: Category[];
  categorySlug?: string;
}) {
  const [query, setQuery] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState<"new" | "price-asc" | "price-desc">("new");
  const [saleOnly, setSaleOnly] = useState(false);
  const [cat, setCat] = useState(categorySlug);

  useEffect(() => {
    if (window.location.hash !== "#tim-kiem") return;
    document.getElementById("tim-kiem")?.focus();
  }, []);

  const slug = categories.some((c) => c.slug === cat) ? cat : undefined;
  const activeCategory = slug ? categories.find((c) => c.slug === slug) : undefined;
  const filters = [{ slug: "", name: "Tất cả" }, ...categories];
  const counts = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, p) => {
      acc[p.categorySlug] = (acc[p.categorySlug] ?? 0) + 1;
      return acc;
    }, {});
  }, [products]);
  const saleCount = useMemo(() => products.filter((p) => saleAmount(p) != null).length, [products]);

  function selectCategory(next?: string) {
    setCat(next);
    syncCategoryUrl(next);
  }

  const list = useMemo(() => {
    const min = Number(digitsOnly(priceMin)) || 0;
    const max = Number(digitsOnly(priceMax)) || 0;
    const next = productsByCategory(products, slug).filter((p) => {
      if (saleOnly && saleAmount(p) == null) return false;
      const amounts = [...new Set([p.price, productUnitPrice(p)])];
      if (min && amounts.every((n) => n < min)) return false;
      if (max && amounts.every((n) => n > max)) return false;
      return matchesQuery(p, query);
    });
    if (sort === "price-asc") next.sort((a, b) => productUnitPrice(a) - productUnitPrice(b));
    if (sort === "price-desc") next.sort((a, b) => productUnitPrice(b) - productUnitPrice(a));
    return next;
  }, [products, slug, query, priceMin, priceMax, sort, saleOnly]);

  const filtered = Boolean(query.trim() || priceMin || priceMax || saleOnly);
  const emptyTitle = filtered
    ? "Không tìm thấy sản phẩm"
    : activeCategory
      ? `Chưa có ${activeCategory.name.toLowerCase()}`
      : undefined;

  return (
    <div className="bg-[var(--surface)]">
      <div className="shop-wrap grid items-start gap-5 pb-16 pt-6 sm:pb-24 sm:pt-8 lg:grid-cols-[15.5rem_minmax(0,1fr)]">
        <h1 className="sr-only">{activeCategory ? activeCategory.name : "Cửa hàng"}</h1>
        <aside className="rounded-2xl bg-white/90 p-4 shadow-[var(--shadow-sm)] ring-1 ring-[var(--border)] lg:sticky lg:top-[5.25rem]">
          <nav aria-label="Lọc cửa hàng">
            <SidebarSection title="Ưu đãi">
              <button
                type="button"
                onClick={() => setSaleOnly((v) => !v)}
                aria-pressed={saleOnly}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-[background,color,box-shadow]",
                  saleOnly
                    ? "nav-active"
                    : "bg-[var(--accent-warm)] text-[var(--accent-hover)] ring-1 ring-[var(--accent)]/30 hover:ring-[var(--accent)]/55",
                )}
              >
                Đang sale
                <span className="tabular-nums text-xs opacity-80">{saleCount}</span>
              </button>
            </SidebarSection>

            <SidebarSection title="Sắp xếp">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className={cn(inputClass, "cursor-pointer appearance-none font-semibold")}
                aria-label="Sắp xếp"
              >
                <option value="new">Mới nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </SidebarSection>

            <SidebarSection title="Danh mục">
              <ul className="space-y-0.5">
                {filters.map((c) => {
                  const on = c.slug ? slug === c.slug : !slug;
                  const count = c.slug ? (counts[c.slug] ?? 0) : products.length;
                  return (
                    <li key={c.slug || "all"}>
                      <button
                        type="button"
                        onClick={() => selectCategory(c.slug || undefined)}
                        aria-current={on ? "true" : undefined}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-[background,color,box-shadow]",
                          on
                            ? "nav-active font-semibold"
                            : "text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
                        )}
                      >
                        {c.name}
                        <span className="tabular-nums text-xs opacity-70">{count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </SidebarSection>

            <SidebarSection title="Giá">
              <div className="flex items-center gap-2">
                <input
                  inputMode="numeric"
                  value={formatVndInput(priceMin)}
                  onChange={(e) => setPriceMin(digitsOnly(e.target.value))}
                  placeholder="Từ"
                  aria-label="Giá từ"
                  className={inputClass}
                />
                <span className="text-[var(--ink-faint)]">–</span>
                <input
                  inputMode="numeric"
                  value={formatVndInput(priceMax)}
                  onChange={(e) => setPriceMax(digitsOnly(e.target.value))}
                  placeholder="Đến"
                  aria-label="Giá đến"
                  className={inputClass}
                />
              </div>
            </SidebarSection>

            <SidebarSection title="Tìm kiếm">
              <input
                id="tim-kiem"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tên hoặc giá…"
                aria-label="Tìm sản phẩm"
                className={inputClass}
              />
            </SidebarSection>
          </nav>
        </aside>

        <div className="min-w-0">
          {list.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {list.map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i, 7) * 0.04}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyCatalog title={emptyTitle} />
          )}
        </div>
      </div>
    </div>
  );
}
