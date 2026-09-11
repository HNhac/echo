import Link from "next/link";
import { brand } from "@/config/brand";
import { BrandMark } from "@/components/layout/brand-mark";

const cols = [
  {
    title: "Cửa hàng",
    links: [
      { href: "/san-pham", label: "Tất cả sản phẩm" },
      { href: "/bo-suu-tap", label: "Bộ sưu tập" },
      { href: "/lookbook", label: "Lookbook" },
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
];

export function Footer() {
  return (
    <footer id="about" className="relative z-[1] bg-[var(--ink)] text-[var(--surface)]">
      <div className="shop-wrap py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Link href="/" className="text-[1.6rem]">
              <BrandMark light />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
              Thời trang bé gái 1–10 tuổi. Váy đầm, set bộ, áo và phụ kiện — vải
              mềm, form dễ mặc, size 90–140.
            </p>
            <div className="mt-6 flex gap-2">
              {["IG", "TT", "YT"].map((s) => (
                <span
                  key={s}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[10px] font-bold tracking-wider text-white/80"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-4 lg:col-start-8">
            {cols.map((col) => (
              <div key={col.title}>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/70 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.name}
          </p>
          <div className="flex gap-6">
            <Link href="/dieu-khoan" className="hover:text-white/80">
              Điều khoản
            </Link>
            <Link href="/bao-mat" className="hover:text-white/80">
              Bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
