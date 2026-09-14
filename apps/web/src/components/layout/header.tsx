"use client";

import { ShopLink as Link } from "@/components/store/shop-link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, UserRound, X } from "lucide-react";
import { brand } from "@/config/brand";
import { BrandMark } from "@/components/layout/brand-mark";
import { CartIcon } from "@/components/icons/cart-icon";
import { useCart } from "@/components/cart/cart-provider";
import { useCustomer } from "@/components/account/customer-provider";
import { CartPreview } from "@/components/cart/cart-preview";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/san-pham", label: "Cửa hàng" },
  { href: "/bo-suu-tap", label: "Bộ sưu tập" },
  { href: "/cau-chuyen", label: "Câu chuyện" },
];

function navActive(pathname: string, href: string) {
  if (href === "/san-pham") return pathname === "/san-pham";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function firstName(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).at(-1) || name;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const WEEKDAYS = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatNow(now: Date) {
  return {
    date: `${WEEKDAYS[now.getDay()]}, ${pad(now.getDate())}/${pad(now.getMonth() + 1)}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
  };
}

function HeaderClock() {
  const [now, setNow] = useState<{ date: string; time: string } | null>(null);

  useEffect(() => {
    const tick = () => setNow(formatNow(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <time className="mr-1 hidden min-w-[4.75rem] justify-items-end leading-[1.15] sm:grid">
      {now ? (
        <>
          <strong className="text-[0.9rem] font-semibold tabular-nums text-[var(--ink)]">{now.time}</strong>
          <span className="text-[0.65rem] text-[var(--ink-muted)]">{now.date}</span>
        </>
      ) : (
        <>
          <strong className="invisible text-[0.9rem] font-semibold">00:00</strong>
          <span className="invisible text-[0.65rem]">Thứ 2, 00/00</span>
        </>
      )}
    </time>
  );
}

export function Header() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const { count, ready } = useCart();
  const { customer, logout } = useCustomer();
  const showSearch = pathname === "/san-pham";

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

  useEffect(() => {
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!accountOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [accountOpen]);

  function signOut() {
    logout();
    setAccountOpen(false);
    setOpen(false);
    router.push("/");
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-[50] transition-[background-color,box-shadow,border-color] duration-300",
        scrolled || open
          ? "border-b border-[var(--border)] bg-white/80 shadow-[var(--shadow-sm)] backdrop-blur-xl"
          : "border-b border-transparent bg-white/45 backdrop-blur-md",
      )}
    >
      <div className="shop-wrap flex h-[3.75rem] items-center justify-between gap-3 lg:h-[4.35rem]">
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
          {nav.map((item) => {
            const on = navActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-1.5 text-[0.8rem] font-medium transition-[background,color,box-shadow]",
                  on
                    ? "nav-active"
                    : "text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-0">
          <HeaderClock />
          {showSearch ? (
            <Link
              href="/san-pham#tim-kiem"
              className="hidden rounded-full p-2.5 text-[var(--ink-muted)] transition-[background,color,transform] duration-200 hover:-translate-y-px hover:bg-[var(--surface-2)] hover:text-[var(--ink)] sm:inline-flex"
              aria-label="Tìm kiếm — cửa hàng"
            >
              <Search className="h-5 w-5" strokeWidth={1.7} />
            </Link>
          ) : null}
          {customer ? (
            <div ref={accountRef} className="relative hidden sm:block">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-1.5 text-[var(--ink)] transition-[background,color,transform] duration-200 hover:-translate-y-px hover:bg-[var(--surface-2)]"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                onClick={() => setAccountOpen((v) => !v)}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-bold text-white">
                  {initials(customer.name)}
                </span>
                <span className="max-w-[7.5rem] truncate text-[0.8rem] font-semibold">{firstName(customer.name)}</span>
              </button>
              {accountOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.4rem)] z-20 min-w-[12.5rem] rounded-2xl border border-[var(--border)] bg-white p-1.5 shadow-[var(--shadow-lg)]"
                >
                  <Link
                    href="/tai-khoan"
                    role="menuitem"
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--surface-2)]"
                    onClick={() => setAccountOpen(false)}
                  >
                    Tài khoản
                  </Link>
                  <Link
                    href="/tai-khoan/thong-tin"
                    role="menuitem"
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--surface-2)]"
                    onClick={() => setAccountOpen(false)}
                  >
                    Thông tin cá nhân
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                    onClick={signOut}
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/tai-khoan"
              className="hidden rounded-full p-2 text-[var(--ink-muted)] transition-[background,color,transform] duration-200 hover:-translate-y-px hover:bg-[var(--surface-2)] hover:text-[var(--ink)] sm:inline-flex"
              aria-label="Tài khoản"
            >
              <UserRound className="h-5 w-5" strokeWidth={1.7} />
            </Link>
          )}
          <div className="group/cart relative">
            <Link
              href="/gio-hang"
              className="relative grid size-10 place-items-center rounded-full text-[var(--ink-muted)] transition-[background,color] duration-200 hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              aria-label={ready && count > 0 ? `Giỏ hàng, ${count} sản phẩm` : "Giỏ hàng"}
            >
              <span className="relative inline-flex">
                <CartIcon className="h-6 w-6" />
                {ready && count > 0 ? (
                  <span className="cart-pop absolute -right-2 -top-2 flex h-[1.05rem] min-w-[1.05rem] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold leading-none text-white">
                    {count > 9 ? "9+" : count}
                  </span>
                ) : null}
              </span>
            </Link>
            <div className="absolute right-0 top-full z-30 hidden w-[22rem] pt-3 lg:group-hover/cart:block">
              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-lg)]">
                <CartPreview />
              </div>
            </div>
          </div>
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
        <div className="menu-in border-t border-[var(--border)] bg-white lg:hidden">
          <nav className="shop-wrap flex flex-col gap-1 py-5" aria-label="Menu di động">
            {nav.map((item) => {
              const on = navActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "cursor-pointer rounded-2xl px-3 py-3 font-serif text-2xl italic",
                    on ? "nav-active" : "text-[var(--ink)] hover:bg-[var(--surface-2)]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {showSearch ? (
              <Link
                href="/san-pham#tim-kiem"
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-2xl px-3 py-3 font-serif text-2xl italic text-[var(--ink)] hover:bg-[var(--surface-2)]"
              >
                Tìm kiếm
              </Link>
            ) : null}
            <Link
              href="/tai-khoan"
              onClick={() => setOpen(false)}
              className="cursor-pointer rounded-2xl px-3 py-3 font-serif text-2xl italic text-[var(--ink)] hover:bg-[var(--surface-2)]"
            >
              {customer ? customer.name : "Tài khoản"}
            </Link>
            {customer ? (
              <button
                type="button"
                onClick={signOut}
                className="cursor-pointer rounded-2xl px-3 py-3 text-left font-serif text-2xl italic text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              >
                Đăng xuất
              </button>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
