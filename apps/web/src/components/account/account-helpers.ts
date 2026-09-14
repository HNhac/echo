import type { OrderStatus } from "@echo/shared";

export function givenName(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).at(-1) || name;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts.at(-1)![0]}`.toUpperCase();
  }
  return (name.trim().slice(0, 2) || "E").toUpperCase();
}

export function memberSince(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
}

export function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ORDER_STATUS: Record<OrderStatus, { label: string; className: string }> = {
  new: {
    label: "Mới",
    className: "bg-[var(--surface-3)] text-[var(--accent-hover)]",
  },
  confirmed: {
    label: "Đã xác nhận",
    className: "bg-[var(--accent-warm)] text-[var(--accent-hover)]",
  },
  shipped: {
    label: "Đang giao",
    className: "bg-[var(--surface-3)] text-[var(--ink)]",
  },
  done: {
    label: "Hoàn tất",
    className: "bg-[var(--surface-2)] text-[var(--ink-muted)]",
  },
};

export const PAY_LABEL = {
  cod: "Khi nhận hàng",
  bank: "Chuyển khoản",
} as const;
