"use client";

import { useState } from "react";
import Image from "next/image";
import { ShopLink as Link } from "@/components/store/shop-link";
import { useRouter } from "next/navigation";
import type { Product } from "@/data/catalog";
import { flashPctOf, flashSalePriceFmt, productImages } from "@/data/catalog";
import { ProductCopy } from "./product-copy";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/media";
import { Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";

type Props = { product: Product };

export function ProductDetailPanel({ product }: Props) {
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [qty, setQty] = useState(1);
  const maxQty = product.stock != null && product.stock > 0 ? product.stock : undefined;
  const soldOut = product.stock === 0;
  const [added, setAdded] = useState(false);
  const { add } = useCart();
  const router = useRouter();

  const gallery = productImages(product);
  const sale = flashSalePriceFmt(product);

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="space-y-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] bg-[var(--surface-2)] shadow-[var(--shadow-lg)]">
          <div
            className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${imageIndex * 100}%)` }}
          >
            {gallery.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                className="relative h-full w-full shrink-0"
                onClick={() => gallery.length > 1 && setImageIndex((n) => (n + 1) % gallery.length)}
                aria-label={gallery.length > 1 ? "Ảnh tiếp theo" : product.name}
              >
                {mediaUrl(src) ? (
                  <Image
                    src={mediaUrl(src)}
                    alt={i === imageIndex ? product.name : ""}
                    fill
                    priority={i === 0}
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : null}
              </button>
            ))}
          </div>
          {flashPctOf(product) ? (
            <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-[var(--accent)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              −{flashPctOf(product)}%
            </span>
          ) : product.badge ? (
            <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--ink)]">
              {product.badge}
            </span>
          ) : null}
        </div>
        {gallery.length > 1 ? (
          <div className="flex flex-wrap gap-2" aria-label={`${gallery.length} ảnh`}>
            {gallery.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setImageIndex(i)}
                className={cn(
                  "relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-[var(--surface)] transition-all",
                  i === imageIndex ? "ring-[var(--ink)]" : "ring-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={mediaUrl(src, "sm")} alt="" fill className="object-cover" sizes="72px" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col">
        <p className="eyebrow">{product.category}</p>
        <h1 className="mt-2 text-balance font-serif text-3xl font-medium tracking-tight text-[var(--ink)] sm:text-4xl">
          {product.name}
        </h1>
        <div className="mt-4 flex items-baseline gap-3">
          {sale ? (
            <>
              <p className="text-2xl font-semibold tabular-nums text-[var(--accent)]">{sale}</p>
              <p className="text-base text-[var(--ink-faint)] line-through">{product.priceFmt}</p>
            </>
          ) : (
            <p className="text-2xl font-semibold tabular-nums text-[var(--ink)]">{product.priceFmt}</p>
          )}
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/70 px-4 py-3 text-sm text-[var(--ink-muted)]">
          <Truck className="h-4 w-4 shrink-0 text-[var(--accent)]" />
          <span>
            Giao 2–4 ngày nội thành · <strong className="text-[var(--ink)]">Freeship</strong> đơn từ 500k
          </span>
        </div>

        <ProductCopy value={product.description} className="mt-6" />

        <div className="mt-8 space-y-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]">Màu</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "rounded-full border px-4 py-2.5 text-sm font-medium transition-all",
                    color === c
                      ? "nav-active border-transparent"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--ink-faint)]",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]">Size</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={cn(
                    "min-w-12 rounded-full border px-3 py-2.5 text-sm font-semibold tabular-nums transition-all",
                    size === s
                      ? "nav-active border-transparent"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--ink-faint)]",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <Link href="/huong-dan-size" className="mt-3 inline-block text-xs font-semibold text-[var(--accent)] hover:underline">
              Hướng dẫn size
            </Link>
          </div>
        </div>

        {product.stock != null ? (
          <p className="mt-5 text-sm text-[var(--ink-muted)]">
            {soldOut ? "Hết hàng" : `Còn ${product.stock} sản phẩm`}
          </p>
        ) : null}

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] sm:justify-start">
            <button
              type="button"
              aria-label="Giảm số lượng"
              className="p-3.5 text-[var(--ink-muted)] hover:text-[var(--ink)] disabled:opacity-40"
              disabled={qty <= 1 || soldOut}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-10 text-center text-sm font-bold tabular-nums">{qty}</span>
            <button
              type="button"
              aria-label="Tăng số lượng"
              className="p-3.5 text-[var(--ink-muted)] hover:text-[var(--ink)] disabled:opacity-40"
              disabled={soldOut || (maxQty != null && qty >= maxQty)}
              onClick={() => setQty((q) => (maxQty != null ? Math.min(maxQty, q + 1) : q + 1))}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            className="btn-primary flex-1 sm:flex-initial sm:px-10"
            disabled={soldOut}
            onClick={() => {
              add({ slug: product.slug, qty, size, color });
              setAdded(true);
              router.push("/gio-hang");
            }}
          >
            <ShoppingBag className="h-4 w-4" />
            {soldOut ? "Hết hàng" : added ? "Đã thêm — xem giỏ" : "Thêm vào giỏ"}
          </button>
        </div>

        {product.detail && product.detail !== product.description ? (
          <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/50 px-5 py-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]">
              Chi tiết &amp; bảo quản
            </h2>
            <ProductCopy value={product.detail} className="mt-3 text-sm" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
