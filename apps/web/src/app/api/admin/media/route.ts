import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySignedToken } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { mediaLibrary } from "@/lib/schema"
import { desc } from "drizzle-orm"

export async function GET() {
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

    const items = await db
      .select()
      .from(mediaLibrary)
      .orderBy(desc(mediaLibrary.createdAt))

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching media:", error)
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("admin_session")
    
    const sessionSecret = process.env.SESSION_SECRET
    if (!sessionSecret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const session = verifySignedToken(sessionCookie.value, sessionSecret)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const body = await request.json()
    const { filename, originalName, url, mimeType, size, alt, caption, folder } = body

    if (!filename || !originalName || !url || !mimeType || !size) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [item] = await db
      .insert(mediaLibrary)
      .values({
        filename,
        originalName,
        url,
        mimeType,
        size,
        alt: alt || null,
        caption: caption || null,
        folder: folder || "uploads",
      })
      .returning()

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error creating media item:", error)
    return NextResponse.json({ error: "Failed to create media item" }, { status: 500 })
  }
}
