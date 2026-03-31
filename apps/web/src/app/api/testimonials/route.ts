import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { testimonials } from "@/lib/schema"
import { eq, asc } from "drizzle-orm"

 export const runtime = 'edge';

export async function GET() {
  try {
    const data = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.isActive, true))
      .orderBy(asc(testimonials.displayOrder))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 })
  }
}
