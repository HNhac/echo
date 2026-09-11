export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://echothuvui.vn").replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
