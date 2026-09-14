"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  hasPermission,
  DEFAULT_SHOP_SETTINGS,
  DEFAULT_SHOP_STORY,
  normalizeShopSettings,
  normalizeShopStory,
  ROLE_PRESETS,
  SEASON_THEMES,
  suggestProductSeo,
  type Banner,
  type Category,
  type Order,
  type OrderStatus,
  type Permission,
  type Product,
  type SeasonFx,
  type SeasonThemeId,
  type SeoPage,
  type ShopSettings,
  type ShopStory,
  type StaffPublic,
} from "@echo/shared";
import { LoginScreen } from "@/components/login-screen";
import { OrdersView } from "@/components/orders-view";
import { OverviewView } from "@/components/overview-view";
import { BannersView, type BannerDraft } from "@/components/banners-view";
import { ProductsView, type ProductDraft } from "@/components/products-view";
import { UsersView, type UserDraft } from "@/components/users-view";
import { SeoView } from "@/components/seo-view";
import { HostStatsView } from "@/components/host-stats-view";
import { BrandLogo } from "@/components/brand-logo";
import { StudioSkeleton, TabSkeleton } from "@/components/skeletons";
import { SettingsView } from "@/components/settings-view";
import { StoryView } from "@/components/story-view";
import { StudioBar } from "@/components/studio-bar";
import { ToastStack, useToasts } from "@/components/toast";
import { IconBag, IconBanner, IconHanger, IconHome, IconPeople, IconSeo, IconServer, IconSettings, IconStory } from "@/components/icons";
import { API, KEY_STORAGE, adminHeaders } from "@/lib/api";
import { digitsOnly, money, slugify } from "@/lib/format";
import {
  SETTINGS_PANES,
  STUDIO_PATHS,
  STUDIO_TITLES,
  settingsPaneFromPath,
  tabAllowed,
  tabFromPath,
  type Tab,
} from "@/lib/studio";

const emptyProduct: ProductDraft = {
  name: "",
  slug: "",
  price: "",
  salePrice: "",
  saleKind: "amount",
  categorySlug: "",
  image: "",
  images: [],
  description: "",
  featured: true,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  sizes: [],
  colors: [],
  stock: "",
};

function blankProduct(cats: Category[]): ProductDraft {
  return { ...emptyProduct, categorySlug: cats[0]?.slug ?? "" };
}

function productToDraft(p: Product): ProductDraft {
  return {
    name: p.name,
    slug: p.slug,
    price: p.price ? String(p.price) : "",
    saleKind: p.saleKind === "percent" ? "percent" : "amount",
    salePrice:
      p.saleKind === "percent"
        ? p.flashPct
          ? String(p.flashPct)
          : ""
        : p.salePrice
          ? String(p.salePrice)
          : "",
    categorySlug: p.categorySlug,
    image: p.image,
    images: p.images?.length ? p.images : p.image ? [p.image] : [],
    description: p.description || p.detail || "",
    featured: Boolean(p.featured),
    seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "",
    seoKeywords: p.seoKeywords ?? "",
    sizes: p.sizes ?? [],
    colors: p.colors ?? [],
    stock: typeof p.stock === "number" ? String(p.stock) : "",
  };
}

const emptyUser: UserDraft = {
  name: "",
  username: "",
  password: "",
  role: "ops",
  permissions: [...ROLE_PRESETS.ops],
};

const emptyBanner: BannerDraft = {
  image: "",
  title: "",
  subtitle: "",
  href: "/san-pham",
  active: true,
};

const emptyReady = (): Record<Tab, boolean> => ({
  overview: false,
  orders: false,
  products: false,
  banners: false,
  settings: false,
  story: false,
  seo: false,
  host: false,
  users: false,
});

export function StudioApp() {
  const [hydrated, setHydrated] = useState(false);
  const [key, setKey] = useState("");
  const [me, setMe] = useState<StaffPublic | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const tab = tabFromPath(pathname);
  const settingsPane = settingsPaneFromPath(pathname);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState<Record<Tab, boolean>>(emptyReady);
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<StaffPublic[]>([]);
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState(emptyBanner);
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [shopSettings, setShopSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);
  const [shopStory, setShopStory] = useState<ShopStory>(DEFAULT_SHOP_STORY);
  const [orderFilter, setOrderFilter] = useState<"all" | OrderStatus>("all");
  const [query, setQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [userOpen, setUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffPublic | null>(null);
  const [userForm, setUserForm] = useState(emptyUser);
  const toasts = useToasts();

  const authed = Boolean(key && me);
  const can = (perm: Permission) => (me ? hasPermission(me, perm) : false);

  const session = useCallback(async (adminKey: string) => {
    try {
      const meRes = await fetch(`${API}/admin/me`, {
        cache: "no-store",
        headers: { "x-admin-key": adminKey },
      });
      if (meRes.status === 401) {
        localStorage.removeItem(KEY_STORAGE);
        setKey("");
        setMe(null);
        setError("Phiên đăng nhập hết hạn. Đăng nhập lại.");
        return;
      }
      const profile = (await meRes.json()) as StaffPublic;
      setMe(profile);
      setError("");
    } catch {
      setError("Không kết nối được API. Chạy npm run dev từ thư mục gốc.");
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(KEY_STORAGE);
    if (!saved) {
      setHydrated(true);
      return;
    }
    setKey(saved);
    void session(saved).finally(() => setHydrated(true));
  }, [session]);

  useEffect(() => {
    if (!key || !me) return;
    if (!tabAllowed(me, tab)) {
      router.replace(STUDIO_PATHS.overview);
      return;
    }
    const user = me;
    let alive = true;

    async function loadTab() {
      const first = !ready[tab];
      try {
        if (tab === "overview") {
          const jobs: Promise<void>[] = [];
          if (hasPermission(user, "orders")) {
            jobs.push(
              fetch(`${API}/orders`, { cache: "no-store", headers: { "x-admin-key": key } })
                .then((res) => res.json())
                .then((data) => {
                  if (!alive) return;
                  if (Array.isArray(data)) {
                    setOrders(data);
                    setReady((cur) => ({ ...cur, orders: true }));
                  }
                }),
            );
          }
          if (hasPermission(user, "products")) {
            jobs.push(
              Promise.all([
                fetch(`${API}/products`, { cache: "no-store" }).then((res) => res.json()),
                fetch(`${API}/categories`, { cache: "no-store" }).then((res) => res.json()),
                fetch(`${API}/pages`, { cache: "no-store" }).then((res) => res.json()),
                fetch(`${API}/banners`, { cache: "no-store", headers: { "x-admin-key": key } }).then((res) =>
                  res.json(),
                ),
              ]).then(([data, catData, pageData, bannerData]) => {
                if (!alive) return;
                if (Array.isArray(catData)) {
                  setCats(catData);
                  setForm((cur) => ({ ...cur, categorySlug: cur.categorySlug || catData[0]?.slug || "" }));
                }
                if (Array.isArray(data)) {
                  setProducts(data);
                  setReady((cur) => ({ ...cur, products: true }));
                }
                if (Array.isArray(pageData)) {
                  setPages(pageData);
                  setReady((cur) => ({ ...cur, seo: true }));
                }
                if (Array.isArray(bannerData)) {
                  setBanners(bannerData);
                  setReady((cur) => ({ ...cur, banners: true }));
                }
              }),
            );
          }
          if (hasPermission(user, "users")) {
            jobs.push(
              fetch(`${API}/admin/users`, { cache: "no-store", headers: { "x-admin-key": key } })
                .then((res) => res.json())
                .then((data) => {
                  if (!alive) return;
                  if (Array.isArray(data)) {
                    setUsers(data);
                    setReady((cur) => ({ ...cur, users: true }));
                  }
                }),
            );
          }
          await Promise.all(jobs);
          if (alive) setReady((cur) => ({ ...cur, overview: true }));
        } else if (tab === "orders") {
          const res = await fetch(`${API}/orders`, {
            cache: "no-store",
            headers: { "x-admin-key": key },
          });
          const data = await res.json();
          if (!alive) return;
          if (Array.isArray(data)) {
            setOrders(data);
            setReady((cur) => ({ ...cur, orders: true }));
          } else if (first) setError("Không đọc được đơn — kiểm tra API cổng 4000.");
        } else if (tab === "products") {
          const [prodRes, catRes] = await Promise.all([
            fetch(`${API}/products`, { cache: "no-store" }),
            fetch(`${API}/categories`, { cache: "no-store" }),
          ]);
          const data = await prodRes.json();
          const catData = await catRes.json();
          if (!alive) return;
          if (Array.isArray(catData)) {
            setCats(catData);
            setForm((cur) => ({ ...cur, categorySlug: cur.categorySlug || catData[0]?.slug || "" }));
          }
          if (Array.isArray(data)) {
            setProducts(data);
            setReady((cur) => ({ ...cur, products: true }));
          } else if (first) setError("Không đọc được sản phẩm.");
        } else if (tab === "banners") {
          const [res, setRes] = await Promise.all([
            fetch(`${API}/banners`, {
              cache: "no-store",
              headers: { "x-admin-key": key },
            }),
            fetch(`${API}/settings`, { cache: "no-store" }),
          ]);
          const data = await res.json();
          const settings = await setRes.json();
          if (!alive) return;
          if (settings && typeof settings.bannerEnabled === "boolean") {
            setBannerEnabled(settings.bannerEnabled);
          }
          if (settings && typeof settings === "object") setShopSettings(normalizeShopSettings(settings));
          if (Array.isArray(data)) {
            setBanners(data);
            setReady((cur) => ({ ...cur, banners: true }));
          } else if (first) setError("Không đọc được banner.");
        } else if (tab === "settings") {
          const setRes = await fetch(`${API}/settings`, { cache: "no-store" });
          const settings = await setRes.json();
          if (!alive) return;
          if (settings && typeof settings.bannerEnabled === "boolean") {
            setBannerEnabled(settings.bannerEnabled);
          }
          if (settings && typeof settings === "object") setShopSettings(normalizeShopSettings(settings));
          setReady((cur) => ({ ...cur, settings: true }));
        } else if (tab === "story") {
          const res = await fetch(`${API}/story`, { cache: "no-store" });
          const data = await res.json();
          if (!alive) return;
          if (data && typeof data === "object") {
            setShopStory(normalizeShopStory(data));
            setReady((cur) => ({ ...cur, story: true }));
          } else if (first) setError("Không đọc được câu chuyện.");
        } else if (tab === "seo") {
          const res = await fetch(`${API}/pages`, { cache: "no-store" });
          const data = await res.json();
          if (!alive) return;
          if (Array.isArray(data)) {
            setPages(data);
            setReady((cur) => ({ ...cur, seo: true }));
          } else if (first) setError("Không đọc được SEO trang.");
        } else if (tab === "host") {
          setReady((cur) => ({ ...cur, host: true }));
        } else if (tab === "users") {
          const res = await fetch(`${API}/admin/users`, {
            cache: "no-store",
            headers: { "x-admin-key": key },
          });
          const data = await res.json();
          if (!alive) return;
          if (Array.isArray(data)) {
            setUsers(data);
            setReady((cur) => ({ ...cur, users: true }));
          } else if (first) setError("Không đọc được tài khoản.");
        }
      } catch {
        if (alive && first) setError("Không kết nối được API. Chạy npm run dev từ thư mục gốc.");
      }
    }

    void loadTab();
    return () => {
      alive = false;
    };
  }, [tab, key, me?.id]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Đăng nhập thất bại");
        return;
      }
      localStorage.setItem(KEY_STORAGE, data.key);
      setKey(data.key);
      setMe(data.user);
      if (!tabAllowed(data.user, tabFromPath(pathname))) {
        router.replace(STUDIO_PATHS.overview);
      }
    } catch {
      setError("Không kết nối được API. Chạy npm run dev từ thư mục gốc.");
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem(KEY_STORAGE);
    setKey("");
    setMe(null);
    setUsername("");
    setPassword("");
    setUsers([]);
    setOrders([]);
    setProducts([]);
    setCats([]);
    setPages([]);
    setBanners([]);
    setBannerOpen(false);
    setEditingBannerId(null);
    setDrawer(false);
    setEditingId(null);
    setReady(emptyReady());
    router.replace(STUDIO_PATHS.overview);
  }

  async function uploadProductImage(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API}/admin/uploads`, {
      method: "POST",
      headers: { "x-admin-key": key },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.error ?? "Không tải được ảnh";
      toasts.err(msg);
      throw new Error(msg);
    }
    return data.url as string;
  }

  async function reloadProducts() {
    const res = await fetch(`${API}/products`, { cache: "no-store" });
    const data = await res.json();
    if (Array.isArray(data)) setProducts(data);
  }

  async function reloadCategories() {
    const res = await fetch(`${API}/categories`, { cache: "no-store" });
    const data = await res.json();
    if (Array.isArray(data)) {
      setCats(data);
      setForm((cur) => ({
        ...cur,
        categorySlug: data.some((c: Category) => c.slug === cur.categorySlug)
          ? cur.categorySlug
          : data[0]?.slug ?? "",
      }));
    }
  }

  async function createCategory(draft: { name: string; description: string }) {
    const res = await fetch(`${API}/categories`, {
      method: "POST",
      headers: adminHeaders(key),
      body: JSON.stringify(draft),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.error ?? "Không tạo được nhóm";
      toasts.err(msg);
      throw new Error(msg);
    }
    await Promise.all([reloadCategories(), reloadProducts()]);
    toasts.ok(`Đã thêm nhóm “${draft.name}”.`);
  }

  async function updateCategory(slug: string, draft: { name: string; description: string }) {
    const res = await fetch(`${API}/categories/${encodeURIComponent(slug)}`, {
      method: "PUT",
      headers: adminHeaders(key),
      body: JSON.stringify(draft),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.error ?? "Không sửa được nhóm";
      toasts.err(msg);
      throw new Error(msg);
    }
    await Promise.all([reloadCategories(), reloadProducts()]);
    toasts.ok(`Đã sửa nhóm “${draft.name}”.`);
  }

  async function deleteCategory(slug: string) {
    const res = await fetch(`${API}/categories/${encodeURIComponent(slug)}`, {
      method: "DELETE",
      headers: adminHeaders(key),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.error ?? "Không xóa được nhóm";
      toasts.err(msg);
      throw new Error(msg);
    }
    await reloadCategories();
    toasts.ok("Đã xóa nhóm.");
  }

  async function toggleBannerEnabled(next: boolean) {
    const prev = bannerEnabled;
    setBannerEnabled(next);
    try {
      const res = await fetch(`${API}/settings`, {
        method: "PUT",
        headers: adminHeaders(key),
        body: JSON.stringify({ bannerEnabled: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBannerEnabled(prev);
        const msg = data.error ?? "Không đổi được banner";
        setError(msg);
        toasts.err(msg);
        return;
      }
      if (typeof data.bannerEnabled === "boolean") setBannerEnabled(data.bannerEnabled);
      toasts.ok(next ? "Đã bật banner trên shop." : "Đã tắt banner trên shop.");
    } catch {
      setBannerEnabled(prev);
      const msg = "Không đổi được banner — API không phản hồi.";
      setError(msg);
      toasts.err(msg);
    }
  }

  async function saveShopDisplay(next: {
    seasonTheme: SeasonThemeId;
    seasonFx: SeasonFx;
    seasonOverlays?: ShopSettings["seasonOverlays"];
    seasonOverlayShared?: string;
    announcementEnabled?: boolean;
    footerNotesEnabled?: boolean;
    notices?: ShopSettings["notices"];
  }) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${API}/settings`, {
        method: "PUT",
        headers: adminHeaders(key),
        body: JSON.stringify(next),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "Không lưu được cài đặt";
        setError(msg);
        toasts.err(msg);
        return false;
      }
      const saved = normalizeShopSettings({ ...shopSettings, ...data });
      setShopSettings(saved);
      const themeChanged = saved.seasonTheme !== shopSettings.seasonTheme;
      const themeName = SEASON_THEMES.find((item) => item.id === saved.seasonTheme)?.name ?? "Mặc định";
      toasts.ok(
        themeChanged
          ? `Đã lưu theme ${themeName}. Mở lại shop để thấy màu mới.`
          : "Đã lưu header / footer shop. Mở lại shop để thấy.",
      );
      return true;
    } catch {
      const msg = "Không lưu được cài đặt — API không phản hồi.";
      setError(msg);
      toasts.err(msg);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function saveShopStory(next: ShopStory) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${API}/story`, {
        method: "PUT",
        headers: adminHeaders(key),
        body: JSON.stringify(next),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "Không lưu được câu chuyện";
        setError(msg);
        toasts.err(msg);
        return false;
      }
      setShopStory(normalizeShopStory(data));
      toasts.ok("Đã lưu câu chuyện. Mở lại trang shop /cau-chuyen để xem.");
      return true;
    } catch {
      const msg = "Không lưu được câu chuyện — API không phản hồi.";
      setError(msg);
      toasts.err(msg);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function reloadBanners() {
    const res = await fetch(`${API}/banners`, { cache: "no-store", headers: { "x-admin-key": key } });
    const data = await res.json();
    if (Array.isArray(data)) setBanners(data);
  }

  function openCreateBanner() {
    setEditingBannerId(null);
    setBannerForm(emptyBanner);
    setBannerOpen(true);
  }

  function openEditBanner(banner: Banner) {
    setEditingBannerId(banner.id);
    setBannerForm({
      image: banner.image,
      title: banner.title,
      subtitle: banner.subtitle ?? "",
      href: banner.href,
      active: banner.active,
    });
    setBannerOpen(true);
  }

  function closeBanner() {
    setBannerOpen(false);
    setEditingBannerId(null);
    setBannerForm(emptyBanner);
  }

  async function saveBanner(e: React.FormEvent) {
    e.preventDefault();
    if (!bannerForm.image.startsWith("/uploads/")) {
      const msg = "Tải ảnh banner riêng — không dùng ảnh sản phẩm.";
      setError(msg);
      toasts.err(msg);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(editingBannerId ? `${API}/banners/${editingBannerId}` : `${API}/banners`, {
        method: editingBannerId ? "PUT" : "POST",
        headers: adminHeaders(key),
        body: JSON.stringify(bannerForm),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "Không lưu được banner";
        setError(msg);
        toasts.err(msg);
        return;
      }
      closeBanner();
      await reloadBanners();
      toasts.ok(editingBannerId ? "Đã sửa banner." : "Đã thêm banner.");
    } catch {
      const msg = "Không lưu được banner — API không phản hồi.";
      setError(msg);
      toasts.err(msg);
    } finally {
      setBusy(false);
    }
  }

  async function removeBanner(banner: Banner) {
    if (!window.confirm(`Xóa slide “${banner.title}”?`)) return;
    try {
      const res = await fetch(`${API}/banners/${banner.id}`, {
        method: "DELETE",
        headers: adminHeaders(key),
      });
      if (!res.ok) {
        const msg = (await res.json()).error ?? "Không xóa được banner";
        setError(msg);
        toasts.err(msg);
        return;
      }
      await reloadBanners();
      toasts.ok(`Đã xóa banner “${banner.title}”.`);
    } catch {
      const msg = "Không xóa được banner — API không phản hồi.";
      setError(msg);
      toasts.err(msg);
    }
  }

  async function moveBanner(banner: Banner, dir: -1 | 1) {
    const i = banners.findIndex((item) => item.id === banner.id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= banners.length) return;
    const next = [...banners];
    const [item] = next.splice(i, 1);
    next.splice(j, 0, item);
    try {
      await Promise.all(
        next.map((row, sort) =>
          fetch(`${API}/banners/${row.id}`, {
            method: "PUT",
            headers: adminHeaders(key),
            body: JSON.stringify({ ...row, sort }),
          }),
        ),
      );
      await reloadBanners();
      toasts.ok("Đã đổi thứ tự banner.");
    } catch {
      const msg = "Không đổi thứ tự banner.";
      setError(msg);
      toasts.err(msg);
    }
  }

  async function reloadOrders() {
    const res = await fetch(`${API}/orders`, { cache: "no-store", headers: { "x-admin-key": key } });
    const data = await res.json();
    if (Array.isArray(data)) setOrders(data);
  }

  async function reloadUsers() {
    const res = await fetch(`${API}/admin/users`, { cache: "no-store", headers: { "x-admin-key": key } });
    const data = await res.json();
    if (Array.isArray(data)) setUsers(data);
  }

  function openCreateProduct() {
    setEditingId(null);
    setForm(blankProduct(cats));
    setError("");
    setDrawer(true);
  }

  function openEditProduct(product: Product) {
    setEditingId(product.id);
    setForm(productToDraft(product));
    setError("");
    setDrawer(true);
  }

  function closeProduct() {
    setDrawer(false);
    setEditingId(null);
    setForm(blankProduct(cats));
    setError("");
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    const cat = cats.find((c) => c.slug === form.categorySlug);
    if (!cat) {
      const msg = "Chọn nhóm sản phẩm — hoặc thêm nhóm mới.";
      setError(msg);
      toasts.err(msg);
      return;
    }
    const price = Number(digitsOnly(form.price));
    const saleRaw = Number(digitsOnly(form.salePrice));
    const saleKind = form.saleKind === "percent" ? "percent" : "amount";
    const photos = form.images.filter((src) => src.startsWith("/uploads/"));
    if (!photos.length) {
      const msg = "Tải ít nhất một ảnh sản phẩm.";
      setError(msg);
      toasts.err(msg);
      return;
    }
    if (!price || Number.isNaN(price) || price <= 0) {
      const msg = "Nhập giá sản phẩm.";
      setError(msg);
      toasts.err(msg);
      return;
    }
    if (form.salePrice.trim()) {
      if (saleKind === "percent") {
        if (Number.isNaN(saleRaw) || saleRaw < 1 || saleRaw > 99) {
          const msg = "Sale phần trăm từ 1 đến 99.";
          setError(msg);
          toasts.err(msg);
          return;
        }
      } else if (Number.isNaN(saleRaw) || saleRaw <= 0 || saleRaw >= price) {
        const msg = "Giá sale phải nhỏ hơn giá gốc.";
        setError(msg);
        toasts.err(msg);
        return;
      }
    }
    const sizes = (form.sizes ?? []).map((s) => s.trim()).filter(Boolean);
    const colors = (form.colors ?? []).map((c) => c.trim()).filter(Boolean);
    if (!sizes.length || !colors.length) {
      const msg = "Chọn ít nhất một size và một màu.";
      setError(msg);
      toasts.err(msg);
      return;
    }
    const stockRaw = digitsOnly(form.stock);
    const stock = stockRaw ? Number(stockRaw) : undefined;
    const seo = suggestProductSeo({
      name: form.name,
      category: cat.name,
      colors,
      sizes,
      description: form.description,
    });
    const body: Product = {
      id: editingId ?? String(Date.now()),
      slug: form.slug.trim() || seo.slug || slugify(form.name),
      name: form.name,
      category: cat.name,
      categorySlug: form.categorySlug,
      price,
      saleKind: form.salePrice.trim() ? saleKind : undefined,
      salePrice: saleKind === "amount" && saleRaw > 0 ? saleRaw : undefined,
      flashPct: saleKind === "percent" && saleRaw > 0 ? saleRaw : undefined,
      priceFmt: "",
      image: photos[0] ?? "",
      images: photos,
      description: form.description,
      detail: form.description,
      sizes,
      colors,
      stock,
      featured: form.featured,
      seoTitle: form.seoTitle.trim() || seo.seoTitle || undefined,
      seoDescription: form.seoDescription.trim() || seo.seoDescription || undefined,
      seoKeywords: form.seoKeywords.trim() || seo.seoKeywords || undefined,
    };
    setBusy(true);
    setError("");
    try {
      const res = await fetch(editingId ? `${API}/products/${editingId}` : `${API}/products`, {
        method: editingId ? "PUT" : "POST",
        headers: adminHeaders(key),
        body: JSON.stringify({
          ...body,
          stock: stock ?? null,
          saleKind: form.salePrice.trim() ? saleKind : null,
          salePrice: saleKind === "amount" && saleRaw > 0 ? saleRaw : null,
          flashPct: saleKind === "percent" && saleRaw > 0 ? saleRaw : null,
        }),
      });
      if (!res.ok) {
        const msg = (await res.json()).error ?? "Không lưu được";
        setError(msg);
        toasts.err(msg);
        return;
      }
      closeProduct();
      await reloadProducts();
      toasts.ok(editingId ? `Đã sửa “${form.name}”.` : `Đã thêm “${form.name}”.`);
    } catch {
      const msg = "Không lưu được sản phẩm — API không phản hồi.";
      setError(msg);
      toasts.err(msg);
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id: string, status: OrderStatus) {
    try {
      const res = await fetch(`${API}/orders/${id}`, {
        method: "PATCH",
        headers: adminHeaders(key),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const msg = (await res.json()).error ?? "Không cập nhật được đơn";
        setError(msg);
        toasts.err(msg);
        return;
      }
      await reloadOrders();
      toasts.ok("Đã cập nhật trạng thái đơn.");
    } catch {
      const msg = "Không cập nhật được đơn — API không phản hồi.";
      setError(msg);
      toasts.err(msg);
    }
  }

  async function removeProduct(id: string, name: string) {
    if (!window.confirm(`Xóa “${name}” khỏi catalog?`)) return;
    try {
      const res = await fetch(`${API}/products/${id}`, {
        method: "DELETE",
        headers: adminHeaders(key),
      });
      if (!res.ok) {
        const msg = (await res.json()).error ?? "Không xóa được";
        setError(msg);
        toasts.err(msg);
        return;
      }
      await reloadProducts();
      toasts.ok(`Đã xóa “${name}”.`);
    } catch {
      const msg = "Không xóa được sản phẩm — API không phản hồi.";
      setError(msg);
      toasts.err(msg);
    }
  }

  async function saveSeoPage(id: string, patch: Pick<SeoPage, "title" | "description" | "keywords">) {
    const res = await fetch(`${API}/pages/${id}`, {
      method: "PUT",
      headers: adminHeaders(key),
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.error ?? "Không lưu được SEO";
      toasts.err(msg);
      throw new Error(msg);
    }
    setPages((cur) => cur.map((page) => (page.id === id ? (data as SeoPage) : page)));
    toasts.ok("Đã lưu SEO trang.");
  }

  function openCreateUser() {
    setEditingUser(null);
    setUserForm(emptyUser);
    setUserOpen(true);
  }

  function openEditUser(user: StaffPublic) {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      username: user.username,
      password: "",
      role: user.role,
      permissions: [...user.permissions],
    });
    setUserOpen(true);
  }

  async function saveUser(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = editingUser
        ? await fetch(`${API}/admin/users/${editingUser.id}`, {
            method: "PATCH",
            headers: adminHeaders(key),
            body: JSON.stringify({
              name: userForm.name,
              role: userForm.role,
              permissions: userForm.permissions,
              ...(userForm.password ? { password: userForm.password } : {}),
            }),
          })
        : await fetch(`${API}/admin/users`, {
            method: "POST",
            headers: adminHeaders(key),
            body: JSON.stringify(userForm),
          });
      if (!res.ok) {
        const msg = (await res.json()).error ?? "Không lưu được tài khoản";
        setError(msg);
        toasts.err(msg);
        return;
      }
      setUserOpen(false);
      setEditingUser(null);
      setUserForm(emptyUser);
      await reloadUsers();
      toasts.ok(editingUser ? `Đã sửa tài khoản “${userForm.username}”.` : `Đã thêm tài khoản “${userForm.username}”.`);
    } catch {
      const msg = "Không lưu được tài khoản — API không phản hồi.";
      setError(msg);
      toasts.err(msg);
    } finally {
      setBusy(false);
    }
  }

  async function removeUser(user: StaffPublic) {
    if (!window.confirm(`Xóa tài khoản “${user.username}”?`)) return;
    try {
      const res = await fetch(`${API}/admin/users/${user.id}`, {
        method: "DELETE",
        headers: adminHeaders(key),
      });
      if (!res.ok) {
        const msg = (await res.json()).error ?? "Không xóa được";
        setError(msg);
        toasts.err(msg);
        return;
      }
      await reloadUsers();
      toasts.ok(`Đã xóa tài khoản “${user.username}”.`);
    } catch {
      const msg = "Không xóa được tài khoản — API không phản hồi.";
      setError(msg);
      toasts.err(msg);
    }
  }

  const stats = useMemo(() => {
    if (!me) return [];
    if (tab === "orders" && hasPermission(me, "orders")) {
      return [
        { label: "Đơn mới", value: String(orders.filter((o) => o.status === "new").length) },
        {
          label: "Đang xử lý",
          value: String(orders.filter((o) => o.status === "confirmed" || o.status === "shipped").length),
        },
        {
          label: "Doanh thu xong",
          value: money(orders.filter((o) => o.status === "done").reduce((s, o) => s + o.total, 0)),
        },
      ];
    }
    if (tab === "seo" && hasPermission(me, "products")) {
      return [{ label: "Trang SEO", value: String(pages.length) }];
    }
    if (tab === "users" && hasPermission(me, "users")) {
      return [
        { label: "Tài khoản", value: String(users.length) },
        { label: "Chủ studio", value: String(users.filter((u) => u.role === "owner").length) },
        { label: "Nhân sự", value: String(users.filter((u) => u.role !== "owner").length) },
      ];
    }
    return [];
  }, [me, tab, orders, products.length, cats.length, pages.length, users.length]);

  const titles = STUDIO_TITLES;

  if (!hydrated) return <StudioSkeleton />;

  if (!authed || !me) {
    return (
      <>
        <LoginScreen
          username={username}
          password={password}
          error={error}
          busy={busy}
          onUsername={setUsername}
          onPassword={setPassword}
          onSubmit={login}
        />
        <ToastStack items={toasts.items} onDismiss={toasts.dismiss} />
      </>
    );
  }

  return (
    <div className="studio">
      <ToastStack items={toasts.items} onDismiss={toasts.dismiss} />
      <aside className="rail">
        <Link href={STUDIO_PATHS.overview} className="brand">
          <BrandLogo />
          <span className="brand__logo">
            ECHO<span>Studio</span>
          </span>
        </Link>
        <nav className="nav">
          <Link href={STUDIO_PATHS.overview} className={tab === "overview" ? "is-on" : ""}>
            <IconHome /> Tổng quan
          </Link>
          {can("orders") ? (
            <Link href={STUDIO_PATHS.orders} className={tab === "orders" ? "is-on" : ""}>
              <IconBag /> Đơn hàng
            </Link>
          ) : null}
          {can("products") ? (
            <Link href={STUDIO_PATHS.products} className={tab === "products" ? "is-on" : ""}>
              <IconHanger /> Sản phẩm
            </Link>
          ) : null}
          {can("products") ? (
            <Link href={STUDIO_PATHS.banners} className={tab === "banners" ? "is-on" : ""}>
              <IconBanner /> Banner
            </Link>
          ) : null}
          {can("products") ? (
            <Link href={STUDIO_PATHS.settings} className={tab === "settings" ? "is-on" : ""}>
              <IconSettings /> Cài đặt
            </Link>
          ) : null}
          {can("products") ? (
            <Link href={STUDIO_PATHS.story} className={tab === "story" ? "is-on" : ""}>
              <IconStory /> Câu chuyện
            </Link>
          ) : null}
          {can("products") ? (
            <Link href={STUDIO_PATHS.seo} className={tab === "seo" ? "is-on" : ""}>
              <IconSeo /> SEO trang
            </Link>
          ) : null}
          {me?.role === "owner" ? (
            <Link href={STUDIO_PATHS.host} className={tab === "host" ? "is-on" : ""}>
              <IconServer /> Máy chủ
            </Link>
          ) : null}
          {can("users") ? (
            <Link href={STUDIO_PATHS.users} className={tab === "users" ? "is-on" : ""}>
              <IconPeople /> Tài khoản
            </Link>
          ) : null}
        </nav>
      </aside>

      <main className="canvas">
        <header className="canvas__head">
          <div>
            <p className="eyebrow">{tab === "settings" ? "Cài đặt" : titles[tab].eye}</p>
            <h1>
              {tab === "settings"
                ? (SETTINGS_PANES.find((item) => item.id === settingsPane)?.title ?? "Cài đặt")
                : titles[tab].title}
            </h1>
          </div>
          <StudioBar me={me} onLogout={logout} />
        </header>

        {tab !== "overview" && ready[tab] && stats.length ? (
          <section className="stats">
            {stats.map((s) => (
              <article key={s.label} className="stat">
                <span className="muted tiny">{s.label}</span>
                <b>{s.value}</b>
              </article>
            ))}
          </section>
        ) : null}

        {error && !(tab === "products" && drawer) ? <p className="alert">{error}</p> : null}

        {tab === "overview" ? (
          ready.overview ? (
            <OverviewView
              orders={orders}
              products={products}
              categories={cats}
              users={users}
              pages={pages}
              banners={banners}
              canOrders={can("orders")}
              canProducts={can("products")}
              canUsers={can("users")}
            />
          ) : (
            <TabSkeleton kind="overview" />
          )
        ) : null}
        {tab === "orders" && can("orders") ? (
          ready.orders ? (
            <OrdersView orders={orders} filter={orderFilter} onFilter={setOrderFilter} onStatus={setStatus} />
          ) : (
            <TabSkeleton kind="orders" />
          )
        ) : null}
        {tab === "products" && can("products") ? (
          ready.products ? (
            <ProductsView
              products={products}
              categories={cats}
              error={error}
              query={query}
              onQuery={setQuery}
              open={drawer}
              editing={Boolean(editingId)}
              onCreate={openCreateProduct}
              onEdit={openEditProduct}
              onClose={closeProduct}
              form={form}
              onForm={setForm}
              onSave={addProduct}
              onDelete={removeProduct}
              onUpload={uploadProductImage}
              onCreateCategory={createCategory}
              onUpdateCategory={updateCategory}
              onDeleteCategory={deleteCategory}
              busy={busy}
            />
          ) : (
            <TabSkeleton kind="products" />
          )
        ) : null}
        {tab === "banners" && can("products") ? (
          ready.banners ? (
            <BannersView
              banners={banners}
              enabled={bannerEnabled}
              onEnabled={toggleBannerEnabled}
              open={bannerOpen}
              editing={Boolean(editingBannerId)}
              form={bannerForm}
              onForm={setBannerForm}
              onCreate={openCreateBanner}
              onEdit={openEditBanner}
              onClose={closeBanner}
              onSave={saveBanner}
              onDelete={removeBanner}
              onMove={moveBanner}
              onUpload={uploadProductImage}
              busy={busy}
            />
          ) : (
            <TabSkeleton kind="banners" />
          )
        ) : null}
        {tab === "settings" && can("products") ? (
          ready.settings ? (
            <SettingsView
              pane={settingsPane}
              settings={shopSettings}
              busy={busy}
              onSave={saveShopDisplay}
              onUpload={uploadProductImage}
            />
          ) : (
            <TabSkeleton kind="settings" />
          )
        ) : null}
        {tab === "story" && can("products") ? (
          ready.story ? (
            <StoryView story={shopStory} busy={busy} onSave={saveShopStory} />
          ) : (
            <TabSkeleton kind="story" />
          )
        ) : null}
        {tab === "seo" && can("products") ? (
          ready.seo ? (
            <SeoView pages={pages} busy={busy} onSave={saveSeoPage} />
          ) : (
            <TabSkeleton kind="seo" />
          )
        ) : null}
        {tab === "host" && me?.role === "owner" ? (
          ready.host ? (
            <HostStatsView adminKey={key} />
          ) : (
            <TabSkeleton kind="host" />
          )
        ) : null}
        {tab === "users" && can("users") ? (
          ready.users ? (
            <UsersView
              users={users}
              meId={me.id}
              query={userQuery}
              onQuery={setUserQuery}
              open={userOpen}
              editing={editingUser}
              onOpenCreate={openCreateUser}
              onEdit={openEditUser}
              onClose={() => {
                setUserOpen(false);
                setEditingUser(null);
              }}
              form={userForm}
              onForm={setUserForm}
              onSave={saveUser}
              onDelete={removeUser}
              busy={busy}
            />
          ) : (
            <TabSkeleton kind="users" />
          )
        ) : null}
      </main>
    </div>
  );
}
