import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { contacts, activityLogs } from "@/lib/schema"
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

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const limit = parseInt(searchParams.get("limit") || "100")

  try {
    let query = db.select().from(contacts)

    if (status) {
      query = query.where(eq(contacts.status, status)) as typeof query
    }

    const contactsList = await query.orderBy(desc(contacts.createdAt)).limit(limit)

    return NextResponse.json(contactsList)
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, subject, message, payload } = await request.json()

    if (!fullName || !email || !message) {
      return NextResponse.json({ error: "Name, email and message required" }, { status: 400 })
    }

    const [contact] = await db
      .insert(contacts)
      .values({
        fullName,
        email,
        subject,
        message,
        payload: payload ? JSON.stringify(payload) : null,
        status: "new",
      })
      .returning()

    await db.insert(activityLogs).values({
      entityType: "contact",
      entityId: contact.id,
      action: "created",
      details: `Contact form submitted by ${fullName}`,
      performedBy: "System",
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error("Error creating contact:", error)
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 })
  }
}
