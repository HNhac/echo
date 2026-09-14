import type { Metadata } from "next";
import { ContentShell } from "@/components/layout/content-shell";
import { metadataForPage } from "@/lib/page-seo";
import { SizeGuideChart } from "@/components/product/size-guide-modal";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return metadataForPage("huong-dan-size", "Hướng dẫn size", "Bảng size bé gái 90–140.");
}

export default function SizeGuidePage() {
  return (
    <ContentShell
      title="Hướng dẫn size"
      subtitle="Đo chiều cao và cân nặng, rồi đối chiếu bảng. Form hơi rộng để bé vận động thoải mái."
      crumbs={[{ label: "Hướng dẫn size" }]}
    >
      <SizeGuideChart />
    </ContentShell>
  );
}
