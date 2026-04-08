import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { applications } from "@/lib/schema"
import { z } from "zod"
import { trackConversion } from "@/lib/track-conversion"

export const dynamic = 'force-dynamic'

const chembridgeSchema = z.object({
  title: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  countryCode: z.string(),
  phone: z.string().min(1),
  countryOfResidence: z.string().min(1),
  institution: z.string().min(1),
  currentLevel: z.string().min(1),
  fieldOfStudy: z.string().min(1),
  programmeGoals: z.string().min(1),
  heardAbout: z.string().min(1),
  attendancePreference: z.string().min(1),
  consentToContact: z.boolean(),
  agreedToPolicy: z.boolean(),
  captchaToken: z.string().nullable().optional(),
})

async function verifyCaptcha(token: string | null | undefined): Promise<boolean> {
  if (!process.env.HCAPTCHA_SECRET_KEY) {
    return true
  }
  
  if (!token) {
    return false
  }

  try {
    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET_KEY,
        response: token,
      }),
    })

    const data = await response.json()
    return data.success === true
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = chembridgeSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: parsed.error.flatten() 
      }, { status: 400 })
    }
    
    const data = parsed.data

    if (!data.agreedToPolicy) {
      return NextResponse.json({ 
        error: "Please agree to our Privacy Policy, Terms of Service, and Safeguarding Policy." 
      }, { status: 400 })
    }

    if (process.env.HCAPTCHA_SECRET_KEY) {
      const captchaValid = await verifyCaptcha(data.captchaToken)
      if (!captchaValid) {
        return NextResponse.json({ error: "Captcha verification failed" }, { status: 400 })
      }
    }

    const fullName = `${data.title} ${data.firstName} ${data.lastName}`
    const fullPhone = `${data.countryCode} ${data.phone}`

    const result = await db.insert(applications).values({
      type: "chembridge-2026",
      fullName,
      email: data.email,
      organization: data.institution,
      message: `Level: ${data.currentLevel} | Field: ${data.fieldOfStudy} | Attendance: ${data.attendancePreference}`,
      payload: JSON.stringify({
        ...data,
        fullPhone,
        submittedAt: new Date().toISOString(),
      }),
    }).returning()

    try {
      await trackConversion({
        conversionType: "application",
        conversionName: "ChemBridge 2026 Registration",
        conversionReference: `chembridge-2026-${result[0].id}`,
        path: "/events/chembridge-2026/register",
        value: 1,
        metadata: {
          applicationId: result[0].id,
          applicationType: "chembridge-2026",
          currentLevel: data.currentLevel,
          country: data.countryOfResidence,
          heardAbout: data.heardAbout,
        },
      })
    } catch (analyticsError) {
      console.error("Failed to track analytics:", analyticsError)
    }

    const { sendApplicationAcknowledgement, sendAdminNotification } = await import('@/lib/brevo')

    sendApplicationAcknowledgement('chembridge-2026', data.email, fullName, result[0].id)
      .catch(err => console.error('[Brevo] Acknowledgement failed:', err))

    sendAdminNotification({
      formType: 'chembridge-2026',
      submitterName: fullName,
      email: data.email,
      payload: data,
      applicationId: result[0].id,
    }).catch(err => console.error('[Brevo] Admin notification failed:', err))

    return NextResponse.json({ 
      success: true, 
      message: "Registration submitted successfully",
      id: result[0].id 
    })
  } catch (error) {
    console.error("Error submitting ChemBridge registration:", error)
    return NextResponse.json({ error: "Failed to submit registration" }, { status: 500 })
  }
}
