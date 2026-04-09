import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { activityLogs, emailTemplates } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import crypto from "crypto"
import { sendCustomEmail, logEmail } from "@/lib/brevo"

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
    const { applicationId, contactId, templateId, syncedEmailId, recipientEmail, recipientName, ccEmail, bccEmail, subject, body } = await request.json()

    if (!recipientEmail || !subject || !body) {
      return NextResponse.json({ error: "Recipient email, subject and body are required" }, { status: 400 })
    }

    let resolvedSubject = subject
    let resolvedBody = body

    // If templateId provided, resolve the template
    if (templateId) {
      const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, templateId))
      if (template) {
        resolvedSubject = template.subject
        resolvedBody = template.body
      }
    }

    const result = await sendCustomEmail({
      to: recipientEmail,
      name: recipientName,
      ccEmail: ccEmail || undefined,
      bccEmail: bccEmail || undefined,
      subject: resolvedSubject,
      htmlBody: resolvedBody,
      applicationId,
      contactId,
      templateId,
      syncedEmailId: syncedEmailId || undefined,
    })

    if (applicationId) {
      await db.insert(activityLogs).values({
        entityType: "application",
        entityId: applicationId,
        action: "email_sent",
        details: `Email sent to ${recipientEmail}: ${resolvedSubject}`,
        performedBy: "Admin",
      })
    }

    if (contactId) {
      await db.insert(activityLogs).values({
        entityType: "contact",
        entityId: contactId,
        action: "email_sent",
        details: `Email sent to ${recipientEmail}: ${resolvedSubject}`,
        performedBy: "Admin",
      })
    }

    return NextResponse.json({
      success: result.success,
      message: result.success ? "Email sent successfully" : "Email logged but delivery failed",
      brevoMessageId: result.messageId,
      error: result.error,
    })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
