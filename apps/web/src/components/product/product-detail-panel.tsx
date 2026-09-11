"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/data/catalog";
import { flashSalePriceFmt } from "@/data/catalog";
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
  const [added, setAdded] = useState(false);
  const { add } = useCart();
  const router = useRouter();

  const activeImage = product.images[imageIndex] ?? product.image;
  const sale = flashSalePriceFmt(product);

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="space-y-4">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-[var(--surface-2)] shadow-[var(--shadow-lg)]">
          <Image
            key={activeImage}
            src={mediaUrl(activeImage)}
            alt={product.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {product.flashPct ? (
            <span className="absolute left-4 top-4 rounded-full bg-[var(--accent)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              −{product.flashPct}%
            </span>
          ) : product.badge ? (
            <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--ink)]">
              {product.badge}
            </span>
          ) : null}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {product.images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setImageIndex(i)}
              className={cn(
                "relative h-[5.25rem] w-[4.25rem] shrink-0 overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-[var(--surface)] transition-all",
                i === imageIndex ? "ring-[var(--ink)]" : "ring-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image src={mediaUrl(src)} alt="" fill className="object-cover" sizes="68px" />
            </button>
          ))}
        </div>
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

        <p className="mt-6 leading-relaxed text-[var(--ink-muted)]">{product.description}</p>

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
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]"
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
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]"
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

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] sm:justify-start">
            <button
              type="button"
              aria-label="Giảm số lượng"
              className="p-3.5 text-[var(--ink-muted)] hover:text-[var(--ink)] disabled:opacity-40"
              disabled={qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-10 text-center text-sm font-bold tabular-nums">{qty}</span>
            <button
              type="button"
              aria-label="Tăng số lượng"
              className="p-3.5 text-[var(--ink-muted)] hover:text-[var(--ink)]"
              onClick={() => setQty((q) => q + 1)}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            className="btn-primary flex-1 sm:flex-initial sm:px-10"
            onClick={() => {
              add({ slug: product.slug, qty, size, color });
              setAdded(true);
              router.push("/gio-hang");
            }}
          >
            <ShoppingBag className="h-4 w-4" />
            {added ? "Đã thêm — xem giỏ" : "Thêm vào giỏ"}
          </button>
        </div>

        <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/50 px-5 py-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]">
            Chi tiết &amp; bảo quản
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">{product.detail}</p>
        </div>
      </div>
    </div>
  );
}
