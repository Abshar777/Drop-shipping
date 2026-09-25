import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { isAdminAuthenticated } from "@/lib/require-admin";

// Locally, uploads go to public/uploads and are served as /uploads/<file>.
// On Vercel the disk is read-only, so with BLOB_READ_WRITE_TOKEN set they go to Vercel Blob instead.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

type Kind = "image" | "video" | "file";

const RULES: Record<Kind, { maxBytes: number; types: Record<string, string>; label: string }> = {
  image: {
    maxBytes: 5 * 1024 * 1024,
    label: "JPG, PNG, WebP, or GIF up to 5 MB",
    types: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" },
  },
  video: {
    maxBytes: 50 * 1024 * 1024,
    label: "MP4 or WebM up to 50 MB",
    types: { "video/mp4": "mp4", "video/webm": "webm" },
  },
  file: {
    maxBytes: 50 * 1024 * 1024,
    label: "PDF, ZIP, EPUB, MP3, MP4, or image up to 50 MB",
    types: {
      "application/pdf": "pdf",
      "application/zip": "zip",
      "application/x-zip-compressed": "zip",
      "application/epub+zip": "epub",
      "audio/mpeg": "mp3",
      "video/mp4": "mp4",
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "text/plain": "txt",
    },
  },
};

/**
 * POST /api/admin/uploads?kind=image|video|file   multipart form with `files`
 *   -> { urls, files: [{ url, name, size, type }] }   (admin only)
 */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kindParam = new URL(request.url).searchParams.get("kind");
  const kind: Kind = kindParam === "video" || kindParam === "file" ? kindParam : "image";
  const rules = RULES[kind];

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected files" }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return NextResponse.json({ error: "Choose at least one file" }, { status: 400 });
  }

  for (const file of files) {
    if (!rules.types[file.type]) {
      return NextResponse.json({ error: `"${file.name}" is not a supported type. Use ${rules.label}.` }, { status: 400 });
    }
    if (file.size > rules.maxBytes) {
      return NextResponse.json({ error: `"${file.name}" is too large. Limit: ${rules.label}.` }, { status: 400 });
    }
  }

  if (process.env.VERCEL && !useBlob) {
    return NextResponse.json(
      { error: "Uploads need Vercel Blob storage. Add the Blob store in Vercel, then redeploy." },
      { status: 503 }
    );
  }

  try {
    const out: Array<{ url: string; name: string; size: number; type: string }> = [];
    for (const file of files) {
      const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${rules.types[file.type]}`;
      let url: string;
      if (useBlob) {
        const blob = await put(`uploads/${name}`, file, { access: "public", contentType: file.type });
        url = blob.url;
      } else {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
        url = `/uploads/${name}`;
      }
      out.push({ url, name: file.name, size: file.size, type: file.type });
    }
    return NextResponse.json({ urls: out.map((f) => f.url), files: out }, { status: 201 });
  } catch (err) {
    console.error("[uploads] failed:", err);
    return NextResponse.json({ error: "The file could not be saved. Please try again." }, { status: 500 });
  }
}
