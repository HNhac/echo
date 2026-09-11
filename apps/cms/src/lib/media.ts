import { isUploadPath } from "@echo/shared";

export function cmsMediaUrl(src: string) {
  if (!isUploadPath(src)) return "";
  const pub = process.env.NEXT_PUBLIC_API_URL;
  if (pub && /^https?:\/\//i.test(pub)) {
    return `${pub.replace(/\/$/, "")}${src}`;
  }
  return src;
}
