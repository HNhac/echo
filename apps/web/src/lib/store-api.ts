import type { CreateOrderInput, Order } from "@echo/shared";
import { products, type Product } from "@/data/catalog";

function isHttpUrl(value: string | undefined) {
  return Boolean(value && /^https?:\/\//i.test(value));
}

/** Browser uses NEXT_PUBLIC_API_URL (often `/echo-api`). SSR uses API_URL on the VPS loopback. */
export function getApiBase() {
  const pub = process.env.NEXT_PUBLIC_API_URL;
  const internal = process.env.API_URL;

  if (typeof window === "undefined") {
    if (internal) return internal.replace(/\/$/, "");
    if (isHttpUrl(pub)) return pub!.replace(/\/$/, "");
    return "http://127.0.0.1:4000";
  }

  if (pub) return pub.replace(/\/$/, "");
  return "/echo-api";
}

export const API_URL = getApiBase();

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${getApiBase()}/products`, { cache: "no-store" });
    if (!res.ok) throw new Error("api");
    const data = (await res.json()) as Product[];
    return Array.isArray(data) && data.length ? data : products;
  } catch {
    return products;
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
  const all = await fetchProducts();
  return all.find((p) => p.slug === slug);
}

export async function createOrder(payload: CreateOrderInput): Promise<Order> {
  const res = await fetch(`${getApiBase()}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Không đặt được hàng. Kiểm tra API đang chạy.");
  return data as Order;
}
