"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

/** `prefetch={false}` must be a literal on next/link so Next does not preload other routes. */
export function ShopLink(props: Omit<ComponentProps<typeof Link>, "prefetch">) {
  return <Link {...props} prefetch={false} />;
}
