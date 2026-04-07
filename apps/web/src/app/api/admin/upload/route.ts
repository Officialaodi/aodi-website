import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySignedToken } from "@/lib/admin-auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"
import { db } from "@/lib/db"
import { mediaLibrary } from "@/lib/schema"

export const dynamic = 'force-dynamic'

const UPLOAD_DIR = path.join(process.cwd(), "uploads")
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_VIDEO_SIZE = 100 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"]
const ALLOWED_DOCUMENT_TYPES = ["application/pdf"]
const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOCUMENT_TYPES]

export async function POST(request: Request) {
  try {
    const sessionSecret = process.env.SESSION_SECRET
    if (!sessionSecret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("admin_session")
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const session = verifySignedToken(sessionCookie.value, sessionSecret)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!ALL_ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed. Supported: images (JPEG, PNG, GIF, WebP, SVG), videos (MP4, WebM, OGG), and PDFs" }, { status: 400 })
    }

    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
    const maxSizeLabel = isVideo ? "100MB" : "10MB"
    
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large. Maximum size for ${isVideo ? 'videos' : 'images/documents'} is ${maxSizeLabel}` }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString("base64")

    const ext = path.extname(file.name).toLowerCase() || ".bin"
    const uniqueId = crypto.randomBytes(8).toString("hex")
    const timestamp = Date.now()
    const filename = `${timestamp}-${uniqueId}${ext}`
    const url = `/api/uploads/${filename}`
    const mediaType = isVideo ? 'video' : (ALLOWED_DOCUMENT_TYPES.includes(file.type) ? 'document' : 'image')

    // Save to database first (persistent across deployments and restarts)
    await db.insert(mediaLibrary).values({
      filename,
      originalName: file.name,
      url,
      mimeType: file.type,
      size: file.size,
      data: base64Data,
      folder: mediaType,
    })

    // Also write to filesystem as local cache (best-effort)
    try {
      await mkdir(UPLOAD_DIR, { recursive: true })
      await writeFile(path.join(UPLOAD_DIR, filename), buffer)
    } catch {
      // Filesystem write failure is non-fatal — DB is the source of truth
    }

    return NextResponse.json({ 
      url,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      mediaType
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
