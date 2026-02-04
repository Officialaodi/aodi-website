import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { stories } from "@/lib/schema"
import { eq, desc } from "drizzle-orm"

export async function GET() {
  try {
    const data = await db
      .select()
      .from(stories)
      .where(eq(stories.isActive, true))
      .orderBy(desc(stories.publishDate))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching stories:", error)
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 })
  }
}
