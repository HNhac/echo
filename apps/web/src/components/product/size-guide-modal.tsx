"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Ruler, X } from "lucide-react";
import { KIDS_SIZES, sizeKey } from "@/data/size-guide";
import { cn } from "@/lib/utils";
import { useModalExit } from "@/lib/use-modal-exit";

export function SizeGuideChart({ highlight }: { highlight?: string }) {
  const current = highlight ? sizeKey(highlight) : "";

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-2)] text-[var(--ink)]">
              <th className="px-3 py-2.5 font-semibold">Size</th>
              <th className="px-3 py-2.5 font-semibold">Chiều cao</th>
              <th className="px-3 py-2.5 font-semibold">Cân nặng</th>
              <th className="px-3 py-2.5 font-semibold">Tuổi</th>
            </tr>
          </thead>
          <tbody>
            {KIDS_SIZES.map((row) => {
              const on = current === row.size;
              return (
                <tr
                  key={row.size}
                  className={cn(
                    "border-b border-[var(--border)] last:border-0",
                    on ? "bg-[var(--surface-2)]" : "",
                  )}
                >
                  <td className="px-3 py-2.5 font-semibold text-[var(--accent)]">{row.size}</td>
                  <td className="px-3 py-2.5 text-[var(--ink)]">{row.height}</td>
                  <td className="px-3 py-2.5 text-[var(--ink)]">{row.weight}</td>
                  <td className="px-3 py-2.5 text-[var(--ink-muted)]">{row.age}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="flex gap-2 text-xs leading-relaxed text-[var(--ink-muted)]">
        <Ruler className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent)]" strokeWidth={1.8} />
        Đo chiều cao khi bé đứng thẳng, không mang giày. Cân nặng lúc mặc đồ mỏng. Gần mốc trên thì chọn size lớn hơn 1 nấc.
      </p>
    </div>
  );
}

export function SizeGuideModal({
  highlight,
  onClose,
}: {
  highlight?: string;
  onClose: () => void;
}) {
  const { inView, leaving, close, onExitEnd } = useModalExit(onClose);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [close]);

  return createPortal(
    <div className={cn("fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center", leaving && "pointer-events-none")}>
      <button
        type="button"
        className={cn("shop-modal-backdrop absolute inset-0 bg-[var(--ink)]/40 backdrop-blur-[2px]", inView && "is-in")}
        aria-label="Đóng"
        onClick={close}
      />
      <div
        role="dialog"
        aria-labelledby="size-guide-title"
        className={cn(
          "shop-modal-panel relative w-full max-w-lg rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-lg)] sm:p-6",
          inView && "is-in",
        )}
        onTransitionEnd={onExitEnd}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Bảng size</p>
            <h2 id="size-guide-title" className="mt-1 font-serif text-xl font-medium italic text-[var(--ink)]">
              Hướng dẫn chọn size
            </h2>
          </div>
          <button
            type="button"
            aria-label="Đóng"
            className="grid size-9 shrink-0 place-items-center rounded-full text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
            onClick={close}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">
          <SizeGuideChart highlight={highlight} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
