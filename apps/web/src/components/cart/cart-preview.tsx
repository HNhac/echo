"use client";

import Image from "next/image";
import { ShopLink as Link } from "@/components/store/shop-link";
import { formatVnd, productUnitPrice } from "@/data/catalog";
import { mediaUrl } from "@/lib/media";
import { useCart } from "@/components/cart/cart-provider";
import { useProducts } from "@/lib/use-products";

export function CartPreview() {
  const { lines, ready, count } = useCart();
  const { products, loaded } = useProducts();

  const rows = lines
    .map((line) => {
      const product = products.find((p) => p.slug === line.slug);
      if (!product) return null;
      return { line, product, total: productUnitPrice(product) * line.qty };
    })
    .filter((row) => row !== null);

  const subtotal = rows.reduce((s, r) => s + r.total, 0);

  if (!ready || (lines.length > 0 && !loaded)) {
    return <p className="px-4 py-5 text-sm text-[var(--ink-muted)]">Đang tải giỏ…</p>;
  }

  if (rows.length === 0) {
    return (
      <div className="px-4 py-5">
        <p className="text-sm text-[var(--ink-muted)]">Giỏ hàng trống</p>
        <Link href="/san-pham" className="mt-3 inline-flex text-sm font-semibold text-[var(--accent)]">
          Mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="p-3">
      <p className="px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
        Giỏ hàng · {count}
      </p>
      <ul className="mt-2 max-h-64 space-y-2 overflow-auto">
        {rows.map(({ line, product, total }) => (
          <li key={`${line.slug}-${line.size}-${line.color}`} className="flex gap-2.5 rounded-xl p-1">
            <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-2)]">
              {mediaUrl(product.image, "sm") ? (
                <Image src={mediaUrl(product.image, "sm")} alt="" fill className="object-cover" sizes="44px" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--ink)]">{product.name}</p>
              <p className="text-[11px] text-[var(--ink-muted)]">
                {line.color} · {line.size} · x{line.qty}
              </p>
            </div>
            <p className="shrink-0 text-xs font-semibold tabular-nums text-[var(--ink)]">{formatVnd(total)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center justify-between border-t border-[var(--border)] px-1 pt-2 text-sm">
        <span className="text-[var(--ink-muted)]">Tạm tính</span>
        <span className="font-semibold tabular-nums">{formatVnd(subtotal)}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link href="/gio-hang" className="btn-ghost h-10 px-3 text-xs">
          Xem giỏ
        </Link>
        <Link href="/thanh-toan" className="btn-primary h-10 px-3 text-xs">
          Thanh toán
        </Link>
      </div>
    </div>
  );
}
