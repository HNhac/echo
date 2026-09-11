export type CartLine = {
  slug: string;
  qty: number;
  size: string;
  color: string;
};

export const CART_STORAGE_KEY = "echo-cart";

export function parseCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(
      (row): row is CartLine =>
        row &&
        typeof row.slug === "string" &&
        typeof row.qty === "number" &&
        typeof row.size === "string" &&
        typeof row.color === "string",
    );
  } catch {
    return [];
  }
}

export function lineKey(line: Pick<CartLine, "slug" | "size" | "color">) {
  return `${line.slug}::${line.size}::${line.color}`;
}
