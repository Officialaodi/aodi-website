import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"
import { db } from "@/lib/db"
import { syncedEmails, emailAccounts } from "@/lib/schema"
import { eq } from "drizzle-orm"

 export const runtime = 'edge';

function verifySignedToken(signedToken: string, secret: string): boolean {
  try {
    const [token, signature] = signedToken.split(".")
    if (!token || !signature) return false
    const expectedSignature = crypto.createHmac("sha256", secret).update(token).digest("hex")
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
  } catch { return false }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  if (!adminSession || !verifySignedToken(adminSession.value, sessionSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const numericId = parseInt(id)
  
  if (isNaN(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Invalid email ID" }, { status: 400 })
  }

  try {
    const [email] = await db
      .select({
        id: syncedEmails.id,
        messageId: syncedEmails.messageId,
        accountId: syncedEmails.accountId,
        fromEmail: syncedEmails.fromEmail,
        fromName: syncedEmails.fromName,
        toEmail: syncedEmails.toEmail,
        subject: syncedEmails.subject,
        body: syncedEmails.body,
        htmlBody: syncedEmails.htmlBody,
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
      .where(eq(syncedEmails.id, numericId))

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 })
    }

    await db
      .update(syncedEmails)
      .set({ isRead: true })
      .where(eq(syncedEmails.id, numericId))

    return NextResponse.json(email)
  } catch (error) {
    console.error("Error fetching email:", error)
    return NextResponse.json({ error: "Failed to fetch email" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  if (!adminSession || !verifySignedToken(adminSession.value, sessionSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const numericId = parseInt(id)
  
  if (isNaN(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Invalid email ID" }, { status: 400 })
  }

  try {
    const data = await request.json()
    
    const updateData: Record<string, unknown> = {}
    
    if (data.isRead !== undefined) updateData.isRead = data.isRead
    if (data.linkedEntityType !== undefined) updateData.linkedEntityType = data.linkedEntityType
    if (data.linkedEntityId !== undefined) updateData.linkedEntityId = data.linkedEntityId

    const [updated] = await db
      .update(syncedEmails)
      .set(updateData)
      .where(eq(syncedEmails.id, numericId))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating email:", error)
    return NextResponse.json({ error: "Failed to update email" }, { status: 500 })
  }
}
