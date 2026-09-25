import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { isAdminAuthenticated } from "@/lib/require-admin";

// Locally, uploads go to public/uploads and are served as /uploads/<file>.
// On Vercel the disk is read-only, so with BLOB_READ_WRITE_TOKEN set they go to Vercel Blob instead.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** POST /api/admin/uploads  multipart form with one or more `files` -> { urls }  (admin only) */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected image files" }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return NextResponse.json({ error: "Choose at least one image" }, { status: 400 });
  }

  for (const file of files) {
    if (!EXTENSIONS[file.type]) {
      return NextResponse.json(
        { error: `"${file.name}" is not a supported image. Use JPG, PNG, WebP, or GIF.` },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `"${file.name}" is over 5 MB. Please use a smaller image.` }, { status: 400 });
    }
  }

  if (process.env.VERCEL && !useBlob) {
    return NextResponse.json(
      { error: "Image uploads need Vercel Blob storage. Add the Blob store in Vercel, then redeploy." },
      { status: 503 }
    );
  }

  try {
    const urls: string[] = [];
    for (const file of files) {
      const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${EXTENSIONS[file.type]}`;
      if (useBlob) {
        const blob = await put(`uploads/${name}`, file, { access: "public", contentType: file.type });
        urls.push(blob.url);
      } else {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
        urls.push(`/uploads/${name}`);
      }
    }
    return NextResponse.json({ urls }, { status: 201 });
  } catch (err) {
    console.error("[uploads] failed:", err);
    return NextResponse.json({ error: "The image could not be saved. Please try again." }, { status: 500 });
  }
}
