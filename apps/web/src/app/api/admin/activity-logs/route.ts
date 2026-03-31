import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { activityLogs, adminUsers } from "@/lib/schema"
import { desc, eq, and, gte, lte, count, sql } from "drizzle-orm"
import { cookies } from "next/headers"
import { verifySignedToken, getUserWithPermissions } from "@/lib/admin-auth"

 export const runtime = 'edge';

async function verifyPermission(requiredPermission: string) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return null

  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  if (!adminSession) return null

  const payload = verifySignedToken(adminSession.value, sessionSecret)
  if (!payload) return null

  const user = await getUserWithPermissions(payload.userId)
  if (!user) return null

  if (!user.permissions.includes(requiredPermission)) return null

  return user
}

const MAX_LIMIT = 200

export async function GET(request: NextRequest) {
  const user = await verifyPermission("users.view")
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const view = searchParams.get("view") || "logs"
  const entityType = searchParams.get("entityType")
  const entityId = searchParams.get("entityId")
  const action = searchParams.get("action")
  const userId = searchParams.get("userId")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const requestedLimit = parseInt(searchParams.get("limit") || "100")
  const limit = Math.min(Math.max(1, requestedLimit), MAX_LIMIT)
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"))

  try {
    switch (view) {
      case "stats": {
        const now = new Date()
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const [total, last24hCount, last7dCount, last30dCount] = await Promise.all([
          db.select({ count: count() }).from(activityLogs),
          db.select({ count: count() }).from(activityLogs).where(gte(activityLogs.createdAt, last24h)),
          db.select({ count: count() }).from(activityLogs).where(gte(activityLogs.createdAt, last7d)),
          db.select({ count: count() }).from(activityLogs).where(gte(activityLogs.createdAt, last30d)),
        ])

        return NextResponse.json({
          total: total[0]?.count || 0,
          last24h: last24hCount[0]?.count || 0,
          last7d: last7dCount[0]?.count || 0,
          last30d: last30dCount[0]?.count || 0,
        })
      }

      case "by-entity": {
        const data = await db
          .select({
            entityType: activityLogs.entityType,
            count: count(),
          })
          .from(activityLogs)
          .groupBy(activityLogs.entityType)
          .orderBy(desc(count()))
          .limit(20)

        return NextResponse.json(data)
      }

      case "by-action": {
        const data = await db
          .select({
            action: activityLogs.action,
            count: count(),
          })
          .from(activityLogs)
          .groupBy(activityLogs.action)
          .orderBy(desc(count()))
          .limit(20)

        return NextResponse.json(data)
      }

      case "by-user": {
        const data = await db
          .select({
            userId: activityLogs.userId,
            userEmail: activityLogs.userEmail,
            performedBy: activityLogs.performedBy,
            count: count(),
          })
          .from(activityLogs)
          .where(sql`${activityLogs.userId} IS NOT NULL`)
          .groupBy(activityLogs.userId, activityLogs.userEmail, activityLogs.performedBy)
          .orderBy(desc(count()))
          .limit(50)

        return NextResponse.json(data)
      }

      case "users": {
        const users = await db
          .select({
            id: adminUsers.id,
            email: adminUsers.email,
            fullName: adminUsers.fullName,
          })
          .from(adminUsers)
          .orderBy(adminUsers.fullName)
          .limit(100)

        return NextResponse.json(users)
      }

      default: {
        const conditions = []

        if (entityType && entityType !== "all") {
          conditions.push(eq(activityLogs.entityType, entityType))
        }
        if (entityId) {
          const parsedId = parseInt(entityId)
          if (!isNaN(parsedId)) {
            conditions.push(eq(activityLogs.entityId, parsedId))
          }
        }
        if (action && action !== "all") {
          conditions.push(eq(activityLogs.action, action))
        }
        if (userId && userId !== "all") {
          const parsedUserId = parseInt(userId)
          if (!isNaN(parsedUserId)) {
            conditions.push(eq(activityLogs.userId, parsedUserId))
          }
        }
        if (startDate) {
          const start = new Date(startDate)
          if (!isNaN(start.getTime())) {
            conditions.push(gte(activityLogs.createdAt, start))
          }
        }
        if (endDate) {
          const end = new Date(endDate)
          if (!isNaN(end.getTime())) {
            end.setHours(23, 59, 59, 999)
            conditions.push(lte(activityLogs.createdAt, end))
          }
        }

        const [logs, totalCount] = await Promise.all([
          db
            .select()
            .from(activityLogs)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(activityLogs.createdAt))
            .limit(limit)
            .offset(offset),
          db
            .select({ count: count() })
            .from(activityLogs)
            .where(conditions.length > 0 ? and(...conditions) : undefined),
        ])

        return NextResponse.json({
          logs,
          total: totalCount[0]?.count || 0,
          limit,
          offset,
        })
      }
    }
  } catch (error) {
    console.error("Error fetching activity logs:", error)
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await verifyPermission("users.manage")
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { entityType, entityId, action, details, performedBy } = await request.json()

    if (!entityType || !action) {
      return NextResponse.json({ error: "Entity type and action required" }, { status: 400 })
    }

    const [log] = await db
      .insert(activityLogs)
      .values({
        entityType,
        entityId: entityId || null,
        action,
        details,
        performedBy: performedBy || "Admin",
      })
      .returning()

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error("Error creating activity log:", error)
    return NextResponse.json({ error: "Failed to create activity log" }, { status: 500 })
  }
}
