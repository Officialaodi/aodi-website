import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { adminUsers } from "@/lib/schema"
import { createInitialSuperAdmin } from "@/lib/admin-auth"
import { sql } from "drizzle-orm"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await db.select({ count: sql<number>`count(*)` }).from(adminUsers)
    const hasUsers = result[0]?.count > 0
    
    return NextResponse.json({ 
      setupRequired: !hasUsers,
      message: hasUsers ? "Admin system already configured" : "Initial setup required"
    })
  } catch (error) {
    console.error("Setup check error:", error)
    return NextResponse.json({ error: "Failed to check setup status" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const result = await db.select({ count: sql<number>`count(*)` }).from(adminUsers)
    const hasUsers = result[0]?.count > 0
    
    if (hasUsers) {
      return NextResponse.json({ error: "Setup already completed" }, { status: 400 })
    }

    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, password, and full name are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const user = await createInitialSuperAdmin(email, password, fullName)

    return NextResponse.json({ 
      success: true, 
      message: "Super Admin account created successfully",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName
      }
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Failed to complete setup" }, { status: 500 })
  }
}
