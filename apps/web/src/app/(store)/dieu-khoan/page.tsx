import type { Metadata } from "next";
import { ContentShell } from "@/components/layout/content-shell";
import { brand, brandPageTitle } from "@/config/brand";

export const metadata: Metadata = {
  title: brandPageTitle("Điều khoản"),
};

export default function TermsPage() {
  return (
    <ContentShell
      title="Điều khoản sử dụng"
      subtitle="Văn bản placeholder — thay bằng bản pháp lý do luật sư soạn."
      crumbs={[{ label: "Điều khoản" }]}
    >
      <p>
        Bằng việc truy cập website demo {brand.name}, bạn đồng ý tuân theo các
        điều khoản sau. Nội dung, giá và sản phẩm có thể thay đổi mà không cần báo
        trước trong môi trường phát triển.
      </p>
      <h2>Sản phẩm &amp; giá</h2>
      <p>Hình ảnh mang tính minh họa. Giá hiển thị là demo, không phải cam kết thương mại.</p>
    </ContentShell>
  );
}
