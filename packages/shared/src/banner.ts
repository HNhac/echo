import { isUploadPath, storeImagePaths } from "./catalog";

export type Banner = {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  href: string;
  sort: number;
  active: boolean;
};

function safeHref(value: string | undefined) {
  const href = String(value ?? "").trim();
  if (!href) return "/san-pham";
  if (href.startsWith("/")) return href;
  if (/^https?:\/\//i.test(href)) return href;
  return "/san-pham";
}

export function storeBanner(raw: Partial<Banner> | null | undefined): Banner | null {
  if (!raw || typeof raw !== "object") return null;
  const images = storeImagePaths([raw.image]);
  if (!images.length) return null;
  const title = String(raw.title ?? "").trim();
  const subtitle = String(raw.subtitle ?? "").trim();
  return {
    id: String(raw.id ?? "").trim() || String(Date.now()),
    image: images[0],
    title: title || "Banner",
    subtitle: subtitle || undefined,
    href: safeHref(raw.href),
    sort: Number.isFinite(Number(raw.sort)) ? Number(raw.sort) : 0,
    active: raw.active !== false,
  };
}

export function normalizeBanners(raw: unknown): Banner[] {
  if (!Array.isArray(raw)) return [];
  const out: Banner[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const banner = storeBanner(item as Partial<Banner>);
    if (!banner || seen.has(banner.id)) continue;
    seen.add(banner.id);
    out.push(banner);
  }
  return out.sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id));
}

export function publicBanners(list: Banner[]) {
  return list.filter((item) => item.active && isUploadPath(item.image));
}

export const SEASON_THEME_IDS = [
  "default",
  "tet",
  "hung-vuong",
  "phu-nu",
  "giai-phong",
  "thieu-nhi",
  "vu-lan",
  "quoc-khanh",
  "trung-thu",
  "phu-nu-vn",
  "nha-giao",
  "noel",
  "valentine",
  "phat-dan",
  "doan-ngo",
] as const;
export type SeasonThemeId = (typeof SEASON_THEME_IDS)[number];

export const SEASON_FX_IDS = [
  "glow",
  "sparkle",
  "drift",
  "petals",
  "lanterns",
  "hearts",
  "stars",
  "confetti",
  "mist",
] as const;
export type SeasonFxId = (typeof SEASON_FX_IDS)[number];

export const SEASON_FX_META: Array<{ id: SeasonFxId; name: string; hint: string }> = [
  { id: "glow", name: "Vầng sáng", hint: "Hào quang góc trang" },
  { id: "sparkle", name: "Lấp lánh", hint: "Điểm sáng nhấp nháy" },
  { id: "drift", name: "Tuyết trôi", hint: "Hạt trắng rơi chậm" },
  { id: "petals", name: "Hoa rơi", hint: "Cánh mai / đào / sen" },
  { id: "lanterns", name: "Đèn lồng", hint: "Đèn ấm trôi lên" },
  { id: "hearts", name: "Trái tim", hint: "Tim hồng bay" },
  { id: "stars", name: "Sao vàng", hint: "Sao lễ hội" },
  { id: "confetti", name: "Confetti", hint: "Giấy màu vui" },
  { id: "mist", name: "Sương khói", hint: "Khói hương nhẹ" },
];

export const THEME_SUGGESTED_FX: Record<SeasonThemeId, SeasonFxId | null> = {
  default: null,
  tet: "petals",
  "hung-vuong": "mist",
  "phu-nu": "hearts",
  "giai-phong": "stars",
  "thieu-nhi": "confetti",
  "vu-lan": "petals",
  "quoc-khanh": "stars",
  "trung-thu": "lanterns",
  "phu-nu-vn": "hearts",
  "nha-giao": "glow",
  noel: "drift",
  valentine: "hearts",
  "phat-dan": "mist",
  "doan-ngo": "sparkle",
};

export const SEASON_THEMES: Array<{
  id: SeasonThemeId;
  name: string;
  when: string;
  hint: string;
  swatch: [string, string, string];
  suggestedFx: SeasonFxId | null;
}> = [
  { id: "default", name: "Mặc định", when: "Quanh năm", hint: "Hồng kem ECHO", swatch: ["#fffaf8", "#ffe4ec", "#e0568c"], suggestedFx: null },
  { id: "tet", name: "Tết Nguyên Đán", when: "Mùng 1 Tết âm", hint: "Đỏ vàng, hoa mai", swatch: ["#fff5f2", "#c41e3a", "#e8b04a"], suggestedFx: "petals" },
  { id: "hung-vuong", name: "Giỗ Tổ Hùng Vương", when: "10/3 âm", hint: "Đồng đỏ, khói hương", swatch: ["#fff8ef", "#8b4a24", "#d4a017"], suggestedFx: "mist" },
  { id: "phu-nu", name: "Quốc tế Phụ nữ", when: "8/3", hint: "Hồng hoa", swatch: ["#fff5f8", "#e0568c", "#f3b4c8"], suggestedFx: "hearts" },
  { id: "giai-phong", name: "30/4 – 1/5", when: "30/4 · 1/5", hint: "Cờ đỏ sao vàng", swatch: ["#fff6f4", "#da251d", "#ffcd00"], suggestedFx: "stars" },
  { id: "thieu-nhi", name: "Quốc tế Thiếu nhi", when: "1/6", hint: "Pastel vui", swatch: ["#fff9f4", "#5eb3e4", "#f7c948"], suggestedFx: "confetti" },
  { id: "vu-lan", name: "Vu Lan", when: "Rằm tháng 7 âm", hint: "Sen hồng", swatch: ["#fbf5f8", "#c45b8a", "#e8c4d4"], suggestedFx: "petals" },
  { id: "quoc-khanh", name: "Quốc khánh", when: "2/9", hint: "Đỏ vàng", swatch: ["#fff5f3", "#da251d", "#ffcd00"], suggestedFx: "stars" },
  { id: "trung-thu", name: "Trung thu", when: "Rằm tháng 8 âm", hint: "Trăng, đèn lồng", swatch: ["#fff6e4", "#f2c14e", "#e07a2f"], suggestedFx: "lanterns" },
  { id: "phu-nu-vn", name: "Phụ nữ Việt Nam", when: "20/10", hint: "Hồng đào", swatch: ["#fff4f6", "#d44878", "#f5c4d0"], suggestedFx: "hearts" },
  { id: "nha-giao", name: "Nhà giáo Việt Nam", when: "20/11", hint: "Mực và hoa", swatch: ["#f6f4ef", "#3d5a40", "#c9a227"], suggestedFx: "glow" },
  { id: "noel", name: "Giáng sinh", when: "24–25/12", hint: "Tuyết, đỏ thông", swatch: ["#f3f6f3", "#c23b3b", "#2f6b4f"], suggestedFx: "drift" },
  { id: "valentine", name: "Valentine", when: "14/2", hint: "Hồng đậm", swatch: ["#fff0f4", "#d61f5a", "#ffb3c7"], suggestedFx: "hearts" },
  { id: "phat-dan", name: "Phật Đản", when: "15/4 âm", hint: "Sen vàng", swatch: ["#fffaf0", "#d4a017", "#f0d78c"], suggestedFx: "mist" },
  { id: "doan-ngo", name: "Tết Đoan Ngọ", when: "5/5 âm", hint: "Xanh lá, vàng", swatch: ["#f4f8f0", "#5d8a3d", "#e8b04a"], suggestedFx: "sparkle" },
];

export function isSeasonTheme(value: unknown): value is SeasonThemeId {
  return typeof value === "string" && (SEASON_THEME_IDS as readonly string[]).includes(value);
}

export type SeasonFx = Record<SeasonFxId, boolean>;

export const DEFAULT_SEASON_FX: SeasonFx = {
  glow: false,
  sparkle: false,
  drift: false,
  petals: false,
  lanterns: false,
  hearts: false,
  stars: false,
  confetti: false,
  mist: false,
};

export function emptySeasonFx(): SeasonFx {
  return { ...DEFAULT_SEASON_FX };
}

export function seasonFxName(id: SeasonFxId | null | undefined) {
  if (!id) return "Không hiệu ứng";
  return SEASON_FX_META.find((item) => item.id === id)?.name ?? id;
}

export function suggestedFxOf(theme: SeasonThemeId): SeasonFx {
  const next = emptySeasonFx();
  const id = THEME_SUGGESTED_FX[theme];
  if (id) next[id] = true;
  return next;
}

export function activeFxIds(fx: SeasonFx): SeasonFxId[] {
  return SEASON_FX_IDS.filter((id) => fx[id]);
}

export function seasonFxLabel(fx: SeasonFx) {
  const ids = activeFxIds(fx);
  if (!ids.length) return "Không hiệu ứng";
  return ids.map((id) => seasonFxName(id)).join(" · ");
}

export function sameSeasonFx(a: SeasonFx, b: SeasonFx) {
  return SEASON_FX_IDS.every((id) => Boolean(a[id]) === Boolean(b[id]));
}

export function normalizeSeasonFx(raw: unknown): SeasonFx {
  const row = raw && typeof raw === "object" ? (raw as Partial<Record<string, unknown>>) : {};
  const next = emptySeasonFx();
  for (const id of SEASON_FX_IDS) {
    next[id] = row[id] === true;
  }
  return next;
}

export const SEASON_OVERLAY_DEFAULT: Record<SeasonThemeId, string> = {
  default: "",
  tet: "/seasons/tet.svg",
  "hung-vuong": "/seasons/lotus.svg",
  "phu-nu": "/seasons/flowers.svg",
  "giai-phong": "/seasons/stars.svg",
  "thieu-nhi": "/seasons/confetti.svg",
  "vu-lan": "/seasons/flowers.svg",
  "quoc-khanh": "/seasons/stars.svg",
  "trung-thu": "/seasons/lanterns.svg",
  "phu-nu-vn": "/seasons/flowers.svg",
  "nha-giao": "/seasons/leaves.svg",
  noel: "/seasons/snow.svg",
  valentine: "/seasons/hearts.svg",
  "phat-dan": "/seasons/lotus.svg",
  "doan-ngo": "/seasons/leaves.svg",
};

export function normalizeSeasonOverlays(raw: unknown): Partial<Record<SeasonThemeId, string>> {
  if (!raw || typeof raw !== "object") return {};
  const row = raw as Record<string, unknown>;
  const out: Partial<Record<SeasonThemeId, string>> = {};
  for (const id of SEASON_THEME_IDS) {
    if (!(id in row)) continue;
    const value = String(row[id] ?? "");
    if (value === "") out[id] = "";
    else if (isUploadPath(value)) out[id] = value;
  }
  return out;
}

export function normalizeSeasonOverlaySrc(raw: unknown) {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  if (value.startsWith("/seasons/")) return value;
  if (isUploadPath(value)) return value;
  return "";
}

export function seasonOverlaySrc(
  theme: SeasonThemeId,
  overlays?: Partial<Record<SeasonThemeId, string>>,
  shared?: string,
) {
  if (overlays && Object.prototype.hasOwnProperty.call(overlays, theme)) {
    return overlays[theme] ?? "";
  }
  const common = normalizeSeasonOverlaySrc(shared);
  if (common) return common;
  return SEASON_OVERLAY_DEFAULT[theme] ?? "";
}

export type ShopNotice = {
  id: string;
  text: string;
  active: boolean;
};

export const DEFAULT_SHOP_NOTICES: ShopNotice[] = [
  { id: "freeship", text: "Freeship đơn từ 500.000₫", active: true },
  { id: "doi-size", text: "Đổi size 7 ngày", active: true },
  { id: "size", text: "Váy bé gái size 90–140", active: true },
];

const NOTICE_MAX = 8;
const NOTICE_TEXT_MAX = 80;

export function normalizeShopNotices(raw: unknown): ShopNotice[] {
  if (!Array.isArray(raw)) return DEFAULT_SHOP_NOTICES.map((item) => ({ ...item }));
  const out: ShopNotice[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Partial<ShopNotice>;
    const text = String(row.text ?? "").trim().slice(0, NOTICE_TEXT_MAX);
    if (!text) continue;
    let id = String(row.id ?? "").trim().slice(0, 40);
    if (!id || seen.has(id)) id = `n-${out.length + 1}`;
    seen.add(id);
    out.push({ id, text, active: row.active !== false });
    if (out.length >= NOTICE_MAX) break;
  }
  return out;
}

export function activeShopNotices(list: ShopNotice[] | undefined) {
  return (list ?? []).filter((item) => item.active && item.text.trim()).map((item) => item.text.trim());
}

export type ShopSettings = {
  bannerEnabled: boolean;
  announcementEnabled: boolean;
  footerNotesEnabled: boolean;
  notices: ShopNotice[];
  seasonTheme: SeasonThemeId;
  seasonFx: SeasonFx;
  seasonOverlays: Partial<Record<SeasonThemeId, string>>;
  seasonOverlayShared: string;
};

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  bannerEnabled: false,
  announcementEnabled: true,
  footerNotesEnabled: true,
  notices: DEFAULT_SHOP_NOTICES.map((item) => ({ ...item })),
  seasonTheme: "default",
  seasonFx: { ...DEFAULT_SEASON_FX },
  seasonOverlays: {},
  seasonOverlayShared: "",
};

export function normalizeShopSettings(raw: unknown): ShopSettings {
  const row = raw && typeof raw === "object" ? (raw as Partial<ShopSettings>) : {};
  return {
    bannerEnabled: row.bannerEnabled === true,
    announcementEnabled: row.announcementEnabled !== false,
    footerNotesEnabled: row.footerNotesEnabled !== false,
    notices: normalizeShopNotices(row.notices),
    seasonTheme: isSeasonTheme(row.seasonTheme) ? row.seasonTheme : "default",
    seasonFx: normalizeSeasonFx(row.seasonFx),
    seasonOverlays: normalizeSeasonOverlays(row.seasonOverlays),
    seasonOverlayShared: normalizeSeasonOverlaySrc(row.seasonOverlayShared),
  };
}

export function shopBanners(list: Banner[], enabled: boolean) {
  return enabled ? publicBanners(list) : [];
}
