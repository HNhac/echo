import { escapeHtml, pastedPlainToHtml, sanitizeHref, sanitizeMediaSrc } from "@echo/shared";

const DROP = new Set(["script", "style", "noscript", "iframe", "object", "embed", "video", "audio", "meta", "link", "head"]);
const BLOCK = /<(p|h[1-6]|ul|ol|blockquote|hr|table|tr|img)\b/i;
const SKIP_WRAP = new Set(["html", "body", "fragment"]);

const ICON_GLYPH: Record<string, string> = {
  check: "✓",
  "check-circle": "✓",
  ok: "✓",
  tick: "✓",
  star: "★",
  heart: "♥",
  love: "♥",
  fire: "🔥",
  sparkle: "✨",
  sparkles: "✨",
  diamond: "◆",
  circle: "●",
  dot: "•",
  arrow: "→",
  "arrow-right": "→",
  plus: "+",
  minus: "–",
  close: "×",
  warning: "⚠",
  info: "ℹ",
  gift: "🎁",
  crown: "👑",
  flower: "✿",
  dress: "👗",
};

function styleOf(el: Element) {
  return `${el.getAttribute("style") ?? ""} ${el.getAttribute("class") ?? ""}`.toLowerCase();
}

function iconFromClass(el: Element) {
  const cls = `${el.getAttribute("class") ?? ""} ${el.getAttribute("data-icon") ?? ""}`.toLowerCase();
  if (!/(icon|fa-|emoji|glyph|material-icons)/.test(cls) && !el.getAttribute("data-icon")) return "";
  const aria = (el.getAttribute("aria-label") ?? el.getAttribute("title") ?? "").trim();
  if (aria) return aria;
  for (const [key, glyph] of Object.entries(ICON_GLYPH)) {
    if (cls.includes(key)) return glyph;
  }
  return "";
}

function wrapMarks(el: Element, inner: string) {
  if (!inner) return "";
  const tag = el.tagName.toLowerCase();
  const style = styleOf(el);
  let out = inner;
  if (tag !== "strong" && tag !== "b" && /font-weight\s*:\s*(bold|[6-9]00)/.test(style)) out = `<strong>${out}</strong>`;
  if (tag !== "em" && tag !== "i" && /font-style\s*:\s*italic/.test(style)) out = `<em>${out}</em>`;
  if (tag !== "u" && /text-decoration[^;]*underline/.test(style)) out = `<u>${out}</u>`;
  if (tag !== "s" && tag !== "strike" && tag !== "del" && /text-decoration[^;]*line-through/.test(style)) {
    out = `<s>${out}</s>`;
  }
  return out;
}

function serializeImg(el: Element) {
  const alt = (el.getAttribute("alt") ?? "").trim();
  const src = sanitizeMediaSrc(el.getAttribute("src") ?? undefined);
  if (src) return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />`;
  return alt;
}

function serializeSvg(el: Element) {
  const title = el.querySelector("title")?.textContent?.trim() ?? "";
  const clone = el.cloneNode(true) as Element;
  clone.querySelectorAll("script").forEach((node) => node.remove());
  const raw = clone.outerHTML.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  const src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(raw)))}`;
  return `<img src="${src}" alt="${escapeHtml(title)}" />`;
}

function serialize(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  if (DROP.has(tag)) return "";

  if (tag === "br") return "<br />";
  if (tag === "hr") return "<hr />";
  if (tag === "img") return serializeImg(el);
  if (tag === "svg") return serializeSvg(el);

  if (tag === "table") {
    const rows = "rows" in el ? Array.from((el as HTMLTableElement).rows) : [];
    return rows
      .map((row) => {
        const cells = Array.from(row.cells)
          .map((cell) => serialize(cell).replace(/<\/?p>/gi, "").trim())
          .filter(Boolean);
        return cells.length ? `<p>${cells.join(" — ")}</p>` : "";
      })
      .join("");
  }

  const inner = Array.from(el.childNodes).map(serialize).join("");
  if (!inner.trim()) {
    const icon = iconFromClass(el);
    if (icon) return icon;
  }
  const marked = wrapMarks(el, inner);

  if (/^h[1-6]$/.test(tag)) return marked.trim() ? `<p><strong>${marked}</strong></p>` : "";
  if (tag === "p") return `<p>${marked}</p>`;
  if (["strong", "b", "em", "i", "u", "s", "strike", "del", "ul", "ol", "li", "blockquote"].includes(tag)) {
    return `<${tag}>${marked}</${tag}>`;
  }
  if (tag === "a") {
    const href = sanitizeHref(el.getAttribute("href") ?? undefined);
    return href ? `<a href="${href}">${marked}</a>` : marked;
  }
  if (SKIP_WRAP.has(tag)) return marked;
  if (["div", "section", "article", "header", "footer", "main", "figure", "figcaption", "td", "th"].includes(tag)) {
    if (BLOCK.test(marked)) return marked;
    return marked.trim() ? `${marked}<br />` : "";
  }
  return marked;
}

export function normalizePastedHtml(raw: string) {
  const html = raw
    .replace(/<!--StartFragment-->/gi, "")
    .replace(/<!--EndFragment-->/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?o:p[^>]*>/gi, "");
  const doc = new DOMParser().parseFromString(html, "text/html");
  return compactBlocks(serialize(doc.body));
}

function compactBlocks(html: string) {
  const joined = html
    .replace(/(<br\s*\/?>\s*)+$/i, "")
    .replace(/(<p>\s*<\/p>)+/gi, "")
    .replace(/(?:<p>([\s\S]*?)<\/p>\s*)+/gi, (run) => {
      const parts = [...run.matchAll(/<p>([\s\S]*?)<\/p>/gi)]
        .map((m) => m[1].replace(/(<br\s*\/?>\s*)+$/gi, "").trim())
        .filter(Boolean);
      if (!parts.length) return "";
      return `<p>${parts.join("<br />")}</p>`;
    })
    .replace(/(<br\s*\/?>\s*){3,}/gi, "<br /><br />")
    .trim();
  if (!joined) return "";
  if (BLOCK.test(joined) || joined.startsWith("<p")) return joined;
  return `<p>${joined}</p>`;
}

export function clipboardToHtml(html: string | undefined, text: string | undefined) {
  if (html?.trim()) return normalizePastedHtml(html);
  if (text?.trim()) return pastedPlainToHtml(text);
  return "";
}
