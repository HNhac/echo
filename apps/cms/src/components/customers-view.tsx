import type { CustomerPublic, Order } from "@echo/shared";
import { IconPlus } from "./icons";

export type CustomerDraft = {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
};

type Props = {
  customers: CustomerPublic[];
  orders: Order[];
  query: string;
  onQuery: (value: string) => void;
  open: boolean;
  editing: CustomerPublic | null;
  onOpenCreate: () => void;
  onEdit: (customer: CustomerPublic) => void;
  onClose: () => void;
  form: CustomerDraft;
  onForm: (next: CustomerDraft) => void;
  onSave: (e: React.FormEvent) => void;
  onDelete: (customer: CustomerPublic) => void;
  busy: boolean;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function orderCount(customer: CustomerPublic, orders: Order[]) {
  return orders.filter((order) => order.customerId === customer.id).length;
}

export function CustomersView({
  customers,
  orders,
  query,
  onQuery,
  open,
  editing,
  onOpenCreate,
  onEdit,
  onClose,
  form,
  onForm,
  onSave,
  onDelete,
  busy,
}: Props) {
  const q = query.trim().toLowerCase();
  const visible = customers.filter((item) => {
    if (!q) return true;
    return `${item.name} ${item.email} ${item.phone}`.toLowerCase().includes(q);
  });

  return (
    <div className="stack">
      <div className="toolbar">
        <input
          className="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Tìm tên, email, điện thoại…"
        />
        <button type="button" className="btn" onClick={onOpenCreate}>
          <IconPlus /> Thêm khách
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <p>Chưa có khách hàng khớp.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table table--staff">
            <thead>
              <tr>
                <th>Khách</th>
                <th>Liên hệ</th>
                <th>Đơn</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="staff-who">
                      <span className="user-avatar user-avatar--sky" aria-hidden>
                        {initials(item.name)}
                      </span>
                      <div>
                        <strong>{item.name}</strong>
                        <div className="muted tiny">
                          {item.google ? "Google · " : ""}
                          {item.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{item.phone || "—"}</div>
                    <div className="muted tiny">{item.address || "Chưa có địa chỉ"}</div>
                  </td>
                  <td>{orderCount(item, orders)}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="ghost" onClick={() => onEdit(item)}>
                        Sửa
                      </button>
                      <button type="button" className="text-btn" onClick={() => onDelete(item)}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open ? (
        <div className="drawer-root">
          <button type="button" className="drawer-scrim" aria-label="Đóng" onClick={onClose} />
          <aside className="drawer drawer--user" role="dialog" aria-modal="true" aria-labelledby="customer-drawer-title">
            <header className="drawer__head">
              <div>
                <p className="eyebrow">Shop</p>
                <h2 id="customer-drawer-title">{editing ? "Sửa khách hàng" : "Khách hàng mới"}</h2>
              </div>
              <button type="button" className="ghost" onClick={onClose}>
                Đóng
              </button>
            </header>
            <form className="drawer__form drawer__form--user" onSubmit={onSave}>
              <section className="user-pane">
                <p className="field-label">Thông tin</p>
                <label className="field">
                  Tên
                  <input
                    value={form.name}
                    onChange={(e) => onForm({ ...form, name: e.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  Email / Gmail
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => onForm({ ...form, email: e.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  Số điện thoại
                  <input
                    value={form.phone}
                    onChange={(e) => onForm({ ...form, phone: e.target.value })}
                  />
                </label>
                <label className="field">
                  Địa chỉ
                  <input
                    value={form.address}
                    onChange={(e) => onForm({ ...form, address: e.target.value })}
                  />
                </label>
                <label className="field">
                  {editing ? "Mật khẩu mới (trống = giữ)" : "Mật khẩu"}
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => onForm({ ...form, password: e.target.value })}
                    required={!editing}
                    minLength={editing ? undefined : 6}
                    autoComplete="new-password"
                  />
                </label>
              </section>
              <footer className="drawer__foot">
                <button type="submit" className="btn" disabled={busy}>
                  {busy ? "Đang lưu…" : "Lưu"}
                </button>
              </footer>
            </form>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
