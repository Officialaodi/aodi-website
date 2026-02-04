import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { partners } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { z } from "zod"
import { auditLog } from "@/lib/audit-log"

const partnerUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  logoUrl: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

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
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return false
    
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString())
    if (decoded.exp && Date.now() > decoded.exp) return false
    
    return true
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
    const partnerId = parseInt(id)
    
    if (isNaN(partnerId)) {
      return NextResponse.json({ error: "Invalid partner ID" }, { status: 400 })
    }
    
    const body = await request.json()
    const parsed = partnerUpdateSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }
    
    const data = parsed.data
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.type !== undefined) updateData.type = data.type
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl
    if (data.url !== undefined) updateData.url = data.url
    if (data.description !== undefined) updateData.description = data.description
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    
    const updated = await db.update(partners).set(updateData).where(eq(partners.id, partnerId)).returning()
    
    if (updated.length === 0) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 })
    }
    
    await auditLog({
      entityType: "partner",
      entityId: partnerId,
      action: "update",
      details: `Updated partner: ${updated[0].name}`,
      metadata: { updatedFields: Object.keys(data) },
    })
    
    return NextResponse.json(updated[0])
  } catch (error) {
    console.error("Error updating partner:", error)
    return NextResponse.json({ error: "Failed to update partner" }, { status: 500 })
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
    const partnerId = parseInt(id)
    
    if (isNaN(partnerId)) {
      return NextResponse.json({ error: "Invalid partner ID" }, { status: 400 })
    }
    
    const deleted = await db.delete(partners).where(eq(partners.id, partnerId)).returning()
    
    if (deleted.length === 0) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 })
    }
    
    await auditLog({
      entityType: "partner",
      entityId: partnerId,
      action: "delete",
      details: `Deleted partner: ${deleted[0].name}`,
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting partner:", error)
    return NextResponse.json({ error: "Failed to delete partner" }, { status: 500 })
  }
}
