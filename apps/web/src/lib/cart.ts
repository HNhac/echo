export type CartLine = {
  slug: string;
  qty: number;
  size: string;
  color: string;
  voucher?: string;
};

export const CART_STORAGE_KEY = "echo-cart";
export const VOUCHER_STORAGE_KEY = "echo-voucher";
export const CHECKOUT_STORAGE_KEY = "echo-checkout";

export function parseCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (row): row is CartLine =>
          row &&
          typeof row.slug === "string" &&
          typeof row.qty === "number" &&
          typeof row.size === "string" &&
          typeof row.color === "string",
      )
      .map((row) => {
        const voucher = String(row.voucher ?? "")
          .trim()
          .toUpperCase();
        return voucher ? { ...row, voucher } : { slug: row.slug, qty: row.qty, size: row.size, color: row.color };
      });
  } catch {
    return [];
  }
}

export function lineKey(line: Pick<CartLine, "slug" | "size" | "color">) {
  return `${line.slug}::${line.size}::${line.color}`;
}

export function parseCheckoutKeys(raw: string | null, lines: CartLine[]): string[] {
  const valid = lines.map(lineKey);
  if (raw == null) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    const want = new Set(valid);
    return data.filter((key): key is string => typeof key === "string" && want.has(key));
  } catch {
    return [];
  }
}
