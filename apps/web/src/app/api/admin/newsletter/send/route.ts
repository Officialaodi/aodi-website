import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { activityLogs } from "@/lib/schema"
import { cookies } from "next/headers"
import crypto from "crypto"
import { sendNewsletterEmail } from "@/lib/brevo"

export const dynamic = 'force-dynamic'

function verifySignedToken(token: string, sessionSecret: string): boolean {
  const parts = token.split(".")
  if (parts.length !== 2) return false
  const [sessionId, signature] = parts
  const expectedSignature = crypto.createHmac("sha256", sessionSecret).update(sessionId).digest("hex")
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
  } catch { return false }
}

export async function POST(request: NextRequest) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  if (!adminSession || !verifySignedToken(adminSession.value, sessionSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { subject, body, testMode, testEmail, recipients, recipientMode } = await request.json()

    if (!subject || !body) {
      return NextResponse.json({ error: "Subject and body are required" }, { status: 400 })
    }

    // Test mode: send only to testEmail
    if (testMode) {
      if (!testEmail) return NextResponse.json({ error: "Test email address required for test mode" }, { status: 400 })
      const testToken = Buffer.from(testEmail).toString('base64')
      const result = await sendNewsletterEmail({ to: testEmail, subject: `[TEST] ${subject}`, htmlBody: body, unsubscribeToken: testToken })
      return NextResponse.json({ success: result.success, sent: result.success ? 1 : 0, failed: result.success ? 0 : 1, testMode: true })
    }

    // Build recipient list from whatever was passed
    type Recipient = { email: string; fullName?: string; name?: string }
    let recipientList: Recipient[] = []

    if (Array.isArray(recipients) && recipients.length > 0) {
      recipientList = recipients
    } else {
      // Fallback: subscribers only
      const { newsletterSubscribers } = await import("@/lib/schema")
      const { eq, and, isNull } = await import("drizzle-orm")
      const subs = await db
        .select()
        .from(newsletterSubscribers)
        .where(and(eq(newsletterSubscribers.status, 'active'), isNull(newsletterSubscribers.unsubscribedAt)))
      recipientList = subs
    }

    if (recipientList.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 400 })
    }

    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const rec of recipientList) {
      const email = rec.email
      const name = rec.fullName || rec.name || undefined
      const token = Buffer.from(email).toString('base64')
      const result = await sendNewsletterEmail({ to: email, name, subject, htmlBody: body, unsubscribeToken: token })
      if (result.success) sent++
      else {
        failed++
        errors.push(`${email}: ${result.error}`)
      }
      await new Promise(r => setTimeout(r, 80))
    }

    const audienceLabel = recipientMode === "all_contacts" ? "all form contacts" : recipientMode === "custom" ? "custom list" : "subscribers"

    await db.insert(activityLogs).values({
      entityType: "newsletter",
      entityId: null,
      action: "newsletter_sent",
      details: `Newsletter sent to ${audienceLabel}: "${subject}" — ${sent} delivered, ${failed} failed`,
      performedBy: "Admin",
    })

    return NextResponse.json({ success: true, sent, failed, total: recipientList.length, errors: errors.slice(0, 10) })
  } catch (error) {
    console.error("Error sending newsletter:", error)
    return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 })
  }
}
