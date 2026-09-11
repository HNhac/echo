import { RefreshCcw, ShieldCheck, Truck, Sparkles } from "lucide-react";

const items = [
  { icon: Truck, title: "Freeship 500k", text: "Nội thành 2–4 ngày" },
  { icon: RefreshCcw, title: "Đổi size 7 ngày", text: "Còn tag, chưa giặt" },
  { icon: Sparkles, title: "Vải mềm da bé", text: "Cotton, không xù ngứa" },
  { icon: ShieldCheck, title: "Size 90–140", text: "Khoảng 1–10 tuổi" },
];

export function TrustStrip() {
  return (
    <section className="bg-white/70">
      <div className="shop-wrap grid grid-cols-2 gap-6 py-8 sm:grid-cols-4 sm:py-10">
        {items.map((item) => (
          <div key={item.title} className="flex flex-col items-center text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--accent)] ring-1 ring-[var(--border)]">
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
