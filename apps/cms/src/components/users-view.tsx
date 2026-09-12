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

const ROLE_HINTS: Record<StaffRole, string> = {
  owner: "Đủ mọi quyền",
  manager: "Đơn hàng + sản phẩm",
  ops: "Chỉ đơn hàng",
  catalog: "Chỉ sản phẩm",
};

const ROLE_TONE: Record<StaffRole, string> = {
  owner: "pink",
  manager: "gold",
  ops: "sky",
  catalog: "sage",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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
        <div className="table-wrap">
          <table className="table table--staff">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Quyền</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => {
                const mine = u.id === meId;
                return (
                  <tr key={u.id} className={mine ? "is-me" : undefined}>
                    <td>
                      <div className="staff-who">
                        <span className={`user-avatar user-avatar--${ROLE_TONE[u.role]}`} aria-hidden>
                          {initials(u.name)}
                        </span>
                        <div>
                          <strong>
                            {u.name}
                            {mine ? <span className="you-pill">Bạn</span> : null}
                          </strong>
                          <div className="muted tiny">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge--${ROLE_TONE[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                    </td>
                    <td>
                      <div className="perms">
                        {u.permissions.map((perm) => (
                          <span key={perm} className="perm">
                            {PERMISSION_LABELS[perm]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="ghost" onClick={() => onEdit(u)}>
                          Sửa
                        </button>
                        {mine ? null : (
                          <button type="button" className="text-btn" onClick={() => onDelete(u)}>
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {open ? (
        <div className="drawer-root">
          <button type="button" className="drawer-scrim" aria-label="Đóng" onClick={onClose} />
          <aside className="drawer drawer--user" role="dialog" aria-modal="true" aria-labelledby="user-drawer-title">
            <header className="drawer__head">
              <div>
                <p className="eyebrow">Nhân sự</p>
                <h2 id="user-drawer-title">{editing ? "Sửa tài khoản" : "Tài khoản mới"}</h2>
              </div>
              <button type="button" className="ghost" onClick={onClose}>
                Đóng
              </button>
            </header>
            <form className="drawer__form drawer__form--user" onSubmit={onSave}>
              <section className="user-pane">
                <p className="field-label">Thông tin</p>
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
                  {editing ? <em className="field-hint">Không đổi được tên đăng nhập</em> : null}
                </label>
                <label className="field">
                  <span>{editing ? "Mật khẩu mới" : "Mật khẩu"}</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required={!editing}
                    value={form.password}
                    onChange={(e) => onForm({ ...form, password: e.target.value })}
                    placeholder={editing ? "Để trống nếu giữ mật khẩu cũ" : ""}
                  />
                </label>
              </section>

              <section className="user-pane">
                <p className="field-label">Vai trò & quyền</p>
                <div className="role-pick" role="radiogroup" aria-label="Vai trò">
                  {STAFF_ROLES.map((role) => {
                    const on = form.role === role;
                    return (
                      <label key={role} className={on ? "role-opt is-on" : "role-opt"}>
                        <input
                          type="radio"
                          name="staff-role"
                          value={role}
                          checked={on}
                          onChange={() => onForm({ ...form, role, permissions: [...ROLE_PRESETS[role]] })}
                        />
                        <strong>{ROLE_LABELS[role]}</strong>
                        <small>{ROLE_HINTS[role]}</small>
                      </label>
                    );
                  })}
                </div>
                <fieldset className="checks">
                  <legend>Quyền truy cập</legend>
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
                  {ownerLocked ? (
                    <p className="muted tiny">Chủ studio luôn có đủ quyền.</p>
                  ) : null}
                </fieldset>
              </section>

              <div className="drawer__foot">
                <p className="muted tiny">
                  {editing ? `Đang sửa @${editing.username}` : "Tài khoản dùng để vào CMS."}
                </p>
                <button className="btn" type="submit" disabled={busy}>
                  {busy ? "Đang lưu…" : editing ? "Cập nhật" : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
