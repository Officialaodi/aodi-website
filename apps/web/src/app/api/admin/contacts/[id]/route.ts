import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { contacts, activityLogs } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import crypto from "crypto"

export const dynamic = 'force-dynamic'

function verifySignedToken(token: string, sessionSecret: string): boolean {
  const parts = token.split(".")
  if (parts.length !== 2) return false
  const [sessionId, signature] = parts
  const expectedSignature = crypto.createHmac("sha256", sessionSecret).update(sessionId).digest("hex")
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
  } catch { return false }
}

const VALID_CONTACT_STATUSES = ["new", "replied", "resolved"]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  if (!adminSession || !verifySignedToken(adminSession.value, sessionSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const numericId = parseInt(id)
  
  if (isNaN(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Invalid contact ID" }, { status: 400 })
  }

  try {
    const { status } = await request.json()
    
    if (!status || !VALID_CONTACT_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_CONTACT_STATUSES.join(", ")}` }, { status: 400 })
    }
    
    const [updated] = await db
      .update(contacts)
      .set({ status, updatedAt: new Date() })
      .where(eq(contacts.id, numericId))
      .returning()

    await db.insert(activityLogs).values({
      entityType: "contact",
      entityId: parseInt(id),
      action: "status_changed",
      details: `Status changed to ${status}`,
      performedBy: "Admin",
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating contact:", error)
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  if (!adminSession || !verifySignedToken(adminSession.value, sessionSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    await db.delete(contacts).where(eq(contacts.id, parseInt(id)))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting contact:", error)
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 })
  }
}
