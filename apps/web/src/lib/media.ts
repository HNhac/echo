import { uploadVariant, type MediaSize } from "@echo/shared";

export function mediaUrl(src: string, size: MediaSize = "full") {
  const path = uploadVariant(src, size);
  if (!path) return "";
  const pub = process.env.NEXT_PUBLIC_API_URL;
  if (pub && /^https?:\/\//i.test(pub)) {
    return `${pub.replace(/\/$/, "")}${path}`;
  }
  return path;
}
