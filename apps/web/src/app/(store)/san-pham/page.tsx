import type { Metadata } from "next";
import { ShopView } from "@/components/store/shop-view";
import { fetchCategories, fetchProducts } from "@/lib/store-api";
import { metadataForPage } from "@/lib/page-seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForPage("san-pham", "Cửa hàng", "Váy đầm, set bộ, áo và phụ kiện bé gái — size 90–140.");
}

type Search = { "danh-muc"?: string };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const categories = await fetchCategories();
  const raw = sp["danh-muc"];
  const categorySlug = categories.some((c) => c.slug === raw) ? raw : undefined;
  const products = await fetchProducts();

  return <ShopView products={products} categories={categories} categorySlug={categorySlug} />;
}
