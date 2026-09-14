"use client";

import { useShopSettings } from "@/components/store/shop-settings-provider";
import { formatCskhPhone, telHref } from "@echo/shared";

export function ProductHotline() {
  const settings = useShopSettings();

  if (settings.cskhPhone) {
    return (
      <p className="mt-4 text-center text-sm text-[var(--ink-muted)]">
        Hotline CSKH:{" "}
        <a href={telHref(settings.cskhPhone)} className="font-semibold text-[var(--ink)] hover:text-[var(--accent)]">
          {formatCskhPhone(settings.cskhPhone)}
        </a>
        {settings.cskhHours ? ` (${settings.cskhHours})` : null}
      </p>
    );
  }

  if (settings.facebookUrl) {
    return (
      <p className="mt-4 text-center text-sm text-[var(--ink-muted)]">
        Hotline CSKH:{" "}
        <a
          href={settings.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--ink)] hover:text-[var(--accent)]"
        >
          Facebook
        </a>
      </p>
    );
  }

  return null;
}
