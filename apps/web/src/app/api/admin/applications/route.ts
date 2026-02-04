import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { applications } from "@/lib/schema"
import { desc, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import crypto from "crypto"

function verifySignedToken(token: string, sessionSecret: string): boolean {
  const parts = token.split(".")
  if (parts.length !== 2) return false
  
  const [sessionId, signature] = parts
  const expectedSignature = crypto.createHmac("sha256", sessionSecret).update(sessionId).digest("hex")
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    )
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")
  
  if (!adminSession || !verifySignedToken(adminSession.value, sessionSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  try {
    let results
    
    if (type && type !== "all") {
      results = await db.select().from(applications).where(eq(applications.type, type)).orderBy(desc(applications.createdAt))
    } else {
      results = await db.select().from(applications).orderBy(desc(applications.createdAt))
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}
