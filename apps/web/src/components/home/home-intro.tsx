import Image from "next/image";
import { ShopLink as Link } from "@/components/store/shop-link";
import type { Product } from "@echo/shared";
import { mediaUrl } from "@/lib/media";

export function HomeIntro({ cover }: { cover?: Product }) {
  return (
    <section className="bg-[var(--surface)]">
      <div className="shop-wrap grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16">
        <div className="shop-in max-w-xl">
          <p className="eyebrow">ECHO · bé gái 1–10 tuổi</p>
          <h1 className="mt-4 text-balance font-serif text-4xl font-medium tracking-tight text-[var(--ink)] sm:text-5xl lg:text-[3.4rem] lg:leading-[1.1]">
            Váy mềm, form dễ mặc
          </h1>
          <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
            Váy đầm, set bộ, áo và phụ kiện — size 90–140.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/san-pham" className="btn-primary">
              Xem cửa hàng
            </Link>
            <Link href="/bo-suu-tap" className="btn-ghost">
              Bộ sưu tập
            </Link>
          </div>
        </div>
        {cover && mediaUrl(cover.image) ? (
          <Link
            href={`/san-pham/${cover.slug}`}
            className="shop-in shop-in-late group relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] bg-[var(--surface-2)] shadow-[var(--shadow-lg)] ring-1 ring-[var(--border)] lg:max-w-none"
          >
            <Image
              src={mediaUrl(cover.image)}
              alt={cover.name}
              fill
              priority
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 90vw, 48vw"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--ink)]/70 to-transparent px-6 pb-6 pt-16 text-white">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                {cover.category}
              </span>
              <span className="mt-1 block font-serif text-2xl font-medium">{cover.name}</span>
            </span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
