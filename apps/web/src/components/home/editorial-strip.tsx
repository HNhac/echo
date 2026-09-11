import Image from "next/image";
import { ShopLink as Link } from "@/components/store/shop-link";
import type { Product } from "@echo/shared";
import { mediaUrl } from "@/lib/media";

export function EditorialStrip({ cover }: { cover?: Product }) {
  return (
    <section className="relative overflow-hidden bg-[var(--ink)] py-16 text-white sm:py-24">
      {cover ? (
        <div className="absolute inset-0">
          <Image
            src={mediaUrl(cover.image)}
            alt=""
            fill
            className="object-cover object-center opacity-45"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[var(--ink)]/55" />
        </div>
      ) : null}
      <div className="shop-wrap relative mx-auto max-w-2xl text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--accent-warm)]">
          Lookbook bé gái
        </p>
        <h2 className="mt-4 text-balance font-serif text-3xl font-medium italic leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          Váy xòe, nơ nhỏ — mặc đi chơi vẫn chạy nhảy được.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
          Xem lookbook rồi chọn size 90–140 phù hợp chiều cao bé.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/lookbook" className="btn-primary">
            Xem lookbook
          </Link>
          <Link href="/san-pham" className="btn-secondary">
            Mua sắm
          </Link>
        </div>
      </div>
    </section>
  );
}
