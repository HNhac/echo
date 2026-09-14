"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_SHOP_NOTICES,
  DEFAULT_SHOP_SETTINGS,
  DEFAULT_SHOP_VOUCHERS,
  SEASON_OVERLAY_DEFAULT,
  SEASON_THEMES,
  emptySeasonFx,
  freeShipLabel,
  seasonOverlaySrc,
  shopVouchers,
  type SeasonThemeId,
  type ShopNotice,
  type ShopSettings,
  type ShopVoucher,
} from "@echo/shared";
import { cmsMediaUrl } from "@/lib/media";
import { digitsOnly, formatVndInput } from "@/lib/format";
import Link from "next/link";
import { SETTINGS_PANES, type SettingsPane } from "@/lib/studio";
import { DescriptionEditor } from "@/components/description-editor";

type Draft = {
  seasonTheme: SeasonThemeId;
  seasonOverlays: Partial<Record<SeasonThemeId, string>>;
  seasonOverlayShared: string;
  announcementEnabled: boolean;
  footerNotesEnabled: boolean;
  notices: ShopNotice[];
  shipDaysInner: string;
  shipDaysNation: string;
  freeshipFrom: number;
  shipFee: number;
  policyProduct: string;
  policyReturn: string;
  policyShipping: string;
  vouchers: ShopVoucher[];
  cskhPhone: string;
  cskhHours: string;
  facebookUrl: string;
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

function draftVouchers(settings: ShopSettings): ShopVoucher[] {
  if (Array.isArray(settings.vouchers) && settings.vouchers.length) {
    return settings.vouchers.map((item) => ({ ...item }));
  }
  const legacy = shopVouchers(settings);
  if (legacy.length) return legacy.map((item) => ({ ...item }));
  return DEFAULT_SHOP_VOUCHERS.map((item) => ({ ...item }));
}

function emptyVoucher(): ShopVoucher {
  return { code: "", text: "", amount: 0, min: 0 };
}

export function SettingsView({ pane, settings, busy, onSave, onUpload }: Props) {
  const live = settings ?? DEFAULT_SHOP_SETTINGS;
  const [theme, setTheme] = useState<SeasonThemeId>(live.seasonTheme);
  const [overlays, setOverlays] = useState(live.seasonOverlays ?? {});
  const [shared, setShared] = useState(live.seasonOverlayShared ?? "");
  const [headerOn, setHeaderOn] = useState(live.announcementEnabled !== false);
  const [footerOn, setFooterOn] = useState(live.footerNotesEnabled !== false);
  const [notices, setNotices] = useState<ShopNotice[]>(live.notices ?? DEFAULT_SHOP_NOTICES);
  const [shipDaysInner, setShipDaysInner] = useState(live.shipDaysInner);
  const [shipDaysNation, setShipDaysNation] = useState(live.shipDaysNation);
  const [freeshipFrom, setFreeshipFrom] = useState(live.freeshipFrom);
  const [shipFee, setShipFee] = useState(live.shipFee);
  const [policyProduct, setPolicyProduct] = useState(live.policyProduct);
  const [policyReturn, setPolicyReturn] = useState(live.policyReturn);
  const [policyShipping, setPolicyShipping] = useState(live.policyShipping);
  const [vouchers, setVouchers] = useState<ShopVoucher[]>(() => draftVouchers(live));
  const [cskhPhone, setCskhPhone] = useState(live.cskhPhone);
  const [cskhHours, setCskhHours] = useState(live.cskhHours ?? "");
  const [facebookUrl, setFacebookUrl] = useState(live.facebookUrl);
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
    setShipDaysInner(live.shipDaysInner);
    setShipDaysNation(live.shipDaysNation);
    setFreeshipFrom(live.freeshipFrom);
    setShipFee(live.shipFee);
    setPolicyProduct(live.policyProduct);
    setPolicyReturn(live.policyReturn);
    setPolicyShipping(live.policyShipping);
    setVouchers(draftVouchers(live));
    setCskhPhone(live.cskhPhone);
    setCskhHours(live.cskhHours ?? "");
    setFacebookUrl(live.facebookUrl);
  }, [
    live.seasonTheme,
    live.seasonOverlays,
    live.seasonOverlayShared,
    live.announcementEnabled,
    live.footerNotesEnabled,
    live.notices,
    live.shipDaysInner,
    live.shipDaysNation,
    live.freeshipFrom,
    live.shipFee,
    live.policyProduct,
    live.policyReturn,
    live.policyShipping,
    live.vouchers,
    live.voucherCode,
    live.cskhPhone,
    live.cskhHours,
    live.facebookUrl,
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
    JSON.stringify(notices) !== JSON.stringify(live.notices ?? DEFAULT_SHOP_NOTICES) ||
    shipDaysInner !== live.shipDaysInner ||
    shipDaysNation !== live.shipDaysNation ||
    freeshipFrom !== live.freeshipFrom ||
    shipFee !== live.shipFee ||
    policyProduct !== live.policyProduct ||
    policyReturn !== live.policyReturn ||
    policyShipping !== live.policyShipping ||
    JSON.stringify(vouchers) !== JSON.stringify(draftVouchers(live)) ||
    cskhPhone !== live.cskhPhone ||
    cskhHours !== (live.cskhHours ?? "") ||
    facebookUrl !== live.facebookUrl;

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
            shipDaysInner,
            shipDaysNation,
            freeshipFrom,
            shipFee,
            policyProduct,
            policyReturn,
            policyShipping,
            vouchers,
            cskhPhone,
            cskhHours,
            facebookUrl,
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

      {pane === "shipping" ? (
      <section className="season-setup">
        <div>
          <h2>Giao hàng trên shop</h2>
          <p className="muted">
            Hiện ở trang sản phẩm, giỏ hàng và trang vận chuyển. Phí ship tính khi đặt đơn.
          </p>
        </div>
        <div className="ship-grid">
          <label className="field">
            <span>Nội thành</span>
            <input
              value={shipDaysInner}
              disabled={busy}
              maxLength={40}
              placeholder="2–4 ngày"
              onChange={(e) => setShipDaysInner(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Toàn quốc</span>
            <input
              value={shipDaysNation}
              disabled={busy}
              maxLength={40}
              placeholder="3–6 ngày"
              onChange={(e) => setShipDaysNation(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Freeship đơn từ (₫)</span>
            <input
              inputMode="numeric"
              disabled={busy}
              value={formatVndInput(String(freeshipFrom || ""))}
              placeholder="500.000"
              onChange={(e) => setFreeshipFrom(Number(digitsOnly(e.target.value) || "0"))}
            />
          </label>
          <label className="field">
            <span>Phí ship nếu chưa đủ (₫)</span>
            <input
              inputMode="numeric"
              disabled={busy}
              value={formatVndInput(String(shipFee || ""))}
              placeholder="30.000"
              onChange={(e) => setShipFee(Number(digitsOnly(e.target.value) || "0"))}
            />
          </label>
        </div>
        <p className="ship-preview">
          Shop sẽ hiện: Giao {shipDaysInner.trim() || "2–4 ngày"} nội thành · {freeShipLabel(freeshipFrom)}
        </p>
      </section>
      ) : null}

      {pane === "policies" ? (
      <section className="season-setup">
        <div>
          <h2>Tab trên trang sản phẩm</h2>
          <p className="muted">
            Hiện dưới nút thêm giỏ: Thông tin sản phẩm, đổi trả, giao hàng. Cùng nội dung dùng trang Vận chuyển &amp; đổi trả.
          </p>
        </div>
        <div className="policy-editors">
          <div className="drawer__desc">
            <p className="field-label">Thông tin sản phẩm</p>
            <DescriptionEditor
              value={policyProduct}
              onChange={setPolicyProduct}
              placeholder="Chất liệu, form mặc, bảo quản chung…"
            />
          </div>
          <div className="drawer__desc">
            <p className="field-label">Chính sách đổi trả</p>
            <DescriptionEditor
              value={policyReturn}
              onChange={setPolicyReturn}
              placeholder="Điều kiện đổi size, thời hạn, lưu ý…"
            />
          </div>
          <div className="drawer__desc">
            <p className="field-label">Chính sách giao hàng</p>
            <DescriptionEditor
              value={policyShipping}
              onChange={setPolicyShipping}
              placeholder="Nội thành, toàn quốc, kiểm hàng, COD…"
            />
          </div>
        </div>
      </section>
      ) : null}

      {pane === "contact" ? (
      <section className="season-setup">
        <div>
          <h2>CSKH &amp; Facebook</h2>
          <p className="muted">
            Trang sản phẩm hiện một dòng: SĐT kèm giờ, không có SĐT thì hiện Facebook.
          </p>
        </div>
        <div className="ship-grid">
          <label className="field">
            <span>SĐT CSKH</span>
            <input
              value={cskhPhone}
              disabled={busy}
              inputMode="tel"
              placeholder="0888.566.599"
              onChange={(e) => setCskhPhone(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Giờ CSKH</span>
            <input
              value={cskhHours}
              disabled={busy}
              placeholder="8:00 - 22:00"
              onChange={(e) => setCskhHours(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Link Facebook</span>
            <input
              value={facebookUrl}
              disabled={busy}
              placeholder="https://facebook.com/..."
              onChange={(e) => setFacebookUrl(e.target.value)}
            />
          </label>
        </div>
        <h2 className="policy-subhead">Voucher giảm giá</h2>
        <p className="muted">
          Tối đa 8 mã. Hiện trên trang sản phẩm; khách chọn hoặc nhập lúc thanh toán. Xóa hết thì shop không dùng voucher.
        </p>
        <ul className="voucher-list">
          {vouchers.map((item, i) => (
            <li key={i} className="voucher-row">
              <label className="field">
                <span>Mã</span>
                <input
                  value={item.code}
                  disabled={busy}
                  maxLength={16}
                  placeholder="ECHO50"
                  onChange={(e) =>
                    setVouchers((cur) =>
                      cur.map((row, j) =>
                        j === i ? { ...row, code: e.target.value.toUpperCase() } : row,
                      ),
                    )
                  }
                />
              </label>
              <label className="field">
                <span>Dòng mô tả</span>
                <input
                  value={item.text}
                  disabled={busy}
                  maxLength={80}
                  placeholder="Giảm 50k đơn từ 500k"
                  onChange={(e) =>
                    setVouchers((cur) =>
                      cur.map((row, j) => (j === i ? { ...row, text: e.target.value } : row)),
                    )
                  }
                />
              </label>
              <label className="field">
                <span>Giảm (₫)</span>
                <input
                  inputMode="numeric"
                  disabled={busy}
                  value={formatVndInput(String(item.amount || ""))}
                  placeholder="50.000"
                  onChange={(e) =>
                    setVouchers((cur) =>
                      cur.map((row, j) =>
                        j === i
                          ? { ...row, amount: Number(digitsOnly(e.target.value) || "0") }
                          : row,
                      ),
                    )
                  }
                />
              </label>
              <label className="field">
                <span>Đơn từ (₫)</span>
                <input
                  inputMode="numeric"
                  disabled={busy}
                  value={formatVndInput(String(item.min || ""))}
                  placeholder="0 = mọi đơn"
                  onChange={(e) =>
                    setVouchers((cur) =>
                      cur.map((row, j) =>
                        j === i ? { ...row, min: Number(digitsOnly(e.target.value) || "0") } : row,
                      ),
                    )
                  }
                />
              </label>
              <button
                type="button"
                className="ghost"
                disabled={busy || vouchers.length <= 1}
                onClick={() => setVouchers((cur) => cur.filter((_, j) => j !== i))}
              >
                Xóa
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="ghost"
          disabled={busy || vouchers.length >= 8}
          onClick={() => setVouchers((cur) => [...cur, emptyVoucher()])}
        >
          Thêm mã
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
