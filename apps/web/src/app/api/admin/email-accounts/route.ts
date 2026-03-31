import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"
import { db } from "@/lib/db"
import { emailAccounts } from "@/lib/schema"
import { desc } from "drizzle-orm"

 export const runtime = 'edge';

function verifySignedToken(signedToken: string, secret: string): boolean {
  try {
    const [token, signature] = signedToken.split(".")
    if (!token || !signature) return false
    const expectedSignature = crypto.createHmac("sha256", secret).update(token).digest("hex")
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
  } catch { return false }
}

const VALID_PROVIDERS = ["gmail", "outlook", "cpanel", "imap"]

export async function GET() {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  if (!adminSession || !verifySignedToken(adminSession.value, sessionSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const accounts = await db
      .select({
        id: emailAccounts.id,
        name: emailAccounts.name,
        email: emailAccounts.email,
        provider: emailAccounts.provider,
        imapHost: emailAccounts.imapHost,
        imapPort: emailAccounts.imapPort,
        smtpHost: emailAccounts.smtpHost,
        smtpPort: emailAccounts.smtpPort,
        useTls: emailAccounts.useTls,
        isActive: emailAccounts.isActive,
        lastSyncAt: emailAccounts.lastSyncAt,
        createdAt: emailAccounts.createdAt,
      })
      .from(emailAccounts)
      .orderBy(desc(emailAccounts.createdAt))

    return NextResponse.json(accounts)
  } catch (error) {
    console.error("Error fetching email accounts:", error)
    return NextResponse.json({ error: "Failed to fetch email accounts" }, { status: 500 })
  }
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
    const data = await request.json()
    
    if (!data.name || typeof data.name !== "string" || data.name.trim().length < 2) {
      return NextResponse.json({ error: "Account name is required" }, { status: 400 })
    }
    
    if (!data.email || typeof data.email !== "string") {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 })
    }
    
    if (!data.provider || !VALID_PROVIDERS.includes(data.provider)) {
      return NextResponse.json({ error: `Invalid provider. Must be one of: ${VALID_PROVIDERS.join(", ")}` }, { status: 400 })
    }
    
    if (!data.imapHost || !data.smtpHost) {
      return NextResponse.json({ error: "IMAP and SMTP hosts are required" }, { status: 400 })
    }
    
    if (!data.username || !data.password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const [account] = await db
      .insert(emailAccounts)
      .values({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        provider: data.provider,
        imapHost: data.imapHost.trim(),
        imapPort: data.imapPort || 993,
        smtpHost: data.smtpHost.trim(),
        smtpPort: data.smtpPort || 587,
        username: data.username.trim(),
        password: data.password,
        useTls: data.useTls ?? true,
        isActive: true,
      })
      .returning()

    const { password: _, ...safeAccount } = account
    return NextResponse.json(safeAccount, { status: 201 })
  } catch (error) {
    console.error("Error creating email account:", error)
    return NextResponse.json({ error: "Failed to create email account" }, { status: 500 })
  }
}
