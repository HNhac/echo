"use client";

import { CartProvider } from "@/components/cart/cart-provider";

export function StoreProviders({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
