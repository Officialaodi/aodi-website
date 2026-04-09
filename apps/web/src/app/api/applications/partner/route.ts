import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { applications } from '@/lib/schema'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'
import { sendAdminNotification, sendApplicationAcknowledgement } from '@/lib/brevo'
import { upsertCrmContact } from '@/lib/crm-contacts'
import { verifyCaptcha } from '@/lib/captcha'
import { trackConversion } from '@/lib/track-conversion'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request)
  const rateLimit = checkRateLimit(`partner:${clientId}`, { windowMs: 60000, maxRequests: 5 })
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000)),
        }
      }
    )
  }

  try {
    const data = await request.json()

    const captchaValid = await verifyCaptcha(data.captchaToken)
    if (!captchaValid && process.env.HCAPTCHA_SECRET_KEY) {
      return NextResponse.json(
        { error: 'CAPTCHA verification failed. Please try again.' },
        { status: 400 }
      )
    }

    const result = await db.insert(applications).values({
      type: 'partner',
      fullName: data.contactName || data.fullName,
      email: data.email,
      organization: data.organisationName || data.organizationName || data.organization,
      message: data.message || `Partnership interest: ${data.partnershipInterest}`,
      payload: JSON.stringify(data),
    }).returning()


    trackConversion({
      conversionType: 'application',
      conversionName: 'Partner Application',
      metadata: { applicationId: result[0].id, organization: data.organisationName || data.organizationName },
    })

    sendAdminNotification({
      formType: 'partner',
      submitterName: data.fullName || data.contactName,
      email: data.email,
      payload: data,
      applicationId: result[0].id,
    }).catch(err => console.error('[Brevo] Admin notification failed:', err))

    upsertCrmContact({ fullName: data.fullName || data.contactName, email: data.email, formType: 'partner', applicationId: result[0].id })
      .catch(err => console.error('[CRM] Contact upsert failed:', err))

    sendApplicationAcknowledgement('partner', data.email, data.fullName || data.contactName, result[0].id)
      .catch(err => console.error('[Brevo] Acknowledgement email failed:', err))

    return NextResponse.json(
      { message: 'Partnership inquiry received successfully', id: result[0].id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error processing partner application:', error)
    return NextResponse.json(
      { error: 'Failed to process application' },
      { status: 500 }
    )
  }
}
