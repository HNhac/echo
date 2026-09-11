import type { Metadata } from "next";
import { ContentShell } from "@/components/layout/content-shell";
import { brandPageTitle } from "@/config/brand";

export const metadata: Metadata = {
  title: brandPageTitle("Bảo mật"),
};

export default function PrivacyPage() {
  return (
    <ContentShell
      title="Chính sách bảo mật"
      subtitle="Mô tả demo về dữ liệu người dùng — cập nhật trước khi thu thập PII thật."
      crumbs={[{ label: "Bảo mật" }]}
    >
      <p>
        Chúng tôi chỉ xử lý dữ liệu cần thiết để phục vụ đơn hàng và hỗ trợ. Trang
        demo hiện không lưu thanh toán hay tài khoản thật.
      </p>
      <h2>Cookie</h2>
      <p>Có thể dùng cookie kỹ thuật cho giỏ hàng và ngôn ngữ khi bạn bật tính năng.</p>
    </ContentShell>
  );
}
