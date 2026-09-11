import { ShopLink as Link } from "@/components/store/shop-link";

type Breadcrumb = { label: string; href?: string };

type Props = {
  title: string;
  subtitle?: string;
  crumbs?: Breadcrumb[];
  children: React.ReactNode;
};

export function ContentShell({ title, subtitle, crumbs, children }: Props) {
  return (
    <div className="bg-[var(--surface)]">
      <div className="shop-wrap max-w-3xl py-12 sm:py-16">
        {crumbs?.length ? (
          <nav aria-label="Breadcrumb" className="text-sm text-[var(--ink-muted)]">
            <Link href="/" className="hover:text-[var(--ink)]">
              Trang chủ
            </Link>
            {crumbs.map((c) => (
              <span key={c.label}>
                <span className="mx-2 text-[var(--ink-faint)]">/</span>
                {c.href ? (
                  <Link href={c.href} className="hover:text-[var(--ink)]">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-[var(--ink)]">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="mt-6 font-serif text-3xl font-medium tracking-tight text-[var(--ink)] sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 max-w-xl text-[var(--ink-muted)] leading-relaxed">
            {subtitle}
          </p>
        ) : null}
        <div className="mt-10 h-px w-16 bg-[var(--accent)]" />
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--ink-muted)] [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-[var(--ink)] [&_h3]:mt-8 [&_h3]:font-semibold [&_h3]:text-[var(--ink)] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_strong]:text-[var(--ink)] [&_a]:text-[var(--accent)] [&_a]:underline-offset-4 hover:[&_a]:underline">
          {children}
        </div>
      </div>
    </div>
  );
}
