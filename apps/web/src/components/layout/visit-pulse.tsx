"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function VisitPulse() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    void fetch("/echo-api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
