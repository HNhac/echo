"use client";

import { useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div>
        <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
          Họ tên
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/40 px-4 py-3 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/40 px-4 py-3 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
          Nội dung
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="mt-2 w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/40 px-4 py-3 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>
      <button type="submit" className="btn-primary w-full sm:w-auto">
        {sent ? "Đã gửi" : "Gửi tin nhắn"}
      </button>
    </form>
  );
}
