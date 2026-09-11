import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell } from "@/components/layout/content-shell";
import { brandPageTitle } from "@/config/brand";

export const metadata: Metadata = {
  title: brandPageTitle("Quà tặng"),
  description: "Thẻ quà tặng và gói wrapping.",
};

export default function GiftsPage() {
  return (
    <ContentShell
      title="Quà tặng"
      subtitle="Gửi trao yêu thích thời trang — gói quà và thông điệp cá nhân."
      crumbs={[{ label: "Quà tặng" }]}
    >
      <p>
        Bạn có thể chọn <strong>thẻ quà điện tử</strong> hoặc gói quà khi thanh toán —
        váy, set bộ, nơ kẹp đều dễ làm quà sinh nhật.
      </p>
      <h2>Gợi ý món quà</h2>
      <ul>
        <li>Đầm voan tiệc + kẹp nơ</li>
        <li>Set bộ nắng hè — chọn theo chiều cao bé</li>
        <li>Túi mini gấu + set tất</li>
      </ul>
      <Link href="/san-pham" className="btn-primary mt-2 inline-flex">
        Chọn sản phẩm làm quà
      </Link>
    </ContentShell>
  );
}
