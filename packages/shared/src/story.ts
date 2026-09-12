import { descriptionToHtml } from "./html";

export type ShopStory = {
  title: string;
  subtitle: string;
  body: string;
};

export const DEFAULT_SHOP_STORY: ShopStory = {
  title: "Câu chuyện ECHO",
  subtitle: "Shop váy áo cho bé gái — mẹ chọn nhanh, bé vẫn thích mặc đi chơi.",
  body: `<p>ECHO làm đồ cho bé <strong>1–10 tuổi</strong>: váy xòe, đầm tiệc, set bộ và phụ kiện nhỏ. Ưu tiên cotton, lót voan, bo chun mềm — mặc xinh mà vẫn chạy nhảy được.</p>
<h2>Chọn size thế nào?</h2>
<p>Size theo chiều cao: 90 đến 140. Nếu bé cao gần mốc trên, lấy lớn hơn 1 nấc. Xem bảng chi tiết tại trang hướng dẫn size.</p>
<h2>Bảo quản</h2>
<p>Giặt máy chế độ nhẹ, lộn trái. Đầm voan ủi hơi nước. Nơ kẹp lau ẩm, không ngâm.</p>`,
};

export function normalizeShopStory(raw: unknown): ShopStory {
  const row = raw && typeof raw === "object" ? (raw as Partial<ShopStory>) : {};
  const title = String(row.title ?? "").trim() || DEFAULT_SHOP_STORY.title;
  const subtitle = String(row.subtitle ?? "").trim() || DEFAULT_SHOP_STORY.subtitle;
  const body = descriptionToHtml(row.body) || DEFAULT_SHOP_STORY.body;
  return { title, subtitle, body };
}
