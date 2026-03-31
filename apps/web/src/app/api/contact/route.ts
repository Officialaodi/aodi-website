import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { contacts, activityLogs } from "@/lib/schema"
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit"
import { verifyCaptcha } from "@/lib/captcha"

 export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request)
  const rateLimit = checkRateLimit(`contact:${clientId}`, { windowMs: 60000, maxRequests: 5 })
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetIn / 1000)),
        }
      }
    )
  }

  try {
    const data = await request.json()
    const { title, firstName, lastName, fullName, email, subject, message, captchaToken, agreedToPolicy } = data

    if (!agreedToPolicy) {
      return NextResponse.json(
        { error: "Please agree to our Privacy Policy, Terms of Service, and Safeguarding Policy." },
        { status: 400 }
      )
    }

    const captchaValid = await verifyCaptcha(captchaToken)
    if (!captchaValid && process.env.HCAPTCHA_SECRET_KEY) {
      return NextResponse.json(
        { error: "CAPTCHA verification failed. Please try again." },
        { status: 400 }
      )
    }

    const computedFullName = fullName || (title ? `${title} ${firstName} ${lastName}` : `${firstName} ${lastName}`).trim()

    if (!computedFullName || computedFullName.trim().length < 2) {
      return NextResponse.json({ error: "Please enter a valid name" }, { status: 400 })
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json({ error: "Please enter a message (at least 10 characters)" }, { status: 400 })
    }

    const sanitizedFullName = computedFullName.trim().slice(0, 200)
    const sanitizedEmail = email.trim().slice(0, 200).toLowerCase()
    const sanitizedSubject = subject ? String(subject).trim().slice(0, 300) : null
    const sanitizedMessage = message.trim().slice(0, 5000)

    const [contact] = await db
      .insert(contacts)
      .values({
        fullName: sanitizedFullName,
        email: sanitizedEmail,
        subject: sanitizedSubject,
        message: sanitizedMessage,
        status: "new",
      })
      .returning()

    await db.insert(activityLogs).values({
      entityType: "contact",
      entityId: contact.id,
      action: "created",
      details: `Contact form submitted by ${sanitizedFullName} - ${sanitizedSubject || "No subject"}`,
      performedBy: "System",
    })

    return NextResponse.json({ success: true, id: contact.id }, { status: 201 })
  } catch (error) {
    console.error("Error creating contact:", error)
    return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500 })
  }
}
