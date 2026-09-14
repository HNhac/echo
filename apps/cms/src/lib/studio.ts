import { hasPermission, type StaffPublic } from "@echo/shared";

export const STUDIO_PATHS = {
  overview: "/",
  orders: "/don-hang",
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
  { id: "theme", href: "/cai-dat/theme", title: "Theme & ảnh nền", hint: "Màu lễ, hoa sao" },
] as const;

export type SettingsPane = (typeof SETTINGS_PANES)[number]["id"];

export function settingsPaneFromPath(pathname: string): SettingsPane {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === "/cai-dat/theme" || clean === "/cai-dat/anh-nen") return "theme";
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
  if (tab === "seo" || tab === "banners" || tab === "settings" || tab === "story") {
    return hasPermission(user, "products");
  }
  return hasPermission(user, tab);
}

