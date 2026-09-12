import Image from "next/image";
import { ShopLink as Link } from "@/components/store/shop-link";
import type { HomeCatalog } from "@echo/shared";
import { ProductCard } from "@/components/product/product-card";
import { EmptyCatalog } from "@/components/store/empty-catalog";
import { Reveal } from "@/components/motion/reveal";
import { mediaUrl } from "@/lib/media";

export function CollectionView({ catalog }: { catalog: HomeCatalog }) {
  const list = catalog.featured.length ? catalog.featured : catalog.looks;
  const cover = catalog.looks[0];

  return (
    <div className="bg-[var(--surface)]">
      <div className="relative h-[min(52vh,480px)] min-h-[280px] overflow-hidden bg-[var(--ink)]">
        {cover ? (
          <Image
            src={mediaUrl(cover.image)}
            alt={cover.name}
            fill
            className="object-cover object-center opacity-85"
            sizes="100vw"
            priority
          />
        ) : null}
        <div className="absolute inset-0 bg-[var(--ink)]/40" />
        <div className="shop-in shop-wrap relative flex h-full flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--accent-warm)]">
            Mùa nắng
          </p>
          <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-white sm:text-6xl">
            Váy bé gái 2026
          </h1>
        </div>
      </div>

      <div className="shop-wrap py-12 sm:py-16">
        <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
          Váy xòe pastel, đầm voan tiệc nhỏ và set bộ dễ vận động — cotton mềm, size 90 đến 140.
        </p>
        <div className="shop-stagger mt-12 grid gap-8 md:grid-cols-2">
          <article className="shop-lift rounded-3xl border border-[var(--border)] bg-[var(--surface-2)]/70 p-7 text-center">
            <h2 className="font-serif text-2xl font-medium text-[var(--ink)]">Đi chơi cuối tuần</h2>
            <p className="mt-3 leading-relaxed text-[var(--ink-muted)]">
              Váy xòe + kẹp nơ. Bé chạy, ngồi, chụp hình đều dễ.
            </p>
          </article>
          <article className="shop-lift rounded-3xl border border-[var(--border)] bg-[var(--surface-2)]/70 p-7 text-center">
            <h2 className="font-serif text-2xl font-medium text-[var(--ink)]">Sinh nhật & tiệc</h2>
            <p className="mt-3 leading-relaxed text-[var(--ink-muted)]">
              Đầm voan có lót cotton — xinh mà không ngứa da.
            </p>
          </article>
        </div>

        <div className="mt-16">
          <div className="section-head">
            <h2 className="font-serif text-2xl font-medium text-[var(--ink)] sm:text-3xl">Món đang bán</h2>
            <Link href="/san-pham" className="mt-3 text-sm font-semibold text-[var(--accent)] hover:underline">
              Xem hết →
            </Link>
          </div>
          {list.length ? (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {list.slice(0, 8).map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i, 7) * 0.05}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyCatalog />
          )}
        </div>
      </div>
    </div>
  );
}
