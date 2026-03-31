import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"
import { db } from "@/lib/db"
import { emailAccounts } from "@/lib/schema"
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

    const { testImapConnection, testSmtpConnection } = await import("@/lib/email-sync")
    
    const imapResult = await testImapConnection({
      username: account.username,
      password: account.password,
      imapHost: account.imapHost,
      imapPort: account.imapPort,
      useTls: account.useTls ?? true
    })

    const smtpResult = await testSmtpConnection({
      username: account.username,
      password: account.password,
      smtpHost: account.smtpHost,
      smtpPort: account.smtpPort,
    })

    return NextResponse.json({
      imap: imapResult,
      smtp: smtpResult,
      overall: imapResult.success && smtpResult.success
    })
  } catch (error) {
    console.error("Error testing email account:", error)
    return NextResponse.json({ error: "Failed to test email account" }, { status: 500 })
  }
}
