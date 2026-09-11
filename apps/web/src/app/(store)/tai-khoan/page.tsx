import Link from "next/link";
import type { Metadata } from "next";
import { brandPageTitle } from "@/config/brand";

export const metadata: Metadata = {
  title: brandPageTitle("Tài khoản"),
  description: "Đăng nhập — ECHO.",
};

export default function AccountPage() {
  return (
    <div className="bg-[var(--surface)]">
      <div className="shop-wrap flex justify-center py-16 sm:py-20">
        <div className="w-full max-w-md rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-lg)]">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[var(--ink)]">
            Xin chào
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Đăng nhập để xem đơn hàng và wishlist.
          </p>
          <div className="mt-8 space-y-4">
            <div>
              <label htmlFor="acc-email" className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
                Email
              </label>
              <input
                id="acc-email"
                type="email"
                autoComplete="email"
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/40 px-4 py-3 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              />
            </div>
            <div>
              <label htmlFor="acc-pass" className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
                Mật khẩu
              </label>
              <input
                id="acc-pass"
                type="password"
                autoComplete="current-password"
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/40 px-4 py-3 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              />
            </div>
            <button type="button" className="btn-primary w-full">
              Đăng nhập
            </button>
            <p className="text-center text-sm text-[var(--ink-muted)]">
              Chưa có tài khoản? <span className="font-semibold text-[var(--ink)]">Đăng ký</span>
            </p>
          </div>
          <Link href="/san-pham" className="mt-8 block text-center text-sm font-semibold text-[var(--accent)] hover:underline">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}
