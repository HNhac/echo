import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { metadataForPage } from "@/lib/page-seo";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return metadataForPage("gio-hang", "Giỏ hàng", "Giỏ hàng — ECHO.");
}

export default function CartPage() {
  return (
    <div className="bg-[var(--surface)]">
      <CartView />
    </div>
  );
}
