"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SHOP_STORY, type ShopStory } from "@echo/shared";
import { DescriptionEditor } from "@/components/description-editor";

type Props = {
  story: ShopStory;
  busy: boolean;
  onSave: (next: ShopStory) => Promise<boolean>;
};

export function StoryView({ story, busy, onSave }: Props) {
  const live = story ?? DEFAULT_SHOP_STORY;
  const [draft, setDraft] = useState<ShopStory>(live);

  useEffect(() => {
    setDraft(live);
  }, [live]);

  const dirty =
    draft.title !== live.title || draft.subtitle !== live.subtitle || draft.body !== live.body;

  return (
    <div className="stack">
      <p className="hint">
        Nội dung trang shop <strong>/cau-chuyen</strong>. Sửa ở đây, bấm Lưu — mở lại trang Câu chuyện
        trên cửa hàng để xem.
      </p>
      <label className="field">
        <span>Tiêu đề</span>
        <input
          value={draft.title}
          onChange={(e) => setDraft((cur) => ({ ...cur, title: e.target.value }))}
          placeholder="Câu chuyện ECHO"
        />
      </label>
      <label className="field">
        <span>Mô tả ngắn</span>
        <input
          value={draft.subtitle}
          onChange={(e) => setDraft((cur) => ({ ...cur, subtitle: e.target.value }))}
          placeholder="Shop váy áo cho bé gái…"
        />
      </label>
      <div className="drawer__desc">
        <p className="field-label">Nội dung</p>
        <DescriptionEditor
          value={draft.body}
          onChange={(body) => setDraft((cur) => ({ ...cur, body }))}
        />
      </div>
      <div className="season-save">
        <button type="button" className="btn" disabled={busy || !dirty} onClick={() => void onSave(draft)}>
          {busy ? "Đang lưu…" : "Lưu câu chuyện"}
        </button>
        <p className="muted tiny">{dirty ? "Chưa lưu thay đổi." : "Không có thay đổi."}</p>
      </div>
    </div>
  );
}
