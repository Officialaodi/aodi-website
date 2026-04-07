import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"
import { db } from "@/lib/db"
import { mediaLibrary } from "@/lib/schema"
import { eq } from "drizzle-orm"

const UPLOAD_DIR = path.join(process.cwd(), "uploads")
const LEGACY_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg",
  ".pdf": "application/pdf",
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    const sanitized = path.basename(filename)
    if (sanitized !== filename || filename.includes("..")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 })
    }

    const ext = path.extname(sanitized).toLowerCase()
    const contentType = MIME_TYPES[ext] || "application/octet-stream"

    // Database is the persistent source of truth — try it first
    try {
      const [record] = await db
        .select({ data: mediaLibrary.data, mimeType: mediaLibrary.mimeType })
        .from(mediaLibrary)
        .where(eq(mediaLibrary.filename, sanitized))
        .limit(1)

      if (record?.data) {
        const buffer = Buffer.from(record.data, "base64")
        return new Response(new Uint8Array(buffer), {
          status: 200,
          headers: {
            "Content-Type": record.mimeType || contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        })
      }
    } catch {
      // DB lookup failed — fall through to filesystem
    }

    // Fallback: local filesystem (useful during development)
    let buffer: Buffer
    try {
      buffer = await readFile(path.join(UPLOAD_DIR, sanitized))
    } catch {
      buffer = await readFile(path.join(LEGACY_UPLOAD_DIR, sanitized))
    }

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 })
  }
}
