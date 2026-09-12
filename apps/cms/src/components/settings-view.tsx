"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_SHOP_NOTICES,
  DEFAULT_SHOP_SETTINGS,
  SEASON_OVERLAY_DEFAULT,
  SEASON_THEMES,
  emptySeasonFx,
  seasonOverlaySrc,
  type SeasonThemeId,
  type ShopNotice,
  type ShopSettings,
} from "@echo/shared";
import { cmsMediaUrl } from "@/lib/media";
import Link from "next/link";
import { SETTINGS_PANES, type SettingsPane } from "@/lib/studio";

type Draft = {
  seasonTheme: SeasonThemeId;
  seasonOverlays: Partial<Record<SeasonThemeId, string>>;
  seasonOverlayShared: string;
  announcementEnabled: boolean;
  footerNotesEnabled: boolean;
  notices: ShopNotice[];
};

type Props = {
  pane: SettingsPane;
  settings: ShopSettings;
  busy: boolean;
  onSave: (next: Draft & { seasonFx: ReturnType<typeof emptySeasonFx> }) => Promise<boolean>;
  onUpload: (file: File) => Promise<string>;
};

function overlayPreview(src: string) {
  if (!src) return "";
  if (src.startsWith("/seasons/")) return src;
  return cmsMediaUrl(src);
}

export function SettingsView({ pane, settings, busy, onSave, onUpload }: Props) {
  const live = settings ?? DEFAULT_SHOP_SETTINGS;
  const [theme, setTheme] = useState<SeasonThemeId>(live.seasonTheme);
  const [overlays, setOverlays] = useState(live.seasonOverlays ?? {});
  const [shared, setShared] = useState(live.seasonOverlayShared ?? "");
  const [headerOn, setHeaderOn] = useState(live.announcementEnabled !== false);
  const [footerOn, setFooterOn] = useState(live.footerNotesEnabled !== false);
  const [notices, setNotices] = useState<ShopNotice[]>(live.notices ?? DEFAULT_SHOP_NOTICES);
  const [uploading, setUploading] = useState<"shared" | "theme" | null>(null);
  const sharedRef = useRef<HTMLInputElement>(null);
  const themeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTheme(live.seasonTheme);
    setOverlays(live.seasonOverlays ?? {});
    setShared(live.seasonOverlayShared ?? "");
    setHeaderOn(live.announcementEnabled !== false);
    setFooterOn(live.footerNotesEnabled !== false);
    setNotices(Array.isArray(live.notices) ? live.notices : DEFAULT_SHOP_NOTICES);
  }, [
    live.seasonTheme,
    live.seasonOverlays,
    live.seasonOverlayShared,
    live.announcementEnabled,
    live.footerNotesEnabled,
    live.notices,
  ]);

  const liveTheme = SEASON_THEMES.find((item) => item.id === live.seasonTheme);
  const preview = overlayPreview(seasonOverlaySrc(theme, overlays, shared));
  const sharedPreview = overlayPreview(shared);
  const custom = Object.prototype.hasOwnProperty.call(overlays, theme);
  const dirty =
    theme !== live.seasonTheme ||
    headerOn !== (live.announcementEnabled !== false) ||
    footerOn !== (live.footerNotesEnabled !== false) ||
    shared !== (live.seasonOverlayShared ?? "") ||
    JSON.stringify(overlays) !== JSON.stringify(live.seasonOverlays ?? {}) ||
    JSON.stringify(notices) !== JSON.stringify(live.notices ?? DEFAULT_SHOP_NOTICES);

  function setNotice(id: string, patch: Partial<ShopNotice>) {
    setNotices((cur) => cur.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function handleUpload(file: File, slot: "shared" | "theme") {
    setUploading(slot);
    try {
      const url = await onUpload(file);
      if (slot === "shared") setShared(url);
      else setOverlays((cur) => ({ ...cur, [theme]: url }));
    } finally {
      setUploading(null);
    }
  }

  const save = (
    <div className="season-save">
      <button
        type="button"
        className="btn"
        disabled={busy || !dirty}
        onClick={() =>
          void onSave({
            seasonTheme: theme,
            seasonOverlays: overlays,
            seasonOverlayShared: shared,
            seasonFx: emptySeasonFx(),
            announcementEnabled: headerOn,
            footerNotesEnabled: footerOn,
            notices,
          })
        }
      >
        {busy ? "Đang lưu…" : "Lưu cài đặt"}
      </button>
      <p className="muted tiny">
        {dirty ? "Chưa lưu — bấm lưu rồi mở lại shop." : "Không có thay đổi."}
      </p>
    </div>
  );

  return (
    <div className="stack">
      <nav className="settings-tabs" aria-label="Mục cài đặt">
        {SETTINGS_PANES.map((item) => (
          <Link key={item.id} href={item.href} className={pane === item.id ? "is-on" : ""}>
            {item.title}
          </Link>
        ))}
      </nav>

      <div className="season-live">
        <span className="season-live__dot" aria-hidden />
        <div>
          <p className="tiny muted">Shop đang chạy</p>
          <strong>{liveTheme?.name ?? "Mặc định"}</strong>
        </div>
      </div>

      {pane === "notices" ? (
      <section className="season-setup">
        <div>
          <h2>Thanh header & footer shop</h2>
          <p className="muted">
            Freeship, đổi size, size… Hiện trên thanh sát logo và/hoặc dòng nhỏ ở footer. Tắt từng dòng hoặc cả khối.
          </p>
        </div>
        <div className="notice-toggles">
          <label className="check">
            <input
              type="checkbox"
              checked={headerOn}
              disabled={busy}
              onChange={(e) => setHeaderOn(e.target.checked)}
            />
            <span>Hiện thanh trên header</span>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={footerOn}
              disabled={busy}
              onChange={(e) => setFooterOn(e.target.checked)}
            />
            <span>Hiện dòng trên footer</span>
          </label>
        </div>
        <ul className="notice-list">
          {notices.map((item, i) => (
            <li key={item.id} className="notice-row">
              <label className="check">
                <input
                  type="checkbox"
                  checked={item.active}
                  disabled={busy}
                  onChange={(e) => setNotice(item.id, { active: e.target.checked })}
                />
                <span>Hiện</span>
              </label>
              <input
                value={item.text}
                disabled={busy}
                maxLength={80}
                aria-label={`Dòng ${i + 1}`}
                onChange={(e) => setNotice(item.id, { text: e.target.value })}
              />
              <button
                type="button"
                className="ghost"
                disabled={busy || notices.length <= 1}
                onClick={() => setNotices((cur) => cur.filter((row) => row.id !== item.id))}
              >
                Xóa
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="ghost"
          disabled={busy || notices.length >= 8}
          onClick={() =>
            setNotices((cur) => [
              ...cur,
              { id: `n-${Date.now().toString(36)}`, text: "", active: true },
            ])
          }
        >
          Thêm dòng
        </button>
      </section>
      ) : null}

      {pane === "theme" ? (
      <>
      <section className="season-setup">
        <div>
          <h2>Theme ngày lễ</h2>
          <p className="muted">
            Đổi màu shop. Theme đang chọn có viền hồng. Ảnh nền chung nằm ngay dưới.
          </p>
        </div>
        <div className="season-grid">
          {SEASON_THEMES.map((item) => {
            const selected = theme === item.id;
            const running = live.seasonTheme === item.id;
            const cls = ["season-card", selected ? "is-on" : "", running ? "is-live" : ""]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={item.id}
                type="button"
                disabled={busy}
                aria-pressed={selected}
                className={cls}
                onClick={() => setTheme(item.id)}
              >
                <span className="season-card__swatch" aria-hidden>
                  {item.swatch.map((color) => (
                    <i key={color} style={{ background: color }} />
                  ))}
                </span>
                <span className="season-card__tags">
                  {selected ? <em className="season-tag season-tag--pick">Đang chọn</em> : null}
                  {running ? <em className="season-tag season-tag--live">Đang chạy</em> : null}
                </span>
                <strong>{item.name}</strong>
                <span className="muted tiny">{item.when}</span>
                <span className="muted tiny">{item.hint}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="season-setup">
        <div>
          <h2>Ảnh nền chung</h2>
          <p className="muted">
            Một ảnh cho mọi lễ. Lễ nào chưa có ảnh riêng sẽ dùng ảnh này.
          </p>
        </div>
        <div className="season-overlay">
          <div className="season-overlay__preview" aria-hidden>
            {sharedPreview ? (
              <span style={{ backgroundImage: `url("${sharedPreview}")` }} />
            ) : (
              <em>Chưa có ảnh chung</em>
            )}
          </div>
          <div className="season-overlay__actions">
            <input
              ref={sharedRef}
              type="file"
              accept="image/png,image/webp,image/svg+xml"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void handleUpload(file, "shared");
              }}
            />
            <button
              type="button"
              className="btn"
              disabled={busy || Boolean(uploading)}
              onClick={() => sharedRef.current?.click()}
            >
              {uploading === "shared" ? "Đang tải…" : "Tải ảnh chung"}
            </button>
            <button
              type="button"
              className="ghost"
              disabled={busy || !shared}
              onClick={() => setShared("")}
            >
              Bỏ ảnh chung
            </button>
            <p className="muted tiny">
              {shared ? "Đang dùng ảnh chung cho các lễ chưa đặt ảnh riêng." : "Chưa đặt — mỗi lễ dùng ảnh mặc định."}
            </p>
          </div>
        </div>
      </section>

      <section className="season-setup">
        <div>
          <h2>Ảnh riêng — {SEASON_THEMES.find((item) => item.id === theme)?.name ?? "theme"}</h2>
          <p className="muted">
            Chỉ theme đang chọn ở trên. Không đặt thì dùng ảnh chung hoặc ảnh mặc định lễ.
          </p>
        </div>
        <div className="season-overlay">
          <div className="season-overlay__preview" aria-hidden>
            {preview ? (
              <span style={{ backgroundImage: `url("${preview}")` }} />
            ) : (
              <em>Không dùng ảnh nền</em>
            )}
          </div>
          <div className="season-overlay__actions">
            <input
              ref={themeRef}
              type="file"
              accept="image/png,image/webp,image/svg+xml"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void handleUpload(file, "theme");
              }}
            />
            <button
              type="button"
              className="btn"
              disabled={busy || Boolean(uploading)}
              onClick={() => themeRef.current?.click()}
            >
              {uploading === "theme" ? "Đang tải…" : "Tải ảnh riêng"}
            </button>
            <button
              type="button"
              className="ghost"
              disabled={busy || !custom}
              onClick={() =>
                setOverlays((cur) => {
                  const next = { ...cur };
                  delete next[theme];
                  return next;
                })
              }
            >
              Dùng chung / mặc định
            </button>
            <button
              type="button"
              className="ghost"
              disabled={busy || (custom && overlays[theme] === "")}
              onClick={() => setOverlays((cur) => ({ ...cur, [theme]: "" }))}
            >
              Không dùng ảnh
            </button>
            <p className="muted tiny">
              {custom
                ? overlays[theme]
                  ? "Đang dùng ảnh riêng cho theme này."
                  : "Đã tắt ảnh nền cho theme này."
                : shared
                  ? "Đang dùng ảnh chung."
                  : theme === "default"
                    ? "Theme mặc định không có ảnh sẵn."
                    : `Mặc định lễ: ${SEASON_OVERLAY_DEFAULT[theme].replace("/seasons/", "")}`}
            </p>
          </div>
        </div>
      </section>
      </>
      ) : null}

      {save}
    </div>
  );
}
