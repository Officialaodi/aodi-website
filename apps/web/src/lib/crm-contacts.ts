import { db } from './db'
import { contacts } from './schema'
import { eq, sql } from 'drizzle-orm'

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

/**
 * Upserts a CRM contact by email.
 * - If the email already exists: updates the name and timestamp — never creates a duplicate.
 * - If the email is new: creates a fresh contact record.
 *
 * All form submissions are stored in the `applications` table and can be retrieved
 * by email to build a full submission history for any contact.
 *
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

    const existing = await db
      .select({ id: contacts.id })
      .from(contacts)
      .where(eq(contacts.email, normalizedEmail))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(contacts)
        .set({
          fullName: params.fullName,
          updatedAt: sql`now()`,
        })
        .where(eq(contacts.email, normalizedEmail))
      console.log(`[CRM] Updated existing contact for ${normalizedEmail}`)
      return
    }

    await db.insert(contacts).values({
      fullName: params.fullName,
      email: normalizedEmail,
      subject: label,
      message: summary || `Submitted via ${label}`,
      status: 'new',
      payload: params.payload ? JSON.stringify(params.payload) : null,
    })
    console.log(`[CRM] Created new contact for ${normalizedEmail}`)
  } catch (err) {
    console.error('[CRM] Failed to upsert contact from submission:', err)
  }
}
