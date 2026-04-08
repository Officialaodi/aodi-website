import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { applications, activityLogs } from "@/lib/schema"
import { inArray } from "drizzle-orm"
import { cookies } from "next/headers"
import crypto from "crypto"
import { sendBulkEmail } from "@/lib/brevo"

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
    const { applicationIds, subject, body } = await request.json()

    if (!subject || !body) {
      return NextResponse.json({ error: "Subject and body are required" }, { status: 400 })
    }

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json({ error: "At least one recipient is required" }, { status: 400 })
    }

    if (applicationIds.length > 500) {
      return NextResponse.json({ error: "Maximum 500 recipients per bulk send" }, { status: 400 })
    }

    const apps = await db
      .select({ id: applications.id, fullName: applications.fullName, email: applications.email })
      .from(applications)
      .where(inArray(applications.id, applicationIds))

    const recipients = apps.map(a => ({
      email: a.email,
      name: a.fullName || undefined,
      applicationId: a.id,
    }))

    const result = await sendBulkEmail(recipients, subject, body)

    await db.insert(activityLogs).values({
      entityType: "application",
      entityId: null,
      action: "bulk_email_sent",
      details: `Bulk email sent to ${result.sent} recipients. Subject: ${subject}`,
      performedBy: "Admin",
    })

    return NextResponse.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
      errors: result.errors.slice(0, 10),
    })
  } catch (error) {
    console.error("Error sending bulk email:", error)
    return NextResponse.json({ error: "Failed to send bulk email" }, { status: 500 })
  }
}
