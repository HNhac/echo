import { useState } from "react";
import { categories, type Product } from "@echo/shared";
import { cmsMediaUrl } from "@/lib/media";
import { IconPlus } from "./icons";
import { money, slugify } from "@/lib/format";

export type ProductDraft = {
  name: string;
  slug: string;
  price: string;
  categorySlug: Product["categorySlug"];
  image: string;
  images: string[];
  description: string;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

type Props = {
  products: Product[];
  query: string;
  onQuery: (value: string) => void;
  open: boolean;
  onOpen: (value: boolean) => void;
  form: ProductDraft;
  onForm: (next: ProductDraft) => void;
  onSave: (e: React.FormEvent) => void;
  onDelete: (id: string, name: string) => void;
  onUpload: (file: File) => Promise<string>;
  busy: boolean;
};

export function ProductsView({
  products,
  query,
  onQuery,
  open,
  onOpen,
  form,
  onForm,
  onSave,
  onDelete,
  onUpload,
  busy,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const q = query.trim().toLowerCase();
  const visible = products.filter((p) => {
    if (!q) return true;
    return `${p.name} ${p.slug} ${p.category}`.toLowerCase().includes(q);
  });
  const gallery = form.images.length ? form.images : form.image ? [form.image] : [];

  function setGallery(images: string[]) {
    onForm({ ...form, images, image: images[0] ?? "" });
  }

  async function handleFiles(list: FileList | File[] | null) {
    if (!list || list.length === 0) return;
    const files = Array.from(list).filter((file) => file.type.startsWith("image/"));
    if (!files.length) {
      setUploadError("Chọn file ảnh (JPG, PNG, WEBP, GIF).");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const urls: string[] = [];
      for (const file of files) {
        urls.push(await onUpload(file));
      }
      const images = [...gallery, ...urls];
      onForm({ ...form, images, image: images[0] ?? "" });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Không tải được ảnh.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="stack">
      <div className="toolbar">
        <input
          className="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Tìm tên, slug, nhóm…"
        />
        <button type="button" className="btn" onClick={() => onOpen(true)}>
          <IconPlus /> Thêm sản phẩm
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <p>Chưa có sản phẩm khớp.</p>
        </div>
      ) : (
        <div className="product-grid">
          {visible.map((p) => (
            <article key={p.id} className="product-card">
              <div className="product-card__media">
                {cmsMediaUrl(p.image) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cmsMediaUrl(p.image)} alt="" onError={(e) => e.currentTarget.classList.add("is-broken")} />
                ) : null}
                <div className="product-card__fallback" aria-hidden />
                {p.featured ? <span className="badge badge--pink">Nổi bật</span> : null}
              </div>
              <div className="product-card__body">
                <p className="muted tiny">{p.category}</p>
                <h3>{p.name}</h3>
                <p className="price">{p.priceFmt || money(p.price)}</p>
                <button type="button" className="text-btn" onClick={() => onDelete(p.id, p.name)}>
                  Xóa
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {open ? (
        <div className="drawer-root">
          <button type="button" className="drawer-scrim" aria-label="Đóng" onClick={() => onOpen(false)} />
          <aside className="drawer">
            <header className="drawer__head">
              <div>
                <p className="eyebrow">Catalog</p>
                <h2>Thêm sản phẩm</h2>
              </div>
              <button type="button" className="ghost" onClick={() => onOpen(false)}>
                Đóng
              </button>
            </header>
            <form className="drawer__form" onSubmit={onSave}>
              <label className="field">
                <span>Tên</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const auto = !form.slug || form.slug === slugify(form.name);
                    onForm({ ...form, name, slug: auto ? slugify(name) : form.slug });
                  }}
                />
              </label>
              <label className="field">
                <span>Slug</span>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => onForm({ ...form, slug: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Nhóm</span>
                <select
                  value={form.categorySlug}
                  onChange={(e) => onForm({ ...form, categorySlug: e.target.value as Product["categorySlug"] })}
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Giá (VND)</span>
                <input
                  required
                  inputMode="numeric"
                  value={form.price}
                  onChange={(e) => onForm({ ...form, price: e.target.value })}
                />
              </label>
              <div className="field">
                <span>Ảnh sản phẩm</span>
                <label
                  className="dropzone"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("is-over");
                  }}
                  onDragLeave={(e) => e.currentTarget.classList.remove("is-over")}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("is-over");
                    void handleFiles(e.dataTransfer.files);
                  }}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    hidden
                    onChange={(e) => {
                      void handleFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <strong>{uploading ? "Đang tải ảnh…" : "Chọn hoặc kéo ảnh vào đây"}</strong>
                  <span className="muted tiny">JPG, PNG, WEBP, GIF — tối đa 8MB</span>
                </label>
                {uploadError ? <p className="alert">{uploadError}</p> : null}
                {gallery.length ? (
                  <div className="thumbs">
                    {gallery.map((src, i) => (
                      <div key={`${src}-${i}`} className="thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cmsMediaUrl(src)} alt="" onError={(e) => e.currentTarget.classList.add("is-broken")} />
                        {i === 0 ? <span className="thumb__mark">Bìa</span> : null}
                        <button
                          type="button"
                          className="thumb__x"
                          aria-label="Xóa ảnh"
                          onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted tiny">Bắt buộc tải ảnh từ máy — không dùng URL mạng.</p>
                )}
              </div>
              <label className="field">
                <span>Mô tả</span>
                <textarea
                  value={form.description}
                  onChange={(e) => onForm({ ...form, description: e.target.value })}
                  rows={4}
                />
              </label>
              <label className="field">
                <span>SEO title</span>
                <input
                  value={form.seoTitle}
                  onChange={(e) => onForm({ ...form, seoTitle: e.target.value })}
                  placeholder="Để trống thì dùng tên sản phẩm"
                />
              </label>
              <label className="field">
                <span>SEO mô tả</span>
                <textarea
                  rows={3}
                  value={form.seoDescription}
                  onChange={(e) => onForm({ ...form, seoDescription: e.target.value })}
                  placeholder="Để trống thì dùng mô tả sản phẩm"
                />
              </label>
              <label className="field">
                <span>SEO từ khóa</span>
                <input
                  value={form.seoKeywords}
                  onChange={(e) => onForm({ ...form, seoKeywords: e.target.value })}
                  placeholder="váy bé gái, đầm xòe, size 110"
                />
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => onForm({ ...form, featured: e.target.checked })}
                />
                Hiện trên trang chủ
              </label>
              <button className="btn" type="submit" disabled={busy || uploading}>
                {uploading ? "Đang tải ảnh…" : busy ? "Đang lưu…" : "Lưu sản phẩm"}
              </button>
            </form>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
