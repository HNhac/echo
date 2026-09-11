"use client";

import Image from "next/image";
import { ShopLink as Link } from "@/components/store/shop-link";
import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import type { Product } from "@/data/catalog";
import { flashSalePriceFmt } from "@/data/catalog";
import { mediaUrl } from "@/lib/media";

const AUTO_MS = 5200;
const PAUSE_MS = 14_000;

function scrollStep(el: HTMLDivElement) {
  const card = el.querySelector<HTMLElement>("[data-rail-card]");
  return (card?.offsetWidth ?? 180) + 16;
}

function RailCard({
  product,
  sale,
}: {
  product: Product;
  sale?: boolean;
}) {
  const saleFmt = sale ? flashSalePriceFmt(product) : null;
  return (
    <Link
      href={`/san-pham/${product.slug}`}
      data-rail-card
      className="group w-[10.5rem] shrink-0 snap-start sm:w-[13rem]"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
        {mediaUrl(product.image) ? (
          <Image
            src={mediaUrl(product.image)}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="208px"
          />
        ) : null}
        {product.flashPct ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold text-white">
            −{product.flashPct}%
          </span>
        ) : product.badge ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[var(--ink)]">
            {product.badge}
          </span>
        ) : null}
      </div>
      <p className="mt-2.5 line-clamp-2 text-sm font-medium leading-snug text-white">
        {product.name}
      </p>
      {saleFmt ? (
        <p className="mt-1 flex items-baseline gap-2 text-sm">
          <span className="font-semibold tabular-nums text-[var(--accent-warm)]">
            {saleFmt}
          </span>
          <span className="text-xs text-white/40 line-through">{product.priceFmt}</span>
        </p>
      ) : (
        <p className="mt-1 text-sm font-semibold tabular-nums text-white/90">
          {product.priceFmt}
        </p>
      )}
    </Link>
  );
}

function Rail({
  title,
  products,
  sale,
}: {
  title: string;
  products: Product[];
  sale?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hover = useRef(false);
  const pauseUntil = useRef(0);

  const bump = useCallback(() => {
    pauseUntil.current = Date.now() + PAUSE_MS;
  }, []);

  const scroll = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    bump();
    el.scrollBy({ left: dir * scrollStep(el), behavior: "smooth" });
  };

  useEffect(() => {
    const id = window.setInterval(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (hover.current) return;
      if (Date.now() < pauseUntil.current) return;
      const el = ref.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 2) return;
      if (el.scrollLeft >= max - 4) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: scrollStep(el), behavior: "smooth" });
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, []);

  const loop = products.length ? [...products, ...products] : [];

  return (
    <div
      onMouseEnter={() => {
        hover.current = true;
      }}
      onMouseLeave={() => {
        hover.current = false;
      }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-serif text-xl font-medium text-white">
          {sale ? <Zap className="h-4 w-4 text-[var(--accent-warm)]" /> : null}
          {title}
        </h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label={`${title} — trước`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white hover:bg-white/10"
            onClick={() => scroll(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`${title} — sau`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white hover:bg-white/10"
            onClick={() => scroll(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loop.map((p, i) => (
          <RailCard key={`${p.slug}-${title}-${i}`} product={p} sale={sale} />
        ))}
      </div>
    </div>
  );
}

export function FlashPicksRails({
  flash,
  picks,
}: {
  flash: Product[];
  picks: Product[];
}) {
  if (!flash.length && !picks.length) return null;

  return (
    <section id="flash" className="relative overflow-hidden bg-[var(--ink)] py-14 text-white sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[var(--accent)]/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-[var(--gold)]/15 blur-3xl"
      />
      <div className="shop-wrap relative space-y-12">
        <div className="section-head">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--accent-warm)]">
            Ưu đãi tuần
          </p>
          <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
            Flash sale & bán chạy
          </h2>
          <Link href="/san-pham" className="mt-3 text-sm font-semibold text-[var(--accent-warm)] hover:underline">
            Xem tất cả →
          </Link>
        </div>
        {flash.length ? <Rail title="Flash sale" products={flash} sale /> : null}
        {picks.length ? <Rail title="Đang bán chạy" products={picks} /> : null}
      </div>
    </section>
  );
}
