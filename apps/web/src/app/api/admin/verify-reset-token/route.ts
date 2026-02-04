import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { passwordResetTokens } from "@/lib/schema"
import { eq, and, isNull, gt } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
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

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Error verifying reset token:", error)
    return NextResponse.json({ error: "Failed to verify token" }, { status: 500 })
  }
}
