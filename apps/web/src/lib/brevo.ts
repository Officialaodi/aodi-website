import { db } from './db'
import { emailLogs, emailTemplates } from './schema'
import { eq, and } from 'drizzle-orm'
import { substituteVariables } from './email-templates'

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
const AODI_GREEN = '#0F3D2E'
const AODI_GOLD = '#C9A24D'

function getApiKey() {
  return process.env.BREVO_API_KEY
}

function getSenderEmail() {
  return process.env.BREVO_SENDER_EMAIL || 'noreply@africaofourdreaminitiative.org'
}

function getSenderName() {
  return process.env.BREVO_SENDER_NAME || 'AODI'
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://africaofourdreaminitiative.org'
}

// ─── Base HTML template ───────────────────────────────────────────────────────

function baseHtml(title: string, previewText: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="x-apple-disable-message-reformatting"/>
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7f9;font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f7f9;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <!-- Header -->
      <tr>
        <td style="background:${AODI_GREEN};padding:28px 32px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px;">AODI</div>
          <div style="font-size:11px;color:${AODI_GOLD};margin-top:4px;letter-spacing:1px;text-transform:uppercase;">Africa of Our Dream Education Initiative</div>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="padding:32px;">
          ${bodyContent}
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background:#f5f7f9;padding:24px 32px;text-align:center;border-top:1px solid #e8ecef;">
          <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">Africa of Our Dream Education Initiative (AODI) · UK Registered</p>
          <p style="margin:0;font-size:11px;color:#9ca3af;">
            <a href="${getBaseUrl()}" style="color:${AODI_GREEN};text-decoration:none;">africaofourdreaminitiative.org</a>
            &nbsp;·&nbsp;
            <a href="mailto:info@africaofourdreaminitiative.org" style="color:${AODI_GREEN};text-decoration:none;">info@africaofourdreaminitiative.org</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:${AODI_GREEN};line-height:1.3;">${text}</h1>`
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">${text}</p>`
}

function button(text: string, url: string): string {
  return `<div style="margin:24px 0;">
    <a href="${url}" style="display:inline-block;background:${AODI_GREEN};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:6px;letter-spacing:0.3px;">${text}</a>
  </div>`
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e8ecef;margin:24px 0;"/>`
}

function highlight(text: string): string {
  return `<div style="background:#f0faf5;border-left:4px solid ${AODI_GREEN};padding:16px;border-radius:0 6px 6px 0;margin:16px 0;">
    <p style="margin:0;font-size:14px;color:${AODI_GREEN};font-style:italic;">${text}</p>
  </div>`
}

function dataRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 12px;border:1px solid #e8ecef;font-weight:600;font-size:13px;color:#374151;background:#f9fafb;width:40%;">${label}</td>
    <td style="padding:8px 12px;border:1px solid #e8ecef;font-size:13px;color:#374151;">${value}</td>
  </tr>`
}

/**
 * Converts a plain-text template body into styled HTML email paragraphs.
 * Supports HTML tags written directly in the template body.
 */
function templateBodyToHtml(body: string): string {
  return body
    .split(/\n\n+/)
    .filter(s => s.trim())
    .map(para => {
      const content = para.trim().replace(/\n/g, '<br/>')
      return `<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">${content}</p>`
    })
    .join('')
}

// ─── DB template lookup ────────────────────────────────────────────────────────

/**
 * Look up a transactional template from the database by slug.
 * Returns null if not found or inactive — caller should use hardcoded fallback.
 */
async function getDbTemplate(
  slug: string,
  vars: Record<string, string>
): Promise<{ subject: string; htmlBody: string } | null> {
  try {
    const [tmpl] = await db
      .select({ subject: emailTemplates.subject, body: emailTemplates.body })
      .from(emailTemplates)
      .where(and(eq(emailTemplates.slug, slug), eq(emailTemplates.isActive, true)))

    if (!tmpl) return null

    const subject = substituteVariables(tmpl.subject, vars)
    const bodyText = substituteVariables(tmpl.body, vars)
    const htmlBody = templateBodyToHtml(bodyText)
    return { subject, htmlBody }
  } catch {
    return null
  }
}

// ─── Core send function ───────────────────────────────────────────────────────

export interface SendEmailParams {
  to: { email: string; name?: string } | { email: string; name?: string }[]
  subject: string
  html: string
  text?: string
  replyTo?: { email: string; name?: string }
  cc?: { email: string; name?: string }[]
  bcc?: { email: string; name?: string }[]
  tags?: string[]
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendBrevoEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = getApiKey()

  if (!apiKey) {
    console.log('[Brevo] API key not configured — email not sent:', params.subject)
    return { success: false, error: 'BREVO_API_KEY not configured' }
  }

  const recipients = Array.isArray(params.to) ? params.to : [params.to]

  try {
    const payload: Record<string, unknown> = {
      sender: { email: getSenderEmail(), name: getSenderName() },
      to: recipients,
      subject: params.subject,
      htmlContent: params.html,
      textContent: params.text || params.subject,
    }

    if (params.replyTo) payload.replyTo = params.replyTo
    if (params.tags) payload.tags = params.tags
    if (params.cc && params.cc.length > 0) payload.cc = params.cc
    if (params.bcc && params.bcc.length > 0) payload.bcc = params.bcc

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (response.ok || response.status === 201) {
      const data = await response.json().catch(() => ({}))
      return { success: true, messageId: data.messageId }
    }

    const errorText = await response.text()
    console.error('[Brevo] Send failed:', response.status, errorText)
    return { success: false, error: `${response.status}: ${errorText}` }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error('[Brevo] Exception:', error)
    return { success: false, error }
  }
}

// ─── Log email to DB ──────────────────────────────────────────────────────────

export async function logEmail(params: {
  recipientEmail: string
  recipientName?: string
  subject: string
  body: string
  status: string
  applicationId?: number
  contactId?: number
  templateId?: number
  errorMessage?: string
  brevoMessageId?: string
}) {
  try {
    await db.insert(emailLogs).values({
      recipientEmail: params.recipientEmail,
      recipientName: params.recipientName,
      subject: params.subject,
      body: params.body,
      status: params.status,
      applicationId: params.applicationId,
      contactId: params.contactId,
      templateId: params.templateId,
      errorMessage: params.errorMessage,
      brevoMessageId: params.brevoMessageId,
    })
  } catch (err) {
    console.error('[Brevo] Failed to log email:', err)
  }
}

// ─── Password reset email ─────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
): Promise<SendEmailResult> {
  const firstName = name.split(' ')[0]
  const baseUrl = getBaseUrl()

  // Try DB template first
  const dbTmpl = await getDbTemplate('password-reset', {
    name, firstName, resetUrl, websiteUrl: baseUrl,
    contactEmail: 'info@africaofourdreaminitiative.org',
  })

  let subject: string
  let html: string

  if (dbTmpl) {
    subject = dbTmpl.subject
    html = baseHtml(subject, 'You requested a password reset for your AODI admin account.', dbTmpl.htmlBody)
  } else {
    subject = 'Reset your AODI admin password'
    html = baseHtml(subject, 'You requested a password reset for your AODI admin account.', `
      ${heading('Password Reset Request')}
      ${paragraph(`Hi ${firstName},`)}
      ${paragraph('We received a request to reset the password for your AODI admin account. Click the button below to set a new password.')}
      ${button('Reset My Password', resetUrl)}
      ${highlight('This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.')}
      ${divider()}
      ${paragraph(`For security, this link can only be used once. If you need another reset link, visit the <a href="${baseUrl}/admin/forgot-password" style="color:${AODI_GREEN};">forgot password page</a>.`)}
    `)
  }

  const result = await sendBrevoEmail({ to: { email: to, name }, subject, html, tags: ['password-reset'] })
  await logEmail({ recipientEmail: to, recipientName: name, subject, body: resetUrl, status: result.success ? 'sent' : 'failed', errorMessage: result.error, brevoMessageId: result.messageId })
  return result
}

// ─── Application acknowledgement emails ──────────────────────────────────────

const formLabels: Record<string, string> = {
  mentor: 'Mentor Application',
  mentee: 'Mentee Application',
  volunteer: 'Volunteer Application',
  partner: 'Partnership Enquiry',
  'campus-ambassador': 'Campus Ambassador Application',
  empowerher: 'EmpowerHer Application',
  'partner-africa': 'Partner Africa Application',
  'stem-workshops': 'STEM Workshop Interest',
  'chembridge-2026': 'ChemBridge 2026 Registration',
  contact: 'Message',
}

const nextSteps: Record<string, string> = {
  mentor: 'Our team will review your application and reach out within 5–7 business days to discuss the next steps.',
  mentee: 'Our matching team will review your profile and contact you within 7–10 business days with mentor match options.',
  volunteer: 'Our volunteer coordinator will be in touch within 5 business days to discuss available opportunities.',
  partner: 'Our partnerships team will review your enquiry and contact you within 3–5 business days.',
  'campus-ambassador': 'Our campus engagement team will review your application and respond within 5–7 business days.',
  empowerher: 'Our EmpowerHer programme coordinator will review your application and be in touch within 7 business days.',
  'partner-africa': 'Our Africa partnerships team will review your application and be in touch within 5–7 business days.',
  'stem-workshops': 'Our STEM team will note your interest and reach out with upcoming workshop details.',
  'chembridge-2026': 'Your registration for ChemBridge Inclusion Accelerator 2026 has been confirmed. Further details will be sent closer to the event.',
  contact: 'Our team will review your message and respond within 2–3 business days.',
}

export async function sendApplicationAcknowledgement(
  formType: string,
  to: string,
  name: string,
  applicationId?: number
): Promise<SendEmailResult> {
  const firstName = name.split(' ')[0]
  const label = formLabels[formType] || 'Submission'
  const steps = nextSteps[formType] || 'Our team will be in touch shortly.'
  const baseUrl = getBaseUrl()
  const contactEmail = 'info@africaofourdreaminitiative.org'

  // Try form-specific DB template first (e.g. "ack-mentor", "ack-chembridge-2026")
  const templateSlug = `ack-${formType}`
  const dbTmpl = await getDbTemplate(templateSlug, {
    name, firstName, applicationType: label, nextSteps: steps,
    websiteUrl: baseUrl, contactEmail,
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    year: String(new Date().getFullYear()),
  })

  let subject: string
  let html: string

  if (dbTmpl) {
    subject = dbTmpl.subject
    html = baseHtml(subject, `Thank you for your ${label.toLowerCase()}.`, dbTmpl.htmlBody)
  } else {
    // Hardcoded fallback
    subject = formType === 'contact'
      ? "We've received your message — AODI"
      : `Your ${label} has been received — AODI`
    html = baseHtml(subject, `Thank you for your ${label.toLowerCase()}.`, `
      ${heading(`Thank you, ${firstName}!`)}
      ${paragraph(`We have received your <strong>${label}</strong> and wanted to confirm it has been successfully submitted.`)}
      ${highlight(steps)}
      ${divider()}
      ${paragraph('In the meantime, feel free to explore our website to learn more about our programmes and impact.')}
      ${button('Visit AODI Website', baseUrl)}
      ${paragraph(`If you have any urgent questions, please contact us at <a href="mailto:${contactEmail}" style="color:${AODI_GREEN};">${contactEmail}</a>.`)}
    `)
  }

  const result = await sendBrevoEmail({ to: { email: to, name }, subject, html, tags: ['application-ack', formType] })
  await logEmail({ recipientEmail: to, recipientName: name, subject, body: steps, status: result.success ? 'sent' : 'failed', applicationId, errorMessage: result.error, brevoMessageId: result.messageId })
  return result
}

// ─── Admin notification email ─────────────────────────────────────────────────

function formatFieldName(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace(/_/g, ' ')
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export async function sendAdminNotification(params: {
  formType: string
  submitterName: string
  email: string
  payload: Record<string, unknown>
  applicationId?: number
}): Promise<SendEmailResult> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin.board@africaofourdreaminitiative.org'
  const label = formLabels[params.formType] || 'Form Submission'
  const baseUrl = getBaseUrl()
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  // Try DB template first
  const dbTmpl = await getDbTemplate('admin-notification', {
    name: params.submitterName,
    email: params.email,
    applicationType: label,
    date: new Date().toUTCString(),
    adminDashboardUrl: `${baseUrl}/admin`,
    websiteUrl: baseUrl,
    year: String(new Date().getFullYear()),
  })

  const subject = dbTmpl
    ? dbTmpl.subject
    : `New ${label}: ${params.submitterName}`

  const rows = Object.entries(params.payload)
    .filter(([k]) => !['captchaToken', 'agreedToPolicy', 'type'].includes(k))
    .map(([k, v]) => dataRow(formatFieldName(k), formatValue(v)))
    .join('')

  const html = baseHtml(subject, `New ${label} from ${params.submitterName}`, `
    ${dbTmpl ? dbTmpl.htmlBody : `
      ${heading(`New ${label}`)}
      ${paragraph(`A new submission has been received from <strong>${params.submitterName}</strong> (${params.email}).`)}
    `}
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
      ${dataRow('Submitted', new Date().toUTCString())}
      ${dataRow('Name', params.submitterName)}
      ${dataRow('Email', params.email)}
      ${rows}
    </table>
    ${divider()}
    ${button('View in Admin Dashboard', `${baseUrl}/admin`)}
  `)

  const result = await sendBrevoEmail({ to: { email: adminEmail, name: 'AODI Admin' }, subject, html, replyTo: { email: params.email, name: params.submitterName }, tags: ['admin-notification'] })
  return result
}

// ─── Contact form acknowledgement ─────────────────────────────────────────────

export async function sendContactAcknowledgement(
  to: string,
  name: string,
  subject: string,
  contactId?: number
): Promise<SendEmailResult> {
  return sendApplicationAcknowledgement('contact', to, name, contactId)
}

// ─── Admin manual / bulk email ────────────────────────────────────────────────

export async function sendCustomEmail(params: {
  to: string
  name?: string
  ccEmail?: string
  bccEmail?: string
  subject: string
  htmlBody: string
  applicationId?: number
  contactId?: number
  templateId?: number
}): Promise<SendEmailResult> {
  const html = baseHtml(params.subject, params.subject, params.htmlBody)
  const emailParams: SendEmailParams = {
    to: { email: params.to, name: params.name },
    subject: params.subject,
    html,
    tags: ['manual-send'],
    ...(params.ccEmail ? { cc: [{ email: params.ccEmail }] } : {}),
    ...(params.bccEmail ? { bcc: [{ email: params.bccEmail }] } : {}),
  }
  const result = await sendBrevoEmail(emailParams)
  await logEmail({
    recipientEmail: params.to,
    recipientName: params.name,
    subject: params.subject,
    body: params.htmlBody,
    status: result.success ? 'sent' : 'failed',
    applicationId: params.applicationId,
    contactId: params.contactId,
    templateId: params.templateId,
    errorMessage: result.error,
    brevoMessageId: result.messageId,
  })
  return result
}

export async function sendBulkEmail(
  recipients: { email: string; name?: string; applicationId?: number; contactId?: number }[],
  subject: string,
  htmlBody: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  let sent = 0
  let failed = 0
  const errors: string[] = []

  for (const recipient of recipients) {
    const result = await sendCustomEmail({
      to: recipient.email,
      name: recipient.name,
      subject,
      htmlBody,
      applicationId: recipient.applicationId,
      contactId: recipient.contactId,
    })
    if (result.success) sent++
    else {
      failed++
      errors.push(`${recipient.email}: ${result.error}`)
    }
    await new Promise(r => setTimeout(r, 100))
  }

  return { sent, failed, errors }
}

// ─── Sync contact to Brevo contact list ──────────────────────────────────────

export async function syncContactToBrevo(params: {
  email: string
  firstName?: string
  lastName?: string
  attributes?: Record<string, string | number | boolean>
  listIds?: number[]
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = getApiKey()
  if (!apiKey) {
    console.log('[Brevo] API key not configured — contact sync skipped')
    return { success: false, error: 'BREVO_API_KEY not configured' }
  }

  try {
    const payload: Record<string, unknown> = {
      email: params.email,
      attributes: {
        FIRSTNAME: params.firstName || '',
        LASTNAME: params.lastName || '',
        ...(params.attributes || {}),
      },
      updateEnabled: true,
    }
    if (params.listIds && params.listIds.length > 0) {
      payload.listIds = params.listIds
    }

    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (response.ok || response.status === 201 || response.status === 204) {
      return { success: true }
    }

    const errorText = await response.text()
    if (response.status === 400 && errorText.includes('already exist')) {
      return { success: true }
    }

    console.error('[Brevo] Contact sync failed:', response.status, errorText)
    return { success: false, error: `${response.status}: ${errorText}` }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error('[Brevo] Contact sync exception:', error)
    return { success: false, error }
  }
}

// ─── Newsletter email ─────────────────────────────────────────────────────────

export async function sendNewsletterEmail(params: {
  to: string
  name?: string
  subject: string
  htmlBody: string
  unsubscribeToken: string
}): Promise<SendEmailResult> {
  const baseUrl = getBaseUrl()
  const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${params.unsubscribeToken}`

  const fullHtml = baseHtml(params.subject, params.subject, `
    ${params.htmlBody}
    ${divider()}
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">
      You are receiving this because you subscribed to AODI updates.
      <br/>
      <a href="${unsubscribeUrl}" style="color:#9ca3af;">Unsubscribe</a>
    </p>
  `)

  const result = await sendBrevoEmail({ to: { email: params.to, name: params.name }, subject: params.subject, html: fullHtml, tags: ['newsletter'] })
  await logEmail({ recipientEmail: params.to, recipientName: params.name, subject: params.subject, body: params.htmlBody.slice(0, 500), status: result.success ? 'sent' : 'failed', errorMessage: result.error, brevoMessageId: result.messageId })
  return result
}
