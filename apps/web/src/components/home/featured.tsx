import { ShopLink as Link } from "@/components/store/shop-link";
import type { Product } from "@echo/shared";
import { ProductCard } from "@/components/product/product-card";
import { ArrowUpRight } from "lucide-react";

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section id="san-pham" className="bg-[var(--surface)] py-14 sm:py-20">
      <div className="shop-wrap">
        <div className="section-head">
          <p className="eyebrow">Được mẹ chọn nhiều</p>
          <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-[var(--ink)] sm:text-4xl">
            Nổi bật tuần này
          </h2>
          <p className="mt-3 text-sm text-[var(--ink-muted)] sm:text-base">
            Váy, set và áo đang bán — hover ảnh để xem góc thứ hai.
          </p>
          <Link
            href="/san-pham"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)]"
          >
            Xem cửa hàng
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
