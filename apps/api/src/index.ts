import "./env.js";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Context } from "hono";
import {
  formatVnd,
  hasPermission,
  normalizeUsername,
  permissionsFor,
  productUnitPrice,
  toStaffPublic,
  type CreateOrderInput,
  type CreateStaffInput,
  type Order,
  type Permission,
  type Product,
  type StaffLoginInput,
  type StaffRole,
  type StaffUser,
  type UpdateStaffInput,
} from "@echo/shared";
import { ADMIN_KEY, buildStaff, hashPassword, verifyPassword } from "./auth.js";
import { categories, loadDb, saveDb } from "./db.js";
import { readUpload, saveUpload } from "./uploads.js";

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

app.get("/health", (c) => c.json({ ok: true, service: "echo-api" }));

app.get("/uploads/:name", (c) => {
  const file = readUpload(c.req.param("name"));
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

app.get("/categories", (c) => c.json(categories));

app.get("/products", (c) => {
  const db = loadDb();
  return c.json(db.products);
});

app.get("/products/:slug", (c) => {
  const db = loadDb();
  const item = db.products.find((p) => p.slug === c.req.param("slug"));
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
  const db = loadDb();
  if (db.products.some((p) => p.slug === body.slug || p.id === body.id)) {
    return c.json({ error: "Slug hoặc id đã tồn tại" }, 409);
  }
  const product: Product = {
    ...body,
    priceFmt: formatVnd(body.price),
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
  db.products[i] = {
    ...db.products[i],
    ...body,
    id: db.products[i].id,
    priceFmt: formatVnd(body.price ?? db.products[i].price),
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
