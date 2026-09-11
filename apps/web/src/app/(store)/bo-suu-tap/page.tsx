import type { Metadata } from "next";
import { CollectionView } from "@/components/store/collection-view";
import { fetchHomeCatalog } from "@/lib/store-api";
import { metadataForPage } from "@/lib/page-seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForPage("bo-suu-tap", "Bộ sưu tập", "Váy nắng hè cho bé gái — size 90–140.");
}

export default async function CollectionPage() {
  const catalog = await fetchHomeCatalog();
  return <CollectionView catalog={catalog} />;
}
