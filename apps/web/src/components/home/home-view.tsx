import type { HomeCatalog } from "@echo/shared";
import { Hero } from "@/components/home/hero";
import { HomeIntro } from "@/components/home/home-intro";
import { TrustStrip } from "@/components/home/trust-strip";
import { Categories } from "@/components/home/categories";
import { FlashPicksRails } from "@/components/home/flash-picks-rails";
import { FeaturedProducts } from "@/components/home/featured";
import { DesignManifesto } from "@/components/home/design-manifesto";
import { EditorialStrip } from "@/components/home/editorial-strip";
import { Reveal } from "@/components/motion/reveal";

export function HomeView({ catalog }: { catalog: HomeCatalog }) {
  const featured = catalog.featured.length ? catalog.featured : catalog.looks.slice(0, 8);
  const banners = catalog.banners ?? [];
  const cover = catalog.looks[0] ?? featured[0];

  return (
    <>
      {banners.length ? <Hero banners={banners} /> : <HomeIntro cover={cover} />}
      <Reveal>
        <TrustStrip />
      </Reveal>
      <Reveal>
        <Categories categories={catalog.categories} />
      </Reveal>
      <Reveal>
        <FlashPicksRails flash={catalog.flash} />
      </Reveal>
      <Reveal>
        <FeaturedProducts products={featured} />
      </Reveal>
      <Reveal>
        <DesignManifesto />
      </Reveal>
      <Reveal>
        <EditorialStrip cover={cover} />
      </Reveal>
    </>
  );
}
