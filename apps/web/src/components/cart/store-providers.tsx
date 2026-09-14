"use client";

import { CartProvider } from "@/components/cart/cart-provider";
import { CustomerProvider } from "@/components/account/customer-provider";
import { ShopSettingsProvider } from "@/components/store/shop-settings-provider";
import type { ShopSettings } from "@echo/shared";

export function StoreProviders({
  settings,
  children,
}: {
  settings: ShopSettings;
  children: React.ReactNode;
}) {
  return (
    <ShopSettingsProvider settings={settings}>
      <CustomerProvider>
        <CartProvider>{children}</CartProvider>
      </CustomerProvider>
    </ShopSettingsProvider>
  );
}
