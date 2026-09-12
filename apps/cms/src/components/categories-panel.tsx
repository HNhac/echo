import { useEffect, useRef, useState } from "react";
import type { Category } from "@echo/shared";
import { slugify } from "@/lib/format";
import { IconPlus, IconX } from "./icons";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  counts: Record<string, number>;
  busy: boolean;
  onCreate: (draft: { name: string; description: string }) => Promise<void>;
  onUpdate: (slug: string, draft: { name: string; description: string }) => Promise<void>;
  onDelete: (slug: string) => Promise<void>;
};

const TONES = ["pink", "gold", "sky", "sage"] as const;

function toneOf(slug: string) {
  let n = 0;
  for (const ch of slug) n += ch.charCodeAt(0);
  return TONES[n % TONES.length];
}

export function CategoriesPanel({
  open,
  onClose,
  categories,
  counts,
  busy,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [localError, setLocalError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setEditing(null);
    setName("");
    setDescription("");
    setLocalError("");
    const id = window.setTimeout(() => nameRef.current?.focus(), 40);
    return () => window.clearTimeout(id);
  }, [open]);

  function startCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setLocalError("");
    nameRef.current?.focus();
  }

  function startEdit(cat: Category) {
    setEditing(cat.slug);
    setName(cat.name);
    setDescription(cat.description);
    setLocalError("");
    nameRef.current?.focus();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const nextName = name.trim();
    if (nextName.length < 2) {
      setLocalError("Tên nhóm tối thiểu 2 ký tự.");
      return;
    }
    setLocalError("");
    try {
      if (editing) await onUpdate(editing, { name: nextName, description: description.trim() });
      else await onCreate({ name: nextName, description: description.trim() });
      startCreate();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Không lưu được nhóm.");
    }
  }

  async function remove(cat: Category) {
    const used = counts[cat.slug] ?? 0;
    if (used > 0) {
      setLocalError(`Còn ${used} sản phẩm trong “${cat.name}”.`);
      return;
    }
    if (!window.confirm(`Xóa nhóm “${cat.name}”?`)) return;
    setLocalError("");
    try {
      await onDelete(cat.slug);
      if (editing === cat.slug) startCreate();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Không xóa được nhóm.");
    }
  }

  if (!open) return null;

  const current = editing ? categories.find((c) => c.slug === editing) : undefined;
  const used = current ? counts[current.slug] ?? 0 : 0;
  const slugPreview = editing ?? (name.trim() ? slugify(name) : "");

  return (
    <div className="drawer-root">
      <button type="button" className="drawer-scrim" aria-label="Đóng" onClick={onClose} />
      <aside className="drawer drawer--cat" role="dialog" aria-modal="true" aria-labelledby="cat-drawer-title">
        <header className="drawer__head">
          <div>
            <p className="eyebrow">Catalog</p>
            <h2 id="cat-drawer-title">
              Nhóm sản phẩm
              {categories.length ? <span className="cat-head-count">{categories.length}</span> : null}
            </h2>
          </div>
          <button type="button" className="icon-btn" aria-label="Đóng" onClick={onClose}>
            <IconX />
          </button>
        </header>

        <div className="drawer__form drawer__form--cat">
          <section className="cat-pane cat-pane--list" aria-label="Danh sách nhóm">
            <button
              type="button"
              className={!editing ? "cat-new is-on" : "cat-new"}
              onClick={startCreate}
            >
              <span className="cat-new__plus">
                <IconPlus />
              </span>
              Nhóm mới
            </button>

            {categories.length ? (
              <div className="cat-list">
                {categories.map((cat) => {
                  const count = counts[cat.slug] ?? 0;
                  const on = editing === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      className={on ? "cat-item is-on" : "cat-item"}
                      onClick={() => startEdit(cat)}
                    >
                      <span className={`cat-item__mark cat-item__mark--${toneOf(cat.slug)}`} aria-hidden>
                        {cat.name.slice(0, 1).toLocaleUpperCase("vi")}
                      </span>
                      <span className="cat-item__body">
                        <strong>{cat.name}</strong>
                        <em>{cat.description || cat.slug}</em>
                      </span>
                      {count ? <span className="cat-item__count">{count}</span> : <span className="cat-item__count is-empty" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="cat-empty">
                <p>Chưa có nhóm nào</p>
                <span className="muted tiny">Tạo nhóm đầu tiên ở cột bên.</span>
              </div>
            )}
          </section>

          <form className="cat-pane cat-pane--form" onSubmit={(e) => void submit(e)}>
            <p className="field-label">{current ? "Sửa nhóm" : "Thêm nhóm"}</p>
            <label className="field">
              <span>Tên</span>
              <input
                ref={nameRef}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Váy đầm"
              />
            </label>
            <label className="field">
              <span>Mô tả trên cửa hàng</span>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Váy xòe, đầm tiệc, đầm đi học"
              />
            </label>

            <div className="cat-slug">
              <span>Slug</span>
              <code>{slugPreview || "—"}</code>
              {current ? <em>Giữ nguyên khi sửa</em> : <em>Tự tạo từ tên</em>}
            </div>

            {current && used > 0 ? (
              <p className="muted tiny">Còn {used} sản phẩm — chuyển hết rồi mới xóa được.</p>
            ) : null}
            {localError ? <p className="alert">{localError}</p> : null}

            <div className="drawer__foot">
              {current ? (
                <button
                  type="button"
                  className="text-btn"
                  disabled={used > 0 || busy}
                  onClick={() => void remove(current)}
                >
                  Xóa nhóm
                </button>
              ) : (
                <p className="muted tiny">Hiện trên filter cửa hàng.</p>
              )}
              <button className="btn" type="submit" disabled={busy}>
                {busy ? "Đang lưu…" : current ? "Lưu nhóm" : "Thêm nhóm"}
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
}
