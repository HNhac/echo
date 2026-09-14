import type { Metadata } from "next";
import { ContentShell } from "@/components/layout/content-shell";
import { ProductCopy } from "@/components/product/product-copy";
import { metadataForPage } from "@/lib/page-seo";
import { fetchShopSettings } from "@/lib/store-api";
import { formatVnd, freeShipLabel } from "@echo/shared";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return metadataForPage(
    "van-chuyen-doi-tra",
    "Vận chuyển & đổi trả",
    "Chính sách giao hàng và đổi trả.",
  );
}

export default async function ShippingPage() {
  const settings = await fetchShopSettings();

  return (
    <ContentShell
      title="Vận chuyển & đổi trả"
      subtitle="Giao nội thành, toàn quốc và đổi size khi còn tem mác."
      crumbs={[{ label: "Vận chuyển & đổi trả" }]}
    >
      <h2>Vận chuyển</h2>
      <p>
        Nội thành <strong>{settings.shipDaysInner}</strong> · Toàn quốc{" "}
        <strong>{settings.shipDaysNation}</strong>. {freeShipLabel(settings.freeshipFrom)}
        {settings.shipFee > 0 && settings.freeshipFrom > 0
          ? `, phí ship ${formatVnd(settings.shipFee)} nếu đơn chưa đủ mốc.`
          : "."}
      </p>
      <ProductCopy value={settings.policyShipping} />
      <h2>Đổi trả</h2>
      <ProductCopy value={settings.policyReturn} />
    </ContentShell>
  );
}
