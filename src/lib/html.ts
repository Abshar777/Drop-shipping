// Helpers for product descriptions, which may be plain text (older products) or HTML from
// the admin's formatting toolbar. Pure module: safe on server and client.

const ALLOWED_TAGS = new Set(["p", "br", "div", "strong", "b", "em", "i", "u", "h2", "h3", "ul", "ol", "li", "span"]);

// Sizes produced by the editor's font-size control (legacy <font size="n"> values).
const FONT_SIZE_REM: Record<string, string> = {
  "1": "0.75rem",
  "2": "0.875rem",
  "3": "1rem",
  "4": "1.125rem",
  "5": "1.375rem",
  "6": "1.75rem",
  "7": "2.25rem",
};

export function isHtml(text: string): boolean {
  return /<[a-z][^>]*>/i.test(text);
}

/**
 * Keep only harmless formatting: a fixed tag list, no attributes except a font-size or
 * text-align style. Scripts, event handlers, links, and images are all dropped.
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\/?([a-zA-Z0-9]+)\b([^>]*)>/g, (match, rawTag: string, attrs: string) => {
      const tag = rawTag.toLowerCase();
      const closing = match.startsWith("</");

      if (tag === "font") {
        if (closing) return "</span>";
        const size = /size\s*=\s*["']?(\d)/i.exec(attrs)?.[1];
        const rem = size ? FONT_SIZE_REM[size] : undefined;
        return rem ? `<span style="font-size:${rem}">` : "<span>";
      }

      if (!ALLOWED_TAGS.has(tag)) return "";
      if (closing) return `</${tag}>`;
      if (tag === "br") return "<br>";

      const styles: string[] = [];
      const size = /font-size:\s*([\d.]+)(px|rem|em)/i.exec(attrs);
      if (size) styles.push(`font-size:${size[1]}${size[2]}`);
      const align = /text-align:\s*(left|center|right)/i.exec(attrs);
      if (align) styles.push(`text-align:${align[1]}`);
      return styles.length ? `<${tag} style="${styles.join(";")}">` : `<${tag}>`;
    });
}

/** Plain text for search and short previews. */
export function stripHtml(html: string): string {
  return html
    .replace(/<\/(p|div|li|h2|h3|br)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

/** Short bullet points for "About this item" / "Highlights" style sections. */
export function descriptionBullets(description: string, max = 8): string[] {
  let lines: string[];
  if (isHtml(description)) {
    const items = [...description.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => stripHtml(m[1]));
    lines = items.length ? items : stripHtml(description).split("\n");
  } else {
    lines = description.split(/\r?\n/);
  }
  return lines
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, max);
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Turn an older plain-text description into paragraphs the editor can show. */
export function plainTextToHtml(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => `<p>${escapeHtml(line) || "<br>"}</p>`)
    .join("");
}
