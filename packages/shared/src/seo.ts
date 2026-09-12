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

export const SEO_PAGE_SEEDS: SeoPage[] = [
  {
    id: "home",
    path: "/",
    name: "Trang chủ",
    title: "ECHO — Thời trang bé gái",
    description:
      "Thời trang bé gái 1–10 tuổi — váy đầm, set bộ, áo và phụ kiện. Vải mềm, form dễ mặc, size 90–140.",
    keywords: "thời trang bé gái, váy bé gái, set bộ bé gái, ECHO",
  },
  {
    id: "san-pham",
    path: "/san-pham",
    name: "Cửa hàng",
    title: "Cửa hàng — ECHO",
    description: "Váy đầm, set bộ, áo và phụ kiện bé gái — size 90–140.",
    keywords: "mua váy bé gái, shop bé gái, size 90 140",
  },
  {
    id: "bo-suu-tap",
    path: "/bo-suu-tap",
    name: "Bộ sưu tập",
    title: "Bộ sưu tập — ECHO",
    description: "Váy nắng hè cho bé gái — size 90–140.",
    keywords: "bộ sưu tập bé gái, váy nắng, lookbook",
  },
  {
    id: "lookbook",
    path: "/lookbook",
    name: "Lookbook",
    title: "Lookbook — ECHO",
    description: "Gợi ý mặc cho bé gái — ECHO.",
    keywords: "lookbook bé gái, outfit bé gái",
  },
  {
    id: "cau-chuyen",
    path: "/cau-chuyen",
    name: "Câu chuyện",
    title: "Câu chuyện — ECHO",
    description: "Câu chuyện thương hiệu ECHO.",
    keywords: "thương hiệu ECHO, thời trang trẻ em",
  },
  {
    id: "lien-he",
    path: "/lien-he",
    name: "Liên hệ",
    title: "Liên hệ — ECHO",
    description: "Liên hệ ECHO.",
    keywords: "liên hệ ECHO, hotline shop bé gái",
  },
  {
    id: "gio-hang",
    path: "/gio-hang",
    name: "Giỏ hàng",
    title: "Giỏ hàng — ECHO",
    description: "Giỏ hàng ECHO.",
    keywords: "giỏ hàng",
  },
  {
    id: "thanh-toan",
    path: "/thanh-toan",
    name: "Thanh toán",
    title: "Thanh toán — ECHO",
    description: "Thanh toán đơn hàng ECHO.",
    keywords: "thanh toán, COD",
  },
  {
    id: "huong-dan-size",
    path: "/huong-dan-size",
    name: "Hướng dẫn size",
    title: "Hướng dẫn size — ECHO",
    description: "Bảng size 90–140 cho bé gái.",
    keywords: "size váy bé gái, bảng size 90 140",
  },
  {
    id: "van-chuyen-doi-tra",
    path: "/van-chuyen-doi-tra",
    name: "Vận chuyển & đổi trả",
    title: "Vận chuyển & đổi trả — ECHO",
    description: "Chính sách vận chuyển và đổi trả.",
    keywords: "đổi trả, freeship",
  },
  {
    id: "bao-mat",
    path: "/bao-mat",
    name: "Bảo mật",
    title: "Bảo mật — ECHO",
    description: "Chính sách bảo mật thông tin.",
    keywords: "bảo mật, quyền riêng tư",
  },
  {
    id: "dieu-khoan",
    path: "/dieu-khoan",
    name: "Điều khoản",
    title: "Điều khoản — ECHO",
    description: "Điều khoản sử dụng website.",
    keywords: "điều khoản",
  },
  {
    id: "qua-tang",
    path: "/qua-tang",
    name: "Quà tặng",
    title: "Quà tặng — ECHO",
    description: "Gợi ý quà tặng cho bé gái.",
    keywords: "quà tặng bé gái",
  },
  {
    id: "tai-khoan",
    path: "/tai-khoan",
    name: "Tài khoản",
    title: "Tài khoản — ECHO",
    description: "Tài khoản khách hàng ECHO.",
    keywords: "tài khoản",
  },
];

/** Cart, checkout, account — keep out of Google. */
export const SEO_NOINDEX_IDS = new Set(["gio-hang", "thanh-toan", "tai-khoan"]);

export function mergeSeoPages(existing: SeoPage[] | undefined): SeoPage[] {
  const byId = new Map((existing ?? []).map((p) => [p.id, p]));
  return SEO_PAGE_SEEDS.map((seed) => {
    const cur = byId.get(seed.id);
    if (!cur) return seed;
    return {
      ...seed,
      title: cur.title || seed.title,
      description: cur.description || seed.description,
      keywords: cur.keywords || seed.keywords,
    };
  });
}
