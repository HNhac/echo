"use client";

import { useEffect, useState } from "react";
import type { SeoPage } from "@echo/shared";

type Props = {
  pages: SeoPage[];
  busy: boolean;
  onSave: (id: string, patch: Pick<SeoPage, "title" | "description" | "keywords">) => Promise<void>;
};

export function SeoView({ pages, busy, onSave }: Props) {
  const [drafts, setDrafts] = useState<Record<string, SeoPage>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    setDrafts((cur) => {
      const next = { ...cur };
      for (const page of pages) {
        if (!next[page.id]) next[page.id] = page;
      }
      return next;
    });
  }, [pages]);

  function draftOf(page: SeoPage): SeoPage {
    return drafts[page.id] ?? page;
  }

  function patch(id: string, field: "title" | "description" | "keywords", value: string) {
    setDrafts((cur) => ({
      ...cur,
      [id]: { ...(cur[id] ?? pages.find((p) => p.id === id)!), [field]: value },
    }));
  }

  async function save(page: SeoPage) {
    const draft = draftOf(page);
    setSaving(page.id);
    setNote("");
    try {
      await onSave(page.id, {
        title: draft.title,
        description: draft.description,
        keywords: draft.keywords,
      });
      setDrafts((cur) => ({ ...cur, [page.id]: draft }));
      setNote(`Đã lưu SEO “${page.name}”.`);
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Không lưu được.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="stack">
      <p className="muted">
        Title, mô tả và từ khóa Google cho từng trang shop. Trang sản phẩm chỉnh thêm SEO trong form
        sản phẩm.
      </p>
      {note ? <p className="alert">{note}</p> : null}
      <div className="seo-grid">
        {pages.map((page) => {
          const draft = draftOf(page);
          return (
            <article key={page.id} className="seo-card">
              <header className="seo-card__head">
                <div>
                  <h3>{page.name}</h3>
                  <p className="muted tiny">{page.path}</p>
                </div>
                <button
                  type="button"
                  className="btn"
                  disabled={busy || saving === page.id}
                  onClick={() => void save(page)}
                >
                  {saving === page.id ? "Đang lưu…" : "Lưu"}
                </button>
              </header>
              <label className="field">
                <span>Title ({draft.title.length}/60)</span>
                <input
                  value={draft.title}
                  onChange={(e) => patch(page.id, "title", e.target.value)}
                />
              </label>
              <label className="field">
                <span>Mô tả ({draft.description.length}/160)</span>
                <textarea
                  rows={3}
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
            </article>
          );
        })}
      </div>
    </div>
  );
}
