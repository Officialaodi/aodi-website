import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { events } from "@/lib/schema"
import { desc } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { z } from "zod"
import { auditLog } from "@/lib/audit-log"

 export const runtime = 'edge';

const objectiveSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
})

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  subtitle: z.string().optional().nullable(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  mode: z.string().optional().default("Virtual"),
  summary: z.string().min(1, "Summary is required"),
  body: z.string().optional().nullable(),
  registrationLabel: z.string().optional().default("Register"),
  registrationUrl: z.string().optional().nullable(),
  status: z.string().optional().default("Upcoming"),
  isFeatured: z.boolean().optional().default(false),
  heroImage: z.string().optional().nullable(),
  gallery: z.string().optional().nullable(),
  pageTemplate: z.string().optional().default("standard"),
  overviewTitle: z.string().optional().default("Overview"),
  objectives: z.array(objectiveSchema).optional().nullable(),
  eligibilityCriteria: z.array(z.string()).optional().nullable(),
  eligibilityTitle: z.string().optional().default("Who Should Apply"),
  eligibilityIntro: z.string().optional().nullable(),
  deliveryTitle: z.string().optional().default("Delivery Mode"),
  deliveryDescription: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  certificate: z.string().optional().nullable(),
  ctaTitle: z.string().optional().nullable(),
  ctaDescription: z.string().optional().nullable(),
  ctaButtonText: z.string().optional().default("Submit Your Application"),
  displayOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
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

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await db.select().from(events).orderBy(desc(events.startDate))
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = eventSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: parsed.error.flatten() 
      }, { status: 400 })
    }
    
    const data = parsed.data
    
    const newEvent = await db.insert(events).values({
      title: data.title,
      slug: data.slug,
      subtitle: data.subtitle || null,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      location: data.location || null,
      mode: data.mode,
      summary: data.summary,
      body: data.body || null,
      registrationLabel: data.registrationLabel,
      registrationUrl: data.registrationUrl || null,
      status: data.status,
      isFeatured: data.isFeatured,
      heroImage: data.heroImage || null,
      gallery: data.gallery || null,
      pageTemplate: data.pageTemplate,
      overviewTitle: data.overviewTitle,
      objectives: data.objectives || null,
      eligibilityCriteria: data.eligibilityCriteria || null,
      eligibilityTitle: data.eligibilityTitle,
      eligibilityIntro: data.eligibilityIntro || null,
      deliveryTitle: data.deliveryTitle,
      deliveryDescription: data.deliveryDescription || null,
      duration: data.duration || null,
      certificate: data.certificate || null,
      ctaTitle: data.ctaTitle || null,
      ctaDescription: data.ctaDescription || null,
      ctaButtonText: data.ctaButtonText,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
    }).returning()
    
    await auditLog({
      entityType: "event",
      entityId: newEvent[0].id,
      action: "create",
      details: `Created event: ${data.title}`,
      metadata: { createdFields: Object.keys(data) },
    })
    
    return NextResponse.json(newEvent[0], { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
