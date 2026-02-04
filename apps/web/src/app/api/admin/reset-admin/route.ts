import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { adminUsers } from "@/lib/schema"
import { hashPassword } from "@/lib/admin-auth"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const { masterPassword, email, newPassword } = await request.json()

    if (!masterPassword || !email || !newPassword) {
      return NextResponse.json(
        { error: "Master password, email, and new password are required" },
        { status: 400 }
      )
    }

    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return NextResponse.json(
        { error: "ADMIN_PASSWORD secret not configured" },
        { status: 500 }
      )
    }

    if (masterPassword !== adminPassword) {
      return NextResponse.json(
        { error: "Invalid master password" },
        { status: 401 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const existingUser = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1)
    
    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: "No admin user found with that email" },
        { status: 404 }
      )
    }

    const hashedPassword = await hashPassword(newPassword)
    
    await db
      .update(adminUsers)
      .set({ 
        passwordHash: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(adminUsers.email, email))

    return NextResponse.json({ 
      success: true, 
      message: "Admin password reset successfully"
    })
  } catch (error) {
    console.error("Admin reset error:", error)
    return NextResponse.json(
      { error: "Failed to reset admin password" },
      { status: 500 }
    )
  }
}
