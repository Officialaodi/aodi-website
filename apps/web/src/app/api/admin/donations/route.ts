import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { donations } from "@/lib/schema"
import { desc, eq, sql } from "drizzle-orm"
import { cookies } from "next/headers"
import crypto from "crypto"

function verifySignedToken(token: string, sessionSecret: string): boolean {
  const parts = token.split(".")
  if (parts.length !== 2) return false
  const [sessionId, signature] = parts
  const expectedSignature = crypto.createHmac("sha256", sessionSecret).update(sessionId).digest("hex")
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
  } catch { return false }
}

export async function GET(request: NextRequest) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  if (!adminSession || !verifySignedToken(adminSession.value, sessionSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const limit = parseInt(searchParams.get("limit") || "100")

  try {
    let query = db.select().from(donations)

    if (status) {
      query = query.where(eq(donations.status, status)) as typeof query
    }

    const donationsList = await query.orderBy(desc(donations.createdAt)).limit(limit)

    const stats = await db
      .select({
        total: sql<number>`count(*)`,
        totalAmount: sql<string>`sum(cast(${donations.amount} as numeric))`,
      })
      .from(donations)
      .where(eq(donations.status, "completed"))

    return NextResponse.json({
      donations: donationsList,
      stats: stats[0],
    })
  } catch (error) {
    console.error("Error fetching donations:", error)
    return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 })
  }
}
