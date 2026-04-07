import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"
import { 
  getUserByEmail, 
  verifyPassword, 
  createSignedToken, 
  updateLastLogin,
  getUserWithPermissions,
  type SessionPayload 
} from "@/lib/admin-auth"
import { auditLogWithUser } from "@/lib/audit-log"

export const dynamic = 'force-dynamic'

async function verifyCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.HCAPTCHA_SECRET_KEY
  if (!secretKey) return true

  try {
    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `response=${token}&secret=${secretKey}`,
    })
    const data = await response.json()
    return data.success === true
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const { email, password, captchaToken } = await request.json()
    
    const sessionSecret = process.env.SESSION_SECRET
    
    if (!sessionSecret) {
      return NextResponse.json({ error: "Admin access not configured" }, { status: 500 })
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (process.env.HCAPTCHA_SECRET_KEY) {
      if (!captchaToken) {
        return NextResponse.json({ error: "Captcha verification required" }, { status: 400 })
      }
      const isValidCaptcha = await verifyCaptcha(captchaToken)
      if (!isValidCaptcha) {
        return NextResponse.json({ error: "Captcha verification failed" }, { status: 400 })
      }
    }

    const user = await getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 401 })
    }

    const isValidPassword = verifyPassword(password, user.passwordHash)
    
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const payload: SessionPayload = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      sid: crypto.randomBytes(16).toString("hex"),
      exp: Date.now() + (24 * 60 * 60 * 1000),
      iat: Date.now(),
    }

    const signedToken = createSignedToken(payload, sessionSecret)
    
    const cookieStore = await cookies()
    cookieStore.set("admin_session", signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/"
    })

    await updateLastLogin(user.id)

    await auditLogWithUser(
      {
        entityType: "session",
        action: "login",
        details: `User logged in: ${user.email}`,
      },
      { id: user.id, email: user.email, name: user.fullName }
    )

    const userWithPermissions = await getUserWithPermissions(user.id)

    return NextResponse.json({ 
      success: true,
      user: userWithPermissions
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
