import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySignedToken } from "@/lib/admin-auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
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

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 })
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

    return NextResponse.json({ 
      url,
      filename,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
