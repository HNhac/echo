"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Landmark, ShieldCheck, Truck } from "lucide-react";
import { ShopLink as Link } from "@/components/store/shop-link";
import { formatVnd, productUnitPrice } from "@/data/catalog";
import { useCart } from "@/components/cart/cart-provider";
import { useCustomer } from "@/components/account/customer-provider";
import { useProducts } from "@/lib/use-products";
import { createOrder } from "@/lib/store-api";
import { AddressFields } from "@/components/forms/address-fields";
import { useShopSettings } from "@/components/store/shop-settings-provider";
import { lineKey } from "@/lib/cart";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import {
  formatVndShort,
  shippingFeeOf,
  shopVouchers,
  voucherDiscountOf,
  voucherOf,
  type ShopVoucher,
} from "@echo/shared";

function canUse(item: ShopVoucher, subtotal: number) {
  if (item.amount <= 0 || subtotal <= 0) return false;
  return item.min <= 0 || subtotal >= item.min;
}

export function CheckoutForm() {
  const router = useRouter();
  const { lines, ready, removePicked, voucher: savedVoucher, setVoucher: saveVoucher, pickedKeys } = useCart();
  const { products: catalog, loaded } = useProducts();
  const { customer, key: customerKey } = useCustomer();
  const settings = useShopSettings();
  const [pay, setPay] = useState<"cod" | "bank">("cod");
  const [voucher, setVoucher] = useState(savedVoucher);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (savedVoucher) setVoucher(savedVoucher);
  }, [savedVoucher]);

  const resolved = useMemo(
    () =>
      lines
        .filter((line) => pickedKeys.includes(lineKey(line)))
        .map((line) => {
          const product = catalog.find((p) => p.slug === line.slug);
          if (!product) return null;
          const unit = productUnitPrice(product);
          return { line, product, total: unit * line.qty };
        })
        .filter((row) => row !== null),
    [lines, catalog, pickedKeys],
  );

  const qtyCount = resolved.reduce((s, r) => s + r.line.qty, 0);
  const subtotal = resolved.reduce((s, r) => s + r.total, 0);
  const ship = shippingFeeOf(subtotal, settings);
  const codes = shopVouchers(settings);
  const applied = voucherOf(settings, voucher);
  const discount = voucherDiscountOf(subtotal, settings, voucher);
  const grand = subtotal - discount + ship;
  const remain = settings.freeshipFrom > 0 ? Math.max(0, settings.freeshipFrom - subtotal) : 0;
  const freeshipPct =
    settings.freeshipFrom > 0 ? Math.min(100, Math.round((subtotal / settings.freeshipFrom) * 100)) : 100;

  function pickVoucher(next: string) {
    const code = next.trim().toUpperCase();
    setVoucher(code);
    const found = voucherOf(settings, code);
    if (!code) {
      saveVoucher("");
      return;
    }
    if (found && canUse(found, subtotal)) saveVoucher(code);
  }

  if (!ready || (lines.length > 0 && !loaded)) {
    return <p className="py-16 text-center text-sm text-[var(--ink-muted)]">Đang tải đơn hàng…</p>;
  }

  if (resolved.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-serif text-2xl italic text-[var(--ink)]">
          {lines.length ? "Chưa chọn món để thanh toán" : "Giỏ hàng trống"}
        </p>
        <Link href={lines.length ? "/gio-hang" : "/san-pham"} className="btn-primary mt-6 inline-flex">
          {lines.length ? "Chọn trong giỏ hàng" : "Chọn đồ cho bé"}
        </Link>
      </div>
    );
  }

  return (
    <form
      className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22.5rem] xl:grid-cols-[minmax(0,1fr)_24rem]"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        setSending(true);
        setError("");
        try {
          const order = await createOrder(
            {
              name: String(fd.get("name") ?? ""),
              phone: String(fd.get("phone") ?? ""),
              address: String(fd.get("address") ?? ""),
              note: String(fd.get("note") ?? "") || undefined,
              pay,
              voucher: discount > 0 ? voucher : undefined,
              items: resolved.map(({ line }) => ({
                slug: line.slug,
                qty: line.qty,
                size: line.size,
                color: line.color,
              })),
            },
            customerKey || undefined,
          );
          removePicked();
          router.push(`/thanh-toan/thanh-cong?ma=${order.id}&pt=${order.pay}`);
        } catch (err) {
          setSending(false);
          setError(err instanceof Error ? err.message : "Không đặt được hàng. Hãy chạy API cổng 4000.");
        }
      }}
    >
      <div className="space-y-4">
        <section className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-full bg-[var(--surface-2)] text-sm font-bold text-[var(--accent)]">
              1
            </span>
            <div>
              <h2 className="font-serif text-xl font-medium italic text-[var(--ink)]">Thông tin nhận hàng</h2>
              <p className="text-xs text-[var(--ink-muted)]">Shop giao theo địa chỉ mới 34 tỉnh/thành</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Họ tên người nhận" required defaultValue={customer?.name} />
            <Field id="phone" label="Số điện thoại" type="tel" required defaultValue={customer?.phone} />
            <AddressFields required defaultValue={customer?.address} />
            <div className="sm:col-span-2">
              <label htmlFor="note" className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
                Ghi chú
              </label>
              <textarea
                id="note"
                name="note"
                rows={3}
                placeholder="Size, giờ giao, lời nhắn cho shop…"
                className="mt-1.5 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50 px-3.5 py-2.5 text-sm outline-none ring-[var(--accent)] transition focus:bg-white focus:ring-2"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-full bg-[var(--surface-2)] text-sm font-bold text-[var(--accent)]">
              2
            </span>
            <div>
              <h2 className="font-serif text-xl font-medium italic text-[var(--ink)]">Thanh toán</h2>
              <p className="text-xs text-[var(--ink-muted)]">Chọn một hình thức khi nhận hoặc chuyển khoản</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <PayOption
              checked={pay === "cod"}
              onChange={() => setPay("cod")}
              icon={<Truck className="h-5 w-5" strokeWidth={1.8} />}
              title="COD"
              text="Thu hộ khi nhận hàng"
            />
            <PayOption
              checked={pay === "bank"}
              onChange={() => setPay("bank")}
              icon={<Landmark className="h-5 w-5" strokeWidth={1.8} />}
              title="Chuyển khoản"
              text="CK theo mã đơn sau khi đặt"
            />
          </div>
          {pay === "bank" ? (
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/70 px-4 py-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Thông tin CK</p>
              <p className="mt-1 text-sm font-semibold text-[var(--ink)]">ECHO 0123456789 — MB Bank</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--ink-muted)]">
                Nội dung: mã đơn + số điện thoại. Shop xác nhận rồi mới gửi hàng.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-xs leading-relaxed text-[var(--ink-muted)]">
              Kiểm hàng khi nhận. Đổi size trong 7 ngày khi còn tem mác.
            </p>
          )}
        </section>
      </div>

      <aside className="h-fit overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)] lg:sticky lg:top-24">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="font-serif text-xl font-medium italic text-[var(--ink)]">Đơn hàng</h2>
          <p className="mt-0.5 text-sm text-[var(--ink-muted)]">
            {qtyCount} món · {resolved.length} loại
          </p>
        </div>

        <ul className="space-y-3 px-5 py-4">
          {resolved.map(({ line, product, total }) => (
            <li key={`${line.slug}-${line.size}-${line.color}`} className="flex gap-3">
              <div className="relative h-[4.25rem] w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)]">
                {mediaUrl(product.image, "sm") ? (
                  <Image src={mediaUrl(product.image, "sm")} alt="" fill className="object-cover" sizes="56px" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium leading-snug text-[var(--ink)]">{product.name}</p>
                <p className="mt-0.5 text-[11px] text-[var(--ink-muted)]">
                  {line.color} · Size {line.size} · x{line.qty}
                </p>
                {line.voucher ? (
                  <span className="mt-1 inline-flex rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[var(--accent)]">
                    {line.voucher}
                  </span>
                ) : null}
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-[var(--ink)]">{formatVnd(total)}</p>
            </li>
          ))}
        </ul>

        {settings.freeshipFrom > 0 ? (
          <div className="px-5 pb-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
                style={{ width: `${freeshipPct}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--ink-muted)]">
              {ship === 0
                ? "Đơn được miễn phí vận chuyển"
                : `Mua thêm ${formatVndShort(remain)} để freeship`}
            </p>
          </div>
        ) : null}

        {codes.length ? (
          <div className="px-5 pb-4 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Mã giảm giá</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {codes.map((item) => {
                const on = applied?.code === item.code && discount > 0;
                const ok = canUse(item, subtotal);
                return (
                  <button
                    key={item.code}
                    type="button"
                    disabled={!ok && !on}
                    onClick={() => pickVoucher(on ? "" : item.code)}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-semibold",
                      on
                        ? "bg-[var(--accent)] text-white"
                        : ok
                          ? "border border-[var(--border)] text-[var(--ink-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                          : "cursor-not-allowed border border-[var(--border)] text-[var(--ink-faint)] opacity-40",
                    )}
                  >
                    {item.code}
                  </button>
                );
              })}
            </div>
            {discount > 0 ? (
              <p className="mt-2 text-xs font-medium text-[var(--accent)]">
                {applied?.code} −{formatVnd(discount)}
              </p>
            ) : voucher.trim() ? (
              <p className="mt-2 text-[11px] text-[var(--ink-faint)]">
                {applied && applied.min > 0 && subtotal < applied.min
                  ? `Đơn từ ${formatVndShort(applied.min)} mới dùng được mã.`
                  : "Mã không đúng."}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2 border-t border-[var(--border)] px-5 py-4 text-sm">
          <div className="flex justify-between text-[var(--ink-muted)]">
            <span>Tạm tính</span>
            <span className="tabular-nums text-[var(--ink)]">{formatVnd(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[var(--ink-muted)]">
            <span>Vận chuyển</span>
            <span className="tabular-nums text-[var(--ink)]">{ship === 0 ? "Miễn phí" : formatVnd(ship)}</span>
          </div>
          {discount > 0 ? (
            <div className="flex justify-between text-[var(--accent)]">
              <span>Voucher {applied?.code}</span>
              <span className="tabular-nums">−{formatVnd(discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-[var(--border)] pt-3 text-base font-semibold text-[var(--ink)]">
            <span>Tổng</span>
            <span className="tabular-nums text-[var(--accent)]">{formatVnd(grand)}</span>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button type="submit" disabled={sending} className="btn-primary w-full">
            {sending ? "Đang đặt…" : `Đặt hàng · ${formatVnd(grand)}`}
          </button>
          {error ? <p className="mt-3 text-center text-xs leading-relaxed text-[var(--accent)]">{error}</p> : null}
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[var(--ink-faint)]">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
            COD / chuyển khoản · kiểm hàng khi nhận
          </p>
          <Link href="/gio-hang" className="mt-2 block text-center text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">
            Quay lại giỏ hàng
          </Link>
        </div>
      </aside>
    </form>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
  defaultValue,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50 px-3.5 py-2.5 text-sm outline-none ring-[var(--accent)] transition focus:bg-white focus:ring-2"
      />
    </div>
  );
}

function PayOption({
  checked,
  onChange,
  icon,
  title,
  text,
}: {
  checked: boolean;
  onChange: () => void;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-3 rounded-2xl border p-4 transition",
        checked
          ? "border-[var(--accent)] bg-[var(--surface-2)] shadow-[var(--shadow-sm)]"
          : "border-[var(--border)] bg-white hover:border-[var(--ink-faint)]",
      )}
    >
      <input type="radio" name="pay" checked={checked} onChange={onChange} className="sr-only" />
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full",
          checked ? "bg-[var(--accent)] text-white" : "bg-[var(--surface-2)] text-[var(--ink-muted)]",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[var(--ink)]">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-[var(--ink-muted)]">{text}</span>
      </span>
    </label>
  );
}
