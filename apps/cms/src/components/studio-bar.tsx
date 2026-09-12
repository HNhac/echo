"use client";

import { useEffect, useRef, useState } from "react";
import { ROLE_LABELS, type StaffPublic } from "@echo/shared";
import { ThemeToggle } from "@/components/theme-toggle";
import { IconLogout, IconUser } from "@/components/icons";

function formatNow(now: Date) {
  const date = new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now);
  const time = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  return { date, time };
}

export function StudioBar({ me, onLogout }: { me: StaffPublic; onLogout: () => void }) {
  const [now, setNow] = useState(() => formatNow(new Date()));
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => setNow(formatNow(new Date()));
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = me.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="studio-bar">
      <p className="studio-bar__clock">
        <strong>{now.time}</strong>
        <span>{now.date}</span>
      </p>
      <ThemeToggle className="studio-bar__btn" />
      <div className="studio-bar__menu" ref={box}>
        <button
          type="button"
          className={`studio-bar__btn studio-bar__account${open ? " is-on" : ""}`}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Tài khoản"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="studio-bar__avatar" aria-hidden>
            {initials || <IconUser />}
          </span>
          <span className="studio-bar__user">
            <strong>{me.username}</strong>
            <em>{ROLE_LABELS[me.role]}</em>
          </span>
        </button>
        {open ? (
          <div className="studio-bar__drop" role="menu">
            <div className="studio-bar__who">
              <strong>{me.name}</strong>
              <span>{ROLE_LABELS[me.role]}</span>
            </div>
            <button type="button" role="menuitem" onClick={onLogout}>
              <IconLogout /> Đăng xuất
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
