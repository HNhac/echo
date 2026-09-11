"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export function Newsletter() {
  const [sent, setSent] = useState(false);

  return (
    <section className="relative overflow-hidden bg-[var(--surface-2)] py-14 sm:py-20">
      <div className="shop-wrap">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[var(--ink)] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[var(--accent)]/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[var(--gold)]/20 blur-3xl"
          />
          <div className="relative mx-auto max-w-lg">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Mail className="h-5 w-5 text-[var(--accent-warm)]" />
            </span>
            <h2 className="mt-5 font-serif text-3xl font-medium italic tracking-tight sm:text-4xl">
              Nhận mẫu mới
            </h2>
            <p className="mt-3 text-sm text-white/65 sm:text-base">
              Váy restock, mã giảm và lookbook cho mẹ — không spam.
            </p>
            <form
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@email.com"
                className="h-12 flex-1 rounded-full border border-white/15 bg-white/10 px-5 text-sm text-white outline-none placeholder:text-white/40 focus:border-[var(--accent-warm)]"
              />
              <button type="submit" className="btn-primary h-12">
                {sent ? "Đã ghi nhận" : "Đăng ký"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
