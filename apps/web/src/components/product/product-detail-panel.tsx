"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/data/catalog";
import { flashPctOf, flashSalePriceFmt, formatVnd, productImages, productUnitPrice } from "@/data/catalog";
import { ProductPolicyTabs } from "./product-policy-tabs";
import { ProductHotline } from "./product-support-block";
import { ProductVoucherBlock } from "./product-voucher-block";
import { SizeGuideModal } from "./size-guide-modal";
import { AddedToCartModal } from "@/components/cart/added-to-cart-modal";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/media";
import { Minus, Plus } from "lucide-react";
import { CartIcon } from "@/components/icons/cart-icon";
import { useCart } from "@/components/cart/cart-provider";
import { useShopSettings } from "@/components/store/shop-settings-provider";
import { voucherDiscountOf } from "@echo/shared";

type Props = { product: Product };

export function ProductDetailPanel({ product }: Props) {
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [sizeGuide, setSizeGuide] = useState(false);
  const [voucher, setVoucherPick] = useState("");
  const maxQty = product.stock != null && product.stock > 0 ? product.stock : undefined;
  const soldOut = product.stock === 0;
  const { add } = useCart();
  const settings = useShopSettings();
  const router = useRouter();
  const gallery = productImages(product);
  const unit = productUnitPrice(product);
  const live = unit * qty;
  const discount = voucherDiscountOf(live, settings, voucher);
  const payable = live - discount;
  const sale = flashSalePriceFmt(product);

  function addLine() {
    add({ slug: product.slug, qty, size, color, voucher: discount > 0 ? voucher : undefined });
  }

  return (
    <>
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
                    i === imageIndex ? "ring-[var(--accent)]" : "ring-transparent opacity-70 hover:opacity-100",
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
          <div className="mt-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-2xl font-semibold tabular-nums text-[var(--accent)]">{formatVnd(payable)}</p>
              {sale || discount > 0 ? (
                <p className="text-base tabular-nums text-[var(--ink-faint)] line-through">
                  {formatVnd(sale ? product.price * qty : live)}
                </p>
              ) : null}
              {qty > 1 ? (
                <p className="text-sm text-[var(--ink-muted)]">
                  {formatVnd(unit)}/cái × {qty}
                </p>
              ) : null}
            </div>
            {discount > 0 ? (
              <p className="mt-1.5 text-sm font-medium text-[var(--accent)]">
                Voucher {voucher} −{formatVnd(discount)}
              </p>
            ) : null}
          </div>

          <ProductVoucherBlock
            productSlug={product.slug}
            selected={voucher}
            onSelect={setVoucherPick}
            subtotal={live}
          />

          <div className="mt-7 space-y-6">
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
              <button
                type="button"
                className="mt-3 text-xs font-semibold text-[var(--accent)] hover:underline"
                onClick={() => setSizeGuide(true)}
              >
                Hướng dẫn size
              </button>
            </div>
          </div>

          {product.stock != null ? (
            <p className="mt-5 text-sm text-[var(--ink-muted)]">
              {soldOut ? "Hết hàng" : `Còn ${product.stock} sản phẩm`}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
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
              className="btn-ghost flex-1"
              disabled={soldOut}
              onClick={() => {
                addLine();
                setAdded(true);
              }}
            >
              <CartIcon className="h-4 w-4" />
              {soldOut ? "Hết hàng" : "Thêm vào giỏ"}
            </button>
            <button
              type="button"
              className="btn-primary flex-1"
              disabled={soldOut}
              onClick={() => {
                addLine();
                router.push("/thanh-toan");
              }}
            >
              Mua ngay
            </button>
          </div>

          <ProductHotline />
        </div>
      </div>
      <ProductPolicyTabs product={product} />
      {added ? (
        <AddedToCartModal
          product={product}
          qty={qty}
          size={size}
          color={color}
          voucher={voucher}
          onClose={() => setAdded(false)}
        />
      ) : null}
      {sizeGuide ? <SizeGuideModal highlight={size} onClose={() => setSizeGuide(false)} /> : null}
    </>
  );
}
