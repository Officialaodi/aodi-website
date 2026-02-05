import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySignedToken } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { mediaLibrary } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { unlink } from "fs/promises"
import path from "path"

const SESSION_SECRET = process.env.SESSION_SECRET

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("admin_session")
    
    if (!sessionCookie || !SESSION_SECRET) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const session = verifySignedToken(sessionCookie.value, SESSION_SECRET)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { id } = await params
    const [item] = await db
      .select()
      .from(mediaLibrary)
      .where(eq(mediaLibrary.id, parseInt(id)))
      .limit(1)

    if (!item) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching media:", error)
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("admin_session")
    
    if (!sessionCookie || !SESSION_SECRET) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const session = verifySignedToken(sessionCookie.value, SESSION_SECRET)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { alt, caption, folder } = body

    const [item] = await db
      .update(mediaLibrary)
      .set({
        alt: alt !== undefined ? alt : undefined,
        caption: caption !== undefined ? caption : undefined,
        folder: folder !== undefined ? folder : undefined,
      })
      .where(eq(mediaLibrary.id, parseInt(id)))
      .returning()

    if (!item) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error updating media:", error)
    return NextResponse.json({ error: "Failed to update media" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("admin_session")
    
    if (!sessionCookie || !SESSION_SECRET) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const session = verifySignedToken(sessionCookie.value, SESSION_SECRET)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { id } = await params
    
    const [item] = await db
      .select()
      .from(mediaLibrary)
      .where(eq(mediaLibrary.id, parseInt(id)))
      .limit(1)

    if (!item) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    if (item.url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", item.url)
      try {
        await unlink(filePath)
      } catch (e) {
        console.warn("Could not delete file:", filePath, e)
      }
    }

    await db.delete(mediaLibrary).where(eq(mediaLibrary.id, parseInt(id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting media:", error)
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 })
  }
}
