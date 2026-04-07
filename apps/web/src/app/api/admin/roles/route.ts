import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { roles, rolePermissions, permissions } from "@/lib/schema"
import { eq, desc } from "drizzle-orm"
import { verifySignedToken, getUserWithPermissions } from "@/lib/admin-auth"
import { auditLog } from "@/lib/audit-log"

export const dynamic = 'force-dynamic'

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
    const allRoles = await db
      .select()
      .from(roles)
      .orderBy(desc(roles.isSystemRole), roles.name)

    const rolesWithPermissions = await Promise.all(
      allRoles.map(async (role) => {
        const perms = await db
          .select({ permissionKey: rolePermissions.permissionKey })
          .from(rolePermissions)
          .where(eq(rolePermissions.roleId, role.id))
        
        return {
          ...role,
          permissions: perms.map(p => p.permissionKey),
        }
      })
    )

    return NextResponse.json(rolesWithPermissions)
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await verifyPermission("roles.manage")
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, description, permissions: permissionKeys } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 })
    }

    const [existingRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.name, name))

    if (existingRole) {
      return NextResponse.json({ error: "Role with this name already exists" }, { status: 400 })
    }

    const [newRole] = await db
      .insert(roles)
      .values({
        name,
        description,
        isSystemRole: false,
      })
      .returning()

    if (permissionKeys && permissionKeys.length > 0) {
      await db.insert(rolePermissions).values(
        permissionKeys.map((key: string) => ({
          roleId: newRole.id,
          permissionKey: key,
        }))
      )
    }

    await auditLog({
      entityType: "role",
      entityId: newRole.id,
      action: "create",
      details: `Created role: ${name}`,
      metadata: { permissions: permissionKeys || [] },
    })

    return NextResponse.json({
      ...newRole,
      permissions: permissionKeys || [],
    })
  } catch (error) {
    console.error("Error creating role:", error)
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 })
  }
}
