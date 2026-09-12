import type { OrderStatus } from "@echo/shared";

export function money(n: number) {
  return `${new Intl.NumberFormat("vi-VN").format(n)}₫`;
}

export function digitsOnly(value: string | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

export function formatVndInput(value: string | undefined) {
  const digits = digitsOnly(value);
  if (!digits) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(digits));
}

export function when(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const STATUS: Record<
  OrderStatus,
  { label: string; tone: "pink" | "gold" | "sky" | "sage" }
> = {
  new: { label: "Mới", tone: "pink" },
  confirmed: { label: "Đã xác nhận", tone: "gold" },
  shipped: { label: "Đang giao", tone: "sky" },
  done: { label: "Hoàn tất", tone: "sage" },
};
