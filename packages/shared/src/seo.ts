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
