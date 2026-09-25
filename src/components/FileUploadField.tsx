"use client";

import { useRef, useState } from "react";
import { formatFileSize } from "@/lib/product-utils";

export type UploadedFile = { url: string; name?: string; size?: number };

/**
 * Single-file upload for the admin (video or digital download), with a paste-a-link fallback.
 * Uploads go through /api/admin/uploads?kind=... and return the stored URL.
 */
export default function FileUploadField({
  kind,
  accept,
  hint,
  value,
  onChange,
  onError,
}: {
  kind: "video" | "file";
  accept: string;
  hint: string;
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
  onError: (message: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [link, setLink] = useState("");

  async function upload(file: File) {
    setUploading(true);
    onError("");
    const body = new FormData();
    body.append("files", file);
    try {
      const res = await fetch(`/api/admin/uploads?kind=${kind}`, { method: "POST", body });
      const data = await res.json();
      if (res.ok && data.files?.[0]) onChange({ url: data.files[0].url, name: data.files[0].name, size: data.files[0].size });
      else onError(data.error || "Upload failed");
    } catch {
      onError("Upload failed. Check your connection and try again.");
    }
    setUploading(false);
  }

  function addLink() {
    const url = link.trim();
    if (!url) return;
    if (!/^(https?:\/\/|\/)/.test(url)) {
      onError("Links must start with http://, https://, or /.");
      return;
    }
    onChange({ url, name: url.split("/").pop() || url });
    setLink("");
  }

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="flex items-center gap-3 border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-sm">
          <span className="text-lg" aria-hidden="true">
            {kind === "video" ? "🎬" : "📄"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-gray-900 truncate">{value.name || value.url}</p>
            <p className="text-xs text-gray-500 truncate">
              {value.size ? `${formatFileSize(value.size)} · ` : ""}
              {value.url}
            </p>
          </div>
          <button type="button" onClick={() => onChange(null)} className="text-xs text-red-600 hover:underline shrink-0">
            Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            ref={input}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={uploading}
            className="border border-dashed border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 hover:border-orange-400 hover:bg-gray-50 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Choose file"}
          </button>
          <div className="flex flex-1 gap-2">
            <input
              type="url"
              placeholder="or paste a link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLink();
                }
              }}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
            />
            <button type="button" onClick={addLink} className="border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Add
            </button>
          </div>
        </div>
      )}
      <p className="text-xs text-gray-500">{hint}</p>
    </div>
  );
}
