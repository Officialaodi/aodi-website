import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { programs } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { z } from "zod"
import { auditLog } from "@/lib/audit-log"

 export const runtime = 'edge';

const stepSchema = z.object({
  title: z.string(),
  description: z.string(),
})

const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
})

const programUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  summary: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  primaryCluster: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  ctaText: z.string().optional(),
  accentColor: z.string().optional(),
  borderColor: z.string().optional(),
  steps: z.array(stepSchema).optional().nullable(),
  benefits: z.array(z.string()).optional().nullable(),
  eligibility: z.array(z.string()).optional().nullable(),
  faqs: z.array(faqSchema).optional().nullable(),
  ctaLink: z.string().optional().nullable(),
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

function formatProgram(program: typeof programs.$inferSelect) {
  return {
    ...program,
    steps: program.steps ? JSON.parse(program.steps) : null,
    benefits: program.benefits ? JSON.parse(program.benefits) : null,
    eligibility: program.eligibility ? JSON.parse(program.eligibility) : null,
    faqs: program.faqs ? JSON.parse(program.faqs) : null,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const programId = parseInt(id)
    
    if (isNaN(programId)) {
      return NextResponse.json({ error: "Invalid program ID" }, { status: 400 })
    }
    
    const program = await db
      .select()
      .from(programs)
      .where(eq(programs.id, programId))
      .limit(1)
    
    if (program.length === 0) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }
    
    return NextResponse.json(formatProgram(program[0]))
  } catch (error) {
    console.error("Error fetching program:", error)
    return NextResponse.json({ error: "Failed to fetch program" }, { status: 500 })
  }
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
    const programId = parseInt(id)
    
    if (isNaN(programId)) {
      return NextResponse.json({ error: "Invalid program ID" }, { status: 400 })
    }
    
    const body = await request.json()
    const parsed = programUpdateSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: parsed.error.flatten() 
      }, { status: 400 })
    }
    
    const data = parsed.data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }
    
    if (data.title !== undefined) updateData.title = data.title
    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.summary !== undefined) updateData.summary = data.summary
    if (data.description !== undefined) updateData.description = data.description
    if (data.primaryCluster !== undefined) updateData.primaryCluster = data.primaryCluster
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured
    if (data.ctaText !== undefined) updateData.ctaText = data.ctaText
    if (data.accentColor !== undefined) updateData.accentColor = data.accentColor
    if (data.borderColor !== undefined) updateData.borderColor = data.borderColor
    if (data.steps !== undefined) updateData.steps = data.steps ? JSON.stringify(data.steps) : null
    if (data.benefits !== undefined) updateData.benefits = data.benefits ? JSON.stringify(data.benefits) : null
    if (data.eligibility !== undefined) updateData.eligibility = data.eligibility ? JSON.stringify(data.eligibility) : null
    if (data.faqs !== undefined) updateData.faqs = data.faqs ? JSON.stringify(data.faqs) : null
    if (data.ctaLink !== undefined) updateData.ctaLink = data.ctaLink
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    
    const updated = await db
      .update(programs)
      .set(updateData)
      .where(eq(programs.id, programId))
      .returning()
    
    if (updated.length === 0) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    await auditLog({
      entityType: "program",
      entityId: programId,
      action: "update",
      details: `Updated program: ${updated[0].title}`,
      metadata: { updatedFields: Object.keys(data) },
    })
    
    return NextResponse.json(formatProgram(updated[0]))
  } catch (error) {
    console.error("Error updating program:", error)
    return NextResponse.json({ error: "Failed to update program" }, { status: 500 })
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
    const programId = parseInt(id)
    
    if (isNaN(programId)) {
      return NextResponse.json({ error: "Invalid program ID" }, { status: 400 })
    }
    
    const deleted = await db
      .delete(programs)
      .where(eq(programs.id, programId))
      .returning()
    
    if (deleted.length === 0) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    await auditLog({
      entityType: "program",
      entityId: programId,
      action: "delete",
      details: `Deleted program: ${deleted[0].title}`,
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting program:", error)
    return NextResponse.json({ error: "Failed to delete program" }, { status: 500 })
  }
}
