"use client";

import { useEffect } from "react";
import { seasonOverlaySrc, type SeasonThemeId, type ShopSettings } from "@echo/shared";
import { mediaUrl } from "@/lib/media";

function overlayUrl(src: string) {
  if (!src) return "";
  if (src.startsWith("/seasons/")) return src;
  return mediaUrl(src);
}

export function SeasonTheme({
  theme,
  overlays,
  shared,
}: {
  theme: SeasonThemeId;
  overlays?: ShopSettings["seasonOverlays"];
  shared?: string;
}) {
  const src = overlayUrl(seasonOverlaySrc(theme, overlays, shared));

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "default") delete root.dataset.season;
    else root.dataset.season = theme;
    return () => {
      delete root.dataset.season;
    };
  }, [theme]);

  if (!src) return null;

  return (
    <div
      aria-hidden
      className="season-bg"
      style={{ backgroundImage: `url("${src}")` }}
    />
  );
}
