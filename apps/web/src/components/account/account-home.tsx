"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ChevronRight, Mail, MapPin, Package, Phone, ShoppingBag } from "lucide-react";
import { ShopLink as Link } from "@/components/store/shop-link";
import { formatVnd } from "@/data/catalog";
import { mediaUrl } from "@/lib/media";
import { useProducts } from "@/lib/use-products";
import { useCustomer } from "@/components/account/customer-provider";
import { formatWhen, ORDER_STATUS, PAY_LABEL } from "@/components/account/account-helpers";
import { cn } from "@/lib/utils";
import type { Order } from "@echo/shared";

function dash(value: string | undefined) {
  const text = value?.trim();
  return text ? text : "Chưa cập nhật";
}

export function AccountHome() {
  const { customer, orders, loadOrders } = useCustomer();
  const { products } = useProducts();

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  if (!customer) return null;

  const open = orders.filter((order) => order.status !== "done").length;
  const spent = orders.reduce((sum, order) => sum + order.total, 0);
  const missing = !customer.phone.trim() || !customer.address.trim();

  return (
    <div className="shop-stagger grid gap-5 lg:grid-cols-[minmax(16rem,26rem)_minmax(0,1fr)] lg:items-start">
      <div className="space-y-4">
        <section className="shop-lift grid grid-cols-[minmax(6.75rem,auto)_minmax(0,1fr)] overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
          <Stat
            label="Đang xử lý"
            value={String(open)}
            hint={orders.length === 1 ? "1 đơn" : `${orders.length} đơn`}
          />
          <Stat label="Đã mua" value={formatVnd(spent)} last />
        </section>

        {missing ? (
          <Link
            href="/tai-khoan/thong-tin"
            className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--ink)] transition hover:border-[var(--accent)]/40"
          >
            <span>
              <strong className="font-semibold">Thêm SĐT và địa chỉ</strong>
              <span className="mt-0.5 block text-xs text-[var(--ink-muted)]">Checkout lần sau sẽ nhanh hơn.</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
          </Link>
        ) : null}

        <section className="shop-lift overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <h2 className="font-serif text-lg font-medium italic text-[var(--ink)]">Hồ sơ</h2>
            <Link href="/tai-khoan/thong-tin" className="text-sm font-semibold text-[var(--accent)] hover:underline">
              Sửa
            </Link>
          </div>
          <dl className="border-t border-[var(--border)]">
            <Info icon={Mail} label="Email" value={customer.email} />
            <Info icon={Phone} label="SĐT" value={dash(customer.phone)} muted={!customer.phone.trim()} />
            <Info icon={MapPin} label="Địa chỉ" value={dash(customer.address)} muted={!customer.address.trim()} last />
          </dl>
        </section>
      </div>

      <section className="shop-lift rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-sm)] sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-lg font-medium italic text-[var(--ink)]">Đơn hàng</h2>
          <Link href="/san-pham" className="text-sm font-semibold text-[var(--accent)] hover:underline">
            Mua sắm
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/50 px-4 py-7 text-center">
            <ShoppingBag className="mx-auto h-5 w-5 text-[var(--accent)]" aria-hidden />
            <p className="mt-2 text-sm font-semibold text-[var(--ink)]">Chưa có đơn nào</p>
            <Link href="/san-pham" className="mt-3 inline-flex text-sm font-semibold text-[var(--accent)] hover:underline">
              Xem cửa hàng
            </Link>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                thumb={products.find((p) => p.slug === order.items[0]?.slug)?.image}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  last,
}: {
  label: string;
  value: string;
  hint?: string;
  last?: boolean;
}) {
  return (
    <div className={cn("min-w-0 px-3.5 py-3", last ? "text-right" : "border-r border-[var(--border)]")}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">{label}</p>
      <p className="mt-1 font-serif text-lg font-medium leading-none tabular-nums text-[var(--ink)]">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-[var(--ink-faint)]">{hint}</p> : null}
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
  muted,
  last,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  muted?: boolean;
  last?: boolean;
}) {
  return (
    <div className={cn("flex items-start gap-2.5 px-4 py-2.5", !last && "border-b border-[var(--border)]")}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent)]" aria-hidden />
      <div className="min-w-0">
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">{label}</dt>
        <dd className={cn("text-sm leading-snug", muted ? "text-[var(--ink-faint)]" : "text-[var(--ink)]")}>{value}</dd>
      </div>
    </div>
  );
}

function OrderCard({ order, thumb }: { order: Order; thumb?: string }) {
  const status = ORDER_STATUS[order.status];
  const qty = order.items.reduce((n, item) => n + item.qty, 0);
  const src = thumb ? mediaUrl(thumb, "sm") : "";
  const coverName = order.items[0]?.name || "Đơn hàng";

  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-3">
      <div className="flex gap-3">
        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-2)]">
          {src ? (
            <Image src={src} alt={coverName} fill sizes="40px" className="object-cover" />
          ) : (
            <Package className="absolute inset-0 m-auto h-4 w-4 text-[var(--ink-faint)]" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <strong className="truncate text-sm font-semibold text-[var(--ink)]">{order.id}</strong>
              <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", status.className)}>
                {status.label}
              </span>
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--ink)]">{formatVnd(order.total)}</span>
          </div>
          <p className="mt-0.5 truncate text-xs text-[var(--ink-muted)]">
            {order.items.map((item) => `${item.name} ×${item.qty}`).join(" · ")}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--ink-faint)]">
            {formatWhen(order.createdAt)} · {qty} món · {PAY_LABEL[order.pay]}
          </p>
        </div>
      </div>
    </li>
  );
}
