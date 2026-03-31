import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { roles, rolePermissions, adminUsers } from "@/lib/schema"
import { eq, sql } from "drizzle-orm"
import { verifySignedToken, getUserWithPermissions } from "@/lib/admin-auth"
import { auditLog } from "@/lib/audit-log"

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyPermission("roles.view")
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const numericId = parseInt(id)

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid role ID" }, { status: 400 })
  }

  try {
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, numericId))

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    const perms = await db
      .select({ permissionKey: rolePermissions.permissionKey })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, role.id))

    return NextResponse.json({
      ...role,
      permissions: perms.map(p => p.permissionKey),
    })
  } catch (error) {
    console.error("Error fetching role:", error)
    return NextResponse.json({ error: "Failed to fetch role" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyPermission("roles.manage")
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const numericId = parseInt(id)

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid role ID" }, { status: 400 })
  }

  try {
    const [existingRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, numericId))

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    if (existingRole.isSystemRole) {
      return NextResponse.json({ error: "Cannot modify system role" }, { status: 400 })
    }

    const { name, description, permissions: permissionKeys } = await request.json()

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description

    const [updatedRole] = await db
      .update(roles)
      .set(updateData)
      .where(eq(roles.id, numericId))
      .returning()

    if (permissionKeys !== undefined) {
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, numericId))
      
      if (permissionKeys.length > 0) {
        await db.insert(rolePermissions).values(
          permissionKeys.map((key: string) => ({
            roleId: numericId,
            permissionKey: key,
          }))
        )
      }
    }

    const perms = await db
      .select({ permissionKey: rolePermissions.permissionKey })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, numericId))

    const fieldsObj: Record<string, unknown> = { name, description, permissions: permissionKeys }
    const updatedFields = Object.keys(fieldsObj).filter(k => fieldsObj[k] !== undefined)
    await auditLog({
      entityType: "role",
      entityId: numericId,
      action: "update",
      details: `Updated role: ${updatedRole.name}`,
      metadata: { updatedFields },
    })

    return NextResponse.json({
      ...updatedRole,
      permissions: perms.map(p => p.permissionKey),
    })
  } catch (error) {
    console.error("Error updating role:", error)
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyPermission("roles.manage")
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const numericId = parseInt(id)

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid role ID" }, { status: 400 })
  }

  try {
    const [existingRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, numericId))

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 })
    }

    if (existingRole.isSystemRole) {
      return NextResponse.json({ error: "Cannot delete system role" }, { status: 400 })
    }

    const usersWithRole = await db
      .select({ count: sql<number>`count(*)` })
      .from(adminUsers)
      .where(eq(adminUsers.roleId, numericId))

    if (usersWithRole[0]?.count > 0) {
      return NextResponse.json({ error: "Cannot delete role that is assigned to users" }, { status: 400 })
    }

    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, numericId))
    await db.delete(roles).where(eq(roles.id, numericId))

    await auditLog({
      entityType: "role",
      entityId: numericId,
      action: "delete",
      details: `Deleted role: ${existingRole.name}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting role:", error)
    return NextResponse.json({ error: "Failed to delete role" }, { status: 500 })
  }
}
