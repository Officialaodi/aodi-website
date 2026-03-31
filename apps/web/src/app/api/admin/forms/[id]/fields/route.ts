import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { forms, formFields } from "@/lib/schema"
import { eq, asc, and } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { z } from "zod"
import { auditLog } from "@/lib/audit-log"

 export const runtime = 'edge';

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
  section: z.string().optional().nullable(),
  displayOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
})

const bulkFieldsSchema = z.array(fieldSchema.extend({ id: z.number().optional() }))

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
    
    const fields = await db.select()
      .from(formFields)
      .where(eq(formFields.formId, formId))
      .orderBy(asc(formFields.displayOrder))
    
    const formattedFields = fields.map(field => ({
      ...field,
      options: field.options ? JSON.parse(field.options) : null,
      validation: field.validation ? JSON.parse(field.validation) : null,
    }))
    
    return NextResponse.json(formattedFields)
  } catch (error) {
    console.error("Error fetching form fields:", error)
    return NextResponse.json({ error: "Failed to fetch form fields" }, { status: 500 })
  }
}

export async function POST(
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
    
    const [form] = await db.select().from(forms).where(eq(forms.id, formId))
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }
    
    const parsed = fieldSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: parsed.error.flatten() 
      }, { status: 400 })
    }
    
    const data = parsed.data
    
    const newField = await db.insert(formFields).values({
      formId,
      fieldKey: data.fieldKey,
      label: data.label,
      fieldType: data.fieldType,
      placeholder: data.placeholder || null,
      defaultValue: data.defaultValue || null,
      helpText: data.helpText || null,
      isRequired: data.isRequired,
      options: data.options ? JSON.stringify(data.options) : null,
      validation: data.validation ? JSON.stringify(data.validation) : null,
      width: data.width,
      section: data.section || null,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
    }).returning()

    await auditLog({
      entityType: "form_field",
      entityId: newField[0].id,
      action: "create",
      details: `Added field "${data.label}" to form: ${form.name}`,
    })
    
    const formatted = {
      ...newField[0],
      options: newField[0].options ? JSON.parse(newField[0].options) : null,
      validation: newField[0].validation ? JSON.parse(newField[0].validation) : null,
    }
    
    return NextResponse.json(formatted, { status: 201 })
  } catch (error) {
    console.error("Error creating form field:", error)
    return NextResponse.json({ error: "Failed to create form field" }, { status: 500 })
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
    
    const [form] = await db.select().from(forms).where(eq(forms.id, formId))
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }
    
    const parsed = bulkFieldsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: parsed.error.flatten() 
      }, { status: 400 })
    }
    
    const fieldsData = parsed.data
    
    await db.delete(formFields).where(eq(formFields.formId, formId))
    
    if (fieldsData.length > 0) {
      await db.insert(formFields).values(
        fieldsData.map((field, index) => ({
          formId,
          fieldKey: field.fieldKey,
          label: field.label,
          fieldType: field.fieldType,
          placeholder: field.placeholder || null,
          defaultValue: field.defaultValue || null,
          helpText: field.helpText || null,
          isRequired: field.isRequired ?? false,
          options: field.options ? JSON.stringify(field.options) : null,
          validation: field.validation ? JSON.stringify(field.validation) : null,
          width: field.width || "full",
          section: field.section || null,
          displayOrder: index,
          isActive: field.isActive ?? true,
        }))
      )
    }

    await auditLog({
      entityType: "form",
      entityId: formId,
      action: "update",
      details: `Updated fields for form: ${form.name}`,
    })
    
    const updatedFields = await db.select()
      .from(formFields)
      .where(eq(formFields.formId, formId))
      .orderBy(asc(formFields.displayOrder))
    
    const formattedFields = updatedFields.map(field => ({
      ...field,
      options: field.options ? JSON.parse(field.options) : null,
      validation: field.validation ? JSON.parse(field.validation) : null,
    }))
    
    return NextResponse.json(formattedFields)
  } catch (error) {
    console.error("Error updating form fields:", error)
    return NextResponse.json({ error: "Failed to update form fields" }, { status: 500 })
  }
}
