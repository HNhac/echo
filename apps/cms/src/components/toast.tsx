"use client";

import { useCallback, useState } from "react";

export type ToastKind = "ok" | "err";
export type ToastItem = { id: string; kind: ToastKind; text: string };

export function useToasts() {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((cur) => cur.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((kind: ToastKind, text: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setItems((cur) => [...cur.slice(-4), { id, kind, text }]);
    window.setTimeout(() => {
      setItems((cur) => cur.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  return {
    items,
    dismiss,
    push,
    ok: (text: string) => push("ok", text),
    err: (text: string) => push("err", text),
  };
}

export function ToastStack({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="toast-stack" aria-live="polite">
      {items.map((item) => (
        <p key={item.id} className={`toast toast--${item.kind}`} role="status">
          <strong>{item.kind === "ok" ? "Xong" : "Lỗi"}</strong>
          <span>{item.text}</span>
          <button type="button" className="toast__close" onClick={() => onDismiss(item.id)} aria-label="Đóng">
            ×
          </button>
        </p>
      ))}
    </div>
  );
}
