import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { adminUsers, passwordResetTokens } from "@/lib/schema"
import { eq, and, isNull, gt } from "drizzle-orm"
import { hashPassword } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    const passwordHash = hashPassword(password)

    await db
      .update(adminUsers)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(adminUsers.id, resetToken.userId))

    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, resetToken.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
