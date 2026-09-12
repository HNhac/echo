import Image from "next/image";
import { ShopLink as Link } from "@/components/store/shop-link";
import type { Product } from "@echo/shared";
import { EmptyCatalog } from "@/components/store/empty-catalog";
import { Reveal } from "@/components/motion/reveal";
import { mediaUrl } from "@/lib/media";

export function LookbookView({ looks }: { looks: Product[] }) {
  return (
    <div className="bg-[var(--surface)]">
      <div className="shop-wrap py-12 sm:py-16">
        <nav className="text-center text-sm text-[var(--ink-muted)]">
          <Link href="/" className="hover:text-[var(--ink)]">
            Trang chủ
          </Link>
          <span className="mx-2 text-[var(--ink-faint)]">/</span>
          <span className="text-[var(--ink)]">Lookbook</span>
        </nav>
        <div className="section-head mt-8">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[var(--ink)] sm:text-5xl">
            Lookbook
          </h1>
          <p className="mt-3 text-[var(--ink-muted)]">Ảnh từ sản phẩm trên CMS.</p>
          <Link href="/san-pham" className="btn-primary mt-6">
            Mua theo look
          </Link>
        </div>
        {looks.length ? (
          <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {looks.map((shot, i) => (
              <Reveal key={shot.id} className="mb-4 break-inside-avoid" delay={Math.min(i, 6) * 0.05}>
              <Link
                href={`/san-pham/${shot.slug}`}
                className={`shop-lift group relative block overflow-hidden rounded-[1.35rem] bg-[var(--surface-2)] ${
                  i % 3 === 0 ? "aspect-[3/4]" : "aspect-[4/5]"
                }`}
              >
                <Image
                  src={mediaUrl(shot.image, "sm")}
                  alt={shot.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/55 via-transparent to-transparent" />
                <p className="absolute inset-x-0 bottom-4 text-center font-serif text-lg text-white">
                  {shot.name}
                </p>
              </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyCatalog title="Lookbook đang trống" />
        )}
      </div>
    </div>
  );
}
