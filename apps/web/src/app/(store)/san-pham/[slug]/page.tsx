import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brandPageTitle } from "@/config/brand";
import { ProductDetailPanel } from "@/components/product/product-detail-panel";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { fetchProductBySlug, fetchProducts } from "@/lib/store-api";
import { mediaUrl } from "@/lib/media";
import { descriptionPlain } from "@/data/catalog";
import { suggestProductSeo } from "@echo/shared";
import { absoluteUrl, getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: brandPageTitle("Không tìm thấy") };
  const suggested = suggestProductSeo({
    name: product.name,
    category: product.category,
    colors: product.colors,
    sizes: product.sizes,
    description: product.description,
  });
  const title = product.seoTitle?.trim() || suggested.seoTitle || brandPageTitle(product.name);
  const description =
    product.seoDescription?.trim() || suggested.seoDescription || descriptionPlain(product.description);
  const keywords = (product.seoKeywords || suggested.seoKeywords)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const url = `${getSiteUrl()}/san-pham/${product.slug}`;
  const image = mediaUrl(product.image);
  return {
    title,
    description,
    keywords: keywords?.length ? keywords : undefined,
    alternates: { canonical: `/san-pham/${product.slug}` },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const related = await fetchProducts({
    category: product.categorySlug,
    exclude: product.slug,
    limit: 4,
  });
  const more =
    related.length > 0
      ? related
      : await fetchProducts({
          exclude: product.slug,
          limit: 4,
        });

  const image = mediaUrl(product.image);

  return (
    <div className="bg-[var(--surface)]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.seoDescription?.trim() || descriptionPlain(product.description),
          image: image ? absoluteUrl(image) : undefined,
          sku: product.slug,
          brand: { "@type": "Brand", name: "ECHO" },
          offers: {
            "@type": "Offer",
            url: absoluteUrl(`/san-pham/${product.slug}`),
            priceCurrency: "VND",
            price: product.price,
            availability: "https://schema.org/InStock",
          },
        }}
      />
      <div className="shop-wrap py-8 sm:py-12">
        <Reveal>
          <ProductDetailPanel product={product} />
        </Reveal>

        {more.length ? (
          <section className="mt-16 border-t border-[var(--border)] pt-12">
            <h2 className="font-serif text-2xl font-medium tracking-tight text-[var(--ink)] sm:text-3xl">
              Cùng danh mục
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {more.map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i, 7) * 0.05}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
