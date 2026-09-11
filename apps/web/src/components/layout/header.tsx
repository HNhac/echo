"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { brand } from "@/config/brand";
import { BrandMark } from "@/components/layout/brand-mark";
import { useCart } from "@/components/cart/cart-provider";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/bo-suu-tap", label: "Bộ sưu tập" },
  { href: "/san-pham", label: "Cửa hàng" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/cau-chuyen", label: "Câu chuyện" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count, ready } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-[50] transition-[background-color,box-shadow,border-color] duration-300",
        scrolled || open
          ? "border-b border-[var(--border)] bg-white/80 shadow-[var(--shadow-sm)] backdrop-blur-xl"
          : "border-b border-transparent bg-white/45 backdrop-blur-md",
      )}
    >
      <div className="shop-wrap flex h-[3.75rem] items-center justify-between gap-4 lg:h-[4.35rem]">
        <Link
          href="/"
          className="shrink-0 text-[1.35rem] sm:text-[1.55rem]"
          aria-label={`${brand.name} — về trang chủ`}
          onClick={() => setOpen(false)}
        >
          <BrandMark />
        </Link>

        <nav
          className="hidden items-center gap-1 rounded-full border border-[var(--border)] bg-white/70 px-1.5 py-1 lg:flex"
          aria-label="Điều hướng chính"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-1.5 text-[0.8rem] font-medium text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-0.5">
          <Link
            href="/san-pham"
            className="hidden rounded-full p-2.5 text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)] sm:inline-flex"
            aria-label="Tìm kiếm — cửa hàng"
          >
            <Search className="h-5 w-5" strokeWidth={1.7} />
          </Link>
          <Link
            href="/tai-khoan"
            className="hidden rounded-full p-2.5 text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)] sm:inline-flex"
            aria-label="Tài khoản"
          >
            <UserRound className="h-5 w-5" strokeWidth={1.7} />
          </Link>
          <Link
            href="/gio-hang"
            className="relative rounded-full p-2.5 text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
            aria-label="Giỏ hàng"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.7} />
            {ready && count > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold text-white">
                {count}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className="inline-flex rounded-full p-2.5 text-[var(--ink)] lg:hidden"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-[var(--border)] bg-white lg:hidden">
          <nav className="shop-wrap flex flex-col gap-1 py-5" aria-label="Menu di động">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-3 py-3 font-serif text-2xl italic text-[var(--ink)] hover:bg-[var(--surface-2)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
