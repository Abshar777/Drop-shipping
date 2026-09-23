"use client";

import { useEffect, useRef } from "react";
import { isHtml, plainTextToHtml, sanitizeHtml } from "@/lib/html";

// Font sizes map to the browser's legacy <font size> scale; sanitizeHtml converts them to rem.
const FONT_SIZES = [
  { label: "Small", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "5" },
  { label: "Extra large", value: "6" },
];

/**
 * Lightweight formatting editor for product descriptions: bold, italic, underline,
 * headings, bullet and numbered lists, font size. Emits HTML; the server sanitises it.
 * Uses the browser's built-in editing commands, so there is no extra dependency.
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef<string | null>(null);

  // Load external changes (opening a product to edit, clearing the form) without
  // touching the caret while the admin is typing.
  useEffect(() => {
    const el = editor.current;
    if (!el || value === lastEmitted.current) return;
    el.innerHTML = value ? (isHtml(value) ? sanitizeHtml(value) : plainTextToHtml(value)) : "";
    lastEmitted.current = value;
  }, [value]);

  function emit() {
    const el = editor.current;
    if (!el) return;
    const html = el.innerText.trim() === "" ? "" : el.innerHTML;
    lastEmitted.current = html;
    onChange(html);
  }

  function exec(command: string, argument?: string) {
    editor.current?.focus();
    document.execCommand(command, false, argument);
    emit();
  }

  const button = (label: string, title: string, onClick: () => void, extra = "") => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()} // keep the text selection
      onClick={onClick}
      className={`px-2 py-1 text-sm rounded hover:bg-gray-100 text-gray-800 ${extra}`}
    >
      {label}
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-md bg-white overflow-hidden focus-within:ring-2 focus-within:ring-orange-500">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1">
        {button("B", "Bold", () => exec("bold"), "font-bold")}
        {button("I", "Italic", () => exec("italic"), "italic")}
        {button("U", "Underline", () => exec("underline"), "underline")}
        <span className="w-px h-5 bg-gray-300 mx-1" />
        {button("H2", "Heading", () => exec("formatBlock", "h2"), "font-semibold")}
        {button("H3", "Subheading", () => exec("formatBlock", "h3"), "font-semibold")}
        {button("¶", "Normal paragraph", () => exec("formatBlock", "p"))}
        <span className="w-px h-5 bg-gray-300 mx-1" />
        {button("• List", "Bullet list", () => exec("insertUnorderedList"))}
        {button("1. List", "Numbered list", () => exec("insertOrderedList"))}
        <span className="w-px h-5 bg-gray-300 mx-1" />
        <label className="flex items-center gap-1 text-xs text-gray-600">
          Size
          <select
            defaultValue="3"
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => exec("fontSize", e.target.value)}
            className="border border-gray-300 rounded px-1 py-0.5 text-xs bg-white text-gray-800"
            title="Font size for the selected text"
          >
            {FONT_SIZES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <span className="flex-1" />
        {button("Clear", "Remove formatting from the selection", () => {
          exec("removeFormat");
          exec("formatBlock", "p");
        }, "text-gray-500")}
      </div>
      <div
        ref={editor}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder={placeholder}
        className="rich-text min-h-[11rem] max-h-[28rem] overflow-y-auto px-3 py-2 text-sm text-gray-900 leading-relaxed focus:outline-none"
      />
    </div>
  );
}
