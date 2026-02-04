import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { applications, activityLogs } from "@/lib/schema"
import { inArray } from "drizzle-orm"
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

const VALID_STATUSES = ["new", "in_review", "contacted", "accepted", "rejected"]

export async function PATCH(request: NextRequest) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  if (!adminSession || !verifySignedToken(adminSession.value, sessionSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { ids, status } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Application IDs required" }, { status: 400 })
    }

    if (ids.length > 100) {
      return NextResponse.json({ error: "Cannot update more than 100 applications at once" }, { status: 400 })
    }

    const validIds = ids.filter(id => typeof id === "number" && id > 0)
    if (validIds.length !== ids.length) {
      return NextResponse.json({ error: "Invalid application IDs" }, { status: 400 })
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 })
    }

    const updated = await db
      .update(applications)
      .set({ status, updatedAt: new Date() })
      .where(inArray(applications.id, validIds))
      .returning()

    for (const app of updated) {
      await db.insert(activityLogs).values({
        entityType: "application",
        entityId: app.id,
        action: "status_changed",
        details: `Bulk status change to ${status}`,
        performedBy: "Admin",
      })
    }

    return NextResponse.json({ 
      success: true, 
      updated: updated.length,
      message: `${updated.length} applications updated to ${status}` 
    })
  } catch (error) {
    console.error("Error bulk updating applications:", error)
    return NextResponse.json({ error: "Failed to bulk update applications" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  if (!adminSession || !verifySignedToken(adminSession.value, sessionSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Application IDs required" }, { status: 400 })
    }

    if (ids.length > 100) {
      return NextResponse.json({ error: "Cannot delete more than 100 applications at once" }, { status: 400 })
    }

    const validIds = ids.filter(id => typeof id === "number" && id > 0)
    if (validIds.length !== ids.length) {
      return NextResponse.json({ error: "Invalid application IDs" }, { status: 400 })
    }

    await db.delete(applications).where(inArray(applications.id, validIds))

    return NextResponse.json({ 
      success: true, 
      deleted: ids.length,
      message: `${ids.length} applications deleted` 
    })
  } catch (error) {
    console.error("Error bulk deleting applications:", error)
    return NextResponse.json({ error: "Failed to bulk delete applications" }, { status: 500 })
  }
}
