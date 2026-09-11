const MESSAGES = [
  "Freeship đơn từ 500.000₫",
  "Đổi size 7 ngày",
  "Váy bé gái size 90–140",
];

export function AnnouncementBar() {
  return (
    <div className="relative z-[60] border-b border-[var(--border)] bg-[var(--surface-2)] text-[var(--ink)]">
      <div className="shop-wrap flex h-9 items-center justify-center text-[11px] font-medium tracking-wide sm:h-10 sm:text-xs">
        <p className="truncate text-center">
          {MESSAGES.map((m, i) => (
            <span key={m}>
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
