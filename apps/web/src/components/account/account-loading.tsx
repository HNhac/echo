export function AccountLoading() {
  return (
    <div className="bg-[var(--surface)]">
      <div className="shop-wrap py-6 sm:py-8">
        <div className="h-12 animate-pulse rounded-2xl bg-[var(--surface-2)]" />
        <div className="mt-5 grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <div className="h-52 animate-pulse rounded-2xl bg-[var(--surface-2)]" />
          <div className="h-52 animate-pulse rounded-2xl bg-[var(--surface-2)]" />
        </div>
      </div>
    </div>
  );
}
