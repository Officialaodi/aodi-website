import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { forms, formFields } from "@/lib/schema"
import { asc, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { z } from "zod"
import { auditLog } from "@/lib/audit-log"

 export const runtime = 'edge';

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().optional().nullable(),
  isEnabled: z.boolean().optional().default(true),
  closedMessage: z.string().optional().default("This form is currently closed for submissions."),
  successMessage: z.string().optional().default("Thank you! Your submission has been received."),
  submitButtonText: z.string().optional().default("Submit"),
  requiresHcaptcha: z.boolean().optional().default(false),
  notifyEmail: z.string().optional().nullable(),
  displayOrder: z.number().int().min(0).optional().default(0),
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
    const data = await db.select().from(forms).orderBy(asc(forms.displayOrder))
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching forms:", error)
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = formSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: parsed.error.flatten() 
      }, { status: 400 })
    }
    
    const data = parsed.data
    
    const newForm = await db.insert(forms).values({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      isEnabled: data.isEnabled,
      closedMessage: data.closedMessage,
      successMessage: data.successMessage,
      submitButtonText: data.submitButtonText,
      isBuiltIn: false,
      requiresHcaptcha: data.requiresHcaptcha,
      notifyEmail: data.notifyEmail || null,
      displayOrder: data.displayOrder,
    }).returning()

    await auditLog({
      entityType: "form",
      entityId: newForm[0].id,
      action: "create",
      details: `Created form: ${data.name}`,
    })
    
    return NextResponse.json(newForm[0], { status: 201 })
  } catch (error) {
    console.error("Error creating form:", error)
    return NextResponse.json({ error: "Failed to create form" }, { status: 500 })
  }
}
