import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/db"
import { adminUsers, passwordResetTokens } from "@/lib/schema"
import { eq } from "drizzle-orm"

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

export async function POST(request: NextRequest) {
  try {
    const { email, captchaToken } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
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

    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email.toLowerCase()))

    if (!user) {
      return NextResponse.json({ success: true })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/admin/reset-password?token=${token}`

    // TODO: Send email with reset link using SendGrid when configured
    // For now, we just store the token - the user can implement email sending
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV ONLY] Password reset URL: ${resetUrl}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in forgot password:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
