import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { executiveDirector } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { auditLog } from "@/lib/audit-log"

export const dynamic = 'force-dynamic'

function verifySession(token: string): boolean {
  const secret = process.env.SESSION_SECRET
  if (!secret) return false
  
  const parts = token.split(".")
  if (parts.length !== 2) return false
  
  const [payload, signature] = parts
  const expectedSignature = createHmac("sha256", secret).update(payload).digest("hex")
  
  try {
    const sigBuffer = Buffer.from(signature, "hex")
    const expectedBuffer = Buffer.from(expectedSignature, "hex")
    if (sigBuffer.length !== expectedBuffer.length) return false
    return timingSafeEqual(sigBuffer, expectedBuffer)
  } catch {
    return false
  }
}

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("admin_session")?.value
  if (!sessionToken) return false
  return verifySession(sessionToken)
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await db.select().from(executiveDirector).where(eq(executiveDirector.isActive, true))
    return NextResponse.json(data[0] || null)
  } catch (error) {
    console.error("Error fetching executive director:", error)
    return NextResponse.json({ error: "Failed to fetch executive director" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, title, bio, photoUrl, linkedinUrl } = body

    if (!name || !bio) {
      return NextResponse.json({ error: "Name and bio are required" }, { status: 400 })
    }

    const existing = await db.select().from(executiveDirector)
    
    if (existing.length > 0) {
      const result = await db.update(executiveDirector)
        .set({
          name,
          title: title || "Executive Director",
          bio,
          photoUrl: photoUrl || null,
          linkedinUrl: linkedinUrl || null,
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(executiveDirector.id, existing[0].id))
        .returning()

      await auditLog({
        entityType: "executive_director",
        entityId: result[0].id,
        action: "update",
        details: `Updated Executive Director: ${name}`,
      })

      return NextResponse.json(result[0])
    } else {
      const result = await db.insert(executiveDirector).values({
        name,
        title: title || "Executive Director",
        bio,
        photoUrl: photoUrl || null,
        linkedinUrl: linkedinUrl || null,
        isActive: true
      }).returning()

      await auditLog({
        entityType: "executive_director",
        entityId: result[0].id,
        action: "create",
        details: `Created Executive Director: ${name}`,
      })

      return NextResponse.json(result[0])
    }
  } catch (error) {
    console.error("Error saving executive director:", error)
    return NextResponse.json({ error: "Failed to save executive director" }, { status: 500 })
  }
}

export async function DELETE() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const existing = await db.select().from(executiveDirector).where(eq(executiveDirector.isActive, true))
    
    if (existing.length > 0) {
      await db.update(executiveDirector)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(executiveDirector.id, existing[0].id))

      await auditLog({
        entityType: "executive_director",
        entityId: existing[0].id,
        action: "delete",
        details: `Disabled Executive Director: ${existing[0].name}`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error disabling executive director:", error)
    return NextResponse.json({ error: "Failed to disable executive director" }, { status: 500 })
  }
}
