"use client";

import { useRef, useState } from "react";

/**
 * Product images for the admin form: upload from the computer (click or drag and drop),
 * reorder by choosing the main image, remove, and optionally paste a link.
 */
export default function ProductImageUploader({
  images,
  onChange,
  onError,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  onError: (message: string) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [link, setLink] = useState("");

  async function upload(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      onError("Please choose image files (JPG, PNG, WebP, or GIF).");
      return;
    }
    setUploading(true);
    onError("");
    const body = new FormData();
    files.forEach((f) => body.append("files", f));
    try {
      const res = await fetch("/api/admin/uploads", { method: "POST", body });
      const data = await res.json();
      if (res.ok) onChange([...images, ...data.urls]);
      else onError(data.error || "Upload failed");
    } catch {
      onError("Upload failed. Check your connection and try again.");
    }
    setUploading(false);
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function makeMain(index: number) {
    if (index === 0) return;
    const next = [...images];
    const [img] = next.splice(index, 1);
    onChange([img, ...next]);
  }

  function addLink() {
    const url = link.trim();
    if (!url) return;
    if (!/^(https?:\/\/|\/)/.test(url)) {
      onError("Image links must start with http://, https://, or /.");
      return;
    }
    onChange([...images, url]);
    setLink("");
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files);
        }}
        onClick={() => fileInput.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInput.current?.click();
        }}
        className={`border-2 border-dashed rounded-lg px-4 py-6 text-center cursor-pointer transition-colors ${
          dragging ? "border-orange-500 bg-orange-50" : "border-gray-300 hover:border-orange-400 hover:bg-gray-50"
        }`}
      >
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) upload(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="text-sm font-medium text-gray-800">
          {uploading ? "Uploading…" : "Click to choose images, or drag and drop them here"}
        </p>
        <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP, or GIF up to 5 MB each. The first image is the main one.</p>
      </div>

      {images.length > 0 && (
        <ul className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {images.map((src, index) => (
            <li key={`${src}-${index}`} className="relative group">
              <div className="aspect-square overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Product image ${index + 1}`} className="w-full h-full object-cover" />
              </div>
              {index === 0 ? (
                <span className="absolute top-1 left-1 text-[10px] font-semibold bg-orange-600 text-white rounded px-1.5 py-0.5">
                  Main
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeMain(index)}
                  className="absolute bottom-1 left-1 text-[10px] font-medium bg-white/90 text-gray-800 border border-gray-300 rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100"
                >
                  Make main
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label="Remove image"
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 border border-gray-300 text-gray-700 text-sm leading-none flex items-center justify-center hover:bg-red-50 hover:text-red-600"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer select-none">Have an image link instead?</summary>
        <div className="flex gap-2 mt-2">
          <input
            type="url"
            placeholder="https://example.com/photo.jpg"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addLink();
              }
            }}
            className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900"
          />
          <button
            type="button"
            onClick={addLink}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Add link
          </button>
        </div>
      </details>
    </div>
  );
}
