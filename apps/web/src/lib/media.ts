export function mediaUrl(src: string) {
  if (!src) return src;
  if (!src.startsWith("/uploads/")) return src;
  const pub = process.env.NEXT_PUBLIC_API_URL;
  if (pub && /^https?:\/\//i.test(pub)) {
    return `${pub.replace(/\/$/, "")}${src}`;
  }
  return src;
}
