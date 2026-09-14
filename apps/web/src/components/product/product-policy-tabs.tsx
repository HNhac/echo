"use client";

import { useState } from "react";
import type { Product } from "@/data/catalog";
import { ProductCopy } from "./product-copy";
import { cn } from "@/lib/utils";
import { useShopSettings } from "@/components/store/shop-settings-provider";

const TABS = [
  { id: "product", label: "Thông tin sản phẩm" },
  { id: "return", label: "Đổi trả" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ProductPolicyTabs({ product }: { product: Product }) {
  const settings = useShopSettings();
  const [tab, setTab] = useState<TabId>("product");
  const extra = product.detail && product.detail !== product.description ? product.detail : "";

  return (
    <div className="mt-12">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Thông tin sản phẩm">
        {TABS.map((item) => {
          const on = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={on}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-all",
                on
                  ? "nav-active border-transparent"
                  : "border border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--ink-faint)] hover:text-[var(--ink)]",
              )}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="mt-5 min-h-16" role="tabpanel">
        {tab === "product" ? (
          <>
            <ProductCopy value={product.description} />
            {extra ? <ProductCopy value={extra} className="mt-4" /> : null}
            {settings.policyProduct && settings.policyProduct !== product.description ? (
              <ProductCopy value={settings.policyProduct} className="mt-4" />
            ) : null}
          </>
        ) : (
          <ProductCopy value={settings.policyReturn} />
        )}
      </div>
    </div>
  );
}
