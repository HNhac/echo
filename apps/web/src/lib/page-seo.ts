import type { Metadata } from "next";
import { SEO_NOINDEX_IDS } from "@echo/shared";
import { brandPageTitle } from "@/config/brand";
import { getSiteUrl } from "@/lib/site";
import { fetchSeoPage } from "@/lib/store-api";

export async function metadataForPage(
  id: string,
  fallbackTitle: string,
  fallbackDescription: string,
): Promise<Metadata> {
  const page = await fetchSeoPage(id);
  const title = page?.title?.trim() || brandPageTitle(fallbackTitle);
  const description = page?.description?.trim() || fallbackDescription;
  const keywords = page?.keywords
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const path = page?.path || (id === "home" ? "/" : `/${id}`);
  const noindex = SEO_NOINDEX_IDS.has(id);

  return {
    title,
    description,
    keywords: keywords?.length ? keywords : undefined,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      url: `${getSiteUrl()}${path}`,
      title,
      description,
      locale: "vi_VN",
      siteName: "ECHO",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
