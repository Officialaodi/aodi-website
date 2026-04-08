/**
 * Email template variable substitution engine.
 * Provides helpers for rendering {{variable}} placeholders in email bodies and subjects.
 */

export interface TemplateVariable {
  key: string
  description: string
  example: string
}

export const AVAILABLE_VARIABLES: TemplateVariable[] = [
  { key: 'name', description: 'Full name of the recipient', example: 'Amara Osei' },
  { key: 'firstName', description: 'First name only', example: 'Amara' },
  { key: 'email', description: 'Recipient email address', example: 'amara@example.com' },
  { key: 'applicationType', description: 'Type of application submitted', example: 'Mentor Application' },
  { key: 'date', description: 'Current date', example: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
  { key: 'year', description: 'Current year', example: String(new Date().getFullYear()) },
  { key: 'adminDashboardUrl', description: 'Link to admin dashboard', example: 'https://africaofourdreaminitiative.org/admin' },
  { key: 'websiteUrl', description: 'AODI website URL', example: 'https://africaofourdreaminitiative.org' },
  { key: 'contactEmail', description: 'AODI contact email', example: 'info@africaofourdreaminitiative.org' },
  { key: 'unsubscribeUrl', description: 'Unsubscribe link (newsletter only)', example: 'https://africaofourdreaminitiative.org/api/newsletter/unsubscribe?token=...' },
  { key: 'resetUrl', description: 'Password reset link (password-reset template only)', example: 'https://africaofourdreaminitiative.org/admin/reset-password?token=...' },
  { key: 'nextSteps', description: 'Next steps text for the applicant', example: 'Our team will be in touch within 5 business days.' },
  { key: 'programName', description: 'Programme or event name', example: 'EmpowerHer Leadership Programme' },
  { key: 'subject', description: 'The message subject (contact form)', example: 'General Enquiry' },
]

export const SAMPLE_VARIABLES: Record<string, string> = {
  name: 'Amara Osei',
  firstName: 'Amara',
  email: 'amara@example.com',
  applicationType: 'Mentor Application',
  date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
  year: String(new Date().getFullYear()),
  adminDashboardUrl: 'https://africaofourdreaminitiative.org/admin',
  websiteUrl: 'https://africaofourdreaminitiative.org',
  contactEmail: 'info@africaofourdreaminitiative.org',
  unsubscribeUrl: '#unsubscribe',
  resetUrl: '#reset',
  nextSteps: 'Our team will be in touch within 5–7 business days.',
  programName: 'EmpowerHer Leadership Programme',
  subject: 'General Enquiry',
}

/**
 * Substitute {{variable}} placeholders in a template string.
 * Falls back gracefully if a variable is not provided.
 */
export function substituteVariables(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return vars[key] !== undefined ? vars[key] : match
  })
}

export interface SystemTemplate {
  name: string
  slug: string
  subject: string
  body: string
  category: string
  variables: string[]
}

export const SYSTEM_TEMPLATES: SystemTemplate[] = [
  {
    name: 'Password Reset',
    slug: 'password-reset',
    category: 'system',
    subject: 'Reset your AODI admin password',
    variables: ['name', 'resetUrl'],
    body: `Hi {{name}},

We received a request to reset the password for your AODI admin account.

Click the link below to set a new password:
{{resetUrl}}

This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.

For security, this link can only be used once.

— AODI Team`,
  },
  {
    name: 'Application Received (Generic)',
    slug: 'application-received',
    category: 'application',
    subject: 'Your {{applicationType}} has been received — AODI',
    variables: ['name', 'firstName', 'applicationType', 'nextSteps', 'websiteUrl', 'contactEmail'],
    body: `Dear {{firstName}},

Thank you for submitting your {{applicationType}}.

We have successfully received your application and our team will be in touch with you shortly.

{{nextSteps}}

In the meantime, feel free to explore our programmes and initiatives at {{websiteUrl}}.

If you have any urgent questions, please contact us at {{contactEmail}}.

Warm regards,
The AODI Team`,
  },
  {
    name: 'Mentor Application Confirmation',
    slug: 'application-mentor',
    category: 'application',
    subject: 'Thank you for applying to mentor with AODI',
    variables: ['name', 'firstName', 'contactEmail'],
    body: `Dear {{firstName}},

Thank you for your interest in becoming an AODI mentor. We are excited to have you join our growing network of change-makers dedicated to empowering young African talent.

Our team will review your application and reach out within 5–7 business days to discuss the next steps.

If you have any questions in the meantime, please don't hesitate to contact us at {{contactEmail}}.

With gratitude,
The AODI Mentorship Team`,
  },
  {
    name: 'Mentee Application Confirmation',
    slug: 'application-mentee',
    category: 'application',
    subject: 'Your AODI mentee application has been received',
    variables: ['name', 'firstName', 'contactEmail'],
    body: `Dear {{firstName}},

Congratulations on taking this important step! We have received your AODI mentee application and are delighted by your interest in our mentorship programme.

Our matching team will review your profile and contact you within 7–10 business days with mentor match options.

If you have any questions, please contact us at {{contactEmail}}.

Best wishes,
The AODI Mentorship Team`,
  },
  {
    name: 'Volunteer Application Confirmation',
    slug: 'application-volunteer',
    category: 'application',
    subject: 'Thank you for volunteering with AODI',
    variables: ['name', 'firstName', 'contactEmail'],
    body: `Dear {{firstName}},

Thank you for your willingness to volunteer with AODI! Your time and dedication make our mission possible.

Our volunteer coordinator will be in touch within 5 business days to discuss available opportunities that match your skills and interests.

Questions? Email us at {{contactEmail}}.

With appreciation,
The AODI Volunteer Team`,
  },
  {
    name: 'Admin Notification — New Application',
    slug: 'admin-notification',
    category: 'notification',
    subject: 'New {{applicationType}}: {{name}}',
    variables: ['name', 'email', 'applicationType', 'date', 'adminDashboardUrl'],
    body: `A new {{applicationType}} has been received.

Applicant: {{name}}
Email: {{email}}
Date: {{date}}

Log in to the admin dashboard to review this application:
{{adminDashboardUrl}}

— AODI System Notification`,
  },
  {
    name: 'Newsletter Base',
    slug: 'newsletter',
    category: 'newsletter',
    subject: 'AODI Newsletter — {{date}}',
    variables: ['name', 'firstName', 'date', 'year', 'websiteUrl', 'unsubscribeUrl'],
    body: `Dear {{firstName}},

Welcome to the latest edition of the AODI newsletter.

[Your newsletter content goes here]

---
You are receiving this because you subscribed to AODI updates.
To unsubscribe, click here: {{unsubscribeUrl}}

© {{year}} Africa of Our Dream Education Initiative
{{websiteUrl}}`,
  },
  {
    name: 'Contact Form Auto-Reply',
    slug: 'contact-autoreply',
    category: 'general',
    subject: "We've received your message — AODI",
    variables: ['name', 'firstName', 'subject', 'contactEmail'],
    body: `Dear {{firstName}},

Thank you for reaching out to AODI. We have received your message regarding "{{subject}}" and will respond within 2–3 business days.

If your enquiry is urgent, please contact us directly at {{contactEmail}}.

Warm regards,
The AODI Team`,
  },
]
