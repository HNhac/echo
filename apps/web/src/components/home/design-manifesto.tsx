"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Shirt, Sparkles } from "lucide-react";
import { brandTagline } from "@/config/brand-media";

const STEPS = [
  {
    icon: Heart,
    title: "Vải mềm da bé",
    text: "Cotton, voan có lót — không xù, không ngứa khi bé chạy nhảy.",
  },
  {
    icon: Shirt,
    title: "Form dễ mặc",
    text: "Size 90–140 rõ ràng. Bo chun mềm, cài nút/kéo dễ cho mẹ.",
  },
  {
    icon: Sparkles,
    title: "Xinh mà vẫn chơi được",
    text: "Đầm tiệc hay set nắng hè đều giặt máy nhẹ, mặc được nhiều lần.",
  },
];

export function DesignManifesto() {
  return (
    <section className="relative overflow-hidden bg-[var(--surface)] py-14 sm:py-20">
      <div className="shop-wrap relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="section-head"
        >
          <p className="eyebrow">Vì sao mẹ chọn</p>
          <h2 className="mt-3 font-serif text-[clamp(1.75rem,3.6vw,2.6rem)] font-medium leading-[1.15] tracking-tight text-[var(--ink)]">
            Đồ cho bé gái — <span className="text-[var(--accent)]">xinh, mềm, dễ mặc</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
            {brandTagline.manifesto}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/san-pham" className="btn-primary">
              Xem đồ đang bán
            </Link>
            <Link href="/cau-chuyen" className="btn-ghost">
              Câu chuyện shop
            </Link>
          </div>
        </motion.div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="rounded-[1.6rem] border border-[var(--border)] bg-white/80 p-7 text-center shadow-[var(--shadow-sm)]"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--accent)] ring-1 ring-[var(--border)]">
                <step.icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 font-serif text-lg font-medium text-[var(--ink)]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{step.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
