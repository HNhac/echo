"use client";

import { ShopLink as Link } from "@/components/store/shop-link";
import { usePathname } from "next/navigation";
import { LayoutGrid, LogOut, UserRound } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AccountAvatar } from "@/components/account/account-avatar";
import { givenName, memberSince } from "@/components/account/account-helpers";
import { useCustomer } from "@/components/account/customer-provider";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const links = [
  { href: "/tai-khoan", label: "Tổng quan", icon: LayoutGrid },
  { href: "/tai-khoan/thong-tin", label: "Thông tin", icon: UserRound },
];

export function AccountFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/tai-khoan";
  const reduce = useReducedMotion();
  const { customer, logout } = useCustomer();
  const hello = customer?.name ? givenName(customer.name) : "";

  return (
    <div className="bg-[var(--surface)]">
      <div className="shop-wrap py-6 sm:py-8">
        <motion.header
          className="flex flex-wrap items-center gap-x-4 gap-y-3"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
        >
          <motion.div
            initial={reduce ? false : { scale: 0.86, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease, delay: 0.05 }}
          >
            <AccountAvatar name={customer?.name || "ECHO"} google={customer?.google} size="md" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-serif text-2xl font-medium tracking-tight text-[var(--ink)] sm:text-[1.7rem]">
              Xin chào{hello ? `, ${hello}` : ""}
            </h1>
            <p className="mt-0.5 truncate text-xs text-[var(--ink-muted)]">
              {customer?.google ? "Google" : "Email"}
              {customer?.createdAt ? ` · ${memberSince(customer.createdAt)}` : ""}
            </p>
          </div>
          <nav className="order-last flex w-full rounded-full border border-[var(--border)] bg-[var(--surface-2)]/90 p-1 sm:order-none sm:w-auto">
            {links.map((item) => {
              const on = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "relative inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition sm:flex-none",
                    on ? "text-[var(--ink)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
                  )}
                >
                  {on && !reduce ? (
                    <motion.span
                      layoutId="echo-account-tab"
                      className="absolute inset-0 rounded-full bg-white shadow-[var(--shadow-sm)]"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  ) : on ? (
                    <span className="absolute inset-0 rounded-full bg-white shadow-[var(--shadow-sm)]" />
                  ) : null}
                  <Icon className="relative h-3.5 w-3.5" aria-hidden />
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-semibold text-[var(--ink-muted)] transition hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Đăng xuất
          </button>
        </motion.header>

        <div className="mt-5">
          {reduce ? (
            children
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
