import type { Metadata } from "next";
import { ContentShell } from "@/components/layout/content-shell";
import { metadataForPage } from "@/lib/page-seo";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return metadataForPage(
    "van-chuyen-doi-tra",
    "Vận chuyển & đổi trả",
    "Chính sách giao hàng và đổi trả.",
  );
}

export default function ShippingPage() {
  return (
    <ContentShell
      title="Vận chuyển & đổi trả"
      subtitle="Thông tin minh họa — chỉnh theo chính sách thật khi go-live."
      crumbs={[{ label: "Vận chuyển & đổi trả" }]}
    >
      <h2>Vận chuyển</h2>
      <p>
        Đơn trong nội thành: <strong>2–4 ngày làm việc</strong>. Toàn quốc:{" "}
        <strong>3–6 ngày làm việc</strong> tùy khu vực. Miễn phí ship cho đơn từ
        mức demo (ví dụ 1.500.000₫).
      </p>
      <h2>Đổi trả</h2>
      <p>
        Trong <strong>14 ngày</strong> kể từ khi nhận hàng: sản phẩm còn tag,
        chưa qua giặt/sử dụng. Đổi size hoặc hoàn tiền theo hướng dẫn CSKH.
      </p>
      <h2>Lưu ý</h2>
      <p>Phụ kiện cá nhân hoá (khắc tên) có thể không áp dụng đổi trả.</p>
    </ContentShell>
  );
}
