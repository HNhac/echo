import type { Metadata } from "next";
import { LookbookView } from "@/components/store/lookbook-view";
import { fetchHomeCatalog } from "@/lib/store-api";
import { metadataForPage } from "@/lib/page-seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForPage("lookbook", "Lookbook", "Gợi ý mặc cho bé gái — ECHO.");
}

export default async function LookbookPage() {
  const { looks } = await fetchHomeCatalog();
  return <LookbookView looks={looks} />;
}
