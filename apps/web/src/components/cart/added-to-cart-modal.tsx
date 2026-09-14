"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { Product } from "@/data/catalog";
import { formatVnd, productUnitPrice } from "@/data/catalog";
import { mediaUrl } from "@/lib/media";
import { useShopSettings } from "@/components/store/shop-settings-provider";
import { voucherDiscountOf, voucherHint, voucherOf } from "@echo/shared";
import { useModalExit } from "@/lib/use-modal-exit";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  qty: number;
  size: string;
  color: string;
  voucher?: string;
  onClose: () => void;
};

export function AddedToCartModal({ product, qty, size, color, voucher, onClose }: Props) {
  const router = useRouter();
  const total = productUnitPrice(product) * qty;
  const image = mediaUrl(product.image, "sm");
  const settings = useShopSettings();
  const applied = voucherOf(settings, voucher);
  const discount = voucherDiscountOf(total, settings, voucher);
  const payable = total - discount;
  const { inView, leaving, close, onExitEnd } = useModalExit(onClose);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [close]);

  return createPortal(
    <div className={cn("fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center", leaving && "pointer-events-none")}>
      <button
        type="button"
        className={cn("shop-modal-backdrop absolute inset-0 bg-[var(--ink)]/40 backdrop-blur-[2px]", inView && "is-in")}
        aria-label="Đóng"
        onClick={close}
      />
      <div
        role="dialog"
        aria-labelledby="added-cart-title"
        className={cn(
          "shop-modal-panel relative w-full max-w-md rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-lg)] sm:p-6",
          inView && "is-in",
        )}
        onTransitionEnd={onExitEnd}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Đã thêm vào giỏ hàng</p>
          <button
            type="button"
            aria-label="Đóng"
            className="grid size-9 shrink-0 place-items-center rounded-full text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
            onClick={close}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-3.5">
          <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)]">
            {image ? <Image src={image} alt="" fill className="object-cover" sizes="80px" /> : null}
          </div>
          <div className="relative min-w-0 flex-1">
            {applied ? (
              <span className="absolute right-0 top-0 rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[var(--accent)]">
                {applied.code}
              </span>
            ) : null}
            <h2
              id="added-cart-title"
              className={`font-serif text-lg font-medium italic text-[var(--ink)] ${applied ? "pr-16" : ""}`}
            >
              {product.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              {color} · Size {size} · x{qty}
            </p>
            <p className="mt-2 text-sm font-semibold tabular-nums text-[var(--accent)]">{formatVnd(payable)}</p>
            {discount > 0 ? (
              <p className="text-xs tabular-nums text-[var(--ink-muted)]">
                <span className="line-through">{formatVnd(total)}</span>
                <span className="ml-1.5 font-medium text-[var(--accent)]">−{formatVnd(discount)}</span>
              </p>
            ) : null}
          </div>
        </div>
        {applied ? (
          <p className="mt-4 rounded-2xl bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--ink)]">
            Áp dụng voucher <strong className="text-[var(--accent)]">{applied.code}</strong>
            <span className="mt-0.5 block text-xs text-[var(--ink-muted)]">{voucherHint(applied)}</span>
          </p>
        ) : (
          <p className="mt-4 text-sm text-[var(--ink-muted)]">
            Sản phẩm đã vào giỏ. Thanh toán ngay hoặc xem lại giỏ hàng.
          </p>
        )}
        <div className="mt-4 flex gap-2">
          <button type="button" className="btn-ghost min-w-0 flex-1 px-3 text-sm" onClick={() => router.push("/gio-hang")}>
            Xem giỏ hàng
          </button>
          <button type="button" className="btn-primary min-w-0 flex-1 px-3 text-sm" onClick={() => router.push("/thanh-toan")}>
            Thanh toán
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
