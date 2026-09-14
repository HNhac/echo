import type { Tab } from "@/lib/studio";

function Bone({ className = "" }: { className?: string }) {
  return <span className={`sk ${className}`.trim()} aria-hidden />;
}

function StatBones({ count }: { count: number }) {
  return (
    <section className="stats">
      {Array.from({ length: count }, (_, i) => (
        <article key={i} className="stat">
          <Bone className="sk--label" />
          <Bone className="sk--num" />
        </article>
      ))}
    </section>
  );
}

function OrdersBones() {
  return (
    <div className="stack">
      <div className="chips">
        <Bone className="sk--chip" />
        <Bone className="sk--chip" />
        <Bone className="sk--chip" />
        <Bone className="sk--chip" />
        <Bone className="sk--chip" />
      </div>
      <div className="table-wrap sk-table">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="sk-row">
            <Bone className="sk--line sk--w-40" />
            <Bone className="sk--line sk--w-55" />
            <Bone className="sk--line sk--w-35" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductBones() {
  return (
    <div className="stack">
      <div className="toolbar">
        <Bone className="sk--search" />
        <Bone className="sk--btn" />
      </div>
      <div className="table-wrap sk-table">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="sk-row">
            <Bone className="sk--line sk--w-55" />
            <Bone className="sk--line sk--w-35" />
            <Bone className="sk--line sk--w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SeoBones() {
  return (
    <div className="seo-studio">
      <Bone className="sk--hint" />
      <div className="seo-studio__body">
        <div className="seo-studio__nav">
          {Array.from({ length: 6 }, (_, i) => (
            <Bone key={i} className="sk--line" />
          ))}
        </div>
        <article className="seo-studio__edit">
          <Bone className="sk--line sk--w-40" />
          <Bone className="sk--field" />
          <Bone className="sk--area" />
          <Bone className="sk--field" />
        </article>
      </div>
    </div>
  );
}

function UserBones() {
  return (
    <div className="stack">
      <div className="toolbar">
        <Bone className="sk--search" />
        <Bone className="sk--btn" />
      </div>
      <div className="table-wrap sk-table">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="sk-row">
            <Bone className="sk--line sk--w-40" />
            <Bone className="sk--line sk--w-35" />
            <Bone className="sk--line sk--w-55" />
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewBones() {
  return (
    <div className="stack">
      <StatBones count={4} />
      <div className="dash-grid">
        <article className="dash-card">
          <Bone className="sk--line sk--w-40" />
          <Bone className="sk--line sk--w-70" />
          <Bone className="sk--line sk--w-55" />
        </article>
        <article className="dash-card">
          <Bone className="sk--line sk--w-35" />
          <Bone className="sk--line sk--w-55" />
          <Bone className="sk--line sk--w-45" />
        </article>
      </div>
    </div>
  );
}

export function TabSkeleton({ kind }: { kind: Tab }) {
  if (kind === "overview") {
    return (
      <div aria-busy="true" aria-label="Đang tải">
        <OverviewBones />
      </div>
    );
  }
  return (
    <div aria-busy="true" aria-label="Đang tải">
      {kind === "products" || kind === "banners" ? null : (
        <StatBones count={kind === "orders" || kind === "users" || kind === "customers" ? 3 : 1} />
      )}
      {kind === "orders" ? <OrdersBones /> : null}
      {kind === "products" || kind === "banners" ? <ProductBones /> : null}
      {kind === "seo" ? <SeoBones /> : null}
      {kind === "host" ? (
        <div className="host-studio">
          <div className="host-hero">
            <div>
              <Bone className="sk--label" />
              <Bone className="sk--num" />
            </div>
            <article className="host-card">
              <Bone className="sk--label" />
              <Bone className="sk--num" />
            </article>
          </div>
          <div className="host-grid">
            {Array.from({ length: 6 }, (_, i) => (
              <article key={i} className="host-card">
                <Bone className="sk--label" />
                <Bone className="sk--num" />
              </article>
            ))}
          </div>
        </div>
      ) : null}
      {kind === "users" || kind === "customers" ? <UserBones /> : null}
    </div>
  );
}

export function StudioSkeleton() {
  return (
    <div className="studio" aria-busy="true" aria-label="Đang tải studio">
      <aside className="rail">
        <div className="brand">
          <span className="brand__mark sk sk--logo" aria-hidden />
          <span className="brand__logo">
            ECHO<span>Studio</span>
          </span>
        </div>
        <nav className="nav">
          <Bone className="sk--nav" />
          <Bone className="sk--nav" />
          <Bone className="sk--nav" />
          <Bone className="sk--nav" />
        </nav>
      </aside>
      <main className="canvas">
        <header className="canvas__head">
          <div>
            <Bone className="sk--label" />
            <Bone className="sk--title" />
          </div>
          <div className="studio-bar">
            <Bone className="sk--who" />
          </div>
        </header>
        <TabSkeleton kind="orders" />
      </main>
    </div>
  );
}
