import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brandPageTitle } from "@/config/brand";
import { products } from "@/data/catalog";
import { ProductDetailPanel } from "@/components/product/product-detail-panel";
import { ProductCard } from "@/components/product/product-card";
import { fetchProductBySlug, fetchProducts } from "@/lib/store-api";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: brandPageTitle("Không tìm thấy") };
  return {
    title: brandPageTitle(product.name),
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const catalog = await fetchProducts();
  const product = catalog.find((p) => p.slug === slug);
  if (!product) notFound();

  const related = catalog
    .filter((p) => p.categorySlug === product.categorySlug && p.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="bg-[var(--surface)]">
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
