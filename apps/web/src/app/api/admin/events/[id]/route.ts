import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { events } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { z } from "zod"
import { auditLog } from "@/lib/audit-log"

const objectiveSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
})

const eventUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  subtitle: z.string().optional().nullable(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  mode: z.string().optional(),
  summary: z.string().min(1).optional(),
  body: z.string().optional().nullable(),
  registrationLabel: z.string().optional(),
  registrationUrl: z.string().optional().nullable(),
  status: z.string().optional(),
  isFeatured: z.boolean().optional(),
  heroImage: z.string().optional().nullable(),
  gallery: z.string().optional().nullable(),
  pageTemplate: z.string().optional(),
  overviewTitle: z.string().optional(),
  objectives: z.array(objectiveSchema).optional().nullable(),
  eligibilityCriteria: z.array(z.string()).optional().nullable(),
  eligibilityTitle: z.string().optional(),
  eligibilityIntro: z.string().optional().nullable(),
  deliveryTitle: z.string().optional(),
  deliveryDescription: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  certificate: z.string().optional().nullable(),
  ctaTitle: z.string().optional().nullable(),
  ctaDescription: z.string().optional().nullable(),
  ctaButtonText: z.string().optional(),
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
    const eventId = parseInt(id)
    
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
    }
    
    const body = await request.json()
    const parsed = eventUpdateSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: parsed.error.flatten() 
      }, { status: 400 })
    }
    
    const data = parsed.data
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    
    if (data.title !== undefined) updateData.title = data.title
    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate)
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null
    if (data.location !== undefined) updateData.location = data.location
    if (data.mode !== undefined) updateData.mode = data.mode
    if (data.summary !== undefined) updateData.summary = data.summary
    if (data.body !== undefined) updateData.body = data.body
    if (data.registrationLabel !== undefined) updateData.registrationLabel = data.registrationLabel
    if (data.registrationUrl !== undefined) updateData.registrationUrl = data.registrationUrl
    if (data.status !== undefined) updateData.status = data.status
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured
    if (data.heroImage !== undefined) updateData.heroImage = data.heroImage
    if (data.gallery !== undefined) updateData.gallery = data.gallery
    if (data.pageTemplate !== undefined) updateData.pageTemplate = data.pageTemplate
    if (data.overviewTitle !== undefined) updateData.overviewTitle = data.overviewTitle
    if (data.objectives !== undefined) updateData.objectives = data.objectives
    if (data.eligibilityCriteria !== undefined) updateData.eligibilityCriteria = data.eligibilityCriteria
    if (data.eligibilityTitle !== undefined) updateData.eligibilityTitle = data.eligibilityTitle
    if (data.eligibilityIntro !== undefined) updateData.eligibilityIntro = data.eligibilityIntro
    if (data.deliveryTitle !== undefined) updateData.deliveryTitle = data.deliveryTitle
    if (data.deliveryDescription !== undefined) updateData.deliveryDescription = data.deliveryDescription
    if (data.duration !== undefined) updateData.duration = data.duration
    if (data.certificate !== undefined) updateData.certificate = data.certificate
    if (data.ctaTitle !== undefined) updateData.ctaTitle = data.ctaTitle
    if (data.ctaDescription !== undefined) updateData.ctaDescription = data.ctaDescription
    if (data.ctaButtonText !== undefined) updateData.ctaButtonText = data.ctaButtonText
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    
    const updated = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, eventId))
      .returning()
    
    if (updated.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }
    
    await auditLog({
      entityType: "event",
      entityId: eventId,
      action: "update",
      details: `Updated event: ${updated[0].title}`,
      metadata: { updatedFields: Object.keys(data) },
    })
    
    return NextResponse.json(updated[0])
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
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
    const eventId = parseInt(id)
    
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
    }
    
    const deleted = await db
      .delete(events)
      .where(eq(events.id, eventId))
      .returning()
    
    if (deleted.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }
    
    await auditLog({
      entityType: "event",
      entityId: eventId,
      action: "delete",
      details: `Deleted event: ${deleted[0].title}`,
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
