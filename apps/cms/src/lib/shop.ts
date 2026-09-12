export function shopOrigin() {
  const env = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (env) return env;
  if (typeof window !== "undefined") {
    const { hostname, port, protocol } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      const shopPort = port === "3011" ? "3010" : port === "3001" ? "3000" : "3010";
      return `${protocol}//${hostname}:${shopPort}`;
    }
    if (hostname.startsWith("cms.")) return `${protocol}//${hostname.slice(4)}`;
  }
  return "https://echothuvui.vn";
}

export function shopProductUrl(slug: string) {
  const path = `/san-pham/${encodeURIComponent(slug)}`;
  return `${shopOrigin()}${path}`;
}
