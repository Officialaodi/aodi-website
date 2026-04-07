import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { forms, formFields } from "@/lib/schema"
import { eq, asc } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { z } from "zod"
import { auditLog } from "@/lib/audit-log"

export const dynamic = 'force-dynamic'

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

const fieldSchema = z.object({
  fieldKey: z.string().min(1),
  label: z.string().min(1),
  fieldType: z.enum(["text", "email", "phone", "textarea", "select", "checkbox", "radio", "number", "date", "url", "country"]),
  placeholder: z.string().optional().nullable(),
  defaultValue: z.string().optional().nullable(),
  helpText: z.string().optional().nullable(),
  isRequired: z.boolean().optional().default(false),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional().nullable(),
  validation: z.object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
  }).optional().nullable(),
  width: z.enum(["full", "half"]).optional().default("full"),
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const formId = parseInt(id)
    
    const [form] = await db.select().from(forms).where(eq(forms.id, formId))
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }
    
    const fields = await db.select()
      .from(formFields)
      .where(eq(formFields.formId, formId))
      .orderBy(asc(formFields.displayOrder))
    
    const formattedFields = fields.map(field => ({
      ...field,
      options: field.options ? JSON.parse(field.options) : null,
      validation: field.validation ? JSON.parse(field.validation) : null,
    }))
    
    return NextResponse.json({ ...form, fields: formattedFields })
  } catch (error) {
    console.error("Error fetching form:", error)
    return NextResponse.json({ error: "Failed to fetch form" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const formId = parseInt(id)
    const body = await request.json()
    
    const [existingForm] = await db.select().from(forms).where(eq(forms.id, formId))
    if (!existingForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }
    
    const parsed = formSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: parsed.error.flatten() 
      }, { status: 400 })
    }
    
    const data = parsed.data
    
    const updatedForm = await db.update(forms)
      .set({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        isEnabled: data.isEnabled,
        closedMessage: data.closedMessage,
        successMessage: data.successMessage,
        submitButtonText: data.submitButtonText,
        requiresHcaptcha: data.requiresHcaptcha,
        notifyEmail: data.notifyEmail || null,
        displayOrder: data.displayOrder,
        updatedAt: new Date(),
      })
      .where(eq(forms.id, formId))
      .returning()

    await auditLog({
      entityType: "form",
      entityId: formId,
      action: "update",
      details: `Updated form: ${data.name}`,
    })
    
    return NextResponse.json(updatedForm[0])
  } catch (error) {
    console.error("Error updating form:", error)
    return NextResponse.json({ error: "Failed to update form" }, { status: 500 })
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
    const formId = parseInt(id)
    
    const [existingForm] = await db.select().from(forms).where(eq(forms.id, formId))
    if (!existingForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }
    
    if (existingForm.isBuiltIn) {
      return NextResponse.json({ error: "Cannot delete built-in forms" }, { status: 400 })
    }
    
    await db.delete(formFields).where(eq(formFields.formId, formId))
    await db.delete(forms).where(eq(forms.id, formId))

    await auditLog({
      entityType: "form",
      entityId: formId,
      action: "delete",
      details: `Deleted form: ${existingForm.name}`,
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting form:", error)
    return NextResponse.json({ error: "Failed to delete form" }, { status: 500 })
  }
}
