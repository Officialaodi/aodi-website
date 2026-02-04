import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"
import { db } from "@/lib/db"
import { syncedEmails, emailAccounts } from "@/lib/schema"
import { desc, eq, ilike, or } from "drizzle-orm"

function verifySignedToken(signedToken: string, secret: string): boolean {
  try {
    const [token, signature] = signedToken.split(".")
    if (!token || !signature) return false
    const expectedSignature = crypto.createHmac("sha256", secret).update(token).digest("hex")
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

  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("accountId")
    const linkedOnly = searchParams.get("linkedOnly") === "true"
    const search = searchParams.get("search")
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200)
    const offset = parseInt(searchParams.get("offset") || "0")

    let query = db
      .select({
        id: syncedEmails.id,
        messageId: syncedEmails.messageId,
        accountId: syncedEmails.accountId,
        fromEmail: syncedEmails.fromEmail,
        fromName: syncedEmails.fromName,
        toEmail: syncedEmails.toEmail,
        subject: syncedEmails.subject,
        receivedAt: syncedEmails.receivedAt,
        isRead: syncedEmails.isRead,
        hasAttachments: syncedEmails.hasAttachments,
        linkedEntityType: syncedEmails.linkedEntityType,
        linkedEntityId: syncedEmails.linkedEntityId,
        accountName: emailAccounts.name,
        accountEmail: emailAccounts.email,
      })
      .from(syncedEmails)
      .leftJoin(emailAccounts, eq(syncedEmails.accountId, emailAccounts.id))
      .orderBy(desc(syncedEmails.receivedAt))
      .limit(limit)
      .offset(offset)
      .$dynamic()

    if (accountId) {
      query = query.where(eq(syncedEmails.accountId, parseInt(accountId)))
    }

    if (linkedOnly) {
      query = query.where(
        or(
          eq(syncedEmails.linkedEntityType, "application"),
          eq(syncedEmails.linkedEntityType, "contact")
        )
      )
    }

    if (search) {
      query = query.where(
        or(
          ilike(syncedEmails.fromEmail, `%${search}%`),
          ilike(syncedEmails.fromName, `%${search}%`),
          ilike(syncedEmails.subject, `%${search}%`)
        )
      )
    }

    const emails = await query

    return NextResponse.json(emails)
  } catch (error) {
    console.error("Error fetching inbox:", error)
    return NextResponse.json({ error: "Failed to fetch inbox" }, { status: 500 })
  }
}
