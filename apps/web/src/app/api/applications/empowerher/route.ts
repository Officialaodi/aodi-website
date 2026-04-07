import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { applications } from '@/lib/schema'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'
import { sendFormNotification } from '@/lib/email'
import { verifyCaptcha } from '@/lib/captcha'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request)
  const rateLimit = checkRateLimit(`empowerher:${clientId}`, { windowMs: 60000, maxRequests: 5 })
  
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
      type: 'empowerher',
      fullName: data.fullName,
      email: data.email,
      organization: data.institution,
      message: data.goals || `Career Interest: ${data.careerInterest}, Education: ${data.educationLevel}`,
      payload: JSON.stringify(data),
    }).returning()

    console.log('EmpowerHer application saved:', result[0])

    sendFormNotification({
      type: 'empowerher',
      fullName: data.fullName,
      email: data.email,
      organization: data.institution,
      submittedAt: new Date(),
      payload: data,
    }).catch(err => console.error('Email notification failed:', err))

    return NextResponse.json(
      { message: 'EmpowerHer application received successfully', id: result[0].id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error processing EmpowerHer application:', error)
    return NextResponse.json(
      { error: 'Failed to process application' },
      { status: 500 }
    )
  }
}
