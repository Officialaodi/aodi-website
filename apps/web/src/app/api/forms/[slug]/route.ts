import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { forms, formFields, events } from "@/lib/schema"
import { eq, asc } from "drizzle-orm"

 export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const [form] = await db.select().from(forms).where(eq(forms.slug, slug))
    
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }
    
    const fields = await db.select()
      .from(formFields)
      .where(eq(formFields.formId, form.id))
      .orderBy(asc(formFields.displayOrder))
    
    const formattedFields = fields.map(field => {
      let parsedOptions = null
      if (field.options) {
        try {
          const rawOptions = JSON.parse(field.options)
          if (Array.isArray(rawOptions)) {
            parsedOptions = rawOptions.map(opt => {
              if (typeof opt === 'string') {
                return { label: opt, value: opt }
              }
              return opt
            })
          }
        } catch (e) {
          console.error("Failed to parse options for field:", field.fieldKey)
        }
      }
      return {
        ...field,
        options: parsedOptions,
        validation: field.validation ? JSON.parse(field.validation) : null,
      }
    })
    
    let linkedEvent = null
    if (form.eventId) {
      const [event] = await db.select().from(events).where(eq(events.id, form.eventId))
      if (event) {
        linkedEvent = {
          id: event.id,
          title: event.title,
          subtitle: event.subtitle,
          slug: event.slug,
          heroImage: event.heroImage,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
        }
      }
    }
    
    return NextResponse.json({
      id: form.id,
      slug: form.slug,
      name: form.name,
      description: form.description,
      isEnabled: form.isEnabled,
      closedMessage: form.closedMessage,
      successMessage: form.successMessage,
      submitButtonText: form.submitButtonText,
      isBuiltIn: form.isBuiltIn,
      requiresHcaptcha: form.requiresHcaptcha,
      eventId: form.eventId,
      event: linkedEvent,
      fields: formattedFields,
    })
  } catch (error) {
    console.error("Error fetching form:", error)
    return NextResponse.json({ error: "Failed to fetch form" }, { status: 500 })
  }
}
