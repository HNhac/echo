import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { brandPageTitle } from "@/config/brand";

export const metadata: Metadata = {
  title: brandPageTitle("Lookbook"),
  description: "Gợi ý mặc cho bé gái — ECHO.",
};

const shots = [
  { src: "https://images.unsplash.com/photo-1471286174890-9c00182169d7?w=900&q=80", title: "Váy nắng hồng" },
  { src: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900&q=80", title: "Set đi chơi" },
  { src: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=900&q=80", title: "Đầm tiệc nhỏ" },
  { src: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=900&q=80", title: "Áo họa nhi" },
  { src: "https://images.unsplash.com/photo-1476234251651-f353703a034d?w=900&q=80", title: "Nắng sân nhà" },
  { src: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=900&q=80", title: "Nơ & tất" },
];

export default function LookbookPage() {
  return (
    <div className="bg-[var(--surface)]">
      <div className="shop-wrap py-12 sm:py-16">
        <nav className="text-center text-sm text-[var(--ink-muted)]">
          <Link href="/" className="hover:text-[var(--ink)]">
            Trang chủ
          </Link>
          <span className="mx-2 text-[var(--ink-faint)]">/</span>
          <span className="text-[var(--ink)]">Lookbook</span>
        </nav>
        <div className="section-head mt-8">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[var(--ink)] sm:text-5xl">
            Lookbook
          </h1>
          <p className="mt-3 text-[var(--ink-muted)]">
            Gợi ý mặc cho bé — váy, set và phụ kiện.
          </p>
          <Link href="/san-pham" className="btn-primary mt-6">
            Mua theo look
          </Link>
        </div>
        <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {shots.map((shot, i) => (
            <Link
              key={shot.src}
              href="/san-pham"
              className={`group relative mb-4 block break-inside-avoid overflow-hidden rounded-[1.35rem] bg-[var(--surface-2)] ${
                i % 3 === 0 ? "aspect-[3/4]" : "aspect-[4/5]"
              }`}
            >
              <Image
                src={shot.src}
                alt={shot.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/55 via-transparent to-transparent" />
              <p className="absolute inset-x-0 bottom-4 text-center font-serif text-lg text-white">
                {shot.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
