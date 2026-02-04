import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"
import { db } from "@/lib/db"
import { emailAccounts } from "@/lib/schema"
import { eq } from "drizzle-orm"

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
    return NextResponse.json({ error: "Invalid account ID" }, { status: 400 })
  }

  try {
    const [account] = await db
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
      .where(eq(emailAccounts.id, numericId))

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch (error) {
    console.error("Error fetching email account:", error)
    return NextResponse.json({ error: "Failed to fetch email account" }, { status: 500 })
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
    return NextResponse.json({ error: "Invalid account ID" }, { status: 400 })
  }

  try {
    const data = await request.json()
    
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.email !== undefined) updateData.email = data.email.trim().toLowerCase()
    if (data.imapHost !== undefined) updateData.imapHost = data.imapHost.trim()
    if (data.imapPort !== undefined) updateData.imapPort = data.imapPort
    if (data.smtpHost !== undefined) updateData.smtpHost = data.smtpHost.trim()
    if (data.smtpPort !== undefined) updateData.smtpPort = data.smtpPort
    if (data.username !== undefined) updateData.username = data.username.trim()
    if (data.password !== undefined) updateData.password = data.password
    if (data.useTls !== undefined) updateData.useTls = data.useTls
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    
    const [updated] = await db
      .update(emailAccounts)
      .set(updateData)
      .where(eq(emailAccounts.id, numericId))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    const { password: _, ...safeAccount } = updated
    return NextResponse.json(safeAccount)
  } catch (error) {
    console.error("Error updating email account:", error)
    return NextResponse.json({ error: "Failed to update email account" }, { status: 500 })
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
  const numericId = parseInt(id)
  
  if (isNaN(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Invalid account ID" }, { status: 400 })
  }

  try {
    await db.delete(emailAccounts).where(eq(emailAccounts.id, numericId))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting email account:", error)
    return NextResponse.json({ error: "Failed to delete email account" }, { status: 500 })
  }
}
