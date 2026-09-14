"use client";

import { useShopSettings } from "@/components/store/shop-settings-provider";
import { freeShipLabel } from "@echo/shared";

function phrases(freeship: string) {
  return [
    "Thời trang bé gái",
    "Size 90–140",
    "Vải cotton mềm",
    "Váy · Set · Áo",
    "Đổi size 7 ngày",
    freeship,
  ];
}

function Segment({ suffix, items }: { suffix: string; items: string[] }) {
  return (
    <div className="flex shrink-0 items-center gap-6 px-3 sm:gap-10 sm:px-6">
      {items.map((text, i) => (
        <span key={`${suffix}-${i}`} className="flex items-center gap-6 sm:gap-10">
          <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--surface)]/95 sm:text-[11px]">
            {text}
          </span>
          <span className="select-none text-[var(--accent-warm)] opacity-90 sm:text-sm">
            ✦
          </span>
        </span>
      ))}
    </div>
  );
}

export function MarqueeStrip() {
  const settings = useShopSettings();
  const items = phrases(freeShipLabel(settings.freeshipFrom));

  return (
    <div className="relative overflow-hidden border-y border-[var(--border)] bg-[var(--ink)] py-3.5">
      <p className="sr-only">Thời trang bé gái, size 90–140, vải cotton mềm.</p>
      <div className="loom-marquee-track flex w-max">
        <Segment suffix="a" items={items} />
        <Segment suffix="b" items={items} />
      </div>
    </div>
  );
}
