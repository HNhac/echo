import { ShopLink as Link } from "@/components/store/shop-link";
import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";
import { brand } from "@/config/brand";
import { metadataForPage } from "@/lib/page-seo";
import { fetchShopSettings } from "@/lib/store-api";
import { telHref } from "@echo/shared";
import { Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon } from "@/components/icons/facebook-icon";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return metadataForPage("lien-he", "Liên hệ", `Liên hệ ${brand.name}.`);
}

export default async function ContactPage() {
  const settings = await fetchShopSettings();

  return (
    <div className="bg-[var(--surface)]">
      <div className="shop-wrap py-12 sm:py-16">
        <nav className="text-sm text-[var(--ink-muted)]">
          <Link href="/" className="hover:text-[var(--ink)]">
            Trang chủ
          </Link>
          <span className="mx-2 text-[var(--ink-faint)]">/</span>
          <span className="text-[var(--ink)]">Liên hệ</span>
        </nav>
        <div className="mt-8 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h1 className="font-serif text-3xl font-medium tracking-tight text-[var(--ink)] sm:text-5xl">
              Liên hệ
            </h1>
            <p className="mt-4 max-w-md text-[var(--ink-muted)]">
              CSKH, hợp tác hoặc góp ý — gọi, nhắn Facebook hoặc để lại lời nhắn.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-[var(--ink-muted)]">
              {settings.cskhPhone ? (
                <li>
                  <a href={telHref(settings.cskhPhone)} className="flex items-center gap-3 hover:text-[var(--ink)]">
                    <Phone className="h-4 w-4 text-[var(--accent)]" />
                    {settings.cskhPhone}
                  </a>
                </li>
              ) : null}
              {settings.facebookUrl ? (
                <li>
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:text-[var(--ink)]"
                  >
                    <FacebookIcon className="h-4 w-4 text-[var(--accent)]" />
                    Facebook
                  </a>
                </li>
              ) : (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-[var(--accent)]" />
                  Để lời nhắn bên cạnh — shop sẽ trả lời sớm.
                </li>
              )}
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[var(--accent)]" />
                Giao toàn quốc
              </li>
            </ul>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-md)] lg:col-span-7 lg:p-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
