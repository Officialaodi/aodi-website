import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { events } from "@/lib/schema"
import { eq, desc } from "drizzle-orm"

export async function GET() {
  try {
    const eventsList = await db
      .select()
      .from(events)
      .where(eq(events.isActive, true))
      .orderBy(desc(events.startDate))
    
    return NextResponse.json(eventsList)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}
