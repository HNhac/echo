import type { Metadata } from "next";
import { categories, type CategorySlug } from "@/data/catalog";
import { ShopView } from "@/components/store/shop-view";
import { fetchProducts } from "@/lib/store-api";
import { metadataForPage } from "@/lib/page-seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForPage("san-pham", "Cửa hàng", "Váy đầm, set bộ, áo và phụ kiện bé gái — size 90–140.");
}

type Search = { "danh-muc"?: string };

function isCategorySlug(v: string | undefined): v is CategorySlug {
  return categories.some((c) => c.slug === v);
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const categorySlug = isCategorySlug(sp["danh-muc"]) ? sp["danh-muc"] : undefined;
  const products = await fetchProducts({ category: categorySlug });

  return <ShopView products={products} categorySlug={categorySlug} />;
}
