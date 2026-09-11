"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { featuredLooks } from "@/data/featured-looks";
import { cn } from "@/lib/utils";

const AUTO_MS = 5000;
const PAUSE_MS = 12_000;

const ACCENT: Record<(typeof featuredLooks)[number]["accent"], string> = {
  blush: "from-[var(--accent)]/30 via-transparent to-transparent",
  peach: "from-orange-200/40 via-transparent to-transparent",
  lilac: "from-violet-400/25 via-transparent to-transparent",
  mint: "from-emerald-400/20 via-transparent to-transparent",
};

export function FeaturedLooksCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const pauseUntil = useRef(0);
  const [active, setActive] = useState(0);

  const getStep = () => {
    const el = scrollerRef.current;
    if (!el) return 1;
    const slide = el.querySelector<HTMLElement>("[data-look-slide]");
    return (slide?.offsetWidth ?? el.clientWidth * 0.88) + 20;
  };

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = getStep();
    setActive(Math.min(Math.max(Math.round(el.scrollLeft / step), 0), featuredLooks.length - 1));
  }, []);

  const bump = () => {
    pauseUntil.current = Date.now() + PAUSE_MS;
  };

  const scrollDir = (dir: -1 | 1) => {
    bump();
    const el = scrollerRef.current;
    if (!el) return;
    const step = getStep();
    const max = el.scrollWidth - el.clientWidth;
    if (dir === 1 && el.scrollLeft >= max - 8) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (dir === -1 && el.scrollLeft <= 8) {
      el.scrollTo({ left: max, behavior: "smooth" });
      return;
    }
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (hoverRef.current) return;
      if (Date.now() < pauseUntil.current) return;
      const el = scrollerRef.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      if (el.scrollLeft >= max - 8) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: getStep(), behavior: "smooth" });
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      className="bg-[var(--surface-2)] py-14 sm:py-20"
      aria-labelledby="featured-looks-heading"
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
      }}
    >
      <div className="shop-wrap">
        <div className="section-head">
          <p className="eyebrow">Gợi ý mặc</p>
          <h2
            id="featured-looks-heading"
            className="mt-2 font-serif text-3xl font-medium tracking-tight text-[var(--ink)] sm:text-4xl"
          >
            Outfit cho bé
          </h2>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Chọn set rồi vào đúng danh mục váy, áo hay phụ kiện.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => scrollDir(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:shadow-[var(--shadow-md)]"
              aria-label="Slide trước"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollDir(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:shadow-[var(--shadow-md)]"
              aria-label="Slide sau"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {featuredLooks.map((look) => (
            <article
              key={look.id}
              data-look-slide
              className="w-[min(82vw,340px)] shrink-0 snap-start sm:w-[360px]"
            >
              <Link
                href={look.href}
                className="group relative block aspect-[3/4] overflow-hidden rounded-[1.6rem] bg-[var(--surface)] shadow-[var(--shadow-md)] ring-1 ring-[var(--border)]"
              >
                <Image
                  src={look.image}
                  alt={look.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  sizes="360px"
                />
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-20", ACCENT[look.accent])} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                  {look.tag}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="font-serif text-2xl font-medium leading-tight">{look.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-white/80">{look.subtitle}</p>
                  <span className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-[var(--accent-warm)]">
                    Mua set này →
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {featuredLooks.map((look, i) => (
            <span
              key={look.id}
              className={cn(
                "h-1.5 rounded-full",
                i === active ? "w-8 bg-[var(--ink)]" : "w-2 bg-[var(--border)]",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
