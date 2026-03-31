import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { trustees, governanceContent, executiveDirector } from "@/lib/schema"
import { eq, asc } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { auditLog } from "@/lib/audit-log"

 export const runtime = 'edge';

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
    const [trusteesData, contentData, execDirectorData] = await Promise.all([
      db.select().from(trustees).orderBy(asc(trustees.displayOrder)),
      db.select().from(governanceContent),
      db.select().from(executiveDirector).where(eq(executiveDirector.isActive, true))
    ])

    const contentMap: Record<string, string> = {}
    contentData.forEach(item => {
      contentMap[item.key] = item.value
    })

    return NextResponse.json({
      trustees: trusteesData,
      content: contentMap,
      executiveDirector: execDirectorData[0] || null
    })
  } catch (error) {
    console.error("Error fetching governance data:", error)
    return NextResponse.json({ error: "Failed to fetch governance data" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 })
    }

    const existing = await db.select().from(governanceContent).where(eq(governanceContent.key, key))
    
    if (existing.length > 0) {
      await db.update(governanceContent)
        .set({ value, updatedAt: new Date() })
        .where(eq(governanceContent.key, key))
    } else {
      await db.insert(governanceContent).values({ key, value })
    }

    await auditLog({
      entityType: "governance",
      entityId: null,
      action: "update",
      details: `Updated governance content: ${key}`,
      metadata: { key },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating governance content:", error)
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 })
  }
}
