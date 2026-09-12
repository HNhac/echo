const ALLOWED = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "del",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "hr",
  "a",
  "img",
]);

export function sanitizeHref(value: string | undefined) {
  const href = (value ?? "").trim();
  if (!href || /javascript:/i.test(href) || /data:/i.test(href)) return "";
  if (/^https?:\/\//i.test(href) || href.startsWith("/") || href.startsWith("mailto:")) return href;
  return "";
}

export function sanitizeMediaSrc(value: string | undefined) {
  const src = (value ?? "").trim();
  if (!src || /javascript:/i.test(src) || /^file:/i.test(src)) return "";
  if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml)/i.test(src)) return src;
  if (/^https?:\/\//i.test(src) || src.startsWith("/")) return src;
  return "";
}

function decodeAttr(value: string | undefined) {
  return (value ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function descriptionPlain(value: string | undefined) {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

export function sanitizeProductHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (full, tag, attrs) => {
      const name = String(tag).toLowerCase();
      const closing = full.startsWith("</");
      if (name === "h1") return closing ? "</h2>" : "<h2>";
      if (name === "h5" || name === "h6") return closing ? "</h4>" : "<h4>";
      if (name === "a") {
        if (closing) return "</a>";
        const raw = String(attrs ?? "").match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
        const href = sanitizeHref(raw?.[2] ?? raw?.[3] ?? raw?.[4]);
        return href ? `<a href="${escapeHtml(href)}">` : "";
      }
      if (name === "img") {
        if (closing) return "";
        const srcRaw = String(attrs ?? "").match(/src\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
        const altRaw = String(attrs ?? "").match(/alt\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
        const src = sanitizeMediaSrc(decodeAttr(srcRaw?.[2] ?? srcRaw?.[3] ?? srcRaw?.[4]));
        const alt = decodeAttr(altRaw?.[2] ?? altRaw?.[3] ?? altRaw?.[4]);
        if (src) return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />`;
        return alt;
      }
      if (!ALLOWED.has(name)) return "";
      if (name === "br") return "<br />";
      if (name === "hr") return "<hr />";
      return closing ? `</${name}>` : `<${name}>`;
    });
}

export function pastedPlainToHtml(text: string) {
  return text
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function descriptionToHtml(value: string | undefined) {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  const html = looksLikeHtml(raw)
    ? sanitizeProductHtml(raw)
    : raw
        .split(/\n{2,}/)
        .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
        .join("");
  return descriptionPlain(html) || /<img\b/i.test(html) ? html : "";
}
