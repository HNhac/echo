import type { Metadata } from "next";
import { ContentShell } from "@/components/layout/content-shell";
import { MarqueeStrip } from "@/components/home/marquee-strip";
import { brand, brandPageTitle } from "@/config/brand";

export const metadata: Metadata = {
  title: brandPageTitle("Câu chuyện"),
  description: `${brand.name} — thời trang bé gái, vải mềm, size 90–140.`,
};

export default function StoryPage() {
  return (
    <>
      <MarqueeStrip />
      <ContentShell
        title={`Câu chuyện ${brand.name}`}
        subtitle="Shop váy áo cho bé gái — mẹ chọn nhanh, bé vẫn thích mặc đi chơi."
        crumbs={[{ label: "Câu chuyện" }]}
      >
        <p>
          {brand.name} làm đồ cho bé <strong>1–10 tuổi</strong>: váy xòe, đầm tiệc,
          set bộ và phụ kiện nhỏ. Ưu tiên cotton, lót voan, bo chun mềm — mặc xinh
          mà vẫn chạy nhảy được.
        </p>
        <h2>Chọn size thế nào?</h2>
        <p>
          Size theo chiều cao: 90 đến 140. Nếu bé cao gần mốc trên, lấy lớn hơn 1
          nấc. Xem bảng chi tiết tại trang hướng dẫn size.
        </p>
        <h2>Bảo quản</h2>
        <p>
          Giặt máy chế độ nhẹ, lộn trái. Đầm voan ủi hơi nước. Nơ kẹp lau ẩm, không
          ngâm.
        </p>
      </ContentShell>
    </>
  );
}
