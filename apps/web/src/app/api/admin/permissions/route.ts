import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { permissions } from "@/lib/schema"
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

export async function GET() {
  const user = await verifyPermission("roles.view")
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const allPermissions = await db
      .select()
      .from(permissions)
      .orderBy(permissions.category, permissions.name)

    const grouped = allPermissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = []
      }
      acc[perm.category].push(perm)
      return acc
    }, {} as Record<string, typeof allPermissions>)

    return NextResponse.json({
      permissions: allPermissions,
      grouped,
    })
  } catch (error) {
    console.error("Error fetching permissions:", error)
    return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 })
  }
}
