import type { ShopStory } from "@echo/shared";
import { ContentShell } from "@/components/layout/content-shell";
import { ProductCopy } from "@/components/product/product-copy";

export function StoryView({ story }: { story: ShopStory }) {
  return (
    <ContentShell title={story.title} subtitle={story.subtitle} crumbs={[{ label: "Câu chuyện" }]}>
      <ProductCopy value={story.body} />
    </ContentShell>
  );
}
