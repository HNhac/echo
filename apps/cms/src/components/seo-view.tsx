"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SEO_DESC_MAX,
  SEO_NOINDEX_IDS,
  SEO_TITLE_MAX,
  applyDefaultPageSeo,
  googleSeoHints,
  pageSeoNeedsDefault,
  suggestPageSeo,
  type SeoPage,
} from "@echo/shared";
import { shopOrigin } from "@/lib/shop";

type Props = {
  pages: SeoPage[];
  busy: boolean;
  onSave: (id: string, patch: Pick<SeoPage, "title" | "description" | "keywords">) => Promise<void>;
};

function serpPath(origin: string, path: string) {
  try {
    const host = new URL(origin).host;
    if (path === "/") return host;
    return `${host} › ${path.replace(/^\//, "").replace(/\//g, " › ")}`;
  } catch {
    return path;
  }
}

export function SeoView({ pages, busy, onSave }: Props) {
  const [drafts, setDrafts] = useState<Record<string, SeoPage>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState<"public" | "private">("public");
  const [activeId, setActiveId] = useState(pages.find((p) => !SEO_NOINDEX_IDS.has(p.id))?.id ?? pages[0]?.id ?? "");

  const origin = shopOrigin();
  const sitemap = `${origin}/sitemap.xml`;

  useEffect(() => {
    setDrafts((cur) => {
      const next = { ...cur };
      for (const page of pages) {
        if (!next[page.id]) next[page.id] = pageSeoNeedsDefault(page) ? applyDefaultPageSeo(page) : page;
      }
      return next;
    });
    setActiveId((cur) => (pages.some((p) => p.id === cur) ? cur : pages[0]?.id ?? ""));
  }, [pages]);

  const publicPages = pages.filter((p) => !SEO_NOINDEX_IDS.has(p.id));
  const privatePages = pages.filter((p) => SEO_NOINDEX_IDS.has(p.id));
  const list = filter === "public" ? publicPages : privatePages;
  const page = pages.find((p) => p.id === activeId) ?? list[0] ?? pages[0];
  const draft = page ? (drafts[page.id] ?? page) : undefined;
  const suggested = draft ? suggestPageSeo(draft) : undefined;

  const hints = useMemo(() => {
    if (!draft) return [];
    return googleSeoHints({
      title: draft.title,
      description: draft.description,
      slug: draft.path.replace(/^\//, "") || "trang-chu",
    });
  }, [draft]);

  function patch(id: string, field: "title" | "description" | "keywords", value: string) {
    setDrafts((cur) => ({
      ...cur,
      [id]: { ...(cur[id] ?? pages.find((p) => p.id === id)!), [field]: value },
    }));
  }

  function applyDefault(target: SeoPage) {
    setDrafts((cur) => ({ ...cur, [target.id]: applyDefaultPageSeo(target) }));
  }

  async function save(target: SeoPage, next = draftOf(target)) {
    setSaving(target.id);
    setNote("");
    try {
      await onSave(target.id, {
        title: next.title,
        description: next.description,
        keywords: next.keywords,
      });
      setDrafts((cur) => ({ ...cur, [target.id]: next }));
      setNote(`Đã lưu SEO “${target.name}”.`);
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Không lưu được.");
    } finally {
      setSaving(null);
    }
  }

  function draftOf(target: SeoPage): SeoPage {
    return drafts[target.id] ?? target;
  }

  async function applyAllDefaults() {
    setNote("");
    try {
      for (const item of publicPages) {
        const next = applyDefaultPageSeo(item);
        setDrafts((cur) => ({ ...cur, [item.id]: next }));
        await onSave(item.id, {
          title: next.title,
          description: next.description,
          keywords: next.keywords,
        });
      }
      setNote(`Đã áp dụng SEO mặc định cho ${publicPages.length} trang công khai.`);
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Không lưu được.");
    }
  }

  if (!page || !draft || !suggested) {
    return <p className="hint">Chưa có trang SEO.</p>;
  }

  const dirty =
    draft.title !== page.title || draft.description !== page.description || draft.keywords !== page.keywords;
  const keywordChips = draft.keywords
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="seo-studio">
      <header className="seo-studio__intro">
        <div>
          <p className="hint">
            Title + mô tả dưới đây hiện trên Google. Shop mới chưa lên tìm kiếm ngay — vào{" "}
            <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer">
              Search Console
            </a>{" "}
            thêm domain rồi gửi{" "}
            <a href={sitemap} target="_blank" rel="noreferrer">
              sitemap.xml
            </a>
            . SEO từng món nằm trong form sản phẩm.
          </p>
        </div>
        <button type="button" className="ghost" disabled={busy || Boolean(saving)} onClick={() => void applyAllDefaults()}>
          Áp dụng mặc định mọi trang
        </button>
      </header>

      {note ? <p className="alert">{note}</p> : null}

      <div className="seo-studio__body">
        <nav className="seo-studio__nav" aria-label="Trang SEO">
          <div className="seo-studio__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={filter === "public"}
              className={filter === "public" ? "is-on" : undefined}
              onClick={() => {
                setFilter("public");
                setActiveId(publicPages[0]?.id ?? "");
              }}
            >
              Công khai
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === "private"}
              className={filter === "private" ? "is-on" : undefined}
              onClick={() => {
                setFilter("private");
                setActiveId(privatePages[0]?.id ?? "");
              }}
            >
              Không index
            </button>
          </div>
          <ul>
            {list.map((item) => {
              const row = draftOf(item);
              const weak = pageSeoNeedsDefault(row);
              const on = item.id === page.id;
              return (
                <li key={item.id}>
                  <button type="button" className={on ? "is-on" : undefined} onClick={() => setActiveId(item.id)}>
                    <span>{item.name}</span>
                    <small>{item.path}</small>
                    <i className={weak ? "is-warn" : "is-ok"} aria-label={weak ? "Thiếu SEO" : "Đủ SEO"} />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <section className="seo-studio__edit">
          <header className="seo-card__head">
            <div>
              <h3>{page.name}</h3>
              <p className="muted tiny">{origin}{page.path}</p>
            </div>
            <div className="seo-studio__actions">
              <button type="button" className="ghost" disabled={busy} onClick={() => applyDefault(page)}>
                Dùng mặc định
              </button>
              <button
                type="button"
                className="btn"
                disabled={busy || saving === page.id || !dirty}
                onClick={() => void save(page)}
              >
                {saving === page.id ? "Đang lưu…" : "Lưu trang"}
              </button>
            </div>
          </header>

          <div className="seo-studio__grid">
            <div className="seo-studio__fields">
              <label className="field">
                <span>
                  Title
                  <em className={draft.title.length > SEO_TITLE_MAX ? "seo-count is-over" : "seo-count"}>
                    {draft.title.length}/{SEO_TITLE_MAX}
                  </em>
                </span>
                <input value={draft.title} onChange={(e) => patch(page.id, "title", e.target.value)} />
              </label>
              <label className="field">
                <span>
                  Mô tả Google
                  <em className={draft.description.length > SEO_DESC_MAX ? "seo-count is-over" : "seo-count"}>
                    {draft.description.length}/{SEO_DESC_MAX}
                  </em>
                </span>
                <textarea
                  rows={4}
                  value={draft.description}
                  onChange={(e) => patch(page.id, "description", e.target.value)}
                />
              </label>
              <label className="field">
                <span>Từ khóa (phẩy)</span>
                <input
                  value={draft.keywords}
                  onChange={(e) => patch(page.id, "keywords", e.target.value)}
                  placeholder="váy bé gái, set bộ, ECHO"
                />
              </label>
              {keywordChips.length ? (
                <div className="seo-chips">
                  {keywordChips.map((chip) => (
                    <span key={chip} className="seo-chip">
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <aside className="seo-modal__preview">
              <p className="field-label">Xem trên Google</p>
              <div className="serp">
                <p className="serp__url">{serpPath(origin, page.path)}</p>
                <p className="serp__title">{draft.title.trim() || suggested.title || "Tiêu đề sẽ hiện ở đây"}</p>
                <p className="serp__desc">
                  {draft.description.trim() || suggested.description || "Mô tả ngắn hiện dưới title trên Google."}
                </p>
              </div>
              <ul className="seo-hints">
                {hints.map((hint) => (
                  <li key={hint.text} className={hint.ok ? "is-ok" : "is-warn"}>
                    {hint.text}
                  </li>
                ))}
                {SEO_NOINDEX_IDS.has(page.id) ? (
                  <li className="is-warn">Trang này noindex — Google không đưa vào kết quả tìm kiếm.</li>
                ) : (
                  <li className="is-ok">Trang công khai — có trong sitemap.</li>
                )}
              </ul>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
