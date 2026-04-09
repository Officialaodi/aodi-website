import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { emailTemplates } from "@/lib/schema"
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

  try {
    const [template] = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.id, parseInt(id)))

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error fetching email template:", error)
    return NextResponse.json({ error: "Failed to fetch email template" }, { status: 500 })
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

  try {
    const body = await request.json()

    // Only allow updating safe fields — never overwrite the slug
    const allowedUpdates: Record<string, unknown> = {}
    if (body.name !== undefined) allowedUpdates.name = body.name
    if (body.subject !== undefined) allowedUpdates.subject = body.subject
    if (body.body !== undefined) allowedUpdates.body = body.body
    if (body.category !== undefined) allowedUpdates.category = body.category
    if (body.isActive !== undefined) allowedUpdates.isActive = body.isActive

    // Normalise variables: accept array or comma-string, always store as comma-string
    if (body.variables !== undefined) {
      if (Array.isArray(body.variables)) {
        allowedUpdates.variables = body.variables.map((v: string) => v.trim()).join(",")
      } else if (typeof body.variables === "string") {
        allowedUpdates.variables = body.variables
      } else {
        allowedUpdates.variables = null
      }
    }

    allowedUpdates.updatedAt = new Date()

    const [updated] = await db
      .update(emailTemplates)
      .set(allowedUpdates)
      .where(eq(emailTemplates.id, parseInt(id)))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating email template:", error)
    return NextResponse.json({ error: "Failed to update email template" }, { status: 500 })
  }
}

export async function DELETE(
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

  try {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, parseInt(id)))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting email template:", error)
    return NextResponse.json({ error: "Failed to delete email template" }, { status: 500 })
  }
}
