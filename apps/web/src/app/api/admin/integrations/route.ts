import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { integrationSettings } from "@/lib/schema"
import { eq } from "drizzle-orm"
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

function checkSecretConfigured(secretsRequired: string | null): boolean {
  if (!secretsRequired) return true
  const secrets = secretsRequired.split(",").map(s => s.trim())
  return secrets.every(secret => {
    const value = process.env[secret]
    return value && value.length > 0
  })
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const settings = await db.select().from(integrationSettings)
    
    const settingsWithStatus = settings.map(setting => ({
      ...setting,
      secretsConfigured: checkSecretConfigured(setting.secretsRequired)
    }))

    return NextResponse.json(settingsWithStatus)
  } catch (error) {
    console.error("Error fetching integration settings:", error)
    return NextResponse.json({ error: "Failed to fetch integration settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { integrationKey, isEnabled, configValue } = body

    if (!integrationKey) {
      return NextResponse.json({ error: "Integration key is required" }, { status: 400 })
    }

    if (isEnabled === true) {
      const existing = await db.select()
        .from(integrationSettings)
        .where(eq(integrationSettings.integrationKey, integrationKey))
      
      if (existing.length > 0 && !checkSecretConfigured(existing[0].secretsRequired)) {
        return NextResponse.json({ 
          error: "Cannot enable integration: required secrets are not configured" 
        }, { status: 400 })
      }
    }

    const updateData: { isEnabled?: boolean; configValue?: string; updatedAt: Date } = {
      updatedAt: new Date()
    }

    if (typeof isEnabled === "boolean") {
      updateData.isEnabled = isEnabled
    }

    if (configValue !== undefined) {
      updateData.configValue = configValue
    }

    const result = await db.update(integrationSettings)
      .set(updateData)
      .where(eq(integrationSettings.integrationKey, integrationKey))
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 })
    }

    await auditLog({
      entityType: "integration_settings",
      entityId: result[0].id,
      action: "update",
      details: `Updated integration: ${result[0].displayName} (enabled: ${result[0].isEnabled})`,
    })

    return NextResponse.json({
      ...result[0],
      secretsConfigured: checkSecretConfigured(result[0].secretsRequired)
    })
  } catch (error) {
    console.error("Error updating integration settings:", error)
    return NextResponse.json({ error: "Failed to update integration settings" }, { status: 500 })
  }
}
