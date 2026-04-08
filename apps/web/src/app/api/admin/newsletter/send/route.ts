import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { newsletterSubscribers, activityLogs } from "@/lib/schema"
import { eq, and, isNull } from "drizzle-orm"
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
    const { subject, body, testMode, testEmail } = await request.json()

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

    // Real send — only active subscribers
    const subscribers = await db
      .select()
      .from(newsletterSubscribers)
      .where(and(eq(newsletterSubscribers.status, 'active'), isNull(newsletterSubscribers.unsubscribedAt)))

    if (subscribers.length === 0) {
      return NextResponse.json({ error: "No active subscribers found" }, { status: 400 })
    }

    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const sub of subscribers) {
      const token = Buffer.from(sub.email).toString('base64')
      const result = await sendNewsletterEmail({ to: sub.email, name: sub.fullName || undefined, subject, htmlBody: body, unsubscribeToken: token })
      if (result.success) sent++
      else {
        failed++
        errors.push(`${sub.email}: ${result.error}`)
      }
      await new Promise(r => setTimeout(r, 80))
    }

    await db.insert(activityLogs).values({
      entityType: "newsletter",
      entityId: null,
      action: "newsletter_sent",
      details: `Newsletter sent: "${subject}" — ${sent} delivered, ${failed} failed`,
      performedBy: "Admin",
    })

    return NextResponse.json({ success: true, sent, failed, total: subscribers.length, errors: errors.slice(0, 10) })
  } catch (error) {
    console.error("Error sending newsletter:", error)
    return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 })
  }
}
