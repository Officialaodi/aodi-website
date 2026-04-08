import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { emailLogs } from "@/lib/schema"
import { desc, eq, ilike, and, or, type SQL } from "drizzle-orm"
import { cookies } from "next/headers"
import crypto from "crypto"

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

export async function GET(request: NextRequest) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  if (!adminSession || !verifySignedToken(adminSession.value, sessionSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const applicationId = searchParams.get("applicationId")
  const contactId = searchParams.get("contactId")
  const status = searchParams.get("status")
  const search = searchParams.get("search")
  const limit = parseInt(searchParams.get("limit") || "50")

  try {
    const conditions: SQL[] = []

    if (applicationId) {
      conditions.push(eq(emailLogs.applicationId, parseInt(applicationId)))
    }

    if (contactId) {
      conditions.push(eq(emailLogs.contactId, parseInt(contactId)))
    }

    if (status && status !== "all") {
      conditions.push(eq(emailLogs.status, status as "sent" | "failed" | "pending"))
    }

    if (search) {
      conditions.push(
        or(
          ilike(emailLogs.recipientEmail, `%${search}%`),
          ilike(emailLogs.subject, `%${search}%`)
        )!
      )
    }

    const query = db
      .select()
      .from(emailLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(emailLogs.sentAt))
      .limit(limit)

    const logs = await query

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Error fetching email logs:", error)
    return NextResponse.json({ error: "Failed to fetch email logs" }, { status: 500 })
  }
}
