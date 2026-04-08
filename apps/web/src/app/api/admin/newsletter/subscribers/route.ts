import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { newsletterSubscribers } from "@/lib/schema"
import { desc, eq } from "drizzle-orm"
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

  try {
    const subscribers = await db
      .select()
      .from(newsletterSubscribers)
      .orderBy(desc(newsletterSubscribers.createdAt))

    const active = subscribers.filter(s => s.status === 'active' && !s.unsubscribedAt).length
    const unsubscribed = subscribers.filter(s => s.status !== 'active' || s.unsubscribedAt).length

    return NextResponse.json({ subscribers, stats: { total: subscribers.length, active, unsubscribed } })
  } catch (error) {
    console.error("Error fetching subscribers:", error)
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  if (!adminSession || !verifySignedToken(adminSession.value, sessionSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await request.json()
    await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting subscriber:", error)
    return NextResponse.json({ error: "Failed to delete subscriber" }, { status: 500 })
  }
}
