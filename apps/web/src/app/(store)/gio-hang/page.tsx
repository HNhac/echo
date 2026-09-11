import type { Metadata } from "next";
import { brandPageTitle } from "@/config/brand";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: brandPageTitle("Giỏ hàng"),
  description: "Giỏ hàng — ECHO.",
};

export default function CartPage() {
  return (
    <div className="bg-[var(--surface)]">
      <CartView />
    </div>
  );
}
