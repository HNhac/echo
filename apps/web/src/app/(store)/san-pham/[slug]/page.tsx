import { ShopLink as Link } from "@/components/store/shop-link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brandPageTitle } from "@/config/brand";
import { ProductDetailPanel } from "@/components/product/product-detail-panel";
import { ProductCard } from "@/components/product/product-card";
import { JsonLd } from "@/components/seo/json-ld";
import { fetchProductBySlug, fetchProducts } from "@/lib/store-api";
import { mediaUrl } from "@/lib/media";
import { absoluteUrl, getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: brandPageTitle("Không tìm thấy") };
  const title = product.seoTitle?.trim() || brandPageTitle(product.name);
  const description = product.seoDescription?.trim() || product.description;
  const keywords = product.seoKeywords
    ?.split(",")
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

  const image = mediaUrl(product.image);

  return (
    <div className="bg-[var(--surface)]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.seoDescription?.trim() || product.description,
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
      <div className="shop-wrap py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--ink-muted)]">
          <Link href="/" className="hover:text-[var(--ink)]">
            Trang chủ
          </Link>
          <span className="mx-2 text-[var(--ink-faint)]">/</span>
          <Link href="/san-pham" className="hover:text-[var(--ink)]">
            Cửa hàng
          </Link>
          <span className="mx-2 text-[var(--ink-faint)]">/</span>
          <span className="line-clamp-1 text-[var(--ink)]">{product.name}</span>
        </nav>

        <div className="mt-10">
          <ProductDetailPanel product={product} />
        </div>

        {related.length ? (
          <section className="mt-20 border-t border-[var(--border)] pt-14">
            <h2 className="font-serif text-2xl font-medium tracking-tight text-[var(--ink)] sm:text-3xl">
              Cùng danh mục
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
