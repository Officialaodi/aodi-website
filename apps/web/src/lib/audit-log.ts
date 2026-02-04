import { db } from "@/lib/db"
import { activityLogs, adminUsers } from "@/lib/schema"
import { cookies } from "next/headers"
import crypto from "crypto"
import { eq } from "drizzle-orm"

export type AuditAction =
  | "login"
  | "logout"
  | "create"
  | "update"
  | "delete"
  | "view"
  | "export"
  | "send_email"
  | "status_change"
  | "bulk_action"

export type EntityType =
  | "user"
  | "role"
  | "program"
  | "event"
  | "partner"
  | "testimonial"
  | "story"
  | "resource"
  | "trustee"
  | "governance"
  | "impact_metric"
  | "site_setting"
  | "application"
  | "contact"
  | "email_account"
  | "email_template"
  | "donation"
  | "session"
  | "form"
  | "form_field"
  | "executive_director"
  | "integration_settings"

interface AuditLogParams {
  entityType: EntityType
  entityId?: number | null
  action: AuditAction
  details?: string
  metadata?: Record<string, unknown>
}

interface CurrentUser {
  id: number
  email: string
  name: string
}

async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const sessionSecret = process.env.SESSION_SECRET
    if (!sessionSecret) return null

    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin_session")
    if (!adminSession) return null

    const parts = adminSession.value.split(".")
    if (parts.length !== 2) return null
    const [sessionId, signature] = parts

    const expectedSignature = crypto.createHmac("sha256", sessionSecret).update(sessionId).digest("hex")
    try {
      const isValid = crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
      if (!isValid) return null
    } catch {
      return null
    }

    const userId = parseInt(sessionId.split("-")[0])
    if (isNaN(userId)) return null

    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, userId)).limit(1)
    if (!user) return null

    return { id: user.id, email: user.email, name: user.fullName }
  } catch {
    return null
  }
}

export async function auditLog(params: AuditLogParams): Promise<void> {
  try {
    const currentUser = await getCurrentUser()

    await db.insert(activityLogs).values({
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      action: params.action,
      details: params.details,
      performedBy: currentUser?.name || "System",
      userId: currentUser?.id ?? null,
      userEmail: currentUser?.email ?? null,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    })
  } catch (error) {
    console.error("Failed to create audit log:", error)
  }
}

export async function auditLogWithUser(
  params: AuditLogParams,
  user: { id: number; email: string; name: string }
): Promise<void> {
  try {
    await db.insert(activityLogs).values({
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      action: params.action,
      details: params.details,
      performedBy: user.name,
      userId: user.id,
      userEmail: user.email,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    })
  } catch (error) {
    console.error("Failed to create audit log:", error)
  }
}
