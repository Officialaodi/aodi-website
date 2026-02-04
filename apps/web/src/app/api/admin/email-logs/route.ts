import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { emailLogs } from "@/lib/schema"
import { desc, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import crypto from "crypto"

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
  const limit = parseInt(searchParams.get("limit") || "50")

  try {
    let query = db.select().from(emailLogs)

    if (applicationId) {
      query = query.where(eq(emailLogs.applicationId, parseInt(applicationId))) as typeof query
    }

    const logs = await query.orderBy(desc(emailLogs.sentAt)).limit(limit)

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Error fetching email logs:", error)
    return NextResponse.json({ error: "Failed to fetch email logs" }, { status: 500 })
  }
}
