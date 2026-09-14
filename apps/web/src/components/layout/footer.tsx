import { ShopLink as Link } from "@/components/store/shop-link";
import { brand } from "@/config/brand";
import { BrandMark } from "@/components/layout/brand-mark";
import { Phone, RefreshCcw, Ruler, Sparkles, Truck } from "lucide-react";
import { FacebookIcon } from "@/components/icons/facebook-icon";
import { telHref } from "@echo/shared";

const NOTE_ICONS = [Truck, RefreshCcw, Ruler, Sparkles];

const cols = [
  {
    title: "Cửa hàng",
    links: [
      { href: "/san-pham", label: "Tất cả sản phẩm" },
      { href: "/bo-suu-tap", label: "Bộ sưu tập" },
      { href: "/qua-tang", label: "Quà tặng" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { href: "/van-chuyen-doi-tra", label: "Vận chuyển & đổi trả" },
      { href: "/huong-dan-size", label: "Hướng dẫn size" },
      { href: "/lien-he", label: "Liên hệ" },
      { href: "/tai-khoan", label: "Tài khoản" },
    ],
  },
  {
    title: "ECHO",
    links: [
      { href: "/cau-chuyen", label: "Câu chuyện" },
      { href: "/dieu-khoan", label: "Điều khoản" },
      { href: "/bao-mat", label: "Bảo mật" },
    ],
  },
];

export function Footer({
  notes = [],
  phone,
  facebook,
}: {
  notes?: string[];
  phone?: string;
  facebook?: string;
}) {
  const year = new Date().getFullYear();

  return (
    <footer id="about" className="shop-footer">
      <div className="shop-wrap py-8 sm:py-9">
        <div className="grid gap-7 lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block text-[1.25rem]" aria-label={`${brand.name} — về trang chủ`}>
              <BrandMark />
            </Link>
            <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-[var(--ink-muted)]">
              Thời trang bé gái 1–10 tuổi. Vải mềm, form dễ mặc, size 90–140.
            </p>
            {notes.length ? (
              <ul className="mt-3.5 flex flex-wrap gap-1.5">
                {notes.map((label, i) => {
                  const Icon = NOTE_ICONS[i % NOTE_ICONS.length];
                  return (
                    <li key={`${label}-${i}`} className="shop-footer__chip text-[11px]">
                      <Icon className="h-3.5 w-3.5 text-[var(--accent)]" strokeWidth={1.7} />
                      {label}
                    </li>
                  );
                })}
              </ul>
            ) : null}
            {phone || facebook ? (
              <div className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
                {phone ? (
                  <a
                    href={telHref(phone)}
                    className="inline-flex items-center gap-1.5 text-[var(--ink-muted)] transition-colors hover:text-[var(--accent)]"
                  >
                    <Phone className="h-3.5 w-3.5 text-[var(--accent)]" strokeWidth={1.7} />
                    {phone}
                  </a>
                ) : null}
                {facebook ? (
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[var(--ink-muted)] transition-colors hover:text-[var(--accent)]"
                  >
                    <FacebookIcon className="h-3.5 w-3.5 text-[var(--accent)]" />
                    Facebook
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:col-span-8">
            {cols.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                  {col.title}
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[var(--ink-muted)] transition-colors hover:text-[var(--accent)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-2.5 border-t border-[var(--border)] pt-4 text-xs text-[var(--ink-faint)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {brand.name}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/dieu-khoan" className="transition-colors hover:text-[var(--ink)]">
              Điều khoản
            </Link>
            <Link href="/bao-mat" className="transition-colors hover:text-[var(--ink)]">
              Bảo mật
            </Link>
            <a href="#top" className="transition-colors hover:text-[var(--ink)]">
              Lên đầu trang
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
