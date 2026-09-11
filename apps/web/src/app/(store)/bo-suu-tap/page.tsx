import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { brandPageTitle } from "@/config/brand";
import { featuredOf } from "@/data/catalog";
import { ProductCard } from "@/components/product/product-card";
import { fetchProducts } from "@/lib/store-api";

export const metadata: Metadata = {
  title: brandPageTitle("Bộ sưu tập"),
  description: "Váy nắng hè cho bé gái — size 90–140.",
};

export default async function CollectionPage() {
  const featuredProducts = featuredOf(await fetchProducts());
  return (
    <div className="bg-[var(--surface)]">
      <div className="relative h-[min(52vh,480px)] min-h-[280px] overflow-hidden bg-[var(--ink)]">
        <Image
          src="https://images.unsplash.com/photo-1471286174890-9c00182169d7?w=1600&q=85"
          alt="Bộ sưu tập váy bé gái"
          fill
          className="object-cover object-center opacity-85"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[var(--ink)]/40" />
        <div className="shop-wrap relative flex h-full flex-col items-center justify-center text-center">
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
          Váy xòe pastel, đầm voan tiệc nhỏ và set bộ dễ vận động — cotton mềm,
          size 90 đến 140.
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)]/70 p-7 text-center">
            <h2 className="font-serif text-2xl font-medium text-[var(--ink)]">Đi chơi cuối tuần</h2>
            <p className="mt-3 leading-relaxed text-[var(--ink-muted)]">
              Váy xòe + kẹp nơ. Bé chạy, ngồi, chụp hình đều dễ.
            </p>
          </article>
          <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface-2)]/70 p-7 text-center">
            <h2 className="font-serif text-2xl font-medium text-[var(--ink)]">Sinh nhật & tiệc</h2>
            <p className="mt-3 leading-relaxed text-[var(--ink-muted)]">
              Đầm voan có lót cotton — xinh mà không ngứa da.
            </p>
          </article>
        </div>

        <div className="mt-16">
          <div className="section-head">
            <h2 className="font-serif text-2xl font-medium text-[var(--ink)] sm:text-3xl">
              Món đang bán
            </h2>
            <Link href="/san-pham" className="mt-3 text-sm font-semibold text-[var(--accent)] hover:underline">
              Xem hết →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
