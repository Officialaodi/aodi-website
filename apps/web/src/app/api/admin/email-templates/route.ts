import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { emailTemplates } from "@/lib/schema"
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
  const category = searchParams.get("category")

  try {
    let query = db.select().from(emailTemplates)

    if (category) {
      query = query.where(eq(emailTemplates.category, category)) as typeof query
    }

    const templates = await query.orderBy(desc(emailTemplates.createdAt))

    return NextResponse.json(templates)
  } catch (error) {
    console.error("Error fetching email templates:", error)
    return NextResponse.json({ error: "Failed to fetch email templates" }, { status: 500 })
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
    const { name, slug, subject, body, category, variables } = await request.json()

    if (!name || !slug || !subject || !body || !category) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 })
    }

    const [template] = await db
      .insert(emailTemplates)
      .values({
        name,
        slug,
        subject,
        body,
        category,
        variables: variables ? JSON.stringify(variables) : null,
        isActive: true,
      })
      .returning()

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error("Error creating email template:", error)
    return NextResponse.json({ error: "Failed to create email template" }, { status: 500 })
  }
}
