import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { emailLogs, activityLogs } from "@/lib/schema"
import { cookies } from "next/headers"
import crypto from "crypto"

 export const runtime = 'edge';

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
    const { 
      applicationId, 
      templateId, 
      recipientEmail, 
      recipientName, 
      subject, 
      body 
    } = await request.json()

    if (!recipientEmail || !subject || !body) {
      return NextResponse.json({ error: "Recipient email, subject and body required" }, { status: 400 })
    }

    const sendGridApiKey = process.env.SENDGRID_API_KEY

    if (sendGridApiKey) {
      try {
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sendGridApiKey}`,
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email: recipientEmail, name: recipientName }],
              },
            ],
            from: {
              email: "noreply@aodi.org.uk",
              name: "AODI - Africa of Our Dream Education Initiative",
            },
            subject,
            content: [
              {
                type: "text/plain",
                value: body,
              },
              {
                type: "text/html",
                value: body.replace(/\n/g, "<br>"),
              },
            ],
          }),
        })

        if (!response.ok) {
          console.error("SendGrid error:", await response.text())
        }
      } catch (emailError) {
        console.error("Email sending error:", emailError)
      }
    }

    const [emailLog] = await db
      .insert(emailLogs)
      .values({
        applicationId,
        templateId,
        recipientEmail,
        recipientName,
        subject,
        body,
        status: sendGridApiKey ? "sent" : "logged",
      })
      .returning()

    if (applicationId) {
      await db.insert(activityLogs).values({
        entityType: "application",
        entityId: applicationId,
        action: "email_sent",
        details: `Email sent: ${subject}`,
        performedBy: "Admin",
      })
    }

    return NextResponse.json({ 
      success: true, 
      emailLog,
      message: sendGridApiKey ? "Email sent successfully" : "Email logged (SendGrid not configured)" 
    })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
