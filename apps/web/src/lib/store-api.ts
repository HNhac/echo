import type {
  Category,
  CreateOrderInput,
  CustomerProfileInput,
  CustomerPublic,
  HomeCatalog,
  Order,
  Product,
  SeoPage,
  ShopSettings,
  ShopStory,
} from "@echo/shared";
import { normalizeShopSettings, normalizeShopStory } from "@echo/shared";

function isHttpUrl(value: string | undefined) {
  return Boolean(value && /^https?:\/\//i.test(value));
}

export function getApiBase() {
  if (typeof window !== "undefined") return "/echo-api";

  const internal = process.env.API_URL;
  if (internal) return internal.replace(/\/$/, "");
  const pub = process.env.NEXT_PUBLIC_API_URL;
  if (isHttpUrl(pub)) return pub!.replace(/\/$/, "");
  return "http://127.0.0.1:4000";
}

const noStore = { cache: "no-store" as RequestCache, headers: { "Cache-Control": "no-store" } };

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${getApiBase()}${path}`, noStore);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchShopSettings(): Promise<ShopSettings> {
  return normalizeShopSettings(await getJson<ShopSettings>("/settings"));
}

export async function fetchShopStory(): Promise<ShopStory> {
  return normalizeShopStory(await getJson<ShopStory>("/story"));
}

export async function fetchHomeCatalog(): Promise<HomeCatalog> {
  const data = await getJson<HomeCatalog>("/catalog/home");
  return (
    data ?? {
      featured: [],
      flash: [],
      picks: [],
      looks: [],
      categories: [],
      banners: [],
    }
  );
}

export async function fetchCategories(): Promise<Category[]> {
  const data = await getJson<Category[]>("/categories");
  return Array.isArray(data) ? data : [];
}

export async function fetchProducts(params?: {
  category?: string;
  featured?: boolean;
  exclude?: string;
  limit?: number;
}): Promise<Product[]> {
  const q = new URLSearchParams();
  if (params?.category) q.set("category", params.category);
  if (params?.featured) q.set("featured", "1");
  if (params?.exclude) q.set("exclude", params.exclude);
  if (params?.limit) q.set("limit", String(params.limit));
  const suffix = q.size ? `?${q.toString()}` : "";
  const data = await getJson<Product[]>(`/products${suffix}`);
  return Array.isArray(data) ? data : [];
}

export async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
  const data = await getJson<Product>(`/products/${encodeURIComponent(slug)}`);
  if (!data || !("slug" in data)) return undefined;
  return data;
}

export async function fetchSeoPage(id: string): Promise<SeoPage | null> {
  return getJson<SeoPage>(`/pages/${encodeURIComponent(id)}`);
}

export async function createOrder(payload: CreateOrderInput, customerKey?: string): Promise<Order> {
  const res = await fetch(`${getApiBase()}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(customerKey ? { "x-customer-key": customerKey } : {}),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Không đặt được hàng. Kiểm tra API đang chạy.");
  return data as Order;
}

type AuthResult = { ok: true; key: string; user: CustomerPublic };

async function postAuth(path: string, body: unknown): Promise<AuthResult> {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Không thực hiện được.");
  return data as AuthResult;
}

export function customerHeaders(key: string): HeadersInit {
  return { "Content-Type": "application/json", "x-customer-key": key };
}

export async function fetchGoogleAuthConfig() {
  return getJson<{ enabled: boolean; clientId?: string }>("/auth/google-config");
}

export function registerCustomer(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}) {
  return postAuth("/auth/register", input);
}

export function loginCustomer(email: string, password: string) {
  return postAuth("/auth/login", { email, password });
}

export function loginCustomerGoogle(payload: { idToken?: string; accessToken?: string }) {
  return postAuth("/auth/google", payload);
}

export async function fetchCustomerMe(key: string): Promise<CustomerPublic | null> {
  try {
    const res = await fetch(`${getApiBase()}/auth/me`, {
      cache: "no-store",
      headers: { "x-customer-key": key },
    });
    if (!res.ok) return null;
    return (await res.json()) as CustomerPublic;
  } catch {
    return null;
  }
}

export async function saveCustomerProfile(key: string, input: CustomerProfileInput): Promise<CustomerPublic> {
  const res = await fetch(`${getApiBase()}/auth/me`, {
    method: "PATCH",
    headers: customerHeaders(key),
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Không lưu được thông tin.");
  return data as CustomerPublic;
}

export async function fetchCustomerOrders(key: string): Promise<Order[]> {
  try {
    const res = await fetch(`${getApiBase()}/auth/orders`, {
      cache: "no-store",
      headers: { "x-customer-key": key },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
