export function AnnouncementBar({ items }: { items: string[] }) {
  if (!items.length) return null;

  return (
    <div className="relative z-[60] border-b border-[var(--border)] bg-[var(--surface-2)] text-[var(--ink)]">
      <div className="shop-wrap flex h-9 items-center justify-center text-[11px] font-medium tracking-wide sm:h-10 sm:text-xs">
        <p className="truncate text-center">
          {items.map((m, i) => (
            <span key={`${m}-${i}`}>
              {i > 0 ? (
                <span className="mx-3 hidden text-[var(--accent)]/50 sm:inline">✦</span>
              ) : null}
              <span className={i === 0 ? "inline" : "hidden sm:inline"}>{m}</span>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
