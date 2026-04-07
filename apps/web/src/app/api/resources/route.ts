import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { resources } from "@/lib/schema"
import { eq, asc } from "drizzle-orm"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await db
      .select()
      .from(resources)
      .where(eq(resources.isActive, true))
      .orderBy(asc(resources.displayOrder))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching resources:", error)
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 })
  }
}
