import { JsonLd } from "@/components/seo/json-ld";
import { HomeView } from "@/components/home/home-view";
import { fetchHomeCatalog } from "@/lib/store-api";
import { metadataForPage } from "@/lib/page-seo";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return metadataForPage(
    "home",
    "Thời trang bé gái",
    "Thời trang bé gái 1–10 tuổi — váy đầm, set bộ, áo và phụ kiện. Vải mềm, form dễ mặc, size 90–140.",
  );
}

export default async function Home() {
  const catalog = await fetchHomeCatalog();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "ECHO",
              url: getSiteUrl(),
              description: "Thời trang bé gái 1–10 tuổi — váy đầm, set bộ, áo và phụ kiện.",
            },
            {
              "@type": "WebSite",
              name: "ECHO",
              url: getSiteUrl(),
              inLanguage: "vi-VN",
              publisher: { "@type": "Organization", name: "ECHO", url: getSiteUrl() },
            },
          ],
        }}
      />
      <HomeView catalog={catalog} />
    </>
  );
}
