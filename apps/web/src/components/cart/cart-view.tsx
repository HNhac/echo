"use client";

import Image from "next/image";
import Link from "next/link";
import { formatVnd, productUnitPrice } from "@/data/catalog";
import { mediaUrl } from "@/lib/media";
import { useCart } from "@/components/cart/cart-provider";
import { useCatalog } from "@/lib/use-catalog";
import { Minus, Plus, Trash2 } from "lucide-react";

export function CartView() {
  const { lines, ready, setQty, remove } = useCart();
  const catalog = useCatalog();

  const resolved = lines
    .map((line) => {
      const product = catalog.find((p) => p.slug === line.slug);
      if (!product) return null;
      const unit = productUnitPrice(product);
      return { line, product, unit, total: unit * line.qty };
    })
    .filter((row) => row !== null);

  const subtotal = resolved.reduce((s, r) => s + r.total, 0);
  const ship = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
  const grand = subtotal + ship;

  if (!ready) {
    return (
      <div className="shop-wrap py-20 text-center text-sm text-[var(--ink-muted)]">
        Đang tải giỏ hàng…
      </div>
    );
  }

  if (resolved.length === 0) {
    return (
      <div className="shop-wrap py-12 sm:py-16">
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
    <div className="shop-wrap py-12 sm:py-16">
      <nav className="text-sm text-[var(--ink-muted)]">
        <Link href="/" className="hover:text-[var(--ink)]">
          Trang chủ
        </Link>
        <span className="mx-2 text-[var(--ink-faint)]">/</span>
        <span className="text-[var(--ink)]">Giỏ hàng</span>
      </nav>
      <h1 className="mt-6 font-serif text-3xl font-medium italic tracking-tight text-[var(--ink)] sm:text-4xl">
        Giỏ hàng
      </h1>
      <p className="mt-2 text-sm text-[var(--ink-muted)]">{resolved.length} loại sản phẩm</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <ul className="space-y-4 lg:col-span-2">
          {resolved.map(({ line, product, unit, total }) => (
            <li
              key={`${line.slug}-${line.size}-${line.color}`}
              className="flex gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-sm)]"
            >
              <Link
                href={`/san-pham/${product.slug}`}
                className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)] sm:h-32 sm:w-28"
              >
                <Image src={mediaUrl(product.image)} alt={product.name} fill className="object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/san-pham/${product.slug}`}
                  className="font-serif text-lg font-medium italic text-[var(--ink)] hover:text-[var(--accent)]"
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">
                  {product.category} · Size {line.size} · {line.color}
                </p>
                <p className="mt-2 text-sm font-semibold tabular-nums text-[var(--accent)]">
                  {formatVnd(total)}
                  <span className="ml-2 font-normal text-[var(--ink-faint)]">
                    {formatVnd(unit)} / cái
                  </span>
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center rounded-full border border-[var(--border)]">
                    <button
                      type="button"
                      className="p-2 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                      aria-label="Giảm"
                      onClick={() => setQty(line, line.qty - 1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-7 text-center text-sm font-bold tabular-nums">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      className="p-2 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                      aria-label="Tăng"
                      onClick={() => setQty(line, line.qty + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--ink-faint)] hover:text-[var(--accent)]"
                    onClick={() => remove(line)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-[1.5rem] bg-[var(--ink)] p-6 text-white shadow-[var(--shadow-lg)]">
          <h2 className="font-serif text-xl font-medium italic">Tóm tắt đơn</h2>
          <div className="mt-5 flex justify-between text-sm text-white/65">
            <span>Tạm tính</span>
            <span className="tabular-nums text-white">{formatVnd(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-white/65">
            <span>Vận chuyển</span>
            <span>{ship === 0 ? "Miễn phí" : formatVnd(ship)}</span>
          </div>
          <div className="mt-6 flex justify-between border-t border-white/15 pt-4 font-semibold">
            <span>Tổng</span>
            <span className="tabular-nums text-[var(--accent-warm)]">{formatVnd(grand)}</span>
          </div>
          <Link href="/thanh-toan" className="btn-primary mt-6 w-full">
            Thanh toán
          </Link>
          <Link href="/san-pham" className="mt-4 block text-center text-sm text-white/70 hover:text-white">
            Tiếp tục mua sắm
          </Link>
        </aside>
      </div>
    </div>
  );
}
