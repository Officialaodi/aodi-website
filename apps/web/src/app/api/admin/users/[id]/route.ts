import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { adminUsers, roles } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { verifySignedToken, getUserWithPermissions, hashPassword } from "@/lib/admin-auth"
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
  const user = await verifyPermission("users.view")
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const numericId = parseInt(id)

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
  }

  try {
    const [targetUser] = await db
      .select({
        id: adminUsers.id,
        email: adminUsers.email,
        fullName: adminUsers.fullName,
        roleId: adminUsers.roleId,
        roleName: roles.name,
        isActive: adminUsers.isActive,
        lastLoginAt: adminUsers.lastLoginAt,
        createdAt: adminUsers.createdAt,
      })
      .from(adminUsers)
      .leftJoin(roles, eq(adminUsers.roleId, roles.id))
      .where(eq(adminUsers.id, numericId))

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(targetUser)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await verifyPermission("users.manage")
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const numericId = parseInt(id)

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { fullName, roleId, isActive, password } = body

    const [existingUser] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, numericId))

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (currentUser.id === numericId && isActive === false) {
      return NextResponse.json({ error: "Cannot deactivate your own account" }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (fullName !== undefined) updateData.fullName = fullName
    if (roleId !== undefined) {
      const [role] = await db.select().from(roles).where(eq(roles.id, roleId))
      if (!role) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 })
      }
      updateData.roleId = roleId
    }
    if (isActive !== undefined) updateData.isActive = isActive
    if (password) {
      if (password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
      }
      updateData.passwordHash = hashPassword(password)
    }

    const [updatedUser] = await db
      .update(adminUsers)
      .set(updateData)
      .where(eq(adminUsers.id, numericId))
      .returning()

    await auditLog({
      entityType: "user",
      entityId: numericId,
      action: "update",
      details: `Updated user: ${updatedUser.fullName} (${updatedUser.email})`,
      metadata: { updatedFields: Object.keys(body).filter(k => k !== 'password') },
    })

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      roleId: updatedUser.roleId,
      isActive: updatedUser.isActive,
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await verifyPermission("users.delete")
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const numericId = parseInt(id)

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
  }

  if (currentUser.id === numericId) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
  }

  try {
    const [deletedUser] = await db.delete(adminUsers).where(eq(adminUsers.id, numericId)).returning()
    
    await auditLog({
      entityType: "user",
      entityId: numericId,
      action: "delete",
      details: `Deleted user: ${deletedUser?.fullName || 'Unknown'} (${deletedUser?.email || 'Unknown'})`,
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
