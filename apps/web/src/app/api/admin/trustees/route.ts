import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { trustees } from "@/lib/schema"
import { asc } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { auditLog } from "@/lib/audit-log"

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
    const data = await db.select().from(trustees).orderBy(asc(trustees.displayOrder))
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching trustees:", error)
    return NextResponse.json({ error: "Failed to fetch trustees" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, role, bio, photoUrl, linkedinUrl, displayOrder } = body

    if (!name || !role || !bio) {
      return NextResponse.json({ error: "Name, role, and bio are required" }, { status: 400 })
    }

    const result = await db.insert(trustees).values({
      name,
      role,
      bio,
      photoUrl: photoUrl || null,
      linkedinUrl: linkedinUrl || null,
      displayOrder: displayOrder || 0,
      isActive: true
    }).returning()

    await auditLog({
      entityType: "trustee",
      entityId: result[0].id,
      action: "create",
      details: `Created trustee: ${name}`,
      metadata: { role },
    })

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating trustee:", error)
    return NextResponse.json({ error: "Failed to create trustee" }, { status: 500 })
  }
}
