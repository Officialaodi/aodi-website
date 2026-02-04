interface EmailData {
  to: string
  from: string
  subject: string
  text: string
  html: string
}

interface FormSubmissionData {
  type: 'partner' | 'mentor' | 'mentee' | 'volunteer' | 'campus-ambassador' | 'empowerher' | 'partner-africa' | 'stem-workshops'
  fullName: string
  email: string
  organization?: string | null
  submittedAt: Date
  payload: Record<string, unknown>
}

const ADMIN_EMAIL = 'aodi.info@africaofourdreaminitiative.org'
const FROM_EMAIL = 'noreply@africaofourdreaminitiative.org'

export async function sendFormNotification(data: FormSubmissionData): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY
  
  if (!apiKey) {
    console.log('SendGrid API key not configured, skipping email notification')
    return false
  }

  const typeLabels: Record<string, string> = {
    partner: 'Partnership Inquiry',
    mentor: 'Mentor Application',
    mentee: 'Mentee Application',
    volunteer: 'Volunteer Application',
    'campus-ambassador': 'Campus Ambassador Application',
    'empowerher': 'EmpowerHer Application',
    'partner-africa': 'Partner Africa Project Application',
    'stem-workshops': 'STEM Workshop Interest',
  }

  const subject = `New ${typeLabels[data.type]}: ${data.fullName}`
  
  const payloadHtml = Object.entries(data.payload)
    .filter(([key]) => !['type'].includes(key))
    .map(([key, value]) => `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${formatFieldName(key)}</td><td style="padding: 8px; border: 1px solid #ddd;">${formatValue(value)}</td></tr>`)
    .join('')

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #0F3D2E; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">AODI</h1>
        <p style="color: #C9A24D; margin: 5px 0 0 0;">New Application Received</p>
      </div>
      
      <div style="padding: 20px; background-color: #f5f7f9;">
        <h2 style="color: #0F3D2E; margin-top: 0;">${typeLabels[data.type]}</h2>
        
        <table style="width: 100%; border-collapse: collapse; background: white;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Submitted</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.submittedAt.toISOString()}</td>
          </tr>
          ${payloadHtml}
        </table>
        
        <p style="margin-top: 20px; color: #6B7280; font-size: 14px;">
          View and manage this application in the <a href="https://africaofourdreaminitiative.org/admin" style="color: #1F7A6E;">Admin Dashboard</a>
        </p>
      </div>
      
      <div style="padding: 15px; text-align: center; color: #6B7280; font-size: 12px;">
        Africa of Our Dream Education Initiative
      </div>
    </div>
  `

  const text = `New ${typeLabels[data.type]} from ${data.fullName} (${data.email})\n\nSubmitted: ${data.submittedAt.toISOString()}\n\n${Object.entries(data.payload).map(([k, v]) => `${formatFieldName(k)}: ${formatValue(v)}`).join('\n')}`

  const emailData: EmailData = {
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    subject,
    text,
    html,
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: emailData.to }] }],
        from: { email: emailData.from },
        subject: emailData.subject,
        content: [
          { type: 'text/plain', value: emailData.text },
          { type: 'text/html', value: emailData.html },
        ],
      }),
    })

    if (response.ok || response.status === 202) {
      console.log(`Email notification sent for ${data.type} application`)
      return true
    } else {
      const errorText = await response.text()
      console.error('SendGrid error:', response.status, errorText)
      return false
    }
  } catch (error) {
    console.error('Failed to send email notification:', error)
    return false
  }
}

function formatFieldName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ')
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
