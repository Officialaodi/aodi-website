import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySignedToken } from "@/lib/admin-auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const MAX_VIDEO_SIZE = 100 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"]
const ALLOWED_DOCUMENT_TYPES = ["application/pdf"]
const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOCUMENT_TYPES]
const SESSION_SECRET = process.env.SESSION_SECRET

if (!SESSION_SECRET) {
  console.error("SESSION_SECRET environment variable is required for upload endpoint")
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("admin_session")
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    
    if (!SESSION_SECRET) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const session = verifySignedToken(sessionCookie.value, SESSION_SECRET)
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

    const ext = path.extname(file.name).toLowerCase() || ".bin"
    const uniqueId = crypto.randomBytes(8).toString("hex")
    const timestamp = Date.now()
    const filename = `${timestamp}-${uniqueId}${ext}`

    await mkdir(UPLOAD_DIR, { recursive: true })

    const filepath = path.join(UPLOAD_DIR, filename)
    await writeFile(filepath, buffer)

    const url = `/uploads/${filename}`
    const mediaType = isVideo ? 'video' : (ALLOWED_DOCUMENT_TYPES.includes(file.type) ? 'document' : 'image')

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
