import { db } from './db'
import { contacts } from './schema'
import { eq } from 'drizzle-orm'

const formTypeLabels: Record<string, string> = {
  mentor: 'Mentor Application',
  mentee: 'Mentee Application',
  volunteer: 'Volunteer Application',
  partner: 'Partnership Enquiry',
  'campus-ambassador': 'Campus Ambassador Application',
  empowerher: 'EmpowerHer Application',
  'partner-africa': 'Partner Africa Application',
  'stem-workshops': 'STEM Workshops Interest',
  'chembridge-2026': 'ChemBridge 2026 Registration',
  contact: 'Contact Form',
}

const MESSAGE_FORM_TYPES = new Set(['contact'])

/**
 * Creates a CRM contact from any form submission.
 * - Message-type forms (contact): always insert — every message is a new entry.
 * - Application forms: skips if a contact with the same email already exists
 *   to prevent duplicate applicant records.
 * Silently ignores errors so it never breaks the main submission flow.
 */
export async function upsertCrmContact(params: {
  fullName: string
  email: string
  formType: string
  payload?: Record<string, unknown>
  applicationId?: number
}): Promise<void> {
  try {
    const normalizedEmail = params.email.toLowerCase().trim()
    const label = formTypeLabels[params.formType] || params.formType
    const summary = params.payload
      ? Object.entries(params.payload)
          .filter(([k]) => !['captchaToken', 'agreedToPolicy', 'formId', 'formName', 'submittedAt'].includes(k))
          .slice(0, 5)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
      : `Submitted via ${label}`

    if (!MESSAGE_FORM_TYPES.has(params.formType)) {
      const existing = await db
        .select({ id: contacts.id })
        .from(contacts)
        .where(eq(contacts.email, normalizedEmail))
        .limit(1)

      if (existing.length > 0) {
        console.log(`[CRM] Contact already exists for ${normalizedEmail}, skipping duplicate applicant record.`)
        return
      }
    }

    await db.insert(contacts).values({
      fullName: params.fullName,
      email: normalizedEmail,
      subject: label,
      message: summary || `Submitted via ${label}`,
      status: 'new',
      payload: params.payload ? JSON.stringify(params.payload) : null,
    })
  } catch (err) {
    console.error('[CRM] Failed to create contact from submission:', err)
  }
}
