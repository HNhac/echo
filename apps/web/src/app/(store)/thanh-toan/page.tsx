import type { Metadata } from "next";
import Link from "next/link";
import { brandPageTitle } from "@/config/brand";
import { CheckoutForm } from "@/components/cart/checkout-form";

export const metadata: Metadata = {
  title: brandPageTitle("Thanh toán"),
  description: "Đặt hàng ECHO — COD hoặc chuyển khoản.",
};

export default function CheckoutPage() {
  return (
    <div className="bg-[var(--surface)]">
      <div className="shop-wrap py-12 sm:py-16">
        <nav className="text-sm text-[var(--ink-muted)]">
          <Link href="/" className="hover:text-[var(--ink)]">
            Trang chủ
          </Link>
          <span className="mx-2 text-[var(--ink-faint)]">/</span>
          <Link href="/gio-hang" className="hover:text-[var(--ink)]">
            Giỏ hàng
          </Link>
          <span className="mx-2 text-[var(--ink-faint)]">/</span>
          <span className="text-[var(--ink)]">Thanh toán</span>
        </nav>
        <h1 className="mt-6 font-serif text-3xl font-medium italic tracking-tight text-[var(--ink)] sm:text-4xl">
          Thanh toán
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Điền địa chỉ nhận hàng. Thanh toán khi nhận (COD) hoặc chuyển khoản.
        </p>
        <CheckoutForm />
      </div>
    </div>
  );
}
