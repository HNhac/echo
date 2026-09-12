import Image from "next/image";
import { ShopLink as Link } from "@/components/store/shop-link";
import { Reveal } from "@/components/motion/reveal";
import { ArrowUpRight } from "lucide-react";
import type { HomeCatalog } from "@echo/shared";
import { mediaUrl } from "@/lib/media";

export function Categories({ categories }: { categories: HomeCatalog["categories"] }) {
  if (!categories.length) return null;

  return (
    <section id="categories" className="bg-[var(--surface)] py-14 sm:py-20">
      <div className="shop-wrap">
        <div className="section-head">
          <p className="eyebrow">Danh mục</p>
          <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-[var(--ink)] sm:text-4xl">
            Bé mặc gì hôm nay?
          </h2>
          <p className="mt-3 text-sm text-[var(--ink-muted)]">
            Váy, set bộ, áo và phụ kiện — size 90 đến 140.
          </p>
          <Link
            href="/san-pham"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)]"
          >
            Tất cả sản phẩm
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <Reveal key={cat.slug} delay={Math.min(i, 6) * 0.06}>
            <Link
              href={`/san-pham?danh-muc=${cat.slug}`}
              className="shop-lift group relative aspect-[3/4] overflow-hidden rounded-[1.6rem] bg-[var(--surface-2)] shadow-[var(--shadow-md)] ring-1 ring-[var(--border)]"
            >
              <Image
                src={mediaUrl(cat.image, "sm")}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/80 via-[var(--ink)]/15 to-transparent" />
              <span className="absolute left-4 top-4 font-mono text-[10px] tracking-widest text-white/60">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-4 text-center sm:p-5">
                <p className="font-serif text-xl font-medium text-white sm:text-2xl">
                  {cat.name}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-white/75 sm:text-sm">
                  {cat.description}
                </p>
              </div>
            </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
