"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronLeft, ChevronRight, Gift } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useShopSettings } from "@/components/store/shop-settings-provider";
import { formatVndShort, shopVouchers, type ShopVoucher } from "@echo/shared";
import { cn } from "@/lib/utils";
import { useModalExit } from "@/lib/use-modal-exit";

function voucherStamp(amount: number) {
  if (amount >= 1_000_000 && amount % 1_000_000 === 0) return `${amount / 1_000_000}tr`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}k`;
  return formatVndShort(amount);
}

function voucherHintLine(item: ShopVoucher) {
  const off = formatVndShort(item.amount);
  if (item.min > 0) return `Mã giảm ${off} cho đơn hàng ${formatVndShort(item.min)}`;
  return `Mã giảm ${off} mọi đơn`;
}

function voucherTerms(item: ShopVoucher) {
  const min = item.min > 0 ? `Áp dụng đơn từ ${formatVndShort(item.min)}.` : "Áp dụng mọi đơn.";
  const extra = item.text.trim();
  return extra ? `${min} ${extra}` : `${min} Giảm ${formatVndShort(item.amount)} khi thanh toán.`;
}

function canUse(item: ShopVoucher, subtotal: number) {
  if (item.amount <= 0 || subtotal <= 0) return false;
  return item.min <= 0 || subtotal >= item.min;
}

function remainOf(item: ShopVoucher, subtotal: number) {
  if (item.min <= 0) return 0;
  return Math.max(0, item.min - subtotal);
}

export function ProductVoucherBlock({
  productSlug,
  selected = "",
  onSelect,
  subtotal = 0,
}: {
  productSlug?: string;
  selected?: string;
  onSelect?: (code: string) => void;
  subtotal?: number;
}) {
  const settings = useShopSettings();
  const { setVoucher } = useCart();
  const vouchers = shopVouchers(settings);
  const [open, setOpen] = useState(false);
  const [terms, setTerms] = useState("");

  useEffect(() => {
    if (!selected) return;
    const item = vouchers.find((row) => row.code === selected);
    if (item && canUse(item, subtotal)) return;
    onSelect?.("");
    setVoucher("", productSlug);
  }, [selected, subtotal, vouchers, onSelect, setVoucher, productSlug]);

  function applyCode(code: string) {
    const item = vouchers.find((row) => row.code === code);
    if (!item) return;
    if (selected === code) {
      onSelect?.("");
      setVoucher("", productSlug);
      return;
    }
    if (!canUse(item, subtotal)) return;
    onSelect?.(code);
    setVoucher(code, productSlug);
  }

  if (!vouchers.length) return null;
  const highlights = vouchers.slice(0, 2);

  return (
    <div className="mt-6 space-y-4">
      <div className="promo-box">
        <p className="promo-box__title">
          <Gift className="h-3.5 w-3.5" strokeWidth={2} />
          Khuyến mãi - ưu đãi
        </p>
        <ul className="mt-1 grid gap-1.5 text-sm text-[var(--ink)]">
          {highlights.map((item) => {
            const ok = canUse(item, subtotal);
            const remain = remainOf(item, subtotal);
            const on = selected === item.code;
            return (
              <li
                key={item.code}
                className={cn("flex items-start gap-2", !ok && !on && "pointer-events-none opacity-40")}
              >
                <span className="promo-check" aria-hidden>
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="min-w-0 leading-relaxed">
                  Nhập mã <strong>{item.code}</strong>{" "}
                  {item.min > 0
                    ? `giảm ${formatVndShort(item.amount)} cho đơn hàng ${formatVndShort(item.min)}`
                    : `giảm ${formatVndShort(item.amount)} mọi đơn`}{" "}
                  {ok || on ? (
                    <button
                      type="button"
                      className="font-semibold text-[var(--accent)] hover:underline"
                      onClick={() => applyCode(item.code)}
                    >
                      {on ? "Đang dùng" : "Chọn"}
                    </button>
                  ) : (
                    <span className="font-semibold">Còn thiếu {formatVndShort(remain)}</span>
                  )}
                </span>
              </li>
            );
          })}
          <li className="flex items-start gap-2">
            <span className="promo-check" aria-hidden>
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="leading-relaxed">Nhận hàng, kiểm tra ưng ý mới thanh toán</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="promo-check" aria-hidden>
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="leading-relaxed">Đổi size trong 7 ngày khi còn tem mác</span>
          </li>
        </ul>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--ink)]">Mã giảm giá</p>
          <button
            type="button"
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-[var(--accent)] hover:underline"
            onClick={() => setOpen(true)}
          >
            Xem tất cả
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex min-w-0 flex-1 gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {vouchers.map((item) => {
              const ok = canUse(item, subtotal);
              const on = selected === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  disabled={!ok && !on}
                  className={cn("voucher-chip", on && "is-on", !ok && !on && "is-off")}
                  onClick={() => setOpen(true)}
                >
                  {item.code}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            aria-label="Xem mã giảm giá"
            className="grid size-8 shrink-0 place-items-center rounded-full border border-[var(--border)] text-[var(--accent)] hover:border-[var(--accent)]"
            onClick={() => setOpen(true)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {open ? (
        <VoucherDrawer
          vouchers={vouchers}
          selected={selected}
          subtotal={subtotal}
          terms={terms}
          onClose={() => setOpen(false)}
          onPick={(code) => applyCode(code)}
          onToggleTerms={(code) => setTerms((cur) => (cur === code ? "" : code))}
        />
      ) : null}
    </div>
  );
}

function VoucherDrawer({
  vouchers,
  selected,
  subtotal,
  terms,
  onClose,
  onPick,
  onToggleTerms,
}: {
  vouchers: ShopVoucher[];
  selected: string;
  subtotal: number;
  terms: string;
  onClose: () => void;
  onPick: (code: string) => void;
  onToggleTerms: (code: string) => void;
}) {
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
    <div className={cn("fixed inset-0 z-[80]", leaving && "pointer-events-none")}>
      <button
        type="button"
        className={cn("shop-modal-backdrop absolute inset-0 bg-[var(--ink)]/40 backdrop-blur-[2px]", inView && "is-in")}
        aria-label="Đóng"
        onClick={close}
      />
      <aside
        role="dialog"
        aria-labelledby="voucher-drawer-title"
        className={cn(
          "voucher-drawer absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-[var(--shadow-lg)]",
          inView && "is-in",
        )}
        onTransitionEnd={onExitEnd}
      >
        <header className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-3">
          <button
            type="button"
            aria-label="Đóng"
            className="grid size-9 place-items-center rounded-full text-[var(--ink)] hover:bg-[var(--surface-2)]"
            onClick={close}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 id="voucher-drawer-title" className="flex-1 text-center text-sm font-semibold text-[var(--ink)]">
            Mã giảm giá
          </h2>
          <span className="size-9" aria-hidden />
        </header>
        <ul className="m-0 grid list-none gap-4 overflow-y-auto p-4">
          {vouchers.map((item) => {
            const ok = canUse(item, subtotal);
            const remain = remainOf(item, subtotal);
            const on = selected === item.code;
            return (
              <li key={item.code} className={cn("coupon-card", on && "is-on", !ok && !on && "is-off")}>
                <div className="coupon-stub" aria-hidden>
                  <span className="leading-none">{voucherStamp(item.amount)}</span>
                </div>
                <div className="min-w-0 px-3 py-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--accent)]">
                    Nhập mã: {item.code}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[var(--ink-muted)]">{voucherHintLine(item)}</p>
                  {!ok ? (
                    <p className="mt-1 text-[11px] font-medium text-[var(--accent)]">
                      Mua thêm {formatVndShort(remain)} để dùng mã
                    </p>
                  ) : null}
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      disabled={!ok && !on}
                      className="rounded-md bg-[var(--accent)] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:bg-[var(--ink-faint)]"
                      onClick={() => {
                        onPick(item.code);
                        close();
                      }}
                    >
                      {on ? "Đang dùng" : ok ? "Chọn" : "Chưa đạt"}
                    </button>
                    <button
                      type="button"
                      className="text-[11px] font-semibold text-[var(--ink)] underline underline-offset-2"
                      onClick={() => onToggleTerms(item.code)}
                    >
                      Điều kiện
                    </button>
                  </div>
                  {terms === item.code ? (
                    <p className="mt-2 text-[11px] leading-relaxed text-[var(--ink-muted)]">{voucherTerms(item)}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>,
    document.body,
  );
}
