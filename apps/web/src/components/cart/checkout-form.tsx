"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatVnd, productUnitPrice } from "@/data/catalog";
import { useCart } from "@/components/cart/cart-provider";
import { useCatalog } from "@/lib/use-catalog";
import { createOrder } from "@/lib/store-api";

export function CheckoutForm() {
  const router = useRouter();
  const { lines, ready, clear } = useCart();
  const catalog = useCatalog();
  const [pay, setPay] = useState<"cod" | "bank">("cod");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const resolved = useMemo(
    () =>
      lines
        .map((line) => {
          const product = catalog.find((p) => p.slug === line.slug);
          if (!product) return null;
          const unit = productUnitPrice(product);
          return { line, product, total: unit * line.qty };
        })
        .filter((row) => row !== null),
    [lines, catalog],
  );

  const subtotal = resolved.reduce((s, r) => s + r.total, 0);
  const ship = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
  const grand = subtotal + ship;

  if (!ready) {
    return (
      <p className="py-16 text-center text-sm text-[var(--ink-muted)]">Đang tải đơn hàng…</p>
    );
  }

  if (resolved.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-serif text-2xl italic text-[var(--ink)]">Giỏ hàng trống</p>
        <Link href="/san-pham" className="btn-primary mt-6 inline-flex">
          Chọn đồ cho bé
        </Link>
      </div>
    );
  }

  return (
    <form
      className="mt-10 grid gap-10 lg:grid-cols-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        setSending(true);
        setError("");
        try {
          const order = await createOrder({
            name: String(fd.get("name") ?? ""),
            phone: String(fd.get("phone") ?? ""),
            address: String(fd.get("address") ?? ""),
            note: String(fd.get("note") ?? "") || undefined,
            pay,
            items: resolved.map(({ line }) => ({
              slug: line.slug,
              qty: line.qty,
              size: line.size,
              color: line.color,
            })),
          });
          clear();
          router.push(`/thanh-toan/thanh-cong?ma=${order.id}&pt=${order.pay}`);
        } catch (err) {
          setSending(false);
          setError(
            err instanceof Error
              ? err.message
              : "Không đặt được hàng. Hãy chạy API cổng 4000.",
          );
        }
      }}
    >
      <div className="space-y-5 lg:col-span-2">
        <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
          <h2 className="font-serif text-xl font-medium italic text-[var(--ink)]">
            Thông tin nhận hàng
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Họ tên mẹ / người nhận" required />
            <Field id="phone" label="Số điện thoại" type="tel" required />
            <div className="sm:col-span-2">
              <Field id="address" label="Địa chỉ giao hàng" required />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="note" className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
                Ghi chú (size, giờ giao…)
              </label>
              <textarea
                id="note"
                name="note"
                rows={3}
                className="mt-2 w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/50 px-4 py-3 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
          <h2 className="font-serif text-xl font-medium italic text-[var(--ink)]">
            Hình thức thanh toán
          </h2>
          <div className="mt-4 space-y-3">
            <PayOption
              checked={pay === "cod"}
              onChange={() => setPay("cod")}
              title="Thu hộ khi nhận hàng (COD)"
              text="Trả tiền mặt cho shipper. Phù hợp đơn trong nước."
            />
            <PayOption
              checked={pay === "bank"}
              onChange={() => setPay("bank")}
              title="Chuyển khoản"
              text="CK theo mã đơn sau khi đặt. Shop xác nhận rồi mới gửi hàng."
            />
          </div>
          {pay === "bank" ? (
            <p className="mt-4 rounded-2xl bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--ink-muted)]">
              STK demo: <strong className="text-[var(--ink)]">ECHO 0123456789 — MB Bank</strong>
              . Nội dung CK: mã đơn + SĐT.
            </p>
          ) : null}
        </div>
      </div>

      <aside className="h-fit rounded-[1.5rem] bg-[var(--ink)] p-6 text-white shadow-[var(--shadow-lg)]">
        <h2 className="font-serif text-xl font-medium italic">Đơn của bé</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {resolved.map(({ line, product, total }) => (
            <li key={`${line.slug}-${line.size}-${line.color}`} className="flex justify-between gap-3">
              <span className="text-white/75">
                {product.name} × {line.qty}
              </span>
              <span className="tabular-nums">{formatVnd(total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between text-sm text-white/65">
          <span>Ship</span>
          <span>{ship === 0 ? "Miễn phí" : formatVnd(ship)}</span>
        </div>
        <div className="mt-5 flex justify-between border-t border-white/15 pt-4 font-semibold">
          <span>Tổng</span>
          <span className="tabular-nums text-[var(--accent-warm)]">{formatVnd(grand)}</span>
        </div>
        <button type="submit" disabled={sending} className="btn-primary mt-6 w-full">
          {sending ? "Đang đặt…" : "Đặt hàng"}
        </button>
        {error ? (
          <p className="mt-3 text-center text-xs leading-relaxed text-[var(--accent-warm)]">
            {error}
          </p>
        ) : null}
        <p className="mt-3 text-center text-[11px] leading-relaxed text-white/45">
          Shop nhận đơn COD / chuyển khoản. Chưa kết nối cổng thẻ quốc tế.
        </p>
      </aside>
    </form>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
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
        className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/50 px-4 py-3 text-sm outline-none ring-[var(--accent)] focus:ring-2"
      />
    </div>
  );
}

function PayOption({
  checked,
  onChange,
  title,
  text,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  text: string;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-2xl border border-[var(--border)] p-4 has-[:checked]:border-[var(--accent)] has-[:checked]:bg-[var(--surface-2)]">
      <input type="radio" name="pay" checked={checked} onChange={onChange} className="mt-1 accent-[var(--accent)]" />
      <span>
        <span className="block text-sm font-semibold text-[var(--ink)]">{title}</span>
        <span className="mt-0.5 block text-xs text-[var(--ink-muted)]">{text}</span>
      </span>
    </label>
  );
}
