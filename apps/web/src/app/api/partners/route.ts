import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { partners } from "@/lib/schema"
import { eq, asc } from "drizzle-orm"

 export const runtime = 'edge';

export async function GET() {
  try {
    const data = await db
      .select()
      .from(partners)
      .where(eq(partners.isActive, true))
      .orderBy(asc(partners.displayOrder))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching partners:", error)
    return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 })
  }
}
