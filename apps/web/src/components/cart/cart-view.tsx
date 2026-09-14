"use client";

import Image from "next/image";
import { ShopLink as Link } from "@/components/store/shop-link";
import { formatVnd, productUnitPrice } from "@/data/catalog";
import { mediaUrl } from "@/lib/media";
import { useCart } from "@/components/cart/cart-provider";
import { useProducts } from "@/lib/use-products";
import { useShopSettings } from "@/components/store/shop-settings-provider";
import { formatVndShort, shippingFeeOf, voucherDiscountOf } from "@echo/shared";
import { lineKey } from "@/lib/cart";
import { Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function CartView() {
  const { lines, ready, setQty, remove, pickedKeys, togglePicked, setPickedAll, voucher } = useCart();
  const { products: catalog, loaded } = useProducts();
  const settings = useShopSettings();

  const resolved = lines
    .map((line) => {
      const product = catalog.find((p) => p.slug === line.slug);
      if (!product) return null;
      const unit = productUnitPrice(product);
      return { line, product, unit, total: unit * line.qty, key: lineKey(line) };
    })
    .filter((row) => row !== null);

  const picked = resolved.filter((row) => pickedKeys.includes(row.key));
  const allOn = resolved.length > 0 && picked.length === resolved.length;
  const subtotal = picked.reduce((s, r) => s + r.total, 0);
  const ship = picked.length ? shippingFeeOf(subtotal, settings) : 0;
  const shipShown = picked.length ? ship : Math.max(0, settings.shipFee);
  const discount = picked.length ? voucherDiscountOf(subtotal, settings, voucher) : 0;
  const grand = subtotal - discount + ship;
  const remain = picked.length && settings.freeshipFrom > 0 ? Math.max(0, settings.freeshipFrom - subtotal) : 0;
  const pickedCount = picked.reduce((s, r) => s + r.line.qty, 0);

  if (!ready || (lines.length > 0 && !loaded)) {
    return (
      <div className="shop-wrap py-20 text-center text-sm text-[var(--ink-muted)]">
        Đang tải giỏ hàng…
      </div>
    );
  }

  if (resolved.length === 0) {
    return (
      <div className="shop-wrap py-16 sm:py-20">
        <h1 className="text-center font-serif text-3xl font-medium italic text-[var(--ink)] sm:text-4xl">
          Giỏ hàng trống
        </h1>
        <p className="mt-3 text-center text-[var(--ink-muted)]">
          Thêm váy hoặc set bé thích, rồi quay lại thanh toán.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/san-pham" className="btn-primary">
            Mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-wrap py-6 sm:py-8">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-serif text-2xl font-medium italic tracking-tight text-[var(--ink)] sm:text-3xl">
          Giỏ hàng
        </h1>
        <p className="text-sm text-[var(--ink-muted)]">{resolved.length} loại sản phẩm</p>
      </div>

      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20.5rem] xl:grid-cols-[minmax(0,1fr)_22.5rem]">
        <section className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3 sm:px-5">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-[var(--ink)]">
              <input
                type="checkbox"
                checked={allOn}
                onChange={(e) => setPickedAll(e.target.checked)}
                className="size-4 cursor-pointer accent-[var(--accent)]"
              />
              Chọn tất cả
              <span className="font-normal text-[var(--ink-muted)]">
                {picked.length}/{resolved.length}
              </span>
            </label>
            {picked.length ? (
              <span className="text-xs text-[var(--ink-muted)]">Đã chọn {pickedCount} món</span>
            ) : (
              <span className="text-xs text-[var(--ink-faint)]">Chọn món để thanh toán</span>
            )}
          </div>
          <ul>
            {resolved.map(({ line, product, unit, total, key }) => {
              const on = pickedKeys.includes(key);
              return (
                <li
                  key={key}
                  className={cn(
                    "flex items-start gap-3 border-b border-[var(--border)] px-4 py-3.5 last:border-0 sm:px-5",
                    on ? "bg-[var(--surface-2)]/55" : "bg-white",
                  )}
                >
                  <label className="flex shrink-0 cursor-pointer items-center self-center">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => togglePicked(line)}
                      className="size-4 cursor-pointer accent-[var(--accent)]"
                      aria-label={`Chọn ${product.name}`}
                    />
                  </label>
                  <Link
                    href={`/san-pham/${product.slug}`}
                    className="relative h-[4.75rem] w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)] sm:h-20 sm:w-[4.25rem]"
                  >
                    {mediaUrl(product.image, "sm") ? (
                      <Image src={mediaUrl(product.image, "sm")} alt={product.name} fill className="object-cover" />
                    ) : null}
                  </Link>
                  <div className="relative min-w-0 flex-1">
                    {line.voucher ? (
                      <span className="absolute right-0 top-0 rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[var(--accent)]">
                        {line.voucher}
                      </span>
                    ) : null}
                    <Link
                      href={`/san-pham/${product.slug}`}
                      className={cn(
                        "line-clamp-2 text-sm font-medium leading-snug text-[var(--ink)] hover:text-[var(--accent)] sm:text-[0.95rem]",
                        line.voucher ? "pr-[4.75rem]" : "",
                      )}
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-xs text-[var(--ink-muted)]">
                      {line.color} · Size {line.size}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <p className="text-sm font-semibold tabular-nums text-[var(--accent)]">
                        {formatVnd(total)}
                        <span className="ml-1.5 text-[11px] font-normal text-[var(--ink-faint)]">
                          {formatVnd(unit)}/cái
                        </span>
                      </p>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center rounded-full border border-[var(--border)] bg-white">
                          <button
                            type="button"
                            className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                            aria-label="Giảm"
                            onClick={() => setQty(line, line.qty - 1)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-6 text-center text-sm font-bold tabular-nums">{line.qty}</span>
                          <button
                            type="button"
                            className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                            aria-label="Tăng"
                            onClick={() => setQty(line, line.qty + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="grid size-8 place-items-center rounded-full text-[var(--ink-faint)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"
                          aria-label="Xóa"
                          onClick={() => remove(line)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="h-fit rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)] lg:sticky lg:top-24">
          <h2 className="font-serif text-xl font-medium italic text-[var(--ink)]">Tóm tắt đơn</h2>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            {picked.length ? `Đã chọn ${pickedCount} sản phẩm` : "Chưa chọn món nào"}
          </p>

          {picked.length ? (
            <ul className="mt-4 space-y-2 border-b border-[var(--border)] pb-4">
              {picked.map(({ key, product, line, total }) => (
                <li key={key} className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-[var(--ink-muted)]">
                    {product.name} × {line.qty}
                  </span>
                  <span className="shrink-0 tabular-nums text-[var(--ink)]">{formatVnd(total)}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-[var(--ink-muted)]">
              <span>Tạm tính</span>
              <span className="tabular-nums text-[var(--ink)]">{formatVnd(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[var(--ink-muted)]">
              <span>Vận chuyển</span>
              <span className="tabular-nums text-[var(--ink)]">
                {picked.length === 0
                  ? formatVnd(shipShown)
                  : ship === 0
                    ? "Miễn phí"
                    : formatVnd(ship)}
              </span>
            </div>
            {picked.length === 0 && settings.shipFee > 0 ? (
              <p className="text-[11px] leading-relaxed text-[var(--ink-faint)]">
                Phí ship {formatVndShort(settings.shipFee)}
                {settings.freeshipFrom > 0 ? ` · Freeship đơn từ ${formatVndShort(settings.freeshipFrom)}` : ""}.
              </p>
            ) : null}
            {picked.length > 0 && ship > 0 && remain > 0 ? (
              <p className="text-[11px] leading-relaxed text-[var(--ink-faint)]">
                Mua thêm {formatVndShort(remain)} để được freeship.
              </p>
            ) : null}
            {discount > 0 ? (
              <div className="flex justify-between text-[var(--accent)]">
                <span>Giảm giá</span>
                <span className="tabular-nums">−{formatVnd(discount)}</span>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex justify-between border-t border-[var(--border)] pt-4 font-semibold text-[var(--ink)]">
            <span>Tổng</span>
            <span className="tabular-nums text-[var(--accent)]">{formatVnd(grand)}</span>
          </div>
          {picked.length ? (
            <Link href="/thanh-toan" className="btn-primary mt-5 w-full">
              Thanh toán ({pickedCount})
            </Link>
          ) : (
            <button type="button" disabled className="btn-primary mt-5 w-full opacity-45">
              Chọn món để thanh toán
            </button>
          )}
          <Link href="/san-pham" className="mt-3 block text-center text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">
            Tiếp tục mua sắm
          </Link>
        </aside>
      </div>
    </div>
  );
}
