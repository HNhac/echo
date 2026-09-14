import { useEffect, useRef, useState } from "react";
import {
  productImages,
  productUnitPrice,
  applySaleFields,
  saleAmount,
  googleSeoHints,
  SEO_DESC_MAX,
  SEO_TITLE_MAX,
  suggestProductSeo,
  type Category,
  type Product,
} from "@echo/shared";
import { cmsMediaUrl } from "@/lib/media";
import { shopProductUrl } from "@/lib/shop";
import { CategoriesPanel } from "./categories-panel";
import { DescriptionEditor } from "./description-editor";
import { IconExternal, IconPlus } from "./icons";
import { digitsOnly, formatVndInput, money } from "@/lib/format";

const SIZE_PRESETS = ["90", "100", "110", "120", "130", "140", "One size"];
const COLOR_PRESETS = ["Hồng", "Kem", "Trắng", "Đen", "Vàng", "Xanh", "Tím"];

export type ProductDraft = {
  name: string;
  slug: string;
  price: string;
  salePrice: string;
  saleKind: "amount" | "percent";
  categorySlug: Product["categorySlug"];
  image: string;
  images: string[];
  description: string;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  sizes: string[];
  colors: string[];
  stock: string;
};

function OptionChips({
  label,
  value,
  onChange,
  presets,
  placeholder,
  className,
}: {
  label: string;
  value?: string[];
  onChange: (next: string[]) => void;
  presets: string[];
  placeholder: string;
  className?: string;
}) {
  const selected = value ?? [];
  const [draft, setDraft] = useState("");
  const extras = selected.filter((item) => !presets.includes(item));

  function add(raw: string) {
    const next = raw.trim();
    if (!next || selected.some((item) => item.toLowerCase() === next.toLowerCase())) return;
    onChange([...selected, next]);
  }

  function toggle(item: string) {
    onChange(selected.includes(item) ? selected.filter((cur) => cur !== item) : [...selected, item]);
  }

  return (
    <div className={className ? `field ${className}` : "field"}>
      <span>{label}</span>
      <div className="opt-chips">
        <div className="opt-chips__list">
          {presets.map((item) => (
            <button
              key={item}
              type="button"
              className={selected.includes(item) ? "opt-chip is-on" : "opt-chip"}
              onClick={() => toggle(item)}
            >
              {item}
            </button>
          ))}
          {extras.map((item) => (
            <button key={item} type="button" className="opt-chip is-on" onClick={() => toggle(item)}>
              {item} ×
            </button>
          ))}
        </div>
        <input
          className="opt-chip__input"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            add(draft);
            setDraft("");
          }}
        />
      </div>
    </div>
  );
}

function SeoFields({
  form,
  seoPreview,
  keywordChips,
  onDraft,
  roomy,
}: {
  form: ProductDraft;
  seoPreview: ReturnType<typeof suggestProductSeo>;
  keywordChips: string[];
  onDraft: (patch: Partial<ProductDraft>, touch?: "slug" | "title" | "desc" | "keys") => void;
  roomy?: boolean;
}) {
  return (
    <>
      <label className="field">
        <span>Slug</span>
        <input
          value={form.slug}
          onChange={(e) => onDraft({ slug: e.target.value }, "slug")}
          placeholder={seoPreview.slug || "tu-ten-san-pham"}
        />
      </label>
      <label className="field">
        <span>
          SEO title
          <em className={form.seoTitle.length > SEO_TITLE_MAX ? "seo-count is-over" : "seo-count"}>
            {form.seoTitle.length}/{SEO_TITLE_MAX}
          </em>
        </span>
        <input
          value={form.seoTitle}
          onChange={(e) => onDraft({ seoTitle: e.target.value }, "title")}
          placeholder="Tự tạo khi điền tên"
        />
      </label>
      <label className={roomy ? "field field--full" : "field"}>
        <span>
          SEO mô tả
          <em className={form.seoDescription.length > SEO_DESC_MAX ? "seo-count is-over" : "seo-count"}>
            {form.seoDescription.length}/{SEO_DESC_MAX}
          </em>
        </span>
        <textarea
          rows={roomy ? 5 : 3}
          value={form.seoDescription}
          onChange={(e) => onDraft({ seoDescription: e.target.value }, "desc")}
          placeholder="Tự tạo khi điền thông tin"
        />
      </label>
      <label className={roomy ? "field field--full" : "field"}>
        <span>Từ khóa</span>
        <input
          value={form.seoKeywords}
          onChange={(e) => onDraft({ seoKeywords: e.target.value }, "keys")}
          placeholder="Tự tách từ thông tin sản phẩm"
        />
      </label>
      {keywordChips.length ? (
        <div className={roomy ? "seo-chips seo-chips--full field--full" : "seo-chips"} aria-label="Từ khóa SEO">
          {keywordChips.map((chip) => (
            <span key={chip} className="seo-chip">
              {chip}
            </span>
          ))}
        </div>
      ) : (
        <p className={roomy ? "muted tiny field--full" : "muted tiny"}>Điền tên / nhóm để hiện từ khóa.</p>
      )}
    </>
  );
}

type Props = {
  products: Product[];
  categories: Category[];
  query: string;
  onQuery: (value: string) => void;
  open: boolean;
  editing: boolean;
  onCreate: () => void;
  onEdit: (product: Product) => void;
  onClose: () => void;
  form: ProductDraft;
  onForm: (next: ProductDraft) => void;
  onSave: (e: React.FormEvent) => void;
  onDelete: (id: string, name: string) => void;
  onUpload: (file: File) => Promise<string>;
  onCreateCategory: (draft: { name: string; description: string }) => Promise<void>;
  onUpdateCategory: (slug: string, draft: { name: string; description: string }) => Promise<void>;
  onDeleteCategory: (slug: string) => Promise<void>;
  busy: boolean;
  error?: string;
};

export function ProductsView({
  products,
  categories,
  query,
  onQuery,
  open,
  editing,
  onCreate,
  onEdit,
  onClose,
  form,
  onForm,
  onSave,
  onDelete,
  onUpload,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  busy,
  error,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const mediaRef = useRef<HTMLDivElement>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [catFilter, setCatFilter] = useState("");
  const [seoFull, setSeoFull] = useState(false);
  const [descFull, setDescFull] = useState(false);
  const [preview, setPreview] = useState<{ name: string; images: string[]; index: number } | null>(null);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [saleOnly, setSaleOnly] = useState(false);
  const seoTouched = useRef({ slug: false, title: false, desc: false, keys: false });
  useEffect(() => {
    if (!open) {
      seoTouched.current = { slug: false, title: false, desc: false, keys: false };
      setSeoFull(false);
      setDescFull(false);
      return;
    }
    if (editing) seoTouched.current = { slug: true, title: true, desc: true, keys: true };
    else seoTouched.current = { slug: false, title: false, desc: false, keys: false };
  }, [open, editing]);

  useEffect(() => {
    if (!seoFull && !descFull && !preview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSeoFull(false);
        setDescFull(false);
        setPreview(null);
      }
      if (!preview || preview.images.length < 2) return;
      if (e.key === "ArrowRight") {
        setPreview((cur) => cur && { ...cur, index: (cur.index + 1) % cur.images.length });
      }
      if (e.key === "ArrowLeft") {
        setPreview((cur) => cur && { ...cur, index: (cur.index - 1 + cur.images.length) % cur.images.length });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [seoFull, descFull, preview]);

  const categoryName = categories.find((c) => c.slug === form.categorySlug)?.name ?? "";
  const seoPreview = suggestProductSeo({
    name: form.name,
    category: categoryName,
    colors: form.colors,
    sizes: form.sizes,
    description: form.description,
  });
  const keywordChips = form.seoKeywords
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const seoHints = googleSeoHints({
    title: form.seoTitle.trim() || seoPreview.seoTitle,
    description: form.seoDescription.trim() || seoPreview.seoDescription,
    slug: form.slug.trim() || seoPreview.slug,
  });

  function setDraft(patch: Partial<ProductDraft>, touch?: keyof typeof seoTouched.current) {
    if (touch) seoTouched.current[touch] = true;
    const next = { ...form, ...patch };
    const cat = categories.find((c) => c.slug === next.categorySlug)?.name ?? "";
    const seo = suggestProductSeo({
      name: next.name,
      category: cat,
      colors: next.colors,
      sizes: next.sizes,
      description: next.description,
    });
    onForm({
      ...next,
      slug: seoTouched.current.slug ? next.slug : seo.slug,
      seoTitle: seoTouched.current.title ? next.seoTitle : seo.seoTitle,
      seoDescription: seoTouched.current.desc ? next.seoDescription : seo.seoDescription,
      seoKeywords: seoTouched.current.keys ? next.seoKeywords : seo.seoKeywords,
    });
  }
  const counts = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.categorySlug] = (acc[p.categorySlug] ?? 0) + 1;
    return acc;
  }, {});
  const q = query.trim().toLowerCase();
  const min = Number(digitsOnly(priceMin)) || 0;
  const max = Number(digitsOnly(priceMax)) || 0;
  const visible = products.filter((p) => {
    if (catFilter && p.categorySlug !== catFilter) return false;
    if (saleOnly && saleAmount(p) == null) return false;
    const unit = productUnitPrice(p);
    const amounts = [...new Set([p.price, unit])];
    if (min && amounts.every((n) => n < min)) return false;
    if (max && amounts.every((n) => n > max)) return false;
    if (!q) return true;
    if (`${p.name} ${p.slug} ${p.category}`.toLowerCase().includes(q)) return true;
    const digits = digitsOnly(q);
    if (!digits) return false;
    return amounts.some((n) => String(n).includes(digits) || money(n).toLowerCase().includes(q));
  });
  const gallery = form.images.length ? form.images : form.image ? [form.image] : [];
  const needImage = Boolean(error && /ảnh/i.test(error) && !gallery.length);

  useEffect(() => {
    if (!needImage) return;
    mediaRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [needImage]);

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
    <div className="stack catalog">
      <div className="toolbar">
        <div className="toolbar__find">
          <input
            className="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Tìm tên, slug, nhóm, giá…"
          />
          <input
            className="search search--price"
            inputMode="numeric"
            value={formatVndInput(priceMin)}
            onChange={(e) => setPriceMin(digitsOnly(e.target.value))}
            placeholder="Giá từ"
            aria-label="Giá từ"
          />
          <input
            className="search search--price"
            inputMode="numeric"
            value={formatVndInput(priceMax)}
            onChange={(e) => setPriceMax(digitsOnly(e.target.value))}
            placeholder="Đến"
            aria-label="Giá đến"
          />
          <button
            type="button"
            className={saleOnly ? "chip chip--sale is-on" : "chip chip--sale"}
            onClick={() => setSaleOnly((v) => !v)}
          >
            Đang sale
          </button>
        </div>
        <div className="toolbar__actions">
          <button type="button" className="ghost" onClick={() => setCatOpen(true)}>
            Nhóm
          </button>
          <button type="button" className="btn" onClick={onCreate}>
            <IconPlus /> Thêm sản phẩm
          </button>
        </div>
      </div>

      <div className="catalog__filters">
        <div className="chips">
          <button
            type="button"
            className={catFilter ? "chip" : "chip is-on"}
            onClick={() => setCatFilter("")}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              className={catFilter === cat.slug ? "chip is-on" : "chip"}
              onClick={() => setCatFilter(cat.slug)}
            >
              {cat.name}
              <em>{counts[cat.slug] ?? 0}</em>
            </button>
          ))}
        </div>
        <p className="catalog__count muted tiny">
          {visible.length}/{products.length} món
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <p>{products.length ? "Không khớp bộ lọc." : "Chưa có sản phẩm."}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table table--catalog">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Nhóm</th>
                <th>Giá</th>
                <th>Kho</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => {
                const sale = saleAmount(p);
                const href = shopProductUrl(p.slug);
                const stock =
                  typeof p.stock === "number" ? (p.stock <= 0 ? "Hết hàng" : String(p.stock)) : "Không giới hạn";
                const thumb = cmsMediaUrl(p.image, "sm");
                const photos = productImages(p);
                return (
                  <tr key={p.id} className="catalog-row" onClick={() => onEdit(p)}>
                    <td>
                      <div className="catalog-who">
                        {thumb ? (
                          <button
                            type="button"
                            className="catalog-thumb-btn"
                            title={photos.length ? `Xem ${photos.length} ảnh` : "Xem ảnh"}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreview({ name: p.name, images: photos, index: 0 });
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              className="catalog-thumb"
                              src={thumb}
                              alt=""
                              onError={(e) => e.currentTarget.classList.add("is-broken")}
                            />
                            {photos.length > 1 ? <span className="catalog-thumb-count">{photos.length}</span> : null}
                          </button>
                        ) : (
                          <span className="catalog-thumb catalog-thumb--empty" aria-hidden />
                        )}
                        <div>
                          <strong>{p.name}</strong>
                          <div className="muted tiny">
                            {p.slug}
                            {photos.length ? ` · ${photos.length} ảnh` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td>
                      {sale != null ? (
                        <>
                          <strong className="price--sale">{money(sale)}</strong>
                          <div className="muted tiny price--old">
                            {p.priceFmt || money(p.price)}
                            {p.flashPct ? ` · −${p.flashPct}%` : ""}
                          </div>
                        </>
                      ) : (
                        <strong>{p.priceFmt || money(p.price)}</strong>
                      )}
                    </td>
                    <td>
                      <span className={p.stock === 0 ? "stock is-out" : undefined}>{stock}</span>
                    </td>
                    <td>
                      <div className="catalog-flags">
                        {p.featured ? <span className="badge badge--pink">Nổi bật</span> : null}
                        {sale != null ? <span className="badge badge--gold">Sale</span> : null}
                        {!p.featured && sale == null ? <span className="muted tiny">—</span> : null}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions" onClick={(e) => e.stopPropagation()}>
                        <a className="ghost" href={href} target="_blank" rel="noreferrer">
                          Xem shop <IconExternal />
                        </a>
                        <button type="button" className="text-btn" onClick={() => onDelete(p.id, p.name)}>
                          Xóa
                        </button>
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
        <div className={seoFull || descFull ? "drawer-root is-parked" : "drawer-root"}>
          <button type="button" className="drawer-scrim" aria-label="Đóng" onClick={onClose} />
          <aside className="drawer drawer--product" role="dialog" aria-modal="true" aria-labelledby="product-drawer-title">
            <header className="drawer__head">
              <div>
                <p className="eyebrow">Catalog</p>
                <h2 id="product-drawer-title">{editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>
              </div>
              <button type="button" className="ghost" onClick={onClose}>
                Đóng
              </button>
            </header>
            <form className="drawer__form drawer__form--product" onSubmit={onSave}>
              <div className="drawer__media" ref={mediaRef}>
                <span className="field-label">Ảnh</span>
                <label
                  className={needImage ? "dropzone is-warn" : "dropzone"}
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
                  <strong>{uploading ? "Đang tải…" : "Kéo ảnh vào"}</strong>
                  <span className="muted tiny">
                    JPG/PNG/WEBP · 8MB{gallery.length ? ` · ${gallery.length} ảnh` : ""}
                  </span>
                </label>
                {uploadError ? <p className="alert">{uploadError}</p> : null}
                {gallery.length ? (
                  <div className="thumbs">
                    {gallery.map((src, i) => (
                      <div key={`${src}-${i}`} className="thumb">
                        <button
                          type="button"
                          className="thumb__view"
                          title="Xem ảnh"
                          onClick={() => setPreview({ name: form.name || "Ảnh sản phẩm", images: gallery, index: i })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={cmsMediaUrl(src, "sm")} alt="" onError={(e) => e.currentTarget.classList.add("is-broken")} />
                        </button>
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
                  <p className={needImage ? "alert" : "muted tiny"}>
                    {needImage ? "Chưa có ảnh — kéo hoặc chọn ít nhất một ảnh rồi lưu." : "Bắt buộc ảnh từ máy."}
                  </p>
                )}
              </div>
              <div className="drawer__fields">
                <label className="field field--name">
                  <span>Tên</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setDraft({ name: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Nhóm</span>
                  <select
                    required
                    value={form.categorySlug}
                    onChange={(e) => setDraft({ categorySlug: e.target.value })}
                  >
                    {!categories.length ? <option value="">Chưa có nhóm</option> : null}
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Giá</span>
                  <input
                    required
                    inputMode="numeric"
                    value={formatVndInput(form.price)}
                    onChange={(e) => onForm({ ...form, price: digitsOnly(e.target.value) })}
                    placeholder="0"
                  />
                </label>
                <label className="field">
                  <span>Sale</span>
                  <div className="sale-field">
                    <div className="sale-field__kinds" role="group" aria-label="Kiểu sale">
                      <button
                        type="button"
                        className={form.saleKind !== "percent" ? "is-on" : undefined}
                        onClick={() => onForm({ ...form, saleKind: "amount", salePrice: "" })}
                      >
                        Giá
                      </button>
                      <button
                        type="button"
                        className={form.saleKind === "percent" ? "is-on" : undefined}
                        onClick={() => onForm({ ...form, saleKind: "percent", salePrice: "" })}
                      >
                        %
                      </button>
                    </div>
                    <input
                      inputMode="numeric"
                      value={
                        form.saleKind === "percent"
                          ? form.salePrice
                          : formatVndInput(form.salePrice)
                      }
                      onChange={(e) => onForm({ ...form, salePrice: digitsOnly(e.target.value) })}
                      placeholder={form.saleKind === "percent" ? "20" : "Không giảm"}
                      aria-label={form.saleKind === "percent" ? "Phần trăm giảm" : "Giá sale"}
                    />
                  </div>
                  {(() => {
                    const price = Number(digitsOnly(form.price));
                    const raw = Number(digitsOnly(form.salePrice));
                    if (!price || !raw) return null;
                    const next = applySaleFields(price, {
                      saleKind: form.saleKind,
                      salePrice: form.saleKind === "amount" ? raw : undefined,
                      flashPct: form.saleKind === "percent" ? raw : undefined,
                    });
                    if (!next.salePrice || !next.flashPct) return null;
                    return (
                      <em className="sale-field__hint">
                        Còn {money(next.salePrice)} · −{next.flashPct}%
                      </em>
                    );
                  })()}
                </label>
                <label className="field">
                  <span>Số lượng</span>
                  <input
                    inputMode="numeric"
                    value={form.stock ?? ""}
                    onChange={(e) => onForm({ ...form, stock: digitsOnly(e.target.value) })}
                    placeholder="Không giới hạn"
                  />
                </label>
                <OptionChips
                  className="field--full"
                  label="Size"
                  value={form.sizes ?? []}
                  onChange={(sizes) => setDraft({ sizes })}
                  presets={SIZE_PRESETS}
                  placeholder="Thêm size"
                />
                <OptionChips
                  className="field--full"
                  label="Màu"
                  value={form.colors ?? []}
                  onChange={(colors) => setDraft({ colors })}
                  presets={COLOR_PRESETS}
                  placeholder="Thêm màu"
                />
              </div>
              <div className="drawer__desc">
                <div className="drawer__seo-head">
                  <span className="field-label">Mô tả</span>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => {
                      setSeoFull(false);
                      setDescFull(true);
                    }}
                  >
                    Xem full
                  </button>
                </div>
                {descFull ? null : (
                  <DescriptionEditor
                    value={form.description}
                    onChange={(description) => setDraft({ description })}
                  />
                )}
              </div>
              <aside className="drawer__seo">
                <div className="drawer__seo-head">
                  <div>
                    <p className="field-label">SEO & slug</p>
                    <p className="muted tiny">Tự theo chuẩn Google. Sửa tay thì giữ.</p>
                  </div>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => {
                      setDescFull(false);
                      setSeoFull(true);
                    }}
                  >
                    Xem full
                  </button>
                </div>
                <SeoFields
                  form={form}
                  seoPreview={seoPreview}
                  keywordChips={keywordChips}
                  onDraft={setDraft}
                />
              </aside>
              <div className="drawer__foot">
                {error ? <p className="alert">{error}</p> : null}
                <label className="check">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => onForm({ ...form, featured: e.target.checked })}
                  />
                  Hiện trên trang chủ
                </label>
                <button className="btn" type="submit" disabled={busy || uploading}>
                  {uploading ? "Đang tải ảnh…" : busy ? "Đang lưu…" : editing ? "Lưu thay đổi" : "Lưu sản phẩm"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}

      {seoFull ? (
        <div className="drawer-root drawer-root--top">
          <button type="button" className="drawer-scrim" aria-label="Đóng SEO" onClick={() => setSeoFull(false)} />
          <aside className="drawer drawer--seo" role="dialog" aria-modal="true" aria-labelledby="seo-drawer-title">
            <header className="drawer__head">
              <div>
                <p className="eyebrow">Google</p>
                <h2 id="seo-drawer-title">SEO & slug</h2>
                {form.name.trim() ? <p className="muted tiny">{form.name}</p> : null}
              </div>
              <button type="button" className="ghost" onClick={() => setSeoFull(false)}>
                Đóng
              </button>
            </header>
            <div className="drawer__form drawer__form--seo">
              <div className="seo-modal__fields">
                <SeoFields
                  roomy
                  form={form}
                  seoPreview={seoPreview}
                  keywordChips={keywordChips}
                  onDraft={setDraft}
                />
              </div>
              <aside className="seo-modal__preview">
                <p className="field-label">Xem trên Google</p>
                <div className="serp">
                  <p className="serp__url">
                    {shopProductUrl(form.slug.trim() || seoPreview.slug || "slug").replace(/^https?:\/\//, "").replace(/\//g, " › ")}
                  </p>
                  <p className="serp__title">
                    {form.seoTitle.trim() || seoPreview.seoTitle || "Tiêu đề sẽ hiện ở đây"}
                  </p>
                  <p className="serp__desc">
                    {form.seoDescription.trim() || seoPreview.seoDescription || "Mô tả ngắn hiện dưới title trên Google."}
                  </p>
                </div>
                <ul className="seo-hints">
                  {seoHints.map((hint) => (
                    <li key={hint.text} className={hint.ok ? "is-ok" : "is-warn"}>
                      {hint.text}
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
            <div className="drawer__foot drawer__foot--seo">
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  seoTouched.current = { slug: false, title: false, desc: false, keys: false };
                  setDraft({});
                }}
              >
                Tạo lại theo Google
              </button>
              <button type="button" className="btn" onClick={() => setSeoFull(false)}>
                Xong
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {descFull ? (
        <div className="drawer-root drawer-root--top">
          <button type="button" className="drawer-scrim" aria-label="Đóng mô tả" onClick={() => setDescFull(false)} />
          <aside className="drawer drawer--desc" role="dialog" aria-modal="true" aria-labelledby="desc-drawer-title">
            <header className="drawer__head">
              <div>
                <p className="eyebrow">Catalog</p>
                <h2 id="desc-drawer-title">Mô tả sản phẩm</h2>
                {form.name.trim() ? <p className="muted tiny">{form.name}</p> : null}
              </div>
              <button type="button" className="ghost" onClick={() => setDescFull(false)}>
                Đóng
              </button>
            </header>
            <div className="drawer__form drawer__form--desc">
              <DescriptionEditor
                className="desc-editor--full"
                value={form.description}
                onChange={(description) => setDraft({ description })}
              />
            </div>
            <div className="drawer__foot drawer__foot--seo">
              <p className="muted tiny">Dán nguyên văn được. Sửa ở đây cũng lưu vào sản phẩm.</p>
              <button type="button" className="btn" onClick={() => setDescFull(false)}>
                Xong
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {preview ? (
        <div className="lightbox">
          <button type="button" className="lightbox__scrim" aria-label="Đóng ảnh" onClick={() => setPreview(null)} />
          <div className="lightbox__box" role="dialog" aria-modal="true" aria-label={preview.name}>
            <header className="lightbox__head">
              <div>
                <p className="lightbox__title">{preview.name || "Ảnh sản phẩm"}</p>
                <p className="lightbox__count">
                  {preview.index + 1} / {preview.images.length} ảnh
                </p>
              </div>
              <button type="button" className="lightbox__close" onClick={() => setPreview(null)}>
                Đóng
              </button>
            </header>
            <div className="lightbox__stage">
              {preview.images.length > 1 ? (
                <button
                  type="button"
                  className="lightbox__nav lightbox__nav--prev"
                  aria-label="Ảnh trước"
                  onClick={() =>
                    setPreview({
                      ...preview,
                      index: (preview.index - 1 + preview.images.length) % preview.images.length,
                    })
                  }
                >
                  ‹
                </button>
              ) : null}
              <div className="lightbox__viewport">
                <div
                  className="lightbox__track"
                  style={{ transform: `translateX(-${preview.index * 100}%)` }}
                >
                  {preview.images.map((src, i) => (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      className="lightbox__slide"
                      onClick={() =>
                        preview.images.length > 1 &&
                        setPreview({
                          ...preview,
                          index: (preview.index + 1) % preview.images.length,
                        })
                      }
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cmsMediaUrl(src, "full")} alt={i === preview.index ? preview.name : ""} />
                    </button>
                  ))}
                </div>
              </div>
              {preview.images.length > 1 ? (
                <button
                  type="button"
                  className="lightbox__nav lightbox__nav--next"
                  aria-label="Ảnh sau"
                  onClick={() =>
                    setPreview({ ...preview, index: (preview.index + 1) % preview.images.length })
                  }
                >
                  ›
                </button>
              ) : null}
            </div>
            {preview.images.length > 1 ? (
              <div className="lightbox__film">
                {preview.images.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    className={i === preview.index ? "is-on" : undefined}
                    onClick={() => setPreview({ ...preview, index: i })}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cmsMediaUrl(src, "sm")} alt="" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <CategoriesPanel
        open={catOpen}
        onClose={() => setCatOpen(false)}
        categories={categories}
        counts={counts}
        busy={busy}
        onCreate={onCreateCategory}
        onUpdate={onUpdateCategory}
        onDelete={onDeleteCategory}
      />
    </div>
  );
}
