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

export async function createInitialSuperAdmin(email: string, password: string, fullName: string) {
  const [superAdminRole] = await db
    .select()
    .from(roles)
    .where(eq(roles.name, "Super Admin"))

  if (!superAdminRole) {
    throw new Error("Super Admin role not found. Please run database seed first.")
  }

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
      roleId: superAdminRole.id,
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
