import {
  PERMISSION_LABELS,
  PERMISSIONS,
  ROLE_LABELS,
  ROLE_PRESETS,
  STAFF_ROLES,
  type Permission,
  type StaffPublic,
  type StaffRole,
} from "@echo/shared";
import { IconPlus } from "./icons";

export type UserDraft = {
  name: string;
  username: string;
  password: string;
  role: StaffRole;
  permissions: Permission[];
};

type Props = {
  users: StaffPublic[];
  meId: string;
  query: string;
  onQuery: (value: string) => void;
  open: boolean;
  editing: StaffPublic | null;
  onOpenCreate: () => void;
  onEdit: (user: StaffPublic) => void;
  onClose: () => void;
  form: UserDraft;
  onForm: (next: UserDraft) => void;
  onSave: (e: React.FormEvent) => void;
  onDelete: (user: StaffPublic) => void;
  busy: boolean;
};

export function UsersView({
  users,
  meId,
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
  const visible = users.filter((u) => {
    if (!q) return true;
    return `${u.name} ${u.username} ${ROLE_LABELS[u.role]}`.toLowerCase().includes(q);
  });
  const ownerLocked = form.role === "owner";

  return (
    <div className="stack">
      <div className="toolbar">
        <input
          className="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Tìm tên, tài khoản, vai trò…"
        />
        <button type="button" className="btn" onClick={onOpenCreate}>
          <IconPlus /> Thêm tài khoản
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <p>Chưa có tài khoản khớp.</p>
        </div>
      ) : (
        <div className="user-grid">
          {visible.map((u) => (
            <article key={u.id} className="user-card">
              <div className="user-card__top">
                <div>
                  <h3>{u.name}</h3>
                  <p className="muted tiny">@{u.username}</p>
                </div>
                <span className={`badge badge--${u.role === "owner" ? "pink" : u.role === "manager" ? "gold" : u.role === "ops" ? "sky" : "sage"}`}>
                  {ROLE_LABELS[u.role]}
                </span>
              </div>
              <div className="perms">
                {u.permissions.map((perm) => (
                  <span key={perm} className="perm">
                    {PERMISSION_LABELS[perm]}
                  </span>
                ))}
              </div>
              <div className="user-card__actions">
                <button type="button" className="ghost" onClick={() => onEdit(u)}>
                  Sửa quyền
                </button>
                {u.id !== meId ? (
                  <button type="button" className="text-btn" onClick={() => onDelete(u)}>
                    Xóa
                  </button>
                ) : (
                  <span className="muted tiny">Bạn</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {open ? (
        <div className="drawer-root">
          <button type="button" className="drawer-scrim" aria-label="Đóng" onClick={onClose} />
          <aside className="drawer">
            <header className="drawer__head">
              <div>
                <p className="eyebrow">Phân quyền</p>
                <h2>{editing ? "Sửa tài khoản" : "Tài khoản mới"}</h2>
              </div>
              <button type="button" className="ghost" onClick={onClose}>
                Đóng
              </button>
            </header>
            <form className="drawer__form" onSubmit={onSave}>
              <label className="field">
                <span>Tên hiển thị</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => onForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Tên đăng nhập</span>
                <input
                  required
                  autoComplete="off"
                  disabled={Boolean(editing)}
                  value={form.username}
                  onChange={(e) => onForm({ ...form, username: e.target.value })}
                />
              </label>
              <label className="field">
                <span>{editing ? "Mật khẩu mới (để trống nếu giữ)" : "Mật khẩu"}</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  required={!editing}
                  value={form.password}
                  onChange={(e) => onForm({ ...form, password: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Vai trò</span>
                <select
                  value={form.role}
                  onChange={(e) => {
                    const role = e.target.value as StaffRole;
                    onForm({ ...form, role, permissions: [...ROLE_PRESETS[role]] });
                  }}
                >
                  {STAFF_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="checks">
                <legend>Quyền</legend>
                {PERMISSIONS.map((perm) => (
                  <label key={perm} className="check">
                    <input
                      type="checkbox"
                      checked={ownerLocked || form.permissions.includes(perm)}
                      disabled={ownerLocked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...form.permissions, perm]
                          : form.permissions.filter((p) => p !== perm);
                        onForm({ ...form, permissions: next });
                      }}
                    />
                    {PERMISSION_LABELS[perm]}
                  </label>
                ))}
              </fieldset>
              <p className="muted tiny">
                Vận hành chỉ đơn hàng · Catalog chỉ sản phẩm · Quản lý cả hai · Chủ studio đầy đủ, gồm tạo user.
              </p>
              <button className="btn" type="submit" disabled={busy}>
                {busy ? "Đang lưu…" : editing ? "Cập nhật" : "Tạo tài khoản"}
              </button>
            </form>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
