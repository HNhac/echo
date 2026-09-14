"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_SHOP_SETTINGS, type ShopSettings } from "@echo/shared";

const ShopSettingsContext = createContext<ShopSettings>(DEFAULT_SHOP_SETTINGS);

export function ShopSettingsProvider({
  settings,
  children,
}: {
  settings: ShopSettings;
  children: ReactNode;
}) {
  return <ShopSettingsContext.Provider value={settings}>{children}</ShopSettingsContext.Provider>;
}

export function useShopSettings() {
  return useContext(ShopSettingsContext);
}
