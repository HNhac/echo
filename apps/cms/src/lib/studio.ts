import { hasPermission, type Permission, type StaffPublic } from "@echo/shared";

export const STUDIO_PATHS = {
  overview: "/",
  orders: "/don-hang",
  customers: "/khach-hang",
  products: "/san-pham",
  banners: "/banner",
  settings: "/cai-dat",
  story: "/cau-chuyen",
  seo: "/seo",
  host: "/may-chu",
  users: "/tai-khoan",
} as const;

export type Tab = keyof typeof STUDIO_PATHS;

export const STUDIO_TITLES: Record<Tab, { eye: string; title: string }> = {
  overview: { eye: "Studio", title: "Tổng quan" },
  orders: { eye: "Vận hành", title: "Đơn hàng" },
  customers: { eye: "Shop", title: "Khách hàng" },
  products: { eye: "Catalog", title: "Sản phẩm" },
  banners: { eye: "Shop", title: "Banner slide" },
  settings: { eye: "Shop", title: "Cài đặt" },
  story: { eye: "Shop", title: "Câu chuyện" },
  seo: { eye: "Google", title: "SEO trang" },
  host: { eye: "VPS", title: "Máy chủ" },
  users: { eye: "Studio", title: "Tài khoản" },
};

export const SETTINGS_PANES = [
  { id: "notices", href: "/cai-dat", title: "Thông báo", hint: "Header & footer" },
  { id: "shipping", href: "/cai-dat/giao-hang", title: "Giao hàng", hint: "Nội thành & freeship" },
  { id: "policies", href: "/cai-dat/chinh-sach", title: "Chính sách", hint: "Tab trang sản phẩm" },
  { id: "contact", href: "/cai-dat/lien-he", title: "Liên hệ & voucher", hint: "CSKH, Facebook, mã giảm" },
  { id: "theme", href: "/cai-dat/theme", title: "Theme & ảnh nền", hint: "Màu lễ, hoa sao" },
] as const;

export type SettingsPane = (typeof SETTINGS_PANES)[number]["id"];

export function settingsPaneFromPath(pathname: string): SettingsPane {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === "/cai-dat/theme" || clean === "/cai-dat/anh-nen") return "theme";
  if (clean === "/cai-dat/giao-hang") return "shipping";
  if (clean === "/cai-dat/chinh-sach") return "policies";
  if (clean === "/cai-dat/lien-he") return "contact";
  return "notices";
}

export function tabFromPath(pathname: string): Tab {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === STUDIO_PATHS.settings || clean.startsWith(`${STUDIO_PATHS.settings}/`)) {
    return "settings";
  }
  const found = (Object.entries(STUDIO_PATHS) as Array<[Tab, string]>).find(([, path]) => path === clean);
  return found?.[0] ?? "overview";
}

export function tabAllowed(user: StaffPublic, tab: Tab) {
  if (tab === "overview") return true;
  if (tab === "host") return user.role === "owner";
  if (tab === "customers") return hasPermission(user, "orders");
  if (tab === "seo" || tab === "banners" || tab === "settings" || tab === "story") {
    return hasPermission(user, "products");
  }
  return hasPermission(user, tab);
}

export const RAIL_STORAGE = "echo-cms-rail";

export type RailNeed = Permission | "owner";

export const RAIL_SECTIONS: Array<{
  label: string;
  items: Array<{ tab: Tab; label: string; need?: RailNeed }>;
}> = [
  {
    label: "Bán hàng",
    items: [
      { tab: "overview", label: "Tổng quan" },
      { tab: "orders", label: "Đơn hàng", need: "orders" },
      { tab: "customers", label: "Khách hàng", need: "orders" },
      { tab: "products", label: "Sản phẩm", need: "products" },
    ],
  },
  {
    label: "Shop",
    items: [
      { tab: "banners", label: "Banner", need: "products" },
      { tab: "story", label: "Câu chuyện", need: "products" },
      { tab: "seo", label: "SEO trang", need: "products" },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { tab: "users", label: "Tài khoản", need: "users" },
      { tab: "host", label: "Máy chủ", need: "owner" },
      { tab: "settings", label: "Cài đặt", need: "products" },
    ],
  },
];

export function railItemAllowed(user: StaffPublic, need?: RailNeed) {
  if (!need) return true;
  if (need === "owner") return user.role === "owner";
  return hasPermission(user, need);
}

