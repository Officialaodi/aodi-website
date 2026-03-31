import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { adminUsers, roles } from "@/lib/schema"
import { eq, desc } from "drizzle-orm"
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

export async function GET() {
  const user = await verifyPermission("users.view")
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const users = await db
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
      .orderBy(desc(adminUsers.createdAt))

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const currentUser = await verifyPermission("users.manage")
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { email, password, fullName, roleId } = await request.json()

    if (!email || !password || !fullName || !roleId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const [existingUser] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email.toLowerCase()))

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    const [role] = await db.select().from(roles).where(eq(roles.id, roleId))
    if (!role) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const passwordHash = hashPassword(password)

    const [newUser] = await db
      .insert(adminUsers)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        roleId,
        isActive: true,
      })
      .returning()

    await auditLog({
      entityType: "user",
      entityId: newUser.id,
      action: "create",
      details: `Created user: ${fullName} (${email})`,
      metadata: { roleId },
    })

    return NextResponse.json({
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      roleId: newUser.roleId,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
