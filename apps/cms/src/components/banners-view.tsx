"use client";

import { useState } from "react";
import type { Banner } from "@echo/shared";
import { cmsMediaUrl } from "@/lib/media";
import { IconPlus } from "./icons";

export type BannerDraft = {
  image: string;
  title: string;
  subtitle: string;
  href: string;
  active: boolean;
};

type Props = {
  banners: Banner[];
  enabled: boolean;
  onEnabled: (next: boolean) => void;
  open: boolean;
  editing: boolean;
  form: BannerDraft;
  onForm: (next: BannerDraft) => void;
  onCreate: () => void;
  onEdit: (banner: Banner) => void;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onDelete: (banner: Banner) => void;
  onMove: (banner: Banner, dir: -1 | 1) => void;
  onUpload: (file: File) => Promise<string>;
  busy: boolean;
};

export function BannersView({
  banners,
  enabled,
  onEnabled,
  open,
  editing,
  form,
  onForm,
  onCreate,
  onEdit,
  onClose,
  onSave,
  onDelete,
  onMove,
  onUpload,
  busy,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFiles(list: FileList | File[] | null) {
    if (!list || list.length === 0) return;
    const file = Array.from(list).find((item) => item.type.startsWith("image/"));
    if (!file) {
      setUploadError("Chọn file ảnh (JPG, PNG, WEBP).");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      onForm({ ...form, image: await onUpload(file) });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Không tải được ảnh.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="stack catalog">
      <div className="toolbar">
        <label className="check banner-switch">
          <input type="checkbox" checked={enabled} onChange={(e) => onEnabled(e.target.checked)} />
          <span>
            <strong>Hiện banner trên shop</strong>
            <span className="muted tiny">
              {enabled
                ? "Trang chủ đang chạy slide. Tắt thì chỉ còn hero tĩnh."
                : "Đang tắt — shop không hiện slide. Bật khi có ảnh campaign."}
            </span>
          </span>
        </label>
        <div className="toolbar__actions">
          <button type="button" className="btn" onClick={onCreate}>
            <IconPlus /> Thêm slide
          </button>
        </div>
      </div>

      {banners.length === 0 ? (
        <div className="empty">
          <p>Chưa có banner. Thêm ảnh slide để hiện trên trang chủ shop.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table table--catalog">
            <thead>
              <tr>
                <th>Slide</th>
                <th>Link</th>
                <th>Thứ tự</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {banners.map((item, i) => {
                const thumb = cmsMediaUrl(item.image, "sm");
                return (
                  <tr key={item.id} className="catalog-row" onClick={() => onEdit(item)}>
                    <td>
                      <div className="catalog-who">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="catalog-thumb catalog-thumb--banner" src={thumb} alt="" />
                        ) : (
                          <span className="catalog-thumb catalog-thumb--banner catalog-thumb--empty" aria-hidden />
                        )}
                        <div>
                          <strong>{item.title}</strong>
                          {item.subtitle ? <div className="muted tiny">{item.subtitle}</div> : null}
                        </div>
                      </div>
                    </td>
                    <td className="muted tiny">{item.href}</td>
                    <td>
                      <div className="banner-sort" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="ghost" disabled={i === 0} onClick={() => onMove(item, -1)}>
                          ↑
                        </button>
                        <button
                          type="button"
                          className="ghost"
                          disabled={i === banners.length - 1}
                          onClick={() => onMove(item, 1)}
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={item.active ? "chip is-on" : "chip"}>{item.active ? "Hiện" : "Ẩn"}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="text-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item);
                        }}
                      >
                        Xóa
                      </button>
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
          <aside className="drawer drawer--banner" role="dialog" aria-modal="true" aria-labelledby="banner-drawer-title">
            <header className="drawer__head">
              <div>
                <p className="eyebrow">Trang chủ</p>
                <h2 id="banner-drawer-title">{editing ? "Sửa slide" : "Thêm slide"}</h2>
              </div>
              <button type="button" className="ghost" onClick={onClose}>
                Đóng
              </button>
            </header>
            <form className="drawer__form drawer__form--banner" onSubmit={onSave}>
              <div className="drawer__media">
                <span className="field-label">Ảnh banner</span>
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
                    hidden
                    onChange={(e) => {
                      void handleFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <strong>{uploading ? "Đang tải…" : "Kéo ảnh banner vào"}</strong>
                  <span className="muted tiny">Ảnh riêng · ngang · JPG/PNG/WEBP</span>
                </label>
                {uploadError ? <p className="alert">{uploadError}</p> : null}
                {form.image ? (
                  <div className="banner-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cmsMediaUrl(form.image, "full")} alt="" />
                  </div>
                ) : (
                  <p className="muted tiny">Bắt buộc ảnh từ máy — không dùng ảnh sản phẩm.</p>
                )}
              </div>
              <div className="drawer__fields drawer__fields--banner">
                <label className="field field--name">
                  <span className="field-label">Tiêu đề</span>
                  <input value={form.title} onChange={(e) => onForm({ ...form, title: e.target.value })} required />
                </label>
                <label className="field">
                  <span className="field-label">Mô tả</span>
                  <textarea
                    rows={3}
                    value={form.subtitle}
                    onChange={(e) => onForm({ ...form, subtitle: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span className="field-label">Link khi bấm</span>
                  <input
                    value={form.href}
                    onChange={(e) => onForm({ ...form, href: e.target.value })}
                    placeholder="/san-pham"
                  />
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => onForm({ ...form, active: e.target.checked })}
                  />
                  Hiện trên shop
                </label>
              </div>
              <div className="drawer__foot">
                <button type="submit" className="btn" disabled={busy || uploading || !form.image}>
                  {busy ? "Đang lưu…" : "Lưu slide"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
