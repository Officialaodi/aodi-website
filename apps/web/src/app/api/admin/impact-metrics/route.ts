import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { impactMetrics } from "@/lib/schema"
import { asc, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { timingSafeEqual, createHmac } from "crypto"
import { auditLog } from "@/lib/audit-log"

async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("admin_session")?.value
  if (!sessionToken) return false

  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return false

  try {
    const [payload, signature] = sessionToken.split(".")
    if (!payload || !signature) return false

    const expectedSignature = createHmac("sha256", sessionSecret)
      .update(payload)
      .digest("hex")

    const sigBuffer = Buffer.from(signature, "hex")
    const expectedBuffer = Buffer.from(expectedSignature, "hex")

    if (sigBuffer.length !== expectedBuffer.length) return false
    return timingSafeEqual(sigBuffer, expectedBuffer)
  } catch {
    return false
  }
}

export async function GET() {
  if (!await verifySession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const metrics = await db
      .select()
      .from(impactMetrics)
      .orderBy(asc(impactMetrics.displayOrder))

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error("Error fetching impact metrics:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!await verifySession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { category, label, value, unit, period, description, displayOrder, isActive, showOnHomepage } = body

    const [newMetric] = await db
      .insert(impactMetrics)
      .values({
        category,
        label,
        value,
        unit: unit || null,
        period: period || "Since inception",
        description: description || null,
        displayOrder: displayOrder || 0,
        isActive: isActive ?? true,
        showOnHomepage: showOnHomepage ?? false,
      })
      .returning()

    await auditLog({
      entityType: "impact_metric",
      entityId: newMetric.id,
      action: "create",
      details: `Created impact metric: ${label}`,
      metadata: { category, value },
    })

    return NextResponse.json({ metric: newMetric })
  } catch (error) {
    console.error("Error creating impact metric:", error)
    return NextResponse.json({ error: "Failed to create metric" }, { status: 500 })
  }
}
