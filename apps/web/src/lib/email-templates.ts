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
  description?: string
}

// ─── Transactional Templates ──────────────────────────────────────────────────
// These are automatically sent by the platform. Edit them in Admin → Email Templates → Transactional.

export const TRANSACTIONAL_TEMPLATES: SystemTemplate[] = [
  {
    name: 'Password Reset',
    slug: 'password-reset',
    category: 'transactional',
    description: 'Sent when an admin requests a password reset.',
    subject: 'Reset your AODI admin password',
    variables: ['name', 'firstName', 'resetUrl'],
    body: `Hi {{firstName}},

We received a request to reset the password for your AODI admin account. Click the link below to set a new password:

{{resetUrl}}

This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.

For security, this link can only be used once.

— AODI Team`,
  },
  {
    name: 'Mentor Application — Acknowledgement',
    slug: 'ack-mentor',
    category: 'transactional',
    description: 'Sent automatically to every mentor applicant after they submit.',
    subject: 'Your Mentor Application has been received — AODI',
    variables: ['name', 'firstName', 'websiteUrl', 'contactEmail'],
    body: `Dear {{firstName}},

Thank you for your interest in becoming an AODI mentor! We are excited to have you join our growing network of change-makers dedicated to empowering young African talent.

We have received your Mentor Application and wanted to confirm it has been successfully submitted.

Our team will review your application and reach out within 5–7 business days to discuss the next steps.

In the meantime, feel free to explore our website to learn more about our programmes and impact: {{websiteUrl}}

If you have any urgent questions, please contact us at {{contactEmail}}.

With gratitude,
The AODI Mentorship Team`,
  },
  {
    name: 'Mentee Application — Acknowledgement',
    slug: 'ack-mentee',
    category: 'transactional',
    description: 'Sent automatically to every mentee applicant after they submit.',
    subject: 'Your Mentee Application has been received — AODI',
    variables: ['name', 'firstName', 'websiteUrl', 'contactEmail'],
    body: `Dear {{firstName}},

Congratulations on taking this important step! We have received your AODI Mentee Application and are delighted by your interest in our mentorship programme.

Our matching team will review your profile and contact you within 7–10 business days with mentor match options.

In the meantime, feel free to explore our website: {{websiteUrl}}

If you have any questions, please contact us at {{contactEmail}}.

Best wishes,
The AODI Mentorship Team`,
  },
  {
    name: 'Volunteer Application — Acknowledgement',
    slug: 'ack-volunteer',
    category: 'transactional',
    description: 'Sent automatically to every volunteer applicant after they submit.',
    subject: 'Your Volunteer Application has been received — AODI',
    variables: ['name', 'firstName', 'websiteUrl', 'contactEmail'],
    body: `Dear {{firstName}},

Thank you for your willingness to volunteer with AODI! Your time and dedication make our mission possible.

We have received your Volunteer Application and wanted to confirm it has been successfully submitted.

Our volunteer coordinator will be in touch within 5 business days to discuss available opportunities that match your skills and interests.

In the meantime, feel free to explore our website: {{websiteUrl}}

Questions? Email us at {{contactEmail}}.

With appreciation,
The AODI Volunteer Team`,
  },
  {
    name: 'Partner Enquiry — Acknowledgement',
    slug: 'ack-partner',
    category: 'transactional',
    description: 'Sent automatically to every partnership enquiry after submission.',
    subject: 'Your Partnership Enquiry has been received — AODI',
    variables: ['name', 'firstName', 'websiteUrl', 'contactEmail'],
    body: `Dear {{firstName}},

Thank you for your interest in partnering with AODI. We are thrilled to explore how we can work together to advance education and leadership development across Africa.

We have received your Partnership Enquiry and wanted to confirm it has been successfully submitted.

Our partnerships team will review your enquiry and contact you within 3–5 business days.

In the meantime, feel free to explore our programmes and impact: {{websiteUrl}}

If you have any urgent questions, please contact us at {{contactEmail}}.

Warm regards,
The AODI Partnerships Team`,
  },
  {
    name: 'Campus Ambassador Application — Acknowledgement',
    slug: 'ack-campus-ambassador',
    category: 'transactional',
    description: 'Sent automatically to every Campus Ambassador applicant after they submit.',
    subject: 'Your Campus Ambassador Application has been received — AODI',
    variables: ['name', 'firstName', 'websiteUrl', 'contactEmail'],
    body: `Dear {{firstName}},

Thank you for applying to become an AODI Campus Ambassador! Your enthusiasm for our mission means a great deal to us.

We have received your Campus Ambassador Application and wanted to confirm it has been successfully submitted.

Our campus engagement team will review your application and respond within 5–7 business days.

In the meantime, explore what we do at {{websiteUrl}}.

Questions? Email us at {{contactEmail}}.

Warm regards,
The AODI Campus Engagement Team`,
  },
  {
    name: 'EmpowerHer Application — Acknowledgement',
    slug: 'ack-empowerher',
    category: 'transactional',
    description: 'Sent automatically to every EmpowerHer applicant after they submit.',
    subject: 'Your EmpowerHer Application has been received — AODI',
    variables: ['name', 'firstName', 'websiteUrl', 'contactEmail'],
    body: `Dear {{firstName}},

Thank you for applying to the AODI EmpowerHer Programme! We are inspired by your ambition and commitment to leadership.

We have received your EmpowerHer Application and wanted to confirm it has been successfully submitted.

Our EmpowerHer programme coordinator will review your application and be in touch within 7 business days.

In the meantime, learn more about our work at {{websiteUrl}}.

If you have any questions, please reach out to us at {{contactEmail}}.

With encouragement,
The AODI EmpowerHer Team`,
  },
  {
    name: 'Partner Africa Application — Acknowledgement',
    slug: 'ack-partner-africa',
    category: 'transactional',
    description: 'Sent automatically to every Partner Africa applicant after they submit.',
    subject: 'Your Partner Africa Application has been received — AODI',
    variables: ['name', 'firstName', 'websiteUrl', 'contactEmail'],
    body: `Dear {{firstName}},

Thank you for your interest in the AODI Partner Africa initiative. We are excited about the possibility of working with you to create meaningful impact across the continent.

We have received your Partner Africa Application and wanted to confirm it has been successfully submitted.

Our Africa partnerships team will review your application and be in touch within 5–7 business days.

In the meantime, explore our programmes at {{websiteUrl}}.

If you have any urgent questions, contact us at {{contactEmail}}.

Warm regards,
The AODI Africa Partnerships Team`,
  },
  {
    name: 'STEM Workshops — Interest Confirmation',
    slug: 'ack-stem-workshops',
    category: 'transactional',
    description: 'Sent automatically to every STEM Workshops applicant after they submit.',
    subject: 'Your STEM Workshop Interest has been received — AODI',
    variables: ['name', 'firstName', 'websiteUrl', 'contactEmail'],
    body: `Dear {{firstName}},

Thank you for your interest in AODI STEM Workshops! We are excited to connect you with transformative STEM learning experiences.

We have received your application and wanted to confirm it has been successfully submitted.

Our STEM team will note your interest and reach out with upcoming workshop details.

In the meantime, explore our programmes at {{websiteUrl}}.

Questions? Email us at {{contactEmail}}.

With excitement,
The AODI STEM Team`,
  },
  {
    name: 'ChemBridge 2026 — Registration Confirmation',
    slug: 'ack-chembridge-2026',
    category: 'transactional',
    description: 'Sent automatically to every ChemBridge 2026 registrant after they submit.',
    subject: 'Your ChemBridge 2026 Registration is confirmed — AODI',
    variables: ['name', 'firstName', 'websiteUrl', 'contactEmail'],
    body: `Dear {{firstName}},

Thank you for registering for the ChemBridge Inclusion Accelerator 2026! We are thrilled to have you join us for this exciting programme.

We have received your registration and wanted to confirm it has been successfully submitted.

Your registration for ChemBridge Inclusion Accelerator 2026 has been confirmed. Further details will be sent closer to the event.

In the meantime, feel free to explore our website to learn more about our programmes and impact: {{websiteUrl}}

If you have any urgent questions, please contact us at {{contactEmail}}.

With great excitement,
The AODI ChemBridge Team`,
  },
  {
    name: 'Contact Form — Auto-Reply',
    slug: 'ack-contact',
    category: 'transactional',
    description: 'Sent automatically to everyone who submits the contact form.',
    subject: "We've received your message — AODI",
    variables: ['name', 'firstName', 'websiteUrl', 'contactEmail'],
    body: `Dear {{firstName}},

Thank you for reaching out to AODI. We have received your message and wanted to confirm it has been successfully submitted.

Our team will review your message and respond within 2–3 business days.

If your enquiry is urgent, please contact us directly at {{contactEmail}}.

In the meantime, explore what we do at {{websiteUrl}}.

Warm regards,
The AODI Team`,
  },
  {
    name: 'Admin — New Submission Notification',
    slug: 'admin-notification',
    category: 'transactional',
    description: 'Sent to the admin email address whenever a new form is submitted.',
    subject: 'New {{applicationType}}: {{name}}',
    variables: ['name', 'email', 'applicationType', 'date', 'adminDashboardUrl'],
    body: `A new {{applicationType}} has been received.

Applicant: {{name}}
Email: {{email}}
Date: {{date}}

Log in to the admin dashboard to review this submission:
{{adminDashboardUrl}}

— AODI System`,
  },
]

// ─── Marketing / Other Templates ──────────────────────────────────────────────

export const SYSTEM_TEMPLATES: SystemTemplate[] = [
  ...TRANSACTIONAL_TEMPLATES,
  {
    name: 'Newsletter Base',
    slug: 'newsletter',
    category: 'newsletter',
    description: 'Base template for newsletter campaigns.',
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
    name: 'Application Received (Generic Fallback)',
    slug: 'application-received',
    category: 'application',
    description: 'Generic fallback used if a form-specific template is missing.',
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
]
