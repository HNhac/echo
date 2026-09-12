import type { Metadata } from "next";
import { MarqueeStrip } from "@/components/home/marquee-strip";
import { StoryView } from "@/components/store/story-view";
import { brand } from "@/config/brand";
import { metadataForPage } from "@/lib/page-seo";
import { fetchShopStory } from "@/lib/store-api";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return metadataForPage(
    "cau-chuyen",
    "Câu chuyện",
    `${brand.name} — thời trang bé gái, vải mềm, size 90–140.`,
  );
}

export default async function StoryPage() {
  const story = await fetchShopStory();
  return (
    <>
      <MarqueeStrip />
      <StoryView story={story} />
    </>
  );
}
