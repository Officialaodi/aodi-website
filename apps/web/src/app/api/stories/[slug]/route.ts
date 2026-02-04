import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { stories } from "@/lib/schema"
import { eq, and } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const story = await db
      .select()
      .from(stories)
      .where(and(eq(stories.slug, slug), eq(stories.isActive, true)))
      .limit(1)

    if (story.length === 0) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    return NextResponse.json(story[0])
  } catch (error) {
    console.error("Error fetching story:", error)
    return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 })
  }
}
