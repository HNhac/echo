"use client";

import { RefreshCcw, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { useShopSettings } from "@/components/store/shop-settings-provider";
import { freeShipTitle } from "@echo/shared";

export function TrustStrip() {
  const settings = useShopSettings();
  const items = [
    { icon: Truck, title: freeShipTitle(settings.freeshipFrom), text: `Nội thành ${settings.shipDaysInner}` },
    { icon: RefreshCcw, title: "Đổi size 7 ngày", text: "Còn tag, chưa giặt" },
    { icon: Sparkles, title: "Vải mềm da bé", text: "Cotton, không xù ngứa" },
    { icon: ShieldCheck, title: "Size 90–140", text: "Khoảng 1–10 tuổi" },
  ];

  return (
    <section className="bg-white/70">
      <div className="shop-wrap shop-stagger grid grid-cols-2 gap-6 py-8 sm:grid-cols-4 sm:py-10">
        {items.map((item) => (
          <div key={item.title} className="flex flex-col items-center text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--accent)] ring-1 ring-[var(--border)] transition-transform duration-300 hover:-translate-y-0.5">
              <item.icon className="h-4 w-4" strokeWidth={1.7} />
            </span>
            <p className="mt-3 text-sm font-semibold text-[var(--ink)]">{item.title}</p>
            <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
