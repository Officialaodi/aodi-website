import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { trustees } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { auditLog } from "@/lib/audit-log"

 export const runtime = 'edge';

function verifySession(token: string): boolean {
  const secret = process.env.SESSION_SECRET
  if (!secret) return false
  
  const parts = token.split(".")
  if (parts.length !== 2) return false
  
  const [payload, signature] = parts
  const expectedSignature = createHmac("sha256", secret).update(payload).digest("hex")
  
  try {
    const sigBuffer = Buffer.from(signature, "hex")
    const expectedBuffer = Buffer.from(expectedSignature, "hex")
    if (sigBuffer.length !== expectedBuffer.length) return false
    return timingSafeEqual(sigBuffer, expectedBuffer)
  } catch {
    return false
  }
}

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("admin_session")?.value
  if (!sessionToken) return false
  return verifySession(sessionToken)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { name, role, bio, photoUrl, linkedinUrl, displayOrder, isActive } = body

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (name !== undefined) updateData.name = name
    if (role !== undefined) updateData.role = role
    if (bio !== undefined) updateData.bio = bio
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder
    if (isActive !== undefined) updateData.isActive = isActive

    const result = await db.update(trustees)
      .set(updateData)
      .where(eq(trustees.id, parseInt(id)))
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: "Trustee not found" }, { status: 404 })
    }

    await auditLog({
      entityType: "trustee",
      entityId: parseInt(id),
      action: "update",
      details: `Updated trustee: ${result[0].name}`,
      metadata: { updatedFields: Object.keys(body) },
    })

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating trustee:", error)
    return NextResponse.json({ error: "Failed to update trustee" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const result = await db.delete(trustees)
      .where(eq(trustees.id, parseInt(id)))
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: "Trustee not found" }, { status: 404 })
    }

    await auditLog({
      entityType: "trustee",
      entityId: parseInt(id),
      action: "delete",
      details: `Deleted trustee: ${result[0].name}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting trustee:", error)
    return NextResponse.json({ error: "Failed to delete trustee" }, { status: 500 })
  }
}
