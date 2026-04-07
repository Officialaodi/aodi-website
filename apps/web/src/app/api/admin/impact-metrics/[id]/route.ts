import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { impactMetrics } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { auditLog } from "@/lib/audit-log"

export const dynamic = 'force-dynamic'

async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("admin_session")?.value
  if (!sessionToken) return false

  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return false

  try {
    const [payload, signature] = sessionToken.split(".")
    if (!payload || !signature) return false

    const expectedSignature = createHmac("sha256", sessionSecret)
      .update(payload)
      .digest("hex")

    const sigBuffer = Buffer.from(signature, "hex")
    const expectedBuffer = Buffer.from(expectedSignature, "hex")

    if (sigBuffer.length !== expectedBuffer.length) return false
    return timingSafeEqual(sigBuffer, expectedBuffer)
  } catch {
    return false
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await verifySession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    const body = await request.json()

    const [updated] = await db
      .update(impactMetrics)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(impactMetrics.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: "Metric not found" }, { status: 404 })
    }

    await auditLog({
      entityType: "impact_metric",
      entityId: id,
      action: "update",
      details: `Updated impact metric: ${updated.label}`,
      metadata: { updatedFields: Object.keys(body) },
    })

    return NextResponse.json({ metric: updated })
  } catch (error) {
    console.error("Error updating impact metric:", error)
    return NextResponse.json({ error: "Failed to update metric" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await verifySession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    const [deleted] = await db
      .delete(impactMetrics)
      .where(eq(impactMetrics.id, id))
      .returning()

    if (!deleted) {
      return NextResponse.json({ error: "Metric not found" }, { status: 404 })
    }

    await auditLog({
      entityType: "impact_metric",
      entityId: id,
      action: "delete",
      details: `Deleted impact metric: ${deleted.label}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting impact metric:", error)
    return NextResponse.json({ error: "Failed to delete metric" }, { status: 500 })
  }
}
