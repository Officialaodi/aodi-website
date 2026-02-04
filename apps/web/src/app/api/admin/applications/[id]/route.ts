import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { applications } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import crypto from "crypto"

function verifySignedToken(token: string, sessionSecret: string): boolean {
  const parts = token.split(".")
  if (parts.length !== 2) return false
  
  const [sessionId, signature] = parts
  const expectedSignature = crypto.createHmac("sha256", sessionSecret).update(sessionId).digest("hex")
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    )
  } catch {
    return false
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  
  if (!adminSession || !verifySignedToken(adminSession.value, sessionSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const appId = parseInt(id, 10)
  
  if (isNaN(appId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { status } = body
    
    if (!status || !["new", "in_review", "contacted", "accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    await db.update(applications).set({ status }).where(eq(applications.id, appId))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  
  if (!adminSession || !verifySignedToken(adminSession.value, sessionSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const appId = parseInt(id, 10)
  
  if (isNaN(appId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }

  try {
    const results = await db.select().from(applications).where(eq(applications.id, appId))
    
    if (results.length === 0) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json(results[0])
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 })
  }
}
