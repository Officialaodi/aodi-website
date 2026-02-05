import crypto from "crypto"
import { db } from "./db"
import { adminUsers, roles, rolePermissions, permissions } from "./schema"
import { eq } from "drizzle-orm"

export interface SessionPayload {
  userId: number
  email: string
  roleId: number
  sid: string
  exp: number
  iat: number
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":")
  if (!salt || !hash) return false
  const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex")
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(verifyHash, "hex"))
}

export function createSignedToken(payload: SessionPayload, sessionSecret: string): string {
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64")
  const signature = crypto.createHmac("sha256", sessionSecret).update(payloadStr).digest("hex")
  return `${payloadStr}.${signature}`
}

export function verifySignedToken(token: string, sessionSecret: string): SessionPayload | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 2) return null
    
    const [payloadStr, signature] = parts
    const expectedSignature = crypto.createHmac("sha256", sessionSecret).update(payloadStr).digest("hex")
    
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    )
    
    if (!isValid) return null
    
    const payload = JSON.parse(Buffer.from(payloadStr, "base64").toString()) as SessionPayload
    
    if (payload.exp < Date.now()) return null
    
    return payload
  } catch {
    return null
  }
}

export async function getUserWithPermissions(userId: number) {
  const [user] = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      fullName: adminUsers.fullName,
      roleId: adminUsers.roleId,
      isActive: adminUsers.isActive,
      roleName: roles.name,
      isSystemRole: roles.isSystemRole,
    })
    .from(adminUsers)
    .leftJoin(roles, eq(adminUsers.roleId, roles.id))
    .where(eq(adminUsers.id, userId))

  if (!user || !user.isActive) return null

  const userPermissions = await db
    .select({ permissionKey: rolePermissions.permissionKey })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, user.roleId))

  return {
    ...user,
    permissions: userPermissions.map(p => p.permissionKey),
  }
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase()))
  return user
}

const DEFAULT_PERMISSIONS = [
  { key: "applications.view", name: "View Applications", category: "Applications", description: "View all applications" },
  { key: "applications.manage", name: "Manage Applications", category: "Applications", description: "Update application status and details" },
  { key: "applications.delete", name: "Delete Applications", category: "Applications", description: "Delete applications" },
  { key: "crm.view", name: "View CRM", category: "CRM", description: "Access CRM contacts and data" },
  { key: "crm.manage", name: "Manage CRM", category: "CRM", description: "Edit contacts and send emails" },
  { key: "content.view", name: "View Content", category: "Content", description: "View all website content" },
  { key: "content.manage", name: "Manage Content", category: "Content", description: "Edit website content" },
  { key: "governance.view", name: "View Governance", category: "Governance", description: "View governance information" },
  { key: "governance.manage", name: "Manage Governance", category: "Governance", description: "Edit governance content" },
  { key: "impact.view", name: "View Impact", category: "Impact", description: "View impact metrics" },
  { key: "impact.manage", name: "Manage Impact", category: "Impact", description: "Edit impact metrics" },
  { key: "users.view", name: "View Users", category: "User Management", description: "View admin users" },
  { key: "users.manage", name: "Manage Users", category: "User Management", description: "Create and edit admin users" },
  { key: "users.delete", name: "Delete Users", category: "User Management", description: "Delete admin users" },
  { key: "roles.view", name: "View Roles", category: "User Management", description: "View roles and permissions" },
  { key: "roles.manage", name: "Manage Roles", category: "User Management", description: "Create and edit roles" },
  { key: "analytics.view", name: "View Analytics", category: "Analytics", description: "View website analytics" },
  { key: "settings.view", name: "View Settings", category: "Settings", description: "View system settings" },
  { key: "settings.manage", name: "Manage Settings", category: "Settings", description: "Edit system settings" },
  { key: "forms.view", name: "View Forms", category: "Forms", description: "View form configurations" },
  { key: "forms.manage", name: "Manage Forms", category: "Forms", description: "Create and edit forms" },
  { key: "events.view", name: "View Events", category: "Events", description: "View events" },
  { key: "events.manage", name: "Manage Events", category: "Events", description: "Create and edit events" },
]

async function ensureRolesAndPermissions(): Promise<number> {
  const existingPermissions = await db.select({ key: permissions.key }).from(permissions)
  const existingKeys = new Set(existingPermissions.map(p => p.key))
  
  const newPermissions = DEFAULT_PERMISSIONS.filter(p => !existingKeys.has(p.key))
  if (newPermissions.length > 0) {
    await db.insert(permissions).values(newPermissions)
  }

  let [superAdminRole] = await db
    .select()
    .from(roles)
    .where(eq(roles.name, "Super Admin"))

  if (!superAdminRole) {
    const [newRole] = await db
      .insert(roles)
      .values({
        name: "Super Admin",
        description: "Full system access with all permissions",
        isSystemRole: true,
      })
      .returning()
    superAdminRole = newRole
  }

  const allPermissions = await db.select({ key: permissions.key }).from(permissions)
  const existingRolePerms = await db
    .select({ permissionKey: rolePermissions.permissionKey })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, superAdminRole.id))
  
  const existingRolePermKeys = new Set(existingRolePerms.map(p => p.permissionKey))
  const newRolePerms = allPermissions
    .filter(p => !existingRolePermKeys.has(p.key))
    .map(p => ({ roleId: superAdminRole.id, permissionKey: p.key }))
  
  if (newRolePerms.length > 0) {
    await db.insert(rolePermissions).values(newRolePerms)
  }

  return superAdminRole.id
}

export async function createInitialSuperAdmin(email: string, password: string, fullName: string) {
  const superAdminRoleId = await ensureRolesAndPermissions()

  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    throw new Error("User with this email already exists")
  }

  const passwordHash = hashPassword(password)
  
  const [newUser] = await db
    .insert(adminUsers)
    .values({
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      roleId: superAdminRoleId,
      isActive: true,
    })
    .returning()

  return newUser
}

export async function updateLastLogin(userId: number) {
  await db
    .update(adminUsers)
    .set({ lastLoginAt: new Date() })
    .where(eq(adminUsers.id, userId))
}
