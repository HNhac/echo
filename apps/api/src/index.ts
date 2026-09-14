import "./env.js";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Context } from "hono";
import {
  applySaleFields,
  formatVnd,
  hasPermission,
  homeCatalogOf,
  normalizeShopSettings,
  normalizeShopStory,
  shopBanners,
  storeBanner,
  storeImagePaths,
  normalizeUsername,
  permissionsFor,
  productUnitPrice,
  toStaffPublic,
  uniqueCategorySlug,
  type Banner,
  type Category,
  type CreateOrderInput,
  type CreateStaffInput,
  type Order,
  type Permission,
  type Product,
  type SeoPage,
  type ShopSettings,
  type ShopStory,
  type StaffLoginInput,
  type StaffRole,
  type StaffUser,
  type UpdateStaffInput,
} from "@echo/shared";
import { ADMIN_KEY, buildStaff, hashPassword, verifyPassword } from "./auth.js";
import { loadDb, saveDb } from "./db.js";
import { openapiSpec, swaggerAllowed, swaggerHtml } from "./openapi.js";
import { compressLegacyUploads, readUpload, saveUpload } from "./uploads.js";
import { readHostStats } from "./host-stats.js";
import { clientIp, recordVisit } from "./visits.js";

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? "0.0.0.0";

const app = new Hono();

function isLocalDevOrigin(origin: string) {
  try {
    const { hostname, protocol } = new URL(origin);
    return (
      (protocol === "http:" || protocol === "https:") &&
      (hostname === "localhost" || hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

function corsAllowlist() {
  return (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

function corsOrigin(origin: string | undefined) {
  if (!origin) return undefined;
  const normalized = origin.replace(/\/$/, "");
  if (isLocalDevOrigin(normalized)) return origin;
  const allow = corsAllowlist();
  if (allow.includes("*")) return origin;
  if (allow.includes(normalized)) return origin;
  const publicHost = process.env.PUBLIC_HOST?.trim();
  if (publicHost) {
    try {
      const hostname = new URL(normalized).hostname;
      if (hostname === publicHost || hostname.endsWith(`.${publicHost}`)) return origin;
    } catch {
      /* ignore */
    }
  }
  return undefined;
}

app.use(
  "*",
  cors({
    origin: (origin) => corsOrigin(origin),
    allowHeaders: ["Content-Type", "x-admin-key"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

function getActor(c: Context): StaffUser | undefined {
  const token = c.req.header("x-admin-key")?.trim();
  if (!token) return undefined;
  const db = loadDb();
  if (token === ADMIN_KEY) {
    return db.users.find((u) => u.role === "owner") ?? db.users[0];
  }
  return db.users.find((u) => u.key === token);
}

function gate(c: Context, perm?: Permission) {
  const user = getActor(c);
  if (!user) return { ok: false as const, res: c.json({ error: "Unauthorized" }, 401) };
  if (perm && !hasPermission(user, perm)) {
    return { ok: false as const, res: c.json({ error: "Không đủ quyền" }, 403) };
  }
  return { ok: true as const, user };
}

function ownerCount(users: StaffUser[]) {
  return users.filter((u) => u.role === "owner").length;
}

app.use("*", async (c, next) => {
  await next();
  if (c.req.path.startsWith("/uploads/")) return;
  if (!c.res.headers.get("Cache-Control")) {
    c.header("Cache-Control", "private, no-store, max-age=0");
  }
});

app.get("/health", (c) => c.json({ ok: true, service: "echo-api" }));

app.post("/visit", async (c) => {
  recordVisit({
    ip: clientIp(c.req.raw.headers),
    agent: c.req.header("user-agent") ?? "",
  });
  return c.json({ ok: true });
});

app.get("/openapi.json", (c) => {
  if (!swaggerAllowed(c)) return c.json({ error: "Not found" }, 404);
  return c.json(openapiSpec);
});

app.get("/docs", (c) => {
  if (!swaggerAllowed(c)) return c.json({ error: "Not found" }, 404);
  return c.html(swaggerHtml());
});

app.get("/uploads/:name", async (c) => {
  const file = await readUpload(c.req.param("name"));
  if (!file) return c.json({ error: "Không tìm thấy ảnh" }, 404);
  return c.body(new Uint8Array(file.body), 200, {
    "Content-Type": file.mime,
    "Cache-Control": "public, max-age=31536000, immutable",
  });
});

app.post("/admin/uploads", async (c) => {
  const auth = gate(c, "products");
  if (!auth.ok) return auth.res;
  const body = await c.req.parseBody({ all: true });
  const raw = body.file;
  const file = Array.isArray(raw) ? raw[0] : raw;
  if (!(file instanceof File)) {
    return c.json({ error: "Chọn một file ảnh" }, 400);
  }
  const saved = await saveUpload(file);
  if ("error" in saved) return c.json({ error: saved.error }, saved.status);
  return c.json(saved, 201);
});

app.get("/categories", (c) => {
  const db = loadDb();
  return c.json(db.categories);
});

app.post("/categories", async (c) => {
  const auth = gate(c, "products");
  if (!auth.ok) return auth.res;
  const body = await c.req.json<Partial<Category>>();
  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  if (name.length < 2) return c.json({ error: "Tên nhóm tối thiểu 2 ký tự" }, 400);
  const db = loadDb();
  const slug = uniqueCategorySlug(
    name,
    db.categories.map((cat) => cat.slug),
    body.slug,
  );
  const category: Category = { slug, name, description };
  db.categories.push(category);
  saveDb(db);
  return c.json(category, 201);
});

app.put("/categories/:slug", async (c) => {
  const auth = gate(c, "products");
  if (!auth.ok) return auth.res;
  const db = loadDb();
  const slug = c.req.param("slug");
  const i = db.categories.findIndex((cat) => cat.slug === slug);
  if (i < 0) return c.json({ error: "Không tìm thấy nhóm" }, 404);
  const body = await c.req.json<Partial<Category>>();
  const name = String(body.name ?? db.categories[i].name).trim();
  if (name.length < 2) return c.json({ error: "Tên nhóm tối thiểu 2 ký tự" }, 400);
  const description =
    body.description != null ? String(body.description).trim() : db.categories[i].description;
  db.categories[i] = { slug, name, description };
  for (const product of db.products) {
    if (product.categorySlug === slug) product.category = name;
  }
  saveDb(db);
  return c.json(db.categories[i]);
});

app.delete("/categories/:slug", (c) => {
  const auth = gate(c, "products");
  if (!auth.ok) return auth.res;
  const db = loadDb();
  const slug = c.req.param("slug");
  const exists = db.categories.some((cat) => cat.slug === slug);
  if (!exists) return c.json({ error: "Không tìm thấy nhóm" }, 404);
  const used = db.products.filter((p) => p.categorySlug === slug).length;
  if (used > 0) {
    return c.json({ error: `Còn ${used} sản phẩm trong nhóm này` }, 409);
  }
  db.categories = db.categories.filter((cat) => cat.slug !== slug);
  saveDb(db);
  return c.json({ ok: true });
});

app.get("/catalog/home", (c) => {
  const db = loadDb();
  return c.json({
    ...homeCatalogOf(db.products, db.categories),
    banners: shopBanners(db.banners, db.settings.bannerEnabled),
    bannerEnabled: db.settings.bannerEnabled,
    seasonTheme: db.settings.seasonTheme,
    seasonFx: db.settings.seasonFx,
  });
});

app.get("/settings", (c) => {
  const db = loadDb();
  return c.json(db.settings);
});

app.put("/settings", async (c) => {
  const auth = gate(c, "products");
  if (!auth.ok) return auth.res;
  const body = await c.req.json<Partial<ShopSettings>>();
  const db = loadDb();
  db.settings = normalizeShopSettings({
    ...db.settings,
    ...body,
  });
  saveDb(db);
  return c.json(db.settings);
});

app.get("/story", (c) => {
  const db = loadDb();
  return c.json(db.story);
});

app.put("/story", async (c) => {
  const auth = gate(c, "products");
  if (!auth.ok) return auth.res;
  const body = await c.req.json<Partial<ShopStory>>();
  const db = loadDb();
  db.story = normalizeShopStory({ ...db.story, ...body });
  saveDb(db);
  return c.json(db.story);
});

app.get("/banners", (c) => {
  const db = loadDb();
  const auth = getActor(c);
  if (auth && hasPermission(auth, "products")) return c.json(db.banners);
  return c.json(shopBanners(db.banners, db.settings.bannerEnabled));
});

app.post("/banners", async (c) => {
  const auth = gate(c, "products");
  if (!auth.ok) return auth.res;
  const body = await c.req.json<Partial<Banner>>();
  const db = loadDb();
  const sort = db.banners.reduce((max, item) => Math.max(max, item.sort), -1) + 1;
  const banner = storeBanner({
    ...body,
    id: String(Date.now()),
    sort: Number.isFinite(Number(body.sort)) ? Number(body.sort) : sort,
  });
  if (!banner) return c.json({ error: "Cần tải ảnh banner lên CMS" }, 400);
  db.banners.push(banner);
  db.banners.sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id));
  saveDb(db);
  return c.json(banner, 201);
});

app.put("/banners/:id", async (c) => {
  const auth = gate(c, "products");
  if (!auth.ok) return auth.res;
  const db = loadDb();
  const i = db.banners.findIndex((item) => item.id === c.req.param("id"));
  if (i < 0) return c.json({ error: "Không tìm thấy" }, 404);
  const body = await c.req.json<Partial<Banner>>();
  const banner = storeBanner({ ...db.banners[i], ...body, id: db.banners[i].id });
  if (!banner) return c.json({ error: "Cần tải ảnh banner lên CMS" }, 400);
  db.banners[i] = banner;
  db.banners.sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id));
  saveDb(db);
  return c.json(banner);
});

app.delete("/banners/:id", (c) => {
  const auth = gate(c, "products");
  if (!auth.ok) return auth.res;
  const db = loadDb();
  const id = c.req.param("id");
  if (!db.banners.some((item) => item.id === id)) return c.json({ error: "Không tìm thấy" }, 404);
  db.banners = db.banners.filter((item) => item.id !== id);
  saveDb(db);
  return c.json({ ok: true });
});

app.get("/pages", (c) => {
  const db = loadDb();
  return c.json(db.pages);
});

app.get("/pages/:id", (c) => {
  const db = loadDb();
  const page = db.pages.find((p) => p.id === c.req.param("id"));
  if (!page) return c.json({ error: "Không tìm thấy trang" }, 404);
  return c.json(page);
});

app.put("/pages/:id", async (c) => {
  const auth = gate(c, "products");
  if (!auth.ok) return auth.res;
  const db = loadDb();
  const i = db.pages.findIndex((p) => p.id === c.req.param("id"));
  if (i < 0) return c.json({ error: "Không tìm thấy trang" }, 404);
  const body = await c.req.json<Partial<Pick<SeoPage, "title" | "description" | "keywords">>>();
  db.pages[i] = {
    ...db.pages[i],
    title: String(body.title ?? db.pages[i].title).trim() || db.pages[i].title,
    description: String(body.description ?? db.pages[i].description).trim() || db.pages[i].description,
    keywords: String(body.keywords ?? db.pages[i].keywords).trim(),
  };
  saveDb(db);
  return c.json(db.pages[i]);
});

app.get("/products", (c) => {
  const db = loadDb();
  let list = db.products;
  const category = c.req.query("category");
  const featured = c.req.query("featured");
  const exclude = c.req.query("exclude");
  const limit = Number(c.req.query("limit") || 0);
  if (category) list = list.filter((p) => p.categorySlug === category);
  if (featured === "1") list = list.filter((p) => p.featured);
  if (exclude) list = list.filter((p) => p.slug !== exclude);
  if (limit > 0) list = list.slice(0, limit);
  return c.json(list);
});

app.get("/products/:slug", (c) => {
  const db = loadDb();
  const key = c.req.param("slug");
  const item = db.products.find((p) => p.slug === key) ?? db.products.find((p) => p.id === key);
  if (!item) return c.json({ error: "Không tìm thấy" }, 404);
  return c.json(item);
});

app.post("/admin/login", async (c) => {
  const body = await c.req.json<StaffLoginInput>();
  const password = body.password ?? "";
  if (!password) return c.json({ error: "Thiếu mật khẩu" }, 400);

  const db = loadDb();
  const username = body.username ? normalizeUsername(body.username) : "";
  const user = username
    ? db.users.find((u) => u.username === username)
    : db.users.find((u) => u.role === "owner");

  if (!user) return c.json({ error: "Sai tài khoản hoặc mật khẩu" }, 401);

  const passOk =
    verifyPassword(password, user.passwordHash) ||
    (user.role === "owner" && password === ADMIN_KEY);
  if (!passOk) return c.json({ error: "Sai tài khoản hoặc mật khẩu" }, 401);

  return c.json({ ok: true, key: user.key, user: toStaffPublic(user) });
});

app.get("/admin/me", (c) => {
  const auth = gate(c);
  if (!auth.ok) return auth.res;
  return c.json(toStaffPublic(auth.user));
});

app.get("/admin/host-stats", async (c) => {
  const auth = gate(c);
  if (!auth.ok) return auth.res;
  if (auth.user.role !== "owner") return c.json({ error: "Chỉ chủ studio xem máy chủ" }, 403);
  return c.json(await readHostStats());
});

app.get("/admin/users", (c) => {
  const auth = gate(c, "users");
  if (!auth.ok) return auth.res;
  const db = loadDb();
  return c.json(db.users.map(toStaffPublic));
});

app.post("/admin/users", async (c) => {
  const auth = gate(c, "users");
  if (!auth.ok) return auth.res;
  const body = await c.req.json<CreateStaffInput>();
  const name = body.name?.trim() ?? "";
  const username = normalizeUsername(body.username ?? "");
  const password = body.password ?? "";
  const role: StaffRole = body.role ?? "ops";

  if (name.length < 2) return c.json({ error: "Tên quá ngắn" }, 400);
  if (username.length < 2) return c.json({ error: "Tên đăng nhập quá ngắn" }, 400);
  if (password.length < 4) return c.json({ error: "Mật khẩu tối thiểu 4 ký tự" }, 400);
  if (role === "owner" && auth.user.role !== "owner") {
    return c.json({ error: "Chỉ chủ studio mới tạo thêm chủ studio" }, 403);
  }

  const db = loadDb();
  if (db.users.some((u) => u.username === username)) {
    return c.json({ error: "Tên đăng nhập đã tồn tại" }, 409);
  }

  const user = buildStaff({
    name,
    username,
    password,
    role,
    permissions: body.permissions,
  });
  if (user.role !== "owner" && user.permissions.length === 0) {
    return c.json({ error: "Chọn ít nhất một quyền" }, 400);
  }
  db.users.push(user);
  saveDb(db);
  return c.json(toStaffPublic(user), 201);
});

app.patch("/admin/users/:id", async (c) => {
  const auth = gate(c, "users");
  if (!auth.ok) return auth.res;
  const db = loadDb();
  const user = db.users.find((u) => u.id === c.req.param("id"));
  if (!user) return c.json({ error: "Không tìm thấy" }, 404);

  const body = await c.req.json<UpdateStaffInput>();
  const nextRole = body.role ?? user.role;

  if (nextRole === "owner" && auth.user.role !== "owner") {
    return c.json({ error: "Chỉ chủ studio mới gán quyền chủ studio" }, 403);
  }
  if (user.role === "owner" && nextRole !== "owner" && ownerCount(db.users) <= 1) {
    return c.json({ error: "Phải giữ ít nhất một chủ studio" }, 400);
  }

  if (body.name?.trim()) user.name = body.name.trim();
  if (body.password) {
    if (body.password.length < 4) return c.json({ error: "Mật khẩu tối thiểu 4 ký tự" }, 400);
    user.passwordHash = hashPassword(body.password);
  }
  user.role = nextRole;
  user.permissions = permissionsFor(nextRole, body.permissions ?? user.permissions);
  if (user.role !== "owner" && user.permissions.length === 0) {
    return c.json({ error: "Chọn ít nhất một quyền" }, 400);
  }
  saveDb(db);
  return c.json(toStaffPublic(user));
});

app.delete("/admin/users/:id", (c) => {
  const auth = gate(c, "users");
  if (!auth.ok) return auth.res;
  const id = c.req.param("id");
  if (id === auth.user.id) return c.json({ error: "Không thể xóa chính mình" }, 400);

  const db = loadDb();
  const user = db.users.find((u) => u.id === id);
  if (!user) return c.json({ error: "Không tìm thấy" }, 404);
  if (user.role === "owner" && ownerCount(db.users) <= 1) {
    return c.json({ error: "Không thể xóa chủ studio cuối" }, 400);
  }

  db.users = db.users.filter((u) => u.id !== id);
  saveDb(db);
  return c.json({ ok: true });
});

app.post("/products", async (c) => {
  const auth = gate(c, "products");
  if (!auth.ok) return auth.res;
  const body = await c.req.json<Product>();
  const images = storeImagePaths([body.image, ...(body.images ?? [])]);
  if (!images.length) {
    return c.json({ error: "Cần tải ảnh sản phẩm lên CMS (không dùng URL ngoài)" }, 400);
  }
  const db = loadDb();
  const cat = db.categories.find((item) => item.slug === body.categorySlug);
  if (!cat) return c.json({ error: "Nhóm không tồn tại" }, 400);
  if (db.products.some((p) => p.slug === body.slug || p.id === body.id)) {
    return c.json({ error: "Slug hoặc id đã tồn tại" }, 409);
  }
  const product: Product = {
    ...body,
    category: cat.name,
    categorySlug: cat.slug,
    image: images[0],
    images,
    priceFmt: formatVnd(body.price),
    ...applySaleFields(body.price, {
      salePrice: body.salePrice,
      flashPct: body.flashPct,
      saleKind: body.saleKind,
    }),
  };
  db.products.unshift(product);
  saveDb(db);
  return c.json(product, 201);
});

app.put("/products/:id", async (c) => {
  const auth = gate(c, "products");
  if (!auth.ok) return auth.res;
  const db = loadDb();
  const i = db.products.findIndex((p) => p.id === c.req.param("id"));
  if (i < 0) return c.json({ error: "Không tìm thấy" }, 404);
  const body = await c.req.json<Partial<Product>>();
  const next = {
    ...db.products[i],
    ...body,
    id: db.products[i].id,
  };
  if ("stock" in body && (body.stock === null || body.stock === undefined)) {
    delete next.stock;
  }
  const cat = db.categories.find((item) => item.slug === next.categorySlug);
  if (!cat) return c.json({ error: "Nhóm không tồn tại" }, 400);
  next.category = cat.name;
  next.categorySlug = cat.slug;
  const images = storeImagePaths([next.image, ...(next.images ?? [])]);
  if (!images.length) {
    return c.json({ error: "Cần tải ảnh sản phẩm lên CMS (không dùng URL ngoài)" }, 400);
  }
  const price = body.price ?? db.products[i].price;
  db.products[i] = {
    ...next,
    image: images[0],
    images,
    priceFmt: formatVnd(price),
    ...applySaleFields(price, {
      salePrice: "salePrice" in body ? body.salePrice : next.salePrice,
      flashPct: "flashPct" in body ? body.flashPct : next.flashPct,
      saleKind: "saleKind" in body ? body.saleKind : next.saleKind,
    }),
  };
  saveDb(db);
  return c.json(db.products[i]);
});

app.delete("/products/:id", (c) => {
  const auth = gate(c, "products");
  if (!auth.ok) return auth.res;
  const db = loadDb();
  const before = db.products.length;
  db.products = db.products.filter((p) => p.id !== c.req.param("id"));
  if (db.products.length === before) return c.json({ error: "Không tìm thấy" }, 404);
  saveDb(db);
  return c.json({ ok: true });
});

app.get("/orders", (c) => {
  const auth = gate(c, "orders");
  if (!auth.ok) return auth.res;
  const db = loadDb();
  return c.json(db.orders);
});

app.post("/orders", async (c) => {
  const body = await c.req.json<CreateOrderInput>();
  if (!body.name?.trim() || !body.phone?.trim() || !body.address?.trim()) {
    return c.json({ error: "Thiếu thông tin nhận hàng" }, 400);
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return c.json({ error: "Giỏ hàng trống" }, 400);
  }

  const db = loadDb();
  const items: Order["items"] = [];
  for (const line of body.items) {
    const product = db.products.find((p) => p.slug === line.slug);
    if (!product) {
      return c.json({ error: `Sản phẩm ${line.slug} không còn` }, 400);
    }
    items.push({
      slug: product.slug,
      name: product.name,
      qty: line.qty,
      size: line.size,
      color: line.color,
      unitPrice: productUnitPrice(product),
    });
  }

  const subtotal = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
  const ship = subtotal >= 500000 ? 0 : 30000;
  const order: Order = {
    id: `ECHO-${String(Date.now()).slice(-6)}`,
    createdAt: new Date().toISOString(),
    name: body.name.trim(),
    phone: body.phone.trim(),
    address: body.address.trim(),
    note: body.note?.trim() || undefined,
    pay: body.pay === "bank" ? "bank" : "cod",
    status: "new",
    items,
    subtotal,
    ship,
    total: subtotal + ship,
  };
  db.orders.unshift(order);
  saveDb(db);
  return c.json(order, 201);
});

app.patch("/orders/:id", async (c) => {
  const auth = gate(c, "orders");
  if (!auth.ok) return auth.res;
  const db = loadDb();
  const order = db.orders.find((o) => o.id === c.req.param("id"));
  if (!order) return c.json({ error: "Không tìm thấy" }, 404);
  const body = await c.req.json<{ status?: Order["status"] }>();
  if (body.status) order.status = body.status;
  saveDb(db);
  return c.json(order);
});

if (process.env.NODE_ENV === "production" && ADMIN_KEY === "echo-admin") {
  console.warn("WARN: Đổi ADMIN_KEY trong .env trước khi public CMS.");
}

console.log(`ECHO API http://${HOST}:${PORT}`);
serve({ fetch: app.fetch, hostname: HOST, port: PORT });
void compressLegacyUploads().catch((err) => {
  console.warn("Không nén được ảnh cũ:", err);
});
