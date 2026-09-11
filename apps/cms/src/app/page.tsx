"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  categories,
  hasPermission,
  ROLE_LABELS,
  ROLE_PRESETS,
  type Order,
  type OrderStatus,
  type Permission,
  type Product,
  type SeoPage,
  type StaffPublic,
} from "@echo/shared";
import { LoginScreen } from "@/components/login-screen";
import { OrdersView } from "@/components/orders-view";
import { ProductsView, type ProductDraft } from "@/components/products-view";
import { UsersView, type UserDraft } from "@/components/users-view";
import { SeoView } from "@/components/seo-view";
import { IconBag, IconHanger, IconLogout, IconPeople, IconSeo, IconSparkle } from "@/components/icons";
import { API, KEY_STORAGE, adminHeaders } from "@/lib/api";
import { money } from "@/lib/format";

type Tab = "orders" | "products" | "seo" | "users";

const emptyProduct: ProductDraft = {
  name: "",
  slug: "",
  price: "199000",
  categorySlug: "vay",
  image: "",
  images: [],
  description: "",
  featured: true,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
};

const emptyUser: UserDraft = {
  name: "",
  username: "",
  password: "",
  role: "ops",
  permissions: [...ROLE_PRESETS.ops],
};

function tabAllowed(user: StaffPublic, tab: Tab) {
  if (tab === "seo") return hasPermission(user, "products");
  return hasPermission(user, tab);
}

function firstTab(user: StaffPublic): Tab {
  if (hasPermission(user, "orders")) return "orders";
  if (hasPermission(user, "products")) return "products";
  return "users";
}

export default function CmsPage() {
  const [hydrated, setHydrated] = useState(false);
  const [key, setKey] = useState("");
  const [me, setMe] = useState<StaffPublic | null>(null);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<Tab>("orders");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState<Record<Tab, boolean>>({
    orders: false,
    products: false,
    seo: false,
    users: false,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<StaffPublic[]>([]);
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [orderFilter, setOrderFilter] = useState<"all" | OrderStatus>("all");
  const [query, setQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const [userOpen, setUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffPublic | null>(null);
  const [userForm, setUserForm] = useState(emptyUser);

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
      setTab((current) => (tabAllowed(profile, current) ? current : firstTab(profile)));
    } catch {
      setError("Không kết nối được API. Chạy npm run dev từ thư mục gốc.");
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(KEY_STORAGE);
    if (saved) {
      setKey(saved);
      void session(saved);
    }
    setHydrated(true);
  }, [session]);

  useEffect(() => {
    if (!key || !me) return;
    let alive = true;

    async function loadTab() {
      const first = !ready[tab];
      try {
        if (tab === "orders") {
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
          const res = await fetch(`${API}/products`, { cache: "no-store" });
          const data = await res.json();
          if (!alive) return;
          if (Array.isArray(data)) {
            setProducts(data);
            setReady((cur) => ({ ...cur, products: true }));
          } else if (first) setError("Không đọc được sản phẩm.");
        } else if (tab === "seo") {
          const res = await fetch(`${API}/pages`, { cache: "no-store" });
          const data = await res.json();
          if (!alive) return;
          if (Array.isArray(data)) {
            setPages(data);
            setReady((cur) => ({ ...cur, seo: true }));
          } else if (first) setError("Không đọc được SEO trang.");
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
      setTab(firstTab(data.user));
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
    setPassword("");
    setUsers([]);
    setOrders([]);
    setProducts([]);
    setPages([]);
    setReady({ orders: false, products: false, seo: false, users: false });
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
    if (!res.ok) throw new Error(data.error ?? "Không tải được ảnh");
    return data.url as string;
  }

  async function reloadProducts() {
    const res = await fetch(`${API}/products`, { cache: "no-store" });
    const data = await res.json();
    if (Array.isArray(data)) setProducts(data);
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

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    const cat = categories.find((c) => c.slug === form.categorySlug) ?? categories[0];
    const price = Number(form.price);
    const photos = form.images.filter((src) => src.startsWith("/uploads/"));
    if (!photos.length) {
      setError("Tải ít nhất một ảnh sản phẩm.");
      return;
    }
    const body: Product = {
      id: String(Date.now()),
      slug: form.slug,
      name: form.name,
      category: cat.name,
      categorySlug: form.categorySlug,
      price,
      priceFmt: "",
      image: photos[0] ?? "",
      images: photos,
      description: form.description,
      detail: form.description,
      sizes: form.categorySlug === "phu-kien" ? ["One size"] : ["90", "100", "110", "120", "130", "140"],
      colors: ["Hồng", "Kem"],
      featured: form.featured,
      seoTitle: form.seoTitle.trim() || undefined,
      seoDescription: form.seoDescription.trim() || undefined,
      seoKeywords: form.seoKeywords.trim() || undefined,
    };
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${API}/products`, {
        method: "POST",
        headers: adminHeaders(key),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setError((await res.json()).error ?? "Không lưu được");
        return;
      }
      setForm(emptyProduct);
      setDrawer(false);
      await reloadProducts();
    } catch {
      setError("Không lưu được sản phẩm — API không phản hồi.");
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
        setError((await res.json()).error ?? "Không cập nhật được đơn");
        return;
      }
      await reloadOrders();
    } catch {
      setError("Không cập nhật được đơn — API không phản hồi.");
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
        setError((await res.json()).error ?? "Không xóa được");
        return;
      }
      await reloadProducts();
    } catch {
      setError("Không xóa được sản phẩm — API không phản hồi.");
    }
  }

  async function saveSeoPage(id: string, patch: Pick<SeoPage, "title" | "description" | "keywords">) {
    const res = await fetch(`${API}/pages/${id}`, {
      method: "PUT",
      headers: adminHeaders(key),
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Không lưu được SEO");
    setPages((cur) => cur.map((page) => (page.id === id ? (data as SeoPage) : page)));
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
        setError((await res.json()).error ?? "Không lưu được tài khoản");
        return;
      }
      setUserOpen(false);
      setEditingUser(null);
      setUserForm(emptyUser);
      await reloadUsers();
    } catch {
      setError("Không lưu được tài khoản — API không phản hồi.");
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
        setError((await res.json()).error ?? "Không xóa được");
        return;
      }
      await reloadUsers();
    } catch {
      setError("Không xóa được tài khoản — API không phản hồi.");
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
    if (tab === "products" && hasPermission(me, "products")) {
      return [{ label: "Sản phẩm", value: String(products.length) }];
    }
    if (tab === "seo" && hasPermission(me, "products")) {
      return [{ label: "Trang SEO", value: String(pages.length) }];
    }
    if (tab === "users" && hasPermission(me, "users")) {
      return [{ label: "Tài khoản", value: String(users.length) }];
    }
    return [];
  }, [me, tab, orders, products.length, pages.length, users.length]);

  const titles: Record<Tab, { eye: string; title: string }> = {
    orders: { eye: "Vận hành", title: "Đơn hàng" },
    products: { eye: "Catalog", title: "Sản phẩm" },
    seo: { eye: "Google", title: "SEO trang" },
    users: { eye: "Studio", title: "Tài khoản" },
  };

  if (!hydrated) return <div className="boot">ECHO</div>;

  if (!authed || !me) {
    return (
      <LoginScreen
        username={username}
        password={password}
        error={error}
        busy={busy}
        onUsername={setUsername}
        onPassword={setPassword}
        onSubmit={login}
      />
    );
  }

  return (
    <div className="studio">
      <aside className="rail">
        <div className="brand">
          <strong>
            ECHO <IconSparkle />
          </strong>
          <span>Studio quản trị</span>
        </div>
        <nav className="nav">
          {can("orders") ? (
            <button type="button" className={tab === "orders" ? "is-on" : ""} onClick={() => setTab("orders")}>
              <IconBag /> Đơn hàng
            </button>
          ) : null}
          {can("products") ? (
            <button type="button" className={tab === "products" ? "is-on" : ""} onClick={() => setTab("products")}>
              <IconHanger /> Sản phẩm
            </button>
          ) : null}
          {can("products") ? (
            <button type="button" className={tab === "seo" ? "is-on" : ""} onClick={() => setTab("seo")}>
              <IconSeo /> SEO trang
            </button>
          ) : null}
          {can("users") ? (
            <button type="button" className={tab === "users" ? "is-on" : ""} onClick={() => setTab("users")}>
              <IconPeople /> Tài khoản
            </button>
          ) : null}
        </nav>
        <div className="rail__foot">
          <div className="rail__who">
            <strong>{me.name}</strong>
            <span>{ROLE_LABELS[me.role]}</span>
          </div>
          <button type="button" className="ghost" onClick={logout}>
            <IconLogout /> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="canvas">
        <header className="canvas__head">
          <div>
            <p className="eyebrow">{titles[tab].eye}</p>
            <h1>{titles[tab].title}</h1>
          </div>
        </header>

        {stats.length ? (
          <section className="stats">
            {stats.map((s) => (
              <article key={s.label} className="stat">
                <span className="muted tiny">{s.label}</span>
                <b>{s.value}</b>
              </article>
            ))}
          </section>
        ) : null}

        {error ? <p className="alert">{error}</p> : null}

        {tab === "orders" && can("orders") ? (
          ready.orders ? (
            <OrdersView orders={orders} filter={orderFilter} onFilter={setOrderFilter} onStatus={setStatus} />
          ) : (
            <p className="muted">Đang tải đơn…</p>
          )
        ) : null}
        {tab === "products" && can("products") ? (
          ready.products ? (
            <ProductsView
              products={products}
              query={query}
              onQuery={setQuery}
              open={drawer}
              onOpen={setDrawer}
              form={form}
              onForm={setForm}
              onSave={addProduct}
              onDelete={removeProduct}
              onUpload={uploadProductImage}
              busy={busy}
            />
          ) : (
            <p className="muted">Đang tải sản phẩm…</p>
          )
        ) : null}
        {tab === "seo" && can("products") ? (
          ready.seo ? (
            <SeoView pages={pages} busy={busy} onSave={saveSeoPage} />
          ) : (
            <p className="muted">Đang tải SEO…</p>
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
            <p className="muted">Đang tải tài khoản…</p>
          )
        ) : null}
      </main>
    </div>
  );
}
