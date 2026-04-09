import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { forms, formFields, applications } from "@/lib/schema"
import { eq, asc } from "drizzle-orm"
import { z } from "zod"
import { verifyCaptcha } from "@/lib/captcha"
import { sendApplicationAcknowledgement, sendAdminNotification } from "@/lib/brevo"
import { upsertCrmContact } from "@/lib/crm-contacts"

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const [form] = await db.select().from(forms).where(eq(forms.slug, slug))
    
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }
    
    if (!form.isEnabled) {
      return NextResponse.json({ 
        error: "Form closed",
        message: form.closedMessage || "This form is currently closed for submissions."
      }, { status: 400 })
    }
    
    const body = await request.json()
    
    if (!body.agreedToPolicy) {
      return NextResponse.json({ 
        error: "You must agree to our policies to submit this form."
      }, { status: 400 })
    }
    
    if (form.requiresHcaptcha) {
      const captchaValid = await verifyCaptcha(body.captchaToken)
      if (!captchaValid) {
        return NextResponse.json({ 
          error: "Please complete the captcha verification."
        }, { status: 400 })
      }
    }
    
    const fields = await db.select()
      .from(formFields)
      .where(eq(formFields.formId, form.id))
      .orderBy(asc(formFields.displayOrder))
    
    const errors: Record<string, string> = {}
    const formData: Record<string, unknown> = {}
    
    for (const field of fields) {
      if (!field.isActive) continue
      
      const value = body[field.fieldKey]
      
      if (field.isRequired && (!value || (typeof value === "string" && value.trim() === ""))) {
        errors[field.fieldKey] = `${field.label} is required`
        continue
      }
      
      if (value) {
        const validation = field.validation ? JSON.parse(field.validation) : null
        
        if (field.fieldType === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            errors[field.fieldKey] = "Please enter a valid email address"
            continue
          }
        }
        
        if (validation) {
          if (validation.minLength && typeof value === "string" && value.length < validation.minLength) {
            errors[field.fieldKey] = `${field.label} must be at least ${validation.minLength} characters`
            continue
          }
          if (validation.maxLength && typeof value === "string" && value.length > validation.maxLength) {
            errors[field.fieldKey] = `${field.label} must be at most ${validation.maxLength} characters`
            continue
          }
          if (validation.pattern) {
            const regex = new RegExp(validation.pattern)
            if (!regex.test(value)) {
              errors[field.fieldKey] = `${field.label} format is invalid`
              continue
            }
          }
        }
        
        formData[field.fieldKey] = value
      }
    }
    
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ 
        error: "Validation failed",
        details: errors
      }, { status: 400 })
    }
    
    const fullName = (body.firstName && body.lastName) 
      ? `${body.firstName} ${body.lastName}`.trim()
      : body.fullName || body.name || body.email || "Anonymous"
    
    const email = body.email || "unknown@example.com"
    
    const message = body.message || body.interest || body.motivation || 
      `Submitted via ${form.name}`
    
    const newApplication = await db.insert(applications).values({
      type: form.slug,
      fullName,
      email,
      organization: body.organization || body.company || null,
      message,
      payload: JSON.stringify({
        formId: form.id,
        formName: form.name,
        submittedAt: new Date().toISOString(),
        ...formData,
      }),
      status: "new",
    }).returning()
    
    upsertCrmContact({
      fullName,
      email,
      formType: form.slug,
      payload: { formId: form.id, formName: form.name, ...formData },
      applicationId: newApplication[0].id,
    }).catch(err => console.error('[CRM] Contact upsert failed:', err))

    sendApplicationAcknowledgement(form.slug, email, fullName, newApplication[0].id)
      .catch(err => console.error('[Brevo] Form acknowledgement failed:', err))

    sendAdminNotification({
      formType: form.slug,
      submitterName: fullName,
      email,
      payload: formData,
      applicationId: newApplication[0].id,
    }).catch(err => console.error('[Brevo] Admin notification failed:', err))

    return NextResponse.json({
      success: true,
      message: form.successMessage || "Thank you! Your submission has been received.",
      applicationId: newApplication[0].id,
    })
  } catch (error) {
    console.error("Error submitting form:", error)
    return NextResponse.json({ error: "Failed to submit form" }, { status: 500 })
  }
}
