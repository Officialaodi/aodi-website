import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { newsletterSubscribers } from "@/lib/schema"
import { eq } from "drizzle-orm"
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

export async function POST(request: NextRequest) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  if (!adminSession || !verifySignedToken(adminSession.value, sessionSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { contacts, source } = await request.json() as {
      contacts: { email: string; fullName?: string }[]
      source?: string
    }

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: "No contacts provided" }, { status: 400 })
    }

    let added = 0
    let skipped = 0

    for (const contact of contacts) {
      const email = contact.email?.toLowerCase().trim()
      if (!email || !email.includes("@")) continue

      const existing = await db
        .select({ id: newsletterSubscribers.id })
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, email))
        .limit(1)

      if (existing.length > 0) {
        skipped++
        continue
      }

      await db.insert(newsletterSubscribers).values({
        email,
        fullName: contact.fullName || null,
        status: "active",
        source: source || "import",
      })
      added++
    }

    return NextResponse.json({ success: true, added, skipped, total: contacts.length })
  } catch (error) {
    console.error("Error importing contacts:", error)
    return NextResponse.json({ error: "Failed to import contacts" }, { status: 500 })
  }
}
