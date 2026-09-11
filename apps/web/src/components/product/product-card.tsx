import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/catalog";
import { flashSalePriceFmt } from "@/data/catalog";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type Props = { product: Product; className?: string };

export function ProductCard({ product, className }: Props) {
  const hoverImage = product.images[1] ?? product.image;
  const sale = flashSalePriceFmt(product);

  return (
    <article className={cn("group/card flex flex-col", className)}>
      <Link
        href={`/san-pham/${product.slug}`}
        className="relative isolate block overflow-hidden rounded-[1.4rem] bg-white p-2 shadow-[var(--shadow-sm)] ring-1 ring-[var(--border)] transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
        aria-label={product.name}
      >
        <span className="relative block aspect-[3/4] overflow-hidden rounded-[1.05rem] bg-[var(--surface-2)]">
          <Image
            src={mediaUrl(product.image)}
            alt={product.name}
            fill
            className="object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.06] group-hover/card:opacity-0"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <Image
            src={mediaUrl(hoverImage)}
            alt=""
            fill
            className="absolute inset-0 object-cover opacity-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.04] group-hover/card:opacity-100"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            aria-hidden
          />
        </span>
        {product.flashPct ? (
          <span className="absolute left-4 top-4 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            −{product.flashPct}%
          </span>
        ) : product.badge ? (
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--ink)] shadow-sm">
            {product.badge}
          </span>
        ) : null}
      </Link>
      <div className="mt-3.5 flex flex-1 flex-col items-center px-1 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
          {product.category}
        </p>
        <Link
          href={`/san-pham/${product.slug}`}
          className="mt-1 line-clamp-2 font-serif text-[1.05rem] font-medium italic leading-snug text-[var(--ink)] hover:text-[var(--accent)]"
        >
          {product.name}
        </Link>
        <div className="mt-1.5 flex items-baseline justify-center gap-2">
          {sale ? (
            <>
              <p className="text-sm font-semibold tabular-nums text-[var(--accent)]">
                {sale}
              </p>
              <p className="text-xs tabular-nums text-[var(--ink-faint)] line-through">
                {product.priceFmt}
              </p>
            </>
          ) : (
            <p className="text-sm font-semibold tabular-nums text-[var(--ink)]">
              {product.priceFmt}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
