import { slugifyLabel } from "./catalog";
import { descriptionPlain } from "./html";

/** Google SERP thường cắt title ~50–60 ký tự. */
export const SEO_TITLE_MIN = 30;
export const SEO_TITLE_MAX = 60;
/** Snippet mô tả ổn định khoảng 120–155 ký tự. */
export const SEO_DESC_MIN = 70;
export const SEO_DESC_SWEET = 120;
export const SEO_DESC_MAX = 155;

function tidy(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function fold(value: string) {
  const text = tidy(value);
  if (!text) return "";
  if (text.length > 3 && text === text.toUpperCase() && /[A-ZÀ-Ỹ]/.test(text)) {
    return text.charAt(0) + text.slice(1).toLowerCase();
  }
  return text;
}

function hasPhrase(hay: string, needle: string) {
  const a = tidy(hay).toLowerCase();
  const b = tidy(needle).toLowerCase();
  return Boolean(a && b && a.includes(b));
}

function clipWords(value: string, max: number, ellipsis = false) {
  const text = tidy(value);
  if (text.length <= max) return text;
  const cut = text.slice(0, ellipsis ? max - 1 : max);
  const at = cut.lastIndexOf(" ");
  const body = (at > Math.floor(max * 0.6) ? cut.slice(0, at) : cut).trim();
  return ellipsis ? `${body}…` : body;
}

function uniquePhrases(items: Array<string | undefined>) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const phrase = tidy(raw ?? "");
    const key = phrase.toLowerCase();
    if (phrase.length < 2 || key.length > 40 || seen.has(key)) continue;
    seen.add(key);
    out.push(phrase);
  }
  return out;
}

function sizeRange(sizes: string[]) {
  const nums = sizes.map((s) => Number.parseInt(s, 10)).filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (nums.length >= 2) return `size ${nums[0]}–${nums[nums.length - 1]}`;
  if (nums.length === 1) return `size ${nums[0]}`;
  if (sizes.some((s) => /one\s*size/i.test(s))) return "one size";
  return "";
}

function firstSentence(plain: string) {
  const text = tidy(plain.replace(/\n+/g, " "));
  if (!text) return "";
  const sentence = text.match(/^[^.!?…]+[.!?…]?/)?.[0] ?? text;
  return clipWords(sentence.replace(/[.]{2,}/g, "."), 88);
}

function scoreTitle(title: string) {
  let score = 0;
  const len = title.length;
  if (len >= 50 && len <= 58) score += 12;
  else if (len >= 40 && len <= 60) score += 8;
  else if (len >= SEO_TITLE_MIN && len <= SEO_TITLE_MAX) score += 5;
  if (/bé gái/i.test(title)) score += 3;
  if (/\| ECHO$/i.test(title)) score += 2;
  if ((title.match(/\||—|–/g) ?? []).length <= 1) score += 1;
  const words = title.toLowerCase().split(/[\s|/—–-]+/).filter(Boolean);
  if (new Set(words).size < words.length) score -= 5;
  if (title === title.toUpperCase() && title.length > 4) score -= 8;
  return score;
}

function buildTitle(name: string, category: string) {
  if (!name) return "";
  const extras: string[] = [];
  const nameWords = new Set(name.toLowerCase().split(/\s+/).filter(Boolean));
  const catOverlap = category.toLowerCase().split(/\s+/).some((word) => nameWords.has(word));
  if (category && !hasPhrase(name, category) && !catOverlap) extras.push(category);
  if (!hasPhrase(name, "bé gái") && !hasPhrase(category, "bé gái")) extras.push("bé gái");

  const cores = uniquePhrases([
    extras.length ? `${name} ${extras.join(" ")}` : name,
    `${name} cho bé gái`,
    `${name} – thời trang bé gái`,
    extras.includes("bé gái") ? `${name} bé gái` : "",
    name,
  ]);

  const candidates = cores.flatMap((core) => (/echo/i.test(core) ? [core] : [`${core} | ECHO`, core]));
  const fit = uniquePhrases(candidates).filter((title) => title.length <= SEO_TITLE_MAX);
  if (fit.length) return [...fit].sort((a, b) => scoreTitle(b) - scoreTitle(a))[0] ?? name;
  return clipWords(name, SEO_TITLE_MAX);
}

function buildDescription(input: {
  name: string;
  category: string;
  colors: string[];
  sizes: string[];
  plain: string;
}) {
  const { name, category, colors, sizes, plain } = input;
  if (!name && !plain) return "";

  const lead = name
    ? category && !hasPhrase(name, category)
      ? `${name} thuộc nhóm ${category} cho bé gái`
      : `${name} cho bé gái`
    : "";
  const extra = firstSentence(plain).replace(/[.!?…]+$/g, "");
  const extraUse = extra && lead && hasPhrase(lead, extra.slice(0, Math.min(18, extra.length))) ? "" : extra;
  const colorBit = colors.length ? `Màu ${colors.slice(0, 2).join(", ")}` : "";
  const sizeBit = sizeRange(sizes);

  const parts = [lead, extraUse, colorBit, sizeBit].filter(Boolean).map((part) => part.replace(/[.!?…]+$/g, ""));
  let desc = parts.join(". ");
  if (desc && !/[.!?…]$/.test(desc)) desc += ".";
  if (desc.length < SEO_DESC_SWEET && !/echo/i.test(desc)) {
    desc += " Xem bảng size và đặt hàng tại ECHO.";
  }
  if (desc.length > SEO_DESC_MAX) desc = clipWords(desc, SEO_DESC_MAX, true);
  return desc;
}

export function suggestProductSeo(input: {
  name?: string;
  category?: string;
  colors?: string[];
  sizes?: string[];
  description?: string;
}) {
  const name = fold(input.name ?? "");
  const category = fold(input.category ?? "");
  const colors = (input.colors ?? []).map((c) => fold(c)).filter(Boolean);
  const sizes = (input.sizes ?? []).map((s) => tidy(s)).filter(Boolean);
  const plain = tidy(descriptionPlain(input.description).replace(/\n+/g, " "));

  const seoTitle = buildTitle(name, category);
  const seoDescription = buildDescription({ name, category, colors, sizes, plain });
  const slug = slugifyLabel(name);
  const keywords = uniquePhrases([
    name,
    category,
    name && name.length <= 24 && !hasPhrase(name, "bé gái") ? `${name} bé gái` : "",
    category && !hasPhrase(category, "bé gái") ? `${category} bé gái` : "",
    "thời trang bé gái",
    ...colors.slice(0, 2),
    sizeRange(sizes),
    "ECHO",
  ]).slice(0, 8);

  return {
    slug,
    seoTitle,
    seoDescription,
    seoKeywords: keywords.join(", "),
    keywords,
  };
}

export function googleSeoHints(input: { title: string; description: string; slug: string }) {
  const title = tidy(input.title);
  const description = tidy(input.description);
  const slug = tidy(input.slug);
  const titleWords = title.toLowerCase().split(/[\s|/—–-]+/).filter(Boolean);
  const stuffed = titleWords.length - new Set(titleWords).size >= 2;

  return [
    {
      ok: title.length >= SEO_TITLE_MIN && title.length <= SEO_TITLE_MAX && !stuffed,
      text:
        !title
          ? "Thiếu title — Google sẽ tự lấy tên trang"
          : title.length > SEO_TITLE_MAX
            ? `Title ${title.length} ký tự — SERP cắt khoảng ${SEO_TITLE_MAX}`
            : title.length < SEO_TITLE_MIN
              ? `Title ${title.length} ký tự — hơi ngắn, Google dễ viết lại`
              : stuffed
                ? "Title lặp từ — dễ bị coi nhồi khóa"
                : `Title ${title.length}/${SEO_TITLE_MAX} — vừa ô Google`,
    },
    {
      ok: description.length >= SEO_DESC_SWEET && description.length <= SEO_DESC_MAX,
      text:
        !description
          ? "Thiếu mô tả — Google tự cắt đoạn trong trang"
          : description.length > SEO_DESC_MAX
            ? `Mô tả ${description.length} ký tự — snippet sẽ cắt`
            : description.length < SEO_DESC_MIN
              ? `Mô tả ${description.length} ký tự — quá ngắn để chiếm snippet`
              : description.length < SEO_DESC_SWEET
                ? `Mô tả ${description.length} ký tự — nên ~${SEO_DESC_SWEET}–${SEO_DESC_MAX}`
                : `Mô tả ${description.length}/${SEO_DESC_MAX} — đủ 1–2 câu`,
    },
    {
      ok: Boolean(slug) && slug.length <= 60 && !slug.includes("_"),
      text: slug ? "Slug ngắn, gạch ngang — an toàn cho URL" : "Chưa có slug",
    },
  ];
}

export type SeoPage = {
  id: string;
  path: string;
  name: string;
  title: string;
  description: string;
  keywords: string;
};

const PAGE_SEO_COPY: Record<string, Pick<SeoPage, "title" | "description" | "keywords">> = {
  home: {
    title: "Thời trang bé gái 1–10 tuổi | ECHO",
    description:
      "Shop váy đầm, set bộ, áo và phụ kiện cho bé gái 1–10 tuổi. Vải mềm, form dễ mặc, size 90–140. Đặt hàng tại echothuvui.vn.",
    keywords: "thời trang bé gái, váy bé gái, shop bé gái, ECHO, echothuvui",
  },
  "san-pham": {
    title: "Cửa hàng váy đầm bé gái | ECHO",
    description:
      "Xem váy đầm, set bộ, áo và phụ kiện bé gái đang bán tại ECHO. Lọc danh mục, chọn size 90–140, đặt hàng COD trên echothuvui.vn.",
    keywords: "mua váy bé gái, shop bé gái, size 90 140, cửa hàng ECHO",
  },
  "bo-suu-tap": {
    title: "Bộ sưu tập váy bé gái 2026 | ECHO",
    description:
      "Bộ sưu tập váy nắng, đầm tiệc và set dễ vận động cho bé gái. Cotton mềm, size 90–140, mặc đi chơi vẫn chạy nhảy được.",
    keywords: "bộ sưu tập bé gái, váy nắng bé gái, outfit bé gái, ECHO",
  },
  "cau-chuyen": {
    title: "Câu chuyện thương hiệu ECHO | bé gái",
    description:
      "ECHO làm thời trang bé gái 1–10 tuổi: vải mềm, form dễ mặc, size thật. Đọc câu chuyện studio và cách chọn đồ cho bé.",
    keywords: "thương hiệu ECHO, thời trang trẻ em, câu chuyện ECHO",
  },
  "lien-he": {
    title: "Liên hệ shop thời trang bé gái | ECHO",
    description:
      "Liên hệ ECHO để hỏi size, đổi trả hoặc đặt váy bé gái. Shop thời trang bé 1–10 tuổi, size 90–140, giao toàn quốc.",
    keywords: "liên hệ ECHO, hotline shop bé gái, echothuvui",
  },
  "huong-dan-size": {
    title: "Bảng size váy bé gái 90–140 | ECHO",
    description:
      "Chọn size 90–140 theo chiều cao bé trước khi đặt váy đầm ECHO. Bảng size thật, đổi size trong 7 ngày nếu còn tem.",
    keywords: "size váy bé gái, bảng size 90 140, hướng dẫn size ECHO",
  },
  "van-chuyen-doi-tra": {
    title: "Vận chuyển và đổi trả | ECHO",
    description:
      "ECHO giao toàn quốc, freeship đơn từ 500.000₫. Đổi size trong 7 ngày khi còn tem mác. Xem chính sách vận chuyển và đổi trả.",
    keywords: "đổi trả ECHO, freeship bé gái, vận chuyển shop ECHO",
  },
  "bao-mat": {
    title: "Chính sách bảo mật thông tin | ECHO",
    description:
      "ECHO chỉ dùng thông tin đơn hàng để giao váy bé gái. Đọc chính sách bảo mật, quyền riêng tư trên echothuvui.vn.",
    keywords: "bảo mật ECHO, quyền riêng tư, chính sách shop",
  },
  "dieu-khoan": {
    title: "Điều khoản mua hàng tại shop ECHO",
    description:
      "Điều khoản mua váy đầm, set bộ bé gái trên echothuvui.vn — đặt hàng, thanh toán COD, đổi size và quyền của khách.",
    keywords: "điều khoản ECHO, điều khoản mua hàng",
  },
  "qua-tang": {
    title: "Quà tặng váy đầm bé gái | ECHO",
    description:
      "Gợi ý quà sinh nhật, thôi nôi và ngày lễ: váy đầm, set bộ và phụ kiện bé gái size 90–140 tại ECHO.",
    keywords: "quà tặng bé gái, váy sinh nhật bé gái, quà ECHO",
  },
  "gio-hang": {
    title: "Giỏ hàng | ECHO",
    description: "Giỏ hàng ECHO — kiểm tra váy đầm và set bộ trước khi thanh toán.",
    keywords: "giỏ hàng ECHO",
  },
  "thanh-toan": {
    title: "Thanh toán | ECHO",
    description: "Thanh toán đơn váy bé gái ECHO — COD khi nhận hàng.",
    keywords: "thanh toán ECHO, COD",
  },
  "tai-khoan": {
    title: "Tài khoản | ECHO",
    description: "Tài khoản khách hàng ECHO — theo dõi đơn váy bé gái.",
    keywords: "tài khoản ECHO",
  },
};

const PAGE_SEED_ROWS: Array<Pick<SeoPage, "id" | "path" | "name">> = [
  { id: "home", path: "/", name: "Trang chủ" },
  { id: "san-pham", path: "/san-pham", name: "Cửa hàng" },
  { id: "bo-suu-tap", path: "/bo-suu-tap", name: "Bộ sưu tập" },
  { id: "cau-chuyen", path: "/cau-chuyen", name: "Câu chuyện" },
  { id: "lien-he", path: "/lien-he", name: "Liên hệ" },
  { id: "gio-hang", path: "/gio-hang", name: "Giỏ hàng" },
  { id: "thanh-toan", path: "/thanh-toan", name: "Thanh toán" },
  { id: "huong-dan-size", path: "/huong-dan-size", name: "Hướng dẫn size" },
  { id: "van-chuyen-doi-tra", path: "/van-chuyen-doi-tra", name: "Vận chuyển & đổi trả" },
  { id: "bao-mat", path: "/bao-mat", name: "Bảo mật" },
  { id: "dieu-khoan", path: "/dieu-khoan", name: "Điều khoản" },
  { id: "qua-tang", path: "/qua-tang", name: "Quà tặng" },
  { id: "tai-khoan", path: "/tai-khoan", name: "Tài khoản" },
];

export function suggestPageSeo(page: Pick<SeoPage, "id" | "name" | "path">) {
  const custom = PAGE_SEO_COPY[page.id];
  if (custom) return { ...custom };
  const title = clipWords(`${page.name} | ECHO`, SEO_TITLE_MAX);
  const description = clipWords(
    `${page.name} tại ECHO — thời trang bé gái 1–10 tuổi, size 90–140. Xem tại echothuvui.vn.`,
    SEO_DESC_MAX,
  );
  return {
    title,
    description,
    keywords: uniquePhrases([page.name, "ECHO", "thời trang bé gái"]).join(", "),
  };
}

/** Cart, checkout, account — keep out of Google. */
export const SEO_NOINDEX_IDS = new Set(["gio-hang", "thanh-toan", "tai-khoan"]);

export function pageSeoNeedsDefault(page: Pick<SeoPage, "id" | "title" | "description">) {
  if (SEO_NOINDEX_IDS.has(page.id)) return false;
  const title = tidy(page.title);
  const description = tidy(page.description);
  return title.length < SEO_TITLE_MIN || description.length < SEO_DESC_MIN;
}

export function applyDefaultPageSeo(page: SeoPage): SeoPage {
  return { ...page, ...suggestPageSeo(page) };
}

export const SEO_PAGE_SEEDS: SeoPage[] = PAGE_SEED_ROWS.map((row) => ({
  ...row,
  ...suggestPageSeo(row),
}));

export function mergeSeoPages(existing: SeoPage[] | undefined): SeoPage[] {
  const byId = new Map((existing ?? []).map((p) => [p.id, p]));
  return SEO_PAGE_SEEDS.map((seed) => {
    const cur = byId.get(seed.id);
    if (!cur) return seed;
    const merged: SeoPage = {
      ...seed,
      title: cur.title || seed.title,
      description: cur.description || seed.description,
      keywords: cur.keywords || seed.keywords,
    };
    return pageSeoNeedsDefault(merged) ? applyDefaultPageSeo(merged) : merged;
  });
}
