import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { programs } from "@/lib/schema"
import { asc } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { z } from "zod"
import { auditLog } from "@/lib/audit-log"

const stepSchema = z.object({
  title: z.string(),
  description: z.string(),
})

const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
})

const programSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  summary: z.string().min(1, "Summary is required"),
  description: z.string().optional().nullable(),
  primaryCluster: z.string().optional().nullable(),
  isFeatured: z.boolean().optional().default(false),
  ctaText: z.string().optional().default("Learn More"),
  accentColor: z.string().optional().default("bg-aodi-teal"),
  borderColor: z.string().optional().default("border-aodi-teal"),
  steps: z.array(stepSchema).optional().nullable(),
  benefits: z.array(z.string()).optional().nullable(),
  eligibility: z.array(z.string()).optional().nullable(),
  faqs: z.array(faqSchema).optional().nullable(),
  ctaLink: z.string().optional().nullable(),
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
    const data = await db.select().from(programs).orderBy(asc(programs.displayOrder))
    
    const formattedData = data.map((program) => ({
      ...program,
      steps: program.steps ? JSON.parse(program.steps) : null,
      benefits: program.benefits ? JSON.parse(program.benefits) : null,
      eligibility: program.eligibility ? JSON.parse(program.eligibility) : null,
      faqs: program.faqs ? JSON.parse(program.faqs) : null,
    }))
    
    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Error fetching programs:", error)
    return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = programSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: parsed.error.flatten() 
      }, { status: 400 })
    }
    
    const data = parsed.data
    
    const newProgram = await db.insert(programs).values({
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      description: data.description || null,
      primaryCluster: data.primaryCluster || null,
      isFeatured: data.isFeatured,
      ctaText: data.ctaText,
      accentColor: data.accentColor,
      borderColor: data.borderColor,
      steps: data.steps ? JSON.stringify(data.steps) : null,
      benefits: data.benefits ? JSON.stringify(data.benefits) : null,
      eligibility: data.eligibility ? JSON.stringify(data.eligibility) : null,
      faqs: data.faqs ? JSON.stringify(data.faqs) : null,
      ctaLink: data.ctaLink || null,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
    }).returning()
    
    const formatted = {
      ...newProgram[0],
      steps: newProgram[0].steps ? JSON.parse(newProgram[0].steps) : null,
      benefits: newProgram[0].benefits ? JSON.parse(newProgram[0].benefits) : null,
      eligibility: newProgram[0].eligibility ? JSON.parse(newProgram[0].eligibility) : null,
      faqs: newProgram[0].faqs ? JSON.parse(newProgram[0].faqs) : null,
    }

    await auditLog({
      entityType: "program",
      entityId: newProgram[0].id,
      action: "create",
      details: `Created program: ${data.title}`,
    })
    
    return NextResponse.json(formatted, { status: 201 })
  } catch (error) {
    console.error("Error creating program:", error)
    return NextResponse.json({ error: "Failed to create program" }, { status: 500 })
  }
}
