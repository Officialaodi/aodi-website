import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { testimonials } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { z } from "zod"
import { auditLog } from "@/lib/audit-log"

const testimonialUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  quote: z.string().min(1).optional(),
  programSlug: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
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
    const testimonialId = parseInt(id)
    
    if (isNaN(testimonialId)) {
      return NextResponse.json({ error: "Invalid testimonial ID" }, { status: 400 })
    }
    
    const body = await request.json()
    const parsed = testimonialUpdateSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }
    
    const data = parsed.data
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.role !== undefined) updateData.role = data.role
    if (data.country !== undefined) updateData.country = data.country
    if (data.quote !== undefined) updateData.quote = data.quote
    if (data.programSlug !== undefined) updateData.programSlug = data.programSlug
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    
    const updated = await db.update(testimonials).set(updateData).where(eq(testimonials.id, testimonialId)).returning()
    
    if (updated.length === 0) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }
    
    await auditLog({
      entityType: "testimonial",
      entityId: testimonialId,
      action: "update",
      details: `Updated testimonial from: ${updated[0].name}`,
      metadata: { updatedFields: Object.keys(data) },
    })
    
    return NextResponse.json(updated[0])
  } catch (error) {
    console.error("Error updating testimonial:", error)
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 })
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
    const testimonialId = parseInt(id)
    
    if (isNaN(testimonialId)) {
      return NextResponse.json({ error: "Invalid testimonial ID" }, { status: 400 })
    }
    
    const deleted = await db.delete(testimonials).where(eq(testimonials.id, testimonialId)).returning()
    
    if (deleted.length === 0) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }
    
    await auditLog({
      entityType: "testimonial",
      entityId: testimonialId,
      action: "delete",
      details: `Deleted testimonial from: ${deleted[0].name}`,
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting testimonial:", error)
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 })
  }
}
