import { ShopLink as Link } from "@/components/store/shop-link";
import type { Product } from "@/data/catalog";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/motion/reveal";

export function FlashPicksRails({
  flash,
}: {
  flash: Product[];
  picks?: Product[];
}) {
  if (!flash.length) return null;

  return (
    <section id="flash" className="bg-[var(--surface-2)] py-14 sm:py-20">
      <div className="shop-wrap">
        <div className="section-head">
          <p className="eyebrow">Ưu đãi</p>
          <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-[var(--ink)] sm:text-4xl">
            Flash sale
          </h2>
          <Link href="/san-pham" className="mt-3 text-sm font-semibold text-[var(--accent)] hover:underline">
            Xem cửa hàng →
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {flash.slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i, 7) * 0.05}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
