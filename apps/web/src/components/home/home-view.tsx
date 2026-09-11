import type { HomeCatalog } from "@echo/shared";
import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { Categories } from "@/components/home/categories";
import { FlashPicksRails } from "@/components/home/flash-picks-rails";
import { FeaturedProducts } from "@/components/home/featured";
import { FeaturedLooksCarousel } from "@/components/home/featured-looks-carousel";
import { DesignManifesto } from "@/components/home/design-manifesto";
import { StudioFilm } from "@/components/home/studio-film";
import { EditorialStrip } from "@/components/home/editorial-strip";
import { Newsletter } from "@/components/home/newsletter";
import { mediaUrl } from "@/lib/media";

export function HomeView({ catalog }: { catalog: HomeCatalog }) {
  const featured = catalog.featured.length ? catalog.featured : catalog.looks.slice(0, 8);
  const poster = mediaUrl(catalog.looks[0]?.image ?? "");

  return (
    <>
      <Hero products={catalog.looks} />
      <TrustStrip />
      <Categories categories={catalog.categories} />
      <FlashPicksRails flash={catalog.flash} picks={catalog.picks} />
      <FeaturedProducts products={featured} />
      <FeaturedLooksCarousel products={catalog.looks} />
      <DesignManifesto />
      <StudioFilm posterSrc={poster} />
      <EditorialStrip cover={catalog.looks[0]} />
      <Newsletter />
    </>
  );
}
