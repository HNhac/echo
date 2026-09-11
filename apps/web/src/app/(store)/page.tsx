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

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Categories />
      <FlashPicksRails />
      <FeaturedProducts />
      <FeaturedLooksCarousel />
      <DesignManifesto />
      <StudioFilm />
      <EditorialStrip />
      <Newsletter />
    </>
  );
}
