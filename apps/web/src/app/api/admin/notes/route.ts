import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { applicationNotes, activityLogs } from "@/lib/schema"
import { desc, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import crypto from "crypto"

function verifySignedToken(token: string, sessionSecret: string): boolean {
  const parts = token.split(".")
  if (parts.length !== 2) return false
  const [sessionId, signature] = parts
  const expectedSignature = crypto.createHmac("sha256", sessionSecret).update(sessionId).digest("hex")
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
  } catch { return false }
}

export async function GET(request: NextRequest) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  if (!adminSession || !verifySignedToken(adminSession.value, sessionSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const applicationId = searchParams.get("applicationId")

  if (!applicationId) {
    return NextResponse.json({ error: "Application ID required" }, { status: 400 })
  }

  try {
    const notes = await db
      .select()
      .from(applicationNotes)
      .where(eq(applicationNotes.applicationId, parseInt(applicationId)))
      .orderBy(desc(applicationNotes.createdAt))

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  if (!adminSession || !verifySignedToken(adminSession.value, sessionSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { applicationId, content, authorName } = await request.json()

    if (!applicationId || !content) {
      return NextResponse.json({ error: "Application ID and content required" }, { status: 400 })
    }

    const [note] = await db
      .insert(applicationNotes)
      .values({
        applicationId,
        content,
        authorName: authorName || "Admin",
        isInternal: true,
      })
      .returning()

    await db.insert(activityLogs).values({
      entityType: "application",
      entityId: applicationId,
      action: "note_added",
      details: `Note added: ${content.substring(0, 100)}...`,
      performedBy: authorName || "Admin",
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}
