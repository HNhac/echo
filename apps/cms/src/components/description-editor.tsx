"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import EmojiPicker, { Categories, EmojiStyle, Theme } from "emoji-picker-react";
import { descriptionToHtml } from "@echo/shared";
import { clipboardToHtml, normalizePastedHtml } from "@/lib/paste-html";

const EMOJI_CATEGORIES = [
  { category: Categories.SUGGESTED, name: "Hay dùng" },
  { category: Categories.SMILEYS_PEOPLE, name: "Mặt & người" },
  { category: Categories.ANIMALS_NATURE, name: "Động vật" },
  { category: Categories.FOOD_DRINK, name: "Đồ ăn" },
  { category: Categories.TRAVEL_PLACES, name: "Du lịch" },
  { category: Categories.ACTIVITIES, name: "Hoạt động" },
  { category: Categories.OBJECTS, name: "Đồ vật" },
  { category: Categories.SYMBOLS, name: "Ký hiệu" },
];

type Props = {
  value: string;
  onChange: (html: string) => void;
  className?: string;
};

function Tool({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: string;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      className={`desc-tool${active ? " is-on" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function DescriptionEditor({ value, onChange, className }: Props) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [emojiPos, setEmojiPos] = useState({ top: 0, left: 0 });
  const emojiWrap = useRef<HTMLDivElement>(null);
  const emojiPop = useRef<HTMLDivElement>(null);
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);

  function toggleEmoji(ev: React.MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    const box = emojiWrap.current?.getBoundingClientRect();
    if (box) {
      const width = 320;
      const height = 360;
      const left = Math.min(window.innerWidth - width - 12, Math.max(12, box.right - width));
      const top = box.bottom + 8 + height > window.innerHeight - 12
        ? Math.max(12, box.top - height - 8)
        : box.bottom + 8;
      setEmojiPos({ top, left });
    }
    setEmojiOpen((open) => !open);
  }
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: { class: "desc-inline-img" },
      }),
      Placeholder.configure({
        placeholder: "Chất liệu, form mặc, bảo quản… Enter để xuống dòng.",
      }),
    ],
    content: descriptionToHtml(value) || "<p></p>",
    onUpdate: ({ editor: next }) => onChange(next.getHTML()),
    editorProps: {
      attributes: {
        class: "desc-editor__canvas",
      },
      transformPastedHTML: (html) => normalizePastedHtml(html),
      handlePaste(_view, event) {
        const content = clipboardToHtml(
          event.clipboardData?.getData("text/html"),
          event.clipboardData?.getData("text/plain"),
        );
        if (!content) return false;
        event.preventDefault();
        editorRef.current?.chain().focus().insertContent(content).run();
        return true;
      },
    },
  });

  useEffect(() => {
    if (!emojiOpen) return;
    function onDoc(ev: MouseEvent) {
      const node = ev.target as Node;
      if (emojiWrap.current?.contains(node) || emojiPop.current?.contains(node)) return;
      setEmojiOpen(false);
    }
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") setEmojiOpen(false);
    }
    const timer = window.setTimeout(() => {
      document.addEventListener("mousedown", onDoc);
    }, 0);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [emojiOpen]);

  editorRef.current = editor;

  if (!editor) {
    return <div className="desc-editor__canvas desc-editor__canvas--boot" />;
  }

  const dark = typeof document !== "undefined" && document.documentElement.dataset.theme === "dark";

  return (
    <div className={className ? `desc-editor ${className}` : "desc-editor"}>
      <div className="desc-tools">
        <Tool title="Đoạn" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}>
          P
        </Tool>
        <Tool title="Tiêu đề" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </Tool>
        <Tool title="Phụ đề" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </Tool>
        <span className="desc-tools__gap" />
        <Tool title="Đậm" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          B
        </Tool>
        <Tool title="Nghiêng" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          I
        </Tool>
        <Tool title="Gạch chân" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          U
        </Tool>
        <Tool title="Gạch ngang" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          S
        </Tool>
        <span className="desc-tools__gap" />
        <Tool title="List" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          •
        </Tool>
        <Tool title="Số" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1.
        </Tool>
        <Tool title="Trích" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          “
        </Tool>
        <Tool title="Kẻ ngang" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          —
        </Tool>
        <div className="desc-emoji" ref={emojiWrap}>
          <button
            type="button"
            className={emojiOpen ? "desc-tool desc-tool--emoji is-on" : "desc-tool desc-tool--emoji"}
            title="Icon"
            aria-expanded={emojiOpen}
            aria-haspopup="dialog"
            onClick={toggleEmoji}
          >
            Icon
          </button>
        </div>
        {emojiOpen
          ? createPortal(
              <div
                ref={emojiPop}
                className="desc-emoji__pop"
                role="dialog"
                aria-label="Chọn icon"
                style={{ top: emojiPos.top, left: emojiPos.left }}
              >
                <EmojiPicker
                  width={320}
                  height={360}
                  lazyLoadEmojis
                  autoFocusSearch={false}
                  emojiStyle={EmojiStyle.NATIVE}
                  theme={dark ? Theme.DARK : Theme.LIGHT}
                  searchPlaceholder="Tìm icon…"
                  categories={EMOJI_CATEGORIES}
                  previewConfig={{ showPreview: false }}
                  onEmojiClick={(item) => {
                    editor.chain().focus().insertContent(item.emoji).run();
                    setEmojiOpen(false);
                  }}
                />
              </div>,
              document.body,
            )
          : null}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
