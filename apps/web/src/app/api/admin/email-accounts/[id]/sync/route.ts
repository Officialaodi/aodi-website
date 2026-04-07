import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"
import { db } from "@/lib/db"
import { emailAccounts, syncedEmails, applications, contacts } from "@/lib/schema"
import { eq } from "drizzle-orm"

export const dynamic = 'force-dynamic'

function verifySignedToken(signedToken: string, secret: string): boolean {
  try {
    const [token, signature] = signedToken.split(".")
    if (!token || !signature) return false
    const expectedSignature = crypto.createHmac("sha256", secret).update(token).digest("hex")
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
  } catch { return false }
}

export async function POST(
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
    return NextResponse.json({ error: "Invalid account ID" }, { status: 400 })
  }

  try {
    const [account] = await db
      .select()
      .from(emailAccounts)
      .where(eq(emailAccounts.id, numericId))

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    const { fetchEmails } = await import("@/lib/email-sync")
    
    const sinceDays = 7
    const sinceDate = new Date()
    sinceDate.setDate(sinceDate.getDate() - sinceDays)
    
    const emails = await fetchEmails(
      {
        id: account.id,
        name: account.name,
        email: account.email,
        provider: account.provider as "gmail" | "outlook" | "imap" | "cpanel",
        imapHost: account.imapHost,
        imapPort: account.imapPort,
        smtpHost: account.smtpHost,
        smtpPort: account.smtpPort,
        username: account.username,
        password: account.password,
        useTls: account.useTls ?? true,
        isActive: account.isActive ?? true
      },
      { limit: 100, since: sinceDate }
    )

    const allApps = await db.select({ email: applications.email, id: applications.id }).from(applications)
    const allContacts = await db.select({ email: contacts.email, id: contacts.id }).from(contacts)
    const crmEmails = new Map<string, { type: string; id: number }>()
    
    allApps.forEach(app => crmEmails.set(app.email.toLowerCase(), { type: "application", id: app.id }))
    allContacts.forEach(contact => crmEmails.set(contact.email.toLowerCase(), { type: "contact", id: contact.id }))

    let newCount = 0
    let linkedCount = 0

    for (const email of emails) {
      const existing = await db
        .select({ id: syncedEmails.id })
        .from(syncedEmails)
        .where(eq(syncedEmails.messageId, email.messageId))
        .limit(1)

      if (existing.length === 0) {
        const senderEmail = email.from.toLowerCase()
        const linkedEntity = crmEmails.get(senderEmail)

        await db.insert(syncedEmails).values({
          messageId: email.messageId,
          accountId: account.id,
          fromEmail: email.from,
          fromName: email.fromName,
          toEmail: email.to,
          subject: email.subject,
          body: email.body,
          htmlBody: email.htmlBody,
          receivedAt: email.date,
          isRead: email.isRead,
          hasAttachments: email.hasAttachments,
          linkedEntityType: linkedEntity?.type || null,
          linkedEntityId: linkedEntity?.id || null,
        })
        newCount++
        if (linkedEntity) linkedCount++
      }
    }

    await db
      .update(emailAccounts)
      .set({ lastSyncAt: new Date() })
      .where(eq(emailAccounts.id, numericId))

    return NextResponse.json({
      success: true,
      fetched: emails.length,
      new: newCount,
      linked: linkedCount,
      lastSyncAt: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error syncing emails:", error)
    return NextResponse.json({ 
      error: "Failed to sync emails", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}
