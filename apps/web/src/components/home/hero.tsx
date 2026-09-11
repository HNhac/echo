"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { featuredLooks } from "@/data/featured-looks";
import { cn } from "@/lib/utils";

const AUTO_MS = 5600;
const PAUSE_MS = 12_000;

export function Hero() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const pauseUntil = useRef(0);
  const [active, setActive] = useState(0);
  const look = featuredLooks[active] ?? featuredLooks[0];

  const step = () => scrollerRef.current?.clientWidth ?? 1;

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const w = el.clientWidth || 1;
    setActive(Math.min(Math.max(Math.round(el.scrollLeft / w), 0), featuredLooks.length - 1));
  }, []);

  const scrollDir = (dir: -1 | 1) => {
    pauseUntil.current = Date.now() + PAUSE_MS;
    const el = scrollerRef.current;
    if (!el) return;
    const w = step();
    const max = el.scrollWidth - el.clientWidth;
    if (dir === 1 && el.scrollLeft >= max - 8) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (dir === -1 && el.scrollLeft <= 8) {
      el.scrollTo({ left: max, behavior: "smooth" });
      return;
    }
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  const scrollToIndex = (i: number) => {
    pauseUntil.current = Date.now() + PAUSE_MS;
    scrollerRef.current?.scrollTo({ left: i * step(), behavior: "smooth" });
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
      if (el.scrollLeft >= max - 8) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: step(), behavior: "smooth" });
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      className="relative bg-[var(--ink)]"
      aria-label="Lookbook nổi bật"
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
      }}
    >
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        tabIndex={0}
        aria-roledescription="carousel"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            scrollDir(1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            scrollDir(-1);
          }
        }}
      >
        {featuredLooks.map((item, i) => (
          <article
            key={item.id}
            className="relative h-[min(82vh,700px)] min-h-[480px] w-full min-w-full shrink-0 snap-start"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              priority={i === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
          </article>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--ink)]/70 via-[var(--ink)]/20 to-black/10" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 py-16 text-center">
        <div className="pointer-events-auto mx-auto w-full max-w-xl rounded-[2rem] border border-white/30 bg-white/12 px-6 py-8 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:px-10 sm:py-11">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-warm)]">
            ECHO · bé gái 1–10 tuổi
          </p>
          <h1 className="mt-5 text-balance font-serif text-4xl font-medium italic leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
            {look?.title}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-relaxed text-white/85 sm:text-base">
            {look?.subtitle}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href={look?.href ?? "/san-pham"} className="btn-primary">
              Mua ngay
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/san-pham" className="btn-secondary">
              Xem cửa hàng
            </Link>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollDir(-1)}
        className="absolute left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/30 sm:flex lg:left-6"
        aria-label="Slide trước"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollDir(1)}
        className="absolute right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/30 sm:flex lg:right-6"
        aria-label="Slide sau"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:bottom-7">
        {featuredLooks.map((item, i) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Slide ${i + 1}`}
            aria-current={i === active}
            onClick={() => scrollToIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-[width,background-color] duration-300",
              i === active ? "w-9 bg-white" : "w-2 bg-white/40 hover:bg-white/70",
            )}
          />
        ))}
      </div>
    </section>
  );
}
