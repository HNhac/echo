import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { metadataForPage } from "@/lib/page-seo";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return metadataForPage("thanh-toan", "Thanh toán", "Đặt hàng ECHO — COD hoặc chuyển khoản.");
}

export default function CheckoutPage() {
  return (
    <div className="bg-[var(--surface)]">
      <div className="shop-wrap py-6 sm:py-8">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-serif text-2xl font-medium italic tracking-tight text-[var(--ink)] sm:text-3xl">
            Thanh toán
          </h1>
          <p className="text-sm text-[var(--ink-muted)]">COD hoặc chuyển khoản</p>
        </div>
        <CheckoutForm />
      </div>
    </div>
  );
}
