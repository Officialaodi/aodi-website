import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { contacts, applications } from "@/lib/schema"
import { eq, desc } from "drizzle-orm"
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
  const contactId = parseInt(id)
  if (isNaN(contactId)) return NextResponse.json({ error: "Invalid contact ID" }, { status: 400 })

  try {
    const [contact] = await db
      .select({ email: contacts.email })
      .from(contacts)
      .where(eq(contacts.id, contactId))
      .limit(1)

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    const submissions = await db
      .select()
      .from(applications)
      .where(eq(applications.email, contact.email))
      .orderBy(desc(applications.createdAt))

    return NextResponse.json({ email: contact.email, submissions })
  } catch (error) {
    console.error("Error fetching contact history:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
