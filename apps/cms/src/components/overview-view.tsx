import Link from "next/link";
import type { Banner, Category, Order, Product, SeoPage, StaffPublic } from "@echo/shared";
import { cmsMediaUrl } from "@/lib/media";
import { money, STATUS, when } from "@/lib/format";
import { STUDIO_PATHS } from "@/lib/studio";

type Props = {
  orders: Order[];
  products: Product[];
  categories: Category[];
  users: StaffPublic[];
  pages: SeoPage[];
  banners: Banner[];
  canOrders: boolean;
  canProducts: boolean;
  canUsers: boolean;
};

export function OverviewView({
  orders,
  products,
  categories,
  users,
  pages,
  banners,
  canOrders,
  canProducts,
  canUsers,
}: Props) {
  const fresh = [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const inbox = fresh.filter((o) => o.status === "new" || o.status === "confirmed" || o.status === "shipped");
  const doneRev = orders.filter((o) => o.status === "done").reduce((sum, o) => sum + o.total, 0);
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const thinStock = products.filter((p) => typeof p.stock === "number" && p.stock <= 5).slice(0, 4);
  const counts = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.categorySlug] = (acc[p.categorySlug] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="stack">
      <section className="stats">
        {canOrders ? (
          <>
            <article className="stat">
              <span className="muted tiny">Đơn mới</span>
              <b>{orders.filter((o) => o.status === "new").length}</b>
            </article>
            <article className="stat">
              <span className="muted tiny">Đang xử lý</span>
              <b>{orders.filter((o) => o.status === "confirmed" || o.status === "shipped").length}</b>
            </article>
            <article className="stat">
              <span className="muted tiny">Doanh thu xong</span>
              <b>{money(doneRev)}</b>
            </article>
          </>
        ) : null}
        {canProducts ? (
          <>
            <article className="stat">
              <span className="muted tiny">Sản phẩm</span>
              <b>{products.length}</b>
            </article>
            <article className="stat">
              <span className="muted tiny">Nhóm</span>
              <b>{categories.length}</b>
            </article>
            <article className="stat">
              <span className="muted tiny">Banner</span>
              <b>{banners.filter((item) => item.active).length}</b>
            </article>
          </>
        ) : null}
        {canUsers ? (
          <article className="stat">
            <span className="muted tiny">Tài khoản</span>
            <b>{users.length}</b>
          </article>
        ) : null}
      </section>

      <div className="dash-grid">
        {canOrders ? (
          <section className="dash-card">
            <header className="dash-card__head">
              <div>
                <p className="field-label">Đơn cần xử lý</p>
                <p className="muted tiny">{inbox.length} đơn mới / xác nhận / đang giao</p>
              </div>
              <Link href={STUDIO_PATHS.orders} className="text-btn">
                Tất cả đơn
              </Link>
            </header>
            {inbox.length === 0 ? (
              <p className="muted tiny">Không có đơn đang chờ. Đơn mới sẽ hiện ở đây.</p>
            ) : (
              <ul className="dash-list">
                {inbox.slice(0, 6).map((order) => (
                  <li key={order.id}>
                    <div>
                      <strong>{order.name}</strong>
                      <p className="muted tiny">
                        {order.id} · {when(order.createdAt)} · {order.items.length} món
                      </p>
                    </div>
                    <div className="dash-list__meta">
                      <span className={`badge badge--${STATUS[order.status].tone}`}>{STATUS[order.status].label}</span>
                      <strong>{money(order.total)}</strong>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {canProducts ? (
          <section className="dash-card">
            <header className="dash-card__head">
              <div>
                <p className="field-label">Catalog</p>
                <p className="muted tiny">Nhóm và món đang hiện trên shop</p>
              </div>
              <Link href={STUDIO_PATHS.products} className="text-btn">
                Sản phẩm
              </Link>
            </header>
            <ul className="dash-cats">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <span>{cat.name}</span>
                  <b>{counts[cat.slug] ?? 0}</b>
                </li>
              ))}
            </ul>
            {featured.length ? (
              <ul className="dash-products">
                {featured.map((product) => (
                  <li key={product.id}>
                    {product.image ? (
                      <img src={cmsMediaUrl(product.image, "sm")} alt="" />
                    ) : (
                      <span className="dash-products__ph" />
                    )}
                    <div>
                      <strong>{product.name}</strong>
                      <p className="muted tiny">{product.category}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted tiny">Chưa có món gắn “hiện trên trang chủ”.</p>
            )}
            {thinStock.length ? (
              <p className="muted tiny dash-note">
                Sắp hết: {thinStock.map((p) => `${p.name} (${p.stock})`).join(", ")}
              </p>
            ) : null}
          </section>
        ) : null}

        {canProducts ? (
          <section className="dash-card">
            <header className="dash-card__head">
              <div>
                <p className="field-label">SEO trang shop</p>
                <p className="muted tiny">Title Google cho trang chủ, cửa hàng, lookbook… — khác SEO từng sản phẩm</p>
              </div>
              <Link href={STUDIO_PATHS.seo} className="text-btn">
                Chỉnh SEO
              </Link>
            </header>
            <p className="dash-seo-count">
              <b>{pages.length}</b>
              <span className="muted tiny">trang đang có metadata</span>
            </p>
          </section>
        ) : null}

        {canUsers ? (
          <section className="dash-card">
            <header className="dash-card__head">
              <div>
                <p className="field-label">Nhân sự</p>
                <p className="muted tiny">{users.filter((u) => u.role !== "owner").length} tài khoản làm việc</p>
              </div>
              <Link href={STUDIO_PATHS.users} className="text-btn">
                Tài khoản
              </Link>
            </header>
            <ul className="dash-people">
              {users.slice(0, 5).map((user) => (
                <li key={user.id}>
                  <strong>{user.name}</strong>
                  <span className="muted tiny">{user.username}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
