import { isHtml, sanitizeHtml } from "@/lib/html";

/** Renders a description written with the admin toolbar (HTML) or an older plain-text one. */
export default function ProductDescription({ text, className = "" }: { text: string; className?: string }) {
  if (!text) return null;
  if (isHtml(text)) {
    return <div className={`rich-text ${className}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }} />;
  }
  return <p className={`whitespace-pre-line ${className}`}>{text}</p>;
}
