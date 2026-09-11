import type { MetadataRoute } from "next";
import { SEO_NOINDEX_IDS, SEO_PAGE_SEEDS } from "@echo/shared";
import { getSiteUrl } from "@/lib/site";
import { fetchProducts } from "@/lib/store-api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const products = await fetchProducts();
  const pages: MetadataRoute.Sitemap = SEO_PAGE_SEEDS.filter((page) => !SEO_NOINDEX_IDS.has(page.id)).map(
    (page) => ({
      url: `${base}${page.path}`,
      changeFrequency: page.id === "home" ? "daily" : "weekly",
      priority: page.id === "home" ? 1 : page.id === "san-pham" ? 0.9 : 0.6,
    }),
  );

  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}/san-pham/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...pages, ...productUrls];
}
