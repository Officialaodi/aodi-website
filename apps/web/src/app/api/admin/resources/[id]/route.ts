import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { resources } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { z } from "zod"
import { auditLog } from "@/lib/audit-log"

const resourceUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  fileUrl: z.string().optional().nullable(),
  externalUrl: z.string().optional().nullable(),
  fileType: z.string().optional().nullable(),
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
    const resourceId = parseInt(id)
    
    if (isNaN(resourceId)) {
      return NextResponse.json({ error: "Invalid resource ID" }, { status: 400 })
    }
    
    const body = await request.json()
    const parsed = resourceUpdateSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }
    
    const data = parsed.data
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.category !== undefined) updateData.category = data.category
    if (data.fileUrl !== undefined) updateData.fileUrl = data.fileUrl
    if (data.externalUrl !== undefined) updateData.externalUrl = data.externalUrl
    if (data.fileType !== undefined) updateData.fileType = data.fileType
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    
    const updated = await db.update(resources).set(updateData).where(eq(resources.id, resourceId)).returning()
    
    if (updated.length === 0) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }
    
    await auditLog({
      entityType: "resource",
      entityId: resourceId,
      action: "update",
      details: `Updated resource: ${updated[0].title}`,
      metadata: { updatedFields: Object.keys(data) },
    })
    
    return NextResponse.json(updated[0])
  } catch (error) {
    console.error("Error updating resource:", error)
    return NextResponse.json({ error: "Failed to update resource" }, { status: 500 })
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
    const resourceId = parseInt(id)
    
    if (isNaN(resourceId)) {
      return NextResponse.json({ error: "Invalid resource ID" }, { status: 400 })
    }
    
    const deleted = await db.delete(resources).where(eq(resources.id, resourceId)).returning()
    
    if (deleted.length === 0) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }
    
    await auditLog({
      entityType: "resource",
      entityId: resourceId,
      action: "delete",
      details: `Deleted resource: ${deleted[0].title}`,
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting resource:", error)
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 })
  }
}
